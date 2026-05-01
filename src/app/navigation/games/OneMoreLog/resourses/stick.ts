import type { Tree } from "./tree";
import {
  WORLD_HEIGHT,
  WORLD_WIDTH,
  isPointInWater,
} from "../map/map";

export type Stick = {
  x: number;
  y: number;
  rotation: number;
  length: number;
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

function randomPointInEllipse(cx: number, cy: number, rx: number, ry: number) {
  const angle = Math.random() * Math.PI * 2;
  const radius = Math.sqrt(Math.random());

  return {
    x: cx + Math.cos(angle) * rx * radius,
    y: cy + Math.sin(angle) * ry * radius,
  };
}

export function createStick(x: number, y: number): Stick {
  return {
    x,
    y,
    rotation: rand(-Math.PI, Math.PI),
    length: rand(10, 16),
  };
}

export function generateSticks(
  trees: Tree[],
  count: number,
  clearRects: ClearRect[] = []
): Stick[] {
  const sticks: Stick[] = [];

  if (trees.length === 0) return sticks;

  let attempts = 0;
  const maxAttempts = count * 40;

  while (sticks.length < count && attempts < maxAttempts) {
    attempts++;

    const tree = trees[Math.floor(Math.random() * trees.length)];
    const point = randomPointInEllipse(tree.x + 8, tree.y - 6, 58, 24);

    if (point.x < 8 || point.x > WORLD_WIDTH - 8) continue;
    if (point.y < 8 || point.y > WORLD_HEIGHT - 8) continue;

    if (isPointInWater(point.x, point.y)) continue;
    if (pointInAnyRect(point.x, point.y, clearRects)) continue;

    sticks.push(createStick(point.x, point.y));
  }

  return sticks;
}

export function drawStick(ctx: CanvasRenderingContext2D, stick: Stick) {
  ctx.save();
  ctx.translate(stick.x, stick.y);
  ctx.rotate(stick.rotation);

  ctx.strokeStyle = "#7a5637";
  ctx.lineWidth = 3;
  ctx.lineCap = "round";

  ctx.beginPath();
  ctx.moveTo(-stick.length / 2, 0);
  ctx.lineTo(stick.length / 2, 0);
  ctx.stroke();

  ctx.strokeStyle = "#8a6443";
  ctx.lineWidth = 2;
  ctx.beginPath();
  ctx.moveTo(-stick.length * 0.1, 0);
  ctx.lineTo(stick.length * 0.14, -3);
  ctx.stroke();

  ctx.restore();
}