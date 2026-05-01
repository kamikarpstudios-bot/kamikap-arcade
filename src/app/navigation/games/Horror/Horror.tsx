"use client";

import { useEffect, useRef } from "react";

type Keys = {
  left: boolean;
  right: boolean;
  a: boolean;
  d: boolean;
};

type GamePhase = "playing" | "result" | "gameover" | "win";

type AnomalyId =
  | "none"
  | "posterEyes"
  | "exitStay"
  | "longShadow"
  | "wrongClock"
  | "doorCrack"
  | "lightsRed"
  | "extraDoor"
  | "floorMessage"
  | "figureReflection"
  | "missingPoster";

type RunState = {
  playerX: number;
  playerY: number;
  camX: number;
  loop: number;
  correct: number;
  mistakes: number;
  anomaly: AnomalyId;
  phase: GamePhase;
  message: string;
  messageTimer: number;
  globalT: number;
  buttons: {
    yes: Rect;
    no: Rect;
  };
};

type Rect = {
  x: number;
  y: number;
  w: number;
  h: number;
};

const WORLD_W = 2800;
const FLOOR_Y = 420;
const PLAYER_SPEED = 260;
const EXIT_X = WORLD_W - 280;
const START_X = 120;
const WIN_NEEDED = 8;
const MAX_MISTAKES = 3;

const ANOMALIES: AnomalyId[] = [
  "posterEyes",
  "exitStay",
  "longShadow",
  "wrongClock",
  "doorCrack",
  "lightsRed",
  "extraDoor",
  "floorMessage",
  "figureReflection",
  "missingPoster",
];

const anomalyNames: Record<AnomalyId, string> = {
  none: "NO ANOMALY",
  posterEyes: "POSTER EYES",
  exitStay: "EXIT SIGN CHANGED",
  longShadow: "LONG SHADOW",
  wrongClock: "WRONG CLOCK",
  doorCrack: "DOOR CRACK",
  lightsRed: "RED LIGHTS",
  extraDoor: "EXTRA DOOR",
  floorMessage: "FLOOR MESSAGE",
  figureReflection: "FIGURE REFLECTION",
  missingPoster: "MISSING POSTER",
};

function clamp(v: number, min: number, max: number) {
  return Math.max(min, Math.min(max, v));
}

function lerp(a: number, b: number, t: number) {
  return a + (b - a) * t;
}

function hitRect(mx: number, my: number, r: Rect) {
  return mx >= r.x && mx <= r.x + r.w && my >= r.y && my <= r.y + r.h;
}

function chooseAnomaly(loop: number): AnomalyId {
  if (loop === 0) return "none";

  const chance = Math.min(0.35 + loop * 0.05, 0.82);
  if (Math.random() > chance) return "none";

  return ANOMALIES[Math.floor(Math.random() * ANOMALIES.length)];
}

function resetLoop(state: RunState) {
  state.playerX = START_X;
  state.camX = 0;
  state.loop += 1;
  state.anomaly = chooseAnomaly(state.loop);
  state.phase = "playing";
  state.message =
    state.loop === 1
      ? "Walk to the end. Decide if the hallway changed."
      : "The hallway resets.";
  state.messageTimer = 2.5;
}

function drawPixelRect(
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  w: number,
  h: number,
  color: string
) {
  ctx.fillStyle = color;
  ctx.fillRect(Math.round(x), Math.round(y), Math.round(w), Math.round(h));
}

function drawText(
  ctx: CanvasRenderingContext2D,
  text: string,
  x: number,
  y: number,
  size = 18,
  color = "#e5e7eb",
  align: CanvasTextAlign = "left"
) {
  ctx.save();
  ctx.font = `${size}px monospace`;
  ctx.textAlign = align;
  ctx.textBaseline = "top";
  ctx.fillStyle = "rgba(0,0,0,0.85)";
  ctx.fillText(text, x + 2, y + 2);
  ctx.fillStyle = color;
  ctx.fillText(text, x, y);
  ctx.restore();
}

function drawButton(
  ctx: CanvasRenderingContext2D,
  r: Rect,
  label: string,
  enabled: boolean
) {
  ctx.save();
  ctx.globalAlpha = enabled ? 1 : 0.35;

  drawPixelRect(ctx, r.x, r.y, r.w, r.h, "#0f172a");
  drawPixelRect(ctx, r.x + 4, r.y + 4, r.w - 8, r.h - 8, "#1e293b");

  ctx.strokeStyle = enabled ? "#e5e7eb" : "#64748b";
  ctx.lineWidth = 3;
  ctx.strokeRect(r.x + 1.5, r.y + 1.5, r.w - 3, r.h - 3);

  drawText(
    ctx,
    label,
    r.x + r.w / 2,
    r.y + 14,
    17,
    enabled ? "#f8fafc" : "#94a3b8",
    "center"
  );

  ctx.restore();
}

function drawMainHallway(
  ctx: CanvasRenderingContext2D,
  state: RunState,
  w: number,
  h: number
) {
  const t = state.globalT;
  const camX = state.camX;

  ctx.save();
  ctx.translate(-camX, 0);

  // --- PALETTES (Hotel Vibe) ---
  const redLights = state.anomaly === "lightsRed";
  
  // Upper Wall (Vintage Wallpaper)
  const wallBase = redLights ? "#260b0e" : "#282a22"; // Bloody red vs Sickly green-gray
  const wallPattern = redLights ? "#3d1318" : "#20221a";
  
  // Lower Wall (Wood Wainscoting)
  const wainscotBase = redLights ? "#140406" : "#1a1512"; // Deep mahogany/black wood
  const wainscotTrim = redLights ? "#29080b" : "#261d18";
  const wainscotShadow = redLights ? "#080102" : "#0d0a08";
  
  // Floor (Hardwood & Carpet Runner)
  const floorWood = redLights ? "#0d0202" : "#0f0b09";
  const carpetBase = redLights ? "#3b0507" : "#541b20"; // Classic dark crimson carpet
  const carpetPattern = redLights ? "#240204" : "#381014";
  const carpetTrim = redLights ? "#5c080d" : "#856430"; // Dull gold
  
  // Lighting
  const lightSource = redLights ? "#fca5a5" : "#fef08a";
  const lightCone = redLights ? "rgba(220, 38, 38, 0.12)" : "rgba(253, 230, 138, 0.08)";
  const lightGlow = redLights ? "rgba(220, 38, 38, 0.25)" : "rgba(253, 230, 138, 0.15)";

  // 1. Base Background (Ceiling area)
  drawPixelRect(ctx, 0, 0, WORLD_W, h, "#02040a");

  // 2. WALLPAPER (Upper Wall)
  ctx.fillStyle = wallBase;
  ctx.fillRect(0, 80, WORLD_W, FLOOR_Y - 80);
  
  // Creepy repeating vertical damask/stripe motif
  ctx.fillStyle = wallPattern;
  for (let x = 0; x < WORLD_W; x += 120) {
    ctx.fillRect(x + 20, 80, 15, FLOOR_Y - 80);
    ctx.fillRect(x + 45, 80, 4, FLOOR_Y - 80);
    ctx.fillRect(x + 80, 80, 15, FLOOR_Y - 80);
    ctx.fillRect(x, 150, 120, 6);
    ctx.fillRect(x, 220, 120, 6);
  }

  // 3. WAINSCOTING (Lower Wall Wood Paneling)
  const wainY = FLOOR_Y - 130;
  ctx.fillStyle = wainscotBase;
  ctx.fillRect(0, wainY, WORLD_W, 130);

  ctx.strokeStyle = wainscotTrim;
  ctx.lineWidth = 4;
  for (let x = 10; x < WORLD_W; x += 110) {
    // Outer panel
    ctx.strokeStyle = wainscotShadow;
    ctx.strokeRect(x, wainY + 20, 90, 90);
    // Inner panel
    ctx.strokeStyle = wainscotTrim;
    ctx.strokeRect(x + 12, wainY + 32, 66, 66);
  }

  // Chair Rail (Top of wood paneling)
  ctx.fillStyle = wainscotShadow;
  ctx.fillRect(0, wainY, WORLD_W, 12);
  ctx.fillStyle = wainscotTrim;
  ctx.fillRect(0, wainY + 2, WORLD_W, 4);

  // Baseboard
  ctx.fillStyle = wainscotShadow;
  ctx.fillRect(0, FLOOR_Y - 18, WORLD_W, 18);
  ctx.fillStyle = wainscotBase;
  ctx.fillRect(0, FLOOR_Y - 16, WORLD_W, 12);

  // Crown Molding (Ceiling junction)
  ctx.fillStyle = wainscotBase;
  ctx.fillRect(0, 80, WORLD_W, 16);
  ctx.fillStyle = wainscotTrim;
  ctx.fillRect(0, 92, WORLD_W, 4);

  // 4. FLOOR & CARPET RUNNER
  ctx.fillStyle = floorWood;
  ctx.fillRect(0, FLOOR_Y, WORLD_W, h - FLOOR_Y);

  const floorH = h - FLOOR_Y;
  const carpetY = FLOOR_Y + floorH * 0.08;
  const carpetH = floorH * 0.92;

  // Carpet Base
  ctx.fillStyle = carpetBase;
  ctx.fillRect(0, carpetY, WORLD_W, carpetH);

  // Carpet Gold Trim
  ctx.fillStyle = carpetTrim;
  ctx.fillRect(0, carpetY, WORLD_W, floorH * 0.06);

  // Creepy Hotel Carpet Pattern (Interlocking Diamonds)
  ctx.strokeStyle = carpetPattern;
  ctx.lineWidth = 4;
  for (let x = -100; x < WORLD_W + 200; x += 180) {
    // Outer Diamond
    ctx.beginPath();
    ctx.moveTo(x, carpetY + carpetH * 0.5);
    ctx.lineTo(x + 90, carpetY);
    ctx.lineTo(x + 180, carpetY + carpetH * 0.5);
    ctx.lineTo(x + 90, h);
    ctx.closePath();
    ctx.stroke();

    // Inner Diamond
    ctx.beginPath();
    ctx.moveTo(x + 36, carpetY + carpetH * 0.5);
    ctx.lineTo(x + 90, carpetY + carpetH * 0.25);
    ctx.lineTo(x + 144, carpetY + carpetH * 0.5);
    ctx.lineTo(x + 90, h - carpetH * 0.1);
    ctx.closePath();
    ctx.stroke();
  }

  // 5. ATMOSPHERIC LIGHTING (Harsh Cones)
  for (let x = 180; x < WORLD_W; x += 430) {
    const flicker = Math.sin(t * 10 + x * 0.02) > 0.92 ? 0.35 : 1;
    ctx.globalAlpha = flicker;

    // Light Cone (Spreading down the wall and floor)
    const coneGrad = ctx.createLinearGradient(0, 80, 0, FLOOR_Y + 80);
    coneGrad.addColorStop(0, lightCone);
    coneGrad.addColorStop(1, "transparent");

    ctx.fillStyle = coneGrad;
    ctx.beginPath();
    ctx.moveTo(x - 35, 96);
    ctx.lineTo(x + 35, 96);
    ctx.lineTo(x + 280, h); // Spreads out wide
    ctx.lineTo(x - 280, h);
    ctx.fill();

    // Wall Reflection / Hotspot
    ctx.fillStyle = lightGlow;
    ctx.beginPath();
    ctx.ellipse(x, 180, 80, 120, 0, 0, Math.PI * 2);
    ctx.fill();

    // Ceiling Fixture
    drawPixelRect(ctx, x - 54, 88, 108, 14, "#02040a");
    drawPixelRect(ctx, x - 42, 100, 84, 8, lightSource);

    ctx.globalAlpha = 1;
  }

  // 6. DRAW OBJECTS (DOORS, POSTERS, ETC)
  drawNormalDoor(ctx, 430, FLOOR_Y - 210, false);
  drawNormalDoor(ctx, 1180, FLOOR_Y - 210, false);
  drawNormalDoor(ctx, 1910, FLOOR_Y - 210, false);

  // Add Hotel Room Plaques next to doors
  [430, 1180, 1910].forEach((dx, i) => {
    ctx.fillStyle = carpetTrim; // Gold plaque
    ctx.fillRect(dx + 130, FLOOR_Y - 140, 24, 32);
    ctx.fillStyle = wainscotShadow; // Dark center
    ctx.fillRect(dx + 133, FLOOR_Y - 137, 18, 26);
    ctx.fillStyle = carpetTrim; // Fake text
    ctx.fillRect(dx + 137, FLOOR_Y - 128, 10, 4);
  });

  drawPoster(ctx, 720, 190, state.anomaly === "posterEyes");
  drawPoster(ctx, 1550, 190, false);
  drawClock(ctx, 1020, 170, state.anomaly === "wrongClock", t);
  drawMirror(ctx, 2260, 175, state.anomaly === "figureReflection", t);

  if (state.anomaly !== "missingPoster") {
    drawPoster(ctx, 2480, 190, false);
  }

  drawExitArea(ctx, state);

  // Pop camera translation so vignette draws in fixed screen-space
  ctx.restore(); 

  // 7. CLAUSTROPHOBIC VIGNETTE OVERLAY
  // Frames the screen in darkness, heavily amplifying the horror vibe
  const vigGrad = ctx.createRadialGradient(w / 2, h / 2, h / 3, w / 2, h / 2, h * 0.9);
  vigGrad.addColorStop(0, "transparent");
  vigGrad.addColorStop(1, redLights ? "rgba(40, 0, 0, 0.85)" : "rgba(5, 7, 12, 0.9)");
  
  ctx.fillStyle = vigGrad;
  ctx.fillRect(0, 0, w, h);
}
//---------------------------------------------//

function drawNormalDoor(
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  cracked: boolean
) {
  // --- PALETTE: Dark Hotel Wood ---
  const frameColor = "#1a0f0a";   // Almost black wood
  const doorBase = "#2d1b14";    // Deep mahogany
  const panelShadow = "#140a07"; // Recessed paneling
  const woodHighlight = "#3d2a22"; // Edge highlight
  const brass = "#b89130";       // Tarnished gold
  const hardwareShadow = "#45320d";

  // 1. OUTER FRAME
  drawPixelRect(ctx, x - 4, y - 4, 138, 218, frameColor); // Extra girth for the frame
  
  // 2. MAIN DOOR SURFACE
  drawPixelRect(ctx, x, y, 130, 210, doorBase);

  // 3. RECESSED PANELS (Top & Bottom)
  const drawPanel = (px: number, py: number, pw: number, ph: number) => {
    // Panel deep shadow
    drawPixelRect(ctx, px, py, pw, ph, panelShadow);
    // Bevel highlights (adds 3D depth)
    ctx.fillStyle = woodHighlight;
    ctx.fillRect(px, py + ph - 2, pw, 2); // Bottom lip
    ctx.fillRect(px + pw - 2, py, 2, ph); // Right lip
  };

  drawPanel(x + 18, y + 20, 94, 75);  // Upper panel
  drawPanel(x + 18, y + 110, 94, 85); // Lower panel

  // 4. HARDWARE (The Knob & Plate)
  // Backplate
  drawPixelRect(ctx, x + 105, y + 105, 12, 24, hardwareShadow);
  // The Knob
  ctx.fillStyle = brass;
  ctx.beginPath();
  ctx.arc(x + 111, y + 112, 6, 0, Math.PI * 2);
  ctx.fill();
  // Keyhole detail
  ctx.fillStyle = "#000";
  ctx.fillRect(x + 110, y + 120, 2, 4);

  // 5. THE PEEPHOLE (Essential for the "creepy apartment" vibe)
  ctx.fillStyle = hardwareShadow;
  ctx.beginPath();
  ctx.arc(x + 65, y + 50, 4, 0, Math.PI * 2);
  ctx.fill();
  ctx.fillStyle = "#111"; // The glass lens
  ctx.beginPath();
  ctx.arc(x + 65, y + 50, 2, 0, Math.PI * 2);
  ctx.fill();

  // 6. THE CRACK (If active)
  if (cracked) {
    // Draw a "shattered wood" void
    ctx.strokeStyle = "#000";
    ctx.lineJoin = "round";
    ctx.lineWidth = 4;
    ctx.beginPath();
    ctx.moveTo(x + 65, y + 20);
    ctx.lineTo(x + 75, y + 80);
    ctx.lineTo(x + 60, y + 130);
    ctx.lineTo(x + 70, y + 200);
    ctx.stroke();

    // The darkness leaking through
    ctx.fillStyle = "rgba(0, 0, 0, 0.95)";
    ctx.beginPath();
    ctx.moveTo(x + 65, y + 60);
    ctx.quadraticCurveTo(x + 85, y + 100, x + 65, y + 140);
    ctx.quadraticCurveTo(x + 50, y + 100, x + 65, y + 60);
    ctx.fill();

    // Subtle highlight on the edge of the crack
    ctx.strokeStyle = "rgba(255, 255, 255, 0.1)";
    ctx.lineWidth = 1;
    ctx.stroke();
  }
}
//-------------------------//
function drawPoster(
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  eyes: boolean
) {
  // --- PALETTE: Antique & Grimy ---
  const frameColor = "#1a0f0a";   // Dark wood
  const frameDetail = "#3d2a22";  // Frame highlights
  const paperColor = "#7d6b54";   // Faded sepia paper/canvas
  const inkColor = "#261a15";     // Dark, muddy silhouette
  const eyeGlow = "#ff4d4d";      // Blood red pupils

  // 1. THE HEAVY WOODEN FRAME
  // Outer frame shadow
  drawPixelRect(ctx, x - 2, y - 2, 124, 154, "#000"); 
  // Main frame body
  drawPixelRect(ctx, x, y, 120, 150, frameColor);
  // Beveled highlight (Top and Left)
  drawPixelRect(ctx, x + 2, y + 2, 116, 2, frameDetail);
  drawPixelRect(ctx, x + 2, y + 2, 2, 146, frameDetail);

  // 2. THE CANVAS AREA
  // Recessed shadow
  drawPixelRect(ctx, x + 10, y + 10, 100, 130, "#000");
  // The actual "art" surface
  drawPixelRect(ctx, x + 14, y + 14, 92, 122, paperColor);

  // 3. THE "SUBJECT" (A creepy silhouette)
  // Shoulders/Torso
  ctx.fillStyle = inkColor;
  ctx.beginPath();
  ctx.moveTo(x + 25, y + 136);
  ctx.quadraticCurveTo(x + 60, y + 60, x + 95, y + 136);
  ctx.fill();
  
  // The Head
  ctx.beginPath();
  ctx.arc(x + 60, y + 75, 18, 0, Math.PI * 2);
  ctx.fill();

  // 4. THE ANOMALY: EYES
  if (eyes) {
    // Make the eye sockets dark voids first
    ctx.fillStyle = "#000";
    ctx.beginPath();
    ctx.ellipse(x + 52, y + 75, 5, 7, 0, 0, Math.PI * 2);
    ctx.ellipse(x + 68, y + 75, 5, 7, 0, 0, Math.PI * 2);
    ctx.fill();

    // The glowing pupils
    ctx.fillStyle = eyeGlow;
    ctx.shadowBlur = 8;
    ctx.shadowColor = eyeGlow;
    drawPixelRect(ctx, x + 51, y + 74, 3, 3, eyeGlow);
    drawPixelRect(ctx, x + 67, y + 74, 3, 3, eyeGlow);
    
    // Reset shadow for subsequent draws
    ctx.shadowBlur = 0;
  } else {
    // Normal state: very faint, dull "stains" where eyes would be
    ctx.fillStyle = "rgba(0,0,0,0.2)";
    drawPixelRect(ctx, x + 50, y + 74, 4, 4, "rgba(0,0,0,0.1)");
    drawPixelRect(ctx, x + 66, y + 74, 4, 4, "rgba(0,0,0,0.1)");
  }

  // 5. WEATHERING (Cracks/Stains on the poster)
  ctx.strokeStyle = "rgba(0,0,0,0.15)";
  ctx.lineWidth = 1;
  ctx.beginPath();
  ctx.moveTo(x + 14, y + 40);
  ctx.lineTo(x + 40, y + 25);
  ctx.moveTo(x + 92, y + 100);
  ctx.lineTo(x + 106, y + 115);
  ctx.stroke();

  // 6. CAPTION AREA (The "Warning" or "Plaque" text)
  drawPixelRect(ctx, x + 30, y + 120, 60, 4, inkColor); // Main text line
  drawPixelRect(ctx, x + 40, y + 128, 40, 3, "rgba(0,0,0,0.3)"); // Subtext
}
//--------------//
function drawClock(
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  wrong: boolean,
  t: number
) {
  ctx.save();
  ctx.translate(x, y);

  // --- PALETTE ---
  const woodFrame = "#1a0f0a";
  const brassBezel = "#856430";
  const agedPaper = "#d4c4a1";
  const inkColor = "#1a1a1a";
  const anomalyRed = "#991b1b";

  // 1. DROP SHADOW (On the wall)
  ctx.fillStyle = "rgba(0,0,0,0.4)";
  ctx.beginPath();
  ctx.arc(4, 4, 44, 0, Math.PI * 2);
  ctx.fill();

  // 2. OUTER WOODEN CASE
  ctx.fillStyle = woodFrame;
  ctx.beginPath();
  ctx.arc(0, 0, 44, 0, Math.PI * 2);
  ctx.fill();

  // 3. BRASS INNER BEZEL
  ctx.fillStyle = brassBezel;
  ctx.beginPath();
  ctx.arc(0, 0, 38, 0, Math.PI * 2);
  ctx.fill();

  // 4. CLOCK FACE (Aged Parchment)
  ctx.fillStyle = agedPaper;
  ctx.beginPath();
  ctx.arc(0, 0, 34, 0, Math.PI * 2);
  ctx.fill();

  // 5. ROMAN NUMERALS / TICKS
  ctx.strokeStyle = "rgba(0,0,0,0.2)";
  ctx.lineWidth = 1;
  for (let i = 0; i < 12; i++) {
    const angle = (i * Math.PI) / 6;
    ctx.beginPath();
    ctx.moveTo(Math.cos(angle) * 28, Math.sin(angle) * 28);
    ctx.lineTo(Math.cos(angle) * 32, Math.sin(angle) * 32);
    ctx.stroke();
  }

  // 6. THE HANDS
  // If wrong, hands spin at different, frantic speeds and jitter
  const speedMult = wrong ? 20 : 1;
  const jitter = wrong ? Math.sin(t * 50) * 0.1 : 0;
  
  const hourAngle = (wrong ? t * 0.5 : -0.8) + jitter;
  const minAngle = (wrong ? t * 4 : 0.7) + (jitter * 2);

  ctx.lineCap = "round";

  // Hour Hand (Short & Thick)
  ctx.strokeStyle = wrong ? anomalyRed : inkColor;
  ctx.lineWidth = 4;
  ctx.beginPath();
  ctx.moveTo(0, 0);
  ctx.lineTo(Math.cos(hourAngle) * 18, Math.sin(hourAngle) * 18);
  ctx.stroke();

  // Minute Hand (Long & Thin)
  ctx.lineWidth = 2;
  ctx.beginPath();
  ctx.moveTo(0, 0);
  ctx.lineTo(Math.cos(minAngle) * 26, Math.sin(minAngle) * 26);
  ctx.stroke();

  // Center Cap
  ctx.fillStyle = brassBezel;
  ctx.beginPath();
  ctx.arc(0, 0, 4, 0, Math.PI * 2);
  ctx.fill();

  // 7. GLASS GLARE (Overlay)
  const glare = ctx.createLinearGradient(-30, -30, 30, 30);
  glare.addColorStop(0, "rgba(255, 255, 255, 0.2)");
  glare.addColorStop(0.5, "transparent");
  glare.addColorStop(1, "rgba(255, 255, 255, 0.05)");
  ctx.fillStyle = glare;
  ctx.beginPath();
  ctx.arc(0, 0, 34, 0, Math.PI * 2);
  ctx.fill();

  // 8. ANOMALY: The "13" or Cracks
  if (wrong) {
    // Faintly draw a "13" behind the hands
    ctx.globalAlpha = 0.6;
    drawText(ctx, "XIII", -14, -5, 14, anomalyRed, "left");
    ctx.globalAlpha = 1;

    // Draw a spiderweb crack on the glass
    ctx.strokeStyle = "rgba(255,255,255,0.4)";
    ctx.lineWidth = 1;
    ctx.beginPath();
    ctx.moveTo(10, -34);
    ctx.lineTo(0, -10);
    ctx.lineTo(-20, -5);
    ctx.moveTo(0, -10);
    ctx.lineTo(5, 15);
    ctx.stroke();
  }

  ctx.restore();
}
///-------------------------------//
function drawMirror(
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  figure: boolean,
  t: number
) {
  // --- PALETTE: Warm, Heavy, Antique ---
  const frameWood = "#1a0f0a";      // Darkest mahogany
  const frameDetail = "#2d1b14";    // Mid-tone wood
  const brassTrim = "#856430";      // Tarnished gold/brass (matches carpet/clock)
  const glassVoid = "#0a0604";      // A deep, brownish-black void
  const surfaceReflection = "#1a1210"; // Very faint warm tint

  // 1. WALL SHADOW
  drawPixelRect(ctx, x + 6, y + 6, 152, 172, "rgba(0,0,0,0.6)");

  // 2. THE ORNATE WOODEN FRAME
  // Outer thick wood
  drawPixelRect(ctx, x, y, 150, 170, frameWood);
  
  // Carved detail/Beveling
  drawPixelRect(ctx, x + 4, y + 4, 142, 162, frameDetail);
  
  // The Brass Inner Inlay (Matches the clock bezel)
  drawPixelRect(ctx, x + 10, y + 10, 130, 150, brassTrim);
  drawPixelRect(ctx, x + 12, y + 12, 126, 146, "#000"); // Depth gap

  // 3. THE GLASS
  const glassX = x + 14;
  const glassY = y + 14;
  const glassW = 122;
  const glassH = 142;

  const grd = ctx.createLinearGradient(glassX, glassY, glassX + glassW, glassY + glassH);
  grd.addColorStop(0, surfaceReflection);
  grd.addColorStop(0.5, glassVoid);
  grd.addColorStop(1, "#000");
  ctx.fillStyle = grd;
  ctx.fillRect(glassX, glassY, glassW, glassH);

  // 4. FOXING (Mercury Rot)
  // Aged mirrors in old buildings get dark, "moldy" looking spots
  ctx.fillStyle = "rgba(0, 0, 0, 0.7)";
  for (let i = 0; i < 12; i++) {
    const s = 3 + (i % 4);
    const rx = (Math.sin(i * 99) * 0.5 + 0.5) * glassW;
    const ry = (Math.cos(i * 77) * 0.5 + 0.5) * glassH;
    // Concentrate rot on the edges
    if (i < 8) {
      drawPixelRect(ctx, glassX + (i % 2 === 0 ? 2 : glassW - 6), glassY + (i * 15), s, s, "#000");
    } else {
      drawPixelRect(ctx, glassX + rx, glassY + ry, s, s, "rgba(0,0,0,0.4)");
    }
  }

  // 5. WARM SURFACE GLARE
  // Mimics the yellowish conical lights from the hallway
  ctx.strokeStyle = "rgba(253, 230, 138, 0.05)"; 
  ctx.lineWidth = 3;
  ctx.beginPath();
  ctx.moveTo(glassX + 10, glassY);
  ctx.lineTo(glassX + glassW - 20, glassY + glassH);
  ctx.stroke();

  // 6. THE ANOMALY: THE FIGURE
  if (figure) {
    const sway = Math.sin(t * 1.2) * 4;
    const breathe = Math.sin(t * 2) * 1.5;
    
    ctx.save();
    ctx.translate(sway, breathe);
    
    // Shadowy Silhouette (Slightly transparent to feel like a reflection)
    ctx.globalAlpha = 0.9;
    ctx.fillStyle = "#020100";
    
    // Head (More "wrong" than a human shape)
    ctx.beginPath();
    ctx.ellipse(glassX + 61, glassY + 45, 12, 18, 0, 0, Math.PI * 2);
    ctx.fill();
    
    // Spindly Torso
    ctx.fillRect(glassX + 48, glassY + 63, 26, 85);
    
    // Glowing Eyes (Matches the red anomaly if needed, or pale yellow)
    const eyeColor = "#fef08a"; // Pale sickly yellow
    const eyePulse = 0.4 + Math.abs(Math.sin(t * 4)) * 0.6;
    ctx.fillStyle = eyeColor;
    ctx.globalAlpha = eyePulse;
    drawPixelRect(ctx, glassX + 56, glassY + 42, 2, 2, eyeColor);
    drawPixelRect(ctx, glassX + 64, glassY + 42, 2, 2, eyeColor);
    
    ctx.restore();
    ctx.globalAlpha = 1;
  }
}
//-------

function drawExitArea(ctx: CanvasRenderingContext2D, state: RunState) {
  const x = EXIT_X;
  const saysStay = state.anomaly === "exitStay";

  // --- PALETTE ---
  const signFrame = "#1a1a1a";
  const signGreen = "#064e3b"; // Dark green plastic
  const signRed = "#7f1d1d";   // Blood red plastic
  const textGreen = "#4ade80"; // Glowing green
  const textRed = "#f87171";   // Glowing red
  const brassHardware = "#856430";

  // 1. HEADER BEAM (Alcove entrance)
  // Dark wood beam that frames the exit section
  drawPixelRect(ctx, x - 100, 80, 340, 20, "#1a0f0a");
  drawPixelRect(ctx, x - 100, 96, 340, 4, "#2d1b14");

  // 2. THE INDUSTRIAL EXIT SIGN
  const signX = x + 15;
  const signY = 115;
  
  // Sign Housing
  drawPixelRect(ctx, x + 75, 100, 10, 15, "#111"); // Mounting arm
  drawPixelRect(ctx, signX, signY, 130, 45, signFrame);
  
  // Glow effect behind the sign
  const signGlow = ctx.createRadialGradient(signX + 65, signY + 22, 10, signX + 65, signY + 22, 60);
  signGlow.addColorStop(0, saysStay ? "rgba(220, 38, 38, 0.2)" : "rgba(22, 163, 74, 0.2)");
  signGlow.addColorStop(1, "transparent");
  ctx.fillStyle = signGlow;
  ctx.fillRect(signX - 40, signY - 40, 210, 125);

  // Sign Face
  drawPixelRect(ctx, signX + 4, signY + 4, 122, 37, saysStay ? signRed : signGreen);
  
  // Backlit Text
  drawText(
    ctx,
    saysStay ? "STAY" : "EXIT",
    signX + 65,
    signY + 12,
    24,
    saysStay ? textRed : textGreen,
    "center"
  );

  // 3. THE GRAND EXIT DOOR
  const doorX = x + 12;
  const doorY = FLOOR_Y - 240;
  const doorW = 140;
  const doorH = 240;

  // Door Frame (Heavy Wood)
  drawPixelRect(ctx, doorX - 6, doorY - 6, doorW + 12, doorH + 6, "#0a0604");
  
  // Main Door Surface
  drawPixelRect(ctx, doorX, doorY, doorW, doorH, "#2d1b14");
  
  // Inset Panels (Beveled)
  const pW = doorW - 30;
  const pH = (doorH - 60) / 2;
  // Top Panel
  drawPixelRect(ctx, doorX + 15, doorY + 20, pW, pH, "#1a0f0a");
  drawPixelRect(ctx, doorX + 15, doorY + 20 + pH - 2, pW, 2, "#3d2a22"); // Bottom highlight
  // Bottom Panel
  drawPixelRect(ctx, doorX + 15, doorY + 40 + pH, pW, pH, "#1a0f0a");
  drawPixelRect(ctx, doorX + 15, doorY + 40 + (pH * 2) - 2, pW, 2, "#3d2a22");

  // 4. THE PUSH BAR (Industrial Fire Door Hardware)
  drawPixelRect(ctx, doorX + 10, doorY + 130, doorW - 20, 12, "#111"); // Bar bracket
  drawPixelRect(ctx, doorX + 15, doorY + 132, doorW - 30, 6, brassHardware); // The actual brass bar

  // 5. THE FLOOR INSCRIPTION
  // Instead of floating text, this is a brass inlay in the hardwood/carpet
  const plaqueY = FLOOR_Y + 15;
  ctx.globalAlpha = 0.6;
  
  // Brass plate
  drawPixelRect(ctx, x + 20, plaqueY, 120, 30, "#45320d");
  drawPixelRect(ctx, x + 22, plaqueY + 2, 116, 26, "#856430");
  
  drawText(
    ctx, 
    "FINAL DECISION", 
    x + 80, 
    plaqueY + 7, 
    14, 
    "#1a0f0a", 
    "center"
  );
  
  ctx.globalAlpha = 1;
}
//-------------------//


function drawHallwayAnomaly1_PosterEyes(
  ctx: CanvasRenderingContext2D,
  state: RunState
) {
  if (state.anomaly !== "posterEyes") return;
}

function drawHallwayAnomaly2_ExitStay(
  ctx: CanvasRenderingContext2D,
  state: RunState
) {
  if (state.anomaly !== "exitStay") return;
}

function drawHallwayAnomaly3_LongShadow(
  ctx: CanvasRenderingContext2D,
  state: RunState
) {
  if (state.anomaly !== "longShadow") return;

  ctx.save();
  ctx.translate(-state.camX, 0);

  ctx.globalAlpha = 0.72;
  ctx.fillStyle = "rgba(0,0,0,0.72)";
  ctx.beginPath();
  ctx.moveTo(1340, FLOOR_Y);
  ctx.lineTo(1700, FLOOR_Y + 140);
  ctx.lineTo(1540, FLOOR_Y + 160);
  ctx.lineTo(1260, FLOOR_Y);
  ctx.closePath();
  ctx.fill();

  ctx.restore();
}

function drawHallwayAnomaly4_WrongClock(
  ctx: CanvasRenderingContext2D,
  state: RunState
) {
  if (state.anomaly !== "wrongClock") return;
}

function drawHallwayAnomaly5_DoorCrack(
  ctx: CanvasRenderingContext2D,
  state: RunState
) {
  if (state.anomaly !== "doorCrack") return;

  ctx.save();
  ctx.translate(-state.camX, 0);
  drawNormalDoor(ctx, 1180, FLOOR_Y - 210, true);
  ctx.restore();
}

function drawHallwayAnomaly6_LightsRed(
  ctx: CanvasRenderingContext2D,
  state: RunState
) {
  if (state.anomaly !== "lightsRed") return;
}

function drawHallwayAnomaly7_ExtraDoor(
  ctx: CanvasRenderingContext2D,
  state: RunState
) {
  if (state.anomaly !== "extraDoor") return;

  ctx.save();
  ctx.translate(-state.camX, 0);
  drawNormalDoor(ctx, 620, FLOOR_Y - 210, false);

  drawText(ctx, "404", 685, FLOOR_Y - 184, 18, "#ef4444", "center");

  ctx.restore();
}

function drawHallwayAnomaly8_FloorMessage(
  ctx: CanvasRenderingContext2D,
  state: RunState
) {
  if (state.anomaly !== "floorMessage") return;

  ctx.save();
  ctx.translate(-state.camX, 0);

  drawText(ctx, "TURN BACK", 1480, FLOOR_Y + 78, 24, "#ef4444", "center");

  ctx.globalAlpha = 0.25 + Math.sin(state.globalT * 3) * 0.08;
  drawPixelRect(ctx, 1410, FLOOR_Y + 112, 140, 4, "#ef4444");
  ctx.globalAlpha = 1;

  ctx.restore();
}

function drawHallwayAnomaly9_FigureReflection(
  ctx: CanvasRenderingContext2D,
  state: RunState
) {
  if (state.anomaly !== "figureReflection") return;
}

function drawHallwayAnomaly10_MissingPoster(
  ctx: CanvasRenderingContext2D,
  state: RunState
) {
  if (state.anomaly !== "missingPoster") return;

  ctx.save();
  ctx.translate(-state.camX, 0);

  drawPixelRect(ctx, 2480, 190, 120, 150, "rgba(0,0,0,0.25)");
  drawPixelRect(ctx, 2500, 212, 80, 2, "rgba(148,163,184,0.25)");
  drawPixelRect(ctx, 2500, 312, 80, 2, "rgba(148,163,184,0.18)");
  drawText(ctx, "gone", 2540, 250, 15, "#64748b", "center");

  ctx.restore();
}

function drawPlayer(ctx: CanvasRenderingContext2D, state: RunState) {
  const x = state.playerX - state.camX;
  const y = FLOOR_Y - 70;
  const walk = Math.sin(state.globalT * 10) * 4;

  ctx.save();

  ctx.fillStyle = "rgba(0,0,0,0.45)";
  ctx.beginPath();
  ctx.ellipse(x, FLOOR_Y + 5, 38, 10, 0, 0, Math.PI * 2);
  ctx.fill();

  drawPixelRect(ctx, x - 15, y + 20, 30, 42, "#0f172a");
  drawPixelRect(ctx, x - 12, y + 24, 24, 34, "#334155");

  drawPixelRect(ctx, x - 12, y, 24, 24, "#e5e7eb");
  drawPixelRect(ctx, x - 8, y + 8, 5, 5, "#020617");
  drawPixelRect(ctx, x + 4, y + 8, 5, 5, "#020617");
  drawPixelRect(ctx, x - 5, y + 17, 10, 3, "#020617");

  drawPixelRect(ctx, x - 18, y + 26, 8, 28, "#1e293b");
  drawPixelRect(ctx, x + 10, y + 26, 8, 28, "#1e293b");

  drawPixelRect(ctx, x - 12, y + 58, 8, 20 + walk, "#111827");
  drawPixelRect(ctx, x + 4, y + 58, 8, 20 - walk, "#111827");

  ctx.restore();
}

function drawHUD(ctx: CanvasRenderingContext2D, state: RunState, w: number, h: number) {
  drawPixelRect(ctx, 0, 0, w, 72, "rgba(2,6,23,0.9)");
  drawPixelRect(ctx, 0, 70, w, 3, "#334155");

  drawText(ctx, "ANOMALY HALLWAY", 24, 18, 22, "#f8fafc");
  drawText(
    ctx,
    `LOOP ${state.loop + 1} / ${WIN_NEEDED}    CORRECT ${state.correct}    MISTAKES ${state.mistakes}/${MAX_MISTAKES}`,
    24,
    45,
    15,
    "#cbd5e1"
  );

  const atExit = state.playerX >= EXIT_X - 80 && state.phase === "playing";

  drawButton(ctx, state.buttons.yes, "YES - ANOMALY", atExit);
  drawButton(ctx, state.buttons.no, "NO - NORMAL", atExit);

  if (!atExit && state.phase === "playing") {
    drawText(
      ctx,
      "Walk to the exit door to decide.",
      w - 32,
      20,
      15,
      "#94a3b8",
      "right"
    );
  }

  if (state.messageTimer > 0) {
    drawPixelRect(ctx, w / 2 - 330, h - 88, 660, 48, "rgba(2,6,23,0.92)");
    ctx.strokeStyle = "#475569";
    ctx.lineWidth = 2;
    ctx.strokeRect(w / 2 - 330, h - 88, 660, 48);

    drawText(ctx, state.message, w / 2, h - 75, 17, "#e5e7eb", "center");
  }

  if (state.phase === "result") {
    drawPixelRect(ctx, w / 2 - 270, h / 2 - 76, 540, 152, "rgba(2,6,23,0.95)");
    ctx.strokeStyle = "#e5e7eb";
    ctx.lineWidth = 3;
    ctx.strokeRect(w / 2 - 270, h / 2 - 76, 540, 152);

    drawText(ctx, state.message, w / 2, h / 2 - 42, 21, "#f8fafc", "center");
    drawText(
      ctx,
      "Press SPACE to continue.",
      w / 2,
      h / 2 + 18,
      17,
      "#cbd5e1",
      "center"
    );
  }

  if (state.phase === "gameover") {
    drawPixelRect(ctx, 0, 0, w, h, "rgba(0,0,0,0.78)");
    drawText(ctx, "THE HALLWAY KEPT YOU.", w / 2, h / 2 - 48, 32, "#ef4444", "center");
    drawText(ctx, "Press R to restart.", w / 2, h / 2 + 8, 18, "#e5e7eb", "center");
  }

  if (state.phase === "win") {
    drawPixelRect(ctx, 0, 0, w, h, "rgba(0,0,0,0.72)");
    drawText(ctx, "YOU REACHED THE REAL EXIT.", w / 2, h / 2 - 48, 30, "#bbf7d0", "center");
    drawText(ctx, "Press R to play again.", w / 2, h / 2 + 8, 18, "#e5e7eb", "center");
  }

  if (process.env.NODE_ENV !== "production") {
    drawText(
      ctx,
      `DEV: ${anomalyNames[state.anomaly]}`,
      24,
      h - 28,
      14,
      "#64748b"
    );
  }
}

function drawVignette(ctx: CanvasRenderingContext2D, w: number, h: number) {
  const grd = ctx.createRadialGradient(w / 2, h / 2, 120, w / 2, h / 2, w * 0.72);
  grd.addColorStop(0, "rgba(0,0,0,0)");
  grd.addColorStop(0.7, "rgba(0,0,0,0.15)");
  grd.addColorStop(1, "rgba(0,0,0,0.85)");

  ctx.fillStyle = grd;
  ctx.fillRect(0, 0, w, h);
}

function drawStatic(ctx: CanvasRenderingContext2D, state: RunState, w: number, h: number) {
  const intensity = 0.018 + state.mistakes * 0.012;

  ctx.save();
  ctx.globalAlpha = intensity;

  for (let i = 0; i < 180; i++) {
    const x = Math.random() * w;
    const y = Math.random() * h;
    const s = Math.random() * 3 + 1;
    ctx.fillStyle = Math.random() > 0.5 ? "#ffffff" : "#000000";
    ctx.fillRect(x, y, s, s);
  }

  ctx.restore();
}

function decide(state: RunState, pickedAnomaly: boolean) {
  if (state.phase !== "playing") return;
  if (state.playerX < EXIT_X - 80) return;

  const actualAnomaly = state.anomaly !== "none";
  const correct = pickedAnomaly === actualAnomaly;

  state.phase = "result";

  if (correct) {
    state.correct += 1;

    if (state.correct >= WIN_NEEDED) {
      state.phase = "win";
      state.message = "You found the pattern.";
      return;
    }

    state.message = actualAnomaly
      ? `Correct. It was: ${anomalyNames[state.anomaly]}.`
      : "Correct. The hallway was normal.";
  } else {
    state.mistakes += 1;

    if (state.mistakes >= MAX_MISTAKES) {
      state.phase = "gameover";
      state.message = "Too many wrong answers.";
      return;
    }

    state.message = actualAnomaly
      ? `Wrong. You missed: ${anomalyNames[state.anomaly]}.`
      : "Wrong. There was no anomaly.";
  }
}

function restart(state: RunState) {
  state.playerX = START_X;
  state.camX = 0;
  state.loop = 0;
  state.correct = 0;
  state.mistakes = 0;
  state.anomaly = chooseAnomaly(0);
  state.phase = "playing";
  state.message = "Walk to the end. Decide if the hallway changed.";
  state.messageTimer = 3;
}

export default function AnomalyHallwayGame() {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const keysRef = useRef<Keys>({
    left: false,
    right: false,
    a: false,
    d: false,
  });

  const stateRef = useRef<RunState>({
    playerX: START_X,
    playerY: FLOOR_Y,
    camX: 0,
    loop: 0,
    correct: 0,
    mistakes: 0,
    anomaly: "none",
    phase: "playing",
    message: "Walk to the end. Decide if the hallway changed.",
    messageTimer: 3,
    globalT: 0,
    buttons: {
      yes: { x: 0, y: 0, w: 170, h: 52 },
      no: { x: 0, y: 0, w: 170, h: 52 },
    },
  });

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    let raf = 0;
    let last = performance.now();

    let cssW = 1;
    let cssH = 1;

    const resize = () => {
      const parent = canvas.parentElement;
      const rect = parent?.getBoundingClientRect();

      cssW = Math.max(1, rect?.width || window.innerWidth);
      cssH = Math.max(1, rect?.height || window.innerHeight);

      const dpr = Math.max(1, window.devicePixelRatio || 1);

      canvas.width = Math.floor(cssW * dpr);
      canvas.height = Math.floor(cssH * dpr);
      canvas.style.width = `${cssW}px`;
      canvas.style.height = `${cssH}px`;

      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);

      const state = stateRef.current;
      state.buttons.yes = { x: cssW - 382, y: cssH - 72, w: 170, h: 52 };
      state.buttons.no = { x: cssW - 196, y: cssH - 72, w: 170, h: 52 };
    };

    resize();
    window.addEventListener("resize", resize);

    const onKeyDown = (e: KeyboardEvent) => {
      const keys = keysRef.current;
      const state = stateRef.current;

      if (e.key === "ArrowLeft") keys.left = true;
      if (e.key === "ArrowRight") keys.right = true;
      if (e.key.toLowerCase() === "a") keys.a = true;
      if (e.key.toLowerCase() === "d") keys.d = true;

      if (e.key === " " && state.phase === "result") {
        resetLoop(state);
      }

      if (e.key.toLowerCase() === "r") {
        restart(state);
      }

      if (e.key.toLowerCase() === "y") {
        decide(state, true);
      }

      if (e.key.toLowerCase() === "n") {
        decide(state, false);
      }
    };

    const onKeyUp = (e: KeyboardEvent) => {
      const keys = keysRef.current;

      if (e.key === "ArrowLeft") keys.left = false;
      if (e.key === "ArrowRight") keys.right = false;
      if (e.key.toLowerCase() === "a") keys.a = false;
      if (e.key.toLowerCase() === "d") keys.d = false;
    };

    const onPointerDown = (e: PointerEvent) => {
      const rect = canvas.getBoundingClientRect();
      const mx = e.clientX - rect.left;
      const my = e.clientY - rect.top;
      const state = stateRef.current;

      if (hitRect(mx, my, state.buttons.yes)) {
        decide(state, true);
      }

      if (hitRect(mx, my, state.buttons.no)) {
        decide(state, false);
      }
    };

    window.addEventListener("keydown", onKeyDown);
    window.addEventListener("keyup", onKeyUp);
    canvas.addEventListener("pointerdown", onPointerDown);

    const update = (dt: number) => {
      const state = stateRef.current;
      const keys = keysRef.current;

      state.globalT += dt;
      state.messageTimer = Math.max(0, state.messageTimer - dt);

      if (state.phase === "playing") {
        let dir = 0;

        if (keys.left || keys.a) dir -= 1;
        if (keys.right || keys.d) dir += 1;

        state.playerX += dir * PLAYER_SPEED * dt;
        state.playerX = clamp(state.playerX, 70, WORLD_W - 90);

        const targetCam = clamp(state.playerX - cssW * 0.38, 0, WORLD_W - cssW);
        state.camX = lerp(state.camX, targetCam, 0.12);
      }
    };

    const render = () => {
      const state = stateRef.current;

      ctx.clearRect(0, 0, cssW, cssH);

      drawMainHallway(ctx, state, cssW, cssH);

      drawHallwayAnomaly1_PosterEyes(ctx, state);
      drawHallwayAnomaly2_ExitStay(ctx, state);
      drawHallwayAnomaly3_LongShadow(ctx, state);
      drawHallwayAnomaly4_WrongClock(ctx, state);
      drawHallwayAnomaly5_DoorCrack(ctx, state);
      drawHallwayAnomaly6_LightsRed(ctx, state);
      drawHallwayAnomaly7_ExtraDoor(ctx, state);
      drawHallwayAnomaly8_FloorMessage(ctx, state);
      drawHallwayAnomaly9_FigureReflection(ctx, state);
      drawHallwayAnomaly10_MissingPoster(ctx, state);

      drawPlayer(ctx, state);
      drawVignette(ctx, cssW, cssH);
      drawStatic(ctx, state, cssW, cssH);
      drawHUD(ctx, state, cssW, cssH);
    };

    const loop = (now: number) => {
      const dt = Math.min(0.033, (now - last) / 1000);
      last = now;

      update(dt);
      render();

      raf = requestAnimationFrame(loop);
    };

    raf = requestAnimationFrame(loop);

    return () => {
      cancelAnimationFrame(raf);
      window.removeEventListener("resize", resize);
      window.removeEventListener("keydown", onKeyDown);
      window.removeEventListener("keyup", onKeyUp);
      canvas.removeEventListener("pointerdown", onPointerDown);
    };
  }, []);

  return (
    <div
      style={{
        width: "100%",
        height: "100%",
        minHeight: "620px",
        background: "#020617",
        overflow: "hidden",
        position: "relative",
      }}
    >
      <canvas
        ref={canvasRef}
        style={{
          width: "100%",
          height: "100%",
          display: "block",
          imageRendering: "pixelated",
          background: "#020617",
        }}
      />
    </div>
  );
}