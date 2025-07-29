import { notFound } from 'next/navigation';
import { getServerSession } from 'next-auth';
import { format } from 'date-fns';
import { Calendar, Clock, MapPin, Users, User, CheckCircle, XCircle, Clock as ClockIcon, Tag } from 'lucide-react';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import Link from 'next/link';

interface EventDetailPageProps {
  params: {
    eventId: string;
  };
}

export default async function EventDetailPage({ params }: EventDetailPageProps) {
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

  // Parse eventId from params
  const eventId = parseInt(params.eventId);
  if (isNaN(eventId)) {
    return notFound();
  }

  // Fetch event with related data
  const event = await prisma.event.findUnique({
    where: { id: eventId },
    include: {
      organizer: {
        select: {
          id: true,
          firstName: true,
          lastName: true,
          email: true,
        },
      },
      category: {
        select: {
          id: true,
          name: true,
        },
      },
      tags: {
        select: {
          id: true,
          name: true,
        },
      },
      _count: {
        select: {
          registrations: true,
        },
      },
    },
  });

  // Return 404 if event not found
  if (!event) {
    return notFound();
  }

  // Check if user has permission to view this event
  const isAdmin = ['ADMIN', 'SUPER_ADMIN'].includes(session.user.role);
  const isOrganizer = event.organizerId === session.user.id;
  
  if (!isAdmin && !isOrganizer) {
    return {
      redirect: {
        destination: '/',
        permanent: false,
      },
    };
  }

  // Fetch recent registrations
  const recentRegistrations = await prisma.registration.findMany({
    where: { eventId },
    orderBy: { registrationDate: 'desc' },
    take: 5,
    include: {
      user: {
        select: {
          id: true,
          firstName: true,
          lastName: true,
          email: true,
        },
      },
    },
  });

  // Format event data
  const eventData = {
    ...event,
    startDate: new Date(event.startDate),
    endDate: new Date(event.endDate),
    registrationDeadline: event.registrationDeadline ? new Date(event.registrationDeadline) : null,
    createdAt: new Date(event.createdAt),
    updatedAt: new Date(event.updatedAt),
  };

  // Status badge variant mapping
  const statusVariant = {
    DRAFT: 'bg-gray-100 text-gray-800',
    PUBLISHED: 'bg-green-100 text-green-800',
    CANCELLED: 'bg-red-100 text-red-800',
    COMPLETED: 'bg-blue-100 text-blue-800',
  }[event.status] || 'bg-gray-100 text-gray-800';

  // Check if registration is open
  const isRegistrationOpen = event.status === 'PUBLISHED' && 
    (!event.registrationDeadline || new Date(event.registrationDeadline) > new Date());

  // Check if event is in the past
  const isPastEvent = new Date(event.endDate) < new Date();

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">{event.title}</h1>
          <p className="text-muted-foreground">
            Event ID: {event.id} • Created on {format(eventData.createdAt, 'MMM d, yyyy')}
          </p>
        </div>
        <div className="flex space-x-2">
          <Button variant="outline" asChild>
            <Link href="/admin/events">Back to Events</Link>
          </Button>
          <Button asChild>
            <Link href={`/admin/events/${event.id}/edit`}>Edit Event</Link>
          </Button>
        </div>
      </div>

      <div className="grid gap-6">
        {/* Event Header Card */}
        <Card>
          <CardContent className="p-6">
            <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-6">
              <div className="space-y-2">
                <div className="flex items-center space-x-2">
                  <Badge className={statusVariant}>
                    {event.status}
                  </Badge>
                  {isRegistrationOpen && (
                    <Badge className="bg-green-100 text-green-800">
                      Registration Open
                    </Badge>
                  )}
                  {isPastEvent && (
                    <Badge variant="outline">
                      Past Event
                    </Badge>
                  )}
                </div>
                
                <div className="flex items-center text-sm text-muted-foreground">
                  <Calendar className="mr-2 h-4 w-4" />
                  {format(eventData.startDate, 'EEEE, MMMM d, yyyy')}
                </div>
                
                <div className="flex items-center text-sm text-muted-foreground">
                  <Clock className="mr-2 h-4 w-4" />
                  {format(eventData.startDate, 'h:mm a')} - {format(eventData.endDate, 'h:mm a')}
                </div>
                
                <div className="flex items-center text-sm text-muted-foreground">
                  <MapPin className="mr-2 h-4 w-4" />
                  {event.location}
                </div>
                
                {event.category && (
                  <div className="flex items-center text-sm text-muted-foreground">
                    <Tag className="mr-2 h-4 w-4" />
                    {event.category.name}
                  </div>
                )}
              </div>
              
              <div className="flex flex-col space-y-2">
                <div className="flex items-center space-x-2">
                  <Users className="h-5 w-5 text-muted-foreground" />
                  <span className="text-sm font-medium">
                    {event._count.registrations} / {event.capacity || '∞'} registered
                  </span>
                </div>
                
                {event.registrationDeadline && (
                  <div className="flex items-center space-x-2">
                    <ClockIcon className="h-5 w-5 text-muted-foreground" />
                    <span className="text-sm">
                      Registration deadline: {format(eventData.registrationDeadline!, 'MMM d, yyyy h:mm a')}
                    </span>
                  </div>
                )}
                
                <div className="pt-2">
                  <Button variant="outline" className="w-full" asChild>
                    <Link href={`/admin/events/${event.id}/registrations`}>
                      View All Registrations
                    </Link>
                  </Button>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Main Content */}
        <div className="grid gap-6 md:grid-cols-3">
          {/* Event Details */}
          <div className="md:col-span-2 space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Event Description</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="prose max-w-none">
                  {event.description ? (
                    <p className="whitespace-pre-line">{event.description}</p>
                  ) : (
                    <p className="text-muted-foreground">No description provided.</p>
                  )}
                </div>
                
                {event.tags.length > 0 && (
                  <div className="mt-4 flex flex-wrap gap-2">
                    {event.tags.map((tag) => (
                      <Badge key={tag.id} variant="secondary">
                        {tag.name}
                      </Badge>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
            
            {/* Organizer Information */}
            <Card>
              <CardHeader>
                <CardTitle>Organizer Information</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex items-center space-x-4">
                  <div className="h-12 w-12 rounded-full bg-indigo-100 flex items-center justify-center">
                    <User className="h-6 w-6 text-indigo-600" />
                  </div>
                  <div>
                    <h4 className="font-medium">
                      {event.organizer.firstName} {event.organizer.lastName}
                    </h4>
                    <p className="text-sm text-muted-foreground">
                      {event.organizer.email}
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
          
          {/* Sidebar */}
          <div className="space-y-6">
            {/* Event Actions */}
            <Card>
              <CardHeader>
                <CardTitle>Event Actions</CardTitle>
              </CardHeader>
              <CardContent className="space-y-2">
                <Button variant="outline" className="w-full" asChild>
                  <Link href={`/events/${event.id}`} target="_blank">
                    View Public Page
                  </Link>
                </Button>
                
                <Button variant="outline" className="w-full" asChild>
                  <Link href={`/admin/events/${event.id}/edit`}>
                    Edit Event
                  </Link>
                </Button>
                
                {event.status === 'DRAFT' && (
                  <Button className="w-full bg-green-600 hover:bg-green-700">
                    Publish Event
                  </Button>
                )}
                
                {event.status === 'PUBLISHED' && (
                  <Button variant="outline" className="w-full text-red-600 border-red-200 hover:bg-red-50 hover:text-red-700">
                    Cancel Event
                  </Button>
                )}
                
                {!isPastEvent && event.status === 'PUBLISHED' && (
                  <Button variant="outline" className="w-full">
                    Send Reminder
                  </Button>
                )}
                
                {isPastEvent && event.status === 'PUBLISHED' && (
                  <Button className="w-full bg-blue-600 hover:bg-blue-700">
                    Mark as Completed
                  </Button>
                )}
              </CardContent>
            </Card>
            
            {/* Quick Stats */}
            <Card>
              <CardHeader>
                <CardTitle>Quick Stats</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-muted-foreground">Total Capacity</span>
                    <span className="font-medium">{event.capacity || 'Unlimited'}</span>
                  </div>
                  <div className="mt-1 h-2 w-full overflow-hidden rounded-full bg-gray-200">
                    <div 
                      className="h-full bg-indigo-600"
                      style={{
                        width: event.capacity 
                          ? `${Math.min(100, (event._count.registrations / event.capacity) * 100)}%` 
                          : '0%'
                      }}
                    />
                  </div>
                  <div className="mt-1 text-right text-xs text-muted-foreground">
                    {event._count.registrations} registered
                  </div>
                </div>
                
                <div className="space-y-2">
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-muted-foreground">Registration Status</span>
                    <span className="font-medium">
                      {isRegistrationOpen ? 'Open' : 'Closed'}
                    </span>
                  </div>
                  
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-muted-foreground">Visibility</span>
                    <span className="font-medium">
                      {event.isPublic ? 'Public' : 'Private'}
                    </span>
                  </div>
                  
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-muted-foreground">Created</span>
                    <span className="font-medium">
                      {format(eventData.createdAt, 'MMM d, yyyy')}
                    </span>
                  </div>
                  
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-muted-foreground">Last Updated</span>
                    <span className="font-medium">
                      {format(eventData.updatedAt, 'MMM d, yyyy')}
                    </span>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
        
        {/* Recent Registrations */}
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle>Recent Registrations</CardTitle>
              <Button variant="outline" size="sm" asChild>
                <Link href={`/admin/events/${event.id}/registrations`}>
                  View All
                </Link>
              </Button>
            </div>
          </CardHeader>
          <CardContent>
            {recentRegistrations.length > 0 ? (
              <div className="space-y-4">
                {recentRegistrations.map((registration) => (
                  <div key={registration.id} className="flex items-center justify-between rounded-lg border p-4">
                    <div className="flex items-center space-x-4">
                      <div className="h-10 w-10 rounded-full bg-gray-100 flex items-center justify-center">
                        <User className="h-5 w-5 text-gray-500" />
                      </div>
                      <div>
                        <h4 className="font-medium">
                          {registration.user.firstName} {registration.user.lastName}
                        </h4>
                        <p className="text-sm text-muted-foreground">
                          {registration.user.email}
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Badge variant={registration.status === 'CONFIRMED' ? 'default' : 'outline'}>
                        {registration.status}
                      </Badge>
                      <span className="text-sm text-muted-foreground">
                        {format(new Date(registration.registrationDate), 'MMM d, yyyy')}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-8">
                <p className="text-muted-foreground">No registrations yet.</p>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
