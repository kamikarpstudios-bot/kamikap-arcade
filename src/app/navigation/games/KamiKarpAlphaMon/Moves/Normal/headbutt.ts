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

type DustParticle = {
  x: number;
  y: number;
  vx: number;
  vy: number;
  radius: number;
  alpha: number;
  life: number;
  decay: number;
};

function updateDustParticle(p: DustParticle, dt: number) {
  const frame = dt * 60;

  p.vx *= Math.pow(0.92, frame);
  p.vy *= Math.pow(0.92, frame);
  p.x += p.vx * frame;
  p.y += p.vy * frame;
  p.radius += 0.35 * frame;
  p.life -= p.decay * frame;
}

function drawDustParticle(ctx: CanvasRenderingContext2D, p: DustParticle) {
  if (p.life <= 0) return;

  ctx.save();
  ctx.globalAlpha = p.alpha * Math.max(0, p.life);
  ctx.fillStyle = "rgba(255,255,255,0.75)";
  ctx.beginPath();
  ctx.ellipse(p.x, p.y, p.radius, p.radius * 0.72, 0, 0, Math.PI * 2);
  ctx.fill();
  ctx.restore();
}

function drawHelmet(
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

  const helmetRed = "#d91e1e";
  const grillGray = "#cbd5e1";

  // rear smear
  ctx.fillStyle = "rgba(0,0,0,0.16)";
  ctx.beginPath();
  ctx.ellipse(-26, 0, 34, 12, 0, 0, Math.PI * 2);
  ctx.fill();

  ctx.fillStyle = "rgba(0,0,0,0.28)";
  ctx.beginPath();
  ctx.ellipse(-12, 0, 22, 9, 0, 0, Math.PI * 2);
  ctx.fill();

  // shell
  ctx.fillStyle = helmetRed;
  ctx.beginPath();
  ctx.arc(0, 0, 35, Math.PI * 1.08, Math.PI * 0.72);
  ctx.lineTo(24, 34);
  ctx.lineTo(40, 14);
  ctx.closePath();
  ctx.fill();

  // stripe
  ctx.fillStyle = "white";
  ctx.beginPath();
  ctx.ellipse(0, -21, 23, 7, 0, 0, Math.PI * 2);
  ctx.fill();

  // facemask
  ctx.strokeStyle = grillGray;
  ctx.lineWidth = 4;
  ctx.lineCap = "round";

  for (let i = 0; i < 3; i++) {
    const gx = 18 + i * 8;
    ctx.beginPath();
    ctx.moveTo(gx, 5);
    ctx.lineTo(gx, 29);
    ctx.stroke();
  }

  ctx.beginPath();
  ctx.moveTo(15, 10);
  ctx.lineTo(42, 10);
  ctx.moveTo(15, 22);
  ctx.lineTo(42, 22);
  ctx.stroke();

  // face opening shadow
  ctx.fillStyle = "rgba(0,0,0,0.18)";
  ctx.beginPath();
  ctx.ellipse(12, 6, 11, 9, 0, 0, Math.PI * 2);
  ctx.fill();

  // tiny highlight
  ctx.strokeStyle = "rgba(255,255,255,0.7)";
  ctx.lineWidth = 2;
  ctx.beginPath();
  ctx.moveTo(-14, -18);
  ctx.lineTo(3, -24);
  ctx.stroke();

  ctx.restore();
}

export function createHeadbuttAnimation(args: {
  userX: number;
  userY: number;
  targetX: number;
  targetY: number;
}): MoveAnimationInstance {
  const { userX, userY, targetX, targetY } = args;

  const startX = userX + 18;
  const startY = userY - 108;

  const windupX = startX - 30;
  const windupY = startY + 4;

  const hitX = targetX - 48;
  const hitY = targetY - 88;

  const returnX = startX;
  const returnY = startY;

  const windupDur = 0.09;
  const rushDur = 0.11;
  const impactDur = 0.13;
  const returnDur = 0.12;

  const totalDuration = windupDur + rushDur + impactDur + returnDur;

  const impactStart = windupDur + rushDur;
  const returnStart = impactStart + impactDur;

  let time = 0;
  let screenShake = 0;
  let didImpact = false;
  let trailSpawnTimer = 0;

  const particles: DustParticle[] = [];

  const addDust = (
    x: number,
    y: number,
    spreadX: number,
    spreadY: number,
    count: number,
    vxBias: number,
    vyBias: number
  ) => {
    for (let i = 0; i < count; i++) {
      particles.push({
        x: x + (Math.random() - 0.5) * spreadX,
        y: y + (Math.random() - 0.5) * spreadY,
        vx: vxBias + (Math.random() - 0.5) * 3.5,
        vy: vyBias + (Math.random() - 0.5) * 3.5,
        radius: 4 + Math.random() * 7,
        alpha: 0.45 + Math.random() * 0.3,
        life: 1,
        decay: 0.035 + Math.random() * 0.025,
      });
    }
  };

  return {
    shouldHideUser: true,

    update(dt: number) {
      time += dt;

      const rushT = clamp((time - windupDur) / rushDur, 0, 1);

      if (time >= windupDur && time < impactStart) {
        trailSpawnTimer -= dt;
        if (trailSpawnTimer <= 0 && rushT > 0.08 && rushT < 0.92) {
          const e = easeOutExpo(rushT);
          const px = lerp(windupX, hitX, e);
          const py = lerp(windupY, hitY, e);

          addDust(px - 28, py + 4, 10, 18, 2, -1.8, 0);
          trailSpawnTimer = 0.018;
        }
      }

      if (!didImpact && time >= impactStart) {
        didImpact = true;
        screenShake = 18;

        addDust(hitX + 16, hitY + 2, 26, 30, 12, 2.2, 0);
        addDust(hitX - 8, hitY + 10, 16, 18, 7, -1.2, 0.5);
      }

      if (screenShake > 0.01) {
        screenShake *= 0.82;
      } else {
        screenShake = 0;
      }

      for (let i = particles.length - 1; i >= 0; i--) {
        updateDustParticle(particles[i], dt);
        if (particles[i].life <= 0) {
          particles.splice(i, 1);
        }
      }
    },

    draw(ctx: CanvasRenderingContext2D) {
      ctx.save();

      if (screenShake > 0) {
        ctx.translate(
          (Math.random() - 0.5) * screenShake,
          (Math.random() - 0.5) * screenShake * 0.65
        );
      }

      for (const p of particles) {
        drawDustParticle(ctx, p);
      }

      // 1) WINDUP
      if (time < windupDur) {
        const t = clamp(time / windupDur, 0, 1);
        const e = easeInOutCubic(t);

        const px = lerp(startX, windupX, e);
        const py = lerp(startY, windupY, e);

        const squashX = lerp(1.0, 0.82, e);
        const squashY = lerp(1.0, 1.18, e);

        drawHelmet(ctx, px, py, -0.16, squashX, squashY, 1);

        ctx.save();
        ctx.globalAlpha = 0.28 * (1 - t);
        ctx.strokeStyle = "white";
        ctx.lineWidth = 2;
        ctx.lineCap = "round";
        for (let i = 0; i < 3; i++) {
          const ly = py - 12 + i * 12;
          ctx.beginPath();
          ctx.moveTo(px - 22 - i * 7, ly);
          ctx.lineTo(px - 8, ly);
          ctx.stroke();
        }
        ctx.restore();
      }

      // 2) RUSH
      else if (time < impactStart) {
        const t = clamp((time - windupDur) / rushDur, 0, 1);
        const e = easeOutExpo(t);

        const px = lerp(windupX, hitX, e);
        const py = lerp(windupY, hitY, e);
        const angle = Math.atan2(hitY - windupY, hitX - windupX);

        for (let i = 0; i < 4; i++) {
          const tt = i / 4;
          const tx = lerp(px, windupX, tt);
          const ty = lerp(py, windupY, tt);
          drawHelmet(ctx, tx, ty, angle, lerp(1.42, 1.05, tt), lerp(0.9, 1.0, tt), 0.12 * (1 - tt));
        }

        ctx.save();
        ctx.globalAlpha = 0.42 * (1 - t * 0.4);
        ctx.strokeStyle = "white";
        ctx.lineWidth = 4;
        ctx.lineCap = "round";
        ctx.beginPath();
        ctx.moveTo(px - 54, py + 3);
        ctx.lineTo(px + 16, py + 1);
        ctx.stroke();
        ctx.restore();

        const stretchX = lerp(1.82, 1.18, t);
        const stretchY = lerp(0.84, 1.04, t);
        drawHelmet(ctx, px, py, angle, stretchX, stretchY, 1);
      }

      // 3) IMPACT
      else if (time < returnStart) {
        const t = clamp((time - impactStart) / impactDur, 0, 1);
        const e = easeOutCubic(t);

        const impactSquash = 1 + Math.sin(t * Math.PI) * 0.22;

        drawHelmet(
          ctx,
          hitX - 2,
          hitY,
          0.08,
          1.14 / impactSquash,
          1.05 * impactSquash,
          1
        );

        ctx.save();
        ctx.globalAlpha = 0.95 - t * 0.95;
        ctx.fillStyle = "rgba(255,255,255,0.22)";
        ctx.beginPath();
        ctx.ellipse(hitX + 16, hitY, 24 + e * 34, 15 + e * 9, 0, 0, Math.PI * 2);
        ctx.fill();
        ctx.restore();

        ctx.save();
        ctx.translate(hitX + 14, hitY);
        ctx.scale(1.45, 0.9);
        ctx.strokeStyle = `rgba(255,255,255,${0.95 - t})`;
        ctx.lineWidth = 4 - t * 1.9;
        ctx.beginPath();
        ctx.arc(0, 0, 14 + e * 32, 0, Math.PI * 2);
        ctx.stroke();
        ctx.restore();

        ctx.save();
        ctx.translate(hitX + 14, hitY);
        ctx.globalAlpha = 0.78 * (1 - t);
        ctx.strokeStyle = "white";
        ctx.lineWidth = 3;
        ctx.lineCap = "round";
        ctx.beginPath();
        ctx.moveTo(-16, 0);
        ctx.lineTo(16, 0);
        ctx.moveTo(0, -16);
        ctx.lineTo(0, 16);
        ctx.moveTo(-10, -10);
        ctx.lineTo(10, 10);
        ctx.moveTo(-10, 10);
        ctx.lineTo(10, -10);
        ctx.stroke();
        ctx.restore();
      }

      // 4) RETURN
      else {
        const t = clamp((time - returnStart) / returnDur, 0, 1);
        const e = easeInCubic(t);

        const px = lerp(hitX - 2, returnX, e);
        const py = lerp(hitY, returnY, e);
        const angle = Math.atan2(returnY - hitY, returnX - hitX);

        for (let i = 0; i < 3; i++) {
          const tt = i / 3;
          const tx = lerp(px, hitX - 2, tt);
          const ty = lerp(py, hitY, tt);
          drawHelmet(ctx, tx, ty, angle, lerp(1.2, 1.0, tt), 1, 0.1 * (1 - tt));
        }

        drawHelmet(ctx, px, py, angle, lerp(1.18, 1.0, t), 1, lerp(0.7, 0.08, t));
      }

      ctx.restore();
    },

    isDone: () => time >= totalDuration,
  };
}

export const headbuttMove: MoveDefinition = {
  id: "GRIDIRON_CRASH",
  name: "Gridiron Crash",
  power: 20,
  staminaCost: 10,
  speed: 5,
  createAnimation: createHeadbuttAnimation,
};