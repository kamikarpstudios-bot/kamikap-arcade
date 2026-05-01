import {
  MONSTER_SUMMON_DATA,
  RARITY_STAT_BONUS,
  SummonRarity,
} from "../Monsters/monsterSummonData";

// =========================
// RARITY ROLL TABLE
// =========================

type RarityEntry = {
  rarity: SummonRarity;
  weight: number;
};

// tweak these numbers to balance your game
const RARITY_TABLE: RarityEntry[] = [
  { rarity: "COMMON", weight: 55 },
  { rarity: "UNCOMMON", weight: 25 },
  { rarity: "RARE", weight: 12 },
  { rarity: "UNIQUE", weight: 6 },
  { rarity: "LEGENDARY", weight: 2 },
];

// =========================
// GENERIC WEIGHTED ROLL
// =========================

function weightedRoll<T>(
  items: T[],
  getWeight: (item: T) => number
): T {
  const total = items.reduce((sum, item) => sum + getWeight(item), 0);
  const roll = Math.random() * total;

  let acc = 0;

  for (const item of items) {
    acc += getWeight(item);
    if (roll <= acc) return item;
  }

  return items[items.length - 1];
}

export function rollRarity(): SummonRarity {
  return weightedRoll(RARITY_TABLE, (item) => item.weight).rarity;
}

export function rollMonster() {
  return weightedRoll(MONSTER_SUMMON_DATA, (monster) => monster.dropWeight);
}


// =========================
// FINAL SUMMON RESULT
// =========================

export function rollSummonReward() {
  const rarity = rollRarity();
  const monster = rollMonster();

  const bonus = RARITY_STAT_BONUS[rarity];

  return {
    monsterId: monster.monsterId,
    rarity,
    element: monster.element,
    evolutionStage: monster.evolutionStage,

    // calculated stats (for later use)
    stats: {
      hpBonus: bonus.hpBonus,
      speedBonus: bonus.speedBonus,
    },
  };
}