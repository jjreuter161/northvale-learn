# Design audit: what's weak in the interface today

Written for Part 1 of the redesign brief. It looks at how the app is **built and drawn**; the usability audit (`docs/USABILITY-AUDIT.md`, in the other worktree) looks at where people get stuck. Both agree on most things.

## How it was done

- The app at commit `b2f71b3` (branch `fix/first-lesson-usability`, all the usability fixes so far), built and served from this worktree on a random port, with no API key and a temporary data folder.
- Google Chrome driven by Playwright (`docs/design/redesign/shots.mjs`): **phone** 390 × 844 at 2× and **laptop** 1366 × 768 at 1×, light setting. Four runs: a brand-new person (welcome, warm-up question, goal, a whole lesson, Today afterwards); someone four lessons in (every tab, Settings, Ask, Your Money Year, a 404); the Navy look; Spanish and Mexico.
- 82 screenshots in all. I looked at them as contact sheets (below) and at several full size. The raw files (about 9 MB) are not in the repo; `shots.mjs` regenerates them.
- I also counted the styles in the code (`grep` over `src/`), because "feels inconsistent" is easier to settle with numbers.

**Contact sheets** (number = position in the sheet):
[phone 1: a new person](audit/phone-1-new-user.jpg) · [phone 2: tabs and sheets](audit/phone-2-tabs-and-sheets.jpg) · [phone 3: Navy look and Spanish](audit/phone-3-navy-and-spanish.jpg) · [laptop 1: a new person](audit/laptop-1-new-user.jpg) · [laptop 2: tabs and sheets](audit/laptop-2-tabs-and-sheets.jpg)

**Not covered:** a real phone, Safari, Firefox, the real AI tutor, dark mode through the device setting, a screen reader, motion (screenshots can't show it). The learner states are seeded, so some things (three achievement toasts at once) are exaggerated compared with a real first week.

## The measured drift

| In the code | Count | What it means |
|---|---|---|
| Different text sizes | **22** across 512 uses (11, 12, 12.5, 13, 14, 15, 16, 17, 18, 20, 22, 24, 26, 28, 30, 32, 34, 36, 38, 40, 44, 46) | There is no type scale. 13 px and 14 px alone are 264 of the 512 uses. |
| Font weights | **5** (500, 600, 650, 700, 750) | Three of them look almost the same. |
| Corner radii | **16** different (3 up to 84) | Cards, buttons and chips don't match each other. |
| Distinct spacing values | padding 16, gap 17, margin 17 | No rhythm to snap to. |
| Style written as inline objects | **1,250** `style={{…}}` against 21 CSS rules in `ui.jsx` | Consistency depends on remembering, not on the system. |
| Hard-coded colors outside `colors.js` | 4 files (`Me.jsx`, `ui.jsx`, `share.jsx`, `certs/render.js`) | A look change can miss them. |

The colors themselves are in good shape: three colors, named tints, a tested contrast table. The problem is everything *around* the colors.

## Problems, worst first

**1. The laptop is a phone layout, enlarged.**
A lesson is a column about 600 px wide of 13 to 15 px text in the middle of a blank 1366 px page, with the Continue button floating partway down (laptop 1: 4 to 10). Learn, Goals, Practice and Me use small cards in wide pages with large empty areas and no focal point (laptop 2: 1 to 5). Settings is a narrow panel beside a menu. Nothing uses the extra width on purpose. *Fix: a laptop scale, a reading column with a side panel, a real left rail.*

**2. Text is small and there's no hierarchy.**
Most text is 13 to 14 px, the labels are 12 px in a mid-gray, and a title is rarely more than 4 px bigger than its body, so screens look flat. The tab bar's labels are 12 px. On the laptop the same sizes read as fine print. *Fix: an 8-step scale with a 16 px body, an 18 px reading size and a +2 px laptop scale.*

**3. Idea cards are three lines on an empty screen.**
A lesson card is a title, three or four lines, and about 60% blank screen with Continue at the very bottom (phone 1: 6 and 7; phone 3: 2). There's nothing to look at, no number, no example. This is the "boring" part people feel. *Fix: bigger reading type and a place for one worked example or picture (needs lesson work, see the proposal).*

**4. The lesson header is crowded and tells you nothing.**
A small close icon, a thin progress track with a tiny boat, an "Ask" button, a flag icon, and a line of 11 to 12 px text ("Pay yourself first · 3 of 6") (phone 1: 8 to 13). You can't read how far along you are. *Fix: close, a clear bar and "3 of 6" only; Ask moves into the content.*

**5. Today breaks the one-red rule and buries the path.**
On day one there are two solid red buttons at once, Continue and Make a plan (phone 1: 16). The hero card's picture overlaps its title. The page is long, and the path (the sea chart) is far below the first screen (phone 2: 1; laptop 2: 1). The laptop version has small cards and a tiny right rail. *Fix: one next-step card with the one red, the path as a strip or a map, and secondary things as quiet rows.*

**6. The finish screen is cluttered, with gaps.**
A ring, a wave picture cut off at the edges, plain text achievements, a "Try the challenge version" link, and two buttons, spread over the screen with big empty gaps (phone 1: 15; phone 3: 7). *Fix: ring, title, two chips, one card, one red button, one quiet button.*

**7. The Ask sheet starts with four toggles and a warning.**
Simple / Expert, Chat / Explain this, and an offline notice sit above an empty conversation. The input gets a red outline when focused, a second red thing on a screen that already has one. Achievement toasts stack over the sheet's title (phone 2: 6 to 8; laptop 2: 6 to 8). *Fix: a calm sheet that starts with a prompt, one control, no red ring, one toast at a time.*

**8. Settings is one very long page.**
Language, Profile, Learning (with the reminder form), Colors (a large picker), Account (a full sign-up form), More. It has been reordered so Language comes first, but it's still one scroll (phone 2: 5; the "before" Settings in [compare-phone](compare-phone.jpg)). *Fix: short grouped lists that open sub-pages; the color picker as four swatches.*

**9. The tab bar's active state is a boxed outline.**
The current tab gets a rounded outline box, which reads like a focused button more than a place you're in. Labels are 12 px, items 58 px tall. *Fix: a filled pill behind the icon, a bold label.*

**10. The Welcome screen is crowded.**
The art, wordmark, tagline, headline, sub line, two buttons, language chips, country chips and legal note all fit by being small. The chips are the smallest controls on the screen though they're the first thing a person must set (phone 1: 1). *Fix: a larger headline, labeled segmented controls, the whole hero visible.*

**11. A wrong URL shows a blank page with raw text.** (phone 2: 10) *Fix: a branded, calm not-found page.*

**12. Smaller things.**
Money Year's two meters have no key on screen (phone 2: 9). The unit-complete screen in the Navy look is a lonely picture with a Share button (phone 3: 7). Toast stacks of three cover headings. Hero pictures are cropped differently on every screen.

## What already works and must not be lost

- **The three colors and the rules**: one red spark per screen, selection in the text color, "Not quite" without red. The usability fixes made selection navy, and it reads right.
- **Feedback design**: Correct and Not quite differ by icon and edge, not color (phone 1: 10).
- **Bottom-pinned primary action** in lessons and on the finish screen.
- **The question types** and their instructions are clear.
- **The Navy look** holds up: contrast is good and the red button keeps its cream edge (phone 3: 1 to 6).
- **Spanish fits.** I saw no overflow in Spanish on Today, Goals or Me (phone 3: 8 to 10). Long Spanish button labels still need a test in the build.
- **The sailing art style and wordmark**, and the calm, no-exclamation voice.

## What this means for the redesign

The weakness is mostly **system and scale**, not color or tone. So the proposal is: a real design system (tokens and components) with a type scale and a laptop scale, a layout that uses the laptop width on purpose, and calmer, simpler screens built from it. It keeps the colors, the art and the voice. See [PROPOSAL.md](PROPOSAL.md).
