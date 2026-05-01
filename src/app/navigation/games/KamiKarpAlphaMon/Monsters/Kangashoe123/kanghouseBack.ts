import { MonsterBodyDrawArgs, MonsterDefinition } from "../monsterTypes";

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

function drawKanghouseBackBody({
  ctx,
  x,
  y,
  time,
  scale,
}: MonsterBodyDrawArgs) {
  const t = time;
  const basePixelSize = 4.1;
  const pixelSize = basePixelSize * scale;

  const bob = Math.round(Math.sin(t * 1.35) * 2);
  const tailWag = Math.round(Math.sin(t * 2.2) * 2);
  const leftArmLift = Math.round(Math.sin(t * 2.1) * 1);
  const rightArmLift = Math.round(Math.sin(t * 2.1 + 1.4) * 1);

  const palette = {
    O: "#2a1408", // darkest outline
    D: "#703610", // dark brown
    B: "#8e4923", // base fur
    M: "#b06435", // mid fur
    T: "#c47b44", // highlight fur
    C: "#e0bb95", // inner ear / small accents
    E: "#140d09", // deepest dark
    W: "#ffffff", // white shoe stripe
    N: "#3a190f", // dark line
    S: "#4e2015", // extra detail
    R: "#e11d1d", // red shorts / shoes
  };

  ctx.save();
  ctx.translate(Math.round(x), Math.round(y + bob));
  ctx.imageSmoothingEnabled = false;



  // legs / haunches
  const legRows = [
    "...OBTTTTBO.....OBTTTTBO...",
    "..OBTTTTTTBO...OBTTTTTTBO..",
    ".OBTTTTTTTTBO.OBTTTTTTTTBO.",
    "OBTTTTTTTTTTBOBTTTTTTTTTTBO",
    "OBTTTTTTTTTTTTTTTTTTTTTTTBO",
    ".OBTTTTTTTTT...TTTTTTTTTBO.",
    "..OBTTTTTTT.....TTTTTTTBO..",
    "...OBTTTTTB.....OBTTTTBO...",
    "..OBMMMMTTB.....OBTTMMMMBO.",
    ".OBMMMMMMB.......OBMMMMMMBO",
    ".OORRRRRBO.......OBRRRRRRO.",
    "ORRWWRRRBO.......OBRRRWWRRO",
  ];
  drawPixelBlock(ctx, legRows, palette, -13, -1, pixelSize);

  // body / back torso
  const bodyRows = [
    "........OOOOOOOO........",
    ".....OOOBTTTTTTBOOO.....",
    "...OOOBTTTTTTTTTTBOOO...",
    "..OOBTTTTTTTTTTTTTTBOO..",
    ".OBTTTTTTTTTTTTTTTTTTBO.",
    ".OBTTTTTTTTTTTTTTTTTTBO.",
    ".OBTTTTTTTBBBBTTTTTTTBO.",
    ".OBTTTTTTBBBBBBTTTTTTBO.",
    ".OBTTTTTTBBBBBBTTTTTTBO.",
    ".OBTTTTTTTBBBBTTTTTTTBO.",
    ".OBTTTTTTTTTTTTTTTTTTBO.",
    "..OBTTTTTTTTTTTTTTTTBO..",
    "...OOBTTTTTTTTTTTTBOO...",
    "....OOOBBBBBBBBBBBOOO....",
  ];
  drawPixelBlock(ctx, bodyRows, palette, -11, -15, pixelSize);

  // red shorts from back
  const shortsRows = [
    "..OORRRRRRRRRRRROO..",
    ".OBRRRRRRRRRRRRRRBO.",
    "OBRRRRRRRRRRRRRRRRBO",
    "ORRRRRRRRRRRRRRRRRRR",
    "ORRRRRRRR..RRRRRRRRR",
    ".ORRRRRR....RRRRRRRO",
    "..OORRR......RRROO..",
  ];
  drawPixelBlock(ctx, shortsRows, palette, -10, -2, pixelSize);

  // arms from behind
  const leftArmRows = [
    "..OOO.",
    ".OBMBO",
    "OBMMBO",
    "OBMMBO",
    ".OBBBO",
  ];

  const rightArmRows = [
    ".OOO..",
    "OBMBO.",
    "OBMMBO",
    "OBMMBO",
    "OBBBO.",
  ];

  drawPixelBlock(ctx, leftArmRows, palette, -15, -14 + leftArmLift, pixelSize);
  drawPixelBlock(ctx, rightArmRows, palette, 9, -14 + rightArmLift, pixelSize);

  // head back
  const headRows = [
    "...O...........O...",
    "...MO.........OM...",
    "..BMO.........OMB..",
    "..TMO.........OMT..",
    ".BTTMO.......OMTTB.",
    ".BTTTMO.....OMTTTB.",
    ".BTTTTMOOOOOMTTTTB.",
    "OBTTTTTTTTTTTTTTTBO",
    "OBTTTTTTTTTTTTTTTBO",
    ".OBTTTTTBBBBTTTTBO.",
    ".OBTTTTBBBBBBTTTBO.",
    ".OBTTTTBBBBBBTTTBO.",
    "..OBTTTTTTTTTTTTBO..",
    "...OOBBBBBBBBBOO...",
  ];
  drawPixelBlock(ctx, headRows, palette, -9, -26, pixelSize);
  // tail behind body
  const tailRows = [
    "..............OOOOO......",
    "...........OOOBMMDO......",
    ".........OOBMMMMMMDO.....",
    ".......OOBMMMMMMMMMDO....",
    "......OBMMMMMMMMMMMMDO...",
    ".....OBMMMMMMMMMMMMMMDO..",
    "....OBMMMMMMMMMMMMMMDO...",
    "...OBMMMMMMMMMMMMMMDO....",
    "..OBMMMMMMMMMMMMMDO......",
    "...OBMMMMMMMMMMDO........",
    "....OOBMMMMMDOO.........",
    "......OOODDOO...........",
  ];
  drawPixelBlock(ctx, tailRows, palette, 4 + tailWag, -9, pixelSize);

  ctx.restore();
}

export const kanghouseBackMonster: MonsterDefinition = {
  id: "KANGHOUSE_BACK",
  name: "Kanghouse",
  baseHeight: 250,
  homeOffsetX: 0,
  homeOffsetY: 130,
  drawBody: drawKanghouseBackBody,
};