"use client";

import Link from "next/link";
import Image from "next/image";
import { Orbitron } from "next/font/google";
import { motion } from "framer-motion";
import { useEffect, useState } from "react";

const orbitron = Orbitron({ subsets: ["latin"], weight: ["400", "700"] });

export default function Header() {
  const navItems = [
    { label: "Home", href: "/navigation/home" },
    { label: "Community", href: "/navigation/community" },
    { label: "Profile", href: "/navigation/profile" },
    { label: "Settings", href: "/navigation/settings" },
  ];

  return (
    <header className="fixed top-0 left-0 w-full z-50 backdrop-blur-md bg-black/50 shadow-md rounded-b-lg h-16 md:h-12 overflow-hidden">
      <div className="max-w-7xl mx-auto flex items-center justify-between px-6 h-full relative z-10">
        {/* Logo + title */}
        <div className="flex items-center space-x-3">
          <Image
            src="/logo.png"
            alt="KamiKarp Logo"
            width={182}
            height={182}
            className="rounded filter invert brightness-100"
          />
          <span
            className={`${orbitron.className} text-white font-bold text-lg md:text-xl`}
          >
            KamiKarp Studios
          </span>
        </div>

        {/* Navigation */}
        <nav className="flex space-x-8 text-sm md:text-base">
          {navItems.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className={`${orbitron.className} text-white font-medium uppercase tracking-wide hover:text-blue-400 transition-colors duration-200`}
            >
              {item.label}
            </Link>
          ))}
        </nav>
      </div>

      {/* Floating stars */}
      <Stars count={50} />
    </header>
  );
}

// --------------------------------------------------------
// Stars Component (client-side only, safe for SSR)
// --------------------------------------------------------
function Stars({ count = 50 }: { count?: number }) {
  type StarType = {
    size: number;
    top: number;
    left: number;
    color: string;
    duration: number;
    delay: number;
  };

  const [stars, setStars] = useState<StarType[]>([]);

  useEffect(() => {
    // Generate stars after mount
    const colors = ["#ffffff", "#a0c4ff", "#0b1d3f"];
    const generated: StarType[] = Array.from({ length: count }, () => ({
      size: Math.random() * 2 + 1,       // 1px to 3px
      top: Math.random() * 100,          // percent
      left: Math.random() * 100,         // percent
      color: colors[Math.floor(Math.random() * colors.length)],
      duration: 6 + Math.random() * 4,   // 6-10 seconds
      delay: Math.random() * 5,
    }));
    setStars(generated);
  }, [count]);

  return (
    <div className="absolute inset-0 pointer-events-none">
      {stars.map((s, i) => (
        <motion.div
          key={i} // use index as key to avoid errors
          className="rounded-full absolute"
          style={{
            width: `${s.size}px`,
            height: `${s.size}px`,
            backgroundColor: s.color,
            top: `${s.top}%`,
            left: `${s.left}%`,
            opacity: 0.7,
          }}
          animate={{
            y: [0, 2 + Math.random() * 2, 0],
            x: [0, 2 + Math.random() * 2, 0],
            opacity: [0.6, 0.9, 0.6],
          }}
          transition={{
            duration: s.duration,
            repeat: Infinity,
            repeatType: "mirror",
            delay: s.delay,
          }}
        />
      ))}
    </div>
  );
}
