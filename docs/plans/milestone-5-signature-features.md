# Milestone 5 — "Signature features" (Step 1 done; waiting for approval)

**Step 1 (2026-11-12):** the research is in `docs/COMPETITION.md`; the plan, the mockups and the decisions are in `docs/design/next/PLAN.md`.

**When to start:** only after the clarity rebuild (Step 2) is finished and committed, and ideally after the first testers have used the app for a week, so their feedback can cut features they wouldn't use. Received 2026-11-05 from the advisor; kept here so it isn't lost.

**The four ideas:**
1. Built for life between the US and Mexico.
2. A "Your Money Life" simulator.
3. "Explain this" for real money documents, in Ask.
4. Independent and certified: certificates and "Our promise".

**The rule:** everything fits inside the 4 tabs (Learn, Goals, Practice, Me) and the Ask button. No new tabs or menus.

---

## The prompt, as received

Milestone 5: "Signature features": what makes Northvale stand out from every competitor. Do this AFTER the clarity rebuild (Step 2) is finished and committed.

Rules for the whole milestone:
- Everything fits inside the existing 4 tabs (Learn, Goals, Practice, Me) and the Ask button. No new tabs, no new menus. The app must stay as clear as the clarity plan made it.
- Keep all existing features, data, tests, and privacy rules working. English and Spanish, US and Mexico versions.
- Work in steps and stop after each for my approval. Don't add paid services or accounts without asking. Commit after each step.

### Step 1: Competitor research and plan (no building yet)
- Research the main competitors: Zogo, Khan Academy's personal finance course, Greenlight, Duolingo-style finance apps, and Mexican options (bank education apps like BBVA's, CONDUSEF's programs, CETES Directo). For each: what they do well, what they don't do, who they target, how they make money.
- Write docs/COMPETITION.md with a comparison table and "where Northvale wins."
- Then turn the four signature features below into a detailed plan with mockups, showing exactly where each one lives in the 4 tabs. Push back if you think any of them is a bad idea, or if you see a better one.
- Stop for my approval.

### Step 2: Built for life between the US and Mexico
The goal: the best money app for people connected to both countries.
- A "Two countries" option in onboarding and Settings ("I have ties to both the US and Mexico"). When on, the app shows both currencies where useful and adds cross-border content.
- A new unit, "Money across borders": exchange rates and how they change, sending money between countries (how remittance fees and exchange markups work, how to compare total cost), using bank accounts and cards in both countries, building credit when you move (US credit history doesn't transfer to Buró de Crédito and vice versa), and studying or working in the other country.
- A remittance cost tool: enter an amount and see how a fee plus an exchange-rate markup changes what actually arrives (illustrative numbers in facts.js, clearly labeled, never naming or ranking real companies).
- A mission: compare the real total cost of sending money through two different services.
- Every new fact goes in facts.js and on the to-verify list for me.

### Step 3: "Your Money Life" simulator (in the Practice tab)
The goal: learn by living the consequences, not just answering questions.
- A simulated life that advances one "month" per turn. The user starts at 18 with a starting situation (student, first job, etc.) and makes decisions: budget split, rent vs. living with family, savings, using credit, an emergency, buying a car, investing, a raise, a job loss.
- Decisions carry forward: debt grows with interest, savings compound, an emergency hurts more without a fund. Show a clean summary each year: net worth, savings, debt, credit health, stress level.
- Each big event links to the lesson that teaches it ("Want to understand what just happened? Lesson: How interest works").
- Simulations take 5–10 minutes to play through a few years, can be saved, and can be replayed with different choices to compare outcomes. An end screen compares "your life" with an alternative path.
- Realistic but clearly labeled as a simulation with example numbers. US and Mexico versions (pesos, CETES, AFORE, aguinaldo, etc.).
- Calm and professional, not a cartoon game.

### Step 4: "Explain this" (part of the Ask button)
The goal: the tutor helps with real-life money documents.
- In Ask, the user can paste text or upload a photo of: a pay stub, receipt, bank or card statement, credit card or loan offer, an ad, an investment pitch, or a news headline.
- The tutor explains it in plain language (Simple or Expert), points out important numbers (fees, interest rates, taxes withheld), and flags red flags (scam signs, hidden fees, pressure tactics). It links to related lessons. Always educational, never "you should sign/buy this."
- Privacy first: before uploading, tell users to cover account numbers, card numbers, and ID numbers. Photos and text are sent only for that one answer, never stored on the server or in analytics, and never included in feedback or classroom data. Explain this clearly on the screen and in the privacy policy (EN/ES).
- Works only with the AI key (offline mode explains that it's unavailable).
- Add 10+ cases to the AI safety check (a real-looking scam ad, a predatory loan offer, a pay stub, a photo with an exposed card number, a request to "tell me if I should sign this," non-money images).
- Watch the cost: images use more AI budget, so add a separate daily limit per user and show the expected cost per use in the admin page.

### Step 5: Independent and certified
- Certificates: completing a track (e.g., "Money Foundations," "Investing Basics," "Money Across Borders") earns a clean, professional certificate with a verification link and code. The user chooses the name shown (nickname or real name). A public verification page shows only the name chosen, the track, and the date. Under 18: nickname by default, and real name only with the existing guardian consent.
- Trust promise: a short, clear "Our promise" page (EN/ES), linked from Me and the landing page: no ads, we never sell your data, no bank or company pays us to recommend products, and lessons are educational, not sales. Only say what's actually true in the code and policies.
- Update the landing page to lead with what makes Northvale different (two countries, the life simulator, "Explain this," independence), using real screenshots only.

### When everything is done
Browser tests for every new feature (including the simulator's math, the remittance tool, the "Explain this" privacy notice and no-storage behavior, and certificate verification), npm run preflight passing, updated docs, before-and-after screenshots, the facts to verify, decisions for me, the top risks, and a commit.

---

## Agreed (2026-11-05, the advisor and you)

- **"Explain this" ships text-only first.** Photos come only after a lawyer review.
- **Certificates never show a real name for anyone 13–17.**
- **A short one-year simulator comes first,** to test with testers before the full multi-year game.
- **Competitor claims are checked against the competitors' own websites,** not blog round-ups.

## Things to settle in Step 1 (first notes)

- **"Explain this" with photos.**
  - A photo of a pay stub or statement is the most sensitive data the app would ever handle, and many users are 13–17.
  - Covering numbers before uploading relies on the user. The screen should check for exposed numbers and warn, and the lawyer should see it.
  - Images also go to Anthropic: the privacy policy already names Anthropic, but this is new data.
  - Pasted text is far cheaper and safer, so it may be worth shipping first.
- **Public certificate pages.**
  - A page anyone can open with a learner's real name is a public profile; Phase 5's rule was "no public profiles".
  - Safer default: the verification page shows only the chosen display name, the track and the date, and never real names for 13–17.
- **The simulator is the biggest build here,** roughly a phase of its own. Its value is easiest to test with real testers first. A short "one year" version could prove the idea before the full multi-year game.
- **Competitor facts** (Zogo's business model, Greenlight's pricing, CONDUSEF's programs) get checked against their own sites in Step 1, not taken from blog round-ups.
