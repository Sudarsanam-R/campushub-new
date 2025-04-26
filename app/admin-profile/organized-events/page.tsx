"use client";

import React, { useEffect, useState } from "react";
import UnifiedSidebar from "@/components/custom_ui/UnifiedSidebar";
import Switch from "@/components/custom_ui/Switch";
import EventCard from "@/components/custom_ui/EventCard";

interface OrganizedEvent {
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

export default function OrganizedEventsPage() {
  const [events, setEvents] = useState<OrganizedEvent[]>([]);
  const [loading, setLoading] = useState(true);

  // Demo events fallback
  const demoEvents: OrganizedEvent[] = [
    {
      id: 'demo1',
      name: 'Demo Hackathon',
      fromDate: '2025-05-10',
      toDate: '2025-05-11',
      location: 'Online',
      description: 'A fun demo hackathon for testing.',
      maxParticipants: 100,
      participantType: 'Team',
      registrationFee: 0,
      teamMembers: 4,
      food: 'Snacks',
      accommodation: 'None',
      tags: ['Demo', 'Hackathon'],
      imageSrcLight: '/images/events/demo-hackathon.jpeg',
      imageSrcDark: '/images/events/demo-hackathon.jpeg',
    },
    {
      id: 'demo2',
      name: 'Demo Workshop',
      fromDate: '2025-06-01',
      toDate: '2025-06-01',
      location: 'Campus Hall',
      description: 'A demo workshop for students.',
      maxParticipants: 50,
      participantType: 'Individual',
      registrationFee: 50,
      teamMembers: 1,
      food: 'Lunch',
      accommodation: 'None',
      tags: ['Demo', 'Workshop'],
      imageSrcLight: '/images/events/demo-workshop.jpeg',
      imageSrcDark: '/images/events/demo-workshop.jpeg',
    },
  ];

  useEffect(() => {
    async function fetchOrganizedEvents() {
      setLoading(true);
      try {
        // Replace with your actual API endpoint for admin-organized events
        const res = await fetch("/api/organized-events");
        const data = await res.json();
        if (Array.isArray(data.events) && data.events.length > 0) {
          setEvents(data.events);
        } else {
          setEvents(demoEvents);
        }
      } catch (err) {
        setEvents(demoEvents);
      } finally {
        setLoading(false);
      }
    }
    fetchOrganizedEvents();
  }, []);

  return (
    <>
      <UnifiedSidebar />
      <main className="flex-1 flex flex-col items-center justify-center px-4 py-16 relative overflow-hidden min-h-screen">
        <div className="absolute top-4 right-4 z-10">
          <Switch />
        </div>
        <div className="w-full max-w-5xl bg-white/90 dark:bg-zinc-900/90 rounded-2xl shadow-[0_0_24px_3px_rgba(99,102,241,0.28)] p-8 mx-auto backdrop-blur-[3px] relative">
          {/* New Event Button */}
          <div className="absolute right-8 top-8">
            <a
              href="/admin-profile/new-event"
              className="inline-block rounded-full bg-indigo-600 hover:bg-indigo-500 text-white px-6 py-2 font-semibold shadow-lg shadow-indigo-500/20 hover:shadow-indigo-500/40 transition-all text-base"
            >
              + New Event
            </a>
          </div>
          <h2 className="text-3xl font-bold mb-8 text-indigo-700 dark:text-indigo-300 text-center">Organized Events</h2>
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
                    imageSrc: event.imageSrc || undefined,
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
