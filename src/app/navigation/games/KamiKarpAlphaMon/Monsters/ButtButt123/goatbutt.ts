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
  alpha = 0.24
) {
  ctx.save();
  ctx.fillStyle = `rgba(0,0,0,${alpha})`;
  ctx.beginPath();
  ctx.ellipse(x, y, w, h, 0, 0, Math.PI * 2);
  ctx.fill();
  ctx.restore();
}

// =========================
// BODY (GOATBUTT)
// =========================
function drawGoatbuttBody({
  ctx,
  x,
  y,
  time,
  scale,
  blink,
}: MonsterBodyDrawArgs) {
  const bob = Math.sin(time * 2.1) * 1.2;
  const pixelSize = 3.5 * scale;

  const palette = {
    O: "#0a0502",
    F: "#c79055",
    L: "#e0b078",
    D: "#8d5b32",
    C: "#f2d1a3",
    H: "#c01919",
    G: "#ca5454",
    S: "#dfe7ef",
    M: "#1f2430",
    B: "#10151d",
    W: "#fff8e8",
  };

  const legFrame = Math.floor(time * 5.5) % 2;
  const earFrame = Math.floor(time * 4.5) % 2;
  const tailFrame = Math.floor(time * 6) % 2;

  // =========================
  // BIGGER BODY
  // =========================
  const bodyRows = [
    ".........OOOOOOOOOOOOOOOOOO..........",
    "......OOOFFFFFFFFFFFFFFFFFOOO........",
    "....OOFFFFFFFFFFFFFFFFFFFFFFFOO......",
    "...OFFFFFFFFFFFFFFFFFFFFFFFFFFFO.....",
    "..OFFFFFFLLLLLLLLLLLLLLLLFFFFFFFO.....",
    "..OFFFFFLLLLLLLLLLLLLLLLLLLLFFFFFO....",
    "..OFFFFFLLLLLLLLLLLLLLLLLLLLFFFFFFO....",
    "..OFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFO....",
    "..OFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFO....",
    "..OFFFFFFFDDDDDDDOOODDDDDDDDFFFFFO....",
    "...OFFFFFDDDDDDDDOOODDDDDDDDFFFFO.....",
    "....OOFFFFDDDDDDOOODDDDDDFFFFOO........",
    ".....OOFFFFFFFFFFFFFFFFFFFOO..........",
    "......OOOOOOOOOOOOOOOOOO............",
  ];

  const bellyRows = [
    "...OCCCCCCCCO....",
    "..OCCCCCCCCCCO...",
    ".OCCCCCCCCCCCCO..",
    ".OCCCFFFFFFCCCO..",
    "..OFFFFFFFFFFO...",
    "...OFFFFFFFO....",
  ];

  // =========================
  // HEAD (slightly bigger)
  // =========================
  const headRows = [
    "........OOOOOOOOOOO.......",
    "......OOHHHHHHHHHHHOO.....",
    ".....OHHHHHSSSHHHHHHO.....",
    "....OHHHHHHSSSHHHHHHHO....",
    "...OHHHHHHHSSSHHHHHHHHO...",
    "...OHHHGGGGSSSGGGGHHHHO...",
    "..OHHGGGGGGSSSGGGGGGHHHO..",
    "..OHGGGFFFFFFFFFFFGGGHHO..",
    "..OHGGFFFFFFFFFFFFFGGHHO..",
    "...OFFFFFFFFFFFFFFFFFOO...",
    "...OFFCCCCCCCCCCCCFFO.....",
    "...OFFCCCCCCCCCCCCFFO.....",
    "...OFFCCCCCCCCCCCCFFO.....",
    "....OFCCCCCCCCCCCCFO......",
    ".....OOFCCCCCCCCFOO.......",
    ".......OOOOOOOOOO.........",
  ];

  // =========================
  // BIGGER HORNS
  // =========================
  const leftHornRows = [
    "...SSS..",
    "..SSSSS.",
    ".SSSSSS.",
    "SSSSS...",
    "SSS.....",
  ];

  const rightHornRows = [
    "..SSS...",
    ".SSSSS..",
    ".SSSSSS.",
    "...SSSSS",
    ".....SSS",
  ];

  // =========================
  // EARS
  // =========================
  let leftEarRows: string[];
  let rightEarRows: string[];

  if (earFrame === 0) {
    leftEarRows = [
      "..OOO..",
      ".OFFO..",
      "OFFFO..",
      ".OFFO..",
      "..OO...",
    ];
    rightEarRows = [
      "..OOO..",
      "..OFFO.",
      "..OFFFO",
      "..OFFO.",
      "...OO..",
    ];
  } else {
    leftEarRows = [
      "...OO..",
      "..OFFO.",
      ".OFFFO.",
      "..OFFO.",
      "...OO..",
    ];
    rightEarRows = [
      "..OO...",
      ".OFFO..",
      ".OFFFO.",
      ".OFFO..",
      "..OO...",
    ];
  }

  // =========================
  // LEGS (unchanged anchors)
  // =========================
  let frontLegRows: string[];
  let backLegRows: string[];

  if (legFrame === 0) {
    frontLegRows = [
      "..OOOO....OOOO..",
      ".OFFFO....OFFFO.",
      ".OFFFO....OFFFO.",
      ".OFFFO....OFFFO.",
      ".OFFFO....OFFFO.",
      ".OFFFO....OFFFO.",
      ".OFFFO....OFFFO.",
      ".ODDOO....ODODO.",
      "..OOO......OOO..",
      "..MMM......MMM..",
    ];

    backLegRows = [
      "..OOOO....OOOO..",
      ".OFFFO....OFFFO.",
      ".OFFFO....OFFFO.",
      ".OFFFO....OFFFO.",
      ".OFFFO....OFFFO.",
      ".OFFFO....OFFFO.",
      ".ODDOO....ODODO.",
      ".ODODO....ODODO.",
      "..OOO......OOO..",
      "..MMM......MMM..",
    ];
  } else {
    frontLegRows = [
      "...OOOO...OOOO..",
      "..OFFFO...OFFFO.",
      "..OFFFO...OFFFO.",
      "..OFFFO...OFFFO.",
      "..OFFFO...OFFFO.",
      "..OFFFO...OFFFO.",
      "..OFFFO...OFFFO.",
      "..ODODO...ODODO.",
      "...OOO.....OOO..",
      "...MMM.....MMM..",
    ];

    backLegRows = [
      "..OOOO...OOOO...",
      ".OFFFO...OFFFO..",
      ".OFFFO...OFFFO..",
      ".OFFFO...OFFFO..",
      ".OFFFO...OFFFO..",
      ".OFFFO...OFFFO..",
      ".ODDOO...ODODO..",
      ".ODODO...OODDO..",
      "..OOO.....OOO...",
      "..MMM.....MMM...",
    ];
  }

  // =========================
  // TAIL
  // =========================
  let tailRows: string[];
  if (tailFrame === 0) {
    tailRows = [
      "OOO....",
      "OFFO...",
      ".OFFO..",
      ".OFFO..",
      "..OFFO.",
      "...OOO.",
    ];
  } else {
    tailRows = [
      ".OOO...",
      ".OFFO..",
      ".OFFO..",
      "..OFFO.",
      ".OFFO..",
      "OOO....",
    ];
  }

  // =========================
  // BEARD (NEW)
  // =========================
  const beardRows = [
    "...DDDD...",
    "..DDDDDD..",
    "...DDDD...",
    "....DD....",
  ];

  ctx.save();
  ctx.translate(Math.round(x), Math.round(y + bob));

  drawShadow(ctx, 0, 49 * scale, 78 * scale, 14 * scale, 0.24);



  // tail
  drawPixelBlock(ctx, tailRows, palette, 5, 18, pixelSize);
  // legs
  drawPixelBlock(ctx, frontLegRows, palette, -6, 22, pixelSize);
  // body
  drawPixelBlock(ctx, bodyRows, palette, -25, 12, pixelSize);
  drawPixelBlock(ctx, bellyRows, palette, -20, 10, pixelSize);

  // back legs
  drawPixelBlock(ctx, backLegRows, palette, -20, 24, pixelSize);

  // ears
  drawPixelBlock(ctx, leftEarRows, palette, -30, 2, pixelSize);
  drawPixelBlock(ctx, rightEarRows, palette, -3, 2, pixelSize);

  // head
  drawPixelBlock(ctx, headRows, palette, -26, -2, pixelSize);
  // inline face locked to helmet/head
const eyeY = 8;
const leftEyeX = -18;
const rightEyeX = -11;

if (blink > 0.5) {
  px(ctx, leftEyeX, eyeY + 1, 3, 1, palette.M, pixelSize);
  px(ctx, rightEyeX, eyeY + 1, 3, 1, palette.M, pixelSize);
} else {
  px(ctx, leftEyeX, eyeY, 3, 3, palette.M, pixelSize);
  px(ctx, rightEyeX, eyeY, 3, 3, palette.M, pixelSize);

  px(ctx, leftEyeX, eyeY, 1, 1, palette.W, pixelSize);
  px(ctx, rightEyeX, eyeY, 1, 1, palette.W, pixelSize);
}

// nose / goat mouth
px(ctx, -16, 18, 4, 2, "#3b2717", pixelSize);
px(ctx, -15, 20, 2, 1, palette.M, pixelSize);

// helmet grill
px(ctx, -23, 8, 18, 1, palette.M, pixelSize);
px(ctx, -22, 12, 16, 1, palette.M, pixelSize);
px(ctx, -21, 6, 1, 7, palette.M, pixelSize);
px(ctx, -8, 6, 1, 7, palette.M, pixelSize);

  // beard under head
  drawPixelBlock(ctx, beardRows, palette, -18, 13, pixelSize);

  // horns
  drawPixelBlock(ctx, leftHornRows, palette, -28, -2, pixelSize);
  drawPixelBlock(ctx, rightHornRows, palette, -6, -2, pixelSize);

  ctx.restore();
}

// =========================
// FACE (unchanged)
// =========================
function drawGoatbuttFace(
  _state: MonsterDrawArgs["state"],
  args: FaceDrawArgs
) {
  const { ctx, faceX, faceY, blink } = args;
  const pixelSize = 3.5;

  ctx.save();
  ctx.translate(Math.round(faceX), Math.round(faceY));

  if (blink > 0.5) {
    px(ctx, -7, 11, 3, 1, "#10151d", pixelSize);
    px(ctx, 4, 11, 3, 1, "#10151d", pixelSize);
  } else {
    px(ctx, -7, 10, 3, 3, "#10151d", pixelSize);
    px(ctx, 4, 10, 3, 3, "#10151d", pixelSize);

    px(ctx, -7, 10, 1, 1, "#fff8e8", pixelSize);
    px(ctx, 4, 10, 1, 1, "#fff8e8", pixelSize);
  }

  px(ctx, -2, 20, 4, 2, "#3b2717", pixelSize);
  px(ctx, -1, 22, 2, 1, "#10151d", pixelSize);

  ctx.restore();
}

// =========================
// EXPORT
// =========================
export const goatbuttMonster: MonsterDefinition = {
  id: "GOATBUTT",
  name: "Goatbutt",
  imageSrc: "",
  baseHeight: 185,
  faceAnchor: { x: 0.5, y: 0.28 },
  homeOffsetX: 0,
  homeOffsetY: 95,
  battleOffsetX: 0,
  battleOffsetY: 250,
  drawBody: drawGoatbuttBody,
  drawFace: drawGoatbuttFace,
};