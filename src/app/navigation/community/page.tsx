"use client";

import { useAuth } from "@/app/lib/AuthContext";
import LeaderboardCard from "./components/LeaderboardCard";
import AnnouncementsCard from "./components/AnnouncemensCard"; // fixed typo
import PollsCard from "./components/PollsCard";
import GameSuggestionsCard from "./components/GameSuggestionsCard";
import CommunityChatCard from "./components/CommunityChatCard";

// =======================
// COMMUNITY PAGE
// =======================
export default function CommunityPage() {
  const { user, loading } = useAuth();

  if (loading) {
    return (
      <div className="text-white text-center mt-10">
        Loading community...
      </div>
    );
  }

  const isDev = user?.role === "dev"; // DEV MODE check

  // helper to add consistent transparent card styling
  const cardClass = "bg-black/70 backdrop-blur-sm rounded-xl p-3 shadow-lg shadow-black/40";

  return (
    <div className="relative min-h-screen text-white overflow-hidden">
      {/* CONTENT */}
      <div className="relative z-10 mx-auto max-w-7xl px-6 py-8 space-y-8">
        {/* TOP ROW */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2">
            <div className={cardClass}>
              <AnnouncementsCard className="h-64 lg:h-80" isDev={isDev} />
            </div>
          </div>
          <div>
            <div className={cardClass}>
              <LeaderboardCard className="h-64 lg:h-80" />
            </div>
          </div>
        </div>

        {/* MIDDLE ROW */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div>
            <div className={cardClass}>
              <PollsCard className="h-64 lg:h-80" />
            </div>
          </div>
          <div className="lg:col-span-2">
            <div className={cardClass}>
              <GameSuggestionsCard className="h-64 lg:h-80" />
            </div>
          </div>
        </div>

        {/* BOTTOM ROW */}
        <div>
          <div className={cardClass}>
            <CommunityChatCard className="h-[600px] lg:h-[800px]" />
          </div>
        </div>
      </div>
    </div>
  );
}
