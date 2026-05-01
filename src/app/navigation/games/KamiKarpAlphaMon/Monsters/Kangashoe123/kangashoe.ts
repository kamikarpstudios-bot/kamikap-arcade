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

function drawKangashoeBody({
  ctx,
  x,
  y,
  time,
  scale,
  blink,
}: MonsterBodyDrawArgs) {
  const t = time;
  const basePixelSize = 3.6;
  const pixelSize = basePixelSize * scale;

  const bob = Math.round(Math.sin(t * 1.5) * 2);
  const isBlinking = blink > 0.5 || Math.sin(t * 1.5) > 0.98;
  const tailWag = Math.round(Math.sin(t * 3) * 2);
  const armBounce = Math.round(Math.sin(t * 2.2) * 1);

  const palette = {
    O: "#4a2508", // outline
    B: "#8f4e24", // dark fur
    M: "#a85d2a", // mid fur
    C: "#f1d0a5", // pouch / muzzle / belly
    E: "#1a1410", // eyes
    W: "#ffffff", // eye shine
    N: "#2b170a", // nose
  };

  ctx.save();
  ctx.translate(Math.round(x), Math.round(y + bob));
  ctx.imageSmoothingEnabled = false;

  // 1. Tail
  const tailRows = [
    "....OOO...",
    "...OBMMO..",
    "..OBMMMO..",
    ".OBMMMO...",
    "OBMMMO....",
    "OBMMO.....",
    ".OOO......",
  ];
  drawPixelBlock(ctx, tailRows, palette, 4 + tailWag, -12, pixelSize);

  // 2. Legs + feet
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

  // 3. Body
  const bodyRows = [
    "....OOOOO....",
    "...OBMMMMO...",
    "..OBMMMMMMO..",
    "..OBMMCCCCMO.",
    "..OBMMCCCCMO.",
    "..OBMMCCCCMO.",
    "..OBMMCCCCMO.",
    "..OBMMMMMMMO.",
    "...OBMMMMMO..",
    "....OOBBBO...",
  ];
  drawPixelBlock(ctx, bodyRows, palette, -6, -15, pixelSize);

  // 4. Little arms
  const armRows = [
    ".OO.",
    "OBMO",
    ".OMO",
  ];

  drawPixelBlock(ctx, armRows, palette, -8, -15 + armBounce, pixelSize);
  drawPixelBlock(ctx, armRows, palette, 4, -15 - armBounce, pixelSize);

  // tiny hands
  px(ctx, -7, -12 + armBounce, 1, 1, palette.C, pixelSize);
  px(ctx, 7, -12 - armBounce, 1, 1, palette.C, pixelSize);

  // 5. Head
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
    "OMMCCCCCO",
    "OMMCCCCCO",
    "OMMCCCCCO",
    ".OBMMMMO.",
    "..OOBBO..",
  ];
  drawPixelBlock(ctx, headRows, palette, -4, -29, pixelSize);

  // 6. Face
  const eyeY = -20;
  if (isBlinking) {
    px(ctx, -2, eyeY, 2, 1, palette.E, pixelSize);
    px(ctx, 2, eyeY, 2, 1, palette.E, pixelSize);
  } else {
    px(ctx, -2, eyeY, 2, 2, palette.E, pixelSize);
    px(ctx, 2, eyeY, 2, 2, palette.E, pixelSize);
    px(ctx, -2, eyeY, 1, 1, palette.W, pixelSize);
    px(ctx, 2, eyeY, 1, 1, palette.W, pixelSize);
  }

  px(ctx, 0, eyeY + 3, 1, 1, palette.N, pixelSize);

  ctx.restore();
}

export const kangashoeMonster: MonsterDefinition = {
  id: "KANGASHOE",
  name: "Kangashoe",
  baseHeight: 180,
  faceAnchor: { x: 0.5, y: 0.3 }, // Adjust as needed
  homeOffsetX: 0,
  homeOffsetY: 130,
  battleOffsetX: 0,
  battleOffsetY: 200, // Adjust battle positioning
  loginOffsetX: 0,
  loginOffsetY: 100, // Adjust login positioning
  drawBody: drawKangashoeBody,
//drawFace: drawKangashoeFace, // Add face draw if applicable
};