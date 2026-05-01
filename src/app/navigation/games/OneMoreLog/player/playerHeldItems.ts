import type { Player } from "./player";
import { getHeldItemLayer, getPlayerHandAnchors, type HandSide } from "./playerHands";

export type HandItem = "stick" | "stone";

function drawHeldStick(
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  rotation: number
) {
  ctx.save();
  ctx.translate(x, y);
  ctx.rotate(rotation + Math.PI / 2);

  ctx.strokeStyle = "#7a5637";
  ctx.lineWidth = 3;
  ctx.lineCap = "round";

  ctx.beginPath();
  ctx.moveTo(0, -7);
  ctx.lineTo(0, 7);
  ctx.stroke();

  ctx.strokeStyle = "#8a6443";
  ctx.lineWidth = 2;
  ctx.beginPath();
  ctx.moveTo(0, -1);
  ctx.lineTo(3, -4);
  ctx.stroke();

  ctx.restore();
}

function drawHeldStone(
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  rotation: number
) {
  ctx.save();
  ctx.translate(x, y);
  ctx.rotate(rotation * 0.35);

  ctx.beginPath();
  ctx.ellipse(0, 0, 4.8, 4.1, 0.25, 0, Math.PI * 2);
  ctx.fillStyle = "#8a8a86";
  ctx.fill();

  ctx.beginPath();
  ctx.ellipse(-1, -1, 1.6, 1.1, 0.25, 0, Math.PI * 2);
  ctx.fillStyle = "rgba(255,255,255,0.16)";
  ctx.fill();

  ctx.restore();
}

function drawSingleHeldItem(
  ctx: CanvasRenderingContext2D,
  player: Player,
  hands: { left: HandItem | null; right: HandItem | null },
  side: HandSide
) {
  const item = hands[side];
  if (!item) return;

  const anchors = getPlayerHandAnchors(player);
  const hand = anchors[side];

  if (item === "stick") {
    drawHeldStick(ctx, hand.x, hand.y, hand.rotation);
  } else if (item === "stone") {
    drawHeldStone(ctx, hand.x, hand.y, hand.rotation);
  }
}

export function drawHeldItemsBehindPlayer(
  ctx: CanvasRenderingContext2D,
  player: Player,
  hands: { left: HandItem | null; right: HandItem | null }
) {
  if (getHeldItemLayer(player.facing, "left") === "back") {
    drawSingleHeldItem(ctx, player, hands, "left");
  }

  if (getHeldItemLayer(player.facing, "right") === "back") {
    drawSingleHeldItem(ctx, player, hands, "right");
  }
}

export function drawHeldItemsInFrontOfPlayer(
  ctx: CanvasRenderingContext2D,
  player: Player,
  hands: { left: HandItem | null; right: HandItem | null }
) {
  if (getHeldItemLayer(player.facing, "left") === "front") {
    drawSingleHeldItem(ctx, player, hands, "left");
  }

  if (getHeldItemLayer(player.facing, "right") === "front") {
    drawSingleHeldItem(ctx, player, hands, "right");
  }
}