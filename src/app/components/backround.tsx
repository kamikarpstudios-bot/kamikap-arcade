"use client";

import { motion } from "framer-motion";

export default function Background() {
  const particleCount = 60; // increase/decrease for more particles

  return (
    <div className="absolute inset-0 -z-10 pointer-events-none overflow-hidden">
      {/* Gradient or solid background */}
      <div className="absolute inset-0 bg-gradient-to-b from-black via-blue-950 to-black"></div>

      {/* Floating particles */}
      {[...Array(particleCount)].map((_, i) => (
        <motion.div
          key={i}
          className="w-1 h-1 bg-white rounded-full absolute"
          style={{
            top: `${Math.random() * 100}%`,
            left: `${Math.random() * 100}%`,
          }}
          animate={{
            y: [0, 10 + Math.random() * 20, 0],
            x: [0, 10 + Math.random() * 20, 0],
            opacity: [0.2, 1, 0.2],
          }}
          transition={{
            duration: 4 + Math.random() * 4,
            repeat: Infinity,
            repeatType: "mirror",
            ease: "easeInOut",
          }}
        />
      ))}
    </div>
  );
}
