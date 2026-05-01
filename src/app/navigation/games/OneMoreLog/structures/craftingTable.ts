export type CraftingRequirement = {
  sticks: number;
  stones: number;
};

export type CraftingMaterial = "stick" | "stone" | "charcoal" | "bark" | "rope";

export type CraftingRecipe = {
  id: string;
  name: string;
  description: string;
  requirements: Partial<Record<CraftingMaterial, number>>;
};

export type CraftingTable = {
  x: number;
  y: number;
  repaired: boolean;

  repair: {
    sticksAdded: number;
    stonesAdded: number;
    required: CraftingRequirement;
  };

  pantry: Record<CraftingMaterial, number>;
};

export const CRAFTING_RECIPES: CraftingRecipe[] = [
  {
    id: "axe",
    name: "Stone Axe",
    description: "A sturdy chopping tool for gathering wood.",
    requirements: {
      stick: 2,
      stone: 3,
    },
  },
  {
    id: "torch",
    name: "Torch",
    description: "A warm light for dark nights.",
    requirements: {
      stick: 3,
      charcoal: 2,
    },
  },
  {
    id: "rope",
    name: "Bark Rope",
    description: "Twisted bark fibers for future crafting.",
    requirements: {
      bark: 3,
    },
  },
  {
    id: "fishing-rod",
    name: "Fishing Rod",
    description: "Lets you fish once fishing is added.",
    requirements: {
      stick: 3,
      charcoal: 3,
      rope: 4,
    },
  },
  {
    id: "pantry",
    name: "Pantry",
    description: "A camp pantry for storing future fish and berries.",
    requirements: {
      stick: 20,
    },
  },
];

function toneColor(hex: string, shadowAmount = 0, fireLightAmount = 0) {
  const clean = hex.replace("#", "");
  const num = parseInt(clean, 16);

  let r = (num >> 16) & 255;
  let g = (num >> 8) & 255;
  let b = num & 255;

  const darkT = Math.max(0, Math.min(1, 1 - shadowAmount));
  r = Math.round(r * darkT);
  g = Math.round(g * darkT);
  b = Math.round(b * darkT);

  r = Math.min(255, Math.round(r + 90 * fireLightAmount));
  g = Math.min(255, Math.round(g + 55 * fireLightAmount));
  b = Math.min(255, Math.round(b + 10 * fireLightAmount));

  return `rgb(${r}, ${g}, ${b})`;
}

function drawPlank(
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  w: number,
  h: number,
  color: string,
  rotation = 0
) {
  ctx.save();
  ctx.translate(x, y);
  ctx.rotate(rotation);

  ctx.fillStyle = color;
  ctx.fillRect(-w / 2, -h / 2, w, h);

  ctx.strokeStyle = "rgba(40,20,10,0.35)";
  ctx.lineWidth = 1;
  ctx.strokeRect(-w / 2, -h / 2, w, h);

  ctx.beginPath();
  ctx.moveTo(-w * 0.35, -h * 0.18);
  ctx.lineTo(w * 0.35, -h * 0.18);
  ctx.moveTo(-w * 0.22, h * 0.12);
  ctx.lineTo(w * 0.18, h * 0.12);
  ctx.strokeStyle = "rgba(80,45,25,0.28)";
  ctx.stroke();

  ctx.restore();
}

function drawStonePebble(
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  rx: number,
  ry: number,
  fireLightAmount = 0
) {
  ctx.beginPath();
  ctx.ellipse(x, y, rx, ry, 0.2, 0, Math.PI * 2);
  ctx.fillStyle = toneColor("#80786e", 0, fireLightAmount);
  ctx.fill();

  ctx.beginPath();
  ctx.ellipse(x - 1, y - 1, rx * 0.42, ry * 0.35, 0.2, 0, Math.PI * 2);
  ctx.fillStyle = "rgba(255,255,255,0.10)";
  ctx.fill();
}

function drawGrassClump(
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  scale = 1
) {
  ctx.save();
  ctx.translate(x, y);
  ctx.scale(scale, scale);

  const blades = [
    { x: -7, h: 12, lean: -0.25 },
    { x: -2, h: 16, lean: -0.08 },
    { x: 3, h: 14, lean: 0.12 },
    { x: 8, h: 11, lean: 0.28 },
  ];

  for (const blade of blades) {
    ctx.beginPath();
    ctx.moveTo(blade.x, 0);
    ctx.quadraticCurveTo(
      blade.x + blade.lean * 10,
      -blade.h * 0.5,
      blade.x + blade.lean * 14,
      -blade.h
    );
    ctx.strokeStyle = "#557a32";
    ctx.lineWidth = 2;
    ctx.lineCap = "round";
    ctx.stroke();
  }

  ctx.restore();
}

function drawRepairStickPile(
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  amount: number,
  fireLightAmount = 0
) {
  const visibleCount = Math.min(10, Math.ceil(amount / 3));

  for (let i = 0; i < visibleCount; i++) {
    const row = Math.floor(i / 5);
    const col = i % 5;

    drawPlank(
      ctx,
      x + col * 4 - row * 2,
      y - row * 3,
      12,
      3,
      toneColor(i % 2 === 0 ? "#7b5333" : "#6a452a", 0, fireLightAmount),
      -0.55 + (i % 3) * 0.22
    );
  }
}

function drawRepairStonePile(
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  amount: number,
  fireLightAmount = 0
) {
  const visibleCount = Math.min(9, Math.ceil(amount / 3));

  for (let i = 0; i < visibleCount; i++) {
    const row = Math.floor(i / 4);
    const col = i % 4;

    drawStonePebble(
      ctx,
      x + col * 5 - row * 2,
      y - row * 3,
      3.8 - row * 0.2,
      3.2 - row * 0.2,
      fireLightAmount
    );
  }
}

export function createCraftingTable(x: number, y: number): CraftingTable {
  return {
    x,
    y,
    repaired: false,
    repair: {
      sticksAdded: 0,
      stonesAdded: 0,
      required: {
        sticks: 1,
        stones: 1,
      },
    },
    pantry: {
      stick: 0,
      stone: 0,
      charcoal: 0,
      bark: 0,
      rope: 0,
    },
  };
}
export function getCraftingPantryWorldPosition(table: CraftingTable) {
  return {
    x: table.x + 42,
    y: table.y - 2,
  };
}

export function getCraftingPantryBounds(table: CraftingTable) {
  return {
    x: table.x + 42 - 18,
    y: table.y - 2 - 14,
    width: 36,
    height: 28,
  };
}
export function getCraftingTableCollisionBounds(x: number, y: number) {
  return {
    x: x - 30,
    y: y - 8,
    width: 60,
    height: 16,
  };
}

export function getCraftingTableGrassClearRect(x: number, y: number) {
  return {
    x: x - 42,
    y: y - 52,
    width: 84,
    height: 62,
  };
}

function getPlayerFeet(playerX: number, playerY: number) {
  return {
    x: playerX,
    y: playerY + 28,
  };
}

export function isPlayerBehindCraftingTable(
  tableX: number,
  tableY: number,
  playerX: number,
  playerY: number
) {
  const feet = getPlayerFeet(playerX, playerY);

  const aboveFront = feet.y < tableY - 3;
  const withinWidth = Math.abs(feet.x - tableX) < 34;

  return aboveFront && withinWidth;
}

function drawBrokenCraftingTableArt(
  ctx: CanvasRenderingContext2D,
  table: CraftingTable,
  time: number,
  fireLightAmount = 0
) {
  const { x, y } = table;
  const sway = Math.sin(time * 1.4) * 0.5;

  ctx.fillStyle = toneColor("#4c3424", 0, fireLightAmount);
  ctx.fillRect(x - 24, y - 34, 48, 7);

  drawPlank(
    ctx,
    x - 10,
    y - 26 + sway * 0.2,
    24,
    7,
    toneColor("#8a5e39", 0, fireLightAmount),
    -0.08
  );
  drawPlank(
    ctx,
    x + 10,
    y - 28 - sway * 0.15,
    22,
    7,
    toneColor("#7a5232", 0, fireLightAmount),
    0.13
  );
  drawPlank(
    ctx,
    x + 3,
    y - 21,
    15,
    5,
    toneColor("#5f4029", 0, fireLightAmount),
    -0.28
  );

  drawPlank(
    ctx,
    x - 18,
    y - 10,
    6,
    28,
    toneColor("#694529", 0, fireLightAmount),
    -0.06
  );
  drawPlank(
    ctx,
    x + 16,
    y - 8,
    6,
    26,
    toneColor("#6c472c", 0, fireLightAmount),
    0.16
  );
  drawPlank(
    ctx,
    x - 4,
    y - 3,
    5,
    18,
    toneColor("#563823", 0, fireLightAmount),
    -0.45
  );

  drawPlank(
    ctx,
    x + 2,
    y - 8,
    20,
    4,
    toneColor("#7b5536", 0, fireLightAmount),
    0.34
  );

  drawPlank(
    ctx,
    x - 22,
    y + 4,
    14,
    4,
    toneColor("#815736", 0, fireLightAmount),
    -0.28
  );
  drawPlank(
    ctx,
    x + 26,
    y + 3,
    16,
    4,
    toneColor("#6a452a", 0, fireLightAmount),
    0.18
  );

  drawRepairCrate(ctx, x + 42, y - 2, table, fireLightAmount);

  ctx.fillStyle = "#bfa58f";
  ctx.beginPath();
  ctx.arc(x - 5, y - 18, 1, 0, Math.PI * 2);
  ctx.arc(x + 13, y - 24, 1, 0, Math.PI * 2);
  ctx.arc(x + 5, y - 8, 1, 0, Math.PI * 2);
  ctx.fill();
}
function drawStorageCrate(
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  pantry: Record<CraftingMaterial, number>,
  fireLightAmount = 0
) {
  // crate body
  drawPlank(ctx, x, y, 30, 22, toneColor("#7a5232", 0, fireLightAmount), 0);
  drawPlank(ctx, x, y - 8, 30, 4, toneColor("#94643d", 0, fireLightAmount), 0);
  drawPlank(ctx, x, y, 30, 4, toneColor("#6b472b", 0, fireLightAmount), 0);
  drawPlank(ctx, x, y + 8, 30, 4, toneColor("#94643d", 0, fireLightAmount), 0);

  drawPlank(ctx, x - 11, y, 4, 22, toneColor("#5c3d25", 0, fireLightAmount), 0);
  drawPlank(ctx, x + 11, y, 4, 22, toneColor("#5c3d25", 0, fireLightAmount), 0);

  const total =
    pantry.stick +
    pantry.stone +
    pantry.charcoal +
    pantry.bark +
    pantry.rope;

  if (total <= 0) return;

  // sticks
  if (pantry.stick > 0) {
    const count = Math.min(4, pantry.stick);
    for (let i = 0; i < count; i++) {
      drawPlank(
        ctx,
        x - 7 + i * 4,
        y + 3 - Math.floor(i / 2) * 2,
        11,
        2.8,
        toneColor("#8a5a35", 0, fireLightAmount),
        -0.55 + i * 0.08
      );
    }
  }

  // stones
  if (pantry.stone > 0) {
    const count = Math.min(4, pantry.stone);
    for (let i = 0; i < count; i++) {
      drawStonePebble(
        ctx,
        x - 6 + i * 4,
        y + 6,
        2.8,
        2.4,
        fireLightAmount
      );
    }
  }

  // charcoal
  if (pantry.charcoal > 0) {
    const count = Math.min(3, pantry.charcoal);
    for (let i = 0; i < count; i++) {
      ctx.beginPath();
      ctx.ellipse(x + 2 + i * 4, y + 2, 2.6, 2.2, 0.2, 0, Math.PI * 2);
      ctx.fillStyle = toneColor("#2a2623", 0, fireLightAmount);
      ctx.fill();
    }
  }

  // bark
  if (pantry.bark > 0) {
    const count = Math.min(3, pantry.bark);
    for (let i = 0; i < count; i++) {
      drawPlank(
        ctx,
        x + 3 + i * 4,
        y - 1,
        8,
        2.4,
        toneColor("#9b6b44", 0, fireLightAmount),
        0.2
      );
    }
  }

  // rope
  if (pantry.rope > 0) {
    const count = Math.min(2, pantry.rope);
    for (let i = 0; i < count; i++) {
      ctx.beginPath();
      ctx.arc(x + 4 + i * 6, y - 3, 3, 0, Math.PI * 2);
      ctx.strokeStyle = toneColor("#bc9a67", 0, fireLightAmount);
      ctx.lineWidth = 1.4;
      ctx.stroke();
    }
  }
}

function drawRepairCrate(
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  table: CraftingTable,
  fireLightAmount = 0
) {
  drawPlank(ctx, x, y, 30, 22, toneColor("#705033", 0, fireLightAmount), 0);
  drawPlank(ctx, x, y - 8, 30, 4, toneColor("#8a613d", 0, fireLightAmount), 0);
  drawPlank(ctx, x, y, 30, 4, toneColor("#634328", 0, fireLightAmount), 0);
  drawPlank(ctx, x, y + 8, 30, 4, toneColor("#8a613d", 0, fireLightAmount), 0);

  drawRepairStickPile(ctx, x - 8, y + 6, table.repair.sticksAdded, fireLightAmount);
  drawRepairStonePile(ctx, x + 1, y + 7, table.repair.stonesAdded, fireLightAmount);
}

function drawFixedCraftingTableArt(
  ctx: CanvasRenderingContext2D,
  table: CraftingTable,
  fireLightAmount = 0
) {
  const { x, y } = table;

  drawPlank(
    ctx,
    x,
    y - 26,
    52,
    8,
    toneColor("#8d603b", 0, fireLightAmount),
    0
  );
  drawPlank(
    ctx,
    x - 15,
    y - 31,
    16,
    4,
    toneColor("#9a6b43", 0, fireLightAmount),
    0.03
  );
  drawPlank(
    ctx,
    x + 15,
    y - 31,
    16,
    4,
    toneColor("#9a6b43", 0, fireLightAmount),
    -0.03
  );

  drawPlank(
    ctx,
    x - 18,
    y - 10,
    6,
    30,
    toneColor("#6f492d", 0, fireLightAmount),
    -0.02
  );
  drawPlank(
    ctx,
    x + 18,
    y - 10,
    6,
    30,
    toneColor("#6f492d", 0, fireLightAmount),
    0.02
  );
  drawPlank(
    ctx,
    x - 6,
    y - 9,
    5,
    27,
    toneColor("#654228", 0, fireLightAmount),
    -0.01
  );
  drawPlank(
    ctx,
    x + 6,
    y - 9,
    5,
    27,
    toneColor("#654228", 0, fireLightAmount),
    0.01
  );

  drawPlank(
    ctx,
    x,
    y - 14,
    34,
    4,
    toneColor("#7a5232", 0, fireLightAmount),
    0
  );
  drawPlank(
    ctx,
    x,
    y - 4,
    30,
    4,
    toneColor("#6a452a", 0, fireLightAmount),
    0
  );

  drawPlank(
    ctx,
    x,
    y - 2,
    26,
    4,
    toneColor("#5d3d26", 0, fireLightAmount),
    0
  );

  drawPlank(
    ctx,
    x + 12,
    y - 22,
    14,
    3,
    toneColor("#5b3b24", 0, fireLightAmount),
    0.36
  );

  drawStonePebble(ctx, x - 14, y - 21, 3.8, 3.1, fireLightAmount);
  drawStonePebble(ctx, x - 7, y - 20, 3.2, 2.8, fireLightAmount);

  drawStorageCrate(ctx, x + 42, y - 2, table.pantry, fireLightAmount);

  ctx.fillStyle = "#bfa58f";
  ctx.beginPath();
  ctx.arc(x - 20, y - 26, 1, 0, Math.PI * 2);
  ctx.arc(x + 20, y - 26, 1, 0, Math.PI * 2);
  ctx.arc(x - 14, y - 14, 1, 0, Math.PI * 2);
  ctx.arc(x + 14, y - 14, 1, 0, Math.PI * 2);
  ctx.fill();
}

export function drawCraftingTable(
  ctx: CanvasRenderingContext2D,
  table: CraftingTable,
  time: number,
  fireLightAmount = 0
) {
  const { x, y, repaired } = table;

  ctx.beginPath();
  ctx.ellipse(x + 2, y + 4, 34, 11, -0.08, 0, Math.PI * 2);
  ctx.fillStyle = "rgba(0,0,0,0.15)";
  ctx.fill();

  if (repaired) {
    drawFixedCraftingTableArt(ctx, table, fireLightAmount);
  } else {
    drawBrokenCraftingTableArt(ctx, table, time, fireLightAmount);
  }

  drawGrassClump(ctx, x - 28, y + 5, 0.95);
  drawGrassClump(ctx, x + 18, y + 6, 0.82);
}

export function drawCraftingTableFrontOverlay(
  ctx: CanvasRenderingContext2D,
  table: CraftingTable,
  time: number,
  playerX: number,
  playerY: number,
  fireLightAmount = 0
) {
  const behind = isPlayerBehindCraftingTable(
    table.x,
    table.y,
    playerX,
    playerY
  );

  if (!behind) return;

  ctx.save();
  ctx.globalAlpha *= 0.9;

  if (table.repaired) {
    drawFixedCraftingTableArt(ctx, table, fireLightAmount);
  } else {
    drawBrokenCraftingTableArt(ctx, table, time, fireLightAmount);
  }

  ctx.restore();
}
export function addItemToCraftingPantry(
  table: CraftingTable,
  kind: "stick" | "stone"
) {
  if (!table.repaired) return;

  table.pantry[kind] += 1;
}

export function canCraftRecipe(
  table: CraftingTable,
  recipe: CraftingRecipe
) {
  for (const key of Object.keys(recipe.requirements) as CraftingMaterial[]) {
    const needed = recipe.requirements[key] ?? 0;
    const stored = table.pantry[key] ?? 0;

    if (stored < needed) {
      return false;
    }
  }

  return true;
}

export function craftRecipe(
  table: CraftingTable,
  recipe: CraftingRecipe
): boolean {
  if (!canCraftRecipe(table, recipe)) return false;

  for (const key of Object.keys(recipe.requirements) as CraftingMaterial[]) {
    const amount = recipe.requirements[key] ?? 0;
    table.pantry[key] -= amount;
  }

  return true;
}

export function addMaterialToCraftingTable(
  table: CraftingTable,
  kind: "stick" | "stone"
) {
  if (table.repaired) return;

  if (kind === "stick") {
    table.repair.sticksAdded = Math.min(
      table.repair.required.sticks,
      table.repair.sticksAdded + 1
    );
  } else {
    table.repair.stonesAdded = Math.min(
      table.repair.required.stones,
      table.repair.stonesAdded + 1
    );
  }

  if (
    table.repair.sticksAdded >= table.repair.required.sticks &&
    table.repair.stonesAdded >= table.repair.required.stones
  ) {
    table.repaired = true;
  }
}