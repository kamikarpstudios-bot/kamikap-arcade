import {
  WORLD_WIDTH,
  WORLD_HEIGHT,
  WATER_ZONES,
  GRASS_ZONES,
  MOUNTAIN_WORLD_ZONES,
} from "../map/map";

type MiniMapPlayer = {
  x: number;
  y: number;
  facing?: string;
};

type MiniMapCamera = {
  x: number;
  y: number;
  zoom: number;
};

type MiniMapCabin = {
  x: number;
  y: number;
};

type MiniMapTree = {
  x: number;
  y: number;
};

export type DayNightPhase =
  | "day"
  | "sunset"
  | "night"
  | "sunrise";

type DayNightMiniMapInfo = {
  phase: DayNightPhase;
  cycleT: number;
  dayCount: number;
};

type DrawMiniMapArgs = {
  ctx: CanvasRenderingContext2D;
  x: number;
  y: number;
  width: number;
  height: number;
  canvasWidth: number;
  canvasHeight: number;
  player: MiniMapPlayer;
  camera: MiniMapCamera;
  cabin?: MiniMapCabin;
  trees?: MiniMapTree[];
  dayNight: DayNightMiniMapInfo;
};

function worldToMiniX(worldX: number, centerX: number, mapRadius: number) {
  return centerX + ((worldX / WORLD_WIDTH) - 0.5) * mapRadius * 2;
}

function worldToMiniY(worldY: number, centerY: number, mapRadius: number) {
  return centerY + ((worldY / WORLD_HEIGHT) - 0.5) * mapRadius * 2;
}

function roundRectPath(
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  w: number,
  h: number,
  r: number
) {
  const rr = Math.min(r, w * 0.5, h * 0.5);

  ctx.beginPath();
  ctx.moveTo(x + rr, y);
  ctx.lineTo(x + w - rr, y);
  ctx.quadraticCurveTo(x + w, y, x + w, y + rr);
  ctx.lineTo(x + w, y + h - rr);
  ctx.quadraticCurveTo(x + w, y + h, x + w - rr, y + h);
  ctx.lineTo(x + rr, y + h);
  ctx.quadraticCurveTo(x, y + h, x, y + h - rr);
  ctx.lineTo(x, y + rr);
  ctx.quadraticCurveTo(x, y, x + rr, y);
  ctx.closePath();
}

function fillRoundRect(
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  w: number,
  h: number,
  r: number,
  color: string | CanvasGradient
) {
  roundRectPath(ctx, x, y, w, h, r);
  ctx.fillStyle = color;
  ctx.fill();
}

function strokeRoundRect(
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  w: number,
  h: number,
  r: number,
  color: string,
  lineWidth = 1
) {
  roundRectPath(ctx, x, y, w, h, r);
  ctx.strokeStyle = color;
  ctx.lineWidth = lineWidth;
  ctx.stroke();
}

function drawSoftShadowCircle(
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  r: number,
  alpha = 0.18
) {
  const grad = ctx.createRadialGradient(
    x,
    y + 4,
    r * 0.15,
    x,
    y + 4,
    r * 1.25
  );
  grad.addColorStop(0, `rgba(0,0,0,${alpha})`);
  grad.addColorStop(1, "rgba(0,0,0,0)");
  ctx.fillStyle = grad;
  ctx.beginPath();
  ctx.arc(x, y + 4, r * 1.25, 0, Math.PI * 2);
  ctx.fill();
}

function drawWoodOrbFrame(
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  r: number
) {
  const wood = ctx.createLinearGradient(x, y - r, x, y + r);
  wood.addColorStop(0, "#8d5c36");
  wood.addColorStop(0.22, "#74482b");
  wood.addColorStop(0.52, "#5d3923");
  wood.addColorStop(0.8, "#7a4d2d");
  wood.addColorStop(1, "#4d2f1d");

  ctx.beginPath();
  ctx.arc(x, y, r + 1, 0, Math.PI * 2);
  ctx.fillStyle = "rgba(18,14,12,0.40)";
  ctx.fill();

  ctx.beginPath();
  ctx.arc(x, y, r, 0, Math.PI * 2);
  ctx.fillStyle = wood;
  ctx.fill();

  ctx.beginPath();
  ctx.arc(x, y, r - 3.5, 0, Math.PI * 2);
  ctx.strokeStyle = "rgba(255,225,190,0.16)";
  ctx.lineWidth = 1.5;
  ctx.stroke();

  ctx.beginPath();
  ctx.arc(x, y, r - 7, 0, Math.PI * 2);
  ctx.fillStyle = "rgba(17, 21, 19, 0.90)";
  ctx.fill();

  const gloss = ctx.createRadialGradient(
    x - r * 0.25,
    y - r * 0.34,
    r * 0.05,
    x - r * 0.25,
    y - r * 0.34,
    r * 0.7
  );
  gloss.addColorStop(0, "rgba(255,255,255,0.14)");
  gloss.addColorStop(0.32, "rgba(255,255,255,0.05)");
  gloss.addColorStop(1, "rgba(255,255,255,0)");
  ctx.fillStyle = gloss;
  ctx.beginPath();
  ctx.arc(x, y, r - 8, 0, Math.PI * 2);
  ctx.fill();
}

function drawZoneEllipse(
  ctx: CanvasRenderingContext2D,
  zone: { x: number; y: number; rx: number; ry: number; rotation: number },
  centerX: number,
  centerY: number,
  mapRadius: number
) {
  const zx = worldToMiniX(zone.x, centerX, mapRadius);
  const zy = worldToMiniY(zone.y, centerY, mapRadius);
  const zrx = (zone.rx / WORLD_WIDTH) * mapRadius * 2;
  const zry = (zone.ry / WORLD_HEIGHT) * mapRadius * 2;

  ctx.save();
  ctx.translate(zx, zy);
  ctx.rotate(zone.rotation);
  ctx.beginPath();
  ctx.ellipse(0, 0, zrx, zry, 0, 0, Math.PI * 2);
  ctx.fill();
  ctx.restore();
}

function drawMiniCabin(
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number
) {
  ctx.save();
  ctx.translate(x, y);

  ctx.fillStyle = "rgba(0,0,0,0.16)";
  ctx.beginPath();
  ctx.ellipse(1, 4, 7, 3, 0, 0, Math.PI * 2);
  ctx.fill();

  ctx.fillStyle = "#6f4630";
  ctx.beginPath();
  ctx.moveTo(-7, 0);
  ctx.lineTo(0, -6);
  ctx.lineTo(8, 0);
  ctx.lineTo(5, 2);
  ctx.lineTo(-5, 2);
  ctx.closePath();
  ctx.fill();

  ctx.fillStyle = "#9b6c46";
  ctx.fillRect(-5, 2, 10, 8);

  ctx.fillStyle = "#34221b";
  ctx.fillRect(-1.5, 5, 3, 5);

  ctx.strokeStyle = "rgba(36,22,16,0.70)";
  ctx.lineWidth = 1;
  ctx.strokeRect(-5, 2, 10, 8);

  ctx.beginPath();
  ctx.moveTo(-7, 0);
  ctx.lineTo(0, -6);
  ctx.lineTo(8, 0);
  ctx.stroke();

  ctx.restore();
}

function drawMiniTree(
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number
) {
  ctx.save();
  ctx.translate(x, y);

  ctx.fillStyle = "rgba(0,0,0,0.14)";
  ctx.beginPath();
  ctx.ellipse(0.5, 2.5, 3.2, 1.8, 0, 0, Math.PI * 2);
  ctx.fill();

  ctx.fillStyle = "#4f7c52";
  ctx.beginPath();
  ctx.arc(0, 0, 2.8, 0, Math.PI * 2);
  ctx.fill();

  ctx.fillStyle = "#6c9a63";
  ctx.beginPath();
  ctx.arc(-0.8, -0.8, 1.2, 0, Math.PI * 2);
  ctx.fill();

  ctx.fillStyle = "#6a4b34";
  ctx.fillRect(-0.6, 1.6, 1.2, 2.2);

  ctx.restore();
}

function drawSunIcon(
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  radius = 6
) {
  ctx.beginPath();
  ctx.arc(x, y, radius, 0, Math.PI * 2);
  ctx.fillStyle = "#f7d77e";
  ctx.fill();

  ctx.strokeStyle = "rgba(255,243,204,0.55)";
  ctx.lineWidth = 1.25;
  ctx.stroke();

  for (let i = 0; i < 8; i++) {
    const a = (i / 8) * Math.PI * 2;
    ctx.beginPath();
    ctx.moveTo(x + Math.cos(a) * (radius + 2), y + Math.sin(a) * (radius + 2));
    ctx.lineTo(x + Math.cos(a) * (radius + 5), y + Math.sin(a) * (radius + 5));
    ctx.strokeStyle = "rgba(255,228,151,0.75)";
    ctx.lineWidth = 1.1;
    ctx.stroke();
  }
}

function drawMoonIcon(
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  radius = 6
) {
  ctx.beginPath();
  ctx.arc(x, y, radius, 0, Math.PI * 2);
  ctx.fillStyle = "#e7edf7";
  ctx.fill();

  ctx.beginPath();
  ctx.arc(x + 2.5, y - 0.5, radius - 1, 0, Math.PI * 2);
  ctx.fillStyle = "rgba(76, 94, 124, 0.92)";
  ctx.fill();
}
function drawSunMoonTracker(
  ctx: CanvasRenderingContext2D,
  cx: number,
  cy: number,
  radius: number,
  dayNight: DayNightMiniMapInfo
) {
  const trackRadius = radius;
  const trackCY = cy + 60;

  const startA = Math.PI * -0.82;
  const endA = Math.PI * -0.18;
  const angle = startA + (endA - startA) * dayNight.cycleT;

  ctx.strokeStyle = "rgba(245,222,190,0.20)";
  ctx.lineWidth = 2.2;
  ctx.beginPath();
  ctx.arc(cx, trackCY, trackRadius, startA, endA, false);
  ctx.stroke();

  const px = cx + Math.cos(angle) * trackRadius;
  const py = trackCY + Math.sin(angle) * trackRadius;

  if (
    dayNight.phase === "day" ||
    dayNight.phase === "sunrise" ||
    dayNight.phase === "sunset"
  ) {
    drawSunIcon(ctx, px, py, 7);
  } else {
    drawMoonIcon(ctx, px, py, 7);
  }
}

function drawDayNightSlider(
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  width: number,
  height: number,
  dayNight: DayNightMiniMapInfo
) {
  const radius = height / 2;

  fillRoundRect(ctx, x, y, width, height, radius, "rgba(34,22,15,0.72)");
  strokeRoundRect(ctx, x, y, width, height, radius, "rgba(255,220,180,0.12)", 1.2);

  const innerX = x + 2;
  const innerY = y + 2;
  const innerW = width - 4;
  const innerH = height - 4;

  const grad = ctx.createLinearGradient(innerX, innerY, innerX + innerW, innerY);
  grad.addColorStop(0.0, "#22324d");
  grad.addColorStop(0.16, "#526b93");
  grad.addColorStop(0.30, "#e7a77d");
  grad.addColorStop(0.45, "#f2dfaa");
  grad.addColorStop(0.60, "#cfe2b3");
  grad.addColorStop(0.76, "#e8a08b");
  grad.addColorStop(0.90, "#556084");
  grad.addColorStop(1.0, "#22324d");

  fillRoundRect(ctx, innerX, innerY, innerW, innerH, radius - 2, grad);

  const shadowGloss = ctx.createLinearGradient(x, y, x, y + height);
  shadowGloss.addColorStop(0, "rgba(255,255,255,0.08)");
  shadowGloss.addColorStop(0.45, "rgba(255,255,255,0.02)");
  shadowGloss.addColorStop(1, "rgba(0,0,0,0.16)");
  fillRoundRect(ctx, innerX, innerY, innerW, innerH, radius - 2, shadowGloss);

  const markerX = x + width * dayNight.cycleT;
  const markerY = y + height / 2;

  ctx.strokeStyle = "rgba(255,248,236,0.95)";
  ctx.lineWidth = 2;
  ctx.beginPath();
  ctx.moveTo(markerX, y - 2);
  ctx.lineTo(markerX, y + height + 2);
  ctx.stroke();

  if (
    dayNight.phase === "day" ||
    dayNight.phase === "sunrise" ||
    dayNight.phase === "sunset"
  ) {
    drawSunIcon(ctx, markerX, markerY, 4);
  } else {
    drawMoonIcon(ctx, markerX, markerY, 4);
  }
}

export function drawMiniMap({
  ctx,
  x,
  y,
  width,
  height,
  canvasWidth,
  canvasHeight,
  player,
  camera,
  cabin,
  trees = [],
  dayNight,
}: DrawMiniMapArgs) {
  const cx = x + width / 2;
  const cy = y + height / 2;
  const orbR = Math.min(width, height) * 0.5 - 8;
  const mapRadius = orbR - 10;

  ctx.save();

  drawSoftShadowCircle(ctx, cx, cy, orbR, 0.18);
  drawWoodOrbFrame(ctx, cx, cy, orbR);

  ctx.save();
  ctx.beginPath();
  ctx.arc(cx, cy, mapRadius, 0, Math.PI * 2);
  ctx.clip();

  const landGrad = ctx.createLinearGradient(
    cx,
    cy - mapRadius,
    cx,
    cy + mapRadius
  );
  landGrad.addColorStop(0, "#b9d9aa");
  landGrad.addColorStop(1, "#8eb681");
  ctx.fillStyle = landGrad;
  ctx.beginPath();
  ctx.arc(cx, cy, mapRadius, 0, Math.PI * 2);
  ctx.fill();

  ctx.fillStyle = "rgba(255,255,255,0.06)";
  ctx.beginPath();
  ctx.ellipse(cx - 18, cy - 16, 40, 18, -0.2, 0, Math.PI * 2);
  ctx.fill();

  ctx.beginPath();
  ctx.ellipse(cx + 20, cy + 24, 34, 16, 0.18, 0, Math.PI * 2);
  ctx.fill();

  ctx.fillStyle = "rgba(255,255,255,0.08)";
  for (const zone of GRASS_ZONES) {
    drawZoneEllipse(ctx, zone, cx, cy, mapRadius);
  }

  if (MOUNTAIN_WORLD_ZONES.length > 0) {
    ctx.fillStyle = "#88909b";
    drawZoneEllipse(ctx, MOUNTAIN_WORLD_ZONES[0], cx, cy, mapRadius);
  }
  if (MOUNTAIN_WORLD_ZONES.length > 1) {
    ctx.fillStyle = "#737c87";
    drawZoneEllipse(ctx, MOUNTAIN_WORLD_ZONES[1], cx, cy, mapRadius);
  }
  if (MOUNTAIN_WORLD_ZONES.length > 2) {
    ctx.fillStyle = "#5f6973";
    drawZoneEllipse(ctx, MOUNTAIN_WORLD_ZONES[2], cx, cy, mapRadius);
  }

  ctx.fillStyle = "#79b5df";
  for (const zone of WATER_ZONES) {
    drawZoneEllipse(ctx, zone, cx, cy, mapRadius);
  }

  ctx.fillStyle = "rgba(255,255,255,0.10)";
  for (const zone of WATER_ZONES) {
    const zx = worldToMiniX(zone.x, cx, mapRadius);
    const zy = worldToMiniY(zone.y, cy, mapRadius);
    const zrx = (zone.rx / WORLD_WIDTH) * mapRadius * 2 * 0.65;
    const zry = (zone.ry / WORLD_HEIGHT) * mapRadius * 2 * 0.45;

    ctx.save();
    ctx.translate(zx - zrx * 0.1, zy - zry * 0.1);
    ctx.rotate(zone.rotation);
    ctx.beginPath();
    ctx.ellipse(0, 0, zrx, zry, 0, 0, Math.PI * 2);
    ctx.fill();
    ctx.restore();
  }

  for (const tree of trees) {
    const tx = worldToMiniX(tree.x, cx, mapRadius);
    const ty = worldToMiniY(tree.y, cy, mapRadius);
    drawMiniTree(ctx, tx, ty);
  }

  if (cabin) {
    const cabinX = worldToMiniX(cabin.x, cx, mapRadius);
    const cabinY = worldToMiniY(cabin.y, cy, mapRadius);
    drawMiniCabin(ctx, cabinX, cabinY);
  }

  const viewWorldW = canvasWidth / camera.zoom;
  const viewWorldH = canvasHeight / camera.zoom;

  const camLeft = camera.x - viewWorldW / 2;
  const camTop = camera.y - viewWorldH / 2;

  const camMiniX = worldToMiniX(camLeft, cx, mapRadius);
  const camMiniY = worldToMiniY(camTop, cy, mapRadius);
  const camMiniW = (viewWorldW / WORLD_WIDTH) * mapRadius * 2;
  const camMiniH = (viewWorldH / WORLD_HEIGHT) * mapRadius * 2;

  strokeRoundRect(
    ctx,
    camMiniX,
    camMiniY,
    camMiniW,
    camMiniH,
    4,
    "rgba(255,248,238,0.82)",
    1.1
  );

  const px = worldToMiniX(player.x, cx, mapRadius);
  const py = worldToMiniY(player.y, cy, mapRadius);

  ctx.fillStyle = "#fff3da";
  ctx.beginPath();
  ctx.arc(px, py, 3.5, 0, Math.PI * 2);
  ctx.fill();

  ctx.strokeStyle = "#3d2a21";
  ctx.lineWidth = 1;
  ctx.stroke();

  if (player.facing) {
    let dirX = 0;
    let dirY = 0;

    switch (player.facing) {
      case "up":
        dirY = -1;
        break;
      case "down":
        dirY = 1;
        break;
      case "left":
        dirX = -1;
        break;
      case "right":
        dirX = 1;
        break;
      case "up-left":
        dirX = -0.7;
        dirY = -0.7;
        break;
      case "up-right":
        dirX = 0.7;
        dirY = -0.7;
        break;
      case "down-left":
        dirX = -0.7;
        dirY = 0.7;
        break;
      case "down-right":
        dirX = 0.7;
        dirY = 0.7;
        break;
    }

    ctx.strokeStyle = "rgba(61,42,33,0.85)";
    ctx.lineWidth = 1.25;
    ctx.beginPath();
    ctx.moveTo(px, py);
    ctx.lineTo(px + dirX * 7, py + dirY * 7);
    ctx.stroke();
  }

  ctx.restore();

  ctx.beginPath();
  ctx.arc(cx, cy, mapRadius, 0, Math.PI * 2);
  ctx.strokeStyle = "rgba(255,255,255,0.12)";
  ctx.lineWidth = 1.35;
  ctx.stroke();

  drawSunMoonTracker(ctx, cx, cy - orbR - 8, orbR * 0.92, dayNight);

  const sliderW = orbR * 1.45;
  const sliderH = 12;
  const sliderX = cx - sliderW / 2;
  const sliderY = cy + orbR + 6;

  drawDayNightSlider(ctx, sliderX, sliderY, sliderW, sliderH, dayNight);

  ctx.fillStyle = "#f3e2c7";
  ctx.font = "bold 11px sans-serif";
  ctx.textAlign = "center";
  ctx.textBaseline = "middle";
  ctx.fillText(`DAY ${dayNight.dayCount}`, cx, cy + orbR + 30);

  ctx.restore();
}