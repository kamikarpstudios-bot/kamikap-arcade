"use client";

import { useState, useMemo, useRef, useEffect } from "react";
import Link from "next/link";
import { Orbitron } from "next/font/google";

const orbitron = Orbitron({ subsets: ["latin"], weight: ["400", "700"] });

// All games placeholder
const games: { id: number; title: string; path: string }[] = [
  { id: 1, title: "Space Blaster", path: "/games/space-blaster" },
  { id: 2, title: "Pixel Racer", path: "/games/pixel-racer" },
  { id: 3, title: "Astro Jump", path: "/games/astro-jump" },
  { id: 4, title: "Neon Puzzle", path: "/games/neon-puzzle" },
  { id: 5, title: "Cyber Quest", path: "/games/cyber-quest" },
  { id: 6, title: "Laser Strike", path: "/games/laser-strike" },
];

// Popular games placeholder
const popularGames: { id: number; title: string; path: string }[] = [
  { id: 101, title: "Space Blaster", path: "/games/space-blaster" },
  { id: 102, title: "Pixel Racer", path: "/games/pixel-racer" },
  { id: 103, title: "Laser Strike", path: "/games/laser-strike" },
];

export default function HomePage() {
  const [search, setSearch] = useState("");
  const [dropdownVisible, setDropdownVisible] = useState(false);
  const searchRef = useRef<HTMLDivElement>(null);

  const filteredGames = useMemo(() => {
    if (!search) return [];
    return games.filter((g) =>
      g.title.toLowerCase().includes(search.toLowerCase())
    );
  }, [search]);

  // Close dropdown if clicked outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        searchRef.current &&
        !searchRef.current.contains(event.target as Node)
      ) {
        setDropdownVisible(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () =>
      document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  // Close dropdown on Escape
  useEffect(() => {
    const handleKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        setDropdownVisible(false);
        setSearch("");
      }
    };
    document.addEventListener("keydown", handleKey);
    return () => document.removeEventListener("keydown", handleKey);
  }, []);

  return (
    <div className="min-h-screen w-full bg-transparent text-white overflow-y-auto">
      {/* Popular Games */}
      <div className="max-w-7xl mx-auto mt-12 px-4">
        <h2 className={`${orbitron.className} text-2xl font-bold mb-4`}>
          Popular Games
        </h2>

        <div className="flex space-x-4 overflow-x-auto py-2 scrollbar-hide">
          {popularGames.map((game) => (
            <Link
              key={game.id}
              href={game.path}
              className="flex-shrink-0 w-48 h-32 rounded-xl overflow-hidden bg-[#0f172a] border border-[#1e293b] flex items-center justify-center shadow-lg shadow-black/40 transition-transform duration-300 hover:-translate-y-1 hover:shadow-xl"
            >
              <span
                className={`${orbitron.className} text-white font-medium text-center`}
              >
                {game.title}
              </span>
            </Link>
          ))}
        </div>
      </div>

      {/* Search Bar */}
      <div
        ref={searchRef}
        className="max-w-3xl mx-auto mt-8 mb-8 px-4 relative"
      >
        <input
          type="text"
          placeholder="Search games..."
          value={search}
          onChange={(e) => {
            setSearch(e.target.value);
            setDropdownVisible(true);
          }}
          className="w-full px-4 py-3 rounded-lg bg-black/70 border border-white/30 placeholder-white/50 text-white focus:outline-none focus:border-blue-400"
        />

        {dropdownVisible && search && (
          <ul className="absolute top-full mt-1 w-full bg-black/80 backdrop-blur-md rounded-lg border border-white/30 shadow-lg z-20">
            {filteredGames.length > 0 ? (
              filteredGames.map((game) => (
                <li
                  key={game.id}
                  className="hover:bg-blue-900/40 transition-colors duration-200 cursor-pointer"
                >
                  <Link
                    href={game.path}
                    className="block px-4 py-2"
                    onClick={() => setDropdownVisible(false)}
                  >
                    {game.title}
                  </Link>
                </li>
              ))
            ) : (
              <li className="px-4 py-2 text-white/50">
                No results found
              </li>
            )}
          </ul>
        )}
      </div>

      {/* All Games Grid */}
      <div className="px-8 pb-12">
        <h2 className={`${orbitron.className} text-2xl font-bold mb-4`}>
          All Games
        </h2>

        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
          {games.map((game) => (
            <Link
              key={game.id}
              href={game.path}
              className="w-full h-40 rounded-xl overflow-hidden bg-[#0f172a] border border-[#1e293b] flex items-center justify-center shadow-lg shadow-black/40 transition-transform duration-300 hover:-translate-y-1 hover:shadow-xl"
            >
              <span className={`${orbitron.className} font-medium`}>
                {game.title}
              </span>
            </Link>
          ))}
        </div>
      </div>
    </div>
  );
}
