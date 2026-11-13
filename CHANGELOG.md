# Changelog

## Unreleased — easy, smart and professional

- **Marketing kit** (`docs/marketing/`): the landing pages (English and Spanish) now lead with "The calm, bilingual money app for young people whose lives cross the border," keep the promise right under it, add a section for the border and for everyone, and a "Built by a student, for students" section (your first name goes in the one bracket; `npm run preflight` blocks launch until it's filled). A one-page flyer and a one-page about sheet, each in English and Spanish, as print-ready PDFs with a QR code to the landing page (the QR encoder is built in, and checked with the Mac's own reader); a teacher message; a 15-post social plan for @northvalelearn with captions in both languages; a 45-second video script; and the honesty rules. `npm run marketing` rebuilds the PDFs for your address. Test: `test/marketing.test.mjs` (the numbers match the app, English and Spanish match, no made-up claims, one page each, PDFs made from the current words).
- **Easy:** from opening the app to the first answered question is **3 taps** (was 7), with no account: a warm-up question comes right after "Get started" (test: the 60-second test). The "how to start" screen is gone from first run. Settings are shorter: sound, privacy, legal and data are under **More**; "Look" is now **Colors**. Details and before/after counts: `docs/EASE.md`.
- **Smart:** Today shows the one best next step (the lesson, a review when many ideas are due, this week's mission or Your Money Year) with a one-line reason. After three perfect lessons in a row the finish screen offers the 2-minute check to skip what you know; after a tricky lesson it offers a quick review. Ask knows your current lesson and goal and suggests questions about them. The next-up reminder says how many lessons you've finished. All on the existing data; nothing new is tracked.
- **Selection:** whatever is chosen (answers, chips, onboarding choices, pickers, the active tab) is outlined in the main button's color with its cream edge on navy, thick, with a check, in every look; keyboard focus uses the readable red.
- **Professional:** the first download is **209 KB** (was 243 KB; the budget is now 220 KB): Settings, Me, Legal, the classroom screens and the glossary and myth lists load when needed. Odd font sizes and corner radii snapped to the app's scale. The internal /admin page uses the new palette. A loading indicator while a screen loads on a slow connection.
- **Setup:** `docs/LAUNCH.md` is a guided checklist with exact button names; `npm run setup` is a six-step wizard that tries each key as it's typed; `npm run ready` tries every key for real, runs the whole checklist and says "You're ready to deploy" or what to fix.
- Fixed: the skip-ahead offer disappeared as soon as it was marked as made, and a class join link closed its own sheet once the address was cleaned; both found by the new tests.

## Earlier in this version — navy, cream and signal red

- **New colors:** navy, cream and signal red, with tints for depth; the sunrise coral, green and amber are gone. Red is a spark: the main button (one per screen, with a cream edge on navy) and the current island on the sea chart. Wrong answers are never red: a neutral card with a dashed edge, a hint icon and "Not quite". Right answers: a check icon and a solid edge. Gains and losses in the practice portfolio use ▲ ▼ and signs; chart lines differ by dash. A real scam warning in Explain this gets a flag mark and a soft panel (the words stay in the text color).
- **Settings → Look:** four ready-made looks, Match my device, or your own colors (background, text and icons, main buttons and highlights). Only readable combinations (WCAG AA) are offered: five of the 27; a red background is marked bold. Saved looks migrate untouched ("white" is Cream, "navy" is Navy).
- Share cards, certificates, the app icon, the landing pages, the public check pages and the avatars use the new palette (the internal /admin page is unchanged).
- "What's new" tells existing learners once. Tests: every readable combination's contrast (`test/colors.test.mjs`), accessibility on all looks, a picker test.

## Earlier in this version — Milestone 5: Explain this, Your Money Year, certificates

- **Explain this** (Ask → Explain this): paste a pay stub, offer, ad, message or headline; the tutor explains it in four parts (what it is, the numbers that matter, what to watch out for, questions to ask), flags red flags and links the lessons. Card, account and ID numbers are hidden on the phone and again on the server; the text is used for that one answer and is never stored, logged or counted in analytics. Offline it says it needs the AI and offers the glossary. Its own daily limit (`EXPLAIN_DAILY_LIMIT`, default 8) and its cost per use on /admin. Text only: photos wait for a lawyer. 13 safety cases added to `scripts/tutor-check.mjs` (written, not run: the check costs money). Privacy policy updated (English and Spanish).
- **Your Money Year** (Practice): a one-year simulation, one month and one choice at a time, with four starting situations in the US and Mexico versions. Choices carry forward (interest grows a balance, savings grow, an emergency hurts more without a cushion). Each event links its lesson; the end screen compares your year with the steady path and names the months that mattered most. 32,000 random paths tested for sensible numbers.
- **Certificates** (Me → Skills → Certificates): five tracks cover the course; finishing every lesson in one earns a certificate with a code, checked on the server against the lessons the account has finished. Adults choose the name shown; under 18 (or no age) no name is ever kept or shown on the public check page (`/verify`, `/verificar`), which answers a code with only the track, the date and that name. Image and PDF are drawn on the phone; Share uses the share cards (no names). Deleting a certificate or the account removes it. Privacy policy updated.

## Earlier in this version — built for life between the US and Mexico, and a home test

- **"Both"** (a third choice beside USD and MXN, in onboarding and Me → Settings → Country): for someone with ties to both countries. The other currency shows where it helps, and the new unit opens after Banking and comes up in "what's next" (for everyone else it's the last unit). Pick which currency shows first.
- **A new unit, "Money across borders"** (4 lessons, its own landmark on the sea chart, each at most 4.5 minutes in both languages): exchange rates, what sending money really costs, accounts and cards in two countries, credit and work when you move.
- **A remittance cost tool** (in the lessons): a fee plus a markup hidden in the exchange rate, two illustrative services, and a link to Profeco's official comparison. It never names or ranks real companies.
- **A real-life mission:** compare the total cost of sending money through two services.
- Every new fact is in `core/facts.js` and on `docs/VERIFY-BEFORE-LAUNCH.md` (marked new).
- **`npm run home-test`** opens the app on your home Wi-Fi so a family member can try it on their phone: your computer's address (and a QR code if `qrencode` is installed), no real keys, the tutor offline, a list of what to watch for.

## 1.0.0-rc1 — Release Candidate 1 (2026-11-12)

Everything built so far, in one release for the first testers. Numbers and checks are in `docs/RC1-RESULTS.md`.

**New for learners**
- **Your course is a sea chart:** every unit is its own landmark island on a dotted route, with the boat at the current unit, waves, buoys and mist over what's next. The Scams unit's lighthouse sweeps its beam.
- **Cream, Navy or Match my device** (Me → Settings → Look). Someone new matches their phone; saved choices stay as they were.
- **"Money Missions" are now Real-life missions** (Misiones de la vida real).
- **A lesson left partway picks up at the same step** next time (for a week), even if the phone closed the app.
- **Installs as a phone app** with the North star icon, and opens with no connection from the first visit; lessons already opened work offline.
- **"What's new"** on Today after an update, once. A small **Beta** label.
- Milestone 4.5's six new kinds of question, Myth or fact, Your money week and The real cost (merged from `milestone-4.5`).

**Faster and sturdier**
- Units load when they're needed: 343 KB → 227 KB to open the app; on a slow phone, Today is ready in 2.23 s instead of 2.70 s.
- WCAG 2.2 AA on every main screen, both looks, both languages (axe-core).
- The lesson's buttons stay on screen however long the feedback (they could fall below the screen before).
- Password hashing runs two at a time, so a burst of sign-ups stays within the server's memory.
- Error pages are never saved for offline use.

**For you (the operator)**
- `npm run restore` brings back a daily backup; `npm run load-check` (50 simulated testers); `npm run deploy:dry-run` (the Dockerfile's steps, without Docker).
- `/admin` opens with the first week against its targets.
- `docs/VERIFY-BEFORE-LAUNCH.md`: every fact, number and rule to check, written from the code. Every changeable number lives in `src/core/facts.js`, and worked examples are re-checked when a fact changes.
- Security review 2 (`docs/SECURITY-REVIEW.md`); privacy policy (EN/ES) and `the private compliance notes` updated; the lawyer's list has the new names.
- The repository is public on GitHub, with a private author email in every commit.

**Tests:** 122 checks in `npm test`, including every lesson played through in English and Spanish, saved learners from every milestone, a crash mid-lesson, backup restore, install and offline.

## Before RC1 (0.x, not released)

- **2026-11-11 · Playful navy and cream:** the island map, Fraunces, sunrise coral, the North star streak.
- **2026-11-11 · Milestone 4.5, "Fun, but professional":** six new kinds of question, moments, a personality in the writing, daily hooks.
- **2026-11-10 · Brand and look:** the North star logo, "Find your open water", Our promise, navy and cream.
- **2026-11-10 · Clarity rebuild:** four tabs (Learn, Goals, Practice, Me), Today, three-screen onboarding, the Ask tutor everywhere.
- **2026-11-03 · Launch prep:** preflight, demo data, the launch kit.
- **2026-10-26 · Milestone 4:** the learning engine (mastery and reviews), 17 units and 59 lessons, Money Missions, reminders and the weekly recap, invites and classroom mode (off for real users), the landing page and waitlist.
- **2026-10-24 · Milestones 1–3:** lessons with XP and streaks, the practice portfolio, goals, the AI tutor and news explained; accounts, the beta tools (/admin, feedback, the survey), English and Spanish for the US and Mexico.
