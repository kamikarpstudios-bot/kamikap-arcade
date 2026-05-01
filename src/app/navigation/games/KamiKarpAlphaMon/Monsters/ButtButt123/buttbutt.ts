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
// BODY
// =========================
function drawButtbuttBody({
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
    O: "#0a0502", // dark outline
    F: "#c79055", // fur
    L: "#e0b078", // light fur
    D: "#8d5b32", // dark fur
    C: "#f2d1a3", // cream muzzle/belly
    H: "#c01919", // helmet green
    G: "#ca5454", // helmet light green
    S: "#dfe7ef", // helmet stripe / metal
    M: "#1f2430", // facemask / eye
    B: "#10151d", // black detail
    W: "#fff8e8", // eye shine
  };

  const legFrame = Math.floor(time * 5.5) % 2;
  const earFrame = Math.floor(time * 4.5) % 2;
  const tailFrame = Math.floor(time * 6) % 2;

  // =========================
  // BODY - low, all-fours anchor
  // =========================
  const bodyRows = [
    "............OOOOOOOOOOOOOO...........",
    ".........OOOFFFFFFFFFFFFFOOO.........",
    ".......OOFFFFFFFFFFFFFFFFFFOO........",
    "......OFFFFFFFFFFFFFFFFFFFFFFO.......",
    ".....OFFFFFFLLLLLLLLLFFFFFFFO.......",
    "....OFFFFFLLLLLLLLLLLLLFFFFFFO......",
    "....OFFFFFLLLLLLLLLLLLLFFFFFFO......",
    "...OFFFFFFFFFFFFFFFFFFFFFFFFFFO......",
    "...OFFFFFFFFFFFFFFFFFFFFFFFFFFO......",
    "...OFFFFFFFDDDDDDDDDDDFFFFFFFO......",
    "....OFFFFFDDDDDDDDDDDDFFFFFFO.......",
    ".....OOFFFFDDDDDDDDDFFFFFOO.........",
    ".......OOFFFFFFFFFFFFFFOO...........",
    "..........OOOOOOOOOOOO..............",
  ];

  // =========================
  // CHEST / BELLY PATCH
  // =========================
  const bellyRows = [
    "....OCCCCCCO....",
    "...OCCCCCCCCO...",
    "..OCCCCCCCCCCO..",
    "..OCCCFFFFCCCO..",
    "...OFFFFFFFFO...",
    "....OFFFFFFO....",
  ];

  // =========================
  // HEAD WITH FOOTBALL HELMET
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
  // EARS / HORNS
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

  const leftHornRows = [
    "..SS.",
    ".SSS.",
    ".SS..",
    "SS...",
  ];

  const rightHornRows = [
    ".SS..",
    ".SSS.",
    "..SS.",
    "...SS",
  ];

  // =========================
  // LEGS
  // =========================
  let frontLegRows: string[];
  let backLegRows: string[];

  if (legFrame === 0) {
    frontLegRows = [
      "..OOO....OOO..",
      ".OFFO....OFFO.",
      ".OFFO....OFFO.",
      ".ODDO....ODDO.",
      "..OO......OO..",
      "..MM......MM..",
    ];

    backLegRows = [
      "..OOO....OOO..",
      ".OFFO....OFFO.",
      ".ODDO....ODDO.",
      ".ODDO....ODDO.",
      "..OO......OO..",
      "..MM......MM..",
    ];
  } else {
    frontLegRows = [
      "...OOO...OOO..",
      "..OFFO...OFFO.",
      "..OFFO...OFFO.",
      "..ODDO...ODDO.",
      "...OO.....OO..",
      "...MM.....MM..",
    ];

    backLegRows = [
      "..OOO...OOO...",
      ".OFFO...OFFO..",
      ".ODDO...ODDO..",
      ".ODDO...ODDO..",
      "..OO.....OO...",
      "..MM.....MM...",
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
      "..OFFO.",
      "...OOO.",
    ];
  } else {
    tailRows = [
      ".OOO...",
      ".OFFO..",
      "..OFFO.",
      ".OFFO..",
      "OOO....",
    ];
  }

  ctx.save();
  ctx.translate(Math.round(x), Math.round(y + bob));

    drawShadow(ctx, 0, 49 * scale, 72 * scale, 13 * scale, 0.24);

  // back legs first
 drawPixelBlock(ctx, frontLegRows, palette, -6, 25, pixelSize);

  // tail behind body
  drawPixelBlock(ctx, tailRows, palette, 5, 18, pixelSize);

  // body sits centered on anchor
  drawPixelBlock(ctx, bodyRows, palette, -23, 13, pixelSize);
  drawPixelBlock(ctx, bellyRows, palette, -21, 11, pixelSize);

  // front legs under chest/head side
  
 drawPixelBlock(ctx, backLegRows, palette, -18, 25, pixelSize);
  // ears / horns behind helmet
  drawPixelBlock(ctx, leftEarRows, palette, -28, 3, pixelSize);
  drawPixelBlock(ctx, rightEarRows, palette, -5, 3, pixelSize);


  // head / helmet moved LEFT so it attaches to front of body
  drawPixelBlock(ctx, headRows, palette, -26, -1, pixelSize);

  // =========================
// INLINE FACE (LOCKED TO HEAD)
// =========================
const eyeY = 9;
const leftEyeX = -18;
const rightEyeX = -11;

if (blink > 0.5) {
  px(ctx, leftEyeX, eyeY + 1, 3, 1, "#10151d", pixelSize);
  px(ctx, rightEyeX, eyeY + 1, 3, 1, "#10151d", pixelSize);
} else {
  px(ctx, leftEyeX, eyeY, 3, 3, "#10151d", pixelSize);
  px(ctx, rightEyeX, eyeY, 3, 3, "#10151d", pixelSize);

  px(ctx, leftEyeX, eyeY, 1, 1, "#fff8e8", pixelSize);
  px(ctx, rightEyeX, eyeY, 1, 1, "#fff8e8", pixelSize);
}



  drawPixelBlock(ctx, leftHornRows, palette, -24, 1, pixelSize);
  drawPixelBlock(ctx, rightHornRows, palette, -9, 1, pixelSize);

// helmet facemask bars (shifted up + left)
px(ctx, -23, 9, 18, 1, palette.M, pixelSize);
px(ctx, -22, 13, 16, 1, palette.M, pixelSize);
px(ctx, -21, 6, 1, 7, palette.M, pixelSize);
px(ctx, -8, 6, 1, 7, palette.M, pixelSize);


  ctx.restore();
}

// =========================
// FACE
// =========================
function drawButtbuttFace(
  _state: MonsterDrawArgs["state"],
  args: FaceDrawArgs
) {
  const { ctx, faceX, faceY, blink } = args;
  const pixelSize = 3.5;

  const palette = {
    E: "#10151d",
    W: "#fff8e8",
    N: "#3b2717",
  };

  ctx.save();
  ctx.translate(Math.round(faceX), Math.round(faceY));

  const leftEyeX = -7;
  const rightEyeX = 4;
  const eyeY = 10;

  if (blink > 0.5) {
    px(ctx, leftEyeX, eyeY + 1, 3, 1, palette.E, pixelSize);
    px(ctx, rightEyeX, eyeY + 1, 3, 1, palette.E, pixelSize);
  } else {
    px(ctx, leftEyeX, eyeY, 3, 3, palette.E, pixelSize);
    px(ctx, rightEyeX, eyeY, 3, 3, palette.E, pixelSize);

    px(ctx, leftEyeX, eyeY, 1, 1, palette.W, pixelSize);
    px(ctx, rightEyeX, eyeY, 1, 1, palette.W, pixelSize);
  }

  // nose + mouth
  px(ctx, -2, 20, 4, 2, palette.N, pixelSize);
  px(ctx, -1, 22, 2, 1, palette.E, pixelSize);

  ctx.restore();
}

// =========================
// EXPORT
// =========================
export const buttbuttMonster: MonsterDefinition = {
  id: "BUTTBUTT",
  name: "Buttbutt",
  imageSrc: "",
  baseHeight: 170,
  faceAnchor: { x: 0.5, y: 0.28 },
  homeOffsetX: 0,
  homeOffsetY: 90,
  battleOffsetX: 0,
  battleOffsetY: 240,
  drawBody: drawButtbuttBody,
  drawFace: drawButtbuttFace,
};