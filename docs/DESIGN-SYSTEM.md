# Northvale Learn design system

The one description of how the app looks and why. Screens are built from components, components from tokens, and tokens come from two files: `src/core/colors.js` (color) and `src/core/tokens.js` (everything else). If a style isn't in here, it doesn't ship. A design change needs the owner's approval first (`CLAUDE.md`, "Design rules").

The redesign that produced this system is described in `docs/design/redesign/` (the audit, the approved proposal and the mockups).

## 1. The three layers

| Layer | What it is | Where it lives |
|---|---|---|
| **Tokens** | The only values a style may use: color, text size, weight, line height, spacing, radius, touch size, motion. | `src/core/colors.js`, `src/core/tokens.js` (as CSS variables, added to the page by `GLOBAL_CSS` in `src/core/ui.jsx`) |
| **Components** | Pieces built once from tokens: button, card, row, choice, chip, sheet and so on. | `src/core/ui.jsx` |
| **Screens** | Built from components and tokens. A screen may arrange components; it may not invent a style. | `src/core/*.jsx`, `src/modules/*/` |

`test/design-tokens.test.mjs` runs with every `npm test` and fails when any file under `src/` writes a text size, weight, line height, spacing, radius or color that isn't a token.

## 2. Color

Three colors and their tints, all in `src/core/colors.js`. `lookFrom(background, text, highlight)` turns a look into CSS variables.

| Color | Hex | Role |
|---|---|---|
| Navy | `#1B3560` | text and lines on cream; the page on the Navy look |
| Cream | `#F7F2E8` | the page on the Cream look; text on navy |
| Signal red | `#C8202A` | the one main button on a screen; a small spark in a picture |

Looks: Cream, Navy, Navy & cream, Cream & navy, Match my device (follows the phone), and Choose your own (only readable combinations are offered; `test/colors.test.mjs`).

Use the **role variables**, never a color: `--bg` the page · `--surface` a card · `--surface2` a quiet fill · `--line` an edge · `--ink` text · `--head` a heading · `--mid` secondary text · `--low` the quietest readable text · `--brand` words, icons and borders in the text color · `--fill` and `--onFill` the main button and its label · `--select` a picked option's outline · `--focus` the keyboard ring · `--right` / `--rightSoft` a correct answer · `--scrim` and `--shade` depth only.

Rules (tested in `test/colors.test.mjs`):

1. **One red thing per screen**, and it's the main button (or the final confirm of something that can't be undone). Red is never a text color on navy, and never marks a wrong answer.
2. **A picked option is outlined in the text color** (navy on cream, cream on navy), matching the main button.
3. **Right and wrong differ without color**: a check icon and a solid edge for Correct, a hint icon and a dashed edge for Not quite, and different words.
4. **Every readable pair meets WCAG AA**: text 4.5:1, icons and edges 3:1, in every look.
5. Pictures use the `--art*` variables, so they follow the look.

## 3. Tokens

<!-- tokens:start — written by scripts/design-doc.mjs from src/core/tokens.js; don't edit by hand -->

**Spacing** (a 4px base; `--s1` to `--s8`, or the plain number in code)

| Variable | px | Use |
| --- | --- | --- |
| `--s1` | 4 | an icon and its label; a tight pair |
| `--s2` | 8 | inside a chip; a label above its value |
| `--s3` | 12 | between rows in a list; inside a small card |
| `--s4` | 16 | a phone's side margin; a card's padding; between cards |
| `--s5` | 24 | between sections; a laptop card's padding |
| `--s6` | 32 | a laptop's side margin; between large blocks |
| `--s7` | 48 | a laptop's top and bottom margin; around a hero |
| `--s8` | 64 | the biggest gap |

**Corner radius** (pills and circles are `50%` or `999`)

| Variable | px | Use |
| --- | --- | --- |
| `--r1` | 12 | buttons, fields, chips, answer options |
| `--r2` | 18 | cards, list groups, the lesson's feedback card |
| `--r3` | 28 | a hero card, a sheet's top corners |

**Text size** (the laptop sizes apply from 1024px wide)

| Variable | Phone | Laptop | Use |
| --- | --- | --- | --- |
| `--t-cap` | 12px | 13px | tab labels, small captions, the unit tag |
| `--t-sm` | 14px | 15px | a second line, a hint, a chip, a table |
| `--t-body` | 16px | 18px | everything you read by default; buttons; fields |
| `--t-lead` | 18px | 20px | the text of a lesson card; a main row's title |
| `--t-title` | 22px | 26px | a card's title; a question |
| `--t-head` | 28px | 34px | a screen's title |
| `--t-disp` | 36px | 46px | a hero statement; a finished lesson's title |
| `--t-fig` | 44px | 56px | a big number (a streak, an amount, a score) |

**Weight** (Inter is a variable font, so these are exact)

| Variable | Value | Use |
| --- | --- | --- |
| `--w1` | 450 | reading text |
| `--w2` | 600 | buttons, labels, row titles, chips, the tab label |
| `--w3` | 700 | headings, big numbers, the selected tab |

**Line height**

| Variable | Value | Use |
| --- | --- | --- |
| `--lh-text` | 1.5 | anything you read, over a line |
| `--lh-tight` | 1.2 | headings, big numbers, one-line labels |

**Touch targets** (nothing you tap is smaller than the first)

| Variable | px | Use |
| --- | --- | --- |
| `--touch` | 44 | the smallest anything tappable may be (a small button, a chip, a row) |
| `--touch-control` | 52 | a field, a segmented control, a normal button |
| `--touch-primary` | 56 | the one main button on a screen; a list row is as tall |
| `--touch-option` | 64 | an answer option |

**Motion** (exits take 70% as long; with reduced motion every transition and animation is instant)

| Variable | ms | Use |
| --- | --- | --- |
| `--m-press` | 120 | a press, a switch, a chip |
| `--m-enter` | 200 | a card, a toast or a screen arriving |
| `--m-sheet` | 320 | a sheet or a dialog; a bar or ring filling |
| `--m-glide` | 700 | the boat gliding between lessons (a picture, so slower) |

<!-- tokens:end -->

### Using them

- **In a style:** `fontSize: "var(--t-body)"`, `padding: 16`, `gap: 8`, `borderRadius: 18`, `fontWeight: 600`, `lineHeight: 1.5`. Spacing, radius, weight and line height are plain numbers from the lists above; text size is always a `--t-*` variable, because it changes between phone and laptop.
- **In CSS text** (`GLOBAL_CSS`): the variables, e.g. `padding:var(--s4)`.
- **Never** write 13, 14, 15, 17, 10px, `borderRadius: 8`, `fontWeight: 650`, `lineHeight: 1.45`, `#fff` or `rgba(...)` in a screen. The nearest token is the answer: `node scripts/design-codemod.mjs` moves a file's stray values to it.
- **Computed sizes** (`size * 0.4`) are only for the wordmark, which scales as a picture. Everything else picks a token.

## 4. How the tokens are used

- **Text.** Body copy is `body`. A lesson card's text is `lead`, lines at most about 70 characters. A screen's title is `head`; a card's title or a question is `title`. Secondary lines are `sm` in `--mid`. `cap` is only for tab labels, tags and captions. Money is set in tabular figures.
- **Weight.** 450 for reading, 600 for anything you tap or scan (buttons, labels, row titles), 700 for headings and big numbers. Never bold a whole paragraph.
- **Spacing.** 16 is the phone's side margin and a card's padding; 12 between rows; 24 between sections; 32 to 48 on a laptop. Prefer fewer, larger gaps to many small ones.
- **Radius.** 12 for things you press or fill in, 18 for cards, 28 for a hero card or a sheet's top. Pills and circles are 999 or 50%.
- **Elevation.** Cards are flat with a 1px `--line`. One soft lift (`--lift`) for sheets and toasts. The red button keeps its 1px deep edge. Nothing else has a shadow.
- **Touch.** Nothing tappable is under 44px high, with at least 8px between neighbours. The one main button is 56, a field or normal button 52.
- **Motion.** A press, 120ms; something arriving, 200ms; a sheet, 320ms; all ease-out, exits 70% as long. Under reduced motion every transition and animation is instant.
- **Focus.** A 3px ring in the text color with a 2px offset, on every control, in every look. It is not red, so typing in a field doesn't add a second red thing.
- **Icons** are the app's own line icons (`Icon` in `ui.jsx`), sized 20 or 24. No emoji, anywhere.

## 5. Components

Built once in `src/core/ui.jsx`; a screen uses them as they are and doesn't restyle them. Their look is CSS in `GLOBAL_CSS` (`.nv-*` classes), written with the tokens.

| Component | What it is |
|---|---|
| `Button` | `kind`: **primary** (the one red button of a screen; on Navy it has a cream edge), **secondary** (outlined in the text color), **ghost** (plain text), **bad** (the final confirm of something that can't be undone, the only other red fill). `size`: **lg** 56 high, **md** 52, **sm** 44. Disabled is quiet and neutral, never a faded red. Labels are verbs. |
| `Card` | Flat, with a 1px line, corners 18; `hero` has corners 28. A card you can press is a button. |
| `List`, `ListRow` | One card of rows split by hairlines: an icon tile, a title, a line under it, a chevron when it opens something. At least 56 high. |
| `Tag` | A small label that isn't pressed (a unit, a status): a pill on a quiet fill, `cap` size. |
| `Chip` | A chip you press to choose: outlined in the text color with a check when chosen. At least 44 high. |
| `Segmented` | Two to four choices side by side. A radio group, or with `toggle` a group of toggle buttons. The pick is outlined, lighter and bolder. |
| `Switch` | A pill with a knob. Off is a quiet fill with a low knob; on is the text color with a light knob. A 44px target. |
| `Field` | A text field: 52 high, a 1px edge in the quiet text color, corners 12; the focus ring comes from the page. |
| `Sheet` | A bottom sheet (a centered dialog on a laptop): grab handle, title, a 44px close. Escape or the dim behind it closes it. |
| `Toasts` | One note at a time under the header; the rest wait their turn (six at most). |
| `Note`, `Title`, `Label` | An inline note; a screen's title (`head`) with a line under it; a section heading. |
| `Progress`, `Ring` | A 6 to 12px bar and a ring, on the `--line` track, filling in the text color. |
| tab bar, rail | Phone: four tabs, a filled pill and a bold label for the current one. Computer: a left rail, 24px icons, `body` labels, the current one filled. Both mark it with `aria-current`. |

**A lesson** (`src/modules/lessons`): a header (close, a 6px progress bar, "3 of 6", report), then a `cap` label naming the kind of step and the lesson, the heading (`head` for an idea, `title` for a question), the content, and the pinned action (`.nv-dock`: one main button, 56 high). An **option** is `.nv-opt` (64 high, corners 18, a 2px line, a numbered badge `.nv-k` that becomes a check when picked); a pick is outlined in the text color, a right answer has a solid edge and a missed one a dashed edge. An idea card may carry a **worked example** (`example()` in `units/helpers.js`): a total, a bar showing how it splits and each part named with its amount, so the bar is never the only way to read it. The **feedback card** (`.nv-fb`) sits right under the choices. On a laptop the lesson is a 712px reading column with an "In this lesson" panel (steps done, here, to come) and "Ask about this" beside it; the main button sits under the text, not at the bottom of the window. The **finish** is a ring with the XP gained, "Lesson complete", one line of facts, the "In real life" card, one red button for what's next and a quiet Done.

**Welcome:** the whole picture at the top, the name, a headline, the two buttons, then labelled Language and Country controls and the legal note; on a laptop the brand takes the left half.

**Today:** the date and the title (`head`), then **one card with one red button**: a `cap` label, the unit as a `Tag`, the lesson's name (`head`), why it matters (`lead`), "Lesson 2 of 3 · 4 min", Continue. Under it a **path strip** (five units: finished ones filled, this one lit, the rest ahead; it scrolls to the course below), then at most two quiet rows (review, this week's mission). On a laptop the main button is a button (240px), not a bar across the card. The sea chart ("Your course") stays below as the full map.

**Settings:** on a phone the first page has Language and country, then Colors (four named swatches, Match my device, Choose your own colors), then a short list of rows that each open a page (Profile, Learning and reminders, Account, Sound and feel, Privacy, Legal, About); Back closes the page first. On a laptop a list of sections stands on the left and one shows at a time.

**Ask:** one control on top (Ask | Explain this), a first card that says what it can do (and, with no AI, says so), the field with a round send button, and under it a switch for expert answers and "New chat".

**Not found:** `web/404.html`, a calm page in English and Spanish with a way back; a program asking the server still gets JSON.

## 6. Layout

| Layout | Width | What changes |
|---|---|---|
| phone | under 600 | one column, bottom tab bar |
| tablet | 600 to 1023 | wider content; two columns where it helps; bottom tab bar |
| desktop | 1024 and up | a left rail instead of the tab bar; text sizes switch to the laptop column; the lesson shows a reading column with a side panel |
| wide | 1180 and up | desktop plus the "At a glance" panel on Today |

Breakpoints are CSS pixels, so a laptop zoomed to 200% (about 683px) lands on the tablet layout, as it should. Every screen is tested at 390, 820, 1366 and 1920 wide, and at 195 (a phone at 200% zoom), in English and Spanish.

## 7. Voice

Calm and plain: a good older cousin who works in finance. No exclamation marks, no emoji, no confetti, no guilt, no personal advice. Labels are verbs ("Continue", "Check", "Make a plan"). Every string exists in English and Spanish and has room to be about 30% longer in Spanish. The full rules for lessons are in `docs/CONTENT-STYLE.md`.

## 8. Changing the system

1. Ask the owner. A new size, weight, color, radius or component is a design change.
2. Change `src/core/tokens.js` (or `colors.js`), then run `node scripts/design-doc.mjs` to rewrite the tables above.
3. Run `npm test`. `test/design-tokens.test.mjs` fails if the doc and the tokens disagree.

Tools: `node scripts/design-scan.mjs` lists every stray value with its line; `node scripts/design-codemod.mjs` moves them to the nearest token (`--dry` to preview).
