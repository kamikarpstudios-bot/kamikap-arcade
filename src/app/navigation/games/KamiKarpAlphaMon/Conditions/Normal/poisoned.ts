import {
  ConditionDefinition,
  ConditionVisualInstance,
} from "../conditionTypes";

const clamp = (v: number, min: number, max: number) =>
  Math.max(min, Math.min(max, v));

type PoisonBubble = {
  x: number;
  y: number;
  size: number;
  maxSize: number;
  speed: number;
  life: number;
  wobble: number;
};

function createPoisonVisual(args: {
  targetX: number;
  targetY: number;
  isPlayerSide: boolean;
}): ConditionVisualInstance {
  const { targetX, targetY } = args;

  let time = 0;
  const bubbles: PoisonBubble[] = [];
  let spawnTimer = 0;

  const spawnBubble = () => {
    const size = 4 + Math.random() * 8;
    bubbles.push({
      x: targetX + (Math.random() - 0.5) * 80,
      y: targetY - 10 - Math.random() * 20,
      size: 0,
      maxSize: size,
      speed: 15 + Math.random() * 25,
      life: 1.5 + Math.random() * 1.0,
      wobble: Math.random() * Math.PI * 2,
    });
  };

  return {
    update(dt: number) {
      time += dt;
      spawnTimer -= dt;

      if (spawnTimer <= 0) {
        spawnBubble();
        spawnTimer = 0.2 + Math.random() * 0.3;
      }

      for (let i = bubbles.length - 1; i >= 0; i--) {
        const b = bubbles[i];
        b.life -= dt;
        b.y -= b.speed * dt;
        
        // Grow the bubble quickly at start, then stay max size
        if (b.size < b.maxSize) b.size += dt * 20;

        if (b.life <= 0 || b.y < targetY - 140) {
          bubbles.splice(i, 1);
        }
      }
    },

    draw(ctx: CanvasRenderingContext2D) {
      ctx.save();

      // 1. TOXIC MIASMA (The sickly background haze)
      const pulse = Math.sin(time * 2) * 0.1 + 0.9;
      const haze = ctx.createRadialGradient(targetX, targetY - 70, 0, targetX, targetY - 70, 100);
      haze.addColorStop(0, `rgba(40, 80, 0, ${0.3 * pulse})`);
      haze.addColorStop(1, "rgba(0, 0, 0, 0)");
      
      ctx.globalCompositeOperation = "multiply"; // Stains the monster dark green
      ctx.fillStyle = haze;
      ctx.beginPath();
      ctx.ellipse(targetX, targetY - 60, 90, 110, 0, 0, Math.PI * 2);
      ctx.fill();
      ctx.globalCompositeOperation = "source-over";

      // 2. THE BUBBLES
      for (const b of bubbles) {
        const lifeT = b.life / 2.5;
        const xWobble = Math.sin(time * 3 + b.wobble) * 10;
        const x = b.x + xWobble;
        const y = b.y;

        ctx.save();
        ctx.translate(x, y);

        // Bubble Body (Murky Green)
        const grad = ctx.createRadialGradient(-b.size * 0.2, -b.size * 0.2, 0, 0, 0, b.size);
        grad.addColorStop(0, `rgba(140, 255, 50, ${0.8 * lifeT})`); // Bright toxic core
        grad.addColorStop(1, `rgba(30, 60, 0, ${0.9 * lifeT})`);   // Dark sludge edge

        ctx.fillStyle = grad;
        ctx.beginPath();
        // Slightly squashed bubble
        const stretchY = 1 + Math.sin(time * 5 + b.wobble) * 0.1;
        ctx.ellipse(0, 0, b.size, b.size * stretchY, 0, 0, Math.PI * 2);
        ctx.fill();

        // 3. REFLECTIONS (The "Oily" look)
        ctx.fillStyle = `rgba(255, 255, 255, ${0.3 * lifeT})`;
        ctx.beginPath();
        ctx.ellipse(-b.size * 0.4, -b.size * 0.4, b.size * 0.2, b.size * 0.1, Math.PI / 4, 0, Math.PI * 2);
        ctx.fill();

        // 4. TOXIC DRIP (Small trails behind some bubbles)
        if (b.maxSize > 8) {
          ctx.strokeStyle = `rgba(80, 120, 0, ${0.4 * lifeT})`;
          ctx.lineWidth = 2;
          ctx.beginPath();
          ctx.moveTo(0, b.size);
          ctx.lineTo(0, b.size + 15);
          ctx.stroke();
        }

        ctx.restore();
      }


      ctx.restore();
    },
  };
}

export const poisonCondition: ConditionDefinition = {
  id: "POISONED",
  name: "Poisoned",
  createVisual: createPoisonVisual,
};