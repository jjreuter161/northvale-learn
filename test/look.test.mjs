// THE LOOK — every text color on every background it's used on meets WCAG
// AA (4.5:1), in Light and Dark; the main button and progress stand out
// from the page (3:1). Read straight from LOOKS in src/core/ui.jsx.
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { join } from "node:path";

const src = readFileSync(join(import.meta.dirname, "../src/core/ui.jsx"), "utf8");
const block = src.slice(src.indexOf("export const LOOKS"), src.indexOf("// Profile colors"));
const looks = {};
for (const [, name, body] of block.matchAll(/(\w+): \{([^}]*)\}/g)) looks[name] = Object.fromEntries([...body.matchAll(/"--(\w+)": "(#[0-9A-Fa-f]{6})"/g)].map((m) => [m[1], m[2]]));
assert.deepEqual(Object.keys(looks), ["white", "navy"]);

const lum = (hex) => {
  const [r, g, b] = [1, 3, 5].map((i) => parseInt(hex.slice(i, i + 2), 16) / 255).map((v) => (v <= 0.03928 ? v / 12.92 : ((v + 0.055) / 1.055) ** 2.4));
  return 0.2126 * r + 0.7152 * g + 0.0722 * b;
};
const ratio = (a, b) => {
  const [hi, lo] = [lum(a), lum(b)].sort((x, y) => y - x);
  return (hi + 0.05) / (lo + 0.05);
};
// [text, background] pairs as the app uses them.
const TEXT = [
  ...["bg", "surface", "surface2", "brandSoft", "rightSoft", "warnSoft"].map((b) => ["ink", b]),
  ...["bg", "surface"].map((b) => ["head", b]),
  ...["bg", "surface", "surface2"].flatMap((b) => [["mid", b], ["low", b]]),
  ["onBrand", "brand"], ["onBrand", "bad"], ["bg", "ink"],
  ["brand", "bg"], ["brand", "surface"], ["brand", "brandSoft"],
  ["right", "rightSoft"], ["right", "surface"], ["warn", "warnSoft"], ["warn", "surface"], ["bad", "badSoft"], ["bad", "surface"],
];
for (const [name, L] of Object.entries(looks)) {
  for (const [fg, bg] of TEXT) {
    assert.ok(L[fg] && L[bg], `${name}: --${fg} and --${bg} are defined`);
    const r = ratio(L[fg], L[bg]);
    assert.ok(r >= 4.5, `${name}: --${fg} on --${bg} is ${r.toFixed(2)}:1 (needs 4.5)`);
  }
  for (const [ui, bg] of [["brand", "bg"], ["brand", "surface2"], ["focus", "bg"]]) assert.ok(ratio(L[ui], L[bg]) >= 3, `${name}: --${ui} stands out from --${bg}`);
}
console.log(`ok: the look (navy and cream, Light and Dark): ${TEXT.length} text pairs meet WCAG AA in both`);
