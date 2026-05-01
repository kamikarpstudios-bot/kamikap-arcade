import { StateManager } from "../systems/StateManager";
import { monsterRegistry } from "../Monsters/monsterRegistry";
import { drawMonster } from "../Monsters/drawMonster";
import {
  createSummonAnimation,
  SummonAnimationInstance,
} from "../Animations/summoning";
import { rollSummonReward } from "../systems/summonRolls";

type UiButton = {
  x: number;
  y: number;
  width: number;
  height: number;
  label: string;
  hovered: boolean;
};

type Rarity = "COMMON" | "UNCOMMON" | "RARE" | "UNIQUE" | "LEGENDARY";

type Capsule = {
  monsterId: keyof typeof monsterRegistry;
  rarity: Rarity;
  element: string;
  evolutionStage: number;
  seed: number;
};

type AnimationPhase =
  | "IDLE"
  | "SPINNING"
  | "ZOOM"
  | "POP"
  | "SUMMON"
  | "COLLECT"
  | "RETURNING";


const REEL_SPACING = 140;
const REEL_CENTER_OFFSET = 18;

export class KonjureScreen {
  manager: StateManager;

  mouseX = 0;
  mouseY = 0;
  time = 0;

  shards = 124;

  private shakeAmount = 0;
  private lastReelOffset = 0;

  phase: AnimationPhase = "IDLE";
  phaseTimer = 0;

  capsules: Capsule[] = [];
  winningIndex = 0;

  reelOffset = 0;
  reelSpeed = 0;

  activeSummonAnimation: SummonAnimationInstance | null = null;

  draw1Button: UiButton = {
    x: 0,
    y: 0,
    width: 180,
    height: 50,
    label: "DRAW 1",
    hovered: false,
  };

  collectButton: UiButton = {
    x: 0,
    y: 0,
    width: 190,
    height: 50,
    label: "COLLECT KIN",
    hovered: false,
  };

  constructor(manager: StateManager) {
    this.manager = manager;

    window.addEventListener("mousemove", this.handleMouseMove);
    window.addEventListener("click", this.handleClick);
  }

  destroy() {
    window.removeEventListener("mousemove", this.handleMouseMove);
    window.removeEventListener("click", this.handleClick);
  }

private getMachineRootY(h: number) {
  return h * 0.72 + 64;
}

  handleMouseMove = (event: MouseEvent) => {
    const canvas = document.querySelector("canvas");
    if (!canvas) return;

    const rect = canvas.getBoundingClientRect();
    const scaleX = canvas.width / rect.width;
    const scaleY = canvas.height / rect.height;

    this.mouseX = (event.clientX - rect.left) * scaleX;
    this.mouseY = (event.clientY - rect.top) * scaleY;

    this.draw1Button.hovered =
      this.mouseX >= this.draw1Button.x &&
      this.mouseX <= this.draw1Button.x + this.draw1Button.width &&
      this.mouseY >= this.draw1Button.y &&
      this.mouseY <= this.draw1Button.y + this.draw1Button.height;

    this.collectButton.hovered =
      this.mouseX >= this.collectButton.x &&
      this.mouseX <= this.collectButton.x + this.collectButton.width &&
      this.mouseY >= this.collectButton.y &&
      this.mouseY <= this.collectButton.y + this.collectButton.height;
  };

  handleClick = () => {
    if (this.phase === "IDLE" && this.draw1Button.hovered) {
      this.startDrawOneAnimation();
      return;
    }

    if (this.phase === "COLLECT" && this.collectButton.hovered) {
      this.startSummonBeam();
      this.phase = "RETURNING";
      this.phaseTimer = 0;
      return;
    }
  };

  private drawRevealedMonster(
    ctx: CanvasRenderingContext2D,
    x: number,
    y: number
  ) {
   const winner = this.capsules[this.winningIndex];

const monster =
  monsterRegistry[winner.monsterId] ??
  Object.values(monsterRegistry)[0];

drawMonster(monster, {
  ctx,
  x,
  y,
  time: this.time,
  mouseX: this.mouseX,
  mouseY: this.mouseY,
  state: "HOME",
  targetHeight: 150,
});
  }

  private startDrawOneAnimation() {
  this.phase = "SPINNING";
  this.phaseTimer = 0;
  this.reelOffset = 0;
  this.reelSpeed = 42;

  this.winningIndex = 20;

  const winningReward = rollSummonReward();

  this.capsules = Array.from({ length: 28 }, (_, i) => {
    const reward = i === this.winningIndex ? winningReward : rollSummonReward();

    return {
      monsterId: reward.monsterId,
      rarity: reward.rarity,
      element: reward.element,
      evolutionStage: reward.evolutionStage,
      seed: Math.random() * 999,
    };
  });


   this.winningIndex = 20; // make random later
  }


  update() {
    // Add this inside update() to decay the shake over time
this.shakeAmount *= 0.9; 

if (this.phase === "POP" && this.phaseTimer > 0.4 && this.phaseTimer < 0.45) {
  this.shakeAmount = 10; // Trigger a heavy shake right as the capsule "slams"
}
    this.time += 0.016;
    this.phaseTimer += 0.016;

    if (this.phase === "SPINNING") {
      const stopTime = 2.4;
      const t = Math.min(1, this.phaseTimer / stopTime);
      const easeOut = 1 - Math.pow(1 - t, 4);

   const targetOffset = this.winningIndex * REEL_SPACING + REEL_CENTER_OFFSET;
      this.reelOffset = targetOffset * easeOut;

      if (t >= 1) {
        this.phase = "ZOOM";
        this.phaseTimer = 0;
      }
    }

    if (this.phase === "ZOOM" && this.phaseTimer > 0.7) {
      this.phase = "POP";
      this.phaseTimer = 0;
    }

    if (this.phase === "POP" && this.phaseTimer > 0.7) {
      this.startSummonBeam();
      this.phase = "SUMMON";
      this.phaseTimer = 0;
    }

    if (this.phase === "SUMMON") {
      this.activeSummonAnimation?.update(0.016);

      if (this.activeSummonAnimation?.isDone()) {
        this.phase = "COLLECT";
        this.phaseTimer = 0;
      }
    }
if (this.phase === "RETURNING") {
  this.activeSummonAnimation?.update(0.016);

  if (this.phaseTimer > 0.75) {
    this.phase = "IDLE";
    this.phaseTimer = 0;
    this.activeSummonAnimation = null;
  }
}
  }

  draw(ctx: CanvasRenderingContext2D) {
    const w = ctx.canvas.width;
    const h = ctx.canvas.height;

    this.drawBackground(ctx, w, h);

// TITLE (heavier, more “carved / sign” feel)
this.drawCenteredText(ctx, "KONJURE", w / 2, 52, 30, "#fff2cc");

// subtle underline / plate
this.drawPixelRect(ctx, w / 2 - 90, 66, 180, 3, "#8f653a", 0.7);
this.drawPixelRect(ctx, w / 2 - 60, 70, 120, 2, "#c89b5e", 0.5);

// SHARDS (secondary info, sits tighter)
this.drawCenteredText(
  ctx,
  `SHARDS: ${this.shards}`,
  w / 2,
  98,
  16,
  "#d7c9ff"
);

    if (this.phase === "IDLE") {
      this.drawIdleCapsule(ctx, w / 2, h / 2 - 40);
    } else {
      this.drawAnimation(ctx, w, h);
    }

    this.draw1Button.x = w / 2 - this.draw1Button.width / 2;
    this.draw1Button.y = h - 110;

    if (this.phase === "IDLE") {
      this.drawButton(ctx, this.draw1Button);
    }

    this.drawRatesPanel(ctx, w - 265, 130);
  }

private startSummonBeam() {
  const canvas = document.querySelector("canvas");
  if (!canvas) return;

const winner = this.capsules[this.winningIndex];

const monster =
  monsterRegistry[winner.monsterId] ??
  Object.values(monsterRegistry)[0];

  const monsterCanvas = document.createElement("canvas");
  monsterCanvas.width = 360;
  monsterCanvas.height = 360;

  const mctx = monsterCanvas.getContext("2d");
  if (!mctx) return;

  mctx.clearRect(0, 0, monsterCanvas.width, monsterCanvas.height);

  const targetHeight = 165;

  drawMonster(monster, {
    ctx: mctx,
    x: monsterCanvas.width / 2,
    y: monsterCanvas.height - 46,
    time: this.time,
    mouseX: this.mouseX,
    mouseY: this.mouseY,
    state: "HOME",
    targetHeight,
  });

  const rootX = canvas.width / 2;
  const rootY = this.getMachineRootY(canvas.height) - 18;

  this.activeSummonAnimation = createSummonAnimation({
    rootX,
    rootY,
    circleOffsetY: -6,
    monsterImage: monsterCanvas,
    monsterWidth: monsterCanvas.width,
    monsterHeight: monsterCanvas.height,
    monsterLoaded: () => true,
    targetHeight,
  });
}

 private drawAnimation(ctx: CanvasRenderingContext2D, w: number, h: number) {
  const cx = w / 2;
  const cy = h / 2 - 30;
  const winner = this.capsules[this.winningIndex];
  const rarityColor = this.getRarityColor(winner.rarity);

  const s = this.shakeAmount || 0;
  const sx = (Math.random() - 0.5) * s;
  const sy = (Math.random() - 0.5) * s;

  ctx.save();
  ctx.translate(sx, sy);

  // =========================
  // SPINNING
  // =========================
  if (this.phase === "SPINNING") {
    this.drawReel(ctx, cx, cy);

    const pulse = 0.45 + (Math.sin(this.time * 5) + 1) * 0.18;

    // Fantasy selector glow
    this.drawPixelRect(ctx, cx - 74, cy - 94, 148, 198, "#000000", 0.25);
    this.drawPixelRect(ctx, cx - 68, cy - 88, 136, 186, "#ffd84a", 0.1 + pulse * 0.08);

    // Chunky golden brackets
    this.drawPixelRect(ctx, cx - 82, cy - 102, 44, 7, "#f3c15a", 0.95);
    this.drawPixelRect(ctx, cx - 82, cy - 102, 7, 44, "#f3c15a", 0.95);
    this.drawPixelRect(ctx, cx + 38, cy - 102, 44, 7, "#f3c15a", 0.95);
    this.drawPixelRect(ctx, cx + 75, cy - 102, 7, 44, "#f3c15a", 0.95);

    this.drawPixelRect(ctx, cx - 82, cy + 108, 44, 7, "#f3c15a", 0.95);
    this.drawPixelRect(ctx, cx - 82, cy + 71, 7, 44, "#f3c15a", 0.95);
    this.drawPixelRect(ctx, cx + 38, cy + 108, 44, 7, "#f3c15a", 0.95);
    this.drawPixelRect(ctx, cx + 75, cy + 71, 7, 44, "#f3c15a", 0.95);

    // Center rune ticks
    this.drawPixelRect(ctx, cx - 10, cy - 122, 20, 6, "#fff4b8", pulse);
    this.drawPixelRect(ctx, cx - 5, cy - 116, 10, 10, "#fff4b8", pulse);
    this.drawPixelRect(ctx, cx - 5, cy + 128, 10, 10, "#fff4b8", pulse);
    this.drawPixelRect(ctx, cx - 10, cy + 138, 20, 6, "#fff4b8", pulse);

    ctx.restore();
    return;
  }

  // =========================
  // ZOOM / CHARGE
  // =========================
  if (this.phase === "ZOOM") {
    const t = Math.min(1, this.phaseTimer / 0.7);
    const scale = 1 + t * 0.45;
    const pulse = Math.sin(this.time * 12) * 4;

    this.drawEnergyCircle(ctx, cx, cy + 95, winner.rarity);
    this.drawSummoningParticles(ctx, cx, cy + 20, 1 - t);

    // Inward pixel streaks
    for (let i = 0; i < 12; i++) {
      const a = (i / 12) * Math.PI * 2 + this.time * 2;
      const dist = 210 * (1 - t) + 35;
      const px = cx + Math.cos(a) * dist;
      const py = cy + Math.sin(a) * dist * 0.65;
      this.drawPixelRect(ctx, px, py, 18, 4, i % 3 === 0 ? "#ffffff" : rarityColor, 0.45);
    }

    this.drawCapsule(ctx, cx + pulse * (1 - t), cy, winner.rarity, scale, false);

    ctx.restore();
    return;
  }

  // =========================
  // POP / SLAM
  // =========================
  if (this.phase === "POP") {
    const t = Math.min(1, this.phaseTimer / 0.7);
    const slamT = Math.min(1, t / 0.55);

    const scale = 1.55;
    const machineY = h * 0.72 + 58;
    const capsuleY = cy + slamT * (machineY - cy);

    const capPopY = -t * 120;
    const capPopX = Math.sin(t * Math.PI) * 40;

    if (slamT > 0.95 && slamT < 1.0) this.shakeAmount = 15;

    this.drawEnergyCircle(ctx, cx, machineY, winner.rarity);
    this.drawCapsule(ctx, cx, capsuleY, winner.rarity, scale, true, capPopX, capPopY);

    if (slamT >= 1) {
      const shockT = (t - 0.55) / 0.45;
      this.drawImpactRing(ctx, cx, machineY, shockT);
    }

    ctx.restore();
    return;
  }

  // =========================
  // SUMMON
  // =========================
  if (this.phase === "SUMMON") {
    const rootY = this.getMachineRootY(h) - 160;

    this.drawEnergyCircle(ctx, cx, rootY + 140, winner.rarity);
    this.activeSummonAnimation?.drawUnderMonster(ctx);

    if (this.activeSummonAnimation?.shouldShowNewMonster()) {
      const flicker = Math.random() > 0.1 ? 1 : 0.55;

      ctx.save();
      ctx.globalAlpha = flicker;
      this.drawRevealedMonster(ctx, cx, rootY);
      ctx.restore();

      this.drawSummoningParticles(ctx, cx, rootY + 80, 0.35);
    }

    this.activeSummonAnimation?.drawOverMonster(ctx);
    ctx.restore();
    return;
  }

  // =========================
  // COLLECT / RETURN
  // =========================
  if (this.phase === "COLLECT" || this.phase === "RETURNING") {
    const rootY = this.getMachineRootY(h) - 160;

    this.drawEnergyCircle(ctx, cx, rootY + 140, winner.rarity);

    if (this.phase === "COLLECT") {
      this.drawRevealedMonster(ctx, cx, rootY);

      this.collectButton.x = cx - this.collectButton.width / 2;
      this.collectButton.y = rootY + 160;
      this.drawButton(ctx, this.collectButton);

      this.drawPixelRect(ctx, cx - 150, rootY - 28, 300, 42, "#120b08", 0.78);
      this.drawPixelRect(ctx, cx - 142, rootY - 22, 284, 30, rarityColor, 0.18);
     this.drawCenteredText(
  ctx,
  winner.monsterId,
  cx,
  rootY + 2,
  26,
  rarityColor
);
    } else {
      const t = Math.min(1, this.phaseTimer / 0.75);

      this.drawSummoningParticles(ctx, cx, rootY + 80, t);

      ctx.save();
      ctx.globalAlpha = 1 - t;
      ctx.translate(cx, rootY - t * 50);
      ctx.scale(1 - t, 1 + t * 0.5);
      this.drawRevealedMonster(ctx, 0, 0);
      ctx.restore();
    }
  }

  ctx.restore();
}

// --- NEW SUMMONER VISUAL HELPERS ---

private drawSummoningParticles(
  ctx: CanvasRenderingContext2D,
  cx: number,
  cy: number,
  t: number
) {
  const p = Math.max(0, Math.min(1, t));
  const spin = this.time * (2 + p * 6);

  ctx.save();

  for (let i = 0; i < 12; i++) {
    const angle = (i / 12) * Math.PI * 2 + spin;

    // Spiral inward motion instead of perfect circle
    const radius = (110 * p + 20) * (1 - i * 0.04);

    const px = cx + Math.cos(angle) * radius;
    const py = cy + Math.sin(angle) * radius * 0.7;

    const alpha = (0.4 + (1 - p) * 0.4) * (1 - i * 0.05);

    // Alternate colors for energy feel
    const color =
      i % 4 === 0
        ? "#ffffff"
        : i % 3 === 0
        ? "#fff4b8"
        : this.getRarityColor("RARE");

    // Size variation = more chaotic energy
    const size = i % 3 === 0 ? 6 : 4;

    this.drawPixelRect(ctx, px, py, size, size, color, alpha);

    // Trailing streak (gives motion blur feel but still pixel)
    if (i % 2 === 0) {
      this.drawPixelRect(ctx, px - 6, py, size, 2, color, alpha * 0.5);
    }
  }

  // Center burst as summon completes
  if (p > 0.7) {
    const burstAlpha = (p - 0.7) * 3;

    this.drawPixelRect(ctx, cx - 10, cy - 2, 20, 4, "#ffffff", burstAlpha);
    this.drawPixelRect(ctx, cx - 2, cy - 10, 4, 20, "#ffffff", burstAlpha);
    this.drawPixelRect(ctx, cx - 6, cy - 6, 12, 12, "#fff4b8", burstAlpha * 0.6);
  }

  ctx.restore();
}

private drawImpactRing(ctx: CanvasRenderingContext2D, x: number, y: number, t: number) {
  const p = Math.max(0, Math.min(1, t));
  const alpha = 1 - p;

  const w = 28 + p * 190;
  const h = 8 + p * 54;
  const pulse = Math.sin(this.time * 18) * 3;

  ctx.save();

  // Main expanding ring
  ctx.globalAlpha = alpha * 0.85;
  ctx.strokeStyle = "#ffffff";
  ctx.lineWidth = 3;
  ctx.beginPath();
  ctx.ellipse(x, y, w + pulse, h, 0, 0, Math.PI * 2);
  ctx.stroke();

  // Rarity/magic echo ring
  ctx.globalAlpha = alpha * 0.45;
  ctx.strokeStyle = "#d7c9ff";
  ctx.lineWidth = 5;
  ctx.beginPath();
  ctx.ellipse(x, y, w * 0.75, h * 0.75, 0, 0, Math.PI * 2);
  ctx.stroke();

  // Chunky 8-bit shock marks
  ctx.globalAlpha = alpha;
  this.drawPixelRect(ctx, x - w, y - 3, 18, 5, "#ffffff", alpha);
  this.drawPixelRect(ctx, x + w - 18, y - 3, 18, 5, "#ffffff", alpha);
  this.drawPixelRect(ctx, x - 5, y - h, 10, 4, "#ffffff", alpha * 0.75);
  this.drawPixelRect(ctx, x - 5, y + h - 4, 10, 4, "#ffffff", alpha * 0.75);

  // Small debris/sparks
  for (let i = 0; i < 10; i++) {
    const side = i % 2 === 0 ? -1 : 1;
    const px = x + side * (20 + p * (28 + i * 7));
    const py = y + Math.sin(i * 1.7) * (6 + p * 22);
    const sz = i % 3 === 0 ? 5 : 3;

    this.drawPixelRect(ctx, px, py, sz, sz, "#fff4b8", alpha * 0.75);
  }

  ctx.restore();
}

private drawEnergyCircle(ctx: CanvasRenderingContext2D, x: number, y: number, rarity: Rarity) {
  const color = this.getRarityColor(rarity);
  const pulse = Math.sin(this.time * 5);
  const slow = Math.sin(this.time * 1.8);

  ctx.save();

  // Vertical summon beam
  const gradient = ctx.createLinearGradient(x, y + 18, x, y - 230);
  gradient.addColorStop(0, color);
  gradient.addColorStop(0.45, color);
  gradient.addColorStop(1, "transparent");

  ctx.fillStyle = gradient;
  ctx.globalAlpha = 0.16 + (pulse + 1) * 0.035;
  ctx.fillRect(x - 54, y - 230, 108, 248);

  // Pixel beam chunks
  ctx.globalAlpha = 0.22;
  this.drawPixelRect(ctx, x - 42, y - 185, 8, 46, "#ffffff");
  this.drawPixelRect(ctx, x + 34, y - 152, 6, 58, "#ffffff");
  this.drawPixelRect(ctx, x - 16, y - 218, 5, 72, color);
  this.drawPixelRect(ctx, x + 12, y - 202, 5, 88, color);

  // Floor glow
  const glowW = 120 + slow * 14;
  const glowGrad = ctx.createRadialGradient(x, y, 0, x, y, glowW);
  glowGrad.addColorStop(0, color);
  glowGrad.addColorStop(1, "transparent");

  ctx.fillStyle = glowGrad;
  ctx.globalAlpha = 0.18;
  ctx.beginPath();
  ctx.ellipse(x, y, glowW, glowW * 0.32, 0, 0, Math.PI * 2);
  ctx.fill();

  // Main pixel rune ring
  const ringW = 86 + pulse * 5;
  const ringH = 24 + pulse * 2;

  ctx.globalAlpha = 0.75;
  ctx.strokeStyle = color;
  ctx.lineWidth = 3;
  ctx.beginPath();
  ctx.ellipse(x, y, ringW, ringH, 0, 0, Math.PI * 2);
  ctx.stroke();

  ctx.globalAlpha = 0.32;
  ctx.lineWidth = 6;
  ctx.beginPath();
  ctx.ellipse(x, y, ringW + 14, ringH + 5, 0, 0, Math.PI * 2);
  ctx.stroke();

  // Chunky rune marks around the ellipse
  const a = 0.5 + (pulse + 1) * 0.18;
  this.drawPixelRect(ctx, x - 92, y - 4, 18, 6, color, a);
  this.drawPixelRect(ctx, x + 74, y - 4, 18, 6, color, a);
  this.drawPixelRect(ctx, x - 8, y - 31, 16, 5, color, a);
  this.drawPixelRect(ctx, x - 8, y + 25, 16, 5, color, a);

  this.drawPixelRect(ctx, x - 54, y - 22, 12, 4, "#fff4b8", a);
  this.drawPixelRect(ctx, x + 42, y - 22, 12, 4, "#fff4b8", a);
  this.drawPixelRect(ctx, x - 54, y + 18, 12, 4, "#fff4b8", a);
  this.drawPixelRect(ctx, x + 42, y + 18, 12, 4, "#fff4b8", a);

  // Rising magic pixels
  for (let i = 0; i < 12; i++) {
    const t = (this.time * 0.42 + i * 0.083) % 1;
    const px = x + Math.sin(i * 17.7 + this.time * 1.3) * (30 + i * 4);
    const py = y + 8 - t * 190;
    const alpha = (1 - t) * 0.5;

    this.drawPixelRect(
      ctx,
      px,
      py,
      i % 3 === 0 ? 5 : 3,
      i % 3 === 0 ? 5 : 3,
      i % 4 === 0 ? "#ffffff" : color,
      alpha
    );
  }

  ctx.restore();
}

private drawReel(ctx: CanvasRenderingContext2D, cx: number, cy: number) {
const spacing = REEL_SPACING;

const baseX = cx - this.reelOffset + REEL_CENTER_OFFSET;

  const speed = Math.abs(this.reelOffset - this.lastReelOffset);
  const isSlowingDown = speed < 2 && speed > 0.1;

  // =========================
  // 8-BIT WOOD + RUNE TRACK
  // =========================
  const railY = cy + 92;
  const railH = 34;

  this.drawPixelRect(ctx, 0, railY - 8, ctx.canvas.width, railH + 16, "#120b08", 0.85);
  this.drawPixelRect(ctx, 0, railY, ctx.canvas.width, railH, "#4b2b18");
  this.drawPixelRect(ctx, 0, railY, ctx.canvas.width, 6, "#9a6234", 0.75);
  this.drawPixelRect(ctx, 0, railY + railH - 7, ctx.canvas.width, 7, "#1e1009", 0.55);

  // Wood grain strips
  for (let gx = -80; gx < ctx.canvas.width + 80; gx += 95) {
    const wobble = Math.sin(this.time * 0.8 + gx * 0.03) * 3;
    this.drawPixelRect(ctx, gx + wobble, railY + 12, 54, 3, "#24120a", 0.45);
    this.drawPixelRect(ctx, gx + 28 + wobble, railY + 22, 42, 3, "#c17a3d", 0.22);
  }

  // Metal/rune center selector frame
  this.drawPixelRect(ctx, cx - 78, cy - 92, 156, 202, "#08050c", 0.5);
  this.drawPixelRect(ctx, cx - 72, cy - 86, 144, 190, "#2d1c14", 0.75);
  this.drawPixelRect(ctx, cx - 66, cy - 80, 132, 178, "#7a4a25", 0.25);

  // Corner brackets
  const bracket = "#f3c15a";
  this.drawPixelRect(ctx, cx - 82, cy - 96, 38, 6, bracket);
  this.drawPixelRect(ctx, cx - 82, cy - 96, 6, 38, bracket);
  this.drawPixelRect(ctx, cx + 44, cy - 96, 38, 6, bracket);
  this.drawPixelRect(ctx, cx + 76, cy - 96, 6, 38, bracket);
  this.drawPixelRect(ctx, cx - 82, cy + 104, 38, 6, bracket);
  this.drawPixelRect(ctx, cx - 82, cy + 72, 6, 38, bracket);
  this.drawPixelRect(ctx, cx + 44, cy + 104, 38, 6, bracket);
  this.drawPixelRect(ctx, cx + 76, cy + 72, 6, 38, bracket);

  // Selector top/bottom arrows
  const arrowPulse = 0.55 + (Math.sin(this.time * 5) + 1) * 0.2;
  this.drawPixelRect(ctx, cx - 12, cy - 116, 24, 8, "#100a08");
  this.drawPixelRect(ctx, cx - 8, cy - 108, 16, 8, bracket, arrowPulse);
  this.drawPixelRect(ctx, cx - 4, cy - 100, 8, 8, bracket, arrowPulse);

  this.drawPixelRect(ctx, cx - 4, cy + 122, 8, 8, bracket, arrowPulse);
  this.drawPixelRect(ctx, cx - 8, cy + 130, 16, 8, bracket, arrowPulse);
  this.drawPixelRect(ctx, cx - 12, cy + 138, 24, 8, "#100a08");

  for (let i = 0; i < this.capsules.length; i++) {
    const x = baseX + i * spacing;

    if (x < -160 || x > ctx.canvas.width + 160) continue;

    const distFromCenter = Math.abs(cx - x);
    const focus = Math.max(0, 1 - distFromCenter / (spacing * 1.5));
    const scale = 0.68 + focus * 0.48;
    const alpha = 0.3 + focus * 0.7;

    const jitter = speed > 1 ? (Math.random() - 0.5) * Math.min(5, speed * 0.45) : 0;
    const clunkBob = isSlowingDown ? Math.sin(this.phaseTimer * 20) * 2 : 0;

    ctx.save();
    ctx.globalAlpha = alpha;

    // Little pedestal plate under each capsule
    const plateW = 100 * scale;
    const plateY = cy + 74 * scale;
    this.drawPixelRect(ctx, x - plateW / 2, plateY, plateW, 12 * scale, "#120b08", 0.75);
    this.drawPixelRect(ctx, x - plateW / 2 + 6 * scale, plateY + 2 * scale, plateW - 12 * scale, 5 * scale, "#8a552b", 0.5);

    // Focus aura for centered capsule
    if (focus > 0.45) {
      this.drawMonsterAtmosphere(ctx, x, cy, this.capsules[i].rarity, focus);
    }

    // Speed streaks while spinning
    if (speed > 4 && focus < 0.85) {
      const streakAlpha = Math.min(0.45, speed * 0.035);
      this.drawPixelRect(ctx, x - 58 * scale, cy - 48 * scale, 38 * scale, 4 * scale, "#ffffff", streakAlpha);
      this.drawPixelRect(ctx, x + 18 * scale, cy + 8 * scale, 46 * scale, 4 * scale, "#ffffff", streakAlpha * 0.7);
    }

    // Capsule
    this.drawCapsule(
      ctx,
      x,
      cy + jitter + clunkBob,
      this.capsules[i].rarity,
      scale * 0.85,
      false
    );

    ctx.restore();
  }

  // Front pixel vignette so edges feel darker
  ctx.save();
  ctx.globalAlpha = 0.28;
  const leftGrad = ctx.createLinearGradient(0, 0, 180, 0);
  leftGrad.addColorStop(0, "#000000");
  leftGrad.addColorStop(1, "transparent");
  ctx.fillStyle = leftGrad;
  ctx.fillRect(0, cy - 150, 180, 310);

  const rightGrad = ctx.createLinearGradient(ctx.canvas.width, 0, ctx.canvas.width - 180, 0);
  rightGrad.addColorStop(0, "#000000");
  rightGrad.addColorStop(1, "transparent");
  ctx.fillStyle = rightGrad;
  ctx.fillRect(ctx.canvas.width - 180, cy - 150, 180, 310);
  ctx.restore();

  this.lastReelOffset = this.reelOffset;
}

/** * HELPER: Adds a "manifestation" glow for higher rarity capsules
 */
private drawMonsterAtmosphere(
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  rarity: Rarity,
  focus: number
) {
  const color = this.getRarityColor(rarity);
  const f = Math.max(0, Math.min(1, focus));
  const pulse = Math.sin(this.time * 5.5);
  const slowPulse = Math.sin(this.time * 1.7);

  ctx.save();

  // Floor magic glow
  const floorSize = (95 + slowPulse * 18) * f;
  const floorGrad = ctx.createRadialGradient(x, y + 52, 0, x, y + 52, floorSize);
  floorGrad.addColorStop(0, color);
  floorGrad.addColorStop(0.45, color);
  floorGrad.addColorStop(1, "transparent");

  ctx.fillStyle = floorGrad;
  ctx.globalAlpha = 0.18 * f;
  ctx.beginPath();
  ctx.ellipse(x, y + 52, floorSize, floorSize * 0.34, 0, 0, Math.PI * 2);
  ctx.fill();

  // Aura behind monster
  const auraSize = (75 + pulse * 7) * f;
  const auraGrad = ctx.createRadialGradient(x, y - 25, 0, x, y - 25, auraSize);
  auraGrad.addColorStop(0, "#ffffff");
  auraGrad.addColorStop(0.18, color);
  auraGrad.addColorStop(1, "transparent");

  ctx.fillStyle = auraGrad;
  ctx.globalAlpha = 0.13 * f;
  ctx.beginPath();
  ctx.arc(x, y - 25, auraSize, 0, Math.PI * 2);
  ctx.fill();

  // Pixel rune ring
  const ringY = y + 55;
  const ringW = 96 * f;
  const ringH = 28 * f;

  ctx.globalAlpha = 0.35 * f;
  ctx.strokeStyle = color;
  ctx.lineWidth = Math.max(1, 3 * f);
  ctx.beginPath();
  ctx.ellipse(x, ringY, ringW, ringH, 0, 0, Math.PI * 2);
  ctx.stroke();

  // Chunky pixel rune marks
  const runeAlpha = 0.35 + (pulse + 1) * 0.2;
  ctx.globalAlpha = runeAlpha * f;
  this.drawPixelRect(ctx, x - 52 * f, ringY - 4 * f, 10 * f, 4 * f, color);
  this.drawPixelRect(ctx, x + 42 * f, ringY - 4 * f, 10 * f, 4 * f, color);
  this.drawPixelRect(ctx, x - 4 * f, ringY - 18 * f, 8 * f, 4 * f, color);
  this.drawPixelRect(ctx, x - 4 * f, ringY + 14 * f, 8 * f, 4 * f, color);

  // Rising mana pixels
  for (let i = 0; i < 10; i++) {
    const t = (this.time * 0.32 + i * 0.137) % 1;
    const px = x + Math.sin(i * 22.7 + this.time * 1.1) * (48 + i * 3) * f;
    const py = y + 50 - t * 125 * f;
    const a = (1 - t) * 0.55 * f;

    this.drawPixelRect(ctx, px, py, 3 * f, 3 * f, i % 3 === 0 ? "#ffffff" : color, a);
  }

  ctx.restore();
}

private drawIdleCapsule(ctx: CanvasRenderingContext2D, cx: number, cy: number) {
  const breath = Math.sin(this.time * 1.5);
  const panic = Math.sin(this.time * 9);
  const rattle = Math.max(0, Math.sin(this.time * 13.5)) * 1.8;

  const bob = breath * 7;
  const pulseScale = 1.15 + breath * 0.025;
  const rarityColor = this.getRarityColor("RARE");

  const shakeX = (Math.random() - 0.5) * rattle;
  const shakeY = (Math.random() - 0.5) * rattle;

  // Under-glow
  const glowSize = 105 + breath * 20;
  ctx.save();
  const grad = ctx.createRadialGradient(cx, cy + 80, 0, cx, cy + 80, glowSize);
  grad.addColorStop(0, rarityColor);
  grad.addColorStop(1, "transparent");
  ctx.fillStyle = grad;
  ctx.globalAlpha = 0.16 + (breath + 1) * 0.045;
  ctx.beginPath();
  ctx.arc(cx, cy + 80, glowSize, 0, Math.PI * 2);
  ctx.fill();
  ctx.restore();

  // Particles
  for (let i = 0; i < 7; i++) {
    const pTime = (this.time * 0.45 + i * 0.17) % 1;
    const px = cx + Math.sin(i * 91 + this.time * 1.4) * 72;
    const py = cy + 100 - pTime * 155;
    this.drawPixelRect(ctx, px, py, 3, 3, rarityColor, (1 - pTime) * 0.45);
  }

  ctx.save();
  ctx.translate(shakeX, shakeY);

  // Capsule body
  this.drawCapsule(ctx, cx, cy + bob, "RARE", pulseScale, false);

  const s = pulseScale;
  const glassCx = cx;
  const glassCy = cy + bob;

  // =========================
  // TRAPPED MONSTER SILHOUETTE
  // =========================

  const knock = Math.max(0, Math.sin(this.time * 7.5));
  const monsterX = glassCx + Math.sin(this.time * 2.2) * 7 * s;
  const monsterY = glassCy + Math.sin(this.time * 3.1) * 5 * s;

  // Dark body shadow behind glass
  this.drawPixelRect(ctx, monsterX - 16 * s, monsterY - 3 * s, 32 * s, 25 * s, "#050308", 0.42);
  this.drawPixelRect(ctx, monsterX - 22 * s, monsterY + 8 * s, 44 * s, 18 * s, "#050308", 0.32);

  // Ears / horns silhouette
  this.drawPixelRect(ctx, monsterX - 22 * s, monsterY - 15 * s, 8 * s, 18 * s, "#050308", 0.38);
  this.drawPixelRect(ctx, monsterX + 14 * s, monsterY - 15 * s, 8 * s, 18 * s, "#050308", 0.38);

  // Eye flashes
  const eyeAlpha = panic > 0.35 ? 0.9 : 0.25;
  this.drawPixelRect(ctx, monsterX - 10 * s, monsterY + 5 * s, 6 * s, 5 * s, "#ffffff", eyeAlpha);
  this.drawPixelRect(ctx, monsterX + 4 * s, monsterY + 5 * s, 6 * s, 5 * s, "#ffffff", eyeAlpha);
  this.drawPixelRect(ctx, monsterX - 8 * s, monsterY + 6 * s, 3 * s, 3 * s, rarityColor, eyeAlpha);
  this.drawPixelRect(ctx, monsterX + 6 * s, monsterY + 6 * s, 3 * s, 3 * s, rarityColor, eyeAlpha);

  // Little paws/claws hitting glass
  const pawAlpha = 0.25 + knock * 0.55;
  this.drawPixelRect(ctx, glassCx - 28 * s, glassCy + 11 * s, 10 * s, 7 * s, "#ffffff", pawAlpha);
  this.drawPixelRect(ctx, glassCx + 18 * s, glassCy + 9 * s, 10 * s, 7 * s, "#ffffff", pawAlpha);

  this.drawPixelRect(ctx, glassCx - 27 * s, glassCy + 19 * s, 2 * s, 7 * s, "#ffffff", pawAlpha);
  this.drawPixelRect(ctx, glassCx - 23 * s, glassCy + 19 * s, 2 * s, 7 * s, "#ffffff", pawAlpha);
  this.drawPixelRect(ctx, glassCx - 19 * s, glassCy + 19 * s, 2 * s, 7 * s, "#ffffff", pawAlpha);

  this.drawPixelRect(ctx, glassCx + 19 * s, glassCy + 17 * s, 2 * s, 7 * s, "#ffffff", pawAlpha);
  this.drawPixelRect(ctx, glassCx + 23 * s, glassCy + 17 * s, 2 * s, 7 * s, "#ffffff", pawAlpha);
  this.drawPixelRect(ctx, glassCx + 27 * s, glassCy + 17 * s, 2 * s, 7 * s, "#ffffff", pawAlpha);

  // Impact crack/spark flashes on glass
  if (knock > 0.82) {
    this.drawPixelRect(ctx, glassCx - 35 * s, glassCy + 16 * s, 12 * s, 2 * s, "#ffffff", 0.75);
    this.drawPixelRect(ctx, glassCx - 30 * s, glassCy + 11 * s, 2 * s, 12 * s, "#ffffff", 0.55);

    this.drawPixelRect(ctx, glassCx + 25 * s, glassCy + 14 * s, 12 * s, 2 * s, "#ffffff", 0.65);
    this.drawPixelRect(ctx, glassCx + 30 * s, glassCy + 9 * s, 2 * s, 12 * s, "#ffffff", 0.45);
  }

  // Re-draw a glass glare OVER silhouette so it feels trapped inside
  this.drawPixelRect(ctx, glassCx - 38 * s, glassCy - 10 * s, 8 * s, 42 * s, "#ffffff", 0.14);
  this.drawPixelRect(ctx, glassCx - 25 * s, glassCy - 14 * s, 46 * s, 4 * s, "#ffffff", 0.1);

  ctx.restore();

  // Text
  const textAlpha = 0.5 + (Math.sin(this.time * 3) + 1) * 0.25;
  ctx.save();
  ctx.globalAlpha = textAlpha;
  this.drawCenteredText(ctx, "SOMETHING IS INSIDE", cx, cy + 145, 18, "#ffffff");
  this.drawCenteredText(ctx, "PRESS DRAW 1", cx, cy + 170, 14, "#d7c9ff");
  ctx.restore();
}

private drawCapsule(
  ctx: CanvasRenderingContext2D,
  cx: number,
  cy: number,
  rarity: Rarity,
  scale = 1,
  popped = false,
  capPopX = 0,
  capPopY = 0
) {
  const s = scale;

  // Soft floor shadow
  this.drawPixelRect(ctx, cx - 48 * s, cy + 74 * s, 96 * s, 10 * s, "#000000", 0.22);
  this.drawPixelRect(ctx, cx - 34 * s, cy + 77 * s, 68 * s, 5 * s, "#000000", 0.22);

  // Tiny magical dust around base
  const sparkle = Math.sin(this.time * 5) > 0;
  if (!popped && sparkle) {
    const color = this.getRarityColor(rarity);
    this.drawPixelRect(ctx, cx - 70 * s, cy + 28 * s, 4 * s, 4 * s, color, 0.65);
    this.drawPixelRect(ctx, cx + 64 * s, cy + 2 * s, 4 * s, 4 * s, color, 0.55);
    this.drawPixelRect(ctx, cx - 50 * s, cy - 54 * s, 3 * s, 3 * s, "#fff4b8", 0.75);
  }

  this.drawCapsuleBase(ctx, cx, cy, rarity, scale);

  if (!popped) {
    this.drawCapsuleCap(ctx, cx, cy, rarity, scale, 0, 0);
  } else {
    ctx.save();
    ctx.translate(cx + capPopX * s, cy + capPopY * s);
    ctx.rotate(capPopY * 0.045);
    this.drawCapsuleCap(ctx, 0, 0, rarity, scale, 0, 0);
    ctx.restore();
  }
}

private drawCapsuleBase(
  ctx: CanvasRenderingContext2D,
  cx: number,
  cy: number,
  rarity: Rarity,
  scale: number
) {
  const s = scale;
  const color = this.getRarityColor(rarity);
  const pulse = 0.32 + Math.sin(this.time * 4.5) * 0.18;

  // =========================
  // STONE/WOOD PEDESTAL BASE
  // =========================
  this.drawPixelRect(ctx, cx - 62 * s, cy + 48 * s, 124 * s, 30 * s, "#2a1a12");
  this.drawPixelRect(ctx, cx - 58 * s, cy + 52 * s, 116 * s, 20 * s, "#5a3520");
  this.drawPixelRect(ctx, cx - 58 * s, cy + 52 * s, 116 * s, 5 * s, "#9a6234", 0.75);
  this.drawPixelRect(ctx, cx - 58 * s, cy + 67 * s, 116 * s, 5 * s, "#24140e", 0.45);

  // Wood grain
  this.drawPixelRect(ctx, cx - 46 * s, cy + 59 * s, 30 * s, 3 * s, "#2f1a10", 0.45);
  this.drawPixelRect(ctx, cx + 6 * s, cy + 61 * s, 36 * s, 3 * s, "#2f1a10", 0.45);
  this.drawPixelRect(ctx, cx - 10 * s, cy + 70 * s, 24 * s, 2 * s, "#c17a3d", 0.35);

  // Stone feet
  this.drawPixelRect(ctx, cx - 70 * s, cy + 66 * s, 24 * s, 16 * s, "#191623");
  this.drawPixelRect(ctx, cx + 46 * s, cy + 66 * s, 24 * s, 16 * s, "#191623");
  this.drawPixelRect(ctx, cx - 66 * s, cy + 66 * s, 16 * s, 5 * s, "#3a3348");
  this.drawPixelRect(ctx, cx + 50 * s, cy + 66 * s, 16 * s, 5 * s, "#3a3348");

  // =========================
  // RUNIC MACHINE BODY
  // =========================
  this.drawPixelRect(ctx, cx - 54 * s, cy - 34 * s, 108 * s, 90 * s, "#171120");
  this.drawPixelRect(ctx, cx - 48 * s, cy - 28 * s, 96 * s, 78 * s, "#302443");
  this.drawPixelRect(ctx, cx - 43 * s, cy - 23 * s, 86 * s, 68 * s, "#483052");

  // Dark inset chamber
  this.drawPixelRect(ctx, cx - 36 * s, cy - 15 * s, 72 * s, 52 * s, "#08060c");
  this.drawPixelRect(ctx, cx - 31 * s, cy - 10 * s, 62 * s, 42 * s, "#120d19");

  // Magical liquid / essence window
  this.drawPixelRect(ctx, cx - 27 * s, cy + 3 * s, 54 * s, 26 * s, color, pulse);
  this.drawPixelRect(ctx, cx - 20 * s, cy + 10 * s, 40 * s, 10 * s, "#ffffff", 0.12);
  this.drawPixelRect(ctx, cx - 30 * s, cy - 8 * s, 7 * s, 30 * s, "#ffffff", 0.18);

  // Inner floating rune core
  this.drawPixelRect(ctx, cx - 5 * s, cy + 2 * s, 10 * s, 10 * s, "#fff4b8", 0.85);
  this.drawPixelRect(ctx, cx - 2 * s, cy - 4 * s, 4 * s, 22 * s, "#fff4b8", 0.55);
  this.drawPixelRect(ctx, cx - 11 * s, cy + 7 * s, 22 * s, 4 * s, "#fff4b8", 0.45);

  // Side metal/stone braces
  this.drawPixelRect(ctx, cx - 62 * s, cy - 22 * s, 12 * s, 62 * s, "#20172e");
  this.drawPixelRect(ctx, cx + 50 * s, cy - 22 * s, 12 * s, 62 * s, "#20172e");
  this.drawPixelRect(ctx, cx - 60 * s, cy - 16 * s, 8 * s, 12 * s, "#6b587d");
  this.drawPixelRect(ctx, cx + 52 * s, cy - 16 * s, 8 * s, 12 * s, "#6b587d");
  this.drawPixelRect(ctx, cx - 60 * s, cy + 22 * s, 8 * s, 12 * s, "#6b587d");
  this.drawPixelRect(ctx, cx + 52 * s, cy + 22 * s, 8 * s, 12 * s, "#6b587d");

  // Rarity gems
  this.drawPixelRect(ctx, cx - 66 * s, cy - 2 * s, 8 * s, 8 * s, color, 0.85);
  this.drawPixelRect(ctx, cx + 58 * s, cy - 2 * s, 8 * s, 8 * s, color, 0.85);
  this.drawPixelRect(ctx, cx - 64 * s, cy, 4 * s, 4 * s, "#ffffff", 0.35);
  this.drawPixelRect(ctx, cx + 60 * s, cy, 4 * s, 4 * s, "#ffffff", 0.35);

  // Top latch socket where cap sits
  this.drawPixelRect(ctx, cx - 42 * s, cy - 43 * s, 84 * s, 13 * s, "#110c19");
  this.drawPixelRect(ctx, cx - 36 * s, cy - 39 * s, 72 * s, 5 * s, "#5d496d");

  // Pixel outline chunks for chunky 8-bit silhouette
  this.drawPixelRect(ctx, cx - 50 * s, cy - 34 * s, 10 * s, 6 * s, "#0b0811");
  this.drawPixelRect(ctx, cx + 40 * s, cy - 34 * s, 10 * s, 6 * s, "#0b0811");
  this.drawPixelRect(ctx, cx - 54 * s, cy + 40 * s, 12 * s, 10 * s, "#0b0811");
  this.drawPixelRect(ctx, cx + 42 * s, cy + 40 * s, 12 * s, 10 * s, "#0b0811");
}

private drawCapsuleCap(
  ctx: CanvasRenderingContext2D,
  cx: number,
  cy: number,
  rarity: Rarity,
  scale: number,
  offsetX: number,
  offsetY: number
) {
  const s = scale;
  const color = this.getRarityColor(rarity);
  const x = cx + offsetX * s;
  const y = cy + offsetY * s;
  const pulse = 0.45 + Math.sin(this.time * 5.5) * 0.2;

  // =========================
  // FANTASY LID / ROOF SHAPE
  // =========================

  // Heavy outline, stepped silhouette
  this.drawPixelRect(ctx, x - 48 * s, y - 78 * s, 96 * s, 14 * s, "#100b18");
  this.drawPixelRect(ctx, x - 58 * s, y - 66 * s, 116 * s, 34 * s, "#100b18");
  this.drawPixelRect(ctx, x - 50 * s, y - 32 * s, 100 * s, 10 * s, "#100b18");

  // Main cap metal/wood
  this.drawPixelRect(ctx, x - 44 * s, y - 74 * s, 88 * s, 14 * s, "#3b284d");
  this.drawPixelRect(ctx, x - 54 * s, y - 62 * s, 108 * s, 28 * s, "#4b315a");
  this.drawPixelRect(ctx, x - 46 * s, y - 30 * s, 92 * s, 5 * s, "#2a1b35");

  // Highlight lip
  this.drawPixelRect(ctx, x - 38 * s, y - 70 * s, 76 * s, 5 * s, "#7b5b8e", 0.55);
  this.drawPixelRect(ctx, x - 48 * s, y - 58 * s, 96 * s, 4 * s, "#8b6b98", 0.4);

  // Rarity rune band
  this.drawPixelRect(ctx, x - 54 * s, y - 48 * s, 108 * s, 12 * s, color, 0.9);
  this.drawPixelRect(ctx, x - 54 * s, y - 37 * s, 108 * s, 4 * s, "#000000", 0.32);

  // Rune marks in band
  this.drawPixelRect(ctx, x - 36 * s, y - 45 * s, 4 * s, 6 * s, "#fff4b8", pulse);
  this.drawPixelRect(ctx, x - 20 * s, y - 43 * s, 10 * s, 3 * s, "#fff4b8", pulse * 0.8);
  this.drawPixelRect(ctx, x - 2 * s, y - 46 * s, 4 * s, 8 * s, "#fff4b8", pulse);
  this.drawPixelRect(ctx, x + 14 * s, y - 43 * s, 10 * s, 3 * s, "#fff4b8", pulse * 0.8);
  this.drawPixelRect(ctx, x + 34 * s, y - 45 * s, 4 * s, 6 * s, "#fff4b8", pulse);

  // Crown gem / antenna changed into magic crystal
  this.drawPixelRect(ctx, x - 10 * s, y - 94 * s, 20 * s, 8 * s, "#100b18");
  this.drawPixelRect(ctx, x - 14 * s, y - 86 * s, 28 * s, 12 * s, "#100b18");
  this.drawPixelRect(ctx, x - 8 * s, y - 90 * s, 16 * s, 8 * s, color, 0.9);
  this.drawPixelRect(ctx, x - 11 * s, y - 82 * s, 22 * s, 6 * s, color, 0.75);
  this.drawPixelRect(ctx, x - 4 * s, y - 88 * s, 5 * s, 5 * s, "#ffffff", 0.45);

  // Side bolts/rivets
  this.drawPixelRect(ctx, x - 46 * s, y - 57 * s, 7 * s, 7 * s, "#1b1227");
  this.drawPixelRect(ctx, x + 39 * s, y - 57 * s, 7 * s, 7 * s, "#1b1227");
  this.drawPixelRect(ctx, x - 44 * s, y - 55 * s, 3 * s, 3 * s, "#a88ac0", 0.5);
  this.drawPixelRect(ctx, x + 41 * s, y - 55 * s, 3 * s, 3 * s, "#a88ac0", 0.5);

  // Little wood/metal trim blocks
  this.drawPixelRect(ctx, x - 62 * s, y - 51 * s, 8 * s, 16 * s, "#2a1a12");
  this.drawPixelRect(ctx, x + 54 * s, y - 51 * s, 8 * s, 16 * s, "#2a1a12");
  this.drawPixelRect(ctx, x - 62 * s, y - 49 * s, 8 * s, 4 * s, "#9a6234", 0.55);
  this.drawPixelRect(ctx, x + 54 * s, y - 49 * s, 8 * s, 4 * s, "#9a6234", 0.55);
}

private getRarityColor(rarity: Rarity, isGlow = false) {
  if (isGlow) {
    switch (rarity) {
      case "COMMON":    return "#ffffff"; // spark
      case "UNCOMMON":  return "#c8ffda"; // brighter mint
      case "RARE":      return "#bfe0ff"; // soft arcane blue
      case "UNIQUE":    return "#e2c6ff"; // luminous violet
      case "LEGENDARY": return "#fff4c2"; // radiant gold
      default:          return "#ffffff";
    }
  }

  // CORE COLORS (used for UI + metal accents)
  switch (rarity) {
    case "COMMON":    return "#bcbcbc"; // cleaner grey
    case "UNCOMMON":  return "#2fd65a"; // punchy green
    case "RARE":      return "#2f7dff"; // deeper blue (less washed)
    case "UNIQUE":    return "#7a35ff"; // richer purple
    case "LEGENDARY": return "#ffbf00"; // deeper gold (less yellow)
    default:          return "#e6e6e6";
  }
}

 private drawBackground(ctx: CanvasRenderingContext2D, w: number, h: number) {
  const floorY = h * 0.72;
  const cx = w / 2;

  // Base room
  this.drawPixelRect(ctx, 0, 0, w, h, "#0c0614");
  this.drawPixelRect(ctx, 0, 0, w, floorY, "#2f2d35");
  this.drawPixelRect(ctx, 0, floorY, w, h - floorY, "#3b2418");

  // Side vignette
  this.drawPixelRect(ctx, 0, 0, 110, h, "#050309", 0.42);
  this.drawPixelRect(ctx, w - 110, 0, 110, h, "#050309", 0.42);

  // =========================
  // STONE WALL BRICKS
  // =========================
  const brickH = 34;
  const brickW = 86;

  for (let y = 82; y < floorY; y += brickH) {
    const row = Math.floor(y / brickH);
    const offset = row % 2 === 0 ? 0 : brickW / 2;

    for (let x = -brickW; x < w + brickW; x += brickW) {
      this.drawPixelRect(ctx, x + offset, y, brickW - 5, 4, "#504d57", 0.65);
      this.drawPixelRect(ctx, x + offset, y + brickH - 4, brickW - 5, 4, "#1a1820", 0.35);
      this.drawPixelRect(ctx, x + offset, y, 4, brickH, "#18151d", 0.25);
    }
  }

  // =========================
  // BIG FANTASY WINDOW
  // =========================
  const winX = cx;
  const winY = 74;
  const winW = 240;
  const winH = 250;

  // Outer shadow/frame
  this.drawPixelRect(ctx, winX - winW / 2 - 24, winY + 28, winW + 48, winH, "#100a18");
  this.drawPixelRect(ctx, winX - winW / 2 - 14, winY + 18, winW + 28, winH + 10, "#6d617c");
  this.drawPixelRect(ctx, winX - winW / 2, winY + 30, winW, winH, "#10233d");

  // Arched top
  this.drawPixelRect(ctx, winX - 92, winY + 4, 184, 28, "#6d617c");
  this.drawPixelRect(ctx, winX - 74, winY - 10, 148, 22, "#6d617c");
  this.drawPixelRect(ctx, winX - 54, winY - 22, 108, 16, "#6d617c");

  this.drawPixelRect(ctx, winX - 76, winY + 16, 152, 22, "#1d3554");
  this.drawPixelRect(ctx, winX - 58, winY + 2, 116, 18, "#1d3554");
  this.drawPixelRect(ctx, winX - 40, winY - 10, 80, 12, "#1d3554");

  // Outside daytime sky/fields
  this.drawPixelRect(ctx, winX - 105, winY + 48, 210, 194, "#7ec7f5");
  this.drawPixelRect(ctx, winX - 105, winY + 48, 210, 58, "#9edcff", 0.7);
  this.drawPixelRect(ctx, winX - 105, winY + 108, 210, 38, "#5db26c", 0.75);
  this.drawPixelRect(ctx, winX - 105, winY + 146, 210, 96, "#4a8d4d", 0.8);

  // Sun
  this.drawPixelRect(ctx, winX + 48, winY + 66, 34, 34, "#fff0b8", 0.9);
  this.drawPixelRect(ctx, winX + 40, winY + 76, 16, 20, "#ffe36f", 0.45);

  // Distant hills
  this.drawPixelRect(ctx, winX - 105, winY + 126, 50, 16, "#387b56", 0.7);
  this.drawPixelRect(ctx, winX - 58, winY + 116, 72, 26, "#3f8d5e", 0.7);
  this.drawPixelRect(ctx, winX + 16, winY + 124, 90, 18, "#34764f", 0.7);

  // Window bars
  this.drawPixelRect(ctx, winX - 4, winY + 30, 8, 250, "#24182b");
  this.drawPixelRect(ctx, winX - 105, winY + 128, 210, 8, "#24182b");
  this.drawPixelRect(ctx, winX - 105, winY + 198, 210, 6, "#24182b");

  // Light spilling into room
  this.drawPixelRect(ctx, winX - 170, winY + 245, 340, 160, "#ffffff", 0.04);
  this.drawPixelRect(ctx, winX - 260, winY + 230, 520, 125, "#7c68ff", 0.055);

  // =========================
  // WOOD FLOOR
  // =========================
  this.drawPixelRect(ctx, 0, floorY, w, h - floorY, "#4b2f1f");

  for (let y = floorY; y < h; y += 34) {
    this.drawPixelRect(ctx, 0, y, w, 4, "#22110a", 0.58);
    this.drawPixelRect(ctx, 0, y + 5, w, 2, "#8a562e", 0.42);
  }

  for (let x = -40; x < w + 80; x += 120) {
    this.drawPixelRect(ctx, x, floorY, 5, h - floorY, "#241109", 0.55);
  }

  // =========================
  // CENTRAL KONJURE MACHINE PLATFORM
  // =========================
  const py = floorY + 58;

  this.drawPixelRect(ctx, cx - 220, py + 112, 440, 22, "#000000", 0.35);

  // Back stage slab
  this.drawPixelRect(ctx, cx - 250, floorY + 36, 500, 136, "#170c25");
  this.drawPixelRect(ctx, cx - 228, floorY + 52, 456, 104, "#3b2159");
  this.drawPixelRect(ctx, cx - 188, floorY + 72, 376, 66, "#140b24");
  this.drawPixelRect(ctx, cx - 250, floorY + 36, 500, 8, "#a98bff", 0.45);
  this.drawPixelRect(ctx, cx - 250, floorY + 164, 500, 8, "#07040c", 0.5);

  // Front machine base
  this.drawPixelRect(ctx, cx - 122, py + 50, 244, 72, "#2b203a");
  this.drawPixelRect(ctx, cx - 145, py + 98, 290, 30, "#140d1d");
  this.drawPixelRect(ctx, cx - 100, py + 60, 200, 18, "#62507d");
  this.drawPixelRect(ctx, cx - 76, py + 84, 152, 12, "#9f7cff", 0.34);

  // Side pillars
  this.drawPixelRect(ctx, cx - 186, py + 26, 54, 15, "#5a5368");
  this.drawPixelRect(ctx, cx + 132, py + 26, 54, 15, "#5a5368");
  this.drawPixelRect(ctx, cx - 196, py + 38, 14, 86, "#282130");
  this.drawPixelRect(ctx, cx + 182, py + 38, 14, 86, "#282130");

  // Pulse strip
  const pulse = 0.5 + Math.sin(this.time * 3) * 0.5;
  this.drawPixelRect(ctx, cx - 92, py + 26, 184, 8, "#7c68ff", 0.32 + pulse * 0.2);
  this.drawPixelRect(ctx, cx - 64, py + 16, 128, 6, "#ffffff", 0.22 + pulse * 0.18);

  // Runic lights
  for (let i = 0; i < 9; i++) {
    const rx = cx - 80 + i * 20;
    const ry = py + 66 + Math.sin(this.time * 2 + i) * 2;
    this.drawPixelRect(ctx, rx, ry, 8, 4, "#c7b7ff", 0.35 + pulse * 0.25);
  }

  // Shelves
  this.drawShelf(ctx, 74, 230);
  this.drawShelf(ctx, w - 234, 230);

  // Ambient mana pixels
  for (let i = 0; i < 28; i++) {
    const px = (i * 83 + Math.sin(this.time * 0.8 + i) * 22) % w;
    const py2 = 95 + ((i * 47 + Math.sin(this.time + i) * 18) % 390);
    const a = 0.14 + Math.sin(this.time * 2 + i) * 0.07;

    this.drawPixelRect(ctx, px, py2, 4, 4, "#bda8ff", a);
  }

  // Top/bottom cinematic shade
  this.drawPixelRect(ctx, 0, 0, w, 70, "#000000", 0.22);
  this.drawPixelRect(ctx, 0, h - 95, w, 95, "#000000", 0.22);
}

 private drawShelf(ctx: CanvasRenderingContext2D, x: number, y: number) {
  // Back shadow
  this.drawPixelRect(ctx, x - 12, y - 18, 184, 178, "#000000", 0.22);

  // Dark fantasy wood
  const wood = "#6b3f22";
  const woodHi = "#b47a3c";
  const woodDark = "#2a160d";
  const metal = "#5d536a";

  // Side posts
  this.drawPixelRect(ctx, x + 4, y - 4, 14, 156, woodDark);
  this.drawPixelRect(ctx, x + 142, y - 4, 14, 156, woodDark);
  this.drawPixelRect(ctx, x + 8, y, 6, 148, woodHi, 0.35);
  this.drawPixelRect(ctx, x + 146, y, 6, 148, woodHi, 0.35);

  // Shelves
  for (let i = 0; i < 3; i++) {
    const sy = y + i * 68;

    this.drawPixelRect(ctx, x, sy, 160, 16, woodDark);
    this.drawPixelRect(ctx, x + 4, sy, 152, 10, wood);
    this.drawPixelRect(ctx, x + 4, sy, 152, 3, woodHi, 0.55);
    this.drawPixelRect(ctx, x + 4, sy + 11, 152, 5, "#130a06", 0.45);

    // Metal corner caps
    this.drawPixelRect(ctx, x, sy, 10, 16, metal, 0.55);
    this.drawPixelRect(ctx, x + 150, sy, 10, 16, metal, 0.55);
  }

  // Books / monster logs
  const bookColors = ["#b63a3a", "#315f91", "#2f8b6b", "#c69235", "#7e4bb8"];

  for (let i = 0; i < 8; i++) {
    const bx = x + 24 + i * 14;
    const bh = 28 + ((i * 9) % 20);
    const by = y + 68 - bh;

    this.drawPixelRect(ctx, bx, by, 10, bh, "#120b08", 0.35);
    this.drawPixelRect(ctx, bx, by, 10, bh, bookColors[i % bookColors.length]);
    this.drawPixelRect(ctx, bx + 2, by + 5, 6, 4, "#ffd84a", 0.45);
    this.drawPixelRect(ctx, bx + 1, by + 2, 2, bh - 4, "#ffffff", 0.16);
  }

  // Potion bottle
  this.drawPixelRect(ctx, x + 32, y + 96, 22, 34, "#0c0711", 0.45);
  this.drawPixelRect(ctx, x + 35, y + 100, 16, 28, "#4cc9f0", 0.78);
  this.drawPixelRect(ctx, x + 39, y + 90, 8, 10, "#d7c9ff", 0.65);
  this.drawPixelRect(ctx, x + 48, y + 105, 3, 12, "#ffffff", 0.32);

  // Essence jar
  const pulse = 0.45 + Math.sin(this.time * 4) * 0.18;
  this.drawPixelRect(ctx, x + 86, y + 99, 26, 31, "#0c0711", 0.45);
  this.drawPixelRect(ctx, x + 90, y + 103, 18, 24, "#8b3dff", 0.62);
  this.drawPixelRect(ctx, x + 96, y + 93, 8, 11, "#d7c9ff", 0.55);
  this.drawPixelRect(ctx, x + 96, y + 112, 6, 6, "#ffffff", pulse);

  // Bottom rune cards/chips
  this.drawPixelRect(ctx, x + 46, y + 138, 26, 12, "#130a06");
  this.drawPixelRect(ctx, x + 49, y + 140, 20, 8, "#32e35b", 0.9);
  this.drawPixelRect(ctx, x + 51, y + 142, 16, 2, "#ffffff", 0.45);

  this.drawPixelRect(ctx, x + 90, y + 138, 26, 12, "#130a06");
  this.drawPixelRect(ctx, x + 93, y + 140, 20, 8, "#a85cff", 0.9);
  this.drawPixelRect(ctx, x + 95, y + 142, 16, 2, "#ffffff", 0.45);

  // Tall specimen jar
  this.drawPixelRect(ctx, x + 122, y + 88, 18, 48, "#0c0711", 0.4);
  this.drawPixelRect(ctx, x + 125, y + 92, 12, 42, "#87ceeb", 0.36);
  this.drawPixelRect(ctx, x + 129, y + 106, 4, 20, "#ffd84a", 0.9);
  this.drawPixelRect(ctx, x + 135, y + 96, 2, 30, "#ffffff", 0.22);
}
private drawRatesPanel(ctx: CanvasRenderingContext2D, x: number, y: number) {
  const ox = x - 200;
  const oy = y - 20;

  const W = 220;
  const H = 198;

  // =========================
  // HANGING STRING / WALL PEG
  // =========================
  this.drawPixelRect(ctx, ox + W / 2 - 3, oy - 34, 6, 6, "#3b2418");
  this.drawPixelRect(ctx, ox + W / 2 - 2, oy - 33, 4, 4, "#b08a57");

  // left rope
  this.drawPixelRect(ctx, ox + 49, oy - 14, 4, 4, "#6b4a2b");
  this.drawPixelRect(ctx, ox + 53, oy - 18, 4, 4, "#6b4a2b");
  this.drawPixelRect(ctx, ox + 57, oy - 22, 4, 4, "#6b4a2b");
  this.drawPixelRect(ctx, ox + 61, oy - 26, 4, 4, "#6b4a2b");
  this.drawPixelRect(ctx, ox + 65, oy - 30, 4, 4, "#6b4a2b");
  this.drawPixelRect(ctx, ox + 69, oy - 34, 4, 4, "#6b4a2b");
  this.drawPixelRect(ctx, ox + 73, oy - 38, 4, 4, "#6b4a2b");
  this.drawPixelRect(ctx, ox + 77, oy - 42, 4, 4, "#6b4a2b");
  this.drawPixelRect(ctx, ox + 81, oy - 46, 4, 4, "#6b4a2b");
  this.drawPixelRect(ctx, ox + 85, oy - 50, 4, 4, "#6b4a2b");

  // right rope
  this.drawPixelRect(ctx, ox + W - 53, oy - 14, 4, 4, "#6b4a2b");
  this.drawPixelRect(ctx, ox + W - 57, oy - 18, 4, 4, "#6b4a2b");
  this.drawPixelRect(ctx, ox + W - 61, oy - 22, 4, 4, "#6b4a2b");
  this.drawPixelRect(ctx, ox + W - 65, oy - 26, 4, 4, "#6b4a2b");
  this.drawPixelRect(ctx, ox + W - 69, oy - 30, 4, 4, "#6b4a2b");
  this.drawPixelRect(ctx, ox + W - 73, oy - 34, 4, 4, "#6b4a2b");
  this.drawPixelRect(ctx, ox + W - 77, oy - 38, 4, 4, "#6b4a2b");
  this.drawPixelRect(ctx, ox + W - 81, oy - 42, 4, 4, "#6b4a2b");
  this.drawPixelRect(ctx, ox + W - 85, oy - 46, 4, 4, "#6b4a2b");
  this.drawPixelRect(ctx, ox + W - 89, oy - 50, 4, 4, "#6b4a2b");

  // shadow behind hanging parchment
  this.drawPixelRect(ctx, ox + 8, oy + 10, W, H, "#2a160f", 0.28);

  // =========================
  // WOODEN PAINTING FRAME
  // =========================
  this.drawPixelRect(ctx, ox, oy, W, H, "#4a2c18");
  this.drawPixelRect(ctx, ox + 5, oy + 5, W - 10, H - 10, "#8a5a2b");
  this.drawPixelRect(ctx, ox + 10, oy + 10, W - 20, H - 20, "#3b2418");

  // frame highlights
  this.drawPixelRect(ctx, ox + 5, oy + 5, W - 10, 4, "#c28a4a", 0.7);
  this.drawPixelRect(ctx, ox + 5, oy + 5, 4, H - 10, "#b8793f", 0.55);
  this.drawPixelRect(ctx, ox + 10, oy + H - 14, W - 20, 4, "#1f120b", 0.55);
  this.drawPixelRect(ctx, ox + W - 14, oy + 10, 4, H - 20, "#1f120b", 0.45);

  // =========================
  // PARCHMENT PAPER
  // =========================
  const px = ox + 19;
  const py = oy + 18;
  const pw = W - 38;
  const ph = H - 34;

  // torn parchment silhouette
  this.drawPixelRect(ctx, px + 4, py, pw - 8, ph, "#f1d8a2");
  this.drawPixelRect(ctx, px, py + 8, pw, ph - 16, "#f1d8a2");

  // uneven corners / torn bites
  this.drawPixelRect(ctx, px, py, 10, 8, "#3b2418");
  this.drawPixelRect(ctx, px + pw - 10, py, 10, 8, "#3b2418");
  this.drawPixelRect(ctx, px, py + ph - 8, 8, 8, "#3b2418");
  this.drawPixelRect(ctx, px + pw - 8, py + ph - 8, 8, 8, "#3b2418");

  // parchment border
  this.drawPixelRect(ctx, px + 6, py + 5, pw - 12, 3, "#b8894d", 0.75);
  this.drawPixelRect(ctx, px + 6, py + ph - 8, pw - 12, 3, "#8f653a", 0.75);
  this.drawPixelRect(ctx, px + 5, py + 8, 3, ph - 16, "#b8894d", 0.7);
  this.drawPixelRect(ctx, px + pw - 8, py + 8, 3, ph - 16, "#8f653a", 0.65);

  // paper stains / pixel aging
  this.drawPixelRect(ctx, px + 25, py + 21, 18, 5, "#c89b5e", 0.25);
  this.drawPixelRect(ctx, px + 126, py + 31, 22, 7, "#9b6b3d", 0.18);
  this.drawPixelRect(ctx, px + 18, py + 118, 28, 6, "#9b6b3d", 0.16);
  this.drawPixelRect(ctx, px + 132, py + 132, 16, 5, "#c89b5e", 0.2);

  // =========================
  // TITLE
  // =========================
  this.drawCenteredText(ctx, "DROP RATES", ox + W / 2 + 1, py + 31, 15, "#5a2f19");
  this.drawCenteredText(ctx, "DROP RATES", ox + W / 2, py + 30, 15, "#2f1b12");

  this.drawPixelRect(ctx, px + 36, py + 39, pw - 72, 2, "#8f653a", 0.7);
  this.drawPixelRect(ctx, px + 52, py + 43, pw - 104, 2, "#b8894d", 0.5);

  // =========================
  // RATE ROWS
  // =========================
  const rowStart = py + 68;
  const spacing = 23;

  const drawRateRow = (
    label: string,
    rarity: Rarity,
    row: number
  ) => {
    const ry = rowStart + spacing * row;

    // tiny parchment inset line
    this.drawPixelRect(ctx, px + 18, ry - 11, pw - 36, 17, "#d8b978", 0.35);
    this.drawPixelRect(ctx, px + 20, ry + 5, pw - 40, 1, "#8f653a", 0.35);

    // pixel text shadow + text
    this.drawCenteredText(ctx, label, px + 62 + 1, ry + 1, 12, "#8f653a");
    this.drawCenteredText(ctx, label, px + 62, ry, 12, "#3b2418");

    // rarity swatch framed like wax/seal paint
    this.drawPixelRect(ctx, px + 126, ry - 8, 38, 13, "#5a2f19");
    this.drawPixelRect(ctx, px + 129, ry - 5, 32, 7, this.getRarityColor(rarity));
    this.drawPixelRect(ctx, px + 129, ry - 5, 32, 2, "#ffffff", 0.28);
  };

  drawRateRow("COMMON", "COMMON", 0);
  drawRateRow("UNCOMMON", "UNCOMMON", 1);
  drawRateRow("RARE", "RARE", 2);
  drawRateRow("UNIQUE", "UNIQUE", 3);
  drawRateRow("LEGENDARY", "LEGENDARY", 4);

  // =========================
  // METAL PINS
  // =========================
  this.drawPixelRect(ctx, ox + 22, oy + 18, 7, 7, "#5d3a1a");
  this.drawPixelRect(ctx, ox + 24, oy + 20, 3, 3, "#e5e7eb");

  this.drawPixelRect(ctx, ox + W - 29, oy + 18, 7, 7, "#5d3a1a");
  this.drawPixelRect(ctx, ox + W - 27, oy + 20, 3, 3, "#e5e7eb");
}
private drawButton(ctx: CanvasRenderingContext2D, b: UiButton) {
  const pushed = b.hovered ? 2 : 0;

  const x = b.x;
  const y = b.y + pushed;
  const w = b.width;
  const h = b.height;

  const darkWood = "#3b2418";
  const midWood = "#6b3f1f";
  const lightWood = "#a66a32";
  const parchment = b.hovered ? "#f3d79b" : "#d8b978";
  const parchmentDark = "#9b6b3d";
  const textMain = b.hovered ? "#2f1b12" : "#3b2418";

  // shadow
  this.drawPixelRect(ctx, x + 5, b.y + 6, w, h, "#000000", 0.24);

  // outer chunky wood frame
  this.drawPixelRect(ctx, x, y, w, h, darkWood);
  this.drawPixelRect(ctx, x + 3, y + 3, w - 6, h - 6, midWood);

  // frame highlights / depth
  this.drawPixelRect(ctx, x + 3, y + 3, w - 6, 4, lightWood, 0.75);
  this.drawPixelRect(ctx, x + 3, y + 3, 4, h - 6, lightWood, 0.45);
  this.drawPixelRect(ctx, x + 6, y + h - 9, w - 12, 4, "#1f120b", 0.5);
  this.drawPixelRect(ctx, x + w - 9, y + 6, 4, h - 12, "#1f120b", 0.45);

  // parchment inset
  this.drawPixelRect(ctx, x + 10, y + 9, w - 20, h - 18, parchmentDark);
  this.drawPixelRect(ctx, x + 13, y + 11, w - 26, h - 22, parchment);

  // uneven parchment corners
  this.drawPixelRect(ctx, x + 13, y + 11, 6, 5, midWood);
  this.drawPixelRect(ctx, x + w - 19, y + 11, 6, 5, midWood);
  this.drawPixelRect(ctx, x + 13, y + h - 16, 5, 5, midWood);
  this.drawPixelRect(ctx, x + w - 18, y + h - 16, 5, 5, midWood);

  // paper shine / stains
  this.drawPixelRect(ctx, x + 20, y + 15, w - 40, 3, "#ffffff", 0.18);
  this.drawPixelRect(ctx, x + 28, y + h - 19, w - 56, 2, "#8f653a", 0.25);
  this.drawPixelRect(ctx, x + 25, y + 24, 18, 4, "#9b6b3d", 0.14);
  this.drawPixelRect(ctx, x + w - 48, y + 28, 20, 5, "#ffffff", 0.12);

  // brass pins
  this.drawPixelRect(ctx, x + 7, y + 7, 6, 6, "#4a2c18");
  this.drawPixelRect(ctx, x + 9, y + 8, 3, 3, "#f2cc8f");
  this.drawPixelRect(ctx, x + w - 13, y + 7, 6, 6, "#4a2c18");
  this.drawPixelRect(ctx, x + w - 11, y + 8, 3, 3, "#f2cc8f");

  // hover glow border
  if (b.hovered) {
    this.drawPixelRect(ctx, x + 6, y + 6, w - 12, 2, "#fff2b8", 0.35);
    this.drawPixelRect(ctx, x + 6, y + h - 8, w - 12, 2, "#fff2b8", 0.2);
  }

  const textY = y + h / 2 + 6;

  // pixel text shadow
  this.drawCenteredText(ctx, b.label, x + w / 2 + 2, textY + 2, 18, "#8f653a");
  this.drawCenteredText(ctx, b.label, x + w / 2, textY, 18, textMain);
}

private drawCenteredText(
  ctx: CanvasRenderingContext2D,
  text: string,
  x: number,
  y: number,
  size: number,
  color: string
) {
  ctx.save();
  ctx.imageSmoothingEnabled = false;
  ctx.font = `700 ${size}px monospace`;
  ctx.textAlign = "center";
  ctx.textBaseline = "middle";

  // pixel outline
  ctx.fillStyle = "#a96e40";
  ctx.fillText(text, Math.round(x - 1), Math.round(y));
  ctx.fillText(text, Math.round(x + 1), Math.round(y));
  ctx.fillText(text, Math.round(x), Math.round(y - 1));
  ctx.fillText(text, Math.round(x), Math.round(y + 1));

  // main text
  ctx.fillStyle = color;
  ctx.fillText(text, Math.round(x), Math.round(y));

  ctx.restore();
}

  private drawPixelRect(
    ctx: CanvasRenderingContext2D,
    x: number,
    y: number,
    w: number,
    h: number,
    color: string,
    alpha = 1
  ) {
    ctx.globalAlpha = alpha;
    ctx.fillStyle = color;
    ctx.fillRect(Math.round(x), Math.round(y), Math.round(w), Math.round(h));
    ctx.globalAlpha = 1;
  }
}