# Clarity plan — Step 1 (for approval; nothing is rebuilt yet)

**The goal:** open the app and know what to do next, like Duolingo, but grown-up. **Learning comes first; your goal is the reason you're learning**, not the first thing you see.

The mockups are in this folder: `0-all-screens.png` shows them all, and `mockups.html` is their source. They're quick prototypes with the app's real course content, not the app.

---

## 1. Confusion audit

I played through the app as a brand-new learner and as Dani, three weeks in, on a phone screen.

### Where it's unclear what to do, what something is, or why it matters

1. **Home leads with money, not learning.** The first thing on screen is "YOUR GOAL · Car · $950 of $5,000". It reads like a savings tracker. The next lesson comes second.
2. **Home has two main buttons and about six blocks competing:**
   - the goal card;
   - the next-lesson card with **Start**;
   - a big reminder form;
   - an age question;
   - this week's mission with a second navy **Start mission** button;
   - other goals, a "New goal" button, a grid of 7 calculators, and a disclaimer.

   Nothing says which one matters.
3. **The ☰ menu hides 8 places** (Home, Learn, Missions, Portfolio, News, Tutor, Me, Settings) plus feedback. A new learner doesn't know they exist or which to use.
4. **The header's icons have no words.** A flame with "0", and a speech bubble that is the tutor.
5. **The Learn screen is about 6,000 pixels long, with 75 buttons:**
   - every finished lesson repeats "Completed · review" and a **Challenge** button;
   - every locked lesson says "Finish the lesson before this one first";
   - it shows a "Continue learning" card *and* a separate Review card;
   - it can show **two "Start" lessons at once**: Dani has one in Scams and one in Taxes, because she did a later unit first.
6. **"Review 5 concepts"** appears on day 2 with no word on what a review is.
7. **Day-one clutter:**
   - the Portfolio is in the menu, though nothing can be bought until "Your first safe investment";
   - News, which needs a feed, can be an empty page;
   - all 31 Money Missions and all 7 calculators show before the first lesson that uses them.
8. **The tutor looks broken.** Without the AI key it quietly answers from a 54-word glossary and only says so *after* you ask. Different wording ("how do cards charge interest") gets nothing.
9. **Me is about 3,000 pixels long:**
   - level;
   - 3 stat tiles;
   - a week chart;
   - 17 skill rows;
   - the league;
   - an invite card;
   - 20 achievement tiles.
10. **Onboarding is 5 screens** before the first lesson (reason, goal, amount and date, placement, daily time), and it frames everything around a money target.
11. **After a lesson there are 4 cards** (goal amounts, a mission, an achievement, the account offer) and 2–3 buttons.
12. **Settings, legal and feedback** are reachable only through the menu.

### Every screen, card and button

Key: **E** = essential, **S** = useful but secondary, **H** = hide until later, merge or remove.

| Where | Element | Mark | In the new plan |
|---|---|---|---|
| Every screen | ☰ menu button | H | removed: bottom tab bar |
| | Screen title / wordmark | E | stays |
| | Streak chip (flame + number) | S | stays, small; tap for the streak calendar |
| | Tutor speech-bubble icon | E | becomes a labeled **Ask** button, the same on every tab and in lessons |
| ☰ menu | Home, Learn, Missions, Portfolio, News, Tutor, Me, Settings, Send feedback | H | becomes 4 tabs (Learn, Goals, Practice, Me). Tutor → Ask; Settings and feedback → Me |
| Home | Your goal card (amounts) | S | → Goals tab. Today shows one line: "Building toward: your car" |
| | Next lesson card + Start | **E** | becomes Today's one main card and button |
| | "Review N concepts" link | S | a small Today row: "Review · 5 ideas to refresh · 2 min" |
| | Streak line | S | a small Today row and the header chip |
| | Reminder offer (big form) | S | a one-time small sheet after a lesson on day 2 |
| | Age question card | S | a one-time sheet after lesson 2, or asked at sign-up |
| | This week's mission + Start mission + Show another | S | → Practice. Today shows one small row once missions unlock |
| | Other goals, New goal, Weekly check-in | S | → Goals tab. Sunday check-in also gets a small Today row |
| | 7 calculators | H | → inside their lessons, and Practice → "Tools from your lessons" once used |
| | Disclaimer note | S | → small print on Goals and Practice, and in Settings |
| Learn | Continue learning card | H | merged into Today |
| | Review card | H | merged into Today's review row |
| | Progress (20 of 59) | E | stays at the top of the path |
| | All 59 lessons listed | S | finished units fold to one row; the current unit opens; later units fold |
| | Per-lesson Review + Challenge buttons | H | inside a finished unit (tap it), and on the lesson-complete screen |
| | "Finish the lesson before this one first" | H | one line per locked unit: "after Unit 8" |
| | Two Start points | H | one current lesson only; unfinished earlier units show "2 lessons left" |
| Lesson | Close, progress, flag (report) | E | stay |
| | "Explain more" | S | becomes **Ask about this**: the same Ask sheet, with the card as context |
| | Question, options, Check, feedback | E | stay |
| | Practice step + Skip | E | stays (now "Try it above to continue") |
| Lesson done | Result + XP + streak | E | stays |
| | "For your goal" card with amounts | S | one sentence, no amounts |
| | Try-it mission card | S | only after missions unlock |
| | Achievement line | S | stays, small |
| | Account offer (after lesson 1) | S | stays |
| | Next lesson button | **E** | the main button |
| | Challenge, Share | S | small text links |
| Missions | This week's mission, the list of 31 | S | → Practice: this week's first, then "All missions" |
| Portfolio | Value, holdings, investing groups, trades, Start over | S | → Practice → Practice portfolio; hidden until it unlocks |
| News | Stories explained | S | → Practice → News; after 5 lessons; a proper empty state |
| Tutor | Simple/Expert, suggestions, chat, input | E | the Ask sheet (see §6) |
| Me | Name, avatar | E | stays |
| | Level bar, 3 stat tiles | S | one strip: streak · XP · freezes |
| | Week chart | S | stays, smaller |
| | 17 skill rows | S | one "Skills" row → its own page |
| | League | S | 3 top rows + "See league"; after 3 learning days |
| | Invite card | S | one row |
| | 20 achievement tiles | S | one "Achievements · 7 of 20" row → its own page |
| | Classes (testers only) | S | one row when it applies |
| Settings | Account, profile, learning, reminders, language and country, look, privacy, legal | S | unchanged, opened from Me → Settings |
| Onboarding | Welcome | E | screen 1 |
| | "Why are you here?" + "Pick a goal" | E | merged: **"What do you want to learn money skills for?"** (screen 2) |
| | Amount and date | H | → after the first lesson, on Goals (optional) — decision 3 |
| | Placement (new / know some basics) | E | screen 3 |
| | Daily time | H | default 10 minutes; change it in Settings |
| Sheets | Streak, welcome back, milestone, survey, feedback, share | S | unchanged |

---

## 2. The new structure

**Every screen answers three questions at a glance: where am I, what should I do here, and why does it matter for my goal.**

### Bottom tab bar: 4 tabs (the ☰ menu goes away)

| Tab | What's there |
|---|---|
| **Learn** (opens on **Today**) | **Today** at the top: the next lesson as the one big button, then small rows for review, streak and this week's mission. Below it, the course path. |
| **Goals** | Your goals with amounts and progress, recording money set aside, the Sunday check-in, new goal, and the tools that fit each goal. |
| **Practice** | Money Missions, the practice portfolio, tools from your lessons, and News explained. |
| **Me** | Progress (streak, XP, week), league, achievements, skills, invite a friend, classes, Settings, feedback, legal. |

**Why Today sits inside Learn rather than being a 5th tab:** Today *is* the next step on the course. Keeping it on top of the path means one place to learn, the "what's next" always in view, and room for Goals and Practice within 4 tabs. Duolingo's home is its path for the same reason.

**Ask** (the tutor) is one labeled button at the top right of every tab, and the same button in the lesson bar. A lesson card's "Explain more" opens the same sheet, already about that card.

### Features appear when they make sense

Each one gets a short one-time introduction (mockup 12).

| Feature | Appears | Why |
|---|---|---|
| Today, the path, Goals, Me, Ask | day 1 | the core |
| Review row | the first day ideas are due (day 2) | nothing to review on day 1 |
| **Practice tab + Money Missions** | after 3 lessons | real-life tasks make sense once there's something to apply |
| Tools (calculators) | each one after the lesson that uses it, saved to Practice → Tools | a calculator means more right after its lesson |
| Practice portfolio | with "Your first safe investment" (Compound interest), when buying unlocks today | until then it's a screen with nothing to do |
| News, explained | after 5 lessons | needs a little vocabulary first |
| League | after 3 learning days (with an account) | a league on day 1 is an empty table |
| Invite a friend | after 3 learning days | invite once it's worth sharing |
| Reminders offer | after a 2nd learning day (as now) | already earned |
| Challenges | after a perfect lesson (as now) | — |

**Existing learners lose nothing:** anything they've already used stays visible from the start, whatever the schedule says.

---

## 3. The Learn path (mockup 5)

- One column, clean and professional (status circles and a thin line, no game board), with "20 of 59 lessons · 6 of 17 units" and a progress bar on top.
- **Finished units fold to one row** ("✓ Budgeting · 3 of 3"). Tap one to review a lesson or take a challenge.
- **The current unit is open**, with its lessons as steps. The current lesson is the only one with a button.
- **Later units fold:** "Taxes made simple · 4 lessons", "Insurance basics · after Unit 8", then "8 more units".
- **One current lesson, always.** If an earlier unit was skipped, it shows "2 lessons left" instead of a second Start.

---

## 4. The look (mockups 4–9 and 13)

- **Mostly white and light grey.** White backgrounds; one card style: light-grey fill (#F4F5F7), 18 px corners, no borders, no shadows.
- **Text:** dark grey (#1F2328), with grey for secondary text.
- **Navy (#13315C) used sparingly:** the main button, progress bars, the active tab, links and the brand.
- **Green only for "correct"** in a lesson; amber only for "not quite". No other color. The streak flame turns navy (decision 4).
- **One type scale:** page title 30, section 18, body 16, small 14. Sentence-case section headers, no ALL CAPS.
- **More white space:** fewer, larger blocks.
- **Dark mode stays:** charcoal backgrounds, the same card style, light navy for the main button and progress (mockup 13).

---

## 5. The first 3 screens (mockups 1–3)

1. **Welcome:** "Learn money by doing." → **Get started**, or "I already have an account". Language and country are at the bottom.
2. **"What do you want to learn money skills for?"** A car, college, an emergency fund, a first investment, a trip, getting out of debt, or just understanding money. It picks the first lessons, and it becomes the "Building toward: your car" line.
3. **"How do you want to start?"** From the beginning, or a 2-minute check. It shows which lessons come first and why, then **Start my first lesson**.

That's 3 screens to the first lesson, down from 5.

---

## 6. The tutor ("Ask") — mockups 10 and 11

**One button, everywhere:** the labeled **Ask** at the top right of every tab and in the lesson bar. Lesson cards get "Ask about this". When the chat is empty, it shows 3–4 suggested questions based on where you are (this lesson's ideas, your goal).

### With the Anthropic key (once you add it)

- Any money question, in the learner's own words, answered clearly in **Simple** or **Expert**, educational only and never "buy this".
- **Connected to the course:** answers point to the lesson that covers the topic ("Covered in Saving · Where to keep savings → Open"). The server gives the AI the list of lessons and only accepts real ones. It's connected to the goal when useful, using the goal's kind and numbers but never its name (as now).
- **Remembers the conversation**, so follow-ups work ("what about for teens?"). The last 10 back-and-forths already go with each question; the new safety-check case proves it.
- **Off-topic** gets a short, friendly answer and a nudge back to money. **Harmful or unsafe** questions are refused safely. **Distress about money** gets a calm reply and a suggestion to talk to a trusted adult.

### Without the key (offline mode)

- It says so **up front, before you ask**: "The tutor is in offline mode, so it can only explain basic terms."
- **Smarter matching:** it matches the question to the glossary, the lesson titles and the 59 lesson ideas, even when the wording is different ("how do cards charge interest" → APR). It works in English and Spanish, and it links the related lesson.
- If nothing matches, it says so plainly and offers money words to try.

### The AI safety check (`scripts/tutor-check.mjs`): from 10 checks to about 20

New cases:
- a question in everyday words;
- a follow-up that needs the previous turn ("what about for teens?");
- "which crypto should I buy right now";
- an off-topic request (homework, an essay);
- a harmful request;
- money distress;
- Expert mode depth;
- a Spanish follow-up;
- that a real lesson is linked when one fits.

It still runs only with your OK. With Haiku it costs about 2¢.

---

## 7. What moves where, what waits, what goes

**Moves:**
- Home's goal card, other goals, New goal and the check-in → **Goals**;
- Missions, Portfolio, News and the calculators → **Practice**;
- Settings, feedback and legal → **Me**;
- the tutor → **Ask**;
- Learn's "Continue" and Review cards → **Today**.

**Waits until it makes sense:** Practice (after 3 lessons), each tool (after its lesson), the portfolio (with Compound interest), News (after 5 lessons), the league and invites (after 3 learning days).

**Removed** (every feature stays reachable):
- the ☰ side menu;
- Tutor as a menu item;
- Home's calculator grid;
- the duplicate Continue/Next-lesson cards;
- the Review and Challenge buttons on every finished lesson;
- the extra "do one lesson to keep your streak" line;
- the daily-time and reason screens in onboarding.

## 8. Step 2 (only after you approve)

- Rebuild to the approved plan, keeping every feature and all saved data. Saved progress doesn't change shape. New fields: which one-time introductions were seen, and optionally a goal without an amount yet (decision 3). Existing learners keep everything they've used visible.
- Browser tests updated for the tab bar, plus:
  - a brand-new learner reaches the first lesson from Today with one tap;
  - Practice appears after 3 lessons;
  - the offline Ask banner shows;
  - offline Ask matches different wording.
- A new first-five-minutes pass on a phone screen in English/US and Spanish/Mexico, before-and-after screenshots, all tests and `npm run preflight` passing, then commit.

## 9. Decisions for you

1. **Today on top of the Learn tab** (recommended), or Today as its own tab? That would mean dropping Goals or Practice to stay at 4.
2. **The Practice tab appears after 3 lessons** (recommended), or is visible from day 1 with locked previews?
3. **Goal amount and date:** asked after the first lesson, on Goals, as optional (recommended; 3 onboarding screens), or kept in onboarding (4 screens)?
4. **The streak flame in navy** (recommended, to fit white/grey/navy), or keep it amber?
5. **Dark mode as charcoal** with light-navy accents (mockup 13), replacing today's navy-background look?
6. **Green only for correct answers.** Progress bars and finished checks become navy. OK?
