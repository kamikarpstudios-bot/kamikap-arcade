import {
  FaceDrawArgs,
  MonsterDefinition,
  MonsterDrawArgs,
  MonsterBodyDrawArgs,
} from "../monsterTypes";

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

function drawMiniBolt(
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  pixelSize: number,
  colorA: string,
  colorB: string
) {
  const bolt = [".A.", "AA.", ".AB", ".BB", "BB."];
  drawPixelBlock(ctx, bolt, { A: colorA, B: colorB }, x, y, pixelSize);
}

function clamp(value: number, min: number, max: number) {
  return Math.max(min, Math.min(max, value));
}

function drawSparcoltBody({ ctx, x, y, time, scale }: MonsterBodyDrawArgs) {
  const bob = Math.sin(time * 2) * 2.4;
  const pixelSize = 3.5 * scale;

  const wagFrame = Math.sin(time * 4.8) > 0 ? 1 : 0;
  const headFrame = Math.sin(time * 3.2) > 0 ? 1 : 0;
  const isBlinking = Math.sin(time * 6.2) > 0.94;

  const palette = {
    O: "#1f3f78",
    B: "#4e86db",
    C: "#7fb8ff",
    D: "#a9d2ff",
    W: "#f5fbff",
    Y: "#ffd84d",
    G: "#fff2a0",
    N: "#101820",
    E: "#142033",
  };
// =========================
// TAIL (DOUBLE SIZE)
// =========================
  // =========================
  // TAIL (MATCH BODY PIXEL SIZE)
  // =========================
  const tailRows =
    wagFrame === 0
      ? [
          "..........YYYY......",
          ".........YYYYYY......",
          ".........YYYYYYYY......",
          ".......YYYYYYYYYYY.....",
          "......YYCCCCCCCCCY.....",
          "....OOCCCCCCCCCCCO.....",
          "..OOCCCCCCCCCCCCO......",
          "..OOCCCCCCCCCCCCO......",
          "..OOCCCCCCCCCCCCO......",
          "..OOCCCCCCCCCCCCO......",
          "..OOCCCCCCCCCCCCO......",
          "..OOCCCCCCCCCCCCO......",
          "..OOCCCCCCCCCCCCO......",
          "...OOCCCCCCCOOOO........",
          ".....OOOOOOOO.........",
        ]
      : [
           "..................YYYY......",
          ".................YYYYYY......",
          "...............YYYYYYYY......",
          "............YYYYYYYYYYY.....",
          "..........YYCCCCCCCCCY.....",
          "........OOCCCCCCCCCCCO.....",
          "......OOCCCCCCCCCCCOO......",
          "......OOCCCCCCCCCCCOO......",
          "......OOCCCCCCCCCCCOO......",
          "......OOCCCCCCCCCCCOO......",
          "......OOCCCCCCCCCCCOO......",
          "......OOCCCCCCCCCCCOO......",
          "......OOCCCCCCCCCCCOO......",
          ".....OOCCCCCCOOOOOO........",
          ".....OOOOOOOOO........",
        ];
  // =========================
  // BODY (STRONGER LEGS)
  // =========================
  const bodyRows = [
    "...OOOOOOOOOO.................................",
    "..OOOBBBBBBBBBOOO..............................",
    ".OOBBBBBBBBBBBBBBBOOO...........................",
    "OOBBBBBBBBBBCCCCCCCCCCCBBBBBBBO..............",
    "OBBBBBBBBBWWWWWWWWCCCCCCCCBBBBBBBBBO..........",
    "OBBBBBBBBBWWWWWWWWWWWWCCCCCCYYYYYBBOOOOOO......",
    "OBBYYYYYYYYYWWWWWWWWCCCCCCCCCBBYYYYYYYOOOO.....",
    "OCCYYYYYYCCCCWWWWWCCCCCCCCCCCCCBBBBBBBOOOO.....",
    "OCCCCCYYYYYCCCCCCCCCCCCCCCCCCCCCCBBBBBBOOOO.....",
    "OCCCCCCCCYYYYYYYCCCCCCCCCCCCCCCBBBBBBBBBOOO......",
    "OCCCCCWWWWWWWYYYYYYYYCCCCCCCCCCCBBBBBOOOOOO......",
    "OCCCCCCCCCCWWWWWWYYYYYYYYCCCCCBBBBBBBBOOOOO.....",
    "OCCCCCCCCCCCCWWWWWCCCCCCCCCCCCCBBBBBBBBOOOO.....",
    "OCCCCCCCCCCCCCCCCCCCCCCCCCCCCCCBBBBBBBOOOO.....",
    ".OCCCCCCCCCCCCCCCCCCCCCCCCCCBBBBBBBBBBBOOO......",
    "..OCCCCCCCCCCCCCCOOOOOOOOOOOOOOOOOOOOOOOO........",
    "..OCCCCCO...OCCCCCO....OBBBBBO....OBBBBO......",
    "..OCCCCCO...OCCCCCO.....OBBBBBO...OBBBBO..............",
    ".OCCCCCO...OCCCCCO......OBBBBBO..OBBBBO..............",
    ".OCCCCCO...OCCCCCO.......OBBBBO...OBBBBO.............",
    ".OCCCCCO...OCCCCCO........OBBBBO...OBBBBO.............",
    "..OCCCCCO...OCCCCCO........OBBBBO....OBBBBO.............",
    "..OCCCCCO...OCCCCCO........OBBBBO....OBBBBO..............",
    "..OCCCCCO...OCCCCCO.........OBBBBO....OBBBBO.............",
    "..OCCCCCO...OCCCCCO........OBBBBO.....OBBBBO.............",
    ".OCCCCCO...OCCCCCO........OBBBBO.....OBBBBO.............",
    ".OCCCCCO...OCCCCCO........OBBBBO.....OBBBBO..............",
    "OCCCCCO...OCCCCCO.......OBBBBBO....OBBBBO......",
    "OOOOOOO...OOOOOOO.......OOOOOOO...OOOOOOO.....",
    "OOOOOOO...OOOOOOO...... OOOOOOO...OOOOOOO.......",
  ];

  // =========================
  // HEAD (2 FRAMES)
  // =========================
  const headRows =
    headFrame === 0
         ? [
        "........OO...OO.........",
        "......OCCO..OCCO........",
        "......OCCO..OCCO........",
        "......OCCO..OCCO........",
        "......OCCO..OCCO........",
        "......OCCO..OCCO........",
        "......OCCO..OCCO........",
        "......OCCOOOOCCCCO........",
        ".....OCCCCCCCCCCCO.......",
        "....OCCCCWWWWCCCCCO......",
        "...OCCCWWWWWWWWCCCCO.....",
        "..OCCCWWWWWWWWWWCCCO.....",
        "OOOOWWWWWWWWWWWWCCCO.....",
        "ONNNWWWWWWWWWWWWCCCO.....",
        "OYYYYWWWWWWWWCCCCCCO.....",
        ".OCCCCWWWWWWCCCCCO.......",
        "..OOCCCCCCCCCCCCOO.......",
        "....OOOCCCCCCOOO.........",
        "......OOOOOOOO..........",
      ]
    : [
        ".................OO....OO.......",
        "..............OCCO..OCCO.......",
        ".............OCCO..OCCO.......",
        "............OCCO..OCCO.......",
        "...........OCCO..OCCO.......",
        "..........OCCO..OCCO.......",
        ".........OCCCO.OCCCO.......",
        ".......OCCCCOOOCCCCO.......",
        "......OCCCCOOOCCCCO.......",
        ".....OCCCCOOOCCCCO.......",
        "....OCCCCCCCCCCCCCO......",
        "...OCCCCWWWWWWCCCCCO.....",
        "..OCCCWWWWWWWWWWCCCCO....",
        "OOOOWWWWWWWWWWWWCCCO.....",
        "ONNNWWWWWWWWWWWWCCCO.....",
        "OYYYYWWWWWWWWWWWCCCO.....",
        ".OCNNNNWWWWWWCCCCCCO.....",
        "..OCNNNNNWWWWCCCCCO......",
        "...OOCCCCCCCCCCCCOO......",
        ".....OOOCCCCCCOOO........",
        ".......OOOOOOOOO.........",
      ];

        const maneRows = [
    ".................GGGGGGGG...............",
    "..............GGYYYYYYYYGG..............",
    "...........GGYYYYWWWWYYYYGG.............",
    ".........GGYYYYWWWWWWWWYYYYGG...........",
    "........GYYYYWWWWWWWWWWWWYYYYG..........",
    "........GYYYYWWWWWWWWWWWWYYYYG..........",
    "........GYYYYWWWWWWWWWWWWYYYYG..........",
    "........GYYYYWWWWWWWWWWWWYYYYG..........",
    "........GYYYYWWWWWWWWWWWWYYYYG..........",
    "........GYYYYWWWWWWWWWWWWYYYYG..........",
    "........GYYYYWWWWWWWWWWWWYYYYG..........",
    ".........GGYYYYWWWWWWWWYYYYGG...........",
    "...........GGYYYYYYYYYYYYGG.............",
    "..............GGYYYYYYGG................",
  ];


  ctx.save();
  ctx.translate(Math.round(x), Math.round(y + bob));

  drawShadow(ctx, 0, 34 * scale, 58 * scale, 12 * scale, 0.22);

  drawPixelBlock(ctx, tailRows, palette, 16, -5, pixelSize);
  drawPixelBlock(ctx, bodyRows, palette, -18, 4, pixelSize);
  drawPixelBlock(ctx, maneRows, palette, -32, -4, pixelSize);
  drawPixelBlock(ctx, headRows, palette, -28, -10, pixelSize);

  // eye
  const eyeX = -17;
  const eyeY = 2;

  px(ctx, eyeX - 1, eyeY - 1, 4, 1, palette.N, pixelSize); // brow
  px(ctx, eyeX, eyeY, 3, 2, palette.N, pixelSize); // eye body
  px(ctx, eyeX + 1, eyeY, 1, 1, palette.Y, pixelSize); // iris
  px(ctx, eyeX, eyeY, 1, 1, palette.W, pixelSize); // shine

  // cheek sparks
  px(ctx, -8, 18, 2, 1, palette.Y, pixelSize);
  px(ctx, -6, 19, 1, 1, palette.G, pixelSize);
  px(ctx, -5, 20, 2, 1, palette.Y, pixelSize);

  ctx.restore();


  // =========================
  // ELECTRIC FX
  // =========================
  drawMiniBolt(ctx, -52, -20, pixelSize, palette.Y, palette.G);
  drawMiniBolt(ctx, 44, -10, pixelSize, palette.Y, palette.G);

  if (Math.sin(time * 8 + 0.7) > 0.1) {
    drawMiniBolt(ctx, 8, 0, pixelSize, palette.Y, palette.G);
  }

  ctx.restore();
}

// =========================
// FACE
// =========================
function drawSparcoltFace(
  state: MonsterDrawArgs["state"],
  { ctx, faceX, faceY, drawW, drawH, blink, yawn, mouseX, mouseY }: FaceDrawArgs
) {
  const scale = drawW * 0.01;
  const eyeBaseSize = Math.max(2, Math.round(drawW * 0.015));

  const lookX = clamp((mouseX - faceX) * 0.015, -2.5 * scale, 2.5 * scale);
  const lookY = clamp((mouseY - faceY) * 0.01, -1.5 * scale, 1.5 * scale);

  const eyeOffsetX = drawW * 0.052;
  const eyeY = faceY - drawH * 0.005 + lookY;

  const open = clamp(1 - blink, 0, 1);

  ctx.save();

  const drawEye = (cx: number) => {
    if (open < 0.14) {
      ctx.fillStyle = "#142033";
      ctx.fillRect(cx - eyeBaseSize, eyeY, eyeBaseSize * 2, 2);
      return;
    }

    ctx.fillStyle = "#142033";
    ctx.fillRect(
      cx - eyeBaseSize,
      eyeY - eyeBaseSize / 2,
      eyeBaseSize * 2,
      eyeBaseSize
    );

    ctx.fillStyle = "#ffffff";
    ctx.fillRect(cx - 1, eyeY - 1, 1, 1);
  };

  drawEye(faceX - eyeOffsetX + lookX);
  drawEye(faceX + eyeOffsetX + lookX);

  ctx.restore();
}

export const sparcoltMonster: MonsterDefinition = {
  id: "SPARCOLT",
  name: "Sparcolt",
  baseHeight: 260,
  faceAnchor: { x: 0.27, y: 0.29 },
  homeOffsetX: 0,
  homeOffsetY: 60,
  battleOffsetX: 0,
  battleOffsetY: 92,
  drawBody: drawSparcoltBody,
  drawFace: drawSparcoltFace,
};