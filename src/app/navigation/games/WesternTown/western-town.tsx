"use client";

import { useEffect, useRef } from "react";

export default function FrontierTownPrototype() {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    let animationFrameId = 0;
    let lastNow = performance.now();

// =========================================================
// AUDIO
// =========================================================
const bgm = document.createElement("audio");
bgm.loop = true;
bgm.volume = 0.45;
bgm.preload = "auto";

const bgmSource = document.createElement("source");
bgmSource.src = "/games/westerntown/westerntownbg.m4a";
bgmSource.type = "audio/mp4";

bgm.appendChild(bgmSource);

let audioStarted = false;

const startAudio = () => {
  if (audioStarted) return;
  audioStarted = true;

  bgm.play().catch((err) => {
    console.error("Audio failed to start", err);
    audioStarted = false;
  });
};
    // =========================================================
    // CONFIG
    // =========================================================
    const TOWN_CENTER = 2200;
    const CFG = {
      worldWidth: 5000,
      worldHeight: 1300,

      playerSpeed: 220,
      npcSpeed: 60,
      interactRadius: 86,

      dayStartHour: 7,
      sleepHour: 22,
      minutesPerRealSecond: 14,

      initialCash: 40,

      bakeryOpenHour: 8,
      bakeryCloseHour: 18,

      bankOpenHour: 10,
      bankCloseHour: 18,

      rentAmount: 1000,
      initialDaysLeft: 5,

      bankAmountStep: 25,
      houseSleepRestore: 100,

      bakeryShiftLength: 14,
      bakeryTargetGoodZone: 0.2,
      bakeryPayPerHit: 14,
      bakeryBasePay: 20,

      streetY: 760,
    };

    // =========================================================
    // TYPES
    // =========================================================
    type Facing = "up" | "down" | "left" | "right";
    type BuildingType = "house" | "bank" | "job";
    type ActivePanel = null | "bank" | "jobResult";
    type NPCScheduleTarget = "home" | "work" | "idle";

    type Building = {
      id: string;
      name: string;
      type: BuildingType;
      x: number;
      y: number;
      w: number;
      h: number;
      color: string;
      accent: string;
      openHour: number;
      closeHour: number;
      door: {
        x: number;
        y: number;
        w: number;
        h: number;
      };
      solid: boolean;
     facadeStyle?: "house" | "shop" | "bank";
    };

 type NPC = {
  id: string;
  name: string;
  x: number;
  y: number;

  w: number;
  h: number;

  color: string;
  homePos: { x: number; y: number };
  workPos: { x: number; y: number };
  idlePos: { x: number; y: number };
  target: NPCScheduleTarget;

  walkPhase: number;
  facing: "left" | "right";
  moving: boolean;

  lastLeftStep: boolean;
  lastRightStep: boolean;

  solid?: boolean;
};

    type StoryCard = {
      title: string;
      body: string;
    };

type JobState = {
  active: boolean;
  countdown: number;
  marker: number;
  markerDir: 1 | -1;
  presses: number;
  hits: number;
  misses: number;
  payout: number;
  resultLabel: string;

  // difficulty / feel
  markerSpeed: number;
  targetPos: number;
  targetWidth: number;
  shake: number;
};

    type DustPuff = {
  x: number;
  y: number;
  vx: number;
  vy: number;
  life: number;
  maxLife: number;
  size: number;
  grow: number;
  alpha: number;
};

type PropType =
  | "barrel"
  | "crate"
  | "trough"
  | "post"
  | "sign"
  | "hayBale"
  | "wagonWheel";

type Prop = {
  id: string;
  type: PropType;
  x: number;
  y: number;
  w: number;
  h: number;
  solid?: boolean;
  frontLayer?: boolean; // draws after player if true
  variant?: number;
};

type Tumbleweed = {
  id: string;
  x: number;
  y: number;
  size: number;
  speed: number;
  loop: number;
  phase: number;
  rot: number;
  bounce: number;
  solid?: boolean;
};

    // =========================================================
    // INPUT STATE
    // =========================================================
    const keys: Record<string, boolean> = {};

    // =========================================================
    // CAMERA
    // =========================================================
    const camera = {
      x: 0,
      y: 0,
    };

    const hCache = {
      width: 0,
      height: 0,
    };

    // =========================================================
    // AMBIENT WORLD
    // =========================================================
const clouds = [
  { x: 120, y: 210, w: 180, h: 66, speed: 10 },
  { x: 340, y: 180, w: 230, h: 78, speed: 14 },
  { x: 720, y: 235, w: 190, h: 68, speed: 8 },
  { x: 1080, y: 195, w: 250, h: 84, speed: 12 },
  { x: 1500, y: 250, w: 210, h: 72, speed: 9 },
  { x: 1860, y: 185, w: 185, h: 64, speed: 13 },
];

const windLines = Array.from({ length: 9 }, (_, i) => ({
  x: Math.random() * CFG.worldWidth,
  y: 150 + Math.random() * 340,
  len: 90 + Math.random() * 90,
  speed: 90 + Math.random() * 70,
  sway: Math.random() * Math.PI * 2,
  amp: 8 + Math.random() * 10,
  thickness: 1.5 + Math.random() * 1.3,
  alpha: 0.12 + Math.random() * 0.09,
}));

const stars = Array.from({ length: 90 }, (_, i) => ({
  x: Math.random() * CFG.worldWidth,
  y: Math.random() * 320,
  size: Math.random() < 0.14 ? 2.2 : Math.random() < 0.45 ? 1.6 : 1,
  twinkleOffset: Math.random() * Math.PI * 2,
  twinkleSpeed: 0.8 + Math.random() * 2.2,
  warm: Math.random() < 0.22,
}));

const streetWindLines = Array.from({ length: 14 }, () => ({
  x: Math.random() * CFG.worldWidth,
  y: 905 + Math.random() * 180,
  len: 50 + Math.random() * 90,
  speed: 140 + Math.random() * 90,
  sway: Math.random() * Math.PI * 2,
  amp: 4 + Math.random() * 6,
  alpha: 0.10 + Math.random() * 0.10,
  thickness: 1 + Math.random() * 1.4,
  loops: Math.random() < 0.35,
}));

const birds = Array.from({ length: 4 }, (_, i) => ({
  x: 220 + i * 220,
  y: 110 + Math.random() * 130,
  speed: 122 + Math.random() * 30, // bird speed //
  flap: Math.random() * Math.PI * 20,
  scale: 0.2 + Math.random() * 0.45,
  bob: Math.random() * Math.PI * 20,
  dir: 1 as 1 | -1,
}));

const tumbleweeds: Tumbleweed[] = [
  {
    id: "weed_1",
    x: 260,
    y: 1006,
    size: 1.0,
    speed: 40,
    loop: 1500,
    phase: 0,
    rot: 0,
    bounce: 0,
    solid: true,
  },
  {
    id: "weed_2",
    x: -260,
    y: 1020,
    size: 0.82,
    speed: 28,
    loop: 1800,
    phase: 1.7,
    rot: 0,
    bounce: 0,
    solid: true,
  },
  {
    id: "weed_3",
    x: -720,
    y: 1032,
    size: 1.18,
    speed: 34,
    loop: 2100,
    phase: 3.1,
    rot: 0,
    bounce: 0,
    solid: true,
  },
];


    // =========================================================
    // PLAYER
    // =========================================================
 const player = {
  x: TOWN_CENTER + 80,
  y: 970,
  w: 28,
  h: 40,
  speed: CFG.playerSpeed,
  facing: "down" as Facing,

  skin: "#f1dfc4",
  shirt: "#5879a7",
  pants: "#5c4639",

  cash: CFG.initialCash,
  energy: 100,

  canMove: false,
  nearBuildingId: "" as string | "",
  promptText: "",

  lastLeftStep: false,
  lastRightStep: false,
};
    // =========================================================
    // WORLD
    // =========================================================
  const world = {
  day: 1,
  minutes: CFG.dayStartHour * 60,
  gameOver: false,
  storyCard: {
    title: "A NEW DAY",
    body:
      "Another dusty morning in town.\nEarn what you can.\nRent comes due fast.",
  } as StoryCard | null,
};

    // =========================================================
    // RENT
    // =========================================================
    const rent = {
      amountDue: CFG.rentAmount,
      paid: 0,
      daysLeft: CFG.initialDaysLeft,
    };

    // =========================================================
    // BANK
    // =========================================================
    const bank = {
      balance: 0,
      selectedAmount: 25,
    };

    // =========================================================
    // UI
    // =========================================================
    const ui = {
      panel: null as ActivePanel,
      toast: "",
      toastTimer: 0,
    };

    // =========================================================
    // JOB STATE
    // =========================================================
const bakeryJob: JobState = {
  active: false,
  countdown: 0,
  marker: 0.1,
  markerDir: 1,
  presses: 0,
  hits: 0,
  misses: 0,
  payout: 0,
  resultLabel: "",

  markerSpeed: 0.9,
  targetPos: 0.5,
  targetWidth: CFG.bakeryTargetGoodZone,
  shake: 0,
};
  
    //dust stae//
    const dustPuffs: DustPuff[] = [];

    // =========================================================
    // WORLD SETUP
    // =========================================================

const buildings: Building[] = [
  {
    id: "house_helia",
    name: "Helia's House",
    type: "house",
    facadeStyle: "house",
    x: TOWN_CENTER - 980,
    y: 700,
    w: 250,
    h: 180,
    color: "#8a675a",
    accent: "#e5c08f",
    openHour: 0,
    closeHour: 24,
    door: {
      x: TOWN_CENTER - 980 + 250 / 2 - 22,
      y: 700 + 180 - 64,
      w: 44,
      h: 64,
    },
    solid: true,
  },
  {
    id: "house_rowe",
    name: "Rowe's House",
    type: "house",
    facadeStyle: "house",
    x: TOWN_CENTER - 670,
    y: 700,
    w: 250,
    h: 180,
    color: "#6f5a4d",
    accent: "#d8b07d",
    openHour: 0,
    closeHour: 24,
    door: {
      x: TOWN_CENTER - 670 + 250 / 2 - 22,
      y: 700 + 180 - 64,
      w: 44,
      h: 64,
    },
    solid: true,
  },
  {
    id: "house_Mr._Vale",
    name: "Mr. Vale's House",
    type: "house",
    facadeStyle: "house",
    x: TOWN_CENTER - 360,
    y: 700,
    w: 250,
    h: 180,
    color: "#7d5a50",
    accent: "#dcb37c",
    openHour: 0,
    closeHour: 24,
    door: {
      x: TOWN_CENTER - 360 + 250 / 2 - 22,
      y: 700 + 180 - 64,
      w: 44,
      h: 64,
    },
    solid: true,
  },
  {
    id: "house",
    name: "Your House",
    type: "house",
    facadeStyle: "house",
    x: TOWN_CENTER - 50,
    y: 700,
    w: 250,
    h: 180,
    color: "#7d5a50",
    accent: "#dcb37c",
    openHour: 0,
    closeHour: 24,
    door: {
      x: TOWN_CENTER - 50 + 250 / 2 - 22,
      y: 700 + 180 - 64,
      w: 44,
      h: 64,
    },
    solid: true,
  },
  {
    id: "bakery",
    name: "Helia's Bakery",
    type: "job",
    facadeStyle: "shop",
    x: TOWN_CENTER + 280,
    y: 670,
    w: 260,
    h: 210,
    color: "#b86b52",
    accent: "#f0d0a3",
    openHour: CFG.bakeryOpenHour,
    closeHour: CFG.bakeryCloseHour,
    door: {
      x: TOWN_CENTER + 280 + 260 / 2 - 22,
      y: 670 + 210 - 64,
      w: 44,
      h: 64,
    },
    solid: true,
  },
  {
    id: "bank",
    name: "Frontier Bank",
    type: "bank",
    facadeStyle: "bank",
    x: TOWN_CENTER + 700,
    y: 650,
    w: 280,
    h: 230,
    color: "#5d6b4f",
    accent: "#d7c98a",
    openHour: CFG.bankOpenHour,
    closeHour: CFG.bankCloseHour,
    door: {
      x: TOWN_CENTER + 700 + 280 / 2 - 22,
      y: 650 + 230 - 64,
      w: 44,
      h: 64,
    },
    solid: true,
  },
  {
    id: "boarding_house",
    name: "Boarding House",
    type: "house",
    facadeStyle: "house",
    x: TOWN_CENTER + 1070,
    y: 680,
    w: 300,
    h: 200,
    color: "#86624f",
    accent: "#e3bf8c",
    openHour: 0,
    closeHour: 24,
    door: {
      x: TOWN_CENTER + 1070 + 300 / 2 - 22,
      y: 680 + 200 - 64,
      w: 44,
      h: 64,
    },
    solid: true,
  },
];

const props: Prop[] = [
  // house boardwalk
  { id: "barrel_1", type: "barrel", x: 300, y: 855, w: 26, h: 34, solid: true },
  { id: "crate_1", type: "crate", x: 334, y: 844, w: 30, h: 40, solid: true },

  // bakery boardwalk
  { id: "crate_2", type: "crate", x: 720, y: 848, w: 30, h: 40, solid: true },
  { id: "barrel_2", type: "barrel", x: 760, y: 848, w: 24, h: 40, solid: true },

  // bank boardwalk
  { id: "crate_3", type: "crate", x: 1215, y: 860, w: 30, h: 28, solid: true },
  { id: "barrel_3", type: "barrel", x: 1254, y: 860, w: 24, h: 30, solid: true },
];
   const npcs: NPC[] = [
  {
    id: "landlord",
    name: "Mr. Vale",
    x: 360,
    y: 940,
    w: 28,
    h: 40,
    color: "#6e402f",
    homePos: { x: 360, y: 940 },
    workPos: { x: 360, y: 940 },
    idlePos: { x: 1340, y: 950 },
    target: "home",
    moving: false,
    walkPhase: 0,
    facing: "right",
    lastLeftStep: false,
    lastRightStep: false,
  },
  {
    id: "helia",
    name: "Helia",
    x: 660,
    y: 930,
    w: 28,
    h: 40,
    color: "#c27a51",
    homePos: { x: 480, y: 980 },
    workPos: { x: 660, y: 930 },
    idlePos: { x: 1380, y: 950 },
    target: "work",
    walkPhase: 0,
    moving: false,
    facing: "right",
    lastLeftStep: false,
    lastRightStep: false,
  },
  {
    id: "rowe",
    name: "Rowe",
    x: 1110,
    y: 930,
    w: 28,
    h: 40,
    color: "#3d5a48",
    homePos: { x: 1280, y: 980 },
    workPos: { x: 1110, y: 930 },
    idlePos: { x: 1420, y: 950 },
    target: "work",
    walkPhase: 0,
    moving: false,
    facing: "right",
    lastLeftStep: false,
    lastRightStep: false,
  },
];

    // =========================================================
    // HELPERS
    // =========================================================
    const clamp = (v: number, min: number, max: number) =>
      Math.max(min, Math.min(max, v));

    const lerp = (a: number, b: number, t: number) => a + (b - a) * t;

    const dist = (ax: number, ay: number, bx: number, by: number) =>
      Math.hypot(ax - bx, ay - by);

    const setToast = (text: string, duration = 2) => {
      ui.toast = text;
      ui.toastTimer = duration;
    };

    const worldToScreen = (x: number, y: number) => ({
      x: x - camera.x,
      y: y - camera.y,
    });

    const getTimeParts = () => {
      const hrs24 = Math.floor(world.minutes / 60) % 24;
      const mins = Math.floor(world.minutes % 60);
      const suffix = hrs24 >= 12 ? "PM" : "AM";
      const hrs12 = hrs24 % 12 === 0 ? 12 : hrs24 % 12;

      return {
        hrs24,
        mins,
        hrs12,
        suffix,
        label: `${hrs12}:${String(mins).padStart(2, "0")} ${suffix}`,
      };
    };

const getCelestialInfo = () => {
  const dayMinutes = world.minutes % (24 * 60);
  const T = LIGHTING_TUNE;

  const sunVisible = dayMinutes >= 6 * 60 && dayMinutes <= 18 * 60;
  const moonVisible = dayMinutes > 18 * 60 || dayMinutes < 6 * 60;

  if (sunVisible) {
    const t = (dayMinutes - 6 * 60) / (12 * 60); // 0 sunrise -> 1 sunset
    const height01 = Math.sin(t * Math.PI);

    return {
      kind: "sun" as const,
      visible: true,
      t,
      height01,
      strength: clamp(height01, 0, 1),
    };
  }

  if (moonVisible) {
    const moonClock =
      dayMinutes >= 18 * 60 ? dayMinutes - 18 * 60 : dayMinutes + 6 * 60;
    const t = moonClock / (12 * 60); // 0 moonrise -> 1 moonset
    const height01 = Math.sin(t * Math.PI);

    return {
      kind: "moon" as const,
      visible: true,
      t,
      height01,
      strength: clamp(height01, 0, 1),
    };
  }

  return {
    kind: "sun" as const,
    visible: false,
    t: 0,
    height01: 0,
    strength: 0,
  };
};

const getDaylight = () => {
  const c = getCelestialInfo();

  if (c.kind === "sun") {
    return c.strength;
  }

  // moon gives much less scene brightness than the sun
  return 0.06 + c.strength * 0.10;
};

  const getSkyColors = () => {
  const daylight = getDaylight();

  const topR = Math.round(14 + (120 - 14) * daylight);
  const topG = Math.round(20 + (190 - 20) * daylight);
  const topB = Math.round(38 + (235 - 38) * daylight);

  const midR = Math.round(42 + (155 - 42) * daylight);
  const midG = Math.round(38 + (210 - 38) * daylight);
  const midB = Math.round(72 + (235 - 72) * daylight);

  const lowR = Math.round(92 + (245 - 92) * daylight);
  const lowG = Math.round(62 + (215 - 62) * daylight);
  const lowB = Math.round(58 + (190 - 58) * daylight);

  return {
    top: `rgb(${topR}, ${topG}, ${topB})`,
    mid: `rgb(${midR}, ${midG}, ${midB})`,
    low: `rgb(${lowR}, ${lowG}, ${lowB})`,
    daylight,
  };
};

    const isBuildingOpen = (b: Building) => {
      const hour = Math.floor(world.minutes / 60) % 24;
      if (b.type === "house") return true;
      return hour >= b.openHour && hour < b.closeHour;
    };

    const getDoorInteractPoint = (b: Building) => {
      return {
        x: b.door.x + b.door.w / 2,
        y: b.door.y + b.door.h + 12,
      };
    };

        const getTownFrontY = () => {
      return 825;
    };

//---------//
const getLightShadow = () => {
  const c = getCelestialInfo();
  const T = LIGHTING_TUNE;

  if (!c.visible) {
    return {
      dx: 0,
      dy: 0,
      length: 0,
      alpha: 0,
    };
  }

  const lowSky = 1 - c.height01;

  // sunrise/moonrise cast one direction, sunset/moonset the other
  const side = lerp(1, -1, c.t);

  // extra compression when light is high in the sky
  const noonTighten =
    c.kind === "sun"
      ? Math.pow(lowSky, 1.9)
      : Math.pow(lowSky, 1.35);

  // much tighter around noon, still long at low angles
  const length = lerp(
    c.kind === "sun" ? 4 : 10,
    T.maxShadowLength,
    noonTighten
  );

  // reduce sideways drift hard at noon
  const dx = side * lerp(
    c.kind === "sun" ? 1.5 : 5,
    T.shadowSideDrift,
    noonTighten
  );

  // reduce downward travel hard at noon
  const dy = lerp(
    c.kind === "sun" ? 3 : 8,
    T.maxShadowDy,
    noonTighten
  );

  let alpha = 0;

  if (c.kind === "sun") {
    const horizonFade = clamp((c.height01 - 0.04) / 0.14, 0, 1);
    alpha = lerp(0.10, 0.50, horizonFade) * (0.35 + noonTighten * 0.65);
  } else {
    const horizonFade = clamp((c.height01 - 0.06) / 0.18, 0, 1);
    alpha = lerp(0.05, 0.16, horizonFade) * (0.45 + noonTighten * 0.55);
  }

  return {
    dx,
    dy,
    length,
    alpha,
  };
};
//---------//

    const drawGroundShadowPoly = (
      points: { x: number; y: number }[],
      options?: {
        offsetX?: number;
        offsetY?: number;
        alphaMul?: number;
        blur?: number;
        color?: string;
      }
    ) => {
      if (points.length < 3) return;

      const s = getLightShadow();
      const offsetX = options?.offsetX ?? s.dx;
      const offsetY = options?.offsetY ?? s.dy;
      const alphaMul = options?.alphaMul ?? 1;
      const blur = options?.blur ?? 0;
      const color = options?.color ?? "#2f1b10";

      ctx.save();
      ctx.globalAlpha = s.alpha * alphaMul;
      ctx.fillStyle = color;
      if (blur > 0) ctx.filter = `blur(${blur}px)`;

      ctx.beginPath();
      ctx.moveTo(points[0].x + offsetX, points[0].y + offsetY);

      for (let i = 1; i < points.length; i++) {
        ctx.lineTo(points[i].x + offsetX, points[i].y + offsetY);
      }

      ctx.closePath();
      ctx.fill();
      ctx.restore();
    };
const drawCharacterShadow = (
  footX: number,
  footY: number,
  bodyWidth: number,
  bodyHeight: number,
  headRadius: number,
  alphaMul = 1
) => {
  const s = getLightShadow();
  if (s.alpha <= 0.01 || s.length <= 0.01) return;

  const shadowLen = Math.max(2, s.length * 0.12);
  const shadowWidth = bodyWidth * 1.2;
  const topWidth = bodyWidth * 0.80;
  const hatBrimWidth = bodyWidth * 0.90;
  const hatCrownWidth = bodyWidth * 0.40;

  const baseX = footX;
  const baseY = footY;

  const endX = baseX + s.dx * 0.34;
  const endY = baseY + s.dy + shadowLen;

  const nx = endX - baseX;
  const ny = endY - baseY;
  const nd = Math.hypot(nx, ny) || 1;

  const px = -ny / nd;
  const py = nx / nd;

  const bodyTopX = baseX + nx * 0.28;
  const bodyTopY = baseY + ny * 0.28;

  const headX = baseX + nx * 0.48;
  const headY = baseY + ny * 0.48;

  const hatX = baseX + nx * 0.56;
  const hatY = baseY + ny * 0.56;

  ctx.save();
  ctx.globalAlpha = s.alpha * alphaMul;
  ctx.fillStyle = "#2f1b10";
  ctx.filter = "blur(1.5px)";

  ctx.beginPath();

  // left side from feet up the body shadow
  ctx.moveTo(baseX - px * shadowWidth * 0.5, baseY - py * shadowWidth * 0.5);
  ctx.lineTo(bodyTopX - px * topWidth * 0.5, bodyTopY - py * topWidth * 0.5);

  // head bulge
  ctx.quadraticCurveTo(
    headX - px * headRadius * 0.95,
    headY - py * headRadius * 0.95,
    hatX - px * hatBrimWidth * 0.5,
    hatY - py * hatBrimWidth * 0.5
  );

  // hat brim front
  ctx.lineTo(
    endX - px * hatCrownWidth * 0.8,
    endY - py * hatCrownWidth * 0.9
  );

  // cross over to other side
  ctx.lineTo(
    endX + px * hatCrownWidth * 0.9,
    endY + py * hatCrownWidth * 0.1
  );

  // hat brim other side
  ctx.lineTo(
    hatX + px * hatBrimWidth * 0.5,
    hatY + py * hatBrimWidth * 0.5
  );

  // back down through head/body
  ctx.quadraticCurveTo(
    headX + px * headRadius * 0.95,
    headY + py * headRadius * 0.95,
    bodyTopX + px * topWidth * 0.5,
    bodyTopY + py * topWidth * 0.5
  );

  ctx.lineTo(baseX + px * shadowWidth * 0.5, baseY + py * shadowWidth * 0.5);
  ctx.closePath();
  ctx.fill();

  ctx.restore();
};

const spawnDustPuff = (
  x: number,
  y: number,
  amount = 2,
  strength = 1
) => {
  for (let i = 0; i < amount; i++) {
    dustPuffs.push({
      x: x + (Math.random() - 0.5) * 8,
      y: y + (Math.random() - 0.5) * 3,
      vx: (Math.random() - 0.5) * 14 * strength,
      vy: -(14 + Math.random() * 18) * strength,
      life: 0,
      maxLife: 0.42 + Math.random() * 0.22,
      size: 3 + Math.random() * 3,
      grow: 14 + Math.random() * 10,
      alpha: 0.20 + Math.random() * 0.10,
    });
  }
};

const drawWindLines = () => {
  const daylight = getDaylight();
  const skyAlphaBoost = 0.65 + daylight * 0.45;

  ctx.save();
  ctx.lineCap = "round";

  for (const line of windLines) {
    const px = line.x - camera.x * 0.10;
    const py = line.y - camera.y * 0.03;
    const loops = 2;
    const segs = 22;

    ctx.strokeStyle = `rgba(255, 247, 235, ${line.alpha * skyAlphaBoost})`;
    ctx.lineWidth = line.thickness;

    ctx.beginPath();

    for (let i = 0; i <= segs; i++) {
      const t = i / segs;
      const xx = px + t * line.len;
      const yy =
        py +
        Math.sin(t * Math.PI * loops + line.sway) * line.amp * (1 - t * 0.15) +
        Math.sin(t * Math.PI * 0.9 + line.sway * 0.7) * 3;

      if (i === 0) ctx.moveTo(xx, yy);
      else ctx.lineTo(xx, yy);
    }

    ctx.stroke();

    // tiny trailing accent
    ctx.strokeStyle = `rgba(222, 188, 145, ${line.alpha * 0.45})`;
    ctx.lineWidth = Math.max(1, line.thickness * 0.55);
    ctx.beginPath();
    ctx.moveTo(px + line.len * 0.72, py);
    ctx.lineTo(px + line.len * 0.98, py + Math.sin(line.sway) * 4);
    ctx.stroke();
  }

  ctx.restore();
};

const drawStreetWindLines = () => {
  const roadTop = worldToScreen(0, getTownFrontY()).y + 118;
  const roadBottom = hCache.height;

  ctx.save();
  ctx.lineCap = "round";

  for (const line of streetWindLines) {
    const px = line.x - camera.x;
    const py = line.y - camera.y;

    if (py < roadTop || py > roadBottom) continue;

    ctx.strokeStyle = `rgba(240, 215, 180, ${line.alpha})`;
    ctx.lineWidth = line.thickness;

    ctx.beginPath();

    const segs = 18;
    for (let i = 0; i <= segs; i++) {
      const t = i / segs;
      const xx = px + t * line.len;

      let yy = py + Math.sin(t * Math.PI * 1.2 + line.sway) * line.amp;

      if (line.loops) {
        yy += Math.sin(t * Math.PI * 3 + line.sway * 1.4) * line.amp * 0.55;
      }

      if (i === 0) ctx.moveTo(xx, yy);
      else ctx.lineTo(xx, yy);
    }

    ctx.stroke();

    // faint dust tail
    ctx.strokeStyle = `rgba(222, 188, 145, ${line.alpha * 0.45})`;
    ctx.lineWidth = Math.max(1, line.thickness * 0.6);
    ctx.beginPath();
    ctx.moveTo(px + line.len * 0.72, py);
    ctx.lineTo(px + line.len, py + Math.sin(line.sway) * 3);
    ctx.stroke();
  }

  ctx.restore();
};

const drawBirds = () => {
  const daylight = getDaylight();
  if (daylight < 0.18) return;

  for (const bird of birds) {
    const x = bird.x - camera.x * 0.10;
    const y = bird.y - camera.y * 0.04 + Math.sin(bird.bob) * 2.2;
    const flap = Math.sin(bird.flap);
    const s = bird.scale;
    const facing = bird.dir;

    // flap shaping
    const wingLiftFront = flap * 9 * s;
    const wingLiftBack = -flap * 7 * s;

    ctx.save();
    ctx.translate(x, y);
    ctx.scale(facing, 1);

    // -------------------------
    // BACK WING
    // -------------------------
    ctx.fillStyle = "rgba(26, 20, 24, 0.72)";
    ctx.beginPath();
    ctx.moveTo(-2 * s, -1 * s);
    ctx.quadraticCurveTo(
      -18 * s,
      -10 * s + wingLiftBack,
      -28 * s,
      -2 * s + wingLiftBack * 0.45
    );
    ctx.quadraticCurveTo(
      -18 * s,
      1 * s,
      -5 * s,
      4 * s
    );
    ctx.closePath();
    ctx.fill();

    // -------------------------
    // TAIL
    // -------------------------
    ctx.fillStyle = "rgba(18, 14, 18, 0.95)";
    ctx.beginPath();
    ctx.moveTo(-13 * s, 1 * s);
    ctx.lineTo(-24 * s, -2 * s);
    ctx.lineTo(-19 * s, 6 * s);
    ctx.closePath();
    ctx.fill();

    // -------------------------
    // BODY
    // -------------------------
    ctx.fillStyle = "#1d171c";
    ctx.beginPath();
    ctx.ellipse(0, 0, 11 * s, 7 * s, 0.08, 0, Math.PI * 2);
    ctx.fill();

    // chest highlight
    ctx.fillStyle = "rgba(255,255,255,0.05)";
    ctx.beginPath();
    ctx.ellipse(2 * s, -1 * s, 5 * s, 2.4 * s, -0.25, 0, Math.PI * 2);
    ctx.fill();

    // -------------------------
    // HEAD
    // -------------------------
    ctx.fillStyle = "#181318";
    ctx.beginPath();
    ctx.ellipse(10 * s, -3 * s, 4.8 * s, 4.2 * s, 0, 0, Math.PI * 2);
    ctx.fill();

    // beak
    ctx.fillStyle = "#2f261d";
    ctx.beginPath();
    ctx.moveTo(14 * s, -3.5 * s);
    ctx.lineTo(21 * s, -1.5 * s);
    ctx.lineTo(14.5 * s, 0.4 * s);
    ctx.closePath();
    ctx.fill();

    // tiny eye
    ctx.fillStyle = "rgba(255,255,255,0.10)";
    ctx.beginPath();
    ctx.arc(11.5 * s, -4.2 * s, Math.max(0.8, 1.1 * s), 0, Math.PI * 2);
    ctx.fill();

    // -------------------------
    // FRONT WING
    // -------------------------
    ctx.fillStyle = "#241d23";
    ctx.beginPath();
    ctx.moveTo(1 * s, -1 * s);
    ctx.quadraticCurveTo(
      -10 * s,
      -18 * s + wingLiftFront,
      -22 * s,
      -6 * s + wingLiftFront * 0.35
    );
    ctx.quadraticCurveTo(
      -10 * s,
      4 * s,
      2 * s,
      5 * s
    );
    ctx.closePath();
    ctx.fill();

    // feather edge hint
    ctx.strokeStyle = "rgba(255,255,255,0.06)";
    ctx.lineWidth = 1.2 * s;
    ctx.lineCap = "round";
    ctx.beginPath();
    ctx.moveTo(-2 * s, -2 * s);
    ctx.quadraticCurveTo(
      -12 * s,
      -11 * s + wingLiftFront * 0.5,
      -20 * s,
      -5 * s + wingLiftFront * 0.25
    );
    ctx.stroke();

    ctx.restore();
  }
};

function shadeHex(hex: string, amount: number) {
  const clean = hex.replace("#", "");
  const num = parseInt(clean, 16);

  let r = (num >> 16) & 255;
  let g = (num >> 8) & 255;
  let b = num & 255;

  const mult = 1 + amount;
  r = Math.max(0, Math.min(255, Math.round(r * mult)));
  g = Math.max(0, Math.min(255, Math.round(g * mult)));
  b = Math.max(0, Math.min(255, Math.round(b * mult)));

  return `rgb(${r}, ${g}, ${b})`;
}

const getFootBox = (x: number, y: number, w: number, h: number) => {
  const footW = w * 0.55;
  const footH = h * 0.28;
  return {
    x: x + (w - footW) / 2,
    y: y + h - footH,
    w: footW,
    h: footH,
  };
};

const boxesOverlap = (
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

const getPropFoot = (prop: Prop) => {
  switch (prop.type) {
    case "wagonWheel":
      return {
        x: prop.x + prop.w * 0.5,
        y: prop.y + prop.h * 0.92,
      };

    case "sign":
      return {
        x: prop.x + prop.w * 0.5,
        y: prop.y + prop.h,
      };

    default:
      return {
        x: prop.x + prop.w * 0.5,
        y: prop.y + prop.h,
      };
  }
};

const getSortYForProp = (prop: Prop) => {
  return prop.y + prop.h;
};

const getSortYForNPC = (npc: NPC) => {
  return npc.y + npc.h;
};

const getSortYForPlayer = () => {
  return player.y + player.h;
};

const getTumbleweedRadius = (weed: Tumbleweed) => 14 * weed.size;

const getTumbleweedFootBox = (weed: Tumbleweed) => {
  const r = getTumbleweedRadius(weed);
  return {
    x: weed.x - r * 0.7,
    y: weed.y + r * 0.15,
    w: r * 1.4,
    h: r * 0.85,
  };
};

const getSortYForTumbleweed = (weed: Tumbleweed) => {
  return weed.y + getTumbleweedRadius(weed) * 0.9;
};

    // =========================================================
    // JOB FLOW
    // =========================================================
const startBakeryShift = () => {
  bakeryJob.active = true;
  bakeryJob.countdown = CFG.bakeryShiftLength;
  bakeryJob.marker = 0.1;
  bakeryJob.markerDir = 1;
  bakeryJob.presses = 0;
  bakeryJob.hits = 0;
  bakeryJob.misses = 0;
  bakeryJob.payout = 0;
  bakeryJob.resultLabel = "";

  bakeryJob.markerSpeed = 0.9;
  bakeryJob.targetPos = 0.5;
  bakeryJob.targetWidth = CFG.bakeryTargetGoodZone;
  bakeryJob.shake = 0;

  ui.panel = null;
  player.canMove = false;
  setToast("Shift started.");
};

    const finishBakeryShift = () => {
      bakeryJob.active = false;

      bakeryJob.payout =
        CFG.bakeryBasePay + bakeryJob.hits * CFG.bakeryPayPerHit;

     const accuracy =
  bakeryJob.presses > 0 ? bakeryJob.hits / bakeryJob.presses : 0;

if (accuracy >= 0.9) bakeryJob.resultLabel = "Excellent Shift";
else if (accuracy >= 0.72) bakeryJob.resultLabel = "Solid Shift";
else if (accuracy >= 0.5) bakeryJob.resultLabel = "Decent Shift";
else bakeryJob.resultLabel = "Rough Shift";

      player.cash += bakeryJob.payout;
      ui.panel = "jobResult";
      player.canMove = false;
    };

    // =========================================================
    // DAY FLOW
    // =========================================================
    const sleepToNextDay = () => {
      world.day += 1;
      world.minutes = CFG.dayStartHour * 60;
      player.energy = CFG.houseSleepRestore;
      rent.daysLeft -= 1;

      if (rent.daysLeft <= 0 && rent.paid < rent.amountDue) {
        world.gameOver = true;
        world.storyCard = {
          title: "Evicted",
          body:
            "You ran out of days and could not pay the rent.\n\nYour things are out on the street.",
        };
        player.canMove = false;
        return;
      }

      setToast(`Day ${world.day}. ${rent.daysLeft} day(s) left.`);
    };

    // =========================================================
    // INTERACTION SYSTEM
    // =========================================================
    const handleBuildingInteract = (b: Building) => {
      if (!isBuildingOpen(b)) {
        setToast(`${b.name} is closed.`);
        return;
      }

      if (b.type === "house") {
        sleepToNextDay();
        return;
      }

      if (b.type === "job") {
        startBakeryShift();
        return;
      }

      if (b.type === "bank") {
        ui.panel = "bank";
        player.canMove = false;
        return;
      }
    };

    // =========================================================
    // INPUT
    // =========================================================
  const closeStoryCard = () => {
  startAudio(); // START MUSIC HERE
  world.storyCard = null;
  if (!world.gameOver) player.canMove = true;
};

    const onKeyDown = (e: KeyboardEvent) => {
      const key = e.key.toLowerCase();
      keys[key] = true;

      if (
        [
          "w",
          "a",
          "s",
          "d",
          "arrowup",
          "arrowdown",
          "arrowleft",
          "arrowright",
          " ",
          "i",
        ].includes(key)
      ) {
        e.preventDefault();
      }

      if (world.storyCard && (key === "enter" || key === " " || key === "i")) {
        closeStoryCard();
        return;
      }

   if (bakeryJob.active) {
  if (key === " ") {
    bakeryJob.presses += 1;

    const zoneStart = bakeryJob.targetPos - bakeryJob.targetWidth / 2;
    const zoneEnd = bakeryJob.targetPos + bakeryJob.targetWidth / 2;

    if (bakeryJob.marker >= zoneStart && bakeryJob.marker <= zoneEnd) {
      bakeryJob.hits += 1;
      bakeryJob.shake = 8;

      // difficulty ramps with each success
      bakeryJob.markerSpeed = Math.min(2.35, bakeryJob.markerSpeed + 0.12);
      bakeryJob.targetWidth = Math.max(0.08, bakeryJob.targetWidth - 0.01);

      // move green zone after each success so player has to re-aim
      bakeryJob.targetPos = 0.18 + Math.random() * 0.64;

      setToast("Hit!");
    } else {
      bakeryJob.misses += 1;
      bakeryJob.shake = 4;
      setToast("Miss.");
    }
  }
  return;
}

      if (ui.panel === "jobResult") {
        if (key === "enter" || key === "i" || key === "escape") {
          ui.panel = null;
          player.canMove = true;
        }
        return;
      }

      if (ui.panel === "bank") {
        if (key === "escape") {
          ui.panel = null;
          player.canMove = true;
          return;
        }

        if (key === "q") {
          bank.selectedAmount = Math.max(
            CFG.bankAmountStep,
            bank.selectedAmount - CFG.bankAmountStep
          );
          return;
        }

        if (key === "e") {
          bank.selectedAmount += CFG.bankAmountStep;
          return;
        }

        if (key === "1") {
          const amount = Math.min(bank.selectedAmount, player.cash);
          if (amount > 0) {
            player.cash -= amount;
            bank.balance += amount;
            setToast(`Deposited $${amount}`);
          } else {
            setToast("Not enough cash.");
          }
          return;
        }

        if (key === "2") {
          const amount = Math.min(bank.selectedAmount, bank.balance);
          if (amount > 0) {
            bank.balance -= amount;
            player.cash += amount;
            setToast(`Withdrew $${amount}`);
          } else {
            setToast("Not enough in bank.");
          }
          return;
        }

        if (key === "3") {
          const amountNeeded = Math.max(0, rent.amountDue - rent.paid);
          const amount = Math.min(bank.selectedAmount, bank.balance, amountNeeded);

          if (amount > 0) {
            bank.balance -= amount;
            rent.paid += amount;
            setToast(`Paid $${amount} toward rent`);
          } else {
            setToast("Nothing to pay.");
          }
          return;
        }
      }

      if (!world.gameOver && !world.storyCard && !ui.panel && key === "i") {
        if (player.nearBuildingId) {
          const building = buildings.find((b) => b.id === player.nearBuildingId);
          if (building) handleBuildingInteract(building);
        }
      }
    };

    const onKeyUp = (e: KeyboardEvent) => {
      keys[e.key.toLowerCase()] = false;
    };

    window.addEventListener("keydown", onKeyDown);
    window.addEventListener("keyup", onKeyUp);

    // =========================================================
    // CLOCK
    // =========================================================
    const updateClock = (dt: number) => {
      if (world.storyCard || bakeryJob.active || ui.panel || world.gameOver) return;

      world.minutes += dt * CFG.minutesPerRealSecond;

    if (world.minutes >= 24 * 60) {
  world.minutes %= 24 * 60;
}
    };

    // =========================================================
    // PLAYER UPDATE
    // =========================================================
    const updatePlayer = (dt: number) => {
      player.promptText = "";
      player.nearBuildingId = "";

      if (!player.canMove || world.storyCard || bakeryJob.active || world.gameOver)
        return;

      let dx = 0;
      let dy = 0;

      if (keys["w"] || keys["arrowup"]) {
        dy -= 1;
        player.facing = "up";
      }
      if (keys["s"] || keys["arrowdown"]) {
        dy += 1;
        player.facing = "down";
      }
      if (keys["a"] || keys["arrowleft"]) {
        dx -= 1;
        player.facing = "left";
      }
      if (keys["d"] || keys["arrowright"]) {
        dx += 1;
        player.facing = "right";
      }

      if (dx !== 0 || dy !== 0) {
        const len = Math.hypot(dx, dy) || 1;
        dx /= len;
        dy /= len;

        const nextX = player.x + dx * player.speed * dt;
        const nextY = player.y + dy * player.speed * dt;

let blockedX = false;
let blockedY = false;

const nextPlayerBoxX = getFootBox(nextX, player.y, player.w, player.h);
const nextPlayerBoxY = getFootBox(player.x, nextY, player.w, player.h);

// BUILDINGS
for (const b of buildings) {
  if (!b.solid) continue;

  const bBox = getFootBox(b.x, b.y, b.w, b.h);

  if (boxesOverlap(nextPlayerBoxX, bBox)) blockedX = true;
  if (boxesOverlap(nextPlayerBoxY, bBox)) blockedY = true;
}

// PROPS
for (const prop of props) {
  if (!prop.solid) continue;

  const pBox = getFootBox(prop.x, prop.y, prop.w, prop.h);

  if (boxesOverlap(nextPlayerBoxX, pBox)) blockedX = true;
  if (boxesOverlap(nextPlayerBoxY, pBox)) blockedY = true;
}

// TUMBLEWEEDS
for (const weed of tumbleweeds) {
  if (!weed.solid) continue;

  const wBox = getTumbleweedFootBox(weed);

  if (boxesOverlap(nextPlayerBoxX, wBox)) blockedX = true;
  if (boxesOverlap(nextPlayerBoxY, wBox)) blockedY = true;
}
// NPCS
for (const npc of npcs) {
  const nBox = getFootBox(npc.x, npc.y, npc.w, npc.h);

  if (boxesOverlap(nextPlayerBoxX, nBox)) blockedX = true;
  if (boxesOverlap(nextPlayerBoxY, nBox)) blockedY = true;
}

        player.x = clamp(blockedX ? player.x : nextX, 0, CFG.worldWidth - player.w);
        player.y = clamp(blockedY ? player.y : nextY, getTownFrontY() + 40, CFG.worldHeight - player.h);
      }

      let nearestBuilding: Building | null = null;
      let nearestDist = Infinity;

      for (const b of buildings) {
        const pt = getDoorInteractPoint(b);
        const d = dist(
          player.x + player.w / 2,
          player.y + player.h / 2,
          pt.x,
          pt.y
        );

        if (d < CFG.interactRadius && d < nearestDist) {
          nearestBuilding = b;
          nearestDist = d;
        }
      }

      if (nearestBuilding) {
        player.nearBuildingId = nearestBuilding.id;

        if (isBuildingOpen(nearestBuilding)) {
          if (nearestBuilding.type === "house") {
            player.promptText = `I • Sleep`;
          } else if (nearestBuilding.type === "job") {
            player.promptText = `I • Start Shift`;
          } else if (nearestBuilding.type === "bank") {
            player.promptText = `I • Use Bank`;
          }
        } else {
          player.promptText = `I • ${nearestBuilding.name} Closed`;
        }
      }
    };

    // =========================================================
    // NPC UPDATE
    // =========================================================
    const updateNPCs = (dt: number) => {
  const hour = Math.floor(world.minutes / 60) % 24;

  for (const npc of npcs) {
    if (npc.id === "helia") {
      npc.target =
        hour >= CFG.bakeryOpenHour && hour < CFG.bakeryCloseHour
          ? "work"
          : "home";
    } else if (npc.id === "rowe") {
      npc.target =
        hour >= CFG.bankOpenHour && hour < CFG.bankCloseHour
          ? "work"
          : "home";
    } else {
      npc.target = hour < 18 ? "home" : "idle";
    }

    let tx = npc.homePos.x;
    let ty = npc.homePos.y;

    if (npc.target === "work") {
      tx = npc.workPos.x;
      ty = npc.workPos.y;
    } else if (npc.target === "idle") {
      tx = npc.idlePos.x;
      ty = npc.idlePos.y;
    }

    const dx = tx - npc.x;
    const dy = ty - npc.y;
    const d = Math.hypot(dx, dy);

    npc.moving = d > 2;

    if (npc.moving) {
      const vx = (dx / d) * CFG.npcSpeed * dt;
      const vy = (dy / d) * CFG.npcSpeed * dt;

   const nextX = npc.x + vx;
const nextY = npc.y + vy;

let blockedX = false;
let blockedY = false;

const npcBoxX = getFootBox(nextX, npc.y, npc.w, npc.h);
const npcBoxY = getFootBox(npc.x, nextY, npc.w, npc.h);

// BUILDINGS
for (const b of buildings) {
  if (!b.solid) continue;
  const bBox = getFootBox(b.x, b.y, b.w, b.h);

  if (boxesOverlap(npcBoxX, bBox)) blockedX = true;
  if (boxesOverlap(npcBoxY, bBox)) blockedY = true;
}

// PROPS
for (const prop of props) {
  if (!prop.solid) continue;
  const pBox = getFootBox(prop.x, prop.y, prop.w, prop.h);

  if (boxesOverlap(npcBoxX, pBox)) blockedX = true;
  if (boxesOverlap(npcBoxY, pBox)) blockedY = true;
}

// TUMBLEWEEDS
for (const weed of tumbleweeds) {
  if (!weed.solid) continue;

  const wBox = getTumbleweedFootBox(weed);

  if (boxesOverlap(npcBoxX, wBox)) blockedX = true;
  if (boxesOverlap(npcBoxY, wBox)) blockedY = true;
}
// PLAYER
const playerBox = getFootBox(player.x, player.y, player.w, player.h);
if (boxesOverlap(npcBoxX, playerBox)) blockedX = true;
if (boxesOverlap(npcBoxY, playerBox)) blockedY = true;

// OTHER NPCS
for (const other of npcs) {
  if (other === npc) continue;

  const otherBox = getFootBox(other.x, other.y, other.w, other.h);

  if (boxesOverlap(npcBoxX, otherBox)) blockedX = true;
  if (boxesOverlap(npcBoxY, otherBox)) blockedY = true;
}

if (!blockedX) npc.x = nextX;
if (!blockedY) npc.y = nextY;

      const speed = Math.hypot(vx, vy);
      npc.walkPhase += speed * 0.11;

      if (Math.abs(vx) > 0.04) {
        npc.facing = vx >= 0 ? "right" : "left";
      }
    } else {
      npc.walkPhase = 0;
    }
  }
};
    // =========================================================
    // JOB UPDATE
    // =========================================================
  const updateBakeryJob = (dt: number) => {
  if (!bakeryJob.active) return;

  bakeryJob.countdown -= dt;

  bakeryJob.marker += bakeryJob.markerDir * dt * bakeryJob.markerSpeed;

  if (bakeryJob.marker >= 1) {
    bakeryJob.marker = 1;
    bakeryJob.markerDir = -1;
  } else if (bakeryJob.marker <= 0) {
    bakeryJob.marker = 0;
    bakeryJob.markerDir = 1;
  }

  // screen shake settles down
  bakeryJob.shake = Math.max(0, bakeryJob.shake - dt * 18);

  if (bakeryJob.countdown <= 0) {
    finishBakeryShift();
  }
};

    // =========================================================
    // AMBIENT UPDATE
    // =========================================================
  const updateAmbient = (dt: number) => {
  for (const cloud of clouds) {
    cloud.x += cloud.speed * dt;
    if (cloud.x > CFG.worldWidth + 320) {
      cloud.x = -cloud.w - Math.random() * 260;
      cloud.y = 150 + Math.random() * 140;
      cloud.w = 130 + Math.random() * 110;
      cloud.h = 42 + Math.random() * 28;
    }
  }

  for (const line of windLines) {
    line.x += line.speed * dt;
    line.sway += dt * 1.7;

    if (line.x > CFG.worldWidth + 240) {
      line.x = -line.len - Math.random() * 200;
      line.y = 140 + Math.random() * 360;
      line.len = 90 + Math.random() * 110;
      line.speed = 90 + Math.random() * 70;
      line.amp = 8 + Math.random() * 10;
      line.alpha = 0.10 + Math.random() * 0.10;
    }
  }

  for (const weed of tumbleweeds) {
    weed.x += weed.speed * dt;

    if (weed.x > CFG.worldWidth + 140) {
      weed.x = -120 - Math.random() * 180;
      weed.y = 980 + Math.random() * 70;
      weed.speed = 28 + Math.random() * 24;
      weed.size = 0.82 + Math.random() * 0.4;
    }

    const spinRate = weed.speed * 0.06;
    weed.rot = (weed.rot + spinRate * dt) % (Math.PI * 2);
    weed.bounce = Math.abs(Math.sin(performance.now() * 0.0052 + weed.phase)) * 2.3 * weed.size;
  }

for (const line of streetWindLines) {
  line.x += line.speed * dt;
  line.sway += dt * 3.2;

  if (line.x > CFG.worldWidth + 180) {
    line.x = -line.len - Math.random() * 220;
    line.y = 905 + Math.random() * 180;
    line.len = 50 + Math.random() * 90;
    line.speed = 140 + Math.random() * 90;
    line.amp = 4 + Math.random() * 6;
    line.alpha = 0.10 + Math.random() * 0.10;
    line.thickness = 1 + Math.random() * 1.4;
    line.loops = Math.random() < 0.35;
  }
}

for (const bird of birds) {
  bird.x += bird.speed * dt * bird.dir;
  bird.flap += dt * (7.5 + bird.speed * 0.02);
  bird.bob += dt * 2.2;

  if (bird.dir === 1 && bird.x > CFG.worldWidth + 220) {
    bird.x = -140 - Math.random() * 140;
    bird.y = 100 + Math.random() * 150;
    bird.speed = 102 + Math.random() * 26; //bird speed//
    bird.scale = 0.2 + Math.random() * 0.45;
  } else if (bird.dir === -1 && bird.x < -220) {
    bird.x = CFG.worldWidth + 140 + Math.random() * 140;
    bird.y = 100 + Math.random() * 150;
    bird.speed = 100 + Math.random() * 26;
    bird.scale = 0.2 + Math.random() * 0.45;
  }
}
  };

    // =========================================================
    // CAMERA UPDATE
    // =========================================================
    const updateCamera = (w: number, h: number) => {
      const targetX = player.x + player.w / 2 - w / 2;
      const targetY = player.y + player.h / 2 - h / 2;

      camera.x = clamp(lerp(camera.x, targetX, 0.12), 0, CFG.worldWidth - w);
      camera.y = clamp(lerp(camera.y, targetY, 0.12), 0, CFG.worldHeight - h);
    };
//----dust update---///
const updateDustPuffs = (dt: number) => {
  for (let i = dustPuffs.length - 1; i >= 0; i--) {
    const d = dustPuffs[i];

    d.life += dt;
    if (d.life >= d.maxLife) {
      dustPuffs.splice(i, 1);
      continue;
    }

    d.x += d.vx * dt;
    d.y += d.vy * dt;

    d.vx *= 0.94;
    d.vy *= 0.90;

    // extra upward float
    d.y -= 6 * dt;
  }
};

    // =========================================================
    // WORLD DRAW
    // =========================================================

//----------draw cloud-----//
const drawCloud = (
  x: number,
  y: number,
  w: number,
  h: number,
  alpha: number
) => {
  const px = x - camera.x * 0.14;
  const py = y - camera.y * 0.05;

  ctx.save();
  ctx.globalAlpha = alpha;

  // soft under-shadow first
  ctx.fillStyle = "rgba(181, 141, 104, 0.18)";
  ctx.beginPath();
  ctx.ellipse(px + w * 0.48, py + h * 0.70, w * 0.42, h * 0.20, 0, 0, Math.PI * 2);
  ctx.fill();

  // main body
  ctx.fillStyle = "#fff6ea";
  ctx.beginPath();
  ctx.moveTo(px + w * 0.08, py + h * 0.62);

  ctx.quadraticCurveTo(px + w * 0.04, py + h * 0.44, px + w * 0.16, py + h * 0.38);
  ctx.quadraticCurveTo(px + w * 0.18, py + h * 0.14, px + w * 0.34, py + h * 0.18);
  ctx.quadraticCurveTo(px + w * 0.44, py - h * 0.02, px + w * 0.60, py + h * 0.12);
  ctx.quadraticCurveTo(px + w * 0.76, py + h * 0.08, px + w * 0.84, py + h * 0.24);
  ctx.quadraticCurveTo(px + w * 0.96, py + h * 0.26, px + w * 0.92, py + h * 0.46);
  ctx.quadraticCurveTo(px + w * 0.98, py + h * 0.58, px + w * 0.86, py + h * 0.66);
  ctx.quadraticCurveTo(px + w * 0.66, py + h * 0.78, px + w * 0.48, py + h * 0.72);
  ctx.quadraticCurveTo(px + w * 0.28, py + h * 0.78, px + w * 0.08, py + h * 0.62);
  ctx.closePath();
  ctx.fill();

  // warm underside
  ctx.fillStyle = "rgba(214, 182, 145, 0.24)";
  ctx.beginPath();
  ctx.moveTo(px + w * 0.18, py + h * 0.58);
  ctx.quadraticCurveTo(px + w * 0.34, py + h * 0.68, px + w * 0.50, py + h * 0.65);
  ctx.quadraticCurveTo(px + w * 0.70, py + h * 0.70, px + w * 0.83, py + h * 0.58);
  ctx.quadraticCurveTo(px + w * 0.73, py + h * 0.78, px + w * 0.48, py + h * 0.78);
  ctx.quadraticCurveTo(px + w * 0.24, py + h * 0.78, px + w * 0.18, py + h * 0.58);
  ctx.closePath();
  ctx.fill();

  // top highlight
  ctx.strokeStyle = "rgba(255,255,255,0.44)";
  ctx.lineWidth = 2.2;
  ctx.beginPath();
  ctx.moveTo(px + w * 0.22, py + h * 0.24);
  ctx.quadraticCurveTo(px + w * 0.34, py + h * 0.06, px + w * 0.49, py + h * 0.12);
  ctx.quadraticCurveTo(px + w * 0.63, py + h * 0.08, px + w * 0.77, py + h * 0.25);
  ctx.stroke();

  ctx.restore();
};
const drawMountainBand = (
  baseY: number,
  color: string,
  peaks: { x: number; y: number }[],
  parallax = 0.12
) => {
  const offsetX = -camera.x * parallax;
  const light = getLightShadow();
  const celestial = getCelestialInfo();

  const dir = clamp(light.dx / LIGHTING_TUNE.shadowSideDrift, -1, 1);
  const sideAmount = Math.abs(dir);

  // Midday support: this rises when the side shadow gets weak
  const frontalAmount = 1 - sideAmount;

  // Directional shadow colors
  const shadowBase = celestial.kind === "sun" ? "25, 20, 40" : "15, 15, 35";
  const shadowAlpha = (celestial.kind === "sun" ? 0.22 : 0.14) * sideAmount;

  // Ambient detail colors used ALL day
  const ambientCrease = celestial.kind === "sun"
    ? "rgba(35, 30, 45, 0.12)"
    : "rgba(20, 22, 38, 0.16)";

  const ambientRidge = celestial.kind === "sun"
    ? "rgba(255, 245, 220, 0.10)"
    : "rgba(210, 225, 255, 0.08)";

  ctx.save();
  ctx.translate(offsetX, 0);

  // --------------------------------------------------
  // 1. MAIN MOUNTAIN MASS (FULLY OPAQUE)
  // --------------------------------------------------
  const bodyPath = new Path2D();
  bodyPath.moveTo(-4000, canvas.height);

  for (let i = 0; i < peaks.length; i++) {
    const p = peaks[i];
    bodyPath.lineTo(p.x - 140, baseY);
    bodyPath.lineTo(p.x - 40, p.y + 15);
    bodyPath.lineTo(p.x, p.y);
    bodyPath.lineTo(p.x + 50, p.y + 20);
    bodyPath.lineTo(p.x + 150, baseY);
  }

  bodyPath.lineTo(canvas.width + 4000, baseY);
  bodyPath.lineTo(canvas.width + 4000, canvas.height);
  bodyPath.closePath();

  // Opaque body gradient
  const bodyGrad = ctx.createLinearGradient(0, baseY - 260, 0, baseY);
  bodyGrad.addColorStop(0, color);
  bodyGrad.addColorStop(0.72, color);
  bodyGrad.addColorStop(1, shadeHex(color, -0.18));

  ctx.fillStyle = bodyGrad;
  ctx.fill(bodyPath);

  // --------------------------------------------------
  // 2. BASE HAZE ONLY AT THE VERY BOTTOM
  //    (keeps body opaque while softening the foot)
  // --------------------------------------------------
  const hazeGrad = ctx.createLinearGradient(0, baseY - 10, 0, baseY + 120);
  hazeGrad.addColorStop(0, "rgba(0,0,0,0)");
  hazeGrad.addColorStop(1, "rgba(115,125,145,0.22)");

  ctx.fillStyle = hazeGrad;
  ctx.fill(bodyPath);

  // --------------------------------------------------
  // 3. ALWAYS-ON AMBIENT FACETS
  //    These are what make midday still feel dimensional
  // --------------------------------------------------
  for (const p of peaks) {
    // Large soft center crease
    ctx.fillStyle = ambientCrease;
    ctx.beginPath();
    ctx.moveTo(p.x, p.y + 6);
    ctx.lineTo(p.x - 24, p.y + 55);
    ctx.lineTo(p.x - 10, baseY);
    ctx.lineTo(p.x + 16, baseY);
    ctx.lineTo(p.x + 10, p.y + 46);
    ctx.closePath();
    ctx.fill();

    // Side facet on one face
    ctx.fillStyle = "rgba(255,255,255,0.03)";
    ctx.beginPath();
    ctx.moveTo(p.x, p.y);
    ctx.lineTo(p.x - 34, p.y + 18);
    ctx.lineTo(p.x - 82, baseY);
    ctx.lineTo(p.x - 8, baseY);
    ctx.closePath();
    ctx.fill();

    // Opposite darker facet
    ctx.fillStyle = "rgba(0,0,0,0.05)";
    ctx.beginPath();
    ctx.moveTo(p.x, p.y + 4);
    ctx.lineTo(p.x + 24, p.y + 24);
    ctx.lineTo(p.x + 72, baseY);
    ctx.lineTo(p.x + 8, baseY);
    ctx.closePath();
    ctx.fill();
  }

  // --------------------------------------------------
  // 4. DIRECTIONAL SHADOWS
  //    Stronger near sunrise/sunset, weaker at midday
  // --------------------------------------------------
  if (sideAmount > 0.03) {
    for (const p of peaks) {
      ctx.fillStyle = `rgba(${shadowBase}, ${shadowAlpha})`;
      ctx.beginPath();
      ctx.moveTo(p.x, p.y);
      ctx.lineTo(p.x + 40 * dir, p.y + 35);
      ctx.lineTo(p.x + 110 * dir * sideAmount, baseY);
      ctx.lineTo(p.x, baseY);
      ctx.closePath();
      ctx.fill();

      ctx.fillStyle = `rgba(${shadowBase}, ${shadowAlpha * 1.45})`;
      ctx.beginPath();
      ctx.moveTo(p.x, p.y + 10);
      ctx.lineTo(p.x + 15 * dir, p.y + 45);
      ctx.lineTo(p.x + 5 * dir, p.y + 82);
      ctx.closePath();
      ctx.fill();
    }
  }

  // --------------------------------------------------
  // 5. RIDGE HIGHLIGHTS
  //    Always present a bit, stronger when side-lit
  // --------------------------------------------------
  for (const p of peaks) {
    const ridgeStrength =
      (celestial.kind === "sun" ? 0.08 : 0.05) + // always-on minimum
      (celestial.kind === "sun" ? 0.22 : 0.12) * sideAmount;

    const ridgeColor =
      celestial.kind === "sun" ? "255, 240, 200" : "200, 220, 255";

    const highlightDir = sideAmount > 0.04 ? -dir : -0.35;

    ctx.strokeStyle = `rgba(${ridgeColor}, ${ridgeStrength})`;
    ctx.lineWidth = 2.2;
    ctx.lineJoin = "round";
    ctx.lineCap = "round";

    ctx.beginPath();
    ctx.moveTo(p.x, p.y);
    ctx.lineTo(p.x + 16 * highlightDir, p.y + 10);
    ctx.lineTo(p.x + 30 * highlightDir, p.y + 26);
    ctx.lineTo(p.x + 40 * highlightDir, p.y + 42);
    ctx.stroke();

    // Tiny secondary ridge to help midday shape
    ctx.strokeStyle = ambientRidge;
    ctx.lineWidth = 1.4;
    ctx.beginPath();
    ctx.moveTo(p.x - 6, p.y + 10);
    ctx.lineTo(p.x - 18, p.y + 24);
    ctx.lineTo(p.x - 28, p.y + 42);
    ctx.stroke();
  }

  // --------------------------------------------------
  // 6. MIDDAY EXTRA CREASES
  //    Only really visible when side shadows are weak
  // --------------------------------------------------
  if (frontalAmount > 0.45) {
    ctx.save();
    ctx.globalAlpha = (frontalAmount - 0.45) * 0.45;

    for (const p of peaks) {
      ctx.strokeStyle = "rgba(20, 18, 30, 0.22)";
      ctx.lineWidth = 1.2;
      ctx.beginPath();
      ctx.moveTo(p.x + 4, p.y + 18);
      ctx.lineTo(p.x + 12, p.y + 48);
      ctx.lineTo(p.x + 18, p.y + 82);
      ctx.stroke();

      ctx.beginPath();
      ctx.moveTo(p.x - 10, p.y + 14);
      ctx.lineTo(p.x - 22, p.y + 44);
      ctx.lineTo(p.x - 30, p.y + 74);
      ctx.stroke();
    }

    ctx.restore();
  }

  ctx.restore();
};

//////////////////////////////////////////////////////////////
const LIGHTING_TUNE = {
  sunDiskRadius: 150,
  sunGlowRadius: 800,

  moonDiskRadius: 120,
  moonGlowRadius: 450,

  sunAlpha: 0.95,
  moonAlpha: 0.95,

  sunPathStartX: 0.10,
  sunPathWidth: 0.90,
  sunBaseY: 0.84,
  sunArcHeight: 0.70,

  moonPathStartX: 0.10,
  moonPathWidth: 0.90,
  moonBaseY: 0.84,
  moonArcHeight: 0.70,

  morningStart: 7.0,
  noonStart: 11.3,
  noonEnd: 12.3,
  eveningEnd: 20,

  minShadowLength: 18,
  maxShadowLength: 220,

  minShadowDy: 14,
  maxShadowDy: 42,

  shadowSideDrift: 110,

  nightShadowAlpha: 0.03,

  // no longer relied on much by the old method, but okay to keep
  dayShadowMinAlpha: 0.30,
  dayShadowMaxAlpha: 0.62,
};
////////////////////////////////////////////////////////////////////////////////////


//------------------draw backround-------//
  const drawBackground = (ctx: CanvasRenderingContext2D, w: number, h: number) => {
  const sky = getSkyColors();

  // 1. THE SKY
  const skyGrad = ctx.createLinearGradient(0, 0, 0, h);
  skyGrad.addColorStop(0, sky.top);
  skyGrad.addColorStop(0.55, sky.mid);
  skyGrad.addColorStop(1, sky.low);
  ctx.fillStyle = skyGrad;
  ctx.fillRect(0, 0, w, h);

  const horizonY = h * 0.58;
  const dayMinutes = world.minutes % (24 * 60);

  // SUN: 6 AM (360) to 6 PM (1080)
  const sunVisible = dayMinutes >= 6 * 60 && dayMinutes <= 18 * 60;
  // MOON: 6 PM (1080) to 6 AM (360)
  const moonVisible = dayMinutes > 18 * 60 || dayMinutes < 6 * 60;

  // 2. THE SUN
if (sunVisible) {
  const T = LIGHTING_TUNE;
  const sunT = (dayMinutes - 6 * 60) / (12 * 60);

  const sunX = w * (T.sunPathStartX + T.sunPathWidth * sunT);
  const sunY = h * (T.sunBaseY - Math.sin(sunT * Math.PI) * T.sunArcHeight);

  ctx.save();
  ctx.globalCompositeOperation = "screen";

  // big outer amber bloom
  const sunBloom = ctx.createRadialGradient(
    sunX,
    sunY,
    0,
    sunX,
    sunY,
    T.sunGlowRadius
  );
  sunBloom.addColorStop(0, "rgba(255, 204, 92, 0.30)");
  sunBloom.addColorStop(0.22, "rgba(255, 171, 56, 0.42)");
  sunBloom.addColorStop(0.52, "rgba(255, 124, 34, 0.22)");
  sunBloom.addColorStop(1, "rgba(255, 120, 30, 0)");
  ctx.fillStyle = sunBloom;
  ctx.beginPath();
  ctx.arc(sunX, sunY, T.sunGlowRadius, 0, Math.PI * 2);
  ctx.fill();

  // tighter hot core glow
  const coreGlow = ctx.createRadialGradient(
    sunX,
    sunY,
    0,
    sunX,
    sunY,
    T.sunDiskRadius * 1.45
  );
  coreGlow.addColorStop(0, "rgba(255, 248, 190, 0.55)");
  coreGlow.addColorStop(0.55, "rgba(255, 196, 84, 0.32)");
  coreGlow.addColorStop(1, "rgba(255, 170, 60, 0)");
  ctx.fillStyle = coreGlow;
  ctx.beginPath();
  ctx.arc(sunX, sunY, T.sunDiskRadius * 1.45, 0, Math.PI * 2);
  ctx.fill();

  const sun = getCelestialInfo();
  const horizonGlowStrength = sun.height01 * 0.65 + 0.15;

  const horizonGlow = ctx.createLinearGradient(0, horizonY - 50, 0, horizonY + 150);
  horizonGlow.addColorStop(0, "rgba(255, 190, 120, 0)");
  horizonGlow.addColorStop(0.45, `rgba(255, 176, 92, ${0.14 * horizonGlowStrength})`);
  horizonGlow.addColorStop(1, `rgba(255, 132, 68, ${0.22 * horizonGlowStrength})`);
  ctx.fillStyle = horizonGlow;
  ctx.fillRect(0, horizonY - 50, w, 200);

  // disk: yellow center -> orange edge
  const sunDisk = ctx.createRadialGradient(
    sunX - T.sunDiskRadius * 0.18,
    sunY - T.sunDiskRadius * 0.18,
    T.sunDiskRadius * 0.12,
    sunX,
    sunY,
    T.sunDiskRadius
  );
  sunDisk.addColorStop(0, "#fff4a8");
  sunDisk.addColorStop(0.45, "#ffd15c");
  sunDisk.addColorStop(0.82, "#ffaf3f");
  sunDisk.addColorStop(1, "#ff8c2f");

  ctx.globalAlpha = T.sunAlpha;
  ctx.fillStyle = sunDisk;
  ctx.beginPath();
  ctx.arc(sunX, sunY, T.sunDiskRadius, 0, Math.PI * 2);
  ctx.fill();

  // subtle darker lower rim to make it feel less flat
  ctx.fillStyle = "rgba(255, 120, 36, 0.18)";
  ctx.beginPath();
  ctx.arc(sunX, sunY + T.sunDiskRadius * 0.08, T.sunDiskRadius * 0.92, 0, Math.PI * 2);
  ctx.fill();

  ctx.restore();
}

  // 3. THE MOON
if (moonVisible) {
  const T = LIGHTING_TUNE;
  const moonClock =
    dayMinutes >= 18 * 60 ? dayMinutes - 18 * 60 : dayMinutes + 6 * 60;
  const moonT = moonClock / (12 * 60);

  const moonX = w * (T.moonPathStartX + T.moonPathWidth * moonT);
  const moonY = h * (T.moonBaseY - Math.sin(moonT * Math.PI) * T.moonArcHeight);

  ctx.save();
  ctx.globalCompositeOperation = "screen";

  const moonGlow = ctx.createRadialGradient(
    moonX,
    moonY,
    0,
    moonX,
    moonY,
    T.moonGlowRadius
  );
  moonGlow.addColorStop(0, "rgba(220, 230, 255, 0.22)");
  moonGlow.addColorStop(1, "rgba(220, 230, 255, 0)");
  ctx.fillStyle = moonGlow;
  ctx.beginPath();
  ctx.arc(moonX, moonY, T.moonGlowRadius, 0, Math.PI * 2);
  ctx.fill();

  ctx.globalAlpha = T.moonAlpha;
  ctx.fillStyle = "#f3f5fb";
  ctx.beginPath();
  ctx.arc(moonX, moonY, T.moonDiskRadius, 0, Math.PI * 2);
  ctx.fill();

 // crater texture
const craters = [
  { ox: -20, oy: -16, r: 7 },
  { ox: -10, oy: 10, r: 9 },
  { ox: 2, oy: -4, r: 6 },
  { ox: 8, oy: 18, r: 5 },
];

ctx.save();

// Clip craters to the moon disk first
ctx.beginPath();
ctx.arc(moonX, moonY, T.moonDiskRadius, 0, Math.PI * 2);
ctx.clip();

for (const c of craters) {
  ctx.fillStyle = "rgba(170, 182, 205, 0.38)";
  ctx.beginPath();
  ctx.arc(moonX + c.ox, moonY + c.oy, c.r, 0, Math.PI * 2);
  ctx.fill();

  ctx.strokeStyle = "rgba(255,255,255,0.16)";
  ctx.lineWidth = 1.2;
  ctx.beginPath();
  ctx.arc(moonX + c.ox - 1, moonY + c.oy - 1, c.r * 0.68, 0, Math.PI * 2);
  ctx.stroke();
}

ctx.restore();

  // crescent cut
  ctx.fillStyle = sky.top;
  ctx.beginPath();
  ctx.arc(
    moonX + T.moonDiskRadius * 0.38,
    moonY - T.moonDiskRadius * 0.18,
    T.moonDiskRadius * 0.84,
    0,
    Math.PI * 2
  );
  ctx.fill();

  ctx.restore();
}

// 4. STARS
if (sky.daylight < 0.25) {
  const nightFade = (0.25 - sky.daylight) * 4;
  const now = Date.now() * 0.001;

  ctx.save();

  for (const star of stars) {
    const sx = star.x - camera.x * 0.02;
    const sy = star.y - camera.y * 0.01;

    if (sx < -10 || sx > w + 10) continue;

    const twinkle =
      0.65 + Math.sin(now * star.twinkleSpeed + star.twinkleOffset) * 0.35;

    const alpha = nightFade * twinkle * 0.9;

    ctx.fillStyle = star.warm
      ? `rgba(255, 235, 190, ${alpha})`
      : `rgba(255, 255, 255, ${alpha})`;

    if (star.size > 1.8) {
      // glow for hero stars
      ctx.fillRect(sx - star.size * 0.5, sy, star.size, 1);
      ctx.fillRect(sx, sy - star.size * 0.5, 1, star.size);

      ctx.globalAlpha = alpha * 0.35;
      ctx.beginPath();
      ctx.arc(sx, sy, star.size * 1.4, 0, Math.PI * 2);
      ctx.fill();
      ctx.globalAlpha = 1;
    }

    ctx.fillRect(sx, sy, star.size, star.size);
  }

  ctx.restore();
}

  // 5. CLOUDS
  for (const cloud of clouds) {
    drawCloud(cloud.x, cloud.y, cloud.w, cloud.h, 0.4 + sky.daylight * 0.4);
  }

drawWindLines();
drawBirds();


drawMountainBand(horizonY - 18, "#c69461", [
  { x: w * 0.10, y: h * 0.33 },
  { x: w * 0.34, y: h * 0.26 },
  { x: w * 0.63, y: h * 0.31 },
  { x: w * 0.86, y: h * 0.27 },
], 0.08);

drawMountainBand(horizonY + 2, "#9a673f", [
  { x: w * 0.18, y: h * 0.41 },
  { x: w * 0.50, y: h * 0.45 },
  { x: w * 0.80, y: h * 0.42 },
], 0.16);

  // 8. DUST HAZE
  const dustBand = ctx.createLinearGradient(0, h * 0.55, 0, h * 0.75);
  dustBand.addColorStop(0, "rgba(232,195,158,0)");
  dustBand.addColorStop(1, `rgba(183,129,82,${0.05 + sky.daylight * 0.12})`);
  ctx.fillStyle = dustBand;
  ctx.fillRect(0, h * 0.55, w, h * 0.2);
};
    //----------------------------------//

//-----------draw ground-------------------------//
const drawGround = () => {
  const worldX = -camera.x;
  const townFrontY = worldToScreen(0, getTownFrontY()).y;
  const roadTop = townFrontY + 118;
  const roadBottom = hCache.height;

  // =====================================================
  // 1. BACK LOT / BUILDING FRONTAGE
  // =====================================================
  const frontageGrad = ctx.createLinearGradient(0, townFrontY, 0, roadTop);
  frontageGrad.addColorStop(0, "#b88458");
  frontageGrad.addColorStop(0.55, "#c79261");
  frontageGrad.addColorStop(1, "#d7a06a");
  ctx.fillStyle = frontageGrad;
  ctx.fillRect(worldX, townFrontY, CFG.worldWidth, roadTop - townFrontY);

  // subtle dust strip to soften where buildings meet ground
  ctx.fillStyle = "rgba(255, 220, 180, 0.10)";
  ctx.fillRect(worldX, townFrontY + 6, CFG.worldWidth, 18);

  // =====================================================
  // 2. BOARDWALK
  // =====================================================
  const bwTopY = townFrontY + 38;
  const bwBottomY = townFrontY + 94;

  ctx.save();

  // main boardwalk body
  const boardwalkGrad = ctx.createLinearGradient(0, bwTopY, 0, bwBottomY);
  boardwalkGrad.addColorStop(0, "#7b5539");
  boardwalkGrad.addColorStop(1, "#5e3f2b");
  ctx.fillStyle = boardwalkGrad;
  ctx.fillRect(worldX, bwTopY, CFG.worldWidth, bwBottomY - bwTopY);

  // top sun strip
  ctx.fillStyle = "rgba(255, 222, 170, 0.18)";
  ctx.fillRect(worldX, bwTopY, CFG.worldWidth, 3);

  // plank seams
  for (let x = -80; x < CFG.worldWidth + 80; x += 22) {
    ctx.strokeStyle = "rgba(45, 28, 18, 0.28)";
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.moveTo(worldX + x, bwTopY);
    ctx.lineTo(worldX + x - 12, bwBottomY);
    ctx.stroke();

    ctx.strokeStyle = "rgba(255,255,255,0.05)";
    ctx.lineWidth = 1;
    ctx.beginPath();
    ctx.moveTo(worldX + x + 1, bwTopY + 1);
    ctx.lineTo(worldX + x - 11, bwBottomY - 1);
    ctx.stroke();
  }

  // front lip / thickness
  ctx.fillStyle = "#493021";
  ctx.fillRect(worldX, bwBottomY, CFG.worldWidth, 10);

  // little post rhythm along the front edge
  ctx.fillStyle = "#3f291d";
  for (let x = 18; x < CFG.worldWidth; x += 42) {
    ctx.fillRect(worldX + x, bwBottomY, 6, 10);
  }

  ctx.restore();

  // =====================================================
  // 3. MAIN STREET
  // =====================================================
  const roadGrad = ctx.createLinearGradient(0, roadTop, 0, roadBottom);
  roadGrad.addColorStop(0, "#d7a06a");
  roadGrad.addColorStop(0.45, "#c48853");
  roadGrad.addColorStop(1, "#9b6038");
  ctx.fillStyle = roadGrad;
  ctx.fillRect(worldX, roadTop, CFG.worldWidth, roadBottom - roadTop);

  // =====================================================
  // 4. WAGON RUTS
  // =====================================================
  const drawRut = (y: number) => {
    ctx.strokeStyle = "rgba(90, 52, 28, 0.22)";
    ctx.lineWidth = 8;
    ctx.beginPath();
    ctx.moveTo(worldX, y);
    ctx.lineTo(worldX + CFG.worldWidth, y + 2);
    ctx.stroke();

    ctx.strokeStyle = "rgba(255, 220, 175, 0.08)";
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.moveTo(worldX, y - 2);
    ctx.lineTo(worldX + CFG.worldWidth, y);
    ctx.stroke();
  };

  drawRut(roadTop + 78);
  drawRut(roadTop + 132);

  // =====================================================
  // 5. DUST PATCHES
  // =====================================================
  ctx.fillStyle = "rgba(255, 230, 190, 0.10)";
  for (let i = 0; i < 18; i++) {
    const px = worldX + ((i * 241) % CFG.worldWidth);
    const py = roadTop + 30 + ((i * 83) % Math.max(1, roadBottom - roadTop - 60));

    ctx.beginPath();
    ctx.ellipse(
      px,
      py,
      18 + (i % 4) * 8,
      5 + (i % 3) * 2,
      ((i % 5) - 2) * 0.08,
      0,
      Math.PI * 2
    );
    ctx.fill();
  }

  // =====================================================
  // 6. SMALL STONES
  // =====================================================
  for (let i = 0; i < 24; i++) {
    const px = worldX + ((i * 173) % CFG.worldWidth);
    const py = roadTop + 22 + ((i * 97) % Math.max(1, roadBottom - roadTop - 40));

    ctx.fillStyle = i % 3 === 0 ? "rgba(120, 82, 50, 0.22)" : "rgba(255, 236, 205, 0.10)";
    ctx.fillRect(px, py, 6 + (i % 2) * 4, 2 + (i % 2));
  }

  // =====================================================
  // 7. GROUNDING SHADOW UNDER BUILDINGS
  // =====================================================
  const shadowGrad = ctx.createLinearGradient(0, townFrontY, 0, roadTop);
  shadowGrad.addColorStop(0, "rgba(0,0,0,0.18)");
  shadowGrad.addColorStop(0.35, "rgba(0,0,0,0.08)");
  shadowGrad.addColorStop(1, "rgba(0,0,0,0)");
  ctx.fillStyle = shadowGrad;
  ctx.fillRect(worldX, townFrontY, CFG.worldWidth, roadTop - townFrontY);

  // =====================================================
  // 8. HORIZON DUST LIFT
  // =====================================================
  const liftGrad = ctx.createLinearGradient(0, roadTop - 10, 0, roadTop + 60);
  liftGrad.addColorStop(0, "rgba(255, 210, 160, 0.10)");
  liftGrad.addColorStop(1, "rgba(255, 210, 160, 0)");
  ctx.fillStyle = liftGrad;
  ctx.fillRect(worldX, roadTop - 10, CFG.worldWidth, 70);
};
//-------------//
const drawProp = (prop: Prop) => {
  const p = worldToScreen(prop.x, prop.y);
  const x = p.x;
  const y = p.y;

  // tighter shadow attached to bottom of prop
  let shadowTop = y + prop.h - 4;
  let shadowBottom = y + prop.h + 4;

  if (prop.type === "wagonWheel") {
    shadowTop = y + prop.h - 6;
    shadowBottom = y + prop.h + 2;
  }

  if (prop.type === "sign") {
    shadowTop = y + prop.h + 6;
    shadowBottom = y + prop.h + 12;
  }

  drawGroundShadowPoly(
    [
      { x: x + prop.w * 0.18, y: shadowTop },
      { x: x + prop.w * 0.82, y: shadowTop },
      { x: x + prop.w * 0.74, y: shadowBottom },
      { x: x + prop.w * 0.26, y: shadowBottom },
    ],
    { alphaMul: 0.52, blur: 1.4 }
  );

  if (prop.type === "barrel") {
    ctx.save();

    const bodyGrad = ctx.createLinearGradient(x, y, x + prop.w, y);
    bodyGrad.addColorStop(0, "#6e4a31");
    bodyGrad.addColorStop(0.5, "#8a5b3d");
    bodyGrad.addColorStop(1, "#5c3c29");
    ctx.fillStyle = bodyGrad;
    ctx.beginPath();
    ctx.roundRect(x, y + 3, prop.w, prop.h - 6, 8);
    ctx.fill();

    ctx.fillStyle = "#8f6847";
    ctx.beginPath();
    ctx.ellipse(x + prop.w / 2, y + 5, prop.w * 0.45, 5, 0, 0, Math.PI * 2);
    ctx.fill();

    ctx.strokeStyle = "#3a271b";
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.ellipse(x + prop.w / 2, y + 5, prop.w * 0.45, 5, 0, 0, Math.PI * 2);
    ctx.stroke();

    ctx.strokeStyle = "#2f241d";
    ctx.lineWidth = 2.2;
    ctx.beginPath();
    ctx.moveTo(x + 3, y + prop.h * 0.28);
    ctx.lineTo(x + prop.w - 3, y + prop.h * 0.28);
    ctx.moveTo(x + 3, y + prop.h * 0.72);
    ctx.lineTo(x + prop.w - 3, y + prop.h * 0.72);
    ctx.stroke();

    ctx.strokeStyle = "rgba(255,255,255,0.10)";
    ctx.lineWidth = 1.2;
    ctx.beginPath();
    ctx.moveTo(x + prop.w * 0.28, y + 8);
    ctx.lineTo(x + prop.w * 0.28, y + prop.h - 8);
    ctx.stroke();

    ctx.restore();
    return;
  }

  if (prop.type === "crate") {
  ctx.save();

  const depth = 6;

  // ----- top face -----
  ctx.fillStyle = "#b07a4f";
  ctx.beginPath();
  ctx.moveTo(x, y);
  ctx.lineTo(x + prop.w, y);
  ctx.lineTo(x + prop.w + depth, y - depth);
  ctx.lineTo(x + depth, y - depth);
  ctx.closePath();
  ctx.fill();

  ctx.strokeStyle = "#4c3423";
  ctx.lineWidth = 1.5;
  ctx.stroke();

  // ----- side face -----
  ctx.fillStyle = "#6f4b32";
  ctx.beginPath();
  ctx.moveTo(x + prop.w, y);
  ctx.lineTo(x + prop.w + depth, y - depth);
  ctx.lineTo(x + prop.w + depth, y + prop.h - depth);
  ctx.lineTo(x + prop.w, y + prop.h);
  ctx.closePath();
  ctx.fill();

  // ----- front face -----
  ctx.fillStyle = "#8b613f";
  ctx.fillRect(x, y, prop.w, prop.h);

  ctx.strokeStyle = "#4c3423";
  ctx.lineWidth = 2;
  ctx.strokeRect(x, y, prop.w, prop.h);

  // plank lines
  ctx.beginPath();
  ctx.moveTo(x, y + prop.h * 0.33);
  ctx.lineTo(x + prop.w, y + prop.h * 0.33);
  ctx.moveTo(x, y + prop.h * 0.66);
  ctx.lineTo(x + prop.w, y + prop.h * 0.66);
  ctx.stroke();

  // vertical plank highlight
  ctx.strokeStyle = "rgba(255,255,255,0.12)";
  ctx.lineWidth = 1;
  ctx.beginPath();
  ctx.moveTo(x + prop.w * 0.28, y + 2);
  ctx.lineTo(x + prop.w * 0.28, y + prop.h - 2);
  ctx.stroke();

  ctx.restore();
  return;
}
};


//----draw dust ground---//
const drawDustPuffs = () => {
  ctx.save();

  for (const d of dustPuffs) {
    const t = d.life / d.maxLife;
    const alpha = d.alpha * (1 - t);
    const size = d.size + d.grow * t;

    // main puff
    ctx.fillStyle = `rgba(222, 188, 145, ${alpha})`;
    ctx.beginPath();
    ctx.ellipse(d.x, d.y, size, size * 0.65, 0, 0, Math.PI * 2);
    ctx.fill();

    // softer outer haze
    ctx.fillStyle = `rgba(222, 188, 145, ${alpha * 0.45})`;
    ctx.beginPath();
    ctx.ellipse(d.x, d.y, size * 1.45, size * 0.9, 0, 0, Math.PI * 2);
    ctx.fill();
  }

  ctx.restore();
};
//--------//

//----------------draw ambient----------//
const drawTumbleweed = (weed: Tumbleweed) => {
  const now = performance.now() * 0.001;
  const shadow = getLightShadow();

  const drawWeedShadow = (tx: number, ty: number, scale: number) => {
    const p = worldToScreen(tx, ty);

    const baseX = p.x;
    const baseY = p.y + 13 * scale;

    const dx = shadow.dx * 0.42;
    const dy = shadow.dy * 0.42;
    const len = Math.max(8, shadow.length * 0.12) * scale;

    const endX = baseX + dx;
    const endY = baseY + dy + len * 0.15;

    const nx = endX - baseX;
    const ny = endY - baseY;
    const nd = Math.hypot(nx, ny) || 1;

    const px = -ny / nd;
    const py = nx / nd;

    const widthNear = 13 * scale;
    const widthFar = 8 * scale;

    ctx.save();
    ctx.globalAlpha = Math.max(0.08, shadow.alpha * 0.85);
    ctx.fillStyle = "#3b2416";
    ctx.filter = "blur(1.4px)";

    ctx.beginPath();
    ctx.moveTo(baseX - px * widthNear, baseY - py * widthNear * 0.45);
    ctx.lineTo(endX - px * widthFar, endY - py * widthFar * 0.45);
    ctx.lineTo(endX + px * widthFar, endY + py * widthFar * 0.45);
    ctx.lineTo(baseX + px * widthNear, baseY + py * widthNear * 0.45);
    ctx.closePath();
    ctx.fill();

    ctx.restore();
  };

  const drawTwigArc = (
    rot: number,
    rx: number,
    ry: number,
    color: string,
    lw: number,
    alpha = 1
  ) => {
    ctx.save();
    ctx.rotate(rot);
    ctx.globalAlpha = alpha;
    ctx.strokeStyle = color;
    ctx.lineWidth = lw;
    ctx.beginPath();
    ctx.ellipse(0, 0, rx, ry, 0, 0, Math.PI * 2);
    ctx.stroke();
    ctx.restore();
  };

  const drawSpokes = (
    count: number,
    innerR: number,
    outerR: number,
    scale: number
  ) => {
    ctx.lineCap = "round";

    for (let i = 0; i < count; i++) {
      const a = (i / count) * Math.PI * 2;
      const extra = i === 0 ? 7 * scale : 0;

      const x1 = Math.cos(a) * innerR * scale;
      const y1 = Math.sin(a) * innerR * scale;

      const x2 = Math.cos(a) * (outerR * scale + extra);
      const y2 = Math.sin(a) * (outerR * scale + extra);

      ctx.beginPath();
      ctx.moveTo(x1, y1);
      ctx.lineTo(x2, y2);
      ctx.stroke();
    }
  };

  const p = worldToScreen(weed.x, weed.y);
  const scale = weed.size;
  const rot = weed.rot;
  const bounce = weed.bounce;

  drawWeedShadow(weed.x, weed.y, scale);

  ctx.save();
  ctx.translate(p.x, p.y - bounce);
  ctx.rotate(rot);

  const squash =
    1 + Math.sin(now * 8 + rot) * 0.02 * Math.min(1.2, weed.speed / 34);
  ctx.scale(squash, 1 / squash);

  ctx.save();
  ctx.translate(-3 * scale, 1.5 * scale);
  drawTwigArc(0.08, 15 * scale, 10 * scale, "#6e5239", 2.0 * scale, 0.85);
  drawTwigArc(
    Math.PI * 0.34,
    11 * scale,
    14 * scale,
    "#7a5b3f",
    1.8 * scale,
    0.78
  );
  ctx.restore();

  drawTwigArc(Math.PI * 0.12, 16 * scale, 13 * scale, "#9b7652", 2.3 * scale, 1);
  drawTwigArc(Math.PI * 0.38, 12 * scale, 16 * scale, "#8a6848", 2.1 * scale, 1);
  drawTwigArc(Math.PI * 0.68, 15 * scale, 11 * scale, "#a8835d", 2.0 * scale, 0.95);

  ctx.save();
  ctx.translate(5 * scale, -2.5 * scale);
  ctx.rotate(0.45);
  drawTwigArc(0, 8 * scale, 6 * scale, "#c49b6b", 1.8 * scale, 0.95);
  drawTwigArc(1.2, 6 * scale, 9 * scale, "#7a5a3e", 1.5 * scale, 0.9);
  ctx.restore();

  ctx.save();
  ctx.strokeStyle = "#6f5138";
  ctx.lineWidth = 1.35 * scale;
  drawSpokes(5, 2.5, 11, scale);
  ctx.restore();

  ctx.strokeStyle = "#5f452f";
  ctx.lineWidth = 1.5 * scale;
  ctx.lineCap = "round";

  const twigs = [
    { a: -0.35, inner: 9, outer: 18 },
    { a: 1.1, inner: 8, outer: 17 },
    { a: 2.45, inner: 7, outer: 16 },
  ];

  for (const twig of twigs) {
    ctx.beginPath();
    ctx.moveTo(
      Math.cos(twig.a) * twig.inner * scale,
      Math.sin(twig.a) * twig.inner * scale
    );
    ctx.lineTo(
      Math.cos(twig.a) * twig.outer * scale,
      Math.sin(twig.a) * twig.outer * scale
    );
    ctx.stroke();
  }

  ctx.save();
  ctx.translate(4 * scale, -3 * scale);
  ctx.rotate(-0.25);
  ctx.strokeStyle = "rgba(255,235,210,0.30)";
  ctx.lineWidth = 1.0 * scale;
  ctx.beginPath();
  ctx.ellipse(0, 0, 7 * scale, 4.5 * scale, 0, 0, Math.PI * 2);
  ctx.stroke();
  ctx.restore();

  ctx.fillStyle = "#5c4330";
  ctx.beginPath();
  ctx.arc(-1.5 * scale, 1 * scale, 2.6 * scale, 0, Math.PI * 2);
  ctx.fill();

  ctx.restore();
};

//-----------------------------------draw time lighting--------------//
const drawTimeLighting = (w: number, h: number) => {
  const daylight = getDaylight(); // 0 = night, 1 = full day
  const hour = (world.minutes / 60) % 24;

  // =====================================================
  // 1. NIGHT WASH
  // Keep it moody, but not so dark that we lose the clean silhouettes.
  // =====================================================
  if (daylight < 0.5) {
    ctx.save();

    const nightIntensity = clamp((0.5 - daylight) / 0.5, 0, 1);

    ctx.globalAlpha = 0.16 + nightIntensity * 0.34;
    ctx.globalCompositeOperation = "multiply";
    ctx.fillStyle = "#22314a";
    ctx.fillRect(0, 0, w, h);

    // subtle cool upper-sky tint so nights feel richer, not flat
    const upperNightGrad = ctx.createLinearGradient(0, 0, 0, h * 0.6);
    upperNightGrad.addColorStop(0, "rgba(32, 48, 78, 0.26)");
    upperNightGrad.addColorStop(1, "rgba(32, 48, 78, 0)");
    ctx.globalAlpha = 1;
    ctx.globalCompositeOperation = "source-over";
    ctx.fillStyle = upperNightGrad;
    ctx.fillRect(0, 0, w, h * 0.6);

    ctx.restore();
  }

  // =====================================================
  // 2. SUNRISE / SUNSET WARMTH
  // Warm desert glow, strongest near horizon.
  // =====================================================
  const isSunrise = hour >= 5.5 && hour <= 8.5;
  const isSunset = hour >= 16.5 && hour <= 19.5;

  if (isSunrise || isSunset) {
    ctx.save();

    const center = isSunrise ? 7 : 18;
    const proximity = clamp(1 - Math.abs(hour - center) / 1.5, 0, 1);

    ctx.globalAlpha = proximity * 0.26;
    ctx.globalCompositeOperation = "overlay";

    const warmGrad = ctx.createLinearGradient(0, 0, 0, h);
    warmGrad.addColorStop(0, "rgba(255, 145, 70, 0.10)");
    warmGrad.addColorStop(0.42, "rgba(255, 196, 115, 0.24)");
    warmGrad.addColorStop(0.72, "rgba(255, 212, 155, 0.28)");
    warmGrad.addColorStop(1, "rgba(255, 240, 220, 0)");
    ctx.fillStyle = warmGrad;
    ctx.fillRect(0, 0, w, h);

    // low horizon glow to sell western dust / evening light
    const horizonGlow = ctx.createLinearGradient(0, h * 0.45, 0, h);
    horizonGlow.addColorStop(0, "rgba(255, 180, 90, 0)");
    horizonGlow.addColorStop(0.65, "rgba(255, 170, 95, 0.12)");
    horizonGlow.addColorStop(1, "rgba(255, 145, 90, 0.20)");
    ctx.globalCompositeOperation = "screen";
    ctx.globalAlpha = proximity * 0.9;
    ctx.fillStyle = horizonGlow;
    ctx.fillRect(0, h * 0.45, w, h * 0.55);

    ctx.restore();
  }

  // =====================================================
  // 3. MIDDAY BLEACH
  // Slight sun-bleached look without washing everything out.
  // =====================================================
  if (daylight > 0.8) {
    ctx.save();

    const peakIntensity = clamp((daylight - 0.8) / 0.2, 0, 1);

    ctx.globalAlpha = peakIntensity * 0.12;
    ctx.globalCompositeOperation = "soft-light";
    ctx.fillStyle = "#fff4d8";
    ctx.fillRect(0, 0, w, h);

    // gentle top-down heat haze brightness
    const heatGrad = ctx.createLinearGradient(0, 0, 0, h);
    heatGrad.addColorStop(0, "rgba(255,255,240,0.10)");
    heatGrad.addColorStop(0.35, "rgba(255,248,220,0.05)");
    heatGrad.addColorStop(1, "rgba(255,240,210,0)");
    ctx.globalAlpha = peakIntensity * 0.8;
    ctx.fillStyle = heatGrad;
    ctx.fillRect(0, 0, w, h);

    ctx.restore();
  }

  // =====================================================
  // 4. VIGNETTE
  // Keep this light so the art stays readable.
  // =====================================================
  ctx.save();

  const vignette = ctx.createRadialGradient(
    w / 2,
    h / 2,
    w * 0.28,
    w / 2,
    h / 2,
    w * 0.82
  );
  vignette.addColorStop(0, "rgba(0,0,0,0)");
  vignette.addColorStop(0.72, "rgba(50, 28, 10, 0.04)");
  vignette.addColorStop(1, `rgba(36, 20, 8, ${0.10 + (1 - daylight) * 0.14})`);

  ctx.fillStyle = vignette;
  ctx.fillRect(0, 0, w, h);

  ctx.restore();
};
//---------------------------------------------//

//-----draw door----/
const drawDoor = (x: number, y: number, w: number, h: number) => {
  const daylight = getDaylight();
  const isNightLit = daylight < 0.38;

  // =====================================================
  // 1. OUTER FRAME
  // Heavier and chunkier so it reads from farther away.
  // =====================================================
  ctx.fillStyle = "#3b2418";
  ctx.fillRect(x - 5, y - 5, w + 10, h + 8);

  // inner sunlit trim
  ctx.fillStyle = "#8a5b3d";
  ctx.fillRect(x - 2, y - 2, w + 4, h + 2);

  // =====================================================
  // 2. MAIN DOOR BODY
  // Simpler large wood shapes > too much fine texture.
  // =====================================================
  const bodyGrad = ctx.createLinearGradient(x, y, x, y + h);
  bodyGrad.addColorStop(0, "#855638");
  bodyGrad.addColorStop(1, "#683f29");
  ctx.fillStyle = bodyGrad;
  ctx.fillRect(x, y, w, h);

  // =====================================================
  // 3. VERTICAL PLANK RHYTHM
  // Thick readable boards, not overly noisy.
  // =====================================================
  const plankCount = 4;
  const pw = w / plankCount;

  for (let i = 0; i < plankCount; i++) {
    const px = x + i * pw;

    ctx.fillStyle = i % 2 === 0 ? "rgba(255,255,255,0.04)" : "rgba(0,0,0,0.05)";
    ctx.fillRect(px, y, pw, h);

    if (i > 0) {
      ctx.strokeStyle = "rgba(35, 20, 12, 0.34)";
      ctx.lineWidth = 1.5;
      ctx.beginPath();
      ctx.moveTo(px, y + 2);
      ctx.lineTo(px, y + h - 2);
      ctx.stroke();
    }
  }

  // =====================================================
  // 4. TOP HIGHLIGHT / BOTTOM SHADE
  // Helps sell volume in a simple cartoony way.
  // =====================================================
  ctx.fillStyle = "rgba(255, 224, 180, 0.10)";
  ctx.fillRect(x + 1, y + 1, w - 2, 4);

  ctx.fillStyle = "rgba(0,0,0,0.16)";
  ctx.fillRect(x + 1, y + h - 6, w - 2, 5);

  // =====================================================
  // 5. CROSS LEDGERS
  // Chunkier western construction read.
  // =====================================================
  const drawLedger = (ly: number) => {
    ctx.fillStyle = "#533220";
    ctx.fillRect(x + 2, ly, w - 4, 9);

    ctx.fillStyle = "rgba(255,255,255,0.06)";
    ctx.fillRect(x + 2, ly, w - 4, 2);

    ctx.fillStyle = "rgba(0,0,0,0.18)";
    ctx.fillRect(x + 2, ly + 7, w - 4, 2);
  };

  drawLedger(y + h * 0.18);
  drawLedger(y + h * 0.74);

  // optional center brace to make it feel more handcrafted
  ctx.strokeStyle = "rgba(60, 35, 20, 0.55)";
  ctx.lineWidth = 4;
  ctx.beginPath();
  ctx.moveTo(x + 8, y + h * 0.74 + 4);
  ctx.lineTo(x + w - 8, y + h * 0.18 + 4);
  ctx.stroke();

  // =====================================================
  // 7. HINGES
  // Simple black iron, readable at a glance.
  // =====================================================
  const drawHinge = (hy: number) => {
    ctx.fillStyle = "#1f1a18";
    ctx.fillRect(x - 2, hy, 11, 4);

    ctx.fillStyle = "#514846";
    ctx.fillRect(x + 3, hy + 1, 2, 2);
  };

  drawHinge(y + h * 0.26);
  drawHinge(y + h * 0.79);

  // =====================================================
  // 8. LATCH
  // Ring + plate keeps the western feel.
  // =====================================================
  const latchX = x + w - 11;
  const latchY = y + h * 0.57;

  ctx.fillStyle = "#1f1a18";
  ctx.fillRect(latchX - 7, latchY - 3, 5, 6);

  ctx.strokeStyle = "#1f1a18";
  ctx.lineWidth = 2;
  ctx.beginPath();
  ctx.arc(latchX, latchY, 4, 0, Math.PI * 2);
  ctx.stroke();

  // =====================================================
  // 9. OUTLINE
  // Final crisp read.
  // =====================================================
  ctx.strokeStyle = "rgba(28, 16, 10, 0.75)";
  ctx.lineWidth = 2;
  ctx.strokeRect(x, y, w, h);
};
//-------------//

//------------draw building----------------//

const drawBuilding = (b: Building) => {
  const p = worldToScreen(b.x, b.y);
  const style = b.facadeStyle ?? "shop";
  const daylight = getDaylight();
  const open = isBuildingOpen(b);

  const bodyX = p.x;
  const bodyY = p.y;
  const bodyW = b.w;
  const bodyH = b.h;

  const doorX = p.x + (b.door.x - b.x);
  const doorY = p.y + (b.door.y - b.y);
  const shadowBaseY = bodyY + bodyH;

  const depth = style === "bank" ? 16 : style === "shop" ? 14 : 12;

  const toneColor = (hex: string, shade = 0, warm = 0) => {
    const clean = hex.replace("#", "");
    const num = parseInt(clean, 16);

    let r = (num >> 16) & 255;
    let g = (num >> 8) & 255;
    let bb = num & 255;

    const darkT = Math.max(0, Math.min(1, 1 - shade));
    r = Math.round(r * darkT);
    g = Math.round(g * darkT);
    bb = Math.round(bb * darkT);

    r = Math.min(255, Math.round(r + 65 * warm));
    g = Math.min(255, Math.round(g + 38 * warm));
    bb = Math.min(255, Math.round(bb + 10 * warm));

    return `rgb(${r}, ${g}, ${bb})`;
  };

  const warmLight = daylight < 0.38 && open ? 0.28 : 0;

  const palette =
    style === "house"
      ? {
          woodA: "#7b604a",
          woodB: "#6d543f",
          woodC: "#8a6a51",
          trim: "#5a4332",
          side: "#5d4939",
          roof: "#6c4d39",
          sign: "#b99a72",
          post: "#4e3829",
          opening: daylight > 0.45 ? "#5a4636" : "#241913",
        }
      : style === "bank"
      ? {
          woodA: "#86634a",
          woodB: "#73533e",
          woodC: "#977258",
          trim: "#563c2b",
          side: "#634635",
          roof: "#765541",
          sign: "#c8ab7d",
          post: "#4b3426",
          opening: daylight > 0.45 ? "#584536" : "#211711",
        }
      : {
          woodA: "#8b6748",
          woodB: "#78563b",
          woodC: "#9b7554",
          trim: "#5a3f2d",
          side: "#694b35",
          roof: "#7a5942",
          sign: "#cfb081",
          post: "#4f3829",
          opening: daylight > 0.45 ? "#5b4737" : "#241a14",
        };

  const drawPlank = (
    cx: number,
    cy: number,
    w: number,
    h: number,
    color: string,
    rotation = 0
  ) => {
    ctx.save();
    ctx.translate(cx, cy);
    ctx.rotate(rotation);

    ctx.fillStyle = color;
    ctx.fillRect(-w / 2, -h / 2, w, h);

    ctx.strokeStyle = "rgba(40,20,10,0.22)";
    ctx.lineWidth = 1;
    ctx.strokeRect(-w / 2, -h / 2, w, h);

    ctx.beginPath();
    ctx.moveTo(-w * 0.28, -h * 0.18);
    ctx.lineTo(w * 0.3, -h * 0.16);
    ctx.moveTo(-w * 0.18, h * 0.1);
    ctx.lineTo(w * 0.16, h * 0.08);
    ctx.strokeStyle = "rgba(90,60,35,0.20)";
    ctx.stroke();

    ctx.restore();
  };

  const drawPlankWall = (
    left: number,
    top: number,
    w: number,
    h: number,
    boardW = 16
  ) => {
    const count = Math.ceil(w / boardW) + 1;
    const colors = [
      toneColor(palette.woodA, 0, warmLight),
      toneColor(palette.woodB, 0, warmLight),
      toneColor(palette.woodC, 0, warmLight),
    ];

    for (let i = 0; i < count; i++) {
      const px = left + 8 + i * (boardW - 1);
      const boardH = h + [0, 5, -4, 3, -6, 4, -2][i % 7];
      const rot = ((i % 2 === 0 ? -1 : 1) * 0.012);
      drawPlank(
        px,
        top + h / 2 + ((i % 3) - 1) * 1.5,
        boardW,
        boardH,
        colors[i % colors.length],
        rot
      );
    }
  };

  const drawOpening = (
    x: number,
    y: number,
    w: number,
    h: number,
    type: "plain" | "display" | "small" = "plain"
  ) => {
    const nightLit = daylight < 0.38 && open;
    const insideColor = nightLit ? "#d9a253" : palette.opening;

    ctx.fillStyle = palette.trim;
    ctx.fillRect(x - 3, y - 3, w + 6, h + 6);

    ctx.fillStyle = insideColor;
    ctx.fillRect(x, y, w, h);

    if (nightLit) {
      ctx.save();
      ctx.globalCompositeOperation = "screen";
      ctx.globalAlpha = type === "display" ? 0.16 : 0.12;
      ctx.fillStyle = "#f1bf68";
      ctx.fillRect(x - 4, y - 4, w + 8, h + 8);
      ctx.restore();
    } else if (daylight > 0.4) {
      ctx.fillStyle = "rgba(255,230,190,0.06)";
      ctx.fillRect(x + 2, y + 2, w - 4, Math.max(3, h * 0.16));
    }

    ctx.strokeStyle = "rgba(35,20,12,0.55)";
    ctx.lineWidth = 1.5;
    ctx.strokeRect(x, y, w, h);

    if (type !== "display") {
      ctx.beginPath();
      ctx.moveTo(x + w / 2, y + 2);
      ctx.lineTo(x + w / 2, y + h - 2);
      ctx.moveTo(x + 2, y + h / 2);
      ctx.lineTo(x + w - 2, y + h / 2);
      ctx.stroke();
    }

    ctx.fillStyle = "#2b1b12";
    ctx.fillRect(x - 2, y + h, w + 4, 4);
  };

  const drawFalseFrontShape = (
    x: number,
    y: number,
    w: number,
    h: number,
    kind: "flat" | "step" | "tallStep"
  ) => {
    ctx.beginPath();

    if (kind === "tallStep") {
      ctx.moveTo(x, y + h);
      ctx.lineTo(x, y + 24);
      ctx.lineTo(x + w * 0.22, y + 24);
      ctx.lineTo(x + w * 0.22, y);
      ctx.lineTo(x + w * 0.78, y);
      ctx.lineTo(x + w * 0.78, y + 24);
      ctx.lineTo(x + w, y + 24);
      ctx.lineTo(x + w, y + h);
    } else if (kind === "step") {
      ctx.moveTo(x, y + h);
      ctx.lineTo(x, y + 18);
      ctx.lineTo(x + 18, y + 18);
      ctx.lineTo(x + 18, y + 8);
      ctx.lineTo(x + w - 18, y + 8);
      ctx.lineTo(x + w - 18, y + 18);
      ctx.lineTo(x + w, y + 18);
      ctx.lineTo(x + w, y + h);
    } else {
      ctx.moveTo(x, y + h);
      ctx.lineTo(x, y);
      ctx.lineTo(x + w, y);
      ctx.lineTo(x + w, y + h);
    }

    ctx.closePath();
    ctx.fill();
  };

  const drawSideDepth = (
    x: number,
    y: number,
    w: number,
    h: number,
    roofTopY: number
  ) => {
    ctx.fillStyle = toneColor(palette.side, 0.05, warmLight * 0.4);
    ctx.beginPath();
    ctx.moveTo(x + w, y);
    ctx.lineTo(x + w + depth, y - depth * 0.55);
    ctx.lineTo(x + w + depth, y + h - depth * 0.12);
    ctx.lineTo(x + w, y + h);
    ctx.closePath();
    ctx.fill();

    ctx.fillStyle = toneColor(palette.roof, 0.04, warmLight * 0.35);
    ctx.beginPath();
    ctx.moveTo(x, roofTopY);
    ctx.lineTo(x + w, roofTopY);
    ctx.lineTo(x + w + depth, roofTopY - depth * 0.55);
    ctx.lineTo(x + depth, roofTopY - depth * 0.55);
    ctx.closePath();
    ctx.fill();
  };

  // =====================================================
  // HOUSE
  // =====================================================
  if (style === "house") {
    const roofPeakX = bodyX + bodyW / 2 - 4;
    const roofPeakY = bodyY - 54;

    drawSideDepth(bodyX, bodyY + 14, bodyW, bodyH - 14, bodyY + 16);

    // back roof
    ctx.fillStyle = toneColor("#5f4534", 0, warmLight * 0.3);
    ctx.beginPath();
    ctx.moveTo(bodyX + 6, bodyY + 22);
    ctx.lineTo(roofPeakX, roofPeakY);
    ctx.lineTo(bodyX + bodyW + 10, bodyY + 22);
    ctx.lineTo(bodyX + bodyW + depth, bodyY + 10);
    ctx.lineTo(roofPeakX + depth * 0.45, roofPeakY - depth * 0.28);
    ctx.lineTo(bodyX + depth, bodyY + 10);
    ctx.closePath();
    ctx.fill();

    // front wall
    drawPlankWall(bodyX + 8, bodyY + 22, bodyW - 16, bodyH - 22, 15);

    // roof front
    ctx.fillStyle = toneColor("#7a5a43", 0, warmLight * 0.35);
    ctx.beginPath();
    ctx.moveTo(bodyX - 10, bodyY + 25);
    ctx.lineTo(roofPeakX, roofPeakY);
    ctx.lineTo(bodyX + bodyW + 9, bodyY + 25);
    ctx.closePath();
    ctx.fill();

    ctx.strokeStyle = "rgba(35,20,12,0.28)";
    ctx.lineWidth = 2;
    for (let i = 0; i < 7; i++) {
      const rx = bodyX + i * (bodyW / 6);
      ctx.beginPath();
      ctx.moveTo(rx, bodyY + 24);
      ctx.lineTo(roofPeakX + (rx - roofPeakX) * 0.14, roofPeakY + 8);
      ctx.stroke();
    }

    // chimney
    ctx.fillStyle = "#8b5e46";
    ctx.fillRect(bodyX + bodyW - 4, roofPeakY + 28, 18, 56);
    ctx.fillStyle = "#6d4735";
    ctx.fillRect(bodyX + bodyW + 6, roofPeakY + 28, 8, 56);

    // porch
    ctx.fillStyle = toneColor("#6f4e39", 0, warmLight * 0.25);
    ctx.fillRect(bodyX + 22, bodyY + bodyH - 18, bodyW - 46, 16);

    ctx.fillStyle = palette.post;
    ctx.fillRect(bodyX + 34, bodyY + bodyH - 30, 10, 28);
    ctx.fillRect(bodyX + bodyW - 44, bodyY + bodyH - 28, 9, 26);

    // windows
    drawOpening(bodyX + 28, bodyY + 66, 34, 42, "plain");
    drawOpening(bodyX + bodyW - 66, bodyY + 63, 30, 40, "plain");

    // small crooked plaque instead of clean sign
    ctx.save();
    ctx.translate(bodyX + bodyW / 2, bodyY + 40);
    ctx.rotate(-0.025);
    ctx.fillStyle = toneColor(palette.sign, 0.02, warmLight * 0.2);
    ctx.fillRect(-(bodyW - 112) / 2, -11, bodyW - 112, 22);
    ctx.strokeStyle = palette.trim;
    ctx.lineWidth = 2;
    ctx.strokeRect(-(bodyW - 112) / 2, -11, bodyW - 112, 22);
    ctx.fillStyle = "#2b1a13";
    ctx.textAlign = "center";
    ctx.font = "bold 12px 'Courier New', Courier, monospace";
    ctx.fillText(b.name.toUpperCase(), 0, 4);
    ctx.restore();

    drawDoor(doorX, doorY, b.door.w, b.door.h);
  }

  // =====================================================
  // SHOP
  // =====================================================
  else if (style === "shop") {
    const facadeTopY = bodyY - 58;

    drawSideDepth(bodyX, facadeTopY + 12, bodyW, bodyH + 46, facadeTopY + 12);

    ctx.fillStyle = toneColor(palette.woodB, 0, warmLight * 0.22);
    drawFalseFrontShape(bodyX, facadeTopY, bodyW, bodyH + 58, "tallStep");

    drawPlankWall(bodyX + 10, facadeTopY + 10, bodyW - 20, bodyH + 40, 15);

    // corner structure
    ctx.fillStyle = palette.post;
    ctx.fillRect(bodyX + 10, facadeTopY + 8, 10, bodyH + 50);
    ctx.fillRect(bodyX + bodyW - 20, facadeTopY + 8, 10, bodyH + 50);

    // sign band
    ctx.fillStyle = toneColor(palette.sign, 0.02, warmLight * 0.15);
    ctx.fillRect(bodyX + 18, facadeTopY + 16, bodyW - 36, 30);
    ctx.strokeStyle = palette.trim;
    ctx.lineWidth = 2;
    ctx.strokeRect(bodyX + 18, facadeTopY + 16, bodyW - 36, 30);

    ctx.fillStyle = "#2b1a13";
    ctx.textAlign = "center";
    ctx.font = "bold 16px 'Courier New', Courier, monospace";
    ctx.fillText(b.name.toUpperCase(), bodyX + bodyW / 2, facadeTopY + 36);

    // sagging awning
    const awningY = facadeTopY + 60;
    const awningX = bodyX + 12;
    const awningW = bodyW - 24;

    for (let i = 0; i < 6; i++) {
      ctx.fillStyle =
        i % 2 === 0
          ? toneColor("#dcc4a0", 0, warmLight * 0.1)
          : toneColor("#9a654b", 0, warmLight * 0.15);
      ctx.fillRect(awningX + i * (awningW / 6), awningY, awningW / 6, 17);
    }

    ctx.fillStyle = "rgba(0,0,0,0.16)";
    ctx.beginPath();
    ctx.moveTo(awningX, awningY + 17);
    ctx.lineTo(awningX + awningW, awningY + 17);
    ctx.lineTo(awningX + awningW - 8, awningY + 28);
    ctx.lineTo(awningX + awningW * 0.5, awningY + 34);
    ctx.lineTo(awningX + 8, awningY + 28);
    ctx.closePath();
    ctx.fill();

    // porch posts
    ctx.fillStyle = palette.post;
    ctx.fillRect(bodyX + 18, awningY + 18, 8, bodyY + bodyH - (awningY + 18));
    ctx.fillRect(bodyX + bodyW - 26, awningY + 18, 8, bodyY + bodyH - (awningY + 18));

    // upper windows
    drawOpening(bodyX + 28, awningY + 40, 26, 34, "small");
    drawOpening(bodyX + bodyW / 2 - 13, awningY + 42, 26, 32, "small");
    drawOpening(bodyX + bodyW - 54, awningY + 39, 24, 34, "small");

    // lower dark openings instead of glass displays
    const displayY = bodyY + bodyH - 92;
    drawOpening(bodyX + 22, displayY, 50, 56, "display");
    drawOpening(bodyX + bodyW - 72, displayY, 50, 56, "display");

    // porch deck
    ctx.fillStyle = toneColor("#6f513b", 0, warmLight * 0.18);
    ctx.fillRect(bodyX - 4, bodyY + bodyH - 14, bodyW + 8, 14);

    drawDoor(doorX, doorY, b.door.w, b.door.h);
  }

  // =====================================================
  // BANK
  // =====================================================
  else {
    const facadeTopY = bodyY - 64;

    drawSideDepth(bodyX, facadeTopY + 12, bodyW, bodyH + 52, facadeTopY + 12);

    ctx.fillStyle = toneColor(palette.woodA, 0, warmLight * 0.18);
    drawFalseFrontShape(bodyX, facadeTopY, bodyW, bodyH + 64, "step");

    drawPlankWall(bodyX + 10, facadeTopY + 10, bodyW - 20, bodyH + 46, 16);

    // sturdier frame, not rich columns
    ctx.fillStyle = palette.post;
    ctx.fillRect(bodyX + 10, facadeTopY + 8, 12, bodyH + 56);
    ctx.fillRect(bodyX + bodyW - 22, facadeTopY + 8, 12, bodyH + 56);

    // top cap
    ctx.fillStyle = toneColor(palette.sign, 0.03, warmLight * 0.12);
    ctx.fillRect(bodyX + 20, facadeTopY + 18, bodyW - 40, 30);
    ctx.strokeStyle = palette.trim;
    ctx.lineWidth = 2;
    ctx.strokeRect(bodyX + 20, facadeTopY + 18, bodyW - 40, 30);

    ctx.fillStyle = "#2b1a13";
    ctx.textAlign = "center";
    ctx.font = "bold 16px 'Courier New', Courier, monospace";
    ctx.fillText(b.name.toUpperCase(), bodyX + bodyW / 2, facadeTopY + 37);

    // windows
    drawOpening(bodyX + 36, facadeTopY + 68, 30, 40, "plain");
    drawOpening(bodyX + bodyW - 66, facadeTopY + 67, 28, 40, "plain");

    // lower openings
    const lowerY = bodyY + bodyH - 92;
    drawOpening(bodyX + 22, lowerY, 46, 56, "display");
    drawOpening(bodyX + bodyW - 68, lowerY, 46, 56, "display");

    // heavier doorway zone
    ctx.fillStyle = toneColor("#5e412f", 0, warmLight * 0.1);
    ctx.fillRect(doorX - 12, doorY - 2, b.door.w + 24, b.door.h + 2);

    drawDoor(doorX, doorY, b.door.w, b.door.h);

    // porch
ctx.fillStyle = toneColor("#6f503b", 0, warmLight * 0.14);

// left porch strip
ctx.fillRect(bodyX - 2, bodyY + bodyH - 12, (doorX - 10) - (bodyX - 2), 12);

// right porch strip
ctx.fillRect(
  doorX + b.door.w + 10,
  bodyY + bodyH - 12,
  bodyX + bodyW + 2 - (doorX + b.door.w + 10),
  12
);

    // rough supports
    ctx.fillStyle = palette.post;
    ctx.fillRect(bodyX + 22, bodyY + bodyH - 30, 8, 18);
    ctx.fillRect(bodyX + bodyW - 30, bodyY + bodyH - 29, 8, 17);
  }

  const s = getLightShadow();

  if (s.length > 0.01 && s.alpha > 0.01) {
    drawGroundShadowPoly(
      [
        { x: bodyX + 8, y: shadowBaseY },
        { x: bodyX + bodyW - 8, y: shadowBaseY },
        { x: bodyX + bodyW - 8 + s.dx, y: shadowBaseY + s.dy + s.length },
        { x: bodyX + 8 + s.dx, y: shadowBaseY + s.dy + s.length },
      ],
      {
        offsetX: 0,
        offsetY: 0,
        alphaMul: 1,
        blur: 2,
        color: "#2f1b10",
      }
    );
  }

  if (!open) {
    const overlayTop =
      style === "house" ? bodyY + 18 : style === "shop" ? bodyY - 58 : bodyY - 64;
    const overlayH =
      style === "house" ? bodyH - 18 : style === "shop" ? bodyH + 58 : bodyH + 64;

    ctx.fillStyle = "rgba(20, 12, 8, 0.40)";
    ctx.fillRect(bodyX, overlayTop, bodyW, overlayH);

    ctx.strokeStyle = "#4e3427";
    ctx.lineWidth = 8;
    ctx.beginPath();
    ctx.moveTo(doorX, doorY);
    ctx.lineTo(doorX + b.door.w, doorY + b.door.h);
    ctx.moveTo(doorX + b.door.w, doorY);
    ctx.lineTo(doorX, doorY + b.door.h);
    ctx.stroke();

    ctx.fillStyle = "#ffffff";
    ctx.textAlign = "center";
    ctx.font = "bold 14px monospace";
    ctx.fillText("CLOSED", bodyX + bodyW / 2, overlayTop + overlayH * 0.62);
  }
};


//----------draw npc----------------//
const drawNPC = (npc: NPC) => {


  const p = worldToScreen(npc.x, npc.y);

  const moving = npc.moving;

const bodyW = npc.w * 0.6;
const bodyH = npc.h * 0.72;
const legLen = npc.h * 0.35;
const headR = npc.w * 0.22;

  const walkSwing = moving ? Math.sin(npc.walkPhase) * 2.2 : 0;
  const armSwing = moving ? Math.sin(npc.walkPhase) * 1.4 : 0;
  const bodyBob = moving ? Math.abs(Math.sin(npc.walkPhase * 2)) * 0.7 : 0;

  const skin = "#e7c19b";
  const hat = "#2b1a13";
  const bootColor = "#3a2418";
  const pantColor = "#4b382d";


const hipY = bodyH * 0.18;
const footX = p.x;
const footY = p.y + hipY + legLen + 4 - bodyBob;

  drawCharacterShadow(
    footX,
    footY,
    bodyW * 1.15,
    bodyH,
    headR,
    1
  );

  ctx.save();
  ctx.translate(p.x, p.y - bodyBob);

  // legs
  const leftLegX = -5 - walkSwing * 0.5;
  const rightLegX = 5 + walkSwing * 0.5;

  ctx.save();
  ctx.translate(0, hipY);

  ctx.fillStyle = pantColor;

  const leftStepLift = moving ? Math.max(0, walkSwing * 0.18) : 0;
  const rightStepLift = moving ? Math.max(0, -walkSwing * 0.18) : 0;

  ctx.fillRect(leftLegX - 3, 0, 6, legLen - leftStepLift);
  ctx.fillRect(rightLegX - 3, 0, 6, legLen - rightStepLift);

  ctx.fillStyle = bootColor;
  ctx.fillRect(leftLegX - 4, legLen - leftStepLift - 1, 9, 5);
  ctx.fillRect(rightLegX - 4, legLen - rightStepLift - 1, 9, 5);

  ctx.restore();

  // body / coat
  ctx.fillStyle = npc.color;
  ctx.beginPath();
  ctx.moveTo(-bodyW * 0.48, -bodyH * 0.42);
  ctx.lineTo(bodyW * 0.48, -bodyH * 0.42);
  ctx.lineTo(bodyW * 0.64, bodyH * 0.35);
  ctx.lineTo(bodyW * 0.22, bodyH * 0.50);
  ctx.lineTo(-bodyW * 0.22, bodyH * 0.50);
  ctx.lineTo(-bodyW * 0.64, bodyH * 0.35);
  ctx.closePath();
  ctx.fill();

  ctx.strokeStyle = "rgba(0,0,0,0.16)";
  ctx.lineWidth = 2;
  ctx.beginPath();
  ctx.moveTo(0, -bodyH * 0.12);
  ctx.lineTo(0, bodyH * 0.48);
  ctx.stroke();

  ctx.strokeStyle = "rgba(255,255,255,0.06)";
  ctx.lineWidth = 1.5;
  ctx.beginPath();
  ctx.moveTo(-bodyW * 0.34, -bodyH * 0.28);
  ctx.lineTo(bodyW * 0.18, -bodyH * 0.24);
  ctx.stroke();

  // arms
  ctx.strokeStyle = npc.color;
  ctx.lineWidth = 5;
  ctx.lineCap = "round";

  ctx.beginPath();
  ctx.moveTo(-bodyW * 0.40, -bodyH * 0.16);
  ctx.lineTo(-bodyW * 0.62, bodyH * 0.04 + armSwing * 0.2);
  ctx.stroke();

  ctx.beginPath();
  ctx.moveTo(bodyW * 0.40, -bodyH * 0.16);
  ctx.lineTo(bodyW * 0.62, bodyH * 0.04 - armSwing * 0.2);
  ctx.stroke();

  // head
  ctx.fillStyle = skin;
  ctx.beginPath();
  ctx.arc(0, -bodyH * 0.56, headR, 0, Math.PI * 2);
  ctx.fill();

  // hat
  ctx.fillStyle = hat;
  ctx.beginPath();
  ctx.ellipse(0, -bodyH * 0.60, 15, 3.2, 0, 0, Math.PI * 2);
  ctx.fill();

  ctx.fillRect(-6.5, -bodyH * 0.76, 13, 12);

  ctx.fillStyle = "#6b4a37";
  ctx.fillRect(-6.5, -bodyH * 0.68, 13, 2);

  // parchment name tag
  const tagText = npc.name.toUpperCase();
  ctx.font = "bold 12px 'Courier New', Courier, monospace";
  const tagW = Math.max(46, ctx.measureText(tagText).width + 18);
  const tagH = 18;
  const tagX = -tagW / 2;
  const tagY = -bodyH * 1.60;

  // little drop shadow under tag
  ctx.fillStyle = "rgba(20, 10, 6, 0.18)";
  ctx.beginPath();
  ctx.roundRect(tagX + 1, tagY + 2, tagW, tagH, 4);
  ctx.fill();

  // parchment body
  const tagGrad = ctx.createLinearGradient(0, tagY, 0, tagY + tagH);
  tagGrad.addColorStop(0, "#f5ebd7");
  tagGrad.addColorStop(1, "#e4d0af");
  ctx.fillStyle = tagGrad;
  ctx.beginPath();
  ctx.roundRect(tagX, tagY, tagW, tagH, 4);
  ctx.fill();

  // border
  ctx.strokeStyle = "#6c4a30";
  ctx.lineWidth = 1.5;
  ctx.stroke();

  // tiny inner edge
  ctx.strokeStyle = "rgba(120, 86, 54, 0.28)";
  ctx.lineWidth = 1;
  ctx.strokeRect(tagX + 2, tagY + 2, tagW - 4, tagH - 4);

  // text
  ctx.fillStyle = "#2b1a13";
  ctx.textAlign = "center";
  ctx.textBaseline = "middle";
  ctx.fillText(tagText, 0, tagY + tagH / 2 + 0.5);

    ctx.textBaseline = "alphabetic";

  ctx.restore();

     // rising dust puffs on footfall
  if (moving) {
    const leftFootPlant = Math.sin(npc.walkPhase) > 0.55;
    const rightFootPlant = Math.sin(npc.walkPhase + Math.PI) > 0.55;

    if (leftFootPlant && !npc.lastLeftStep) {
      spawnDustPuff(footX - 6, footY + 1, 1, 0.85);
    }

    if (rightFootPlant && !npc.lastRightStep) {
      spawnDustPuff(footX + 6, footY + 1, 1, 0.85);
    }

    npc.lastLeftStep = leftFootPlant;
    npc.lastRightStep = rightFootPlant;
  } else {
    npc.lastLeftStep = false;
    npc.lastRightStep = false;
  }
};
//-----------------------------------------------------//

//------draw player---------------//
const drawPlayer = () => {
  const p = worldToScreen(player.x, player.y);

const moving =
  !!keys["w"] ||
  !!keys["a"] ||
  !!keys["s"] ||
  !!keys["d"] ||
  !!keys["arrowup"] ||
  !!keys["arrowdown"] ||
  !!keys["arrowleft"] ||
  !!keys["arrowright"];

  // Give player a stronger silhouette than NPCs
  const bodyH = player.h * 0.92;
  const bodyW = player.w * 0.52;
  const legLen = 15;
  const headR = 8.5;

  // Motion
  const time = Date.now() * 0.012;
  const walkSwing = moving ? Math.sin(time) * 2.6 : 0;
  const armSwing = moving ? Math.sin(time) * 1.8 : 0;
  const bodyBob = moving ? Math.abs(Math.sin(time * 2)) * 1.1 : 0;

  // Slight forward swagger/lean when moving
  const moveLean = moving ? 0.06 : 0.015;

  const skin = player.skin;
  const hat = "#2b1a13";
  const bootColor = "#3a2418";
  const pantColor = player.pants;
  const coatColor = player.shirt;

  // Ground anchor for shadow + dust
  const hipY = bodyH * 0.18;
  const footX = p.x;
  const footY = p.y + hipY + legLen + 4 - bodyBob;

  // Same shadow treatment as NPCs so player feels grounded
  drawCharacterShadow(
    footX,
    footY,
    bodyW * 1.18,
    bodyH,
    headR,
    1.08
  );

  ctx.save();
  ctx.translate(p.x, p.y - bodyBob);
  ctx.rotate(moveLean);

  // -------------------------
  // LEGS
  // -------------------------
  const leftLegX = -5.2 - walkSwing * 0.55;
  const rightLegX = 5.2 + walkSwing * 0.55;

  ctx.save();
  ctx.translate(0, hipY);

  const leftStepLift = moving ? Math.max(0, walkSwing * 0.18) : 0;
  const rightStepLift = moving ? Math.max(0, -walkSwing * 0.18) : 0;

  ctx.fillStyle = pantColor;
  ctx.fillRect(leftLegX - 3, 0, 6, legLen - leftStepLift);
  ctx.fillRect(rightLegX - 3, 0, 6, legLen - rightStepLift);

  ctx.fillStyle = bootColor;
  ctx.fillRect(leftLegX - 4, legLen - leftStepLift - 1, 9, 5);
  ctx.fillRect(rightLegX - 4, legLen - rightStepLift - 1, 9, 5);

  ctx.restore();

  // -------------------------
  // BODY / DUSTER
  // Slightly more dramatic than NPC coat
  // -------------------------
  ctx.fillStyle = coatColor;
  ctx.beginPath();
  ctx.moveTo(-bodyW * 0.46, -bodyH * 0.44);
  ctx.lineTo(bodyW * 0.46, -bodyH * 0.44);
  ctx.lineTo(bodyW * 0.68, bodyH * 0.26);
  ctx.lineTo(bodyW * 0.34, bodyH * 0.54);
  ctx.lineTo(bodyW * 0.10, bodyH * 0.42);
  ctx.lineTo(-bodyW * 0.10, bodyH * 0.42);
  ctx.lineTo(-bodyW * 0.34, bodyH * 0.54);
  ctx.lineTo(-bodyW * 0.68, bodyH * 0.26);
  ctx.closePath();
  ctx.fill();

  // coat split
  ctx.strokeStyle = "rgba(0,0,0,0.18)";
  ctx.lineWidth = 2;
  ctx.beginPath();
  ctx.moveTo(0, -bodyH * 0.10);
  ctx.lineTo(0, bodyH * 0.50);
  ctx.stroke();

  // shoulder highlight
  ctx.strokeStyle = "rgba(255,255,255,0.08)";
  ctx.lineWidth = 1.6;
  ctx.beginPath();
  ctx.moveTo(-bodyW * 0.32, -bodyH * 0.30);
  ctx.lineTo(bodyW * 0.20, -bodyH * 0.24);
  ctx.stroke();

  // bandolier / chest strap to make player feel unique
  ctx.strokeStyle = "#2b1a13";
  ctx.lineWidth = 3;
  ctx.beginPath();
  ctx.moveTo(-bodyW * 0.42, -bodyH * 0.18);
  ctx.lineTo(bodyW * 0.36, bodyH * 0.16);
  ctx.stroke();

  // little buckle/accent
  ctx.fillStyle = "#8b6a3f";
  ctx.fillRect(-2, -bodyH * 0.01, 4, 6);

  // -------------------------
  // ARMS
  // More confident pose than NPCs
  // -------------------------
  ctx.strokeStyle = coatColor;
  ctx.lineWidth = 5.5;
  ctx.lineCap = "round";

  ctx.beginPath();
  ctx.moveTo(-bodyW * 0.40, -bodyH * 0.16);
  ctx.lineTo(-bodyW * 0.66, bodyH * 0.02 + armSwing * 0.22);
  ctx.stroke();

  ctx.beginPath();
  ctx.moveTo(bodyW * 0.40, -bodyH * 0.16);
  ctx.lineTo(bodyW * 0.62, bodyH * 0.00 - armSwing * 0.16);
  ctx.stroke();

  // -------------------------
  // HEAD
  // -------------------------
  ctx.fillStyle = skin;
  ctx.beginPath();
  ctx.arc(0, -bodyH * 0.58, headR, 0, Math.PI * 2);
  ctx.fill();

  // -------------------------
  // HAT
  // Stronger / hero hat than NPC
  // -------------------------
  ctx.fillStyle = hat;
  ctx.beginPath();
  ctx.ellipse(0, -bodyH * 0.62, 16, 3.4, 0, 0, Math.PI * 2);
  ctx.fill();

  ctx.fillRect(-7, -bodyH * 0.79, 14, 12);

  ctx.fillStyle = "#6b4a37";
  ctx.fillRect(-7, -bodyH * 0.71, 14, 2);

  // -------------------------
  // OPTIONAL FACE TOUCH
  // tiny shadow under brim
  // -------------------------
  ctx.fillStyle = "rgba(0,0,0,0.10)";
  ctx.beginPath();
  ctx.ellipse(0, -bodyH * 0.54, 6.5, 2.2, 0, 0, Math.PI * 2);
  ctx.fill();

  ctx.restore();

  // -------------------------
  // FOOT DUST
  // Same idea as NPC, slightly stronger for player
  // -------------------------
    // rising dust puffs on footfall
  if (moving) {
  const leftFootPlant = Math.sin(time) > 0.55;
  const rightFootPlant = Math.sin(time + Math.PI) > 0.55;

  if (leftFootPlant && !player.lastLeftStep) {
    spawnDustPuff(footX - 6, footY + 1, 2, 1);
  }

  if (rightFootPlant && !player.lastRightStep) {
    spawnDustPuff(footX + 6, footY + 1, 2, 1);
  }

  player.lastLeftStep = leftFootPlant;
  player.lastRightStep = rightFootPlant;
} else {
  player.lastLeftStep = false;
  player.lastRightStep = false;
}
};
    //----------draw ui------------------//
  //----------draw ui------------------//
const drawHud = (w: number, h: number) => {
  const time = getTimeParts();

  const westernFont = "'Courier New', Courier, monospace";

  const roundRect = (
    x: number,
    y: number,
    width: number,
    height: number,
    radius: number
  ) => {
    const r = Math.min(radius, width / 2, height / 2);
    ctx.beginPath();
    ctx.moveTo(x + r, y);
    ctx.lineTo(x + width - r, y);
    ctx.quadraticCurveTo(x + width, y, x + width, y + r);
    ctx.lineTo(x + width, y + height - r);
    ctx.quadraticCurveTo(x + width, y + height, x + width - r, y + height);
    ctx.lineTo(x + r, y + height);
    ctx.quadraticCurveTo(x, y + height, x, y + height - r);
    ctx.lineTo(x, y + r);
    ctx.quadraticCurveTo(x, y, x + r, y);
    ctx.closePath();
  };

  const drawPanel = (
    x: number,
    y: number,
    width: number,
    height: number,
    fill = "#d7b082",
    stroke = "#4e3427"
  ) => {
    ctx.save();

    // shadow
    ctx.globalAlpha = 0.22;
    ctx.fillStyle = "#000";
    roundRect(x + 4, y + 5, width, height, 12);
    ctx.fill();
    ctx.globalAlpha = 1;

    // main body
    const grad = ctx.createLinearGradient(x, y, x, y + height);
    grad.addColorStop(0, fill);
    grad.addColorStop(1, "#b98558");
    ctx.fillStyle = grad;
    roundRect(x, y, width, height, 12);
    ctx.fill();

    // inner tint
    ctx.fillStyle = "rgba(255,255,255,0.08)";
    roundRect(x + 4, y + 4, width - 8, height * 0.42, 9);
    ctx.fill();

    // border
    ctx.strokeStyle = stroke;
    ctx.lineWidth = 3;
    roundRect(x, y, width, height, 12);
    ctx.stroke();

    // inner border
    ctx.strokeStyle = "rgba(78,52,39,0.25)";
    ctx.lineWidth = 1;
    roundRect(x + 5, y + 5, width - 10, height - 10, 9);
    ctx.stroke();

    ctx.restore();
  };

  const drawMoneySack = (x: number, y: number, scale = 1) => {
    ctx.save();
    ctx.translate(x, y);
    ctx.scale(scale, scale);

    // sack shadow
    ctx.fillStyle = "rgba(0,0,0,0.18)";
    ctx.beginPath();
    ctx.ellipse(0, 18, 16, 6, 0, 0, Math.PI * 2);
    ctx.fill();

    // sack body
    const sackGrad = ctx.createLinearGradient(0, -18, 0, 20);
    sackGrad.addColorStop(0, "#c89b62");
    sackGrad.addColorStop(1, "#8b5f36");
    ctx.fillStyle = sackGrad;

    ctx.beginPath();
    ctx.moveTo(-12, -4);
    ctx.quadraticCurveTo(-18, 2, -16, 12);
    ctx.quadraticCurveTo(-14, 24, 0, 26);
    ctx.quadraticCurveTo(14, 24, 16, 12);
    ctx.quadraticCurveTo(18, 2, 12, -4);
    ctx.quadraticCurveTo(8, -12, 8, -18);
    ctx.lineTo(-8, -18);
    ctx.quadraticCurveTo(-8, -12, -12, -4);
    ctx.closePath();
    ctx.fill();

    // tie
    ctx.strokeStyle = "#5b3923";
    ctx.lineWidth = 3;
    ctx.beginPath();
    ctx.moveTo(-9, -8);
    ctx.lineTo(9, -8);
    ctx.stroke();

    // top folds
    ctx.strokeStyle = "rgba(91,57,35,0.7)";
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.moveTo(-6, -18);
    ctx.lineTo(-3, -8);
    ctx.moveTo(0, -18);
    ctx.lineTo(0, -8);
    ctx.moveTo(6, -18);
    ctx.lineTo(3, -8);
    ctx.stroke();

    // dollar mark
    ctx.fillStyle = "#5b3923";
    ctx.font = "bold 16px 'Courier New', Courier, monospace";
    ctx.textAlign = "center";
    ctx.textBaseline = "middle";
    ctx.fillText("$", 0, 8);

    ctx.restore();
  };

  const drawNail = (x: number, y: number) => {
    ctx.save();
    ctx.fillStyle = "#7e7e7e";
    ctx.beginPath();
    ctx.arc(x, y, 3, 0, Math.PI * 2);
    ctx.fill();
    ctx.fillStyle = "rgba(255,255,255,0.25)";
    ctx.beginPath();
    ctx.arc(x - 1, y - 1, 1, 0, Math.PI * 2);
    ctx.fill();
    ctx.restore();
  };

  // =========================================================
  // 1. CASH HUD (TOP LEFT)
  // =========================================================
  const cashX = 18;
  const cashY = 18;
  const cashW = 190;
  const cashH = 62;

  drawPanel(cashX, cashY, cashW, cashH, "#c89a68");

  drawMoneySack(cashX + 34, cashY + 30, 1.1);

  ctx.fillStyle = "#2b1a13";
  ctx.textAlign = "left";
  ctx.textBaseline = "alphabetic";
  ctx.font = `bold 12px ${westernFont}`;
  ctx.fillText("CASH", cashX + 64, cashY + 22);

  ctx.fillStyle = "#355b2f";
  ctx.font = `bold 24px ${westernFont}`;
  ctx.fillText(`$${player.cash}`, cashX + 64, cashY + 47);

  // =========================================================
  // 2. TIME / DAY PLAQUE (TOP CENTER)
  // =========================================================
  const timeW = 250;
  const timeH = 72;
  const timeX = w / 2 - timeW / 2;
  const timeY = 14;

  drawPanel(timeX, timeY, timeW, timeH, "#d8b48a");

  drawNail(timeX + 18, timeY + 12);
  drawNail(timeX + timeW - 18, timeY + 12);

  ctx.fillStyle = "#2b1a13";
  ctx.textAlign = "center";

  ctx.font = `bold 14px ${westernFont}`;
  ctx.fillText(`DAY ${world.day}`, w / 2, timeY + 24);

  ctx.font = `bold 22px ${westernFont}`;
  ctx.fillText(time.label.toUpperCase(), w / 2, timeY + 53);

  // =========================================================
  // 3. BANK + RENT PANEL (TOP RIGHT)
  // =========================================================
  const statW = 240;
  const statH = 88;
  const statX = w - statW - 18;
  const statY = 18;

  drawPanel(statX, statY, statW, statH, "#c79a6c");

  ctx.textAlign = "left";
  ctx.fillStyle = "#2b1a13";

  ctx.font = `bold 13px ${westernFont}`;
  ctx.fillText("BANK", statX + 18, statY + 25);

  ctx.fillStyle = "#314d67";
  ctx.font = `bold 20px ${westernFont}`;
  ctx.fillText(`$${bank.balance}`, statX + 18, statY + 48);

  ctx.fillStyle = "#2b1a13";
  ctx.font = `bold 13px ${westernFont}`;
  ctx.fillText("RENT", statX + 130, statY + 25);

  ctx.fillStyle = "#6a3f24";
  ctx.font = `bold 18px ${westernFont}`;
  ctx.fillText(`$${rent.paid}/${rent.amountDue}`, statX + 130, statY + 48);

  ctx.fillStyle = rent.daysLeft < 3 ? "#a63d2d" : "#2b1a13";
  ctx.font = `bold 14px ${westernFont}`;
  ctx.fillText(`DUE IN ${rent.daysLeft} DAY${rent.daysLeft === 1 ? "" : "S"}`, statX + 18, statY + 74);

  // =========================================================
  // 4. INTERACTION PROMPT (BOTTOM CENTER)
  // =========================================================
  if (
    player.promptText &&
    !ui.panel &&
    !world.storyCard &&
    !bakeryJob.active &&
    !world.gameOver
  ) {
    const promptW = 420;
    const promptH = 52;
    const promptX = w / 2 - promptW / 2;
    const promptY = h - 84;

    drawPanel(promptX, promptY, promptW, promptH, "#d2b084");

    ctx.fillStyle = "#2b1a13";
    ctx.textAlign = "center";
    ctx.font = `bold 18px ${westernFont}`;
    ctx.fillText(`[ ${player.promptText.toUpperCase()} ]`, w / 2, promptY + 32);
  }

  // =========================================================
  // 5. TOAST NOTIFICATION (FLOATING MID TOP)
  // =========================================================
  if (ui.toastTimer > 0 && ui.toast) {
    const toastW = 320;
    const toastH = 38;
    const toastX = w / 2 - toastW / 2;
    const toastY = 102;

    ctx.save();
    ctx.globalAlpha = Math.min(1, ui.toastTimer / 0.25);

    drawPanel(toastX, toastY, toastW, toastH, "#4b2f20", "#c79b65");

    ctx.fillStyle = "#f5e6d0";
    ctx.textAlign = "center";
    ctx.font = `bold 14px ${westernFont}`;
    ctx.fillText(ui.toast.toUpperCase(), w / 2, toastY + 24);

    ctx.restore();
  }
};
//------------------------------//
//------------------------------//

//--------storycard----------//
const drawStoryCard = (w: number, h: number, card: StoryCard) => {
  const westernFont = "'Courier New', Courier, monospace";

  const roundRect = (
    x: number,
    y: number,
    width: number,
    height: number,
    radius: number
  ) => {
    const r = Math.min(radius, width / 2, height / 2);
    ctx.beginPath();
    ctx.moveTo(x + r, y);
    ctx.lineTo(x + width - r, y);
    ctx.quadraticCurveTo(x + width, y, x + width, y + r);
    ctx.lineTo(x + width, y + height - r);
    ctx.quadraticCurveTo(x + width, y + height, x + width - r, y + height);
    ctx.lineTo(x + r, y + height);
    ctx.quadraticCurveTo(x, y + height, x, y + height - r);
    ctx.lineTo(x, y + r);
    ctx.quadraticCurveTo(x, y, x + r, y);
    ctx.closePath();
  };

  const drawPanel = (
    x: number,
    y: number,
    width: number,
    height: number,
    fill = "#d7b082",
    stroke = "#4e3427"
  ) => {
    ctx.save();

    ctx.globalAlpha = 0.24;
    ctx.fillStyle = "#000";
    roundRect(x + 6, y + 8, width, height, 14);
    ctx.fill();
    ctx.globalAlpha = 1;

    const grad = ctx.createLinearGradient(x, y, x, y + height);
    grad.addColorStop(0, fill);
    grad.addColorStop(1, "#b98558");
    ctx.fillStyle = grad;
    roundRect(x, y, width, height, 14);
    ctx.fill();

    ctx.fillStyle = "rgba(255,255,255,0.08)";
    roundRect(x + 5, y + 5, width - 10, height * 0.28, 10);
    ctx.fill();

    ctx.strokeStyle = stroke;
    ctx.lineWidth = 3;
    roundRect(x, y, width, height, 14);
    ctx.stroke();

    ctx.strokeStyle = "rgba(78,52,39,0.25)";
    ctx.lineWidth = 1;
    roundRect(x + 6, y + 6, width - 12, height - 12, 10);
    ctx.stroke();

    ctx.restore();
  };

  const drawNail = (x: number, y: number) => {
    ctx.save();
    ctx.fillStyle = "#7e7e7e";
    ctx.beginPath();
    ctx.arc(x, y, 4, 0, Math.PI * 2);
    ctx.fill();

    ctx.fillStyle = "rgba(255,255,255,0.25)";
    ctx.beginPath();
    ctx.arc(x - 1, y - 1, 1.3, 0, Math.PI * 2);
    ctx.fill();
    ctx.restore();
  };

  const wrapText = (
    text: string,
    maxWidth: number,
    font: string
  ) => {
    ctx.save();
    ctx.font = font;

    const paragraphs = text.split("\n");
    const lines: string[] = [];

    for (const para of paragraphs) {
      if (!para.trim()) {
        lines.push("");
        continue;
      }

      const words = para.split(" ");
      let current = "";

      for (const word of words) {
        const test = current ? `${current} ${word}` : word;
        if (ctx.measureText(test).width <= maxWidth) {
          current = test;
        } else {
          if (current) lines.push(current);
          current = word;
        }
      }

      if (current) lines.push(current);
    }

    ctx.restore();
    return lines;
  };

  // =========================================================
  // 1. WORLD DIM
  // =========================================================
  ctx.fillStyle = "rgba(20, 15, 10, 0.78)";
  ctx.fillRect(0, 0, w, h);

  const vignette = ctx.createRadialGradient(
    w / 2,
    h / 2,
    w * 0.16,
    w / 2,
    h / 2,
    w * 0.72
  );
  vignette.addColorStop(0, "rgba(0,0,0,0)");
  vignette.addColorStop(1, "rgba(0,0,0,0.22)");
  ctx.fillStyle = vignette;
  ctx.fillRect(0, 0, w, h);

  // =========================================================
  // 2. MAIN CARD
  // =========================================================
  const boxW = Math.min(700, w - 70);
  const boxH = Math.min(410, h - 90);
  const x = w / 2 - boxW / 2;
  const y = h / 2 - boxH / 2;

  drawPanel(x, y, boxW, boxH, "#e2c39c");

  drawNail(x + 26, y + 16);
  drawNail(x + boxW - 26, y + 16);

  // =========================================================
  // 3. HEADER
  // =========================================================
  ctx.fillStyle = "#2b1a13";
  ctx.textAlign = "center";
  ctx.textBaseline = "alphabetic";

  ctx.font = `bold 14px ${westernFont}`;
  ctx.fillText("TOWN NOTICE", w / 2, y + 34);

  ctx.font = `bold 34px ${westernFont}`;
  ctx.fillText(card.title.toUpperCase(), w / 2, y + 76);

  ctx.strokeStyle = "#6a4a35";
  ctx.lineWidth = 2;
  ctx.beginPath();
  ctx.moveTo(w / 2 - 120, y + 92);
  ctx.lineTo(w / 2 + 120, y + 92);
  ctx.stroke();

  ctx.fillStyle = "#6a4a35";
  ctx.beginPath();
  ctx.arc(w / 2 - 132, y + 92, 3, 0, Math.PI * 2);
  ctx.arc(w / 2 + 132, y + 92, 3, 0, Math.PI * 2);
  ctx.fill();

  // =========================================================
  // 4. BODY
  // =========================================================
  const bodyFont = "20px Georgia, serif";
  const lines = wrapText(card.body, boxW - 110, bodyFont);

  ctx.font = bodyFont;
  ctx.fillStyle = "#3b281d";

  const lineHeight = 30;
  let yy = y + 140;

  for (const line of lines) {
    if (line === "") {
      yy += lineHeight * 0.65;
      continue;
    }
    ctx.fillText(line, w / 2, yy);
    yy += lineHeight;
  }

  // =========================================================
  // 5. FOOTER PROMPT
  // =========================================================
  const footerW = 290;
  const footerH = 36;
  const footerX = w / 2 - footerW / 2;
  const footerY = y + boxH - 54;

  drawPanel(footerX, footerY, footerW, footerH, "#b98758");

  ctx.fillStyle = "#2b1a13";
  ctx.font = `bold 14px ${westernFont}`;
  ctx.fillText("PRESS [ ENTER / SPACE / I ]", w / 2, footerY + 24);

  // =========================================================
  // 6. CORNER ACCENTS
  // =========================================================
  const drawCorner = (cx: number, cy: number, rot: number) => {
    ctx.save();
    ctx.translate(cx, cy);
    ctx.rotate(rot);

    ctx.strokeStyle = "#4e3427";
    ctx.lineWidth = 7;
    ctx.lineCap = "round";
    ctx.beginPath();
    ctx.moveTo(0, 22);
    ctx.lineTo(0, 0);
    ctx.lineTo(22, 0);
    ctx.stroke();

    ctx.strokeStyle = "rgba(255,255,255,0.06)";
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.moveTo(2, 18);
    ctx.lineTo(2, 2);
    ctx.lineTo(18, 2);
    ctx.stroke();

    ctx.restore();
  };

  drawCorner(x + 10, y + 10, 0);
  drawCorner(x + boxW - 10, y + 10, Math.PI / 2);
  drawCorner(x + boxW - 10, y + boxH - 10, Math.PI);
  drawCorner(x + 10, y + boxH - 10, -Math.PI / 2);
};
//-----------------------//

//-------------draw bank-----------//
const drawBankPanel = (w: number, h: number) => {
  const westernFont = "'Courier New', Courier, monospace";

  const roundRect = (
    x: number,
    y: number,
    width: number,
    height: number,
    radius: number
  ) => {
    const r = Math.min(radius, width / 2, height / 2);
    ctx.beginPath();
    ctx.moveTo(x + r, y);
    ctx.lineTo(x + width - r, y);
    ctx.quadraticCurveTo(x + width, y, x + width, y + r);
    ctx.lineTo(x + width, y + height - r);
    ctx.quadraticCurveTo(x + width, y + height, x + width - r, y + height);
    ctx.lineTo(x + r, y + height);
    ctx.quadraticCurveTo(x, y + height, x, y + height - r);
    ctx.lineTo(x, y + r);
    ctx.quadraticCurveTo(x, y, x + r, y);
    ctx.closePath();
  };

  const drawPanel = (
    x: number,
    y: number,
    width: number,
    height: number,
    fill = "#d7b082",
    stroke = "#4e3427"
  ) => {
    ctx.save();

    ctx.globalAlpha = 0.24;
    ctx.fillStyle = "#000";
    roundRect(x + 6, y + 8, width, height, 14);
    ctx.fill();
    ctx.globalAlpha = 1;

    const grad = ctx.createLinearGradient(x, y, x, y + height);
    grad.addColorStop(0, fill);
    grad.addColorStop(1, "#b98558");
    ctx.fillStyle = grad;
    roundRect(x, y, width, height, 14);
    ctx.fill();

    ctx.fillStyle = "rgba(255,255,255,0.08)";
    roundRect(x + 5, y + 5, width - 10, height * 0.26, 10);
    ctx.fill();

    ctx.strokeStyle = stroke;
    ctx.lineWidth = 3;
    roundRect(x, y, width, height, 14);
    ctx.stroke();

    ctx.strokeStyle = "rgba(78,52,39,0.25)";
    ctx.lineWidth = 1;
    roundRect(x + 6, y + 6, width - 12, height - 12, 10);
    ctx.stroke();

    ctx.restore();
  };

  const drawNail = (x: number, y: number) => {
    ctx.save();
    ctx.fillStyle = "#7e7e7e";
    ctx.beginPath();
    ctx.arc(x, y, 4, 0, Math.PI * 2);
    ctx.fill();

    ctx.fillStyle = "rgba(255,255,255,0.25)";
    ctx.beginPath();
    ctx.arc(x - 1, y - 1, 1.3, 0, Math.PI * 2);
    ctx.fill();
    ctx.restore();
  };

  // =========================================================
  // 1. DIM WORLD
  // =========================================================
  ctx.fillStyle = "rgba(15, 10, 5, 0.78)";
  ctx.fillRect(0, 0, w, h);

  const vignette = ctx.createRadialGradient(
    w / 2,
    h / 2,
    w * 0.14,
    w / 2,
    h / 2,
    w * 0.72
  );
  vignette.addColorStop(0, "rgba(0,0,0,0)");
  vignette.addColorStop(1, "rgba(0,0,0,0.20)");
  ctx.fillStyle = vignette;
  ctx.fillRect(0, 0, w, h);

  // =========================================================
  // 2. MAIN PANEL
  // =========================================================
  const boxW = 620;
  const boxH = 430;
  const x = w / 2 - boxW / 2;
  const y = h / 2 - boxH / 2;

  drawPanel(x, y, boxW, boxH, "#e2c39c");

  drawNail(x + 26, y + 16);
  drawNail(x + boxW - 26, y + 16);

  // =========================================================
  // 3. HEADER
  // =========================================================
  ctx.fillStyle = "#2b1d15";
  ctx.textAlign = "center";
  ctx.textBaseline = "alphabetic";

  ctx.font = `bold 14px ${westernFont}`;
  ctx.fillText("OFFICIAL LEDGER", w / 2, y + 34);

  ctx.font = `bold 30px ${westernFont}`;
  ctx.fillText("FRONTIER STATE BANK", w / 2, y + 72);

  ctx.strokeStyle = "#6a4a35";
  ctx.lineWidth = 2;
  ctx.beginPath();
  ctx.moveTo(w / 2 - 165, y + 88);
  ctx.lineTo(w / 2 + 165, y + 88);
  ctx.stroke();

  ctx.fillStyle = "#6a4a35";
  ctx.beginPath();
  ctx.arc(w / 2 - 178, y + 88, 3, 0, Math.PI * 2);
  ctx.arc(w / 2 + 178, y + 88, 3, 0, Math.PI * 2);
  ctx.fill();

  // =========================================================
  // 4. LEDGER ROWS
  // =========================================================
  const rowLeft = x + 34;
  const rowRight = x + boxW - 34;
  const rowW = boxW - 68;

  const drawLedgerRow = (
    label: string,
    value: string,
    rowY: number,
    valueColor = "#2b1d15",
    highlight = false
  ) => {
    const rowH = 42;

    if (highlight) {
      ctx.fillStyle = "rgba(185, 135, 88, 0.18)";
      roundRect(rowLeft - 10, rowY - 28, rowW + 20, rowH, 10);
      ctx.fill();

      ctx.strokeStyle = "rgba(92, 61, 41, 0.28)";
      ctx.lineWidth = 1;
      roundRect(rowLeft - 10, rowY - 28, rowW + 20, rowH, 10);
      ctx.stroke();
    }

    ctx.textAlign = "left";
    ctx.font = `bold 15px ${westernFont}`;
    ctx.fillStyle = "rgba(43, 29, 21, 0.70)";
    ctx.fillText(label.toUpperCase(), rowLeft, rowY);

    ctx.textAlign = "right";
    ctx.font = "bold 22px Georgia, serif";
    ctx.fillStyle = valueColor;
    ctx.fillText(value, rowRight, rowY);

    const labelWidth = ctx.measureText(label.toUpperCase()).width;
    const valueWidth = ctx.measureText(value).width;

    ctx.strokeStyle = "rgba(78, 52, 39, 0.35)";
    ctx.lineWidth = 1;
    ctx.setLineDash([3, 5]);
    ctx.beginPath();
    ctx.moveTo(rowLeft + labelWidth + 14, rowY - 5);
    ctx.lineTo(rowRight - valueWidth - 14, rowY - 5);
    ctx.stroke();
    ctx.setLineDash([]);
  };

  drawLedgerRow("Personal Cash", `$${player.cash}`, y + 125, "#355b2f");
  drawLedgerRow("Vault Balance", `$${bank.balance}`, y + 172, "#314d67");
  drawLedgerRow(
    "Rent Status",
    `$${rent.paid} / $${rent.amountDue}`,
    y + 219,
    rent.paid >= rent.amountDue ? "#355b2f" : "#a63d2d"
  );
  drawLedgerRow("Transaction Amt", `$${bank.selectedAmount}`, y + 276, "#2b1d15", true);

  // =========================================================
  // 5. CONTROLS PANEL
  // =========================================================
  const ctrlX = x + 28;
  const ctrlY = y + 300;
  const ctrlW = boxW - 56;
  const ctrlH = 94;

  drawPanel(ctrlX, ctrlY, ctrlW, ctrlH, "#4b2f20", "#c79b65");

  ctx.textAlign = "left";
  ctx.fillStyle = "#f5e6d0";
  ctx.font = `bold 15px ${westernFont}`;
  ctx.fillText("[Q / E] ADJUST AMOUNT", ctrlX + 20, ctrlY + 28);
  ctx.fillText("[1] DEPOSIT TO VAULT", ctrlX + 20, ctrlY + 52);
  ctx.fillText("[2] WITHDRAW CASH", ctrlX + 20, ctrlY + 76);

  ctx.textAlign = "right";
  ctx.fillText("[3] SETTLE RENT FROM BANK", ctrlX + ctrlW - 20, ctrlY + 52);

  // =========================================================
  // 6. FOOTER
  // =========================================================
  ctx.textAlign = "center";
  ctx.fillStyle = "rgba(43, 29, 21, 0.75)";
  ctx.font = `bold 14px ${westernFont}`;
  ctx.fillText("PRESS ESC TO LEAVE THE VAULT", w / 2, y + boxH - 18);
};
//--------------------------//

//-------draw bakery minigame---------------//
const drawBakeryMinigame = (w: number, h: number) => {
  const westernFont = "'Courier New', Courier, monospace";
  const now = Date.now();

const targetPos = bakeryJob.targetPos;
const shake = bakeryJob.shake;

  const shakeX = shake > 0 ? (Math.random() - 0.5) * shake : 0;
  const shakeY = shake > 0 ? (Math.random() - 0.5) * shake : 0;

  const roundRect = (
    x: number,
    y: number,
    width: number,
    height: number,
    radius: number
  ) => {
    const r = Math.min(radius, width / 2, height / 2);
    ctx.beginPath();
    ctx.moveTo(x + r, y);
    ctx.lineTo(x + width - r, y);
    ctx.quadraticCurveTo(x + width, y, x + width, y + r);
    ctx.lineTo(x + width, y + height - r);
    ctx.quadraticCurveTo(x + width, y + height, x + width - r, y + height);
    ctx.lineTo(x + r, y + height);
    ctx.quadraticCurveTo(x, y + height, x, y + height - r);
    ctx.lineTo(x, y + r);
    ctx.quadraticCurveTo(x, y, x + r, y);
    ctx.closePath();
  };

  const drawPanel = (
    x: number,
    y: number,
    width: number,
    height: number,
    fill = "#d7b082",
    stroke = "#4e3427"
  ) => {
    ctx.save();

    ctx.globalAlpha = 0.24;
    ctx.fillStyle = "#000";
    roundRect(x + 6, y + 8, width, height, 16);
    ctx.fill();
    ctx.globalAlpha = 1;

    const grad = ctx.createLinearGradient(x, y, x, y + height);
    grad.addColorStop(0, fill);
    grad.addColorStop(1, "#b98558");
    ctx.fillStyle = grad;
    roundRect(x, y, width, height, 16);
    ctx.fill();

    ctx.fillStyle = "rgba(255,255,255,0.08)";
    roundRect(x + 5, y + 5, width - 10, height * 0.24, 11);
    ctx.fill();

    ctx.strokeStyle = stroke;
    ctx.lineWidth = 3;
    roundRect(x, y, width, height, 16);
    ctx.stroke();

    ctx.strokeStyle = "rgba(78,52,39,0.25)";
    ctx.lineWidth = 1;
    roundRect(x + 6, y + 6, width - 12, height - 12, 11);
    ctx.stroke();

    ctx.restore();
  };

  const drawNail = (x: number, y: number) => {
    ctx.save();
    ctx.fillStyle = "#7e7e7e";
    ctx.beginPath();
    ctx.arc(x, y, 4, 0, Math.PI * 2);
    ctx.fill();

    ctx.fillStyle = "rgba(255,255,255,0.25)";
    ctx.beginPath();
    ctx.arc(x - 1, y - 1, 1.3, 0, Math.PI * 2);
    ctx.fill();
    ctx.restore();
  };

  // =====================================================
  // 1. DIM THE WORLD
  // =====================================================
  ctx.fillStyle = "rgba(28, 18, 10, 0.78)";
  ctx.fillRect(0, 0, w, h);

  const vignette = ctx.createRadialGradient(
    w / 2,
    h / 2,
    w * 0.10,
    w / 2,
    h / 2,
    w * 0.78
  );
  vignette.addColorStop(0, "rgba(0,0,0,0)");
  vignette.addColorStop(1, "rgba(0,0,0,0.28)");
  ctx.fillStyle = vignette;
  ctx.fillRect(0, 0, w, h);

  // =====================================================
  // 2. MAIN PANEL
  // =====================================================
  const boxW = 760;
  const boxH = 500;
  const x = w / 2 - boxW / 2 + shakeX;
  const y = h / 2 - boxH / 2 + shakeY;

  drawPanel(x, y, boxW, boxH, "#dcc4a1");

  drawNail(x + 28, y + 16);
  drawNail(x + boxW - 28, y + 16);

  // =====================================================
  // 3. HEADER
  // =====================================================
  ctx.fillStyle = "#2b1d15";
  ctx.textAlign = "center";
  ctx.textBaseline = "alphabetic";

  ctx.font = `bold 14px ${westernFont}`;
  ctx.fillText("BAKERY SHIFT", w / 2, y + 34);

  ctx.font = `bold 30px ${westernFont}`;
  ctx.fillText("THE MORNING BAKE", w / 2, y + 72);

  ctx.strokeStyle = "#6a4a35";
  ctx.lineWidth = 2;
  ctx.beginPath();
  ctx.moveTo(w / 2 - 150, y + 88);
  ctx.lineTo(w / 2 + 150, y + 88);
  ctx.stroke();

  ctx.fillStyle = "#4f3828";
  ctx.font = "italic 16px Georgia, serif";
  ctx.fillText("STOKE THE OVEN WHEN THE NEEDLE HITS THE GREEN", w / 2, y + 114);

  // =====================================================
  // 4. WORK SCENE STRIP
  // =====================================================
  const sceneX = x + 24;
  const sceneY = y + 135;
  const sceneW = boxW - 48;
  const sceneH = 120;

  // back wall
  const wallGrad = ctx.createLinearGradient(sceneX, sceneY, sceneX, sceneY + sceneH);
  wallGrad.addColorStop(0, "#b88a62");
  wallGrad.addColorStop(1, "#936846");
  ctx.fillStyle = wallGrad;
  roundRect(sceneX, sceneY, sceneW, sceneH, 12);
  ctx.fill();

  // counter
  const counterY = sceneY + 78;
  const counterGrad = ctx.createLinearGradient(0, counterY, 0, sceneY + sceneH);
  counterGrad.addColorStop(0, "#6d4b34");
  counterGrad.addColorStop(1, "#4a3122");
  ctx.fillStyle = counterGrad;
  roundRect(sceneX, counterY, sceneW, sceneH - 78, 10);
  ctx.fill();

  // flour specks
  ctx.fillStyle = "rgba(255,245,230,0.10)";
  for (let i = 0; i < 18; i++) {
    const fx = sceneX + 30 + i * 36;
    const fy = counterY + 18 + (i % 3) * 4;
    ctx.beginPath();
    ctx.arc(fx, fy, 1.5 + (i % 2), 0, Math.PI * 2);
    ctx.fill();
  }

  

  // dough
  ctx.fillStyle = "#e7cfab";
  ctx.beginPath();
  ctx.ellipse(sceneX + 160, counterY + 22, 28, 18, 0.08, 0, Math.PI * 2);
  ctx.fill();

  // rolling pin
  ctx.save();
  ctx.translate(sceneX + 245, counterY + 24);
  ctx.rotate(-0.14);
  ctx.fillStyle = "#9d744f";
  ctx.fillRect(-24, -4, 48, 8);
  ctx.fillStyle = "#6e4d34";
  ctx.fillRect(-32, -3, 8, 6);
  ctx.fillRect(24, -3, 8, 6);
  ctx.restore();

  // =====================================================
  // 5. LOAF PROGRESS SHELF
  // =====================================================
  const shelfX = x + 430;
  const shelfY = y + 155;
  const shelfW = 260;
  const shelfH = 62;

  ctx.fillStyle = "#5d3a24";
  ctx.fillRect(shelfX, shelfY + 38, shelfW, 10);

  ctx.fillStyle = "rgba(255,255,255,0.08)";
  ctx.fillRect(shelfX, shelfY + 38, shelfW, 2);

  const maxLoaves = 10;
  for (let i = 0; i < maxLoaves; i++) {
    const lx = shelfX + 18 + i * 24;
    const ly = shelfY + 28;

    if (i < bakeryJob.hits) {
      ctx.fillStyle = "#d28c38";
      ctx.beginPath();
      ctx.ellipse(lx, ly, 10, 7, 0, 0, Math.PI * 2);
      ctx.fill();

      ctx.strokeStyle = "#8b4513";
      ctx.lineWidth = 1.5;
      ctx.beginPath();
      ctx.moveTo(lx - 4, ly - 2);
      ctx.lineTo(lx + 4, ly + 2);
      ctx.stroke();

      if (i === bakeryJob.hits - 1) {
        ctx.fillStyle = `rgba(255,255,255,${0.14 + Math.sin(now * 0.01) * 0.06})`;
        ctx.beginPath();
        ctx.arc(lx, ly - 12 - ((now % 700) / 80), 4, 0, Math.PI * 2);
        ctx.fill();
      }
    } else {
      ctx.strokeStyle = "rgba(61,38,26,0.22)";
      ctx.lineWidth = 1.2;
      ctx.setLineDash([4, 4]);
      ctx.beginPath();
      ctx.ellipse(lx, ly, 9, 6, 0, 0, Math.PI * 2);
      ctx.stroke();
      ctx.setLineDash([]);
    }
  }

  // =====================================================
  // 6. OVEN / FIRE AREA
  // =====================================================
  const cx = w / 2;
  const cy = y + 345;
  const radius = 106;

  const glowPulse = 0.88 + Math.sin(now * 0.01) * 0.08;
  const fireGlow = ctx.createRadialGradient(cx, cy, 10, cx, cy, 155);
  fireGlow.addColorStop(0, `rgba(255, 170, 70, ${0.32 * glowPulse})`);
  fireGlow.addColorStop(0.45, `rgba(255, 120, 40, ${0.18 * glowPulse})`);
  fireGlow.addColorStop(1, "rgba(255, 120, 40, 0)");
  ctx.fillStyle = fireGlow;
  ctx.beginPath();
  ctx.arc(cx, cy, 155, 0, Math.PI * 2);
  ctx.fill();

  // oven frame
  ctx.fillStyle = "#4a2d1f";
  ctx.beginPath();
  ctx.arc(cx, cy + 8, 132, Math.PI, 0, false);
  ctx.lineTo(cx + 132, cy + 28);
  ctx.lineTo(cx - 132, cy + 28);
  ctx.closePath();
  ctx.fill();

  // inner oven
  ctx.fillStyle = "#22140d";
  ctx.beginPath();
  ctx.arc(cx, cy + 10, 108, Math.PI, 0, false);
  ctx.lineTo(cx + 108, cy + 28);
  ctx.lineTo(cx - 108, cy + 28);
  ctx.closePath();
  ctx.fill();

  // flames
  const flameBaseY = cy + 18;
  for (let i = 0; i < 5; i++) {
    const fx = cx - 44 + i * 22;
    const flameH = 16 + Math.sin(now * 0.012 + i) * 4;

    ctx.fillStyle = i % 2 === 0 ? "#ffb347" : "#ff7e36";
    ctx.beginPath();
    ctx.moveTo(fx, flameBaseY);
    ctx.quadraticCurveTo(fx - 5, flameBaseY - flameH * 0.45, fx, flameBaseY - flameH);
    ctx.quadraticCurveTo(fx + 5, flameBaseY - flameH * 0.45, fx, flameBaseY);
    ctx.fill();
  }

  // =====================================================
  // 7. GAUGE
  // =====================================================
  // outer ring
  ctx.strokeStyle = "#3d2b1f";
  ctx.lineWidth = 28;
  ctx.lineCap = "round";
  ctx.beginPath();
  ctx.arc(cx, cy, radius, Math.PI, 0, false);
  ctx.stroke();

  // inner highlight
  ctx.strokeStyle = "rgba(255,255,255,0.08)";
  ctx.lineWidth = 6;
  ctx.beginPath();
  ctx.arc(cx, cy - 2, radius - 12, Math.PI, 0, false);
  ctx.stroke();

  // dynamic green zone
const zoneWidth = bakeryJob.targetWidth;
const zoneStart = Math.PI + Math.PI * (targetPos - zoneWidth / 2);
const zoneEnd = Math.PI + Math.PI * (targetPos + zoneWidth / 2);

  ctx.strokeStyle = "#76c442";
  ctx.lineWidth = 18;
  ctx.shadowColor = "#76c442";
  ctx.shadowBlur = 14;
  ctx.beginPath();
  ctx.arc(cx, cy, radius, zoneStart, zoneEnd, false);
  ctx.stroke();
  ctx.shadowBlur = 0;

  // tick marks
  for (let i = 0; i <= 10; i++) {
    const t = i / 10;
    const ang = Math.PI + Math.PI * t;

    const ix = cx + Math.cos(ang) * (radius - 22);
    const iy = cy + Math.sin(ang) * (radius - 22);
    const ox = cx + Math.cos(ang) * (radius + 8);
    const oy = cy + Math.sin(ang) * (radius + 8);

    ctx.strokeStyle = "rgba(70,45,30,0.55)";
    ctx.lineWidth = i === 5 ? 4 : 2;
    ctx.beginPath();
    ctx.moveTo(ix, iy);
    ctx.lineTo(ox, oy);
    ctx.stroke();
  }

  // needle
  const markerAngle = Math.PI + Math.PI * bakeryJob.marker;

  ctx.save();
  ctx.translate(cx, cy);
  ctx.rotate(markerAngle);

  ctx.fillStyle = "rgba(0,0,0,0.25)";
  ctx.fillRect(2, -3, radius + 10, 6);

  ctx.fillStyle = "#c94b3c";
  ctx.beginPath();
  ctx.moveTo(-12, 0);
  ctx.lineTo(0, -5);
  ctx.lineTo(radius + 10, 0);
  ctx.lineTo(0, 5);
  ctx.closePath();
  ctx.fill();

  ctx.restore();

  // center cap
  ctx.fillStyle = "#3d2b1f";
  ctx.beginPath();
  ctx.arc(cx, cy, 12, 0, Math.PI * 2);
  ctx.fill();

  ctx.fillStyle = "#a77d55";
  ctx.beginPath();
  ctx.arc(cx - 2, cy - 2, 4, 0, Math.PI * 2);
  ctx.fill();

  // prompt
  const pulse = 0.84 + Math.sin(now * 0.014) * 0.16;
  ctx.fillStyle = `rgba(43,29,21,${pulse})`;
  ctx.font = `bold 18px ${westernFont}`;
  ctx.textAlign = "center";
  ctx.fillText("PRESS SPACE", w / 2, y + 396);

  // =====================================================
  // 8. BOTTOM STATS
  // =====================================================
  const statX = x + 26;
  const statY = y + boxH - 54;
  const statW = boxW - 52;
  const statH = 34;

  drawPanel(statX, statY, statW, statH, "#4b2f20", "#c79b65");

  ctx.fillStyle = "#f5e6d0";
  ctx.textAlign = "center";
  ctx.font = `bold 14px ${westernFont}`;
ctx.fillText(
  `TIME: ${bakeryJob.countdown.toFixed(1)}s   •   HITS: ${bakeryJob.hits}/${maxLoaves}   •   MISSES: ${bakeryJob.misses}   •   SPEED: ${bakeryJob.markerSpeed.toFixed(2)}x`,
  w / 2,
  statY + 23
);
};
//-----------------------------------//
//------------------draw job result--------------------//
const drawJobResult = (w: number, h: number) => {
  const westernFont = "'Courier New', Courier, monospace";

  const roundRect = (
    x: number,
    y: number,
    width: number,
    height: number,
    radius: number
  ) => {
    const r = Math.min(radius, width / 2, height / 2);
    ctx.beginPath();
    ctx.moveTo(x + r, y);
    ctx.lineTo(x + width - r, y);
    ctx.quadraticCurveTo(x + width, y, x + width, y + r);
    ctx.lineTo(x + width, y + height - r);
    ctx.quadraticCurveTo(x + width, y + height, x + width - r, y + height);
    ctx.lineTo(x + r, y + height);
    ctx.quadraticCurveTo(x, y + height, x, y + height - r);
    ctx.lineTo(x, y + r);
    ctx.quadraticCurveTo(x, y, x + r, y);
    ctx.closePath();
  };

  const drawPanel = (
    x: number,
    y: number,
    width: number,
    height: number,
    fill = "#d7b082",
    stroke = "#4e3427"
  ) => {
    ctx.save();

    ctx.globalAlpha = 0.24;
    ctx.fillStyle = "#000";
    roundRect(x + 6, y + 8, width, height, 14);
    ctx.fill();
    ctx.globalAlpha = 1;

    const grad = ctx.createLinearGradient(x, y, x, y + height);
    grad.addColorStop(0, fill);
    grad.addColorStop(1, "#b98558");
    ctx.fillStyle = grad;
    roundRect(x, y, width, height, 14);
    ctx.fill();

    ctx.fillStyle = "rgba(255,255,255,0.08)";
    roundRect(x + 5, y + 5, width - 10, height * 0.22, 10);
    ctx.fill();

    ctx.strokeStyle = stroke;
    ctx.lineWidth = 3;
    roundRect(x, y, width, height, 14);
    ctx.stroke();

    ctx.strokeStyle = "rgba(78,52,39,0.25)";
    ctx.lineWidth = 1;
    roundRect(x + 6, y + 6, width - 12, height - 12, 10);
    ctx.stroke();

    ctx.restore();
  };

  const drawNail = (x: number, y: number) => {
    ctx.save();
    ctx.fillStyle = "#7e7e7e";
    ctx.beginPath();
    ctx.arc(x, y, 4, 0, Math.PI * 2);
    ctx.fill();

    ctx.fillStyle = "rgba(255,255,255,0.25)";
    ctx.beginPath();
    ctx.arc(x - 1, y - 1, 1.3, 0, Math.PI * 2);
    ctx.fill();
    ctx.restore();
  };

  const efficiency =
    bakeryJob.presses > 0
      ? Math.round((bakeryJob.hits / bakeryJob.presses) * 100)
      : 0;

  const bossComment =
    efficiency >= 90
      ? "Boss says: “That was your finest batch yet.”"
      : efficiency >= 75
      ? "Boss says: “Good work. Kept the ovens honest.”"
      : efficiency >= 55
      ? "Boss says: “Not bad. A few loaves nearly got away from ya.”"
      : efficiency >= 35
      ? "Boss says: “You'll get faster. Keep your eye on the heat.”"
      : "Boss says: “Rough morning. Try not to burn the next batch.”";
  // =========================================================
  // 1. DIM WORLD
  // =========================================================
  ctx.fillStyle = "rgba(18, 12, 8, 0.78)";
  ctx.fillRect(0, 0, w, h);

  const vignette = ctx.createRadialGradient(
    w / 2,
    h / 2,
    w * 0.12,
    w / 2,
    h / 2,
    w * 0.76
  );
  vignette.addColorStop(0, "rgba(0,0,0,0)");
  vignette.addColorStop(1, "rgba(0,0,0,0.24)");
  ctx.fillStyle = vignette;
  ctx.fillRect(0, 0, w, h);

  // =========================================================
  // 2. MAIN PANEL
  // =========================================================
  const boxW = 680;
  const boxH = 420;
  const x = w / 2 - boxW / 2;
  const y = h / 2 - boxH / 2;

  drawPanel(x, y, boxW, boxH, "#e2c39c");

  drawNail(x + 26, y + 16);
  drawNail(x + boxW - 26, y + 16);

  // =========================================================
  // 3. HEADER
  // =========================================================
  ctx.fillStyle = "#2b1d15";
  ctx.textAlign = "center";
  ctx.textBaseline = "alphabetic";

  ctx.font = `bold 14px ${westernFont}`;
  ctx.fillText("OFFICIAL WAGE SLIP", w / 2, y + 34);

  ctx.font = `bold 30px ${westernFont}`;
  ctx.fillText("BAKERY SHIFT RECEIPT", w / 2, y + 72);

  ctx.strokeStyle = "#6a4a35";
  ctx.lineWidth = 2;
  ctx.beginPath();
  ctx.moveTo(w / 2 - 170, y + 88);
  ctx.lineTo(w / 2 + 170, y + 88);
  ctx.stroke();

  ctx.fillStyle = "#6a4a35";
  ctx.beginPath();
  ctx.arc(w / 2 - 182, y + 88, 3, 0, Math.PI * 2);
  ctx.arc(w / 2 + 182, y + 88, 3, 0, Math.PI * 2);
  ctx.fill();

  // =========================================================
  // 4. RESULT ICON + LABEL
  // =========================================================
  const iconX = x + 100;
  const iconY = y + 145;

  // shadow under loaf
  ctx.fillStyle = "rgba(0,0,0,0.12)";
  ctx.beginPath();
  ctx.ellipse(iconX, iconY + 24, 28, 8, 0, 0, Math.PI * 2);
  ctx.fill();

  const didGood = bakeryJob.hits >= bakeryJob.misses;

  if (didGood) {
    // loaf
    ctx.fillStyle = "#cd853f";
    ctx.beginPath();
    ctx.ellipse(iconX, iconY, 34, 22, 0, 0, Math.PI * 2);
    ctx.fill();

    ctx.strokeStyle = "rgba(90,45,15,0.35)";
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.moveTo(iconX - 10, iconY - 4);
    ctx.lineTo(iconX - 1, iconY + 4);
    ctx.moveTo(iconX + 4, iconY - 6);
    ctx.lineTo(iconX + 13, iconY + 2);
    ctx.stroke();

    // steam
    ctx.strokeStyle = "rgba(255,255,255,0.32)";
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.moveTo(iconX - 10, iconY - 28);
    ctx.quadraticCurveTo(iconX - 16, iconY - 38, iconX - 10, iconY - 48);
    ctx.moveTo(iconX + 2, iconY - 30);
    ctx.quadraticCurveTo(iconX - 2, iconY - 40, iconX + 4, iconY - 50);
    ctx.stroke();
  } else {
    // burnt lump
    ctx.fillStyle = "#3d2b1f";
    ctx.beginPath();
    ctx.ellipse(iconX, iconY, 30, 20, -0.08, 0, Math.PI * 2);
    ctx.fill();

    ctx.strokeStyle = "rgba(255,255,255,0.08)";
    ctx.lineWidth = 1.5;
    ctx.beginPath();
    ctx.moveTo(iconX - 8, iconY - 4);
    ctx.lineTo(iconX - 2, iconY + 3);
    ctx.moveTo(iconX + 4, iconY - 7);
    ctx.lineTo(iconX + 10, iconY + 1);
    ctx.stroke();
  }

  ctx.fillStyle = "#2b1d15";
  ctx.font = "italic 22px Georgia, serif";
  ctx.fillText(bakeryJob.resultLabel.toUpperCase(), x + boxW / 2, y + 145);

  // =========================================================
  // 5. BOSS COMMENT
  // =========================================================
  const commentX = x + 170;
  const commentY = y + 118;
  const commentW = boxW - 200;
  const commentH = 62;

  ctx.fillStyle = "rgba(185, 135, 88, 0.16)";
  roundRect(commentX, commentY, commentW, commentH, 10);
  ctx.fill();

  ctx.strokeStyle = "rgba(92, 61, 41, 0.22)";
  ctx.lineWidth = 1;
  roundRect(commentX, commentY, commentW, commentH, 10);
  ctx.stroke();

  ctx.fillStyle = "#4c3425";
  ctx.font = "18px Georgia, serif";
  ctx.textAlign = "left";
  ctx.fillText(bossComment, commentX + 18, commentY + 38);

  // =========================================================
  // 6. PAY STAMP
  // =========================================================
  ctx.save();
  ctx.translate(x + boxW / 2, y + 220);
  ctx.rotate(-0.04);

  ctx.fillStyle = bakeryJob.payout > 0 ? "#8c3333" : "#2b1d15";
  ctx.font = `bold 34px ${westernFont}`;
  ctx.textAlign = "center";
  ctx.fillText(`PAID: $${bakeryJob.payout}`, 0, 0);

  ctx.strokeStyle =
    bakeryJob.payout > 0 ? "rgba(140, 51, 51, 0.45)" : "rgba(43,29,21,0.2)";
  ctx.lineWidth = 3;
  ctx.strokeRect(-145, -38, 290, 54);

  ctx.restore();

  // =========================================================
  // 7. STATS AREA
  // =========================================================
  const statsX = x + 32;
  const statsY = y + 255;
  const statsW = boxW - 64;
  const statsH = 100;

  drawPanel(statsX, statsY, statsW, statsH, "#4b2f20", "#c79b65");

  ctx.textAlign = "left";
  ctx.fillStyle = "#f5e6d0";

  ctx.font = `bold 15px ${westernFont}`;
  ctx.fillText(`SUCCESSFUL HITS: ${bakeryJob.hits}`, statsX + 22, statsY + 30);
  ctx.fillText(`FAILED HITS: ${bakeryJob.misses}`, statsX + 22, statsY + 56);
  ctx.fillText(`TOTAL PRESSES: ${bakeryJob.presses}`, statsX + 22, statsY + 82);

  ctx.textAlign = "right";
  ctx.fillText(`SHIFT PAY: $${bakeryJob.payout}`, statsX + statsW - 22, statsY + 30);
  ctx.fillText(`ACCURACY: ${efficiency}%`, statsX + statsW - 22, statsY + 56);
  ctx.fillText(
    `QUALITY: ${bakeryJob.resultLabel.toUpperCase()}`,
    statsX + statsW - 22,
    statsY + 82
  );

  // =========================================================
  // 8. FOOTER
  // =========================================================
  ctx.textAlign = "center";
  ctx.fillStyle = "rgba(43, 29, 21, 0.72)";
  ctx.font = `bold 14px ${westernFont}`;
  ctx.fillText("PRESS [ ENTER / I / ESC ] TO SIGN", w / 2, y + boxH - 18);
};
//--------------------------//

//----game over------------//
//------------------draw game over--------------------//
const drawGameOverTint = (w: number, h: number) => {
  const westernFont = "'Courier New', Courier, monospace";

  const goRoundRect = (
    x: number,
    y: number,
    width: number,
    height: number,
    radius: number
  ) => {
    const r = Math.min(radius, width / 2, height / 2);
    ctx.beginPath();
    ctx.moveTo(x + r, y);
    ctx.lineTo(x + width - r, y);
    ctx.quadraticCurveTo(x + width, y, x + width, y + r);
    ctx.lineTo(x + width, y + height - r);
    ctx.quadraticCurveTo(x + width, y + height, x + width - r, y + height);
    ctx.lineTo(x + r, y + height);
    ctx.quadraticCurveTo(x, y + height, x, y + height - r);
    ctx.lineTo(x, y + r);
    ctx.quadraticCurveTo(x, y, x + r, y);
    ctx.closePath();
  };

  const drawGameOverPanel = (
    x: number,
    y: number,
    width: number,
    height: number,
    fill = "#d7b082",
    stroke = "#4e3427"
  ) => {
    ctx.save();

    ctx.globalAlpha = 0.24;
    ctx.fillStyle = "#000";
    goRoundRect(x + 6, y + 8, width, height, 14);
    ctx.fill();
    ctx.globalAlpha = 1;

    const grad = ctx.createLinearGradient(x, y, x, y + height);
    grad.addColorStop(0, fill);
    grad.addColorStop(1, "#b98558");
    ctx.fillStyle = grad;
    goRoundRect(x, y, width, height, 14);
    ctx.fill();

    ctx.fillStyle = "rgba(255,255,255,0.08)";
    goRoundRect(x + 5, y + 5, width - 10, height * 0.22, 10);
    ctx.fill();

    ctx.strokeStyle = stroke;
    ctx.lineWidth = 3;
    goRoundRect(x, y, width, height, 14);
    ctx.stroke();

    ctx.strokeStyle = "rgba(78,52,39,0.25)";
    ctx.lineWidth = 1;
    goRoundRect(x + 6, y + 6, width - 12, height - 12, 10);
    ctx.stroke();

    ctx.restore();
  };

  const drawGameOverNail = (x: number, y: number) => {
    ctx.save();
    ctx.fillStyle = "#7e7e7e";
    ctx.beginPath();
    ctx.arc(x, y, 4, 0, Math.PI * 2);
    ctx.fill();

    ctx.fillStyle = "rgba(255,255,255,0.25)";
    ctx.beginPath();
    ctx.arc(x - 1, y - 1, 1.3, 0, Math.PI * 2);
    ctx.fill();
    ctx.restore();
  };

  // =========================================================
  // 1. DIM WORLD
  // =========================================================
  ctx.fillStyle = "rgba(18, 12, 8, 0.82)";
  ctx.fillRect(0, 0, w, h);

  const vignette = ctx.createRadialGradient(
    w / 2,
    h / 2,
    w * 0.12,
    w / 2,
    h / 2,
    w * 0.76
  );
  vignette.addColorStop(0, "rgba(0,0,0,0)");
  vignette.addColorStop(1, "rgba(0,0,0,0.30)");
  ctx.fillStyle = vignette;
  ctx.fillRect(0, 0, w, h);

  // =========================================================
  // 2. MAIN PANEL
  // =========================================================
  const boxW = 560;
  const boxH = 560;
  const x = w / 2 - boxW / 2;
  const y = h / 2 - boxH / 2;

  drawGameOverPanel(x, y, boxW, boxH, "#e2c39c");
  drawGameOverNail(x + 26, y + 16);
  drawGameOverNail(x + boxW - 26, y + 16);

  // =========================================================
  // 3. HEADER
  // =========================================================
  ctx.fillStyle = "#2b1d15";
  ctx.textAlign = "center";
  ctx.textBaseline = "alphabetic";

  ctx.font = `bold 14px ${westernFont}`;
  ctx.fillText("SHERIFF'S FINAL NOTICE", w / 2, y + 34);

  ctx.font = `bold 34px ${westernFont}`;
  ctx.fillText("WANTED", w / 2, y + 74);

  ctx.strokeStyle = "#6a4a35";
  ctx.lineWidth = 2;
  ctx.beginPath();
  ctx.moveTo(w / 2 - 170, y + 90);
  ctx.lineTo(w / 2 + 170, y + 90);
  ctx.stroke();

  ctx.fillStyle = "#6a4a35";
  ctx.beginPath();
  ctx.arc(w / 2 - 182, y + 90, 3, 0, Math.PI * 2);
  ctx.arc(w / 2 + 182, y + 90, 3, 0, Math.PI * 2);
  ctx.fill();

  // =========================================================
  // 4. SILHOUETTE PANEL
  // =========================================================
  const posterX = x + 84;
  const posterY = y + 112;
  const posterW = boxW - 168;
  const posterH = 220;

  ctx.fillStyle = "rgba(185, 135, 88, 0.16)";
  goRoundRect(posterX, posterY, posterW, posterH, 10);
  ctx.fill();

  ctx.strokeStyle = "rgba(92, 61, 41, 0.22)";
  ctx.lineWidth = 1;
  goRoundRect(posterX, posterY, posterW, posterH, 10);
  ctx.stroke();

  const cx = posterX + posterW / 2;
  const cy = posterY + posterH / 2 + 10;

  // shadow
  ctx.fillStyle = "rgba(0,0,0,0.12)";
  ctx.beginPath();
  ctx.ellipse(cx, posterY + posterH - 24, 42, 10, 0, 0, Math.PI * 2);
  ctx.fill();

  // silhouette
  ctx.save();
  ctx.fillStyle = "#2b1d15";

  // hat brim
  ctx.beginPath();
  ctx.ellipse(cx, cy - 62, 68, 10, 0, 0, Math.PI * 2);
  ctx.fill();

  // hat crown
  ctx.fillRect(cx - 26, cy - 96, 52, 34);

  // head
  ctx.beginPath();
  ctx.arc(cx, cy - 28, 26, 0, Math.PI * 2);
  ctx.fill();

  // coat / shoulders
  ctx.beginPath();
  ctx.moveTo(cx - 74, cy + 80);
  ctx.lineTo(cx - 38, cy + 8);
  ctx.lineTo(cx + 38, cy + 8);
  ctx.lineTo(cx + 74, cy + 80);
  ctx.closePath();
  ctx.fill();

  // torso
  ctx.beginPath();
  ctx.moveTo(cx - 32, cy + 8);
  ctx.lineTo(cx + 32, cy + 8);
  ctx.lineTo(cx + 44, cy + 92);
  ctx.lineTo(cx - 44, cy + 92);
  ctx.closePath();
  ctx.fill();

  ctx.restore();

  // =========================================================
  // 5. LABEL / FLAVOR
  // =========================================================
  ctx.fillStyle = "#2b1d15";
  ctx.textAlign = "center";
  ctx.font = "italic 22px Georgia, serif";
  ctx.fillText("OUTLAW OF THE CLOCK", w / 2, y + 364);

  const noteX = x + 52;
  const noteY = y + 380;
  const noteW = boxW - 104;
  const noteH = 58;

  ctx.fillStyle = "rgba(185, 135, 88, 0.16)";
  goRoundRect(noteX, noteY, noteW, noteH, 10);
  ctx.fill();

  ctx.strokeStyle = "rgba(92, 61, 41, 0.22)";
  ctx.lineWidth = 1;
  goRoundRect(noteX, noteY, noteW, noteH, 10);
  ctx.stroke();

  ctx.fillStyle = "#4c3425";
  ctx.font = "18px Georgia, serif";
  ctx.textAlign = "center";
  ctx.fillText("Ran clean outta time.", w / 2, noteY + 37);

  // =========================================================
  // 6. GAME OVER STAMP
  // =========================================================
  ctx.save();
  ctx.translate(x + boxW / 2, y + 470);
  ctx.rotate(-0.1);

  ctx.fillStyle = "rgba(140, 51, 51, 0.16)";
  ctx.fillRect(-160, -30, 320, 52);

  ctx.strokeStyle = "rgba(140, 51, 51, 0.50)";
  ctx.lineWidth = 3;
  ctx.strokeRect(-160, -30, 320, 52);

  ctx.fillStyle = "#8c3333";
  ctx.font = `bold 34px ${westernFont}`;
  ctx.textAlign = "center";
  ctx.fillText("GAME OVER", 0, 7);

  ctx.restore();

  // =========================================================
  // 7. FOOTER
  // =========================================================
  ctx.textAlign = "center";
  ctx.fillStyle = "rgba(43, 29, 21, 0.72)";
  ctx.font = `bold 14px ${westernFont}`;
  ctx.fillText("PRESS [ R / ENTER / I ] TO TRY AGAIN", w / 2, y + boxH - 16);
};
//----------------------------------------------------//
    // =========================================================
    // UPDATE
    // =========================================================
  const update = (dt: number, w: number, h: number) => {
  if (ui.toastTimer > 0) {
    ui.toastTimer -= dt;
    if (ui.toastTimer <= 0) {
      ui.toastTimer = 0;
      ui.toast = "";
    }
  }

  updateClock(dt);
  updatePlayer(dt);
  updateNPCs(dt);
  updateBakeryJob(dt);
  updateAmbient(dt);
  updateDustPuffs(dt);
  updateCamera(w, h);
};

// =========================================================
// RENDER
// =========================================================

type StreetThing =
  | { kind: "prop"; y: number; prop: Prop }
  | { kind: "npc"; y: number; npc: NPC }
  | { kind: "player"; y: number }
  | { kind: "tumbleweed"; y: number; weed: Tumbleweed };

const render = (w: number, h: number) => {
  hCache.width = w;
  hCache.height = h;

  drawBackground(ctx, canvas.width, canvas.height);
  drawGround();
  drawStreetWindLines();

  // buildings stay as their own layer
  for (const b of buildings) drawBuilding(b);

  // one mixed street list so depth feels correct
  const streetThings: StreetThing[] = [];

  for (const prop of props) {
    streetThings.push({
      kind: "prop",
      y: getSortYForProp(prop),
      prop,
    });
  }

  for (const weed of tumbleweeds) {
    streetThings.push({
      kind: "tumbleweed",
      y: getSortYForTumbleweed(weed),
      weed,
    });
  }

  for (const npc of npcs) {
    streetThings.push({
      kind: "npc",
      y: getSortYForNPC(npc),
      npc,
    });
  }

  streetThings.push({
    kind: "player",
    y: getSortYForPlayer(),
  });

  streetThings.sort((a, b) => a.y - b.y);

  drawDustPuffs();

  for (const thing of streetThings) {
    if (thing.kind === "prop") {
      drawProp(thing.prop);
    } else if (thing.kind === "tumbleweed") {
      drawTumbleweed(thing.weed);
    } else if (thing.kind === "npc") {
      drawNPC(thing.npc);
    } else {
      drawPlayer();
    }
  }

  drawTimeLighting(w, h);

  drawHud(w, h);

  if (bakeryJob.active) drawBakeryMinigame(w, h);
  if (ui.panel === "bank") drawBankPanel(w, h);
  if (ui.panel === "jobResult") drawJobResult(w, h);
  if (world.storyCard) drawStoryCard(w, h, world.storyCard);
  if (world.gameOver) drawGameOverTint(w, h);
};

    // =========================================================
    // LOOP
    // =========================================================
    const loop = (now: number) => {
      const dt = Math.min(0.033, (now - lastNow) / 1000);
      lastNow = now;

      const rect = canvas.getBoundingClientRect();
      const w = Math.max(1, Math.floor(rect.width));
      const h = Math.max(1, Math.floor(rect.height));

      if (canvas.width !== w) canvas.width = w;
      if (canvas.height !== h) canvas.height = h;

      update(dt, w, h);
      render(w, h);

      animationFrameId = requestAnimationFrame(loop);
    };

    animationFrameId = requestAnimationFrame(loop);

    // =========================================================
    // CLEANUP
    // =========================================================
 return () => {
  cancelAnimationFrame(animationFrameId);
  window.removeEventListener("keydown", onKeyDown);
  window.removeEventListener("keyup", onKeyUp);

  // stop music when component unmounts
  bgm.pause();
  bgm.currentTime = 0;
};
  }, []);

  return (
    <div className="w-full h-screen bg-black">
      <canvas ref={canvasRef} className="w-full h-full block" />
    </div>
  );
}