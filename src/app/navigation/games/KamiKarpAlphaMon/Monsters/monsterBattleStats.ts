import { MonsterId } from "../systems/StateManager";

export type MonsterBattleStats = {
  maxHp: number;
  maxStamina: number;
};

export const monsterBattleStats: Partial<Record<MonsterId, MonsterBattleStats>> = {
  SQUNCH: {
    maxHp: 92,
    maxStamina: 100,
  },
  SQUNCH_BACK: {
    maxHp: 92,
    maxStamina: 100,
  },

  KANGASHOE: {
    maxHp: 108,
    maxStamina: 90,
  },
  KANGASHOE_BACK: {
    maxHp: 108,
    maxStamina: 90,
  },
};