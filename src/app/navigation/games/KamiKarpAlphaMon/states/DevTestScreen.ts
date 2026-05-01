

import { StateManager } from "../systems/StateManager";
import { HomeHub } from "./HomeHub";
import { moveRegistry } from "../Moves/movesRegistry";
import { MoveAnimationInstance, MoveDefinition } from "../Moves/moveTypes";
import { drawMove } from "../Moves/drawMove";

import { conditionRegistry } from "../Conditions/conditionRegistry";
import {
  ActiveCondition,
  ConditionDefinition,
} from "../Conditions/conditionTypes";
import {
  updateConditions,
  drawConditions,
} from "../Conditions/conditions";

export class DevTestScreen {
  manager: StateManager;

  backgroundImage: HTMLImageElement;
  backgroundLoaded = false;

  playerImage: HTMLImageElement;
  enemyImage: HTMLImageElement;

  playerLoaded = false;
  enemyLoaded = false;

  time = 0;
  dt = 0.016;

  mouseX = 0;
  mouseY = 0;

  activeMoveAnimation: MoveAnimationInstance | null = null;

  availableMoves: MoveDefinition[] = [];
  selectedMoveIndex = 0;

  availableConditions: ConditionDefinition[] = [];
  selectedConditionIndex = 0;

  playerConditions: ActiveCondition[] = [];
  enemyConditions: ActiveCondition[] = [];

  attackFromPlayer = true;
  conditionOnPlayer = false;

  backBounds = {
    x: 20,
    y: 20,
    width: 200,
    height: 48,
  };

  attackBounds = {
    x: 0,
    y: 0,
    width: 250,
    height: 74,
  };

  swapAttackSideBounds = {
    x: 0,
    y: 0,
    width: 250,
    height: 68,
  };

  prevMoveBounds = {
    x: 0,
    y: 0,
    width: 64,
    height: 64,
  };

  nextMoveBounds = {
    x: 0,
    y: 0,
    width: 64,
    height: 64,
  };

  moveCardBounds = {
    x: 0,
    y: 0,
    width: 380,
    height: 90,
  };

  prevConditionBounds = {
    x: 0,
    y: 0,
    width: 64,
    height: 64,
  };

  nextConditionBounds = {
    x: 0,
    y: 0,
    width: 64,
    height: 64,
  };

  conditionCardBounds = {
    x: 0,
    y: 0,
    width: 380,
    height: 90,
  };

  toggleConditionBounds = {
    x: 0,
    y: 0,
    width: 250,
    height: 74,
  };

  swapConditionSideBounds = {
    x: 0,
    y: 0,
    width: 250,
    height: 68,
  };

  hoveringBack = false;
  hoveringAttack = false;
  hoveringSwapAttackSide = false;
  hoveringPrevMove = false;
  hoveringNextMove = false;

  hoveringPrevCondition = false;
  hoveringNextCondition = false;
  hoveringToggleCondition = false;
  hoveringSwapConditionSide = false;

  attackFlashTimer = 0;
  conditionFlashTimer = 0;
  playerHitTimer = 0;
  enemyHitTimer = 0;

  constructor(manager: StateManager) {
    this.manager = manager;

    this.backgroundImage = new Image();
    this.backgroundImage.src = "/games/alphamon/town-battle.png";
    this.backgroundImage.onload = () => (this.backgroundLoaded = true);

    this.playerImage = new Image();
    this.playerImage.src = "/games/alphamon/monsters/squnch/squnch1-bodyback.png";
    this.playerImage.onload = () => (this.playerLoaded = true);

    this.enemyImage = new Image();
    this.enemyImage.src = "/games/alphamon/monsters/squnch/squnch1-body.png";
    this.enemyImage.onload = () => (this.enemyLoaded = true);

    this.availableMoves = Object.values(moveRegistry).filter(
      (move): move is MoveDefinition =>
        !!move &&
        typeof move.id === "string" &&
        typeof move.name === "string" &&
        typeof move.createAnimation === "function"
    );

    this.availableConditions = Object.values(conditionRegistry).filter(
      (condition): condition is ConditionDefinition =>
        !!condition &&
        typeof condition.id === "string" &&
        typeof condition.name === "string"
    );

    window.addEventListener("mousemove", this.handleMouseMove);
    window.addEventListener("click", this.handleClick);
  }

  destroy() {
    window.removeEventListener("mousemove", this.handleMouseMove);
    window.removeEventListener("click", this.handleClick);
  }

  private getFloorY(height: number) {
    return height * 0.72;
  }

  private getPlayerAnchor(width: number, height: number) {
    const floorY = this.getFloorY(height);
    return {
      x: width * 0.34,
      y: floorY - 18,
    };
  }

  private getEnemyAnchor(width: number, height: number) {
    const floorY = this.getFloorY(height);
    return {
      x: width * 0.69,
      y: floorY - 150,
    };
  }

  private pointInBounds(
    px: number,
    py: number,
    bounds: { x: number; y: number; width: number; height: number }
  ) {
    return (
      px >= bounds.x &&
      px <= bounds.x + bounds.width &&
      py >= bounds.y &&
      py <= bounds.y + bounds.height
    );
  }

  private getSelectedMove() {
    if (this.availableMoves.length === 0) return null;
    return this.availableMoves[this.selectedMoveIndex] ?? null;
  }

  private getSelectedCondition() {
    if (this.availableConditions.length === 0) return null;
    return this.availableConditions[this.selectedConditionIndex] ?? null;
  }

  private cycleMove(direction: -1 | 1) {
    if (this.availableMoves.length === 0) return;
    this.selectedMoveIndex =
      (this.selectedMoveIndex + direction + this.availableMoves.length) %
      this.availableMoves.length;
  }

  private cycleCondition(direction: -1 | 1) {
    if (this.availableConditions.length === 0) return;
    this.selectedConditionIndex =
      (this.selectedConditionIndex +
        direction +
        this.availableConditions.length) %
      this.availableConditions.length;
  }

  private getConditionTargetList() {
    return this.conditionOnPlayer ? this.playerConditions : this.enemyConditions;
  }

  private selectedConditionIsActive() {
    const selectedCondition = this.getSelectedCondition();
    if (!selectedCondition) return false;

    return this.getConditionTargetList().some(
      (condition) => condition.id === selectedCondition.id
    );
  }

  private toggleSelectedCondition() {
    const selectedCondition = this.getSelectedCondition();
    if (!selectedCondition) return;

    const targetList = this.getConditionTargetList();

    const existingIndex = targetList.findIndex(
      (condition) => condition.id === selectedCondition.id
    );

    if (existingIndex >= 0) {
      targetList.splice(existingIndex, 1);
      return;
    }

    targetList.push({
      id: selectedCondition.id,
    });
  }

  private toggleAttackSide() {
    this.attackFromPlayer = !this.attackFromPlayer;
  }

  private toggleConditionSide() {
    this.conditionOnPlayer = !this.conditionOnPlayer;
  }

  private triggerPlayerHit() {
    this.playerHitTimer = 0.18;
  }

  private triggerEnemyHit() {
    this.enemyHitTimer = 0.18;
  }

  handleMouseMove = (event: MouseEvent) => {
    const canvas = document.querySelector("canvas");
    if (!canvas) return;

    const rect = canvas.getBoundingClientRect();
    const scaleX = canvas.width / rect.width;
    const scaleY = canvas.height / rect.height;

    this.mouseX = (event.clientX - rect.left) * scaleX;
    this.mouseY = (event.clientY - rect.top) * scaleY;

    this.hoveringBack = this.pointInBounds(
      this.mouseX,
      this.mouseY,
      this.backBounds
    );

    this.hoveringAttack = this.pointInBounds(
      this.mouseX,
      this.mouseY,
      this.attackBounds
    );

    this.hoveringSwapAttackSide = this.pointInBounds(
      this.mouseX,
      this.mouseY,
      this.swapAttackSideBounds
    );

    this.hoveringPrevMove = this.pointInBounds(
      this.mouseX,
      this.mouseY,
      this.prevMoveBounds
    );

    this.hoveringNextMove = this.pointInBounds(
      this.mouseX,
      this.mouseY,
      this.nextMoveBounds
    );

    this.hoveringPrevCondition = this.pointInBounds(
      this.mouseX,
      this.mouseY,
      this.prevConditionBounds
    );

    this.hoveringNextCondition = this.pointInBounds(
      this.mouseX,
      this.mouseY,
      this.nextConditionBounds
    );

    this.hoveringToggleCondition = this.pointInBounds(
      this.mouseX,
      this.mouseY,
      this.toggleConditionBounds
    );

    this.hoveringSwapConditionSide = this.pointInBounds(
      this.mouseX,
      this.mouseY,
      this.swapConditionSideBounds
    );
  };

  handleClick = () => {
    if (this.hoveringBack) {
      this.destroy();
      this.manager.setState(new HomeHub(this.manager));
      return;
    }

    if (!this.activeMoveAnimation && this.hoveringPrevMove) {
      this.cycleMove(-1);
      return;
    }

    if (!this.activeMoveAnimation && this.hoveringNextMove) {
      this.cycleMove(1);
      return;
    }

    if (this.hoveringPrevCondition) {
      this.cycleCondition(-1);
      return;
    }

    if (this.hoveringNextCondition) {
      this.cycleCondition(1);
      return;
    }

    if (this.hoveringSwapConditionSide) {
      this.toggleConditionSide();
      return;
    }

    if (this.hoveringToggleCondition) {
      this.conditionFlashTimer = 0.22;
      this.toggleSelectedCondition();
      return;
    }

    if (!this.activeMoveAnimation && this.hoveringSwapAttackSide) {
      this.toggleAttackSide();
      return;
    }

    if (this.hoveringAttack) {
      this.attackFlashTimer = 0.22;

      if (!this.activeMoveAnimation) {
        const canvas = document.querySelector("canvas");
        if (!canvas) return;

        const selectedMove = this.getSelectedMove();
        if (!selectedMove) return;

        const player = this.getPlayerAnchor(canvas.width, canvas.height);
        const enemy = this.getEnemyAnchor(canvas.width, canvas.height);

        const attacker = this.attackFromPlayer ? player : enemy;
        const defender = this.attackFromPlayer ? enemy : player;

        this.activeMoveAnimation = selectedMove.createAnimation({
          userX: attacker.x,
          userY: attacker.y,
          targetX: defender.x,
          targetY: defender.y,
        });
      }
    }
  };

  update() {
    this.time += this.dt;

    if (this.playerHitTimer > 0) {
  this.playerHitTimer -= this.dt;
  if (this.playerHitTimer < 0) this.playerHitTimer = 0;
}

if (this.enemyHitTimer > 0) {
  this.enemyHitTimer -= this.dt;
  if (this.enemyHitTimer < 0) this.enemyHitTimer = 0;
}

    if (this.attackFlashTimer > 0) {
      this.attackFlashTimer -= this.dt;
      if (this.attackFlashTimer < 0) this.attackFlashTimer = 0;
    }

    if (this.conditionFlashTimer > 0) {
      this.conditionFlashTimer -= this.dt;
      if (this.conditionFlashTimer < 0) this.conditionFlashTimer = 0;
    }

    if (this.activeMoveAnimation) {
      this.activeMoveAnimation.update(this.dt);

      if (this.activeMoveAnimation.isDone()) {
        if (this.attackFromPlayer) {
          this.triggerEnemyHit();
        } else {
          this.triggerPlayerHit();
        }

        this.activeMoveAnimation = null;
      }
    }

    const canvas = document.querySelector("canvas");
    if (canvas) {
      const player = this.getPlayerAnchor(canvas.width, canvas.height);
      const enemy = this.getEnemyAnchor(canvas.width, canvas.height);

      updateConditions(
        this.playerConditions,
        this.dt,
        player.x,
        player.y,
        true
      );

      updateConditions(
        this.enemyConditions,
        this.dt,
        enemy.x,
        enemy.y,
        false
      );
    }
  }

  private roundRect(
    ctx: CanvasRenderingContext2D,
    x: number,
    y: number,
    width: number,
    height: number,
    radius: number
  ) {
    ctx.beginPath();
    ctx.roundRect(x, y, width, height, radius);
  }

  private drawPanel(
    ctx: CanvasRenderingContext2D,
    x: number,
    y: number,
    width: number,
    height: number,
    opts?: {
      radius?: number;
      glow?: string;
      top?: string;
      bottom?: string;
      border?: string;
      highlight?: string;
    }
  ) {
    const radius = opts?.radius ?? 18;
    const top = opts?.top ?? "#5d341d";
    const bottom = opts?.bottom ?? "#2f180f";
    const border = opts?.border ?? "#d8a15b";
    const highlight = opts?.highlight ?? "rgba(255,255,255,0.18)";
    const glow = opts?.glow ?? "rgba(255, 190, 90, 0.12)";

    ctx.save();

    ctx.shadowBlur = 18;
    ctx.shadowColor = glow;

    const grad = ctx.createLinearGradient(x, y, x, y + height);
    grad.addColorStop(0, top);
    grad.addColorStop(1, bottom);

    ctx.fillStyle = grad;
    this.roundRect(ctx, x, y, width, height, radius);
    ctx.fill();

    ctx.shadowBlur = 0;

    ctx.strokeStyle = border;
    ctx.lineWidth = 3;
    this.roundRect(ctx, x, y, width, height, radius);
    ctx.stroke();

    ctx.strokeStyle = "rgba(0,0,0,0.45)";
    ctx.lineWidth = 2;
    this.roundRect(ctx, x + 3, y + 3, width - 6, height - 6, radius - 4);
    ctx.stroke();

    ctx.strokeStyle = highlight;
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.moveTo(x + radius, y + 2);
    ctx.lineTo(x + width - radius, y + 2);
    ctx.stroke();

    ctx.restore();
  }

  private drawBackground(
    ctx: CanvasRenderingContext2D,
    width: number,
    height: number
  ) {
    if (this.backgroundLoaded) {
      ctx.drawImage(this.backgroundImage, 0, 0, width, height);

      const topShade = ctx.createLinearGradient(0, 0, 0, height);
      topShade.addColorStop(0, "rgba(20,10,6,0.20)");
      topShade.addColorStop(0.45, "rgba(30,12,6,0.06)");
      topShade.addColorStop(1, "rgba(8,4,3,0.34)");
      ctx.fillStyle = topShade;
      ctx.fillRect(0, 0, width, height);

      const spotlight = ctx.createRadialGradient(
        width * 0.52,
        height * 0.53,
        60,
        width * 0.52,
        height * 0.53,
        420
      );
      spotlight.addColorStop(0, "rgba(255, 222, 160, 0.18)");
      spotlight.addColorStop(0.4, "rgba(255, 200, 120, 0.07)");
      spotlight.addColorStop(1, "rgba(255, 180, 100, 0)");
      ctx.fillStyle = spotlight;
      ctx.fillRect(0, 0, width, height);

      return;
    }

    const sky = ctx.createLinearGradient(0, 0, 0, height);
    sky.addColorStop(0, "#1a2036");
    sky.addColorStop(0.48, "#2b3554");
    sky.addColorStop(1, "#2a281d");
    ctx.fillStyle = sky;
    ctx.fillRect(0, 0, width, height);

    const floorY = this.getFloorY(height);

    const floorGrad = ctx.createLinearGradient(0, floorY, 0, height);
    floorGrad.addColorStop(0, "#5a4126");
    floorGrad.addColorStop(1, "#24160f");
    ctx.fillStyle = floorGrad;
    ctx.fillRect(0, floorY, width, height - floorY);

    for (let i = 0; i < 18; i++) {
      const yy = floorY + i * 12;
      ctx.strokeStyle = `rgba(255,255,255,${0.02 + (i % 2) * 0.015})`;
      ctx.beginPath();
      ctx.moveTo(0, yy);
      ctx.lineTo(width, yy);
      ctx.stroke();
    }
  }

  private drawArenaSpace(
    ctx: CanvasRenderingContext2D,
    width: number,
    height: number
  ) {
    const floorY = this.getFloorY(height);

    const battleGlow = ctx.createRadialGradient(
      width * 0.52,
      floorY - 24,
      20,
      width * 0.52,
      floorY - 24,
      320
    );
    battleGlow.addColorStop(0, "rgba(255, 231, 180, 0.18)");
    battleGlow.addColorStop(0.55, "rgba(255, 196, 120, 0.06)");
    battleGlow.addColorStop(1, "rgba(255, 196, 120, 0)");
    ctx.fillStyle = battleGlow;
    ctx.beginPath();
    ctx.ellipse(width * 0.52, floorY - 18, 360, 120, 0, 0, Math.PI * 2);
    ctx.fill();

    ctx.strokeStyle = "rgba(255, 240, 210, 0.08)";
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.ellipse(width * 0.52, floorY - 8, 310, 85, 0, 0, Math.PI * 2);
    ctx.stroke();
  }

  private drawHeader(
    ctx: CanvasRenderingContext2D,
    width: number
  ) {
    const panelW = 420;
    const panelH = 76;
    const x = width / 2 - panelW / 2;
    const y = 24;

    this.drawPanel(ctx, x, y, panelW, panelH, {
      radius: 22,
      top: "#6f3d22",
      bottom: "#341b11",
      border: "#f0bf75",
      glow: "rgba(255, 190, 100, 0.18)",
    });

    ctx.save();
    ctx.textAlign = "center";
    ctx.textBaseline = "middle";

    ctx.shadowColor = "rgba(0,0,0,0.8)";
    ctx.shadowBlur = 6;
    ctx.shadowOffsetY = 3;

    ctx.fillStyle = "#ffe6b6";
    ctx.font = "bold 30px Georgia";
    ctx.fillText("MOVE TEST ARENA", x + panelW / 2, y + 28);

    ctx.shadowBlur = 0;
    ctx.shadowOffsetY = 0;
    ctx.fillStyle = "#ffd27a";
    ctx.font = "bold 15px Arial";
    ctx.fillText("Visual animation preview", x + panelW / 2, y + 54);
    ctx.restore();
  }

  private drawBattleInfoPanel(
    ctx: CanvasRenderingContext2D,
    width: number,
    height: number
  ) {
    const x = 24;
    const y = height - 220;
    const w = width - 48;
    const h = 190;

    this.drawPanel(ctx, x, y, w, h, {
      radius: 20,
      top: "#59311c",
      bottom: "#26130b",
      border: "#dfaa66",
      glow: "rgba(255, 184, 90, 0.14)",
    });

    const selectedMove = this.getSelectedMove();
    const moveName = selectedMove?.name ?? "NO MOVES";
    const moveId = selectedMove?.id ?? "N/A";

    const selectedCondition = this.getSelectedCondition();
    const conditionName = selectedCondition?.name ?? "NO CONDITIONS";
    const conditionId = selectedCondition?.id ?? "N/A";
    const conditionActive = this.selectedConditionIsActive();

    ctx.save();
    ctx.textAlign = "left";
    ctx.textBaseline = "top";

    ctx.fillStyle = "#fff0cf";
    ctx.font = "bold 20px Georgia";
    ctx.fillText("Battle Animation Lab", x + 20, y + 14);

    ctx.fillStyle = "#f8d189";
    ctx.font = "bold 12px Arial";
    ctx.fillText(
      "Cycle through every registered move and condition and preview them live",
      x + 20,
      y + 42
    );

    ctx.fillStyle = "#ffd56a";
    ctx.font = "bold 13px Arial";
    ctx.fillText("CURRENT MOVE", x + 20, y + 72);

    ctx.fillStyle = "#fff5dd";
    ctx.font = "bold 18px Georgia";
    ctx.fillText(moveName.toUpperCase(), x + 20, y + 90);

    ctx.fillStyle = "#d9ab68";
    ctx.font = "bold 12px Arial";
    ctx.fillText(`ID: ${moveId}`, x + 20, y + 116);

    ctx.fillStyle = "#9bd0ff";
    ctx.font = "bold 13px Arial";
    ctx.fillText("CURRENT CONDITION", x + 20, y + 138);

    ctx.fillStyle = "#eef7ff";
    ctx.font = "bold 18px Georgia";
    ctx.fillText(conditionName.toUpperCase(), x + 20, y + 156);

    ctx.fillStyle = "#8fc5f2";
    ctx.font = "bold 12px Arial";
    ctx.fillText(`ID: ${conditionId}`, x + 260, y + 156);

    ctx.textAlign = "right";
    ctx.fillStyle = "rgba(255, 234, 190, 0.9)";
    ctx.font = "bold 12px Arial";
    ctx.fillText(
      `${this.selectedMoveIndex + 1}/${Math.max(this.availableMoves.length, 1)}`,
      x + w - 20,
      y + 18
    );

    ctx.fillStyle = "#cfe6ff";
    ctx.font = "bold 12px Arial";
    ctx.fillText(
      this.conditionOnPlayer ? "CONDITION TARGET: PLAYER" : "CONDITION TARGET: ENEMY",
      x + w - 20,
      y + 138
    );

    ctx.fillStyle = conditionActive ? "#aef5c4" : "#f1be9e";
    ctx.font = "bold 12px Arial";
    ctx.fillText(
      conditionActive ? "SELECTED CONDITION: ACTIVE" : "SELECTED CONDITION: INACTIVE",
      x + w - 20,
      y + 156
    );

    ctx.restore();
  }

  private drawMoveSelector(ctx: CanvasRenderingContext2D) {
    const selectedMove = this.getSelectedMove();
    const moveName = selectedMove?.name ?? "No Moves Found";
    const canSwap = !this.activeMoveAnimation && this.availableMoves.length > 1;

    this.drawPanel(
      ctx,
      this.moveCardBounds.x,
      this.moveCardBounds.y,
      this.moveCardBounds.width,
      this.moveCardBounds.height,
      {
        radius: 18,
        top: "#714326",
        bottom: "#30170d",
        border: "#efbe78",
        glow: "rgba(255, 190, 90, 0.12)",
      }
    );

    ctx.save();
    ctx.textAlign = "center";
    ctx.textBaseline = "middle";

    ctx.fillStyle = "#ffd98d";
    ctx.font = "bold 13px Arial";
    ctx.fillText(
      this.activeMoveAnimation ? "MOVE LOCKED DURING ANIMATION" : "SELECT MOVE",
      this.moveCardBounds.x + this.moveCardBounds.width / 2,
      this.moveCardBounds.y + 20
    );

    ctx.fillStyle = "#fff3d8";
    ctx.font = "bold 20px Georgia";
    ctx.fillText(
      moveName.toUpperCase(),
      this.moveCardBounds.x + this.moveCardBounds.width / 2,
      this.moveCardBounds.y + 54
    );
    ctx.restore();

    this.drawArrowButton(
      ctx,
      this.prevMoveBounds,
      "<",
      this.hoveringPrevMove,
      canSwap
    );
    this.drawArrowButton(
      ctx,
      this.nextMoveBounds,
      ">",
      this.hoveringNextMove,
      canSwap
    );
  }

  private drawConditionSelector(ctx: CanvasRenderingContext2D) {
    const selectedCondition = this.getSelectedCondition();
    const conditionName = selectedCondition?.name ?? "No Conditions Found";
    const canSwap = this.availableConditions.length > 1;

    this.drawPanel(
      ctx,
      this.conditionCardBounds.x,
      this.conditionCardBounds.y,
      this.conditionCardBounds.width,
      this.conditionCardBounds.height,
      {
        radius: 18,
        top: "#2f4e7d",
        bottom: "#13233d",
        border: "#94c7ff",
        glow: "rgba(120, 185, 255, 0.12)",
      }
    );

    ctx.save();
    ctx.textAlign = "center";
    ctx.textBaseline = "middle";

    ctx.fillStyle = "#9ed0ff";
    ctx.font = "bold 13px Arial";
    ctx.fillText(
      "SELECT CONDITION",
      this.conditionCardBounds.x + this.conditionCardBounds.width / 2,
      this.conditionCardBounds.y + 20
    );

    ctx.fillStyle = "#eef7ff";
    ctx.font = "bold 20px Georgia";
    ctx.fillText(
      conditionName.toUpperCase(),
      this.conditionCardBounds.x + this.conditionCardBounds.width / 2,
      this.conditionCardBounds.y + 54
    );
    ctx.restore();

    this.drawArrowButton(
      ctx,
      this.prevConditionBounds,
      "<",
      this.hoveringPrevCondition,
      canSwap
    );
    this.drawArrowButton(
      ctx,
      this.nextConditionBounds,
      ">",
      this.hoveringNextCondition,
      canSwap
    );
  }

  private drawArrowButton(
    ctx: CanvasRenderingContext2D,
    bounds: { x: number; y: number; width: number; height: number },
    label: string,
    isHot: boolean,
    enabled: boolean
  ) {
    const top = !enabled ? "#4a2a18" : isHot ? "#a66534" : "#7d4a28";
    const bottom = !enabled ? "#24120b" : "#341b10";
    const border = !enabled ? "#6f4a2a" : "#f0bf75";

    this.drawPanel(ctx, bounds.x, bounds.y, bounds.width, bounds.height, {
      radius: 16,
      top,
      bottom,
      border,
      glow: enabled && isHot ? "rgba(255, 201, 120, 0.18)" : "rgba(0,0,0,0)",
    });

    ctx.save();
    ctx.textAlign = "center";
    ctx.textBaseline = "middle";
    ctx.shadowColor = "rgba(0,0,0,0.8)";
    ctx.shadowBlur = 4;
    ctx.shadowOffsetY = 2;
    ctx.fillStyle = enabled ? "#fff1cf" : "#8c6a4a";
    ctx.font = "bold 28px Georgia";
    ctx.fillText(
      label,
      bounds.x + bounds.width / 2,
      bounds.y + bounds.height / 2 + 1
    );
    ctx.restore();
  }

  private drawAttackButton(ctx: CanvasRenderingContext2D) {
    const isHot = this.hoveringAttack;
    const isFlashing = this.attackFlashTimer > 0;
    const isLocked = !!this.activeMoveAnimation;
    const selectedMove = this.getSelectedMove();

    const { x, y, width, height } = this.attackBounds;

    let top = "#a64f27";
    let bottom = "#5b1e12";
    let border = "#ffcf84";
    let textColor = "#fff4df";
    let glow = "rgba(255, 140, 70, 0.16)";

    if (isLocked) {
      top = "#5a2d22";
      bottom = "#2a120d";
      border = "#8d6d54";
      textColor = "#c9b09d";
      glow = "rgba(0,0,0,0)";
    } else if (isFlashing) {
      top = "#d26c32";
      bottom = "#7f2514";
      border = "#fff0b5";
      textColor = "#ffffff";
      glow = "rgba(255, 200, 130, 0.24)";
    } else if (isHot) {
      top = "#bf6230";
      bottom = "#722312";
      border = "#ffe09f";
      textColor = "#fff8ea";
      glow = "rgba(255, 185, 100, 0.22)";
    }

    this.drawPanel(ctx, x, y, width, height, {
      radius: 20,
      top,
      bottom,
      border,
      glow,
    });

    ctx.save();
    ctx.textAlign = "center";
    ctx.textBaseline = "middle";
    ctx.shadowColor = "rgba(0,0,0,0.85)";
    ctx.shadowBlur = 5;
    ctx.shadowOffsetY = 3;

    ctx.fillStyle = textColor;
    ctx.font = "bold 24px Georgia";
    ctx.fillText(
      isLocked ? "ANIMATING..." : "ATTACK",
      x + width / 2,
      y + 28
    );

    ctx.shadowBlur = 0;
    ctx.shadowOffsetY = 0;
    ctx.fillStyle = isLocked ? "#b89982" : "#ffd48b";
    ctx.font = "bold 12px Arial";
    ctx.fillText(
      selectedMove ? selectedMove.name.toUpperCase() : "NO MOVE SELECTED",
      x + width / 2,
      y + 54
    );
    ctx.restore();
  }

  private drawSwapAttackSideButton(ctx: CanvasRenderingContext2D) {
    const isHot = this.hoveringSwapAttackSide;
    const isLocked = !!this.activeMoveAnimation;

    const { x, y, width, height } = this.swapAttackSideBounds;

    let top = "#6b4aa8";
    let bottom = "#2d1a4f";
    let border = "#d8c1ff";
    let textColor = "#f7f1ff";
    let glow = "rgba(190, 150, 255, 0.16)";

    if (isLocked) {
      top = "#4b415a";
      bottom = "#221b2d";
      border = "#8d84a0";
      textColor = "#c9c1d6";
      glow = "rgba(0,0,0,0)";
    } else if (isHot) {
      top = "#7a57bc";
      bottom = "#362060";
      border = "#eadbff";
      textColor = "#ffffff";
      glow = "rgba(210, 180, 255, 0.22)";
    }

    this.drawPanel(ctx, x, y, width, height, {
      radius: 20,
      top,
      bottom,
      border,
      glow,
    });

    ctx.save();
    ctx.textAlign = "center";
    ctx.textBaseline = "middle";
    ctx.shadowColor = "rgba(0,0,0,0.85)";
    ctx.shadowBlur = 5;
    ctx.shadowOffsetY = 3;

    ctx.fillStyle = textColor;
    ctx.font = "bold 18px Georgia";
    ctx.fillText(
      isLocked ? "SIDE LOCKED" : "SWAP ATTACK SIDE",
      x + width / 2,
      y + 24
    );

    ctx.shadowBlur = 0;
    ctx.shadowOffsetY = 0;
    ctx.fillStyle = isLocked ? "#b8b0c8" : "#e9dcff";
    ctx.font = "bold 12px Arial";
    ctx.fillText(
      this.attackFromPlayer ? "PLAYER → ENEMY" : "ENEMY → PLAYER",
      x + width / 2,
      y + 48
    );

    ctx.restore();
  }

  private drawSwapConditionSideButton(ctx: CanvasRenderingContext2D) {
    const isHot = this.hoveringSwapConditionSide;
    const { x, y, width, height } = this.swapConditionSideBounds;

    let top = "#4b83b8";
    let bottom = "#1d3557";
    let border = "#c9e6ff";
    let textColor = "#f4fbff";
    let glow = "rgba(140, 210, 255, 0.16)";

    if (isHot) {
      top = "#5b95cd";
      bottom = "#22406a";
      border = "#e2f2ff";
      textColor = "#ffffff";
      glow = "rgba(170, 225, 255, 0.22)";
    }

    this.drawPanel(ctx, x, y, width, height, {
      radius: 20,
      top,
      bottom,
      border,
      glow,
    });

    ctx.save();
    ctx.textAlign = "center";
    ctx.textBaseline = "middle";
    ctx.shadowColor = "rgba(0,0,0,0.85)";
    ctx.shadowBlur = 5;
    ctx.shadowOffsetY = 3;

    ctx.fillStyle = textColor;
    ctx.font = "bold 18px Georgia";
    ctx.fillText("SWAP CONDITION SIDE", x + width / 2, y + 24);

    ctx.shadowBlur = 0;
    ctx.shadowOffsetY = 0;
    ctx.fillStyle = "#dff2ff";
    ctx.font = "bold 12px Arial";
    ctx.fillText(
      this.conditionOnPlayer ? "TARGETING PLAYER" : "TARGETING ENEMY",
      x + width / 2,
      y + 48
    );
    ctx.restore();
  }

  private drawToggleConditionButton(ctx: CanvasRenderingContext2D) {
    const selectedCondition = this.getSelectedCondition();
    const isActive = this.selectedConditionIsActive();

    const isHot = this.hoveringToggleCondition;
    const isFlashing = this.conditionFlashTimer > 0;

    const { x, y, width, height } = this.toggleConditionBounds;

    let top = isActive ? "#2f8b54" : "#365d93";
    let bottom = isActive ? "#17432a" : "#182b47";
    let border = isActive ? "#b8f1c8" : "#b9dcff";
    let textColor = "#f6fffb";
    let glow = isActive
      ? "rgba(140, 255, 180, 0.18)"
      : "rgba(120, 190, 255, 0.16)";

    if (isFlashing) {
      top = isActive ? "#3faa68" : "#4677bc";
      bottom = isActive ? "#1a4f31" : "#1c3354";
      glow = isActive
        ? "rgba(170, 255, 200, 0.24)"
        : "rgba(170, 215, 255, 0.24)";
    } else if (isHot) {
      top = isActive ? "#379a60" : "#4270b0";
      bottom = isActive ? "#19502f" : "#19304f";
    }

    this.drawPanel(ctx, x, y, width, height, {
      radius: 20,
      top,
      bottom,
      border,
      glow,
    });

    ctx.save();
    ctx.textAlign = "center";
    ctx.textBaseline = "middle";
    ctx.shadowColor = "rgba(0,0,0,0.85)";
    ctx.shadowBlur = 5;
    ctx.shadowOffsetY = 3;

    ctx.fillStyle = textColor;
    ctx.font = "bold 20px Georgia";
    ctx.fillText(
      isActive ? "STOP CONDITION" : "START CONDITION",
      x + width / 2,
      y + 28
    );

    ctx.shadowBlur = 0;
    ctx.shadowOffsetY = 0;
    ctx.fillStyle = isActive ? "#d2ffe0" : "#dcebff";
    ctx.font = "bold 12px Arial";
    ctx.fillText(
      selectedCondition
        ? selectedCondition.name.toUpperCase()
        : "NO CONDITION SELECTED",
      x + width / 2,
      y + 52
    );
    ctx.restore();
  }

  private drawBackButton(ctx: CanvasRenderingContext2D) {
    const isHot = this.hoveringBack;
    const { x, y, width, height } = this.backBounds;

    this.drawPanel(ctx, x, y, width, height, {
      radius: 16,
      top: isHot ? "#93603b" : "#724326",
      bottom: "#2e180e",
      border: isHot ? "#ffe1a3" : "#d4a16a",
      glow: isHot ? "rgba(255, 190, 90, 0.14)" : "rgba(0,0,0,0)",
    });

    ctx.save();
    ctx.textAlign = "center";
    ctx.textBaseline = "middle";
    ctx.shadowColor = "rgba(0,0,0,0.8)";
    ctx.shadowBlur = 3;
    ctx.shadowOffsetY = 2;
    ctx.fillStyle = isHot ? "#fff4da" : "#f4e0be";
    ctx.font = "bold 20px Georgia";
    ctx.fillText("Back", x + width / 2, y + height / 2);
    ctx.restore();
  }

  private drawShadow(
    ctx: CanvasRenderingContext2D,
    x: number,
    y: number,
    rx: number,
    ry: number,
    alpha = 0.35
  ) {
    ctx.save();
    const gradient = ctx.createRadialGradient(x, y, 0, x, y, rx);
    gradient.addColorStop(0, `rgba(20, 15, 10, ${alpha})`);
    gradient.addColorStop(0.65, `rgba(40, 30, 20, ${alpha * 0.45})`);
    gradient.addColorStop(1, "rgba(0,0,0,0)");

    ctx.fillStyle = gradient;
    ctx.translate(x, y);
    ctx.scale(1, ry / rx);
    ctx.beginPath();
    ctx.arc(0, 0, rx, 0, Math.PI * 2);
    ctx.fill();
    ctx.restore();
  }

private drawMonsterImage(
  ctx: CanvasRenderingContext2D,
  image: HTMLImageElement,
  loaded: boolean,
  centerX: number,
  baseY: number,
  targetHeight: number,
  bobSpeed: number,
  bobAmount: number,
  shadowAlpha: number,
  shadowWidthScale: number,
  shadowHeightScale: number,
  hitTimer: number
) {
  if (!loaded) return;

  const scale = targetHeight / image.height;
  const drawW = image.width * scale;
  const drawH = image.height * scale;

  const idleY = Math.sin(this.time * bobSpeed) * bobAmount;
  const idleX = Math.sin(this.time * (bobSpeed * 0.58)) * (bobAmount * 0.55);

  const footRootOffset = drawH * 0.33;

  let shakeX = 0;
  let shakeY = 0;

  if (hitTimer > 0) {
    const shakeStrength = 6 * (hitTimer / 0.18);
    shakeX = (Math.random() - 0.5) * shakeStrength;
    shakeY = (Math.random() - 0.5) * shakeStrength;
  }

  const drawX = centerX - drawW / 2 + idleX + shakeX;
  const drawY = baseY - drawH + footRootOffset + idleY + shakeY;

  this.drawShadow(
    ctx,
    centerX + idleX * 0.15,
    baseY - drawH * 0.035,
    drawW * shadowWidthScale,
    drawH * shadowHeightScale,
    shadowAlpha
  );

  if (hitTimer <= 0) {
    ctx.drawImage(image, drawX, drawY, drawW, drawH);
    return;
  }

  const tempCanvas = document.createElement("canvas");
  tempCanvas.width = Math.ceil(drawW);
  tempCanvas.height = Math.ceil(drawH);
  const tempCtx = tempCanvas.getContext("2d");

  if (!tempCtx) {
    ctx.drawImage(image, drawX, drawY, drawW, drawH);
    return;
  }

  tempCtx.drawImage(image, 0, 0, drawW, drawH);

  tempCtx.globalCompositeOperation = "source-atop";
  tempCtx.fillStyle = `rgba(255, 70, 70, ${0.38 * (hitTimer / 0.18)})`;
  tempCtx.fillRect(0, 0, drawW, drawH);

  ctx.drawImage(tempCanvas, drawX, drawY);
}

  draw(ctx: CanvasRenderingContext2D) {
    const { width, height } = ctx.canvas;

    this.attackBounds.width = 250;
    this.attackBounds.height = 68;
    this.attackBounds.x = width / 2 - this.attackBounds.width / 2;
    this.attackBounds.y = height - 80;

    this.swapAttackSideBounds.width = 250;
    this.swapAttackSideBounds.height = 68;
    this.swapAttackSideBounds.x =
      width * 0.18 - this.swapAttackSideBounds.width / 2;
    this.swapAttackSideBounds.y = height - 80;

    this.moveCardBounds.width = 340;
    this.moveCardBounds.height = 78;
    this.moveCardBounds.x = width * 0.18 - this.moveCardBounds.width / 2;
    this.moveCardBounds.y = height - 180;

    this.prevMoveBounds.width = 56;
    this.prevMoveBounds.height = 56;
    this.prevMoveBounds.x = this.moveCardBounds.x - 72;
    this.prevMoveBounds.y = this.moveCardBounds.y + 11;

    this.nextMoveBounds.width = 56;
    this.nextMoveBounds.height = 56;
    this.nextMoveBounds.x = this.moveCardBounds.x + this.moveCardBounds.width + 16;
    this.nextMoveBounds.y = this.moveCardBounds.y + 11;

    this.conditionCardBounds.width = 340;
    this.conditionCardBounds.height = 78;
    this.conditionCardBounds.x = width * 0.82 - this.conditionCardBounds.width / 2;
    this.conditionCardBounds.y = height - 180;

    this.prevConditionBounds.width = 56;
    this.prevConditionBounds.height = 56;
    this.prevConditionBounds.x = this.conditionCardBounds.x - 72;
    this.prevConditionBounds.y = this.conditionCardBounds.y + 11;

    this.nextConditionBounds.width = 56;
    this.nextConditionBounds.height = 56;
    this.nextConditionBounds.x =
      this.conditionCardBounds.x + this.conditionCardBounds.width + 16;
    this.nextConditionBounds.y = this.conditionCardBounds.y + 11;

    this.toggleConditionBounds.width = 250;
    this.toggleConditionBounds.height = 68;
    this.toggleConditionBounds.x = width * 0.82 - this.toggleConditionBounds.width / 2;
    this.toggleConditionBounds.y = height - 80;

    this.swapConditionSideBounds.width = 250;
    this.swapConditionSideBounds.height = 68;
    this.swapConditionSideBounds.x = width * 0.82 - this.swapConditionSideBounds.width / 2;
    this.swapConditionSideBounds.y = height - 260;

    this.drawBackground(ctx, width, height);
    this.drawArenaSpace(ctx, width, height);
    this.drawHeader(ctx, width);

    const floorY = this.getFloorY(height);
    const player = this.getPlayerAnchor(width, height);
    const enemy = this.getEnemyAnchor(width, height);

    const hideUser = !!this.activeMoveAnimation?.shouldHideUser;

    ctx.fillStyle = "rgba(255, 247, 225, 0.06)";
    ctx.beginPath();
    ctx.ellipse(player.x, floorY + 18, 150, 36, 0, 0, Math.PI * 2);
    ctx.fill();

    ctx.fillStyle = "rgba(255, 247, 225, 0.045)";
    ctx.beginPath();
    ctx.ellipse(enemy.x, floorY - 50, 90, 24, 0, 0, Math.PI * 2);
    ctx.fill();

    const hidePlayerMonster = hideUser && this.attackFromPlayer;
    const hideEnemyMonster = hideUser && !this.attackFromPlayer;

    if (!hidePlayerMonster) {
      this.drawMonsterImage(
        ctx,
        this.playerImage,
        this.playerLoaded,
        player.x,
        player.y,
        352,
        1.9,
        5,
        0.30,
        0.28,
        0.075,
        this.playerHitTimer
      );
    }

    if (!hideEnemyMonster) {
      this.drawMonsterImage(
        ctx,
        this.enemyImage,
        this.enemyLoaded,
        enemy.x,
        enemy.y,
        206,
        1.25,
        2.5,
        0.18,
        0.30,
        0.08,
        this.enemyHitTimer
      );
    }
    drawConditions(ctx, this.playerConditions);
    drawConditions(ctx, this.enemyConditions);

    ctx.save();
    ctx.textAlign = "center";
    ctx.textBaseline = "bottom";

    ctx.shadowColor = "rgba(0,0,0,0.8)";
    ctx.shadowBlur = 4;
    ctx.shadowOffsetY = 2;

    ctx.fillStyle = "#fff0cf";
    ctx.font = "bold 20px Georgia";
    ctx.fillText("PLAYER", player.x, floorY - 326);

    ctx.fillStyle = "#ffe1af";
    ctx.font = "bold 18px Georgia";
    ctx.fillText("ENEMY", enemy.x, floorY - 262);
    ctx.restore();

    drawMove(ctx, this.activeMoveAnimation);

    this.drawBattleInfoPanel(ctx, width, height);
    this.drawMoveSelector(ctx);
    this.drawConditionSelector(ctx);
    this.drawSwapAttackSideButton(ctx);
    this.drawAttackButton(ctx);
    this.drawSwapConditionSideButton(ctx);
    this.drawToggleConditionButton(ctx);
    this.drawBackButton(ctx);
  }
}
