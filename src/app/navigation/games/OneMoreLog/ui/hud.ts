type HandsState = {
  left: string | null;
  right: string | null;
};

type SurvivalState = {
  health: number;
  hunger: number;
  thirst: number;
};

type CampfireCardState = {
  x: number;
  y: number;
  fuel: number;
  lit: boolean;
  ingredient: string | null;
  burnTimeRemaining: number;
  burnTimeMax: number;
};
type CraftingCardRecipe = {
  id: string;
  name: string;
  description: string;
  requirements: Partial<
    Record<"stick" | "stone" | "charcoal" | "bark" | "rope", number>
  >;
};

type DrawCraftingTableCardArgs = {
  ctx: CanvasRenderingContext2D;
  canvasWidth: number;
  canvasHeight: number;
  camera: { x: number; y: number };
  zoom: number;
  worldX: number;
  worldY: number;
  recipes: CraftingCardRecipe[];
  selectedIndex: number;
  pantry: Record<"stick" | "stone" | "charcoal" | "bark" | "rope", number>;
};

function clamp(value: number, min: number, max: number) {
  return Math.max(min, Math.min(max, value));
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

function createWoodGradient(
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  w: number,
  h: number
) {
  const grad = ctx.createLinearGradient(x, y, x, y + h);
  grad.addColorStop(0, "#8a5a34");
  grad.addColorStop(0.22, "#74492b");
  grad.addColorStop(0.5, "#5f3b24");
  grad.addColorStop(0.78, "#7a4d2d");
  grad.addColorStop(1, "#4f311f");
  return grad;
}

function drawWoodGrainLines(
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  w: number,
  h: number,
  alpha = 0.14
) {
  ctx.save();
  roundRectPath(ctx, x, y, w, h, 18);
  ctx.clip();

  ctx.strokeStyle = `rgba(255, 214, 170, ${alpha})`;
  ctx.lineWidth = 1;

  for (let i = 0; i < 7; i++) {
    const yy = y + 8 + i * (h / 7);
    ctx.beginPath();
    ctx.moveTo(x + 8, yy);
    ctx.bezierCurveTo(
      x + w * 0.25,
      yy - 3,
      x + w * 0.6,
      yy + 4,
      x + w - 8,
      yy - 2
    );
    ctx.stroke();
  }

  ctx.restore();
}

function drawWoodPanel(
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  w: number,
  h: number,
  radius = 18
) {
  const shadow = ctx.createRadialGradient(
    x + w / 2,
    y + h / 2 + 10,
    12,
    x + w / 2,
    y + h / 2 + 10,
    w * 0.8
  );
  shadow.addColorStop(0, "rgba(0,0,0,0.18)");
  shadow.addColorStop(1, "rgba(0,0,0,0)");
  ctx.fillStyle = shadow;
  ctx.beginPath();
  ctx.ellipse(
    x + w / 2,
    y + h / 2 + 10,
    w * 0.48,
    h * 0.64,
    0,
    0,
    Math.PI * 2
  );
  ctx.fill();

  fillRoundRect(ctx, x, y, w, h, radius, createWoodGradient(ctx, x, y, w, h));
  drawWoodGrainLines(ctx, x + 2, y + 2, w - 4, h - 4, 0.12);

  strokeRoundRect(ctx, x, y, w, h, radius, "rgba(46,25,15,0.65)", 2.2);
  strokeRoundRect(
    ctx,
    x + 2,
    y + 2,
    w - 4,
    h - 4,
    radius - 2,
    "rgba(255,220,180,0.14)",
    1
  );
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

function drawGlassOrbFrame(
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  r: number,
  rimTop: string,
  rimBottom: string
) {
  const wood = ctx.createLinearGradient(x, y - r, x, y + r);
  wood.addColorStop(0, "#8d5c36");
  wood.addColorStop(0.25, "#74482b");
  wood.addColorStop(0.55, "#5d3923");
  wood.addColorStop(0.8, "#7a4d2d");
  wood.addColorStop(1, "#4d2f1d");

  ctx.beginPath();
  ctx.arc(x, y, r, 0, Math.PI * 2);
  ctx.fillStyle = "rgba(22,18,16,0.40)";
  ctx.fill();

  ctx.beginPath();
  ctx.arc(x, y, r - 1, 0, Math.PI * 2);
  ctx.fillStyle = wood;
  ctx.fill();

  ctx.beginPath();
  ctx.arc(x, y, r - 4, 0, Math.PI * 2);
  ctx.strokeStyle = "rgba(255,220,180,0.18)";
  ctx.lineWidth = 1.4;
  ctx.stroke();

  const innerRim = ctx.createLinearGradient(x, y - r, x, y + r);
  innerRim.addColorStop(0, rimTop);
  innerRim.addColorStop(1, rimBottom);

  ctx.beginPath();
  ctx.arc(x, y, r - 7, 0, Math.PI * 2);
  ctx.fillStyle = "rgba(20, 22, 28, 0.9)";
  ctx.fill();

  ctx.beginPath();
  ctx.arc(x, y, r - 8.5, 0, Math.PI * 2);
  ctx.strokeStyle = "rgba(255,255,255,0.08)";
  ctx.lineWidth = 1.2;
  ctx.stroke();

  const gloss = ctx.createRadialGradient(
    x - r * 0.28,
    y - r * 0.36,
    r * 0.05,
    x - r * 0.28,
    y - r * 0.36,
    r * 0.78
  );
  gloss.addColorStop(0, "rgba(255,255,255,0.18)");
  gloss.addColorStop(0.35, "rgba(255,255,255,0.06)");
  gloss.addColorStop(1, "rgba(255,255,255,0)");
  ctx.fillStyle = gloss;
  ctx.beginPath();
  ctx.arc(x, y, r - 9, 0, Math.PI * 2);
  ctx.fill();
}

function drawValueOnOrb(
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  label: string,
  value: number
) {
  ctx.fillStyle = "#fff8ee";
  ctx.textAlign = "center";
  ctx.textBaseline = "middle";

  ctx.font = "bold 10px sans-serif";
  ctx.fillText(label, x, y - 10);

  ctx.font = "bold 16px sans-serif";
  ctx.fillText(`${Math.round(value)}`, x, y + 10);
}

function drawWaterOrb(
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  r: number,
  value: number,
  time: number
) {
  drawSoftShadowCircle(ctx, x, y, r);
  drawGlassOrbFrame(ctx, x, y, r, "#b7d9ea", "#739db8");

  const innerR = r - 8;
  const fillT = clamp(value / 100, 0, 1);
  const liquidTop = y + innerR - innerR * 2 * fillT;

  ctx.save();
  ctx.beginPath();
  ctx.arc(x, y, innerR, 0, Math.PI * 2);
  ctx.clip();

  const waterGrad = ctx.createLinearGradient(x, liquidTop, x, y + innerR);
  waterGrad.addColorStop(0, "rgba(153, 222, 246, 0.95)");
  waterGrad.addColorStop(0.65, "rgba(91, 176, 221, 0.98)");
  waterGrad.addColorStop(1, "rgba(52, 128, 187, 1)");

  ctx.beginPath();
  ctx.moveTo(x - innerR, y + innerR);
  for (let i = 0; i <= 24; i++) {
    const t = i / 24;
    const px = x - innerR + t * innerR * 2;
    const py =
      liquidTop +
      Math.sin(time * 2.7 + t * 7.4) * 2.8 +
      Math.sin(time * 4.3 + t * 14.2) * 1.4;
    ctx.lineTo(px, py);
  }
  ctx.lineTo(x + innerR, y + innerR);
  ctx.closePath();
  ctx.fillStyle = waterGrad;
  ctx.fill();

  ctx.strokeStyle = "rgba(255,255,255,0.30)";
  ctx.lineWidth = 1.5;
  ctx.beginPath();
  for (let i = 0; i <= 24; i++) {
    const t = i / 24;
    const px = x - innerR + t * innerR * 2;
    const py =
      liquidTop +
      Math.sin(time * 2.7 + t * 7.4) * 2.8 +
      Math.sin(time * 4.3 + t * 14.2) * 1.4;
    if (i === 0) ctx.moveTo(px, py);
    else ctx.lineTo(px, py);
  }
  ctx.stroke();

  for (let i = 0; i < 5; i++) {
    const bx =
      x -
      innerR * 0.45 +
      ((i * 17 + Math.sin(time + i) * 10) % (innerR * 0.9));
    const by =
      liquidTop +
      8 +
      ((time * 22 + i * 13) % Math.max(14, innerR * 2 * fillT - 10));
    const br = 1.8 + (i % 2) * 0.8;

    if (by < y + innerR - 2) {
      ctx.beginPath();
      ctx.arc(bx, by, br, 0, Math.PI * 2);
      ctx.fillStyle = "rgba(255,255,255,0.16)";
      ctx.fill();
    }
  }

  ctx.restore();

  drawValueOnOrb(ctx, x, y, "THIRST", value);
}

function drawFoodOrb(
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  r: number,
  value: number,
  time: number
) {
  drawSoftShadowCircle(ctx, x, y, r);
  drawGlassOrbFrame(ctx, x, y, r, "#dfc8a8", "#9d7a50");

  const innerR = r - 8;
  const fillT = clamp(value / 100, 0, 1);

  ctx.save();
  ctx.beginPath();
  ctx.arc(x, y, innerR, 0, Math.PI * 2);
  ctx.clip();

  const bg = ctx.createLinearGradient(x, y - innerR, x, y + innerR);
  bg.addColorStop(0, "rgba(84, 58, 34, 0.30)");
  bg.addColorStop(1, "rgba(52, 36, 22, 0.55)");
  ctx.fillStyle = bg;
  ctx.beginPath();
  ctx.arc(x, y, innerR, 0, Math.PI * 2);
  ctx.fill();

  const pelletCount = Math.round(18 + fillT * 60);
  const activeRadius = innerR * (0.18 + fillT * 0.8);
  const swirlAngle = time * 0.16;

  for (let i = 0; i < pelletCount; i++) {
    const seed = i * 12.9898;
    const angle = i * 2.399963229728653 + swirlAngle;

    const radialT = Math.sqrt((i + 0.5) / pelletCount);
    const dist = radialT * activeRadius;

    const wobbleX =
      Math.sin(time * 1.9 + i * 0.61) * 1.4 +
      Math.cos(time * 1.15 + i * 0.33) * 0.7;

    const wobbleY =
      Math.cos(time * 1.7 + i * 0.74) * 1.2 +
      Math.sin(time * 1.35 + i * 0.41) * 0.8;

    const px = x + Math.cos(angle) * dist + wobbleX;
    const py = y + Math.sin(angle) * dist + wobbleY;

    const size = 2.6 + ((i * 17) % 10) * 0.16;
    const rot = angle + Math.sin(time + seed) * 0.22;

    const pelletGrad = ctx.createLinearGradient(
      px - size,
      py - size,
      px + size,
      py + size
    );
    pelletGrad.addColorStop(0, "#e0a558");
    pelletGrad.addColorStop(0.55, "#b97531");
    pelletGrad.addColorStop(1, "#7f4c1f");

    ctx.save();
    ctx.translate(px, py);
    ctx.rotate(rot);

    ctx.beginPath();
    ctx.ellipse(0, 0, size + 1.2, size * 0.72, 0.16, 0, Math.PI * 2);
    ctx.fillStyle = pelletGrad;
    ctx.fill();

    ctx.beginPath();
    ctx.ellipse(
      -size * 0.25,
      -size * 0.18,
      size * 0.42,
      size * 0.22,
      0.18,
      0,
      Math.PI * 2
    );
    ctx.fillStyle = "rgba(255,255,255,0.15)";
    ctx.fill();

    ctx.restore();
  }

  const glow = ctx.createRadialGradient(x, y, innerR * 0.2, x, y, innerR);
  glow.addColorStop(0, "rgba(255, 202, 116, 0.10)");
  glow.addColorStop(1, "rgba(255, 202, 116, 0)");
  ctx.fillStyle = glow;
  ctx.beginPath();
  ctx.arc(x, y, innerR, 0, Math.PI * 2);
  ctx.fill();

  ctx.restore();

  drawValueOnOrb(ctx, x, y, "HUNGER", value);
}

function drawHealthOrb(
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  r: number,
  value: number,
  time: number
) {
  drawSoftShadowCircle(ctx, x, y, r);
  drawGlassOrbFrame(ctx, x, y, r, "#e6b0b0", "#a65656");

  const innerR = r - 8;
  const fillT = clamp(value / 100, 0, 1);
  const liquidTop = y + innerR - innerR * 2 * fillT;

  ctx.save();
  ctx.beginPath();
  ctx.arc(x, y, innerR, 0, Math.PI * 2);
  ctx.clip();

  const bloodGrad = ctx.createLinearGradient(x, liquidTop, x, y + innerR);
  bloodGrad.addColorStop(0, "rgba(237, 102, 102, 0.96)");
  bloodGrad.addColorStop(0.5, "rgba(198, 60, 67, 0.98)");
  bloodGrad.addColorStop(1, "rgba(128, 24, 37, 1)");

  ctx.beginPath();
  ctx.moveTo(x - innerR, y + innerR);
  for (let i = 0; i <= 24; i++) {
    const t = i / 24;
    const px = x - innerR + t * innerR * 2;
    const py =
      liquidTop +
      Math.sin(time * 1.8 + t * 6.2) * 1.5 +
      Math.sin(time * 3.1 + t * 11.7) * 0.9;
    ctx.lineTo(px, py);
  }
  ctx.lineTo(x + innerR, y + innerR);
  ctx.closePath();
  ctx.fillStyle = bloodGrad;
  ctx.fill();

  ctx.strokeStyle = "rgba(255,255,255,0.20)";
  ctx.lineWidth = 1.2;
  ctx.beginPath();
  for (let i = 0; i <= 24; i++) {
    const t = i / 24;
    const px = x - innerR + t * innerR * 2;
    const py =
      liquidTop +
      Math.sin(time * 1.8 + t * 6.2) * 1.5 +
      Math.sin(time * 3.1 + t * 11.7) * 0.9;
    if (i === 0) ctx.moveTo(px, py);
    else ctx.lineTo(px, py);
  }
  ctx.stroke();

  ctx.restore();

  drawValueOnOrb(ctx, x, y, "HEALTH", value);
}

function drawHandShape(
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  flip = false
) {
  ctx.save();
  ctx.translate(x, y);
  if (flip) ctx.scale(-1, 1);

  const palmGrad = ctx.createLinearGradient(-18, -16, 16, 18);
  palmGrad.addColorStop(0, "#f3d5c2");
  palmGrad.addColorStop(1, "#d8ae96");

  ctx.fillStyle = palmGrad;
  ctx.beginPath();
  ctx.moveTo(-19, 6);
  ctx.quadraticCurveTo(-22, -2, -16, -9);
  ctx.quadraticCurveTo(-10, -15, -1, -14);
  ctx.quadraticCurveTo(4, -18, 9, -14);
  ctx.quadraticCurveTo(13, -16, 17, -11);
  ctx.quadraticCurveTo(20, -10, 21, -4);
  ctx.quadraticCurveTo(23, 6, 18, 13);
  ctx.quadraticCurveTo(12, 20, 2, 20);
  ctx.quadraticCurveTo(-10, 20, -17, 14);
  ctx.quadraticCurveTo(-21, 10, -19, 6);
  ctx.closePath();
  ctx.fill();

  ctx.strokeStyle = "rgba(104,66,56,0.20)";
  ctx.lineWidth = 1.2;
  ctx.stroke();

  ctx.strokeStyle = "rgba(255,255,255,0.16)";
  ctx.lineWidth = 1;
  ctx.beginPath();
  ctx.moveTo(-10, -6);
  ctx.quadraticCurveTo(-2, -10, 8, -8);
  ctx.stroke();

  ctx.restore();
}

function drawHandSlot(
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  side: "left" | "right",
  item: string | null
) {
  const r = 48;

  drawSoftShadowCircle(ctx, x, y, r, 0.18);
  drawGlassOrbFrame(ctx, x, y, r, "#d6e0d6", "#8fa596");

  ctx.beginPath();
  ctx.arc(x, y, r - 8, 0, Math.PI * 2);
  ctx.fillStyle = "rgba(36, 43, 39, 0.62)";
  ctx.fill();

  drawHandShape(ctx, x, y + 6, side === "left");

  if (item === "stick") {
    ctx.save();
    ctx.translate(x + (side === "left" ? -2 : 2), y + 1);
    ctx.rotate(side === "left" ? -0.7 : 0.7);

    ctx.strokeStyle = "#8a6545";
    ctx.lineWidth = 5;
    ctx.lineCap = "round";
    ctx.beginPath();
    ctx.moveTo(-19, 0);
    ctx.lineTo(19, 0);
    ctx.stroke();

    ctx.strokeStyle = "#a37a57";
    ctx.lineWidth = 2.3;
    ctx.beginPath();
    ctx.moveTo(-2, -1);
    ctx.lineTo(7, -7);
    ctx.stroke();

    ctx.restore();
  } else if (item === "stone") {
    ctx.save();
    ctx.translate(x, y + 2);

    ctx.beginPath();
    ctx.ellipse(0, 0, 16, 12, 0.25, 0, Math.PI * 2);
    ctx.fillStyle = "#97a3ad";
    ctx.fill();

    ctx.beginPath();
    ctx.ellipse(-3, -3, 4.8, 2.8, 0.25, 0, Math.PI * 2);
    ctx.fillStyle = "rgba(255,255,255,0.18)";
    ctx.fill();

    ctx.restore();
  }

  ctx.fillStyle = "rgba(255,248,236,0.82)";
  ctx.font = "bold 10px sans-serif";
  ctx.textAlign = "center";
  ctx.textBaseline = "middle";
  ctx.fillText(side === "left" ? "U" : "O", x, y + r + 18);
}

function drawSoftFloatingPanel(
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  w: number,
  h: number,
  radius = 18
) {
  drawWoodPanel(ctx, x, y, w, h, radius);
}

function drawTinySpark(
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  color = "rgba(255,244,214,0.7)"
) {
  ctx.strokeStyle = color;
  ctx.lineWidth = 1.25;
  ctx.beginPath();
  ctx.moveTo(x - 3, y);
  ctx.lineTo(x + 3, y);
  ctx.moveTo(x, y - 3);
  ctx.lineTo(x, y + 3);
  ctx.stroke();
}

export function drawInteractPrompt({
  ctx,
  canvasWidth,
  canvasHeight,
  camera,
  zoom,
  worldX,
  worldY,
  lines = [{ key: "I", label: "Interact" }],
}: {
  ctx: CanvasRenderingContext2D;
  canvasWidth: number;
  canvasHeight: number;
  camera: { x: number; y: number };
  zoom: number;
  worldX: number;
  worldY: number;
  lines?: { key: string; label: string }[];
}) {
  const rowH = 26;
  const boxW = 150;
  const boxH = lines.length * rowH + 16;

  const screenX = (worldX - camera.x) * zoom + canvasWidth / 2;
  const screenY = (worldY - camera.y) * zoom + canvasHeight / 2;

  let x = Math.round(screenX - boxW / 2);
  let y = Math.round(screenY - 60 - boxH);

  x = clamp(x, 12, canvasWidth - boxW - 12);
  y = clamp(y, 12, canvasHeight - boxH - 12);

  ctx.save();

  drawSoftFloatingPanel(ctx, x, y, boxW, boxH, 18);

  for (let i = 0; i < lines.length; i++) {
    const rowY = y + 8 + i * rowH;
    const midY = rowY + rowH / 2;
    const line = lines[i];

    fillRoundRect(ctx, x + 10, rowY + 3, 24, 18, 9, "rgba(255,245,230,0.74)");
    strokeRoundRect(
      ctx,
      x + 10,
      rowY + 3,
      24,
      18,
      9,
      "rgba(66,38,20,0.26)",
      1
    );

    ctx.fillStyle = "#4c301e";
    ctx.font = "bold 11px sans-serif";
    ctx.textAlign = "center";
    ctx.textBaseline = "middle";
    ctx.fillText(line.key, x + 22, midY + 0.5);

    ctx.fillStyle = "#f0e1cb";
    ctx.font = "bold 12px sans-serif";
    ctx.textAlign = "left";
    ctx.fillText(line.label, x + 42, midY + 0.5);
  }

  ctx.restore();
}

export function drawCampfireCard({
  ctx,
  canvasWidth,
  canvasHeight,
  camera,
  zoom,
  campfire,
}: {
  ctx: CanvasRenderingContext2D;
  canvasWidth: number;
  canvasHeight: number;
  camera: { x: number; y: number };
  zoom: number;
  campfire: CampfireCardState;
}) {
  const cardW = 332;
  const cardH = 196;

  const screenX = (campfire.x - camera.x) * zoom + canvasWidth / 2;
  const screenY = (campfire.y - camera.y) * zoom + canvasHeight / 2;

  let x = screenX - cardW / 2;
  let y = screenY - cardH - 72;

  const pad = 16;
  x = clamp(x, pad, canvasWidth - cardW - pad);
  y = clamp(y, pad, canvasHeight - cardH - pad);

  ctx.save();

  drawSoftFloatingPanel(ctx, x, y, cardW, cardH, 22);

  ctx.fillStyle = "#f3e2c7";
  ctx.font = "bold 18px sans-serif";
  ctx.textAlign = "left";
  ctx.textBaseline = "middle";
  ctx.fillText("Campfire", x + 20, y + 24);

  fillRoundRect(
    ctx,
    x + cardW - 88,
    y + 12,
    68,
    24,
    12,
    campfire.fuel > 0 && campfire.lit
      ? "rgba(255, 194, 96, 0.95)"
      : "rgba(214, 196, 168, 0.92)"
  );

  ctx.fillStyle =
    campfire.fuel > 0 && campfire.lit ? "#4f2d13" : "#4d3a2a";
  ctx.font = "bold 11px sans-serif";
  ctx.textAlign = "center";
  ctx.fillText(
    campfire.fuel > 0 && campfire.lit ? "LIT" : "UNLIT",
    x + cardW - 54,
    y + 24
  );

  const slotY = y + 56;
  const slotW = 126;
  const slotH = 82;
  const leftSlotX = x + 18;
  const rightSlotX = x + cardW - 18 - slotW;

  fillRoundRect(ctx, leftSlotX, slotY, slotW, slotH, 18, "rgba(36,25,18,0.58)");
  fillRoundRect(ctx, rightSlotX, slotY, slotW, slotH, 18, "rgba(36,25,18,0.58)");
  strokeRoundRect(
    ctx,
    leftSlotX,
    slotY,
    slotW,
    slotH,
    18,
    "rgba(255,230,200,0.10)",
    1.2
  );
  strokeRoundRect(
    ctx,
    rightSlotX,
    slotY,
    slotW,
    slotH,
    18,
    "rgba(255,230,200,0.10)",
    1.2
  );

  ctx.fillStyle = "rgba(255,238,214,0.86)";
  ctx.font = "bold 11px sans-serif";
  ctx.textAlign = "left";
  ctx.fillText("Fuel", leftSlotX + 12, slotY + 14);
  ctx.fillText("Ingredient", rightSlotX + 12, slotY + 14);

  ctx.save();
  ctx.translate(leftSlotX + slotW / 2, slotY + slotH / 2 - 4);

  if (campfire.fuel > 0) {
    ctx.rotate(0.35);
    ctx.strokeStyle = "#8b6545";
    ctx.lineWidth = 4;
    ctx.lineCap = "round";
    ctx.beginPath();
    ctx.moveTo(-13, 0);
    ctx.lineTo(13, 0);
    ctx.stroke();

    ctx.strokeStyle = "#a97d56";
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.moveTo(-2, -1);
    ctx.lineTo(4, -5);
    ctx.stroke();

    ctx.fillStyle = "#fff7ea";
    ctx.font = "bold 12px sans-serif";
    ctx.textAlign = "center";
    ctx.fillText(`${campfire.fuel}`, 0, 26);
  } else {
    ctx.fillStyle = "rgba(226,214,196,0.62)";
    ctx.font = "11px sans-serif";
    ctx.textAlign = "center";
    ctx.fillText("No fuel", 0, 2);
  }

  ctx.restore();

  ctx.fillStyle = campfire.ingredient ? "#fff4e4" : "rgba(226,214,196,0.62)";
  ctx.font = campfire.ingredient ? "bold 12px sans-serif" : "11px sans-serif";
  ctx.textAlign = "center";
  ctx.fillText(
    campfire.ingredient ? campfire.ingredient : "Empty",
    rightSlotX + slotW / 2,
    slotY + slotH / 2 + 6
  );

  const barX = x + 22;
  const barY = y + 152;
  const barW = cardW - 44;
  const barH = 18;

  fillRoundRect(ctx, barX, barY, barW, barH, 9, "rgba(34,22,15,0.65)");
  strokeRoundRect(ctx, barX, barY, barW, barH, 9, "rgba(255,228,196,0.12)", 1);

  const fuelT =
    campfire.burnTimeMax > 0
      ? clamp(campfire.burnTimeRemaining / campfire.burnTimeMax, 0, 1)
      : 0;

  if (fuelT > 0) {
    const fillW = Math.max(0, (barW - 4) * fuelT);
    const barGrad = ctx.createLinearGradient(barX, barY, barX + barW, barY);
    barGrad.addColorStop(0, "#ffe08a");
    barGrad.addColorStop(0.45, "#ffca55");
    barGrad.addColorStop(1, "#f29b2f");
    fillRoundRect(ctx, barX + 2, barY + 2, fillW, barH - 4, 7, barGrad);
  }

  ctx.fillStyle = "#f7ead6";
  ctx.font = "bold 11px sans-serif";
  ctx.textAlign = "left";
  ctx.fillText("Burn Time", barX, barY - 8);

  ctx.textAlign = "right";
  ctx.fillText(
    `${Math.ceil(campfire.burnTimeRemaining)}s`,
    barX + barW,
    barY - 8
  );

  ctx.fillStyle = "rgba(255,238,214,0.72)";
  ctx.font = "bold 11px sans-serif";
  ctx.textAlign = "left";
  ctx.fillText("Press I to close", x + 20, y + cardH - 14);

  drawTinySpark(ctx, x + cardW - 22, y + cardH - 16, "rgba(255,231,173,0.75)");

  ctx.restore();
}

export function drawBottomHud({
  ctx,
  canvasWidth,
  canvasHeight,
  hands,
  survival,
}: {
  ctx: CanvasRenderingContext2D;
  canvasWidth: number;
  canvasHeight: number;
  hands: HandsState;
  survival: SurvivalState;
}) {
  const time = performance.now() / 1000;

  const baseY = canvasHeight - 88;
  const centerX = canvasWidth / 2;

  const orbR = 42;
  const gap = 98;

  const hungerX = centerX - gap;
  const healthX = centerX;
  const thirstX = centerX + gap;

  const leftHandX = hungerX - 116;
  const rightHandX = thirstX + 116;

  drawHandSlot(ctx, leftHandX, baseY, "left", hands.left);
  drawFoodOrb(ctx, hungerX, baseY, orbR, survival.hunger, time);
  drawHealthOrb(ctx, healthX, baseY, orbR, survival.health, time);
  drawWaterOrb(ctx, thirstX, baseY, orbR, survival.thirst, time);
  drawHandSlot(ctx, rightHandX, baseY, "right", hands.right);
}

type DrawCraftingRepairPromptArgs = {
  ctx: CanvasRenderingContext2D;
  canvasWidth: number;
  canvasHeight: number;
  camera: { x: number; y: number };
  zoom: number;
  worldX: number;
  worldY: number;
  sticksAdded: number;
  sticksRequired: number;
  stonesAdded: number;
  stonesRequired: number;
};

export function drawCraftingRepairPrompt({
  ctx,
  canvasWidth,
  canvasHeight,
  camera,
  zoom,
  worldX,
  worldY,
  sticksAdded,
  sticksRequired,
  stonesAdded,
  stonesRequired,
}: DrawCraftingRepairPromptArgs) {
  const screenX = canvasWidth / 2 + (worldX - camera.x) * zoom;
  const screenY = canvasHeight / 2 + (worldY - camera.y) * zoom - 88;

  const cardW = 188;
  const cardH = 88;
  let x = Math.round(screenX - cardW / 2);
  let y = Math.round(screenY - cardH / 2);

  x = clamp(x, 12, canvasWidth - cardW - 12);
  y = clamp(y, 12, canvasHeight - cardH - 12);

  ctx.save();

  drawSoftFloatingPanel(ctx, x, y, cardW, cardH, 20);

  ctx.fillStyle = "#f3e2c7";
  ctx.font = "bold 13px sans-serif";
  ctx.textAlign = "left";
  ctx.textBaseline = "middle";
  ctx.fillText("Repair Crafting Table", x + 14, y + 17);

  const row1Y = y + 42;
  const row2Y = y + 64;

  ctx.save();
  ctx.translate(x + 20, row1Y);
  ctx.rotate(0.48);
  ctx.strokeStyle = "#8a6545";
  ctx.lineWidth = 3.5;
  ctx.lineCap = "round";
  ctx.beginPath();
  ctx.moveTo(-8, 0);
  ctx.lineTo(8, 0);
  ctx.stroke();

  ctx.strokeStyle = "#a97d56";
  ctx.lineWidth = 1.5;
  ctx.beginPath();
  ctx.moveTo(-1, -1);
  ctx.lineTo(3, -4);
  ctx.stroke();
  ctx.restore();

  ctx.beginPath();
  ctx.ellipse(x + 20, row2Y, 5.5, 4.5, 0.25, 0, Math.PI * 2);
  ctx.fillStyle = "#95a2ab";
  ctx.fill();

  ctx.beginPath();
  ctx.ellipse(x + 18.5, row2Y - 1.2, 1.8, 1.3, 0.25, 0, Math.PI * 2);
  ctx.fillStyle = "rgba(255,255,255,0.18)";
  ctx.fill();

  ctx.fillStyle = "#f0e1cb";
  ctx.font = "bold 12px sans-serif";
  ctx.textAlign = "left";
  ctx.fillText(`${sticksAdded} / ${sticksRequired}`, x + 34, row1Y);
  ctx.fillText(`${stonesAdded} / ${stonesRequired}`, x + 34, row2Y);

  ctx.restore();
}export function drawCraftingTableCard({
  ctx,
  canvasWidth,
  canvasHeight,
  camera,
  zoom,
  worldX,
  worldY,
  recipes,
  selectedIndex,
  pantry,
}: DrawCraftingTableCardArgs) {
  const selectedRecipe = recipes[selectedIndex];
  if (!selectedRecipe) return;

  const cardW = 760;
  const cardH = 360;

  const screenX = (worldX - camera.x) * zoom + canvasWidth / 2;
  const screenY = (worldY - camera.y) * zoom + canvasHeight / 2;

  let x = screenX - cardW / 2;
  let y = screenY - cardH - 82;

  const pad = 16;
  x = clamp(x, pad, canvasWidth - cardW - pad);
  y = clamp(y, pad, canvasHeight - cardH - pad);

  const headerH = 34;
  const topSectionY = y + 46;
  const topSectionH = 190;

  const recipesW = 190;
  const detailsW = 220;
  const craftAreaW = 300;

  const recipesX = x + 14;
  const detailsX = recipesX + recipesW + 12;
  const craftAreaX = detailsX + detailsW + 12;

  const pantryX = x + 14;
  const pantryY = topSectionY + topSectionH + 12;
  const pantryW = cardW - 28;
  const pantryH = 98;

  ctx.save();

  drawSoftFloatingPanel(ctx, x, y, cardW, cardH, 22);

  ctx.fillStyle = "#f3e2c7";
  ctx.font = "bold 18px sans-serif";
  ctx.textAlign = "left";
  ctx.textBaseline = "middle";
  ctx.fillText("Crafting Table", x + 18, y + 22);

  // sections
  fillRoundRect(
    ctx,
    recipesX,
    topSectionY,
    recipesW,
    topSectionH,
    18,
    "rgba(32,22,16,0.42)"
  );
  fillRoundRect(
    ctx,
    detailsX,
    topSectionY,
    detailsW,
    topSectionH,
    18,
    "rgba(32,22,16,0.42)"
  );
  fillRoundRect(
    ctx,
    craftAreaX,
    topSectionY,
    craftAreaW,
    topSectionH,
    18,
    "rgba(32,22,16,0.42)"
  );
  fillRoundRect(
    ctx,
    pantryX,
    pantryY,
    pantryW,
    pantryH,
    18,
    "rgba(32,22,16,0.42)"
  );

  strokeRoundRect(
    ctx,
    recipesX,
    topSectionY,
    recipesW,
    topSectionH,
    18,
    "rgba(255,228,196,0.10)",
    1.2
  );
  strokeRoundRect(
    ctx,
    detailsX,
    topSectionY,
    detailsW,
    topSectionH,
    18,
    "rgba(255,228,196,0.10)",
    1.2
  );
  strokeRoundRect(
    ctx,
    craftAreaX,
    topSectionY,
    craftAreaW,
    topSectionH,
    18,
    "rgba(255,228,196,0.10)",
    1.2
  );
  strokeRoundRect(
    ctx,
    pantryX,
    pantryY,
    pantryW,
    pantryH,
    18,
    "rgba(255,228,196,0.10)",
    1.2
  );

  ctx.fillStyle = "rgba(255,238,214,0.88)";
  ctx.font = "bold 12px sans-serif";
  ctx.fillText("Recipes", recipesX + 12, topSectionY + 16);
  ctx.fillText("Description", detailsX + 12, topSectionY + 16);
  ctx.fillText("Workbench", craftAreaX + 12, topSectionY + 16);
  ctx.fillText("Storage", pantryX + 12, pantryY + 16);

  // ----------------------------------
  // craftable check
  // ----------------------------------
  let selectedCraftable = true;
  for (const key of Object.keys(selectedRecipe.requirements) as Array<
    "stick" | "stone" | "charcoal" | "bark" | "rope"
  >) {
    const need = selectedRecipe.requirements[key] ?? 0;
    const have = pantry[key] ?? 0;
    if (have < need) {
      selectedCraftable = false;
      break;
    }
  }

  fillRoundRect(
    ctx,
    x + cardW - 116,
    y + 12,
    94,
    20,
    10,
    selectedCraftable
      ? "rgba(164, 207, 130, 0.88)"
      : "rgba(124, 116, 106, 0.72)"
  );

  ctx.fillStyle = selectedCraftable ? "#28401c" : "#493e34";
  ctx.font = "bold 10px sans-serif";
  ctx.textAlign = "center";
  ctx.fillText(
    selectedCraftable ? "CRAFTABLE" : "MISSING",
    x + cardW - 69,
    y + 22
  );

  // ----------------------------------
  // recipes panel
  // ----------------------------------
  const recipeStartY = topSectionY + 40;
  const recipeRowH = 28;

  ctx.textAlign = "left";

  for (let i = 0; i < recipes.length; i++) {
    const recipe = recipes[i];
    const rowY = recipeStartY + i * recipeRowH;

    let craftable = true;
    for (const key of Object.keys(recipe.requirements) as Array<
      "stick" | "stone" | "charcoal" | "bark" | "rope"
    >) {
      const need = recipe.requirements[key] ?? 0;
      const have = pantry[key] ?? 0;
      if (have < need) {
        craftable = false;
        break;
      }
    }

    if (i === selectedIndex) {
      fillRoundRect(
        ctx,
        recipesX + 8,
        rowY - 14,
        recipesW - 16,
        24,
        12,
        craftable
          ? "rgba(255, 224, 163, 0.18)"
          : "rgba(255,255,255,0.08)"
      );

      strokeRoundRect(
        ctx,
        recipesX + 8,
        rowY - 14,
        recipesW - 16,
        24,
        12,
        craftable
          ? "rgba(255, 225, 168, 0.35)"
          : "rgba(255,255,255,0.14)",
        1
      );
    }

    ctx.fillStyle = craftable ? "#f7ead6" : "rgba(247,234,214,0.34)";
    ctx.font = i === selectedIndex ? "bold 13px sans-serif" : "12px sans-serif";
    ctx.fillText(recipe.name, recipesX + 16, rowY);
  }

  // ----------------------------------
  // description panel
  // ----------------------------------
  let textY = topSectionY + 42;

  ctx.fillStyle = "#f5e6d3";
  ctx.font = "bold 16px sans-serif";
  ctx.fillText(selectedRecipe.name, detailsX + 14, textY);

  textY += 22;

  ctx.fillStyle = "rgba(255,238,214,0.74)";
  ctx.font = "12px sans-serif";
  ctx.fillText(selectedRecipe.description, detailsX + 14, textY);

  textY += 30;

  ctx.fillStyle = "#f0e1cb";
  ctx.font = "bold 12px sans-serif";
  ctx.fillText("Requirements", detailsX + 14, textY);

  textY += 18;

  for (const key of Object.keys(selectedRecipe.requirements) as Array<
    "stick" | "stone" | "charcoal" | "bark" | "rope"
  >) {
    const need = selectedRecipe.requirements[key] ?? 0;
    const have = pantry[key] ?? 0;
    const met = have >= need;

    ctx.fillStyle = met ? "#d6f0c2" : "rgba(255,238,214,0.54)";
    ctx.font = "12px sans-serif";
    ctx.fillText(`${key}: ${have} / ${need}`, detailsX + 14, textY);
    textY += 16;
  }

  // ----------------------------------
  // workbench / hammer zone
  // ----------------------------------
  const benchX = craftAreaX + 18;
  const benchY = topSectionY + 46;
  const benchW = craftAreaW - 36;
  const benchH = 118;

  const benchGrad = ctx.createLinearGradient(benchX, benchY, benchX, benchY + benchH);
  benchGrad.addColorStop(0, "rgba(132, 89, 56, 0.95)");
  benchGrad.addColorStop(1, "rgba(88, 56, 35, 0.95)");

  fillRoundRect(ctx, benchX, benchY, benchW, benchH, 16, benchGrad);
  strokeRoundRect(
    ctx,
    benchX,
    benchY,
    benchW,
    benchH,
    16,
    "rgba(255,225,190,0.12)",
    1.2
  );

  // wood slats
  for (let i = 1; i < 4; i++) {
    const yy = benchY + (benchH / 4) * i;
    ctx.strokeStyle = "rgba(255,225,190,0.08)";
    ctx.lineWidth = 1;
    ctx.beginPath();
    ctx.moveTo(benchX + 10, yy);
    ctx.lineTo(benchX + benchW - 10, yy);
    ctx.stroke();
  }

  // recipe icon-ish preview
  ctx.save();
  ctx.translate(benchX + 72, benchY + 58);

  if (selectedRecipe.id === "axe") {
    ctx.rotate(-0.35);
    ctx.strokeStyle = "#8b6545";
    ctx.lineWidth = 5;
    ctx.lineCap = "round";
    ctx.beginPath();
    ctx.moveTo(-18, 10);
    ctx.lineTo(16, -12);
    ctx.stroke();

    ctx.beginPath();
    ctx.fillStyle = "#9ca7b0";
    ctx.moveTo(10, -18);
    ctx.lineTo(24, -6);
    ctx.lineTo(8, 2);
    ctx.closePath();
    ctx.fill();
  } else if (selectedRecipe.id === "torch") {
    ctx.rotate(-0.2);
    ctx.strokeStyle = "#8b6545";
    ctx.lineWidth = 5;
    ctx.lineCap = "round";
    ctx.beginPath();
    ctx.moveTo(0, 14);
    ctx.lineTo(0, -12);
    ctx.stroke();

    const flame = ctx.createRadialGradient(0, -18, 1, 0, -18, 12);
    flame.addColorStop(0, "rgba(255,240,170,1)");
    flame.addColorStop(0.55, "rgba(255,166,70,0.95)");
    flame.addColorStop(1, "rgba(255,120,40,0)");
    ctx.fillStyle = flame;
    ctx.beginPath();
    ctx.arc(0, -18, 12, 0, Math.PI * 2);
    ctx.fill();
  } else if (selectedRecipe.id === "rope") {
    ctx.strokeStyle = "#b99768";
    ctx.lineWidth = 4;
    ctx.beginPath();
    ctx.arc(0, 0, 16, 0.2, Math.PI * 1.8);
    ctx.stroke();
    ctx.beginPath();
    ctx.arc(0, 0, 9, 0.4, Math.PI * 1.85);
    ctx.stroke();
  } else {
    ctx.fillStyle = "rgba(255,240,220,0.75)";
    ctx.font = "bold 14px sans-serif";
    ctx.textAlign = "center";
    ctx.fillText(selectedRecipe.name, 0, 0);
  }

  ctx.restore();

  // hammer spot
  fillRoundRect(
    ctx,
    benchX + 148,
    benchY + 18,
    108,
    82,
    14,
    selectedCraftable
      ? "rgba(255, 222, 156, 0.12)"
      : "rgba(255,255,255,0.05)"
  );
  strokeRoundRect(
    ctx,
    benchX + 148,
    benchY + 18,
    108,
    82,
    14,
    selectedCraftable
      ? "rgba(255, 225, 168, 0.28)"
      : "rgba(255,255,255,0.08)",
    1
  );

  ctx.fillStyle = "rgba(255,238,214,0.72)";
  ctx.font = "bold 11px sans-serif";
  ctx.textAlign = "center";
  ctx.fillText("Hammer Here", benchX + 202, benchY + 38);

  // small hammer art
  ctx.save();
  ctx.translate(benchX + 202, benchY + 66);
  ctx.rotate(-0.55);

  ctx.fillStyle = "#8a5f3e";
  ctx.fillRect(-3, -16, 6, 28);

  ctx.fillStyle = "#8a8f98";
  ctx.fillRect(-14, -18, 28, 8);

  ctx.restore();

  // sparks
  if (selectedCraftable) {
    drawTinySpark(ctx, benchX + 180, benchY + 72, "rgba(255,230,170,0.65)");
    drawTinySpark(ctx, benchX + 224, benchY + 58, "rgba(255,230,170,0.55)");
    drawTinySpark(ctx, benchX + 208, benchY + 84, "rgba(255,230,170,0.5)");
  }

  ctx.fillStyle = "rgba(255,238,214,0.80)";
  ctx.font = "bold 11px sans-serif";
  ctx.textAlign = "left";
  ctx.fillText(
    selectedCraftable ? "Press E to craft" : "Store more materials in the crate",
    benchX,
    benchY + benchH + 16
  );

  // ----------------------------------
  // pantry grid
  // ----------------------------------
  const pantryItems: Array<{
    key: "stick" | "stone" | "charcoal" | "bark" | "rope";
    label: string;
    value: number;
  }> = [
    { key: "stick", label: "Stick", value: pantry.stick },
    { key: "stone", label: "Stone", value: pantry.stone },
    { key: "charcoal", label: "Charcoal", value: pantry.charcoal },
    { key: "bark", label: "Bark", value: pantry.bark },
    { key: "rope", label: "Rope", value: pantry.rope },
  ];

  const cols = 5;
  const slotGap = 10;
  const slotW = (pantryW - 24 - slotGap * (cols - 1)) / cols;
  const slotH = 48;
  const slotY = pantryY + 34;

  for (let i = 0; i < pantryItems.length; i++) {
    const item = pantryItems[i];
    const slotX = pantryX + 12 + i * (slotW + slotGap);

    fillRoundRect(ctx, slotX, slotY, slotW, slotH, 12, "rgba(22,16,12,0.42)");
    strokeRoundRect(
      ctx,
      slotX,
      slotY,
      slotW,
      slotH,
      12,
      "rgba(255,228,196,0.10)",
      1
    );

    ctx.fillStyle = "#f0e1cb";
    ctx.font = "bold 11px sans-serif";
    ctx.textAlign = "center";
    ctx.fillText(item.label, slotX + slotW / 2, slotY + 14);

    ctx.fillStyle = item.value > 0 ? "#fff1dc" : "rgba(255,238,214,0.34)";
    ctx.font = "bold 16px sans-serif";
    ctx.fillText(`${item.value}`, slotX + slotW / 2, slotY + 34);
  }

  // footer controls
  ctx.textAlign = "left";
  ctx.fillStyle = "rgba(255,238,214,0.72)";
  ctx.font = "bold 11px sans-serif";
  ctx.fillText("W / S choose recipe", x + 18, y + cardH - 14);
  ctx.fillText("E craft selected", x + 180, y + cardH - 14);
  ctx.fillText("U / O store in crate", x + 330, y + cardH - 14);
  ctx.fillText("I close", x + 520, y + cardH - 14);

  ctx.restore();
}