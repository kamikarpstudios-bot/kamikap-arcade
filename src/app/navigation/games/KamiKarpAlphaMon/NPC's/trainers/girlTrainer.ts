import { NPCDefinition } from "../npcTypes";

function px(
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  size: number,
  color: string
) {
  ctx.fillStyle = color;
  ctx.fillRect(Math.round(x), Math.round(y), size, size);
}

function drawPixelBlock(
  ctx: CanvasRenderingContext2D,
  rows: string[],
  palette: Record<string, string>,
  ox: number,
  oy: number,
  pixelSize: number
) {
  for (let r = 0; r < rows.length; r++) {
    const row = rows[r];
    for (let c = 0; c < row.length; c++) {
      const key = row[c];
      if (key === ".") continue;

      const color = palette[key];
      if (!color) continue;

      px(ctx, ox + c * pixelSize, oy + r * pixelSize, pixelSize, color);
    }
  }
}

const palette: Record<string, string> = {
  O: "#1f1a2e",
  H: "#0f1020",
  h: "#2a2f4f",
  S: "#f3c7ae",
  W: "#fff4ef",
  E: "#2a1b19",
  M: "#c96a84",
  G: "#bc3932",
  g: "#6f2f5e",
  A: "#51133d",
  P: "#26345f",
  p: "#182342",
  K: "#1c1f2c",
};

const BODY_ROWS = [
  ".....OOOOOOO......",
  "....OSSSSSSOS.....",
  "....OSSSSSSOS.....",
  "....OSSSSSSOS.....",
  "....OSSSSSSOS.....",
  "....OSSSSSSOS.....",
  ".....OSSSSO.......",
  "......OGGO........",
  "....OGGSSSSGO....",
  "....OGGSSSGGO....",
  "... OGGGSGGGO....",
  "....gGGGGGGGgO....",
  "....gggGgggGO....",
  "....OGgGGGgGO....",
  "....OGgGGGgGO....",
  "....OGgGGGGgGO....",
  "....OgGGGGGGO....",
  "....OgGGGGGGO....",
  "....SgGGGGGGS....",
  "....SOPPPPPOS.....",
  ".....OPPPPPO.....",
  ".....OPP.PPO.....",
  ".....OPP.PPO.....",
  ".....OPP.PPO.....",
  ".....OPP.PPO.....",
  ".....OPP.PPO......",
  ".....OPP.PPO......",
  ".....OPP.PPO......",
  ".....OPP.PPO......",
  ".....OKK.KKO......",
  ".....OKK.KKO......",
  ".....OOO.OOO......",
];

const WALK_FRAMES = [
  [
    ".....HHHHHHH.....",
    "....HHHHHHHHH.....",
    "....HHHHHHHHS.....",
    "....HHHHHSSSS.....",
    "....HHHHSSSSS.....",
    "....HHHHSSSSS.....",
    ".....HHSSSS.......",
    "......OGGO........",
    ".....OGGG....",
    ".....OGGGO...",
    ".....OggGS....",
    ".....OggGGS....",
    ".....ogggGGGO....",
    "......ggGggGG....",
    "......ggGGGO....",
    ".....ggGGGOg...",
    "....ggGGGGOgg...",
    "...ggGGGGGGggg..",
    "..ggOGGGGGO..gg",
    ".SS.OPPPPPO...SS",
    ".SS..OPPPPO....SS",
    ".....OOPPPPO......",
    "......OPpPPPO......",
    "......OPPpPPPO......",
    "......OPP..pPO......",
    "......OPP...pPO......",
    "......OPP...pPO......",
    "......OPP...pPO.",
    "......OPO...pPO",
    "......OOO...pPO",
    "......OKK...OOO",
    "......OOO...OOO",
  ],

  [
    ".....HHHHHHH.....",
    "....HHHHHHHHH.....",
    "....HHHHHHHHS.....",
    "....HHHHHSSSS.....",
    "....HHHHSSSSS.....",
    "....HHHHSSSSS.....",
    ".....HHSSSS.......",
    "......OGGO........",
    ".....OGGG....",
    ".....OGGGS...",
    ".....OGggSS..",
    ".....OGggGGGO...",
    ".....OGggGGGO....",
    ".....OGggggGO....",
    "......OggGO....",
    "......OGggO....",
    "......OGggO....",
    "......OGggG....",
    ".....OGSSO....",
    "....OPPSSO.....",
    "....OPPPPpPO.....",
    ".....OOPpppPO......",
    ".....OPP...pPO......",
    ".....OPP...pPO......",
    ".....OPP....pPO......",
    "....OPP.....pPO......",
    "....OPP.....pPO......",
    "....OPP......pPP......",
    "...OPP.......pPO......",
    "..OOO........OOO......",
    ".OKK.........kKO......",
    ".OOO.........OOO......",
  ],

  [
    ".....HHHHHHH.....",
    "....HHHHHHHHH.....",
    "....HHHHHHHHS.....",
    "....HHHHHSSSS.....",
    "....HHHHSSSSS.....",
    "....HHHHSSSSS.....",
    ".....HHSSSS.......",
    "......OGGO........",
    ".....OGGG....",
    ".....OGGGO...",
    ".....OggGS....",
    ".....OggGGS....",
    ".....OgggGGO....",
    ".....OggGggG....",
    ".....OGggGGO....",
    ".....OGGggO....",
    "....gOGGGgg....",
    "...gOGGGGGgg....",
    "...SOGGGGOSS..",
    ". S.OPPPPOSS..",
    ".....OPPPPOO.....",
    ".....OOPPPOO......",
    ".....OOPPOOO.....",
    ".....OPpPPPO......",
    ".....OPppPPO......",
    ".....OPppPO......",
    ".....PP.pPO......",
    ".....PP.pPP......",
    ".....Pp.PPO......",
    ".....OO.OOO......",
    ".....Ok.OKO......",
    ".....OO.OOO......",
  ],
];

const HAIR_BACK_FRAMES = [
  [
    "HHHHOO......",
    "HHHHHOO.....",
    "HHHHHHOO....",
    "hHHHHHHO....",
    "hhHHHHHO....",
    ".hHHHHHO....",
    ".hHHHHHO....",
    "..HHHHO.....",
    "..HHHHO.....",
    "..HHHHO.....",
    "..HHHHO.....",
    "..HHHHO.....",
    "...HHO......",
    "...HHO......",
    "....O.......",
  ],
  [
    "HHHHO.......",
    "HHHHHOO.....",
    "HHHHHHOO....",
    "hHHHHHHO....",
    "hhHHHHHHO...",
    ".hHHHHHHO...",
    ".hHHHHHHO...",
    "..HHHHHO....",
    "..HHHHHO....",
    "..HHHHHO....",
    "...HHHHO....",
    "....HHO.....",
    "....HHO.....",
    ".....O......",
  ],
  [
    "HHHO........",
    "HHHHOO......",
    "HHHHHOO.....",
    "hHHHHHHO....",
    "hhHHHHHHO...",
    ".hHHHHHHO...",
    "..HHHHHHO...",
    "..HHHHHHO...",
    "...HHHHHO...",
    "...HHHHHO...",
    "....HHHHO...",
    ".....HHO....",
    ".....HHO....",
    "......O.....",
  ],
];

const BANGS_ROWS = [
  "....................",
  ".....OHHHHHHO.......",
  "....OHHHHHHHH......",
  ".....OH...HHO......",
  ".....OH...HHO.....",
  ".....OH...HHO.....",
  "....................",
];

const WALK_HAIR_FRAMES = [
  [
    ".....HHHHHHHH.....",
    "....HHHHHHHHHHHH...",
    "....HHHHHHHHHHHH...",
    "....HHHHHHHHH.....",
    ".....HHHHHHHH.....",
    "......HHHHHHH.....",
    ".......HHHHHH.....",
    "........HHHHH.....",
    ".........HHHH.....",
    ".........HHHH.....",
    "..........HHH.....",
    "..........HHH.....",
  ],
  [
    ".....HHHHHHHH.....",
    "....HHHHHHHHHHH...",
    "....HHHHHHHHHHH...",
    "....HHHHHHHHH.....",
    ".....HHHHHHHH.....",
    "......HHHHHHH.....",
    ".......HHHHHH.....",
    "........HHHHHH....",
    ".........HHHHH....",
    ".........HHHH.....",
    "..........HHH.....",
    "...........HH.....",
  ],
  [
    ".....HHHHHHHH.....",
    "....HHHHHHHHHHH...",
    "....HHHHHHHHHHH...",
    "....HHHHHHHHH.....",
    ".....HHHHHHHH.....",
    "......HHHHHHH.....",
    ".......HHHHHH.....",
    "........HHHHH.....",
    "........HHHHH.....",
    ".........HHHH.....",
    "..........HHH.....",
    "..........HH......",
  ],
];

const WALK_BANGS_FRAMES = [
  [
    "....................",
    ".........OHHH........",
    "..........OHHH........",
    "............OHH........",
    "...........OHH.........",
    "..........OH..........",
    "....................",
  ],
  [
    "....................",
    ".........OHHH........",
    "..........OHHH........",
    "..........OHH........",
    ".........OHH.........",
    "........OH..........",
    "....................",
  ],
  [
    "....................",
    ".........OHHH........",
    "..........OHHH........",
    "...........OHH........",
    "..........OHH.........",
    ".........OH..........",
    "....................",
  ],
];

export const girlTrainer: NPCDefinition = {
  id: "GIRL_TRAINER",
  baseHeight: 168,

  draw({ ctx, x, y, time, state }) {
    const pixelSize = 4;

    const isWalking = state === "WALK";
    const walkFrame = Math.floor((time * 8) % WALK_FRAMES.length);

    const activeBodyRows = isWalking ? WALK_FRAMES[walkFrame] : BODY_ROWS;

    const idleHairFrame =
      Math.floor(((time * 60) / 10) % HAIR_BACK_FRAMES.length) %
      HAIR_BACK_FRAMES.length;

    const activeHairBackRows = isWalking
      ? WALK_HAIR_FRAMES[walkFrame]
      : HAIR_BACK_FRAMES[idleHairFrame];

    const activeBangsRows = isWalking
      ? WALK_BANGS_FRAMES[walkFrame]
      : BANGS_ROWS;

    const bodyWidth = activeBodyRows[0].length * pixelSize;
    const bodyHeight = activeBodyRows.length * pixelSize;

    const bob = isWalking
      ? Math.sin(time * 16) * 1.2
      : Math.sin(time * 2.1) * 1.5;

    const sway = Math.sin(time * 2.4);

    const drawX = Math.round(x - bodyWidth / 2);
    const drawY = Math.round(y - bodyHeight + bob);

    const hairPalette = {
      O: palette.O,
      H: palette.H,
      h: palette.h,
    };

 const idleHairBackX = Math.round(drawX + 40 + sway * 2);
const idleHairBackY = Math.round(drawY + 6);

const walkHairBackX = Math.round(drawX - 40);
const walkHairBackY = Math.round(drawY + 2);

const hairBackX = isWalking ? walkHairBackX : idleHairBackX;
const hairBackY = isWalking ? walkHairBackY : idleHairBackY;

    ctx.save();

    ctx.fillStyle = "rgba(0,0,0,0.22)";
    ctx.beginPath();
    ctx.ellipse(x, y + 10, 34, 8, 0, 0, Math.PI * 2);
    ctx.fill();

    drawPixelBlock(
      ctx,
      activeHairBackRows,
      hairPalette,
      hairBackX,
      hairBackY,
      pixelSize
    );

    drawPixelBlock(ctx, activeBodyRows, palette, drawX, drawY, pixelSize);

    const blink = time % 4.4;
    let eyeState: "OPEN" | "HALF" | "CLOSED" = "OPEN";

    if (blink > 3.7 && blink < 3.82) eyeState = "HALF";
    else if (blink >= 3.82 && blink < 4.02) eyeState = "CLOSED";

    ctx.fillStyle = palette.E;

    if (isWalking) {
      const eyeX = Math.round(drawX + 11 * pixelSize);
      const eyeY = Math.round(drawY + 5 * pixelSize);

      if (eyeState === "OPEN") {
        ctx.fillRect(eyeX, eyeY, pixelSize, pixelSize);
      }

      if (eyeState === "HALF") {
        ctx.fillRect(eyeX, eyeY, pixelSize, 1);
      }

      if (eyeState === "CLOSED") {
        ctx.fillRect(eyeX, eyeY, pixelSize + 1, 1);
      }
    } else {
      const eyeY = Math.round(drawY + 4.5 * pixelSize);
      const centerX = Math.round(drawX + 8 * pixelSize);

      const leftEyeX = Math.round(centerX - 1.3 * pixelSize);
      const rightEyeX = Math.round(centerX + 1 * pixelSize);

      if (eyeState === "OPEN") {
        ctx.fillRect(leftEyeX, eyeY, pixelSize, pixelSize);
        ctx.fillRect(rightEyeX, eyeY, pixelSize, pixelSize);
      }

      if (eyeState === "HALF") {
        ctx.fillRect(leftEyeX, eyeY, pixelSize, 1);
        ctx.fillRect(rightEyeX, eyeY, pixelSize, 1);
      }

      if (eyeState === "CLOSED") {
        ctx.fillRect(leftEyeX, eyeY, pixelSize + 1, 1);
        ctx.fillRect(rightEyeX, eyeY, pixelSize + 1, 1);
      }
    }

    drawPixelBlock(
      ctx,
      activeBangsRows,
      hairPalette,
      drawX,
      drawY,
      pixelSize
    );

    ctx.restore();
  },
};

export function drawGirlTrainer(
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  time: number,
  state: "IDLE" | "WALK" = "IDLE"
) {
  girlTrainer.draw({
    ctx,
    x,
    y,
    time,
    state,
  });
}