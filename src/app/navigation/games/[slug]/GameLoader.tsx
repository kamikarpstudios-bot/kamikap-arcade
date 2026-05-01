"use client";

import dynamic from "next/dynamic";

type Props = { slug: string };

const gameRegistry: Record<string, any> = {
  "dodge-field": dynamic(
    () => import("../dodge-field/DodgeFieldGame"),
    { ssr: false }
  ),
  "AlphaMonGame": dynamic(
    () => import("../KamiKarpAlphaMon/AlphaMonGame"),
    { ssr: false }
  ),
  "OneMoreLog": dynamic(
    () => import("../OneMoreLog/OneMoreLogGame"),
    { ssr: false }
  ),
  "beta-shooter": dynamic(
    () => import("../beta-shooter/BetaShooterGame"),
    { ssr: false }
  ),
  "silly-goose": dynamic(
  () => import("../silly-goose/SillyGooseGame"),
  { ssr: false }
),
"western-town": dynamic(
  () => import("../WesternTown/western-town"),
  { ssr: false }
),
"Horror": dynamic(
  () => import ("../Horror/Horror"),
  { ssr: false }
),
"zom-zom": dynamic(
  () => import ("../ZomZom/zom-zom"),
  {ssr: false }
),
"driving-game": dynamic(
  () => import ("../DrivingGame/driving-game"),
  {ssr: false}
),
"AnimeFighter": dynamic(
  () => import ("../AnimeFighter/AnimeFighter"),
  {ssr: false}
)
};

export default function GameLoader({ slug }: Props) {
  const GameComponent = gameRegistry[slug];

  if (!GameComponent) {
    return (
      <div className="text-white/70 flex items-center justify-center h-full">
        Game component not found.
      </div>
    );
  }

  return <GameComponent />;
}