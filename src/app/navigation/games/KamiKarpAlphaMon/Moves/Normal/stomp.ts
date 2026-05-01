import { MoveDefinition, MoveAnimationInstance } from "../moveTypes";
import { MonsterId } from "../../systems/StateManager";
import { monsterRegistry } from "../../Monsters/monsterRegistry";
import { drawMonster } from "../../Monsters/drawMonster";

const lerp = (a: number, b: number, t: number) => a + (b - a) * t;
const clamp = (v: number, min: number, max: number) =>
  Math.max(min, Math.min(max, v));

const easeOutCubic = (t: number) => 1 - Math.pow(1 - t, 3);
const easeInCubic = (t: number) => t * t * t;
const easeInOutQuad = (t: number) =>
  t < 0.5 ? 2 * t * t : 1 - Math.pow(-2 * t + 2, 2) / 2;
const easeOutExpo = (t: number) => (t >= 1 ? 1 : 1 - Math.pow(2, -10 * t));

type CrackShard = {
  angle: number;
  length: number;
  width: number;
  offsetX: number;
  offsetY: number;
};

type DustParticle = {
  x: number;
  y: number;
  vx: number;
  vy: number;
  size: number;
  life: number;
  maxLife: number;
  alpha: number;
};

type DebrisChunk = {
  x: number;
  y: number;
  vx: number;
  vy: number;
  size: number;
  rot: number;
  rotSpeed: number;
  life: number;
  maxLife: number;
};

function spawnDustBurst(
  particles: DustParticle[],
  x: number,
  y: number,
  amount: number
) {
  for (let i = 0; i < amount; i++) {
    const angle = Math.random() * Math.PI * 2;
    const speed = 80 + Math.random() * 280;
    const life = 0.35 + Math.random() * 0.45;

    particles.push({
      x: x + (Math.random() - 0.5) * 40,
      y: y + (Math.random() - 0.5) * 12,
      vx: Math.cos(angle) * speed,
      vy: Math.sin(angle) * speed - (80 + Math.random() * 120),
      size: 8 + Math.random() * 18,
      life,
      maxLife: life,
      alpha: 0.55 + Math.random() * 0.35,
    });
  }
}

function spawnDebrisBurst(
  debris: DebrisChunk[],
  x: number,
  y: number,
  amount: number
) {
  for (let i = 0; i < amount; i++) {
    const angle = -Math.PI + Math.random() * Math.PI;
    const speed = 120 + Math.random() * 280;
    const life = 0.45 + Math.random() * 0.35;

    debris.push({
      x: x + (Math.random() - 0.5) * 50,
      y: y + Math.random() * 10,
      vx: Math.cos(angle) * speed,
      vy: -80 - Math.random() * 220,
      size: 6 + Math.random() * 10,
      rot: Math.random() * Math.PI * 2,
      rotSpeed: (Math.random() - 0.5) * 18,
      life,
      maxLife: life,
    });
  }
}

function drawGroundShadow(
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  width: number,
  height: number,
  alpha: number
) {
  ctx.save();
  ctx.fillStyle = `rgba(0,0,0,${alpha})`;
  ctx.beginPath();
  ctx.ellipse(x, y, width, height, 0, 0, Math.PI * 2);
  ctx.fill();
  ctx.restore();
}

function drawAnimatedMonster(args: {
  ctx: CanvasRenderingContext2D;
  monsterId: MonsterId;
  x: number;
  y: number;
  facing: 1 | -1;
  targetHeight: number;
  time: number;
  squashX?: number;
  squashY?: number;
  alpha?: number;
  rotation?: number;
  ghost?: boolean;
}) {
  const {
    ctx,
    monsterId,
    x,
    y,
    facing,
    targetHeight,
    time,
    squashX = 1,
    squashY = 1,
    alpha = 1,
    rotation = 0,
    ghost = false,
  } = args;

  const monster = monsterRegistry[monsterId];
  if (!monster) return;

  const baseHeight = (monster as { baseHeight?: number }).baseHeight ?? 220;
  const scale = targetHeight / baseHeight;

  ctx.save();
  ctx.translate(x, y);
  ctx.rotate(rotation);
  ctx.scale(scale * facing * squashX, scale * squashY);
  ctx.globalAlpha = alpha;

  if (ghost) {
    ctx.globalCompositeOperation = "screen";

    ctx.save();
    ctx.translate(-6, 0);
    ctx.globalAlpha = alpha * 0.22;
    drawMonster(monster, {
      ctx,
      x: 0,
      y: 0,
      time,
      mouseX: 0,
      mouseY: 0,
      state: "BATTLE",
    });
    ctx.restore();

    ctx.save();
    ctx.translate(6, 0);
    ctx.globalAlpha = alpha * 0.18;
    drawMonster(monster, {
      ctx,
      x: 0,
      y: 0,
      time,
      mouseX: 0,
      mouseY: 0,
      state: "BATTLE",
    });
    ctx.restore();

    ctx.globalCompositeOperation = "source-over";
  }

  drawMonster(monster, {
    ctx,
    x: 0,
    y: 0,
    time,
    mouseX: 0,
    mouseY: 0,
    state: "BATTLE",
  });

  ctx.restore();
}

export function createStompAnimation(args: {
  userX: number;
  userY: number;
  userMonsterY?: number;
  targetX: number;
  targetY: number;
  targetMonsterY?: number;
  userMonsterId?: MonsterId | null;
  userTargetHeight?: number;
  userFacing?: 1 | -1;
  timeProvider?: () => number;
}): MoveAnimationInstance {
  const {
    userX,
    userY,
    userMonsterY,
    targetX,
    targetY,
    targetMonsterY,
    userMonsterId = null,
    userTargetHeight = 255,
    userFacing = 1,
    timeProvider,
  } = args;

  let time = 0;

  const crouchEnd = 0.12;
  const riseEnd = 0.34;
  const hangEnd = 0.42;
  const slamEnd = 0.56;
  const impactHoldEnd = 0.76;
  const returnEnd = 0.98;

  let didImpact = false;
  let screenShake = 0;
  let impactFlash = 0;

  const dust: DustParticle[] = [];
  const debris: DebrisChunk[] = [];
  const cracks: CrackShard[] = [];

  const monsterId = userMonsterId;
  const liveTime = () => (timeProvider ? timeProvider() : time);
  const userRootY = userMonsterY ?? userY;
  const targetRootY = targetMonsterY ?? targetY;

  return {
    shouldHideUser: true,

    update(dt: number) {
      time += dt;

      if (!didImpact && time >= slamEnd) {
        didImpact = true;
        screenShake = 30;
        impactFlash = 1;

        spawnDustBurst(dust, targetX, targetY + 4, 30);
        spawnDebrisBurst(debris, targetX, targetY + 2, 16);

        for (let i = 0; i < 22; i++) {
          const spreadBias =
            i % 2 === 0
              ? Math.random() * Math.PI
              : Math.PI + Math.random() * Math.PI;

          cracks.push({
            angle: spreadBias + (Math.random() - 0.5) * 0.7,
            length: 40 + Math.random() * 115,
            width: 2 + Math.random() * 4,
            offsetX: (Math.random() - 0.5) * 48,
            offsetY: (Math.random() - 0.5) * 16,
          });
        }
      }

      for (const p of dust) {
        p.life -= dt;
        p.x += p.vx * dt;
        p.y += p.vy * dt;
        p.vx *= Math.pow(0.92, dt * 60);
        p.vy += 420 * dt;
      }

      for (const d of debris) {
        d.life -= dt;
        d.x += d.vx * dt;
        d.y += d.vy * dt;
        d.vx *= Math.pow(0.97, dt * 60);
        d.vy += 760 * dt;
        d.rot += d.rotSpeed * dt;
      }

      screenShake *= Math.pow(0.82, dt * 60);
      impactFlash *= Math.pow(0.72, dt * 60);
    },

    drawUserOverride(ctx: CanvasRenderingContext2D) {
      if (!monsterId) return;

      const tNow = liveTime();

      // 1. crouch
      if (tNow < crouchEnd) {
        const t = clamp(tNow / crouchEnd, 0, 1);
        const squashX = lerp(1, 1.12, t);
        const squashY = lerp(1, 0.8, t);
        const sinkY = lerp(0, 12, t);

        drawAnimatedMonster({
          ctx,
          monsterId,
          x: userX,
          y: userRootY + sinkY,
          facing: userFacing,
          targetHeight: userTargetHeight,
          time: liveTime(),
          squashX,
          squashY,
        });
        return;
      }

      // 2. leap
      if (tNow < riseEnd) {
        const t = clamp((tNow - crouchEnd) / (riseEnd - crouchEnd), 0, 1);
        const eased = easeInOutQuad(t);

        const x = lerp(userX, targetX, eased);
        const yBase = lerp(userRootY, targetRootY, eased);
        const arcY = Math.sin(eased * Math.PI) * 240;
        const y = yBase - arcY;

        const squashX = lerp(0.92, 1.08, eased);
        const squashY = lerp(1.08, 0.92, eased);
        const rotation = lerp(-0.08 * userFacing, 0.05 * userFacing, eased);

        for (let i = 0; i < 3; i++) {
          const ghostT = clamp(t - i * 0.09, 0, 1);
          const ghostEased = easeInOutQuad(ghostT);
          const gx = lerp(userX, targetX, ghostEased);
          const gyBase = lerp(userRootY, targetRootY, ghostEased);
          const gy = gyBase - Math.sin(ghostEased * Math.PI) * 240;

          drawAnimatedMonster({
            ctx,
            monsterId,
            x: gx,
            y: gy,
            facing: userFacing,
            targetHeight: userTargetHeight,
            time: liveTime(),
            squashX,
            squashY,
            alpha: 0.16 * (1 - i * 0.25),
            rotation,
            ghost: true,
          });
        }

        drawAnimatedMonster({
          ctx,
          monsterId,
          x,
          y,
          facing: userFacing,
          targetHeight: userTargetHeight,
          time: liveTime(),
          squashX,
          squashY,
          rotation,
        });
        return;
      }

      // 3. tiny hang
      if (tNow < hangEnd) {
        const t = clamp((tNow - riseEnd) / (hangEnd - riseEnd), 0, 1);
        const x = targetX;
        const y = targetRootY - 240 + Math.sin(t * Math.PI) * 6;

        drawAnimatedMonster({
          ctx,
          monsterId,
          x,
          y,
          facing: userFacing,
          targetHeight: userTargetHeight,
          time: liveTime(),
          squashX: 1.04,
          squashY: 0.96,
          rotation: 0.02 * userFacing,
        });
        return;
      }

      // 4. slam down
      if (tNow < slamEnd) {
        const t = clamp((tNow - hangEnd) / (slamEnd - hangEnd), 0, 1);
        const fallT = easeInCubic(t);

        const y = lerp(targetRootY - 240, targetRootY - 6, fallT);
        const squashX = lerp(0.96, 1.18, t);
        const squashY = lerp(1.04, 0.72, t);

        drawAnimatedMonster({
          ctx,
          monsterId,
          x: targetX,
          y,
          facing: userFacing,
          targetHeight: userTargetHeight,
          time: liveTime(),
          squashX,
          squashY,
          rotation: lerp(0.02 * userFacing, -0.04 * userFacing, t),
        });
        return;
      }

      // 5. impact hold
      if (tNow < impactHoldEnd) {
        const t = clamp((tNow - slamEnd) / (impactHoldEnd - slamEnd), 0, 1);
        const recover = easeOutExpo(t);

        const squashX = lerp(1.34, 1, recover);
        const squashY = lerp(0.58, 1, recover);

        drawAnimatedMonster({
          ctx,
          monsterId,
          x: targetX,
          y: targetRootY - 6,
          facing: userFacing,
          targetHeight: userTargetHeight,
          time: liveTime(),
          squashX,
          squashY,
          rotation: lerp(-0.05 * userFacing, 0, recover),
        });
        return;
      }

      // 6. zip back
      if (tNow < returnEnd) {
        const t = clamp((tNow - impactHoldEnd) / (returnEnd - impactHoldEnd), 0, 1);
        const eased = easeOutCubic(t);

        const x = lerp(targetX, userX, eased);
        const y = lerp(targetRootY - 6, userRootY, eased) - Math.sin(eased * Math.PI) * 38;

        for (let i = 0; i < 3; i++) {
          const ghostT = clamp(t - i * 0.07, 0, 1);
          const ghostEased = easeOutCubic(ghostT);
          const gx = lerp(targetX, userX, ghostEased);
          const gy = lerp(targetRootY - 6, userRootY, ghostEased) - Math.sin(ghostEased * Math.PI) * 38;

          drawAnimatedMonster({
            ctx,
            monsterId,
            x: gx,
            y: gy,
            facing: userFacing,
            targetHeight: userTargetHeight,
            time: liveTime(),
            squashX: 1.05,
            squashY: 0.95,
            alpha: 0.18 * (1 - i * 0.28) * (1 - t),
            rotation: 0.06 * userFacing,
            ghost: true,
          });
        }

        drawAnimatedMonster({
          ctx,
          monsterId,
          x,
          y,
          facing: userFacing,
          targetHeight: userTargetHeight,
          time: liveTime(),
          squashX: 1.04,
          squashY: 0.96,
          alpha: 1 - t,
          rotation: 0.05 * userFacing,
        });
        return;
      }
    },

    draw(ctx: CanvasRenderingContext2D) {
      ctx.save();

      if (screenShake > 0.35) {
        ctx.translate(
          (Math.random() - 0.5) * screenShake,
          (Math.random() - 0.5) * screenShake * 0.7
        );
      }

      const preImpactShadowAlpha =
        time < slamEnd
          ? 0.14 + (time / slamEnd) * 0.18
          : 0.3 * (1 - clamp((time - slamEnd) / 0.35, 0, 1));

      drawGroundShadow(ctx, targetX, targetY + 12, 92, 20, preImpactShadowAlpha);

      if (time >= hangEnd && time < slamEnd) {
        const t = clamp((time - hangEnd) / (slamEnd - hangEnd), 0, 1);
        ctx.strokeStyle = `rgba(255,255,255,${0.16 + t * 0.22})`;
        ctx.lineWidth = 5;
        ctx.lineCap = "round";

        const y = lerp(targetY - 240, targetY - 6, easeInCubic(t));

        for (let i = 0; i < 4; i++) {
          const offset = -36 + i * 24;
          ctx.beginPath();
          ctx.moveTo(targetX + offset, y - 140);
          ctx.lineTo(targetX + offset * 0.7, y - 20);
          ctx.stroke();
        }
      }

      if (time >= slamEnd && time < impactHoldEnd) {
        const t = clamp((time - slamEnd) / (impactHoldEnd - slamEnd), 0, 1);
        const glowAlpha = 0.35 * (1 - t);

        ctx.fillStyle = `rgba(255,255,255,${glowAlpha})`;
        ctx.beginPath();
        ctx.ellipse(
          targetX,
          targetY + 8,
          120 - t * 20,
          28 - t * 6,
          0,
          0,
          Math.PI * 2
        );
        ctx.fill();

        ctx.lineCap = "round";
        cracks.forEach((c, i) => {
          const crackAlpha = (1 - t) * (0.9 - (i % 3) * 0.12);

          ctx.strokeStyle = `rgba(255,255,255,${crackAlpha})`;
          ctx.lineWidth = c.width;
          ctx.beginPath();
          ctx.moveTo(targetX + c.offsetX, targetY + c.offsetY);
          ctx.lineTo(
            targetX + c.offsetX + Math.cos(c.angle) * c.length,
            targetY + c.offsetY + Math.sin(c.angle) * c.length
          );
          ctx.stroke();

          ctx.strokeStyle = `rgba(255,80,80,${crackAlpha * 0.22})`;
          ctx.beginPath();
          ctx.moveTo(targetX + c.offsetX - 2, targetY + c.offsetY);
          ctx.lineTo(
            targetX + c.offsetX - 2 + Math.cos(c.angle) * c.length,
            targetY + c.offsetY + Math.sin(c.angle) * c.length
          );
          ctx.stroke();

          ctx.strokeStyle = `rgba(80,255,255,${crackAlpha * 0.2})`;
          ctx.beginPath();
          ctx.moveTo(targetX + c.offsetX + 2, targetY + c.offsetY);
          ctx.lineTo(
            targetX + c.offsetX + 2 + Math.cos(c.angle) * c.length,
            targetY + c.offsetY + Math.sin(c.angle) * c.length
          );
          ctx.stroke();
        });
      }

      if (didImpact) {
        const ringT = clamp((time - slamEnd) * 2.7, 0, 1);

        ctx.strokeStyle = `rgba(255,255,255,${1 - ringT})`;
        ctx.lineWidth = 6 * (1 - ringT);
        ctx.beginPath();
        ctx.ellipse(targetX, targetY + 8, ringT * 280, ringT * 72, 0, 0, Math.PI * 2);
        ctx.stroke();

        ctx.strokeStyle = `rgba(255,80,80,${(1 - ringT) * 0.22})`;
        ctx.lineWidth = 3 * (1 - ringT);
        ctx.beginPath();
        ctx.ellipse(targetX - 6, targetY + 8, ringT * 260, ringT * 66, 0, 0, Math.PI * 2);
        ctx.stroke();

        ctx.strokeStyle = `rgba(80,255,255,${(1 - ringT) * 0.18})`;
        ctx.beginPath();
        ctx.ellipse(targetX + 6, targetY + 8, ringT * 260, ringT * 66, 0, 0, Math.PI * 2);
        ctx.stroke();
      }

      if (impactFlash > 0.02) {
        ctx.fillStyle = `rgba(255,255,255,${impactFlash * 0.22})`;
        ctx.beginPath();
        ctx.arc(targetX, targetY - 8, 120 * impactFlash + 40, 0, Math.PI * 2);
        ctx.fill();
      }

      for (const d of debris) {
        if (d.life <= 0) continue;
        const a = d.life / d.maxLife;

        ctx.save();
        ctx.translate(d.x, d.y);
        ctx.rotate(d.rot);

        ctx.fillStyle = `rgba(255,255,255,${a * 0.65})`;
        ctx.beginPath();
        ctx.roundRect(-d.size * 0.5, -d.size * 0.5, d.size, d.size * 0.72, 2);
        ctx.fill();
        ctx.restore();
      }

      for (const p of dust) {
        if (p.life <= 0) continue;
        const lifeT = p.life / p.maxLife;

        ctx.fillStyle = `rgba(255,255,255,${lifeT * p.alpha})`;
        ctx.beginPath();
        ctx.arc(p.x, p.y, p.size * (0.6 + (1 - lifeT) * 0.6), 0, Math.PI * 2);
        ctx.fill();

        ctx.fillStyle = `rgba(255,80,80,${lifeT * p.alpha * 0.08})`;
        ctx.beginPath();
        ctx.arc(p.x - 2, p.y, p.size * 0.85, 0, Math.PI * 2);
        ctx.fill();

        ctx.fillStyle = `rgba(80,255,255,${lifeT * p.alpha * 0.08})`;
        ctx.beginPath();
        ctx.arc(p.x + 2, p.y, p.size * 0.85, 0, Math.PI * 2);
        ctx.fill();
      }

      ctx.restore();
    },

    getScreenShake: () => screenShake,
    isDone: () => time >= returnEnd,
  };
}

export const stompMove: MoveDefinition = {
  id: "STOMP",
  name: "Giga Stomp",
  power: 20,
  staminaCost: 10,
  speed: 16,
  createAnimation: createStompAnimation,
};
