export type Campfire = {
  x: number;
  y: number;
  radius: number;

  fuel: number;
  ingredient: string | null;

  lit: boolean;
  burnTimeRemaining: number;
};

export const STICK_BURN_TIME = 30;

export function createCampfire(x: number, y: number): Campfire {
  return {
    x,
    y,
    radius: 24,
    fuel: 0,
    ingredient: null,
    lit: false,
    burnTimeRemaining: 0,
  };
}

export function addStickToCampfire(campfire: Campfire) {
  campfire.fuel += 1;
  campfire.burnTimeRemaining += STICK_BURN_TIME;
}

export function canLightCampfire(campfire: Campfire) {
  return campfire.burnTimeRemaining > 0;
}

export function lightCampfire(campfire: Campfire) {
  if (canLightCampfire(campfire)) {
    campfire.lit = true;
  }
}

export function extinguishCampfire(campfire: Campfire) {
  campfire.lit = false;
}

export function updateCampfire(campfire: Campfire, deltaTime: number) {
  if (!campfire.lit) return;
  if (campfire.burnTimeRemaining <= 0) {
    campfire.burnTimeRemaining = 0;
    campfire.fuel = 0;
    campfire.lit = false;
    return;
  }

  campfire.burnTimeRemaining -= deltaTime;

  if (campfire.burnTimeRemaining <= 0) {
    campfire.burnTimeRemaining = 0;
    campfire.fuel = 0;
    campfire.lit = false;
    return;
  }

  campfire.fuel = Math.ceil(campfire.burnTimeRemaining / STICK_BURN_TIME);
}

export function formatBurnTime(seconds: number) {
  const safeSeconds = Math.max(0, Math.ceil(seconds));
  const mins = Math.floor(safeSeconds / 60);
  const secs = safeSeconds % 60;
  return `${mins}:${secs.toString().padStart(2, "0")}`;
}

function drawSmokePuff(
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  rx: number,
  ry: number,
  alpha: number,
  rotation = 0
) {
  ctx.save();
  ctx.translate(x, y);
  ctx.rotate(rotation);

  ctx.beginPath();
  ctx.ellipse(0, 0, rx, ry, 0, 0, Math.PI * 2);
  ctx.fillStyle = `rgba(110,110,110,${alpha})`;
  ctx.fill();

  ctx.restore();
}

function drawGlowParticle(
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  r: number,
  alpha: number,
  color: string
) {
  ctx.beginPath();
  ctx.arc(x, y, r * 2.2, 0, Math.PI * 2);
  ctx.fillStyle = color
    .replace("ALPHA", `${alpha * 0.18}`)
    .replace("SIZE", `${r}`);
  ctx.fill();

  ctx.beginPath();
  ctx.arc(x, y, r, 0, Math.PI * 2);
  ctx.fillStyle = color.replace("ALPHA", `${alpha}`).replace("SIZE", `${r}`);
  ctx.fill();
}

function drawLog(
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  w: number,
  h: number,
  rotation: number
) {
  ctx.save();
  ctx.translate(x, y);
  ctx.rotate(rotation);

  ctx.fillStyle = "#6b472c";
  ctx.fillRect(-w / 2, -h / 2, w, h);

  ctx.strokeStyle = "rgba(50,28,14,0.38)";
  ctx.lineWidth = 1;
  ctx.strokeRect(-w / 2, -h / 2, w, h);

  ctx.beginPath();
  ctx.moveTo(-w * 0.3, -h * 0.15);
  ctx.lineTo(w * 0.25, -h * 0.15);
  ctx.moveTo(-w * 0.2, h * 0.12);
  ctx.lineTo(w * 0.15, h * 0.12);
  ctx.strokeStyle = "rgba(95,60,35,0.24)";
  ctx.stroke();

  ctx.restore();
}

function drawCoal(
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  r: number,
  glow: number
) {
  ctx.beginPath();
  ctx.arc(x, y, r + glow * 0.8, 0, Math.PI * 2);
  ctx.fillStyle = `rgba(255,120,30,${0.1 + glow * 0.08})`;
  ctx.fill();

  ctx.beginPath();
  ctx.arc(x, y, r, 0, Math.PI * 2);
  ctx.fillStyle = "#2c1b14";
  ctx.fill();
}

function drawCampfireSmoke(
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  time: number,
  strength: number
) {
  const puffs = [
    { seed: 0.0, duration: 4.8, drift: -10, size: 1.0 },
    { seed: 1.1, duration: 5.2, drift: 12, size: 1.12 },
    { seed: 2.1, duration: 4.2, drift: -7, size: 0.92 },
    { seed: 3.0, duration: 5.0, drift: 15, size: 1.2 },
  ];

  for (const puff of puffs) {
    const t = ((time + puff.seed) % puff.duration) / puff.duration;
    const rise = t * 52;

    const drift =
      puff.drift * t +
      Math.sin((time + puff.seed) * 0.85) * 2.2 +
      Math.sin((time + puff.seed) * 0.45) * 1.4;

    const px = x + drift;
    const py = y - 18 - rise;

    const alpha = (1 - t) * 0.1 * strength;
    const rx = (5 + t * 7) * puff.size;
    const ry = (3.2 + t * 5) * puff.size;
    const rotation = Math.sin((time + puff.seed) * 0.9) * 0.12;

    drawSmokePuff(ctx, px, py, rx, ry, alpha, rotation);

    if (t > 0.28) {
      drawSmokePuff(
        ctx,
        px - rx * 0.35,
        py + ry * 0.12,
        rx * 0.72,
        ry * 0.66,
        alpha * 0.7,
        rotation - 0.06
      );
    }
  }
}

function drawCampfireEmbers(
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  time: number,
  strength: number
) {
  const embers = [
    { seed: 0.0, duration: 1.8, spread: 4, height: 16, size: 0.72 },
    { seed: 0.35, duration: 2.1, spread: 5, height: 22, size: 0.88 },
    { seed: 0.8, duration: 2.4, spread: 6, height: 28, size: 1.0 },
    { seed: 1.3, duration: 1.9, spread: 4, height: 18, size: 0.76 },
    { seed: 1.8, duration: 2.3, spread: 5, height: 24, size: 0.9 },
    { seed: 2.3, duration: 2.0, spread: 6, height: 20, size: 0.8 },
    { seed: 2.8, duration: 2.5, spread: 7, height: 30, size: 1.05 },
  ];

  for (const ember of embers) {
    const t = ((time + ember.seed) % ember.duration) / ember.duration;
    const ease = 1 - Math.pow(1 - t, 2);

    const px =
      x +
      Math.sin((time + ember.seed) * 1.7) * 1.4 +
      (t - 0.5) * ember.spread +
      Math.sin((time + ember.seed) * 3.3) * ember.spread * 0.18;

    const py = y - 7 - ease * ember.height;

    const alpha =
      (1 - t) *
      (0.72 + Math.sin((time + ember.seed) * 8.5) * 0.04) *
      strength;

    const radius =
      (0.82 + Math.sin((time + ember.seed) * 6.8) * 0.08) * ember.size;

    drawGlowParticle(
      ctx,
      px,
      py,
      radius,
      alpha,
      "rgba(255,220,140,ALPHA)"
    );
  }
}

function drawCampfireFireParticles(
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  time: number,
  strength: number
) {
  const flameParticles = [
    { seed: 0.0, duration: 1.1, spread: 4.0, height: 15, size: 3.8, drift: -0.6 },
    { seed: 0.14, duration: 1.0, spread: 4.8, height: 17, size: 3.5, drift: 0.7 },
    { seed: 0.28, duration: 1.2, spread: 3.8, height: 18, size: 3.2, drift: -0.4 },
    { seed: 0.42, duration: 0.95, spread: 4.5, height: 14, size: 3.9, drift: 0.5 },
    { seed: 0.58, duration: 1.15, spread: 3.5, height: 16, size: 2.9, drift: -0.35 },
    { seed: 0.76, duration: 1.05, spread: 4.2, height: 19, size: 2.8, drift: 0.55 },
    { seed: 0.9, duration: 1.25, spread: 3.0, height: 13, size: 2.4, drift: 0.2 },
  ];

  for (const particle of flameParticles) {
    const t = ((time + particle.seed) % particle.duration) / particle.duration;
    const easeUp = 1 - Math.pow(1 - t, 2);
    const fade = 1 - Math.pow(t, 1.35);

    const wobble =
      Math.sin((time + particle.seed) * 5.2) * 1.1 +
      Math.sin((time + particle.seed) * 2.8) * 0.55;

    const px =
      x +
      particle.drift * 4 +
      (t - 0.5) * particle.spread +
      wobble * 0.35;

    const py = y - 2 - easeUp * particle.height;

    const radius =
      particle.size *
      (1 - t * 0.58) *
      (0.95 + Math.sin((time + particle.seed) * 7.5) * 0.04);

    const alpha = fade * (0.42 + strength * 0.32);

    drawGlowParticle(
      ctx,
      px,
      py,
      radius,
      alpha,
      "rgba(255,145,55,ALPHA)"
    );
  }

  const innerParticles = [
    { seed: 0.05, duration: 0.9, spread: 2.4, height: 11, size: 2.1 },
    { seed: 0.24, duration: 1.0, spread: 2.8, height: 12, size: 1.9 },
    { seed: 0.49, duration: 0.86, spread: 2.2, height: 10, size: 1.7 },
    { seed: 0.68, duration: 1.08, spread: 2.0, height: 13, size: 1.8 },
    { seed: 0.88, duration: 0.94, spread: 2.6, height: 9, size: 1.6 },
  ];

  for (const particle of innerParticles) {
    const t = ((time + particle.seed) % particle.duration) / particle.duration;
    const easeUp = 1 - Math.pow(1 - t, 2);
    const fade = 1 - t;

    const px =
      x +
      (t - 0.5) * particle.spread +
      Math.sin((time + particle.seed) * 4.2) * 0.45;

    const py = y + 1 - easeUp * particle.height;

    const radius = particle.size * (1 - t * 0.42);
    const alpha = fade * (0.5 + strength * 0.24);

    drawGlowParticle(
      ctx,
      px,
      py,
      radius,
      alpha,
      "rgba(255,235,170,ALPHA)"
    );
  }

  ctx.beginPath();
  ctx.ellipse(x, y - 1, 9, 4.2, 0, 0, Math.PI * 2);
  ctx.fillStyle = `rgba(255,220,140,${0.08 + strength * 0.04})`;
  ctx.fill();

  ctx.beginPath();
  ctx.ellipse(x, y - 6.5, 11, 7, 0, 0, Math.PI * 2);
  ctx.fillStyle = `rgba(255,150,40,${0.05 + strength * 0.03})`;
  ctx.fill();
}

export function drawCampfire(
  ctx: CanvasRenderingContext2D,
  campfire: Campfire,
  time: number
) {
  const { x, y, fuel, lit, burnTimeRemaining } = campfire;

  const isActive = lit && burnTimeRemaining > 0;
  const visualFuel = Math.max(1, fuel);
  const fireStrength = Math.min(1, 0.45 + visualFuel * 0.12);
  const emberGlow = (Math.sin(time * 6.8) + 1) * 0.5;

  ctx.beginPath();
  ctx.ellipse(x + 2, y + 4, 24, 10, -0.08, 0, Math.PI * 2);
  ctx.fillStyle = "rgba(0,0,0,0.16)";
  ctx.fill();

  ctx.beginPath();
  ctx.ellipse(x, y + 1, 18, 8, 0, 0, Math.PI * 2);
  ctx.fillStyle = "#4a4038";
  ctx.fill();

  ctx.beginPath();
  ctx.ellipse(x, y, 14, 6, 0, 0, Math.PI * 2);
  ctx.fillStyle = "#76675b";
  ctx.fill();

  const stones = [
    { dx: -14, dy: 0, r: 4.4 },
    { dx: -9, dy: -5, r: 3.8 },
    { dx: -2, dy: -7, r: 4.2 },
    { dx: 6, dy: -6, r: 4.1 },
    { dx: 13, dy: -2, r: 4.6 },
    { dx: 11, dy: 4, r: 4.1 },
    { dx: 3, dy: 7, r: 4.4 },
    { dx: -6, dy: 6, r: 4.0 },
  ];

  for (const stone of stones) {
    ctx.beginPath();
    ctx.arc(x + stone.dx, y + stone.dy, stone.r, 0, Math.PI * 2);
    ctx.fillStyle = "#7c776f";
    ctx.fill();

    ctx.beginPath();
    ctx.arc(
      x + stone.dx - 1,
      y + stone.dy - 1,
      stone.r * 0.45,
      0,
      Math.PI * 2
    );
    ctx.fillStyle = "rgba(255,255,255,0.08)";
    ctx.fill();
  }

  drawLog(ctx, x - 2, y, 24, 5, -0.62);
  drawLog(ctx, x + 2, y, 24, 5, 0.62);

  if (fuel > 0 || burnTimeRemaining > 0) {
    drawLog(ctx, x - 5, y - 3, 18, 4, -1.0);
    drawLog(ctx, x + 5, y - 2, 16, 4, 0.92);
  }

  drawCoal(ctx, x - 4, y + 1, 3.5, emberGlow);
  drawCoal(ctx, x + 2, y - 1, 3.2, emberGlow * 0.8);
  drawCoal(ctx, x + 6, y + 2, 2.8, emberGlow * 0.6);

  if (isActive) {
    drawCampfireFireParticles(ctx, x, y, time, fireStrength);
    drawCampfireSmoke(ctx, x, y, time, fireStrength);
    drawCampfireEmbers(ctx, x, y, time, fireStrength);
  }
}