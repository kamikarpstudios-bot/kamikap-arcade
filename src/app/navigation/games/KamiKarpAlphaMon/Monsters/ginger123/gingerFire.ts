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
function drawGingerFireBody({
  ctx,
  x,
  y,
  time,
  scale,
  blink,
}: MonsterBodyDrawArgs) {
  const bob = Math.sin(time * 1.65) * 1.6;
  const pixelSize = 3.5 * scale;

  const palette = {
    O: "#2a160e", // outline
    B: "#7a3417", // dark orange
    C: "#b8521f", // orange stripe
    G: "#de7c30", // fur orange
    Y: "#ffbc63", // warm bright
    W: "#fff0d7", // cream fur
    H: "#fff9ee", // highlight
    R: "#ff5a1f", // flame red
    F: "#ff8a18", // flame orange
    L: "#ffd65d", // flame yellow
    S: "#fff6be", // flame center
    E: "#20110b", // eye / line
    P: "#f0d4b1", // paw
  };

  const flameFrame = Math.floor(((Math.sin(time * 2.2) + 1) / 2) * 3);

  const headRows = [
        ".......OO.....OO.........",
        "......OCGO...OCGO........",
        "......OCGO...OCGO........",
        "......OCGGO.OCGGO........",
        "......OCGGOOCCGGO........",
        "......OCCCCCCCCCCO.......",
        ".....OCCCGGGGGCCCCO......",
        "....OCCGGGGGGGGCCCCO.....",
        "...OWWWWWWWWWGGGCCCO.....",
        "..OOOWWWWWWWWWWWCCCO.....",
        "..OOOWWWWWWWWWWCCCCO.....",
        "..OGGGWWWWWWWCCCCCCO.....",
        "...OGGGWWWWCCCCCCO.......",
        "....OCCCCCCCCCCCOO.......",
        "......OOOOOCCCOO.........",
      
  ];

  const bodyRows = [
      "...OOOOOOOOOO.................................",
    "....OOOBBBBBBBBBOOO..............................",
    "...OBBBBBBBBBBBBBBBOOOOOOOOOOOO................",
    "..BBBBBBCCCCCCCCCCCCCCCCBBBGGGOOO...........",
    "..BBBBCCCCWWWWWWWWCCCCCCCCBBBGGGGO..........",
    "..BBBCCCCWWWWWWWWWWWWCCCCCCBBBBGGGO......",
    "..BGCCCCCCWWWWWWWWCCCCCCCCCBBBBGGGO.....",
    "..OGGCCCCCCCCWWWWWCCCCCCCCCGGGGGGGGO....",
    "..OGGGGCCCCCCCCCCCCCCCCCCCCGGGGGGGGO...",
    "..OGGGGGGGCCCGCCCCCCCCCCCCCCCGGGGGO....",
    "...OOOOOOOOOOGCCCOOOOOOOBBBBBBGGGO.....",
    "....CCCCCO..OGCCO..OBBBBO.OOGGBBB.......",
    "......OBBO...OGGO...OBBBO..OGGBO.........",
    "......OBBO...OGGO....OBBBO..OGGBO.......",
    "......OBBO...OGGO.....OBBBO..OGGBO......",
    "......OBBO...OGGO......OBBBO..OGBO......",
    "......OBCO...OGGO......OBBBO..OGBO......",
    "......OGCO...OGGO......OGBO..OGBO......",
    "......OGCO...OGGO......OGBO..OGBO.......",
    "......OOOO...OOOO.....OOOO..OOOO........",
    ".....OOOOO..OOOOO....OOOO..OOOO........",
  ];

  let tailRows: string[];
    if (flameFrame === 0) {
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
  } else if (flameFrame === 1) {
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

  drawShadow(ctx, 0, 100 * scale, 110 * scale, 18 * scale, 0.22);

  // tail first
  drawPixelBlock(ctx, tailRows, palette, 9, 7, pixelSize);

  // body
  drawPixelBlock(ctx, bodyRows, palette, -10, 15, pixelSize);

  // head
  drawPixelBlock(ctx, headRows, palette, -18, 5, pixelSize);

  const faceX = (-10 + 19) * pixelSize;
  const faceY = (0 + 4) * pixelSize;

  drawGingerFireFace("HOME", {
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
function drawGingerFireFace(
  _state: MonsterDrawArgs["state"],
  args: FaceDrawArgs
) {
  const { ctx, faceX, faceY, time, blink } = args;
  const pixelSize = 3.5;

  const palette = {
    E: "#20110b",
    H: "#fff8ea",
    N: "#f7c7b5",
  };

  ctx.save();
  ctx.translate(Math.round(faceX), Math.round(faceY));

  // =========================
  // SINGLE EYE (SIDE VIEW) - Your Perfect Eye
  // =========================
  const eyeX = -25; 
  const eyeY = 11;

  if (blink > 0.5) {
    px(ctx, eyeX, eyeY + 1, 3, 1, palette.E, pixelSize);
  } else {
    px(ctx, eyeX, eyeY, 3, 3, palette.E, pixelSize);
    px(ctx, eyeX, eyeY, 1, 1, palette.H, pixelSize);
  }

  // =========================
  // NOSE (Shifted to align with eye front)
  // =========================
  // Moved closer to the eye's X-axis for a tighter profile
  const noseX = eyeX + -9; 
  const noseY = eyeY + 4;
  px(ctx, noseX, noseY, 2, 1, palette.N, pixelSize);     // Nose bridge
  px(ctx, noseX, noseY + 1, 1, 1, palette.E, pixelSize); // Nostril detail

  // =========================
  // MOUTH (Gritty profile smirk)
  // =========================
  const mouthX = noseX + 1;
  const mouthY = noseY + 2;
  px(ctx, mouthX, mouthY, 2, 1, palette.E, pixelSize);     // Upper lip line
  px(ctx, mouthX + 1, mouthY + 1, 2, 1, palette.E, pixelSize); // Lower jaw curve

  // =========================
  // SINGLE WHISKER SET (Rooted Sway)
  // =========================
  // Rooted near the nose/mouth junction
  const rootX = noseX + 1;
  const rootY = noseY + 1;
  const sway = Math.sin(time * 4) * 0.12; // Smooth sway

  const drawSwayingWhisker = (rx: number, ry: number, length: number, angle: number) => {
    ctx.save();
    ctx.translate(rx * pixelSize, ry * pixelSize);
    ctx.rotate(sway + angle);
    px(ctx, 0, 0, length, 1, palette.E, pixelSize);
    ctx.restore();
  };

  // Top Whisker
  drawSwayingWhisker(rootX, rootY, 6, -0.15);
  // Bottom Whisker
  drawSwayingWhisker(rootX, rootY + 1, 5, 0.15);

  ctx.restore();
}
// =========================
// EXPORT
// =========================
export const gingerFireMonster: MonsterDefinition = {
  id: "GINGER_FIRE",
  name: "Gingerfire",
  imageSrc: "",
  baseHeight: 230,
  faceAnchor: { x: 0.35, y: 0.34 },
  homeOffsetX: 0,
  homeOffsetY: 7,
  battleOffsetX: 0,
  battleOffsetY: 270,
  drawBody: drawGingerFireBody,
  drawFace: drawGingerFireFace,
};