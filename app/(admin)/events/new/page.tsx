import { notFound } from 'next/navigation';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { EventForm } from '@/components/events/event-form';

export default async function CreateEventPage() {
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

  // Check if user has organizer, admin, or super admin role
  const isAuthorized = ['ORGANIZER', 'ADMIN', 'SUPER_ADMIN'].includes(session.user.role);
  
  // Redirect to home if not authorized
  if (!isAuthorized) {
    return {
      redirect: {
        destination: '/',
        permanent: false,
      },
    };
  }

  // Fetch categories and tags in parallel
  const [categories, tags] = await Promise.all([
    prisma.category.findMany({
      orderBy: { name: 'asc' },
    }),
    prisma.tag.findMany({
      orderBy: { name: 'asc' },
    }),
  ]);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">Create New Event</h1>
        <p className="text-muted-foreground">
          Fill out the form below to create a new event.
        </p>
      </div>
      
      <div className="rounded-md border bg-white p-6">
        <EventForm 
          categories={categories} 
          tags={tags} 
          isNew={true} 
        />
      </div>
    </div>
  );
}
