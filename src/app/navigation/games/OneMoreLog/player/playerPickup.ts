import { startPlayerAnimation } from "./playerAnimations";
import type { Player } from "./player";
import type { HandItem } from "./playerHeldItems";
import type { HandSide } from "./playerHands";

export type PendingPickup = {
  hand: HandSide;
  kind: HandItem;
  target: { x: number; y: number };
  resolveAt: number;
};

export function beginPickup(
  player: Player,
  hand: HandSide,
  kind: HandItem,
  target: { x: number; y: number }
): PendingPickup {
  startPlayerAnimation(player, hand === "left" ? "pickup-left" : "pickup-right");

  return {
    hand,
    kind,
    target,
    resolveAt: 0.18,
  };
}

export function updatePendingPickup(
  pendingPickup: PendingPickup | null,
  dt: number
) {
  if (!pendingPickup) return null;

  pendingPickup.resolveAt -= dt;

  if (pendingPickup.resolveAt <= 0) {
    return {
      finished: true as const,
      result: pendingPickup,
    };
  }

  return {
    finished: false as const,
    result: pendingPickup,
  };
}