// The course content passes the validator (scripts/validate-content.mjs):
// both languages and countries, concepts, explanations, facts, actions,
// lesson length. Run the script directly for a readable list of problems.
import assert from "node:assert/strict";
import { validateContent } from "../scripts/validate-content.mjs";

import { spawnSync } from "node:child_process";
import { join } from "node:path";

const { problems, stats } = validateContent();
// The app's course index (titles, minutes, concepts) matches the unit files.
const index = spawnSync(process.execPath, [join(import.meta.dirname, "../scripts/lesson-index.mjs"), "--check"], { encoding: "utf8" });
assert.equal(index.status, 0, index.stderr);
// docs/VERIFY-BEFORE-LAUNCH.md lists every fact, worked example and myth as they are now.
const verify = spawnSync(process.execPath, [join(import.meta.dirname, "../scripts/verify-list.mjs"), "--check"], { encoding: "utf8" });
assert.equal(verify.status, 0, verify.stderr);
assert.deepEqual(problems, [], `content problems:\n  ${problems.join("\n  ")}`);
const m = stats.minutes;
console.log(`ok: ${stats.units} units, ${stats.lessons} lessons (${Math.min(...m).toFixed(1)}–${Math.max(...m).toFixed(1)} min), ${stats.concepts} concepts, ${stats.questions} questions — all in English and Spanish, US and Mexico, tagged, explained, ending in one of ${stats.actions} real actions`);
