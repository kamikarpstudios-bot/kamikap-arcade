import {
  FaceDrawArgs,
  MonsterDefinition,
  MonsterDrawArgs,
  MonsterBodyDrawArgs,
} from "../monsterTypes";

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
  alpha = 0.22
) {
  ctx.save();
  ctx.fillStyle = `rgba(0,0,0,${alpha})`;
  ctx.beginPath();
  ctx.ellipse(x, y, w, h, 0, 0, Math.PI * 2);
  ctx.fill();
  ctx.restore();
}

function drawMiniBolt(
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  pixelSize: number,
  colorA: string,
  colorB: string
) {
  const bolt = [".A.", "AA.", ".AB", ".BB", "BB."];
  drawPixelBlock(ctx, bolt, { A: colorA, B: colorB }, x, y, pixelSize);
}

function clamp(value: number, min: number, max: number) {
  return Math.max(min, Math.min(max, value));
}

function drawSparkyBody({ ctx, x, y, time, scale }: MonsterBodyDrawArgs) {
  const bob = Math.sin(time * 2.2) * 2;
  const basePixelSize = 3.2;
  const pixelSize = basePixelSize * scale;
  const wagFrame = Math.sin(time * 5.2) > 0 ? 1 : 0;
  const earFrame = Math.sin(time * 3.4) > 0 ? 1 : 0;
  const isBlinking = Math.sin(time * 6) > 0.92;

const palette = {
  O: "#2b4f8f",
  B: "#6ea6ff",
  C: "#8dc2ff",
  W: "#f7fbff",
  Y: "#ffd84d",
  G: "#fff3a8",
  N: "#101820",
  E: "#142033", // 👈 ADD THIS (eye color)
};

  const bodyRows = [
    "...........OOO.............",
    "........OOCCCCOO..........",
    "......OOCCCCCCCCOO........",
    ".....OCCCCCCCCCCCCO.......",
    "....OCCCCCCCCCCCCCCOO.....",
    "...OCCCCCCWWWWWCCCCCCO....",
    "...OCCCCCWWWWWWWWCCCCCO...",
    "..OCCCCCCWWWWWWWWWCCCCO...",
    "..OCCCCCCCCWWWWWWCCCCCO...",
    "..OCCCCCCCCCCCCCCCCCCCO...",
    "...OCCCCCCCCCCCCCCCCCO....",
    "...OOCCCCCCCCCCCCCCOO.....",
    "....OCCCBOOOOOBCCCO.......",
    "....OCCBO....OBCCO........",
    "....OCCBO....OBCCO........",
    "....OCCBO....OBCCO........",
    "...OOOWWO....OWWOO........",
    "...OOWWWW....WWWWO........",
    "...OOYYOO....OOYYO........",
  ];

  const headRows = earFrame
    ? [
        ".......OO.....OO.........",
        "......OCCO...OCCO........",
        "......OCCCO.OCCCO........",
        "......OCCOOOCCCCO........",
        ".....OCCCCCCCCCCCO.......",
        "....OCCCCWWWWCCCCCO......",
        "...OCCCWWWWWWWWCCCCO.....",
        "..OCCCWWWWWWWWWWCCCO.....",
        "OOOOWWWWWWWWWWWWCCCO.....",
        "ONNNWWWWWWWWWWWWCCCO.....",
        "OYYYYWWWWWWWWCCCCCCO.....",
        ".OCCCCWWWWWWCCCCCO.......",
        "..OOCCCCCCCCCCCCOO.......",
        "....OOOCCCCCCOOO.........",
        "......OOOOOOOO..........",
      ]
    : [
        "..........OO....OO.......",
        "........OCCO..OCCO.......",
        ".......OCCCO.OCCCO.......",
        ".....OCCCCOOOCCCCO.......",
        "....OCCCCCCCCCCCCCO......",
        "...OCCCCWWWWWWCCCCCO.....",
        "..OCCCWWWWWWWWWWCCCCO....",
        "OOOOWWWWWWWWWWWWCCCO.....",
        "ONNNWWWWWWWWWWWWCCCO.....",
        "OYYYYWWWWWWWWWWWCCCO.....",
        ".OCNNNNWWWWWWCCCCCCO.....",
        "..OCNNNNNWWWWCCCCCO......",
        "...OOCCCCCCCCCCCCOO......",
        ".....OOOCCCCCCOOO........",
        ".......OOOOOOOOO.........",
      ];

  const tailRows =
    wagFrame === 0
      ? [
          "....OO....",
          "...OCCOO..",
          "..OCCCCOO.",
          ".OCCCCCCOO",
          "..OOCCCCCO",
          "....OOCCCO",
          "......OOOO",
        ]
      : [
          ".......OO.",
          ".....OOCCO",
          "...OOCCCCO",
          ".OOCCCCCCO",
          "..OOCCCCO.",
          "....OOOO..",
        ];

  ctx.save();
  ctx.translate(Math.round(x), Math.round(y + bob));

  drawShadow(ctx, 0, 30 * scale, 48 * scale, 11 * scale, 0.2);

  drawPixelBlock(ctx, tailRows, palette, 8, 9, pixelSize);
  drawPixelBlock(ctx, bodyRows, palette, -10, 2, pixelSize);
  drawPixelBlock(ctx, headRows, palette, -20, -6, pixelSize);
  // =========================
// PIXEL EYE (SIDE FACING)
// =========================

// head origin is (-20, -6)
// we offset from that
const eyeX = -10;   // tweak this
const eyeY = -1;  // tweak this

if (isBlinking) {
  px(ctx, eyeX, eyeY, 3, 1, palette.E, pixelSize);
} else {
  px(ctx, eyeX, eyeY, 2, 2, palette.E, pixelSize); // main eye
  px(ctx, eyeX, eyeY, 1, 1, palette.W, pixelSize); // highlight
}


  drawMiniBolt(ctx, 1, 8, pixelSize, palette.Y, palette.G);

  if (Math.sin(time * 8) > -0.15) {
    drawMiniBolt(ctx, -48, -18, pixelSize, palette.Y, palette.G);
  }
  if (Math.sin(time * 7 + 1.1) > 0.1) {
    drawMiniBolt(ctx, 42, -10, pixelSize, palette.Y, palette.G);
  }

  ctx.restore();
}

function drawEye(
  ctx: CanvasRenderingContext2D,
  cx: number,
  cy: number,
  size: number,
  open: number
) {
  const clampedOpen = clamp(open, 0, 1);

  if (clampedOpen < 0.14) {
    ctx.fillStyle = "#142033";
    ctx.fillRect(
      Math.round(cx - size),
      Math.round(cy),
      Math.round(size * 2),
      Math.max(1, Math.round(size * 0.35))
    );
    return;
  }

  const eyeH = Math.max(2, Math.round(size * (1.2 * clampedOpen)));

  ctx.fillStyle = "#142033";
  ctx.fillRect(
    Math.round(cx - size),
    Math.round(cy - eyeH / 2),
    Math.round(size * 2),
    eyeH
  );

  ctx.fillStyle = "#ffffff";
  ctx.fillRect(
    Math.round(cx - size * 0.35),
    Math.round(cy - eyeH / 2 + 1),
    Math.max(1, Math.round(size * 0.45)),
    Math.max(1, Math.round(size * 0.45))
  );
}

function drawSparkyFace(
  state: MonsterDrawArgs["state"],
  { ctx, faceX, faceY, drawW, drawH, blink, yawn, mouseX, mouseY }: FaceDrawArgs
) {
  const scale = drawW * 0.01;
  const eyeBaseSize = Math.max(2, Math.round(drawW * 0.015));

  const lookX = clamp((mouseX - faceX) * 0.015, -2.5 * scale, 2.5 * scale);
  const lookY = clamp((mouseY - faceY) * 0.01, -1.5 * scale, 1.5 * scale);

  const eyeOffsetX = drawW * 0.052;
  const eyeY = faceY - drawH * 0.005 + lookY;

  const blinkAmt = clamp(blink, 0, 1);
  const yawnAmt = clamp(yawn, 0, 1);

  // staggered eye close so they don't shut identically
  let leftEyeOpen = 1;
  let rightEyeOpen = 1;

  if (state === "SLEEP") {
    leftEyeOpen = 0;
    rightEyeOpen = 0;
  } else if (state === "PAIN") {
    leftEyeOpen = 0.2;
    rightEyeOpen = 0.08;
  } else {
    leftEyeOpen = clamp(1 - blinkAmt * 1.25, 0, 1);
    rightEyeOpen = clamp(1 - Math.max(0, (blinkAmt - 0.18) * 1.5), 0, 1);

    // slight sleepy squint while mouth opens
    leftEyeOpen = Math.max(0, leftEyeOpen - yawnAmt * 0.25);
    rightEyeOpen = Math.max(0, rightEyeOpen - yawnAmt * 0.18);
  }

  ctx.save();

  // snout
  ctx.fillStyle = "#f7fbff";
  ctx.fillRect(
    Math.round(faceX - 3.5 * scale),
    Math.round(faceY + drawH * 0.05 - 1 * scale),
    Math.round(7 * scale),
    Math.round(4.5 * scale)
  );

  // nose
  ctx.fillStyle = "#121820";
  ctx.fillRect(
    Math.round(faceX - 1.2 * scale),
    Math.round(faceY + drawH * 0.05 - 1.2 * scale),
    Math.round(2.4 * scale),
    Math.round(1.4 * scale)
  );

  // eyes
  drawEye(
    ctx,
    faceX - eyeOffsetX + lookX,
    eyeY,
    eyeBaseSize,
    leftEyeOpen
  );

  drawEye(
    ctx,
    faceX + eyeOffsetX + lookX,
    eyeY,
    eyeBaseSize,
    rightEyeOpen
  );

  // mouth
  const mouthX = faceX + 0.4 * scale;
  const mouthY = faceY + drawH * 0.11;

  if (state === "SLEEP") {
    ctx.fillStyle = "#142033";
    ctx.fillRect(
      Math.round(mouthX - 2.2 * scale),
      Math.round(mouthY),
      Math.round(4.4 * scale),
      Math.max(1, Math.round(0.8 * scale))
    );
  } else if (yawnAmt > 0.12) {
    const mouthW = 4.5 * scale + yawnAmt * 3.5 * scale;
    const mouthH = 1.4 * scale + yawnAmt * 4.6 * scale;

    ctx.fillStyle = "#1b0d18";
    ctx.fillRect(
      Math.round(mouthX - mouthW / 2),
      Math.round(mouthY - 0.3 * scale),
      Math.max(2, Math.round(mouthW)),
      Math.max(2, Math.round(mouthH))
    );

    if (yawnAmt > 0.45) {
      ctx.fillStyle = "#ff7fa8";
      ctx.fillRect(
        Math.round(mouthX - 1.2 * scale),
        Math.round(mouthY + mouthH * 0.32),
        Math.max(1, Math.round(2.4 * scale)),
        Math.max(1, Math.round(1.6 * scale))
      );
    }
  } else if (state === "PAIN") {
    ctx.fillStyle = "#142033";
    ctx.fillRect(
      Math.round(mouthX - 2.6 * scale),
      Math.round(mouthY + 0.2 * scale),
      Math.round(5.2 * scale),
      Math.max(1, Math.round(0.9 * scale))
    );
  } else {
    ctx.fillStyle = "#142033";
    ctx.fillRect(
      Math.round(mouthX - 2.2 * scale),
      Math.round(mouthY),
      Math.round(4.4 * scale),
      Math.max(1, Math.round(0.8 * scale))
    );
  }

  ctx.restore();
}

export const sparkyMonster: MonsterDefinition = {
  id: "SPARKY",
  name: "Sparky",
  baseHeight: 180,
  faceAnchor: { x: 0.235, y: 0.285 },
  homeOffsetX: 0,
  homeOffsetY: 80,
  battleOffsetX: 0,
  battleOffsetY: 80,
  loginOffsetX: 0,
  loginOffsetY: 0,
  drawBody: drawSparkyBody,
  drawFace: drawSparkyFace,
};