// The course content passes the validator (scripts/validate-content.mjs):
// both languages and countries, concepts, explanations, facts, actions,
// lesson length. Run the script directly for a readable list of problems.
import assert from "node:assert/strict";
import { validateContent } from "../scripts/validate-content.mjs";
import { UNITS } from "../src/modules/lessons/units/all.js";

import { spawnSync } from "node:child_process";
import { readFileSync } from "node:fs";
import { join } from "node:path";

const { problems, stats } = validateContent();
// The app's course index (titles, minutes, concepts) matches the unit files.
const index = spawnSync(process.execPath, [join(import.meta.dirname, "../scripts/lesson-index.mjs"), "--check"], { encoding: "utf8" });
assert.equal(index.status, 0, index.stderr);
// docs/VERIFY-BEFORE-LAUNCH.md lists every fact, worked example and myth as they are now.
const verify = spawnSync(process.execPath, [join(import.meta.dirname, "../scripts/verify-list.mjs"), "--check"], { encoding: "utf8" });
assert.equal(verify.status, 0, verify.stderr);
assert.deepEqual(problems, [], `content problems:\n  ${problems.join("\n  ")}`);
// Error reports carry the release's version.
const version = JSON.parse(readFileSync(join(import.meta.dirname, "../package.json"), "utf8")).version;
assert.ok(readFileSync(join(import.meta.dirname, "../src/core/errors.jsx"), "utf8").includes(`const VERSION = "${version}";`), `src/core/errors.jsx's VERSION should be ${version}`);
const m = stats.minutes;
console.log(`ok: ${stats.units} units, ${stats.lessons} lessons (${Math.min(...m).toFixed(1)}–${Math.max(...m).toFixed(1)} min), ${stats.concepts} concepts, ${stats.questions} questions — all in English and Spanish, US and Mexico, tagged, explained, ending in one of ${stats.actions} real actions`);

// A card's worked example is checked like arithmetic: the parts add up to the total, in both currencies, and match their shares.
const withExample = UNITS.flatMap((u) => u.lessons).flatMap((l) => l.steps).find((x) => x.example);
assert.ok(withExample, "some card has a worked example");
const keep = JSON.stringify(withExample.example);
const exampleProblems = (change) => { withExample.example = JSON.parse(keep); change(withExample.example); return validateContent().problems.filter((x) => /example/.test(x)); };
assert.deepEqual(exampleProblems(() => {}), [], "the shipped examples are right");
assert.ok(exampleProblems((e) => { e.split[0][1] = { en: "{$550|7500}", es: "{$550|7500}" }; }).some((x) => /add up to/.test(x)), "parts that don't add up to the total are caught");
assert.ok(exampleProblems((e) => { e.split[0][2] += 5; }).some((x) => /add up to 100|of the total/.test(x)), "shares that don't match are caught");
assert.ok(exampleProblems((e) => { e.split[1] = ["x"]; }).some((x) => /each \[label, amount, share\]/.test(x)), "a malformed part is a clean problem, not a crash");
withExample.example = JSON.parse(keep);
console.log("ok: a worked example's parts must add up to its total (US and Mexico) and match their shares");
