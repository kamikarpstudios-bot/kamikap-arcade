import { MonsterId } from "../systems/StateManager";

export type MoveAnimationInstance = {
  update: (dt: number) => void;
  draw: (ctx: CanvasRenderingContext2D) => void;
  isDone: () => boolean;
  shouldHideUser?: boolean;
  drawUserOverride?: (ctx: CanvasRenderingContext2D) => void;
  getScreenShake?: () => number;
};

export type MoveDefinition = {
  id: string;
  name: string;
  power: number;
  staminaCost: number;
  speed: number;
  createAnimation: (args: {
    userX: number;
    userY: number;
    userMonsterY?: number;
    targetX: number;
    targetY: number;
    targetMonsterY?: number;
    userMonsterId?: MonsterId | null;
    userTargetHeight?: number;
    userFacing?: 1 | -1;
    timeProvider?: () => number;
  }) => MoveAnimationInstance;
};
