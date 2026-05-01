"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import {
  drawCloud,
  drawClouds,
  drawGooseInTube,
  drawSillyGooseScene,
  getResultsButtonBounds,
  getUpgradeCardBounds,
  type GooseMapSkinName,
} from "./drawSillyGooseScene";

type GameMode = "start" | "aim" | "flying" | "results";

type UpgradeState = {
  cannonLevel: number;
  tubeLevel: number;
  cashLevel: number;
  jetpackLevel: number;
};

type RunState = {
  cannonAngle: number;
  gooseX: number;
  gooseY: number;
  vx: number;
  vy: number;
  distance: number;
  cameraX: number;
  jetpackFuel: number;
};

type SplashBurst = {
  x: number;
  y: number;
  bornAt: number;
  strength: number;
  kind: "impact" | "skim";
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

const STARTING_MAP_LENGTH = 1000;
const MAP_LENGTH_INCREASE = 1000;

function clamp(value: number, min: number, max: number) {
  return Math.max(min, Math.min(max, value));
}

function getUpgradeCost(base: number, level: number) {
  return Math.floor(base * Math.pow(1.4, level - 1));
}

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

function getGroundY(x: number, height: number, time: number) {
  let y = getHillY(x, height, time);
  y -= getRampLift(x);
  return y;
}
function drawStartMenu(
  ctx: CanvasRenderingContext2D,
  width: number,
  height: number,
  time: number,
  isStartHovered: boolean
) {
  ctx.save();
  ctx.clearRect(0, 0, width, height);

  const sky = ctx.createLinearGradient(0, 0, 0, height);
  sky.addColorStop(0, "#8ed0ff");
  sky.addColorStop(0.58, "#b8e7ff");
  sky.addColorStop(1, "#e9f9ff");
  ctx.fillStyle = sky;
  ctx.fillRect(0, 0, width, height);

  drawClouds(ctx, width, height, time);
  drawCloud(ctx, ((time * 7 + 180) % (width + 320)) - 180, height * 0.42, 1.9);
  drawCloud(ctx, ((time * 5 + 420) % (width + 360)) - 200, height * 0.58, 2.2);
  drawCloud(ctx, ((time * 4 + 90) % (width + 400)) - 220, height * 0.3, 1.6);

  const panelW = Math.min(860, width - 70);
  const panelX = (width - panelW) / 2;
  const panelY = Math.max(70, height * 0.22);
  const panelH = Math.min(420, height - panelY - 50);

  // big card shadow
  ctx.fillStyle = "#000";
  ctx.beginPath();
  ctx.roundRect(panelX + 14, panelY + 14, panelW, panelH, 28);
  ctx.fill();

  // big card
  const panelGrad = ctx.createLinearGradient(0, panelY, 0, panelY + panelH);
  panelGrad.addColorStop(0, "#fff8de");
  panelGrad.addColorStop(1, "#fff1c8");
  ctx.fillStyle = panelGrad;
  ctx.beginPath();
  ctx.roundRect(panelX, panelY, panelW, panelH, 28);
  ctx.fill();

  ctx.lineWidth = 6;
  ctx.strokeStyle = "#000";
  ctx.stroke();

  // title card area
  const titleX = panelX + 24;
  const titleY = panelY + 40;
  const titleW = panelW - 48;
const titleH = 200;

  ctx.fillStyle = "#000";
  ctx.beginPath();
  ctx.roundRect(titleX + 10, titleY + 10, titleW, titleH, 22);
  ctx.fill();

  // different color than big card
  const titleGrad = ctx.createLinearGradient(0, titleY, 0, titleY + titleH);
  titleGrad.addColorStop(0, "#dff6ff");
  titleGrad.addColorStop(1, "#c9ebff");
  ctx.fillStyle = titleGrad;
  ctx.beginPath();
  ctx.roundRect(titleX, titleY, titleW, titleH, 22);
  ctx.fill();
  ctx.stroke();

  // subtle inner shine
  ctx.save();
  ctx.globalAlpha = 0.18;
  const shine = ctx.createLinearGradient(titleX, titleY, titleX + titleW, titleY + titleH);
  shine.addColorStop(0, "#ffffff");
  shine.addColorStop(0.45, "#ffffff");
  shine.addColorStop(1, "rgba(255,255,255,0)");
  ctx.fillStyle = shine;
  ctx.beginPath();
  ctx.roundRect(titleX + 8, titleY + 8, titleW - 16, 58, 18);
  ctx.fill();
  ctx.restore();

  ctx.fillStyle = "#2f1d07";
  ctx.textBaseline = "top";
  ctx.textAlign = "left";
  ctx.font = "900 64px sans-serif";
  ctx.fillText("SILLY GOOSE", titleX + 34, titleY + 28);

  ctx.fillStyle = "#4b5d6b";
  ctx.font = "700 22px sans-serif";
  ctx.fillText("Launch the goose. Slide forever. Get rich.", titleX + 36, titleY + 106);

  // SHOOT badge lowered so it fits nicely inside the title card
  const shootX = titleX + 28;
  const shootY = titleY + 138;
  const shootW = 182;
  const shootH = 48;

  ctx.fillStyle = "#000";
  ctx.beginPath();
  ctx.roundRect(shootX + 8, shootY + 8, shootW, shootH, 16);
  ctx.fill();

  const shootGrad = ctx.createLinearGradient(0, shootY, 0, shootY + shootH);
  shootGrad.addColorStop(0, "#ff9558");
  shootGrad.addColorStop(1, "#ff6f1f");
  ctx.fillStyle = shootGrad;
  ctx.beginPath();
  ctx.roundRect(shootX, shootY, shootW, shootH, 16);
  ctx.fill();
  ctx.stroke();

  ctx.fillStyle = "#fff";
  ctx.font = "900 30px sans-serif";
  ctx.fillText("SHOOT!", shootX + 20, shootY + 8);

  ctx.save();
  ctx.translate(titleX + titleW - 160, titleY + 102);
  ctx.scale(3, 3);
  drawGooseInTube(ctx, 0, 0, time, false, 1);
  ctx.restore();

  const startW = (panelW - 72) / 2;
  const buttonY = panelY + panelH - 118;

  const startX = panelX + 34;
  const storeX = panelX + 50 + startW;

  // START button hover lift/glow
  const hoverLift = isStartHovered ? -4 : 0;
  const startShadowOffset = isStartHovered ? 6 : 10;

  ctx.fillStyle = "#000";
  ctx.beginPath();
  ctx.roundRect(startX + startShadowOffset, buttonY + startShadowOffset + hoverLift, startW, 74, 18);
  ctx.fill();

  const startGrad = ctx.createLinearGradient(0, buttonY, 0, buttonY + 74);
  startGrad.addColorStop(0, isStartHovered ? "#ffb066" : "#ff9558");
  startGrad.addColorStop(1, isStartHovered ? "#ff7a2f" : "#ff6c1a");
  ctx.fillStyle = startGrad;
  ctx.beginPath();
  ctx.roundRect(startX, buttonY + hoverLift, startW, 74, 18);
  ctx.fill();
  ctx.stroke();

  if (isStartHovered) {
    ctx.save();
    ctx.globalAlpha = 0.22;
    ctx.fillStyle = "#fff";
    ctx.beginPath();
    ctx.roundRect(startX + 10, buttonY + 8 + hoverLift, startW - 20, 20, 12);
    ctx.fill();

    ctx.globalAlpha = 0.18;
    ctx.strokeStyle = "#fff";
    ctx.lineWidth = 3;
    ctx.strokeRect(startX - 4, buttonY - 4 + hoverLift, startW + 8, 82);
    ctx.restore();
  } else {
    ctx.save();
    ctx.globalAlpha = 0.14;
    ctx.fillStyle = "#fff";
    ctx.beginPath();
    ctx.roundRect(startX + 10, buttonY + 8, startW - 20, 18, 12);
    ctx.fill();
    ctx.restore();
  }

  ctx.fillStyle = "#fff";
  ctx.textAlign = "center";
  ctx.font = "900 28px sans-serif";
  ctx.fillText("START", startX + startW / 2, buttonY + 21 + hoverLift);

  // STORE button
  ctx.fillStyle = "#000";
  ctx.beginPath();
  ctx.roundRect(storeX + 10, buttonY + 10, startW, 74, 18);
  ctx.fill();

  const storeGrad = ctx.createLinearGradient(0, buttonY, 0, buttonY + 74);
  storeGrad.addColorStop(0, "#ece5d4");
  storeGrad.addColorStop(1, "#d7cfbc");
  ctx.fillStyle = storeGrad;
  ctx.beginPath();
  ctx.roundRect(storeX, buttonY, startW, 74, 18);
  ctx.fill();
  ctx.stroke();

  ctx.save();
  ctx.globalAlpha = 0.12;
  ctx.fillStyle = "#fff";
  ctx.beginPath();
  ctx.roundRect(storeX + 10, buttonY + 8, startW - 20, 18, 12);
  ctx.fill();
  ctx.restore();

  ctx.fillStyle = "#6b6256";
  ctx.fillText("STORE", storeX + startW / 2, buttonY + 21);

  ctx.strokeStyle = "#6b6256";
  ctx.lineWidth = 4;
  ctx.beginPath();
  ctx.moveTo(storeX + 30, buttonY + 54);
  ctx.lineTo(storeX + startW - 30, buttonY + 20);
  ctx.stroke();
  
  // -----------------------------
  // KamiKarp Studios signature
  // -----------------------------

  const tagY = height - 28;

  ctx.save();

  ctx.textAlign = "center";
  ctx.textBaseline = "middle";

  // soft shadow
  ctx.globalAlpha = 0.18;
  ctx.fillStyle = "#000";
  ctx.font = "700 16px sans-serif";
  ctx.fillText("KAMIKARP STUDIOS", width / 2 + 1, tagY + 1);

  // main text
  ctx.globalAlpha = 0.7;
  ctx.fillStyle = "#2f1d07";
  ctx.fillText(" ♥ A KamiKarp Studios Game ♥", width / 2, tagY);

  ctx.restore();
  ctx.restore();
}

export default function SillyGooseGame() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const displayCoinsRef = useRef(0);
  const resultsShownAtRef = useRef<number | null>(null);

  const [mode, setMode] = useState<GameMode>("start");
  const [coins, setCoins] = useState(0);
  const [skyBits, setSkyBits] = useState(0);
  const [lastRunCoins, setLastRunCoins] = useState(0);
  const [lastRunSkyBits, setLastRunSkyBits] = useState(0);
  const [lastRunDistance, setLastRunDistance] = useState(0);
  const [lastRunReachedFinish, setLastRunReachedFinish] = useState(false);
  const [mapSkin, setMapSkin] = useState<GooseMapSkinName>("sunny");
  const [mapLength, setMapLength] = useState(STARTING_MAP_LENGTH);
  const [upgrades, setUpgrades] = useState<UpgradeState>({
    cannonLevel: 1,
    tubeLevel: 1,
    cashLevel: 1,
    jetpackLevel: 0,
  });

  const [run, setRun] = useState<RunState>({
    cannonAngle: -0.45,
    gooseX: 0,
    gooseY: 0,
    vx: 0,
    vy: 0,
    distance: 0,
    cameraX: 0,
    jetpackFuel: 0,
  });

  const keysRef = useRef({
    w: false,
    s: false,
    shift: false,
  });

  const modeRef = useRef<GameMode>("start");
  const upgradesRef = useRef(upgrades);
  const skyBitsRef = useRef(skyBits);
  const coinsRef = useRef(coins);
  const lastRunCoinsRef = useRef(lastRunCoins);
  const lastRunSkyBitsRef = useRef(lastRunSkyBits);
  const lastRunDistanceRef = useRef(lastRunDistance);
  const lastRunReachedFinishRef = useRef(lastRunReachedFinish);
  const runRef = useRef(run);
  const startHoverRef = useRef(false);
  const mapSkinRef = useRef<GooseMapSkinName>("sunny");
  const mapLengthRef = useRef(STARTING_MAP_LENGTH);
  const splashBurstsRef = useRef<SplashBurst[]>([]);
  const launchFlashAtRef = useRef<number | null>(null);
  const lastSkimBurstAtRef = useRef(0);

  useEffect(() => {
    modeRef.current = mode;
  }, [mode]);

  useEffect(() => {
    upgradesRef.current = upgrades;
  }, [upgrades]);

  useEffect(() => {
    skyBitsRef.current = skyBits;
  }, [skyBits]);

  useEffect(() => {
    coinsRef.current = coins;
  }, [coins]);

    useEffect(() => {
    displayCoinsRef.current = coins;
  }, [coins]);

  useEffect(() => {
  lastRunCoinsRef.current = lastRunCoins;
}, [lastRunCoins]);

useEffect(() => {
  lastRunSkyBitsRef.current = lastRunSkyBits;
}, [lastRunSkyBits]);

useEffect(() => {
  lastRunDistanceRef.current = lastRunDistance;
}, [lastRunDistance]);

useEffect(() => {
  lastRunReachedFinishRef.current = lastRunReachedFinish;
}, [lastRunReachedFinish]);

  useEffect(() => {
    runRef.current = run;
  }, [run]);

  useEffect(() => {
    mapLengthRef.current = mapLength;
  }, [mapLength]);

    useEffect(() => {
    mapSkinRef.current = mapSkin;
  }, [mapSkin]);
  
  const cannonUpgradeCost = useMemo(
    () => getUpgradeCost(25, upgrades.cannonLevel),
    [upgrades.cannonLevel]
  );

  const tubeUpgradeCost = useMemo(
    () => getUpgradeCost(25, upgrades.tubeLevel),
    [upgrades.tubeLevel]
  );

  const cashUpgradeCost = useMemo(
    () => getUpgradeCost(40, upgrades.cashLevel),
    [upgrades.cashLevel]
  );

  const jetpackUpgradeCost = useMemo(
    () => 5 + upgrades.jetpackLevel * 5,
    [upgrades.jetpackLevel]
  );

  function getLaunchPower(level: number) {
    return 720 + (level - 1) * 110;
  }

 function getTubeSlip(level: number) {
  return Math.min(0.992, 0.972 + (level - 1) * 0.004);
}

function getCashRate(level: number) {
  return 0.12 + (level - 1) * 0.045;
}

function getDistanceBonus(distance: number) {
  return 1 + Math.min(1.5, distance / 1000);
}

function advanceToNextMapSkin() {
  const skinOrder: GooseMapSkinName[] = ["sunny", "night", "desert", "pool"];
  const currentIndex = skinOrder.indexOf(mapSkinRef.current);
  const nextSkin = skinOrder[(currentIndex + 1) % skinOrder.length];
  mapSkinRef.current = nextSkin;
  setMapSkin(nextSkin);
}

  function getJetpackFuelMax(level: number) {
    if (level <= 0) return 0;
    return 0.9 + level * 0.45;
  }

  function getJetpackForce(level: number) {
    if (level <= 0) return 0;
    return 520 + level * 70;
  }

  function getSkyBitsForDistance(distance: number) {
    return Math.floor(distance / 250);
  }

  function resetGooseToCannon(
    width: number,
    height: number,
    time: number,
    angle: number
  ) {
    const cannonX = Math.max(300, width * 0.3);
   const cannonY = getGroundY(cannonX, height, time) - 18;

    return {
      gooseX: cannonX + Math.cos(angle) * 82,
      gooseY: cannonY + Math.sin(angle) * 82 - 8,
    };
  }

  function startRun(width: number, height: number, time: number) {
    const position = resetGooseToCannon(
      width,
      height,
      time,
      runRef.current.cannonAngle
    );

    setRun((prev) => ({
      ...prev,
      gooseX: position.gooseX,
      gooseY: position.gooseY,
      vx: 0,
      vy: 0,
      distance: 0,
      cameraX: 0,
      jetpackFuel: getJetpackFuelMax(upgradesRef.current.jetpackLevel),
    }));

    setMode("aim");
  }

  function resetToAim(width: number, height: number, time: number) {
    const position = resetGooseToCannon(
      width,
      height,
      time,
      runRef.current.cannonAngle
    );

    setRun((prev) => ({
      ...prev,
      gooseX: position.gooseX,
      gooseY: position.gooseY,
      vx: 0,
      vy: 0,
      distance: 0,
      cameraX: 0,
      jetpackFuel: getJetpackFuelMax(upgradesRef.current.jetpackLevel),
    }));

    setMode("aim");
  }
function continueFromResults(width: number, height: number, time: number) {
  const newCoins = coinsRef.current + lastRunCoinsRef.current;
  coinsRef.current = newCoins;
  setCoins(newCoins);
  displayCoinsRef.current = newCoins;

  const newSkyBits = skyBitsRef.current + lastRunSkyBitsRef.current;
  skyBitsRef.current = newSkyBits;
  setSkyBits(newSkyBits);

  if (lastRunReachedFinishRef.current) {
    advanceToNextMapSkin();
    setMapLength((prev) => prev + MAP_LENGTH_INCREASE);
  }

  resultsShownAtRef.current = null;
  resetToAim(width, height, time);
}
function buyUpgrade(type: keyof UpgradeState) {
  if (modeRef.current === "flying") return;

  const currentUpgrades = upgradesRef.current;
  const currentCoins = coinsRef.current;
  const currentSkyBits = skyBitsRef.current;

  const currentCannonCost = getUpgradeCost(25, currentUpgrades.cannonLevel);
  const currentTubeCost = getUpgradeCost(25, currentUpgrades.tubeLevel);
  const currentCashCost = getUpgradeCost(40, currentUpgrades.cashLevel);
  const currentJetpackCost = 5 + currentUpgrades.jetpackLevel * 5;

  if (type === "cannonLevel" && currentCoins >= currentCannonCost) {
    const newCoins = currentCoins - currentCannonCost;
    coinsRef.current = newCoins;
    setCoins(newCoins);

    const newUpgrades = {
      ...currentUpgrades,
      cannonLevel: currentUpgrades.cannonLevel + 1,
    };
    upgradesRef.current = newUpgrades;
    setUpgrades(newUpgrades);
    return;
  }

  if (type === "tubeLevel" && currentCoins >= currentTubeCost) {
    const newCoins = currentCoins - currentTubeCost;
    coinsRef.current = newCoins;
    setCoins(newCoins);

    const newUpgrades = {
      ...currentUpgrades,
      tubeLevel: currentUpgrades.tubeLevel + 1,
    };
    upgradesRef.current = newUpgrades;
    setUpgrades(newUpgrades);
    return;
  }

  if (type === "cashLevel" && currentCoins >= currentCashCost) {
    const newCoins = currentCoins - currentCashCost;
    coinsRef.current = newCoins;
    setCoins(newCoins);

    const newUpgrades = {
      ...currentUpgrades,
      cashLevel: currentUpgrades.cashLevel + 1,
    };
    upgradesRef.current = newUpgrades;
    setUpgrades(newUpgrades);
    return;
  }

  if (type === "jetpackLevel" && currentSkyBits >= currentJetpackCost) {
    const newSkyBits = currentSkyBits - currentJetpackCost;
    skyBitsRef.current = newSkyBits;
    setSkyBits(newSkyBits);

    const newUpgrades = {
      ...currentUpgrades,
      jetpackLevel: currentUpgrades.jetpackLevel + 1,
    };
    upgradesRef.current = newUpgrades;
    setUpgrades(newUpgrades);
  }
}

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    let animationFrameId = 0;
    let lastTime = performance.now();

    const resizeCanvas = () => {
      const parent = canvas.parentElement;
      if (!parent) return;

      const dpr = window.devicePixelRatio || 1;
      const width = parent.clientWidth;
      const height = parent.clientHeight;

      canvas.width = Math.max(1, Math.floor(width * dpr));
      canvas.height = Math.max(1, Math.floor(height * dpr));
      canvas.style.width = `${width}px`;
      canvas.style.height = `${height}px`;

      ctx.setTransform(1, 0, 0, 1, 0, 0);
      ctx.scale(dpr, dpr);

      const time = performance.now() / 1000;
      const position = resetGooseToCannon(
        width,
        height,
        time,
        runRef.current.cannonAngle
      );

      if (modeRef.current !== "flying") {
        setRun((prev) => ({
          ...prev,
          gooseX: position.gooseX,
          gooseY: position.gooseY,
        }));
      }
    };

    const handleKeyDown = (e: KeyboardEvent) => {
      const key = e.key.toLowerCase();

      if (key === "w") keysRef.current.w = true;
      if (key === "s") keysRef.current.s = true;
      if (key === "shift") keysRef.current.shift = true;

      if (key === " ") {
        e.preventDefault();

        if (modeRef.current === "aim") {
          launchFlashAtRef.current = performance.now() / 1000;

          setRun((prev) => {
            const launchPower = getLaunchPower(upgradesRef.current.cannonLevel);

            return {
              ...prev,
              vx: Math.cos(prev.cannonAngle) * launchPower,
              vy: Math.sin(prev.cannonAngle) * launchPower,
            };
          });

          setMode("flying");
        } else if (modeRef.current === "results") {
          const width = canvas.clientWidth || 1;
          const height = canvas.clientHeight || 1;
          continueFromResults(width, height, performance.now() / 1000);
        }
      }
    };

    const handleKeyUp = (e: KeyboardEvent) => {
      const key = e.key.toLowerCase();

      if (key === "w") keysRef.current.w = false;
      if (key === "s") keysRef.current.s = false;
      if (key === "shift") keysRef.current.shift = false;
    };

    const handlePointerDown = (e: MouseEvent) => {
      const rect = canvas.getBoundingClientRect();
      const clickX = e.clientX - rect.left;
      const clickY = e.clientY - rect.top;

      const width = canvas.clientWidth || 1;
      const height = canvas.clientHeight || 1;

      if (modeRef.current === "start") {
const panelW = Math.min(860, width - 70);
const panelX = (width - panelW) / 2;
const panelY = Math.max(70, height * 0.22);
const panelH = Math.min(420, height - panelY - 50);

const startButtonW = (panelW - 72) / 2;
const startButtonH = 74;
const startButtonX = panelX + 34;
const startButtonY = panelY + panelH - 118;

        const insideStart =
          clickX >= startButtonX &&
          clickX <= startButtonX + startButtonW &&
          clickY >= startButtonY &&
          clickY <= startButtonY + startButtonH;

        if (insideStart) {
          startRun(width, height, performance.now() / 1000);
        }

        return;
      }

      if (modeRef.current === "results") {
        const button = getResultsButtonBounds(width, height);

        const insideContinue =
          clickX >= button.x &&
          clickX <= button.x + button.width &&
          clickY >= button.y &&
          clickY <= button.y + button.height;

        if (insideContinue) {
          continueFromResults(width, height, performance.now() / 1000);
        }

        return;
      }

      if (modeRef.current === "aim") {
        const bounds = getUpgradeCardBounds();

        const insideCannon =
          clickX >= bounds.cannonCard.x &&
          clickX <= bounds.cannonCard.x + bounds.cannonCard.width &&
          clickY >= bounds.cannonCard.y &&
          clickY <= bounds.cannonCard.y + bounds.cannonCard.height;

        const insideTube =
          clickX >= bounds.tubeCard.x &&
          clickX <= bounds.tubeCard.x + bounds.tubeCard.width &&
          clickY >= bounds.tubeCard.y &&
          clickY <= bounds.tubeCard.y + bounds.tubeCard.height;

        const insideCash =
          clickX >= bounds.cashCard.x &&
          clickX <= bounds.cashCard.x + bounds.cashCard.width &&
          clickY >= bounds.cashCard.y &&
          clickY <= bounds.cashCard.y + bounds.cashCard.height;

        if (insideCannon) {
          buyUpgrade("cannonLevel");
          return;
        }

        if (insideTube) {
          buyUpgrade("tubeLevel");
          return;
        }

        if (insideCash) {
          buyUpgrade("cashLevel");
          return;
        }
      }
    };

    const handlePointerMove = (e: MouseEvent) => {
      if (modeRef.current !== "start") {
        startHoverRef.current = false;
        canvas.style.cursor = "default";
        return;
      }

      const rect = canvas.getBoundingClientRect();
      const hoverX = e.clientX - rect.left;
      const hoverY = e.clientY - rect.top;

      const width = canvas.clientWidth || 1;
      const height = canvas.clientHeight || 1;

const panelW = Math.min(860, width - 70);
const panelX = (width - panelW) / 2;
const panelY = Math.max(70, height * 0.22);
const panelH = Math.min(420, height - panelY - 50);

const startButtonW = (panelW - 72) / 2;
const startButtonH = 74;
const startButtonX = panelX + 34;
const startButtonY = panelY + panelH - 118;

      const insideStart =
        hoverX >= startButtonX &&
        hoverX <= startButtonX + startButtonW &&
        hoverY >= startButtonY &&
        hoverY <= startButtonY + startButtonH;

      startHoverRef.current = insideStart;
      canvas.style.cursor = insideStart ? "pointer" : "default";
    };

    const loop = (now: number) => {
      const dt = Math.min(0.033, (now - lastTime) / 1000);
      lastTime = now;

      const time = now / 1000;
      const width = canvas.clientWidth || 1;
      const height = canvas.clientHeight || 1;

      setRun((prev) => {
        let next = { ...prev };

        if (modeRef.current === "aim") {
          if (keysRef.current.w) next.cannonAngle -= 1.7 * dt;
          if (keysRef.current.s) next.cannonAngle += 1.7 * dt;

          next.cannonAngle = clamp(next.cannonAngle, -1.2, -0.15);

          const position = resetGooseToCannon(
            width,
            height,
            time,
            next.cannonAngle
          );

          next.gooseX = position.gooseX;
          next.gooseY = position.gooseY;
          next.cameraX = 0;
          next.distance = 0;
        }

        if (modeRef.current === "flying") {
          next.vy += 980 * dt;
          next.vx *= 0.998;

          if (
            keysRef.current.shift &&
            upgradesRef.current.jetpackLevel > 0 &&
            next.jetpackFuel > 0
          ) {
            next.vy -= getJetpackForce(upgradesRef.current.jetpackLevel) * dt;
            next.jetpackFuel = Math.max(0, next.jetpackFuel - dt);
          }

          next.gooseX += next.vx * dt;
          next.gooseY += next.vy * dt;

          const ramp = getRampAtX(next.gooseX);
          const surfaceY = getGroundY(next.gooseX, height, time) - 3;
          const groundY = getGroundY(next.gooseX, height, time) - 18;

          if (next.gooseY > groundY) {
            const hitSpeed = Math.abs(next.vy);
            const incomingVy = next.vy;
            next.gooseY = groundY;

            if (hitSpeed > 120) {
              next.vy *= -0.28;
            } else {
              next.vy = 0;
            }

            if (hitSpeed > 150) {
              splashBurstsRef.current.push({
                x: next.gooseX,
                y: surfaceY + 1,
                bornAt: time,
                strength: Math.min(1.5, hitSpeed / 520),
                kind: "impact",
              });
            }

            const slip = getTubeSlip(upgradesRef.current.tubeLevel);
            next.vx *= slip;

            // softer water drag so the goose drifts more before settling
            const waterDragPerSecond =
              95 - Math.min(45, (upgradesRef.current.tubeLevel - 1) * 4);

            const dragStep = waterDragPerSecond * dt;

            if (next.vx > 0) {
              next.vx = Math.max(0, next.vx - dragStep);
            } else if (next.vx < 0) {
              next.vx = Math.min(0, next.vx + dragStep);
            }

            const skimSpeed = Math.abs(next.vx);
            if (
              skimSpeed > 190 &&
              Math.abs(incomingVy) < 220 &&
              time - lastSkimBurstAtRef.current > 0.07
            ) {
              splashBurstsRef.current.push({
                x: next.gooseX - 10,
                y: surfaceY,
                bornAt: time,
                strength: Math.min(1.1, skimSpeed / 700),
                kind: "skim",
              });
              lastSkimBurstAtRef.current = time;
            }

            if (ramp && Math.abs(next.vx) > 120) {
              const rampT = (next.gooseX - ramp.x) / ramp.width;

              if (rampT > 0.72) {
                const speed = Math.abs(next.vx);
                const rampBoost = Math.min(260, 90 + speed * 0.16);

                splashBurstsRef.current.push({
                  x: next.gooseX - 12,
                  y: surfaceY,
                  bornAt: time,
                  strength: Math.min(1.1, speed / 800),
                  kind: "skim",
                });

                next.vy = Math.min(next.vy, -rampBoost);
                next.vx *= 1.015;
              }
            }
          }

const launchStartX = Math.max(300, width * 0.3);
next.distance = Math.max(0, (next.gooseX - launchStartX) / 10);

const targetCameraX = Math.max(0, next.gooseX - width * 0.3);
next.cameraX += (targetCameraX - next.cameraX) * 0.08;

splashBurstsRef.current = splashBurstsRef.current.filter((burst) => {
  const maxAge = burst.kind === "impact" ? 0.75 : 0.42;
  return time - burst.bornAt <= maxAge;
});

if (next.distance >= mapLengthRef.current) {
  const earnedCoins = Math.max(
    1,
    Math.floor(
      next.distance *
        getCashRate(upgradesRef.current.cashLevel) *
        getDistanceBonus(next.distance)
    )
  );

  const earnedSkyBits = Math.max(1, getSkyBitsForDistance(mapLengthRef.current));

  setLastRunCoins(earnedCoins);
  setLastRunSkyBits(earnedSkyBits);
  setLastRunDistance(mapLengthRef.current);
  setLastRunReachedFinish(true);
  resultsShownAtRef.current = time;
  setMode("results");
}

if (Math.abs(next.vx) < 20 && next.gooseY >= groundY - 1) {
  const earnedCoins = Math.max(
    1,
    Math.floor(
      next.distance *
        getCashRate(upgradesRef.current.cashLevel) *
        getDistanceBonus(next.distance)
    )
  );

  const earnedSkyBits = Math.max(0, getSkyBitsForDistance(next.distance));

  setLastRunCoins(earnedCoins);
  setLastRunSkyBits(earnedSkyBits);
  setLastRunDistance(Math.floor(next.distance));
  setLastRunReachedFinish(false);
  resultsShownAtRef.current = time;
  setMode("results");
}
        }

        return next;
      });

      const currentRun = runRef.current;

      displayCoinsRef.current +=
        (coinsRef.current - displayCoinsRef.current) * 0.14;

      if (modeRef.current !== "start") {
        drawSillyGooseScene(ctx, {
          width,
          height,
          time,
          cannonAngle: currentRun.cannonAngle,
          gooseX: currentRun.gooseX,
          gooseY: currentRun.gooseY,
          gooseVX: currentRun.vx,
          gooseVY: currentRun.vy,
          launched: modeRef.current === "flying",
          distance: currentRun.distance,
          cameraX: currentRun.cameraX,
          cannonLevel: upgradesRef.current.cannonLevel,
          tubeLevel: upgradesRef.current.tubeLevel,
          cashLevel: upgradesRef.current.cashLevel,
          jetpackLevel: upgradesRef.current.jetpackLevel,
          coins: coinsRef.current,
          skyBits: skyBitsRef.current,
          jetpackFuel: currentRun.jetpackFuel,
          showResults: modeRef.current === "results",
          lastRunDistance: lastRunDistanceRef.current,
          lastRunCoins: lastRunCoinsRef.current,
          lastRunSkyBits: lastRunSkyBitsRef.current,
          mapSkin: mapSkinRef.current,
          mapLength: mapLengthRef.current,
          splashBursts: splashBurstsRef.current,
          launchFlashAge:
            launchFlashAtRef.current == null
              ? null
              : time - launchFlashAtRef.current,
          displayCoins: displayCoinsRef.current,
          resultsCardAge:
            resultsShownAtRef.current == null
              ? 0
              : time - resultsShownAtRef.current,
          finishPulse: Math.max(
            0,
            Math.min(1, (currentRun.distance - mapLengthRef.current * 0.82) / (mapLengthRef.current * 0.18))
          ),
        });
       } else {
        drawStartMenu(ctx, width, height, time, startHoverRef.current);
      }

      animationFrameId = window.requestAnimationFrame(loop);
    };

    resizeCanvas();
    lastTime = performance.now();
    animationFrameId = window.requestAnimationFrame(loop);

    window.addEventListener("resize", resizeCanvas);
    window.addEventListener("keydown", handleKeyDown);
    window.addEventListener("keyup", handleKeyUp);
     canvas.addEventListener("mousedown", handlePointerDown);
    canvas.addEventListener("mousemove", handlePointerMove);

    return () => {
      window.cancelAnimationFrame(animationFrameId);
      window.removeEventListener("resize", resizeCanvas);
      window.removeEventListener("keydown", handleKeyDown);
      window.removeEventListener("keyup", handleKeyUp);
      canvas.removeEventListener("mousedown", handlePointerDown);
      canvas.removeEventListener("mousemove", handlePointerMove);
      canvas.style.cursor = "default";
    };
  }, []);

    return (
  <div className="relative h-full w-full overflow-hidden bg-[#87c7ff]">
    <canvas
      ref={canvasRef}
      className="absolute inset-0 z-0 block h-full w-full"
    />
  </div>
);

}