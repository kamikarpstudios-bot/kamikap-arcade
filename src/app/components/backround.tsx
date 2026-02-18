"use client";

import { motion } from "framer-motion";

export default function Background() {
  const particleCount = 30; // fewer particles for performance
  const particleSizes = [1, 2, 3]; // slight size variation

  return (
    <div className="fixed inset-0 -z-10 pointer-events-none overflow-hidden">
      {/* Gradient background */}
      <div className="absolute inset-0 bg-gradient-to-b from-black via-blue-900 to-black"></div>

      {/* Big floating logo */}
      <motion.img
        src="/logo.png"
        alt="Logo"
        className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[70vw] max-w-[2000px] pointer-events-none select-none"
        style={{
          filter: "brightness(0) invert(1) drop-shadow(0 0 90px #1e40af)",
          willChange: "transform",
        }}
        animate={{
          scale: [1, 1.03, 1],
          rotate: [0, 1.5, -1.5, 0],
        }}
        transition={{
          duration: 25,
          repeat: Infinity,
          repeatType: "mirror",
          ease: "easeInOut",
        }}
      />

      {/* Floating particles */}
      {[...Array(particleCount)].map((_, i) => {
        const size = particleSizes[Math.floor(Math.random() * particleSizes.length)];
        const startX = Math.random() * 100;
        const startY = Math.random() * 100;
        const duration = 6 + Math.random() * 4;

        return (
          <motion.div
            key={i}
            className="absolute rounded-full bg-white/70"
            style={{
              width: `${size}px`,
              height: `${size}px`,
              top: `${startY}%`,
              left: `${startX}%`,
            }}
            animate={{
              y: [0, 10 + Math.random() * 10, 0],
              opacity: [0.2, 0.8, 0.2],
            }}
            transition={{
              duration,
              repeat: Infinity,
              repeatType: "mirror",
              ease: "easeInOut",
            }}
          />
        );
      })}
    </div>
  );
}
