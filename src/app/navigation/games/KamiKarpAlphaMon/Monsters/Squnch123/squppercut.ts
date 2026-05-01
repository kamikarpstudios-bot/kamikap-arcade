import { MonsterBodyDrawArgs, MonsterDefinition } from "../monsterTypes";

function px(ctx: CanvasRenderingContext2D, x: number, y: number, w: number, h: number, color: string, pixelSize: number) {
  ctx.fillStyle = color;
  ctx.fillRect(Math.round(x * pixelSize), Math.round(y * pixelSize), Math.ceil(w * pixelSize), Math.ceil(h * pixelSize));
}

function drawPixelBlock(ctx: CanvasRenderingContext2D, rows: string[], palette: Record<string, string>, ox: number, oy: number, pixelSize: number) {
  for (let row = 0; row < rows.length; row++) {
    const line = rows[row];
    for (let col = 0; col < line.length; col++) {
      const cell = line[col];
      if (cell === "." || !palette[cell]) continue;
      px(ctx, ox + col, oy + row, 1, 1, palette[cell], pixelSize);
    }
  }
}

function drawSquppercutBody({
  ctx, x, y, time, mouseX, mouseY, scale, blink, state
}: MonsterBodyDrawArgs) {
  const t = time;
  // Adjusted pixel size for a "heavier" feel
  const basePixelSize = 3.5; 
  const pixelSize = basePixelSize * scale; 
  
  const bob = Math.round(Math.sin(t * 2.5) * 1.5);
  const tailWag = Math.round(Math.sin(t * 2) * 2);
  const isBlinking = blink > 0.5 || Math.sin(t * 1.5) > 0.98;

  const palette = {
    "O": "#331a00", // Outline
    "B": "#5d2e16", // Shadow
    "M": "#a0522d", // Mid
    "H": "#472d13", // Highlight
    "C": "#ffebcd", // Chest
    "G": "#cc0000", // Red Gloves for "Uppercut" theme
    "E": "#1a1a1a", // Eye
    "W": "#ffffff", // White
  };

  ctx.save();
  // Fixed all scaling drift by applying scale only to the main translation.
  // The local pixel blocks now use absolute pixel offsets.
  ctx.translate(Math.round(x), Math.round(y + bob));
  ctx.imageSmoothingEnabled = false;

  // 1. THE MASSIVE TAIL (Starts low at -15, curls high to -60)
  const tailRows = [
    "..........HHHHHHH....",
    ".......HHHHMMMMMMHH..",
    ".....HHMMMMMMMMMMMMH.",
    "....HMMMMMMMMMMMMMMH",
    "...HMMMMMMMMMMMMMMH",
    "..HMMMMMMMMMMMMMMH",
    "..HMMMMMMMMMMMMMMH.",
    "..HMMMMMMMMMMMMMMH..",
    "..HMMMMMMMMMMMHMH....",
    "..HMMMMMMMMMMMH......",
    "...HMMMMMMMMMH.......",
    "....HHMMMMMMH........",
    "......HHHHHH.........",
  ];
  // --- TAIL FIX: Anchor shifted to the rear-base of the body block ---
  drawPixelBlock(ctx, tailRows, palette, 6 + tailWag, -25, pixelSize);

  // 2. THE CHUNKY BODY (Height: 20 rows)
  const bodyRows = [
    ".......OOOOOOOOO.......",
    ".....OOMMMMMMMMMOO.....",
    "....OOMMMMMMMMMMMOO....",
    "...OOMMMMMCCCCMMMMOO...",
    "..OOMMMMMCCCCCCMMMMOO..",
    "..OOMMMMCCCCCCCCMMMOO..",
    ".OOMMMMMCCCCCCCCMMMMOO.",
    ".OOMMMMMCCCCCCCCMMMMOO.",
    ".OOMMMMMCCCCCCCCMMMMOO.",
    ".OOMMMMMMCCCCCCMMMMMOO.",
    ".OOMMMMMMMCCCCMMMMMMOO.",
    ".OOMMMMMMMMMMMMMMMMMOO.",
    "..OOMMMMMMMMMMMMMMMOO..",
    "..OOBBBBBBBBBBBBBBBOO..",
    "...OOBBBBBBBBBBBBBOO...",
    ".....OOOOOOOOOOOOO.....",
  ];
  // Body ends at -2. Head needs to overlap this.
  drawPixelBlock(ctx, bodyRows, palette, -11, -20, pixelSize);

  // 3. THE HEAD (Sits deep on body)
  const headRows = [
    ".....OO.......OO.....",
    "....OBBO.....OBBO....",
    "...OBMMO.....OBMMO...",
    "..OBMMMMOOOOOMMMMMO..",
    ".OBMMMMMMMMMMMMMMMMO.",
    "OBMMMMMMMMMMMMMMMMMMO",
    "OBMMMMCCCCCCCCCMMMMMO",
    "OBMMMMCCCCCCCCCMMMMMO",
    "OBMMMMCCCCNCCCCMMMMMO",
    "OBMMMMCCCCCCCCCMMMMMO",
    ".OBMMMMMMWWWWWMMMMMO.",
    "..OBMMMMMMMMMMMMMMO..",
    "....OOBBBBBBBBBBOO...",
  ];
  // --- HEAD FIX: Submerged further to ensure zero gap at all scales ---
  drawPixelBlock(ctx, headRows, palette, -10, -32, pixelSize);

  // 4. FACE FEATURES (Mapped to head origin -42)
  const eyeY = -25;
  if (isBlinking) {
    px(ctx, -5, eyeY, 3, 1, palette.O, pixelSize);
    px(ctx, 3, eyeY, 3, 1, palette.O, pixelSize);
  } else {
    px(ctx, -5, eyeY, 2, 2, palette.E, pixelSize);
    px(ctx, 4, eyeY, 2, 2, palette.E, pixelSize);
    px(ctx, -5, eyeY, 1, 1, palette.W, pixelSize);
    px(ctx, 4, eyeY, 1, 1, palette.W, pixelSize);
  }

  // Large buck teeth
  px(ctx, -1, -23, 3, 3, palette.W, pixelSize);

  // 5. BOXING GLOVES (Floating in front of body)
  const gloveL = Math.sin(t * 8) * 3;
  const gloveR = Math.sin(t * 8 + Math.PI) * 3;

  // Left Glove
  px(ctx, -16, -25 + gloveL, 6, 6, palette.G, pixelSize);
  px(ctx, -15, -24 + gloveL, 2, 2, palette.W, pixelSize); // Highlight
  
  // Right Glove
  px(ctx, 11, -25 + gloveR, 6, 6, palette.G, pixelSize);
  px(ctx, 12, -24 + gloveR, 2, 2, palette.W, pixelSize); // Highlight

  // 6. FEET (Large and flat)
  px(ctx, -9, -4, 6, 3, palette.O, pixelSize);
  px(ctx, 4, -4, 6, 3, palette.O, pixelSize);

  ctx.restore();
}

export const squppercutMonster: MonsterDefinition = {
  id: "SQUPPERCUT",
  name: "Squppercut",
  baseHeight: 220, 
  homeOffsetX: 0,
  homeOffsetY: 130,
  drawBody: drawSquppercutBody,
};