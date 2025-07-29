import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { z } from 'zod';
import { UserRole } from '@prisma/client';

// Validation schemas
const eventCreateSchema = z.object({
  title: z.string().min(3).max(100),
  description: z.string().min(10),
  content: z.string().min(10),
  startDate: z.string().datetime(),
  endDate: z.string().datetime(),
  registrationDeadline: z.string().datetime(),
  location: z.string().min(3),
  maxAttendees: z.number().int().positive().optional(),
  isPublic: z.boolean().default(true),
  isFeatured: z.boolean().default(false),
  categoryId: z.number().int().positive().optional(),
  tags: z.array(z.string()).optional(),
});

const eventUpdateSchema = eventCreateSchema.partial();

// Helper function to format event response
const formatEventResponse = (event: any) => ({
  id: event.id,
  title: event.title,
  description: event.description,
  content: event.content,
  startDate: event.startDate.toISOString(),
  endDate: event.endDate.toISOString(),
  registrationDeadline: event.registrationDeadline.toISOString(),
  location: event.location,
  maxAttendees: event.maxAttendees,
  isPublic: event.isPublic,
  isFeatured: event.isFeatured,
  isActive: event.isActive,
  createdAt: event.createdAt.toISOString(),
  updatedAt: event.updatedAt.toISOString(),
  creator: event.creator ? {
    id: event.creator.id,
    name: `${event.creator.firstName || ''} ${event.creator.lastName || ''}`.trim(),
    email: event.creator.email,
  } : null,
  category: event.category,
  tags: event.tags?.map((tag: any) => tag.tag) || [],
  _count: {
    registrations: event._count?.registrations || 0,
  },
});

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const page = parseInt(searchParams.get('page') || '1');
    const limit = Math.min(parseInt(searchParams.get('limit') || '12'), 50); // Max 50 per page
    const search = searchParams.get('search') || '';
    const categoryId = searchParams.get('categoryId');
    const tag = searchParams.get('tag');
    const isFeatured = searchParams.get('featured') === 'true';
    const isUpcoming = searchParams.get('upcoming') === 'true';
    const isPast = searchParams.get('past') === 'true';
    const creatorId = searchParams.get('creatorId');
    const includeRegistrations = searchParams.get('includeRegistrations') === 'true';

    const skip = (page - 1) * limit;
    const now = new Date();

    const where: any = {
      AND: [
        // Search filter
        {
          OR: [
            { title: { contains: search, mode: 'insensitive' } },
            { description: { contains: search, mode: 'insensitive' } },
            { content: { contains: search, mode: 'insensitive' } },
            { location: { contains: search, mode: 'insensitive' } },
          ],
        },
        // Category filter
        categoryId ? { categoryId: parseInt(categoryId) } : {},
        // Tag filter
        tag ? { tags: { some: { tag: { name: tag } } } } : {},
        // Featured filter
        isFeatured ? { isFeatured: true } : {},
        // Upcoming/past events filter
        isUpcoming ? { startDate: { gt: now } } : {},
        isPast ? { endDate: { lt: now } } : {},
        // Creator filter
        creatorId ? { creatorId: parseInt(creatorId) } : {},
        // Only show active events by default
        { isActive: true },
      ],
    };

    const [events, total] = await Promise.all([
      prisma.event.findMany({
        where,
        skip,
        take: limit,
        include: {
          creator: {
            select: {
              id: true,
              firstName: true,
              lastName: true,
              email: true,
            },
          },
          category: true,
          tags: {
            include: {
              tag: true,
            },
          },
          _count: {
            select: { registrations: true },
          },
        },
        orderBy: { startDate: 'asc' },
      }),
      prisma.event.count({ where }),
    ]);

    // Format the response
    const formattedEvents = events.map(event => formatEventResponse(event));

    return NextResponse.json({
      success: true,
      data: {
        events: formattedEvents,
        pagination: {
          page,
          limit,
          total,
          totalPages: Math.ceil(total / limit),
        },
      },
    });
  } catch (error) {
    console.error('Error fetching events:', error);
    return NextResponse.json(
      { 
        success: false,
        message: 'Failed to fetch events',
        error: process.env.NODE_ENV === 'development' ? error.message : undefined,
      },
      { status: 500 }
    );
  }
}

export async function POST(request: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user) {
      return NextResponse.json(
        { 
          success: false,
          message: 'You must be logged in to create an event',
        },
        { status: 401 }
      );
    }

    // Only allow organizers, admins, and super admins to create events
    if (![UserRole.ORGANIZER, UserRole.ADMIN, UserRole.SUPER_ADMIN].includes(session.user.role as UserRole)) {
      return NextResponse.json(
        { 
          success: false,
          message: 'You do not have permission to create events',
        },
        { status: 403 }
      );
    }

    const json = await request.json();
    
    // Validate request body
    const validation = eventCreateSchema.safeParse(json);
    if (!validation.success) {
      return NextResponse.json(
        { 
          success: false,
          message: 'Validation failed',
          errors: validation.error.errors,
        },
        { status: 400 }
      );
    }

    const data = validation.data;
    
    // Check if category exists if provided
    if (data.categoryId) {
      const category = await prisma.category.findUnique({
        where: { id: data.categoryId },
      });
      
      if (!category) {
        return NextResponse.json(
          { 
            success: false,
            message: 'Invalid category ID',
          },
          { status: 400 }
        );
      }
    }

    // Create the event
    const event = await prisma.$transaction(async (tx) => {
      // Create the event
      const newEvent = await tx.event.create({
        data: {
          title: data.title,
          description: data.description,
          content: data.content,
          startDate: new Date(data.startDate),
          endDate: new Date(data.endDate),
          registrationDeadline: new Date(data.registrationDeadline),
          location: data.location,
          maxAttendees: data.maxAttendees,
          isPublic: data.isPublic,
          isFeatured: data.isFeatured,
          categoryId: data.categoryId,
          creatorId: parseInt(session.user.id),
        },
        include: {
          creator: {
            select: {
              id: true,
              firstName: true,
              lastName: true,
              email: true,
            },
          },
          category: true,
          tags: {
            include: {
              tag: true,
            },
          },
        },
      });

      // Add tags if provided
      if (data.tags && data.tags.length > 0) {
        // Get or create tags
        const tagRecords = await Promise.all(
          data.tags.map((tagName: string) =>
            tx.tag.upsert({
              where: { name: tagName },
              update: {},
              create: { name: tagName },
            })
          )
        );

        // Connect tags to event
        await tx.eventTag.createMany({
          data: tagRecords.map(tag => ({
            eventId: newEvent.id,
            tagId: tag.id,
          })),
          skipDuplicates: true,
        });
      }

      return newEvent;
    });

    // Get the full event with relations
    const fullEvent = await prisma.event.findUnique({
      where: { id: event.id },
      include: {
        creator: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            email: true,
          },
        },
        category: true,
        tags: {
          include: {
            tag: true,
          },
        },
        _count: {
          select: { registrations: true },
        },
      },
    });

    return NextResponse.json(
      { 
        success: true,
        data: formatEventResponse(fullEvent),
      },
      { status: 201 }
    );
  } catch (error) {
    console.error('Error creating event:', error);
    return NextResponse.json(
      { 
        success: false,
        message: 'Failed to create event',
        error: process.env.NODE_ENV === 'development' ? error.message : undefined,
      },
      { status: 500 }
    );
  }
}
