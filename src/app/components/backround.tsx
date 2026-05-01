"use client";

import { useState, useEffect } from "react";
import { motion } from "framer-motion";

type Particle = {
  size: number;
  startX: number;
  startY: number;
  duration: number;
  moveY: number;
};

export default function Background() {
  const [particles, setParticles] = useState<Particle[]>([]);

  useEffect(() => {
    const particleCount = 50;
    const particleSizes = [1, 2, 3];

    const generated: Particle[] = Array.from({ length: particleCount }).map(() => ({
      size: particleSizes[Math.floor(Math.random() * particleSizes.length)],
      startX: Math.random() * 100,
      startY: Math.random() * 100,
      duration: 6 + Math.random() * 4,
      moveY: 10 + Math.random() * 10,
    }));

    setParticles(generated);
  }, []); // only runs once on client mount

  return (
    <div className="fixed inset-0 -z-10 pointer-events-none overflow-hidden">
      {/* Gradient background */}
      <div className="absolute inset-0 bg-gradient-to-b from-black via-blue-900 to-black" />

      {/* Big floating logo */}
      <motion.img
        src="/logo.png"
        alt="Logo"
        className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[70vw] max-w-[2000px] pointer-events-none select-none"
        style={{ filter: "brightness(0) invert(1) drop-shadow(0 0 90px #1e40af)" }}
        animate={{ scale: [1, 1.03, 1], rotate: [0, 1.5, -1.5, 0] }}
        transition={{ duration: 25, repeat: Infinity, repeatType: "mirror", ease: "easeInOut" }}
      />

      {/* Floating particles */}
      {particles.map((p, i) => (
        <motion.div
          key={i}
          className="absolute rounded-full bg-white/70"
          style={{
            width: `${p.size}px`,
            height: `${p.size}px`,
            top: `${p.startY}%`,
            left: `${p.startX}%`,
          }}
          animate={{ y: [0, p.moveY, 0], opacity: [0.2, 0.8, 0.2] }}
          transition={{ duration: p.duration, repeat: Infinity, repeatType: "mirror", ease: "easeInOut" }}
        />
      ))}
    </div>
  );
}


