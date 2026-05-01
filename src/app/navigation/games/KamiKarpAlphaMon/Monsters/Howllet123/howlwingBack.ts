import {
  MonsterDefinition,
  MonsterBodyDrawArgs,
} from "../monsterTypes";

// =========================
// PIXEL HELPERS (same)
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
  alpha = 0.24
) {
  ctx.save();
  ctx.fillStyle = `rgba(0,0,0,${alpha})`;
  ctx.beginPath();
  ctx.ellipse(x, y, w, h, 0, 0, Math.PI * 2);
  ctx.fill();
  ctx.restore();
}

// =========================
// BODY (BACK VERSION)
// =========================
function drawHowlwingBack({ ctx, x, y, time, scale }: MonsterBodyDrawArgs) {
  const bob = Math.sin(time * 1.35) * 2.2;
  const pixelSize = 3.5 * scale;

  const palette = {
    O: "#172018",
    B: "#dff7df",
    M: "#c5ebc7",
    G: "#aee4b6",
    L: "#effff1",
    H: "#ffffff",
    W: "#f3efe3",
    D: "#87d69a",
    T: "#6ecb8b",
    S: "#d6ffe7",
    C: "#b8f5cc",
    A: "#94e3af",
    E: "#151815",
    K: "#6fa882",
  };

  const tailFrame = Math.floor(((Math.sin(time * 1.4) + 1) / 2) * 3);
  const crestFrame = Math.floor(((Math.sin(time * 2.1) + 1) / 2) * 3);
  const wingFrame = Math.floor(((Math.sin(time * 1.7) + 1) / 2) * 3);

  // =========================
  // BACK HEAD (no face)
  // =========================
  const headRows = [
    "..........OOBBBBBOO..........",
    "........OBBBBBBBBBBO........",
    "......OOBBBBLLLBBBBOO......",
    ".....OBBBLLLLLLLLLBBBO.....",
    "....OBBBBLLLLLLLLLBBBBO....",
    "...OBBBBLLLLLBBLLLLBBBBO...",
    "..OBBBBLLLBBBBBBBLLLBBBBO..",
    "..OBBBBLLBBBBBBBBBLLBBBBO..",
    "..OBBBBLLBBBBBBBBBLLBBBBO..",
    "..OBBBBLLBBBBBBBBBLLBBBBO..",
    "...OBBBBLLLBBBBBBLLLBBBBO..",
    "...OBBBBBLLLLBBBLLLBBBBBO..",
    "....OBBBBBLLLLLLLLBBBBBO...",
    ".....OOBBBBBLLLLBBBBBOO....",
    ".......OOBBBBBBBBBBOO......",
  ];

  // =========================
  // BODY (same but reads back)
  // =========================
  const bodyRows = [
    ".............OBBBBBB..............",
    "...........OBBBBBBBBBBO...........",
    ".........OBBBBBBBBBBBBBBO.........",
    "........BBBBBBBBBBBBBBBBBB........",
    "........BBLLLLLLLLLLLLLLBB.........",
    "........BBBLLLLLLLLLLLBBBB.........",
    "........BBBLLLLBBBBLLLBBBB.........",
    "........BBBBLLBBBBBBBLLBBB.........",
    "........OBBLLLBBBBBBBLLLBO.........",
    "........OBBLLLBBBBBBLLLBBO.........",
    "........OBBBLLLBBBBLLLLLBO.........",
    "........OBBBLLLBBBBBLLLLBO.........",
    "........OBBBLLLLBBBBLLLLBO.........",
    "........OBBBLLLLLLLLLLLLBO.........",
    "........OBBBLLLLLLLLLLLLBO.........",
    ".........OBBBLLLLLLLLLLBO..........",
    "..........OBBBBBBBBBBBBBO..........",
    "...........OOOOOOOOOOOOO..........",
  ];



  let crestRows: string[];
  if (crestFrame === 0) {
    crestRows = [
      "....OO....................OO....",
      "...OBBO..................OBBO...",
      "..OBMMBO................OBMMBO..",
      ".OBMMMMBO..............OBMMMMBO.",
      "OBMMMMMMBO............OBMMMMMMBO",
      ".OBMMMMMMBO..........OBMMMMMMBO.",
      "..OBMMMMMMMBO......OBMMMMMMMBO..",
      "...OBMMMMMMMMBO..OBMMMMMMMMBO...",
      "....OBMMMMMMMMMMMMMMMMMMMMBO....",
      ".....OBBBMMMLLLLLLLLLMMMBBBO....",
    ];
  } else if (crestFrame === 1) {
    crestRows = [
      "......OO................OO......",
      ".....OBBO..............OBBO.....",
      "...OBMMMBO............OBMMMBO...",
      "..OBMMMMMBO..........OBMMMMMBO..",
      ".OBMMMMMMMBO........OBMMMMMMMBO.",
      ".OBMMMMMMMMBO......OBMMMMMMMMBO.",
      "..OBMMMMMMMMMBO..OBMMMMMMMMMBO..",
      "...OBMMMMMMMMMMMMMMMMMMMMMMBO...",
      "....OBMMMMMMMMMMMMMMMMMMMMBO....",
      ".....OBMMMMMLLLLLLLLLMMMMBO.....",
    ];
  } else {
    crestRows = [
      "........OO............OO........",
      "......OBMMBO........OBMMBO......",
      "....OBMMMMMBO......OBMMMMMBO....",
      "...OBMMMMMMMBO....OBMMMMMMMBO...",
      "..OBMMMMMMMMMBO..OBMMMMMMMMMBO..",
      "..OBMMMMMMMMMMMMMMMMMMMMMMMMBO..",
      "...OBMMMMMMMMMMMMMMMMMMMMMMBO...",
      "....OBMMMMMMMMMMMMMMMMMMMMBO....",
      ".....OBMMMMMMMMMMMMMMMMMMBO.....",
      "......OBMMMMLLLLLLLLLMMMBO......",
    ];
  }

// =========================
// FOLDED SIDE WINGS
// =========================
function buildWingRows(frame: number): string[] {
  const configs = [
    { rows: 26, tipSpread: 10, startIndent: 4,  endIndent: 22, angleMult: 1.0  }, // closed / up
    { rows: 26, tipSpread: 18, startIndent: 2,  endIndent: 14, angleMult: 0.55 }, // mid
    { rows: 26, tipSpread: 26, startIndent: 0,  endIndent: 4,  angleMult: 0.15 }, // extended / down
  ];
  const { rows, tipSpread, startIndent, endIndent, angleMult } = configs[frame];
  const TOTAL_W = 64;
  const center = Math.floor(TOTAL_W / 2);
  const result: string[] = [];

  for (let r = 0; r < rows; r++) {
    const t = r / (rows - 1);
    const grow   = Math.min(1, t * 2.2);
    const shrink = Math.max(0, (t - 0.42) / 0.58);
    const spread = Math.max(1, Math.round(tipSpread * grow * (1 - shrink * 0.88)));
    const indent = Math.round(startIndent + (endIndent - startIndent) * t * angleMult + endIndent * t * (1 - angleMult));
    const bone   = Math.max(1, Math.round(spread * 0.22));

    const row = Array(TOTAL_W).fill('.');

    // Left wing (grows leftward from center)
    const leftEnd   = center - indent;
    const leftStart = leftEnd - spread;
    if (leftStart >= 0) {
      row[leftStart] = 'O';
      for (let i = 1; i <= bone && leftStart + i < TOTAL_W; i++)    row[leftStart + i] = 'B';
      for (let i = bone + 1; i < spread && leftStart + i < TOTAL_W; i++) row[leftStart + i] = 'M';
      if (leftEnd >= 0 && leftEnd < TOTAL_W) row[leftEnd] = 'O';
    }

    // Right wing (mirror of left)
    const rightStart = center + indent;
    const rightEnd   = rightStart + spread;
    if (rightEnd < TOTAL_W) {
      row[rightStart] = 'O';
      for (let i = 1; i <= bone && rightStart + i < TOTAL_W; i++)    row[rightStart + i] = 'B';
      for (let i = bone + 1; i < spread && rightStart + i < TOTAL_W; i++) row[rightStart + i] = 'M';
      if (rightEnd < TOTAL_W) row[rightEnd] = 'O';
    }

    result.push(row.join(''));
  }
  return result;
}

const wingRows = buildWingRows(wingFrame);

  const footRows = [
    "....OOOO.........OOOO....",
    "...OGGWGO.......OGWGGO...",
    "..OGWWWGO......OGWWWGO..",
    "..OGWWWGO......OGWWWGO..",
    "...OWWWO........OWWWO...",
    "....OO............OO....",
  ];

  // =========================
  // TAIL (same but sits behind)
  // =========================
  let tailRows: string[];
if (tailFrame === 0) {
  tailRows = [
    "..........OOOCCC SSS..........".replace(/ /g, ""),
    "........OOOAAACCCCCSSS.......",
    "........OOOAAAAAAACCCSSS....",
    ".........OOAAAAAAAACCCSSS...",
    "..........OOAAAAAAAAACCCSSS..",
    "...........OOAAAAAAAAACCSS...",
    ".............OOAAAAAACCSS....",
    "...............OOCCCCSS......",
  ];
} else if (tailFrame === 1) {
  tailRows = [
    "............OOOCCCSSS........",
    "..........OOOAAACCCCCSSS.....",
    ".........OOOAAAAAAACCCSSS...",
    "..........OOAAAAAAAACCCSSS..",
    "...........OOAAAAAAAAACCCSSS.",
    "............OOAAAAAAAAACCSS..",
    "..............OOAAAAAACCSS...",
    "................OOCCCCSS.....",
  ];
} else {
  tailRows = [
    "..............OOOCCCSSS......",
    "............OOOAAACCCCCSSS...",
    "..........OOOAAAAAAACCCSSS..",
    "...........OOAAAAAAAACCCSSS.",
    "............OOAAAAAAAAACCCSSS",
    ".............OOAAAAAAAAACCSS.",
    "...............OOAAAAAACCSS..",
    ".................OOCCCCSS....",
  ];
}

  // =========================
  // DRAW ORDER (IMPORTANT)
  // =========================
  ctx.save();
  ctx.translate(Math.round(x), Math.round(y + bob));

  drawShadow(ctx, 0, 60 * scale, 92 * scale, 18 * scale, 0.25);

  // BACK ORDER: 
   drawPixelBlock(ctx, wingRows, palette, -17, 19, pixelSize);  // behind body
   drawPixelBlock(ctx, footRows, palette, 2, 35, pixelSize);

  drawPixelBlock(ctx, bodyRows, palette, -3, 18, pixelSize);   // main
  drawPixelBlock(ctx, headRows, palette, 2, 5, pixelSize);     // top
   drawPixelBlock(ctx, crestRows, palette, -1, -1, pixelSize);
  drawPixelBlock(ctx, tailRows, palette, -14, 28, pixelSize);   // far back

  ctx.restore();
}

// =========================
// EXPORT
// =========================
export const howlwingBackMonster: MonsterDefinition = {
  id: "HOWLWING_BACK",
  name: "Howlwing",
  imageSrc: "",
  baseHeight: 230,
  faceAnchor: {
    x: 0.5,
    y: 0.23,
  },
  homeOffsetX: 75,
  homeOffsetY: 75,
  battleOffsetX: 0,
  battleOffsetY: 245,
  drawBody: drawHowlwingBack,
  drawFace: () => {},
};