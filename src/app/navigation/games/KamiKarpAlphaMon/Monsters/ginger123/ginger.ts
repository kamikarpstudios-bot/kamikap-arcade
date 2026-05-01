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
  alpha = 0.24
) {
  ctx.save();
  ctx.fillStyle = `rgba(0,0,0,${alpha})`;
  ctx.beginPath();
  ctx.ellipse(x, y, w, h, 0, 0, Math.PI * 2);
  ctx.fill();
  ctx.restore();
}

// =========================
// BODY
// =========================
function drawGingerBody({ ctx, x, y, time, scale, blink }: MonsterBodyDrawArgs) {
  const bob = Math.sin(time * 1.8) * 1.8;
  const pixelSize = 3.5 * scale;

  const palette = {
    O: "#2a160e", // outline
    D: "#7a3417", // dark orange
    C: "#b8521f", // body orange
    G: "#e47a2d", // bright orange
    Y: "#ffb347", // warm glow
    W: "#fff1d6", // cream fur
    H: "#fff8ea", // hottest white
    R: "#ff5b1f", // hot flame orange-red
    F: "#ff8c1a", // flame orange
    L: "#ffd86b", // flame yellow
    S: "#fff4b8", // flame inner glow
    E: "#20110b", // eye
    P: "#f3d7ba", // paw
  };

  
  const tailFrame = Math.floor(((Math.sin(time * 1.9) + 1) / 2) * 3);


  const headRows = [
    "......OO.......OO........",
    ".....OCGCO...OCGCO......",
    ".....OCGGO...OGGCO.....",
    ".....OCGGGO.OGGGCO....",
    ".....OCGGGGOGGGGCO....",
    "....OCCCGGGGGGGCCCO....",
    "....OCCGGGGGGGGCCCO...",
    "...OCGGGGGGGGGGGGGCO...",
    "...OCGGWWWWWWWWWGGCO..",
    "...OCWWWWWWWWWWWWWCO..",
    "...OCWWWWWWWWWWWWWCO..",
    "...OCWWWWWWWWWWWWWCO..",
    "....OCGWWWWWWWWWGCO...",
    "....OCCGGWWWWWGGCCO...",
    "....OCCCGGGGGGGCCCO....",
    ".....OOCCCCCCCCCOO.....",
    ".......OOOCCCOOO.......",
  ];

  const bodyRows = [
    ".........OOCCCCOO.........",
    ".......OOCCGGGGCCOO.......",
    "......OCCGGGGGGGGCCO......",
    ".....OCCGGGGGGGGGGGCO.....",
    ".....OCGGGGWWWWGGGGCO.....",
    ".....OCGGCWWWWWWWGGCO....",
    ".....OCGCCCWWWWCCCGCO....",
    ".....OCGWWWWWWWWWWGCO....",
    ".....OCGWWWWWWWWWWGCO....",
    ".....OCGGWWWWWWWWGGCO....",
    ".....OCGGGGWWWWGGGGCO.....",
    ".....OCCGGGGGGGGGGCCO......",
    ".....OCCCGGGGGGGGCCCO.......",
    ".....OPCPCPCCCCPCPCPO.......",
    ".....OPPPPPOOOOPPPPPO........",
  ];

  const legRows = [
    "...OGGG........GGGO.....",
    "...OGCG........GCGO....",
    "...OGCO........OCGO....",
    "...OGCO........OCGO....",
    "...OGCO........OCGO...",
    "...OGCO........OCGO...",
    "...OCCO........OCCO...",
    "...OCCO........OCCO..",
    "..OPGPPO......OPGPPO..",
    "..OPPPPO......OPPPPO...",
  ];


  let tailRows: string[];
  if (tailFrame === 0) {
    tailRows = [
      ".................OOO...........",
      ".................OCGO..........",
      ".................OCGO..........",
      "................OCGO..........",
      "...............OCGO..........",
      "..............OCGO...........",
      ".............OCGO............",
      "............OCGO.............",
      "...........OCGO..............",
      "..........OCGO................",
      ".........OGCO..................",
    ];
  } else if (tailFrame === 1) {
    tailRows = [
      "..................OOO...........",
      "..................OCGO..........",
      "..................OCGO..........",
      ".................OCGO..........",
      "................OCGO..........",
      "...............OCGO...........",
      "..............OCGO............",
      ".............OCGO.............",
      "............OCGO..............",
      "...........OCGO................",
      "..........OGCO..................",
    ];
  } else {
    tailRows = [
      "...................OOO...........",
      "...................OCGO..........",
      "...................OCGO..........",
      "..................OCGO..........",
      ".................OCGO..........",
      "................OCGO...........",
      "...............OCGO............",
      "..............OCGO.............",
      ".............OCGO..............",
      "............OCGO................",
      "...........OGCO..................",
    ];
  }


  

  ctx.save();
  ctx.translate(Math.round(x), Math.round(y + bob));

  drawShadow(ctx, 0, 64 * scale, 82 * scale, 15 * scale, 0.22);

  // tail behind
  drawPixelBlock(ctx, tailRows, palette, 0, 20, pixelSize);

  // body stack
  drawPixelBlock(ctx, bodyRows, palette, -8, 18, pixelSize);
  drawPixelBlock(ctx, legRows, palette, -6, 25, pixelSize);
  drawPixelBlock(ctx, headRows, palette, -6, 2, pixelSize);

    const faceX = (-6 + 14) * pixelSize;
  const faceY = (2 + 2) * pixelSize;

drawGingerFace("HOME", {
  ctx,
  faceX,
  faceY,
  drawW: 0,
  drawH: 0,
  time,
  mouseX: 0,
  mouseY: 0,
  blink,
  yawn: 0,
});

  ctx.restore();
}

function drawGingerFace(
  _state: MonsterDrawArgs["state"],
  args: FaceDrawArgs
) {
  const { ctx, faceX, faceY, time, blink } = args;
  const pixelSize = 2.5;

  const palette = {
    E: "#20110b", // Eye/Line
    H: "#fff8ea", // Highlight
    N: "#f7c7b5", // Nose
  };

  ctx.save();
  ctx.translate(Math.round(faceX), Math.round(faceY));

  // --- BIGGER EYES ---
  // Increased to 3x3 for a more "anime" high-contrast look
  const leftEyeX = -6;
  const rightEyeX = 3;
  const eyeY = 7;

  if (blink > 0.5) {
    // Closed eye (flat line)
    px(ctx, leftEyeX, eyeY + 1, 3, 1, palette.E, pixelSize);
    px(ctx, rightEyeX, eyeY + 1, 3, 1, palette.E, pixelSize);
  } else {
    // Open eye (3x3 block)
    px(ctx, leftEyeX, eyeY, 3, 3, palette.E, pixelSize);
    px(ctx, rightEyeX, eyeY, 3, 3, palette.E, pixelSize);

    // Bigger highlight (top-left)
    px(ctx, leftEyeX, eyeY, 1, 1, palette.H, pixelSize);
    px(ctx, rightEyeX, eyeY, 1, 1, palette.H, pixelSize);
  }

  // --- NOSE & MOUTH (Centered) ---
  px(ctx, -1, 12, 2, 1, palette.N, pixelSize);
  px(ctx, -1, 13, 1, 1, palette.E, pixelSize);
  px(ctx, -2, 14, 4, 1, palette.E, pixelSize); // Simplified smile line

  // --- SWAYING WHISKERS ---
  // We root them near the nose (-1, 13) and use a sine wave for rotation
  const sway = Math.sin(time * 4) * 0.15; // Controls the angle of the sway

  const drawSwayingWhisker = (rootX: number, rootY: number, length: number, angleOffset: number) => {
    ctx.save();
    ctx.translate(rootX * pixelSize, rootY * pixelSize);
    ctx.rotate(sway + angleOffset);
    // Draw the whisker relative to its new local origin
    px(ctx, 0, 0, length, 1, palette.E, pixelSize);
    ctx.restore();
  };

  // Left Whiskers (Rooted at -2, 13)
  drawSwayingWhisker(-2, 13, -5, 0.2);  // Upper
  drawSwayingWhisker(-2, 14, -5, -0.1); // Lower

  // Right Whiskers (Rooted at 2, 13)
  drawSwayingWhisker(2, 13, 5, -0.2);   // Upper
  drawSwayingWhisker(2, 14, 5, 0.1);    // Lower

  ctx.restore();
}
// =========================
// EXPORT
// =========================
export const gingerMonster: MonsterDefinition = {
  id: "GINGER",
  name: "Ginger",
  imageSrc: "",
  baseHeight: 120,
  faceAnchor: { x: 0.235, y: 0.285 },
  homeOffsetX: 0,
  homeOffsetY: 5,
  battleOffsetX: 0,
  battleOffsetY: 235,
  loginOffsetX: 0,
  loginOffsetY: 0,
  drawBody: drawGingerBody,
  drawFace: drawGingerFace,
};