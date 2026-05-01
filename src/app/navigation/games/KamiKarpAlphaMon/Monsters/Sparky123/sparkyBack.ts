import { MonsterDefinition, MonsterBodyDrawArgs } from "../monsterTypes";

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

function drawSparkyBackBody({
  ctx,
  x,
  y,
  time,
  scale,
}: MonsterBodyDrawArgs) {
  const bob = Math.sin(time * 2.2) * 2;
  const basePixelSize = 3.2;
  const pixelSize = basePixelSize * scale;
  const wagFrame = Math.sin(time * 5.2) > 0 ? 1 : 0;
  const earFrame = Math.sin(time * 3.4) > 0 ? 1 : 0;
  const isBlinking = Math.sin(time * 6) > 0.92;

  const palette = {
    O: "#2b4f8f", // outline / dark blue
    B: "#6ea6ff", // mid blue
    C: "#8dc2ff", // main fur
    W: "#f7fbff", // white
    Y: "#ffd84d", // yellow
    G: "#fff3a8", // pale yellow
    N: "#101820", // dark navy
    E: "#142033", // eye
  };

  const bodyRows = [
    "...........OOO.............",
    "........OOCCCCOO..........",
    "......OOCCCCCCCCOO........",
    ".....OCCCCCCCCCCCCO.......",
    "....OCCCCCCCCCCCCCCOO.....",
    "...OCCCCCCCCCCCCCCCCCO....",
    "...OCCCCCCCCCCCCCCCCCCO...",
    "..OCCCCCCCCCCCCCCCCCCCCO..",
    "..OCCCCCCCCCCCCCCCCCCCCO..",
    "..OCCCCCCCCCCCCCCCCCCCCO..",
    "...OCCCCCCCCCCCCCCCCCCO...",
    "...OOCCCCCCCCCCCCCCCCO....",
    "....OCCCBOOOOOOBCCCO......",
    "....OCCBO......OBCCO......",
    "....OCCBO......OBCCO......",
    "....OCCBO......OBCCO......",
    "...OOOWWO......OWWOO......",
    "...OOWWWW......WWWWO......",
    "...OOYYOO......OOYYO......",
  ];

  const headRows = earFrame
    ? [
        "...........OO.....OO.......",
        ".........OCCO.....OCCO.....",
        "........OCCCO.....OCCCO....",
        ".......OCCCCCO...OCCCCCO...",
        "......OCCCCCCCCCCCCCCCCO...",
        ".....OCCCCCCCCCCCCCCCCCCO..",
        "....OCCCCCCCCCCCCCCCCCCCCO.",
        "...OCCCCCCCCCCCCCCCCCCCCCO.",
        "...OCCCCCCCCBBBBCCCCCCCCCO.",
        "...OCCCCCCCBBBBBBCCCCCCCCO.",
        "....OCCCCCCBBBBBBCCCCCCCO..",
        ".....OOCCCCCBBBBCCCCCOO....",
        ".......OOOCCCCCCCCOOO......",
        "..........OOOOOOOO.........",
      ]
    : [
        ".........OO.......OO.......",
        ".......OCCO.......OCCO.....",
        "......OCCCO.......OCCCO....",
        ".....OCCCCOO...OOCCCCO.....",
        "....OCCCCCCCCCCCCCCCCCO....",
        "...OCCCCCCCCCCCCCCCCCCCCO..",
        "..OCCCCCCCCCCCCCCCCCCCCCCO.",
        "..OCCCCCCCCCCCCCCCCCCCCCCO.",
        "...OCCCCCCCBBBBBBCCCCCCCCO.",
        "...OCCCCCCBBBBBBBBCCCCCCCO.",
        "....OCCCCCBBBBBBBBBCCCCCCO..",
        ".....OCCCCCCBBBBBBCCCCCO...",
        "......OOCCCCCCCCCCCCOO.....",
        "........OOOCCCCCCOOO.......",
        "..........OOOOOOOO.........",
      ];

  const tailRows =
    wagFrame === 0
      ? [
          "........OO",
          "......OOCCO",
          "....OOCCCCO",
          "..OOCCCCCCO",
          ".OCCCCCCOO.",
          ".OCCCCOO...",
          "..OOOO.....",
        ]
      : [
          "......OO...",
          "....OCCOO..",
          "..OOCCCCOO.",
          "OOCCCCCCCO.",
          ".OCCCCCCOO.",
          "..OOCCOO...",
          "...OOOO....",
        ];

  ctx.save();
  ctx.translate(Math.round(x), Math.round(y + bob));

  drawShadow(ctx, 0, 30 * scale, 48 * scale, 11 * scale, 0.2);



  // body and head

  drawPixelBlock(ctx, headRows, palette, -16, -8, pixelSize);
    drawPixelBlock(ctx, bodyRows, palette, -10, 2, pixelSize);
  // tail on opposite side from front view
  drawPixelBlock(ctx, tailRows, palette, -1, 8, pixelSize);

  // back lightning accents
  drawMiniBolt(ctx, -4, 8, pixelSize, palette.Y, palette.G);

  if (Math.sin(time * 8) > -0.15) {
    drawMiniBolt(ctx, -46, -14, pixelSize, palette.Y, palette.G);
  }
  if (Math.sin(time * 7 + 1.1) > 0.1) {
    drawMiniBolt(ctx, 38, -8, pixelSize, palette.Y, palette.G);
  }

  ctx.restore();
}

export const sparkyBackMonster: MonsterDefinition = {
  id: "SPARKY_BACK",
  name: "Sparky",
  baseHeight: 180,
  faceAnchor: { x: 0.42, y: 0.44 },
  homeOffsetX: 0,
  homeOffsetY: 130,
  battleOffsetX: 0,
  battleOffsetY: 80,
  drawBody: drawSparkyBackBody,
  drawFace: () => {},
};