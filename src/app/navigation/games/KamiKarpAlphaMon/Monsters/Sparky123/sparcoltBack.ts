import {
  MonsterDefinition,
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

function drawSparcoltBackBody({
  ctx,
  x,
  y,
  time,
  scale,
}: MonsterBodyDrawArgs) {
  const bob = Math.sin(time * 2) * 2.4;
  const pixelSize = 3.5 * scale;
  const wagFrame = Math.sin(time * 4.8) > 0 ? 1 : 0;

  const palette = {
    O: "#1f3f78",
    B: "#4e86db",
    C: "#7fb8ff",
    D: "#a9d2ff",
    W: "#f5fbff",
    Y: "#ffd84d",
    G: "#fff2a0",
  };

  const headBack = [
    ".........OO...OO........",
    "........OCCO.OCCO.......",
    ".......OCCCCCCCCO.......",
    "......OCCCCCCCCCCO......",
    ".....OCCCCWWWWCCCCO.....",
    "....OCCCWWWWWWWWCCCO....",
    "...OCCCWWWWWWWWWWCCCO...",
    "..OCCCCWWWWWWWWWWCCCCO..",
    ".OCCCCCCWWWWWWWWCCCCCCO.",
    ".OCCCCCCCWWWWWWCCCCCCCO.",
    "..OCCCCCCCCWWWWCCCCCCO..",
    "...OCCCCCCCCCCCCCCCCO...",
    "....OOCCCCCCCCCCCCOO....",
    "......OOOCCCCCCOOO......",
    "........OOOOOOOO........",
  ];

  const maneBack = [
    "...............GGGGGGGG..............",
    ".............GGYYYYYYYYGG............",
    "..........GGYYYYWWWWYYYYGG...........",
    "........GGYYYYWWWWWWWWYYYYGG.........",
    ".......GYYYYWWWWWWWWWWWWYYYYG........",
    ".......GYYYYWWWWWWWWWWWWYYYYG........",
    ".......GYYYYWWWWWWWWWWWWYYYYG........",
    ".......GYYYYWWWWWWWWWWWWYYYYG........",
    ".......GYYYYWWWWWWWWWWWWYYYYG........",
    ".......GYYYYWWWWWWWWWWWWYYYYG........",
    ".......GYYYYWWWWWWWWWWWWYYYYG........",
    "........GGYYYYWWWWWWWWYYYYGG.........",
    "..........GGYYYYYYYYYYYYGG...........",
    ".............GGYYYYYYGG..............",
  ];

  const bodyRows = [
    ".................................OOOOOOOOOO...",
    "..............................OOOBBBBBBBBBOOO..",
    "...........................OOOBBBBBBBBBBBBBBBOO.",
    "..............OBBBBBBBCCCCCCCCCCCBBBBBBBBBBBBOO",
    "..........OBBBBBBBBBBCCCCCCCCWWWWWWWWBBBBBBBBBO",
    "......OOOOOOBBYYYYYCCCCCCWWWWWWWWWWWWBBBBBBBBBO",
    ".....OOOOYYYYYYYBBCCCCCCCCCWWWWWWWWYYYYYYYYYBBO",
    ".....OOOOBBBBBBBCCCCCCCCCCCCWWWWWCCCCYYYYYYCCO",
    ".....OOOOBBBBBBCCCCCCCCCCCCCCCCCCCCCCYYYYYCCCCO",
    "......OOOBBBBBBBBBCCCCCCCCCCCCCCCYYYYYCCCCCCCCO",
    "......OOOOOOBBBBBCCCCCCCCCCCYYYYYYWWWWWWWCCCCCO",
    ".....OOOOOBBBBBBBBCCCCCYYYYYYYYWWWWWWCCCCCCCCCCO",
    ".....OOOOBBBBBBBBCCCCCCCCCCCCCWWWWWCCCCCCCCCCCCO",
    ".....OOOOBBBBBBBCCCCCCCCCCCCCCCCCCCCCCCCCCCCCCCO",
    "......OOOBBBBBBBBBBBCCCCCCCCCCCCCCCCCCCCCCCCCCCO.",
    ".........CCCCCCCCCCCCCCCOOOOOOOOOOOOOOOOOOOOOOO..",
    ".........OBBBBO....OBBBBBO.....OCCCCCO...OCCCCCO..",
    ".........OBBBBO....OBBBBBO.....OCCCCCO...OCCCCCO..",
    ".........OBBBBO....OBBBBBO......OCCCCCO...OCCCCCO.",
    "..........OBBBBO...OBBBBO........OCCCCCO...OCCCCCO.",
    "..........OBBBBO...OBBBBO........OCCCCCO...OCCCCCO.",
    "..........OBBBBO....OBBBBO........OCCCCCO...OCCCCCO..",
    "..........OBBBBO....OBBBBO........OCCCCCO...OCCCCCO..",
    "..........OBBBBO....OBBBBO........OCCCCCO...OCCCCCO..",
    "..........OBBBBO.....OBBBBO........OCCCCCO...OCCCCCO..",
    "..........OBBBBO.....OBBBBO........OCCCCCO...OCCCCCO.",
    "..........OBBBBO.....OBBBBO........OCCCCCO...OCCCCCO.",
    "..........OBBBBO.....OBBBBO.......OCCCCCO...OCCCCCO",
    "..........OOOOOOO...OOOOOOO.......OOOOOOO...OOOOOOO",
    "...........OOOOOOO...OOOOOO......OOOOOOO...OOOOOOO",
  ];

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
          "......YYYY..................",
          "......YYYYYY.................",
          "......YYYYYYYY...............",
          ".....YYYYYYYYYYY............",
          ".....YCCCCCCCCCYY..........",
          ".....OCCCCCCCCCCCOO........",
          "......OOCCCCCCCCCCCOO......",
          "......OOCCCCCCCCCCCOO......",
          "......OOCCCCCCCCCCCOO......",
          "......OOCCCCCCCCCCCOO......",
          "......OOCCCCCCCCCCCOO......",
          "......OOCCCCCCCCCCCOO......",
          "......OOCCCCCCCCCCCOO......",
          "........OOOOOOCCCCCCOO.....",
          "........OOOOOOOOO.....",
        ];

  ctx.save();
  ctx.translate(Math.round(x), Math.round(y + bob));

  drawShadow(ctx, 0, 34 * scale, 58 * scale, 12 * scale, 0.22);

  // reverse stack
  drawPixelBlock(ctx, headBack, palette, 26, -4, pixelSize);
  drawPixelBlock(ctx, maneBack, palette, + 12, -2, pixelSize);
  drawPixelBlock(ctx, bodyRows, palette, -12, 4, pixelSize);
  drawPixelBlock(ctx, tailRows, palette, -18, -2, pixelSize);

  ctx.restore();

  drawMiniBolt(ctx, x - 52 * scale, y - 20 * scale, pixelSize, palette.Y, palette.G);
  drawMiniBolt(ctx, x + 44 * scale, y - 10 * scale, pixelSize, palette.Y, palette.G);

  if (Math.sin(time * 8 + 0.7) > 0.1) {
    drawMiniBolt(ctx, x + 8 * scale, y, pixelSize, palette.Y, palette.G);
  }
}

export const sparcoltBackMonster: MonsterDefinition = {
  id: "SPARCOLT_BACK",
  name: "Sparcolt",
  baseHeight: 260,
  faceAnchor: { x: 0.27, y: 0.29 },
  homeOffsetX: 0,
  homeOffsetY: 60,
  battleOffsetX: 0,
  battleOffsetY: 92,
  drawBody: drawSparcoltBackBody,
  drawFace: () => {},
};