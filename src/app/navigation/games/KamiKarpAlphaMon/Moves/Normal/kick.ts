import { MoveDefinition, MoveAnimationInstance } from "../moveTypes";

const lerp = (a: number, b: number, t: number) => a + (b - a) * t;
const clamp = (v: number, min: number, max: number) =>
  Math.max(min, Math.min(max, v));

const easeOutCubic = (t: number) => 1 - Math.pow(1 - t, 3);
const easeInCubic = (t: number) => t * t * t;
const easeOutQuint = (t: number) => 1 - Math.pow(1 - t, 5);
const easeInOutCubic = (t: number) =>
  t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2;

type ImpactShard = {
  x: number;
  y: number;
  vx: number;
  vy: number;
  life: number;
  maxLife: number;
  len: number;
  rot: number;
};

type Scratch = {
  angle: number;
  length: number;
  offset: number;
  width: number;
};

export function createKickAnimation(args: {
  userX: number;
  userY: number;
  targetX: number;
  targetY: number;
}): MoveAnimationInstance {
  const { userX, userY, targetX, targetY } = args;

  const startX = userX + 105;
  const startY = userY - 95;
  const windupX = startX - 35;
  const windupY = startY + 20;
  const impactX = targetX - 10;
  const impactY = targetY - 70;

  let time = 0;
  // SLOWED DOWN: 0.65 total to match the punch's weight
  const totalDuration = 0.65;
  const windUpTime = 0.18;
  const strikeTime = 0.32;

  let done = false;
  let screenShake = 0;
  const shards: ImpactShard[] = [];
  const scratches: Scratch[] = [];

  return {
    update(dt: number) {
      if (done) return;
      const prevTime = time;
      time += dt;

      if (prevTime < strikeTime && time >= strikeTime) {
        screenShake = 22;

        // Generate Shards
        for (let i = 0; i < 12; i++) {
          const spread = -0.8 + (i / 11) * 1.6;
          const speed = 250 + Math.random() * 300;
          shards.push({
            x: impactX, y: impactY,
            vx: Math.cos(spread) * speed,
            vy: Math.sin(spread) * speed * 0.4,
            life: 0.25, maxLife: 0.25,
            len: 15 + Math.random() * 15,
            rot: spread,
          });
        }

        // ADDED SCRATCHES (Matching the Punch vibe)
        for (let i = 0; i < 6; i++) {
          scratches.push({
            angle: (Math.random() - 0.5) * 1.2, // mostly forward-facing
            length: 60 + Math.random() * 80,
            offset: -15 + Math.random() * 30,
            width: 3 + Math.random() * 4,
          });
        }
      }

      screenShake *= Math.pow(0.85, dt * 60);

      for (const s of shards) {
        s.x += s.vx * dt;
        s.y += s.vy * dt;
        s.life -= dt;
      }

      if (time >= totalDuration) done = true;
    },

    draw(ctx: CanvasRenderingContext2D) {
      ctx.save();
      if (screenShake > 0.5) {
        ctx.translate((Math.random() - 0.5) * screenShake, (Math.random() - 0.5) * screenShake);
      }

      const strikeT = clamp((time - windUpTime) / (strikeTime - windUpTime), 0, 1);
      const impactT = clamp((time - strikeTime) / (totalDuration - strikeTime), 0, 1);
      const impactFade = 1 - easeOutQuint(impactT);

      // 1. DYNAMIC FOOT POSITIONING
      let x = startX, y = startY, rot = 0;
      if (time < windUpTime) {
        const t = easeInOutCubic(time / windUpTime);
        x = lerp(startX, windupX, t); y = lerp(startY, windupY, t); rot = lerp(0.1, -0.5, t);
      } else if (time < strikeTime) {
        x = lerp(windupX, impactX, easeInCubic(strikeT));
        y = lerp(windupY, impactY, easeInCubic(strikeT));
        rot = lerp(-0.5, 0.4, strikeT);
      } else {
        x = lerp(impactX, impactX + 15, easeOutCubic(impactT));
        y = lerp(impactY, impactY + 5, easeOutCubic(impactT));
        rot = 0.4;
      }

      // 2. MOTION GHOSTS (The "faded" travel look)
      if (time < strikeTime && strikeT > 0.3) {
        for (let i = 1; i <= 3; i++) {
          const ghostAlpha = (1 - (i / 4)) * strikeT * 0.3;
          ctx.save();
          ctx.translate(lerp(windupX, x, 1 - i * 0.1), lerp(windupY, y, 1 - i * 0.1));
          ctx.rotate(rot);
          ctx.fillStyle = `rgba(200, 240, 255, ${ghostAlpha})`;
          ctx.fillRect(-20, -8, 58, 16);
          ctx.restore();
        }
      }

      // 3. DRAW THE BOOT (With RGB Fading)
      ctx.save();
      ctx.translate(x, y);
      ctx.rotate(rot);
      
      const bootFade = time < strikeTime ? 1 : impactFade;
      const drawBootShape = (color: string, ox: number) => {
        ctx.fillStyle = color;
        ctx.beginPath();
        ctx.moveTo(-20, -8); ctx.lineTo(28, -10); ctx.lineTo(38, 0);
        ctx.lineTo(34, 8); ctx.lineTo(-18, 7); ctx.closePath();
        ctx.fill();
      };

      ctx.globalCompositeOperation = "screen";
      drawBootShape(`rgba(255, 50, 50, ${0.4 * bootFade})`, -2);
      drawBootShape(`rgba(50, 255, 255, ${0.4 * bootFade})`, 2);
      drawBootShape(`rgba(255, 255, 255, ${0.8 * bootFade})`, 0);
      ctx.restore();

      // 4. IMPACT SCRATCHES (The "Punch" Vibe)
      if (time >= strikeTime) {
        ctx.save();
        ctx.translate(impactX, impactY);
        scratches.forEach(s => {
          ctx.save();
          ctx.rotate(s.angle);
          const flicker = Math.random() > 0.1 ? 1 : 0.3;
          const len = s.length * (0.4 + impactFade * 0.6);
          
          ctx.lineWidth = s.width * impactFade;
          ctx.globalCompositeOperation = "screen";
          
          // Red Scratch
          ctx.strokeStyle = `rgba(255, 60, 60, ${0.6 * impactFade * flicker})`;
          ctx.beginPath(); ctx.moveTo(s.offset - 3, -len/2); ctx.lineTo(s.offset - 3, len/2); ctx.stroke();
          
          // Cyan Scratch
          ctx.strokeStyle = `rgba(60, 255, 255, ${0.6 * impactFade * flicker})`;
          ctx.beginPath(); ctx.moveTo(s.offset + 3, -len/2); ctx.lineTo(s.offset + 3, len/2); ctx.stroke();
          
          // White Core
          ctx.strokeStyle = `rgba(255, 255, 255, ${impactFade * flicker})`;
          ctx.lineWidth *= 0.5;
          ctx.beginPath(); ctx.moveTo(s.offset, -len/2); ctx.lineTo(s.offset, len/2); ctx.stroke();
          ctx.restore();
        });
        ctx.restore();

        // 5. SHARDS
        for (const s of shards) {
          if (s.life <= 0) continue;
          const a = s.life / s.maxLife;
          ctx.save();
          ctx.translate(s.x, s.y);
          ctx.rotate(s.rot);
          ctx.fillStyle = `rgba(255, 255, 255, ${a})`;
          ctx.fillRect(-s.len/2, -1, s.len, 2);
          ctx.restore();
        }
      }

      ctx.restore();
    },

    isDone: () => done,
  };
}

export const kickMove: MoveDefinition = {
  id: "GIGA_BOOT_KICK",
  name: "Giga Boot Blast",
  power: 20,
  staminaCost: 10,
  speed: 25,
  createAnimation: createKickAnimation,
};