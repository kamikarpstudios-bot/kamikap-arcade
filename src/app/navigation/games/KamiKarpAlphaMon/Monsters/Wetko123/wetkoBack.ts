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
// BODY (BACK)
// =========================
function drawWetkoBackBody({ ctx, x, y, time, scale }: MonsterBodyDrawArgs) {
  const bob = Math.sin(time * 1.8) * 1.5;
  const pixelSize = 3.25 * scale;

  const palette = {
    O: "#0b1720",
    B: "#5a9fd6",
    D: "#347fb4",
    L: "#9fd8ff",
    H: "#dff6ff",
    W: "#f7f3e8",
    S: "#6fe7ff",
    C: "#2ac6ff",
    T: "#128fcb",
    E: "#111111",
    J: "rgb(221, 80, 181)"
  };

  const tailFrame = Math.floor(((Math.sin(time * 1.6) + 1) / 2) * 3);
  const headFrame = Math.floor(((Math.sin(time * 2.2) + 1) / 2) * 3);

  // =========================
  // HEAD (no face details)
  // =========================
  let headRows: string[];

  if (headFrame === 0) {
    headRows = [
      "...BBBBBBBBBBBBBBBB.......",
      "...BBLLLLLLLLLLLLBB.......",
      "...BLLLLLLLLLLLLLLB.......",
      "...BLLLLLLLLLLLLLLB.......",
      "...BLLLLLLLLLLLLLLB.......",
      "...BLLLLLLLLLLLLLLB.......",
      "....BLLLLLLLLLLLLB........",
      ".....BBLLLLLLLLBB.........",
      "......BBBBBBBBBB..........",
    ];
  } else if (headFrame === 1) {
    headRows = [
      "...BBBBBBBBBBBBBBBB.......",
      "...BBLLLLLLLLLLLLBB.......",
      "...BLLLLLLLLLLLLLLB.......",
      "...BLLLLLLLLLLLLLLB.......",
      "...BLLLLLLLLLLLLLLB.......",
      "...BLLLLLLLLLLLLLLB.......",
      "....BBLLLLLLLLLLBB........",
      "....BLLLLLLLLLLLLB........",
      ".....BBLLLLLLLLBB.........",
      "......BBBBBBBBBB..........",
    ];
  } else {
    headRows = [
      "...BBBBBBBBBBBBBBBB.......",
      "...BBLLLLLLLLLLLLBB.......",
      "...BLLLLLLLLLLLLLLB.......",
      "...BLLLLLLLLLLLLLLB.......",
      "...BLLLLLLLLLLLLLLB.......",
      "...BLLLLLLLLLLLLLLB.......",
      "....BBLLLLLLLLLLBB........",
      "....BLLLLLLLLLLLLB........",
      "....BLLLLLLLLLLLLB........",
      ".....BBLLLLLLLLBB.........",
      "......BBBBBBBBBB..........",
    ];
  }

  // =========================
  // BODY
  // =========================
  const bodyRows = [
    ".........BBBB.....................",
    "........BLLLLB....................",
    ".......BLLBLLB...................",
    "......BLLBBBBLLB................",
    "......BLLBBBBBLLB..............",
    ".....BLLBBBBBBBLLLLB............",
    ".....BLLBBBBBBBBLLLLLLB..........",
    ".....BLLBBBBBBBBBBLLLLLLLB........",
    ".....BLLBBBBBBBBBLLLLLLLLLB.......",
    ".....BLLLBBBBBBLLLLLLLLLLLLB.......",
    ".......BLLBBBBBLLLLLLLLLLLLB......",
    "........BLLLLLLLLLLLLLLLLLLLB.....",
    "........BBLLLLLLLLLLLLLLLLBBB.....",
    ".........BBBBBBBBBBLLLLBBDDDD.....",
    "...................LLLL..DDDD.....",
    "...................BBBB..DDDD.....",
  ];

  // =========================
  // ARMS
  // =========================
  const armRows = [
    "...BBB......BBB...",
    "..BLLLB....BLLLB..",
    "..BLLLB....BLLLB..",
    "...BWWB....BWWB...",
    "...BWWB....BWWB...",
    "....BB......BB....",
  ];

  // =========================
  // TAIL
  // =========================
  let tailRows: string[];

  if (tailFrame === 0) {
    tailRows = [
      ".........................LLBB",
      "........................LBBBB.",
      "....................LLLLBSWST.",
      "..................LLLLBSWSTT.",
      "...............LLLLLLBSWWSTT...",
      "............LLLLLLBSWWSTT.....",
      ".........LLLLLLBSWWWST.......",
      ".......LLLLLLBSWWWC.........",
      "......LLLLLBSWWWC..........",
      ".....LLLLLLBSWWC...........",
      ".....LLLLLBSWC............",
      "......LLLLLLS.............",
      "..........SSS..............",
    ];
  } else if (tailFrame === 1) {
    tailRows = [
      ".......................LLBB",
      ".....................LBBBB.",
      "..................LLLLLBWST.",
      "................LLLLLBWSTT.",
      "............LLLLLLBWWSTT...",
      ".........LLLLLLLBWWSTT.....",
      ".......LLLLLLLBWWWST.......",
      "......LLLLLLLBWWWC.........",
      "......LLLLLLBWWWC..........",
      ".....LLLLLLLBWWC...........",
      ".....LLLLLLBWC............",
      "......LLLBCCC.............",
      "..........BBB..............",
    ];
  } else {
    tailRows = [
      "...........................LLBB",
      "........................LBBBB.",
      "....................LLLLLBWST.",
      "...................LLLLLBWSTT.",
      "................LLLLLLBWWSTT...",
      ".............LLLLLLLBWWSTT.....",
      "..........LLLLLLLBWWWST.......",
      ".......LLLLLLLLBWWWC.........",
      "......LLLLLLBWWWC..........",
      ".....LLLLLLLBWWC...........",
      ".....LLLLLLBWC............",
      "......LLLLLBB.............",
      "..........BBB..............",
    ];
  }

  ctx.save();

  ctx.translate(Math.round(x), Math.round(y + bob));
  ctx.scale(-1, 1); // 👈 mirror for back

  drawShadow(ctx, 0, 42 * scale, 58 * scale, 12 * scale, 0.22);

  // =========================
  // BACK DRAW ORDER
  // =========================
  drawPixelBlock(ctx, armRows, palette, -8, 13, pixelSize);
  drawPixelBlock(ctx, headRows, palette, -10, -1, pixelSize);
  drawPixelBlock(ctx, bodyRows, palette, -10, 4, pixelSize);

  
  drawPixelBlock(ctx, tailRows, palette, 7, 3, pixelSize);

  ctx.restore();
}

// =========================
// FACE (none for back)
// =========================
function drawWetkoBackFace(
  state: MonsterDrawArgs["state"],
  args: FaceDrawArgs
) {}

// =========================
// EXPORT
// =========================
export const wetkoBackMonster: MonsterDefinition = {
  id: "WETKO_BACK",
  name: "Wetko",
  imageSrc: "",
  baseHeight: 140,
  faceAnchor: {
    x: 0.5,
    y: 0.28,
  },
  homeOffsetX: 0,
  homeOffsetY: 72,
  battleOffsetX: 0,
  battleOffsetY: 210,
  drawBody: drawWetkoBackBody,
  drawFace: drawWetkoBackFace,
};