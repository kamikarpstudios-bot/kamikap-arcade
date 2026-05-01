export type PlayerFacing =
  | "down"
  | "down-left"
  | "left"
  | "up-left"
  | "up"
  | "up-right"
  | "right"
  | "down-right";

export type PlayerAnimationName =
  | "none"
  | "pickup-left"
  | "pickup-right";

export type PlayerAnimationState = {
  name: PlayerAnimationName;
  time: number;
  duration: number;
  locked: boolean;
};

export type Player = {
  x: number;
  y: number;
  vx: number;
  vy: number;
  speed: number;
  facing: PlayerFacing;
  isMoving: boolean;
  walkTime: number;
  scale: number;
  animation: PlayerAnimationState;
};

export function createPlayer(x: number, y: number): Player {
  return {
    x,
    y,
    vx: 0,
    vy: 0,
    speed: 50,
    facing: "down",
    isMoving: false,
    walkTime: 0,
    scale: 1,
    animation: {
      name: "none",
      time: 0,
      duration: 0,
      locked: false,
    },
  };
}

export function getFacingFromMovement(vx: number, vy: number): PlayerFacing {
  if (vx === 0 && vy === 0) return "down";

  const angle = Math.atan2(vy, vx);

  if (angle >= -Math.PI / 8 && angle < Math.PI / 8) return "right";
  if (angle >= Math.PI / 8 && angle < (3 * Math.PI) / 8) return "down-right";
  if (angle >= (3 * Math.PI) / 8 && angle < (5 * Math.PI) / 8) return "down";
  if (angle >= (5 * Math.PI) / 8 && angle < (7 * Math.PI) / 8) return "down-left";
  if (angle >= (7 * Math.PI) / 8 || angle < -(7 * Math.PI) / 8) return "left";
  if (angle >= -(7 * Math.PI) / 8 && angle < -(5 * Math.PI) / 8) return "up-left";
  if (angle >= -(5 * Math.PI) / 8 && angle < -(3 * Math.PI) / 8) return "up";
  return "up-right";
}