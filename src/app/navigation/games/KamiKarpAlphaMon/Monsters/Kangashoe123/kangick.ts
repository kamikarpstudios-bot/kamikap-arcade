import { MonsterBodyDrawArgs, MonsterDefinition } from "../monsterTypes";

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
  ctx.fillRect(
    Math.round(x * pixelSize),
    Math.round(y * pixelSize),
    Math.ceil(w * pixelSize),
    Math.ceil(h * pixelSize)
  );
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

function drawKangickBody({
  ctx,
  x,
  y,
  time,
  scale,
  blink,
}: MonsterBodyDrawArgs) {
  const t = time;
  const basePixelSize = 3.8;
  const pixelSize = basePixelSize * scale;

  const bob = Math.round(Math.sin(t * 1.7) * 2);
  const isBlinking = blink > 0.5 || Math.sin(t * 1.6) > 0.985;
  const tailWag = Math.round(Math.sin(t * 3.2) * 2);
  const armLift = Math.round(Math.sin(t * 2.8) * 1);

const palette = {
  O: "#4a2508",
  B: "#8f4e24",
  M: "#ad6230",
  T: "#c97d43",
  C: "#f0d1ac",
  E: "#1a1410",
  W: "#ffffff",
  N: "#2b170a",
  R: "#e11d1d", // 👈 NEW
};

  ctx.save();
  ctx.translate(Math.round(x), Math.round(y + bob));
  ctx.imageSmoothingEnabled = false;

  // 1. tail
  const tailRows = [
    "........OOOO.",
    "......OOBMMO.",
    "....OOBMMMMO.",
    "...OBMMMMMO..",
    "..OBMMMMO....",
    ".OBMMMMO.....",
    "OBMMMMO......",
    "OBMMMO.......",
    ".OOOO........",
  ];
  drawPixelBlock(ctx, tailRows, palette, 8 + tailWag, -12, pixelSize);

  // 2. legs / haunches
const legRows = [
  ".OBTTMMO...OMMTTBO.",
  "OBTTTMO.....OMTTTBO",
  "OBMMMO.......OMMMBO",
  ".OBBO.........OBBO.",
  "..OO...........OO..",
  ".OBBO.........OBBO.",
  "OBTTBO.......OBTTBO",
  "OTTTTBO.....OBTTTTO",

  // 👇 SHOES
  ".OORRRRO.....ORRRRO.",
  "ORRWWRRO.....ORRWWRO",
];
  drawPixelBlock(ctx, legRows, palette, -9, -3, pixelSize);

  // 3. body lowered so it connects into legs
  const bodyRows = [
    ".....OOOOOO.....",
    "...OOBTTTTBOO...",
    "..OBTTTTTTTTBO..",
    ".OBTTTCCCCTTTBO.",
    ".OBTTCCCCCCTTBO.",
    ".OBTTCCCCCCTTBO.",
    ".OBTTCCCCCCTTBO.",
    ".OBTTTCCCCTTTBO.",
    ".OBTTTTTTTTTTBO.",
    "..OBTTTTTTTTBO..",
    "...OOBBBBBBOO...",
  ];
  drawPixelBlock(ctx, bodyRows, palette, -7, -12, pixelSize);

  // 4. arms
  const leftArmRows = [
    "..OO.",
    ".OBTO",
    "OBTTO",
    ".OCCO",
  ];
  const rightArmRows = [
    ".OO..",
    "OTBO.",
    "OTTBO",
    "OCCO.",
  ];

  drawPixelBlock(ctx, leftArmRows, palette, -9, -14 + armLift, pixelSize);
  drawPixelBlock(ctx, rightArmRows, palette, 5, -15 - armLift, pixelSize);

  // 5. head
  const headRows = [
    "..O.......O..",
    "..MO.....OM..",
    ".BMO.....OMB.",
    ".TMMO...OMMT.",
    ".TMMO...OMMT.",
    ".TMMO...OMMT.",
    "OBTTMO.OMTTBO",
    "OBTTTMMMTTTBO",
    ".OMTTTTTTTMO.",
    ".OBTTCCCCTBO.",
    ".OBTCCCCCCTBO",
    ".OBTCCCCCCTBO",
    "..OBTTTTTTBO.",
    "...OOBBBBOO..",
  ];
  drawPixelBlock(ctx, headRows, palette, -6, -26, pixelSize);

  // 6. face
  const eyeY = -18;
  if (isBlinking) {
    px(ctx, -3, eyeY, 2, 1, palette.E, pixelSize);
    px(ctx, 2, eyeY, 2, 1, palette.E, pixelSize);
  } else {
    px(ctx, -3, eyeY, 2, 2, palette.E, pixelSize);
    px(ctx, 2, eyeY, 2, 2, palette.E, pixelSize);
    px(ctx, -3, eyeY, 1, 1, palette.W, pixelSize);
    px(ctx, 2, eyeY, 1, 1, palette.W, pixelSize);
  }

  px(ctx, 0, eyeY + 4, 1, 1, palette.N, pixelSize);
  px(ctx, -1, eyeY + 7, 3, 1, palette.N, pixelSize);

  ctx.restore();
}

export const kangickMonster: MonsterDefinition = {
  id: "KANGICK",
  name: "Kangick",
  baseHeight: 220,
  homeOffsetX: 0,
  homeOffsetY: 130,
  drawBody: drawKangickBody,
};