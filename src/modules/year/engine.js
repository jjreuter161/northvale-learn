// YOUR MONEY YEAR — the math. A one-year simulation, one month per turn:
// each month brings one decision (events in content.js), then the month
// settles: pay arrives, rent and essentials go out, savings are set aside,
// the card's interest piles up, the market moves. Choices carry forward.
// Pure and deterministic (no randomness), so every path can be tested and
// the "steady path" can be played for the end-of-year comparison. Every
// number is an example (core/facts.js has the rates).
import { fact } from "../../core/facts.js";

export const STARTS = ["student", "firstjob", "family", "moveout"];
export const MONTHS = 12;

// [US dollars, Mexican pesos]
export const amt = (x, region) => (Array.isArray(x) ? x[region === "MX" ? 1 : 0] : x);
const clamp = (v, lo = 0, hi = 100) => Math.max(lo, Math.min(hi, v));
const r0 = (v) => Math.round(v);

// Where each start begins: monthly pay after tax, rent (or what you put in at
// home), essentials, cash, savings, card balance, and a first credit and peace.
export const SITUATIONS = {
  student: { income: [900, 8000], rent: [350, 2500], essentials: [300, 2500], cash: [400, 4000], savings: [0, 0], debt: [0, 0], credit: 45 },
  firstjob: { income: [2400, 14000], rent: [900, 4500], essentials: [600, 3500], cash: [600, 5000], savings: [0, 0], debt: [0, 0], credit: 50 },
  family: { income: [1500, 9000], rent: [150, 1500], essentials: [350, 2500], cash: [800, 5000], savings: [300, 2000], debt: [0, 0], credit: 45 },
  moveout: { income: [2200, 12500], rent: [1100, 5500], essentials: [550, 3200], cash: [500, 4000], savings: [0, 0], debt: [600, 6000], credit: 50 },
};

// A made-up market that dips in the spring and recovers (index funds), and a
// made-up "hot tip" that crashes: month by month multipliers, to teach the shape.
export const MARKET = [1.01, 1.0, 1.02, 0.97, 0.94, 0.96, 1.03, 1.02, 1.01, 1.03, 1.02, 1.01];
export const HOT = [1, 1, 1, 1, 1, 1, 1, 0.7, 0.85, 0.9, 0.95, 1];

export function newRun(start, region) {
  const s = SITUATIONS[start];
  if (!s) throw new Error(`unknown start: ${start}`);
  const a = (x) => amt(x, region);
  return {
    v: 1,
    start,
    region: region === "MX" ? "MX" : "US",
    month: 0,
    cash: a(s.cash),
    savings: a(s.savings),
    invested: 0,
    hot: 0,
    debt: a(s.debt),
    credit: s.credit,
    peace: 60,
    income: a(s.income),
    rent: a(s.rent),
    essentials: a(s.essentials),
    autoSavePct: 0,
    extraSave: 0,
    investMonthly: 0,
    apr: fact(region === "MX" ? "catTypical" : "cardAprTypical") / 100,
    saveRate: fact(region === "MX" ? "cetesExampleRate" : "savingsExampleRate") / 100,
    log: [],
    startNet: a(s.cash) + a(s.savings) - a(s.debt),
  };
}

export const netWorth = (r) => r.cash + r.savings + r.invested + r.hot - r.debt;
// A month's costs, and how many months of them the savings cover.
export const monthlyCosts = (r) => r.rent + r.essentials;
export const fundMonths = (r) => (monthlyCosts(r) ? r.savings / monthlyCosts(r) : 0);

// ---- Things a choice can do (each returns a new run) --------------------------------
export const patch = (r, p) => ({ ...r, ...p });
export const feel = (r, d) => ({ ...r, peace: clamp(r.peace + d) });
export const credit = (r, d) => ({ ...r, credit: clamp(r.credit + d) });
// Pay a bill from the places in `order`; anything left goes on the card.
// Returns the new run and what came from where.
export function payFrom(r, cost, order = ["cash", "savings"]) {
  let left = cost;
  const used = { cash: 0, savings: 0, card: 0 };
  let next = r;
  for (const k of order) {
    const take = Math.min(left, Math.max(0, next[k]));
    next = { ...next, [k]: next[k] - take };
    used[k] = take;
    left -= take;
  }
  if (left > 0) {
    used.card = left;
    next = { ...next, debt: next.debt + left };
  }
  return { run: next, used };
}
export const owe = (r, cost) => ({ ...r, debt: r.debt + cost });
// Pay down the card from cash, then savings (as much as you ask and have).
export function payDebt(r, want, order = ["cash"]) {
  let left = Math.min(want, r.debt);
  let next = r;
  for (const k of order) {
    const take = Math.min(left, Math.max(0, next[k]));
    next = { ...next, [k]: next[k] - take, debt: next.debt - take };
    left -= take;
  }
  return next;
}

// ---- A month's turn ----------------------------------------------------------------------
// The month settles after the choice: money in, costs out, savings set aside,
// interest, the market, and how it feels.
export function settle(r) {
  let n = { ...r };
  const m = r.month; // 0–11
  n.cash += n.income;
  n.cash -= n.rent + n.essentials;
  // Set aside what was planned, but never more than is there.
  const plan = r0((n.income * n.autoSavePct) / 100) + n.extraSave;
  const save = Math.max(0, Math.min(n.cash, plan));
  n.cash -= save;
  n.savings += save;
  const inv = Math.max(0, Math.min(n.cash, n.investMonthly));
  n.cash -= inv;
  n.invested += inv;
  // Interest: the card costs, savings earn.
  n.debt = r0(n.debt * (1 + n.apr / 12));
  n.savings = r0(n.savings * (1 + n.saveRate / 12));
  // The card's minimum is paid from cash if there is any.
  let late = false;
  if (n.debt > 0) {
    const minimum = Math.min(n.debt, Math.max(r.region === "MX" ? 250 : 25, r0(n.debt * 0.03)));
    const pay = Math.min(minimum, Math.max(0, n.cash));
    n.cash -= pay;
    n.debt -= pay;
    late = pay < minimum;
  }
  // Short of cash: the card covers it.
  let borrowed = false;
  if (n.cash < 0) {
    n.debt += -n.cash;
    n.cash = 0;
    borrowed = true;
  }
  n.invested = r0(n.invested * MARKET[m]);
  n.hot = r0(n.hot * HOT[m]);
  // How it feels: a cushion helps, a card balance and a shortfall hurt.
  let dp = 0;
  if (fundMonths(n) >= 1) dp += 2;
  else if (n.savings <= 0) dp -= 1;
  if (n.debt > n.income * 2) dp -= 2;
  if (borrowed) dp -= 3;
  if (late) dp -= 3;
  n = feel(n, dp);
  // Credit health: on-time payments build it, a heavy balance or a late payment hurts.
  let dc = 0;
  if (n.debt > 0 && !late) dc += 1;
  if (n.debt > n.income * 1.5) dc -= 2;
  if (late) dc -= 3;
  if (borrowed) dc -= 1;
  n = credit(n, dc);
  return { ...n, month: m + 1 };
}

// The numbers the person sees: before and after the month.
export const snapshot = (r) => ({ cash: r.cash, savings: r.savings, invested: r.invested + r.hot, debt: r.debt, credit: r.credit, peace: r.peace, net: netWorth(r) });

// The event for this month (or null at the end), choosing the variant that fits.
export function eventFor(run, events) {
  if (run.month >= MONTHS) return null;
  return events[run.month].find((e) => !e.when || e.when(run)) || events[run.month][0];
}

// Every number an event's text and choices can use: where you are now, the
// event's own amounts for your country, and anything worked out from your pay.
export function eventVars(run, ev) {
  const fixed = Object.fromEntries(Object.entries(ev.amounts || {}).map(([k, v]) => [k, amt(v, run.region)]));
  return { income: run.income, rent: run.rent, savings: run.savings, debt: run.debt, cash: run.cash, ...fixed, ...(ev.derive ? ev.derive(run) : {}) };
}

// What a choice does, then the month settles. Returns the next run and a report.
export function play(run, choiceIndex, events) {
  const ev = eventFor(run, events);
  if (!ev) throw new Error("the year is over");
  const choice = ev.choices[choiceIndex];
  if (!choice) throw new Error("no such choice");
  const before = snapshot(run);
  const vars = eventVars(run, ev);
  const chosen = choice.effect(run, (k) => vars[k]);
  const after = settle({ ...chosen, log: [...run.log, { m: run.month, e: ev.id, c: choiceIndex }] });
  return { run: after, report: { event: ev.id, choice: choiceIndex, before, after: snapshot(after) } };
}

// The same year, always taking the choice marked `steady`: the comparison on the end screen.
export function steadyRun(start, region, events) {
  let run = newRun(start, region);
  while (run.month < MONTHS) {
    const ev = eventFor(run, events);
    run = play(run, ev.choices.findIndex((c) => c.steady), events).run;
  }
  return run;
}

// A year's "score" for comparing paths: what you're worth plus peace of mind.
const score = (r) => netWorth(r) + r.peace * (r.income / 20);

// Which months cost the most: for each month where you chose differently from
// the steady choice, replay the year with only that month changed, and see
// what it would have been worth. Every event has three choices, so a choice's
// number means the same thing whichever variant of the event came up.
export function biggestSwings(run, events, n = 2) {
  const swings = [];
  for (const x of run.log) {
    const ev = events[x.m].find((e) => e.id === x.e);
    const steadyIndex = ev.choices.findIndex((c) => c.steady);
    if (x.c === steadyIndex) continue;
    let r = newRun(run.start, run.region);
    for (const y of run.log) r = play(r, y.m === x.m ? steadyIndex : y.c, events).run;
    swings.push({ month: x.m, event: x.e, gain: score(r) - score(run) });
  }
  return swings.filter((s) => s.gain > 0).sort((a, b) => b.gain - a.gain).slice(0, n);
}

export const summary = (r) => ({ ...snapshot(r), startNet: r.startNet, change: netWorth(r) - r.startNet, fundMonths: fundMonths(r) });
