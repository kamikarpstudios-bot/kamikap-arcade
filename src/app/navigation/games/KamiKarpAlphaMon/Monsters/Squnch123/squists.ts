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

function drawSquistsBody({
  ctx, x, y, time, scale, blink, state
}: MonsterBodyDrawArgs) {
  const t = time;
  const basePixelSize = 3.8; 
  const pixelSize = basePixelSize * scale; 
  
  const bob = Math.round(Math.sin(t * 1.5) * 2); 
  const rage = Math.round(Math.sin(t * 8) * 1); 
  const isBlinking = blink > 0.5 || Math.sin(t * 1.5) > 0.98;

  const palette = {
    "O": "#221100", "B": "#2e170b", "M": "#6f391b", "H": "#46260f",
    "C": "#402b12", "A": "#331a00", "R": "#640000", "E": "#1a1a1a",
    "W": "#ffffff", "K": "#111111",
  };

  ctx.save();
  // Main translation for movement and bobbing
  ctx.translate(Math.round(x + (rage * scale)), Math.round(y + bob));
  ctx.imageSmoothingEnabled = false;

  // 1. MASSIVE TAIL (Drawn first to be in background)
  const tailRows = [
    ".......HHHHHHHHH.......", "....HHHHMMMMMMMMMHHH...",
    "...HHMMMMMMMMMMMMMMHH..", "..HHMMMMMMHHHHHHMMMMH..",
    "..HMMMMHMMMMMMMMHMMMH.", ".HMMMMMMMMMMMMMMMMMMH.",
    ".HMMMMMMMMMMMMMMMMMH", ".HMMMMMMMMMMMMMMMMMMMH",
    ".HMMMMMMMMMMMMMHHHHHH", ".HMMMMMMMMMMMMMMMMMMMH.",
    "..HMMMMMMMMMMMMMMMMMHH.", "...HHMMMMMMMMMMMMMMHH..",
    ".....HHHHHHHHHHHHHH....",
  ];
  // Positioned slightly to the right to look like it's coming off the back
  drawPixelBlock(ctx, tailRows, palette, 8, -28, pixelSize);

  // 2. TANK-LIKE BODY
  const bodyRows = [
    "...AAA.......AAA...", "..AOOOA.....AOOOA..",
    ".AOOOOOAAAAAOOOOOA.", "AOOOMMMMMMMMMMMOOOA",
    "AOOMMMMMMMMMMMMMOOA", "OOMMMMMCCCCCMMMMMOO",
    "OOMMMMCCCCCCMMMMMOO", "OOMMMMCCCCCCMMMMMOO",
    "OOMMMMCCCCCCMMMMMOO", "OOMMMMMCCCCCMMMMMOO",
    "OOMMMMMMMMMMMMMMMOO", ".OOMMMMMMMMMMMMMOO.",
    "..OOBBBBBBBBBBBOO..", "...OOBBBBBBBBBOO...",
    ".....OOOOOOOOO.....",
  ];
  // Centered at -10 (approx half width of 19)
  drawPixelBlock(ctx, bodyRows, palette, -10, -16, pixelSize);

  // 3. SCARRED HEAD
  const headRows = [
    ".....OO.......OO.....", "....OAAO.....OAAO....",
    "...OAMMO.....OAMMO...", "..OAMMMOOOOOOMMMMAO..",
    ".OAMMMMMMMMMMMMMMMAO.", "OAMMMMMMMMMMMMMMMMMAO",
    "OMMMMCCCCCCCCCCCMMMMO", "OMMMMCCCCCCCCCCCMMMMO",
    "OMMMMCCCCCNCCCCCMMMMO", "OMMMMCCCCCCCCCCCMMMMO",
    ".OMMMMMMMWWWWWMMMMMO.", "..OMMMMMMMMMMMMMMMO..",
    "....OOBBBBBBBBBBOO...",
  ];
  // Centered at -11 (half width of 21) and moved down to meet body
  drawPixelBlock(ctx, headRows, palette, -11, -28, pixelSize);

  // 4. FACE FEATURES
  const eyeY = -20;
  // Left Red Scar/Eye
  px(ctx, -6, eyeY - 2, 1, 6, palette.R, pixelSize); 
  px(ctx, -8, eyeY, 5, 1, palette.O, pixelSize);    

  // Right Blinking Eye
  if (isBlinking) {
    px(ctx, 4, eyeY, 4, 1, palette.O, pixelSize);
  } else {
    px(ctx, 4, eyeY - 1, 3, 3, palette.E, pixelSize);
    px(ctx, 4, eyeY - 1, 1, 1, palette.W, pixelSize);
  }

  // Giant buck teeth - Centered relative to face
  px(ctx, -2, -16, 5, 4, palette.W, pixelSize);
  px(ctx, 0, -16, 1, 4, palette.O, pixelSize); 

  // 5. CLAWED GLOVES
  const armSwing = Math.sin(t * 3) * 4;
  // Left Glove
  px(ctx, -19, -16 + armSwing, 8, 8, palette.K, pixelSize);
  px(ctx, -21, -14 + armSwing, 3, 1, palette.W, pixelSize); 
  px(ctx, -21, -12 + armSwing, 3, 1, palette.W, pixelSize); 
  
  // Right Glove
  px(ctx, 11, -16 - armSwing, 8, 8, palette.K, pixelSize);
  px(ctx, 17, -14 - armSwing, 3, 1, palette.W, pixelSize); 
  px(ctx, 17, -12 - armSwing, 3, 1, palette.W, pixelSize); 

  // 6. FEET
  px(ctx, -10, -2, 7, 4, palette.O, pixelSize);
  px(ctx, 3, -2, 7, 4, palette.O, pixelSize);

  ctx.restore();
}

export const squistsMonster: MonsterDefinition = {
  id: "SQUISTS",
  name: "Squists",
  baseHeight: 250,
  homeOffsetX: 0,
  homeOffsetY: 130,
  drawBody: drawSquistsBody,
};