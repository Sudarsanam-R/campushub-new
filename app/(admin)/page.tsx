import { Card } from '@/components/ui/card';
import { Users, Calendar, CheckCircle, BarChart } from 'lucide-react';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { format } from 'date-fns';
import Link from 'next/link';

export default async function AdminDashboard() {
  const session = await getServerSession(authOptions);
  
  if (!session?.user) {
    return null;
  }

  // Fetch dashboard data in parallel
  const [usersCount, eventsCount, activeEventsCount, recentRegistrations] = await Promise.all([
    prisma.user.count(),
    prisma.event.count(),
    prisma.event.count({
      where: {
        endDate: {
          gte: new Date()
        },
        isActive: true
      }
    }),
    prisma.registration.findMany({
      take: 5,
      orderBy: {
        registrationDate: 'desc'
      },
      include: {
        user: {
          select: {
            firstName: true,
            lastName: true,
            email: true
          }
        },
        event: {
          select: {
            title: true
          }
        }
      }
    })
  ]);

  // Get recent activities
  const recentActivities = await prisma.activityLog.findMany({
    take: 10,
    orderBy: {
      createdAt: 'desc'
    },
    include: {
      user: {
        select: {
          firstName: true,
          lastName: true,
          email: true
        }
      }
    }
  });

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4">
        <Card className="p-6">
          <div className="flex items-center">
            <div className="p-3 rounded-full bg-indigo-100 text-indigo-600">
              <Users className="h-6 w-6" />
            </div>
            <div className="ml-4">
              <h3 className="text-sm font-medium text-gray-500">Total Users</h3>
              <p className="text-2xl font-semibold text-gray-900">{usersCount}</p>
            </div>
          </div>
        </Card>
        
        <Card className="p-6">
          <div className="flex items-center">
            <div className="p-3 rounded-full bg-green-100 text-green-600">
              <Calendar className="h-6 w-6" />
            </div>
            <div className="ml-4">
              <h3 className="text-sm font-medium text-gray-500">Total Events</h3>
              <p className="text-2xl font-semibold text-gray-900">{eventsCount}</p>
            </div>
          </div>
        </Card>
        
        <Card className="p-6">
          <div className="flex items-center">
            <div className="p-3 rounded-full bg-blue-100 text-blue-600">
              <CheckCircle className="h-6 w-6" />
            </div>
            <div className="ml-4">
              <h3 className="text-sm font-medium text-gray-500">Active Events</h3>
              <p className="text-2xl font-semibold text-gray-900">{activeEventsCount}</p>
            </div>
          </div>
        </Card>
        
        <Card className="p-6">
          <div className="flex items-center">
            <div className="p-3 rounded-full bg-purple-100 text-purple-600">
              <BarChart className="h-6 w-6" />
            </div>
            <div className="ml-4">
              <h3 className="text-sm font-medium text-gray-500">Registrations (24h)</h3>
              <p className="text-2xl font-semibold text-gray-900">
                {recentRegistrations.length}
              </p>
            </div>
          </div>
        </Card>
      </div>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        <Card className="p-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-medium text-gray-900">Recent Registrations</h2>
            <Link 
              href="/admin/registrations" 
              className="text-sm font-medium text-indigo-600 hover:text-indigo-500"
            >
              View all
            </Link>
          </div>
          <div className="flow-root">
            <ul className="-mb-8">
              {recentRegistrations.length > 0 ? (
                recentRegistrations.map((reg, idx) => (
                  <li key={reg.id}>
                    <div className="relative pb-8">
                      {idx !== recentRegistrations.length - 1 ? (
                        <span 
                          className="absolute top-4 left-4 -ml-px h-full w-0.5 bg-gray-200" 
                          aria-hidden="true"
                        />
                      ) : null}
                      <div className="relative flex space-x-3">
                        <div>
                          <span className="h-8 w-8 rounded-full bg-indigo-100 flex items-center justify-center ring-8 ring-white">
                            <Users className="h-5 w-5 text-indigo-600" />
                          </span>
                        </div>
                        <div className="flex min-w-0 flex-1 justify-between space-x-4 pt-1.5">
                          <div>
                            <p className="text-sm text-gray-500">
                              <span className="font-medium text-gray-900">
                                {reg.user.firstName} {reg.user.lastName}
                              </span>{' '}
                              registered for{' '}
                              <span className="font-medium text-gray-900">
                                {reg.event.title}
                              </span>
                            </p>
                          </div>
                          <div className="whitespace-nowrap text-right text-sm text-gray-500">
                            <time dateTime={reg.registrationDate.toISOString()}>
                              {format(reg.registrationDate, 'MMM d, yyyy')}
                            </time>
                          </div>
                        </div>
                      </div>
                    </div>
                  </li>
                ))
              ) : (
                <p className="text-sm text-gray-500">No recent registrations</p>
              )}
            </ul>
          </div>
        </Card>

        <Card className="p-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-medium text-gray-900">Recent Activities</h2>
            <Link 
              href="/admin/activities" 
              className="text-sm font-medium text-indigo-600 hover:text-indigo-500"
            >
              View all
            </Link>
          </div>
          <div className="flow-root">
            <ul className="-mb-8">
              {recentActivities.length > 0 ? (
                recentActivities.map((activity, idx) => (
                  <li key={activity.id}>
                    <div className="relative pb-8">
                      {idx !== recentActivities.length - 1 ? (
                        <span 
                          className="absolute top-4 left-4 -ml-px h-full w-0.5 bg-gray-200" 
                          aria-hidden="true"
                        />
                      ) : null}
                      <div className="relative flex space-x-3">
                        <div>
                          <span className="h-8 w-8 rounded-full bg-gray-100 flex items-center justify-center ring-8 ring-white">
                            <UserActivityIcon activityType={activity.activityType} />
                          </span>
                        </div>
                        <div className="flex min-w-0 flex-1 justify-between space-x-4 pt-1.5">
                          <div>
                            <p className="text-sm text-gray-500">
                              <span className="font-medium text-gray-900">
                                {activity.user?.firstName} {activity.user?.lastName}
                              </span>{' '}
                              {activity.description}
                            </p>
                          </div>
                          <div className="whitespace-nowrap text-right text-sm text-gray-500">
                            <time dateTime={activity.createdAt.toISOString()}>
                              {format(activity.createdAt, 'MMM d, yyyy')}
                            </time>
                          </div>
                        </div>
                      </div>
                    </div>
                  </li>
                ))
              ) : (
                <p className="text-sm text-gray-500">No recent activities</p>
              )}
            </ul>
          </div>
        </Card>
      </div>
    </div>
  );
}

function UserActivityIcon({ activityType }: { activityType: string }) {
  switch (activityType) {
    case 'USER_CREATED':
      return <Users className="h-5 w-5 text-green-600" />;
    case 'USER_UPDATED':
      return <Users className="h-5 w-5 text-blue-600" />;
    case 'EVENT_CREATED':
      return <Calendar className="h-5 w-5 text-purple-600" />;
    case 'EVENT_UPDATED':
      return <Calendar className="h-5 w-5 text-yellow-600" />;
    case 'REGISTRATION_CREATED':
      return <CheckCircle className="h-5 w-5 text-indigo-600" />;
    default:
      return <BarChart className="h-5 w-5 text-gray-600" />;
  }
}
