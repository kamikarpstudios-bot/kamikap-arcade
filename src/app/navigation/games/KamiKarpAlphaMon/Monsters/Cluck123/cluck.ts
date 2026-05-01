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
function drawCluckBody({ ctx, x, y, time, scale, blink }: MonsterBodyDrawArgs) {
  const bob = Math.sin(time * 2.2) * 1.5;
  const pixelSize = 3.5 * scale;

  const palette = {
    O: "#6b4a12", // outline
    Y: "#ffd84a", // main yellow
    G: "#ffea8a", // light yellow
    H: "#fff6c7", // highlight
    B: "#f59a1b", // beak / feet orange
    D: "#d67d12", // darker orange
    E: "#1f140b", // eye / line
    C: "#f7c98e", // cheek
  };

  const wingFrame = Math.floor(time * 8) % 3;
  const tuftFrame = Math.floor(time * 5.5) % 2;
  const footLift = Math.sin(time * 5.5) * 0.6;

  const headRows = [
    ".........OOO.OOO.........",
    ".......OOYYYYYYYOO.......",
    ".....OOYYYYYYYYYYYOO.....",
    "....OYYYYYYYYYYYYYYYO....",
    "...OYYYYYYYYYYYYYYYYYO...",
    "..OYYYYYYYYYYYYYYYYYYYO..",
    "..OYYYYYYYYYYYYYYYYYYYO..",
    ".OYYYYYYYYGGGGYYYYYYYYYO.",
    ".OYYYYYYYGGGGGGYYYYYYYYO.",
    ".OYYYYYYYGGGGGGYYYYYYYYO.",
    ".OYYYYYYYYGGGGYYYYYYYYYO.",
    "..OYYYYYYYYYYYYYYYYYYYO..",
    "..OOYYYYYYYYYYYYYYYYYOO..",
    "...OOYYYYYYYYYYYYYYYOO...",
    ".....OOYYYYYYYYYYYOO.....",
    ".......OOOYYYYYOOO.......",
    ".........OOOOOOO.........",
  ];

  const bodyRows = [
    "........OOOOOOOO........",
    "......OOYYYYYYOO......",
    "....OOYYYYYYYYYYOO....",
    "...OYYYYYYYYYYYYYYO...",
    "..OYYYYYGGGGGGYYYYYO..",
    "..OYYYYGGGGGGGGYYYYO..",
    ".OYYYYYGGGGGGGGYYYYYO.",
    ".OYYYYYYGGGGGGYYYYYYO.",
    ".OYYYYYYYYYYYYYYYYYYO.",
    ".OYYYYYYYYYYYYYYYYYYO.",
    "..OYYYYYYYYYYYYYYYYO..",
    "..OOYYYYYYYYYYYYYYOO..",
    "...OOYYYYYYYYYYYYOO...",
    ".....OOYYYYYYYYOO.....",
    ".......OOYYYYOO.......",
    ".........OOOO.........",
  ];

  let leftWingRows: string[];
  let rightWingRows: string[];

  if (wingFrame === 0) {
    leftWingRows = [
      "....OOO.....",
      "..OOYYOO....",
      ".OYYYYYYO...",
      ".OYYYYYYO...",
      "..OYYYYO....",
      "...OOO......",
    ];

    rightWingRows = [
      ".....OOO....",
      "....OOYYOO..",
      "...OYYYYYYO.",
      "...OYYYYYYO.",
      "....OYYYYO..",
      "......OOO...",
    ];
  } else if (wingFrame === 1) {
    leftWingRows = [
      "...OOO......",
      ".OOYYOO.....",
      "OYYYYYYO....",
      "OYYYYYYO....",
      ".OYYYYO.....",
      "..OOO.......",
    ];

    rightWingRows = [
      "......OOO...",
      ".....OOYYOO.",
      "....OYYYYYYO",
      "....OYYYYYYO",
      ".....OYYYYO.",
      ".......OOO..",
    ];
  } else {
    leftWingRows = [
      ".....OO.....",
      "...OOYYO....",
      "..OYYYYYO...",
      "..OYYYYYO...",
      "...OYYYO....",
      "....OO......",
    ];

    rightWingRows = [
      ".....OO.....",
      "....OYYOO...",
      "...OYYYYYO..",
      "...OYYYYYO..",
      "....OYYYO...",
      "......OO....",
    ];
  }

  const legRows = [
    "...BB........BB...",
    "...BB........BB...",
    "...BB........BB...",
    "..BDBB......BDBB..",
    "..BBBB......BBBB..",
  ];

  let tuftRows: string[];
  if (tuftFrame === 0) {
    tuftRows = [
      "...YYY...",
      "..YYYYY..",
      ".YY.YYY..",
      "...Y.Y...",
    ];
  } else {
    tuftRows = [
      "....YYY..",
      "..YYYYY..",
      "..YYY.Y..",
      "...Y.....",
    ];
  }

  ctx.save();
  ctx.translate(Math.round(x), Math.round(y + bob));

  drawShadow(ctx, 0, 54 * scale, 54 * scale, 11 * scale, 0.2);

  // feet
  drawPixelBlock(ctx, legRows, palette, -9, 30 + footLift, pixelSize);

  // wings behind body
  drawPixelBlock(ctx, leftWingRows, palette, -18, 16, pixelSize);
  drawPixelBlock(ctx, rightWingRows, palette, 7, 16, pixelSize);

  // frying pan in left wing
  const panPalette = {
    O: "#1c1c1c", // outline
    I: "#3f4348", // inner metal
    H: "#6e737a", // highlight metal
    D: "#2b2f34", // dark metal
    W: "#7a4a22", // wood handle
    L: "#a56a34", // wood highlight
  };

  const panRows = [
    "....OOOOOOO....",
    "..OOHHHHHHHOO..",
    ".OHHHIIIIHHHHO.",
    ".OHHIIIIIIIHHO.",
    "OHHIIIIIIIIIHHO",
    "OHHIIIIIIIIIHHO",
    ".OHHIIIIIIIHHO.",
    ".OHHHIIIIHHHHO.",
    "..OOHHHHHHHOO..",
    "....OOOOOOO....",
    "......OO.......",
    "......OO.......",
    "......OWO......",
    ".....OWWWO.....",
    ".....OWWWO.....",
  ];

  // slight sway so it feels alive with the flap
  const panBobX = wingFrame === 1 ? -1 : wingFrame === 2 ? 1 : 0;
  const panBobY = wingFrame === 1 ? -1 : 0;

  drawPixelBlock(ctx, panRows, panPalette, -21 + panBobX, 10 + panBobY, pixelSize);

  // body + head
  drawPixelBlock(ctx, bodyRows, palette, -10, 14, pixelSize);
  drawPixelBlock(ctx, headRows, palette, -13, -2, pixelSize);

  // tuft
  drawPixelBlock(ctx, tuftRows, palette, -4, -7, pixelSize);

  // tiny beak base / cheek pixels
  px(ctx, -2, 15, 4, 2, palette.B, pixelSize);
  px(ctx, -6, 15, 2, 2, palette.C, pixelSize);
  px(ctx, 4, 15, 2, 2, palette.C, pixelSize);

  const faceX = 0;
  const faceY = 0;

  drawCluckFace("HOME", {
    ctx,
    faceX,
    faceY,
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
function drawCluckFace(
  _state: MonsterDrawArgs["state"],
  args: FaceDrawArgs
) {
  const { ctx, faceX, faceY, blink } = args;
  const pixelSize = 2.06;

  const palette = {
    E: "#1f140b",
    H: "#fffdf4",
    B: "#f59a1b",
    D: "#d67d12",
  };

  ctx.save();
  ctx.translate(Math.round(faceX), Math.round(faceY));

  const leftEyeX = -7;
  const rightEyeX = 4;
  const eyeY = 11;

  if (blink > 0.5) {
    px(ctx, leftEyeX, eyeY + 1, 3, 1, palette.E, pixelSize);
    px(ctx, rightEyeX, eyeY + 1, 3, 1, palette.E, pixelSize);
  } else {
    px(ctx, leftEyeX, eyeY, 3, 3, palette.E, pixelSize);
    px(ctx, rightEyeX, eyeY, 3, 3, palette.E, pixelSize);

    px(ctx, leftEyeX, eyeY, 1, 1, palette.H, pixelSize);
    px(ctx, rightEyeX, eyeY, 1, 1, palette.H, pixelSize);
  }

  // beak
  px(ctx, -2, 16, 4, 2, palette.B, pixelSize);
  px(ctx, -1, 18, 2, 1, palette.D, pixelSize);

  ctx.restore();
}

// =========================
// EXPORT
// =========================
export const cluckMonster: MonsterDefinition = {
  id: "CLUCK",
  name: "Cluck",
  imageSrc: "",
  baseHeight: 100,
  faceAnchor: { x: 0.5, y: 0.28 },
  homeOffsetX: 0,
  homeOffsetY: 90,
  battleOffsetX: 0,
  battleOffsetY: 240,
  loginOffsetX: 0,
  loginOffsetY: 0,
  drawBody: drawCluckBody,
  drawFace: drawCluckFace,
};