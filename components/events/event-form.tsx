'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { zodResolver } from '@hookform/resolvers/zod';
import { useForm } from 'react-hook-form';
import * as z from 'zod';
import { format } from 'date-fns';
import { CalendarIcon, Loader2 } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Checkbox } from '@/components/ui/checkbox';
import { Label } from '@/components/ui/label';
import { toast } from '@/components/ui/use-toast';
import { Event, EventStatus } from '@prisma/client';

// Form validation schema
const eventFormSchema = z.object({
  title: z.string().min(2, {
    message: 'Title must be at least 2 characters.',
  }),
  description: z.string().min(10, {
    message: 'Description must be at least 10 characters.',
  }),
  location: z.string().min(2, {
    message: 'Location is required.',
  }),
  startDate: z.date({
    required_error: 'Start date is required.',
  }),
  endDate: z.date({
    required_error: 'End date is required.',
  }),
  registrationDeadline: z.date().optional().nullable(),
  capacity: z.coerce.number().int().positive().optional().nullable(),
  isPublic: z.boolean().default(true),
  status: z.nativeEnum(EventStatus).default(EventStatus.DRAFT),
  imageUrl: z.string().url().optional().or(z.literal('')),
  categoryId: z.string().optional().nullable(),
  tags: z.array(z.string()).optional(),
});

type EventFormValues = z.infer<typeof eventFormSchema>;

interface EventFormProps {
  event?: Event & {
    tags?: { id: string; name: string }[];
  };
  categories: { id: string; name: string }[];
  tags: { id: string; name: string }[];
  isNew?: boolean;
}

export function EventForm({ event, categories, tags, isNew = false }: EventFormProps) {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);
  const [date, setDate] = useState<{
    startDate?: Date;
    endDate?: Date;
    registrationDeadline?: Date | null;
  }>({
    startDate: event?.startDate ? new Date(event.startDate) : undefined,
    endDate: event?.endDate ? new Date(event.endDate) : undefined,
    registrationDeadline: event?.registrationDeadline ? new Date(event.registrationDeadline) : null,
  });

  const defaultValues = {
    title: event?.title || '',
    description: event?.description || '',
    location: event?.location || '',
    startDate: event?.startDate ? new Date(event.startDate) : new Date(),
    endDate: event?.endDate ? new Date(event.endDate) : new Date(),
    registrationDeadline: event?.registrationDeadline ? new Date(event.registrationDeadline) : null,
    capacity: event?.capacity || null,
    isPublic: event?.isPublic ?? true,
    status: event?.status || EventStatus.DRAFT,
    imageUrl: event?.imageUrl || '',
    categoryId: event?.categoryId || null,
    tags: event?.tags?.map((tag) => tag.id) || [],
  };

  const form = useForm<EventFormValues>({
    resolver: zodResolver(eventFormSchema),
    defaultValues,
    mode: 'onChange',
  });

  // Update form values when event prop changes
  useEffect(() => {
    if (event) {
      form.reset({
        title: event.title,
        description: event.description,
        location: event.location,
        startDate: new Date(event.startDate),
        endDate: new Date(event.endDate),
        registrationDeadline: event.registrationDeadline ? new Date(event.registrationDeadline) : null,
        capacity: event.capacity || null,
        isPublic: event.isPublic,
        status: event.status,
        imageUrl: event.imageUrl || '',
        categoryId: event.categoryId || null,
        tags: event.tags?.map((tag) => tag.id) || [],
      });
      
      setDate({
        startDate: new Date(event.startDate),
        endDate: new Date(event.endDate),
        registrationDeadline: event.registrationDeadline ? new Date(event.registrationDeadline) : null,
      });
    }
  }, [event, form]);

  const onSubmit = async (data: EventFormValues) => {
    setIsLoading(true);
    
    try {
      const url = isNew ? '/api/events' : `/api/events/${event?.id}`;
      const method = isNew ? 'POST' : 'PATCH';
      
      const response = await fetch(url, {
        method,
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          ...data,
          startDate: data.startDate.toISOString(),
          endDate: data.endDate.toISOString(),
          registrationDeadline: data.registrationDeadline?.toISOString() || null,
        }),
      });
      
      const result = await response.json();
      
      if (!response.ok) {
        throw new Error(result.message || 'Something went wrong');
      }
      
      toast({
        title: isNew ? 'Event created!' : 'Event updated!',
        description: isNew 
          ? 'Your event has been created successfully.'
          : 'Your event has been updated successfully.',
      });
      
      // Redirect to event page or events list
      if (isNew) {
        router.push(`/admin/events/${result.data.id}`);
      } else {
        router.refresh();
      }
    } catch (error) {
      console.error('Error saving event:', error);
      toast({
        title: 'Error',
        description: error instanceof Error ? error.message : 'Failed to save event',
        variant: 'destructive',
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
      <div className="space-y-8">
        {/* Basic Information */}
        <div className="space-y-6">
          <div>
            <h3 className="text-lg font-medium">Basic Information</h3>
            <p className="text-sm text-muted-foreground">
              Basic details about your event.
            </p>
          </div>
          
          <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="title">Event Title *</Label>
              <Input
                id="title"
                placeholder="Enter event title"
                {...form.register('title')}
                error={form.formState.errors.title?.message}
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="location">Location *</Label>
              <Input
                id="location"
                placeholder="Enter event location"
                {...form.register('location')}
                error={form.formState.errors.location?.message}
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="startDate">Start Date & Time *</Label>
              <div className="relative">
                <Input
                  id="startDate"
                  type="datetime-local"
                  value={date.startDate ? format(date.startDate, "yyyy-MM-dd'T'HH:mm") : ''}
                  onChange={(e) => {
                    const newDate = e.target.value ? new Date(e.target.value) : new Date();
                    setDate(prev => ({
                      ...prev,
                      startDate: newDate,
                    }));
                    form.setValue('startDate', newDate);
                  }}
                  error={form.formState.errors.startDate?.message}
                />
              </div>
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="endDate">End Date & Time *</Label>
              <div className="relative">
                <Input
                  id="endDate"
                  type="datetime-local"
                  value={date.endDate ? format(date.endDate, "yyyy-MM-dd'T'HH:mm") : ''}
                  min={date.startDate ? format(date.startDate, "yyyy-MM-dd'T'HH:mm") : ''}
                  onChange={(e) => {
                    const newDate = e.target.value ? new Date(e.target.value) : new Date();
                    setDate(prev => ({
                      ...prev,
                      endDate: newDate,
                    }));
                    form.setValue('endDate', newDate);
                  }}
                  error={form.formState.errors.endDate?.message}
                />
              </div>
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="registrationDeadline">Registration Deadline</Label>
              <div className="relative">
                <Input
                  id="registrationDeadline"
                  type="datetime-local"
                  value={date.registrationDeadline ? format(date.registrationDeadline, "yyyy-MM-dd'T'HH:mm") : ''}
                  max={date.startDate ? format(date.startDate, "yyyy-MM-dd'T'HH:mm") : ''}
                  onChange={(e) => {
                    const newDate = e.target.value ? new Date(e.target.value) : null;
                    setDate(prev => ({
                      ...prev,
                      registrationDeadline: newDate,
                    }));
                    form.setValue('registrationDeadline', newDate);
                  }}
                  error={form.formState.errors.registrationDeadline?.message}
                />
              </div>
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="capacity">Capacity (leave empty for unlimited)</Label>
              <Input
                id="capacity"
                type="number"
                min="1"
                placeholder="Enter maximum attendees"
                {...form.register('capacity', { valueAsNumber: true })}
                error={form.formState.errors.capacity?.message}
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="categoryId">Category</Label>
              <select
                id="categoryId"
                className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                {...form.register('categoryId')}
              >
                <option value="">Select a category</option>
                {categories.map((category) => (
                  <option key={category.id} value={category.id}>
                    {category.name}
                  </option>
                ))}
              </select>
              {form.formState.errors.categoryId && (
                <p className="text-sm font-medium text-destructive">
                  {form.formState.errors.categoryId.message}
                </p>
              )}
            </div>
            
            <div className="space-y-2">
              <Label>Tags</Label>
              <div className="flex flex-wrap gap-2">
                {tags.map((tag) => (
                  <div key={tag.id} className="flex items-center space-x-2">
                    <Checkbox
                      id={`tag-${tag.id}`}
                      checked={form.watch('tags')?.includes(tag.id) || false}
                      onCheckedChange={(checked) => {
                        const currentTags = form.getValues('tags') || [];
                        const newTags = checked
                          ? [...currentTags, tag.id]
                          : currentTags.filter((id) => id !== tag.id);
                        form.setValue('tags', newTags);
                      }}
                    />
                    <Label htmlFor={`tag-${tag.id}`} className="text-sm font-normal">
                      {tag.name}
                    </Label>
                  </div>
                ))}
              </div>
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="imageUrl">Image URL</Label>
              <Input
                id="imageUrl"
                type="url"
                placeholder="https://example.com/image.jpg"
                {...form.register('imageUrl')}
                error={form.formState.errors.imageUrl?.message}
              />
            </div>
            
            <div className="space-y-2">
              <Label>Visibility</Label>
              <div className="flex items-center space-x-2">
                <Checkbox
                  id="isPublic"
                  checked={form.watch('isPublic')}
                  onCheckedChange={(checked) =>
                    form.setValue('isPublic', checked as boolean)
                  }
                />
                <Label htmlFor="isPublic" className="text-sm font-normal">
                  Make this event public
                </Label>
              </div>
            </div>
            
            {!isNew && (
              <div className="space-y-2">
                <Label htmlFor="status">Status</Label>
                <select
                  id="status"
                  className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                  {...form.register('status')}
                >
                  {Object.values(EventStatus).map((status) => (
                    <option key={status} value={status}>
                      {status}
                    </option>
                  ))}
                </select>
              </div>
            )}
          </div>
        </div>
        
        {/* Description */}
        <div className="space-y-6">
          <div>
            <h3 className="text-lg font-medium">Description</h3>
            <p className="text-sm text-muted-foreground">
              Provide a detailed description of your event.
            </p>
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="description">Event Description *</Label>
            <Textarea
              id="description"
              placeholder="Enter event description"
              className="min-h-[200px]"
              {...form.register('description')}
              error={form.formState.errors.description?.message}
            />
            <p className="text-sm text-muted-foreground">
              Markdown is supported.
            </p>
          </div>
        </div>
      </div>
      
      <div className="flex justify-end space-x-4">
        <Button
          type="button"
          variant="outline"
          onClick={() => router.back()}
          disabled={isLoading}
        >
          Cancel
        </Button>
        <Button type="submit" disabled={isLoading}>
          {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
          {isNew ? 'Create Event' : 'Update Event'}
        </Button>
      </div>
    </form>
  );
}
