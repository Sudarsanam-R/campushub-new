"use client";

import React, { useEffect, useState } from "react";
import UnifiedSidebar from "@/components/custom_ui/UnifiedSidebar";
import Switch from "@/components/custom_ui/Switch";
import EventCard from "@/components/custom_ui/EventCard";

interface Event {
  id: string;
  name: string;
  fromDate: string;
  toDate: string;
  location?: string;
  description?: string;
  maxParticipants?: number;
  participantType?: string;
  registrationFee?: number;
  teamMembers?: number;
  food?: string;
  accommodation?: string;
  tags?: string[];
  imageSrc?: string;
  imageSrcLight?: string;
  imageSrcDark?: string;
}

export default function EventsPage() {
  // Demo events from homepage (now includes imageSrc and tags)
  const demoEvents: (Event & { imageSrc?: string; tags?: string[] })[] = [
    {
      id: 'demo-codefest',
      name: 'CodeFest 2025',
      fromDate: 'June 14, 2025',
      toDate: '',
      location: 'NIT Trichy',
      description: 'Workshops, coding rounds, and more at CodeFest 2025.',
      participantType: 'Coding',
      maxParticipants: undefined,
      registrationFee: undefined,
      teamMembers: undefined,
      food: undefined,
      accommodation: undefined,
      imageSrcLight: '/images/events/codefest-light.jpeg',
      imageSrcDark: '/images/events/codefest-dark.jpeg',
      tags: ['Coding', 'Tech Talk'],
    },
    {
      id: 'demo-techspark',
      name: 'TechSpark 2025',
      fromDate: 'July 1, 2025',
      toDate: '',
      location: 'IIT Bombay',
      description: 'A celebration of ideas, startups, and student entrepreneurship.',
      participantType: 'Startup',
      maxParticipants: undefined,
      registrationFee: undefined,
      teamMembers: undefined,
      food: undefined,
      accommodation: undefined,
      imageSrcLight: '/images/events/techspark-light.jpeg',
      imageSrcDark: '/images/events/techspark-dark.jpeg',
      tags: ['Startup', 'Innovation'],
    },
    {
      id: 'demo-aisummit',
      name: 'AI Summit 2025',
      fromDate: 'August 15, 2025',
      toDate: '',
      location: 'IIT Delhi',
      description: 'Explore the future of artificial intelligence and its applications.',
      participantType: 'AI',
      maxParticipants: undefined,
      registrationFee: undefined,
      teamMembers: undefined,
      food: undefined,
      accommodation: undefined,
      imageSrcLight: '/images/events/ai-summit-light.jpeg',
      imageSrcDark: '/images/events/ai-summit-dark.jpeg',
      tags: ['AI', 'Machine Learning'],
    },
  ];

  const [events, setEvents] = useState<Event[]>(demoEvents);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchEvents() {
      setLoading(true);
      try {
        const res = await fetch("/api/events");
        const data = await res.json();
        let apiEvents = data.events || [];
        // If no API events, show demo events (default)
        if (!apiEvents.length) {
          setEvents(demoEvents);
        } else {
          // Append demo events if not present by id
          const allEvents = [...apiEvents];
          demoEvents.forEach(demo => {
            if (!allEvents.some(e => e.id === demo.id)) {
              allEvents.push(demo);
            }
          });
          setEvents(allEvents);
        }
      } catch (err) {
        setEvents(demoEvents);
      } finally {
        setLoading(false);
      }
    }
    fetchEvents();
  }, []);

  return (
    <>
      <UnifiedSidebar />
      <main className="flex-1 flex flex-col items-center justify-center px-4 py-16 relative overflow-hidden min-h-screen">
        <div className="absolute top-4 right-4 z-10">
          <Switch />
        </div>
        <div className="w-full max-w-5xl bg-white/90 dark:bg-zinc-900/90 rounded-2xl shadow-[0_0_24px_3px_rgba(99,102,241,0.28)] p-8 mx-auto backdrop-blur-[3px]">
          <h2 className="text-3xl font-bold mb-8 text-indigo-700 dark:text-indigo-300 text-center">All Events</h2>
          {loading ? (
            <div className="text-center text-lg py-12">Loading events...</div>
          ) : events.length === 0 ? (
            <div className="text-center text-lg py-12 text-zinc-500 dark:text-zinc-400">No events found.</div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
              {events.map(event => (
                <EventCard
                  key={event.id}
                  event={{
                    title: event.name,
                    date: event.fromDate + (event.toDate ? ` - ${event.toDate}` : ""),
                    time: '',
                    location: event.location || '',
                    tags: [
                      ...(event.tags ?? []),
                      ...(event.participantType ? [event.participantType] : []),
                      ...(event.maxParticipants ? ["Max: " + event.maxParticipants] : []),
                      ...(event.registrationFee !== undefined ? ["Fee: ₹" + event.registrationFee] : []),
                      ...(event.teamMembers ? ["Team: " + event.teamMembers] : []),
                      ...(event.food ? ["Food: " + event.food] : []),
                      ...(event.accommodation ? ["Accommodation: " + event.accommodation] : []),
                    ],
                    description: event.description || '',
                    imageSrc: (event as any).imageSrc || undefined,
                  }}
                />
              ))}
            </div>
          )}
        </div>
      </main>
    </>
  );
}
