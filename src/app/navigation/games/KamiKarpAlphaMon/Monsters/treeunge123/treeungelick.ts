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

function drawTreeungelickBody({
  ctx,
  x,
  y,
  time,
  scale,
  blink,
}: MonsterBodyDrawArgs) {
  const pixelSize = 4.2 * scale;
  const bodyBob = Math.sin(time * 2.05) * 0.7;
  const tongueSwing = Math.sin(time * 3.4) * 1.4;
  const armSwing = Math.sin(time * 2.0 + 0.8) * 0.8;
  const eyeSquint = blink > 0.5 || Math.sin(time * 2.8) > 0.986;

  const palette = {
    O: "#121809", // outline
    G: "#89c634", // main green
    H: "#b9e45c", // highlight green
    L: "#f2f3cf", // cream belly / mouth
    Y: "#e7e55d", // toe yellow
    P: "#f2a29e", // tongue light
    D: "#dd7775", // tongue shadow
    M: "#6d432d", // mouth line
    B: "#dec7aa", // wrap light
    T: "#b89473", // wrap shadow
    W: "#fbf8ef", // eye white
    S: "#6f9623", // green shadow
  };

  ctx.save();
  ctx.translate(Math.round(x), Math.round(y + bodyBob));
  ctx.imageSmoothingEnabled = false;

  // =========================
  // BODY
  // =========================
  const bodyRows = [
    ".......OOOOOOOOOOOO........",
    ".....OOGGGGGGGGGGGGOO.....",
    ".....OOOGGGGGGGGGGOOO...",
    ".....OGGGGGGGGGGGGGGO..",
    ".....OGGGGGGGGGGGGGGO.",
    ".....OGGGLLLLLLLLGGGO.",
    ".....OGLLLLLLLLLLLLGO",
    ".....OGLLLLLLLLLLLLGO",
    ".....OGLLLLLLLLLLLLGO",
    ".....OGLLLLLLLLLLLLGO",
    "......OGLLLLLLLLLLGO.",
    ".......OGGLLLLLLGGO.",
    ".......OGGGGGGGGGGO..",
    ".......OGGGGGGGGGGO...",
    ".......OGGGGGGGGGGO...",
    ".......OGGGGGGGGGGO....",
    ".......OGGGGGGGGGGO....",
    ".......OGGGGGGGGGGO...",
    ".......OGGGGGGGGGGO....",
    ".......OGGGGGGGGGGO....",
    "........OOOOOOOOOO.....",
  ];
  drawPixelBlock(ctx, bodyRows, palette, -14, -10, pixelSize);

    // =========================
  // BACK LEGS
  // =========================
  const leftBackLegRows = [
    "...OOGG.....",
    "..OGGGGG....",
    ".OGGGGGGGO..",
    ".OGGGGGGGO..",
    "..OGGGGGO...",
    "...OGGGGO...",
    "...OGGGGO...",
    "..OGGGGGO...",
    ".OGGGGGGGO..",
    ".OGGGYYYYO..",
    ".OGYYYYYYO..",
  ];

  const rightBackLegRows = [
    ".....GGOO...",
    "....GGGGGO..",
    "..OGGGGGGGO.",
    "..OGGGGGGGO.",
    "...OGGGGGO..",
    "...OGGGGO...",
    "...OGGGGO...",
    "...OGGGGGO..",
    "..OGGGGGGGO.",
    "..OYYYYGGGO.",
    "..OYYYYYYGO.",
  ];

  drawPixelBlock(ctx, leftBackLegRows, palette, -13, 5, pixelSize);
  drawPixelBlock(ctx, rightBackLegRows, palette, -2, 5, pixelSize);

  // =========================
  // HEAD
  // =========================
  const headRows = [
    "......OOOOOOOOO......",
    "....OOOGGGGGGGOOO...",
    "...OGGGGGGGGGGGGGO..",
    "..OGGGGGGGGGGGGGGGO.",
    ".OGGGGGGGGGGGGGGGGGO",
    ".OGGGGGGGGGGGGGGGGGO",
    ".OGGGGGGOOOOOOGGGGGO",
    ".OGGGGOOLLLLLLOGGGGO",
    "..OGGOLLLLLLLLLLOGO.",
    "...OGOLLLLLLLLLOGO..",
  ];
  drawPixelBlock(ctx, headRows, palette, -11, -19, pixelSize);

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
  // EYES
  // =========================
  if (eyeSquint) {
  px(ctx, -10, -18, 5, 1, palette.G, pixelSize);
    px(ctx, 5, -18, 5, 1, palette.G, pixelSize);

    px(ctx, -10, -18, 5, 1, palette.G, pixelSize);
    px(ctx, 5, -18, 5, 1, palette.G, pixelSize);
  } else {
    const eyeRows = [
      ".WWWWW.",
      "WWWWWWW",
      "WWWWWWW",
      "WWWWWWW",
      ".WWWWW.",
    ];
    drawPixelBlock(ctx, eyeRows, palette, -10, -19, pixelSize);
    drawPixelBlock(ctx, eyeRows, palette, 5, -19, pixelSize);

    px(ctx, -8, -18, 2, 2, "#364d05", pixelSize);
    px(ctx, 7, -18, 2, 2, "#314308", pixelSize);

  px(ctx, -8, -18, 2, 2, "#b2cb7b", pixelSize);
    px(ctx, 7, -18, 2, 2, "#94a271", pixelSize);
  }




  // =========================
  // ARMS
  // =========================
  const leftArmRowsA = [
    ".........OGGGO",
    ".......OGGGGO",
    "......OGGGGGO",
    ".....OGGGGGO",
    "....OGGGGGO",
    "...OGGGGO",
    "...OGGGGO",
    "...OGGGO",
    "...OGGGO",
    "..OGGGGO",
    "..OGGYYO",
  ];

  const leftArmRowsB = [
    ".......OGGO",
    "......OGGGO",
    "....OGGGGO",
    "...OGGGGGO",
    "..OGGGGGO",
    ".OGGGGGO",
    ".OGGGGGO",
    ".OGGGGO",
    "..OGGGO",
    "..OGGGO",
    ".OGGYYO",
  ];

  const rightArmRowsA = [
    "OGGGO...",
    ".OGGGGO..",
    "..OGGGGGO.",
    "...OGGGGGO.",
    "....OGGGGGO.",
    "....OGGGGGO.",
    "....OGGGGO..",
    ".....OGGGO...",
    ".....OGGGO...",
    "....OGGGGO..",
    "....OYYGGO..",
  ];

  const rightArmRowsB = [
    "OGGO....",
    ".OGGGO...",
    "..OGGGGO..",
    "...OGGGGGO.",
    "....OGGGGGO.",
    "....OGGGGGO.",
    "....OGGGGGO.",
    "....OGGGGO..",
    "....OGGGO...",
    "....OGGGO...",
    "....OYYGGO..",
  ];

  drawPixelBlock( ctx, armSwing > 0 ? leftArmRowsA : leftArmRowsB, palette, -17,-8, pixelSize );
  drawPixelBlock( ctx, armSwing > 0 ? rightArmRowsA : rightArmRowsB, palette, 3,-8, pixelSize );

  // =========================
  // TONGUE
  // =========================
  ctx.save();
  ctx.translate(0, tongueSwing);

  const tongueRows = [
    ".OPPO",
    "..OPPO",
    "...OPPO",
    "....OPPO",
    ".....OPPO",
    "......OPPO",
    ".......OPPO",
    "........OPPO",
    ".........OTTBO",
    ".........OTTBO",
    ".........OBTBO",
    ".........OBBO",
    ".........OBPO",
    ".........OOOO",
  ];

  drawPixelBlock(ctx, tongueRows, palette, -2, -10, pixelSize);


  ctx.restore();

  ctx.restore();
}

export const treeungelickMonster: MonsterDefinition = {
  id: "TREEUNGELICK",
  name: "Treeungelick",
  baseHeight: 190,
  homeOffsetX: 0,
  homeOffsetY: 114,
  drawBody: drawTreeungelickBody,
};