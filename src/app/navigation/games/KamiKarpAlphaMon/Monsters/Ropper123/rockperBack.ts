import {
  MonsterDefinition,
  MonsterBodyDrawArgs,
} from "../monsterTypes";

// =========================
// PIXEL HELPERS
// =========================
function px(
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  w: number,
  h: number,
  color: string,
  pixelSize: number
) {
  ctx.fillStyle = color;
  const x1 = Math.round(x * pixelSize);
  const y1 = Math.round(y * pixelSize);
  const x2 = Math.round((x + w) * pixelSize);
  const y2 = Math.round((y + h) * pixelSize);
  ctx.fillRect(x1, y1, x2 - x1, y2 - y1);
}

function drawPixelBlock(
  ctx: CanvasRenderingContext2D,
  rows: string[],
  palette: Record<string, string>,
  ox: number,
  oy: number,
  pixelSize: number
) {
  for (let row = 0; row < rows.length; row++) {
    const line = rows[row];
    for (let col = 0; col < line.length; col++) {
      const cell = line[col];
      if (cell === "." || !palette[cell]) continue;
      px(ctx, ox + col, oy + row, 1, 1, palette[cell], pixelSize);
    }
  }
}

function drawShadow(
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  w: number,
  h: number,
  alpha = 0.25
) {
  ctx.save();
  ctx.fillStyle = `rgba(0,0,0,${alpha})`;
  ctx.beginPath();
  ctx.ellipse(x, y, w, h, 0, 0, Math.PI * 2);
  ctx.fill();
  ctx.restore();
}

// =========================
// BODY (BACK)
// =========================
function drawRockperBackBody({ ctx, x, y, time, scale }: MonsterBodyDrawArgs) {
  const bob = Math.sin(time * 1.7) * 1.6;
  const pixelSize = 3.4 * scale;

  const palette = {
    O: "#1b120d",
    R: "#8f6434",
    M: "#b58247",
    T: "#d8a35f",
    D: "#474747",
    C: "#6a6a6a",
    L: "#9a9a9a",
  };

  // =========================
  // BACK BODY (wider + spine ridge)
  // =========================
  const bodyRows = [
   
    ".........OORROO........",
    "........ORRRRRO.......",
    "........ORMMRRO......",
    ".......ORMMMMRRO.....",
    ".......ORMMMMMRO.....",
    ".......ORRMMMRRO....",
    ".......ORRMMMRRO....",
    ".......ORMMMMMRO....",
    ".......ORRRRRRRO.....",
    "......ORRRRRRRROO.....",
    ".....OOMMDRRRDMMOO....",
    "... .ODMMDDRDDMMDO...",
    ".....ODMMDDRDDMMDO...",
    ".....ODMMDDRDDMMDO...",
    ".....OOMMMO.OMMMOO...",
    "......OOO.....OOO....",
  ];

  // =========================
  // BACK HEAD (no face, just mass)
  // =========================
  const headRows = [
    ".........OO.........",
    ".......OORROO.......",
    "......ORRMMRRO......",
    ".....ORRMMMMRO.....",
    "....ORRMMMMMRRO....",
    "....ORRMMMMMRRO....",
    "....ORRMMMMRRRO.....",
    ".....ORRMMMRRO.....",
    "......OORRROO.......",
  ];

  // =========================
  // EARS (spread outward)
  // =========================
  const earFrame = Math.floor(((Math.sin(time * 2.15) + 1) / 2) * 3);

  let earRows: string[];

  if (earFrame === 0) {
      earRows = [
     "..DDDO...ODDD..",
      "..DCCDO.ODCCD..",
      "..DCLLD.DLLCD..",
      "..DCLLD.DLLCD..",
      "..DCLLD.DLLCD..",
      "..DCLLD.DLLCD..",
      "..DCLLD.DLLCD..",
      "..DCLLD.DLLCD..",
      "...DLLD.DLLD...",
      "...ODDD.DDDO...",
      ".....O...O.....",
    ];
  } else if (earFrame === 1) {
    earRows = [
       "..DDDO...............",
      "..DCCDO...ODDD...",
      "..DCLLD..ODCCD...",
      "..DCLLD.ODLLCD...",
      "..DCLLD.ODLLCD...",
      "..DCLLD.ODLLCD...",
      "..DCLLD.ODLLCD...",
      "..DCLLD.DLLLCD...",
      "...DLLDODLLCD....",
      "...ODDD.ODDD.....",
      ".....O...O......",
    ];
  } else {
    earRows = [
     "..DDDO...............",
      "..DCCDO..............",
      "..DCLLD....ODD...",
      "..DCLLD..ODCCD...",
      "..DCLLD.ODLLCD...",
      "..DCLLD.ODLLCD...",
      "..DCLLD.ODLLCD...",
      "..DCLLD.ODLLCD...",
      "...DLLDODLLCD....",
      "...ODDD.ODDD.....",
      ".....O...O......",
    ];
  }

  // =========================
  // BACK LEGS (deeper + grounded)
  // =========================
  const legRows = [
    "...ODDDO...ODDDO....",
    "..ODLLLDO.ODLLLDO...",
    "..ORRRRRO.ORRRRRO...",
    "...ORRRR...RRRRO....",
    "....OOO.....OOO.....",
  ];

  ctx.save();
  ctx.translate(Math.round(x), Math.round(y + bob));

  drawShadow(ctx, 0, 36 * scale, 56 * scale, 11 * scale, 0.22);

  drawPixelBlock(ctx, bodyRows, palette, -13, 2, pixelSize);
  drawPixelBlock(ctx, headRows, palette, -11, -4, pixelSize);
  drawPixelBlock(ctx, earRows, palette, -8, -12, pixelSize);
  drawPixelBlock(ctx, legRows, palette, -11, 16, pixelSize);

  ctx.restore();
}

// =========================
// EXPORT
// =========================
export const rockperBackMonster: MonsterDefinition = {
  id: "ROCKPER_BACK",
  name: "Rockper",
  imageSrc: "",
  baseHeight: 220,
  faceAnchor: { x: 0.5, y: 0.34 },
  homeOffsetX: 0,
  homeOffsetY: 60,
  battleOffsetX: 0,
  battleOffsetY: 205,
  drawBody: drawRockperBackBody,
  drawFace: () => {},
};