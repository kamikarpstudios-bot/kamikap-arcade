export type MonsterFaceState =
  | "HOME"
  | "BATTLE"
  | "PAIN"
  | "SLEEP"
  | "FAINT"
  | "victory";

export type FaceDrawArgs = {
  ctx: CanvasRenderingContext2D;
  faceX: number;
  faceY: number;
  drawW: number;
  drawH: number;
  time: number;
  mouseX: number;
  mouseY: number;
  blink: number;
  yawn: number;
};

export type MonsterBodyDrawArgs = {
  ctx: CanvasRenderingContext2D;
  x: number;
  y: number;
  time: number;
  mouseX: number;
  mouseY: number;
  state: MonsterFaceState;
  scale: number;
  blink: number;
  yawn: number;
};

export type MonsterDrawArgs = {
  ctx: CanvasRenderingContext2D;
  x: number;
  y: number;
  time: number;
  mouseX: number;
  mouseY: number;
  state: MonsterFaceState;
  targetHeight?: number;
};

export type MonsterDefinition = {
  id: string;
  name: string;

  imageSrc?: string;
  baseHeight: number;

  faceAnchor?: {
    x: number;
    y: number;
  };

  rootAnchor?: {
    x: number;
    y: number;
  };

  drawFace?: (state: MonsterFaceState, args: FaceDrawArgs) => void;
  drawBody?: (args: MonsterBodyDrawArgs) => void;

  homeOffsetX?: number;
  homeOffsetY?: number;

  battleOffsetX?: number;
  battleOffsetY?: number;

  loginOffsetX?: number;
  loginOffsetY?: number;
};