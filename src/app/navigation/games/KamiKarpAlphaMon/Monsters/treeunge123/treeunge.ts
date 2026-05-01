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

function drawTreeungeBody({
  ctx,
  x,
  y,
  time,
  scale,
  blink,
}: MonsterBodyDrawArgs) {
  const pixelSize = 4.2 * scale;
  const bodyBob = Math.sin(time * 2.2) * 0.6;
  const tongueSwing = Math.sin(time * 3.8) * 1.2;
  const armSwing = Math.sin(time * 2.2 + 0.6) * 0.7;
  const isBlinking = blink > 0.5 || Math.sin(time * 3.1) > 0.985;

  const palette = {
    O: "#121809", // outer dark outline
    G: "#95c93d", // main green
    H: "#b8df58", // upper highlight green
    L: "#eef2c8", // cream / belly / mouth
    Y: "#e4e65f", // toe yellow
    P: "#f2a2a0", // tongue light
    D: "#df7a78", // tongue dark
    M: "#7d5037", // mouth line
    B: "#d9c4a5", // bandage light
    T: "#b89a79", // bandage shadow
    W: "#f9f7eb", // eye white
    S: "#7a8d2a", // soft green shadow
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
    ".OGGGYYO.",
    ".OGYYYYO.",
  ];

  const rightBackLegRows = [
    "....GOO..",
    "...GGGGO.",
    "..OGGGGO.",
    "..OGGGO..",
    "..OGGO...",
    ".OGGGO...",
    ".OGGGGO..",
    ".OYYGGGO.",
    ".OYYYYGO.",
  ];

 

  // =========================
  // BODY
  // =========================
  const bodyRows = [
    ".......OOOOOOOOOO........",
    ".....OOGGGGGGGGGGOO.....",
    ".....OOOGGGGGGGGOOO...",
    ".....OGGGGGGGGGGGGO..",
    ".....OGGGGGGGGGGGGO.",
    ".....OGGGLLLLLLGGGO.",
    ".....OGLLLLLLLLLLGO",
    ".....OGLLLLLLLLLLGO",
    ".....OGLLLLLLLLLLGO",
    ".....OGLLLLLLLLLLGO",
    "......OGLLLLLLLLGO.",
    ".......OGGLLLLGGO.",
    ".......OGGGGGGGGO..",
    ".......OGGGGGGGGO...",
    ".......OGGGGGGGGO...",
    ".......OGGGGGGGGO....",
    ".......OGGGGGGGGO....",

  ];
  drawPixelBlock(ctx, bodyRows, palette, -12, -7, pixelSize);
  drawPixelBlock(ctx, leftBackLegRows, palette, -8, 4, pixelSize);
  drawPixelBlock(ctx, rightBackLegRows, palette, -1, 4, pixelSize);
  // =========================
  // HEAD TOP / CHEEKS
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
  drawPixelBlock(ctx, headRows, palette, -10, -18, pixelSize);

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
  if (isBlinking) {
    px(ctx, -10, -18, 5, 1, palette.G, pixelSize);
    px(ctx, 5, -18, 5, 1, palette.G, pixelSize);

    px(ctx, -10, -18, 5, 1, palette.G, pixelSize);
    px(ctx, 5, -18, 5, 1, palette.G, pixelSize);
  } else {
    const eyeRows = [
      ".WWWW.",
      "WWWWWW",
      "WWWWWW",
      ".WWWW.",
    ];
    drawPixelBlock(ctx, eyeRows, palette, -10, -19, pixelSize);
    drawPixelBlock(ctx, eyeRows, palette, 5, -19, pixelSize);

    px(ctx, -8, -18, 2, 2, "#364d05", pixelSize);
    px(ctx, 7, -18, 2, 2, "#314308", pixelSize);
  }




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

export const treeungeMonster: MonsterDefinition = {
  id: "TREEUNGE",
  name: "Treeunge",
  baseHeight: 100,
  faceAnchor: { x: 0.5, y: 0.3 },
  homeOffsetX: 0,
  homeOffsetY: 104,
  battleOffsetX: 0,
  battleOffsetY: 0, 
  loginOffsetX: 0, 
  loginOffsetY: 0,
  drawBody: drawTreeungeBody,
};