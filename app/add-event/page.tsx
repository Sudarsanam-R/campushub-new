// 'use client'

// import { useState, useEffect } from 'react'
// import { useRouter } from 'next/navigation'
// import toast from 'react-hot-toast'
// import { useTheme } from 'next-themes'
// import { Sun, Moon } from 'lucide-react'
// import Ribbons from '@/components/Ribbons'
// import ClickSpark from '@/components/ClickSpark'
// import SplashCursor from '@/components/SplashCursor'

// export default function AddEventPage() {
//   const router = useRouter()
//   const { theme, setTheme } = useTheme()
//   const [mounted, setMounted] = useState(false)

//   const [form, setForm] = useState({
//     title: '',
//     date: '',
//     time: '',
//     location: '',
//     tags: '',
//     description: '',
//   })

//   useEffect(() => {
//     setMounted(true)
//   }, [])

//   const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
//     setForm({ ...form, [e.target.name]: e.target.value })
//   }

//   const handleSubmit = async (e: React.FormEvent) => {
//     e.preventDefault()

//     const res = await fetch('http://localhost:8000/api/events/', {
//       method: 'POST',
//       headers: {
//         'Content-Type': 'application/json',
//       },
//       body: JSON.stringify({
//         ...form,
//         tags: form.tags.split(',').map(tag => tag.trim()),
//       }),
//     })

//     if (res.ok) {
//       router.push('/') // ✅ Redirect to home page
//     } else {
//       alert('Failed to add event.')
//     }
//   }


//   // const handleSubmit = async (e: React.FormEvent) => {
//   //   e.preventDefault()
//   //   const res = await fetch('http://localhost:8000/api/events/create/', {
//   //   method: 'POST',
//   //   headers: { 'Content-Type': 'application/json' },
//   //   body: JSON.stringify({
//   //     ...form,
//   //     tags: form.tags.split(',').map(tag => tag.trim()),
//   //   }),
//   // })


//     // const res = await fetch('/api/events', {
//     //   method: 'POST',
//     //   headers: { 'Content-Type': 'application/json' },
//     //   body: JSON.stringify({
//     //     ...form,
//     //     tags: form.tags.split(',').map(tag => tag.trim()),
//     //   }),
//     // })

//     // if (res.ok) {
//     //   toast.success('Event added!')
//     //   router.push('/')
//     // } else {
//     //   toast.error('Something went wrong')
//     // }
//   // }

//   const toggleTheme = () => setTheme(theme === 'dark' ? 'light' : 'dark')

//   if (!mounted) return null

//   return (
//     <>
//       {/*<SplashCursor />*/}
//       <ClickSpark />
//       <style>{`
//         .custom-cursor {
//           position: fixed;
//           width: 10px;
//           height: 10px;
//           border-radius: 50%;
//           pointer-events: none;
//           z-index: 9999;
//           mix-blend-mode: difference;
//           background-color: white;
//           transform: translate(-50%, -50%);
//           transition: width 0.2s ease, height 0.2s ease;
//         }
//         .custom-cursor.cursor-hover {
//           width: 25px;
//           height: 25px;
//         }
//       `}</style>

//       <main className="min-h-screen flex items-center justify-center bg-white dark:bg-zinc-950 text-zinc-900 dark:text-white px-4 py-16 transition relative overflow-hidden">
//         <Ribbons
//           baseThickness={30}
//           colors={['#ffffff']}
//           speedMultiplier={0.5}
//           maxAge={500}
//           enableFade={false}
//           enableShaderEffect={true}
//         />

//         <div className="absolute top-4 right-4 z-30">
//           <button
//             onClick={toggleTheme}
//             className="p-2 bg-zinc-200 dark:bg-zinc-800 rounded-full shadow hover:scale-105 transition"
//             title="Toggle Theme"
//           >
//             {theme === 'dark' ? <Sun size={18} /> : <Moon size={18} />}
//           </button>
//         </div>

//         <div className="relative w-[98vw] max-w-xl rounded-2xl border border-zinc-300 dark:border-zinc-800 bg-white dark:bg-zinc-900 shadow-[0_0_30px_rgba(99,102,241,0.4)] dark:shadow-[0_0_30px_rgba(99,102,241,0.3)] p-6">
//           <h1 className="text-2xl font-bold mb-2 text-center">Add New Event</h1>
//           <p className="text-center text-sm text-zinc-600 dark:text-zinc-400 mb-6">
//             Fill out the form below to create a new event.
//           </p>

//           <form onSubmit={handleSubmit} className="space-y-4">
//             {['title', 'date', 'time', 'location'].map((field) => (
//               <input
//                 key={field}
//                 name={field}
//                 type={field === 'date' ? 'date' : field === 'time' ? 'time' : 'text'}
//                 placeholder={field.charAt(0).toUpperCase() + field.slice(1)}
//                 value={form[field as keyof typeof form]}
//                 onChange={handleChange}
//                 required
//                 className="w-full px-4 py-3 text-zinc-900 dark:text-white bg-white dark:bg-zinc-800 border border-zinc-300 dark:border-zinc-700 rounded-full focus:outline-none focus:ring-2 focus:ring-indigo-500"
//               />
//             ))}

//             <textarea
//               name="description"
//               placeholder="Description"
//               value={form.description}
//               onChange={handleChange}
//               required
//               rows={4}
//               className="w-full px-4 py-3 text-zinc-900 dark:text-white bg-white dark:bg-zinc-800 border border-zinc-300 dark:border-zinc-700 rounded-2xl focus:outline-none focus:ring-2 focus:ring-indigo-500"
//             />

//             <input
//               name="tags"
//               placeholder="Tags (comma separated)"
//               value={form.tags}
//               onChange={handleChange}
//               className="w-full px-4 py-3 text-zinc-900 dark:text-white bg-white dark:bg-zinc-800 border border-zinc-300 dark:border-zinc-700 rounded-full focus:outline-none focus:ring-2 focus:ring-indigo-500"
//             />

//             <button
//               type="submit"
//               className="w-full py-3 px-4 rounded-full bg-indigo-600 hover:bg-indigo-700 transition text-white font-semibold overflow-hidden relative"
//             >
//               Add Event
//             </button>
//           </form>
//         </div>
//       </main>
//     </>
//   )
// }





'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { Sun, Moon } from 'lucide-react'
import ClickSpark from '@/components/ClickSpark'

export default function AddEventPage() {
  const [theme, setTheme] = useState('light')
  const [mounted, setMounted] = useState(false)
  const router = useRouter()

  const [form, setForm] = useState({
    title: '',
    date: '',
    time: '',
    location: '',
    description: '',
    tags: '',
  })

  useEffect(() => {
    setMounted(true)
  }, [])

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setForm({ ...form, [e.target.name]: e.target.value })
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    const res = await fetch('http://localhost:3000/home/#events', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        ...form,
        tags: form.tags.split(',').map((tag) => tag.trim()),
      }),
    })

    if (res.ok) {
      router.push('/')
    } else {
      const errorText = await res.text()
      console.error('Server error:', errorText)
      alert('Failed to add event: ' + errorText)
    }
  }

  // const handleSubmit = async (e: React.FormEvent) => {
  //   e.preventDefault()

  //   const res = await fetch('http://localhost:8000/api/events/', {
  //     method: 'POST',
  //     headers: {
  //       'Content-Type': 'application/json',
  //     },
  //     body: JSON.stringify({
  //       ...form,
  //       tags: form.tags.split(',').map((tag) => tag.trim()),
  //     }),
  //   })

  //   if (res.ok) {
  //     router.push('/') // ✅ Redirect to home page after submit
  //   } else {
  //     alert('Failed to add event')
  //   }
  // }

  const toggleTheme = () => setTheme(theme === 'dark' ? 'light' : 'dark')

  // ✅ RETURN STATEMENT GOES HERE, inside the function
  if (!mounted) return null

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

      <main className="min-h-screen flex items-center justify-center bg-white dark:bg-zinc-950 text-zinc-900 dark:text-white px-4 py-16 transition relative overflow-hidden">

        <div className="absolute top-4 right-4 z-30">
          <button
            onClick={toggleTheme}
            className="p-2 bg-zinc-200 dark:bg-zinc-800 rounded-full shadow hover:scale-105 transition"
            title="Toggle Theme"
          >
            {theme === 'dark' ? <Sun size={18} /> : <Moon size={18} />}
          </button>
        </div>

        <div className="relative w-[98vw] max-w-xl rounded-2xl border border-zinc-300 dark:border-zinc-800 bg-white dark:bg-zinc-900 shadow-[0_0_30px_rgba(99,102,241,0.4)] dark:shadow-[0_0_30px_rgba(99,102,241,0.3)] p-6">
          <h1 className="text-2xl font-bold mb-2 text-center">Add New Event</h1>
          <p className="text-center text-sm text-zinc-600 dark:text-zinc-400 mb-6">
            Fill out the form below to create a new event.
          </p>

          <form onSubmit={handleSubmit} className="space-y-4">
            {['title', 'date', 'time', 'location'].map((field) => (
              <input
                key={field}
                name={field}
                type={field === 'date' ? 'date' : field === 'time' ? 'time' : 'text'}
                placeholder={field.charAt(0).toUpperCase() + field.slice(1)}
                value={form[field as keyof typeof form]}
                onChange={handleChange}
                required
                className="w-full px-4 py-3 text-zinc-900 dark:text-white bg-white dark:bg-zinc-800 border border-zinc-300 dark:border-zinc-700 rounded-full focus:outline-none focus:ring-2 focus:ring-indigo-500"
              />
            ))}

            <textarea
              name="description"
              placeholder="Description"
              value={form.description}
              onChange={handleChange}
              required
              rows={4}
              className="w-full px-4 py-3 text-zinc-900 dark:text-white bg-white dark:bg-zinc-800 border border-zinc-300 dark:border-zinc-700 rounded-2xl focus:outline-none focus:ring-2 focus:ring-indigo-500"
            />

            <input
              name="tags"
              placeholder="Tags (comma separated)"
              value={form.tags}
              onChange={handleChange}
              className="w-full px-4 py-3 text-zinc-900 dark:text-white bg-white dark:bg-zinc-800 border border-zinc-300 dark:border-zinc-700 rounded-full focus:outline-none focus:ring-2 focus:ring-indigo-500"
            />

            <button
              type="submit"
              className="w-full py-3 px-4 rounded-full bg-indigo-600 hover:bg-indigo-700 transition text-white font-semibold overflow-hidden relative"
            >
              Add Event
            </button>
          </form>
        </div>
      </main>
    </>
  )
}




