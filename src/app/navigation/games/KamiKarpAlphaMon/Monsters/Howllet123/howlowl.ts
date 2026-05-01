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
  alpha = 0.22
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
function drawHowlerBody({ ctx, x, y, time, scale }: MonsterBodyDrawArgs) {
  const bob = Math.sin(time * 1.6) * 1.8;
  const pixelSize = 3.4 * scale;

  const palette = {
    O: "#172018",
    B: "#dff7df",
    M: "#c5ebc7",
    G: "#aee4b6",
    L: "#effff1",
    H: "#ffffff",
    W: "#f3efe3",
    D: "#87d69a",
    T: "#6ecb8b",
    S: "#d6ffe7",
    C: "#b8f5cc",
    A: "#94e3af",
    E: "#151815",
  };

  const tailFrame = Math.floor(((Math.sin(time * 1.5) + 1) / 2) * 3);
  const earFrame = Math.floor(((Math.sin(time * 2.4) + 1) / 2) * 3);

  let earRows: string[];
  if (earFrame === 0) {
    earRows = [
      "..OO..............OO..",
      ".OBBO............OBBO.",
      ".OBBBO..........OBBBO.",
      "OBMMMBO........OBMMMBO",
      "OBMMMMBO......OBMMMMBO",
      ".OBMMMMBO....OBMMMMBO.",
      "..OBMMMMBO..OBMMMMBO..",
      "...OBMMMMBOOBMMMMBO...",
      "....OBMMMMMMMMMMBO....",
      ".....OBMMMMMMMMBO.....",
    ];
  } else if (earFrame === 1) {
    earRows = [
      "....OO..........OO....",
      "...OBBO........OBBO...",
      "..OBMMBO......OBMMBO..",
      ".OBMMMMBO....OBMMMMBO.",
      ".OBMMMMMBO..OBMMMMMBO.",
      "..OBMMMMMMOOBMMMMMBO..",
      "...OBMMMMMMMMMMMMBO...",
      "....OBMMMMMMMMMMBO....",
      ".....OBMMMMMMMMBO.....",
      "......OBMMMMMMBO......",
    ];
  } else {
    earRows = [
      "......OO....OO........",
      ".....OBBO..OBBO.......",
      "....OBMMBOOBMMBO......",
      "...OBMMMMMMMMMMBO.....",
      "..OBMMMMMMMMMMMMBO....",
      "..OBMMMMMMMMMMMMBO....",
      "...OBMMMMMMMMMMBO.....",
      "....OBMMMMMMMMBO......",
      ".....OBMMMMMMBO.......",
      "......OBMMMMBO........",
    ];
  }
  // =========================
  // HEAD (bigger + sharper)
  // =========================
  const headRows = [
    "........OOOBBBBBBOOO.........",
    "......OOBBBBBBBBBBBBOO.......",
    ".....OBBBBBLLLLLLBBBBO.......",
    "....OBBBBLLLLLLLLLLBBBBO.....",
    "...OBBBLLLLLLLLLLLLLLBBBO....",
    "...OBBLLLLLHHHHHHLLLLLBBBO...",
    "..OBBLLLLHHHHHHHHHHLLLLBBO...",
    "..OBBLLLHHHHHHHHHHHHLLLBBO...",
    "..OBBLLLHHHHHHHHHHHHLLLBBO...",
    "..OBBLLLHHHHHHHHHHHHLLLBBO...",
    "...OBBLLLHHHHHHHHHHLLLBBO....",
    "...OOBBLLLLLLLLLLLLLLBBBO....",
    ".....OBBBBLLLLLLLLBBBBO......",
    "......OOBBBBBBBBBBBOO........",
  ]

  // =========================
  // TALL BODY
  // =========================
  const bodyRows = [
    "...........OBBBBBB...........",
    ".........OBBBBBBBBBBO........",
    "........OBBBLLLLLLBBBO.......",
    ".......OBBLLLLLLLLLLBBO......",
    "......OBBLLLLLLLLLLLLBBO.....",
    "......OBBLLLLLLLLLLLLBBO.....",
    "......OBBLLLLGGGGLLLLBBO.....",
    "......OBBLLLGGGGGGLLLBBO.....",
    "......OBBLLLGGGGGGLLLBBO.....",
    "......OBBLLLGGGGGGLLLBBO.....",
    "......OBBLLLLGGGGLLLLBBO.....",
    "......OBBLLLLLLLLLLLLBBO.....",
    "......OBBLLLLLLLLLLLLBBO.....",
    "......OBBLLLLLLLLLLLLBBO.....",
    ".......OBBLLLLLLLLLLBBO......",
    "........OBBBBBBBBBBBBO.......",
    ".........OOBBBBBBBBOO........",
    "...........OO....OO..........",
  ];

  // =========================
  // FOLDED WINGS (SIDE)
  // =========================
  const wingRows = [
    "...OBBO........OBBO...",
    "..OBMMBO......OBMMBO..",
    ".OBMMMMBO....OBMMMMBO.",
    ".OBMMMMBO....OBMMMMBO.",
    ".OBMMMMBO....OBMMMMBO.",
    ".OBMMMMBO....OBMMMMBO.",
    ".OBMMMMBO....OBMMMMBO.",
    ".OBMMMMBO....OBMMMMBO.",
    ".OBMMMBO......OBMMMBO.",
    "..OBMBO........OBMBO..",
    "..OBMO..........OMBO...",
    "...OBO..........OBO....",
  ];

  // =========================
  // BIG TALONS
  // =========================
  const footRows = [
    "...OOO......OOO...",
    "..OOOOO....OOOOO..",
    ".GGOGGG....GGOGGG.",
    ".OGWGWG....OGWGWG.",
    "..OWWW......WWWO..",
  ];

  // =========================
  // TAIL
  // =========================
  let tailRows: string[];
  if (tailFrame === 0) {
    tailRows = [
      "....................SSSCCCOOO......",
      ".................SSSCCCCAAAOOO.....",
      "..............SSSCCCCAAAAAAOO......",
      "..........SSSCCCCAAAAAAAAOO........",
      ".......SSSCCCAAAAAAAAAACOO.........",
      ".....SSCCAAAAAAAAACOO..............",
    ];
  } else if (tailFrame === 1) {
    tailRows = [
      "....................SSSCCCOOO......",
      ".................SSSCCCCAAAOOO.....",
      "..............SSSCCCCAAAAAAOO......",
      "..........SSSCCCCAAAAAAAAOO........",
      ".......SSSCCCAAAAAAAAAACOO.........",
      ".....SSCCAAAAAAAAACOO..............",
    ];
  } else {
    tailRows = [
      "....................SSSCCCOOO......",
      ".................SSSCCCCAAAOOO.....",
      "..............SSSCCCCAAAAAAOO......",
      "..........SSSCCCCAAAAAAAAOO........",
      ".......SSSCCCAAAAAAAAAACOO.........",
      ".....SSCCAAAAAAAAACOO..............",
    ];
  }

  ctx.save();
  ctx.translate(Math.round(x), Math.round(y + bob));

  drawShadow(ctx, 0, 48 * scale, 70 * scale, 14 * scale, 0.25);

  // tail
  drawPixelBlock(ctx, tailRows, palette, -6, 20, pixelSize);


  // body + head
  drawPixelBlock(ctx, bodyRows, palette, -11, 10, pixelSize);
   drawPixelBlock(ctx, wingRows, palette, -8, 14, pixelSize);
    drawPixelBlock(ctx, earRows, palette, -9, -8, pixelSize);
  drawPixelBlock(ctx, headRows, palette, -11, 0, pixelSize);

  // feet
  drawPixelBlock(ctx, footRows, palette, -5, 27, pixelSize);

  // =========================
  // FACE
  // =========================
  const blink = Math.sin(time * 4.5) > 0.95;

  const leftEyeX = -6;
  const rightEyeX = 5;
  const eyeY = 8;

  if (blink) {
    px(ctx, leftEyeX, eyeY, 2, 1, palette.E, pixelSize);
    px(ctx, rightEyeX, eyeY, 2, 1, palette.E, pixelSize);
  } else {
    px(ctx, leftEyeX, eyeY, 2, 2, palette.E, pixelSize);
    px(ctx, rightEyeX, eyeY, 2, 2, palette.E, pixelSize);

    px(ctx, leftEyeX, eyeY, 1, 1, palette.H, pixelSize);
    px(ctx, rightEyeX, eyeY, 1, 1, palette.H, pixelSize);
  }

  // bigger beak
  px(ctx, -1, 13, 3, 1, palette.W, pixelSize);
  px(ctx, 0, 14, 2, 1, palette.O, pixelSize);

  ctx.restore();
}

// =========================
// FACE
// =========================
function drawHowlerFace(
  _state: MonsterDrawArgs["state"],
  _args: FaceDrawArgs
) {}

// =========================
// EXPORT
// =========================
export const howlowlMonster: MonsterDefinition = {
  id: "HOWLOWL",
  name: "Howlowl",
  imageSrc: "",
  baseHeight: 190,
  faceAnchor: {
    x: 0.5,
    y: 0.25,
  },
  homeOffsetX: 0,
  homeOffsetY: 90,
  battleOffsetX: 0,
  battleOffsetY: 230,
  drawBody: drawHowlerBody,
  drawFace: drawHowlerFace,
};