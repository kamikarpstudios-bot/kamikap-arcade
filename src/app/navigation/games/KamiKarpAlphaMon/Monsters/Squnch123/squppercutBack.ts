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

function drawSquppercutBackBody({
  ctx, x, y, time, scale, state
}: MonsterBodyDrawArgs) {
  const t = time;
  const basePixelSize = 3.5; 
  const pixelSize = basePixelSize * scale; 
  
  const bob = Math.round(Math.sin(t * 2.5) * 1.5);
  const tailWag = Math.round(Math.sin(t * 2) * 2);

  const palette = {
    "O": "#331a00", // Outline
    "B": "#5d2e16", // Shadow
    "M": "#a0522d", // Mid
    "H": "#432b12", // Highlight
    "G": "#990000", // Darker Red Gloves (in shadow)
    "S": "rgba(0,0,0,0.15)", // Spine Shadow
  };

  ctx.save();
  ctx.translate(Math.round(x), Math.round(y + bob));
  ctx.imageSmoothingEnabled = false;

  // --- DRAW ORDER (BACK VIEW) ---

  // 1. BOXING GLOVES (Behind everything)
  const gloveL = Math.sin(t * 8) * 3;
  const gloveR = Math.sin(t * 8 + Math.PI) * 3;
  px(ctx, -16, -25 + gloveL, 6, 6, palette.G, pixelSize); // Left Glove
  px(ctx, 11, -25 + gloveR, 6, 6, palette.G, pixelSize);  // Right Glove

  // 2. EARS (Behind the head)
  const earRows = [
    ".OO...OO.",
    "OBBO.OBBO",
    "OMMO.OMMO",
    "OMMO.OMMO",
    ".OO...OO.",
  ];
  drawPixelBlock(ctx, earRows, palette, -5, -36, pixelSize);

  // 3. THE CHUNKY BODY (Back view: No chest cream color)
  const bodyRows = [
    ".......OOOOOOOOO.......",
    ".....OOMMMMMMMMMOO.....",
    "....OOMMMMMMMMMMMOO....",
    "...OOMMMMMMMMMMMMMOO...",
    "..OOMMMMMMMMMMMMMMMOO..",
    "..OOMMMMMMMMMMMMMMMOO..",
    ".OOMMMMMMMMMMMMMMMMMOO.",
    ".OOMMMMMMMMMMMMMMMMMOO.",
    ".OOMMMMMMMMMMMMMMMMMOO.",
    ".OOMMMMMMMMMMMMMMMMMOO.",
    ".OOMMMMMMMMMMMMMMMMMOO.",
    ".OOMMMMMMMMMMMMMMMMMOO.",
    "..OOMMMMMMMMMMMMMMMOO..",
    "..OOBBBBBBBBBBBBBBBOO..",
    "...OOBBBBBBBBBBBBBOO...",
    ".....OOOOOOOOOOOOO.....",
  ];
  drawPixelBlock(ctx, bodyRows, palette, -11, -20, pixelSize);

  // 4. THE HEAD (Submerged 10 pixels deep)
  const headRows = [
    ".....OOOOOOOOO.....",
    "....OOMMMMMMMMMOO....",
    "...OOMMMMMMMMMMMOO...",
    "..OOMMMMMMMMMMMMMOO..",
    ".OOMMMMMMMMMMMMMMMMMO.",
    "OOMMMMMMMMMMMMMMMMMMO",
    "OOMMMMMMMMMMMMMMMMMMO",
    "OOMMMMMMMMMMMMMMMMMMO",
    "OOMMMMMMMMMMMMMMMMMMO",
    "OOMMMMMMMMMMMMMMMMMMO",
    ".OOMMMMMMMMMMMMMMMMO.",
    "..OOMMMMMMMMMMMMMMO..",
    "....OOBBBBBBBBBBOO...",
  ];
  drawPixelBlock(ctx, headRows, palette, -10, -32, pixelSize);

  // 5. SPINE DETAIL
  px(ctx, 0, -32, 1, 12, palette.S, pixelSize);

  // 6. THE MASSIVE TAIL (Drawn last to overlap the back)
  const tailRows = [
    "....HHHHHHH..........",
    "..HHMMMMMMHHHH.......",
    ".HMMMMMMMMMMMMHH.....",
    "HMMMMHHHHHMMMMMMH....",
    "HMMMMMMMMMMMHMMMMH...",
    "HMMMMMMMMMMMMMMMH..",
    ".HMMMMMMMMMMMMMMH..",
    "..HMMMMMMMMMMMMMMH..",
    "....HMHMMMMMMMMMMH..",
    "......HMHHHHHHHMMM H..",
    ".......HMMMMMMMMMH...",
    "........HMMMMMMHH....",
    ".........HHHHHH......",
  ];
  // Tail is flipped horizontally for the back view and connected to the low spine
  drawPixelBlock(ctx, tailRows, palette, -24 + tailWag, -25, pixelSize);

  // 7. FEET (Tucked under)
  px(ctx, -9, -4, 6, 3, palette.O, pixelSize);
  px(ctx, 4, -4, 6, 3, palette.O, pixelSize);

  ctx.restore();
}

export const squppercutBackMonster: MonsterDefinition = {
  id: "SQUPPERCUT_BACK",
  name: "Squppercut",
  baseHeight: 220,
  homeOffsetX: 0,
  homeOffsetY: 130,
  drawBody: drawSquppercutBackBody,
};