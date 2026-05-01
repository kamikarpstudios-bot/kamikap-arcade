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
function drawHowlletBody({ ctx, x, y, time, scale }: MonsterBodyDrawArgs) {
  const bob = Math.sin(time * 1.9) * 1.5;
  const pixelSize = 3.2 * scale;

  const palette = {
    O: "#172018", // outline
    B: "#dff7df", // body base
    M: "#c5ebc7", // body mid
    G: "#aee4b6", // green tint
    L: "#effff1", // light highlight
    H: "#ffffff", // brightest highlight
    W: "#f3efe3", // feet / beak
    D: "#87d69a", // deeper green
    T: "#6ecb8b", // tail green
    S: "#d6ffe7", // magic swirl light
    C: "#b8f5cc", // swirl mid
    A: "#94e3af", // air accent
    E: "#151815", // eye
    K: "#7cb98d", // soft shadow green
  };

  const earFrame = Math.floor(((Math.sin(time * 2.4) + 1) / 2) * 3);
  const tailFrame = Math.floor(((Math.sin(time * 1.6) + 1) / 2) * 3);
  const wingLift = Math.sin(time * 2.1) * 0.8;

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
  ];

  const bodyRows = [
    "...........OBBBBBB...........",
    ".........OBBBBBBBBBBO........",
    "........OBBBLLLLLLBBBO.......",
    ".......OBBLLLLLLLLLLBBO......",
    "......OBBLLLLLLLLLLLLBBO.....",
    "......OBBLLLLLLLLLLLLBBO.....",
    "......OBBLLLLLWWLLLLLBBO.....",
    "......OBBLLLWWWWWWLLLBBO.....",
    "......OBBLLLWWWWWWLLLBBO.....",
    "......OBBLLLWWWWWWLLLBBO.....",
    "......OBBLLLLWWWWLLLLBBO.....",
    "......OBBLLLLLLLLLLLLBBO.....",
    "......OBBLLLLLLLLLLLLBBO.....",
    ".......OBBLLLLLLLLLLBBO......",
    "........OBBBBBBBBBBBBO.......",
    ".........OOBBBBBBBBOO........",
    "...........OO....OO..........",
  ];

  const wingRows = [
    "....OO.................OO....",
    "...OBBO...............OBBO...",
    "..OBMMBO.............OBMMBO..",
    ".OBMMMMBO...........OBMMMMBO.",
    ".OBMMMMMBO.........OBMMMMMBO.",
    ".OBMMMMMMBO.......OBMMMMMMBO.",
    "..OBMMMMMMBO.....OBMMMMMMBO..",
    "...OBMMMMMMBOOOOOBMMMMMMBO...",
    "....OBMMMMMMMMMMMMMMMMMBO....",
    ".....OBMMMMMMMMMMMMMMMBO.....",
    "......OBMMMMMMMMMMMMMBO......",
    ".......OBMMMMMMMMMMMBO.......",
  ];

  


  const footRows = [
    "...O........O....",
    "..OOO......OOO..",
    ".GGOGG....GGOGG.",
    ".OGOGO....OGOGO.",
  ];

  let tailRows: string[];
  if (tailFrame === 0) {
    tailRows = [
      ".....................SSSCCCOOO........",
      ".................SSSCCCCCAAAOOO.......",
      "..............SSSCCCCAAAAAAOOO.......",
      "...........SSSCCCCAAAAAAAAOO........",
      ".........SSSCCCAAAAAAAAAOOO.........",
      ".....SSCCAAAAAAAAACOO...........",
 
    ];
  } else if (tailFrame === 1) {
    tailRows = [
      "...................SSSCCCOOO........",
      "...............SSSCCCCCAAAOOO.......",
      "............SSSCCCCAAAAAAOOO.......",
      ".........SSSCCCCAAAAAAAAOO........",
      ".......SSSCCCAAAAAAAAACOO.........",
      ".....SSCCAAAAAAAAACOO...........",
   
    ];
  } else {
    tailRows = [
    ".................SSSCCCOOO........",
      ".............SSSCCCCCAAAOOO.......",
      "..........SSSCCCCAAAAAAOOO.......",
      ".......SSSCCCCAAAAAAAAOO........",
      ".....SSSCCCAAAAAAAAACOO.........",
      ".....SSCCAAAAAAAAACOO...........",

    ];
  }

  ctx.save();
  ctx.translate(Math.round(x), Math.round(y + bob));

  drawShadow(ctx, 0, 43 * scale, 58 * scale, 11 * scale, 0.2);

  // tail behind
  drawPixelBlock(ctx, tailRows, palette, -7, 18, pixelSize);

  // wings behind body
  drawPixelBlock(ctx, wingRows, palette, -11, 9 + wingLift, pixelSize);

  // body + head
  drawPixelBlock(ctx, bodyRows, palette, -11, 10, pixelSize);
  drawPixelBlock(ctx, earRows, palette, -9, -8, pixelSize);
  drawPixelBlock(ctx, headRows, palette, -13, 0, pixelSize);
  // feet
  drawPixelBlock(ctx, footRows, palette, -3, 26, pixelSize);

  // =========================
  // FACE
  // =========================
  const blink = Math.sin(time * 4.7) > 0.955;

  const leftEyeX = -5;
  const rightEyeX = 4;
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

  // beak
  px(ctx, -1, 12, 2, 1, palette.W, pixelSize);
  px(ctx, -1, 13, 1, 1, palette.O, pixelSize);
  px(ctx, 0, 13, 1, 1, palette.W, pixelSize);

  // a soft little chest glow / air magic accent
  if (Math.sin(time * 2.6) > 0.2) {
    px(ctx, -2, 23, 1, 1, palette.S, pixelSize);
    px(ctx, 1, 24, 1, 1, palette.C, pixelSize);
    px(ctx, 0, 26, 1, 1, palette.A, pixelSize);
  }

  ctx.restore();
}

// =========================
// FACE
// =========================
function drawHowlletFace(
  _state: MonsterDrawArgs["state"],
  _args: FaceDrawArgs
) {
  // face is drawn directly in body for the pixel-monster version
}

// =========================
// EXPORT
// =========================
export const howlletMonster: MonsterDefinition = {
  id: "HOWLLET",
  name: "Howllet",
  imageSrc: "",
  baseHeight: 150,
  faceAnchor: {
    x: 0.5,
    y: 0.25,
  },
  homeOffsetX: 0,
  homeOffsetY: 78,
  battleOffsetX: 0,
  battleOffsetY: 210,
  loginOffsetX: 0,
  loginOffsetY: 0,
  drawBody: drawHowlletBody,
  drawFace: drawHowlletFace,
};