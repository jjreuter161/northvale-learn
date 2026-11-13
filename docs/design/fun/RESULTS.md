# Milestone 4.5 "Fun, but professional": results

On the `milestone-4.5` branch only. Not merged into main and not deployed. Per the plan, what gets merged is decided after testers' first week.

**Pictures:**
- `before-after.png`: main today compared with this branch.
- `after/`: the real app at phone size. It shows a new learner's first five minutes in English/US (`01`–`04`) and Spanish/Mexico (`es-01`–`es-04`), day two (`10`–`13`), and a 7-day streak (`20`).
- `after/finish.webm`: about 2 seconds of the finish screen, with the ring filling and the XP counting up.
- The approved mockups from Step 1 are still in this folder (`1-order.png` … `16-finish-dark.png`).

To redo the pictures: `npm run build && node docs/design/fun/capture.mjs`.

## What was built

**Step 2, more kinds of question.**
- Six new kinds, all in both languages: put in order, estimate on a slider with a growth chart, match pairs, type the number, spot the red flags (in a text message, email, offer or receipt), and real-life choice.
- The course now has 177 questions. 97 of them are the new kinds: 28 number, 24 real-life choice, 17 match, 11 order, 9 spot and 8 estimate. The other 80 are multiple choice and true/false.
- 38 old questions were converted and 59 were added, one per lesson.
- Every lesson now has at least 3 kinds of question, plus an "In real life" line.
- The new kinds also show up in reviews and challenges.

**Lesson length.**
- Lessons now take 3.8 to 4.5 minutes, up from about 3. The cap is 4.5 minutes, and the content check enforces it.
- On this branch, the app and the landing pages now say "four-minute lessons" (or "about 4 minutes") instead of "three-minute". Main still says three, which is true there.

**Step 3, moments.**
- The finish screen: a ring that fills, an XP count-up, the "In real life" card, and a quiet line when a concept becomes solid or mastered.
- A full-screen moment for 7, 30 and 100-day streaks and for finishing a unit, at most one per session.
- Vibration is on by default where phones allow it. Sounds are off by default. Both have switches in Settings.

**Step 4, voice.**
- A short voice guide in `docs/CONTENT-STYLE.md`.
- 36 small strings were rewritten. The rest already fit.
- No jokes in content about scams, debt or money stress.

**Step 5, daily hooks.**
- **Myth or fact** on Today from day two: 66 myths, US and Mexico, +2 XP, then "another one tomorrow".
- **Your money week:** a short look back (lessons, what's now solid, the streak, the goal), then next week's lesson, then the check-in.
- **The real cost** in Practice. It alternates by week between small daily things and hidden costs.
- Streak reminders rotate between 4 calm lines in each language.

## Checked

- **The first five minutes, again, in English/US and Spanish/Mexico.** Welcome, then a goal, then "From the beginning", then a lesson with match and number questions, then the finish, then Today. I found no dead ends and nothing cut off, and the tests found no raw text keys, broken text or console errors. The things I fixed along the way:
  - "Three-minute lessons" was no longer true. It now says four, on the branch.
  - The money week showed "Car: $350 → $350" when nothing had changed. It now says "Car: $350 so far".
  - In Spanish, a far-off typed number said "Casi" ("almost") before the answer. The new question kinds and Myth or fact now say "No del todo" there. See decision 3.
- **Browser tests** cover every new question kind and feature, in both languages. 108 checks pass.
- **`npm run preflight` passed three times in a row** on this branch. The only items it lists are the ones already known for launch day: the `.env` keys and the legal placeholders.

## Decisions for you

1. **What to merge after testers' first week.** My recommendation is all of Milestone 4.5, unless testers say lessons feel long. If they do, the first fix is going back to 2 questions in the longest lessons.
2. **The finish recording.** `finish.webm` was made with Chrome's own recorder, so nothing was downloaded. A GIF needs ffmpeg, which is a download (`npx playwright install ffmpeg`, from Playwright's servers). Do you want that, or is the WebM enough? It plays in any browser.
3. **Spanish wording for a wrong answer.** The heading on every wrong answer says "Casi" ("almost"). That's misleading when the answer is far off. I changed it only in the new places. Should "No del todo" ("not quite") replace "Casi" everywhere, on main too? I recommend yes.
