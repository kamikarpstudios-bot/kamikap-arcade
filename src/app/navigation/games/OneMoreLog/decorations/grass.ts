import {
  WORLD_WIDTH,
  WORLD_HEIGHT,
  getTerrainAt,
  isPointInGrassZone,
} from "../map/map";

type GrassTuft = {
  x: number;
  y: number;
  scale: number;
  swayOffset: number;
  swayStrength: number;
  lush: boolean;
};

export type GrassClearRect = {
  x: number;
  y: number;
  width: number;
  height: number;
};

let cachedTufts: GrassTuft[] | null = null;

function mulberry32(seed: number) {
  return function () {
    let t = (seed += 0x6d2b79f5);
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

function buildGrassTufts(): GrassTuft[] {
  const rand = mulberry32(1337);
  const tufts: GrassTuft[] = [];

  const spacing = 34;
  const jitter = 12;

  for (let y = 20; y < WORLD_HEIGHT - 20; y += spacing) {
    for (let x = 20; x < WORLD_WIDTH - 20; x += spacing) {
      const px = x + (rand() * 2 - 1) * jitter;
      const py = y + (rand() * 2 - 1) * jitter;

      if (getTerrainAt(px, py) !== "grass") continue;

      const inLushZone = isPointInGrassZone(px, py);
      const spawnChance = inLushZone ? 0.62 : 0.26;
      if (rand() > spawnChance) continue;

      tufts.push({
        x: px,
        y: py,
        scale: 0.82 + rand() * 0.58,
        swayOffset: rand() * Math.PI * 2,
        swayStrength: 1.2 + rand() * 2,
        lush: inLushZone,
      });
    }
  }

  return tufts;
}

function getGrassTufts() {
  if (!cachedTufts) cachedTufts = buildGrassTufts();
  return cachedTufts;
}

function drawGrassBlade(
  ctx: CanvasRenderingContext2D,
  baseX: number,
  baseY: number,
  lean: number,
  height: number,
  color: string,
  width = 2
) {
  ctx.strokeStyle = color;
  ctx.lineWidth = width;
  ctx.lineCap = "round";

  ctx.beginPath();
  ctx.moveTo(baseX, baseY);
  ctx.quadraticCurveTo(
    baseX + lean * 0.45,
    baseY - height * 0.45,
    baseX + lean,
    baseY - height
  );
  ctx.stroke();
}

function drawSingleGrassTuft(
  ctx: CanvasRenderingContext2D,
  tuft: GrassTuft,
  time: number
) {
  const sway = Math.sin(time * 1.45 + tuft.swayOffset) * tuft.swayStrength;
  const h = (tuft.lush ? 11 : 9) * tuft.scale;
  const gap = 4.2 * tuft.scale;

  const c1 = tuft.lush ? "#84ba75" : "#7daf70";
  const c2 = tuft.lush ? "#76ad68" : "#6fa563";
  const c3 = tuft.lush ? "#92c583" : "#89bb7a";

  drawGrassBlade(ctx, tuft.x - gap, tuft.y, sway * 0.65, h * 0.9, c1, 1.7);
  drawGrassBlade(ctx, tuft.x, tuft.y, sway, h * 1.15, c2, 2.1);
  drawGrassBlade(ctx, tuft.x + gap, tuft.y, sway * 0.58, h * 0.95, c3, 1.7);
}

function getFootLineY(playerY: number) {
  return playerY + 28;
}

function isTuftNearFeet(tuft: GrassTuft, playerX: number, playerY: number) {
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

function isTuftClearedByRects(tuft: GrassTuft, clearRects?: GrassClearRect[]) {
  if (!clearRects || clearRects.length === 0) return false;

  for (const rect of clearRects) {
    if (isPointInRect(tuft.x, tuft.y, rect)) return true;
  }

  return false;
}

export function drawGrassTuftsBehindPlayer(
  ctx: CanvasRenderingContext2D,
  time: number,
  clearRects?: GrassClearRect[]
) {
  const tufts = getGrassTufts();

  for (const tuft of tufts) {
    if (isTuftClearedByRects(tuft, clearRects)) continue;
    drawSingleGrassTuft(ctx, tuft, time);
  }
}

export function drawGrassTuftsInFrontOfPlayerLegs(
  ctx: CanvasRenderingContext2D,
  time: number,
  playerX: number,
  playerY: number,
  clearRects?: GrassClearRect[]
) {
  const tufts = getGrassTufts();

  for (const tuft of tufts) {
    if (isTuftClearedByRects(tuft, clearRects)) continue;
    if (!isTuftNearFeet(tuft, playerX, playerY)) continue;
    drawSingleGrassTuft(ctx, tuft, time);
  }
}

export function drawGrassDebug(
  ctx: CanvasRenderingContext2D,
  playerX: number,
  playerY: number,
  clearRects?: GrassClearRect[]
) {
  const tufts = getGrassTufts();
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
  ctx.strokeRect(playerX - 14, footLineY - 2, 28, 10);

  if (clearRects) {
    ctx.strokeStyle = "rgba(255, 120, 0, 0.9)";
    for (const rect of clearRects) {
      ctx.strokeRect(rect.x, rect.y, rect.width, rect.height);
    }
  }

  // tuft bases
  for (const tuft of tufts) {
    const nearFeet = isTuftNearFeet(tuft, playerX, playerY);
    const cleared = isTuftClearedByRects(tuft, clearRects);

    ctx.fillStyle = cleared ? "#ff6600" : nearFeet ? "#ff00ff" : "#00d0ff";
    ctx.beginPath();
    ctx.arc(tuft.x, tuft.y, 1.8, 0, Math.PI * 2);
    ctx.fill();
  }

  ctx.restore();
}