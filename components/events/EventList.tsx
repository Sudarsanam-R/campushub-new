'use client';

import React, { useState, useEffect, FormEvent } from 'react';
import { useRouter } from 'next/navigation';
import { format } from 'date-fns';
import { Search, Calendar, MapPin, Users, Filter, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { useToast } from '@/hooks/use-toast';

// Define TypeScript interfaces
export type Event = {
  id: string;
  title: string;
  description: string;
  startDate: string;
  endDate: string;
  location: string;
  capacity: number;
  registered: number;
  category: string;
  image?: string;
};


export function EventList() {
  const [events, setEvents] = useState<Event[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [searchQuery, setSearchQuery] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('all');
  const [dateFilter, setDateFilter] = useState('all');
  const [currentPage, setCurrentPage] = useState(1);
  const { toast } = useToast();
  const router = useRouter();

  const clearFilters = (): void => {
    setSearchQuery('');
    setCategoryFilter('all');
    setDateFilter('all');
    setCurrentPage(1);
  };

  const handleSearch = (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setCurrentPage(1); // Reset to first page on new search
  };

  useEffect(() => {
    fetchEvents();
  }, [page, search]);

  const fetchEvents = async () => {
    try {
      setLoading(true);
      const res = await fetch(`/api/events?page=${page}&search=${search}`);
      const data = await res.json();
      setEvents(data.events);
      setTotalPages(data.totalPages);
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to fetch events',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  const handleRegister = async (eventId: string) => {
    try {
      const res = await fetch(`/api/events/${eventId}/register`, {
        method: 'POST',
      });
      
      if (res.ok) {
        toast({
          title: 'Success',
          description: 'Successfully registered for the event!',
        });
        fetchEvents();
      }
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to register for event',
        variant: 'destructive',
      });
    }
  };

  if (loading) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {[...Array(6)].map((_, i) => (
          <Card key={i}>
            <Skeleton className="h-48 w-full rounded-t-lg" />
            <CardHeader>
              <Skeleton className="h-6 w-3/4" />
              <Skeleton className="h-4 w-1/2 mt-2" />
            </CardHeader>
            <CardContent>
              <Skeleton className="h-4 w-full mt-2" />
              <Skeleton className="h-4 w-2/3 mt-2" />
            </CardContent>
          </Card>
        ))}
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search events..."
            className="pl-10"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>
        <Button onClick={() => router.push('/events/new')}>Create Event</Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {events.map((event) => (
          <Card key={event.id} className="overflow-hidden">
            <div className="h-48 bg-muted" />
            <CardHeader>
              <div className="flex justify-between items-start">
                <CardTitle className="text-lg">{event.title}</CardTitle>
                <Badge variant="outline">{event.category}</Badge>
              </div>
              <div className="flex items-center text-sm text-muted-foreground">
                <Calendar className="h-4 w-4 mr-1" />
                {format(new Date(event.startDate), 'MMM d, yyyy')}
              </div>
              <div className="flex items-center text-sm text-muted-foreground">
                <MapPin className="h-4 w-4 mr-1" />
                {event.location}
              </div>
              <div className="flex items-center text-sm text-muted-foreground">
                <Users className="h-4 w-4 mr-1" />
                {event.registered}/{event.capacity} registered
              </div>
            </CardHeader>
            <CardContent>
              <Button 
                className="w-full"
                onClick={() => handleRegister(event.id)}
              >
                Register
              </Button>
            </CardContent>
          </Card>
        ))}
      </div>

      {totalPages > 1 && (
        <div className="flex justify-center gap-2">
          <Button 
            variant="outline" 
            disabled={page === 1}
            onClick={() => setPage(p => Math.max(1, p - 1))}
          >
            Previous
          </Button>
          <span className="flex items-center px-4">
            Page {page} of {totalPages}
          </span>
          <Button
            variant="outline"
            disabled={page >= totalPages}
            onClick={() => setPage(p => Math.min(totalPages, p + 1))}
          >
            Next
          </Button>
        </div>
      )}
    </div>
  );
}
