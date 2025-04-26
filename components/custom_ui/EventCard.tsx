'use client'

import React, { useRef, useState } from 'react';
import { useTheme } from 'next-themes';
import Link from 'next/link';
import { motion, useMotionValue, useSpring, SpringOptions } from 'framer-motion';

interface Position {
  x: number;
  y: number;
}

interface EventProps {
  event: {
    id: string;
    title: string;
    date: string;
    time: string;
    location: string;
    tags: string[];
    description: string;
    imageSrc?: string;
    imageSrcLight?: string;
    imageSrcDark?: string;
  };
  spotlightColor?: string;
  rotateAmplitude?: number;
  scaleOnHover?: number;
  onImageLoad?: () => void;
}

const springValues: SpringOptions = {
  damping: 30,
  stiffness: 100,
  mass: 2,
};

export default function EventCard({
  event,
  spotlightColor = 'rgba(0, 229, 255, 0.2)',
  rotateAmplitude = 14,
  scaleOnHover = 1.07,
  onImageLoad
}: EventProps) {
  const divRef = useRef<HTMLDivElement>(null);
  const rotateX = useSpring(useMotionValue(0), springValues);
  const rotateY = useSpring(useMotionValue(0), springValues);
  const scale = useSpring(1, springValues);

  // Spotlight effect state
  const [spotlightPos, setSpotlightPos] = useState<Position>({ x: 0, y: 0 });
  const [spotlightOpacity, setSpotlightOpacity] = useState<number>(0);

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!divRef.current) return;
    const rect = divRef.current.getBoundingClientRect();
    const offsetX = e.clientX - rect.left - rect.width / 2;
    const offsetY = e.clientY - rect.top - rect.height / 2;
    const rotationX = (offsetY / (rect.height / 2)) * -rotateAmplitude;
    const rotationY = (offsetX / (rect.width / 2)) * rotateAmplitude;
    rotateX.set(rotationX);
    rotateY.set(rotationY);
    setSpotlightPos({ x: e.clientX - rect.left, y: e.clientY - rect.top });
  };

  const handleMouseEnter = () => {
    scale.set(scaleOnHover);
    setSpotlightOpacity(0.6);
  };

  const handleMouseLeave = () => {
    scale.set(1);
    rotateX.set(0);
    rotateY.set(0);
    setSpotlightOpacity(0);
  };

  const { theme } = useTheme();

  // Choose image based on theme
  let imageSrc = event.imageSrc;
  if (theme === 'dark' && event.imageSrcDark) {
    imageSrc = event.imageSrcDark;
  } else if (theme === 'light' && event.imageSrcLight) {
    imageSrc = event.imageSrcLight;
  }

  return (
    <motion.div
      ref={divRef}
      className="relative rounded-xl overflow-hidden shadow-lg bg-white/80 dark:bg-zinc-900/80 backdrop-blur-sm transition-all border border-zinc-200 dark:border-zinc-700 group outline-none focus:ring-2 focus:ring-cyan-400"
      style={{
        minHeight: 350,
        perspective: 800,
        rotateX,
        rotateY,
        scale,
        transformStyle: 'preserve-3d',
      }}
      tabIndex={0}
      onMouseMove={handleMouseMove}
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
    >
      {/* Spotlight effect */}
      <div
        className="pointer-events-none absolute inset-0 transition-opacity duration-500 ease-in-out z-0"
        style={{
          opacity: spotlightOpacity,
          background: `radial-gradient(circle at ${spotlightPos.x}px ${spotlightPos.y}px, ${spotlightColor}, transparent 80%)`,
        }}
      />
      {/* Card content */}
      <div className="relative z-10 p-5 flex flex-col">
        <div className="-mx-5 -mt-5 mb-5 overflow-hidden bg-zinc-100 dark:bg-zinc-800">
          {imageSrc ? (
            <div className="w-full h-64">
              <img
                src={imageSrc}
                alt={event.title + ' event image'}
                className="w-full h-full object-cover object-center block transition-transform duration-300"
                style={{ width: '100%', height: '100%', display: 'block' }}
                onLoad={onImageLoad}
                onError={onImageLoad}
              />
            </div>
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
          {event.tags.map((tag, idx) => (
            <span
              key={tag + '-' + idx}
              className="bg-indigo-100 dark:bg-indigo-800/80 text-indigo-700 dark:text-indigo-100 text-xs px-2 py-0.5 rounded-full backdrop-blur-sm"
            >
              {tag}
            </span>
          ))}
        </div>
        <p className="text-sm mt-3 text-zinc-700 dark:text-zinc-300">{event.description}</p>
        <Link
          href={`/register/${event.id}`}
          className="mt-4 block text-center px-6 py-3 bg-indigo-600 hover:bg-indigo-500 text-white rounded-full transition-all duration-200 font-medium shadow-lg shadow-indigo-500/25 hover:shadow-indigo-500/40"
        >
          Register
        </Link>
      </div>
    </motion.div>
  );
}
