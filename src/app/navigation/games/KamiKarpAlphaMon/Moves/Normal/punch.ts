import { MoveDefinition, MoveAnimationInstance } from "../moveTypes";

const lerp = (a: number, b: number, t: number) => a + (b - a) * t;
const clamp = (v: number, min: number, max: number) =>
  Math.max(min, Math.min(max, v));

const easeOutCubic = (t: number) => 1 - Math.pow(1 - t, 3);
const easeInCubic = (t: number) => t * t * t;
const easeOutQuint = (t: number) => 1 - Math.pow(1 - t, 5);

type Spark = {
  x: number;
  y: number;
  vx: number;
  vy: number;
  life: number;
  maxLife: number;
  size: number;
};

type Scratch = {
  angle: number;
  length: number;
  offset: number;
  width: number;
};

export function createPunchAnimation(args: {
  userX: number;
  userY: number;
  targetX: number;
  targetY: number;
}): MoveAnimationInstance {
  const { userX, userY, targetX, targetY } = args;

  const startX = userX + 120;
  const startY = userY - 150;
  const impactX = targetX - 44;
  const impactY = targetY - 108;

  // SLOWED DOWN: Increased durations for more "anticipation" and "impact follow-through"
  const totalDuration = 0.65; 
  const travelDuration = 0.22; 

  let time = 0;
  let done = false;
  let screenShake = 0;

  const sparks: Spark[] = [];
  const scratches: Scratch[] = [];

  return {
    update(dt: number) {
      if (done) return;

      const prevTime = time;
      time += dt;

      // TRIGGER IMPACT
      if (prevTime < travelDuration && time >= travelDuration) {
        screenShake = 18; // Slightly more shake for the slower impact

        // Create Sparks
        for (let i = 0; i < 12; i++) {
          const angle = (-0.8 + (i / 11) * 1.6) + (Math.random() - 0.5) * 0.3;
          const speed = 150 + Math.random() * 200;
          sparks.push({
            x: impactX, y: impactY,
            vx: Math.cos(angle) * speed,
            vy: Math.sin(angle) * speed,
            life: 0.2, maxLife: 0.2,
            size: 2 + Math.random() * 3,
          });
        }

        // CREATE SCRATCHES (The requested effect)
        for (let i = 0; i < 5; i++) {
          scratches.push({
            angle: Math.random() * Math.PI * 2,
            length: 40 + Math.random() * 60,
            offset: -10 + Math.random() * 20,
            width: 2 + Math.random() * 3,
          });
        }
      }

      screenShake *= Math.pow(0.85, dt * 60);

      for (const s of sparks) {
        s.x += s.vx * dt;
        s.y += s.vy * dt;
        s.life -= dt;
      }

      if (time >= totalDuration) done = true;
    },

    draw(ctx: CanvasRenderingContext2D) {
      ctx.save();

      if (screenShake > 0.2) {
        ctx.translate((Math.random() - 0.5) * screenShake, (Math.random() - 0.5) * screenShake);
      }

      const travelT = clamp(time / travelDuration, 0, 1);
      const currentX = lerp(startX, impactX, easeInCubic(travelT));
      const currentY = lerp(startY, impactY, easeInCubic(travelT));
      const angle = Math.atan2(impactY - startY, impactX - startX);

      // 1. TRAIL (During Travel)
      if (travelT < 1) {
        ctx.save();
        ctx.translate(currentX, currentY);
        ctx.rotate(angle);
        const trailLen = 200;
        const trailGrad = ctx.createLinearGradient(-trailLen, 0, 20, 0);
        trailGrad.addColorStop(0, "transparent");
        trailGrad.addColorStop(0.8, "rgba(255, 255, 255, 0.4)");
        trailGrad.addColorStop(1, "transparent");
        ctx.fillStyle = trailGrad;
        ctx.fillRect(-trailLen, -15, trailLen, 30);
        ctx.restore();
      }

      // 2. IMPACT EFFECTS
      if (time >= travelDuration) {
        const impactElapsed = time - travelDuration;
        const impactT = clamp(impactElapsed / (totalDuration - travelDuration), 0, 1);
        const fade = 1 - easeOutQuint(impactT);

        // --- SCRATCHES WITH CHROMATIC ABERRATION ---
        scratches.forEach((s, i) => {
          ctx.save();
          ctx.translate(impactX, impactY);
          ctx.rotate(s.angle);
          
          const flicker = Math.random() > 0.1 ? 1 : 0.2; // Subtle flicker
          const length = s.length * (0.5 + fade * 0.5);
          
          // Draw Red Scratch (Offset)
          ctx.strokeStyle = `rgba(255, 50, 50, ${0.7 * fade * flicker})`;
          ctx.lineWidth = s.width;
          ctx.beginPath();
          ctx.moveTo(s.offset - 3, -length/2);
          ctx.lineTo(s.offset - 3, length/2);
          ctx.stroke();

          // Draw Blue/Cyan Scratch (Offset)
          ctx.strokeStyle = `rgba(50, 255, 255, ${0.7 * fade * flicker})`;
          ctx.beginPath();
          ctx.moveTo(s.offset + 3, -length/2);
          ctx.lineTo(s.offset + 3, length/2);
          ctx.stroke();

          // Draw White Core
          ctx.strokeStyle = `rgba(255, 255, 255, ${fade * flicker})`;
          ctx.lineWidth = s.width * 0.5;
          ctx.beginPath();
          ctx.moveTo(s.offset, -length/2);
          ctx.lineTo(s.offset, length/2);
          ctx.stroke();

          ctx.restore();
        });

        // --- IMPACT RING ---
        ctx.save();
        const ringSize = impactT * 120;
        ctx.strokeStyle = `rgba(255, 255, 255, ${0.3 * fade})`;
        ctx.lineWidth = 2;
        ctx.beginPath();
        ctx.arc(impactX, impactY, ringSize, 0, Math.PI * 2);
        ctx.stroke();
        ctx.restore();
      }

      // 3. SPARKS
      for (const s of sparks) {
        if (s.life <= 0) continue;
        const alpha = s.life / s.maxLife;
        ctx.fillStyle = `rgba(255, 255, 255, ${alpha})`;
        ctx.fillRect(s.x, s.y, s.size, s.size);
      }

      ctx.restore();
    },

    isDone: () => done,
  };
}

export const punchMove: MoveDefinition = {
  id: "GIGA_IMPACT",
  name: "Giga Impact",
  power: 20,
  staminaCost: 10,
  speed: 20,
  createAnimation: createPunchAnimation,
};