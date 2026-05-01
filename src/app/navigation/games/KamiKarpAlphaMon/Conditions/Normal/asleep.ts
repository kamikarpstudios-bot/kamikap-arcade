import {
  ConditionDefinition,
  ConditionVisualInstance,
} from "../conditionTypes";

const clamp = (v: number, min: number, max: number) =>
  Math.max(min, Math.min(max, v));

type SleepZ = {
  x: number;
  y: number;
  life: number;
  maxLife: number;
  size: number;
  speed: number;
  amplitude: number; // How far it sways left/right
  phase: number;     // Random starting point for the sway
};

function createAsleepVisual(args: {
  targetX: number;
  targetY: number;
  isPlayerSide: boolean;
}): ConditionVisualInstance {
  const { targetX, targetY } = args;

  let time = 0;
  let spawnTimer = 0;
  const zs: SleepZ[] = [];

  const spawnZ = () => {
    const life = 2.0 + Math.random() * 1.0;
    zs.push({
      x: targetX + (Math.random() - 0.5) * 40,
      y: targetY - 100,
      life: life,
      maxLife: life,
      size: 14 + Math.random() * 12,
      speed: 30 + Math.random() * 20,
      amplitude: 15 + Math.random() * 15,
      phase: Math.random() * Math.PI * 2,
    });
  };

  return {
    update(dt: number) {
      time += dt;
      spawnTimer -= dt;

      // Spawn a new Z roughly every second
      if (spawnTimer <= 0) {
        spawnZ();
        spawnTimer = 0.8 + Math.random() * 0.4;
      }

      for (let i = zs.length - 1; i >= 0; i--) {
        const z = zs[i];
        z.life -= dt;
        z.y -= z.speed * dt; // Rise up

        if (z.life <= 0) {
          zs.splice(i, 1);
        }
      }
    },

    draw(ctx: CanvasRenderingContext2D) {
      ctx.save();

      // 1. SLEEPY AURA
      // A soft blue pulse around the monster's "head"
      const pulse = Math.sin(time * 1.5) * 0.5 + 0.5;
      const auraGlow = ctx.createRadialGradient(targetX, targetY - 100, 0, targetX, targetY - 100, 80);
      auraGlow.addColorStop(0, `rgba(100, 150, 255, ${0.1 * pulse})`);
      auraGlow.addColorStop(1, "rgba(100, 150, 255, 0)");
      
      ctx.fillStyle = auraGlow;
      ctx.globalCompositeOperation = "screen";
      ctx.fillRect(targetX - 100, targetY - 200, 200, 200);
      ctx.globalCompositeOperation = "source-over";

      // 2. THE FLOATING Zs
      ctx.font = "bold 20px 'Arial', sans-serif"; // Fallback, will scale with ctx.scale
      ctx.textAlign = "center";
      ctx.textBaseline = "middle";

      for (const z of zs) {
        const lifeT = z.life / z.maxLife; // 1 down to 0
        const progress = 1 - lifeT;      // 0 up to 1
        
        // Swaying motion using sine
        const swayX = Math.sin(progress * 4 + z.phase) * z.amplitude;
        const x = z.x + swayX;
        const y = z.y;

        // Visual effects: Fade in, then fade out. Scale up over time.
        const alpha = progress < 0.2 ? progress * 5 : lifeT * 1.2;
        const scale = 0.5 + progress * 0.8;
        const rotation = Math.sin(progress * 2 + z.phase) * 0.2;

        ctx.save();
        ctx.translate(x, y);
        ctx.rotate(rotation);
        ctx.scale(scale, scale);

        // Soft Outer Glow for the letter
        ctx.shadowBlur = 8;
        ctx.shadowColor = "rgba(100, 200, 255, 0.8)";
        
        // Main "Z" text
        // Use a gradient for the Z itself
        const zGrad = ctx.createLinearGradient(0, -z.size/2, 0, z.size/2);
        zGrad.addColorStop(0, `rgba(200, 230, 255, ${alpha})`);
        zGrad.addColorStop(1, `rgba(100, 160, 255, ${alpha})`);

        ctx.fillStyle = zGrad;
        ctx.font = `bold ${z.size}px 'Verdana', sans-serif`;
        ctx.fillText("Z", 0, 0);

        // Tiny white highlight in the center for a "magical" feel
        ctx.shadowBlur = 0;
        ctx.fillStyle = `rgba(255, 255, 255, ${alpha * 0.5})`;
        ctx.fillText("Z", 0, 0);

        ctx.restore();
      }

      ctx.restore();
    },
  };
}

export const asleepCondition: ConditionDefinition = {
  id: "ASLEEP",
  name: "Asleep",
  createVisual: createAsleepVisual,
};