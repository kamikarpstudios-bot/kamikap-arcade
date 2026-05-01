// Enemy.ts
import { Bullet, Ship } from "./types";

export type EnemyType = "DRONE" | "ASTEROID";
export type EnemyBehavior = "CHASE" | "DODGE" | "PATROL";

export type Enemy = {
  id: number;
  x: number;
  y: number;
  vx: number;
  vy: number;
  size: number;
  health: number;
  fireCooldown: number;
  fireTimer: number;
  type: EnemyType;

  behavior?: EnemyBehavior;

  targetX: number;
  targetY: number;

  backOff: boolean;
};

//====================================================
// UPDATE ENEMY
//====================================================

export function updateEnemy(
  enemy: Enemy,
  ship: Ship,
  dt: number,
  bulletsRef: React.MutableRefObject<Bullet[]>,
  nextBulletId: React.MutableRefObject<number>,
  canvasWidth: number,
  canvasHeight: number
) {
  const THRUST = 300;
  const ROT_SPEED = 3;
  const FRICTION = 0.95;
  const FIRE_DISTANCE = 140;

  //--------------------------------------------------
  // FIRE TIMER
  //--------------------------------------------------
  enemy.fireTimer = (enemy.fireTimer ?? enemy.fireCooldown ?? 2) - dt;

  if (enemy.fireTimer <= 0) {
    enemy.fireTimer = enemy.fireCooldown ?? 2;
    const shootAngle = Math.atan2(ship.y - enemy.y, ship.x - enemy.x);

    bulletsRef.current.push({
      id: nextBulletId.current++,
      x: enemy.x + Math.cos(shootAngle) * enemy.size,
      y: enemy.y + Math.sin(shootAngle) * enemy.size,
      vx: Math.cos(shootAngle) * 220,
      vy: Math.sin(shootAngle) * 220,
      size: 6,
      type: "ENEMY",
      trail: [],
      life: 4,
    });
  }

  //--------------------------------------------------
  // PICK TARGET AROUND PLAYER
  //--------------------------------------------------
  if (enemy.targetX === undefined || enemy.targetY === undefined || (enemy.backOff && Math.random() < 0.02)) {
    const offset = 80 + Math.random() * 120;
    const angle = Math.random() * Math.PI * 2;

    enemy.targetX = ship.x + Math.cos(angle) * offset;
    enemy.targetY = ship.y + Math.sin(angle) * offset;

    enemy.backOff = false;
  }

  //--------------------------------------------------
  // MOVE TOWARD TARGET
  //--------------------------------------------------
  const dx = enemy.targetX - enemy.x;
  const dy = enemy.targetY - enemy.y;
  const dist = Math.sqrt(dx * dx + dy * dy);

  const desiredAngle = Math.atan2(dy, dx);
  const currentAngle = Math.atan2(enemy.vy, enemy.vx || 0);
  let angleDiff = ((desiredAngle - currentAngle + Math.PI) % (2 * Math.PI)) - Math.PI;
  const rotation = Math.sign(angleDiff) * ROT_SPEED * dt;
  const moveAngle = currentAngle + rotation;

  //--------------------------------------------------
  // BULLET DODGE
  //--------------------------------------------------
  for (const b of bulletsRef.current) {
    if (b.type !== "ENEMY") {
      const bx = b.x - enemy.x;
      const by = b.y - enemy.y;
      const bulletDist = Math.sqrt(bx * bx + by * by);

      if (bulletDist < 80) {
        const dodgeAngle = Math.atan2(by, bx) + Math.PI / 2;
        enemy.vx += Math.cos(dodgeAngle) * 200 * dt;
        enemy.vy += Math.sin(dodgeAngle) * 200 * dt;
        break; // only dodge one bullet per frame
      }
    }
  }

  //--------------------------------------------------
  // BULLET COLLISIONS
  //--------------------------------------------------
  for (let i = bulletsRef.current.length - 1; i >= 0; i--) {
    const b = bulletsRef.current[i];
    if (b.type === "ENEMY") continue; // ignore enemy bullets

    const dx = b.x - enemy.x;
    const dy = b.y - enemy.y;
    const distSq = dx * dx + dy * dy;
    const radSum = (b.size ?? 4) + enemy.size;

    if (distSq < radSum * radSum) {
      enemy.health -= 1;               // decrease health per hit
      bulletsRef.current.splice(i, 1); // remove bullet
    }
  }

  //--------------------------------------------------
  // PLAYER DISTANCE BEHAVIOR
  //--------------------------------------------------
  const TOO_CLOSE = 90;
  const IDEAL_DISTANCE = 180;

  if (dist < TOO_CLOSE) {
    enemy.targetX = enemy.x - (ship.x - enemy.x);
    enemy.targetY = enemy.y - (ship.y - enemy.y);
  } else if (dist > IDEAL_DISTANCE) {
    enemy.targetX = ship.x + (Math.random() - 0.5) * 120;
    enemy.targetY = ship.y + (Math.random() - 0.5) * 120;
  }

  //--------------------------------------------------
  // APPLY THRUST
  //--------------------------------------------------
  const MAX_SPEED = 180;
  let thrustFactor = 1;
  if (dist < 40 && !enemy.backOff) {
    thrustFactor = 0.2;
    enemy.backOff = true;
  }

  enemy.vx += Math.cos(moveAngle) * THRUST * thrustFactor * dt;
  enemy.vy += Math.sin(moveAngle) * THRUST * thrustFactor * dt;

  // limit speed
  const speed = Math.sqrt(enemy.vx * enemy.vx + enemy.vy * enemy.vy);
  if (speed > MAX_SPEED) {
    enemy.vx = (enemy.vx / speed) * MAX_SPEED;
    enemy.vy = (enemy.vy / speed) * MAX_SPEED;
  }

  //--------------------------------------------------
  // FRICTION
  //--------------------------------------------------
  enemy.vx *= FRICTION;
  enemy.vy *= FRICTION;

  //--------------------------------------------------
  // UPDATE POSITION
  //--------------------------------------------------
  enemy.x += enemy.vx * dt;
  enemy.y += enemy.vy * dt;

  //--------------------------------------------------
  // SOFT CANVAS BOUNDS
  //--------------------------------------------------
  const padding = 40;
  if (enemy.x < padding) enemy.vx += (padding - enemy.x) * dt * 4;
  if (enemy.x > canvasWidth - padding) enemy.vx -= (enemy.x - (canvasWidth - padding)) * dt * 4;
  if (enemy.y < padding) enemy.vy += (padding - enemy.y) * dt * 4;
  if (enemy.y > canvasHeight - padding) enemy.vy -= (enemy.y - (canvasHeight - padding)) * dt * 4;
}
//====================================================
// DRAW ENEMY
//====================================================

export function drawEnemy(
  ctx: CanvasRenderingContext2D,
  enemy: Enemy,
  ship: Ship,
  dt: number
) {

  ctx.save();

  const dx = ship.x - enemy.x;
  const dy = ship.y - enemy.y;

  const angle = Math.atan2(dy, dx);

  ctx.translate(enemy.x, enemy.y);
  ctx.rotate(angle);

  //--------------------------------------------------
  // Speed stretch effect
  //--------------------------------------------------

  const speed = Math.sqrt(enemy.vx ** 2 + enemy.vy ** 2);

  const stretchX = 1 + speed * 0.002;
  const stretchY = 1 - speed * 0.001;

  ctx.scale(stretchX, stretchY);

  //--------------------------------------------------
  // Body
  //--------------------------------------------------

  ctx.fillStyle = "crimson";

  ctx.beginPath();
  ctx.moveTo(enemy.size, 0);
  ctx.lineTo(-enemy.size * 0.7, enemy.size * 0.5);
  ctx.lineTo(-enemy.size * 0.7, -enemy.size * 0.5);
  ctx.closePath();
  ctx.fill();

  //--------------------------------------------------
  // Thruster
  //--------------------------------------------------

  if (speed > 5) {

    const flame = 6 + Math.random() * 4 + speed * 0.04;

    ctx.fillStyle = "orange";

    ctx.beginPath();
    ctx.moveTo(-enemy.size * 0.8, 0);
    ctx.lineTo(-enemy.size * 0.8 - flame, flame * 0.4);
    ctx.lineTo(-enemy.size * 0.8 - flame, -flame * 0.4);
    ctx.closePath();
    ctx.fill();
  }

  ctx.restore();
}

//====================================================
// SPAWN ENEMY
//====================================================

export function spawnEnemy(
  nextEnemyId: React.MutableRefObject<number>,
  canvasWidth: number
): Enemy {

  return {
    id: nextEnemyId.current++,

    x: Math.random() * canvasWidth,
    y: -40,

    vx: 0,
    vy: 40,

    size: 20,
    health: 10,

    fireCooldown: 2,
    fireTimer: 1,

    type: "DRONE",

    behavior: "CHASE",

    targetX: 0,
    targetY: 0,

    backOff: false,
  };
}

