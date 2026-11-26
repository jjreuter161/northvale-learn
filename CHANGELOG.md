# Changelog

## Unreleased — school mode, Step 5: on for testers only

- **Classroom mode stays off for everyone.** It's on only for the testers the owner names: on the admin page by email (now also before that email has an account: it applies when they sign up), or in the host's `.env` as `CLASSROOM_TESTERS` (comma-separated). Deleting an account forgets its email.
- **Trying it at home:** `npm run home-test -- --teacher you@example.com` turns it on for that email in the home test and prints the tester link (`?school=on`).
- A teacher who isn't a tester gets an account and a plain note that classroom mode isn't on for it yet.
- The pilot card shows only the chosen units once they're picked ("Change units" until a quiz is taken).
- Screenshots of the real screens (phone and laptop, English and Spanish): `docs/design/school/app-*.jpg`.
- Tests: testers by email and in the environment (`test/classroom.test.mjs`); a non-tester teacher, and the pilot teacher turned on before signing up (`test/school.test.mjs`).

## Unreleased — school mode, Step 4: pilot tools

- **The pilot quiz:** the teacher picks up to 4 units; the app builds one set of questions from them (up to 10, multiple-choice and true-or-false from the lessons, English and Spanish) and uses the same set before and after. The teacher opens and closes each quiz. A student takes it one question at a time and sees only their own score. The server grades it; a device never gets the answers. The units lock once anyone has taken a quiz.
- **The teacher sees totals only:** how many took it, the average before and after, the change, and the share right per question, and nothing until 3 or more students have answered. Never a student's score.
- **End-of-pilot questions:** after the after quiz, three taps (enjoyed it, learned something, would keep using it) and an optional comment. The teacher sees the totals (from 3 students); the comment goes to the owner only (admin page), with the class's name and the day, never the nickname.
- Leaving or being removed takes a student's quiz and pilot answers out of the totals.
- `docs/PILOT-PLAN.md`: the checklist for a free 2–4 week pilot with one class, a parent note in English and Spanish, the timeline, running the quizzes, and the proof to collect.
- The teacher guides (`/teacher-guide.html`, `/guia-docente.html`) describe the simple version and a four-week pilot.
- The compliance notes were updated for the pilot, in the private notes outside this repository (decided: they stay out of the public repository).
- Tests: the pilot rules in `test/classroom.test.mjs`; the teacher's and a student's pilot in `test/school.test.mjs`.

## Unreleased — school mode, Step 3: accounts and classes

- **Any account can belong to classes.** The server keeps, on the account, which classes it's in (the class and member IDs, nothing else). A student who joins while signed in is linked at once; one who joined first links the class when they sign in.
- **School and home, one student.** On another device the account stands in for the device's secret key, so the class (and, as before, the progress) follows a student from a school computer to their phone. A lesson finished at home counts for the class.
- **Progress never lives in a class.** Leaving, being removed or the class ending deletes only the class's record; a device that's simply signed out keeps its class for when they sign in again. Deleting an account removes its class records.
- **"Use Northvale at home too"** on Today for a student in a class without an account (a parent's or guardian's OK under 18, as before).
- No payments: schools are free during the pilot; nothing to build.
- Tests: account links in `test/classroom.test.mjs`; school to home, leaving keeps progress, in `test/school.test.mjs`.

## Unreleased — school mode, Step 2: the smallest teacher tool (behind the classroom flag)

From `docs/SCHOOL-PLAN.md`: one app with two ways in. Nothing changes for anyone unless school mode is on (a tester link, `?school=on`, or the classroom flag on for everyone).
- **The choice at the start:** "How will you use Northvale?" with "I'm a student" (today's first steps) or "I'm a teacher", plus "Have a class code? Join a class".
- **One teacher setup screen:** email, password, an adult age band, the teacher terms, and in plain words: free during the pilot, no ads, student data never sold or shared. The confirmation email goes out at once; then the teacher names a class and lands on it.
- **The class is one list:** which lessons each student finished, as a tick under each unit someone started (laptop) or a dot per lesson (phone). The code and "Copy join link" sit beside it; taking new students, a new code, removing a student and ending the class are in Class settings.
- **A short join screen:** your teacher sees your nickname and which lessons you finish from now on; never your goals, amounts or notes, tutor questions, age or email; no messages; leave anytime and keep your progress.
- **Hidden for the pilot, not deleted:** assignments, topic totals, the class leaderboard (and Me's "My class" league), the missions column and "count earlier lessons". A student's device now reports only the lessons finished since joining.
- **On Today:** "Your class" for a student, "Your classes" for a teacher.
- Tests: `test/school.test.mjs` (new); the browser test's classroom walkthrough follows the simple version (and checks the device sends only finished lessons, and that leaving keeps a student's progress); the classroom test's allow-list includes the lesson list.

## Unreleased — Round 3 and a bug bash

- **Keyboard:** Enter on a focused Check no longer checks and then skips the feedback; Escape in a lesson does what the X does ("Leave now?", or close on the finish screen).
- **Offline:** a lesson whose unit hasn't downloaded yet shows "Try again" and "Close", tries again by itself when the connection is back, and Back or Escape close it without leaving the app.
- **Words:** a review is "N ideas to refresh · 2–3 min" on Today, Me and Practice (it said "concepts" in two places).
- **Goals:** the goal picked at the start is the first card, so "tap it below" needs no scrolling on a phone.
- Tests: `test/bugbash.test.mjs` (fast taps, Back and Forward, reload mid-lesson, offline, long names on a 320 px phone, language and look switched mid-session, keyboard only, 200% zoom, a 2560 px monitor) runs in `npm test`; `test/usability.test.mjs` has R3 checks.

## Unreleased — usability audit, Round 2

- **The goal you picked is remembered everywhere.** Goals and Today's side panel named nothing ("No goal yet") after setup had asked what you are saving for; both now name it and lead to giving it an amount and a date.
- **News is calm.** Every headline had a filled navy "Mark as read" button (the only place that color filled a button); it is now a plain button that turns into a quiet "Read".
- **Me on a computer says things once.** Achievements and Skills were in the left column and again as rows on the right; the rows now show on a phone only.
- **Curly quotes.** 372 straight quote marks in lessons, missions, Your Money Year, a practice set, the glossary and What's new became “ ” in both languages.
- **A plainer toast:** "Goal saved." instead of "Goal saved. Future you says thanks."
- **Firefox and Safari's engine:** installed for testing (`node node_modules/playwright-core/cli.js install firefox webkit`); `test/browsers.test.mjs` now runs the main flows in Chrome, Firefox and WebKit on a phone and a laptop.
- Tests: `test/usability.test.mjs` has an "R2" check per fix. The browser test's daily-hooks check no longer fails on Sundays (the money week comes first that day, by design), and the screens test follows the new Me layout and Today panel wording.
- `docs/TESTER-SCRIPT.md`: what to ask a new person to do in 10 minutes, what to watch, and five questions after, in English and Spanish.

## Unreleased — usability audit, items 10 to 32

- **Lessons:** every step says which lesson and which step ("3 of 12"; an extra card and a retry don't count), idea cards are labelled, and on a computer Continue sits under the text. A goal step that finds a goal already made is done at once; the goal wording no longer says "first".
- **Today and Practice:** a computer shows the next few islands and "Show more units" (the page was 6,100 px tall); tapping a locked unit says when it opens; "goal met" replaces "55 / 20 XP"; "Streak freezes"; one always-true note on Practice and a locked News row that says how many lessons are done; gaps between cards; the Skills sheet only labels what has been started.
- **Words:** no flag emoji (the welcome screen and Settings group Language and Country and use words); a goal made in a lesson keeps its name in both languages; "Falta 1 año"; "Streak: 1 day"; no stray capitals in the Money Year, which now names the month after a choice and explains Peace of mind and Credit health.
- **Look:** the budget planner's bar has three tones and a key; every control is at least 43 px tall on a phone; the finish picture no longer has a boat on its caption and spans the window on a computer.
- **Build:** Settings, About shows the version (commit and day, from `scripts/build-info.mjs`, written before each build); `.claude/launch.json` uses the server's real port (8950).
- Tests: `test/usability.test.mjs` (one check per fix, phone and laptop where it matters); the browser and layout tests were updated where behaviour changed on purpose.

## Unreleased — fewer interruptions, a plainer Ask, a steadier Ask sheet and Settings that start with language (usability audit, items 6 to 9)

- **At most one ask per visit.** The survey, the age question, the account offer, the "New: Practice" sheet and the reminder offer take turns (`src/core/asks.js`): the first one due in a visit is shown, the rest wait for the next visit. The survey now waits for the fifth lesson, and the account offer is not on the first finish screen (it shows from the second lesson, once). An age card nobody answers keeps its turn each visit; "Not now" ends it.
- **Ask without the AI key** says what it can do (explain money words, point to the lesson that covers a question) and shows words to tap. The example words never appeared before (the glossary could load before the sheet mounted); they do now. The "a free account turns on the full tutor" line shows only where the host has the tutor. Nothing about how the key is read or sent changed.
- **The Ask sheet** keeps its title bar, close button and switches in place; only the messages scroll, and the newest answer stays in view (`Sheet` has a `fill` option).
- **Settings** opens on "Language and country" (the account form is further down, after Colors), each row is labelled (Language, Country, Main currency), the note is shorter, and the buttons that mean "make or use an account" open the Account section.
- Tests: the browser test now expects the survey at five lessons and has a one-ask-per-visit check; the layout test checks the new Settings order.

## Unreleased — the first lesson, easier to use (usability audit, items 1 to 5)

From `docs/USABILITY-AUDIT.md` (the owner's checkout, untracked): the five things a new person hits in the first lesson.

- **The way forward stays on screen.** On the lesson-complete screen "Next" and "Done" are pinned to the bottom (as the buttons in a step already were), so a long finish screen with the account card no longer hides them.
- **The goal you picked stays your goal.** A lesson's "your first goal" step now starts from the goal chosen at the start (its own amount, and a name that follows the language) instead of making a generic "Savings goal" that re-sorted the course. The two steps that do this are marked `own: true` in `save.js` and `budget.js`. Someone who chose "Just understanding money" gets what they got before.
- **A clearer hands-on step.** While a tool waits there is one button, "Skip for now" (no greyed "Try it above to continue"); when it's done there is one, "Done — continue". After making a goal the card shows the goal, without "You already have a goal" and a button that can't be pressed. Toasts sit under a lesson's top bar instead of on its close, progress and Ask buttons.
- **Chosen is not red.** Whatever is chosen (a language chip, an answer, a tab, a switch) is outlined in the text color; red stays for the main button. `--select` is the text color in every look (the colors test says so), and the extra outer ring on navy is gone.
- **Back stays in the app.** On a phone and in a browser, Back closes what is open on top (a lesson asks "Leave now?", a sheet closes, a screen below a tab goes up one level, the finish screen closes) instead of leaving the app. New `src/core/back.js`: each open layer takes one history step and gives it back when it closes. Not done: an address for each screen, and the setup screens (they have their own back arrow).

## Unreleased — three browsers, and a plan for 50 units

- **Safari and Firefox** are now tested: `test/browsers.test.mjs` runs the main flows (setup for someone new, then Today, every tab, Settings, the streak dialog, Ask, and a lesson) in Chrome, Firefox and Safari's engine (WebKit), each on a laptop and on a phone (WebKit as an iPhone 13), and fails on console errors, anything cut off, or raw text. Nothing needed fixing: all three pass. (Firefox and WebKit are installed for testing only: `node node_modules/playwright-core/cli.js install firefox webkit`.) The every-screen helpers moved to `test/lib/screens.mjs`.
- **Inter is final:** the hidden `?heading=serif` option is gone.
- **`docs/CONTENT-ROADMAP.md`:** a plan (nothing built yet) to grow the course from 18 units and 63 lessons to 50 units and 225 lessons: twelve tracks and three levels, the full outline, four waves of eight new units starting with the border, how the sea chart and Learn tab should show 50 units (mockup in `docs/design/content-roadmap/`), and the content quality plan.

## Unreleased — a professional look, setup on a computer, and no empty space

- **More serious look** (premium finance app, not a game): **Inter** for headings (heavier, tighter) instead of Fraunces (final; EB Garamond is only the logo); smaller corners (cards 12, controls 8–10, tags 6) and almost no pills; flat buttons (no chunky bottom edge, no push-in); no bobbing, twinkling, rippling or sweeping motion and a plain fade for dialogs; pictures smaller and simpler (a shorter picture on Today, no scattered stars on the finish screen, and the sea chart without birds and buoys, with a thin dashed route); plainer wording ("A short review helps you keep them", "Show 4 more units", "Year complete"). Fraunces is no longer downloaded.
- **Setup on a computer** is two halves: the brand on the left (logo, "Find your open water", one line on what Northvale does, "No ads. We never sell your data."), the question on the right at a comfortable width. The welcome screen, setup, sign-in, sign-up and the password-reset page all use it. Resizing the window mid-setup keeps your place.
- **No empty space:** Today gets a progress overview (lessons done, current unit, ideas solid or mastered), the next lessons and this week's activity; Me shows your achievements and skills beside the week; Goals offers the next goal as a grid of templates beside your goal; the panel beside Today says what goes in every card for someone new (and the one action to fill it). The locked Practice screen keeps a readable width.
- **Bugs:** `docs/BUGS.md` (what happened, the cause, the fix, the test), including one in the released layout: the panel beside Today could be cut off on a short screen. The friend's list was left blank in the request, so none of those are in yet.
- Tests: `test/screens.test.mjs` visits every screen a new learner and one three weeks in can reach, at 1366 and 1920px, and fails on console errors, failed requests, anything cut off, raw text keys or broken text; axe runs on setup at both sizes; the layout test checks that resizing keeps your place and that the panel fits a short window; the colors test checks the brand panel is readable in every look. Before-and-after screenshots: `docs/design/professional/`.

## Unreleased — a real computer layout

- **Three layouts, one app.** Phone (under 600px): exactly what it was. Tablet (600–1023px): wider content, a bigger sea chart, two columns on Goals, Practice and Me. Computer (1024px and up): a sidebar replaces the bottom tabs (the logo, Learn, Goals, Practice, Me, and Ask), and on a wide screen (1180px and up) Today gets a panel on the right: streak, daily goal, how far along your goal is, this week's mission, and Myth or Fact. The sea chart is bigger and shows every island. Lessons, the finish screen and Explain this stay in a calm centered column (at most 640px); Goals, Practice and Me use grids; Settings is a list of sections on the left and the options on the right; a goal's page and the other inner screens keep a readable width.
- **For a keyboard and mouse:** in a lesson, 1–4 pick an answer and Enter checks and continues (with a small hint shown until the first lesson is over; a dialog on top keeps its own keys); rows, cards, buttons and islands respond to the mouse; sheets and pop-ups are centered dialogs on screens 700px and wider and still come up from the bottom on a phone.
- **Zoom:** the layout follows the browser's pixels, so a laptop zoomed to 200% (about 683px) switches to the tablet layout, and further to the phone layout.
- Tests: `test/layout.test.mjs` (phone 390, tablet 820, laptop 1366, desktop 1920, a laptop at 200%, Spanish, and the landing, admin, check-a-certificate and teacher-guide pages: nothing off the side or cut off, the right navigation, the panel, columns, dialogs, Settings, the keyboard, hover); accessibility checks (axe) at tablet, laptop and desktop sizes; the English every-lesson playthrough now runs at laptop size. First download: 212 KB (budget 220). Screenshots at each size: `docs/design/computer/`.

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
