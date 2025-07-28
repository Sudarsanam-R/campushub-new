'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Calendar, Clock, MapPin, Users } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useToast } from '@/hooks/use-toast';

type Event = {
  id: string;
  title: string;
  startDate: string;
  location: string;
  image?: string;
  status: 'upcoming' | 'past' | 'cancelled';
};

export function UserDashboard() {
  const { toast } = useToast();
  const [upcomingEvents, setUpcomingEvents] = useState<Event[]>([]);
  const [pastEvents, setPastEvents] = useState<Event[]>([]);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    fetchUserEvents();
  }, []);

  const fetchUserEvents = async () => {
    try {
      setLoading(true);
      const res = await fetch('/api/users/me/events');
      const data = await res.json();
      
      if (res.ok) {
        setUpcomingEvents(data.upcoming);
        setPastEvents(data.past);
      } else {
        throw new Error(data.message || 'Failed to fetch events');
      }
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to load your events',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  const handleCancelRegistration = async (eventId: string) => {
    try {
      const res = await fetch(`/api/events/${eventId}/register`, {
        method: 'DELETE',
      });

      if (res.ok) {
        toast({
          title: 'Success',
          description: 'Registration cancelled successfully',
        });
        fetchUserEvents();
      } else {
        const error = await res.json();
        throw new Error(error.message || 'Failed to cancel registration');
      }
    } catch (error) {
      toast({
        title: 'Error',
        description: error instanceof Error ? error.message : 'Something went wrong',
        variant: 'destructive',
      });
    }
  };

  if (loading) {
    return <div>Loading your events...</div>;
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold">My Dashboard</h1>
        <Button onClick={() => router.push('/events')}>
          Browse All Events
        </Button>
      </div>

      <Tabs defaultValue="upcoming" className="space-y-4">
        <TabsList>
          <TabsTrigger value="upcoming">Upcoming Events</TabsTrigger>
          <TabsTrigger value="past">Past Events</TabsTrigger>
        </TabsList>

        <TabsContent value="upcoming" className="space-y-4">
          {upcomingEvents.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {upcomingEvents.map((event) => (
                <Card key={event.id} className="overflow-hidden">
                  <div className="h-40 bg-muted" />
                  <CardHeader>
                    <CardTitle className="text-xl">{event.title}</CardTitle>
                    <div className="flex items-center text-sm text-muted-foreground">
                      <Calendar className="h-4 w-4 mr-2" />
                      {new Date(event.startDate).toLocaleDateString()}
                    </div>
                    <div className="flex items-center text-sm text-muted-foreground">
                      <MapPin className="h-4 w-4 mr-2" />
                      {event.location}
                    </div>
                  </CardHeader>
                  <CardContent>
                    <Button 
                      variant="outline" 
                      className="w-full"
                      onClick={() => handleCancelRegistration(event.id)}
                    >
                      Cancel Registration
                    </Button>
                  </CardContent>
                </Card>
              ))}
            </div>
          ) : (
            <div className="text-center py-12">
              <p className="text-muted-foreground">No upcoming events</p>
              <Button 
                className="mt-4" 
                onClick={() => router.push('/events')}
              >
                Browse Events
              </Button>
            </div>
          )}
        </TabsContent>

        <TabsContent value="past">
          {pastEvents.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {pastEvents.map((event) => (
                <Card key={event.id} className="overflow-hidden">
                  <div className="h-40 bg-muted" />
                  <CardHeader>
                    <CardTitle className="text-xl">{event.title}</CardTitle>
                    <div className="flex items-center text-sm text-muted-foreground">
                      <Calendar className="h-4 w-4 mr-2" />
                      {new Date(event.startDate).toLocaleDateString()}
                    </div>
                    <div className="flex items-center text-sm text-muted-foreground">
                      <MapPin className="h-4 w-4 mr-2" />
                      {event.location}
                    </div>
                  </CardHeader>
                </Card>
              ))}
            </div>
          ) : (
            <div className="text-center py-12">
              <p className="text-muted-foreground">No past events</p>
            </div>
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
}
