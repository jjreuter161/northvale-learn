# Personal and school, one app: the plan (approved 25 November 2026)

One app with two ways in. The school version is the personal app plus a small teacher layer: the same lessons, the same Voyage, the same code. Nothing here is built yet. Mockups: `docs/design/school/` (phone and laptop, English and Spanish).

## 1. What exists today (classroom mode, Milestone 4 Phase 5)

It is built, tested (`test/classroom.test.mjs`, and a teacher-and-student walkthrough in `test/browser.test.mjs`) and switched off behind the `classroom` flag (`server/flags.js`; on per account from the admin page, or for everyone).

| Part | What it does | Where |
|---|---|---|
| Teacher rules | An account, 18+, email confirmed, teacher terms accepted; up to 20 classes | `server/classes.js` `readiness`, `create` |
| A class | A name, a 6-letter code (no 0/O or 1/I/L), a join link (`?join=CODE`), "Taking new students" on or off, a new code, archive (deleted 90 days later), delete | `server/classes.js`, `src/modules/classroom/Main.jsx` |
| Students | No account needed. A code, a nickname and an age band (13+); the device gets a member ID and a secret key; up to 200 per class; unique nicknames | `join` |
| What the device sends | Lessons finished since joining, answers per topic, missions finished, this week's XP, and (only if the student chooses) earlier lessons in assigned units | `src/modules/classroom/report.js` |
| What the teacher sees | A table of nicknames with lessons, units, missions and assignment progress; "Topics the class finds hard" (only with 3+ students) | `teacherView` |
| Extras | Assignments with due dates; a class leaderboard (weekly XP) with "hide me"; "count lessons I already finished"; a printable teacher guide | |
| Privacy | Never goals, amounts, portfolio, mission notes, tutor questions, age or email; no messages; students leave anytime and their class record is deleted | enforced on the server, tested |

What it looks like now: `docs/design/school/today-teacher-class.jpg` (the teacher's class page) and `today-student-join-1.jpg`, `today-student-join-2.jpg` (what a student reads before joining).

### Too complicated for what the pilot needs
- **The teacher page does six jobs:** code and link, "taking new students", a new code, assignments with due dates, a five-column table (lessons, units, missions, assignment, remove), and topic analytics, then archive. A teacher has to read all of it to find the one thing they want: who finished what.
- **The join screen is long:** 11 bullet points and 3 paragraphs before the nickname field, then an age question and an "earlier lessons" checkbox. A 13-year-old will scroll past all of it.
- **Data the simple version doesn't need:** answers per topic, missions, weekly XP and earlier lessons are collected for features the pilot won't use (topic analytics, missions column, leaderboard, assignments).
- **Getting to it:** teaching is three levels down (Me, Classes, then a setup checklist), with an "Email confirmed" label styled like a button.

### Missing
- **The choice at the start** ("I'm a student" / "I'm a teacher"). Today the welcome screen never mentions school.
- **A teacher sign-up in one place.** Today a teacher signs up in Settings, then finds Classes under Me, then confirms their email, then accepts the terms.
- **A list of which lessons each student finished.** Today the teacher sees counts, not which lessons.
- **Accounts and classes linked.** A class membership lives on the device (and in the account's synced copy only if the student happens to be signed in). Nothing on the account says "this account is in this class".
- **Pilot tools:** no before-and-after quiz, no end-of-pilot feedback, no pilot checklist.
- **Turning it on for chosen testers before they have an account:** the flag can only be set for an account that already exists.

## 2. The simplest version (reusing what's there)

### Step 2: the smallest teacher tool
1. **The choice at the start** (mockup 1). The first welcome screen asks "How will you use Northvale?": *I'm a student* or *I'm a teacher*, plus "Have a class code? Join a class". The student path is today's onboarding, unchanged. Saved as `profile.role`; changeable in Settings.
2. **One teacher setup screen** (mockup 2): email, password, "I'm 18 or older", "I agree to the teacher terms", and a box that says, plainly: free during the pilot, no ads ever, student data never sold or shared, students use nicknames. Then "check your email", then "Name your class". The server rules don't change (adult, confirmed email, terms); "I'm 18 or older" is recorded as the teacher's own statement, the same way the age band is today.
3. **The class page is one list** (mockups 3 and laptop 2): the code, "Copy link", and *Who finished which lessons*: each student's nickname with a dot per lesson (phone) or a tick per lesson under each unit (laptop). A unit appears once anyone in the class starts it. "Class settings" holds the rest: taking new students, a new code, end the class (archive), remove a student, delete.
4. **Hidden, not deleted:** assignments, topic analytics, the leaderboard and "hide me", the missions and units columns, "count earlier lessons". Their server code and tests stay, so they can come back after the pilot if teachers ask. The device stops sending what those features needed: **a report becomes just the lessons finished since joining.**
5. **A short join screen** (mockup 4): the code (with the class name shown once it's right), *Your teacher sees*: your nickname and which lessons you finish from now on; *Never*: goals, amounts or notes, what you ask the tutor, your age or email; "No messages. Leave anytime; your progress stays yours." Then the nickname. The age band is asked only if the app doesn't already know it (the 13+ rule stays on the server).
6. **For the student, afterwards** (mockup 5): a small "Your class" card on Today and under Me, with "What your teacher sees" and "Leave class".

### Step 3: foundations
- **Every account can belong to classes.** The server keeps, on the account, which classes it is in (`user.classes`: the class and member IDs; the key stays hashed). A signed-in student who joins on a school computer is in the class on their phone at home too. Teachers are ordinary accounts with `role: "teacher"` and can do the lessons as well.
- **Progress belongs to the student, never to the class.** It stays where it is today (the device, and the account when signed in). Leaving a class, being removed, or the class ending deletes only the class's record. A test will prove a student who leaves keeps every lesson, XP and streak.
- **Students without an account still work** (no friction on day one at school), but only on that device. The "Use Northvale at home too" card (mockup 5) offers a free account: under 18 a parent or guardian says OK first (today's rule).
- **No payments.** Nothing to build: schools are free during the pilot, personal plans stay on hold, and the teacher screens say "Free during the pilot".

### Step 4: pilot tools
- **A before quiz and an after quiz:** the teacher picks the units for the pilot (one setting, up to 4 units). The app builds one fixed set of 10 questions from those units' existing questions, in English and Spanish, and uses the same 10 before and after so the change is real. A student sees a "Class quiz: 10 questions, about 5 minutes" card when the teacher opens it, and their own score at the end. **The teacher sees totals only:** how many took it, the class average before and after, and the share right per question. Nothing shows until 3 or more students have taken it, and there are no per-student scores.
- **End-of-pilot feedback:** after the after-quiz, students get 4 short questions (enjoyed it, learned something, what was confusing, would keep using it). The teacher sees the totals; anything typed goes to the owner only, not the teacher, since students may write something personal.
- **`docs/PILOT-PLAN.md`:** a checklist for a 2–4 week free pilot with one class. It covers what the teacher and school agree to, a note for parents (English and Spanish), the timeline, how to run the quizzes, and what proof to collect: quiz totals, student feedback, and a teacher quote with permission.
- **The compliance update:** see decision 2 below.

### Step 5: on for testing only
- **Classroom mode stays off for everyone.** The owner turns it on per email from the admin page, now also for an email before its account exists (it applies when that account is made).
- **The choice at the start shows only for testers:** a tester link (`?school=on`, remembered on that device) or the flag being on for everyone. Students joining with a real code don't need either: a class works only while its teacher has the flag (today's rule).
- **Tests:** the choice, teacher setup, creating a class, joining with a code, the teacher's list (and, as today, that none of the private data is on the screen or in what the server sends), progress carried between a school device and a home device, leaving keeps progress, and the quizzes (totals only, nothing under 3 students). Plus screenshots, the full test run, a commit and a push.

### How it is built
Each step is one commit on `main`, with the full test run passing. Everything stays behind the flag and the tester link, so `main` stays the version testers see. `design/redesign` will need `main` merged in before the redesign continues.

Rough size: Step 2 is the biggest (the choice, the teacher setup, the new list, the short join screen, hiding the extras). Steps 3 and 4 are medium. Step 5 is mostly tests.

## 3. Decisions for the owner

1. **The labels.** "I'm a student" fits a 15-year-old in a class, but not a 22-year-old using the app on their own. Keep "I'm a student / I'm a teacher" as written, or use "I'm learning / I'm teaching"? The mockups use your wording.
2. **Where the compliance notes go.** `docs/COMPLIANCE.md` was taken out of the repository on 12 November ("move compliance, competitor and plan notes out of the public repo"), and **the GitHub repository is public**. A school and student privacy section shouldn't go back into public view. Options: (a) a private file outside the repository (for example `~/Projects/northvale-private/COMPLIANCE.md`, never pushed), or (b) make the GitHub repository private (your setting on GitHub) and put it back in `docs/`. The old file's text is still in the public git history either way.
3. **Students without an account.** Recommended: allowed, as today; progress stays on that device until they make an account. The alternative, requiring an account to join, means progress always follows them, but every student under 18 needs a parent's OK before the first lesson in class.
4. **Hide or delete the extras** (assignments, topic analytics, leaderboard). Recommended: hide them, and stop collecting their data now; delete the code after the pilot if no teacher asks for them.
5. **Who sees typed feedback.** Recommended: the owner only; the teacher sees totals.

**Decided (25 November 2026, as recommended):** 1. keep "I'm a student / I'm a teacher"; 2. the compliance notes stay private, outside the repository (`~/Projects/northvale-private/COMPLIANCE.md`); 3. students can join without an account; 4. hide the extras and stop collecting their data; 5. typed feedback reaches the owner only.

**One change while building:** the teacher setup asks for an age band ("18–25" or "26 or older") instead of a box "I'm 18 or older": the server needs a band for every account, and both bands are adults.
