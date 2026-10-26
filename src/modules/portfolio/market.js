// PRICES FOR THE PRACTICE PORTFOLIO. From the server (real, delayed prices
// when it has a market data key; sample prices otherwise), or — with no
// server at all — the same sample prices made right here. Every result says
// which it is, and the app shows that.
import { useEffect, useState } from "react";
import { api } from "../../core/api.js";
import { sampleQuote, sampleHistory, SAMPLE_FX, SAMPLE_CETES_RATE } from "./sample.js";
import { assetsFor } from "./assets.js";

const TTL = 5 * 60000;
let cache = { key: null, at: 0, data: null };

function localQuotes(symbols) {
  const quotes = Object.fromEntries(symbols.map((s) => [s, sampleQuote(s)]).filter(([, q]) => q));
  return { source: "sample", delayed: false, asOf: new Date().toISOString(), quotes, fx: { USDMXN: SAMPLE_FX, sample: true }, cetes: { rate: SAMPLE_CETES_RATE, sample: true } };
}

export async function getQuotes(region) {
  const symbols = assetsFor(region).map((a) => a.symbol);
  const key = `${region}:${symbols.join(",")}`;
  if (cache.key === key && Date.now() - cache.at < TTL) return cache.data;
  let data;
  try {
    data = await api(`/api/market/quotes?symbols=${encodeURIComponent(symbols.join(","))}`);
  } catch {
    data = localQuotes(symbols);
  }
  cache = { key, at: Date.now(), data };
  return data;
}

const histories = new Map();
export async function getHistory(symbol) {
  const hit = histories.get(symbol);
  if (hit && Date.now() - hit.at < 30 * 60000) return hit.data;
  let data;
  try {
    data = await api(`/api/market/history?symbol=${encodeURIComponent(symbol)}`);
  } catch {
    data = { source: "sample", points: sampleHistory(symbol) };
  }
  histories.set(symbol, { at: Date.now(), data });
  return data;
}

export function useQuotes(region) {
  const [state, setState] = useState(cache.data && cache.key && cache.key.startsWith(`${region}:`) ? cache.data : null);
  useEffect(() => {
    let gone = false;
    getQuotes(region).then((d) => !gone && setState(d));
    const id = setInterval(() => getQuotes(region).then((d) => !gone && setState(d)), TTL);
    return () => {
      gone = true;
      clearInterval(id);
    };
  }, [region]);
  return state;
}

export function useHistory(symbol) {
  const [data, setData] = useState(null);
  useEffect(() => {
    if (!symbol) return;
    let gone = false;
    setData(null);
    getHistory(symbol).then((d) => !gone && setData(d));
    return () => {
      gone = true;
    };
  }, [symbol]);
  return data;
}
