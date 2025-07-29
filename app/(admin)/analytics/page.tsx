'use client';

import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { format } from 'date-fns';
import { RefreshCw } from 'lucide-react';

import { useAnalytics } from '@/hooks/use-analytics';
import { StatCard, StatCardGrid } from '@/components/admin/stat-card';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';

export default function AnalyticsPage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const { data, loading, refetch } = useAnalytics();

  // Redirect if not authenticated or not an admin
  if (status === 'unauthenticated') {
    router.push('/login');
    return null;
  }

  if (status === 'authenticated' && !['ADMIN', 'SUPER_ADMIN'].includes(session?.user?.role)) {
    router.push('/');
    return null;
  }

  const handleRefresh = () => {
    refetch();
  };

  if (loading && !data) {
    return (
      <div className="container mx-auto p-6">
        <div className="flex items-center justify-center min-h-[60vh]">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto p-4 space-y-6">
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Analytics Dashboard</h1>
          <p className="text-muted-foreground">Overview of platform metrics and statistics</p>
        </div>
        <Button
          variant="outline"
          size="sm"
          onClick={handleRefresh}
          disabled={loading}
        >
          <RefreshCw className={`mr-2 h-4 w-4 ${loading ? 'animate-spin' : ''}`} />
          Refresh
        </Button>
      </div>

      <StatCardGrid>
        <StatCard
          title="Total Users"
          value={loading ? '--' : data?.users?.total?.toLocaleString() || '0'}
          icon="users"
          description={`${data?.users?.newToday || 0} new today`}
          loading={loading}
        />
        <StatCard
          title="Total Events"
          value={loading ? '--' : data?.events?.total?.toLocaleString() || '0'}
          icon="events"
          description={`${data?.events?.active || 0} active`}
          loading={loading}
        />
        <StatCard
          title="Total Registrations"
          value={loading ? '--' : data?.registrations?.total?.toLocaleString() || '0'}
          icon="registrations"
          description={`${data?.registrations?.confirmed || 0} confirmed`}
          loading={loading}
        />
        <StatCard
          title="Registration Rate"
          value={loading ? '--' : `${data?.registrations?.registrationRate || 0}%`}
          icon="confirmed"
          description={`${data?.registrations?.attendanceRate || 0}% attendance`}
          loading={loading}
        />
      </StatCardGrid>

      <div className="grid gap-6 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>User Statistics</CardTitle>
          </CardHeader>
          <CardContent>
            {loading ? (
              <Skeleton className="h-64 w-full" />
            ) : (
              <div className="space-y-4">
                {data?.users?.byRole?.map((role) => (
                  <div key={role.role} className="flex items-center justify-between">
                    <span className="capitalize">{role.role.toLowerCase().replace('_', ' ')}</span>
                    <span className="font-medium">{role.count}</span>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Event Statistics</CardTitle>
          </CardHeader>
          <CardContent>
            {loading ? (
              <Skeleton className="h-64 w-full" />
            ) : (
              <div className="space-y-4">
                {data?.events?.byStatus?.map((status) => (
                  <div key={status.status} className="flex items-center justify-between">
                    <span className="capitalize">{status.status.toLowerCase()}</span>
                    <span className="font-medium">{status.count}</span>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Recent Activity</CardTitle>
        </CardHeader>
        <CardContent>
          {loading ? (
            <Skeleton className="h-32 w-full" />
          ) : (
            <div className="space-y-4">
              {data?.registrations?.recent?.map((reg) => (
                <div key={reg.id} className="flex items-center justify-between p-3 border rounded-lg">
                  <div>
                    <div className="font-medium">{reg.user.name}</div>
                    <div className="text-sm text-muted-foreground">
                      Registered for {reg.event.title}
                    </div>
                  </div>
                  <div className="text-sm text-muted-foreground">
                    {format(new Date(reg.registrationDate), 'MMM d, yyyy')}
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
