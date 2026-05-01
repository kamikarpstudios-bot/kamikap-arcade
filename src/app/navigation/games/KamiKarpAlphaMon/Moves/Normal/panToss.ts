import { MoveDefinition, MoveAnimationInstance } from "../moveTypes";

const lerp = (a: number, b: number, t: number) => a + (b - a) * t;
const clamp = (v: number, min: number, max: number) =>
  Math.max(min, Math.min(max, v));

export function createPanTossAnimation(args: {
  userX: number;
  userY: number;
  targetX: number;
  targetY: number;
}): MoveAnimationInstance {
  const { userX, userY, targetX, targetY } = args;

  const startX = userX + 70;
  const startY = userY - 150;

  // Raise the impact point so it hits more around upper body / face area
  const hitX = targetX - 10;
  const hitY = targetY - 115;

  const travelDuration = 0.42;
  const totalDuration = 1.35;

  let time = 0;
  let hasHit = false;
  let screenShake = 0;

  return {
    update(dt: number) {
      time += dt;

      if (!hasHit && time >= travelDuration) {
        hasHit = true;
        screenShake = 11;
      }

      if (screenShake > 0) {
        screenShake *= Math.pow(0.78, dt * 60);
      }
    },

    draw(ctx: CanvasRenderingContext2D) {
      ctx.save();

      if (screenShake > 0.2) {
        ctx.translate(
          (Math.random() - 0.5) * screenShake,
          (Math.random() - 0.5) * screenShake
        );
      }

      const progress = time / travelDuration;
      let px = 0;
      let py = 0;
      let rotation = 0;
      let opacity = 1;

      if (progress <= 1) {
        const t = clamp(progress, 0, 1);

        px = lerp(startX, hitX, t);

        // Higher, nicer arc
        py =
          lerp(startY, hitY, t) -
          Math.sin(t * Math.PI) * 130;

        rotation = t * Math.PI * 7.5;
      } else {
        const bounceT = time - travelDuration;
        const bounceProgress = clamp(
          bounceT / (totalDuration - travelDuration),
          0,
          1
        );

        // Short bounce back after the hit
        px = hitX - bounceT * 95;
        py = hitY - (bounceT * 150 - bounceT * bounceT * 420);

        rotation = Math.PI * 7.5 + bounceT * 3.2;
        opacity = 1 - bounceProgress;
      }

      if (opacity <= 0) {
        ctx.restore();
        return;
      }

      ctx.globalAlpha = opacity;
      ctx.translate(px, py);
      ctx.rotate(rotation);

      // Motion arcs
      if (progress <= 1.08) {
        const arcAlpha = clamp(0.35 * (1.08 - progress) / 1.08, 0, 0.35);
        ctx.strokeStyle = `rgba(255,255,255,${arcAlpha})`;
        ctx.lineWidth = 2;

        for (let i = 0; i < 3; i++) {
          ctx.beginPath();
          ctx.arc(0, 0, 34 + i * 8, -Math.PI * 0.15, Math.PI * 0.35);
          ctx.stroke();
        }
      }

      // Handle
      ctx.fillStyle = "#161616";
      ctx.beginPath();
      ctx.roundRect(16, -5, 38, 10, 4);
      ctx.fill();

      ctx.strokeStyle = "#2f2f2f";
      ctx.lineWidth = 2;
      ctx.stroke();

      // Small handle hole
      ctx.beginPath();
      ctx.arc(47, 0, 2.2, 0, Math.PI * 2);
      ctx.fillStyle = "#0d0d0d";
      ctx.fill();

      // Outer pan body
      ctx.beginPath();
      ctx.arc(0, 0, 27, 0, Math.PI * 2);
      ctx.fillStyle = "#232323";
      ctx.fill();

      ctx.strokeStyle = "#4a4a4a";
      ctx.lineWidth = 2;
      ctx.stroke();

      // Inner pan
      ctx.beginPath();
      ctx.arc(0, 0, 20.5, 0, Math.PI * 2);
      ctx.fillStyle = "#2f2f2f";
      ctx.fill();

      // Rim highlight
      ctx.strokeStyle = "rgba(255,255,255,0.14)";
      ctx.lineWidth = 3;
      ctx.beginPath();
      ctx.arc(0, 0, 23.5, -Math.PI * 0.95, -Math.PI * 0.1);
      ctx.stroke();

      // Inner shine
      ctx.strokeStyle = "rgba(255,255,255,0.08)";
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.arc(-4, -4, 10, -Math.PI * 0.9, -Math.PI * 0.2);
      ctx.stroke();

      ctx.restore();

      // Impact burst
      if (hasHit) {
        const burstT = clamp((time - travelDuration) / 0.22, 0, 1);

        if (burstT < 1) {
          ctx.save();
          ctx.translate(hitX, hitY);

          ctx.strokeStyle = `rgba(255,255,255,${1 - burstT})`;
          ctx.lineWidth = 4;

          for (let i = 0; i < 7; i++) {
            const angle = (i / 7) * Math.PI * 2;
            const inner = 18 + burstT * 8;
            const outer = 34 + burstT * 24;

            ctx.beginPath();
            ctx.moveTo(Math.cos(angle) * inner, Math.sin(angle) * inner);
            ctx.lineTo(Math.cos(angle) * outer, Math.sin(angle) * outer);
            ctx.stroke();
          }

          // little center flash
          ctx.globalAlpha = 0.22 * (1 - burstT);
          ctx.beginPath();
          ctx.arc(0, 0, 18 + burstT * 12, 0, Math.PI * 2);
          ctx.fillStyle = "#ffffff";
          ctx.fill();

          ctx.restore();
        }
      }
    },

    isDone: () => time >= totalDuration,
  };
}

export const panTossMove: MoveDefinition = {
  id: "PAN_TOSS",
  name: "Giga Skillet Slap",
  power: 20,
  staminaCost: 10,
  speed: 1,
  createAnimation: createPanTossAnimation,
};