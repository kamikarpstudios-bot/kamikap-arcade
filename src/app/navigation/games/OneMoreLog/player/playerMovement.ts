import type { Player } from "./player";
import { getFacingFromMovement } from "./player";

export type CollisionRect = {
  x: number;
  y: number;
  width: number;
  height: number;
};

function rectsOverlap(a: CollisionRect, b: CollisionRect) {
  return (
    a.x < b.x + b.width &&
    a.x + a.width > b.x &&
    a.y < b.y + b.height &&
    a.y + a.height > b.y
  );
}

export function getPlayerCollisionBox(x: number, y: number): CollisionRect {
  return {
    x: x - 8,
    y: y + 18,
    width: 16,
    height: 10,
  };
}

export function updatePlayerMovement(args: {
  player: Player;
  dt: number;
  keys: Record<"w" | "a" | "s" | "d", boolean>;
  animationLocked: boolean;
  collisionRects: CollisionRect[];
}) {
  const { player, dt, keys, animationLocked, collisionRects } = args;

  let moveX = 0;
  let moveY = 0;

  if (keys.a) moveX -= 1;
  if (keys.d) moveX += 1;
  if (keys.w) moveY -= 1;
  if (keys.s) moveY += 1;

  if (!animationLocked && (moveX !== 0 || moveY !== 0)) {
    const length = Math.hypot(moveX, moveY);
    moveX /= length;
    moveY /= length;

    player.vx = moveX * player.speed;
    player.vy = moveY * player.speed;

    const nextX = player.x + player.vx * dt;
    const nextY = player.y + player.vy * dt;
    const nextPlayerBox = getPlayerCollisionBox(nextX, nextY);

    let blocked = false;

    for (const rect of collisionRects) {
      if (rectsOverlap(nextPlayerBox, rect)) {
        blocked = true;
        break;
      }
    }

    if (!blocked) {
      player.x = nextX;
      player.y = nextY;
    }

    player.isMoving = true;
    player.walkTime += dt;
    player.facing = getFacingFromMovement(moveX, moveY);
    return;
  }

  player.vx = 0;
  player.vy = 0;
  player.isMoving = false;
}