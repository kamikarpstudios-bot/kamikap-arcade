import { moveRegistry } from "../Moves/movesRegistry";
import { monsterRegistry } from "../Monsters/monsterRegistry";

export interface GameState {
  update(): void;
  draw(ctx: CanvasRenderingContext2D): void;
  destroy?(): void;
}

export type MoveId = keyof typeof moveRegistry;
export type MonsterId = keyof typeof monsterRegistry;

export type EquippedMoveLoadout = {
  signature: MoveId;
  move1: MoveId | null;
  move2: MoveId | null;
  move3: MoveId | null;
  ultimate: MoveId | null;
};

export class StateManager {
  currentState: GameState | null = null;

  monsterLoadouts: Record<string, EquippedMoveLoadout> = {
    KANGASHOE: {
      signature: "STOMP",
      move1: "KICK",
      move2: null,
      move3: null,
      ultimate: null,
    },
    SQUNCH: {
      signature: "COMBO",
      move1: "PUNCH",
      move2: null,
      move3: null,
      ultimate: null,
    },
  };

  teamSlots: (MonsterId | null)[] = [null, null, null, null, null, null];

  summonedMonsterIds: MonsterId[] = ["KANGASHOE", "SQUNCH"];

  setState(state: GameState) {
    this.currentState?.destroy?.();
    this.currentState = state;
  }

  update() {
    this.currentState?.update();
  }

  draw(ctx: CanvasRenderingContext2D) {
    this.currentState?.draw(ctx);
  }

  setTeamSlots(team: (MonsterId | null)[]) {
    this.teamSlots = [...team];
  }

  getTeamSlots(): (MonsterId | null)[] {
    return [...this.teamSlots];
  }

  getSummonedMonsterIds(): MonsterId[] {
    return [...this.summonedMonsterIds];
  }

  unlockMonster(monsterId: MonsterId) {
    if (!this.summonedMonsterIds.includes(monsterId)) {
      this.summonedMonsterIds.push(monsterId);
    }
  }

  hasMonsterSummoned(monsterId: MonsterId) {
    return this.summonedMonsterIds.includes(monsterId);
  }
}