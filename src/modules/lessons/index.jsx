// LESSONS — the path and the player (lessons, reviews, challenges). Owns
// the content and each learner's mastery of its concepts; reports finished
// sessions to the core (XP, streak, badges); the "do it" step at the end
// of each lesson is a widget from whichever module owns it (portfolio,
// goals, news), found through the registry.
import { useEffect, useMemo, useRef, useState } from "react";
import { registerModule, actionWidget, service } from "../../core/registry.js";
import { useAppState, getState } from "../../core/store.js";
import { recordLesson, recordReview } from "../../core/game.js";
import { openShare } from "../../core/share.jsx";
import { track } from "../../core/analytics.js";
import { text, addStrings } from "../../core/i18n.js";
import { xpOn, dayKey, addDays } from "../../core/progress.js";
import { Button, Card, Icon, Layer, List, ListRow, Progress, Ring, Sheet, toast } from "../../core/ui.jsx";
import { AgeCard } from "../../core/Settings.jsx";
import { ReminderCard } from "../../core/reminders.jsx";
import { practiceOpen, markIntro } from "../../core/Practice.jsx";
import { UNITS, ALL_LESSONS, lessonById, lessonState, nextLesson, nextFor, unitDone, isQuestion, conceptPool, conceptsOfLesson, conceptsOfUnit, minutes } from "./content.js";
import { conceptById } from "./concepts.js";
import * as M from "./mastery.js";
import { QuestionView, Feedback, ReviewCard, SessionDone, SkillsCard, Placement, conceptsNow, saveConcepts, reviewStatus, useConcepts } from "./practice.jsx";

const S = (en, es) => ({ en, es });
addStrings({
  "lessons.nav": S("Learn", "Aprender"),
  "lessons.next_up": S("Next up", "Lo que sigue"),
  "lessons.start": S("Start", "Empezar"),
  "lessons.continue": S("Continue learning", "Seguir aprendiendo"),
  "lessons.overall": S("Course progress", "Avance del curso"),
  "lessons.overall_n": S("{done} of {total} lessons", "{done} de {total} lecciones"),
  "lessons.done_review": S("Completed · review", "Completada · repasar"),
  "lessons.review": S("Review", "Repasar"),
  "lessons.minutes": S("{n} min", "{n} min"),
  "lessons.locked": S("Finish the lesson before this one first.", "Primero termina la lección anterior."),
  "lessons.unit_n": S("Unit {n}", "Unidad {n}"),
  "lessons.streak_today": S("Today's lesson is done. Your streak is safe.", "La lección de hoy está hecha. Tu racha está a salvo."),
  "lessons.streak_keep": S("Do one lesson to keep your {n}-day streak.", "Haz una lección para mantener tu racha de {n} {n|día|días}."),
  "lessons.streak_start": S("Do one lesson to start a streak.", "Haz una lección para empezar una racha."),
  "lessons.all_done": S("You've finished every lesson. Review any of them, or keep working on your goals.", "Terminaste todas las lecciones. Repasa las que quieras o sigue avanzando en tus metas."),
  "lessons.quit.title": S("Leave this lesson?", "¿Salir de esta lección?"),
  "lessons.quit.body": S("You'll lose your progress in this lesson.", "Vas a perder tu avance en esta lección."),
  "lessons.quit.yes": S("Leave", "Salir"),
  "lessons.quit.no": S("Keep going", "Seguir"),
  "lessons.true": S("True", "Verdadero"),
  "lessons.false": S("False", "Falso"),
  "lessons.correct": S("Correct", "Correcto"),
  "lessons.wrong": S("Not quite", "Casi"),
  "lessons.wrong.again": S("You'll see this one again at the end.", "Esta la vas a ver otra vez al final."),
  "lessons.do_it": S("Practice", "Práctica"),
  "lessons.done_it": S("Done", "Hecho"),
  "lessons.action_wait": S("Try it above to continue", "Pruébalo arriba para continuar"),
  "lessons.action_done": S("Done — continue", "Listo, continuar"),
  "lessons.explain": S("Ask about this", "Preguntar sobre esto"),
  "lessons.complete": S("Lesson complete", "Lección completa"),
  "lessons.xp": S("+{n} XP", "+{n} XP"),
  "lessons.perfect": S("No mistakes", "Sin errores"),
  "lessons.streak": S("{n}-day streak", "Racha de {n} {n|día|días}"),
  "lessons.goal_met": S("Daily goal met", "Meta diaria cumplida"),
  "lessons.freeze_earned": S("Streak freeze earned", "Ganaste un protector de racha"),
  "lessons.unit_done": S("Unit complete: {name}", "Unidad completa: {name}"),
  "lessons.next": S("Next lesson", "Siguiente lección"),
  "lessons.to_path": S("Back to the path", "Volver al camino"),
  "lessons.skip_action": S("Skip for now", "Saltar por ahora"),
  "lessons.question": S("Question", "Pregunta"),
  "lessons.for_goal": S("For your goal", "Para tu meta"),
  "lessons.next_named": S("Next: {title}", "Siguiente: {title}"),
  "lessons.report": S("Report a problem with this step", "Reportar un problema en este paso"),
  "lessons.save.title": S("Keep your progress", "Guarda tu progreso"),
  "lessons.save.body": S("A free account keeps your streak on every device, puts you in the weekly league and turns on the AI tutor.", "Una cuenta gratis guarda tu racha en todos tus dispositivos, te mete a la liga semanal y activa el tutor con IA."),
  "lessons.save.yes": S("Create a free account", "Crear cuenta gratis"),
  "lessons.save.later": S("Maybe later", "Quizá después"),

  // Today, at the top of Learn
  "today.title": S("Today", "Hoy"),
  "today.lesson_n": S("Lesson {i} of {n} · {min} min", "Lección {i} de {n} · {min} min"),
  "today.toward": S("Building toward: {name}", "Aprendes para: {name}"),
  "today.review.sub": S("{n} {n|idea|ideas} to refresh · 2 min", "{n} {n|idea|ideas} para refrescar · 2 min"),
  "today.streak.none": S("Start a streak", "Empieza una racha"),
  "today.streak.done": S("Done for today", "Listo por hoy"),
  "today.streak.keep": S("A lesson today keeps it going", "Una lección hoy la mantiene"),
  "today.streak.start": S("One lesson a day builds it", "Una lección al día la construye"),
  "today.mission": S("This week's mission", "La misión de esta semana"),
  "today.checkin": S("Sunday check-in", "Revisión del domingo"),
  "today.checkin.sub": S("Record what you set aside this week", "Anota lo que apartaste esta semana"),

  // The course path
  "path.title": S("Your course", "Tu curso"),
  "path.count": S("{done} of {total} lessons · {units} of {unitsTotal} units", "{done} de {total} lecciones · {units} de {unitsTotal} unidades"),
  "path.now": S("Unit {n} · Now", "Unidad {n} · Ahora"),
  "path.of": S("{done} of {n}", "{done} de {n}"),
  "path.left": S("{n} {n|lesson|lessons} left", "{n} {n|lección|lecciones} por hacer"),
  "path.lessons": S("{n} {n|lesson|lessons}", "{n} {n|lección|lecciones}"),
  "path.after": S("after Unit {n}", "después de la Unidad {n}"),
  "path.more": S("{n} more units", "{n} unidades más"),

  // Why each unit matters, in one line (Today and after a lesson)
  "why.budget": S("A plan for your money is the first step to everything else.", "Un plan para tu dinero es el primer paso para todo lo demás."),
  "why.save": S("Savings turn surprises into small problems.", "El ahorro convierte los imprevistos en problemas pequeños."),
  "why.banking": S("The right account saves you fees every month.", "La cuenta correcta te ahorra comisiones cada mes."),
  "why.paycheck": S("Know where your pay goes before it arrives.", "Sabe a dónde va tu sueldo antes de que llegue."),
  "why.credit": S("Good credit makes cars, apartments and loans cheaper.", "Un buen historial hace más baratos los coches, las rentas y los préstamos."),
  "why.scams": S("One scam can undo months of saving.", "Un solo fraude puede borrar meses de ahorro."),
  "why.compound": S("Time does most of the work when money grows.", "Cuando el dinero crece, el tiempo hace casi todo el trabajo."),
  "why.taxes": S("Taxes explain why your paycheck is smaller than your pay.", "Los impuestos explican por qué te llega menos de lo que ganas."),
  "why.insurance": S("Insurance keeps one bad day from costing years.", "Un seguro evita que un mal día te cueste años."),
  "why.psychology": S("Most money mistakes are habits, not math.", "La mayoría de los errores con el dinero son hábitos, no matemáticas."),
  "why.stocks": S("Owning part of a company is how many people build wealth.", "Ser dueño de una parte de una empresa es como mucha gente construye patrimonio."),
  "why.etf": S("One fund can spread your money across hundreds of companies.", "Un solo fondo puede repartir tu dinero entre cientos de empresas."),
  "why.risk": S("Knowing the risk lets you invest without panicking.", "Conocer el riesgo te deja invertir sin entrar en pánico."),
  "why.crypto": S("Know what you're buying before the hype decides for you.", "Entiende qué compras antes de que la moda decida por ti."),
  "why.retire": S("Starting early makes retirement much easier to afford.", "Empezar temprano hace mucho más fácil pagar el retiro."),
  "why.earning": S("Earning more is the other half of having more.", "Ganar más es la otra mitad de tener más."),
  "why.news": S("The news moves rates and prices that touch your money.", "Las noticias mueven tasas y precios que afectan tu dinero."),
});

const useLocaleText = (locale) => (x, vars) => text(x, locale, vars);

// The one current lesson (Today, the path, reminders and the comeback
// screen all agree): the next for the learner's goal, else the path's next.
const currentLesson = (progress) => nextFor(progress, service("goals", "recommendedUnits")() || []);
const todayLine = (locale) => {
  const d = new Date().toLocaleDateString(`${locale.lang}-${locale.region}`, { weekday: "long", month: "long", day: "numeric" });
  return d[0].toUpperCase() + d.slice(1);
};

// TODAY — the next lesson as the one big button, why it matters, and at
// most 2 small rows (most useful first: review, the Sunday check-in, this
// week's mission, the streak), then at most one question for the learner
// (goal plan, age, reminders). Nothing is lost when a row doesn't fit: the
// streak is in the top bar, the check-in on Goals, the mission on Practice.
function Today({ t, locale, go, openStreak }) {
  const progress = useAppState((s) => s.progress);
  useAppState((s) => s.modules.goals); // the "Building toward" line and check-in
  useAppState((s) => s.modules.missions);
  useAppState((s) => s.profile.seenIntros);
  const concepts = useConcepts();
  const tx = useLocaleText(locale);
  const next = currentLesson(progress);
  const unit = next && UNITS.find((u) => u.id === next.unit);
  const toward = service("goals", "buildingToward")();
  const due = M.pickReview(concepts, dayKey()).due;
  const doneToday = progress.streak.last === dayKey();
  const mission = practiceOpen(progress) && (service("missions", "status")(locale) || {}).mission;
  const checkIn = service("goals", "checkInDue")();
  const PlanPrompt = service("goals", "PlanPrompt");
  const planDue = service("goals", "planPromptDue")();
  return (
    <div>
      <div style={{ fontSize: 14, color: "var(--mid)", fontWeight: 600, margin: "4px 2px 0" }}>{todayLine(locale)}</div>
      <h1 style={{ fontSize: 30, fontWeight: 750, letterSpacing: -0.6, margin: "2px 0 14px" }}>{t("today.title")}</h1>
      <Card pad={20}>
        {next ? (
          <>
            <div style={{ fontSize: 13, fontWeight: 600, color: "var(--low)" }}>
              {t("lessons.unit_n", { n: UNITS.indexOf(unit) + 1 })} · {tx(unit.title)}
            </div>
            <div style={{ fontSize: 24, fontWeight: 750, letterSpacing: -0.4, lineHeight: 1.2, margin: "6px 0 4px" }}>{tx(next.title)}</div>
            <div style={{ fontSize: 14, color: "var(--mid)" }}>{t("today.lesson_n", { i: next.index + 1, n: unit.lessons.length, min: Math.round(minutes(next)) })}</div>
            <p style={{ fontSize: 15, lineHeight: 1.5, margin: "12px 0 16px" }}>{t(`why.${unit.id}`)}</p>
            <Button full onClick={() => go("lessons", { lesson: next.id })}>
              {progress.counters.lessons ? t("common.continue") : t("lessons.start")}
            </Button>
          </>
        ) : (
          <div style={{ fontSize: 17, fontWeight: 600, lineHeight: 1.45 }}>{t("lessons.all_done")}</div>
        )}
        {toward && (
          <div style={{ display: "flex", alignItems: "center", gap: 8, marginTop: 14, fontSize: 14, color: "var(--mid)" }}>
            <Icon name="target" size={16} /> {t("today.toward", { name: toward })}
          </div>
        )}
      </Card>
      <List style={{ marginTop: 12 }}>
        {[
          due > 0 && <ListRow key="review" icon="refresh" title={t("review.title")} sub={t("today.review.sub", { n: Math.min(due, M.REVIEW_SIZE) })} onClick={() => go("lessons", { review: true })} />,
          checkIn && <ListRow key="checkin" icon="calendar" title={t("today.checkin")} sub={t("today.checkin.sub")} onClick={() => go("goals")} />,
          mission && <ListRow key="mission" icon="flag" title={t("today.mission")} sub={mission.title} onClick={() => go("practice")} />,
          <ListRow key="streak" icon="flame" title={progress.streak.count ? t("lessons.streak", { n: progress.streak.count }) : t("today.streak.none")} sub={doneToday ? t("today.streak.done") : progress.streak.count ? t("today.streak.keep") : t("today.streak.start")} onClick={openStreak} />,
        ]
          .filter(Boolean)
          .slice(0, 2)}
      </List>
      {planDue ? (
        <PlanPrompt t={t} go={go} />
      ) : (
        <>
          <AgeCard t={t} />
          {/* The reminder offer only when nothing else needs doing today. */}
          {!due && !checkIn && <ReminderCard t={t} />}
        </>
      )}
    </div>
  );
}

// THE COURSE — finished units fold to one row, the current unit is open
// with its lessons as steps (only the current lesson has a button), and
// later units fold too. Tap a folded unit to see its lessons (review one,
// or take a challenge).
function Course({ t, locale, go }) {
  const progress = useAppState((s) => s.progress);
  const tx = useLocaleText(locale);
  const [opened, setOpened] = useState({});
  const [all, setAll] = useState(false);
  const next = currentLesson(progress);
  const ci = next ? UNITS.findIndex((u) => u.id === next.unit) : UNITS.length;
  const doneCount = ALL_LESSONS.filter((l) => lessonState(progress, l.id) === "done").length;
  const unitsDone = UNITS.filter((u) => unitDone(progress, u)).length;
  const shown = all ? UNITS : UNITS.filter((u, i) => i <= ci + 3);
  const lessonRow = (l, i, list) => {
    const st = lessonState(progress, l.id);
    const now = next && l.id === next.id;
    const challenge = st === "done" && M.offersChallenge(progress.lessons[l.id]);
    return (
      <div key={l.id} style={{ display: "flex", alignItems: "center", position: "relative" }}>
        {i < list.length - 1 && <span style={{ position: "absolute", left: 30, top: 44, bottom: -14, width: 2, background: "var(--line)" }} />}
        <button
          onClick={() => (st === "locked" ? toast(t("lessons.locked")) : go("lessons", { lesson: l.id }))}
          aria-label={`${tx(l.title)} — ${st === "done" ? t("lessons.review") : st === "open" ? t("lessons.start") : t("lessons.locked")}`}
          className="nv-press"
          style={{ display: "flex", alignItems: "center", gap: 14, flex: 1, minWidth: 0, textAlign: "left", border: "none", background: "transparent", color: "var(--ink)", padding: "10px 16px", cursor: "pointer", minHeight: 58, font: "inherit" }}
        >
          <span style={{ width: 30, height: 30, borderRadius: 15, flexShrink: 0, display: "flex", alignItems: "center", justifyContent: "center", background: st === "done" ? "var(--accent)" : "var(--surface)", border: st === "done" ? "none" : `2px solid ${now ? "var(--brand)" : "var(--line)"}`, color: st === "done" ? "var(--onBrand)" : "var(--low)", position: "relative" }}>
            {st === "done" ? <Icon name="check" size={16} stroke={2.6} /> : st === "locked" ? <Icon name="lock" size={13} /> : null}
          </span>
          <span style={{ flex: 1, minWidth: 0 }}>
            <span style={{ display: "block", fontSize: 16, fontWeight: now ? 750 : 600, color: st === "locked" ? "var(--low)" : "var(--ink)" }}>{tx(l.title)}</span>
            <span style={{ display: "block", fontSize: 14, color: "var(--mid)", marginTop: 1 }}>{st === "done" ? t("lessons.done_review") : t("lessons.minutes", { n: Math.round(minutes(l)) })}</span>
          </span>
          {now && (
            <span style={{ background: "var(--brand)", color: "var(--onBrand)", borderRadius: 12, padding: "8px 14px", fontSize: 14, fontWeight: 700 }} aria-hidden="true">
              {t("lessons.start")}
            </span>
          )}
        </button>
        {challenge && (
          <button onClick={() => go("lessons", { challenge: l.id })} className="nv-press" style={{ border: "1px solid var(--line)", background: "var(--bg)", color: "var(--brand)", borderRadius: 999, padding: "6px 12px", marginRight: 14, fontSize: 13, fontWeight: 650, cursor: "pointer", minHeight: 36, flexShrink: 0 }}>
            {t("challenge.chip")}
          </button>
        )}
      </div>
    );
  };
  return (
    <section aria-label={t("path.title")} style={{ marginTop: 30 }}>
      <h2 style={{ fontSize: 22, fontWeight: 750, letterSpacing: -0.3, margin: "0 0 4px" }}>{t("path.title")}</h2>
      <div style={{ fontSize: 14, color: "var(--mid)", marginBottom: 10 }}>{t("path.count", { done: doneCount, total: ALL_LESSONS.length, units: unitsDone, unitsTotal: UNITS.length })}</div>
      <Progress value={doneCount} max={ALL_LESSONS.length} height={6} label={t("lessons.overall")} />
      <div style={{ display: "flex", flexDirection: "column", gap: 10, marginTop: 16 }}>
        {shown.map((u) => {
          const ui = UNITS.indexOf(u);
          const done = u.lessons.filter((l) => lessonState(progress, l.id) === "done").length;
          const complete = done === u.lessons.length;
          const locked = lessonState(progress, u.lessons[0].id) === "locked";
          if (ui === ci)
            return (
              <Card key={u.id} pad="16px 0 6px">
                <div style={{ padding: "0 18px 4px" }}>
                  <div style={{ fontSize: 13, color: "var(--low)", fontWeight: 600 }}>{t("path.now", { n: ui + 1 })}</div>
                  <div style={{ fontSize: 20, fontWeight: 750, letterSpacing: -0.2 }}>{tx(u.title)}</div>
                </div>
                {u.lessons.map(lessonRow)}
              </Card>
            );
          const meta = complete ? t("path.of", { done, n: u.lessons.length }) : locked ? t("path.after", { n: ui }) : ui < ci ? t("path.left", { n: u.lessons.length - done }) : t("path.lessons", { n: u.lessons.length });
          const open = !!opened[u.id];
          return (
            <div key={u.id} style={{ background: "var(--surface)", borderRadius: 18, overflow: "hidden" }}>
              <button
                onClick={() => setOpened((o) => ({ ...o, [u.id]: !o[u.id] }))}
                aria-expanded={open}
                aria-label={`${t("lessons.unit_n", { n: ui + 1 })} · ${tx(u.title)} · ${meta}`}
                className="nv-press"
                style={{ display: "flex", alignItems: "center", gap: 14, width: "100%", textAlign: "left", border: "none", background: "transparent", color: "var(--ink)", padding: "12px 16px", minHeight: 60, cursor: "pointer", font: "inherit" }}
              >
                <span style={{ width: 26, height: 26, borderRadius: 13, flexShrink: 0, display: "flex", alignItems: "center", justifyContent: "center", background: complete ? "var(--accent)" : "transparent", border: complete ? "none" : "2px solid var(--line)", color: complete ? "var(--onBrand)" : "var(--low)" }}>
                  {complete ? <Icon name="check" size={14} stroke={2.6} /> : locked ? <Icon name="lock" size={12} /> : null}
                </span>
                <span style={{ flex: 1, minWidth: 0 }}>
                  <span style={{ display: "block", fontSize: 13, color: "var(--low)", fontWeight: 600 }}>{t("lessons.unit_n", { n: ui + 1 })}</span>
                  <span style={{ display: "block", fontWeight: 650, color: locked ? "var(--mid)" : "var(--ink)" }}>{tx(u.title)}</span>
                </span>
                <span style={{ fontSize: 14, color: "var(--mid)", whiteSpace: "nowrap" }}>{meta}</span>
                <span style={{ display: "flex", transform: open ? "rotate(90deg)" : "none" }}>
                  <Icon name="next" size={16} color="var(--low)" />
                </span>
              </button>
              {open && <div style={{ paddingBottom: 6 }}>{u.lessons.map(lessonRow)}</div>}
            </div>
          );
        })}
      </div>
      {shown.length < UNITS.length && (
        <Button full kind="ghost" style={{ marginTop: 8 }} onClick={() => setAll(true)}>
          {t("path.more", { n: UNITS.length - shown.length })}
        </Button>
      )}
    </section>
  );
}

function Learn(ctx) {
  return (
    <div>
      <Today {...ctx} />
      <Course {...ctx} />
    </div>
  );
}

// THE PLAYER — one step at a time, for a lesson, a review or a challenge.
// A miss shows why that answer is wrong; in a lesson it also brings an
// extra card and an easier question on that concept right away, and the
// missed question comes back once at the end. Each question's first
// attempt updates the learner's mastery of its concept.
function Player({ t, locale, run, onExit, go, ...ctx }) {
  const { mode, lesson } = run;
  const tx = useLocaleText(locale);
  const [queue, setQueue] = useState(() => run.steps.map((s, i) => ({ ...s, key: `${i}` })));
  const firsts = useRef([]); // first attempts: [{ c, right }]
  const helped = useRef(new Set()); // concepts that already got extra help
  const [at, setAt] = useState(0);
  const [picked, setPicked] = useState(null);
  const [checked, setChecked] = useState(null); // null | "right" | "wrong"
  const [mistakes, setMistakes] = useState(0);
  const [actionDone, setActionDone] = useState(false);
  const [result, setResult] = useState(null);
  const [quit, setQuit] = useState(false);
  const step = queue[at];
  const unit = UNITS.find((u) => u.id === lesson.unit);
  const total = queue.length;
  // Each lesson step reached (so the admin page can show where people stop).
  useEffect(() => {
    if (mode === "lesson") track("lesson_step", { lesson: lesson.id, step: at, of: total });
  }, [at]);

  const advance = () => {
    setPicked(null);
    setChecked(null);
    setActionDone(false);
    if (at + 1 < queue.length) return setAt(at + 1);
    saveConcepts((c) => M.applySession(c, firsts.current, dayKey()));
    if (mode !== "lesson") return setResult(recordReview({ kind: mode, mistakes }));
    const wasUnitDone = unitDone(getState().progress, unit);
    const r = recordLesson({ id: lesson.id, perfect: mistakes === 0, mistakes });
    setResult({ ...r, unitJustDone: !wasUnitDone && unitDone(getState().progress, unit) });
  };
  const check = () => {
    const right = picked === step.answer;
    setChecked(right ? "right" : "wrong");
    if (!step.retry && !step.extra) firsts.current.push({ c: step.c, right });
    if (right) return;
    setMistakes((m) => m + 1);
    const c = step.c && !step.extra && !helped.current.has(step.c) && conceptById(step.c);
    if (c) helped.current.add(step.c);
    // In a lesson: another way to explain it, then an easier question.
    // In a review: the explanation. A challenge stays a challenge.
    const extra = !c || mode === "challenge" ? [] : mode === "lesson" ? [{ ...c.explain, key: `${step.key}x`, extra: true }, { ...c.easy, c: step.c, key: `${step.key}e`, extra: true }] : [{ ...c.explain, key: `${step.key}x`, extra: true }];
    setQueue((q) => [...q.slice(0, at + 1), ...extra, ...q.slice(at + 1), ...(step.retry || mode === "challenge" ? [] : [{ ...step, key: `${step.key}r`, retry: true }])]);
  };

  // Keyboard: 1–4 pick, Enter checks or continues.
  useEffect(() => {
    const k = (e) => {
      if (result || quit || !step) return;
      if (e.target.tagName === "INPUT" || e.target.tagName === "TEXTAREA") return;
      if ((step.type === "choice" || step.type === "tf") && !checked && /^[1-4]$/.test(e.key)) {
        const n = Number(e.key) - 1;
        if (step.type === "tf" && n < 2) setPicked(n === 0);
        if (step.type === "choice" && n < step.options.length) setPicked(n);
      }
      if (e.key === "Enter") {
        if (step.type === "card") advance();
        else if ((step.type === "choice" || step.type === "tf") && picked !== null && !checked) check();
        else if (checked) advance();
      }
    };
    window.addEventListener("keydown", k);
    return () => window.removeEventListener("keydown", k);
  });

  if (result && mode !== "lesson")
    return (
      <Overlay label={run.title}>
        <SessionDone t={t} locale={locale} mode={mode} result={result} answers={firsts.current} onDone={onExit} />
      </Overlay>
    );
  if (result) {
    const progress = getState().progress;
    const nl = nextFor(progress, service("goals", "recommendedUnits")() || []);
    const toward = service("goals", "buildingToward")();
    const TryCard = service("missions", "TryCard");
    const facts = [
      t("lessons.xp", { n: result.gained }),
      t("lessons.streak", { n: result.streak }),
      ...(result.goalJustMet ? [t("lessons.goal_met")] : []),
      ...(mistakes === 0 ? [t("lessons.perfect")] : []),
    ];
    return (
      <Overlay label={run.title}>
        <div style={{ flex: 1, display: "flex", flexDirection: "column", justifyContent: "center", gap: 18, paddingBottom: 18 }}>
          <div style={{ textAlign: "center" }}>
            <div style={{ width: 56, height: 56, borderRadius: 28, margin: "0 auto 14px", background: "var(--accentSoft)", color: "var(--accent)", display: "flex", alignItems: "center", justifyContent: "center" }}>
              <Icon name="check" size={28} stroke={2.4} />
            </div>
            <h1 style={{ fontSize: 26, fontWeight: 700, letterSpacing: -0.4, margin: 0 }}>{t("lessons.complete")}</h1>
            <p style={{ color: "var(--mid)", margin: "6px 0 0" }}>{tx(lesson.title)}</p>
            <p style={{ fontSize: 14, color: "var(--mid)", margin: "10px 0 0" }}>{facts.join("  ·  ")}</p>
          </div>
          <Card>
            <p style={{ fontSize: 16, lineHeight: 1.5, margin: 0 }}>{t(`why.${lesson.unit}`)}</p>
            {toward && (
              <div style={{ display: "flex", alignItems: "center", gap: 8, marginTop: 10, fontSize: 14, color: "var(--mid)" }}>
                <Icon name="target" size={16} /> {t("today.toward", { name: toward })}
              </div>
            )}
          </Card>
          {practiceOpen(progress) && <TryCard t={t} locale={locale} go={go} unit={lesson.unit} />}
          {(result.unitJustDone || result.freezeEarned || result.badges.length > 0) && (
            <div style={{ fontSize: 14, color: "var(--mid)", lineHeight: 1.6, textAlign: "center" }}>
              {result.unitJustDone && <div>{t("lessons.unit_done", { name: tx(unit.title) })}</div>}
              {result.freezeEarned && <div>{t("lessons.freeze_earned")}</div>}
              {result.badges.map((id) => (
                <div key={id}>{t("badge.earned", { name: t(`badge.${id}`) })}</div>
              ))}
            </div>
          )}
        </div>
        {!ctx.session.user && ctx.session.online && (progress.counters.lessons || 0) === 1 && (
          <Card style={{ margin: "0 0 14px" }}>
            <div style={{ fontWeight: 650 }}>{t("lessons.save.title")}</div>
            <p style={{ fontSize: 14, color: "var(--mid)", margin: "4px 0 12px", lineHeight: 1.45 }}>{t("lessons.save.body")}</p>
            <Button full size="md" kind="secondary" onClick={() => go("settings")}>
              {t("lessons.save.yes")}
            </Button>
          </Card>
        )}
        <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
          {nl && nl.id !== lesson.id && (
            <Button full onClick={() => go("lessons", { lesson: nl.id })}>
              {t("lessons.next_named", { title: tx(nl.title) })}
            </Button>
          )}
          <Button full kind={nl && nl.id !== lesson.id ? "secondary" : "primary"} onClick={() => go("lessons")}>
            {t("common.done")}
          </Button>
          {(mistakes === 0 || result.unitJustDone) && (
            <div style={{ display: "flex", justifyContent: "center", gap: 8, flexWrap: "wrap" }}>
              {mistakes === 0 && (
                <Button kind="ghost" size="md" onClick={() => go("lessons", { challenge: lesson.id })}>
                  {t("challenge.offer")}
                </Button>
              )}
              {result.unitJustDone && (
                <Button kind="ghost" size="md" onClick={() => openShare({ kind: "unit", title: tx(unit.title) })}>
                  <Icon name="share" size={18} /> {t("share.button")}
                </Button>
              )}
            </div>
          )}
        </div>
      </Overlay>
    );
  }

  const Widget = step.type === "action" ? actionWidget(step.kind) : null;
  const canCheck = (step.type === "choice" || step.type === "tf") && picked !== null && !checked;

  return (
    <Overlay label={run.title}>
      <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 20 }}>
        <button onClick={() => setQuit(true)} aria-label={t("common.close")} style={{ border: "none", background: "transparent", color: "var(--low)", width: 44, height: 44, display: "flex", alignItems: "center", justifyContent: "center", cursor: "pointer" }}>
          <Icon name="close" />
        </button>
        <Progress value={at} max={total} height={6} label={run.title} />
        <button onClick={() => service("tutor", "open")({ context: tx(step.title || step.q || step.prompt || "") })} className="nv-press" style={{ border: "1px solid var(--line)", background: "var(--bg)", color: "var(--ink)", borderRadius: 999, height: 36, padding: "0 12px", display: "inline-flex", alignItems: "center", gap: 6, fontWeight: 650, fontSize: 14, cursor: "pointer", flexShrink: 0 }}>
          <Icon name="chat" size={16} /> {t("nav.ask")}
        </button>
        <button onClick={() => service("feedback", "open")({ kind: "content", context: `${mode === "lesson" ? lesson.id : `${mode} ${step.c || ""}`} · step ${at + 1} · ${tx(step.title || step.q || step.prompt || "")}`.slice(0, 280) })} aria-label={t("lessons.report")} title={t("lessons.report")} style={{ border: "none", background: "transparent", color: "var(--low)", width: 44, height: 44, display: "flex", alignItems: "center", justifyContent: "center", cursor: "pointer", flexShrink: 0 }}>
          <Icon name="flag" size={20} />
        </button>
      </div>

      <div key={step.key} className="nv-in" style={{ flex: 1, overflowY: "auto" }}>
        {step.type === "card" && (
          <div>
            <h2 style={{ fontSize: 26, fontWeight: 750, margin: "0 0 12px", lineHeight: 1.2 }}>{tx(step.title)}</h2>
            <p style={{ fontSize: 19, lineHeight: 1.55, margin: 0 }}>{tx(step.body)}</p>
            {service("tutor", "canExplain")(`${tx(step.title)} ${tx(step.body)}`) && <button onClick={() => service("tutor", "explain")({ question: tx(step.title), context: tx(step.body) })} className="nv-press" style={{ marginTop: 18, border: "1px solid var(--line)", background: "var(--bg)", color: "var(--brand)", borderRadius: 999, padding: "10px 16px", fontWeight: 650, fontSize: 15, cursor: "pointer", display: "inline-flex", alignItems: "center", gap: 8, minHeight: 44 }}>
              <Icon name="chat" size={18} /> {t("lessons.explain")}
            </button>}
          </div>
        )}
        {isQuestion(step) && <QuestionView t={t} locale={locale} step={step} picked={picked} setPicked={setPicked} checked={checked} label={mode === "challenge" ? t("challenge.chip") : mode === "review" ? t("review.title") : null} />}
        {step.type === "action" && (
          <div>
            <div style={{ display: "inline-flex", alignItems: "center", gap: 6, fontSize: 13, fontWeight: 750, color: "var(--onBrand)", background: "var(--brand)", borderRadius: 999, padding: "6px 12px", marginBottom: 12 }}>
              <Icon name="target" size={15} /> {t("lessons.do_it")}
            </div>
            <h2 style={{ fontSize: 22, fontWeight: 750, margin: "0 0 16px", lineHeight: 1.3 }}>{tx(step.prompt)}</h2>
            {Widget ? <Widget params={step.params} t={t} locale={locale} done={actionDone} onDone={() => setActionDone(true)} /> : null}
          </div>
        )}
      </div>

      <div style={{ paddingTop: 14 }}>
        {checked && <Feedback t={t} locale={locale} step={step} picked={picked} checked={checked} note={checked === "wrong" && !step.retry && mode !== "challenge" ? t("lessons.wrong.again") : null} />}
        {step.type === "card" && (
          <Button full onClick={advance}>
            {t("common.continue")}
          </Button>
        )}
        {(step.type === "choice" || step.type === "tf") &&
          (checked ? (
            <Button full onClick={advance}>
              {t("common.continue")}
            </Button>
          ) : (
            <Button full disabled={!canCheck} onClick={check}>
              {t("common.check")}
            </Button>
          ))}
        {step.type === "action" && (
          <>
            <Button full disabled={!actionDone && !!Widget} onClick={advance}>
              {actionDone ? t("lessons.action_done") : Widget ? t("lessons.action_wait") : t("common.continue")}
            </Button>
            {Widget && !actionDone && (
              <Button full kind="ghost" onClick={advance} style={{ marginTop: 4 }}>
                {t("lessons.skip_action")}
              </Button>
            )}
          </>
        )}
      </div>

      <Sheet open={quit} onClose={() => setQuit(false)} title={t("lessons.quit.title")}>
        <p style={{ fontSize: 16, marginTop: 0 }}>{t("lessons.quit.body")}</p>
        <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
          <Button full onClick={() => setQuit(false)}>
            {t("lessons.quit.no")}
          </Button>
          <Button full kind="secondary" onClick={onExit}>
            {t("lessons.quit.yes")}
          </Button>
        </div>
      </Sheet>
    </Overlay>
  );
}

// Full screen, above everything — a lesson is a focused moment.
function Overlay({ label, children }) {
  useEffect(() => {
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = prev;
    };
  }, []);
  return (
    <Layer>
      <div role="dialog" aria-modal="true" aria-label={label} style={{ position: "fixed", inset: 0, zIndex: 40, background: "var(--bg)", color: "var(--ink)", overflowY: "auto" }}>
        <div style={{ maxWidth: 640, minHeight: "100%", margin: "0 auto", display: "flex", flexDirection: "column", padding: "calc(10px + env(safe-area-inset-top)) 18px calc(18px + env(safe-area-inset-bottom))" }}>{children}</div>
      </div>
    </Layer>
  );
}

// What to play, from the route: a lesson ({ lesson } or, after onboarding,
// { startUnit }), a review ({ review }), or a lesson's challenge
// ({ challenge }: the harder question for each concept in its unit, its
// own first).
function sessionFor(params, t, locale) {
  const progress = getState().progress;
  if (params.review) {
    const concepts = conceptsNow();
    const { ids } = M.pickReview(concepts, dayKey());
    if (!ids.length) return null;
    return { mode: "review", lesson: { id: "review", unit: null }, title: t("review.title"), steps: ids.map((c) => ({ ...M.pickQuestion(conceptPool(c), concepts[c]), c })) };
  }
  if (params.challenge) {
    const l = lessonById(params.challenge);
    if (!l || !M.offersChallenge(progress.lessons[l.id])) return null;
    const own = conceptsOfLesson(l.id);
    const ids = [...own, ...conceptsOfUnit(l.unit).filter((c) => !own.includes(c))];
    return { mode: "challenge", lesson: l, title: t("challenge.title", { title: text(l.title, locale) }), steps: ids.map((c) => ({ ...conceptById(c).challenge, c })) };
  }
  // After onboarding: the first lesson of the starting unit — or, if the
  // placement test skipped it, the next lesson for the learner's goal.
  const start = params.startUnit && ((progress.placed || []).includes(params.startUnit) ? nextFor(progress, service("goals", "recommendedUnits")() || []) : (UNITS.find((u) => u.id === params.startUnit) || { lessons: [] }).lessons[0]);
  const id = params.lesson || (start && start.id);
  const l = id && lessonById(id);
  // A lesson a teacher assigned opens even if the path hasn't reached it.
  return l && (lessonState(progress, id) !== "locked" || params.assigned) ? { mode: "lesson", lesson: l, title: text(l.title, locale), steps: l.steps } : null;
}

function Screen(ctx) {
  const p = ctx.route.params;
  const key = p.review ? "review" : p.challenge ? `challenge:${p.challenge}` : p.lesson || p.startUnit || null;
  const session = useMemo(() => (key ? sessionFor(p, ctx.t, ctx.locale) : null), [key]);
  return (
    <>
      <Learn {...ctx} />
      {session && <Player key={key} {...ctx} run={session} onExit={() => ctx.go("lessons")} />}
    </>
  );
}

registerModule({
  id: "lessons",
  nav: { tab: "learn", label: "lessons.nav" },
  Screen,
  Onboard: Placement,
  // Me → Skills: a review any time (Today shows it only when ideas are due),
  // and how well each idea is known.
  MeCard: (p) => (
    <>
      <ReviewCard {...p} />
      <SkillsCard {...p} />
    </>
  ),
  facts: (state) => {
    const done = UNITS.filter((u) => unitDone(state.progress, u)).length;
    return { unitsDone: done, pathDone: done === UNITS.length };
  },
  services: {
    // How many concepts are due for review (Home shows it), and when the
    // next one is (reminders).
    reviewStatus,
    reviewDueOn: () => M.nextDue(conceptsNow()),
    // For Money Missions: units with a finished lesson (or tested out of),
    // and units studied in the last week.
    unitActivity: () => {
      const p = getState().progress;
      const weekAgo = addDays(dayKey(), -7);
      const done = Object.entries(p.lessons).filter(([id, l]) => l.done && lessonById(id));
      const unitsOf = (list) => [...new Set(list.map(([id]) => lessonById(id).unit))];
      return { started: [...new Set([...unitsOf(done), ...(p.placed || [])])], recent: unitsOf(done.filter(([, l]) => (l.last || l.at) >= weekAgo)) };
    },
    // For classes: the course's units and lessons (titles), each concept's
    // name, and the learner's answers per concept.
    units: () => UNITS.map((u) => ({ id: u.id, title: u.title, lessons: u.lessons.map((l) => ({ id: l.id, title: l.title })) })),
    conceptTitle: (id) => (conceptById(id) || {}).name || null,
    conceptsNow,
    // The next open lesson for these units (in order), else what's next
    // on the path; null when everything's done.
    // The lesson to do next, for the goal if there is one (Today's button).
    current: () => currentLesson(getState().progress),
    // The first lesson whose "do it" step uses this tool (Practice → Tools
    // opens each tool after its lesson), and a lesson's title and unit.
    firstLessonWith: (kind) => ALL_LESSONS.find((l) => l.steps.some((s) => s.type === "action" && s.kind === kind)) || null,
    lessonDone: (id) => lessonState(getState().progress, id) === "done",
    unitTitles: (ids) => ids.map((id) => (UNITS.find((u) => u.id === id) || {}).title).filter(Boolean),
    nextFor: (units) => {
      const l = nextFor(getState().progress, units);
      return l && { ...l, unitTitle: UNITS.find((u) => u.id === l.unit).title };
    },
  },
});

export { ALL_LESSONS };
