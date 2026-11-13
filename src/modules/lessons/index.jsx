// LESSONS — the path and the player (lessons, reviews, challenges). Owns
// the content and each learner's mastery of its concepts; reports finished
// sessions to the core (XP, streak, badges); the "do it" step at the end
// of each lesson is a widget from whichever module owns it (portfolio,
// goals, news), found through the registry.
import { useEffect, useLayoutEffect, useMemo, useRef, useState } from "react";
import { registerModule, actionWidget, service } from "../../core/registry.js";
import { useAppState, getState, setSlice, saveNow } from "../../core/store.js";
import { recordLesson, recordReview, recordPractice } from "../../core/game.js";
import { mythOf } from "./myths.js";
import { openShare } from "../../core/share.jsx";
import { track } from "../../core/analytics.js";
import { text, addStrings } from "../../core/i18n.js";
import { xpOn, dayKey, addDays } from "../../core/progress.js";
import { Button, Card, Icon, Layer, List, ListRow, Loading, Mark, Progress, Ring, Scene, Sheet, UnitArt, WaveEdge, toast } from "../../core/ui.jsx";
import { star, wave, boat, LANDMARK } from "../../core/art.js";
import { AgeCard } from "../../core/Settings.jsx";
import { ReminderCard } from "../../core/reminders.jsx";
import { WhatsNewCard } from "../../core/whatsnew.jsx";
import { practiceOpen, markIntro } from "../../core/Practice.jsx";
import { feel, reducedMotion } from "../../core/feel.js";
import { UNITS, ALL_LESSONS, lessonById, lessonState, nextLesson, nextFor, unitDone, isQuestion, conceptPool, loadUnits, unitLoaded, conceptsOfLesson, conceptsOfUnit, minutes, setBothMode } from "./content.js";
import { conceptById } from "./concepts.js";
import * as M from "./mastery.js";
import { Question, QTYPES, startValue } from "./qtypes.jsx";
import { Feedback, ReviewCard, SessionDone, SkillsCard, Placement, conceptsNow, saveConcepts, reviewStatus, useConcepts } from "./practice.jsx";

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
  "lessons.locked_short": S("Locked", "Bloqueada"),
  "lessons.minutes": S("{n} min", "{n} min"),
  "lessons.locked": S("One at a time: finish the lesson before this one first.", "Una a la vez: primero termina la lección anterior."),
  "lessons.unit_n": S("Unit {n}", "Unidad {n}"),
  "lessons.streak_today": S("Today's lesson is done. Your streak is safe.", "La lección de hoy está hecha. Tu racha está a salvo."),
  "lessons.streak_keep": S("Do one lesson to keep your {n}-day streak.", "Haz una lección para mantener tu racha de {n} {n|día|días}."),
  "lessons.streak_start": S("Do one lesson to start a streak.", "Haz una lección para empezar una racha."),
  // The finish screen and its moments
  "finish.today": S("{xp} of {goal} XP today · {n}-day streak", "{xp} de {goal} XP hoy · racha de {n} {n|día|días}"),
  "finish.life": S("In real life", "En la vida real"),
  "finish.solid": S("Now solid: {name}", "Ya lo tienes firme: {name}"),
  "finish.mastered": S("Mastered: {name}", "Dominado: {name}"),
  "moment.streak.7": S("A week, every day.", "Una semana, todos los días."),
  "moment.streak.7.sub": S("Seven days in a row. This is about where habits start.", "Siete días seguidos. Más o menos aquí empiezan los hábitos."),
  "moment.streak.30": S("Thirty days in a row.", "Treinta días seguidos."),
  "moment.streak.30.sub": S("A month of showing up, a few minutes at a time. That's a habit now.", "Un mes de constancia, unos minutos a la vez. Eso ya es un hábito."),
  "moment.streak.100": S("A hundred days.", "Cien días."),
  "moment.streak.100.sub": S("Most people never stick with anything this long. You did.", "Casi nadie mantiene algo tanto tiempo. Tú sí."),
  "moment.unit.eyebrow": S("Unit {n} of {total} · complete", "Unidad {n} de {total} · completa"),
  "moment.unit.sub": S("You covered {lessons}.", "Viste {lessons}."),
  "moment.lessons": S("{n} {n|lesson|lessons}", "{n} {n|lección|lecciones}"),
  "moment.solid": S("{n} {n|idea|ideas} solid", "{n} {n|idea firme|ideas firmes}"),
  "lessons.course_done": S("You finished the whole course. Open water ahead.", "Terminaste todo el curso. Hay mar abierto por delante."),
  "lessons.all_done": S("Reviews keep it fresh, and your goals are waiting.", "Los repasos lo mantienen fresco, y tus metas te esperan."),
  "lessons.quit.title": S("Leave now?", "¿Salir ahora?"),
  "lessons.quit.body": S("You'll pick up right here next time.", "La próxima vez sigues justo aquí."),
  "lessons.quit.yes": S("Leave", "Salir"),
  "lessons.quit.no": S("Keep going", "Seguir"),
  "lessons.true": S("True", "Verdadero"),
  "lessons.false": S("False", "Falso"),
  "lessons.correct": S("Correct", "Correcto"),
  "lessons.wrong": S("Not quite", "No del todo"),
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
  "today.streak.done": S("Done for today. See you tomorrow.", "Listo por hoy. Nos vemos mañana."),
  "today.streak.keep": S("Today's lesson keeps it going", "La lección de hoy la mantiene"),
  "today.streak.start": S("One lesson starts a streak. Three minutes is enough.", "Una lección empieza una racha. Tres minutos bastan."),
  "today.mission": S("This week's mission", "La misión de esta semana"),
  "today.week": S("Your money week", "Tu semana de dinero"),
  "today.week.sub": S("A short look back, then the check-in", "Un repaso corto y luego la revisión"),
  "myth.label": S("Myth or fact?", "¿Mito o realidad?"),
  "myth.myth": S("Myth", "Mito"),
  "myth.fact": S("Fact", "Realidad"),
  "myth.meta": S("15 seconds · +2 XP", "15 segundos · +2 XP"),
  "myth.is.myth": S("it's a myth", "es un mito"),
  "myth.is.fact": S("it's a fact", "es realidad"),
  "myth.right": S("Right: {it}.", "Correcto: {it}."),
  "myth.wrong": S("Not quite: {it}.", "No del todo: {it}."),
  "myth.after": S("+2 XP · another one tomorrow", "+2 XP · mañana hay otro"),
  "myth.done": S("Today's myth: answered · another one tomorrow", "El mito de hoy: respondido · mañana hay otro"),

  // The course path
  "path.title": S("Your course", "Tu curso"),
  "path.count": S("{done} of {total} lessons · {units} of {unitsTotal} units", "{done} de {total} lecciones · {units} de {unitsTotal} unidades"),
  "path.now": S("Unit {n} · Now", "Unidad {n} · Ahora"),
  "path.of": S("{done} of {n}", "{done} de {n}"),
  "path.left": S("{n} {n|lesson|lessons} left", "{n} {n|lección|lecciones} por hacer"),
  "path.lessons": S("{n} {n|lesson|lessons}", "{n} {n|lección|lecciones}"),
  "path.after": S("after Unit {n}", "después de la Unidad {n}"),
  "path.more": S("{n} more units", "{n} unidades más"),
  "path.open": S("Open water", "Mar abierto"),
  "path.mist": S("{n} more {n|island|islands} in the mist", "{n} {n|isla|islas} más en la niebla"),
  "path.lessons_of": S("{done} of {n} lessons", "{done} de {n} lecciones"),
  "path.continue": S("Continue: {title}", "Continuar: {title}"),

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
  "why.borders": S("If your life touches two countries, the details of sending, saving and borrowing across the border save you real money.", "Si tu vida toca dos países, los detalles de enviar, ahorrar y pedir prestado entre fronteras te ahorran dinero de verdad."),
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
  const MoneyWeek = service("goals", "MoneyWeek");
  const [weekOpen, setWeekOpen] = useState(false);
  const profile = useAppState((s) => s.profile);
  const myth = useAppState((s) => (s.modules.lessons || {}).myth);
  // One daily card: Myth or Fact — not on the first day (that's for the
  // first lesson), not while a question for the learner is waiting, and
  // not on a Sunday with the money week to look at.
  const day = dayKey();
  const sunday = new Date(`${day}T12:00:00`).getDay() === 0;
  const showMyth = (progress.lessonDays || []).some((d) => d < day) && !planDue && !!(profile.ageBand || profile.ageAsked) && !(sunday && checkIn);
  const mythWaiting = showMyth && !(myth && myth.day === day);
  return (
    <div>
      <div style={{ fontSize: 14, color: "var(--mid)", fontWeight: 600, margin: "4px 2px 0" }}>{todayLine(locale)}</div>
      <h1 className="nv-disp" style={{ fontSize: 36, lineHeight: 1.08, margin: "2px 0 14px" }}>{t("today.title")}</h1>
      <Card pad={0} style={{ overflow: "hidden" }}>
        {next ? (
          <>
            <div style={{ position: "relative", background: "var(--artSky)", minHeight: 136 }}>
              <svg viewBox="0 0 390 40" preserveAspectRatio="none" width="100%" height="40" aria-hidden="true" style={{ position: "absolute", left: 0, bottom: 0, display: "block" }}>
                <path d={wave(390, 40, 3, 6, 12)} fill="var(--artSea)" />
              </svg>
              <div style={{ position: "absolute", right: 4, bottom: 10 }}>
                <UnitArt id={unit.id} width={150} />
              </div>
              <div style={{ position: "relative", padding: "18px 20px 34px", maxWidth: "60%" }}>
                <div style={{ fontSize: 13, fontWeight: 600, color: "var(--low)" }}>
                  {t("lessons.unit_n", { n: UNITS.indexOf(unit) + 1 })} · {tx(unit.title)}
                </div>
                <div className="nv-disp" style={{ fontSize: 28, lineHeight: 1.12, margin: "5px 0 4px", color: "var(--head)" }}>{tx(next.title)}</div>
                <div style={{ fontSize: 14, color: "var(--mid)" }}>{t("today.lesson_n", { i: next.index + 1, n: unit.lessons.length, min: Math.round(minutes(next)) })}</div>
              </div>
              <WaveEdge style={{ position: "absolute", left: 0, right: 0, bottom: -1 }} />
            </div>
            <div style={{ padding: "2px 20px 20px" }}>
              <p style={{ fontSize: 15, lineHeight: 1.5, margin: "6px 0 16px" }}>{t(`why.${unit.id}`)}</p>
              <Button full onClick={() => go("lessons", { lesson: next.id })}>
                {progress.counters.lessons ? t("common.continue") : t("lessons.start")}
              </Button>
              {toward && (
                <div style={{ display: "flex", alignItems: "center", gap: 8, marginTop: 14, fontSize: 14, color: "var(--mid)" }}>
                  <Icon name="target" size={16} /> {t("today.toward", { name: toward })}
                </div>
              )}
            </div>
          </>
        ) : (
          <>
            <Scene name="open" w={358} h={200} />
            <div style={{ padding: "16px 20px 20px" }}>
              <div className="nv-disp" style={{ fontSize: 26, lineHeight: 1.2, color: "var(--head)" }}>{t("lessons.course_done")}</div>
              <p style={{ fontSize: 15, lineHeight: 1.5, color: "var(--mid)", margin: "8px 0 0" }}>{t("lessons.all_done")}</p>
              {toward && (
                <div style={{ display: "flex", alignItems: "center", gap: 8, marginTop: 14, fontSize: 14, color: "var(--mid)" }}>
                  <Icon name="target" size={16} /> {t("today.toward", { name: toward })}
                </div>
              )}
            </div>
          </>
        )}
      </Card>
      <List style={{ marginTop: 12 }}>
        {[
          due > 0 && <ListRow key="review" icon="refresh" title={t("review.title")} sub={t("today.review.sub", { n: Math.min(due, M.REVIEW_SIZE) })} onClick={() => go("lessons", { review: true })} />,
          checkIn && <ListRow key="checkin" icon="calendar" title={t("today.week")} sub={t("today.week.sub")} onClick={() => setWeekOpen(true)} />,
          mission && <ListRow key="mission" icon="flag" title={t("today.mission")} sub={mission.title} onClick={() => go("practice")} />,
          <ListRow key="streak" icon="streak" title={progress.streak.count ? t("lessons.streak", { n: progress.streak.count }) : t("today.streak.none")} sub={doneToday ? t("today.streak.done") : progress.streak.count ? t("today.streak.keep") : t("today.streak.start")} onClick={openStreak} />,
        ]
          .filter(Boolean)
          .slice(0, 2)}
      </List>
      <WhatsNewCard t={t} locale={locale} />
      {planDue ? (
        <PlanPrompt t={t} go={go} />
      ) : (
        <>
          <AgeCard t={t} />
          {showMyth && <MythCard t={t} locale={locale} />}
          {/* The reminder offer only when nothing else needs doing today. */}
          {!due && !checkIn && !mythWaiting && <ReminderCard t={t} />}
        </>
      )}
      {MoneyWeek && <MoneyWeek t={t} locale={locale} go={go} open={weekOpen} onClose={() => setWeekOpen(false)} />}
    </div>
  );
}

// MONEY MYTH OR FACT — one statement a day (myths.js), two plain buttons,
// a two-sentence answer and +2 XP (it doesn't keep the streak). Answered,
// it shrinks to one line until tomorrow.
function MythCard({ t, locale }) {
  const day = dayKey();
  const myth = mythOf(day, locale.region);
  const tx = useLocaleText(locale);
  const saved = useAppState((s) => (s.modules.lessons || {}).myth);
  const answered = saved && saved.day === day ? saved : null;
  const [now, setNow] = useState(false); // answered on this visit: show the answer
  const pick = (a) => {
    setSlice("lessons", (s) => ({ ...s, myth: { day, id: myth.id, picked: a } }));
    recordPractice("myth");
    setNow(true);
  };
  if (answered && !now)
    return (
      <div style={{ display: "flex", alignItems: "center", gap: 8, marginTop: 12, padding: "12px 16px", background: "var(--surface)", borderRadius: 24, boxShadow: "var(--lift)", fontSize: 14, color: "var(--mid)" }}>
        <Icon name="check" size={16} /> {t("myth.done")}
      </div>
    );
  const right = answered && answered.picked === myth.answer;
  const btn = { flex: 1, minHeight: 46, borderRadius: 15, border: "1.5px solid var(--line)", background: "var(--surface)", color: "var(--ink)", fontWeight: 700, fontSize: 16, cursor: "pointer", font: "inherit", "--btn-edge": "var(--line)" };
  return (
    <Card style={{ marginTop: 12 }} data-myth={myth.id}>
      <div style={{ fontSize: 14, fontWeight: 650, color: "var(--mid)", marginBottom: 6 }}>{t("myth.label")}</div>
      <div className="nv-disp" style={{ fontSize: 21, lineHeight: 1.3, color: "var(--head)" }}>“{tx(myth.claim)}”</div>
      {!answered ? (
        <>
          <div style={{ display: "flex", gap: 10, marginTop: 14 }}>
            <button className="nv-press nv-btn" style={btn} onClick={() => pick("myth")}>
              {t("myth.myth")}
            </button>
            <button className="nv-press nv-btn" style={btn} onClick={() => pick("fact")}>
              {t("myth.fact")}
            </button>
          </div>
          <div style={{ fontSize: 13, color: "var(--low)", marginTop: 10 }}>{t("myth.meta")}</div>
        </>
      ) : (
        <div role="status">
          <div style={{ display: "flex", alignItems: "center", gap: 8, marginTop: 12, fontWeight: 750, color: right ? "var(--right)" : "var(--warn)" }}>
            <Icon name={right ? "check" : "info"} size={18} stroke={2.6} /> {t(right ? "myth.right" : "myth.wrong", { it: t(`myth.is.${myth.answer}`) })}
          </div>
          <p style={{ fontSize: 15, lineHeight: 1.5, margin: "4px 0 0" }}>{tx(myth.why)}</p>
          <div style={{ fontSize: 13, color: "var(--low)", marginTop: 8 }}>{t("myth.after")}</div>
        </div>
      )}
    </Card>
  );
}

// THE COURSE, as a voyage. Units you've passed are islands on a small sea
// map (a flag when finished; tap one to see its lessons), the boat sits at
// the current unit, and the next units are faint toward "open water". The
// current unit is open, with the boat at its current lesson (it glides to
// the next one when you come back from finishing a lesson). Later units
// fold to rows.
let lastBoat = null; // the lesson the boat sat at the last time the course showed

function BoatNode({ id, playing }) {
  const ref = useRef(null);
  useLayoutEffect(() => {
    if (playing) return; // glide once the learner is back from the lesson
    const from = lastBoat;
    lastBoat = id;
    const el = ref.current;
    const prev = from && from !== id && document.querySelector(`[data-node="${from}"]`);
    if (!el || !prev) return;
    const dy = prev.getBoundingClientRect().top - el.getBoundingClientRect().top;
    if (!dy || Math.abs(dy) > 600) return;
    el.style.transition = "none";
    el.style.transform = `translateY(${dy}px)`;
    el.getBoundingClientRect();
    el.style.transition = "";
    el.style.transform = "";
  }, [id, playing]);
  return (
    <span ref={ref} className="nv-glide" style={{ width: 44, height: 44, borderRadius: 22, margin: "0 -7px", flexShrink: 0, display: "flex", alignItems: "center", justifyContent: "center", background: "var(--artSky)", boxShadow: "0 0 0 3px var(--brand)", position: "relative", zIndex: 1 }}>
      <Mark size={28} color="var(--artInk)" />
    </span>
  );
}

// THE SEA CHART — every unit is its own landmark island (art.js LANDMARK),
// zigzagging down a dotted route: soft waves, buoys and a few birds; the
// current unit bigger, with the boat and a Continue card; finished units
// with a flag; the next ones in the mist; open water at the end. Each
// island is a button (named like a unit card) that opens its lessons
// below; the pictures are hidden from screen readers.
function SeaChart({ t, tx, go, progress, ci, next, all, setAll, opened, toggle, currentRef }) {
  const W = 358, ROW = 132, TOP = 22;
  const list = all || ci >= UNITS.length - 1 ? UNITS : UNITS.slice(0, ci + 4);
  const Y = [];
  let acc = TOP;
  for (let i = 0; i < list.length; i++) (Y.push(acc), (acc += i === ci ? ROW + 56 : ROW));
  const H = acc + 140;
  const pos = (i) => (i % 2 ? [W - 136, Y[i]] : [16, Y[i]]);
  const ctr = (i) => [pos(i)[0] + 60, pos(i)[1] + 62];
  const pts = list.map((_, i) => ctr(i));
  const curve = (p) =>
    p.length < 2 ? "" : p.slice(0, -1).map((a, i) => {
      const p0 = p[i - 1] || a, p2 = p[i + 1], p3 = p[i + 2] || p2;
      return `${i ? "" : `M${a}`}C${a[0] + (p2[0] - p0[0]) / 6},${a[1] + (p2[1] - p0[1]) / 6} ${p2[0] - (p3[0] - a[0]) / 6},${p2[1] - (p3[1] - a[1]) / 6} ${p2}`;
    }).join("");
  const here = Math.min(ci, list.length - 1);
  // Soft wave lines, scattered (always the same way) and clear of the islands.
  let seed = 7;
  const rnd = () => (seed = (seed * 9301 + 49297) % 233280) / 233280;
  const waves = Array.from({ length: Math.round(H / 26) }, () => [rnd() * (W - 30) + 8, rnd() * (H - 150) + 14])
    .filter(([x, y]) => !list.some((_, i) => Math.abs(x - ctr(i)[0]) < 64 && Math.abs(y - ctr(i)[1] + 8) < 46))
    .map(([x, y]) => `<path d="M${x.toFixed(0)} ${y.toFixed(0)}q5-3 10 0t10 0" stroke="var(--artSea2)" stroke-width="1.6" fill="none" stroke-linecap="round" opacity=".55"/>`)
    .join("");
  const buoys = pts.slice(0, -1).map((a, i) => {
    const b = pts[i + 1];
    const x = (a[0] + b[0]) / 2 + (i % 2 ? -18 : 18), y = (a[1] + b[1]) / 2;
    return `<g transform="translate(${x} ${y})"><path d="M-5 6h10l-2-11h-6Z" fill="${i < ci ? "var(--artSun)" : "var(--artSea2)"}"/><path d="M0 -5v-5" stroke="var(--artInk)" stroke-width="1.4"/><ellipse cx="0" cy="7" rx="8" ry="2" fill="var(--artSea2)" opacity=".5"/></g>`;
  }).join("");
  const bird = ([x, y]) => `<path d="M${x} ${y}q5-5 10 0q5-5 10 0" stroke="var(--artInk)" stroke-width="1.6" fill="none" stroke-linecap="round" opacity=".7"/>`;
  const birds = [[W - 70, 34], [W - 52, 46], [96, ctr(here)[1] - 72], [114, ctr(here)[1] - 82]].map(bird).join("");
  const isles = list.map((u, i) => {
    const [x, y] = pos(i);
    const done = unitDone(progress, u);
    const s = i === ci ? 1.18 : 1;
    const flag = done ? `<path d="M${x + 96} ${y + 60}V${y + 34}" stroke="var(--artInk)" stroke-width="2.2" stroke-linecap="round"/><path d="M${x + 97} ${y + 34}L${x + 110} ${y + 38.5}L${x + 97} ${y + 43}Z" fill="var(--artSun)"/>` : "";
    const halo = i === ci ? `<ellipse cx="${x + 60}" cy="${y + 58}" rx="78" ry="54" fill="var(--artPaper)" opacity=".55"/>` : "";
    return `${halo}<g transform="translate(${x + 60 - 60 * s} ${y + 4 - 12 * (s - 1)}) scale(${s})" opacity="${i > ci ? 0.42 : 1}">${LANDMARK[u.id] || ""}</g>${i === ci ? spark(x + 86, y + 6) : ""}${flag}`;
  }).join("");
  const mistTop = ci + 1 < list.length ? Y[ci + 1] - 10 : H;
  const boatAt = ci < UNITS.length ? [ctr(here)[0] + (here % 2 ? -98 : 58), ctr(here)[1] - 6] : [W / 2 - 16, H - 150];
  const svg = [
    `<defs><linearGradient id="nvmist" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="var(--artPaper)" stop-opacity="0"/><stop offset="1" stop-color="var(--artPaper)" stop-opacity=".7"/></linearGradient></defs>`,
    `<g class="nv-water">${waves}</g>`,
    `<circle cx="${W / 2}" cy="${H - 108}" r="40" fill="var(--artSun2)"/><rect x="0" y="${H - 108}" width="${W}" height="108" fill="var(--artSea)"/><path d="M0 ${H - 108}H${W}" stroke="var(--artSea2)" stroke-width="2"/>${star(W / 2, H - 170, 10, "var(--artSun)")}<path d="M${W / 2 - 30} ${H - 92}h60M${W / 2 - 16} ${H - 82}h32" stroke="var(--artSun2)" stroke-width="4" stroke-linecap="round"/>`,
    `<path d="${curve(pts.slice(here))}" fill="none" stroke="var(--artSea2)" stroke-width="3" stroke-linecap="round" stroke-dasharray="0.1 9"/>`,
    `<path d="${curve(pts.slice(0, here + 1))}" fill="none" stroke="var(--artInk)" stroke-width="3" stroke-linecap="round" stroke-dasharray="0.1 9"/>`,
    buoys, birds, isles,
    mistTop < H ? `<rect x="0" y="${mistTop}" width="${W}" height="${Math.max(0, H - 150 - mistTop)}" fill="url(#nvmist)"/>` : "",
    `<g class="nv-bob">${boat(boatAt[0], boatAt[1], 0.4)}</g>`,
  ].join("");
  const pct = (v, of) => `${(v / of) * 100}%`;
  const doneOf = (u) => u.lessons.filter((l) => lessonState(progress, l.id) === "done").length;
  return (
    <div style={{ position: "relative", width: "100%", maxWidth: 460, margin: "16px auto 0", aspectRatio: `${W} / ${H}`, borderRadius: 28, overflow: "hidden", background: "linear-gradient(180deg, var(--artSky), color-mix(in srgb, var(--artSea) 55%, var(--artSky)))", boxShadow: "var(--lift)" }}>
      <svg viewBox={`0 0 ${W} ${H}`} width="100%" height="100%" aria-hidden="true" style={{ position: "absolute", inset: 0, display: "block" }} dangerouslySetInnerHTML={{ __html: svg }} />
      {list.map((u, i) => {
        const [x, y] = pos(i);
        const n = u.lessons.length;
        const d = doneOf(u);
        const done = d === n;
        const now = i === ci;
        const meta = now ? t("path.lessons_of", { done: d, n }) : done ? t("path.of", { done: d, n }) : i < ci ? t("path.left", { n: n - d }) : t("path.after", { n: i });
        const name = `${t("lessons.unit_n", { n: i + 1 })} · ${tx(u.title)} · ${meta}`;
        if (now)
          return (
            <div key={u.id}>
              <button onClick={() => currentRef.current && currentRef.current.scrollIntoView({ behavior: "smooth", block: "start" })} aria-expanded="true" aria-label={name} className="nv-press" style={{ position: "absolute", left: pct(x - 8, W), top: pct(y - 6, H), width: pct(136, W), height: pct(118, H), border: "none", background: "transparent", borderRadius: 20, cursor: "pointer", padding: 0 }} />
              <div style={{ position: "absolute", left: pct(i % 2 ? 10 : 168, W), top: pct(y + 2, H), width: pct(180, W), background: "var(--surface)", borderRadius: 18, padding: 12, boxShadow: "0 0 0 2px var(--head), var(--lift)" }}>
                <span style={{ display: "inline-block", fontSize: 12, fontWeight: 700, borderRadius: 999, padding: "2px 9px", background: "var(--warmSoft)", color: "var(--warmInk)" }}>{t("path.now", { n: i + 1 })}</span>
                <div className="nv-disp" style={{ fontSize: 19, lineHeight: 1.15, margin: "6px 0 2px", color: "var(--head)" }}>{tx(u.title)}</div>
                <div style={{ fontSize: 13, color: "var(--mid)" }}>{meta}</div>
                <div style={{ height: 6, borderRadius: 3, background: "var(--surface2)", overflow: "hidden", margin: "6px 0 10px" }}>
                  <div style={{ width: `${(d / n) * 100}%`, height: "100%", background: "var(--brand)" }} />
                </div>
                {next && (
                  <Button full size="sm" onClick={() => go("lessons", { lesson: next.id })} aria-label={t("path.continue", { title: tx(next.title) })}>
                    {t("common.continue")}
                  </Button>
                )}
              </div>
            </div>
          );
        // The row is the button (named like a unit card); the words on it are
        // for the eye, so they're hidden from screen readers and let taps through.
        return (
          <div key={u.id}>
            <button onClick={() => toggle(u.id)} aria-expanded={!!opened[u.id]} aria-label={name} className="nv-press" style={{ position: "absolute", left: 0, width: "100%", top: pct(y, H), height: pct(ROW - 8, H), border: "none", background: "transparent", cursor: "pointer", padding: 0, borderRadius: 18 }} />
            <span aria-hidden="true" style={{ position: "absolute", left: pct(i % 2 ? 14 : 150, W), top: pct(y + 24, H), width: pct(176, W), pointerEvents: "none" }}>
              <span style={{ display: "block", fontSize: 12.5, fontWeight: 650, color: "var(--low)" }}>{t("lessons.unit_n", { n: i + 1 })}</span>
              <span style={{ display: "block", fontWeight: 700, color: "var(--head)", fontSize: 15, lineHeight: 1.25 }}>{tx(u.title)}</span>
              <span style={{ display: "inline-flex", alignItems: "center", gap: 4, marginTop: 4, fontSize: 12, fontWeight: 700, borderRadius: 999, padding: "2px 9px", background: done ? "var(--rightSoft)" : "var(--surface2)", color: done ? "var(--right)" : "var(--mid)" }}>
                {done && <Icon name="check" size={12} stroke={2.6} />}
                {meta}
              </span>
            </span>
          </div>
        );
      })}
      {list.length < UNITS.length && (
        <div style={{ position: "absolute", left: 0, right: 0, top: pct(H - 150, H), textAlign: "center" }}>
          <button onClick={() => setAll(true)} className="nv-press" style={{ border: "none", background: "var(--surface)", borderRadius: 999, padding: "8px 16px", fontWeight: 650, fontSize: 14, color: "var(--head)", boxShadow: "var(--lift)", cursor: "pointer", font: "inherit", minHeight: 40 }}>
            {t("path.mist", { n: UNITS.length - list.length })}
          </button>
        </div>
      )}
      <span aria-hidden="true" style={{ position: "absolute", left: 0, right: 0, bottom: pct(46, H), textAlign: "center", fontSize: 13, fontWeight: 650, color: "var(--mid)" }}>
        {t("path.open")}
      </span>
    </div>
  );
}

function Course({ t, locale, go, route }) {
  const progress = useAppState((s) => s.progress);
  const tx = useLocaleText(locale);
  const [opened, setOpened] = useState({});
  const [all, setAll] = useState(false);
  const toggle = (id) => setOpened((o) => ({ ...o, [id]: !o[id] }));
  const next = currentLesson(progress);
  const p = (route && route.params) || {};
  const playing = !!(p.lesson || p.review || p.challenge || p.startUnit);
  const ci = next ? UNITS.findIndex((u) => u.id === next.unit) : UNITS.length;
  const doneCount = ALL_LESSONS.filter((l) => lessonState(progress, l.id) === "done").length;
  const unitsDone = UNITS.filter((u) => unitDone(progress, u)).length;
  const currentRef = useRef(null);
  const lessonRow = (l, i, list) => {
    const st = lessonState(progress, l.id);
    const now = next && l.id === next.id;
    const challenge = st === "done" && M.offersChallenge(progress.lessons[l.id]);
    return (
      <div key={l.id} style={{ display: "flex", alignItems: "center", position: "relative" }}>
        {i < list.length - 1 && <span style={{ position: "absolute", left: 30, top: 40, bottom: -18, borderLeft: "3px dotted var(--artSea2)" }} />}
        <button
          onClick={() => (st === "locked" ? toast(t("lessons.locked")) : go("lessons", { lesson: l.id }))}
          aria-label={`${tx(l.title)} — ${st === "done" ? t("lessons.done_review") : t("lessons.minutes", { n: Math.round(minutes(l)) })}${now ? ` · ${t("lessons.start")}` : st === "locked" ? ` · ${t("lessons.locked_short")}` : ""}`}
          className="nv-press"
          style={{ display: "flex", alignItems: "center", gap: 14, flex: 1, minWidth: 0, textAlign: "left", border: "none", background: "transparent", color: "var(--ink)", padding: "10px 16px", cursor: "pointer", minHeight: now ? 68 : 58, font: "inherit" }}
        >
          {now ? (
            <BoatNode id={l.id} playing={playing} />
          ) : (
            <span data-node={l.id} style={{ width: 30, height: 30, borderRadius: 15, flexShrink: 0, display: "flex", alignItems: "center", justifyContent: "center", background: st === "done" ? "var(--accent)" : "var(--surface)", border: st === "done" ? "none" : "2px solid var(--line)", color: st === "done" ? "var(--onBrand)" : "var(--low)", position: "relative" }}>
              {st === "done" ? <Icon name="check" size={16} stroke={2.6} /> : st === "locked" ? <Icon name="lock" size={13} /> : null}
            </span>
          )}
          <span style={{ flex: 1, minWidth: 0 }}>
            <span style={{ display: "block", fontSize: now ? 17 : 16, fontWeight: now ? 750 : 600, color: st === "locked" ? "var(--low)" : now ? "var(--head)" : "var(--ink)" }}>{tx(l.title)}</span>{" "}
            <span style={{ display: "block", fontSize: 14, color: "var(--mid)", marginTop: 1 }}>{st === "done" ? t("lessons.done_review") : t("lessons.minutes", { n: Math.round(minutes(l)) })}</span>
          </span>
          {now && " "}
          {now && (
            <span className="nv-btn" style={{ background: "var(--brand)", color: "var(--onBrand)", borderRadius: 14, padding: "8px 14px", fontSize: 14, fontWeight: 700, "--btn-edge": "var(--edge)" }} aria-hidden="true">
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
  // A unit opened from its island (not the current one): its lessons, to
  // review, take a challenge, or see what's ahead.
  const openedCards = UNITS.filter((u, i) => i !== ci && opened[u.id]);
  const current = ci < UNITS.length ? UNITS[ci] : null;
  return (
    <section aria-label={t("path.title")} style={{ marginTop: 30 }}>
      <h2 className="nv-disp" style={{ fontSize: 28, margin: "0 0 4px" }}>{t("path.title")}</h2>
      <div style={{ fontSize: 14, color: "var(--mid)", marginBottom: 10 }}>{t("path.count", { done: doneCount, total: ALL_LESSONS.length, units: unitsDone, unitsTotal: UNITS.length })}</div>
      <Progress value={doneCount} max={ALL_LESSONS.length} height={6} label={t("lessons.overall")} />
      <SeaChart t={t} tx={tx} go={go} progress={progress} ci={ci} next={next} all={all} setAll={setAll} opened={opened} toggle={toggle} currentRef={currentRef} />
      <div style={{ display: "flex", flexDirection: "column", gap: 10, marginTop: 14 }}>
        {openedCards.map((u) => (
          <Card key={u.id} pad="14px 0 6px">
            <div style={{ display: "flex", alignItems: "center", gap: 10, padding: "0 12px 4px 18px" }}>
              <div style={{ flex: 1 }}>
                <div style={{ fontSize: 13, color: "var(--low)", fontWeight: 600 }}>{t("lessons.unit_n", { n: UNITS.indexOf(u) + 1 })}</div>
                <div style={{ fontSize: 18, fontWeight: 750 }}>{tx(u.title)}</div>
              </div>
              <button onClick={() => toggle(u.id)} aria-label={`${t("common.close")}: ${tx(u.title)}`} style={{ border: "none", background: "var(--surface2)", color: "var(--ink)", borderRadius: 18, width: 36, height: 36, display: "flex", alignItems: "center", justifyContent: "center", cursor: "pointer" }}>
                <Icon name="close" size={16} />
              </button>
            </div>
            {u.lessons.map(lessonRow)}
          </Card>
        ))}
        {current && (
          <div ref={currentRef} style={{ scrollMarginTop: 80 }}>
            <Card pad="16px 0 6px">
              <div style={{ display: "flex", alignItems: "center", gap: 12, padding: "0 16px 6px 18px" }}>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ fontSize: 13, color: "var(--low)", fontWeight: 600 }}>{t("path.now", { n: ci + 1 })}</div>
                  <div className="nv-disp" style={{ fontSize: 24, lineHeight: 1.15, color: "var(--head)" }}>{tx(current.title)}</div>
                </div>
                <span style={{ width: 80, height: 62, borderRadius: 16, background: "var(--artSky)", overflow: "hidden", display: "flex", alignItems: "flex-end", justifyContent: "center", flexShrink: 0 }}>
                  <UnitArt id={current.id} width={82} />
                </span>
              </div>
              {current.lessons.map(lessonRow)}
            </Card>
          </div>
        )}
      </div>
    </section>
  );
}

function Learn(ctx) {
  // The next lesson's unit, fetched quietly once the page has shown, so
  // Continue opens at once.
  const next = currentLesson(useAppState((s) => s.progress));
  const unit = next && next.unit;
  useEffect(() => {
    if (!unit) return undefined;
    const id = setTimeout(() => loadUnits([unit]).catch(() => {}), 800);
    return () => clearTimeout(id);
  }, [unit]);
  return (
    <div>
      <Today {...ctx} />
      <Course {...ctx} />
    </div>
  );
}

// MOMENTS — a 7, 30 or 100-day streak, or a finished unit, gets one calm
// full-screen moment with a share option (the share card has no names or
// amounts). At most one per session; a second becomes a line on the
// finish screen (it's already there: the unit line, the streak).
const STREAKS = [7, 30, 100];
let momentShown = false;
function Moment({ t, locale, result, unit, onDone }) {
  const tx = useLocaleText(locale);
  const n = result.streak;
  const streak = result.moment === "streak";
  const known = conceptsNow();
  const solid = streak ? 0 : conceptsOfUnit(unit.id).filter((c) => ["solid", "mastered"].includes(M.levelOf(known[c]))).length;
  const list = (items) => new Intl.ListFormat(locale.lang, { type: "conjunction" }).format(items);
  return (
    <>
      <div data-moment={result.moment} style={{ flex: 1, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", textAlign: "center", gap: 6, padding: "24px 6px" }}>
        {streak ? (
          <>
            <div className="nv-disp" style={{ width: 168, height: 168, borderRadius: 84, border: "3px solid var(--brand)", boxShadow: "0 0 0 10px var(--warmSoft)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: n >= 100 ? 66 : 84, letterSpacing: -2, color: "var(--brand)", fontVariantNumeric: "tabular-nums" }}>{n}</div>
            {n === 7 && (
              <div aria-hidden style={{ display: "flex", gap: 8, marginTop: 18 }}>
                {Array.from({ length: 7 }, (_, i) => (
                  <span key={i} style={{ width: 10, height: 10, borderRadius: 5, background: "var(--warm)" }} />
                ))}
              </div>
            )}
            <h1 className="nv-disp" style={{ fontSize: 34, lineHeight: 1.1, margin: "24px 0 6px" }}>{t(`moment.streak.${n}`)}</h1>
            <p style={{ fontSize: 17, color: "var(--mid)", lineHeight: 1.5, margin: 0, maxWidth: 340 }}>{t(`moment.streak.${n}.sub`)}</p>
          </>
        ) : (
          <>
            <span style={{ width: 220, height: 165, borderRadius: 28, background: "var(--artSky)", overflow: "hidden", display: "flex", alignItems: "flex-end", justifyContent: "center" }}>
              <UnitArt id={unit.id} width={220} />
            </span>
            <div style={{ fontSize: 14, fontWeight: 600, color: "var(--low)", marginTop: 22 }}>{t("moment.unit.eyebrow", { n: UNITS.indexOf(unit) + 1, total: UNITS.length })}</div>
            <h1 className="nv-disp" style={{ fontSize: 34, lineHeight: 1.1, margin: "4px 0 6px" }}>{tx(unit.title)}</h1>
            <p style={{ fontSize: 16, color: "var(--mid)", lineHeight: 1.5, margin: 0, maxWidth: 360 }}>{t("moment.unit.sub", { lessons: list(unit.lessons.map((l) => `“${tx(l.title)}”`)) })}</p>
            <div style={{ display: "flex", gap: 28, marginTop: 20, fontSize: 15, color: "var(--mid)" }}>
              <span>{t("moment.lessons", { n: unit.lessons.length })}</span>
              {solid > 0 && <span>{t("moment.solid", { n: solid })}</span>}
            </div>
          </>
        )}
      </div>
      <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
        <Button full kind="secondary" onClick={() => openShare(streak ? { kind: "streak", n } : { kind: "unit", title: tx(unit.title) })}>
          <Icon name="share" size={18} /> {t("share.button")}
        </Button>
        <Button full onClick={onDone}>
          {t("common.continue")}
        </Button>
      </div>
    </>
  );
}

// The finish: the day's ring fills and the XP counts up (instantly with
// "reduce motion"), then the streak and the day's total.
// The ring rises like a sun over the sea, with a few small stars (no
// confetti). The waves drift for a few seconds, then stop.
// The one red spark on the sea chart: a small pennant on the island you're on.
const spark = (x, y) => `<path d="M${x} ${y + 26}V${y}" stroke="var(--artInk)" stroke-width="2.4" stroke-linecap="round"/><path d="M${x + 1.2} ${y}L${x + 17} ${y + 6}L${x + 1.2} ${y + 12}Z" fill="var(--spark)"/>`;
const SUNRISE = `<defs><linearGradient id="nvsky" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="var(--bg)"/><stop offset="1" stop-color="var(--warmSoft)"/></linearGradient></defs><rect width="390" height="250" fill="url(#nvsky)"/>${[[60, 64, 7], [326, 76, 9], [40, 142, 4], [352, 132, 5], [92, 34, 3]].map(([x, y, r]) => star(x, y, r, "var(--warm)")).join("")}<g class="nv-drift"><path d="${wave(440, 250, 7, 5, 196)}" fill="var(--artSea)"/><path d="${wave(440, 250, 6, 4, 218)}" fill="var(--artSea2)" opacity=".7"/></g>${boat(296, 156, 0.42)}<path d="${wave(390, 250, 8, 5, 240)}" fill="var(--bg)"/>`;
function Sunrise({ children }) {
  return (
    <div style={{ position: "relative", margin: "-10px -18px 0", padding: "26px 18px 70px" }}>
      <svg viewBox="0 0 390 250" preserveAspectRatio="xMidYMax slice" aria-hidden="true" style={{ position: "absolute", inset: 0, width: "100%", height: "100%", display: "block" }} dangerouslySetInnerHTML={{ __html: SUNRISE }} />
      <div style={{ position: "relative" }}>{children}</div>
    </div>
  );
}

function FinishRing({ t, before, after, goal, gained, streak }) {
  const still = reducedMotion();
  const [shown, setShown] = useState(still ? after : before);
  const [n, setN] = useState(still ? gained : 0);
  useEffect(() => {
    if (still) return undefined;
    const start = performance.now();
    let raf = requestAnimationFrame(function step(now) {
      const p = Math.min(1, (now - start) / 650);
      setN(Math.round(gained * p));
      if (p < 1) raf = requestAnimationFrame(step);
    });
    const id = setTimeout(() => setShown(after), 30);
    return () => (cancelAnimationFrame(raf), clearTimeout(id));
  }, []);
  return (
    <div style={{ display: "flex", flexDirection: "column", alignItems: "center" }}>
      <div style={{ borderRadius: "50%", background: "var(--surface)" }}>
      <Ring value={Math.min(shown, goal)} max={goal} size={150} stroke={8} label={t("finish.today", { xp: after, goal, n: streak })}>
        <div style={{ textAlign: "center", lineHeight: 1 }}>
          <div className="nv-disp" style={{ fontSize: 44, letterSpacing: -1, fontVariantNumeric: "tabular-nums", color: "var(--head)" }}>+{n}</div>
          <div style={{ fontSize: 13, color: "var(--mid)", marginTop: 4 }}>XP</div>
        </div>
      </Ring>
      </div>
      <p style={{ fontSize: 14, color: "var(--mid)", margin: "10px 0 0" }}>{t("finish.today", { xp: after, goal, n: streak })}</p>
    </div>
  );
}

// THE PLAYER — one step at a time, for a lesson, a review or a challenge.
// A miss shows why that answer is wrong; in a lesson it also brings an
// extra card and an easier question on that concept right away, and the
// missed question comes back once at the end. Each question's first
// attempt updates the learner's mastery of its concept.
// A LESSON LEFT PARTWAY (closed, or the phone shutting the app) picks up
// at the same step next time, for a week: its place is saved after every
// step in the lessons slice as `open`. Steps are saved by key: "3" is step
// 3, "3x"/"3e" the extra card and easier question after missing it, "…r"
// a missed question's second try.
function stepOfKey(steps, key) {
  const i = parseInt(key, 10);
  const tail = key.slice(String(i).length);
  const s = steps[i];
  if (!s || !/^[xe]?r?$/.test(tail)) return null;
  const c = /^[xe]/.test(tail) && conceptById(s.c);
  if (/^[xe]/.test(tail) && !c) return null;
  const base = tail[0] === "x" ? { ...c.explain, extra: true } : tail[0] === "e" ? { ...c.easy, c: s.c, extra: true } : s;
  return { ...base, key, ...(tail.endsWith("r") ? { retry: true } : {}) };
}
function resumeOf(run) {
  const o = run.mode === "lesson" && (getState().modules.lessons || {}).open;
  if (!o || o.id !== run.lesson.id || o.n !== run.steps.length || o.day < addDays(dayKey(), -7)) return null;
  const queue = o.keys.map((k) => stepOfKey(run.steps, k));
  return queue.every(Boolean) && o.at > 0 && o.at < queue.length ? { ...o, queue } : null;
}

function Player({ t, locale, run, onExit, go, ...ctx }) {
  const { mode, lesson } = run;
  const tx = useLocaleText(locale);
  const [saved] = useState(() => resumeOf(run));
  const [queue, setQueue] = useState(() => (saved ? saved.queue : run.steps.map((s, i) => ({ ...s, key: `${i}` }))));
  const firsts = useRef(saved ? saved.firsts : []); // first attempts: [{ c, right }]
  const helped = useRef(new Set(saved ? saved.helped : [])); // concepts that already got extra help
  const [at, setAt] = useState(saved ? saved.at : 0);
  const [picked, setPicked] = useState(null);
  const [checked, setChecked] = useState(null); // null | "right" | "wrong"
  const [mistakes, setMistakes] = useState(saved ? saved.mistakes : 0);
  const [actionDone, setActionDone] = useState(false);
  const [result, setResult] = useState(null);
  const [quit, setQuit] = useState(false);
  const [momentDone, setMomentDone] = useState(false);
  const feedbackRef = useRef(null);
  // The feedback comes into view when it appears (long text, small phones).
  useEffect(() => {
    if (checked && feedbackRef.current) feedbackRef.current.scrollIntoView({ block: "nearest" });
  }, [checked]);
  const step = queue[at];
  const unit = UNITS.find((u) => u.id === lesson.unit);
  const total = queue.length;
  // Each lesson step reached (so the admin page can show where people stop).
  useEffect(() => {
    if (mode === "lesson") track("lesson_step", { lesson: lesson.id, step: at, of: total });
    // Everything before `at` is done: save the place.
    if (mode === "lesson" && at > 0) {
      setSlice("lessons", (s) => ({ ...s, open: { id: lesson.id, n: run.steps.length, keys: queue.map((q) => q.key), at, mistakes, firsts: [...firsts.current], helped: [...helped.current], day: dayKey() } }));
      saveNow();
    }
  }, [at]);

  const advance = () => {
    setPicked(null);
    setChecked(null);
    setActionDone(false);
    if (at + 1 < queue.length) return setAt(at + 1);
    const before = conceptsNow();
    saveConcepts((c) => M.applySession(c, firsts.current, dayKey()));
    feel("finish");
    if (mode !== "lesson") return setResult(recordReview({ kind: mode, mistakes }));
    // Ideas that moved up to solid or mastered in this lesson (a quiet line).
    const after = conceptsNow();
    const rank = (r) => M.LEVELS.indexOf(M.levelOf(r));
    const levelUps = [...new Set(firsts.current.map((a) => a.c).filter(Boolean))].filter((c) => rank(after[c]) > rank(before[c]) && rank(after[c]) >= 2).map((c) => ({ c, level: M.levelOf(after[c]) }));
    const xpBefore = xpOn(getState().progress, dayKey());
    const wasUnitDone = unitDone(getState().progress, unit);
    const allDone = () => UNITS.every((u) => unitDone(getState().progress, u));
    const wasAllDone = allDone();
    const r = recordLesson({ id: lesson.id, perfect: mistakes === 0, mistakes });
    setSlice("lessons", (s) => ({ ...s, open: null }));
    saveNow();
    const unitJustDone = !wasUnitDone && unitDone(getState().progress, unit);
    const moment = momentShown ? null : unitJustDone ? "unit" : r.streakUp && STREAKS.includes(r.streak) ? "streak" : null;
    if (moment) momentShown = true;
    setResult({ ...r, unitJustDone, courseJustDone: !wasAllDone && allDone(), levelUps, moment, xpBefore, xpAfter: xpOn(getState().progress, dayKey()) });
  };
  // The answer so far: what was picked, or the type's starting answer.
  const value = step && isQuestion(step) && picked === null ? startValue(step, locale.region) : picked;
  const Q = step && isQuestion(step) ? QTYPES[step.type] : null;
  const canCheck = !!Q && !checked && Q.ready(step, value);
  const check = () => {
    if (!canCheck) return;
    const right = QTYPES[step.type].grade(step, value, locale.region);
    if (right) feel("right");
    if (picked === null) setPicked(value);
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
      if (e.target.tagName === "INPUT" || e.target.tagName === "TEXTAREA" || (e.target.closest && e.target.closest("[data-q]"))) return;
      if ((step.type === "choice" || step.type === "tf") && !checked && /^[1-4]$/.test(e.key)) {
        const n = Number(e.key) - 1;
        if (step.type === "tf" && n < 2) setPicked(n === 0);
        if (step.type === "choice" && n < step.options.length) setPicked(n);
      }
      if (e.key === "Enter") {
        if (step.type === "card") advance();
        else if (canCheck) check();
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
  if (result && result.moment && !momentDone)
    return (
      <Overlay label={run.title}>
        <Moment t={t} locale={locale} result={result} unit={unit} onDone={() => setMomentDone(true)} />
      </Overlay>
    );
  if (result) {
    const progress = getState().progress;
    const nl = nextFor(progress, service("goals", "recommendedUnits")() || []);
    const toward = service("goals", "buildingToward")();
    const TryCard = service("missions", "TryCard");
    const facts = [...(result.goalJustMet ? [t("lessons.goal_met")] : []), ...(mistakes === 0 ? [t("lessons.perfect")] : [])];
    return (
      <Overlay label={run.title}>
        <div style={{ flex: 1, display: "flex", flexDirection: "column", justifyContent: "flex-start", gap: 16, paddingBottom: 18 }}>
          <Sunrise>
            <FinishRing t={t} before={result.xpBefore} after={result.xpAfter} goal={progress.dailyGoal} gained={result.gained} streak={result.streak} />
          </Sunrise>
          <div style={{ textAlign: "center", marginTop: -34, position: "relative" }}>
            <h1 className="nv-disp" style={{ fontSize: 32, lineHeight: 1.1, margin: 0 }}>{t("lessons.complete")}</h1>
            <p style={{ color: "var(--mid)", margin: "4px 0 0", fontSize: 16 }}>{tx(lesson.title)}</p>
            {facts.length > 0 && <p style={{ fontSize: 14, color: "var(--mid)", margin: "8px 0 0" }}>{facts.join("  ·  ")}</p>}
            {result.courseJustDone && <p className="nv-disp" style={{ fontSize: 22, color: "var(--head)", margin: "16px 0 0", lineHeight: 1.3 }}>{t("lessons.course_done")}</p>}
          </div>
          <Card>
            <div style={{ fontSize: 14, fontWeight: 650, color: "var(--mid)", marginBottom: 4 }}>{t("finish.life")}</div>
            <p style={{ fontSize: 16, lineHeight: 1.5, margin: 0 }}>{tx(lesson.life)}</p>
            {toward && (
              <div style={{ display: "flex", alignItems: "center", gap: 8, marginTop: 10, fontSize: 14, color: "var(--mid)" }}>
                <Icon name="target" size={16} /> {t("today.toward", { name: toward })}
              </div>
            )}
          </Card>
          {result.levelUps.length > 0 && (
            <div style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: 8, fontSize: 14, color: "var(--mid)", textAlign: "center" }}>
              <Icon name="star" size={16} color="var(--brand)" />
              <span>{result.levelUps.map((x) => t(x.level === "mastered" ? "finish.mastered" : "finish.solid", { name: tx(conceptById(x.c).name) })).join("  ·  ")}</span>
            </div>
          )}
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

  return (
    <Overlay label={run.title}>
      <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 20 }}>
        <button onClick={() => setQuit(true)} aria-label={t("common.close")} style={{ border: "none", background: "transparent", color: "var(--low)", width: 44, height: 44, display: "flex", alignItems: "center", justifyContent: "center", cursor: "pointer" }}>
          <Icon name="close" />
        </button>
        <div style={{ flex: 1, position: "relative" }}>
          <Progress value={at} max={total} height={6} label={run.title} />
          <span aria-hidden="true" style={{ position: "absolute", top: -21, left: `calc(${(Math.min(at, total) / total) * 100}% - 13px)`, transition: "left .6s cubic-bezier(.2,.7,.2,1)" }}>
            <Mark size={26} color="var(--artInk)" />
          </span>
        </div>
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
            <h2 className="nv-disp" style={{ fontSize: 29, margin: "0 0 12px", lineHeight: 1.15 }}>{tx(step.title)}</h2>
            <p style={{ fontSize: 19, lineHeight: 1.55, margin: 0 }}>{tx(step.body)}</p>
            {service("tutor", "canExplain")(`${tx(step.title)} ${tx(step.body)}`) && <button onClick={() => service("tutor", "explain")({ question: tx(step.title), context: tx(step.body) })} className="nv-press" style={{ marginTop: 18, border: "1px solid var(--line)", background: "var(--bg)", color: "var(--brand)", borderRadius: 999, padding: "10px 16px", fontWeight: 650, fontSize: 15, cursor: "pointer", display: "inline-flex", alignItems: "center", gap: 8, minHeight: 44 }}>
              <Icon name="chat" size={18} /> {t("lessons.explain")}
            </button>}
          </div>
        )}
        {isQuestion(step) && <Question t={t} locale={locale} step={step} value={value} setValue={setPicked} checked={checked} right={checked === "right"} submit={check} label={mode === "challenge" ? t("challenge.chip") : mode === "review" ? t("review.title") : null} />}
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
        {checked && (
          <div ref={feedbackRef} style={{ scrollMarginBottom: 90 }}>
          <Feedback
            t={t}
            locale={locale}
            step={step}
            picked={value}
            checked={checked}
            heading={Q.heading && Q.heading(step, value, locale.region, t, locale, checked === "right")}
            extra={Q.Extra && <Q.Extra step={step} right={checked === "right"} t={t} locale={locale} />}
            note={checked === "wrong" && !step.retry && mode !== "challenge" ? t("lessons.wrong.again") : null}
          />
          </div>
        )}
        {/* The buttons stay on screen, however long the step or its feedback. */}
        <div style={{ position: "sticky", bottom: 0, background: "var(--bg)", padding: "8px 0 4px", boxShadow: "0 -10px 12px -6px var(--bg)" }}>
        {step.type === "card" && (
          <Button full onClick={advance}>
            {t("common.continue")}
          </Button>
        )}
        {isQuestion(step) &&
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

// The units a session needs (their cards and questions) before it starts.
function unitsFor(p) {
  if (p.review) return M.pickReview(conceptsNow(), dayKey()).ids.map((c) => (conceptById(c) || {}).unit);
  if (p.challenge) return [(lessonById(p.challenge) || {}).unit];
  if (p.lesson) return [(lessonById(p.lesson) || {}).unit];
  if (p.startUnit) return [p.startUnit, (nextFor(getState().progress, service("goals", "recommendedUnits")() || []) || {}).unit];
  return [];
}

function Screen(ctx) {
  const p = ctx.route.params;
  const key = p.review ? "review" : p.challenge ? `challenge:${p.challenge}` : p.lesson || p.startUnit || null;
  // Loaded already (usually: the next unit is fetched in the background),
  // the lesson opens at once; otherwise the boat shows for a moment.
  const needs = key ? unitsFor(p).filter(Boolean) : [];
  const [loaded, setLoaded] = useState(null); // the key whose units arrived, or "!key" if they couldn't
  useEffect(() => {
    if (!key || needs.every(unitLoaded)) return undefined;
    let on = true;
    loadUnits(needs).then(() => on && setLoaded(key), () => on && setLoaded(`!${key}`));
    return () => {
      on = false;
    };
  }, [key]);
  const ready = !!key && (loaded === key || needs.every(unitLoaded));
  const session = useMemo(() => (ready ? sessionFor(p, ctx.t, ctx.locale) : null), [key, ready]);
  return (
    <>
      <Learn {...ctx} />
      {key && !ready && (
        <Overlay label={ctx.t("common.loading")}>
          <div aria-busy={loaded !== `!${key}`} style={{ flex: 1, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", gap: 18, textAlign: "center" }}>
            {loaded === `!${key}` ? (
              <>
                <p role="alert" style={{ fontSize: 17, maxWidth: 320, margin: 0 }}>{ctx.t("common.load_error")}</p>
                <Button onClick={() => ctx.go("lessons")}>{ctx.t("common.close")}</Button>
              </>
            ) : (
              <Loading label={ctx.t("common.loading")} />
            )}
          </div>
        </Overlay>
      )}
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
    // "Both" in Settings: money across borders opens after Banking.
    setBothMode,
    // How many concepts are due for review (Home shows it), and when the
    // next one is (reminders).
    reviewStatus,
    reviewDueOn: () => M.nextDue(conceptsNow()),
    // For real-life missions: units with a finished lesson (or tested out of),
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
    firstLessonWith: (kind) => ALL_LESSONS.find((l) => l.action === kind) || null,
    lessonDone: (id) => lessonState(getState().progress, id) === "done",
    unitTitles: (ids) => ids.map((id) => (UNITS.find((u) => u.id === id) || {}).title).filter(Boolean),
    nextFor: (units) => {
      const l = nextFor(getState().progress, units);
      return l && { ...l, unitTitle: UNITS.find((u) => u.id === l.unit).title };
    },
  },
});

export { ALL_LESSONS };
