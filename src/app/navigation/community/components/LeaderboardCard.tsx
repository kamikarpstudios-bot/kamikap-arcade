"use client";

import CardShell from "./CardShell";

type Props = { className?: string };

export default function LeaderboardCard({ className }: Props) {
  return (
    <CardShell title="Leaderboard" className={className}>
      <div className="flex items-center justify-center h-64 text-white/70 text-sm font-semibold">
        Coming Soon
      </div>
    </CardShell>
  );
}
