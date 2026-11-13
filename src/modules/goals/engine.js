// THE GOAL SIMULATOR'S MATH. Monthly steps: growth on what's there, then
// this month's saving. Every rate is an example the user can change —
// savings rates move, and stock returns are never guaranteed.

import { fact } from "../../core/facts.js";

export const PATHS = ["cash", "save", "invest"];
// Example yearly rates. "save" is a savings account (US) or CETES (MX);
// "invest" is a broad index fund, with a worse/better range around it.
export function exampleRates(region, cetesRate) {
  return { cash: 0, save: region === "MX" ? cetesRate ?? fact("cetesExampleRate") : fact("savingsExampleRate"), invest: fact("indexExampleRate"), investLow: fact("indexRangeLow"), investHigh: fact("indexRangeHigh") };
}

const r = (pct) => pct / 100 / 12;

// Balance after each month: [start, after 1, …, after `months`].
export function grow({ start = 0, monthly = 0, months, annualPct = 0 }) {
  const out = [start];
  let b = start;
  for (let i = 0; i < months; i++) {
    b = b * (1 + r(annualPct)) + monthly;
    out.push(b);
  }
  return out;
}

// Months until `target` (null if it never gets there within `cap`).
export function monthsTo({ start = 0, monthly, target, annualPct = 0, cap = 600 }) {
  if (start >= target) return 0;
  let b = start;
  for (let i = 1; i <= cap; i++) {
    b = b * (1 + r(annualPct)) + monthly;
    if (b >= target - 0.005) return i;
  }
  return null;
}

// Monthly saving needed to reach `target` in `months`.
export function monthlyFor({ start = 0, target, months, annualPct = 0 }) {
  if (months <= 0) return Math.max(0, target - start);
  const g = r(annualPct);
  const grown = start * Math.pow(1 + g, months);
  const factor = g ? (Math.pow(1 + g, months) - 1) / g : months;
  return Math.max(0, (target - grown) / factor);
}

// Paying off a balance: interest each month on what's owed, then the
// payment. Never, if the payment doesn't cover the interest.
export function payoff({ balance, aprPct, payment, cap = 600 }) {
  let b = balance;
  let interest = 0;
  const path = [b];
  if (payment <= b * r(aprPct)) return { months: null, interest: null, never: true, path };
  for (let i = 1; i <= cap; i++) {
    const it = b * r(aprPct);
    interest += it;
    b = b + it - payment;
    path.push(Math.max(0, b));
    if (b <= 0.005) return { months: i, interest, never: false, path, lastPayment: payment + b };
  }
  return { months: null, interest, never: true, path };
}

// Start saving at two ages, keep going until `until`.
export function startEarly({ monthly, ages, until = 60, annualPct = fact("indexExampleRate") }) {
  return ages.map((age) => {
    const months = Math.max(0, (until - age) * 12);
    const values = grow({ monthly, months, annualPct });
    return { age, months, value: values[values.length - 1], putIn: monthly * months, values };
  });
}

// Retirement with extra contributions on top of yours (an employer match,
// or the employer + government part of an AFORE) as a % of yours.
export function retirement({ monthly, extraPct = 0, age, until = fact("retirementAge"), annualPct = fact("indexExampleRate") }) {
  const months = Math.max(0, (until - age) * 12);
  const yours = grow({ monthly, months, annualPct });
  const withExtra = grow({ monthly: monthly * (1 + extraPct / 100), months, annualPct });
  return { months, yours: yours[months], withExtra: withExtra[months], putIn: monthly * months, extraIn: monthly * (extraPct / 100) * months };
}

// ---- Real-life tools (life.jsx) ----
const cents2 = (n) => Math.round(n * 100) / 100;
// PAYCHECK — what comes out of a gross amount at the given rates ({ name: % }).
export function paycheck(gross, rates) {
  const items = Object.entries(rates).map(([k, pct]) => [k, cents2((gross * pct) / 100)]);
  const deductions = cents2(items.reduce((t, [, v]) => t + v, 0));
  return { items, deductions, net: cents2(gross - deductions) };
}
// Sales tax added at the register (US) vs. IVA already in the price (MX).
export const withTaxAdded = (price, pct) => cents2(price * (1 + pct / 100));
export const taxInside = (price, pct) => cents2(price - price / (1 + pct / 100));
// BRACKETS — progressive tax: each rate applies only to the slice of income
// inside its bracket. brackets: [[upTo, %], …, [Infinity, %]].
export function bracketTax(income, brackets) {
  let prev = 0;
  let total = 0;
  const rows = [];
  for (const [upTo, pct] of brackets) {
    const part = Math.max(0, Math.min(income, upTo) - prev);
    rows.push({ from: prev, upTo, pct, part, tax: (part * pct) / 100 });
    total += (part * pct) / 100;
    prev = upTo;
    if (income <= upTo) break;
  }
  return { rows, total: cents2(total), effective: income ? (total / income) * 100 : 0 };
}
// BANK FEES — a year with an account.
export const accountYear = ({ monthly = 0, waived = false, atmFee = 0, atmPerMonth = 0 }) => (waived ? 0 : monthly) * 12 + atmFee * atmPerMonth * 12;
// INSURANCE — a year: premiums, plus what you pay before coverage starts
// (simplified: no coinsurance or out-of-pocket maximum).
export const insuranceYear = ({ premium, deductible }, costs) => premium * 12 + Math.min(costs, deductible);
// SIDE HUSTLE — a week's revenue, profit and profit per hour worked.
export function hustle({ price, cost, perWeek, hours }) {
  const profit = (price - cost) * perWeek;
  return { revenue: price * perWeek, profit, perHour: hours * perWeek ? profit / (hours * perWeek) : 0 };
}
// SWINGS — a made-up path: each month moves by drift% plus up to ±range%,
// from a seed (the same seed gives the same path). Biggest drop from a
// high, too.
export function swingPath(start, rangePct, seed, months = 12, driftPct = 0) {
  let x = seed;
  const rnd = () => (x = (x * 9301 + 49297) % 233280) / 233280;
  const pts = [start];
  for (let i = 0; i < months; i++) pts.push(Math.max(0, pts[i] * (1 + (driftPct + (rnd() * 2 - 1) * rangePct) / 100)));
  let high = start;
  let drop = 0;
  for (const p of pts) (high = Math.max(high, p)), (drop = Math.max(drop, high ? (high - p) / high : 0));
  return { pts, end: pts[pts.length - 1], maxDrop: drop * 100 };
}

// Sending money from the US to Mexico. The fee comes out of what you send;
// what's left is converted at the "fair" rate minus the service's markup. The
// total cost is everything you lose against the fair rate: the fee plus the
// markup, in dollars. (More cost always means fewer pesos arrive.)
export function remit({ amount, fee, markupPct, rate }) {
  const arrives = (amount - fee) * rate * (1 - markupPct / 100);
  const costUsd = amount - arrives / rate;
  return { arrives, fair: amount * rate, costUsd, costPct: amount ? (costUsd / amount) * 100 : 0, youPay: amount };
}
