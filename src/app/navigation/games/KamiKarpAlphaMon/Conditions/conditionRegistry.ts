import { bleedCondition } from "./Normal/bleed";
import { stunCondition } from "./Normal/stunned";
import { asleepCondition } from "./Normal/asleep";
import { slowedCondition } from "./Normal/slowed";
import { burnedCondition } from "./Normal/burned";
import { poisonCondition } from "./Normal/poisoned";
import { ConditionDefinition } from "./conditionTypes";



export const conditionRegistry: Record<string, ConditionDefinition> = {
  BLEED: bleedCondition,
  STUNNED: stunCondition,
  ASLEEP: asleepCondition,
  SLOWED: slowedCondition,
  BURNED: burnedCondition,
  POISONED: poisonCondition,


};