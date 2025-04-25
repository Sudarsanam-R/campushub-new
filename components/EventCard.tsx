'use client'

import { motion, useMotionValue, useSpring, SpringOptions } from 'framer-motion'
import Link from 'next/link'
import { useRef, useState } from 'react'

interface Position {
  x: number;
  y: number;
}

interface EventProps {
  event: {
    title: string
    date: string
    time: string
    location: string
    tags: string[]
    description: string
    imageSrc?: string
  }
  spotlightColor?: `rgba(${number}, ${number}, ${number}, ${number})`
  rotateAmplitude?: number
  scaleOnHover?: number
}

const springValues: SpringOptions = {
  damping: 30,
  stiffness: 100,
  mass: 2,
};

export default function EventCard({ 
  event, 
  spotlightColor = "rgba(255, 255, 255, 0.25)",
  rotateAmplitude = 7,
  scaleOnHover = 1.03 
}: EventProps) {
  const divRef = useRef<HTMLDivElement>(null);
  const [position, setPosition] = useState<Position>({ x: 0, y: 0 });
  const [opacity, setOpacity] = useState<number>(0);

  // Tilt animation values
  const rotateX = useSpring(useMotionValue(0), springValues);
  const rotateY = useSpring(useMotionValue(0), springValues);
  const scale = useSpring(1, springValues);

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!divRef.current) return;

    const rect = divRef.current.getBoundingClientRect();
    const offsetX = e.clientX - rect.left - rect.width / 2;
    const offsetY = e.clientY - rect.top - rect.height / 2;

    // Update spotlight position
    setPosition({ x: e.clientX - rect.left, y: e.clientY - rect.top });

    // Update tilt
    const rotationX = (offsetY / (rect.height / 2)) * -rotateAmplitude;
    const rotationY = (offsetX / (rect.width / 2)) * rotateAmplitude;

    rotateX.set(rotationX);
    rotateY.set(rotationY);
  };

  const handleMouseEnter = () => {
    setOpacity(0.6);
    scale.set(scaleOnHover);
  };

  const handleMouseLeave = () => {
    setOpacity(0);
    scale.set(1);
    rotateX.set(0);
    rotateY.set(0);
  };

  return (
    <motion.div
      ref={divRef}
      className="group relative rounded-xl overflow-hidden shadow-lg bg-white/80 dark:bg-zinc-900/80 backdrop-blur-sm transition-all border border-zinc-200 dark:border-zinc-700 [perspective:800px] hover:shadow-xl"
      onMouseMove={handleMouseMove}
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
      style={{
        rotateX,
        rotateY,
        scale,
        transformStyle: 'preserve-3d'
      }}
    >
      <div
        className="pointer-events-none absolute inset-0 opacity-0 transition-opacity duration-500 ease-in-out z-10 bg-gradient-to-t from-black/10 to-transparent"
        style={{
          opacity: opacity * 0.5
        }}
      />

      {/* Spotlight overlay */}
      <div
        className="pointer-events-none absolute inset-0 opacity-0 transition-opacity duration-500 ease-in-out z-20"
        style={{
          opacity,
          background: `radial-gradient(circle at ${position.x}px ${position.y}px, ${spotlightColor}, transparent 80%)`,
          mixBlendMode: 'plus-lighter'
        }}
      />

      {/* Card content */}
      <div className="relative z-30 p-5 [transform-style:preserve-3d] [transform:translateZ(1px)]">
        <div className="-mx-5 -mt-5 mb-5 overflow-hidden bg-zinc-100 dark:bg-zinc-800">
          {event.imageSrc ? (
            <img 
              src={event.imageSrc} 
              alt={event.title}
              className="w-full h-48 object-cover transform group-hover:scale-105 transition-transform duration-300"
            />
          ) : (
            <div className="w-full h-48 flex items-center justify-center bg-gradient-to-br from-indigo-500 to-purple-600">
              <span className="text-2xl font-bold text-white">{event.title}</span>
            </div>
          )}
        </div>
        <h2 className="text-xl font-semibold text-indigo-600 dark:text-indigo-400 mb-2">
          {event.title}
        </h2>
        <p className="text-sm text-zinc-600 dark:text-zinc-400">
          {event.date} • {event.time}
        </p>
        <p className="text-sm mt-1 text-zinc-700 dark:text-zinc-300">{event.location}</p>
        <div className="flex flex-wrap gap-2 mt-3">
          {event.tags.map((tag) => (
            <span
              key={tag}
              className="bg-indigo-100 dark:bg-indigo-800/80 text-indigo-700 dark:text-indigo-100 text-xs px-2 py-0.5 rounded-full backdrop-blur-sm"
            >
              {tag}
            </span>
          ))}
        </div>
        <p className="text-sm mt-3 text-zinc-700 dark:text-zinc-300">{event.description}</p>
        <Link
          href="/register"
          className="mt-4 block text-center px-4 py-2.5 bg-indigo-600 hover:bg-indigo-500 text-white rounded-lg transition-all duration-200 transform hover:scale-[1.02] active:scale-[0.98] font-medium shadow-lg shadow-indigo-500/25 hover:shadow-indigo-500/40"
        >
          Register
        </Link>
      </div>
    </motion.div>
  )
}
