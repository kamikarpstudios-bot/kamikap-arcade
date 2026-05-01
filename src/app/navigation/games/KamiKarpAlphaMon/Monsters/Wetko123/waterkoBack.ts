import {
  MonsterDefinition,
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
function drawWaterkoBackBody({ ctx, x, y, time, scale }: MonsterBodyDrawArgs) {
  const bob = Math.sin(time * 1.65) * 1.8;
  const pixelSize = 3.2 * scale;

  const palette = {
    O: "#0b1720", // outline
    B: "#4b97d1", // body mid blue
    D: "#2d70a8", // darker blue
    L: "#9fdcff", // light blue
    H: "#e7f8ff", // highlight
    W: "#f4efe3", // pale underside accent
    S: "#71e6ff", // splash glow
    C: "#26c8ff", // tail cyan
    T: "#118ec7", // tail dark
    J: "#de66c4", // back frill accent
  };

  const tailFrame = Math.floor(((Math.sin(time * 1.45) + 1) / 2) * 3);
  const headFrame = Math.floor(((Math.sin(time * 2.05) + 1) / 2) * 3);

  let headRows: string[];

    if (headFrame === 0) {
    headRows = [
      "...BBBBBBBBBBBBBBBBB..........",
      "...BBWWWWWWLLLLLLLBB.........",
      "..BWWWWLLLLLLLLLLLLLB.........",
      "..BLLLLLLLLLLLLLLLLLB.........",
      "..BLLLLLLLLLLLLLLLLLB.........",
      "..BLLLLLLLLLLLLLLLLLB.........",
      "..BLLLLLLLLLLLLLLLLLB.........",
      "..BBLLLLBBBBBBBLLLLBB.........",
      "..BBLLLBBBBBBBBBLLLBB........",
      "..BLLLBBBBBBBBBBBLLLB.........",
      "...BBBBBBBBBBBBBBBBB...........",
      "....BBBBBBBBBBBBBB............",
    ];
  } else if (headFrame === 1) {
    headRows = [
      "...BBBBBBBBBBBBBBBBB..........",
      "...BBWWWWWWLLLLLLLBB.........",
      "..BWWWWLLLLLLLLLLLLLB.........",
      "..BLLLLLLLLLLLLLLLLLB.........",
      "..BLLLLLLLLLLLLLLLLLB.........",
      "..BLLLLLLLLLLLLLLLLLB.........",
      "..BLLLLLLLLLLLLLLLLLB.........",
      "..BBLLLLBBBBBBBLLLLBB.........",
      "..BBLLLBBBBBBBBBLLLBB........",
      "..BLLLBBBBBBBBBBBLLLB.........",
      "...BBBBBBBBBBBBBBBBB...........",
      "....BBBBBBBBBBBBBB............",
    ];
  } else {
    headRows = [
      "...BBBBBBBBBBBBBBBBB..........",
      "...BBWWWWWWLLLLLLLBB.........",
      "..BWWWWLLLLLLLLLLLLLB.........",
      "..BLLLLLLLLLLLLLLLLLB.........",
      "..BLLLLLLLLLLLLLLLLLB.........",
      "..BLLLLLLLLLLLLLLLLLB.........",
      "..BLLLLLLLLLLLLLLLLLB.........",
      "..BBLLLLBBBBBBBLLLLBB.........",
      "..BBLLLBBBBBBBBBLLLBB........",
      "..BLLLBBBBBBBBBBBLLLB.........",
      "...BBBBBBBBBBBBBBBBB...........",
      "....BBBBBBBBBBBBBB............",
    ];
  }

  // =========================
  // BODY
  // back silhouette version
  // =========================
  const bodyRows = [
    "..............BBBB........................",
    ".............BBBBBB.......................",
    "............BBBBBBBB......................",
    "...........BBBLLLLBBB.....................",
    "..........BBBLLLWLLBBB....................",
    "..........BBLLLLWWLLBBB...................",
    ".........BBLLLLLLWWLLBBBB.................",
    ".........BBLLLLLLLWWLLBBBB...............",
    ".........BLLLLLLLLLWWLLLLBBBB.............",
    ".........BLLLLLLLLLLLWLLLLLLBBB...........",
    ".........BLLLLLLLLLLLLLLLLLLLBBB.........",
    ".........LLLLBLLLLLLLLLLLLLLLLLBB.........",
    ".........LLLLBBLLLLLLLLLLLLLLLBB..........",
    "..........LLDDBBLLLLLLLLLLLLLBBB...........",
    "...........LLDDBBLLLLLLLBBBBBBB............",
    "............DDDBLLLLLBBBBBLLLL............",
    "...............BLLL......BLLL.............",
    "...............BLLL......BLLL.............",
    "...............BLLL......BLLL..........",
    "...............BBBB......BBBB.............",
  ];

  // =========================
  // BACK ARMS / SIDE FINS
  // =========================
  const armRows = [
    "...BBB..........BBB...",
    "...DDDB........BLLLB..",
    "...DDDB......BLLLLLB.",
    "....DDB......BLLLLLB.",
    "....DDB......BLLLLB..",
    "....BDB......BLLLB...",
    "....BBB.......BBBB...",
    "....BWWB.......BWWB...",
    ".....BB........BB....",
  ];

  // =========================
  // TAIL
  // reversed / back-facing bias
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
    "....BBBBBBBBB..............", 
    "...BBBBBBBB................",
  ];
} else if (tailFrame === 1) {
  // Neutral Center
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
    "...BBBBBBBBB..............",
    "..BBBBBBBB................",
  ];
} else {
  // Swung to the Right
  tailRows = [
    "...........................LLBB",
    "........................LBBBB.",
    "..................,..LLLLBWST.",
    "...................LLLLLBWSTT.",
    "................LLLLLLBWWSTT...",
    ".............LLLLLLLBWWSTT.....",
    "..........LLLLLLLBWWWST.......",
    ".......LLLLLLLLBWWWC.........",
    "......LLLLLLBWWWC..........",
    ".....LLLLLLLBWWC...........",
    ".....LLLLLLBWC............",
    "......LLLLLBB.............",
    "...BBBBBBBBBB..............",
    "..BBBBBBBBB................",
    ];
  }

  ctx.save();
  ctx.translate(Math.round(x), Math.round(y + bob));

  drawShadow(ctx, 2 * scale, 46 * scale, 68 * scale, 13 * scale, 0.22);

  // reverse stacking feel:
  

  // head first, then body over parts of it, then arms on top
  drawPixelBlock(ctx, headRows, palette, -12, -2, pixelSize);
  drawPixelBlock(ctx, armRows, palette, -7, 14, pixelSize);
  drawPixelBlock(ctx, bodyRows, palette, -12, 5, pixelSize);
  drawPixelBlock(ctx, tailRows, palette, 8, 5, pixelSize);


  ctx.restore();
}

// =========================
// EXPORT
// =========================
export const waterkoBackMonster: MonsterDefinition = {
  id: "WATERKO_BACK",
  name: "Waterko Back",
  imageSrc: "",
  baseHeight: 165,
  faceAnchor: {
    x: 0.5,
    y: 0.27,
  },
  homeOffsetX: 0,
  homeOffsetY: 74,
  battleOffsetX: 0,
  battleOffsetY: 210,
  drawBody: drawWaterkoBackBody,
  drawFace: () => {},
};