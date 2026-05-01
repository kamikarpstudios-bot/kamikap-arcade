import { MoveDefinition, MoveAnimationInstance } from "../moveTypes";

const lerp = (a: number, b: number, t: number) => a + (b - a) * t;
const clamp = (v: number, min: number, max: number) => Math.max(min, Math.min(max, v));

// Improved easings for more "snap"
const easeInBack = (t: number) => 3 * t * t * t - 2 * t * t; 
const easeOutExpo = (t: number) => t === 1 ? 1 : 1 - Math.pow(2, -10 * t);
const easeOutElastic = (t: number) => {
  const c4 = (2 * Math.PI) / 3;
  return t === 0 ? 0 : t === 1 ? 1 : Math.pow(2, -10 * t) * Math.sin((t * 10 - 0.75) * c4) + 1;
};

type ToothData = { x: number; width: number; height: number; angle: number };

export function createBiteAnimation(args: {
  userX: number;
  userY: number;
  targetX: number;
  targetY: number;
}): MoveAnimationInstance {
  const { targetX, targetY } = args;
  const hitX = targetX;
  const hitY = targetY - 100;

  const appearDuration = 0.12;
  const snapDuration = 0.08;
  const crushDuration = 0.2;
  const holdDuration = 0.15;
  const fadeDuration = 0.25;
  const totalDuration = appearDuration + snapDuration + crushDuration + holdDuration + fadeDuration;

  let time = 0;
  let didImpact = false;
  let screenShake = 0;

  // Jittered, more aggressive teeth
  const generateTeeth = (isTop: boolean): ToothData[] => [
    { x: -60, width: 16, height: 45, angle: 0.2 }, // Fangs
    { x: -35, width: 12, height: 25, angle: 0.1 },
    { x: -15, width: 10, height: 20, angle: 0.05 },
    { x: 15, width: 10, height: 20, angle: -0.05 },
    { x: 35, width: 12, height: 25, angle: -0.1 },
    { x: 60, width: 16, height: 45, angle: -0.2 },
  ];

  const topTeeth = generateTeeth(true);
  const bottomTeeth = generateTeeth(false);

  return {
    update(dt: number) {
      if (time >= totalDuration) return;
      time += dt;

      const impactTime = appearDuration + snapDuration;
      if (!didImpact && time >= impactTime) {
        didImpact = true;
        screenShake = 22; // Bigger initial punch
      }

      if (screenShake > 0) {
        screenShake *= Math.pow(0.85, dt * 60);
      }
    },

    draw(ctx: CanvasRenderingContext2D) {
      const appearT = clamp(time / appearDuration, 0, 1);
      const snapT = clamp((time - appearDuration) / snapDuration, 0, 1);
      const crushT = clamp((time - (appearDuration + snapDuration)) / crushDuration, 0, 1);
      const fadeT = clamp((time - (totalDuration - fadeDuration)) / fadeDuration, 0, 1);

      ctx.save();

      // Screenshake
      if (screenShake > 0.5) {
        ctx.translate((Math.random() - 0.5) * screenShake, (Math.random() - 0.5) * screenShake);
      }

      // Animation calculations
      // 1. Anticipation: Jaws open wider right before snapping
      const anticipation = Math.sin(appearT * Math.PI) * 15;
      const openGap = 90 + anticipation;
      const closedGap = -12;
      
      // 2. The Snap
      let jawGap = lerp(openGap, closedGap, easeOutExpo(snapT));
      // 3. The Crush: Overshoot and settle
      jawGap -= easeOutElastic(crushT) * 8;

      const alpha = time > totalDuration - fadeDuration ? 1 - fadeT : 1;

      const drawFangSet = (isTop: boolean, color: string, xOffset = 0) => {
        const dir = isTop ? -1 : 1;
        const teeth = isTop ? topTeeth : bottomTeeth;

        ctx.save();
        ctx.translate(hitX + xOffset, hitY + (dir * jawGap));
        
        // Slight organic wobble
        const wobble = Math.sin(time * 40) * (crushT > 0 && crushT < 1 ? 2 : 0);
        ctx.translate(wobble, 0);

        ctx.fillStyle = color;
        ctx.shadowBlur = 15;
        ctx.shadowColor = color;

        for (const t of teeth) {
          ctx.save();
          ctx.translate(t.x, 0);
          ctx.rotate(t.angle * (1 - snapT)); // Teeth straighten as they bite
          
          ctx.beginPath();
          ctx.moveTo(-t.width / 2, 0);
          ctx.lineTo(t.width / 2, 0);
          ctx.lineTo(0, dir * t.height);
          ctx.fill();
          ctx.restore();
        }
        ctx.restore();
      };

      // Ghosting / Chromatic Effect on Impact
      if (didImpact && crushT < 0.5) {
        ctx.globalAlpha = alpha * 0.5;
        drawFangSet(true, "#ff0055", -4); // Red offset
        drawFangSet(false, "#00ffff", 4);  // Cyan offset
      }

      // Main Teeth
      ctx.globalAlpha = alpha;
      drawFangSet(true, "white");
      drawFangSet(false, "white");

      // Impact Vfx
      if (didImpact) {
        const p = crushT;
        ctx.save();
        ctx.translate(hitX, hitY);
        
        // Expanding Shockwave
        ctx.strokeStyle = `rgba(255, 255, 255, ${1 - p})`;
        ctx.lineWidth = 4;
        ctx.beginPath();
        ctx.scale(1, 0.4);
        ctx.arc(0, 0, p * 120, 0, Math.PI * 2);
        ctx.stroke();
        ctx.restore();

        // Crunch Particles
        if (p < 0.8) {
           ctx.fillStyle = "white";
           for(let i=0; i<8; i++) {
             const ang = (i / 8) * Math.PI * 2;
             const dist = p * 80;
             ctx.fillRect(hitX + Math.cos(ang) * dist, hitY + Math.sin(ang) * dist, 3, 3);
           }
        }
      }

      ctx.restore();
    },

    isDone: () => time >= totalDuration,
  };
}

export const biteMove: MoveDefinition = {
  id: "GIGA_FANG",
  name: "Giga Fang",
  power: 20,
  staminaCost: 10,
  speed: 10,
  createAnimation: createBiteAnimation,
};