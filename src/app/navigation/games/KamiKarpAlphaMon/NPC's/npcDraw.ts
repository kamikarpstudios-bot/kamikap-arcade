import { npcRegistry } from "./npcRegistry";
import { NPCState } from "./npcTypes";

export function drawNPC(
  ctx: CanvasRenderingContext2D,
  id: keyof typeof npcRegistry,
  x: number,
  y: number,
  time: number,
  state: NPCState
) {
  const def = npcRegistry[id];
  if (!def) return;

  def.draw({
    ctx,
    x,
    y,
    time,
    state,
  });
}