"use client";

import { useState } from "react";
import CardShell from "./CardShell";

type Props = { className?: string; isDev?: boolean };

type Suggestion = { id: number; name: string; votes: number };

export default function PollsCard({ className, isDev = false }: Props) {
  const [suggestions, setSuggestions] = useState<Suggestion[]>([
    { id: 1, name: "Space Shooter", votes: 5 },
    { id: 2, name: "Fantasy RPG", votes: 3 },
    { id: 3, name: "Puzzle Adventure", votes: 2 },
  ]);

  const [newGame, setNewGame] = useState("");
  const [votedId, setVotedId] = useState<number | null>(null);

  const handleAdd = () => {
    if (!newGame.trim()) return;
    const newSuggestion: Suggestion = {
      id: suggestions.length + 1,
      name: newGame.trim(),
      votes: 0,
    };
    setSuggestions([newSuggestion, ...suggestions]);
    setNewGame("");
  };

  const handleVote = (id: number) => {
    setSuggestions((prev) =>
      prev.map((s) => {
        if (s.id === id && votedId !== id) return { ...s, votes: s.votes + 1 };
        if (s.id === votedId && votedId !== id) return { ...s, votes: s.votes - 1 };
        return s;
      })
    );
    setVotedId((prev) => (prev === id ? prev : id));
  };

  return (
    <CardShell title="Polls" className={className}>
      {/* Subtitle / instruction */}
      <p className="text-white/60 text-xs mb-2">Vote for our next game!</p>

      <div className="flex flex-col space-y-3">
        {/* Dev input */}
        {isDev && (
          <div className="flex space-x-2">
            <input
              type="text"
              placeholder="Add a new game..."
              value={newGame}
              onChange={(e) => setNewGame(e.target.value)}
              className="flex-1 px-3 py-2 rounded border border-gray-600 bg-black/70 text-white placeholder-gray-400"
            />
            <button
              onClick={handleAdd}
              className="px-4 py-2 rounded bg-blue-600 hover:bg-blue-700 text-white"
            >
              Add
            </button>
          </div>
        )}

        {/* Suggestions list */}
        <ul className="flex flex-col space-y-2">
          {suggestions.map((s) => (
            <li
              key={s.id}
              className={`
                px-3 py-2 rounded-lg cursor-pointer flex justify-between items-center
                transition-all duration-200
                ${votedId === s.id ? "bg-blue-700/60 text-white font-semibold" : "bg-gray-800/50 hover:bg-gray-700/50 text-white/80"}
              `}
              onClick={() => !isDev && handleVote(s.id)}
            >
              <span>{s.name}</span>
              <span className="text-white/70 font-semibold">{s.votes}</span>
            </li>
          ))}
        </ul>

        {suggestions.length === 0 && (
          <p className="text-white/50 text-center py-6">No suggestions yet</p>
        )}
      </div>
    </CardShell>
  );
}
