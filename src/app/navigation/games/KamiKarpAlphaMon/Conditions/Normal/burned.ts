import {
  ConditionDefinition,
  ConditionVisualInstance,
} from "../conditionTypes";

const clamp = (v: number, min: number, max: number) =>
  Math.max(min, Math.min(max, v));

function createBurnedVisual(args: {
  targetX: number;
  targetY: number;
  isPlayerSide: boolean;
}): ConditionVisualInstance {
  const { targetX, targetY } = args;
  let time = 0;

  return {
    update(dt: number) {
      time += dt;
    },

    draw(ctx: CanvasRenderingContext2D) {
      ctx.save();

      const footY = targetY + 45;

      // 1. EMBERS / GROUND RADIANCE
      const flicker = Math.sin(time * 15) * 0.15 + 0.85;
      const groundGlow = ctx.createRadialGradient(
        targetX,
        footY,
        0,
        targetX,
        footY,
        90
      );
      groundGlow.addColorStop(0, `rgba(150, 0, 0, ${0.4 * flicker})`);
      groundGlow.addColorStop(1, "rgba(0, 0, 0, 0)");

      ctx.globalCompositeOperation = "screen";
      ctx.fillStyle = groundGlow;
      ctx.beginPath();
      ctx.ellipse(targetX, footY, 120, 30, 0, 0, Math.PI * 2);
      ctx.fill();

      // 2. FLAMES AROUND FEET
      const flameCount = 7;
      for (let i = 0; i < flameCount; i++) {
        const relPos = i / (flameCount - 1) - 0.5;
        const xOffset = relPos * 90;
        const zOffset = Math.abs(relPos) * 15;

        const h = 60 + Math.sin(time * 5 + i * 1.5) * 40;
        const w = 25 + Math.sin(time * 3 + i) * 10;

        const flameGrad = ctx.createLinearGradient(0, 0, 0, -h);
        flameGrad.addColorStop(0, "rgba(180, 0, 0, 0.7)");
        flameGrad.addColorStop(0.4, "rgba(230, 30, 0, 0.5)");
        flameGrad.addColorStop(1, "rgba(100, 0, 0, 0)");

        ctx.save();
        ctx.translate(targetX + xOffset, footY - zOffset);
        ctx.rotate(relPos * 0.4 + Math.sin(time * 2 + i) * 0.1);

        ctx.fillStyle = flameGrad;

        ctx.beginPath();
        ctx.moveTo(-w / 2, 5);
        ctx.bezierCurveTo(
          -w * 1.2,
          -h * 0.3,
          w * 1.5,
          -h * 0.7,
          Math.sin(time * 4 + i) * 15,
          -h
        );
        ctx.bezierCurveTo(
          w * 0.8,
          -h * 0.4,
          w * 1.2,
          -h * 0.1,
          w / 2,
          5
        );
        ctx.closePath();
        ctx.fill();

        ctx.fillStyle = `rgba(255, 80, 0, ${0.2 * flicker})`;
        ctx.beginPath();
        ctx.moveTo(-w / 4, 0);
        ctx.quadraticCurveTo(0, -h * 0.6, w / 4, 0);
        ctx.fill();

        ctx.restore();
      }

      // 3. SMOKE RISING FROM FEET / LOWER BODY
      ctx.globalCompositeOperation = "multiply";
      for (let j = 0; j < 3; j++) {
        const sX = targetX + Math.sin(time * 2 + j) * 20;
        const sY = footY - 40 - ((time * 40 + j * 30) % 100);
        const sAlpha = clamp(1 - ((footY - sY) / 100), 0, 0.3);

        ctx.fillStyle = `rgba(50, 0, 0, ${sAlpha})`;
        ctx.beginPath();
        ctx.arc(sX, sY, 15 + j * 5, 0, Math.PI * 2);
        ctx.fill();
      }

      ctx.restore();
    },
  };
}

export const burnedCondition: ConditionDefinition = {
  id: "BURNED",
  name: "Burned",
  createVisual: createBurnedVisual,
};