import {
  FaceDrawArgs,
  MonsterDefinition,
  MonsterDrawArgs,
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
// BODY
// =========================
function drawCluckadoodleBody({
  ctx,
  x,
  y,
  time,
  scale,
  blink,
}: MonsterBodyDrawArgs) {
  const bob = Math.sin(time * 2) * 1.3;
  const pixelSize = 3.5 * scale;

  const palette = {
    O: "#3a3a3a", // outline (soft grey instead of brown)
    W: "#ffffff", // main white
    G: "#eaeaea", // light grey
    H: "#f8f8f8", // highlight
    B: "#f59a1b",
    D: "#d67d12",
    E: "#1f140b",
    C: "#ffd9a8", // warmer cheek
    R: "#d94a2b", // comb red
  };

  const wingFrame = Math.floor(time * 7) % 3;
  const footLift = Math.sin(time * 5) * 0.6;

  // =========================
  // MASSIVE WINGS
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

    rightWingRows = leftWingRows.map(r => r.split("").reverse().join(""));
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

    rightWingRows = leftWingRows.map(r => r.split("").reverse().join(""));
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

    rightWingRows = leftWingRows.map(r => r.split("").reverse().join(""));
  }

  // =========================
  // BODY (white version)
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
    ".OWWWWWWWWWWWWWWWWWWO.",
    ".OWWWWWWWWWWWWWWWWWWO.",
    "..OWWWWWWWWWWWWWWWWWO..",
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
    ".OWWWWWWWWWWWWWWWO.",
    ".OWWWWGGGGGGWWWWWO.",
    ".OWWWWGGGGGGWWWWWO.",
    ".OWWWWWGGGGWWWWWWO.",
    "..OWWWWWWWWWWWWW..",
    "...OOWWWWWWWWOO...",
    ".....OOOOOOO......",
  ];

  // =========================
  // MASSIVE WOK
  // =========================
  const wokPalette = {
    O: "#111111",
    I: "#2a2f35",
    H: "#6e7680",
    R: "#1a1d22",
    W: "#7a4a22",
  };

  const wokRows = [
    "......OOOOOOOOOOOO......",
    "...OOHHHHHHHHHHHHOO.....",
    "..OHHHIIIIIIIIIIHHHO....",
    ".OHHIIIIIIIIIIIIIIHHO...",
    "OHHIIIIIIIIIIIIIIIIHHO..",
    "OHHIIIIIIIIIIIIIIIIHHO..",
    "OHHIIIIIIIIIIIIIIIIHHO..",
    "OHHIIIIIIIIIIIIIIIIHHO..",
    "OHHIIIIIIIIIIIIIIIIHHO..",
    "OHHIIIIIIIIIIIIIIIIHHO..",
    ".OHHIIIIIIIIIIIIIIHHO...",
    "..OHHHIIIIIIIIIIHHHO....",
    "...OOHHHHHHHHHHOO......",
    "......OOOOOOOOO........",
    "........OOO............",
    "........OOO............",
    "........OWO............",
    ".......OWWWO...........",
    ".......OWWWO...........",
  ];

  const wokBobX = wingFrame === 1 ? -2 : wingFrame === 2 ? 2 : 0;

  ctx.save();
  ctx.translate(Math.round(x), Math.round(y + bob));

  drawShadow(ctx, 0, 58 * scale, 70 * scale, 14 * scale, 0.25);

  // feet
  px(ctx, -10, 32 + footLift, 6, 2, palette.B, pixelSize);
  px(ctx, 4, 32 + footLift, 6, 2, palette.B, pixelSize);



  // wings
  drawPixelBlock(ctx, leftWingRows, palette, -26, 12, pixelSize);
  drawPixelBlock(ctx, rightWingRows, palette, 1, 12, pixelSize);
  // wok (behind wing)
  drawPixelBlock(ctx, wokRows, wokPalette, -34 + wokBobX, 4, pixelSize);
  // body + head
  drawPixelBlock(ctx, bodyRows, palette, -12, 14, pixelSize);
  drawPixelBlock(ctx, headRows, palette, -12, 2, pixelSize);

// comb (attached + chunky)
const combRows = [
  "..RRRRRR..",
  ".RRRRRRRR.",
  "RRR..RRRRR",
  "RR....RRRR",
  "..RRRRRR..",
];

drawPixelBlock(ctx, combRows, palette, -5, -2, pixelSize);

  // face
  drawCluckadoodleFace("HOME", {
    ctx,
    faceX: 0,
    faceY: 0,
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
function drawCluckadoodleFace(
  _state: MonsterDrawArgs["state"],
  args: FaceDrawArgs
) {
  const { ctx, faceX, faceY, blink } = args;
  const pixelSize = 3.5;

  ctx.save();
  ctx.translate(Math.round(faceX), Math.round(faceY));

  if (blink > 0.5) {
    px(ctx, -6, 11, 3, 1, "#1f140b", pixelSize);
    px(ctx, 3, 11, 3, 1, "#1f140b", pixelSize);
  } else {
    px(ctx, -6, 10, 3, 3, "#1f140b", pixelSize);
    px(ctx, 3, 10, 3, 3, "#1f140b", pixelSize);
  }

  px(ctx, -2, 15, 4, 2, "#f59a1b", pixelSize);

  ctx.restore();
}

// =========================
// EXPORT
// =========================
export const cluckadoodleMonster: MonsterDefinition = {
  id: "CLUCKADOODLE",
  name: "Cluckadoodle",
  imageSrc: "",
  baseHeight: 200,
  faceAnchor: { x: 0.5, y: 0.28 },
  homeOffsetX: 0,
  homeOffsetY: 90,
  battleOffsetX: 0,
  battleOffsetY: 240,
  drawBody: drawCluckadoodleBody,
  drawFace: drawCluckadoodleFace,
};