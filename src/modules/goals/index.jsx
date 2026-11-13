// GOALS — the heart of the app and its home screen. A goal is something
// you want ("a car, {$5,000|80,000}, in 3 years"), a plan (a monthly
// amount on a path: cash, savings / CETES, an index fund), and where you
// stand against it: what you've saved (the main number), and — on its own
// line — that plus practice investments you've linked to it. Lessons are recommended by goal, and
// milestones (25/50/75/100%) and a weekly check-in keep it moving.
// The model is in plan.js (tested); the simulator tools in tools.jsx.
// Later, a "real accounts" module can feed real balances into progress.
import { useEffect, useMemo, useState } from "react";
import { registerModule, service } from "../../core/registry.js";
import { useSlice, setSlice, getState, useAppState } from "../../core/store.js";
import { recordPractice, checkBadges } from "../../core/game.js";
import { addStrings, makeT, money, shortDate, text } from "../../core/i18n.js";
import { dayKey, addDays } from "../../core/progress.js";
import { fact } from "../../core/facts.js";
import { Button, Card, Field, Icon, Label, Legend, LineChart, List, ListRow, Mark, Note, Scene, Segmented, Sheet, Slider, Title, toast } from "../../core/ui.jsx";
import { openShare } from "../../core/share.jsx";
import { update } from "../../core/store.js";
import { useSeen, markIntro } from "../../core/Practice.jsx";
import { PATHS, exampleRates } from "./engine.js";
import * as P from "./plan.js";
import { DEFAULTS, amt, dur, pathLabel, PATH_COLORS, TOOLS, BudgetTool, LeakTool, CompareTool, DebtTool, EarlyTool, InvestTool, RetireTool } from "./tools.jsx";
import { PaycheckTool, SalesTaxTool, BracketTool, FeeTool, RemitTool, ScamTool, InsuranceTool, SwingTool, HustleTool } from "./life.jsx";

// Home's calculators: the goal tools plus two everyday ones.
const CALCULATORS = [...TOOLS, ["paycheck", "wallet", PaycheckTool], ["hustle", "chart", HustleTool]];

const S = (en, es) => ({ en, es });
addStrings({
  "goals.nav": S("Goals", "Metas"),
  "goals.path.cash": S("Cash", "Efectivo"),
  "goals.path.save": S("Savings account", "Cuenta de ahorro"),
  "goals.path.save.MX": S("CETES", "CETES"),
  "goals.path.invest": S("Index fund", "Fondo indexado"),
  "goals.never": S("not within 50 years", "no en 50 años"),
  "goals.tools": S("Tools from your lessons", "Herramientas de tus lecciones"),
  "goals.sub": S("What you're learning for.", "Para qué estás aprendiendo."),
  "tools.sub": S("Calculators from the lessons, to try your own numbers. Example rates, not advice.", "Calculadoras de las lecciones para probar tus propios números. Tasas de ejemplo, no asesoría."),
  "tools.from": S("From “{lesson}”", "De “{lesson}”"),
  "tools.after": S("Opens after the lesson “{lesson}”", "Se abre después de la lección “{lesson}”"),
  "tools.row.sub": S("{n} of {total} open", "{n} de {total} abiertas"),
  "tools.row.none": S("Each one opens after the lesson that uses it", "Cada una se abre después de la lección que la usa"),
  "mw.title": S("Your money week", "Tu semana de dinero"),
  "mw.learned": S("You learned", "Aprendiste"),
  "mw.learned.n": S("{n} {n|lesson|lessons}, mostly {unit}", "{n} {n|lección|lecciones}, sobre todo de {unit}"),
  "mw.learned.none": S("No lessons last week. A fresh week starts now.", "Ninguna lección la semana pasada. Empieza una semana nueva."),
  "mw.solid": S("Now solid", "Ya lo tienes firme"),
  "mw.streak": S("{n}-day streak", "Racha de {n} {n|día|días}"),
  "mw.best": S("Your best so far", "Tu mejor racha hasta ahora"),
  "mw.going": S("Still going", "Sigue en pie"),
  "mw.goal.sub": S("{pct}% of the way there", "{pct}% del camino"),
  "mw.goal.same": S("{name}: {saved} so far", "{name}: {saved} por ahora"),
  "mw.next": S("For next week", "Para la próxima semana"),
  "mw.next.body": S("Next up: “{lesson}”, in {unit}. {why}", "Sigue: “{lesson}”, de {unit}. {why}"),
  "rc.title": S("The real cost", "El costo real"),
  "rc.pick": S("Small daily things add up. Pick one.", "Las cosas pequeñas de cada día se suman. Elige una."),
  "rc.coffee": S("Coffee", "Café"),
  "rc.snack": S("Snack", "Botana"),
  "rc.ride": S("Ride", "Viaje en app"),
  "rc.own": S("Your own", "La tuya"),
  "rc.own.label": S("Price, each workday", "Precio, cada día entre semana"),
  "rc.every.workday": S("every workday", "cada día entre semana"),
  "rc.every.day": S("every day", "cada día"),
  "rc.every.week": S("every week", "cada semana"),
  "rc.line": S("{price} {every} is about {yearly} a year. Put toward an investment at an example {@indexExampleRate} for 10 years, it could grow to about {grow}.", "{price} {every} son unos {yearly} al año. Puestos en una inversión a un {@indexExampleRate} de ejemplo durante 10 años, podrían crecer a unos {grow}."),
  "rc.choose": S("If it's the best part of your day, it may well be worth it. The point is choosing on purpose.", "Si es lo mejor de tu día, puede valer la pena. La idea es elegir a propósito."),
  "rc.hidden": S("This week's hidden cost", "El costo escondido de esta semana"),
  "rc.card": S("A {balance} card balance at 24% a year, paying {pay} a month, takes about {years} years and costs about {interest} in interest.", "Una deuda de {balance} en una tarjeta al 24% anual, pagando {pay} al mes, tarda unos {years} años y cuesta unos {interest} de intereses."),
  "rc.fee": S("A {fee} monthly account fee is {yearly} a year, for an account that could be free.", "Una comisión mensual de {fee} son {yearly} al año, por una cuenta que podría ser gratis."),
  "rc.subs": S("Two forgotten subscriptions at {each} a month are {yearly} a year.", "Dos suscripciones olvidadas de {each} al mes son {yearly} al año."),
  "rc.lesson": S("Lesson: {title}", "Lección: {title}"),
  "rc.fine": S("Example numbers, for learning. Not advice.", "Números de ejemplo, para aprender. No es asesoría."),
  "plan.ask.title": S("Make a plan for your goal?", "¿Hacemos un plan para tu meta?"),
  "plan.ask.sub": S("Optional. Say how much and by when, and see what to set aside each month.", "Opcional. Di cuánto y para cuándo, y ve cuánto apartar cada mes."),
  "plan.ask.yes": S("Make a plan", "Hacer un plan"),
  "plan.ask.no": S("Not now", "Ahora no"),
  "goals.tool.budget": S("Budget planner", "Planeador de presupuesto"),
  "goals.tool.debt": S("Debt payoff", "Pagar una deuda"),
  "goals.tool.early": S("Starting early", "Empezar temprano"),
  "goals.tool.invest": S("Investing range", "Rango de inversión"),
  "goals.tool.retire": S("Retirement", "Retiro"),
  "goals.tool.paycheck": S("Paycheck", "Sueldo neto"),
  "goals.tool.hustle": S("Side hustle", "Ingreso extra"),
  "goals.tool.done": S("That's the idea.", "Esa es la idea."),
  "goals.rates": S("Example yearly rates: savings {save}%, index fund about {invest}% (could be {low}%–{high}% or worse). Real rates change and investing returns are never guaranteed — some years are negative.", "Tasas anuales de ejemplo: ahorro {save}%, fondo indexado alrededor de {invest}% (podría ser {low}%–{high}% o peor). Las tasas reales cambian y las ganancias de invertir nunca están garantizadas: algunos años son negativos."),
  "goals.rates.MX": S("Example yearly rates: CETES {save}%, index fund about {invest}% (could be {low}%–{high}% or worse). Real rates change and investing returns are never guaranteed — some years are negative.", "Tasas anuales de ejemplo: CETES {save}%, fondo indexado alrededor de {invest}% (podría ser {low}%–{high}% o peor). Las tasas reales cambian y las ganancias de invertir nunca están garantizadas: algunos años son negativos."),
  "goals.disclaimer": S("Goals are a planning exercise with example rates — not a promise or financial advice. Northvale never holds or moves real money.", "Las metas son un ejercicio de planeación con tasas de ejemplo; no son una promesa ni asesoría financiera. Northvale nunca guarda ni mueve dinero real."),
  "dur.months": S("{m} mo", "{m} {m|mes|meses}"),
  "dur.years": S("{y} yr", "{y} {y|año|años}"),
  "dur.both": S("{y} yr {m} mo", "{y} {y|año|años} {m} {m|mes|meses}"),
  "dur.one_month": S("1 month", "1 mes"),

  // Templates
  "tpl.emergency": S("Emergency fund", "Fondo de emergencia"),
  "tpl.emergency.sub": S("A cushion for surprises", "Un colchón para imprevistos"),
  "tpl.car": S("Car", "Coche"),
  "tpl.car.sub": S("A down payment or the whole thing", "El enganche o completo"),
  "tpl.college": S("College", "Universidad"),
  "tpl.college.sub": S("Tuition, books, a laptop", "Colegiatura, libros, una laptop"),
  "tpl.invest": S("First investment", "Primera inversión"),
  "tpl.invest.sub": S("Build up an amount to start investing", "Junta un monto para empezar a invertir"),
  "tpl.travel": S("Travel", "Viaje"),
  "tpl.travel.sub": S("A trip you want to take", "Un viaje que quieres hacer"),
  "tpl.debt": S("Debt payoff", "Pagar una deuda"),
  "tpl.debt.sub": S("A card or loan balance", "Una tarjeta o un préstamo"),
  "tpl.custom": S("Something else", "Otra cosa"),
  "tpl.custom.sub": S("Name it yourself", "Ponle tú el nombre"),

  // Home
  "home.your_goal": S("Your goal", "Tu meta"),
  "home.other_goals": S("Other goals", "Otras metas"),
  "home.new_goal": S("New goal", "Nueva meta"),
  "home.empty.title": S("No goal yet", "Todavía no tienes meta"),
  "home.empty.sub": S("Most people start with an emergency fund. It's the one that saves you from everything else.", "Casi todos empiezan con un fondo de emergencia: es el que te salva de todo lo demás."),
  "home.next_lesson": S("Next lesson", "Siguiente lección"),
  "home.start": S("Start", "Empezar"),
  "home.all_done": S("You've finished every lesson. Review any of them from Learn.", "Terminaste todas las lecciones. Repasa las que quieras en Aprender."),
  "home.today": S("Today", "Hoy"),
  "home.streak": S("{n}-day streak", "Racha de {n} {n|día|días}"),
  "home.review": S("Review {n} {n|concept|concepts}", "Repasar {n} {n|concepto|conceptos}"),

  // A goal
  "goal.of": S("of {target}", "de {target}"),
  "goal.left": S("{time} left", "Faltan {time}"),
  "goal.due": S("Target date reached", "Fecha alcanzada"),
  "goal.by": S("By {date}", "Para {date}"),
  "goal.plan_line": S("{amount}/month · {path}", "{amount}/mes · {path}"),
  "goal.saved_so_far": S("Saved so far", "Ahorrado hasta ahora"),
  "goal.with_invest": S("With practice investments", "Con inversiones de práctica"),
  "goal.approx": S("≈ {amount} (approx.)", "≈ {amount} (aprox.)"),
  "goal.approx.sample": S("≈ {amount} at a sample exchange rate", "≈ {amount} con un tipo de cambio de ejemplo"),
  "status.on_track": S("On track", "Al día"),
  "status.ahead": S("Ahead", "Adelantada"),
  "status.behind": S("Behind", "Atrasada"),
  "status.paused": S("Paused", "En pausa"),
  "status.done": S("Reached", "Lograda"),
  "goal.plan": S("The plan", "El plan"),
  "goal.plan.body": S("Set aside {amount} a month {where} to reach {target} by {date}.", "Aparta {amount} al mes {where} para llegar a {target} el {date}."),
  "goal.in.cash": S("in cash", "en efectivo"),
  "goal.in.save": S("in a savings account", "en una cuenta de ahorro"),
  "goal.in.save.MX": S("in CETES", "en CETES"),
  "goal.in.invest": S("in an index fund", "en un fondo indexado"),
  "goal.plan.catch_up": S("From where you are now, {amount} a month lands it on the date.", "Desde donde estás ahora, {amount} al mes te lleva a la fecha."),
  "goal.plan.ahead": S("You're ahead of the plan — {amount} a month from here would still land it on the date.", "Vas por delante del plan: {amount} al mes desde aquí todavía te lleva a la fecha."),
  "goal.chart": S("Plan and progress", "Plan y avance"),
  "goal.chart.plan": S("Plan", "Plan"),
  "goal.chart.you": S("You", "Tú"),
  "goal.chart.target": S("Target", "Meta"),
  "goal.paths": S("Same {amount} a month, different paths", "Los mismos {amount} al mes, distintos caminos"),
  "goal.paths.note": S("Growth shortens the wait, but the faster path moves up and down. For money you need soon, steady usually matters more than growth.", "El crecimiento acorta la espera, pero el camino más rápido sube y baja. Para dinero que necesitas pronto, suele importar más la estabilidad que el crecimiento."),
  "goal.milestones": S("Milestones", "Hitos"),
  "goal.saved": S("Set aside", "Apartado"),
  "goal.saved.sub": S("What you've saved for this, recorded by you.", "Lo que has ahorrado para esto, registrado por ti."),
  "goal.record": S("Record money set aside", "Registrar dinero apartado"),
  "goal.record.title": S("Record savings", "Registrar ahorro"),
  "goal.record.amount": S("Amount", "Cantidad"),
  "goal.record.out": S("I took money out", "Saqué dinero"),
  "goal.record.which": S("For which goal?", "¿Para qué meta?"),
  "goal.record.note": S("This is your own log of money you've set aside in real life (or would). Northvale doesn't move or hold any money.", "Es tu propio registro del dinero que has apartado en la vida real (o apartarías). Northvale no mueve ni guarda dinero."),
  "goal.record.save": S("Record", "Registrar"),
  "goal.record.done": S("Recorded. Every bit counts.", "Anotado. Todo suma."),
  "goal.recent": S("Recent entries", "Movimientos recientes"),
  "goal.start_entry": S("Starting amount", "Monto inicial"),
  "goal.remove": S("Remove entry", "Quitar movimiento"),
  "goal.linked": S("Practice investments", "Inversiones de práctica"),
  "goal.linked.sub": S("Link holdings from your practice portfolio. They're shown on their own line next to what you've saved, so you can see how investing could get you there sooner. Their value moves with prices.", "Vincula posiciones de tu portafolio de práctica. Se muestran en su propia línea junto a lo que has ahorrado, para que veas cómo invertir podría acercarte antes. Su valor se mueve con los precios."),
  "goal.linked.none": S("No practice investments linked yet.", "Todavía no hay inversiones de práctica vinculadas."),
  "goal.linked.open": S("Open the practice portfolio", "Abrir el portafolio de práctica"),
  "goal.linked.other": S("Linked to {name}", "Vinculada a {name}"),
  "goal.linked.total": S("Linked value", "Valor vinculado"),
  "goal.linked.pretend": S("Pretend money — practice only.", "Dinero de práctica: solo para aprender."),
  "goal.lessons": S("Lessons for this goal", "Lecciones para esta meta"),
  "goal.edit": S("Edit goal", "Editar meta"),
  "goal.pause": S("Pause", "Pausar"),
  "goal.resume": S("Resume", "Reanudar"),
  "goal.delete": S("Delete", "Borrar"),
  "goal.delete.confirm": S("Delete “{name}”? Its plan and history are removed. This can't be undone.", "¿Borrar “{name}”? Se eliminan su plan y su historial. No se puede deshacer."),
  "goal.deleted": S("Goal deleted", "Meta borrada"),
  "goal.back": S("Home", "Inicio"),

  // Editor
  "edit.new": S("New goal", "Nueva meta"),
  "edit.kind": S("What are you working toward?", "¿Para qué estás trabajando?"),
  "edit.name": S("Name", "Nombre"),
  "edit.name.ph": S("e.g. A used car", "ej. Un coche usado"),
  "edit.target": S("How much?", "¿Cuánto?"),
  "edit.start": S("Already set aside", "Ya tienes apartado"),
  "edit.when": S("By when?", "¿Para cuándo?"),
  "edit.where": S("Where the money waits", "Dónde espera el dinero"),
  "edit.result": S("{amount} a month", "{amount} al mes"),
  "edit.result.week": S("About {amount} a week, until {date}.", "Unos {amount} a la semana, hasta el {date}."),
  "edit.save": S("Save goal", "Guardar meta"),
  "edit.create": S("Create goal", "Crear meta"),
  "edit.saved": S("Goal saved. Future you says thanks.", "Meta guardada. Tu yo del futuro te lo agradece."),
  "edit.replan": S("Saving re-plans from today, keeping what you've set aside.", "Al guardar se vuelve a planear desde hoy, conservando lo que ya apartaste."),

  // Milestones
  "ms.25": S("A quarter of the way", "Una cuarta parte del camino"),
  "ms.50": S("Halfway", "A la mitad"),
  "ms.75": S("Three quarters there", "Tres cuartas partes"),
  "ms.100": S("Goal reached", "Meta lograda"),
  "ms.body": S("{amount} toward {name}.", "{amount} para {name}."),
  "ms.next": S("Next milestone: {pct}% at {amount}.", "Siguiente hito: {pct}% en {amount}."),
  "ms.done": S("Take a moment: that took consistency. When you're ready, set the next one.", "Tómate un momento: eso requirió constancia. Cuando quieras, pon la siguiente."),
  "ms.continue": S("Continue", "Continuar"),
  "ms.next_goal": S("Set the next goal", "Poner la siguiente meta"),

  // Weekly check-in
  "week.title": S("Weekly check-in", "Revisión semanal"),
  "week.ending": S("Week ending {date}", "Semana al {date}"),
  "week.change": S("{amount} this week", "{amount} esta semana"),
  "week.none": S("No change this week", "Sin cambios esta semana"),
  "week.q": S("Did you set anything aside this week?", "¿Apartaste algo esta semana?"),
  "week.record": S("Yes, record it", "Sí, registrar"),
  "week.done": S("Not this week", "Esta semana no"),

  // Lesson step: make a goal
  "create.have": S("You already have a goal. Check its plan, or add another.", "Ya tienes una meta. Revisa su plan o agrega otra."),
  "create.looks_right": S("This plan looks right", "Este plan me parece bien"),
  "create.another": S("Add another goal", "Agregar otra meta"),

  // Onboarding
  "onb.for.title": S("What do you want to learn money skills for?", "¿Para qué quieres aprender de dinero?"),
  "onb.for.sub": S("It picks your first lessons. You can change it any time.", "Con esto elegimos tus primeras lecciones. Lo puedes cambiar cuando quieras."),
  "onb.for.basics": S("Just understanding money", "Solo entender el dinero"),
  "onb.for.basics.sub": S("Start with the basics", "Empezar con lo básico"),
});

// ---- data -----------------------------------------------------------------

const today = () => dayKey();
const locNow = () => ({ lang: getState().settings.lang, region: getState().settings.region });
const save = (fn) => setSlice("goals", fn, DEFAULTS);
const saveGoal = (id, fn) => save((s) => ({ ...s, goals: s.goals.map((g) => (g.id === id ? fn(g) : g)) }));

// Goals saved before plans existed ({ name, target, months, start, path })
// become planned goals from today; ones saved before currencies, the
// current country's.
const migrate = (g, region) => (!g.targetDate ? P.newGoal({ id: g.id, name: g.name, target: g.target, months: g.months || 12, start: g.start || 0, path: g.path, today: today(), region }) : g.currency ? g : { ...g, currency: P.currencyOf(region) });
const goalsNow = () => {
  const s = getState().modules.goals;
  return s ? s.goals.map((g) => migrate(g, locNow().region)) : [];
};
const nameOf = (g, t) => g.name || t(`tpl.${g.template}`);
const fmtFor = (locale, g) => (n) => money(n, { ...locale, currency: g.currency });

function createGoal(fields, region) {
  const g = P.newGoal({ ...fields, today: today(), region });
  save((s) => ({ ...s, goals: [...s.goals, g] }));
  recordPractice("goal");
  checkBadges();
  return g;
}

// Practice holdings (from the portfolio module, if it's there), their
// currency, and the USD/MXN rate (live or sample) for conversions.
function useHoldings(region) {
  const pos = service("portfolio", "usePositions")(region);
  return useMemo(() => (pos ? { ready: pos.ready, list: pos.positions, currency: pos.currency, fx: pos.fx } : { ready: true, list: [], currency: null, fx: null }), [pos]);
}

function useGoals(locale) {
  const slice = useSlice("goals", DEFAULTS);
  const holdings = useHoldings(locale.region);
  const day = today();
  const goals = useMemo(() => slice.goals.map((g) => migrate(g, locale.region)), [slice.goals, locale.region]);
  const rows = useMemo(
    () =>
      goals.map((g) => ({ g, ...P.standing(g, P.linkedValue(g, holdings.list, holdings.currency, holdings.fx && holdings.fx.rate), day) })),
    [goals, holdings, day]
  );
  return { slice, rows, holdings };
}

// Once a day: a savings point for the chart and the weekly check-in, and
// any milestone newly passed (marked, shown once, and an achievement).
function useDailyBookkeeping(rows, holdings, onMilestone) {
  useEffect(() => {
    if (!holdings.ready || !rows.length) return;
    const day = today();
    const legacy = getState().modules.goals.goals.some((g) => !g.targetDate || !g.currency);
    const changes = rows.filter(({ g, saved, fresh }) => {
      const last = g.history[g.history.length - 1];
      return legacy || !last || last[0] !== day || Math.abs(last[1] - saved) > 0.5 || fresh.length;
    });
    if (!changes.length) return;
    let shown = null;
    save((s) => ({
      ...s,
      goals: rows.map(({ g, saved, fresh }) => {
        if (!changes.find((c) => c.g.id === g.id)) return g;
        if (fresh.length && !shown) shown = { id: g.id, m: Math.max(...fresh) };
        return { ...P.withHistory(g, day, saved), milestones: { ...g.milestones, ...Object.fromEntries(fresh.map((m) => [m, day])) } };
      }),
    }));
    if (shown) {
      checkBadges();
      onMilestone(shown);
    }
  }, [rows, holdings.ready]);
}

// ---- small pieces ---------------------------------------------------------

const TONE = { on_track: ["var(--brandSoft)", "var(--brand)"], ahead: ["var(--accentSoft)", "var(--accent)"], done: ["var(--accent)", "var(--onBrand)"], behind: ["var(--warnSoft)", "var(--warn)"], paused: ["var(--surface2)", "var(--mid)"] };
function StatusPill({ t, status }) {
  const [bg, fg] = TONE[status];
  return <span style={{ fontSize: 12, fontWeight: 650, background: bg, color: fg, borderRadius: 999, padding: "4px 10px", whiteSpace: "nowrap", letterSpacing: 0.1 }}>{t(`status.${status}`)}</span>;
}

const NUM = { fontVariantNumeric: "tabular-nums" };

// Saved (solid) and, faintly beyond it, with linked practice investments.
function Bar({ pct, pctWithInvest = pct, height }) {
  return (
    <div role="progressbar" aria-valuemin={0} aria-valuemax={100} aria-valuenow={Math.round(pct)} style={{ position: "relative", height, borderRadius: height, background: "var(--surface2)", overflow: "hidden" }}>
      {pctWithInvest > pct && <div style={{ position: "absolute", top: 0, bottom: 0, left: 0, width: `${pctWithInvest}%`, background: "var(--accent)", opacity: 0.3 }} />}
      <div style={{ position: "absolute", top: 0, bottom: 0, left: 0, width: `${pct}%`, background: "var(--accent)", borderRadius: height, transition: "width .6s cubic-bezier(.2,.7,.2,1)" }} />
    </div>
  );
}
// The main goal's bar as a voyage: the boat at how far you've come, on a
// route to an island with a flag.
function VoyageBar({ pct, pctWithInvest = pct }) {
  const p = Math.max(0, Math.min(100, pct));
  const pi = Math.max(p, Math.min(100, pctWithInvest));
  const ease = "cubic-bezier(.2,.7,.2,1)";
  return (
    <div role="progressbar" aria-valuemin={0} aria-valuemax={100} aria-valuenow={Math.round(pct)} style={{ position: "relative", height: 42, margin: "4px 34px 0 6px" }}>
      <div style={{ position: "absolute", left: 0, right: 0, top: 27, borderTop: "3px dotted var(--artSea2)" }} />
      {pi > p && <div style={{ position: "absolute", left: 0, top: 26, height: 6, width: `${pi}%`, background: "var(--accent)", opacity: 0.3, borderRadius: 3 }} />}
      <div style={{ position: "absolute", left: 0, top: 26, height: 6, width: `${p}%`, background: "var(--accent)", borderRadius: 3, transition: `width .6s ${ease}` }} />
      <span aria-hidden="true" style={{ position: "absolute", top: 1, left: `calc(${p}% - 14px)`, transition: `left .6s ${ease}` }}>
        <Mark size={28} color="var(--artInk)" />
      </span>
      <svg aria-hidden="true" width="40" height="34" viewBox="-20 -26 40 34" style={{ position: "absolute", right: -36, top: 2 }}>
        <path d="M-16 6c4-11 28-11 32 0Z" fill="var(--artSand)" />
        <path d="M1 -2V-22" stroke="var(--artInk)" strokeWidth="2.2" strokeLinecap="round" />
        <path d="M2 -22L14 -18L2 -14Z" fill="var(--artSun)" />
      </svg>
    </div>
  );
}
// A goal kept in another country's currency, converted (approximately).
function Approx({ t, locale, g, amount, fx }) {
  const to = P.currencyOf(locale.region);
  const v = g.currency !== to && fx ? P.convert(amount, g.currency, to, fx.rate) : null;
  if (v == null) return null;
  return <div style={{ fontSize: 13, color: "var(--low)", marginTop: 2, ...NUM }}>{t(fx.sample ? "goal.approx.sample" : "goal.approx", { amount: money(v, locale) })}</div>;
}
// The separate line: saved plus linked practice investments (its swatch
// matches the faint part of the bar).
const InvestLine = ({ t, row, fmt }) =>
  row.linked > 0 ? (
    <div style={{ display: "flex", alignItems: "center", gap: 8, marginTop: 8, fontSize: 14, color: "var(--mid)", ...NUM }}>
      <span style={{ width: 10, height: 10, borderRadius: 3, background: "var(--accent)", opacity: 0.3, flexShrink: 0 }} />
      <span style={{ flex: 1 }}>{t("goal.with_invest")}</span>
      <span style={{ color: "var(--ink)", fontWeight: 650 }}>{fmt(row.withInvest)}</span>
      <span>· {Math.floor(row.pctWithInvest)}%</span>
    </div>
  ) : null;
const timeLeft = (t, g) => {
  const m = P.monthsLeft(g, today());
  return m > 0 ? t("goal.left", { time: dur(t, m) }) : t("goal.due");
};

function TemplateIcon({ id, size = 40 }) {
  return (
    <span style={{ width: size, height: size, borderRadius: 10, background: "var(--brandSoft)", color: "var(--brand)", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
      <Icon name={P.template(id).icon} size={size / 2} />
    </span>
  );
}

function TemplateGrid({ t, onPick, highlight }) {
  return (
    <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(150px, 1fr))", gap: 10 }}>
      {P.TEMPLATES.map((tp) => (
        <button key={tp.id} onClick={() => onPick(tp.id)} className="nv-press" style={{ textAlign: "left", border: `1px solid ${highlight === tp.id ? "var(--brand)" : "var(--line)"}`, background: "var(--surface)", color: "var(--ink)", borderRadius: 14, padding: 14, cursor: "pointer", minHeight: 112, display: "flex", flexDirection: "column", gap: 10 }}>
          <TemplateIcon id={tp.id} size={36} />
          <span>
            <span style={{ display: "block", fontWeight: 650, fontSize: 15 }}>{t(`tpl.${tp.id}`)}</span>
            <span style={{ display: "block", fontSize: 13, color: "var(--mid)", marginTop: 2, lineHeight: 1.35 }}>{t(`tpl.${tp.id}.sub`)}</span>
          </span>
        </button>
      ))}
    </div>
  );
}

// ---- the editor -----------------------------------------------------------

// Amount, date and path for a new goal (from a template, or a lesson's
// `preset`) or an existing one. `simple` (onboarding, lessons) leaves out
// the path, and the name unless it's a custom goal.
function GoalForm({ t, locale, templateId = "custom", goal, preset = {}, onSave, simple, saveLabel }) {
  const R = goal ? P.regionOf(goal) : locale.region;
  const tpl = P.template(goal ? goal.template : templateId);
  const fmt = (n) => money(n, { ...locale, currency: P.currencyOf(R) });
  const askName = !simple || tpl.id === "custom";
  const [name, setName] = useState(goal ? goal.name : preset.name || (tpl.id === "custom" ? "" : t(`tpl.${tpl.id}`)));
  const [target, setTarget] = useState(goal ? goal.target : amt(preset.target || tpl.amount, R));
  const [start, setStart] = useState(0);
  const [months, setMonths] = useState(goal ? Math.max(1, P.monthsLeft(goal, today())) : preset.months || tpl.months);
  const [path, setPath] = useState(goal ? goal.path : tpl.path);
  const rates = exampleRates(R);
  const have = goal ? P.saved(goal) : start;
  const preview = P.newGoal({ templateId: tpl.id, name, target, months, start: have, path, today: today(), region: R });
  const step = target > amt([20000, 300000], R) ? amt([500, 5000], R) : amt([50, 500], R);
  return (
    <div>
      {askName && <Field label={t("edit.name")} value={name} onChange={(e) => setName(e.target.value)} placeholder={t("edit.name.ph")} maxLength={40} />}
      <Slider label={t("edit.target")} value={target} min={amt([100, 1000], R)} max={amt([50000, 800000], R)} step={step} onChange={setTarget} display={<span style={NUM}>{fmt(target)}</span>} />
      {!goal && <Slider label={t("edit.start")} value={Math.min(start, target)} min={0} max={target} step={amt([25, 250], R)} onChange={setStart} display={<span style={NUM}>{fmt(start)}</span>} />}
      <Slider label={t("edit.when")} value={months} min={1} max={120} onChange={setMonths} display={`${dur(t, months)} · ${shortDate(preview.targetDate, { ...locale, year: true })}`} />
      {!simple && (
        <>
          <div style={{ fontSize: 14, fontWeight: 650, color: "var(--mid)", marginBottom: 6 }}>{t("edit.where")}</div>
          <Segmented label={t("edit.where")} value={path} onChange={setPath} options={PATHS.map((p) => ({ value: p, label: pathLabel(t, p, R) }))} />
        </>
      )}
      <Card style={{ margin: "14px 0" }}>
        <div style={{ fontSize: 26, fontWeight: 700, letterSpacing: -0.5, ...NUM }}>{t("edit.result", { amount: fmt(preview.monthly) })}</div>
        <div style={{ fontSize: 14, color: "var(--mid)", marginTop: 2 }}>{t("edit.result.week", { amount: fmt(Math.ceil((preview.monthly * 12) / 52)), date: shortDate(preview.targetDate, { ...locale, year: true }) })}</div>
        <p style={{ fontSize: 13, color: "var(--low)", lineHeight: 1.45, margin: "10px 0 0" }}>{t(R === "MX" ? "goals.rates.MX" : "goals.rates", { save: rates.save, invest: rates.invest, low: rates.investLow, high: rates.investHigh })}</p>
      </Card>
      {goal && <p style={{ fontSize: 13, color: "var(--mid)", margin: "0 0 12px" }}>{t("edit.replan")}</p>}
      <Button full disabled={askName && !name.trim()} onClick={() => onSave({ templateId: tpl.id, name: name.trim(), target, months, start: Math.min(start, target), path, targetDate: preview.targetDate })}>
        {saveLabel || (goal ? t("edit.save") : t("edit.create"))}
      </Button>
    </div>
  );
}

function NewGoalSheet({ t, locale, open, initial, onClose, onCreated }) {
  const [tpl, setTpl] = useState(null);
  useEffect(() => {
    setTpl(open ? initial || null : null);
  }, [open, initial]);
  const close = () => (setTpl(null), onClose());
  return (
    <Sheet open={open} onClose={close} title={t("edit.new")} tall>
      {!tpl ? (
        <>
          <p style={{ margin: "0 0 12px", color: "var(--mid)" }}>{t("edit.kind")}</p>
          <TemplateGrid t={t} onPick={setTpl} />
        </>
      ) : (
        <GoalForm
          key={tpl}
          t={t}
          locale={locale}
          templateId={tpl}
          onSave={(f) => {
            const g = createGoal(f, locale.region);
            toast(t("edit.saved"), "good");
            close();
            onCreated && onCreated(g);
          }}
        />
      )}
    </Sheet>
  );
}

// ---- recording savings ----------------------------------------------------

function RecordSheet({ t, locale, open, onClose, goals, goalId }) {
  const [which, setWhich] = useState(goalId);
  const [value, setValue] = useState("");
  const [out, setOut] = useState(false);
  useEffect(() => {
    if (open) (setWhich(goalId), setValue(""), setOut(false));
  }, [open, goalId]);
  const sel = goals.find((g) => g.id === which);
  const n = Math.round(Number(String(value).replace(/[^\d.]/g, "")) * 100) / 100;
  const ok = n > 0 && n < 1e8 && which;
  const record = () => {
    saveGoal(which, (g) => ({ ...g, contributions: [...g.contributions, { date: today(), amount: out ? -n : n }].slice(-500) }));
    toast(t("goal.record.done"), "good");
    onClose();
  };
  return (
    <Sheet open={open} onClose={onClose} title={t("goal.record.title")}>
      {goals.length > 1 && (
        <div style={{ marginBottom: 12 }}>
          <div style={{ fontSize: 14, fontWeight: 650, color: "var(--mid)", marginBottom: 6 }}>{t("goal.record.which")}</div>
          <select value={which || ""} onChange={(e) => setWhich(e.target.value)} aria-label={t("goal.record.which")} style={{ width: "100%", border: "1px solid var(--line)", borderRadius: 10, background: "var(--surface)", color: "var(--ink)", padding: "12px 14px", fontSize: 16, minHeight: 48 }}>
            {goals.map((g) => (
              <option key={g.id} value={g.id}>
                {nameOf(g, t)}
              </option>
            ))}
          </select>
        </div>
      )}
      <Field label={t("goal.record.amount")} inputMode="decimal" value={value} onChange={(e) => setValue(e.target.value)} placeholder={sel ? money(amt([50, 500], P.regionOf(sel)), { ...locale, currency: sel.currency }) : ""} autoFocus style={{ fontSize: 22, fontWeight: 650, ...NUM }} />
      <label style={{ display: "flex", alignItems: "center", gap: 10, fontSize: 15, marginBottom: 14, minHeight: 44, cursor: "pointer" }}>
        <input type="checkbox" checked={out} onChange={(e) => setOut(e.target.checked)} style={{ width: 20, height: 20, accentColor: "var(--brand)" }} />
        {t("goal.record.out")}
      </label>
      <Note icon="info" style={{ marginBottom: 14 }}>{t("goal.record.note")}</Note>
      <Button full disabled={!ok} onClick={record}>
        {t("goal.record.save")}
      </Button>
    </Sheet>
  );
}

// ---- milestone moment -----------------------------------------------------

function MilestoneSheet({ t, locale, shown, rows, onClose, onNewGoal }) {
  const row = shown && rows.find((r) => r.g.id === shown.id);
  if (!row) return null;
  const { g, saved } = row;
  const fmt = fmtFor(locale, g);
  const next = P.MILESTONES.find((m) => m > shown.m);
  return (
    <Sheet open onClose={onClose} title={t(`ms.${shown.m}`)}>
      <div style={{ padding: "4px 2px 2px" }}>
        <div style={{ display: "flex", alignItems: "center", gap: 14, marginBottom: 16 }}>
          <TemplateIcon id={g.template} size={48} />
          <div style={{ minWidth: 0 }}>
            <div style={{ fontSize: 28, fontWeight: 700, letterSpacing: -0.5, ...NUM }}>{fmt(saved)}</div>
            <div style={{ fontSize: 15, color: "var(--mid)" }}>{t("ms.body", { amount: t("goal.of", { target: fmt(g.target) }), name: nameOf(g, t) })}</div>
          </div>
        </div>
        <div style={{ display: "flex", gap: 4, marginBottom: 16 }} aria-hidden>
          {P.MILESTONES.map((m) => (
            <div key={m} style={{ flex: 1, height: 6, borderRadius: 3, background: m <= shown.m ? "var(--accent)" : "var(--surface2)", transition: "background .6s" }} />
          ))}
        </div>
        <p style={{ fontSize: 16, lineHeight: 1.5, margin: "0 0 18px" }}>{next ? t("ms.next", { pct: next, amount: fmt((g.target * next) / 100) }) : t("ms.done")}</p>
        <Button full onClick={onClose}>
          {t("ms.continue")}
        </Button>
        {!next && (
          <Button full kind="ghost" style={{ marginTop: 6 }} onClick={() => (onClose(), onNewGoal())}>
            {t("ms.next_goal")}
          </Button>
        )}
      </div>
    </Sheet>
  );
}

// ---- home -----------------------------------------------------------------

function GoalCard({ t, locale, row, fx, big, onClick }) {
  const { g, saved, pct, pctWithInvest, status } = row;
  const fmt = fmtFor(locale, g);
  return (
    <Card onClick={onClick} pad={big ? 20 : 16}>
      <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
        <TemplateIcon id={g.template} size={big ? 40 : 34} />
        <div style={{ flex: 1, minWidth: 0 }}>
          <div style={{ fontWeight: 650, fontSize: big ? 17 : 16, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{nameOf(g, t)}</div>
          <div style={{ fontSize: 13, color: "var(--mid)" }}>{timeLeft(t, g)}</div>
        </div>
        <StatusPill t={t} status={status} />
      </div>
      {big && <div style={{ fontSize: 13, color: "var(--mid)", marginTop: 16 }}>{t("goal.saved_so_far")}</div>}
      <div style={{ display: "flex", alignItems: "baseline", flexWrap: "wrap", gap: "0 8px", margin: big ? "2px 0 0" : "12px 0 0", ...NUM }}>
        <span className={big ? "nv-disp" : undefined} style={{ fontSize: big ? 40 : 22, fontWeight: big ? undefined : 700, letterSpacing: big ? -0.8 : -0.3, lineHeight: 1.15, color: big ? "var(--head)" : undefined }}>{fmt(saved)}</span>
        <span style={{ fontSize: big ? 15 : 14, color: "var(--mid)" }}>{t("goal.of", { target: fmt(g.target) })}</span>
      </div>
      <Approx t={t} locale={locale} g={g} amount={saved} fx={fx} />
      <div style={{ marginTop: big ? 10 : 8 }}>{big ? <VoyageBar pct={pct} pctWithInvest={pctWithInvest} /> : <Bar pct={pct} pctWithInvest={pctWithInvest} height={6} />}</div>
      <InvestLine t={t} row={row} fmt={fmt} />
      {big && (
        <div style={{ display: "flex", justifyContent: "space-between", marginTop: 8, fontSize: 14, color: "var(--mid)", ...NUM }}>
          <span>{t("goal.plan_line", { amount: fmt(g.monthly), path: pathLabel(t, g.path, P.regionOf(g)) })}</span>
          <span>{Math.floor(pct)}%</span>
        </div>
      )}
    </Card>
  );
}

function CheckIn({ t, locale, rows, onRecord, onDone }) {
  const sunday = P.lastSunday(today());
  return (
    <Card>
      <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 10 }}>
        <Icon name="calendar" size={18} />
        <span style={{ fontWeight: 650, flex: 1 }}>{t("week.title")}</span>
        <span style={{ fontSize: 13, color: "var(--mid)" }}>{t("week.ending", { date: shortDate(sunday, locale) })}</span>
      </div>
      {rows.map(({ g, status }) => {
        const ch = P.weekChange(g, sunday);
        const fmt = (n) => fmtFor(locale, g)(Math.abs(n));
        return (
          <div key={g.id} style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: 10, padding: "8px 0", borderTop: "1px solid var(--line)" }}>
            <span style={{ minWidth: 0 }}>
              <span style={{ display: "block", fontSize: 15, fontWeight: 600, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{nameOf(g, t)}</span>
              <span style={{ display: "block", color: "var(--mid)", fontSize: 13, ...NUM }}>{ch ? t("week.change", { amount: `${ch > 0 ? "+" : "−"}${fmt(ch)}` }) : t("week.none")}</span>
            </span>
            <StatusPill t={t} status={status} />
          </div>
        );
      })}
      <p style={{ margin: "10px 0 12px", fontSize: 15 }}>{t("week.q")}</p>
      <div style={{ display: "flex", gap: 8 }}>
        <Button size="md" onClick={onRecord} style={{ flex: 1 }}>
          {t("week.record")}
        </Button>
        <Button size="md" kind="secondary" onClick={onDone} style={{ flex: 1, border: "1px solid var(--line)" }}>
          {t("week.done")}
        </Button>
      </div>
    </Card>
  );
}

function Home({ t, locale, go, data, setOpen, sheets }) {
  const { slice, rows } = data;
  const goalFor = useAppState((s) => s.profile.goalFor);
  const lead = P.primaryGoal(rows.map((r) => r.g));
  const leadRow = lead && rows.find((r) => r.g.id === lead.id);
  const others = rows.filter((r) => r !== leadRow);
  const sunday = P.lastSunday(today());
  const checkIn = P.checkInDue(rows.map((r) => r.g), slice.checkIn, today());
  const doneForWeek = () => save((s) => ({ ...s, checkIn: sunday }));
  return (
    <div>
      <Title sub={t("goals.sub")}>{t("goals.nav")}</Title>
      {!leadRow ? (
        <>
          <div style={{ borderRadius: 24, overflow: "hidden", boxShadow: "var(--lift)", marginBottom: 14 }}>
            <Scene name="harbor" w={358} h={140} />
          </div>
          <Label style={{ marginTop: 4 }}>{t("home.empty.title")}</Label>
          <p style={{ fontSize: 15, color: "var(--mid)", lineHeight: 1.45, margin: "-4px 0 14px" }}>{t("home.empty.sub")}</p>
          <TemplateGrid t={t} onPick={(id) => sheets.newGoal(id)} highlight={goalFor} />
        </>
      ) : (
        <>
          <GoalCard t={t} locale={locale} row={leadRow} fx={data.holdings.fx} big onClick={() => setOpen(leadRow.g.id)} />
          {checkIn && (
            <div style={{ marginTop: 12 }}>
              <CheckIn t={t} locale={locale} rows={rows.filter((r) => r.g.status !== "paused")} onRecord={() => (doneForWeek(), sheets.record(lead.id))} onDone={doneForWeek} />
            </div>
          )}
          <Button full kind="secondary" style={{ marginTop: 12 }} onClick={() => sheets.record(lead.id)}>
            <Icon name="plus" size={18} /> {t("goal.record")}
          </Button>
          {others.length > 0 && <Label>{t("home.other_goals")}</Label>}
          <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
            {others.map((r) => (
              <GoalCard key={r.g.id} t={t} locale={locale} row={r} fx={data.holdings.fx} onClick={() => setOpen(r.g.id)} />
            ))}
          </div>
          <Button full kind="ghost" style={{ marginTop: 10 }} onClick={() => sheets.newGoal()}>
            <Icon name="plus" size={18} /> {t("home.new_goal")}
          </Button>
        </>
      )}
      <Note icon="shield" style={{ marginTop: 18 }}>{t("goals.disclaimer")}</Note>
    </div>
  );
}

// ---- Practice → Tools from your lessons -------------------------------------

// Each calculator opens after the first lesson that uses it — or for anyone
// who has already used the calculators (they were on Home before).
function useTools() {
  const progress = useAppState((s) => s.progress);
  const used = (progress.counters.sim || 0) > 0;
  return CALCULATORS.map(([id, icon, Tool]) => {
    const lesson = service("lessons", "firstLessonWith")(`goals.${id}`);
    return { id, icon, Tool, lesson, open: used || !lesson || service("lessons", "lessonDone")(lesson.id) };
  });
}
function ToolsScreen({ t, locale }) {
  const tools = useTools();
  const [tool, setTool] = useState(null);
  const Tool = tool && tools.find((x) => x.id === tool).Tool;
  return (
    <div>
      <Title sub={t("tools.sub")}>{t("goals.tools")}</Title>
      <List>
        {tools.map(({ id, icon, lesson, open }) => (
          <ListRow key={id} icon={icon} title={t(`goals.tool.${id}`)} sub={lesson ? t(open ? "tools.from" : "tools.after", { lesson: text(lesson.title, locale) }) : null} locked={!open} onClick={() => setTool(id)} />
        ))}
      </List>
      <Note icon="shield" style={{ marginTop: 18 }}>{t("goals.disclaimer")}</Note>
      <Sheet open={!!tool} onClose={() => setTool(null)} title={tool ? t(`goals.tool.${tool}`) : ""} tall>
        {Tool && <Tool t={t} locale={locale} params={{}} />}
      </Sheet>
    </div>
  );
}
function ToolsRow({ t, go }) {
  const tools = useTools();
  const seen = useSeen("tools");
  const n = tools.filter((x) => x.open).length;
  return <ListRow icon="pie" title={t("goals.tools")} sub={n ? t("tools.row.sub", { n, total: tools.length }) : t("tools.row.none")} locked={!n} isNew={n > 0 && !seen && t("common.new")} onClick={() => (markIntro("tools"), go("tools"))} />;
}

// Today, after the first lesson: the amount and date for the goal picked
// in onboarding, as an optional question.
function PlanPrompt({ t, go }) {
  const id = useAppState((s) => s.profile.goalFor);
  return (
    <Card style={{ marginTop: 12 }}>
      <div style={{ fontWeight: 750, fontSize: 17 }}>{t("plan.ask.title")}</div>
      <div style={{ display: "flex", alignItems: "center", gap: 10, margin: "10px 0 6px" }}>
        <TemplateIcon id={id} size={32} />
        <span style={{ fontWeight: 650 }}>{t(`tpl.${id}`)}</span>
      </div>
      <p style={{ fontSize: 14, color: "var(--mid)", lineHeight: 1.45, margin: "0 0 12px" }}>{t("plan.ask.sub")}</p>
      <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
        <Button size="md" onClick={() => (markIntro("goalPlan"), go("goals", { newGoal: id }))}>
          {t("plan.ask.yes")}
        </Button>
        <Button size="md" kind="secondary" onClick={() => markIntro("goalPlan")}>
          {t("plan.ask.no")}
        </Button>
      </div>
    </Card>
  );
}

// ---- one goal -------------------------------------------------------------

function GoalPage({ t, locale, go, row, data, onBack, sheets }) {
  const { g, saved, pct, status } = row;
  const R = P.regionOf(g);
  const fmt = fmtFor(locale, g);
  const [editing, setEditing] = useState(false);
  const [confirm, setConfirm] = useState(false);
  const n = P.needs(g, saved, today());
  const plan = P.planLine(g);
  const you = P.progressLine(g);
  const span = plan[plan.length - 1][0];
  const otherGoal = (sym) => data.rows.find((r) => r.g.id !== g.id && r.g.linked.includes(sym));
  const toggleLink = (sym) =>
    save((s) => ({
      ...s,
      goals: s.goals.map((x) => (x.id === g.id ? { ...x, linked: x.linked.includes(sym) ? x.linked.filter((y) => y !== sym) : [...x.linked, sym] } : { ...x, linked: (x.linked || []).filter((y) => y !== sym) })),
    }));
  const { linked } = row;
  const holdingFmt = (v) => money(v, { ...locale, currency: data.holdings.currency });
  const entries = [...g.contributions].reverse().slice(0, 5);
  // The next open lesson in each unit that helps this goal (units are
  // distinct, so lessons are too).
  const lessons = P.unitsFor(g)
    .map((u) => service("lessons", "nextFor")([u]))
    .filter((l, i) => l && l.unit === P.unitsFor(g)[i])
    .slice(0, 3);
  return (
    <div>
      <button onClick={onBack} className="nv-press" style={{ display: "inline-flex", alignItems: "center", gap: 4, border: "none", background: "transparent", color: "var(--mid)", fontSize: 15, fontWeight: 600, padding: "10px 4px", marginLeft: -4, cursor: "pointer", minHeight: 44 }}>
        <Icon name="back" size={18} /> {t("goal.back")}
      </button>
      <div style={{ display: "flex", alignItems: "center", gap: 12, margin: "4px 0 14px" }}>
        <TemplateIcon id={g.template} size={44} />
        <div style={{ flex: 1, minWidth: 0 }}>
          <h1 style={{ fontSize: 24, fontWeight: 700, letterSpacing: -0.5, margin: 0, lineHeight: 1.2 }}>{nameOf(g, t)}</h1>
          <div style={{ fontSize: 14, color: "var(--mid)" }}>
            {t("goal.by", { date: shortDate(g.targetDate, { ...locale, year: true }) })} · {timeLeft(t, g)}
          </div>
        </div>
        <StatusPill t={t} status={status} />
      </div>

      <Card pad={20}>
        <div style={{ fontSize: 13, color: "var(--mid)" }}>{t("goal.saved_so_far")}</div>
        <div style={{ display: "flex", alignItems: "baseline", flexWrap: "wrap", gap: "0 8px", ...NUM }}>
          <span style={{ fontSize: 38, fontWeight: 700, letterSpacing: -1, lineHeight: 1.15 }}>{fmt(saved)}</span>
          <span style={{ fontSize: 15, color: "var(--mid)" }}>{t("goal.of", { target: fmt(g.target) })}</span>
        </div>
        <Approx t={t} locale={locale} g={g} amount={saved} fx={data.holdings.fx} />
        <div style={{ display: "flex", gap: 4, margin: "14px 0 6px" }} aria-label={t("goal.milestones")} role="img">
          {P.MILESTONES.map((m, i) => {
            const prev = i ? P.MILESTONES[i - 1] : 0;
            const part = (v) => `${Math.max(0, Math.min(1, (v - prev) / (m - prev))) * 100}%`;
            return (
              <div key={m} style={{ position: "relative", flex: 1, height: 8, borderRadius: 4, background: "var(--surface2)", overflow: "hidden" }}>
                <div style={{ position: "absolute", top: 0, bottom: 0, left: 0, width: part(row.pctWithInvest), background: "var(--accent)", opacity: 0.3 }} />
                <div style={{ position: "absolute", top: 0, bottom: 0, left: 0, width: part(pct), background: "var(--accent)", transition: "width .6s cubic-bezier(.2,.7,.2,1)" }} />
              </div>
            );
          })}
        </div>
        <div style={{ display: "flex", justifyContent: "space-between", fontSize: 12, color: "var(--low)", ...NUM }}>
          {P.MILESTONES.map((m) => (
            <span key={m} style={{ flex: 1, textAlign: "right", color: g.milestones[m] ? "var(--accent)" : undefined, fontWeight: g.milestones[m] ? 650 : 400 }}>
              {m}%
            </span>
          ))}
        </div>
        <InvestLine t={t} row={row} fmt={fmt} />
        <div style={{ display: "flex", gap: 8, marginTop: 16 }}>
          <Button size="md" style={{ flex: 1 }} onClick={() => sheets.record(g.id)}>
            <Icon name="plus" size={18} /> {t("goal.record")}
          </Button>
          {/* The card shows only the percent unless the learner (18+) turns the name and amounts on. */}
          <Button size="md" kind="secondary" onClick={() => openShare({ kind: "goal", pct: Math.floor(pct), name: nameOf(g, t), saved: fmt(saved), target: fmt(g.target) })}>
            <Icon name="share" size={18} /> {t("share.button")}
          </Button>
        </div>
      </Card>

      <Label>{t("goal.plan")}</Label>
      <Card>
        <p style={{ margin: 0, fontSize: 16, lineHeight: 1.5 }}>{t("goal.plan.body", { amount: fmt(g.monthly), where: t(g.path === "save" && R === "MX" ? "goal.in.save.MX" : `goal.in.${g.path}`), target: fmt(g.target), date: shortDate(g.targetDate, { ...locale, year: true }) })}</p>
        {status === "behind" && <Note style={{ marginTop: 10, background: "var(--warnSoft)" }}>{t("goal.plan.catch_up", { amount: fmt(n.perMonth) })}</Note>}
        {status === "ahead" && <p style={{ margin: "8px 0 0", fontSize: 14, color: "var(--mid)" }}>{t("goal.plan.ahead", { amount: fmt(n.perMonth) })}</p>}
        <div style={{ marginTop: 14 }}>
          <LineChart xDomain={[0, span]} lines={[{ points: plan, color: "var(--low)", dash: true }, { points: you.length > 1 ? you : [], color: "var(--accent)" }]} markers={[{ value: g.target, color: "var(--line)" }]} height={130} label={t("goal.chart")} />
          <div style={{ display: "flex", justifyContent: "space-between", fontSize: 12, color: "var(--low)", marginTop: 6, ...NUM }}>
            <span>{shortDate(g.createdAt, { ...locale, year: true })}</span>
            <span>
              {t("goal.chart.target")} {fmt(g.target)} · {shortDate(g.targetDate, { ...locale, year: true })}
            </span>
          </div>
          <Legend
            items={[
              { label: t("goal.chart.plan"), color: "var(--low)" },
              { label: t("goal.chart.you"), color: "var(--accent)" },
            ]}
          />
        </div>
      </Card>

      <Label>{t("goal.paths", { amount: fmt(g.monthly) })}</Label>
      <Card pad="6px 18px">
        {n.byPath.map((p) => (
          <div key={p.path} style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: 10, padding: "12px 0", borderTop: p.path === "cash" ? "none" : "1px solid var(--line)" }}>
            <span style={{ display: "flex", alignItems: "center", gap: 10, fontSize: 15 }}>
              <span style={{ width: 10, height: 10, borderRadius: 5, background: PATH_COLORS[p.path] }} />
              {pathLabel(t, p.path, R)}
              <span style={{ color: "var(--low)", fontSize: 13, ...NUM }}>{p.rate}%</span>
              {p.path === g.path && <Icon name="check" size={16} color="var(--accent)" label={t("goal.plan")} />}
            </span>
            <span style={{ fontWeight: 650, ...NUM }}>{dur(t, p.months)}</span>
          </div>
        ))}
      </Card>
      <p style={{ fontSize: 13, color: "var(--mid)", lineHeight: 1.5, margin: "8px 2px 0" }}>{t("goal.paths.note")}</p>

      <Label>{t("goal.linked")}</Label>
      <Card>
        <p style={{ margin: "0 0 10px", fontSize: 14, color: "var(--mid)", lineHeight: 1.45 }}>{t("goal.linked.sub")}</p>
        {data.holdings.list.length === 0 ? (
          <Button size="md" kind="secondary" style={{ border: "1px solid var(--line)" }} onClick={() => go("portfolio")}>
            {t("goal.linked.open")}
          </Button>
        ) : (
          <>
            {data.holdings.list.map((h) => {
              const other = otherGoal(h.symbol);
              const on = g.linked.includes(h.symbol);
              return (
                <label key={h.symbol} style={{ display: "flex", alignItems: "center", gap: 12, padding: "10px 0", borderTop: "1px solid var(--line)", cursor: "pointer", minHeight: 48 }}>
                  <input type="checkbox" checked={on} onChange={() => toggleLink(h.symbol)} style={{ width: 20, height: 20, accentColor: "var(--brand)", flexShrink: 0 }} />
                  <span style={{ flex: 1, minWidth: 0 }}>
                    <span style={{ display: "block", fontWeight: 650, fontSize: 15 }}>{h.symbol}</span>
                    <span style={{ display: "block", fontSize: 13, color: "var(--mid)", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{other && !on ? t("goal.linked.other", { name: nameOf(other.g, t) }) : h.name}</span>
                  </span>
                  <span style={{ fontWeight: 650, ...NUM }}>{holdingFmt(h.value)}</span>
                </label>
              );
            })}
            <div style={{ display: "flex", justifyContent: "space-between", paddingTop: 10, borderTop: "1px solid var(--line)", fontSize: 15, fontWeight: 650, ...NUM }}>
              <span>{t("goal.linked.total")}</span>
              <span>
                {data.holdings.currency !== g.currency && "≈ "}
                {fmt(linked)}
              </span>
            </div>
            <div style={{ fontSize: 13, color: "var(--low)", marginTop: 4 }}>{t("goal.linked.pretend")}</div>
          </>
        )}
      </Card>

      <Label>{t("goal.saved")}</Label>
      <Card pad="6px 18px">
        {entries.map((c, i) => (
          <div key={`${c.date}${i}`} style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: 10, padding: "10px 0", borderTop: i ? "1px solid var(--line)" : "none", ...NUM }}>
            <span style={{ fontSize: 14, color: "var(--mid)" }}>{shortDate(c.date, locale)}</span>
            <span style={{ display: "flex", alignItems: "center", gap: 4 }}>
              <span style={{ fontWeight: 650, color: c.amount < 0 ? "var(--mid)" : "var(--ink)" }}>
                {c.amount < 0 ? "−" : "+"}
                {fmt(Math.abs(c.amount))}
              </span>
              <button aria-label={t("goal.remove")} onClick={() => saveGoal(g.id, (x) => ({ ...x, contributions: x.contributions.filter((y) => y !== x.contributions[x.contributions.length - 1 - i]) }))} style={{ border: "none", background: "transparent", color: "var(--low)", width: 36, height: 36, cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center" }}>
                <Icon name="close" size={14} />
              </button>
            </span>
          </div>
        ))}
        <div style={{ display: "flex", justifyContent: "space-between", padding: "10px 0", borderTop: entries.length ? "1px solid var(--line)" : "none", fontSize: 14, color: "var(--mid)", ...NUM }}>
          <span>{t("goal.start_entry")}</span>
          <span>{fmt(g.start)}</span>
        </div>
      </Card>

      {lessons.length > 0 && (
        <>
          <Label>{t("goal.lessons")}</Label>
          <Card pad="4px 18px">
            {lessons.map((l, i) => (
              <button key={l.id} onClick={() => go("lessons", { lesson: l.id })} className="nv-press" style={{ display: "flex", alignItems: "center", gap: 12, width: "100%", textAlign: "left", border: "none", borderTop: i ? "1px solid var(--line)" : "none", background: "transparent", color: "var(--ink)", padding: "12px 0", cursor: "pointer", minHeight: 52 }}>
                <Icon name="book" size={18} color="var(--mid)" />
                <span style={{ flex: 1, minWidth: 0 }}>
                  <span style={{ display: "block", fontWeight: 650, fontSize: 15 }}>{text(l.title, locale)}</span>
                  <span style={{ display: "block", fontSize: 13, color: "var(--mid)" }}>{text(l.unitTitle, locale)}</span>
                </span>
                <Icon name="next" size={16} color="var(--low)" />
              </button>
            ))}
          </Card>
        </>
      )}

      <div style={{ display: "flex", gap: 8, marginTop: 22 }}>
        <Button size="md" kind="secondary" style={{ flex: 1, border: "1px solid var(--line)" }} onClick={() => setEditing(true)}>
          {t("goal.edit")}
        </Button>
        {status !== "done" && (
          <Button size="md" kind="secondary" style={{ flex: 1, border: "1px solid var(--line)" }} onClick={() => saveGoal(g.id, (x) => ({ ...x, status: x.status === "paused" ? "active" : "paused" }))}>
            {g.status === "paused" ? t("goal.resume") : t("goal.pause")}
          </Button>
        )}
        <Button size="md" kind="ghost" style={{ flex: 1 }} onClick={() => setConfirm(true)}>
          {t("goal.delete")}
        </Button>
      </div>
      <Note icon="shield" style={{ marginTop: 18 }}>{t("goals.disclaimer")}</Note>

      <Sheet open={editing} onClose={() => setEditing(false)} title={t("goal.edit")} tall>
        {editing && (
          <GoalForm
            t={t}
            locale={locale}
            goal={g}
            onSave={(f) => {
              saveGoal(g.id, (x) => P.replan(x, { name: f.name, target: f.target, targetDate: f.targetDate, path: f.path }, today()));
              toast(t("edit.saved"), "good");
              setEditing(false);
            }}
          />
        )}
      </Sheet>
      <Sheet open={confirm} onClose={() => setConfirm(false)} title={t("goal.delete")}>
        <p style={{ fontSize: 16, lineHeight: 1.5, margin: "0 0 16px" }}>{t("goal.delete.confirm", { name: nameOf(g, t) })}</p>
        <Button full kind="bad" onClick={() => (save((s) => ({ ...s, goals: s.goals.filter((x) => x.id !== g.id) })), toast(t("goal.deleted")), onBack())}>
          {t("goal.delete")}
        </Button>
        <Button full kind="ghost" style={{ marginTop: 6 }} onClick={() => setConfirm(false)}>
          {t("common.cancel")}
        </Button>
      </Sheet>
    </div>
  );
}

// ---- the screen -----------------------------------------------------------

function Screen({ t, locale, go, route }) {
  const data = useGoals(locale);
  const [open, setOpen] = useState(route.params.goal || null);
  const [newGoal, setNewGoal] = useState(route.params.newGoal ? { template: route.params.newGoal } : null); // null | { template }
  const [record, setRecord] = useState(route.params.record || null);
  const [milestone, setMilestone] = useState(null);
  useDailyBookkeeping(data.rows, data.holdings, setMilestone);
  useEffect(() => {
    window.scrollTo(0, 0);
  }, [open]);
  const sheets = { newGoal: (template) => setNewGoal({ template }), record: (id) => setRecord(id) };
  const row = open && data.rows.find((r) => r.g.id === open);
  return (
    <>
      {row ? <GoalPage t={t} locale={locale} go={go} row={row} data={data} onBack={() => setOpen(null)} sheets={sheets} /> : <Home t={t} locale={locale} go={go} data={data} setOpen={setOpen} sheets={sheets} />}
      <NewGoalSheet t={t} locale={locale} open={!!newGoal} initial={newGoal && newGoal.template} onClose={() => setNewGoal(null)} onCreated={(g) => setOpen(g.id)} />
      <RecordSheet t={t} locale={locale} open={!!record} goalId={record} goals={data.rows.filter((r) => r.g.status !== "paused").map((r) => r.g)} onClose={() => setRecord(null)} />
      <MilestoneSheet t={t} locale={locale} shown={milestone} rows={data.rows} onClose={() => setMilestone(null)} onNewGoal={() => (setOpen(null), setNewGoal({}))} />
    </>
  );
}

// A lesson's "make a goal" step. If there's already a goal of that kind (or
// any goal, when the lesson doesn't name a kind), look at its plan — or add
// another — instead of making a duplicate.
function CreateGoal({ params = {}, t, locale, onDone, done }) {
  const R = locale.region;
  const slice = useSlice("goals", DEFAULTS);
  const [another, setAnother] = useState(false);
  const goals = slice.goals.map((g) => migrate(g, R));
  const lead = params.template ? goals.find((g) => g.template === params.template) : P.primaryGoal(goals);
  if (lead && !another) {
    const fmt = fmtFor(locale, lead);
    return (
      <Card>
        <p style={{ margin: "0 0 12px", color: "var(--mid)", lineHeight: 1.45 }}>{t("create.have")}</p>
        <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 12 }}>
          <TemplateIcon id={lead.template} size={36} />
          <div style={{ flex: 1, minWidth: 0 }}>
            <div style={{ fontWeight: 650 }}>{nameOf(lead, t)}</div>
            <div style={{ fontSize: 14, color: "var(--mid)", ...NUM }}>
              {fmt(lead.target)} · {t("goal.plan_line", { amount: fmt(lead.monthly), path: pathLabel(t, lead.path, P.regionOf(lead)) })}
            </div>
          </div>
        </div>
        <Button full disabled={done} onClick={() => (recordPractice("goal"), onDone && onDone())}>
          {t("create.looks_right")}
        </Button>
        <Button full kind="ghost" style={{ marginTop: 6 }} onClick={() => setAnother(true)}>
          {t("create.another")}
        </Button>
      </Card>
    );
  }
  const preset = { name: params.name ? text(params.name, locale) : "", target: params.target, months: params.months };
  return (
    <Card>
      <GoalForm t={t} locale={locale} templateId={params.template} preset={preset} simple onSave={(f) => (createGoal(f, R), toast(t("edit.saved"), "good"), onDone && onDone())} />
    </Card>
  );
}

// ---- first run: what the learner wants money skills for -------------------

// The goal templates (not "something else"), or just the basics. It picks
// the first unit and becomes Today's "Building toward" line; the amount and
// date come later, as an optional question after the first lesson.
const REASON = { emergency: "save", car: "save", college: "save", travel: "save", invest: "invest", debt: "debt", basics: "curious" };
function Onboard({ t, header, option, onNext }) {
  const pick = (id) => {
    update((s) => ({ ...s, profile: { ...s.profile, goalFor: id } }));
    onNext({ startUnit: id === "basics" ? "budget" : P.template(id).units[0], reason: REASON[id] });
  };
  return (
    <>
      {header(t("onb.for.title"), t("onb.for.sub"))}
      {P.TEMPLATES.filter((x) => x.id !== "custom").map((x) => option(x.id, x.icon, t(`tpl.${x.id}`), t(`tpl.${x.id}.sub`), () => pick(x.id)))}
      {option("basics", "bulb", t("onb.for.basics"), t("onb.for.basics.sub"), () => pick("basics"))}
    </>
  );
}

// ---- Your money week (Today, when the Sunday check-in is due) -----------------

// The week as a short story: what you learned, an idea that's now solid,
// the streak, the goal's progress and one suggestion; then the usual
// check-in question. Worked out on the device; nothing new is sent.
function MoneyWeek({ t, locale, go, open, onClose }) {
  return (
    <Sheet open={open} onClose={onClose} title={t("mw.title")} tall>
      {open && <WeekStory t={t} locale={locale} go={go} onClose={onClose} />}
    </Sheet>
  );
}
function WeekStory({ t, locale, go, onClose }) {
  const progress = useAppState((s) => s.progress);
  const data = useGoals(locale);
  const sunday = P.lastSunday(today());
  const from = addDays(sunday, -6);
  const inWeek = (d) => !!d && d >= from && d <= sunday;
  const units = service("lessons", "units")() || [];
  const unitOf = Object.fromEntries(units.flatMap((u) => u.lessons.map((l) => [l.id, u])));
  const learned = Object.entries(progress.lessons).filter(([id, l]) => l.done && unitOf[id] && inWeek(l.last || l.at));
  const counts = {};
  for (const [id] of learned) counts[unitOf[id].id] = (counts[unitOf[id].id] || 0) + 1;
  const top = units.find((u) => u.id === Object.entries(counts).sort((a, b) => b[1] - a[1])[0]?.[0]);
  const concepts = service("lessons", "conceptsNow")() || {};
  const solid = Object.entries(concepts).filter(([, r]) => r && r.box >= 3 && inWeek(r.last)).map(([c]) => service("lessons", "conceptTitle")(c)).filter(Boolean);
  const lead = P.primaryGoal(data.rows.map((r) => r.g));
  const row = lead && data.rows.find((r) => r.g.id === lead.id);
  const fmt = row && fmtFor(locale, row.g);
  const change = row ? P.weekChange(row.g, sunday) : 0;
  const next = service("lessons", "current")();
  const nextUnit = next && units.find((u) => u.id === next.unit);
  const done = () => save((s) => ({ ...s, checkIn: sunday }));
  const line = (icon, title, sub) => (
    <div style={{ display: "flex", alignItems: "center", gap: 12, padding: "12px 16px" }}>
      <span style={{ width: 36, height: 36, borderRadius: 10, background: "var(--bg)", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
        <Icon name={icon} size={19} />
      </span>
      <span style={{ flex: 1, minWidth: 0 }}>
        <span style={{ display: "block", fontWeight: 650 }}>{title}</span>
        {sub && <span style={{ display: "block", fontSize: 14, color: "var(--mid)" }}>{sub}</span>}
      </span>
    </div>
  );
  return (
    <div>
      <div style={{ fontSize: 14, color: "var(--low)", fontWeight: 600, marginBottom: 10 }}>
        {shortDate(from, locale)} – {shortDate(sunday, locale)}
      </div>
      <List>
        {line("book", t("mw.learned"), learned.length ? t("mw.learned.n", { n: learned.length, unit: text(top.title, locale) }) : t("mw.learned.none"))}
        {solid.length > 0 && line("star", t("mw.solid"), solid.slice(0, 2).map((x) => text(x, locale)).join(" · "))}
        {progress.streak.count > 0 && line("streak", t("mw.streak", { n: progress.streak.count }), progress.streak.count >= progress.streak.best ? t("mw.best") : t("mw.going"))}
        {row && line(P.template(row.g.template).icon, change ? `${nameOf(row.g, t)}: ${fmt(row.saved - change)} → ${fmt(row.saved)}` : t("mw.goal.same", { name: nameOf(row.g, t), saved: fmt(row.saved) }), t("mw.goal.sub", { pct: Math.floor(row.pct) }))}
      </List>
      {next && nextUnit && (
        <Card style={{ marginTop: 12, background: "var(--brandSoft)" }}>
          <div style={{ fontSize: 14, fontWeight: 650, color: "var(--brand)", marginBottom: 4 }}>{t("mw.next")}</div>
          <div style={{ fontSize: 16, lineHeight: 1.5 }}>{t("mw.next.body", { lesson: text(next.title, locale), unit: text(nextUnit.title, locale), why: t(`why.${next.unit}`) })}</div>
        </Card>
      )}
      {row && (
        <>
          <p style={{ margin: "18px 0 10px", fontSize: 15, fontWeight: 650 }}>{t("week.q")}</p>
          <div style={{ display: "flex", gap: 8 }}>
            <Button size="md" style={{ flex: 1 }} onClick={() => (done(), onClose(), go("goals", { record: row.g.id }))}>
              {t("week.record")}
            </Button>
            <Button size="md" kind="secondary" style={{ flex: 1 }} onClick={() => (done(), onClose())}>
              {t("week.done")}
            </Button>
          </div>
        </>
      )}
    </div>
  );
}

// ---- The real cost (Practice) ------------------------------------------------

// Alternates by week: an everyday choice (pick a thing and its price: what
// it adds up to, and what it could grow to), or a hidden cost (card
// interest at a fixed payment, a monthly fee, forgotten subscriptions),
// each with its lesson. Never "skip the coffee": the point is choosing.
const EVERYDAY = [
  ["coffee", [5, 50], "workday", 260],
  ["snack", [3, 30], "day", 365],
  ["ride", [12, 120], "week", 52],
];
export const realCostKind = (day) => (Math.floor(Math.floor(Date.parse(`${day}T12:00:00Z`) / 864e5) / 7) % 2 ? "hidden" : "everyday");
// Months and interest to pay off a balance at a fixed payment.
export function payoff(balance, yearlyRate, payment) {
  let b = balance;
  let months = 0;
  let interest = 0;
  while (b > 0 && months < 600) {
    const i = (b * yearlyRate) / 12;
    interest += i;
    b = b + i - payment;
    months++;
  }
  return { months, interest };
}
const grow10 = (monthly) => {
  const r = fact("indexExampleRate") / 100 / 12;
  return (monthly * ((1 + r) ** 120 - 1)) / r;
};
function RealCostCard({ t, locale, go }) {
  const R = locale.region === "MX" ? 1 : 0;
  const cur = { ...locale, currency: R ? "MXN" : "USD" };
  const m = (n) => money(n, cur);
  const day = today();
  const [pick, setPick] = useState("coffee");
  const [own, setOwn] = useState(R ? "60" : "6");
  if (realCostKind(day) === "hidden") {
    const week = Math.floor(Math.floor(Date.parse(`${day}T12:00:00Z`) / 864e5) / 7);
    const which = ["card", "fee", "subs"][Math.floor(week / 2) % 3];
    const LESSON = { card: "credit-2", fee: "banking-2", subs: "budget-3" };
    const lesson = service("lessons", "units")().flatMap((u) => u.lessons).find((l) => l.id === LESSON[which]);
    let body;
    if (which === "card") {
      const [bal, pay] = R ? [10000, 250] : [1000, 25];
      const p = payoff(bal, 0.24, pay);
      body = t("rc.card", { balance: m(bal), pay: m(pay), years: Math.round(p.months / 12), interest: m(Math.round(p.interest / (R ? 100 : 10)) * (R ? 100 : 10)) });
    } else if (which === "fee") body = t("rc.fee", { fee: m(R ? 150 : 12), yearly: m(R ? 1800 : 144) });
    else body = t("rc.subs", { each: m(R ? 120 : 10), yearly: m(R ? 2880 : 240) });
    return (
      <Card style={{ marginBottom: 12 }} data-rc="hidden">
        <div style={{ fontSize: 14, fontWeight: 650, color: "var(--mid)", marginBottom: 4 }}>{t("rc.hidden")}</div>
        <p style={{ fontSize: 16, lineHeight: 1.5, margin: 0 }}>{body}</p>
        {lesson && (
          <button onClick={() => go("lessons", { lesson: lesson.id })} className="nv-press" style={{ display: "inline-flex", alignItems: "center", gap: 6, marginTop: 10, border: "none", background: "transparent", padding: "8px 0", color: "var(--brand)", fontWeight: 650, fontSize: 15, cursor: "pointer", font: "inherit" }}>
            <Icon name="book" size={16} /> {t("rc.lesson", { title: text(lesson.title, locale) })}
          </button>
        )}
        <p style={{ fontSize: 13, color: "var(--low)", margin: "8px 0 0" }}>{t("rc.fine")}</p>
      </Card>
    );
  }
  const item = EVERYDAY.find((x) => x[0] === pick);
  const price = item ? item[1][R] : Math.max(0, Number(String(own).replace(/[^\d.]/g, "")) || 0);
  const freq = item ? item[2] : "workday";
  const yearly = price * (item ? item[3] : 260);
  return (
    <Card style={{ marginBottom: 12 }} data-rc="everyday">
      <div style={{ fontSize: 14, fontWeight: 650, color: "var(--mid)", marginBottom: 4 }}>{t("rc.title")}</div>
      <div style={{ fontSize: 18, fontWeight: 700, lineHeight: 1.35, color: "var(--head)" }}>{t("rc.pick")}</div>
      <div style={{ display: "flex", flexWrap: "wrap", gap: 8, margin: "12px 0" }} role="radiogroup" aria-label={t("rc.pick")}>
        {[...EVERYDAY.map((x) => [x[0], `${t(`rc.${x[0]}`)} · ${m(x[1][R])}`]), ["own", t("rc.own")]].map(([id, label]) => (
          <button key={id} role="radio" aria-checked={pick === id} onClick={() => setPick(id)} className="nv-press" style={{ border: "none", borderRadius: 999, padding: "8px 14px", fontWeight: 650, fontSize: 15, cursor: "pointer", background: pick === id ? "var(--brand)" : "var(--bg)", color: pick === id ? "var(--onBrand)" : "var(--ink)", font: "inherit" }}>
            {label}
          </button>
        ))}
      </div>
      {pick === "own" && (
        <label style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 10, fontSize: 14, color: "var(--mid)" }}>
          {t("rc.own.label")}
          <input inputMode="decimal" value={own} onChange={(e) => setOwn(e.target.value.slice(0, 8))} aria-label={t("rc.own.label")} style={{ width: 90, border: "1px solid var(--line)", borderRadius: 10, padding: "8px 10px", background: "var(--bg)", color: "var(--ink)", fontSize: 16 }} />
        </label>
      )}
      <p style={{ fontSize: 16, lineHeight: 1.55, margin: 0 }} aria-live="polite">
        {t("rc.line", { price: m(price), every: t(`rc.every.${freq}`), yearly: m(Math.round(yearly)), grow: m(Math.round(grow10(yearly / 12) / 10) * 10) })}
      </p>
      <p style={{ fontSize: 15, color: "var(--mid)", lineHeight: 1.5, margin: "10px 0 0" }}>{t("rc.choose")}</p>
      <p style={{ fontSize: 13, color: "var(--low)", margin: "8px 0 0" }}>{t("rc.fine")}</p>
    </Card>
  );
}

// ---- services (for lessons, the portfolio, the tutor) ---------------------

const leadNow = () => {
  const goals = goalsNow();
  return P.primaryGoal(goals);
};
// What the learner picked in onboarding, if it's a goal template.
const goalForNow = () => {
  const id = getState().profile.goalFor;
  return id && id !== "basics" && P.TEMPLATES.some((x) => x.id === id) ? id : null;
};

registerModule({
  id: "goals",
  nav: { tab: "goals", label: "goals.nav" },
  Screen,
  Onboard,
  actions: {
    "goals.budget": BudgetTool,
    "goals.create": CreateGoal,
    "goals.leak": LeakTool,
    "goals.compare": CompareTool,
    "goals.debt": DebtTool,
    "goals.early": EarlyTool,
    "goals.invest": InvestTool,
    "goals.retire": RetireTool,
    "goals.paycheck": PaycheckTool,
    "goals.salestax": SalesTaxTool,
    "goals.brackets": BracketTool,
    "goals.fees": FeeTool,
    "goals.remit": RemitTool,
    "goals.scam": ScamTool,
    "goals.insurance": InsuranceTool,
    "goals.swing": SwingTool,
    "goals.hustle": HustleTool,
  },
  // For achievements: goals made, and the highest milestone reached by
  // saving (not ones a starting amount already passed).
  facts: (state) => {
    const goals = state.modules.goals ? state.modules.goals.goals : [];
    return { goals: goals.length, milestone: Math.max(0, ...goals.flatMap((g) => Object.entries(g.milestones || {}).filter(([, d]) => d !== "start").map(([m]) => Number(m)))) };
  },
  services: {
    // Units that help the leading goal most, in order — or the goal picked
    // in onboarding (null: neither).
    recommendedUnits: () => {
      const g = leadNow();
      const id = goalForNow();
      return g ? P.unitsFor(g) : id ? P.template(id).units : null;
    },
    // Today's "Building toward" line: the leading goal, else the one picked.
    buildingToward: () => {
      const g = leadNow();
      const id = goalForNow();
      const t = makeT(locNow());
      return g ? nameOf(g, t) : id ? t(`tpl.${id}`) : null;
    },
    // Onboarding's "why these lessons": the goal picked and its first units.
    startPlan: () => {
      const id = goalForNow();
      return id && { name: makeT(locNow())(`tpl.${id}`), units: P.template(id).units };
    },
    // Today: the Sunday check-in is due; the goal plan question is due.
    checkInDue: () => {
      const s = getState().modules.goals;
      const goals = goalsNow().filter((g) => g.status !== "paused");
      return goals.length > 0 && !!P.checkInDue(goals, s && s.checkIn, today());
    },
    planPromptDue: () => {
      const s = getState();
      return !!goalForNow() && (s.progress.counters.lessons || 0) >= 1 && !goalsNow().length && !(s.profile.seenIntros || {}).goalPlan;
    },
    PlanPrompt,
    MoneyWeek,
    // The goal a practice holding is linked to (for its tag in the portfolio).
    linkedGoalFor: (symbol) => {
      const g = goalsNow().find((x) => x.linked.includes(symbol));
      return g ? nameOf(g, makeT(locNow())) : null;
    },
    // For real-life missions: each active goal's kind and name, the main one first.
    goalKinds: () => {
      const goals = goalsNow().filter((g) => g.status !== "paused");
      const lead = P.primaryGoal(goals);
      const t = makeT(locNow());
      return (lead ? [lead, ...goals.filter((g) => g !== lead)] : goals).map((g) => ({ id: g.id, kind: g.template, name: nameOf(g, t) }));
    },
    // For the tutor: kinds and numbers only, never the names people type.
    // For the weekly email: each goal's name and progress, in words.
    progressLines: (locale) => {
      const t = makeT(locale);
      return goalsNow()
        .filter((g) => g.status !== "paused")
        .slice(0, 3)
        .map((g) => ({ name: nameOf(g, t), saved: money(P.saved(g), { ...locale, currency: g.currency }), target: money(g.target, { ...locale, currency: g.currency }), percent: Math.round(P.percentOf(g, P.saved(g))) }));
    },
    // The last Sunday check-in done (reminders skip it once done).
    checkInDone: () => (getState().modules.goals || {}).checkIn || null,
    summary: () =>
      goalsNow()
        .slice(0, 5)
        .map((g) => ({ type: g.template, currency: g.currency, target: g.target, monthly: g.monthly, monthsLeft: P.monthsLeft(g, today()), percent: Math.round(P.percentOf(g, P.saved(g))), path: g.path, status: g.status })),
  },
});

// Practice → Tools from your lessons (its own screen, under Practice).
registerModule({
  id: "tools",
  nav: { tab: "practice", label: "goals.tools" },
  Screen: ToolsScreen,
  practice: { order: 3, Row: ToolsRow, Card: RealCostCard },
});
