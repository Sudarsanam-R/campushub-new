"use client";

import React, { useState, useEffect } from "react";
import Image from "next/image";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import RequireAuth from "@/components/RequireAuth";
import Switch from "@/components/Switch";
import { useTheme } from "next-themes";
import ClickSpark from "@/components/ClickSpark";
import toast from "react-hot-toast";

// Placeholder data for country codes, states, etc.
const countryCodes = [
  { code: "+91", name: "India", flag: "" },
  { code: "+1", name: "USA", flag: "" },
  { code: "+44", name: "UK", flag: "" },
  // ... add all countries as needed
];

const genders = ["Male", "Female", "Other"];
const streams = [
  "Arts", "Science", "Commerce", "Engineering", "Medical and Paramedical", "Law", "Management", "Architecture and Design"
];
const degrees = ["Bachelors", "Masters", "Doctorate"];
const roles = ["Student", "Professor", "Lecturer", "Head of Department", "Principal", "Staff"];

// Placeholder for Indian states and cities
type StatesWithCities = { [state: string]: string[] };
const statesWithCities: StatesWithCities = {
  "Tamil Nadu": ["Chennai", "Coimbatore", "Madurai", "Salem"],
  "Karnataka": ["Bangalore", "Mysore", "Mangalore"],
  "Maharashtra": ["Mumbai", "Pune", "Nagpur"],
  // ... add all states and union territories
};

// Placeholder for courses by stream and degree
type CoursesByStreamDegree = {
  [stream: string]: {
    [degree: string]: string[];
  }
};
const coursesByStreamDegree: CoursesByStreamDegree = {
  Engineering: {
    Bachelors: ["Computer Science", "Mechanical", "Electrical", "Civil", "Electronics"],
    Masters: ["M.Tech CSE", "M.Tech Mechanical"],
    Doctorate: ["PhD Engineering"]
  },
  Science: {
    Bachelors: ["BSc Physics", "BSc Chemistry"],
    Masters: ["MSc Physics", "MSc Chemistry"],
    Doctorate: ["PhD Science"]
  },
  // ... add other streams
};

// Placeholder for colleges
const colleges = [
  { name: "IIT Madras", state: "Tamil Nadu", city: "Chennai", stream: "Engineering", degree: "Bachelors", course: "Computer Science" },
  { name: "Anna University", state: "Tamil Nadu", city: "Chennai", stream: "Engineering", degree: "Bachelors", course: "Mechanical" },
  { name: "IISc Bangalore", state: "Karnataka", city: "Bangalore", stream: "Science", degree: "Masters", course: "MSc Physics" },
  // ... add more colleges
];

export default function NewUserDetailsPage() {
  // All hooks must be declared at the top, before any conditional returns
  const [showContent, setShowContent] = React.useState(false);
  const { data: session, status } = useSession();
  const router = useRouter();
  const { theme, setTheme } = useTheme();
  const [mounted, setMounted] = useState(false);
  // Stepper state
  const [step, setStep] = useState(1);
  // Personal details state
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [dob, setDob] = useState("");
  const [gender, setGender] = useState("");
  const [phoneCode, setPhoneCode] = useState(countryCodes[0].code);
  const [phone, setPhone] = useState("");
  // Academic details state
  const [stream, setStream] = useState("");
  const [degree, setDegree] = useState("");
  const [course, setCourse] = useState("");
  const [state, setState] = useState("");
  const [city, setCity] = useState("");
  const [college, setCollege] = useState("");
  const [role, setRole] = useState("");

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    const timer = setTimeout(() => setShowContent(true), 1500);
    return () => clearTimeout(timer);
  }, []);

  useEffect(() => {
    if (session?.user?.name) {
      const [first, ...rest] = session.user.name.split(" ");
      setFirstName(first);
      setLastName(rest.join(" "));
    }
  }, [session]);

  useEffect(() => {
    if (status === "authenticated" && session?.user) {
      if (typeof (session.user as any).isFirstLogin !== 'undefined' && !(session.user as any).isFirstLogin) {
        router.replace("/");
      }
    }
  }, [status, session, router]);

  useEffect(() => {
    const cursor = document.createElement('div')
    cursor.classList.add('custom-cursor')
    document.body.appendChild(cursor)

    const move = (e: MouseEvent) => {
      cursor.style.display = ''
      cursor.style.left = `${e.clientX}px`
      cursor.style.top = `${e.clientY}px`
    }

    const over = (e: MouseEvent) => {
      const t = e.target as HTMLElement
      const clickable = t.closest('button, a, input[type="checkbox"], label, [role="button"], .clickable')
      cursor.classList.toggle('cursor-hover', !!clickable)
      document.body.style.cursor = 'none'
    }

    document.addEventListener('mousemove', move)
    document.addEventListener('mouseover', over)
    
    // Hide cursor when leaving window
    const hideCursor = () => {
      cursor.style.display = 'none'
      cursor.style.left = '-9999px'
      cursor.style.top = '-9999px'
      document.body.style.cursor = ''
    }
    const showCursor = () => {
      cursor.style.display = ''
      document.body.style.cursor = 'none'
    }
    window.addEventListener('mouseleave', hideCursor)
    window.addEventListener('mouseenter', showCursor)
    document.addEventListener('mouseout', (e) => {
      if (!e.relatedTarget || (e.relatedTarget as HTMLElement).nodeName === 'HTML') {
        hideCursor()
      }
    })

    return () => {
      document.removeEventListener('mousemove', move)
      document.removeEventListener('mouseover', over)
      window.removeEventListener('mouseleave', hideCursor)
      window.removeEventListener('mouseenter', showCursor)
      cursor.remove()
    }
  }, [])

  // All useEffect hooks must come before any conditional returns

  // ...filtered data and handlers...
  // (We move the conditional return after all hooks and handlers)



  // Filtered data for dropdowns
  const availableCities = state ? statesWithCities[state] || [] : [];
  const availableCourses = stream && degree && coursesByStreamDegree[stream]?.[degree] ? coursesByStreamDegree[stream][degree] : [];
  const availableColleges = colleges.filter(
    (c: typeof colleges[number]) =>
      (!state || c.state === state) &&
      (!city || c.city === city) &&
      (!stream || c.stream === stream) &&
      (!degree || c.degree === degree) &&
      (!course || c.course === course)
  );

  // Handlers
  function handleNext(e: React.FormEvent) {
    e.preventDefault();
    setStep(2);
  }
  function handleBack(e: React.FormEvent) {
    e.preventDefault();
    setStep(1);
  }
  async function handleSave(e: React.FormEvent) {
    e.preventDefault();
    try {
      // Send all details to mark-first-login-complete
      await fetch("/api/mark-first-login-complete", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          firstName, lastName, dob, gender, phone: phoneCode + phone,
          stream, degree, course, state, city, college, role
        })
      });
      router.replace("/");
    } catch (err) {
      toast.error("Something went wrong. Please try again.");
    }
  }

  useEffect(() => {
    setMounted(true)
  }, [])

  useEffect(() => {
    const cursor = document.createElement('div')
    cursor.classList.add('custom-cursor')
    document.body.appendChild(cursor)

    const move = (e: MouseEvent) => {
      cursor.style.display = ''
      cursor.style.left = `${e.clientX}px`
      cursor.style.top = `${e.clientY}px`
    }

    const over = (e: MouseEvent) => {
      const t = e.target as HTMLElement
      const clickable = t.closest('button, a, input[type="checkbox"], label, [role="button"], .clickable')
      cursor.classList.toggle('cursor-hover', !!clickable)
      document.body.style.cursor = 'none'
    }

    document.addEventListener('mousemove', move)
    document.addEventListener('mouseover', over)
    
    // Hide cursor when leaving window
    const hideCursor = () => {
      cursor.style.display = 'none'
      cursor.style.left = '-9999px'
      cursor.style.top = '-9999px'
      document.body.style.cursor = ''
    }
    const showCursor = () => {
      cursor.style.display = ''
      document.body.style.cursor = 'none'
    }
    window.addEventListener('mouseleave', hideCursor)
    window.addEventListener('mouseenter', showCursor)
    document.addEventListener('mouseout', (e) => {
      if (!e.relatedTarget || (e.relatedTarget as HTMLElement).nodeName === 'HTML') {
        hideCursor()
      }
    })

    return () => {
      document.removeEventListener('mousemove', move)
      document.removeEventListener('mouseover', over)
      window.removeEventListener('mouseleave', hideCursor)
      window.removeEventListener('mouseenter', showCursor)
      cursor.remove()
    }
  }, [])

  // All useEffect hooks must come before any conditional returns
  // (Move any additional useEffect hooks here)

  if (!mounted) return null
  if (status === "loading") return null

  return (
    <>
      <ClickSpark />
      <style>{`
        .custom-cursor {
          position: fixed;
          width: 10px;
          height: 10px;
          border-radius: 50%;
          pointer-events: none;
          z-index: 9999;
          mix-blend-mode: difference;
          background-color: white;
          transform: translate(-50%, -50%);
          transition: width 0.2s ease, height 0.2s ease;
        }
        .custom-cursor.cursor-hover {
          width: 25px;
          height: 25px;
        }
      `}</style>

      <main className="min-h-screen flex flex-col items-center justify-center px-4 py-16 bg-white dark:bg-zinc-950 text-zinc-900 dark:text-white transition relative overflow-hidden">
        <div className="absolute top-4 right-4 flex gap-3 z-30">
          <Switch />
        </div>
        <div className="w-full max-w-lg bg-white dark:bg-zinc-900 rounded-3xl shadow-lg p-8 relative">
          <h2 className="text-2xl font-bold mb-2 text-center">
            Welcome! Complete Your Profile
          </h2>
          <div className="flex justify-center mb-6">
            <div className="flex gap-2">
              <div className={`w-4 h-4 rounded-full ${step === 1 ? "bg-indigo-600" : "bg-zinc-400"}`}></div>
              <div className={`w-4 h-4 rounded-full ${step === 2 ? "bg-indigo-600" : "bg-zinc-400"}`}></div>
            </div>
          </div>
          {step === 1 && (
            <form onSubmit={handleNext} className="space-y-6">
              <div className="flex gap-4">
                <div className="w-1/2">
                  <label className="block mb-1 font-medium">First Name</label>
                  <input
                    type="text"
                    className="w-full px-4 py-3 rounded-full border border-zinc-300 dark:border-zinc-700 bg-white dark:bg-zinc-800 text-zinc-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
                    value={firstName}
                    onChange={e => setFirstName(e.target.value)}
                    required
                  />
                </div>
                <div className="w-1/2">
                  <label className="block mb-1 font-medium">Last Name</label>
                  <input
                    type="text"
                    className="w-full px-4 py-3 rounded-full border border-zinc-300 dark:border-zinc-700 bg-white dark:bg-zinc-800 text-zinc-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
                    value={lastName}
                    onChange={e => setLastName(e.target.value)}
                    required
                  />
                </div>
              </div>
              <div>
                <label className="block mb-1 font-medium">Date of Birth</label>
                <input
                  type="date"
                  className="w-full px-4 py-3 rounded-full border border-zinc-300 dark:border-zinc-700 bg-white dark:bg-zinc-800 text-zinc-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  value={dob}
                  onChange={e => setDob(e.target.value)}
                  required
                  pattern="\d{4}-\d{2}-\d{2}"
                />
              </div>
              <div>
                <label className="block mb-1 font-medium">Gender</label>
                <select
                  className="w-full px-4 py-3 rounded-full border border-zinc-300 dark:border-zinc-700 bg-white dark:bg-zinc-800 text-zinc-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  value={gender}
                  onChange={e => setGender(e.target.value)}
                  required
                >
                  <option value="" disabled>Select Gender</option>
                  {genders.map(g => (
                    <option key={g} value={g}>{g}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block mb-1 font-medium">Phone Number</label>
                <div className="flex gap-2">
                  <select
                    className="px-3 py-3 rounded-full border border-zinc-300 dark:border-zinc-700 bg-white dark:bg-zinc-800 text-zinc-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
                    value={phoneCode}
                    onChange={e => setPhoneCode(e.target.value)}
                    required
                  >
                    {countryCodes.map((c) => (
                      <option key={c.code} value={c.code}>{c.flag} {c.code}</option>
                    ))}
                  </select>
                  <input
                    type="tel"
                    className="w-full px-4 py-3 rounded-full border border-zinc-300 dark:border-zinc-700 bg-white dark:bg-zinc-800 text-zinc-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
                    value={phone}
                    onChange={e => setPhone(e.target.value)}
                    required
                  />
                </div>
              </div>
              <button
                type="submit"
                className="w-full py-3 px-4 rounded-full bg-indigo-600 hover:bg-indigo-700 transition text-white font-semibold overflow-hidden relative mt-2"
              >
                Next
              </button>
            </form>
          )}
          {step === 2 && (
            <form onSubmit={handleSave} className="space-y-6">
              <div>
                <label className="block mb-1 font-medium">Stream</label>
                <select
                  className="w-full px-4 py-3 rounded-full border border-zinc-300 dark:border-zinc-700 bg-white dark:bg-zinc-800 text-zinc-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  value={stream}
                  onChange={e => { setStream(e.target.value); setDegree(""); setCourse(""); }}
                  required
                >
                  <option value="" disabled>Select Stream</option>
                  {streams.map(s => (
                    <option key={s} value={s}>{s}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block mb-1 font-medium">Degree</label>
                <select
                  className="w-full px-4 py-3 rounded-full border border-zinc-300 dark:border-zinc-700 bg-white dark:bg-zinc-800 text-zinc-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  value={degree}
                  onChange={e => { setDegree(e.target.value); setCourse(""); }}
                  required
                  disabled={!stream}
                >
                  <option value="" disabled>Select Degree</option>
                  {degrees.map(d => (
                    <option key={d} value={d}>{d}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block mb-1 font-medium">Course</label>
                <select
                  className="w-full px-4 py-3 rounded-full border border-zinc-300 dark:border-zinc-700 bg-white dark:bg-zinc-800 text-zinc-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  value={course}
                  onChange={e => setCourse(e.target.value)}
                  required
                  disabled={!stream || !degree}
                >
                  <option value="" disabled>Select Course</option>
                  {availableCourses.map((c: string) => (
                    <option key={c} value={c}>{c}</option>
                  ))}
                </select>
              </div>
              <div className="flex gap-4">
                <div className="w-1/2">
                  <label className="block mb-1 font-medium">College State</label>
                  <select
                    className="w-full px-4 py-3 rounded-full border border-zinc-300 dark:border-zinc-700 bg-white dark:bg-zinc-800 text-zinc-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
                    value={state}
                    onChange={e => { setState(e.target.value); setCity(""); setCollege(""); }}
                    required
                  >
                    <option value="" disabled>Select State</option>
                    {Object.keys(statesWithCities).map(s => (
                      <option key={s} value={s}>{s}</option>
                    ))}
                  </select>
                </div>
                <div className="w-1/2">
                  <label className="block mb-1 font-medium">College City</label>
                  <select
                    className="w-full px-4 py-3 rounded-full border border-zinc-300 dark:border-zinc-700 bg-white dark:bg-zinc-800 text-zinc-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
                    value={city}
                    onChange={e => { setCity(e.target.value); setCollege(""); }}
                    required
                    disabled={!state}
                  >
                    <option value="" disabled>Select City</option>
                    {availableCities.map(c => (
                      <option key={c} value={c}>{c}</option>
                    ))}
                  </select>
                </div>
              </div>
              <div>
                <label className="block mb-1 font-medium">College</label>
                <select
                  className="w-full px-4 py-3 rounded-full border border-zinc-300 dark:border-zinc-700 bg-white dark:bg-zinc-800 text-zinc-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  value={college}
                  onChange={e => setCollege(e.target.value)}
                  required
                  disabled={!city || !stream || !degree || !course}
                >
                  <option value="" disabled>Select College</option>
                  {availableColleges.map((c: typeof colleges[number]) => (
                    <option key={c.name} value={c.name}>{c.name}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block mb-1 font-medium">Role</label>
                <select
                  className="w-full px-4 py-3 rounded-full border border-zinc-300 dark:border-zinc-700 bg-white dark:bg-zinc-800 text-zinc-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  value={role}
                  onChange={e => setRole(e.target.value)}
                  required
                >
                  <option value="" disabled>Select Role</option>
                  {roles.map(r => (
                    <option key={r} value={r}>{r}</option>
                  ))}
                </select>
              </div>
              <div className="flex justify-between mt-4">
                <button
                  type="button"
                  onClick={handleBack}
                  className="py-3 px-6 rounded-full bg-zinc-300 dark:bg-zinc-700 text-zinc-900 dark:text-white font-semibold hover:bg-zinc-400 dark:hover:bg-zinc-600 transition"
                >
                  Back
                </button>
                <button
                  type="submit"
                  className="py-3 px-6 rounded-full bg-indigo-600 hover:bg-indigo-700 transition text-white font-semibold"
                >
                  Save
                </button>
              </div>
            </form>
          )}
        </div>
      </main>
    </>
  );
}
