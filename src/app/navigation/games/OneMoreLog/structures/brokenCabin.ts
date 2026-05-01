function toneColor(hex: string, shadowAmount = 0, fireLightAmount = 0) {
  const clean = hex.replace("#", "");
  const num = parseInt(clean, 16);

  let r = (num >> 16) & 255;
  let g = (num >> 8) & 255;
  let b = num & 255;

  const darkT = Math.max(0, Math.min(1, 1 - shadowAmount));
  r = Math.round(r * darkT);
  g = Math.round(g * darkT);
  b = Math.round(b * darkT);

  r = Math.min(255, Math.round(r + 90 * fireLightAmount));
  g = Math.min(255, Math.round(g + 55 * fireLightAmount));
  b = Math.min(255, Math.round(b + 10 * fireLightAmount));

  return `rgb(${r}, ${g}, ${b})`;
}

function drawPlank(
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  w: number,
  h: number,
  color: string,
  rotation = 0
) {
  ctx.save();
  ctx.translate(x, y);
  ctx.rotate(rotation);

  ctx.fillStyle = color;
  ctx.fillRect(-w / 2, -h / 2, w, h);

  ctx.strokeStyle = "rgba(40,20,10,0.35)";
  ctx.lineWidth = 1;
  ctx.strokeRect(-w / 2, -h / 2, w, h);

  ctx.beginPath();
  ctx.moveTo(-w * 0.35, -h * 0.2);
  ctx.lineTo(w * 0.35, -h * 0.2);
  ctx.moveTo(-w * 0.28, h * 0.12);
  ctx.lineTo(w * 0.2, h * 0.12);
  ctx.strokeStyle = "rgba(80,45,25,0.28)";
  ctx.stroke();

  ctx.restore();
}

function drawBrokenWindow(
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  w: number,
  h: number
) {
  ctx.fillStyle = "#1c140f";
  ctx.fillRect(x, y, w, h);

  ctx.strokeStyle = "#4b2f1b";
  ctx.lineWidth = 2;
  ctx.strokeRect(x, y, w, h);

  ctx.strokeStyle = "#8a5a34";
  ctx.lineWidth = 2;

  ctx.beginPath();
  ctx.moveTo(x + w * 0.48, y);
  ctx.lineTo(x + w * 0.44, y + h * 0.42);

  ctx.moveTo(x, y + h * 0.52);
  ctx.lineTo(x + w * 0.35, y + h * 0.5);

  ctx.moveTo(x + w * 0.45, y + h * 0.45);
  ctx.lineTo(x + w, y + h * 0.18);

  ctx.moveTo(x + w * 0.44, y + h * 0.45);
  ctx.lineTo(x + w * 0.18, y + h);

  ctx.stroke();

  ctx.fillStyle = "rgba(170, 210, 220, 0.18)";
  ctx.beginPath();
  ctx.moveTo(x + w * 0.1, y + h * 0.1);
  ctx.lineTo(x + w * 0.35, y + h * 0.2);
  ctx.lineTo(x + w * 0.16, y + h * 0.38);
  ctx.closePath();
  ctx.fill();

  ctx.beginPath();
  ctx.moveTo(x + w * 0.66, y + h * 0.62);
  ctx.lineTo(x + w * 0.9, y + h * 0.76);
  ctx.lineTo(x + w * 0.75, y + h * 0.92);
  ctx.closePath();
  ctx.fill();
}

function drawGrassClump(
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  scale = 1
) {
  ctx.save();
  ctx.translate(x, y);
  ctx.scale(scale, scale);

  const blades = [
    { x: -7, h: 12, lean: -0.25 },
    { x: -2, h: 16, lean: -0.08 },
    { x: 3, h: 14, lean: 0.12 },
    { x: 8, h: 11, lean: 0.28 },
  ];

  for (const blade of blades) {
    ctx.beginPath();
    ctx.moveTo(blade.x, 0);
    ctx.quadraticCurveTo(
      blade.x + blade.lean * 10,
      -blade.h * 0.5,
      blade.x + blade.lean * 14,
      -blade.h
    );
    ctx.strokeStyle = "#557a32";
    ctx.lineWidth = 2;
    ctx.lineCap = "round";
    ctx.stroke();
  }

  ctx.restore();
}

export function getBrokenCabinCollisionBounds(x: number, y: number) {
  return {
    x: x - 48,
    y: y - 24,
    width: 96,
    height: 24,
  };
}

function getPlayerFeet(playerX: number, playerY: number) {
  return {
    x: playerX,
    y: playerY + 28,
  };
}

export function isPlayerBehindBrokenCabin(
  cabinX: number,
  cabinY: number,
  playerX: number,
  playerY: number
) {
  const feet = getPlayerFeet(playerX, playerY);

  const aboveFront = feet.y < cabinY - 10;
  const withinCabinWidth = Math.abs(feet.x - cabinX) < 58;

  return aboveFront && withinCabinWidth;
}

function drawBrokenCabinFrontWall(
  ctx: CanvasRenderingContext2D,
  left: number,
  top: number,
  cabinW: number,
  fireLightAmount = 0
) {
  const plankColors = [
    toneColor("#7a5232", 0, fireLightAmount),
    toneColor("#845937", 0, fireLightAmount),
    toneColor("#6f492d", 0, fireLightAmount),
    toneColor("#8c603c", 0, fireLightAmount),
  ];
  const plankXs = [
    left + 12,
    left + 26,
    left + 41,
    left + 57,
    left + 72,
    left + 88,
    left + 103,
  ];

  plankXs.forEach((px, i) => {
    const heightOffset = [0, 5, -2, 3, -6, 7, -1][i];
    drawPlank(
      ctx,
      px,
      top + 54 + heightOffset * 0.3,
      11,
      66 + heightOffset,
      plankColors[i % plankColors.length],
      (i % 2 === 0 ? -1 : 1) * 0.015
    );
  });

  drawPlank(
    ctx,
    left + 5,
    top + 50,
    9,
    74,
    toneColor("#5b3b24", 0, fireLightAmount),
    -0.08
  );
  drawPlank(
    ctx,
    left + cabinW - 3,
    top + 52,
    8,
    72,
    toneColor("#5a3823", 0, fireLightAmount),
    0.12
  );

  const doorX = left + 24;
  const doorY = top + 44;
  const doorW = 26;
  const doorH = 42;

  ctx.fillStyle = toneColor("#241710", 0, fireLightAmount);
  ctx.fillRect(doorX, doorY, doorW, doorH);

  ctx.save();
  ctx.translate(doorX + 2, doorY + 4);
  ctx.rotate(-0.42);
    ctx.fillStyle = toneColor("#7c5534", 0, fireLightAmount);
  ctx.fillRect(0, 0, 18, 36);
  ctx.strokeStyle = "rgba(50,25,15,0.4)";
  ctx.lineWidth = 1;
  ctx.strokeRect(0, 0, 18, 36);

  ctx.beginPath();
  ctx.moveTo(2, 8);
  ctx.lineTo(16, 20);
  ctx.moveTo(2, 28);
  ctx.lineTo(16, 12);
  ctx.stroke();
  ctx.restore();

  drawBrokenWindow(ctx, left + 67, top + 40, 28, 22);

  drawPlank(
    ctx,
    left + 86,
    top + 78,
    40,
    6,
    toneColor("#5e3d28", 0, fireLightAmount),
    -0.18
  );
  drawPlank(
    ctx,
    left + 56,
    top + 33,
    24,
    7,
    toneColor("#946640", 0, fireLightAmount),
    0.12
  );
  drawPlank(
    ctx,
    left + 76,
    top + 28,
    18,
    6,
    toneColor("#8b5f3d", 0, fireLightAmount),
    -0.08
  );

  ctx.fillStyle = "#bfa58f";
  ctx.beginPath();
  ctx.arc(left + 47, top + 34, 1.1, 0, Math.PI * 2);
  ctx.arc(left + 65, top + 31, 1.1, 0, Math.PI * 2);
  ctx.arc(left + 82, top + 29, 1.1, 0, Math.PI * 2);
  ctx.fill();

  ctx.fillStyle = `rgba(0,0,0,${Math.max(0.04, 0.12 - fireLightAmount * 0.05)})`;
  ctx.fillRect(left + 5, top + 23, cabinW - 8, 9);
}

function drawBrokenCabinArt(
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  time: number,
  fireLightAmount = 0
) {
  const sway = Math.sin(time * 1.2) * 0.6;

  const cabinW = 120;
  const cabinH = 86;
  const left = x - cabinW / 2;
  const top = y - cabinH;

  // back wall silhouette
  ctx.fillStyle = toneColor("#6c472d", 0, fireLightAmount);
  ctx.fillRect(left + 8, top + 18, cabinW - 18, cabinH - 18);

  // roof / cabin body
  ctx.fillStyle = toneColor("#4b3120", 0, fireLightAmount);
  ctx.beginPath();
  ctx.moveTo(left - 8, top + 20);
  ctx.lineTo(x - 8, top - 16 + sway);
  ctx.lineTo(left + cabinW + 14, top + 14);
  ctx.lineTo(left + cabinW - 4, top + 27);
  ctx.lineTo(left + 6, top + 28);
  ctx.closePath();
  ctx.fill();

  ctx.fillStyle = toneColor("#6d4630", 0, fireLightAmount);
  ctx.beginPath();
  ctx.moveTo(left - 6, top + 22);
  ctx.lineTo(x - 10, top - 18 + sway);
  ctx.lineTo(x + 8, top + 10);
  ctx.lineTo(left + 10, top + 30);
  ctx.closePath();
  ctx.fill();

  ctx.fillStyle = toneColor("#7c5035", 0, fireLightAmount);
  ctx.beginPath();
  ctx.moveTo(x - 4, top - 12 + sway);
  ctx.lineTo(left + cabinW + 14, top + 13);
  ctx.lineTo(left + cabinW - 4, top + 28);
  ctx.lineTo(x + 28, top + 18);
  ctx.lineTo(x + 14, top + 2);
  ctx.closePath();
  ctx.fill();
  ctx.beginPath();
  ctx.moveTo(x + 14, top + 0);
  ctx.lineTo(x + 28, top + 18);
  ctx.lineTo(x + 18, top + 22);
  ctx.lineTo(x + 3, top + 7);
  ctx.closePath();
  ctx.fillStyle = toneColor("#21150f", 0, fireLightAmount);
  ctx.fill();

  ctx.strokeStyle = "rgba(40,20,12,0.28)";
  ctx.lineWidth = 2;
  for (let i = 0; i < 6; i++) {
    const rx = left + 6 + i * 20;
    ctx.beginPath();
    ctx.moveTo(rx, top + 24);
    ctx.lineTo(rx + 14, top + 6);
    ctx.stroke();
  }

  ctx.save();
  ctx.translate(left + 28, top + 4);
  ctx.rotate(-0.08);
  ctx.fillStyle = toneColor("#7a6d62", 0, fireLightAmount);
  ctx.fillRect(-7, -18, 14, 24);
  ctx.fillStyle = toneColor("#64594f", 0, fireLightAmount);
  ctx.fillRect(-9, -20, 18, 5);
  ctx.restore();

  ctx.fillStyle = "rgba(120,120,120,0.16)";
  ctx.beginPath();
  ctx.ellipse(
    left + 26,
    top - 26 + Math.sin(time * 1.6) * 1.5,
    6,
    4,
    0,
    0,
    Math.PI * 2
  );
  ctx.fill();

  ctx.beginPath();
  ctx.ellipse(
    left + 22,
    top - 34 + Math.sin(time * 1.25 + 0.8) * 1.8,
    8,
    5,
    0,
    0,
    Math.PI * 2
  );
  ctx.fill();

  drawBrokenCabinFrontWall(ctx, left, top, cabinW, fireLightAmount);
}

export function drawBrokenCabin(
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  time: number,
  playerX?: number,
  playerY?: number,
  fireLightAmount = 0
) {
  const cabinW = 120;
  const left = x - cabinW / 2;

  const behind =
    playerX !== undefined && playerY !== undefined
      ? isPlayerBehindBrokenCabin(x, y, playerX, playerY)
      : false;

  // ground shadow
  ctx.beginPath();
  ctx.ellipse(x + 4, y + 6, 82, 20, -0.06, 0, Math.PI * 2);
  ctx.fillStyle = "rgba(0,0,0,0.18)";
  ctx.fill();

  // foundation stones
  ctx.fillStyle = "#5e5c57";
  ctx.fillRect(left + 10, y - 2, 24, 8);
  ctx.fillRect(left + 40, y + 1, 18, 7);
  ctx.fillRect(left + 70, y, 22, 8);
  ctx.fillRect(left + 98, y - 1, 14, 7);

  // full cabin only when player is NOT behind it
  if (!behind) {
    drawBrokenCabinArt(ctx, x, y, time, fireLightAmount);
  }

  // ground clutter
  drawGrassClump(ctx, left + 6, y + 2, 1.1);
  drawGrassClump(ctx, left + 18, y + 4, 0.8);
  drawGrassClump(ctx, left + 58, y + 6, 1.2);
  drawGrassClump(ctx, left + 102, y + 3, 0.9);

  ctx.fillStyle = "#6b472c";
  ctx.fillRect(left + cabinW + 16, y - 4, 16, 8);
  ctx.beginPath();
  ctx.ellipse(left + cabinW + 16, y, 4, 4, 0, 0, Math.PI * 2);
  ctx.fillStyle = "#8a603c";
  ctx.fill();
}

export function drawBrokenCabinFrontOverlay(
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  time: number,
  playerX: number,
  playerY: number,
  fireLightAmount = 0
) {
  const behind = isPlayerBehindBrokenCabin(x, y, playerX, playerY);
  if (!behind) return;

  ctx.save();
  ctx.globalAlpha *= 0.9;
  drawBrokenCabinArt(ctx, x, y, time, fireLightAmount);
  ctx.restore();
}