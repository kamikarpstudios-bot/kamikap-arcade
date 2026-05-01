type SplashBurst = {
  x: number;
  y: number;
  bornAt: number;
  strength: number;
  kind: "impact" | "skim";
};

type DrawSillyGooseSceneArgs = {
  width: number;
  height: number;
  time: number;
  cannonAngle: number;
  gooseX: number;
  gooseY: number;
  gooseVX?: number;
  gooseVY?: number;
  launched: boolean;
  distance: number;
  cameraX?: number;
  cannonLevel?: number;
  tubeLevel?: number;
  cashLevel?: number;
  jetpackLevel?: number;
  coins?: number;
  skyBits?: number;
  jetpackFuel?: number;
showResults?: boolean;
lastRunDistance?: number;
lastRunCoins?: number;
lastRunSkyBits?: number;
mapSkin?: GooseMapSkinName;
  mapLength?: number;
  splashBursts?: SplashBurst[];
  launchFlashAge?: number | null;
  displayCoins?: number;
  resultsCardAge?: number;
  finishPulse?: number;
};

type WoodenRamp = {
  x: number;
  width: number;
  height: number;
};

const WOODEN_RAMPS: WoodenRamp[] = [
  { x: 1540, width: 90, height: 24 },
  { x: 3450, width: 110, height: 28 },
];

type GooseMapSkin = {
  skyStops: [string, string, string];
  waterStops: [string, string, string, string];
  surfaceLine: string;
  whitecapStroke: string;
  whitecapBubble: string;
  foamStroke: string;
  foamBubble: string;
  wakeStroke: string;
  wakeChurn: string;
  wakeFleck: string;
  wakeSpray: string;
  grassDark: string;
  grassMid: string;
  grassLight: string;
  grassBright: string;
  flowerPetal: string;
  flowerCenter: string;
  decorTheme: "sunny" | "night" | "desert" | "pool";
  cloudTheme: "clouds" | "aurora" | "wispy" | "clear";
  decorScale?: number;
  decorDensity?: number;
};

const SUNNY_ISLES_SKIN: GooseMapSkin = {
  skyStops: ["#8ed0ff", "#b8e7ff", "#e9f9ff"],
  waterStops: ["#6ed3ff", "#4fb8ee", "#2f90cf", "#145f9a"],
  surfaceLine: "rgba(230, 250, 255, 0.75)",
  whitecapStroke: "rgba(245,252,255,0.55)",
  whitecapBubble: "rgba(255,255,255,0.45)",
  foamStroke: "rgba(235,250,255,0.9)",
  foamBubble: "rgba(255,255,255,0.7)",
  wakeStroke: "245,252,255",
  wakeChurn: "255,255,255",
  wakeFleck: "255,255,255",
  wakeSpray: "255,255,255",
  grassDark: "#4f8f47",
  grassMid: "#5f9d53",
  grassLight: "#76b765",
  grassBright: "#89c779",
  flowerPetal: "#ffd6f3",
  flowerCenter: "#ffd34d",
  decorTheme: "sunny",
  cloudTheme: "clouds",
  decorScale: 1,
  decorDensity: 1,
};

const NIGHT_GLOW_SKIN: GooseMapSkin = {
  skyStops: ["#0b1630", "#16325c", "#315b8f"],
  waterStops: ["#244d7a", "#1d3f68", "#173355", "#10233d"],
  surfaceLine: "rgba(210,235,255,0.5)",
  whitecapStroke: "rgba(220,240,255,0.35)",
  whitecapBubble: "rgba(235,245,255,0.3)",
  foamStroke: "rgba(220,240,255,0.7)",
  foamBubble: "rgba(255,255,255,0.55)",
  wakeStroke: "220,235,255",
  wakeChurn: "235,245,255",
  wakeFleck: "235,245,255",
  wakeSpray: "235,245,255",
  grassDark: "#2b6a4e",
  grassMid: "#34785a",
  grassLight: "#46906c",
  grassBright: "#5ab985",
  flowerPetal: "#b9a7ff",
  flowerCenter: "#ffe66d",
  decorTheme: "night",
  cloudTheme: "aurora",
  decorScale: 1.05,
  decorDensity: 0.62,
};

const DESERT_DUNES_SKIN: GooseMapSkin = {
  skyStops: ["#ffd79a", "#ffc37c", "#ffefcc"],
  waterStops: ["#e0ba72", "#c89b56", "#ae7f3e", "#8e652d"],
  surfaceLine: "rgba(255,240,210,0.45)",
  whitecapStroke: "rgba(255,235,205,0.32)",
  whitecapBubble: "rgba(255,240,220,0.24)",
  foamStroke: "rgba(255,235,205,0.55)",
  foamBubble: "rgba(255,245,225,0.4)",
  wakeStroke: "255,230,200",
  wakeChurn: "255,235,205",
  wakeFleck: "255,240,220",
  wakeSpray: "255,240,220",
  grassDark: "#9b7a3a",
  grassMid: "#b08a43",
  grassLight: "#c39a4e",
  grassBright: "#d6b05c",
  flowerPetal: "#ffd3a8",
  flowerCenter: "#fff1a8",
  decorTheme: "desert",
  cloudTheme: "wispy",
  decorScale: 1.45,
  decorDensity: 0.42,
};

const POOL_PARTY_SKIN: GooseMapSkin = {
  skyStops: ["#9ee8ff", "#7fdcff", "#d8fbff"],
  waterStops: ["#6ae5ff", "#41d0ef", "#1fb4db", "#1384aa"],
  surfaceLine: "rgba(240,255,255,0.85)",
  whitecapStroke: "rgba(240,255,255,0.55)",
  whitecapBubble: "rgba(255,255,255,0.45)",
  foamStroke: "rgba(245,255,255,0.92)",
  foamBubble: "rgba(255,255,255,0.72)",
  wakeStroke: "245,252,255",
  wakeChurn: "255,255,255",
  wakeFleck: "255,255,255",
  wakeSpray: "255,255,255",
  grassDark: "#3f9a8f",
  grassMid: "#52b3a6",
  grassLight: "#6fcbbd",
  grassBright: "#8fe0d2",
  flowerPetal: "#ff9fd6",
  flowerCenter: "#ffe16b",
  decorTheme: "pool",
  cloudTheme: "clear",
  decorScale: 1.3,
  decorDensity: 0.52,
};

export const GOOSE_MAP_SKINS = {
  sunny: SUNNY_ISLES_SKIN,
  night: NIGHT_GLOW_SKIN,
  desert: DESERT_DUNES_SKIN,
  pool: POOL_PARTY_SKIN,
} as const;

export type GooseMapSkinName = keyof typeof GOOSE_MAP_SKINS;




function getHillY(x: number, height: number, time: number) {
  const progress = x / 1600;

  const rollingStrength =
    18 +
    Math.sin(x * 0.00075 + 0.8) * 10 +
    Math.sin(x * 0.00022 - 1.1) * 7;

  const bigShape =
    Math.sin(x * 0.0016) * (24 + progress * 5) +
    Math.sin(x * 0.0037 + 1.2) * (12 + rollingStrength * 0.35);

  const mediumShape =
    Math.sin(x * 0.008 + 0.3) * (7 + rollingStrength * 0.16) +
    Math.sin(x * 0.013 - 0.7) * 3.5;

  const aliveWiggle =
    Math.sin(x * 0.02 + time * 0.9) * 1.6 +
    Math.sin(x * 0.012 - time * 0.55) * 1.2;

  const plateauBias = Math.sin(x * 0.00095 - 0.4) * 20;

  const base = height * 0.59 + plateauBias;

  const raw = base + bigShape + mediumShape + aliveWiggle;

  const minY = height - 195;
  const maxY = height - 102;

  return Math.max(minY, Math.min(maxY, raw));
}

function getRampAtX(x: number) {
  return WOODEN_RAMPS.find((ramp) => x >= ramp.x && x <= ramp.x + ramp.width);
}

function getRampLift(x: number) {
  const ramp = getRampAtX(x);
  if (!ramp) return 0;

  const t = (x - ramp.x) / ramp.width;
  const clampedT = Math.max(0, Math.min(1, t));

  // low on entry, rises toward the end like a real launch ramp
  return clampedT * clampedT * ramp.height;
}

function getSurfaceY(x: number, height: number, time: number) {
  return getHillY(x, height, time);
}

function getGroundY(x: number, height: number, time: number) {
  return getSurfaceY(x, height, time) - getRampLift(x);
}

function drawSky(
  ctx: CanvasRenderingContext2D,
  width: number,
  height: number,
  skin: GooseMapSkin
) {
  const gradient = ctx.createLinearGradient(0, 0, 0, height);
  gradient.addColorStop(0, skin.skyStops[0]);
  gradient.addColorStop(0.55, skin.skyStops[1]);
  gradient.addColorStop(1, skin.skyStops[2]);

  ctx.fillStyle = gradient;
  ctx.fillRect(0, 0, width, height);
}

export function drawCloud(
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  scale: number
) {
  ctx.save();
  ctx.translate(x, y);
  ctx.scale(scale, scale);

  ctx.fillStyle = "rgba(255,255,255,0.8)";

  ctx.beginPath();
  ctx.arc(0, 0, 18, 0, Math.PI * 2);
  ctx.arc(18, -8, 22, 0, Math.PI * 2);
  ctx.arc(42, 0, 18, 0, Math.PI * 2);
  ctx.arc(22, 8, 22, 0, Math.PI * 2);
  ctx.fill();

  ctx.restore();
}

function drawAuroraBands(
  ctx: CanvasRenderingContext2D,
  width: number,
  height: number,
  time: number
) {
  ctx.save();

  // soft upper-sky haze
  const haze = ctx.createLinearGradient(0, 0, 0, height * 0.42);
  haze.addColorStop(0, "rgba(80, 170, 255, 0.06)");
  haze.addColorStop(0.45, "rgba(120, 255, 220, 0.08)");
  haze.addColorStop(1, "rgba(180, 120, 255, 0)");
  ctx.fillStyle = haze;
  ctx.fillRect(0, 0, width, height * 0.42);

  for (let i = 0; i < 3; i++) {
    const yBase = height * (0.12 + i * 0.075);
    const bandDepth = 28 + i * 5;
    const drift = Math.sin(time * 0.32 + i * 1.7) * 26;

    ctx.save();
    ctx.globalAlpha = 0.24 - i * 0.03;

    ctx.beginPath();

    for (let x = -60; x <= width + 60; x += 10) {
      const y =
        yBase +
        Math.sin(x * 0.009 + time * 0.7 + i * 1.3) * (14 + i * 2.5) +
        Math.sin(x * 0.0038 - time * 0.38 + i * 0.9) * (9 + i * 1.2) +
        Math.sin(x * 0.0016 + time * 0.21 + i) * 8 +
        drift * 0.12;

      if (x === -60) ctx.moveTo(x, y);
      else ctx.lineTo(x, y);
    }

    for (let x = width + 60; x >= -60; x -= 10) {
      const y =
        yBase +
        bandDepth +
        Math.sin(x * 0.009 + time * 0.7 + i * 1.3) * (14 + i * 2.5) +
        Math.sin(x * 0.0038 - time * 0.38 + i * 0.9) * (9 + i * 1.2) +
        Math.sin(x * 0.0016 + time * 0.21 + i) * 8 +
        drift * 0.12;

      ctx.lineTo(x, y);
    }

    ctx.closePath();

    const grad = ctx.createLinearGradient(0, yBase - 18, 0, yBase + bandDepth + 18);
    grad.addColorStop(0, "rgba(120,255,220,0)");
    grad.addColorStop(0.22, "rgba(120,255,220,0.18)");
    grad.addColorStop(0.48, "rgba(120,255,220,0.42)");
    grad.addColorStop(0.72, "rgba(185,120,255,0.30)");
    grad.addColorStop(1, "rgba(120,180,255,0)");

    ctx.fillStyle = grad;
    ctx.fill();

    // faint top edge shimmer
    ctx.strokeStyle = "rgba(190,255,245,0.10)";
    ctx.lineWidth = 2;
    ctx.beginPath();
    for (let x = -60; x <= width + 60; x += 14) {
      const y =
        yBase +
        Math.sin(x * 0.009 + time * 0.7 + i * 1.3) * (14 + i * 2.5) +
        Math.sin(x * 0.0038 - time * 0.38 + i * 0.9) * (9 + i * 1.2) +
        Math.sin(x * 0.0016 + time * 0.21 + i) * 8 +
        drift * 0.12;

      if (x === -60) ctx.moveTo(x, y);
      else ctx.lineTo(x, y);
    }
    ctx.stroke();

    ctx.restore();
  }

  // faint drifting particles
  ctx.save();
  for (let i = 0; i < 18; i++) {
    const px =
      ((i * 97 + time * (4 + (i % 3))) % (width + 120)) - 60;

    const py =
      height * 0.08 +
      (i % 6) * 24 +
      Math.sin(time * 0.7 + i * 1.4) * 8 +
      Math.sin(px * 0.01 + i) * 6;

    const r = 1 + (i % 3) * 0.45;
    const alpha = 0.05 + (i % 4) * 0.015;

    ctx.fillStyle = `rgba(210,255,245,${alpha})`;
    ctx.beginPath();
    ctx.arc(px, py, r, 0, Math.PI * 2);
    ctx.fill();
  }
  ctx.restore();

  ctx.restore();
}

function drawWispyDesertClouds(
  ctx: CanvasRenderingContext2D,
  width: number,
  height: number,
  time: number
) {
  ctx.save();
  ctx.lineCap = "round";

  const streaks = [
    { y: height * 0.16, speed: 8, scale: 1.1 },
    { y: height * 0.24, speed: 5.5, scale: 0.9 },
    { y: height * 0.11, speed: 6.5, scale: 0.7 },
  ];

  for (let i = 0; i < streaks.length; i++) {
    const streak = streaks[i];
    const offset = ((time * streak.speed + i * 220) % (width + 400)) - 200;

    for (let x = -260; x < width + 260; x += 280) {
      const px = x + offset;
      const py = streak.y + Math.sin(px * 0.004 + time * 0.4) * 6;

      ctx.strokeStyle = "rgba(255,255,255,0.38)";
      ctx.lineWidth = 18 * streak.scale;
      ctx.beginPath();
      ctx.moveTo(px - 70 * streak.scale, py);
      ctx.quadraticCurveTo(
        px,
        py - 10 * streak.scale,
        px + 90 * streak.scale,
        py + 2 * streak.scale
      );
      ctx.stroke();

      ctx.strokeStyle = "rgba(255,245,220,0.45)";
      ctx.lineWidth = 8 * streak.scale;
      ctx.beginPath();
      ctx.moveTo(px - 58 * streak.scale, py - 2);
      ctx.quadraticCurveTo(
        px + 10,
        py - 7 * streak.scale,
        px + 78 * streak.scale,
        py
      );
      ctx.stroke();
    }
  }

  ctx.restore();
}

export function drawClouds(
  ctx: CanvasRenderingContext2D,
  width: number,
  height: number,
  time: number,
  cloudTheme: GooseMapSkin["cloudTheme"] = "clouds"
) {
  if (cloudTheme === "aurora") {
    drawAuroraBands(ctx, width, height, time);
    return;
  }

  if (cloudTheme === "wispy") {
    drawWispyDesertClouds(ctx, width, height, time);
    return;
  }

  if (cloudTheme === "clear") {
    return;
  }

  drawCloud(ctx, ((time * 15) % (width + 200)) - 120, height * 0.18, 1.1);
  drawCloud(
    ctx,
    ((time * 9 + 260) % (width + 240)) - 140,
    height * 0.28,
    0.85
  );
  drawCloud(
    ctx,
    ((time * 12 + 520) % (width + 220)) - 120,
    height * 0.14,
    0.95
  );
}

//------------
function drawFarHills(
  ctx: CanvasRenderingContext2D,
  width: number,
  height: number,
  time: number,
  cameraX: number,
  skin: GooseMapSkin
) {
  const parallaxX = -cameraX * 0.18;

  ctx.save();
  ctx.translate(parallaxX, 0);

  // --- SUNNY -------------------------------------------------
  if (skin.decorTheme === "sunny") {
    const baseY = height * 0.7;

    const haze = ctx.createLinearGradient(0, height * 0.5, 0, height * 0.8);
    haze.addColorStop(0, "rgba(210,245,255,0)");
    haze.addColorStop(1, "rgba(130,210,235,0.2)");
    ctx.fillStyle = haze;
    ctx.fillRect(-600, height * 0.48, width + 1400, height * 0.34);

    const island = new Path2D();
    island.moveTo(-600, height);

    for (let x = -600; x <= width + 1000; x += 10) {
      const y =
        baseY +
        Math.sin(x * 0.0026 + 0.8) * 20 +
        Math.sin(x * 0.0058 - 1.2) * 12 +
        Math.sin(x * 0.0014 + 2.1) * 24;
      island.lineTo(x, y);
    }

    island.lineTo(width + 1000, height);
    island.closePath();

    const islandGrad = ctx.createLinearGradient(0, height * 0.56, 0, height);
    islandGrad.addColorStop(0, "#6fb28b");
    islandGrad.addColorStop(0.42, "#4f8967");
    islandGrad.addColorStop(1, "#264e3e");

    ctx.fillStyle = islandGrad;
    ctx.fill(island);

    ctx.strokeStyle = "rgba(225,255,238,0.22)";
    ctx.lineWidth = 2;
    ctx.beginPath();
    for (let x = -600; x <= width + 1000; x += 10) {
      const y =
        baseY +
        Math.sin(x * 0.0026 + 0.8) * 20 +
        Math.sin(x * 0.0058 - 1.2) * 12 +
        Math.sin(x * 0.0014 + 2.1) * 24;
      if (x === -600) ctx.moveTo(x, y);
      else ctx.lineTo(x, y);
    }
    ctx.stroke();

    const palmXs = [340, 820, 1290, 1770];

    for (const rootX of palmXs) {
      const groundY =
        baseY +
        Math.sin(rootX * 0.0026 + 0.8) * 20 +
        Math.sin(rootX * 0.0058 - 1.2) * 12 +
        Math.sin(rootX * 0.0014 + 2.1) * 24;

      const trunkH = 58 + Math.sin(rootX * 0.01) * 8;
      const lean = 12 + Math.sin(rootX * 0.007) * 6;

      ctx.lineCap = "round";
      ctx.lineWidth = 8;
      ctx.strokeStyle = "#65452b";
      ctx.beginPath();
      ctx.moveTo(rootX, groundY + 4);
      ctx.quadraticCurveTo(
        rootX + lean * 0.45,
        groundY - trunkH * 0.45,
        rootX + lean,
        groundY - trunkH
      );
      ctx.stroke();

      ctx.lineWidth = 3;
      ctx.strokeStyle = "#9b6e46";
      ctx.beginPath();
      ctx.moveTo(rootX + 1, groundY + 2);
      ctx.quadraticCurveTo(
        rootX + lean * 0.48,
        groundY - trunkH * 0.42,
        rootX + lean + 2,
        groundY - trunkH + 1
      );
      ctx.stroke();

      const topX = rootX + lean;
      const topY = groundY - trunkH;

      const fronds = [
        { dx: -34, dy: -8 },
        { dx: -28, dy: -18 },
        { dx: -12, dy: -25 },
        { dx: 12, dy: -23 },
        { dx: 28, dy: -12 },
        { dx: 24, dy: 4 },
      ];

      for (let i = 0; i < fronds.length; i++) {
        const frond = fronds[i];

        ctx.strokeStyle = i % 2 === 0 ? "#78c97c" : "#4fae63";
        ctx.lineWidth = 4;
        ctx.beginPath();
        ctx.moveTo(topX, topY);
        ctx.quadraticCurveTo(
          topX + frond.dx * 0.45,
          topY + frond.dy * 0.45,
          topX + frond.dx,
          topY + frond.dy
        );
        ctx.stroke();
      }
    }
  }

  // --- NIGHT -------------------------------------------------
  if (skin.decorTheme === "night") {
    const baseY = height * 0.66;

    const haze = ctx.createLinearGradient(0, height * 0.38, 0, height * 0.78);
    haze.addColorStop(0, "rgba(140,190,255,0)");
    haze.addColorStop(1, "rgba(170,220,255,0.10)");
    ctx.fillStyle = haze;
    ctx.fillRect(-600, height * 0.36, width + 1400, height * 0.42);

    // far mountain range
    const backMountains = new Path2D();
    backMountains.moveTo(-600, height);

    for (let x = -600; x <= width + 1000; x += 18) {
      const y =
        baseY -
        42 +
        Math.sin(x * 0.0019 + 0.5) * 18 +
        Math.sin(x * 0.0042 - 1.1) * 24;
      backMountains.lineTo(x, y);
    }

    backMountains.lineTo(width + 1000, height);
    backMountains.closePath();

    const backGrad = ctx.createLinearGradient(0, height * 0.42, 0, height);
    backGrad.addColorStop(0, "#203555");
    backGrad.addColorStop(1, "#13233b");
    ctx.fillStyle = backGrad;
    ctx.fill(backMountains);

    // front jagged peaks
    const frontPeakXs = [-420, -180, 80, 340, 620, 910, 1210, 1490, 1770];

    for (const peakX of frontPeakXs) {
      const peakTopY =
        baseY -
        150 -
        Math.sin(peakX * 0.003 + 0.6) * 24;

      const leftBaseY =
        baseY +
        Math.sin((peakX - 80) * 0.0026 + 0.7) * 10;

      const rightBaseY =
        baseY +
        Math.sin((peakX + 84) * 0.0022 - 0.5) * 10;

      ctx.fillStyle = "#1a2e49";
      ctx.beginPath();
      ctx.moveTo(peakX - 140, leftBaseY + 18);
      ctx.lineTo(peakX - 58, peakTopY + 52);
      ctx.lineTo(peakX, peakTopY);
      ctx.lineTo(peakX + 52, peakTopY + 60);
      ctx.lineTo(peakX + 144, rightBaseY + 18);
      ctx.lineTo(peakX + 144, height);
      ctx.lineTo(peakX - 140, height);
      ctx.closePath();
      ctx.fill();

      // snow cap attached to the mountain body
      ctx.fillStyle = "rgba(240,247,255,0.95)";
      ctx.beginPath();
      ctx.moveTo(peakX - 34, peakTopY + 34);
      ctx.lineTo(peakX - 12, peakTopY + 10);
      ctx.lineTo(peakX, peakTopY);
      ctx.lineTo(peakX + 12, peakTopY + 12);
      ctx.lineTo(peakX + 32, peakTopY + 36);
      ctx.lineTo(peakX + 10, peakTopY + 30);
      ctx.lineTo(peakX - 10, peakTopY + 26);
      ctx.closePath();
      ctx.fill();
    }

    // soft ridge highlight
    ctx.strokeStyle = "rgba(220,235,255,0.14)";
    ctx.lineWidth = 2;
    ctx.beginPath();
    for (let x = -600; x <= width + 1000; x += 18) {
      const y =
        baseY -
        42 +
        Math.sin(x * 0.0019 + 0.5) * 18 +
        Math.sin(x * 0.0042 - 1.1) * 24;
      if (x === -600) ctx.moveTo(x, y);
      else ctx.lineTo(x, y);
    }
    ctx.stroke();
  }

  // --- DESERT ------------------------------------------------
  if (skin.decorTheme === "desert") {
    const duneBaseY = height * 0.7;

    const haze = ctx.createLinearGradient(0, height * 0.32, 0, height * 0.78);
    haze.addColorStop(0, "rgba(255,220,170,0)");
    haze.addColorStop(1, "rgba(214,170,105,0.20)");
    ctx.fillStyle = haze;
    ctx.fillRect(-600, height * 0.28, width + 1400, height * 0.5);

    // far dunes
    const backDunes = new Path2D();
    backDunes.moveTo(-600, height);

    for (let x = -600; x <= width + 1000; x += 16) {
      const y =
        duneBaseY -
        34 +
        Math.sin(x * 0.0028 + 0.8) * 14 +
        Math.sin(x * 0.0055 - 1.1) * 9;
      backDunes.lineTo(x, y);
    }

    backDunes.lineTo(width + 1000, height);
    backDunes.closePath();

    const backGrad = ctx.createLinearGradient(0, height * 0.5, 0, height);
    backGrad.addColorStop(0, "#d8ae6e");
    backGrad.addColorStop(1, "#bc8d4b");
    ctx.fillStyle = backGrad;
    ctx.fill(backDunes);

    // pyramids sit BEHIND the closer dune
    const pyramidXs = [460, 1020, 1560];
    for (const px of pyramidXs) {
      const pyramidBaseY =
        duneBaseY -
        8 +
        Math.sin(px * 0.0017 + 0.3) * 6;

      ctx.fillStyle = "#b98a49";
      ctx.beginPath();
      ctx.moveTo(px, pyramidBaseY);
      ctx.lineTo(px + 60, pyramidBaseY - 100);
      ctx.lineTo(px + 120, pyramidBaseY);
      ctx.closePath();
      ctx.fill();

      ctx.fillStyle = "#d8b06c";
      ctx.beginPath();
      ctx.moveTo(px + 60, pyramidBaseY - 100);
      ctx.lineTo(px + 120, pyramidBaseY);
      ctx.lineTo(px + 78, pyramidBaseY);
      ctx.closePath();
      ctx.fill();

      ctx.strokeStyle = "rgba(95,60,24,0.32)";
      ctx.lineWidth = 2;
      ctx.stroke();
    }

    // close dune drawn AFTER pyramids so their bottoms get buried
    const frontDunes = new Path2D();
    frontDunes.moveTo(-600, height);

    for (let x = -600; x <= width + 1000; x += 14) {
      const y =
        duneBaseY +
        Math.sin(x * 0.0022 + 1.8) * 22 +
        Math.sin(x * 0.0052 - 0.6) * 10;
      frontDunes.lineTo(x, y);
    }

    frontDunes.lineTo(width + 1000, height);
    frontDunes.closePath();

    const frontGrad = ctx.createLinearGradient(0, height * 0.54, 0, height);
    frontGrad.addColorStop(0, "#c89652");
    frontGrad.addColorStop(1, "#9b6c33");
    ctx.fillStyle = frontGrad;
    ctx.fill(frontDunes);

    // front dune highlight
    ctx.strokeStyle = "rgba(255,232,190,0.18)";
    ctx.lineWidth = 2;
    ctx.beginPath();
    for (let x = -600; x <= width + 1000; x += 14) {
      const y =
        duneBaseY +
        Math.sin(x * 0.0022 + 1.8) * 22 +
        Math.sin(x * 0.0052 - 0.6) * 10;
      if (x === -600) ctx.moveTo(x, y);
      else ctx.lineTo(x, y);
    }
    ctx.stroke();

    // drifting dust
    ctx.save();
    ctx.globalAlpha = 0.12;
    for (let i = 0; i < 14; i++) {
      const dustX = ((time * (16 + i * 1.8) + i * 170) % (width + 500)) - 220;
      const dustY =
        height * 0.42 +
        (i % 5) * 24 +
        Math.sin(time * 0.7 + i) * 10;

      ctx.fillStyle = "#e7bf81";
      ctx.beginPath();
      ctx.ellipse(dustX, dustY, 34, 10, 0.08, 0, Math.PI * 2);
      ctx.fill();
    }
    ctx.restore();
  }

  // --- POOL --------------------------------------------------
  if (skin.decorTheme === "pool") {
    const deckY = height * 0.64;

    const haze = ctx.createLinearGradient(0, height * 0.44, 0, height * 0.78);
    haze.addColorStop(0, "rgba(230,255,255,0)");
    haze.addColorStop(1, "rgba(160,225,240,0.16)");
    ctx.fillStyle = haze;
    ctx.fillRect(-600, height * 0.4, width + 1400, height * 0.38);

    // long pool deck
    ctx.fillStyle = "#d8cab1";
    ctx.fillRect(-600, deckY, width + 1400, 58);

    ctx.strokeStyle = "#b49f81";
    ctx.lineWidth = 3;
    for (let x = -600; x <= width + 1000; x += 42) {
      ctx.beginPath();
      ctx.moveTo(x, deckY);
      ctx.lineTo(x, deckY + 58);
      ctx.stroke();
    }

    // lifeguard tower
    const towerX = 980;
    const towerY = deckY - 10;

    ctx.strokeStyle = "#ffffff";
    ctx.lineWidth = 5;
    ctx.lineCap = "round";
    ctx.beginPath();
    ctx.moveTo(towerX, towerY + 44);
    ctx.lineTo(towerX + 18, towerY - 30);
    ctx.moveTo(towerX + 58, towerY + 44);
    ctx.lineTo(towerX + 40, towerY - 30);
    ctx.moveTo(towerX + 18, towerY + 10);
    ctx.lineTo(towerX + 40, towerY + 10);
    ctx.stroke();

    ctx.fillStyle = "#ff6f61";
    ctx.beginPath();
    ctx.roundRect(towerX + 10, towerY - 42, 40, 16, 5);
    ctx.fill();
    ctx.strokeStyle = "#000";
    ctx.lineWidth = 3;
    ctx.stroke();

    ctx.fillStyle = "#eaf7ff";
    ctx.beginPath();
    ctx.roundRect(towerX + 12, towerY - 26, 36, 14, 4);
    ctx.fill();
    ctx.stroke();

    // umbrellas
    const umbrellaXs = [340, 640, 1380];
    for (const ux of umbrellaXs) {
      ctx.strokeStyle = "#7a6b54";
      ctx.lineWidth = 3;
      ctx.beginPath();
      ctx.moveTo(ux, deckY + 30);
      ctx.lineTo(ux, deckY - 32);
      ctx.stroke();

      ctx.fillStyle = ux % 2 === 0 ? "#ff8fb8" : "#ffd76a";
      ctx.beginPath();
      ctx.moveTo(ux - 28, deckY - 28);
      ctx.quadraticCurveTo(ux, deckY - 54, ux + 28, deckY - 28);
      ctx.closePath();
      ctx.fill();
      ctx.strokeStyle = "#000";
      ctx.lineWidth = 2;
      ctx.stroke();
    }
  }

  ctx.restore();
}
//-----------------------------------END-----------//

function drawMainHills(
  ctx: CanvasRenderingContext2D,
  width: number,
  height: number,
  time: number,
  skin: GooseMapSkin
) {
  const surfacePath = new Path2D();
  surfacePath.moveTo(0, height);

const waterLift = 3; //water level//

for (let x = 0; x <= width; x += 8) {
  surfacePath.lineTo(x, getSurfaceY(x, height, time) - waterLift);
}

  surfacePath.lineTo(width, height);
  surfacePath.closePath();

  const waterGradient = ctx.createLinearGradient(0, height * 0.7, 0, height);
  waterGradient.addColorStop(0, skin.waterStops[0]);
  waterGradient.addColorStop(0.18, skin.waterStops[1]);
  waterGradient.addColorStop(0.5, skin.waterStops[2]);
  waterGradient.addColorStop(1, skin.waterStops[3]);

  ctx.fillStyle = waterGradient;
  ctx.fill(surfacePath);

  // soft water bands under surface
  ctx.save();
  ctx.clip(surfacePath);
  ctx.globalAlpha = 0.16;
  ctx.strokeStyle = "#d8f7ff";
  ctx.lineWidth = 8;

  for (let i = 0; i < 4; i++) {
    ctx.beginPath();
    for (let x = 0; x <= width; x += 16) {
      const y =
        getSurfaceY(x, height, time) +
        14 +
        i * 16 +
        Math.sin(x * 0.012 + time * 1.2 + i * 0.9) * 3;
      if (x === 0) ctx.moveTo(x, y);
      else ctx.lineTo(x, y);
    }
    ctx.stroke();
  }

  ctx.restore();

}

function drawWaterSurfaceLine(
  ctx: CanvasRenderingContext2D,
  width: number,
  height: number,
  time: number,
  cameraX: number,
  skin: GooseMapSkin
) {
  const startX = Math.max(0, cameraX - 40);
  const endX = cameraX + width + 40;
  const waterLift = 3;

  ctx.save();
  ctx.strokeStyle = skin.surfaceLine;
  ctx.lineWidth = 4;
  ctx.beginPath();

  let started = false;

  for (let x = startX; x <= endX; x += 8) {
    const y = getSurfaceY(x, height, time) - waterLift - 1;

    if (!started) {
      ctx.moveTo(x, y);
      started = true;
    } else {
      ctx.lineTo(x, y);
    }
  }

  ctx.stroke();
  ctx.restore();
}
function drawHalftoneDots(
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  width: number,
  height: number,
  dotColor: string = "rgba(0,0,0,0.08)",
  spacing: number = 8,
  radius: number = 1.4
) {
  ctx.save();

  ctx.beginPath();
  ctx.roundRect(x, y, width, height, 12);
  ctx.clip();

  ctx.fillStyle = dotColor;

  for (let py = y + spacing * 0.5; py < y + height; py += spacing) {
    for (let px = x + spacing * 0.5; px < x + width; px += spacing) {
      ctx.beginPath();
      ctx.arc(px, py, radius, 0, Math.PI * 2);
      ctx.fill();
    }
  }

  ctx.restore();
}
function drawHillDecorations(
  ctx: CanvasRenderingContext2D,
  width: number,
  height: number,
  time: number,
  cameraX: number,
  skin: GooseMapSkin
) {
  const startX = Math.max(0, Math.floor((cameraX - 260) / 180) * 180);
  const endX = cameraX + width + 260;

  for (let patchX = startX; patchX <= endX; patchX += 180) {
    const patchSeed = Math.sin(patchX * 0.0047 + 0.8) * 0.5 + 0.5;
    const patchChance = Math.sin(patchX * 0.0023 - 1.1) * 0.5 + 0.5;

    if (patchChance < 0.52) continue;

    const patchWidth = 18 + patchSeed * 26;
    const stalkCount = 3 + Math.floor(patchSeed * 3);

    for (let i = 0; i < stalkCount; i++) {
      const localT = stalkCount <= 1 ? 0.5 : i / (stalkCount - 1);

      const stalkX =
        patchX +
        (localT - 0.5) * patchWidth +
        Math.sin((patchX + i * 23) * 0.21) * 1.4;

      const baseY =
        getGroundY(stalkX, height, time) +
        Math.sin(stalkX * 0.011 + i) * 1.2;

      const heightSeed =
        Math.sin(stalkX * 0.013 + i * 1.4) * 0.5 + 0.5;

      const stalkH = 18 + heightSeed * 12;
      const sway =
        Math.sin(time * 0.42 + stalkX * 0.014) *
        (0.05 + heightSeed * 0.035);

      const tipX = stalkX + sway * 10;
      const tipY = baseY - stalkH;

      ctx.save();
      ctx.lineCap = "round";

      // SUNNY reeds
      if (skin.decorTheme === "sunny") {
        ctx.strokeStyle = skin.grassDark;
        ctx.lineWidth = 2;
        ctx.beginPath();
        ctx.moveTo(stalkX, baseY);
        ctx.quadraticCurveTo(
          stalkX + sway * 2.8,
          baseY - stalkH * 0.45,
          tipX,
          tipY
        );
        ctx.stroke();

        if ((i + Math.floor(patchSeed * 10)) % 2 === 0) {
          const leafY = baseY - stalkH * 0.55;
          ctx.lineWidth = 1.2;
          ctx.beginPath();
          ctx.moveTo(stalkX, leafY);
          ctx.quadraticCurveTo(
            stalkX + 4.5,
            leafY - 3,
            stalkX + 7,
            leafY + 2
          );
          ctx.stroke();
        }

        if (patchSeed > 0.58 && (i === stalkCount - 1 || i === 1)) {
          ctx.fillStyle = "#d6c08b";
          ctx.beginPath();
          ctx.ellipse(tipX, tipY + 4, 2.4, 4.2, 0.08, 0, Math.PI * 2);
          ctx.fill();
        }
      }

      // NIGHT frost / crystals
      if (skin.decorTheme === "night") {
        const crystalH = 12 + heightSeed * 12;

        ctx.fillStyle = "#6fe9de";
        ctx.beginPath();
        ctx.moveTo(stalkX - 4, baseY);
        ctx.lineTo(stalkX - 1, baseY - crystalH * 0.65);
        ctx.lineTo(stalkX + 1, baseY - crystalH);
        ctx.lineTo(stalkX + 4, baseY);
        ctx.closePath();
        ctx.fill();

        ctx.strokeStyle = "#000";
        ctx.lineWidth = 1.5;
        ctx.stroke();

        ctx.save();
        ctx.globalAlpha = 0.18;
        ctx.fillStyle = "#8cfff3";
        ctx.beginPath();
        ctx.arc(stalkX, baseY - crystalH * 0.72, 5, 0, Math.PI * 2);
        ctx.fill();
        ctx.restore();
      }

      // DESERT dry grass / scrub
      if (skin.decorTheme === "desert") {
        ctx.strokeStyle = "#8a6a36";
        ctx.lineWidth = 2;
        ctx.beginPath();
        ctx.moveTo(stalkX, baseY);
        ctx.quadraticCurveTo(
          stalkX + sway * 2.2,
          baseY - stalkH * 0.4,
          stalkX + 4 + sway * 2.5,
          baseY - stalkH * 0.75
        );
        ctx.stroke();

        ctx.beginPath();
        ctx.moveTo(stalkX, baseY);
        ctx.quadraticCurveTo(
          stalkX - sway * 2.2,
          baseY - stalkH * 0.35,
          stalkX - 5 - sway * 2.1,
          baseY - stalkH * 0.62
        );
        ctx.stroke();

        if (i === 0) {
          ctx.fillStyle = "#9d7b44";
          ctx.beginPath();
          ctx.ellipse(stalkX + 8, baseY + 1, 4.5, 3, 0.2, 0, Math.PI * 2);
          ctx.fill();
        }
      }

      // POOL splash accents
      if (skin.decorTheme === "pool") {
        // occasional ladder
        if (i === 0 && patchSeed > 0.68) {
          ctx.strokeStyle = "#eaf4fb";
          ctx.lineWidth = 2.6;

          ctx.beginPath();
          ctx.moveTo(stalkX - 5, baseY + 2);
          ctx.quadraticCurveTo(stalkX - 6, baseY - 8, stalkX - 6, baseY - 18);
          ctx.moveTo(stalkX + 5, baseY + 2);
          ctx.quadraticCurveTo(stalkX + 6, baseY - 8, stalkX + 6, baseY - 18);
          ctx.stroke();

          ctx.beginPath();
          ctx.moveTo(stalkX - 6, baseY - 12);
          ctx.lineTo(stalkX + 6, baseY - 12);
          ctx.moveTo(stalkX - 6, baseY - 6);
          ctx.lineTo(stalkX + 6, baseY - 6);
          ctx.stroke();

          ctx.strokeStyle = "rgba(255,255,255,0.35)";
          ctx.lineWidth = 1.1;
          ctx.beginPath();
          ctx.moveTo(stalkX - 4.5, baseY - 17);
          ctx.lineTo(stalkX - 4.5, baseY + 1);
          ctx.moveTo(stalkX + 4.5, baseY - 17);
          ctx.lineTo(stalkX + 4.5, baseY + 1);
          ctx.stroke();
        } else {
          // simple splash
          const splashH = 7 + heightSeed * 6;

          ctx.strokeStyle = "rgba(255,255,255,0.95)";
          ctx.lineWidth = 2;

          ctx.beginPath();
          ctx.moveTo(stalkX - 6, baseY);
          ctx.quadraticCurveTo(
            stalkX - 3,
            baseY - splashH * 0.8,
            stalkX,
            baseY - splashH
          );
          ctx.quadraticCurveTo(
            stalkX + 3,
            baseY - splashH * 0.8,
            stalkX + 6,
            baseY
          );
          ctx.stroke();

          ctx.fillStyle = "rgba(255,255,255,0.88)";
          ctx.beginPath();
          ctx.arc(stalkX, baseY - splashH - 1, 1.5, 0, Math.PI * 2);
          ctx.fill();
        }

        // occasional beach ball
        if (i === stalkCount - 1 && patchSeed > 0.8) {
          ctx.fillStyle = "#ffd76a";
          ctx.beginPath();
          ctx.arc(stalkX + 11, baseY + 1, 4.8, 0, Math.PI * 2);
          ctx.fill();
          ctx.strokeStyle = "#000";
          ctx.lineWidth = 1.4;
          ctx.stroke();

          ctx.strokeStyle = "#ff8fb8";
          ctx.lineWidth = 1.4;
          ctx.beginPath();
          ctx.moveTo(stalkX + 11, baseY - 3.8);
          ctx.lineTo(stalkX + 11, baseY + 5.8);
          ctx.moveTo(stalkX + 7.2, baseY + 1);
          ctx.lineTo(stalkX + 14.8, baseY + 1);
          ctx.stroke();
        }
      }

      ctx.restore();
    }
  }
}

function drawLayeredGrassPatch(
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  time: number,
  scale: number,
  flower: boolean,
  skin: GooseMapSkin
) {
  const sway = Math.sin(time * 1.45 + x * 0.017) * 2.4;

  function drawBlade(
    baseX: number,
    baseY: number,
    lean: number,
    height: number,
    color: string,
    width: number
  ) {
    ctx.strokeStyle = color;
    ctx.lineWidth = width;
    ctx.lineCap = "round";

    ctx.beginPath();
    ctx.moveTo(baseX, baseY);
    ctx.quadraticCurveTo(
      baseX + lean * 0.45,
      baseY - height * 0.45,
      baseX + lean,
      baseY - height
    );
    ctx.stroke();
  }

  ctx.save();
  ctx.translate(x, y);

  const finalScale = scale * (skin.decorScale ?? 1);
  ctx.scale(finalScale, finalScale);

  if (skin.decorTheme === "sunny") {
    const h = 18;
    const gap = 7;

    drawBlade(-gap, 0, sway * 0.65 - 4.5, h * 0.95, skin.grassMid, 2.2);
    drawBlade(-3, 0, sway * 0.5 - 1.5, h * 1.08, skin.grassLight, 2.4);
    drawBlade(0, 0, sway, h * 1.28, skin.grassDark, 2.8);
    drawBlade(3, 0, sway * 0.56 + 1.5, h * 1.02, skin.grassBright, 2.4);
    drawBlade(gap, 0, sway * 0.6 + 4.5, h * 0.92, skin.grassMid, 2.2);

    if (flower) {
      drawBlade(8, 0, sway * 0.22 + 1.2, 14, skin.grassDark, 1.5);

      ctx.fillStyle = skin.flowerPetal;
      ctx.beginPath();
      ctx.arc(10, -14, 2.8, 0, Math.PI * 2);
      ctx.arc(13, -16, 2.5, 0, Math.PI * 2);
      ctx.arc(13, -12, 2.5, 0, Math.PI * 2);
      ctx.arc(16, -14, 2.8, 0, Math.PI * 2);
      ctx.fill();

      ctx.fillStyle = skin.flowerCenter;
      ctx.beginPath();
      ctx.arc(13, -14, 1.6, 0, Math.PI * 2);
      ctx.fill();
    }
  }

  if (skin.decorTheme === "night") {
    const pulse =
      0.55 +
      (Math.sin(time * 2.4 + x * 0.035) * 0.5 + 0.5) * 0.75;

    const glowAlphaA = 0.16 + pulse * 0.16;
    const glowAlphaB = 0.12 + pulse * 0.2;
    const haloLift = Math.sin(time * 1.8 + x * 0.02) * 0.8;

    // lily pad
    ctx.fillStyle = "rgba(70, 220, 170, 0.9)";
    ctx.beginPath();
    ctx.ellipse(0, 0, 14, 6.5, -0.08, 0, Math.PI * 2);
    ctx.fill();

    ctx.fillStyle = "rgba(30, 90, 70, 0.8)";
    ctx.beginPath();
    ctx.moveTo(2, 0);
    ctx.lineTo(11, -1.5);
    ctx.lineTo(4, 3);
    ctx.closePath();
    ctx.fill();

    // glowing stems
    drawBlade(-6, 1, sway * 0.5 - 1.5, 16, "#4fe3ba", 1.8);
    drawBlade(5, 1, sway * 0.55 + 1.2, 18, "#60f0d8", 2);

    // soft outer halos
    ctx.save();
    ctx.globalAlpha = glowAlphaA;
    ctx.fillStyle = "#7efff0";
    ctx.beginPath();
    ctx.arc(-8, -15 + haloLift, 7.5, 0, Math.PI * 2);
    ctx.arc(7, -17 - haloLift * 0.6, 8.5, 0, Math.PI * 2);
    ctx.fill();
    ctx.restore();

    // inner bloom
    ctx.save();
    ctx.globalAlpha = glowAlphaB;
    ctx.fillStyle = "#b388ff";
    ctx.beginPath();
    ctx.arc(-8, -15 + haloLift * 0.5, 4.8, 0, Math.PI * 2);
    ctx.arc(7, -17 - haloLift * 0.3, 5.2, 0, Math.PI * 2);
    ctx.fill();
    ctx.restore();

    // glow flowers
    ctx.fillStyle = "#b9a7ff";
    ctx.beginPath();
    ctx.arc(-8, -15, 2.8, 0, Math.PI * 2);
    ctx.arc(-5, -15, 2.2, 0, Math.PI * 2);
    ctx.arc(-11, -15, 2.2, 0, Math.PI * 2);
    ctx.fill();

    ctx.fillStyle = "#7efff0";
    ctx.beginPath();
    ctx.arc(7, -17, 3.2, 0, Math.PI * 2);
    ctx.arc(10, -17, 2.4, 0, Math.PI * 2);
    ctx.arc(4, -17, 2.4, 0, Math.PI * 2);
    ctx.fill();

    // tiny sparkle motes on special ones
    if (flower) {
      ctx.save();
      ctx.globalAlpha = 0.22 + pulse * 0.16;
      ctx.strokeStyle = "#8cf7ff";
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.arc(0, -7, 18, Math.PI * 0.15, Math.PI * 0.85);
      ctx.stroke();
      ctx.restore();

      ctx.save();
      ctx.fillStyle = `rgba(170, 255, 245, ${0.18 + pulse * 0.18})`;

      const moteA = Math.sin(time * 2 + x * 0.03) * 2.5;
      const moteB = Math.cos(time * 2.3 + x * 0.026) * 2.2;

      ctx.beginPath();
      ctx.arc(-14, -22 + moteA, 1.4, 0, Math.PI * 2);
      ctx.arc(0, -26 + moteB, 1.2, 0, Math.PI * 2);
      ctx.arc(14, -21 - moteA * 0.7, 1.5, 0, Math.PI * 2);
      ctx.fill();

      ctx.restore();
    }
  }

  if (skin.decorTheme === "desert") {
    // stones
    ctx.fillStyle = "#8d6b3b";
    ctx.beginPath();
    ctx.ellipse(-8, -1, 5, 3.5, 0.2, 0, Math.PI * 2);
    ctx.ellipse(7, 0, 6, 4, -0.15, 0, Math.PI * 2);
    ctx.fill();

    ctx.strokeStyle = "#6f5028";
    ctx.lineWidth = 1.5;
    ctx.stroke();

    // cactus
    ctx.fillStyle = "#4f8e53";
    ctx.strokeStyle = "#1d3d25";
    ctx.lineWidth = 2;

    ctx.beginPath();
    ctx.roundRect(-4, -24, 8, 24, 4);
    ctx.fill();
    ctx.stroke();

    ctx.beginPath();
    ctx.roundRect(-12, -18, 6, 12, 4);
    ctx.fill();
    ctx.stroke();

    ctx.beginPath();
    ctx.roundRect(6, -16, 6, 11, 4);
    ctx.fill();
    ctx.stroke();

    if (flower) {
      ctx.fillStyle = "#ff9db2";
      ctx.beginPath();
      ctx.arc(0, -26, 2.6, 0, Math.PI * 2);
      ctx.arc(-3, -24, 2, 0, Math.PI * 2);
      ctx.arc(3, -24, 2, 0, Math.PI * 2);
      ctx.fill();
    }
  }

  if (skin.decorTheme === "pool") {
    // floatie ring
    ctx.fillStyle = "#ff8fb8";
    ctx.beginPath();
    ctx.ellipse(0, 0, 15, 9, -0.1, 0, Math.PI * 2);
    ctx.fill();

    ctx.lineWidth = 2.5;
    ctx.strokeStyle = "#000";
    ctx.stroke();

    ctx.fillStyle = "#dff9ff";
    ctx.beginPath();
    ctx.ellipse(0, 0, 7, 3.8, -0.1, 0, Math.PI * 2);
    ctx.fill();
    ctx.stroke();

    // little pool toy accent
    ctx.fillStyle = "#ffe16b";
    ctx.beginPath();
    ctx.arc(-10, -7, 3.2, 0, Math.PI * 2);
    ctx.fill();
    ctx.stroke();

    // occasional rounded pool stair / rail piece
    if (flower) {
      // small deck lip / pool edge
      ctx.fillStyle = "#f3ede3";
      ctx.beginPath();
      ctx.roundRect(8, -22, 22, 6, 3);
      ctx.fill();
      ctx.strokeStyle = "#000";
      ctx.lineWidth = 2;
      ctx.stroke();

      // water-facing rounded rails
      ctx.strokeStyle = "#e6eef5";
      ctx.lineWidth = 2.8;
      ctx.lineCap = "round";

      ctx.beginPath();
      ctx.moveTo(14, -18);
      ctx.quadraticCurveTo(13, -10, 13, 0);
      ctx.moveTo(24, -18);
      ctx.quadraticCurveTo(25, -10, 25, 0);
      ctx.stroke();

      // submerged steps
      ctx.strokeStyle = "rgba(230,240,248,0.95)";
      ctx.lineWidth = 2.4;

      ctx.beginPath();
      ctx.moveTo(13, -10);
      ctx.lineTo(25, -10);
      ctx.moveTo(13, -4);
      ctx.lineTo(25, -4);
      ctx.moveTo(13, 2);
      ctx.lineTo(25, 2);
      ctx.stroke();

      // subtle shine
      ctx.strokeStyle = "rgba(255,255,255,0.45)";
      ctx.lineWidth = 1.2;
      ctx.beginPath();
      ctx.moveTo(15, -17);
      ctx.quadraticCurveTo(14.5, -10, 14.5, -1);
      ctx.moveTo(23, -17);
      ctx.quadraticCurveTo(23.5, -10, 23.5, -1);
      ctx.stroke();
    }
  }

  ctx.restore();
}

function drawWorldGrassBehind(
  ctx: CanvasRenderingContext2D,
  width: number,
  height: number,
  time: number,
  cameraX: number,
  skin: GooseMapSkin
) {
  const startX = Math.max(0, Math.floor((cameraX - 120) / 28) * 28);
  const endX = cameraX + width + 140;

  const density = skin.decorDensity ?? 1;
  const backStep = Math.max(28, Math.round(28 / density));
  const backPattern = Math.max(backStep, Math.round(84 / density));
  const flowerPattern = Math.max(backPattern * 2, Math.round(252 / density));

  ctx.save();
  ctx.globalAlpha = 0.9;

  for (let x = startX; x <= endX; x += 28) {
    if (x % backPattern !== 0) continue;

    const y = getGroundY(x, height, time) + 3;
    const flower = x % flowerPattern === 0;
    drawLayeredGrassPatch(ctx, x, y, time, 0.88, flower, skin);
  }

  ctx.restore();
}

function drawForegroundWaterFoam(
  ctx: CanvasRenderingContext2D,
  width: number,
  height: number,
  time: number,
  cameraX: number,
  skin: GooseMapSkin
) {
  const startX = Math.max(0, Math.floor((cameraX - 140) / 10) * 10);
  const endX = cameraX + width + 160;
  const waterLift = 3;

  ctx.save();
  ctx.lineCap = "round";

  for (let x = startX; x <= endX; x += 10) {

    const y = getSurfaceY(x, height, time) - waterLift;
    const wave = Math.sin(time * 2.2 + x * 0.045);
    const foamLen = 9 + ((x / 10) % 3);
    const foamRise = 3 + wave * 1.8;

    ctx.strokeStyle = skin.foamStroke;
    ctx.lineWidth = 2.6;
    ctx.beginPath();
    ctx.moveTo(x - foamLen * 0.5, y - 1);
    ctx.quadraticCurveTo(x, y - foamRise, x + foamLen * 0.5, y - 1);
    ctx.stroke();

    if (x % 40 === 0) {
        ctx.fillStyle = skin.foamBubble;
      ctx.beginPath();
      ctx.arc(x - 2, y - 2 - wave * 0.8, 1.8, 0, Math.PI * 2);
      ctx.arc(x + 2, y - 3 - wave * 0.4, 1.4, 0, Math.PI * 2);
      ctx.fill();
    }
  }

  ctx.restore();
}
function drawWaterWhitecaps(
  ctx: CanvasRenderingContext2D,
  width: number,
  height: number,
  time: number,
  cameraX: number,
  skin: GooseMapSkin
) {
  const startX = Math.max(0, Math.floor((cameraX - 160) / 22) * 22);
  const endX = cameraX + width + 180;
  const waterLift = 3;

  ctx.save();
  ctx.lineCap = "round";

  for (let x = startX; x <= endX; x += 22) {
 

    const surfaceY = getSurfaceY(x, height, time) - waterLift;
    const waveA = Math.sin(x * 0.018 + time * 1.8);
    const waveB = Math.sin(x * 0.042 - time * 2.3);
    const crest = waveA * 2.3 + waveB * 1.2;

    const capWidth = 8 + ((x / 22) % 3) * 2;
    const capRise = 2.5 + Math.max(0, crest) * 1.4;

       ctx.strokeStyle = skin.whitecapStroke;
    ctx.lineWidth = 1.8;
    ctx.beginPath();
    ctx.moveTo(x - capWidth * 0.5, surfaceY - 1);
    ctx.quadraticCurveTo(x, surfaceY - capRise, x + capWidth * 0.5, surfaceY - 1);
    ctx.stroke();

    if (crest > 1.2 && x % 44 === 0) {
      ctx.fillStyle = skin.whitecapBubble;
      ctx.beginPath();
      ctx.arc(x - 1, surfaceY - 3, 1.5, 0, Math.PI * 2);
      ctx.arc(x + 2, surfaceY - 4, 1.2, 0, Math.PI * 2);
      ctx.fill();
    }
  }

  ctx.restore();
}
function drawGooseWakeTrail(
  ctx: CanvasRenderingContext2D,
  gooseX: number,
  gooseY: number,
  height: number,
  time: number,
  launched: boolean,
  skin: GooseMapSkin,
  tubeLevel: number = 1
) {
  if (!launched) return;

  const tubeScale = 1 + Math.min(tubeLevel - 1, 5) * 0.05;
  const waterLift = 3;
  const surfaceY = getGroundY(gooseX, height, time) - waterLift;

  const contactTop = surfaceY - 34;
  const contactBottom = surfaceY + 16;

  const isAirborne = gooseY < contactTop;
  const isTooDeep = gooseY > contactBottom;

  if (isAirborne || isTooDeep) return;

  // 0 = just touched water, 1 = settled into a skim
  const settle =
    1 -
    Math.max(
      0,
      Math.min(1, (gooseY - (surfaceY - 18)) / 26)
    );

  const wakeGrowth = Math.max(0.18, Math.min(1, settle));
  const segmentCount = Math.max(4, Math.floor(15 * wakeGrowth));
  const baseWidth = 40 * wakeGrowth;
  const rearSpacing = 12 + 10 * wakeGrowth;

  ctx.save();
  ctx.translate(gooseX, gooseY);

  for (let i = 0; i < segmentCount; i++) {
    const t = segmentCount <= 1 ? 0 : i / (segmentCount - 1);

    const backX = -18 - i * rearSpacing;
    const spread = 14 + i * (4 + wakeGrowth * 4.2);
    const centerY =
      28 +
      i * 0.7 +
      Math.sin(time * 6 + i * 0.8) * (1.1 + t * 0.8);

    const armRise = 4 + i * 0.7 * wakeGrowth;
    const armAlpha = (0.68 * (1 - t)) * (0.45 + wakeGrowth * 0.55);
   const armWidth = Math.max(1.8, 4.8 - i * 0.2);

     ctx.strokeStyle = `rgba(${skin.wakeStroke},${armAlpha})`;
    ctx.lineWidth = armWidth;
    ctx.lineCap = "round";

    // left wake arm
    ctx.beginPath();
    ctx.moveTo(backX, centerY);
    ctx.quadraticCurveTo(
      backX - spread * 0.35,
      centerY - armRise,
      backX - spread,
      centerY - 0.5
    );
    ctx.stroke();

    // right wake arm
    ctx.beginPath();
    ctx.moveTo(backX, centerY);
    ctx.quadraticCurveTo(
      backX + spread * 0.35,
      centerY - armRise,
      backX + spread,
      centerY - 0.5
    );
    ctx.stroke();

    // soft center churn connecting the V
    const churnWidth = Math.max(6, (baseWidth - i * 1.9) * tubeScale * 0.42);
       ctx.strokeStyle = `rgba(${skin.wakeChurn},${armAlpha * 0.55})`;
    ctx.lineWidth = Math.max(1.1, armWidth * 0.72);
    ctx.beginPath();
    ctx.moveTo(backX - churnWidth * 0.5, centerY + 0.5);
    ctx.quadraticCurveTo(backX, centerY - armRise * 0.35, backX + churnWidth * 0.5, centerY + 0.5);
    ctx.stroke();

    // foam flecks peeling off the wake arms
    if (i < segmentCount - 1) {
      const fleckAlpha = armAlpha * 0.6;
      const fleckLift = Math.abs(Math.sin(time * 7.5 + i * 0.9)) * (2.5 + t * 1.5);

        ctx.fillStyle = `rgba(${skin.wakeFleck},${fleckAlpha})`;

      ctx.beginPath();
      ctx.arc(
        backX - spread * 0.78 + Math.sin(time * 8 + i) * 1.5,
        centerY - 2 - fleckLift,
        1.2 + (1 - t) * 0.7,
        0,
        Math.PI * 2
      );
      ctx.fill();

      ctx.beginPath();
      ctx.arc(
        backX + spread * 0.72 + Math.cos(time * 7.2 + i) * 1.4,
        centerY - 1.5 - fleckLift * 0.85,
        1 + (1 - t) * 0.6,
        0,
        Math.PI * 2
      );
      ctx.fill();
    }
  }

  // extra trailing spray drifting behind the goose
  const sprayCount = Math.max(3, Math.floor(10 * wakeGrowth));
  for (let i = 0; i < sprayCount; i++) {
    const t = sprayCount <= 1 ? 0 : i / (sprayCount - 1);
    const px = -10 - i * (9 + wakeGrowth * 8);
    const py =
      18 -
      Math.abs(Math.sin(time * 8.5 + i * 0.7)) * (5 + wakeGrowth * 5) +
      Math.sin(time * 5.5 + i) * 1.3;

    ctx.fillStyle = `rgba(${skin.wakeSpray},${0.3 * (1 - t) * wakeGrowth})`;
    ctx.beginPath();
    ctx.arc(px, py, 1 + (1 - t) * 0.85, 0, Math.PI * 2);
    ctx.fill();
  }

  ctx.restore();
}
function drawSplashBursts(
  ctx: CanvasRenderingContext2D,
  bursts: SplashBurst[],
  time: number,
  skin: GooseMapSkin
) {
  if (!bursts.length) return;

  ctx.save();
  ctx.lineCap = "round";

  for (const burst of bursts) {
    const age = time - burst.bornAt;
    const duration = burst.kind === "impact" ? 0.75 : 0.42;

    if (age < 0 || age > duration) continue;

    const t = age / duration;
    const fade = 1 - t;
    const count = burst.kind === "impact" ? 12 : 6;
    const baseSpread = burst.kind === "impact" ? 34 : 18;
    const heightBoost = burst.kind === "impact" ? 28 : 12;

    for (let i = 0; i < count; i++) {
      const p = count <= 1 ? 0.5 : i / (count - 1);
      const angle = Math.PI * (0.18 + p * 0.64);
      const dist = (10 + p * baseSpread) * (0.35 + t * 0.9);
      const lift = Math.sin(angle) * heightBoost * (1 - t * 0.35);
      const side = Math.cos(angle) * dist;

      const px = burst.x + side;
      const py = burst.y - lift + t * t * (burst.kind === "impact" ? 20 : 10);

      const dropletR =
        (burst.kind === "impact" ? 2.8 : 1.8) *
        (0.65 + burst.strength * 0.45) *
        fade;

      ctx.fillStyle =
        burst.kind === "impact"
          ? `rgba(${skin.wakeSpray},${0.55 * fade})`
          : `rgba(${skin.wakeFleck},${0.36 * fade})`;

      ctx.beginPath();
      ctx.arc(px, py, Math.max(0.6, dropletR), 0, Math.PI * 2);
      ctx.fill();
    }

    // expanding surface ring
    const ringR =
      (burst.kind === "impact" ? 16 : 9) +
      t * (burst.kind === "impact" ? 42 : 20);

    ctx.strokeStyle =
      burst.kind === "impact"
        ? `rgba(${skin.wakeStroke},${0.42 * fade})`
        : `rgba(${skin.wakeChurn},${0.24 * fade})`;

    ctx.lineWidth = burst.kind === "impact" ? 3 : 2;
    ctx.beginPath();
    ctx.ellipse(burst.x, burst.y + 1, ringR, ringR * 0.28, 0, 0, Math.PI * 2);
    ctx.stroke();

    // center churn
    ctx.strokeStyle = `rgba(${skin.wakeChurn},${0.32 * fade})`;
    ctx.lineWidth = burst.kind === "impact" ? 2.6 : 1.8;
    ctx.beginPath();
    ctx.moveTo(burst.x - 10 - t * 8, burst.y);
    ctx.quadraticCurveTo(
      burst.x,
      burst.y - (burst.kind === "impact" ? 7 : 4) * fade,
      burst.x + 10 + t * 8,
      burst.y
    );
    ctx.stroke();
  }

  ctx.restore();
}

function drawCannonLaunchFlash(
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  angle: number,
  age: number | null
) {
  if (age == null || age < 0 || age > 0.22) return;

  const t = age / 0.22;
  const fade = 1 - t;

  ctx.save();
  ctx.translate(x, y);
  ctx.rotate(angle);

  const flashX = 76;

  // smoke puff
  ctx.fillStyle = `rgba(255,255,255,${0.26 * fade})`;
  for (let i = 0; i < 4; i++) {
    const puffX = flashX + 8 + i * 10 + t * 18;
    const puffY = -8 + i * 5 - t * 4;
    const puffR = 8 + i * 2 + t * 6;

    ctx.beginPath();
    ctx.arc(puffX, puffY, puffR, 0, Math.PI * 2);
    ctx.fill();
  }

  // flash star
  ctx.fillStyle = `rgba(255,210,120,${0.85 * fade})`;
  ctx.beginPath();
  ctx.moveTo(flashX + 4, 0);
  ctx.lineTo(flashX + 24 + t * 14, -8);
  ctx.lineTo(flashX + 14, 0);
  ctx.lineTo(flashX + 24 + t * 14, 8);
  ctx.closePath();
  ctx.fill();

  ctx.fillStyle = `rgba(255,245,210,${0.95 * fade})`;
  ctx.beginPath();
  ctx.arc(flashX + 6, 0, 7 + t * 4, 0, Math.PI * 2);
  ctx.fill();

  ctx.restore();
}

function drawWorldGrassFront(
  ctx: CanvasRenderingContext2D,
  width: number,
  height: number,
  time: number,
  cameraX: number,
  skin: GooseMapSkin
) {
  const startX = Math.max(0, Math.floor((cameraX - 140) / 18) * 18);
  const endX = cameraX + width + 160;

  const density = skin.decorDensity ?? 1;
  const frontPatternA = Math.max(54, Math.round(54 / density));
  const frontPatternB = Math.max(72, Math.round(72 / density));
  const flowerPattern = Math.max(frontPatternB * 2, Math.round(216 / density));

  ctx.save();

  for (let x = startX; x <= endX; x += 18) {
    if (x % frontPatternA !== 0 && x % frontPatternB !== 0) continue;

    const y = getGroundY(x, height, time) + 29;
    const flower = x % flowerPattern === 0;
    const scale = x % frontPatternB === 0 ? 1.2 : 0.95;

    drawLayeredGrassPatch(ctx, x, y, time, scale, flower, skin);
  }

  ctx.restore();
}
//---------------------------------------------END---//
function drawWoodenRampsBack(
  ctx: CanvasRenderingContext2D,
  height: number,
  time: number,
  cameraX: number,
  width: number,
  skin: GooseMapSkin
) {
  const leftBound = cameraX - 120;
  const rightBound = cameraX + width + 120;

  for (const ramp of WOODEN_RAMPS) {
    if (ramp.x + ramp.width < leftBound || ramp.x > rightBound) continue;

    ctx.save();

    const leftX = ramp.x;
    const rightX = ramp.x + ramp.width;

    const deckLeftY =
      getSurfaceY(leftX, height, time) - getRampLift(leftX) - 4;
    const deckRightY =
      getSurfaceY(rightX, height, time) - getRampLift(rightX) - 4;

    const baseLeftY = getSurfaceY(leftX, height, time) - 2;

    if (skin.decorTheme === "sunny") {
      const floatPoints = [0.12, 0.42, 0.76];

      ctx.strokeStyle = "#7a5230";
      ctx.lineWidth = 4;
      ctx.lineCap = "round";
      ctx.beginPath();
      ctx.moveTo(leftX + 8, deckLeftY + 2);
      ctx.lineTo(leftX + 8, baseLeftY + 16);
      ctx.moveTo(leftX + 22, deckLeftY + 4);
      ctx.lineTo(leftX + 22, baseLeftY + 18);
      ctx.stroke();

      for (const p of floatPoints) {
        const fx = leftX + ramp.width * p;
        const fy = getSurfaceY(fx, height, time) + 8;

        ctx.fillStyle = "#ff955f";
        ctx.beginPath();
        ctx.ellipse(fx, fy, 17, 8.5, -0.08, 0, Math.PI * 2);
        ctx.fill();

        ctx.lineWidth = 3;
        ctx.strokeStyle = "#000";
        ctx.stroke();

        ctx.fillStyle = "#e7fbff";
        ctx.beginPath();
        ctx.ellipse(fx, fy, 8.5, 4, -0.08, 0, Math.PI * 2);
        ctx.fill();
        ctx.stroke();
      }

      for (const p of floatPoints) {
        const fx = leftX + ramp.width * p;
        const t = p;
        const deckY = deckLeftY + (deckRightY - deckLeftY) * t;
        const floatY = getSurfaceY(fx, height, time) + 3;

        ctx.strokeStyle = "#7a5230";
        ctx.lineWidth = 3;
        ctx.beginPath();
        ctx.moveTo(fx, deckY + 2);
        ctx.lineTo(fx, floatY);
        ctx.stroke();
      }
    }

    if (skin.decorTheme === "night") {
      const crystalXs = [leftX + 10, leftX + 24];
      for (const cx of crystalXs) {
        const crystalBaseY = getSurfaceY(cx, height, time) + 10;
        const crystalTopY = deckLeftY + 8 + Math.sin(cx * 0.02 + time) * 1.2;

        ctx.fillStyle = "#2a2254";
        ctx.beginPath();
        ctx.moveTo(cx - 6, crystalBaseY);
        ctx.lineTo(cx - 2, crystalTopY);
        ctx.lineTo(cx + 2, crystalTopY - 6);
        ctx.lineTo(cx + 7, crystalBaseY);
        ctx.closePath();
        ctx.fill();

        ctx.strokeStyle = "#000";
        ctx.lineWidth = 2;
        ctx.stroke();

        ctx.save();
        ctx.globalAlpha = 0.22;
        ctx.fillStyle = "#7efff0";
        ctx.beginPath();
        ctx.arc(cx, crystalTopY - 2, 7, 0, Math.PI * 2);
        ctx.fill();
        ctx.restore();
      }
    }

    if (skin.decorTheme === "desert") {
      ctx.fillStyle = "#9a6a34";
      ctx.beginPath();
      ctx.moveTo(leftX - 4, baseLeftY + 20);
      ctx.lineTo(leftX - 4, deckLeftY + 6);
      ctx.lineTo(leftX + 24, deckLeftY + 10);
      ctx.lineTo(leftX + 30, baseLeftY + 20);
      ctx.closePath();
      ctx.fill();

      ctx.strokeStyle = "#000";
      ctx.lineWidth = 3;
      ctx.stroke();
    }

    if (skin.decorTheme === "pool") {
      const boardThickness = 7;

      ctx.fillStyle = "#c9d9e6";
      ctx.beginPath();
      ctx.roundRect(leftX - 4, deckLeftY + 2, 28, 24, 6);
      ctx.fill();

      ctx.strokeStyle = "#000";
      ctx.lineWidth = 3;
      ctx.stroke();

      const standXs = [leftX + 6, leftX + 18];
      for (const sx of standXs) {
        const standBaseY = getSurfaceY(sx, height, time) + 10;

        ctx.strokeStyle = "#dfe8ef";
        ctx.lineWidth = 5;
        ctx.lineCap = "round";
        ctx.beginPath();
        ctx.moveTo(sx, standBaseY);
        ctx.lineTo(sx, deckLeftY + boardThickness + 10);
        ctx.stroke();
      }
    }

    ctx.restore();
  }
}

//---------ramps----------//
function drawWoodenRampsFront(
  ctx: CanvasRenderingContext2D,
  height: number,
  time: number,
  cameraX: number,
  width: number,
  skin: GooseMapSkin
) {
  const leftBound = cameraX - 120;
  const rightBound = cameraX + width + 120;

  for (const ramp of WOODEN_RAMPS) {
    if (ramp.x + ramp.width < leftBound || ramp.x > rightBound) continue;

    ctx.save();

    const leftX = ramp.x;
    const rightX = ramp.x + ramp.width;

    const deckLeftY =
      getSurfaceY(leftX, height, time) - getRampLift(leftX) - 4;
    const deckRightY =
      getSurfaceY(rightX, height, time) - getRampLift(rightX) - 4;

    const baseLeftY = getSurfaceY(leftX, height, time) - 2;
    const baseRightY = getSurfaceY(rightX, height, time) - 2;

    const thickness = 10;

    if (skin.decorTheme === "sunny") {
      const floatPoints = [0.12, 0.42, 0.76];

      // rear anchor posts
      ctx.strokeStyle = "#7a5230";
      ctx.lineWidth = 4;
      ctx.lineCap = "round";
      ctx.beginPath();
      ctx.moveTo(leftX + 8, deckLeftY + 2);
      ctx.lineTo(leftX + 8, baseLeftY + 16);
      ctx.moveTo(leftX + 22, deckLeftY + 4);
      ctx.lineTo(leftX + 22, baseLeftY + 18);
      ctx.stroke();

      // pontoons
      for (const p of floatPoints) {
        const fx = leftX + ramp.width * p;
        const fy = getSurfaceY(fx, height, time) + 8;

        ctx.fillStyle = "#ff955f";
        ctx.beginPath();
        ctx.ellipse(fx, fy, 17, 8.5, -0.08, 0, Math.PI * 2);
        ctx.fill();

        ctx.lineWidth = 3;
        ctx.strokeStyle = "#000";
        ctx.stroke();

        ctx.fillStyle = "#e7fbff";
        ctx.beginPath();
        ctx.ellipse(fx, fy, 8.5, 4, -0.08, 0, Math.PI * 2);
        ctx.fill();
        ctx.stroke();
      }

      // support posts to pontoons
      for (const p of floatPoints) {
        const fx = leftX + ramp.width * p;
        const t = p;
        const deckY = deckLeftY + (deckRightY - deckLeftY) * t;
        const floatY = getSurfaceY(fx, height, time) + 3;

        ctx.strokeStyle = "#7a5230";
        ctx.lineWidth = 3;
        ctx.beginPath();
        ctx.moveTo(fx, deckY + 2);
        ctx.lineTo(fx, floatY);
        ctx.stroke();
      }

      // underside
      ctx.fillStyle = "#724726";
      ctx.beginPath();
      ctx.moveTo(leftX, deckLeftY + thickness);
      ctx.lineTo(rightX, deckRightY + thickness);
      ctx.lineTo(rightX, deckRightY);
      ctx.lineTo(leftX, deckLeftY);
      ctx.closePath();
      ctx.fill();

      // top deck
      const deckGrad = ctx.createLinearGradient(leftX, deckLeftY, rightX, deckRightY);
      deckGrad.addColorStop(0, "#d39a61");
      deckGrad.addColorStop(1, "#b67a45");
      ctx.fillStyle = deckGrad;

      ctx.beginPath();
      ctx.moveTo(leftX, deckLeftY);
      ctx.lineTo(rightX, deckRightY);
      ctx.lineTo(rightX, deckRightY + thickness);
      ctx.lineTo(leftX, deckLeftY + thickness);
      ctx.closePath();
      ctx.fill();

      ctx.lineWidth = 3;
      ctx.strokeStyle = "#000";
      ctx.stroke();

      ctx.strokeStyle = "#8a5c35";
      ctx.lineWidth = 2;
      for (let i = 1; i < 6; i++) {
        const t = i / 6;
        const px = leftX + ramp.width * t;
        const pyTop = deckLeftY + (deckRightY - deckLeftY) * t;
        const pyBottom = pyTop + thickness;

        ctx.beginPath();
        ctx.moveTo(px, pyTop);
        ctx.lineTo(px, pyBottom);
        ctx.stroke();
      }

      ctx.strokeStyle = "rgba(255,255,255,0.24)";
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.moveTo(leftX + 4, deckLeftY + 2);
      ctx.lineTo(rightX - 4, deckRightY + 2);
      ctx.stroke();
    }

    if (skin.decorTheme === "night") {
      // rear crystal supports
      const crystalXs = [leftX + 10, leftX + 24];
      for (const cx of crystalXs) {
        const crystalBaseY = getSurfaceY(cx, height, time) + 10;
        const crystalTopY = deckLeftY + 8 + Math.sin(cx * 0.02 + time) * 1.2;

        ctx.fillStyle = "#2a2254";
        ctx.beginPath();
        ctx.moveTo(cx - 6, crystalBaseY);
        ctx.lineTo(cx - 2, crystalTopY);
        ctx.lineTo(cx + 2, crystalTopY - 6);
        ctx.lineTo(cx + 7, crystalBaseY);
        ctx.closePath();
        ctx.fill();
        ctx.strokeStyle = "#000";
        ctx.lineWidth = 2;
        ctx.stroke();

        ctx.save();
        ctx.globalAlpha = 0.22;
        ctx.fillStyle = "#7efff0";
        ctx.beginPath();
        ctx.arc(cx, crystalTopY - 2, 7, 0, Math.PI * 2);
        ctx.fill();
        ctx.restore();
      }

      // ramp underside
      ctx.fillStyle = "rgba(38, 30, 74, 0.9)";
      ctx.beginPath();
      ctx.moveTo(leftX, deckLeftY + thickness);
      ctx.lineTo(rightX, deckRightY + thickness);
      ctx.lineTo(rightX, deckRightY);
      ctx.lineTo(leftX, deckLeftY);
      ctx.closePath();
      ctx.fill();

      // deck
      const deckGrad = ctx.createLinearGradient(leftX, deckLeftY, rightX, deckRightY);
      deckGrad.addColorStop(0, "#3f2a74");
      deckGrad.addColorStop(0.5, "#5c3fb2");
      deckGrad.addColorStop(1, "#2ec5c0");
      ctx.fillStyle = deckGrad;

      ctx.beginPath();
      ctx.moveTo(leftX, deckLeftY);
      ctx.lineTo(rightX, deckRightY);
      ctx.lineTo(rightX, deckRightY + thickness);
      ctx.lineTo(leftX, deckLeftY + thickness);
      ctx.closePath();
      ctx.fill();

      ctx.lineWidth = 3;
      ctx.strokeStyle = "#000";
      ctx.stroke();

      ctx.strokeStyle = "rgba(170,255,245,0.65)";
      ctx.lineWidth = 2.4;
      ctx.beginPath();
      ctx.moveTo(leftX + 4, deckLeftY + 2);
      ctx.lineTo(rightX - 4, deckRightY + 2);
      ctx.stroke();

      for (let i = 1; i < 5; i++) {
        const t = i / 5;
        const px = leftX + ramp.width * t;
        const pyTop = deckLeftY + (deckRightY - deckLeftY) * t;
        const pyBottom = pyTop + thickness;

        ctx.strokeStyle = "rgba(130,255,230,0.28)";
        ctx.lineWidth = 2;
        ctx.beginPath();
        ctx.moveTo(px, pyTop);
        ctx.lineTo(px, pyBottom);
        ctx.stroke();
      }
    }

    if (skin.decorTheme === "desert") {
      // chunky rear sandstone base
      ctx.fillStyle = "#9a6a34";
      ctx.beginPath();
      ctx.moveTo(leftX - 4, baseLeftY + 20);
      ctx.lineTo(leftX - 4, deckLeftY + 6);
      ctx.lineTo(leftX + 24, deckLeftY + 10);
      ctx.lineTo(leftX + 30, baseLeftY + 20);
      ctx.closePath();
      ctx.fill();
      ctx.strokeStyle = "#000";
      ctx.lineWidth = 3;
      ctx.stroke();

      // main wedge underside
      ctx.fillStyle = "#8a6131";
      ctx.beginPath();
      ctx.moveTo(leftX, deckLeftY + thickness + 2);
      ctx.lineTo(rightX, deckRightY + thickness + 2);
      ctx.lineTo(rightX, deckRightY);
      ctx.lineTo(leftX, deckLeftY);
      ctx.closePath();
      ctx.fill();

      // deck
      const duneGrad = ctx.createLinearGradient(leftX, deckLeftY, rightX, deckRightY);
      duneGrad.addColorStop(0, "#d4a15c");
      duneGrad.addColorStop(0.45, "#c58f48");
      duneGrad.addColorStop(1, "#b37d39");
      ctx.fillStyle = duneGrad;

      ctx.beginPath();
      ctx.moveTo(leftX, deckLeftY);
      ctx.lineTo(rightX, deckRightY);
      ctx.lineTo(rightX, deckRightY + thickness);
      ctx.lineTo(leftX, deckLeftY + thickness);
      ctx.closePath();
      ctx.fill();

      ctx.lineWidth = 3;
      ctx.strokeStyle = "#000";
      ctx.stroke();

      ctx.strokeStyle = "rgba(255,240,205,0.3)";
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.moveTo(leftX + 4, deckLeftY + 2);
      ctx.lineTo(rightX - 4, deckRightY + 2);
      ctx.stroke();

      const rockTs = [0.14, 0.42, 0.7, 0.9];
      for (const t of rockTs) {
        const rx = leftX + ramp.width * t;
        const ry = deckLeftY + (deckRightY - deckLeftY) * t - 2;

        ctx.fillStyle = "#7b562d";
        ctx.beginPath();
        ctx.ellipse(rx, ry, 5, 3.4, 0.15, 0, Math.PI * 2);
        ctx.fill();
        ctx.stroke();
      }
    }

    if (skin.decorTheme === "pool") {
      const boardThickness = 7;

      // rear platform block
      ctx.fillStyle = "#c9d9e6";
      ctx.beginPath();
      ctx.roundRect(leftX - 4, deckLeftY + 2, 28, 24, 6);
      ctx.fill();
      ctx.strokeStyle = "#000";
      ctx.lineWidth = 3;
      ctx.stroke();

      // two support legs
      const standXs = [leftX + 6, leftX + 18];
      for (const sx of standXs) {
        const standBaseY = getSurfaceY(sx, height, time) + 10;

        ctx.strokeStyle = "#dfe8ef";
        ctx.lineWidth = 5;
        ctx.lineCap = "round";
        ctx.beginPath();
        ctx.moveTo(sx, standBaseY);
        ctx.lineTo(sx, deckLeftY + boardThickness + 10);
        ctx.stroke();
      }

      // underside
      ctx.fillStyle = "#94a8b7";
      ctx.beginPath();
      ctx.moveTo(leftX, deckLeftY + boardThickness);
      ctx.lineTo(rightX, deckRightY + boardThickness);
      ctx.lineTo(rightX, deckRightY);
      ctx.lineTo(leftX, deckLeftY);
      ctx.closePath();
      ctx.fill();

      // board top
      const boardGrad = ctx.createLinearGradient(leftX, deckLeftY, rightX, deckRightY);
      boardGrad.addColorStop(0, "#f7fbff");
      boardGrad.addColorStop(0.5, "#e7f1f8");
      boardGrad.addColorStop(1, "#d5e5f2");
      ctx.fillStyle = boardGrad;

      ctx.beginPath();
      ctx.moveTo(leftX, deckLeftY);
      ctx.lineTo(rightX, deckRightY);
      ctx.lineTo(rightX, deckRightY + boardThickness);
      ctx.lineTo(leftX, deckLeftY + boardThickness);
      ctx.closePath();
      ctx.fill();

      ctx.lineWidth = 3;
      ctx.strokeStyle = "#000";
      ctx.stroke();

      // blue anti-slip lines
      ctx.strokeStyle = "#69b9e8";
      ctx.lineWidth = 2;
      for (let i = 1; i < 6; i++) {
        const t = i / 6;
        const px = leftX + ramp.width * t;
        const pyTop = deckLeftY + (deckRightY - deckLeftY) * t + 1;
        const pyBottom = pyTop + boardThickness - 2;

        ctx.beginPath();
        ctx.moveTo(px, pyTop);
        ctx.lineTo(px, pyBottom);
        ctx.stroke();
      }

      // rounded board tip
      ctx.fillStyle = "#f7fbff";
      ctx.beginPath();
      ctx.arc(
        rightX,
        deckRightY + boardThickness * 0.5,
        boardThickness * 0.5,
        -Math.PI / 2,
        Math.PI / 2
      );
      ctx.fill();
      ctx.stroke();
    }

    ctx.restore();
  }
}
//---------------------------end----//

//-----cannon---------//
function drawCannon(
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  angle: number,
  time: number,
  level: number = 1
) {
  const bounce = Math.sin(time * 2.2) * 2;
  const tier = Math.floor((level - 1) / 5) + 1;
  const levelInTier = ((level - 1) % 5) + 1;

  ctx.save();
  ctx.translate(x, y + bounce);

  // base wheel/body
  ctx.fillStyle = tier >= 3 ? "#4b5563" : "#6b7280";
  ctx.beginPath();
  ctx.arc(0, 0, 28 + Math.min(levelInTier - 1, 2), 0, Math.PI * 2);
  ctx.fill();

  ctx.lineWidth = 4;
  ctx.strokeStyle = "#000";
  ctx.stroke();

  // lower carriage
  ctx.fillStyle = tier >= 2 ? "#5b3a29" : "#374151";
  ctx.beginPath();
  ctx.roundRect(-20, 10, 40, 16, 6);
  ctx.fill();
  ctx.stroke();

  ctx.save();
  ctx.rotate(angle);

  const barrelLen = 86 + (tier - 1) * 10 + (levelInTier - 1) * 2;
  const barrelH = 40 + (tier >= 2 ? 4 : 0);

  // main barrel
  const barrelGrad = ctx.createLinearGradient(0, -barrelH / 2, 0, barrelH / 2);
  barrelGrad.addColorStop(0, tier >= 3 ? "#7c8797" : "#5a6473");
  barrelGrad.addColorStop(1, tier >= 3 ? "#495463" : "#414b58");
  ctx.fillStyle = barrelGrad;
  ctx.beginPath();
  ctx.roundRect(-12, -barrelH / 2, barrelLen, barrelH, 12);
  ctx.fill();

  ctx.lineWidth = 4;
  ctx.strokeStyle = "#000";
  ctx.stroke();

  // muzzle
  ctx.fillStyle = tier >= 2 ? "#d4a63c" : "#9ca3af";
  ctx.beginPath();
  ctx.roundRect(barrelLen - 18, -18, 20, 36, 6);
  ctx.fill();
  ctx.stroke();

  // tier 2 banding
  if (tier >= 2) {
    ctx.fillStyle = "#d4a63c";
    ctx.beginPath();
    ctx.roundRect(8, -barrelH / 2 - 1, 10, barrelH + 2, 4);
    ctx.fill();
    ctx.stroke();

    ctx.beginPath();
    ctx.roundRect(32, -barrelH / 2 - 1, 10, barrelH + 2, 4);
    ctx.fill();
    ctx.stroke();
  }

  // tier 3 extra reinforcement
  if (tier >= 3) {
    ctx.fillStyle = "#a855f7";
    ctx.beginPath();
    ctx.roundRect(52, -barrelH / 2 - 2, 12, barrelH + 4, 5);
    ctx.fill();
    ctx.stroke();

    ctx.fillStyle = "#cbd5e1";
    ctx.beginPath();
    ctx.roundRect(-4, -6, 16, 12, 4);
    ctx.fill();
    ctx.stroke();
  }

  // per-level top bolts
  for (let i = 0; i < levelInTier; i++) {
    const bx = 8 + i * 12;
    if (bx > barrelLen - 26) break;

    ctx.fillStyle = "#d9e1ea";
    ctx.beginPath();
    ctx.arc(bx, -barrelH / 2 + 6, 2.5, 0, Math.PI * 2);
    ctx.fill();
    ctx.stroke();
  }

  // highlight
  ctx.strokeStyle = "rgba(255,255,255,0.22)";
  ctx.lineWidth = 2;
  ctx.beginPath();
  ctx.moveTo(-2, -barrelH / 2 + 5);
  ctx.lineTo(barrelLen - 10, -barrelH / 2 + 5);
  ctx.stroke();

  ctx.restore();
  ctx.restore();
}

function drawCannonFrontLip(
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  angle: number,
  level: number = 1,
  time: number = 0
) {
  const bounce = Math.sin(time * 2.2) * 2;
  const tier = Math.floor((level - 1) / 5) + 1;

  ctx.save();
  ctx.translate(x, y + bounce);
  ctx.rotate(angle);

  const lipX = 64;
  const outerW = tier >= 2 ? 14 : 12;
  const outerH = tier >= 2 ? 24 : 22;

  ctx.fillStyle = tier >= 2 ? "#d4a63c" : "#9ca3af";
  ctx.beginPath();
  ctx.ellipse(lipX, 0, outerW, outerH, 0, 0, Math.PI * 2);
  ctx.fill();

  ctx.lineWidth = 4;
  ctx.strokeStyle = "#000";
  ctx.stroke();

  ctx.fillStyle = "#2d3748";
  ctx.beginPath();
  ctx.ellipse(lipX, 0, outerW - 5, outerH - 7, 0, 0, Math.PI * 2);
  ctx.fill();
  ctx.stroke();

  ctx.restore();
}
function drawTubeOnly(
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  time: number,
  launched: boolean,
  skin: GooseMapSkin,
  tubeLevel: number = 1,
  velocityX: number = 0,
  velocityY: number = 0
) {
  const bob = launched ? 0 : Math.sin(time * 4.5) * 4;
  const tier = Math.floor((tubeLevel - 1) / 5) + 1;
  const levelInTier = ((tubeLevel - 1) % 5) + 1;
  const tubeScale = 1 + Math.min(tubeLevel - 1, 8) * 0.035;

  const ringColor =
    tier >= 3 ? "#c084fc" : tier >= 2 ? "#7cc6ff" : "#ff8b5b";
  const innerColor =
    tier >= 3 ? "#f3ddff" : tier >= 2 ? "#dff4ff" : "#2c9fdd";

  const speed = Math.min(1, Math.abs(velocityX) / 900);
  const fall = Math.min(1, Math.abs(velocityY) / 850);
  const tilt = launched ? Math.max(-0.2, Math.min(0.2, velocityX * 0.00018)) : 0;
  const squashX = launched ? 1 + fall * 0.08 : 1;
  const squashY = launched ? 1 - fall * 0.06 : 1;

  ctx.save();
  ctx.translate(x, y + bob);
  ctx.rotate(tilt);
  ctx.scale(squashX, squashY);

  // shadow
  ctx.fillStyle = "rgba(20, 90, 140, 0.08)";
  ctx.beginPath();
  ctx.ellipse(0, 30, 42 * tubeScale, 10 + speed * 2, 0, 0, Math.PI * 2);
  ctx.fill();

  // outer tube
  ctx.fillStyle = ringColor;
  ctx.beginPath();
  ctx.ellipse(0, 18, 42 * tubeScale, 28 * tubeScale, -0.1, 0, Math.PI * 2);
  ctx.fill();

  ctx.lineWidth = 3;
  ctx.strokeStyle = "#000";
  ctx.stroke();

  // inner hole
  ctx.fillStyle = innerColor;
  ctx.beginPath();
  ctx.ellipse(0, 18, 22 * tubeScale, 12 * tubeScale, -0.1, 0, Math.PI * 2);
  ctx.fill();
  ctx.stroke();

  if (levelInTier >= 2) {
    ctx.strokeStyle = "rgba(255,255,255,0.55)";
    ctx.lineWidth = 3;
    ctx.beginPath();
    ctx.arc(0, 18, 26 * tubeScale, 0.2, 2.35);
    ctx.stroke();
  }

  if (levelInTier >= 3) {
    ctx.strokeStyle = "rgba(255,255,255,0.4)";
    ctx.lineWidth = 2.5;
    ctx.beginPath();
    ctx.arc(0, 18, 31 * tubeScale, 3.5, 5.5);
    ctx.stroke();
  }

  if (levelInTier >= 4) {
    ctx.fillStyle = ringColor;
    ctx.beginPath();
    ctx.ellipse(-34 * tubeScale, 18, 6, 10, -0.3, 0, Math.PI * 2);
    ctx.ellipse(34 * tubeScale, 18, 6, 10, 0.3, 0, Math.PI * 2);
    ctx.fill();
    ctx.stroke();
  }

  if (levelInTier >= 5) {
    ctx.fillStyle = "#ffd34d";
    ctx.beginPath();
    ctx.arc(0, 1, 6, 0, Math.PI * 2);
    ctx.fill();
    ctx.stroke();

    ctx.fillStyle = "#8a5b00";
    ctx.font = "900 8px sans-serif";
    ctx.textAlign = "center";
    ctx.textBaseline = "middle";
    ctx.fillText("★", 0, 1);
  }

  if (tier >= 2) {
    ctx.fillStyle = "rgba(255,255,255,0.32)";
    ctx.beginPath();
    ctx.ellipse(-10, 8, 8, 3, -0.2, 0, Math.PI * 2);
    ctx.fill();

    ctx.beginPath();
    ctx.ellipse(10, 6, 5, 2, -0.15, 0, Math.PI * 2);
    ctx.fill();
  }

  if (tier >= 3) {
    for (let i = 0; i < 3; i++) {
      const px = -22 + i * 22;
      const py = 42 + Math.sin(time * 3 + i) * 2;
      ctx.fillStyle = skin.whitecapBubble;
      ctx.beginPath();
      ctx.arc(px, py, 2.2, 0, Math.PI * 2);
      ctx.fill();
    }
  }

  ctx.restore();
}
function drawGooseOnly(
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  time: number,
  launched: boolean,
  velocityX: number = 0,
  velocityY: number = 0
) {
  const bob = launched ? 0 : Math.sin(time * 4.5) * 4;
  const neckWobble = launched
    ? Math.sin(time * 7) * 0.09
    : Math.sin(time * 3.2) * 0.06;
  const wingFlap = launched ? Math.sin(time * 18) * 0.55 : 0.08;
  const beakOpen = launched ? (Math.sin(time * 16) * 0.5 + 0.5) * 7 : 0;

  const speed = Math.min(1, Math.abs(velocityX) / 900);
  const fall = Math.min(1, Math.abs(velocityY) / 900);

  const tilt = launched
    ? Math.max(-0.28, Math.min(0.28, velocityX * 0.00022 + velocityY * 0.00008))
    : 0;

  const stretchX = launched ? 1 + fall * 0.14 : 1;
  const stretchY = launched ? 1 - fall * 0.1 : 1;

  ctx.save();
  ctx.translate(x, y + bob);
  ctx.rotate(tilt);
  ctx.scale(stretchX, stretchY);

  // goose body
  ctx.fillStyle = "#f5f3ea";
  ctx.beginPath();
  ctx.ellipse(0, 8, 22, 18, -0.2, 0, Math.PI * 2);
  ctx.fill();

  ctx.save();
  ctx.translate(10, -8);
  ctx.rotate(-0.2 + neckWobble + Math.max(-0.12, Math.min(0.12, velocityY * 0.00012)));

  ctx.fillStyle = "#f5f3ea";
  ctx.fillRect(-5, -42, 10, 44);

  ctx.beginPath();
  ctx.ellipse(0, -48, 16, 14, 0.12, 0, Math.PI * 2);
  ctx.fill();

  ctx.fillStyle = "#f59e0b";

  ctx.beginPath();
  ctx.moveTo(12, -49);
  ctx.lineTo(26, -46 - beakOpen * 0.18);
  ctx.lineTo(13, -44);
  ctx.closePath();
  ctx.fill();

  ctx.beginPath();
  ctx.moveTo(12, -44);
  ctx.lineTo(25, -41 + beakOpen * 0.4);
  ctx.lineTo(13, -40);
  ctx.closePath();
  ctx.fill();

  ctx.fillStyle = "#111827";
  ctx.beginPath();
  ctx.arc(5, -51, 2.3, 0, Math.PI * 2);
  ctx.fill();

  ctx.restore();

  ctx.strokeStyle = "#f4d03f";
  ctx.lineWidth = 4;
  ctx.beginPath();
  ctx.arc(9, -4, 10, Math.PI * 0.15, Math.PI * 1.2);
  ctx.stroke();

  ctx.save();
  ctx.translate(-10, 7);
  ctx.rotate(-0.55 + wingFlap - speed * 0.1);
  ctx.fillStyle = "#ece9df";
  ctx.beginPath();
  ctx.ellipse(0, 0, 12, 7, -0.4, 0, Math.PI * 2);
  ctx.fill();
  ctx.restore();

  ctx.save();
  ctx.translate(6, 10);
  ctx.rotate(0.35 - wingFlap * 0.45 + speed * 0.08);
  ctx.fillStyle = "#efebe2";
  ctx.beginPath();
  ctx.ellipse(0, 0, 10, 5, 0.3, 0, Math.PI * 2);
  ctx.fill();
  ctx.restore();

  ctx.restore();
}
export function drawGooseInTube(
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  time: number,
  launched: boolean,
  tubeLevel: number = 1
) {
  drawTubeOnly(ctx, x, y, time, launched, GOOSE_MAP_SKINS.sunny, tubeLevel);
  drawGooseOnly(ctx, x, y, time, launched);
}
function drawAimArrow(
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  angle: number
) {
  const length = 120;

  const startX = x + Math.cos(angle) * 64;
  const startY = y + Math.sin(angle) * 64;
  const endX = x + Math.cos(angle) * (64 + length);
  const endY = y + Math.sin(angle) * (64 + length);

  ctx.save();

  ctx.strokeStyle = "#111";
  ctx.fillStyle = "#ff7a2f";
  ctx.lineWidth = 6;
  ctx.lineCap = "round";

  ctx.setLineDash([12, 10]);
  ctx.beginPath();
  ctx.moveTo(startX, startY);
  ctx.lineTo(endX, endY);
  ctx.stroke();
  ctx.setLineDash([]);

  const headSize = 18;
  const leftX = endX - Math.cos(angle) * headSize - Math.sin(angle) * 10;
  const leftY = endY - Math.sin(angle) * headSize + Math.cos(angle) * 10;
  const rightX = endX - Math.cos(angle) * headSize + Math.sin(angle) * 10;
  const rightY = endY - Math.sin(angle) * headSize - Math.cos(angle) * 10;

  ctx.beginPath();
  ctx.moveTo(endX, endY);
  ctx.lineTo(leftX, leftY);
  ctx.lineTo(rightX, rightY);
  ctx.closePath();
  ctx.fill();
  ctx.stroke();

  ctx.restore();
}

function drawRoundedCard(
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  width: number,
  height: number,
  fill: string,
  headerFill?: string,
  headerHeight: number = 0
) {
  ctx.save();

  // deeper outer shadow
  ctx.fillStyle = "rgba(51, 65, 85, 0.20)";
  ctx.beginPath();
  ctx.roundRect(x + 6, y + 8, width, height, 22);
  ctx.fill();

  // body
  ctx.fillStyle = fill;
  ctx.beginPath();
  ctx.roundRect(x, y, width, height, 25);
  ctx.fill();

  // subtle bottom shade for depth
  const bodyShade = ctx.createLinearGradient(0, y, 0, y + height);
  bodyShade.addColorStop(0, "rgba(255,255,255,0)");
  bodyShade.addColorStop(0.72, "rgba(0,0,0,0)");
  bodyShade.addColorStop(1, "rgba(51,65,85,0.10)");
  ctx.fillStyle = bodyShade;
  ctx.beginPath();
  ctx.roundRect(x, y, width, height, 22);
  ctx.fill();

  // top gloss
  ctx.save();
  ctx.globalAlpha = 0.16;
  ctx.fillStyle = "#ffffff";
  ctx.beginPath();
  ctx.roundRect(x + 10, y + 8, width - 20, Math.min(22, height * 0.22), 12);
  ctx.fill();
  ctx.restore();

if (headerFill && headerHeight > 0) {
  const headerX = x + 10;
  const headerY = y + 12;
  const headerW = width - 20;
  const headerH = headerHeight;

  ctx.fillStyle = headerFill;
  ctx.beginPath();
  ctx.roundRect(headerX, headerY, headerW, headerH, 14);
  ctx.fill();

  drawHalftoneDots(
    ctx,
    headerX,
    headerY,
    headerW,
    headerH,
    "rgba(0,0,0,0.06)",
    8,
    1.2
  );

  // header inner gloss
  ctx.save();
  ctx.globalAlpha = 0.18;
  ctx.fillStyle = "#ffffff";
  ctx.beginPath();
  ctx.roundRect(
    headerX + 4,
    headerY + 3,
    headerW - 8,
    Math.max(8, headerH * 0.38),
    10
  );
  ctx.fill();
  ctx.restore();

  ctx.lineWidth = 2.5;
  ctx.strokeStyle = "#334155";
  ctx.beginPath();
  ctx.roundRect(headerX, headerY, headerW, headerH, 14);
  ctx.stroke();
}

  // outer border
  ctx.lineWidth = 3;
  ctx.strokeStyle = "#334155";
  ctx.beginPath();
  ctx.roundRect(x, y, width, height, 22);
  ctx.stroke();

  ctx.restore();
}

function drawCardTitle(
  ctx: CanvasRenderingContext2D,
  text: string,
  x: number,
  y: number,
  size: number = 18,
  color: string = "#243247"
) {
  ctx.save();
  ctx.fillStyle = color;
  ctx.font = `900 ${size}px Arial, sans-serif`;
  ctx.textBaseline = "middle";
  ctx.textAlign = "left";
  ctx.fillText(text, x, y);
  ctx.restore();
}

function drawSmallLabel(
  ctx: CanvasRenderingContext2D,
  text: string,
  x: number,
  y: number,
  color: string = "#5f6b7a",
  size: number = 10
) {
  ctx.save();
  ctx.fillStyle = color;
  ctx.font = `900 ${size}px Arial, sans-serif`;
  ctx.textBaseline = "middle";
  ctx.textAlign = "left";
  ctx.fillText(text.toUpperCase(), x, y);
  ctx.restore();
}

function drawStatText(
  ctx: CanvasRenderingContext2D,
  text: string,
  x: number,
  y: number,
  size: number = 14,
  color: string = "#334155"
) {
  ctx.save();
  ctx.fillStyle = color;
  ctx.font = `900 ${size}px Arial, sans-serif`;
  ctx.textBaseline = "middle";
  ctx.textAlign = "left";
  ctx.fillText(text, x, y);
  ctx.restore();
}

function drawTicks(
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  width: number,
  filled: number
) {
  const gap = 5;
  const tickWidth = (width - gap * 4) / 5;

  for (let i = 0; i < 5; i++) {
    const tx = x + i * (tickWidth + gap);

    const grad = ctx.createLinearGradient(0, y, 0, y + 8);
    if (i < filled) {
      grad.addColorStop(0, "#ffb36b");
      grad.addColorStop(1, "#ff7a2f");
    } else {
      grad.addColorStop(0, "#ebe7db");
      grad.addColorStop(1, "#d8d2c5");
    }

    ctx.fillStyle = grad;
    ctx.beginPath();
    ctx.roundRect(tx, y, tickWidth, 8, 5);
    ctx.fill();

    ctx.lineWidth = 1.5;
    ctx.strokeStyle = "#334155";
    ctx.stroke();
  }
}

function drawCoinIcon(
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  r: number
) {
  ctx.save();
  const grad = ctx.createRadialGradient(x - 3, y - 3, 2, x, y, r);
  grad.addColorStop(0, "#ffe07a");
  grad.addColorStop(1, "#f6b81f");

  ctx.fillStyle = grad;
  ctx.beginPath();
  ctx.arc(x, y, r, 0, Math.PI * 2);
  ctx.fill();

  ctx.lineWidth = 2;
  ctx.strokeStyle = "#334155";
  ctx.stroke();

  ctx.fillStyle = "#8a5b00";
  ctx.font = `900 ${Math.round(r)}px sans-serif`;
  ctx.textAlign = "center";
  ctx.textBaseline = "middle";
  ctx.fillText("$", x, y + 1);
  ctx.restore();
}

function drawTubeIcon(
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  scale: number
) {
  ctx.save();
  ctx.translate(x, y);

  const grad = ctx.createLinearGradient(0, -18, 0, 18);
  grad.addColorStop(0, "#ffae86");
  grad.addColorStop(1, "#ff7f5e");
  ctx.fillStyle = grad;

  ctx.beginPath();
  ctx.ellipse(0, 0, 24 * scale, 17 * scale, -0.1, 0, Math.PI * 2);
  ctx.fill();
  ctx.lineWidth = 2;
  ctx.strokeStyle = "#334155";
  ctx.stroke();

  ctx.fillStyle = "#e7f7ff";
  ctx.beginPath();
  ctx.ellipse(0, 0, 12 * scale, 7 * scale, -0.1, 0, Math.PI * 2);
  ctx.fill();
  ctx.stroke();

  ctx.restore();
}

function drawMiniCannonIcon(
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  scale: number
) {
  ctx.save();
  ctx.translate(x, y);

  ctx.fillStyle = "#64748b";
  ctx.beginPath();
  ctx.arc(-10 * scale, 10 * scale, 12 * scale, 0, Math.PI * 2);
  ctx.fill();
  ctx.lineWidth = 2;
  ctx.strokeStyle = "#334155";
  ctx.stroke();

  const grad = ctx.createLinearGradient(0, -6 * scale, 0, 14 * scale);
  grad.addColorStop(0, "#7b8797");
  grad.addColorStop(1, "#4b5563");
  ctx.fillStyle = grad;

  ctx.beginPath();
  ctx.roundRect(-8 * scale, -6 * scale, 42 * scale, 18 * scale, 8 * scale);
  ctx.fill();
  ctx.stroke();

  ctx.fillStyle = "#cbd5e1";
  ctx.beginPath();
  ctx.roundRect(24 * scale, -4 * scale, 10 * scale, 14 * scale, 5 * scale);
  ctx.fill();
  ctx.stroke();

  ctx.restore();
}
function drawUpgradeCard(args: {
  ctx: CanvasRenderingContext2D;
  x: number;
  y: number;
  width: number;
  height: number;
  title: string;
  subtitle: string;
  level: number;
  accent: string;
  statText: string;
  icon: "cannon" | "tube" | "coin";
  cost: number;
  canAfford: boolean;
  pulse?: number;
}) {
  const {
    ctx,
    x,
    y,
    width,
    height,
    title,
    subtitle,
    level,
    accent,
    statText,
    icon,
    cost,
    canAfford,
    pulse = 0,
  } = args;

  const glow = canAfford ? 0.08 + (Math.sin(pulse) * 0.5 + 0.5) * 0.06 : 0;
  const headerH = 34;

  ctx.save();

  if (canAfford) {
    ctx.fillStyle = `rgba(255,170,90,${glow})`;
    ctx.beginPath();
    ctx.roundRect(x - 4, y - 4, width + 8, height + 8, 24);
    ctx.fill();
  }

  drawRoundedCard(ctx, x, y, width, height, "#fff7ea", accent, headerH);

  // header title centered in band
  drawCardTitle(ctx, title, x + 14, y + 27, 16);

  if (icon === "cannon") {
    drawMiniCannonIcon(ctx, x + width - 38, y + 28, 0.68);
  } else if (icon === "tube") {
    drawTubeIcon(ctx, x + width - 36, y + 28, 0.68);
  } else {
    drawCoinIcon(ctx, x + width - 36, y + 28, 10);
  }

  // pushed lower so it clears header better
  drawSmallLabel(ctx, subtitle, x + 14, y + 55, "#7b8794", 10);

  const tier = Math.floor((level - 1) / 5) + 1;
  const ticksFilled = ((level - 1) % 5) + 1;

  drawStatText(ctx, `Tier ${tier} · Lv ${level}`, x + 14, y + 73, 12, "#8b97a6");
  drawTicks(ctx, x + 14, y + 86, width - 28, ticksFilled);
  drawStatText(ctx, statText, x + 14, y + 104, 12, "#556274");

  const badgeW = width - 28;
  const badgeH = 28;
  const badgeX = x + 14;
  const badgeY = y + height - 32;

  ctx.fillStyle = "rgba(51,65,85,0.18)";
  ctx.beginPath();
  ctx.roundRect(badgeX + 3, badgeY + 4, badgeW, badgeH, 11);
  ctx.fill();

  const grad = ctx.createLinearGradient(0, badgeY, 0, badgeY + badgeH);
  if (canAfford) {
    grad.addColorStop(0, "#ffbf69");
    grad.addColorStop(1, "#ff8c42");
  } else {
    grad.addColorStop(0, "#ebe5d8");
    grad.addColorStop(1, "#d9d1c1");
  }

  ctx.fillStyle = grad;
  ctx.beginPath();
  ctx.roundRect(badgeX, badgeY, badgeW, badgeH, 11);
  ctx.fill();

  ctx.lineWidth = 2.5;
  ctx.strokeStyle = "#334155";
  ctx.stroke();

  ctx.fillStyle = canAfford ? "#ffffff" : "#6b7280";
  ctx.font = "900 12px Arial, sans-serif";
  ctx.textAlign = "center";
  ctx.textBaseline = "middle";
  ctx.fillText(
    canAfford ? `BUY · $${cost}` : `NEED $${cost}`,
    badgeX + badgeW / 2,
    badgeY + badgeH / 2 + 1
  );

  ctx.restore();
}

function drawTopMoneyCard(
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  width: number,
  coins: number,
  displayCoins: number
) {
  const diff = Math.abs(displayCoins - coins);
  const bounce = diff > 0.5 ? Math.min(4, diff * 0.06) : 0;

  drawRoundedCard(ctx, x, y - bounce, width, 84, "#fff7ea", "#ffe7a8", 24);
  drawSmallLabel(ctx, "Player Money", x + 14, y + 24 - bounce, "#6f7785", 10);
  drawCoinIcon(ctx, x + 28, y + 52 - bounce, 13);
  drawCardTitle(ctx, `${Math.floor(displayCoins)}`, x + 48, y + 52 - bounce, 24);
}
function drawTopSkyBitsCard(
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  width: number,
  skyBits: number
) {
  drawRoundedCard(ctx, x, y, width, 72, "#f9f5ff", "#ddd2ff", 24);
  drawSmallLabel(ctx, "Sky Bits", x + 14, y + 24, "#6c5fa3", 10);

  ctx.fillStyle = "#ffd34d";
  ctx.font = "900 18px Arial, sans-serif";
  ctx.textAlign = "left";
  ctx.textBaseline = "middle";
  ctx.fillText("✨", x + 14, y + 46);

  drawCardTitle(ctx, `${skyBits}`, x + 38, y + 46, 22);
}
function drawRunMapGooseMarker(
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number
) {
  ctx.save();

  // little shadow
  ctx.fillStyle = "rgba(51,65,85,0.18)";
  ctx.beginPath();
  ctx.ellipse(x, y + 8, 10, 4, 0, 0, Math.PI * 2);
  ctx.fill();

  // tube
  ctx.fillStyle = "#ff8c42";
  ctx.strokeStyle = "#334155";
  ctx.lineWidth = 2;
  ctx.beginPath();
  ctx.ellipse(x - 2, y + 2, 10, 7, 0, 0, Math.PI * 2);
  ctx.fill();
  ctx.stroke();

  // goose body
  ctx.fillStyle = "#ffffff";
  ctx.beginPath();
  ctx.ellipse(x - 2, y - 1, 7, 6, 0, 0, Math.PI * 2);
  ctx.fill();
  ctx.stroke();

  // neck
  ctx.beginPath();
  ctx.lineWidth = 3;
  ctx.strokeStyle = "#ffffff";
  ctx.moveTo(x + 1, y - 1);
  ctx.quadraticCurveTo(x + 5, y - 10, x + 4, y - 15);
  ctx.stroke();

  ctx.beginPath();
  ctx.lineWidth = 1.8;
  ctx.strokeStyle = "#334155";
  ctx.moveTo(x + 1, y - 1);
  ctx.quadraticCurveTo(x + 5, y - 10, x + 4, y - 15);
  ctx.stroke();

  // head
  ctx.fillStyle = "#ffffff";
  ctx.beginPath();
  ctx.arc(x + 4, y - 17, 4.5, 0, Math.PI * 2);
  ctx.fill();
  ctx.strokeStyle = "#334155";
  ctx.lineWidth = 1.6;
  ctx.stroke();

  // beak
  ctx.fillStyle = "#ff9f43";
  ctx.beginPath();
  ctx.moveTo(x + 8, y - 17);
  ctx.lineTo(x + 13, y - 15.5);
  ctx.lineTo(x + 8, y - 14);
  ctx.closePath();
  ctx.fill();

  // eye
  ctx.fillStyle = "#334155";
  ctx.beginPath();
  ctx.arc(x + 5, y - 18, 1, 0, Math.PI * 2);
  ctx.fill();

  ctx.restore();
}
function drawStoreCard(
  ctx: CanvasRenderingContext2D,
  width: number
) {
  const card = getStoreCardBounds(width);

  drawRoundedCard(ctx, card.x, card.y, card.width, card.height, "#fffaf0", "#ffd9e8", 28);

drawCardTitle(ctx, "Rocket Shop", card.x + 18, card.y + 30, 18);

  const itemX = card.x + 12;
  const itemY = card.y + 58;
  const itemW = card.width - 24;
  const itemH = 36;

  ctx.fillStyle = "rgba(15,23,42,0.10)";
  ctx.beginPath();
  ctx.roundRect(itemX + 4, itemY + 4, itemW, itemH, 10);
  ctx.fill();

  const grad = ctx.createLinearGradient(0, itemY, 0, itemY + itemH);
  grad.addColorStop(0, "#f1ede4");
  grad.addColorStop(1, "#ddd7ca");
  ctx.fillStyle = grad;
  ctx.beginPath();
  ctx.roundRect(itemX, itemY, itemW, itemH, 10);
  ctx.fill();

  ctx.lineWidth = 2;
  ctx.strokeStyle = "#334155";
  ctx.stroke();

  drawStatText(ctx, "🚀 Rockets", itemX + 10, itemY + 14, 12, "#475569");
  drawSmallLabel(ctx, "Coming Soon", itemX + 10, itemY + 27, "#7b8794", 9);

  ctx.textAlign = "right";
  ctx.textBaseline = "middle";
  ctx.fillStyle = "#8b97a6";
  ctx.font = "900 11px Arial, sans-serif";
  ctx.fillText("15 ✨", itemX + itemW - 10, itemY + 18);
  ctx.textAlign = "left";
}

function getDisplayLaunchPower(level: number) {
  return 720 + (level - 1) * 110;
}

function getDisplayTubeSlip(level: number) {
  return Math.min(0.992, 0.972 + (level - 1) * 0.004);
}

function getDisplayCashRate(level: number) {
  return 0.12 + (level - 1) * 0.045;
}

function drawBottomHud(args: {
  ctx: CanvasRenderingContext2D;
  width: number;
  height: number;
  angle: number;
  distance: number;
  launched: boolean;
  jetpackFuel: number;
  jetpackLevel: number;
  mapLength: number;
}) {
  const {
    ctx,
    width,
    height,
    angle,
    distance,
    launched,
    jetpackFuel,
    jetpackLevel,
    mapLength,
  } = args;

  const cardX = 18;
  const cardY = height - 110;
  const cardW = width - 36;
  const cardH = 102;

  drawRoundedCard(ctx, cardX, cardY, cardW, cardH, "#fff7ea");

  const leftW = 210;
  const midW = 320;
  const rightW = cardW - leftW - midW - 36;

  const leftX = cardX + 10;
  const midX = leftX + leftW + 8;
  const rightX = midX + midW + 8;
  const innerY = cardY + 10;
  const innerH = 72;

  drawRoundedCard(ctx, leftX, innerY, leftW, innerH, "#fff4cf", "#ffe08a", 22);
  drawRoundedCard(ctx, midX, innerY, midW, innerH, "#eaf8ff", "#cfeeff", 22);
  drawRoundedCard(ctx, rightX, innerY, rightW, innerH, "#eef9df", "#d4f0b8", 22);

  drawCardTitle(ctx, "Controls", leftX + 12, innerY + 21, 15);
  drawStatText(
    ctx,
    launched ? (jetpackLevel > 0 ? "SHIFT = BOOST" : "FLYING") : "SPACE = FIRE",
    leftX + 12,
    innerY + 41,
    12,
    "#4b5563"
  );
  drawStatText(ctx, "W / S = AIM", leftX + 12, innerY + 58, 12, "#4b5563");

  drawCardTitle(ctx, "Run Map", midX + 15, innerY + 21, 15);

  const railX = midX + 12;
  const railY = innerY + 52;
  const railW = midW - 24;

  ctx.fillStyle = "#bfe89a";
  ctx.beginPath();
  ctx.roundRect(railX, railY, railW, 10, 3);
  ctx.fill();
  ctx.lineWidth = 2.5;
  ctx.strokeStyle = "#334155";
  ctx.stroke();

  const mapPercent = Math.max(0.04, Math.min(0.96, distance / mapLength));
  const markerX = railX + railW * mapPercent;

drawRunMapGooseMarker(ctx, markerX, railY + 5);

drawSmallLabel(ctx, "Start", railX, railY - 10, "#6f7c89", 9);
drawSmallLabel(ctx, `${Math.floor(mapLength)}m`, railX + railW - 42, railY - 10, "#6f7c89", 9);
  drawCardTitle(ctx, "Stats", rightX + 15, innerY + 21, 15);
  drawStatText(ctx, `Distance ${Math.floor(distance)}m`, rightX + 12, innerY + 41, 12, "#4b5563");
  drawStatText(
    ctx,
    `Angle ${Math.round((-angle * 180) / Math.PI)}°`,
    rightX + 12,
    innerY + 58,
    12,
    "#4b5563"
  );
}
function drawFinishLine(
  ctx: CanvasRenderingContext2D,
  mapLength: number,
  height: number,
  time: number,
  pulse: number = 0
) {
  const launchStartX = 300;
  const finishX = launchStartX + mapLength * 10;
  const groundY = getGroundY(finishX, height, time);

  const poleBottomY = groundY + 6;
  const poleTopY = groundY - 112;

  ctx.save();

  // shadow
  ctx.strokeStyle = "rgba(0,0,0,0.18)";
  ctx.lineWidth = 8;
  ctx.lineCap = "round";
  ctx.beginPath();
  ctx.moveTo(finishX + 4, poleBottomY + 6);
  ctx.lineTo(finishX + 4, poleTopY + 6);
  ctx.stroke();

  if (pulse > 0.01) {
    const glowAlpha = 0.16 + pulse * 0.28;

    ctx.save();
    ctx.strokeStyle = `rgba(255,220,140,${glowAlpha})`;
    ctx.lineWidth = 18 + pulse * 10;
    ctx.lineCap = "round";
    ctx.beginPath();
    ctx.moveTo(finishX, poleBottomY - 10);
    ctx.lineTo(finishX, poleTopY + 10);
    ctx.stroke();
    ctx.restore();
  }
  // pole
  ctx.strokeStyle = "#000";
  ctx.lineWidth = 6;
  ctx.beginPath();
  ctx.moveTo(finishX, poleBottomY);
  ctx.lineTo(finishX, poleTopY);
  ctx.stroke();

  ctx.strokeStyle = "#fff7d6";
  ctx.lineWidth = 3;
  ctx.beginPath();
  ctx.moveTo(finishX, poleBottomY);
  ctx.lineTo(finishX, poleTopY);
  ctx.stroke();

  // flag
  const wave = Math.sin(time * 5.5) * (4 + pulse * 2.5);

  ctx.fillStyle = "#ff7a2f";
  ctx.beginPath();
  ctx.moveTo(finishX, poleTopY + 6);
  ctx.lineTo(finishX + 38, poleTopY + 12 + wave * 0.35);
  ctx.lineTo(finishX, poleTopY + 28);
  ctx.closePath();
  ctx.fill();

  ctx.lineWidth = 3;
  ctx.strokeStyle = "#000";
  ctx.stroke();

  // little finish badge
  const badgeScale = 1 + pulse * 0.08;

  ctx.save();
  ctx.translate(finishX, poleTopY - 23);
  ctx.scale(badgeScale, badgeScale);

  ctx.fillStyle = "#fff7d6";
  ctx.beginPath();
  ctx.roundRect(-26, -11, 52, 22, 8);
  ctx.fill();
  ctx.stroke();

  ctx.fillStyle = "#2f1d07";
  ctx.font = "900 10px sans-serif";
  ctx.textAlign = "center";
  ctx.textBaseline = "middle";
  ctx.fillText("FINISH", 0, 0);

  ctx.restore();

  ctx.restore();
}

function drawHud(args: {
  ctx: CanvasRenderingContext2D;
  width: number;
  height: number;
  launched: boolean;
  angle: number;
  distance: number;
  cannonLevel: number;
  tubeLevel: number;
  cashLevel: number;
  jetpackLevel: number;
  coins: number;
  skyBits: number;
  jetpackFuel: number;
  mapSkin: GooseMapSkinName;
  mapLength: number;
  cannonUpgradeCost: number;
  tubeUpgradeCost: number;
  cashUpgradeCost: number;
    displayCoins: number;
  uiPulseTime: number;
  finishPulse: number;
  resultsCardAge: number;
}) {
  const {
    ctx,
    width,
    height,
    launched,
    angle,
    distance,
    cannonLevel,
    tubeLevel,
    cashLevel,
    jetpackLevel,
    coins,
    skyBits,
    jetpackFuel,
    mapSkin,
    mapLength,
    cannonUpgradeCost,
    tubeUpgradeCost,
    cashUpgradeCost,
    displayCoins,
    uiPulseTime,
    finishPulse,
    resultsCardAge,
  } = args;

 drawTopMoneyCard(ctx, 18, 18, 220, coins, displayCoins);

const upgradeBounds = getUpgradeCardBounds();

drawUpgradeCard({
  ctx,
  x: upgradeBounds.cannonCard.x,
  y: upgradeBounds.cannonCard.y,
  width: upgradeBounds.cannonCard.width, 
  height: upgradeBounds.cannonCard.height,
  title: "Cannon",
  subtitle: "Launch harder",
  level: cannonLevel,
  accent: "#ffd977",
  statText: `Power ${getDisplayLaunchPower(cannonLevel)}`,
  icon: "cannon",
  cost: cannonUpgradeCost,
  canAfford: coins >= cannonUpgradeCost,
  pulse: uiPulseTime,
});

drawUpgradeCard({
  ctx,
  x: upgradeBounds.tubeCard.x,
  y: upgradeBounds.tubeCard.y,
  width: upgradeBounds.tubeCard.width,
  height: upgradeBounds.tubeCard.height,
  title: "Tube",
  subtitle: "Slide farther",
  level: tubeLevel,
accent: "#ffb98d",
  statText: `Slip ${getDisplayTubeSlip(tubeLevel).toFixed(3)}`,
  icon: "tube",
  cost: tubeUpgradeCost,
  canAfford: coins >= tubeUpgradeCost,
  pulse: uiPulseTime + 0.9,
});

drawUpgradeCard({
  ctx,
  x: upgradeBounds.cashCard.x,
  y: upgradeBounds.cashCard.y,
  width: upgradeBounds.cashCard.width,
  height: upgradeBounds.cashCard.height,
  title: "Money",
  subtitle: "More coins / run",
  level: cashLevel,
 accent: "#bfe7a3",
  statText: `Rate ${getDisplayCashRate(cashLevel).toFixed(2)}`,
  icon: "coin",
  cost: cashUpgradeCost,
  canAfford: coins >= cashUpgradeCost,
  pulse: uiPulseTime + 1.8,
});

drawTopSkyBitsCard(ctx, width - 208, 18, 190, skyBits);
drawStoreCard(ctx, width);
  
  drawBottomHud({
    ctx,
    width,
    height,
    angle,
    distance,
    launched,
    jetpackFuel,
    jetpackLevel,
    mapLength,
  });
}
export function getResultsButtonBounds(width: number, height: number) {
  const cardWidth = Math.min(560, width - 80);
const cardHeight = 282;
  const x = Math.max(250, (width - cardWidth) / 2 + 40);
  const y = Math.max(72, (height - cardHeight) / 2);

  const buttonWidth = 210;
  const buttonHeight = 58;
  const buttonX = x + (cardWidth - buttonWidth) / 2;
  const buttonY = y + cardHeight - 74;

  return {
    x: buttonX,
    y: buttonY,
    width: buttonWidth,
    height: buttonHeight,
  };
}

export function getUpgradeCardBounds() {
  return {
    cannonCard: { x: 18, y: 112, width: 220, height: 144 },
    tubeCard: { x: 18, y: 266, width: 220, height: 144 },
    cashCard: { x: 18, y: 420, width: 220, height: 144 },
  };
}

export function getStoreCardBounds(width: number) {
  return {
    x: width - 208,
    y: 168,
    width: 190,
    height: 132,
  };
}

function drawResultsCard(
  ctx: CanvasRenderingContext2D,
  width: number,
  height: number,
  distance: number,
  coinsEarned: number,
  skyBitsEarned: number,
  age: number = 0
) {
  const cardWidth = Math.min(560, width - 80);
  const cardHeight = 282;
  const cardX = Math.max(250, (width - cardWidth) / 2 + 40);
  const cardY = Math.max(72, (height - cardHeight) / 2);
  const t = Math.max(0, Math.min(1, age / 0.28));
  const eased = 1 - Math.pow(1 - t, 3);
  const scale = 0.94 + eased * 0.06;
  const rise = (1 - eased) * 18;

  ctx.save();
  ctx.fillStyle = `rgba(0,0,0,${0.08 + eased * 0.12})`;
  ctx.fillRect(0, 0, width, height);
  ctx.restore();

  ctx.save();
  ctx.translate(cardX + cardWidth / 2, cardY + cardHeight / 2 - rise);
  ctx.scale(scale, scale);
  ctx.translate(-(cardX + cardWidth / 2), -(cardY + cardHeight / 2));

  drawRoundedCard(ctx, cardX, cardY, cardWidth, cardHeight, "#fff7d6");

  drawRoundedCard(ctx, cardX + 16, cardY + 16, cardWidth - 32, 74, "#ffd977");
  drawSmallLabel(ctx, "Silly Goose Results", cardX + 32, cardY + 30);
  drawCardTitle(ctx, "RUN OVER!", cardX + 32, cardY + 50, 34);

  const statY = cardY + 102;
  const statGap = 14;
  const statInset = 18;
  const statW = (cardWidth - statInset * 2 - statGap) / 2;
  const statH = 72;

  drawRoundedCard(ctx, cardX + statInset, statY, statW, statH, "#d9f7ff");
  drawSmallLabel(ctx, "Distance", cardX + statInset + 14, statY + 14);
  drawCardTitle(ctx, `${distance} m`, cardX + statInset + 14, statY + 32, 24);

  drawRoundedCard(
    ctx,
    cardX + statInset + statW + statGap,
    statY,
    statW,
    statH,
    "#bff3a9"
  );
  drawSmallLabel(
    ctx,
    "Coins Earned",
    cardX + statInset + statW + statGap + 14,
    statY + 14
  );
  drawCardTitle(
    ctx,
    `+${coinsEarned}`,
    cardX + statInset + statW + statGap + 14,
    statY + 32,
    24
  );

  const lowerStatY = statY + statH + 12;

  drawRoundedCard(
    ctx,
    cardX + statInset,
    lowerStatY,
    cardWidth - statInset * 2,
    62,
    "#d7cbff"
  );
  drawSmallLabel(ctx, "Sky Bits Earned", cardX + statInset + 14, lowerStatY + 12);
  drawCardTitle(
    ctx,
    `+${skyBitsEarned} ✨`,
    cardX + statInset + 14,
    lowerStatY + 28,
    22
  );

  const button = getResultsButtonBounds(width, height);

  ctx.save();
  ctx.fillStyle = "#000";
  ctx.beginPath();
  ctx.roundRect(button.x + 8, button.y + 8, button.width, button.height, 18);
  ctx.fill();

  ctx.fillStyle = "#ff7a2f";
  ctx.beginPath();
  ctx.roundRect(button.x, button.y, button.width, button.height, 18);
  ctx.fill();

  ctx.lineWidth = 5;
  ctx.strokeStyle = "#000";
  ctx.stroke();

  ctx.fillStyle = "#fff";
  ctx.font = "900 28px sans-serif";
  ctx.textAlign = "center";
  ctx.textBaseline = "middle";
  ctx.fillText("CONTINUE", button.x + button.width / 2, button.y + button.height / 2 + 1);
  ctx.restore();
  ctx.restore();
}

export function drawSillyGooseScene(
  ctx: CanvasRenderingContext2D,
  args: DrawSillyGooseSceneArgs
) {

  const {
    width,
    height,
    time,
    cannonAngle,
    gooseX,
    gooseY,
    gooseVX = 0,
    gooseVY = 0,
    launched,
    distance,
    cameraX = 0,
    cannonLevel = 1,
    tubeLevel = 1,
    cashLevel = 1,
    jetpackLevel = 0,
    coins = 0,
    skyBits = 0,
    jetpackFuel = 0,
    showResults = false,
    lastRunDistance = 0,
    lastRunCoins = 0,
    lastRunSkyBits = 0,
    mapSkin = "sunny",
    mapLength = 420,
    splashBursts = [],
    launchFlashAge = null,
    displayCoins = coins,
    resultsCardAge = 0,
    finishPulse = 0,
  } = args;

  const skin = GOOSE_MAP_SKINS[mapSkin];
  ctx.clearRect(0, 0, width, height);

  drawSky(ctx, width, height, skin);
  drawClouds(ctx, width, height, time, skin.cloudTheme);

  ctx.save();
  ctx.translate(-cameraX, 0);

  const worldDrawWidth = width + cameraX + 400;

   drawFarHills(ctx, worldDrawWidth, height, time, cameraX, skin);
  drawMainHills(ctx, worldDrawWidth, height, time, skin);
  drawWoodenRampsBack(ctx, height, time, cameraX, width, skin);

  const cannonX = Math.max(300, width * 0.3);
  const cannonY = getGroundY(cannonX, height, time) - 18;

  drawCannon(ctx, cannonX, cannonY, cannonAngle, time, cannonLevel);
  drawCannonLaunchFlash(ctx, cannonX, cannonY, cannonAngle, launchFlashAge);

  if (!launched) {
    drawAimArrow(ctx, cannonX, cannonY, cannonAngle);
  }

  const gooseGroundY = getGroundY(gooseX, height, time);
  const minGooseY = gooseGroundY - 20;
  const visualGooseY = Math.min(gooseY, minGooseY);

  drawWaterWhitecaps(ctx, width, height, time, cameraX, skin);
  drawForegroundWaterFoam(ctx, width, height, time, cameraX, skin);
  drawSplashBursts(ctx, splashBursts, time, skin);
  drawHillDecorations(ctx, worldDrawWidth, height, time, cameraX, skin);
  drawWorldGrassBehind(ctx, width, height, time, cameraX, skin);
  drawFinishLine(ctx, mapLength, height, time, finishPulse);
  drawWoodenRampsFront(ctx, height, time, cameraX, width, skin);

  drawGooseWakeTrail(ctx, gooseX, visualGooseY, height, time, launched, skin, tubeLevel);
  drawTubeOnly(ctx, gooseX, visualGooseY, time, launched, skin, tubeLevel, gooseVX, gooseVY);
  if (!launched) {
    drawCannonFrontLip(ctx, cannonX, cannonY, cannonAngle, cannonLevel, time);
  }

  drawGooseOnly(ctx, gooseX, visualGooseY, time, launched, gooseVX, gooseVY);
  drawWorldGrassFront(ctx, width, height, time, cameraX, skin);
  ctx.restore();

drawHud({
  ctx,
  width,
  height,
  launched,
  angle: cannonAngle,
  distance,
  cannonLevel,
  tubeLevel,
  cashLevel,
  jetpackLevel,
  coins,
  skyBits,
  jetpackFuel,
  mapSkin,
  mapLength,
  cannonUpgradeCost: Math.floor(25 * Math.pow(1.4, cannonLevel - 1)),
  tubeUpgradeCost: Math.floor(25 * Math.pow(1.4, tubeLevel - 1)),
  cashUpgradeCost: Math.floor(40 * Math.pow(1.4, cashLevel - 1)),
  displayCoins,
  uiPulseTime: time * 3.2,
  finishPulse,
  resultsCardAge,
});

if (showResults) {
  drawResultsCard(
    ctx,
    width,
    height,
    lastRunDistance,
    lastRunCoins,
    lastRunSkyBits,
    resultsCardAge
  );
}
}