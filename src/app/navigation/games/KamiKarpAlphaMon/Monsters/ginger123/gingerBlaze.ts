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
function drawGingerBlazeBody({
  ctx,
  x,
  y,
  time,
  scale,
  blink,
}: MonsterBodyDrawArgs) {
  const bob = Math.sin(time * 1.45) * 1.8;
  const pixelSize = 3.4 * scale;

  const palette = {
    O: "#26120d", // outline
    B: "#6f2d15", // deep dark orange
    C: "#a9441c", // stripe orange
    G: "#de6e24", // main fur
    Y: "#ffb14d", // bright warm
    W: "#fff1dc", // cream fur
    H: "#fff9ef", // highlight
    R: "#ff4a1f", // flame red
    F: "#ff8618", // flame orange
    L: "#ffd45d", // flame yellow
    S: "#fff4b8", // flame core
    E: "#1d0f0a", // eyes / lines
    P: "#f0ceb0", // paw / nose
  };

  const flameFrame = Math.floor(((Math.sin(time * 2.1) + 1) / 2) * 3);

  // =========================
  // HEAD
  // =========================
  const headRows = [
    ".......OO..............OO...............",
    "........OCGO........OCGO..............",
    "........OCGGO......OCGGO.............",
    ".........OCGGO.....OCGGO.............",
    ".........OCGGGO...OCGGGO.............",
    ".........OCGGGGO.OCGGGGO.............",
    ".........OCCCCCCCCCCCCCCO............",
    "........OCCCGGGGGGGGGCCCCO...........",
    ".......OCCGGGGGGGGGGGGCCCCO..........",
    "......OCCGGGGGGGGGGGGGGCCCO..........",
    ".....OWWWWWWWWWWWGGGGGGCCCO..........",
    ".....OOOOWWWWWWWWWWWWGCCCCO..........",
    ".....OOOGWWWWWWWWWWWWCCCCCO..........",
    ".....OGGGGWWWWWWWWCCCCCCCCO..........",
    ".......OGGGGGWWWWWCCCCCCCCO...........",
    "........OCCCCCCCCCCCCCCCCO............",
    "..........OOOCCCCCCCCCCOO..............",
    "............OOOOOOOOOOO................",
  ];

  // =========================
  // BODY
  // =========================
  const bodyRows = [
    "........OOOOOOOOOOOO............................................",
    "......OOOBBBBBBBBBBBOOO.........................................",
    "....OOBBBBBBBBBBBBBBBBBOO.......................................",
    "...OBBBBBCCCCCCCCCCCCCCBBBBOOOO................................",
    "..OBBBBCCCCCCCCCCCCCCCCCCCCBBBOOO..............................",
    "..BBBBCCCCWWWWWWWWWWCCCCCCCCBBBGGOO............................",
    ".OBBBCCCCWWWWWWWWWWWWWWCCCCCCBBBBGGO...........................",
    ".OBBCCCCWWWWWWWWWWWWWWWWCCCCCCBBBBGGO..........................",
    ".OBGCCCCCCWWWWWWWWWWWWCCCCCCCCBBBBGGO.........................",
    ".OGGGCCCCCCCCWWWWWWWWWCCCCCCCCCGGGGGO........................",
    ".OGGGGGCCCCCCCCCCCCCCCCCCCCCCCCGGGGGO.......................",
    ".OGGGGGGGGCCCCCCCCCCCCCCCCCCCCCGGGGGO.......................",
    "..OGGGGGGGGGCCCGGGCCCCCCCCCCCCCCGGGGO........................",
    "...OOOOOOOOOOGCCCGOOOOOOOOBBBBBBGGGO.........................",
    ".....OCCCCCO.OGCCO..OOBBBO..OOGGGBBO..........................",
    "......OCCCO..OGGO....OBBBO...OGGGBO............................",
    ".......OBBO..OGGO.....OBBBO...OGGBO............................",
    ".......OBBO..OGGO......OBBBO..OGGBO............................",
    ".......OBBO..OGGO......OBBBO..OGGBO............................",
    ".......OBCO..OGGO.......OBBBO.OGGBO............................",
    ".......OGCO..OGGO.......OGBBO.OGBO.............................",
    ".......OGCO..OGGO.......OGBO..OGBO.............................",
    ".......OOOO..OOOO......OOOO..OOOO..............................",
    "......OOOOO.OOOOO.....OOOO..OOOO...............................",
  ];

  // =========================
  // TAIL
  // =========================
  let tailRows: string[];
  if (flameFrame === 0) {
    tailRows = [
      "............................OOO................",
      "...........................OCRFO...............",
      "..........................OCRFFLO..............",
      ".........................OCRFFFLLO.............",
      "........................OCRFFFLLSO.............",
      ".......................OCRFFFLLSSO.............",
      "......................OCRFFFLLSSSO.............",
      ".....................OCRFFFLLSSSO..............",
      "....................OCGFFFLLSSSO...............",
      "...................OCGFFLLSSSO.................",
      "..................OCGFFLLSSO...................",
      ".................OCGFFLLSO.....................",
      "................OCGFFLLO.......................",
      "...............OCGFFLO.........................",
      "..............OGGFO............................",
    ];
  } else if (flameFrame === 1) {
    tailRows = [
      ".............................OOO...............",
      "............................OCRFO..............",
      "...........................OCRFFLO.............",
      "..........................OCRFFFLLO............",
      ".........................OCRFFFLLSO............",
      "........................OCRFFFLLSSO............",
      ".......................OCRFFFLLSSSO............",
      "......................OCRFFFLLSSSO.............",
      ".....................OCGFFFLLSSSO..............",
      "....................OCGFFLLSSSO................",
      "...................OCGFFLLSSO..................",
      "..................OCGFFLLSO....................",
      ".................OCGFFLLO......................",
      "................OCGFFLO........................",
      "...............OGGFO...........................",
    ];
  } else {
    tailRows = [
      "..............................OOO..............",
      ".............................OCRFO.............",
      "............................OCRFFLO............",
      "...........................OCRFFFLLO...........",
      "..........................OCRFFFLLSO...........",
      ".........................OCRFFFLLSSO...........",
      "........................OCRFFFLLSSSO...........",
      ".......................OCRFFFLLSSSO............",
      "......................OCGFFFLLSSSO.............",
      ".....................OCGFFLLSSSO...............",
      "....................OCGFFLLSSO.................",
      "...................OCGFFLLSO...................",
      "..................OCGFFLLO.....................",
      ".................OCGFFLO.......................",
      "................OGGFO..........................",
    ];
  }

  ctx.save();
  ctx.translate(Math.round(x), Math.round(y + bob));

  drawShadow(ctx, 6 * scale, 110 * scale, 132 * scale, 20 * scale, 0.24);

  // tail first
  drawPixelBlock(ctx, tailRows, palette, 9, 15, pixelSize);

  // body
  drawPixelBlock(ctx, bodyRows, palette, -8, 20, pixelSize);

  // head
  drawPixelBlock(ctx, headRows, palette, -20, 9, pixelSize);

  const faceX = (-20 + 24) * pixelSize;
  const faceY = (2 + 5) * pixelSize;

  drawGingerBlazeFace("HOME", {
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

// =========================
// FACE
// =========================
function drawGingerBlazeFace(
  _state: MonsterDrawArgs["state"],
  args: FaceDrawArgs
) {
  const { ctx, faceX, faceY, time, blink } = args;
  const pixelSize = 3.4;

  const palette = {
    E: "#1d0f0a",
    H: "#fff8ea",
    N: "#f3bfa8",
  };

  ctx.save();
  ctx.translate(Math.round(faceX), Math.round(faceY));

  // eye
  const eyeX = -17;
  const eyeY = 20;

  if (blink > 0.5) {
    px(ctx, eyeX, eyeY + 1, 4, 1, palette.E, pixelSize);
  } else {
    px(ctx, eyeX, eyeY, 4, 4, palette.E, pixelSize);
    px(ctx, eyeX, eyeY, 1, 1, palette.H, pixelSize);
    px(ctx, eyeX + 1, eyeY, 1, 1, palette.H, pixelSize);
  }

  // brow / fierce look
  px(ctx, eyeX - 1, eyeY - 2, 5, 1, palette.E, pixelSize);

  // nose
  const noseX = eyeX - 10;
  const noseY = eyeY + 5;
  px(ctx, noseX, noseY, 2, 1, palette.N, pixelSize);
  px(ctx, noseX, noseY + 1, 1, 1, palette.E, pixelSize);




  // whiskers
  const rootX = noseX + 1;
  const rootY = noseY + 1;
  const sway = Math.sin(time * 4.2) * 0.12;

  const drawSwayingWhisker = (
    rx: number,
    ry: number,
    length: number,
    angle: number
  ) => {
    ctx.save();
    ctx.translate(rx * pixelSize, ry * pixelSize);
    ctx.rotate(sway + angle);
    px(ctx, 0, 0, length, 1, palette.E, pixelSize);
    ctx.restore();
  };

  drawSwayingWhisker(rootX, rootY, 7, -0.18);
  drawSwayingWhisker(rootX, rootY + 1, 6, 0.16);

  ctx.restore();
}

// =========================
// EXPORT
// =========================
export const gingerBlazeMonster: MonsterDefinition = {
  id: "GINGER_BLAZE",
  name: "Gingerblaze",
  imageSrc: "",
  baseHeight: 255,
  faceAnchor: { x: 0.33, y: 0.31 },
  homeOffsetX: 0,
  homeOffsetY: 0,
  battleOffsetX: 0,
  battleOffsetY: 255,
  drawBody: drawGingerBlazeBody,
  drawFace: drawGingerBlazeFace,
};