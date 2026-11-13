// SIZE BUDGET — what a phone downloads to open the app (app.js plus the
// shared files it imports right away), compressed as the server sends it,
// and each unit's own file. Units, legal pages and their pictures load on
// demand. Runs after `npm run build`. Raise a budget only on purpose.
import assert from "node:assert/strict";
import { readFileSync, readdirSync } from "node:fs";
import { join } from "node:path";
import { gzipSync } from "node:zlib";

const WEB = join(import.meta.dirname, "../web");
const BUDGET = { start: 245 * 1024, unit: 14 * 1024 };
const gz = (f) => gzipSync(readFileSync(join(WEB, f))).length;
const app = readFileSync(join(WEB, "app.js"), "utf8");
const first = [...new Set([...app.matchAll(/from"\.\/(chunks\/[^"]+\.js)"/g)].map((m) => m[1]))];
const start = gz("app.js") + first.reduce((n, f) => n + gz(f), 0);
assert.ok(start <= BUDGET.start, `opening the app downloads ${(start / 1024).toFixed(0)} KB (budget ${BUDGET.start / 1024} KB)`);
const units = readdirSync(join(WEB, "chunks")).filter((f) => f.endsWith(".js") && !first.includes(`chunks/${f}`) && !f.startsWith("chunk-"));
assert.ok(units.length >= 17, "each unit is its own file");
for (const f of units) assert.ok(gz(`chunks/${f}`) <= BUDGET.unit, `${f} is ${(gz(`chunks/${f}`) / 1024).toFixed(1)} KB (budget ${BUDGET.unit / 1024} KB)`);
console.log(`ok: opening the app downloads ${(start / 1024).toFixed(0)} KB compressed (budget ${BUDGET.start / 1024} KB); ${units.length} units and pages load on demand, each under ${BUDGET.unit / 1024} KB`);
