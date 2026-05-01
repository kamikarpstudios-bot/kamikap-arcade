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
function drawButtbuttBodyBack({
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
  // ========================
const headRows = [
  "........OOOOOOOOOOO.......",
  "......OOHHHHHHHHHHHOO.....",
  ".....OHHHHHSSSHHHHHHO.....",
  "....OHHHHHHSSSHHHHHHHO....",
  "...OHHHHHHHSSSHHHHHHHHO...",
  "...OHHHGGGGSSSGGGGHHHHO...",
  "..OHHGGGGGGSSSGGGGGGHHHO..",
  "..OHGGGGGGGSSSGGGGGGGHHO..",
  "..OHGGGGGGGSSSGGGGGGGHHO..",
  "...OHHHHHHHSSSHHHHHHOO...",
  "...OHHHHHHHSSSHHHHHHO.....",
  "...OHHHHHHHSSSHHHHHHO.....",
  "...OHHHHHHHSSSHHHHHHO.....",
  "....OHHHHHHSSSHHHHHO......",
  ".....OOHHHHHHHHHHO.......",
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

// BACK VIEW DRAW ORDER
// far legs first
drawPixelBlock(ctx, backLegRows, palette, -18, 25, pixelSize);



// body
drawPixelBlock(ctx, bodyRows, palette, -23, 13, pixelSize);
drawPixelBlock(ctx, bellyRows, palette, -7, 11, pixelSize);
// tail behind body, mirrored to other side
drawPixelBlock(ctx, tailRows, palette, -20, 18, pixelSize);
// near legs
drawPixelBlock(ctx, frontLegRows, palette, -6, 25, pixelSize);

// ears behind helmet - matched to new head position
drawPixelBlock(ctx, rightEarRows, palette, -12, 3, pixelSize);
drawPixelBlock(ctx, leftEarRows, palette, 11, 3, pixelSize);

// full back helmet/head attached to body
drawPixelBlock(ctx, headRows, palette, -10, -1, pixelSize);

// horns on top of helmet - matched to new head position
drawPixelBlock(ctx, rightHornRows, palette, -8, 1, pixelSize);
drawPixelBlock(ctx, leftHornRows, palette, 7, 1, pixelSize);
ctx.restore();
}

// =========================
// EXPORT
// =========================

export const buttbuttBackMonster: MonsterDefinition = {
  id: "BUTTBUTT_BACK",
  name: "ButtbuttBack",
  imageSrc: "",
  baseHeight: 170,
  faceAnchor: { x: 0.5, y: 0.28 },
  homeOffsetX: 0,
  homeOffsetY: 90,
  battleOffsetX: 0,
  battleOffsetY: 240,
  drawBody: drawButtbuttBodyBack,
  drawFace: () => {},
};