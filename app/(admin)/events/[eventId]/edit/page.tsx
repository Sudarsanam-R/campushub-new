import { notFound } from 'next/navigation';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { EventForm } from '@/components/events/event-form';

interface EditEventPageProps {
  params: {
    eventId: string;
  };
}

export default async function EditEventPage({ params }: EditEventPageProps) {
  const session = await getServerSession(authOptions);
  
  // Redirect to login if not authenticated
  if (!session?.user) {
    return {
      redirect: {
        destination: '/login',
        permanent: false,
      },
    };
  }

  // Check if user has admin or super admin role
  const isAdmin = ['ADMIN', 'SUPER_ADMIN'].includes(session.user.role);
  
  // Parse eventId from params
  const eventId = parseInt(params.eventId);
  if (isNaN(eventId)) {
    return notFound();
  }

  // Fetch event with its tags
  const event = await prisma.event.findUnique({
    where: { id: eventId },
    include: {
      tags: {
        select: {
          id: true,
          name: true,
        },
      },
    },
  });

  // Return 404 if event not found
  if (!event) {
    return notFound();
  }

  // Check if user is the organizer or an admin
  const isOrganizer = event.organizerId === session.user.id;
  if (!isOrganizer && !isAdmin) {
    return {
      redirect: {
        destination: '/',
        permanent: false,
      },
    };
  }

  // Fetch categories and tags in parallel
  const [categories, allTags] = await Promise.all([
    prisma.category.findMany({
      orderBy: { name: 'asc' },
    }),
    prisma.tag.findMany({
      orderBy: { name: 'asc' },
    }),
  ]);

  // Format the event data to match the form's expected shape
  const formattedEvent = {
    ...event,
    tags: event.tags,
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">Edit Event</h1>
        <p className="text-muted-foreground">
          Update the event details below.
        </p>
      </div>
      
      <div className="rounded-md border bg-white p-6">
        <EventForm 
          event={formattedEvent} 
          categories={categories} 
          tags={allTags} 
          isNew={false} 
        />
      </div>
    </div>
  );
}
