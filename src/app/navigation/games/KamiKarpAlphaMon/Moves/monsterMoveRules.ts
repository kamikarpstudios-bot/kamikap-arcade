import { moveRegistry } from "./movesRegistry";

// shorthand type so we don’t mess up IDs
type MoveId = keyof typeof moveRegistry;

export type MonsterMoveRules = {
  signatureMoveId: MoveId;
  ultimateMoveId: MoveId | null;
  learnableMoveIds: MoveId[];
};

// ============================================
// BASIC RULES (START SIMPLE)
// ============================================

const ALL_NORMAL_MOVES: MoveId[] = [
  "PUNCH",
  "KICK",
  "SCRATCH",
  "PANTOSS",
  "BITE",
  "BLITZ",
  "HEADBUTT",
  "LICK",
  "COMBO",
  "STOMP",
];

// ============================================
// MONSTER RULES
// ============================================

export const monsterMoveRules: Record<string, MonsterMoveRules> = {
  KANGASHOE: {
    signatureMoveId: "STOMP",
    ultimateMoveId: null,
    learnableMoveIds: ALL_NORMAL_MOVES,
  },

  SQUNCH: {
    signatureMoveId: "COMBO",
    ultimateMoveId: null,
    learnableMoveIds: ALL_NORMAL_MOVES,
  },
};