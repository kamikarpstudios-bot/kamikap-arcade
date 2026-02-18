"use client";

import { useState, useEffect } from "react";
import CardShell from "./CardShell";
import { useAuth } from "@/app/lib/AuthContext";
import { db } from "@/app/lib/firebase";
import {
  collection,
  addDoc,
  doc,
  updateDoc,
  deleteDoc,
  onSnapshot,
  query,
  orderBy,
} from "firebase/firestore";

type PollGame = {
  id: string;
  name: string;
  votes: number;
  voters: string[];
};

export default function PollsCard({ className }: { className?: string }) {
  const { user } = useAuth();
  const [games, setGames] = useState<PollGame[]>([]);
  const [newGame, setNewGame] = useState("");
  const [editingGameId, setEditingGameId] = useState<string | null>(null);
  const [editingName, setEditingName] = useState("");

  // ----------------- Real-time listener -----------------
  useEffect(() => {
    const q = query(collection(db, "pollGames"), orderBy("votes", "desc"));
    const unsubscribe = onSnapshot(q, (snap) => {
      const data: PollGame[] = snap.docs.map((d) => ({
        id: d.id,
        ...d.data(),
      })) as PollGame[];
      setGames(data);
    });
    return () => unsubscribe();
  }, []);

// ----------------- Determine if user is dev -----------------
const isDev = user?.role === "dev"; // now automatically uses AuthContext

  // ----------------- Dev adds a new game -----------------
  const handleAdd = async () => {
    if (!newGame.trim() || !isDev) return;

    await addDoc(collection(db, "pollGames"), {
      name: newGame.trim(),
      votes: 0,
      voters: [],
    });

    setNewGame("");
  };

  // ----------------- Voting -----------------
  const handleVote = async (game: PollGame) => {
    if (!user || isDev) return;

    const userId = user.username;
    if (game.voters.includes(userId)) return; // already voted

    const gameRef = doc(db, "pollGames", game.id);

    setGames((prev) =>
      prev.map((g) =>
        g.id === game.id
          ? { ...g, votes: g.votes + 1, voters: [...g.voters, userId] }
          : g
      )
    );

    await updateDoc(gameRef, {
      votes: game.votes + 1,
      voters: [...game.voters, userId],
    });
  };

  // ----------------- Dev edit/delete -----------------
  const startEditing = (game: PollGame) => {
    setEditingGameId(game.id);
    setEditingName(game.name);
  };

  const saveEdit = async (game: PollGame) => {
    if (!editingName.trim()) return;

    const gameRef = doc(db, "pollGames", game.id);
    await updateDoc(gameRef, { name: editingName.trim() });

    setEditingGameId(null);
    setEditingName("");
  };

  const cancelEdit = () => {
    setEditingGameId(null);
    setEditingName("");
  };

  const handleDelete = async (id: string) => {
    if (!isDev) return;

    const gameRef = doc(db, "pollGames", id);
    await deleteDoc(gameRef);
  };

  return (
    <CardShell title="Polls" className={className}>
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

        {/* Game list */}
        <ul className="flex flex-col space-y-2">
          {games.length > 0 ? (
            games.map((g) => {
              const userId = user?.username;
              const voted = userId ? g.voters.includes(userId) : false;
              const isEditing = editingGameId === g.id;

              return (
                <li
                  key={g.id}
                  className={`px-3 py-2 rounded-lg flex justify-between items-center transition-all duration-200 ${
                    voted
                      ? "bg-blue-700/60 text-white font-semibold cursor-default"
                      : "bg-gray-800/50 hover:bg-gray-700/50 text-white/80 cursor-pointer"
                  }`}
                >
                  {/* Left: game name */}
                  {isEditing ? (
                    <input
                      className="flex-1 px-2 py-1 rounded border border-gray-600 bg-gray-900 text-white"
                      value={editingName}
                      onChange={(e) => setEditingName(e.target.value)}
                    />
                  ) : (
                    <span
                      onClick={() => !isDev && !voted && handleVote(g)}
                      className="flex-1"
                    >
                      {g.name}
                    </span>
                  )}

                  {/* Right: votes and dev actions */}
                  <div className="flex items-center gap-2">
                    <span className="text-white/70 font-semibold">{g.votes}</span>

                    {isDev && !isEditing && (
                      <>
                        <button
                          onClick={() => startEditing(g)}
                          className="text-xs px-1 rounded bg-gray-700 hover:bg-gray-600"
                        >
                          ✏️
                        </button>
                        <button
                          onClick={() => handleDelete(g.id)}
                          className="text-xs px-1 rounded bg-red-700 hover:bg-red-600"
                        >
                          🗑️
                        </button>
                      </>
                    )}

                    {isDev && isEditing && (
                      <>
                        <button
                          onClick={() => saveEdit(g)}
                          className="text-xs px-1 rounded bg-green-700 hover:bg-green-600"
                        >
                          💾
                        </button>
                        <button
                          onClick={cancelEdit}
                          className="text-xs px-1 rounded bg-gray-700 hover:bg-gray-600"
                        >
                          ❌
                        </button>
                      </>
                    )}
                  </div>
                </li>
              );
            })
          ) : (
            <p className="text-white/50 text-center py-6">No games yet</p>
          )}
        </ul>
      </div>
    </CardShell>
  );
}
