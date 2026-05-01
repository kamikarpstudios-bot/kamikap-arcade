import { MonsterDefinition, MonsterBodyDrawArgs } from "../monsterTypes";

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

function drawKangickBackBody({
  ctx,
  x,
  y,
  time,
  scale,
}: MonsterBodyDrawArgs) {
  const t = time;
  const basePixelSize = 3.8;
  const pixelSize = basePixelSize * scale;

  const bob = Math.round(Math.sin(t * 1.7) * 2);
  const tailWag = Math.round(Math.sin(t * 3.2) * 2);
  const armLift = Math.round(Math.sin(t * 2.8) * 1);

  const palette = {
    O: "#4a2508",
    B: "#8f4e24",
    M: "#ad6230",
    T: "#c97d43",
    C: "#f0d1ac",
      R: "#e11d1d", // 👈 NEW
  };

  ctx.save();
  ctx.translate(Math.round(x), Math.round(y + bob));
  ctx.imageSmoothingEnabled = false;

  // 1. legs / back haunches
  const legRows = [
    ".OBTTMMO...OMMTTBO.",
    "OBTTTMO.....OMTTTBO",
    "OBMMMO.......OMMMBO",
    ".OBBO.........OBBO.",
    "..OO...........OO..",
    ".OBBO.........OBBO.",
    "OBTTBO.......OBTTBO",
    "OTTTTBO.....OBTTTTO",
    ".OOOOOO.....OOOOOO.",

      // 👇 SHOES
  ".OORRRRO.....ORRRRO.",
  "ORRWWRRO.....ORRWWRO",
  ];
  drawPixelBlock(ctx, legRows, palette, -9, -3, pixelSize);

  // 2. body back
  const bodyRows = [
    ".....OOOOOO.....",
    "...OOBTTTTBOO...",
    "..OBTTTTTTTTBO..",
    ".OBTTTTTTTTTTBO.",
    ".OBTTTTTTTTTTBO.",
    ".OBTTTTTTTTTTBO.",
    ".OBTTTTTTTTTTBO.",
    ".OBTTTTTTTTTTBO.",
    ".OBTTTTTTTTTTBO.",
    "..OBTTTTTTTTBO..",
    "...OOBBBBBBOO...",
  ];
  drawPixelBlock(ctx, bodyRows, palette, -7, -12, pixelSize);

  // 3. subtle spine / neck patch
  px(ctx, -1, -10, 2, 8, palette.B, pixelSize);
  px(ctx, -2, -13, 4, 2, palette.C, pixelSize);

  // 4. arms from shoulders
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
  drawPixelBlock(ctx, leftArmRows, palette, -10, -15 + armLift, pixelSize);
  drawPixelBlock(ctx, rightArmRows, palette, 6, -16 - armLift, pixelSize);

  // 5. head back
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
    ".OBTTTTTTTTBO.",
    ".OBTTTTTTTTBO.",
    ".OBTTTTTTTTBO.",
    "..OBTTTTTTBO.",
    "...OOBBBBOO..",
  ];
  drawPixelBlock(ctx, headRows, palette, -6, -26, pixelSize);

  // 6. tail LAST so it sits in front
  const tailRows = [
    "........OOOOO......",
    "......OOBTTTBO.....",
    "....OOBTTTTTTBO....",
    "...OBTTTTTTTTTBO...",
    "..OBTTTTTTTTTBO....",
    ".OBTTTTTTTTTBO.....",
    "OBTTTTTTTTTBO......",
    "OBTTTTTTTTBO.......",
    ".OOBTTTTBO.........",
    "...OOOOO...........",
  ];
  drawPixelBlock(ctx, tailRows, palette, 4 + tailWag, -4, pixelSize);

  ctx.restore();
}

export const kangickBackMonster: MonsterDefinition = {
  id: "KANGICK_BACK",
  name: "Kangick",
  baseHeight: 220,
  homeOffsetX: 0,
  homeOffsetY: 130,
  drawBody: drawKangickBackBody,
};