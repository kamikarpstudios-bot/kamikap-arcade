export type TreeStage = "full" | "stump" | "gone";

export type Tree = {
  x: number;
  y: number;
  stage: TreeStage;
  health: number;
  maxHealth: number;
  fade: number;
};

export function createTree(x: number, y: number): Tree {
  return {
    x,
    y,
    stage: "full",
    health: 5,
    maxHealth: 5,
    fade: 1,
  };
}

export function getTreeTrunkBounds(tree: Tree) {
  return {
    x: tree.x - 14,
    y: tree.y - 16,
    width: 28,
    height: 16,
  };
}

export function getTreeGrassClearRects(tree: Tree) {
  return [
    {
      x: tree.x - 22,
      y: tree.y - 126,
      width: 44,
      height: 126,
    },
    {
      x: tree.x - 92,
      y: tree.y - 202,
      width: 184,
      height: 92,
    },
  ];
}

export function getPlayerFeet(playerX: number, playerY: number) {
  return {
    x: playerX,
    y: playerY + 28,
  };
}

export function isPlayerBehindTree(
  tree: Tree,
  playerX: number,
  playerY: number
) {
  const feet = getPlayerFeet(playerX, playerY);
  return feet.y < tree.y;
}

export function isPlayerUnderTreeCanopy(
  tree: Tree,
  playerX: number,
  playerY: number
) {
  const feet = getPlayerFeet(playerX, playerY);

  const dx = feet.x - tree.x;
  const dy = feet.y - (tree.y - 118);

  const rx = 82;
  const ry = 54;

  return (dx * dx) / (rx * rx) + (dy * dy) / (ry * ry) <= 1;
}

function drawSoftEllipse(
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  rx: number,
  ry: number,
  color: string
) {
  ctx.beginPath();
  ctx.ellipse(x, y, rx, ry, 0, 0, Math.PI * 2);
  ctx.fillStyle = color;
  ctx.fill();
}

function drawLeafCluster(
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  scale: number,
  color: string
) {
  drawSoftEllipse(ctx, x, y, 22 * scale, 14 * scale, color);
  drawSoftEllipse(ctx, x - 18 * scale, y + 2 * scale, 16 * scale, 12 * scale, color);
  drawSoftEllipse(ctx, x + 18 * scale, y + 2 * scale, 16 * scale, 12 * scale, color);
  drawSoftEllipse(ctx, x - 8 * scale, y - 9 * scale, 14 * scale, 11 * scale, color);
  drawSoftEllipse(ctx, x + 9 * scale, y - 9 * scale, 14 * scale, 11 * scale, color);
}

function drawLowerCanopyPuffs(
  ctx: CanvasRenderingContext2D,
  canopyX: number,
  canopyY: number
) {
  drawSoftEllipse(ctx, canopyX - 72, canopyY + 24, 26, 13, "#2d6338");
  drawSoftEllipse(ctx, canopyX - 42, canopyY + 34, 30, 15, "#2c6137");
  drawSoftEllipse(ctx, canopyX - 10, canopyY + 40, 34, 16, "#295b33");
  drawSoftEllipse(ctx, canopyX + 22, canopyY + 36, 30, 15, "#2f683b");
  drawSoftEllipse(ctx, canopyX + 56, canopyY + 24, 26, 13, "#316d3f");
}

function drawTreeTrunk(
  ctx: CanvasRenderingContext2D,
  tree: Tree,
  trunkTopY: number,
  alpha: number
) {
  ctx.save();
  ctx.globalAlpha *= alpha;

  const fadeStart = trunkTopY + 48;

  // upper trunk
  ctx.beginPath();
  ctx.moveTo(tree.x - 12, fadeStart);
  ctx.lineTo(tree.x - 10, trunkTopY + 22);
  ctx.lineTo(tree.x + 10, trunkTopY + 22);
  ctx.lineTo(tree.x + 12, fadeStart);
  ctx.closePath();
  ctx.fillStyle = "#5a3c29";
  ctx.fill();

  // main trunk
  ctx.beginPath();
  ctx.moveTo(tree.x - 15, tree.y);
  ctx.lineTo(tree.x - 12, fadeStart);
  ctx.lineTo(tree.x + 12, fadeStart);
  ctx.lineTo(tree.x + 15, tree.y);
  ctx.closePath();
  ctx.fillStyle = "#5a3c29";
  ctx.fill();

  ctx.beginPath();
  ctx.moveTo(tree.x - 10, tree.y);
  ctx.lineTo(tree.x - 7, fadeStart);
  ctx.lineTo(tree.x + 7, fadeStart);
  ctx.lineTo(tree.x + 10, tree.y);
  ctx.closePath();
  ctx.fillStyle = "#6e4a31";
  ctx.fill();

  ctx.beginPath();
  ctx.moveTo(tree.x + 2, tree.y);
  ctx.lineTo(tree.x + 5, fadeStart);
  ctx.lineTo(tree.x + 12, fadeStart);
  ctx.lineTo(tree.x + 15, tree.y);
  ctx.closePath();
  ctx.fillStyle = "rgba(38,20,12,0.24)";
  ctx.fill();

  // roots / base
  drawSoftEllipse(ctx, tree.x, tree.y - 1, 18, 6, "rgba(60,35,22,0.22)");
  drawSoftEllipse(ctx, tree.x - 8, tree.y + 1, 6, 3, "rgba(80,48,30,0.28)");
  drawSoftEllipse(ctx, tree.x + 8, tree.y + 1, 6, 3, "rgba(80,48,30,0.28)");

  ctx.restore();
}

export function drawTree(
  ctx: CanvasRenderingContext2D,
  tree: Tree,
  time: number,
  playerX: number,
  playerY: number
) {
  if (tree.stage === "gone") return;

  const behind = isPlayerBehindTree(tree, playerX, playerY);
  const underCanopy = isPlayerUnderTreeCanopy(tree, playerX, playerY);

  let canopyAlpha = 1;
  let trunkAlpha = 1;

  if (behind) {
    canopyAlpha = 0.5;
    trunkAlpha = 0.62;
  }

  if (underCanopy) {
    canopyAlpha = 0.24;
    trunkAlpha = 0.42;
  }

  ctx.save();
  ctx.globalAlpha = tree.fade;

  if (tree.stage === "stump") {
    drawSoftEllipse(ctx, tree.x + 4, tree.y - 1, 20, 8, "rgba(0,0,0,0.16)");

    ctx.fillStyle = "#5b3e2c";
    ctx.fillRect(tree.x - 10, tree.y - 12, 20, 12);

    ctx.beginPath();
    ctx.ellipse(tree.x, tree.y - 12, 10, 5, 0, 0, Math.PI * 2);
    ctx.fillStyle = "#7b5a3f";
    ctx.fill();

    ctx.restore();
    return;
  }

  const sway = Math.sin(time * 1.05 + tree.x * 0.011) * 1.5;
  const trunkTopY = tree.y - 176;
  const canopyX = tree.x + sway;
  const canopyY = trunkTopY + 26;

  // wider foresty shadow
  drawSoftEllipse(ctx, tree.x + 10, tree.y - 2, 72, 24, "rgba(0,0,0,0.12)");
  drawSoftEllipse(ctx, tree.x + 4, tree.y - 10, 46, 15, "rgba(0,0,0,0.07)");

  // trunk stays in base draw only
  drawTreeTrunk(ctx, tree, trunkTopY, trunkAlpha);

  // canopy
  ctx.save();
  ctx.globalAlpha *= canopyAlpha;

  // big top mass
  drawLeafCluster(ctx, canopyX, canopyY, 2.7, "#2c6237");
  drawLeafCluster(ctx, canopyX - 46, canopyY + 10, 1.95, "#326c3f");
  drawLeafCluster(ctx, canopyX + 46, canopyY + 10, 1.95, "#2f683b");

  // upper rounded crown
  drawLeafCluster(ctx, canopyX - 20, canopyY - 24, 1.45, "#3b7949");
  drawLeafCluster(ctx, canopyX + 22, canopyY - 24, 1.45, "#417f50");
  drawLeafCluster(ctx, canopyX, canopyY - 36, 1.25, "#4b8b5a");

  // extra side bulk for forest look
  drawLeafCluster(ctx, canopyX - 72, canopyY + 8, 1.15, "#356f43");
  drawLeafCluster(ctx, canopyX + 72, canopyY + 8, 1.15, "#387546");

  // belly shadow
  drawSoftEllipse(ctx, canopyX, canopyY + 18, 78, 28, "rgba(18,30,16,0.24)");

  ctx.restore();
  ctx.restore();
}

export function drawTreeFrontOverlay(
  ctx: CanvasRenderingContext2D,
  tree: Tree,
  time: number,
  playerX: number,
  playerY: number
) {
  if (tree.stage !== "full") return;

  const behind = isPlayerBehindTree(tree, playerX, playerY);
  const underCanopy = isPlayerUnderTreeCanopy(tree, playerX, playerY);

  let canopyAlpha = 1;
  if (behind) canopyAlpha = 0.5;
  if (underCanopy) canopyAlpha = 0.24;

  const sway = Math.sin(time * 1.05 + tree.x * 0.011) * 1.5;
  const trunkTopY = tree.y - 176;
  const canopyX = tree.x + sway;
  const canopyY = trunkTopY + 26;

  ctx.save();
  ctx.globalAlpha = tree.fade * canopyAlpha;

  // IMPORTANT:
  // no trunk here anymore
  // only the lower/front foliage so trunks don't pop over neighboring canopies
  drawLowerCanopyPuffs(ctx, canopyX, canopyY);

  ctx.restore();
}