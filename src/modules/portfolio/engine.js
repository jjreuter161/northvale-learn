// THE PRACTICE PORTFOLIO'S RULES — pretend cash, fractional shares, no
// fees, trades at the latest (delayed or sample) price. Pure functions.
import { UNLOCKS } from "./assets.js";
import { fact } from "../../core/facts.js";

export const START_CASH = { US: fact("startCashUS"), MX: fact("startCashMX") };
export const MIN_TRADE = { USD: 1, MXN: 20 };

export function newPortfolio(region, today) {
  const currency = region === "MX" ? "MXN" : "USD";
  return { currency, cash: START_CASH[region], start: START_CASH[region], holdings: {}, trades: [], watchlist: [], startedAt: today, snapshots: [] };
}

// A price in the portfolio's currency (US-listed assets in a peso
// portfolio go through the dollar rate).
export function priceIn(currency, quote, fx) {
  if (!quote) return null;
  if (quote.currency === currency) return quote.price;
  if (quote.currency === "USD" && currency === "MXN") return quote.price * fx;
  if (quote.currency === "MXN" && currency === "USD") return quote.price / fx;
  return null;
}

const round = (n, d = 2) => Math.round(n * 10 ** d) / 10 ** d;

export function buy(pf, { symbol, amount, price, at }) {
  amount = round(amount);
  if (!(price > 0)) return { error: "no_price" };
  if (!(amount >= MIN_TRADE[pf.currency])) return { error: "too_small" };
  if (amount > pf.cash + 0.001) return { error: "not_enough_cash" };
  const shares = amount / price;
  const h = pf.holdings[symbol] || { shares: 0, cost: 0 };
  return {
    pf: {
      ...pf,
      cash: round(pf.cash - amount),
      holdings: { ...pf.holdings, [symbol]: { shares: h.shares + shares, cost: round(h.cost + amount) } },
      trades: [{ id: `${at}-${symbol}-b`, at, symbol, side: "buy", shares, price, amount }, ...pf.trades].slice(0, 200),
    },
    shares,
  };
}

// Sell `amount` worth (or everything with all: true).
export function sell(pf, { symbol, amount, all, price, at }) {
  const h = pf.holdings[symbol];
  if (!h || h.shares <= 0) return { error: "nothing_to_sell" };
  if (!(price > 0)) return { error: "no_price" };
  const worth = h.shares * price;
  const proceeds = round(all ? worth : Math.min(amount, worth));
  if (!all && !(proceeds >= MIN_TRADE[pf.currency])) return { error: "too_small" };
  const shares = all || proceeds >= worth - 0.005 ? h.shares : proceeds / price;
  const left = h.shares - shares;
  const costOut = h.cost * (shares / h.shares);
  const holdings = { ...pf.holdings };
  if (left <= 1e-9) delete holdings[symbol];
  else holdings[symbol] = { shares: left, cost: round(h.cost - costOut) };
  return {
    pf: { ...pf, cash: round(pf.cash + proceeds), holdings, trades: [{ id: `${at}-${symbol}-s`, at, symbol, side: "sell", shares, price, amount: proceeds }, ...pf.trades].slice(0, 200) },
    proceeds,
  };
}

// What it's all worth now. `prices` are already in the portfolio's currency.
export function valuation(pf, prices) {
  const positions = Object.entries(pf.holdings).map(([symbol, h]) => {
    const p = prices[symbol];
    const value = p == null ? h.cost : h.shares * p;
    return { symbol, shares: h.shares, cost: h.cost, value, gain: value - h.cost, gainPct: h.cost ? ((value - h.cost) / h.cost) * 100 : 0, priced: p != null };
  });
  const invested = positions.reduce((t, x) => t + x.value, 0);
  const total = pf.cash + invested;
  positions.forEach((x) => (x.share = total ? x.value / total : 0));
  positions.sort((a, b) => b.value - a.value);
  return { cash: pf.cash, invested, total, change: total - pf.start, changePct: ((total - pf.start) / pf.start) * 100, positions };
}

// One point a day for the value chart.
export function snapshot(pf, today, total) {
  const snaps = pf.snapshots.filter((s) => s[0] !== today);
  return { ...pf, snapshots: [...snaps, [today, round(total)]].slice(-400) };
}

export function unlocked(progress, type) {
  return !!(progress.lessons[UNLOCKS[type]] && progress.lessons[UNLOCKS[type]].done);
}
