"use client";
import React, { useEffect, useState } from "react";
import UnifiedSidebar from "@/components/custom_ui/UnifiedSidebar";
import Switch from "@/components/custom_ui/Switch";
import Calendar from 'react-calendar';
import 'react-calendar/dist/Calendar.css';
import '@/styles/calendar-modern.css';

interface RegisteredEvent {
  id: string;
  name: string;
  date: string;
  location: string;
  status: string;
}

export default function RegisteredEventsPage() {
  const [events, setEvents] = useState<RegisteredEvent[]>([]);
  const [loading, setLoading] = useState(true);

  // Demo events fallback
  const demoEvents: RegisteredEvent[] = [
    {
      id: 'demo1',
      name: 'Demo Registered Event',
      date: '2025-05-15',
      location: 'Virtual',
      status: 'upcoming',
    },
    {
      id: 'demo2',
      name: 'Demo Workshop Registered',
      date: '2025-06-10',
      location: 'Campus Auditorium',
      status: 'completed',
    },
  ];

  useEffect(() => {
    // Replace with your actual API endpoint
    async function fetchEvents() {
      setLoading(true);
      try {
        const res = await fetch("/api/registered-events");
        if (res.ok) {
          const data = await res.json();
          if (Array.isArray(data.events) && data.events.length > 0) {
            setEvents(data.events);
          } else {
            setEvents(demoEvents);
          }
        } else {
          setEvents(demoEvents);
        }
      } catch (err) {
        setEvents(demoEvents);
      } finally {
        setLoading(false);
      }
    }
    fetchEvents();
  }, []);

  // Calendar state
  // Calendar state (single date selection only)
  const [selectedDate, setSelectedDate] = useState<Date | null>(null);
  // Get all event dates
  const eventDates = events.map(e => new Date(e.date));
  // Map date string to event name(s)
  const eventsByDate = events.reduce((acc: Record<string, string[]>, event) => {
    acc[event.date] = acc[event.date] || [];
    acc[event.date].push(event.name);
    return acc;
  }, {});

  return (
    <div className="min-h-screen flex bg-white dark:bg-zinc-950 text-zinc-900 dark:text-white transition">
      <UnifiedSidebar />
      <main className="flex-1 flex flex-col items-center justify-center px-4 py-16 relative overflow-hidden min-h-screen">
        <div className="absolute top-4 right-4 z-10"><Switch /></div>
        <div className="w-full max-w-3xl bg-white/90 dark:bg-zinc-900/90 rounded-2xl shadow-[0_0_24px_3px_rgba(99,102,241,0.28)] p-8 mx-auto backdrop-blur-[3px]">
          <h2 className="text-2xl font-bold mb-6 text-indigo-700 dark:text-indigo-300">My Registered Events</h2>

          {/* Virtual Calendar */}
          <div className="mb-8">
            {/* @ts-ignore: Value typing from react-calendar */}
            <Calendar
              onChange={(value) => setSelectedDate(value as Date | null)}
              value={selectedDate}
              tileClassName={({ date }) =>
                eventDates.some(d => d.toDateString() === date.toDateString())
                  ? 'bg-indigo-200 dark:bg-indigo-800 text-indigo-800 dark:text-indigo-100 font-bold rounded-full' : ''
              }
              tileContent={({ date }) =>
                eventsByDate[date.toISOString().slice(0, 10)] ? (
                  <div className="text-xs mt-1 text-indigo-600 dark:text-indigo-300">
                    {eventsByDate[date.toISOString().slice(0, 10)].map((name, idx) => (
                      <div key={idx}>{name}</div>
                    ))}
                  </div>
                ) : null
              }
              className="w-full max-w-md mx-auto border-0 shadow-none rounded-xl"
              calendarType="gregory"
              selectRange={false}
            />
          </div>

          {loading ? (
            <div className="text-center text-lg py-12">Loading events...</div>
          ) : events.length === 0 ? (
            <div className="text-center text-lg py-12 text-zinc-500">You have not registered for any events.</div>
          ) : (
            <ul className="divide-y divide-zinc-200 dark:divide-zinc-800">
              {events.map(event => (
                <li key={event.id} className="py-5 flex flex-col md:flex-row md:items-center md:justify-between gap-3">
                  <div>
                    <div className="font-semibold text-lg text-indigo-700 dark:text-indigo-300">{event.name}</div>
                    <div className="text-sm text-zinc-500 dark:text-zinc-400">{event.date} &bull; {event.location}</div>
                  </div>
                  <span className={`inline-block px-3 py-1 rounded-full text-xs font-bold ${event.status === 'upcoming' ? 'bg-indigo-100 text-indigo-700 dark:bg-indigo-900/40 dark:text-indigo-300' : 'bg-zinc-200 text-zinc-700 dark:bg-zinc-800 dark:text-zinc-200'}`}>
                    {event.status.charAt(0).toUpperCase() + event.status.slice(1)}
                  </span>
                </li>
              ))}
            </ul>
          )}
        </div>
      </main>
    </div>
  );
}
