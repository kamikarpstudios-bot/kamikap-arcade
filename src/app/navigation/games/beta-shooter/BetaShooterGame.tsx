"use client";

import { useEffect, useRef } from "react";

export default function CinematicBulletFlip() {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    let animationFrameId = 0;
    let lastNow = performance.now();

 const COLORS = {
  // SKY
  skyTop: "#140a2a",
  skyMid: "#5a2a8a",
  skyBottom: "#ff7a59",

  // SUN
  sunCore: "#fff3a6",
  sunOuter: "#ff9d6e",
  sunStripe: "#ff66c4",
  sunGlow: "rgba(255, 210, 120, 0.30)",

  // SKYLINE (optional if you still use)
  skylineFar: "#3b1d5a",
  skylineNear: "#5b2f7a",

  // OLD ROOM STUFF (safe to keep unused)
  roomDark: "#140a28",
  roomMid: "#24113f",
  roomLine: "#10081f",

  windowFrame: "#51306e",
  windowGlass: "rgba(255,255,255,0.08)",
  windowGlassSoft: "rgba(255,255,255,0.04)",

  // LANES (slightly cooled to match cyan glow)
  laneMain: "#ffb3c7",
  laneAlt: "#ffc7d6",
  laneSide: "#b86b95",
  laneOutline: "#4c2a66",
  laneAccent: "#7df9ff",
  laneGlow: "rgba(125,249,255,0.18)",

  // BUILDINGS (cyan edges now instead of pink)
  buildingFaceA: "#5f2f8c",
  buildingFaceB: "#3f1f63",
  buildingRoof: "#9a4fd1",
  buildingEdge: "#7df9ff",

  // PARTICLES
  shardDark: "#6a3f9a",
  shardAccent: "#ffd166",

  // PLAYER
  bodyDark: "#1a1333",
  bodyLight: "#ff9db8",
  bodyAccent: "#ffd166",

  // BULLETS
  bulletDark: "#1a1333",
  bulletLight: "#ffe08a",
  bulletAccent: "#ff7adf",

  // HUD
  hudTitle: "#fff1d6",
  hudText: "#ffd6e7",
  hudAccent: "#7df9ff",

  // FX
  slowmoTint: "rgba(160, 110, 255, 0.08)",
  slowmoGlow: "rgba(255, 215, 100, 0.16)",

  deathAccent: "#ff6b8f",

  // GLOBAL NEON (IMPORTANT)
  gridLine: "rgba(90,190,255,0.32)",
  gridGlow: "rgba(120,235,255,0.78)",
};

    // =========================
    // GAME STATE
    // =========================
    let worldZ = 0;
    let playerX = 0;
    let playerXVel = 0;
    const speed = 4.5;

    let jumpStartTime = 0;

    const BASE_HEIGHT = 900;
    let camY = BASE_HEIGHT;

    let jumpVal = 0;
    let jumpVel = 0;
    let jumpCount = 0;

    let isSlowMo = false;
    let isDead = false;
    let fallY = 0;

    // =========================
    // FLIP STATE — BOOSTED JUMP
    // =========================
    let flipActive = false;
    let flipVisualRotation = 0;
    let flipTimer = 0;
    let flipDuration = 0;

    // Increased velocities for higher leaps
    const FIRST_JUMP_VEL = 3000;  // Was 2100
    const SECOND_JUMP_VEL = 3500; // Was 1950
    const THIRD_JUMP_VEL = 4000;  // Was 2600 (The Big Flip)

    // Gravity stays high to keep the "heavy armor" feel
    const NORMAL_GRAV = 5400;
    const FLIP_GRAV = 4200;

    //-------//

     type EnemyBullet = {
      x: number;
      y: number;
      z: number;
      vx: number;
      vy: number;
      vz: number;
      r: number;
      life: number;
      closePassed?: boolean;
      targetX: number;
      targetY: number;
      targetZ: number;
    };

    type DodgeDir = "left" | "right" | "up" | "down" | null;

let dodgeActive = false;
let dodgeDir: DodgeDir = null;
let dodgeTimer = 0;
let dodgeDuration = 0.18;
let dodgeOffsetX = 0;
let dodgeOffsetY = 0;
let dodgeCooldown = 0;

let dashVX = 0;
let dashVY = 0;

    let bulletTimeTimer = 0;

    let enemySpawnTimer = 0;
    const enemyBullets: EnemyBullet[] = [];

    // =========================
    // WORLD
    // =========================
  const SEG_LEN = 6000;
const SOLID_LEN = 5500;

// one big playable road
const ROAD_HALF = 5400;

// road is split into big sections across the width
const ROAD_TILE_COUNT = 5;
const ROAD_TILE_GAP = 120;

const STREET_HALF = ROAD_HALF + 1800;

    const resetShard = (s: {
  x: number;
  y: number;
  z: number;
  w: number;
  h: number;
  speedMul: number;
  tilt: number;
  side: -1 | 1;
}) => {
  const side: -1 | 1 = Math.random() < 0.5 ? -1 : 1;

  const minX = STREET_HALF + 500;
  const maxX = STREET_HALF + 2600;

  s.side = side;
  s.x = side * (minX + Math.random() * (maxX - minX));
  s.y = 180 + Math.random() * 2400;
  s.z = Math.random() * 32000;
  s.w = Math.random() * 10 + 3;
  s.h = Math.random() * 34 + 12;
  s.speedMul = 0.55 + Math.random() * 1.15;
  s.tilt = (Math.random() - 0.5) * 1.1;
};
    const keys = {
      a: false,
      d: false,
      w: false,
      s: false,
      shift: false,
    };

    // =========================
    // FX
    // =========================
   const shards = Array.from({ length: 90 }, () => {
  const shard = {
    x: 0,
    y: 0,
    z: 0,
    w: 0,
    h: 0,
    speedMul: 0,
    tilt: 0,
    side: 1 as -1 | 1,
  };
  resetShard(shard);
  return shard;
});

    const clamp = (v: number, min: number, max: number) =>
      Math.max(min, Math.min(max, v));

    const lerp = (a: number, b: number, t: number) => a + (b - a) * t;

    const easeInOutCubic = (t: number) =>
      t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2;
    const easeOutCubic = (t: number) => 1 - Math.pow(1 - t, 3);

    const triggerDodge = () => {
  if (isDead) return;
  if (dodgeActive || dodgeCooldown > 0) return;

  let dir: DodgeDir = null;

  if (keys.a) dir = "left";
  else if (keys.d) dir = "right";
  else if (keys.w) dir = "up";
  else if (keys.s) dir = "down";
  else dir = "right";

  dodgeActive = true;
  dodgeDir = dir;
  dodgeTimer = 0;
  dodgeCooldown = 0.22;

  bulletTimeTimer = Math.max(bulletTimeTimer, 2.5);

  dashVX = 0;
  dashVY = 0;

  if (dir === "left") {
    dashVX = -10200;
    playerXVel = Math.min(playerXVel, -900);
  }
  if (dir === "right") {
    dashVX = 10200;
    playerXVel = Math.max(playerXVel, 900);
  }
  if (dir === "up") {
    dashVY = -3200;
  }
  if (dir === "down") {
    dashVY = 2200;
  }
};

        const spawnEnemyBullet = () => {
const spawnX = (Math.random() - 0.5) * (ROAD_HALF * 1.7);
      const spawnY = 700 + Math.random() * 1500;
      const spawnZ = 22000 + Math.random() * 6000;

      // snapshot where the player is RIGHT NOW
      const targetX = playerX + dodgeOffsetX;
      const targetY = BASE_HEIGHT + jumpVal - dodgeOffsetY + 180;
      const targetZ = 0;

      const dx = targetX - spawnX;
      const dy = targetY - spawnY;
      const dz = targetZ - spawnZ;

      const len = Math.max(1, Math.hypot(dx, dy, dz));
      const speed3d = 16500 + Math.random() * 2500;

      enemyBullets.push({
        x: spawnX,
        y: spawnY,
        z: spawnZ,
        vx: (dx / len) * speed3d,
        vy: (dy / len) * speed3d,
        vz: (dz / len) * speed3d,
        r: 95 + Math.random() * 28,
        life: 2.2,
        closePassed: false,
        targetX,
        targetY,
        targetZ,
      });
    };
    // =========================
    // INPUT
    // =========================
    const handleJump = () => {
  if (isDead) {
    reset();
    return;
  }

  if (jumpCount < 3) {
    jumpCount++;
    jumpStartTime = performance.now(); // <--- Add this line here

    if (jumpCount === 1) jumpVel = FIRST_JUMP_VEL;
    if (jumpCount === 2) jumpVel = SECOND_JUMP_VEL;

    if (jumpCount === 3) {
      jumpVel = THIRD_JUMP_VEL;
      isSlowMo = true;
      flipActive = true;
      flipTimer = 0;
      flipDuration = (THIRD_JUMP_VEL * 2) / FLIP_GRAV;
    }
  }
};

        const onKeyDown = (e: KeyboardEvent) => {
      const k = e.key.toLowerCase();

      if (k === "a") keys.a = true;
      if (k === "d") keys.d = true;
      if (k === "w") keys.w = true;
      if (k === "s") keys.s = true;
      if (k === "shift") {
        keys.shift = true;
        e.preventDefault();
        triggerDodge();
      }

      if (e.code === "Space") {
        e.preventDefault();
        handleJump();
      }
    };

    const onKeyUp = (e: KeyboardEvent) => {
      const k = e.key.toLowerCase();

      if (k === "a") keys.a = false;
      if (k === "d") keys.d = false;
      if (k === "w") keys.w = false;
      if (k === "s") keys.s = false;
      if (k === "shift") keys.shift = false;
    };

    window.addEventListener("keydown", onKeyDown);
    window.addEventListener("keyup", onKeyUp);

    // =========================
    // RESET
    // =========================
   const reset = () => {
  worldZ = 0;
  playerX = 0;
  playerXVel = 0;
  isDead = false;
  fallY = 0;
  jumpVal = 0;
  jumpVel = 0;
  jumpCount = 0;
  isSlowMo = false;
  flipActive = false;
  flipVisualRotation = 0;
  flipTimer = 0;
  flipDuration = 0;
  dodgeActive = false;
  dodgeDir = null;
  dodgeTimer = 0;
  dodgeOffsetX = 0;
  dodgeOffsetY = 0;
  dodgeCooldown = 0;
  dashVX = 0;
  dashVY = 0;
  bulletTimeTimer = 0;
  enemySpawnTimer = 0;
  enemyBullets.length = 0;
};

    // =========================
    // PROJECTION
    // =========================
  const project = (
  lx: number,
  ly: number,
  lz: number,
  w: number,
  h: number,
  horY: number,
  applyFlip = true
) => {
  let x = lx;
  let y = ly - camY;
  let z = lz + 4200;

  if (applyFlip && flipActive) {
    const pivotY = 3000;
    const pivotZ = 1500;

    y -= pivotY;
    z -= pivotZ;

    const cosR = Math.cos(flipVisualRotation);
    const sinR = Math.sin(flipVisualRotation);

    const newY = y * cosR - z * sinR;
    const newZ = y * sinR + z * cosR;

    y = newY + pivotY;
    z = newZ + pivotZ;
  }

  if (z < 100) return null;

  const scale = 1100 / z;
  return {
    x: w * 0.5 + x * scale,
    y: horY - y * scale,
    s: scale,
    z,
  };
};
    // =========================
    // UPDATE
    // =========================
    const update = (rawDt: number) => {
      if (isDead) return;

      const bulletTimeActive = isSlowMo || bulletTimeTimer > 0;
      const dt = rawDt * (bulletTimeActive ? 0.32 : 1.0);

      if (dodgeCooldown > 0) dodgeCooldown -= rawDt;
      if (bulletTimeTimer > 0) bulletTimeTimer -= rawDt;
//----movement---//
      worldZ += speed * 2200 * rawDt;

   const moveInput = (keys.d ? 1 : 0) - (keys.a ? 1 : 0);
const grounded = jumpVal < 8 && !flipActive && fallY <= 0;

const groundAccel = 24000;
const airAccel = 15000;

const groundDrag = 10.5;
const airDrag = 8;

const maxGroundSpeed = 1850;
const maxAirSpeed = 1350;

playerXVel += moveInput * (grounded ? groundAccel : airAccel) * dt;
playerXVel *= Math.max(0, 1 - dt * (grounded ? groundDrag : airDrag));
playerXVel = clamp(
  playerXVel,
  grounded ? -maxGroundSpeed : -maxAirSpeed,
  grounded ? maxGroundSpeed : maxAirSpeed
);

playerX += playerXVel * dt;

//-----dodge---//
      if (dodgeActive) {
  dodgeTimer += rawDt;
  const t = clamp(dodgeTimer / dodgeDuration, 0, 1);
  const shaped = Math.sin(t * Math.PI);

  // visual offset still exists for punch / smear
dodgeOffsetX = dashVX * 0.07 * shaped;
dodgeOffsetY = dashVY * 0.05 * shaped;

  // actual movement in world space
  playerX += dashVX * rawDt;

  if (dodgeDir === "up" || dodgeDir === "down") {
    fallY -= dashVY * rawDt * 0.35;
    fallY = Math.max(0, fallY);
  }

  // dash loses power quickly so it feels explosive
  dashVX *= Math.max(0, 1 - rawDt * 13);
  dashVY *= Math.max(0, 1 - rawDt * 13);

  if (t >= 1) {
    dodgeActive = false;
    dodgeDir = null;
    dodgeOffsetX = 0;
    dodgeOffsetY = 0;
    dashVX = 0;
    dashVY = 0;
  }
}
// combined position used for gameplay
const playerWorldX = playerX + dodgeOffsetX;
      //-------------//

      if (jumpCount > 0 || jumpVal > 0) {
        jumpVal += jumpVel * dt;
        jumpVel -= (flipActive ? FLIP_GRAV : NORMAL_GRAV) * dt;

        if (flipActive) {
          flipTimer += dt;
          const t = clamp(flipTimer / flipDuration, 0, 1);
          flipVisualRotation = easeInOutCubic(t) * Math.PI * 2;
        }

        if (jumpVal <= 0) {
          jumpVal = 0;
          jumpCount = 0;
          isSlowMo = false;
          flipActive = false;
          flipVisualRotation = 0;
        }
      }

      camY = BASE_HEIGHT + jumpVal - fallY;

    const segIndex = Math.floor(worldZ / SEG_LEN);
const localZ = worldZ % SEG_LEN;
const inZ = localZ < SOLID_LEN;

let onPlat = false;

if (inZ) {
  for (let t = 0; t < ROAD_TILE_COUNT; t++) {
    if (!roadTileExists(segIndex, t)) continue;

    const tile = getRoadTileBounds(t);
    if (playerWorldX >= tile.x1 && playerWorldX <= tile.x2) {
      onPlat = true;
      break;
    }
  }
}

if (!onPlat && inZ && jumpVal < 20) {
  fallY += 6000 * rawDt;
  if (fallY > 20000) isDead = true;
} else if (onPlat && inZ) {
  fallY = 0;
}
      for (const s of shards) {
        s.z -= speed * 2400 * dt * s.speedMul;

        if (s.z < -1200) {
          resetShard(s);
          s.z = 30000 + Math.random() * 4000;
        }
      }

        //-----enemy spawn??----////
      enemySpawnTimer -= dt;
      if (enemySpawnTimer <= 0) {
        spawnEnemyBullet();
        enemySpawnTimer = 0.55 + Math.random() * 0.65;
      }

      for (let i = enemyBullets.length - 1; i >= 0; i--) {
        const b = enemyBullets[i];

b.x += b.vx * dt;
b.y += b.vy * dt;
b.z += b.vz * dt;
b.life -= dt;

        const relX = b.x - (playerX + dodgeOffsetX);
        const relY = b.y - (BASE_HEIGHT + jumpVal - dodgeOffsetY + 180);
        const relZ = b.z;

        const near3d = Math.hypot(relX * 0.9, relY * 0.8, relZ * 0.09);

        if (near3d < 520 && !b.closePassed) {
          bulletTimeTimer = Math.max(bulletTimeTimer, 0.16);
          b.closePassed = true;
        }

        const hitX = Math.abs(relX) < 130;
        const hitY = Math.abs(relY) < 170;
        const hitZ = Math.abs(relZ) < 180;

        if (hitX && hitY && hitZ && !isDead) {
          isDead = true;
        }

        if (b.life <= 0 || b.z < -2000) {
          enemyBullets.splice(i, 1);
        }
      }
      //-------//

    };
  
    // =========================
    // DRAW HELPERS
    // =========================
    const getRoadTileBounds = (tileIndex: number) => {
  const fullW = ROAD_HALF * 2;
  const tileW = (fullW - ROAD_TILE_GAP * (ROAD_TILE_COUNT - 1)) / ROAD_TILE_COUNT;

  const left =
    -ROAD_HALF +
    tileIndex * (tileW + ROAD_TILE_GAP);

  return {
    x1: left,
    x2: left + tileW,
    center: left + tileW * 0.5,
    width: tileW,
  };
};

const roadTileExists = (seg: number, tileIndex: number) => {
  // keep the center safer, outer tiles can break more often
  const r = hash(seg * 97 + tileIndex * 131 + 9000);

  // center tile is almost always there
  if (tileIndex === Math.floor(ROAD_TILE_COUNT / 2)) {
    return r > 0.08;
  }

  // inner shoulder tiles
  if (tileIndex === 1 || tileIndex === ROAD_TILE_COUNT - 2) {
    return r > 0.24;
  }

  // outer tiles break the most
  return r > 0.38;
};

const projectAtBaseCam = (
  x: number,
  y: number,
  z: number,
  w: number,
  h: number,
  horY: number
) => {
  const prevCamY = camY;
  camY = BASE_HEIGHT;
  const p = project(x, y, z, w, h, horY);
  camY = prevCamY;
  return p;
};

const getRoadStartCutoffY = (w: number, h: number, horY: number) => {
  const start = Math.floor(worldZ / SEG_LEN);
  const roadStartZ = (start + 12) * SEG_LEN - worldZ;

  const prevCamY = camY;
  camY = BASE_HEIGHT;

  const p = project(0, 0, roadStartZ, w, h, horY, false);

  camY = prevCamY;

  if (!p) return horY + h * 0.08;

  return p.y;
};

   /** * ANNOTATION: SKY & SHARDS
 * - Sky: Implements a 3-tier linear blend using the master palette.
 * - Shards: Randomized geometric debris with motion-blur glow and spin.
 */

const drawSky = (w: number, h: number) => {
  // 1. Primary Palette Gradient
  const sky = ctx.createLinearGradient(0, 0, 0, h);
  sky.addColorStop(0, COLORS.skyTop);    // Deepest space
  sky.addColorStop(0.4, COLORS.skyMid);  // Purple haze
  sky.addColorStop(1, COLORS.skyBottom); // Horizon warmth
  ctx.fillStyle = sky;
  ctx.fillRect(0, 0, w, h);

  // 2. Cyan Atmospheric Wash (Matches laneGlow/gridLine)
  // This creates a "haze" on one side of the screen for depth
  const wash = ctx.createLinearGradient(0, 0, w, h);
  wash.addColorStop(0, "rgba(125, 249, 255, 0.08)"); // laneAccent inspired
  wash.addColorStop(0.5, "rgba(90, 190, 255, 0.03)");
  wash.addColorStop(1, "transparent");
  ctx.fillStyle = wash;
  ctx.fillRect(0, 0, w, h);

  // 3. Cinematic Vignette
  // Darkens the corners to make the center "Sun" area pop
  const vignette = ctx.createRadialGradient(
    w * 0.5, h * 0.4, Math.min(w, h) * 0.2,
    w * 0.5, h * 0.4, Math.max(w, h) * 0.9
  );
  vignette.addColorStop(0, "transparent");
  vignette.addColorStop(1, "rgba(10, 5, 20, 0.4)"); // Derived from skyTop
  ctx.fillStyle = vignette;
  ctx.fillRect(0, 0, w, h);
};

//---shard---//
const drawShards = (w: number, h: number, horY: number) => {
 
  for (let i = 0; i < shards.length; i++) {
    const s = shards[i];

    const p = project(
      s.x - playerX + (dodgeOffsetX * 0.15),
      s.y,
      s.z,
      w,
      h,
      horY
    );

    if (!p) continue;

    const depthFade = clamp(1 - p.z / 28000, 0, 1);
    
    const alpha = depthFade * 0.9; 
    
    if (alpha <= 0.01) continue;

    const shardW = Math.max(2, s.w * p.s * 8);
    const shardH = Math.max(5, s.h * p.s * 10);
    const spin = s.tilt + (worldZ * 0.0008) + (i * 0.5);

    const isSpecial = i % 8 === 0;
    const mainColor = isSpecial ? COLORS.sunStripe : COLORS.laneAccent;
    const glowColor = isSpecial ? COLORS.sunOuter : COLORS.gridGlow;

    ctx.save();
    ctx.translate(p.x, p.y);
    ctx.rotate(spin);
    ctx.globalAlpha = alpha;

    ctx.shadowBlur = 15 * p.s; 
    ctx.shadowColor = glowColor;
    ctx.strokeStyle = glowColor;
    ctx.lineWidth = shardW * 0.5;
    ctx.beginPath();
    ctx.moveTo(0, -shardH);
    ctx.lineTo(0, shardH);
    ctx.stroke();

    ctx.shadowBlur = 0;
    ctx.fillStyle = COLORS.skyTop;
    ctx.beginPath();
    ctx.moveTo(0, -shardH);
    ctx.lineTo(shardW, 0);
    ctx.lineTo(0, shardH);
    ctx.lineTo(-shardW, 0);
    ctx.closePath();
    ctx.fill();

    ctx.strokeStyle = mainColor;
    ctx.lineWidth = Math.max(1.5, p.s * 25);
    ctx.stroke();

    ctx.fillStyle = "#ffffff";
    ctx.beginPath();
    ctx.arc(-shardW * 0.2, -shardH * 0.2, Math.max(1, p.s * 15), 0, Math.PI * 2);
    ctx.fill();

    ctx.restore();
  }
};

//-------//check might now be working ^----//////

const hash = (n: number) => {
  const x = Math.sin(n * 127.1 + 311.7) * 43758.5453123;
  return x - Math.floor(x);
};
//--- trees-----//
const drawPalmTrees = (w: number, h: number, horY: number) => {
  const start = Math.floor(worldZ / SEG_LEN);

  for (let seg = start + 14; seg >= start - 2; seg--) {
    const zNear = seg * SEG_LEN - worldZ;
    const zFar = zNear + SOLID_LEN;

    if (zFar < -1200 || zNear > 32000) continue;

    for (const side of [-1, 1] as const) {
      const id = seg * 101 + (side === -1 ? 7000 : 14000);

      const trunkZ = zNear + SOLID_LEN * (0.52 + hash(id + 1) * 0.18);
      const trunkX = side * (ROAD_HALF + 450 + hash(id + 2) * 200);
      const trunkH = 2800 + hash(id + 3) * 2000;
      const lean = side * (0.08 + hash(id + 4) * 0.05);

      const base = project(trunkX - playerX + dodgeOffsetX, 0, trunkZ, w, h, horY);
      const top = project(trunkX - playerX + dodgeOffsetX + lean * 550, trunkH, trunkZ, w, h, horY);

      if (!base || !top) continue;

      const alpha = clamp(1 - trunkZ / 26000, 0.1, 1);
      const trunkW = Math.max(2, base.s * 110);
      const crownR = Math.max(15, top.s * 850);

      ctx.save();
      ctx.globalAlpha = alpha;

      // 1. GROUND GLOW (Matches lane/grid glow)
      ctx.fillStyle = COLORS.gridGlow;
      ctx.globalAlpha = alpha * 0.2;
      ctx.beginPath();
      ctx.ellipse(base.x, base.y, trunkW * 4, trunkW * 1.5, 0, 0, Math.PI * 2);
      ctx.fill();

      // 2. TRUNK (Dark body with Cyan edge highlight)
      ctx.lineCap = "round";
      ctx.globalAlpha = alpha;
      
      // Trunk Silhouette
      ctx.strokeStyle = COLORS.skyTop; 
      ctx.lineWidth = trunkW;
      ctx.beginPath();
      ctx.moveTo(base.x, base.y);
      ctx.lineTo(top.x, top.y);
      ctx.stroke();

      // Trunk Cyan Edge (The "BuildingEdge" look)
      ctx.strokeStyle = COLORS.laneAccent;
      ctx.lineWidth = Math.max(1, trunkW * 0.2);
      ctx.beginPath();
      ctx.moveTo(base.x - trunkW * 0.2, base.y);
      ctx.lineTo(top.x - trunkW * 0.2, top.y);
      ctx.stroke();

      // 3. THICK NEON FRONDS
      const frondCount = 7;
      for (let f = 0; f < frondCount; f++) {
        const hVar = hash(id + 20 + f);
        const ang = (f / frondCount) * Math.PI * 2 + (side * 0.2);
        const len = crownR * (0.85 + hVar * 0.3);

        const ex = top.x + Math.cos(ang) * len;
        const ey = top.y + Math.sin(ang) * len * 0.5 + (len * 0.4); // Gravity droop
        const mx = top.x + Math.cos(ang) * len * 0.5;
        const my = top.y + Math.sin(ang) * len * 0.2 - (len * 0.1);

        // A. THE GLOW (The "thickness" provider)
        // Alternate between Pink (laneMain) and Cyan (laneAccent)
        const isCyan = f % 2 === 0;
        ctx.strokeStyle = isCyan ? COLORS.laneAccent : COLORS.laneMain;
        ctx.shadowBlur = top.s * 15;
        ctx.shadowColor = ctx.strokeStyle;
        ctx.globalAlpha = alpha * 0.3;
        ctx.lineWidth = top.s * 120; // Massive width for the light bleed
        ctx.beginPath();
        ctx.moveTo(top.x, top.y);
        ctx.quadraticCurveTo(mx, my, ex, ey);
        ctx.stroke();
        ctx.shadowBlur = 0;

        // B. THE SILHOUETTE (Deep purple)
        ctx.globalAlpha = alpha;
        ctx.strokeStyle = COLORS.skyTop;
        ctx.lineWidth = top.s * 50;
        ctx.beginPath();
        ctx.moveTo(top.x, top.y);
        ctx.quadraticCurveTo(mx, my, ex, ey);
        ctx.stroke();

        // C. THE CORE SPINE (Sharp neon)
        ctx.strokeStyle = isCyan ? COLORS.laneAccent : COLORS.sunStripe;
        ctx.lineWidth = Math.max(1.5, top.s * 15);
        ctx.stroke();
      }

      // 4. THE CROWN CORE (Glowing center)
      const coreR = Math.max(4, top.s * 120);
      const grad = ctx.createRadialGradient(top.x, top.y, 0, top.x, top.y, coreR);
      grad.addColorStop(0, COLORS.sunCore);
      grad.addColorStop(0.3, COLORS.sunStripe);
      grad.addColorStop(1, "transparent");
      
      ctx.fillStyle = grad;
      ctx.beginPath();
      ctx.arc(top.x, top.y, coreR, 0, Math.PI * 2);
      ctx.fill();

      ctx.restore();
    }
  }
  ctx.globalAlpha = 1;
};
//-------///
///side buildings----////
/** * FUNCTION: drawSideBuildings
 * PALETTE: buildingFaceA/B, buildingRoof, buildingEdge, gridGlow, skyTop
 * EFFECTS: Multi-face 3D perspective, randomized neon window grids, 
 * atmospheric street "wash", and rooftop antennae.
 */
const drawSideBuildings = (w: number, h: number, horY: number) => {
  const start = Math.floor(worldZ / SEG_LEN);

  // --- SECTION 1: THE CITY FLOOR / FOUNDATION ---
  for (let seg = start + 12; seg >= start - 1; seg--) {
    const zNear = seg * SEG_LEN - worldZ;
    const zFar = zNear + SOLID_LEN;

    if (zFar < -1000 || zNear > 32000) continue;

    const cityHalf = 22000;
    const p1 = project(-cityHalf - playerX + dodgeOffsetX, 0, zNear, w, h, horY);
    const p2 = project(cityHalf - playerX + dodgeOffsetX, 0, zNear, w, h, horY);
    const p3 = project(cityHalf - playerX + dodgeOffsetX, 0, zFar, w, h, horY);
    const p4 = project(-cityHalf - playerX + dodgeOffsetX, 0, zFar, w, h, horY);

    if (!p1 || !p2 || !p3 || !p4) continue;

    const alpha = clamp(1 - zNear / 26000, 0.05, 0.9);
    if (alpha <= 0.80) continue;

    ctx.save();
    ctx.globalAlpha = alpha;

    // A. City Asphalt Gradient (Deep Space/Purple transition)
    const streetGrad = ctx.createLinearGradient(0, p4.y, 0, p1.y);
    streetGrad.addColorStop(0, COLORS.skyTop);
    streetGrad.addColorStop(1, COLORS.buildingFaceB);
    ctx.fillStyle = streetGrad;

    ctx.beginPath();
    ctx.moveTo(p1.x, p1.y); ctx.lineTo(p2.x, p2.y);
    ctx.lineTo(p3.x, p3.y); ctx.lineTo(p4.x, p4.y);
    ctx.fill();

    // B. Atmospheric Center Wash (The "Neon Fog" effect)
    ctx.globalAlpha = alpha * 0.25;
    ctx.fillStyle = COLORS.laneAccent;
    ctx.beginPath();
    ctx.moveTo(lerp(p1.x, p2.x, 0.3), p1.y);
    ctx.lineTo(lerp(p1.x, p2.x, 0.7), p1.y);
    ctx.lineTo(lerp(p4.x, p3.x, 0.7), p4.y);
    ctx.lineTo(lerp(p4.x, p3.x, 0.3), p4.y);
    ctx.fill();

    // C. Curb Glow (Defining the active road boundaries)
    const streetHalf = ROAD_HALF;
    const curbLN = project(-streetHalf - playerX + dodgeOffsetX, 0, zNear, w, h, horY);
    const curbLF = project(-streetHalf - playerX + dodgeOffsetX, 0, zFar, w, h, horY);
    const curbRN = project(streetHalf - playerX + dodgeOffsetX, 0, zNear, w, h, horY);
    const curbRF = project(streetHalf - playerX + dodgeOffsetX, 0, zFar, w, h, horY);

    if (curbLN && curbLF && curbRN && curbRF) {
      ctx.globalAlpha = alpha * 0.4;
      ctx.strokeStyle = COLORS.gridGlow;
      ctx.lineWidth = Math.max(1.5, curbLN.s * 2.5);
      ctx.shadowBlur = 12 * curbLN.s;
      ctx.shadowColor = COLORS.gridGlow;

      ctx.beginPath(); ctx.moveTo(curbLN.x, curbLN.y); ctx.lineTo(curbLF.x, curbLF.y); ctx.stroke();
      ctx.beginPath(); ctx.moveTo(curbRN.x, curbRN.y); ctx.lineTo(curbRF.x, curbRF.y); ctx.stroke();
      ctx.shadowBlur = 0;
    }
    ctx.restore();
  }

  // --- SECTION 2: THE TOWERS / GEOMETRY ---
  for (let seg = start + 14; seg >= start - 2; seg--) {
    const zNear = seg * SEG_LEN - worldZ;
    const zFar = zNear + SOLID_LEN;

    if (zFar < -1000 || zNear > 32000) continue;

    for (const side of [-1, 1] as const) {
      const blockCount = 4;
      for (let j = 0; j < blockCount; j++) {
        const id = seg * 17 + j * 13 + (side === -1 ? 1000 : 2000);
        const depthT = j / blockCount;
        const bz1 = lerp(zNear + 250, zFar - 1400, depthT);
        const bz2 = bz1 + 950 + hash(id + 1) * 950;
        const baseOffset = ROAD_HALF + 900 + j * 850 + hash(id + 2) * 380;
        const bw = 620 + hash(id + 3) * 900;
        const bh = 1800 + hash(id + 4) * 4200;

        const x1 = side * baseOffset;
        const x2 = side * (baseOffset + bw);
        const [leftX, rightX] = [Math.min(x1, x2), Math.max(x1, x2)];

        const p1 = project(leftX - playerX + dodgeOffsetX, 0, bz1, w, h, horY);
        const p2 = project(rightX - playerX + dodgeOffsetX, 0, bz1, w, h, horY);
        const p3 = project(rightX - playerX + dodgeOffsetX, 0, bz2, w, h, horY);
        const t1 = project(leftX - playerX + dodgeOffsetX, bh, bz1, w, h, horY);
        const t2 = project(rightX - playerX + dodgeOffsetX, bh, bz1, w, h, horY);
        const t3 = project(rightX - playerX + dodgeOffsetX, bh, bz2, w, h, horY);
        const t4 = project(leftX - playerX + dodgeOffsetX, bh, bz2, w, h, horY);

        if (!p1 || !p2 || !p3 || !t1 || !t2 || !t3 || !t4) continue;

        const alpha = clamp(1 - bz1 / 26000, 0.08, 0.9);
        ctx.save();
        ctx.globalAlpha = alpha;

        // A. Building Faces (Front, Side, Roof)
        ctx.fillStyle = COLORS.buildingFaceA;
        ctx.beginPath(); ctx.moveTo(p1.x, p1.y); ctx.lineTo(p2.x, p2.y); ctx.lineTo(t2.x, t2.y); ctx.lineTo(t1.x, t1.y); ctx.fill();

        ctx.fillStyle = COLORS.buildingFaceB;
        ctx.beginPath(); ctx.moveTo(p2.x, p2.y); ctx.lineTo(p3.x, p3.y); ctx.lineTo(t3.x, t3.y); ctx.lineTo(t2.x, t2.y); ctx.fill();

        ctx.fillStyle = COLORS.buildingRoof;
        ctx.beginPath(); ctx.moveTo(t1.x, t1.y); ctx.lineTo(t2.x, t2.y); ctx.lineTo(t3.x, t3.y); ctx.lineTo(t4.x, t4.y); ctx.fill();

        // B. Neon Edge Highlights
        ctx.strokeStyle = COLORS.buildingEdge;
        ctx.lineWidth = Math.max(1, p1.s * 3);
        ctx.shadowBlur = 12 * p1.s;
        ctx.shadowColor = COLORS.buildingEdge;
        ctx.beginPath(); ctx.moveTo(t1.x, t1.y); ctx.lineTo(t2.x, t2.y); ctx.lineTo(t3.x, t3.y); ctx.stroke();
        ctx.shadowBlur = 0;

        // C. Window Grids (Optimized Randomization)
        const cols = 3 + Math.floor(hash(id + 6) * 4);
        const rows = 5 + Math.floor(hash(id + 7) * 8);
        for (let cx = 0; cx < cols; cx++) {
          for (let cy = 0; cy < rows; cy++) {
            if (hash(id + cx * 19 + cy * 31) < 0.25) continue;
            
            const lit = hash(id + cx * 7 + cy * 11) > 0.45;
            ctx.fillStyle = lit ? ( (cy+cx)%2 ? COLORS.laneAccent : COLORS.sunStripe ) : "rgba(255,255,255,0.05)";
            ctx.globalAlpha = lit ? alpha * 0.9 : alpha * 0.2;
            
            // Perspective Window Drawing
            const xL = (cx + 0.2) / cols;
            const yL = (cy + 0.2) / rows;
            const wx = lerp(t1.x, t2.x, xL);
            const wy = lerp(t1.y, p1.y, yL);
            ctx.fillRect(wx, wy, Math.max(1, p1.s * 400/cols), Math.max(1, p1.s * 600/rows));
          }
        }

        // D. Spire / Antenna
        if (hash(id + 8) > 0.65) {
          const mx = (t1.x + t2.x) * 0.5;
          const my = (t1.y + t2.y) * 0.5;
          ctx.strokeStyle = COLORS.shardAccent;
          ctx.lineWidth = Math.max(1, p1.s * 4);
          ctx.beginPath(); ctx.moveTo(mx, my); ctx.lineTo(mx, my - (p1.s * 800)); ctx.stroke();
        }
        ctx.restore();
      }
    }
  }
  ctx.globalAlpha = 1;
};
/** END: drawSideBuildings **/

//FUNCTION: drawMidgroundSkyline//

const drawMidgroundSkyline = (w: number, h: number, horY: number) => {
  const layers = [
    {
      zStart: 34000,
      repeatLen: 30000,
      depthMin: 2200,
      depthMax: 3800,
      faceA: COLORS.skylineNear, 
      faceB: COLORS.skylineFar,
      roof: COLORS.skylineNear,
      edge: COLORS.sunStripe,
      seed: 300,
      blockCount: 8,
      spacing: 4500,
      minW: 3000,
      maxW: 5500,
      minH: 7000,
      maxH: 16000,
    },
    {
      zStart: 20000,
      repeatLen: 26000,
      depthMin: 1800,
      depthMax: 3200,
      faceA: COLORS.skylineFar,
      faceB: COLORS.skyTop,
      roof: COLORS.skylineFar,
      edge: COLORS.laneAccent,
      seed: 100,
      blockCount: 10,
      spacing: 3800,
      minW: 2400,
      maxW: 4800,
      minH: 4000,
      maxH: 11000,
    }
  ];

  for (let l = 0; l < layers.length; l++) {
    const layer = layers[l];
    const cycleStart = Math.floor(worldZ / layer.repeatLen) - 1;
    const cycleEnd = cycleStart + 3;

    // Painter's Algorithm: Back to Front
    for (let cycle = cycleEnd; cycle >= cycleStart; cycle--) {
      for (let i = -layer.blockCount; i <= layer.blockCount; i++) {
        const id = layer.seed + i * 17 + cycle * 101;

        const bw = lerp(layer.minW, layer.maxW, hash(id + 2));
        const depth = lerp(layer.depthMin, layer.depthMax, hash(id + 3));
        const bh = lerp(layer.minH, layer.maxH, hash(id + 4));

        const zBase = cycle * layer.repeatLen + layer.zStart + hash(id + 5) * (layer.repeatLen * 0.7);
        const z1 = zBase - worldZ;
        const z2 = z1 + depth;

        if (z2 < 2000 || z1 > 90000) continue;

        // --- ZONE CONSTRAINT ---
        const innerBound = ROAD_HALF + 5500; 
        const outerBound = ROAD_HALF + 17000;
        let worldCenterX = i * layer.spacing + (hash(id + 1) - 0.5) * 1500;
        const side = worldCenterX > 0 ? 1 : -1;
        worldCenterX = side * clamp(Math.abs(worldCenterX), innerBound, outerBound);

        // --- WORLD ANCHORING ---
        // We pass 'true' (or ensure the project function handles playerX/tilt)
        // This ensures that as playerX changes, the buildings slide correctly.
        const px1 = worldCenterX - bw * 0.5 - playerX + dodgeOffsetX;
        const px2 = worldCenterX + bw * 0.5 - playerX + dodgeOffsetX;

        const p1 = project(px1, 0, z1, w, h, horY, true);
        const p2 = project(px2, 0, z1, w, h, horY, true);
        const p3 = project(px2, 0, z2, w, h, horY, true);
        const t1 = project(px1, bh, z1, w, h, horY, true);
        const t2 = project(px2, bh, z1, w, h, horY, true);
        const t3 = project(px2, bh, z2, w, h, horY, true);
        const t4 = project(px1, bh, z2, w, h, horY, true);

        if (!p1 || !p2 || !p3 || !t1 || !t2 || !t3 || !t4) continue;

        const alpha = clamp((1 - z1 / 85000), 0.2, 1);
        ctx.save();
        ctx.globalAlpha = alpha;

        // DRAW BOX (Solid Faces)
        ctx.fillStyle = layer.faceA;
        ctx.beginPath(); ctx.moveTo(p1.x, p1.y); ctx.lineTo(p2.x, p2.y); ctx.lineTo(t2.x, t2.y); ctx.lineTo(t1.x, t1.y); ctx.fill();
        ctx.fillStyle = layer.faceB;
        ctx.beginPath(); ctx.moveTo(p2.x, p2.y); ctx.lineTo(p3.x, p3.y); ctx.lineTo(t3.x, t3.y); ctx.lineTo(t2.x, t2.y); ctx.fill();

        // NEON ROOF CAP
        ctx.fillStyle = layer.roof;
        ctx.beginPath(); ctx.moveTo(t1.x, t1.y); ctx.lineTo(t2.x, t2.y); ctx.lineTo(t3.x, t3.y); ctx.lineTo(t4.x, t4.y); ctx.fill();

        ctx.strokeStyle = layer.edge;
        ctx.lineWidth = Math.max(1, p1.s * 4);
        ctx.shadowBlur = 10;
        ctx.shadowColor = layer.edge;
        ctx.beginPath(); ctx.moveTo(t4.x, t4.y); ctx.lineTo(t1.x, t1.y); ctx.lineTo(t2.x, t2.y); ctx.lineTo(t3.x, t3.y); ctx.stroke();
        ctx.shadowBlur = 0;

        // NEON WINDOWS (Linked to Palette)
        const cols = 2 + Math.floor(hash(id + 6) * 2);
        const rows = 4 + Math.floor(hash(id + 7) * 4);
        for (let cx = 0; cx < cols; cx++) {
          for (let cy = 0; cy < rows; cy++) {
            if (hash(id + cx * 13 + cy * 29) < 0.78) continue;
            const winColor = hash(id + cx) > 0.5 ? COLORS.laneAccent : COLORS.sunStripe;
            
            const wx = lerp(t1.x, t2.x, (cx + 0.3) / cols);
            const wy = lerp(t1.y, p1.y, (cy + 0.3) / rows);
            const ww = (p2.x - p1.x) * (0.3 / cols);
            const wh = (p1.y - t1.y) * (0.3 / rows);

            ctx.fillStyle = winColor;
            ctx.globalAlpha = alpha * 0.9;
            ctx.fillRect(wx, wy, Math.max(1, ww), Math.max(1, wh));
          }
        }
        ctx.restore();
      }
    }
  }
  ctx.globalAlpha = 1;
};
/** END: drawMidgroundSkyline **/

/** * FUNCTION: drawSkylineFogOverlay
 * PALETTE: sunGlow, laneAccent, skyMid, skyTop
 * EFFECTS: Multi-stage atmospheric scattering, horizon seam blending, 
 * and deep-ground vignette.
 */
const drawSkylineFogOverlay = (w: number, h: number, horY: number) => {
  ctx.save();

  // 1. SOFT NEON HAZE (The Horizon Glow)
  // This blends the sky into the tops of the buildings.
  const upperHaze = ctx.createLinearGradient(0, horY - 30, 0, horY + h * 0.18);
  upperHaze.addColorStop(0, "rgba(255, 102, 196, 0)");   // sunStripe transparent
  upperHaze.addColorStop(0.14, "rgba(255, 140, 90, 0.1)"); // sunGlow hint
  upperHaze.addColorStop(0.30, "rgba(125, 249, 255, 0.1)"); // laneAccent hint
  upperHaze.addColorStop(0.55, "rgba(18, 10, 36, 0.2)");   // skyMid transition
  upperHaze.addColorStop(1, "rgba(8, 6, 18, 0)");
  
  ctx.fillStyle = upperHaze;
  ctx.fillRect(0, horY - 30, w, h * 0.24);

  // 2. MAIN DARK FOG BLANKET (Depth Priming)
  // Provides the solid base that covers the "bottom" of distant buildings.
  const darkFog = ctx.createLinearGradient(0, horY - 10, 0, h);
  darkFog.addColorStop(0.00, "rgba(8, 6, 18, 0)");
  darkFog.addColorStop(0.10, "rgba(10, 8, 24, 0.2)");
  darkFog.addColorStop(0.22, "rgba(10, 8, 24, 0.4)");
  darkFog.addColorStop(0.38, "rgba(8, 6, 18, 0.65)");
  darkFog.addColorStop(0.62, "rgba(6, 4, 14, 0.85)");
  darkFog.addColorStop(1.00, "rgba(4, 3, 10, 1.0)"); // Near-solid at bottom
  
  ctx.fillStyle = darkFog;
  ctx.fillRect(0, horY - 10, w, h - horY + 10);

  // 3. HORIZON SEAM BAND (The Transition Zone)

  const seamY = horY + h * 0.17;
  const seamFog = ctx.createLinearGradient(0, seamY - 30, 0, seamY + 90);
  seamFog.addColorStop(0, "rgba(8, 6, 18, 0)");
  seamFog.addColorStop(0.25, "rgba(8, 6, 18, 0.35)");
  seamFog.addColorStop(0.55, "rgba(6, 4, 14, 0.65)");
  seamFog.addColorStop(1, "rgba(4, 3, 10, 0)");
  
  ctx.fillStyle = seamFog;
  ctx.fillRect(0, seamY - 30, w, 120);

  // 4. LOWER VEIL (Vignette)
  ctx.fillStyle = "rgba(4, 3, 10, 0.2)";
  ctx.fillRect(0, h * 0.68, w, h * 0.32);

  ctx.restore();
};
/** END: drawSkylineFogOverlay **/


/** * FUNCTION: drawDistantScenery
 * FIX: Extended mountain "skirts" to prevent gaps during player jumps.
 * ANCHOR: Added vertical floor-fill to ensure mountains always sit behind the city.
 */
const drawDistantScenery = (w: number, h: number, horY: number) => {
  const sceneOffsetX = -playerX + dodgeOffsetX;
  
  // 1. THE SUN (Same logic, world-anchored)
  const sun = project(sceneOffsetX, 2600, 52000, w, h, horY, true);
  if (sun) {
    const sunR = Math.max(40, sun.s * 9000);
    const glow = ctx.createRadialGradient(sun.x, sun.y, 0, sun.x, sun.y, sunR * 2.4);
    glow.addColorStop(0, "rgba(255, 140, 90, 0.25)");
    glow.addColorStop(1, "transparent");
    ctx.fillStyle = glow;
    ctx.beginPath(); ctx.arc(sun.x, sun.y, sunR * 2.4, 0, Math.PI * 2); ctx.fill();

    const sunGrad = ctx.createLinearGradient(0, sun.y - sunR, 0, sun.y + sunR);
    sunGrad.addColorStop(0, COLORS.sunCore);
    sunGrad.addColorStop(0.5, COLORS.sunOuter);
    sunGrad.addColorStop(1, COLORS.sunStripe);

    ctx.save();
    ctx.beginPath(); ctx.arc(sun.x, sun.y, sunR, 0, Math.PI * 2); ctx.clip();
    ctx.fillStyle = sunGrad;
    ctx.fillRect(sun.x - sunR, sun.y - sunR, sunR * 2, sunR * 2);

    ctx.globalCompositeOperation = "destination-out";
    const stripeH = Math.max(2, sunR * 0.08);
    for (let i = 0; i < 8; i++) {
      const yOff = sun.y + (sunR * 0.1) + (i * stripeH * 2.2);
      if (yOff < sun.y + sunR) ctx.fillRect(sun.x - sunR - 5, yOff, sunR * 2 + 10, stripeH);
    }
    ctx.restore();
  }

  // 2. MOUNTAIN STRIP HELPER (With Skirts)
  const drawMountainStrip = (
    zBase: number,
    yBase: number,
    peaks: number[],
    fill: string,
    glow: string,
    alpha: number,
    heightMul: number
  ) => {
    const points: { x: number; y: number }[] = [];

    for (let i = 0; i < peaks.length; i++) {
      const t = i / (peaks.length - 1);
      const worldX = lerp(-45000, 45000, t) + sceneOffsetX;
      const worldY = yBase + peaks[i] * heightMul;
      const p = project(worldX, worldY, zBase, w, h, horY, true);
      if (p) points.push({ x: p.x, y: p.y });
    }

    // PROJECT THE BASE (Deep Skirt)
    // We project the base far below 0 (e.g., -5000) so that even if the player 
    // jumps high, the "bottom" of the mountain polygon is still off-screen.
    const skirtDepth = -10000; 
    const baseLeft = project(-50000 + sceneOffsetX, skirtDepth, zBase, w, h, horY, true);
    const baseRight = project(50000 + sceneOffsetX, skirtDepth, zBase, w, h, horY, true);

    if (!baseLeft || !baseRight || points.length === 0) return;

    ctx.save();
    ctx.globalAlpha = alpha;

    ctx.beginPath();
    ctx.moveTo(baseLeft.x, baseLeft.y); // Start at bottom left
    for (const pt of points) ctx.lineTo(pt.x, pt.y); // Draw peaks
    ctx.lineTo(baseRight.x, baseRight.y); // Drop to bottom right
    ctx.closePath(); // Closes back to bottom left, creating a huge solid block

    ctx.fillStyle = fill;
    ctx.fill();

    // Rim Glow (Only on the peaks, not the skirt)
    ctx.strokeStyle = glow;
    ctx.lineWidth = Math.max(1.5, baseLeft.s * 100);
    ctx.shadowBlur = 15;
    ctx.shadowColor = glow;
    ctx.stroke();

    ctx.restore();
  };

  // 3. RENDER LAYERS
  // Far Layer
  drawMountainStrip(
    48000,
    800,
    [0.1, 0.45, 0.2, 0.55, 0.25, 0.5, 0.2, 0.45, 0.15],
    "#1a1032", 
    COLORS.sunStripe, 
    0.8, 
    4500
  );

  // Near Layer
  drawMountainStrip(
    40000,
    400,
    [0.15, 0.65, 0.25, 0.75, 0.35, 0.6, 0.25, 0.7, 0.2],
    "#080512", 
    COLORS.laneAccent, 
    1.0, 
    5500
  );
};
/** END: drawDistantScenery **/

// FUNCTION: drawRoad
const drawRoad = (w: number, h: number, horY: number) => {
  const start = Math.floor(worldZ / SEG_LEN);

  // Deep buffer: start - 20 ensures a long "tail" of road behind the player
  for (let seg = start + 18; seg >= start - 180; seg--) {
    const zN = seg * SEG_LEN - worldZ;
    const zF = zN + SOLID_LEN;

    // If it's in front, fade it. If it's behind/under us, keep it solid (1.0).
    const alpha = zN > 0 ? clamp(1 - zN / 35000, 0, 1) : 1.0;
    
    // Only skip if it's far away and faded out. 
    // We don't skip negative Z segments (the road behind us).
    if (zN > 0 && alpha <= 0) continue; 

    const offsetX = -playerX + dodgeOffsetX;

    for (let tileIndex = 0; tileIndex < ROAD_TILE_COUNT; tileIndex++) {
      if (!roadTileExists(seg, tileIndex)) continue;

      const tile = getRoadTileBounds(tileIndex);

      const p1 = project(tile.x1 + offsetX, 0, zN, w, h, horY, true);
      const p2 = project(tile.x2 + offsetX, 0, zN, w, h, horY, true);
      const p3 = project(tile.x2 + offsetX, 0, zF, w, h, horY, true);
      const p4 = project(tile.x1 + offsetX, 0, zF, w, h, horY, true);

      // If project returns null, the segment is likely too far behind/beside to draw
      if (!p1 || !p2 || !p3 || !p4) continue;

      // 1. ASPHALT
      ctx.globalAlpha = alpha;
      const roadGrad = ctx.createLinearGradient(0, p4.y, 0, p1.y);
      roadGrad.addColorStop(0, "#070912");
      roadGrad.addColorStop(1, "#1b2137");
      ctx.fillStyle = roadGrad;

      ctx.beginPath();
      ctx.moveTo(p1.x, p1.y); ctx.lineTo(p2.x, p2.y);
      ctx.lineTo(p3.x, p3.y); ctx.lineTo(p4.x, p4.y);
      ctx.fill();

      // 2. NEON TILE EDGES
      ctx.globalAlpha = alpha * 0.2;
      ctx.strokeStyle = COLORS.laneAccent;
      ctx.lineWidth = Math.max(1, p1.s * 2);
      ctx.beginPath();
      ctx.moveTo(p1.x, p1.y); ctx.lineTo(p4.x, p4.y);
      ctx.stroke();
      ctx.beginPath();
      ctx.moveTo(p2.x, p2.y); ctx.lineTo(p3.x, p3.y);
      ctx.stroke();
    }

    // 3. MAIN ROAD BOUNDARIES (Side Glow)
    const l1 = project(-ROAD_HALF + offsetX, 0, zN, w, h, horY, true);
    const l2 = project(-ROAD_HALF + offsetX, 0, zF, w, h, horY, true);
    const r1 = project(ROAD_HALF + offsetX, 0, zN, w, h, horY, true);
    const r2 = project(ROAD_HALF + offsetX, 0, zF, w, h, horY, true);

    if (l1 && l2 && r1 && r2) {
      ctx.save();
      ctx.globalAlpha = alpha * 0.6;
      ctx.strokeStyle = COLORS.laneAccent;
      ctx.lineWidth = Math.max(2, l1.s * 5);
      ctx.shadowBlur = 15;
      ctx.shadowColor = COLORS.laneAccent;

      ctx.beginPath(); ctx.moveTo(l1.x, l1.y); ctx.lineTo(l2.x, l2.y); ctx.stroke();
      ctx.beginPath(); ctx.moveTo(r1.x, r1.y); ctx.lineTo(r2.x, r2.y); ctx.stroke();
      ctx.restore();
    }

    // 4. CENTER STRIPE
    const centerTile = Math.floor(ROAD_TILE_COUNT / 2);
    if (roadTileExists(seg, centerTile)) {
      const s1 = project(-90 + offsetX, 0, zN, w, h, horY, true);
      const s2 = project(90 + offsetX, 0, zN, w, h, horY, true);
      const s3 = project(90 + offsetX, 0, zF, w, h, horY, true);
      const s4 = project(-90 + offsetX, 0, zF, w, h, horY, true);

      if (s1 && s2 && s3 && s4) {
        ctx.globalAlpha = alpha * 0.9;
        ctx.fillStyle = COLORS.laneAccent;
        ctx.beginPath();
        ctx.moveTo(s1.x, s1.y); ctx.lineTo(s2.x, s2.y);
        ctx.lineTo(s3.x, s3.y); ctx.lineTo(s4.x, s4.y);
        ctx.fill();
      }
    }
  }
  ctx.globalAlpha = 1;
};
/** END: drawRoad **/
const drawPlayerLegs = (w: number, h: number) => {
  const s = h / 1000;
  const flipT = flipDuration > 0 ? clamp(flipTimer / flipDuration, 0, 1) : 0;
  const airborne = jumpVal >= 8 || flipActive;

  const timeFactor = isSlowMo ? 0.0008 : 0.003; 
  const runCycle = performance.now() * timeFactor * Math.PI;

  const centerX = w * 0.5 + playerXVel * 0.02;
  
  // 1. LOWERED POSITION: Moved from 0.94 to 0.97 to sink the knees lower
  const baseY = h * 0.97; 
  
  const leanFactor = clamp(playerXVel * 0.00012, -0.5, 0.5);

  const jumpProgress = airborne ? clamp((performance.now() - jumpStartTime) / 250, 0, 1) : 0;
  const currentSpacing = lerp(230 * s, 220 * s, jumpProgress);

  const drawRunnerLeg = (
    x: number,
    side: -1 | 1,
    phase: number,
    isAirborne: boolean,
    prog: number
  ) => {
    const rawSine = Math.sin(phase);
    const rawCos = Math.cos(phase);

    // 2. LOWER LIFT: Reduced from 380 to 280 for a more "shuffling" high-speed run
    const smoothSine = rawSine > 0 ? Math.pow(rawSine, 0.9) : rawSine * 0.4;
    const runLift = (smoothSine > 0 ? smoothSine * 280 : 100) * s;
    
    const jumpTuck = flipActive ? Math.sin(flipT * Math.PI) * 200 * s : 60 * s;
    const targetJumpLift = 340 * s + jumpTuck;

    const finalLift = isAirborne ? lerp(runLift, targetJumpLift, prog) : runLift;
    const topY = baseY - finalLift;

    const ellipticalX = isAirborne ? 0 : rawCos * 35 * s;
    const depthScale = 1 + (isAirborne ? 0.15 : rawSine * 0.12);
    
    ctx.save();
    ctx.translate(x + (leanFactor * 100 * s) + ellipticalX, topY);
    ctx.scale(depthScale, depthScale);
    
    const kneeRotation = side * 0.02 + leanFactor * 0.2; // Reduced side tilt
    ctx.rotate(kneeRotation);

    // --- CALF (DYNAMIC STANCE) ---
    ctx.save();
    ctx.rotate(-kneeRotation); 
    
    const globalCounterLean = leanFactor * 1.4; 
    
    // 3. DYNAMIC V-STANCE: 
    // The outward "V" now scales with velocity. At rest, it's almost 0.
    const velocityScale = Math.abs(playerXVel) * 0.0001; 
    const naturalVStance = side * (0.05 + velocityScale * 0.25);
    
    const swing = isAirborne ? 0 : Math.sin(phase - 0.5) * 0.22;

    ctx.rotate(globalCounterLean + naturalVStance + swing);
    
    // Slide only happens during lean
    ctx.translate(leanFactor * 50 * s, 10 * s);

    // Calf Body
    ctx.fillStyle = COLORS.bodyDark;
    ctx.beginPath();
    ctx.roundRect(-70 * s, 0, 140 * s, 480 * s, 45 * s);
    ctx.fill();

    // Rose Gold Calf Plate
    ctx.fillStyle = COLORS.bodyLight;
    ctx.beginPath();
    ctx.roundRect(-55 * s, 30 * s, 110 * s, 380 * s, 25 * s);
    ctx.fill();
    
    // Shine
    ctx.fillStyle = COLORS.bodyAccent;
    ctx.beginPath();
    ctx.roundRect(-42 * s, 60 * s, 25 * s, 300 * s, 10 * s);
    ctx.fill();
    ctx.restore();

    // --- THIGH ---
    ctx.fillStyle = COLORS.bodyDark; 
    ctx.beginPath();
    ctx.roundRect(-95 * s, -60 * s, 195 * s, 850 * s, 60 * s);
    ctx.fill();

    // --- KNEE CAP ---
    ctx.save();
    ctx.fillStyle = COLORS.bodyDark;
    ctx.beginPath();
    ctx.arc(0, 0, 105 * s, 0, Math.PI * 2);
    ctx.fill();
    ctx.fillStyle = COLORS.bodyLight; 
    ctx.beginPath();
    ctx.ellipse(0, -8 * s, 88 * s, 94 * s, 0, 0, Math.PI * 2);
    ctx.fill();
    ctx.fillStyle = COLORS.bodyAccent;
    ctx.beginPath();
    ctx.ellipse(-26 * s, -36 * s, 45 * s, 24 * s, -0.2, 0, Math.PI * 2);
    ctx.fill();
    ctx.restore();

    ctx.restore();
  };

  drawRunnerLeg(centerX - currentSpacing, -1, runCycle, airborne, jumpProgress);
  drawRunnerLeg(centerX + currentSpacing, 1, runCycle + Math.PI, airborne, jumpProgress);
};

const drawPlayerArms = (w: number, h: number) => {
  const s = h / 1000;
  const airborne = jumpVal >= 8 || flipActive;
  const timeFactor = isSlowMo ? 0.0008 : 0.003;
  const armCycle = performance.now() * timeFactor * Math.PI;
  const leanFactor = clamp(playerXVel * 0.00012, -0.5, 0.5);

  const drawArm = (side: -1 | 1, phase: number) => {
    const rawSine = Math.sin(phase);
    const rawCos = Math.cos(phase);

    // 1. ORIGIN: Shoulders at the bottom corners
    // side -1 = Left Edge (0), side 1 = Right Edge (w)
    const shoulderX = side === -1 ? 0 : w;
    const shoulderY = h * 0.95; 

    // 2. THE PUMP: How far the hand reaches into the center
    // We want the hand to move toward the center (w/2) and up
    const targetX = w * 0.5 + (side * 150 * s); 
    const targetY = h * 0.75;

    // Movement offsets (The "Cycling" motion)
    const reachX = side * rawCos * 60 * s;
    const reachY = rawSine * 120 * s;
    
    const handX = targetX + reachX + (leanFactor * 100 * s);
    const handY = targetY + reachY;

    // 3. THE ELBOW (Calculated to create a bend)
    // It sits between shoulder and hand, but pushed outward/down
    const elbowX = lerp(shoulderX, handX, 0.4) + (side * 50 * s);
    const elbowY = lerp(shoulderY, handY, 0.2) + 100 * s;

    // 4. DRAWING THE ARM SEGMENTS
    ctx.save();
    ctx.lineJoin = "round";
    ctx.lineCap = "round";

    // --- Bicep/Upper Arm (Deep Brown) ---
    ctx.strokeStyle = COLORS.bodyDark;
    ctx.lineWidth = 140 * s;
    ctx.beginPath();
    ctx.moveTo(shoulderX, shoulderY);
    ctx.lineTo(elbowX, elbowY);
    ctx.stroke();

    // --- Forearm (Deep Brown + Rose Gold Plate) ---
    ctx.lineWidth = 110 * s;
    ctx.beginPath();
    ctx.moveTo(elbowX, elbowY);
    ctx.lineTo(handX, handY);
    ctx.stroke();

    // Rose Gold Armor Plate on Forearm
    ctx.strokeStyle = COLORS.bodyLight;
    ctx.lineWidth = 75 * s;
    ctx.beginPath();
    const plateStartX = lerp(elbowX, handX, 0.2);
    const plateStartY = lerp(elbowY, handY, 0.2);
    ctx.moveTo(plateStartX, plateStartY);
    ctx.lineTo(handX, handY);
    ctx.stroke();

    // 5. THE FIST
    ctx.save();
    ctx.translate(handX, handY);
    // Angle the fist based on where the arm is coming from
    ctx.rotate(side * -0.6 + (rawSine * 0.1));

    // Glove Base
    ctx.fillStyle = COLORS.bodyDark;
    ctx.beginPath();
    ctx.roundRect(-65 * s, -75 * s, 130 * s, 150 * s, 35 * s);
    ctx.fill();

    // Knuckle Armor (Rose Gold)
    ctx.fillStyle = COLORS.bodyLight;
    ctx.beginPath();
    ctx.roundRect(-55 * s, -70 * s, 110 * s, 55 * s, 15 * s);
    ctx.fill();

    // Shine on Knuckles
    ctx.fillStyle = COLORS.bodyAccent;
    ctx.beginPath();
    ctx.roundRect(-40 * s, -60 * s, 80 * s, 15 * s, 5 * s);
    ctx.fill();
    
    ctx.restore();
    ctx.restore();
  };

  // 6. RENDER ARMS
  if (!airborne) {
    // Sync with legs (offset phase)
    drawArm(-1, armCycle); 
    drawArm(1, armCycle + Math.PI);
  } else {
    // Jump: Pull arms down and slightly back (Wind resistance)
    const jumpAction = Math.sin(clamp((performance.now() - jumpStartTime) / 400, 0, 1) * Math.PI);
    drawArm(-1, armCycle * 0.3 + jumpAction);
    drawArm(1, (armCycle + Math.PI) * 0.3 - jumpAction);
  }
};
   /** * FUNCTION: drawEnemyBullets
 * PALETTE: sunStripe (Pink), laneAccent (Cyan), sunCore
 * STYLE: High-energy neon cores with trailing digital particles.
 */
const drawEnemyBullets = (w: number, h: number, horY: number) => {
  const now = performance.now();

  for (let i = 0; i < enemyBullets.length; i++) {
    const b = enemyBullets[i];
    
    // Project with 'true' to ensure they stay pinned during player movement
    const p = project(b.x - playerX + dodgeOffsetX, b.y, b.z, w, h, horY, true);
    if (!p) continue;

    const r = Math.max(10, b.r * p.s * 0.8);
    const alpha = clamp(1 - b.z / 40000, 0.2, 1.0);
    const pulse = Math.sin(now * 0.01 + i) * 0.2 + 0.8; // Pulsing scale effect

    ctx.save();
    ctx.translate(p.x, p.y);
    ctx.globalAlpha = alpha;

    // 1. DYNAMIC TRAIL PARTICLES (Visual "Leaking" Energy)
    // We simulate particles by drawing small squares offset by the bullet's "velocity"
    for (let j = 0; j < 5; j++) {
      const pOffset = (now * 0.2 + j * 15) % 40; 
      const pSize = Math.max(1, r * 0.15 * (1 - pOffset / 40));
      ctx.fillStyle = j % 2 === 0 ? COLORS.sunStripe : COLORS.laneAccent;
      ctx.globalAlpha = alpha * (1 - pOffset / 40);
      // Particles trail "into" the screen (z-axis simulation)
      ctx.fillRect(-r * 0.5 + Math.sin(j) * r, r + pOffset, pSize, pSize);
    }

    // 2. OUTER ATMOSPHERIC GLOW
    const glow = ctx.createRadialGradient(0, 0, 0, 0, 0, r * 3 * pulse);
    glow.addColorStop(0, COLORS.sunStripe.replace("1.0", "0.4"));
    glow.addColorStop(0.5, COLORS.laneAccent.replace("1.0", "0.1"));
    glow.addColorStop(1, "transparent");
    
    ctx.fillStyle = glow;
    ctx.beginPath(); ctx.arc(0, 0, r * 3 * pulse, 0, Math.PI * 2); ctx.fill();

    // 3. THE CORE (Layered Energy)
    // Outer Shell
    ctx.strokeStyle = COLORS.laneAccent;
    ctx.lineWidth = Math.max(1, r * 0.1);
    ctx.shadowBlur = 15;
    ctx.shadowColor = COLORS.laneAccent;
    ctx.beginPath(); ctx.arc(0, 0, r, 0, Math.PI * 2); ctx.stroke();

    // Inner Plasma
    ctx.fillStyle = COLORS.sunCore;
    ctx.shadowBlur = 5;
    ctx.beginPath(); ctx.arc(0, 0, r * 0.6, 0, Math.PI * 2); ctx.fill();

    // 4. THE "GLITCH" CROSS (Rotating Internal Vanes)
    ctx.rotate(now * 0.005 + i);
    ctx.strokeStyle = "#fff";
    ctx.lineWidth = Math.max(1, r * 0.15);
    ctx.shadowBlur = 0;
    
    // Draw a sharp "X" inside the core
    ctx.beginPath();
    ctx.moveTo(-r * 0.4, 0); ctx.lineTo(r * 0.4, 0);
    ctx.moveTo(0, -r * 0.4); ctx.lineTo(0, r * 0.4);
    ctx.stroke();

    ctx.restore();
  }
  ctx.globalAlpha = 1;
};
/** END: drawEnemyBullets **/

const drawHud = (w: number, h: number, horY: number) => {
  ctx.save();
  const now = Date.now();

  // 1. TOP SHELF (Subtle dark gradient to make white/neon text pop)
  const shelfGrad = ctx.createLinearGradient(0, 0, 0, 120);
  shelfGrad.addColorStop(0, "rgba(0, 0, 0, 0.6)");
  shelfGrad.addColorStop(1, "rgba(0, 0, 0, 0)");
  ctx.fillStyle = shelfGrad;
  ctx.fillRect(0, 0, w, 120);

  // 2. MAIN TITLE
  ctx.textAlign = "center";
  ctx.font = "italic 900 42px 'Segoe UI', Arial, sans-serif";
  
  // --- LEGIBILITY BACKING ---
  ctx.fillStyle = "rgba(0, 0, 0, 0.5)";
  ctx.fillText("SUNSET RUN", w * 0.5 + 3, 55); // Dark shadow offset

  // Chromatic Neon Layers
  ctx.fillStyle = COLORS.sunStripe;
  ctx.fillText("SUNSET RUN", w * 0.5 + 2, 52);
  ctx.fillStyle = COLORS.laneAccent;
  ctx.fillText("SUNSET RUN", w * 0.5 - 2, 52);
  ctx.fillStyle = "#FFF";
  ctx.fillText("SUNSET RUN", w * 0.5, 52);

  // 3. CONTROLS BAR
  ctx.font = "700 11px monospace";
  
  // --- LEGIBILITY BACKING ---
  ctx.fillStyle = "rgba(0, 0, 0, 0.7)";
  ctx.fillText("SYS.LOAD // A_D:MOVE • SPACE:JUMP • SHIFT:DODGE", w * 0.5 + 1, 79);

  ctx.fillStyle = COLORS.laneAccent;
  ctx.fillText("SYS.LOAD // A_D:MOVE • SPACE:JUMP • SHIFT:DODGE", w * 0.5, 78);

  // 4. JUMP CHARGE CELLS
  const cellW = 40;
  const cellH = 10;
  const startX = w * 0.5 - ((cellW + 10) * 3) / 2;
  const baseY = 100;

  for (let i = 0; i < 3; i++) {
    const active = jumpCount > i;
    const x = startX + i * (cellW + 10);
    
    // Dark background for the cell slot
    ctx.fillStyle = "rgba(0, 0, 0, 0.4)";
    ctx.fillRect(x, baseY, cellW, cellH);

    ctx.strokeStyle = active ? COLORS.laneAccent : "rgba(255,255,255,0.1)";
    ctx.lineWidth = 2;
    ctx.strokeRect(x, baseY, cellW, cellH);

    if (active) {
      ctx.fillStyle = COLORS.laneAccent;
      ctx.fillRect(x + 3, baseY + 3, cellW - 6, cellH - 6);
    }
  }

  // 5. "GLASS TIME" OVERLAY
  if ((isSlowMo || bulletTimeTimer > 0) && !isDead) {
    ctx.font = "900 32px 'Courier New', monospace";
    const glitchShake = Math.sin(now * 0.5) * 3;
    
    // --- LEGIBILITY BACKING (Extra thick for the big warning) ---
    ctx.fillStyle = "rgba(0, 0, 0, 0.6)";
    ctx.fillText(">> GLASS TIME <<", w * 0.5 + 4, h * 0.22 + 4);

    ctx.fillStyle = COLORS.sunStripe;
    ctx.fillText(">> GLASS TIME <<", w * 0.5 + glitchShake, h * 0.22);
    ctx.fillStyle = COLORS.laneAccent;
    ctx.fillText(">> GLASS TIME <<", w * 0.5 - glitchShake, h * 0.22);
    ctx.fillStyle = "#FFF";
    ctx.fillText(">> GLASS TIME <<", w * 0.5, h * 0.22);
  }

  ctx.restore();
};
/** END: drawHud **/

  /** * FUNCTION: drawScreenFx
 * EFFECTS: Motion streaks, flip auras, Glass Time color grading, and CRT scanlines.
 * PALETTE: sunStripe (Pink), laneAccent (Cyan), slowmoTint
 */
const drawScreenFx = (w: number, h: number) => {
  const flipT = flipDuration > 0 ? clamp(flipTimer / flipDuration, 0, 1) : 0;
  const bulletTimeActive = isSlowMo || bulletTimeTimer > 0;
  const speedRatio = clamp(Math.abs(playerXVel) / 1000, 0, 1);

  // 1. HORIZONTAL MOTION STREAKS (Wind/Speed lines)
  const streakStrength = speedRatio + (bulletTimeActive ? 0.3 : 0);
  for (let i = 0; i < 20; i++) {
    const y = (i / 20) * h;
    const len = 50 + streakStrength * 200 + (i % 7) * 12;
    // Speed lines move based on worldZ to feel attached to the world velocity
    const x = ((worldZ * 0.08 + i * 213) % (w + len)) - len;

    ctx.globalAlpha = bulletTimeActive ? 0.06 : 0.03;
    ctx.fillStyle = i % 2 === 0 ? COLORS.sunStripe : COLORS.laneAccent;
    ctx.fillRect(x, y, len, 1.5);
  }

  // 2. FLIP AURA (The "Sonic Boom" effect during tricks)
  if (flipActive) {
    const cx = w * 0.5;
    const cy = h * 0.55 - jumpVal * 0.05;
    const arcPulse = Math.sin(flipT * Math.PI);

    ctx.save();
    ctx.lineCap = "round";
    for (let i = 0; i < 6; i++) {
      const radius = 120 + i * 35 + arcPulse * 25;
      const sweep = Math.PI * (0.3 + i * 0.04);
      const rot = -flipVisualRotation * (0.6 + i * 0.1) + i * 0.8;

      ctx.globalAlpha = (0.04 + i * 0.02) * arcPulse;
      ctx.strokeStyle = i % 2 === 0 ? COLORS.sunStripe : COLORS.laneAccent;
      ctx.lineWidth = 2 + i;
      
      ctx.beginPath();
      ctx.arc(cx, cy, radius, rot, rot + sweep);
      ctx.stroke();
    }
    ctx.restore();
  }

  // 3. GLASS TIME / SLOWMO COLOR GRADE
  if (bulletTimeActive) {
    // Full screen tint
    ctx.globalAlpha = 0.15;
    ctx.fillStyle = COLORS.slowmoTint || "#4a2b85";
    ctx.fillRect(0, 0, w, h);

    // Radial "Vision" focus
    const focusGlow = ctx.createRadialGradient(w * 0.5, h * 0.5, 0, w * 0.5, h * 0.5, w * 0.6);
    focusGlow.addColorStop(0, "rgba(255, 255, 255, 0.15)");
    focusGlow.addColorStop(1, "transparent");
    ctx.fillStyle = focusGlow;
    ctx.globalAlpha = 1;
    ctx.fillRect(0, 0, w, h);
    
    // Chromatic Aberration Simulation (Cyan/Pink fringes)
    ctx.globalAlpha = 0.08;
    ctx.fillStyle = COLORS.sunStripe; ctx.fillRect(2, 0, w, h); // Shift Pink right
    ctx.fillStyle = COLORS.laneAccent; ctx.fillRect(-2, 0, w, h); // Shift Cyan left
  }

  // 4. CRT SCAN TEXTURE
  // Moves slightly with worldZ to feel like a rolling shutter
  const scanShift = (worldZ * 0.01) % 4;
  ctx.globalAlpha = bulletTimeActive ? 0.05 : 0.02;
  ctx.fillStyle = "#000";
  for (let y = scanShift; y < h; y += 4) {
    ctx.fillRect(0, y, w, 1);
  }

  // 5. NEON BLOOM WASH (Overall scene atmosphere)
  ctx.globalAlpha = 0.12;
  const bloom = ctx.createLinearGradient(0, 0, w, h);
  bloom.addColorStop(0, "rgba(255, 102, 196, 0.08)"); // Pink top
  bloom.addColorStop(1, "rgba(125, 249, 255, 0.05)"); // Cyan bottom
  ctx.fillStyle = bloom;
  ctx.fillRect(0, 0, w, h);

  // 6. MASTER VIGNETTE
  ctx.globalAlpha = 1.0;
  const vignette = ctx.createRadialGradient(
    w * 0.5, h * 0.45, Math.min(w, h) * 0.2,
    w * 0.5, h * 0.5, Math.max(w, h) * 0.9
  );
  vignette.addColorStop(0, "transparent");
  vignette.addColorStop(0.8, "rgba(8, 6, 18, 0.15)");
  vignette.addColorStop(1, "rgba(4, 3, 10, 0.4)"); // Deep dark corners
  ctx.fillStyle = vignette;
  ctx.fillRect(0, 0, w, h);

  ctx.globalAlpha = 1;
};
/** END: drawScreenFx **/

   /** * FUNCTION: drawDeath
 * STYLE: High-contrast "Signal Lost" glitch.
 * PALETTE: deathAccent (Pink), bodyDark, laneAccent (Cyan)
 */
const drawDeath = (w: number, h: number) => {
  const now = Date.now();
  
  // 1. THE "FLASH" OVERLAY
  // Heavy desaturated wash with a slight pink tint
  ctx.fillStyle = "rgba(10, 8, 24, 0.85)"; 
  ctx.fillRect(0, 0, w, h);

  // 2. SIGNAL NOISE (Static Overlay)
  ctx.save();
  ctx.globalAlpha = 0.05;
  for (let i = 0; i < 30; i++) {
    const noiseY = Math.random() * h;
    const noiseH = Math.random() * 3;
    ctx.fillStyle = i % 2 === 0 ? COLORS.laneAccent : COLORS.sunStripe;
    ctx.fillRect(0, noiseY, w, noiseH);
  }
  ctx.restore();

  ctx.textAlign = "center";

  // 3. THE "DOWN" TEXT (Glitch Stack)
  const glitchX = Math.sin(now * 0.1) * 4;
  const glitchY = Math.cos(now * 0.15) * 2;
  
  ctx.font = "italic 900 82px 'Segoe UI', Arial, sans-serif";

  // Legibility Shadow
  ctx.fillStyle = "rgba(0, 0, 0, 0.8)";
  ctx.fillText("SYSTEM DOWN", w * 0.5 + 6, h * 0.45 + 6);

  // Cyan Offset
  ctx.globalAlpha = 0.7;
  ctx.fillStyle = COLORS.laneAccent;
  ctx.fillText("SYSTEM DOWN", w * 0.5 - glitchX, h * 0.45 + glitchY);

  // Pink Offset
  ctx.fillStyle = COLORS.sunStripe;
  ctx.fillText("SYSTEM DOWN", w * 0.5 + glitchX, h * 0.45 - glitchY);

  // Main White Text
  ctx.globalAlpha = 1.0;
  ctx.fillStyle = "#FFF";
  ctx.fillText("SYSTEM DOWN", w * 0.5, h * 0.45);

  // 4. RESET PROMPT (Blinking)
  const isBlink = Math.floor(now / 500) % 2 === 0;
  ctx.font = "700 14px 'Courier New', monospace";
  
  // Dark backing for prompt
  ctx.fillStyle = "rgba(0, 0, 0, 0.5)";
  ctx.fillText("CRITICAL ERROR // PRESS [SPACE] TO REBOOT", w * 0.5 + 1, h * 0.55 + 1);

  ctx.fillStyle = isBlink ? COLORS.sunStripe : COLORS.hudText;
  ctx.fillText("CRITICAL ERROR // PRESS [SPACE] TO REBOOT", w * 0.5, h * 0.55);

  // 5. SCREEN SCANLINE REJECTION
  // Makes the screen look like it's shuting down
  ctx.fillStyle = "#000";
  ctx.globalAlpha = 0.2;
  const shutHeight = clamp((now % 1000) / 1000, 0, 1) * (h * 0.5);
  ctx.fillRect(0, 0, w, shutHeight); // Top curtain
  ctx.fillRect(0, h - shutHeight, w, shutHeight); // Bottom curtain

  ctx.restore();
};
/** END: drawDeath **/

// =========================
// LOOP
// =========================
const loop = (now: number) => {
  if (!canvasRef.current) return;

  const dt = Math.min(0.033, (now - lastNow) / 1000);
  lastNow = now;

  update(dt);

  const rect = canvasRef.current.getBoundingClientRect();
  const w = Math.max(1, Math.floor(rect.width));
  const h = Math.max(1, Math.floor(rect.height));

  if (canvasRef.current.width !== w) canvasRef.current.width = w;
  if (canvasRef.current.height !== h) canvasRef.current.height = h;

  const horY = h * 0.22;
  const cameraLean = -(playerXVel * 0.00006);

  // 1. Sky only
  drawSky(w, h);

  // 2. Entire world layer together
  ctx.save();
  ctx.translate(w / 2, h / 2);
  ctx.rotate(cameraLean);
  ctx.translate(-w / 2, -h / 2);

drawDistantScenery(w, h, horY);
drawMidgroundSkyline(w, h, horY);
drawPalmTrees(w, h, horY);
drawShards(w, h, horY);
drawSideBuildings(w, h, horY);
drawSkylineFogOverlay(w, h, horY);
drawRoad(w, h, horY);
drawEnemyBullets(w, h, horY);

  ctx.restore();

  // 3. Player layer
  ctx.save();
  ctx.translate(w / 2, h / 2);
  ctx.rotate(cameraLean + (-(playerXVel * 0.00002) + dodgeOffsetX * 0.00012));
  ctx.translate(-w / 2, -h / 2);

  drawPlayerLegs(w, h);
  drawPlayerArms(w, h);

  ctx.restore();

  // 4. Overlay
  drawHud(w, h, horY);
  drawScreenFx(w, h);

  if (isDead) {
    drawDeath(w, h);
  }

  animationFrameId = requestAnimationFrame(loop);
};

    animationFrameId = requestAnimationFrame(loop);

    return () => {
      cancelAnimationFrame(animationFrameId);
      window.removeEventListener("keydown", onKeyDown);
      window.removeEventListener("keyup", onKeyUp);
    };
  }, []);

  return (
    <div className="relative w-full h-full min-h-screen overflow-hidden bg-transparent">
      <canvas
        ref={canvasRef}
        className="absolute inset-0 w-full h-full cursor-none"
        style={{ background: "#efe4db" }}
      />
    </div>
  );
}