// DESIGN TOKENS — the interface uses only the values in src/core/tokens.js
// (docs/DESIGN-SYSTEM.md): eight text sizes, three weights, two line heights,
// nine spacing steps, three corner radii, and the colors in colors.js. A
// style with any other number fails this test, so the look can't drift back
// into 22 sizes and 16 radii. To change a value, change tokens.js and the
// design doc together, and ask the owner first (CLAUDE.md, "Design rules").
import assert from "node:assert/strict";
import { existsSync, readFileSync, readdirSync } from "node:fs";
import { join } from "node:path";
import { scan, scanSource, files } from "../scripts/design-scan.mjs";
import { SPACE, RADIUS, TYPE, WEIGHT, LEADING, TOUCH, MOTION, ALLOWED, tokensCss } from "../src/core/tokens.js";

const ROOT = join(import.meta.dirname, "..");

// 1. Nothing in src/ steps outside the tokens.
const found = scan();
const near = (x) => (x.kind === "motion" ? "a --m-* duration (press, enter, sheet, glide)" : x.kind === "font" ? "a --t-* size (cap, sm, body, lead, title, head, disp, fig)" : x.kind === "color" ? "a color from colors.js (a --var in a style)" : x.kind === "weight" ? `one of ${ALLOWED.weight.join(", ")}` : x.kind === "leading" ? `${ALLOWED.leading.join(" or ")}` : x.kind === "radius" ? `one of ${ALLOWED.radius.join(", ")}` : `one of ${ALLOWED.space.join(", ")}`);
assert.equal(found.length, 0, `${found.length} values are outside the design tokens. Use a token instead (docs/DESIGN-SYSTEM.md); a new value is a design change that needs the owner's approval.\n` + found.slice(0, 25).map((x) => `  ${x.file}:${x.line}  ${x.prop}: ${x.value}   → ${near(x)}`).join("\n") + (found.length > 25 ? `\n  …and ${found.length - 25} more (node scripts/design-scan.mjs --list)` : ""));
console.log(`ok: ${files().length} source files use only the design tokens: text sizes, weights, line heights, spacing, radii, durations and colors`);

// 2. The check itself can fail: each kind of stray value is caught, and the allowed ones are not.
const bads = {
  "an odd padding": ['<div style={{ padding: 14 }} />', "space"],
  "an odd padding in a string": ['<div style={{ padding: "10px 16px" }} />', "space"],
  "an odd gap in a choice": ['<div style={{ gap: big ? 6 : 8 }} />', "space"],
  "an odd margin in CSS": [".a{margin-top:10px}", "space"],
  "a size in pixels": ['<p style={{ fontSize: 13 }} />', "font"],
  "a size in CSS": [".a{font-size:15px}", "font"],
  "a size worked out from another": ["<p style={{ fontSize: size * 0.4 }} />", "font"],
  "an odd weight": ["<p style={{ fontWeight: 650 }} />", "weight"],
  "an odd radius": ["<p style={{ borderRadius: 10 }} />", "radius"],
  "an odd line height": ["<p style={{ lineHeight: 1.45 }} />", "leading"],
  "a duration in seconds": ['<div style={{ transition: "width .4s" }} />', "motion"],
  "a duration in CSS": [".a{animation:nvIn .2s ease-out both}", "motion"],
  "a hex color": ['<p style={{ color: "#C8202A" }} />', "color"],
  "an rgba color": ['<p style={{ background: "rgba(0,0,0,.3)" }} />', "color"],
};
for (const [what, [code, kind]] of Object.entries(bads)) assert.ok(scanSource(code).some((x) => x.kind === kind), `the check should catch ${what}: ${code}`);
const goods = [
  '<div style={{ padding: 16, gap: 8, margin: "0 auto", marginTop: -4 }} />',
  '<div style={{ padding: "12px 24px", paddingBottom: "calc(96px + env(safe-area-inset-bottom))" }} />',
  '<p style={{ fontSize: "var(--t-body)", fontWeight: 600, lineHeight: 1.5, borderRadius: 18 }} />',
  '<p style={{ fontSize: big ? "var(--t-title)" : "var(--t-lead)", borderRadius: "50%" }} />',
  '<p style={{ fontSize: size }} />', // a size passed in (the wordmark)
  '<p style={{ borderRadius: 999, color: "var(--brand)" }} />',
  "<p style={{ fontSize: step.q.length > 110 ? \"var(--t-head)\" : \"var(--t-title)\" }} />", // a number in a test, not a size
  "<p style={{ padding: `${size * 2}px 16px` }} />", // a calculation inside a template
  '<div style={{ transition: "width var(--m-sheet) ease-out" }} />',
  ".a{transition:filter var(--m-press) ease-out,background-color var(--m-press) ease-out}",
  "@media (prefers-reduced-motion: reduce){*{animation-duration:.01ms!important;transition-duration:.01ms!important}}",
  "// padding: 14 and #fff in a comment",
];
for (const code of goods) assert.deepEqual(scanSource(code), [], `the check should allow: ${code}`);
console.log("ok: the check catches an odd padding, gap, margin, size, weight, radius, line height, duration or color, and lets the tokens through");

// 3. The token list itself is sound.
const vals = (o) => Object.values(o);
assert.ok(vals(SPACE).every((v) => v % 4 === 0), "spacing is on a 4px base");
assert.deepEqual(vals(SPACE), [...vals(SPACE)].sort((a, b) => a - b), "spacing steps go up");
assert.deepEqual(vals(RADIUS), [...vals(RADIUS)].sort((a, b) => a - b), "radii go up");
assert.equal(vals(RADIUS).length, 3, "three corner radii");
assert.equal(Object.keys(TYPE).length, 8, "eight text sizes");
assert.deepEqual(vals(TYPE).map((v) => v[0]), vals(TYPE).map((v) => v[0]).sort((a, b) => a - b), "text sizes go up");
for (const [name, [phone, laptop]] of Object.entries(TYPE)) assert.ok(laptop >= phone && laptop - phone <= 12, `${name}: the laptop size is the phone size or a little more`);
assert.ok(TYPE.body[0] >= 16, "body text is at least 16px on a phone (iPhones zoom into smaller inputs)");
assert.ok(TYPE.cap[0] >= 12, "the smallest text is at least 12px");
assert.equal(vals(WEIGHT).length, 3, "three weights");
assert.equal(vals(LEADING).length, 2, "two line heights");
assert.ok(TOUCH.min >= 44 && TOUCH.control >= TOUCH.min && TOUCH.primary >= TOUCH.control, "touch targets are at least 44px, with the main button biggest");
assert.ok(MOTION.press < MOTION.enter && MOTION.enter < MOTION.sheet && MOTION.sheet <= 400, "motion is quick: a press, something entering, a sheet");
assert.ok(MOTION.glide >= MOTION.sheet && MOTION.glide <= 1000, "only the boat (a picture) moves slower, and under a second");
console.log("ok: spacing is on a 4px base, text is at least 12px (body 16px), touch targets at least 44px, motion under 400ms");

// 4. Every token the code asks for exists, and is in the page's CSS.
const css = tokensCss();
const defined = new Set([...css.matchAll(/(--[\w-]+):/g)].map((m) => m[1]));
const used = new Map();
for (const f of files()) for (const m of readFileSync(f, "utf8").matchAll(/var\((--(?:t|s|r|w|m|lh|touch)(?:-[a-z]+|\d)?)\b/g)) used.set(m[1], f);
for (const [name, file] of used) assert.ok(defined.has(name), `${file} uses var(${name}), which tokens.js doesn't define`);
const ui = readFileSync(join(ROOT, "src/core/ui.jsx"), "utf8");
assert.match(ui, /GLOBAL_CSS = `\s*\$\{tokensCss\(\)\}/, "the page's CSS starts with the token variables");
assert.match(css, /@media\(min-width:1024px\)\{:root\{--t-cap:13px/, "the laptop sizes apply from 1024px");
console.log(`ok: all ${used.size} token variables the code uses are defined (${defined.size} in all), and the laptop sizes switch on at 1024px`);

// 5. The rules are written down where the next person will read them.
const doc = existsSync(join(ROOT, "docs/DESIGN-SYSTEM.md")) ? readFileSync(join(ROOT, "docs/DESIGN-SYSTEM.md"), "utf8") : "";
const missing = [...defined].filter((name) => !doc.includes(name));
assert.deepEqual(missing, [], `docs/DESIGN-SYSTEM.md should list every token: missing ${missing.join(", ")}`);
const rules = existsSync(join(ROOT, "CLAUDE.md")) ? readFileSync(join(ROOT, "CLAUDE.md"), "utf8") : "";
assert.match(rules, /## Design rules/, 'CLAUDE.md has a "Design rules" section');
assert.match(rules, /owner'?s? approval/i, "the rules say a design change needs the owner's approval");
assert.match(rules, /tokens\.js/, "the rules point at tokens.js");
console.log("ok: docs/DESIGN-SYSTEM.md lists every token, and CLAUDE.md carries the design rules");
