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

function drawKanghouseBody({
  ctx,
  x,
  y,
  time,
  scale,
  blink,
}: MonsterBodyDrawArgs) {
  const t = time;
  const basePixelSize = 4.1;
  const pixelSize = basePixelSize * scale;

  const bob = Math.round(Math.sin(t * 1.35) * 2);
  const isBlinking = blink > 0.5 || Math.sin(t * 1.2) > 0.992;
  const tailWag = Math.round(Math.sin(t * 2.6) * 2);
  const frontArmLift = Math.round(Math.sin(t * 2.7) * 1);
  const rearArmLift = Math.round(Math.sin(t * 2.2 + 1.2) * 1);

  const palette = {
    O: "#2a1408", // darkest outline
    D: "#703610", // deep dark red accent
    B: "#8e4923", // base fur
    M: "#b06435", // mid fur
    T: "#c47b44", // highlight fur
    C: "#e0bb95", // belly / muzzle / pouch
    E: "#140d09", // eye dark
    W: "#ffffff", // white
    N: "#3a190f", // nose / mouth
    S: "#4e2015", // scar detail
    R: "#e11d1d", // bright red shorts / shoes
  };

  ctx.save();
  ctx.translate(Math.round(x), Math.round(y + bob));
  ctx.imageSmoothingEnabled = false;

  // tail behind body
  const tailRows = [
    "...........OOOOOO......",
    "........OOBDDDDDO......",
    "......OOBDMMMMMMDO.....",
    "....OOBDMMMMMMMMMDO....",
    "...OBDMMMMMMMMMMMMDO...",
    "..OBDMMMMMMMMMMMMMDO...",
    ".OBDMMMMMMMMMMMMDO.....",
    "OBDMMMMMMMMMMMMDO......",
    "OBDMMMMMMMMMMMDO.......",
    ".OBDMMMMMMMMDO.........",
    "..OOBDDDDDOO...........",
  ];
  drawPixelBlock(ctx, tailRows, palette, 10 + tailWag, -12, pixelSize);

  // giant legs / haunches + shoes
  const legRows = [
    "..OBTTTTBO.....OBTTTTBO..",
    ".OBTTTTTTBO...OBTTTTTTBO.",
    "OBTTTTTTTTBO.OBTTTTTTTTBO",
    "OBTTTTTTTTTBOBTTTTTTTTTBO",
    ".OBTTTTTTTT...TTTTTTTTBO.",
    "..OBTTTTTT.....TTTTTTBO..",
    "...OBTTTTO.....OTTTTBO...",
    "..OBTTTTBO.....OBTTTTBO..",
    ".OBTTTTTBO.....OBTTTTTBO.",
    "OBMMMMTTBO.....OBTTMMMMBO",
    "OBMMMMMBO.......OBMMMMMBO",
    ".OORRRRBO.......OBRRRRO.",
    "ORRWWRRBO.......OBRRWWRRO",
  ];
  drawPixelBlock(ctx, legRows, palette, -12, -1, pixelSize);

  // main torso
  const bodyRows = [
    ".......OOOOOOOO.......",
    "....OOOBTTTTTTBOOO....",
    "...OOBTTTTTTTTTTBOO...",
    "..OBTTTTTTTTTTTTTTBO..",
    ".OBTTTTTTCCCCTTTTTTBO.",
    ".OBTTTTCCCCCCCCTTTTBO.",
    ".OBTTTTCCCCCCCCTTTTBO.",
    ".OBTTTTCCCCCCCCTTTTBO.",
    ".OBTTTTCCCCCCCCTTTTBO.",
    ".OBTTTTTTCCCCTTTTTTBO.",
    ".OBTTTTTTTTTTTTTTTTBO.",
    "..OBTTTTTTTTTTTTTTBO..",
    "...OOBTTTTTTTTTTBOO...",
    "....OOOBBBBBBBBBOOO....",
  ];
  drawPixelBlock(ctx, bodyRows, palette, -10, -15, pixelSize);

  // red shorts
  const shortsRows = [
    ".OORRRRRRRRRRRROO.",
    "OBRRRRRRRRRRRRRRRO",
    "ORRRRRRRRRRRRRRRRR",
    "ORRRRRRRRRRRRRRRRR",
    "ORRRRR..RR..RRRRRR",
    ".ORRR....R....RRRO",
    "..OOO.........OOO.",
  ];
  drawPixelBlock(ctx, shortsRows, palette, -9, -2, pixelSize);

  // arms
  const rearArmRows = [
    "..OOO.",
    ".OBMDO",
    "OBMMDO",
    "OBMMDO",
    ".OCCDO",
  ];

  const frontArmRows = [
    ".OOO..",
    "ODMBO.",
    "ODMMBO",
    "ODMMBO",
    "ODCCBO",
  ];

  drawPixelBlock(ctx, rearArmRows, palette, -14, -15 + rearArmLift, pixelSize);
  drawPixelBlock(ctx, frontArmRows, palette, 8, -15 + frontArmLift, pixelSize);

  // head
  const headRows = [
    "...O...........O...",
    "...MO.........OM...",
    "..BMO.........OMB..",
    "..TMO.........OMT..",
    ".BTTMO.......OMTTB.",
    ".BTTMO.......OMTTB.",
    ".BTTTMO.....OMTTTB.",
    "OBTTTTMOOOOOMTTTTBO",
    "OBTTTTTTTTTTTTTTTBO",
    ".OBTTTTTTTTTTTTTBO.",
    ".OBTTTTCCCCCTTTTBO.",
    ".OBTTTCCCCCCCTTTBO.",
    ".OBTTTCCCCCCCTTTBO.",
    "..OBTTTTTTTTTTTBO..",
    "...OOBBBBBBBBBOO...",
  ];
  drawPixelBlock(ctx, headRows, palette, -9, -28, pixelSize);

  // face
  const eyeY = -18;
  if (isBlinking) {
    px(ctx, -4, eyeY, 3, 1, palette.E, pixelSize);
    px(ctx, 3, eyeY, 3, 1, palette.E, pixelSize);
  } else {
    px(ctx, -4, eyeY, 3, 2, palette.E, pixelSize);
    px(ctx, 3, eyeY, 3, 2, palette.E, pixelSize);
    px(ctx, -4, eyeY, 1, 1, palette.W, pixelSize);
    px(ctx, 3, eyeY, 1, 1, palette.W, pixelSize);
  }

  // nose
  px(ctx, 0, eyeY + 5, 2, 1, palette.N, pixelSize);

  // mouth
  px(ctx, -2, eyeY + 9, 6, 1, palette.N, pixelSize);

  // scars / tough lines
  px(ctx, -7, eyeY - 1, 3, 1, palette.S, pixelSize);
  px(ctx, -6, eyeY, 3, 1, palette.S, pixelSize);
  px(ctx, 5, eyeY - 4, 2, 1, palette.S, pixelSize);

  ctx.restore();
}

export const kanghouseMonster: MonsterDefinition = {
  id: "KANGHOUSE",
  name: "Kanghouse",
  baseHeight: 250,
  homeOffsetX: 0,
  homeOffsetY: 130,
  drawBody: drawKanghouseBody,
};