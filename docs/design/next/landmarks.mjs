// The landmark islands now live in the app (src/core/art.js LANDMARK); the
// mockups draw them from there.
import { LANDMARK } from "../../../src/core/art.js";
export { LANDMARK };
export const landmark = (id, w = 120, cls = "") => `<svg class="${cls}" width="${w}" height="${(w * 0.8).toFixed(0)}" viewBox="0 0 120 96" aria-hidden="true" style="overflow:visible">${LANDMARK[id]}</svg>`;
