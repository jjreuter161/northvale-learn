# The professional pass: before and after

What a tester on a computer said: it feels childish, setup is still phone-sized on a computer, and it looks empty. This pass answers all three.

- `before/` are the screens just before this pass (laptop, 1366px). `after/` are the same screens after (laptop and large desktop, 1366 and 1920px). `option-serif/` is the other heading font.
- Two kinds of learner: **new** (through setup: `1-welcome`, `2-question`, `3-goal`, `4-first-lesson`, then Today, Goals, Practice, Me, Settings) and **weeks** (three weeks in: 28 lessons, a nine-day streak, a goal with money set aside; Today, Goals, Practice, Me, Settings and a lesson question).
- Made by `node docs/design/professional/shots.mjs after` (and `before` with `APP_ROOT=` pointing at an older checkout, and `serif`).

## What changed

| | Before | After |
|---|---|---|
| Headings | Fraunces (soft, rounded serif) | **Inter**, heavier and tighter. Option B: EB Garamond (the logo's face) |
| Corners | cards 24, controls 14–18, lots of pills | cards 12, controls 8–10, tags 6, almost no pills |
| Buttons | chunky, with a bottom edge that pushed in | flat; a plain darkening when pressed |
| Motion | bobbing boat, twinkling star, rippling right answers, springy dialogs, sweeping lighthouse | none of those; a short fade for dialogs; Reduce motion still turns the rest off |
| Pictures | big, with sun and scattered stars; the sea chart had birds and buoys | a short picture on Today (drawn at the card's shape); no stars on the finish screen; a cleaner sea chart with a thin dashed route |
| Wording | "A quick review makes them stick", "islands in the mist", "Voyage complete", "Nicely done" | "A short review helps you keep them", "Show 4 more units", "Year complete" |
| Setup on a computer | a phone-sized strip in the middle | two halves: brand on the left, the question on the right |
| Empty space | one column, then nothing | Today: progress overview, next lessons, this week; Me: achievements and skills; Goals: the next goal as templates; every empty card says what goes there and the one action |

## Decisions for you

1. **The heading font: decided, Inter** (reads as modern finance: Linear, Stripe, Monzo). Option B (EB Garamond, editorial and echoing the logo) stays one switch away for comparing (`?heading=serif` on the address); to adopt it for good, change `DISPLAY` and the heading CSS in `src/core/ui.jsx` (it's marked) and the two landing pages.
2. **The logo's wordmark** is still EB Garamond (it's the brand). If you want it in Inter too, say so.
3. **How far to go on the sea chart.** It's cleaner now, but the island drawings are still illustrations. A truly "refined map" look (a grid, a compass, flat shapes) means redrawing all 18 landmarks, which is a bigger job.
