// QUESTION TYPES — every kind of question a lesson, review or challenge can
// ask: how it looks, its starting answer, when it can be checked, how it's
// graded, and what its feedback adds. The player (index.jsx) only talks to
// this table. All of them are tap-based (no dragging), work by keyboard and
// screen reader, and never show right or wrong by color alone.
//
// Region numbers: a numeric field can be one number, or [US, Mexico] when
// the amounts differ (text uses {$100|2000} the same way).
import { useMemo, useState } from "react";
import { addStrings, money, number, text } from "../../core/i18n.js";
import { Icon } from "../../core/ui.jsx";
import { QuestionView } from "./practice.jsx";
import { fv } from "./units/helpers.js";

const S = (en, es) => ({ en, es });
addStrings({
  "q.order": S("Put in order", "Ordena"),
  "q.order.hint": S("Tap them in order. Tap a numbered one to undo from there.", "Tócalos en orden. Toca uno numerado para deshacer desde ahí."),
  "q.order.pos": S("position {n}", "lugar {n}"),
  "q.order.right": S("The right order", "El orden correcto"),
  "q.estimate": S("Estimate", "Calcula a ojo"),
  "q.estimate.hint": S("Slide to your best guess.", "Desliza hasta tu mejor cálculo."),
  "q.estimate.put": S("You put in", "Pusiste"),
  "q.estimate.guess": S("Your guess", "Tu cálculo"),
  "q.estimate.real": S("The real answer", "La respuesta real"),
  "q.estimate.grows": S("It grows to about", "Crece a unos"),
  "q.estimate.spot": S("Spot on", "Le atinaste"),
  "q.estimate.close": S("Close: within {pct}%", "Cerca: a menos de {pct}%"),
  "q.estimate.off": S("Not quite: it's about {answer}", "No del todo: son unos {answer}"),
  "q.estimate.chart": S("Money put in, and what it grew to", "El dinero que pusiste y lo que creció"),
  "q.years": S("{n} {n|year|years}", "{n} {n|año|años}"),
  "q.match": S("Match the pairs", "Une las parejas"),
  "q.match.hint": S("Tap one on the left, then its match on the right. Tap a pair to undo it.", "Toca uno a la izquierda y luego su pareja a la derecha. Toca una pareja para deshacerla."),
  "q.match.pair": S("pair {n}", "pareja {n}"),
  "q.match.right": S("The pairs", "Las parejas"),
  "q.number": S("Work it out", "Haz la cuenta"),
  "q.number.label": S("Your answer", "Tu respuesta"),
  "q.number.off": S("Not quite: it's {answer}", "No del todo: son {answer}"),
  "q.spot": S("Spot the problem", "Encuentra el problema"),
  "q.spot.hint": S("{n} of {need} picked", "{n} de {need} elegidas"),
  "q.spot.one": S("You found it", "La encontraste"),
  "q.spot.two": S("You found both", "Encontraste las dos"),
  "q.spot.all": S("You found all {n}", "Encontraste las {n}"),
  "q.spot.some": S("You found {got} of {need}", "Encontraste {got} de {need}"),
  "q.spot.flag": S("red flag", "señal de alerta"),
  "q.scenario": S("Real-life choice", "Decisión de la vida real"),
  "q.fit.good": S("A good fit", "Buena opción"),
  "q.fit.ok": S("Reasonable", "Razonable"),
  "q.fit.poor": S("Here's the catch", "Aquí está el detalle"),
});

const at = (v, region) => (Array.isArray(v) ? v[region === "MX" ? 1 : 0] : v);
const tx = (locale) => (x, vars) => text(x, locale, vars);
const btn = { textAlign: "left", display: "flex", alignItems: "center", gap: 12, width: "100%", borderRadius: 14, padding: "14px 16px", fontSize: 16, fontWeight: 650, minHeight: 56, color: "var(--ink)", font: "inherit" };
const tone = (state) =>
  state === "right" ? { border: "2px solid var(--right)", background: "var(--rightSoft)" } : state === "wrong" ? { border: "2px solid var(--warn)", background: "var(--warnSoft)" } : state === "on" ? { border: "2px solid var(--brand)", background: "var(--brandSoft)" } : { border: "2px solid transparent", background: "var(--surface)" };
const Badge = ({ n, on }) => (
  <span aria-hidden style={{ width: 28, height: 28, borderRadius: 14, flexShrink: 0, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 14, fontWeight: 750, background: on ? "var(--brand)" : "var(--bg)", color: on ? "var(--onBrand)" : "var(--low)", border: on ? "none" : "1.5px solid var(--line)" }}>{n || ""}</span>
);
const Mark = ({ right }) => <Icon name={right ? "check" : "info"} size={18} color={right ? "var(--right)" : "var(--warn)"} stroke={2.6} />;
const Hint = ({ children }) => <p style={{ fontSize: 14, color: "var(--mid)", margin: "10px 2px 0" }}>{children}</p>;

// A shuffle that's the same every time for the same question (so it doesn't
// jump around on re-render), and never leaves everything in place.
function shuffled(n, seed) {
  let h = 2166136261;
  for (const ch of seed) h = Math.imul(h ^ ch.charCodeAt(0), 16777619);
  const a = Array.from({ length: n }, (_, i) => i);
  for (let i = n - 1; i > 0; i--) {
    h = Math.imul(h ^ (h >>> 13), 1597334677) >>> 0;
    const j = h % (i + 1);
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a.every((v, i) => v === i) ? [...a.slice(1), a[0]] : a;
}
const seedOf = (step) => JSON.stringify(step.q).slice(0, 200);

// ---- put in order ------------------------------------------------------------
// The answer: item indexes in the order tapped (the right order is 0, 1, 2…).
function OrderView({ step, value, setValue, checked, t, locale }) {
  const x = tx(locale);
  const shown = useMemo(() => shuffled(step.items.length, seedOf(step)), [step]);
  return (
    <div>
      <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
        {shown.map((i) => {
          const pos = value.indexOf(i);
          const state = checked ? (pos === i ? "right" : "wrong") : pos >= 0 ? "on" : null;
          return (
            <button key={i} data-q="order-item" disabled={!!checked} aria-pressed={pos >= 0} aria-label={`${x(step.items[i])}${pos >= 0 ? `, ${t("q.order.pos", { n: pos + 1 })}` : ""}`} onClick={() => setValue(pos >= 0 ? value.slice(0, pos) : [...value, i])} className="nv-press" style={{ ...btn, ...tone(state), cursor: checked ? "default" : "pointer" }}>
              <Badge n={pos >= 0 ? pos + 1 : null} on={pos >= 0} />
              <span style={{ flex: 1 }}>{x(step.items[i])}</span>
              {checked && <Mark right={pos === i} />}
            </button>
          );
        })}
      </div>
      {!checked && <Hint>{t("q.order.hint")}</Hint>}
    </div>
  );
}
const OrderExtra = ({ step, right, t, locale }) =>
  right ? null : (
    <div style={{ marginTop: 6 }}>
      <div style={{ fontWeight: 650 }}>{t("q.order.right")}:</div>
      <ol style={{ margin: "4px 0 0", paddingLeft: 22 }}>
        {step.items.map((it, i) => (
          <li key={i}>{text(it, locale)}</li>
        ))}
      </ol>
    </div>
  );

// ---- estimate ---------------------------------------------------------------
// spec: { unit: "money" | "percent" | "years" | "number", min, max, step,
// answer, tol (share, default 0.15), grow: { monthly, years, rate } } — any
// number can be [US, Mexico]. With `grow`, the reveal draws the money put in
// against what it grew to.
const spec = (step, region) => Object.fromEntries(Object.entries(step.spec).map(([k, v]) => [k, k === "grow" && v ? Object.fromEntries(Object.entries(v).map(([a, b]) => [a, at(b, region)])) : at(v, region)]));
function fmtFor(unit, locale, t) {
  if (unit === "money") return (v) => money(v, { ...locale, currency: locale.region === "MX" ? "MXN" : "USD", cents: false });
  if (unit === "percent") return (v) => `${number(v, { ...locale, digits: v % 1 ? 1 : 0 })}%`;
  if (unit === "years") return (v) => t("q.years", { n: v });
  return (v) => number(v, locale);
}
function GrowthChart({ grow, guess, label }) {
  const W = 320;
  const H = 120;
  const end = fv(grow.monthly, grow.rate, grow.years);
  const top = Math.max(end, guess) * 1.05;
  const y = (v) => H - (v / top) * (H - 8);
  const pts = Array.from({ length: 21 }, (_, k) => {
    const yr = (grow.years * k) / 20;
    return `${(W * k) / 20},${y(fv(grow.monthly, grow.rate, yr))}`;
  }).join(" ");
  return (
    <svg viewBox={`0 0 ${W} ${H}`} width="100%" height={H} role="img" aria-label={label} style={{ display: "block", margin: "6px 0" }}>
      <line x1="0" y1={H} x2={W} y2={H} stroke="var(--line)" />
      <line x1="0" y1={H} x2={W} y2={y(grow.monthly * 12 * grow.years)} stroke="var(--low)" strokeWidth="2" strokeDasharray="5 4" />
      <polyline points={pts} fill="none" stroke="var(--brand)" strokeWidth="3" />
      <line x1="0" y1={y(guess)} x2={W} y2={y(guess)} stroke="var(--brand)" strokeDasharray="2 4" opacity=".6" />
    </svg>
  );
}
function EstimateView({ step, value, setValue, checked, t, locale, submit }) {
  const s = spec(step, locale.region);
  const fmt = fmtFor(s.unit, locale, t);
  const line = (label, v, strong) => (
    <div style={{ display: "flex", justifyContent: "space-between", fontSize: strong ? 16 : 14, marginTop: 2, color: strong ? "var(--brand)" : "var(--ink)", fontWeight: strong ? 650 : 400 }}>
      <span style={{ color: strong ? "var(--brand)" : "var(--mid)" }}>{label}</span>
      <b>{fmt(v)}</b>
    </div>
  );
  return (
    <div style={{ background: "var(--surface)", borderRadius: 18, padding: 18 }}>
      {!checked ? (
        <>
          <div style={{ fontSize: 32, fontWeight: 750, letterSpacing: -0.6, textAlign: "center", fontVariantNumeric: "tabular-nums" }} aria-hidden>
            {fmt(value)}
          </div>
          <input type="range" data-q="estimate" min={s.min} max={s.max} step={s.step} value={value} onChange={(e) => setValue(Number(e.target.value))} onKeyDown={(e) => e.key === "Enter" && submit()} aria-label={text(step.q, locale)} aria-valuetext={fmt(value)} style={{ width: "100%", accentColor: "var(--brand)", margin: "14px 0 4px", height: 32 }} />
          <div style={{ display: "flex", justifyContent: "space-between", fontSize: 13, color: "var(--low)" }}>
            <span>{fmt(s.min)}</span>
            <span>{fmt(s.max)}</span>
          </div>
          <Hint>{t("q.estimate.hint")}</Hint>
        </>
      ) : (
        <>
          {s.grow && <GrowthChart grow={s.grow} guess={value} label={t("q.estimate.chart")} />}
          {s.grow && line(t("q.estimate.put"), s.grow.monthly * 12 * s.grow.years)}
          {line(t("q.estimate.guess"), value)}
          {line(s.grow ? t("q.estimate.grows") : t("q.estimate.real"), s.answer, true)}
        </>
      )}
    </div>
  );
}
const off = (step, v, region) => {
  const a = at(step.spec.answer, region);
  return Math.abs(v - a) / Math.abs(a);
};

// ---- match pairs ------------------------------------------------------------
// The answer: [left, right] index pairs (right when left === right).
function MatchView({ step, value, setValue, checked, t, locale }) {
  const x = tx(locale);
  const [sel, setSel] = useState(null);
  const rights = useMemo(() => shuffled(step.pairs.length, seedOf(step)), [step]);
  const pairOf = (side, i) => value.findIndex((p) => p[side] === i);
  const tapLeft = (i) => (pairOf(0, i) >= 0 ? (setValue(value.filter((p) => p[0] !== i)), setSel(null)) : setSel(sel === i ? null : i));
  const tapRight = (j) => {
    if (sel === null) return pairOf(1, j) >= 0 && setValue(value.filter((p) => p[1] !== j));
    setValue([...value.filter((p) => p[1] !== j && p[0] !== sel), [sel, j]]);
    setSel(null);
  };
  const cell = (side, i, label) => {
    const k = pairOf(side, i);
    const pair = value[k];
    const state = checked ? (pair && pair[0] === pair[1] ? "right" : "wrong") : (side === 0 && sel === i) || k >= 0 ? "on" : null;
    return (
      <button key={`${side}${i}`} data-q={side ? "match-right" : "match-left"} disabled={!!checked} aria-pressed={k >= 0 || (side === 0 && sel === i)} aria-label={`${label}${k >= 0 ? `, ${t("q.match.pair", { n: k + 1 })}` : ""}`} onClick={() => (side ? tapRight(i) : tapLeft(i))} className="nv-press" style={{ ...btn, ...tone(state), fontSize: side ? 14 : 15, padding: "12px", minHeight: 60, cursor: checked ? "default" : "pointer" }}>
        {k >= 0 && <Badge n={k + 1} on />}
        <span style={{ flex: 1 }}>{label}</span>
      </button>
    );
  };
  return (
    <div>
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1.4fr", gap: 10 }}>
        {step.pairs.map((p, r) => [cell(0, r, x(step.pairs[r][0])), cell(1, rights[r], x(step.pairs[rights[r]][1]))])}
      </div>
      {!checked && <Hint>{t("q.match.hint")}</Hint>}
    </div>
  );
}
const MatchExtra = ({ step, right, t, locale }) =>
  right ? null : (
    <div style={{ marginTop: 6 }}>
      <div style={{ fontWeight: 650 }}>{t("q.match.right")}:</div>
      <ul style={{ margin: "4px 0 0", paddingLeft: 20 }}>
        {step.pairs.map((p, i) => (
          <li key={i}>
            <b>{text(p[0], locale)}</b>: {text(p[1], locale)}
          </li>
        ))}
      </ul>
    </div>
  );

// ---- work it out (a number) ---------------------------------------------------
// spec: { unit, answer, tol (absolute, default 0.5) }; why can be a list of
// steps, shown one per line.
const parseNum = (v) => Number(String(v).replace(/[,\s$%]/g, ""));
function NumberView({ step, value, setValue, checked, right, t, locale, submit }) {
  const s = spec(step, locale.region);
  return (
    <label style={{ display: "flex", alignItems: "center", gap: 8, borderRadius: 14, padding: "10px 16px", ...tone(checked ? (right ? "right" : "wrong") : value ? "on" : null) }}>
      {s.unit === "money" && <span style={{ fontSize: 24, color: "var(--mid)", fontWeight: 650 }}>$</span>}
      <input data-q="number" inputMode="decimal" autoComplete="off" value={value} disabled={!!checked} onChange={(e) => setValue(e.target.value.slice(0, 14))} onKeyDown={(e) => e.key === "Enter" && submit()} aria-label={t("q.number.label")} placeholder="0" style={{ flex: 1, minWidth: 0, border: "none", background: "transparent", fontSize: 26, fontWeight: 750, color: "var(--ink)", outline: "none", fontVariantNumeric: "tabular-nums" }} />
      {s.unit === "percent" && <span style={{ fontSize: 24, color: "var(--mid)", fontWeight: 650 }}>%</span>}
    </label>
  );
}

// ---- spot the problem -----------------------------------------------------------
// frame: "sms" | "email" | "offer" | "receipt", with `from` (who it's from);
// parts: text, or { tap: text, flag: true/false } for the parts that can be
// tapped. The answer: the tapped parts' indexes. Right when every flag is found.
const FRAME_ICON = { sms: "chat", email: "send", offer: "card", receipt: "wallet" };
function SpotView({ step, value, setValue, checked, t, locale }) {
  const x = tx(locale);
  const need = step.parts.filter((p) => p.flag).length;
  const tap = (i) => setValue(value.includes(i) ? value.filter((v) => v !== i) : value.length < need ? [...value, i] : [...value.slice(1), i]);
  // A statement or pay stub reads line by line; a message reads as text.
  const lines = step.frame === "receipt";
  return (
    <div>
      <div style={{ background: "var(--surface)", borderRadius: 18, padding: 14 }}>
        <div style={{ display: "flex", alignItems: "center", gap: 6, fontSize: 13, color: "var(--mid)", marginBottom: 8 }}>
          <Icon name={FRAME_ICON[step.frame] || "chat"} size={15} /> {x(step.from)}
        </div>
        <div style={{ background: "var(--bg)", borderRadius: step.frame === "sms" ? "16px 16px 16px 4px" : 12, padding: lines ? 6 : "12px 14px", fontSize: 16, lineHeight: 1.9, display: lines ? "flex" : "block", flexDirection: "column", gap: 4 }}>
          {step.parts.map((p, i) => {
            if (!p.tap) return <span key={i}>{x(p)}</span>;
            const on = value.includes(i);
            const state = checked ? (p.flag && on ? "right" : p.flag || on ? "wrong" : null) : on ? "on" : null;
            const border = state === "right" ? "var(--right)" : state === "wrong" ? "var(--warn)" : state === "on" ? "var(--brand)" : "var(--line)";
            return (
              <button key={i} data-q="spot-part" disabled={!!checked} aria-pressed={on} aria-label={`${x(p.tap)}${checked && p.flag ? `, ${t("q.spot.flag")}` : ""}`} onClick={() => tap(i)} style={{ font: "inherit", color: "var(--ink)", background: state === "right" ? "var(--rightSoft)" : state === "wrong" ? "var(--warnSoft)" : state === "on" ? "var(--brandSoft)" : "transparent", border: `2px ${checked && p.flag && !on ? "dashed" : "solid"} ${lines && !state ? "transparent" : border}`, borderRadius: lines ? 10 : 6, padding: lines ? "8px 10px" : "0 3px", margin: lines ? 0 : "0 1px", textAlign: "left", width: lines ? "100%" : undefined, cursor: checked ? "default" : "pointer", lineHeight: 1.5, fontVariantNumeric: "tabular-nums" }}>
                {x(p.tap)}
              </button>
            );
          })}
        </div>
      </div>
      {!checked && <Hint>{t("q.spot.hint", { n: value.length, need })}</Hint>}
    </div>
  );
}

// ---- real-life choice ----------------------------------------------------------
// options: [{ text, fit: "good" | "ok" | "poor", why }] — every option is
// explained. A reasonable choice counts as right; only a poor fit is a miss.
function ScenarioView({ step, value, setValue, checked, t, locale }) {
  const x = tx(locale);
  return (
    <div role="radiogroup" data-q="scenario" aria-label={x(step.q)} style={{ display: "flex", flexDirection: "column", gap: 10 }}>
      {step.options.map((o, i) => {
        const sel = value === i;
        const state = checked ? (sel ? (o.fit === "poor" ? "wrong" : "right") : null) : sel ? "on" : null;
        return (
          <button key={i} role="radio" aria-checked={sel} disabled={!!checked} onClick={() => setValue(i)} className="nv-press" style={{ ...btn, ...tone(state), opacity: checked && !sel ? 0.55 : 1, cursor: checked ? "default" : "pointer" }}>
            <Badge n={i + 1} on={sel} />
            <span style={{ flex: 1 }}>{x(o.text)}</span>
          </button>
        );
      })}
    </div>
  );
}
const ScenarioExtra = ({ step, t, locale }) => (
  <ul style={{ margin: "6px 0 0", paddingLeft: 0, listStyle: "none", display: "flex", flexDirection: "column", gap: 6 }}>
    {step.options.map((o, i) => (
      <li key={i}>
        <b>{text(o.text, locale)}</b> ({t(`q.fit.${o.fit}`).toLowerCase()}): {text(o.why, locale)}
      </li>
    ))}
  </ul>
);

// ---- multiple choice and true/false (the original two) --------------------------
const PickView = ({ step, value, setValue, checked, t, locale, label }) => <QuestionView t={t} locale={locale} step={step} picked={value} setPicked={setValue} checked={checked} label={label} bare />;

export const QTYPES = {
  choice: { label: "lessons.question", View: PickView, ready: (s, v) => v !== null, grade: (s, v) => v === s.answer },
  tf: { label: "lessons.question", View: PickView, ready: (s, v) => v !== null, grade: (s, v) => v === s.answer },
  order: { label: "q.order", initial: () => [], View: OrderView, Extra: OrderExtra, ready: (s, v) => v.length === s.items.length, grade: (s, v) => v.every((x, i) => x === i) },
  estimate: {
    label: "q.estimate",
    initial: (s, region) => {
      const p = spec(s, region);
      return Math.round((p.min + (p.max - p.min) / 2) / p.step) * p.step;
    },
    View: EstimateView,
    ready: () => true,
    grade: (s, v, region) => off(s, v, region) <= (s.spec.tol ?? 0.15),
    heading: (s, v, region, t, locale) => {
      const d = off(s, v, region);
      if (d <= 0.03) return t("q.estimate.spot");
      if (d <= (s.spec.tol ?? 0.15)) return t("q.estimate.close", { pct: Math.round((s.spec.tol ?? 0.15) * 100) });
      return t("q.estimate.off", { answer: fmtFor(spec(s, region).unit, locale, t)(at(s.spec.answer, region)) });
    },
  },
  match: { label: "q.match", initial: () => [], View: MatchView, Extra: MatchExtra, ready: (s, v) => v.length === s.pairs.length, grade: (s, v) => v.every((p) => p[0] === p[1]) },
  number: {
    label: "q.number",
    initial: () => "",
    View: NumberView,
    ready: (s, v) => String(v).trim() !== "" && Number.isFinite(parseNum(v)),
    grade: (s, v, region) => Math.abs(parseNum(v) - at(s.spec.answer, region)) <= (s.spec.tol ?? 0.5),
    heading: (s, v, region, t, locale, right) => (right ? null : t("q.number.off", { answer: fmtFor(spec(s, region).unit, locale, t)(at(s.spec.answer, region)) })),
  },
  spot: {
    label: "q.spot",
    initial: () => [],
    View: SpotView,
    ready: (s, v) => v.length === s.parts.filter((p) => p.flag).length,
    grade: (s, v) => v.every((i) => s.parts[i].flag),
    heading: (s, v, region, t) => {
      const need = s.parts.filter((p) => p.flag).length;
      const got = v.filter((i) => s.parts[i].flag).length;
      return got < need ? t("q.spot.some", { got, need }) : need === 1 ? t("q.spot.one") : need === 2 ? t("q.spot.two") : t("q.spot.all", { n: need });
    },
  },
  scenario: { label: "q.scenario", initial: () => null, View: ScenarioView, Extra: ScenarioExtra, ready: (s, v) => v !== null, grade: (s, v) => s.options[v].fit !== "poor", heading: (s, v, region, t) => t(`q.fit.${s.options[v].fit}`) },
};

// The answer to start with (null for choice and true/false).
export const startValue = (step, region) => (QTYPES[step.type].initial ? QTYPES[step.type].initial(step, region) : null);

// One question: its label, the question, and its own way of answering.
export function Question({ t, locale, step, value, setValue, checked, right, label, submit }) {
  const Q = QTYPES[step.type];
  const pick = step.type === "choice" || step.type === "tf";
  return (
    <div>
      <div style={{ fontSize: 14, fontWeight: 650, color: "var(--mid)", marginBottom: 8 }}>{label || t(Q.label)}</div>
      <h2 style={{ fontSize: step.q && text(step.q, locale).length > 110 ? 20 : 23, fontWeight: 700, margin: "0 0 18px", lineHeight: 1.3 }}>{text(step.q, locale)}</h2>
      <Q.View t={t} locale={locale} step={step} value={value} setValue={setValue} checked={checked} right={right} submit={submit} label={label} bare={pick} />
    </div>
  );
}
