# Changelog

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
- Security review 2 (`docs/SECURITY-REVIEW.md`); privacy policy (EN/ES) and `docs/COMPLIANCE.md` updated; the lawyer's list has the new names.
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
