import { MoveDefinition, MoveAnimationInstance } from "../moveTypes";

const lerp = (a: number, b: number, t: number) => a + (b - a) * t;
const clamp = (v: number, min: number, max: number) =>
  Math.max(min, Math.min(max, v));

const easeOutCubic = (t: number) => 1 - Math.pow(1 - t, 3);
const easeInCubic = (t: number) => t * t * t;
const easeOutBack = (t: number) => {
  const c1 = 1.70158;
  const c3 = c1 + 1;
  return 1 + c3 * Math.pow(t - 1, 3) + c1 * Math.pow(t - 1, 2);
};

type SlimeParticle = {
  angle: number;
  speed: number;
  size: number;
  life: number;
  maxLife: number;
  offsetY: number;
};

export function createLickAnimation(args: {
  userX: number;
  userY: number;
  targetX: number;
  targetY: number;
}): MoveAnimationInstance {
  const { userX, userY, targetX, targetY } = args;

  const mouthX = userX + 44;
  const mouthY = userY - 118;

  const hitX = targetX - 18;
  const hitY = targetY - 92;

  const shootDur = 0.11;
  const stickDur = 0.16;
  const retractDur = 0.22;
  const totalDuration = shootDur + stickDur + retractDur;

  let time = 0;
  let screenShake = 0;
  let hitFlash = 0;
  let didImpact = false;

  const particles: SlimeParticle[] = [];

  function spawnImpactParticles() {
    for (let i = 0; i < 8; i++) {
      particles.push({
        angle: -0.5 + (i / 7) * 1.3 + (Math.random() - 0.5) * 0.35,
        speed: 70 + Math.random() * 90,
        size: 4 + Math.random() * 5,
        life: 0.18 + Math.random() * 0.12,
        maxLife: 0.18 + Math.random() * 0.12,
        offsetY: (Math.random() - 0.5) * 14,
      });
    }
  }

  return {
    shouldHideUser: false,

    update(dt: number) {
      time += dt;

      if (!didImpact && time >= shootDur) {
        didImpact = true;
        screenShake = 9;
        hitFlash = 1;
        spawnImpactParticles();
      }

      if (screenShake > 0.1) screenShake *= 0.78;
      if (hitFlash > 0) hitFlash -= dt * 7;

      for (let i = particles.length - 1; i >= 0; i--) {
        particles[i].life -= dt;
        if (particles[i].life <= 0) {
          particles.splice(i, 1);
        }
      }
    },

    draw(ctx: CanvasRenderingContext2D) {
      const shootT = clamp(time / shootDur, 0, 1);
      const stickT = clamp((time - shootDur) / stickDur, 0, 1);
      const retractT = clamp((time - shootDur - stickDur) / retractDur, 0, 1);

      let tipX = mouthX;
      let tipY = mouthY;
      let alpha = 1;
      let bodyWidth = 16;
      let curveLift = 0;
      let impactSquash = 1;

      if (time < shootDur) {
        const t = easeOutBack(shootT);
        tipX = lerp(mouthX, hitX, t);
        tipY = lerp(mouthY, hitY, t);

        bodyWidth = lerp(24, 13, shootT);
        curveLift = lerp(42, 12, shootT);
      } else if (time < shootDur + stickDur) {
        const wobble = Math.sin(stickT * Math.PI * 3.5) * (1 - stickT) * 8;
        tipX = hitX + wobble * 0.6;
        tipY = hitY + wobble * 0.25;

        bodyWidth = 13;
        curveLift = 10;
        impactSquash = 1 + Math.sin(stickT * Math.PI * 2.5) * 0.16;
      } else {
        const t = easeInCubic(retractT);
        tipX = lerp(hitX, mouthX, t);
        tipY = lerp(hitY, mouthY + 8, t);

        bodyWidth = lerp(13, 8, retractT);
        curveLift = lerp(16, 55, retractT);
        alpha = 1 - retractT * 0.9;
      }

      const dx = tipX - mouthX;
      const dy = tipY - mouthY;
      const dist = Math.sqrt(dx * dx + dy * dy);
      const nx = dist > 0 ? -dy / dist : 0;
      const ny = dist > 0 ? dx / dist : 0;

      const midX = (mouthX + tipX) * 0.5;
      const midY = (mouthY + tipY) * 0.5;

      const controlX = midX + nx * curveLift;
      const controlY = midY + ny * curveLift + 8;

      ctx.save();

      if (screenShake > 0.4) {
        ctx.translate(
          (Math.random() - 0.5) * screenShake,
          (Math.random() - 0.5) * screenShake * 0.7
        );
      }

      if (time < totalDuration) {
        ctx.globalAlpha = alpha;

        // under-shadow / slime glow
        ctx.save();
        ctx.lineCap = "round";
        ctx.lineJoin = "round";
        ctx.strokeStyle = "rgba(140, 20, 55, 0.28)";
        ctx.lineWidth = bodyWidth + 8;
        ctx.shadowBlur = 12;
        ctx.shadowColor = "rgba(255, 70, 140, 0.25)";
        ctx.beginPath();
        ctx.moveTo(mouthX, mouthY);
        ctx.quadraticCurveTo(controlX, controlY, tipX, tipY);
        ctx.stroke();
        ctx.restore();

        // main tongue body
        ctx.save();
        ctx.lineCap = "round";
        ctx.lineJoin = "round";
        ctx.strokeStyle = "#ff7fa7";
        ctx.lineWidth = bodyWidth;
        ctx.beginPath();
        ctx.moveTo(mouthX, mouthY);
        ctx.quadraticCurveTo(controlX, controlY, tipX, tipY);
        ctx.stroke();
        ctx.restore();

        // dark underside
        ctx.save();
        ctx.lineCap = "round";
        ctx.lineJoin = "round";
        ctx.strokeStyle = "rgba(190, 58, 102, 0.95)";
        ctx.lineWidth = Math.max(4, bodyWidth * 0.42);
        ctx.beginPath();
        ctx.moveTo(mouthX + nx * 2, mouthY + ny * 2);
        ctx.quadraticCurveTo(
          controlX + nx * 3,
          controlY + ny * 3,
          tipX + nx * 1.5,
          tipY + ny * 1.5
        );
        ctx.stroke();
        ctx.restore();

        // wet highlight
        ctx.save();
        ctx.lineCap = "round";
        ctx.lineJoin = "round";
        ctx.strokeStyle = "rgba(255,255,255,0.45)";
        ctx.lineWidth = Math.max(2, bodyWidth * 0.18);
        ctx.beginPath();
        ctx.moveTo(mouthX - nx * 2, mouthY - ny * 2);
        ctx.quadraticCurveTo(
          controlX - nx * 3,
          controlY - ny * 3,
          tipX - nx * 1.5,
          tipY - ny * 1.5
        );
        ctx.stroke();
        ctx.restore();

        // tongue root at mouth
        ctx.save();
        ctx.fillStyle = "#e95f8b";
        ctx.beginPath();
        ctx.ellipse(mouthX, mouthY, 10, 7, Math.atan2(dy, dx), 0, Math.PI * 2);
        ctx.fill();
        ctx.restore();

      // tip / slap pad
ctx.save();
ctx.translate(tipX, tipY);
ctx.rotate(Math.atan2(dy, dx));

const tipW = 16 * impactSquash;
const tipH = 13 / impactSquash;

// Tongue tip
ctx.fillStyle = "#ff8fb2";
ctx.beginPath();
ctx.ellipse(0, 0, tipW, tipH, 0, 0, Math.PI * 2);
ctx.fill();

// Wet highlight
ctx.fillStyle = "rgba(255,255,255,0.35)";
ctx.beginPath();
ctx.ellipse(-4, -3, tipW * 0.35, tipH * 0.25, -0.2, 0, Math.PI * 2);
ctx.fill();

// --- WHITE WRAPS ---
ctx.strokeStyle = "#ffffff";
ctx.lineWidth = 3;
ctx.lineCap = "round";

const wrapSpacing = 4;
const wrapCount = 3;

for (let i = 0; i < wrapCount; i++) {
  const x = -tipW * 0.6 + i * wrapSpacing;
  ctx.beginPath();
  ctx.moveTo(x, -tipH * 0.9);
  ctx.lineTo(x, tipH * 0.9);
  ctx.stroke();
}

// Small shadow lines for depth
ctx.strokeStyle = "rgba(0,0,0,0.15)";
ctx.lineWidth = 1.5;

for (let i = 0; i < wrapCount; i++) {
  const x = -tipW * 0.6 + i * wrapSpacing + 1;
  ctx.beginPath();
  ctx.moveTo(x, -tipH * 0.9);
  ctx.lineTo(x, tipH * 0.9);
  ctx.stroke();
}

ctx.restore();
      }

      // impact burst
      if (time >= shootDur && time < shootDur + stickDur) {
        const burstT = stickT;
        const ringR = 10 + burstT * 28;

        ctx.save();
        ctx.globalAlpha = (1 - burstT) * 0.9;
        ctx.strokeStyle = "rgba(255,255,255,0.9)";
        ctx.lineWidth = 3;
        ctx.beginPath();
        ctx.arc(hitX, hitY, ringR, 0, Math.PI * 2);
        ctx.stroke();
        ctx.restore();

        ctx.save();
        ctx.globalAlpha = (1 - burstT) * 0.9;
        ctx.fillStyle = "rgba(255,255,255,0.85)";
        for (let i = 0; i < 6; i++) {
          const a = (i / 6) * Math.PI * 2;
          const d = 16 + burstT * 26;
          ctx.beginPath();
          ctx.arc(
            hitX + Math.cos(a) * d,
            hitY + Math.sin(a) * d,
            3.5 * (1 - burstT),
            0,
            Math.PI * 2
          );
          ctx.fill();
        }
        ctx.restore();
      }

      // slime particles
      for (const p of particles) {
        const lifeT = clamp(1 - p.life / p.maxLife, 0, 1);
        const px = hitX + Math.cos(p.angle) * p.speed * lifeT;
        const py =
          hitY +
          p.offsetY +
          Math.sin(p.angle) * p.speed * lifeT +
          lifeT * lifeT * 18;

        ctx.save();
        ctx.globalAlpha = 1 - lifeT;
        ctx.fillStyle = "rgba(255,255,255,0.82)";
        ctx.beginPath();
        ctx.arc(px, py, p.size * (1 - lifeT * 0.6), 0, Math.PI * 2);
        ctx.fill();
        ctx.restore();
      }

      // hit flash
      if (hitFlash > 0) {
        ctx.save();
        ctx.globalAlpha = hitFlash * 0.18;
        ctx.fillStyle = "#ffffff";
        ctx.beginPath();
        ctx.arc(hitX, hitY, 26 + (1 - hitFlash) * 10, 0, Math.PI * 2);
        ctx.fill();
        ctx.restore();
      }

      ctx.restore();
    },

    isDone: () => time >= totalDuration,
  };
}

export const lickMove: MoveDefinition = {
  id: "LICK",
  name: "Gastro Tongue",
  power: 20,
  staminaCost: 10,
  speed: 12,
  createAnimation: createLickAnimation,
};