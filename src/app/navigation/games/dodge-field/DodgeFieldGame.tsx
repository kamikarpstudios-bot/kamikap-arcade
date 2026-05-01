"use client";

import React, { useEffect, useRef, useState } from "react";
import { Enemy, spawnEnemy, updateEnemy, drawEnemy } from "./enemy";
import { Bullet, Particle, Ship, WeaponId } from "./types";
//================================================================================================================================================================//
   // TYPES //
//============================================================================================================================================================== //


const WEAPON_LIST: WeaponId[] = [
  "BLASTER",
  "SHOTGUN",
  "LASER",
  "BLACKHOLE",
  "SEEKER",
];

type Star = {
  x: number;
  y: number;
  radius: number;
  brightness: number;    // 0-1
  twinkleSpeed: number;  // how fast it flickers
  speed?: number;        // vertical drift
};

const stars: Star[] = [];
const STAR_COUNT = 150; // tweak for performance / density

type Weapon = {
  id: WeaponId;
  fire: (ctx: {
    ship: Ship;
    bulletsRef: React.MutableRefObject<Bullet[]>;
    nextId: React.MutableRefObject<number>;
    keys: {
      up: boolean;
      down: boolean;
      left: boolean;
      right: boolean;
      fire: boolean;
      lastFire: boolean;
    };
    dt: number;
    charge: number;
  }) => void;
};
// ===========================
// 1️⃣ Weapon Level Definitions
// ===========================
type WeaponLevelStats = {
  bullets?: number;
  spacing?: number;       // for multi-barrel blasters
  speed?: number;
  spread?: number;        // for shotguns
  size?: number;
  life?: number;
  length?: number;        // for lasers
  chargeThreshold?: number;
  recoil?: number;
  maxLife?: number;
  chargeDrainRate?: number;
  brightness?: number;
  flickerIntensity?: number;
  flicker?: number;
};

type WeaponTemplate = {
  id: WeaponId;   // <-- instead of string
  type: "BLASTER" | "SHOTGUN" | "LASER";
  levels: WeaponLevelStats[];
};
// Weapon templates
const weaponDefinitions: WeaponTemplate[] = [
  {
    id: "BLASTER",
    type: "BLASTER",
    levels: [
      { bullets: 1, speed: 5, size: 1, length: 11, chargeThreshold: 0.9 },
      { bullets: 1, speed: 10, spacing: 1, size: 5, length: 25, chargeThreshold: 0.5 },
      { bullets: 1, speed: 100, spacing: 15, size: 6, length: 55, chargeThreshold: 0.5 },
      { bullets: 1, speed: 200, spacing: 25, size: 10, length: 85, chargeThreshold: 0.5 },
    ],
  },
  {
    id: "SHOTGUN",
    type: "SHOTGUN",
    levels: [
      { bullets: 2, speed: 500, spread: 0.25, recoil: 20 },
      { bullets: 5, speed: 700, spread: 0.45, recoil: 40 },
      { bullets: 8, speed: 950, spread: 0.65, recoil: 60 },
      { bullets: 11, speed: 1000, spread: 0.85, recoil: 80},
    ],
  },
  {
     id: "LASER",
type: "LASER",
levels: [
  { size: 3, maxLife: 2, chargeDrainRate: 0.3, brightness: 2, flickerIntensity: 0.80 },
  { size: 4, maxLife: 4, chargeDrainRate: 0.18, brightness: 5, flickerIntensity: 0.50 },
  { size: 6, maxLife: 6, chargeDrainRate: 0.10, brightness: 10, flickerIntensity: 0.20 },
  { size: 8, maxLife: 8, chargeDrainRate: 0.05, brightness: 15, flickerIntensity: 0.10 },
],
  },
];
// ===========================
// 2️⃣ Modular Weapon Creators
// ===========================

function createBlaster({ id, stats }: { id: string; stats: WeaponLevelStats }): Weapon {
  return {
    id: id as WeaponId,
    fire({ ship, bulletsRef, nextId, keys, charge, dt }) {
      const tipX = ship.x + Math.cos(ship.angle) * ship.r;
      const tipY = ship.y + Math.sin(ship.angle) * ship.r;
      const MIN_CHARGE = stats.chargeThreshold ?? 0.5;

      // --- Normal tap ---
      if (charge < MIN_CHARGE && keys.fire && !keys.lastFire) {
        for (let i = 0; i < (stats.bullets ?? 1); i++) {
          const offset = ((i - ((stats.bullets ?? 1) - 1) / 2) * (stats.spacing ?? 0));
          bulletsRef.current.push({
            id: nextId.current++,
            x: tipX + offset,
            y: tipY,
            vx: Math.cos(ship.angle) * stats.speed!,
            vy: Math.sin(ship.angle) * stats.speed!,
            size: stats.size ?? 8,
            type: id as WeaponId,
            trail: [],
            particles: [],
            life: stats.life ?? 1.2,
            maxLife: stats.life ?? 1.2,
            charge: 0,
            phase: 1,
            baseAngle: ship.angle,
            length: stats.length,
          });
        }
        return;
      }

      // --- Charged release ---
      if (charge >= MIN_CHARGE && !keys.fire) {
        const power = charge;
        for (let i = 0; i < (stats.bullets ?? 1); i++) {
          const offset = ((i - ((stats.bullets ?? 1) - 1) / 2) * (stats.spacing ?? 0));
          bulletsRef.current.push({
            id: nextId.current++,
            x: tipX + offset,
            y: tipY,
            vx: Math.cos(ship.angle) * (stats.speed! + power * 300),
            vy: Math.sin(ship.angle) * (stats.speed! + power * 300),
            size: (stats.size ?? 8) + power * 6,
            type: id as WeaponId,
            trail: [],
            particles: [],
            life: (stats.life ?? 1.2) + power * 0.4,
            maxLife: (stats.life ?? 1.2) + power * 0.4,
            charge: power,
            phase: 1,
            baseAngle: ship.angle,
            length: (stats.length ?? 30) + power * 20,
          });
        }
      }
    },
  };
}

function createShotgun({ id, stats }: { id: string; stats: WeaponLevelStats }): Weapon {
  return {
    id: id as WeaponId,
    fire({ ship, bulletsRef, nextId, keys, charge }) {
      const tipX = ship.x + Math.cos(ship.angle) * ship.r;
      const tipY = ship.y + Math.sin(ship.angle) * ship.r;

      if (charge < (stats.chargeThreshold ?? 0.5) && keys.fire && !keys.lastFire) {
        for (let i = 0; i < (stats.bullets ?? 4); i++) {
          const spread = (Math.random() - 0.5) * (stats.spread ?? 0.4);
          bulletsRef.current.push({
            id: nextId.current++,
            x: tipX,
            y: tipY,
            vx: Math.cos(ship.angle + spread) * stats.speed!,
            vy: Math.sin(ship.angle + spread) * stats.speed!,
            size: stats.size ?? 6,
            type: id as WeaponId,
            trail: [],
            life: stats.life ?? 0.4,   // <<< shorter life for close range
            maxLife: stats.life ?? 0.4,
            charge: 0,
            phase: 1,
            baseAngle: ship.angle,
            generation: 0,              // <<< main bullet generation
          });
        }
      }
    },
  };
}
function createLaser({ id, stats }: { id: string; stats: WeaponLevelStats }): Weapon {
  return {
    id: id as WeaponId,

    fire({ ship, bulletsRef, nextId, keys }) {
      const tipX = ship.x + Math.cos(ship.angle) * ship.r;
      const tipY = ship.y + Math.sin(ship.angle) * ship.r;

      // Check if a laser of this type already exists
      let laser = bulletsRef.current.find(b => b.type === id);

      if (!laser) {
        laser = {
          id: nextId.current++,
          type: id as WeaponId,
          x: tipX,
          y: tipY,
          vx: 0,
          vy: 0,
          size: stats.size ?? 4,
          baseAngle: ship.angle,
          isFiring: false,
          charge: 1,                        // full charge to start
          chargeDrainRate: stats.chargeDrainRate ?? 0.3,
          brightness: stats.brightness ?? 1,
          flickerIntensity: stats.flicker ?? 0.3,
          maxLength: stats.length ?? 2000,   // always starts fully extended
          particles: [],
          trail: [],
        };

        bulletsRef.current.push(laser);
      }

      // Only fire while holding down
      laser.isFiring = keys.fire && laser.charge! > 0;

      // Update laser position and rotation to follow ship
      laser.x = tipX;
      laser.y = tipY;
      laser.baseAngle = ship.angle;

      // Drain charge if firing
      if (laser.isFiring) {
        laser.charge! -= laser.chargeDrainRate! * (1 / 60); // assuming 60 FPS; or pass dt if you have it
        if (laser.charge! < 0) laser.charge = 0;
      }
    },
  };
}
// ===========================
// 2️⃣ Modular Weapon Factory
// ===========================
function createWeaponLevel(templateId: WeaponId, level: number): Weapon {
  const template = weaponDefinitions.find(w => w.id === templateId);
  if (!template) throw new Error("Weapon template not found");

  const stats = template.levels[level - 1]; // levels are 1-indexed
  if (!stats) throw new Error("Weapon level not defined");

  switch (template.type) {
    case "BLASTER":
      return createBlaster({ id: template.id, stats });
    case "SHOTGUN":
      return createShotgun({ id: template.id, stats });
    case "LASER":
      return createLaser({ id: template.id, stats });
    default:
      return { id: template.id, fire() {} };
  }
}

//--------------------------------------------------------------------------------------------------//
//--------ship draw with enhanced thruster particles and wings------//
let shipTrail: { x:number, y:number, angle:number, life:number }[] = [];
let shipParticles: {x:number, y:number, vx:number, vy:number, size:number, life:number, length:number, type:string}[] = [];

function drawShip(ctx: CanvasRenderingContext2D, ship: Ship, dt: number) {
  ctx.save();

  // ---- speed & turning for stretch/wing tilt ----
  const speed = Math.sqrt(ship.vx**2 + ship.vy**2);
  const angularVel = ship.vx * 1; // rough turning factor
  const stretchX = 1 + speed*0.0015;
  const stretchY = 1 - speed*0.0008;
  ctx.translate(ship.x, ship.y);
  ctx.rotate(ship.angle);
  ctx.scale(stretchX, stretchY);

  // ---- main body ----
  const bodyGrad = ctx.createLinearGradient(-ship.r*0.7,0,ship.r,0);
  bodyGrad.addColorStop(0, "black");
  bodyGrad.addColorStop(0.7, "orange");
  ctx.fillStyle = bodyGrad;
  ctx.beginPath();
  ctx.moveTo(ship.r,0);
  ctx.lineTo(-ship.r*0.7, ship.r*0.5);
  ctx.lineTo(-ship.r*0.7, -ship.r*0.5);
  ctx.closePath();
  ctx.fill();

  // ---- wings (flexing like a real plane) ----
  const wingTilt = Math.min(Math.max(speed*0.004 + angularVel*0.02, -0.6), 0.6); // tilt when turning
  const wingLength = ship.r * 0.8;
  const wingWidth = ship.r * 0.25;

  const drawWing = (side: 1 | -1) => {
    ctx.save();
    ctx.translate(-ship.r*0.1,0);
    ctx.rotate(wingTilt * side); // left=-1, right=1
    ctx.beginPath();
    ctx.moveTo(0,0);
    ctx.lineTo(-wingLength*0.8, -wingWidth*0.5); // upper tip
    ctx.lineTo(-wingLength, -wingWidth*0.2);     // outer tip
    ctx.lineTo(-wingLength, wingWidth*0.2);      // bottom outer tip
    ctx.lineTo(-wingLength*0.8, wingWidth*0.5);  // inner bottom
    ctx.closePath();
    const wingGrad = ctx.createLinearGradient(-wingLength, 0, 0, 0);
    wingGrad.addColorStop(0, `rgba(17, 15, 12, 0.8)`);
    wingGrad.addColorStop(1, `rgba(238, 225, 206, 0.6)`);
    ctx.fillStyle = wingGrad;
    ctx.fill();

    // optional: wing tip flare
    ctx.beginPath();
    ctx.arc(-wingLength, 0, wingWidth*0.5, 0, Math.PI*2);
    ctx.fillStyle = "rgba(244, 241, 236, 0.7)";
    ctx.fill();

    ctx.restore();
  };

  drawWing(-1); // left wing
  drawWing(1);  // right wing

  ctx.restore(); // restore main ship transform

  // ---- motion trail (speed lines) ----
  shipTrail.push({ x: ship.x, y: ship.y, angle: ship.angle, life: 0.4 });
  if (shipTrail.length > 10) shipTrail.shift();
  shipTrail.forEach((p,i)=>{
    const alpha = p.life * 0.4;
    const trailLength = 0.2 + speed*0.35;
    ctx.save();
    ctx.translate(p.x,p.y);
    ctx.rotate(p.angle);
    ctx.globalAlpha = alpha;
    ctx.fillStyle = "rgba(81, 54, 7, 0.7)";
    ctx.beginPath();
    ctx.moveTo(0,0);
    ctx.lineTo(-trailLength, trailLength*0.35);
    ctx.lineTo(-trailLength, -trailLength*0.35);
    ctx.closePath();
    ctx.fill();
    ctx.restore();
    p.life -= dt*0.6;
  });
  ctx.globalAlpha = 1;

  // ---- thruster flames ----
  if(speed>0.5){
    for(let i=0;i<2;i++){
      const flameAngle = ship.angle + Math.PI + (Math.random()-0.5)*0.3;
      const flameLength = 2 + Math.random()*2 + speed*0.1;
      const flameWidth = 3 + Math.random()*1.5;
      shipParticles.push({
        x: ship.x - Math.cos(ship.angle)*ship.r,
        y: ship.y - Math.sin(ship.angle)*ship.r,
        vx: Math.cos(flameAngle)*(50 + Math.random()*50),
        vy: Math.sin(flameAngle)*(50 + Math.random()*50),
        size: flameWidth,
        life: 0.10 + Math.random()*0.1,
        length: flameLength,
        type:"flame"
      });
    }
  }

  // ---- draw flames ----
  shipParticles.forEach((p,i)=>{
    if(p.type==="flame"){
      ctx.save();
      ctx.translate(p.x,p.y);
      ctx.rotate(Math.atan2(p.vy,p.vx));
      const grad = ctx.createLinearGradient(0,0,p.length,0);
      grad.addColorStop(0,"rgb(236, 122, 16)");
      grad.addColorStop(0.5,"rgba(171, 95, 24, 0.7)");
      grad.addColorStop(1,"rgba(255,80,0,0)");
      ctx.fillStyle = grad;
      ctx.beginPath();
      ctx.moveTo(0,-p.size*0.5);
      ctx.lineTo(p.length,0);
      ctx.lineTo(0,p.size*0.5);
      ctx.closePath();
      ctx.fill();
      ctx.restore();

      p.life -= dt;
      p.x += p.vx*dt;
      p.y += p.vy*dt;
      if(p.life<=0) shipParticles.splice(i,1);
    }
  });
}
//============================================================================================================================================================== //
// UI SCREENS // Functions //
//============================================================================================================================================================== //


function StartScreen({ onStart }: { onStart: () => void }) {
  return (
    <div className="absolute inset-0 flex flex-col items-center justify-center text-white">
      <h1 className="text-4xl font-bold mb-6">STARDRIFT</h1>
      <button
        className="px-6 py-3 bg-indigo-600 rounded-lg hover:bg-indigo-500"
        onClick={onStart}
      >
        Start Run
      </button>
    </div>
  );
}

function WeaponSelectScreen({
  onSelect,
}: {
  onSelect: (id: WeaponId, level: number) => void;
}) {
  const [level, setLevel] = useState(1);

  return (
    <div className="absolute inset-0 flex flex-col items-center justify-center text-white">
      <h2 className="text-3xl font-bold mb-4">Choose Your Weapon</h2>

      <div className="grid grid-cols-2 gap-4 mb-4">
        {WEAPON_LIST.map((id) => (
          <button
            key={id}
            className="p-4 bg-gray-800 rounded-lg hover:bg-gray-700 text-left"
            onClick={() => onSelect(id, level)} // Pass level here
          >
            {id}
          </button>
        ))}
      </div>

      {/* Level selector */}
      <div className="flex gap-2 mt-2">
        {[1, 2, 3, 4].map((lvl) => (
          <button
            key={lvl}
            className={`px-3 py-1 rounded ${
              lvl === level ? "bg-indigo-600" : "bg-gray-700 hover:bg-gray-600"
            }`}
            onClick={() => setLevel(lvl)}
          >
            Level {lvl}
          </button>
        ))}
      </div>
    </div>
  );
}

//============================================================================================================================================================== //
  // MAIN GAME COMPONENT //
//============================================================================================================================================================== //

 type UIMode = "START" | "WEAPON_SELECT" | "PLAY";

export default function Dodgefield() {
  const [uiMode, setUiMode] = useState<UIMode>("START");

  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const shipRef = useRef<Ship>({
    x: 400,
    y: 300,
    vx: 0,
    vy: 0,
    r: 20,
    angle: -Math.PI / 2,
  });
  const keysRef = useRef({
    up: false,
    down: false,
    left: false,
    right: false,
    fire: false,
    lastFire: false,
  });
  const bulletsRef = useRef<Bullet[]>([]);
  const nextBulletId = useRef(1);
  const [weapon, setWeapon] = useState<Weapon | null>(null);
  const chargeRef = useRef(0);

  
  // --- Enemy / Level state ---
const [level, setLevel] = useState(1);
const enemiesRef = useRef<Enemy[]>([]);
const nextEnemyId = useRef(1);

const canvasWidth = 800; // or get it dynamically
const canvasHeight = 600;

// ----------------------------------------
// Wave Spawning
// ----------------------------------------
function startNextWave(canvasWidth: number) {
  const newEnemies: Enemy[] = [];

  // spawn only one enemy for now
  newEnemies.push(spawnEnemy(nextEnemyId, canvasWidth));

  enemiesRef.current = newEnemies;
}

// Start the first wave only
useEffect(() => {
  startNextWave(canvasWidth);
}, []);
//============================================================================================================================================================== //
  // START / WEAPON HANDLERS//
 //============================================================================================================================================================== //
  const startRun = () => setUiMode("WEAPON_SELECT");
const selectWeapon = (id: WeaponId, level: number) => {
  bulletsRef.current = [];
  nextBulletId.current = 1;

  // create weapon using selected level
  setWeapon(createWeaponLevel(id, level));

  setUiMode("PLAY");
};

  //============================================================================================================================================================== //
  // KEYBOARD INPUT//
 //============================================================================================================================================================== //
  useEffect(() => {
    const down = (e: KeyboardEvent) => {
      const k = keysRef.current;
      switch (e.key.toLowerCase()) {
        case "w": k.up = true; break;
        case "s": k.down = true; break;
        case "a": k.left = true; break;
        case "d": k.right = true; break;
        case " ": k.fire = true; break;
      }
      if (["w","a","s","d"," "].includes(e.key.toLowerCase())) e.preventDefault();
    };
    const up = (e: KeyboardEvent) => {
      const k = keysRef.current;
      switch (e.key.toLowerCase()) {
        case "w": k.up = false; break;
        case "s": k.down = false; break;
        case "a": k.left = false; break;
        case "d": k.right = false; break;
        case " ": k.fire = false; break;
      }
      if (["w","a","s","d"," "].includes(e.key.toLowerCase())) e.preventDefault();
    };
    window.addEventListener("keydown", down);
    window.addEventListener("keyup", up);
    return () => {
      window.removeEventListener("keydown", down);
      window.removeEventListener("keyup", up);
    };
  }, []);

 //============================================================================================================================================================== //
  // GAME LOOP
  //============================================================================================================================================================== //
  useEffect(() => {

  const canvas = canvasRef.current;
  if (!canvas) return;
  const ctx = canvas.getContext("2d");
  if (!ctx) return;

function initStars(canvasWidth: number, canvasHeight: number) {
  stars.length = 0;
  for (let i = 0; i < STAR_COUNT; i++) {
    stars.push({
      x: Math.random() * canvasWidth,
      y: Math.random() * canvasHeight,
      radius: Math.random() * 1.2 + 0.3,
      brightness: Math.random(),
      twinkleSpeed: Math.random() * 0.02 + 0.01,
      speed: Math.random() * 0.02, // subtle downward drift
    });
  }
}
// call after setting canvas size
initStars(canvas.width, canvas.height);

const resize = () => {
  canvas.width = Math.max(720, window.innerWidth);
  canvas.height = Math.max(520, window.innerHeight);
  initStars(canvas.width, canvas.height); // re-init stars
};

  resize();
  window.addEventListener("resize", resize);

  

  let lastT = performance.now();
  let animationId: number;

//-----main game tick-----------------//

  const tick = (tms: number) => {

    const dt = (tms - lastT) / 1000;
    lastT = tms;

    ctx.clearRect(0, 0, canvas.width, canvas.height);

// In tick loop
if (enemiesRef.current.length === 0) {
  setLevel(prev => prev + 1);
  startNextWave(canvas.width);
}

  if (uiMode as string !== "PLAY") {
  animationId = requestAnimationFrame(tick);
  return;
}

    const ship = shipRef.current;
    const k = keysRef.current;


   //============================================================================================================================================================== //
    // MOVEMENT
    //============================================================================================================================================================== //
    const THRUST = 600;
    const ROT_SPEED = 3;
    const FRICTION = 0.95;

    if (k.left) ship.angle -= ROT_SPEED * dt;
    if (k.right) ship.angle += ROT_SPEED * dt;
    if (k.up) {
      ship.vx += Math.cos(ship.angle) * THRUST * dt;
      ship.vy += Math.sin(ship.angle) * THRUST * dt;
    }
    if (k.down) {
      ship.vx -= Math.cos(ship.angle) * THRUST * dt;
      ship.vy -= Math.sin(ship.angle) * THRUST * dt;
    }

    ship.x += ship.vx * dt;
    ship.y += ship.vy * dt;
    ship.vx *= FRICTION;
    ship.vy *= FRICTION;

    ship.x = Math.max(ship.r, Math.min(canvas.width - ship.r, ship.x));
    ship.y = Math.max(ship.r, Math.min(canvas.height - ship.r, ship.y));

    function drawStars(
      ctx: CanvasRenderingContext2D,
      dt: number,
      canvasWidth: number,
      canvasHeight: number
    ) {
      stars.forEach((s) => {
        s.brightness += (Math.random() - 0.5) * s.twinkleSpeed * 1.5;
        s.brightness = Math.max(0.2, Math.min(1, s.brightness));

        ctx.globalAlpha = s.brightness;
        ctx.fillStyle = "white";
        ctx.beginPath();
        ctx.arc(s.x, s.y, s.radius, 0, Math.PI * 2);
        ctx.fill();

        if (s.speed) {
          s.y += s.speed * dt * 60;
          if (s.y > canvasHeight) s.y = 0;
        }
      });

      ctx.globalAlpha = 1;
    }

    drawStars(ctx, dt, canvas.width, canvas.height);
    drawShip(ctx, ship, dt);

//=================================================================================================//
// FIRE / CHARGE HANDLING
//================================================================================================//

const HOLD_THRESHOLD = 0.15;

//------------------------------------------------//
// 1. HANDLE BUTTON HELD
//------------------------------------------------//
if (k.fire) {

  // increase charge time
  chargeRef.current += dt;

  // quick tap shot
  const isTapShot = chargeRef.current < HOLD_THRESHOLD && !k.lastFire;

  if (isTapShot) {
    weapon?.fire({
      ship,
      bulletsRef,
      nextId: nextBulletId,
      keys: k,
      charge: 0,
      dt,
    });
  }

}

//------------------------------------------------//
// 2. HANDLE BUTTON RELEASE
//------------------------------------------------//
else if (chargeRef.current > 0) {

  const chargeAmount = chargeRef.current;

  weapon?.fire({
    ship,
    bulletsRef,
    nextId: nextBulletId,
    keys: k,
    charge: chargeAmount,
    dt,
  });

  chargeRef.current = 0;
}

//------------------------------------------------//
// 3. STORE LAST FRAME INPUT
//------------------------------------------------//
k.lastFire = k.fire;

//=================================================================================================//
// BULLET UPDATE LOOP
//================================================================================================//
const updatedBullets: Bullet[] = [];

for (const b of bulletsRef.current) {
  // trail
  b.trail.push({ x: b.x, y: b.y, life: 1 });
  if (b.trail.length > 10) b.trail.shift();

  // drag
  if (b.drag) {
    const dragFactor = Math.max(0, 1 - b.drag * dt);
    b.vx *= dragFactor;
    b.vy *= dragFactor;
  }

  // default movement for non-laser bullets
  if (b.type !== "LASER") {
    b.x += b.vx * dt;
    b.y += b.vy * dt;
  }

  let keepBullet = true;

  switch (b.type) {
    case "BLASTER":
      keepBullet = updateBlaster(b, dt);
      break;

    case "SHOTGUN":
      keepBullet = updateShotgun(b, dt, updatedBullets, nextBulletId);
      break;

    case "LASER":
      updateLaser(b, dt, ship, keysRef.current);
      keepBullet = true;
      break;

    case "BLACKHOLE":
      updateBlackhole(b, dt);
      keepBullet = true;
      break;

    case "SEEKER":
      updateSeeker(b, dt);
      keepBullet = true;
      break;

    case "ENEMY":
      if (b.life !== undefined) b.life -= dt;
      keepBullet = b.life === undefined || b.life > 0;
      break;
  }

  if (keepBullet) {
    updatedBullets.push(b);
  }
}

bulletsRef.current = updatedBullets;
bulletsRef.current = bulletsRef.current.filter((b) => {
  const inBounds =
    b.type === "LASER" ||
    (b.x >= -50 &&
      b.x <= canvas.width + 50 &&
      b.y >= -50 &&
      b.y <= canvas.height + 50);

  const alive = b.life === undefined || b.life > 0;

  return inBounds && alive;
});

// ============================
// UPDATE ENEMIES
// ============================
enemiesRef.current.forEach((enemy) => {
  updateEnemy(
    enemy,
    shipRef.current,
    dt,
    bulletsRef,
    nextBulletId,
    canvas.width,
    canvas.height
  );
});

// Remove dead enemies and keep them in-bounds
enemiesRef.current = enemiesRef.current.filter(
  (e) => e.health > 0 && e.y < canvas.height + 60 && e.x > -60 && e.x < canvas.width + 60
);

// Spawn next wave if none left
if (enemiesRef.current.length === 0) {
  setLevel((prev) => prev + 1);
  startNextWave(canvas.width);
}
//--------------------------------------------------------------------------------------------------//
//-------------------------------bullet update bellow-----------------------------------------------//

//------blaster update----//
function updateBlaster(b: Bullet, dt: number): boolean {
  if (!b.particles) b.particles = [];

  const angle = Math.atan2(b.vy, b.vx);

  for (let i = 0; i < 3; i++) {
    b.particles.push({
      x: b.x,
      y: b.y,
      vx: -Math.cos(angle) * (30 + Math.random() * 20),
      vy: -Math.sin(angle) * (30 + Math.random() * 20),
      size: Math.random() * 2 + 1,
      life: 0.3,
      alpha: 1,
    });
  }

  b.particles.forEach((p) => {
    p.life -= dt;
    p.x += p.vx * dt;
    p.y += p.vy * dt;
    p.alpha = Math.max(0, p.life / 0.3);
  });

  b.particles = b.particles.filter((p) => p.life > 0);

  if (b.life === undefined) b.life = 0.2;
  b.life -= dt;

  return b.life > 0;
}
//---------------------------------------------------------------------------------------------------//
//-------shotgun update----//
function updateShotgun(
  b: Bullet,
  dt: number,
  updatedBullets: Bullet[],
  nextBulletId: React.MutableRefObject<number>
): boolean {
  if (b.life !== undefined) b.life -= dt;

  if (b.particles) {
    b.particles.forEach((p) => {
      p.life -= dt;
      p.x += p.vx * dt;
      p.y += p.vy * dt;
      p.alpha = Math.max(0, p.life / 0.4);
    });
    b.particles = b.particles.filter((p) => p.life > 0);
  }

  if (!b.fragmented && b.life !== undefined && b.life <= 0) {
    b.fragmented = true;

    const maxGenerations = 1;
    const currentGen = b.generation ?? 0;

    if (currentGen < maxGenerations) {
      for (let i = 0; i < 3; i++) {
        const angle = Math.atan2(b.vy, b.vx) + (Math.random() - 0.5) * 0.6;
        const speed = 200;

        const frag: Bullet = {
          id: nextBulletId.current++,
          x: b.x,
          y: b.y,
          vx: Math.cos(angle) * speed,
          vy: Math.sin(angle) * speed,
          size: b.size * 0.6,
          type: "SHOTGUN",
          trail: [],
          life: 0.5,
          maxLife: 0.5,
          drag: 2,
          generation: currentGen + 1,
          phase: 1,
          particles: [],
        };

        for (let j = 0; j < 3; j++) {
          const pAngle = Math.random() * Math.PI * 2;
          const pSpeed = Math.random() * 50 + 30;
          frag.particles!.push({
            x: frag.x,
            y: frag.y,
            vx: Math.cos(pAngle) * pSpeed,
            vy: Math.sin(pAngle) * pSpeed,
            size: Math.random() * 2 + 1,
            life: 0.4,
            alpha: 1,
          });
        }

        updatedBullets.push(frag);
      }
    }
  }

  return b.life === undefined || b.life > 0;
}
//------------------------------------------------------------------------------------------------------//
//--------laser update-----//
function updateLaser(
  b: Bullet,
  dt: number,
  ship: Ship,
  keys: { fire: boolean }
) {
  b.x = ship.x + Math.cos(ship.angle) * ship.r;
  b.y = ship.y + Math.sin(ship.angle) * ship.r;
  b.baseAngle = ship.angle;

  if (b.charge === undefined) b.charge = 1;
  if (b.chargeDrainRate === undefined) b.chargeDrainRate = 0.3;
  if (b.brightness === undefined) b.brightness = 1;
  if (b.length === undefined) b.length = 60;
  if (b.maxLength === undefined) b.maxLength = 600;
  if (b.flickerTimer === undefined) b.flickerTimer = 0;
  if (b.rechargeTimer === undefined) b.rechargeTimer = 0;
  if (!b.particles) b.particles = [];

  if (b.rechargeTimer > 0) {
    b.rechargeTimer -= dt;
    if (b.rechargeTimer <= 0) {
      b.rechargeTimer = 0;
      b.charge = 1;
    }
    b.isFiring = false;
    b.length = Math.max(0, b.length - 220 * dt);
    return;
  }

  if (keys.fire && b.charge > 0) {
    b.isFiring = true;
    b.length = Math.min(b.maxLength, b.length + 500 * dt);

    b.charge -= b.chargeDrainRate * dt;
    if (b.charge <= 0) {
      b.charge = 0;
      b.isFiring = false;
      b.rechargeTimer = 3;
    }
  } else {
    b.isFiring = false;
    b.length = Math.max(0, b.length - 300 * dt);
  }

  b.flickerTimer += dt;
}
//-----------------------------------------------------------------------------------------------------//
//-----------blackhole update-------//
function updateBlackhole(b: Bullet, dt: number) {
  // TODO: add gravity pull or area effect
}
//----------------------------------------------------------------------------------------------------//
//---------seeker update-------//
function updateSeeker(b: Bullet, dt: number) {
  // TODO: add enemy tracking / homing behavior
}

 //======================================================================
// BULLET DRAW LOOP
//======================================================================
bulletsRef.current.forEach((b) => {
  switch (b.type) {
    case "BLASTER":
      drawBlaster(ctx, b);
      break;

    case "SHOTGUN":
      drawShotgun(ctx, b);
      break;

    case "LASER":
      drawLaser(ctx, b, shipRef.current);
      break;

    case "BLACKHOLE":
      drawBlackhole(ctx, b);
      break;

    case "SEEKER":
      drawSeeker(ctx, b);
      break;

    case "ENEMY":
      ctx.save();
      ctx.fillStyle = "red";
      ctx.beginPath();
      ctx.arc(b.x, b.y, b.size, 0, Math.PI * 2);
      ctx.fill();
      ctx.restore();
      break;
  }
});

// draw enemies
enemiesRef.current.forEach(enemy => {
  drawEnemy(ctx, enemy, shipRef.current, dt);
});


//---------------------------------------------------------------------------------------------------//
//------------------------------weapon draw below---------------------------------------------------//
//-----blaster draw------//
function drawBlaster(ctx: CanvasRenderingContext2D, b: Bullet) {
  ctx.save();

  // --- Draw glowing particles ---
  if (b.particles) {
    b.particles.forEach(p => {
      ctx.globalAlpha = p.alpha * 0.6;   // softer glow
      ctx.fillStyle = "cyan";            // glowing blaster color
      ctx.beginPath();
      ctx.arc(p.x, p.y, p.size * 1.5, 0, Math.PI * 2);
      ctx.fill();
    });
  }

  ctx.translate(b.x, b.y);

  if (b.phase === 1) {
    const width = (b.size ?? 4) * 2.5;
    const stretch = (b.length ?? 30) * 0.08;
    ctx.rotate(b.baseAngle ?? 0);

    // Main bullet
    ctx.fillStyle = "white";
    ctx.beginPath();
    ctx.ellipse(0, 0, width, stretch, 0, 0, Math.PI * 2);
    ctx.fill();

    // Glow
    ctx.globalAlpha = 0.6;
    ctx.fillStyle = "yellow";
    ctx.beginPath();
    ctx.ellipse(0, 0, width * 1.2, stretch * 1.1, 0, 0, Math.PI * 2);
    ctx.fill();

    ctx.globalAlpha = 1;
  } else {
    ctx.fillStyle = "yellow";
    ctx.beginPath();
    ctx.arc(0, 0, b.size ?? 4, 0, Math.PI * 2);
    ctx.fill();
  }

  ctx.restore();
}
//--------------------------------------------------------------------------------------------------//
//------shotgun draw------//
//================================================================//
//---------SHOTGUN BULLET DRAW (POLISHED)-----------------------------------//
//---------SHOTGUN BULLET DRAW (DUAL COLOR POLISH)-----------------------------------//
//---------SHOTGUN BULLET DRAW (UPGRADED POLISH)-----------------------------------//
function drawShotgun(ctx: CanvasRenderingContext2D, b: Bullet) {
  if (b.life !== undefined && b.life <= 0) return;

  ctx.save();
  const charge = b.charge ?? 0;
  const alpha = b.life && b.maxLife ? b.life / b.maxLife : 1;

  // --- Particle trail (cyan glow) ---
  if (b.particles) {
    b.particles.forEach(p => {
      ctx.save();
      ctx.globalAlpha = p.alpha * alpha;
      const grad = ctx.createRadialGradient(p.x, p.y, 0, p.x, p.y, p.size * 4);
      grad.addColorStop(0, "rgb(72, 4, 106)");  // cyan core
      grad.addColorStop(0.4, "rgba(16, 55, 197, 0.6)");
      grad.addColorStop(1, "rgba(0, 69, 142, 0)");
      ctx.fillStyle = grad;

      ctx.beginPath();
      ctx.arc(p.x, p.y, p.size * 2.5, 0, Math.PI * 2);
      ctx.fill();
      ctx.restore();
    });
  }

  // --- Main bullet core with gradient ---
  ctx.globalAlpha = alpha;
  const bulletGrad = ctx.createRadialGradient(b.x, b.y, 0, b.x, b.y, b.size);
  bulletGrad.addColorStop(0, "rgba(206, 129, 15, 0.52)");   // bright inner
  bulletGrad.addColorStop(0.5, "rgba(214, 146, 27, 0.8)"); 
  bulletGrad.addColorStop(1, "rgba(170, 47, 179, 0.5)");  // darker edges
  ctx.fillStyle = bulletGrad;
  ctx.beginPath();
  ctx.arc(b.x, b.y, b.size, 0, Math.PI * 2);
  ctx.fill();

  // --- subtle outer halo for “glow” ---
  ctx.globalAlpha = 0.25 * alpha + 0.2 * charge;
  const haloGrad = ctx.createRadialGradient(b.x, b.y, b.size, b.x, b.y, b.size * 2);
  haloGrad.addColorStop(0, "rgba(159, 17, 191, 0.3)");
  haloGrad.addColorStop(0.5, "rgba(255, 40, 234, 0.15)");
  haloGrad.addColorStop(1, "rgba(255, 20, 220, 0)");
  ctx.fillStyle = haloGrad;
  ctx.beginPath();
  ctx.arc(b.x, b.y, b.size * 2, 0, Math.PI * 2);
  ctx.fill();

  // --- subtle trailing spikes for impact feel ---
  ctx.globalAlpha = 0.15 * alpha + 0.1 * charge;
  for (let i = 0; i < 2; i++) {
    const angle = Math.random() * Math.PI * 2;
    const len = Math.random() * b.size * 0.8 + b.size * 0.5;
    ctx.strokeStyle = `rgba(255,150,50,${ctx.globalAlpha})`;
    ctx.beginPath();
    ctx.moveTo(b.x, b.y);
    ctx.lineTo(b.x + Math.cos(angle) * len, b.y + Math.sin(angle) * len);
    ctx.stroke();
  }

  // --- subtle flicker / shimmer ---
  const flicker = Math.random() * 0.1;
  ctx.globalAlpha = flicker;
  ctx.fillStyle = "yellow";
  ctx.beginPath();
  ctx.arc(
    b.x + (Math.random() - 0.5) * b.size * 0.6,
    b.y + (Math.random() - 0.5) * b.size * 0.6,
    b.size * 0.4,
    0,
    Math.PI * 2
  );
  ctx.fill();

  ctx.globalAlpha = 1;
  ctx.restore();
}
//---------------------------------------------------------------------------------------------------//

//--------------------------------------------------------------------------------------------------//
//---------LASER DRAW (POLISHED / SOULFUL)-------------------//
function drawLaser(ctx: CanvasRenderingContext2D, b: Bullet, ship?: Ship) {
  if (!b.isFiring) return;

  // Keep a trail history for plasma smear
  if (!b.trail) b.trail = [];
  const trailMax = 6; // how many previous points to smear
if (!b.trail) b.trail = [];
b.trail.push({ x: b.x, y: b.y, life: 0.1 }); // life = how long this trail piece persists
  if (b.trail.length > trailMax) b.trail.shift();

  ctx.save();
  ctx.translate(b.x, b.y);
  ctx.rotate(b.baseAngle ?? 0);

  const charge = b.charge ?? 1;
  const brightness = b.brightness ?? 1;
  const baseWidth = b.size ?? 4;
  const maxLength = b.maxLength ?? 2000;
  const beamLength = maxLength * charge;
  const beamWidth = baseWidth * (0.5 + 0.5 * charge);

  // ===============================
  // PLASMA SMEAR TRAIL
  // ===============================
  for (let i = 0; i < b.trail.length; i++) {
    const t = b.trail[i];
    const alpha = (i+1)/b.trail.length * 0.2 * charge;
    const smearGrad = ctx.createLinearGradient(0, -beamWidth, beamLength, beamWidth);
    smearGrad.addColorStop(0, `rgba(255,120,120,${alpha})`);
    smearGrad.addColorStop(0.5, `rgba(255,80,80,${alpha*0.6})`);
    smearGrad.addColorStop(1, `rgba(255,60,60,0)`);
    ctx.fillStyle = smearGrad;
    ctx.fillRect(0, -beamWidth*0.25, beamLength, beamWidth*0.5);
  }

  // ===============================
  // HEAT DISTORTION / WOBBLE
  // ===============================
  let wobble = 0;
  if (ship) {
    const speed = Math.sqrt(ship.vx**2 + ship.vy**2);
    wobble = Math.sin(Date.now()*0.02 + b.x*0.01)*beamWidth*0.2*charge;
    wobble += (Math.random()-0.5)*0.5; // jitter
    wobble += speed*0.002;
  }

  // ===============================
  // INNER CORE + MAIN BEAM
  // ===============================
  const coreGrad = ctx.createLinearGradient(0, -beamWidth, beamLength, beamWidth);
  coreGrad.addColorStop(0, `rgba(255,255,255,${0.8*charge})`);
  coreGrad.addColorStop(0.3, `rgba(255,255,200,${0.6*charge})`);
  coreGrad.addColorStop(0.7, `rgba(255,180,180,${0.4*charge})`);
  coreGrad.addColorStop(1, `rgba(255,120,120,0)`);
  ctx.fillStyle = coreGrad;
  ctx.fillRect(0, -beamWidth*0.25 + wobble, beamLength, beamWidth*0.5);

  // Main red glow
  ctx.fillStyle = `rgba(255,60,60,${0.3*charge})`;
  ctx.fillRect(0, -beamWidth/2 + wobble, beamLength, beamWidth);

  // ===============================
  // MUZZLE FLASH / TIP PULSE
  // ===============================
  const flashSize = beamWidth*(1.5 + Math.random());
  const pulse = Math.sin(Date.now()*0.05)*0.2 + 0.8;
  const flashGrad = ctx.createRadialGradient(0,0,0,0,0,flashSize);
  flashGrad.addColorStop(0, `rgba(255,255,255,${0.8*charge*pulse})`);
  flashGrad.addColorStop(0.5, `rgba(255,220,220,${0.5*charge*pulse})`);
  flashGrad.addColorStop(1, `rgba(255,180,180,0)`);
  ctx.fillStyle = flashGrad;
  ctx.beginPath();
  ctx.arc(0,0,flashSize,0,Math.PI*2);
  ctx.fill();

  // ===============================
  // CRACKLING ELECTRICITY
  // ===============================
  const arcs = 3; // number of arcs along beam
  for (let i=0;i<arcs;i++) {
    const startX = Math.random()*beamLength;
    const startY = (Math.random()-0.5)*beamWidth;
    ctx.strokeStyle = `rgba(255,50,50,${0.6*charge})`;
    ctx.lineWidth = 1;
    ctx.beginPath();
    ctx.moveTo(startX, startY);
    let segments = 4 + Math.floor(Math.random()*3);
    let x = startX, y = startY;
    for (let s=0;s<segments;s++) {
      x += Math.random()*20;
      y += (Math.random()-0.5)*beamWidth*0.5;
      ctx.lineTo(x,y);
    }
    ctx.stroke();
  }

 // inside drawLaser, after the main beam and core are drawn
if (!b.particles) b.particles = [];

// ===============================
// FALLING SPARK PARTICLES
// ===============================
const fallParticleCount = Math.floor(2 + 4 * (b.charge ?? 1));
for (let i = 0; i < fallParticleCount; i++) {
  const beamLength = (b.maxLength ?? 2000) * (b.charge ?? 1);

  // spawn along the beam
  const posX = Math.random() * beamLength;
  const posY = (Math.random() - 0.5) * ((b.size ?? 4) * 4); // spread vertically along beam

  b.particles.push({
    x: posX,
    y: posY,
    vx: (Math.random() - 0.5) * 20, // slight horizontal drift
    vy: 50 + Math.random() * 50,    // falling down
    size: Math.random() * 2 + 1,
    life: 0.3 + Math.random() * 0.2,
    alpha: 0.7 + Math.random() * 0.3,
  });
}

// ===============================
// DRAW PARTICLES
// ===============================
b.particles.forEach(p => {
  ctx.globalAlpha = p.alpha;
  const grad = ctx.createRadialGradient(p.x, p.y, 0, p.x, p.y, p.size * 2);
  grad.addColorStop(0, "rgba(255,180,180,1)");
  grad.addColorStop(1, "rgba(255,100,100,0)");
  ctx.fillStyle = grad;
  ctx.beginPath();
  ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
  ctx.fill();

  // Update motion
  p.x += p.vx * dt;
  p.y += p.vy * dt;
  p.alpha *= 0.92;
  p.life! -= dt;
});

// remove dead particles
b.particles = b.particles.filter(p => p.life! > 0);
  ctx.globalAlpha = 1;
  ctx.restore();
}
//--------------------------------------------------------------------------------------------------//
//-------blackhole draw------//
function drawBlackhole(ctx: CanvasRenderingContext2D, b: Bullet) {
  ctx.save();
  ctx.fillStyle = "purple";
  ctx.beginPath();
  ctx.arc(b.x, b.y, b.size * 2, 0, Math.PI * 2);
  ctx.fill();
  ctx.restore();
}
//-------------------------------------------------------------------------------------------------//
//--------seeker draw--------//
function drawSeeker(ctx: CanvasRenderingContext2D, b: Bullet) {
  ctx.save();
  ctx.fillStyle = "green";
  ctx.beginPath();
  ctx.arc(b.x, b.y, b.size, 0, Math.PI * 2);
  ctx.fill();
  ctx.restore();
}
//--------------------------------------------------------------------------------------------------//


    animationId = requestAnimationFrame(tick);
  };

  animationId = requestAnimationFrame(tick);

  return () => {
    window.removeEventListener("resize", resize);
    cancelAnimationFrame(animationId);
  };
}, [uiMode, weapon]);

  return (
    <div className="relative w-full h-full bg-black overflow-hidden">
      <canvas ref={canvasRef} style={{ width: "100%", height: "100%" }} />

      {uiMode === "START" && <StartScreen onStart={startRun} />}
     {uiMode === "WEAPON_SELECT" && (
  <WeaponSelectScreen onSelect={selectWeapon} />
)}
      {/* PLAY mode intentionally renders nothing in this div */}
    </div>
  );
}
