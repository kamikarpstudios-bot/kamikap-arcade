import { conditionRegistry } from "./conditionRegistry";
import { ActiveCondition } from "./conditionTypes";

export function updateConditions(
  conditions: ActiveCondition[],
  dt: number,
  targetX: number,
  targetY: number,
  isPlayerSide: boolean
) {
  console.log("updateConditions called", {
    conditions,
    targetX,
    targetY,
    isPlayerSide,
  });

  for (const condition of conditions) {
    const definition = conditionRegistry[condition.id];
    console.log("checking condition", condition.id, definition);

    if (!definition) continue;

    if (!condition.visual && definition.createVisual) {
      console.log("creating visual for", condition.id);

      condition.visual = definition.createVisual({
        targetX,
        targetY,
        isPlayerSide,
      });
    }

    condition.visual?.update(dt);
  }
}

export function drawConditions(
  ctx: CanvasRenderingContext2D,
  conditions: ActiveCondition[]
) {
  console.log("drawConditions called", conditions);

  for (const condition of conditions) {
    console.log("drawing condition", condition.id, !!condition.visual);
    condition.visual?.draw(ctx);
  }
}