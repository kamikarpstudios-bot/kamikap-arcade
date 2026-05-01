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
function drawWaterkoBody({ ctx, x, y, time, scale }: MonsterBodyDrawArgs) {
  const bob = Math.sin(time * 1.65) * 1.8;
  const pixelSize = 3.2 * scale;

  const palette = {
    O: "#0b1720", // outline
    B: "#4b97d1", // body mid blue
    D: "#2d70a8", // darker blue
    L: "#9fdcff", // light blue
    H: "#e7f8ff", // highlight
    W: "#f4efe3", // belly / claws
    S: "#71e6ff", // splash glow
    C: "#26c8ff", // tail cyan
    T: "#118ec7", // tail dark
    E: "#111111", // eye
    J: "#de66c4", // inner gill accent
  };

  const tailFrame = Math.floor(((Math.sin(time * 1.45) + 1) / 2) * 3);
  const headFrame = Math.floor(((Math.sin(time * 2.05) + 1) / 2) * 3);

  let headRows: string[];

  if (headFrame === 0) {
    headRows = [
      "....BBBBBBBBBBBBBBBBBB..........",
      "...BBLLLLLLLLLLLLLLLLBB.........",
      "...BLLLLLLLLLLLLLLLLLLB.........",
      "..BLLLLHHHHHHHHHHHHLLLB.........",
      "..BLLLHHHHHHHHHHHHHHLLB.........",
      "..BLLLHHHHOHHHHOHHHLLLB.........",
      "..BLLLLHHHHHHHHHHHHLLLB.........",
      "...BLLLLLLLLLLLLLLLLLB..........",
      "....BBLLLLLLLLLLLLLBB...........",
      ".....BBBBBBBBBBBBBBB............",
    ];
  } else if (headFrame === 1) {
    headRows = [
      "....BBBBBBBBBBBBBBBBBB..........",
      "...BBLLLLLLLLLLLLLLLLBB.........",
      "...BLLLLLLLLLLLLLLLLLLB.........",
      "..BLLLLHHHHHHHHHHHHLLLB.........",
      "..BLLLHHHHHHHHHHHHHHLLB.........",
      "..BLLLHHHHOHHHHOHHHLLLB.........",
      "..BLLLLHHHHHHHHHHHHLLLB.........",
      "..BBLOLLLLLLLLLLLLLOLBB.........",
      "..BLLLOOOOOOOOOOOOOLLLB..........",
      "....BBLLLLLLLLLLLLLBB...........",
      ".....BBBBBBBBBBBBBBB............",
    ];
  } else {
    headRows = [
      "....BBBBBBBBBBBBBBBBBB..........",
      "...BBLLLLLLLLLLLLLLLLBB.........",
      "...BLLLLLLLLLLLLLLLLLLB.........",
      "..BLLLLHHHHHHHHHHHHLLLB.........",
      "..BLLLHHHHHHHHHHHHHHLLB.........",
      "..BLLLHHHHOHHHHOHHHLLLB.........",
      "..BLLLLHHHHHHHHHHHHLLLB.........",
      "..BBLOLLLLLLLLLLLLLOLBB.........",
      "..BBLLOOOOOOOOOOOOOLLBB........",
      "..BLLLOOOOJJJJOOOOOLLLB.........",
      "...BBLLLLLLLLLLLLLLBB...........",
      "....BBBBBBBBBBBBBBBB............",
    ];
  }

  // =========================
  // NECK / BODY
  // longer and fuller than Wetko, but kept aligned around same draw origin
  // =========================
  const bodyRows = [
    "...........BBBB...........................",
    "..........BBBBBB..........................",
    ".........BBBBBBBB.........................",
    "........BLLBBBBBBBB........................",
    "........BLLWWBBBBBBB.......................",
    ".......BLLWWWBBBBBBBBB.....................",
    ".......BLLWWWWLLLLBBBBBB...................",
    ".......BLLWWWWWLLLBBBBBBBB................",
    ".......BLLWWWWWWLLLLBBBBBBBLLLLBB............",
    ".......BLLWWWWWWWWWLLLLLLLLLLLLLLLB........",
    "........BLLWWWWWWWWWLLLLLLLLLLLLLLLB......",
    ".........BLLWWWWWWWWWWWLLLLLLLLLLLLLB......",
    "..........BLLLWWWWWWWWWWLLLLLLLLLLLLB......",
    "...........BLLLLBBBBBBBBBBBBBBBBBBBB......",
    "...........BBBBBBBBBBBBBBBBBBBBBBBBB......",
    "............BBBBBBBBBBBBBBBBBBBLLLB.......",
    ".........................DDDD...LLLB......",
    ".........................DDDD...LLLB......",
    ".........................DDDD...LLLB......",
    ".........................DDDD...BBBB......",
  ];

  // =========================
  // ARMS
  // slightly larger than Wetko
  // =========================
  const armRows = [
    "....BBB........BBB....",
    "...BLLLB......BLLLB...",
    "..BLLLLB......BLLLLB..",
    "..BLLLLB......BLLLLB..",
    "...BWWWB......BWWWB...",
    "...BWWWB......BWWWB...",
    "...BWWWB......BWWWB...",
    "...BWWWB......BWWWB...",
    "...BWWWB......BWWWB...",
    "....BBB........BBB....",
  ];

  // =========================
  // WATER TAIL
  // much bigger / longer, still anchored to the same general region
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

  // tail behind everything
  drawPixelBlock(ctx, tailRows, palette, 17, 4, pixelSize);

  // main body
  drawPixelBlock(ctx, bodyRows, palette, -12, 5, pixelSize);
  drawPixelBlock(ctx, armRows, palette, -9, 15, pixelSize);
  drawPixelBlock(ctx, headRows, palette, -12, -2, pixelSize);

  // =========================
  // FACE
  // =========================
  const blink = Math.sin(time * 4.7) > 0.957;

  const leftEyeX = -7;
  const rightEyeX = 6;
  const eyeY = -1;

  if (blink) {
    px(ctx, leftEyeX, eyeY, 2, 1, palette.E, pixelSize);
    px(ctx, rightEyeX, eyeY, 2, 1, palette.E, pixelSize);
  } else {
    px(ctx, leftEyeX, eyeY, 2, 2, palette.E, pixelSize);
    px(ctx, rightEyeX, eyeY, 2, 2, palette.E, pixelSize);

    px(ctx, leftEyeX, eyeY, 1, 1, palette.H, pixelSize);
    px(ctx, rightEyeX, eyeY, 1, 1, palette.H, pixelSize);
  }

  ctx.restore();
}

// =========================
// FACE
// =========================
function drawWaterkoFace(
  state: MonsterDrawArgs["state"],
  args: FaceDrawArgs
) {
  // face drawn directly in body
}

// =========================
// EXPORT
// =========================
export const waterkoMonster: MonsterDefinition = {
  id: "WATERKO",
  name: "Waterko",
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
  drawBody: drawWaterkoBody,
  drawFace: drawWaterkoFace,
};