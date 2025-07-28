import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '6');
    const search = searchParams.get('search') || '';
    const category = searchParams.get('category') || '';

    const skip = (page - 1) * limit;

    const where = {
      AND: [
        {
          OR: [
            { title: { contains: search, mode: 'insensitive' } },
            { description: { contains: search, mode: 'insensitive' } },
            { location: { contains: search, mode: 'insensitive' } },
          ],
        },
        category ? { category } : {},
      ],
    };

    const [events, total] = await Promise.all([
      prisma.event.findMany({
        where,
        skip,
        take: limit,
        include: {
          _count: {
            select: { registrations: true },
          },
        },
        orderBy: { startDate: 'asc' },
      }),
      prisma.event.count({ where }),
    ]);

    const formattedEvents = events.map((event) => ({
      id: event.id,
      title: event.title,
      description: event.description,
      startDate: event.startDate.toISOString(),
      endDate: event.endDate.toISOString(),
      location: event.location,
      capacity: event.capacity,
      registered: event._count.registrations,
      category: event.category,
      image: event.image,
    }));

    return NextResponse.json({
      events: formattedEvents,
      total,
      totalPages: Math.ceil(total / limit),
    });
  } catch (error) {
    console.error('Error fetching events:', error);
    return NextResponse.json(
      { message: 'Internal server error' },
      { status: 500 }
    );
  }
}

export async function POST(request: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user) {
      return NextResponse.json(
        { message: 'Unauthorized' },
        { status: 401 }
      );
    }

    const data = await request.json();
    
    // Validate required fields
    const requiredFields = ['title', 'description', 'startDate', 'endDate', 'location', 'capacity'];
    for (const field of requiredFields) {
      if (!data[field]) {
        return NextResponse.json(
          { message: `Missing required field: ${field}` },
          { status: 400 }
        );
      }
    }

    const event = await prisma.event.create({
      data: {
        title: data.title,
        description: data.description,
        startDate: new Date(data.startDate),
        endDate: new Date(data.endDate),
        location: data.location,
        capacity: parseInt(data.capacity),
        category: data.category || 'General',
        image: data.image,
        organizerId: session.user.id,
      },
    });

    return NextResponse.json(event, { status: 201 });
  } catch (error) {
    console.error('Error creating event:', error);
    return NextResponse.json(
      { message: 'Internal server error' },
      { status: 500 }
    );
  }
}
