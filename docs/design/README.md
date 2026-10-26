# Design: goals first, professional look

Before/after screenshots are in `before/` and `after/` (phone size, 375 wide). Open
`compare.html` to see them side by side. `after/dark-*` are the same screens in the
Dark look.

## What changed

- **Goals are the home screen.** The leading goal sits at the top: amount saved, target,
  time left, and an on track / behind / ahead status against its plan. Below it are the
  weekly check-in, the next lesson for that goal, other goals, and the calculators.
- **Onboarding sets the first goal.** It asks why you're here, then which goal, then how
  much and by when (prefilled per country), then minutes a day. After that you're in the
  lesson that helps that goal most.
- **A page per goal.** It has the plan in one sentence and a plan-vs-you chart. It compares
  the same monthly amount in cash, a savings account / CETES and an index fund. It also has
  milestones, linked practice investments, recorded savings, the lessons for the goal, and
  edit / pause / delete.
- **Lessons point at the goal.** After each lesson, a "For your goal" card shows the goal's
  progress and how the lesson helps it. "Next" is picked for the goal.
- **Calm moments.** Each milestone at 25/50/75/100% opens a sheet with the amount, four
  segments and the next milestone. There's no confetti, sound or bounce.
- **Look.**
  - Colour:
    - deep navy for structure and actions;
    - one green accent for progress only;
    - neutral grays;
    - amber only for "behind", red only for errors and losses.
  - All primary buttons are navy, including after a wrong answer.
  - Money uses tabular figures and larger weights.
  - Gold badges, gold rings and bright icons are gone. Achievements, the level and the
    league use the same quiet cards as everything else.
  - Motion is a 0.2 s fade with a 4 px lift. There's no shake, wobble or confetti.

## Decisions (made 2026-10-24)

1. **Looks are "Light" and "Dark".** They're still saved internally as `white` / `navy`, so
   existing settings carry over.
2. **Colour by status.**
   - Green means progress, "ahead" and "reached".
   - "On track" is neutral navy.
   - "Behind" is amber, never red.
   - Progress bars are always green.
3. **Milestones give achievements, not XP.** There are four achievements (25/50/75% of a
   goal, and "Goal reached"). Only milestones reached by saving count, not ones a starting
   amount already passed. Savings are self-reported, so XP comes only from learning.
4. **The main number is "Saved so far" (cash only).**
   - A separate line shows "With practice investments", with its own amount and %.
   - That part also shows as a lighter segment of the bar.
   - The plan, the status and the milestones use savings only.
5. **Past entries stay visible after an edit.** Editing re-plans from today and what's
   saved by then (`planFrom` / `planBase`); the entry list isn't touched.
6. **The weekly check-in is on Sunday.**
   - It opens on Sunday and stays until the next Sunday, or until answered.
   - It covers goals made before that Sunday.
   - It sums up the week ending that Sunday.
7. **The top bar shows only a small streak count.** XP lives on Me.
8. **Each goal keeps its own currency.**
   - In the other country, a goal shows its own currency plus "≈" the local amount at the
     USD/MXN rate, labelled "approx." when the rate is live, or "at a sample exchange rate"
     until Twelve Data is set up.
   - Linked holdings in another currency count at the converted value. With no rate at
     all, they aren't guessed.

Tests:
- 3: `test/engines.test.mjs`;
- 4, 5, 6 and 8: `test/goals.test.mjs`;
- the tutor seeing a goal's currency but never its name: `test/server.test.mjs`.
