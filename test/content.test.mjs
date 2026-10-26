// The course content passes the validator (scripts/validate-content.mjs):
// both languages and countries, concepts, explanations, facts, actions,
// lesson length. Run the script directly for a readable list of problems.
import assert from "node:assert/strict";
import { validateContent } from "../scripts/validate-content.mjs";

const { problems, stats } = validateContent();
assert.deepEqual(problems, [], `content problems:\n  ${problems.join("\n  ")}`);
const m = stats.minutes;
console.log(`ok: ${stats.units} units, ${stats.lessons} lessons (${Math.min(...m).toFixed(1)}–${Math.max(...m).toFixed(1)} min), ${stats.concepts} concepts, ${stats.questions} questions — all in English and Spanish, US and Mexico, tagged, explained, ending in one of ${stats.actions} real actions`);
