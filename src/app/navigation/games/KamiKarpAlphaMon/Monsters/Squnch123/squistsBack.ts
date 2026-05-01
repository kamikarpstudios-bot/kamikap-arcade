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

function drawSquistsBackBody({
  ctx, x, y, time, scale, state
}: MonsterBodyDrawArgs) {
  const t = time;
  const basePixelSize = 3.8; 
  const pixelSize = basePixelSize * scale; 
  
  const bob = Math.round(Math.sin(t * 1.5) * 2); 
  const rage = Math.round(Math.sin(t * 8) * 1); 

  const palette = {
    "O": "#221100", "B": "#2e170b", "M": "#6f391b", "H": "#41240f",
    "C": "#c19a6b", "A": "#331a00", "K": "#111111", "W": "#ffffff"
  };

  ctx.save();
  ctx.translate(Math.round(x + (rage * scale)), Math.round(y + bob));
  ctx.imageSmoothingEnabled = false;

  // 1. FEET (Drawn first/bottom-most)
  px(ctx, -10, -2, 7, 4, palette.A, pixelSize);
  px(ctx, 3, -2, 7, 4, palette.A, pixelSize);

  // 2. CLAWED GLOVES 
  const armSwing = Math.sin(t * 3) * 4;
  px(ctx, -19, -16 + armSwing, 8, 8, palette.K, pixelSize);
  px(ctx, -17, -14 + armSwing, 1, 3, palette.W, pixelSize); 
  
  px(ctx, 11, -16 - armSwing, 8, 8, palette.K, pixelSize);
  px(ctx, 17, -14 - armSwing, 1, 3, palette.W, pixelSize); 

  // 3. TANK-LIKE BODY
  const bodyRows = [
    "...AAA.......AAA...", "..AOOOA.....AOOOA..",
    ".AOOOOOAAAAAOOOOOA.", "AOOOMMMMMMMMMMMOOOA",
    "AOOMMMMMMMMMMMMMOOA", "OOMMMMMMMMMMMMMMMOO",
    "OOMMMMMMMMMMMMMMMOO", "OOMMMMMMMMMMMMMMMOO",
    "OOMMMMMMMMMMMMMMMOO", "OOMMMMMMMMMMMMMMMOO",
    "OOMMMMMMMMMMMMMMMOO", ".OOMMMMMMMMMMMMMOO.",
    "..OOBBBBBBBBBBBOO..", "...OOBBBBBBBBBOO...",
    ".....OOOOOOOOO.....",
  ];
  drawPixelBlock(ctx, bodyRows, palette, -10, -16, pixelSize);

  // 4. BACK OF HEAD 
  const headRows = [
    ".....OO.......OO.....", "....OAAO.....OAAO....",
    "...OAMMO.....OAMMO...", "..OAMMMOOOOOOMMMMAO..",
    ".OAMMMMMMMMMMMMMMMAO.", "OAMMMMMMMMMMMMMMMMMAO",
    "OMMMMMMMMMMMMMMMMMMMO", "OMMMMMMMMMMMMMMMMMMMO",
    "OMMMMMMMMMMMMMMMMMMMO", "OMMMMMMMMMMMMMMMMMMMO",
    ".OMMMMMMMMMMMMMMMMMO.", "..OMMMMMMMMMMMMMMMO..",
    "....OOBBBBBBBBBBOO...",
  ];
  drawPixelBlock(ctx, headRows, palette, -11, -26, pixelSize);

  // 5. TAIL (Now drawn LAST so it appears in front of the body)
  const tailRows = [
    ".......HHHHHHHHH.......", "....HHHHMMMMMMMMMHHH...",
    "...HHMMMMMMMMMMMMMMHH..", "..HHMMMMMMHHHHHHMMMMH..",
    "..HMMMMMMMMMMMMMMMMMH.", ".HMMMMMMMMMMMMMMMMMMMH.",
    ".HMMMMMMMMMMMMMMMMMMH", ".HMMMMMMMMMMMMMMMMMMH",
    ".HMMMMMMMMMMMMMMMMMMH", ".HMMHHHHHHMMMMMMHHHMMH.",
    "..HMMMMMMMMMMMMMMMMMHH.", "...HHMMMMMMMMMMMMMMHH..",
    ".....HHHHHHHHHHHHHH....",
  ];
  // Positioned so it overlays the rear/lower back area
  drawPixelBlock(ctx, tailRows, palette, -28, -27, pixelSize);

  ctx.restore();
}

export const squistsBackMonster: MonsterDefinition = {
  id: "SQUISTS_BACK",
  name: "Squists",
  baseHeight: 250,
  homeOffsetX: 0,
  homeOffsetY: 130,
  drawBody: drawSquistsBackBody,
  drawFace: () => {}, 
};