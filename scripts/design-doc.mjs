// Keeps the token tables in docs/DESIGN-SYSTEM.md true: they are written from src/core/tokens.js,
// between two markers, and test/design-tokens.test.mjs fails if they are out of date.
//   node scripts/design-doc.mjs        rewrite the tables in the doc
import { readFileSync, writeFileSync } from "node:fs";
import { join } from "node:path";
import { SPACE, RADIUS, TYPE, WEIGHT, LEADING, TOUCH, MOTION } from "../src/core/tokens.js";

const DOC = join(import.meta.dirname, "../docs/DESIGN-SYSTEM.md");
export const START = "<!-- tokens:start — written by scripts/design-doc.mjs from src/core/tokens.js; don't edit by hand -->";
export const END = "<!-- tokens:end -->";

const SPACE_USE = { 1: "an icon and its label; a tight pair", 2: "inside a chip; a label above its value", 3: "between rows in a list; inside a small card", 4: "a phone's side margin; a card's padding; between cards", 5: "between sections; a laptop card's padding", 6: "a laptop's side margin; between large blocks", 7: "a laptop's top and bottom margin; around a hero", 8: "the biggest gap" };
const RADIUS_USE = { 1: "buttons, fields, chips, answer options", 2: "cards, list groups, the lesson's feedback card", 3: "a hero card, a sheet's top corners" };
const TYPE_USE = { cap: "tab labels, small captions, the unit tag", sm: "a second line, a hint, a chip, a table", body: "everything you read by default; buttons; fields", lead: "the text of a lesson card; a main row's title", title: "a card's title; a question", head: "a screen's title", disp: "a hero statement; a finished lesson's title", fig: "a big number (a streak, an amount, a score)" };
const WEIGHT_USE = { 1: "reading text", 2: "buttons, labels, row titles, chips, the tab label", 3: "headings, big numbers, the selected tab" };
const LEADING_USE = { text: "anything you read, over a line", tight: "headings, big numbers, one-line labels" };

const row = (...cells) => `| ${cells.join(" | ")} |`;
export function tables() {
  return [
    "**Spacing** (a 4px base; `--s1` to `--s8`, or the plain number in code)", "",
    row("Variable", "px", "Use"), row("---", "---", "---"),
    ...Object.entries(SPACE).map(([k, v]) => row(`\`--s${k}\``, v, SPACE_USE[k])), "",
    "**Corner radius** (pills and circles are `50%` or `999`)", "",
    row("Variable", "px", "Use"), row("---", "---", "---"),
    ...Object.entries(RADIUS).map(([k, v]) => row(`\`--r${k}\``, v, RADIUS_USE[k])), "",
    "**Text size** (the laptop sizes apply from 1024px wide)", "",
    row("Variable", "Phone", "Laptop", "Use"), row("---", "---", "---", "---"),
    ...Object.entries(TYPE).map(([k, [p, l]]) => row(`\`--t-${k}\``, `${p}px`, `${l}px`, TYPE_USE[k])), "",
    "**Weight** (Inter is a variable font, so these are exact)", "",
    row("Variable", "Value", "Use"), row("---", "---", "---"),
    ...Object.entries(WEIGHT).map(([k, v]) => row(`\`--w${k}\``, v, WEIGHT_USE[k])), "",
    "**Line height**", "",
    row("Variable", "Value", "Use"), row("---", "---", "---"),
    ...Object.entries(LEADING).map(([k, v]) => row(`\`--lh-${k}\``, v, LEADING_USE[k])), "",
    "**Touch targets** (nothing you tap is smaller than the first)", "",
    row("Variable", "px", "Use"), row("---", "---", "---"),
    row("`--touch`", TOUCH.min, "the smallest anything tappable may be (a small button, a chip, a row)"),
    row("`--touch-control`", TOUCH.control, "a field, a segmented control, a normal button"),
    row("`--touch-primary`", TOUCH.primary, "the one main button on a screen; a list row is as tall"),
    row("`--touch-option`", TOUCH.option, "an answer option"), "",
    "**Motion** (exits take 70% as long; with reduced motion every transition and animation is instant)", "",
    row("Variable", "ms", "Use"), row("---", "---", "---"),
    row("`--m-press`", MOTION.press, "a press, a switch, a chip"),
    row("`--m-enter`", MOTION.enter, "a card, a toast or a screen arriving"),
    row("`--m-sheet`", MOTION.sheet, "a sheet or a dialog; a bar or ring filling"),
    row("`--m-glide`", MOTION.glide, "the boat gliding between lessons (a picture, so slower)"),
  ].join("\n");
}

export function withTables(doc) {
  const a = doc.indexOf(START), b = doc.indexOf(END);
  if (a < 0 || b < a) throw new Error(`${DOC} needs the markers ${START} … ${END}`);
  return `${doc.slice(0, a + START.length)}\n\n${tables()}\n\n${doc.slice(b)}`;
}

if (import.meta.url === `file://${process.argv[1]}`) {
  const doc = readFileSync(DOC, "utf8");
  writeFileSync(DOC, withTables(doc));
  console.log("docs/DESIGN-SYSTEM.md: token tables updated");
}
