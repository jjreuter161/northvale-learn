// GOALS — what a goal is, where it stands against its plan, and what it
// needs. Pure functions (tested in test/goals.test.mjs).
//
// A goal's main number is what you've saved for it (a starting amount plus
// any you record) — cash only. Practice-portfolio investments linked to it
// are shown on a separate line ("with your practice investments"); they
// move with prices, so the plan, the status and milestones don't count on
// them. Its plan = a monthly amount on a path (cash, a savings account /
// CETES, an index fund) from the day it was planned. Each goal keeps the
// currency it was made in. Later a "real accounts" module can feed real
// balances in place of these.
import { addDays, daysBetween } from "../../core/progress.js";
import { exampleRates, grow, monthsTo, monthlyFor } from "./engine.js";

// Starting points per template, for the US and Mexico (amounts are local
// and round, not conversions). `units` = the lessons that help most, in order.
export const TEMPLATES = [
  { id: "emergency", icon: "shield", amount: [1000, 15000], months: 12, path: "save", units: ["save", "banking", "budget", "insurance", "compound"] },
  { id: "car", icon: "car", amount: [5000, 80000], months: 36, path: "save", units: ["budget", "save", "paycheck", "credit", "insurance"] },
  { id: "college", icon: "book", amount: [10000, 100000], months: 48, path: "invest", units: ["save", "paycheck", "compound", "etf", "risk"] },
  { id: "invest", icon: "chart", amount: [500, 5000], months: 6, path: "invest", units: ["compound", "psychology", "stocks", "etf", "risk"] },
  { id: "travel", icon: "globe", amount: [1500, 20000], months: 12, path: "save", units: ["budget", "save", "banking", "scams"] },
  { id: "debt", icon: "card", amount: [2000, 30000], months: 18, path: "cash", units: ["credit", "budget", "banking", "psychology"] },
  { id: "custom", icon: "target", amount: [1000, 15000], months: 12, path: "save", units: ["budget", "save", "banking", "paycheck"] },
];
export const template = (id) => TEMPLATES.find((t) => t.id === id) || TEMPLATES[TEMPLATES.length - 1];
export const MILESTONES = [25, 50, 75, 100];
const AVG_MONTH_DAYS = 30.44;
const cents = (n) => Math.round(n * 100) / 100;

export function addMonths(key, n) {
  const d = new Date(`${key}T12:00:00`);
  const day = d.getDate();
  d.setDate(1);
  d.setMonth(d.getMonth() + n);
  d.setDate(Math.min(day, new Date(d.getFullYear(), d.getMonth() + 1, 0).getDate()));
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
}
export const monthsBetween = (a, b) => daysBetween(a, b) / AVG_MONTH_DAYS;
// Whole calendar months from a to b (Jan 15 → Jul 15 is 6).
export function wholeMonths(a, b) {
  const [y1, m1, d1] = a.split("-").map(Number);
  const [y2, m2, d2] = b.split("-").map(Number);
  return (y2 - y1) * 12 + (m2 - m1) - (d2 < d1 ? 1 : 0);
}

// MONEY — a goal's currency decides its country's example rates (savings
// account vs. CETES). Converting needs the USD/MXN rate; without one, null.
export const currencyOf = (region) => (region === "MX" ? "MXN" : "USD");
export const regionOf = (goal) => (goal.currency === "MXN" ? "MX" : "US");
export function convert(amount, from, to, usdmxn) {
  if (from === to) return amount;
  if (!(usdmxn > 0)) return null;
  return from === "USD" ? amount * usdmxn : amount / usdmxn;
}
// What a goal's linked practice holdings are worth in the goal's currency.
// `positions` = [{ symbol, value }] in `currency` (the portfolio's).
export function linkedValue(goal, positions, currency, usdmxn) {
  const sum = positions.filter((p) => goal.linked.includes(p.symbol)).reduce((t, p) => t + p.value, 0);
  return sum ? convert(sum, currency, goal.currency, usdmxn) || 0 : 0;
}

const rateOf = (goal) => exampleRates(regionOf(goal))[goal.path] ?? 0;
// The plan runs from `planFrom` with `planBase` set aside (a new goal: its
// start; after an edit: what was saved by then).
const planFrom = (g) => g.planFrom || g.createdAt;
const planBase = (g) => g.planBase ?? g.start;

// A new goal and its plan: the monthly amount that reaches the target by
// the date on its path. Milestones the starting amount already passes are
// marked "start" (nothing to celebrate on day one, no achievement).
export function newGoal({ id, templateId = "custom", name, target, months, start = 0, path, today, region = "US" }) {
  const tpl = template(templateId);
  const n = Math.max(1, Math.round(months));
  const g = { id: id || `g${Date.now().toString(36)}`, template: tpl.id, name: String(name || "").trim().slice(0, 40), currency: currencyOf(region), target: Math.max(1, Math.round(target)), start: Math.max(0, start), contributions: [], linked: [], status: "active", createdAt: today, planFrom: today, targetDate: addMonths(today, n), path: path || tpl.path, history: [] };
  g.planBase = g.start;
  g.milestones = Object.fromEntries(MILESTONES.filter((m) => (g.start / g.target) * 100 >= m).map((m) => [m, "start"]));
  return { ...g, monthly: Math.ceil(monthlyFor({ start: g.start, target: g.target, months: n, annualPct: rateOf(g) })) };
}

// Re-plan after an edit (name, amount, date, path): the monthly plan is
// worked out again from today and what's saved by now. Entries stay.
export function replan(goal, changes, today) {
  const g = { ...goal, ...changes };
  const months = Math.max(1, wholeMonths(today, g.targetDate));
  const have = saved(g);
  return { ...g, planFrom: today, planBase: have, monthly: Math.ceil(monthlyFor({ start: have, target: g.target, months, annualPct: rateOf(g) })) };
}

export const saved = (goal) => goal.start + goal.contributions.reduce((t, c) => t + c.amount, 0);
export const progressOf = (goal, linked = 0) => saved(goal) + linked;
export const percentOf = (goal, amount) => Math.max(0, Math.min(100, (amount / goal.target) * 100));
export const monthsLeft = (goal, today) => Math.max(0, wholeMonths(today, goal.targetDate));

// Where the plan says savings should be today: the plan's base plus each
// planned month so far, growing at the path's example rate.
export function expectedNow(goal, today) {
  const m = Math.max(0, wholeMonths(planFrom(goal), today));
  const v = grow({ start: planBase(goal), monthly: goal.monthly, months: m, annualPct: rateOf(goal) });
  return Math.min(goal.target, v[v.length - 1]);
}

// "done" | "paused" | "ahead" | "on_track" | "behind", for an amount saved.
// The room either way is a quarter of a month's plan (or 2% of the target,
// if bigger), so a few dollars don't flip the status.
export function statusOf(goal, amount, today) {
  if (amount >= goal.target) return "done";
  if (goal.status === "paused") return "paused";
  const diff = amount - expectedNow(goal, today);
  const room = Math.max(goal.monthly * 0.25, goal.target * 0.02);
  if (diff > room) return "ahead";
  if (diff < -room) return "behind";
  return "on_track";
}

// Milestones newly passed (25/50/75/100%) — each is marked once.
export function newMilestones(goal, amount) {
  const pct = percentOf(goal, amount);
  return MILESTONES.filter((m) => pct >= m && !goal.milestones[m]);
}

// Everything a screen shows about a goal: saved (cash, the main number,
// which drives status and milestones), and the separate line with linked
// practice investments.
export function standing(goal, linked, today) {
  const s = saved(goal);
  return { saved: s, linked, withInvest: s + linked, pct: percentOf(goal, s), pctWithInvest: percentOf(goal, s + linked), status: statusOf(goal, s, today), fresh: goal.status === "paused" ? [] : newMilestones(goal, s) };
}

// What it takes from here: per month to land on the date, and how long
// it takes at the planned monthly amount on each path. Months left are
// counted the way the plan counts them (its months minus those gone by),
// so "ahead" never needs more than the plan.
export function needs(goal, amount, today) {
  const left = Math.max(0, wholeMonths(planFrom(goal), goal.targetDate) - Math.max(0, wholeMonths(planFrom(goal), today)));
  const rates = exampleRates(regionOf(goal));
  return {
    monthsLeft: left,
    perMonth: amount >= goal.target ? 0 : Math.ceil(monthlyFor({ start: amount, target: goal.target, months: Math.max(1, left), annualPct: rateOf(goal) })),
    byPath: ["cash", "save", "invest"].map((p) => ({ path: p, rate: rates[p], months: monthsTo({ start: amount, monthly: goal.monthly, target: goal.target, annualPct: rates[p] }) })),
  };
}

// The plan as a line from its start to the target date, and savings since
// then, both as [monthIndex, amount] points for a chart.
export function planLine(goal) {
  const months = Math.max(1, wholeMonths(planFrom(goal), goal.targetDate));
  return grow({ start: planBase(goal), monthly: goal.monthly, months, annualPct: rateOf(goal) }).map((v, i) => [i, Math.min(v, goal.target * 1.05)]);
}
export function progressLine(goal) {
  const from = planFrom(goal);
  return (goal.history || []).filter(([d]) => d >= from).map(([d, v]) => [monthsBetween(from, d), v]);
}
// One savings point a day (kept for the chart and the weekly check-in).
export function withHistory(goal, today, amount) {
  const h = (goal.history || []).filter((x) => x[0] !== today);
  return { ...goal, history: [...h, [today, cents(amount)]].slice(-400) };
}
// Savings at (or just before) a day, from the history.
export function progressAt(goal, key) {
  const before = (goal.history || []).filter((x) => x[0] <= key);
  return before.length ? before[before.length - 1][1] : goal.start;
}

// The lessons that help this goal, in order (unit ids).
export const unitsFor = (goal) => template(goal.template).units;

// The first active goal leads (the dashboard's big card, lesson tips).
export const primaryGoal = (goals) => goals.find((g) => g.status !== "paused") || goals[0] || null;

// WEEKLY CHECK-IN — on Sundays: it opens on Sunday and stays until the next
// Sunday (or until answered), for active goals made before that Sunday. It
// sums up the week that ended on that Sunday.
export function lastSunday(key) {
  return addDays(key, -new Date(`${key}T12:00:00`).getDay());
}
export function checkInDue(goals, lastDone, today) {
  const sunday = lastSunday(today);
  return lastDone !== sunday && goals.some((g) => g.status !== "paused" && g.createdAt < sunday);
}
export const weekChange = (goal, sunday) => cents(progressAt(goal, sunday) - progressAt(goal, addDays(sunday, -7)));
