import {
  ConditionDefinition,
  ConditionVisualInstance,
} from "../conditionTypes";

const clamp = (v: number, min: number, max: number) =>
  Math.max(min, Math.min(max, v));

type SlowArrow = {
  x: number;
  y: number;
  speed: number;
  width: number;
  height: number;
  alpha: number;
  life: number;
};

function createSlowedVisual(args: {
  targetX: number;
  targetY: number;
  isPlayerSide: boolean;
}): ConditionVisualInstance {
  const { targetX, targetY } = args;

  let time = 0;
  const arrows: SlowArrow[] = [];
  let spawnTimer = 0;

  const spawnArrow = () => {
    // Spread arrows across the width of the character
    const xOffset = (Math.random() - 0.5) * 110;
    arrows.push({
      x: targetX + xOffset,
      y: targetY - 160 + Math.random() * 40,
      speed: 40 + Math.random() * 60,
      width: 12 + Math.random() * 8,
      height: 20 + Math.random() * 15,
      alpha: 0,
      life: 1.5 + Math.random() * 1.0,
    });
  };

  return {
    update(dt: number) {
      time += dt;
      spawnTimer -= dt;

      if (spawnTimer <= 0) {
        spawnArrow();
        spawnTimer = 0.2 + Math.random() * 0.3;
      }

      for (let i = arrows.length - 1; i >= 0; i--) {
        const a = arrows[i];
        a.life -= dt;
        a.y += a.speed * dt; // Constant downward pressure

        // Fade in at start, fade out at end
        if (a.life > 2.0) a.alpha = clamp(a.alpha + dt * 2, 0, 0.6);
        else a.alpha = clamp(a.life * 0.5, 0, 0.6);

        if (a.life <= 0 || a.y > targetY - 10) {
          arrows.splice(i, 1);
        }
      }
    },

    draw(ctx: CanvasRenderingContext2D) {
      ctx.save();

      // 1. "HEAVY" GROUND RADIANCE
      // A thick blue fog at the feet to show where the weight is pooling
      const groundGlow = ctx.createRadialGradient(targetX, targetY, 0, targetX, targetY, 70);
      groundGlow.addColorStop(0, `rgba(0, 100, 255, ${0.15 + Math.sin(time * 2) * 0.05})`);
      groundGlow.addColorStop(1, "rgba(0, 0, 0, 0)");
      
      ctx.globalCompositeOperation = "screen";
      ctx.fillStyle = groundGlow;
      ctx.beginPath();
      ctx.ellipse(targetX, targetY - 5, 80, 25, 0, 0, Math.PI * 2);
      ctx.fill();

      // 2. DOWNWARD ARROWS
      for (const a of arrows) {
        const x = a.x;
        const y = a.y;
        const w = a.width;
        const h = a.height;

        ctx.save();
        ctx.globalAlpha = a.alpha;

        // Draw Arrow Trail (Ghosting)
        const trailGrad = ctx.createLinearGradient(x, y - h * 2, x, y + h);
        trailGrad.addColorStop(0, "rgba(0, 150, 255, 0)");
        trailGrad.addColorStop(1, "rgba(0, 200, 255, 0.8)");
        
        ctx.fillStyle = trailGrad;
        
        // The Arrow Shape
        ctx.beginPath();
        // Stem top
        ctx.moveTo(x - w * 0.3, y - h);
        ctx.lineTo(x + w * 0.3, y - h);
        // Stem bottom join
        ctx.lineTo(x + w * 0.3, y);
        // Arrow head right
        ctx.lineTo(x + w * 0.8, y);
        // Tip
        ctx.lineTo(x, y + h);
        // Arrow head left
        ctx.lineTo(x - w * 0.8, y);
        // Stem join left
        ctx.lineTo(x - w * 0.3, y);
        ctx.closePath();
        
        // Glowing edges
        ctx.shadowBlur = 10;
        ctx.shadowColor = "rgba(0, 150, 255, 0.9)";
        ctx.fill();

        // 3. INNER CORE (White center for "sharpness")
        ctx.shadowBlur = 0;
        ctx.fillStyle = "rgba(255, 255, 255, 0.4)";
        ctx.beginPath();
        ctx.moveTo(x - w * 0.1, y - h * 0.5);
        ctx.lineTo(x + w * 0.1, y - h * 0.5);
        ctx.lineTo(x + w * 0.1, y);
        ctx.lineTo(x + w * 0.3, y);
        ctx.lineTo(x, y + h * 0.6);
        ctx.lineTo(x - w * 0.3, y);
        ctx.lineTo(x - w * 0.1, y);
        ctx.closePath();
        ctx.fill();

        ctx.restore();
      }

      ctx.restore();
    },
  };
}

export const slowedCondition: ConditionDefinition = {
  id: "SLOWED",
  name: "Slowed",
  createVisual: createSlowedVisual,
};