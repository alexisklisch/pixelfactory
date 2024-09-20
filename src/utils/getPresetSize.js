import { PRESETS } from "../consts/presets.js";

export function getPresetSize(preset) {
  try {
    return PRESETS[preset];
  } catch {
    throw new Error("No existe ese preset");
  }
}
