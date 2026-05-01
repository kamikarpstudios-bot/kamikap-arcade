import { MoveDefinition, MoveAnimationInstance } from "../moveTypes";

// --- AAA Utility Suite ---
const lerp = (a: number, b: number, t: number) => a + (b - a) * t;
const clamp = (v: number, min: number, max: number) => Math.max(min, Math.min(max, v));
const easeOutExpo = (t: number) => (t === 1 ? 1 : 1 - Math.pow(2, -10 * t));
const easeOutCubic = (t: number) => 1 - Math.pow(1 - t, 3);
const easeInExpo = (t: number) => (t === 0 ? 0 : Math.pow(2, 10 * t - 10));

// --- Types for the Overhaul ---
type Particle = {
  x: number; y: number; vx: number; vy: number;
  life: number; maxLife: number; size: number; color: string;
};

type SlashSample = { progress: number; alpha: number; };

function createScratchAnimation(args: {
  userX: number; userY: number; targetX: number; targetY: number;
}): MoveAnimationInstance {
  const { userX, userY, targetX, targetY } = args;
  const hitX = targetX - 10;
  const hitY = targetY - 55;

  let time = 0;
  let done = false;
  const totalDuration = 1.2;

  // Camera & Post-Processing State
  let screenShake = 0;
  let flashAlpha = 0;
  let hitPause = 0;

  // Particle Containers
  const sparks: Particle[] = [];
  const trails: SlashSample[][] = [[], [], []];

  const strikes = [
    { start: 0.12, end: 0.38, angle: -0.55, len: 160, curve: 15, color: "255, 40, 100", accent: "255, 200, 220" },
    { start: 0.32, end: 0.58, angle: 0.40, len: 180, curve: -20, color: "0, 220, 255", accent: "200, 255, 255" },
    { start: 0.52, end: 0.85, angle: -0.05, len: 230, curve: 8, color: "255, 255, 255", accent: "255, 50, 100" }
  ];

  const impactMoments = [0.22, 0.42, 0.65];
  const triggered = [false, false, false];

  function spawnBurst(x: number, y: number, isFinal: boolean) {
    const count = isFinal ? 30 : 15;
    flashAlpha = isFinal ? 0.4 : 0.2;
    
    for (let i = 0; i < count; i++) {
      const ang = (Math.random() - 0.5) * Math.PI * 2;
      const speed = Math.random() * 400 + 200;
      sparks.push({
        x, y,
        vx: Math.cos(ang) * speed,
        vy: Math.sin(ang) * speed - 100,
        life: 0, maxLife: 0.3 + Math.random() * 0.4,
        size: Math.random() * 3 + 1,
        color: Math.random() > 0.5 ? "white" : "#ff2864"
      });
    }
  }

  return {
    update(dt: number) {
      if (done) return;

      if (hitPause > 0) {
        hitPause -= dt;
        return;
      }

      const prevTime = time;
      time += dt;

      // Handle Impacts & Hit-Stops
      impactMoments.forEach((m, i) => {
        if (!triggered[i] && prevTime < m && time >= m) {
          triggered[i] = true;
          spawnBurst(hitX, hitY, i === 2);
          screenShake = i === 2 ? 25 : 15;
          hitPause = i === 2 ? 0.06 : 0.03; // Final hit feels heavier
        }
      });

      // Update Particles
      for (let i = sparks.length - 1; i >= 0; i--) {
        const p = sparks[i];
        p.life += dt;
        p.x += p.vx * dt; p.y += p.vy * dt;
        p.vy += 800 * dt; // Gravity
        if (p.life >= p.maxLife) sparks.splice(i, 1);
      }

      // Decay Global FX
      screenShake *= Math.pow(0.85, dt * 60);
      flashAlpha *= Math.pow(0.8, dt * 60);

      if (time >= totalDuration) done = true;
    },

    draw(ctx: CanvasRenderingContext2D) {
      ctx.save();

      // 1) Screen Shake
      if (screenShake > 0.1) {
        ctx.translate((Math.random() - 0.5) * screenShake, (Math.random() - 0.5) * screenShake);
      }

      // 2) Draw Strikes
      strikes.forEach((s, i) => {
        if (time < s.start) return;
        const progress = clamp((time - s.start) / (s.end - s.start), 0, 1);
        const fade = 1 - easeOutExpo(progress);
        if (fade <= 0) return;

        const stretch = Math.sin(progress * Math.PI);
        const currentLen = s.len * (0.4 + stretch * 0.6);
        const arc = s.curve * stretch;

        ctx.save();
        ctx.translate(hitX, hitY);
        ctx.rotate(s.angle);

        // --- THE BLADE GEOMETRY ---
        // Glow Layer
        const glow = ctx.createRadialGradient(0, 0, 0, 0, 0, currentLen);
        glow.addColorStop(0, `rgba(${s.color}, ${0.4 * fade})`);
        glow.addColorStop(1, "rgba(0,0,0,0)");
        ctx.fillStyle = glow;
        ctx.beginPath();
        ctx.ellipse(0, 0, currentLen, 30 * fade, 0, 0, Math.PI * 2);
        ctx.fill();

        // Layered Tapered Strokes
        const layers = [
          { color: s.color, width: 22, alpha: 0.3, bloom: 20 }, // Outer Soft
          { color: s.accent, width: 8, alpha: 0.8, bloom: 10 }, // Inner Core
          { color: "255, 255, 255", width: 2, alpha: 1, bloom: 0 } // Razor Edge
        ];

        layers.forEach(l => {
          ctx.strokeStyle = `rgba(${l.color}, ${l.alpha * fade})`;
          ctx.lineWidth = l.width * fade;
          ctx.lineCap = "round";
          if (l.bloom > 0) {
            ctx.shadowBlur = l.bloom * fade;
            ctx.shadowColor = `rgb(${l.color})`;
          } else {
            ctx.shadowBlur = 0;
          }

          ctx.beginPath();
          ctx.moveTo(-currentLen, -arc * 0.5);
          ctx.quadraticCurveTo(0, arc, currentLen, arc * 0.5);
          ctx.stroke();
        });
        ctx.restore();
      });

      // 3) Spark Particles
      ctx.save();
      ctx.globalCompositeOperation = "lighter";
      sparks.forEach(p => {
        const pFade = 1 - (p.life / p.maxLife);
        ctx.fillStyle = p.color;
        ctx.globalAlpha = pFade;
        ctx.beginPath();
        ctx.arc(p.x, p.y, p.size * pFade, 0, Math.PI * 2);
        ctx.fill();
      });
      ctx.restore();

      // 4) Impact Flash
      if (flashAlpha > 0.01) {
        ctx.fillStyle = `rgba(255, 255, 255, ${flashAlpha})`;
        ctx.fillRect(-1000, -1000, 3000, 3000);
      }

      ctx.restore();
    },

    isDone: () => done,
  };
}

export const scratchMove: MoveDefinition = {
  id: "SCRATCH_ULTIMATE",
  name: "Vicious Scratch",
  power: 20,
  staminaCost: 10,
  speed: 30,
  createAnimation: createScratchAnimation,
};