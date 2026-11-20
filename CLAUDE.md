# Northvale Learn

A free app that teaches money and investing to people aged 15 to 25 in the US and Mexico. Node ESM server (`server/`), React app (`src/`), English and Spanish, phone first with a laptop layout. Everything is simulated: no real money, trades or bank connections.

## Working here

- `npm run build` bundles the app into `web/`; `npm test` runs every test (the browser ones need Google Chrome); `npm run preflight` is the launch check. The tests run the real app in a browser, so a change isn't done until its test passes.
- **Voice:** calm and plain. No exclamation marks, no emoji, no confetti, no guilt, no personal investment or financial advice.
- **Both languages, always.** Every string has English and Spanish (`S("English", "Español")`), and Spanish can run about 30% longer, so nothing may assume a width.
- **Facts** (rates, limits, dates) live in `src/core/facts.js` and are listed in `docs/VERIFY-BEFORE-LAUNCH.md` (`node scripts/verify-list.mjs`). Never write a fact into a lesson as a bare number.
- **Lessons:** follow `docs/CONTENT-STYLE.md`. A unit with `draft: true` is behind the review gate and must not be shown or edited as if it were live.
- **Quality bar:** `docs/QUALITY-BAR.md`. First question inside a minute, nothing empty or broken, instant responses, the same thing done the same way everywhere.
- Size budget: the first download stays under 220 KB compressed (`test/size.test.mjs`).

## Design rules

The look is a system, described in `docs/DESIGN-SYSTEM.md`. Follow it exactly.

1. **Use only tokens.** Color comes from `src/core/colors.js` (as `var(--role)`); text size, weight, line height, spacing, radius, touch size and motion come from `src/core/tokens.js`. Write `fontSize: "var(--t-body)"`, `padding: 16`, `borderRadius: 18`, never `13`, `10px`, `650` or `#fff`. `test/design-tokens.test.mjs` fails on any value outside the tokens, and it runs in `npm test`.
2. **Never invent a style.** Build screens from the components in `src/core/ui.jsx` (Button, Card, ListRow, Choice, Chip, Segmented, Sheet and so on). If a piece you need doesn't exist, say so and ask; don't hand-build a one-off with new numbers.
3. **Any design change needs the owner's approval first.** That includes a new size, weight, color, radius, component, layout or icon style, and a change to a token. When it's approved: change `tokens.js` (or `colors.js`), run `node scripts/design-doc.mjs` to rewrite the tables in the design doc, run `npm test`, and record the decision in the doc.
4. **Keep the color rules:** one red thing per screen (the main button); a picked option is outlined in the text color, never red; a wrong answer is never red and differs by icon, edge and words; red is never body text on navy. Every look must work: Cream, Navy, Navy & cream, Cream & navy, Match my device, and a custom one.
5. **Phone and laptop, both languages, every look.** A screen is checked at 390 and 1366 wide (and 195 for 200% zoom) in English and Spanish before it counts as done. Nothing tappable is under 44px. Keyboard focus is always visible. Reduced motion removes movement.
6. **No new features** while the feature freeze is on: improve what exists.
