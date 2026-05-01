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
function drawRockopperBody({ ctx, x, y, time, scale }: MonsterBodyDrawArgs) {
  const bob = Math.sin(time * 1.6) * 1.5;
  const pixelSize = 3.35 * scale;

  const palette = {
    O: "#1b120d", // outline
    R: "#8f6434", // earth brown
    M: "#b58247", // warm mid
    T: "#d8a35f", // highlight
    D: "#474747", // dark rock
    C: "#6a6a6a", // mid rock
    L: "#9a9a9a", // light rock
    P: "#f2a7c8", // inner ear / nose
    E: "#121212", // eye
    W: "#ffffff", // eye shine
  };

  // Taller final-evo body. Strong torso, but not too wide.
  const bodyRows = [
    "...........OOO...........",
    ".........OORRROO.........",
    "........ORRRRRRRO........",
    ".......ORRMMMMMRRO.......",
    ".......ORMMMMMMMRO.......",
    "......ORMMMMMMMMMRO......",
    "......ORMMMMMMMMMRO......",
    "......ORRMMMMMMMRRO......",
    "......ORRMMMMMMMRRO......",
    "......ORMMMMMMMMMRO......",
    "......ORMMMMMMMMMRO......",
    "......ORRRMMMMRRRRO......",
    ".....ORRRRRRRRRRRRRO.....",
    ".....ORRDDRRRRRDDRRO.....",
    "....OODLLDDRRDDLLDOO.....",
    "....ODLLLDDRRDDLLLDO.....",
    "....ODLLLDDRRDDLLLDO.....",
    ".....OOLLLOOOOLLLOO......",
    "......OOO......OOO.......",
  ];

  // Head is larger but still narrow enough to avoid "fat" look.
  const headRows = [
    "..........OO..........",
    "........OORROO........",
    ".......ORRMMRRO.......",
    "......ORMMMMMMRO......",
    ".....ORMMMMMMMMRO.....",
    ".....ORMMMMMMMMRO.....",
    ".....ORMMMMMMMMRO.....",
    ".....ORRMMMMMMRRO.....",
    "......ORRMMMMRRO......",
    ".......OORRRROO.......",
  ];

  // Huge guardian-style ears, more heroic and upright.
  const earFrame = Math.floor(((Math.sin(time * 2.1) + 1) / 2) * 3);
  let earRows: string[];

  if (earFrame === 0) {
   earRows = [
     "..DDDO...ODDD..",
      "..DCCDO.ODCCD..",
      "..DCLLD.DLLCD..",
      "..DCLLD.DLLCD..",
      "..DCLLD.DLLCD..",
      "..DCLLD.OLLCD...",
      "..DCLLD.OLLCD...",
      "..DCLLD.OLLCD...",
      "..DCLLD.DLLCD..",
      "..DCLLD.DLLCD..",
      "..DCLLD.DLLCD..",
      "...DLLD.DLLD...",
      "...ODDD.DDDO...",
      ".....O...O.....",
    ];
  } else if (earFrame === 1) {
    earRows = [
       "..DDDO...............",
      "..DCCDO...ODDD...",
      "..DCLLD..ODCCD...",
      "..DCLLD.ODLLCD...",
      "..DCLLD.ODLLCD...",
      "..DCLLD.ODLLCD...",
      "..DCLLD.ODLLCD...",
      "..DCLLD.ODLLCD...",
      "..DCLLD.ODLLCD...",
      "..DCLLD.ODLLCD...",
      "..DCLLD.DLLLCD...",
      "...DLLDODLLCD....",
      "...ODDD.ODDD.....",
      ".....O...O......",
    ];
  } else {
    earRows = [
     "..DDDO............",
      "..DCCDO..........",
      "..DCLLD....ODD...",
      "..DCLLD..ODCCD...",
      "..DCLLD.ODLLCD...",
      "..DCLLD.ODLLCD...",
      "..DCLLD.ODLLCD...",
      "..DCLLD.ODLLCD...",
      "..DCLLD.ODLLCD...",
      "..DCLLD.ODLLCD...",
      "..DCLLD.ODLLCD...",
      "...DLLDODLLCD....",
      "...ODDD.ODDD.....",
      ".....O...O......",
    ];
  }

  // Heavier forearms / shoulder rock chunks.
  const pawRows = [
    "...OODDO...ODDOO.....",
    "..ODLLLDO.ODLLLDO....",
    "..ODLLLDO.ODLLLDO....",
    "...ORRRRO.ORRRRO.....",
    "...ORRRRO.ORRRRO.....",
    "....OOOO...OOOO......",
  ];

  // Strong final-evo bunny legs.
  const legRows = [
    "...OODDDO..OODDDO.....",
    "..ODLLLLDOODLLLLDO....",
    "..ORRRRRROORRRRRRO....",
    "..ORRRRRROORRRRRRO....",
    "...ORRRRO..ORRRRO.....",
    "...OOO......OOO.......",
  ];

  // Chest / shoulder rock armor overlays.
  const armorRows = [
    "....ODDO.......ODDO......",
    "...ODLLDO.....ODLLDO.....",
    "...ODLLLD.....DLLLDO.....",
    "...ODLLL.......LLLDO......",
  ];

  ctx.save();
  ctx.translate(Math.round(x), Math.round(y + bob));

  drawShadow(ctx, 0, 42 * scale, 62 * scale, 12 * scale, 0.24);

 
  drawPixelBlock(ctx, bodyRows, palette, -13, 3, pixelSize);
   
  drawPixelBlock(ctx, headRows, palette, -11, -5, pixelSize);
  drawPixelBlock(ctx, earRows, palette, -8, -15, pixelSize);
  drawPixelBlock(ctx, pawRows, palette, -10, 8, pixelSize);
  drawPixelBlock(ctx, legRows, palette, -11, 21, pixelSize);
  drawPixelBlock(ctx, armorRows, palette, -12, 6, pixelSize);

  // =========================
  // FACE
  // =========================
  const blink = Math.sin(time * 4.4) > 0.95;

  const faceOffsetX = -1;
  const leftEyeX = -3 + faceOffsetX;
  const rightEyeX = 2 + faceOffsetX;
  const eyeY = 1;

  if (blink) {
    px(ctx, leftEyeX, eyeY, 2, 1, palette.E, pixelSize);
    px(ctx, rightEyeX, eyeY, 2, 1, palette.E, pixelSize);
  } else {
    px(ctx, leftEyeX, eyeY, 2, 2, palette.E, pixelSize);
    px(ctx, rightEyeX, eyeY, 2, 2, palette.E, pixelSize);

    px(ctx, leftEyeX, eyeY, 1, 1, palette.W, pixelSize);
    px(ctx, rightEyeX, eyeY, 1, 1, palette.W, pixelSize);
  }

  // harder brow
  px(ctx, leftEyeX - 1, eyeY - 1, 3, 1, palette.O, pixelSize);
  px(ctx, rightEyeX, eyeY - 1, 3, 1, palette.O, pixelSize);


  ctx.restore();
}

// =========================
// FACE
// =========================
function drawRockopperFace(
  state: MonsterDrawArgs["state"],
  args: FaceDrawArgs
) {
  // face drawn directly in body
}

// =========================
// EXPORT
// =========================
export const rockopperMonster: MonsterDefinition = {
  id: "ROCKOPPER",
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
  drawBody: drawRockopperBody,
  drawFace: drawRockopperFace,
};