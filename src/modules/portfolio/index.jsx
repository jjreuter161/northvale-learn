// PRACTICE PORTFOLIO — {$10,000|200,000} of pretend money, real delayed
// prices when the server has a market data key (labeled sample prices
// otherwise), and asset types that unlock as lessons are finished. Owns
// the lesson actions that happen here: buy, watch, read a chart,
// diversify, review.
import { useEffect, useMemo, useState } from "react";
import { registerModule, service } from "../../core/registry.js";
import { useSlice, setSlice, useAppState, getState } from "../../core/store.js";
import { recordPractice, checkBadges } from "../../core/game.js";
import { addStrings, money, percent, text, shortDate } from "../../core/i18n.js";
import { dayKey } from "../../core/progress.js";
import { Button, Card, Chip, Icon, Label, LineChart, ListRow, Note, Sheet, Title, toast } from "../../core/ui.jsx";
import { useSeen, markIntro } from "../../core/Practice.jsx";
import { ASSETS, TYPES, UNLOCKS, assetBySymbol, assetsFor } from "./assets.js";
import { newPortfolio, priceIn, buy, sell, valuation, snapshot, unlocked, MIN_TRADE } from "./engine.js";
import { useQuotes, useHistory } from "./market.js";
import { lessonById } from "../lessons/content.js";

const S = (en, es) => ({ en, es });
addStrings({
  "pf.nav": S("Portfolio", "Portafolio"),
  "pf.sample_badge": S("Sample price", "Precio de ejemplo"),
  "pf.delayed_badge": S("Delayed", "Con retraso"),
  "pf.title": S("Practice portfolio", "Portafolio de práctica"),
  "pf.row.sub": S("Invest pretend money and watch what happens", "Invierte dinero de práctica y ve qué pasa"),
  "pf.row.own": S("You own {n} practice {n|investment|investments}", "Tienes {n} {n|inversión|inversiones} de práctica"),
  "pf.row.locked": S("Opens with the lesson “{lesson}”", "Se abre con la lección “{lesson}”"),
  "pf.total": S("Total value", "Valor total"),
  "pf.since_start": S("since you started", "desde que empezaste"),
  "pf.cash": S("Cash to invest", "Efectivo para invertir"),
  "pf.pretend": S("Pretend money", "Dinero de práctica"),
  "pf.for_goal": S("For: {name}", "Para: {name}"),
  "pf.source.sample": S("Sample prices — invented for practice, not real market data.", "Precios de ejemplo: inventados para practicar, no son datos reales del mercado."),
  "pf.source.real": S("Real prices, delayed (from {source}). Updated {time}.", "Precios reales con retraso (de {source}). Actualizados {time}."),
  "pf.fx.sample": S("Dollar prices are shown in pesos at a sample rate of {rate}.", "Los precios en dólares se muestran en pesos con un tipo de cambio de ejemplo de {rate}."),
  "pf.fx.real": S("Dollar prices shown in pesos at {rate} per dollar.", "Precios en dólares mostrados en pesos a {rate} por dólar."),
  "pf.cetes": S("CETES are simulated at {rate}% a year{sample}.", "Los CETES se simulan al {rate}% anual{sample}."),
  "pf.cetes.sample": S(" (a sample rate)", " (tasa de ejemplo)"),
  "pf.holdings": S("What you own", "Lo que tienes"),
  "pf.none": S("Nothing here yet. Pick something below for your first practice buy. It's pretend money, so there's no wrong first move.", "Todavía no hay nada. Elige algo abajo para tu primera compra de práctica. Es dinero de práctica, así que no hay un primer paso equivocado."),
  "pf.invest": S("Practice investing", "Practica invertir"),
  "pf.type.safe": S("Safe", "Seguras"),
  "pf.type.etf": S("Funds (ETFs)", "Fondos (ETFs)"),
  "pf.type.stock": S("Single companies", "Empresas"),
  "pf.type.safe.sub": S("Lending to the government. Grows slowly, barely moves.", "Prestarle al gobierno. Crece lento y casi no se mueve."),
  "pf.type.etf.sub": S("Baskets of many companies or bonds in one buy.", "Canastas con muchas empresas o bonos en una sola compra."),
  "pf.type.stock.sub": S("One company each. Bigger swings, up and down.", "Una empresa cada una. Se mueven más, para arriba y para abajo."),
  "pf.unlock": S("Look around — buying unlocks after “{lesson}”.", "Explora: comprar se desbloquea con “{lesson}”."),
  "pf.unlock.go": S("Go to the lesson", "Ir a la lección"),
  "pf.unlock_buy": S("You can look around now. Buying these unlocks after the lesson “{lesson}”.", "Ya puedes explorarlas. Comprarlas se desbloquea con la lección “{lesson}”."),
  "pf.examples": S("Well-known examples to practice with — not recommendations.", "Ejemplos conocidos para practicar, no recomendaciones."),
  "pf.watchlist": S("Watchlist", "Tu lista"),
  "pf.history": S("Recent trades", "Movimientos recientes"),
  "pf.bought": S("Bought {amount} of {symbol}", "Compraste {amount} de {symbol}"),
  "pf.sold": S("Sold {amount} of {symbol}", "Vendiste {amount} de {symbol}"),
  "pf.buy": S("Buy", "Comprar"),
  "pf.sell": S("Sell", "Vender"),
  "pf.sell_all": S("Sell all", "Vender todo"),
  "pf.amount": S("Amount", "Cantidad"),
  "pf.shares_est": S("≈ {n} shares", "≈ {n} títulos"),
  "pf.you_own": S("You own {n} shares · {value}", "Tienes {n} títulos · {value}"),
  "pf.watch": S("Watch", "Seguir"),
  "pf.watching": S("Watching", "Siguiendo"),
  "pf.today": S("today", "hoy"),
  "pf.year": S("Past year", "Último año"),
  "pf.high_low": S("High {high} · Low {low}", "Máximo {high} · Mínimo {low}"),
  "pf.explain_chart": S("Explain this chart", "Explícame esta gráfica"),
  "pf.price_in": S("Prices in {cur}", "Precios en {cur}"),
  "pf.err.no_price": S("No price right now. Try again in a bit.", "No hay precio ahorita. Intenta en un rato."),
  "pf.err.too_small": S("The smallest trade is {min}.", "La operación mínima es de {min}."),
  "pf.err.not_enough_cash": S("Not enough pretend cash for that. Try a smaller amount.", "No te alcanza el efectivo de práctica. Prueba con menos."),
  "pf.err.nothing_to_sell": S("You don't own any of this.", "No tienes de esta."),
  "pf.value_chart": S("Your portfolio's value", "El valor de tu portafolio"),
  "pf.value_chart.wait": S("Come back tomorrow to see your first chart point.", "Regresa mañana para ver el primer punto de tu gráfica."),
  "pf.currency.title": S("Your practice portfolio is in {cur}", "Tu portafolio de práctica está en {cur}"),
  "pf.currency.body": S("You changed your country. Start a fresh practice portfolio in {cur}? Your current one will be replaced.", "Cambiaste tu país. ¿Empezar un portafolio de práctica nuevo en {cur}? El actual se va a reemplazar."),
  "pf.currency.restart": S("Start fresh in {cur}", "Empezar de nuevo en {cur}"),
  "pf.restart": S("Start over", "Empezar de nuevo"),
  "pf.restart.body": S("Reset your practice portfolio to {cash} in cash? Your trades and history will be cleared.", "¿Reiniciar tu portafolio de práctica con {cash} en efectivo? Se borrarán tus movimientos e historial."),
  "pf.disclaimer": S("Pretend money for learning. No real trades happen. Examples aren't recommendations, and nothing here is financial advice.", "Dinero de práctica para aprender. No se hace ninguna compra real. Los ejemplos no son recomendaciones y nada aquí es asesoría financiera."),
  "pf.act.pick": S("Pick one:", "Escoge una:"),
  "pf.act.different": S("Pick something you don't own yet.", "Escoge algo que todavía no tengas."),
  "pf.act.max_share": S("Keep it under {pct} of your portfolio ({amount}).", "Que sea menos del {pct} de tu portafolio ({amount})."),
  "pf.act.watch_n": S("{n} of {need} added", "{n} de {need} agregadas"),
  "pf.act.chart_pick": S("Pick a company or fund to open its chart:", "Escoge una empresa o fondo para abrir su gráfica:"),
  "pf.act.chart_q": S("Can you spot the highest and lowest point? Prices rarely go in a straight line.", "¿Ves el punto más alto y el más bajo? Los precios casi nunca van en línea recta."),
  "pf.act.holdings": S("You hold {n} of {need} different investments.", "Tienes {n} de {need} inversiones distintas."),
  "pf.act.review": S("Since you started: {change} ({pct}).", "Desde que empezaste: {change} ({pct})."),
  "pf.act.hold": S("Hold — stick to my plan", "Mantener: sigo mi plan"),
  "pf.act.adjust": S("I'd adjust — and I have a reason", "Ajustaría, y tengo una razón"),
  "pf.act.decided": S("Decision noted. Calm and on purpose is the goal.", "Decisión anotada. La idea es decidir con calma y a propósito."),
  "pf.act.unlocked_now": S("Unlocked in this lesson", "Se desbloquea en esta lección"),
});

const DEFAULTS = { pf: null };
const usePf = (region) => {
  const slice = useSlice("portfolio", DEFAULTS);
  return slice.pf;
};
const savePf = (fn) => setSlice("portfolio", (s) => ({ ...s, pf: fn(s.pf) }), DEFAULTS);
const ensurePf = (region) => {
  const s = getState().modules.portfolio;
  if (!s || !s.pf) savePf(() => newPortfolio(region, dayKey()));
};

// Prices in the portfolio's currency, plus what the numbers came from.
function usePrices(region, pf) {
  const quotes = useQuotes(region);
  return useMemo(() => {
    if (!quotes || !pf) return { prices: {}, quotes };
    const fx = quotes.fx && quotes.fx.USDMXN;
    const prices = {};
    for (const [s, q] of Object.entries(quotes.quotes || {})) {
      const p = priceIn(pf.currency, q, fx);
      if (p != null) prices[s] = p;
    }
    return { prices, quotes };
  }, [quotes, pf && pf.currency]);
}

function fmtFor(locale, currency) {
  return (n, cents = true) => money(n, { ...locale, currency, cents });
}
const sharesFmt = (n) => (n >= 100 ? n.toFixed(1) : n >= 1 ? n.toFixed(3) : n.toPrecision(3));

function SourceNote({ t, quotes, locale, pfCurrency }) {
  if (!quotes) return null;
  const time = new Date(quotes.asOf).toLocaleString(t("locale.tag"), { month: "short", day: "numeric", hour: "numeric", minute: "2-digit" });
  return (
    <p style={{ fontSize: 13, color: "var(--low)", lineHeight: 1.45, margin: "8px 2px 0" }}>
      {quotes.source === "sample" ? t("pf.source.sample") : t("pf.source.real", { source: quotes.sourceName || quotes.source, time })}
      {pfCurrency === "MXN" && quotes.fx && ` ${t(quotes.fx.sample ? "pf.fx.sample" : "pf.fx.real", { rate: quotes.fx.USDMXN.toFixed(2) })}`}
      {locale.region === "MX" && quotes.cetes && ` ${t("pf.cetes", { rate: quotes.cetes.rate, sample: quotes.cetes.sample ? t("pf.cetes.sample") : "" })}`}
    </p>
  );
}

// One asset: chart, what it is, buy/sell. Used by the screen and actions.
function AssetPanel({ t, locale, symbol, pf, prices, quotes, onTraded, compact, explainDone, allowBuy, go }) {
  const a = assetBySymbol(symbol);
  const progress = useAppState((s) => s.progress);
  // Anyone can look; buying waits for the lesson that unlocks this kind
  // (a lesson's own "do it" step can allow it early).
  const lockedBy = !allowBuy && !unlocked(progress, a.type) ? lessonById(UNLOCKS[a.type]) : null;
  const hist = useHistory(symbol);
  const [amount, setAmount] = useState("");
  const [mode, setMode] = useState("buy");
  const [err, setErr] = useState(null);
  const fmt = fmtFor(locale, pf.currency);
  const fmtA = fmtFor(locale, a.currency);
  const price = prices[symbol];
  const q = quotes && quotes.quotes && quotes.quotes[symbol];
  const own = pf.holdings[symbol];
  const pts = hist && hist.points;
  const hi = pts && pts.reduce((m, p) => (p[1] > m[1] ? p : m), pts[0]);
  const lo = pts && pts.reduce((m, p) => (p[1] < m[1] ? p : m), pts[0]);
  const yearChange = pts && pts.length > 1 ? ((pts[pts.length - 1][1] - pts[0][1]) / pts[0][1]) * 100 : null;
  const watching = pf.watchlist.includes(symbol);

  const trade = () => {
    setErr(null);
    const n = Number(String(amount).replace(/[^0-9.]/g, ""));
    const at = new Date().toISOString();
    const r = mode === "buy" ? buy(pf, { symbol, amount: n, price, at }) : sell(pf, { symbol, amount: n, price, at });
    if (r.error) return setErr(t(`pf.err.${r.error}`, { min: fmt(MIN_TRADE[pf.currency], false) }));
    savePf(() => r.pf);
    setAmount("");
    const p = recordPractice("trade");
    checkBadges();
    toast(`${t(mode === "buy" ? "pf.bought" : "pf.sold", { amount: fmt(mode === "buy" ? n : r.proceeds), symbol })}${p.gained ? ` · +${p.gained} XP` : ""}`, "good");
    onTraded && onTraded(symbol, mode, r);
  };
  const sellAll = () => {
    const r = sell(pf, { symbol, all: true, price, at: new Date().toISOString() });
    if (r.error) return setErr(t(`pf.err.${r.error}`));
    savePf(() => r.pf);
    recordPractice("trade");
    toast(t("pf.sold", { amount: fmt(r.proceeds), symbol }), "good");
    onTraded && onTraded(symbol, "sell", r);
  };
  const explain = () => {
    service("tutor", "open")({
      question: t("pf.explain_chart"),
      context: pts ? `${a.name} (${symbol}), ${t("pf.year")}: ${pts[0][0]} ${fmtA(pts[0][1])} → ${pts[pts.length - 1][0]} ${fmtA(pts[pts.length - 1][1])} (${yearChange >= 0 ? "+" : ""}${yearChange.toFixed(1)}%). ${t("pf.high_low", { high: `${fmtA(hi[1])} (${hi[0]})`, low: `${fmtA(lo[1])} (${lo[0]})` })}. ${quotes && quotes.source === "sample" ? t("pf.source.sample") : ""}` : `${a.name} (${symbol})`,
    });
    recordPractice("chart");
    explainDone && explainDone();
  };

  return (
    <div>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", gap: 10 }}>
        <div style={{ minWidth: 0 }}>
          {compact && <div style={{ fontSize: 14, fontWeight: 750, color: "var(--low)" }}>{symbol}</div>}
          <div style={{ fontSize: 20, fontWeight: 750, lineHeight: 1.2 }}>{a.name}</div>
          <div style={{ fontSize: 14, color: "var(--mid)", marginTop: 2 }}>{text(a.short, locale)}</div>
        </div>
        {!compact && (
          <Chip active={watching} onClick={() => (savePf((p) => ({ ...p, watchlist: watching ? p.watchlist.filter((x) => x !== symbol) : [...p.watchlist, symbol] })), !watching && recordPractice("watch"))}>
            {watching ? `✓ ${t("pf.watching")}` : `+ ${t("pf.watch")}`}
          </Chip>
        )}
      </div>
      {q && (
        <div style={{ margin: "12px 0 4px", display: "flex", alignItems: "baseline", gap: 10, flexWrap: "wrap" }}>
          <span style={{ fontSize: 30, fontWeight: 750 }}>{fmtA(q.price)}</span>
          <span style={{ fontWeight: 650, color: "var(--ink)" }}>
            {q.change >= 0 ? "▲" : "▼"} {percent(Math.abs(q.changePct), { ...locale, digits: 2 })} {t("pf.today")}
          </span>
          {quotes && <span style={{ fontSize: 12, fontWeight: 650, color: "var(--mid)", background: "var(--surface2)", borderRadius: 6, padding: "3px 7px" }}>{quotes.source === "sample" ? t("pf.sample_badge") : t("pf.delayed_badge")}</span>}
        </div>
      )}
      {pts && pts.length > 1 && (
        <div style={{ margin: "8px 0 4px" }}>
          <div style={{ display: "flex", justifyContent: "space-between", fontSize: 13, fontWeight: 650, color: "var(--mid)", marginBottom: 6 }}>
            <span>
              {t("pf.year")}: <span style={{ color: "var(--ink)" }}>{yearChange >= 0 ? "▲ +" : "▼ "}{yearChange.toFixed(1)}%</span>
            </span>
            <span>{t("pf.price_in", { cur: a.currency })}</span>
          </div>
          <LineChart points={pts} height={140} color="var(--ink)" label={`${symbol} ${t("pf.year")}`} markers={[{ value: hi[1], color: "var(--good)" }, { value: lo[1], color: "var(--bad)" }]} />
          <div style={{ display: "flex", justifyContent: "space-between", fontSize: 13, color: "var(--low)", marginTop: 6 }}>
            <span>{shortDate(pts[0][0], { ...locale, year: true })}</span>
            <span>{t("pf.high_low", { high: fmtA(hi[1]), low: fmtA(lo[1]) })}</span>
            <span>{shortDate(pts[pts.length - 1][0], { ...locale, year: true })}</span>
          </div>
          <Button kind="secondary" size="md" full onClick={explain} style={{ marginTop: 12 }}>
            <Icon name="sparkles" size={18} /> {t("pf.explain_chart")}
          </Button>
        </div>
      )}
      {own && price && <p style={{ fontWeight: 650, margin: "14px 0 0" }}>{t("pf.you_own", { n: sharesFmt(own.shares), value: fmt(own.shares * price) })}</p>}
      {lockedBy ? (
        <Note icon="lock" style={{ marginTop: 14 }}>
          <div>{t("pf.unlock_buy", { lesson: text(lockedBy.title, locale) })}</div>
          {go && (
            <Button size="sm" kind="secondary" style={{ marginTop: 10 }} onClick={() => go("lessons", { lesson: lockedBy.id })}>
              {t("pf.unlock.go")}
            </Button>
          )}
        </Note>
      ) : (
      <div style={{ marginTop: 14 }}>
        {own && (
          <div style={{ display: "flex", gap: 8, marginBottom: 10 }}>
            <Chip active={mode === "buy"} onClick={() => setMode("buy")}>{t("pf.buy")}</Chip>
            <Chip active={mode === "sell"} onClick={() => setMode("sell")}>{t("pf.sell")}</Chip>
          </div>
        )}
        <label style={{ display: "block" }}>
          <span style={{ display: "block", fontSize: 14, fontWeight: 650, color: "var(--mid)", marginBottom: 6 }}>
            {t("pf.amount")} ({pf.currency}) · {t("pf.cash")}: {fmt(pf.cash)}
          </span>
          <input inputMode="decimal" value={amount} onChange={(e) => setAmount(e.target.value)} placeholder="0" aria-label={t("pf.amount")} style={{ width: "100%", border: "1px solid var(--line)", borderRadius: 14, padding: "13px 14px", fontSize: 20, fontWeight: 650, background: "var(--surface)", color: "var(--ink)" }} />
        </label>
        {mode === "buy" && (
          <div style={{ display: "flex", gap: 6, marginTop: 8, flexWrap: "wrap" }}>
            {[0.05, 0.1, 0.25, 0.5].map((f) => (
              <Chip key={f} onClick={() => setAmount(String(Math.floor(pf.cash * f)))} style={{ padding: "6px 12px", minHeight: 36, fontSize: 14 }}>
                {Math.round(f * 100)}%
              </Chip>
            ))}
          </div>
        )}
        {price && Number(amount) > 0 && <p style={{ fontSize: 14, color: "var(--mid)", margin: "8px 0 0" }}>{t("pf.shares_est", { n: sharesFmt(Number(amount) / price) })}</p>}
        {err && <Note tone="bad" style={{ marginTop: 10 }}>{err}</Note>}
        <div style={{ display: "flex", gap: 8, marginTop: 12 }}>
          <Button full kind={mode === "buy" ? "good" : "bad"} disabled={!price || !(Number(amount) > 0)} onClick={trade}>
            {t(mode === "buy" ? "pf.buy" : "pf.sell")}
          </Button>
          {mode === "sell" && own && (
            <Button kind="secondary" onClick={sellAll}>
              {t("pf.sell_all")}
            </Button>
          )}
        </div>
        {!price && <p style={{ fontSize: 13, color: "var(--low)" }}>{t("pf.err.no_price")}</p>}
      </div>
      )}
    </div>
  );
}

function AssetRow({ t, locale, a, price, q, pf, onClick, right, tag, first }) {
  return (
    <button onClick={onClick} className="nv-press" style={{ display: "flex", alignItems: "center", gap: 12, width: "100%", textAlign: "left", border: "none", borderTop: first ? "none" : "1px solid var(--line)", background: "transparent", color: "var(--ink)", padding: "12px 0", cursor: "pointer", minHeight: 56 }}>
      <span style={{ width: 42, height: 42, borderRadius: 12, background: "var(--surface2)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 11, fontWeight: 750, letterSpacing: -0.2, flexShrink: 0 }}>{a.symbol.slice(0, 5)}</span>
      <span style={{ flex: 1, minWidth: 0 }}>
        <span style={{ display: "block", fontWeight: 650, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{a.name}</span>
        <span style={{ display: "block", fontSize: 13, color: tag ? "var(--accent)" : "var(--mid)", fontWeight: tag ? 650 : 400, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{tag ? t("pf.for_goal", { name: tag }) : text(a.short, locale)}</span>
      </span>
      {right || (
        <span style={{ textAlign: "right", flexShrink: 0 }}>
          <span style={{ display: "block", fontWeight: 650 }}>{q ? money(q.price, { ...locale, currency: a.currency, cents: true }) : "—"}</span>
          {q && <span style={{ display: "block", fontSize: 13, fontWeight: 650, color: "var(--ink)" }}>{q.change >= 0 ? "▲ +" : "▼ −"}{Math.abs(q.changePct).toFixed(2)}%</span>}
        </span>
      )}
    </button>
  );
}

function Screen({ t, locale, go }) {
  const pf = usePf();
  const progress = useAppState((s) => s.progress);
  const [open, setOpen] = useState(null);
  const [restart, setRestart] = useState(false);
  useEffect(() => ensurePf(locale.region), [locale.region]);
  const { prices, quotes } = usePrices(locale.region, pf);
  const v = pf ? valuation(pf, prices) : null;
  // One value point a day, once prices are in.
  useEffect(() => {
    if (pf && quotes && v) {
      const today = dayKey();
      const last = pf.snapshots[pf.snapshots.length - 1];
      if (!last || last[0] !== today || Math.abs(last[1] - v.total) > 0.5) savePf((p) => snapshot(p, today, v.total));
    }
  }, [quotes, v && Math.round(v.total)]);
  if (!pf) return null;
  const fmt = fmtFor(locale, pf.currency);
  const regionCur = locale.region === "MX" ? "MXN" : "USD";
  const assets = assetsFor(locale.region);

  return (
    <div>
      <Title>{t("pf.title")}</Title>
      {pf.currency !== regionCur && (
        <Note icon="globe" style={{ marginBottom: 12 }}>
          <strong>{t("pf.currency.title", { cur: pf.currency })}</strong>
          <div style={{ margin: "4px 0 10px" }}>{t("pf.currency.body", { cur: regionCur })}</div>
          <Button size="sm" onClick={() => savePf(() => newPortfolio(locale.region, dayKey()))}>
            {t("pf.currency.restart", { cur: regionCur })}
          </Button>
        </Note>
      )}
      <Card>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", gap: 10 }}>
          <span style={{ fontSize: 14, fontWeight: 650, color: "var(--mid)" }}>{t("pf.total")}</span>
          <span style={{ fontSize: 12, fontWeight: 650, background: "var(--surface2)", color: "var(--mid)", borderRadius: 999, padding: "4px 10px", whiteSpace: "nowrap" }}>{t("pf.pretend")}</span>
        </div>
        <div style={{ fontSize: 36, fontWeight: 700, letterSpacing: -0.8, lineHeight: 1.15, fontVariantNumeric: "tabular-nums" }}>{fmt(v.total)}</div>
        <div style={{ fontWeight: 650, fontSize: 15, color: "var(--ink)", fontVariantNumeric: "tabular-nums" }}>
          {v.change >= 0 ? "▲ +" : "▼ −"}{fmt(Math.abs(v.change))} ({percent(Math.abs(v.changePct), { ...locale, digits: 2 })}) <span style={{ color: "var(--mid)", fontWeight: 500 }}>{t("pf.since_start")}</span>
        </div>
        {pf.snapshots.length > 1 ? (
          <div style={{ marginTop: 12 }}>
            <LineChart points={pf.snapshots} height={110} color="var(--ink)" label={t("pf.value_chart")} markers={[{ value: pf.start }]} minSpan={pf.start * 0.02} />
          </div>
        ) : (
          <p style={{ fontSize: 13, color: "var(--low)", margin: "8px 0 0" }}>{t("pf.value_chart.wait")}</p>
        )}
        <div style={{ display: "flex", justifyContent: "space-between", marginTop: 12, paddingTop: 12, borderTop: "1px solid var(--line)", fontWeight: 650 }}>
          <span style={{ color: "var(--mid)" }}>{t("pf.cash")}</span>
          <span>{fmt(v.cash)}</span>
        </div>
      </Card>
      <SourceNote t={t} quotes={quotes} locale={locale} pfCurrency={pf.currency} />

      <Label>{t("pf.holdings")}</Label>
      <Card pad={"4px 16px"}>
        {v.positions.length === 0 ? (
          <p style={{ color: "var(--mid)", margin: "12px 0" }}>{t("pf.none")}</p>
        ) : (
          v.positions.map((x, i) => {
            const a = assetBySymbol(x.symbol);
            return (
              <AssetRow
                key={x.symbol}
                t={t}
                locale={locale}
                a={a}
                pf={pf}
                tag={service("goals", "linkedGoalFor")(x.symbol)}
                first={i === 0}
                onClick={() => setOpen(x.symbol)}
                right={
                  <span style={{ textAlign: "right", flexShrink: 0 }}>
                    <span style={{ display: "block", fontWeight: 650 }}>{fmt(x.value)}</span>
                    <span style={{ display: "block", fontSize: 13, fontWeight: 650, color: "var(--ink)" }}>
                      {x.gain >= 0 ? "▲ +" : "▼ −"}{Math.abs(x.gainPct).toFixed(2)}% · {Math.round(x.share * 100)}%
                    </span>
                  </span>
                }
              />
            );
          })
        )}
      </Card>

      <Label>{t("pf.invest")}</Label>
      <p style={{ fontSize: 13, color: "var(--low)", margin: "-4px 2px 10px" }}>{t("pf.examples")}</p>
      {TYPES.map((type) => {
        const open_ = unlocked(progress, type);
        const list = assets.filter((a) => a.type === type);
        const lesson = lessonById(UNLOCKS[type]);
        return (
          <Card key={type} pad={"14px 16px 4px"} style={{ marginBottom: 12 }}>
            <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 6 }}>
              <span style={{ width: 36, height: 36, borderRadius: 10, background: "var(--brandSoft)", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
                <Icon name={type === "safe" ? "shield" : type === "etf" ? "layers" : "building"} size={20} />
              </span>
              <div style={{ flex: 1 }}>
                <div style={{ fontWeight: 750 }}>{t(`pf.type.${type}`)}</div>
                <div style={{ fontSize: 13, color: "var(--mid)" }}>{t(`pf.type.${type}.sub`)}</div>
              </div>
              {!open_ && <Icon name="lock" size={20} color="var(--low)" />}
            </div>
            {!open_ && <p style={{ fontSize: 13, color: "var(--mid)", margin: "2px 0 8px" }}>{t("pf.unlock", { lesson: text(lesson.title, locale) })}</p>}
            {list.map((a) => (
              <AssetRow key={a.symbol} t={t} locale={locale} a={a} q={quotes && quotes.quotes[a.symbol]} pf={pf} onClick={() => setOpen(a.symbol)} />
            ))}
          </Card>
        );
      })}

      {pf.watchlist.length > 0 && (
        <>
          <Label>{t("pf.watchlist")}</Label>
          <Card pad={"4px 16px"}>
            {pf.watchlist.map((s) => assetBySymbol(s)).filter(Boolean).map((a) => (
              <AssetRow key={a.symbol} t={t} locale={locale} a={a} q={quotes && quotes.quotes[a.symbol]} pf={pf} onClick={() => setOpen(a.symbol)} />
            ))}
          </Card>
        </>
      )}

      {pf.trades.length > 0 && (
        <>
          <Label>{t("pf.history")}</Label>
          <Card pad={"4px 16px"}>
            {pf.trades.slice(0, 8).map((x) => (
              <div key={x.id} style={{ display: "flex", justifyContent: "space-between", gap: 10, padding: "11px 0", borderTop: "1px solid var(--line)", fontSize: 15 }}>
                <span>
                  <strong>{t(x.side === "buy" ? "pf.buy" : "pf.sell")}</strong> {x.symbol}
                  <span style={{ display: "block", fontSize: 13, color: "var(--low)" }}>{shortDate(x.at.slice(0, 10), locale)}</span>
                </span>
                <span style={{ fontWeight: 650 }}>{fmt(x.amount)}</span>
              </div>
            ))}
          </Card>
        </>
      )}

      <Note icon="shield" style={{ marginTop: 18 }}>{t("pf.disclaimer")}</Note>
      <div style={{ textAlign: "center", marginTop: 10 }}>
        <Button kind="ghost" size="sm" onClick={() => setRestart(true)}>
          {t("pf.restart")}
        </Button>
      </div>

      <Sheet open={!!open} onClose={() => setOpen(null)} title={open || ""} tall>
        {open && <AssetPanel t={t} locale={locale} symbol={open} pf={pf} prices={prices} quotes={quotes} go={(...x) => (setOpen(null), go(...x))} />}
      </Sheet>
      <Sheet open={restart} onClose={() => setRestart(false)} title={t("pf.restart")}>
        <p style={{ fontSize: 16, lineHeight: 1.5, marginTop: 0 }}>{t("pf.restart.body", { cash: fmt(newPortfolio(locale.region).start, false) })}</p>
        <Button full kind="bad" onClick={() => (savePf(() => newPortfolio(locale.region, dayKey())), setRestart(false))}>
          {t("pf.restart")}
        </Button>
      </Sheet>
    </div>
  );
}

// ---- Lesson actions ----------------------------------------------------

function useActionBase(locale) {
  useEffect(() => ensurePf(locale.region), [locale.region]);
  const pf = usePf();
  const { prices, quotes } = usePrices(locale.region, pf);
  return { pf, prices, quotes };
}

function BuyAction({ params, t, locale, onDone, done }) {
  const { pf, prices, quotes } = useActionBase(locale);
  const [sym, setSym] = useState(null);
  const progress = useAppState((s) => s.progress);
  if (!pf) return null;
  const fmt = fmtFor(locale, pf.currency);
  const owned = new Set(Object.keys(pf.holdings));
  const list = assetsFor(locale.region).filter((a) => a.type === params.type && (!params.different || !owned.has(a.symbol)));
  const total = valuation(pf, prices).total;
  return (
    <div>
      {!unlocked(progress, params.type) && <Note icon="sparkles" style={{ marginBottom: 10 }}>{t("pf.act.unlocked_now")}</Note>}
      {params.maxShare && <Note icon="info" style={{ marginBottom: 10 }}>{t("pf.act.max_share", { pct: `${Math.round(params.maxShare * 100)}%`, amount: fmt(total * params.maxShare, false) })}</Note>}
      {!sym ? (
        <Card pad={"6px 16px"}>
          <p style={{ fontWeight: 650, margin: "8px 0 4px" }}>{params.different ? t("pf.act.different") : t("pf.act.pick")}</p>
          {list.map((a) => (
            <AssetRow key={a.symbol} t={t} locale={locale} a={a} q={quotes && quotes.quotes[a.symbol]} pf={pf} onClick={() => setSym(a.symbol)} />
          ))}
        </Card>
      ) : (
        <Card>
          <button onClick={() => setSym(null)} style={{ border: "none", background: "none", color: "var(--sky)", fontWeight: 650, padding: 0, marginBottom: 8, cursor: "pointer", minHeight: 32 }}>
            ← {t("pf.act.pick")}
          </button>
          <AssetPanel
            t={t}
            locale={locale}
            symbol={sym}
            pf={pf}
            prices={prices}
            quotes={quotes}
            compact
            allowBuy
            onTraded={(s, mode, r) => {
              if (mode !== "buy") return;
              const share = (r.shares * prices[s]) / valuation(r.pf, prices).total;
              if (!params.maxShare || share <= params.maxShare + 0.005) onDone();
            }}
          />
        </Card>
      )}
      {done && <Note tone="good" icon="check" style={{ marginTop: 10 }}>{t("lessons.done_it")}</Note>}
    </div>
  );
}

function WatchAction({ params, t, locale, onDone, done }) {
  const { pf, quotes } = useActionBase(locale);
  const need = params.count || 2;
  useEffect(() => {
    if (pf && pf.watchlist.filter((s) => (assetBySymbol(s) || {}).type === "stock").length >= need && !done) onDone();
  }, [pf && pf.watchlist.length]);
  if (!pf) return null;
  const stocks = assetsFor(locale.region).filter((a) => a.type === "stock");
  const n = pf.watchlist.filter((s) => (assetBySymbol(s) || {}).type === "stock").length;
  return (
    <Card pad={"6px 16px"}>
      <p style={{ fontWeight: 650, margin: "8px 0 4px" }}>{t("pf.act.watch_n", { n: Math.min(n, need), need })}</p>
      {stocks.map((a) => {
        const on = pf.watchlist.includes(a.symbol);
        return (
          <AssetRow
            key={a.symbol}
            t={t}
            locale={locale}
            a={a}
            pf={pf}
            onClick={() => (savePf((p) => ({ ...p, watchlist: on ? p.watchlist.filter((x) => x !== a.symbol) : [...p.watchlist, a.symbol] })), !on && recordPractice("watch"))}
            right={<Chip active={on}>{on ? `✓ ${t("pf.watching")}` : `+ ${t("pf.watch")}`}</Chip>}
          />
        );
      })}
    </Card>
  );
}

function ChartAction({ params, t, locale, onDone }) {
  const { pf, prices, quotes } = useActionBase(locale);
  const [sym, setSym] = useState(null);
  useEffect(() => {
    if (sym && !params.explain) {
      recordPractice("chart");
      onDone();
    }
  }, [sym]);
  if (!pf) return null;
  const list = assetsFor(locale.region).filter((a) => a.type !== "safe");
  return sym ? (
    <Card>
      <button onClick={() => setSym(null)} style={{ border: "none", background: "none", color: "var(--sky)", fontWeight: 650, padding: 0, marginBottom: 8, cursor: "pointer", minHeight: 32 }}>
        ← {t("pf.act.chart_pick")}
      </button>
      <AssetPanel t={t} locale={locale} symbol={sym} pf={pf} prices={prices} quotes={quotes} compact explainDone={onDone} />
      <Note icon="info" style={{ marginTop: 12 }}>{t("pf.act.chart_q")}</Note>
    </Card>
  ) : (
    <Card pad={"6px 16px"}>
      <p style={{ fontWeight: 650, margin: "8px 0 4px" }}>{t("pf.act.chart_pick")}</p>
      {list.map((a) => (
        <AssetRow key={a.symbol} t={t} locale={locale} a={a} q={quotes && quotes.quotes[a.symbol]} pf={pf} onClick={() => setSym(a.symbol)} />
      ))}
    </Card>
  );
}

function DiversifyAction({ params, t, locale, onDone, done }) {
  const { pf, prices, quotes } = useActionBase(locale);
  const progress = useAppState((s) => s.progress);
  const [sym, setSym] = useState(null);
  const need = params.min || 3;
  const n = pf ? Object.keys(pf.holdings).length : 0;
  useEffect(() => {
    if (n >= need && !done) onDone();
  }, [n]);
  if (!pf) return null;
  const list = assetsFor(locale.region).filter((a) => (unlocked(progress, a.type) || a.type !== "stock") && !pf.holdings[a.symbol]);
  return (
    <div>
      <p style={{ fontWeight: 750, fontSize: 18, margin: "0 0 10px" }}>{t("pf.act.holdings", { n: Math.min(n, need), need })}</p>
      {sym ? (
        <Card>
          <button onClick={() => setSym(null)} style={{ border: "none", background: "none", color: "var(--sky)", fontWeight: 650, padding: 0, marginBottom: 8, cursor: "pointer", minHeight: 32 }}>
            ← {t("pf.act.pick")}
          </button>
          <AssetPanel t={t} locale={locale} symbol={sym} pf={pf} prices={prices} quotes={quotes} compact allowBuy onTraded={() => setSym(null)} />
        </Card>
      ) : (
        n < need && (
          <Card pad={"6px 16px"}>
            {list.map((a) => (
              <AssetRow key={a.symbol} t={t} locale={locale} a={a} q={quotes && quotes.quotes[a.symbol]} pf={pf} onClick={() => setSym(a.symbol)} />
            ))}
          </Card>
        )
      )}
    </div>
  );
}

function ReviewAction({ params, t, locale, onDone, done }) {
  const { pf, prices } = useActionBase(locale);
  const [decided, setDecided] = useState(null);
  useEffect(() => {
    if (!params.decide && pf) {
      recordPractice("review");
      onDone();
    }
  }, [!!pf]);
  if (!pf) return null;
  const v = valuation(pf, prices);
  const fmt = fmtFor(locale, pf.currency);
  return (
    <Card>
      <div style={{ fontSize: 30, fontWeight: 750 }}>{fmt(v.total)}</div>
      <p style={{ fontWeight: 650, color: "var(--ink)", margin: "4px 0 10px" }}>{t("pf.act.review", { change: `${v.change >= 0 ? "▲ +" : "▼ −"}${fmt(Math.abs(v.change))}`, pct: `${v.change >= 0 ? "+" : "−"}${Math.abs(v.changePct).toFixed(2)}%` })}</p>
      {v.positions.slice(0, 5).map((x) => (
        <div key={x.symbol} style={{ display: "flex", justifyContent: "space-between", padding: "6px 0", borderTop: "1px solid var(--line)", fontSize: 15 }}>
          <span style={{ fontWeight: 650 }}>{x.symbol}</span>
          <span style={{ fontWeight: 650 }}>{x.gain >= 0 ? "▲ +" : "▼ −"}{Math.abs(x.gainPct).toFixed(2)}%</span>
        </div>
      ))}
      {params.decide && (
        <div style={{ display: "flex", flexDirection: "column", gap: 8, marginTop: 12 }}>
          {["hold", "adjust"].map((k) => (
            <Button
              key={k}
              kind={decided === k ? "good" : "secondary"}
              size="md"
              full
              onClick={() => {
                setDecided(k);
                recordPractice("review");
                onDone();
              }}
            >
              {t(`pf.act.${k}`)}
            </Button>
          ))}
          {decided && <Note tone="good" icon="check">{t("pf.act.decided")}</Note>}
        </div>
      )}
    </Card>
  );
}

// Its row on the Practice tab: open with the lesson that teaches the first
// investment (or for anyone who already has one).
function PracticeRow({ t, locale, go }) {
  const progress = useAppState((s) => s.progress);
  const pf = useAppState((s) => s.modules.portfolio && s.modules.portfolio.pf);
  const seen = useSeen("portfolio");
  const n = pf ? Object.keys(pf.holdings).length : 0;
  const open = unlocked(progress, "safe") || n > 0 || !!(pf && pf.trades.length) || (progress.counters.trade || 0) > 0;
  const lesson = lessonById(UNLOCKS.safe);
  return (
    <ListRow
      icon="chart"
      title={t("pf.title")}
      sub={!open ? t("pf.row.locked", { lesson: text(lesson.title, locale) }) : n ? t("pf.row.own", { n }) : t("pf.row.sub")}
      locked={!open}
      isNew={open && !seen && t("common.new")}
      onClick={() => (markIntro("portfolio"), go("portfolio"))}
    />
  );
}

registerModule({
  id: "portfolio",
  nav: { tab: "practice", label: "pf.nav" },
  practice: { order: 2, Row: PracticeRow },
  Screen,
  actions: {
    "portfolio.buy": BuyAction,
    "portfolio.watch": WatchAction,
    "portfolio.chart": ChartAction,
    "portfolio.diversify": DiversifyAction,
    "portfolio.review": ReviewAction,
  },
  facts: (state) => {
    const pf = state.modules.portfolio && state.modules.portfolio.pf;
    return { holdings: pf ? Object.keys(pf.holdings).length : 0 };
  },
  services: {
    // For Goals (a hook): holdings and what each is worth now, in the
    // portfolio's currency, and the USD/MXN rate (live or sample) for
    // converting; `ready` once prices are in.
    usePositions: (region) => {
      const pf = usePf();
      const { prices, quotes } = usePrices(region, pf);
      return useMemo(() => {
        const fx = quotes && quotes.fx ? { rate: quotes.fx.USDMXN, sample: !!quotes.fx.sample } : null;
        const positions = pf ? valuation(pf, prices).positions.map((x) => ({ symbol: x.symbol, name: (assetBySymbol(x.symbol) || {}).name || x.symbol, value: x.value })) : [];
        return { ready: !!quotes, fx, currency: pf ? pf.currency : null, positions };
      }, [pf, prices, quotes]);
    },
    // For the tutor: a short, plain summary (no prices needed to be exact).
    summary: () => {
      const pf = getState().modules.portfolio && getState().modules.portfolio.pf;
      if (!pf) return null;
      return { currency: pf.currency, cash: Math.round(pf.cash), start: pf.start, holdings: Object.entries(pf.holdings).map(([s, h]) => ({ symbol: s, type: (assetBySymbol(s) || {}).type, invested: Math.round(h.cost) })) };
    },
  },
});

export { ASSETS };
