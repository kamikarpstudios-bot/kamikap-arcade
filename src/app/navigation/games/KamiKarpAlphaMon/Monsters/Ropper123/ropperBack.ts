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
function drawRopperBackBody({ ctx, x, y, time, scale }: MonsterBodyDrawArgs) {
  const bob = Math.sin(time * 1.8) * 1.4;
  const pixelSize = 3.4 * scale;

  const palette = {
    O: "#1b120d", // dark outline
    R: "#8f6434", // main earth brown
    M: "#b58247", // warm mid brown
    T: "#d29a58", // lighter warm highlight
    D: "#4d4d4d", // dark rock
    L: "#8f8f8f", // light rock
    C: "#6a6a6a", // mid rock
    P: "#f2a7c8", // soft tail tint
  };

  // wider back body, grounded like a rabbit sitting from behind
  const bodyRows = [
    ".........OOO.........",
    "........ORRRO.......",
    "........ORRRO......",
    ".......ORRRRROOO...",
    "......ORRRRRRRODO...",
    "......ORRRRRRRODO..",
    ".....ORRRRRRRRROO.",
    ".....ORRRRRRRRRO..",
    ".....ORRRRRRRRRO..",
    ".....ORRRRRRRRRO...",
    ".....ORRRRRRRRRO....",
    ".....OODOOOODOO.....",

  ];

  // back of head
  const headRows = [
   ".........OOOO..........",
    ".......OORROO........",
    "......ORRRRRRO.......",
    ".....ORRRRRRRO......",
    ".....ORRRRRRRRO......",
    "....ORRRRRRRRRRO.....",
    "....ORRRRRRRRRRO.....",
    ".....ORRRRRRRRO......",
    "......OORRRROO.......",
  ];

  // back ear animation
  const earFrame = Math.floor(((Math.sin(time * 2.3) + 1) / 2) * 3);

  let earRows: string[];

  if (earFrame === 0) {
    earRows = [
      "..DDDO...ODDD..",
      "..DCCDO.ODCCD..",
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
      "..DCCCD.DLCCCD...",
      "...DCCD.ODCCCD....",
      "...ODDD.ODDD.....",
      ".....O...O...........",
    ];
  } else {
    earRows = [
      "..DDDO...............",
      "..DCCDO..............",
      "..DCCCD....ODD...",
      "..DCCCD...ODCCD...",
      "..DCCCD..ODCCCD...",
      "...DCCD.ODCCCD....",
      "...ODDD.ODDD.....",
      ".....O...O......",
    ];
  }

  // chunky back feet
  const footRows = [
    "...ODDD...DDDO...",
    "...ODLLD.DLLDO...",
    "....OOO...OOO....",
  ];

  // tiny tail
  const tailRows = [
    "...DDD...",
    "..DDLLD..",
    "...LLD...",
  ];

  ctx.save();
  ctx.translate(Math.round(x), Math.round(y + bob));

  drawShadow(ctx, 0, 31 * scale, 48 * scale, 10 * scale, 0.22);

  // order: ears -> body -> head -> tail -> feet
 
  drawPixelBlock(ctx, footRows, palette, -10, 13, pixelSize);
  drawPixelBlock(ctx, bodyRows, palette, -12, 2, pixelSize);
  drawPixelBlock(ctx, headRows, palette, -12.5, -3, pixelSize);
   drawPixelBlock(ctx, earRows, palette, -10, -8, pixelSize);
  drawPixelBlock(ctx, tailRows, palette, -7, 9, pixelSize);


  ctx.restore();
}

// =========================
// FACE
// =========================
function drawRopperBackFace(
  state: MonsterDrawArgs["state"],
  args: FaceDrawArgs
) {
  // empty on purpose
}

// =========================
// EXPORT
// =========================
export const ropperBackMonster: MonsterDefinition = {
  id: "ROPPER_BACK",
  name: "Ropper Back",
  imageSrc: "",
  baseHeight: 180,
  faceAnchor: {
    x: 0.5,
    y: 0.4,
  },
  homeOffsetX: 0,
  homeOffsetY: 75,
  battleOffsetX: 0,
  battleOffsetY: 205,
  drawBody: drawRopperBackBody,
  drawFace: drawRopperBackFace,
};