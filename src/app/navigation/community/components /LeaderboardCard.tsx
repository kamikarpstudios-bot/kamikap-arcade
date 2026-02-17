"use client";

import { useState } from "react";
import CardShell from "./CardShell";

type LeaderboardEntry = {
  rank: number;
  player: string;
  value: number | string;
};

type GameLeaderboard = {
  id: number;
  game: string;
  metricLabel: string;
  entries: LeaderboardEntry[];
};

type Props = {
  className?: string;
};

const leaderboards: GameLeaderboard[] = [
  {
    id: 1,
    game: "Space Blaster",
    metricLabel: "High Score",
    entries: [
      { rank: 1, player: "PlayerOne", value: 3200 },
      { rank: 2, player: "PlayerTwo", value: 2800 },
      { rank: 3, player: "PlayerThree", value: 2500 },
      { rank: 4, player: "SpeedDemon", value: 2200 },
      { rank: 5, player: "NeonAce", value: 2000 },
      { rank: 6, player: "VoidRunner", value: 1800 },
    ],
  },
  {
    id: 2,
    game: "Pixel Racer",
    metricLabel: "Fastest Time",
    entries: [
      { rank: 1, player: "SpeedDemon", value: "01:32.456" },
      { rank: 2, player: "NeonAce", value: "01:35.102" },
      { rank: 3, player: "VoidRunner", value: "01:38.778" },
      { rank: 4, player: "TurboMax", value: "01:42.333" },
      { rank: 5, player: "Rocket", value: "01:44.890" },
    ],
  },
  {
    id: 3,
    game: "Laser Strike",
    metricLabel: "Kills",
    entries: [
      { rank: 1, player: "BlasterX", value: 45 },
      { rank: 2, player: "Photon", value: 41 },
      { rank: 3, player: "Nova", value: 38 },
      { rank: 4, player: "LaserKid", value: 34 },
      { rank: 5, player: "ShotgunSam", value: 30 },
    ],
  },
];

export default function LeaderboardCard({ className }: Props) {
  const [currentGame, setCurrentGame] = useState(0);
  const lb = leaderboards[currentGame];

  return (
    <CardShell title="Leaderboard" className={className}>
      {/* Game navigation */}
      <div className="flex items-center justify-between mb-3">
        <button
          onClick={() =>
            setCurrentGame(
              currentGame === 0 ? leaderboards.length - 1 : currentGame - 1
            )
          }
          className="px-3 py-1 bg-gray-800 hover:bg-gray-700 text-white rounded"
        >
          ◀
        </button>

        <div className="text-center text-sm text-white/70 font-semibold">
          {lb.game} — {lb.metricLabel}
        </div>

        <button
          onClick={() =>
            setCurrentGame(
              currentGame === leaderboards.length - 1 ? 0 : currentGame + 1
            )
          }
          className="px-3 py-1 bg-gray-800 hover:bg-gray-700 text-white rounded"
        >
          ▶
        </button>
      </div>

      {/* Column headers */}
      <div className="grid grid-cols-[48px_1fr_96px] text-xs uppercase tracking-wide text-white/50 border-b border-white/10 pb-1 mb-2">
        <span>#</span>
        <span>Player</span>
        <span className="text-right">{lb.metricLabel}</span>
      </div>

      {/* Scrollable leaderboard */}
      <div className="max-h-64 overflow-y-auto pr-2 space-y-1 scrollbar-dark">
        {lb.entries.map((entry) => (
          <div
            key={entry.rank}
            className="grid grid-cols-[48px_1fr_96px] items-center px-2 py-2 rounded bg-white/5 hover:bg-white/10 transition-colors"
          >
            <span
              className={`font-bold ${
                entry.rank === 1
                  ? "text-yellow-400"
                  : entry.rank === 2
                  ? "text-gray-300"
                  : entry.rank === 3
                  ? "text-amber-600"
                  : "text-white/70"
              }`}
            >
              {entry.rank}
            </span>

            <span className="truncate">{entry.player}</span>

            <span className="text-right font-mono">{entry.value}</span>
          </div>
        ))}
      </div>
    </CardShell>
  );
}
