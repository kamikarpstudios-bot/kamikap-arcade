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
  alpha = 0.25
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
function drawWaterfalkoBackBody({
  ctx,
  x,
  y,
  time,
  scale,
}: MonsterBodyDrawArgs) {
  const bob = Math.sin(time * 1.65) * 1.8;
  const pixelSize = 3.2 * scale;

  const palette = {
    O: "#0b1720", // outline
    B: "#4b97d1", // body mid blue
    D: "#2d70a8", // darker blue
    L: "#9fdcff", // light blue
    H: "#e7f8ff", // highlight
    W: "#f4efe3", // belly / pale body accents
    S: "#71e6ff", // splash glow
    C: "#26c8ff", // tail cyan
    T: "#118ec7", // tail dark
    E: "#111111", // unused here, back view
    J: "#de66c4", // inner fin accent
  };

  const tailFrame = Math.floor(((Math.sin(time * 1.45) + 1) / 2) * 3);
  const headFrame = Math.floor(((Math.sin(time * 2.05) + 1) / 2) * 3);

  // =========================
  // HEAD BACK
  // =========================
  let headRows: string[];

  if (headFrame === 0) {
      headRows = [
      ".....BBBBBBBBB..........",
      "....BBLLLLLLLBB.........",
      "...BLLLLLLLLLLLB.........",
      "..BLLLBBBBBBBLLLB.........",
      "...BLLBBBBBBBLLB.........",
      "...BLLBBBBBBBLLB.........",
      "....BLLBBBBBLLB.........",
      ".....BLLLLLLLB..........",
      "......BBLLLBB...........",
      ".......BBBBB...........",
    ];
  } else if (headFrame === 1) {
    headRows = [
      ".....BBBBBBBBB..........",
      "....BBLLLLLLLBB.........",
      "...BLLLLLLLLLLLB.........",
      "..BLLLBBBBBBBLLLB.........",
      "...BLLBBBBBBBLLB.........",
      "...BLLBBBBBBBLLB.........",
      "....BLLBBBBBLLB.........",
      ".....BLLLLLLLB..........",
      ".....BLBBBBBLB..........",
      "......BBLLLBB...........",
      ".......BBBBB...........",
    ];
  } else {
    headRows = [
      ".....BBBBBBBBB..........",
      "....BBLLLLLLLBB.........",
      "...BLLLLLLLLLLLB.........",
      "..BLLLBBBBBBBLLLB.........",
      "...BLLBBBBBBBLLB.........",
      "...BLLBBBBBBBLLB.........",
      "....BLLBBBBBLLB.........",
      ".....BLLLLLLLB..........",
      ".....BLBBBBBLB..........",
      "......BBBBBBB...........",
      "......BBLLLBB...........",
      ".......BBBBB...........",
    ];
  }
  // =========================
  // BODY BACK
  // wider back silhouette, no face details
  // =========================
const bodyRows = [

  "..........................BBBBB.......",
  ".........................BBBBBB ........",
  "........................BBBBBBB.........",
  "........................BLLLBBB........",
  ".......................BLLLLLLB.........",
  ".....................BLLLLLLWB.........",
  "...................BLLLLLLLWBB..........",
  "................BLLLLLLLLWWB...........",
  ".............BLLLLLLLLBWWB....WBWBW......",
  "..........BLLLLLLLBLLLBB...BBBBLLLB....",
  "........BLLLLLLLLBLLLLLLBBBLLLLLLLB...",
  "......BBLLLLLLLLLBBBBLLLLLLLLBBBBB......",
  "......BLLBBBBLLLLLLLLLBBBBBBBBB..... .",
  "......BLBBBBBBLLLLLLLWWBBLLH...........",
  "......BLLLLLLLLLLLLLWWBBLLLH..........",
  ".......BBBBBBBBBBLLLLB..BLLLH.........",
  ".........BBWBL..BLLLB....BLLLH........",
  "........BBBBL.....BLLLB...BLLLH.......",
  "........BBBBBW......BLWLLW.BWLWLWL.....",
];

  // =========================
  // TAIL BACK
  // =========================
  let tailRows: string[];

  if (tailFrame === 0) {
    tailRows = [
      "BBLL.............................",
      ".BBBBL...........................",
      ".TSWSBLLLL.......................",
      ".TTSWSBLLLLL.....................",
      "...TTSWWSBLLLLLL.................",
      ".....TTSWWSBLLLLLL...............",
      ".......TSWWWSBLLLLLL.............",
      ".........CWWWSBLLLLLL............",
      "..........CWWWSBLLLLL............",
      "...........CWWSBLLLLLL...........",
      "............CWSBLLLLL............",
      ".............SLLLLLL.............",
      "..............BBBBBBBBB..........",
      "................BBBBBBBB.........",
    ];
  } else if (tailFrame === 1) {
    tailRows = [
      "BBLL...........................",
      ".BBBBL.........................",
      ".TSWBLLLLL.....................",
      ".TTSWBLLLLLL...................",
      "...TTSWWBLLLLLL................",
      ".....TTSWWBLLLLLLL.............",
      ".......TSWWWBLLLLLLL...........",
      ".........CWWWBLLLLLLL..........",
      "..........CWWWBLLLLLL..........",
      "...........CWWBLLLLLLL.........",
      "............CWBLLLLLL..........",
      ".............CCCBLLL...........",
      "..............BBBBBBBBB........",
      "................BBBBBBBB.......",
    ];
  } else {
    tailRows = [
      "BBLL...............................",
      ".BBBBL.............................",
      ".TSWBLLLL,........................",
      ".TTSWBLLLLL........................",
      "...TTSWWBLLLLLL....................",
      ".....TTSWWBLLLLLLL.................",
      ".......TSWWWBLLLLLLL...............",
      ".........CWWWBLLLLLLLL.............",
      "..........CWWWBLLLLLL..............",
      "...........CWWBLLLLLLL.............",
      "............CWBLLLLLL..............",
      ".............BBLLLLL...............",
      "..............BBBBBBBBBB...........",
      "................BBBBBBBBB..........",
    ];
  }

  ctx.save();
  ctx.translate(Math.round(x), Math.round(y + bob));

  drawShadow(ctx, 4 * scale, 52 * scale, 74 * scale, 14 * scale, 0.22);

  // tail behind everything


  // main body
  drawPixelBlock(ctx, headRows, palette, 4, 5, pixelSize);
  drawPixelBlock(ctx, bodyRows, palette, -16, 8, pixelSize);
  drawPixelBlock(ctx, tailRows, palette, -25, 10, pixelSize);
  

  ctx.restore();
}

// =========================
// FACE
// =========================
function drawWaterfalkoBackFace(
  state: MonsterDrawArgs["state"],
  args: FaceDrawArgs
) {
  // face drawn directly in body / no visible face from back
}

// =========================
// EXPORT
// =========================
export const waterfalkoBackMonster: MonsterDefinition = {
  id: "WATERFALKO_BACK",
  name: "Waterfalko",
  imageSrc: "",
  baseHeight: 228,
  faceAnchor: {
    x: 0.5,
    y: 0.13,
  },
  homeOffsetX: 0,
  homeOffsetY: 92,
  battleOffsetX: 0,
  battleOffsetY: 248,
  drawBody: drawWaterfalkoBackBody,
  drawFace: drawWaterfalkoBackFace,
};