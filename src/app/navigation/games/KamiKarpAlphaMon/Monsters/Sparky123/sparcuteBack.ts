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
  h: number
) {
  ctx.save();
  ctx.fillStyle = "rgba(0,0,0,0.22)";
  ctx.beginPath();
  ctx.ellipse(x, y, w, h, 0, 0, Math.PI * 2);
  ctx.fill();
  ctx.restore();
}

function drawSparcuteBackBody({
  ctx,
  x,
  y,
  time,
  scale,
}: MonsterBodyDrawArgs) {
  const bob = Math.sin(time * 2.4) * 2;
  const pixelSize = 4 * scale;
  const tailFrame = Math.floor(time * 4) % 2;

  const palette = {
    O: "#132447", // outline
    B: "#2f61c2", // main blue
    C: "#6aa2ff", // light blue
    D: "#cfe8ff", // bright highlight
    W: "#f8fcff", // white fur
    Y: "#ffd233", // yellow
    G: "#fff29a", // soft yellow
  };

  // flipped to the opposite side from the front version
  const tailA = [
    "......YYY..................",
    ".....YYYYY.................",
    "....YYYYYYYY...............",
    "....YYYYYYYYYYY............",
    ".....YCCCCCCCCCYY..........",
    ".....OCCCCCCCCCCCOO........",
    "......OOCCCCCCCCCCCOO......",
    "........OOOOOOCCCCCCOO.....",
    ".............OOOOOOOOO.....",
  ];

  const tailB = [
    "...........YYYY..........",
    "..........YYYYYY.........",
    "........YYYYYYYY.........",
    ".......YYYYYYYYYYY.......",
    ".......YCCCCCCCCCYY......",
    ".......OCCCCCCCCCCCOO....",
    "........OCCCCCCCCCCCCOO..",
    ".........OOOOOCCCCCCOO...",
    "............OOOOOOOO.....",
  ];

  // back body version of the same chunky mass
  // keeps the same kind of blue/white layering but no face features
  const bodyRows = [
    ".................................OOOOOOO...",
    "..............................OOOBBBBBBOOO..",
    "...........................OOOBBBBBBBBBBBBOO.",
    "..............OBBBBBBBCCCCCCCCCCCCCCCCBBBBOO",
    "..........OBBBBBBBBBBCCCCCCCCWWWWWWWWCCCCBBO",
    "......OOOOOOBBBBBBCCCCCCCCWWWWWWWWWWWWCCBBBO",
    ".....OOOOBBBBBBBBCCCCCCCCCWWWWWWWWCCCCCCBOO",
    "....OOOOBBBBBBBBBCCCCCCCCCWWWWWCCCCCCCCCOO",
    "...OOOOBBBBBCCCCCCCCCCCCCCCCCCCCCCCCCCCCOO",
    "....OOBBBBBBBBBCCCCCCCCCCCCCCCCCCCCCCCCOO.",
    ".....OOBBBOOOOOOOOOOOOOOOCCCCCCOOOOOOOO..",
    ".......CCCCCCCOOCCCCCCOOOOOOOOOOOOOOOO..",
    ".........OCCCO..CCCO...OBBO.....OBBO.",
    "........OCCC...CCCO....OBBO......OBBO",
    ".......OCCC...CCCO.....OBBO......OBBO",
    ".......CCCO...CCCO......OBBO......OBBO",
    ".......CCC....CCCO......OBBO......OBBO.",
    ".......CCO....CCCO.......OBBO......OBBO.",
    ".......CCCC...CCCC.......OBBO.....OBBO..",
    "........OOOO..OOOO.......OOOO.....OOOO.",
    "........OOOO..OOOOO.....OOOOO.....OOOO.",
  ];

  // simplified back of head
  // no eyes, no mouth, no dark face details
  const headBack = [
    ".........OO.....OO.......",
    "........OCCO...OCCO......",
    "........OCCCO.OCCCO......",
    "........OCCCCOOOCCCO.....",
    ".......OCCCCCCCCCCCCO....",
    "......OCCCCWWWWCCCCCCO...",
    ".... .OCCCWWWWWWWWCCCCCO..",
    ".... .OCCWWWWWWWWWWCCCCOO.",
    ".... .OCCCWWWWWWWWWWWWOOOO",
    "....YYYYYYYYYYYYYYYWWYYYYO",
    "...YYYYYYYGGGGGGGYYYYWWYYYO",
    ".....YYYYGGGGGGGGGGYWCCCCO.",
    "......YYYYYGGGGGGGYYYYCCOO..",
    "........YYYYYYYYYYYYOOOO....",
    ".........YYYYYYYYYYY....",
  ];

  ctx.save();
  ctx.translate(Math.round(x), Math.round(y + bob));

  drawShadow(ctx, 0, 54 * scale, 78 * scale, 14 * scale);

  // 1) head first so it sits behind body
  drawPixelBlock(ctx, headBack, palette, -6, -2, pixelSize);

  // 2) body over the head
  drawPixelBlock(ctx, bodyRows, palette, -30, 10, pixelSize);

  // 3) tail last so it sits on top
  drawPixelBlock(
    ctx,
    tailFrame === 0 ? tailA : tailB,
    palette,
    -30,
    8,
    pixelSize
  );

  ctx.restore();
}

export const sparcuteBackMonster: MonsterDefinition = {
  id: "SPARCUTE_BACK",
  name: "Sparcute",
  baseHeight: 170,
  faceAnchor: { x: 0.32, y: 0.4 },
  homeOffsetX: 0,
  homeOffsetY: 64,
  drawBody: drawSparcuteBackBody,
  drawFace: () => {},
};