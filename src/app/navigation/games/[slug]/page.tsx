"use client";

import { useParams } from "next/navigation";
import { Orbitron } from "next/font/google";
import GameLoader from "./GameLoader";
import GameComments from "./GameComments";

const orbitron = Orbitron({ subsets: ["latin"], weight: ["400", "700"] });

const gameData: Record<string, { title: string; description: string }> = {
  "dodge-field": {
    title: "Dodge Field",
    description: "Survive as long as possible while dodging incoming obstacles.",
  },
  "AlphaMonGame": {
    title: "AlphaMonGame",
    description: "Train, collect, and battle monsters in the AlphaMon world.",
  },
  "OneMoreLog": {
    title: "One More Log",
    description: "Just one more log....",
  },
  "beta-shooter": {
    title: "Beta Shooter",
    description:
      "A first-person shooter prototype with a simple viewport, center crosshair, and player view model.",
  },
  "silly-goose": {
  title: "Silly Goose",
  description:
    "Launch a goose in an inner tube from a cannon, skim grassy hills, hit water for speed, and upgrade your gear to go farther.",
},
"western-town": {
  title: "WesternTown",
  description:
      "here we go yall",
},
"Horror": {
  title: "Horror",
  description:
       "run",
},
"zom-zom": {
  title: "zom-zom",
  description:
       "zom....."
},
"driving-game": {
  title: "Driving Game",
  description:
        "drive i guess...."
},
"AnimeFighter": {
title: "AnimeGame",
description:
        "Lets Gooo"
}
};

export default function GamePage() {
  const { slug } = useParams<{ slug: string }>();
  const game = gameData[slug];

  if (!game) return <div className="text-white p-8">Game not found.</div>;

  return (
    <div className="min-h-screen text-white px-6 py-10">
      <div className="mx-auto" style={{ maxWidth: "1150px" }}>
        <div className="w-full h-[700px] bg-[#0f172a] rounded-xl border border-[#1e293b] shadow-xl overflow-hidden">
          <GameLoader slug={slug} />
        </div>

        <div className="mt-6">
          <h1 className={`${orbitron.className} text-3xl font-bold`}>
            {game.title}
          </h1>
          <p className="text-white/70 mt-3">{game.description}</p>
        </div>

        <div className="mt-12">
          <GameComments gameSlug={slug} />
        </div>
      </div>
    </div>
  );
}