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
  alpha = 0.25
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
function drawRockopperBackBody({
  ctx,
  x,
  y,
  time,
  scale,
}: MonsterBodyDrawArgs) {
  const bob = Math.sin(time * 1.6) * 1.5;
  const pixelSize = 3.35 * scale;

  const palette = {
    O: "#1b120d",
    R: "#8f6434",
    M: "#b58247",
    T: "#d8a35f",
    D: "#474747",
    C: "#6a6a6a",
    L: "#9a9a9a",
  };

  // tall back body with shoulder/back armor
  const bodyRows = [
    "...........OOO...........",
    ".........OORRROO.........",
    "........ORRRRRRRO........",
    ".......ORRMMMMMRRO.......",
    ".......ORMMMMMMMRO.......",
    "......ORMMMMMMMMMRO......",
    "......ORMMMMMMMMMRO......",
    "......ORMMMMMMMMMRO......",
    "......ORRMMMMMMMRRO......",
    "......ORRMMMMMMMRRO......",
    "......ORMMMMMMMMMRO......",
    "......ORRRMMMMRRRRO......",
    ".....ORRRRRRRRRRRRRO.....",
    ".....ORRMMRRRRRMMRRO.....",
    "....OOMTTMMRRMMTTMOO.....",
    "....OMTTTMMRRMMTTTMO.....",
    "....OMTTTMMRRMMTTTMO.....",
    ".....OOTTTOOOOTTTOO......",
    "......OOO......OOO.......",
  ];

  // back of head, no face
  const headRows = [
    "..........OO..........",
    "........OORROO........",
    ".......ORRMMRRO.......",
    "......ORMMMMMMRO......",
    ".....ORMMMMMMMMRO.....",
    ".....ORMMMMMMMMRO.....",
    ".....ORMMMMMMMMRO.....",
    ".....ORMMMMMMMMRO.....",
    "......ORRMMMMRRO......",
    ".......OORRRROO.......",
  ];

  // broader back ears with animated tilt
  const earFrame = Math.floor(((Math.sin(time * 2.1) + 1) / 2) * 3);
  let earRows: string[];

  if (earFrame === 0) {
    earRows = [
     "..DDDO...ODDD..",
      "..DCCDO.ODCCD..",
      "..DCCCD.DCCCD..",
      "..DCCCD.DCCCD..",
      "..DCCCD.DCCCD..",
      "..DCCCD.OCCCD...",
      "..DCCCD.OCCCD...",
      "..DCCCD.OCCCD...",
      "..DCCCD.DCCCD..",
      "..DCCCD.DCCCD..",
      "..DCCCD.DCCCD..",
      "...DCCD.DCCD...",
      "...ODDD.DDDO...",
      ".....O...O.....",
    ];
  } else if (earFrame === 1) {
    earRows = [
       "..DDDO...............",
      "..DCCDO...ODDD...",
      "..DCCCD..ODCCD...",
      "..DCCCD.ODCCCD...",
      "..DCCCD.ODCCCD...",
      "..DCCCD.ODCCCD...",
      "..DCCCD.ODCCCD...",
      "..DCCCD.ODCCCD...",
      "..DCCCD.ODCCCD...",
      "..DCCCD.ODCCCD...",
      "..DCCCD.DCCCCD...",
      "...DCCDODCCCD....",
      "...ODDD.ODDD.....",
      ".....O...O......",
    ];
  } else {
    earRows = [
     "..DDDO............",
      "..DCCDO..........",
      "..DCCCD....ODD...",
      "..DCCCD..ODCCD...",
      "..DCCCD.ODCCCD...",
      "..DCCCD.ODCCCD...",
      "..DCCCD.ODCCCD...",
      "..DCCCD.ODCCCD...",
      "..DCCCD.ODCCCD...",
      "..DCCCD.ODCCCD...",
      "..DCCCD.ODCCCD...",
      "...DCCDODCCCD....",
      "...ODDD.ODDD.....",
      ".....O...O......",
    ];
  }
  // shoulder armor from behind
  const backArmorRows = [
    ".....ODDO.....ODDO.....",
    "....ODLLDO...ODLLDO....",
    "...ODLLLLDO.ODLLLLDO...",
    "...ODLLLDDDDDDLLLDO....",
    "....ODDDRRRRRRDDDO.....",
  ];

  // stronger final-evo legs from behind
  const legRows = [
    "...OODDDO...OODDDO.....",
    "..ODLLLLDO.ODLLLLDO....",
    "..ORRRRRRO.ORRRRRRO....",
    "..ODDDDDDO.ODDDDDDO....",
    "...ODDDDO...ODDDDO.....",
    "...OOO.......OOO.......",
  ];

  ctx.save();
  ctx.translate(Math.round(x), Math.round(y + bob));

  drawShadow(ctx, 0, 42 * scale, 62 * scale, 12 * scale, 0.24);


  drawPixelBlock(ctx, legRows, palette, -11, 18, pixelSize);
  drawPixelBlock(ctx, backArmorRows, palette, -11, 7, pixelSize);
  drawPixelBlock(ctx, bodyRows, palette, -13, 3, pixelSize);
  drawPixelBlock(ctx, headRows, palette, -11, -5, pixelSize);
  drawPixelBlock(ctx, earRows, palette, -8, -16, pixelSize);
 
 

  ctx.restore();
}

// =========================
// EXPORT
// =========================
export const rockopperBackMonster: MonsterDefinition = {
  id: "ROCKOPPER_BACK",
  name: "Rockopper",
  imageSrc: "",
  baseHeight: 252,
  faceAnchor: {
    x: 0.5,
    y: 0.3,
  },
  homeOffsetX: 0,
  homeOffsetY: 75,
  battleOffsetX: 0,
  battleOffsetY: 198,
  drawBody: drawRockopperBackBody,
  drawFace: () => {},
};