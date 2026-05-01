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
function drawRopperBody({ ctx, x, y, time, scale }: MonsterBodyDrawArgs) {
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
    P: "#f2a7c8", // inner ear / paw pad pink
    E: "#121212", // eye
    W: "#ffffff", // eye shine
  };

  // chunkier rabbit body with clearer feet
  const bodyRows = [
    ".........OOO.........",
    "........ORRRO.......",
    "........ORMRO......",
    ".......ORRMRRO.....",
    "......ORRRMMRRO....",
    "......ORRMMMRRO...",
    ".....ORRMMMMMRRO..",
    ".....ORRMMMMMRRO..",
    ".....ORRMMMMMRRO..",
    ".....ORRMMMMMRRO...",
    ".....ORRRRRRRRRO....",
    ".....OODDRRRRDOOO.....",
    ".....ODDDD..DDDDO....",
    ".....ODLLD..DLLDO....",
    ".....ODLLD..DLLDO....",
  ];

  // rounder head, a bit wider so face reads better
  const headRows = [
    "........OOOO..........",
    ".......OORROO........",
    "......ORRMMMRO.......",
    ".....ORRMMMRRO......",
    ".....ORMMMMMMRO......",
    "....ORRMMMMMMRRO.....",
    "....ORRMMPPMMRRO.....",
    ".....ORMMMMMMRO......",
    "......OORRRROO.......",
  ];

  // 3-frame rocky ear animation
  const earFrame = Math.floor(((Math.sin(time * 2.3) + 1) / 2) * 3);

  let earRows: string[];

  if (earFrame === 0) {
    // both ears tall / proud
    earRows = [
      "..DDDO...ODDD..",
      "..DCCDO.ODCCD..",
      "..DCLLD.DLLCD..",
      "..DCLLD.DLLCD..",
      "..DCLLD.DLLCD..",
      "...DLLD.DLLD...",
      "...ODDD.DDDO...",
      ".....O...O.....",
    ];
  } else if (earFrame === 1) {
    // one ear slightly tilted
    earRows = [
      "..DDDO...............",
      "..DCCDO...ODDD...",
      "..DCLLD..ODCCD...",
      "..DCLLD.ODLLCD...",
      "..DCLLD.DLLLCD...",
      "...DLLDODLLCD....",
      "...ODDD.ODDD.....",
      ".....O...O......",
    ];
  } else {
    // one ear folded heavier like a rock slab tipping
    earRows = [
      "..DDDO...............",
      "..DCCDO..............",
      "..DCLLD....ODD...",
      "..DCLLD..ODCCD...",
      "..DCLLD.ODLLCD...",
      "...DLLDODLLCD....",
      "...ODDD.ODDD.....",
      ".....O...O......",
    ];
  }

  // little front paws so it feels more bunny-like
  const pawRows = [
    "...RLLR..RLLR....",
    "...OCCO..OCCO...",
    "....OO....OO...",
  ];

  ctx.save();
  ctx.translate(Math.round(x), Math.round(y + bob));

  drawShadow(ctx, 0, 31 * scale, 48 * scale, 10 * scale, 0.22);

  // draw order
  
  drawPixelBlock(ctx, bodyRows, palette, -16, 2, pixelSize);
  drawPixelBlock(ctx, headRows, palette, -16, -2, pixelSize);
  drawPixelBlock(ctx, earRows, palette, -13, -7, pixelSize);
  drawPixelBlock(ctx, pawRows, palette, -14, 6, pixelSize);

  // face
  const blink = Math.sin(time * 4.8) > 0.93;

  const leftEyeX = -9;
  const rightEyeX = -5;
  const eyeY = 2;
  

  if (blink) {
    px(ctx, leftEyeX, eyeY, 2, 1, palette.E, pixelSize);
    px(ctx, rightEyeX, eyeY, 2, 1, palette.E, pixelSize);
  } else {
    px(ctx, leftEyeX, eyeY, 2, 2, palette.E, pixelSize);
    px(ctx, rightEyeX, eyeY, 2, 2, palette.E, pixelSize);

    px(ctx, leftEyeX, eyeY, 1, 1, palette.W, pixelSize);
    px(ctx, rightEyeX, eyeY, 1, 1, palette.W, pixelSize);
  }


  ctx.restore();
}

// =========================
// FACE
// =========================
function drawRopperFace(
  state: MonsterDrawArgs["state"],
  args: FaceDrawArgs
) {
  // empty on purpose — face is drawn directly in body
}

// =========================
// EXPORT
// =========================
export const ropperMonster: MonsterDefinition = {
  id: "ROPPER",
  name: "Ropper",
  imageSrc: "",
  baseHeight: 180,
  faceAnchor: {
    x: 0.2,
    y: 0.39,
  },
  homeOffsetX: 0,
  homeOffsetY: 75,
  battleOffsetX: 0,
  battleOffsetY: 205,
  loginOffsetX: 0,
  loginOffsetY: 0,
  drawBody: drawRopperBody,
  drawFace: drawRopperFace,
};