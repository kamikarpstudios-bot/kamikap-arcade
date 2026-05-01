export type SummonAnimationInstance = {
  update: (dt: number) => void;
  drawUnderMonster: (ctx: CanvasRenderingContext2D) => void;
  drawOverMonster: (ctx: CanvasRenderingContext2D) => void;
  isDone: () => boolean;
  shouldHideOldMonster: () => boolean;
  shouldShowNewMonster: () => boolean;
  getScreenShake: () => number;
};

const clamp = (v: number, min: number, max: number) =>
  Math.max(min, Math.min(max, v));

const lerp = (a: number, b: number, t: number) => a + (b - a) * t;

const easeOutCubic = (t: number) => 1 - Math.pow(1 - t, 3);
const easeInCubic = (t: number) => t * t * t;
const easeOutBack = (t: number) => {
  const c1 = 1.70158;
  const c3 = c1 + 1;
  return 1 + c3 * Math.pow(t - 1, 3) + c1 * Math.pow(t - 1, 2);
};

export function createSummonAnimation(args: {
  rootX: number;
  rootY: number;
  circleOffsetY?: number; // 👈 ADD THIS
  monsterImage: CanvasImageSource;
  monsterWidth: number;
  monsterHeight: number;
  monsterLoaded: () => boolean;
  targetHeight: number;
}): SummonAnimationInstance {
const {
  rootX,
  rootY,
  circleOffsetY = 28, // 👈 DEFAULT (good starting point)
  monsterImage,
  monsterWidth,
  monsterHeight,
  monsterLoaded,
  targetHeight,
} = args;

  let time = 0;
  const duration = 0.92;

  function getT() {
    return clamp(time / duration, 0, 1);
  }

  function phase(start: number, end: number) {
    return clamp((getT() - start) / (end - start), 0, 1);
  }

  function getMonsterDrawData(yOffset = 0, scaleMul = 1) {
    const scale = (targetHeight / monsterHeight) * scaleMul;
    const drawW = monsterWidth * scale;
    const drawH = monsterHeight * scale;

    return {
      drawW,
      drawH,
      drawX: rootX - drawW / 2,
      drawY: rootY - drawH + yOffset,
    };
  }

  function drawSummonCircle(
    ctx: CanvasRenderingContext2D,
    alpha: number,
    radiusMul: number
  ) {
    const rx = 92 * radiusMul;
    const ry = 24 * radiusMul;
    const circleY = rootY + circleOffsetY;
    ctx.save();
    ctx.globalAlpha = alpha;

    const glow = ctx.createRadialGradient(rootX, circleY, 0, rootX, circleY, rx);
    glow.addColorStop(0, "rgba(210,240,255,0.32)");
    glow.addColorStop(0.45, "rgba(110,180,255,0.18)");
    glow.addColorStop(1, "rgba(0,0,0,0)");
    ctx.fillStyle = glow;
    ctx.beginPath();
    ctx.ellipse(rootX, circleY, rx, ry, 0, 0, Math.PI * 2);
    ctx.fill();

    ctx.lineWidth = 3;
    ctx.strokeStyle = "rgba(120,200,255,0.85)";
    ctx.beginPath();
    ctx.ellipse(rootX, circleY, rx * 0.92, ry * 0.92, 0, 0, Math.PI * 2);
    ctx.stroke();

    ctx.lineWidth = 1.5;
    ctx.strokeStyle = "rgba(255,255,255,0.7)";
    ctx.beginPath();
    ctx.ellipse(rootX, rootY, rx * 0.62, ry * 0.62, 0, 0, Math.PI * 2);
    ctx.stroke();

    ctx.restore();
  }

  function drawBeam(ctx: CanvasRenderingContext2D, alpha: number, widthMul: number) {
    ctx.save();
    ctx.globalCompositeOperation = "lighter";
    ctx.globalAlpha = alpha;

    const beamW = 44 * widthMul;
    const outerW = beamW * 2.4;

    const outer = ctx.createLinearGradient(rootX, rootY - 360, rootX, rootY + 40);
    outer.addColorStop(0, "rgba(120,190,255,0)");
    outer.addColorStop(0.18, "rgba(120,190,255,0.16)");
    outer.addColorStop(0.55, "rgba(180,220,255,0.26)");
    outer.addColorStop(1, "rgba(120,190,255,0.08)");

    ctx.fillStyle = outer;
    ctx.fillRect(rootX - outerW / 2, rootY - 360, outerW, 420);

    const core = ctx.createLinearGradient(rootX, rootY - 360, rootX, rootY + 40);
    core.addColorStop(0, "rgba(255,255,255,0)");
    core.addColorStop(0.2, "rgba(255,255,255,0.52)");
    core.addColorStop(0.5, "rgba(255,255,255,0.95)");
    core.addColorStop(1, "rgba(255,255,255,0.34)");

    ctx.fillStyle = core;
    ctx.fillRect(rootX - beamW / 2, rootY - 360, beamW, 420);

    ctx.restore();
  }

  function drawMonsterSilhouette(
    ctx: CanvasRenderingContext2D,
    alpha: number,
    yOffset: number,
    scaleMul: number
  ) {
    if (!monsterLoaded()) return;

    const { drawW, drawH, drawX, drawY } = getMonsterDrawData(yOffset, scaleMul);

    const off = document.createElement("canvas");
    off.width = Math.ceil(drawW);
    off.height = Math.ceil(drawH);

    const octx = off.getContext("2d");
    if (!octx) return;

    octx.drawImage(monsterImage, 0, 0, drawW, drawH);
    octx.globalCompositeOperation = "source-in";
    octx.fillStyle = "rgba(255,255,255,1)";
    octx.fillRect(0, 0, off.width, off.height);

    ctx.save();
    ctx.globalAlpha = alpha;
    ctx.globalCompositeOperation = "lighter";
    ctx.drawImage(off, drawX, drawY);
    ctx.restore();
  }

  return {
    update(dt: number) {
      time += dt;
    },

    drawUnderMonster(ctx: CanvasRenderingContext2D) {
      const circleIn = easeOutCubic(phase(0.0, 0.18));
      const fadeOut = 1 - phase(0.72, 1.0);

      if (circleIn <= 0 || fadeOut <= 0) return;

      const pulse = 1 + Math.sin(time * 18) * 0.035;
      drawSummonCircle(ctx, fadeOut, circleIn * pulse);
    },

    drawOverMonster(ctx: CanvasRenderingContext2D) {
      const beamIn = easeOutCubic(phase(0.08, 0.24));
      const beamOut = 1 - phase(0.6, 0.92);

      const riseT = phase(0.22, 0.62);
      const slamT = phase(0.62, 0.78);
      const revealT = phase(0.72, 1.0);

      if (beamIn > 0 && beamOut > 0) {
        drawBeam(ctx, beamOut, lerp(0.7, 1.1, beamIn));
      }

      let silhouetteAlpha = 0;
      let silhouetteYOffset = 0;
      let silhouetteScale = 1;

      if (riseT > 0 && slamT <= 0) {
        const e = easeOutBack(riseT);
        silhouetteAlpha = 0.95;
        silhouetteYOffset = lerp(180, -18, e);
        silhouetteScale = lerp(0.92, 1.02, e);
      } else if (slamT > 0 && revealT < 1) {
        const e = easeInCubic(slamT);
        silhouetteAlpha = 1 - revealT * 0.85;
        silhouetteYOffset = lerp(-18, 0, e);
        silhouetteScale = lerp(1.02, 1.0, e);
      }

      if (silhouetteAlpha > 0.01) {
        drawMonsterSilhouette(
          ctx,
          silhouetteAlpha,
          silhouetteYOffset,
          silhouetteScale
        );
      }

      if (revealT > 0 && revealT < 0.35) {
        const flash = Math.sin((revealT / 0.35) * Math.PI);

        ctx.save();
        ctx.globalCompositeOperation = "lighter";
        const g = ctx.createRadialGradient(rootX, rootY - 90, 0, rootX, rootY - 90, 180);
        g.addColorStop(0, `rgba(255,255,255,${0.55 * flash})`);
        g.addColorStop(1, "rgba(255,255,255,0)");
        ctx.fillStyle = g;
        ctx.fillRect(rootX - 220, rootY - 260, 440, 320);
        ctx.restore();
      }

      if (slamT > 0 && slamT < 0.45) {
        const shock = slamT / 0.45;
        const radius = lerp(20, 140, shock);
        const alpha = 1 - shock;

        ctx.save();
        ctx.strokeStyle = `rgba(255,255,255,${alpha})`;
        ctx.lineWidth = 4;
        ctx.beginPath();
        ctx.ellipse(rootX, rootY, radius, radius * 0.24, 0, 0, Math.PI * 2);
        ctx.stroke();
        ctx.restore();
      }
    },

    isDone() {
      return time >= duration;
    },

    shouldHideOldMonster() {
      return getT() >= 0.16;
    },

    shouldShowNewMonster() {
      return getT() >= 0.72;
    },

    getScreenShake() {
      const slamT = phase(0.62, 0.74);
      if (slamT > 0 && slamT < 1) {
        return (1 - slamT) * 10;
      }
      return 0;
    },
  };
}