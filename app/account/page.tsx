"use client";
import React, { useState } from "react";
import ProfileSettingsTabs from "@/components/ProfileSettingsTabs";
import ProfileDetailsForm from "@/components/ProfileDetailsForm";
import Switch from "@/components/Switch";
import ProfileSidebar from "@/components/ProfileSidebar";

const tabContent: Record<string, React.ReactNode> = {
  details: <ProfileDetailsForm />, // Profile Details tab
  personal: <div className="p-8">Personal tab content coming soon...</div>,
  account: <div className="p-8">Account tab content coming soon...</div>,
  profile: <div className="p-8">Profile tab content coming soon...</div>,
  security: <div className="p-8">Security tab content coming soon...</div>,
  appearance: <div className="p-8">Appearance tab content coming soon...</div>,
  api: <div className="p-8">API tab content coming soon...</div>,
  events: <div className="p-8">Events tab content coming soon...</div>,
  organize: <div className="p-8">Organize tab content coming soon...</div>,
};

export default function ProfileDashboard() {
  const [activeTab, setActiveTab] = useState("details");
  return (
    <div className="min-h-screen flex bg-white dark:bg-zinc-950 text-zinc-900 dark:text-white transition">
      {/* Sidebar */}
      <aside className="hidden md:flex">
        <ProfileSidebar />
      </aside>
      {/* Main Content */}
      <main className="flex-1 flex flex-col items-center justify-center px-4 py-16 relative overflow-hidden">
        <div className="absolute top-4 right-4 z-10"><Switch /></div>
        <div className="relative w-[98vw] max-w-2xl rounded-2xl border border-zinc-300 dark:border-zinc-800 bg-white dark:bg-zinc-900 shadow-[0_0_30px_rgba(99,102,241,0.4)] dark:shadow-[0_0_30px_rgba(99,102,241,0.3)] p-6">
          <h1 className="text-3xl font-bold mb-8 text-center">My Profile Dashboard</h1>
          <ProfileSettingsTabs activeTab={activeTab} onTabChange={setActiveTab} />
          <section className="mt-6">{tabContent[activeTab]}</section>
        </div>
      </main>
    </div>
  );
}
