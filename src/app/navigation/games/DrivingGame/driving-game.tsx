"use client";

import { useEffect, useRef } from "react";

type TrafficCar = {
  id: number;
  lane: number;
  y: number;
  speed: number;
  color: string;
};

export default function MotorBikeGame() {
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
      cssH = Math.max(500, rect.height);

      canvas.width = Math.floor(cssW * dpr);
      canvas.height = Math.floor(cssH * dpr);
      canvas.style.width = `${cssW}px`;
      canvas.style.height = `${cssH}px`;

      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    };

    const clamp = (v: number, min: number, max: number) =>
      Math.max(min, Math.min(max, v));

    const lerp = (a: number, b: number, t: number) => a + (b - a) * t;

    // =========================================================
    // ROAD / LANES
    // =========================================================
    const laneCount = 4;

    const getRoad = () => {
      const roadWidth = Math.min(cssW * 0.72, 520);
      const laneWidth = roadWidth / laneCount;
      const left = (cssW - roadWidth) * 0.5;
      const right = left + roadWidth;

      return {
        left,
        right,
        width: roadWidth,
        laneWidth,
      };
    };

    const getLaneCenter = (lane: number) => {
      const road = getRoad();
      return road.left + road.laneWidth * lane + road.laneWidth * 0.5;
    };

    // =========================================================
    // PLAYER
    // =========================================================
const player = {
  lane: 1,
  x: 0,
  targetX: 0,
  y: 0,
  width: 52,
  height: 92,
  speed: 320,
  maxSpeed: 980,
  minSpeed: 180,
  moveCooldown: 0,

  // visual handling
  steer: 0,
  steerVisual: 0,
  bodyRoll: 0,
  yaw: 0,
  laneChangeVelocity: 0,
};

    // =========================================================
    // GAME STATE
    // =========================================================
    let worldScroll = 0;
    let distance = 0;
    let bestDistance = 0;
    let crashed = false;
    let gameStarted = false;

    let traffic: TrafficCar[] = [];
    let nextTrafficId = 1;
    let spawnTimer = 0;
    let roadStripeOffset = 0;
    let ambientCarTimer = 0;

    const carColors = [
      "#ef4444",
      "#3b82f6",
      "#22c55e",
      "#f59e0b",
      "#a855f7",
      "#14b8a6",
      "#f97316",
      "#e11d48",
    ];

   const resetGame = (startImmediately: boolean = false) => {
  const laneStart = 1;
  player.lane = laneStart;
  player.x = getLaneCenter(laneStart);
  player.targetX = player.x;
  player.y = cssH - 120;
  player.speed = 320;
  player.moveCooldown = 0;
  player.steer = 0;
  player.steerVisual = 0;
  player.bodyRoll = 0;
  player.yaw = 0;
  player.laneChangeVelocity = 0; 

  worldScroll = 0;
  distance = 0;
  crashed = false;
  gameStarted = startImmediately;

  traffic = [];
  nextTrafficId = 1;
  spawnTimer = 0.55;
  roadStripeOffset = 0;
  ambientCarTimer = 0;
};

    const laneHasCarInRange = (lane: number, minY: number, maxY: number) => {
  for (const car of traffic) {
    if (car.lane !== lane) continue;
    if (car.y > minY && car.y < maxY) return true;
  }
  return false;
};

const getCurrentlySafeLanes = () => {
  const safeLanes: number[] = [];

  // this is the "player decision zone" ahead of the bike
  const lookAheadTop = -40;
  const lookAheadBottom = player.y - 120;

  for (let lane = 0; lane < laneCount; lane++) {
    const blocked = laneHasCarInRange(lane, lookAheadTop, lookAheadBottom);
    if (!blocked) safeLanes.push(lane);
  }

  return safeLanes;
};

const spawnTrafficRow = () => {
  const lookAheadTop = -40;
  const lookAheadBottom = player.y - 120;

  const currentlySafeLanes: number[] = [];
  for (let lane = 0; lane < laneCount; lane++) {
    if (!laneHasCarInRange(lane, lookAheadTop, lookAheadBottom)) {
      currentlySafeLanes.push(lane);
    }
  }

  // If fewer than 2 lanes are currently safe, do not add more pressure.
  // This prevents "all lanes feel blocked" situations from stacking up.
  if (currentlySafeLanes.length <= 1) return;

  // Preserve one actually safe lane.
  const guaranteedOpenLane =
    currentlySafeLanes[Math.floor(Math.random() * currentlySafeLanes.length)];

  for (let lane = 0; lane < laneCount; lane++) {
    if (lane === guaranteedOpenLane) continue;

    // Never spawn into a crowded top corridor.
    if (laneHasCarInRange(lane, -260, 180)) continue;

    traffic.push({
      id: nextTrafficId++,
      lane,
      y: -140,
      speed: player.speed * (0.78 + Math.random() * 0.18),
      color: carColors[Math.floor(Math.random() * carColors.length)],
    });
  }
};
    const getPlayerRect = () => ({
      x: player.x - player.width * 0.5,
      y: player.y - player.height * 0.5,
      w: player.width,
      h: player.height,
    });

    const getTrafficRect = (car: TrafficCar) => {
      const x = getLaneCenter(car.lane);
      return {
        x: x - 24,
        y: car.y - 44,
        w: 48,
        h: 88,
      };
    };

    const rectsOverlap = (
      a: { x: number; y: number; w: number; h: number },
      b: { x: number; y: number; w: number; h: number }
    ) => {
      return (
        a.x < b.x + b.w &&
        a.x + a.w > b.x &&
        a.y < b.y + b.h &&
        a.y + a.h > b.y
      );
    };

 const updateGame = (dt: number) => {
  if (!gameStarted) {
  if (consumePressed(" ") || consumePressed("enter")) {
    resetGame(true);
  }
  return;
}

if (crashed) {
  if (consumePressed("r") || consumePressed(" ")) {
    resetGame(true);
  }
  return;
}

      if (player.moveCooldown > 0) player.moveCooldown -= dt;

    if ((consumePressed("a") || consumePressed("arrowleft")) && player.moveCooldown <= 0) {
  const nextLane = clamp(player.lane - 1, 0, laneCount - 1);
  if (nextLane !== player.lane) {
    player.lane = nextLane;
    player.targetX = getLaneCenter(player.lane);
    player.moveCooldown = 0.1;
    player.steer = -1;
    player.laneChangeVelocity = -1;
  }
}

if ((consumePressed("d") || consumePressed("arrowright")) && player.moveCooldown <= 0) {
  const nextLane = clamp(player.lane + 1, 0, laneCount - 1);
  if (nextLane !== player.lane) {
    player.lane = nextLane;
    player.targetX = getLaneCenter(player.lane);
    player.moveCooldown = 0.1;
    player.steer = 1;
    player.laneChangeVelocity = 1;
  }
}

      const accelerating = keys["w"] || keys["arrowup"];
      const braking = keys["s"] || keys["arrowdown"];

      if (accelerating) player.speed += 520 * dt;
      if (braking) player.speed -= 680 * dt;

      player.speed += 85 * dt; 
      player.speed = clamp(player.speed, player.minSpeed, player.maxSpeed);

     const previousX = player.x;
player.x = lerp(player.x, player.targetX, 0.18);

const xDelta = player.x - previousX;
const speedRatio =
  (player.speed - player.minSpeed) / (player.maxSpeed - player.minSpeed);

const targetSteerVisual = clamp(xDelta * 0.12, -1, 1);
player.steerVisual = lerp(player.steerVisual, targetSteerVisual, 0.22);

// decay the lane input kick
player.steer = lerp(player.steer, 0, 0.14);
player.laneChangeVelocity = lerp(player.laneChangeVelocity, 0, 0.1);

// body roll and yaw
player.bodyRoll = lerp(
  player.bodyRoll,
  (player.steerVisual * 10 + player.steer * 5) * (0.65 + speedRatio * 0.6),
  0.18
);

player.yaw = lerp(
  player.yaw,
  (player.steerVisual * 0.16 + player.steer * 0.05) * (0.8 + speedRatio * 0.5),
  0.18
);
      worldScroll += player.speed * dt;
      distance += player.speed * dt * 0.1;
      roadStripeOffset += player.speed * dt;

    spawnTimer -= dt;

const crowdedLanes = Array.from({ length: laneCount }, (_, lane) =>
  laneHasCarInRange(lane, -40, player.y - 80)
).filter(Boolean).length;

const spawnInterval =
  crowdedLanes >= laneCount - 1
    ? 0.95
    : crowdedLanes >= laneCount - 2
    ? 0.78
    : player.speed > 800
    ? 0.46
    : player.speed > 600
    ? 0.58
    : 0.7;

if (spawnTimer <= 0) {
  spawnTrafficRow();
  spawnTimer = spawnInterval;
}

 traffic.sort((a, b) => a.y - b.y);

for (let i = 0; i < traffic.length; i++) {
  const car = traffic[i];

  let leader: TrafficCar | null = null;
  let nearestGap = Infinity;

  for (let j = 0; j < traffic.length; j++) {
    if (i === j) continue;

    const other = traffic[j];
    if (other.lane !== car.lane) continue;
    if (other.y <= car.y) continue;

    const gap = other.y - car.y;
    if (gap < nearestGap) {
      nearestGap = gap;
      leader = other;
    }
  }

  let currentCarSpeed = car.speed;

  if (leader) {
    if (nearestGap < 150) {
      currentCarSpeed = Math.min(currentCarSpeed, leader.speed * 0.96);
    }
    if (nearestGap < 110) {
      currentCarSpeed = Math.min(currentCarSpeed, leader.speed * 0.9);
    }
    if (nearestGap < 90) {
      currentCarSpeed = Math.min(currentCarSpeed, leader.speed * 0.82);
    }
  }

  car.y += (player.speed - currentCarSpeed) * dt + 180 * dt;
}

      traffic = traffic.filter((car) => car.y < cssH + 140);

      const playerRect = getPlayerRect();
      for (const car of traffic) {
        if (rectsOverlap(playerRect, getTrafficRect(car))) {
          crashed = true;
          bestDistance = Math.max(bestDistance, distance);
          break;
        }
      }
    };

    // =========================================================
    // DRAW HELPERS
    // =========================================================
const drawRoadside = () => {
  const road = getRoad();
  const leftW = Math.max(0, road.left);
  const rightX = road.right;
  const rightW = Math.max(0, cssW - rightX);

  const drawGrassSide = (x: number, w: number, side: "left" | "right") => {
    if (w <= 0) return;
    const dir = side === "left" ? -1 : 1;

    ctx.save();
    ctx.beginPath();
    ctx.rect(x, 0, w, cssH);
    ctx.clip();

    // =========================================================
    // TURBO VIBRANCE GRADIENT (Punchier Greens)
    // =========================================================
    const grassGrad = ctx.createLinearGradient(x, 0, x + w, 0);
    // Swapping muddy browns for "Sports Anime" saturated greens/teals
    if (side === "left") {
      grassGrad.addColorStop(0, "#0a2e12"); // Deep forest
      grassGrad.addColorStop(0.5, "#1a5c25"); 
      grassGrad.addColorStop(1, "#2ecc71"); // Bright pop near road
    } else {
      grassGrad.addColorStop(0, "#2ecc71");
      grassGrad.addColorStop(0.5, "#1a5c25");
      grassGrad.addColorStop(1, "#0a2e12");
    }
    ctx.fillStyle = grassGrad;
    ctx.fillRect(x, 0, w, cssH);

    // =========================================================
    // CINEMATIC SPEED STREAKS (The "Turbo" Feel)
    // =========================================================
    // Vertical "motion blur" lines that scroll faster than the ground
ctx.lineWidth = 1;
for (let i = 0; i < 15; i++) {
  const streakSeed = i * 37.173;
  const normalized = (Math.sin(streakSeed) + 1) * 0.5;
  const streakX = x + normalized * w;
  const streakH = 50 + ((Math.sin(streakSeed * 1.7) + 1) * 0.5) * 90;
  const speedMult = 1.5;
  const yy = ((i * 100) + roadStripeOffset * speedMult) % (cssH + 200) - 100;

  ctx.strokeStyle = "rgba(255,255,255,0.08)";
  ctx.beginPath();
  ctx.moveTo(streakX, yy);
  ctx.lineTo(streakX, yy + streakH);
  ctx.stroke();
}

    // =========================================================
    // MOWED BANDS (Increased Contrast)
    // =========================================================
    for (let y = -120; y < cssH + 120; y += 60) {
      const yy = y + ((roadStripeOffset * 0.22) % 60);
      ctx.fillStyle = "rgba(0, 0, 0, 0.12)"; // Darker valleys
      ctx.fillRect(x, yy, w, 20);
      
      ctx.fillStyle = "rgba(255, 255, 255, 0.05)"; // Highlight peaks
      ctx.fillRect(x, yy + 20, w, 2);
    }

    // =========================================================
    // DIRT PATCHES (Stylized & Glossy)
    // =========================================================
    for (let y = -140; y < cssH + 160; y += 200) {
      const yy = y + ((roadStripeOffset * 0.7) % 200);
      const patchX = side === "left" ? x + (w * 0.2) : x + (w * 0.5);
      
      // Shadow
      ctx.fillStyle = "rgba(0, 0, 0, 0.2)";
      ctx.beginPath();
      ctx.ellipse(patchX, yy, 40, 15, dir * 0.4, 0, Math.PI * 2);
      ctx.fill();

      // "Rim Light" on the dirt to make it pop
      ctx.strokeStyle = "rgba(255, 255, 255, 0.1)";
      ctx.stroke();
    }

    // =========================================================
    // EDGE GLOW (Where grass meets road)
    // =========================================================
    const edgeGlow = ctx.createLinearGradient(
      side === "left" ? x + w - 15 : x, 0,
      side === "left" ? x + w : x + 15, 0
    );
    edgeGlow.addColorStop(side === "left" ? 0 : 1, "rgba(46, 204, 113, 0)");
    edgeGlow.addColorStop(side === "left" ? 1 : 0, "rgba(100, 255, 150, 0.4)");
    ctx.fillStyle = edgeGlow;
    ctx.fillRect(side === "left" ? x + w - 15 : x, 0, 15, cssH);

    ctx.restore();
  };

  // Draw sides
  drawGrassSide(0, leftW, "left");
  drawGrassSide(rightX, rightW, "right");

  // =========================================================
  // ROAD SHOULDER (The "Rumble Strip" look)
  // =========================================================
  const shoulderColor = "#222"; // Darker, more asphalt-like
  ctx.fillStyle = shoulderColor;
  ctx.fillRect(road.left - 15, 0, 15, cssH);
  ctx.fillRect(road.right, 0, 15, cssH);

  // Animated Rumble Strips (Red/White like a pro track)
  for (let y = -40; y < cssH + 40; y += 40) {
    const yy = y + (roadStripeOffset % 40);
    ctx.fillStyle = (Math.floor(yy / 40) % 2 === 0) ? "#e74c3c" : "#ecf0f1";
    
    // Left side
    ctx.fillRect(road.left - 15, yy, 15, 20);
    // Right side
    ctx.fillRect(road.right, yy, 15, 20);
  }

  // Final "Speed Glint" on the inner edge
  ctx.fillStyle = "rgba(255, 255, 255, 0.3)";
  ctx.fillRect(road.left - 2, 0, 1, cssH);
  ctx.fillRect(road.right + 1, 0, 1, cssH);
};

const drawTree = (x: number, y: number, scale: number) => {
  ctx.save();
  
  // Calculate a "Wind Tilt" based on how far the tree is from the center
  // This makes trees look like they are reacting to the speed of the race
  const screenCenter = cssW / 2;
  const tilt = (x - screenCenter) * 0.0005; 

  ctx.translate(x, y);
  ctx.rotate(tilt); // Dynamic lean

  // =========================================================
  // STYLIZED SHADOW (Softer & More Blue)
  // =========================================================
  ctx.fillStyle = "rgba(10, 20, 50, 0.25)"; // Blueish tint for "cinematic" shadows
  ctx.beginPath();
  ctx.ellipse(8 * scale, 12 * scale, 30 * scale, 10 * scale, 0, 0, Math.PI * 2);
  ctx.fill();

  // =========================================================
  // TRUNK (Higher Contrast)
  // =========================================================
  ctx.fillStyle = "#3e2712"; // Darker base
  ctx.fillRect(-4 * scale, 6 * scale, 8 * scale, 18 * scale);
  
  // Trunk Highlight (Gives it a 3D rounded look)
  ctx.fillStyle = "#6d4a2a"; 
  ctx.fillRect(-1 * scale, 6 * scale, 3 * scale, 18 * scale);

  // =========================================================
  // FOLIAGE BASE (The "Hero" Green)
  // =========================================================
  ctx.fillStyle = "#1b4d2e"; // Deep, saturated forest green
  ctx.beginPath();
  ctx.arc(0, 0, 26 * scale, 0, Math.PI * 2);
  ctx.fill();

  // =========================================================
  // LAYERED CLUMPS (Sports Anime Style)
  // =========================================================
  // Mid-tone clump
  ctx.fillStyle = "#27ae60"; // "Turbo" Green
  ctx.beginPath();
  ctx.arc(-8 * scale, -5 * scale, 18 * scale, 0, Math.PI * 2);
  ctx.fill();

  // Smaller secondary clump
  ctx.beginPath();
  ctx.arc(12 * scale, 2 * scale, 14 * scale, 0, Math.PI * 2);
  ctx.fill();

  // =========================================================
  // PUNCHY RIM HIGHLIGHTS
  // =========================================================
  // This is the "Cars" secret sauce: bright, sharp highlights
  ctx.fillStyle = "#bdfcc9"; 
  ctx.beginPath();
  ctx.arc(-12 * scale, -14 * scale, 12 * scale, 0, Math.PI * 2);
  ctx.fill();

  // Glossy "Specular" glint
  ctx.fillStyle = "rgba(255, 255, 255, 0.4)";
  ctx.beginPath();
  ctx.arc(-15 * scale, -18 * scale, 5 * scale, 0, Math.PI * 2);
  ctx.fill();

  ctx.restore();
};

  const drawRoad = () => {
  const road = getRoad();

  // =========================================================
  // ASPHALT BASE (Cinematic Deep Blue/Charcoal)
  // =========================================================
  ctx.fillStyle = "#1a1c21"; // Darker, richer base
  ctx.fillRect(road.left, 0, road.width, cssH);

  // Stylized Sky Reflection (The "Cars" look)
  // A vertical gradient making the center of the road look slightly glossy
  const roadReflect = ctx.createLinearGradient(road.left, 0, road.right, 0);
  roadReflect.addColorStop(0, "rgba(26, 28, 33, 1)");
  roadReflect.addColorStop(0.5, "rgba(45, 50, 65, 1)"); // Lighter, cooler center
  roadReflect.addColorStop(1, "rgba(26, 28, 33, 1)");
  ctx.fillStyle = roadReflect;
  ctx.fillRect(road.left, 0, road.width, cssH);

  // =========================================================
  // TIRE WEAR / HEAT GROOVES
  // =========================================================
  // Making these darker and more defined for that "heavily raced" feel
  ctx.fillStyle = "rgba(0, 0, 0, 0.35)";
  for (let i = 0; i < laneCount; i++) {
    const laneCenter = road.left + road.laneWidth * i + road.laneWidth * 0.5;
    ctx.fillRect(laneCenter - 22, 0, 14, cssH);
    ctx.fillRect(laneCenter + 8, 0, 14, cssH);
  }

  // =========================================================
  // HIGH-SPEED MOTION STREAKS
  // =========================================================
  // These move at 1.2x speed to create a sense of rushing air
ctx.fillStyle = "rgba(255, 255, 255, 0.04)";
for (let i = 0; i < 20; i++) {
  const seed = i * 19.731;
  const normalized = (Math.sin(seed) + 1) * 0.5;
  const streakX = road.left + normalized * road.width;
  const streakY = ((i * 60) + (roadStripeOffset * 1.2)) % (cssH + 100) - 50;
  ctx.fillRect(streakX, streakY, 1, 40);
}

  // =========================================================
  // LANE DIVIDERS (The "Turbo" Glow)
  // =========================================================
  for (let lane = 1; lane < laneCount; lane++) {
    const x = road.left + road.laneWidth * lane;

    for (let y = -100; y < cssH + 100; y += 80) {
      const yy = y + (roadStripeOffset % 80);
      
      // 1. Subtle Outer Glow
      ctx.shadowBlur = 10;
      ctx.shadowColor = "rgba(250, 204, 21, 0.4)";
      
      // 2. Main Yellow Line
      ctx.fillStyle = "#facc15";
      ctx.fillRect(x - 3, yy, 6, 40);
      
      // 3. Reset shadow so it doesn't lag the rest of the draw
      ctx.shadowBlur = 0;

      // 4. "Leading Edge" Highlight (White tip at the top of the line)
      ctx.fillStyle = "rgba(255, 255, 255, 0.6)";
      ctx.fillRect(x - 3, yy, 6, 4);
    }
  }

  // =========================================================
  // EDGE LINES (High Contrast)
  // =========================================================
  // Left Edge
  ctx.fillStyle = "#ffffff";
  ctx.fillRect(road.left + 2, 0, 5, cssH);
  // Right Edge
  ctx.fillRect(road.right - 7, 0, 5, cssH);

  // Subtle "Vignette" at the very edges of the asphalt
  const edgeShade = ctx.createLinearGradient(road.left, 0, road.left + 30, 0);
  edgeShade.addColorStop(0, "rgba(0,0,0,0.4)");
  edgeShade.addColorStop(1, "rgba(0,0,0,0)");
  ctx.fillStyle = edgeShade;
  ctx.fillRect(road.left, 0, 30, cssH);
};
const drawPlayerCar = () => {
  const x = player.x;
  const y = player.y;

  const speedRatio =
    (player.speed - player.minSpeed) / (player.maxSpeed - player.minSpeed);

  const roll = player.bodyRoll * (Math.PI / 180);
  const yaw = player.yaw;

  // shadow
  ctx.fillStyle = "rgba(0,0,0,0.28)";
  ctx.beginPath();
  ctx.ellipse(
    x + player.steerVisual * 8,
    y + 48,
    30 + Math.abs(player.steerVisual) * 4,
    11,
    0,
    0,
    Math.PI * 2
  );
  ctx.fill();

  // speed glow under car
  ctx.fillStyle = `rgba(96,165,250,${0.08 + speedRatio * 0.12})`;
  ctx.beginPath();
  ctx.ellipse(x, y + 34, 38, 16, 0, 0, Math.PI * 2);
  ctx.fill();

  ctx.save();
  ctx.translate(x, y);
  ctx.rotate(yaw + roll);

  // rear aero shadow
  ctx.fillStyle = "rgba(0,0,0,0.18)";
  ctx.beginPath();
  ctx.roundRect(-24, -8, 48, 52, 16);
  ctx.fill();

  // main body gradient
  const bodyGrad = ctx.createLinearGradient(0, -46, 0, 46);
  bodyGrad.addColorStop(0, "#60a5fa");
  bodyGrad.addColorStop(0.45, "#2563eb");
  bodyGrad.addColorStop(1, "#1e3a8a");

  ctx.fillStyle = bodyGrad;
  ctx.beginPath();
  ctx.roundRect(-26, -46, 52, 92, 16);
  ctx.fill();

  // body side darkening
  ctx.fillStyle = "rgba(0,0,0,0.12)";
  ctx.beginPath();
  ctx.roundRect(-26, 4, 52, 34, 14);
  ctx.fill();

  // top highlight panel
  ctx.fillStyle = "rgba(255,255,255,0.12)";
  ctx.beginPath();
  ctx.roundRect(-20, -40, 40, 14, 10);
  ctx.fill();

  // roof / cabin
  const cabinGrad = ctx.createLinearGradient(0, -24, 0, 12);
  cabinGrad.addColorStop(0, "#1d4ed8");
  cabinGrad.addColorStop(1, "#172554");
  ctx.fillStyle = cabinGrad;
  ctx.beginPath();
  ctx.roundRect(-18, -22, 36, 34, 11);
  ctx.fill();

  // windshield
  const glassGrad = ctx.createLinearGradient(0, -20, 0, 8);
  glassGrad.addColorStop(0, "#dbeafe");
  glassGrad.addColorStop(1, "#60a5fa");
  ctx.fillStyle = glassGrad;
  ctx.beginPath();
  ctx.roundRect(-16, -18, 32, 14, 7);
  ctx.fill();

  // rear glass
  ctx.fillStyle = "rgba(147,197,253,0.78)";
  ctx.beginPath();
  ctx.roundRect(-16, 0, 32, 8, 6);
  ctx.fill();

  // hood stripe
  ctx.fillStyle = "rgba(255,255,255,0.16)";
  ctx.beginPath();
  ctx.roundRect(-3, -34, 6, 54, 4);
  ctx.fill();

  // side reflections
  ctx.fillStyle = "rgba(255,255,255,0.12)";
  ctx.fillRect(-21, -6, 3, 24);
  ctx.fillRect(18, -6, 3, 24);

  // wheels with steering feel
  const wheelTurn = player.steerVisual * 4;

  ctx.save();
  ctx.translate(-20, -24);
  ctx.rotate(wheelTurn * 0.05);
  ctx.fillStyle = "#111827";
  ctx.fillRect(-4, -10, 8, 20);
  ctx.fillStyle = "rgba(255,255,255,0.08)";
  ctx.fillRect(-3, -9, 2, 18);
  ctx.restore();

  ctx.save();
  ctx.translate(20, -24);
  ctx.rotate(wheelTurn * 0.05);
  ctx.fillStyle = "#111827";
  ctx.fillRect(-4, -10, 8, 20);
  ctx.fillStyle = "rgba(255,255,255,0.08)";
  ctx.fillRect(-1, -9, 2, 18);
  ctx.restore();

  ctx.fillStyle = "#111827";
  ctx.fillRect(-24, 14, 8, 20);
  ctx.fillRect(16, 14, 8, 20);

  ctx.fillStyle = "rgba(255,255,255,0.08)";
  ctx.fillRect(-23, 15, 2, 18);
  ctx.fillRect(17, 15, 2, 18);

  // headlights
  ctx.fillStyle = "#ffffff";
  ctx.fillRect(-18, -39, 10, 6);
  ctx.fillRect(8, -39, 10, 6);

  // headlight glow
  ctx.fillStyle = "rgba(255,255,255,0.20)";
  ctx.fillRect(-19, -43, 12, 10);
  ctx.fillRect(7, -43, 12, 10);

  // rear lights
  ctx.fillStyle = "#fb923c";
  ctx.fillRect(-18, 33, 10, 6);
  ctx.fillRect(8, 33, 10, 6);

  // tiny spoiler
  ctx.fillStyle = "#0f172a";
  ctx.beginPath();
  ctx.roundRect(-16, 38, 32, 5, 3);
  ctx.fill();

  ctx.restore();
};
const drawTrafficCar = (car: TrafficCar) => {
  const x = getLaneCenter(car.lane);
  const y = car.y;

  ctx.fillStyle = "rgba(0,0,0,0.22)";
  ctx.beginPath();
  ctx.ellipse(x, y + 42, 28, 10, 0, 0, Math.PI * 2);
  ctx.fill();

  ctx.save();
  ctx.translate(x, y);

  const bodyGrad = ctx.createLinearGradient(0, -44, 0, 44);
  bodyGrad.addColorStop(0, "rgba(255,255,255,0.18)");
  bodyGrad.addColorStop(0.15, car.color);
  bodyGrad.addColorStop(1, "rgba(0,0,0,0.18)");

  ctx.fillStyle = bodyGrad;
  ctx.beginPath();
  ctx.roundRect(-24, -44, 48, 88, 14);
  ctx.fill();

  ctx.fillStyle = "rgba(255,255,255,0.10)";
  ctx.beginPath();
  ctx.roundRect(-19, -39, 38, 14, 9);
  ctx.fill();

  ctx.fillStyle = "rgba(0,0,0,0.14)";
  ctx.beginPath();
  ctx.roundRect(-20, 8, 40, 28, 10);
  ctx.fill();

  ctx.fillStyle = "rgba(15,23,42,0.82)";
  ctx.beginPath();
  ctx.roundRect(-17, -16, 34, 40, 10);
  ctx.fill();

  ctx.fillStyle = "#9bd2ff";
  ctx.beginPath();
  ctx.roundRect(-15, -18, 30, 15, 7);
  ctx.fill();

  ctx.fillStyle = "rgba(155,210,255,0.68)";
  ctx.beginPath();
  ctx.roundRect(-15, 1, 30, 8, 6);
  ctx.fill();

  ctx.fillStyle = "rgba(255,255,255,0.10)";
  ctx.fillRect(-20, -5, 3, 21);
  ctx.fillRect(17, -5, 3, 21);

  ctx.fillStyle = "#111827";
  ctx.fillRect(-22, -32, 7, 18);
  ctx.fillRect(15, -32, 7, 18);
  ctx.fillRect(-22, 14, 7, 18);
  ctx.fillRect(15, 14, 7, 18);

  ctx.fillStyle = "rgba(255,255,255,0.07)";
  ctx.fillRect(-21, -31, 2, 16);
  ctx.fillRect(16, -31, 2, 16);
  ctx.fillRect(-21, 15, 2, 16);
  ctx.fillRect(16, 15, 2, 16);

  ctx.fillStyle = "#ffffff";
  ctx.fillRect(-16, -37, 8, 5);
  ctx.fillRect(8, -37, 8, 5);

  ctx.fillStyle = "#fb923c";
  ctx.fillRect(-16, 34, 8, 5);
  ctx.fillRect(8, 34, 8, 5);

  ctx.restore();
};

const drawStartScreen = () => {
  // =========================================================
  // DARK OVERLAY
  // =========================================================
  ctx.fillStyle = "rgba(0,0,0,0.42)";
  ctx.fillRect(0, 0, cssW, cssH);

  const cardW = 500;
  const cardH = 300;
  const cardX = cssW * 0.5 - cardW * 0.5;
  const cardY = cssH * 0.5 - cardH * 0.5;

  // =========================================================
  // CARD SHADOW
  // =========================================================
  ctx.fillStyle = "rgba(0,0,0,0.28)";
  ctx.beginPath();
  ctx.roundRect(cardX + 8, cardY + 10, cardW, cardH, 26);
  ctx.fill();

  // =========================================================
  // CARD BASE
  // =========================================================
  const grad = ctx.createLinearGradient(0, cardY, 0, cardY + cardH);
  grad.addColorStop(0, "rgba(15,23,42,0.96)");
  grad.addColorStop(1, "rgba(30,41,59,0.94)");

  ctx.fillStyle = grad;
  ctx.beginPath();
  ctx.roundRect(cardX, cardY, cardW, cardH, 26);
  ctx.fill();

  // border
  ctx.strokeStyle = "rgba(255,255,255,0.14)";
  ctx.lineWidth = 2;
  ctx.beginPath();
  ctx.roundRect(cardX, cardY, cardW, cardH, 26);
  ctx.stroke();

  // top shine
  ctx.fillStyle = "rgba(255,255,255,0.05)";
  ctx.beginPath();
  ctx.roundRect(cardX + 12, cardY + 12, cardW - 24, 52, 18);
  ctx.fill();

  ctx.textAlign = "center";

  // =========================================================
  // TITLE
  // =========================================================
  ctx.fillStyle = "#ffffff";
  ctx.font = "bold 46px sans-serif";
  ctx.fillText("TRAFFIC DODGE", cssW * 0.5, cardY + 72);

  // subtitle
  ctx.font = "18px sans-serif";
  ctx.fillStyle = "rgba(255,255,255,0.84)";
  ctx.fillText(
    "Dodge traffic and survive as long as you can",
    cssW * 0.5,
    cardY + 108
  );

  // =========================================================
  // CONTROLS BOX
  // =========================================================
  const controlsX = cardX + 60;
  const controlsY = cardY + 132;
  const controlsW = cardW - 120;
  const controlsH = 88;

  ctx.fillStyle = "rgba(255,255,255,0.04)";
  ctx.beginPath();
  ctx.roundRect(controlsX, controlsY, controlsW, controlsH, 16);
  ctx.fill();

  ctx.strokeStyle = "rgba(255,255,255,0.08)";
  ctx.lineWidth = 1.5;
  ctx.beginPath();
  ctx.roundRect(controlsX, controlsY, controlsW, controlsH, 16);
  ctx.stroke();

  ctx.font = "bold 15px sans-serif";
  ctx.fillStyle = "rgba(255,255,255,0.92)";
  ctx.fillText("CONTROLS", cssW * 0.5, controlsY + 24);

  ctx.font = "16px sans-serif";
  ctx.fillStyle = "rgba(255,255,255,0.82)";
  ctx.fillText("A / ←   move left", cssW * 0.5, controlsY + 48);
  ctx.fillText("D / →   move right", cssW * 0.5, controlsY + 70);
  ctx.fillText("W/S or ↑/↓   control speed", cssW * 0.5, controlsY + 92);

  // =========================================================
  // START PROMPT
  // =========================================================
  const pulse = 0.7 + Math.sin(performance.now() * 0.006) * 0.3;

  ctx.fillStyle = `rgba(250,204,21,${0.18 + pulse * 0.18})`;
  ctx.beginPath();
  ctx.roundRect(cardX + 120, cardY + 238, cardW - 240, 40, 14);
  ctx.fill();

  ctx.strokeStyle = `rgba(250,204,21,${0.35 + pulse * 0.25})`;
  ctx.lineWidth = 2;
  ctx.beginPath();
  ctx.roundRect(cardX + 120, cardY + 238, cardW - 240, 40, 14);
  ctx.stroke();

  ctx.fillStyle = `rgba(255,255,255,${0.82 + pulse * 0.18})`;
  ctx.font = "bold 21px sans-serif";
  ctx.fillText("PRESS SPACE TO START", cssW * 0.5, cardY + 265);
};
   const drawHUD = () => {
  // =========================================================
  // LEFT INFO PANEL
  // =========================================================
  const leftX = 18;
  const leftY = 18;
  const leftW = 270;
  const leftH = 126;

  const leftGrad = ctx.createLinearGradient(0, leftY, 0, leftY + leftH);
  leftGrad.addColorStop(0, "rgba(15,23,42,0.92)");
  leftGrad.addColorStop(1, "rgba(30,41,59,0.86)");

  ctx.fillStyle = "rgba(0,0,0,0.22)";
  ctx.beginPath();
  ctx.roundRect(leftX + 4, leftY + 6, leftW, leftH, 18);
  ctx.fill();

  ctx.fillStyle = leftGrad;
  ctx.beginPath();
  ctx.roundRect(leftX, leftY, leftW, leftH, 18);
  ctx.fill();

  ctx.strokeStyle = "rgba(255,255,255,0.12)";
  ctx.lineWidth = 1.5;
  ctx.beginPath();
  ctx.roundRect(leftX, leftY, leftW, leftH, 18);
  ctx.stroke();

  ctx.fillStyle = "rgba(255,255,255,0.05)";
  ctx.beginPath();
  ctx.roundRect(leftX + 10, leftY + 10, leftW - 20, 26, 12);
  ctx.fill();

  ctx.textAlign = "left";
  ctx.fillStyle = "#ffffff";
  ctx.font = "bold 18px sans-serif";
  ctx.fillText("TRAFFIC DODGE", leftX + 16, leftY + 29);

  ctx.font = "15px sans-serif";
  ctx.fillStyle = "rgba(255,255,255,0.92)";
  ctx.fillText(`Distance: ${Math.floor(distance)} m`, leftX + 16, leftY + 58);
  ctx.fillText(`Best: ${Math.floor(bestDistance)} m`, leftX + 16, leftY + 84);

  ctx.fillText(`Speed: ${Math.floor(player.speed)}`, leftX + 16, leftY + 110);

  // speed accent bar
  const speedBarX = leftX + 108;
  const speedBarY = leftY + 98;
  const speedBarW = 140;
  const speedBarH = 10;

  const speedFill = Math.max(0, Math.min(1, player.speed / 260));

  ctx.fillStyle = "rgba(255,255,255,0.10)";
  ctx.beginPath();
  ctx.roundRect(speedBarX, speedBarY, speedBarW, speedBarH, 999);
  ctx.fill();

  ctx.fillStyle = "#facc15";
  ctx.beginPath();
  ctx.roundRect(speedBarX, speedBarY, speedBarW * speedFill, speedBarH, 999);
  ctx.fill();

  // =========================================================
  // RIGHT CONTROLS PANEL
  // =========================================================
  const rightW = 236;
  const rightH = 112;
  const rightX = cssW - rightW - 18;
  const rightY = 18;

  const rightGrad = ctx.createLinearGradient(0, rightY, 0, rightY + rightH);
  rightGrad.addColorStop(0, "rgba(15,23,42,0.90)");
  rightGrad.addColorStop(1, "rgba(30,41,59,0.84)");

  ctx.fillStyle = "rgba(0,0,0,0.22)";
  ctx.beginPath();
  ctx.roundRect(rightX + 4, rightY + 6, rightW, rightH, 18);
  ctx.fill();

  ctx.fillStyle = rightGrad;
  ctx.beginPath();
  ctx.roundRect(rightX, rightY, rightW, rightH, 18);
  ctx.fill();

  ctx.strokeStyle = "rgba(255,255,255,0.12)";
  ctx.lineWidth = 1.5;
  ctx.beginPath();
  ctx.roundRect(rightX, rightY, rightW, rightH, 18);
  ctx.stroke();

  ctx.fillStyle = "rgba(255,255,255,0.05)";
  ctx.beginPath();
  ctx.roundRect(rightX + 10, rightY + 10, rightW - 20, 24, 12);
  ctx.fill();

  ctx.fillStyle = "#ffffff";
  ctx.font = "bold 16px sans-serif";
  ctx.fillText("CONTROLS", rightX + 16, rightY + 28);

  ctx.font = "14px sans-serif";
  ctx.fillStyle = "rgba(255,255,255,0.88)";
  ctx.fillText("A / ←   move left", rightX + 16, rightY + 56);
  ctx.fillText("D / →   move right", rightX + 16, rightY + 78);
  ctx.fillText("W/S or ↑/↓   speed", rightX + 16, rightY + 100);

  // =========================================================
  // CRASH OVERLAY
  // =========================================================
  if (crashed) {
    ctx.fillStyle = "rgba(0,0,0,0.56)";
    ctx.fillRect(0, 0, cssW, cssH);

    const crashW = 420;
    const crashH = 210;
    const crashX = cssW * 0.5 - crashW * 0.5;
    const crashY = cssH * 0.5 - crashH * 0.5;

    ctx.fillStyle = "rgba(0,0,0,0.24)";
    ctx.beginPath();
    ctx.roundRect(crashX + 8, crashY + 10, crashW, crashH, 24);
    ctx.fill();

    const crashGrad = ctx.createLinearGradient(0, crashY, 0, crashY + crashH);
    crashGrad.addColorStop(0, "rgba(30,41,59,0.96)");
    crashGrad.addColorStop(1, "rgba(15,23,42,0.94)");

    ctx.fillStyle = crashGrad;
    ctx.beginPath();
    ctx.roundRect(crashX, crashY, crashW, crashH, 24);
    ctx.fill();

    ctx.strokeStyle = "rgba(255,255,255,0.12)";
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.roundRect(crashX, crashY, crashW, crashH, 24);
    ctx.stroke();

    ctx.textAlign = "center";

    ctx.fillStyle = "#ffffff";
    ctx.font = "bold 44px sans-serif";
    ctx.fillText("CRASHED", cssW * 0.5, crashY + 68);

    ctx.font = "20px sans-serif";
    ctx.fillStyle = "rgba(255,255,255,0.90)";
    ctx.fillText(`Distance: ${Math.floor(distance)} m`, cssW * 0.5, crashY + 108);
    ctx.fillText(`Best: ${Math.floor(bestDistance)} m`, cssW * 0.5, crashY + 136);

    const pulse = 0.7 + Math.sin(performance.now() * 0.006) * 0.3;

    ctx.fillStyle = `rgba(250,204,21,${0.16 + pulse * 0.18})`;
    ctx.beginPath();
    ctx.roundRect(crashX + 95, crashY + 156, crashW - 190, 34, 12);
    ctx.fill();

    ctx.strokeStyle = `rgba(250,204,21,${0.34 + pulse * 0.26})`;
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.roundRect(crashX + 95, crashY + 156, crashW - 190, 34, 12);
    ctx.stroke();

    ctx.fillStyle = `rgba(255,255,255,${0.82 + pulse * 0.18})`;
    ctx.font = "bold 18px sans-serif";
    ctx.fillText("PRESS R TO RESTART", cssW * 0.5, crashY + 179);
  }
};

const render = () => {
  ctx.clearRect(0, 0, cssW, cssH);

  // 1. World Base
  drawRoadside();
  drawRoad();

  const speedRatio =
  (player.speed - player.minSpeed) / (player.maxSpeed - player.minSpeed);

if (gameStarted && !crashed) {
  ctx.save();
  ctx.strokeStyle = `rgba(255,255,255,${0.04 + speedRatio * 0.08})`;
  ctx.lineWidth = 2;

  for (let i = 0; i < 8; i++) {
    const offset = i * 10;
    ctx.beginPath();
    ctx.moveTo(player.x - 10 + Math.sin(i * 3.1) * 8, player.y + 30 + offset);
    ctx.lineTo(player.x - 18 + Math.sin(i * 3.1) * 8, player.y + 60 + offset);
    ctx.stroke();

    ctx.beginPath();
    ctx.moveTo(player.x + 10 + Math.sin(i * 2.7) * 8, player.y + 30 + offset);
    ctx.lineTo(player.x + 18 + Math.sin(i * 2.7) * 8, player.y + 60 + offset);
    ctx.stroke();
  }

  ctx.restore();
}

  // 2. The Fixed Tree Call
  // We loop to create a "forest" effect that scrolls with the road
  const treeSpacing = 400; // Distance between trees
  for (let i = -1; i < 3; i++) {
    // Calculate a scrolling Y based on your road offset
    const scrollY = (i * treeSpacing) + (roadStripeOffset % treeSpacing);
    
    const road = getRoad();
    
    // Draw on the Left (Offset from the road edge)
    drawTree(road.left - 80, scrollY, 1.2);
    
    // Draw on the Right (Staggered Y for a more natural feel)
    drawTree(road.right + 80, scrollY + 200, 1.1);
  }

  // 3. Traffic
  for (const car of traffic) {
    drawTrafficCar(car);
  }

  // 4. Player
  drawPlayerCar();

  // 5. UI
  drawHUD();

  if (!gameStarted) {
    drawStartScreen();
  }
};

    const loop = (time: number) => {
      const dt = Math.min(0.033, (time - lastTime) / 1000 || 0.016);
      lastTime = time;

      updateGame(dt);
      render();

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
    <div className="w-full h-full bg-[#0b1020]">
      <canvas ref={canvasRef} className="block w-full h-full" />
    </div>
  );
}