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

function drawSparcuteBody({ ctx, x, y, time, scale }: MonsterBodyDrawArgs) {
  const bob = Math.sin(time * 2.4) * 2;
  const pixelSize = 4 * scale;

  const palette = {
    O: "#132447", // outline
    B: "#2f61c2", // main blue
    C: "#6aa2ff", // light blue
    D: "#cfe8ff", // bright highlight
    W: "#f8fcff", // white fur
    Y: "#ffd233", // yellow
    G: "#fff29a", // soft yellow
    N: "#0a0f18", // near black
    P: "#f6a4b5", // mouth
  };

  const headFrame = Math.floor(time * 2) % 2;
  const tailFrame = Math.floor(time * 4) % 2;
  const mouthOpen = headFrame === 1;

  const tailA = [
          "..................YYY......",
          ".................YYYYY.....",
          "...............YYYYYYYY....",
          "............YYYYYYYYYYY....",
          "..........YYCCCCCCCCCY.....",
          "........OOCCCCCCCCCCCO.....",
          "......OOCCCCCCCCCCCOO......",
          ".....OOCCCCCCOOOOOO........",
          ".....OOOOOOOOO.............",
  ];

  const tailB = [
          "..........YYYY...........",
          ".........YYYYYY..........",
          ".........YYYYYYYY........",
          ".......YYYYYYYYYYY.......",
          "......YYCCCCCCCCCY.......",
          "....OOCCCCCCCCCCCO.......",
          "..OOCCCCCCCCCCCCO........",
          "...OOCCCCCCCOOOO.........",
          ".....OOOOOOOO............",
  ];

  const bodyRows = [
    "...OOOOOOOOOO.................................",
    "..OOOBBBBBBBBBOOO..............................",
    ".OOBBBBBBBBBBBBBBBOOO...........................",
    "OOBBBBBBCCCCCCCCCCCCCCCCBBBBBBBO..............",
    "OBBBBBCCCCWWWWWWWWCCCCCCCCBBBBBBBBBO..........",
    "OBBBBCCCCWWWWWWWWWWWWCCCCCCCCBBBBBOOOOOO......",
    "OBBCCCCCCCCWWWWWWWWCCCCCCCCCBBBBBBBBOOOOO.....",
    "OBOCCCCCCCCCCWWWWWCCCCCCCCCBBBBBBBBBBOOOO....",
    "OOOCCCCCCCCCCCCCCCCCCCCCCCCCCCCBBBBBBOOOO...",
    ".OOOCCCCCCCCCCCCCCCCCCCCCCCCCBBBBBBBBBOO....",
    "..OOOOOOOOOOCCCCCCOOOOOOOBBBBBBBBBBBOO.....",
    "....CCCCCO..CCCCO..OBBBB..OOBBBBBBB.......",
    "......OCCO...OCCO...OBBB...OBBBO.........",
    "......OCCO...OCCO....OBBB...OBBB........",
    "......OCCO...OCCO.....OBBB...OBBB.......",
    "......OCCO...OCCO......OBBB...OBB.......",
    "......OCCO...OCCO......OBB....OBB.......",
    "......OCCO...OCCO.......OBB...OBB.......",
    "......OCCO...OCCO........OBB...OBB........",
    "......OOOO...OOOO.......OOOO..OOOO........",
    ".....OOOOO..OOOOO.......OOOO..OOOO........",
  ];

  const headClosed = [
        ".......OO.....OO.........",
        "......OCCO...OCCO........",
        "......OCCCO.OCCCO........",
        "......OCCOOOCCCCO........",
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
    
  ];

  const headOpen = [
       "..........OO....OO.......",
        "........OCCO..OCCO.......",
        ".......OCCCO.OCCCO.......",
        ".....OCCCCOOOCCCCO.......",
        "....OCCCCCCCCCCCCCO......",
        "...OCCCCWWWWWWCCCCCO.....",
        "..OCCCWWWWWWWWWWCCCO....",
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
    ".........GGYYYYWWWWWWWWYYYYGG...........",
    "...........GGYYYYYYYYYYYYGG.............",
    "..............GGYYYYYYGG................",
  ];


  ctx.save();
  ctx.translate(Math.round(x), Math.round(y + bob));

  drawShadow(ctx, 0, 54 * scale, 78 * scale, 14 * scale);

  drawPixelBlock(
    ctx,
    tailFrame === 0 ? tailA : tailB,
    palette,
    18,
    8,
    pixelSize
  );

  drawPixelBlock(ctx, bodyRows, palette, -10, 10, pixelSize);
  drawPixelBlock(ctx, maneRows, palette, -20, 7, pixelSize);
  drawPixelBlock(
    ctx,
    mouthOpen ? headOpen : headClosed,
    palette,
    -19,
    -2,
    pixelSize
  );

  // eye
  const eyeX = -8;
  const eyeY = 4;

  px(ctx, eyeX - 1, eyeY - 1, 4, 1, palette.N, pixelSize); // brow
  px(ctx, eyeX, eyeY, 3, 2, palette.N, pixelSize); // eye body
  px(ctx, eyeX + 1, eyeY, 1, 1, palette.Y, pixelSize); // iris
  px(ctx, eyeX, eyeY, 1, 1, palette.W, pixelSize); // shine

  // cheek sparks
  px(ctx, -8, 18, 2, 1, palette.Y, pixelSize);
  px(ctx, -6, 19, 1, 1, palette.G, pixelSize);
  px(ctx, -5, 20, 2, 1, palette.Y, pixelSize);

  ctx.restore();
}

export const sparcuteMonster: MonsterDefinition = {
  id: "SPARCUTE_BODY",
  name: "Sparcute",
  baseHeight: 170,
  faceAnchor: { x: 0.32, y: 0.4 },
  homeOffsetX: 0,
  homeOffsetY: 64,
  drawBody: drawSparcuteBody,
  drawFace: () => {},
};