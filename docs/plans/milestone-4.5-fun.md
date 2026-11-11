# Milestone 4.5 — "Fun, but professional" (queued)

**When to start:** only after the clarity rebuild (Step 2) is finished and committed. Received 2026-11-10 from the advisor; kept here so it isn't lost.

**The advisor's order from here:**
1. Finish the rebuild, then an honest answer: does the app make sense now?
2. Milestone 4.5 (this one).
3. Setup and launch: `docs/LAUNCH.md` with a parent or guardian, deploy, about 10 testers.
4. After a week of feedback, Milestone 5 (`milestone-5-signature-features.md`).

The advisor's note: "Steps 1 and 2 make the app better, but step 3 is the one that makes it succeed. If you ever have to choose, choose launching."

---

## The prompt, as received

Milestone 4.5: "Fun, but professional." Start this only after the clarity rebuild (Step 2) is finished and committed.

The goal: Northvale should feel satisfying and fun to open every day, like Duolingo, but with the style of a premium finance app. Think "a great teacher with a sense of humor," never cartoons, mascots, confetti, or childish wording. Everything must fit the approved clarity plan: the 4 tabs, Today's one main button, and the white, grey, and navy look. No new tabs or menus.

Stop after Step 1 for my approval. Commit after each step.

### Step 1: Fun plan and mockups (no building yet)
Propose exactly how each item below would look and feel, with mockups of the key moments. Push back on anything that would feel childish or cluttered, and suggest better ideas if you have them. Then stop.

### Step 2: More kinds of questions (the biggest upgrade)
Right now lessons only use multiple choice and true/false, which gets repetitive. Add new question types, all in English and Spanish, working with the mastery engine and accessibility rules:
- Put in order (e.g., order these from safest to riskiest, or the steps to build a budget)
- Slider estimate (e.g., "How much will $100 a month become in 10 years at 7%?" Then reveal the real answer with a quick chart)
- Match pairs (terms to meanings, or problems to solutions)
- Fill in the number (simple calculations with the right answer explained step by step)
- Spot the problem (a short realistic scenario, like a text message or an offer, where the learner taps what's wrong)
- Real-life choice (a short situation with 2–3 reasonable options, where the explanation shows the trade-offs of each)

Convert a good share of existing questions to the new types where they fit better, and use at least 3 different types in every lesson. Update the content validator for each type.

### Step 3: Moments that feel good
- A satisfying lesson finish: a smooth progress animation, the XP added up, and one line connecting what they learned to real life. Short, calm, and well-designed.
- Milestones worth noticing: streaks of 7, 30, and 100 days, finishing a unit, and mastering a concept each get a tasteful full-screen moment with a share option (using the existing share-card privacy rules).
- Light, optional haptic feedback on phones for correct answers and finishes, and an optional, subtle sound setting (off by default).
- Streak at risk: a calm, slightly witty reminder, never guilt-tripping.
- Respect the reduced-motion setting everywhere.

### Step 4: A personality in the writing
- Write a short voice guide in docs/CONTENT-STYLE.md: confident, warm, a little witty, never childish, never sarcastic about money problems, and respectful of people with little money.
- Rewrite the app's small text (buttons, empty screens, finish screens, reminders, errors) in that voice, in English and Spanish. Example: an empty goals screen could say "No goal yet. Most people start with an emergency fund. It's the one that saves you from everything else."
- Keep all lesson facts and explanations accurate; only the tone changes.

### Step 5: Small daily hooks that competitors don't have
- "Money Myth or Fact" on Today: one quick daily question about a common money myth (e.g., "Checking your credit score lowers it"), with a short explanation. Takes 15 seconds, counts toward the daily goal, and works offline. Write at least 60, in English and Spanish, with US and Mexico versions, and put facts in facts.js.
- "Your money week": an upgrade to the Sunday check-in that shows the week as a short, clean story: what you learned, a concept you mastered, your streak, and progress toward your goal, with one suggestion for next week.
- "The real cost": a short, recurring card that turns everyday prices into money lessons (e.g., "A $5 daily coffee is about $1,825 a year, or about $X after 10 years invested at an example 7%"). Educational only, never preachy; respect that people enjoy their coffee.

### When done
Browser tests for every new question type and feature, both languages, the first-5-minutes check again, npm run preflight passing three times in a row, before-and-after screenshots and a short screen recording or GIF of the finish moment if possible, decisions for me, and a commit.
