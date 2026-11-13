# The ease audit: before and after

Done as a brand-new person on a phone. Tests: the 60-second test in `test/browser.test.mjs` counts the taps from opening the app to the first answered question.

| Task | Before | After |
|---|---|---|
| Open the app, answer the first question | **7 taps**: Get started, a goal, "From the beginning", Continue on two lesson cards, pick, Check | **3 taps**: Get started, pick, Check (a warm-up question, no account, no sign-up) |
| Get to the first lesson | 3 taps, then 2 cards | 5 taps in all: warm-up (3), Continue, a goal. The lesson opens by itself |
| What Today shows on day 1 | the lesson, the reason was the unit's description | the lesson, with one line on why it's the next step ("Your first lesson. It takes about 4 minutes.") |
| After today's lesson | the same lesson card again | the best next step for today (a review when enough ideas are due, this week's mission, Your Money Year), with the reason |
| Skip what you already know | only at the very start | offered on the finish screen after three perfect lessons in a row (at most once every two weeks) |
| A tricky lesson | nothing | the finish screen offers a quick review first |
| Change the colors | Me, Settings, Look (3 taps) | Me, Settings, Colors (3 taps, same), a ready-made look or your own colors |
| Settings length | 9 sections on one long screen | 5 sections; sound, privacy, legal and your data are under **More** |

## What changed
- **Warm-up first.** The very first screen after "Get started" is one real question. The "how do you want to start?" screen is gone from first run; the 2-minute "skip what you know" check is offered later, when it's earned.
- **Settings are short.** Rare settings are tucked under "More" (still two taps away, and the Privacy and Legal pages are still there).
- **Plain words.** "Look" became "Colors"; the picker explains why a color isn't offered ("Can't be read on this background").
- **One main action per screen.** Today shows one best next step, with the rest as small rows (at most two).
- **Selection is obvious.** Whatever you chose is outlined in the main button's color, thick, with a check, in every look.

## What stayed the same (on purpose)
- **An account is still never required to start.** It's offered once, after the first lesson, with one reason ("Save your progress on every device"); sign-up asks for an email, a password, an age, and (13–17) a parent's OK. The nickname is optional.

## Not done
- A full screen-by-screen read for jargon (it was done for the screens changed in this pass).
