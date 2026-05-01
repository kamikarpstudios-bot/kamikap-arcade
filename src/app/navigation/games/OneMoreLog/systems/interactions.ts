import type { HandItem } from "../player/playerHeldItems";
import type { HandSide } from "../player/playerHands";
import type { Player } from "../player/player";
import type { Stick } from "../resourses/stick";
import type { Stone } from "../resourses/stone";

export function isNearPoint(
  playerX: number,
  playerY: number,
  targetX: number,
  targetY: number,
  radius: number
) {
  const dx = playerX - targetX;
  const dy = playerY - targetY;
  return Math.hypot(dx, dy) < radius;
}

export function isNearWorldTarget(
  player: { x: number; y: number },
  target: { x: number; y: number },
  radius: number
) {
  return isNearPoint(player.x, player.y, target.x, target.y, radius);
}

export function canAddStickToCampfire(args: {
  isNearCampfire: boolean;
  handItem: HandItem | null;
}) {
  return args.isNearCampfire && args.handItem === "stick";
}

export function canAddMaterialToUnrepairedCraftingTable(args: {
  isNearCraftingTable: boolean;
  craftingTableRepaired: boolean;
  handItem: HandItem | null;
}) {
  if (!args.isNearCraftingTable) return false;
  if (args.craftingTableRepaired) return false;

  return args.handItem === "stick" || args.handItem === "stone";
}

export function tryAddHandToCraftingTable(args: {
  side: HandSide;
  hands: { left: HandItem | null; right: HandItem | null };
  isNearCraftingTable: boolean;
  craftingTableRepaired: boolean;
  addMaterialToCraftingTable: (item: "stick" | "stone") => void;
}) {
  const item = args.hands[args.side];

  if (
    !canAddMaterialToUnrepairedCraftingTable({
      isNearCraftingTable: args.isNearCraftingTable,
      craftingTableRepaired: args.craftingTableRepaired,
      handItem: item,
    })
  ) {
    return false;
  }

  if (item !== "stick" && item !== "stone") return false;

  args.addMaterialToCraftingTable(item);
  args.hands[args.side] = null;
  return true;
}

export function tryAddHandStickToCampfire(args: {
  side: HandSide;
  hands: { left: HandItem | null; right: HandItem | null };
  isNearCampfire: boolean;
  campfireLit: boolean;
  addStickToCampfire: () => void;
  lightCampfire: () => void;
}) {
  const item = args.hands[args.side];

  if (
    !canAddStickToCampfire({
      isNearCampfire: args.isNearCampfire,
      handItem: item,
    })
  ) {
    return false;
  }

  args.hands[args.side] = null;
  args.addStickToCampfire();

  if (!args.campfireLit) {
    args.lightCampfire();
  }

  return true;
}

export function canStoreHandInCraftingPantry(args: {
  side: HandSide;
  hands: { left: HandItem | null; right: HandItem | null };
  isNearCraftingPantry: boolean;
  craftingTableRepaired: boolean;
}) {
  if (!args.isNearCraftingPantry) return false;
  if (!args.craftingTableRepaired) return false;

  const item = args.hands[args.side];
  return item === "stick" || item === "stone";
}

export function tryStoreHandInCraftingPantry(args: {
  side: HandSide;
  hands: { left: HandItem | null; right: HandItem | null };
  isNearCraftingPantry: boolean;
  craftingTableRepaired: boolean;
  addItemToCraftingPantry: (item: "stick" | "stone") => void;
}) {
  if (
    !canStoreHandInCraftingPantry({
      side: args.side,
      hands: args.hands,
      isNearCraftingPantry: args.isNearCraftingPantry,
      craftingTableRepaired: args.craftingTableRepaired,
    })
  ) {
    return false;
  }

  const item = args.hands[args.side];

  if (item !== "stick" && item !== "stone") return false;

  args.addItemToCraftingPantry(item);
  args.hands[args.side] = null;
  return true;
}
export function resolveHandInteraction({
  side,
  hands,
  isNearCampfire,
  campfireLit,
  addStickToCampfire,
  lightCampfire,
  isNearCraftingTable,
  craftingTableRepaired,
  addMaterialToCraftingTable,
  isNearCraftingPantry,
  addItemToCraftingPantry,
  dropHeldItem,
}: {
  side: HandSide;
  hands: {
    left: HandItem | null;
    right: HandItem | null;
  };
  isNearCampfire: boolean;
  campfireLit: boolean;
  addStickToCampfire: () => void;
  lightCampfire: () => void;
  isNearCraftingTable: boolean;
  craftingTableRepaired: boolean;
  addMaterialToCraftingTable: (item: HandItem) => void;
  isNearCraftingPantry: boolean;
  addItemToCraftingPantry: (item: HandItem) => void;
  dropHeldItem: () => void;
}) {
  if (
    canAddStickToCampfire({
      isNearCampfire,
      handItem: hands[side],
    })
  ) {
    tryAddHandStickToCampfire({
      side,
      hands,
      isNearCampfire,
      campfireLit,
      addStickToCampfire,
      lightCampfire,
    });
    return;
  }

  if (
    canAddMaterialToUnrepairedCraftingTable({
      isNearCraftingTable,
      craftingTableRepaired,
      handItem: hands[side],
    })
  ) {
    tryAddHandToCraftingTable({
      side,
      hands,
      isNearCraftingTable,
      craftingTableRepaired,
      addMaterialToCraftingTable,
    });
    return;
  }

  if (
    canStoreHandInCraftingPantry({
      side,
      hands,
      isNearCraftingPantry,
      craftingTableRepaired,
    })
  ) {
    tryStoreHandInCraftingPantry({
      side,
      hands,
      isNearCraftingPantry,
      craftingTableRepaired,
      addItemToCraftingPantry,
    });
    return;
  }

  dropHeldItem();
}
export type InteractPromptLine = {
  key: string;
  label: string;
};

export type InteractPromptData = {
  worldX: number;
  worldY: number;
  lines: InteractPromptLine[];
};
export function getInteractionPromptData({
  player,
  campfire,
  craftingTable,
  pantryPosition,
  hands,
  nearbyStick,
  nearbyStone,
}: {
  player: Player;
  campfire: {
    x: number;
    y: number;
    lit: boolean;
  };
  craftingTable: {
    x: number;
    y: number;
    repaired: boolean;
  };
  pantryPosition: {
    x: number;
    y: number;
  };
  hands: {
    left: HandItem | null;
    right: HandItem | null;
  };
  nearbyStick: Stick | null;
  nearbyStone: Stone | null;
}): InteractPromptData | null {
  if (isNearWorldTarget(player, campfire, 42)) {
    const lines: InteractPromptLine[] = [
      { key: "I", label: "Open Fire" },
      { key: "L", label: campfire.lit ? "Extinguish" : "Light Fire" },
    ];

    if (hands.left === "stick") {
      lines.push({ key: "U", label: "Add Stick" });
    }

    if (hands.right === "stick") {
      lines.push({ key: "O", label: "Add Stick" });
    }

    return {
      worldX: campfire.x,
      worldY: campfire.y,
      lines,
    };
  }

  if (isNearWorldTarget(player, craftingTable, 44)) {
    const lines: InteractPromptLine[] = [];

    if (craftingTable.repaired) {
      lines.push({ key: "I", label: "Craft" });
    } else {
      if (hands.left === "stick" || hands.left === "stone") {
        lines.push({ key: "U", label: "Add Repair Material" });
      }

      if (hands.right === "stick" || hands.right === "stone") {
        lines.push({ key: "O", label: "Add Repair Material" });
      }
    }

    if (lines.length > 0) {
      return {
        worldX: craftingTable.x,
        worldY: craftingTable.y,
        lines,
      };
    }
  }

  if (isNearWorldTarget(player, pantryPosition, 34) && craftingTable.repaired) {
    const lines: InteractPromptLine[] = [];

    if (hands.left === "stick" || hands.left === "stone") {
      lines.push({ key: "U", label: "Store Material" });
    }

    if (hands.right === "stick" || hands.right === "stone") {
      lines.push({ key: "O", label: "Store Material" });
    }

    if (lines.length > 0) {
      return {
        worldX: pantryPosition.x,
        worldY: pantryPosition.y,
        lines,
      };
    }
  }

  if (nearbyStick) {
    return {
      worldX: nearbyStick.x,
      worldY: nearbyStick.y,
      lines: [{ key: "I", label: "Pick Up" }],
    };
  }

  if (nearbyStone) {
    return {
      worldX: nearbyStone.x,
      worldY: nearbyStone.y,
      lines: [{ key: "I", label: "Pick Up" }],
    };
  }

  return null;
}
export function handleCraftingCardInput({
  key,
  craftingTableRepaired,
  selectedCraftingRecipeIndex,
  recipeCount,
  canCraftSelectedRecipe,
  craftSelectedRecipe,
  storeLeftInPantry,
  storeRightInPantry,
  closeCraftingCard,
}: {
  key: string;
  craftingTableRepaired: boolean;
  selectedCraftingRecipeIndex: number;
  recipeCount: number;
  canCraftSelectedRecipe: () => boolean;
  craftSelectedRecipe: () => void;
  storeLeftInPantry: () => void;
  storeRightInPantry: () => void;
  closeCraftingCard: () => void;
}): number | null {
  if (key === "e") {
    if (craftingTableRepaired && canCraftSelectedRecipe()) {
      craftSelectedRecipe();
    }
    return selectedCraftingRecipeIndex;
  }

  if (key === "i" || key === "escape") {
    closeCraftingCard();
    return selectedCraftingRecipeIndex;
  }

  if (key === "arrowup" || key === "w") {
    return (
      (selectedCraftingRecipeIndex - 1 + recipeCount) % recipeCount
    );
  }

  if (key === "arrowdown" || key === "s") {
    return (selectedCraftingRecipeIndex + 1) % recipeCount;
  }

  if (key === "u") {
    storeLeftInPantry();
    return selectedCraftingRecipeIndex;
  }

  if (key === "o") {
    storeRightInPantry();
    return selectedCraftingRecipeIndex;
  }

  return null;
}

