# Clarity rebuild — Step 2 (done)

The app was rebuilt to the approved plan (`PLAN.md`) with your six decisions. The pictures are in `before/` (the app at commit 65d538b) and `after/` (now), taken of the same moments on a phone screen. `capture-before.mjs` and `capture-after.mjs` retake them.

## What changed

| | Before | After |
|---|---|---|
| Getting around | ☰ side menu, 8 places | 4 tabs that never change shape: Learn, Goals, Practice, Me. **Ask** at the top right of every tab and in the lesson bar |
| Opening screen | Home: goal card, next lesson, mission, calculators | **Today**, at the top of Learn: the next lesson as the one big button, why it matters, "Building toward: Car", then small rows (review, streak, mission, check-in) |
| The course | all 59 lessons listed, Review/Challenge on each | finished units fold to one row; the current unit is open with one Start button; later units fold; "8 more units" |
| First run | 5 screens (reason, goal, amount, placement, daily time) | 3 screens: welcome → "What do you want to learn money skills for?" → "How do you want to start?" (with "why these lessons") |
| Goal amount | asked in onboarding | asked after the first lesson, optional ("Make a plan" / "Not now") |
| Practice | spread across Home and the menu | one tab, there from day one; a locked preview ("Opens after 3 lessons: practice investing with $10,000 of pretend money…") until 3 lessons, then a one-time introduction. Inside: missions, the portfolio (with "Your first safe investment"), Tools from your lessons (each after its lesson) and News (after 5 lessons), with "New" tags |
| Me | everything in one long page | progress, this week, the league (after 3 learning days), then rows: Achievements, Skills (with review any time), Invite a friend (after 3 days), Classes, Settings, Send feedback, Privacy & terms |
| Tutor offline | "needs a free account…" after you ask; exact word matches only | says so before you ask ("offline mode, so it can only explain basic terms"); matches other wording, plurals, accents and word order in both languages; links the related lesson |
| Look | navy cards and borders, green progress | white and light grey, one card style, navy only for the main button, progress, the active tab and links; green only for a correct answer; navy streak flame; charcoal dark mode with light-navy accents; sentence-case labels |

**Nobody loses anything.** Saved progress doesn't change shape; the only new fields are `profile.goalFor` (what onboarding picked) and `profile.seenIntros` (which introductions were seen). Anything a learner already used stays open whatever the schedule says: Practice for anyone with a mission, a trade, a calculator or a news read; the portfolio for anyone who traded; all calculators for anyone who used one; the league for anyone in a class or with friends; invites for anyone with a link. Lessons finished before the lesson counter existed count too. Tests cover these cases.

## First five minutes, on a phone screen (390 × 844)

**English (US) and Spanish (Mexico), a brand-new learner:**
1. **Welcome.** "Learn money by doing." / "Aprende de dinero haciendo." Get started, or I already have an account; language and country at the bottom; the educational-only line.
2. **What for.** Six goals plus "Just understanding money". Tapping one goes straight on.
3. **How to start.** "From the beginning: Budgeting, lesson 1: What's a budget?", or the 2-minute check. "Why these lessons: for your goal (Car), these come first: Budgeting, Saving, Your first paycheck, Debt & credit, and Insurance basics."
4. **The first lesson** opens: **3 taps** from the welcome screen (it was 5). The lesson bar has Ask; cards have "Ask about this".
5. **Lesson complete:** XP and streak, the one-line why, "Building toward: Car", the free-account offer, then **Next: Needs vs. wants** as the main button and Done.
6. **Today:** the next lesson ("Lesson 2 of 3 · 3 min") with Continue, a review row if something was missed, the streak row, and one question: "Make a plan for your goal?" (optional). After that comes the age question, then the reminder offer on a later day.
7. **Practice tab:** the locked preview with "1 of 3 lessons" and Continue learning.

Found and fixed during the pass: "For Car, these come first" now reads "For your goal (Car)…"; the Spanish welcome line said "dinero de mentira" where the rest of the app says "dinero de práctica"; the question label and a few others were still ALL CAPS.

## Three fixes found by the final checks

1. **The tab bar could cover a control.** When the page scrolled to something near the bottom (a keyboard user tabbing, or a tap right after scrolling), it could land under the fixed tab bar, so a tap hit the bar instead. The page now keeps a clear zone under the header and above the tab bar whenever anything scrolls into view. A test focuses every control on Learn, Goals, Me and Settings and checks each one sits fully between the two.
2. **The lesson-3 survey could be lost.** It was a one-off 1.8-second timer after the third lesson; closing or reloading the app in that moment meant it never showed (until a later lesson). It's now worked out from saved progress: it waits until no lesson or other window is open, and if the app closes first, it shows the next time the app opens. Answered (or dismissed), it never comes back. People who passed lesson 3 without seeing it will now see it once. Tests cover both cases, and that the answer is sent.
3. **Closing the app right after doing something could lose it.** The app saved to the device 0.3 seconds after each change, so a lesson finished (or a survey answered) just before closing the app could be lost. It now also saves the moment the app is closed or sent to the background. The survey test found this.

## Tests

- `npm test`: 98 checks, all passing (90 before).
- New browser checks:
  - 3-screen onboarding to the first lesson;
  - one tap from Today to the first lesson;
  - the optional goal plan after lesson 1;
  - Practice locked and then open after 3 lessons, with its introduction;
  - tools locked until their lesson;
  - a returning learner keeps the portfolio, News and all 7 calculators;
  - the offline Ask banner, different-wording matches and the lesson link;
  - the league and invites after 3 learning days;
  - every screen in English and Spanish;
  - the survey's missed moment and its answer;
  - nothing hidden under the tab bar.
- A flaky landing-page check (it moved past each picture after 50 ms, so the new fifth picture sometimes hadn't loaded) now waits for each one.
- The AI safety check (`scripts/tutor-check.mjs`) now has 20 cases: everyday words, follow-ups that need the previous turn (English and Spanish), "which crypto should I buy", an essay request, a harmful request, money stress, Expert depth, a lesson card, CETES. **It hasn't been run**, because it costs money (about 2¢); run it with your OK once the key is in `.env`.

## Decisions I made (easy to change)

- **Lesson links are chosen by the app, not the AI.** The app matches the question to a lesson, so the link shows with or without the AI, costs nothing extra, and can only ever be a real lesson. The plan said the server would give the AI the lesson list; that can come later if the app's matching isn't good enough.
- **"Building toward"** uses the goal's own name if there is one, else what onboarding picked ("Car").
- **Review any time** moved to Me → Skills; Today shows the review row only when ideas are due.
- **Dark mode** is still a choice in Settings (as before), not automatic.
