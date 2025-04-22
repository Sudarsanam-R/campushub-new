import React, { useState } from "react";

const tabs = [
  { label: "Details", key: "details" },
  { label: "Personal", key: "personal" },
  { label: "Account", key: "account" },
  { label: "Profile", key: "profile" },
  { label: "Security", key: "security" },
  { label: "Appearance", key: "appearance" },
  { label: "API", key: "api" },
];

export default function ProfileSettingsTabs({ activeTab, onTabChange }: { activeTab: string; onTabChange: (key: string) => void }) {
  return (
    <div className="flex border-b mb-6 overflow-x-auto">
      {tabs.map((tab) => (
        <button
          key={tab.key}
          className={`px-4 py-2 font-medium border-b-2 transition whitespace-nowrap ${
            activeTab === tab.key ? "border-black text-black" : "border-transparent text-gray-500 hover:text-black"
          }`}
          onClick={() => onTabChange(tab.key)}
        >
          {tab.label}
        </button>
      ))}
    </div>
  );
}
