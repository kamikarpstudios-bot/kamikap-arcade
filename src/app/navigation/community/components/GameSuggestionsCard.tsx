"use client";

import { useState, useEffect } from "react";
import { useAuth } from "@/app/lib/AuthContext";
import CardShell from "./CardShell";
import { db } from "@/app/lib/firebase";
import {
  collection,
  addDoc,
  doc,
  updateDoc,
  deleteDoc,
  query,
  orderBy,
  onSnapshot,
  serverTimestamp,
} from "firebase/firestore";

type Suggestion = {
  id: string;
  username: string;
  avatar: string;
  text: string;
  likes: number;
  voters: string[]; // track who voted
  createdAt: any;
};

type Props = { className?: string; maxFeedHeight?: string };

export default function GameSuggestionsCard({ className, maxFeedHeight = "h-64" }: Props) {
  const { user } = useAuth();
  const isDev = user?.role === "dev";

  const [suggestions, setSuggestions] = useState<Suggestion[]>([]);
  const [newIdea, setNewIdea] = useState("");
  const [likedIds, setLikedIds] = useState<string[]>([]);

  // ---------------- Real-time listener ----------------
  useEffect(() => {
    const q = query(collection(db, "gameSuggestions"), orderBy("createdAt", "desc"));
    const unsubscribe = onSnapshot(q, (snap) => {
      const data: Suggestion[] = snap.docs.map((d) => {
        const raw = d.data();
        return {
          id: d.id,
          username: raw.username || "unknown",
          avatar: raw.avatar || "😀",
          text: raw.text || "",
          likes: raw.likes || 0,
          voters: raw.voters || [],
          createdAt: raw.createdAt || null,
        };
      });
      setSuggestions(data);

      // Keep already voted ids
      if (user) {
        const voted = data.filter((s) => s.voters.includes(user.username));
        setLikedIds(voted.map((s) => s.id));
      }
    });

    return () => unsubscribe();
  }, [user]);

  // ---------------- Add a new suggestion ----------------
  const addSuggestion = async () => {
    if (!user || !newIdea.trim()) return;

    await addDoc(collection(db, "gameSuggestions"), {
      username: user.username,
      avatar: user.profilePic || "😀",
      text: newIdea.trim(),
      likes: 0,
      voters: [],
      createdAt: serverTimestamp(),
    });

    setNewIdea("");
  };

  // ---------------- Like / vote ----------------
  const likeSuggestion = async (s: Suggestion) => {
    if (!user || isDev) return; // devs cannot vote
    if (s.voters.includes(user.username)) return; // already voted

    const docRef = doc(db, "gameSuggestions", s.id);

    // Optimistic UI update
    setSuggestions((prev) =>
      prev.map((g) =>
        g.id === s.id
          ? { ...g, likes: g.likes + 1, voters: [...g.voters, user.username] }
          : g
      )
    );
    setLikedIds((prev) => [...prev, s.id]);

    await updateDoc(docRef, {
      likes: s.likes + 1,
      voters: [...s.voters, user.username],
    });
  };

  // ---------------- Delete suggestion (for devs) ----------------
  const deleteSuggestion = async (id: string) => {
    if (!isDev) return;
    const docRef = doc(db, "gameSuggestions", id);
    await deleteDoc(docRef);
  };

  // ---------------- Top 3 suggestions ----------------
  const topSuggestions = [...suggestions]
    .sort((a, b) => b.likes - a.likes)
    .slice(0, 3);

  // ---------------- Render ----------------
  return (
    <div className={`flex gap-6 ${className}`}>
      {/* LEFT: Feed */}
      <div className="flex-1 flex flex-col gap-3">
        <CardShell title="Game Suggestions" className="p-3 flex flex-col">
          {/* Posting bar */}
          {user && (
            <div className="flex items-start gap-3 mb-3">
              <div className="w-10 h-10 rounded-full flex items-center justify-center text-2xl border border-white/20 mt-1">
                {user.profilePic || "😀"}
              </div>
              <input
                type="text"
                placeholder="Share your game idea..."
                value={newIdea}
                onChange={(e) => setNewIdea(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === "Enter") {
                    e.preventDefault();
                    addSuggestion();
                  }
                }}
                className="flex-1 border border-gray-600 bg-gray-900/60 text-white placeholder-gray-400 rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-400 break-words"
              />
              <button
                onClick={addSuggestion}
                className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600"
              >
                Post
              </button>
            </div>
          )}

          {/* Scrollable feed */}
          <div
            className={`relative ${maxFeedHeight} overflow-y-auto flex flex-col space-y-3 pr-2 p-2 rounded scrollbar-dark bg-gradient-to-b from-gray-900/80 via-gray-900/95 to-gray-900`}
          >
            {suggestions.length > 0 ? (
              suggestions.map((s) => {
                const voted = user ? s.voters.includes(user.username) : false;
                return (
                  <div
                    key={s.id}
                    className="p-3 rounded bg-gray-800/70 border border-gray-700 hover:bg-gray-700/70 transition-all duration-300 transform hover:-translate-y-0.5 hover:shadow-lg flex justify-between items-start break-words"
                  >
                    <div className="flex items-start gap-3">
                      <div className="w-10 h-10 rounded-full flex items-center justify-center text-2xl border border-white/20 mt-1">
                        {s.avatar}
                      </div>
                      <div>
                        <p className="font-semibold text-white">{s.username}</p>
                        <p className="text-sm text-white/80 break-words">{s.text}</p>
                      </div>
                    </div>

                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => likeSuggestion(s)}
                        disabled={voted || isDev}
                        className={`flex items-center gap-1 text-sm mt-1 ${
                          voted || isDev
                            ? "text-gray-400 cursor-not-allowed"
                            : "text-blue-500 hover:text-blue-700"
                        }`}
                      >
                        👍 {s.likes}
                      </button>

                      {isDev && (
                        <button
                          onClick={() => deleteSuggestion(s.id)}
                          className="text-red-500 hover:text-red-700 text-sm"
                        >
                          🗑
                        </button>
                      )}
                    </div>
                  </div>
                );
              })
            ) : (
              <p className="text-sm text-white/40 text-center py-6">No suggestions yet</p>
            )}
          </div>
        </CardShell>
      </div>

      {/* RIGHT: Top 3 Leaderboard */}
      <div className="w-80 flex flex-col gap-3">
        <CardShell title="Top Game Ideas" className="p-3 flex flex-col">
          <div
            className={`relative ${maxFeedHeight} overflow-y-auto flex flex-col space-y-2 pr-2 p-2 rounded scrollbar-dark bg-gradient-to-b from-gray-900/80 via-gray-900/95 to-gray-900`}
          >
            {topSuggestions.length > 0 ? (
              topSuggestions.map((s) => (
                <div
                  key={s.id}
                  className="p-2 rounded bg-gray-800/70 border border-gray-700 hover:bg-gray-700/70 transition-all duration-300 transform hover:-translate-y-0.5 hover:shadow-lg flex justify-between items-start break-words"
                >
                  <div className="flex items-start gap-2">
                    <div className="w-8 h-8 rounded-full flex items-center justify-center text-xl border border-white/20 mt-1">
                      {s.avatar}
                    </div>
                    <div>
                      <p className="font-semibold text-sm text-white">{s.username}</p>
                      <p className="text-sm text-white/80 break-words">{s.text}</p>
                    </div>
                  </div>

                  {isDev && (
                    <button
                      onClick={() => deleteSuggestion(s.id)}
                      className="text-red-500 hover:text-red-700 text-sm"
                    >
                      🗑
                    </button>
                  )}

                  {!isDev && <span className="text-blue-500 font-semibold">{s.likes} 👍</span>}
                </div>
              ))
            ) : (
              <p className="text-sm text-white/40 text-center py-6">No top ideas yet</p>
            )}
          </div>
        </CardShell>
      </div>
    </div>
  );
}
