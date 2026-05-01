import {
  MonsterDefinition,
  MonsterBodyDrawArgs,
} from "../monsterTypes";

// =========================
// HELPERS
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
// BODY (BACK)
// =========================
function drawCluckadoodleBodyBack({
  ctx,
  x,
  y,
  time,
  scale,
}: MonsterBodyDrawArgs) {
  const bob = Math.sin(time * 2) * 1.3;
  const pixelSize = 3.5 * scale;

  const palette = {
    O: "#3a3a3a",
    W: "#ffffff",
    G: "#eaeaea",
    H: "#f8f8f8",
    B: "#f59a1b",
    C: "#ffd9a8",
    R: "#d94a2b",
  };

  const wingFrame = Math.floor(time * 7) % 3;
  const footLift = Math.sin(time * 5) * 0.6;

  // =========================
  // WINGS
  // =========================
  let leftWingRows: string[];
  let rightWingRows: string[];

  if (wingFrame === 0) {
    leftWingRows = [
      ".........OOOOOOO........",
      "......OOOWWWWWWOO.......",
      "...OOOOWWWWWWWWWOO......",
      "..OOWWWWWWWWWWWWWWO.....",
      ".OWWWWWWWWWWWWWWWWWO....",
      ".OWWWWWWWWWWWWWWWWWO....",
      "..OWWWWWWWWWWWWWWWO.....",
      "...OWWWWWWWWWWWWWO......",
      "....OOOWWWWWWWOO........",
      ".......OOOOOOO..........",
    ];
  } else if (wingFrame === 1) {
    leftWingRows = [
      ".......OOOOOO.........",
      "....OOOWWWWWWOO.......",
      "..OOOWWWWWWWWWOO......",
      ".OOWWWWWWWWWWWWWO.....",
      "OWWWWWWWWWWWWWWWWO....",
      "OWWWWWWWWWWWWWWWWO....",
      ".OOWWWWWWWWWWWWWO.....",
      "..OOOWWWWWWWWWO.......",
      "....OOOWWWWWO.........",
      ".......OOOO...........",
    ];
  } else {
    leftWingRows = [
      "..........OOOOO.......",
      "......OOOWWWWOO.......",
      "...OOOWWWWWWWWOO......",
      "..OOWWWWWWWWWWWO......",
      ".OWWWWWWWWWWWWWWO.....",
      ".OWWWWWWWWWWWWWWO.....",
      "..OWWWWWWWWWWWWO......",
      "...OOWWWWWWWWO........",
      ".....OOOWWWOO.........",
      ".......OOOO...........",
    ];
  }

  rightWingRows = leftWingRows.map(r => r.split("").reverse().join(""));

  // =========================
  // BODY
  // =========================
  const bodyRows = [
    "........OOOOOOOO........",
    "......OOWWWWWWOO......",
    "....OOWWWWWWWWWWOO....",
    "...OWWWWWWWWWWWWWWO...",
    "..OWWWWGGGGGGGWWWWO..",
    "..OWWWGGGGGGGGWWWWO..",
    ".OWWWWGGGGGGGGWWWWO.",
    ".OWWWWWGGGGGGWWWWWO.",
    ".OWWWWWWWWWWWWWWWWO.",
    ".OWWWWWWWWWWWWWWWWO.",
    ".OWWWWWWWWWWWWWWWWO.",
    ".OWWWWWWWWWWWWWWWWWO.",
    "..OWWWWWWWWWWWWWWWO..",
    "..OOWWWWWWWWWWWWWWOO..",
    "...OOWWWWWWWWWWWOO...",
    ".....OOWWWWWWWOO.....",
    ".......OOWWWOO.......",
    ".........OOOO.......",
  ];

  const headRows = [
    ".......OOOOOOO.......",
    ".....OOWWWWWWOO.....",
    "...OOWWWWWWWWWWOO...",
    "..OWWWWWWWWWWWWWWO..",
    ".OWWWWWWWWWWWWWWWO.",
    ".OWWWWWWWWWWWWWWWO.",
    ".OWWWWWWWWWWWWWWWO.",
    ".OWWWWGGGGGGWWWWWO.",
    ".OWWWWGGGGGGWWWWWO.",
    ".OWWWWWGGGGWWWWWWO.",
    "..OWWWWWWWWWWWWW..",
    "...OOWWWWWWWWOO...",
    ".....OOOOOOO......",
  ];

  // =========================
  // WOK (BEHIND EVERYTHING)
  // =========================
  const wokPalette = {
    O: "#111111",
    I: "#2a2f35",
    H: "#6e7680",
    W: "#7a4a22",
  };

  const wokRows = [
    "......OOOOOOOOOOOO......",
    "...OOHHHHHHHHHHHHOO.....",
    "..OHHHIIIIIIIIIIHHHO....",
    ".OHHIIIIIIIIIIIIIIHHO...",
    "OHHIIIIIIIIIIIIIIIIHHO..",
    "OHHIIIIIIIIIIIIIIIIHHO..",
    ".OHHIIIIIIIIIIIIIIHHO...",
    "..OHHHIIIIIIIIIIHHHO....",
    "...OOHHHHHHHHHHOO......",
    "......OOOOOOOOO........",
    "........OOO............",
    "........OWO............",
    ".......OWWWO...........",
  ];

  const wokBobX = wingFrame === 1 ? -2 : wingFrame === 2 ? 2 : 0;

  ctx.save();
  ctx.translate(Math.round(x), Math.round(y + bob));

  drawShadow(ctx, 0, 58 * scale, 70 * scale, 14 * scale, 0.25);

  // feet
  px(ctx, -10, 32 + footLift, 6, 2, palette.B, pixelSize);
  px(ctx, 4, 32 + footLift, 6, 2, palette.B, pixelSize);

  // wok FIRST (furthest back)
  drawPixelBlock(ctx, wokRows, wokPalette, -34 + wokBobX, 4, pixelSize);

  // wings
  drawPixelBlock(ctx, leftWingRows, palette, -26, 12, pixelSize);
  drawPixelBlock(ctx, rightWingRows, palette, 1, 12, pixelSize);

  // body + head
  drawPixelBlock(ctx, bodyRows, palette, -12, 14, pixelSize);
  drawPixelBlock(ctx, headRows, palette, -12, 2, pixelSize);

  // comb (attached)
  const combRows = [
    "..RRRRRR..",
    ".RRRRRRRR.",
    "RRR..RRRRR",
    "RR....RRRR",
    "..RRRRRR..",
  ];
  drawPixelBlock(ctx, combRows, palette, -5, -2, pixelSize);

  ctx.restore();
}

// =========================
// EXPORT
// =========================
export const cluckadoodleBackMonster: MonsterDefinition = {
  id: "CLUCKADOODLE_BACK",
  name: "Cluckadoodle Back",
  imageSrc: "",
  baseHeight: 200,
  faceAnchor: { x: 0.5, y: 0.28 },
  homeOffsetX: 0,
  homeOffsetY: 90,
  battleOffsetX: 0,
  battleOffsetY: 240,
  drawBody: drawCluckadoodleBodyBack,
  drawFace: () => {},
};