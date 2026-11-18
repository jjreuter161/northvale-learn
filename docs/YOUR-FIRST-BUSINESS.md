# Your First Business: plan (nothing built yet)

**Status: a plan and mockups for your approval.** Mockups: `docs/design/your-first-business/mockup.html` (and the PNGs beside it). It follows the same design as **Your Money Year** (`src/modules/year/`), so most of the engineering is already proven.

## What it is

A one-year business simulator in the **Practice** tab, next to Your Money Year. The learner picks a small business, then runs it for 12 months. Each month brings **one decision** (pricing, costs, inventory, marketing, hiring, or a problem such as a supplier issue or a slow month), and the month settles: they see **revenue, costs, profit and cash** change. Courses usually talk about business; this lets people practice it.

It teaches the one big idea: **create value, deliver it, capture some of it.** Each decision is tagged with the part of the loop it touches, and the end screen shows where the business was strong and where it leaked.

## The flow

1. **Pick a business** (4 starts, example numbers, labeled as examples):
   - **Taquería stand**: low price, high volume, food costs and rent.
   - **Phone-repair stand**: parts cost, quick jobs, a few regulars.
   - **Small online store**: shipping, ads, returns, and customers who pay at checkout.
   - **Corner shop (abarrotes)**: lots of items, inventory, and a supplier.
   Each shows what it's like, in one sentence ("Steady customers, thin margins").
2. **Twelve months, one decision each.** Every event has **exactly three choices**; one is marked `steady` (the sound choice the end screen compares with), as in Your Money Year. A choice shows its cost and its risk *before* the learner confirms, never a "right" answer with a green tick.
3. **The month settles.** A small card: revenue, costs, profit, cash at month's end, and a trust bar (customers' trust: reviews, repeat sales). Cash can go below zero; that ends the run early with a calm "the business ran out of cash in month N" and a link to the lesson on cash flow.
4. **"Why this happened" links.** Each event shows a small link: *Learn: What sets a price (47-3).* It opens the lesson that explains it, and the lesson's action links back to the simulator.
5. **The end screen** (month 12): profit for the year, the lowest cash point, and three lines: **What went well**, **What you'd change**, and **The decision that mattered most**, each with its lesson. Then the learner can run the same business again, or try another.

## The twelve events (same for every business; the numbers are the business's)

| Month | Event | Decision | Skill it practices | Lesson it links to |
|---|---|---|---|---|
| 1 | Set your price | Low, middle or high | Price against cost and demand | 47 What sets a price; 48 Money in, money out |
| 2 | What to spend on at the start | Cheap gear, solid gear, or used gear | Fixed costs and break-even | 48 How many sales to break even |
| 3 | First marketing | Flyers and word of mouth, a small ad, or a sale | Reaching customers and what one customer costs | 50 Ways to reach people |
| 4 | Order size | Small, medium or large inventory | Inventory, waste, cash tied up | 53 Inventory |
| 5 | **A supplier raises prices** | Absorb it, raise your price, or switch suppliers | Suppliers and margin | 53 Suppliers; 47 When costs rise |
| 6 | **A slow month** | Cut costs, run a promotion, or wait | Cash cushion and fixed costs | 55 Slow months |
| 7 | A big customer asks for a discount | Accept, counter, or decline | Selling and discounts | 51 Discounts and deals |
| 8 | **Something breaks** | Repair now, borrow time, or replace | Surprises and reserves | 55 Cash cushion |
| 9 | A competitor opens next door | Match their price, stand out, or ignore | Strategy and competition | 58 Reading competitors; 47 Competition |
| 10 | Permit or tax due | Pay on time, ask for help, or put it off | Making it legal and taxes | 52 Licenses; 56 What's taxed and when |
| 11 | Hire help? | Hire, use a part-timer, or do it all yourself | Managing people and the real cost of a hire | 57 What an employee really costs |
| 12 | A chance to grow | Open a second place, reinvest in this one, or take profit out | Growth, funding and when not to | 59 Growing too fast; 60 Reinvesting |

Events 5, 6 and 8 are the "problem" months. They're scripted, not random, so a run can be replayed and tested.

## How it works (engineering, small)

- **A module like `src/modules/year/`:** `src/modules/business/` with `index.jsx` (the Practice row, lazy-loaded so the app starts as fast as before), `Business.jsx` (the screen), `engine.js` (the math) and `content.js` (businesses and events, text in both languages with `T()`).
- **`engine.js` is pure and deterministic**, no randomness, so every path can be tested and the `steady` path can be played for the end-of-year comparison, exactly as Your Money Year does. A month is:
  - **demand** = the business's base customers × a price effect (higher price, fewer customers) × a marketing effect × trust;
  - **revenue** = customers × price; **costs** = what each sale costs + fixed costs (rent, pay) + the month's event costs;
  - **profit** = revenue − costs; **cash** moves with profit, but some businesses are paid later (the online store gets paid at checkout; a business with an invoice-paying customer waits), so profit and cash can differ and the simulator shows it;
  - **trust** moves with quality, service and honest dealing, and affects demand.
- **Money in both currencies**, round local numbers, never conversions (same rule as lessons); the whole thing is labeled "example numbers."
- **Saved run** in the same store slice as Your Money Year (`business: { run, history }`), resumable.
- **Hooks into the rest:** a "Continue: month N of 12" row on Practice and on Today (like `year`), and the lesson action `business.month` (a one-month taste of the simulator) used by the business lessons.
- **Tests:** the engine's math on every business's `steady` path, that every event has three choices and one `steady`, that every event's lesson id exists, and that text exists in both languages and both countries.
- **Size:** content loads only when opened, like the Year screens.

## Rules (same as the rest of Northvale)

- **Teaches, never advises.** Choices show trade-offs; the end screen says "here's how this path compares," not "you should have."
- **No promises, no hot tips.** The numbers are examples and the market is made up, said on the first screen.
- **Teens:** nothing asks them to open an account, apply for a permit, or share numbers; the permit and hiring events are about what a business owner would check.
- **Calm, like the rest of the app:** no confetti, no countdowns, no guilt. Going broke is a lesson, not a failure screen.
- **Both countries:** the Mexico version uses pesos and Mexico's terms (permiso, IMSS, SAT, RESICO) where the system differs.

## What ships when

- **With wave 5** (units 46–52): the taquería and the phone-repair stand, all 12 events, linking to the lessons that exist. Events whose lessons aren't live yet link to the closest live one or hide the link until their wave ships.
- **With wave 6:** the online store and the corner shop, plus every event's final links.
- **Not planned:** random events, multiplayer, leaderboards, real-money or real-company data. Those can come later if people ask.

## Open questions for you

1. **Four businesses to start, or two?** Four is more replay value and more content to review; two is half the writing.
2. **Where it shows up first.** I'd put a row in Practice and, once someone finishes unit 48, a suggestion on Today ("Run Rosa's taquería for a year").
3. **A name.** "Your First Business" / "Tu Primer Negocio" is clear and matches Your Money Year.
