import {
  FaceDrawArgs,
  MonsterDefinition,
  MonsterDrawArgs,
} from "./monsterTypes";

type MonsterAnimationState = {
  blinkTimer: number;
  nextBlinkAt: number;
  blinkAmount: number;
  yawnTimer: number;
  nextYawnAt: number;
  yawnAmount: number;
};

const animationStateByMonsterId: Record<string, MonsterAnimationState> = {};
const loadedImages: Record<string, HTMLImageElement> = {};
const loadingImages: Record<string, boolean> = {};

function rand(min: number, max: number) {
  return Math.random() * (max - min) + min;
}

function getMonsterAnimState(monsterId: string): MonsterAnimationState {
  if (!animationStateByMonsterId[monsterId]) {
    animationStateByMonsterId[monsterId] = {
      blinkTimer: 0,
      nextBlinkAt: rand(1.8, 4.2),
      blinkAmount: 0,
      yawnTimer: 0,
      nextYawnAt: rand(8, 15),
      yawnAmount: 0,
    };
  }

  return animationStateByMonsterId[monsterId];
}

function updateBlink(state: MonsterAnimationState, time: number, dt: number) {
  const blinkDuration = 0.16;

  if (time >= state.nextBlinkAt && state.blinkTimer <= 0) {
    state.blinkTimer = blinkDuration;
    state.nextBlinkAt = time + rand(1.8, 4.2);
  }

  if (state.blinkTimer > 0) {
    state.blinkTimer -= dt;
    const progress = 1 - state.blinkTimer / blinkDuration;

    if (progress < 0.5) {
      state.blinkAmount = progress / 0.5;
    } else {
      state.blinkAmount = 1 - (progress - 0.5) / 0.5;
    }
  } else {
    state.blinkAmount = 0;
  }
}

function updateYawn(state: MonsterAnimationState, time: number, dt: number) {
  const yawnDuration = 1.6;

  if (time >= state.nextYawnAt && state.yawnTimer <= 0) {
    state.yawnTimer = yawnDuration;
    state.nextYawnAt = time + rand(8.5, 15);
  }

  if (state.yawnTimer > 0) {
    state.yawnTimer -= dt;
    const progress = 1 - state.yawnTimer / yawnDuration;

    if (progress < 0.18) {
      state.yawnAmount = progress / 0.18;
    } else if (progress < 0.72) {
      state.yawnAmount = 1;
    } else {
      state.yawnAmount = 1 - (progress - 0.72) / 0.28;
    }
  } else {
    state.yawnAmount = 0;
  }
}

function requestMonsterImage(src: string) {
  if (loadedImages[src] || loadingImages[src]) return;

  loadingImages[src] = true;

  const img = new Image();
  img.src = src;

  img.onload = () => {
    loadedImages[src] = img;
    loadingImages[src] = false;
    console.log("Monster image loaded:", src);
  };

  img.onerror = () => {
    loadingImages[src] = false;
    console.error("Monster image failed to load:", src);
  };
}

export function drawMonster(monster: MonsterDefinition, args: MonsterDrawArgs) {
  const { ctx, x, y, time, mouseX, mouseY, state } = args;
  const dt = 0.016;

  const anim = getMonsterAnimState(monster.id);
  updateBlink(anim, time, dt);

  if (state === "HOME") {
    updateYawn(anim, time, dt);
  } else {
    anim.yawnAmount = 0;
  }

  const stateOffsetX =
    state === "BATTLE" || state === "PAIN" || state === "FAINT" || state === "victory"
      ? (monster.battleOffsetX ?? monster.homeOffsetX ?? 0)
      : (monster.homeOffsetX ?? 0);

  const stateOffsetY =
    state === "BATTLE" || state === "PAIN" || state === "FAINT" || state === "victory"
      ? (monster.battleOffsetY ?? monster.homeOffsetY ?? 0)
      : (monster.homeOffsetY ?? 0);

  // =========================================================
  // CODE-DRAWN MONSTER PATH
  // =========================================================
  if (monster.drawBody) {
    const bodyScale = monster.baseHeight / 140;

    monster.drawBody({
      ctx,
      x: x + stateOffsetX,
      y: y + stateOffsetY,
      time,
      mouseX,
      mouseY,
      state,
      scale: bodyScale,
      blink: anim.blinkAmount,
      yawn: anim.yawnAmount,
    });

    return;
  }

  // =========================================================
  // PNG MONSTER PATH
  // =========================================================
  if (!monster.imageSrc || !monster.faceAnchor || !monster.drawFace) {
    ctx.save();
    ctx.fillStyle = "rgba(255,255,255,0.08)";
    ctx.fillRect(x - 110, y - 220, 220, 220);
    ctx.strokeStyle = "rgba(255,255,255,0.25)";
    ctx.lineWidth = 2;
    ctx.strokeRect(x - 110, y - 220, 220, 220);

    ctx.fillStyle = "rgba(255,255,255,0.75)";
    ctx.font = "16px Arial";
    ctx.textAlign = "center";
    ctx.textBaseline = "middle";
    ctx.fillText("Monster data incomplete", x, y - 110);
    ctx.restore();
    return;
  }

  requestMonsterImage(monster.imageSrc);
  const image = loadedImages[monster.imageSrc];

  if (!image) {
    ctx.save();
    ctx.fillStyle = "rgba(255,255,255,0.08)";
    ctx.fillRect(x - 110, y - 220, 220, 220);
    ctx.strokeStyle = "rgba(255,255,255,0.25)";
    ctx.lineWidth = 2;
    ctx.strokeRect(x - 110, y - 220, 220, 220);

    ctx.fillStyle = "rgba(255,255,255,0.75)";
    ctx.font = "16px Arial";
    ctx.textAlign = "center";
    ctx.textBaseline = "middle";
    ctx.fillText("Loading monster...", x, y - 110);
    ctx.restore();
    return;
  }

  const scale = monster.baseHeight / image.height;
  const drawW = image.width * scale;
  const drawH = image.height * scale;

  const rootAnchorX = monster.rootAnchor?.x ?? 0.5;
  const rootAnchorY = monster.rootAnchor?.y ?? 1.0;

  const idleY =
    state === "HOME" ? Math.sin(time * 1.4) * 4 : Math.sin(time * 2.2) * 2;
  const idleX = state === "HOME" ? Math.sin(time * 0.8) * 1.5 : 0;
  const breathe =
    state === "HOME"
      ? Math.sin(time * 1.7) * 0.015
      : Math.sin(time * 3) * 0.008;

  const rootX = x + idleX + stateOffsetX;
  const rootY = y + idleY + stateOffsetY;

  const imageX = -drawW * rootAnchorX;
  const imageY = -drawH * rootAnchorY;

  const localFaceX = imageX + drawW * monster.faceAnchor.x;
  const localFaceY = imageY + drawH * monster.faceAnchor.y;

  ctx.save();
  ctx.translate(rootX, rootY);
  ctx.scale(1, 1 + breathe);

  ctx.drawImage(image, imageX, imageY, drawW, drawH);

  const faceArgs: FaceDrawArgs = {
    ctx,
    faceX: localFaceX,
    faceY: localFaceY,
    drawW,
    drawH,
    time,
    mouseX: mouseX - rootX,
    mouseY: mouseY - rootY,
    blink: anim.blinkAmount,
    yawn: anim.yawnAmount,
  };

  monster.drawFace(state, faceArgs);

  ctx.restore();
}