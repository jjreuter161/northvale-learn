# Redesign proposal (Part 1, for your approval)

**Status: a proposal with mockups. Nothing in the app has changed.** The mockups are static pages drawn from the app's real colors, icons, logo and lesson text. Build starts only after you approve (Part 2 of the brief).

- Before and after: [phone](compare-phone.jpg) · [laptop](compare-laptop.jpg)
- Mockups, phone: [1: Welcome, Today A and B, idea card A](mockups/overview-phone-1.jpg) · [2: idea card B, question, feedback right and wrong](mockups/overview-phone-2.jpg) · [3: finish, Goals, Settings in English and Spanish](mockups/overview-phone-3.jpg) · [looks: Spanish Today, Navy, Navy & cream, a Navy question](mockups/overview-phone-looks.jpg) · [all in Spanish](mockups/overview-phone-spanish.jpg)
- Mockups, laptop: [Welcome, Today, lesson idea, lesson question](mockups/overview-laptop-1.jpg) · [Navy and Spanish](mockups/overview-laptop-looks.jpg)
- Every mockup is one file in [`mockups/`](mockups/) (`.html` and `.png`), rebuilt by `node docs/design/redesign/mockups.mjs`.
- The audit behind it: [AUDIT.md](AUDIT.md).

---

## 1. Decisions I need from you

Where I'm torn I drew both. My recommendation is first in each.

| # | Decision | Options | Where to look |
|---|---|---|---|
| **D1** | **Today (the home screen)** | **A. Next step first, the path as a strip below (recommended).** One card with the one red button, then the path, then two quiet rows. Calm, and it answers "what do I do now?" in one glance. **B. The path first.** The sea chart as the home, a card docked above the tab bar. More like a journey; the next step is less prominent, and it takes more screen. | mockups, phone 1: #2 (A) and #3 (B) |
| **D2** | **Lesson idea cards** | **A. Text plus a worked example in numbers (recommended).** Payday $1,000 → save $100 first. Concrete, fits money. **B. Text plus a picture of the idea** (a three-step flow). Lighter, works for ideas with no numbers. Both need a little lesson content (see section 7). | mockups, phone 1: #4 (A); phone 2: #1 (B) |
| **D3** | **Lessons on a laptop** | **With an "In this lesson" panel and "Ask about this" beside the reading column (recommended)**: shows where you are, fills the space on purpose. **Or the reading column alone**: simpler, more empty. | mockups, laptop: #3 and #4 |
| **D4** | **Focus ring** | **Text color, 3 px with an offset (recommended)**: keeps the one-red rule when you type (today a focused text box gets a second red outline). Or keep the readable red as it is now. | audit, phone 2: #7 (today's red ring) |
| **D5** | **Tab bar** | **Filled pill behind the icon, bold label (recommended)** or the current outlined box. | mockups, phone 1: #2 |
| **D6** | **The lesson header** | **Close, a clear bar, "3 of 6"; Ask moves into the content as "Ask about this" (recommended)** or keep the Ask button in the header. | mockups, phone 2: #2 |
| **D7** | **Typefaces** | **Keep Inter, with EB Garamond only for the wordmark (recommended; recorded as decided on 2026-11-13, "Inter for headings").** I considered a serif for lesson titles; it would add warmth but reopens that decision, so I did not draw it. | everywhere |

Small things I'll just do unless you say otherwise: the branded not-found page, four labeled swatches for the color setting, one toast at a time under the header, Settings as short grouped lists, a "Skip" line on hands-on steps.

---

## 2. What stays

- **The three colors and every tint** (`src/core/colors.js` is not touched). Navy `#1B3560`, cream `#F7F2E8`, signal red `#C8202A`, and the existing looks: Cream, Navy, Navy & cream, Cream & navy, Match my device, Choose your own.
- **The color rules**: one red spark per screen (the main button); a pick is outlined in the text color, matching the main button; a wrong answer is never red and differs by icon, edge and words; red is never body text on navy.
- **Calm and professional**: no confetti, no gamified gold, no exclamation marks, no emoji, no guilt.
- **Phone and computer, both languages, every look.** The mockups use the real `lookFrom()` values, so the Navy and Navy & cream looks are exactly the app's.
- **The sailing art style, the boat mark, the wordmark.**

## 3. The design system

Three layers: **tokens** (the values), **components** (built only from tokens), **screens** (built only from components). Today there is only the first layer, and it covers color only.

### Tokens

| | Today in the code | Proposed |
|---|---|---|
| **Color roles** | three colors, tints, ~40 CSS variables | **No change.** Role names kept (`--bg`, `--surface`, `--surface2`, `--line`, `--ink`, `--mid`, `--low`, `--fill`, `--onFill`, `--select`, `--focus`). |
| **Text sizes** | 22 sizes | **8**: caption 12 · small 14 · body 16 · lead 18 · title 22 · heading 28 · display 36 · figure 44 |
| **Laptop scale** | none (same sizes) | **+1 to +2 px per step** (caption 13 · small 15 · body 18 · lead 20 · title 26 · heading 34 · display 46 · figure 56) |
| **Weights** | 5 | **3**: 450 · 600 · 700 (Inter is a variable font, so these are free) |
| **Line height** | varies | 1.5 for text, 1.1 to 1.2 for headings; money in tabular figures |
| **Spacing** | 16 to 17 values per property | **8 steps** on a 4 px base: 4 · 8 · 12 · 16 · 24 · 32 · 48 · 64 |
| **Radii** | 16 | **3**: 12 (controls) · 18 (cards) · 28 (hero cards and sheets), plus full for pills |
| **Elevation** | ad hoc | cards are flat with a 1 px line; one soft lift for sheets and toasts; the red button keeps its 1 px deep edge |
| **Touch targets** | a few 36 to 44 px | **at least 44 px**; primary buttons 56; secondary 52 |
| **Motion** | 0.2 s fade and 4 px lift in places | **3 durations**: press 120 ms, enter 200 ms, sheet 320 ms, all ease-out; exits 70% as long; **reduced motion = no movement, fades only** |
| **Focus** | red outline | **3 px in the text color, 2 px offset** (decision D4); at least 3:1 against any background in every look |

Reading comfort: lesson text is **lead size (18 px phone, 20 px laptop)**, lines at most about 70 characters.

### Components (each built once, used everywhere)

1. **Button**: primary (the one red; cream edge on Navy), secondary (outlined in the text color), quiet (text), small. Labels are verbs.
2. **Card** and **Row** (icon, title, subtitle, chevron): replace the many hand-built variants.
3. **Choice** (answer option): 64 px tall, a numbered badge, a check when picked, the pick outlined in the text color.
4. **Feedback card**: Correct (check, solid edge) and Not quite (hint icon, dashed edge); no color difference.
5. **Lesson header**: close, a 6 px progress bar, "3 of 6".
6. **Navigation**: a bottom tab bar on phones (filled pill, 12 px bold label, 72 px with the safe area) and a left rail on laptops (24 px icons, 18 px labels).
7. **Segmented control** (language, country, daily goal), **chip**, **toggle**.
8. **Sheet**, **toast** (one at a time, under the header), **empty state**, **progress ring and bar**.
9. **Path** (the sea chart as a strip or a map), the app's islands drawn from the existing art.

## 4. How the screens change

All mockups are in [`mockups/`](mockups/). Highlights:

- **Welcome** (phone and laptop): the whole hero art is visible; a 36 px headline; the two buttons; **labeled** Language and Country segmented controls with full words; the legal note. On a laptop it's a split: navy story on the left, the form on the right.
- **Today**: one **next-step card** (unit chip, lesson title, why it matters in a line, "Lesson 2 of 3 · 4 min", the one red Continue); a **path strip** with the current unit lit; Review and mission as quiet rows. On a laptop: a left rail, the same card larger, a wide sea-chart panel, a right rail with the week, Review and mission. No second red button.
- **Lesson idea card**: reading size, a place for one example, Continue pinned on a phone and under the text on a laptop.
- **Question**: a 22 px question (28 px on a laptop), big choices, a pinned Check. After checking, the Correct or Not quite card sits right under the choices.
- **Finish**: ring, "Lesson complete", the lesson name, two chips (streak, XP today), the "In real life" card, **one** red button ("Next: ...") and a quiet Done. Achievements become one line.
- **Goals**: a goal card with the amount as a big figure, a bar, "$83 a month · 1 year left", the status as a text chip, one next lesson for the goal.
- **Settings**: short grouped lists (Language and country first; Colors as four labeled swatches; Profile, Learning and reminders, Sound and feel, Privacy as rows that open a page; Account last).
- **Looks and Spanish**: every screen takes the same tokens, so Navy, Navy & cream and Spanish need no extra design; mockups show Today in each, a Navy question, and Spanish Welcome, Today and Settings.

## 5. How UI UX Pro Max was used, and where I overruled it

- I ran its design-system generator for "financial education, calm, trustworthy, youth, bilingual". It recommended **Claymorphism** (soft 3D, chunky, toy-like), a playful indigo and orange palette, and **Baloo 2 / Comic Neue**, with "avoid dark modes". That is the generic "educational app" answer, and it contradicts everything you asked for (calm and professional, never childish, our colors, a Navy look). **I rejected it** and say so here rather than pretending it informed the style.
- What I did take from it: its UX rules and checklist. Targets of at least 44 px with 8 px between them; a visible focus indicator of at least 3:1 and 2 px; a step indicator on multi-step flows ("3 of 6"); no emoji as icons; a pressed state on every control; respect reduced motion; test at 375, 768, 1024 and 1440 widths.
- Everything else in the system comes from the audit, the existing palette and the measured drift.

## 6. Risks

- **Scope.** This touches every screen. The plan below does it in slices with tests after each.
- **Spanish.** Spanish usually runs longer than English. Buttons and chips need a test at 320 px in Spanish. The mockups show Spanish Welcome, Today and Settings fitting, but a real build can still break somewhere.
- **Size budget.** The first download is 216 KB of a 220 KB budget. Replacing 1,250 inline styles with shared classes should shrink it, but I will measure after each slice rather than assume.
- **Safari and Firefox.** The mockups were rendered in Chrome only. The pinned-button layout and the variable font need a check in WebKit and Firefox.
- **Collision with the usability branch.** `fix/first-lesson-usability` is still being worked on by the other session and touches the same files. I will **not** start Part 2 until that branch is finished or you tell me to build on top of it.

## 7. What needs lesson work, not just design

The worked-example card (D2 option A) and the picture card (option B) need one `example` per lesson card to show. The layout can ship first with the example slot optional, so lessons without one just get better typography. Writing the examples is Part 4 of the brief (rewriting lessons), and the content rules still apply (our own words, numbers in both currencies, 4.5 minutes). I'm not adding any new lesson, unit or feature.

## 8. The plan for Parts 2 to 5, once you approve

**Part 2: build the redesign** (test-first, a review after each slice)
1. `src/core/tokens.js`: the values above, as CSS variables and a plain object; `docs/DESIGN-SYSTEM.md`; a "Design rules" section in `CLAUDE.md` (follow it exactly, no invented styles, any design change needs your approval).
2. **A test that fails on any color, font size, weight, radius or spacing value outside the tokens** (`test/design-tokens.test.mjs`). It scans `src/` for raw hex values, raw `px` sizes and radii, and runs on every `npm test`. It will fail on day one, which is the point: the migration makes it pass.
3. Components first (`ui.jsx`), then screens in this order: Welcome and onboarding, lesson (idea, question, feedback, finish), Today and the path, Goals, Practice and Your Money Year, Me and Settings, Ask and sheets, empty and error screens, the laptop layouts.
4. After each slice: the existing tests, the screenshot script above before and after, the size test.

**Part 3:** finish the usability audit items and run fresh audits until only polish is left. **Part 4:** the two Northvale skills (`northvale-lesson-writer`, `northvale-bilingual-audit`) are not available in this session, so I need them installed or visible here first; then every live lesson and every app text. **Part 5:** accessibility, the playthrough in both languages, three browsers, the size budget, preflight three times, the CHANGELOG, and the GitHub push (which has been blocked by the network).

## 9. Limits of this proposal

- The mockups are drawn in HTML with the app's real values. They are not the app, and nothing in them is interactive or animated. Motion is specified in the tokens but not shown.
- I designed the screens people see most. Practice, Your Money Year, Me, certificates, the leagues, News and the empty states will follow the same system but aren't drawn.
- Real phones, Safari and Firefox weren't used.
- Taste is yours to judge. If the A options feel too plain, or the laptop side panel too busy, say so and I'll adjust before anything is built.
