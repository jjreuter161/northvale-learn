# Playful navy and cream, Step 1: plan and mockups (nothing is built yet)

**The test for every screen:** playful enough that a teen enjoys it, and polished enough that a 25-year-old wouldn't be embarrassed to use it in public. Think Headspace, Airbnb or Monzo: friendly shapes, warm pictures and small fun moments. No mascots or faces, no cartoon characters, no childish wording and no confetti.

When this is approved, it gets built on the `milestone-4.5` branch, not main, so testers keep a stable app.

**The mockups** (made from `mockups.mjs`; `mockups.html` shows them all):
1. `1-calm-vs-playful.png`: Today, Lesson complete, the Learn path (without and with islands) and Welcome, each in a calm and a playful version.
2. `2-screens.png`: a lesson question, a right answer, Goals, Practice, Me, an empty screen, the whole course finished, and Today in Spanish.
3. `3-dark.png`: dark mode.
4. `4-fonts.png`: three heading fonts.
5. `5-pictures-badges-motion.png`:
   - 5 unit pictures and 5 badges, light and dark;
   - the accent color (coral or sand) and its contrast checks;
   - motion as still frames;
   - the two button styles.

## Calm or playful

| | Calm | Playful |
|---|---|---|
| Corners | Cards 22, buttons 16 | Cards 28, buttons 20 |
| Buttons | A soft shadow; pressing pushes it in | A 3 px darker edge underneath; pressing pushes it in |
| Heading font | Page titles and big numbers | Also card titles and lesson questions |
| Pictures | Small, beside the lesson title | A scene across the top of the lesson card, with a wave edge |
| Lesson complete | The ring, plain | The ring rises like a sun over the sea, with a few small stars |
| Welcome | The logo and words | A full sea scene above the logo |
| Learn path | A route with the boat at your lesson | The same, plus an island map of the units |

Both versions get the same pills, accent, badges, motion and dark mode.

## Everything that would change

1. **Shapes.**
   - Rounder cards and buttons, and pill-shaped chips.
   - The current tab sits in a soft pill.
   - More space, and bigger headings: Today goes from 30 to 36 px.
2. **A heading font** for page titles, big numbers and (in Playful) card titles and lesson questions. Inter stays for everything else.
   - The options are Fraunces (soft), Bricolage Grotesque and Nunito.
   - It would be self-hosted, like Inter, with no Google Fonts.
3. **One warm accent: sunrise coral** (#E9805F; #F29B7D in dark mode), plus a soft tint.
   - It's used only in pictures, celebrations and highlights: the streak glow, the small stars, and the logo's star once the day's goal is met.
   - It never carries a meaning. Green still means right, amber still means behind.
   - Text never uses the light coral (2.4:1 on cream). Navy on coral is 4.8:1.
4. **A sailing picture style:** flat shapes in navy, cream and coral (waves, sails, stars, a lighthouse, islands, the horizon).
   - Where pictures go:
     - one per unit (17; 5 are drawn: Budgeting, Saving, Scams, Compound interest, Retirement);
     - Welcome;
     - empty screens;
     - Lesson complete;
     - the course-finished screen;
     - the landing page.
   - Every picture is a small inline SVG, about 1–1.5 KB, and is hidden from screen readers. Nothing is said only in a picture.
5. **Wave edges in five places only:** the lesson card's picture, Welcome, Lesson complete, the course-finished screen and the landing page. They don't go on lists, Goals, Practice or Me.
6. **The course as a voyage.**
   - The logo's boat sits at your current lesson and glides to the next one when you finish.
   - The lesson progress bar has the boat at its tip.
   - Goals show "Saved so far" as a route to an island.
   - Optionally, an island map: finished units become islands with a flag, and the next ones are faint. The map would replace the rows of finished units, so the page doesn't get longer.
7. **Motion.**
   - The logo's sails fill as the day's XP goal fills. The star turns coral when the goal is met.
   - A soft ripple on a right answer, once.
   - On Lesson complete, the waves drift for a few seconds, then stop.
   - The streak star glows from 7 days, brighter at 30, with small rays at 100.
   - Sheets and dialogs open with a small spring (250 ms or less).
   - A bobbing boat replaces spinners.
   - **All of it turns off** with the app's Reduce motion setting or the phone's. Every animation has a still version.
8. **Illustrated badges:** the 20 achievements are redrawn as round medallions (5 are drawn here). Badges you haven't earned are shown grey.
9. **The streak icon becomes the north star** instead of the flame. It fits the logo, and flames are another app's signature.
10. **One tiny easter egg:** tap the star in the logo and it twinkles once.

## Where I'd push back

- **No sliding page transitions.** Only sheets, dialogs and the finish ring get the spring. Slides make a web app feel slower and can bother people sensitive to motion.
- **No pull-to-refresh.** Most screens have nothing to refresh, and phone browsers already pull to reload.
- **Wave backgrounds stay in five places.** Waves everywhere would stop feeling special and would start to look like a theme.
- **No anchors, ship's wheels, ropes or pirate talk.** That matches the brand rules you approved.
- **The finish waves stop after a few seconds.** That saves battery and keeps the screen calm.

## Size and speed (estimates, to be measured when built)

- **The heading font:** +62 KB for Fraunces (39 KB for Nunito, 41–77 KB for Bricolage). It's one file, cached after the first visit, and loaded so text never waits for it.
- **Pictures and badges:** about 40 KB of SVG before compression, roughly 12 KB as sent.
- **No new libraries.** The motion is plain CSS.
- **When it's built,** I'll report:
  - the app's size before and after;
  - a load on a slow phone (Chrome slowed to a mid-range phone on a slow 4G connection).

## Keeping it accessible

- The new color pairs are added to `test/look.test.mjs`, which checks WCAG AA.
- A new browser test checks that Reduce motion turns every animation off.
- Buttons stay at least 44 px. The pressed state never moves anything around it.
- The heading font is only used at 20 px and up. Body text stays Inter.

## Decisions for you

1. **Calm or playful?** I recommend **Playful**. The calm version is close to today's app, and you asked for more fun.
2. **The Learn path: with islands or without?** I recommend **with islands**, replacing the rows of finished units. It's where the voyage idea is clearest.
3. **The heading font:**
   - **Fraunces (soft), recommended.** It's warm and premium, and its soft corners echo the serif logo.
   - Bricolage Grotesque is modern and a bit quirky.
   - Nunito is the most rounded, and also the closest to a kids' app.
4. **The accent:** **sunrise coral** (recommended) or golden sand? Sand sits close to the amber that means "behind".
5. **The streak icon:** the **north star** instead of the flame (recommended)?
6. **Anything to cut?** For example: the sunrise on Lesson complete, the boat on the progress bar, the easter egg.
