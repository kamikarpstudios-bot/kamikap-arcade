import {
  MonsterDefinition,
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
// BODY (BACK VIEW)
// =========================
function drawGingerBlazeBackBody({
  ctx,
  x,
  y,
  time,
  scale,
}: MonsterBodyDrawArgs) {
  const bob = Math.sin(time * 1.45) * 1.8;
  const pixelSize = 3.4 * scale;

  const palette = {
    O: "#26120d", // outline
    B: "#6f2d15", // deep dark orange
    C: "#a9441c", // stripe orange
    G: "#de6e24", // main fur
    Y: "#ffb14d", // bright warm
    W: "#fff1dc", // cream fur
    H: "#fff9ef", // highlight
    R: "#ff4a1f", // flame red
    F: "#ff8618", // flame orange
    L: "#ffd45d", // flame yellow
    S: "#fff4b8", // flame core
    P: "#f0ceb0", // paw / nose
  };

  const flameFrame = Math.floor(((Math.sin(time * 2.1) + 1) / 2) * 3);

  // =========================
  // HEAD (BACK)
  // =========================
  const headRows = [
    "...............OO..............OO.......",
    "..............OCGO..............OCGO....",
    ".............OCGGO............OCGGO.....",
    ".............OCGGO............OCGGO.....",
    ".............OCGGGO..........OCGGGO.....",
    ".............OCGGGGO........OCGGGGO.....",
    "............OCCCCCCCCCCCCCCCCCCCCCO.....",
    "...........OCCCCGGGGGGGGGGGGGCCCCCO.....",
    "..........OCCCCGGGGGGGGGGGGGGGGCCCCO....",
    "..........OCCCGGGGGGGGGGGGGGGGGGCCCO....",
    "..........OCCCGGGGGGGGGGGGGGGGGGCCCO....",
    "..........OCCCCGGGGGGGGGGGGGGGGGOOO....",
    "..........OCCCCCGGGGGGGGGGGGGGGOOO.....",
    "..........OCCCCCCCCGGGGGGGGGGGOOO........",
    "...........OCCCCCCCCGGGGGGGGGOOO.........",
    "............OCCCCCCCCCCCCCCCCO........",
    "..............OOCCCCCCCCCOOO..........",
    "................OOOOOOOOOOO............",
  ];

  // =========================
  // BODY (BACK)
  // =========================
  const bodyRows = [
    "............................................OOOOOOOOOOOO........",
    ".........................................OOOBBBBBBBBBBBOOO......",
    ".......................................OOBBBBBBBBBBBBBBBBBOO....",
    "................................OOOOBBBBCCCCCCCCCCCCCCBBBBBO...",
    "..............................OOOBBBCCCCCCCCCCCCCCCCCCCCBBBBO..",
    "............................OOGGBBBCCCCCCCCWWWWWWWWWWCCCCBBBB..",
    "...........................OGGBBBBCCCCCCWWWWWWWWWWWWWWCCCCBBBO.",
    "..........................OGGBBBBCCCCCCWWWWWWWWWWWWWWWWCCCCBBO.",
    ".........................OGGBBBBCCCCCCCCWWWWWWWWWWWWCCCCCCCGBO.",
    "........................OGGGGGCCCCCCCCCWWWWWWWWWCCCCCCCCGGGGO.",
    ".......................OGGGGGCCCCCCCCCCCCCCCCCCCCCCCCGGGGGGO.",
    ".......................OGGGGCCCCCCCCCCCCCCCCCCCCCGGGGGGGGGO.",
    "........................OGGGGCCCCCCCCCCCCCCGGGCCCGGGGGGGGGO..",
    ".........................OGGGBBBBBBOOOOOOOGCCCGOOOOOOOOOOO...",
    "..........................OBBGGGOO..OBBBOO..OGCCO.OCCCCCO.....",
    "............................OBGGGO...OBBBO....OGGO..OCCCO......",
    "............................OBGGO...OBBBO.....OGGO..OBBO.......",
    "............................OBGGO..OBBBO......OGGO..OBBO.......",
    "............................OBGGO..OBBBO......OGGO..OBBO.......",
    "............................OBGGO.BBBBO.......OGGO..OCBO.......",
    ".............................OBGO.OBBGO.......OGGO..OCGO.......",
    ".............................OBGO..OBGO.......OGGO..OCGO.......",
    "..............................OOOO..OOOO......OOOO..OOOO.......",
    "...............................OOOO..OOOO.....OOOOO.OOOOO......",
  ];

  // =========================
  // TAIL (MIRRORED FOR BACK VIEW)
  // =========================
  let tailRows: string[];

  if (flameFrame === 0) {
    tailRows = [
      "................OOO............................",
      "...............OFRCO...........................",
      "..............OLFFRCO..........................",
      ".............OLLFFFRCO.........................",
      ".............OSLLFFFRCO........................",
      ".............OSSLLFFFRCO.......................",
      ".............OSSSLLFFFRCO......................",
      "..............OSSSLLFFFRCO.....................",
      "...............OSSSLLFFFGCO....................",
      ".................OSSSLLFFGCO...................",
      "...................OSSLLFFGCO..................",
      ".....................OSLLFFGCO.................",
      ".......................OLLFFGCO................",
      ".........................OLFFGCO...............",
      "............................OFGGO..............",
    ];
  } else if (flameFrame === 1) {
    tailRows = [
      "...............OOO.............................",
      "..............OFRCO............................",
      ".............OLFFRCO...........................",
      "............OLLFFFRCO..........................",
      "............OSLLFFFRCO.........................",
      "............OSSLLFFFRCO........................",
      "............OSSSLLFFFRCO.......................",
      ".............OSSSLLFFFRCO......................",
      "..............OSSSLLFFFGCO.....................",
      "................OSSSLLFFGCO....................",
      "..................OSSLLFFGCO...................",
      "....................OSLLFFGCO..................",
      "......................OLLFFGCO.................",
      "........................OLFFGCO................",
      "...........................OFGGO...............",
    ];
  } else {
    tailRows = [
      "..............OOO..............................",
      ".............OFRCO.............................",
      "............OLFFRCO............................",
      "...........OLLFFFRCO...........................",
      "...........OSLLFFFRCO..........................",
      "...........OSSLLFFFRCO.........................",
      "...........OSSSLLFFFRCO........................",
      "............OSSSLLFFFRCO.......................",
      ".............OSSSLLFFFGCO......................",
      "...............OSSSLLFFGCO.....................",
      ".................OSSLLFFGCO....................",
      "...................OSLLFFGCO...................",
      ".....................OLLFFGCO..................",
      ".......................OLFFGCO.................",
      "..........................OFGGO................",
    ];
  }

  ctx.save();
  ctx.translate(Math.round(x), Math.round(y + bob));

  drawShadow(ctx, -6 * scale, 110 * scale, 132 * scale, 20 * scale, 0.24);

  // tail on opposite side for back view
 drawPixelBlock(ctx, headRows, palette, 10, 9, pixelSize);

  // body
  drawPixelBlock(ctx, bodyRows, palette, -22, 20, pixelSize);

  // head
  
 drawPixelBlock(ctx, tailRows, palette, -24, 15, pixelSize);
  ctx.restore();
}

// =========================
// EXPORT
// =========================
export const gingerBlazeBackMonster: MonsterDefinition = {
  id: "GINGER_BLAZE_BACK",
  name: "Gingerblaze",
  imageSrc: "",
  baseHeight: 255,
  faceAnchor: { x: 0.33, y: 0.31 },
  homeOffsetX: 0,
  homeOffsetY: 0,
  battleOffsetX: 0,
  battleOffsetY: 255,
  drawBody: drawGingerBlazeBackBody,
  drawFace: () => {},
};