"use client";

import { useEffect, useRef } from "react";
import {
  drawMap,
  WORLD_HEIGHT,
  WORLD_WIDTH,
  WATER_ZONES,
  LAKE_MAIN,
  isPointInWater,
  pointInEllipse,
} from "./map/map";
import { drawWaterEffects } from "./decorations/water";
import {
  drawShorelineGrassBehindPlayer,
  drawShorelineGrassInFrontOfPlayerLegs,
  drawShorelineGrassDebug,
} from "./decorations/shorelineGrass";
import { createPlayer } from "./player/player";
import {
  isNearWorldTarget,
  tryStoreHandInCraftingPantry,
  resolveHandInteraction,
  getInteractionPromptData,
  handleCraftingCardInput,
} from "./systems/interactions";
import {
  drawPlayerLowerBody,
  drawPlayerUpperBody,
} from "./player/drawPlayer";
import {
  getNearestResource,
  tryBeginPickup,
  removePickedResource,
} from "./systems/pickups";
import {
  type HandSide,
  dropHeldItem,
} from "./player/playerHands";
import {
  drawGrassTuftsBehindPlayer,
  drawGrassTuftsInFrontOfPlayerLegs,
  drawGrassDebug,
  type GrassClearRect,
} from "./decorations/grass";
import { drawMiniMap } from "./ui/minimap";
import {
  drawBrokenCabin,
  drawBrokenCabinFrontOverlay,
  getBrokenCabinCollisionBounds,
} from "./structures/brokenCabin";
import {
  createCampfire,
  drawCampfire,
  updateCampfire,
  addStickToCampfire,
  lightCampfire,
  extinguishCampfire,
  formatBurnTime,
} from "./structures/campfire";

import {
  drawTree,
  drawTreeFrontOverlay,
  getTreeGrassClearRects,
  getTreeTrunkBounds,
} from "./resourses/tree";
import { generateTrees } from "./resourses/treeSpawner";
import {
  createStick,
  drawStick,
  generateSticks,
} from "./resourses/stick";
import {
  createStone,
  drawStone,
  generateStones,
} from "./resourses/stone";
import {
  updatePlayerAnimation,
  isPlayerAnimationLocked,
} from "./player/playerAnimations";
import {
  updatePendingPickup,
  type PendingPickup,
} from "./player/playerPickup";

import {
  drawBottomHud,
  drawCampfireCard,
  drawCraftingRepairPrompt,
  drawInteractPrompt,
  drawCraftingTableCard,
} from "./ui/hud";
import { updatePlayerMovement } from "./player/playerMovement";
import type { DayNightPhase } from "./ui/minimap";
import {
  createCraftingTable,
  drawCraftingTable,
  drawCraftingTableFrontOverlay,
  getCraftingTableCollisionBounds,
  getCraftingTableGrassClearRect,
  getCraftingPantryWorldPosition,
  getCraftingPantryBounds,
  addMaterialToCraftingTable,
  addItemToCraftingPantry,
  canCraftRecipe,
  craftRecipe,
  CRAFTING_RECIPES,
  type CraftingRecipe,
} from "./structures/craftingTable";
import {
  drawHeldItemsBehindPlayer,
  drawHeldItemsInFrontOfPlayer,
  type HandItem,
} from "./player/playerHeldItems";

export default function OneMoreLogGame() {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  useEffect(() => {
// --------------------------------------------------
// DEBUG
// --------------------------------------------------
let showDebug = true;
    // --------------------------------------------------
    // CANVAS SETUP
    // --------------------------------------------------
    const canvas = canvasRef.current;
    if (!canvas) return;

    const canvasEl = canvas;
    const ctx = canvasEl.getContext("2d");
    if (!ctx) return;
    const safeCtx = ctx;
const overlayCanvas = document.createElement("canvas");
const overlayCtxRaw = overlayCanvas.getContext("2d");
if (!overlayCtxRaw) return;
const overlayCtx = overlayCtxRaw;
    // --------------------------------------------------
    // PLAYER SETUP
    // --------------------------------------------------
    const player = createPlayer(WORLD_WIDTH / 2, WORLD_HEIGHT / 2);
    player.scale = 1;

    // --------------------------------------------------
    // CAMERA SETUP
    // --------------------------------------------------
    const camera = {
      x: player.x,
      y: player.y,
      zoom: 2.4,
    };

    // --------------------------------------------------
    // WORLD OBJECTS
    // --------------------------------------------------
    const cabin = {
      x: player.x,
      y: player.y + 10,
    };

    const campfire = createCampfire(cabin.x - 205, cabin.y + 2);
    const craftingTable = createCraftingTable(cabin.x + 92, cabin.y + 10);

    // temp values for testing
    campfire.fuel = 0;
    campfire.burnTimeRemaining = 0;
    campfire.lit = false;

    // --------------------------------------------------
    // SIMPLE UI STATE
    // --------------------------------------------------

let campfireCardOpen = false;

const hands: {
  left: HandItem | null;
  right: HandItem | null;
} = {
  left: null,
  right: null,
};

const survival = {
  health: 88,
  hunger: 72,
  thirst: 61,
};
const dayNight = {
  clock: 65, // start in daytime
  paused: false,

  // editable timings in seconds
  dayDuration: 90,
  sunsetDuration: 18,
  nightDuration: 55,
  sunriseDuration: 16,

  // debug multiplier
  timeScale: 1,
};

let pendingPickup: PendingPickup | null = null;

let craftingTableCardOpen = false;
let selectedCraftingRecipeIndex = 0;

const craftingRepairDisplay = {
  sticks: 0,
  stones: 0,
};
        // --------------------------------------------------
    // HELPERS
    // --------------------------------------------------
function getDayNightCycleDuration() {
  return (
    dayNight.dayDuration +
    dayNight.sunsetDuration +
    dayNight.nightDuration +
    dayNight.sunriseDuration
  );
}

function getWrappedCycleTime() {
  const total = getDayNightCycleDuration();
  let t = dayNight.clock % total;
  if (t < 0) t += total;
  return t;
}

function setTimeToDay() {
  dayNight.clock = dayNight.nightDuration + dayNight.sunriseDuration + dayNight.dayDuration * 0.45;
}

function setTimeToNight() {
  dayNight.clock = dayNight.nightDuration * 0.45;
}

function setTimeToSunset() {
  dayNight.clock =
    dayNight.nightDuration +
    dayNight.sunriseDuration +
    dayNight.dayDuration +
    dayNight.sunsetDuration * 0.35;
}

function setTimeToSunrise() {
  dayNight.clock =
    dayNight.nightDuration +
    dayNight.sunriseDuration * 0.45;
}

function getDayNightState() {
  const total = getDayNightCycleDuration();
  const t = getWrappedCycleTime();

  const nightEnd = dayNight.nightDuration;
  const sunriseEnd = nightEnd + dayNight.sunriseDuration;
  const dayEnd = sunriseEnd + dayNight.dayDuration;
  const sunsetEnd = dayEnd + dayNight.sunsetDuration;

  const NIGHT_COLOR: [number, number, number] = [20, 30, 58];
  const SUNRISE_COLOR: [number, number, number] = [255, 170, 110];
  const SUNSET_COLOR: [number, number, number] = [255, 120, 155];
  const DAY_COLOR: [number, number, number] = [255, 255, 255];

  // return values:
  // tintColor = color wash
  // tintAlpha = colored atmosphere
  // darknessAlpha = overall dimming
  // skyGlow = extra warm mood near sunrise/sunset
if (t < nightEnd) {
  return {
    phase: "night",
    cycleT: t / total,
    tintColor: NIGHT_COLOR,
    tintAlpha: 0.10,
    darknessAlpha: 0.82,
    skyGlow: 0,
  };
}

  if (t < sunriseEnd) {
    const p = (t - nightEnd) / dayNight.sunriseDuration;

    const tintColor = p < 0.55
      ? lerpColor(NIGHT_COLOR, SUNRISE_COLOR, smoothstep(0, 0.55, p))
      : lerpColor(SUNRISE_COLOR, DAY_COLOR, smoothstep(0.55, 1, p));

    const tintAlpha =
      p < 0.55
        ? lerp(0.30, 0.18, smoothstep(0, 0.55, p))
        : lerp(0.18, 0.02, smoothstep(0.55, 1, p));

    const darknessAlpha =
      p < 0.55
        ? lerp(0.34, 0.18, smoothstep(0, 0.55, p))
        : lerp(0.18, 0.0, smoothstep(0.55, 1, p));

    return {
      phase: "sunrise",
      cycleT: t / total,
      tintColor,
      tintAlpha,
      darknessAlpha,
      skyGlow: lerp(0.08, 0.18, Math.sin(p * Math.PI)),
    };
  }

  if (t < dayEnd) {
    return {
      phase: "day",
      cycleT: t / total,
      tintColor: DAY_COLOR,
      tintAlpha: 0,
      darknessAlpha: 0,
      skyGlow: 0,
    };
  }

  if (t < sunsetEnd) {
    const p = (t - dayEnd) / dayNight.sunsetDuration;

    const tintColor = p < 0.45
      ? lerpColor(DAY_COLOR, SUNRISE_COLOR, smoothstep(0, 0.45, p))
      : lerpColor(SUNRISE_COLOR, SUNSET_COLOR, smoothstep(0.45, 1, p));

    const tintAlpha =
      p < 0.45
        ? lerp(0.02, 0.12, smoothstep(0, 0.45, p))
        : lerp(0.12, 0.26, smoothstep(0.45, 1, p));

    const darknessAlpha =
      p < 0.45
        ? lerp(0.0, 0.06, smoothstep(0, 0.45, p))
        : lerp(0.06, 0.18, smoothstep(0.45, 1, p));

    return {
      phase: "sunset",
      cycleT: t / total,
      tintColor,
      tintAlpha,
      darknessAlpha,
      skyGlow: lerp(0.10, 0.22, Math.sin(p * Math.PI * 0.9)),
    };
  }

  return {
  phase: "night",
  cycleT: t / total,
  tintColor: NIGHT_COLOR,
  tintAlpha: 0.10,
  darknessAlpha: 0.82,
  skyGlow: 0,
};
}

function drawMoonLakeGlow(
  ctx: CanvasRenderingContext2D,
  dayNight: { phase: string },
  time: number
) {
  if (dayNight.phase !== "night") return;

  const glow = ctx.createRadialGradient(
    LAKE_MAIN.x,
    LAKE_MAIN.y - 40,
    20,
    LAKE_MAIN.x,
    LAKE_MAIN.y,
    LAKE_MAIN.rx * 0.9
  );

  glow.addColorStop(0, "rgba(180,200,255,0.18)");
  glow.addColorStop(1, "rgba(180,200,255,0)");

  ctx.fillStyle = glow;

  ctx.beginPath();
  ctx.ellipse(
    LAKE_MAIN.x,
    LAKE_MAIN.y,
    LAKE_MAIN.rx,
    LAKE_MAIN.ry,
    LAKE_MAIN.rotation,
    0,
    Math.PI * 2
  );

  ctx.fill();

  ctx.strokeStyle = "rgba(210,220,255,0.22)";
  ctx.lineWidth = 1;

  for (let i = 0; i < 6; i++) {
    const x =
      LAKE_MAIN.x +
      Math.sin(time * 0.8 + i) * LAKE_MAIN.rx * 0.25;

    const y =
      LAKE_MAIN.y +
      Math.cos(time * 0.5 + i) * LAKE_MAIN.ry * 0.15;

    ctx.beginPath();
    ctx.moveTo(x - 10, y);
    ctx.lineTo(x + 10, y);
    ctx.stroke();
  }
}

function drawDayNightOverlay(
  ctx: CanvasRenderingContext2D,
  time: number
) {
  const state = getDayNightState();

  const viewWidth = canvasEl.width / camera.zoom;
  const viewHeight = canvasEl.height / camera.zoom;
  const left = camera.x - viewWidth / 2;
  const top = camera.y - viewHeight / 2;

  overlayCtx.clearRect(0, 0, overlayCanvas.width, overlayCanvas.height);

  overlayCtx.save();
  overlayCtx.translate(canvasEl.width / 2, canvasEl.height / 2);
  overlayCtx.scale(camera.zoom, camera.zoom);
  overlayCtx.translate(-camera.x, -camera.y);

  // sunset / sunrise tint
  if (state.tintAlpha > 0.001) {
    overlayCtx.fillStyle = colorToRgba(state.tintColor, state.tintAlpha);
    overlayCtx.fillRect(left, top, viewWidth, viewHeight);
  }

  // sky glow
  if (state.skyGlow > 0.001) {
    const grad = overlayCtx.createLinearGradient(0, top, 0, top + viewHeight);
    grad.addColorStop(0, `rgba(255, 170, 120, ${state.skyGlow})`);
    grad.addColorStop(0.42, `rgba(255, 120, 150, ${state.skyGlow * 0.55})`);
    grad.addColorStop(1, `rgba(40, 50, 90, 0)`);
    overlayCtx.fillStyle = grad;
    overlayCtx.fillRect(left, top, viewWidth, viewHeight);
  }

  // night darkness on overlay canvas
  if (state.darknessAlpha > 0.001) {
    overlayCtx.fillStyle = `rgba(10, 16, 28, ${state.darknessAlpha})`;
    overlayCtx.fillRect(left, top, viewWidth, viewHeight);

    const fireLight = getCampfireLightAt(campfire.x, campfire.y, time);

    if (fireLight > 0.001) {
      const radius = lerp(125, 220, fireLight);

      overlayCtx.globalCompositeOperation = "destination-out";

      const cutout = overlayCtx.createRadialGradient(
        campfire.x,
        campfire.y - 6,
        0,
        campfire.x,
        campfire.y - 6,
        radius
      );
      cutout.addColorStop(0, "rgba(0,0,0,1)");
      cutout.addColorStop(0.22, "rgba(0,0,0,0.8)");
      cutout.addColorStop(0.5, "rgba(0,0,0,0.35)");
      cutout.addColorStop(0.8, "rgba(0,0,0,0.12)");
      cutout.addColorStop(1, "rgba(0,0,0,0)");

      overlayCtx.fillStyle = cutout;
      overlayCtx.beginPath();
      overlayCtx.arc(campfire.x, campfire.y - 6, radius, 0, Math.PI * 2);
      overlayCtx.fill();

      overlayCtx.globalCompositeOperation = "source-over";

      const emberTint = overlayCtx.createRadialGradient(
        campfire.x,
        campfire.y - 8,
        0,
        campfire.x,
        campfire.y - 8,
        radius * 0.9
      );
      emberTint.addColorStop(0, `rgba(255, 165, 90, ${0.05 * fireLight})`);
      emberTint.addColorStop(0.4, `rgba(255, 140, 70, ${0.025 * fireLight})`);
      emberTint.addColorStop(1, "rgba(255, 120, 60, 0)");

      overlayCtx.fillStyle = emberTint;
      overlayCtx.beginPath();
      overlayCtx.arc(campfire.x, campfire.y - 8, radius, 0, Math.PI * 2);
      overlayCtx.fill();
    }
  }

  overlayCtx.restore();

  ctx.save();
  ctx.setTransform(1, 0, 0, 1, 0, 0);
  ctx.drawImage(overlayCanvas, 0, 0);
  ctx.restore();
}
function drawSunriseSunsetGlow(
  ctx: CanvasRenderingContext2D,
  canvasWidth: number,
  canvasHeight: number,
  dayNight: { phase: string }
) {
  if (
    dayNight.phase !== "sunrise" &&
    dayNight.phase !== "sunset"
  )
    return;

  const glow = ctx.createRadialGradient(
    canvasWidth / 8,
    canvasHeight * 0.2,
    0,
    canvasWidth / 8,
    canvasHeight * 0.2,
    canvasHeight
  );

  glow.addColorStop(0, "rgba(255,210,140,0.22)");
  glow.addColorStop(1, "rgba(255,210,140,0)");

  ctx.fillStyle = glow;
  ctx.fillRect(0, 0, canvasWidth, canvasHeight);
}
    // ==================================================
    // BASIC HELPERS
    // ==================================================
    function clamp(value: number, min: number, max: number) {
      return Math.max(min, Math.min(max, value));
    }

    function rectsOverlap(
      a: { x: number; y: number; width: number; height: number },
      b: { x: number; y: number; width: number; height: number }
    ) {
      return (
        a.x < b.x + b.width &&
        a.x + a.width > b.x &&
        a.y < b.y + b.height &&
        a.y + a.height > b.y
      );
    }

function getCampfireLightAt(x: number, y: number, time: number) {
  if (!campfire.lit || campfire.burnTimeRemaining <= 0) return 0;

  const dx = x - campfire.x;
  const dy = y - campfire.y;
  const dist = Math.hypot(dx, dy);

  const maxLightDist = 185;
  const falloff = Math.max(0, 1 - dist / maxLightDist);
  const easedFalloff = falloff * falloff;

const fuelStrength = Math.min(
  1,
  0.55 + Math.min(campfire.burnTimeRemaining / 60, 1) * 0.45
);
  const flicker =
    0.96 +
    Math.sin(time * 8.5) * 0.04 +
    Math.sin(time * 17.2 + 1.4) * 0.03 +
    Math.sin(time * 27.5 + 0.7) * 0.02;

  return Math.min(1, easedFalloff * 1.35 * fuelStrength * flicker);
}

function lerp(a: number, b: number, t: number) {
  return a + (b - a) * t;
}

function clamp01(value: number) {
  return Math.max(0, Math.min(1, value));
}

function smoothstep(edge0: number, edge1: number, x: number) {
  const t = clamp01((x - edge0) / (edge1 - edge0));
  return t * t * (3 - 2 * t);
}

function lerpColor(
  a: [number, number, number],
  b: [number, number, number],
  t: number
): [number, number, number] {
  return [
    Math.round(lerp(a[0], b[0], t)),
    Math.round(lerp(a[1], b[1], t)),
    Math.round(lerp(a[2], b[2], t)),
  ];
}

function colorToRgba(
  color: [number, number, number],
  alpha: number
) {
  return `rgba(${color[0]}, ${color[1]}, ${color[2]}, ${alpha})`;
}

function createSeededRandom(seedString: string) {
  let h = 1779033703 ^ seedString.length;

  for (let i = 0; i < seedString.length; i++) {
    h = Math.imul(h ^ seedString.charCodeAt(i), 3432918353);
    h = (h << 13) | (h >>> 19);
  }

  return function () {
    h = Math.imul(h ^ (h >>> 16), 2246822507);
    h = Math.imul(h ^ (h >>> 13), 3266489909);
    h ^= h >>> 16;
    return (h >>> 0) / 4294967296;
  };
}

function pointInRect(
  x: number,
  y: number,
  rect: { x: number; y: number; width: number; height: number }
) {
  return (
    x >= rect.x &&
    x <= rect.x + rect.width &&
    y >= rect.y &&
    y <= rect.y + rect.height
  );
}

function pointInAnyRect(
  x: number,
  y: number,
  rects: { x: number; y: number; width: number; height: number }[]
) {
  for (const rect of rects) {
    if (pointInRect(x, y, rect)) return true;
  }
  return false;
}

function distance(ax: number, ay: number, bx: number, by: number) {
  return Math.hypot(ax - bx, ay - by);
}

function isFarEnoughFromPoints(
  x: number,
  y: number,
  points: { x: number; y: number }[],
  minDistance: number
) {
  for (const point of points) {
    if (distance(x, y, point.x, point.y) < minDistance) {
      return false;
    }
  }
  return true;
}

function isOutsideCameraView(x: number, y: number, margin = 120) {
  const halfViewW = canvasEl.width / camera.zoom / 2;
  const halfViewH = canvasEl.height / camera.zoom / 2;

  const left = camera.x - halfViewW - margin;
  const right = camera.x + halfViewW + margin;
  const top = camera.y - halfViewH - margin;
  const bottom = camera.y + halfViewH + margin;

  return x < left || x > right || y < top || y > bottom;
}

function pointNearWater(x: number, y: number, padding = 36) {
  for (const zone of WATER_ZONES) {
    if (
      pointInEllipse(
        x,
        y,
        zone.x,
        zone.y,
        zone.rx + padding,
        zone.ry + padding,
        zone.rotation
      )
    ) {
      return true;
    }
  }
  return false;
}
function getSelectedCraftingRecipe(): CraftingRecipe {
  return CRAFTING_RECIPES[selectedCraftingRecipeIndex];
}

    // ==================================================
    // INTERACTION / PICKUP HELPERS
    // ==================================================
    const PICKUP_RADIUS = 26;
  

function tryRespawnStick() {
  if (sticks.length >= MAX_STICKS) return;

  const clearRects = getResourceClearRects();

  for (let attempt = 0; attempt < 50; attempt++) {
    const tree = trees[Math.floor(Math.random() * trees.length)];
    const angle = Math.random() * Math.PI * 2;
    const radius = Math.sqrt(Math.random());

    const x = tree.x + 8 + Math.cos(angle) * 58 * radius;
    const y = tree.y - 6 + Math.sin(angle) * 24 * radius;

    if (x < 8 || x > WORLD_WIDTH - 8) continue;
    if (y < 8 || y > WORLD_HEIGHT - 8) continue;

    if (isPointInWater(x, y)) continue;
    if (pointInAnyRect(x, y, clearRects)) continue;

    if (
      distance(x, y, player.x, player.y) < MIN_RESPAWN_DISTANCE_FROM_PLAYER
    ) {
      continue;
    }

    if (!isOutsideCameraView(x, y, 120)) continue;

    if (!isFarEnoughFromPoints(x, y, sticks, 34)) continue;
    if (!isFarEnoughFromPoints(x, y, stones, 26)) continue;

    sticks.push(createStick(x, y));
    return;
  }
}

function tryRespawnStone() {
  if (stones.length >= MAX_STONES) return;

  const clearRects = getResourceClearRects();

  for (let attempt = 0; attempt < 70; attempt++) {
    const spawnNearShore = Math.random() < 0.82;

    let x = 0;
    let y = 0;

    if (spawnNearShore) {
      const zone = WATER_ZONES[Math.floor(Math.random() * WATER_ZONES.length)];
      const padding = 36;

      const angle = Math.random() * Math.PI * 2;
      const radius = Math.sqrt(Math.random());

      x = zone.x + Math.cos(angle) * (zone.rx + padding) * radius;
      y = zone.y + Math.sin(angle) * (zone.ry + padding) * radius;

      if (!pointNearWater(x, y, padding)) continue;
    } else {
      x = 8 + Math.random() * (WORLD_WIDTH - 16);
      y = 8 + Math.random() * (WORLD_HEIGHT - 16);
    }

    if (isPointInWater(x, y)) continue;
    if (pointInAnyRect(x, y, clearRects)) continue;

    if (
      distance(x, y, player.x, player.y) < MIN_RESPAWN_DISTANCE_FROM_PLAYER
    ) {
      continue;
    }

    if (!isOutsideCameraView(x, y, 120)) continue;

    if (!isFarEnoughFromPoints(x, y, stones, 42)) continue;
    if (!isFarEnoughFromPoints(x, y, sticks, 26)) continue;

    stones.push(createStone(x, y));
    return;
  }
}

    // --------------------------------------------------
    // GRASS CLEAR AREAS
    // --------------------------------------------------
    const grassClearRects: GrassClearRect[] = [
      {
        x: 0,
        y: 0,
        width: 0,
        height: 0,
      },
      {
        x: 0,
        y: 0,
        width: 0,
        height: 0,
      },
    ];

// prevents trees spawning around the cabin
const cabinTreeClearRect: GrassClearRect = {
  x: 0,
  y: 0,
  width: 0,
  height: 0,
};
const craftingTableGrassClearRect: GrassClearRect = {
  x: 0,
  y: 0,
  width: 0,
  height: 0,
};
    // --------------------------------------------------
    // POSITION CABIN / CAMPFIRE ON LOAD
    // --------------------------------------------------
    function placeCabinNearRightEdgeOnLoad() {
      const halfViewW = canvasEl.width / camera.zoom / 2;

      cabin.x = clamp(player.x + halfViewW - 80, 120, WORLD_WIDTH - 120);
      cabin.y = clamp(player.y + 16, 100, WORLD_HEIGHT - 40);

      campfire.x = cabin.x - 125;
      campfire.y = cabin.y + 2;

craftingTable.x = cabin.x + 92;
craftingTable.y = cabin.y + 10;

      grassClearRects[0].x = cabin.x - 80;
      grassClearRects[0].y = cabin.y - 100;
      grassClearRects[0].width = 145;
      grassClearRects[0].height = 96;

      grassClearRects[1].x = campfire.x - 26;
      grassClearRects[1].y = campfire.y - 22;
      grassClearRects[1].width = 52;
      grassClearRects[1].height = 44;
const craftingRect = getCraftingTableGrassClearRect(
  craftingTable.x,
  craftingTable.y
);

craftingTableGrassClearRect.x = craftingRect.x;
craftingTableGrassClearRect.y = craftingRect.y;
craftingTableGrassClearRect.width = craftingRect.width;
craftingTableGrassClearRect.height = craftingRect.height;

      // tree clearing area in front of cabin
cabinTreeClearRect.x = cabin.x - 140;
cabinTreeClearRect.y = cabin.y + 10;
cabinTreeClearRect.width = 280;
cabinTreeClearRect.height = 180;
    }

    // --------------------------------------------------
    // RESIZE
    // --------------------------------------------------
const resize = () => {
  canvasEl.width = canvasEl.clientWidth;
  canvasEl.height = canvasEl.clientHeight;

  overlayCanvas.width = canvasEl.width;
  overlayCanvas.height = canvasEl.height;

  placeCabinNearRightEdgeOnLoad();
};

    resize();
    window.addEventListener("resize", resize);

    // --------------------------------------------------
// TREES
// --------------------------------------------------
const USE_FIXED_TREE_LAYOUT = true;
const WORLD_SEED = "one-more-log-world-001";

const treeRandom = USE_FIXED_TREE_LAYOUT
  ? createSeededRandom(WORLD_SEED)
  : Math.random;

const trees = generateTrees(
  [
    ...grassClearRects,
    craftingTableGrassClearRect,
    cabinTreeClearRect,
  ],
  treeRandom
);

const treeGrassClearRects = trees.flatMap((tree) =>
  getTreeGrassClearRects(tree)
);

function getResourceClearRects() {
  return [
    ...grassClearRects,
    craftingTableGrassClearRect,
    cabinTreeClearRect,
    ...treeGrassClearRects,
  ];
}

// --------------------------------------------------
// RESOURCES
// --------------------------------------------------
const MAX_STICKS = 110;
const MAX_STONES = 40;

const stickCount = MAX_STICKS;
const stoneCount = MAX_STONES;

const sticks = generateSticks(
  trees,
  stickCount,
  [
    ...grassClearRects,
    craftingTableGrassClearRect,
    cabinTreeClearRect,
    ...treeGrassClearRects,
  ]
);

const stones = generateStones(
  stoneCount,
  [
    ...grassClearRects,
    craftingTableGrassClearRect,
    cabinTreeClearRect,
    ...treeGrassClearRects,
  ]
);

let stickRespawnTimer = 0;
let stoneRespawnTimer = 0;

const STICK_RESPAWN_INTERVAL = 5.5;
const STONE_RESPAWN_INTERVAL = 8.5;

const MIN_RESPAWN_DISTANCE_FROM_PLAYER = 420;

    // --------------------------------------------------
    // INPUT
    // --------------------------------------------------
    const keys: Record<"w" | "a" | "s" | "d", boolean> = {
      w: false,
      a: false,
      s: false,
      d: false,
    };

   // ---- keyboard control buttons ----
const handleKeyDown = (e: KeyboardEvent) => {
  const key = e.key.toLowerCase();

  // movement only when crafting card is not open
  if (
    !craftingTableCardOpen &&
    (key === "w" || key === "a" || key === "s" || key === "d")
  ) {
    keys[key] = true;
  }

  // crafting table card controls
  if (craftingTableCardOpen) {
    const nextRecipeIndex = handleCraftingCardInput({
      key,
      craftingTableRepaired: craftingTable.repaired,
      selectedCraftingRecipeIndex,
      recipeCount: CRAFTING_RECIPES.length,
      canCraftSelectedRecipe: () => {
        return canCraftRecipe(craftingTable, getSelectedCraftingRecipe());
      },
      craftSelectedRecipe: () => {
        const recipe = getSelectedCraftingRecipe();

        craftRecipe(craftingTable, recipe);

        // placeholder output logic
        if (recipe.id === "axe") {
          console.log("Crafted Stone Axe");
        }

        if (recipe.id === "torch") {
          console.log("Crafted Torch");
        }

        if (recipe.id === "rope") {
          craftingTable.pantry.rope += 1;
        }
      },
      storeLeftInPantry: () => {
        tryStoreHandInCraftingPantry({
          side: "left",
          hands,
          isNearCraftingPantry: isNearWorldTarget(
            player,
            getCraftingPantryWorldPosition(craftingTable),
            34
          ),
          craftingTableRepaired: craftingTable.repaired,
          addItemToCraftingPantry: (item) => {
            addItemToCraftingPantry(craftingTable, item);
          },
        });
      },
      storeRightInPantry: () => {
        tryStoreHandInCraftingPantry({
          side: "right",
          hands,
          isNearCraftingPantry: isNearWorldTarget(
            player,
            getCraftingPantryWorldPosition(craftingTable),
            34
          ),
          craftingTableRepaired: craftingTable.repaired,
          addItemToCraftingPantry: (item) => {
            addItemToCraftingPantry(craftingTable, item);
          },
        });
      },
      closeCraftingCard: () => {
        craftingTableCardOpen = false;
      },
    });

    if (nextRecipeIndex !== null) {
      selectedCraftingRecipeIndex = nextRecipeIndex;
      return;
    }
  }

  if (key === "i") {
    if (isNearWorldTarget(player, campfire, 42)) {
      campfireCardOpen = !campfireCardOpen;
      craftingTableCardOpen = false;
      return;
    }

    if (isNearWorldTarget(player, craftingTable, 44)) {
      campfireCardOpen = false;

      if (craftingTable.repaired) {
        craftingTableCardOpen = !craftingTableCardOpen;
      } else {
        craftingTableCardOpen = false;
      }

      return;
    }

campfireCardOpen = false;
craftingTableCardOpen = false;

pendingPickup = tryBeginPickup({
  player,
  hands,
  pendingPickup,
  sticks,
  stones,
  pickupRadius: PICKUP_RADIUS,
});

return;
  }

  if (key === "l") {
    if (isNearWorldTarget(player, campfire, 42)) {
      if (campfire.lit) {
        extinguishCampfire(campfire);
      } else {
        lightCampfire(campfire);
      }
    }
    return;
  }
if (key === "u") {
  resolveHandInteraction({
    side: "left",
    hands,
    isNearCampfire: isNearWorldTarget(player, campfire, 42),
    campfireLit: campfire.lit,
    addStickToCampfire: () => {
      addStickToCampfire(campfire);
    },
    lightCampfire: () => {
      lightCampfire(campfire);
    },
    isNearCraftingTable: isNearWorldTarget(player, craftingTable, 44),
    craftingTableRepaired: craftingTable.repaired,
    addMaterialToCraftingTable: (item) => {
      addMaterialToCraftingTable(craftingTable, item);
    },
    isNearCraftingPantry: isNearWorldTarget(
      player,
      getCraftingPantryWorldPosition(craftingTable),
      34
    ),
    addItemToCraftingPantry: (item) => {
      addItemToCraftingPantry(craftingTable, item);
    },
    dropHeldItem: () => {
      dropHeldItem({
        side: "left",
        player,
        hands,
        pendingPickup,
        sticks,
        stones,
        createStick,
        createStone,
        clamp,
        worldWidth: WORLD_WIDTH,
        worldHeight: WORLD_HEIGHT,
      });
    },
  });
  return;
}

if (key === "o") {
  resolveHandInteraction({
    side: "right",
    hands,
    isNearCampfire: isNearWorldTarget(player, campfire, 42),
    campfireLit: campfire.lit,
    addStickToCampfire: () => {
      addStickToCampfire(campfire);
    },
    lightCampfire: () => {
      lightCampfire(campfire);
    },
    isNearCraftingTable: isNearWorldTarget(player, craftingTable, 44),
    craftingTableRepaired: craftingTable.repaired,
    addMaterialToCraftingTable: (item) => {
      addMaterialToCraftingTable(craftingTable, item);
    },
    isNearCraftingPantry: isNearWorldTarget(
      player,
      getCraftingPantryWorldPosition(craftingTable),
      34
    ),
    addItemToCraftingPantry: (item) => {
      addItemToCraftingPantry(craftingTable, item);
    },
    dropHeldItem: () => {
      dropHeldItem({
        side: "right",
        player,
        hands,
        pendingPickup,
        sticks,
        stones,
        createStick,
        createStone,
        clamp,
        worldWidth: WORLD_WIDTH,
        worldHeight: WORLD_HEIGHT,
      });
    },
  });
  return;
}

  if (key === "p") {
    showDebug = !showDebug;
    return;
  }

  if (key === "n") {
    dayNight.paused = !dayNight.paused;
    return;
  }

  if (key === "9") {
    setTimeToDay();
    return;
  }

  if (key === "0") {
    setTimeToNight();
    return;
  }

  if (key === "7") {
    setTimeToSunrise();
    return;
  }

  if (key === "8") {
    setTimeToSunset();
    return;
  }

  if (key === "]") {
    dayNight.timeScale = Math.min(64, dayNight.timeScale * 2);
    return;
  }

  if (key === "[") {
    dayNight.timeScale = Math.max(0.125, dayNight.timeScale * 0.5);
    return;
  }
};

const handleKeyUp = (e: KeyboardEvent) => {
  const key = e.key.toLowerCase();

  if (key === "w" || key === "a" || key === "s" || key === "d") {
    keys[key] = false;
  }
};

window.addEventListener("keydown", handleKeyDown);
window.addEventListener("keyup", handleKeyUp);

    // --------------------------------------------------
    // ANIMATION LOOP TIMING
    // --------------------------------------------------
    let animationFrameId = 0;
    const start = performance.now();
    let lastNow = start;

    // --------------------------------------------------
    // CAMERA FOLLOW
    // --------------------------------------------------
    function updateCamera() {
      const deadZoneWidth = (canvasEl.width / camera.zoom) * 0.35;
      const deadZoneHeight = (canvasEl.height / camera.zoom) * 0.28;

      const left = camera.x - deadZoneWidth / 2;
      const right = camera.x + deadZoneWidth / 2;
      const top = camera.y - deadZoneHeight / 2;
      const bottom = camera.y + deadZoneHeight / 2;

      if (player.x < left) camera.x = player.x + deadZoneWidth / 2;
      if (player.x > right) camera.x = player.x - deadZoneWidth / 2;
      if (player.y < top) camera.y = player.y + deadZoneHeight / 2;
      if (player.y > bottom) camera.y = player.y - deadZoneHeight / 2;

      const halfViewW = canvasEl.width / camera.zoom / 2;
      const halfViewH = canvasEl.height / camera.zoom / 2;

      camera.x = clamp(camera.x, halfViewW, WORLD_WIDTH - halfViewW);
      camera.y = clamp(camera.y, halfViewH, WORLD_HEIGHT - halfViewH);
    }

    // --------------------------------------------------
    // MAIN RENDER LOOP
    // --------------------------------------------------
    const render = (now: number) => {
      const time = (now - start) / 1000;
      const dt = (now - lastNow) / 1000;
      lastNow = now;

if (!dayNight.paused) {
  dayNight.clock += dt * dayNight.timeScale;
}



stickRespawnTimer += dt;
stoneRespawnTimer += dt;

updateCampfire(campfire, dt);

if (stickRespawnTimer >= STICK_RESPAWN_INTERVAL) {
  stickRespawnTimer = 0;
  tryRespawnStick();
}

if (stoneRespawnTimer >= STONE_RESPAWN_INTERVAL) {
  stoneRespawnTimer = 0;
  tryRespawnStone();
}

updatePlayerAnimation(player, dt);
const animationLocked = isPlayerAnimationLocked(player);
const pickupUpdate = updatePendingPickup(pendingPickup, dt);

if (pickupUpdate) {
  if (pickupUpdate.finished) {
    hands[pickupUpdate.result.hand] = pickupUpdate.result.kind;
  removePickedResource(
  pickupUpdate.result.kind,
  pickupUpdate.result.target,
  sticks,
  stones
);
    pendingPickup = null;
  } else {
    pendingPickup = pickupUpdate.result;
  }
}
craftingRepairDisplay.sticks = lerp(
  craftingRepairDisplay.sticks,
  craftingTable.repair.sticksAdded,
  1 - Math.pow(0.001, dt)
);

craftingRepairDisplay.stones = lerp(
  craftingRepairDisplay.stones,
  craftingTable.repair.stonesAdded,
  1 - Math.pow(0.001, dt)
);

const collisionRects = [
  ...trees.map(getTreeTrunkBounds),
  getBrokenCabinCollisionBounds(cabin.x, cabin.y),
  getCraftingTableCollisionBounds(craftingTable.x, craftingTable.y),
];

updatePlayerMovement({
  player,
  dt,
  keys,
  animationLocked,
  collisionRects,
});

      player.x = clamp(player.x, 20, WORLD_WIDTH - 20);
      player.y = clamp(player.y, 20, WORLD_HEIGHT - 20);

      if (campfireCardOpen && !isNearWorldTarget(player, campfire, 42)) {
        campfireCardOpen = false;
      }
      if (craftingTableCardOpen && !isNearWorldTarget(player, craftingTable, 44)) {
        craftingTableCardOpen = false;
      }

      updateCamera();
  let playerShadowAmount = 0;
  let playerFireLightAmount = 0;

// tree ground shadows
for (const tree of trees) {
const shadow1X = tree.x + 10;
const shadow1Y = tree.y - 2;
const shadow1Rx = 86;   // was 70
const shadow1Ry = 36;   // was 28

const shadow2X = tree.x + 6;
const shadow2Y = tree.y - 10;
const shadow2Rx = 60;   // was 46
const shadow2Ry = 26;   // was 18

  const dx1 = player.x - shadow1X;
  const dy1 = player.y - shadow1Y;
  const inShadow1 =
    (dx1 * dx1) / (shadow1Rx * shadow1Rx) +
      (dy1 * dy1) / (shadow1Ry * shadow1Ry) <=
    1;

  const dx2 = player.x - shadow2X;
  const dy2 = player.y - shadow2Y;
  const inShadow2 =
    (dx2 * dx2) / (shadow2Rx * shadow2Rx) +
      (dy2 * dy2) / (shadow2Ry * shadow2Ry) <=
    1;

  if (inShadow1) {
    playerShadowAmount = Math.max(playerShadowAmount, 0.14);
  }

  if (inShadow2) {
    playerShadowAmount = Math.max(playerShadowAmount, 0.22);
  }
}

// cabin ground shadow
const cabinShadowX = cabin.x + 6;
const cabinShadowY = cabin.y - 8;
const cabinShadowRx = 46;
const cabinShadowRy = 18;

const cabinDx = player.x - cabinShadowX;
const cabinDy = player.y - cabinShadowY;

playerFireLightAmount = getCampfireLightAt(player.x, player.y, time);
     
safeCtx.clearRect(0, 0, canvasEl.width, canvasEl.height);

      const cabinFireLightAmount = Math.max(
  getCampfireLightAt(cabin.x - 58, cabin.y - 8, time),
  getCampfireLightAt(cabin.x - 42, cabin.y - 26, time),
  getCampfireLightAt(cabin.x - 24, cabin.y - 18, time)
  
);

const craftingTableFireLightAmount = Math.max(
  getCampfireLightAt(craftingTable.x, craftingTable.y - 8, time),
  getCampfireLightAt(craftingTable.x - 10, craftingTable.y - 20, time),
  getCampfireLightAt(craftingTable.x + 12, craftingTable.y - 16, time)
);

      // -------------------------
      // WORLD DRAW
      // -------------------------
      safeCtx.save();
      safeCtx.translate(canvasEl.width / 2, canvasEl.height / 2);
      safeCtx.scale(camera.zoom, camera.zoom);
      safeCtx.translate(-camera.x, -camera.y);

const dayNightState = getDayNightState();

drawMap(safeCtx, WORLD_WIDTH, WORLD_HEIGHT);
drawWaterEffects(safeCtx, time);
drawMoonLakeGlow(safeCtx, dayNightState, time);
      drawBrokenCabin(
        safeCtx,
        cabin.x,
        cabin.y,
        time,
        player.x,
        player.y,
        cabinFireLightAmount
      );
      drawCampfire(safeCtx, campfire, time);
  drawCraftingTable(
  safeCtx,
  craftingTable,
  time,
  craftingTableFireLightAmount
);

const treesSortedByY = [...trees].sort((a, b) => a.y - b.y);

for (const tree of treesSortedByY) {
  drawTree(safeCtx, tree, time, player.x, player.y);
}

// resources
for (const stick of sticks) {
  drawStick(safeCtx, stick);
}

for (const stone of stones) {
  drawStone(safeCtx, stone);
}

drawGrassTuftsBehindPlayer(safeCtx, time, [
  ...grassClearRects,
  craftingTableGrassClearRect,
  ...treeGrassClearRects,
]);

  drawShorelineGrassBehindPlayer(safeCtx, time, [
  ...grassClearRects,
  craftingTableGrassClearRect,
  ...treeGrassClearRects,
]);
drawHeldItemsBehindPlayer(safeCtx, player, hands);
drawPlayerLowerBody(
  safeCtx,
  player,
  playerShadowAmount,
  playerFireLightAmount
);
drawGrassTuftsInFrontOfPlayerLegs(
  safeCtx,
  time,
  player.x,
  player.y,
  [...grassClearRects, craftingTableGrassClearRect, ...treeGrassClearRects]
);

drawShorelineGrassInFrontOfPlayerLegs(
  safeCtx,
  time,
  player.x,
  player.y,
  [...grassClearRects, craftingTableGrassClearRect, ...treeGrassClearRects]
);

drawPlayerUpperBody(
  safeCtx,
  player,
  playerShadowAmount,
  playerFireLightAmount
);
drawHeldItemsInFrontOfPlayer(safeCtx, player, hands);

for (const tree of treesSortedByY) {
  drawTreeFrontOverlay(safeCtx, tree, time, player.x, player.y);
}

drawBrokenCabinFrontOverlay(
  safeCtx,
  cabin.x,
  cabin.y,
  time,
  player.x,
  player.y,
  cabinFireLightAmount
);

drawCraftingTableFrontOverlay(
  safeCtx,
  craftingTable,
  time,
  player.x,
  player.y,
  craftingTableFireLightAmount
);

drawDayNightOverlay(safeCtx, time);

if (showDebug) {
drawGrassDebug(safeCtx, player.x, player.y, [
  ...grassClearRects,
  craftingTableGrassClearRect,
  cabinTreeClearRect,
  ...treeGrassClearRects,
]);

drawShorelineGrassDebug(safeCtx, player.x, player.y, [
  ...grassClearRects,
  craftingTableGrassClearRect,
  cabinTreeClearRect,
  ...treeGrassClearRects,
]);
}
      safeCtx.restore();

drawSunriseSunsetGlow(
  safeCtx,
  canvasEl.width,
  canvasEl.height,
  dayNightState
);

const nearbyStick = getNearestResource({
  player,
  resources: sticks,
  pickupRadius: PICKUP_RADIUS,
});

const nearbyStone = getNearestResource({
  player,
  resources: stones,
  pickupRadius: PICKUP_RADIUS,
});
const pantryPos = getCraftingPantryWorldPosition(craftingTable);

const interactionPrompt = getInteractionPromptData({
  player,
  campfire,
  craftingTable,
  pantryPosition: pantryPos,
  hands,
  nearbyStick,
  nearbyStone,
});

if (!campfireCardOpen && !craftingTableCardOpen && interactionPrompt) {
  drawInteractPrompt({
    ctx: safeCtx,
    canvasWidth: canvasEl.width,
    canvasHeight: canvasEl.height,
    camera,
    zoom: camera.zoom,
    worldX: interactionPrompt.worldX,
    worldY: interactionPrompt.worldY,
    lines: interactionPrompt.lines,
  });
}

if (campfireCardOpen) {
  drawCampfireCard({
    ctx: safeCtx,
    canvasWidth: canvasEl.width,
    canvasHeight: canvasEl.height,
    camera,
    zoom: camera.zoom,
    campfire: {
      x: campfire.x,
      y: campfire.y,
      fuel: campfire.fuel,
      lit: campfire.lit,
      ingredient: campfire.ingredient,
      burnTimeRemaining: campfire.burnTimeRemaining,
      burnTimeMax: Math.max(campfire.fuel * 30, 30),
    },
  });
}
if (craftingTableCardOpen && craftingTable.repaired && isNearWorldTarget(player, craftingTable, 44)) {
  drawCraftingTableCard({
    ctx: safeCtx,
    canvasWidth: canvasEl.width,
    canvasHeight: canvasEl.height,
    camera,
    zoom: camera.zoom,
    worldX: craftingTable.x,
    worldY: craftingTable.y,
    recipes: CRAFTING_RECIPES,
    selectedIndex: selectedCraftingRecipeIndex,
    pantry: craftingTable.pantry,
  });
}
if (isNearWorldTarget(player, craftingTable, 44) && !craftingTable.repaired) {
  drawCraftingRepairPrompt({
    ctx: safeCtx,
    canvasWidth: canvasEl.width,
    canvasHeight: canvasEl.height,
    camera,
    zoom: camera.zoom,
    worldX: craftingTable.x,
    worldY: craftingTable.y - 32,
    sticksAdded: Math.floor(craftingRepairDisplay.sticks),
    sticksRequired: craftingTable.repair.required.sticks,
    stonesAdded: Math.floor(craftingRepairDisplay.stones),
    stonesRequired: craftingTable.repair.required.stones,
  });
}

drawBottomHud({
  ctx: safeCtx,
  canvasWidth: canvasEl.width,
  canvasHeight: canvasEl.height,
  hands,
  survival,
});

drawMiniMap({

  ctx: safeCtx,
  x: canvasEl.width - 178,
  y: 24,
  width: 160,
  height: 160,
  canvasWidth: canvasEl.width,
  canvasHeight: canvasEl.height,
  player,
  camera,
  cabin,
  trees,
  dayNight: {
    phase: dayNightState.phase as DayNightPhase,
    cycleT: dayNightState.cycleT,
    dayCount: Math.floor(dayNight.clock / getDayNightCycleDuration()) + 1,
  },
});
      animationFrameId = window.requestAnimationFrame(render);
    };

    animationFrameId = window.requestAnimationFrame(render);

    // --------------------------------------------------
    // CLEANUP
    // --------------------------------------------------
    return () => {
      window.cancelAnimationFrame(animationFrameId);
      window.removeEventListener("keydown", handleKeyDown);
      window.removeEventListener("keyup", handleKeyUp);
      window.removeEventListener("resize", resize);
    };
  }, []);

  return (
    <div className="w-full h-full flex items-center justify-center bg-[#020617]">
      <canvas ref={canvasRef} className="w-full h-full" />
    </div>
  );
}