"use client";

import { motion } from "framer-motion";
import Link from "next/link";
import { Orbitron } from "next/font/google";

const orbitron = Orbitron({ subsets: ["latin"], weight: ["400", "700"] });

export default function HomePage() {
  const title = "KAMIKARP STUDIOS";

  return (
    <div className="relative h-screen w-screen bg-gradient-to-b from-black via-blue-950 to-black overflow-hidden">
      {/* Stretched neon logo background */}
      <motion.img
        src="/logo.png"
        alt="KamiKarp Studios / Arcade"
        className="absolute inset-0 w-full h-full object-contain pointer-events-none"
        style={{
          filter:
            "invert(1) drop-shadow(0 0 8px #0b1d3f) drop-shadow(0 0 16px #0b1d3f) drop-shadow(0 0 24px #0b1d3f)",
        }}
        animate={{
          scale: [1, 1.02, 1],
          filter: [
            "invert(1) drop-shadow(0 0 0px #0b1d3f)",
            "invert(1) drop-shadow(0 0 12px #0b1d3f)",
            "invert(1) drop-shadow(0 0 24px #0b1d3f)",
            "invert(1) drop-shadow(0 0 12px #0b1d3f)",
            "invert(1) drop-shadow(0 0 0px #0b1d3f)",
          ],
        }}
        transition={{
          duration: 4,
          repeat: Infinity,
          repeatType: "mirror",
          ease: "easeInOut",
        }}
      />

      {/* Centered overlay content */}
      <div className="relative z-10 flex flex-col items-center justify-center h-full text-center px-4">
        {/* Neon dying title */}
        <h1
          className={`${orbitron.className} text-5xl md:text-6xl font-extrabold mb-10 uppercase tracking-widest text-white`}
        >
          {title.split("").map((char, i) => (
            <motion.span
              key={i}
              className="inline-block"
              animate={{
                opacity: [1, 0.5, 1],
                textShadow: [
                  "0 0 8px #fff, 0 0 16px #fff, 0 0 24px #fff",
                  "0 0 2px #fff",
                  "0 0 8px #fff, 0 0 16px #fff, 0 0 24px #fff",
                ],
              }}
              transition={{
                duration: 2.5 + Math.random() * 2,
                repeat: Infinity,
                ease: "easeInOut",
                delay: Math.random() * 3,
              }}
            >
              {char}
            </motion.span>
          ))}
        </h1>

        {/* Studio description with soft black shadow box */}
        <div
          className={`
            max-w-xl mt-16
            rounded-3xl
            bg-black/45 backdrop-blur-md
            px-8 py-6
            text-sm md:text-base
            font-medium
            text-white/90
            leading-relaxed
            shadow-2xl shadow-black/40
          `}
        >
          <p>
            KamiKarp Studios is an independent game studio founded in 2026 in Vancouver, BC — focused on bringing the world of gaming to players’ fingertips.
            <br /><br />
            We believe the best games are made by players, for players. We build experiences we genuinely want to play ourselves.
            <br /><br />
            Community matters to us. We aim to breathe life into ideas shared by our supporters, taking inspiration, feedback, and game suggestions directly from the people who play our games.
          </p>
        </div>

        {/* Enter Arcade Button */}
        <motion.div
          className="absolute bottom-20"
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
        >
          <Link
            href="/navigation/home"
            className={`
              ${orbitron.className}
              relative inline-block px-16 py-4
              text-2xl font-bold text-white rounded-full
              bg-gradient-to-r from-blue-900 to-blue-950
              shadow-lg shadow-blue-900/50
              overflow-hidden transition-all duration-300
            `}
          >
            <span className="absolute inset-0 bg-white opacity-5 blur-xl animate-pulse rounded-full"></span>
            <span className="relative z-10">Enter the Arcade</span>
          </Link>
        </motion.div>
      </div>

      {/* Footer */}
      <div className="absolute bottom-4 w-full text-center">
        <p className="text-xs text-white/50 font-medium">KamiKarp Studios © 2026</p>
      </div>

      {/* Floating white particles */}
      <Particles />
    </div>
  );
}

// =======================
// Floating Particles Component
// =======================
function Particles() {
  return (
    <div className="absolute inset-0 pointer-events-none">
      {[...Array(50)].map((_, i) => (
        <motion.div
          key={i}
          className="w-1 h-1 bg-white rounded-full absolute"
          style={{
            top: `${Math.random() * 100}%`,
            left: `${Math.random() * 100}%`,
          }}
          animate={{
            x: [0, Math.random() * 15 - 7.5, 0],
            y: [0, Math.random() * 15 - 7.5, 0],
            opacity: [0.2, 1, 0.2],
          }}
          transition={{
            duration: 5 + Math.random() * 5,
            repeat: Infinity,
            repeatType: "mirror",
          }}
        />
      ))}
    </div>
  );
}
