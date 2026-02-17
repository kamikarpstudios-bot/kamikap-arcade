"use client";

import { useState } from "react";
import CardShell from "./CardShell";

type Suggestion = {
  id: number;
  user: string;
  avatar: string;
  text: string;
  likes: number;
};

type Props = { className?: string };

export default function GameSuggestionsCard({ className }: Props) {
  const [suggestions, setSuggestions] = useState<Suggestion[]>([
    { id: 1, user: "Alice", avatar: "https://i.pravatar.cc/40?img=1", text: "💡 Add new levels with secret rooms and Easter eggs!", likes: 5 },
    { id: 2, user: "Bob", avatar: "https://i.pravatar.cc/40?img=2", text: "🎨 Customizable avatars with hats and pets", likes: 8 },
    { id: 3, user: "Charlie", avatar: "https://i.pravatar.cc/40?img=3", text: "🌐 Multiplayer mode with 2v2 co-op challenges", likes: 3 },
  ]);

  const [likedIds, setLikedIds] = useState<number[]>([]);
  const [newIdea, setNewIdea] = useState("");

  const addSuggestion = () => {
    if (!newIdea.trim()) return;
    setSuggestions([
      { id: Date.now(), user: "You", avatar: "https://i.pravatar.cc/40?img=5", text: newIdea, likes: 0 },
      ...suggestions,
    ]);
    setNewIdea("");
  };

  const likeSuggestion = (id: number) => {
    if (likedIds.includes(id)) return; // one like per user
    setSuggestions(prev => prev.map(s => s.id === id ? { ...s, likes: s.likes + 1 } : s));
    setLikedIds(prev => [...prev, id]);
  };

  const topSuggestions = [...suggestions].sort((a, b) => b.likes - a.likes).slice(0, 3);

  return (
    <div className={`flex gap-6 ${className}`}>
      {/* LEFT: Feed */}
      <div className="flex-1 flex flex-col gap-3">
        <CardShell title="" className="p-3 flex flex-col">
          {/* Posting bar */}
          <div className="flex items-center gap-3 mb-3">
            <img src="https://i.pravatar.cc/40?img=5" alt="User" className="w-10 h-10 rounded-full" />
            <input
              type="text"
              placeholder="Share your game idea..."
              value={newIdea}
              onChange={(e) => setNewIdea(e.target.value)}
              className="flex-1 border border-gray-600 bg-gray-900/60 text-white placeholder-gray-400 rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-400"
            />
            <button
              onClick={addSuggestion}
              className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600"
            >
              Post
            </button>
          </div>

          {/* Scrollable feed with fixed height */}
          <div className="relative h-64 overflow-y-auto flex flex-col space-y-3 pr-2 p-2 rounded scrollbar-dark bg-gradient-to-b from-gray-900/80 via-gray-900/95 to-gray-900">
            {suggestions.map((s) => (
              <div
                key={s.id}
                className="p-3 rounded bg-gray-800/70 border border-gray-700 hover:bg-gray-700/70 transition-all duration-300 transform hover:-translate-y-0.5 hover:shadow-lg flex justify-between items-start"
              >
                <div className="flex items-start gap-3">
                  <img src={s.avatar} alt={s.user} className="w-10 h-10 rounded-full mt-1" />
                  <div>
                    <p className="font-semibold text-white">{s.user}</p>
                    <p className="text-sm text-white/80 break-words">{s.text}</p>
                  </div>
                </div>
                <button
                  onClick={() => likeSuggestion(s.id)}
                  className={`flex items-center gap-1 text-sm mt-1 ${
                    likedIds.includes(s.id) ? "text-gray-400 cursor-not-allowed" : "text-blue-500 hover:text-blue-700"
                  }`}
                  disabled={likedIds.includes(s.id)}
                >
                  👍 {s.likes}
                </button>
              </div>
            ))}

            {suggestions.length === 0 && (
              <p className="text-sm text-white/40 text-center py-6">
                No suggestions yet
              </p>
            )}

            <div className="absolute inset-0 pointer-events-none animate-gradient-slow rounded"></div>
          </div>
        </CardShell>
      </div>

      {/* RIGHT: Top 3 Leaderboard */}
      <div className="w-80 flex flex-col gap-3">
        <CardShell title="Top Game Ideas" className="p-3 flex flex-col">
          <div className="relative h-64 overflow-y-auto flex flex-col space-y-2 pr-2 p-2 rounded scrollbar-dark bg-gradient-to-b from-gray-900/80 via-gray-900/95 to-gray-900">
            {topSuggestions.map((s) => (
              <div key={s.id} className="p-2 rounded bg-gray-800/70 border border-gray-700 hover:bg-gray-700/70 transition-all duration-300 transform hover:-translate-y-0.5 hover:shadow-lg flex justify-between items-start">
                <div className="flex items-start gap-2">
                  <img src={s.avatar} alt={s.user} className="w-8 h-8 rounded-full mt-1" />
                  <div>
                    <p className="font-semibold text-sm text-white">{s.user}</p>
                    <p className="text-sm text-white/80 break-words">{s.text}</p>
                  </div>
                </div>
                <span className="text-blue-500 font-semibold">{s.likes} 👍</span>
              </div>
            ))}

            {topSuggestions.length === 0 && (
              <p className="text-sm text-white/40 text-center py-6">
                No top ideas yet
              </p>
            )}

            <div className="absolute inset-0 pointer-events-none animate-gradient-slow rounded"></div>
          </div>
        </CardShell>
      </div>
    </div>
  );
}
