import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';

export async function POST(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user) {
      return NextResponse.json(
        { message: 'You must be logged in to register for events' },
        { status: 401 }
      );
    }

    const eventId = params.id;
    const userId = session.user.id;

    // Check if event exists and has capacity
    const event = await prisma.event.findUnique({
      where: { id: eventId },
      include: {
        _count: {
          select: { registrations: true },
        },
      },
    });

    if (!event) {
      return NextResponse.json(
        { message: 'Event not found' },
        { status: 404 }
      );
    }

    if (event._count.registrations >= event.capacity) {
      return NextResponse.json(
        { message: 'This event has reached capacity' },
        { status: 400 }
      );
    }

    // Check if user is already registered
    const existingRegistration = await prisma.eventRegistration.findFirst({
      where: {
        eventId,
        userId,
      },
    });

    if (existingRegistration) {
      return NextResponse.json(
        { message: 'You are already registered for this event' },
        { status: 400 }
      );
    }

    // Register user for the event
    await prisma.eventRegistration.create({
      data: {
        eventId,
        userId,
      },
    });

    return NextResponse.json(
      { message: 'Successfully registered for the event' },
      { status: 201 }
    );
  } catch (error) {
    console.error('Error registering for event:', error);
    return NextResponse.json(
      { message: 'Internal server error' },
      { status: 500 }
    );
  }
}

export async function DELETE(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user) {
      return NextResponse.json(
        { message: 'You must be logged in to cancel registration' },
        { status: 401 }
      );
    }

    const eventId = params.id;
    const userId = session.user.id;

    // Delete the registration
    const deleted = await prisma.eventRegistration.deleteMany({
      where: {
        eventId,
        userId,
      },
    });

    if (deleted.count === 0) {
      return NextResponse.json(
        { message: 'Registration not found' },
        { status: 404 }
      );
    }

    return NextResponse.json(
      { message: 'Registration cancelled successfully' },
      { status: 200 }
    );
  } catch (error) {
    console.error('Error cancelling registration:', error);
    return NextResponse.json(
      { message: 'Internal server error' },
      { status: 500 }
    );
  }
}
