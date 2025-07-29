// TROUBLESHOOTING: If you see 'Property ... does not exist on type PrismaClient', ensure:
// 1. Your schema.prisma is correct (model Registration, model Event, etc.)
// 2. You have run 'npx prisma generate' in the project root
// 3. Your import is: import { prisma } from '@/lib/prisma';
// 4. Your node_modules/.prisma/client/index.d.ts contains the correct model typings
// If all above are correct and the error persists, try restarting your TypeScript server or IDE.

import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';

export async function POST(
  request: Request,
  { params }: { params: { eventId: string } }
) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user) {
      return NextResponse.json(
        { message: 'You must be logged in to register for events' },
        { status: 401 }
      );
    }

    const eventId = Number(params.eventId);
    const userId = session.user.id;

    // Check if event exists and has capacity
    const event = await prisma.event.findUnique({
      where: { id: eventId },
      include: { registrations: true },
    });

    if (!event) {
      return NextResponse.json(
        { message: 'Event not found' },
        { status: 404 }
      );
    }

    if (
      event.maxAttendees !== null &&
      event.registrations.length >= event.maxAttendees
    ) {
      return NextResponse.json(
        { message: 'This event has reached capacity' },
        { status: 400 }
      );
    }

    // Check if user is already registered
    const existingRegistration = await prisma.registration.findUnique({
      where: {
        eventId_userId: {
          eventId,
          userId,
        },
      },
    });

    if (existingRegistration) {
      return NextResponse.json(
        { message: 'You are already registered for this event' },
        { status: 400 }
      );
    }

    // Register user for the event
    const registration = await prisma.registration.create({
      data: {
        eventId,
        userId,
        status: 'REGISTERED',
      },
    });

    return NextResponse.json(
      { message: 'Successfully registered for the event', registration },
      { status: 201 }
    );
  } catch (error) {
    console.error('Error registering for event:', error);
    return NextResponse.json(
      { message: 'An error occurred while registering for the event' },
      { status: 500 }
    );
  }
}

export async function DELETE(
  request: Request,
  { params }: { params: { eventId: string } }
) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user) {
      return NextResponse.json(
        { message: 'You must be logged in to unregister from events' },
        { status: 401 }
      );
    }

    const eventId = Number(params.eventId);
    const userId = session.user.id;

    // Check if registration exists
    const registration = await prisma.registration.findUnique({
      where: {
        eventId_userId: {
          eventId,
          userId,
        },
      },
    });

    if (!registration) {
      return NextResponse.json(
        { message: 'You are not registered for this event' },
        { status: 404 }
      );
    }

    // Remove registration
    await prisma.registration.delete({
      where: {
        id: registration.id,
      },
    });

    return NextResponse.json(
      { message: 'Successfully unregistered from the event' },
      { status: 200 }
    );
  } catch (error) {
    console.error('Error unregistering from event:', error);
    return NextResponse.json(
      { message: 'An error occurred while unregistering from the event' },
      { status: 500 }
    );
  }
}
