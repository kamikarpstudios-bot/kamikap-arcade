"use client";

import { useState, useEffect, useRef } from "react";
import CardShell from "./CardShell";
import { useAuth } from "@/app/lib/AuthContext";
import { collection, addDoc, query, orderBy, onSnapshot, serverTimestamp, deleteDoc, doc } from "firebase/firestore";
import { db } from "@/app/lib/firebase";

type Message = {
  id: string;
  username: string;
  avatar: string;
  text: string;
  createdAt?: any;
  isDev?: boolean;
};

export default function CommunityChatCard({ className }: { className?: string }) {
  const { user } = useAuth();
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState("");
  const bottomRef = useRef<HTMLDivElement | null>(null);
  const firstLoad = useRef(true);

  // ----------------- Real-time listener -----------------
  useEffect(() => {
    const q = query(collection(db, "chat"), orderBy("createdAt", "asc"));
    const unsubscribe = onSnapshot(q, snapshot => {
      setMessages(snapshot.docs.map(doc => ({
        id: doc.id,
        ...(doc.data() as Omit<Message, "id">)
      })));
    });
    return () => unsubscribe();
  }, []);


  // ----------------- Send message -----------------
  const send = async () => {
    if (!input.trim() || !user) return;

    await addDoc(collection(db, "chat"), {
      username: user.username,
      avatar: user.profilePic || "😀",
      text: input,
      createdAt: serverTimestamp(),
      isDev: user.role === "dev",
    });

    setInput("");
  };

  // ----------------- Delete message -----------------
  const handleDelete = async (id: string) => {
    if (user?.role !== "dev") return;
    await deleteDoc(doc(db, "chat", id));
  };

  return (
    <CardShell title="Community Chat" className={`${className} flex flex-col`}>
      {/* SCROLLABLE CHAT AREA */}
      <div className="flex-1 min-h-0 max-h-[680px] overflow-y-auto scrollbar-dark space-y-3 pr-2">
        {messages.map(m => (
          <div key={m.id} className="flex gap-3 items-center relative">
            <div className={`w-10 h-10 rounded-full flex items-center justify-center text-2xl border ${m.isDev ? "border-2 border-blue-400 shadow-[0_0_8px_rgba(59,130,246,0.8)]" : "border-white/20"}`}>
              {m.avatar}
            </div>
            <div className="flex-1">
              <p className={`font-semibold ${m.isDev ? "text-blue-400" : "text-white"}`}>{m.username}</p>
              <p className="text-sm text-white/80 break-words">{m.text}</p>
            </div>

            {user?.role === "dev" && (
              <button onClick={() => handleDelete(m.id)} className="absolute right-0 top-1 text-red-500 hover:text-red-700 text-sm font-semibold">🗑</button>
            )}
          </div>
        ))}
        <div ref={bottomRef} />
      </div>

      {/* INPUT ROW */}
      <div className="mt-3 flex gap-3 items-center border-t border-white/10">
        <div className="w-10 h-10 rounded-full flex items-center justify-center text-2xl border border-white/20">
          {user?.profilePic || "😀"}
        </div>
        <input
          value={input}
          onChange={e => setInput(e.target.value)}
          onKeyDown={e => e.key === "Enter" && send()}
          placeholder="Type a message..."
          className="flex-1 bg-gray-900 border border-gray-700 rounded px-3 py-2 text-white"
        />
        <button onClick={send} className="bg-blue-500 hover:bg-blue-600 px-4 py-2 rounded text-white">
          Send
        </button>
      </div>
    </CardShell>
  );
}
