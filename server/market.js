// MARKET DATA for the practice portfolio.
// - With TWELVEDATA_API_KEY: real prices, delayed (Twelve Data's free plan
//   allows 8 requests a minute, 800 a day — so quotes are cached for 15
//   minutes and fetched a few at a time).
// - Without it: the app's sample prices (invented, labeled "sample").
// CETES are always simulated at CETES_RATE (a % a year you set from
// Banxico's latest auction), or a labeled sample rate.
import { ASSETS } from "../src/modules/portfolio/assets.js";
import { sampleQuote, sampleHistory, cetesPrice, SAMPLE_FX, SAMPLE_CETES_RATE } from "../src/modules/portfolio/sample.js";

const KEY = process.env.TWELVEDATA_API_KEY || "";
const BASE = process.env.TWELVEDATA_BASE || "https://api.twelvedata.com";
const PER_MIN = Number(process.env.TWELVEDATA_PER_MINUTE) || 8;
const QUOTE_TTL = 15 * 60000;
const HISTORY_TTL = 12 * 3600000;
const cetes = process.env.CETES_RATE ? { rate: Number(process.env.CETES_RATE), sample: false, asOf: process.env.CETES_RATE_DATE || null } : { rate: SAMPLE_CETES_RATE, sample: true };
const dayKey = (d = new Date()) => d.toISOString().slice(0, 10);

export const marketInfo = () => ({ source: KEY ? "twelvedata" : "sample", delayed: !!KEY });

// Requests allowed per minute, spent as they're used.
let bucket = { left: PER_MIN, resetAt: 0 };
function take(n) {
  const now = Date.now();
  if (now >= bucket.resetAt) bucket = { left: PER_MIN, resetAt: now + 60000 };
  const got = Math.min(n, bucket.left);
  bucket.left -= got;
  return got;
}

async function td(path, params) {
  // The key goes in a header, not the URL, so it never lands in logs.
  const url = `${BASE}${path}?${new URLSearchParams(params)}`;
  const res = await fetch(url, { headers: { Authorization: `apikey ${KEY}` }, signal: AbortSignal.timeout(8000) });
  const data = await res.json();
  if (data && data.status === "error") throw Object.assign(new Error(data.message || "market data error"), { code: data.code });
  return data;
}

const quotes = {}; // symbol → { quote, at }
let fx = null; // { rate, at }
const unavailable = new Set(); // symbols the data plan can't price

function toQuote(symbol, q, currency) {
  const price = Number(q.close);
  const prev = Number(q.previous_close);
  if (!(price > 0)) return null;
  return { symbol, price, prevClose: prev || price, change: prev ? price - prev : 0, changePct: prev ? ((price - prev) / prev) * 100 : 0, currency: q.currency || currency, date: q.datetime || dayKey(), marketOpen: !!q.is_market_open };
}

async function refresh(symbols) {
  const stale = symbols.filter((s) => !unavailable.has(s) && !(quotes[s] && Date.now() - quotes[s].at < QUOTE_TTL));
  const groups = [stale.filter((s) => !ASSETS.find((a) => a.symbol === s).exchange), stale.filter((s) => ASSETS.find((a) => a.symbol === s).exchange === "BMV")];
  for (const [i, group] of groups.entries()) {
    if (!group.length) continue;
    const n = take(group.length);
    if (!n) break;
    const batch = group.slice(0, n);
    try {
      const data = await td("/quote", { symbol: batch.join(","), ...(i === 1 ? { exchange: "BMV" } : {}) });
      // One symbol comes back as the quote itself; several, keyed by symbol.
      const bySymbol = batch.length === 1 ? { [batch[0]]: data } : data;
      for (const s of batch) {
        const q = bySymbol[s];
        const asset = ASSETS.find((a) => a.symbol === s);
        const quote = q && q.status !== "error" ? toQuote(s, q, asset.currency) : null;
        if (quote) quotes[s] = { quote, at: Date.now() };
        else unavailable.add(s);
      }
    } catch (e) {
      if (i === 1) batch.forEach((s) => unavailable.add(s));
      else console.error("market data:", e.message);
    }
  }
  if (!(fx && Date.now() - fx.at < QUOTE_TTL) && take(1)) {
    try {
      const r = await td("/exchange_rate", { symbol: "USD/MXN" });
      if (Number(r.rate) > 0) fx = { rate: Number(r.rate), at: Date.now() };
    } catch (e) {
      console.error("fx:", e.message);
    }
  }
}

export async function getQuotes(symbols) {
  const known = symbols.filter((s) => ASSETS.some((a) => a.symbol === s));
  const today = new Date();
  const cetesQuote = () => {
    const p = cetesPrice(dayKey(today), cetes.rate);
    const prev = cetesPrice(dayKey(new Date(today.getTime() - 864e5)), cetes.rate);
    return { symbol: "CETES28", price: p, prevClose: prev, change: p - prev, changePct: ((p - prev) / prev) * 100, currency: "MXN", date: dayKey(today) };
  };
  if (!KEY) {
    const out = Object.fromEntries(known.map((s) => [s, s === "CETES28" ? cetesQuote() : sampleQuote(s, today)]).filter(([, q]) => q));
    return { source: "sample", delayed: false, asOf: today.toISOString(), quotes: out, fx: { USDMXN: SAMPLE_FX, sample: true }, cetes };
  }
  await refresh(known.filter((s) => s !== "CETES28")).catch((e) => console.error("market data:", e.message));
  const out = {};
  let oldest = Date.now();
  for (const s of known) {
    if (s === "CETES28") out[s] = cetesQuote();
    else if (quotes[s]) {
      out[s] = quotes[s].quote;
      oldest = Math.min(oldest, quotes[s].at);
    }
  }
  return { source: "twelvedata", sourceName: "Twelve Data", delayed: true, asOf: new Date(oldest).toISOString(), quotes: out, fx: fx ? { USDMXN: fx.rate, sample: false } : { USDMXN: SAMPLE_FX, sample: true }, cetes };
}

const histories = {};
export async function getHistory(symbol) {
  const asset = ASSETS.find((a) => a.symbol === symbol);
  if (!asset) throw Object.assign(new Error("Unknown symbol."), { status: 404 });
  if (asset.simulated) return { source: "simulated", points: sampleHistory(symbol, new Date(), 365, cetes.rate) };
  if (!KEY) return { source: "sample", points: sampleHistory(symbol) };
  const hit = histories[symbol];
  if (hit && Date.now() - hit.at < HISTORY_TTL) return hit.data;
  if (unavailable.has(symbol) || !take(1)) return hit ? hit.data : { source: "twelvedata", points: [], busy: true };
  try {
    const r = await td("/time_series", { symbol, interval: "1day", outputsize: "260", ...(asset.exchange ? { exchange: asset.exchange } : {}) });
    const points = (r.values || []).map((v) => [v.datetime.slice(0, 10), Number(v.close)]).filter((p) => p[1] > 0).reverse();
    const data = { source: "twelvedata", points };
    histories[symbol] = { at: Date.now(), data };
    return data;
  } catch (e) {
    console.error("history:", e.message);
    return hit ? hit.data : { source: "twelvedata", points: [] };
  }
}
