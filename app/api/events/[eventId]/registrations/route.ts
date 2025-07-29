import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { z } from 'zod';
import { RegistrationStatus } from '@prisma/client';

// Validation schemas
const createRegistrationSchema = z.object({
  userId: z.number().int().positive().optional(), // Optional for self-registration
  status: z.nativeEnum(RegistrationStatus).default('PENDING'),
  notes: z.string().optional(),
});

// GET /api/events/[eventId]/registrations
// Get all registrations for an event
// Requires authentication and appropriate permissions
export async function GET(
  request: Request,
  { params }: { params: { eventId: string } }
) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user) {
      return NextResponse.json(
        { success: false, message: 'Authentication required' },
        { status: 401 }
      );
    }

    const eventId = parseInt(params.eventId);
    if (isNaN(eventId)) {
      return NextResponse.json(
        { success: false, message: 'Invalid event ID' },
        { status: 400 }
      );
    }

    // Check if the user has permission to view registrations
    // Only event creator, admin, or super admin can view all registrations
    const event = await prisma.event.findUnique({
      where: { id: eventId },
      select: { creatorId: true },
    });

    if (!event) {
      return NextResponse.json(
        { success: false, message: 'Event not found' },
        { status: 404 }
      );
    }

    const isEventCreator = event.creatorId === parseInt(session.user.id);
    const isAdmin = ['ADMIN', 'SUPER_ADMIN'].includes(session.user.role);

    if (!isEventCreator && !isAdmin) {
      return NextResponse.json(
        { success: false, message: 'Unauthorized to view registrations' },
        { status: 403 }
      );
    }

    // Get registrations with user details
    const registrations = await prisma.registration.findMany({
      where: { eventId },
      include: {
        user: {
          select: {
            id: true,
            email: true,
            firstName: true,
            lastName: true,
            Profile: {
              select: {
                profilePicture: true,
                stream: true,
              },
            },
          },
        },
      },
      orderBy: { registrationDate: 'desc' },
    });

    const formattedRegistrations = registrations.map((reg) => ({
      id: reg.id,
      status: reg.status,
      registrationDate: reg.registrationDate.toISOString(),
      attendanceStatus: reg.attendanceStatus,
      checkInTime: reg.checkInTime?.toISOString(),
      checkOutTime: reg.checkOutTime?.toISOString(),
      user: {
        id: reg.user.id,
        name: `${reg.user.firstName || ''} ${reg.user.lastName || ''}`.trim(),
        email: reg.user.email,
        profilePicture: reg.user.Profile?.profilePicture,
        stream: reg.user.Profile?.stream,
      },
    }));

    return NextResponse.json({
      success: true,
      data: formattedRegistrations,
    });
  } catch (error) {
    console.error('Error fetching registrations:', error);
    return NextResponse.json(
      {
        success: false,
        message: 'Failed to fetch registrations',
        error: process.env.NODE_ENV === 'development' ? error.message : undefined,
      },
      { status: 500 }
    );
  }
}

// POST /api/events/[eventId]/registrations
// Register for an event or register someone else (admin/organizer only)
export async function POST(
  request: Request,
  { params }: { params: { eventId: string } }
) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user) {
      return NextResponse.json(
        { success: false, message: 'Authentication required' },
        { status: 401 }
      );
    }

    const eventId = parseInt(params.eventId);
    if (isNaN(eventId)) {
      return NextResponse.json(
        { success: false, message: 'Invalid event ID' },
        { status: 400 }
      );
    }

    // Parse and validate request body
    const json = await request.json();
    const validation = createRegistrationSchema.safeParse(json);
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
    const targetUserId = data.userId || parseInt(session.user.id);

    // Check if the event exists and get its details
    const event = await prisma.event.findUnique({
      where: { id: eventId },
      select: {
        id: true,
        title: true,
        startDate: true,
        endDate: true,
        maxAttendees: true,
        registrationDeadline: true,
        isActive: true,
        _count: {
          select: { registrations: true },
        },
      },
    });

    if (!event) {
      return NextResponse.json(
        { success: false, message: 'Event not found' },
        { status: 404 }
      );
    }

    if (!event.isActive) {
      return NextResponse.json(
        { success: false, message: 'This event is no longer active' },
        { status: 400 }
      );
    }

    // Check registration deadline
    if (new Date() > event.registrationDeadline) {
      return NextResponse.json(
        { success: false, message: 'Registration deadline has passed' },
        { status: 400 }
      );
    }

    // Check if event is at capacity
    if (event.maxAttendees && event._count.registrations >= event.maxAttendees) {
      return NextResponse.json(
        { success: false, message: 'This event is at capacity' },
        { status: 400 }
      );
    }

    // Check if user is already registered
    const existingRegistration = await prisma.registration.findUnique({
      where: {
        eventId_userId: {
          eventId,
          userId: targetUserId,
        },
      },
    });

    if (existingRegistration) {
      return NextResponse.json(
        {
          success: false,
          message: 'You are already registered for this event',
        },
        { status: 400 }
      );
    }

    // Check permissions if registering someone else
    const isSelfRegistration = !data.userId || parseInt(session.user.id) === targetUserId;
    const isAdmin = ['ADMIN', 'SUPER_ADMIN'].includes(session.user.role);
    const isEventOrganizer = await prisma.event.findFirst({
      where: {
        id: eventId,
        creatorId: parseInt(session.user.id),
      },
    });

    if (!isSelfRegistration && !isAdmin && !isEventOrganizer) {
      return NextResponse.json(
        {
          success: false,
          message: 'You do not have permission to register others for this event',
        },
        { status: 403 }
      );
    }

    // Create the registration
    const registration = await prisma.registration.create({
      data: {
        eventId,
        userId: targetUserId,
        status: data.status,
        notes: data.notes,
        registrationDate: new Date(),
      },
      include: {
        event: {
          select: {
            title: true,
            startDate: true,
            endDate: true,
            location: true,
          },
        },
        user: {
          select: {
            email: true,
            firstName: true,
            lastName: true,
          },
        },
      },
    });

    // TODO: Send confirmation email to the user

    return NextResponse.json(
      {
        success: true,
        data: {
          id: registration.id,
          status: registration.status,
          registrationDate: registration.registrationDate.toISOString(),
          event: {
            title: registration.event.title,
            startDate: registration.event.startDate.toISOString(),
            endDate: registration.event.endDate.toISOString(),
            location: registration.event.location,
          },
        },
        message: isSelfRegistration
          ? 'Successfully registered for the event!'
          : 'Successfully registered user for the event!',
      },
      { status: 201 }
    );
  } catch (error) {
    console.error('Error creating registration:', error);
    return NextResponse.json(
      {
        success: false,
        message: 'Failed to create registration',
        error: process.env.NODE_ENV === 'development' ? error.message : undefined,
      },
      { status: 500 }
    );
  }
}
