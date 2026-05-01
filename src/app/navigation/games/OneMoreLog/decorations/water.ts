import { WATER_ZONES } from "../map/map";

type RippleSource = {
  x: number;
  y: number;
  phase: number;
  maxR: number;
  speed: number;
};

const RIPPLE_SOURCES: RippleSource[] = [
  // big lake-wide ripple
  { x: 980, y: 750, phase: 0.0, maxR: 300, speed: 0.12 },

  // smaller supporting ripples
  { x: 900, y: 705, phase: 0.9, maxR: 95, speed: 0.24 },
  { x: 1080, y: 800, phase: 1.8, maxR: 80, speed: 0.22 },
  { x: 845, y: 675, phase: 2.6, maxR: 55, speed: 0.28 },
];

function clipToWater(ctx: CanvasRenderingContext2D) {
  ctx.beginPath();

  for (const zone of WATER_ZONES) {
    ctx.moveTo(zone.x + zone.rx, zone.y);
    ctx.ellipse(
      zone.x,
      zone.y,
      zone.rx,
      zone.ry,
      zone.rotation,
      0,
      Math.PI * 2
    );
  }

  ctx.clip();
}

function drawSoftSurfaceSheen(
  ctx: CanvasRenderingContext2D,
  time: number
) {
  for (let i = 0; i < 10; i++) {
    const zone = WATER_ZONES[i % WATER_ZONES.length];
    const t = time * 0.28 + i * 1.2;

    const x = zone.x + Math.cos(t) * zone.rx * 0.28;
    const y = zone.y + Math.sin(t * 0.8) * zone.ry * 0.2;

    ctx.fillStyle = "rgba(255,255,255,0.035)";
    ctx.beginPath();
    ctx.ellipse(
      x,
      y,
      26 + (i % 3) * 10,
      8 + (i % 2) * 2,
      zone.rotation * 0.35,
      0,
      Math.PI * 2
    );
    ctx.fill();
  }
}

function drawRippleSource(
  ctx: CanvasRenderingContext2D,
  source: RippleSource,
  time: number,
  rotation: number,
  alphaScale = 1
) {
  for (let i = 0; i < 3; i++) {
    const cycle = ((time * source.speed + source.phase + i * 0.33) % 1 + 1) % 1;
    const radius = 16 + cycle * source.maxR;
    const alpha = (1 - cycle) * 0.14 * alphaScale;

    ctx.strokeStyle = `rgba(255,255,255,${alpha})`;
    ctx.lineWidth = i === 0 ? 1.8 : 1.3;

    ctx.beginPath();
    ctx.ellipse(
      source.x,
      source.y,
      radius,
      radius * 0.42,
      rotation,
      0,
      Math.PI * 2
    );
    ctx.stroke();
  }
}

function drawLakeWideRipples(
  ctx: CanvasRenderingContext2D,
  time: number
) {
  drawRippleSource(ctx, RIPPLE_SOURCES[0], time, -0.16, 1.1);
}

function drawSecondaryRipples(
  ctx: CanvasRenderingContext2D,
  time: number
) {
  drawRippleSource(ctx, RIPPLE_SOURCES[1], time, -0.16, 0.9);
  drawRippleSource(ctx, RIPPLE_SOURCES[2], time, -0.16, 0.85);
  drawRippleSource(ctx, RIPPLE_SOURCES[3], time, -0.2, 0.8);
}

function drawWaterSparkles(
  ctx: CanvasRenderingContext2D,
  time: number
) {
  for (let i = 0; i < 12; i++) {
    const zone = WATER_ZONES[i % WATER_ZONES.length];
    const px =
      zone.x +
      Math.cos(time * 0.35 + i * 1.7) * zone.rx * 0.42 +
      Math.sin(time * 0.9 + i) * 4;

    const py =
      zone.y +
      Math.sin(time * 0.28 + i * 1.4) * zone.ry * 0.3;

    const alpha = 0.03 + ((Math.sin(time * 1.4 + i * 2.1) + 1) * 0.5) * 0.06;

    ctx.fillStyle = `rgba(255,255,255,${alpha})`;
    ctx.beginPath();
    ctx.arc(px, py, 1.4, 0, Math.PI * 2);
    ctx.fill();
  }
}

export function drawWaterEffects(
  ctx: CanvasRenderingContext2D,
  time: number
) {
  ctx.save();
  clipToWater(ctx);

  drawSoftSurfaceSheen(ctx, time);
  drawLakeWideRipples(ctx, time);
  drawSecondaryRipples(ctx, time);
  drawWaterSparkles(ctx, time);

  ctx.restore();
}