import React, { useRef, useState } from "react";

export default function ProfileDetailsForm() {
  const [profileName, setProfileName] = useState("slothUI Official");
  const [profileUrl, setProfileUrl] = useState("https://slothui.com/");
  const [bio, setBio] = useState(
    "slothUI is the one and only design system for intelligent, lazy gen Z people. It's the most perfect design tool for procrastinators."
  );
  const [profilePic, setProfilePic] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  function handleProfilePicChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (ev) => setProfilePic(ev.target?.result as string);
      reader.readAsDataURL(file);
    }
  }

  return (
    <div className="max-w-2xl mx-auto bg-white p-8 rounded-lg shadow">
      <h2 className="text-xl font-semibold mb-4">Profile Details</h2>
      <form className="space-y-6">
        <div>
          <label className="block font-medium mb-1">Public Profile</label>
          <input
            type="text"
            className="input input-bordered w-full"
            value={profileName}
            onChange={(e) => setProfileName(e.target.value)}
          />
          <input
            type="text"
            className="input input-bordered w-full mt-2"
            value={profileUrl}
            onChange={(e) => setProfileUrl(e.target.value)}
          />
        </div>
        <div>
          <label className="block font-medium mb-1">Bio Description</label>
          <textarea
            className="input input-bordered w-full min-h-[80px]"
            maxLength={300}
            value={bio}
            onChange={(e) => setBio(e.target.value)}
          />
          <div className="text-right text-xs text-gray-500">{bio.length}/300</div>
        </div>
        <div>
          <label className="block font-medium mb-1">Profile Picture</label>
          <div className="flex items-center gap-4">
            {profilePic ? (
              <img src={profilePic} alt="Profile" className="w-16 h-16 rounded-full object-cover" />
            ) : (
              <div className="w-16 h-16 rounded-full bg-gray-200 flex items-center justify-center text-gray-400">
                <span className="material-icons">person</span>
              </div>
            )}
            <input
              type="file"
              accept="image/png,image/jpeg,image/svg+xml"
              className="hidden"
              ref={fileInputRef}
              onChange={handleProfilePicChange}
            />
            <button
              type="button"
              className="btn-secondary"
              onClick={() => fileInputRef.current?.click()}
            >
              Upload Picture
            </button>
          </div>
          <div className="text-xs text-gray-500 mt-1">Supported Format: SVG, JPG, PNG (10mb each)</div>
        </div>
        <button type="submit" className="btn-primary mt-4">Save Changes</button>
      </form>
    </div>
  );
}
