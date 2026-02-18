"use client";

import { useState, useEffect } from "react";
import CardShell from "./CardShell";
import { useAuth } from "@/app/lib/AuthContext";
import { db } from "@/app/lib/firebase";
import {
  collection,
  addDoc,
  deleteDoc,
  doc,
  onSnapshot,
  serverTimestamp,
  query,
  orderBy,
} from "firebase/firestore";

type Announcement = {
  id: string;
  content: string;
  createdAt: any;
};

type Props = { className?: string; isDev?: boolean };

export default function AnnouncementsCard({ className, isDev = false }: Props) {
  const { user } = useAuth();
  const [announcements, setAnnouncements] = useState<Announcement[]>([]);
  const [newPost, setNewPost] = useState("");

  // ----------------- Firestore listener -----------------
  useEffect(() => {
    const q = query(collection(db, "announcements"), orderBy("createdAt", "desc"));
    const unsubscribe = onSnapshot(q, (snap) => {
      const data: Announcement[] = snap.docs.map((d) => ({
        id: d.id,
        ...d.data(),
      } as Announcement));
      setAnnouncements(data);
    });
    return () => unsubscribe();
  }, []);

  // ----------------- Add new post -----------------
  const handlePost = async () => {
    if (!newPost.trim() || !user || !isDev) return;

    await addDoc(collection(db, "announcements"), {
      content: newPost.trim(),
      createdAt: serverTimestamp(),
    });

    setNewPost("");
  };

  // ----------------- Delete post -----------------
  const handleDelete = async (id: string) => {
    if (!isDev) return;

    const postRef = doc(db, "announcements", id);
    await deleteDoc(postRef);
  };

  const latestPost = announcements[0];
  const pastPosts = announcements.slice(1);

  return (
    <CardShell className={`${className || ""} flex flex-col`} title="Kami Karp Announcements">
      {/* Dev input */}
      {isDev && (
        <div className="mb-4 flex items-start space-x-2">
          <textarea
            className="flex-1 p-2 rounded border border-gray-600 bg-black/70 text-white placeholder-gray-400 resize-none"
            placeholder="Write a new announcement..."
            value={newPost}
            onChange={(e) => setNewPost(e.target.value)}
            rows={2}
          />
          <button
            className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded whitespace-nowrap"
            onClick={handlePost}
          >
            Post
          </button>
        </div>
      )}

      {/* Latest announcement */}
      {latestPost ? (
        <div className="mb-4 relative group">
          <span className="font-orbitron text-white text-lg block mb-1">Kami Karp</span>
          <p className="text-sm text-white/90 bg-gray-800/60 border border-gray-700 rounded-lg px-4 py-3 leading-relaxed break-words">
            {latestPost.content}
          </p>
          {isDev && (
            <button
              onClick={() => handleDelete(latestPost.id)}
              className="absolute top-1 right-1 text-red-500 hover:text-red-700 text-sm font-semibold"
            >
              Delete
            </button>
          )}
        </div>
      ) : (
        <p className="text-sm text-white/50 italic mb-4">No announcements yet</p>
      )}

      {/* Past announcements */}
      <div className="relative h-64 overflow-y-auto flex flex-col space-y-3 pr-2 p-2 rounded scrollbar-dark bg-gradient-to-b from-gray-900/80 via-gray-900/95 to-gray-900">
        {pastPosts.length > 0 ? (
          pastPosts.map((post) => (
            <div
              key={post.id}
              className="p-3 rounded bg-gray-800/70 border border-gray-700 hover:bg-gray-700/70 transition-all duration-300 transform hover:-translate-y-0.5 hover:shadow-lg break-words relative"
            >
              <span className="font-semibold text-white mb-1 block font-orbitron">
                Kami Karp
              </span>
              <p className="text-sm text-white">{post.content}</p>
              {isDev && (
                <button
                  onClick={() => handleDelete(post.id)}
                  className="absolute top-1 right-1 text-red-500 hover:text-red-700 text-sm font-semibold"
                >
                  Delete
                </button>
              )}
            </div>
          ))
        ) : (
          <p className="text-sm text-white/40 text-center py-6">No past announcements</p>
        )}
      </div>
    </CardShell>
  );
}
