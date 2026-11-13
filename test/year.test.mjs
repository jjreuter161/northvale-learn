// YOUR MONEY YEAR: the simulation's math. Every start in both countries, the
// steady path, the three "always the same choice" paths and thousands of
// random paths all end with sensible, finite numbers; the rules (a cushion
// softens an emergency, interest grows a balance, a hot tip can crash) hold;
// and the text for every event and choice is complete in both languages and
// every amount it names exists.
import assert from "node:assert/strict";
import { newRun, play, eventFor, eventVars, steadyRun, biggestSwings, summary, netWorth, STARTS, MONTHS, MARKET, SITUATIONS } from "../src/modules/year/engine.js";
import { EVENTS, STARTS_TEXT, lessonOf } from "../src/modules/year/content.js";
import { ALL_LESSONS } from "../src/modules/lessons/content.js";
import { fill, pick } from "../src/core/i18n.js";

const REGIONS = ["US", "MX"];
const sane = (r, where) => {
  for (const k of ["cash", "savings", "invested", "hot", "debt", "credit", "peace", "income", "rent", "essentials"]) assert.ok(Number.isFinite(r[k]), `${where}: ${k} is ${r[k]}`);
  assert.ok(r.cash >= 0, `${where}: cash ${r.cash}`);
  assert.ok(r.debt >= 0, `${where}: debt ${r.debt}`);
  assert.ok(r.savings >= 0 && r.invested >= 0 && r.hot >= 0, `${where}: a balance went negative`);
  assert.ok(r.peace >= 0 && r.peace <= 100 && r.credit >= 0 && r.credit <= 100, `${where}: a meter left 0–100`);
  assert.ok(r.income > 0 && r.rent >= 0 && r.essentials >= 0, `${where}: income or costs`);
  assert.equal(Number.isInteger(r.cash) && Number.isInteger(r.debt) && Number.isInteger(r.savings), true, `${where}: whole units`);
};
const runWith = (start, region, pickChoice) => {
  let r = newRun(start, region);
  while (r.month < MONTHS) {
    sane(r, `${start}/${region} month ${r.month}`);
    r = play(r, pickChoice(r.month), EVENTS).run;
  }
  sane(r, `${start}/${region} end`);
  return r;
};

// Every start, every country: 12 months, the steady path and the uniform paths.
for (const start of STARTS)
  for (const region of REGIONS) {
    for (const c of [0, 1, 2]) assert.equal(runWith(start, region, () => c).month, MONTHS);
    const steady = steadyRun(start, region, EVENTS);
    assert.equal(steady.month, MONTHS);
    assert.ok(steady.peace >= 40, `${start}/${region}: the steady path ends calm (${steady.peace})`);
    assert.ok(netWorth(steady) > newRun(start, region).startNet, `${start}/${region}: the steady path ends better off than it started`);
  }
console.log("ok: every start in both countries plays all 12 months on the steady path and on always-first/second/third choices, with finite numbers and meters inside their range");

// A deterministic stream of random choices (no Math.random: the same every run).
let seed = 20261113;
const rand = () => ((seed = (seed * 1664525 + 1013904223) % 4294967296) / 4294967296);
for (const start of STARTS) for (const region of REGIONS) for (let i = 0; i < 4000; i++) runWith(start, region, () => Math.floor(rand() * 3));
console.log("ok: 32,000 random paths all end with whole, non-negative balances and sensible meters");

// The rules.
{
  // A cushion softens an emergency: same bill, with and without savings.
  const base = (savings) => {
    let r = { ...newRun("firstjob", "US"), month: 3, cash: 0, savings };
    return play(r, 0, EVENTS).report;
  };
  const withFund = base(2000);
  const without = base(0);
  assert.ok(withFund.after.peace > without.after.peace + 4, "an emergency hurts more without a fund");
  assert.ok(without.after.debt > withFund.after.debt, "without savings the rest lands on the card");
  // Interest grows a balance that isn't paid down; paying extra beats paying the minimum.
  const owing = { ...newRun("moveout", "US"), month: 10 };
  const minimum = play(owing, 0, EVENTS).run;
  const extra = play(owing, 1, EVENTS).run;
  assert.ok(extra.debt < minimum.debt, "paying extra leaves a smaller balance");
  assert.ok(extra.cash < minimum.cash, "…and costs cash now");
  assert.equal(eventFor(owing, EVENTS).id, "debt");
  assert.equal(eventFor({ ...newRun("firstjob", "US"), month: 10 }, EVENTS).id, "nodebt", "no balance: the credit-history version");
  // Saving automatically really saves; a hot tip really can crash; an index fund dips and recovers.
  const saver = runWith("firstjob", "US", (m) => (m === 0 ? 1 : 1));
  assert.ok(saver.savings > 0);
  const hotRun = runWith("firstjob", "US", (m) => (m === 5 ? 2 : 1));
  assert.ok(hotRun.hot < 150, "the hot tip lost most of its money by the end");
  assert.ok(MARKET[4] < 1 && MARKET[10] > 1, "the example market dips in spring and recovers");
  // A raise spent as a lifestyle upgrade leaves less saved than saving half.
  const spend = runWith("firstjob", "US", (m) => (m === 6 ? 0 : 1));
  const keep = runWith("firstjob", "US", (m) => (m === 6 ? 1 : 1));
  assert.ok(keep.savings > spend.savings, "saving half the raise beats spending it");
  // A scam payment loses the fee and some peace; reporting it doesn't.
  const paid = runWith("firstjob", "US", (m) => (m === 7 ? 0 : 1));
  const reported = runWith("firstjob", "US", (m) => (m === 7 ? 2 : 1));
  assert.ok(reported.peace > paid.peace && netWorth(reported) > netWorth(paid));
  // Mexico's year-end is the aguinaldo (15 days: half a month's pay); the US bonus is smaller.
  const mx = { ...newRun("firstjob", "MX"), month: 11 };
  assert.equal(eventVars(mx, eventFor(mx, EVENTS)).bonus, Math.round(mx.income / 2));
  const us = { ...newRun("firstjob", "US"), month: 11 };
  assert.ok(eventVars(us, eventFor(us, EVENTS)).bonus < us.income / 2);
  console.log("ok: the rules hold: a cushion softens an emergency, interest grows a balance, extra payments help, a hot tip can crash, a raise saved beats a raise spent, a scam costs, the aguinaldo");
}

// The end screen: you against the steady path, and the months that mattered most.
{
  const mine = runWith("moveout", "US", (m) => 0);
  const steady = steadyRun("moveout", "US", EVENTS);
  assert.ok(netWorth(steady) > netWorth(mine), "the steady path beats always taking the first choice, from a hard start");
  const swings = biggestSwings(mine, EVENTS, 2);
  assert.ok(swings.length >= 1 && swings.length <= 2 && swings[0].gain > 0);
  assert.ok(swings.every((s) => s.month >= 0 && s.month < MONTHS && EVENTS[s.month].some((e) => e.id === s.event)));
  assert.deepEqual(biggestSwings(steady, EVENTS), [], "nothing to improve on the steady path");
  assert.ok(Number.isFinite(summary(mine).change));
  console.log("ok: the end screen compares your year with the steady path and finds the months that mattered most");
}

// Every event and choice is complete in both languages (and Mexico's versions), every
// amount named exists, every lesson link is real, every month has the same three choices.
{
  const lessonIds = new Set(ALL_LESSONS.map((l) => l.id));
  assert.equal(EVENTS.length, MONTHS);
  const text = (x, where, vars) => {
    for (const lang of ["en", "es"]) for (const region of REGIONS) {
      const raw = pick(x, lang, region);
      assert.ok(typeof raw === "string" && raw.trim(), `${where}: no ${lang}/${region} text`);
      const out = fill(raw, { lang, region }, vars);
      assert.doesNotMatch(out, /[{}]/, `${where} (${lang}/${region}): ${out.slice(0, 80)}`);
    }
  };
  for (const st of STARTS) (text(STARTS_TEXT[st].title, `${st} title`, {}), text(STARTS_TEXT[st].body, `${st} body`, {}));
  assert.deepEqual(Object.keys(STARTS_TEXT).sort(), [...STARTS].sort());
  assert.deepEqual(Object.keys(SITUATIONS).sort(), [...STARTS].sort());
  EVENTS.forEach((variants, m) =>
    variants.forEach((e) => {
      assert.ok(lessonIds.has(e.lesson), `${e.id}: lesson ${e.lesson} exists`);
      assert.equal(lessonOf(e.id), e.lesson);
      assert.equal(e.choices.length, 3, `${e.id}: three choices`);
      assert.equal(e.choices.filter((c) => c.steady).length, 1, `${e.id}: exactly one steady choice`);
      for (const region of REGIONS) {
        const r = { ...newRun("firstjob", region), month: m };
        const vars = Object.fromEntries(Object.entries(eventVars(r, e)).map(([k, v]) => [k, String(v)]));
        text(e.title, `${e.id} title`, vars);
        text(e.body, `${e.id} body`, vars);
        e.choices.forEach((c, i) => (text(c.label, `${e.id} choice ${i + 1}`, vars), text(c.result, `${e.id} result ${i + 1}`, vars)));
      }
    })
  );
  console.log("ok: the 12 months' text is complete in English, Spanish and Mexico's versions; every amount, lesson link and steady choice is there");
}
