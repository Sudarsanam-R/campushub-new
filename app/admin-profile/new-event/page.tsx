"use client";
import React, { useEffect, useState } from "react";
import UnifiedSidebar from "@/components/custom_ui/UnifiedSidebar";
import Switch from "@/components/custom_ui/Switch";

interface RegisteredEvent {
  id: string;
  name: string;
  date: string;
  location: string;
  status: string;
}

export default function NewEventPage() {
  const [form, setForm] = useState({
    name: "",
    fromDate: "",
    toDate: "",
    maxParticipants: "",
    participantType: "solo",
    teamMembers: "",
    registrationFee: "",
    accommodation: "",
    food: "",
    brochures: [],
    description: ""
  });
  const [brochureFiles, setBrochureFiles] = useState<File[]>([]);
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState("");

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleRadioChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setForm({ ...form, participantType: e.target.value });
    if (e.target.value === "solo") {
      setForm(f => ({ ...f, teamMembers: "" }));
    }
  };

  const handleBrochureChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      setBrochureFiles(Array.from(e.target.files));
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (brochureFiles.length < 1) {
      setError("Please upload at least one brochure or notice.");
      return;
    }
    setLoading(true);
    setError("");
    setSuccess(false);
    try {
      // Prepare form data for file upload
      const formData = new FormData();
      formData.append("name", form.name);
      formData.append("fromDate", form.fromDate);
      formData.append("toDate", form.toDate);

      formData.append("maxParticipants", form.maxParticipants);
      formData.append("participantType", form.participantType);
      if (form.participantType === "team") {
        formData.append("teamMembers", form.teamMembers);
      }
      formData.append("registrationFee", form.registrationFee);
      formData.append("accommodation", form.accommodation);
      formData.append("food", form.food);
      formData.append("description", form.description);
      brochureFiles.forEach((file, idx) => {
        formData.append("brochures", file);
      });
      // Replace with your actual API endpoint
      const res = await fetch("/api/events", {
        method: "POST",
        body: formData,
      });
      if (res.ok) {
        setSuccess(true);
        setForm({
          name: "",
          fromDate: "",
          toDate: "",
          maxParticipants: "",
          participantType: "solo",
          teamMembers: "",
          registrationFee: "",
          accommodation: "",
          food: "",
          brochures: [],
          description: ""
        });
        setBrochureFiles([]);
      } else {
        setError("Failed to create event. Please try again.");
      }
    } catch {
      setError("Something went wrong. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex bg-white dark:bg-zinc-950 text-zinc-900 dark:text-white transition">
      <UnifiedSidebar />
      <main className="flex-1 flex flex-col items-center justify-center px-4 py-16 relative overflow-hidden min-h-screen">
        <div className="absolute top-4 right-4 z-10"><Switch /></div>
        <div className="w-full max-w-2xl bg-white/90 dark:bg-zinc-900/90 rounded-2xl shadow-[0_0_24px_3px_rgba(99,102,241,0.28)] p-8 mx-auto backdrop-blur-[3px]">
          <h2 className="text-2xl font-bold mb-6 text-indigo-700 dark:text-indigo-300">Add New Event</h2>
          <form className="space-y-6" onSubmit={handleSubmit}>
            <div>
              <label className="block mb-1 font-medium">Event Name</label>
              <input
                type="text"
                name="name"
                className="w-full px-4 py-3 text-zinc-900 dark:text-white bg-white dark:bg-zinc-800 border border-zinc-300 dark:border-zinc-700 rounded-full focus:outline-none focus:ring-2 focus:ring-indigo-500"
                value={form.name}
                onChange={handleChange}
                required
              />
            </div>
            <div className="flex gap-4">
              <div className="flex-1">
                <label className="block mb-1 font-medium">From Date</label>
                <input
                  type="date"
                  name="fromDate"
                  className="w-full px-4 py-3 text-zinc-900 dark:text-white bg-white dark:bg-zinc-800 border border-zinc-300 dark:border-zinc-700 rounded-full focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  value={form.fromDate}
                  onChange={handleChange}
                  required
                />
              </div>
              <div className="flex-1">
                <label className="block mb-1 font-medium">To Date</label>
                <input
                  type="date"
                  name="toDate"
                  className="w-full px-4 py-3 text-zinc-900 dark:text-white bg-white dark:bg-zinc-800 border border-zinc-300 dark:border-zinc-700 rounded-full focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  value={form.toDate}
                  onChange={handleChange}
                  required
                />
              </div>
            </div>

            <div className="flex gap-4">
              <div className="flex-1">
                <label className="block mb-1 font-medium">Max Participants</label>
                <input
                  type="number"
                  name="maxParticipants"
                  min="1"
                  className="w-full px-4 py-3 text-zinc-900 dark:text-white bg-white dark:bg-zinc-800 border border-zinc-300 dark:border-zinc-700 rounded-full focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  value={form.maxParticipants}
                  onChange={handleChange}
                  required
                />
              </div>
              <div className="flex-1">
                <label className="block mb-1 font-medium">Participant Type</label>
                <div className="flex gap-4 mt-2">
                  <label className="inline-flex items-center">
                    <input
                      type="radio"
                      name="participantType"
                      value="solo"
                      checked={form.participantType === "solo"}
                      onChange={handleRadioChange}
                      className="mr-2 accent-indigo-600 dark:accent-indigo-400 w-5 h-5 rounded-full border-2 border-zinc-300 dark:border-zinc-700 focus:ring-2 focus:ring-indigo-400 focus:outline-none transition"
                    />
                    Solo
                  </label>
                  <label className="inline-flex items-center">
                    <input
                      type="radio"
                      name="participantType"
                      value="team"
                      checked={form.participantType === "team"}
                      onChange={handleRadioChange}
                      className="mr-2 accent-indigo-600 dark:accent-indigo-400 w-5 h-5 rounded-full border-2 border-zinc-300 dark:border-zinc-700 focus:ring-2 focus:ring-indigo-400 focus:outline-none transition"
                    />
                    Team
                  </label>
                </div>
              </div>
            </div>
            {form.participantType === "team" && (
              <div>
                <label className="block mb-1 font-medium">Number of Team Members Allowed</label>
                <input
                  type="number"
                  name="teamMembers"
                  min="2"
                  className="w-full px-4 py-3 text-zinc-900 dark:text-white bg-white dark:bg-zinc-800 border border-zinc-300 dark:border-zinc-700 rounded-full focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  value={form.teamMembers}
                  onChange={handleChange}
                  required={form.participantType === "team"}
                />
              </div>
            )}
            <div className="flex gap-4">
              <div className="flex-1">
                <label className="block mb-1 font-medium">Registration Fee (₹)</label>
                <input
                  type="number"
                  min="0"
                  name="registrationFee"
                  className="w-full px-4 py-3 text-zinc-900 dark:text-white bg-white dark:bg-zinc-800 border border-zinc-300 dark:border-zinc-700 rounded-full focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  value={form.registrationFee}
                  onChange={handleChange}
                  required
                />
              </div>
              <div className="flex-1">
                <label className="block mb-1 font-medium">Accommodation Info</label>
                <input
                  type="text"
                  name="accommodation"
                  className="w-full px-4 py-3 text-zinc-900 dark:text-white bg-white dark:bg-zinc-800 border border-zinc-300 dark:border-zinc-700 rounded-full focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  value={form.accommodation}
                  onChange={handleChange}
                  placeholder="e.g. Provided, Not Provided, On Request"
                  required
                />
              </div>
            </div>
            <div>
              <label className="block mb-1 font-medium">Food Info</label>
              <input
                type="text"
                name="food"
                className="w-full px-4 py-3 text-zinc-900 dark:text-white bg-white dark:bg-zinc-800 border border-zinc-300 dark:border-zinc-700 rounded-full focus:outline-none focus:ring-2 focus:ring-indigo-500"
                value={form.food}
                onChange={handleChange}
                placeholder="e.g. Provided, Not Provided, On Request"
                required
              />
            </div>
            <div>
              <label className="block mb-1 font-medium">Upload Brochure/Notice <span className="text-red-500">*</span></label>
              <label htmlFor="brochure-upload" className="inline-block px-5 py-2 rounded-full bg-indigo-600 hover:bg-indigo-700 text-white font-semibold cursor-pointer transition mb-2 mt-1">
                {brochureFiles.length > 0 ? "Change Files" : "Select Files"}
              </label>
              <input
                id="brochure-upload"
                type="file"
                accept="application/pdf,image/*"
                multiple
                onChange={handleBrochureChange}
                required={brochureFiles.length === 0}
                className="hidden"
              />
              <div className="text-xs text-zinc-500 mt-1">PDF or image, at least 1 required.</div>
              {brochureFiles.length > 0 && (
                <ul className="mt-2 list-disc list-inside text-xs text-zinc-700 dark:text-zinc-200">
                  {brochureFiles.map((file, i) => (
                    <li key={i}>{file.name}</li>
                  ))}
                </ul>
              )}
            </div>
            <div>
              <label className="block mb-1 font-medium">Description</label>
              <textarea
                name="description"
                className="w-full px-4 py-3 text-zinc-900 dark:text-white bg-white dark:bg-zinc-800 border border-zinc-300 dark:border-zinc-700 rounded-full focus:outline-none focus:ring-2 focus:ring-indigo-500 min-h-[80px] resize-vertical"
                value={form.description}
                onChange={handleChange}
                required
              />
            </div>
            {error && <div className="text-red-500 font-medium text-sm">{error}</div>}
            {success && <div className="text-green-600 font-medium text-sm">Event created successfully!</div>}
            <button
              type="submit"
              className="w-full py-3 rounded-full bg-indigo-600 hover:bg-indigo-700 text-white font-semibold text-lg transition disabled:opacity-60"
              disabled={loading}
            >
              {loading ? "Creating..." : "Create Event"}
            </button>
          </form>
        </div>
      </main>
    </div>
  );
}
