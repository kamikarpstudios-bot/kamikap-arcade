import { girlTrainer } from "./trainers/girlTrainer";

export const npcRegistry = {
  GIRL_TRAINER: girlTrainer,
};

export type NPCId = keyof typeof npcRegistry;