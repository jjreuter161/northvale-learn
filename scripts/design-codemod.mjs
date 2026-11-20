// Moves values in src/ onto the design tokens (src/core/tokens.js): each text size,
// weight, spacing and radius that is outside the lists becomes the nearest token.
//   node scripts/design-codemod.mjs           rewrite the files
//   node scripts/design-codemod.mjs --dry     only say what would change
// The scanner (design-scan.mjs) decides what counts: a number written straight into a
// style, such as 14, "10px 14px" or big ? 17 : 15. A size worked out from something else
// (size * 0.4) is left for a person. Where two tokens are equally near, the larger one wins.
import { readFileSync, writeFileSync } from "node:fs";
import { join } from "node:path";
import { scan } from "./design-scan.mjs";
import { ALLOWED, LEADING, TYPE, WEIGHT } from "../src/core/tokens.js";

const ROOT = join(import.meta.dirname, "..");
const nearest = (n, list) => list.reduce((b, v) => (Math.abs(v - n) < Math.abs(b - n) || (Math.abs(v - n) === Math.abs(b - n) && v > b) ? v : b), list[0]);
const FONTS = Object.entries(TYPE).map(([name, [phone]]) => [phone, name]);
const to = {
  font: (n) => `var(--t-${FONTS.find(([px]) => px === nearest(n, FONTS.map((f) => f[0])))[1]})`,
  // 650 was a semibold that sat between two weights: it goes to 600, not up to 700.
  weight: (n) => (n === 650 ? WEIGHT[2] : nearest(n, Object.values(WEIGHT))),
  radius: (n) => (n >= 40 ? 999 : nearest(n, ALLOWED.radius.filter((v) => v !== 999 && v !== 0))),
  space: (n) => nearest(n, ALLOWED.space),
  leading: (n) => (n >= 1.35 ? LEADING.text : LEADING.tight),
};

const dry = process.argv.includes("--dry");
const byFile = {};
for (const x of scan()) if (x.kind !== "color") (byFile[x.file] ||= []).push(x);
let changed = 0, left = 0;
const moved = {};
for (const [file, list] of Object.entries(byFile)) {
  let src = readFileSync(join(ROOT, file), "utf8");
  // From the end of the file backwards, so the positions of the earlier ones stay true.
  for (const x of list.sort((a, b) => b.abs - a.abs)) {
    if (x.n === "computed" || x.kind === "motion") { left++; continue; }
    const v = to[x.kind](x.n);
    // Inside a string or CSS text the token goes in bare; a bare number in code becomes a string.
    const text = x.kind === "font" ? (x.quoted || x.px ? v : `"${v}"`) : `${v}${x.px ? "px" : ""}`;
    src = src.slice(0, x.abs) + text + src.slice(x.abs + x.len);
    const key = `${x.kind} ${x.n} → ${v}`;
    moved[key] = (moved[key] || 0) + 1;
    changed++;
  }
  if (!dry) writeFileSync(join(ROOT, file), src);
}
if (dry) console.log(Object.entries(moved).sort().map(([k, n]) => `${String(n).padStart(4)}  ${k}`).join("\n"));
console.log(`${dry ? "would change" : "changed"} ${changed} values in ${Object.keys(byFile).length} files; ${left} computed ones left for a person`);
