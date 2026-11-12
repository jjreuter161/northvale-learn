# Content style guide

How Northvale Learn lessons are written. Follow this for every new lesson so the course reads as one voice. The format is in `src/modules/lessons/units/helpers.js`. Run `node scripts/validate-content.mjs`; `npm test` runs it too.

## Who we're writing for

People aged 15–25, many of them earning for the first time, in the US and Mexico. They're smart and busy, and they're often reading on a phone between other things. Assume no background, but don't talk down.

## Voice

**A great teacher with a sense of humor.** Confident, warm, a little witty; never childish, never cute, never sarcastic about money problems. We respect people with little money: no lectures, no guilt, no "just stop buying coffee".

- **Calm and plain.** Like a good older cousin who works in finance: direct and kind.
- **A wit budget:** at most one light line per screen.
  - Wit is a raised eyebrow, not a joke: "You're first in this week's league, which is easy when you're the only one."
  - **No wit at all** on scams, debt, money stress, losses, errors that cost the learner something, or anything about someone's family or income.
- No exclamation marks in teaching text. No emoji. No slang that will date ("lit", "no cap").
- **Second person, present tense.** "Your employer withholds…", not "One's employer…".
- **Spanish:**
  - informal Mexican "tú" throughout;
  - natural Mexican terms where they exist (gastos hormiga, aguinaldo, recibo de nómina);
  - written in Spanish, not translated: a line that's witty in English gets its own Spanish line, or a plain one;
  - gender-neutral where it's easy ("no hay nadie más", not "eres el único").
- **Reading level:** about grade 7–8.
  - Short sentences: aim for under 20 words.
  - One idea per sentence.
  - Every technical term is defined the first time it appears, in plain words.

## The small text (buttons, empty screens, finishes, reminders, errors)

- **Empty screens point somewhere.** Say what's missing and the one useful next step.
  - Not "Set a goal".
  - Instead: "No goal yet. Most people start with an emergency fund. It's the one that saves you from everything else."
- **Errors are plain and reassuring.** What happened, what to do, and that nothing was lost (when that's true).
  - Not "Something went wrong."
  - Instead: "That didn't go through. Check your connection and try again. Nothing you did was lost."
- **Finishes are calm.** A number, one sentence, the next step. No confetti words ("Amazing!!", "Crushing it").
- **Reminders invite; they never guilt-trip.** No "you'll lose", no countdowns, no exclamation marks.
  - "Your 12-day streak is still on. One short lesson keeps it that way."
- **Buttons are verbs that say what happens:** "Start mission", "Make a plan", "Leave", not "OK" or "Submit".
- **Texts the tests check word for word stay put.** Change them only together with the test.

## Lesson shape

- **3–4.5 minutes.** The validator estimates this from word count, questions and the action. Most lessons have:
  - 2 cards: one idea each, about 40–70 words per card;
  - 3 questions of **at least 3 different kinds**:
    - multiple choice;
    - true/false;
    - put in order;
    - estimate;
    - match;
    - work it out;
    - spot the problem;
    - real-life choice.
    The formats are in `units/helpers.js`. Pick the kind that fits the idea: rankings → put in order, calculations → work it out, trade-offs → real-life choice, a realistic text or statement → spot the problem;
  - 1 action at the end, so the learner does something:
    - a tool in the goal simulator;
    - the practice portfolio.
  - After the lesson, the app offers a real-life mission from the same unit (see below), so the real-life step doesn't make the lesson longer.
- **Every question:**
  - is tagged with a concept;
  - explains the right answer in 1–2 sentences (`why`);
  - for multiple choice, says in 1–2 sentences why each wrong option is wrong (`miss`). Don't just repeat the right answer; explain the specific mistake that option represents.
- **Wrong options are plausible mistakes**, not jokes. One obviously silly option per question is the most you should use.
- **Every lesson has an "In real life" line** (`life`): one concrete thing to do this week, shown when the lesson is finished.
- **Every concept has** another way to explain it (`explain`), an easier true/false (`easy`) and a harder multiple-choice (`challenge`).

## Numbers

- **Amounts:** write amounts as `{$US|MX}`. They should be round, realistic local numbers, not conversions ({$400|6000}, not {$400|7400}).
- **Show the math** when a question involves arithmetic: "{$3|45} × 5 days × 52 weeks ≈ {$780|11700}".
- **Check both currencies.** Do the arithmetic for both the US and the Mexico numbers. Avoid peso amounts with cents above 100 (they display rounded).
- **Changeable numbers go in `src/core/facts.js`**, written as `{@name}` in text. That covers rates set by law, limits, deadlines and example rates. Add a row to `docs/FACTS.md` for each one.
- **Label examples as examples.** "An example 7% sales tax", "example brackets — not real tax rates".

## Two countries

- **When the money system differs, write a Mexico version** with `T(en, es, { en, es })`. Common cases:
  - accounts: FDIC vs. IPAB, APY vs. GAT;
  - taxes: W-4 vs. RFC, sales tax vs. IVA;
  - retirement: 401(k)/IRA vs. AFORE/PPR;
  - credit: APR vs. CAT;
  - regulators: SEC/FINRA vs. CNBV/CONDUSEF.
- **The Mexico version must be complete in both English and Spanish.**
- **If the right answer differs by country,** keep the same answer index and write the options so that index is right in both.

## Never personal advice

Northvale teaches how money works; it doesn't tell anyone what to do with theirs.

- **Don't write** "you should buy…", "the best fund is…", "put X% in…", "this coin will…", or "do this with your money".
- **Do write**:
  - "many people…", "a common approach is…";
  - "here's how people evaluate…";
  - "it depends on…, for example…";
  - "check with a trusted adult or a licensed professional for real decisions".
- **Never name** a specific product as something to buy. Real fund and company names may appear only as examples ("well-known examples to practice with — not recommendations").
- **Risky things** (crypto, leverage, options, gambling-style apps) are described accurately, including how they can lose everything. Never present them as opportunities.
- **Never promise.** Write "historically", "has tended to", "can", "not guaranteed". There are no guaranteed returns, and nothing "can't lose".

## Real-life missions

A mission is a small real-life task that goes with a unit. The catalog is `src/modules/missions/catalog.js`, and the validator checks it too.

- **One task, 5–20 minutes or "over a few days".** Start with a verb: "Find…", "Track…", "Ask…", "Spot…".
- **Nothing to hand over.** Never ask someone to share account details, sign up, apply, buy or pay. When a mission sends people to a website, say "just reading — don't apply" and name only official sites.
- **Teens.** Anything that needs a job, an account or a credit history either gets `adult: true` (18+) or a `teen` version that involves a parent or guardian ("they can cover the amounts").
- **Two countries.** Use the Mexico version of `T()` where the money system differs (pay stub → recibo de nómina; APR → CAT), and `only: "MX"` / `only: "US"` for things that exist in one country.
- **The reflection question** (`ask`) is about what they noticed, not their numbers: "What surprised you?", not "How much do you have?"
- **Goals.** `goals: ["car"]` ranks it first for that goal; `needsGoal` hides it without one.
- **Same rules as lessons** for advice, numbers (`{$US|MX}`, `{@fact}`) and promises.

## Accuracy

- Write from official sources: IRS, SSA, FDIC, CFPB, SEC/FINRA, healthcare.gov; SAT, IMSS, CONSAR, Banxico, CONDUSEF, CNBV, INEGI, and the laws themselves (LISR, LFT).
- When a claim comes from one study or report, say so ("according to S&P's SPIVA reports…").
- List anything you're unsure about in `docs/CONTENT-REVIEW.md` under "Please verify" before the lesson ships.

## Before a lesson ships

1. `node scripts/validate-content.mjs` passes: translations, concept tags, explanations, facts, actions and length.
2. Read it aloud in both languages. Cut any sentence you stumble over.
3. Check every number in both countries.
4. Look for advice words: "should", "best", "always", "guaranteed", "will".
5. Try the lesson in the app at phone size.
