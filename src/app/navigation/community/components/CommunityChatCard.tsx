"use client";

import { useState, useRef, useEffect } from "react";
import CardShell from "./CardShell";

export default function CommunityChatCard({ className }: { className?: string }) {
  const [messages, setMessages] = useState(
    Array.from({ length: 40 }).map((_, i) => ({
      id: i,
      user: i % 7 === 0 ? "DevAlice" : `User${i}`,
      isDev: i % 7 === 0,
      avatar: `https://i.pravatar.cc/40?img=${(i % 10) + 1}`,
      text: `Test message ${i + 1}`,
    }))
  );

  const [input, setInput] = useState("");

  // 👇 auto-scroll anchor
  const bottomRef = useRef<HTMLDivElement | null>(null);

  // 👇 scroll when messages change
  const didMountRef = useRef(false);

useEffect(() => {
  if (didMountRef.current) {
    // scroll only if this is NOT the first render
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  } else {
    didMountRef.current = true;
  }
}, [messages]);


  const send = () => {
    if (!input.trim()) return;

    setMessages(prev => [
      ...prev,
      {
        id: Date.now(),
        user: "You",
        isDev: false,
        avatar: "https://i.pravatar.cc/40?img=5",
        text: input,
      },
    ]);

    setInput("");
  };

  return (
    <CardShell
      title="Community Chat"
      className={`${className} h-[600px] flex flex-col`}
    >
      {/* SCROLL AREA */}
      <div className="overflow-y-auto scrollbar-dark space-y-3 pr-2 max-h-[680px]">
        {messages.map(m => (
          <div key={m.id} className="flex gap-3">
            <div
              className={`w-10 h-10 rounded-full overflow-hidden ${
                m.isDev
                  ? "border-2 border-blue-400 shadow-[0_0_8px_rgba(59,130,246,0.8)]"
                  : ""
              }`}
            >
              <img src={m.avatar} className="w-full h-full object-cover" />
            </div>

            <div>
              <p className={`font-semibold ${m.isDev ? "text-blue-400" : "text-white"}`}>
                {m.user}
              </p>
              <p className="text-sm text-white/80">{m.text}</p>
            </div>
          </div>
        ))}

        {/* 👇 scroll target */}
        <div ref={bottomRef} />
      </div>

      {/* INPUT ROW */}
      <div className="mt-auto pt-3 flex gap-3 items-center border-t border-white/10">
        {/* YOUR AVATAR */}
        <div className="w-10 h-10 rounded-full overflow-hidden">
          <img
            src="https://i.pravatar.cc/40?img=5"
            className="w-full h-full object-cover"
          />
        </div>

        {/* INPUT + SEND */}
        <input
          value={input}
          onChange={e => setInput(e.target.value)}
          onKeyDown={e => e.key === "Enter" && send()}
          placeholder="Message #community"
          className="flex-1 bg-gray-900 border border-gray-700 rounded px-3 py-2 text-white"
        />

        <button
          onClick={send}
          className="bg-blue-500 hover:bg-blue-600 px-4 py-2 rounded text-white"
        >
          Send
        </button>
      </div>
    </CardShell>
  );
}
