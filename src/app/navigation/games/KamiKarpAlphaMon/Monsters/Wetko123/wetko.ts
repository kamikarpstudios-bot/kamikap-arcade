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
function drawWetkoBody({ ctx, x, y, time, scale }: MonsterBodyDrawArgs) {
  const bob = Math.sin(time * 1.8) * 1.5;
  const pixelSize = 3.25 * scale;

  const palette = {
    O: "#0b1720", // outline
    B: "#5a9fd6", // body mid blue
    D: "#347fb4", // darker blue
    L: "#9fd8ff", // light blue
    H: "#dff6ff", // highlight
    W: "#f7f3e8", // belly / claws
    S: "#6fe7ff", // splash glow
    C: "#2ac6ff", // tail cyan
    T: "#128fcb", // tail darker
    E: "#111111", // eye
    J: "rgb(221, 80, 181)"
  };

  const sway = Math.sin(time * 1.3) * 0.6;
  const tailFrame = Math.floor(((Math.sin(time * 1.6) + 1) / 2) * 3);
  const headFrame = Math.floor(((Math.sin(time * 2.2) + 1) / 2) * 3);
  let headRows: string[];

if (headFrame === 0) {
  // BASE (your original, cleaned spacing)
  headRows = [
    "...BBBBBBBBBBBBBBBB.......",
    "...BBLLLLLLLLLLLLBB.......",
    "...BLLLLLLLLLLLLLLB.......",
    "...BLLLHHHHHHHHLLLB.......",
    "...BLLLHHHHHHHHLLLB.......",
    "...BLLLLHHOHOHHLLLB.......",
    "....BLLLLLLLLLLLLB........",
    ".....BBLLLLLLLLBB.........",
    "......BBBBBBBBBB..........",
  ];
} else if (headFrame === 1) {
  // SQUASH DOWN (fatter, lower)
  headRows = [
    "...BBBBBBBBBBBBBBBB.......",
    "...BBLLLLLLLLLLLLBB.......",
    "...BLLLLLLLLLLLLLLB.......",
    "...BLLLHHHHHHHHLLLB.......",
    "...BLLLHHHHHHHHLLLB.......",
    "...BLLLLHHOHOHHLLLB.......",
    "....BOLLLLLLLLLLOB........",
    "....BLOOOOOOOOOOLB........",
    ".....BBLLLLLLLLBB.........",
    "......BBBBBBBBBB..........",
  ];
} else {
  // STRETCH UP (taller, slimmer)
  headRows = [
    "...BBBBBBBBBBBBBBBB.......",
    "...BBLLLLLLLLLLLLBB.......",
    "...BLLLLLLLLLLLLLLB.......",
    "...BLLLHHHHHHHHLLLB.......",
    "...BLLLHHHHHHHHLLLB.......",
    "...BLLLLHHOHOHHLLLB.......",
    "....BOLLLLLLLLLLOB........",
    "....BLOOOOOOOOOOLB........",
    "....BLLOOOJJJOOLLB........",
    ".....BBLLLLLLLLBB.........",
    "......BBBBBBBBBB..........",
  ];
}

  // =========================
  // NECK / BODY
  // =========================
  const bodyRows = [
    ".........BBBB.....................",
    "........BLLLLB....................",
    ".......BLLWWLB...................",
    "......BLLWWWWBB................",
    "......BLLWWWWBBB..............",
    ".....BLLWWWWWWWBBB............",
    ".....BLLWWWWWWWWWBBBBB..........",
    ".....BLLWWWWWWWWWWWWWBBBBB........",
    ".....BLLWWWWWWWWWWWWWWWWBBBBB.......",
    ".....BLLWWWWWWWWWWWWWWWWLLLLB.......",
    ".......BLLLWWWWWWWWWWWWWLLLLB......",
    "........BLLLLLLLLLLLLLLLLLLLB.....",
    "........BBLLLLLLLLLLLLLLLLBBB.....",
    ".........BBBBBBBBBBBBBBBBLLLL.....",
    "...................DDDD..LLLL.....",
    "...................DDDD..BBBB.....",
   
  ];

  // =========================
  // ARMS
  // =========================
  const armRows = [
    "...BBB......BBB...",
    "..BLLLB....BLLLB..",
    "..BLLLB....BLLLB..",
    "..BLLLB....BLLLB..",
    "...BWWB....BWWB...",
    "...BWWB....BWWB...",
    "....BB......BB....",
  ];

  // =========================
  // BELLY OVERLAY
  // =========================
  const bellyRows = [
    "........WWWW........",
    ".......WWWWWW.......",
    "......WWWWWWWW......",
    "......WWWWWWWW......",
    "......WWWWWWWW......",
    "......WWWWWWWW......",
    ".......WWWWWW.......",
    "........WWWW........",
  ];

  // =========================
  // WATER TAIL
  // =========================
  let tailRows: string[];

 
if (tailFrame === 0) {
  // Swung to the Left
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
    "..........SSS..............", // Anchor point
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
    "..........BBB..............", // Anchor point
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
    "..........BBB..............", // Anchor point
  ];
}

  ctx.save();
  ctx.translate(Math.round(x), Math.round(y + bob));

  drawShadow(ctx, 0, 42 * scale, 58 * scale, 12 * scale, 0.22);

  // tail behind everything
  drawPixelBlock(ctx, tailRows, palette, 7, 3, pixelSize);

  // main body
  drawPixelBlock(ctx, bodyRows, palette, -10, 4, pixelSize);
  drawPixelBlock(ctx, armRows, palette, -8, 13, pixelSize);
  drawPixelBlock(ctx, headRows, palette, -10, -1, pixelSize);
  //drawPixelBlock(ctx, bellyRows, palette, -4, 10, pixelSize);

  // =========================
  // FACE
  // =========================
  const blink = Math.sin(time * 4.8) > 0.955;

  const leftEyeX = -6;
  const rightEyeX = 5;
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
function drawWetkoFace(
  state: MonsterDrawArgs["state"],
  args: FaceDrawArgs
) {
  // face drawn directly in body
}

// =========================
// EXPORT
// =========================
export const wetkoMonster: MonsterDefinition = {
  id: "WETKO",
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
  loginOffsetX: 0,
  loginOffsetY: 0,
  drawBody: drawWetkoBody,
  drawFace: drawWetkoFace,
};