export type ConditionVisualInstance = {
  update: (dt: number) => void;
  draw: (ctx: CanvasRenderingContext2D) => void;
  isDone?: () => boolean;
};

export type ActiveCondition = {
  id: string;
  visual?: ConditionVisualInstance;
};

export type ConditionDefinition = {
  id: string;
  name: string;
  createVisual?: (args: {
    targetX: number;
    targetY: number;
    isPlayerSide: boolean;
  }) => ConditionVisualInstance;

  createApplyEffect?: (args: {
    targetX: number;
    targetY: number;
    isPlayerSide: boolean;
  }) => ConditionVisualInstance;
};