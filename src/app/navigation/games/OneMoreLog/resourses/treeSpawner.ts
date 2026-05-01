import { WORLD_WIDTH, WORLD_HEIGHT, getTerrainAt } from "../map/map";
import { createTree, type Tree } from "./tree";
import type { GrassClearRect } from "../decorations/grass";

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

function treeBounds(x: number, y: number) {
  return {
    x: x - 40,
    y: y - 44,
    width: 80,
    height: 88,
  };
}

export function generateTrees(
  clearRects: GrassClearRect[],
  randomFn: () => number = Math.random
) {
  const trees: Tree[] = [];

  const spacing = 160;
  const jitter = 70;

  for (let y = 80; y < WORLD_HEIGHT - 80; y += spacing) {
    for (let x = 80; x < WORLD_WIDTH - 80; x += spacing) {
      const px = x + (randomFn() * 2 - 1) * jitter;
      const py = y + (randomFn() * 2 - 1) * jitter;

      if (getTerrainAt(px, py) !== "grass") continue;

      const bounds = treeBounds(px, py);

      let blocked = false;

      for (const rect of clearRects) {
        if (rectsOverlap(bounds, rect)) {
          blocked = true;
          break;
        }
      }

      if (blocked) continue;

      trees.push(createTree(px, py));
    }
  }

  return trees;
}