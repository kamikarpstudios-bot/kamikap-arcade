"use client";

import { useState, useMemo, useRef, useEffect } from "react";
import Link from "next/link";
import { Orbitron, Rubik_80s_Fade } from "next/font/google";
import CardShell from "../community/components/CardShell";
import { useAuth } from "../../lib/AuthContext";
import { db } from "../../lib/firebase";
import {
  collection,
  query,
  orderBy,
  onSnapshot,
  doc,
  deleteDoc,
  DocumentData,
  QuerySnapshot,
} from "firebase/firestore";

const orbitron = Orbitron({ subsets: ["latin"], weight: ["400", "700"] });
type Game = {
  id: number;
  title: string;
  slug: string;
  image: string;
};

// ==========================
// GAME COLLECTIONS
// ==========================
const games: Game[] = [
  {
    id: 1,
    title: "Dodge Field",
    slug: "dodge-field",
    image: "/games/thumbnails/DodgeField-thumb.png",
  },
  {
    id: 2,
    title: "AlphaMonGame",
    slug: "AlphaMonGame",
    image: "/games/thumbnails/KonjureKin's-thumb.png",
  },
  {
    id: 3,
    title: "OneMoreLog",
    slug: "OneMoreLog",
    image: "/games/thumbnails/OneMoreLog-thumb.png",
  },
  {
    id: 4,
    title: "Beta Shooter",
    slug: "beta-shooter",
    image: "/games/thumbnails/BetaShooter-thumb.png",
  },
  {
    id: 5,
    title: "Silly Goose",
    slug: "silly-goose",
    image: "/games/thumbnails/SillyGoose-thumb.png",
  },
  {
  id: 6,
  title: "Western Town",
  slug: "western-town",
  image: "/games/thumbnails/WesternTown-thumb.png",
},
{
  id: 7,
  title: "Horror",
  slug: "Horror",
  image: "/games/thumbnails/Horror-thumb.png",
},
{
  id:8,
  title: "zom-zom",
  slug: "zom-zom",
  image: "/games/thumbnails/ZomZom-thumb.png",
},
{
  id: 9,
  title: "Traffic Dodge",
  slug: "driving-game",
  image: "/games/thumbnails/DrivingGame-thumb.png",
},
{
  id:10,
  title: "AnimeFighter",
  slug: "AnimeFighter",
  image: "/games/thumbnails/AnimeFighter-thumb.png",
}
];
// Popular games collection (subset of games)
const popularGames: Game[] = [
  games[0], // Dodge Field
  // add other popular games here
];

// ==========================
// ANNOUNCEMENT WIDGET
// ==========================
type Announcement = {
  id: string;
  content: string;
  createdAt?: any;
};

function LatestAnnouncementWidget({ className }: { className?: string }) {
  const { user } = useAuth();
  const [latest, setLatest] = useState<Announcement | null>(null);

  useEffect(() => {
    const q = query(
      collection(db, "announcements"),
      orderBy("createdAt", "desc")
    );

    const unsubscribe = onSnapshot(
      q,
      (snapshot: QuerySnapshot<DocumentData>) => {
        const docs = snapshot.docs.map(
          (doc) => ({ id: doc.id, ...doc.data() } as Announcement)
        );
        setLatest(docs[0] || null);
      }
    );

    return () => unsubscribe();
  }, []);

  const handleDelete = async (id: string) => {
    if (!user || user.role !== "dev") return;
    await deleteDoc(doc(db, "announcements", id));
  };

  if (!latest) return null;

  return (
    <CardShell title="Latest Announcement" className={className}>
      <div className="flex justify-between items-start">
        <p className="text-white/80 text-sm">{latest.content}</p>
        {user?.role === "dev" && (
          <button
            onClick={() => handleDelete(latest.id)}
            className="ml-4 text-red-500 hover:text-red-400 text-sm font-semibold"
          >
            Delete
          </button>
        )}
      </div>
    </CardShell>
  );
}

// ==========================
// HOME PAGE COMPONENT
// ==========================
export default function HomePage() {
  const [search, setSearch] = useState("");
  const [dropdownVisible, setDropdownVisible] = useState(false);
  const searchRef = useRef<HTMLDivElement>(null);

  // Filter games for search
  const filteredGames = useMemo(() => {
    if (!search) return [];
    return games.filter((g) =>
      g.title.toLowerCase().includes(search.toLowerCase())
    );
  }, [search]);

  // Close dropdown if clicked outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (searchRef.current && !searchRef.current.contains(event.target as Node)) {
        setDropdownVisible(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
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
      {/* ==========================
          Popular Games Section
          ========================== */}
      <div className="max-w-7xl mx-auto mt-12 px-4">
        <h2 className={`${orbitron.className} text-2xl font-bold mb-4`}>
          Popular Games
        </h2>

        <div className="flex space-x-4 overflow-x-auto py-2 scrollbar-hide">
          {popularGames.map((game) => (
           <Link
  key={game.id}
  href={`/navigation/games/${game.slug}`}
  className="group relative flex-shrink-0 w-48 h-32 rounded-xl overflow-hidden bg-[#0f172a] border border-[#1e293b] shadow-lg shadow-black/40 transition-transform duration-300 hover:-translate-y-1 hover:shadow-xl"
>
  <img
    src={game.image}
    alt={game.title}
    className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
  />
  <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent flex items-end p-3">
    <span className={`${orbitron.className} text-white text-sm font-medium`}>
      {game.title}
    </span>
  </div>
</Link>
          ))}
        </div>
      </div>

      {/* ==========================
          Search Bar
          ========================== */}
      <div ref={searchRef} className="max-w-3xl mx-auto mt-8 mb-8 px-4 relative">
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
                    href={`/navigation/game/${game.slug}`} // <-- DYNAMIC slug link for search results
                    className="block px-4 py-2"
                    onClick={() => setDropdownVisible(false)}
                  >
                    {game.title}
                  </Link>
                </li>
              ))
            ) : (
              <li className="px-4 py-2 text-white/50">No results found</li>
            )}
          </ul>
        )}
      </div>

      {/* ==========================
          Latest Announcement
          ========================== */}
      <LatestAnnouncementWidget className="max-w-7xl mx-auto px-4 mb-8" />

      {/* ==========================
          All Games Grid
          ========================== */}
      <div className="px-8 pb-12">
        <h2 className={`${orbitron.className} text-2xl font-bold mb-4`}>
          All Games
        </h2>

        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
          {games.map((game) => (
           <Link
  key={game.id}
  href={`/navigation/games/${game.slug}`}
  className="group relative w-full h-40 rounded-xl overflow-hidden bg-[#0f172a] border border-[#1e293b] shadow-lg shadow-black/40 transition-transform duration-300 hover:-translate-y-1 hover:shadow-xl"
>
  <img
    src={game.image}
    alt={game.title}
    className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
  />
  <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent flex items-end p-3">
    <span className={`${orbitron.className} text-white text-sm font-medium`}>
      {game.title}
    </span>
  </div>
</Link>
          ))}
        </div>
      </div>
    </div>
  );
}
