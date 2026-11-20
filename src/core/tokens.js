// DESIGN TOKENS — the one list of values the interface may use for text size,
// weight, spacing, corner radius, touch size and motion (docs/DESIGN-SYSTEM.md).
// Colors are not here: they stay in colors.js (navy, cream, signal red and their
// tints; `lookFrom` turns a look into CSS variables). Everything else comes from
// this file, as CSS variables for styles and as plain numbers for code.
//
// A screen asks for a token (`fontSize: "var(--t-sm)"`, `padding: 16`, `borderRadius: 18`)
// and never invents a value. test/design-tokens.test.mjs fails when a value outside
// these lists is added, and its baseline can only go down. Changing a value here, or
// adding one, is a design change and needs the owner's approval (CLAUDE.md, "Design rules").

// Spacing, on a 4px base. --s1 … --s8. Gutters are 16 on a phone and 32 to 48 on a laptop.
export const SPACE = { 1: 4, 2: 8, 3: 12, 4: 16, 5: 24, 6: 32, 7: 48, 8: 64 };
// Three corner radii (controls, cards, hero cards and sheets); pills and circles are 50% or 999.
export const RADIUS = { 1: 12, 2: 18, 3: 28 };
// Eight text sizes: [phone, laptop]. The laptop scale applies from 1024px wide.
export const TYPE = { cap: [12, 13], sm: [14, 15], body: [16, 18], lead: [18, 20], title: [22, 26], head: [28, 34], disp: [36, 46], fig: [44, 56] };
// Three weights (Inter is a variable font, so these are exact).
export const WEIGHT = { 1: 450, 2: 600, 3: 700 };
// Line height: 1.5 for text you read, 1.2 for headings and big numbers.
export const LEADING = { text: 1.5, tight: 1.2 };
// Touch targets: nothing you tap is smaller than min; a main button is primary.
export const TOUCH = { min: 44, control: 52, primary: 56 };
// Motion, in milliseconds: a press, something entering, a sheet, and the boat gliding between lessons (a picture, so slower). Exits take 70% as long. Reduced motion makes it instant.
export const MOTION = { press: 120, enter: 200, sheet: 320, glide: 700 };

// What the design-token test accepts as a plain number in code.
export const ALLOWED = {
  space: [0, ...Object.values(SPACE)],
  radius: [0, ...Object.values(RADIUS), 999],
  weight: Object.values(WEIGHT),
  leading: Object.values(LEADING),
};

export function tokensCss() {
  const vars = (i) => [
    ...Object.entries(SPACE).map(([k, v]) => `--s${k}:${v}px`),
    ...Object.entries(RADIUS).map(([k, v]) => `--r${k}:${v}px`),
    ...Object.entries(TYPE).map(([k, v]) => `--t-${k}:${v[i]}px`),
  ];
  const fixed = [...Object.entries(WEIGHT).map(([k, v]) => `--w${k}:${v}`), ...Object.entries(MOTION).map(([k, v]) => `--m-${k}:${v}ms`), ...Object.entries(LEADING).map(([k, v]) => `--lh-${k}:${v}`), `--touch:${TOUCH.min}px`, `--touch-control:${TOUCH.control}px`, `--touch-primary:${TOUCH.primary}px`];
  return `:root{${[...vars(0), ...fixed].join(";")}}@media(min-width:1024px){:root{${Object.entries(TYPE).map(([k, v]) => `--t-${k}:${v[1]}px`).join(";")}}}`;
}
