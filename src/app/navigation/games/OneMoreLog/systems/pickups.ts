import type { Stick } from "../resourses/stick";
import type { Stone } from "../resourses/stone";
import type { HandItem } from "../player/playerHeldItems";
import { beginPickup, type PendingPickup } from "../player/playerPickup";
import type { Player } from "../player/player";

type PointLike = {
  x: number;
  y: number;
};

export function getNearestResource<T extends PointLike>(args: {
  player: PointLike;
  resources: T[];
  pickupRadius: number;
}) {
  let nearest: T | null = null;
  let bestDist = Infinity;

  for (const resource of args.resources) {
    const dx = args.player.x - resource.x;
    const dy = args.player.y - resource.y;
    const dist = Math.hypot(dx, dy);

    if (dist <= args.pickupRadius && dist < bestDist) {
      bestDist = dist;
      nearest = resource;
    }
  }

  return nearest;
}

export function getPickupTarget(args: {
  player: PointLike;
  sticks: PointLike[];
  stones: PointLike[];
  pickupRadius: number;
}):
  | {
      kind: HandItem;
      target: PointLike;
    }
  | null {
  const nearestStick = getNearestResource({
    player: args.player,
    resources: args.sticks,
    pickupRadius: args.pickupRadius,
  });

  const nearestStone = getNearestResource({
    player: args.player,
    resources: args.stones,
    pickupRadius: args.pickupRadius,
  });

  if (nearestStick && nearestStone) {
    const stickDist = Math.hypot(
      args.player.x - nearestStick.x,
      args.player.y - nearestStick.y
    );
    const stoneDist = Math.hypot(
      args.player.x - nearestStone.x,
      args.player.y - nearestStone.y
    );

    return stickDist <= stoneDist
      ? { kind: "stick", target: nearestStick }
      : { kind: "stone", target: nearestStone };
  }

  if (nearestStick) return { kind: "stick", target: nearestStick };
  if (nearestStone) return { kind: "stone", target: nearestStone };

  return null;
}
export function removePickedResource(
  kind: HandItem,
  target: { x: number; y: number },
  sticks: Stick[],
  stones: Stone[]
) {
  if (kind === "stick") {
    const index = sticks.findIndex(
      (stick) => Math.hypot(stick.x - target.x, stick.y - target.y) < 0.01
    );

    if (index >= 0) sticks.splice(index, 1);
    return;
  }

  const index = stones.findIndex(
    (stone) => Math.hypot(stone.x - target.x, stone.y - target.y) < 0.01
  );

  if (index >= 0) stones.splice(index, 1);
}
export function tryBeginPickup({
  player,
  hands,
  pendingPickup,
  sticks,
  stones,
  pickupRadius,
}: {
  player: Player;
  hands: {
    left: HandItem | null;
    right: HandItem | null;
  };
  pendingPickup: PendingPickup | null;
  sticks: Stick[];
  stones: Stone[];
  pickupRadius: number;
}) {
  const pickup = getPickupTarget({
    player,
    sticks,
    stones,
    pickupRadius,
  });

  if (!pickup) return pendingPickup;
  if (pendingPickup) return pendingPickup;

  if (hands.left === null) {
    return beginPickup(player, "left", pickup.kind, pickup.target);
  }

  if (hands.right === null) {
    return beginPickup(player, "right", pickup.kind, pickup.target);
  }

  return pendingPickup;
}