import type { InfoGraphicData } from "../types";
import { inf01 } from "./inf-01";
import { inf02 } from "./inf-02";
import { inf03 } from "./inf-03";
import { inf05 } from "./inf-05";
import { inf13 } from "./inf-13";

export const infographicRegistry: Record<string, InfoGraphicData> = {
  "inf-01": inf01,
  "inf-02": inf02,
  "inf-03": inf03,
  "inf-05": inf05,
  "inf-13": inf13,
};
