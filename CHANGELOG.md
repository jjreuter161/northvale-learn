# Changelog

## Unreleased — Milestone 5: Explain this, Your Money Year, certificates

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
