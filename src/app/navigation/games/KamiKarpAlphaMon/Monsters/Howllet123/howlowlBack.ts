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
function drawHowlowlBackBody({ ctx, x, y, time, scale }: MonsterBodyDrawArgs) {
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
  // HEAD BACK
  // =========================
  const headRows = [
    "........OOOBBBBBBOOO.........",
    "......OOBBBBBBBBBBBBOO.......",
    ".....OBBBBBBBBBBBBBBBBO......",
    "....OBBBBLLLLLLLLLLBBBBO.....",
    "...OBBBLLLLLLLLLLLLLLBBBO....",
    "...OBBLLLLLLLLLLLLLLLLBBBO...",
    "..OBBLLLLLLLHHHHLLLLLLLBBO...",
    "..OBBLLLLLHHHHHHHHLLLLLBBO...",
    "..OBBLLLLHHHHHHHHHHLLLLBBO...",
    "..OBBLLLLHHHHHHHHHHLLLLBBO...",
    "...OBBLLLLHHHHHHHHLLLLBBO....",
    "...OOBBLLLLLLLLLLLLLLBBBO....",
    ".....OBBBBLLLLLLLLBBBBO......",
    "......OOBBBBBBBBBBBOO........",
  ];

  // =========================
  // BODY BACK
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
  // BACK FOLDED WINGS
  // =========================
  const wingRows = [
    "...OBBO..........OBBO...",
    "..OBMMBO........OBMMBO..",
    ".OBMMMMBO......OBMMMMBO.",
    ".OBMMMMMBO....OBMMMMMBO.",
    ".OBMMMMMMBO..OBMMMMMMBO.",
    ".OBMMMMMMMBOOBMMMMMMMBO.",
    ".OBMMMMMMMMMMMMMMMMMMBO.",
    ".OBMMMMMMMMMMMMMMMMMMBO.",
    ".OBMMMMMMMMMMMMMMMMMMBO.",
    "..OBMMMMMMMMMMMMMMMMBO..",
    "...OBMMMMMMMMMMMMMMBO...",
    "....OBMMMMMMMMMMMMBO....",
    ".....OBMMMMMMMMMMBO.....",
  ];

  // =========================
  // LOWER BACK FEATHER LAYER
  // =========================
  const backFluffRows = [
    ".....OBMBO......OBMBO.....",
    "....OBMMMBO....OBMMMBO....",
    "...OBMMMMMBO..OBMMMMMBO...",
    "....OBMMMMMMMMMMMMMMBO....",
    ".....OBMMMMMMMMMMMMBO.....",
    "......OBMMMMMMMMMMBO......",
  ];

  // =========================
  // BIG BACK TALONS
  // =========================
  const footRows = [
    "...GGG......GGG...",
    "..GWWGG....GGWWG..",
    ".OGWWWG....GWWWGO.",
    "..OWWGO....OGWWO..",
    "...OO........OO...",
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



  // ear tufts / top silhouette
  drawPixelBlock(ctx, earRows, palette, -9, -8, pixelSize);

  // back wings
  drawPixelBlock(ctx, wingRows, palette, -8, 12, pixelSize);

  // body + head
  drawPixelBlock(ctx, bodyRows, palette, -11, 10, pixelSize);
  drawPixelBlock(ctx, headRows, palette, -11, 0, pixelSize);

  // back fluff over lower body
  drawPixelBlock(ctx, backFluffRows, palette, -10, 18, pixelSize);

  // feet
  drawPixelBlock(ctx, footRows, palette, -5, 29, pixelSize);

  // back air accents
  if (Math.sin(time * 2.6) > 0.2) {
    px(ctx, -1, 23, 1, 1, palette.S, pixelSize);
    px(ctx, 1, 24, 1, 1, palette.C, pixelSize);
    px(ctx, 0, 26, 1, 1, palette.A, pixelSize);
  }

  ctx.restore();
}

// =========================
// FACE
// =========================
function drawHowlowlBackFace(
  _state: MonsterDrawArgs["state"],
  _args: FaceDrawArgs
) {
  // no face on back sprite
}

// =========================
// EXPORT
// =========================
export const howlowlBackMonster: MonsterDefinition = {
  id: "HOWLOWL_BACK",
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
  drawBody: drawHowlowlBackBody,
  drawFace: drawHowlowlBackFace,
};