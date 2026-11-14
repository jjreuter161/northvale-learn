// THE SIMULATOR TOOLS — budget planner, small leaks, cash vs. savings,
// debt payoff, starting early, the investing range, retirement. Used on
// the goal pages and as the "do it" steps in lessons. Math in engine.js;
// every rate is a labeled example.
import { useRef, useState } from "react";
import { useSlice, setSlice } from "../../core/store.js";
import { recordPractice } from "../../core/game.js";
import { addStrings, money, text } from "../../core/i18n.js";
import { Button, Card, Legend, LineChart, Note, Slider, toast } from "../../core/ui.jsx";
import { exampleRates, grow, monthsTo, monthlyFor, payoff, startEarly, retirement } from "./engine.js";
import { fact } from "../../core/facts.js";

const S = (en, es) => ({ en, es });
addStrings({
  "budget.income": S("Money coming in each month", "Dinero que te entra al mes"),
  "budget.needs": S("Needs", "Necesidades"),
  "budget.wants": S("Wants", "Gustos"),
  "budget.save": S("Save", "Ahorro"),
  "budget.result": S("You'd save {amount} a month — {year} a year.", "Ahorrarías {amount} al mes: {year} al año."),
  "budget.tip_low": S("Try to save at least 10%.", "Intenta ahorrar al menos 10%."),
  "budget.save_plan": S("Save my plan", "Guardar mi plan"),
  "budget.saved": S("Plan saved", "Plan guardado"),
  "leak.what": S("{amount}, {n} times a week ≈ {month} a month", "{amount}, {n} veces por semana ≈ {month} al mes"),
  "leak.goal": S("Toward “{name}” ({target}) at {monthly}/month:", "Para “{name}” ({target}) con {monthly}/mes:"),
  "leak.before": S("Now", "Ahora"),
  "leak.after": S("Cutting the leak", "Tapando la fuga"),
  "leak.cut": S("Cut it — move that money to my goal", "Taparla: mover ese dinero a mi meta"),
  "leak.sooner": S("You'd get there {n} {n|month|months} sooner.", "Llegarías {n} {n|mes|meses} antes."),
  "leak.default_goal": S("Your goal", "Tu meta"),
  "compare.monthly": S("Each month", "Cada mes"),
  "compare.years": S("For", "Durante"),
  "compare.after": S("After {time}:", "Después de {time}:"),
  "compare.diff": S("Interest earned: {amount}", "Intereses ganados: {amount}"),
  "compare.go": S("Compare", "Comparar"),
  "goals.compare": S("How each path grows", "Cómo crece cada camino"),
  "debt.balance": S("You owe", "Debes"),
  "debt.apr": S("Interest rate (yearly)", "Tasa de interés (anual)"),
  "debt.payment": S("You pay each month", "Pagas cada mes"),
  "debt.result": S("Paid off in {time}, with {interest} of interest.", "Pagada en {time}, con {interest} de intereses."),
  "debt.never": S("This payment doesn't even cover the interest — the debt would never shrink.", "Este pago ni siquiera cubre los intereses: la deuda nunca bajaría."),
  "debt.double": S("Paying double ({amount}): {time}, {interest} interest.", "Pagando el doble ({amount}): {time}, {interest} de intereses."),
  "debt.extra": S("Paying {amount} more: {time}, {interest} interest — {saved} saved.", "Pagando {amount} más: {time}, {interest} de intereses; te ahorras {saved}."),
  "debt.try": S("Move the slider to pay more and watch what changes.", "Mueve la barra para pagar más y mira qué cambia."),
  "early.monthly": S("Each month", "Cada mes"),
  "early.age": S("Start at {age}", "Empezar a los {age}"),
  "early.age_label": S("Start at age", "Empezar a los"),
  "early.at": S("At {age} you'd have", "A los {age} tendrías"),
  "early.put_in": S("You put in {amount}", "Tú pusiste {amount}"),
  "early.go": S("Compare", "Comparar"),
  "early.gap": S("Starting {n} {n|year|years} earlier: {amount} more.", "Empezando {n} {n|año|años} antes: {amount} más."),
  "invest.monthly": S("Each month", "Cada mes"),
  "invest.years": S("For", "Durante"),
  "invest.result": S("After {time} you'd have put in {putIn}. In an index fund it might be about {mid} — maybe {low} in a weak stretch, {high} in a strong one.", "Después de {time} habrías puesto {putIn}. En un fondo indexado podría ser alrededor de {mid}; quizá {low} en una mala racha o {high} en una buena."),
  "invest.safe": S("Safe path ({rate}% a year): {amount}.", "Camino seguro ({rate}% anual): {amount}."),
  "invest.go": S("Show the range", "Ver el rango"),
  "invest.note": S("Real markets don't move in smooth lines: some years drop 20% or more. Over longer periods, the ups have historically outweighed the downs — not guaranteed.", "Los mercados reales no se mueven en línea recta: algunos años caen 20% o más. En periodos largos, históricamente las subidas han pesado más que las bajadas, pero no está garantizado."),
  "retire.monthly": S("You put in each month", "Tú pones cada mes"),
  "retire.extra": S("Extra on top (employer match)", "Extra encima (aportación de tu empresa)"),
  "retire.extra.MX": S("Extra on top (employer + government)", "Extra encima (patrón + gobierno)"),
  "retire.age": S("Starting age", "Edad para empezar"),
  "retire.result": S("At {@retirementAge}: about {amount} (you put in {putIn}).", "A los {@retirementAge}: alrededor de {amount} (tú pusiste {putIn})."),
  "retire.with_extra": S("With the extra: about {amount}.", "Con el extra: alrededor de {amount}."),
  "retire.go": S("See it at {@retirementAge}", "Verlo a los {@retirementAge}"),
  "retire.note": S("Uses an example {@indexExampleRate} a year, about the US market's long-run average after inflation, so amounts are roughly in today's money. An illustration, not a promise.", "Usa un {@indexExampleRate} anual de ejemplo, cerca del promedio de largo plazo de la bolsa de EE. UU. después de inflación, así que las cantidades están más o menos en dinero de hoy. Es una ilustración, no una promesa."),
});

export const DEFAULTS = { goals: [], budget: null };
export const amt = (x, region) => (Array.isArray(x) ? x[region === "MX" ? 1 : 0] : x);
export const dur = (t, n) => {
  if (n == null) return t("goals.never");
  if (n <= 1) return t("dur.one_month");
  const y = Math.floor(n / 12);
  const m = n % 12;
  return y && m ? t("dur.both", { y, m }) : y ? t("dur.years", { y }) : t("dur.months", { m });
};
export const pathLabel = (t, p, region) => (p === "save" && region === "MX" ? t("goals.path.save.MX") : t(`goals.path.${p}`));
export const PATH_COLORS = { cash: "var(--low)", save: "var(--sky)", invest: "var(--good)" };
export const toPts = (vals) => vals.map((v, i) => [i, v]);

// Marks a lesson action done the first time the user really does something.
export function useTouched(onDone, done) {
  const fired = useRef(false);
  return () => {
    if (!fired.current && !done && onDone) {
      fired.current = true;
      recordPractice("sim");
      onDone();
    }
  };
}

export function BudgetTool({ params = {}, t, locale, onDone, done }) {
  const R = locale.region;
  const slice = useSlice("goals", DEFAULTS);
  const b = slice.budget || { income: amt(params.income || [400, 6000], R), needs: 50, wants: 30 };
  const [income, setIncome] = useState(b.income);
  const [needs, setNeeds] = useState(b.needs);
  const [wants, setWants] = useState(Math.min(b.wants, 100 - b.needs));
  const save = 100 - needs - wants;
  const fmt = (n) => money(n, locale);
  const bar = [
    ["needs", needs, "var(--sky)"],
    ["wants", wants, "var(--flame)"],
    ["save", save, "var(--good)"],
  ];
  return (
    <Card>
      <Slider label={t("budget.income")} value={income} min={amt([100, 1500], R)} max={amt([4000, 60000], R)} step={amt([50, 500], R)} onChange={setIncome} display={fmt(income)} />
      <div style={{ display: "flex", height: 26, borderRadius: 8, overflow: "hidden", margin: "4px 0 12px" }} aria-hidden>
        {bar.map(([k, v, c]) => (
          <div key={k} style={{ width: `${v}%`, background: c, transition: "width .3s" }} />
        ))}
      </div>
      <Slider label={t("budget.needs")} value={needs} min={0} max={100 - wants} onChange={setNeeds} display={`${needs}% · ${fmt((income * needs) / 100)}`} />
      <Slider label={t("budget.wants")} value={wants} min={0} max={100 - needs} onChange={setWants} display={`${wants}% · ${fmt((income * wants) / 100)}`} />
      <div style={{ display: "flex", justifyContent: "space-between", fontWeight: 750, fontSize: 17, padding: "4px 0 10px" }}>
        <span style={{ color: "var(--good)" }}>{t("budget.save")}</span>
        <span>{save}% · {fmt((income * save) / 100)}</span>
      </div>
      <p style={{ margin: "0 0 12px", fontSize: 15, lineHeight: 1.45 }}>{save < 10 ? t("budget.tip_low") : t("budget.result", { amount: fmt((income * save) / 100), year: fmt((income * save * 12) / 100) })}</p>
      <Button
        full
        kind="primary"
        disabled={save < 10}
        onClick={() => {
          setSlice("goals", (s) => ({ ...s, budget: { income, needs, wants } }), DEFAULTS);
          recordPractice("sim");
          toast(t("budget.saved"), "good");
          onDone && onDone();
        }}
      >
        {t("budget.save_plan")}
      </Button>
    </Card>
  );
}

export function LeakTool({ params = {}, t, locale, onDone, done }) {
  const R = locale.region;
  const slice = useSlice("goals", DEFAULTS);
  const fmt = (n) => money(n, locale);
  const g = slice.goals.find((x) => x.status !== "paused") || slice.goals[0] || { name: t("leak.default_goal"), target: amt([500, 8000], R), start: 0 };
  const leak = amt(params.leak || [5, 80], R);
  const perWeek = params.perWeek || 3;
  const leakMonth = (leak * perWeek * 52) / 12;
  const base = Math.max(amt([25, 400], R), g.monthly || Math.ceil(monthlyFor({ start: g.start || 0, target: g.target, months: g.months || 12 })));
  const [cut, setCut] = useState(false);
  const before = monthsTo({ start: g.start || 0, monthly: base, target: g.target });
  const after = monthsTo({ start: g.start || 0, monthly: base + leakMonth, target: g.target });
  const touch = useTouched(onDone, done);
  return (
    <Card>
      <div style={{ fontWeight: 750, fontSize: 17 }}>{t("leak.what", { amount: fmt(leak), n: perWeek, month: fmt(leakMonth) })}</div>
      <p style={{ margin: "10px 0", color: "var(--mid)" }}>{t("leak.goal", { name: typeof g.name === "string" ? g.name : text(g.name, locale), target: fmt(g.target), monthly: fmt(base) })}</p>
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10 }}>
        <div style={{ background: "var(--surface2)", borderRadius: 8, padding: 12 }}>
          <div style={{ fontSize: 13, fontWeight: 650, color: "var(--mid)" }}>{t("leak.before")}</div>
          <div style={{ fontSize: 20, fontWeight: 750 }}>{dur(t, before)}</div>
        </div>
        <div style={{ background: cut ? "var(--goodSoft)" : "var(--surface2)", borderRadius: 8, padding: 12, opacity: cut ? 1 : 0.5 }}>
          <div style={{ fontSize: 13, fontWeight: 650, color: "var(--mid)" }}>{t("leak.after")}</div>
          <div style={{ fontSize: 20, fontWeight: 750 }}>{cut ? dur(t, after) : "?"}</div>
        </div>
      </div>
      {cut ? (
        <Note tone="good" icon="check" style={{ marginTop: 12 }}>{t("leak.sooner", { n: Math.max(0, (before || 0) - (after || 0)) })}</Note>
      ) : (
        <Button full style={{ marginTop: 12 }} onClick={() => (setCut(true), touch())}>
          {t("leak.cut")}
        </Button>
      )}
    </Card>
  );
}

export function CompareTool({ params = {}, t, locale, onDone, done }) {
  const R = locale.region;
  const rates = exampleRates(R);
  const fmt = (n) => money(n, locale);
  const [monthly, setMonthly] = useState(amt([50, 1000], R));
  const [years, setYears] = useState(params.years || 3);
  const [shown, setShown] = useState(false);
  const show = params.show || ["cash", "save"];
  const touch = useTouched(onDone, done);
  const series = show.map((p) => ({ p, vals: grow({ monthly, months: years * 12, annualPct: rates[p] }) }));
  return (
    <Card>
      <Slider label={t("compare.monthly")} value={monthly} min={amt([10, 200], R)} max={amt([500, 8000], R)} step={amt([10, 100], R)} onChange={setMonthly} display={fmt(monthly)} />
      <Slider label={t("compare.years")} value={years} min={1} max={30} onChange={setYears} display={dur(t, years * 12)} />
      {!shown ? (
        <Button full onClick={() => (setShown(true), touch())}>
          {t("compare.go")}
        </Button>
      ) : (
        <div className="nv-in">
          <LineChart lines={series.map((s) => ({ points: toPts(s.vals), color: PATH_COLORS[s.p], dash: s.p === "cash" }))} height={120} label={t("goals.compare")} />
          <Legend items={series.map((s) => ({ label: `${pathLabel(t, s.p, R)} (${rates[s.p]}%)`, color: PATH_COLORS[s.p] }))} />
          <p style={{ fontWeight: 750, margin: "12px 0 4px" }}>{t("compare.after", { time: dur(t, years * 12) })}</p>
          {series.map((s) => (
            <div key={s.p} style={{ display: "flex", justifyContent: "space-between", padding: "6px 0", borderTop: "1px solid var(--line)" }}>
              <span style={{ fontWeight: 650, color: PATH_COLORS[s.p] }}>{pathLabel(t, s.p, R)}</span>
              <span style={{ fontWeight: 750 }}>{fmt(s.vals[s.vals.length - 1])}</span>
            </div>
          ))}
          <Note tone="good" style={{ marginTop: 10 }}>{t("compare.diff", { amount: fmt(series[series.length - 1].vals.at(-1) - monthly * years * 12) })}</Note>
        </div>
      )}
    </Card>
  );
}

export function DebtTool({ params = {}, t, locale, onDone, done }) {
  const R = locale.region;
  const fmt = (n) => money(n, locale);
  const [balance, setBalance] = useState(amt(params.balance || [1000, 15000], R));
  const [apr, setApr] = useState(params.apr || 24);
  const start = amt(params.payment || [50, 750], R);
  const [payment, setPayment] = useState(start);
  const touch = useTouched(onDone, done);
  const r = payoff({ balance, aprPct: apr, payment });
  const dbl = params.compareDouble ? payoff({ balance, aprPct: apr, payment: payment * 2 }) : null;
  const extra = params.extra ? amt(params.extra, R) : null;
  const ext = extra ? payoff({ balance, aprPct: apr, payment: payment + extra }) : null;
  return (
    <Card>
      <Slider label={t("debt.balance")} value={balance} min={amt([100, 1500], R)} max={amt([10000, 150000], R)} step={amt([50, 500], R)} onChange={setBalance} display={fmt(balance)} />
      <Slider label={t("debt.apr")} value={apr} min={0} max={R === "MX" ? 80 : 36} onChange={setApr} display={`${apr}%`} />
      <Slider label={t("debt.payment")} value={payment} min={amt([10, 150], R)} max={Math.max(amt([10, 150], R) + 10, Math.ceil(balance / 2))} step={amt([5, 50], R)} onChange={(v) => (setPayment(v), v !== start && touch())} display={fmt(payment)} />
      {r.never ? (
        <Note tone="bad" icon="info">{t("debt.never")}</Note>
      ) : (
        <>
          <div style={{ fontSize: 18, fontWeight: 750, lineHeight: 1.35 }}>{t("debt.result", { time: dur(t, r.months), interest: fmt(r.interest) })}</div>
          <div style={{ margin: "10px 0" }}>
            <LineChart lines={[{ points: toPts(r.path), color: "var(--ink)" }, ...(dbl && !dbl.never ? [{ points: toPts(dbl.path), color: "var(--ink)", dash: true }] : []), ...(ext && !ext.never ? [{ points: toPts(ext.path), color: "var(--ink)", dash: "2 4" }] : [])]} height={100} label={t("debt.balance")} />
          </div>
        </>
      )}
      {dbl && !dbl.never && <p style={{ margin: "8px 0 0", fontWeight: 650, color: "var(--good)" }}>{t("debt.double", { amount: fmt(payment * 2), time: dur(t, dbl.months), interest: fmt(dbl.interest) })}</p>}
      {ext && !ext.never && !r.never && <p style={{ margin: "8px 0 0", fontWeight: 650, color: "var(--good)" }}>{t("debt.extra", { amount: fmt(extra), time: dur(t, ext.months), interest: fmt(ext.interest), saved: fmt(r.interest - ext.interest) })}</p>}
      {!done && onDone && <p style={{ fontSize: 14, color: "var(--mid)", margin: "10px 0 0" }}>{t("debt.try")}</p>}
    </Card>
  );
}

export function EarlyTool({ params = {}, t, locale, onDone, done }) {
  const R = locale.region;
  const fmt = (n) => money(n, locale);
  const until = params.until || 60;
  const [monthly, setMonthly] = useState(amt(params.monthly || [50, 750], R));
  const [ages, setAges] = useState(params.ages || [16, 26]);
  const [shown, setShown] = useState(false);
  const touch = useTouched(onDone, done);
  const res = startEarly({ monthly, ages, until });
  return (
    <Card>
      <Slider label={t("early.monthly")} value={monthly} min={amt([10, 200], R)} max={amt([500, 8000], R)} step={amt([10, 50], R)} onChange={setMonthly} display={fmt(monthly)} />
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10 }}>
        {ages.map((a, i) => (
          <Slider key={i} label={t("early.age_label")} value={a} min={14} max={until - 5} onChange={(v) => setAges((x) => x.map((y, j) => (j === i ? v : y)))} display={a} />
        ))}
      </div>
      {!shown ? (
        <Button full onClick={() => (setShown(true), touch())}>
          {t("early.go")}
        </Button>
      ) : (
        <div className="nv-in">
          <p style={{ fontWeight: 750, margin: "4px 0 8px" }}>{t("early.at", { age: until })}</p>
          {res.map((r, i) => (
            <div key={i} style={{ display: "flex", justifyContent: "space-between", alignItems: "baseline", padding: "8px 0", borderTop: "1px solid var(--line)" }}>
              <span>
                <span style={{ fontWeight: 750, color: i === 0 ? "var(--good)" : "var(--sky)" }}>{t("early.age", { age: r.age })}</span>
                <span style={{ display: "block", fontSize: 13, color: "var(--mid)" }}>{t("early.put_in", { amount: fmt(r.putIn) })}</span>
              </span>
              <span style={{ fontSize: 20, fontWeight: 750 }}>{fmt(r.value)}</span>
            </div>
          ))}
          <LineChart lines={res.map((r, i) => ({ points: toPts([...Array(Math.max(...res.map((x) => x.months)) - r.months).fill(0), ...r.values]), color: i === 0 ? "var(--good)" : "var(--sky)" }))} height={110} label={t("goals.tool.early")} />
          {ages[0] !== ages[1] && <Note tone="good" style={{ marginTop: 10 }}>{t("early.gap", { n: Math.abs(ages[1] - ages[0]), amount: fmt(Math.abs(res[0].value - res[1].value)) })}</Note>}
          <p style={{ fontSize: 13, color: "var(--low)", margin: "10px 0 0" }}>{t("retire.note")}</p>
        </div>
      )}
    </Card>
  );
}

export function InvestTool({ params = {}, t, locale, onDone, done }) {
  const R = locale.region;
  const rates = exampleRates(R);
  const fmt = (n) => money(n, locale);
  const [monthly, setMonthly] = useState(amt(params.monthly || [100, 1500], R));
  const [years, setYears] = useState(params.years || 10);
  const [shown, setShown] = useState(false);
  const touch = useTouched(onDone, done);
  const months = years * 12;
  const mid = grow({ monthly, months, annualPct: rates.invest });
  const low = grow({ monthly, months, annualPct: rates.investLow });
  const high = grow({ monthly, months, annualPct: rates.investHigh });
  const safe = grow({ monthly, months, annualPct: rates.save });
  return (
    <Card>
      <Slider label={t("invest.monthly")} value={monthly} min={amt([10, 200], R)} max={amt([1000, 15000], R)} step={amt([10, 100], R)} onChange={setMonthly} display={fmt(monthly)} />
      <Slider label={t("invest.years")} value={years} min={1} max={40} onChange={setYears} display={dur(t, months)} />
      {!shown ? (
        <Button full onClick={() => (setShown(true), touch())}>
          {t("invest.go")}
        </Button>
      ) : (
        <div className="nv-in">
          <LineChart points={toPts(mid)} color="var(--good)" band={mid.map((_, i) => [i, low[i], high[i]])} lines={params.compareSafe ? [{ points: toPts(safe), color: "var(--sky)", dash: true }] : []} height={130} label={t("goals.tool.invest")} />
          <Legend items={[{ label: `${pathLabel(t, "invest", R)} (${rates.investLow}–${rates.investHigh}%)`, color: "var(--good)" }, ...(params.compareSafe ? [{ label: `${pathLabel(t, "save", R)} (${rates.save}%)`, color: "var(--sky)" }] : [])]} />
          <p style={{ fontSize: 16, lineHeight: 1.5, margin: "12px 0 6px" }}>{t("invest.result", { time: dur(t, months), putIn: fmt(monthly * months), mid: fmt(mid[months]), low: fmt(low[months]), high: fmt(high[months]) })}</p>
          {params.compareSafe && <p style={{ fontWeight: 650, margin: "0 0 6px", color: "var(--sky)" }}>{t("invest.safe", { rate: rates.save, amount: fmt(safe[months]) })}</p>}
          <Note icon="info">{t("invest.note")}</Note>
        </div>
      )}
    </Card>
  );
}

export function RetireTool({ params = {}, t, locale, onDone, done }) {
  const R = locale.region;
  const fmt = (n) => money(n, locale);
  const [monthly, setMonthly] = useState(amt(params.monthly || [150, 1500], R));
  const [extraPct, setExtraPct] = useState(amt(params.extraPct || [fact("matchExampleUS"), fact("aforeExtraExampleMX")], R));
  const [age, setAge] = useState(params.age || 22);
  const [shown, setShown] = useState(false);
  const touch = useTouched(onDone, done);
  const r = retirement({ monthly, extraPct, age });
  return (
    <Card>
      <Slider label={t("retire.monthly")} value={monthly} min={amt([10, 100], R)} max={amt([1000, 10000], R)} step={amt([10, 50], R)} onChange={setMonthly} display={fmt(monthly)} />
      {!params.voluntary && <Slider label={t(R === "MX" ? "retire.extra.MX" : "retire.extra")} value={extraPct} min={0} max={100} step={5} onChange={setExtraPct} display={`+${extraPct}%`} />}
      <Slider label={t("retire.age")} value={age} min={15} max={55} onChange={setAge} display={age} />
      {!shown ? (
        <Button full onClick={() => (setShown(true), touch())}>
          {t("retire.go")}
        </Button>
      ) : (
        <div className="nv-in">
          <p style={{ fontSize: 18, fontWeight: 750, margin: "4px 0" }}>{t("retire.result", { amount: fmt(r.yours), putIn: fmt(r.putIn) })}</p>
          {extraPct > 0 && !params.voluntary && <p style={{ fontSize: 18, fontWeight: 750, margin: "4px 0", color: "var(--good)" }}>{t("retire.with_extra", { amount: fmt(r.withExtra) })}</p>}
          <p style={{ fontSize: 13, color: "var(--low)", margin: "8px 0 0" }}>{t("retire.note")}</p>
        </div>
      )}
    </Card>
  );
}

export const TOOLS = [
  ["budget", "pie", BudgetTool],
  ["debt", "card", DebtTool],
  ["early", "clock", EarlyTool],
  ["invest", "chart", InvestTool],
  ["retire", "calendar", RetireTool],
];

