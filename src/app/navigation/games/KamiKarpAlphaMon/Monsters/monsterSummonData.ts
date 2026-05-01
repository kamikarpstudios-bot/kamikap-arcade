import { monsterRegistry } from "./monsterRegistry";

export type SummonRarity =
  | "COMMON"
  | "UNCOMMON"
  | "RARE"
  | "UNIQUE"
  | "LEGENDARY";

export type SummonElement =
  | "NORMAL"
  | "FIRE"
  | "WATER"
  | "AIR"
  | "EARTH";

export type SummonMonsterData = {
  monsterId: keyof typeof monsterRegistry;
  familyId: string;
  element: SummonElement;
  evolutionStage: 1 | 2 | 3;
  dropWeight: number;
};

export const RARITY_STAT_BONUS: Record<
  SummonRarity,
  {
    hpBonus: number;
    speedBonus: number;
  }
> = {
  COMMON: {
    hpBonus: 0,
    speedBonus: 0,
  },
  UNCOMMON: {
    hpBonus: 5,
    speedBonus: 1,
  },
  RARE: {
    hpBonus: 10,
    speedBonus: 2,
  },
  UNIQUE: {
    hpBonus: 18,
    speedBonus: 3,
  },
  LEGENDARY: {
    hpBonus: 30,
    speedBonus: 5,
  },
};

export const MONSTER_SUMMON_DATA: SummonMonsterData[] = [
  // =========================
  // NORMAL
  // =========================

  {
    monsterId: "SQUNCH",
    familyId: "SQUNCH",
    element: "NORMAL",
    evolutionStage: 1,
    dropWeight: 100,
  },

  {
    monsterId: "KANGASHOE",
    familyId: "KANGASHOE",
    element: "NORMAL",
    evolutionStage: 1,
    dropWeight: 100,
  },

  {
    monsterId: "BUTTBUTT",
    familyId: "BUTTBUTT",
    element: "NORMAL",
    evolutionStage: 1,
    dropWeight: 100,
  },

  {
    monsterId: "CLUCK",
    familyId: "CLUCK",
    element: "NORMAL",
    evolutionStage: 1,
    dropWeight: 100,
  },

  {
    monsterId: "TREEUNGE",
    familyId: "TREEUNGE",
    element: "NORMAL",
    evolutionStage: 1,
    dropWeight: 100,
  },

  // =========================
  // FIRE
  // =========================

  {
    monsterId: "GINGER",
    familyId: "GINGER",
    element: "FIRE",
    evolutionStage: 1,
    dropWeight: 70,
  },

  // =========================
  // WATER
  // =========================

  {
    monsterId: "WATERFALKO",
    familyId: "WATERFALKO",
    element: "WATER",
    evolutionStage: 1,
    dropWeight: 70,
  },

  // =========================
  // AIR
  // =========================

  {
    monsterId: "HOWLLET",
    familyId: "HOWLLET",
    element: "AIR",
    evolutionStage: 1,
    dropWeight: 70,
  },

  // =========================
  // EARTH
  // =========================

  {
    monsterId: "ROPPER",
    familyId: "ROPPER",
    element: "EARTH",
    evolutionStage: 1,
    dropWeight: 70,
  },
];