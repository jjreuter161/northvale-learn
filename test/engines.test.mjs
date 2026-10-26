// The rules that matter, checked without a browser: XP and streaks,
// money formatting, the practice portfolio's math, the goal simulator's
// math, sample prices, RSS parsing — and that every lesson is complete in
// both languages and ends with an action some module actually provides.
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { join } from "node:path";
import * as P from "../src/core/progress.js";
import { money, fill, pick, text } from "../src/core/i18n.js";
import { UNITS, ALL_LESSONS, lessonState, nextLesson } from "../src/modules/lessons/content.js";
import { UNLOCKS, ASSETS } from "../src/modules/portfolio/assets.js";
import { newPortfolio, buy, sell, valuation, priceIn, unlocked } from "../src/modules/portfolio/engine.js";
import { sampleHistory, sampleQuote, cetesPrice } from "../src/modules/portfolio/sample.js";
import { grow, monthsTo, monthlyFor, payoff, startEarly, retirement } from "../src/modules/goals/engine.js";
import { parseRss } from "../server/news.js";

// --- XP, levels, streaks, freezes, badges ---
assert.deepEqual([0, 49, 50, 149, 150, 300].map((x) => P.level(x).level), [1, 1, 2, 2, 3, 4]);
let p = P.newProgress();
let r = P.completeLesson(p, { id: "a", perfect: true }, "2026-10-05");
assert.equal(r.gained, 15, "first lesson, perfect: 10 + 5");
assert.equal(r.p.streak.count, 1);
r = P.completeLesson(r.p, { id: "b", perfect: false }, "2026-10-05");
assert.equal(r.gained, 10);
assert.equal(r.p.streak.count, 1, "same day doesn't add to the streak");
r = P.completeLesson(r.p, { id: "a", perfect: true }, "2026-10-06");
assert.equal(r.gained, 5, "replaying a finished lesson: 5");
assert.equal(r.p.streak.count, 2);
assert.equal(P.xpOn(r.p, "2026-10-05"), 25);
assert.equal(P.weekXp(r.p, "2026-10-07"), 30, "Mon 5th–Sun 11th");
console.log("ok: XP per lesson, replays, streak days, weekly XP");

// One missed day, one freeze: covered. Then today's lesson extends it.
let s = P.settleStreak(r.p, "2026-10-08");
assert.equal(s.event.type, "freeze_used");
assert.equal(s.p.freezes, 0);
assert.equal(s.p.streak.count, 2);
assert.deepEqual(s.p.streak.frozen, ["2026-10-07"]);
r = P.completeLesson(s.p, { id: "c" }, "2026-10-08");
assert.equal(r.p.streak.count, 3);
// Two missed days, no freezes left: it starts over, best is kept.
s = P.settleStreak(r.p, "2026-10-11");
assert.deepEqual(s.event, { type: "streak_reset", lost: 3 });
assert.equal(s.p.streak.count, 0);
assert.equal(s.p.streak.best, 3);
assert.equal(P.completeLesson(s.p, { id: "d" }, "2026-10-11").p.streak.count, 1);
assert.equal(P.settleStreak(P.newProgress(), "2026-10-11").event, null, "no streak, nothing to settle");
// A freeze every 7 days, at most 2.
let q = P.newProgress();
for (let d = 1; d <= 14; d++) q = P.completeLesson(q, { id: `l${d}` }, `2026-11-${String(d).padStart(2, "0")}`).p;
assert.equal(q.streak.count, 14);
assert.equal(q.freezes, 2, "1 to start + 1 at day 7, capped at 2 by day 14");
console.log("ok: freezes cover missed days, streak resets kindly, freezes earned and capped");

let pr = P.practiced(P.newProgress(), "trade", "2026-10-05");
assert.equal(pr.gained, 5);
pr = P.practiced(pr.p, "trade", "2026-10-05");
assert.equal(pr.gained, 0, "practice XP once a day per kind");
assert.equal(pr.p.counters.trade, 2);
const b = P.awardBadges(pr.p, { holdings: 3 }, "2026-10-05");
assert.deepEqual(b.fresh.sort(), ["diversified", "first_trade"]);
assert.deepEqual(P.awardBadges(b.p, { holdings: 3 }, "2026-10-06").fresh, [], "badges are earned once");
const ms = P.awardBadges(b.p, { holdings: 3, milestone: 50 }, "2026-10-07");
assert.deepEqual(ms.fresh.sort(), ["ms_25", "ms_50"], "goal milestones are achievements");
assert.equal(ms.p.xp, b.p.xp, "and give no XP");
console.log("ok: practice XP and badges; goal milestones give achievements, not XP");

// --- Money and text ---
assert.equal(money(1000, { lang: "es", region: "MX" }), "$1,000");
assert.equal(money(10000, { lang: "en", region: "US" }), "$10,000");
assert.equal(money(12.5, { lang: "en", region: "US" }), "$12.50");
assert.match(money(50, { lang: "es", region: "MX", currency: "USD" }), /USD$/);
assert.equal(fill("{$50|1000} a month", { lang: "en", region: "MX" }), "$1,000 a month");
assert.equal(fill("{n} {n|day|days}", { lang: "en", region: "US" }, { n: 1 }), "1 day");
assert.equal(pick({ en: "401(k)", es: "401(k)", MX: { en: "AFORE", es: "AFORE" } }, "es", "MX"), "AFORE");
assert.equal(pick({ en: "a", es: "b" }, "es", "MX"), "b", "no MX version → the language's text");
console.log("ok: pesos and dollars, amounts by region, plurals, Mexico overrides");

// --- The course order (the content itself: test/content.test.mjs) ---
let prog = P.newProgress();
assert.equal(lessonState(prog, ALL_LESSONS[0].id), "open");
assert.equal(lessonState(prog, ALL_LESSONS[1].id), "locked");
prog = P.completeLesson(prog, { id: ALL_LESSONS[0].id }, "2026-10-05").p;
assert.equal(nextLesson(prog).id, ALL_LESSONS[1].id);
// Starting where your goal points ("get out of debt" → Debt & credit).
const debtStart = { ...P.newProgress(), startUnit: P.START_UNITS.debt };
assert.equal(nextLesson(debtStart).id, "credit-1");
assert.equal(lessonState(debtStart, "budget-1"), "open", "earlier units stay open");
assert.equal(lessonState(debtStart, "credit-2"), "locked", "in order within a unit");
assert.equal(lessonState(debtStart, "compound-1"), "locked", "later units open as you go");
const debtDone = ["credit-1", "credit-2", "credit-3"].reduce((p, id) => P.completeLesson(p, { id }, "2026-10-05").p, debtStart);
assert.equal(lessonState(debtDone, "scams-1"), "open", "the next unit opens");
assert.equal(nextLesson(debtDone).id, "scams-1");
// Someone already further along (from before new units were added) keeps
// everything they'd reached open, and finishes the unit they're in first.
const veteran = ["budget-1", "budget-2", "budget-3", "save-1", "save-2", "save-3", "stocks-1"].reduce((p, id) => P.completeLesson(p, { id }, "2026-10-05").p, { ...P.newProgress(), startUnit: "budget" });
assert.equal(lessonState(veteran, "stocks-2"), "open", "the unit they were in");
assert.equal(lessonState(veteran, "credit-1"), "open", "units before it, old or new");
assert.equal(lessonState(veteran, "taxes-1"), "open");
assert.equal(lessonState(veteran, "taxes-2"), "locked", "still in order within a unit");
assert.equal(lessonState(veteran, "etf-1"), "locked", "later units still open one by one");
assert.equal(nextLesson(veteran).id, "stocks-2", "finish the unit in progress first");
// The glossary too, and every {@fact} it or the lessons use exists.
const { GLOSSARY } = await import("../src/modules/tutor/glossary.js");
for (const lang of ["en", "es"])
  for (const region of ["US", "MX"])
    for (const g of GLOSSARY) for (const v of [g.simple, g.expert]) assert.doesNotMatch(text(v, { lang, region }), /\{|\}/, `glossary ${g.keys[0]}: unfilled placeholder`);
console.log("ok: the course opens unit by unit, starting where your goal points; the glossary is complete");

// --- Practice portfolio ---
let pf = newPortfolio("MX", "2026-10-05");
assert.equal(pf.cash, 200000);
assert.equal(pf.currency, "MXN");
assert.equal(priceIn("MXN", { price: 500, currency: "USD" }, 18), 9000, "a dollar asset in a peso portfolio");
assert.equal(buy(pf, { symbol: "VOO", amount: 5, price: 9000, at: "t" }).error, "too_small");
assert.equal(buy(pf, { symbol: "VOO", amount: 300000, price: 9000, at: "t" }).error, "not_enough_cash");
let t1 = buy(pf, { symbol: "VOO", amount: 18000, price: 9000, at: "t1" });
assert.equal(t1.shares, 2);
assert.equal(t1.pf.cash, 182000);
let v = valuation(t1.pf, { VOO: 9900 });
assert.equal(v.total, 182000 + 19800);
assert.equal(Math.round(v.positions[0].gainPct), 10);
const half = sell(t1.pf, { symbol: "VOO", amount: 9900, price: 9900, at: "t2" });
assert.equal(half.pf.holdings.VOO.shares, 1);
assert.equal(half.pf.holdings.VOO.cost, 9000);
const out = sell(half.pf, { symbol: "VOO", all: true, price: 9900, at: "t3" });
assert.equal(out.pf.holdings.VOO, undefined);
assert.equal(out.pf.cash, 201800);
assert.equal(unlocked(P.newProgress(), "etf"), false);
assert.equal(unlocked({ lessons: { [UNLOCKS.etf]: { done: true } } }, "etf"), true);
console.log("ok: practice buys, sells, peso/dollar prices, gains, unlocks");

const h1 = sampleHistory("VOO", new Date("2026-10-23T12:00:00"));
const h2 = sampleHistory("VOO", new Date("2026-10-23T12:00:00"));
assert.deepEqual(h1, h2, "sample prices are the same every time");
assert.ok(h1.length > 200 && h1.every((x) => x[1] > 0));
assert.ok(ASSETS.filter((a) => !a.simulated).every((a) => sampleQuote(a.symbol, new Date("2026-10-23T12:00:00"))), "every asset has a sample price");
assert.ok(cetesPrice("2026-10-24", 7) > cetesPrice("2026-10-23", 7));
console.log("ok: sample prices are stable; CETES accrue daily");

// --- Goal simulator ---
assert.deepEqual(grow({ start: 100, monthly: 0, months: 2, annualPct: 0 }), [100, 100, 100]);
const need = monthlyFor({ target: 5000, months: 36, annualPct: 5 });
assert.equal(monthsTo({ monthly: need + 0.01, target: 5000, annualPct: 5 }), 36, "monthlyFor and monthsTo agree");
assert.ok(monthlyFor({ target: 5000, months: 36, annualPct: 7 }) < monthlyFor({ target: 5000, months: 36, annualPct: 0 }), "growth means saving less each month");
assert.equal(monthsTo({ monthly: 0, target: 10 }), null, "never gets there");
assert.equal(payoff({ balance: 1000, aprPct: 24, payment: 20 }).never, true, "payment below interest never pays off");
const debt = payoff({ balance: 1000, aprPct: 24, payment: 50 });
assert.ok(debt.months > 20 && debt.months < 30 && debt.interest > 200 && debt.interest < 300);
assert.ok(payoff({ balance: 1000, aprPct: 24, payment: 100 }).interest < debt.interest / 2);
const [early, late] = startEarly({ monthly: 50, ages: [16, 26], until: 60 });
assert.ok(early.value > late.value * 1.8, "ten more years roughly doubles it at 7%");
const ret = retirement({ monthly: 100, extraPct: 50, age: 22 });
assert.ok(Math.abs(ret.withExtra / ret.yours - 1.5) < 1e-9);
console.log("ok: goal timelines, monthly needed, debt payoff, starting early, retirement");

// --- RSS ---
const items = parseRss(`<rss><channel><item><title><![CDATA[Banxico baja la tasa &amp; los CETES]]></title><link>https://example.com/a</link><pubDate>Fri, 23 Oct 2026 22:21:36 +0000</pubDate><description>Uno &lt;b&gt;dos&lt;/b&gt;</description></item><item><title>No link</title></item></channel></rss>`, "Test");
assert.equal(items.length, 1);
assert.equal(items[0].title, "Banxico baja la tasa & los CETES");
assert.equal(items[0].description, "Uno dos");
assert.equal(items[0].published, "2026-10-23T22:21:36.000Z");
console.log("ok: RSS headlines parsed (CDATA, entities, dates); items without links skipped");
