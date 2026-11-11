# Milestone 4.5 — "Fun, but professional": Step 1 plan (for approval; nothing is built yet)

The mockups are in this folder: `0-all-screens.png` shows them all, and `mockups.html` is their source (`node docs/design/fun/mockups.mjs` remakes them). They're quick prototypes in the approved clarity look, not the app.

**The one-line idea:** the fun comes from variety, feeling progress, and a voice that's a good teacher with a sense of humor. It doesn't come from decoration. No mascot, no confetti, no cartoons; white, grey and navy; the 4 tabs and Today's one main button stay exactly as they are.

---

## Step 2 — More kinds of questions (the biggest upgrade)

Six new types, all **tap-based** (no drag and drop anywhere: it's fiddly on phones and hard with a screen reader or keyboard). Every type works with the mastery engine the same way: the first try at each question counts for its concept, right or not.

| Type | Mockup | How it works | Counts as right when |
|---|---|---|---|
| **Put in order** | 1 | Tap the items in order; each gets a number. Tap again to undo. Feedback shows the correct order with one line on each step. | the whole order is right |
| **Estimate** | 2 | A slider (plus a number box, for keyboards and screen readers) for a guess, then the reveal: a small chart of money put in vs. what it grew to, with the guess marked. Answers come from `facts.js` rates, so they never drift. | within 15% ("Close"), because the point is the intuition, not the decimal |
| **Match pairs** | 3 | Tap a word, then its meaning. Right pairs lock in; a wrong pair just un-selects. 3–4 pairs, so it fits a phone. | all pairs on the first try |
| **Work it out** (fill in the number) | 4 | A number box with the $ / % already there. The answer is explained step by step. Simple math only (percent of a paycheck, a monthly amount, interest for a year). | within rounding |
| **Spot the problem** | 5, 15 | A realistic text, email, offer or receipt, with tappable parts. "Tap the 2 biggest red flags." Made-up names only ("YourBank", "TuBanco"), never a real company. | all red flags found |
| **Real-life choice** | 6 | A short situation and 2–3 *reasonable* options. Every option gets its trade-off explained. | a "good fit" or "reasonable" option; only a poor fit is a miss |

**Accessibility:** every type works by keyboard and screen reader (buttons and radio groups, the order and match states spoken: "Savings account, position 1"). Right and wrong are never shown by color alone (an icon and a word too). Green still means only "right".

**Content:** today a lesson has about 2 questions, all multiple choice or true/false. "At least 3 types in every lesson" needs a third question, so:
- each of the 59 lessons gets one new question of a new type;
- about a third of the existing 118 questions convert where a new type fits better ("which is riskiest" becomes Put in order; "how much is 20% of…" becomes Work it out);
- that's about 100 new or rewritten questions, each in English and Spanish with Mexico versions where they differ;
- lessons grow by about 20 seconds (3.2 → 3.6 minutes).
- New types also join reviews and challenges, so reviews stop feeling like reruns. Challenges especially suit Estimate and Work it out.

**The validator** checks each type's shape (order: 3–6 items; match: 3–4 pairs; estimate: the answer within the slider and a tolerance of 25% or less; spot: at least one flag, and no more asked for than there are; choice: 2–3 options, at least one "good fit", a reason on each), both languages, and at least 3 types per lesson.

---

## Step 3 — Moments that feel good

**The lesson finish (mockup 7; dark: 16).**
- The ring fills and the XP counts up, about 0.6 seconds.
- Under it: "15 of 20 XP today · 6-day streak".
- Then **one "In real life" line per lesson**, the thing to actually do. Example: "Next payday, move your savings first, before anything else gets a chance at it." That's 59 new lines; the unit's "why" line stays on Today.
- When an idea moves up a level, a quiet line: "Getting solid: Paying yourself first."
- Then Next and Done. With reduce motion: no animation at all, everything already in place.

**Full-screen moments (mockups 8–9).**
- Only for things that are actually rare: a **7, 30 and 100-day streak**, and **finishing a unit** (17 in all).
- One big navy number or the unit's icon, one sentence, Share and Continue.
- Shares use the existing share cards. These cards carry no names or amounts anyway, and the 13–17 rules don't change.
- At most one per session: if two happen at once, the second becomes a line on the finish screen.

**Pushback: mastering a concept shouldn't be full-screen.** There are 59 concepts. A full-screen moment for each would arrive every few days and stop meaning anything. It gets the quiet line on the finish screen instead, plus a mention in "Your money week".

**Sound and touch (mockup 10).**
- **Vibration:** a light tap on a right answer and on a finish. It's on by default where it works, and can be turned off.
- **Honest limit:** iPhones don't let web apps vibrate, so this works on Android only (until a native app).
- **Sound:** off by default. A soft two-note tone made in code (no audio files, nothing to license), quiet.

**Streak at risk (mockup 10).**
- A few calm, rotating lines in English and Spanish. Example: "Your 12-day streak is still on. One 3-minute lesson keeps it that way. It's not asking for much."
- Never "you'll lose it", never a countdown, never red.
- Same rules as now: the learner's chosen time, quiet hours, at most one a day.

**Reduce motion** is respected everywhere: the ring, the count-up, sheets and moments all appear instantly.

---

## Step 4 — A personality in the writing

A **Voice** section in `docs/CONTENT-STYLE.md`:
- confident, warm, a little witty; never childish, never sarcastic about money problems, never talking down to someone with little money;
- **a wit budget:** at most one light line per screen, and none at all on scams, debt, money stress or errors that cost the learner something;
- Spanish written natively (tú, neutral Mexican Spanish), not jokes translated word for word;
- lesson facts and explanations stay exactly as they are; only the tone of the small text changes.

**About 150 small texts** get rewritten in English and Spanish: buttons, empty screens, finish screens, reminders, errors and toasts. Examples:

| Where | Now | Proposed |
|---|---|---|
| Goals, no goal yet | "Set a goal. Pick what you're working toward…" | "No goal yet. Most people start with an emergency fund. It's the one that saves you from everything else." |
| Whole course finished | "You've finished every lesson. Review any of them…" | "You finished the whole course. That's more than most adults ever learn about money. Reviews keep it fresh." |
| Nothing to review | "All caught up. Next review Nov 14." | "Nothing to review. Your memory's in good shape until Nov 14." |
| Leaving a lesson | "Leave this lesson? You'll lose your progress in this lesson." | "Leave now? This lesson starts over next time. It's only 3 minutes." |
| No streak yet | "Do one lesson to start a streak." | "One lesson starts a streak. Three minutes is enough." |
| Couldn't connect | "Something went wrong. Try again." | "That didn't go through. Check your connection and try again. Nothing you did was lost." |

---

## Step 5 — Small daily hooks

**"Money Myth or Fact" on Today (mockups 11, 12).**
- A card under Today's rows: one statement, two plain buttons (Myth, Fact), then a two-sentence answer.
- It's +2 XP toward the daily goal. It doesn't count toward the streak (only lessons do, as now).
- After answering, it shrinks to one line ("Today's myth: answered · another tomorrow"), so Today stays calm.
- **Not on day 1:** the first day is just the first lesson.
- **60+ statements,** English and Spanish, with US and Mexico versions (FICO vs. Buró de Crédito, 401(k) vs. AFORE). Every number goes in `facts.js` and on your to-verify list. Built in, so it works offline.
- The buttons are outlined, not navy, so the lesson stays the one main button.

**"Your money week" (mockup 13).** On Sundays, the check-in row on Today becomes "Your money week", which opens a short, clean summary:
- what you learned, an idea that's now solid, the streak, and the goal's progress;
- one suggestion for next week, from the course itself;
- then the usual "Did you set anything aside?";
- worked out on the device; nothing new is sent anywhere;
- no share button, because it has amounts in it.

**"The real cost" (mockup 14), with a pushback.**
- **The pushback:** "skip the coffee" is the most-mocked money advice there is, and it's weak advice for people with little money. The bigger leaks are interest, fees and forgotten subscriptions.
- **Two kinds, alternating weekly:**
  1. **Everyday choices.** Pick coffee, a snack, a ride, or your own thing and price. It shows the yearly cost and what it could grow to at an example rate, and always ends with "If it's the best part of your day, it may well be worth it. The point is choosing on purpose."
  2. **Hidden costs:** a card balance paid at $25 a month, a monthly account fee, a payday loan, a buy-now-pay-later late fee. Each links to its lesson.
- **Where:** a card at the top of **Practice**, not on Today (Today already has its daily card).
- **Spanish and Mexico versions:** "un café de $50", "comisión por manejo de cuenta", the CAT.

---

## Better ideas (suggested)

1. **One daily card on Today, never two.** Most days it's Myth or Fact; on Sundays it's Your money week. Today keeps one main button, a few rows, and at most one extra card.
2. **New question types in reviews and challenges too,** not only lessons. That's what keeps day 30 feeling different from day 3.
3. **No hearts, lives or timers.** Losing a life for a wrong answer makes anxious learners stop guessing, and guessing is how they learn. Mistakes stay free, as now.

---

## Decisions for you

1. **Mastering a concept:** a quiet line on the finish screen (recommended), or a full-screen moment?
2. **Vibration:** on by default where phones allow it (recommended), or off?
3. **Myth or Fact:** +2 XP toward the daily goal but not the streak (recommended), or does it also keep the streak?
4. **The real cost:** in Practice, alternating everyday choices with hidden costs (recommended), or on Today as asked?
5. **A third question per lesson** (about 20 more seconds) so every lesson has 3 types (recommended)? The alternative is keeping 2 questions, which can't meet "3 types".
6. **Real-life choice:** reasonable options count as right for mastery (recommended)?
7. **When:** the advisor's order is 4.5 before launch. It's sizable:
   - Step 2 alone (about 100 bilingual questions, 6 new question types and their tests) is about as big as the clarity rebuild.
   - Step 5's 60 myths are a lot of writing and fact-checking.
   - A middle path: launch to testers now and build 4.5 during their first week. Step 2 doesn't change saved data, and testers could then react to it.
   - The advisor said that if you have to choose, choose launching.

## When Step 1 is approved

Steps 2 to 5 in order, committing after each. Then browser tests for each new type and feature in both languages, the first-five-minutes check again, `npm run preflight` three times in a row, before-and-after screenshots, a short recording of the finish moment, and the decisions that come up along the way.
