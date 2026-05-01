import {
  FaceDrawArgs,
  MonsterDefinition,
  MonsterDrawArgs,
  MonsterBodyDrawArgs,
} from "../monsterTypes";

// =========================
// PIXEL HELPERS
// =========================
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
  const x1 = Math.round(x * pixelSize);
  const y1 = Math.round(y * pixelSize);
  const x2 = Math.round((x + w) * pixelSize);
  const y2 = Math.round((y + h) * pixelSize);
  ctx.fillRect(x1, y1, x2 - x1, y2 - y1);
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
  alpha = 0.28
) {
  ctx.save();
  ctx.fillStyle = `rgba(0,0,0,${alpha})`;
  ctx.beginPath();
  ctx.ellipse(x, y, w, h, 0, 0, Math.PI * 2);
  ctx.fill();
  ctx.restore();
}

// =========================
// BODY (BACK VERSION)
// =========================
function drawRambuttBackBody({
  ctx,
  x,
  y,
  time,
  scale,
}: MonsterBodyDrawArgs) {
  const bob = Math.sin(time * 2.0) * 1.1;
  const pixelSize = 3.5 * scale;

  const palette = {
    O: "#0a0502",
    F: "#c79055",
    L: "#e0b078",
    D: "#8d5b32",
    C: "#f2d1a3",
    H: "#c01919",
    G: "#ca5454",
    S: "#dfe7ef",
    M: "#1f2430",
    B: "#10151d",
    W: "#fff8e8",
    P: "#38404f",
    Q: "#697586",
    R: "#aab3c2",
  };

  const legFrame = Math.floor(time * 5.2) % 2;
  const earFrame = Math.floor(time * 4.2) % 2;
  const tailFrame = Math.floor(time * 5.8) % 2;

  // mirrored / back head (no face)
  const headRows = [
    ".......OOOOOOOOOOOOO........",
    ".....OOHHHHHHHHHHHHHOO......",
    "....OHHHHHHHHHHHHHHHHHO.....",
    "...OHHHHHHHHHHHHHHHHHHHO....",
    "..OHHHHHHHHHHHHHHHHHHHHHO...",
    "..OHHGGGGGGGGGGGGGGGGHHHO...",
    "...OFFFFFFFFFFFFFFFFFFFO....",
    "...OFFCCCCCCCCCCCCCCFFO.....",
    "...OFFCCCCCCCCCCCCCCFFO.....",
    "....OFCCCCCCCCCCCCCCFO......",
    ".....OOFCCCCCCCCCCFOO.......",
    ".......OOOOOOOOOOOO.........",
  ];

  const bodyRows = [
    ".......OOOOOOOOOOOOOOOOOOOOOOOOO.......",
    ".....OOFFFFFFFFFFFFFFFFFFFFFFFFFOO.....",
    "...OOFFFFFFFFFFFFFFFFFFFFFFFFFFFFFOO...",
    "..OFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFOO...",
    ".OFFFFFFLLLLLLLLLLLLLLLLLLLLLFFFFFFFO..",
    ".OFFFFFLLLLLLLLLLLLLLLLLLLLLLLLFFFFFO..",
    "OFFFFFLLLLLLLLLLLLLLLLLLLLLLLLLLFFFFFO.",
    "OFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFO.",
    "OFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFO.",
    "OFFFFFFFDDDDDDDOOOOOODDDDDDDDFFFFFFFO.",
    ".OFFFFFDDDDDDDDOOOOOODDDDDDDDFFFFFOO..",
    "..OFFFFDDDDDDDDOOOOOODDDDDDDFFFFFO....",
    "...OOFFFFFFFFFFFFFFFFFFFFFFFFFOOO......",
    ".....OOOOOOOOOOOOOOOOOOOOOOOOO........",
  ];

  const neckRows = [
    "....OOOOOOOOOOOO....",
    "..OOFFFFFFFFFFFFOO..",
    ".OFFFFFFFFFFFFFFFO..",
    ".OFFFFFFLLLLFFFFFFO.",
    ".OFFFFFFLLLLFFFFFFO.",
    ".OFFFFFFLLLLFFFFFFO.",
    ".OFFFFFLLLLLLFFFFFO.",
    "..OFFFFFFFFFFFFFOO..",
    "...OOOOOOOOOOOOO....",
  ];

  const shoulderPadRows = [
    "..PPPPPPPPPPPPPPPPPPPPPP..",
    ".PQQQQQQQQQPPQQQQQQQQQP.",
    "PQQRRRRRRQQPPQQRRRRRRQQP",
    "PQQRRRRRQQP..PQQRRRRRQQP",
    ".PQQQQQQPP....PPQQQQQQP.",
    "..PPPPPP........PPPPPP..",
  ];

  const leftHornRows = [
    "......SSSSSOO....",
    "....SSSSSSSSOO...",
    "...SSSS....SSO...",
    "..SSS.......SSO..",
    ".SSS........SSO..",
  ];

  const rightHornRows = [
    "....OOSSSSS......",
    "...OOSSSSSSSS....",
    "...OSS....SSSS...",
    "..OSS.......SSS..",
    "..OSS........SSS.",
  ];

  let tailRows =
    tailFrame === 0
      ? ["OOO....", "OFFO...", ".OFFO..", "..OOO.."]
      : [".OOO...", ".OFFO..", "OFFO...", "OOO...."];

  let frontLegRows =
    legFrame === 0
      ? [
          ".OOOOO....OOOOO.",
          "OFFFFO....OFFFFO",
          "ODDDOO....ODDDOO",
          ".OOOO......OOOO.",
          ".MMMM......MMMM.",
        ]
      : [
          "..OOOOO...OOOOO.",
          ".OFFFFO...OFFFFO",
          ".ODDDOO...ODDDOO",
          "..OOOO.....OOOO.",
          "..MMMM.....MMMM.",
        ];

  let backLegRows =
    legFrame === 0
      ? [
          ".OOOOO....OOOOO.",
          "OFFFFO....OFFFFO",
          "ODDDOO....ODDDOO",
          ".OOOO......OOOO.",
          ".MMMM......MMMM.",
        ]
      : [
          ".OOOOO...OOOOO..",
          "OFFFFO...OFFFFO.",
          "ODDDOO...ODDDOO.",
          ".OOOO.....OOOO..",
          ".MMMM.....MMMM..",
        ];

  ctx.save();
  ctx.translate(Math.round(x), Math.round(y + bob));

  drawShadow(ctx, 0, 58 * scale, 92 * scale, 17 * scale);

  // BACK DRAW ORDER (reversed)

  // head first (behind everything)
  drawPixelBlock(ctx, headRows, palette, -32, -5, pixelSize);

  drawPixelBlock(ctx, leftHornRows, palette, -38, -8, pixelSize);
  drawPixelBlock(ctx, rightHornRows, palette, -13, -8, pixelSize);

  drawPixelBlock(ctx, neckRows, palette, -28, 15, pixelSize);

  drawPixelBlock(ctx, shoulderPadRows, palette, -29, 8, pixelSize);

  drawPixelBlock(ctx, bodyRows, palette, -29, 12, pixelSize);

  // legs
  drawPixelBlock(ctx, backLegRows, palette, -24, 25, pixelSize);
  drawPixelBlock(ctx, frontLegRows, palette, -8, 24, pixelSize);

  // tail LAST (since it's visible in back)
  drawPixelBlock(ctx, tailRows, palette, 10, 18, pixelSize);

  ctx.restore();
}

// =========================
// FACE (NONE FOR BACK)
// =========================
function drawRambuttBackFace() {}

// =========================
// EXPORT
// =========================
export const rambuttBackMonster: MonsterDefinition = {
  id: "RAMBUTT_BACK",
  name: "Rambutt",
  imageSrc: "",
  baseHeight: 225,
  faceAnchor: { x: 0.5, y: 0.28 },
  homeOffsetX: 0,
  homeOffsetY: 75,
  battleOffsetX: 0,
  battleOffsetY: 250,
  drawBody: drawRambuttBackBody,
  drawFace: drawRambuttBackFace,
};