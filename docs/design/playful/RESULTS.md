# Playful navy and cream: results

Built on the `milestone-4.5` branch, following the approved plan (`PLAN.md`): Playful, the island map, Fraunces, sunrise coral and the north star. Nothing is merged into main or deployed.

**Pictures:**
- `before-after.png`: 9 screens, before and after.
- `after/`: Light, Dark, Spanish and the empty screens.
- `after/first5/`: a new learner's first five minutes again, in English/US and Spanish/Mexico. This folder also has `finish.webm`, the finish moment.
- To redo them: `npm run build && node docs/design/playful/capture.mjs` (and `node docs/design/fun/capture.mjs` for the first five minutes).

## What changed

- **Shapes:**
  - rounder cards (24) with a soft lift;
  - buttons with a 3 px pressable edge that pushes in when tapped;
  - the current tab sits in a pill;
  - bigger headings.
- **Fraunces (soft)** for page titles, card titles, lesson questions and big numbers. Inter stays for everything else. It's self-hosted in `web/fonts` and cached for offline use.
- **One warm accent, sunrise coral** (`--warm`). It's used only in pictures, celebrations and the streak glow; green still means right and amber still means behind.
- **Pictures** (`src/core/art.js`), all small inline SVGs, hidden from screen readers:
  - 17 unit scenes;
  - 20 illustrated achievement badges;
  - scenes for Welcome, the empty screens (Practice before it opens, no goal yet) and the end of the course.
- **Wave edges** in five places only (the empty screens' pictures have their own small sea): the lesson card's picture, Welcome, Lesson complete, the end of the course, and the landing page (twice).
- **The course as a voyage:**
  - units you've passed are islands on a sea map (tap one to see its lessons);
  - the boat sits at your current lesson and glides to the next one when you come back from finishing;
  - the boat rides the lesson's progress bar;
  - "Saved so far" on Goals is a route to an island.
- **Motion:**
  - the logo's sails fill with the day's XP, and its star turns coral when the goal is met;
  - a ripple on a right answer;
  - the ring rises like a sun on Lesson complete, and the waves drift for a few seconds;
  - the streak star glows from 7 days (brighter at 30, with rays at 100);
  - sheets open with a small spring;
  - a bobbing boat instead of "…" while loading;
  - tapping the logo's star makes it twinkle.
  - All of it stops with Reduce motion (the app's setting or the phone's).
- **The streak icon** is now the north star instead of the flame.
- **The landing page** (English and Spanish) has the heading font, the sea under the hero and after the brand story, and new screenshots.

## Checked

- **Tests:** all 109 checks pass, including the browser click-through.
- **New checks:**
  - the contrast test now covers 33 text pairs, including text over the pictures' sky, plus the boat and the route on the sea map, in Light and Dark;
  - a browser check that an island opens its unit, that there's one boat at the current lesson, and that every new animation moves with motion on and stops with Reduce motion.
- **The first five minutes, again, in both languages:** Welcome → a lesson with the new question types → Lesson complete → Today. I fixed three things along the way:
  - the "20 of 20 XP" line sat on the waves;
  - a small star overlapped it;
  - the Spanish welcome was crowded.
- **Size:**
  - The app is +27.7 KB, about +9 KB as sent (gzip), or +2.7%.
  - The heading font is +62 KB, once; after that it's cached and works offline.
  - The landing page is +3.4 KB.
- **On a slow phone** (Chrome with a 4× slower CPU and slow 4G, 150 ms and 1.6 Mbps; median of 3 runs):

  | | Before | After |
  |---|---|---|
  | Today on screen, first visit | 2.62 s | 2.69 s |
  | Largest paint, first visit | 2.84 s | 3.07 s |
  | Today on screen, next visit | 2.54 s | 2.54 s |
  | Largest paint, next visit | 2.52 s | 2.69 s |
  | Slow frames while scrolling the course | 0 | 0 |

  The ~0.2 s later largest paint is the heading font swapping in. Preloading the font made the first visit slower (3.3 s), because it competes with the app download, so I left it out.
- **`npm run preflight` three times in a row.**

## Decisions for you

None are needed to keep going. Two small things you could change:

1. **The heading font on a first visit over a slow connection:** headings show in Georgia for a moment, then switch to Fraunces (about 0.2 s). The other option is to keep Georgia for that whole first visit and use Fraunces from the second visit on. I'd keep it as is.
2. **The island map shows the units you've passed, 3 to a row.** After all 17 units it's 6 rows tall (about 680 px on a phone), which is still shorter than the 17 rows it replaces (about 1,190 px). Fine as is.
