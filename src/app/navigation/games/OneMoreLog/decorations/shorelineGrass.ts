import {
  GRASS_ZONES,
  WATER_ZONES,
  getTerrainAt,
  pointInEllipse,
} from "../map/map";
import type { GrassClearRect } from "./grass";

type ShoreTuft = {
  x: number;
  y: number;
  scale: number;
  swayOffset: number;
  swayStrength: number;
  tint: number;
};

let cachedShoreTufts: ShoreTuft[] | null = null;

function mulberry32(seed: number) {
  return function () {
    let t = (seed += 0x6d2b79f5);
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

function distanceToWaterish(x: number, y: number) {
  let best = Infinity;

  for (const zone of WATER_ZONES) {
    const dx = x - zone.x;
    const dy = y - zone.y;

    const cos = Math.cos(-zone.rotation);
    const sin = Math.sin(-zone.rotation);

    const localX = dx * cos - dy * sin;
    const localY = dx * sin + dy * cos;

    const nx = Math.abs(localX) / zone.rx;
    const ny = Math.abs(localY) / zone.ry;
    const norm = Math.sqrt(nx * nx + ny * ny);

    const approx = Math.abs(norm - 1) * Math.min(zone.rx, zone.ry);
    if (approx < best) best = approx;
  }

  return best;
}

function isNearWaterEdge(x: number, y: number) {
  if (getTerrainAt(x, y) !== "grass") return false;

  const d = distanceToWaterish(x, y);
  return d >= 4 && d <= 28;
}

function buildShoreTufts(): ShoreTuft[] {
  const rand = mulberry32(7771);
  const tufts: ShoreTuft[] = [];

  for (const zone of GRASS_ZONES) {
    const target = Math.max(8, Math.floor(zone.density * 0.7));
    let placed = 0;
    let attempts = 0;

    while (placed < target && attempts < target * 120) {
      attempts++;

      const x = zone.x + (rand() * 2 - 1) * zone.rx;
      const y = zone.y + (rand() * 2 - 1) * zone.ry;

      if (!pointInEllipse(x, y, zone.x, zone.y, zone.rx, zone.ry, zone.rotation)) {
        continue;
      }

      if (!isNearWaterEdge(x, y)) continue;

      tufts.push({
        x,
        y,
        scale: 0.95 + rand() * 0.7,
        swayOffset: rand() * Math.PI * 2,
        swayStrength: 1.8 + rand() * 1.8,
        tint: rand(),
      });

      placed++;
    }
  }

  return tufts;
}

function getShoreTufts() {
  if (!cachedShoreTufts) cachedShoreTufts = buildShoreTufts();
  return cachedShoreTufts;
}

function drawBlade(
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  lean: number,
  h: number,
  color: string,
  width: number
) {
  ctx.strokeStyle = color;
  ctx.lineWidth = width;
  ctx.lineCap = "round";

  ctx.beginPath();
  ctx.moveTo(x, y);
  ctx.quadraticCurveTo(x + lean * 0.45, y - h * 0.45, x + lean, y - h);
  ctx.stroke();
}

function drawShoreTuft(
  ctx: CanvasRenderingContext2D,
  tuft: ShoreTuft,
  time: number
) {
  const sway = Math.sin(time * 1.3 + tuft.swayOffset) * tuft.swayStrength;
  const h = 13 * tuft.scale;
  const gap = 4.8 * tuft.scale;

  const c1 = tuft.tint > 0.5 ? "#6f9d5f" : "#7aa868";
  const c2 = tuft.tint > 0.5 ? "#5f8c51" : "#6c995b";
  const c3 = tuft.tint > 0.5 ? "#88b576" : "#82b06f";

  drawBlade(ctx, tuft.x - gap, tuft.y, sway * 0.55, h * 0.95, c1, 2);
  drawBlade(ctx, tuft.x - gap * 0.35, tuft.y, sway * 0.8, h * 1.2, c2, 2.4);
  drawBlade(ctx, tuft.x + gap * 0.2, tuft.y, sway, h * 1.35, c2, 2.6);
  drawBlade(ctx, tuft.x + gap, tuft.y, sway * 0.65, h * 1.02, c3, 2);
}

function getFootLineY(playerY: number) {
  return playerY + 28;
}

function isShoreTuftNearFeet(
  tuft: ShoreTuft,
  playerX: number,
  playerY: number
) {
  const footLineY = getFootLineY(playerY);
  const halfWidth = 14;
  const top = footLineY - 2;
  const bottom = footLineY + 30;

  return (
    tuft.x >= playerX - halfWidth &&
    tuft.x <= playerX + halfWidth &&
    tuft.y >= top &&
    tuft.y <= bottom
  );
}

function isPointInRect(px: number, py: number, rect: GrassClearRect) {
  return (
    px >= rect.x &&
    px <= rect.x + rect.width &&
    py >= rect.y &&
    py <= rect.y + rect.height
  );
}

function isShoreTuftClearedByRects(
  tuft: ShoreTuft,
  clearRects?: GrassClearRect[]
) {
  if (!clearRects || clearRects.length === 0) return false;

  for (const rect of clearRects) {
    if (isPointInRect(tuft.x, tuft.y, rect)) return true;
  }

  return false;
}

export function drawShorelineGrassBehindPlayer(
  ctx: CanvasRenderingContext2D,
  time: number,
  clearRects?: GrassClearRect[]
) {
  const tufts = getShoreTufts();

  for (const tuft of tufts) {
    if (isShoreTuftClearedByRects(tuft, clearRects)) continue;
    drawShoreTuft(ctx, tuft, time);
  }
}

export function drawShorelineGrassInFrontOfPlayerLegs(
  ctx: CanvasRenderingContext2D,
  time: number,
  playerX: number,
  playerY: number,
  clearRects?: GrassClearRect[]
) {
  const tufts = getShoreTufts();

  for (const tuft of tufts) {
    if (isShoreTuftClearedByRects(tuft, clearRects)) continue;
    if (!isShoreTuftNearFeet(tuft, playerX, playerY)) continue;
    drawShoreTuft(ctx, tuft, time);
  }
}

export function drawShorelineGrassInRect(
  ctx: CanvasRenderingContext2D,
  time: number,
  minX: number,
  minY: number,
  maxX: number,
  maxY: number,
  clearRects?: GrassClearRect[]
) {
  const tufts = getShoreTufts();

  for (const tuft of tufts) {
    if (isShoreTuftClearedByRects(tuft, clearRects)) continue;

    if (
      tuft.x >= minX &&
      tuft.x <= maxX &&
      tuft.y >= minY &&
      tuft.y <= maxY
    ) {
      drawShoreTuft(ctx, tuft, time);
    }
  }
}

export function drawShorelineGrass(
  ctx: CanvasRenderingContext2D,
  time: number,
  clearRects?: GrassClearRect[]
) {
  const tufts = getShoreTufts();

  for (const tuft of tufts) {
    if (isShoreTuftClearedByRects(tuft, clearRects)) continue;
    drawShoreTuft(ctx, tuft, time);
  }
}

export function drawShorelineGrassDebug(
  ctx: CanvasRenderingContext2D,
  playerX: number,
  playerY: number,
  clearRects?: GrassClearRect[]
) {
  const tufts = getShoreTufts();
  const footLineY = getFootLineY(playerY);

  ctx.save();

  // foot line
  ctx.strokeStyle = "red";
  ctx.lineWidth = 1;
  ctx.beginPath();
  ctx.moveTo(playerX - 30, footLineY);
  ctx.lineTo(playerX + 30, footLineY);
  ctx.stroke();

  // player foot zone box
  ctx.strokeStyle = "yellow";
  ctx.strokeRect(playerX - 14, footLineY - 2, 28, 32);

  // clear rects
  if (clearRects) {
    ctx.strokeStyle = "rgba(255, 120, 0, 0.9)";
    for (const rect of clearRects) {
      ctx.strokeRect(rect.x, rect.y, rect.width, rect.height);
    }
  }

  // tuft bases
  for (const tuft of tufts) {
    const nearFeet = isShoreTuftNearFeet(tuft, playerX, playerY);
    const cleared = isShoreTuftClearedByRects(tuft, clearRects);

    ctx.fillStyle = cleared ? "#ff6600" : nearFeet ? "#ff00ff" : "#00d0ff";
    ctx.beginPath();
    ctx.arc(tuft.x, tuft.y, 1.8, 0, Math.PI * 2);
    ctx.fill();
  }

  ctx.restore();
}