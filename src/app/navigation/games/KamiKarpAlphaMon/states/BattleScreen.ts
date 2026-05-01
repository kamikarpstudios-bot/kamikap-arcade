import { StateManager } from "../systems/StateManager";
import { monsterRegistry } from "../Monsters/monsterRegistry";
import { drawMonster } from "../Monsters/drawMonster";
import { CampaignScreen } from "./CampaignScreen";
import {
  createSummonAnimation,
  SummonAnimationInstance,
} from "../Animations/summoning";
import { moveRegistry } from "../Moves/movesRegistry";
import {
  MoveId,
  MonsterId,
  EquippedMoveLoadout,
} from "../systems/StateManager";
import { monsterBattleStats } from "../Monsters/monsterBattleStats";
import {
  createFaintAnimation,
  FaintAnimationInstance,
} from "../Animations/fainting";
import { BattleIntroCinematic } from "../Animations/battleIntroCinematic";
import { drawGirlTrainer } from "../NPC's/trainers/girlTrainer";

type BattleMenuButton = {
  label: string;
  x: number;
  y: number;
  width: number;
  height: number;
  hovered: boolean;
  moveId?: MoveId | null;
};

type TeamSlotButton = {
  slotIndex: number;
  x: number;
  y: number;
  width: number;
  height: number;
  hovered: boolean;
};

type BattleMoveAnimationInstance = {
  update: (dt: number) => void;
  draw: (ctx: CanvasRenderingContext2D) => void;
  isDone: () => boolean;
  shouldHideUser?: boolean;
  drawUserOverride?: (ctx: CanvasRenderingContext2D) => void;
  getScreenShake?: () => number;
};

export class BattleScreen {
  manager: StateManager;

  teamSlots: (MonsterId | null)[];
  activeMonsterIndex = 0;
  enemyMonsterId: MonsterId;

  state: "INTRO" | "ARRIVAL" | "MENU" | "ATTACK" | "RESULT" = "INTRO";
  uiMode: "MAIN" | "MOVES" | "ITEMS" | "SWAP" = "MAIN";
  time = 0;
  arrivalTimer = 0;
  arrivalDuration = 1.12;

  mouseX = 0;
  mouseY = 0;

  playerHitTimer = 0;
  enemyHitTimer = 0;

  playerMaxHp = 100;
  playerHp = 100;

  enemyMaxHp = 100;
  enemyHp = 100;

  playerStamina = 100;
  playerMaxStamina = 100;

  enemyStamina = 100;
  enemyMaxStamina = 100;

  bgImage: HTMLImageElement;
  bgLoaded = false;

  // =========================================================
  // SUMMON / SWAP STATE
  // =========================================================
  playerSwapAnimation: SummonAnimationInstance | null = null;
  playerIntroAnimation: SummonAnimationInstance | null = null;
  enemyIntroAnimation: SummonAnimationInstance | null = null;
  pendingPlayerSwapIndex: number | null = null;
  playerSwapFromMonsterId: MonsterId | null = null;
  playerSwapToMonsterId: MonsterId | null = null;

  // =========================================================
  // MOVE ANIMATION STATE
  // =========================================================
  currentMoveAnimation: BattleMoveAnimationInstance | null = null;
  currentMoveSide: "PLAYER" | "ENEMY" = "PLAYER";
  lastUsedMoveId: MoveId | null = null;

  pendingPlayerMoveId: MoveId | null = null;
  pendingEnemyMoveId: MoveId | null = null;

  playerFaintAnimation: FaintAnimationInstance | null = null;
  enemyFaintAnimation: FaintAnimationInstance | null = null;
  faintedSide: "PLAYER" | "ENEMY" | null = null;
  faintedMonsters = new Set<MonsterId>();

  turnQueue: Array<{
    side: "PLAYER" | "ENEMY";
    moveId: MoveId;
  }> = [];

  turnInProgress = false;

  monsterImageCache: Partial<
    Record<
      MonsterId,
      {
        image: HTMLImageElement;
        loaded: boolean;
      }
    >
  > = {};

  attackButton: BattleMenuButton = {
    label: "ATTACK",
    x: 0,
    y: 0,
    width: 196,
    height: 64,
    hovered: false,
  };

  itemsButton: BattleMenuButton = {
    label: "ITEMS",
    x: 0,
    y: 0,
    width: 196,
    height: 64,
    hovered: false,
  };

  swapButton: BattleMenuButton = {
    label: "SWAP",
    x: 0,
    y: 0,
    width: 196,
    height: 64,
    hovered: false,
  };

  runButton: BattleMenuButton = {
    label: "RUN",
    x: 0,
    y: 0,
    width: 196,
    height: 64,
    hovered: false,
  };

  backButton: BattleMenuButton = {
    label: "BACK",
    x: 24,
    y: 24,
    width: 136,
    height: 48,
    hovered: false,
  };

  subMenuBackButton: BattleMenuButton = {
    label: "BACK",
    x: 0,
    y: 0,
    width: 196,
    height: 64,
    hovered: false,
  };

  teamSlotButtons: TeamSlotButton[] = [];
  moveButtons: BattleMenuButton[] = [];
  itemButtons: BattleMenuButton[] = [];

  constructor(
    manager: StateManager,
    teamSlots: (MonsterId | null)[],
    enemyMonsterId: MonsterId
  ) {
    this.manager = manager;
    this.teamSlots = [...teamSlots];

    const allowedEnemyMonsterIds = Object.keys(
      this.manager.monsterLoadouts
    ) as MonsterId[];

    this.enemyMonsterId = allowedEnemyMonsterIds.includes(enemyMonsterId)
      ? enemyMonsterId
      : allowedEnemyMonsterIds[0];

    const enemyStats = monsterBattleStats[this.enemyMonsterId];

    if (enemyStats) {
      this.enemyMaxHp = enemyStats.maxHp;
      this.enemyHp = enemyStats.maxHp;
      this.enemyMaxStamina = enemyStats.maxStamina;
      this.enemyStamina = enemyStats.maxStamina;
    }

    const firstFilledIndex = this.teamSlots.findIndex((slot) => slot !== null);
    this.activeMonsterIndex = firstFilledIndex >= 0 ? firstFilledIndex : 0;
    this.syncActivePlayerHpFromStats();

    this.bgImage = new Image();
    this.bgImage.src = "/games/alphamon/town-battle.png";
    this.bgImage.onload = () => {
      this.bgLoaded = true;
      this.introCinematic = new BattleIntroCinematic();
    };

    for (const slot of this.teamSlots) {
      if (!slot) continue;

      this.ensureMonsterImage(slot);

      const battleId = this.getPlayerBattleMonsterId(slot);
      if (battleId) {
        this.ensureMonsterImage(battleId);
      }
    }

    this.ensureMonsterImage(this.enemyMonsterId);

    window.addEventListener("mousemove", this.handleMouseMove);
    window.addEventListener("click", this.handleClick);
  }

  destroy() {
    window.removeEventListener("mousemove", this.handleMouseMove);
    window.removeEventListener("click", this.handleClick);
  }

  private introCinematic: BattleIntroCinematic | null = null;

  private getActiveMonsterLoadout(): EquippedMoveLoadout | null {
    const monsterId = this.activeMonsterId;
    if (!monsterId) return null;
    return this.manager.monsterLoadouts[monsterId] ?? null;
  }

  private syncActivePlayerHpFromStats() {
    const activePlayerMonsterId = this.teamSlots[this.activeMonsterIndex];
    if (!activePlayerMonsterId) return;

    const playerStats = monsterBattleStats[activePlayerMonsterId];
    if (!playerStats) return;

    this.playerMaxHp = playerStats.maxHp;
    this.playerHp = playerStats.maxHp;
    this.playerMaxStamina = playerStats.maxStamina;
    this.playerStamina = playerStats.maxStamina;
  }

  private getMoveSpeed(moveId: MoveId | null) {
    if (!moveId) return 0;
    return moveRegistry[moveId]?.speed ?? 0;
  }

  private getMovePower(moveId: MoveId | null) {
    if (!moveId) return 0;
    return moveRegistry[moveId]?.power ?? 0;
  }

  private getMoveStaminaCost(moveId: MoveId | null) {
    if (!moveId) return 0;
    return moveRegistry[moveId]?.staminaCost ?? 0;
  }

  private clamp(v: number, min: number, max: number) {
    return Math.max(min, Math.min(max, v));
  }

  private easeOutCubic(t: number) {
    return 1 - Math.pow(1 - t, 3);
  }

  private easeOutBack(t: number) {
    const c1 = 1.70158;
    const c3 = c1 + 1;
    return 1 + c3 * Math.pow(t - 1, 3) + c1 * Math.pow(t - 1, 2);
  }

  private beginBattleArrival(canvas: HTMLCanvasElement) {
    const activeMonsterId = this.activeMonsterId;
    const playerBattleId = activeMonsterId
      ? this.getPlayerBattleMonsterId(activeMonsterId)
      : null;

    const playerSnapshot = playerBattleId
      ? this.createMonsterSnapshot(playerBattleId)
      : null;
    const enemySnapshot = this.createMonsterSnapshot(this.enemyMonsterId);

    const { width, height } = canvas;
    const player = this.getPlayerAnchor(width, height);
    const enemy = this.getEnemyAnchor(width, height);

    this.arrivalTimer = 0;
    this.playerIntroAnimation = playerSnapshot
      ? createSummonAnimation({
          rootX: player.x,
          rootY: player.effectY,
          circleOffsetY: 30,
          monsterImage: playerSnapshot.image,
          monsterWidth: playerSnapshot.width,
          monsterHeight: playerSnapshot.height,
          monsterLoaded: () => true,
          targetHeight: 255,
        })
      : null;
    this.enemyIntroAnimation = enemySnapshot
      ? createSummonAnimation({
          rootX: enemy.x,
          rootY: enemy.effectY,
          circleOffsetY: 20,
          monsterImage: enemySnapshot.image,
          monsterWidth: enemySnapshot.width,
          monsterHeight: enemySnapshot.height,
          monsterLoaded: () => true,
          targetHeight: 220,
        })
      : null;
    this.state = "ARRIVAL";
  }

  private getEnemyMoveOrder(): (MoveId | null)[] {
    const enemyLoadout = this.manager.monsterLoadouts[this.enemyMonsterId];
    if (!enemyLoadout) return [null, null, null, null, null];

    return [
      enemyLoadout.signature,
      enemyLoadout.move1,
      enemyLoadout.move2,
      enemyLoadout.move3,
      enemyLoadout.ultimate,
    ];
  }

  private getNextAvailablePlayerSwapIndex(): number | null {
    for (let i = 0; i < this.teamSlots.length; i++) {
      const monsterId = this.teamSlots[i];
      if (!monsterId) continue;
      if (i === this.activeMonsterIndex) continue;
      if (this.faintedMonsters.has(monsterId)) continue;

      return i;
    }

    return null;
  }

  private startFaint(side: "PLAYER" | "ENEMY") {
    if (this.faintedSide) return;

    this.faintedSide = side;

    if (side === "PLAYER") {
      const current = this.activeMonsterId;
      if (current) {
        this.faintedMonsters.add(current);
      }

      this.playerFaintAnimation = createFaintAnimation();
    } else {
      this.faintedMonsters.add(this.enemyMonsterId);
      this.enemyFaintAnimation = createFaintAnimation();
    }

    this.turnQueue = [];
    this.turnInProgress = false;
    this.currentMoveAnimation = null;
    this.lastUsedMoveId = null;
  }

  private resolveFaint(canvas: HTMLCanvasElement) {
    if (this.faintedSide === "PLAYER") {
      const nextIndex = this.getNextAvailablePlayerSwapIndex();

      this.playerFaintAnimation = null;
      this.faintedSide = null;

      if (nextIndex !== null) {
        this.startPlayerSwap(nextIndex, canvas);
        return;
      }

      console.log("PLAYER HAS NO MONSTERS LEFT");
      this.destroy();
      this.manager.setState(new CampaignScreen(this.manager));
      return;
    }

    if (this.faintedSide === "ENEMY") {
      this.enemyFaintAnimation = null;
      this.faintedSide = null;

      console.log("ENEMY FAINTED");
      this.destroy();
      this.manager.setState(new CampaignScreen(this.manager));
    }
  }

  private chooseEnemyMove(): MoveId | null {
    const enemyMoves = this.getEnemyMoveOrder();

    for (const moveId of enemyMoves) {
      if (!moveId) continue;

      const staminaCost = this.getMoveStaminaCost(moveId);
      if (this.enemyStamina >= staminaCost) {
        return moveId;
      }
    }

    return null;
  }

  private beginTurn(playerMoveId: MoveId, canvas: HTMLCanvasElement) {
    if (this.turnInProgress) return;

    const enemyMoveId = this.chooseEnemyMove();

    this.pendingPlayerMoveId = playerMoveId;
    this.pendingEnemyMoveId = enemyMoveId;
    this.turnQueue = [];
    this.turnInProgress = true;

    const playerSpeed = this.getMoveSpeed(playerMoveId);
    const enemySpeed = this.getMoveSpeed(enemyMoveId);

    if (enemyMoveId) {
      if (playerSpeed >= enemySpeed) {
        this.turnQueue.push({ side: "PLAYER", moveId: playerMoveId });
        this.turnQueue.push({ side: "ENEMY", moveId: enemyMoveId });
      } else {
        this.turnQueue.push({ side: "ENEMY", moveId: enemyMoveId });
        this.turnQueue.push({ side: "PLAYER", moveId: playerMoveId });
      }
    } else {
      this.turnQueue.push({ side: "PLAYER", moveId: playerMoveId });
    }

    this.startNextQueuedMove(canvas);
  }

  private startNextQueuedMove(canvas: HTMLCanvasElement) {
    if (this.currentMoveAnimation) return;

    const nextAction = this.turnQueue.shift();

    if (!nextAction) {
      this.turnInProgress = false;
      this.pendingPlayerMoveId = null;
      this.pendingEnemyMoveId = null;
      this.uiMode = "MAIN";
      return;
    }

    if (nextAction.side === "PLAYER") {
      this.startPlayerMove(nextAction.moveId, canvas);
      return;
    }

    this.startEnemyMove(nextAction.moveId, canvas);
  }

  private startEnemyMove(moveId: MoveId, canvas: HTMLCanvasElement) {
  const move = moveRegistry[moveId] as
    | {
        createAnimation?: (args: {
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
        }) => BattleMoveAnimationInstance;
      }
    | undefined;

  if (!move?.createAnimation) {
    console.warn("Enemy move has no animation:", moveId);
    this.playerHitTimer = 0.18;
    return;
  }

  const { width, height } = canvas;
  const player = this.getPlayerAnchor(width, height);
  const enemy = this.getEnemyAnchor(width, height);

  this.lastUsedMoveId = moveId;

  this.currentMoveAnimation = move.createAnimation({
    userX: enemy.x,
    userY: enemy.effectY,
    userMonsterY: enemy.monsterY,
    targetX: player.x,
    targetY: player.effectY,
    targetMonsterY: player.monsterY,
    userMonsterId: this.enemyMonsterId,
    userTargetHeight: 220,
    userFacing: -1,
    timeProvider: () => this.time,
  });

  this.currentMoveSide = "ENEMY";
}

private createMonsterSnapshot(monsterId: MonsterId): {
  image: HTMLCanvasElement;
  width: number;
  height: number;
  rootX: number;
  rootY: number;
} | null {
  const monster = monsterRegistry[monsterId];
  if (!monster) return null;

  const baseHeight = (monster as { baseHeight?: number }).baseHeight ?? 220;

  const canvas = document.createElement("canvas");
  canvas.width = 420;
  canvas.height = 420;

  const ctx = canvas.getContext("2d");
  if (!ctx) return null;

  ctx.clearRect(0, 0, canvas.width, canvas.height);
  ctx.imageSmoothingEnabled = false;

  const targetHeight = 255;
  const scale = targetHeight / baseHeight;

  // this is where the monster root actually lives inside the snapshot
  const rootX = canvas.width / 2;
  const rootY = canvas.height * 0.78;

  ctx.save();
  ctx.translate(rootX, rootY);
  ctx.scale(scale, scale);

  drawMonster(monster, {
    ctx,
    x: 0,
    y: 0,
    time: this.time,
    mouseX: 0,
    mouseY: 0,
    state: "BATTLE",
  });

  ctx.restore();

  return {
    image: canvas,
    width: canvas.width,
    height: canvas.height,
    rootX,
    rootY,
  };
}
  private getBattleMoveOrder(): (MoveId | null)[] {
    const loadout = this.getActiveMonsterLoadout();

    if (!loadout) {
      return [null, null, null, null, null];
    }

    return [
      loadout.signature,
      loadout.move1,
      loadout.move2,
      loadout.move3,
      loadout.ultimate,
    ];
  }

  private getMoveDisplayName(moveId: MoveId | null) {
    if (!moveId) return "EMPTY";

    const move = moveRegistry[moveId] as
      | { name?: string; title?: string; id?: string }
      | undefined;

    return (
      move?.name ??
      move?.title ??
      move?.id ??
      String(moveId).replace(/_/g, " ")
    );
  }

private getFloorY(height: number) {
  return height * 0.6;
}

private getPlayerAnchor(width: number, height: number) {
  const floorY = this.getFloorY(height);

  return {
    x: width * 0.34,
    monsterY: floorY - 2,
    effectY: floorY + 106,
  };
}

private getEnemyAnchor(width: number, height: number) {
  const floorY = this.getFloorY(height);

  return {
    x: width * 0.69,
    monsterY: floorY - 78,
    effectY: floorY + 18,
  };
}

  private getPlayerBattleMonsterId(
    monsterId: MonsterId | null
  ): MonsterId | null {
    if (!monsterId) return null;

    const backMonsterId = `${monsterId}_BACK` as MonsterId;
    return monsterRegistry[backMonsterId] ? backMonsterId : monsterId;
  }

  private ensureMonsterImage(monsterId: MonsterId) {
    const existing = this.monsterImageCache[monsterId];
    if (existing) return existing;

    const monster = monsterRegistry[monsterId] as
      | { imageSrc?: string }
      | undefined;

    if (!monster?.imageSrc) {
      return null;
    }

    const image = new Image();
    const entry = {
      image,
      loaded: false,
    };

    image.src = monster.imageSrc;
    image.onload = () => {
      entry.loaded = true;
    };

    this.monsterImageCache[monsterId] = entry;
    return entry;
  }

  private getMonsterBattleImage(monsterId: MonsterId) {
    return this.ensureMonsterImage(monsterId)?.image ?? null;
  }

  private isMonsterBattleImageLoaded(monsterId: MonsterId) {
    return this.ensureMonsterImage(monsterId)?.loaded ?? false;
  }

 private startPlayerMove(moveId: MoveId, canvas: HTMLCanvasElement) {
  const move = moveRegistry[moveId] as
    | {
        createAnimation?: (args: {
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
        }) => BattleMoveAnimationInstance;
      }
    | undefined;

  if (!move?.createAnimation) {
    console.warn("Move has no animation:", moveId);
    this.enemyHitTimer = 0.18;
    return;
  }

  const { width, height } = canvas;
  const player = this.getPlayerAnchor(width, height);
  const enemy = this.getEnemyAnchor(width, height);

  this.lastUsedMoveId = moveId;

  const activeMonsterId = this.activeMonsterId;
  const playerBattleId = this.getPlayerBattleMonsterId(activeMonsterId);

  this.currentMoveAnimation = move.createAnimation({
    userX: player.x,
    userY: player.effectY,
    userMonsterY: player.monsterY,
    targetX: enemy.x,
    targetY: enemy.effectY,
    targetMonsterY: enemy.monsterY,
    userMonsterId: playerBattleId,
    userTargetHeight: 255,
    userFacing: 1,
    timeProvider: () => this.time,
  });

  this.currentMoveSide = "PLAYER";
}

  private updateLayout(canvas: HTMLCanvasElement) {
    const { width, height } = canvas;

    const leftPanelX = 22;
    const leftPanelY = 112;
    const leftButtonGap = 12;

    this.attackButton.x = leftPanelX;
    this.attackButton.y = leftPanelY;

    this.itemsButton.x = leftPanelX;
    this.itemsButton.y =
      this.attackButton.y + this.attackButton.height + leftButtonGap;

    this.swapButton.x = leftPanelX;
    this.swapButton.y =
      this.itemsButton.y + this.itemsButton.height + leftButtonGap;

    this.runButton.x = leftPanelX;
    this.runButton.y =
      this.swapButton.y + this.swapButton.height + leftButtonGap;

    this.teamSlotButtons = [];

    const slotWidth = 92;
    const slotHeight = 92;
    const slotGap = 10;
    const teamStripY = height - 108;
    const totalTeamWidth = slotWidth * 6 + slotGap * 5;
    const teamStartX = width * 0.5 - totalTeamWidth / 2 + 74;

    this.subMenuBackButton.x = leftPanelX;
    this.subMenuBackButton.y = leftPanelY;

    this.moveButtons = [];
    this.itemButtons = [];

    const equippedMoves = this.getBattleMoveOrder();

    for (let i = 0; i < equippedMoves.length; i++) {
      const moveId = equippedMoves[i];
      this.moveButtons.push({
        label: this.getMoveDisplayName(moveId).toUpperCase(),
        moveId,
        x: leftPanelX,
        y: leftPanelY + (this.attackButton.height + leftButtonGap) * (i + 1),
        width: 196,
        height: 64,
        hovered: false,
      });
    }

    const itemLabels = ["POTION", "SUPER", "REVIVE", "CURE"];
    for (let i = 0; i < itemLabels.length; i++) {
      this.itemButtons.push({
        label: itemLabels[i],
        x: leftPanelX,
        y: leftPanelY + (this.attackButton.height + leftButtonGap) * (i + 1),
        width: 196,
        height: 64,
        hovered: false,
      });
    }

    for (let i = 0; i < 6; i++) {
      this.teamSlotButtons.push({
        slotIndex: i,
        x: teamStartX + i * (slotWidth + slotGap),
        y: teamStripY,
        width: slotWidth,
        height: slotHeight,
        hovered: false,
      });
    }
  }

  private isPointInRect(
    x: number,
    y: number,
    rect: { x: number; y: number; width: number; height: number }
  ) {
    return (
      x >= rect.x &&
      x <= rect.x + rect.width &&
      y >= rect.y &&
      y <= rect.y + rect.height
    );
  }

  private get activeMonsterId(): MonsterId | null {
    return this.teamSlots[this.activeMonsterIndex] ?? null;
  }

  private startPlayerSwap(targetSlotIndex: number, canvas: HTMLCanvasElement) {
    const fromMonsterId = this.activeMonsterId;
    const toMonsterId = this.teamSlots[targetSlotIndex];

    if (!fromMonsterId || !toMonsterId) return;
    if (targetSlotIndex === this.activeMonsterIndex) return;
    if (this.playerSwapAnimation) return;

    const { width, height } = canvas;
    const player = this.getPlayerAnchor(width, height);

    const fromBattleId = this.getPlayerBattleMonsterId(fromMonsterId);
    const toBattleId = this.getPlayerBattleMonsterId(toMonsterId);

    if (!fromBattleId || !toBattleId) return;

const snapshot = this.createMonsterSnapshot(toBattleId);
if (!snapshot) return;

this.pendingPlayerSwapIndex = targetSlotIndex;
this.playerSwapFromMonsterId = fromBattleId;
this.playerSwapToMonsterId = toBattleId;

this.playerSwapAnimation = createSummonAnimation({
  rootX: player.x,
rootY: player.effectY,
circleOffsetY: 30,
  monsterImage: snapshot.image,
  monsterWidth: snapshot.width,
  monsterHeight: snapshot.height,
  monsterLoaded: () => true,
  targetHeight: 255,
});

    this.uiMode = "MAIN";
  }

  handleMouseMove = (event: MouseEvent) => {
    const canvas = document.querySelector("canvas");
    if (!canvas) return;

    const rect = canvas.getBoundingClientRect();
    const scaleX = canvas.width / rect.width;
    const scaleY = canvas.height / rect.height;

    this.mouseX = (event.clientX - rect.left) * scaleX;
    this.mouseY = (event.clientY - rect.top) * scaleY;

    this.updateLayout(canvas);

    this.backButton.hovered = this.isPointInRect(
      this.mouseX,
      this.mouseY,
      this.backButton
    );
    this.attackButton.hovered = this.isPointInRect(
      this.mouseX,
      this.mouseY,
      this.attackButton
    );
    this.itemsButton.hovered = this.isPointInRect(
      this.mouseX,
      this.mouseY,
      this.itemsButton
    );
    this.swapButton.hovered = this.isPointInRect(
      this.mouseX,
      this.mouseY,
      this.swapButton
    );
    this.runButton.hovered = this.isPointInRect(
      this.mouseX,
      this.mouseY,
      this.runButton
    );

    this.subMenuBackButton.hovered = this.isPointInRect(
      this.mouseX,
      this.mouseY,
      this.subMenuBackButton
    );

    for (const button of this.moveButtons) {
      button.hovered = this.isPointInRect(this.mouseX, this.mouseY, button);
    }

    for (const button of this.itemButtons) {
      button.hovered = this.isPointInRect(this.mouseX, this.mouseY, button);
    }

    for (const slotButton of this.teamSlotButtons) {
      slotButton.hovered = this.isPointInRect(
        this.mouseX,
        this.mouseY,
        slotButton
      );
    }
  };

  handleClick = (event: MouseEvent) => {
    const canvas = document.querySelector("canvas") as HTMLCanvasElement | null;
    if (!canvas) return;

    const rect = canvas.getBoundingClientRect();
    const scaleX = canvas.width / rect.width;
    const scaleY = canvas.height / rect.height;

    const clickX = (event.clientX - rect.left) * scaleX;
    const clickY = (event.clientY - rect.top) * scaleY;

    this.mouseX = clickX;
    this.mouseY = clickY;

    this.updateLayout(canvas);

    if (this.state === "INTRO") {
      this.introCinematic?.onClick();
      return;
    }

    if (
      this.state === "ARRIVAL" ||
      this.playerSwapAnimation ||
      this.currentMoveAnimation ||
      this.playerFaintAnimation ||
      this.enemyFaintAnimation ||
      this.faintedSide
    ) {
      return;
    }

    if (this.isPointInRect(clickX, clickY, this.backButton)) {
      this.destroy();
      this.manager.setState(new CampaignScreen(this.manager));
      return;
    }

    if (this.uiMode === "MOVES") {
      if (this.isPointInRect(clickX, clickY, this.subMenuBackButton)) {
        this.uiMode = "MAIN";
        return;
      }

      for (const button of this.moveButtons) {
        if (this.isPointInRect(clickX, clickY, button)) {
          if (!button.moveId) {
            console.log("Empty move slot");
            return;
          }

          if (!this.canUseMove(button.moveId)) {
            console.log("Not enough stamina for move:", button.moveId);
            return;
          }

          console.log("Selected move id:", button.moveId);
          this.beginTurn(button.moveId, canvas);
          return;
        }
      }

      return;
    }

    if (this.uiMode === "ITEMS") {
      if (this.isPointInRect(clickX, clickY, this.subMenuBackButton)) {
        this.uiMode = "MAIN";
        return;
      }

      for (const button of this.itemButtons) {
        if (this.isPointInRect(clickX, clickY, button)) {
          console.log("Selected item:", button.label);
          this.uiMode = "MAIN";
          return;
        }
      }

      return;
    }

    if (this.uiMode === "SWAP") {
      for (const slotButton of this.teamSlotButtons) {
        if (!this.isPointInRect(clickX, clickY, slotButton)) continue;

        const monsterId = this.teamSlots[slotButton.slotIndex];
        if (!monsterId) return;
        if (slotButton.slotIndex === this.activeMonsterIndex) return;
        if (this.faintedMonsters.has(monsterId)) return;

        console.log("SWAP CLICKED SLOT:", slotButton.slotIndex, monsterId);
        this.startPlayerSwap(slotButton.slotIndex, canvas);
        return;
      }

      if (this.isPointInRect(clickX, clickY, this.swapButton)) {
        this.uiMode = "MAIN";
        return;
      }

      return;
    }

    if (this.uiMode === "MAIN") {
      if (this.isPointInRect(clickX, clickY, this.attackButton)) {
        this.uiMode = "MOVES";
        return;
      }

      if (this.isPointInRect(clickX, clickY, this.itemsButton)) {
        this.uiMode = "ITEMS";
        return;
      }

      if (this.isPointInRect(clickX, clickY, this.swapButton)) {
        this.uiMode = "SWAP";
        return;
      }

      if (this.isPointInRect(clickX, clickY, this.runButton)) {
        this.destroy();
        this.manager.setState(new CampaignScreen(this.manager));
        return;
      }
    }
  };

  update() {
    const dt = 0.016;
    this.time += dt;

    if (this.state === "INTRO") {
      if (this.introCinematic) {
        this.introCinematic.update(dt);

        if (this.introCinematic.isDone()) {
          const canvas = document.querySelector(
            "canvas"
          ) as HTMLCanvasElement | null;

          if (canvas) {
            this.beginBattleArrival(canvas);
          }
        }
      }

      return;
    }

    if (this.state === "ARRIVAL") {
      this.arrivalTimer += dt;
      this.playerIntroAnimation?.update(dt);
      this.enemyIntroAnimation?.update(dt);

      if (this.playerIntroAnimation?.isDone()) {
        this.playerIntroAnimation = null;
      }

      if (this.enemyIntroAnimation?.isDone()) {
        this.enemyIntroAnimation = null;
      }

      if (
        this.arrivalTimer >= this.arrivalDuration &&
        !this.playerIntroAnimation &&
        !this.enemyIntroAnimation
      ) {
        this.state = "MENU";
      }

      return;
    }

    if (this.playerHitTimer > 0) {
      this.playerHitTimer = Math.max(0, this.playerHitTimer - dt);
    }

    if (this.enemyHitTimer > 0) {
      this.enemyHitTimer = Math.max(0, this.enemyHitTimer - dt);
    }

    if (this.currentMoveAnimation) {
      this.currentMoveAnimation.update(dt);

      if (this.currentMoveAnimation.isDone()) {
        const move = this.lastUsedMoveId
          ? moveRegistry[this.lastUsedMoveId]
          : null;

        const movePower = move?.power ?? 0;
        const moveStaminaCost = move?.staminaCost ?? 0;

        if (this.currentMoveSide === "PLAYER") {
          this.playerStamina = Math.max(0, this.playerStamina - moveStaminaCost);
          this.enemyHp = Math.max(0, this.enemyHp - movePower);
          this.enemyHitTimer = 0.18;
        } else {
          this.enemyStamina = Math.max(0, this.enemyStamina - moveStaminaCost);
          this.playerHp = Math.max(0, this.playerHp - movePower);
          this.playerHitTimer = 0.18;
        }

        this.currentMoveAnimation = null;
        this.lastUsedMoveId = null;

        if (this.enemyHp <= 0) {
          this.enemyHp = 0;
          this.startFaint("ENEMY");
          return;
        }

        if (this.playerHp <= 0) {
          this.playerHp = 0;
          this.startFaint("PLAYER");
          return;
        }

        const canvas = document.querySelector(
          "canvas"
        ) as HTMLCanvasElement | null;
        if (canvas && this.turnInProgress) {
          this.startNextQueuedMove(canvas);
        }
      }
    }

    if (this.playerFaintAnimation) {
      this.playerFaintAnimation.update(dt);

      if (this.playerFaintAnimation.isDone()) {
        const canvas = document.querySelector(
          "canvas"
        ) as HTMLCanvasElement | null;
        if (canvas) {
          this.resolveFaint(canvas);
          return;
        }
      }
    }

    if (this.enemyFaintAnimation) {
      this.enemyFaintAnimation.update(dt);

      if (this.enemyFaintAnimation.isDone()) {
        const canvas = document.querySelector(
          "canvas"
        ) as HTMLCanvasElement | null;
        if (canvas) {
          this.resolveFaint(canvas);
          return;
        }
      }
    }

    if (this.playerSwapAnimation) {
      this.playerSwapAnimation.update(dt);

      if (this.playerSwapAnimation.isDone()) {
        if (this.pendingPlayerSwapIndex !== null) {
          this.activeMonsterIndex = this.pendingPlayerSwapIndex;
          this.syncActivePlayerHpFromStats();
        }

        this.pendingPlayerSwapIndex = null;
        this.playerSwapAnimation = null;
        this.playerSwapFromMonsterId = null;
        this.playerSwapToMonsterId = null;
      }
    }
  }

  // =========================================================
  // PIXEL / WOOD UI HELPERS
  // =========================================================

  private drawPixelRect(
    ctx: CanvasRenderingContext2D,
    x: number,
    y: number,
    width: number,
    height: number,
    color: string
  ) {
    ctx.fillStyle = color;
    ctx.fillRect(Math.round(x), Math.round(y), Math.round(width), Math.round(height));
  }

  private drawPixelFrame(
    ctx: CanvasRenderingContext2D,
    x: number,
    y: number,
    width: number,
    height: number,
    outer: string,
    inner: string,
    lip: string
  ) {
    this.drawPixelRect(ctx, x, y, width, height, outer);
    this.drawPixelRect(ctx, x + 4, y + 4, width - 8, height - 8, inner);

    this.drawPixelRect(ctx, x + 4, y + 4, width - 8, 4, lip);
    this.drawPixelRect(ctx, x + 4, y + 4, 4, height - 8, lip);

    ctx.fillStyle = "rgba(0,0,0,0.18)";
    ctx.fillRect(x + width - 8, y + 4, 4, height - 8);
    ctx.fillRect(x + 4, y + height - 8, width - 8, 4);
  }

  private drawWoodPanel(
    ctx: CanvasRenderingContext2D,
    x: number,
    y: number,
    width: number,
    height: number,
    selected = false
  ) {
    const outer = selected ? "#f0d8a8" : "#5a321d";
    const inner = selected ? "#9e6737" : "#8b5a32";
    const lip = selected ? "#ffd98a" : "#b87a45";

    this.drawPixelFrame(ctx, x, y, width, height, outer, inner, lip);

    ctx.fillStyle = "rgba(255,255,255,0.05)";
    for (let i = 0; i < height - 20; i += 12) {
      ctx.fillRect(x + 10, y + 12 + i, width - 20, 2);
    }
  }

  private drawInsetPanel(
    ctx: CanvasRenderingContext2D,
    x: number,
    y: number,
    width: number,
    height: number,
    fill = "#2e1b12"
  ) {
    this.drawPixelRect(ctx, x, y, width, height, "#1b100b");
    this.drawPixelRect(ctx, x + 4, y + 4, width - 8, height - 8, fill);
    this.drawPixelRect(ctx, x + 4, y + 4, width - 8, 4, "rgba(255,255,255,0.06)");
    this.drawPixelRect(ctx, x + 4, y + 4, 4, height - 8, "rgba(255,255,255,0.06)");
  }

  private drawPixelText(
    ctx: CanvasRenderingContext2D,
    text: string,
    x: number,
    y: number,
    color = "#fff3c4",
    size = 16,
    align: CanvasTextAlign = "left"
  ) {
    ctx.save();
    ctx.textAlign = align;
    ctx.textBaseline = "middle";
    ctx.font = `bold ${size}px monospace`;

    ctx.fillStyle = "rgba(0,0,0,0.65)";
    ctx.fillText(text, Math.round(x) + 2, Math.round(y) + 2);

    ctx.fillStyle = color;
    ctx.fillText(text, Math.round(x), Math.round(y));
    ctx.restore();
  }

  private drawCenteredText(
    ctx: CanvasRenderingContext2D,
    text: string,
    x: number,
    y: number,
    color = "#fff3c4",
    size = 16
  ) {
    this.drawPixelText(ctx, text, x, y, color, size, "center");
  }

  private drawPixelBar(
    ctx: CanvasRenderingContext2D,
    x: number,
    y: number,
    width: number,
    height: number,
    value: number,
    maxValue: number,
    fillColor: string
  ) {
    const pct = maxValue <= 0 ? 0 : Math.max(0, Math.min(1, value / maxValue));

    this.drawPixelRect(ctx, x, y, width, height, "#1a0f0a");
    this.drawPixelRect(ctx, x + 2, y + 2, width - 4, height - 4, "#3a2418");

    const innerWidth = Math.max(0, Math.floor((width - 4) * pct));
    this.drawPixelRect(ctx, x + 2, y + 2, innerWidth, height - 4, fillColor);

    if (innerWidth > 8) {
      this.drawPixelRect(
        ctx,
        x + 2,
        y + 2,
        innerWidth,
        Math.max(2, Math.floor((height - 4) * 0.28)),
        "rgba(255,255,255,0.16)"
      );
    }
  }

  private drawBattleShadow(
    ctx: CanvasRenderingContext2D,
    x: number,
    y: number,
    width: number,
    height: number
  ) {
    ctx.save();
    ctx.fillStyle = "rgba(0,0,0,0.24)";
    ctx.beginPath();
    ctx.ellipse(x, y, width, height, 0, 0, Math.PI * 2);
    ctx.fill();
    ctx.restore();
  }

  private drawCommandButton(
    ctx: CanvasRenderingContext2D,
    button: BattleMenuButton,
    accent: string,
    selected = false
  ) {
    const selectedOrHover = selected || button.hovered;

    this.drawWoodPanel(ctx, button.x, button.y, button.width, button.height, selectedOrHover);

    this.drawInsetPanel(
      ctx,
      button.x + 8,
      button.y + 8,
      button.width - 16,
      button.height - 16,
      selectedOrHover ? "#4a2e1f" : "#3a2418"
    );

    this.drawPixelRect(ctx, button.x + 12, button.y + button.height - 16, button.width - 24, 4, accent);

    this.drawCenteredText(
      ctx,
      button.label,
      button.x + button.width / 2,
      button.y + button.height / 2,
      "#fff2c8",
      18
    );
  }

  private drawShadow(
    ctx: CanvasRenderingContext2D,
    x: number,
    y: number,
    width: number,
    height: number,
    alpha: number
  ) {
    ctx.save();

    const grad = ctx.createRadialGradient(x, y, 0, x, y, width * 0.55);
    grad.addColorStop(0, `rgba(0,0,0,${alpha})`);
    grad.addColorStop(1, "rgba(0,0,0,0)");

    ctx.fillStyle = grad;
    ctx.beginPath();
    ctx.ellipse(x, y, width, height, 0, 0, Math.PI * 2);
    ctx.fill();

    ctx.restore();
  }

  private drawHealthBar(
    ctx: CanvasRenderingContext2D,
    x: number,
    y: number,
    width: number,
    height: number,
    hp: number,
    maxHp: number
  ) {
    const pct = Math.max(0, Math.min(1, hp / maxHp));

    let color = "#56d96e";
    if (pct <= 0.5) color = "#f2c14e";
    if (pct <= 0.25) color = "#d95858";

    this.drawPixelBar(ctx, x, y, width, height, hp, maxHp, color);
  }

  private canUseMove(moveId: MoveId | null) {
    if (!moveId) return false;

    const move = moveRegistry[moveId];
    const staminaCost = move?.staminaCost ?? 0;

    return this.playerStamina >= staminaCost;
  }

  private drawBattleMonster(
  ctx: CanvasRenderingContext2D,
  monsterId: MonsterId,
  centerX: number,
  baseY: number,
  targetHeight: number,
  facing: 1 | -1,
  bobSpeed: number,
  bobAmount: number,
  shadowAlpha: number,
  shadowWidthScale: number,
  shadowHeightScale: number,
  hitTimer: number,
  faintAnimation: FaintAnimationInstance | null = null
) {
  const monster = monsterRegistry[monsterId];
  if (!monster) return;

  const baseHeight = (monster as { baseHeight?: number }).baseHeight ?? 220;
  const scale = targetHeight / baseHeight;

  const dropOffset = faintAnimation?.getDropOffset() ?? 0;
  const faintAlpha = faintAnimation?.getAlpha() ?? 1;
  const shadowScale = faintAnimation?.getShadowScale() ?? 1;
  const disableIdle = faintAnimation ? 0 : 1;

  const idleY = Math.sin(this.time * bobSpeed) * bobAmount * disableIdle;
  const idleX =
    Math.sin(this.time * (bobSpeed * 0.58)) * (bobAmount * 0.55) * disableIdle;

  let shakeX = 0;
  let shakeY = 0;

  if (hitTimer > 0) {
    const shakeStrength = 6 * (hitTimer / 0.18);
    shakeX = (Math.random() - 0.5) * shakeStrength;
    shakeY = (Math.random() - 0.5) * shakeStrength;
  }

  const monsterRootX = centerX + idleX;
  const monsterRootY = baseY + idleY + dropOffset;

  this.drawShadow(
    ctx,
    monsterRootX,
    monsterRootY,
    targetHeight * shadowWidthScale * shadowScale,
    targetHeight * shadowHeightScale * shadowScale,
    shadowAlpha * shadowScale
  );

  ctx.save();
  ctx.globalAlpha = faintAlpha;
  ctx.translate(monsterRootX + shakeX, monsterRootY + shakeY);
  ctx.scale(scale * facing, scale);

  drawMonster(monster, {
    ctx,
    x: 0,
    y: 0,
    time: this.time,
    mouseX: this.mouseX,
    mouseY: this.mouseY,
    state: "BATTLE",
  });

  if (hitTimer > 0) {
    ctx.save();
    ctx.globalCompositeOperation = "source-atop";
    ctx.fillStyle = `rgba(255, 70, 70, ${0.38 * (hitTimer / 0.18)})`;
    ctx.fillRect(-600, -600, 1200, 1200);
    ctx.restore();
  }

  ctx.restore();
}

  private drawMovesPanel(ctx: CanvasRenderingContext2D) {
    this.drawCommandButton(ctx, this.subMenuBackButton, "#8eb8ff");

    for (const button of this.moveButtons) {
      const isUltimo = button.label === "ULTIMO";
      const canUse = this.canUseMove(button.moveId ?? null);

      this.drawCommandButton(
        ctx,
        button,
        isUltimo ? "#b86cff" : canUse ? "#d96c52" : "#666666"
      );

      if (button.moveId) {
        const move = moveRegistry[button.moveId];
        const cost = move?.staminaCost ?? 0;

        this.drawPixelText(
          ctx,
          `COST ${cost}`,
          button.x + button.width - 16,
          button.y + 16,
          canUse ? "#ffdca8" : "#d18f8f",
          11,
          "right"
        );
      }
    }
  }

  private drawItemsPanel(ctx: CanvasRenderingContext2D) {
    this.drawCommandButton(ctx, this.subMenuBackButton, "#8eb8ff");

    for (const button of this.itemButtons) {
      this.drawCommandButton(ctx, button, "#e8b250");
    }
  }

private drawBackground(
  ctx: CanvasRenderingContext2D,
  width: number,
  height: number
) {
  // =========================================================
  // SKY - hard banded sunset so it feels more 8-bit than soft
  // =========================================================
  this.drawPixelRect(ctx, 0, 0, width, height * 0.10, "#f6a85f");
  this.drawPixelRect(ctx, 0, height * 0.10, width, height * 0.10, "#f7bc73");
  this.drawPixelRect(ctx, 0, height * 0.20, width, height * 0.10, "#f8cd90");
  this.drawPixelRect(ctx, 0, height * 0.30, width, height * 0.10, "#f7ddb5");
  this.drawPixelRect(ctx, 0, height * 0.40, width, height * 0.10, "#d8b7d6");
  this.drawPixelRect(ctx, 0, height * 0.50, width, height * 0.10, "#a084bb");
  this.drawPixelRect(ctx, 0, height * 0.60, width, height * 0.10, "#6f6198");
  this.drawPixelRect(ctx, 0, height * 0.70, width, height * 0.08, "#514b78");

  // subtle dither-ish sky breakup
  for (let y = 0; y < height * 0.70; y += 12) {
    for (let x = ((y / 12) % 2) * 8; x < width; x += 20) {
      this.drawPixelRect(ctx, x, y, 4, 4, "rgba(255,255,255,0.05)");
    }
  }

  // =========================================================
  // SUN - pixel disc + chunky glow rings
  // =========================================================
  const sunX = width * 0.72;
  const sunY = height * 0.18;

  this.drawPixelRect(ctx, sunX - 42, sunY - 42, 84, 84, "rgba(255,220,120,0.10)");
  this.drawPixelRect(ctx, sunX - 30, sunY - 30, 60, 60, "rgba(255,230,160,0.18)");
  this.drawPixelRect(ctx, sunX - 20, sunY - 20, 40, 40, "#fff0b8");
  this.drawPixelRect(ctx, sunX - 12, sunY - 12, 24, 24, "#fff8d6");

  // tiny pixel sparkle accents
  this.drawPixelRect(ctx, sunX - 56, sunY, 8, 4, "rgba(255,245,220,0.35)");
  this.drawPixelRect(ctx, sunX + 48, sunY - 4, 8, 4, "rgba(255,245,220,0.35)");
  this.drawPixelRect(ctx, sunX - 4, sunY - 56, 4, 8, "rgba(255,245,220,0.35)");
  this.drawPixelRect(ctx, sunX, sunY + 48, 4, 8, "rgba(255,245,220,0.25)");

  // =========================================================
  // CLOUDS - chunkier SNES/GBA style
  // =========================================================
  const cloud = (x: number, y: number, s: number) => {
    const c1 = "rgba(255,244,228,0.88)";
    const c2 = "rgba(255,227,198,0.72)";
    const c3 = "rgba(255,210,180,0.45)";

    this.drawPixelRect(ctx, x + 8 * s, y, 16 * s, 8 * s, c1);
    this.drawPixelRect(ctx, x + 24 * s, y - 8 * s, 16 * s, 8 * s, c1);
    this.drawPixelRect(ctx, x + 40 * s, y, 16 * s, 8 * s, c1);
    this.drawPixelRect(ctx, x, y + 8 * s, 64 * s, 8 * s, c1);

    this.drawPixelRect(ctx, x + 8 * s, y + 16 * s, 48 * s, 8 * s, c2);
    this.drawPixelRect(ctx, x + 20 * s, y + 24 * s, 24 * s, 8 * s, c3);
  };

  cloud(width * 0.10, height * 0.13, 1.2);
  cloud(width * 0.29, height * 0.22, 0.95);
  cloud(width * 0.54, height * 0.12, 1.15);
  cloud(width * 0.80, height * 0.26, 0.85);

  // =========================================================
  // HORIZON LIGHT BAND
  // =========================================================
  this.drawPixelRect(ctx, 0, height * 0.58, width, 6, "#f6d49b");
  this.drawPixelRect(ctx, 0, height * 0.58 + 6, width, 6, "#e6b97d");
  this.drawPixelRect(ctx, 0, height * 0.58 + 12, width, 6, "#c69067");

  // =========================================================
  // FAR MOUNTAINS - stepped silhouette
  // =========================================================
  ctx.fillStyle = "#6d5d8f";
  ctx.beginPath();
  ctx.moveTo(0, height * 0.58);
  ctx.lineTo(width * 0.06, height * 0.52);
  ctx.lineTo(width * 0.13, height * 0.56);
  ctx.lineTo(width * 0.21, height * 0.46);
  ctx.lineTo(width * 0.30, height * 0.55);
  ctx.lineTo(width * 0.39, height * 0.43);
  ctx.lineTo(width * 0.48, height * 0.54);
  ctx.lineTo(width * 0.60, height * 0.45);
  ctx.lineTo(width * 0.72, height * 0.56);
  ctx.lineTo(width * 0.83, height * 0.47);
  ctx.lineTo(width, height * 0.57);
  ctx.lineTo(width, height);
  ctx.lineTo(0, height);
  ctx.closePath();
  ctx.fill();

  // pixel ridge highlights
  this.drawPixelRect(ctx, width * 0.20, height * 0.46, 40, 4, "#8b79aa");
  this.drawPixelRect(ctx, width * 0.39, height * 0.43, 34, 4, "#8b79aa");
  this.drawPixelRect(ctx, width * 0.59, height * 0.45, 42, 4, "#8b79aa");
  this.drawPixelRect(ctx, width * 0.82, height * 0.47, 38, 4, "#8b79aa");

  // =========================================================
  // NEAR MOUNTAINS - darker and chunkier for depth
  // =========================================================
  ctx.fillStyle = "#4f456d";
  ctx.beginPath();
  ctx.moveTo(0, height * 0.68);
  ctx.lineTo(width * 0.08, height * 0.60);
  ctx.lineTo(width * 0.18, height * 0.66);
  ctx.lineTo(width * 0.28, height * 0.56);
  ctx.lineTo(width * 0.38, height * 0.69);
  ctx.lineTo(width * 0.52, height * 0.54);
  ctx.lineTo(width * 0.66, height * 0.68);
  ctx.lineTo(width * 0.79, height * 0.58);
  ctx.lineTo(width * 0.91, height * 0.66);
  ctx.lineTo(width, height * 0.62);
  ctx.lineTo(width, height);
  ctx.lineTo(0, height);
  ctx.closePath();
  ctx.fill();

  // =========================================================
  // DISTANT TREE / BRUSH LINE
  // =========================================================
  const shrubY = height * 0.675;
  for (let x = 0; x < width; x += 22) {
    const h = 6 + ((x / 22) % 3) * 2;
    this.drawPixelRect(ctx, x, shrubY - h, 10, h, "#587044");
    this.drawPixelRect(ctx, x + 4, shrubY - h - 4, 6, 4, "#6d8752");
  }

  // =========================================================
  // GROUND - layered earthy 8-bit battle field
  // =========================================================
  this.drawPixelRect(ctx, 0, height * 0.68, width, height * 0.05, "#a88758");
  this.drawPixelRect(ctx, 0, height * 0.73, width, height * 0.06, "#8d6942");
  this.drawPixelRect(ctx, 0, height * 0.79, width, height * 0.07, "#6c4d33");
  this.drawPixelRect(ctx, 0, height * 0.86, width, height * 0.14, "#493323");

  // grass lip at arena edge
  this.drawPixelRect(ctx, 0, height * 0.665, width, 6, "#d7ba74");
  this.drawPixelRect(ctx, 0, height * 0.673, width, 6, "#84a85e");
  this.drawPixelRect(ctx, 0, height * 0.681, width, 4, "#5f7a46");

  // little pixel dirt / texture
  for (let y = height * 0.73; y < height; y += 14) {
    for (let x = ((y / 14) % 2) * 10; x < width; x += 26) {
      this.drawPixelRect(ctx, x, y, 6, 3, "rgba(255,220,160,0.08)");
      this.drawPixelRect(ctx, x + 10, y + 6, 4, 2, "rgba(0,0,0,0.10)");
    }
  }

  // =========================================================
  // SIDE VIGNETTE / BATTLE FRAMING
  // =========================================================
  const sideShade = ctx.createLinearGradient(0, 0, width, 0);
  sideShade.addColorStop(0, "rgba(20,10,18,0.20)");
  sideShade.addColorStop(0.12, "rgba(20,10,18,0.05)");
  sideShade.addColorStop(0.88, "rgba(20,10,18,0.05)");
  sideShade.addColorStop(1, "rgba(20,10,18,0.18)");
  ctx.fillStyle = sideShade;
  ctx.fillRect(0, 0, width, height);

  // top shade to help sprites pop
  const topShade = ctx.createLinearGradient(0, 0, 0, height * 0.35);
  topShade.addColorStop(0, "rgba(0,0,0,0.08)");
  topShade.addColorStop(1, "rgba(0,0,0,0)");
  ctx.fillStyle = topShade;
  ctx.fillRect(0, 0, width, height * 0.35);
}

private drawArenaSpace(
  ctx: CanvasRenderingContext2D,
  width: number,
  height: number
) {
  const floorY = this.getFloorY(height);
  const arenaX = width * 0.52;
  const arenaY = floorY - 10;

  // =========================================================
  // MAIN BATTLE PAD GLOW
  // =========================================================
  const battleGlow = ctx.createRadialGradient(
    arenaX,
    arenaY - 12,
    20,
    arenaX,
    arenaY - 12,
    260
  );
  battleGlow.addColorStop(0, "rgba(255, 227, 160, 0.18)");
  battleGlow.addColorStop(0.45, "rgba(255, 196, 110, 0.08)");
  battleGlow.addColorStop(1, "rgba(255, 196, 110, 0)");
  ctx.fillStyle = battleGlow;
  ctx.beginPath();
  ctx.ellipse(arenaX, arenaY, 300, 96, 0, 0, Math.PI * 2);
  ctx.fill();

  // =========================================================
  // PIXEL ARENA RINGS
  // =========================================================
  this.drawPixelRect(ctx, arenaX - 150, floorY - 22, 300, 8, "rgba(236,201,127,0.22)");
  this.drawPixelRect(ctx, arenaX - 170, floorY - 8, 340, 10, "rgba(120,78,42,0.28)");
  this.drawPixelRect(ctx, arenaX - 138, floorY - 2, 276, 8, "rgba(255,232,180,0.10)");

  // lower contact strip
  this.drawPixelRect(ctx, arenaX - 118, floorY + 10, 236, 6, "rgba(60,32,20,0.18)");

  // =========================================================
  // SMALL TILE ACCENTS TO SELL A REAL BATTLE ZONE
  // =========================================================
  for (let i = -5; i <= 5; i++) {
    const px = arenaX + i * 24;
    const py = floorY - 4 + (Math.abs(i) % 2) * 2;
    this.drawPixelRect(ctx, px - 6, py, 12, 4, "rgba(255,220,150,0.10)");
  }

  // =========================================================
  // SUBTLE FRONT SHADE TO GROUND THE FIGHTERS
  // =========================================================
  const frontShade = ctx.createLinearGradient(0, floorY - 18, 0, floorY + 48);
  frontShade.addColorStop(0, "rgba(0,0,0,0)");
  frontShade.addColorStop(1, "rgba(0,0,0,0.10)");
  ctx.fillStyle = frontShade;
  ctx.fillRect(0, floorY - 18, width, 70);
}
  private drawMonsterNameplates(
    ctx: CanvasRenderingContext2D,
    width: number,
    height: number
  ) {
    const playerMonsterId = this.activeMonsterId;
    if (!playerMonsterId) return;

    const playerMonster = monsterRegistry[playerMonsterId];
    const enemyMonster = monsterRegistry[this.enemyMonsterId];

    const plateWidth = 296;
    const plateHeight = 110;

    const enemyPlateX = width * 0.56;
    const enemyPlateY = height * 0.09;

    this.drawWoodPanel(ctx, enemyPlateX, enemyPlateY, plateWidth, plateHeight);
    this.drawInsetPanel(ctx, enemyPlateX + 8, enemyPlateY + 8, plateWidth - 16, plateHeight - 16);

    this.drawPixelText(
      ctx,
      (enemyMonster as { name: string }).name.toUpperCase(),
      enemyPlateX + 18,
      enemyPlateY + 24,
      "#fff2c8",
      20
    );
    this.drawPixelText(
      ctx,
      "ENEMY KIN",
      enemyPlateX + 18,
      enemyPlateY + 46,
      "#d7b787",
      12
    );

    this.drawHealthBar(
      ctx,
      enemyPlateX + 18,
      enemyPlateY + 58,
      196,
      14,
      this.enemyHp,
      this.enemyMaxHp
    );

    this.drawPixelBar(
      ctx,
      enemyPlateX + 18,
      enemyPlateY + 78,
      196,
      10,
      this.enemyStamina,
      this.enemyMaxStamina,
      "#64b6e8"
    );

    this.drawPixelText(
      ctx,
      `${this.enemyHp}/${this.enemyMaxHp}`,
      enemyPlateX + 224,
      enemyPlateY + 65,
      "#fff2c8",
      11
    );
    this.drawPixelText(
      ctx,
      `${this.enemyStamina}/${this.enemyMaxStamina}`,
      enemyPlateX + 224,
      enemyPlateY + 83,
      "#c8e8ff",
      10
    );

    const playerPlateX = width * 0.20;
    const playerPlateY = height * 0.46;

    this.drawWoodPanel(ctx, playerPlateX, playerPlateY, plateWidth, plateHeight, true);
    this.drawInsetPanel(ctx, playerPlateX + 8, playerPlateY + 8, plateWidth - 16, plateHeight - 16);

    this.drawPixelText(
      ctx,
      (playerMonster as { name: string }).name.toUpperCase(),
      playerPlateX + 18,
      playerPlateY + 24,
      "#fff2c8",
      20
    );
    this.drawPixelText(
      ctx,
      "YOUR ACTIVE KIN",
      playerPlateX + 18,
      playerPlateY + 46,
      "#d7b787",
      12
    );

    this.drawHealthBar(
      ctx,
      playerPlateX + 18,
      playerPlateY + 58,
      196,
      14,
      this.playerHp,
      this.playerMaxHp
    );

    this.drawPixelBar(
      ctx,
      playerPlateX + 18,
      playerPlateY + 78,
      196,
      10,
      this.playerStamina,
      this.playerMaxStamina,
      "#64b6e8"
    );

    this.drawPixelText(
      ctx,
      `${this.playerHp}/${this.playerMaxHp}`,
      playerPlateX + 224,
      playerPlateY + 65,
      "#fff2c8",
      11
    );
    this.drawPixelText(
      ctx,
      `${this.playerStamina}/${this.playerMaxStamina}`,
      playerPlateX + 224,
      playerPlateY + 83,
      "#c8e8ff",
      10
    );
  }

  private drawEnemyTrainer(
    ctx: CanvasRenderingContext2D,
    width: number,
    height: number
  ) {
    const enemy = this.getEnemyAnchor(width, height);
    const floorY = this.getFloorY(height);
    const trainerX = enemy.x + 132;
    const trainerY = floorY + 44;

    ctx.save();
    ctx.globalAlpha = 0.96;

    ctx.fillStyle = "rgba(0,0,0,0.18)";
    ctx.beginPath();
    ctx.ellipse(
      Math.round(trainerX),
      Math.round(trainerY + 8),
      34,
      8,
      0,
      0,
      Math.PI * 2
    );
    ctx.fill();

    drawGirlTrainer(ctx, trainerX, trainerY, this.time);
    ctx.restore();
  }

  private drawTeamStrip(ctx: CanvasRenderingContext2D) {
    if (this.teamSlotButtons.length === 0) return;

    const first = this.teamSlotButtons[0];
    const last = this.teamSlotButtons[this.teamSlotButtons.length - 1];

    const barX = first.x - 14;
    const barY = first.y - 12;
    const barW = last.x + last.width - first.x + 28;
    const barH = first.height + 24;

    this.drawWoodPanel(ctx, barX, barY, barW, barH);
    this.drawInsetPanel(ctx, barX + 8, barY + 8, barW - 16, barH - 16, "#2b1a12");

    for (const slotButton of this.teamSlotButtons) {
      const monsterId = this.teamSlots[slotButton.slotIndex];
      const isActive = slotButton.slotIndex === this.activeMonsterIndex;
      const isFainted = monsterId ? this.faintedMonsters.has(monsterId) : false;

      ctx.save();

      if (isFainted) {
        this.drawPixelFrame(
          ctx,
          slotButton.x,
          slotButton.y,
          slotButton.width,
          slotButton.height,
          "#7a1f1f",
          "#4b1717",
          "#c84e4e"
        );
      } else if (isActive) {
        this.drawPixelFrame(
          ctx,
          slotButton.x,
          slotButton.y,
          slotButton.width,
          slotButton.height,
          "#f0d8a8",
          "#7e542f",
          "#ffde8a"
        );
      } else if (slotButton.hovered) {
        this.drawPixelFrame(
          ctx,
          slotButton.x,
          slotButton.y,
          slotButton.width,
          slotButton.height,
          "#b78c67",
          "#60402a",
          "#d3ac84"
        );
      } else {
        this.drawPixelFrame(
          ctx,
          slotButton.x,
          slotButton.y,
          slotButton.width,
          slotButton.height,
          "#4e2d1a",
          "#6e4727",
          "#9d6a3d"
        );
      }

      this.drawInsetPanel(
        ctx,
        slotButton.x + 8,
        slotButton.y + 8,
        slotButton.width - 16,
        slotButton.height - 28,
        isFainted ? "#331515" : "#312017"
      );

      this.drawPixelRect(
        ctx,
        slotButton.x + 10,
        slotButton.y + slotButton.height - 18,
        slotButton.width - 20,
        4,
        isFainted ? "#c84e4e" : isActive ? "#8ec8ff" : "#c69558"
      );

      if (monsterId) {
        const monster = monsterRegistry[monsterId];

        ctx.save();
        ctx.beginPath();
        ctx.rect(slotButton.x + 8, slotButton.y + 8, slotButton.width - 16, slotButton.height - 30);
        ctx.clip();

        ctx.translate(slotButton.x + slotButton.width / 2, slotButton.y + 52);
        ctx.scale(0.32, 0.32);

        if (isFainted) {
          ctx.globalAlpha = 0.35;
        }

        drawMonster(monster, {
          ctx,
          x: 0,
          y: 0,
          time: this.time,
          mouseX: 0,
          mouseY: 0,
          state: "BATTLE",
        });

        ctx.restore();

        const monsterName = (monster as { name: string }).name.toUpperCase();
        const displayName = isFainted
          ? "FAINTED"
          : monsterName.length > 8
          ? `${monsterName.slice(0, 8)}`
          : monsterName;

        this.drawCenteredText(
          ctx,
          displayName,
          slotButton.x + slotButton.width / 2,
          slotButton.y + slotButton.height - 10,
          isFainted ? "#ffb1b1" : "#fff0c7",
          10
        );
      } else {
        this.drawCenteredText(
          ctx,
          "EMPTY",
          slotButton.x + slotButton.width / 2,
          slotButton.y + 36,
          "#d1b08a",
          12
        );
        this.drawCenteredText(
          ctx,
          `${slotButton.slotIndex + 1}`,
          slotButton.x + slotButton.width / 2,
          slotButton.y + slotButton.height - 10,
          "#c19a70",
          10
        );
      }

      ctx.restore();
    }
  }

  private drawBottomHelper(ctx: CanvasRenderingContext2D, width: number, height: number) {
    const helperText =
      this.state === "ARRIVAL"
        ? "SUMMONING KINS..."
        : 
      this.playerSwapAnimation
        ? "SUMMONING NEW KIN..."
        : this.currentMoveAnimation
        ? "MOVE IN PROGRESS..."
        : this.uiMode === "SWAP"
        ? "CHOOSE A KIN TO SWAP IN"
        : this.uiMode === "MOVES"
        ? "CHOOSE A MOVE"
        : this.uiMode === "ITEMS"
        ? "CHOOSE AN ITEM"
        : "BATTLE COMMANDS";

    const bannerWidth = 300;
    const bannerHeight = 34;
    const bannerX = width / 2 - bannerWidth / 2;
    const bannerY = height - 132;

    this.drawWoodPanel(ctx, bannerX, bannerY, bannerWidth, bannerHeight);
    this.drawCenteredText(
      ctx,
      helperText,
      bannerX + bannerWidth / 2,
      bannerY + bannerHeight / 2 + 1,
      "#fff0c7",
      14
    );
  }

  draw(ctx: CanvasRenderingContext2D) {
    const { width, height } = ctx.canvas;
    const introEntryT =
      this.state === "INTRO" && this.introCinematic
        ? this.clamp(this.introCinematic.time / 0.45, 0, 1)
        : 1;
    const introEntryEase = this.easeOutCubic(introEntryT);
    const introEntryCameraY = (1 - introEntryEase) * -24;
    const introEntryFade = 1 - introEntryEase;
    const arrivalT =
      this.state === "ARRIVAL"
        ? this.clamp(this.arrivalTimer / this.arrivalDuration, 0, 1)
        : 1;
    const arrivalCameraY = (1 - this.easeOutCubic(arrivalT)) * -18;
    const topUiOffsetY =
      this.state === "ARRIVAL"
        ? (1 - this.easeOutCubic(this.clamp((this.arrivalTimer - 0.08) / 0.36, 0, 1))) *
          -88
        : 0;
    const nameplateOffsetY =
      this.state === "ARRIVAL"
        ? (1 - this.easeOutBack(this.clamp((this.arrivalTimer - 0.14) / 0.44, 0, 1))) *
          -62
        : 0;
    const commandOffsetY =
      this.state === "ARRIVAL"
        ? (1 - this.easeOutBack(this.clamp((this.arrivalTimer - 0.26) / 0.48, 0, 1))) *
          110
        : 0;
    const teamOffsetY =
      this.state === "ARRIVAL"
        ? (1 - this.easeOutBack(this.clamp((this.arrivalTimer - 0.34) / 0.48, 0, 1))) *
          96
        : 0;

    this.updateLayout(ctx.canvas);

    ctx.clearRect(0, 0, width, height);

    const shake =
  this.playerSwapAnimation?.getScreenShake?.() ??
  this.currentMoveAnimation?.getScreenShake?.() ??
  0;

    if (shake > 0) {
      const shakeX = (Math.random() - 0.5) * shake;
      const shakeY = (Math.random() - 0.5) * shake;
      ctx.save();
      ctx.translate(shakeX, shakeY);
    }

    ctx.save();
    ctx.translate(
      0,
      this.state === "INTRO" ? introEntryCameraY : arrivalCameraY
    );

    this.drawBackground(ctx, width, height);

    ctx.save();
    ctx.translate(0, this.state === "INTRO" ? topUiOffsetY * 0.65 : topUiOffsetY);
    this.drawCommandButton(ctx, this.backButton, "#8eb8ff");
    ctx.restore();

    if (this.state === "INTRO") {
      if (this.introCinematic) {
this.introCinematic.draw(ctx, width, height, {
  drawWoodPanel: this.drawWoodPanel.bind(this),
  drawInsetPanel: this.drawInsetPanel.bind(this),
  drawCenteredText: this.drawCenteredText.bind(this),
});
      }

      if (introEntryFade > 0) {
        ctx.save();
        ctx.globalAlpha = introEntryFade;
        ctx.fillStyle = "#23140b";
        ctx.fillRect(0, 0, width, height);
        ctx.restore();
      }

      ctx.restore();

      if (shake > 0) ctx.restore();
      return;
    }

    const player = this.getPlayerAnchor(width, height);
    const enemy = this.getEnemyAnchor(width, height);

    this.drawArenaSpace(ctx, width, height);

    this.drawEnemyTrainer(ctx, width, height);

    ctx.save();
    ctx.translate(0, nameplateOffsetY);
    this.drawMonsterNameplates(ctx, width, height);
    ctx.restore();

    this.playerIntroAnimation?.drawUnderMonster(ctx);
    this.enemyIntroAnimation?.drawUnderMonster(ctx);

    if (this.playerSwapAnimation) {
      this.playerSwapAnimation.drawUnderMonster(ctx);
    }

    const activeMonsterId = this.activeMonsterId;

    if (this.playerSwapAnimation) {
      const hideOld = this.playerSwapAnimation.shouldHideOldMonster();
      const showNew = this.playerSwapAnimation.shouldShowNewMonster();

      if (!hideOld && this.playerSwapFromMonsterId) {
        this.drawBattleMonster(
          ctx,
          this.playerSwapFromMonsterId,
          player.x,
          player.monsterY,
          255,
          1,
          2.6,
          4.5,
          0.28,
          0.34,
          0.075,
          this.playerHitTimer,
          this.playerFaintAnimation
        );
      }

      if (showNew && this.playerSwapToMonsterId) {
        this.drawBattleMonster(
          ctx,
          this.playerSwapToMonsterId,
          player.x,
          player.monsterY,
          255,
          1,
          2.6,
          4.5,
          0.28,
          0.34,
          0.075,
          0
        );
      }
} else if (activeMonsterId) {
  const playerBattleId = this.getPlayerBattleMonsterId(activeMonsterId);
  const hideUser = this.currentMoveAnimation?.shouldHideUser === true;
  const arrivalHidePlayer =
    this.state === "ARRIVAL" &&
    this.playerIntroAnimation !== null &&
    !this.playerIntroAnimation.shouldShowNewMonster();

  if (playerBattleId && !hideUser && !arrivalHidePlayer) {
    this.drawBattleMonster(
      ctx,
      playerBattleId,
      player.x,
      player.monsterY,
      255,
      1,
      2.6,
      4.5,
      0.28,
      0.34,
      0.075,
      this.playerHitTimer,
      this.playerFaintAnimation
    );
  } else if (hideUser && this.currentMoveAnimation?.drawUserOverride) {
    this.currentMoveAnimation.drawUserOverride(ctx);
  }
}

    const arrivalHideEnemy =
      this.state === "ARRIVAL" &&
      this.enemyIntroAnimation !== null &&
      !this.enemyIntroAnimation.shouldShowNewMonster();

    if (!arrivalHideEnemy) {
      this.drawBattleMonster(
        ctx,
        this.enemyMonsterId,
        enemy.x,
        enemy.monsterY,
        220,
        -1,
        2.15,
        3.2,
        0.22,
        0.27,
        0.058,
        this.enemyHitTimer,
        this.enemyFaintAnimation
      );
    }

    if (this.playerSwapAnimation) {
      this.playerSwapAnimation.drawOverMonster(ctx);
    }

    this.playerIntroAnimation?.drawOverMonster(ctx);
    this.enemyIntroAnimation?.drawOverMonster(ctx);

 if (this.currentMoveAnimation) {
  this.currentMoveAnimation.draw(ctx);
}

    ctx.save();
    ctx.translate(0, commandOffsetY);
    if (this.uiMode === "MAIN" || this.uiMode === "SWAP") {
      this.drawCommandButton(ctx, this.attackButton, "#d96c52");
      this.drawCommandButton(ctx, this.itemsButton, "#e2b14e");
      this.drawCommandButton(ctx, this.swapButton, "#6ba8e8", this.uiMode === "SWAP");
      this.drawCommandButton(ctx, this.runButton, "#8c93a8");
    }

    if (this.uiMode === "MOVES") {
      this.drawMovesPanel(ctx);
    }

    if (this.uiMode === "ITEMS") {
      this.drawItemsPanel(ctx);
    }
    ctx.restore();

    ctx.save();
    ctx.translate(0, teamOffsetY);
    this.drawBottomHelper(ctx, width, height);
    this.drawTeamStrip(ctx);
    ctx.restore();

    ctx.restore();

    if (shake > 0) {
      ctx.restore();
    }
  }
}
