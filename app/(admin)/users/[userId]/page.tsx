import { notFound } from 'next/navigation';
import { UserRole } from '@prisma/client';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { format } from 'date-fns';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { User, Mail, Calendar, Phone, BookOpen, Info, Clock, CheckCircle, XCircle } from 'lucide-react';
import Link from 'next/link';

interface UserDetailPageProps {
  params: {
    userId: string;
  };
}

export default async function UserDetailPage({ params }: UserDetailPageProps) {
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

  // Check if user has admin role
  const isAdmin = [UserRole.ADMIN, UserRole.SUPER_ADMIN].includes(session.user.role);
  
  // Redirect to home if not admin
  if (!isAdmin) {
    return {
      redirect: {
        destination: '/',
        permanent: false,
      },
    };
  }

  // Parse userId from params
  const userId = parseInt(params.userId);
  if (isNaN(userId)) {
    return notFound();
  }

  // Fetch user data
  const user = await prisma.user.findUnique({
    where: { id: userId },
    include: {
      Profile: true,
      events: {
        take: 5,
        orderBy: {
          createdAt: 'desc',
        },
      },
      registrations: {
        take: 5,
        orderBy: {
          registrationDate: 'desc',
        },
        include: {
          event: {
            select: {
              title: true,
              startDate: true,
              endDate: true,
            },
          },
        },
      },
    },
  });

  // Return 404 if user not found
  if (!user) {
    return notFound();
  }

  // Format user data
  const userData = {
    ...user,
    profile: user.Profile,
    Profile: undefined, // Remove the Profile field
  };

  // Role badge variant mapping
  const roleVariant = {
    [UserRole.SUPER_ADMIN]: 'bg-purple-100 text-purple-800',
    [UserRole.ADMIN]: 'bg-blue-100 text-blue-800',
    [UserRole.ORGANIZER]: 'bg-green-100 text-green-800',
    [UserRole.STUDENT]: 'bg-gray-100 text-gray-800',
  }[user.role] || 'bg-gray-100 text-gray-800';

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold tracking-tight">User Details</h2>
          <p className="text-muted-foreground">
            View and manage user information
          </p>
        </div>
        <div className="flex space-x-2">
          <Button variant="outline" asChild>
            <Link href="/admin/users">Back to Users</Link>
          </Button>
          <Button asChild>
            <Link href={`/admin/users/${user.id}/edit`}>Edit User</Link>
          </Button>
        </div>
      </div>

      <div className="grid gap-6">
        {/* User Profile Card */}
        <Card>
          <CardHeader>
            <div className="flex items-center space-x-4">
              {userData.profile?.profilePicture ? (
                <img
                  src={userData.profile.profilePicture}
                  alt={`${userData.firstName} ${userData.lastName}`}
                  className="h-16 w-16 rounded-full"
                />
              ) : (
                <div className="h-16 w-16 rounded-full bg-indigo-100 flex items-center justify-center text-2xl font-medium text-indigo-600">
                  {userData.firstName?.charAt(0)}{userData.lastName?.charAt(0) || 'U'}
                </div>
              )}
              <div>
                <div className="flex items-center space-x-2">
                  <h1 className="text-2xl font-bold">
                    {userData.firstName} {userData.lastName}
                  </h1>
                  <Badge className={roleVariant}>
                    {userData.role.replace('_', ' ')}
                  </Badge>
                  <Badge variant={userData.isActive ? 'default' : 'outline'}>
                    {userData.isActive ? 'Active' : 'Inactive'}
                  </Badge>
                </div>
                <p className="text-muted-foreground">{userData.email}</p>
                <p className="text-sm text-muted-foreground">
                  Member since {format(new Date(userData.createdAt), 'MMMM d, yyyy')}
                </p>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <Tabs defaultValue="overview" className="space-y-4">
              <TabsList>
                <TabsTrigger value="overview">Overview</TabsTrigger>
                <TabsTrigger value="events">Events</TabsTrigger>
                <TabsTrigger value="registrations">Registrations</TabsTrigger>
                <TabsTrigger value="activity">Activity</TabsTrigger>
              </TabsList>
              
              <TabsContent value="overview" className="space-y-4">
                <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                  <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                      <CardTitle className="text-sm font-medium">
                        Total Events
                      </CardTitle>
                      <Calendar className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                      <div className="text-2xl font-bold">{userData.events.length}</div>
                      <p className="text-xs text-muted-foreground">Events created</p>
                    </CardContent>
                  </Card>
                  
                  <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                      <CardTitle className="text-sm font-medium">
                        Registrations
                      </CardTitle>
                      <CheckCircle className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                      <div className="text-2xl font-bold">{userData.registrations.length}</div>
                      <p className="text-xs text-muted-foreground">Event registrations</p>
                    </CardContent>
                  </Card>
                  
                  <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                      <CardTitle className="text-sm font-medium">
                        Last Active
                      </CardTitle>
                      <Clock className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                      <div className="text-2xl font-bold">
                        {format(new Date(userData.updatedAt), 'MMM d, yyyy')}
                      </div>
                      <p className="text-xs text-muted-foreground">Last updated</p>
                    </CardContent>
                  </Card>
                </div>
                
                <Card>
                  <CardHeader>
                    <CardTitle>Profile Information</CardTitle>
                    <CardDescription>
                      Basic information about the user
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="grid gap-4">
                    <div className="flex items-center space-x-4">
                      <User className="h-5 w-5 text-muted-foreground" />
                      <div>
                        <p className="text-sm font-medium">Full Name</p>
                        <p className="text-sm text-muted-foreground">
                          {userData.firstName} {userData.lastName}
                        </p>
                      </div>
                    </div>
                    
                    <div className="flex items-center space-x-4">
                      <Mail className="h-5 w-5 text-muted-foreground" />
                      <div>
                        <p className="text-sm font-medium">Email</p>
                        <p className="text-sm text-muted-foreground">
                          {userData.email}
                        </p>
                      </div>
                    </div>
                    
                    {userData.profile?.contactNumber && (
                      <div className="flex items-center space-x-4">
                        <Phone className="h-5 w-5 text-muted-foreground" />
                        <div>
                          <p className="text-sm font-medium">Contact Number</p>
                          <p className="text-sm text-muted-foreground">
                            {userData.profile.contactNumber}
                          </p>
                        </div>
                      </div>
                    )}
                    
                    {userData.profile?.stream && (
                      <div className="flex items-center space-x-4">
                        <BookOpen className="h-5 w-5 text-muted-foreground" />
                        <div>
                          <p className="text-sm font-medium">Stream</p>
                          <p className="text-sm text-muted-foreground">
                            {userData.profile.stream}
                            {userData.profile.year && `, Year ${userData.profile.year}`}
                          </p>
                        </div>
                      </div>
                    )}
                    
                    <div className="flex items-center space-x-4">
                      <Info className="h-5 w-5 text-muted-foreground" />
                      <div>
                        <p className="text-sm font-medium">Status</p>
                        <div className="flex items-center space-x-2">
                          <Badge variant={userData.isActive ? 'default' : 'outline'}>
                            {userData.isActive ? 'Active' : 'Inactive'}
                          </Badge>
                          <Badge variant={userData.emailVerified ? 'default' : 'outline'}>
                            {userData.emailVerified ? 'Verified' : 'Not Verified'}
                          </Badge>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>
              
              <TabsContent value="events" className="space-y-4">
                <h3 className="text-lg font-medium">Recent Events</h3>
                {userData.events.length > 0 ? (
                  <div className="space-y-2">
                    {userData.events.map((event) => (
                      <Card key={event.id}>
                        <CardContent className="p-4">
                          <div className="flex justify-between items-start">
                            <div>
                              <h4 className="font-medium">{event.title}</h4>
                              <p className="text-sm text-muted-foreground">
                                {format(new Date(event.startDate), 'MMM d, yyyy')} • {event.location}
                              </p>
                            </div>
                            <Button variant="outline" size="sm" asChild>
                              <Link href={`/events/${event.id}`}>View</Link>
                            </Button>
                          </div>
                        </CardContent>
                      </Card>
                    ))}
                    <div className="flex justify-end">
                      <Button variant="ghost" asChild>
                        <Link href={`/admin/events?organizerId=${userData.id}`}>
                          View all events
                        </Link>
                      </Button>
                    </div>
                  </div>
                ) : (
                  <div className="text-center py-8">
                    <p className="text-muted-foreground">No events found</p>
                  </div>
                )}
              </TabsContent>
              
              <TabsContent value="registrations" className="space-y-4">
                <h3 className="text-lg font-medium">Recent Registrations</h3>
                {userData.registrations.length > 0 ? (
                  <div className="space-y-2">
                    {userData.registrations.map((registration) => (
                      <Card key={registration.id}>
                        <CardContent className="p-4">
                          <div className="flex justify-between items-start">
                            <div>
                              <h4 className="font-medium">
                                {registration.event.title}
                              </h4>
                              <div className="flex items-center space-x-2 text-sm text-muted-foreground">
                                <span>
                                  {format(new Date(registration.event.startDate), 'MMM d, yyyy')}
                                </span>
                                <span>•</span>
                                <Badge variant="outline">
                                  {registration.status}
                                </Badge>
                              </div>
                            </div>
                            <div className="flex space-x-2">
                              <Button variant="outline" size="sm" asChild>
                                <Link href={`/events/${registration.eventId}`}>
                                  View Event
                                </Link>
                              </Button>
                            </div>
                          </div>
                        </CardContent>
                      </Card>
                    ))}
                    <div className="flex justify-end">
                      <Button variant="ghost" asChild>
                        <Link href={`/admin/registrations?userId=${userData.id}`}>
                          View all registrations
                        </Link>
                      </Button>
                    </div>
                  </div>
                ) : (
                  <div className="text-center py-8">
                    <p className="text-muted-foreground">No registrations found</p>
                  </div>
                )}
              </TabsContent>
              
              <TabsContent value="activity" className="space-y-4">
                <h3 className="text-lg font-medium">Recent Activity</h3>
                <div className="text-center py-8">
                  <p className="text-muted-foreground">Activity log coming soon</p>
                </div>
              </TabsContent>
            </Tabs>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
