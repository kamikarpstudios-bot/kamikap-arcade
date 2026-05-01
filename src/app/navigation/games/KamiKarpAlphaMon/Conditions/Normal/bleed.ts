import {
  ConditionDefinition,
  ConditionVisualInstance,
} from "../conditionTypes";

const clamp = (v: number, min: number, max: number) =>
  Math.max(min, Math.min(max, v));

type BloodDrop = {
  x: number;
  y: number;
  startY: number;
  speed: number;
  size: number;
  life: number;
  maxLife: number;
  sway: number;
  swayOffset: number;
  velocity: number;
};

function createBleedVisual(args: {
  targetX: number;
  targetY: number;
  isPlayerSide: boolean;
}): ConditionVisualInstance {
  const { targetX, targetY } = args;
  let time = 0;
  const drops: BloodDrop[] = [];

  const spawnDrop = () => {
    const spawnX = targetX + (Math.random() - 0.5) * 80;
    const spawnY = targetY - 120 + Math.random() * 40;
    const life = 0.8 + Math.random() * 0.6;

    drops.push({
      x: spawnX,
      y: spawnY,
      startY: spawnY,
      speed: 120 + Math.random() * 100, // Faster initial fall
      size: 3 + Math.random() * 5,
      life,
      maxLife: life,
      sway: 2 + Math.random() * 4,
      swayOffset: Math.random() * Math.PI * 2,
      velocity: 0
    });
  };

  let spawnTimer = 0;

  return {
    update(dt: number) {
      time += dt;
      spawnTimer -= dt;

      if (spawnTimer <= 0) {
        spawnDrop();
        if (Math.random() < 0.4) spawnDrop();
        spawnTimer = 0.1 + Math.random() * 0.15;
      }

      for (let i = drops.length - 1; i >= 0; i--) {
        const d = drops[i];
        d.life -= dt;
        // Gravity acceleration effect
        d.velocity += 400 * dt; 
        d.y += (d.speed + d.velocity) * dt;

        if (d.life <= 0 || d.y > targetY + 30) {
          drops.splice(i, 1);
        }
      }
    },

    draw(ctx: CanvasRenderingContext2D) {
      ctx.save();

      // 1. BACKGROUND WOUND GLOW
      // A softer, more atmospheric "ooze" light
      const pulse = Math.sin(time * 3) * 0.1 + 0.9;
      const gradient = ctx.createRadialGradient(targetX, targetY - 100, 0, targetX, targetY - 100, 60);
      gradient.addColorStop(0, `rgba(180, 0, 0, ${0.15 * pulse})`);
      gradient.addColorStop(1, 'rgba(180, 0, 0, 0)');
      
      ctx.globalCompositeOperation = "screen";
      ctx.fillStyle = gradient;
      ctx.fillRect(targetX - 100, targetY - 200, 200, 200);

      ctx.globalCompositeOperation = "source-over";

      // 2. DRAW DROPLETS
      for (const d of drops) {
        const lifeT = clamp(d.life / d.maxLife, 0, 1);
        // Stretch based on velocity
        const stretch = clamp(1 + d.velocity / 600, 1, 2.5);
        const swayX = Math.sin(time * 6 + d.swayOffset) * d.sway;
        const x = d.x + swayX;
        const y = d.y;

        ctx.save();
        ctx.translate(x, y);
        
        // Deep shadow for depth
        ctx.shadowColor = "rgba(0, 0, 0, 0.4)";
        ctx.shadowBlur = 4;

        // Droplet Body (Teardrop shape)
        const g = ctx.createLinearGradient(0, -d.size * stretch, 0, d.size);
        g.addColorStop(0, `rgba(200, 0, 0, ${lifeT})`);      // Top (lighter/thin)
        g.addColorStop(0.7, `rgba(100, 0, 0, ${lifeT})`);    // Bottom (thick/dark)
        g.addColorStop(1, `rgba(60, 0, 0, ${lifeT})`);       // Edge

        ctx.fillStyle = g;
        ctx.beginPath();
        // Mathematical teardrop
        ctx.moveTo(0, d.size); // Bottom
        ctx.bezierCurveTo(d.size, d.size, d.size, 0, 0, -d.size * stretch);
        ctx.bezierCurveTo(-d.size, 0, -d.size, d.size, 0, d.size);
        ctx.fill();

        // 3. SPECULAR HIGHLIGHTS (The "Wet" look)
        // Main glint
        ctx.shadowBlur = 0;
        ctx.fillStyle = `rgba(255, 255, 255, ${0.4 * lifeT})`;
        ctx.beginPath();
        ctx.ellipse(-d.size * 0.3, -d.size * 0.1, d.size * 0.2, d.size * 0.4, Math.PI / 4, 0, Math.PI * 2);
        ctx.fill();

        // Top tiny reflection dot
        ctx.fillStyle = `rgba(255, 255, 255, ${0.6 * lifeT})`;
        ctx.beginPath();
        ctx.arc(d.size * 0.2, d.size * 0.2, 1, 0, Math.PI * 2);
        ctx.fill();

        ctx.restore();
      }

      // 4. FLOOR POOLING / SPLASH
      // Instead of just dots, let's make expanding rings of impact
      for (let i = 0; i < 3; i++) {
        const t = (time * 1.2 + i * 0.33) % 1;
        const alpha = (1 - t) * 0.2;
        const scaleX = 20 + t * 40;
        
        ctx.strokeStyle = `rgba(150, 0, 0, ${alpha})`;
        ctx.lineWidth = 2;
        ctx.beginPath();
        ctx.ellipse(targetX + (i-1) * 20, targetY, scaleX, scaleX * 0.3, 0, 0, Math.PI * 2);
        ctx.stroke();
      }

      ctx.restore();
    },
  };
}

export const bleedCondition: ConditionDefinition = {
  id: "BLEED",
  name: "Bleed",
  createVisual: createBleedVisual,
};