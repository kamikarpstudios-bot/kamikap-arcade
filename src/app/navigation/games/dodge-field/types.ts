export type WeaponId =
  | "BLASTER"
  | "SHOTGUN"
  | "LASER"
  | "BLACKHOLE"
  | "SEEKER"
  | "ENEMY";

export type Particle = {
  x: number;
  y: number;
  vx: number;
  vy: number;
  size: number;
  life: number;
  alpha: number;
};

export type BulletTrailPoint = {
  x: number;
  y: number;
  life: number;
};

export type Bullet = {
  id: number;
  x: number;
  y: number;
  vx: number;
  vy: number;
  size: number;
  type: WeaponId;
  trail: BulletTrailPoint[];

  life?: number;
  maxLife?: number;
  drag?: number;

  fragmented?: boolean;
  generation?: number;
  phase?: 0 | 1 | "forming" | "launched";

  particles?: Particle[];
  baseAngle?: number;

  charge?: number;
  chargeSpeed?: number;
  time?: number;
  speed?: number;

  length?: number;
  maxLength?: number;
  maxCharge?: number;
  chargeDrainRate?: number;
  rechargeTimer?: number;
  isCharging?: boolean;
  isFiring?: boolean;
  flickerTimer?: number;
  flickerIntensity?: number;
  brightness?: number;
};

export type Ship = {
  x: number;
  y: number;
  vx: number;
  vy: number;
  r: number;
  angle: number;
};