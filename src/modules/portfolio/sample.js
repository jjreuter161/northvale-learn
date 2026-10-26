// SAMPLE PRICES — used when no market data service is set up (or the app
// is offline). They're invented, deterministic per symbol and day, and
// always labeled "sample" in the app: a way to practice, never presented
// as real prices. The server uses the same generator, so both agree.
import { ASSETS } from "./assets.js";
import { fact } from "../../core/facts.js";

export const SAMPLE_FX = fact("sampleUsdMxn"); // pesos per dollar — a sample, not today's rate
export const SAMPLE_CETES_RATE = fact("cetesExampleRate"); // % a year — a sample rate
const BASE = { SGOV: 100.4, VOO: 500, VTI: 280, VXUS: 65, BND: 73, NAFTRAC: 58, AAPL: 230, NKE: 75, KO: 68, DIS: 110, NVDA: 140, MSFT: 420, SPOT: 600, WALMEX: 60, FEMSAUBD: 180, BIMBOA: 60, AMXB: 16 };
const VOL = { safe: 0.0002, etf: 0.009, stock: 0.018 };

// A small seeded random generator, so a symbol's sample history is the
// same on every device.
function rng(seed) {
  let h = 2166136261;
  for (const c of seed) h = Math.imul(h ^ c.charCodeAt(0), 16777619);
  return () => {
    h += 0x6d2b79f5;
    let t = h;
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}
const key = (d) => `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;

// CETES (simulated in every mode): a 10-peso title growing at the yearly
// rate, day by day, from a fixed starting date.
export function cetesPrice(dateKey, rate) {
  const days = Math.max(0, Math.round((new Date(`${dateKey}T12:00:00`) - new Date("2024-01-01T12:00:00")) / 864e5));
  return 10 * (1 + ((rate / 100) * days) / 360);
}

// About a year of daily closes ending today: [[date, close], …].
export function sampleHistory(symbol, today = new Date(), days = 365, cetesRate = SAMPLE_CETES_RATE) {
  const a = ASSETS.find((x) => x.symbol === symbol);
  if (!a) return [];
  const out = [];
  if (a.simulated) {
    for (let i = days - 1; i >= 0; i--) {
      const d = new Date(today);
      d.setDate(d.getDate() - i);
      out.push([key(d), cetesPrice(key(d), cetesRate)]);
    }
    return out;
  }
  // Walk forward from a fixed origin so each day's price never changes
  // once it exists, then keep the last `days`.
  const origin = new Date("2024-01-01T12:00:00");
  const total = Math.round((today - origin) / 864e5) + 1;
  const r = rng(symbol);
  const vol = VOL[a.type];
  let p = BASE[symbol] * 0.82;
  const all = [];
  for (let i = 0; i < total; i++) {
    const d = new Date(origin);
    d.setDate(d.getDate() + i);
    const shock = (r() + r() + r() - 1.5) * 2 * vol;
    p = Math.max(1, p * (1 + 0.0003 + shock));
    const wd = d.getDay();
    if (wd !== 0 && wd !== 6) all.push([key(d), Math.round(p * 100) / 100]);
  }
  return all.slice(-Math.round((days * 5) / 7));
}

export function sampleQuote(symbol, today = new Date(), cetesRate = SAMPLE_CETES_RATE) {
  const h = sampleHistory(symbol, today, 10, cetesRate);
  if (h.length < 2) return null;
  const [date, price] = h[h.length - 1];
  const prev = h[h.length - 2][1];
  const a = ASSETS.find((x) => x.symbol === symbol);
  return { symbol, price, prevClose: prev, change: price - prev, changePct: ((price - prev) / prev) * 100, currency: a.currency, date };
}
