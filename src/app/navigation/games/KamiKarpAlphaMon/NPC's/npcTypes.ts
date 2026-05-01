export type NPCState =
  | "IDLE"
  | "TALK"
  | "BLINK"
  | "POSE"
  | "WALK"
  ;

export type NPCDrawArgs = {
  ctx: CanvasRenderingContext2D;
  x: number;
  y: number;
  time: number;
  state: NPCState;
};

export type NPCDefinition = {
  id: string;
  baseHeight: number;

  draw: (args: NPCDrawArgs) => void;
};