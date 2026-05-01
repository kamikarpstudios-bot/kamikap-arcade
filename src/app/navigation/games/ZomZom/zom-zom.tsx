"use client";

import { useEffect, useRef } from "react";

export default function ZomZomBaseDefense() {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    // =========================================================
    // TYPES
    // =========================================================
    type Vec2 = { x: number; y: number };

    type CrateKind = "turretAmmo" | "akAmmo" | "wood";

    type CarriedItem =
      | {
          kind: CrateKind;
          amount: number;
          color: string;
          label: string;
        }
      | null;

    type Machine = {
      id: string;
      kind: CrateKind;
      x: number;
      y: number;
      w: number;
      h: number;
      level: number;
      progress: number;
      produceTime: number;
      crateAmount: number;
      hasCrateReady: boolean;
      label: string;
      color: string;
    };

 type Turret = {
  x: number;
  y: number;
  range: number;
  fireCooldown: number;
  fireRate: number;
  ammo: number;
  maxAmmo: number;
  unlocked: boolean;
  level: number;
  target: any | null; // <-- ADD THIS
};

    type PlayerBullet = {
      x: number;
      y: number;
      vx: number;
      vy: number;
      damage: number;
      life: number;
      fromTurret: boolean;
    };

    type ZombieType = "basic" | "fast" | "tank" | "spitter";

    type Zombie = {
      x: number;
      y: number;
      vx: number;
      hp: number;
      maxHp: number;
      damage: number;
      speed: number;
      radius: number;
      reward: number;
      color: string;
      type: ZombieType;
      attackCooldown: number;
      isDead: boolean;
    };

type FloatingMoney = {
  x: number;
  y: number;
  amount: number;
  life: number;
  vx: number;
  vy: number;
};

type ImpactParticle = {
  x: number;
  y: number;
  vx: number;
  vy: number;
  life: number;
  maxLife: number;
  size: number;
  color: string;
};
    // =========================================================
    // CANVAS / INPUT
    // =========================================================
    let animationFrameId = 0;
    let lastTime = 0;
    let cssW = 0;
    let cssH = 0;
    let dpr = 1;
    let skyTime = 0;
    const keys: Record<string, boolean> = {};
    const pressedThisFrame: Record<string, boolean> = {};

    const mouse = {
      x: 0,
      y: 0,
      down: false,
      clicked: false,
    };

  let shopOpen = false;
  let shopScroll = 0;

    const onKeyDown = (e: KeyboardEvent) => {
      const key = e.key.toLowerCase();

      if (
        key === " " ||
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

    const onMouseMove = (e: MouseEvent) => {
      const rect = canvas.getBoundingClientRect();
      mouse.x = e.clientX - rect.left;
      mouse.y = e.clientY - rect.top;
    };

    const onMouseDown = () => {
      mouse.down = true;
      mouse.clicked = true;
    };

    const onMouseUp = () => {
      mouse.down = false;
    };
const onWheel = (e: WheelEvent) => {
  if (!shopOpen) return;
  e.preventDefault();
  shopScroll += e.deltaY;
};
    const consumePressed = (key: string) => {
      const had = !!pressedThisFrame[key];
      pressedThisFrame[key] = false;
      return had;
    };

    const resizeCanvas = () => {
      const parent = canvas.parentElement;
      if (!parent) return;

      const rect = parent.getBoundingClientRect();
      dpr = Math.max(1, window.devicePixelRatio || 1);

      cssW = rect.width;
      cssH = rect.height;

      canvas.width = Math.floor(cssW * dpr);
      canvas.height = Math.floor(cssH * dpr);
      canvas.style.width = `${cssW}px`;
      canvas.style.height = `${cssH}px`;

      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    };

    // =========================================================
    // WORLD HELPERS
    // =========================================================
    const getWorld = () => {
      const skyBottom = cssH * 0.5;
      const groundTop = skyBottom;

      const baseX = 0;
      const baseW = cssW * 0.42;

      const clearingX = baseW;
      const clearingW = cssW * 0.28;

      const ruinsX = clearingX + clearingW;
      const ruinsW = cssW - ruinsX;

      const wallX = baseW - 46;
      const wallY = groundTop + 36;
      const wallW = 38;
      const wallH = cssH * 0.38;

      const baseDepositX = wallX - 28;
      const baseDepositY = wallY + wallH * 0.5;

      const akDepositX = 126;
      const akDepositY = groundTop + 76;

      const upgradeConsoleX = 212;
      const upgradeConsoleY = groundTop + 76;

      return {
        skyBottom,
        groundTop,
        baseX,
        baseW,
        clearingX,
        clearingW,
        ruinsX,
        ruinsW,
        wallX,
        wallY,
        wallW,
        wallH,
        baseDepositX,
        baseDepositY,
        akDepositX,
        akDepositY,
        upgradeConsoleX,
        upgradeConsoleY,
      };
    };

    const clamp = (v: number, min: number, max: number) =>
      Math.max(min, Math.min(max, v));

    const dist = (ax: number, ay: number, bx: number, by: number) =>
      Math.hypot(ax - bx, ay - by);

const rectContains = (
  px: number,
  py: number,
  x: number,
  y: number,
  w: number,
  h: number
) => px >= x && px <= x + w && py >= y && py <= y + h;

const isPlayerAtBaseWoodDropoff = () => {
  const world = getWorld();

  const zoneX = world.wallX - 52;
  const zoneY = world.wallY - 20;
  const zoneW = world.wallW + 64;
  const zoneH = world.wallH + 40;

  return rectContains(player.x, player.y, zoneX, zoneY, zoneW, zoneH);
};
const getWallWoodRequirement = () => 60 + (baseLevel - 1) * 20;
    // =========================================================
    // GAME STATE
    // =========================================================
    const player = {
      x: 150,
      y: 0,
      radius: 14,
      speed: 240,
      fireCooldown: 0,
      weapon: "pistol" as "pistol" | "ak",
      facingAngle: 0,
      akUnlocked: false,
      akAmmo: 0,
      hp: 100,
      maxHp: 100,
      carried: null as CarriedItem,
    };

    let baseHp = 200;
    let baseMaxHp = 200;
    let baseWoodProgress = 0;
    let baseLevel = 1;

    let money = 0;

    let gameStarted = false;
    let gameOver = false;

    let wave = 0;
    let waveInProgress = false;
    let waveTimer = 4;
    let zombiesToSpawn = 0;
    let spawnTimer = 0;
    let spawnInterval = 1.0;

const machines: Machine[] = [];
const turrets: Turret[] = [];
const bullets: PlayerBullet[] = [];
const zombies: Zombie[] = [];
const floatingMoney: FloatingMoney[] = [];
const impactParticles: ImpactParticle[] = [];

    const createMachine = (
      id: string,
      kind: CrateKind,
      x: number,
      y: number,
      label: string,
      color: string,
      produceTime: number,
      crateAmount: number
    ): Machine => ({
      id,
      kind,
      x,
      y,
      w: 74,
      h: 60,
      level: 1,
      progress: 0,
      produceTime,
      crateAmount,
      hasCrateReady: false,
      label,
      color,
    });

    const resetGame = () => {
      const world = getWorld();

      player.x = 150;
      player.y = world.groundTop + 155;
      player.fireCooldown = 0;
      player.weapon = "pistol";
      player.akUnlocked = false;
      player.akAmmo = 0;
      player.hp = 100;
      player.maxHp = 100;
      player.carried = null;

      baseHp = 200;
      baseMaxHp = 200;
      baseWoodProgress = 0;
      baseLevel = 1;

      money = 0;

      gameStarted = false;
      gameOver = false;

      wave = 0;
      waveInProgress = false;
      waveTimer = 4;
      zombiesToSpawn = 0;
      spawnTimer = 0;
      spawnInterval = 1.0;

      machines.length = 0;
      bullets.length = 0;
      zombies.length = 0;
      turrets.length = 0;
     floatingMoney.length = 0;
     impactParticles.length = 0;

      machines.push(
        createMachine(
          "turret-ammo",
          "turretAmmo",
          48,
          world.groundTop + 95,
          "TURRET AMMO",
          "#64748b",
          7,
          24
        )
      );

      machines.push(
        createMachine(
          "wood",
          "wood",
          48,
          world.groundTop + 195,
          "WOOD",
          "#8b5a2b",
          6.5,
          20
        )
      );

      const turretYTop = world.groundTop + 88;
      const turretGap = 78;

      for (let i = 0; i < 3; i++) {
turrets.push({
  x: world.wallX - 24,
  y: turretYTop + i * turretGap,
  range: 250,
  fireCooldown: 0,
  fireRate: 0.55,
  ammo: i === 0 ? 35 : 0,
  maxAmmo: 60,
  unlocked: i === 0,
  level: 1,
  target: null, // <-- ADD THIS
});
      }
    };

    resetGame();

    // =========================================================
    // WAVE / ZOMBIES
    // =========================================================
    const startNextWave = () => {
      wave += 1;
      waveInProgress = true;
      zombiesToSpawn = 5 + wave * 2;
      spawnTimer = 0;
      spawnInterval = Math.max(0.35, 1 - wave * 0.03);
    };

    const chooseZombieType = (): ZombieType => {
      const r = Math.random();

      if (wave >= 10 && r < 0.12) return "tank";
      if (wave >= 7 && r < 0.26) return "spitter";
      if (wave >= 4 && r < 0.45) return "fast";
      return "basic";
    };

    const spawnZombie = () => {
      const world = getWorld();
      const type = chooseZombieType();

      const y =
        world.groundTop + 42 + Math.random() * (cssH - world.groundTop - 80);

      if (type === "fast") {
        zombies.push({
          x: world.ruinsX + world.ruinsW - 30,
          y,
          vx: -58,
          hp: 28 + wave * 3,
          maxHp: 28 + wave * 3,
          damage: 8,
          speed: 58 + wave * 1.8,
          radius: 11,
          reward: 10,
          color: "#3b82f6",
          type,
          attackCooldown: 0,
          isDead: false,
        });
        return;
      }

      if (type === "tank") {
        zombies.push({
          x: world.ruinsX + world.ruinsW - 30,
          y,
          vx: -20,
          hp: 120 + wave * 10,
          maxHp: 120 + wave * 10,
          damage: 18,
          speed: 20 + wave * 0.8,
          radius: 20,
          reward: 28,
          color: "#dc2626",
          type,
          attackCooldown: 0,
          isDead: false,
        });
        return;
      }

      if (type === "spitter") {
        zombies.push({
          x: world.ruinsX + world.ruinsW - 30,
          y,
          vx: -28,
          hp: 44 + wave * 4,
          maxHp: 44 + wave * 4,
          damage: 12,
          speed: 28 + wave * 1.0,
          radius: 14,
          reward: 16,
          color: "#eab308",
          type,
          attackCooldown: 0,
          isDead: false,
        });
        return;
      }

      zombies.push({
        x: world.ruinsX + world.ruinsW - 30,
        y,
        vx: -34,
        hp: 36 + wave * 4,
        maxHp: 36 + wave * 4,
        damage: 10,
        speed: 34 + wave * 1.2,
        radius: 13,
        reward: 12,
        color: "#22c55e",
        type: "basic",
        attackCooldown: 0,
        isDead: false,
      });
    };

const killZombie = (z: Zombie) => {
  if (z.isDead) return;
  z.isDead = true;

  floatingMoney.push({
    x: z.x,
    y: z.y - 8,
    amount: z.reward,
    life: 0.8,
    vx: (Math.random() - 0.5) * 30,
    vy: -60,
  });
};

    // =========================================================
    // PLAYER SHOOTING
    // =========================================================
    const spawnBullet = (
      x: number,
      y: number,
      angle: number,
      speed: number,
      damage: number,
      fromTurret: boolean
    ) => {
      bullets.push({
        x,
        y,
        vx: Math.cos(angle) * speed,
        vy: Math.sin(angle) * speed,
        damage,
        life: 1.5,
        fromTurret,
      });
    };

    const firePlayerWeapon = () => {
      if (player.fireCooldown > 0) return;

      const angle = Math.atan2(mouse.y - player.y, mouse.x - player.x);
      player.facingAngle = angle;

      if (player.weapon === "pistol") {
        player.fireCooldown = 0.24;
        spawnBullet(player.x, player.y, angle, 520, 18, false);
        return;
      }

      if (player.weapon === "ak") {
        if (player.akAmmo <= 0) return;
        player.akAmmo -= 1;
        player.fireCooldown = 0.1;
        const spread = (Math.random() - 0.5) * 0.12;
        spawnBullet(player.x, player.y, angle + spread, 620, 12, false);
      }
    };
const spawnImpactSparks = (
  x: number,
  y: number,
  angle: number,
  fromTurret: boolean
) => {
  const count = fromTurret ? 5 : 4;

  for (let i = 0; i < count; i++) {
    const spread = (Math.random() - 0.5) * 1.1;
    const speed = 70 + Math.random() * 110;
    const a = angle + Math.PI + spread;

    impactParticles.push({
      x,
      y,
      vx: Math.cos(a) * speed,
      vy: Math.sin(a) * speed,
      life: 0.18 + Math.random() * 0.12,
      maxLife: 0.18 + Math.random() * 0.12,
      size: 2 + Math.random() * 2.2,
      color: fromTurret ? "#fbbf24" : "#67e8f9",
    });
  }
};

const spawnBloodPuff = (x: number, y: number) => {
  const count = 5;

  for (let i = 0; i < count; i++) {
    const a = Math.random() * Math.PI * 2;
    const speed = 18 + Math.random() * 45;

    impactParticles.push({
      x,
      y,
      vx: Math.cos(a) * speed,
      vy: Math.sin(a) * speed,
      life: 0.22 + Math.random() * 0.18,
      maxLife: 0.22 + Math.random() * 0.18,
      size: 2 + Math.random() * 3,
      color: i % 2 === 0 ? "#b91c1c" : "#ef4444",
    });
  }
};
    // =========================================================
    // INTERACTIONS / SHOP
    // =========================================================
    const getNearbyMachine = () => {
      for (const machine of machines) {
        if (
          dist(
            player.x,
            player.y,
            machine.x + machine.w * 0.5,
            machine.y + machine.h * 0.5
          ) < 50
        ) {
          return machine;
        }
      }
      return null;
    };

    const getNearbyTurret = () => {
      for (const turret of turrets) {
        if (!turret.unlocked) continue;
        if (dist(player.x, player.y, turret.x, turret.y) < 42) return turret;
      }
      return null;
    };

const handleInteraction = () => {
  const world = getWorld();

  const nearConsole =
    dist(player.x, player.y, world.upgradeConsoleX, world.upgradeConsoleY) < 54;

  if (nearConsole) {
    shopOpen = true;
    shopScroll = 0;
    return;
  }

  // pick up machine crate
  const nearbyMachine = getNearbyMachine();
  if (nearbyMachine && nearbyMachine.hasCrateReady && !player.carried) {
    nearbyMachine.hasCrateReady = false;
    player.carried = {
      kind: nearbyMachine.kind,
      amount: nearbyMachine.crateAmount,
      color: nearbyMachine.color,
      label:
        nearbyMachine.kind === "turretAmmo"
          ? "TURRET AMMO"
          : nearbyMachine.kind === "akAmmo"
          ? "AK AMMO"
          : "WOOD",
    };
    return;
  }

  // load turret
  const nearbyTurret = getNearbyTurret();
  if (
    nearbyTurret &&
    player.carried &&
    player.carried.kind === "turretAmmo"
  ) {
    nearbyTurret.ammo = clamp(
      nearbyTurret.ammo + player.carried.amount,
      0,
      nearbyTurret.maxAmmo
    );
    player.carried = null;
    return;
  }

  // reinforce / upgrade base
  if (
    player.carried &&
    player.carried.kind === "wood" &&
    isPlayerAtBaseWoodDropoff()
  ) {
    const woodAmount = player.carried.amount;

    baseWoodProgress += woodAmount;
    baseHp = clamp(baseHp + woodAmount * 1.5, 0, baseMaxHp);
    player.carried = null;

    while (baseWoodProgress >= getWallWoodRequirement()) {
      baseWoodProgress -= getWallWoodRequirement();
      baseLevel += 1;
      baseMaxHp += 55;
      baseHp = Math.min(baseMaxHp, baseHp + 40);
    }

    return;
  }
};

   const tryBuyAtConsole = () => {
  if (!shopOpen || !mouse.clicked) return;

  const items = [
    {
      label: "UNLOCK TURRET",
      sub: "Adds next wall turret",
      cost: (() => {
        const lockedIndex = turrets.findIndex((t) => !t.unlocked);
        return lockedIndex === -1 ? -1 : 100 + lockedIndex * 80;
      })(),
      color: "#64748b",
      icon: "T",
      action: () => {
        for (const turret of turrets) {
          if (!turret.unlocked) {
            const cost = 100 + turrets.indexOf(turret) * 80;
            if (money >= cost) {
              money -= cost;
              turret.unlocked = true;
              turret.ammo = 20;
            }
            break;
          }
        }
      },
    },
    {
      label: player.akUnlocked ? "BUY AK AMMO" : "BUY AK47",
      sub: player.akUnlocked ? "+40 ammo" : "Unlock rifle",
      cost: player.akUnlocked ? 45 : 120,
      color: "#b91c1c",
      icon: "AK",
      action: () => {
        if (!player.akUnlocked) {
          if (money >= 120) {
            money -= 120;
            player.akUnlocked = true;
            player.weapon = "ak";
          }
        } else if (money >= 45) {
          money -= 45;
          player.akAmmo += 40;
        }
      },
    },
    {
      label: "TURRET AMMO",
      sub: "Faster + bigger crates",
      cost: 90 * machines[0].level,
      color: "#334155",
      icon: "AM",
      action: () => {
        const machine = machines[0];
        const cost = 90 * machine.level;
        if (money >= cost) {
          money -= cost;
          machine.level += 1;
          machine.produceTime = Math.max(2.2, machine.produceTime - 0.75);
          machine.crateAmount += 10;
        }
      },
    },
    {
      label: "WOOD MACHINE",
      sub: "Faster + bigger crates",
      cost: 80 * machines[1].level,
      color: "#8b5a2b",
      icon: "WD",
      action: () => {
        const machine = machines[1];
        const cost = 80 * machine.level;
        if (money >= cost) {
          money -= cost;
          machine.level += 1;
          machine.produceTime = Math.max(2, machine.produceTime - 0.7);
          machine.crateAmount += 10;
        }
      },
    },
    {
      label: "TURRET POWER",
      sub: "Fire rate / range / ammo",
      cost: (() => {
        const target = turrets
          .filter((t) => t.unlocked)
          .sort((a, b) => a.level - b.level)[0];
        return target ? 70 * target.level : -1;
      })(),
      color: "#0f766e",
      icon: "UP",
      action: () => {
        const target = turrets
          .filter((t) => t.unlocked)
          .sort((a, b) => a.level - b.level)[0];
        if (!target) return;
        const cost = 70 * target.level;
        if (money >= cost) {
          money -= cost;
          target.level += 1;
          target.fireRate = Math.max(0.16, target.fireRate - 0.06);
          target.range += 28;
          target.maxAmmo += 12;
        }
      },
    },
    {
      label: "WALL REPAIR",
      sub: "+60 wall hp now",
      cost: 35,
      color: "#a16207",
      icon: "WL",
      action: () => {
        if (money >= 35) {
          money -= 35;
          baseHp = clamp(baseHp + 60, 0, baseMaxHp);
        }
      },
    },
  ];

  const panelW = 520;
  const panelH = 360;
  const panelX = cssW * 0.5 - panelW * 0.5;
  const panelY = cssH * 0.5 - panelH * 0.5;

  const closeX = panelX + panelW - 38;
  const closeY = panelY + 14;

  if (rectContains(mouse.x, mouse.y, closeX, closeY, 24, 24)) {
    shopOpen = false;
    shopScroll = 0;
    return;
  }

  const contentX = panelX + 22;
  const contentY = panelY + 64;
  const contentW = panelW - 44;
  const contentH = panelH - 86;

  const cols = 2;
  const tileW = 228;
  const tileH = 92;
  const gap = 12;

  const rows = Math.ceil(items.length / cols);
  const totalHeight = rows * tileH + (rows - 1) * gap;
  const maxScroll = Math.max(0, totalHeight - contentH);

  shopScroll = clamp(shopScroll, 0, maxScroll);

  if (!rectContains(mouse.x, mouse.y, contentX, contentY, contentW, contentH)) {
    return;
  }

  for (let i = 0; i < items.length; i++) {
    const item = items[i];
    const col = i % cols;
    const row = Math.floor(i / cols);

    const x = contentX + col * (tileW + gap);
    const y = contentY + row * (tileH + gap) - shopScroll;

    if (y + tileH < contentY || y > contentY + contentH) continue;

    if (rectContains(mouse.x, mouse.y, x, y, tileW, tileH)) {
      if (item.cost >= 0 && money >= item.cost) {
        item.action();
      }
      return;
    }
  }
};

    // =========================================================
    // UPDATE
    // =========================================================
    const updateGame = (dt: number) => {
      if (!gameStarted) {
        if (consumePressed("enter")) {
          gameStarted = true;
          startNextWave();
        }
        return;
      }

      if (gameOver) {
        if (consumePressed("r")) resetGame();
        return;
      }

      const world = getWorld();
 if (consumePressed("escape")) {
  shopOpen = false;
  shopScroll = 0;
}
      if (consumePressed("1")) player.weapon = "pistol";
      if (consumePressed("2") && player.akUnlocked) player.weapon = "ak";

      if (player.fireCooldown > 0) player.fireCooldown -= dt;

      if (mouse.down && !shopOpen) firePlayerWeapon();

      // player movement
      let moveX = 0;
      let moveY = 0;

      if (keys["w"]) moveY -= 1;
      if (keys["s"]) moveY += 1;
      if (keys["a"]) moveX -= 1;
      if (keys["d"]) moveX += 1;

      const len = Math.hypot(moveX, moveY);
      if (len > 0) {
        moveX /= len;
        moveY /= len;
      }

      const speedPenalty = player.carried ? 0.75 : 1;
      player.x += moveX * player.speed * speedPenalty * dt;
      player.y += moveY * player.speed * speedPenalty * dt;

      player.x = clamp(player.x, 20, cssW - 20);
      player.y = clamp(player.y, world.groundTop + 20, cssH - 20);

      // prevent player walking through the base wall from the right
      if (
        rectContains(
          player.x + player.radius,
          player.y,
          world.wallX,
          world.wallY,
          world.wallW + 8,
          world.wallH
        )
      ) {
        player.x = world.wallX - player.radius - 2;
      }

      // interaction
      if (consumePressed("e")) handleInteraction();

      tryBuyAtConsole();

      // machine production
      for (const machine of machines) {
        if (machine.hasCrateReady) continue;
        machine.progress += dt;
        if (machine.progress >= machine.produceTime) {
          machine.progress = 0;
          machine.hasCrateReady = true;
        }
      }

      // wave progression
      if (!waveInProgress) {
        waveTimer -= dt;
        if (waveTimer <= 0 || consumePressed("n")) {
          startNextWave();
        }
      } else {
        spawnTimer -= dt;
        if (zombiesToSpawn > 0 && spawnTimer <= 0) {
          spawnTimer = spawnInterval;
          zombiesToSpawn -= 1;
          spawnZombie();
        }

        if (zombiesToSpawn <= 0 && zombies.length === 0) {
          waveInProgress = false;
          waveTimer = 7;
          money += 30 + wave * 8;
        }
      }

      // turrets
      for (const turret of turrets) {
        if (!turret.unlocked) {
          turret.target = null;
          continue;
        }

        if (turret.fireCooldown > 0) turret.fireCooldown -= dt;

        let target: Zombie | null = null;
        let bestDist = Infinity;

        for (const zombie of zombies) {
          const d = dist(turret.x, turret.y, zombie.x, zombie.y);
          if (d < turret.range && d < bestDist) {
            bestDist = d;
            target = zombie;
          }
        }

        turret.target = target;

        if (turret.ammo <= 0 || !target) continue;

        if (turret.fireCooldown <= 0) {
          turret.fireCooldown = turret.fireRate;
          turret.ammo -= 1;

          const angle = Math.atan2(target.y - turret.y, target.x - turret.x);

          const barrelTipDistance = 32;
          const bulletStartX = turret.x + Math.cos(angle) * barrelTipDistance;
          const bulletStartY = turret.y + Math.sin(angle) * barrelTipDistance;

          spawnBullet(
            bulletStartX,
            bulletStartY,
            angle,
            560,
            12 + turret.level * 5,
            true
          );
        }
      }

      // bullets
      for (let i = bullets.length - 1; i >= 0; i--) {
        const b = bullets[i];
        b.x += b.vx * dt;
        b.y += b.vy * dt;
        b.life -= dt;

        let hit = false;

        for (const zombie of zombies) {
     if (dist(b.x, b.y, zombie.x, zombie.y) < zombie.radius + 4) {
  zombie.hp -= b.damage;
  hit = true;

  const bulletAngle = Math.atan2(b.vy, b.vx);
  spawnImpactSparks(b.x, b.y, bulletAngle, b.fromTurret);
  spawnBloodPuff(b.x, b.y);

  if (zombie.hp <= 0) killZombie(zombie);
  break;
}
        }

        if (
          hit ||
          b.life <= 0 ||
          b.x < 0 ||
          b.x > cssW ||
          b.y < 0 ||
          b.y > cssH
        ) {
          bullets.splice(i, 1);
        }
      }
for (let i = impactParticles.length - 1; i >= 0; i--) {
  const p = impactParticles[i];

  p.x += p.vx * dt;
  p.y += p.vy * dt;
  p.vx *= 0.92;
  p.vy *= 0.92;
  p.life -= dt;

  if (p.life <= 0) {
    impactParticles.splice(i, 1);
  }
}
      // zombies
      for (let i = zombies.length - 1; i >= 0; i--) {
        const z = zombies[i];

        if (z.isDead) {
          zombies.splice(i, 1);
          continue;
        }

        if (z.attackCooldown > 0) z.attackCooldown -= dt;

        const atWall =
          z.x - z.radius <= world.wallX + world.wallW &&
          z.y > world.wallY - 18 &&
          z.y < world.wallY + world.wallH + 18;

        const closeToPlayer = dist(z.x, z.y, player.x, player.y) < z.radius + 20;

        if (closeToPlayer) {
          if (z.attackCooldown <= 0) {
            player.hp -= z.damage;
            z.attackCooldown = 0.8;
          }

          const angle = Math.atan2(player.y - z.y, player.x - z.x);
          z.x += Math.cos(angle) * z.speed * dt;
          z.y += Math.sin(angle) * z.speed * dt;
        } else if (atWall || (z.type === "spitter" && z.x < world.wallX + 150)) {
          if (z.attackCooldown <= 0) {
            if (z.type === "spitter") {
              baseHp -= z.damage * 0.65;
              z.attackCooldown = 1.2;
            } else {
              baseHp -= z.damage;
              z.attackCooldown = 0.9;
            }
          }
        } else {
          z.x -= z.speed * dt;
        }

        if (z.hp <= 0) {
          killZombie(z);
        }
      }
// money pickups
for (let i = floatingMoney.length - 1; i >= 0; i--) {
  const m = floatingMoney[i];

  // movement
  m.x += m.vx * dt;
  m.y += m.vy * dt;

  // slow down
  m.vx *= 0.9;
  m.vy *= 0.9;

  // magnet toward player
  const d = dist(player.x, player.y, m.x, m.y);
  if (d < 90) {
    const angle = Math.atan2(player.y - m.y, player.x - m.x);
    m.x += Math.cos(angle) * 180 * dt;
    m.y += Math.sin(angle) * 180 * dt;
  }

  m.life -= dt * 1.6;

  if (d < 20) {
    money += m.amount;
    floatingMoney.splice(i, 1);
    continue;
  }

  if (m.life <= 0) {
    floatingMoney.splice(i, 1);
  }
}

      // =========================================================
      // LOSE CONDITIONS
      // =========================================================
      if (player.hp <= 0 || baseHp <= 0) {
        player.hp = Math.max(0, player.hp);
        baseHp = Math.max(0, baseHp);
        gameOver = true;
        shopOpen = false;
      }

    };

    // =========================================================
    // DRAW HELPERS
    // =========================================================
   const drawSky = () => {
  const { skyBottom } = getWorld();

  // use your existing running time variable
  const t = skyTime;

  // slow drift values
  const cloudDriftA = (t * 6) % (cssW + 260);
  const cloudDriftB = (t * 3.5) % (cssW + 320);
  const hazeShift = Math.sin(t * 0.18) * 18;
  const hazeShift2 = Math.sin(t * 0.11 + 1.7) * 12;

  // main sky gradient
  const skyGrad = ctx.createLinearGradient(0, 0, 0, skyBottom);
  skyGrad.addColorStop(0, "#35393d");
  skyGrad.addColorStop(0.35, "#4d4b47");
  skyGrad.addColorStop(0.7, "#655d54");
  skyGrad.addColorStop(1, "#786b5f");
  ctx.fillStyle = skyGrad;
  ctx.fillRect(0, 0, cssW, skyBottom);

  // dirty horizon glow
  const horizonGlow = ctx.createLinearGradient(0, skyBottom * 0.45, 0, skyBottom);
  horizonGlow.addColorStop(0, "rgba(0,0,0,0)");
  horizonGlow.addColorStop(0.55, "rgba(120,88,52,0.10)");
  horizonGlow.addColorStop(0.85, "rgba(156,92,44,0.18)");
  horizonGlow.addColorStop(1, "rgba(70,38,24,0.24)");
  ctx.fillStyle = horizonGlow;
  ctx.fillRect(0, skyBottom * 0.45, cssW, skyBottom * 0.55);

  const drawSmogCloud = (
    x: number,
    y: number,
    w: number,
    h: number,
    alpha: number = 1
  ) => {
    ctx.save();
    ctx.globalAlpha = alpha;

    ctx.fillStyle = "rgba(36, 38, 40, 0.75)";
    ctx.beginPath();
    ctx.ellipse(x, y, w * 0.32, h * 0.42, 0, 0, Math.PI * 2);
    ctx.ellipse(x + w * 0.22, y - h * 0.18, w * 0.24, h * 0.34, 0, 0, Math.PI * 2);
    ctx.ellipse(x + w * 0.46, y, w * 0.3, h * 0.46, 0, 0, Math.PI * 2);
    ctx.ellipse(x + w * 0.7, y + h * 0.06, w * 0.24, h * 0.3, 0, 0, Math.PI * 2);
    ctx.fill();

    ctx.fillStyle = "rgba(130, 118, 102, 0.14)";
    ctx.beginPath();
    ctx.ellipse(x + w * 0.16, y - h * 0.08, w * 0.2, h * 0.16, 0, 0, Math.PI * 2);
    ctx.ellipse(x + w * 0.42, y - h * 0.14, w * 0.18, h * 0.14, 0, 0, Math.PI * 2);
    ctx.fill();

    ctx.restore();
  };

  // animated haze bands
  ctx.fillStyle = "rgba(20, 20, 20, 0.10)";
  ctx.fillRect(-40 + hazeShift, skyBottom * 0.18, cssW + 80, 26);

  ctx.fillStyle = "rgba(32, 30, 28, 0.14)";
  ctx.fillRect(-60 - hazeShift2, skyBottom * 0.29, cssW + 120, 18);

  ctx.fillStyle = "rgba(24, 22, 22, 0.12)";
  ctx.fillRect(-30 + hazeShift * 0.7, skyBottom * 0.41, cssW + 60, 24);

  // soft moving haze overlay
  const hazeGrad = ctx.createLinearGradient(0, skyBottom * 0.12, 0, skyBottom * 0.62);
  hazeGrad.addColorStop(0, "rgba(90, 82, 74, 0)");
  hazeGrad.addColorStop(0.45, "rgba(90, 82, 74, 0.07)");
  hazeGrad.addColorStop(1, "rgba(45, 38, 34, 0)");
  ctx.save();
  ctx.translate(hazeShift2 * 0.8, 0);
  ctx.fillStyle = hazeGrad;
  ctx.fillRect(-50, skyBottom * 0.08, cssW + 100, skyBottom * 0.6);
  ctx.restore();

  // animated clouds drifting slowly across screen
  drawSmogCloud(140 - cloudDriftA, 82, 190, 54, 0.9);
  drawSmogCloud(140 - cloudDriftA + cssW + 260, 82, 190, 54, 0.9);

  drawSmogCloud(cssW - 260 - cloudDriftB, 112, 240, 62, 0.82);
  drawSmogCloud(cssW - 260 - cloudDriftB + cssW + 320, 112, 240, 62, 0.82);

  drawSmogCloud(cssW * 0.4 - (cloudDriftA * 0.55), 60, 160, 42, 0.72);
  drawSmogCloud(cssW * 0.4 - (cloudDriftA * 0.55) + cssW + 260, 60, 160, 42, 0.72);

  // ash specks
  ctx.fillStyle = "rgba(18,18,18,0.16)";
  for (let i = 0; i < 80; i++) {
    const x = (i * 97 + Math.floor(t * 8)) % cssW;
    const y = (i * 53) % Math.max(1, Math.floor(skyBottom));
    const s = (i % 3) + 1;
    ctx.fillRect(x, y, s, s);
  }

  // top darkening
  const topShade = ctx.createLinearGradient(0, 0, 0, skyBottom * 0.45);
  topShade.addColorStop(0, "rgba(0,0,0,0.30)");
  topShade.addColorStop(1, "rgba(0,0,0,0)");
  ctx.fillStyle = topShade;
  ctx.fillRect(0, 0, cssW, skyBottom * 0.45);
};

   const drawGround = () => {
  const { groundTop, baseW, clearingX, clearingW, ruinsX, ruinsW } = getWorld();

  const groundH = cssH - groundTop;

  // =========================================================
  // BASE / CLEARING / RUINS FILL
  // =========================================================
  const baseGrad = ctx.createLinearGradient(0, groundTop, 0, cssH);
  baseGrad.addColorStop(0, "#7b8762");
  baseGrad.addColorStop(0.45, "#66714f");
  baseGrad.addColorStop(1, "#4e5840");
  ctx.fillStyle = baseGrad;
  ctx.fillRect(0, groundTop, baseW, groundH);

  const clearingGrad = ctx.createLinearGradient(0, groundTop, 0, cssH);
  clearingGrad.addColorStop(0, "#8b8269");
  clearingGrad.addColorStop(0.5, "#746b57");
  clearingGrad.addColorStop(1, "#5d5547");
  ctx.fillStyle = clearingGrad;
  ctx.fillRect(clearingX, groundTop, clearingW, groundH);

  const ruinsGrad = ctx.createLinearGradient(0, groundTop, 0, cssH);
  ruinsGrad.addColorStop(0, "#6c635d");
  ruinsGrad.addColorStop(0.5, "#544c47");
  ruinsGrad.addColorStop(1, "#3b3533");
  ctx.fillStyle = ruinsGrad;
  ctx.fillRect(ruinsX, groundTop, ruinsW, groundH);

  // =========================================================
  // TOP SHADE
  // =========================================================
  const topShade = ctx.createLinearGradient(0, groundTop, 0, groundTop + 120);
  topShade.addColorStop(0, "rgba(0,0,0,0.22)");
  topShade.addColorStop(1, "rgba(0,0,0,0)");
  ctx.fillStyle = topShade;
  ctx.fillRect(0, groundTop, cssW, 120);

  // =========================================================
  // BASE SIDE - DEAD GRASS
  // =========================================================
  for (let i = 0; i < 26; i++) {
    const x = 12 + i * (baseW / 26);
    const y = groundTop + 20 + (i % 5) * 26;
    const h = 12 + (i % 4) * 8;

    ctx.strokeStyle = "rgba(55, 70, 42, 0.45)";
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.moveTo(x, y + h);
    ctx.lineTo(x - 3, y);
    ctx.moveTo(x + 5, y + h - 2);
    ctx.lineTo(x + 2, y + 2);
    ctx.stroke();
  }

  // =========================================================
  // CLEARING - DIRT STRIPES
  // =========================================================
  for (let i = 0; i < 9; i++) {
    const y = groundTop + 28 + i * 34;

    ctx.fillStyle = "rgba(0,0,0,0.08)";
    ctx.fillRect(clearingX + 10, y, clearingW - 20, 8);

    ctx.fillStyle = "rgba(255,255,255,0.03)";
    ctx.fillRect(clearingX + 14, y + 1, clearingW - 28, 2);
  }

  // =========================================================
  // CLEARING - BURNT TREES
  // =========================================================
  const burntTreeXs = [
    clearingX + 36,
    clearingX + 92,
    clearingX + 148,
    clearingX + clearingW - 54,
  ];

  for (let i = 0; i < burntTreeXs.length; i++) {
    const tx = burntTreeXs[i];
    const ty = groundTop + 78 + (i % 2) * 78;
    const trunkH = 34 + (i % 3) * 10;

    ctx.strokeStyle = "#2b211d";
    ctx.lineWidth = 6;
    ctx.beginPath();
    ctx.moveTo(tx, ty + trunkH);
    ctx.lineTo(tx, ty);
    ctx.stroke();

    ctx.lineWidth = 4;
    ctx.beginPath();
    ctx.moveTo(tx, ty + 10);
    ctx.lineTo(tx - 10, ty + 2);
    ctx.moveTo(tx, ty + 14);
    ctx.lineTo(tx + 12, ty + 4);
    ctx.moveTo(tx, ty + 22);
    ctx.lineTo(tx - 8, ty + 16);
    ctx.stroke();

    ctx.fillStyle = "rgba(18, 18, 18, 0.22)";
    ctx.beginPath();
    ctx.ellipse(tx, ty + trunkH + 3, 12, 5, 0, 0, Math.PI * 2);
    ctx.fill();
  }

  // =========================================================
  // CLEARING - DEBRIS / SCRAP
  // =========================================================
  for (let i = 0; i < 18; i++) {
    const x = clearingX + 14 + i * ((clearingW - 28) / 18);
    const y = groundTop + 116 + (i % 5) * 28;

    ctx.save();
    ctx.translate(x, y);
    ctx.rotate(((i % 5) - 2) * 0.18);

    ctx.fillStyle = i % 3 === 0 ? "#4b5563" : i % 3 === 1 ? "#5b4631" : "#2f2a28";
    ctx.fillRect(-8, -3, 16, 6);

    ctx.fillStyle = "rgba(255,255,255,0.08)";
    ctx.fillRect(-6, -2, 8, 1);

    ctx.restore();
  }

  // =========================================================
  // RUINS - BIGGER BROKEN BUILDINGS
  // =========================================================
  const buildingCount = 5;
  const buildingGap = ruinsW / buildingCount;

  for (let i = 0; i < buildingCount; i++) {
    const bx = ruinsX + 16 + i * buildingGap;
    const bw = 42 + (i % 2) * 14;
    const bh = 96 + (i % 3) * 40;

    const bodyGrad = ctx.createLinearGradient(0, groundTop + 20, 0, groundTop + 20 + bh);
    bodyGrad.addColorStop(0, "rgba(40,40,42,0.70)");
    bodyGrad.addColorStop(1, "rgba(18,18,18,0.82)");
    ctx.fillStyle = bodyGrad;
    ctx.fillRect(bx, groundTop + 24, bw, bh);

    ctx.beginPath();
    ctx.moveTo(bx, groundTop + 24);
    ctx.lineTo(bx + 10, groundTop + 10 + (i % 2) * 8);
    ctx.lineTo(bx + 22, groundTop + 22);
    ctx.lineTo(bx + 34, groundTop + 8 + (i % 3) * 7);
    ctx.lineTo(bx + bw, groundTop + 24);
    ctx.closePath();
    ctx.fill();

    ctx.fillStyle = "rgba(0,0,0,0.35)";
    for (let wy = 0; wy < 3; wy++) {
      for (let wx = 0; wx < 2; wx++) {
        ctx.fillRect(
          bx + 7 + wx * 16,
          groundTop + 38 + wy * 24,
          8,
          12
        );
      }
    }

    ctx.fillStyle = "rgba(255,255,255,0.05)";
    ctx.fillRect(bx + 3, groundTop + 28, bw - 6, 4);
  }

  // =========================================================
  // RUINS - RUBBLE
  // =========================================================
  for (let i = 0; i < 24; i++) {
    const x = ruinsX + 8 + i * (ruinsW / 24);
    const y = groundTop + 154 + (i % 6) * 24;
    const w = 7 + (i % 4) * 4;
    const h = 4 + (i % 3) * 3;

    ctx.fillStyle = i % 2 === 0 ? "rgba(20,18,18,0.28)" : "rgba(60,52,48,0.22)";
    ctx.fillRect(x, y, w, h);
  }

  // =========================================================
  // CRACKS
  // =========================================================
  ctx.strokeStyle = "rgba(0,0,0,0.16)";
  ctx.lineWidth = 2;

  for (let i = 0; i < 11; i++) {
    const startX = clearingX + 20 + i * 52;
    const startY = groundTop + 110 + (i % 4) * 42;

    ctx.beginPath();
    ctx.moveTo(startX, startY);
    ctx.lineTo(startX + 16, startY - 8);
    ctx.lineTo(startX + 32, startY + 3);
    ctx.lineTo(startX + 44, startY - 10);
    ctx.stroke();
  }

  // =========================================================
  // BOTTOM SHADE
  // =========================================================
  const bottomShade = ctx.createLinearGradient(0, cssH - 140, 0, cssH);
  bottomShade.addColorStop(0, "rgba(0,0,0,0)");
  bottomShade.addColorStop(1, "rgba(0,0,0,0.22)");
  ctx.fillStyle = bottomShade;
  ctx.fillRect(0, cssH - 140, cssW, 140);
};

const drawBase = () => {
  const { wallX, wallY, wallW, wallH, baseDepositX, baseDepositY } = getWorld();

  const wallColors = ["#7b5d3f", "#8c6c49", "#6f7784", "#545b66", "#454b55"];
  const wallColor = wallColors[Math.min(wallColors.length - 1, baseLevel - 1)];

  // =========================================================
  // DROP ZONE FIRST (so wall draws on top)
  // =========================================================
  const dropZoneX = wallX - 52;
  const dropZoneY = wallY - 20;
  const dropZoneW = wallW + 64;
  const dropZoneH = wallH + 40;

  const dropGrad = ctx.createLinearGradient(0, dropZoneY, 0, dropZoneY + dropZoneH);
  dropGrad.addColorStop(0, "rgba(245, 158, 11, 0.10)");
  dropGrad.addColorStop(1, "rgba(120, 53, 15, 0.18)");
  ctx.fillStyle = dropGrad;
  ctx.fillRect(dropZoneX, dropZoneY, dropZoneW, dropZoneH);

  ctx.strokeStyle = "rgba(161, 98, 7, 0.85)";
  ctx.lineWidth = 2;
  ctx.strokeRect(dropZoneX, dropZoneY, dropZoneW, dropZoneH);

  // little hazard corners
  ctx.strokeStyle = "rgba(245, 158, 11, 0.95)";
  ctx.lineWidth = 3;
  ctx.beginPath();
  ctx.moveTo(dropZoneX, dropZoneY + 18);
  ctx.lineTo(dropZoneX, dropZoneY);
  ctx.lineTo(dropZoneX + 18, dropZoneY);

  ctx.moveTo(dropZoneX + dropZoneW - 18, dropZoneY);
  ctx.lineTo(dropZoneX + dropZoneW, dropZoneY);
  ctx.lineTo(dropZoneX + dropZoneW, dropZoneY + 18);

  ctx.moveTo(dropZoneX, dropZoneY + dropZoneH - 18);
  ctx.lineTo(dropZoneX, dropZoneY + dropZoneH);
  ctx.lineTo(dropZoneX + 18, dropZoneY + dropZoneH);

  ctx.moveTo(dropZoneX + dropZoneW - 18, dropZoneY + dropZoneH);
  ctx.lineTo(dropZoneX + dropZoneW, dropZoneY + dropZoneH);
  ctx.lineTo(dropZoneX + dropZoneW, dropZoneY + dropZoneH - 18);
  ctx.stroke();

  // =========================================================
  // MAIN WALL BODY
  // =========================================================
  const wallGrad = ctx.createLinearGradient(0, wallY, 0, wallY + wallH);
  wallGrad.addColorStop(0, wallColor);
  wallGrad.addColorStop(0.55, wallColor);
  wallGrad.addColorStop(1, "rgba(0,0,0,0.25)");
  ctx.fillStyle = wallGrad;
  ctx.fillRect(wallX, wallY, wallW, wallH);

  // planks / metal segments
  for (let i = 0; i < 7; i++) {
    const py = wallY + 8 + i * ((wallH - 16) / 7);
    ctx.fillStyle = "rgba(255,255,255,0.06)";
    ctx.fillRect(wallX + 4, py, wallW - 8, 3);

    ctx.fillStyle = "rgba(0,0,0,0.14)";
    ctx.fillRect(wallX + 4, py + 3, wallW - 8, 3);
  }

  // upright braces
  ctx.fillStyle = "rgba(30,20,12,0.45)";
  for (let i = 0; i < 4; i++) {
    const bx = wallX + 10 + i * ((wallW - 20) / 4);
    ctx.fillRect(bx, wallY + 4, 6, wallH - 8);
  }

  ctx.strokeStyle = "#1f2937";
  ctx.lineWidth = 2;
  ctx.strokeRect(wallX, wallY, wallW, wallH);

  // =========================================================
  // EXTERNAL SUPPORT POSTS
  // =========================================================
  ctx.fillStyle = "#4b3522";
  for (let i = 0; i < 6; i++) {
    const py = wallY + 14 + i * 52;
    ctx.fillRect(wallX - 12, py, 12, 8);
    ctx.fillRect(wallX + wallW, py + 6, 10, 6);
  }

  // =========================================================
  // DAMAGE / PATCHWORK DETAILS
  // =========================================================
  const damageAmount = 1 - clamp(baseHp / baseMaxHp, 0, 1);

  if (damageAmount > 0.08) {
    ctx.strokeStyle = "rgba(20, 20, 20, 0.35)";
    ctx.lineWidth = 2;

    for (let i = 0; i < Math.floor(4 + damageAmount * 10); i++) {
      const cx = wallX + 10 + (i * 19) % Math.max(20, wallW - 20);
      const cy = wallY + 14 + (i * 37) % Math.max(20, wallH - 28);

      ctx.beginPath();
      ctx.moveTo(cx, cy);
      ctx.lineTo(cx + 8, cy + 6);
      ctx.lineTo(cx + 15, cy - 2);
      ctx.stroke();
    }
  }

  // nailed repair boards when upgraded
  if (baseLevel >= 2) {
    ctx.save();
    ctx.translate(wallX + wallW * 0.25, wallY + wallH * 0.18);
    ctx.rotate(-0.08);
    ctx.fillStyle = "#5a3d26";
    ctx.fillRect(-18, 0, 36, 8);
    ctx.fillStyle = "#1f2937";
    ctx.fillRect(-14, 2, 3, 3);
    ctx.fillRect(11, 2, 3, 3);
    ctx.restore();

    ctx.save();
    ctx.translate(wallX + wallW * 0.62, wallY + wallH * 0.56);
    ctx.rotate(0.12);
    ctx.fillStyle = "#5a3d26";
    ctx.fillRect(-22, 0, 44, 8);
    ctx.fillStyle = "#1f2937";
    ctx.fillRect(-17, 2, 3, 3);
    ctx.fillRect(14, 2, 3, 3);
    ctx.restore();
  }

  // more metal reinforcement at higher levels
  if (baseLevel >= 3) {
    ctx.fillStyle = "rgba(120,130,145,0.8)";
    for (let i = 0; i < 3; i++) {
      const px = wallX + 14 + i * 26;
      ctx.fillRect(px, wallY + 10, 8, wallH - 20);

      ctx.fillStyle = "#d1d5db";
      for (let j = 0; j < 5; j++) {
        ctx.fillRect(px + 2, wallY + 18 + j * 30, 3, 3);
      }
      ctx.fillStyle = "rgba(120,130,145,0.8)";
    }
  }

  // =========================================================
  // WOOD DEPOSIT CRATE
  // =========================================================
  ctx.fillStyle = "#6b4423";
  ctx.fillRect(baseDepositX - 18, baseDepositY - 18, 36, 36);

  ctx.strokeStyle = "#2b1a0f";
  ctx.lineWidth = 2;
  ctx.strokeRect(baseDepositX - 18, baseDepositY - 18, 36, 36);

  ctx.strokeStyle = "rgba(255,255,255,0.15)";
  ctx.beginPath();
  ctx.moveTo(baseDepositX - 14, baseDepositY - 8);
  ctx.lineTo(baseDepositX + 14, baseDepositY - 8);
  ctx.moveTo(baseDepositX - 14, baseDepositY);
  ctx.lineTo(baseDepositX + 14, baseDepositY);
  ctx.stroke();

  ctx.fillStyle = "#a16207";
  ctx.fillRect(baseDepositX - 10, baseDepositY - 10, 20, 20);

  ctx.fillStyle = "#111827";
  ctx.font = "bold 12px sans-serif";
  ctx.fillText("WOOD", baseDepositX - 20, baseDepositY + 30);

  // =========================================================
  // WALL HP BAR
  // =========================================================
  const hpFill = clamp(baseHp / baseMaxHp, 0, 1);
  const hpBarX = wallX - 10;
  const hpBarY = wallY - 20;
  const hpBarW = 64;
  const hpBarH = 10;

  ctx.fillStyle = "rgba(0,0,0,0.45)";
  ctx.fillRect(hpBarX, hpBarY, hpBarW, hpBarH);

  ctx.fillStyle =
    hpFill > 0.6 ? "#22c55e" : hpFill > 0.3 ? "#f59e0b" : "#ef4444";
  ctx.fillRect(hpBarX, hpBarY, hpBarW * hpFill, hpBarH);

  ctx.strokeStyle = "#ffffff";
  ctx.lineWidth = 2;
  ctx.strokeRect(hpBarX, hpBarY, hpBarW, hpBarH);

  ctx.fillStyle = "#ffffff";
  ctx.font = "bold 11px sans-serif";
  ctx.fillText("WALL", wallX - 10, wallY - 26);

  // =========================================================
  // UPGRADE / MATERIAL TEXT
  // =========================================================
  ctx.fillStyle = "rgba(0,0,0,0.5)";
  ctx.fillRect(wallX - 10, wallY + wallH + 10, 110, 20);

  ctx.fillStyle = "#f3f4f6";
  ctx.font = "bold 11px sans-serif";
  ctx.fillText(`LV ${baseLevel}`, wallX - 4, wallY + wallH + 24);
};

   const drawMachines = () => {
  for (const machine of machines) {
    // =========================================================
    // MACHINE BODY
    // =========================================================
    const bodyGrad = ctx.createLinearGradient(
      machine.x,
      machine.y,
      machine.x,
      machine.y + machine.h
    );
    bodyGrad.addColorStop(0, machine.color);
    bodyGrad.addColorStop(0.65, machine.color);
    bodyGrad.addColorStop(1, "rgba(0,0,0,0.22)");

    ctx.fillStyle = bodyGrad;
    ctx.fillRect(machine.x, machine.y, machine.w, machine.h);

    ctx.strokeStyle = "#111827";
    ctx.lineWidth = 2;
    ctx.strokeRect(machine.x, machine.y, machine.w, machine.h);

    // top shine strip
    ctx.fillStyle = "rgba(255,255,255,0.10)";
    ctx.fillRect(machine.x + 3, machine.y + 3, machine.w - 6, 4);

    // dark lower grime
    ctx.fillStyle = "rgba(0,0,0,0.12)";
    ctx.fillRect(machine.x + 4, machine.y + machine.h - 14, machine.w - 8, 10);

    // =========================================================
    // PANEL / BOLTS
    // =========================================================
    ctx.fillStyle = "rgba(15,23,42,0.35)";
    ctx.fillRect(machine.x + 6, machine.y + 22, machine.w - 12, 12);

    ctx.fillStyle = "#1f2937";
    ctx.fillRect(machine.x + 8, machine.y + 8, 4, 4);
    ctx.fillRect(machine.x + machine.w - 12, machine.y + 8, 4, 4);
    ctx.fillRect(machine.x + 8, machine.y + machine.h - 12, 4, 4);
    ctx.fillRect(machine.x + machine.w - 12, machine.y + machine.h - 12, 4, 4);

    // =========================================================
    // MACHINE TYPE DETAILS
    // =========================================================
    if (machine.kind === "turretAmmo") {
      // ammo press slots
      ctx.fillStyle = "#374151";
      for (let i = 0; i < 3; i++) {
        ctx.fillRect(machine.x + 10 + i * 16, machine.y + machine.h - 24, 10, 8);
      }

      // tiny warning light
      ctx.fillStyle = machine.hasCrateReady ? "#22c55e" : "#f59e0b";
      ctx.beginPath();
      ctx.arc(machine.x + machine.w - 12, machine.y + 14, 4, 0, Math.PI * 2);
      ctx.fill();
    }

    if (machine.kind === "akAmmo") {
      // mag slots
      ctx.fillStyle = "#2f3540";
      ctx.fillRect(machine.x + 10, machine.y + machine.h - 26, 14, 12);
      ctx.fillRect(machine.x + 28, machine.y + machine.h - 26, 14, 12);

      // feed chute
      ctx.fillStyle = "#4b5563";
      ctx.fillRect(machine.x + machine.w - 18, machine.y + 22, 8, 24);

      ctx.fillStyle = machine.hasCrateReady ? "#22c55e" : "#ef4444";
      ctx.beginPath();
      ctx.arc(machine.x + machine.w - 12, machine.y + 14, 4, 0, Math.PI * 2);
      ctx.fill();
    }

    if (machine.kind === "wood") {
      // wood processor slats
      ctx.fillStyle = "#5b4631";
      for (let i = 0; i < 3; i++) {
        ctx.fillRect(machine.x + 10 + i * 14, machine.y + machine.h - 24, 10, 10);
      }

      // saw line
      ctx.strokeStyle = "#d1d5db";
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.moveTo(machine.x + 10, machine.y + 18);
      ctx.lineTo(machine.x + machine.w - 10, machine.y + 18);
      ctx.stroke();

      ctx.fillStyle = machine.hasCrateReady ? "#22c55e" : "#84cc16";
      ctx.beginPath();
      ctx.arc(machine.x + machine.w - 12, machine.y + 14, 4, 0, Math.PI * 2);
      ctx.fill();
    }

    // =========================================================
    // LABEL
    // =========================================================
    ctx.fillStyle = "#0f172a";
    ctx.font = "bold 11px sans-serif";
    ctx.fillText(machine.label, machine.x + 6, machine.y + 16);

    // =========================================================
    // PROGRESS BAR BACK
    // =========================================================
    const barX = machine.x + 6;
    const barY = machine.y + 40;
    const barW = machine.w - 12;
    const barH = 10;

    ctx.fillStyle = "rgba(255,255,255,0.12)";
    ctx.fillRect(barX, barY, barW, barH);

    ctx.strokeStyle = "rgba(17,24,39,0.9)";
    ctx.lineWidth = 1.5;
    ctx.strokeRect(barX, barY, barW, barH);

    const fill = machine.hasCrateReady
      ? 1
      : clamp(machine.progress / machine.produceTime, 0, 1);

    ctx.fillStyle = machine.hasCrateReady ? "#22c55e" : "#eab308";
    ctx.fillRect(barX, barY, barW * fill, barH);

    // little shine on progress fill
    if (fill > 0) {
      ctx.fillStyle = "rgba(255,255,255,0.18)";
      ctx.fillRect(barX, barY + 1, barW * fill, 3);
    }

    // =========================================================
    // READY CRATE
    // =========================================================
    if (machine.hasCrateReady) {
      const crateX = machine.x + machine.w + 10;
      const crateY = machine.y + 12;
      const crateW = 22;
      const crateH = 22;

      ctx.fillStyle = "#6b4423";
      ctx.fillRect(crateX, crateY, crateW, crateH);

      ctx.strokeStyle = "#111827";
      ctx.lineWidth = 2;
      ctx.strokeRect(crateX, crateY, crateW, crateH);

      ctx.strokeStyle = "rgba(255,255,255,0.16)";
      ctx.lineWidth = 1;
      ctx.beginPath();
      ctx.moveTo(crateX + 4, crateY + 7);
      ctx.lineTo(crateX + crateW - 4, crateY + 7);
      ctx.moveTo(crateX + 4, crateY + 14);
      ctx.lineTo(crateX + crateW - 4, crateY + 14);
      ctx.stroke();

      // cargo icon based on machine type
      if (machine.kind === "wood") {
        ctx.fillStyle = "#a16207";
        ctx.fillRect(crateX + 6, crateY + 6, 10, 8);
      } else if (machine.kind === "akAmmo") {
        ctx.fillStyle = "#374151";
        ctx.fillRect(crateX + 7, crateY + 5, 8, 12);
      } else {
        ctx.fillStyle = "#4b5563";
        ctx.fillRect(crateX + 6, crateY + 8, 3, 3);
        ctx.fillRect(crateX + 11, crateY + 8, 3, 3);
        ctx.fillRect(crateX + 8.5, crateY + 12, 3, 3);
      }

      // ready glow
      ctx.strokeStyle = "rgba(34,197,94,0.7)";
      ctx.lineWidth = 2;
      ctx.strokeRect(crateX - 2, crateY - 2, crateW + 4, crateH + 4);
    }
  }
};

const drawTurrets = () => {
  for (const turret of turrets) {
    const ringPulse = 1 + Math.sin(performance.now() * 0.004 + turret.x * 0.01) * 0.03;

    // =========================================================
    // PAD / SHADOW
    // =========================================================
    ctx.save();
    ctx.translate(turret.x, turret.y);

    ctx.fillStyle = "rgba(0,0,0,0.18)";
    ctx.beginPath();
    ctx.ellipse(0, 18, 18, 8, 0, 0, Math.PI * 2);
    ctx.fill();

    ctx.strokeStyle = "rgba(0,0,0,0.18)";
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.arc(0, 0, 18 * ringPulse, 0, Math.PI * 2);
    ctx.stroke();

    // =========================================================
    // LOCKED
    // =========================================================
    if (!turret.unlocked) {
      ctx.fillStyle = "#475569";
      ctx.fillRect(-16, -16, 32, 32);

      ctx.strokeStyle = "#0f172a";
      ctx.lineWidth = 2;
      ctx.strokeRect(-16, -16, 32, 32);

      ctx.fillStyle = "rgba(255,255,255,0.10)";
      ctx.fillRect(-13, -13, 26, 5);

      ctx.fillStyle = "#cbd5e1";
      ctx.beginPath();
      ctx.arc(0, -2, 6, Math.PI, 0);
      ctx.stroke();

      ctx.fillStyle = "#e2e8f0";
      ctx.font = "12px sans-serif";
      ctx.fillText("LOCK", -16, 30);

      ctx.restore();
      continue;
    }

    // =========================================================
    // BASE PLATFORM
    // =========================================================
    const baseGrad = ctx.createLinearGradient(0, -14, 0, 14);
    baseGrad.addColorStop(0, "#6b7280");
    baseGrad.addColorStop(0.5, "#4b5563");
    baseGrad.addColorStop(1, "#1f2937");

    ctx.fillStyle = baseGrad;
    ctx.beginPath();
    ctx.arc(0, 0, 15, 0, Math.PI * 2);
    ctx.fill();

    ctx.strokeStyle = "#111827";
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.arc(0, 0, 15, 0, Math.PI * 2);
    ctx.stroke();

    // center cap
    ctx.fillStyle = "#9ca3af";
    ctx.beginPath();
    ctx.arc(0, 0, 6, 0, Math.PI * 2);
    ctx.fill();

    ctx.strokeStyle = "#111827";
    ctx.lineWidth = 1.5;
    ctx.beginPath();
    ctx.arc(0, 0, 6, 0, Math.PI * 2);
    ctx.stroke();

    // =========================================================
    // BARREL DIRECTION
    // =========================================================
    const turretAngle =
      turret.target && turret.unlocked
        ? Math.atan2(turret.target.y - turret.y, turret.target.x - turret.x)
        : 0;

    ctx.rotate(turretAngle);

    // rear housing
    ctx.fillStyle = "#374151";
    ctx.fillRect(-4, -6, 14, 12);

    ctx.strokeStyle = "#111827";
    ctx.lineWidth = 2;
    ctx.strokeRect(-4, -6, 14, 12);

    // main barrel
    const barrelGrad = ctx.createLinearGradient(0, 0, 22, 0);
    barrelGrad.addColorStop(0, "#4b5563");
    barrelGrad.addColorStop(1, "#111827");
    ctx.fillStyle = barrelGrad;
    ctx.fillRect(8, -4, 20, 8);

    // barrel tip
    ctx.fillStyle = "#0f172a";
    ctx.fillRect(28, -3, 4, 6);

    // top highlight
    ctx.fillStyle = "rgba(255,255,255,0.15)";
    ctx.fillRect(9, -3, 16, 2);

    // side support / second small barrel feel
    ctx.fillStyle = "#1f2937";
    ctx.fillRect(4, 4, 14, 3);

    // =========================================================
    // AMMO BOX ATTACHED TO SIDE
    // =========================================================
    ctx.fillStyle = "#5b4631";
    ctx.fillRect(-10, 5, 10, 12);

    ctx.strokeStyle = "#111827";
    ctx.lineWidth = 1.5;
    ctx.strokeRect(-10, 5, 10, 12);

    ctx.fillStyle = "#a16207";
    ctx.fillRect(-8, 7, 6, 3);
    ctx.fillRect(-8, 12, 6, 3);

    ctx.restore();

    // =========================================================
    // AMMO TEXT
    // =========================================================
    ctx.fillStyle = "#111827";
    ctx.font = "11px sans-serif";
    ctx.fillText(
      `${turret.ammo}/${turret.maxAmmo}`,
      turret.x - 18,
      turret.y + 30
    );

    // =========================================================
    // LOW / EMPTY AMMO VISUAL
    // =========================================================
    if (turret.ammo <= 0) {
      const pulse = 1 + Math.sin(performance.now() * 0.006) * 0.15;

      ctx.save();
      ctx.translate(turret.x, turret.y - 26);
      ctx.scale(pulse, pulse);

      ctx.fillStyle = "#ef4444";
      ctx.beginPath();
      ctx.arc(0, 0, 9, 0, Math.PI * 2);
      ctx.fill();

      ctx.fillStyle = "#ffffff";
      ctx.fillRect(-1.5, -5, 3, 7);
      ctx.fillRect(-1.5, 3, 3, 3);

      ctx.restore();
    } else if (turret.ammo <= Math.ceil(turret.maxAmmo * 0.25)) {
      ctx.save();
      ctx.translate(turret.x, turret.y - 26);

      ctx.fillStyle = "#f59e0b";
      ctx.beginPath();
      ctx.arc(0, 0, 8, 0, Math.PI * 2);
      ctx.fill();

      ctx.fillStyle = "#111827";
      ctx.fillRect(-1.5, -5, 3, 7);
      ctx.fillRect(-1.5, 3, 3, 3);

      ctx.restore();
    }
  }
};

     const drawPlayer = () => {
  const angle = Math.atan2(mouse.y - player.y, mouse.x - player.x);
  player.facingAngle = angle;

  const bob = Math.sin(skyTime * 10) * 1.5;
  const bodyBob = bob;

  const facingX = Math.cos(angle);
  const facingY = Math.sin(angle);

  const sideX = Math.cos(angle + Math.PI / 2);
  const sideY = Math.sin(angle + Math.PI / 2);

  const bodyX = player.x;
  const bodyY = player.y + 6 + bodyBob;
  const headX = player.x + facingX * 8;
  const headY = player.y - 10 + facingY * 3 + bodyBob;

  const legSpread = 7;
  const legForward = 8;

  const backLegX = bodyX - sideX * legSpread - facingX * 2;
  const backLegY = bodyY + 15 - sideY * 2;
  const frontLegX = bodyX + sideX * legSpread + facingX * 2;
  const frontLegY = bodyY + 15 + sideY * 2;

  const shoulderX = bodyX + facingX * 8;
  const shoulderY = bodyY - 4 + facingY * 3;

  const gunBaseX = shoulderX + facingX * 8;
  const gunBaseY = shoulderY + facingY * 8;
  const gunTipX = gunBaseX + facingX * 20;
  const gunTipY = gunBaseY + facingY * 20;

  const backArmX = bodyX - sideX * 5 + facingX * 4;
  const backArmY = bodyY - 2 - sideY * 5;

  // shadow
  ctx.fillStyle = "rgba(0,0,0,0.22)";
  ctx.beginPath();
  ctx.ellipse(
    player.x,
    player.y + player.radius + 12,
    15,
    8,
    0,
    0,
    Math.PI * 2
  );
  ctx.fill();

  // back leg
  ctx.strokeStyle = "#1e40af";
  ctx.lineWidth = 7;
  ctx.lineCap = "round";
  ctx.beginPath();
  ctx.moveTo(bodyX - sideX * 4, bodyY + 8);
  ctx.lineTo(backLegX, backLegY);
  ctx.stroke();

  // front leg
  ctx.strokeStyle = "#2563eb";
  ctx.lineWidth = 7;
  ctx.beginPath();
  ctx.moveTo(bodyX + sideX * 4, bodyY + 8);
  ctx.lineTo(frontLegX, frontLegY);
  ctx.stroke();

  // feet
  ctx.strokeStyle = "#111827";
  ctx.lineWidth = 4;
  ctx.beginPath();
  ctx.moveTo(backLegX - 4, backLegY);
  ctx.lineTo(backLegX + 4, backLegY);
  ctx.moveTo(frontLegX - 4, frontLegY);
  ctx.lineTo(frontLegX + 4, frontLegY);
  ctx.stroke();

  // back arm
  ctx.strokeStyle = "#93c5fd";
  ctx.lineWidth = 6;
  ctx.beginPath();
  ctx.moveTo(backArmX, backArmY);
  ctx.lineTo(backArmX + facingX * 10, backArmY + facingY * 10);
  ctx.stroke();

  // torso
  ctx.save();
  ctx.translate(bodyX, bodyY);
  ctx.rotate(angle);

  const bodyGradient = ctx.createLinearGradient(0, -16, 0, 18);
  bodyGradient.addColorStop(0, "#60a5fa");
  bodyGradient.addColorStop(0.55, "#2563eb");
  bodyGradient.addColorStop(1, "#1e3a8a");

  ctx.fillStyle = bodyGradient;
  ctx.beginPath();
  ctx.ellipse(0, 0, 13, 17, 0, 0, Math.PI * 2);
  ctx.fill();

  ctx.strokeStyle = "#0f172a";
  ctx.lineWidth = 3;
  ctx.stroke();

  // chest plate / vest
  ctx.fillStyle = "rgba(255,255,255,0.12)";
  ctx.beginPath();
  ctx.ellipse(2, -2, 7, 10, 0, 0, Math.PI * 2);
  ctx.fill();

  ctx.restore();

  // front arm to gun
  ctx.strokeStyle = "#bfdbfe";
  ctx.lineWidth = 6;
  ctx.beginPath();
  ctx.moveTo(shoulderX, shoulderY);
  ctx.lineTo(gunBaseX, gunBaseY);
  ctx.stroke();

  // gun body
  ctx.strokeStyle = "#111827";
  ctx.lineWidth = 7;
  ctx.beginPath();
  ctx.moveTo(gunBaseX, gunBaseY);
  ctx.lineTo(gunTipX, gunTipY);
  ctx.stroke();

  // gun highlight
  ctx.strokeStyle = "#6b7280";
  ctx.lineWidth = 2;
  ctx.beginPath();
  ctx.moveTo(
    gunBaseX + sideX * 1.5,
    gunBaseY + sideY * 1.5
  );
  ctx.lineTo(
    gunTipX + sideX * 1.5,
    gunTipY + sideY * 1.5
  );
  ctx.stroke();

  // muzzle
  ctx.fillStyle = "#d1d5db";
  ctx.beginPath();
  ctx.arc(gunTipX, gunTipY, 3, 0, Math.PI * 2);
  ctx.fill();

  // head
  const headGradient = ctx.createRadialGradient(
    headX - 3,
    headY - 4,
    2,
    headX,
    headY,
    11
  );
  headGradient.addColorStop(0, "#fde68a");
  headGradient.addColorStop(1, "#d97706");

  ctx.fillStyle = headGradient;
  ctx.beginPath();
  ctx.arc(headX, headY, 9, 0, Math.PI * 2);
  ctx.fill();

  ctx.strokeStyle = "#111827";
  ctx.lineWidth = 2;
  ctx.stroke();

  // visor / eyes direction
  ctx.strokeStyle = "#e0f2fe";
  ctx.lineWidth = 3;
  ctx.beginPath();
  ctx.moveTo(
    headX + Math.cos(angle - 0.4) * 5,
    headY + Math.sin(angle - 0.4) * 5
  );
  ctx.lineTo(
    headX + Math.cos(angle + 0.4) * 5,
    headY + Math.sin(angle + 0.4) * 5
  );
  ctx.stroke();

  // carried crate
  if (player.carried) {
    const crateX = player.x - 16;
    const crateY = player.y - 40 + bodyBob;

    ctx.strokeStyle = "#93c5fd";
    ctx.lineWidth = 5;
    ctx.beginPath();
    ctx.moveTo(bodyX - 6, bodyY - 2);
    ctx.lineTo(crateX + 7, crateY + 12);
    ctx.moveTo(bodyX + 6, bodyY - 2);
    ctx.lineTo(crateX + 25, crateY + 12);
    ctx.stroke();

    ctx.fillStyle = "rgba(0,0,0,0.18)";
    ctx.fillRect(crateX + 2, crateY + 3, 32, 20);

    ctx.fillStyle = player.carried.color;
    ctx.fillRect(crateX, crateY, 32, 20);

    ctx.strokeStyle = "#111827";
    ctx.lineWidth = 2;
    ctx.strokeRect(crateX, crateY, 32, 20);

    ctx.strokeStyle = "rgba(255,255,255,0.28)";
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.moveTo(crateX + 4, crateY + 6);
    ctx.lineTo(crateX + 28, crateY + 6);
    ctx.moveTo(crateX + 4, crateY + 14);
    ctx.lineTo(crateX + 28, crateY + 14);
    ctx.stroke();
  }
};

const drawBullets = () => {
  for (const b of bullets) {
    const angle = Math.atan2(b.vy, b.vx);
    const trailLength = b.fromTurret ? 14 : 12;
    const backX = b.x - Math.cos(angle) * trailLength;
    const backY = b.y - Math.sin(angle) * trailLength;

    // tracer
    ctx.strokeStyle = b.fromTurret
      ? "rgba(245,158,11,0.95)"
      : "rgba(34,211,238,0.95)";
    ctx.lineWidth = b.fromTurret ? 3.4 : 3;
    ctx.lineCap = "round";
    ctx.beginPath();
    ctx.moveTo(backX, backY);
    ctx.lineTo(b.x, b.y);
    ctx.stroke();

    // soft glow
    ctx.fillStyle = b.fromTurret
      ? "rgba(251,191,36,0.30)"
      : "rgba(34,211,238,0.28)";
    ctx.beginPath();
    ctx.arc(b.x, b.y, b.fromTurret ? 5.5 : 5, 0, Math.PI * 2);
    ctx.fill();

    // core
    ctx.fillStyle = b.fromTurret ? "#f59e0b" : "#67e8f9";
    ctx.beginPath();
    ctx.arc(b.x, b.y, b.fromTurret ? 2.8 : 2.5, 0, Math.PI * 2);
    ctx.fill();

    // white tip highlight
    ctx.fillStyle = "rgba(255,255,255,0.9)";
    ctx.beginPath();
    ctx.arc(
      b.x - Math.cos(angle) * 1.2,
      b.y - Math.sin(angle) * 1.2,
      0.9,
      0,
      Math.PI * 2
    );
    ctx.fill();
  }
};

const drawImpactParticles = () => {
  for (const p of impactParticles) {
    const alpha = clamp(p.life / p.maxLife, 0, 1);

    ctx.globalAlpha = alpha;

    ctx.fillStyle = p.color;
    ctx.beginPath();
    ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
    ctx.fill();

    ctx.globalAlpha = alpha * 0.35;
    ctx.beginPath();
    ctx.arc(p.x, p.y, p.size * 1.8, 0, Math.PI * 2);
    ctx.fill();

    ctx.globalAlpha = 1;
  }
};

    const drawZombies = () => {
  for (const z of zombies) {
    const moveAngle =
      Math.abs(z.vx) > 0.01 || Math.abs(z.speed) > 0.01
        ? Math.atan2(0, z.vx || -1)
        : Math.PI;

    const facingX = Math.cos(moveAngle);
    const facingY = Math.sin(moveAngle);
    const sideX = Math.cos(moveAngle + Math.PI / 2);
    const sideY = Math.sin(moveAngle + Math.PI / 2);

    const bodyBob = Math.sin((skyTime * 8) + z.x * 0.04) * 1.2;

    const bodyX = z.x;
    const bodyY = z.y + 4 + bodyBob;
    const headX = z.x + facingX * 6;
    const headY = z.y - z.radius * 0.55 + bodyBob;

    const isTank = z.type === "tank";
    const isFast = z.type === "fast";
    const isSpitter = z.type === "spitter";
    const isBasic = z.type === "basic";

    const bodyW = isTank ? z.radius * 0.95 : isFast ? z.radius * 0.72 : z.radius * 0.8;
    const bodyH = isTank ? z.radius * 1.05 : isFast ? z.radius * 0.82 : z.radius * 0.9;
    const headR = isTank ? z.radius * 0.52 : isFast ? z.radius * 0.42 : z.radius * 0.46;

    const legSpread = isTank ? 8 : 6;
    const legY = bodyY + bodyH * 0.8;

    // shadow
    ctx.fillStyle = "rgba(0,0,0,0.22)";
    ctx.beginPath();
    ctx.ellipse(
      z.x,
      z.y + z.radius + 8,
      z.radius * 0.9,
      z.radius * 0.42,
      0,
      0,
      Math.PI * 2
    );
    ctx.fill();

    // back arm
    ctx.strokeStyle = "rgba(20,20,20,0.28)";
    ctx.lineWidth = isTank ? 7 : 5;
    ctx.lineCap = "round";
    ctx.beginPath();
    ctx.moveTo(bodyX - sideX * 4, bodyY - 1 - sideY * 4);
    ctx.lineTo(
      bodyX - sideX * (bodyW * 0.7) + facingX * 2,
      bodyY + bodyH * 0.3 - sideY * 2
    );
    ctx.stroke();

    // back leg
    ctx.strokeStyle = isTank ? "#7f1d1d" : isSpitter ? "#854d0e" : "#14532d";
    ctx.lineWidth = isTank ? 8 : 6;
    ctx.beginPath();
    ctx.moveTo(bodyX - sideX * 4, bodyY + bodyH * 0.45);
    ctx.lineTo(bodyX - sideX * legSpread, legY);
    ctx.stroke();

    // front leg
    ctx.strokeStyle = isTank ? "#b91c1c" : isSpitter ? "#ca8a04" : isFast ? "#2563eb" : "#22c55e";
    ctx.lineWidth = isTank ? 8 : 6;
    ctx.beginPath();
    ctx.moveTo(bodyX + sideX * 4, bodyY + bodyH * 0.45);
    ctx.lineTo(bodyX + sideX * legSpread, legY);
    ctx.stroke();

    // feet
    ctx.strokeStyle = "#111827";
    ctx.lineWidth = 3;
    ctx.beginPath();
    ctx.moveTo(bodyX - sideX * legSpread - 3, legY);
    ctx.lineTo(bodyX - sideX * legSpread + 3, legY);
    ctx.moveTo(bodyX + sideX * legSpread - 3, legY);
    ctx.lineTo(bodyX + sideX * legSpread + 3, legY);
    ctx.stroke();

    // torso
    ctx.save();
    ctx.translate(bodyX, bodyY);
    ctx.rotate(moveAngle);

    const bodyGradient = ctx.createLinearGradient(0, -bodyH, 0, bodyH);

    if (isTank) {
      bodyGradient.addColorStop(0, "#ef4444");
      bodyGradient.addColorStop(0.55, "#b91c1c");
      bodyGradient.addColorStop(1, "#7f1d1d");
    } else if (isSpitter) {
      bodyGradient.addColorStop(0, "#fde047");
      bodyGradient.addColorStop(0.55, "#eab308");
      bodyGradient.addColorStop(1, "#a16207");
    } else if (isFast) {
      bodyGradient.addColorStop(0, "#60a5fa");
      bodyGradient.addColorStop(0.55, "#2563eb");
      bodyGradient.addColorStop(1, "#1e3a8a");
    } else {
      bodyGradient.addColorStop(0, "#4ade80");
      bodyGradient.addColorStop(0.55, "#22c55e");
      bodyGradient.addColorStop(1, "#166534");
    }

    ctx.fillStyle = bodyGradient;
    ctx.beginPath();
    ctx.ellipse(0, 0, bodyW, bodyH, 0, 0, Math.PI * 2);
    ctx.fill();

    ctx.strokeStyle = "#0f172a";
    ctx.lineWidth = 2.5;
    ctx.stroke();

    // chest detail
    ctx.fillStyle = "rgba(255,255,255,0.10)";
    ctx.beginPath();
    ctx.ellipse(bodyW * 0.15, -bodyH * 0.1, bodyW * 0.35, bodyH * 0.45, 0, 0, Math.PI * 2);
    ctx.fill();

    // special torso details
    if (isSpitter) {
      ctx.fillStyle = "rgba(20,20,20,0.18)";
      ctx.beginPath();
      ctx.arc(bodyW * 0.5, -1, 4, 0, Math.PI * 2);
      ctx.fill();
    }

    if (isTank) {
      ctx.fillStyle = "rgba(0,0,0,0.15)";
      ctx.fillRect(-bodyW * 0.4, -bodyH * 0.15, bodyW * 0.8, bodyH * 0.3);
    }

    ctx.restore();

    // front arm
    ctx.strokeStyle = isTank ? "#fca5a5" : isSpitter ? "#fde68a" : "#bbf7d0";
    ctx.lineWidth = isTank ? 7 : 5;
    ctx.beginPath();
    ctx.moveTo(bodyX + facingX * 4, bodyY - 1 + facingY * 2);
    ctx.lineTo(
      bodyX + facingX * (bodyW * 0.9) + sideX * 2,
      bodyY + bodyH * 0.3 + sideY * 2
    );
    ctx.stroke();

    // head
    const headGradient = ctx.createRadialGradient(
      headX - 2,
      headY - 3,
      2,
      headX,
      headY,
      headR + 3
    );

    if (isTank) {
      headGradient.addColorStop(0, "#fca5a5");
      headGradient.addColorStop(1, "#991b1b");
    } else if (isSpitter) {
      headGradient.addColorStop(0, "#fef08a");
      headGradient.addColorStop(1, "#ca8a04");
    } else if (isFast) {
      headGradient.addColorStop(0, "#bfdbfe");
      headGradient.addColorStop(1, "#1d4ed8");
    } else {
      headGradient.addColorStop(0, "#bbf7d0");
      headGradient.addColorStop(1, "#15803d");
    }

    ctx.fillStyle = headGradient;
    ctx.beginPath();
    ctx.arc(headX, headY, headR, 0, Math.PI * 2);
    ctx.fill();

    ctx.strokeStyle = "#111827";
    ctx.lineWidth = 2;
    ctx.stroke();

    // eyes
    const eyeOffsetSide = 3.2;
    const eyeForward = 2.4;
    const eyeSize = isTank ? 2.1 : 1.8;

    ctx.fillStyle = isSpitter ? "#7f1d1d" : "#111827";
    ctx.beginPath();
    ctx.arc(
      headX + facingX * eyeForward + sideX * eyeOffsetSide,
      headY + facingY * eyeForward + sideY * eyeOffsetSide,
      eyeSize,
      0,
      Math.PI * 2
    );
    ctx.arc(
      headX + facingX * eyeForward - sideX * eyeOffsetSide,
      headY + facingY * eyeForward - sideY * eyeOffsetSide,
      eyeSize,
      0,
      Math.PI * 2
    );
    ctx.fill();

    // mouth / special face detail
    if (isSpitter) {
      ctx.strokeStyle = "#7f1d1d";
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.arc(
        headX + facingX * 4,
        headY + facingY * 4,
        3.5,
        0,
        Math.PI * 2
      );
      ctx.stroke();
    } else {
      ctx.strokeStyle = "rgba(20,20,20,0.55)";
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.moveTo(
        headX + facingX * 4 - sideX * 2,
        headY + facingY * 4 - sideY * 2
      );
      ctx.lineTo(
        headX + facingX * 4 + sideX * 2,
        headY + facingY * 4 + sideY * 2
      );
      ctx.stroke();
    }

    // hp bar background
    const hpBarW = z.radius * 2.2;
    const hpBarH = 5;
    const hpBarX = z.x - hpBarW / 2;
    const hpBarY = z.y - z.radius - 16;

    ctx.fillStyle = "rgba(0,0,0,0.32)";
    ctx.fillRect(hpBarX, hpBarY, hpBarW, hpBarH);

    // hp fill
    ctx.fillStyle =
      z.hp / z.maxHp > 0.6 ? "#22c55e" : z.hp / z.maxHp > 0.3 ? "#f59e0b" : "#ef4444";
    ctx.fillRect(hpBarX, hpBarY, hpBarW * clamp(z.hp / z.maxHp, 0, 1), hpBarH);

    ctx.strokeStyle = "rgba(255,255,255,0.5)";
    ctx.lineWidth = 1;
    ctx.strokeRect(hpBarX, hpBarY, hpBarW, hpBarH);
  }
};

const drawMoneyDrops = () => {
  ctx.save();

  ctx.textAlign = "center";
  ctx.textBaseline = "middle";
  ctx.font = "bold 16px sans-serif";

  for (const m of floatingMoney) {
    ctx.globalAlpha = Math.max(0, m.life);

    const text = `+$${m.amount}`;

    ctx.lineWidth = 4;
    ctx.strokeStyle = "rgba(0,0,0,0.6)";
    ctx.strokeText(text, m.x, m.y);

    const grad = ctx.createLinearGradient(m.x, m.y - 10, m.x, m.y + 10);
    grad.addColorStop(0, "#bbf7d0");
    grad.addColorStop(1, "#16a34a");

    ctx.fillStyle = grad;
    ctx.fillText(text, m.x, m.y);
  }

  ctx.restore();
};
    const drawConsole = () => {
  const { upgradeConsoleX, upgradeConsoleY } = getWorld();

  const x = upgradeConsoleX;
  const y = upgradeConsoleY;
  const w = 52;
  const h = 58;

  ctx.save();
  ctx.translate(x, y);

  // shadow
  ctx.fillStyle = "rgba(0,0,0,0.22)";
  ctx.beginPath();
  ctx.ellipse(0, 26, 24, 8, 0, 0, Math.PI * 2);
  ctx.fill();

  // main body
  const bodyGrad = ctx.createLinearGradient(0, -h * 0.5, 0, h * 0.5);
  bodyGrad.addColorStop(0, "#475569");
  bodyGrad.addColorStop(0.55, "#334155");
  bodyGrad.addColorStop(1, "#1e293b");
  ctx.fillStyle = bodyGrad;
  ctx.fillRect(-w * 0.5, -h * 0.5, w, h);

  // border
  ctx.strokeStyle = "#0f172a";
  ctx.lineWidth = 2;
  ctx.strokeRect(-w * 0.5, -h * 0.5, w, h);

  // top shine
  ctx.fillStyle = "rgba(255,255,255,0.12)";
  ctx.fillRect(-w * 0.5 + 3, -h * 0.5 + 3, w - 6, 4);

  // screen bezel
  ctx.fillStyle = "#111827";
  ctx.fillRect(-16, -18, 32, 20);

  // glowing screen
  const screenGlow = ctx.createLinearGradient(0, -18, 0, 2);
  screenGlow.addColorStop(0, "#93c5fd");
  screenGlow.addColorStop(0.5, "#60a5fa");
  screenGlow.addColorStop(1, "#1d4ed8");
  ctx.fillStyle = screenGlow;
  ctx.fillRect(-13, -15, 26, 14);

  // little screen scan line
  ctx.fillStyle = "rgba(255,255,255,0.2)";
  ctx.fillRect(-11, -13, 22, 2);

  // side bolts
  ctx.fillStyle = "#94a3b8";
  ctx.fillRect(-21, -22, 3, 3);
  ctx.fillRect(18, -22, 3, 3);
  ctx.fillRect(-21, 19, 3, 3);
  ctx.fillRect(18, 19, 3, 3);

  // buttons
  ctx.fillStyle = "#1f2937";
  ctx.fillRect(-15, 8, 30, 10);

  ctx.fillStyle = "#22c55e";
  ctx.beginPath();
  ctx.arc(-8, 13, 2.5, 0, Math.PI * 2);
  ctx.fill();

  ctx.fillStyle = "#eab308";
  ctx.beginPath();
  ctx.arc(0, 13, 2.5, 0, Math.PI * 2);
  ctx.fill();

  ctx.fillStyle = "#ef4444";
  ctx.beginPath();
  ctx.arc(8, 13, 2.5, 0, Math.PI * 2);
  ctx.fill();

  // antenna / terminal vibe
  ctx.strokeStyle = "#94a3b8";
  ctx.lineWidth = 2;
  ctx.beginPath();
  ctx.moveTo(0, -h * 0.5);
  ctx.lineTo(0, -h * 0.5 - 12);
  ctx.stroke();

  ctx.fillStyle = "#e2e8f0";
  ctx.beginPath();
  ctx.arc(0, -h * 0.5 - 14, 3, 0, Math.PI * 2);
  ctx.fill();

  ctx.restore();
// label plate
ctx.fillStyle = "rgba(15,23,42,0.85)";
ctx.fillRect(x - 24, y + 34, 48, 16);

ctx.strokeStyle = "#94a3b8";
ctx.lineWidth = 1.5;
ctx.strokeRect(x - 24, y + 34, 48, 16);

ctx.fillStyle = "#e5e7eb";
ctx.font = "bold 11px sans-serif";
ctx.textAlign = "center";
ctx.textBaseline = "middle";
ctx.fillText("SHOP", x, y + 42);

ctx.textAlign = "start";
ctx.textBaseline = "alphabetic";
    };

const drawHUD = () => {
  const panelY = 14;
  const cardH = 104;
  const leftX = 16;
  const leftW = 220;

  const slotY = panelY;
  const slotW = 126;
  const slotH = 104;
  const slot1X = 252;
  const slot2X = 388;

  const rightX = 526;
  const rightW = 272;

  const roundRect = (x: number, y: number, w: number, h: number, r: number) => {
    ctx.beginPath();
    ctx.moveTo(x + r, y);
    ctx.arcTo(x + w, y, x + w, y + h, r);
    ctx.arcTo(x + w, y + h, x, y + h, r);
    ctx.arcTo(x, y + h, x, y, r);
    ctx.arcTo(x, y, x + w, y, r);
    ctx.closePath();
  };

  const fillRoundRect = (
    x: number,
    y: number,
    w: number,
    h: number,
    r: number,
    fill: string
  ) => {
    roundRect(x, y, w, h, r);
    ctx.fillStyle = fill;
    ctx.fill();
  };

  const strokeRoundRect = (
    x: number,
    y: number,
    w: number,
    h: number,
    r: number,
    stroke: string,
    lineWidth: number = 1
  ) => {
    roundRect(x, y, w, h, r);
    ctx.strokeStyle = stroke;
    ctx.lineWidth = lineWidth;
    ctx.stroke();
  };

  const drawCard = (
    x: number,
    y: number,
    w: number,
    h: number,
    accent: string
  ) => {
    ctx.save();

    ctx.shadowColor = "rgba(0,0,0,0.35)";
    ctx.shadowBlur = 16;
    ctx.shadowOffsetY = 6;
    fillRoundRect(x, y, w, h, 14, "rgba(7, 12, 20, 0.84)");

    ctx.shadowColor = "transparent";

    fillRoundRect(x + 2, y + 2, w - 4, h - 4, 12, "rgba(20, 28, 40, 0.92)");

    ctx.globalAlpha = 0.22;
    fillRoundRect(x + 2, y + 2, w - 4, 28, 12, "#ffffff");
    ctx.globalAlpha = 1;

    strokeRoundRect(x, y, w, h, 14, "rgba(255,255,255,0.08)", 2);

    ctx.fillStyle = accent;
    ctx.fillRect(x + 10, y + 10, 6, h - 20);

    ctx.restore();
  };

  const drawLabelValue = (
    label: string,
    value: string,
    x: number,
    y: number,
    valueColor: string = "#ffffff"
  ) => {
    ctx.font = "11px sans-serif";
    ctx.fillStyle = "#94a3b8";
    ctx.fillText(label, x, y);

    ctx.font = "bold 18px sans-serif";
    ctx.fillStyle = valueColor;
    ctx.fillText(value, x, y + 20);
  };

  // =========================================================
  // LEFT INFO CARD
  // =========================================================
  drawCard(leftX, panelY, leftW, cardH, "#ef4444");

  drawLabelValue("WAVE", `${wave}`, leftX + 26, panelY + 24, "#ffffff");
  drawLabelValue("CASH", `$${money}`, leftX + 26, panelY + 58, "#86efac");

  ctx.font = "11px sans-serif";
  ctx.fillStyle = "#94a3b8";
  ctx.fillText("STATUS", leftX + 126, panelY + 24);

  ctx.font = "bold 16px sans-serif";
  ctx.fillStyle = waveInProgress ? "#fca5a5" : "#fde68a";
  ctx.fillText(
    waveInProgress
      ? `${zombies.length + zombiesToSpawn} LEFT`
      : `NEXT ${Math.ceil(waveTimer)}`,
    leftX + 126,
    panelY + 44
  );

  ctx.font = "12px sans-serif";
  ctx.fillStyle = "#cbd5e1";
  ctx.fillText(
    waveInProgress ? "Wave active" : "Prepare defenses",
    leftX + 126,
    panelY + 68
  );

  // =========================================================
  // WEAPON SLOTS
  // =========================================================
  const drawWeaponSlot = (
    x: number,
    weaponKey: "pistol" | "ak",
    title: string,
    ammoText: string,
    unlocked: boolean,
    slotNumber: string
  ) => {
    const active = player.weapon === weaponKey;

    ctx.save();

    ctx.shadowColor = active ? "rgba(59,130,246,0.35)" : "rgba(0,0,0,0.28)";
    ctx.shadowBlur = active ? 18 : 10;
    ctx.shadowOffsetY = 5;

    fillRoundRect(
      x,
      slotY,
      slotW,
      slotH,
      16,
      active ? "rgba(18, 36, 64, 0.96)" : "rgba(10, 16, 25, 0.9)"
    );

    ctx.shadowColor = "transparent";

    fillRoundRect(
      x + 3,
      slotY + 3,
      slotW - 6,
      slotH - 6,
      13,
      active ? "rgba(28, 56, 96, 0.96)" : "rgba(24, 32, 45, 0.96)"
    );

    strokeRoundRect(
      x,
      slotY,
      slotW,
      slotH,
      16,
      active ? "#60a5fa" : "rgba(255,255,255,0.10)",
      active ? 3 : 2
    );

    // slot badge
    fillRoundRect(x + 10, slotY + 10, 24, 24, 8, active ? "#60a5fa" : "#334155");
    ctx.fillStyle = "#ffffff";
    ctx.font = "bold 13px sans-serif";
    ctx.fillText(slotNumber, x + 18, slotY + 27);

    // fake weapon icon
    ctx.fillStyle = unlocked ? "#e5e7eb" : "#64748b";
    if (weaponKey === "pistol") {
      ctx.fillRect(x + 18, slotY + 48, 30, 10);
      ctx.fillRect(x + 38, slotY + 56, 7, 10);
      ctx.fillRect(x + 45, slotY + 50, 10, 4);
    } else {
      ctx.fillRect(x + 18, slotY + 50, 42, 8);
      ctx.fillRect(x + 36, slotY + 58, 9, 10);
      ctx.fillRect(x + 59, slotY + 51, 12, 3);
      ctx.fillRect(x + 30, slotY + 46, 14, 3);
    }

    ctx.fillStyle = unlocked ? "#ffffff" : "#94a3b8";
    ctx.font = "bold 14px sans-serif";
    ctx.fillText(title, x + 18, slotY + 82);

    ctx.font = "12px sans-serif";
    ctx.fillStyle =
      unlocked
        ? weaponKey === "ak" && player.akAmmo <= 0
          ? "#fca5a5"
          : "#cbd5e1"
        : "#94a3b8";
    ctx.fillText(ammoText, x + 18, slotY + 97);

    if (!unlocked) {
      fillRoundRect(x + 3, slotY + 3, slotW - 6, slotH - 6, 13, "rgba(0,0,0,0.5)");
      ctx.fillStyle = "#e2e8f0";
      ctx.font = "bold 15px sans-serif";
      ctx.fillText("LOCKED", x + 30, slotY + 60);
    }

    ctx.restore();
  };

  drawWeaponSlot(slot1X, "pistol", "PISTOL", "∞ ammo", true, "1");
  drawWeaponSlot(
    slot2X,
    "ak",
    "AK-47",
    `${player.akAmmo} ammo`,
    player.akUnlocked,
    "2"
  );

  // =========================================================
  // RIGHT STATUS CARD
  // =========================================================
  drawCard(rightX, panelY, rightW, cardH, "#f59e0b");

  const hpRatio = clamp(player.hp / player.maxHp, 0, 1);
  const hpColor =
    hpRatio > 0.6 ? "#4ade80" : hpRatio > 0.3 ? "#facc15" : "#f87171";

  const wallNeed = getWallWoodRequirement();
  const wallFill = clamp(baseWoodProgress / wallNeed, 0, 1);

  ctx.font = "11px sans-serif";
  ctx.fillStyle = "#94a3b8";
  ctx.fillText("PLAYER", rightX + 18, panelY + 22);
  ctx.fillText("BASE", rightX + 18, panelY + 52);
  ctx.fillText("WALL UPGRADE", rightX + 18, panelY + 82);

  ctx.font = "bold 17px sans-serif";
  ctx.fillStyle = hpColor;
  ctx.fillText(`${Math.ceil(player.hp)}/${player.maxHp} HP`, rightX + 18, panelY + 40);

  ctx.fillStyle = "#ffffff";
  ctx.fillText(`LVL ${baseLevel}`, rightX + 18, panelY + 70);

  ctx.fillStyle = "#cbd5e1";
  ctx.font = "bold 13px sans-serif";
  ctx.fillText(`${baseWoodProgress}/${wallNeed} wood`, rightX + 140, panelY + 70);

  // HP bar
  fillRoundRect(rightX + 140, panelY + 18, 114, 12, 6, "rgba(255,255,255,0.12)");
  fillRoundRect(rightX + 140, panelY + 18, 114 * hpRatio, 12, 6, hpColor);
  strokeRoundRect(rightX + 140, panelY + 18, 114, 12, 6, "rgba(255,255,255,0.18)", 1.5);

  // Wall progress bar
  fillRoundRect(rightX + 18, panelY + 88, 236, 12, 6, "rgba(255,255,255,0.12)");
  fillRoundRect(rightX + 18, panelY + 88, 236 * wallFill, 12, 6, "#f59e0b");
  strokeRoundRect(rightX + 18, panelY + 88, 236, 12, 6, "rgba(255,255,255,0.18)", 1.5);
};


   const drawPrompt = () => {
  const world = getWorld();
  let prompt = "";
  let keyBadge = "";
  let accent = "#60a5fa";

  const machine = getNearbyMachine();
  const turret = getNearbyTurret();

  if (!gameStarted) {
    prompt = "START THE DEFENSE";
    keyBadge = "ENTER";
    accent = "#22c55e";
  } else if (gameOver) {
    prompt = "GAME OVER  —  RESTART RUN";
    keyBadge = "R";
    accent = "#ef4444";
  } else if (shopOpen) {
    prompt = "CLICK A CARD TO BUY  •  PRESS ESC TO CLOSE";
    keyBadge = "";
    accent = "#f59e0b";
  } else if (machine && machine.hasCrateReady && !player.carried) {
    prompt = `PICK UP ${machine.label.toUpperCase()} CRATE`;
    keyBadge = "E";
    accent = "#38bdf8";
  } else if (turret && player.carried?.kind === "turretAmmo") {
    prompt = "LOAD TURRET";
    keyBadge = "E";
    accent = "#a78bfa";
  } else if (
    player.carried?.kind === "wood" &&
    isPlayerAtBaseWoodDropoff()
  ) {
    prompt = "LOAD WOOD INTO WALL";
    keyBadge = "E";
    accent = "#f59e0b";
  } else if (
    dist(player.x, player.y, world.upgradeConsoleX, world.upgradeConsoleY) < 54
  ) {
    prompt = "OPEN SHOP";
    keyBadge = "E";
    accent = "#f59e0b";
  }

  if (!prompt) return;

  const { skyBottom } = getWorld();

  const roundRect = (
    x: number,
    y: number,
    w: number,
    h: number,
    r: number
  ) => {
    ctx.beginPath();
    ctx.moveTo(x + r, y);
    ctx.arcTo(x + w, y, x + w, y + h, r);
    ctx.arcTo(x + w, y + h, x, y + h, r);
    ctx.arcTo(x, y + h, x, y, r);
    ctx.arcTo(x, y, x + w, y, r);
    ctx.closePath();
  };

  const boxW = keyBadge ? 420 : 500;
  const boxH = 48;
  const boxX = cssW * 0.5 - boxW * 0.5;
  const boxY = skyBottom - 58;

  ctx.save();

  // shadow
  ctx.shadowColor = "rgba(0,0,0,0.35)";
  ctx.shadowBlur = 14;
  ctx.shadowOffsetY = 5;

  // outer card
  roundRect(boxX, boxY, boxW, boxH, 14);
  ctx.fillStyle = "rgba(8, 12, 18, 0.86)";
  ctx.fill();

  ctx.shadowColor = "transparent";

  // inner card
  roundRect(boxX + 2, boxY + 2, boxW - 4, boxH - 4, 12);
  ctx.fillStyle = "rgba(24, 32, 44, 0.94)";
  ctx.fill();

  // top sheen
  roundRect(boxX + 2, boxY + 2, boxW - 4, 16, 12);
  ctx.globalAlpha = 0.12;
  ctx.fillStyle = "#ffffff";
  ctx.fill();
  ctx.globalAlpha = 1;

  // accent strip
  ctx.fillStyle = accent;
  ctx.fillRect(boxX + 10, boxY + 9, 6, boxH - 18);

  let textStartX = boxX + 26;

  if (keyBadge) {
    const badgeW = Math.max(28, 14 + ctx.measureText(keyBadge).width);
    const badgeH = 24;
    const badgeX = boxX + 24;
    const badgeY = boxY + boxH * 0.5 - badgeH * 0.5;

    roundRect(badgeX, badgeY, badgeW, badgeH, 8);
    ctx.fillStyle = accent;
    ctx.fill();

    roundRect(badgeX, badgeY, badgeW, badgeH, 8);
    ctx.strokeStyle = "rgba(255,255,255,0.35)";
    ctx.lineWidth = 1.5;
    ctx.stroke();

    ctx.fillStyle = "#ffffff";
    ctx.font = "bold 12px sans-serif";
    ctx.textAlign = "center";
    ctx.textBaseline = "middle";
    ctx.fillText(keyBadge, badgeX + badgeW * 0.5, badgeY + badgeH * 0.5 + 0.5);

    textStartX = badgeX + badgeW + 16;
  }

  ctx.fillStyle = "#e5e7eb";
  ctx.font = "bold 14px sans-serif";
  ctx.textAlign = "left";
  ctx.textBaseline = "middle";
  ctx.fillText(prompt, textStartX, boxY + boxH * 0.5 + 1);

  // border
  roundRect(boxX, boxY, boxW, boxH, 14);
  ctx.strokeStyle = "rgba(255,255,255,0.10)";
  ctx.lineWidth = 2;
  ctx.stroke();

  ctx.restore();

  ctx.textAlign = "start";
  ctx.textBaseline = "alphabetic";
};

 const drawShopPanel = () => {
  if (!shopOpen) return;

  const items = [
    {
      label: "UNLOCK TURRET",
      sub: "Adds next wall turret",
      cost: (() => {
        const lockedIndex = turrets.findIndex((t) => !t.unlocked);
        return lockedIndex === -1 ? -1 : 100 + lockedIndex * 80;
      })(),
      color: "#64748b",
      icon: "T",
    },
    {
      label: player.akUnlocked ? "BUY AK AMMO" : "BUY AK47",
      sub: player.akUnlocked ? "+40 ammo" : "Unlock rifle",
      cost: player.akUnlocked ? 45 : 120,
      color: "#b91c1c",
      icon: "AK",
    },
    {
      label: "TURRET AMMO",
      sub: "Faster + bigger crates",
      cost: 90 * machines[0].level,
      color: "#334155",
      icon: "AM",
    },
    {
      label: "WOOD MACHINE",
      sub: "Faster + bigger crates",
      cost: 80 * machines[1].level,
      color: "#8b5a2b",
      icon: "WD",
    },
    {
      label: "TURRET POWER",
      sub: "Fire rate / range / ammo",
      cost: (() => {
        const target = turrets
          .filter((t) => t.unlocked)
          .sort((a, b) => a.level - b.level)[0];
        return target ? 70 * target.level : -1;
      })(),
      color: "#0f766e",
      icon: "UP",
    },
    {
      label: "WALL REPAIR",
      sub: "+60 wall hp now",
      cost: 35,
      color: "#a16207",
      icon: "WL",
    },
  ];

  const panelW = 560;
  const panelH = 392;
  const panelX = cssW * 0.5 - panelW * 0.5;
  const panelY = cssH * 0.5 - panelH * 0.5;

  const roundRect = (
    x: number,
    y: number,
    w: number,
    h: number,
    r: number
  ) => {
    ctx.beginPath();
    ctx.moveTo(x + r, y);
    ctx.arcTo(x + w, y, x + w, y + h, r);
    ctx.arcTo(x + w, y + h, x, y + h, r);
    ctx.arcTo(x, y + h, x, y, r);
    ctx.arcTo(x, y, x + w, y, r);
    ctx.closePath();
  };

  const fillRoundRect = (
    x: number,
    y: number,
    w: number,
    h: number,
    r: number,
    fill: string
  ) => {
    roundRect(x, y, w, h, r);
    ctx.fillStyle = fill;
    ctx.fill();
  };

  const strokeRoundRect = (
    x: number,
    y: number,
    w: number,
    h: number,
    r: number,
    stroke: string,
    lineWidth: number = 1
  ) => {
    roundRect(x, y, w, h, r);
    ctx.strokeStyle = stroke;
    ctx.lineWidth = lineWidth;
    ctx.stroke();
  };

  const drawPricePill = (
    x: number,
    y: number,
    text: string,
    fill: string
  ) => {
    ctx.font = "bold 13px sans-serif";
    const w = Math.ceil(ctx.measureText(text).width) + 18;
    const h = 24;

    fillRoundRect(x, y, w, h, 10, fill);
    strokeRoundRect(x, y, w, h, 10, "rgba(255,255,255,0.16)", 1.5);

    ctx.fillStyle = "#ffffff";
    ctx.textAlign = "center";
    ctx.textBaseline = "middle";
    ctx.fillText(text, x + w * 0.5, y + h * 0.5 + 0.5);
    ctx.textAlign = "start";
    ctx.textBaseline = "alphabetic";
  };

  // =========================================================
  // SCREEN OVERLAY
  // =========================================================
  ctx.save();

  ctx.fillStyle = "rgba(0, 0, 0, 0.56)";
  ctx.fillRect(0, 0, cssW, cssH);

  // panel shadow
  ctx.shadowColor = "rgba(0,0,0,0.42)";
  ctx.shadowBlur = 22;
  ctx.shadowOffsetY = 10;

  fillRoundRect(panelX, panelY, panelW, panelH, 20, "rgba(7, 12, 20, 0.95)");

  ctx.shadowColor = "transparent";

  fillRoundRect(
    panelX + 3,
    panelY + 3,
    panelW - 6,
    panelH - 6,
    17,
    "rgba(20, 28, 40, 0.98)"
  );

  ctx.globalAlpha = 0.14;
  fillRoundRect(panelX + 3, panelY + 3, panelW - 6, 42, 17, "#ffffff");
  ctx.globalAlpha = 1;

  strokeRoundRect(panelX, panelY, panelW, panelH, 20, "rgba(255,255,255,0.10)", 2.5);

  // accent strip
  ctx.fillStyle = "#f59e0b";
  ctx.fillRect(panelX + 14, panelY + 14, 8, 40);

  // =========================================================
  // HEADER
  // =========================================================
  ctx.fillStyle = "#ffffff";
  ctx.font = "bold 26px sans-serif";
  ctx.fillText("SHOP", panelX + 32, panelY + 34);

  ctx.fillStyle = "#94a3b8";
  ctx.font = "12px sans-serif";
  ctx.fillText("Click a card to buy upgrades", panelX + 32, panelY + 54);

  drawPricePill(panelX + panelW - 160, panelY + 18, `$${money}`, "#166534");

  // close button
  const closeX = panelX + panelW - 46;
  const closeY = panelY + 14;
  const closeSize = 28;

  const closeHovered = rectContains(mouse.x, mouse.y, closeX, closeY, closeSize, closeSize);

  fillRoundRect(
    closeX,
    closeY,
    closeSize,
    closeSize,
    8,
    closeHovered ? "#b91c1c" : "#7f1d1d"
  );
  strokeRoundRect(closeX, closeY, closeSize, closeSize, 8, "rgba(255,255,255,0.22)", 1.5);

  ctx.fillStyle = "#ffffff";
  ctx.font = "bold 16px sans-serif";
  ctx.textAlign = "center";
  ctx.textBaseline = "middle";
  ctx.fillText("×", closeX + closeSize * 0.5, closeY + closeSize * 0.5 + 0.5);
  ctx.textAlign = "start";
  ctx.textBaseline = "alphabetic";

  // helper text
  ctx.fillStyle = "#64748b";
  ctx.font = "12px sans-serif";
  ctx.fillText("Mouse wheel to scroll", panelX + 32, panelY + panelH - 14);

  const contentX = panelX + 24;
  const contentY = panelY + 74;
  const contentW = panelW - 48;
  const contentH = panelH - 104;

  const cols = 2;
  const tileW = 244;
  const tileH = 98;
  const gap = 14;

  const rows = Math.ceil(items.length / cols);
  const totalHeight = rows * tileH + (rows - 1) * gap;
  const maxScroll = Math.max(0, totalHeight - contentH);

  shopScroll = clamp(shopScroll, 0, maxScroll);

  // content frame
  fillRoundRect(contentX - 6, contentY - 6, contentW + 12, contentH + 12, 16, "rgba(255,255,255,0.035)");
  strokeRoundRect(contentX - 6, contentY - 6, contentW + 12, contentH + 12, 16, "rgba(255,255,255,0.07)", 1.5);

  ctx.save();
  ctx.beginPath();
  roundRect(contentX, contentY, contentW, contentH, 14);
  ctx.clip();

  for (let i = 0; i < items.length; i++) {
    const item = items[i];
    const col = i % cols;
    const row = Math.floor(i / cols);

    const x = contentX + col * (tileW + gap);
    const y = contentY + row * (tileH + gap) - shopScroll;
    const hovered = rectContains(mouse.x, mouse.y, x, y, tileW, tileH);
    const canBuy = item.cost >= 0 && money >= item.cost;

    // base card
    ctx.save();
    ctx.shadowColor = hovered ? "rgba(255,255,255,0.08)" : "rgba(0,0,0,0.18)";
    ctx.shadowBlur = hovered ? 14 : 8;
    ctx.shadowOffsetY = 4;

    fillRoundRect(
      x,
      y,
      tileW,
      tileH,
      16,
      hovered ? "rgba(34, 46, 64, 0.98)" : "rgba(18, 26, 38, 0.96)"
    );

    ctx.shadowColor = "transparent";

    fillRoundRect(
      x + 2,
      y + 2,
      tileW - 4,
      tileH - 4,
      13,
      hovered ? "rgba(30, 42, 58, 0.98)" : "rgba(24, 32, 45, 0.98)"
    );

    strokeRoundRect(
      x,
      y,
      tileW,
      tileH,
      16,
      item.cost < 0
        ? "rgba(148,163,184,0.28)"
        : canBuy
        ? "rgba(251,191,36,0.75)"
        : hovered
        ? "rgba(255,255,255,0.18)"
        : "rgba(255,255,255,0.10)",
      canBuy ? 2.5 : 2
    );

    // icon block
    fillRoundRect(x + 12, y + 14, 64, 64, 14, item.color);
    strokeRoundRect(x + 12, y + 14, 64, 64, 14, "rgba(0,0,0,0.28)", 2);

    ctx.fillStyle = "#ffffff";
    ctx.font = "bold 20px sans-serif";
    ctx.textAlign = "center";
    ctx.textBaseline = "middle";
    ctx.fillText(item.icon, x + 44, y + 47);

    ctx.textAlign = "start";
    ctx.textBaseline = "alphabetic";

    // label
    ctx.fillStyle = "#ffffff";
    ctx.font = "bold 15px sans-serif";
    ctx.fillText(item.label, x + 88, y + 28);

    ctx.fillStyle = "#cbd5e1";
    ctx.font = "12px sans-serif";
    ctx.fillText(item.sub, x + 88, y + 48);

    // status / price
    const priceText = item.cost < 0 ? "MAX" : `$${item.cost}`;
    const priceFill =
      item.cost < 0
        ? "#475569"
        : canBuy
        ? "#a16207"
        : "#7f1d1d";

    drawPricePill(x + 88, y + 60, priceText, priceFill);

    // buy hint
    ctx.fillStyle =
      item.cost < 0
        ? "#94a3b8"
        : canBuy
        ? "#86efac"
        : "#fca5a5";
    ctx.font = "11px sans-serif";
    ctx.fillText(
      item.cost < 0 ? "Fully upgraded" : canBuy ? "Click to buy" : "Not enough cash",
      x + 160,
      y + 76
    );

    ctx.restore();
  }

  ctx.restore();

  // =========================================================
  // SCROLL BAR
  // =========================================================
  if (maxScroll > 0) {
    const barX = panelX + panelW - 14;
    const trackY = contentY + 2;
    const trackH = contentH - 4;
    const thumbH = Math.max(42, (contentH / totalHeight) * trackH);
    const thumbY = trackY + (shopScroll / maxScroll) * (trackH - thumbH);

    fillRoundRect(barX, trackY, 6, trackH, 4, "rgba(255,255,255,0.10)");
    fillRoundRect(barX, thumbY, 6, thumbH, 4, "#93c5fd");
  }

  ctx.restore();
};
  const drawStartScreen = () => {
  const roundRect = (
    x: number,
    y: number,
    w: number,
    h: number,
    r: number
  ) => {
    ctx.beginPath();
    ctx.moveTo(x + r, y);
    ctx.arcTo(x + w, y, x + w, y + h, r);
    ctx.arcTo(x + w, y + h, x, y + h, r);
    ctx.arcTo(x, y + h, x, y, r);
    ctx.arcTo(x, y, x + w, y, r);
    ctx.closePath();
  };

  const fillRoundRect = (
    x: number,
    y: number,
    w: number,
    h: number,
    r: number,
    fill: string
  ) => {
    roundRect(x, y, w, h, r);
    ctx.fillStyle = fill;
    ctx.fill();
  };

  const strokeRoundRect = (
    x: number,
    y: number,
    w: number,
    h: number,
    r: number,
    stroke: string,
    lineWidth: number = 1
  ) => {
    roundRect(x, y, w, h, r);
    ctx.strokeStyle = stroke;
    ctx.lineWidth = lineWidth;
    ctx.stroke();
  };

  const centerX = cssW * 0.5;
  const titleCardW = 700;
  const titleCardH = 220;
  const titleCardX = centerX - titleCardW * 0.5;
  const titleCardY = cssH * 0.22;

  const pulse = 0.5 + 0.5 * Math.sin(performance.now() * 0.0045);

  // =========================================================
  // SCREEN DARKEN
  // =========================================================
  ctx.fillStyle = "rgba(0,0,0,0.52)";
  ctx.fillRect(0, 0, cssW, cssH);

  ctx.save();

  // =========================================================
  // TITLE CARD SHADOW
  // =========================================================
  ctx.shadowColor = "rgba(0,0,0,0.45)";
  ctx.shadowBlur = 28;
  ctx.shadowOffsetY = 12;

  fillRoundRect(
    titleCardX,
    titleCardY,
    titleCardW,
    titleCardH,
    26,
    "rgba(8, 12, 18, 0.94)"
  );

  ctx.shadowColor = "transparent";

  fillRoundRect(
    titleCardX + 3,
    titleCardY + 3,
    titleCardW - 6,
    titleCardH - 6,
    22,
    "rgba(20, 28, 40, 0.98)"
  );

  ctx.globalAlpha = 0.12;
  fillRoundRect(
    titleCardX + 3,
    titleCardY + 3,
    titleCardW - 6,
    44,
    22,
    "#ffffff"
  );
  ctx.globalAlpha = 1;

  strokeRoundRect(
    titleCardX,
    titleCardY,
    titleCardW,
    titleCardH,
    26,
    "rgba(255,255,255,0.10)",
    2.5
  );

  // left accent
  ctx.fillStyle = "#b91c1c";
  ctx.fillRect(titleCardX + 18, titleCardY + 18, 10, titleCardH - 36);

  // =========================================================
  // TITLE
  // =========================================================
  ctx.textAlign = "center";

  ctx.fillStyle = "#ffffff";
  ctx.font = "bold 48px sans-serif";
  ctx.fillText("ZOM-ZOM", centerX, titleCardY + 72);

  ctx.fillStyle = "#fca5a5";
  ctx.font = "bold 34px sans-serif";
  ctx.fillText("BASE DEFENSE", centerX, titleCardY + 116);

  ctx.fillStyle = "#cbd5e1";
  ctx.font = "18px sans-serif";
  ctx.fillText(
    "Carry crates. Feed turrets. Upgrade the wall. Survive forever.",
    centerX,
    titleCardY + 156
  );

  // =========================================================
  // START BUTTON
  // =========================================================
  const buttonW = 290;
  const buttonH = 58;
  const buttonX = centerX - buttonW * 0.5;
  const buttonY = titleCardY + titleCardH + 26;

  ctx.shadowColor = `rgba(239,68,68,${0.18 + pulse * 0.18})`;
  ctx.shadowBlur = 18 + pulse * 10;
  ctx.shadowOffsetY = 0;

  fillRoundRect(buttonX, buttonY, buttonW, buttonH, 18, "rgba(127, 29, 29, 0.96)");

  ctx.shadowColor = "transparent";

  fillRoundRect(
    buttonX + 3,
    buttonY + 3,
    buttonW - 6,
    buttonH - 6,
    14,
    "rgba(185, 28, 28, 0.96)"
  );

  strokeRoundRect(
    buttonX,
    buttonY,
    buttonW,
    buttonH,
    18,
    "rgba(255,255,255,0.18)",
    2
  );

  ctx.fillStyle = "#ffffff";
  ctx.font = "bold 22px sans-serif";
  ctx.fillText("PRESS ENTER TO BEGIN", centerX, buttonY + 37);

  // =========================================================
  // CONTROLS STRIP
  // =========================================================
  const stripW = 620;
  const stripH = 44;
  const stripX = centerX - stripW * 0.5;
  const stripY = buttonY + 78;

  fillRoundRect(stripX, stripY, stripW, stripH, 14, "rgba(10, 16, 25, 0.84)");
  strokeRoundRect(stripX, stripY, stripW, stripH, 14, "rgba(255,255,255,0.08)", 1.5);

  ctx.fillStyle = "#94a3b8";
  ctx.font = "14px sans-serif";
  ctx.fillText(
    "MOVE  WASD   •   INTERACT  E   •   SHOOT  CLICK   •   WEAPONS  1 / 2",
    centerX,
    stripY + 28
  );

  // =========================================================
  // TIP CARDS
  // =========================================================
  const tipY = stripY + 72;
  const tipW = 220;
  const tipH = 76;
  const gap = 18;
  const totalW = tipW * 3 + gap * 2;
  const startX = centerX - totalW * 0.5;

  const drawTipCard = (
    x: number,
    title: string,
    body: string,
    accent: string
  ) => {
    fillRoundRect(x, tipY, tipW, tipH, 16, "rgba(12, 18, 28, 0.86)");
    fillRoundRect(x + 3, tipY + 3, tipW - 6, tipH - 6, 13, "rgba(24, 32, 45, 0.96)");
    strokeRoundRect(x, tipY, tipW, tipH, 16, "rgba(255,255,255,0.08)", 1.5);

    ctx.fillStyle = accent;
    ctx.fillRect(x + 12, tipY + 12, 6, tipH - 24);

    ctx.textAlign = "left";
    ctx.fillStyle = "#ffffff";
    ctx.font = "bold 13px sans-serif";
    ctx.fillText(title, x + 28, tipY + 28);

    ctx.fillStyle = "#cbd5e1";
    ctx.font = "12px sans-serif";
    ctx.fillText(body, x + 28, tipY + 50);
  };

  drawTipCard(startX, "CRATES", "Carry resources where they matter.", "#38bdf8");
  drawTipCard(startX + tipW + gap, "TURRETS", "Keep them loaded or the wall falls.", "#a78bfa");
  drawTipCard(startX + (tipW + gap) * 2, "WALL", "Upgrade and repair to survive longer.", "#f59e0b");

  ctx.restore();
  ctx.textAlign = "start";
};

const drawCrosshair = () => {
  if (shopOpen) return;

  const x = mouse.x;
  const y = mouse.y;

  ctx.save();

  // outer soft ring
  ctx.strokeStyle = "rgba(255,255,255,0.18)";
  ctx.lineWidth = 2;
  ctx.beginPath();
  ctx.arc(x, y, 16, 0, Math.PI * 2);
  ctx.stroke();

  // main crosshair
  ctx.strokeStyle = "#f8fafc";
  ctx.lineWidth = 2;
  ctx.beginPath();
  ctx.moveTo(x - 12, y);
  ctx.lineTo(x - 4, y);
  ctx.moveTo(x + 4, y);
  ctx.lineTo(x + 12, y);
  ctx.moveTo(x, y - 12);
  ctx.lineTo(x, y - 4);
  ctx.moveTo(x, y + 4);
  ctx.lineTo(x, y + 12);
  ctx.stroke();

  // center dot
  ctx.fillStyle = "#ef4444";
  ctx.beginPath();
  ctx.arc(x, y, 2.5, 0, Math.PI * 2);
  ctx.fill();

  ctx.restore();
};




   const drawGameOver = () => {
  // dark overlay
  ctx.fillStyle = "rgba(0,0,0,0.65)";
  ctx.fillRect(0, 0, cssW, cssH);

  // vignette
  const vignette = ctx.createRadialGradient(
    cssW * 0.5,
    cssH * 0.45,
    40,
    cssW * 0.5,
    cssH * 0.45,
    cssW * 0.7
  );
  vignette.addColorStop(0, "rgba(0,0,0,0)");
  vignette.addColorStop(1, "rgba(0,0,0,0.75)");
  ctx.fillStyle = vignette;
  ctx.fillRect(0, 0, cssW, cssH);

  // =====================================================
  // CARD
  // =====================================================
  const cardW = 360;
  const cardH = 200;
  const cardX = cssW * 0.5 - cardW / 2;
  const cardY = cssH * 0.45 - cardH / 2;

  // card background
  ctx.fillStyle = "#111827";
  ctx.fillRect(cardX, cardY, cardW, cardH);

  // border
  ctx.strokeStyle = "#e5e7eb";
  ctx.lineWidth = 2;
  ctx.strokeRect(cardX, cardY, cardW, cardH);

  // top red stripe
  ctx.fillStyle = "#7f1d1d";
  ctx.fillRect(cardX, cardY, cardW, 28);

  // =====================================================
  // TEXT
  // =====================================================
  ctx.textAlign = "center";

ctx.fillText(
  baseHp <= 0 ? "THE WALL FELL" : "YOU DIED",
  cssW * 0.5,
  cssH * 0.35
);

  ctx.font = "18px sans-serif";
  ctx.fillStyle = "#d1d5db";
  ctx.fillText(`Wave reached: ${wave}`, cssW * 0.5, cardY + 90);

  // restart button
  const btnW = 180;
  const btnH = 36;
  const btnX = cssW * 0.5 - btnW / 2;
  const btnY = cardY + 120;

  ctx.fillStyle = "#374151";
  ctx.fillRect(btnX, btnY, btnW, btnH);

  ctx.strokeStyle = "#9ca3af";
  ctx.strokeRect(btnX, btnY, btnW, btnH);

  ctx.fillStyle = "#f9fafb";
  ctx.font = "bold 16px sans-serif";
  ctx.fillText("PRESS R TO RESTART", cssW * 0.5, btnY + 23);

  ctx.textAlign = "start";
};
    // =========================================================
    // RENDER
    // =========================================================

const render = () => {
  ctx.clearRect(0, 0, cssW, cssH);

  ctx.globalAlpha = 1;
  ctx.textAlign = "start";
  ctx.textBaseline = "alphabetic";
  ctx.lineWidth = 1;

  drawSky();
  drawGround();
  drawBase();
  drawMachines();
  drawConsole();
  drawTurrets();
  drawMoneyDrops();
  drawZombies();
  drawBullets();
  drawImpactParticles();
  drawPlayer();
  drawHUD();
  drawPrompt();
  drawShopPanel();

  if (!gameStarted) drawStartScreen();
  if (gameOver) drawGameOver();

  drawCrosshair();

  // IMPORTANT: click should only exist for one frame
  mouse.clicked = false;
};

    // =========================================================
    // LOOP
    // =========================================================
const loop = (now: number) => {
  const dt = Math.min(0.033, (now - lastTime) / 1000 || 0.016);
  lastTime = now;
 skyTime += dt;
  updateGame(dt);
  render();

  animationFrameId = requestAnimationFrame(loop);
};

    resizeCanvas();
    resetGame();

    window.addEventListener("wheel", onWheel, { passive: false });
    window.addEventListener("resize", resizeCanvas);
    window.addEventListener("keydown", onKeyDown, { passive: false });
    window.addEventListener("keyup", onKeyUp);
    window.addEventListener("mousemove", onMouseMove);
    window.addEventListener("mousedown", onMouseDown);
    window.addEventListener("mouseup", onMouseUp);

    animationFrameId = requestAnimationFrame(loop);

    return () => {
      cancelAnimationFrame(animationFrameId);
      window.removeEventListener("resize", resizeCanvas);
      window.removeEventListener("keydown", onKeyDown);
      window.removeEventListener("keyup", onKeyUp);
      window.removeEventListener("mousemove", onMouseMove);
      window.removeEventListener("mousedown", onMouseDown);
      window.removeEventListener("mouseup", onMouseUp);
      window.removeEventListener("wheel", onWheel);
    };
  }, []);

return (
  <canvas
    ref={canvasRef}
    className="w-full h-full block bg-black cursor-none"
  />
);
}