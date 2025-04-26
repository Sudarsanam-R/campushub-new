// 'use client'

// import Header from '@/components/Header'
// import Switch from "@/components/Switch";
// import Footer from '@/components/Footer'
// import EventCard from '@/components/EventCard'

// const events = [
//   {
//     title: 'HackMIT 2025',
//     date: 'May 12, 2025',
//     time: '10:00 AM',
//     location: 'MIT, Cambridge',
//     tags: ['Hackathon', 'AI'],
//     description: 'Build innovative projects with students from around the world.',
//   },
//   {
//     title: 'CodeFest NIT',
//     date: 'June 4, 2025',
//     time: '2:00 PM',
//     location: 'NIT Trichy',
//     tags: ['Coding', 'Tech Talk'],
//     description: 'Workshops, coding rounds, and more at CodeFest 2025.',
//   },
//   {
//     title: 'TechSpark 2025',
//     date: 'July 1, 2025',
//     time: '11:00 AM',
//     location: 'IIT Bombay',
//     tags: ['Startup', 'Innovation'],
//     description: 'A celebration of ideas, startups, and student entrepreneurship.',
//   },
// ]

// export default function Home() {
//   return (
//     <>
//       <Header />
//       <div className="bg-white dark:bg-zinc-950 text-zinc-900 dark:text-white transition-colors duration-300">
//         {/* <div className="absolute top-4 right-4">
//           <Switch />
//         </div> */}

//       <main className="max-w-7xl mx-auto px-4 py-12">
//         <section className="text-center mb-20">
//           <h1 className="text-3xl font-bold mb-4">
//             Discover Events & Hackathons on CampusHub 🎓
//           </h1>
//           <p className="text-lg text-zinc-600 dark:text-zinc-300">
//             Stay in the loop with student tech, innovation, and culture events.
//           </p>
//         </section>

//         <section id="events" className="grid gap-8 sm:grid-cols-1 md:grid-cols-2 lg:grid-cols-3">
//           {events.map((event, index) => (
//             <EventCard key={index} event={event} />
//           ))}
//         </section>
//       </main>
//       <Footer />
//     </div>
//     </>
//   )
// }

'use client';

import { useEffect, useState } from 'react';
import TextPressure from "../components/ReactBits/TextPressure";
import Header from '@/components/custom_ui/Header';
import Footer from '@/components/custom_ui/Footer';
import EventCard from '@/components/custom_ui/EventCard';
import { useTheme } from 'next-themes';
import ClickSpark from '@/components/ReactBits/ClickSpark';


const events = [
  {
    title: 'CodeFest 2025',
    date: 'June 14, 2025',
    time: '10:00 AM',
    location: 'NIT Trichy',
    tags: ['Coding', 'Tech Talk'],
    description: 'Workshops, coding rounds, and more at CodeFest 2025.',
    imageSrcLight: '/images/events/codefest-light.jpeg',
    imageSrcDark: '/images/events/codefest-dark.jpeg'
  },
  {
    title: 'TechSpark 2025',
    date: 'July 1, 2025',
    time: '11:00 AM',
    location: 'IIT Bombay',
    tags: ['Startup', 'Innovation'],
    description: 'A celebration of ideas, startups, and student entrepreneurship.',
    imageSrcLight: '/images/events/techspark-light.jpeg',
    imageSrcDark: '/images/events/techspark-dark.jpeg'
  },
  {
    title: 'AI Summit 2025',
    date: 'August 15, 2025',
    time: '9:00 AM',
    location: 'IIT Delhi',
    tags: ['AI', 'Machine Learning'],
    description: 'Explore the future of artificial intelligence and its applications.',
    imageSrcLight: '/images/events/ai-summit-light.jpeg',
    imageSrcDark: '/images/events/ai-summit-dark.jpeg'
  }
];

import Loading from './loading';

export default function Home() {
  const { theme } = useTheme();
  const [mounted, setMounted] = useState(false);


  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) {
    return <Loading />;
  }

  return (
    <>
      <ClickSpark />

      {/* Layout wrapper */}
      <div className="transition-all duration-300 min-h-screen">

        <Header />

        <main className="flex flex-col gap-0">
          {/* Hero Section */}
          <section className="w-full bg-gradient-to-r from-indigo-100/80 via-white to-indigo-100/80 dark:from-zinc-900 dark:via-zinc-800 dark:to-zinc-900 py-20 flex flex-col md:flex-row items-center justify-between px-8 md:px-24 gap-12">
            <div className="flex-1 flex flex-col gap-6 items-start justify-center">
              <div className="mb-4">
                <TextPressure
                  text="CampusHub"
                  flex={true}
                  alpha={false}
                  stroke={false}
                  width={true}
                  weight={true}
                  italic={true}
                  textColor={theme === 'dark' ? '#fff' : '#1e293b'}
                  strokeColor="#ff0000"
                  minFontSize={80}
                  fontUrl="https://fonts.googleapis.com/css2?family=Inter:ital,opsz,wght@0,14..32,200;1,14..32,200&display=swap"
                  fontFamily="Inter"
                />
              </div>
              <p className="text-lg md:text-xl text-zinc-700 dark:text-zinc-300 mb-4">
                Discover, register, and participate in the best campus events across India.
              </p>
              <a
                href="/events"
                className="inline-block px-7 py-3 rounded-full bg-indigo-600 text-white font-semibold shadow-lg hover:bg-indigo-700 transition"
              >
                Explore Events
              </a>
            </div>
            <div className="flex-1 flex items-center justify-center">
              {mounted && (
                <img
                  src={theme === 'dark' ? '/logo-dark.svg' : '/logo-light.svg'}
                  alt="CampusHub Logo"
                  className="w-60 h-60 object-contain drop-shadow-xl"
                />
              )}
            </div>
          </section>

          {/* Events Section */}
          <section id="events" className="w-full py-16 px-4 md:px-16 bg-white dark:bg-zinc-900 border-t border-zinc-200 dark:border-zinc-800">
            <div className="max-w-7xl mx-auto">
              <div className="flex flex-col md:flex-row md:items-end md:justify-between mb-10 gap-4">
                <div>
                  <h2 className="text-3xl font-bold text-indigo-700 dark:text-indigo-300 mb-2">Featured Events</h2>
                  <p className="text-zinc-600 dark:text-zinc-400 text-base">Hand-picked events you shouldn't miss!</p>
                </div>
                <a
                  href="/events"
                  className="inline-block px-5 py-2 rounded-full bg-indigo-50 dark:bg-indigo-900 text-indigo-700 dark:text-indigo-200 font-semibold hover:bg-indigo-100 dark:hover:bg-indigo-800 transition border border-indigo-200 dark:border-indigo-700"
                >
                  See All Events
                </a>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 md:gap-8">
                {events.map((event) => (
                  <EventCard 
                    key={event.title} 
                    event={event}
                    spotlightColor="rgba(0, 229, 255, 0.2)"
                    rotateAmplitude={12}
                    scaleOnHover={1.02}
                  />
                ))}
              </div>
            </div>
          </section>

          {/* CTA */}
          <section className="w-full bg-indigo-600 dark:bg-indigo-700 py-16 flex flex-col items-center justify-center">
            <h3 className="text-2xl md:text-3xl font-bold text-white mb-4">Want to host your own event?</h3>
            <p className="text-white/80 text-lg mb-6">CampusHub helps you reach thousands of students and professionals.</p>
            <a
              href="/login"
              className="px-7 py-3 rounded-full bg-white text-indigo-700 font-bold shadow-lg hover:bg-indigo-100 transition"
            >
              Host an Event
            </a>
          </section>
        </main>

        <Footer />
      </div>
    </>
  );
}
