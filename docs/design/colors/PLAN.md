# Navy, cream and signal red — plan and mockups (Step 1)

> **Built (Step 2):** approved and built on `design/navy-cream-red` with the recommended answers to the ten decisions below (header streak star in the text color; a small red pennant on the sea chart's current island; gains and losses with arrows and signs; delete and leave as plain text with red only on the final confirm; red background kept as a bold option; the four presets; the old "What's new" replaced). Screenshots of the built app: `build/index.html`. The mockups below are the plan's.

Nothing in the app has changed yet. This is the plan, the numbers, and mockups drawn from the real app with the new colors laid over it. Build happens on `design/navy-cream-red` after you approve.

- **Mockups:** [`mockups/index.html`](mockups/index.html) shows everything; each preset has an overview sheet: [Navy](mockups/overview-navy.jpg) · [Cream](mockups/overview-cream.jpg) · [Navy & cream (no red)](mockups/overview-navy-cream.jpg) · [Spanish, Navy](mockups/overview-navy-es.jpg). Single screens are `mockups/{preset}-{screen}.jpg`.
- **How they were made:** `node docs/design/colors/mockups.mjs` runs the real app and lays the colors from [`tokens.mjs`](tokens.mjs) over it (the color picker and the Explain-this red flag don't exist yet, so those two are drawn as mockups with the same fonts and colors). The same `tokens.mjs` is the start of the build.
- **Look at them on your phone and ask:** does this feel calm, and does my eye go straight to the right button?

---

## 1. The three colors

| | Color | Used for | Tints (depth only) |
|---|---|---|---|
| **Navy** | `#1B3560` | the Navy background, text on Cream, icons | deep `#10223F` (shadows, button edge) · card `#233F70` · card 2 `#2D4D86` · line `#46679F` · sea `#2A4A80` |
| **Cream** | `#F7F2E8` (the current cream) | the Cream background, text on Navy | card `#FFFDF8` · sand `#EFE7D8` · line `#E3D9C6` · dim `#CFC8B8` |
| **Signal red** | `#C8202A` | the main button, one spark per screen | deeper `#A21A22`, `#8B141B` (red background) · soft `#F6DAD5` (flag background on Cream) · **light `#FF8E8B`** (marks and flag words on Navy) |

Navy is lighter than today's Navy look (`#0D1A2D`) and its logo navy (`#13315C`), but deep enough that cream text on it is 10.9:1 (WCAG AA needs 4.5). Sunrise coral, green and amber are gone; the "sun" in pictures becomes a cream tint.

**Why this red.** I tried six reds. A brighter, more "signal" red (`#E5383B`) looks great but cream text on it is only 3.8:1, which fails AA for button labels. `#C8202A` is confident, still clearly red, and its cream label is **5.1:1**. The cost: on a navy background the red button is only 2.1:1 against the background, so on Navy **the red button always gets a cream edge** (10.9:1 against navy). The edge is what keeps it visible, including for color-blind users.

### The numbers

| Pair | Contrast | Verdict |
|---|---|---|
| cream text on navy | 10.9 | ✓ |
| navy text on cream | 10.9 | ✓ |
| cream label on a red button | 5.1 | ✓ |
| red words on cream | 5.1 | ✓ full strength only (the softer text shades fail) |
| red words on navy | 2.1 | ✗ never |
| red button vs navy background | 2.1 | ✗ alone, ✓ with the cream edge |
| light-red mark on navy | 5.5 | ✓ |
| light-red words on a navy card | 4.7 | ✓ (used only for a real warning) |
| navy label on red | 2.1 | ✗ never |

**Rules that follow from the numbers:** red is never body text on navy; a red button's label is always cream; on navy the red button has a cream edge; the light-red tint (not the deep red) is used for small marks on navy.

## 2. The idea in one paragraph

Navy and cream carry the whole app: plenty of space, a steady rhythm, nothing flashing. Red is a spark: **exactly one red focus per screen**, the place the eye should go first. Everything else (progress bars, selected chips, secondary buttons, charts) is cream or navy. Mistakes are never red. The app should feel good because it is calm, focused and satisfying, not because it is hard to put down.

## 3. Psychology and why each choice (honest about the evidence)

- **Calm base.** Deep blues are widely read as calm and trustworthy, and a low-contrast-noise palette (two colors, lots of space) lowers visual load. The evidence on color and mood is mixed and depends on context, so I lean on layout (space, rhythm, few competing elements) more than on any one color's "meaning". The test is the mockups on your phone, and the testers' first week.
- **One spark draws the eye.** An item that differs from everything around it gets noticed first (the isolation, or von Restorff, effect). That only works if it's rare, so the rule is: **never more than one red focus point per screen.** On Today it's Continue; on Practice it's Start mission; in a lesson it's the one button that moves you on.
- **Red also means "alarm" and "wrong."** Research on red in achievement settings (Elliot and colleagues, 2007) found it can nudge people toward avoiding failure, the opposite of what we want in a learning app. So red is never used for being wrong, and never in large areas. Red text isn't used for anything except a genuine warning.
- **Wrong answers are safe.** "Not quite" uses a neutral card with a dashed edge and a gentle hint icon, the existing message, and no color. Right answers use a check icon, a solid edge and the small celebration. The two differ by **icon, edge style and words**, so nobody has to tell colors apart (about 1 in 12 men have a red-green color deficiency; red also looks darker to some of them).
- **Warnings that really matter may be red,** because there it's the right meaning: the scam red flag in Explain this (below).
- **Healthy engagement only.** "Worth coming back to" comes from feeling calm and satisfied. No dark patterns, guilt, fake urgency or endless feeds, matching the "Our promise" page. Concretely, in the build I will audit and, if needed, soften: streak and comeback wording (no guilt: "welcome back", never "you lost"), reminders (quiet, one a day, easy to turn off), the weekly league (real people only, never a countdown pressure), and confirm there is no auto-play or infinite list anywhere. The red streak star is a small spark, not a threat.

## 4. Where the eye travels on each screen

| Screen | The one red spark | Then the eye goes to | Calm everywhere else |
|---|---|---|---|
| **Today** | the **Continue** button | the lesson title above it, then Review and the mission | the streak star is a small red mark in the header only when it's the screen's secondary mark (see decision 4) |
| **Sea chart** | the **Continue** button on the current card (the current island also gets a small red pennant, decision 5) | the boat and the current island | every other island is cream and navy; the "sun" is cream |
| **A question** | none (Check is quiet until an answer is picked; then it's the red button) | the question text, then the options | options are neutral cards; picking one fills with a cream ring |
| **Correct** | **Continue** | the check icon and "Correct" | solid cream ring, check icon, small celebration |
| **Not quite** | **Continue** | the "Not quite" card with the answer's explanation | dashed neutral edge, hint icon, no color |
| **Finish** | the **Next** button | "Lesson complete" and the streak | achievements are text; secondary buttons are navy-outline |
| **Goals** | none, or **New goal** when there are no goals | the goal's progress | progress is cream; "on track" is a text chip |
| **Practice** | **Start mission** | this week's mission | rows are neutral |
| **Me** | none (the streak star mark only) | the level and the week | tiles are neutral |
| **Settings → Colors** | **Use this look** | the preset cards, then the three groups | unavailable choices are faded with a short reason |
| **Explain this** | the small **red flag mark** beside a scam warning (red only where it truly warns) | "What this is", then the flag block | the words stay cream; only the mark and a soft red panel are red |
| **Your Money Year** | none while choosing (the choices are equal); the next-month button after | the event, then the three choices | meters are cream; no red/green gains and losses |

## 5. Feedback, charts and numbers without red or green

- **Right:** check icon, solid cream ring, "Correct", small celebration.
- **Not quite:** hint icon, dashed neutral edge, "Not quite" and the explanation. Never red, never a shake.
- **Gains and losses** (practice portfolio): a sign and an arrow (▲ +1.2% · ▼ −0.8%) in the text color. No green and no red, so losses don't feel like punishment and nothing relies on color.
- **Charts with two lines:** solid cream versus dashed or lighter tint, with a legend; no color pair to tell apart.
- **Disabled buttons:** neutral and quiet (not a faded red).
- **Destructive actions** (delete account, leave class): the ghost button is plain text with an icon; **red appears only on the final confirm button.**

## 6. The picker in Settings → Colors

Replaces the Cream / Navy / Match my device picker.

- **Presets (ready-made):** *Navy* (default: navy background, cream text, red highlight) · *Cream* (cream background, navy text, red highlight) · *Navy & cream* (no red at all, the calmest) · *Cream & navy* (no red at all). All four pass.
- **Or choose each:** three groups, three colors each: **Background**, **Text and icons**, **Main buttons and highlights**. Combinations that fail are faded with one short line ("Can't be read on this background" / "Blends into the background").
- **Only readable combinations are offered.** There are 27 possible combinations of the three groups; **five pass** (the table below). Text must be 4.5:1 on the background *and* its softer shades must stay 4.5:1 on cards; the highlight must stand out from the background (3:1) or, for red on navy, get the cream edge.
- **Red background** passes (cream text, cream buttons) but is marked **Bold: not for long sessions** and isn't one of the presets.
- **Match my device:** dark mode uses the Navy preset, light mode uses the Cream preset, unless you picked your own.
- **Existing users migrate:** saved Cream → *Cream*, saved Navy → *Navy*, Match my device stays, so nobody wakes up to a stranger.
- **Everything adapts:** the sea chart, pictures, badges, certificates, share cards and the landing page read the same variables (the build maps them; the certificate uses the chosen colors on its paper).

| Background | Text and icons | Highlight | Result |
|---|---|---|---|
| navy | cream | cream | ✓ preset *Navy & cream* |
| navy | cream | red | ✓ preset *Navy* (red button gets a cream edge) |
| cream | navy | navy | ✓ preset *Cream & navy* |
| cream | navy | red | ✓ preset *Cream* |
| red | cream | cream | ✓ bold, not recommended for long sessions |
| the other 22 | | | ✗ text unreadable, or a highlight that blends in (e.g. navy on navy; red text on navy is 2.1:1; navy button on a navy background) |

Red text on cream is 5.1:1 at full strength, but its softer shades (the quieter text the app uses) fall below 4.5, so it isn't offered as a text color.

## 7. What I saw in the mockups (things the build must fix)

1. **Words that use the brand color** (for example the "Ask about this" link) would become red text on navy, which is unreadable. The build adds a separate text-link color (the text color) so brand color is only ever a button fill or a mark. The mockups already show this fix.
2. **The disabled "Check" button** turns pinkish on Cream. It must be neutral.
3. **Every pale panel** that used green/amber/coral for meaning (right, wrong, warnings, "behind plan") becomes a neutral card with an icon and words.
4. **The sea chart's pennants and stars** were sunrise coral; they become cream, so the current island's small red pennant is the only red in the picture.
5. **Portfolio gains/losses and chart lines** use sign, arrow and line style instead of green and red.
6. **Spanish** fits as before; the Spanish mockup of the picker is in the Spanish overview (long labels wrap but don't clip).

## 8. How it gets built (after you approve)

- One function turns three choices (background, text, highlight) into the app's CSS variables (`tokens.mjs`'s `lookFrom` is the start), replacing the two fixed looks. Components keep using the same variables.
- **Tests:** a contrast test over every allowed combination (text, softer text and highlight on background and cards, the button label, the red-on-navy edge), colorblind-safe feedback checks (the right and wrong states differ without color), reduced motion, the every-lesson playthrough, the size budget, axe on the new picker and screens in each preset.
- Then screenshots, preflight, CHANGELOG, commit and push, and merge into `main` once you say go.

## 9. Decisions for you

1. **Navy `#1B3560`** (lighter than today's, 10.9:1 with cream). Lighter or darker?
2. **Red `#C8202A`** (cream label 5.1:1) rather than the brighter `#E5383B` (3.8:1, fails AA). OK?
3. **A cream edge on the red button on Navy.** OK? (It's what keeps the button visible.)
4. **The streak star.** Red mark in the header every day, or only on Today? (One spark per screen means it competes with Continue; I lean toward the star in the header being cream and red only inside the streak sheet.)
5. **The sea chart:** a small red pennant on the current island, or none (just the red Continue)?
6. **Gains and losses in the practice portfolio with arrows and signs only** (no green/red). OK, or do you want red only for losses?
7. **Delete / leave actions:** plain text buttons, with red only on the final confirm button. OK?
8. **The Bold red background** as an advanced option in the picker (with the warning), or leave it out?
9. **Presets:** keep the four, or add more (the matrix only allows five combinations in total)?
10. **Existing "What's new" card** that explained Cream and Navy: replace it with a note about the new colors, shown once.

## 10. Risks

- **Red on navy is inherently low contrast.** The cream edge and the light-red mark solve it, but a red button on navy will always look "quieter" than on cream. If it doesn't draw the eye on your phone, the fix is a brighter red with a navy label, which fails AA, so I'd rather change the button's shape than the rule.
- **Two colors plus tints can feel flat** in illustrations. The mockups keep depth with tints; if the sea chart feels dull, the plan allows more tint steps, not new colors.
- **Color meaning alone is gone on purpose.** Every state now relies on icon, edge and words. Learners who liked green "correct" may miss it; the celebration and check should carry it.
