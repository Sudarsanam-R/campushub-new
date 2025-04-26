"use client";

import { useRouter } from "next/navigation";
import { useState, useEffect } from "react";

interface Event {
  id: string;
  name: string;
  fromDate: string;
  toDate: string;
  location?: string;
  description?: string;
  // ...other fields as needed
}

type RegisterPageProps = {
  params: {
    eventId: string;
  };
};

export default function RegisterPage({ params }: RegisterPageProps) {
  const { eventId } = params;
  const [event, setEvent] = useState<Event | null>(null);
  const [form, setForm] = useState({ name: "", email: "" });
  const [submitted, setSubmitted] = useState(false);

  // Simulate fetching event details (replace with real fetch if needed)
  useEffect(() => {
    // Ideally fetch from API or context
    // For now, just set dummy data
    setEvent({
      id: eventId,
      name: `Event ${eventId}`,
      fromDate: "2025-05-01",
      toDate: "2025-05-02",
      location: "Campus Hall",
      description: "Event description here."
    });
  }, [eventId]);

  function handleChange(e: React.ChangeEvent<HTMLInputElement>) {
    setForm({ ...form, [e.target.name]: e.target.value });
  }

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    // Submit logic here (API call, etc.)
    setSubmitted(true);
  }

  if (!event) return <div className="p-8">Loading event details...</div>;

  return (
    <div className="max-w-lg mx-auto my-10 bg-white dark:bg-zinc-900 p-8 rounded-lg shadow-lg">
      <h1 className="text-2xl font-bold mb-2 text-indigo-700 dark:text-indigo-300">Register for {event.name}</h1>
      <p className="text-zinc-600 dark:text-zinc-300 mb-1">{event.fromDate} to {event.toDate} | {event.location}</p>
      <p className="text-zinc-700 dark:text-zinc-200 mb-6">{event.description}</p>
      {submitted ? (
        <div className="text-green-600 font-semibold">Thank you for registering!</div>
      ) : (
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block mb-1 font-medium">Name</label>
            <input type="text" name="name" value={form.name} onChange={handleChange} required className="w-full px-3 py-2 border rounded" />
          </div>
          <div>
            <label className="block mb-1 font-medium">Email</label>
            <input type="email" name="email" value={form.email} onChange={handleChange} required className="w-full px-3 py-2 border rounded" />
          </div>
          <button type="submit" className="w-full py-2 bg-indigo-600 hover:bg-indigo-500 text-white font-semibold rounded">Register</button>
        </form>
      )}
    </div>
  );
}
