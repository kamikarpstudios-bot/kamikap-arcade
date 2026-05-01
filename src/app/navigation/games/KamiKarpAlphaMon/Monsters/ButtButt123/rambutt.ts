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
// BODY (RAMBUTT)
// =========================
function drawRambuttBody({
  ctx,
  x,
  y,
  time,
  scale,
  blink,
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
    "OFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFO.",
    "OFFFFFFFDDDDDDDOOOOOODDDDDDDDFFFFFFFO.",
    ".OFFFFFDDDDDDDDOOOOOODDDDDDDDFFFFFOO..",
    "..OFFFFDDDDDDDDOOOOOODDDDDDDFFFFFO....",
    "...OOFFFFFFFFFFFFFFFFFFFFFFFFFOOO......",
    ".....OOOOOOOOOOOOOOOOOOOOOOOOO........",
  ];

  const bellyRows = [
    "..OCCCCCCCCCCCCO....",
    ".OCCCCCCCCCCCCCCO...",
    "OCCCCCCCCCCCCCCCCO..",
    "OCCCFFFFFFFFFFCCCO..",
    ".OFFFFFFFFFFFFFFO...",
    "..OFFFFFFFFFFFFO....",
  ];

  const neckRows = [
    "....OOOOOOOOOOOO....",
    "..OOFFFFFFFFFFFFOO..",
    ".OFFFFFFFFFFFFFFFO..",
    ".OFFFFFFLLLLFFFFFFO.",
    ".OFFFFFFLLLLFFFFFFO.",
    ".OFFFFFFLLLLFFFFFFO.",
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

  const headRows = [
    "........OOOOOOOOOOOOO.......",
    "......OOHHHHHHHHHHHHHOO.....",
    ".....OHHHHHSSSSSHHHHHHO.....",
    "....OHHHHHHSSSSSHHHHHHHO....",
    "...OHHHHHHHSSSSSHHHHHHHHO...",
    "...OHHHGGGGSSSSSGGGGHHHHO...",
    "..OHHGGGGGGSSSSSGGGGGGHHHO..",
    "..OHGGGFFFFFFFFFFFFFGGGHHO..",
    "..OHGGFFFFFFFFFFFFFFFGGHHO..",
    "...OFFFFFFFFFFFFFFFFFFFOO...",
    "...OFFCCCCCCCCCCCCCCFFO.....",
    "...OFFCCCCCCCCCCCCCCFFO.....",
    "...OFFCCCCCCCCCCCCCCFFO.....",
    "....OFCCCCCCCCCCCCCCFO......",
    ".....OOFCCCCCCCCCCFOO.......",
    ".......OOOOOOOOOOOO.........",
  ];

  const leftHornRows = [
    "......SSSSSOO....",
    "....SSSSSSSSOO...",
    "...SSSS....SSO...",
    "..SSS.......SSO..",
    ".SSS........SSO..",
    ".SSS.......SSO...",
 
  ];

  const rightHornRows = [
    "....OOSSSSS......",
    "...OOSSSSSSSS....",
    "...OSS....SSSS...",
    "..OSS.......SSS..",
    "..OSS........SSS.",
    "...OSS.......SSS.",
  
  ];

  let leftEarRows: string[];
  let rightEarRows: string[];

  if (earFrame === 0) {
    leftEarRows = [
      "..OOO..",
      ".OFFO..",
      "OFFFO..",
      ".OFFO..",
      "..OO...",
    ];
    rightEarRows = [
      "..OOO..",
      "..OFFO.",
      "..OFFFO",
      "..OFFO.",
      "...OO..",
    ];
  } else {
    leftEarRows = [
      "...OO..",
      "..OFFO.",
      ".OFFFO.",
      "..OFFO.",
      "...OO..",
    ];
    rightEarRows = [
      "..OO...",
      ".OFFO..",
      ".OFFFO.",
      ".OFFO..",
      "..OO...",
    ];
  }

  let frontLegRows: string[];
  let backLegRows: string[];

  if (legFrame === 0) {
    frontLegRows = [
      ".OOOOO....OOOOO.",
      "OFFFFO....OFFFFO",
      "OFFFFO....OFFFFO",
      "OFFFFO....OFFFFO",
      "OFFFFO....OFFFFO",
      "OFFFFO....OFFFFO",
      "OFFFFO....OFFFFO",
      "OFFFFO....OFFFFO",
      "OFFFFO....OFFFFO",
      "ODDDOO....ODDDOO",
      "ODDDOO....ODDDOO",
      ".OOOO......OOOO.",
      ".MMMM......MMMM.",
    ];

    backLegRows = [
      ".OOOOO....OOOOO.",
      "OFFFFO....OFFFFO",
      "OFFFFO....OFFFFO",
      "OFFFFO....OFFFFO",
      "OFFFFO....OFFFFO",
      "OFFFFO....OFFFFO",
      "OFFFFO....OFFFFO",
      "ODDDOO....ODDDOO",
      "ODDDOO....ODDDOO",
      "ODDDOO....ODDDOO",
      ".OOOO......OOOO.",
      ".MMMM......MMMM.",
    ];
  } else {
    frontLegRows = [
      "..OOOOO...OOOOO.",
      ".OFFFFO...OFFFFO",
      ".OFFFFO...OFFFFO",
      ".OFFFFO...OFFFFO",
      ".OFFFFO...OFFFFO",
      ".OFFFFO...OFFFFO",
      ".OFFFFO...OFFFFO",
      ".OFFFFO...OFFFFO",
      ".OFFFFO...OFFFFO",
      ".ODDDOO...ODDDOO",
      ".ODDDOO...ODDDOO",
      "..OOOO.....OOOO.",
      "..MMMM.....MMMM.",
    ];

    backLegRows = [
      ".OOOOO...OOOOO..",
      "OFFFFO...OFFFFO.",
      "OFFFFO...OFFFFO.",
      "OFFFFO...OFFFFO.",
      "OFFFFO...OFFFFO.",
      "OFFFFO...OFFFFO.",
      "OFFFFO...OFFFFO.",
      "ODDDOO...ODDDOO.",
      "ODDDOO...ODDDOO.",
      "ODDDOO...ODDDOO.",
      ".OOOO.....OOOO..",
      ".MMMM.....MMMM..",
    ];
  }

  let tailRows: string[];
  if (tailFrame === 0) {
    tailRows = [
      "OOO....",
      "OFFO...",
      ".OFFO..",
      "..OOO..",
    ];
  } else {
    tailRows = [
      ".OOO...",
      ".OFFO..",
      "OFFO...",
      "OOO....",
    ];
  }

  const beardRows = [
    "..DDDDDD..",
    ".DDDDDDDD.",
    "..DDDDDD..",
    "...DDDD...",
    "....DD....",
  ];

  ctx.save();
  ctx.translate(Math.round(x), Math.round(y + bob));

  drawShadow(ctx, 0, 58 * scale, 92 * scale, 17 * scale, 0.28);

  // tail behind body
  drawPixelBlock(ctx, tailRows, palette, 10, 18, pixelSize);

  // far/back legs first
  drawPixelBlock(ctx, frontLegRows, palette, -8, 24, pixelSize);

  // thicker body
  drawPixelBlock(ctx, bodyRows, palette, -29, 12, pixelSize);
  drawPixelBlock(ctx, bellyRows, palette, -22, 10, pixelSize);

  // front legs over body
 
 drawPixelBlock(ctx, backLegRows, palette, -24, 25, pixelSize);
 

  // thick neck connecting body to head
  drawPixelBlock(ctx, neckRows, palette, -28, 9, pixelSize);
 // shoulder pads
  drawPixelBlock(ctx, shoulderPadRows, palette, -29, 11, pixelSize);
  drawPixelBlock(ctx, leftEarRows, palette, -34, 1, pixelSize);
  drawPixelBlock(ctx, rightEarRows, palette, -10, 1, pixelSize);

  // helmet/head
  drawPixelBlock(ctx, headRows, palette, -32, -5, pixelSize);
  // horns and ears attached to head position
  drawPixelBlock(ctx, leftHornRows, palette, -38, -8, pixelSize);
  drawPixelBlock(ctx, rightHornRows, palette, -13, -8, pixelSize);
    // face locked inside helmet/head
  const eyeY = 5;
  const leftEyeX = -24;
  const rightEyeX = -16;

  if (blink > 0.5) {
    px(ctx, leftEyeX, eyeY + 1, 3, 1, palette.M, pixelSize);
    px(ctx, rightEyeX, eyeY + 1, 3, 1, palette.M, pixelSize);
  } else {
    px(ctx, leftEyeX, eyeY, 3, 3, palette.M, pixelSize);
    px(ctx, rightEyeX, eyeY, 3, 3, palette.M, pixelSize);

    px(ctx, leftEyeX, eyeY, 1, 1, palette.W, pixelSize);
    px(ctx, rightEyeX, eyeY, 1, 1, palette.W, pixelSize);
  }

  // nose / mouth
  px(ctx, -22, 15, 5, 2, "#3b2717", pixelSize);
  px(ctx, -20, 17, 2, 1, palette.M, pixelSize);

  // helmet grill lined up to moved head
  px(ctx, -29, 5, 20, 1, palette.M, pixelSize);
  px(ctx, -28, 9, 18, 1, palette.M, pixelSize);
  px(ctx, -27, 3, 1, 8, palette.M, pixelSize);
  px(ctx, -22, 4, 1, 7, palette.M, pixelSize);
  px(ctx, -14, 4, 1, 7, palette.M, pixelSize);
  px(ctx, -10, 3, 1, 8, palette.M, pixelSize);

  // beard under helmet
  drawPixelBlock(ctx, beardRows, palette, -24, 11, pixelSize);

  ctx.restore();
}

// =========================
// FACE
// =========================
function drawRambuttFace(
  _state: MonsterDrawArgs["state"],
  args: FaceDrawArgs
) {
  const { ctx, faceX, faceY, blink } = args;
  const pixelSize = 3.5;

  ctx.save();
  ctx.translate(Math.round(faceX), Math.round(faceY));

  if (blink > 0.5) {
    px(ctx, -7, 11, 3, 1, "#10151d", pixelSize);
    px(ctx, 4, 11, 3, 1, "#10151d", pixelSize);
  } else {
    px(ctx, -7, 10, 3, 3, "#10151d", pixelSize);
    px(ctx, 4, 10, 3, 3, "#10151d", pixelSize);

    px(ctx, -7, 10, 1, 1, "#fff8e8", pixelSize);
    px(ctx, 4, 10, 1, 1, "#fff8e8", pixelSize);
  }

  px(ctx, -2, 20, 4, 2, "#3b2717", pixelSize);
  px(ctx, -1, 22, 2, 1, "#10151d", pixelSize);

  ctx.restore();
}

// =========================
// EXPORT
// =========================
export const rambuttMonster: MonsterDefinition = {
  id: "RAMBUTT",
  name: "Rambutt",
  imageSrc: "",
  baseHeight: 225,
  faceAnchor: { x: 0.5, y: 0.28 },
  homeOffsetX: 0,
  homeOffsetY: 75,
  battleOffsetX: 0,
  battleOffsetY: 250,
  drawBody: drawRambuttBody,
  drawFace: drawRambuttFace,
};