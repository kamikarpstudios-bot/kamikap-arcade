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

function drawShadow(
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  w: number,
  h: number,
  alpha = 0.22
) {
  ctx.save();
  ctx.fillStyle = `rgba(0,0,0,${alpha})`;
  ctx.beginPath();
  ctx.ellipse(x, y, w, h, 0, 0, Math.PI * 2);
  ctx.fill();
  ctx.restore();
}

function drawSqunchBackBody({
  ctx,
  x,
  y,
  time,
  scale,
}: MonsterBodyDrawArgs) {
  const t = time;
  const bob = Math.round(Math.sin(t * 2.2) * 2) * scale;
  const tailWag = Math.round(Math.sin(t * 2.6) * 1);
  const pixelSize = Math.max(2, Math.round(3 * scale));

  const palette = {
    O: "#4a2508",
    B: "#8f4e24",
    M: "#a85d2a",
    H: "#c97a3a",
    C: "#f4d8b0",
    N: "#2b170a",
    S: "rgba(0,0,0,0.14)", // Spine shadow
  };

  ctx.save();
  ctx.translate(Math.round(x), Math.round(y + bob));
  ctx.imageSmoothingEnabled = false;

  // Shadow on the ground
  drawShadow(ctx, 0, 2 * scale, 20 * scale, 5 * scale, 0.22);

  const tailFrames = [
    ["....OOO....","...OBMOO...","..OBMMMOO..","..OBMMMBO..","...OBMMBO..","....OBBO...",".....OO...."],
    ["......OOO..","....OOBMOO.","...OBMMMBOO","...OBMMMBO.","....OBMMO..",".....OBO...","......O...."],
    ["..OOO......",".OOMBBO....","OOBMMMBO...",".OBMMMBO...","..OMMBO....","...OBO.....","....O......"],
  ];

  const earRowsLeft = [
    "...OO.", "..OBBO", ".OBMMO", ".OBMMO", "..OBBO", "...OO.",
  ];

  const earRowsRight = [
    ".OO...", "OBBO..", "OMMBO.", "OMMBO.", "OBBO..", ".OO...",
  ];

  const bodyRows = [
    "........OOOBOOO........",
    "......OOBMMMMMBOO......",
    ".....OBMMMMMMMMMBO.....",
    "....OBMMMMMMMMMMMBO....",
    "...OBMMMMMMMMMMMMMBO...",
    "...OBMMMMMMMMMMMMMBO...",
    "..OBMMMMMMMMMMMMMMMBO..",
    "..OBMMMMMMMMMMMMMMMBO..",
    "..OBMMMMMMMMMMMMMMMBO..",
    "..OBMMMMMMMMMMMMMMMBO..",
    "...OBMMMMMMMMMMMMMBO...",
    "...OOBMMMMMMMMMMMBO....",
    "....OBBMMMMMMMMBBO.....",
    ".....OOBBBBBBBBO.......",
  ];

  const headRows = [
    "........OO....OO........",
    ".......OBBO..OBBO.......",
    "......OBMMBOOBMMBO......",
    ".....OBMMMMMMMMMMBO.....",
    "....OBMMMMMMMMMMMMBO....",
    "...OBMMMMMMMMMMMMMMBO...",
    "..OBMMMMMMMMMMMMMMMMBO..",
    "..OBMMMMMMMMMMMMMMMMBO..",
    "..OBMMMMMMMMMMMMMMMMBO..",
    "..OBMMMMMMMMMMMMMMMMBO..",
    "...OBMMMMMMMMMMMMMMBO...",
    "....OBMMMMMMMMMMMMBO....",
    ".....OOBMMMMMMMMBOO.....",
    ".......OOBBBBBOO........",
  ];

  // Draw Spine Shadow
  const spineRows = ["S","S","S","S","S","S","S","S","S","S","S","S","S","S","S","S"];

  // --- DRAWING ---

  // 1. Tail (Lowered to attach to bottom of body)
  drawPixelBlock(ctx, tailFrames[tailWag > 0 ? 1 : tailWag < 0 ? 2 : 0], palette, 7, -15, pixelSize);

  // 2. Ears (Lowered to match new head Y)
  drawPixelBlock(ctx, earRowsLeft, palette, -11, -32, pixelSize);
  drawPixelBlock(ctx, earRowsRight, palette, 5, -32, pixelSize);

  // 3. Body (Bottom near Y=0)
  drawPixelBlock(ctx, bodyRows, palette, -12, -20, pixelSize);

  // 4. Head (Lowered to sit on top of body with slight overlap)
  drawPixelBlock(ctx, headRows, palette, -12, -32, pixelSize);

  // 5. Spine (Extended and moved to bridge the gap)
  drawPixelBlock(ctx, spineRows, palette, 0, -28, pixelSize);

  // 6. Feet (Moved up to attach to body base)
  px(ctx, -8, -7, 4, 2, palette.N, pixelSize);
  px(ctx, 4, -7, 4, 2, palette.N, pixelSize);

  ctx.restore();
}

export const squnchBackMonster: MonsterDefinition = {
  id: "SQUNCH_BACK",
  name: "Squnch",
  baseHeight: 180,
  homeOffsetX: 0,
  homeOffsetY: 130,
  drawBody: drawSqunchBackBody,
};