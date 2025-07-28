import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';

export async function GET() {
  try {
    const session = await getServerSession(authOptions);
    
    // Check if user is admin
    if (session?.user.role !== 'ADMIN') {
      return NextResponse.json(
        { message: 'Unauthorized' },
        { status: 403 }
      );
    }

    const events = await prisma.event.findMany({
      include: {
        _count: {
          select: { registrations: true },
        },
        organizer: {
          select: {
            name: true,
            email: true,
          },
        },
      },
      orderBy: {
        startDate: 'desc',
      },
    });

    const formattedEvents = events.map(event => ({
      id: event.id,
      title: event.title,
      startDate: event.startDate.toISOString(),
      endDate: event.endDate.toISOString(),
      location: event.location,
      capacity: event.capacity,
      registered: event._count.registrations,
      status: getEventStatus(event.startDate, event.endDate),
      organizer: event.organizer.name,
    }));

    return NextResponse.json({ events: formattedEvents });
  } catch (error) {
    console.error('Error fetching events:', error);
    return NextResponse.json(
      { message: 'Internal server error' },
      { status: 500 }
    );
  }
}

function getEventStatus(startDate: Date, endDate: Date): string {
  const now = new Date();
  if (now < startDate) return 'upcoming';
  if (now > endDate) return 'completed';
  return 'ongoing';
}
