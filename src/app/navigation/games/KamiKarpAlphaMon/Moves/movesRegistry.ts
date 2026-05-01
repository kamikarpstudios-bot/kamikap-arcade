import { punchMove } from "./Normal/punch";
import { kickMove } from "./Normal/kick";
import { scratchMove } from "./Normal/scratch";
import { panTossMove } from "./Normal/panToss";
import { biteMove } from "./Normal/bite";
import { blitzMove } from "./Normal/blitz";
import { headbuttMove } from "./Normal/headbutt";
import { lickMove } from "./Normal/lick";
import { comboMove } from "./Normal/combo";
import { stompMove } from "./Normal/stomp";

export const moveRegistry = {
  PUNCH: punchMove,
  KICK: kickMove,
  SCRATCH: scratchMove,
  PANTOSS: panTossMove,
  BITE: biteMove,
  BLITZ: blitzMove,
  HEADBUTT: headbuttMove,
  LICK: lickMove,
  COMBO: comboMove,
  STOMP: stompMove,

};