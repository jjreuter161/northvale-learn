# Next round: plan and mockups (nothing is built yet)

Two parts:
1. **Design follow-ups:** the advisor's notes on the playful design, which is already built on `milestone-4.5`, commit 518e989.
2. **Milestone 5, Step 1:** competitor research (`docs/COMPETITION.md`) and the signature features plan.

**Mockups** (from `mockups.mjs`; `mockups.html` shows them all):
- `1-your-course.png`: "Your course", calm and detailed, each in Cream and Navy.
- `2-lighthouse.png`: the lighthouse's beam as frames (`lighthouse.webm` shows it moving).
- `3-cream-vs-navy.png`: the Settings picker, plus the real app's screens in both looks.
- `4-milestone-5.png`: the signature features.

Already decided and applied: Spanish wrong answers say "No del todo" everywhere, on `main` and both branches.

---

## Part 1 · Design follow-ups

### "Your course"
- **Every unit gets its own landmark island** (`landmarks.mjs`, 17 of them):

  | Unit | Landmark |
  |---|---|
  | Budgeting | a chart house |
  | Saving | a harbor |
  | Banking | a market |
  | Your first paycheck | cargo and a crane |
  | Debt & credit | a bridge |
  | Scams | the lighthouse |
  | Compound interest | terraces and a tree |
  | Taxes | a harbor tower with buoys |
  | Insurance | a life ring |
  | Psychology | a moonlit island |
  | Stocks | flags at different heights |
  | ETFs | a flotilla |
  | Risk | a storm cloud |
  | Crypto | a jagged rock with lightning |
  | Retirement | a palm at sunset |
  | Earning more | a windmill |
  | News | a signal mast |

- **States:**
  - **Current unit:** highlighted, bigger, with the boat bobbing beside it and a card with its progress ("1 of 4 lessons") and a Continue button.
  - **Finished units:** a flag and "3 of 3 ✓".
  - **Next units:** faded into the mist.
- **Calm version:** unit cards on a dotted route, each with its landmark and progress. The current card opens to its lessons.
- **Detailed version:** a sea chart. Islands zigzag down a dotted route, with soft wave lines, buoys, a few birds, mist over the next units and "open water" at the end. The water drifts slowly and the boat bobs.
- **Both:**
  - **Screen readers:** each island is a button named like the unit card ("Unit 3 · Banking for real · 4 of 4"), and the pictures are hidden from screen readers.
  - **Size:** each landmark is about 0.5–1 KB.
  - **Motion:** stops with Reduce motion.

### The lighthouse
- **The beam:** a soft cone of light sweeps across and back about every 6 seconds, brightening in the middle.
- **Where:** the Scams picture (Today's card, the unit card, the unit-finished moment) and its island on the map.
- **Reduce motion:** it stays still, at the middle.
- **Loading:** the bobbing boat stays. A spinning light reads as "searching" rather than "waiting."

### Cream and Navy
- Settings → **Look**: **Cream**, **Navy**, or **Match my device** (Cream by day, Navy when the phone is in dark mode).
- **Navy is designed, not inverted:**
  - cream type and sails;
  - deep-navy water;
  - a warmer coral that still glows;
  - lighter mist on the map.
- The real app already has these colors (`3-cream-vs-navy.png` shows the built screens). What's new is the names, the picker and "Match my device".
- **Saved settings stay as they are.** "white" shows as Cream and "navy" as Navy, so nobody's choice changes.

---

## Part 2 · Milestone 5, the signature features

The research is in **`docs/COMPETITION.md`**. In short:
- every competitor serves one country;
- most teach next to a bank product;
- Mexico's official tools are good but scattered and not made for teens.

Our edge: independent, both countries, learning by doing.

### Where each feature lives (no new tabs or menus)

| Feature | Where |
|---|---|
| Two countries | The country choice on Welcome and in Settings gets a third option, "Both" (US + Mexico). It adds the new unit and shows both currencies where useful |
| Money across borders (a unit, 5 lessons) | Learn, like any unit, with its own landmark |
| What actually arrives (remittance tool) | Practice → Tools, after its lesson |
| Your money year (the simulator) | Practice, its own card |
| Explain this | The Ask button: a second tab, "Explain this", beside "Ask" |
| Certificates | Me → Certificates; a verification page at `/verify` |
| Our promise | Already done (brand pass): Me and the landing page |

### Each feature, and where I'd push back

**1. Two countries.**
- **"Both" as a third choice, not a new onboarding screen.** The welcome screen's country chips become US / Mexico / Both, and Settings matches, so onboarding stays at three screens.
- **What "Both" turns on:**
  - both currencies in the tools;
  - the Money across borders unit;
  - cross-border examples in a few lessons.
- **The unit's 5 lessons:**
  - exchange rates and why they move;
  - what sending money really costs (fee plus the rate's markup);
  - bank accounts and cards in two countries;
  - credit doesn't cross the border (US credit history and Buró de Crédito are separate);
  - studying or working in the other country.
- **Every number goes in `facts.js`** and on your to-check list.

**2. What actually arrives (the remittance tool).**
- It teaches how a fee and an exchange-rate markup add up, with example numbers.
- **Pushback:** don't build our own comparison of companies. Profeco's official "Quién es Quién en el Envío de Dinero" already compares real companies by city. We teach the idea and link there, so we never name or rank a company.

**3. Your money year (the simulator).**
- **Scope:** one year first, as agreed. Twelve monthly turns, about 8 minutes. You start as "First job", "Student" or "On your own", with US or Mexico numbers.
- **Each month:** one decision, such as a cracked phone, a raise, a friend's trip or a sale.
- **The year's end:** net worth, savings, debt, credit, and the path not taken, drawn as a second line. Each event links to its lesson.
- **Pushback:** call the last meter **"Peace of mind,"** not "stress level." It means the same thing without scoring a teen's mental health.
- **The math is a tested engine,** like the goal planner.

**4. Explain this.**
- **Text first,** as agreed. Photos wait for the lawyer.
- **Better idea:** the app hides long numbers on the device *before* anything is sent:
  - card and account numbers;
  - US Social Security numbers;
  - Mexican CURP and RFC.

  The screen shows what it hid. That doesn't depend on the learner remembering to cover them.
- **Never saved** on our server, in analytics, feedback or class data.
- **Its own daily limit,** and its cost on the admin page.
- **10+ new cases in the AI safety check:**
  - a real-looking scam ad;
  - a payday loan offer;
  - a pay stub;
  - text with a card number in it;
  - "should I sign this?";
  - things that aren't about money.

**5. Certificates.**
- **Three tracks:** Money Foundations (units 1–5), Investing Basics, and Money Across Borders.
- **What it shows:** the name the learner picks. **Under 18 it's always the nickname**, as agreed.
- **The verification page shows only** the name shown, the track and the date.
- **Pushback, for 13–17:** the verification page should show just the track and the date, with no name at all. A public page should never pair a teen's nickname with anything findable.

### Also from the research
- **Rename "Money Missions"** before the public launch. GoHenry has used that name since 2021, and BBVA México's teen challenges are "misiones."

### Order, size and risks

| Step | Size | Main risk |
|---|---|---|
| 1. Two countries + Money across borders + the remittance tool | Medium | Cross-border facts must be checked (you and the lawyer) |
| 2. Explain this (text) | Medium | AI cost (capped), privacy (numbers hidden first), safety (new check cases) |
| 3. Your money year (one year) | Large | The math has to be right and stay calm; tested like the goal planner |
| 4. Certificates | Small | Public pages and teens (track and date only, no name) |

**Recommendation:**
- **Order:** this order. Two countries is what nobody else does, and it's the cheapest to build.
- **Testers first:** start after testers' first week, so their feedback can cut anything they wouldn't use.

---

## Decisions for you

1. **"Your course": calm or detailed?** I recommend **detailed**. It's the screen people see every day, and it's still easy to read. The calm one is the fallback if testers find the map busy.
2. **Look for new learners:** Cream, or **Match my device** (recommended)?
3. **"Two countries" as a third country choice** (recommended), or its own onboarding screen?
4. **The simulator's meter:** **"Peace of mind"** (recommended) or "Stress level"?
5. **Explain this hides long numbers on the device before sending** (recommended)?
6. **Certificates for 13–17:** the verification page shows **only the track and date** (recommended), or the nickname too?
7. **Rename "Money Missions":** "Real-life missions" / "Misiones de la vida real" (recommended), or "Try it for real" / "Pruébalo de verdad"? The lawyer checks the one you pick.
8. **Milestone 5's order:** two countries → Explain this → the money year → certificates (recommended)?

## Approved (2026-11-12)

1. "Your course": the detailed sea chart.
2. New learners' look: Match my device.
3. Two countries: a third country choice, "Both."
4. Simulator meter: "Peace of mind."
5. Explain this hides card and account numbers on the phone before anything is sent, and still shows the warning.
6. Certificates for 13–17: the public page shows only the track and the date.
7. "Money Missions" becomes "Real-life missions" everywhere (app, docs, landing page, EN/ES). It's on the lawyer list.
8. Milestone 5's order: two countries → Explain this → the money year → certificates, starting after testers' first week.

Also decided: no separate branch before launch. Everything goes into `main` as Release Candidate 1 (v1.0.0-rc1).
