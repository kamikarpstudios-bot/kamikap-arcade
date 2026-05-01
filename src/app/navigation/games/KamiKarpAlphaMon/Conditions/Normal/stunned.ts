import {
  ConditionDefinition,
  ConditionVisualInstance,
} from "../conditionTypes";

const clamp = (v: number, min: number, max: number) =>
  Math.max(min, Math.min(max, v));

type StunStar = {
  angleOffset: number;
  color: string;
  size: number;
  wobbleSpeed: number;
};

function createStunVisual(args: {
  targetX: number;
  targetY: number;
  isPlayerSide: boolean;
}): ConditionVisualInstance {
  const { targetX, targetY } = args;
  
  let time = 0;
  const starCount = 3;
  const stars: StunStar[] = [
    { angleOffset: 0, color: "#FFD700", size: 8, wobbleSpeed: 2 },
    { angleOffset: (Math.PI * 2) / 3, color: "#FFFACD", size: 6, wobbleSpeed: 2.5 },
    { angleOffset: (Math.PI * 4) / 3, color: "#FFEC8B", size: 7, wobbleSpeed: 1.8 },
  ];

  // Helper to draw a star shape
  const drawStarShape = (ctx: CanvasRenderingContext2D, cx: number, cy: number, spikes: number, outerRadius: number, innerRadius: number) => {
    let rot = (Math.PI / 2) * 3;
    let x = cx;
    let y = cy;
    const step = Math.PI / spikes;

    ctx.beginPath();
    ctx.moveTo(cx, cy - outerRadius);
    for (let i = 0; i < spikes; i++) {
      x = cx + Math.cos(rot) * outerRadius;
      y = cy + Math.sin(rot) * outerRadius;
      ctx.lineTo(x, y);
      rot += step;

      x = cx + Math.cos(rot) * innerRadius;
      y = cy + Math.sin(rot) * innerRadius;
      ctx.lineTo(x, y);
      rot += step;
    }
    ctx.lineTo(cx, cy - outerRadius);
    ctx.closePath();
  };

  return {
    update(dt: number) {
      time += dt;
    },

    draw(ctx: CanvasRenderingContext2D) {
      ctx.save();

      const centerY = targetY - 140; // Positioned above head
      const radiusX = 50;           // Width of the halo
      const radiusY = 15;           // Height (creates the 3D tilt)
      const rotationSpeed = time * 3.5;

      // Sort stars by Y position so the ones "behind" are drawn first
      const sortedStars = [...stars].sort((a, b) => {
        const ay = Math.sin(rotationSpeed + a.angleOffset);
        const by = Math.sin(rotationSpeed + b.angleOffset);
        return ay - by;
      });

      for (const star of sortedStars) {
        const angle = rotationSpeed + star.angleOffset;
        
        // Calculate 3D-ish position
        const x = targetX + Math.cos(angle) * radiusX;
        // The Y uses sine for height, plus a vertical "float" wobble
        const y = centerY + Math.sin(angle) * radiusY + Math.sin(time * star.wobbleSpeed) * 5;

        // Scale stars slightly when they are "closer" (lower on screen)
        const isFront = Math.sin(angle) > 0;
        const depthScale = isFront ? 1.2 : 0.8;
        const alpha = isFront ? 1 : 0.6;

        ctx.save();
        ctx.translate(x, y);
        ctx.rotate(time * 2); // Star spins on its own axis

        // Outer Glow
        ctx.shadowBlur = 10;
        ctx.shadowColor = star.color;
        
        // Draw the Star
        ctx.fillStyle = star.color;
        ctx.globalAlpha = alpha;
        drawStarShape(ctx, 0, 0, 5, star.size * depthScale, (star.size / 2) * depthScale);
        ctx.fill();

        // Little center sparkle
        ctx.fillStyle = "white";
        ctx.beginPath();
        ctx.arc(0, 0, (star.size / 3) * depthScale, 0, Math.PI * 2);
        ctx.fill();

        ctx.restore();
      }

      // Optional: Faint dizzy "halo" line
      ctx.beginPath();
      ctx.ellipse(targetX, centerY, radiusX, radiusY, 0, 0, Math.PI * 2);
      ctx.strokeStyle = "rgba(255, 255, 255, 0.1)";
      ctx.lineWidth = 2;
      ctx.setLineDash([5, 10]); // Dashed line for that "cartoon dizzy" look
      ctx.stroke();

      ctx.restore();
    },
  };
}

export const stunCondition: ConditionDefinition = {
  id: "STUNNED",
  name: "Stunned",
  createVisual: createStunVisual,
};