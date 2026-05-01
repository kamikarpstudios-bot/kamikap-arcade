import type { Player } from "./player";

export type PlayerPose = {
  bodyYOffset: number;
  headYOffset: number;
  torsoLean: number;
  leftArmReach: number;
  rightArmReach: number;
  leftArmSwingAdd: number;
  rightArmSwingAdd: number;
};

function clamp(value: number, min: number, max: number) {
  return Math.max(min, Math.min(max, value));
}

function easeInOut(t: number) {
  return t < 0.5
    ? 2 * t * t
    : 1 - Math.pow(-2 * t + 2, 2) / 2;
}

export function startPlayerAnimation(
  player: Player,
  name: Player["animation"]["name"]
) {
  let duration = 0;

  switch (name) {
    case "pickup-left":
    case "pickup-right":
      duration = 0.22;
      break;
    default:
      duration = 0;
      break;
  }

  player.animation.name = name;
  player.animation.time = 0;
  player.animation.duration = duration;
  player.animation.locked = name !== "none";
}

export function updatePlayerAnimation(player: Player, dt: number) {
  if (player.animation.name === "none") return;

  player.animation.time += dt;

  if (player.animation.time >= player.animation.duration) {
    player.animation.name = "none";
    player.animation.time = 0;
    player.animation.duration = 0;
    player.animation.locked = false;
  }
}

export function isPlayerAnimationLocked(player: Player) {
  return player.animation.locked;
}

export function getPlayerPose(player: Player): PlayerPose {
  const anim = player.animation;

  const base: PlayerPose = {
    bodyYOffset: 0,
    headYOffset: 0,
    torsoLean: 0,
    leftArmReach: 0,
    rightArmReach: 0,
    leftArmSwingAdd: 0,
    rightArmSwingAdd: 0,
  };

  if (anim.name === "none" || anim.duration <= 0) {
    return base;
  }

  const rawT = clamp(anim.time / anim.duration, 0, 1);
  const t = easeInOut(rawT);
  const arc = Math.sin(t * Math.PI);

  switch (anim.name) {
    case "pickup-left":
      return {
        bodyYOffset: arc * 2.2,
        headYOffset: arc * 1.1,
        torsoLean: -arc * 0.12,
        leftArmReach: arc * 7.5,
        rightArmReach: 0,
        leftArmSwingAdd: arc * 0.45,
        rightArmSwingAdd: 0,
      };

    case "pickup-right":
      return {
        bodyYOffset: arc * 2.2,
        headYOffset: arc * 1.1,
        torsoLean: arc * 0.12,
        leftArmReach: 0,
        rightArmReach: arc * 7.5,
        leftArmSwingAdd: 0,
        rightArmSwingAdd: -arc * 0.45,
      };

    default:
      return base;
  }
}