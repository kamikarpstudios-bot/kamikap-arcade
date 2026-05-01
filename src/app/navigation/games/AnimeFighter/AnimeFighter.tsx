"use client";

import { useEffect, useRef } from "react";

type Rect = {
  x: number;
  y: number;
  w: number;
  h: number;
};

type FighterState =
  | "IDLE"
  | "WALK"
  | "JUMP"
  | "CROUCH"
  | "LIGHT"
  | "HEAVY"
  | "ABILITY"
  | "BLOCK"
  | "HITSTUN"
  | "KO";

type Fighter = {
  name: string;

  x: number;
  y: number;
  vx: number;
  vy: number;

  width: number;
  height: number;

  facing: 1 | -1;

  hp: number;
  maxHp: number;

  stamina: number;
  maxStamina: number;

  state: FighterState;
  stateTimer: number; // Overall time in state
  animFrame: number;  // Current frame of the animation (0, 1, 2...)

  grounded: boolean;
  crouching: boolean;
  blocking: boolean;

  attackHasHit: boolean;
  hurtFlash: number;

  // Visuals
  color: string;
  darkColor: string;
  glowColor: string;

  // THE "COOL" ADDS
  // Stores previous X/Y positions for the smoke/teleport trail
  afterImages: { x: number; y: number; opacity: number }[]; 
  
  // To handle the "Teleport Behind" logic
  isTeleporting: boolean;
};

type HitSpark = {
  x: number;
  y: number;
  life: number;
  maxLife: number;
  size: number;
};

export default function PixelFighterGame() {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    let animationFrameId = 0;
    let lastTime = 0;

    let cssW = 0;
    let cssH = 0;
    let dpr = 1;

    const keys: Record<string, boolean> = {};
    const pressedThisFrame: Record<string, boolean> = {};


    const onKeyDown = (e: KeyboardEvent) => {
      const key = e.key.toLowerCase();

      if (
        key === " " ||
        key === "enter" ||
        key === "arrowup" ||
        key === "arrowdown" ||
        key === "arrowleft" ||
        key === "arrowright"
      ) {
        e.preventDefault();
      }

      if (!keys[key]) pressedThisFrame[key] = true;
      keys[key] = true;
    };

    const onKeyUp = (e: KeyboardEvent) => {
      keys[e.key.toLowerCase()] = false;
    };

    const consumePressed = (key: string) => {
      const hadPress = !!pressedThisFrame[key];
      pressedThisFrame[key] = false;
      return hadPress;
    };

    const resizeCanvas = () => {
      const parent = canvas.parentElement;
      if (!parent) return;

      const rect = parent.getBoundingClientRect();
      dpr = Math.max(1, window.devicePixelRatio || 1);

      cssW = Math.max(900, rect.width);
      cssH = Math.max(520, rect.height);

      canvas.width = Math.floor(cssW * dpr);
      canvas.height = Math.floor(cssH * dpr);

      canvas.style.width = `${cssW}px`;
      canvas.style.height = `${cssH}px`;

      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      ctx.imageSmoothingEnabled = false;
    };

    const clamp = (v: number, min: number, max: number) =>
      Math.max(min, Math.min(max, v));

    const lerp = (a: number, b: number, t: number) => a + (b - a) * t;

    const rectsOverlap = (a: Rect, b: Rect) => {
      return (
        a.x < b.x + b.w &&
        a.x + a.w > b.x &&
        a.y < b.y + b.h &&
        a.y + a.h > b.y
      );
    };

    const rand = (min: number, max: number) => {
      return min + Math.random() * (max - min);
    };

    const floorY = () => cssH - 112;

    // =========================================================
    // GAME STATE
    // =========================================================

    let gameStarted = false;
    let roundOver = false;
    let winnerText = "";
    let roundTimer = 99;

    let screenShake = 0;
    let hitStop = 0;

    const hitSparks: HitSpark[] = [];

  const player: Fighter = {
      name: "PLAYER",
      x: 260,
      y: 0,
      vx: 0,
      vy: 0,

      width: 56,
      height: 128,

      facing: 1,

      hp: 100,
      maxHp: 100,

      stamina: 100,
      maxStamina: 100,

      state: "IDLE",
      stateTimer: 0,
      animFrame: 0,       // <-- Add this

      grounded: true,
      crouching: false,
      blocking: false,

      attackHasHit: false,
      hurtFlash: 0,

      color: "#60a5fa",
      darkColor: "#1d4ed8",
      glowColor: "rgba(96,165,250,0.6)", // Bumped opacity for better smoke
      
      afterImages: [],    // <-- Add this
      isTeleporting: false // <-- Add this
    };
const enemy: Fighter = {
  name: "RIVAL",
  x: 680,
  y: 0,
  vx: 0,
  vy: 0,

  width: 56,
  height: 128,

  facing: -1,

  hp: 100,
  maxHp: 100,

  stamina: 100,
  maxStamina: 100,

  state: "IDLE",
  stateTimer: 0,
  animFrame: 0,

  grounded: true,
  crouching: false,
  blocking: false,

  attackHasHit: false,
  hurtFlash: 0,

  color: "#fb7185",
  darkColor: "#be123c",
  glowColor: "rgba(251,113,133,0.6)",

  afterImages: [],
  isTeleporting: false,
};

let enemyBrainTimer = 0;
let enemyMoveDir: -1 | 0 | 1 = 0;
let aiReactionBuffer = 0;

    const resetGame = (startImmediately = false) => {
      player.x = cssW * 0.32;
      player.y = floorY();
      player.vx = 0;
      player.vy = 0;
      player.facing = 1;
      player.hp = player.maxHp;
      player.stamina = player.maxStamina;
      player.state = "IDLE";
      player.stateTimer = 0;
      player.grounded = true;
      player.crouching = false;
      player.blocking = false;
      player.attackHasHit = false;
      player.hurtFlash = 0;

      enemy.x = cssW * 0.68;
      enemy.y = floorY();
      enemy.vx = 0;
      enemy.vy = 0;
      enemy.facing = -1;
      enemy.hp = enemy.maxHp;
      enemy.stamina = enemy.maxStamina;
      enemy.state = "IDLE";
      enemy.stateTimer = 0;
      enemy.grounded = true;
      enemy.crouching = false;
      enemy.blocking = false;
      enemy.attackHasHit = false;
      enemy.hurtFlash = 0;

      gameStarted = startImmediately;
      roundOver = false;
      winnerText = "";
      roundTimer = 99;

      screenShake = 0;
      hitStop = 0;
      hitSparks.length = 0;

      enemyBrainTimer = 0;
      enemyMoveDir = 0;
    };

    // =========================================================
    // FIGHTER HELPERS
    // =========================================================

    const canControl = (f: Fighter) => {
      return (
        f.state !== "LIGHT" &&
        f.state !== "HEAVY" &&
        f.state !== "ABILITY" &&
        f.state !== "HITSTUN" &&
        f.state !== "KO"
      );
    };

    const startAttack = (
  f: Fighter,
  state: "LIGHT" | "HEAVY" | "ABILITY",
  target?: Fighter
) => {
  if (!canControl(f)) return;

  if (state === "LIGHT" && f.stamina < 6) return;
  if (state === "HEAVY" && f.stamina < 14) return;
  if (state === "ABILITY" && f.stamina < 28) return;

  f.state = state;
  f.stateTimer = 0;
  f.animFrame = 0;
  f.attackHasHit = false;
  f.crouching = false;
  f.blocking = false;

  if (state === "LIGHT") f.stamina -= 6;
  if (state === "HEAVY") f.stamina -= 14;

  if (state === "ABILITY") {
    f.stamina -= 28;
    f.isTeleporting = true;

    // Store old spot for afterimage/smoke
    f.afterImages.push({
      x: f.x,
      y: f.y,
      opacity: 0.9,
    });

    if (target) {
      const side = target.facing * -1; 
      const behindDistance = 78;

      f.x = clamp(
        target.x + side * behindDistance,
        80,
        cssW - 80
      );

      f.y = floorY();
      f.vx = 0;
      f.vy = 0;
      f.grounded = true;

      // Face the target after teleporting
      f.facing = f.x < target.x ? 1 : -1;

      f.afterImages.push({
        x: f.x,
        y: f.y,
        opacity: 0.7,
      });

      screenShake = Math.max(screenShake, 8);
    }
  }
};

const getHurtBox = (f: Fighter): Rect => {
  const h = f.crouching ? f.height * 0.68 : f.height;
  const w = f.width * 0.8;

  return {
    x: f.x - w * 0.5,
    y: f.y - h,
    w,
    h,
  };
};

   const getAttackBox = (f: Fighter): Rect | null => {
  if (f.state === "LIGHT") {
    if (f.stateTimer < 0.06 || f.stateTimer > 0.15) return null;

    const w = 46;
    return {
      x: f.facing === 1 ? f.x + 18 : f.x - 18 - w,
      y: f.y - 96,
      w,
      h: 24,
    };
  }

  if (f.state === "HEAVY") {
    if (f.stateTimer < 0.18 || f.stateTimer > 0.31) return null;

    const w = 58;
    return {
      x: f.facing === 1 ? f.x + 10 : f.x - 10 - w,
      y: f.y - 108,
      w,
      h: 44,
    };
  }

  if (f.state === "ABILITY") {
    if (f.stateTimer < 0.08 || f.stateTimer > 0.19) return null;

    const w = 64;
    return {
      x: f.facing === 1 ? f.x + 14 : f.x - 14 - w,
      y: f.y - 112,
      w,
      h: 54,
    };
  }

  return null;
};

    const applyHit = (
      attacker: Fighter,
      defender: Fighter,
      damage: number,
      knockback: number,
      sparkSize: number
    ) => {
      const defenderIsBlocking =
        defender.blocking && defender.facing === -attacker.facing;

      const finalDamage = defenderIsBlocking ? Math.ceil(damage * 0.3) : damage;
      const finalKnockback = defenderIsBlocking
        ? knockback * 0.42
        : knockback;

      defender.hp = clamp(defender.hp - finalDamage, 0, defender.maxHp);
      defender.vx = attacker.facing * finalKnockback;
      defender.vy = defenderIsBlocking ? -80 : -170;

      defender.hurtFlash = 0.18;

      if (!defenderIsBlocking) {
        defender.state = "HITSTUN";
        defender.stateTimer = 0;
      }

      attacker.attackHasHit = true;

      const hurt = getHurtBox(defender);
      hitSparks.push({
        x: hurt.x + hurt.w * 0.5 + rand(-12, 12),
        y: hurt.y + hurt.h * 0.42 + rand(-14, 14),
        life: 0,
        maxLife: 0.22,
        size: sparkSize,
      });

      screenShake = Math.max(screenShake, defenderIsBlocking ? 5 : 12);
      hitStop = defenderIsBlocking ? 0.035 : 0.065;

      if (defender.hp <= 0) {
        defender.state = "KO";
        defender.stateTimer = 0;
        defender.blocking = false;
        defender.crouching = false;
        defender.vx = attacker.facing * 420;
        defender.vy = -260;

        roundOver = true;
        winnerText = attacker === player ? "PLAYER WINS" : "RIVAL WINS";
        screenShake = 20;
        hitStop = 0.12;
      }
    };

    const resolveAttack = (attacker: Fighter, defender: Fighter) => {
      if (attacker.attackHasHit) return;

      const attackBox = getAttackBox(attacker);
      if (!attackBox) return;

      const hurtBox = getHurtBox(defender);
      if (!rectsOverlap(attackBox, hurtBox)) return;

      if (attacker.state === "LIGHT") {
        applyHit(attacker, defender, 6, 210, 20);
      } else if (attacker.state === "HEAVY") {
        applyHit(attacker, defender, 13, 330, 28);
    } else if (attacker.state === "ABILITY") {
  applyHit(attacker, defender, 16, 360, 38);
}
    };

    const updateFighterPhysics = (f: Fighter, dt: number) => {
  // 1. Context-Aware Gravity
  // We apply higher gravity when falling or when the player lets go of jump
  const baseGravity = 1600;
  const fallMultiplier = 1.6; // Makes the descent feel "heavy" and snappy
  const currentGravity = f.vy > 0 ? baseGravity * fallMultiplier : baseGravity;
  
  f.vy += currentGravity * dt;

  // 2. Terminal Velocity Cap
  const maxFallSpeed = 1200;
  if (f.vy > maxFallSpeed) f.vy = maxFallSpeed;

  // 3. Movement Execution
  f.x += f.vx * dt;
  f.y += f.vy * dt;

  // 4. Improved Deceleration (Friction)
  // Instead of lerp, we use a fixed deceleration for a more "grounded" feel
  if (f.vx !== 0) {
    const deceleration = f.grounded ? 2200 : 800; // Much higher friction on ground
    const dir = Math.sign(f.vx);
    const amount = deceleration * dt;

    if (Math.abs(f.vx) < amount) {
      f.vx = 0;
    } else {
      f.vx -= dir * amount;
    }
  }

  // 5. Floor & Ceiling Collision
  const ground = floorY();
  if (f.y >= ground) {
    f.y = ground;
    f.vy = 0;
    f.grounded = true;
  } else {
    f.grounded = false;
  }

  // 6. Wall Interaction
  const wallPad = 70;
  const oldX = f.x;
  f.x = clamp(f.x, wallPad, cssW - wallPad);
  
  // If we hit a wall, kill momentum immediately (prevents "vibrating" against walls)
  if (f.x !== oldX) {
    f.vx = 0;
  }
};

const MOVE_DATA = {
  LIGHT: {
    duration: 0.24,
    canCancelAt: 0.16,
    staminaGain: 0,
  },
  HEAVY: {
    duration: 0.46,
    canCancelAt: 0.34,
    staminaGain: 0,
  },
  ABILITY: {
    duration: 0.34,
    canCancelAt: 0.34,
    staminaGain: 0,
  },
  HITSTUN: {
    duration: 0.35,
    canCancelAt: 0.35,
    staminaGain: 5,
  },
};

const updateFighterTimers = (f: Fighter, dt: number) => {
  f.stateTimer += dt;
  f.animFrame = Math.floor(f.stateTimer * 60);

  if (f.hurtFlash > 0) f.hurtFlash -= dt;

  for (let i = f.afterImages.length - 1; i >= 0; i--) {
    f.afterImages[i].opacity -= dt * 2.8;
    if (f.afterImages[i].opacity <= 0) {
      f.afterImages.splice(i, 1);
    }
  }

  const isPassive =
    f.state === "IDLE" ||
    f.state === "WALK" ||
    f.state === "CROUCH" ||
    f.state === "BLOCK";

  const regenRate = isPassive ? 22 : 7;
  f.stamina = clamp(f.stamina + regenRate * dt, 0, f.maxStamina);

  const move = MOVE_DATA[f.state as keyof typeof MOVE_DATA];

  if (move && f.stateTimer >= move.duration) {
    f.state = f.grounded ? "IDLE" : "JUMP";
    f.stateTimer = 0;
    f.animFrame = 0;
    f.attackHasHit = false;
    f.isTeleporting = false;
  }

  if (f.state === "KO") {
    f.vx *= 0.95;
  }
};

const updatePlayerInput = (dt: number) => {
  const moveSpeed = player.crouching ? 130 : 320;

  player.crouching = false;
  player.blocking = false;

  let move = 0;
  if (keys["a"]) move -= 1;
  if (keys["d"]) move += 1;

  const holdingDown = keys["s"];

  if (canControl(player)) {
    if (holdingDown && player.grounded) {
      player.crouching = true;
      player.blocking = true;
      player.state = "BLOCK";
      player.vx *= 0.72;
    } else if (move !== 0) {
      player.state = player.grounded ? "WALK" : "JUMP";
      player.vx = move * moveSpeed;
    } else {
      player.state = player.grounded ? "IDLE" : "JUMP";
    }

    if (consumePressed("w") && player.grounded && !player.crouching) {
      player.vy = -650;
      player.grounded = false;
      player.state = "JUMP";
    }
  }

  const tryAttack = (type: "LIGHT" | "HEAVY" | "ABILITY") => {
    const currentMove = MOVE_DATA[player.state as keyof typeof MOVE_DATA];
    const canCancel = !!currentMove && player.stateTimer >= currentMove.canCancelAt;

    if (canControl(player) || canCancel) {
      if (player.state === type && currentMove && player.stateTimer < currentMove.duration) {
        return;
      }

      startAttack(player, type, enemy);
    }
  };

  // SHIFT = teleport ability
  if (consumePressed("shift")) {
    tryAttack("ABILITY");
    return;
  }

  // SPACE = quick jab
  if (consumePressed(" ")) {
    tryAttack("LIGHT");
    return;
  }

  // ENTER = rear-hand hook
  if (consumePressed("enter")) {
    tryAttack("HEAVY");
    return;
  }
};

const updateEnemyAI = (dt: number) => {
  if (roundOver) return;

  const dist = Math.abs(player.x - enemy.x);
  const dirToPlayer: -1 | 1 = enemy.x < player.x ? 1 : -1;
  const awayFromPlayer: -1 | 1 = enemy.x < player.x ? -1 : 1;

  const playerIsAttacking =
    player.state === "LIGHT" ||
    player.state === "HEAVY" ||
    player.state === "ABILITY";

  const enemyIsAttacking =
    enemy.state === "LIGHT" ||
    enemy.state === "HEAVY" ||
    enemy.state === "ABILITY";

  const enemyCanAct =
    enemy.state === "IDLE" ||
    enemy.state === "WALK" ||
    enemy.state === "BLOCK" ||
    enemy.state === "CROUCH" ||
    enemy.state === "JUMP";

  enemyBrainTimer -= dt;
  aiReactionBuffer -= dt;

  // Face player.
  enemy.facing = dirToPlayer;

  // =========================================================
  // 1. ATTACK CANCEL LOGIC
  // =========================================================
  // This has to happen BEFORE canControl-style movement logic,
  // because enemy may already be in LIGHT and still allowed to cancel.
  const canLightCancelIntoHeavy =
    enemy.state === "LIGHT" &&
    enemy.stateTimer > 0.18 &&
    enemy.stateTimer < 0.34 &&
    enemy.stamina >= 18 &&
    dist < 135;

  if (canLightCancelIntoHeavy && Math.random() > 0.72) {
    startAttack(enemy, "HEAVY");
    enemyMoveDir = 0;
    enemy.vx *= 0.45;
    return;
  }

  const canAttackCancelIntoAbility =
    (enemy.state === "LIGHT" || enemy.state === "HEAVY") &&
    enemy.stateTimer > 0.2 &&
    enemy.stamina >= 50 &&
    dist < 170;

  if (canAttackCancelIntoAbility && Math.random() > 0.94) {
    startAttack(enemy, "ABILITY");
    enemyMoveDir = 0;
    enemy.vx *= 0.3;
    return;
  }

  // If enemy is already attacking or hurt, don't overwrite the animation state.
  if (!enemyCanAct || enemyIsAttacking) {
    return;
  }

  // =========================================================
  // 2. REACTION BLOCKING
  // =========================================================
  // Only react when the player is attacking nearby.
  if (playerIsAttacking && dist < 170) {
    // When player attack is fresh, create a human-like reaction delay.
    if (player.stateTimer < 0.08 && aiReactionBuffer <= -0.2) {
      aiReactionBuffer = rand(0.1, 0.22);
    }

    // Once delay is done, decide whether the AI blocks.
    if (aiReactionBuffer <= 0) {
      const scaryAttack = player.state === "HEAVY" || player.state === "ABILITY";
      const blockChance = scaryAttack ? 0.82 : 0.58;

      if (Math.random() < blockChance) {
        enemy.blocking = true;
        enemy.crouching = true;
        enemy.state = "BLOCK";
        enemyMoveDir = 0;
        enemy.vx *= 0.72;
        return;
      }
    }
  }

  // Default these off unless AI chooses to block this frame.
  enemy.blocking = false;
  enemy.crouching = false;

  // =========================================================
  // 3. BRAIN DECISION
  // =========================================================
  if (enemyBrainTimer <= 0) {
    enemyBrainTimer = rand(0.18, 0.46);

    // -----------------------------
    // Spacing
    // -----------------------------
    if (dist > 260) {
      // Far away: approach.
      enemyMoveDir = dirToPlayer;
    } else if (dist > 150) {
      // Mid range: mostly approach, sometimes pause.
      enemyMoveDir = Math.random() > 0.25 ? dirToPlayer : 0;
    } else if (dist < 75) {
      // Too close: back up or stand ground.
      enemyMoveDir = Math.random() > 0.35 ? awayFromPlayer : 0;
    } else {
      // Sweet spot: footsies.
      const roll = Math.random();

      if (roll < 0.4) {
        enemyMoveDir = 0;
      } else if (roll < 0.7) {
        enemyMoveDir = dirToPlayer;
      } else {
        enemyMoveDir = awayFromPlayer;
      }
    }

    // -----------------------------
    // Offense
    // -----------------------------
    if (dist < 130) {
      const roll = Math.random();

      if (enemy.stamina >= 50 && dist < 185 && roll > 0.92) {
        startAttack(enemy, "ABILITY");
        enemyMoveDir = 0;
        enemy.vx *= 0.3;
        return;
      }

      if (enemy.stamina >= 22 && roll > 0.7) {
        startAttack(enemy, "HEAVY");
        enemyMoveDir = 0;
        enemy.vx *= 0.45;
        return;
      }

      if (enemy.stamina >= 8 && roll > 0.32) {
        startAttack(enemy, "LIGHT");
        enemyMoveDir = 0;
        enemy.vx *= 0.65;
        return;
      }
    }

    // -----------------------------
    // Anti-air / jump check
    // -----------------------------
    const playerIsAbove = player.y < enemy.y - 45;
    const playerIsCloseHorizontally = dist < 130;

    if (
      enemy.grounded &&
      playerIsAbove &&
      playerIsCloseHorizontally &&
      Math.random() > 0.72
    ) {
      enemy.vy = -650;
      enemy.grounded = false;
      enemy.state = "JUMP";
      return;
    }
  }

  // =========================================================
  // 4. APPLY MOVEMENT WITHOUT OVERWRITING ATTACKS
  // =========================================================
  if (enemyMoveDir !== 0) {
    enemy.vx = enemyMoveDir * 220;

    if (enemy.grounded) {
      enemy.state = "WALK";
    } else {
      enemy.state = "JUMP";
    }
  } else {
    enemy.vx *= 0.78;

    if (Math.abs(enemy.vx) < 8) {
      enemy.vx = 0;
    }

    if (enemy.grounded) {
      enemy.state = "IDLE";
    } else {
      enemy.state = "JUMP";
    }
  }
};
  const updateFacing = () => {
  const isFacingLocked = (f: Fighter) => {
    return (
      f.state === "LIGHT" ||
      f.state === "HEAVY" ||
      f.state === "ABILITY" ||
      f.state === "HITSTUN" ||
      f.state === "KO" ||
      f.state === "BLOCK"
    );
  };

  if (!isFacingLocked(player)) {
    player.facing = player.x < enemy.x ? 1 : -1;
  }

  if (!isFacingLocked(enemy)) {
    enemy.facing = enemy.x < player.x ? 1 : -1;
  }
};

const resolveBodyPush = () => {
  const pBox = getHurtBox(player);
  const eBox = getHurtBox(enemy);

  if (!rectsOverlap(pBox, eBox)) return;

  const pRight = pBox.x + pBox.w;
  const eRight = eBox.x + eBox.w;

  const overlap = Math.min(pRight, eRight) - Math.max(pBox.x, eBox.x);
  if (overlap <= 0) return;

  const wallPad = 70;
  const leftBound = wallPad;
  const rightBound = cssW - wallPad;

  const pAtLeftWall = player.x <= leftBound;
  const pAtRightWall = player.x >= rightBound;
  const eAtLeftWall = enemy.x <= leftBound;
  const eAtRightWall = enemy.x >= rightBound;

  const pAtWall = pAtLeftWall || pAtRightWall;
  const eAtWall = eAtLeftWall || eAtRightWall;

  if (pAtWall && eAtWall) return;

  let pRatio = 0.5;
  let eRatio = 0.5;

  if (pAtWall) {
    pRatio = 0;
    eRatio = 1;
  } else if (eAtWall) {
    pRatio = 1;
    eRatio = 0;
  }

  // Small padding prevents constant tiny overlaps/jitter.
  const pushAmount = overlap + 1;

  // If they are almost perfectly stacked, choose direction based on facing.
  let playerIsLeft = player.x < enemy.x;

  if (Math.abs(player.x - enemy.x) < 2) {
    playerIsLeft = player.facing === 1;
  }

  if (playerIsLeft) {
    player.x -= pushAmount * pRatio;
    enemy.x += pushAmount * eRatio;
  } else {
    player.x += pushAmount * pRatio;
    enemy.x -= pushAmount * eRatio;
  }

  // Clamp after pushing so neither fighter gets pushed outside the stage.
  player.x = clamp(player.x, leftBound, rightBound);
  enemy.x = clamp(enemy.x, leftBound, rightBound);

  // Kill inward velocity so they don't keep vibrating into each other.
  const stillOverlapping = rectsOverlap(getHurtBox(player), getHurtBox(enemy));

  if (stillOverlapping) {
    if (playerIsLeft) {
      if (player.vx > 0) player.vx *= 0.25;
      if (enemy.vx < 0) enemy.vx *= 0.25;
    } else {
      if (player.vx < 0) player.vx *= 0.25;
      if (enemy.vx > 0) enemy.vx *= 0.25;
    }
  }
};

const updateEffects = (dt: number) => {
  // 1. Hit sparks
  for (let i = hitSparks.length - 1; i >= 0; i--) {
    const spark = hitSparks[i];

    spark.life += dt;

    // If your HitSpark type later gets vx/vy, uncomment:
    // spark.x += spark.vx * dt;
    // spark.y += spark.vy * dt;

    if (spark.life >= spark.maxLife) {
      hitSparks.splice(i, 1);
    }
  }

  // 2. Screen shake decay
  if (screenShake > 0) {
    // Strong fighting-game snap, but properly based on dt.
    screenShake = Math.max(0, screenShake - 42 * dt);

    // Extra damping so big shakes settle quickly.
    screenShake *= Math.pow(0.04, dt);

    if (screenShake < 0.05) {
      screenShake = 0;
    }
  }
};
   const updateGame = (dt: number) => {
  if (!gameStarted) {
    if (consumePressed(" ") || consumePressed("enter")) {
      resetGame(true);
    }
    return;
  }

  if (roundOver) {
    if (consumePressed("r") || consumePressed(" ")) {
      resetGame(true);
    }

    updateFighterPhysics(player, dt);
    updateFighterPhysics(enemy, dt);

    resolveBodyPush();

    updateFighterTimers(player, dt);
    updateFighterTimers(enemy, dt);

    updateEffects(dt);
    return;
  }

  // Hitstop freezes fighters, AI, timers, attacks, and spark life.
  // Screen shake still decays so the impact feels snappy.
  if (hitStop > 0) {
    hitStop = Math.max(0, hitStop - dt);

    if (screenShake > 0) {
      screenShake = Math.max(0, screenShake - 42 * dt);
      screenShake *= Math.pow(0.04, dt);

      if (screenShake < 0.05) {
        screenShake = 0;
      }
    }

    return;
  }

  roundTimer -= dt;

  if (roundTimer <= 0) {
    roundTimer = 0;
    roundOver = true;

    if (player.hp > enemy.hp) {
      winnerText = "PLAYER WINS";
    } else if (enemy.hp > player.hp) {
      winnerText = "RIVAL WINS";
    } else {
      winnerText = "DRAW";
    }
  }

  updateFacing();

  updatePlayerInput(dt);
  updateEnemyAI(dt);

  updateFighterPhysics(player, dt);
  updateFighterPhysics(enemy, dt);

  resolveBodyPush();

  updateFacing();

  updateFighterTimers(player, dt);
  updateFighterTimers(enemy, dt);

  resolveAttack(player, enemy);
  resolveAttack(enemy, player);

  updateEffects(dt);
};
    // =========================================================
    // DRAW HELPERS
    // =========================================================

 const drawPixelRect = (
  x: number,
  y: number,
  w: number,
  h: number,
  color: string,
  alpha = 1,
  shadow = false
) => {
  let px = x;
  let py = y;
  let pw = w;
  let ph = h;

  if (pw < 0) {
    px += pw;
    pw = Math.abs(pw);
  }

  if (ph < 0) {
    py += ph;
    ph = Math.abs(ph);
  }

  const rx = Math.round(px);
  const ry = Math.round(py);
  const rw = Math.round(pw);
  const rh = Math.round(ph);

  if (shadow) {
    ctx.fillStyle = "rgba(0,0,0,0.25)";
    ctx.fillRect(rx + 2, ry + 2, rw, rh);
  }

  const needsAlpha = alpha < 1;
  if (needsAlpha) ctx.globalAlpha = alpha;

  ctx.fillStyle = color;
  ctx.fillRect(rx, ry, rw, rh);

  if (needsAlpha) ctx.globalAlpha = 1;
};

    const drawCenteredText = (
  text: string,
  x: number,
  y: number,
  size: number,
  color: string,
  bold = true,
  stroke = true // New: Adds high-readability border
) => {
  const rx = (x + 0.5) | 0;
  const ry = (y + 0.5) | 0;

  ctx.textAlign = "center";
  ctx.font = `${bold ? "bold " : ""}${size}px "Courier New", monospace`;

  if (stroke) {
    // 1. Draw a thick "outline" by offset drawing or native stroke
    ctx.strokeStyle = "#000000";
    ctx.lineWidth = Math.max(2, size * 0.08); // Scale stroke with text size
    ctx.lineJoin = "round";
    ctx.strokeText(text, rx, ry);
  } else {
    // 2. Simple drop shadow for a cleaner look if stroke is off
    ctx.fillStyle = "rgba(0,0,0,0.5)";
    ctx.fillText(text, rx + 2, ry + 2);
  }

  // 3. Main Text
  ctx.fillStyle = color;
  ctx.fillText(text, rx, ry);
};

const drawBackground = () => {
  const now = performance.now();
  const time = now * 0.001;
  const slowTime = now * 0.0005;

  const midpoint = (player.x + enemy.x) * 0.5;
  const camX = (midpoint - cssW * 0.5) * 0.08;
  const roofY = floorY();

  const seeded = (n: number) => {
    const s = Math.sin(n * 999.137) * 43758.5453;
    return s - Math.floor(s);
  };

  const wrapX = (x: number, range: number) => {
    let v = x % range;
    if (v < -range * 0.5) v += range;
    if (v > range * 0.5) v -= range;
    return v;
  };

  const drawGlowRect = (
    x: number,
    y: number,
    w: number,
    h: number,
    color: string,
    alpha = 1,
    blur = 10
  ) => {
    ctx.save();
    ctx.globalAlpha = alpha;
    ctx.shadowBlur = blur;
    ctx.shadowColor = color;
    ctx.fillStyle = color;
    ctx.fillRect(Math.round(x), Math.round(y), Math.round(w), Math.round(h));
    ctx.restore();
  };

  const drawBuildingWindows = (
    bx: number,
    by: number,
    bw: number,
    bh: number,
    seedOffset: number,
    alpha = 0.45
  ) => {
    for (let wy = by + 18; wy < by + bh - 20; wy += 24) {
      for (let wx = bx + 12; wx < bx + bw - 12; wx += 18) {
        const r = seeded(wx * 0.13 + wy * 0.31 + seedOffset);
        if (r > 0.56) {
          const c = r > 0.82 ? "#fde047" : r > 0.68 ? "#22d3ee" : "#a78bfa";
          drawPixelRect(wx, wy, 5, 3, c, alpha * (0.55 + r * 0.45));
        }
      }
    }
  };

  const drawNeonSign = (
    x: number,
    y: number,
    color: string,
    seedOffset: number,
    labelType: "blocks" | "lines" | "cross"
  ) => {
    const flicker = seeded(Math.floor(time * 4) + seedOffset) > 0.92 ? 0.32 : 1;

    ctx.save();
    ctx.shadowBlur = 18;
    ctx.shadowColor = color;

    drawPixelRect(x, y, 14, 126, "#111827", 0.95);
    drawPixelRect(x + 1, y + 1, 12, 124, "#020617", 0.92);

    if (labelType === "blocks") {
      for (let i = 0; i < 4; i++) {
        drawPixelRect(x + 4, y + 12 + i * 27, 6, 16, color, 0.82 * flicker);
        drawPixelRect(x + 3, y + 13 + i * 27, 8, 2, "#ffffff", 0.16 * flicker);
      }
    }

    if (labelType === "lines") {
      for (let i = 0; i < 7; i++) {
        drawPixelRect(x + 3, y + 11 + i * 15, 8, 3, color, 0.76 * flicker);
      }
    }

    if (labelType === "cross") {
      for (let i = 0; i < 4; i++) {
        const yy = y + 17 + i * 25;
        drawPixelRect(x + 3, yy, 8, 3, color, 0.84 * flicker);
        drawPixelRect(x + 6, yy - 5, 2, 13, color, 0.7 * flicker);
      }
    }

    ctx.restore();
  };

  // =========================================================
  // 1. SKY GRADIENT
  // =========================================================
  const sky = ctx.createLinearGradient(0, 0, 0, cssH);
  sky.addColorStop(0, "#020617");
  sky.addColorStop(0.42, "#11103f");
  sky.addColorStop(0.72, "#1e1b4b");
  sky.addColorStop(1, "#312e81");
  ctx.fillStyle = sky;
  ctx.fillRect(0, 0, cssW, cssH);

  // =========================================================
  // 2. NEBULA / CITY LIGHT BLOOM
  // =========================================================
  ctx.save();
  ctx.globalCompositeOperation = "screen";

  const nebulaX = cssW * 0.28 - camX * 0.18;
  const nebulaY = 135 + Math.sin(slowTime * 2) * 8;
  const nebula = ctx.createRadialGradient(nebulaX, nebulaY, 0, nebulaX, nebulaY, 460);
  nebula.addColorStop(0, "rgba(79,70,229,0.2)");
  nebula.addColorStop(0.36, "rgba(168,85,247,0.09)");
  nebula.addColorStop(0.7, "rgba(14,165,233,0.035)");
  nebula.addColorStop(1, "rgba(0,0,0,0)");
  ctx.fillStyle = nebula;
  ctx.fillRect(0, 0, cssW, roofY);

  const horizonGlow = ctx.createLinearGradient(0, roofY - 220, 0, roofY + 20);
  horizonGlow.addColorStop(0, "rgba(0,242,255,0)");
  horizonGlow.addColorStop(0.55, "rgba(0,242,255,0.06)");
  horizonGlow.addColorStop(1, "rgba(255,0,85,0.08)");
  ctx.fillStyle = horizonGlow;
  ctx.fillRect(0, roofY - 220, cssW, 250);

  ctx.restore();

  // =========================================================
  // 3. STARS
  // =========================================================
  for (let i = 0; i < 72; i++) {
    const sx = seeded(i * 11.7) * cssW;
    const sy = seeded(i * 31.2) * (roofY - 90);
    const twinkle = 0.18 + Math.abs(Math.sin(time * 1.3 + i)) * 0.55;
    const size = seeded(i * 4.4) > 0.84 ? 2 : 1;
    drawPixelRect(sx, sy, size, size, "#ffffff", twinkle);
  }

  // Shooting star
  const shootingCycle = time % 6.5;
  if (shootingCycle < 0.55) {
    const t = shootingCycle / 0.55;
    const sx = cssW * 0.12 + t * cssW * 0.72;
    const sy = 70 + t * 54;
    drawGlowRect(sx, sy, 54, 2, "#ffffff", 0.35 * (1 - t), 16);
    drawPixelRect(sx + 48, sy + 1, 8, 1, "#22d3ee", 0.35 * (1 - t));
  }

  // =========================================================
  // 4. RADIANT CRESCENT MOON
  // =========================================================
  ctx.save();
  ctx.translate(-camX * 0.08, 0);

  const moonX = cssW * 0.78;
  const moonY = 118;
  const moonSize = 48;

  const hugeGlow = ctx.createRadialGradient(moonX, moonY, 0, moonX, moonY, 220);
  hugeGlow.addColorStop(0, "rgba(255,255,255,0.18)");
  hugeGlow.addColorStop(0.38, "rgba(147,197,253,0.07)");
  hugeGlow.addColorStop(1, "rgba(0,0,0,0)");
  ctx.fillStyle = hugeGlow;
  ctx.fillRect(moonX - 240, moonY - 240, 480, 480);

  ctx.shadowBlur = 42;
  ctx.shadowColor = "#ffffff";
  ctx.fillStyle = "#ffffff";
  ctx.beginPath();
  ctx.arc(moonX, moonY, moonSize, 0, Math.PI * 2);
  ctx.fill();

  ctx.shadowBlur = 0;
  ctx.fillStyle = "#020617";
  ctx.beginPath();
  ctx.arc(moonX - 22, moonY - 11, moonSize + 1, 0, Math.PI * 2);
  ctx.fill();

  ctx.strokeStyle = "rgba(255,255,255,0.42)";
  ctx.lineWidth = 2;
  ctx.beginPath();
  ctx.arc(moonX, moonY, moonSize, -1.1, 1.25);
  ctx.stroke();

  drawPixelRect(moonX + 27, moonY - 30, 2, 60, "#ffffff", 0.2);

  ctx.restore();

  // =========================================================
  // 5. FAR CITY SILHOUETTE
  // =========================================================
  ctx.save();
  ctx.translate(-camX * 0.22, 0);

  for (let i = 0; i < 13; i++) {
    const bw = 54 + seeded(i * 8.1) * 42;
    const bh = 130 + seeded(i * 18.8) * 150;
    const bx = i * 130 - 80;
    const by = roofY - bh;

    drawPixelRect(bx, by, bw, bh, "#18164a", 0.9);
    drawBuildingWindows(bx, by, bw, bh, i * 100, 0.22);

    if (seeded(i * 6.2) > 0.65) {
      drawPixelRect(bx + bw * 0.45, by - 28, 8, 28, "#18164a", 0.9);
      drawPixelRect(bx + bw * 0.45 + 3, by - 46, 2, 18, "#18164a", 0.9);
    }
  }

  ctx.restore();

  // =========================================================
  // 6. MAIN NEO-TOKYO CITY
  // =========================================================
  ctx.save();
  ctx.translate(-camX * 0.42, 0);

  const buildings = [
    { x: -50, w: 86, h: 300, c: "#020617", sign: "#a855f7" },
    { x: 105, w: 118, h: 410, c: "#030712", sign: "#22d3ee" },
    { x: 295, w: 76, h: 280, c: "#09090b", sign: "#ff0055" },
    { x: 450, w: 96, h: 350, c: "#020617", sign: "#facc15" },
    { x: 655, w: 126, h: 455, c: "#030712", sign: "#ff0055" },
    { x: 875, w: 96, h: 330, c: "#09090b", sign: "#22d3ee" },
    { x: 1040, w: 120, h: 390, c: "#020617", sign: "#a855f7" },
    { x: 1240, w: 82, h: 305, c: "#09090b", sign: "#facc15" },
  ];

  buildings.forEach((b, i) => {
    const bx = b.x;
    const by = roofY - b.h;

    drawPixelRect(bx - 4, by - 4, b.w + 8, b.h + 4, "rgba(0,0,0,0.35)");
    drawPixelRect(bx, by, b.w, b.h, b.c);

    // Side shade
    drawPixelRect(bx + b.w - 10, by, 10, b.h, "rgba(255,255,255,0.035)");
    drawPixelRect(bx, by, 5, b.h, "rgba(0,0,0,0.45)");

    // Rooftop antenna / shapes
    if (i % 2 === 0) {
      drawPixelRect(bx + b.w * 0.45, by - 36, 8, 36, "#020617");
      drawPixelRect(bx + b.w * 0.45 + 3, by - 64, 2, 28, "#020617");
      drawGlowRect(bx + b.w * 0.45 + 1, by - 68, 6, 4, "#ff0055", 0.65, 12);
    } else {
      drawPixelRect(bx + 18, by - 20, b.w - 36, 20, "#020617");
    }

    drawBuildingWindows(bx, by, b.w, b.h, i * 300, 0.5);

    if (b.h > 315) {
      const signX = i % 2 === 0 ? bx + b.w + 5 : bx - 19;
      const signY = by + 58;
      const type = i % 3 === 0 ? "blocks" : i % 3 === 1 ? "lines" : "cross";
      drawNeonSign(signX, signY, b.sign, i * 12, type);
    }
  });

  // Rooftop antenna details instead of floating sky bridges
  buildings.forEach((b, i) => {
    if (i % 2 !== 0) return;

    const bx = b.x + b.w * 0.5;
    const by = roofY - b.h;

    drawPixelRect(bx - 3, by - 44, 6, 44, "#020617", 0.95);
    drawPixelRect(bx - 1, by - 68, 2, 24, "#020617", 0.95);
    drawPixelRect(bx - 12, by - 35, 24, 3, "#020617", 0.95);

    drawGlowRect(bx - 3, by - 72, 6, 4, "#ff0055", 0.65, 12);
  });
  // City smog
  const cityMist = ctx.createLinearGradient(0, roofY - 150, 0, roofY);
  cityMist.addColorStop(0, "rgba(30,27,75,0)");
  cityMist.addColorStop(0.52, "rgba(30,27,75,0.28)");
  cityMist.addColorStop(1, "rgba(2,6,23,0.82)");
  ctx.fillStyle = cityMist;
  ctx.fillRect(-400, roofY - 150, cssW + 800, 160);

  ctx.restore();

  // =========================================================
  // 7. POWER LINES
  // =========================================================
  ctx.save();
  ctx.strokeStyle = "rgba(0,0,0,0.62)";
  ctx.lineWidth = 3;

  ctx.beginPath();
  ctx.moveTo(-50, 54);
  ctx.bezierCurveTo(cssW * 0.25, 94, cssW * 0.46, 78, cssW * 0.68, 12);
  ctx.stroke();

  ctx.lineWidth = 2;
  ctx.beginPath();
  ctx.moveTo(-40, 146);
  ctx.bezierCurveTo(cssW * 0.3, 198, cssW * 0.68, 118, cssW + 60, 174);
  ctx.stroke();

  for (let i = 0; i < 5; i++) {
    const px = 80 + i * 220 - camX * 0.1;
    drawPixelRect(px, 52 + Math.sin(i) * 16, 6, 18, "rgba(0,0,0,0.55)");
  }

  ctx.restore();

  // =========================================================
  // 8. FLOATING EMBERS / RAIN LIGHT SPECS
  // =========================================================
  for (let i = 0; i < 24; i++) {
    const drift = (time * (18 + i * 0.55)) % (cssW + 140);
    const ex = ((i * 117 + drift) % (cssW + 140)) - 70;
    const ey = roofY - 210 + Math.sin(time * 0.8 + i) * 64 + seeded(i) * 120;
    const a = 0.12 + seeded(i * 12) * 0.28;
    const c = i % 3 === 0 ? "#fbbf24" : i % 3 === 1 ? "#22d3ee" : "#ff0055";
    drawPixelRect(ex, ey, i % 4 === 0 ? 5 : 3, i % 4 === 0 ? 2 : 3, c, a);
  }

  // =========================================================
  // 9. UNDER-ROOF DEPTH / CITY BELOW
  // =========================================================
  const belowGrad = ctx.createLinearGradient(0, roofY, 0, cssH);
  belowGrad.addColorStop(0, "#171138");
  belowGrad.addColorStop(0.5, "#09090b");
  belowGrad.addColorStop(1, "#000000");
  ctx.fillStyle = belowGrad;
  ctx.fillRect(0, roofY, cssW, cssH - roofY);

  for (let i = 0; i < 30; i++) {
    const lx = seeded(i * 9.9) * cssW;
    const ly = roofY + 35 + seeded(i * 17.7) * 115;
    const c = seeded(i) > 0.5 ? "#fde047" : "#22d3ee";
    drawPixelRect(lx, ly, 4, 2, c, 0.14 + seeded(i * 4) * 0.16);
  }

  // =========================================================
  // 10. ROOFTOP BACK DETAILS
  // =========================================================
  for (let i = 0; i < 5; i++) {
    const vx = wrapX(i * 280 - camX * 0.62, cssW + 420) - 120;
    const vy = roofY - 42;

    drawPixelRect(vx, vy, 56, 42, "#09090b");
    drawPixelRect(vx + 4, vy + 4, 48, 3, "rgba(255,255,255,0.07)");
    drawPixelRect(vx + 8, vy + 13, 40, 5, "#020617");
    drawPixelRect(vx + 8, vy + 24, 40, 5, "#020617");

    const spin = (time * 20 + i * 7) % 20;
    for (let b = 0; b < 3; b++) {
      const bx = vx + 15 + ((spin + b * 8) % 24);
      drawPixelRect(bx, vy - 10, 4, 12, "#1c1917");
    }

    drawPixelRect(vx + 10, vy - 12, 34, 6, "#09090b");
  }

  // Steam vents
  for (let s = 0; s < 3; s++) {
    const sx = wrapX(s * 430 - camX * 0.72, cssW + 260) - 120;

    drawPixelRect(sx - 4, roofY - 15, 38, 15, "#09090b");
    drawPixelRect(sx, roofY - 21, 30, 7, "#171717");

    for (let p = 0; p < 4; p++) {
      const rise = ((time * 24 + p * 18 + s * 8) % 72);
      const sy = roofY - 24 - rise;
      const opacity = Math.max(0, 0.14 - rise / 520);
      drawPixelRect(
        sx + p * 7 + Math.sin(time + p + s) * 5,
        sy,
        22 + p * 5,
        9,
        "#ffffff",
        opacity
      );
    }
  }

  // =========================================================
  // 11. WET ROOFTOP SURFACE
  // =========================================================
  drawPixelRect(0, roofY, cssW, 1, "rgba(255,255,255,0.18)");
  drawPixelRect(0, roofY + 1, cssW, cssH - roofY, "#09090b");

  const surfaceGrad = ctx.createLinearGradient(0, roofY, 0, cssH);
  surfaceGrad.addColorStop(0, "rgba(30,41,59,0.36)");
  surfaceGrad.addColorStop(0.35, "rgba(15,23,42,0.2)");
  surfaceGrad.addColorStop(1, "rgba(0,0,0,0.5)");
  ctx.fillStyle = surfaceGrad;
  ctx.fillRect(0, roofY, cssW, cssH - roofY);

  // Puddles
  for (let j = 0; j < 7; j++) {
    const px = wrapX(j * 220 - camX * 1.08, cssW + 440) - 180;
    const py = roofY + 9 + (j % 3) * 7;
    const pWidth = 70 + seeded(j * 9) * 58;
    const ripple = Math.sin(time * 2.2 + j) * 7;

    drawPixelRect(px, py, pWidth, 5, "rgba(30,58,138,0.32)");
    drawPixelRect(px + 10, py + 1, pWidth - 20, 1, "rgba(59,130,246,0.42)");

    if (j % 2 === 0) {
      drawPixelRect(px + pWidth - 18, py, 12, 1, "rgba(255,255,255,0.34)");
    }

    if (ripple > 4) {
      drawPixelRect(
        px + pWidth * 0.5 + ripple,
        py + 3,
        14,
        1,
        "rgba(255,255,255,0.16)"
      );
    }
  }

  // Fighter reflections
  const drawReflection = (f: Fighter, color: string) => {
    ctx.save();

    const grad = ctx.createRadialGradient(f.x, roofY, 0, f.x, roofY, 170);
    grad.addColorStop(0, color);
    grad.addColorStop(0.45, "rgba(59,130,246,0.045)");
    grad.addColorStop(1, "rgba(0,0,0,0)");

    ctx.globalCompositeOperation = "screen";
    ctx.fillStyle = grad;
    ctx.setTransform(1, 0, 0, 0.28, 0, roofY * 0.72);
    ctx.fillRect(f.x - 180, 0, 360, 340);

    ctx.restore();
  };

  drawReflection(player, "rgba(59,130,246,0.22)");
  drawReflection(enemy, "rgba(239,68,68,0.2)");

  // Industrial floor panels / pipes
  for (let x = -140; x < cssW + 220; x += 160) {
    const sx = x - (camX % 160);

    drawPixelRect(sx, roofY, 150, 4, "#262626");
    drawPixelRect(sx + 6, roofY + 4, 1, 58, "rgba(255,255,255,0.035)");

    if (x % 320 === 0) {
      drawPixelRect(sx + 20, roofY + 17, 124, 12, "#171717");
      drawPixelRect(sx + 38, roofY + 13, 10, 20, "#262626");
      drawPixelRect(sx + 100, roofY + 20, 5, 5, "#ef4444", 0.35 + Math.abs(Math.sin(time * 3)) * 0.5);
    }

    for (let h = 0; h < 4; h++) {
      drawPixelRect(sx + 12 + h * 16, roofY + 7, 8, 3, "#fde047", 0.12);
    }
  }

  // Foreground ledge
  const ledgeY = cssH - 54;
  const edgeGrad = ctx.createLinearGradient(0, ledgeY, 0, cssH);
  edgeGrad.addColorStop(0, "rgba(0,0,0,0)");
  edgeGrad.addColorStop(1, "rgba(0,0,0,0.82)");
  ctx.fillStyle = edgeGrad;
  ctx.fillRect(0, ledgeY, cssW, cssH - ledgeY);

  for (let x = -100; x < cssW + 130; x += 120) {
    const sx = x - (camX % 120);
    drawPixelRect(sx, roofY, 110, 15, "#1c1917");
    drawPixelRect(sx + 8, roofY + 2, 96, 2, "rgba(255,255,255,0.04)");
    drawPixelRect(sx + 16, roofY + 22, 42, 5, "rgba(255,255,255,0.045)");
  }

  // =========================================================
  // 12. SCANLINES / VIGNETTE
  // =========================================================
  ctx.save();
  ctx.globalAlpha = 0.08;
  ctx.fillStyle = "#000000";
  for (let y = 0; y < cssH; y += 4) {
    ctx.fillRect(0, y, cssW, 1);
  }
  ctx.restore();

  const vig = ctx.createRadialGradient(
    cssW / 2,
    cssH / 2,
    cssW * 0.24,
    cssW / 2,
    cssH / 2,
    cssW * 0.82
  );
  vig.addColorStop(0, "rgba(0,0,0,0)");
  vig.addColorStop(0.65, "rgba(0,0,0,0.14)");
  vig.addColorStop(1, "rgba(0,0,0,0.62)");
  ctx.fillStyle = vig;
  ctx.fillRect(0, 0, cssW, cssH);
};

const drawHealthBar = (
  x: number,
  y: number,
  w: number,
  h: number,
  f: Fighter,
  align: "left" | "right"
) => {
  const hpPct = clamp(f.hp / f.maxHp, 0, 1);
  const staminaPct = clamp(f.stamina / f.maxStamina, 0, 1);
  const time = performance.now();
  const pulse = (Math.sin(time * 0.01) + 1) / 2;

  const danger = hpPct <= 0.3;
  const critical = hpPct <= 0.16;

  const hpTrackX = x;
  const hpTrackY = y;
  const hpTrackW = w;
  const hpTrackH = h;

  const hpFillW = Math.max(0, hpTrackW * hpPct);
  const hpFillX =
    align === "left" ? hpTrackX : hpTrackX + hpTrackW - hpFillW;

  const staminaTrackY = y + h + 9;
  const staminaTrackH = 7;

  const staminaFillW = Math.max(0, hpTrackW * staminaPct);
  const staminaFillX =
    align === "left"
      ? hpTrackX
      : hpTrackX + hpTrackW - staminaFillW;

  const hpColor =
    hpPct > 0.55 ? "#22c55e" : hpPct > 0.28 ? "#facc15" : "#ff0055";

  const hpGlow =
    hpPct > 0.55
      ? "rgba(34,197,94,0.8)"
      : hpPct > 0.28
      ? "rgba(250,204,21,0.8)"
      : "rgba(255,0,85,0.95)";

  // =========================================================
  // HP TRACK
  // =========================================================
  ctx.save();

  // Outer black inset
  drawPixelRect(hpTrackX - 3, hpTrackY - 3, hpTrackW + 6, hpTrackH + 6, "#020617");

  // Empty HP track
  drawPixelRect(hpTrackX, hpTrackY, hpTrackW, hpTrackH, "#111827");

  // Low health warning glow inside the empty track
  if (danger) {
    drawPixelRect(
      hpTrackX,
      hpTrackY,
      hpTrackW,
      hpTrackH,
      `rgba(255,0,85,${0.08 + pulse * 0.12})`
    );
  }

  // HP fill
  if (hpFillW > 0) {
    ctx.shadowBlur = critical ? 18 : 11;
    ctx.shadowColor = hpGlow;
    drawPixelRect(hpFillX, hpTrackY, hpFillW, hpTrackH, hpColor);
    ctx.shadowBlur = 0;

    // Glass shine
    drawPixelRect(
      hpFillX,
      hpTrackY,
      hpFillW,
      Math.max(2, hpTrackH * 0.38),
      "rgba(255,255,255,0.16)"
    );

    // Dark lower edge
    drawPixelRect(
      hpFillX,
      hpTrackY + hpTrackH - 3,
      hpFillW,
      2,
      "rgba(2,6,23,0.25)"
    );
  }

  // HP chunk dividers
  for (let i = 1; i < 10; i++) {
    const tx = hpTrackX + (hpTrackW / 10) * i;
    drawPixelRect(tx, hpTrackY, 2, hpTrackH, "rgba(2,6,23,0.55)");
  }

  // Critical glitch, only inside HP track
  if (critical) {
    for (let i = 0; i < 4; i++) {
      drawPixelRect(
        hpTrackX + Math.random() * hpTrackW,
        hpTrackY + Math.random() * hpTrackH,
        8 + Math.random() * 18,
        2,
        i % 2 === 0 ? "rgba(255,0,85,0.5)" : "rgba(255,255,255,0.25)"
      );
    }
  }

  ctx.restore();

  // =========================================================
  // STAMINA TRACK
  // =========================================================
  ctx.save();

  drawPixelRect(
    hpTrackX - 2,
    staminaTrackY - 2,
    hpTrackW + 4,
    staminaTrackH + 4,
    "#020617"
  );

  drawPixelRect(hpTrackX, staminaTrackY, hpTrackW, staminaTrackH, "#0f172a");

  if (staminaFillW > 0) {
    ctx.shadowBlur = staminaPct >= 0.28 ? 9 : 0;
    ctx.shadowColor = "#38bdf8";

    drawPixelRect(
      staminaFillX,
      staminaTrackY,
      staminaFillW,
      staminaTrackH,
      "#38bdf8"
    );

    ctx.shadowBlur = 0;

    drawPixelRect(
      staminaFillX,
      staminaTrackY,
      staminaFillW,
      2,
      "rgba(255,255,255,0.32)"
    );
  }

  for (let i = 1; i < 14; i++) {
    const tx = hpTrackX + (hpTrackW / 14) * i;
    drawPixelRect(tx, staminaTrackY, 1, staminaTrackH, "rgba(2,6,23,0.7)");
  }

  if (staminaPct < 0.28) {
    drawPixelRect(
      hpTrackX,
      staminaTrackY,
      hpTrackW,
      staminaTrackH,
      `rgba(255,0,85,${0.08 + pulse * 0.08})`
    );
  }

  ctx.restore();

  // =========================================================
  // SMALL HP TEXT
  // =========================================================
  ctx.save();

  ctx.textAlign = align === "left" ? "right" : "left";
  ctx.font = "bold 10px 'Courier New', monospace";
  ctx.fillStyle = "rgba(255,255,255,0.72)";
  ctx.shadowBlur = 6;
  ctx.shadowColor = hpColor;

  ctx.fillText(
    `${Math.ceil(f.hp)} / ${f.maxHp}`,
    align === "left" ? hpTrackX + hpTrackW : hpTrackX,
    staminaTrackY + 21
  );

  ctx.restore();
};

const drawHUD = () => {
  const time = performance.now();
  const pulse = (Math.sin(time * 0.006) + 1) / 2;
  const timerIsDanger = roundTimer <= 10;
  const timerColor = timerIsDanger ? "#ff0055" : "#00f2ff";

  const drawHudPanel = (
    x: number,
    y: number,
    w: number,
    h: number,
    side: "left" | "right" | "center"
  ) => {
    ctx.save();

    const grad = ctx.createLinearGradient(x, y, x, y + h);
    grad.addColorStop(0, "rgba(30,41,59,0.94)");
    grad.addColorStop(0.45, "rgba(2,6,23,0.92)");
    grad.addColorStop(1, "rgba(15,23,42,0.82)");

    ctx.beginPath();

    if (side === "left") {
      ctx.moveTo(x, y);
      ctx.lineTo(x + w - 22, y);
      ctx.lineTo(x + w, y + h);
      ctx.lineTo(x + 12, y + h);
    } else if (side === "right") {
      ctx.moveTo(x + 22, y);
      ctx.lineTo(x + w, y);
      ctx.lineTo(x + w - 12, y + h);
      ctx.lineTo(x, y + h);
    } else {
      ctx.moveTo(x + 14, y);
      ctx.lineTo(x + w - 14, y);
      ctx.lineTo(x + w, y + 14);
      ctx.lineTo(x + w - 14, y + h);
      ctx.lineTo(x + 14, y + h);
      ctx.lineTo(x, y + 14);
    }

    ctx.closePath();
    ctx.fillStyle = grad;
    ctx.fill();

    ctx.strokeStyle = "rgba(56,189,248,0.42)";
    ctx.lineWidth = 2;
    ctx.stroke();

    ctx.strokeStyle = "rgba(255,0,85,0.28)";
    ctx.lineWidth = 1;
    ctx.beginPath();
    ctx.moveTo(x + 14, y + h - 6);
    ctx.lineTo(x + w - 14, y + h - 6);
    ctx.stroke();

    ctx.restore();
  };

  const drawHudName = (
    label: string,
    f: Fighter,
    x: number,
    y: number,
    align: "left" | "right"
  ) => {
    const hpPct = clamp(f.hp / f.maxHp, 0, 1);
    const danger = hpPct <= 0.3;

    ctx.save();

    ctx.textAlign = align;
    ctx.font = "bold 13px 'Courier New', monospace";
    ctx.fillStyle = "#ffffff";
    ctx.shadowBlur = 8;
    ctx.shadowColor = danger ? "#ff0055" : "#00f2ff";
    ctx.fillText(label, x, y);

    ctx.shadowBlur = 0;
    ctx.font = "9px 'Courier New', monospace";
    ctx.fillStyle = danger ? "rgba(255,0,85,0.8)" : "rgba(148,163,184,0.78)";
    ctx.fillText(
      danger ? "DANGER / LOW VITALS" : "VITAL SYNC ONLINE",
      x,
      y + 12
    );

    ctx.restore();
  };

  const drawHudGlitch = (x: number, y: number, w: number, active: boolean) => {
    if (!active) return;

    ctx.save();

    for (let i = 0; i < 5; i++) {
      const gx = x + Math.random() * w;
      const gy = y + Math.random() * 42;
      const gw = 8 + Math.random() * 24;

      ctx.globalAlpha = 0.16 + Math.random() * 0.18;
      ctx.fillStyle = i % 2 === 0 ? "#00f2ff" : "#ff0055";
      ctx.fillRect(gx, gy, gw, 2);
    }

    ctx.restore();
  };

  // =========================================================
  // TOP ATMOSPHERE
  // =========================================================
  const topGrad = ctx.createLinearGradient(0, 0, 0, 128);
  topGrad.addColorStop(0, "rgba(2,6,23,0.94)");
  topGrad.addColorStop(0.45, "rgba(2,6,23,0.62)");
  topGrad.addColorStop(1, "rgba(2,6,23,0)");
  ctx.fillStyle = topGrad;
  ctx.fillRect(0, 0, cssW, 128);

  ctx.save();
  ctx.globalAlpha = 0.12;
  ctx.fillStyle = "#00f2ff";
  ctx.fillRect(0, 0, cssW, 2);
  ctx.globalAlpha = 0.08;
  ctx.fillRect(0, 88, cssW, 1);
  ctx.restore();

  // =========================================================
  // PLAYER HUD
  // =========================================================
  drawHudPanel(34, 24, 386, 78, "left");
  drawHudName(player.name.toUpperCase(), player, 58, 41, "left");
  drawHudGlitch(50, 50, 350, player.hurtFlash > 0);
  drawHealthBar(58, 58, 330, 18, player, "left");

  // =========================================================
  // ENEMY HUD
  // =========================================================
  drawHudPanel(cssW - 420, 24, 386, 78, "right");
  drawHudName(enemy.name.toUpperCase(), enemy, cssW - 58, 41, "right");
  drawHudGlitch(cssW - 400, 50, 350, enemy.hurtFlash > 0);
  drawHealthBar(cssW - 388, 58, 330, 18, enemy, "right");

  // =========================================================
  // CENTER TIMER
  // =========================================================
  const tx = cssW * 0.5;
  const ty = 53;

  drawHudPanel(tx - 58, 22, 116, 64, "center");

  ctx.save();

  ctx.globalAlpha = 0.2 + pulse * 0.16;
  ctx.fillStyle = timerColor;
  ctx.beginPath();
  ctx.ellipse(tx, ty, 48 + pulse * 4, 25 + pulse * 2, 0, 0, Math.PI * 2);
  ctx.fill();

  ctx.globalAlpha = 1;

  ctx.strokeStyle = timerColor;
  ctx.lineWidth = 3;
  ctx.shadowBlur = timerIsDanger ? 16 : 10;
  ctx.shadowColor = timerColor;

  ctx.beginPath();
  ctx.moveTo(tx - 39, ty - 24);
  ctx.lineTo(tx - 52, ty - 24);
  ctx.lineTo(tx - 52, ty + 24);
  ctx.lineTo(tx - 39, ty + 24);
  ctx.stroke();

  ctx.beginPath();
  ctx.moveTo(tx + 39, ty - 24);
  ctx.lineTo(tx + 52, ty - 24);
  ctx.lineTo(tx + 52, ty + 24);
  ctx.lineTo(tx + 39, ty + 24);
  ctx.stroke();

  ctx.fillStyle = "#facc15";
  ctx.shadowBlur = 8;
  ctx.shadowColor = "#facc15";
  ctx.fillRect(tx - 12, ty - 31, 24, 3);
  ctx.fillRect(tx - 12, ty + 29, 24, 3);

  ctx.restore();

  drawCenteredText(`${Math.ceil(roundTimer)}`, tx, ty + 12, 34, timerColor, true, true);

  if (timerIsDanger) {
    ctx.save();
    ctx.globalAlpha = 0.18 + pulse * 0.18;
    ctx.fillStyle = "#ff0055";
    ctx.fillRect(tx - 44, ty - 2, 88, 3);
    ctx.restore();
  }

  // =========================================================
  // BOTTOM CONTROL CHIP
  // =========================================================
  const canUseAbility = player.stamina >= 28;
  const chipW = 410;
  const chipH = 62;
  const chipX = cssW - chipW - 24;
  const chipY = cssH - chipH - 22;
  const abilityColor = canUseAbility ? "#00f2ff" : "rgba(255,255,255,0.24)";

  ctx.save();

  const chipGrad = ctx.createLinearGradient(chipX, chipY, chipX, chipY + chipH);
  chipGrad.addColorStop(0, "rgba(15,23,42,0.76)");
  chipGrad.addColorStop(1, "rgba(2,6,23,0.72)");

  ctx.fillStyle = chipGrad;
  ctx.beginPath();
  ctx.moveTo(chipX + 12, chipY);
  ctx.lineTo(chipX + chipW, chipY);
  ctx.lineTo(chipX + chipW - 12, chipY + chipH);
  ctx.lineTo(chipX, chipY + chipH);
  ctx.closePath();
  ctx.fill();

  ctx.strokeStyle = canUseAbility
    ? `rgba(0,242,255,${0.35 + pulse * 0.3})`
    : "rgba(148,163,184,0.18)";
  ctx.lineWidth = 2;
  ctx.stroke();

  ctx.fillStyle = abilityColor;
  ctx.shadowBlur = canUseAbility ? 16 : 0;
  ctx.shadowColor = "#00f2ff";
  ctx.fillRect(chipX + 16, chipY + 14, 8, 8);
  ctx.fillRect(chipX + 16, chipY + 28, 8, 8);
  ctx.fillRect(chipX + 16, chipY + 42, 8, 8);

  ctx.shadowBlur = 0;

  ctx.textAlign = "right";
  ctx.font = "bold 12px 'Courier New', monospace";
  ctx.fillStyle = abilityColor;
  ctx.fillText(
    canUseAbility ? "READY: [SHIFT] TELEPORT" : "CHARGING: TELEPORT OFFLINE",
    chipX + chipW - 18,
    chipY + 20
  );

  ctx.font = "10px 'Courier New', monospace";
  ctx.fillStyle = "rgba(255,255,255,0.48)";
  ctx.fillText("[W,A,S,D] MOVE / CROUCH / BLOCK", chipX + chipW - 18, chipY + 39);
  ctx.fillText("[SPC] JAB   [ENT] HOOK   [SHIFT] TELEPORT", chipX + chipW - 18, chipY + 53);

  if (canUseAbility) {
    for (let i = 0; i < 5; i++) {
      ctx.globalAlpha = 0.2 + Math.random() * 0.25;
      ctx.fillStyle = i % 2 === 0 ? "#00f2ff" : "#ff0055";
      ctx.fillRect(
        chipX + 32 + Math.random() * 90,
        chipY + 10 + Math.random() * 42,
        10 + Math.random() * 22,
        2
      );
    }
  }

  ctx.restore();
};

const drawStickFighter = (f: Fighter) => {
  const time = performance.now();
  const stateT = f.stateTimer;
  const facing = f.facing;

  const clamp = (v: number, min: number, max: number) =>
    Math.max(min, Math.min(max, v));

  const idleBob =
    f.grounded && f.state !== "KO"
      ? Math.sin(time * 0.006 + f.x * 0.02) * 2
      : 0;

  const walkSwing = f.state === "WALK" ? Math.sin(time * 0.018) : 0;
  const crouchSquash = f.crouching || f.state === "BLOCK" ? 22 : 0;

  const bodyTop = f.y - f.height + crouchSquash + idleBob;
  const headX = f.x + facing * 4;
  const headY = bodyTop + 25;
  const neckY = bodyTop + 48;
  const chestY = bodyTop + 62;
  const waistY = bodyTop + 92;
  const hipY = bodyTop + 102;
  const footY = f.y + idleBob;

  const main = f.hurtFlash > 0 ? "#ffffff" : f.color;
  const dark = f.hurtFlash > 0 ? "#fecaca" : f.darkColor;
  const coatDark = "#030712";
  const coatMid = "#0f172a";
  const coatEdge = "#1e293b";
  const skin = "#f8c8a8";
  const skinShade = "#d89b79";

  const drawRect = (
    x: number,
    y: number,
    w: number,
    h: number,
    color: string,
    alpha = 1
  ) => {
    ctx.save();
    ctx.globalAlpha = alpha;
    ctx.fillStyle = color;
    ctx.fillRect(Math.round(x), Math.round(y), Math.round(w), Math.round(h));
    ctx.restore();
  };

  const drawJointedLimb = (
    x1: number,
    y1: number,
    x2: number,
    y2: number,
    x3: number,
    y3: number,
    color: string,
    width: number,
    alpha = 1
  ) => {
    ctx.save();
    ctx.globalAlpha = alpha;
    ctx.strokeStyle = color;
    ctx.lineWidth = width;
    ctx.lineCap = "round";
    ctx.lineJoin = "round";
    ctx.beginPath();
    ctx.moveTo(x1, y1);
    ctx.lineTo(x2, y2);
    ctx.lineTo(x3, y3);
    ctx.stroke();
    ctx.restore();
  };

  const drawFist = (
    x: number,
    y: number,
    size: number,
    color: string,
    outline = "#020617"
  ) => {
    ctx.save();

    ctx.fillStyle = outline;
    ctx.beginPath();
    ctx.roundRect(x - size / 2 - 2, y - size / 2 - 2, size + 4, size + 4, 5);
    ctx.fill();

    ctx.fillStyle = color;
    ctx.beginPath();
    ctx.roundRect(x - size / 2, y - size / 2, size, size, 5);
    ctx.fill();

    ctx.fillStyle = "rgba(255,255,255,0.22)";
    ctx.beginPath();
    ctx.roundRect(x - size * 0.15, y - size * 0.35, size * 0.35, size * 0.18, 2);
    ctx.fill();

    ctx.restore();
  };

  const drawBoot = (x: number, y: number, dir: number, front = false) => {
    ctx.save();
    ctx.fillStyle = "#020617";

    ctx.beginPath();
    ctx.roundRect(x - 8, y - 8, 28, 10, 3);
    ctx.fill();

    ctx.fillStyle = front ? dark : "#111827";
    ctx.fillRect(x + dir * 8, y - 10, dir * 12, 3);

    ctx.restore();
  };

  // =========================================================
  // TELEPORT AFTERIMAGES
  // =========================================================
  f.afterImages.forEach((img) => {
    const a = img.opacity;

    ctx.save();
    ctx.globalAlpha = a * 0.35;

    ctx.fillStyle = f.glowColor;
    ctx.beginPath();
    ctx.ellipse(img.x, img.y - 62, 34, 70, 0, 0, Math.PI * 2);
    ctx.fill();

    ctx.globalAlpha = a * 0.18;
    ctx.fillStyle = "#ffffff";
    ctx.fillRect(img.x - 16, img.y - 122, 32, 92);

    ctx.restore();
  });

  // =========================================================
  // ABILITY AURA
  // =========================================================
  if (f.state === "ABILITY") {
    const pulse = Math.sin(stateT * 55) * 5;

    ctx.save();

    ctx.globalAlpha = 0.18;
    ctx.fillStyle = "#000000";
    ctx.beginPath();
    ctx.ellipse(f.x, f.y - 70, 60 + pulse, 76 + pulse, 0, 0, Math.PI * 2);
    ctx.fill();

    for (let i = 0; i < 16; i++) {
      const px = f.x + Math.sin(time * 0.012 + i * 1.6) * (28 + i * 1.5);
      const py = f.y - 70 + Math.cos(time * 0.014 + i) * 58;

      ctx.globalAlpha = 0.35;
      ctx.fillStyle = i % 2 === 0 ? "#00f2ff" : "#ff0055";
      ctx.fillRect(px, py, i % 3 === 0 ? 12 : 6, i % 3 === 0 ? 3 : 6);
    }

    ctx.globalAlpha = 0.26;
    ctx.fillStyle = "#00f2ff";
    ctx.fillRect(f.x - 48, f.y - 10, 96, 4);

    ctx.globalAlpha = 0.22;
    ctx.fillStyle = "#ff0055";
    ctx.fillRect(f.x - 34, f.y - 17, 68, 3);

    ctx.restore();
  }

  // =========================================================
  // FLOOR SHADOW
  // =========================================================
  ctx.save();
  ctx.fillStyle = "rgba(0,0,0,0.34)";
  ctx.beginPath();
  ctx.ellipse(f.x, f.y + 8, 48, 11, 0, 0, Math.PI * 2);
  ctx.fill();
  ctx.restore();

  ctx.save();

  if (f.state === "KO") {
    ctx.translate(f.x, f.y - 28);
    ctx.rotate(f.facing * 1.25);
    ctx.translate(-f.x, -(f.y - 28));
  }

  // =========================================================
  // WALK / LEG TIMING
  // =========================================================
  const walkPhase = f.state === "WALK" ? time * 0.018 : 0;
  const walkA = f.state === "WALK" ? Math.sin(walkPhase) : 0;
  const walkB = f.state === "WALK" ? Math.sin(walkPhase + Math.PI) : 0;

  const stepLiftA = f.state === "WALK" ? Math.max(0, -walkA) * 8 : 0;
  const stepLiftB = f.state === "WALK" ? Math.max(0, -walkB) * 8 : 0;

  const coatSway = Math.sin(time * 0.009 + f.x * 0.02) * 4;
  const coatKick = f.state === "WALK" ? walkA * 7 : 0;
  const attackKick =
    f.state === "LIGHT" || f.state === "HEAVY" || f.state === "ABILITY"
      ? -facing * 8
      : 0;

  const coatTopY = chestY - 27;
  const coatBottomY = footY - 17;

  // =========================================================
  // CAPE / LONG COAT BACK PIECES
  // Drawn before legs so the legs sit on top.
  // =========================================================
  ctx.save();

  ctx.globalAlpha = f.state === "ABILITY" ? 0.18 : 0.08;
  ctx.fillStyle = f.glowColor;
  ctx.beginPath();
  ctx.ellipse(f.x, chestY + 24, 42, 76, 0, 0, Math.PI * 2);
  ctx.fill();

  ctx.globalAlpha = 1;

  ctx.fillStyle = coatDark;
  ctx.beginPath();
  ctx.moveTo(f.x - 25, coatTopY);
  ctx.lineTo(f.x + 25, coatTopY);
  ctx.lineTo(f.x + 30 + coatSway + coatKick + attackKick, coatBottomY);
  ctx.lineTo(f.x + 7 + coatSway * 0.4, coatBottomY - 3);
  ctx.lineTo(f.x, waistY + 10);
  ctx.lineTo(f.x - 7 + coatSway * 0.4, coatBottomY - 3);
  ctx.lineTo(f.x - 30 + coatSway - coatKick + attackKick, coatBottomY);
  ctx.closePath();
  ctx.fill();

  ctx.fillStyle = "#111827";
  ctx.beginPath();
  ctx.moveTo(f.x - 22, waistY);
  ctx.lineTo(f.x - 5, waistY + 4);
  ctx.lineTo(f.x - 8 + coatSway, coatBottomY - 4);
  ctx.lineTo(f.x - 28 + coatSway - coatKick, coatBottomY);
  ctx.closePath();
  ctx.fill();

  ctx.beginPath();
  ctx.moveTo(f.x + 22, waistY);
  ctx.lineTo(f.x + 5, waistY + 4);
  ctx.lineTo(f.x + 8 + coatSway, coatBottomY - 4);
  ctx.lineTo(f.x + 28 + coatSway + coatKick, coatBottomY);
  ctx.closePath();
  ctx.fill();

  ctx.strokeStyle = "#020617";
  ctx.lineWidth = 4;
  ctx.beginPath();
  ctx.moveTo(f.x, waistY + 5);
  ctx.lineTo(f.x + coatSway * 0.25, coatBottomY - 6);
  ctx.stroke();

  ctx.strokeStyle = "#00f2ff";
  ctx.lineWidth = 3;
  ctx.globalAlpha = f.state === "ABILITY" ? 0.85 : 0.45;
  ctx.beginPath();
  ctx.moveTo(f.x - 25, waistY + 2);
  ctx.lineTo(f.x - 30 + coatSway - coatKick + attackKick, coatBottomY);
  ctx.stroke();

  ctx.strokeStyle = "#ff0055";
  ctx.beginPath();
  ctx.moveTo(f.x + 25, waistY + 2);
  ctx.lineTo(f.x + 30 + coatSway + coatKick + attackKick, coatBottomY);
  ctx.stroke();

  ctx.restore();

  // =========================================================
  // LEGS
  // =========================================================
  const isJumpingPose = !f.grounded || f.state === "JUMP";

  const rearHipX = f.x - facing * 8;
  const leadHipX = f.x + facing * 8;

  let rearKneeX = f.x - facing * (14 + walkA * 10);
  let leadKneeX = f.x + facing * (16 + walkB * 10);

  let rearFootX = f.x - facing * (24 + walkA * 18);
  let leadFootX = f.x + facing * (28 + walkB * 18);

  let rearFootY = footY - stepLiftA;
  let leadFootY = footY - stepLiftB;

  if (isJumpingPose) {
    const jumpTuck = clamp(Math.abs(f.vy) / 900, 0, 1);

    rearKneeX = f.x - facing * (17 + jumpTuck * 4);
    rearFootX = f.x - facing * (30 + jumpTuck * 8);
    rearFootY = footY - 25 - jumpTuck * 5;

    leadKneeX = f.x + facing * (22 + jumpTuck * 4);
    leadFootX = f.x + facing * (24 - jumpTuck * 4);
    leadFootY = footY - 30 - jumpTuck * 5;
  }

  drawJointedLimb(
    rearHipX,
    hipY,
    rearKneeX,
    isJumpingPose ? footY - 62 : footY - 39 - stepLiftA * 0.4,
    rearFootX,
    rearFootY - 4,
    "#111827",
    12,
    1
  );

  drawJointedLimb(
    leadHipX,
    hipY,
    leadKneeX,
    isJumpingPose ? footY - 60 : footY - 36 - stepLiftB * 0.4,
    leadFootX,
    leadFootY - 4,
    dark,
    13,
    1
  );

  drawBoot(rearFootX, rearFootY, facing, false);
  drawBoot(leadFootX, leadFootY, facing, true);

  // =========================================================
  // UPPER COAT / BODY
  // =========================================================
  ctx.save();

  ctx.fillStyle = coatMid;
  ctx.beginPath();
  ctx.roundRect(f.x - 20, coatTopY + 4, 40, 60, 8);
  ctx.fill();

  ctx.fillStyle = "#020617";
  ctx.beginPath();
  ctx.roundRect(f.x - 15, chestY - 22, 30, 38, 6);
  ctx.fill();

  ctx.fillStyle = "#111827";
  ctx.beginPath();
  ctx.roundRect(f.x - 10, chestY - 17, 20, 27, 4);
  ctx.fill();

  drawRect(f.x - 6, chestY - 12, 12, 3, "#00f2ff", 0.85);
  drawRect(f.x - 4, chestY - 7, 8, 3, "#ff0055", 0.85);
  drawRect(f.x - 8, chestY - 2, 16, 3, "#facc15", 0.65);

  ctx.fillStyle = coatEdge;
  ctx.beginPath();
  ctx.moveTo(f.x - 21, chestY - 22);
  ctx.lineTo(f.x - 4, chestY - 5);
  ctx.lineTo(f.x - 15, chestY + 16);
  ctx.lineTo(f.x - 27, chestY - 2);
  ctx.closePath();
  ctx.fill();

  ctx.beginPath();
  ctx.moveTo(f.x + 21, chestY - 22);
  ctx.lineTo(f.x + 4, chestY - 5);
  ctx.lineTo(f.x + 15, chestY + 16);
  ctx.lineTo(f.x + 27, chestY - 2);
  ctx.closePath();
  ctx.fill();

  drawRect(f.x - 20, waistY - 2, 40, 10, "#020617");
  drawRect(f.x - 5, waistY, 10, 6, "#facc15");
  drawRect(f.x - 22, waistY + 2, 8, 3, "#00f2ff", 0.8);
  drawRect(f.x + 14, waistY + 2, 8, 3, "#ff0055", 0.8);

  ctx.restore();

  // =========================================================
  // NECK / HEAD / HAIR
  // =========================================================
  ctx.save();

  ctx.fillStyle = skinShade;
  ctx.beginPath();
  ctx.roundRect(f.x - 7, neckY - 5, 14, 15, 4);
  ctx.fill();

  ctx.fillStyle = "#020617";
  ctx.beginPath();
  ctx.roundRect(headX - 20, headY - 23, 40, 43, 9);
  ctx.fill();

  ctx.fillStyle = skin;
  ctx.beginPath();
  ctx.roundRect(headX - 17, headY - 20, 34, 38, 8);
  ctx.fill();

  ctx.fillStyle = "rgba(176,91,62,0.35)";
  ctx.beginPath();
  ctx.roundRect(headX - 17, headY + 5, 34, 13, 5);
  ctx.fill();

  ctx.fillStyle = "#020617";
  ctx.beginPath();
  ctx.roundRect(headX - 23, headY - 29, 44, 18, 6);
  ctx.fill();

  ctx.fillStyle = "#111827";
  ctx.beginPath();
  ctx.roundRect(headX - 17, headY - 35, 30, 13, 5);
  ctx.fill();

  ctx.fillStyle = "#020617";
  ctx.beginPath();
  ctx.moveTo(headX - facing * 18, headY - 28);
  ctx.lineTo(headX - facing * 3, headY - 42);
  ctx.lineTo(headX + facing * 4, headY - 27);
  ctx.closePath();
  ctx.fill();

  ctx.beginPath();
  ctx.moveTo(headX + facing * 5, headY - 30);
  ctx.lineTo(headX + facing * 23, headY - 35);
  ctx.lineTo(headX + facing * 13, headY - 15);
  ctx.closePath();
  ctx.fill();

  ctx.fillStyle = "#020617";
  ctx.beginPath();
  ctx.roundRect(headX - 18, headY - 12, 36, 8, 3);
  ctx.fill();

  ctx.fillStyle = f.state === "ABILITY" ? "#00f2ff" : f.glowColor;
  ctx.globalAlpha = f.state === "ABILITY" ? 0.95 : 0.75;
  ctx.fillRect(headX - 14, headY - 9, 28, 3);
  ctx.globalAlpha = 1;

  ctx.fillStyle = f.state === "ABILITY" ? "#00f2ff" : "#f8fafc";
  ctx.fillRect(headX + facing * 6, headY - 6, facing * 10, 3);

  ctx.fillStyle = "#7f1d1d";
  ctx.fillRect(headX + facing * 8, headY + 7, facing * 7, 2);

  ctx.fillStyle = "rgba(120,53,15,0.5)";
  ctx.fillRect(headX + facing * 13, headY + 1, facing * 3, 4);

  ctx.fillStyle = "#00f2ff";
  ctx.globalAlpha = 0.85;
  ctx.fillRect(headX - facing * 18, headY + 3, 4, 8);
  ctx.globalAlpha = 1;

  ctx.fillStyle = "rgba(255,255,255,0.14)";
  ctx.fillRect(headX - facing * 18, headY - 16, facing * 4, 28);

  if (f.state === "ABILITY") {
    ctx.fillStyle = f.glowColor;
    ctx.globalAlpha = 0.5;
    ctx.fillRect(headX + facing * 14, headY - 8, facing * 28, 4);

    ctx.fillStyle = "#00f2ff";
    ctx.globalAlpha = 0.35;
    ctx.fillRect(headX + facing * 21, headY - 3, facing * 18, 3);
    ctx.globalAlpha = 1;
  }

  ctx.restore();

  // =========================================================
  // ARMS
  // =========================================================
  let leadHandX = f.x + facing * 35;
  let leadHandY = chestY - 14;
  let rearHandX = f.x - facing * 28;
  let rearHandY = chestY + 6;

  let leadElbowX = f.x + facing * 26;
  let leadElbowY = chestY + 4;
  let rearElbowX = f.x - facing * 26;
  let rearElbowY = chestY + 12;

  let leadFistSize = 16;
  let rearFistSize = 15;

  const leadShoulderX = f.x + facing * 25;
  const leadShoulderY = chestY - 17;
  const rearShoulderX = f.x - facing * 25;
  const rearShoulderY = chestY - 15;

  if (f.state === "LIGHT") {
    const t = clamp(f.stateTimer / 0.18, 0, 1);
    const snap = t < 0.5 ? t / 0.5 : 1 - (t - 0.5) / 0.5;

    leadHandX = f.x + facing * (38 + snap * 48);
    leadHandY = chestY - 18;

    leadElbowX = f.x + facing * (34 + snap * 22);
    leadElbowY = chestY - 10;

    rearHandX = f.x - facing * 24;
    rearHandY = chestY + 4;
    rearElbowX = f.x - facing * 31;
    rearElbowY = chestY + 12;
  } else if (f.state === "HEAVY") {
    const t = clamp(f.stateTimer / 0.46, 0, 1);
    const windup = clamp(t / 0.28, 0, 1);
    const swing = clamp((t - 0.18) / 0.38, 0, 1);
    const recover = clamp((t - 0.7) / 0.3, 0, 1);
    const hookPower = Math.sin(swing * Math.PI);

    const lowDip = Math.sin(swing * Math.PI) * 18;
    const risingLift = swing * 34;

    leadHandX = f.x + facing * 22;
    leadHandY = chestY - 31;
    leadElbowX = f.x + facing * 32;
    leadElbowY = chestY - 8;
    leadFistSize = 17;

    rearHandX =
      f.x -
      facing * (34 + windup * 12) +
      facing * (96 * swing) -
      facing * (18 * recover);

    rearHandY =
      chestY +
      16 +
      lowDip -
      risingLift -
      hookPower * 8;

    rearElbowX = f.x - facing * (34 - swing * 18);
    rearElbowY = chestY + 20 - swing * 18;

    rearFistSize = 21;

    if (swing > 0.04) {
      ctx.save();
      ctx.strokeStyle = "rgba(65, 192, 234, 0.16)";
      ctx.lineWidth = 9;
      ctx.lineCap = "round";
      ctx.beginPath();
      ctx.moveTo(f.x - facing * 24, chestY + 18);
      ctx.quadraticCurveTo(
        f.x + facing * 20,
        chestY + 38,
        rearHandX,
        rearHandY
      );
      ctx.stroke();
      ctx.restore();
    }
  } else if (f.state === "ABILITY") {
    const t = clamp(f.stateTimer / 0.28, 0, 1);
    const stab = t < 0.45 ? t / 0.45 : 1 - (t - 0.45) / 0.55;

    leadHandX = f.x + facing * (36 + stab * 54);
    leadHandY = chestY - 25;
    leadElbowX = f.x + facing * (35 + stab * 24);
    leadElbowY = chestY - 12;
    leadFistSize = 19;

    rearHandX = f.x - facing * 10;
    rearHandY = chestY + 8;
    rearElbowX = f.x - facing * 28;
    rearElbowY = chestY + 12;

    drawRect(
      f.x + facing * 22,
      chestY - 31,
      facing * 84,
      7,
      f.glowColor,
      0.38
    );
  } else if (f.state === "BLOCK") {
    leadHandX = f.x + facing * 24;
    leadHandY = chestY - 33;
    leadElbowX = f.x + facing * 36;
    leadElbowY = chestY - 8;

    rearHandX = f.x + facing * 8;
    rearHandY = chestY - 20;
    rearElbowX = f.x - facing * 18;
    rearElbowY = chestY - 2;

    leadFistSize = 17;
    rearFistSize = 16;
  } else if (f.state === "CROUCH") {
    leadHandX = f.x + facing * 30;
    leadHandY = chestY + 3;
    leadElbowX = f.x + facing * 33;
    leadElbowY = chestY + 18;

    rearHandX = f.x - facing * 18;
    rearHandY = chestY + 10;
    rearElbowX = f.x - facing * 31;
    rearElbowY = chestY + 16;
  } else if (f.state === "WALK") {
    leadHandX = f.x + facing * (34 + walkSwing * 5);
    leadHandY = chestY - 15 + Math.abs(walkSwing) * 3;
    leadElbowX = f.x + facing * (31 + walkSwing * 4);
    leadElbowY = chestY + 4;

    rearHandX = f.x - facing * (29 - walkSwing * 4);
    rearHandY = chestY + 7 + Math.abs(walkSwing) * 3;
    rearElbowX = f.x - facing * (33 - walkSwing * 3);
    rearElbowY = chestY + 14;
  }

  // Shoulder pads
  ctx.save();

  ctx.fillStyle = "#020617";
  ctx.beginPath();
  ctx.roundRect(f.x - 39, chestY - 29, 28, 15, 5);
  ctx.fill();

  ctx.beginPath();
  ctx.roundRect(f.x + 11, chestY - 29, 28, 15, 5);
  ctx.fill();

  ctx.fillStyle = dark;
  ctx.beginPath();
  ctx.roundRect(f.x - 42, chestY - 26, 14, 9, 4);
  ctx.fill();

  ctx.beginPath();
  ctx.roundRect(f.x + 28, chestY - 26, 14, 9, 4);
  ctx.fill();

  ctx.globalAlpha = 0.45;
  ctx.fillStyle = "#00f2ffa9";
  ctx.fillRect(f.x - 36, chestY - 29, 22, 3);

  ctx.fillStyle = "#ff0055aa";
  ctx.fillRect(f.x + 14, chestY - 29, 22, 3);

  ctx.restore();

  drawJointedLimb(
    rearShoulderX,
    rearShoulderY,
    rearElbowX,
    rearElbowY,
    rearHandX,
    rearHandY,
    "#15367e",
    f.state === "HEAVY" ? 13 : 11
  );

  drawFist(
    rearHandX,
    rearHandY,
    rearFistSize,
    f.state === "HEAVY" ? "#162a86" : "#0c2bb3"
  );

  drawJointedLimb(
    leadShoulderX,
    leadShoulderY,
    leadElbowX,
    leadElbowY,
    leadHandX,
    leadHandY,
    f.state === "HEAVY" ? "#254a9b" : main,
    12
  );

  drawFist(
    leadHandX,
    leadHandY,
    leadFistSize,
    f.state === "HEAVY" ? "#0c2bb3" : dark
  );

  // =========================================================
  // ABILITY EXTRA EFFECTS
  // =========================================================
  if (f.state === "ABILITY") {
    ctx.save();
    ctx.globalAlpha = 0.16;
    ctx.fillStyle = "#000000";
    ctx.beginPath();
    ctx.ellipse(f.x, f.y - 58, 48, 72, 0, 0, Math.PI * 2);
    ctx.fill();

    for (let i = 0; i < 5; i++) {
      drawRect(
        f.x - 42 + i * 18,
        f.y - 22 - i * 5,
        18,
        7,
        f.glowColor,
        0.16
      );
    }

    ctx.restore();
  }

  ctx.restore();
  ctx.globalAlpha = 1;
};
const drawHitSparks = () => {
      hitSparks.forEach((spark) => {
        const t = spark.life / spark.maxLife; // 0 to 1
        const alpha = 1 - t;
        
        // Make the sparks "stretch" based on their velocity for motion blur
        const stretch = 1 + (1 - alpha) * 2; 
        const size = spark.size * alpha;

        ctx.save();
        
        // 1. THE "CORE" IMPACT (White flash)
        drawPixelRect(
          spark.x - size, 
          spark.y - size, 
          size * 2, 
          size * 2, 
          `rgba(255, 255, 255, ${alpha})`
        );

        // 2. THE GLITCH STREAKS (Horizontal "Cyber" lines)
        // We offset these slightly to create a "vibration" effect
        const drift = Math.sin(performance.now() * 0.1) * 10;
        
        // Cyan "Ghost" streak
        drawPixelRect(
          spark.x - (size * 4) + drift, 
          spark.y - 1, 
          size * 8, 
          2, 
          `rgba(0, 242, 255, ${alpha * 0.6})`
        );

        // Magenta "Ghost" streak
        drawPixelRect(
          spark.x - (size * 4) - drift, 
          spark.y + 1, 
          size * 8, 
          2, 
          `rgba(255, 0, 85, ${alpha * 0.6})`
        );

        // 3. PIXEL "SHARDS"
        // These look like data fragments flying off the character
        for (let i = 0; i < 3; i++) {
          const offX = Math.cos(i * 2) * (1 - alpha) * 50;
          const offY = Math.sin(i * 2) * (1 - alpha) * 50;
          drawPixelRect(
            spark.x + offX, 
            spark.y + offY, 
            4, 4, 
            i % 2 === 0 ? "#00f2ff" : "#ff0055", 
            alpha
          );
        }

        ctx.restore();
      });
    };

   const drawStartScreen = () => {
  // 1. DIM THE BACKGROUND
  ctx.fillStyle = "rgba(2, 6, 23, 0.85)";
  ctx.fillRect(0, 0, cssW, cssH);

  // 2. THE MAIN TERMINAL FRAME (Slanted / Angular)
  const centerX = cssW * 0.5;
  const centerY = cssH * 0.5;
  
  // Decorative "Digital" Brackets
  ctx.strokeStyle = "rgba(0, 242, 255, 0.4)";
  ctx.lineWidth = 2;
  // Draw an outer glowing frame that isn't a full box
  ctx.beginPath();
  ctx.moveTo(centerX - 300, centerY - 150);
  ctx.lineTo(centerX - 320, centerY - 150);
  ctx.lineTo(centerX - 320, centerY + 150);
  ctx.lineTo(centerX - 300, centerY + 150);
  
  ctx.moveTo(centerX + 300, centerY - 150);
  ctx.lineTo(centerX + 320, centerY - 150);
  ctx.lineTo(centerX + 320, centerY + 150);
  ctx.lineTo(centerX + 300, centerY + 150);
  ctx.stroke();

  // 3. THE TITLE: GLITCH NEON
  const glitch = Math.random() > 0.96 ? Math.random() * 10 - 5 : 0;
  
  // Magenta Shadow
  drawCenteredText("NEO-STRIKE: ROOFTOP", centerX + glitch, centerY - 80, 52, "#ff0055", true, true);
  // Cyan Core
  drawCenteredText("NEO-STRIKE: ROOFTOP", centerX - glitch, centerY - 80, 52, "#00f2ff", false, false);
  // White Center
  drawCenteredText("NEO-STRIKE: ROOFTOP", centerX, centerY - 80, 52, "#ffffff", false, false);

  drawCenteredText(
    "v1.0.4 // SYSTEM STABLE",
    centerX,
    centerY - 40,
    14,
    "rgba(0, 242, 255, 0.5)",
    false
  );

  // 4. CONTROL INTERFACE (Glass Look)
  const boxY = centerY + 10;
  drawPixelRect(centerX - 240, boxY, 480, 100, "rgba(255, 255, 255, 0.03)");
  // Thin "glass" edge
  drawPixelRect(centerX - 240, boxY, 480, 1, "rgba(255, 255, 255, 0.1)");
  
  ctx.font = "14px 'Courier New', monospace";
  ctx.textAlign = "center";
  ctx.fillStyle = "rgba(255, 255, 255, 0.8)";
  
  const hints = [
    "NAV: [W,A,S,D] // COMBAT: [SPACE] JAB - [ENTER] HOOK",
    "OVERDRIVE: HOLD [SPACE + ENTER] // BLOCK: [S]",
    "LOCATION: SHIBUYA SKY-SECTOR 7"
  ];
  
  hints.forEach((text, i) => {
    ctx.fillText(text, centerX, boxY + 35 + (i * 24));
  });

  // 5. THE "INSERT COIN" PULSE
  const pulse = 0.5 + Math.sin(performance.now() * 0.005) * 0.5;
  const btnColor = `rgba(0, 242, 255, ${0.2 + pulse * 0.6})`;
  
  // Underline glow
  drawPixelRect(centerX - 120, centerY + 145, 240, 2, btnColor);
  
  drawCenteredText(
    "PRESS [SPACE] TO INITIALIZE",
    centerX,
    centerY + 140,
    18,
    btnColor,
    true,
    false
  );

  // 6. SCANLINES OVERLAY
  for (let i = 0; i < cssH; i += 4) {
    drawPixelRect(0, i, cssW, 1, "rgba(0,0,0,0.1)");
  }
};

    const drawRoundOver = () => {
  if (!roundOver) return;

  // 1. DYNAMIC COLOR OVERLAY
  // Darken the screen but tint it slightly towards the winner's color
  const winnerColor = winnerText.includes(player.name) ? player.color : enemy.color;
  ctx.fillStyle = "rgba(2, 6, 23, 0.8)";
  ctx.fillRect(0, 0, cssW, cssH);

  // 2. THE BACKGROUND STRIPE (Arcade style)
  // A giant slanted bar across the middle
  ctx.fillStyle = "rgba(0, 0, 0, 0.6)";
  ctx.beginPath();
  ctx.moveTo(0, cssH * 0.4);
  ctx.lineTo(cssW, cssH * 0.3);
  ctx.lineTo(cssW, cssH * 0.7);
  ctx.lineTo(0, cssH * 0.8);
  ctx.fill();

  // 3. THE WINNER TEXT (Glitchy & Bold)
  const centerX = cssW * 0.5;
  const centerY = cssH * 0.5;
  const glitch = Math.sin(performance.now() * 0.1) * 3;

  // Background "Echo" text
  drawCenteredText(winnerText.toUpperCase(), centerX + 5, centerY - 10, 64, winnerColor, true, true);
  
  // Main White Text
  drawCenteredText(winnerText.toUpperCase(), centerX - glitch, centerY - 10, 64, "#ffffff", false, false);

  // 4. SUB-TEXT / DECORATION
  // Decorative lines to frame the winner
  drawPixelRect(centerX - 200, centerY + 30, 400, 2, winnerColor, 0.5);
  
  drawCenteredText(
    "MATCH TERMINATED // ARCHIVING DATA",
    centerX,
    centerY + 60,
    14,
    "rgba(255, 255, 255, 0.4)",
    false
  );

  // 5. RESTART PROMPT (Digital Pulse)
  const pulse = 0.5 + Math.sin(performance.now() * 0.01) * 0.5;
  ctx.globalAlpha = 0.5 + pulse * 0.5;
  
  // Create a small "Button" hint
  const promptY = centerY + 110;
  drawPixelRect(centerX - 150, promptY - 20, 300, 30, "rgba(255, 255, 255, 0.05)");
  drawCenteredText(
    "PRESS [R] OR [SPACE] TO RE-INITIALIZE",
    centerX,
    promptY,
    18,
    "#ffffff",
    true,
    false
  );
  
  ctx.globalAlpha = 1.0;

  // 6. SCREEN FRAGMENTS (A few floating "pixels" for depth)
  for (let i = 0; i < 10; i++) {
    const rx = (Math.sin(i * 45) * 0.5 + 0.5) * cssW;
    const ry = (Math.cos(i * 12) * 0.5 + 0.5) * cssH;
    drawPixelRect(rx, ry, 4, 4, winnerColor, 0.2);
  }
};
    const render = () => {
      const shakeX = screenShake > 0 ? rand(-screenShake, screenShake) : 0;
      const shakeY = screenShake > 0 ? rand(-screenShake, screenShake) : 0;

      ctx.clearRect(0, 0, cssW, cssH);

      ctx.save();
      ctx.translate(shakeX, shakeY);

      drawBackground();

      // sort by y-ish, keeps both on stage clean
      if (player.x < enemy.x) {
        drawStickFighter(player);
        drawStickFighter(enemy);
      } else {
        drawStickFighter(enemy);
        drawStickFighter(player);
      }

      drawHitSparks();

      ctx.restore();

      drawHUD();

      if (!gameStarted) drawStartScreen();
      drawRoundOver();
    };

    const loop = (time: number) => {
      const dt = Math.min(0.033, (time - lastTime) / 1000 || 0.016);
      lastTime = time;

      updateGame(dt);
      render();

      pressedThisFrame[" "] = false;
      pressedThisFrame["enter"] = false;
      pressedThisFrame["w"] = false;
      pressedThisFrame["a"] = false;
      pressedThisFrame["s"] = false;
      pressedThisFrame["d"] = false;

      animationFrameId = requestAnimationFrame(loop);
    };

    resizeCanvas();
    resetGame(false);

    window.addEventListener("resize", resizeCanvas);
    window.addEventListener("keydown", onKeyDown, { passive: false });
    window.addEventListener("keyup", onKeyUp);

    animationFrameId = requestAnimationFrame(loop);

    return () => {
      cancelAnimationFrame(animationFrameId);
      window.removeEventListener("resize", resizeCanvas);
      window.removeEventListener("keydown", onKeyDown);
      window.removeEventListener("keyup", onKeyUp);
    };
  }, []);

  return (
    <div className="w-full h-full bg-[#020617]">
      <canvas ref={canvasRef} className="block w-full h-full" />
    </div>
  );
}