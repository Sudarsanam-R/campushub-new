"use client";
import React, { useEffect, useState } from "react";
import { useThemeContext } from "@/components/ThemeWrapper"; // for theme detection

const COOKIE_CONSENT_KEY = "cookie_consent";
const COOKIE_PREFS_KEY = "cookie_preferences";

const defaultPrefs = {
  mandatory: true, // always true, cannot be disabled
  analytics: false,
  preferences: false,
  marketing: false,
};

type CookiePrefs = typeof defaultPrefs;

export default function CookieConsentDialog() {
  const { theme } = useThemeContext();
  const [open, setOpen] = useState(false);
  const [showSettings, setShowSettings] = useState(false);
  const [prefs, setPrefs] = useState<CookiePrefs>(defaultPrefs);

  useEffect(() => {
    const consent = localStorage.getItem(COOKIE_CONSENT_KEY);
    if (!consent) {
      setOpen(true);
    }
    const storedPrefs = localStorage.getItem(COOKIE_PREFS_KEY);
    if (storedPrefs) {
      setPrefs({ ...defaultPrefs, ...JSON.parse(storedPrefs) });
    }
  }, []);

  const handleAccept = () => {
    localStorage.setItem(COOKIE_CONSENT_KEY, "accepted");
    localStorage.setItem(COOKIE_PREFS_KEY, JSON.stringify({ ...prefs, mandatory: true }));
    setOpen(false);
  };

  const handleSavePrefs = () => {
    localStorage.setItem(COOKIE_CONSENT_KEY, "accepted");
    localStorage.setItem(COOKIE_PREFS_KEY, JSON.stringify({ ...prefs, mandatory: true }));
    setOpen(false);
    setShowSettings(false);
  };

  if (!open) return null;

  // Theme-aware styles
  const isDark = theme === "dark";
  const bg = isDark ? "#18181b" : "#fff";
  const border = isDark ? "1px solid #27272a" : "1px solid #e5e7eb";
  const color = isDark ? "#f4f4f5" : "#18181b";
  const shadow = isDark
    ? "0 8px 32px 0 rgba(99,102,241,0.12), 0 1.5px 5px 0 rgba(99,102,241,0.04)"
    : "0 4px 24px rgba(99,102,241,0.10), 0 1.5px 5px 0 rgba(99,102,241,0.04)";
  const accent = isDark ? "#818cf8" : "#6366f1";

  return (
    <div
      style={{
        position: "fixed",
        bottom: 32,
        right: 32,
        minWidth: 340,
        maxWidth: 400,
        background: bg,
        color,
        border,
        borderRadius: 18,
        padding: "1.7rem 1.35rem 1.35rem 1.35rem",
        zIndex: 1000,
        boxShadow: shadow,
        fontSize: "1rem",
        display: "flex",
        flexDirection: "column",
        alignItems: "flex-start",
        transition: "background 0.3s, color 0.3s"
      }}
    >
      {/* Close (X) button */}
      <button
        onClick={() => setOpen(false)}
        aria-label="Close cookie consent"
        style={{
          position: "absolute",
          top: 12,
          right: 12,
          background: "transparent",
          border: "none",
          color: isDark ? "#a1a1aa" : "#52525b",
          fontSize: 16,
          cursor: "pointer",
          borderRadius: 4,
          padding: 0,
          lineHeight: 1,
          transition: "color 0.2s"
        }}
      >
        &#10005;
      </button>
      <span style={{ fontWeight: 700, marginBottom: 8, fontSize: "1.13rem", letterSpacing: "-0.01em" }}>
        Cookie Preferences
      </span>
      <span style={{ opacity: 0.95, marginBottom: 18 }}>
        We use cookies to enhance your experience. You can manage your cookie preferences below. Mandatory cookies are always enabled.
      </span>
      {!showSettings ? (
        <div style={{ width: "100%", display: "flex", flexDirection: "row", justifyContent: "flex-end", gap: 12 }}>
          <button
            onClick={() => setShowSettings(true)}
            style={{
              background: "transparent",
              color: "#a5b4fc",
              border: "none",
              borderRadius: 6,
              padding: "0.5rem 1.1rem",
              fontWeight: 600,
              cursor: "pointer",
              fontSize: "1rem",
              marginRight: 8,
              textDecoration: "underline"
            }}
          >
            Cookie Settings
          </button>
          <button
            onClick={handleAccept}
            style={{
              background: "#6366f1",
              color: "#fff",
              border: "none",
              borderRadius: 6,
              padding: "0.5rem 1.25rem",
              fontWeight: 600,
              cursor: "pointer",
              fontSize: "1rem",
              boxShadow: "0 1px 6px rgba(99,102,241,0.18)"
            }}
          >
            Accept Cookies
          </button>
        </div>
      ) : (
        <div style={{ width: "100%", marginTop: 8 }}>
          <div style={{ marginBottom: 10 }}>
            <label style={{ display: "flex", alignItems: "center", gap: 8, fontWeight: 500 }}>
              <input type="checkbox" checked disabled style={{ accentColor: "#6366f1" }} />
              Mandatory Cookies (always enabled)
            </label>
            <small style={{ opacity: 0.7, marginLeft: 26, display: "block" }}>
              Required for basic site functionality (e.g., theme, security).
            </small>
          </div>
          <div style={{ marginBottom: 10 }}>
            <label style={{ display: "flex", alignItems: "center", gap: 8 }}>
              <input
                type="checkbox"
                checked={prefs.analytics}
                onChange={e => setPrefs(p => ({ ...p, analytics: e.target.checked }))}
                style={{ accentColor: "#6366f1" }}
              />
              Analytics Cookies
            </label>
            <small style={{ opacity: 0.7, marginLeft: 26, display: "block" }}>
              Help us understand how visitors interact with our website.
            </small>
          </div>
          <div style={{ marginBottom: 10 }}>
            <label style={{ display: "flex", alignItems: "center", gap: 8 }}>
              <input
                type="checkbox"
                checked={prefs.preferences}
                onChange={e => setPrefs(p => ({ ...p, preferences: e.target.checked }))}
                style={{ accentColor: "#6366f1" }}
              />
              Preferences Cookies
            </label>
            <small style={{ opacity: 0.7, marginLeft: 26, display: "block" }}>
              Remember your preferences (e.g., language, layout).
            </small>
          </div>
          <div style={{ marginBottom: 16 }}>
            <label style={{ display: "flex", alignItems: "center", gap: 8 }}>
              <input
                type="checkbox"
                checked={prefs.marketing}
                onChange={e => setPrefs(p => ({ ...p, marketing: e.target.checked }))}
                style={{ accentColor: "#6366f1" }}
              />
              Marketing Cookies
            </label>
            <small style={{ opacity: 0.7, marginLeft: 26, display: "block" }}>
              Used to deliver personalized ads and measure ad performance.
            </small>
          </div>
          <div style={{ width: "100%", display: "flex", flexDirection: "row", justifyContent: "flex-end", gap: 12 }}>
            <button
              onClick={() => setShowSettings(false)}
              style={{
                background: "transparent",
                color: "#a5b4fc",
                border: "none",
                borderRadius: 6,
                padding: "0.5rem 1.1rem",
                fontWeight: 600,
                cursor: "pointer",
                fontSize: "1rem",
                marginRight: 8,
                textDecoration: "underline"
              }}
            >
              Back
            </button>
            <button
              onClick={handleSavePrefs}
              style={{
                background: "#6366f1",
                color: "#fff",
                border: "none",
                borderRadius: 6,
                padding: "0.5rem 1.25rem",
                fontWeight: 600,
                cursor: "pointer",
                fontSize: "1rem",
                boxShadow: "0 1px 6px rgba(99,102,241,0.18)"
              }}
            >
              Save Preferences
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
