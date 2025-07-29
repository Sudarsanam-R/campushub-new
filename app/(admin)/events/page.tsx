'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Event, EventStatus } from '@prisma/client';
import { Button } from '@/components/ui/button';
import { DataTable } from '@/components/ui/data-table';
import { ColumnDef } from '@tanstack/react-table';
import { Badge } from '@/components/ui/badge';
import { format } from 'date-fns';
import { toast } from 'sonner';
import { Calendar, Plus, Edit, Trash2, Eye, SlidersHorizontal } from 'lucide-react';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { MoreHorizontal } from 'lucide-react';

// Extend the Event type to include the organizer relation
type EventWithOrganizer = Event & {
  organizer: {
    id: string;
    firstName: string;
    lastName: string;
    email: string;
  };
  _count: {
    registrations: number;
  };
};

export default function EventsPage() {
  const router = useRouter();
  const [events, setEvents] = useState<EventWithOrganizer[]>([]);
  const [loading, setLoading] = useState(true);

  // Fetch events from the API
  const fetchEvents = async () => {
    try {
      setLoading(true);
      const response = await fetch('/api/events?include=organizer,registrations');
      const data = await response.json();
      
      if (response.ok) {
        setEvents(data.data);
      } else {
        throw new Error(data.message || 'Failed to fetch events');
      }
    } catch (error) {
      console.error('Error fetching events:', error);
      toast.error('Failed to load events. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  // Delete an event
  const handleDeleteEvent = async (eventId: string) => {
    if (!confirm('Are you sure you want to delete this event? This action cannot be undone.')) {
      return;
    }

    try {
      const response = await fetch(`/api/events/${eventId}`, {
        method: 'DELETE',
      });
      
      const data = await response.json();
      
      if (response.ok) {
        toast.success('Event deleted successfully');
        fetchEvents(); // Refresh the events list
      } else {
        throw new Error(data.message || 'Failed to delete event');
      }
    } catch (error) {
      console.error('Error deleting event:', error);
      toast.error('Failed to delete event. Please try again.');
    }
  };

  // Update event status
  const updateEventStatus = async (eventId: string, status: EventStatus) => {
    try {
      const response = await fetch(`/api/events/${eventId}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ status }),
      });
      
      const data = await response.json();
      
      if (response.ok) {
        toast.success(`Event ${status.toLowerCase()}`);
        fetchEvents(); // Refresh the events list
      } else {
        throw new Error(data.message || 'Failed to update event status');
      }
    } catch (error) {
      console.error('Error updating event status:', error);
      toast.error('Failed to update event status. Please try again.');
    }
  };

  // Fetch events on component mount
  useEffect(() => {
    fetchEvents();
  }, []);

  // Define table columns
  const columns: ColumnDef<EventWithOrganizer>[] = [
    {
      accessorKey: 'title',
      header: 'Event',
      cell: ({ row }) => {
        const event = row.original;
        return (
          <div className="flex items-center space-x-3">
            <div className="flex-shrink-0 h-10 w-10 rounded-md bg-indigo-100 flex items-center justify-center">
              <Calendar className="h-5 w-5 text-indigo-600" />
            </div>
            <div>
              <div className="font-medium text-gray-900">{event.title}</div>
              <div className="text-sm text-gray-500">{event.location}</div>
            </div>
          </div>
        );
      },
    },
    {
      accessorKey: 'date',
      header: 'Date & Time',
      cell: ({ row }) => {
        const event = row.original;
        return (
          <div className="text-sm">
            <div>{format(new Date(event.startDate), 'MMM d, yyyy')}</div>
            <div className="text-gray-500">
              {format(new Date(event.startDate), 'h:mm a')} - {format(new Date(event.endDate), 'h:mm a')}
            </div>
          </div>
        );
      },
    },
    {
      accessorKey: 'organizer',
      header: 'Organizer',
      cell: ({ row }) => {
        const event = row.original;
        return (
          <div className="text-sm">
            <div className="font-medium">
              {event.organizer.firstName} {event.organizer.lastName}
            </div>
            <div className="text-gray-500">{event.organizer.email}</div>
          </div>
        );
      },
    },
    {
      accessorKey: 'registrations',
      header: 'Registrations',
      cell: ({ row }) => {
        const event = row.original;
        return (
          <div className="text-sm">
            <div className="font-medium">{event._count.registrations} / {event.capacity || '∞'}</div>
            <div className="text-gray-500">
              {event.registrationDeadline && (
                <span>Deadline: {format(new Date(event.registrationDeadline), 'MMM d, yyyy')}</span>
              )}
            </div>
          </div>
        );
      },
    },
    {
      accessorKey: 'status',
      header: 'Status',
      cell: ({ row }) => {
        const status = row.original.status;
        const statusVariant = {
          [EventStatus.DRAFT]: 'bg-gray-100 text-gray-800',
          [EventStatus.PUBLISHED]: 'bg-green-100 text-green-800',
          [EventStatus.CANCELLED]: 'bg-red-100 text-red-800',
          [EventStatus.COMPLETED]: 'bg-blue-100 text-blue-800',
        }[status] || 'bg-gray-100 text-gray-800';
        
        return (
          <Badge className={statusVariant}>
            {status}
          </Badge>
        );
      },
      filterFn: (row, id, value) => {
        return value.includes(row.getValue(id));
      },
    },
    {
      id: 'actions',
      cell: ({ row }) => {
        const event = row.original;
        const canPublish = event.status === EventStatus.DRAFT;
        const canCancel = [EventStatus.PUBLISHED, EventStatus.DRAFT].includes(event.status);
        const canComplete = event.status === EventStatus.PUBLISHED && new Date(event.endDate) < new Date();

        return (
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" className="h-8 w-8 p-0">
                <span className="sr-only">Open menu</span>
                <MoreHorizontal className="h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuLabel>Actions</DropdownMenuLabel>
              <DropdownMenuItem
                onClick={() => router.push(`/events/${event.id}`)}
                className="cursor-pointer"
              >
                <Eye className="mr-2 h-4 w-4" />
                View
              </DropdownMenuItem>
              <DropdownMenuItem
                onClick={() => router.push(`/admin/events/${event.id}/edit`)}
                className="cursor-pointer"
              >
                <Edit className="mr-2 h-4 w-4" />
                Edit
              </DropdownMenuItem>
              <DropdownMenuItem
                onClick={() => router.push(`/admin/events/${event.id}/registrations`)}
                className="cursor-pointer"
              >
                <SlidersHorizontal className="mr-2 h-4 w-4" />
                Manage Registrations
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              {canPublish && (
                <DropdownMenuItem
                  onClick={() => updateEventStatus(event.id, EventStatus.PUBLISHED)}
                  className="cursor-pointer text-green-600"
                >
                  Publish
                </DropdownMenuItem>
              )}
              {canCancel && (
                <DropdownMenuItem
                  onClick={() => updateEventStatus(event.id, EventStatus.CANCELLED)}
                  className="cursor-pointer text-yellow-600"
                >
                  Cancel
                </DropdownMenuItem>
              )}
              {canComplete && (
                <DropdownMenuItem
                  onClick={() => updateEventStatus(event.id, EventStatus.COMPLETED)}
                  className="cursor-pointer text-blue-600"
                >
                  Mark as Completed
                </DropdownMenuItem>
              )}
              <DropdownMenuSeparator />
              <DropdownMenuItem
                onClick={() => handleDeleteEvent(event.id)}
                className="cursor-pointer text-red-600"
              >
                <Trash2 className="mr-2 h-4 w-4" />
                Delete
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        );
      },
    },
  ];

  // Status options for filter
  const statusOptions = Object.values(EventStatus).map((status) => ({
    label: status,
    value: status,
  }));

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold tracking-tight">Manage Events</h2>
          <p className="text-muted-foreground">
            View and manage all events in the system
          </p>
        </div>
        <Button onClick={() => router.push('/admin/events/new')}>
          <Plus className="mr-2 h-4 w-4" />
          Create Event
        </Button>
      </div>

      <div className="rounded-md border bg-white">
        <DataTable
          columns={columns}
          data={events}
          searchKey="title"
          filterOptions={[
            {
              columnId: 'status',
              title: 'Status',
              options: statusOptions,
            },
          ]}
          loading={loading}
          onRowClick={(event) => router.push(`/admin/events/${event.id}`)}
        />
      </div>
    </div>
  );
}
