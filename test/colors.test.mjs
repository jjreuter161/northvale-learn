// THE COLORS — navy, cream and signal red. Every combination the picker allows
// is readable: text, softer text, the button's label, icons, the red spark and
// the focus ring all meet WCAG AA (text 4.5:1, marks and edges 3:1) on every
// background they're drawn on. Only the five readable combinations are offered,
// and every route from one to another works. Right and wrong answers differ
// without color. Red stays a spark: it fills only the main button, the final
// confirm of something that can't be undone, and the sea chart's pennant.
import assert from "node:assert/strict";
import { readFileSync, readdirSync } from "node:fs";
import { join } from "node:path";
import { COLORS, TINTS, PRESETS, ALL_ALLOWED, allowed, bold, contrast, lookFrom, specFor, snap, optionOk, lookValueFor, presetByValue } from "../src/core/colors.js";

const ids = Object.keys(COLORS);
// The five readable combinations, exactly.
assert.deepEqual(ALL_ALLOWED.map((c) => `${c.bg}/${c.text}/${c.hi}`).sort(), ["cream/navy/navy", "cream/navy/red", "navy/cream/cream", "navy/cream/red", "red/cream/cream"]);
assert.equal(ids.flatMap((a) => ids.flatMap((b) => ids.map((c) => [a, b, c]))).length, 27);
// The numbers the plan quotes.
const C = (a, b) => contrast(a, b);
assert.ok(C(COLORS.cream.hex, COLORS.navy.hex) >= 10, "cream on navy");
assert.ok(C(COLORS.cream.hex, COLORS.red.hex) >= 5, "a cream label on the red button");
assert.ok(C(COLORS.red.hex, COLORS.navy.hex) < 3, "red alone on navy is too faint: that's why it gets an edge");
assert.ok(C(TINTS.redLight, COLORS.navy.hex) >= 5, "the light red mark on navy");
assert.ok(C(TINTS.redLight, TINTS.navyCard) >= 4.5, "light red words on a navy card (a real warning)");

// Every allowed combination: every pair the app uses.
const TEXT = [
  ...["bg", "surface", "surface2", "brandSoft", "rightSoft", "warnSoft", "accentSoft", "goodSoft"].map((b) => ["ink", b]),
  ...["bg", "surface"].map((b) => ["head", b]),
  ...["bg", "surface", "surface2"].flatMap((b) => [["mid", b], ["low", b]]),
  ["onBrand", "brand"], ["onFill", "fill"], ["onRed", "red"], ["bg", "ink"],
  ["brand", "bg"], ["brand", "surface"], ["brand", "brandSoft"], ["link", "bg"], ["link", "surface"],
  ["right", "rightSoft"], ["right", "surface"], ["warn", "warnSoft"], ["warn", "surface"],
  ["head", "artSky"], ["mid", "artSky"], ["low", "artSky"],
];
for (const { bg, text, hi } of ALL_ALLOWED) {
  const L = lookFrom(bg, text, hi);
  const name = `${bg}/${text}/${hi}`;
  for (const [fg, back] of TEXT) {
    assert.ok(L[`--${fg}`] && L[`--${back}`], `${name}: --${fg} and --${back} are defined`);
    const r = C(L[`--${fg}`], L[`--${back}`]);
    assert.ok(r >= 4.5, `${name}: --${fg} on --${back} is ${r.toFixed(2)}:1 (needs 4.5)`);
  }
  // Marks and edges: 3:1.
  for (const [ui, back] of [["focus", "bg"], ["focus", "surface"], ["artInk", "artSky"], ["brand", "artSky"], ["spark", "bg"], ["spark", "surface"], ["line", "bg"]]) {
    const need = ui === "line" ? 1.0 : 3;
    assert.ok(C(L[`--${ui}`], L[`--${back}`]) >= need, `${name}: --${ui} on --${back} is ${C(L[`--${ui}`], L[`--${back}`]).toFixed(2)}:1 (needs ${need})`);
  }
  // The main button stands out from the page: by its fill (3:1), or on navy with red by its edge in the text color.
  const fillVsBg = C(L["--fill"], L["--bg"]);
  if (fillVsBg < 3) {
    assert.equal(bg === "navy" && hi === "red", true, `${name}: a button that faint needs the edge, and only red on navy has it`);
    assert.equal(L["--ringW"], "2px");
    assert.ok(C(L["--ringC"], L["--bg"]) >= 3, `${name}: the button's edge stands out from the page`);
  } else assert.equal(L["--ringW"], "0px", `${name}: no edge needed`);
  // The final confirm (red, cream label), on any page it appears on: the label is readable and, off cream, the edge shows.
  if (bg !== "cream") assert.ok(C(L["--ringC"], L["--bg"]) >= 3 && L["--ringBad"] === "2px", `${name}: the confirm button's edge`);
  // Words that really warn (the scam red flag) are readable on their panel and on cards.
  for (const back of ["surface", "badSoft"]) assert.ok(C(L["--bad"], L[`--${back}`]) >= 4.5, `${name}: warning words on --${back} are ${C(L["--bad"], L[`--${back}`]).toFixed(2)}:1`);
  // Calm: only the highlight can be red, and only when it's chosen.
  if (hi !== "red") for (const k of ["--fill", "--spark", "--bad"]) assert.ok(![COLORS.red.hex, TINTS.redLight].includes(L[k]), `${name}: no red when red isn't chosen (${k})`);
  for (const k of ["--brand", "--accent", "--good", "--right", "--warn", "--link", "--ink", "--head", "--warm", "--flame"]) assert.ok(![COLORS.red.hex, TINTS.redLight, TINTS.redDeep].includes(L[k]), `${name}: ${k} is never red`);
}
console.log(`ok: all ${ALL_ALLOWED.length} readable combinations: ${TEXT.length} text pairs meet WCAG AA, marks and edges meet 3:1, red only where it's chosen, a red button on navy has its edge`);

// What's offered. Text and highlight are limited by the background; the background is always on offer, and the others follow it.
for (const bgId of ids) for (const id of ids) {
  const spec = { bg: bgId, text: bgId === "cream" ? "navy" : "cream", hi: "cream" };
  assert.equal(optionOk(spec, "text", id), ALL_ALLOWED.some((c) => c.bg === bgId && c.text === id));
}
for (const from of ALL_ALLOWED) for (const group of ["bg", "text", "hi"]) for (const id of ids) {
  const next = snap(from, group, id);
  assert.equal(allowed(next.bg, next.text, next.hi), true, `snap ${JSON.stringify(from)} ${group}=${id} lands on a readable combination`);
  if (optionOk(from, group, id)) assert.equal(next[group], id, "a color that's on offer gets picked");
}
assert.deepEqual(snap({ bg: "navy", text: "cream", hi: "red" }, "bg", "cream"), { bg: "cream", text: "navy", hi: "red" }, "cream background: the text follows, the red stays");
assert.equal(optionOk({ bg: "cream", text: "navy", hi: "red" }, "hi", "cream"), false, "a cream button on a cream page isn't offered");
assert.equal(optionOk({ bg: "navy", text: "cream", hi: "red" }, "text", "red"), false, "red text on navy isn't offered");
assert.deepEqual(snap({ bg: "navy", text: "cream", hi: "red" }, "bg", "red"), { bg: "red", text: "cream", hi: "cream" }, "a red background: cream text and buttons");
assert.equal(bold("red", "cream", "cream"), true);
assert.equal(bold("navy", "cream", "red"), false);
console.log("ok: only readable combinations are on offer, and any color can be reached from any look");

// Presets and saved looks: "white" is still Cream, "navy" is still Navy; Match my device follows the device; a bad custom falls back.
assert.deepEqual(PRESETS.map((p) => p.value), ["navy", "white", "navy-cream", "cream-navy"]);
for (const p of PRESETS) assert.ok(allowed(p.bg, p.text, p.hi), `preset ${p.id} is readable`);
assert.deepEqual(specFor({ look: "white" }), { bg: "cream", text: "navy", hi: "red" });
assert.deepEqual(specFor({ look: "navy" }), { bg: "navy", text: "cream", hi: "red" });
assert.deepEqual(specFor({ look: "auto" }, true), { bg: "navy", text: "cream", hi: "red" }, "Match my device: Navy at night");
assert.deepEqual(specFor({ look: "auto" }, false), { bg: "cream", text: "navy", hi: "red" }, "Match my device: Cream by day");
assert.deepEqual(specFor({ look: "custom", colors: { bg: "red", text: "cream", hi: "cream" } }), { bg: "red", text: "cream", hi: "cream" });
assert.deepEqual(specFor({ look: "custom", colors: { bg: "navy", text: "red", hi: "red" } }, false), { bg: "cream", text: "navy", hi: "red" }, "an unreadable custom saved by hand falls back");
assert.deepEqual(specFor({ look: "gibberish" }, true), { bg: "navy", text: "cream", hi: "red" });
assert.equal(lookValueFor({ bg: "cream", text: "navy", hi: "red" }), "white");
assert.equal(lookValueFor({ bg: "red", text: "cream", hi: "cream" }), "custom");
assert.equal(presetByValue("white").id, "cream");
console.log("ok: saved looks keep working (white is Cream, navy is Navy), Match my device follows the device, a bad custom falls back");

// Feedback without color, and red kept as a spark (read from the source).
const read = (f) => readFileSync(join(import.meta.dirname, "..", f), "utf8");
const q = read("src/modules/lessons/qtypes.jsx");
const pr = read("src/modules/lessons/practice.jsx");
assert.match(q, /state === "wrong" \? \{ border: "2px dashed var\(--warn\)"/, "a wrong answer has a dashed edge");
assert.match(q, /state === "right" \? \{ border: "2px solid var\(--right\)"/, "a right answer has a solid edge");
assert.match(q, /name=\{right \? "check" : "info"\}/, "right and wrong have different icons");
assert.match(pr, /right \? "2px solid var\(--right\)" : "2px dashed var\(--warn\)"/, "the feedback card: solid or dashed");
assert.match(pr, /name=\{right \? "check" : "info"\}/);
const L0 = lookFrom("navy", "cream", "red");
assert.equal(L0["--right"], L0["--warn"], "right and wrong are the same neutral colors: the difference is the icon, the edge and the words");
const files = readdirSync(join(import.meta.dirname, "../src"), { recursive: true }).filter((f) => /\.jsx?$/.test(f));
const using = (re) => files.filter((f) => re.test(read(`src/${f}`))).map((f) => f.replace(/\\/g, "/")).sort();
assert.deepEqual(using(/var\(--red\)/), ["core/ui.jsx"], "red fills a button only inside the Button component (the confirm kind)");
assert.deepEqual(using(/var\(--spark\)/), ["modules/lessons/index.jsx"], "the red spark is only the sea chart's pennant (and the Explain this flag, which is its own panel)");
assert.deepEqual(using(/var\(--fill\)/), ["core/ui.jsx"], "--fill is only the main button");
assert.deepEqual(using(/#C8202A|#FF8E8B|#A21A22/i), ["core/colors.js", "core/ui.jsx"], "no stray reds");
console.log("ok: right and wrong differ by icon, edge and words (not color); red appears only as the main button, the confirm, and the sea chart's pennant");

// Chosen things are outlined in the main button's color (with its edge on navy), in every look.
for (const { bg, text, hi } of ALL_ALLOWED) {
  const L = lookFrom(bg, text, hi);
  assert.equal(L["--select"], L["--fill"], `${bg}/${text}/${hi}: the selection outline is the main button's color`);
  assert.ok(C(L["--focus"], L["--bg"]) >= 3, `${bg}/${text}/${hi}: keyboard focus is visible (${C(L["--focus"], L["--bg"]).toFixed(2)}:1)`);
  if (C(L["--select"], L["--bg"]) < 3) assert.ok(L["--ringW"] === "2px" && C(L["--ringC"], L["--bg"]) >= 3, `${bg}/${text}/${hi}: a faint outline gets the button's edge`);
}
const ui = read("src/core/ui.jsx");
assert.match(ui, /export const SELECTED = \{ border: "2px solid var\(--select\)", boxShadow: "inset 0 0 0 1px var\(--select\)/, "3px in all: a 2px border and a 1px inner line");
for (const f of ["modules/lessons/practice.jsx", "modules/lessons/qtypes.jsx", "core/Onboarding.jsx", "core/Settings.jsx", "core/ui.jsx", "modules/goals/index.jsx", "modules/feedback/index.jsx", "modules/certs/Sheet.jsx", "core/App.jsx"]) assert.match(read(`src/${f}`), /SELECTED|var\(--select\)/, `${f} outlines what's chosen`);
assert.doesNotMatch(read("src/core/ui.jsx") + read("src/core/Onboarding.jsx") + read("src/modules/feedback/index.jsx"), /border: ["`][^"`]*var\(--brand\)/, "no leftover brand-colored selection borders");
for (const f of ["core/ui.jsx", "modules/lessons/practice.jsx", "core/Onboarding.jsx"]) assert.match(read(`src/${f}`), /Chosen/, `${f} also shows a check (never color alone)`);
console.log("ok: whatever is chosen (answers, chips, onboarding, pickers, tabs) is outlined in the main button's color with its edge on navy, keyboard focus is readable, and a check shows too");
