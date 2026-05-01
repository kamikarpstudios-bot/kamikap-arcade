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
function drawGingerBackBody({ ctx, x, y, time, scale }: MonsterBodyDrawArgs) {
  const bob = Math.sin(time * 1.8) * 1.8;
  const pixelSize = 3.5 * scale;

  const palette = {
    O: "#2a160e",
    D: "#7a3417",
    C: "#b8521f",
    G: "#e47a2d",
    W: "#fff1d6",
    P: "#f3d7ba",
  };

  const tailFrame = Math.floor(((Math.sin(time * 1.9) + 1) / 2) * 3);

  // =========================
  // BACK HEAD (no face, just shape)
  // =========================
  const headRows = [
    "......OO.......OO........",
    ".....OCGCO...OCGCO......",
    ".....OCGGCO.OCGGCO.....",
    ".....OCGGGGCCGGGCO....",
    "....OCCGGGGGGGGCCO....",
    "...OCCGGGGGGGGGGCCO...",
    "...OCGGCCCCCCCCGGCO..",
    "...OCCCCCCCCCCCCCCO..",
    "...OCCCCCCCCCCCCCCO..",
    "....OCGCCCCCCCCGCO...",
    "....OCCGGCCCCGGCCO...",
    "....OCCCGGGGGCCCCO....",
    ".....OOCCCCCCCCOO.....",
    ".......OOOCCOOO.......",
  ];

  const bodyRows = [
    ".........OOCCCCOO.........",
    ".......OOCCGGGGCCOO.......",
    "......OCCGGGGGGGGCCO......",
    ".....OCCGGGGGGGGGGGCO.....",
    ".....OCGGGGCCCCGGGGCO.....",
    ".....OCGGCCCCCCCCGGCO....",
    ".....OCGCCCCCCCCCCGCO....",
    ".....OCGCCCCCCCCCCGCO....",
    ".....OCGCCCCCCCCCCGCO....",
    ".....OCGGCCCCCCCCGGCO....",
    ".....OCGGGGCCCCCGGGCO.....",
    ".....OCCGGGGGGGGGGCCO......",
    ".....OCCCGGGGGGGGCCCO.......",
    "......OCCCCCCCCCCCCO.......",
    ".......OOOOOOOOOOOO........",
    ".........OOOOOOOO........",
  ];

  const legRows = [
    ".....OGGG...GGGO.....",
    ".....OGCG...GCGO....",
    ".....OGCO...OCGO....",
    ".....OGCO...OCGO....",
    ".....OGCO...OCGO...",
    ".....OGCO...OCGO...",
    ".....OCCO...OCCO...",
    ".....OCCO...OCCO..",
    "....OPGPPO.OPGPPO..",
  
  ];

  let tailRows: string[];

  if (tailFrame === 0) {
    tailRows = [
      ".................OOO...........",
      ".................OCGO..........",
      ".................OCGO..........",
      "................OCGO..........",
      "...............OCGO..........",
      "..............OCGO...........",
      ".............OCGO............",
      "............OCGO.............",
      "...........OCGO..............",
      "..........OCGO................",
      ".........OGCO..................",
    ];
  } else if (tailFrame === 1) {
    tailRows = [
      "..................OOO...........",
      "..................OCGO..........",
      "..................OCGO..........",
      ".................OCGO..........",
      "................OCGO..........",
      "...............OCGO...........",
      "..............OCGO............",
      ".............OCGO.............",
      "............OCGO..............",
      "...........OCGO................",
      "..........OGCO..................",
    ];
  } else {
    tailRows = [
      "...................OOO...........",
      "...................OCGO..........",
      "...................OCGO..........",
      "..................OCGO..........",
      ".................OCGO..........",
      "................OCGO...........",
      "...............OCGO............",
      "..............OCGO.............",
      ".............OCGO..............",
      "............OCGO................",
      "...........OGCO..................",
    ];
  }

  ctx.save();
  ctx.translate(Math.round(x), Math.round(y + bob));

  drawShadow(ctx, 0, 64 * scale, 82 * scale, 15 * scale, 0.22);

  // tail
 

  // body
  drawPixelBlock(ctx, legRows, palette, -6, 25, pixelSize);
  drawPixelBlock(ctx, headRows, palette, -6, 6, pixelSize);
  drawPixelBlock(ctx, bodyRows, palette, -8, 18, pixelSize);
  drawPixelBlock(ctx, tailRows, palette, -3, 20, pixelSize);
  

  ctx.restore();
}

// =========================
// EXPORT
// =========================
export const gingerBackMonster: MonsterDefinition = {
  id: "GINGER_BACK",
  name: "Ginger",
  imageSrc: "",
  baseHeight: 190,
  homeOffsetX: 0,
  homeOffsetY: 75,
  battleOffsetX: 0,
  battleOffsetY: 235,
  drawBody: drawGingerBackBody,
};