# Release Candidate 1: results

What each launch-hardening check found, with the numbers. The checks are in `npm test` unless noted.

## Performance (Part 3.1)

Units load on demand; a size budget (`test/size.test.mjs`: 245 KB to open the app, 14 KB per unit).

| | Before (e3c223c) | After |
|---|---|---|
| Downloaded to open the app (compressed) | 343 KB | 227 KB |
| Slow phone, first visit: Today ready | 2.70 s | 2.23 s |
| Slow phone, first visit: largest paint | 3.10 s | 2.20 s |
| Slow phone, first visit: total downloaded | 472 KB | 277 KB |
| Slow phone, next visit: Today ready | 2.53 s | 2.03 s |

"Slow phone" is Chrome with 4× slower CPU and slow 4G. No long tasks while scrolling the course.

## Accessibility (Part 3.2)

WCAG 2.2 AA, checked by axe-core 4.14.0 (`test/a11y.test.mjs`): 66 screens (Welcome to lesson complete, every tab, Settings, sheets, Ask, the privacy policy, the landing pages) in Cream and Navy, English and Spanish, with no problems. Every control shows a focus ring (40 tab stops), and at 200% zoom (Spanish, the longer language) nothing runs off the screen.

## Every lesson, played through (Part 3.3)

`test/lessons.test.mjs`: all 59 lessons, start to finish, in English/US (Cream) and Spanish/Mexico (Navy): 590 questions, the first of each lesson missed on purpose (so the extra card, the easier question and the second try are played too). No errors, raw text keys, broken numbers or cut-off text. About 2 minutes.

## Data safety (Part 3.4)

`test/data.test.mjs`:
- a data file written by the Milestone 4 server opens unchanged on today's server;
- its daily backup restores with `npm run restore` (the data it replaces is kept 14 days); a file that isn't a backup is refused;
- learners saved at each milestone (before Milestone 4, Milestone 4, Clarity, M4.5, the playful design; `test/fixtures/`) keep their lessons, XP, streak, badges, goals, practice portfolio, language and look, and can finish a new lesson;
- someone new gets Match my device;
- closing mid-lesson, even a crash, picks up at the same step; a lesson finished just before the app shuts is kept.

## Security and privacy (Part 3.5)

`docs/SECURITY-REVIEW.md`, review 2: three fixes, everything added since Milestone 4 Phase 6 checked, `npm audit` 0 vulnerabilities. The privacy policy (EN/ES) and COMPLIANCE.md are updated; the lawyer list has the new names.

## Load (Part 3.6)

`npm run load-check` (not in `npm test`; about a minute): 50 testers, each from their own network address, open the app, 30 make accounts, then for a minute save progress, send usage stats and check the league, news and prices every 1–2 seconds (far busier than real people).

| Request | Count | Median | 95% | Slowest |
|---|---|---|---|---|
| Open: the app | 50 | 8 ms | 18 ms | 44 ms |
| Open: units | 400 | 3 ms | 7 ms | 33 ms |
| Sign-up | 30 | 101 ms | 159 ms | 215 ms |
| Save progress | 1,192 | 1 ms | 2 ms | 17 ms |
| Usage stats | 1,971 | 1 ms | 3 ms | 20 ms |
| League | 410 | 1 ms | 2 ms | 11 ms |

5,460 requests (88 a second), **no errors**. Server memory: 100 MB idle, 148 MB at most.

**Fixed along the way:** 30 sign-ups at once took memory to 219 MB (each password hash uses 32 MB, four ran at once), too close to the Fly machine's 256 MB. Hashes now run two at a time: 156 MB at most, and sign-up's slowest is 0.2 s. With 100 testers: no errors, 169 MB at most.
