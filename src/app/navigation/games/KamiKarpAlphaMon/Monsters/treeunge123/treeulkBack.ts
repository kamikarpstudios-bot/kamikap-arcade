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

function drawTreeulkBackBody({
  ctx,
  x,
  y,
  time,
  scale,
  blink,
}: MonsterBodyDrawArgs) {
  // slightly larger than last evo, but keeps the same overall anchoring style
  const pixelSize = 4.45 * scale;
  const bodyBob = Math.sin(time * 1.9) * 0.75;
  const tongueSwing = Math.sin(time * 3.0) * 1.1;
  const armSwing = Math.sin(time * 1.8 + 0.8) * 0.9;
  const eyeSquint = blink > 0.5 || Math.sin(time * 2.5) > 0.988;

  const palette = {
    O: "#121809", // outline
    G: "#78b52f", // main leaf green
    H: "#b9e45c", // highlight green
    L: "#eef2cf", // pale belly / mouth
    Y: "#d9cf58", // toe yellow
    P: "#f0a39d", // tongue light
    D: "#cf6d6c", // tongue shadow
    M: "#5e3a26", // mouth line
    B: "#d4bb97", // bark light
    T: "#9b7654", // bark shadow
    W: "#fbf8ef", // eye white
    S: "#547e1d", // green shadow
  };

  ctx.save();
  ctx.translate(Math.round(x), Math.round(y + bodyBob));
  ctx.imageSmoothingEnabled = false;

  // =========================
  // BACK LEGS - thicker and more rooted
  // =========================
  const leftBackLegRows = [
    "....OOGGG......",
    "...OGGGGGGO....",
    "..OGGGGGGGGO...",
    "..OGGGGGGGGGO..",
    "..OGGGGGGGGGO..",
    "...OGGGGGGGO...",
    "...OGGGGGGGO...",
    "...OGGGGGGGO...",
    "..OGGGGGGGGGO..",
    "..OGGGGGGGGGO..",
    "..OGGGGGGGGGO..",
    "..OGGGGGGGGGO..",
  ];

  const rightBackLegRows = [
    "......GGGOO....",
    "....OGGGGGGO...",
    "...OGGGGGGGGO..",
    "..OGGGGGGGGGO..",
    "..OGGGGGGGGGO..",
    "...OGGGGGGGO...",
    "...OGGGGGGGO...",
    "...OGGGGGGGO...",
    "..OGGGGGGGGGO..",
    "..OGGGGGGGGGO..",
    "..OGGGGGGGGGO..",
    "..OGGGGGGGGGO..",
  ];

  drawPixelBlock(ctx, leftBackLegRows, palette, -15, 7, pixelSize);
  drawPixelBlock(ctx, rightBackLegRows, palette, 0, 7, pixelSize);

  // =========================
  // ARMS - much beefier, but still attached in same general zone
  // =========================
  const leftArmRowsA = [
    "...........OGGGGO",
    ".........OGGGGGGO",
    ".......OGGGGGGGGO",
    "......OGGGGGGGGGO",
    ".....OGGGGGGGGGO.",
    "....OGGGGGGGGGO..",
    "...OGGGGGGGGGO...",
    "...OGGGGGGGGO....",
    "...OGGGGGGGGO....",
    "...OGGGGGGGGO....",
    "..OGGGGGGGGGO....",
    "..OGGGGYYYGGO....",
  ];

  const leftArmRowsB = [
    ".........OGGGGO..",
    ".......OGGGGGGO..",
    ".....OGGGGGGGGO..",
    "....OGGGGGGGGGO..",
    "...OGGGGGGGGGGO..",
    "..OGGGGGGGGGGO...",
    "..OGGGGGGGGGO....",
    "..OGGGGGGGGGO....",
    "..OGGGGGGGGO.....",
    "..OGGGGGGGGO.....",
    "..OGGGGGGGGO.....",
    ".OGGGGYYYGGO.....",
  ];

  const rightArmRowsA = [
    "OGGGGO..........",
    "OGGGGGGO........",
    "OGGGGGGGGO......",
    "OGGGGGGGGGO.....",
    ".OGGGGGGGGGO....",
    "..OGGGGGGGGGO...",
    "...OGGGGGGGGGO..",
    "....OGGGGGGGGO..",
    "....OGGGGGGGGO..",
    "....OGGGGGGGGO..",
    "....OGGGGGGGGGO.",
    "....OGGYYYGGGGO.",
  ];

  const rightArmRowsB = [
    "..OGGGGO........",
    "..OGGGGGGO......",
    "..OGGGGGGGGO....",
    "..OGGGGGGGGGO...",
    "..OGGGGGGGGGGO..",
    "...OGGGGGGGGGGO.",
    "....OGGGGGGGGGO.",
    ".....OGGGGGGGGO.",
    ".....OGGGGGGGGO.",
    ".....OGGGGGGGGO.",
    ".....OGGGGGGGGO.",
    ".....OGGYYYGGGO.",
  ];

  drawPixelBlock(
    ctx,
    armSwing > 0 ? leftArmRowsA : leftArmRowsB,
    palette,
    -21,
    -8,
    pixelSize
  );
  drawPixelBlock(
    ctx,
    armSwing > 0 ? rightArmRowsA : rightArmRowsB,
    palette,
    6,
    -8,
    pixelSize
  );

  // =========================
  // BODY - buffed torso, wider shoulders, thicker belly/chest
  // =========================
  const bodyRows = [
    "........OOOOOOOOOOOOOOO.........",
    "......OOOGGGGGGGGGGGGGOOO.......",
    ".....OOGGGGGGGGGGGGGGGGGGOO.....",
    "....OOGGGGGGGGGGGGGGGGGGGGOO....",
    "....OGGGGGGGGGGGGGGGGGGGGGGO....",
    "...OGGGGGGGGGGGGGGGGGGGGGGGGO...",
    "...OGGGGGGGGGGGGGGGGGGGGGGGGO...",
    "...OGGGGGGGGGGGGGGGGGGGGGGGGO...",
    "...OGGGGGGGGGGGGGGGGGGGGGGGGO...",
    "...OGGGGGGGGGGGGGGGGGGGGGGGGO...",
    "...OGGGGGGGGGGGGGGGGGGGGGGGGO...",
    "...OGGGGGGGGGGGGGGGGGGGGGGGGO...",
    "...OGGGGGGGGGGGGGGGGGGGGGGGGO...",
    "....OGGGGGGGGGGGGGGGGGGGGGGO....",
    ".....OGGGGGGGGGGGGGGGGGGGGO.....",
    ".....OGGGGGGGGGGGGGGGGGGGGO.....",
    ".....OGGGGGGGGGGGGGGGGGGGGO.....",
    ".....OGGGGGGGGGGGGGGGGGGGGO.....",
    ".....OGGGGGGGGGGGGGGGGGGGGO.....",
    ".....OGGGGGGGGGGGGGGGGGGGGO.....",
    ".....OGGGGGGGGGGGGGGGGGGGGO.....",
    "......OOOOOOOOOOOOOOOOOOOO.......",
  ];
  drawPixelBlock(ctx, bodyRows, palette, -16, -10, pixelSize);


// =========================
  // EYE BULGES - preserved idea, slightly larger
  // =========================
  const leftEyeBulgeRows = [
    "...OOOO...",
    "..OGGGGO..",
    ".OGGGGGGO.",
    ".OGGGGGGO.",
    "..OGGGGO..",
    "...OOOO...",
  ];

  const rightEyeBulgeRows = [
    "...OOOO...",
    "..OGGGGO..",
    ".OGGGGGGO.",
    ".OGGGGGGO.",
    "..OGGGGO..",
    "...OOOO...",
  ];

  drawPixelBlock(ctx, leftEyeBulgeRows, palette, -12, -22, pixelSize);
  drawPixelBlock(ctx, rightEyeBulgeRows, palette, 4, -22, pixelSize);

  // =========================
  // HEAD - broader, more final-evo
  // =========================
  const headRows = [
    ".......OOOOOOOOOOOOO........",
    ".....OOOGGGGGGGGGGGOOO......",
    "...OOOGGGGGGGGGGGGGGGOOO....",
    "..OOGGGGGGGGGGGGGGGGGGGOO...",
    "..OGGGGGGGGGGGGGGGGGGGGGGO..",
    ".OGGGGGGGGGGGGGGGGGGGGGGGGO.",
    ".OGGGGGGGGGGGGGGGGGGGGGGGGO.",
    ".OGGGGGGGGGGGGGGGGGGGGGGGGO.",
    "..OGGGGGGGGGGGGGGGGGGGGGGO..",
    "...OGGGGGGGGGGGGGGGGGGGGO...",
    "....OGGGGGGGGGGGGGGGGGOO....",
  ];
  drawPixelBlock(ctx, headRows, palette, -13, -21, pixelSize);

    // =========================
  // BROW / FACE MASS
  // =========================
  const browRows = [
    "..OOO.........OOO..",
    ".OGGGO.......OGGGO.",
    "OGGGGGO.....OGGGGGO",
  ];
  drawPixelBlock(ctx, browRows, palette, -10, -23, pixelSize);

  
  

  // =========================
  // FOREARM BARK / WOOD PLATES
  // =========================
  const leftForearmPlateRows = [
    ".OBBBBO",
    "OBTTTTBO",
    "OBTTTTBO",
    ".OBBBBO",
  ];
  const rightForearmPlateRows = [
    "OBBBBO.",
    "OBTTTTBO",
    "OBTTTTBO",
    "OBBBBO.",
  ];

  drawPixelBlock(ctx, leftForearmPlateRows, palette, -18, 0, pixelSize);
  drawPixelBlock(ctx, rightForearmPlateRows, palette, 14, 0, pixelSize);


  ctx.restore();
  ctx.restore();
}

export const treeulkBackMonster: MonsterDefinition = {
  id: "TREEULKBACK",
  name: "TreeulkBack",
  baseHeight: 208,
  homeOffsetX: 0,
  homeOffsetY: 114,
  drawBody: drawTreeulkBackBody,
};