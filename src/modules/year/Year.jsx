// YOUR MONEY YEAR — the screens. A voyage across twelve months: pick a
// start, face one decision a month, see what changed, learn why (each event
// links its lesson), then compare your year with the steady path. Loaded when
// the screen opens (index.jsx), with the months' text (content.js) loaded
// next. The run is saved with the rest of the progress, so it can be left and
// picked up later. Everything shown is an example: a simulation, not advice.
import { useEffect, useMemo, useState } from "react";
import { useSlice, setSlice, getState } from "../../core/store.js";
import { recordPractice } from "../../core/game.js";
import { track } from "../../core/analytics.js";
import { addStrings, money, text } from "../../core/i18n.js";
import { dayKey } from "../../core/progress.js";
import { Button, Card, Icon, Label, ListRow, Loading, Note, Progress, Scene, Title, MARK_PATHS } from "../../core/ui.jsx";
import { lessonById, lessonState } from "../lessons/content.js";
import { STARTS, MONTHS, SITUATIONS, amt, newRun, play, eventFor, eventVars, steadyRun, biggestSwings, summary, netWorth } from "./engine.js";

const S = (en, es) => ({ en, es });
addStrings({
  "yr.sub": S("Live twelve months of money decisions in about ten minutes.", "Vive doce meses de decisiones de dinero en unos diez minutos."),
  "yr.disclaimer": S("A simulation with example numbers. It isn't a prediction or advice.", "Una simulación con números de ejemplo. No es una predicción ni un consejo."),
  "yr.country": S("Using {country} numbers. Change the country in Settings.", "Con números de {country}. Cambia el país en Ajustes."),
  "yr.pick": S("Where does your year start?", "¿Dónde empieza tu año?"),
  "yr.pay": S("{income} a month after tax", "{income} al mes después de impuestos"),
  "yr.loading": S("Setting up your year…", "Preparando tu año…"),
  "yr.voyage": S("Month {n} of 12", "Mes {n} de 12"),
  "yr.month": S("{name}", "{name}"),
  "yr.peace": S("Peace of mind", "Tranquilidad"),
  "yr.savings": S("Savings", "Ahorros"),
  "yr.cash": S("Cash", "Efectivo"),
  "yr.invested": S("Invested", "Invertido"),
  "yr.debt": S("Card debt", "Deuda de tarjeta"),
  "yr.credit": S("Credit health", "Salud crediticia"),
  "yr.net": S("What you're worth", "Lo que vales"),
  "yr.pick.choice": S("Choose one", "Elige una"),
  "yr.changed": S("What changed this month", "Qué cambió este mes"),
  "yr.nothing": S("Nothing big moved this month.", "Nada grande se movió este mes."),
  "yr.month.note": S("Your pay came in, your costs went out, and the month settled.", "Entró tu sueldo, salieron tus gastos y el mes se cerró."),
  "yr.continue": S("Next month", "Siguiente mes"),
  "yr.see": S("See your year", "Ver tu año"),
  "yr.lesson": S("Want to understand this? Lesson: {lesson}", "¿Quieres entender esto? Lección: {lesson}"),
  "yr.lesson.open": S("Open", "Abrir"),
  "yr.leave": S("Leave and finish later", "Salir y terminar después"),
  "yr.end.title": S("Year complete", "Año completado"),
  "yr.end.up": S("You ended the year worth {net}, {change} more than you started.", "Terminaste el año con un valor de {net}, {change} más que al empezar."),
  "yr.end.down": S("You ended the year worth {net}, {change} less than you started.", "Terminaste el año con un valor de {net}, {change} menos que al empezar."),
  "yr.compare": S("Your year and the steady path", "Tu año y el camino constante"),
  "yr.you": S("Your year", "Tu año"),
  "yr.steady": S("Steady path", "Camino constante"),
  "yr.steady.how": S("The steady path takes the sound choice every month: a saving habit, a cushion, no card debt and nothing risky.", "El camino constante toma la opción sensata cada mes: un hábito de ahorro, un colchón, sin deuda de tarjeta y nada arriesgado."),
  "yr.swings": S("The months that mattered most", "Los meses que más importaron"),
  "yr.swing": S("Month {n}: {title}", "Mes {n}: {title}"),
  "yr.swing.how": S("The steady choice here would have left you about {gain} better off.", "La opción constante aquí te habría dejado con unos {gain} más."),
  "yr.same": S("Your year matched the steady path almost everywhere.", "Tu año coincidió casi siempre con el camino constante."),
  "yr.again": S("Play again with different choices", "Jugar otra vez con otras decisiones"),
  "yr.history": S("Past years", "Años anteriores"),
  "yr.history.row": S("Worth {net} · peace of mind {peace}", "Valor {net} · tranquilidad {peace}"),
  "yr.resume": S("Continue your year", "Seguir con tu año"),
  "yr.resume.sub": S("Month {n} of 12", "Mes {n} de 12"),
  "yr.start.new": S("Start a new year", "Empezar un año nuevo"),
});

const REGION_NAME = { US: S("US", "EE. UU."), MX: S("Mexican", "de México") };
export const DEFAULTS = { run: null, history: [] };
const clampPct = (v) => Math.max(0, Math.min(100, v));

// The year as a voyage: twelve stops along a wavy line, the boat at this month.
function Voyage({ month, t }) {
  const x = (i) => 22 + i * 27.6;
  const y = (i) => 34 + Math.sin(i * 0.9) * 8;
  const at = Math.min(month, MONTHS - 1);
  const scale = 0.26;
  return (
    <svg role="img" aria-label={t("yr.voyage", { n: Math.min(month + 1, MONTHS) })} viewBox="0 0 348 84" width="100%" style={{ display: "block", maxWidth: 520 }}>
      <path d={Array.from({ length: MONTHS }, (_, i) => `${i ? "L" : "M"}${x(i)} ${y(i)}`).join("")} stroke="var(--artSea2)" strokeWidth="3" fill="none" strokeDasharray="2 7" strokeLinecap="round" />
      {Array.from({ length: MONTHS }, (_, i) => (
        <circle key={i} cx={x(i)} cy={y(i)} r={i === at && month < MONTHS ? 5.5 : 4} fill={i < month ? "var(--artInk)" : i === at && month < MONTHS ? "var(--artSun)" : "var(--artSea)"} stroke="var(--artInk)" strokeWidth={i === at ? 1.5 : 0} />
      ))}
      <g transform={`translate(${x(at) - 50 * scale} ${y(at) - 40 * scale - 30}) scale(${scale})`}>
        <path d={MARK_PATHS.join("")} fill="var(--artInk)" />
      </g>
    </svg>
  );
}

// A number that moved, with where it was and where it is.
function Meter({ label, value, max = 100, pct = true, fmt, tone }) {
  return (
    <div style={{ flex: "1 1 140px", minWidth: 0 }}>
      <div style={{ display: "flex", justifyContent: "space-between", gap: 8, fontSize: 13, color: "var(--mid)", marginBottom: 4 }}>
        <span>{label}</span>
        <strong style={{ color: "var(--ink)", fontVariantNumeric: "tabular-nums" }}>{pct ? Math.round(value) : fmt(value)}</strong>
      </div>
      {pct && <Progress value={value} max={max} height={8} color={tone || "var(--accent)"} label={label} />}
    </div>
  );
}

export default function Year({ t, locale, go }) {
  const slice = useSlice("year", DEFAULTS);
  const [content, setContent] = useState(null);
  const [report, setReport] = useState(null); // what the last choice did (this screen only)
  useEffect(() => {
    let live = true;
    import("./content.js").then((c) => live && setContent(c));
    return () => {
      live = false;
    };
  }, []);
  const save = (fn) => setSlice("year", fn, DEFAULTS);
  const fmt = (n) => money(n, locale);
  const run = slice.run;
  const cur = locale.region === "MX" ? "MXN" : "USD";
  const monthName = (m) => new Date(2026, m, 1).toLocaleDateString(`${locale.lang}-${locale.region}`, { month: "long" });
  const lessonRow = (lessonId) => {
    const l = lessonById(lessonId);
    if (!l) return null;
    const open = lessonState(getState().progress, lessonId) !== "locked";
    return (
      <div style={{ display: "flex", alignItems: "center", gap: 10, marginTop: 14, paddingTop: 12, borderTop: "1px solid var(--line)" }}>
        <Icon name="book" size={18} color="var(--mid)" />
        <span style={{ flex: 1, fontSize: 14, color: "var(--mid)" }}>{t("yr.lesson", { lesson: text(l.title, locale) })}</span>
        <Button size="sm" kind="secondary" onClick={() => go("lessons", open ? { lesson: lessonId } : {})}>{t("yr.lesson.open")}</Button>
      </div>
    );
  };

  if (!content) return <div><Title sub={t("yr.sub")}>{t("yr.title")}</Title><Loading label={t("yr.loading")} size={32} /></div>;
  const { EVENTS, STARTS_TEXT } = content;

  // ---- No year in progress: pick where it starts -----------------------------------------
  if (!run) {
    const country = text(REGION_NAME[locale.region], locale);
    return (
      <div>
        <Title sub={t("yr.sub")}>{t("yr.title")}</Title>
        <Card pad={0} style={{ overflow: "hidden", marginBottom: 12 }}>
          <Scene name="harbor" w={358} h={150} />
          <div style={{ padding: "14px 18px 18px" }}>
            <p style={{ margin: "0 0 6px", color: "var(--mid)", lineHeight: 1.5 }}>{t("yr.disclaimer")}</p>
            <p style={{ margin: 0, fontSize: 13, color: "var(--low)" }}>{t("yr.country", { country })}</p>
          </div>
        </Card>
        <Label style={{ marginTop: 18 }}>{t("yr.pick")}</Label>
        <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
          {STARTS.map((s) => (
            <Card key={s} pad={16} onClick={() => (setReport(null), track("year_start", { start: s }), save((x) => ({ ...x, run: newRun(s, locale.region) })))}>
              <div style={{ fontWeight: 700, fontSize: 17 }}>{text(STARTS_TEXT[s].title, locale)}</div>
              <div style={{ fontSize: 14, color: "var(--mid)", lineHeight: 1.45, margin: "4px 0 6px" }}>{text(STARTS_TEXT[s].body, locale)}</div>
              <div style={{ fontSize: 13, color: "var(--low)" }}>{t("yr.pay", { income: fmt(amt(SITUATIONS[s].income, locale.region)) })}</div>
            </Card>
          ))}
        </div>
        {slice.history.length > 0 && (
          <>
            <Label>{t("yr.history")}</Label>
            <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
              {[...slice.history].reverse().map((h, i) => (
                <ListRow key={i} icon="flag" title={text(STARTS_TEXT[h.start].title, locale)} sub={t("yr.history.row", { net: money(h.net, { ...locale, currency: h.currency }), peace: h.peace })} />
              ))}
            </div>
          </>
        )}
      </div>
    );
  }

  // ---- A year in progress ---------------------------------------------------------------------
  const done = run.month >= MONTHS;
  const meters = (r) => (
    <Card pad={16} style={{ marginTop: 12 }}>
      <div style={{ display: "flex", flexWrap: "wrap", gap: "12px 16px" }}>
        <Meter label={t("yr.peace")} value={r.peace} tone="var(--good)" />
        <Meter label={t("yr.credit")} value={r.credit} />
      </div>
      <div style={{ display: "flex", flexWrap: "wrap", gap: "10px 16px", marginTop: 12 }}>
        <Meter label={t("yr.cash")} value={r.cash} pct={false} fmt={fmt} />
        <Meter label={t("yr.savings")} value={r.savings} pct={false} fmt={fmt} />
        <Meter label={t("yr.debt")} value={r.debt} pct={false} fmt={fmt} />
        <Meter label={t("yr.invested")} value={r.invested + r.hot} pct={false} fmt={fmt} />
      </div>
    </Card>
  );

  // ---- The end: your year and the steady path -----------------------------------------------
  if (done && !(report && report.from === run.month - 1)) {
    const steady = steadyRun(run.start, run.region, EVENTS);
    const me = summary(run);
    const swings = biggestSwings(run, EVENTS, 2);
    const up = me.change >= 0;
    const row = (label, a, b) => (
      <div style={{ display: "flex", gap: 8, padding: "8px 0", borderTop: "1px solid var(--line)", fontSize: 15 }}>
        <span style={{ flex: 1.2, color: "var(--mid)" }}>{label}</span>
        <strong style={{ flex: 1, textAlign: "right", fontVariantNumeric: "tabular-nums" }}>{a}</strong>
        <strong style={{ flex: 1, textAlign: "right", fontVariantNumeric: "tabular-nums" }}>{b}</strong>
      </div>
    );
    return (
      <div>
        <Title sub={t("yr.disclaimer")}>{t("yr.end.title")}</Title>
        <Card pad={0} style={{ overflow: "hidden" }}>
          <Scene name="open" w={358} h={150} />
          <div style={{ padding: "14px 18px 18px" }}>
            <Voyage month={MONTHS} t={t} />
            <p style={{ margin: "10px 0 0", fontSize: 17, lineHeight: 1.45, fontWeight: 650 }}>{t(up ? "yr.end.up" : "yr.end.down", { net: fmt(me.net), change: fmt(Math.abs(me.change)) })}</p>
          </div>
        </Card>
        <Label>{t("yr.compare")}</Label>
        <Card pad={16}>
          <div style={{ display: "flex", gap: 8, fontSize: 13, fontWeight: 700, color: "var(--mid)", paddingBottom: 6 }}>
            <span style={{ flex: 1.2 }} />
            <span style={{ flex: 1, textAlign: "right" }}>{t("yr.you")}</span>
            <span style={{ flex: 1, textAlign: "right" }}>{t("yr.steady")}</span>
          </div>
          {row(t("yr.net"), fmt(netWorth(run)), fmt(netWorth(steady)))}
          {row(t("yr.savings"), fmt(run.savings), fmt(steady.savings))}
          {row(t("yr.debt"), fmt(run.debt), fmt(steady.debt))}
          {row(t("yr.peace"), Math.round(run.peace), Math.round(steady.peace))}
          {row(t("yr.credit"), Math.round(run.credit), Math.round(steady.credit))}
          <p style={{ fontSize: 13, color: "var(--low)", lineHeight: 1.45, margin: "10px 0 0" }}>{t("yr.steady.how")}</p>
        </Card>
        <Label>{t("yr.swings")}</Label>
        {swings.length === 0 ? (
          <Note tone="good" icon="check">{t("yr.same")}</Note>
        ) : (
          <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
            {swings.map((s) => {
              const e = EVENTS[s.month].find((x) => x.id === s.event);
              return (
                <Card key={s.month} pad={16}>
                  <div style={{ fontWeight: 700 }}>{t("yr.swing", { n: s.month + 1, title: text(e.title, locale) })}</div>
                  <div style={{ fontSize: 14, color: "var(--mid)", margin: "4px 0 0", lineHeight: 1.45 }}>{t("yr.swing.how", { gain: fmt(Math.round(s.gain / 10) * 10) })}</div>
                  {lessonRow(e.lesson)}
                </Card>
              );
            })}
          </div>
        )}
        <div style={{ marginTop: 20 }}>
          <Button
            full
            onClick={() => {
              recordPractice("sim");
              track("year_done", { start: run.start, up: up ? 1 : 0 });
              save((x) => ({ run: null, history: [...x.history, { start: run.start, net: Math.round(me.net), peace: Math.round(run.peace), currency: cur, day: dayKey() }].slice(-5) }));
              setReport(null);
            }}
          >
            {t("yr.again")}
          </Button>
        </div>
      </div>
    );
  }

  const ev = done ? null : eventFor(run, EVENTS);
  const vars = ev ? Object.fromEntries(Object.entries(eventVars(run, ev)).map(([k, v]) => [k, fmt(v)])) : {};
  const choose = (i) => {
    const { run: next, report: rep } = play(run, i, EVENTS);
    setReport({ ...rep, from: run.month, lesson: ev.lesson, choiceResult: ev.choices[i].result, vars });
    save((x) => ({ ...x, run: next }));
  };
  const diff = (before, after) => {
    const rows = [
      ["cash", t("yr.cash"), fmt],
      ["savings", t("yr.savings"), fmt],
      ["invested", t("yr.invested"), fmt],
      ["debt", t("yr.debt"), fmt],
      ["credit", t("yr.credit"), (v) => Math.round(v)],
      ["peace", t("yr.peace"), (v) => Math.round(v)],
    ];
    return rows.filter(([k]) => Math.round(before[k]) !== Math.round(after[k]));
  };

  // What the last choice did, before the next month.
  if (report && report.from === run.month - 1) {
    const rows = diff(report.before, report.after);
    return (
      <div>
        <Title sub={t("yr.disclaimer")}>{t("yr.title")}</Title>
        <Card pad={16}>
          <Voyage month={run.month} t={t} />
          <p style={{ margin: "10px 0 0", fontSize: 17, lineHeight: 1.5 }}>{text(report.choiceResult, locale, report.vars)}</p>
          <div style={{ marginTop: 14, fontSize: 13, fontWeight: 700, color: "var(--mid)" }}>{t("yr.changed")}</div>
          {rows.length === 0 ? (
            <p style={{ margin: "6px 0 0", fontSize: 14, color: "var(--mid)" }}>{t("yr.nothing")}</p>
          ) : (
            rows.map(([k, label, f]) => (
              <div key={k} style={{ display: "flex", justifyContent: "space-between", gap: 8, padding: "6px 0", borderTop: "1px solid var(--line)", fontSize: 15, fontVariantNumeric: "tabular-nums" }}>
                <span style={{ color: "var(--mid)" }}>{label}</span>
                <span>{f(report.before[k])} → <strong>{f(report.after[k])}</strong></span>
              </div>
            ))
          )}
          <p style={{ margin: "10px 0 0", fontSize: 12, color: "var(--low)" }}>{t("yr.month.note")}</p>
          {lessonRow(report.lesson)}
        </Card>
        {meters(run)}
        <div style={{ marginTop: 16 }}>
          <Button full onClick={() => setReport(null)}>{run.month >= MONTHS ? t("yr.see") : t("yr.continue")}</Button>
        </div>
      </div>
    );
  }

  // This month's decision.
  return (
    <div>
      <Title sub={t("yr.disclaimer")}>{t("yr.title")}</Title>
      <Card pad={16}>
        <Voyage month={run.month} t={t} />
        <div style={{ fontSize: 13, color: "var(--mid)", marginTop: 6, textTransform: "capitalize" }}>{t("yr.voyage", { n: run.month + 1 })} · {monthName(run.month)}</div>
        <h2 className="nv-disp" style={{ fontSize: 26, lineHeight: 1.15, margin: "6px 0 8px", color: "var(--head)" }}>{text(ev.title, locale, vars)}</h2>
        <p style={{ margin: 0, fontSize: 17, lineHeight: 1.5 }}>{text(ev.body, locale, vars)}</p>
      </Card>
      {meters(run)}
      <Label style={{ marginTop: 20 }}>{t("yr.pick.choice")}</Label>
      <div role="group" aria-label={t("yr.pick.choice")} style={{ display: "flex", flexDirection: "column", gap: 10 }}>
        {ev.choices.map((c, i) => (
          <Card key={i} pad={16} onClick={() => choose(i)}>
            <span style={{ fontSize: 16, fontWeight: 650, lineHeight: 1.4 }}>{text(c.label, locale, vars)}</span>
          </Card>
        ))}
      </div>
      <div style={{ textAlign: "center", marginTop: 14 }}>
        <Button kind="ghost" size="sm" onClick={() => go("practice")}>{t("yr.leave")}</Button>
      </div>
    </div>
  );
}
