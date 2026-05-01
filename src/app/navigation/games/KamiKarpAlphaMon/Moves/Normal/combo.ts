import { MoveDefinition, MoveAnimationInstance } from "../moveTypes";

const lerp = (a: number, b: number, t: number) => a + (b - a) * t;
const clamp = (v: number, min: number, max: number) =>
  Math.max(min, Math.min(max, v));

const easeOutCubic = (t: number) => 1 - Math.pow(1 - t, 3);
const easeInCubic = (t: number) => t * t * t;
const easeOutQuart = (t: number) => 1 - Math.pow(1 - t, 4);
const easeOutBack = (t: number) => {
  const c1 = 1.70158;
  const c3 = c1 + 1;
  return 1 + c3 * Math.pow(t - 1, 3) + c1 * Math.pow(t - 1, 2);
};

type HitSpark = {
  angle: number;
  speed: number;
  size: number;
};

function drawGloveSilhouette(ctx: CanvasRenderingContext2D, fill: string) {
  ctx.fillStyle = fill;
  ctx.beginPath();
  ctx.moveTo(34, 0);
  ctx.bezierCurveTo(31, -18, 12, -28, -6, -26);
  ctx.bezierCurveTo(-20, -24, -31, -14, -31, -3);
  ctx.bezierCurveTo(-31, 11, -20, 18, -7, 19);
  ctx.bezierCurveTo(8, 20, 22, 14, 28, 8);
  ctx.bezierCurveTo(34, 6, 37, 3, 34, 0);
  ctx.closePath();
  ctx.fill();

  // cuff block
  ctx.fillRect(-33, -8, 13, 16);
}

function drawGlove(
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  angle: number,
  scaleX: number,
  scaleY: number,
  alpha: number,
  flip: 1 | -1 = 1
) {
  ctx.save();
  ctx.translate(x, y);
  ctx.rotate(angle);
  ctx.scale(scaleX * flip, scaleY);
  ctx.globalAlpha = alpha;

  // long rear energy smears
  ctx.fillStyle = "rgba(255,255,255,0.05)";
  ctx.beginPath();
  ctx.ellipse(-42, 0, 52, 12, 0, 0, Math.PI * 2);
  ctx.fill();

  ctx.fillStyle = "rgba(255,70,70,0.08)";
  ctx.beginPath();
  ctx.ellipse(-22, 0, 30, 10, 0, 0, Math.PI * 2);
  ctx.fill();

  // chromatic fringe
  ctx.save();
  ctx.translate(-4, 0);
  drawGloveSilhouette(ctx, "rgba(0,255,255,0.12)");
  ctx.restore();

  ctx.save();
  ctx.translate(4, 0);
  drawGloveSilhouette(ctx, "rgba(255,0,140,0.12)");
  ctx.restore();

  // main glove
  drawGloveSilhouette(ctx, "rgba(211, 42, 42, 0.98)");

  // inner volume
  ctx.fillStyle = "rgba(255,120,120,0.34)";
  ctx.beginPath();
  ctx.moveTo(18, 0);
  ctx.bezierCurveTo(16, -10, 3, -16, -8, -15);
  ctx.bezierCurveTo(-17, -14, -21, -8, -21, -2);
  ctx.bezierCurveTo(-21, 7, -12, 11, -5, 11);
  ctx.bezierCurveTo(6, 11, 15, 7, 18, 0);
  ctx.closePath();
  ctx.fill();

  // knuckle pop
  ctx.fillStyle = "rgba(255,170,170,0.18)";
  ctx.beginPath();
  ctx.ellipse(13, -2, 10, 6, 0, 0, Math.PI * 2);
  ctx.fill();

  // cuff
  ctx.fillStyle = "rgba(255,255,255,0.86)";
  ctx.fillRect(-33, -8, 13, 16);

  ctx.fillStyle = "rgba(0,0,0,0.16)";
  ctx.fillRect(-33, 4, 13, 3);

  // top highlight
  ctx.strokeStyle = "rgba(255,255,255,0.42)";
  ctx.lineWidth = 2;
  ctx.lineCap = "round";
  ctx.beginPath();
  ctx.moveTo(15, -10);
  ctx.quadraticCurveTo(5, -16, -6, -10);
  ctx.stroke();

  ctx.restore();
}

function drawPunchTrail(
  ctx: CanvasRenderingContext2D,
  fromX: number,
  fromY: number,
  toX: number,
  toY: number,
  angle: number,
  flip: 1 | -1,
  count: number,
  baseAlpha: number,
  baseScaleX: number,
  baseScaleY: number
) {
  for (let i = 0; i < count; i++) {
    const t = i / count;
    const px = lerp(toX, fromX, t);
    const py = lerp(toY, fromY, t);
    const alpha = (1 - t) * baseAlpha;
    const sx = lerp(baseScaleX, 0.9, t);
    const sy = lerp(baseScaleY, 0.94, t);

    drawGlove(ctx, px, py, angle, sx, sy, alpha, flip);
  }
}

function drawSpeedSlash(
  ctx: CanvasRenderingContext2D,
  x1: number,
  y1: number,
  x2: number,
  y2: number,
  alpha: number,
  width: number
) {
  ctx.save();
  ctx.globalAlpha = alpha;

  ctx.strokeStyle = "white";
  ctx.lineWidth = width;
  ctx.lineCap = "round";
  ctx.beginPath();
  ctx.moveTo(x1, y1);
  ctx.lineTo(x2, y2);
  ctx.stroke();

  ctx.strokeStyle = "rgba(255,0,140,0.45)";
  ctx.lineWidth = width * 0.42;
  ctx.beginPath();
  ctx.moveTo(x1 - 5, y1 - 3);
  ctx.lineTo(x2 - 5, y2 - 3);
  ctx.stroke();

  ctx.strokeStyle = "rgba(0,255,255,0.45)";
  ctx.beginPath();
  ctx.moveTo(x1 + 5, y1 + 3);
  ctx.lineTo(x2 + 5, y2 + 3);
  ctx.stroke();

  ctx.restore();
}

function drawImpactBurst(
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  t: number,
  strength: number,
  sparks: HitSpark[],
  ringScaleX: number,
  ringScaleY: number
) {
  const ringT = easeOutCubic(t);

  // soft white bloom
  ctx.save();
  ctx.globalAlpha = 0.45 * (1 - t) * strength;
  ctx.fillStyle = "rgba(255,255,255,0.16)";
  ctx.beginPath();
  ctx.ellipse(
    x,
    y,
    24 + ringT * 34 * ringScaleX,
    14 + ringT * 18 * ringScaleY,
    0,
    0,
    Math.PI * 2
  );
  ctx.fill();
  ctx.restore();

  // compressed impact ring
  ctx.save();
  ctx.translate(x, y);
  ctx.scale(ringScaleX, ringScaleY);

  ctx.strokeStyle = `rgba(255,255,255,${0.76 * (1 - t) * strength})`;
  ctx.lineWidth = 3.5 - t * 1.6;
  ctx.beginPath();
  ctx.arc(0, 0, 14 + ringT * 24, 0, Math.PI * 2);
  ctx.stroke();

  ctx.strokeStyle = `rgba(255,0,140,${0.28 * (1 - t) * strength})`;
  ctx.lineWidth = 1.6;
  ctx.beginPath();
  ctx.arc(3, 0, 16 + ringT * 23, 0, Math.PI * 2);
  ctx.stroke();

  ctx.strokeStyle = `rgba(0,255,255,${0.28 * (1 - t) * strength})`;
  ctx.beginPath();
  ctx.arc(-3, 0, 16 + ringT * 23, 0, Math.PI * 2);
  ctx.stroke();

  ctx.restore();

  // impact star slashes
  ctx.save();
  ctx.translate(x, y);
  ctx.rotate(0.12);
  ctx.globalAlpha = (1 - t) * strength;

  ctx.strokeStyle = "rgba(255,255,255,0.62)";
  ctx.lineWidth = 3;
  ctx.lineCap = "round";

  ctx.beginPath();
  ctx.moveTo(-18 - ringT * 18, 0);
  ctx.lineTo(18 + ringT * 18, 0);
  ctx.stroke();

  ctx.beginPath();
  ctx.moveTo(0, -10 - ringT * 10);
  ctx.lineTo(0, 10 + ringT * 10);
  ctx.stroke();

  ctx.strokeStyle = "rgba(255,0,140,0.28)";
  ctx.lineWidth = 1.5;
  ctx.beginPath();
  ctx.moveTo(-14 - ringT * 12, -8 - ringT * 8);
  ctx.lineTo(14 + ringT * 12, 8 + ringT * 8);
  ctx.stroke();

  ctx.strokeStyle = "rgba(0,255,255,0.28)";
  ctx.beginPath();
  ctx.moveTo(-14 - ringT * 12, 8 + ringT * 8);
  ctx.lineTo(14 + ringT * 12, -8 - ringT * 8);
  ctx.stroke();

  ctx.restore();

  // shards
  ctx.save();
  for (let i = 0; i < sparks.length; i++) {
    const spark = sparks[i];
    const dist = spark.speed * ringT * strength;
    const sx = x + Math.cos(spark.angle) * dist;
    const sy = y + Math.sin(spark.angle) * dist * 0.72;

    ctx.fillStyle =
      i % 3 === 0
        ? `rgba(255,255,255,${0.8 * (1 - t) * strength})`
        : i % 3 === 1
        ? `rgba(255,0,140,${0.45 * (1 - t) * strength})`
        : `rgba(0,255,255,${0.45 * (1 - t) * strength})`;

    ctx.save();
    ctx.translate(sx, sy);
    ctx.rotate(spark.angle);
    ctx.fillRect(-spark.size * 0.6, -spark.size * 0.35, spark.size * 1.2, spark.size * 0.7);
    ctx.restore();
  }
  ctx.restore();
}

export function createComboAnimation(args: {
  userX: number;
  userY: number;
  targetX: number;
  targetY: number;
}): MoveAnimationInstance {
  const { userX, userY, targetX, targetY } = args;

  const startX = userX + 112;
  const startY = userY - 152;

  const jabStartX = userX + 84;
  const jabStartY = userY - 160;
  const hit1X = targetX - 66;
  const hit1Y = targetY - 126;

  const resetX = userX + 98;
  const resetY = userY - 132;

  const crossStartX = userX + 132;
  const crossStartY = userY - 118;
  const hit2X = targetX - 18;
  const hit2Y = targetY - 92;

  const windupDur = 0.07;
  const punch1Dur = 0.11;
  const resetDur = 0.085;
  const punch2Dur = 0.145;
  const holdDur = 0.06;
  const settleDur = 0.12;

  const totalDuration =
    windupDur + punch1Dur + resetDur + punch2Dur + holdDur + settleDur;

  const punch1Start = windupDur;
  const resetStart = punch1Start + punch1Dur;
  const punch2Start = resetStart + resetDur;
  const holdStart = punch2Start + punch2Dur;
  const settleStart = holdStart + holdDur;

  let time = 0;
  let screenShake = 0;

  const sparks1: HitSpark[] = Array.from({ length: 8 }, (_, i) => ({
    angle: (-0.95 + (i / 7) * 1.9) * Math.PI * 0.52,
    speed: 20 + i * 4,
    size: 3 + (i % 2),
  }));

  const sparks2: HitSpark[] = Array.from({ length: 12 }, (_, i) => ({
    angle: (-1 + (i / 11) * 2) * Math.PI * 0.62,
    speed: 26 + i * 5,
    size: 3 + (i % 3),
  }));

  return {
    update(dt: number) {
      time += dt;

      const jabImpactAt = punch1Start + punch1Dur * 0.8;
      const crossImpactAt = punch2Start + punch2Dur * 0.84;

      const justHit1 = time >= jabImpactAt && time - dt < jabImpactAt;
      const justHit2 = time >= crossImpactAt && time - dt < crossImpactAt;

      if (justHit1) screenShake = 8;
      if (justHit2) screenShake = 15;

      if (screenShake > 0.01) {
        screenShake *= 0.82;
      } else {
        screenShake = 0;
      }
    },

    draw(ctx: CanvasRenderingContext2D) {
      ctx.save();

      if (screenShake > 0) {
        ctx.translate(
          (Math.random() - 0.5) * screenShake,
          (Math.random() - 0.5) * screenShake * 0.72
        );
      }

      // 1) pre-combo chamber
      if (time < punch1Start) {
        const t = clamp(time / windupDur, 0, 1);
        const e = easeInCubic(t);

        const px = lerp(startX, jabStartX, e);
        const py = lerp(startY, jabStartY, e);
        const angle = lerp(-0.12, -0.3, t);

        drawGlove(ctx, px, py, angle, lerp(0.94, 1.0, t), lerp(0.94, 1.02, t), 0.86, 1);
      }

      // 2) jab
      else if (time < resetStart) {
        const t = clamp((time - punch1Start) / punch1Dur, 0, 1);
        const e = easeOutQuart(t);

        const px = lerp(jabStartX, hit1X, e);
        const py = lerp(jabStartY, hit1Y, e);
        const angle = lerp(-0.26, -0.04, t);

        drawPunchTrail(
          ctx,
          jabStartX,
          jabStartY,
          px,
          py,
          angle,
          1,
          5,
          0.13,
          1.2,
          1.02
        );

        drawSpeedSlash(
          ctx,
          px - 54,
          py - 10,
          px + 26,
          py + 1,
          0.26 * (1 - t * 0.35),
          3.5
        );

        drawGlove(ctx, px, py, angle, lerp(1.0, 1.12, t), lerp(1.0, 1.04, t), 1, 1);

        if (t > 0.72) {
          drawImpactBurst(
            ctx,
            hit1X + 10,
            hit1Y,
            (t - 0.72) / 0.28,
            0.82,
            sparks1,
            1.45,
            0.92
          );
        }
      }

      // 3) reset back toward player side
      else if (time < punch2Start) {
        const t = clamp((time - resetStart) / resetDur, 0, 1);
        const e = easeInCubic(t);

        const px = lerp(hit1X - 6, resetX, e);
        const py = lerp(hit1Y - 2, resetY, e);
        const angle = lerp(-0.1, -0.35, t);

        drawGlove(ctx, px, py, angle, lerp(1.0, 0.98, t), lerp(1.0, 1.0, t), 0.62, 1);
      }

      // 4) heavy cross
      else if (time < holdStart) {
        const t = clamp((time - punch2Start) / punch2Dur, 0, 1);
        const e = easeOutBack(t);

        const px = lerp(crossStartX, hit2X, e);
        const py = lerp(crossStartY, hit2Y, e);
        const angle = lerp(-0.08, 0.22, t);

        drawPunchTrail(
          ctx,
          crossStartX,
          crossStartY,
          px,
          py,
          angle,
          -1,
          6,
          0.16,
          1.34,
          1.0
        );

        drawSpeedSlash(
          ctx,
          px - 78,
          py - 18,
          px + 40,
          py + 10,
          0.34 * (1 - t * 0.3),
          4.8
        );

        drawGlove(
          ctx,
          px,
          py,
          angle,
          lerp(1.08, 1.28, t),
          lerp(0.98, 1.04, t),
          1,
          -1
        );

        if (t > 0.64) {
          drawImpactBurst(
            ctx,
            hit2X + 16,
            hit2Y + 4,
            (t - 0.64) / 0.36,
            1.18,
            sparks2,
            1.72,
            0.96
          );
        }
      }

      // 5) brief hold on strong second contact
      else if (time < settleStart) {
        const t = clamp((time - holdStart) / holdDur, 0, 1);
        const holdAlpha = lerp(0.28, 0.08, t);

        drawGlove(
          ctx,
          hit2X + 4,
          hit2Y - 1,
          0.18,
          lerp(1.16, 1.08, t),
          1.02,
          holdAlpha,
          -1
        );
      }

      // 6) fade
      else if (time < totalDuration) {
        const t = clamp((time - settleStart) / settleDur, 0, 1);

        const px = lerp(hit2X + 8, hit2X + 28, t);
        const py = lerp(hit2Y - 2, hit2Y - 10, t);
        const angle = lerp(0.16, 0.04, t);
        const alpha = lerp(0.22, 0.03, t);

        drawGlove(ctx, px, py, angle, lerp(1.05, 0.95, t), 1, alpha, -1);
      }

      ctx.restore();
    },

    isDone: () => time >= totalDuration,
  };
}

export const comboMove: MoveDefinition = {
  id: "COMBO",
  name: "Combo",
  power: 20,
  staminaCost: 10,
  speed: 20,
  createAnimation: createComboAnimation,
};