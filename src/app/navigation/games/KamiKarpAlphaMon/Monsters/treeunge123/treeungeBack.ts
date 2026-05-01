import { MonsterBodyDrawArgs, MonsterDefinition } from "../monsterTypes";

function px(
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  w: number,
  h: number,
  color: string,
  pixelSize: number
) {
  ctx.fillStyle = color;
  const x1 = Math.round(x * pixelSize);
  const y1 = Math.round(y * pixelSize);
  const x2 = Math.round((x + w) * pixelSize);
  const y2 = Math.round((y + h) * pixelSize);
  ctx.fillRect(x1, y1, x2 - x1, y2 - y1);
}

function drawPixelBlock(
  ctx: CanvasRenderingContext2D,
  rows: string[],
  palette: Record<string, string>,
  ox: number,
  oy: number,
  pixelSize: number
) {
  for (let row = 0; row < rows.length; row++) {
    const line = rows[row];
    for (let col = 0; col < line.length; col++) {
      const cell = line[col];
      if (cell === "." || !palette[cell]) continue;
      px(ctx, ox + col, oy + row, 1, 1, palette[cell], pixelSize);
    }
  }
}

function drawTreeungeBackBody({
  ctx,
  x,
  y,
  time,
  scale,
}: MonsterBodyDrawArgs) {
  const pixelSize = 4.2 * scale;
  const bodyBob = Math.sin(time * 2.2) * 0.6;
  const tongueSwing = Math.sin(time * 3.8) * 1.2;
  const armSwing = Math.sin(time * 2.2 + 0.6) * 0.7;

  const palette = {
    O: "#121809",
    G: "#95c93d",
    H: "#b8df58",
    L: "#eef2c8",
    Y: "#e4e65f",
    P: "#f2a2a0",
    D: "#df7a78",
    M: "#7d5037",
    B: "#d9c4a5",
    T: "#b89a79",
    W: "#f9f7eb",
    S: "#7a8d2a",
  };

  ctx.save();
  ctx.translate(Math.round(x), Math.round(y + bodyBob));
  ctx.imageSmoothingEnabled = false;

  // =========================
  // LEGS BEHIND
  // =========================
  const leftBackLegRows = [
    "..OOG....",
    ".OGGGG...",
    ".OGGGGO..",
    "..OGGGO..",
    "...OGGO..",
    "...OGGGO.",
    "..OGGGGO.",
    ".OGGGGGO.",
    ".OGGGGGO.",
  ];

  const rightBackLegRows = [
    "....GOO..",
    "...GGGGO.",
    "..OGGGGO.",
    "..OGGGO..",
    "..OGGO...",
    ".OGGGO...",
    ".OGGGGO..",
    ".OGGGGO.",
    ".OGGGGGO.",
  ];

  drawPixelBlock(ctx, leftBackLegRows, palette, -8, 4, pixelSize);
  drawPixelBlock(ctx, rightBackLegRows, palette, -1, 4, pixelSize);

  // =========================
  // BODY
  // =========================
  const bodyRows = [
    ".......OOOOOOOOOO........",
    ".....OOGGGGGGGGGGOO......",
    "....OOOGGGGGGGGGGOOO.....",
    "...OOGGGGGGGGGGGGGGOO....",
    "..OOGGGGGGGGGGGGGGGGOO...",
    "..OGGGGGGGGGGGGGGGGGGGO..",
    "..OGGGGGGGGGGGGGGGGGGGO..",
    "..OGGGGGGGGGGGGGGGGGGGO..",
    "..OGGGGGGGGGGGGGGGGGGGO..",
    "..OGGGGGGGGGGGGGGGGGGGO..",
    "...OGGGGGGGGGGGGGGGGGO...",
    "...OGGGGGGGGGGGGGGGGGO...",
    "....OGGGGGGGGGGGGGGGO....",
    "....OGGGGGGGGGGGGGGGO....",
    ".....OGGGGGGGGGGGGGO.....",
    ".....OGGGGGGGGGGGGGO.....",
    "......OGGGGGGGGGGGO......",
  ];
  drawPixelBlock(ctx, bodyRows, palette, -12, -7, pixelSize);

  // =========================
  // EYE BULGES
  // =========================
  const leftEyeBulgeRows = [
    "...OOO..",
    "..OGGGO.",
    ".OGGGGGO",
    ".OGGGGGO",
    "..OGGGO.",
    "...OOO..",
  ];

  const rightEyeBulgeRows = [
    "...OOO..",
    "..OGGGO.",
    ".OGGGGGO",
    ".OGGGGGO",
    "..OGGGO.",
    "...OOO..",
  ];

  drawPixelBlock(ctx, leftEyeBulgeRows, palette, -11, -20, pixelSize);
  drawPixelBlock(ctx, rightEyeBulgeRows, palette, 3, -20, pixelSize);

  // =========================
  // HEAD
  // =========================
  const headRows = [
    "......OOOOOOOOO......",
    "....OOOGGGGGGGOOO....",
    "...OGGGGGGGGGGGGGO...",
    "..OGGGGGGGGGGGGGGGO..",
    ".OGGGGGGGGGGGGGGGGGO.",
    ".OGGGGGGGGGGGGGGGGGO.",
    ".OGGGGGGGGGGGOGGGGGO.",
    ".OGGGGGGGGGGGGGGGGGO.",
    "..OGGGGGGGGGGGGGGGO..",
    "...OGGGGGGGGGGGGGO...",
  ];
  drawPixelBlock(ctx, headRows, palette, -10, -18, pixelSize);

  // =========================
  // ARMS
  // =========================
  const leftArmRowsA = [
    "..OGO.",
    ".OGGO.",
    ".OGGO.",
    ".OGGO.",
    ".OGGO.",
    "..OOGO",
    "...OGO",
    "...OGO",
    "..OGGO",
    "..OYYO",
  ];

  const leftArmRowsB = [
    "...OO.",
    "..OGO.",
    ".OGGO.",
    ".OGGO.",
    ".OGGO.",
    ".OGGO.",
    "..OOGO",
    "...OGO",
    "...OGO",
    "..OYYO",
  ];

  const rightArmRowsA = [
    ".OGO..",
    ".OGGO.",
    ".OGGO.",
    ".OGGO.",
    ".OGGO.",
    ".OGO..",
    "OGO..",
    "OGO..",
    "OGO..",
    "OYYO.",
  ];

  const rightArmRowsB = [
    ".OO...",
    ".OGO..",
    ".OGGO.",
    ".OGGO.",
    ".OGGO.",
    ".OGGO.",
    "OGOO.",
    "OGO..",
    "OGO..",
    "OYYO.",
  ];

  drawPixelBlock(
    ctx,
    armSwing > 0 ? leftArmRowsA : leftArmRowsB,
    palette,
    -10,
    -6,
    pixelSize
  );

  drawPixelBlock(
    ctx,
    armSwing > 0 ? rightArmRowsA : rightArmRowsB,
    palette,
    5,
    -6,
    pixelSize
  );

  ctx.restore();
}

export const treeungeBackMonster: MonsterDefinition = {
  id: "TREEUNGE_BACK",
  name: "Treeunge",
  baseHeight: 100,
  homeOffsetX: 0,
  homeOffsetY: 104,
  drawBody: drawTreeungeBackBody,
};