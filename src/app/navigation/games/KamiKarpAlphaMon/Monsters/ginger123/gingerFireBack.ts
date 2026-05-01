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
// BODY (BACK)
// =========================
function drawGingerFireBackBody({
  ctx,
  x,
  y,
  time,
  scale,
}: MonsterBodyDrawArgs) {
  const bob = Math.sin(time * 1.65) * 1.6;
  const pixelSize = 3.5 * scale;

  const palette = {
    O: "#2a160e",
    B: "#7a2c17",
    C: "#b8521f",
    G: "#de7c30",
    Y: "#ffbc63",
    W: "#fff0d7",
    H: "#fff9ee",
    R: "#ff5a1f",
    F: "#ff8a18",
    L: "#ffd65d",
    S: "#fff6be",
    P: "#f0d4b1",
  };

  const flameFrame = Math.floor(((Math.sin(time * 2.2) + 1) / 2) * 3);

  // =========================
  // HEAD (BACK)
  // =========================
  const headRows = [
    ".......OOO...OOO.........",
    "......OCGGG.GGGGO........",
    "......OCGGG.GGGGO........",
    "......OCGGGGGGGO........",
    "......OCGGGGGGGO........",
    "......OCCCCCCCCCO.......",
    ".....OCCCCGGGCCCCO......",
    "....OCCGGGGGGGGCCCO.....",
    "....OCCGGGGGGGGGGCCO.....",
    "....OOCCGGGGGGGGGGCCO.....",
    "....OOCCGGGGGGGGGGCCO.....",
    "....OCCGGGGGGGGCCCO......",
    ".....OCCCCCCCCCCO........",
    "......OOOOOOOOO.........",
  ];

  // =========================
  // BODY
  // =========================
  const bodyRows = [
    ".................................OOOOOOO...",
    "..............................OOOBBBBBBOOO..",
    "...........................OOOBBBBBBBBBBBBOO.",
    ".................OBBBBCCCCCCCCCCCCCCCCBBBBOO",
    ".............OBBBBBBBCCCCCCCCGGGGGGGCCCCBBO",
    ".........OBBBBBBCCCCCCCCGGGGGGGGGGGGCCBBBO",
    "........OBBBBBBBBCCCCCCCGGGGGGGGCCCCBBBBOO",
    ".......OBBBBBBBBBCCCCCGGGGGGGCCCCCCCBBBBO",
    "......OBBBBBCCCCCCCCCCCCCCCCCCCCCCCCBBBBOO",
    ".......OBBBBBBBCCCCCCCCCCCCCCCCCCCCBBBBBOO.",
    "........OOBOOOOOOOOOOOOOOOCCCCCCBBBBBBBOO..",
    ".........CCCCCOOCCCCCCOOOOOOOOOOBBBBBBO..",
    "...........OCCCO...CCCO....OBBO...OBBO.",
    "...........OCCC....CCCO....OBBO..OBBO",
    "...........OCCC....CCCO....OBBO..OBBO",
    "..........CCCO....CCCO....OBBO..OBBO",
    "..........OCCC....CCCO....OBBO..OBBO.",
    "...........OCCO....CCCO....OBBO..OBBO.",
    "............CCCC....CCCC....OBBO.OBBO..",
    ".............OOOO....OOOO....OOOO..OOOO.",
    "..............OOOO....OOOOO...OOOOO..OOOO.",
  ];

// =========================
// TAIL (MIRRORED FOR BACK)
// =========================
let tailRows: string[];

if (flameFrame === 0) {
  tailRows = [
    ".........OOO.................",
    ".........OGCO.................",
    ".........OGCO.................",
    ".........OGCO................",
    "..........OGCO...............",
    "...........OGCO..............",
    "............OGCO.............",
    ".............OGCO............",
    "..............OGCO...........",
    "................OGCO..........",
    "..................OCGO.........",
  ];
} else if (flameFrame === 1) {
  tailRows = [
    "...........OOO..................",
    "..........OGCO..................",
    "..........OGCO..................",
    "..........OGCO.................",
    "..........OGCO................",
    "...........OGCO...............",
    "............OGCO..............",
    ".............OGCO.............",
    "..............OGCO............",
    "................OGCO...........",
    "..................OCGO..........",
  ];
} else {
  tailRows = [
    "........OOO...................",
    "........OGCO...................",
    "........OGCO...................",
    "........OGCO..................",
    "........OGCO.................",
    ".........OGCO................",
    "..........OGCO...............",
    "............OGCO..............",
    "..............OGCO.............",
    "................OGCO............",
    "..................OCGO...........",
  ];
}

  ctx.save();
  ctx.translate(Math.round(x), Math.round(y + bob));

  drawShadow(ctx, 0, 100 * scale, 110 * scale, 18 * scale, 0.22);

  // draw order (important)
  drawPixelBlock(ctx, headRows, palette, 22, 6, pixelSize);
  drawPixelBlock(ctx, bodyRows, palette, -10, 15, pixelSize);
  
  drawPixelBlock(ctx, tailRows, palette, -19, 10, pixelSize);
  ctx.restore();
}

// =========================
// EXPORT
// =========================
export const gingerFireBackMonster: MonsterDefinition = {
  id: "GINGER_FIRE_BACK",
  name: "Gingerfire",
  imageSrc: "",
  baseHeight: 230,
  faceAnchor: { x: 0.35, y: 0.34 },
  homeOffsetX: 0,
  homeOffsetY: 7,
  battleOffsetX: 0,
  battleOffsetY: 270,
  drawBody: drawGingerFireBackBody,
  drawFace: () => {},
};