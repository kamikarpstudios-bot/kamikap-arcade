"use client";

import { useState } from "react";
import CardShell from "./CardShell";
import Image from "next/image";

type Post = { id: number; content: string };
type Props = { className?: string; isDev?: boolean };

export default function AnnouncementsCard({ className, isDev = false }: Props) {
  const [posts, setPosts] = useState<Post[]>([
    { id: 1, content: "🚀 New game coming soon" },
    { id: 2, content: "🛠 Maintenance scheduled" },
    { id: 3, content: "🎉 Community milestone reached" },
    { id: 4, content: "🎮 Another post to test scrolling" },
    { id: 5, content: "📢 Update your clients!" },
    { id: 6, content: "💡 New feature coming soon" },
  ]);

  const [newPost, setNewPost] = useState("");

  const handlePost = () => {
    if (!newPost.trim()) return;
    const post: Post = { id: posts.length + 1, content: newPost.trim() };
    setPosts([post, ...posts]);
    setNewPost("");
  };

  return (
   <CardShell className={`${className || ""} flex flex-col`} title="Kami Karp Announcements">
  {/* Header: logo + name + latest announcement */}
  <div className="flex items-start space-x-4 mb-6">
    {/* Logo */}
    <div className="w-20 h-20 relative rounded-full overflow-hidden flex-shrink-0">
      <Image
        src="/logo.png"
        alt="Kami Karp Logo"
        fill
        className="object-cover filter invert brightness-300"
      />
    </div>

    {/* Name + latest post */}
    <div className="flex-1">
      <span className="font-orbitron text-white text-lg block mb-1">
        Kami Karp
      </span>

      {posts[0] ? (
        <p className="text-sm text-white/90 bg-gray-800/60 border border-gray-700 rounded-lg px-4 py-3 leading-relaxed">
          {posts[0].content}
        </p>
      ) : (
        <p className="text-sm text-white/50 italic">
          No announcements yet
        </p>
      )}
    </div>
  </div>

  {/* Dev input */}
  {isDev && (
    <div className="mb-4">
      <textarea
        className="w-full p-2 rounded border border-gray-600 bg-black/70 text-white placeholder-gray-400 resize-none"
        placeholder="Write a new announcement..."
        value={newPost}
        onChange={(e) => setNewPost(e.target.value)}
        rows={2}
      />
      <button
        className="mt-2 px-4 py-1 bg-blue-600 hover:bg-blue-700 text-white rounded"
        onClick={handlePost}
      >
        Post
      </button>
    </div>
  )}

  {/* Past announcements */}
  <div className="relative h-64 overflow-y-auto flex flex-col space-y-3 pr-2 p-2 rounded scrollbar-dark bg-gradient-to-b from-gray-900/80 via-gray-900/95 to-gray-900">
    <div className="absolute inset-0 pointer-events-none animate-gradient-slow rounded"></div>

    {posts.slice(1).map((post) => (
      <div
        key={post.id}
        className="p-3 rounded bg-gray-800/70 border border-gray-700 hover:bg-gray-700/70 transition-all duration-300 transform hover:-translate-y-0.5 hover:shadow-lg"
      >
        <span className="font-semibold text-white mb-1 block font-orbitron">
          Kami Karp
        </span>
        <p className="text-sm text-white">{post.content}</p>
      </div>
    ))}

    {posts.length <= 1 && (
      <p className="text-sm text-white/40 text-center py-6">
        No past announcements
      </p>
    )}
  </div>
</CardShell>
  );
}



