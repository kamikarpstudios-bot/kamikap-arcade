import {
  FaceDrawArgs,
  MonsterDefinition,
  MonsterDrawArgs,
  MonsterBodyDrawArgs,
} from "../monsterTypes";

// =========================
// PIXEL HELPERS
// =========================
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

function drawShadow(
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  w: number,
  h: number,
  alpha = 0.22
) {
  ctx.save();
  ctx.fillStyle = `rgba(0,0,0,${alpha})`;
  ctx.beginPath();
  ctx.ellipse(x, y, w, h, 0, 0, Math.PI * 2);
  ctx.fill();
  ctx.restore();
}

// =========================
// BODY
// =========================
function drawCluckCluckBody({
  ctx,
  x,
  y,
  time,
  scale,
  blink,
}: MonsterBodyDrawArgs) {
  const bob = Math.sin(time * 2.1) * 1.4;
  const pixelSize = 3.5 * scale;

  const palette = {
    O: "#6b4a12",
    Y: "#ffd84a",
    G: "#ffea8a",
    H: "#fff6c7",
    B: "#f59a1b",
    D: "#d67d12",
    E: "#1f140b",
    C: "#f7c98e",
    R: "#e25b20",
  };

  const wingFrame = Math.floor(time * 7.5) % 3;
  const tuftFrame = Math.floor(time * 5.2) % 2;
  const tailFrame = Math.floor(time * 6) % 2;
  const footLift = Math.sin(time * 5.2) * 0.55;

  const headRows = [
    "..........OOO.OOO..........",
    "........OOYYYYYYYOO........",
    "......OOYYYYYYYYYYYOO......",
    ".....OYYYYYYYYYYYYYYYO.....",
    "....OYYYYYYYYYYYYYYYYYO....",
    "...OYYYYYYYYYYYYYYYYYYYO...",
    "...OYYYYYYYYYYYYYYYYYYYO...",
    "..OYYYYYYYYGGGGYYYYYYYYYO..",
    "..OYYYYYYYGGGGGGYYYYYYYYO..",
    "..OYYYYYYYGGGGGGYYYYYYYYO..",
    "..OYYYYYYYYGGGGYYYYYYYYYO..",
    "...OYYYYYYYYYYYYYYYYYYYO...",
    "...OOYYYYYYYYYYYYYYYYYOO...",
    "....OOYYYYYYYYYYYYYYYOO....",
    "......OOYYYYYYYYYYYOO......",
    "........OOOYYYYYOOO........",
    "..........OOOOOOO..........",
  ];

  const bodyRows = [
    ".........OOOOOOOOOO.........",
    ".......OOYYYYYYYYOO........",
    ".....OOYYYYYYYYYYYYOO......",
    "....OYYYYYYYYYYYYYYYYO.....",
    "...OYYYYYGGGGGGGGYYYYYO....",
    "...OYYYYGGGGGGGGGGYYYYO....",
    "..OYYYYYGGGGGGGGGGYYYYYO...",
    "..OYYYYYYGGGGGGGGYYYYYYO...",
    "..OYYYYYYYYYYYYYYYYYYYYO...",
    "..OYYYYYYYYYYYYYYYYYYYYO...",
    "...OYYYYYYYYYYYYYYYYYYO....",
    "...OOYYYYYYYYYYYYYYYYOO....",
    "....OOYYYYYYYYYYYYYYOO.....",
    "......OOYYYYYYYYYYOO.......",
    "........OOYYYYYYOO.........",
    "..........OOOOOO...........",
  ];

  let leftWingRows: string[];
  let rightWingRows: string[];

  if (wingFrame === 0) {
  leftWingRows = [
    ".......OOOOOO......",
    ".....OOYYYYYYOO....",
    "...OOYYYYYYYYYYO...",
    "..OYYYYYYYYYYYYYO..",
    ".OYYYYYYYYYYYYYYYO.",
    ".OYYYYYYYYYYYYYYYO.",
    "..OYYYYYYYYYYYYYO..",
    "...OYYYYYYYYYYO....",
    "....OOYYYYYOO......",
    "......OOOO........",
  ];

  rightWingRows = [
    "......OOOOOO.......",
    "....OOYYYYYYOO.....",
    "...OYYYYYYYYYYOO...",
    "..OYYYYYYYYYYYYYO..",
    ".OYYYYYYYYYYYYYYYO.",
    ".OYYYYYYYYYYYYYYYO.",
    "..OYYYYYYYYYYYYYO..",
    "....OYYYYYYYYYYO...",
    "......OOYYYYYOO....",
    "........OOOO......",
  ];
} else if (wingFrame === 1) {
  leftWingRows = [
    ".....OOOOOO........",
    "...OOYYYYYYOO......",
    "..OYYYYYYYYYYOO....",
    ".OYYYYYYYYYYYYYO...",
    "OYYYYYYYYYYYYYYYO..",
    "OYYYYYYYYYYYYYYYO..",
    ".OYYYYYYYYYYYYYO...",
    "..OYYYYYYYYYYO.....",
    "...OOYYYYYOO.......",
    ".....OOOO..........",
  ];

  rightWingRows = [
    "........OOOOOO.....",
    "......OOYYYYYYOO...",
    "....OOYYYYYYYYYYO..",
    "...OYYYYYYYYYYYYYO.",
    "..OYYYYYYYYYYYYYYYO",
    "..OYYYYYYYYYYYYYYYO",
    "...OYYYYYYYYYYYYYO.",
    ".....OYYYYYYYYYYO..",
    ".......OOYYYYYOO...",
    "..........OOOO.....",
  ];
} else {
  leftWingRows = [
    ".........OOOO......",
    "......OOYYYYO......",
    "....OOYYYYYYYO.....",
    "...OYYYYYYYYYYO....",
    "..OYYYYYYYYYYYYO...",
    "..OYYYYYYYYYYYYO...",
    "...OYYYYYYYYYYO....",
    "....OYYYYYYYYO.....",
    ".....OOYYYYO.......",
    ".......OOOO........",
  ];

  rightWingRows = [
    "......OOOO.........",
    "......OYYYYOO......",
    ".....OYYYYYYYOO....",
    "....OYYYYYYYYYYO...",
    "...OYYYYYYYYYYYYO..",
    "...OYYYYYYYYYYYYO..",
    "....OYYYYYYYYYYO...",
    ".....OYYYYYYYYO....",
    ".......OYYYYOO.....",
    "........OOOO.......",
  ];
}

  let tailRows: string[];
  if (tailFrame === 0) {
    tailRows = [
      "....OOO.",
      "..OOYYO.",
      ".OYYYYO.",
      ".OYYYOO.",
      "..OOO...",
    ];
  } else {
    tailRows = [
      "...OOO..",
      ".OOYYO..",
      "OYYYYO..",
      ".OYYYOO.",
      "..OOOO..",
    ];
  }

  const legRows = [
    "...BB..........BB...",
    "...BB..........BB...",
    "...BB..........BB...",
    "..BDBB........BDBB..",
    "..BBBB........BBBB..",
  ];

  let tuftRows: string[];
  if (tuftFrame === 0) {
    tuftRows = [
      "...YYY.YYY...",
      "..YYYYYYYYY..",
      ".YYY.YYY.YY..",
      "...Y..Y.Y....",
    ];
  } else {
    tuftRows = [
      "....YYY.YY...",
      "..YYYYYYYYY..",
      "..YYY.YYY.Y..",
      "...Y...Y.....",
    ];
  }

  const panPalette = {
    O: "#171717",
    I: "#373c42",
    H: "#747a82",
    D: "#25292f",
    W: "#7a4a22",
    L: "#b77638",
    S: "#bfc4c9",
  };

  const panRows = [
    ".....OOOOOOOOO.....",
    "...OOHHHHHHHHHOO...",
    "..OHHHSSSSSHHHHHO..",
    ".OHHSSIIIIISSHHHHO.",
    ".OHSIIIIIIIIIISHHO.",
    "OHHIIIIIIIIIIIIHHHO",
    "OHHIIIIIIIIIIIIHHHO",
    "OHHIIIIIIIIIIIIHHHO",
    "OHHIIIIIIIIIIIIHHHO",
    ".OHSIIIIIIIIIISHHO.",
    ".OHHSSIIIIISSHHHHO.",
    "..OHHHSSSSSHHHHHO..",
    "...OOHHHHHHHHHOO...",
    ".....OOOOOOOOO.....",
    "........OOO........",
    "........OOO.........",
    "........OWO........",
    "........OOO.........",
    "........OWO........",
    ".......OWWWO.......",
    ".......OWWWO.......",
    ".......OWWWO.......",
  ];

  const panBobX = wingFrame === 1 ? -1 : wingFrame === 2 ? 1 : 0;
  const panBobY = wingFrame === 1 ? -1 : 0;

  ctx.save();
  ctx.translate(Math.round(x), Math.round(y + bob));

  drawShadow(ctx, 0, 57 * scale, 61 * scale, 12 * scale, 0.22);

  // feet
  drawPixelBlock(ctx, legRows, palette, -10, 28 + footLift, pixelSize);

  // tiny tail behind body
  drawPixelBlock(ctx, tailRows, palette, 9, 23, pixelSize);



  // larger wings
  drawPixelBlock(ctx, leftWingRows, palette, -21, 14, pixelSize);
  drawPixelBlock(ctx, rightWingRows, palette, 8, 14, pixelSize);

  // bigger frying pan behind wing
  drawPixelBlock(ctx, panRows, panPalette, -28 + panBobX, 5 + panBobY, pixelSize);

  // body + head
  drawPixelBlock(ctx, bodyRows, palette, -12, 14, pixelSize);
  drawPixelBlock(ctx, headRows, palette, -14, -3, pixelSize);

  // tuft
  drawPixelBlock(ctx, tuftRows, palette, -5, -8, pixelSize);

  // beak base / cheek pixels
  px(ctx, -3, 15, 6, 2, palette.B, pixelSize);
  px(ctx, -2, 17, 4, 1, palette.D, pixelSize);
  px(ctx, -7, 15, 2, 2, palette.C, pixelSize);
  px(ctx, 5, 15, 2, 2, palette.C, pixelSize);

  drawCluckCluckFace("HOME", {
    ctx,
    faceX: 0,
    faceY: 0,
    drawW: 0,
    drawH: 0,
    time,
    mouseX: 0,
    mouseY: 0,
    blink,
    yawn: 0,
  });

  ctx.restore();
}

// =========================
// FACE
// =========================
function drawCluckCluckFace(
  _state: MonsterDrawArgs["state"],
  args: FaceDrawArgs
) {
  const { ctx, faceX, faceY, blink } = args;
  const pixelSize = 3.5;

  const palette = {
    E: "#1f140b",
    H: "#fffdf4",
    B: "#f59a1b",
    D: "#d67d12",
  };

  ctx.save();
  ctx.translate(Math.round(faceX), Math.round(faceY));

  const leftEyeX = -8;
  const rightEyeX = 5;
  const eyeY = 10;

  if (blink > 0.5) {
    px(ctx, leftEyeX, eyeY + 2, 4, 1, palette.E, pixelSize);
    px(ctx, rightEyeX, eyeY + 2, 4, 1, palette.E, pixelSize);
  } else {
    px(ctx, leftEyeX, eyeY, 4, 4, palette.E, pixelSize);
    px(ctx, rightEyeX, eyeY, 4, 4, palette.E, pixelSize);

    px(ctx, leftEyeX, eyeY, 1, 1, palette.H, pixelSize);
    px(ctx, rightEyeX, eyeY, 1, 1, palette.H, pixelSize);
  }

  // bigger beak
  px(ctx, -3, 16, 6, 2, palette.B, pixelSize);
  px(ctx, -2, 18, 4, 1, palette.D, pixelSize);
  px(ctx, -1, 19, 2, 1, palette.D, pixelSize);

  ctx.restore();
}

// =========================
// EXPORT
// =========================
export const cluckcluckMonster: MonsterDefinition = {
  id: "CLUCKCLUCK",
  name: "CluckCluck",
  imageSrc: "",
  baseHeight: 170,
  faceAnchor: { x: 0.5, y: 0.28 },
  homeOffsetX: 0,
  homeOffsetY: 90,
  battleOffsetX: 0,
  battleOffsetY: 240,
  drawBody: drawCluckCluckBody,
  drawFace: drawCluckCluckFace,
};