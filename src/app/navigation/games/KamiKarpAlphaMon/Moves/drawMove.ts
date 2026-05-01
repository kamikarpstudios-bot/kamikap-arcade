import { MoveAnimationInstance } from "./moveTypes";

export function drawMove(
  ctx: CanvasRenderingContext2D,
  activeMove: MoveAnimationInstance | null
) {
  if (!activeMove) return;
  activeMove.draw(ctx);
}