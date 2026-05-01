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

function drawKangashoeBackBody({
  ctx,
  x,
  y,
  time,
  scale,
}: MonsterBodyDrawArgs) {
  const t = time;
  const basePixelSize = 3.6;
  const pixelSize = basePixelSize * scale;

  const bob = Math.round(Math.sin(t * 1.5) * 2);
  const tailWag = Math.round(Math.sin(t * 3) * 2);
  const armBounce = Math.round(Math.sin(t * 2.2) * 1);

  const palette = {
    O: "#4a2508",
    B: "#8f4e24",
    M: "#a85d2a",
    C: "#f1d0a5",
  };

  ctx.save();
  ctx.translate(Math.round(x), Math.round(y + bob));
  ctx.imageSmoothingEnabled = false;

  // 1. legs / feet
  const legRows = [
    "BMMO...OMMB",
    "BMMO...OMMB",
    "OBMO...OMBO",
    ".OO.....OO.",
    ".BO.....OB.",
    "OBBO...OBBO",
    "OMMBO.OBMMO",
    ".OOO...OOO.",
  ];
  drawPixelBlock(ctx, legRows, palette, -5, -6, pixelSize);

  // 2. body back
  const bodyRows = [
    "....OOOOO....",
    "...OBMMMMO...",
    "..OBMMMMMMO..",
    "..OBMMMMMMMO.",
    "..OBMMMMMMMO.",
    "..OBMMMMMMMO.",
    "..OBMMMMMMMO.",
    "..OBMMMMMMMO.",
    "...OBMMMMMO..",
    "....OOBBBO...",
  ];
  drawPixelBlock(ctx, bodyRows, palette, -6, -16, pixelSize);

  // 3. little back arms
  const armRows = [
    ".OO.",
    "OBMO",
    ".OMO",
  ];
  drawPixelBlock(ctx, armRows, palette, -8, -15 + armBounce, pixelSize);
  drawPixelBlock(ctx, armRows, palette, 4, -15 - armBounce, pixelSize);

  // 4. head back
  const headRows = [
    "O.......O",
    "MO.....OM",
    "MMO...OMM",
    "BMMO.OMMB",
    "BMMO.OMMB",
    "BMMO.OMMB",
    "OBMMOOMMB",
    "OBMMMMMMO",
    "OMMMMMMMO",
    "OMMMMMMMO",
    "OMMMMMMMO",
    "OMMMMMMMO",
    ".OBMMMMO.",
    "..OOBBO..",
  ];
  drawPixelBlock(ctx, headRows, palette, -4, -29, pixelSize);

  // 5. neck / back patch
  px(ctx, -2, -16, 4, 2, palette.C, pixelSize);

  // 6. tail LAST so it is in front
  const tailRows = [
    "......OOO.",
    ".....OMMBO",
    "....OMMMBO",
    "...OMMMBO.",
    "..OMMMBO..",
    ".OMMMBO...",
    "OMMMBO....",
    "OMMBO.....",
    ".OOO......",
  ];
  drawPixelBlock(ctx, tailRows, palette, 2 + tailWag, -16, pixelSize);

  ctx.restore();
}

export const kangashoeBackMonster: MonsterDefinition = {
  id: "KANGASHOE_BACK",
  name: "Kangashoe",
  baseHeight: 180,
  homeOffsetX: 0,
  homeOffsetY: 130,
  drawBody: drawKangashoeBackBody,
};