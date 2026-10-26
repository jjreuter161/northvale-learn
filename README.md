# Northvale Learn

Set a goal, get a plan, and learn what it takes to reach it, five minutes a day. It's educational only: no real money, no real trades, no bank connections.

- **Goals first.** Home is your goal dashboard.
  - Pick a goal (emergency fund, car, college, first investment, travel, paying off debt, or your own) with country-appropriate starting amounts. You get a dated monthly plan on a path: cash, savings account / CETES, or index fund.
  - Each goal shows what you've saved so far vs. the target, time left, and whether you're on track, behind or ahead of the plan.
  - Practice investments linked to a goal show on their own line ("with practice investments"), so you can see how investing could get you there sooner.
  - You record money you set aside, and entries stay visible after edits.
  - Milestones at 25/50/75/100% are marked with a calm moment and an achievement.
  - A Sunday check-in sums up the week.
  - Each goal keeps its own currency, with an approximate conversion if you switch country.
  - You can have several goals and edit, pause or delete them.
- **Lessons.** 17 units with 59 lessons of 3–5 minutes each. They run from budgeting, saving, banking, your first paycheck, credit and scams through compound interest, taxes, insurance, the psychology of money, stocks, funds, risk, crypto and risky bets, retirement and earning more, to reading financial news. Each lesson has short cards, quick questions with instant feedback, and ends with a real action in the practice portfolio or a goal tool (including paycheck, sales tax/IVA, tax brackets, bank fees, scam red flags, insurance, volatility and side-hustle tools). The next lesson is picked for your goal, and each finished lesson says how it helps that goal.
- **A learning engine that remembers.**
  - Every question tests a concept (59 of them), and each learner's mastery of each concept is tracked: new → learning → solid → mastered.
  - A 2–3 minute **Review** brings back concepts you missed or haven't seen in a while, using spaced repetition. It counts toward the daily goal and the streak.
  - A wrong answer says why that choice is wrong, then gives the answer. In a lesson, a miss also brings another explanation and an easier question right away.
  - A perfect lesson unlocks a harder **Challenge** version.
  - Me shows a skills overview.
- **Money Missions.** Small real-life tasks that put a lesson to work: "Track everything you spend for 3 days", "Find the fees on a bank account", "Read a real pay stub", "Spot 3 ads that use FOMO", "Set aside any amount toward your goal". There are 31, one suggested each week on Home. They're picked for your country, age range (some are 18+, and some have a 13–17 version that involves a parent) and goal, and for what you studied this week. A finished lesson suggests its unit's mission. You do them on your own, mark them done and can add a short private note. They earn 20 XP the first time (weekly ones once a week) and three achievements, but don't count for the learning streak. No money moves and nothing is collected; usage stats count only that a mission was finished.
- **First minutes.** Pick a reason, set your first goal (amount and date, prefilled for your country), optionally take a 2-minute placement check that skips units you already know, pick a daily time, and you're in the lesson that helps that goal most. Signing up is offered only after that lesson.
- **Habit.** XP, levels, a daily streak with automatic streak freezes, a daily XP target, achievements and a weekly league (real people only), kept quiet and in the background. The top bar shows only the streak; XP lives on Me. Achievements come from learning and from goal milestones, which never give XP (savings are self-reported). There's also a calendar reminder.
- **Practice portfolio.** $10,000 (or $200,000 MXN) of pretend money. Safe investments, funds and single stocks unlock as you learn. Holdings linked to a goal are tagged with it. Prices are real and delayed with a market data key; otherwise they're samples, clearly labeled.
- **Calculators.** Budget planner, debt payoff, starting early, investing range, retirement, paycheck and side hustle, on Home and as lesson steps.
- **AI tutor.** It explains any term, chart or headline in Simple or Expert mode, always as education, and can relate answers to your goal (it sees the goal's kind and numbers, never the name you typed). Without AI, it answers from a built-in glossary.
- **News, explained.** Real headlines, each with a plain-words "what this means".
- **Languages and countries.** English and Spanish, for the United States and Mexico.
- **Looks like a finance app.** Deep navy, one green accent for progress, neutral grays, Inter with a serif wordmark, tabular figures for money, short fades with no bounce. Light and Dark looks. Before/after screenshots are in [docs/design/](docs/design).
- **Built for a beta.** Privacy-friendly analytics, a private admin page, "Send feedback" everywhere, a one-question survey after lesson 3, error alerts, daily backups, and an installable phone app that works offline.

## Run it

```bash
npm install
npm run dev        # http://localhost:8950
npm test
```

Everything works without keys. To turn on the AI tutor, real prices and reset emails, get the keys (see **[docs/SETUP-KEYS.md](docs/SETUP-KEYS.md)**), then run `npm run setup` and `npm run check-setup`. Keys go only in `.env`, which is never committed and never sent to the app.

| Setting (`.env`) | What it does |
|---|---|
| `ANTHROPIC_API_KEY` | AI tutor + news summaries. |
| `TUTOR_MODEL`, `NEWS_MODEL` | Which Claude model to use: `claude-haiku-5-5` (default for the beta; $25 covers ~40,000 answers), `claude-sonnet-5-5` or `claude-opus-5-5`. |
| `AI_MONTHLY_BUDGET_USD` | AI spending stops for the month at this amount (default $25). Alerts are sent at 80% and 100%. |
| `TUTOR_DAILY_LIMIT`, `TUTOR_PER_MINUTE` | Tutor questions allowed per account (defaults: 30 a day, 5 a minute). |
| `TWELVEDATA_API_KEY` | Real delayed prices (free key). Without it, prices are labeled samples. |
| `CETES_RATE`, `CETES_RATE_DATE` | The rate for simulated CETES; otherwise an example rate is used and labeled as one. |
| `ADMIN_TOKEN` | 20+ characters; opens the private stats page at `/admin`. |
| `ALERT_WEBHOOK_URL` | A Discord or Slack webhook for new errors, budget alerts and failed backups. |
| `SIGNUP_CODE` | Accounts need this code (for a closed beta). |
| `SMTP_USER`, `SMTP_PASS`, `PUBLIC_URL` | Password reset emails, sent from a dedicated Gmail with an app password (docs/SETUP-KEYS.md §4). |
| `CONTACT_EMAIL` | Shown to testers who need help, and in the legal pages. |
| `PORT`, `HOST`, `ALLOWED_HOSTS`, `TRUST_PROXY`, `NORTHVALE_DATA` | Server and hosting settings. |

## Docs

| Doc | What's in it |
|---|---|
| [docs/SETUP-KEYS.md](docs/SETUP-KEYS.md) | Getting the Twelve Data and Anthropic keys, AI costs by model, the tutor safety check |
| [docs/DEPLOY.md](docs/DEPLOY.md) | Hosting recommendation, deploying to Fly.io step by step, backups, alerts, installing on phones |
| [docs/BETA.md](docs/BETA.md) | Finding 20–50 testers, invite messages (English/Spanish), the one-week plan, what to ask |
| [docs/FACTS.md](docs/FACTS.md) | Every number that changes over time, and the one file where it lives |
| [docs/CONTENT-REVIEW.md](docs/CONTENT-REVIEW.md) | What the content review fixed, what could read as advice, and facts to verify |
| [docs/CONTENT-STYLE.md](docs/CONTENT-STYLE.md) | How lessons are written: voice, reading level, numbers, two countries, never advice |
| [docs/COMPLIANCE.md](docs/COMPLIANCE.md) | COPPA, state laws, Mexico's data law, financial-advice rules, open decisions |
| [docs/SECURITY-REVIEW.md](docs/SECURITY-REVIEW.md) | The security review, what was fixed, known limits |
| [docs/legal/](docs/legal) | Privacy policy and terms (English/Spanish) — **drafts for a lawyer**. The app shows these same files. |

## How it's built: a core plus modules

```
src/core/       accounts and sync, profile, XP/streak engine (progress.js),
                facts (facts.js), analytics, errors, settings, English/Spanish,
                design system, legal pages
src/modules/
  lessons/      the path, the player (lessons, reviews, challenges), the
                course rules (content.js), one file per unit with its
                lessons and concepts (units/), mastery and spaced review
                (mastery.js), placement and the skills card (practice.jsx)
  portfolio/    practice portfolio, prices, its lesson actions
  goals/        Home: goals, plans, milestones, check-in (plan.js = the
                tested model), the calculators (tools.jsx), its lesson
                actions and its onboarding step
  missions/     Money Missions: the catalog (catalog.js), who they fit and
                the weekly pick (pick.js = the tested rules), Home's card,
                the Missions screen and the card after a lesson
  tutor/        AI tutor + offline glossary
  news/         news, explained
  feedback/     "Send feedback" and the survey
server/         accounts, progress sync, leagues, tutor (with budget),
                news, prices, insights (analytics/feedback/errors), alerts,
                backups
web/            the page, offline service worker, icons, fonts, admin page
scripts/        validate-content.mjs — checks every lesson, mission and piece
                of app text (npm test runs it);
                tutor-check.mjs — safety check against the real AI (costs money)
```

The core never imports a module. Each module calls `registerModule({ id, nav, Screen, Overlay, Onboard, actions, facts, services })` and gets its own slice of saved state. `Onboard` is an optional first-run step (Goals uses it for the first goal). Modules don't touch each other's state; they talk through events (`emit`/`on`) or named services (`service("tutor", "open")`). A lesson's final step names an action, such as `"portfolio.buy"`, and whichever module provides it renders it.

### Future modules (not built; this is where they plug in)

A **real bank connection** (Plaid in the US, or a Mexican equivalent), **real investing through a licensed partner broker**, and **real banking through a partner bank** each become a module:

1. Create `src/modules/<name>/` with its own screen, saved-state slice and strings.
2. Import it in `src/main.jsx`.
3. Put its server routes in their own file and add them to the routes table in `server/index.js`.

The core and the other modules don't change. Goals are already built for this: a goal's progress is "what's set aside + what's linked", so a real-accounts module can supply real balances through a service the same way the practice portfolio does today (`service("portfolio", "usePositions")`). The existing **Northvale money manager** (`~/Downloads/northvale`: bank connections and the planning engine) is meant to plug in the same way. Real-money modules will also need their own security review, encryption for stored bank tokens, and licensed partners. None of that is in this version.

## Privacy and safety

- **Accounts are optional.** Without one, progress stays on the device.
- **What an account stores:** email, nickname, age range (13+ only; 13–17 with a parent's or guardian's OK) and progress.
- **Analytics:**
  - first-party only, with a random install ID; no name, email, IP or trackers;
  - can be switched off, and are off automatically with Global Privacy Control or Do Not Track.
- **Mission notes** are private: saved with your progress (synced only if you have an account), never sent with usage stats. The note box asks people to leave out account numbers and passwords.
- **Fonts are self-hosted,** so opening the app contacts no third party.
- **Delete my data** (Settings → Privacy) removes the account, this device's usage stats and the device's data.
- **Educational only:**
  - a notice on every money screen;
  - the tutor never recommends buying or selling anything;
  - sample prices and rates are always labeled.

See COMPLIANCE.md and SECURITY-REVIEW.md for details.

## Tests

`npm test` runs `test/engines.test.mjs`, `test/content.test.mjs` (the content validator: both languages and countries, concept tags, explanations, facts, actions, 3–5 minutes, missions, and no missing or duplicated app text), `test/mastery.test.mjs` (mastery levels, spacing, review picking, the migration for existing learners, placement), `test/missions.test.mjs` (which missions fit, their order, the weekly suggestion, notes, XP once, achievements), `test/goals.test.mjs` (plans; on track / behind / ahead; what it takes from here; saved vs. "with practice investments"; milestones once each; re-planning that keeps entries; the Sunday check-in; per-goal currency and conversion; templates), `test/mail.test.mjs` (the reset email, against a fake mail server) and `test/server.test.mjs`. The server tests run against stand-ins for Claude, the news feeds and Twelve Data, so nothing real is called. They cover:

- **The rules:**
  - XP, streaks and freezes, badges and starting units;
  - money by country and the facts;
  - portfolio and goal math;
  - all 59 lessons, 31 Money Missions, every piece of app text and the glossary being complete in both languages and both countries;
  - Money Missions: who each fits, their order, the weekly suggestion, notes, XP once and achievements.
- **The server:**
  - accounts, with the age and guardian rules;
  - progress sync and leagues (with the XP cap);
  - the tutor: server-side prompt, limits and monthly budget, and goal facts without goal names;
  - news, including dropping steered summaries;
  - prices;
  - analytics and retention math, quit points, the survey, feedback and errors, behind the admin token;
  - password reset (the same answer for any email, a link that works once, other sessions signed out);
  - deleting data and accounts.

`node scripts/tutor-check.mjs --yes` checks the real AI's answers. It costs money, so it only runs when you ask for it.
