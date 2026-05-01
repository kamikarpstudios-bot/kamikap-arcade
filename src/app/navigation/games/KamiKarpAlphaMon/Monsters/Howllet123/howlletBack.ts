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
function drawHowlletBackBody({ ctx, x, y, time, scale }: MonsterBodyDrawArgs) {
  const bob = Math.sin(time * 1.9) * 1.5;
  const pixelSize = 3.2 * scale;

  const palette = {
    O: "#172018", // outline
    B: "#dff7df", // body base
    M: "#c5ebc7", // body mid
    G: "#aee4b6", // green tint
    L: "#effff1", // light highlight
    H: "#ffffff", // brightest highlight
    W: "#f3efe3", // feet
    D: "#87d69a", // deeper green
    T: "#6ecb8b", // tail green
    S: "#d6ffe7", // magic swirl light
    C: "#b8f5cc", // swirl mid
    A: "#94e3af", // air accent
    E: "#151815",
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

  const bodyRows = [
    "...........OBBBBBB...........",
    ".........OBBBBBBBBBBO........",
    "........OBBBLLLLLLBBBO.......",
    ".......OBBLLLLLLLLLLBBO......",
    "......OBBLLLLLLLLLLLLBBO.....",
    "......OBBLLLLLLLLLLLLBBO.....",
    "......OBBLLLLLGGLLLLLBBO.....",
    "......OBBLLLGGGGGGLLLBBO.....",
    "......OBBLLLGGGGGGLLLBBO.....",
    "......OBBLLLGGGGGGLLLBBO.....",
    "......OBBLLLLGGGGLLLLBBO.....",
    "......OBBLLLLLLLLLLLLBBO.....",
    "......OBBLLLLLLLLLLLLBBO.....",
    ".......OBBLLLLLLLLLLBBO......",
    "........OBBBBBBBBBBBBO.......",
    ".........OOBBBBBBBBOO........",
    "...........OO....OO..........",
  ];

  const backWingRows = [
    ".....OBMBO......OBMBO.....",
    "....OBMMMBO....OBMMMBO....",
    "...OBMMMMMBO..OBMMMMMBO...",
    "....OBMMMMMMMMMMMMMMBO....",
    ".....OBMMMMMMMMMMMMBO.....",
    "......OBMMMMMMMMMMBO......",
  ];



  const footRows = [
    "..GGGG......GGGG..",
    ".GGOOGG....GGOOGG.",
    ".OGWWGO....OGWWGO.",
    "..OWWO......OWWO..",
  ];

  let tailRows: string[];
  if (tailFrame === 0) {
    tailRows = [
      "...................SSSCCCOOO........",
      "...............SSSCCCCCMMMOOO.......",
      "............SSSCCCCMMMMMMOOO........",
      ".........SSSCCCCMMMMMMMMOO..........",
      ".......SSSCCCMMMMMMMMMOOO...........",
      ".....SSCCMMMMMMMMMCOO................",
    ];
  } else if (tailFrame === 1) {
    tailRows = [
      "...................SSSCCCOOO..........",
      "...............SSSCCCCCMMMOOO.........",
      "............SSSCCCCMMMMMMOOO..........",
      ".........SSSCCCCMMMMMMMMOO............",
      ".......SSSCCCMMMMMMMMMCOO.............",
      ".....SSCCMMMMMMMMMCOO.................",
    ];
  } else {
    tailRows = [
      ".................SSSCCCOOO............",
      ".............SSSCCCCCMMMOOO...........",
      "..........SSSCCCCMMMMMMMOO............",
      ".......SSSCCCCMMMMMMMMOO..............",
      ".....SSSCCCMMMMMMMMMCOO...............",
      ".....SSCCMMMMMMMMMCOO.................",
    ];
  }

  ctx.save();
  ctx.translate(Math.round(x), Math.round(y + bob));

  drawShadow(ctx, 0, 43 * scale, 58 * scale, 11 * scale, 0.2);

  // back head tufts / ears
  drawPixelBlock(ctx, earRows, palette, -9, -8, pixelSize);



  // main back body + head
  drawPixelBlock(ctx, bodyRows, palette, -11, 10, pixelSize);
  drawPixelBlock(ctx, backWingRows, palette, -8, 20 + wingLift, pixelSize);
  drawPixelBlock(ctx, headRows, palette, -13, 0, pixelSize);



  // feet
  drawPixelBlock(ctx, footRows, palette, -4, 27, pixelSize);

  // tiny air glow accents on the back/tail base
  if (Math.sin(time * 2.6) > 0.2) {
    px(ctx, -1, 22, 1, 1, palette.S, pixelSize);
    px(ctx, 1, 23, 1, 1, palette.C, pixelSize);
    px(ctx, 0, 25, 1, 1, palette.A, pixelSize);
  }

  ctx.restore();
}

// =========================
// FACE
// =========================
function drawHowlletBackFace(
  _state: MonsterDrawArgs["state"],
  _args: FaceDrawArgs
) {
  // back sprite has no face drawing
}

// =========================
// EXPORT
// =========================
export const howlletBackMonster: MonsterDefinition = {
  id: "HOWLLET_BACK",
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
  drawBody: drawHowlletBackBody,
  drawFace: drawHowlletBackFace,
};