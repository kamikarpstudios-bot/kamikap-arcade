import {
  WATER_ZONES,
  WORLD_HEIGHT,
  WORLD_WIDTH,
  isPointInWater,
  pointInEllipse,
} from "../map/map";

export type Stone = {
  x: number;
  y: number;
  size: number;
  rotation: number;
};

type ClearRect = {
  x: number;
  y: number;
  width: number;
  height: number;
};

function rand(min: number, max: number) {
  return Math.random() * (max - min) + min;
}

function pointInRect(x: number, y: number, rect: ClearRect) {
  return (
    x >= rect.x &&
    x <= rect.x + rect.width &&
    y >= rect.y &&
    y <= rect.y + rect.height
  );
}

function pointInAnyRect(x: number, y: number, rects: ClearRect[]) {
  for (const rect of rects) {
    if (pointInRect(x, y, rect)) return true;
  }
  return false;
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

export function createStone(x: number, y: number): Stone {
  return {
    x,
    y,
    size: rand(4, 8),
    rotation: rand(-0.6, 0.6),
  };
}

export function generateStones(
  count: number,
  clearRects: ClearRect[] = []
): Stone[] {
  const stones: Stone[] = [];

  let attempts = 0;
  const maxAttempts = count * 50;

  while (stones.length < count && attempts < maxAttempts) {
    attempts++;

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
      x = rand(8, WORLD_WIDTH - 8);
      y = rand(8, WORLD_HEIGHT - 8);
    }

    if (isPointInWater(x, y)) continue;
    if (pointInAnyRect(x, y, clearRects)) continue;

    stones.push(createStone(x, y));
  }

  return stones;
}

export function drawStone(ctx: CanvasRenderingContext2D, stone: Stone) {
  ctx.save();
  ctx.translate(stone.x, stone.y);
  ctx.rotate(stone.rotation);

  ctx.beginPath();
  ctx.ellipse(0, 0, stone.size, stone.size * 0.78, 0, 0, Math.PI * 2);
  ctx.fillStyle = "#8a8a86";
  ctx.fill();

  ctx.beginPath();
  ctx.ellipse(
    -stone.size * 0.18,
    -stone.size * 0.16,
    stone.size * 0.34,
    stone.size * 0.2,
    0,
    0,
    Math.PI * 2
  );
  ctx.fillStyle = "rgba(255,255,255,0.16)";
  ctx.fill();

  ctx.restore();
}