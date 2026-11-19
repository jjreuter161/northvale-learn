# Northvale Learn: usability audit

## Status of Round 1 (updated as fixes land on `fix/first-lesson-usability`)

The audit text below is the original, written before any fix. This table says what happened to each problem. Tests for items 10 to 32 are in `test/usability.test.mjs`; items 1 to 9 are covered in `test/browser.test.mjs`, `test/layout.test.mjs` and `test/colors.test.mjs`.

| # | Problem | Status |
|---|---|---|
| 1 | Finish screen hides Next and Done | Fixed (commit 8fa5e93) |
| 2 | The chosen goal is replaced and the path jumps | Fixed (8fa5e93) |
| 3 | The hands-on step is confusing | Fixed (8fa5e93); the lesson-3 repeat is item 11 |
| 4 | Red means chosen | Fixed (8fa5e93); keyboard focus is still the red ring on purpose |
| 5 | Back leaves the app | Fixed in Chrome (8fa5e93); real phones unconfirmed |
| 6 | Too many asks on day one | Fixed (30b239a) |
| 7 | Ask without the AI key | Fixed for the offline experience (30b239a); the real tutor needs `ANTHROPIC_API_KEY` on the host |
| 8 | Ask sheet on a phone | Fixed in Chrome (30b239a); the on-screen keyboard is unconfirmed |
| 9 | Settings order and labels | Fixed (30b239a) |
| 10 | Lesson cards are text on an empty screen | Partly fixed: the lesson and "3 of 12" show above every step, idea cards are labelled, and on a computer Continue sits under the text. Not done (art is frozen): pictures, and a worked number on each card (content) |
| 11 | "Make your first goal" again | Fixed: a goal step that finds a goal is done at once; the wording no longer says "first" |
| 12 | Today repeats itself and is endless | Partly fixed: a computer shows the next few islands and "Show more units" (Today 6,100 px to under 3,200). The same lesson still shows in the big card, the course card and the list (they are different views of it); the big card's reason line says why it changed |
| 13 | Scores not explained | Fixed: "goal met" instead of 55 / 20 and 30 of 20, "Streak freezes", the Money Year scores explained, "1 day" singular. The streak star is unchanged (tapping it explains it) |
| 14 | Spanish and Mexico slips | Fixed: a lesson's goal name follows the language, "Falta 1 año", no stray capital. Not changed: a bare "$" in the Both setting (it is how amounts are written everywhere) |
| 15 | Welcome chips | Fixed: two labelled groups, words not flags, the picture is not cropped |
| 16 | Budget bar has no split | Fixed: three tones, a gap and a key |
| 17 | Small tap targets | Fixed: every control on Learn, Goals, Practice and Me is at least 43 px on a phone (tested) |
| 18 | Practice contradicts itself | Fixed |
| 19 | Money Year stumbles | Fixed: the month shows before and after a choice, no stray capital, the two scores are explained. Not changed: normal scrolling under the header |
| 20 | Laptop layout details | Fixed: gaps between the Practice cards, the finish picture spans the window |
| 21 | Review looked long | Not changed: only reproducible by missing every question; a normal review is three questions |
| 22 | No step count | Fixed |
| 23 | Locked unit says nothing | Fixed |
| 24 | Finish screen clutter | Partly fixed: the boat no longer sits on the caption |
| 25 | Wrong answers always repeat | Not changed: it is how mastery works, and it repeats once |
| 26 | Missions list has no filter | Not changed: it would be a new feature (feature freeze) |
| 27 | Skills sheet "New" wall | Fixed |
| 28 | No build indicator | Fixed: Settings, About shows the version and day |
| 29 | Preview port | Fixed |
| 30 | macOS blocks the preview from ~/Downloads | Fixed by moving the project (and its worktrees) to `~/Projects/northvale-learn`, which macOS does not protect; `.claude/launch.json` runs `npm run dev` there |
| 31 | "1 days" | Fixed |
| 32 | Flag emoji | Fixed (with 15) |

Audit date: Wednesday 18 November 2026. Nothing was fixed. No app code was changed, nothing was committed or pushed.

This is an audit of what a brand-new person would meet in the first 30 minutes. The owner's report is that the app is hard to use; this document is meant to turn that into a list the owner can agree on before any fix starts.

---

## 1. What was tested

**Build.** Branch `content/wave-1-drafts`, commit `6e57e15f9b5cb858eb5613b57e31ced080aec61a`. I ran `npm run build` at 09:15 on 18 November 2026; the working tree was still clean afterwards (the generated course index did not change).

**Is it the same app as `main`?** `main` is at `140c1a1`. `git diff main..content/wave-1-drafts --stat -- src server web` shows 12 files, 3,074 insertions, 1 deletion, **all of it in `src/`, none in `server/` or `web/`**: eight draft unit files, `additions.js`, `units/all.js`, two scam practice sets in `src/modules/goals/life.jsx` (+22 lines), and +31 lines in `src/core/facts.js`. The app reads its course from `index.gen.js`, which `scripts/lesson-index.mjs` writes with draft units filtered out. The build output contains no chunk for any of the eight draft units, and the app shows 18 units and 63 lessons. So what I tested behaves like `main`.

**How it was served.** `node server/index.js` with `NORTHVALE_DOTENV=0 PORT=3100` and a throwaway data folder. There is no `.env` and no API key, so the tutor runs "offline" (glossary only) and prices are samples.
**Exact address: `http://localhost:3100/`**

The preview tool could not start the project. macOS blocks the preview helper from reading `~/Downloads` (`operation not permitted` on the folder and on `package.json`), so I started the server from a shell instead and opened the Browser pane on that address. Nothing was listening on ports 3000 or 8950 when I began. Side note: `.claude/launch.json` tells the preview to wait on port 3000, but the server's default port is 8950 unless `PORT` is set. If that mismatch was in play earlier, it could explain a preview that did not show the latest build. I cannot prove that. The service worker is network-first, so it is unlikely to serve stale files while online. The app has no visible build or version number anywhere (Settings → About has none), so there is no way to see which build is on screen (item 28).

**How it was used.** Google Chrome driven by Playwright, as a fresh visitor each time.
- Phone: 390 × 844, 2× pixel density, touch, an iPhone user-agent string. This is Chrome pretending to be a phone, not a real phone.
- Laptop: 1366 × 768, 1×.
- Screenshots: `docs/usability/`, numbered in order. **Phone 001–185, laptop 186–329** (329 files). Every lesson step has a screenshot, plus one after answering and one after the feedback. Full-page captures (e.g. 008, 148, 256) draw the fixed tab bar in the middle of the image; that is a capture artifact, not a bug.
- I looked at the screenshots that are cited below with my own eyes, and read the page text for the rest.

**Covered, phone:** welcome, onboarding, Today, three full lessons (each with its hands-on step), a review, Goals, Practice, real-life missions, Your Money Year (played to the end three times), Ask, Me, Settings, Spanish + Mexico (welcome, onboarding question, Today, Goals, Practice, closing a lesson), reload and Back button during a lesson, tapping a locked unit.
**Covered, laptop:** the same flow in English, then Both (US + Mexico), then Spanish with a lesson, missions, tools, skills.
**Also measured:** load time and size (fine: about 2 s to the welcome screen on a simulated slow 4G link, 119 KB of gzipped JavaScript), and an automated accessibility check (axe-core) for colour contrast and button/link names on Today: no violations.

**Text rules the owner set:** I scanned every screen I captured for exclamation marks and emoji in the app's own voice. None. The only `!` is inside a quoted ad slogan in a lesson. The one emoji use is the country **flags** on the language chips (item 15).

---

## 2. Limits of this audit (read before trusting it)

- **I am not a first-time user.** I drove the app with a script and read what came back. I did not have the owner's eyes, thumbs or patience, and I already knew what the app is for.
- **I did not spend 15 literal minutes at human pace per size.** I covered more screens than that in the time, but fast. I can judge layout, clarity, dead ends and wording. I cannot judge how long a lesson really feels, or whether a 15-year-old understands "emergency fund" from a card.
- **I answered most questions with the first option**, so I saw many "Not quite" paths, retries and a long review. A normal learner gets more right and sees fewer of those; the lessons would feel shorter.
- **Could not judge:** the real AI tutor (no key), account sign-up and sign-in, leagues, classes, reminders and push, the practice portfolio and News (locked until later lessons), certificates, the dark and "match my device" colour themes, a screen reader, Safari or Android, a slow real phone, real thumb reach, the on-screen keyboard.
- **Two findings need a real phone to confirm:** the tutor sheet layout (item 8) and the Back-button behaviour (item 5). I saw them in desktop Chrome with a phone-sized window.
- **The Learn tab** is expected to become tracks and a sea chart, so I note how it feels today (item 12) but do not treat its shape as a bug.

---

## 3. What already works well (do not break these)

- **Getting started is fast.** Welcome, one warm-up question, "what for", then you are inside the first lesson: three taps from opening to answering a question, no account (001–006). Keep it that short.
- **Feedback is kind and useful.** A wrong answer says "Not quite", explains why, shows the answer, and promises a second chance at the end (013). Right answers get one calm line (004). No exclamation marks, no emoji, no shaming.
- **Leaving a lesson is safe.** Closing asks "Leave now? Next time you pick up right here" and it is true (183). Resume works.
- **"Skip for now"** exists on every hands-on step, so nobody is trapped.
- **Question types are varied and clear:** pick one, true/false, number, put in order, match pairs, each with a one-line instruction (025, 050).
- **Laptop Today** (sidebar, main column, right rail) is calm and easy to read (222). Laptop lessons support the keyboard ("press 1–4 to choose, Enter to check").
- **Goals** screen is clean (147, 288). **Real-life missions** read well (327). **Your Money Year** is the best-designed screen: one decision per month, a short result, and an ending that compares you with a "steady path" (154, 155, 165).
- **Spanish is natural and local** ("gastos hormiga", "Rumbo a mar abierto"), and the welcome screen switches language and country in one place (181).
- **Performance is not a problem.** About 300 KB over the wire to reach the welcome screen; a first lesson card appears about a second after the last onboarding tap, even on a slow connection.
- **Contrast passes** an automated check, and no control I measured is under 36 px tall.

---

## 4. Problems, worst first

Size of fix: **small** = copy, colour or a few lines (hours); **medium** = a screen or flow changes (days); **large** = a redesign or new content (a week or more).

Items 1–20 are the ones I would fix, in this order. Items 21–32 are smaller.

### 1. After a lesson, the buttons that take you forward are below the screen (phone)
- **Saw:** the "Lesson complete" screen stacks an XP ring, a wave picture, "In real life", a "That one was tricky / Review first" card, a plain "Achievement: First lesson" line, then a "Keep your progress: Create a free account" card. "Next: What's a budget?" and "Done" sit at 859 px and 921 px on an 844 px-tall screen. You must scroll to find them. On the laptop the account card runs off the bottom too.
- **Where:** end of every lesson, phone (worst) and laptop.
- **Why it hurts:** this is the moment someone decides whether to do one more. The way forward is invisible, and an account upsell sits between the learner and it. Someone who does not scroll thinks the app is stuck.
- **Screenshots:** `044-phone-lesson1-end-s06.png`, `046-phone-lesson1-complete-scrolled.png`, `221-laptop-lesson1-end-s04.png`
- **Fix size:** small. Pin "Next" and "Done" to the bottom of the screen; shrink the ring; move the account card out of this screen.

### 2. The goal you chose at the start is replaced, and your path changes under you
- **Saw:** I chose **Emergency fund** at onboarding. The first lesson was Unit 2 Saving, "Building toward: Emergency fund" (006, 007). In that lesson's hands-on step the goal form is named "Savings goal" with $1,000 pre-set. I pressed Create goal. Behind the lesson, Today instantly changed to "Unit 1 · Budgeting · What's a budget?" and "Building toward: **Savings goal**". After finishing the lesson, Unit 2 Saving reads "after Unit 1" even though I had just completed its first lesson, and Learn says "0 of 18 units". The Goals tab lists one "Savings goal" and offers "Emergency fund" as a new goal I never made (288).
- **Where:** onboarding → first lesson's goal step; both sizes.
- **Why it hurts:** the app's opening promise is "it picks your first lessons for your goal". Within four minutes the goal is renamed and the order of lessons moves. A learner cannot tell where they are or why. This is probably the biggest cause of "I don't understand how this works".
- **Screenshots:** `006-phone-after-goal.png`, `007-phone-today-top.png`, `029-phone-lesson1-action-done.png`, `070-phone-today-after-lesson1.png`, `185-phone-tap-locked-unit.png`, `147-phone-goals.png`, `190-laptop-after-goal.png`
- **Fix size:** medium. The goal step should start from the goal the learner already picked (name, type), and finishing a lesson's practice step should not re-sort the course. Make the "locked/after Unit 1" rule agree with lessons already done.

### 3. The hands-on ("do it") step is confusing
- **Saw:** the step shows a form, then two buttons at the bottom: a greyed, primary-looking "Try it above to continue" and a plain "Skip for now". Creating the goal fires two toasts ("Achievement: First goal", "Goal saved. Future you says thanks.") that sit on top of the close button, progress bar and Ask button. The card then says "You already have a goal. Check its plan, or add another." with a greyed, untappable "This plan looks right", while the real way on, a red "Done — continue", is at the bottom of the screen. In lesson 2 the budget planner has "Save my plan" above "Try it above to continue", and saving gives no message beyond the button changing.
- **Where:** the last step of every lesson with a tool; phone and laptop.
- **Why it hurts:** people cannot tell whether they have done the step, which button is live, or what "Skip for now" costs. Three buttons doing one job reads as broken. The goal form is three sliders with no way to type a number (028).
- **Screenshots:** `028-phone-lesson1-s11.png`, `029-phone-lesson1-action-done.png`, `030-phone-lesson1-action-after-toasts.png`, `066-phone-lesson2-s11.png`, `067-phone-lesson2-action-saved.png`, `212-laptop-lesson1-action-toasts.png`
- **Fix size:** medium. One primary button that changes with the state ("Create goal", then "Continue"); remove the greyed leftovers; show toasts below the header or only one at a time; say in one line what skipping does.

### 4. A red outline means "chosen", and red also means "wrong"
- **Saw:** every selected thing gets a thick red outline: the active tab (bottom bar and laptop sidebar), the language and country chips on the welcome screen and in Settings, the Simple/Chat switches in Ask, the pairs you match and the items you order, and the focused text box. The main button on nearly every screen is also red.
- **Where:** everywhere; both sizes.
- **Why it hurts:** red is the colour people read as "error". In a learning app where mistakes are shown as "Not quite", red boxes on your own picks look like marks against you, and they work against the owner's "calm" goal. The Colors setting already has "Navy & cream" and "Cream & navy", described as "no red at all".
- **Screenshots:** `001-phone-welcome.png`, `007-phone-today-top.png`, `025-phone-lesson1-s09-answered.png`, `050-phone-lesson2-s02-answered.png`, `168-phone-ask-open.png`, `175-phone-settings-language.png`, `186-laptop-welcome.png`
- **Fix size:** small. Use navy for "selected"; keep red for one main button, or make a no-red look the default.

### 5. The Back button leaves the app, and screens have no addresses
- **Saw:** inside a lesson I pressed browser Back and the page went to a blank page: the app had added no history entries. The address stays `/` on every screen. Reloading in the middle of a lesson drops you on Today (reopening the lesson does resume).
- **Where:** all screens; I tested phone size in desktop Chrome.
- **Why it hurts:** on a phone the Back gesture is the first thing people try to close a lesson, a sheet or a sub-screen. Here it leaves the app entirely. Nothing can be bookmarked or shared (not Practice, not Settings, not a lesson).
- **Screenshots:** `183-phone-close-lesson.png` (the good "leave now?" prompt), `184-phone-after-reload-mid-lesson.png`
- **Fix size:** medium. Push a history step when a lesson, sheet or sub-screen opens, and let Back close it. Confirm on a real phone.

### 6. Day one has too many interruptions
- **Saw:** after the third lesson a sheet asks "Quick question: How would you feel if you could no longer use Northvale?" (Very / Somewhat / Not disappointed). On the laptop it arrived a moment after Today loaded, so my first click landed on the backdrop. Other asks on day one: a "How old are you?" card on Today (045), "Create a free account" at the end of the first lesson (044), and a "New: Practice" sheet the first time Practice opens (149).
- **Where:** Today and tabs, phone and laptop.
- **Why it hurts:** four requests in one session before the person has a reason to care. The "would you miss us" question reads as market research and covers the main button.
- **Screenshots:** `117-phone-today-after-3-lessons.png`, `285-laptop-today-after-3-lessons-survey.png`, `045-phone-after-lesson1.png`, `149-phone-practice-first-open.png`
- **Fix size:** small. Hold the survey until about the fifth lesson or the third day; ask age in Settings or once in onboarding; show at most one ask per session.

### 7. Ask cannot answer a normal question without the AI key
- **Saw:** with no API key the tutor says "The tutor is in offline mode, so it can only explain basic terms. A free account turns on the full tutor, which answers any money question." A glossary word works ("What is an index fund?" gets one sentence and a lesson link). A plain question ("How should I split my paycheck?") gets "Offline, I can only explain basic terms, but this lesson covers your question" and a lesson link. The promise of the "Create an account" button cannot be kept in a build without a key (I did not create an account to test it).
- **Where:** Ask, every screen; both sizes.
- **Why it hurts:** Ask is a headline button on every screen. A new person types a real question and gets a non-answer.
- **Screenshots:** `168-phone-ask-open.png`, `170-phone-ask-unknown-answer.png`, `299-laptop-ask-answer.png`
- **Fix size:** small to medium. For the build learners will use, set `ANTHROPIC_API_KEY` on the host; for the offline fallback, say plainly what it can do and show example terms to tap. I could not judge the real tutor.

### 8. The Ask sheet breaks on a phone after a couple of messages
- **Saw:** after two questions the sheet had scrolled: the "Tutor" title and the close (X) were off screen, the Simple/Expert row overlapped the top edge, the last answer was cut off by the input bar, and the input had a thick red focus ring.
- **Where:** Ask, phone size. May be worsened by the headless browser; needs a real phone.
- **Why it hurts:** if you cannot see how to close it, you feel trapped; the answer you asked for is half hidden.
- **Screenshots:** `170-phone-ask-unknown-answer.png` (compare with `168-phone-ask-open.png`)
- **Fix size:** small to medium. Keep the title bar fixed, scroll only the message list, keep the newest answer in view.

### 9. Settings opens on a sign-up form, and language and country are 1,588 px down
- **Saw:** on the phone, Me → Settings starts with an Account form (email, password, nickname, age, "Create a free account"), then Profile (nickname again), then Learning (daily goal and a long list of reminder times), and only then Language at 1,588 px on a 2,760 px page. Language, country and currency are three rows of unlabelled buttons with a jargon note ("401(k) or AFORE, FDIC or IPAB..."). On the laptop there is a side menu (good), but it still opens on Account.
- **Where:** Settings; phone (worst) and laptop.
- **Why it hurts:** for a bilingual, two-country audience, language and country are the main setting and they are the hardest to find. The first thing a curious person sees is "make an account".
- **Screenshots:** `173-phone-settings.png`, `174-phone-settings-full.png`, `175-phone-settings-language.png`, `301-laptop-settings.png`, `303-laptop-settings-both.png`
- **Fix size:** small. Open Settings on Language (or put it first); move Account to the bottom; label each row ("Language", "Country", "Currency"); shorten the note.

### 10. Lesson cards are text on a mostly empty screen
- **Saw:** a teaching card such as "Save first, spend the rest" is a title and four lines at the top of a 844 px screen, then about 1,000 px of blank, then Continue at the very bottom. There is no picture, number picture or example on the cards I saw in three lessons. On the laptop the lesson is a ~600 px column in the middle of a blank page with Continue ~500 px below the text.
- **Where:** all lessons; phone and laptop.
- **Why it hurts:** this is the "boring" part. The learner's eye has nowhere to go, and the next-step button is far from where they finish reading.
- **Screenshots:** `006-phone-after-goal.png`, `009-phone-lesson1-s00.png`, `190-laptop-after-goal.png`
- **Fix size:** medium to large. One small picture or worked number per card; on large screens put Continue under the text; keep it pinned on phones. This overlaps with the planned art work, so decide it together.

### 11. Lesson 3 asks you to "Make your first goal" again
- **Saw:** after lesson 1 created a goal, lesson 3 (Needs vs. wants) ends with "Make your first goal: something you want, how much it costs, and when." and then "You already have a goal. Check its plan, or add another." with a big "This plan looks right" button and the greyed "Try it above to continue".
- **Where:** end of lesson 3, both sizes.
- **Why it hurts:** a repeated task feels like the app forgot you, and the "first" in the title is wrong.
- **Screenshots:** `109-phone-lesson3-s11.png`
- **Fix size:** small. Vary the tool, or finish the step on its own when a goal already exists.

### 12. Today repeats itself, its main card changes identity, and the page is very long
- **Saw:** the same next lesson appears three times (hero card "Start", the unit card "Continue", the lesson list at the bottom). After lesson 1 the hero card turns into a generic boat picture and "Best next step: Set aside any amount toward your goal / See the mission" (not a lesson); after lesson 3 it is "Review". Today is 1,900 px tall on the phone and **6,100 px on the laptop**, because the whole 18-unit sea chart is drawn, faded, under the main content.
- **Where:** Learn/Today; phone and laptop. (Note for the planned tracks and sea chart rebuild.)
- **Why it hurts:** the "one thing to do now" is clear on first view but then changes with no explanation, and the page feels endless.
- **Screenshots:** `007-phone-today-top.png`, `008-phone-today-full.png`, `070-phone-today-after-lesson1.png`, `256-laptop-today-full.png`
- **Fix size:** medium. Decide the single "best next step" rules and show them in one line; keep one entry for each thing.

### 13. Scores and words that are not explained
- **Saw:** a four-point star with a number at the top right is the streak (nothing says so; a screen reader says "Streak: 1 days"); the same star is on the "1-day streak" tile. "Freezes 1/2" is unexplained. "Today: 55 / 20 XP" shows 100%; the complete screen says "30 of 20 XP today". "Level 2 · 5/100". In Your Money Year "Peace of mind 60" and "Credit health 45" have no key or explanation.
- **Where:** header, Me, lesson complete, Money Year; phone and laptop.
- **Why it hurts:** numbers that look like a game score but have no meaning make the app feel more complicated than it is.
- **Screenshots:** `007-phone-today-top.png`, `044-phone-lesson1-end-s06.png`, `171-phone-me.png`, `154-phone-year-start.png`
- **Fix size:** small. Use a flame or a "day streak" label; explain "freeze" in one line; stop showing "30 of 20".

### 14. Spanish and Mexico slips
- **Saw:** the goal created in a lesson is called "Savings goal" and stays in English inside the Spanish app ("Aprendes para: Savings goal"). "Faltan 1 año" should be "Falta 1 año". "Month 1 Of 12" capitalises "Of". The Spanish weekday is capitalised ("Miércoles"). In the Both setting, lessons show a bare "$" for both pesos and dollars ("$5 tres veces por semana"). A goal made in US dollars stays "$0 USD" after switching to Mexico, with a "≈" conversion line (fine, but unexplained).
- **Where:** Spanish, Mexico and Both settings.
- **Why it hurts:** one English leftover in a Spanish screen breaks trust; a bare "$" is ambiguous for people who handle both currencies.
- **Screenshots:** `178-phone-es-mx-today.png`, `179-phone-es-mx-goals.png`, `154-phone-year-start.png`, `306-laptop-es-both-today.png`, `309-laptop-es-lesson-s01-answered.png`
- **Fix size:** small. Store the default goal name as a key, not as text; check plural forms and capitalisation; show MXN/USD in Both mode.

### 15. The welcome screen's language and country chips
- **Saw:** the choices wrap into two uneven rows ("English | Español | USD" then "MXN | Both"); the picked one gets a red box; on a phone the country shows only as "USD"/"MXN", and "Both" has no explanation. The chips use country flag emoji. The hero picture is cut off (the boat and sun are cropped at the top) and there is a ~300 px gap between the tagline and the buttons.
- **Where:** welcome; phone mostly.
- **Why it hurts:** the first screen asks two questions in a form that reads as one muddle, and the flags break the "no emoji" rule.
- **Screenshots:** `001-phone-welcome.png`, `181-phone-es-welcome.png`, `186-laptop-welcome.png`
- **Fix size:** small. Two labelled groups (Language, Country); say what "Both" is; use drawn flags or words; fit the picture.

### 16. The budget planner's bar shows no split
- **Saw:** the 50/30/20 bar in lesson 2 is one solid navy block; its three parts are the same colour (I read the colours from the page: all `rgb(27, 53, 96)`).
- **Where:** budget planner tool; phone and laptop.
- **Why it hurts:** the whole point of the tool is to see the split.
- **Screenshots:** `066-phone-lesson2-s11.png`, `243-laptop-lesson2-action.png`
- **Fix size:** small. Three tones, with labels.

### 17. Some buttons are small to tap
- **Saw:** "Ask" in the lesson header (74 × 36), "Continue: Pay yourself first" on the unit card (156 × 36), "Lesson: Fees to watch" (190 × 36), "Leave and finish later" (182 × 36), header "Ask" (79 × 38), "Show 14 more units" (183 × 40). Almost everything else I measured is 43 to 44 px or more.
- **Where:** phone.
- **Why it hurts:** passes the automated accessibility check, but is below the 44 px guidance for thumbs. The unit-card Continue is the main route into a lesson.
- **Screenshots:** `007-phone-today-top.png`, `028-phone-lesson1-s11.png`, `154-phone-year-start.png`
- **Fix size:** small.

### 18. Practice tab contradicts itself
- **Saw:** "Tools from your lessons · New · 7 of 7 open" sits above the note "New tools show up here as you finish the lessons that use them", after three lessons. "Practice portfolio: Opens with the lesson 'Your first safe investment'" names a lesson the learner cannot yet find. "News, explained: Opens after 5 lessons."
- **Where:** Practice, phone and laptop.
- **Why it hurts:** a note that contradicts the number next to it reads as a bug; locked rows with no way to get there feel like dead ends.
- **Screenshots:** `151-phone-practice-full.png`, `289-laptop-practice.png`
- **Fix size:** small. Fix the copy; show "3 of 5 lessons" progress on locked rows.

### 19. Your Money Year: small stumbles
- **Saw:** after you choose, the month's title and "Month X Of 12" are replaced by a one-line result; the third choice sits under the tab bar on first view; the page scrolls under a solid header so text is cut at the top edge; "about ten minutes" is a claim I did not time (about 23 taps for the year).
- **Where:** Money Year; phone mostly.
- **Why it hurts:** minor on its own, but this is the best screen and these small things lower it.
- **Screenshots:** `154-phone-year-start.png`, `155-phone-year-after-choice.png`, `160-phone-year-i20.png`, `293-laptop-year-i11.png`
- **Fix size:** small.

### 20. Laptop layout details
- **Saw:** the lesson-complete picture is a hard-edged 640 px box floating in the page; on Practice the "This week's mission" and "hidden cost" cards touch with no gap; Settings opens on Account (item 9); the lesson column is narrow with small text (item 10).
- **Where:** laptop.
- **Why it hurts:** looks unfinished.
- **Screenshots:** `221-laptop-lesson1-end-s04.png`, `289-laptop-practice.png`
- **Fix size:** small.

### 21. The review is long for what it promises
- **Saw:** "Review: 3 ideas to refresh · 2 min" took 16 steps in my run, including a teaching card inside the review and retries of what I got wrong. Because I answered most things wrong on purpose, a real review should be shorter; I cannot confirm.
- **Where:** review; phone and laptop.
- **Why it hurts:** a "2 min" promise that runs long loses trust.
- **Screenshots:** `118-phone-review-s00.png` to `146-phone-review-s15.png`
- **Fix size:** small. Measure real reviews, drop the cards from reviews, or change the label.

### 22. Lessons do not show how many steps there are
- The progress bar has a small boat but no "4 of 12". People do not know how much is left. Screenshots: `012-phone-lesson1-s02-answered.png`. Size: small.

### 23. A locked unit gives no message
- Tapping "Unit 2 · Saving · after Unit 1" showed nothing; the page only scrolled. A lock that cannot explain itself feels like a mistake. Screenshot: `185-phone-tap-locked-unit.png`. Size: small.

### 24. The first lesson-complete screen is cluttered
- The "Achievement: First lesson" line is plain text with no look of its own, and the boat picture overlaps the word "streak" in "1-day streak" on the phone. Screenshot: `044-phone-lesson1-end-s06.png`. Size: small.

### 25. Wrong answers always repeat
- Every miss comes back at the end ("You'll see this one again at the end"). Good for learning, but in the budgeting lesson I missed four questions on purpose and then had to answer all four again. Not a bug; worth a cap if people drop out at that point. Screenshots: `013-phone-lesson1-s02-feedback.png`, `032-phone-lesson1-end-s00.png`. Size: small.

### 26. Real-life missions open on a long list
- Good content, but the first view is "This week's mission" and then a list of 32; there is no filter by size or time. Screenshot: `327-laptop-missions.png`. Size: small.

### 27. Skills sheet is a wall of "New"
- On day one nearly every row in the Skills sheet says "New", which says nothing. Screenshot: `329-laptop-skills.png`. Size: small.

### 28. There is no way to tell which build you are looking at
- No version or commit appears in the app (Settings → About has none). This is how a stale preview goes unnoticed. Size: small (show a build tag in Settings → About).

### 29. The preview configuration points at the wrong port
- `.claude/launch.json` waits on port 3000, but the server defaults to 8950 unless `PORT` is set. Development only; it can make a preview look broken or stale. Size: small.

### 30. The preview tool cannot read the project folder
- macOS privacy blocks the preview helper from `~/Downloads`. A permission setting for the Claude app, or moving the project (e.g. to `~/Developer`), fixes it. Not an app problem; it is why I started the server from a shell. Size: small.

### 31. Streak wording in Spanish and English
- The streak label reads "Streak: 1 days" and "Racha: 1 días" (should be "1 day"/"1 día"). Screenshot: `178-phone-es-mx-today.png`. Size: small.

### 32. Flag emoji (see 15)
- Counted under item 15; listed here because the owner's rule is "no emoji".

---

## 5. How I would sequence the fixes

1. **Things everyone hits in the first lesson** (1, 2, 3, 4, 11): the end of the lesson, the goal, the hands-on step, the red outlines. This is where someone decides to stay.
2. **Things that make people leave the app by accident** (5, 6, 7, 8): Back button, interruptions, the tutor.
3. **Findability** (9, 12, 13, 15): Settings, Today, scores, welcome.
4. **Polish and Spanish** (14, 16–21).
5. **Content and art** (10): decided together with the planned art and the Learn rebuild.

Nothing in this list needs a new feature. All of it is changing what is already there.
