import type { Player } from "./player";
import { getPlayerPose } from "./playerAnimations";
import type { HandItem } from "./playerHeldItems";
import type { Stick } from "../resourses/stick";
import type { Stone } from "../resourses/stone";

export type HandSide = "left" | "right";

export type HandAnchor = {
  x: number;
  y: number;
  rotation: number;
};

export function getHeldItemLayer(
  facing: Player["facing"],
  side: HandSide
): "front" | "back" {
  switch (facing) {
    case "up":
    case "up-left":
    case "up-right":
      return "back";

    case "down":
      return "front";

    case "left":
      return side === "left" ? "front" : "back";

    case "right":
      return side === "left" ? "back" : "front";

    case "down-left":
    case "down-right":
      return "front";

    default:
      return "front";
  }
}

export function getPlayerHandAnchors(player: Player): {
  left: HandAnchor;
  right: HandAnchor;
} {
  const walkA = player.isMoving ? Math.sin(player.walkTime * 10) : 0;
  const walkB = player.isMoving
    ? Math.sin(player.walkTime * 10 + Math.PI)
    : 0;
  const bob = player.isMoving ? Math.sin(player.walkTime * 20) * 0.9 : 0;
  const pose = getPlayerPose(player);

  if (player.facing === "down") {
    const torsoX = 0;
    const torsoY = 4 + bob + pose.bodyYOffset;

    const leftShoulderX = torsoX - 7.5;
    const rightShoulderX = torsoX + 7.5;
    const shoulderY = torsoY - 3.5;

    const leftArmY = shoulderY + 4 + walkB * 0.9 + pose.leftArmReach;
    const rightArmY = shoulderY + 4 + walkA * 0.9 + pose.rightArmReach;

    const leftArmRot = 0.18 + walkB * 0.16 + pose.leftArmSwingAdd;
    const rightArmRot = -0.18 + walkA * 0.16 + pose.rightArmSwingAdd;

    return {
      left: {
        x: player.x + leftShoulderX,
        y: player.y + leftArmY + 7.2,
        rotation: leftArmRot,
      },
      right: {
        x: player.x + rightShoulderX,
        y: player.y + rightArmY + 7.2,
        rotation: rightArmRot,
      },
    };
  }

  if (player.facing === "up") {
    const torsoX = 0;
    const torsoY = 4 + bob;

    const leftShoulderX = torsoX - 7.2;
    const rightShoulderX = torsoX + 7.2;
    const shoulderY = torsoY - 3.3;

    const leftArmY = shoulderY + 4 + walkB * 0.85;
    const rightArmY = shoulderY + 4 + walkA * 0.85;

    const leftArmRot = 0.14 + walkB * 0.14;
    const rightArmRot = -0.14 + walkA * 0.14;

    return {
      left: {
        x: player.x + leftShoulderX,
        y: player.y + leftArmY + 7.0,
        rotation: leftArmRot,
      },
      right: {
        x: player.x + rightShoulderX,
        y: player.y + rightArmY + 7.0,
        rotation: rightArmRot,
      },
    };
  }

  if (player.facing === "left" || player.facing === "right") {
    const side: -1 | 1 = player.facing === "left" ? -1 : 1;

    const torsoX = 1.8 * side;
    const torsoY = 4 + bob;

    const backShoulderX = torsoX - 4.8 * side;
    const frontShoulderX = torsoX + 5.2 * side;
    const shoulderY = torsoY - 3.6;

    const backArmY = shoulderY + 4 + walkA * 0.9;
    const frontArmY = shoulderY + 5.2 + walkB * 0.9;

    const backArmRot = 0.28 * side;
    const frontArmRot = -0.42 * side;

    const leftIsFront = side === -1;

    const left = leftIsFront
      ? {
          x: player.x + frontShoulderX + 2 * side,
          y: player.y + frontArmY + 7.1,
          rotation: frontArmRot,
        }
      : {
          x: player.x + backShoulderX,
          y: player.y + backArmY + 6.6,
          rotation: backArmRot,
        };

    const right = leftIsFront
      ? {
          x: player.x + backShoulderX,
          y: player.y + backArmY + 6.6,
          rotation: backArmRot,
        }
      : {
          x: player.x + frontShoulderX + 2 * side,
          y: player.y + frontArmY + 7.1,
          rotation: frontArmRot,
        };

    return { left, right };
  }

  const side: -1 | 1 =
    player.facing === "down-left" || player.facing === "up-left" ? -1 : 1;

  const torsoX = 1.2 * side;
  const torsoY = 4 + bob;

  const leftShoulderX = torsoX - 6.6;
  const rightShoulderX = torsoX + 6.2;
  const shoulderY = torsoY - 3.5;

  const leftArmY = shoulderY + 4.1 + walkA * 0.75;
  const rightArmY = shoulderY + 4.8 + walkB * 0.8;

  const leftArmRot = 0.12 + 0.16 * side;
  const rightArmRot = -0.1 + 0.14 * side;

  const leftIsFront =
    player.facing === "up-left" || player.facing === "down-right";

  const left = leftIsFront
    ? {
        x: player.x + leftShoulderX + 1.3 * side,
        y: player.y + leftArmY + 7.2,
        rotation: leftArmRot,
      }
    : {
        x: player.x + leftShoulderX,
        y: player.y + leftArmY + 6.8,
        rotation: leftArmRot,
      };

  const right = leftIsFront
    ? {
        x: player.x + rightShoulderX,
        y: player.y + rightArmY + 6.8,
        rotation: rightArmRot,
      }
    : {
        x: player.x + rightShoulderX + 1.3 * side,
        y: player.y + rightArmY + 7.2,
        rotation: rightArmRot,
      };

  return { left, right };
}
export function getDropOffset(facing: string, side: HandSide) {
  switch (facing) {
    case "up":
      return side === "left"
        ? { x: -10, y: -18 }
        : { x: 10, y: -18 };

    case "down":
      return side === "left"
        ? { x: -12, y: 18 }
        : { x: 12, y: 18 };

    case "left":
      return side === "left"
        ? { x: -20, y: 8 }
        : { x: -16, y: 16 };

    case "right":
      return side === "left"
        ? { x: 16, y: 16 }
        : { x: 20, y: 8 };

    case "up-left":
      return side === "left"
        ? { x: -18, y: -10 }
        : { x: -8, y: -4 };

    case "up-right":
      return side === "left"
        ? { x: 8, y: -4 }
        : { x: 18, y: -10 };

    case "down-left":
      return side === "left"
        ? { x: -18, y: 16 }
        : { x: -8, y: 12 };

    case "down-right":
      return side === "left"
        ? { x: 8, y: 12 }
        : { x: 18, y: 16 };

    default:
      return side === "left"
        ? { x: -12, y: 16 }
        : { x: 12, y: 16 };
  }
}

export function dropHeldItem({
  side,
  player,
  hands,
  pendingPickup,
  sticks,
  stones,
  createStick,
  createStone,
  clamp,
  worldWidth,
  worldHeight,
}: {
  side: HandSide;
  player: Player;
  hands: {
    left: HandItem | null;
    right: HandItem | null;
  };
  pendingPickup: unknown;
  sticks: Stick[];
  stones: Stone[];
  createStick: (x: number, y: number) => Stick;
  createStone: (x: number, y: number) => Stone;
  clamp: (value: number, min: number, max: number) => number;
  worldWidth: number;
  worldHeight: number;
}) {
  if (pendingPickup) return;

  const item = hands[side];
  if (!item) return;

  const offset = getDropOffset(player.facing, side);

  const dropX = clamp(player.x + offset.x, 20, worldWidth - 20);
  const dropY = clamp(player.y + offset.y, 20, worldHeight - 20);

  if (item === "stick") {
    sticks.push(createStick(dropX, dropY));
  } else if (item === "stone") {
    stones.push(createStone(dropX, dropY));
  }

  hands[side] = null;
}