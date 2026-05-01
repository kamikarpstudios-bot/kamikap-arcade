export const WORLD_WIDTH = 2800;
export const WORLD_HEIGHT = 1800;

export const LAKE_MAIN = {
  x: 980,
  y: 760,
  rx: 320,
  ry: 185,
  rotation: -0.16,
};

export const WATER_ZONES = [
  LAKE_MAIN,
  { x: 1040, y: 785, rx: 220, ry: 120, rotation: -0.12 },
  { x: 860, y: 675, rx: 130, ry: 48, rotation: -0.22 },
];

export const GRASS_ZONES = [
  { x: 360, y: 320, rx: 260, ry: 140, rotation: -0.08, density: 28 },
  { x: 650, y: 380, rx: 320, ry: 165, rotation: 0.06, density: 34 },
  { x: 620, y: 670, rx: 290, ry: 120, rotation: 0.02, density: 26 },
  { x: 1080, y: 360, rx: 150, ry: 95, rotation: -0.04, density: 14 },
  { x: 1320, y: 540, rx: 240, ry: 130, rotation: 0.08, density: 20 },
  { x: 1520, y: 880, rx: 340, ry: 180, rotation: -0.03, density: 30 },
];

/**
 * These are in SCREEN SPACE after:
 * ctx.translate(0, 320);
 * ctx.scale(1, -1);
 *
 * screenY = 320 - originalY
 */
export const MOUNTAIN_BLOCK_ZONES = [
  { x: 240, y: 70, rx: 320, ry: 160, rotation: -0.15 },
  { x: 260, y: 90, rx: 220, ry: 110, rotation: -0.12 },
  { x: 250, y: 170, rx: 110, ry: 35, rotation: 0 },
];
export const MOUNTAIN_WORLD_ZONES = MOUNTAIN_BLOCK_ZONES.map((zone) => ({
  ...zone,
  y: 320 - zone.y,
}));

export function pointInEllipse(
  px: number,
  py: number,
  cx: number,
  cy: number,
  rx: number,
  ry: number,
  rotation: number
) {
  const dx = px - cx;
  const dy = py - cy;

  const cos = Math.cos(-rotation);
  const sin = Math.sin(-rotation);

  const localX = dx * cos - dy * sin;
  const localY = dx * sin + dy * cos;

  return (localX * localX) / (rx * rx) + (localY * localY) / (ry * ry) <= 1;
}

export function isPointInWater(x: number, y: number) {
  for (const zone of WATER_ZONES) {
    if (pointInEllipse(x, y, zone.x, zone.y, zone.rx, zone.ry, zone.rotation)) {
      return true;
    }
  }
  return false;
}

export function isPointInMountain(x: number, y: number) {
  for (const zone of MOUNTAIN_WORLD_ZONES) {
    if (pointInEllipse(x, y, zone.x, zone.y, zone.rx, zone.ry, zone.rotation)) {
      return true;
    }
  }
  return false;
}

export function isPointInGrassZone(x: number, y: number) {
  for (const zone of GRASS_ZONES) {
    if (pointInEllipse(x, y, zone.x, zone.y, zone.rx, zone.ry, zone.rotation)) {
      return true;
    }
  }
  return false;
}

export function getTerrainAt(x: number, y: number): "water" | "mountain" | "grass" {
  if (isPointInWater(x, y)) return "water";
  if (isPointInMountain(x, y)) return "mountain";
  return "grass";
}

function drawGroundTexture(
  ctx: CanvasRenderingContext2D,
  width: number,
  height: number
) {
  ctx.fillStyle = "rgba(255,255,255,0.035)";
  for (let i = 0; i < 38; i++) {
    const x = (i * 137) % width;
    const y = 40 + ((i * 109) % (height - 80));
    ctx.beginPath();
    ctx.ellipse(x, y, 90, 38, ((i % 5) - 2) * 0.15, 0, Math.PI * 2);
    ctx.fill();
  }

  ctx.fillStyle = "rgba(0,0,0,0.03)";
  for (let i = 0; i < 28; i++) {
    const x = 50 + ((i * 161) % (width - 100));
    const y = 60 + ((i * 127) % (height - 120));
    ctx.beginPath();
    ctx.ellipse(x, y, 62, 28, ((i % 4) - 1.5) * 0.18, 0, Math.PI * 2);
    ctx.fill();
  }
}

function drawWater(ctx: CanvasRenderingContext2D) {
  ctx.fillStyle = "#5c98d6";
  for (const zone of WATER_ZONES) {
    ctx.beginPath();
    ctx.ellipse(zone.x, zone.y, zone.rx, zone.ry, zone.rotation, 0, Math.PI * 2);
    ctx.fill();
  }

  ctx.fillStyle = "#4b87c7";
  ctx.beginPath();
  ctx.ellipse(1020, 790, 180, 96, -0.1, 0, Math.PI * 2);
  ctx.fill();

  ctx.fillStyle = "#74afe6";
  ctx.beginPath();
  ctx.ellipse(845, 675, 120, 38, -0.22, 0, Math.PI * 2);
  ctx.fill();
}

function drawMountainTerrain(ctx: CanvasRenderingContext2D) {
  ctx.save();
  ctx.translate(0, 320);
  ctx.scale(1, -1);
  drawMountainLayers(ctx);
  ctx.restore();
}

function drawMountainLayers(ctx: CanvasRenderingContext2D) {
  ctx.fillStyle = "#7f8691";
  ctx.beginPath();
  ctx.ellipse(240, 250, 320, 160, -0.15, 0, Math.PI * 2);
  ctx.fill();

  ctx.fillStyle = "#676e78";
  ctx.beginPath();
  ctx.ellipse(260, 230, 220, 110, -0.12, 0, Math.PI * 2);
  ctx.fill();

  ctx.fillStyle = "#5a616b";
  ctx.beginPath();
  ctx.ellipse(250, 150, 110, 35, 0, 0, Math.PI * 2);
  ctx.fill();
}

function drawGrassTint(ctx: CanvasRenderingContext2D) {
  ctx.fillStyle = "#98cb8d";
  for (const zone of GRASS_ZONES) {
    ctx.beginPath();
    ctx.ellipse(zone.x, zone.y, zone.rx, zone.ry, zone.rotation, 0, Math.PI * 2);
    ctx.fill();
  }

  ctx.fillStyle = "rgba(255,255,255,0.05)";
  for (const zone of GRASS_ZONES) {
    ctx.beginPath();
    ctx.ellipse(
      zone.x - zone.rx * 0.1,
      zone.y - zone.ry * 0.12,
      zone.rx * 0.72,
      zone.ry * 0.52,
      zone.rotation,
      0,
      Math.PI * 2
    );
    ctx.fill();
  }
}

function drawWaterShoreline(ctx: CanvasRenderingContext2D) {
  for (const zone of WATER_ZONES) {
    // soft darker outer edge
    ctx.strokeStyle = "rgba(58, 96, 62, 0.22)";
    ctx.lineWidth = 10;
    ctx.beginPath();
    ctx.ellipse(
      zone.x,
      zone.y,
      zone.rx + 2,
      zone.ry + 2,
      zone.rotation,
      0,
      Math.PI * 2
    );
    ctx.stroke();

    // lighter inner wet edge
    ctx.strokeStyle = "rgba(255,255,255,0.08)";
    ctx.lineWidth = 4;
    ctx.beginPath();
    ctx.ellipse(
      zone.x,
      zone.y,
      Math.max(8, zone.rx - 3),
      Math.max(8, zone.ry - 3),
      zone.rotation,
      0,
      Math.PI * 2
    );
    ctx.stroke();
  }
}

export function drawMap(
  ctx: CanvasRenderingContext2D,
  width: number,
  height: number
) {
  ctx.fillStyle = "#a8d5a2";
  ctx.fillRect(0, 0, width, height);

  drawGroundTexture(ctx, width, height);
  drawGrassTint(ctx);
  drawMountainTerrain(ctx);
  drawWater(ctx);
  drawWaterShoreline(ctx);
}