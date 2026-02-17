"use client";

import LeaderboardCard from "./components/LeaderboardCard";
import AnnouncementsCard from "./components/AnnouncemensCard";
import PollsCard from "./components/PollsCard";
import GameSuggestionsCard from "./components/GameSuggestionsCard";
import CommunityChatCard from "./components/CommunityChatCard";

// =======================
// COMMUNITY PAGE
// =======================
export default function CommunityPage() {
  return (
    <div className="relative min-h-screen text-white overflow-hidden">
      {/* CONTENT */}
      <div className="relative z-10 mx-auto max-w-7xl px-6 py-8 space-y-8">
        {/* TOP ROW */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2">
            <AnnouncementsCard className="h-64 lg:h-80" />
          </div>
          <div>
            <LeaderboardCard className="h-64 lg:h-80" />
          </div>
        </div>

        {/* MIDDLE ROW */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div>
            <PollsCard className="h-64 lg:h-80" />
          </div>
          <div className="lg:col-span-2">
            <GameSuggestionsCard className="h-64 lg:h-80" />
          </div>
        </div>

        {/* BOTTOM ROW */}
        <div>
          <CommunityChatCard className="h-[600px] lg:h-[800px]" />
        </div>
      </div>
    </div>
  );
}
