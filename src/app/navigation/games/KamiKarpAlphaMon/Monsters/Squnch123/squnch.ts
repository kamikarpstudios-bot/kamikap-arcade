import { MonsterDefinition } from "../monsterTypes";

function clamp(value: number, min: number, max: number) {
  return Math.max(min, Math.min(max, value));
}

type SqunchBodyDrawArgs = {
  ctx: CanvasRenderingContext2D;
  x: number;
  y: number;
  time: number;
  mouseX: number;
  mouseY: number;
  state: string;
  scale: number;
};

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

function getEyeLook(
  mouseX: number,
  mouseY: number,
  x: number,
  y: number,
  scale: number
) {
  // Adjusted target Y to match the new head position (~28px above anchor)
  const dx = mouseX - x;
  const dy = mouseY - (y - 28 * scale);
  const dist = Math.sqrt(dx * dx + dy * dy) || 1;

  const maxMoveX = 1 * scale;
  const maxMoveY = 1 * scale;

  return {
    lookX: clamp((dx / dist) * Math.min(maxMoveX, dist * 0.01), -maxMoveX, maxMoveX),
    lookY: clamp((dy / dist) * Math.min(maxMoveY, dist * 0.01), -maxMoveY, maxMoveY),
  };
}

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
// ... (Rest of the helper functions remain the same)

function drawSqunchBody({
  ctx,
  x,
  y,
  time,
  mouseX,
  mouseY,
  scale,
}: SqunchBodyDrawArgs) {
  const t = time;
  const bob = Math.round(Math.sin(t * 2.2) * 2) * scale;
  const blink = Math.sin(t * 1.8) > 0.96;
  const tailWag = Math.round(Math.sin(t * 2.6) * 1);
  const { lookX, lookY } = getEyeLook(mouseX, mouseY, x, y + bob, scale);

  const pixelSize = Math.max(2, Math.round(3 * scale));
  const lookPxX = Math.round(lookX / Math.max(scale, 0.001));
  const lookPxY = Math.round(lookY / Math.max(scale, 0.001));

  const palette = {
    O: "#4a2508", B: "#8f4e24", M: "#a85d2a", H: "#c97a3a",
    C: "#f4d8b0", E: "#1a1410", W: "#fff6e8", N: "#2b170a",
  };

  ctx.save();
  ctx.translate(Math.round(x), Math.round(y + bob));
  ctx.imageSmoothingEnabled = false;

  // Shadow
  drawShadow(ctx, 0, 2 * scale, 20 * scale, 5 * scale, 0.22);

  const tailFrames = [
    ["....OOO....","...OBMOO...","..OBMMMOO..","..OBMMMBO..","...OBMMBO..","....OBBO...",".....OO...."],
    ["......OOO..","....OOBMOO.","...OBMMMBOO","...OBMMMBO.","....OBMMO..",".....OBO...","......O...."],
    ["..OOO......",".OOMBBO....","OOBMMMBO...",".OBMMMBO...","..OMMBO....","...OBO.....","....O......"],
  ];

  const bodyRows = [
    "........OOOBOOO........",
    "......OOBMMMMMBOO......",
    ".....OBMMMMMMMMMBO.....",
    "....OBMMMMMMMMMMMBO....",
    "...OBMMMMCCCCMMMMMBO...",
    "...OBMMMCCCCCCMMMMBO...",
    "..OBMMMMCCCCCCMMMMMBO..",
    "..OBMMMMCCCCCCMMMMMBO..",
    "..OBMMMMMCCCCMMMMMMBO..",
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
    "...OBMMMCCCCCCCCMMMBO...",
    "..OBMMMCCCCCCCCCCMMMBO..",
    "..OBMMMCCCCCCCCCCMMMBO..",
    "..OBMMMCCCCNCCCCCMMMBO..",
    "..OBMMMMCCCCCCCCMMMMBO..",
    "...OBMMMMMWWWWMMMMMBO...",
    "....OBMMMMMMMMMMMMBO....",
    ".....OOBMMMMMMMMBOO.....",
    ".......OOBBBBBOO........",
  ];

  // 1. Tail
  drawPixelBlock(ctx, tailFrames[tailWag > 0 ? 1 : tailWag < 0 ? 2 : 0], palette, 7, -15, pixelSize);

  // 2. Body
  drawPixelBlock(ctx, bodyRows, palette, -12, -20, pixelSize);

  // 3. Head
  drawPixelBlock(ctx, headRows, palette, -12, -32, pixelSize);

  // --- FACE FEATURES (MOVED HIGHER) ---
  
  // 4. Eyes: Moved from -22 to -26 (Higher up on the head)
  const leftEyeX = -5 + lookPxX;
  const rightEyeX = 3 + lookPxX;
  const eyeY = -26 + lookPxY; 

  if (blink) {
    px(ctx, leftEyeX, eyeY, 3, 1, palette.E, pixelSize);
    px(ctx, rightEyeX, eyeY, 3, 1, palette.E, pixelSize);
  } else {
    px(ctx, leftEyeX, eyeY, 2, 2, palette.E, pixelSize);
    px(ctx, rightEyeX, eyeY, 2, 2, palette.E, pixelSize);
    px(ctx, leftEyeX, eyeY, 1, 1, palette.W, pixelSize);
    px(ctx, rightEyeX, eyeY, 1, 1, palette.W, pixelSize);
  }

  // 5. Blushes: Moved from -19 to -23
  px(ctx, -8, -23, 2, 2, palette.C, pixelSize);
  px(ctx, 6, -23, 2, 2, palette.C, pixelSize);

  // 6. Mouth: Moved from -12 to -16
  px(ctx, -1, -16, 2, 3, palette.W, pixelSize);

  // 7. Feet
  px(ctx, -8, -7, 4, 2, palette.N, pixelSize);
  px(ctx, 4, -7, 4, 2, palette.N, pixelSize);

  ctx.restore();
}

export const squnchMonster: MonsterDefinition = {
  id: "SQUNCH",
  name: "Squnch",
  baseHeight: 180,
  faceAnchor: { x: 0.5, y: 0.3 },
  homeOffsetX: 0,
  homeOffsetY: 130,
  battleOffsetX: 0, 
  battleOffsetY: 0, 
  loginOffsetX: 0, 
  loginOffsetY: 0,
  drawBody: drawSqunchBody,
};