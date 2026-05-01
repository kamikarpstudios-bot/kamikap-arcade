import { MoveDefinition, MoveAnimationInstance } from "../moveTypes";

const lerp = (a: number, b: number, t: number) => a + (b - a) * t;
const clamp = (v: number, min: number, max: number) =>
  Math.max(min, Math.min(max, v));

const easeOutCubic = (t: number) => 1 - Math.pow(1 - t, 3);
const easeInCubic = (t: number) => t * t * t;
const easeInOutCubic = (t: number) =>
  t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2;
const easeOutExpo = (t: number) =>
  t === 1 ? 1 : 1 - Math.pow(2, -10 * t);

function drawBlitzShape(
  ctx: CanvasRenderingContext2D,
  fill: string
) {
  ctx.fillStyle = fill;
  ctx.beginPath();
  ctx.moveTo(42, 0);
  ctx.lineTo(10, -24);
  ctx.lineTo(-18, -22);
  ctx.lineTo(-48, -10);
  ctx.lineTo(-38, 0);
  ctx.lineTo(-48, 10);
  ctx.lineTo(-18, 22);
  ctx.lineTo(10, 24);
  ctx.closePath();
  ctx.fill();
}

function drawMonsterBlitz(
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  angle: number,
  stretchX: number,
  stretchY: number,
  alpha: number
) {
  ctx.save();
  ctx.translate(x, y);
  ctx.rotate(angle);
  ctx.scale(stretchX, stretchY);
  ctx.globalAlpha = alpha;

  // soft rear energy smear
  ctx.fillStyle = "rgba(255, 255, 255, 0.08)";
  ctx.beginPath();
  ctx.ellipse(-42, 0, 54, 18, 0, 0, Math.PI * 2);
  ctx.fill();

  ctx.fillStyle = "rgba(255, 255, 255, 0.12)";
  ctx.beginPath();
  ctx.ellipse(-22, 0, 38, 14, 0, 0, Math.PI * 2);
  ctx.fill();

  // chromatic fringe layers
  ctx.save();
  ctx.translate(-4, 0);
  drawBlitzShape(ctx, "rgba(0, 255, 255, 0.18)");
  ctx.restore();

  ctx.save();
  ctx.translate(4, 0);
  drawBlitzShape(ctx, "rgba(255, 0, 140, 0.18)");
  ctx.restore();

  // main white body, faded down a bit
  drawBlitzShape(ctx, "rgba(255, 255, 255, 0.72)");

  // inner bright core
  ctx.fillStyle = "rgba(255,255,255,0.35)";
  ctx.beginPath();
  ctx.moveTo(24, 0);
  ctx.lineTo(4, -13);
  ctx.lineTo(-14, -11);
  ctx.lineTo(-30, -4);
  ctx.lineTo(-24, 0);
  ctx.lineTo(-30, 4);
  ctx.lineTo(-14, 11);
  ctx.lineTo(4, 13);
  ctx.closePath();
  ctx.fill();

  // forward cut line
  ctx.strokeStyle = "rgba(255,255,255,0.48)";
  ctx.lineWidth = 2.2;
  ctx.lineCap = "round";
  ctx.beginPath();
  ctx.moveTo(-2, -12);
  ctx.lineTo(24, 0);
  ctx.lineTo(-2, 12);
  ctx.stroke();

  // little chromatic cut accents
  ctx.strokeStyle = "rgba(0,255,255,0.28)";
  ctx.lineWidth = 1.4;
  ctx.beginPath();
  ctx.moveTo(0, -11);
  ctx.lineTo(26, 0);
  ctx.stroke();

  ctx.strokeStyle = "rgba(255,0,140,0.28)";
  ctx.beginPath();
  ctx.moveTo(0, 11);
  ctx.lineTo(26, 0);
  ctx.stroke();

  // eye / energy streak
  ctx.fillStyle = "rgba(255,255,255,0.7)";
  ctx.beginPath();
  ctx.ellipse(15, -5, 10, 2.4, 0, 0, Math.PI * 2);
  ctx.fill();

  ctx.restore();
}

type ShockShard = {
  angle: number;
  speed: number;
  size: number;
};

export function createBlitzAnimation(args: {
  userX: number;
  userY: number;
  targetX: number;
  targetY: number;
}): MoveAnimationInstance {
  const { userX, userY, targetX, targetY } = args;

  const startX = userX + 36;
  const startY = userY - 128;

  const exitX = -240;
  const exitY = startY - 10;

  const entryX = targetX - 260;
  const entryY = targetY - 300;

  const hitX = targetX - 18;
  const hitY = targetY - 102;

  const exitDur = 0.14;
  const pauseDur = 0.04;
  const strikeDur = 0.14;
  const impactDur = 0.16;
  const returnDur = 0.18;

  const totalDuration = exitDur + pauseDur + strikeDur + impactDur + returnDur;

  const strikeStart = exitDur + pauseDur;
  const impactStart = strikeStart + strikeDur;
  const returnStart = impactStart + impactDur;

  let time = 0;
  let screenShake = 0;
  let didImpact = false;

  const shards: ShockShard[] = Array.from({ length: 8 }, (_, i) => ({
    angle: (-0.8 + (i / 7) * 1.6) * Math.PI,
    speed: 52 + i * 8,
    size: 3 + (i % 3),
  }));

  function drawTrail(
    ctx: CanvasRenderingContext2D,
    fromX: number,
    fromY: number,
    toX: number,
    toY: number,
    count: number,
    angle: number
  ) {
    for (let i = 0; i < count; i++) {
      const t = i / count;
      const px = lerp(toX, fromX, t);
      const py = lerp(toY, fromY, t);
      const alpha = (1 - t) * 0.12;
      const sx = lerp(1.7, 1.15, t);
      const sy = lerp(1.22, 1.0, t);
      drawMonsterBlitz(ctx, px, py, angle, sx, sy, alpha);
    }
  }

  return {
    shouldHideUser: true,

    update(dt: number) {
      time += dt;

      if (!didImpact && time >= impactStart) {
        didImpact = true;
        screenShake = 16;
      }

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
          (Math.random() - 0.5) * screenShake * 0.7
        );
      }

      // 1) EXIT LEFT
      if (time < exitDur) {
        const t = clamp(time / exitDur, 0, 1);
        const e = easeInCubic(t);

        const px = lerp(startX, exitX, e);
        const py = lerp(startY, exitY, e);
        const angle = Math.PI;

        drawTrail(ctx, startX, startY, px, py, 4, angle);

        const squashX = lerp(1.55, 2.0, e);
        const squashY = lerp(1.2, 0.95, e);
        drawMonsterBlitz(ctx, px, py, angle, squashX, squashY, 0.9);
      }

      // 2) STRIKE
      else if (time >= strikeStart && time < impactStart) {
        const t = clamp((time - strikeStart) / strikeDur, 0, 1);
        const e = easeOutExpo(t);

        const px = lerp(entryX, hitX, e);
        const py = lerp(entryY, hitY, e);

        const angle = Math.atan2(hitY - entryY, hitX - entryX);

        drawTrail(ctx, entryX, entryY, px, py, 5, angle);

        const stretchX = lerp(2.15, 1.45, t);
        const stretchY = lerp(0.92, 1.08, t);

        // main slash line
        ctx.save();
        ctx.globalAlpha = 0.38 * (1 - t * 0.4);
        ctx.strokeStyle = "white";
        ctx.lineWidth = 4;
        ctx.lineCap = "round";
        ctx.beginPath();
        ctx.moveTo(px - 65, py - 24);
        ctx.lineTo(px + 48, py + 12);
        ctx.stroke();
        ctx.restore();

        // chromatic slash fringes
        ctx.save();
        ctx.globalAlpha = 0.22 * (1 - t * 0.45);
        ctx.strokeStyle = "cyan";
        ctx.lineWidth = 2;
        ctx.lineCap = "round";
        ctx.beginPath();
        ctx.moveTo(px - 68, py - 28);
        ctx.lineTo(px + 45, py + 8);
        ctx.stroke();

        ctx.strokeStyle = "rgb(255, 0, 140)";
        ctx.beginPath();
        ctx.moveTo(px - 61, py - 19);
        ctx.lineTo(px + 52, py + 17);
        ctx.stroke();
        ctx.restore();

        drawMonsterBlitz(ctx, px, py, angle, stretchX, stretchY, 0.95);
      }

      // 3) IMPACT
      else if (time >= impactStart && time < returnStart) {
        const t = clamp((time - impactStart) / impactDur, 0, 1);
        const ringT = easeOutCubic(t);

        // impact flash
        ctx.save();
        ctx.globalAlpha = 0.55 * (1 - t);
        ctx.fillStyle = "rgba(255,255,255,0.18)";
        ctx.beginPath();
        ctx.ellipse(hitX, hitY, 42 + ringT * 36, 20 + ringT * 12, 0, 0, Math.PI * 2);
        ctx.fill();
        ctx.restore();

        // white ring
        ctx.save();
        ctx.translate(hitX, hitY);
        ctx.scale(1.9, 1);
        ctx.strokeStyle = `rgba(255,255,255,${0.6 - t * 0.45})`;
        ctx.lineWidth = 4 - t * 2.2;
        ctx.beginPath();
        ctx.arc(0, 0, 20 + ringT * 46, 0, Math.PI * 2);
        ctx.stroke();
        ctx.restore();

        // chromatic rings
        ctx.save();
        ctx.translate(hitX, hitY);
        ctx.scale(1.95, 1.02);
        ctx.strokeStyle = `rgba(0,255,255,${0.28 - t * 0.2})`;
        ctx.lineWidth = 2;
        ctx.beginPath();
        ctx.arc(-3, 0, 22 + ringT * 44, 0, Math.PI * 2);
        ctx.stroke();

        ctx.strokeStyle = `rgba(255,0,140,${0.28 - t * 0.2})`;
        ctx.beginPath();
        ctx.arc(3, 0, 22 + ringT * 44, 0, Math.PI * 2);
        ctx.stroke();
        ctx.restore();

        // shards
        ctx.save();
        for (const [index, shard] of shards.entries()) {
          const dist = shard.speed * ringT;
          const sx = hitX + Math.cos(shard.angle) * dist;
          const sy = hitY + Math.sin(shard.angle) * dist * 0.62;

          const color =
            index % 3 === 0
              ? `rgba(0,255,255,${0.6 - t * 0.45})`
              : index % 3 === 1
              ? `rgba(255,0,140,${0.6 - t * 0.45})`
              : `rgba(255,255,255,${0.5 - t * 0.38})`;

          ctx.fillStyle = color;
          ctx.fillRect(
            sx - shard.size * 0.5,
            sy - shard.size * 0.5,
            shard.size,
            shard.size
          );
        }
        ctx.restore();

        // faint silhouette hold for readability
        drawMonsterBlitz(ctx, hitX, hitY, 0.15, 1.28, 1.06, 0.2 * (1 - t));
      }

      // 4) RETURN
      else if (time >= returnStart && time < totalDuration) {
        const t = clamp((time - returnStart) / returnDur, 0, 1);
        const e = easeInOutCubic(t);

        const px = lerp(hitX, startX, e);
        const py = lerp(hitY, startY, e);

        const angle = Math.atan2(startY - hitY, startX - hitX);

        drawTrail(ctx, hitX, hitY, px, py, 4, angle);

        const stretchX = lerp(1.5, 1.0, t);
        const stretchY = lerp(1.0, 1.0, t);
        const alpha = lerp(0.5, 0.12, t);

        drawMonsterBlitz(ctx, px, py, angle, stretchX, stretchY, alpha);
      }

      ctx.restore();
    },

    isDone: () => time >= totalDuration,
  };
}

export const blitzMove: MoveDefinition = {
  id: "BLITZ",
  name: "Blitz",
  power: 20,
  staminaCost: 10,
  speed:11,
  createAnimation: createBlitzAnimation,
};