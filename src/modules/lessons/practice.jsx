// PRACTICE — the parts of the learning engine people see: a question and
// its feedback (with why a wrong answer is wrong), the Review card, the
// session-complete screen for reviews and challenges, the skills overview
// on Me, and the placement test in onboarding. Rules in mastery.js.
import { useState } from "react";
import { useSlice, setSlice, getState, useAppState, update } from "../../core/store.js";
import { addStrings, shortDate, text } from "../../core/i18n.js";
import { dayKey } from "../../core/progress.js";
import { track } from "../../core/analytics.js";
import { service } from "../../core/registry.js";
import { Button, Card, Icon, Label, Sheet } from "../../core/ui.jsx";
import * as M from "./mastery.js";
import { UNITS, conceptsOfLesson, conceptsOfUnit } from "./content.js";
import { CONCEPTS, PLACEMENT, conceptById } from "./concepts.js";

const S = (en, es) => ({ en, es });
addStrings({
  "lessons.answer_is": S("The answer: {answer}.", "La respuesta: {answer}."),
  "review.title": S("Review", "Repaso"),
  "review.ready": S("{n} {n|concept|concepts} ready · 2–3 min", "{n} {n|concepto listo|conceptos listos} · 2–3 min"),
  "review.caught_up": S("Nothing to review. Your memory's in good shape until {date}.", "Nada que repasar. Tu memoria está en forma hasta el {date}."),
  "review.start": S("Review", "Repasar"),
  "review.anyway": S("Practice anyway", "Practicar de todos modos"),
  "review.sub": S("Brings back what you missed or haven't seen in a while, so it sticks.", "Trae de vuelta lo que fallaste o no has visto en un tiempo, para que se quede."),
  "review.done": S("Review complete", "Repaso completo"),
  "challenge.title": S("Challenge: {title}", "Reto: {title}"),
  "challenge.done": S("Challenge complete", "Reto completo"),
  "challenge.offer": S("Try the challenge version", "Intentar la versión reto"),
  "challenge.chip": S("Challenge", "Reto"),
  "challenge.score": S("{right} of {total} right", "{right} de {total} correctas"),
  "skills.title": S("Skills", "Habilidades"),
  "skills.sub": S("How well you know each idea. Reviews keep them fresh.", "Qué tan bien conoces cada idea. Los repasos las mantienen frescas."),
  "skills.all": S("See all skills", "Ver todas las habilidades"),
  "level.new": S("New", "Nuevo"),
  "level.learning": S("Learning", "Aprendiendo"),
  "level.solid": S("Solid", "Sólido"),
  "level.mastered": S("Mastered", "Dominado"),
  "place.title": S("How do you want to start?", "¿Cómo quieres empezar?"),
  "place.sub": S("Lessons take about 4 minutes.", "Las lecciones duran unos 4 minutos."),
  "place.new": S("From the beginning", "Desde el principio"),
  "place.new.sub": S("{unit}, lesson 1: {title}", "{unit}, lección 1: {title}"),
  "place.some": S("I know some basics", "Ya sé algo de lo básico"),
  "place.some.sub": S("A 2-minute check skips what you know", "Una prueba de 2 minutos salta lo que ya sabes"),
  "place.why": S("Why these lessons", "Por qué estas lecciones"),
  "place.why.body": S("For your goal ({name}), these come first: {units}.", "Para tu meta ({name}), primero vienen: {units}."),
  "place.q": S("Question {n} of up to {total}", "Pregunta {n} de hasta {total}"),
  "place.q.sub": S("One question per unit. It stops at the first miss.", "Una pregunta por unidad. Se detiene en el primer error."),
  "place.result": S("You can skip {n} {n|unit|units}", "Puedes saltar {n} {n|unidad|unidades}"),
  "place.result.none": S("Let's start at the beginning", "Empecemos desde el principio"),
  "place.result.sub": S("You can always go back to skipped units.", "Siempre puedes volver a las unidades que saltaste."),
  "place.result.none.sub": S("No problem — the first units are quick, and you'll move fast.", "No hay problema: las primeras unidades son rápidas y vas a avanzar pronto."),
});

const tx = (locale) => (x, vars) => text(x, locale, vars);

// ---- the concept store (the lessons module's slice) -----------------------

const DEFAULTS = { concepts: null };
// Learners from before mastery existed get records from their finished
// lessons; saved the first time anything changes.
const seed = (progress) => M.seedFromLessons(progress.lessons, conceptsOfLesson, dayKey());
export const conceptsNow = () => {
  const s = getState().modules.lessons;
  return (s && s.concepts) || seed(getState().progress);
};
export const saveConcepts = (fn) => setSlice("lessons", (s) => ({ ...s, concepts: fn((s && s.concepts) || seed(getState().progress)) }), DEFAULTS);
export function useConcepts() {
  const slice = useSlice("lessons", DEFAULTS);
  const progress = useAppState((s) => s.progress);
  return slice.concepts || seed(progress);
}

// ---- a question and its feedback -----------------------------------------

// `bare`: just the options (the question types around it show the rest).
export function QuestionView({ t, locale, step, picked, setPicked, checked, label, bare }) {
  const x = tx(locale);
  const opts = step.type === "tf" ? [{ v: true, label: t("lessons.true") }, { v: false, label: t("lessons.false") }] : step.options.map((o, i) => ({ v: i, label: x(o) }));
  return (
    <div>
      {!bare && <div style={{ fontSize: 14, fontWeight: 650, color: "var(--mid)", marginBottom: 8 }}>{label || t("lessons.question")}</div>}
      {!bare && <h2 style={{ fontSize: 23, fontWeight: 700, margin: "0 0 20px", lineHeight: 1.3 }}>{x(step.q)}</h2>}
      <div role="radiogroup" style={{ display: "flex", flexDirection: step.type === "tf" ? "row" : "column", gap: 10 }}>
        {opts.map((o, i) => {
          const sel = picked === o.v;
          const isAnswer = checked && o.v === step.answer;
          const isWrongPick = checked === "wrong" && sel;
          return (
            <button
              key={i}
              role="radio"
              aria-checked={sel}
              disabled={!!checked}
              onClick={() => setPicked(o.v)}
              className="nv-press"
              style={{ flex: step.type === "tf" ? 1 : undefined, textAlign: "left", display: "flex", alignItems: "center", gap: 12, border: `2px solid ${isAnswer ? "var(--right)" : isWrongPick ? "var(--warn)" : sel ? "var(--brand)" : "transparent"}`, background: isAnswer ? "var(--rightSoft)" : isWrongPick ? "var(--warnSoft)" : sel ? "var(--brandSoft)" : "var(--surface)", color: "var(--ink)", borderRadius: 14, padding: "15px 16px", fontSize: 17, fontWeight: 650, cursor: checked ? "default" : "pointer", minHeight: 58 }}
            >
              <span style={{ width: 28, height: 28, borderRadius: 8, border: "1px solid var(--line)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 13, fontWeight: 650, color: "var(--low)", flexShrink: 0 }}>{i + 1}</span>
              <span>{o.label}</span>
            </button>
          );
        })}
      </div>
    </div>
  );
}

// Right: why. Wrong: why that choice is wrong, then the answer and why.
// Amber, not red — a miss is part of learning. Other question types add
// their own heading ("Close: within 15%") and detail (the right order…);
// `why` can be a list of steps, one per line.
export function Feedback({ t, locale, step, picked, checked, note, heading, extra }) {
  const x = tx(locale);
  const right = checked === "right";
  const miss = !right && step.type === "choice" && step.miss && step.miss[picked];
  const why = Array.isArray(step.why) ? step.why : [step.why];
  return (
    <div className="nv-in" role="status" style={{ background: right ? "var(--rightSoft)" : "var(--warnSoft)", borderRadius: 14, padding: "14px 16px", marginBottom: 12 }}>
      <div style={{ fontWeight: 700, fontSize: 18, color: right ? "var(--right)" : "var(--warn)", display: "flex", alignItems: "center", gap: 8 }}>
        <Icon name={right ? "check" : "info"} size={22} stroke={right ? 3 : 2.2} />
        {heading || (right ? t("lessons.correct") : t("lessons.wrong"))}
      </div>
      {miss && <p style={{ margin: "6px 0 0", fontSize: 16, lineHeight: 1.5, fontWeight: 600 }}>{x(miss)}</p>}
      {extra && <div style={{ fontSize: 15, lineHeight: 1.5 }}>{extra}</div>}
      {why.map((w, i) => (
        <p key={i} style={{ margin: "6px 0 0", fontSize: 16, lineHeight: 1.5 }}>
          {i === 0 && !right && step.type === "choice" && `${t("lessons.answer_is", { answer: x(step.options[step.answer]) })} `}
          {x(w)}
        </p>
      ))}
      {note && <p style={{ margin: "6px 0 0", fontSize: 14, color: "var(--mid)" }}>{note}</p>}
    </div>
  );
}

// ---- levels ---------------------------------------------------------------

// One shade per level, from the look (clearly distinct in light and dark).
const SHADE = { new: "var(--surface2)", learning: "var(--level1)", solid: "var(--level2)", mastered: "var(--level3)" };
const Dot = ({ level, size = 10 }) => <span aria-hidden style={{ width: size, height: size, borderRadius: 3, background: SHADE[level], flexShrink: 0, display: "inline-block" }} />;
function Meter({ level }) {
  const n = M.LEVELS.indexOf(level);
  return (
    <span aria-hidden style={{ display: "inline-flex", gap: 3 }}>
      {[1, 2, 3].map((i) => (
        <span key={i} style={{ width: 14, height: 6, borderRadius: 3, background: i <= n ? SHADE[level] : "var(--surface2)" }} />
      ))}
    </span>
  );
}

// ---- Review card (Learn screen) -------------------------------------------

export function ReviewCard({ t, locale, go }) {
  const concepts = useConcepts();
  const today = dayKey();
  const { ids, due } = M.pickReview(concepts, today);
  if (!ids.length) return null;
  const next = M.nextDue(concepts);
  return (
    <Card style={{ marginTop: 14 }}>
      <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
        <span style={{ width: 40, height: 40, borderRadius: 10, background: "var(--brandSoft)", color: "var(--brand)", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
          <Icon name="refresh" size={20} />
        </span>
        <div style={{ flex: 1, minWidth: 0 }}>
          <div style={{ fontWeight: 650, fontSize: 16 }}>{t("review.title")}</div>
          <div style={{ fontSize: 13, color: "var(--mid)" }}>{due ? t("review.ready", { n: Math.min(due, M.REVIEW_SIZE) }) : t("review.caught_up", { date: next && next > today ? shortDate(next, locale) : "—" })}</div>
        </div>
        <Button size="md" kind={due ? "primary" : "secondary"} style={due ? undefined : { border: "1px solid var(--line)" }} onClick={() => go("lessons", { review: true })}>
          {due ? t("review.start") : t("review.anyway")}
        </Button>
      </div>
      {due > 0 && <p style={{ fontSize: 13, color: "var(--mid)", margin: "10px 0 0" }}>{t("review.sub")}</p>}
    </Card>
  );
}
export const reviewStatus = () => {
  const c = conceptsNow();
  return { due: M.pickReview(c, dayKey()).due, known: Object.keys(c).length };
};

// ---- after a review or a challenge ----------------------------------------

export function SessionDone({ t, locale, mode, result, answers, onDone }) {
  const x = tx(locale);
  const concepts = conceptsNow();
  const ids = [...new Set(answers.map((a) => a.c).filter(Boolean))];
  const right = answers.filter((a) => a.right).length;
  const facts = [t("lessons.xp", { n: result.gained }), t("lessons.streak", { n: result.streak }), ...(result.goalJustMet ? [t("lessons.goal_met")] : [])];
  return (
    <>
      <div style={{ flex: 1, display: "flex", flexDirection: "column", justifyContent: "center", gap: 18 }}>
        <div style={{ textAlign: "center" }}>
          <div style={{ width: 56, height: 56, borderRadius: 28, margin: "0 auto 14px", background: "var(--accentSoft)", color: "var(--accent)", display: "flex", alignItems: "center", justifyContent: "center" }}>
            <Icon name="check" size={28} stroke={2.4} />
          </div>
          <h1 style={{ fontSize: 26, fontWeight: 700, letterSpacing: -0.4, margin: 0 }}>{t(mode === "challenge" ? "challenge.done" : "review.done")}</h1>
          <p style={{ color: "var(--mid)", margin: "6px 0 0" }}>{t("challenge.score", { right, total: answers.length })}</p>
          <p style={{ fontSize: 14, color: "var(--mid)", margin: "10px 0 0" }}>{facts.join("  ·  ")}</p>
        </div>
        <Card pad="4px 18px">
          {ids.map((c, i) => {
            const level = M.levelOf(concepts[c]);
            return (
              <div key={c} style={{ display: "flex", alignItems: "center", gap: 12, padding: "12px 0", borderTop: i ? "1px solid var(--line)" : "none" }}>
                <span style={{ flex: 1, fontSize: 15 }}>{x(conceptById(c).name)}</span>
                <Meter level={level} />
                <span style={{ fontSize: 13, color: "var(--mid)", width: 84, textAlign: "right" }}>{t(`level.${level}`)}</span>
              </div>
            );
          })}
        </Card>
        {result.badges.length > 0 && (
          <div style={{ fontSize: 14, color: "var(--mid)", lineHeight: 1.6, textAlign: "center" }}>
            {result.badges.map((id) => (
              <div key={id}>{t("badge.earned", { name: t(`badge.${id}`) })}</div>
            ))}
          </div>
        )}
      </div>
      <Button full onClick={onDone}>
        {t("common.done")}
      </Button>
    </>
  );
}

// ---- Skills on the Me page -------------------------------------------------

export function SkillsCard({ t, locale }) {
  const x = tx(locale);
  const concepts = useConcepts();
  const [open, setOpen] = useState(false);
  const levelOf = (id) => M.levelOf(concepts[id]);
  const counts = Object.fromEntries(M.LEVELS.map((l) => [l, CONCEPTS.filter((c) => levelOf(c.id) === l).length]));
  return (
    <>
      <Label>{t("skills.title")}</Label>
      <Card>
        <p style={{ fontSize: 14, color: "var(--mid)", margin: "0 0 12px", lineHeight: 1.45 }}>{t("skills.sub")}</p>
        <div style={{ display: "flex", flexWrap: "wrap", gap: "6px 14px", marginBottom: 12 }}>
          {[...M.LEVELS].reverse().map((l) => (
            <span key={l} style={{ display: "inline-flex", alignItems: "center", gap: 6, fontSize: 13, color: "var(--mid)", fontVariantNumeric: "tabular-nums" }}>
              <Dot level={l} />
              {t(`level.${l}`)} <strong style={{ color: "var(--ink)", fontWeight: 650 }}>{counts[l]}</strong>
            </span>
          ))}
        </div>
        {UNITS.map((u, i) => (
          <div key={u.id} style={{ display: "flex", alignItems: "center", gap: 12, padding: "9px 0", borderTop: "1px solid var(--line)" }}>
            <span style={{ flex: 1, fontSize: 15, minWidth: 0 }}>
              <span style={{ color: "var(--low)", fontSize: 13, marginRight: 6, fontVariantNumeric: "tabular-nums" }}>{i + 1}</span>
              {x(u.title)}
            </span>
            <span style={{ display: "inline-flex", gap: 4 }} role="img" aria-label={conceptsOfUnit(u.id).map((c) => `${x(conceptById(c).name)}: ${t(`level.${levelOf(c)}`)}`).join(", ")}>
              {conceptsOfUnit(u.id).map((c) => (
                <Dot key={c} level={levelOf(c)} size={14} />
              ))}
            </span>
          </div>
        ))}
        <Button full size="md" kind="secondary" style={{ marginTop: 12, border: "1px solid var(--line)" }} onClick={() => setOpen(true)}>
          {t("skills.all")}
        </Button>
      </Card>
      <Sheet open={open} onClose={() => setOpen(false)} title={t("skills.title")} tall>
        {UNITS.map((u) => (
          <div key={u.id} style={{ marginBottom: 14 }}>
            <div style={{ fontSize: 13, fontWeight: 650, color: "var(--low)", marginBottom: 4 }}>{x(u.title)}</div>
            <Card pad="2px 16px">
              {conceptsOfUnit(u.id).map((c, i) => (
                <div key={c} style={{ display: "flex", alignItems: "center", gap: 12, padding: "11px 0", borderTop: i ? "1px solid var(--line)" : "none" }}>
                  <span style={{ flex: 1, fontSize: 15 }}>{x(conceptById(c).name)}</span>
                  <Meter level={levelOf(c)} />
                  <span style={{ fontSize: 13, color: "var(--mid)", width: 84, textAlign: "right" }}>{t(`level.${levelOf(c)}`)}</span>
                </div>
              ))}
            </Card>
          </div>
        ))}
      </Sheet>
    </>
  );
}

// ---- Placement (an onboarding step) ---------------------------------------

const PLACEMENT_UNITS = PLACEMENT.map((c) => conceptById(c).unit);
export function Placement({ t, locale, header, startUnit, onNext }) {
  const x = tx(locale);
  const [phase, setPhase] = useState("ask"); // ask | test | result
  const [results, setResults] = useState([]);
  const [picked, setPicked] = useState(null);
  const [checked, setChecked] = useState(null);
  const step = conceptById(PLACEMENT[results.length] || PLACEMENT[0]).challenge;
  const first = UNITS.find((u) => u.id === startUnit) || UNITS[0];
  const plan = service("goals", "startPlan")();
  const finish = (res) => {
    const units = M.placedUnits(PLACEMENT_UNITS, res);
    if (units.length) {
      update((s) => ({ ...s, progress: { ...s.progress, placed: units } }));
      saveConcepts((c) => M.placeConcepts(c, units.flatMap(conceptsOfUnit), dayKey()));
    }
    track("placement", { placed: units.length });
    setResults(res);
    setPhase("result");
  };
  const option = (key, label, sub, onClick) => (
    <button key={key} onClick={onClick} className="nv-press" style={{ display: "flex", alignItems: "center", gap: 14, width: "100%", textAlign: "left", border: "1px solid var(--line)", background: "var(--surface)", color: "var(--ink)", borderRadius: 14, padding: "14px 16px", marginBottom: 10, cursor: "pointer", minHeight: 64 }}>
      <span style={{ flex: 1 }}>
        <span style={{ display: "block", fontSize: 16, fontWeight: 650 }}>{label}</span>
        <span style={{ display: "block", fontSize: 14, color: "var(--mid)", marginTop: 2 }}>{sub}</span>
      </span>
      <Icon name="next" size={18} color="var(--low)" />
    </button>
  );

  if (phase === "ask")
    return (
      <>
        {header(t("place.title"), t("place.sub"))}
        {option("new", t("place.new"), t("place.new.sub", { unit: x(first.title), title: x(first.lessons[0].title) }), () => onNext({}))}
        {option("some", t("place.some"), t("place.some.sub"), () => setPhase("test"))}
        {plan && (
          <Card style={{ marginTop: 12 }}>
            <div style={{ fontWeight: 700, marginBottom: 4 }}>{t("place.why")}</div>
            <p style={{ margin: 0, fontSize: 15, lineHeight: 1.5 }}>{t("place.why.body", { name: plan.name, units: new Intl.ListFormat(locale.lang, { type: "conjunction" }).format(plan.units.map((u) => x(UNITS.find((v) => v.id === u).title))) })}</p>
          </Card>
        )}
      </>
    );
  if (phase === "result") {
    const units = M.placedUnits(PLACEMENT_UNITS, results);
    return (
      <>
        {header(units.length ? t("place.result", { n: units.length }) : t("place.result.none"), units.length ? t("place.result.sub") : t("place.result.none.sub"), () => (setResults([]), setPhase("ask")))}
        {units.length > 0 && (
          <Card pad="4px 18px" style={{ marginBottom: 16 }}>
            {units.map((u, i) => (
              <div key={u} style={{ display: "flex", alignItems: "center", gap: 10, padding: "12px 0", borderTop: i ? "1px solid var(--line)" : "none" }}>
                <Icon name="check" size={18} color="var(--accent)" stroke={2.4} />
                <span style={{ fontSize: 15 }}>{x(UNITS.find((v) => v.id === u).title)}</span>
              </div>
            ))}
          </Card>
        )}
        <Button full onClick={() => onNext({})}>
          {t("common.continue")}
        </Button>
      </>
    );
  }
  const check = () => setChecked(picked === step.answer ? "right" : "wrong");
  const next = () => {
    const res = [...results, checked === "right"];
    setPicked(null);
    setChecked(null);
    if (checked !== "right" || res.length === PLACEMENT.length) return finish(res);
    setResults(res);
  };
  return (
    <>
      {header(t("place.q", { n: results.length + 1, total: PLACEMENT.length }), t("place.q.sub"), () => (setResults([]), setPicked(null), setChecked(null), setPhase("ask")))}
      <div key={results.length} className="nv-in" style={{ flex: 1 }}>
        <QuestionView t={t} locale={locale} step={step} picked={picked} setPicked={setPicked} checked={checked} label={x(UNITS.find((u) => u.id === PLACEMENT_UNITS[results.length]).title)} />
      </div>
      <div style={{ paddingTop: 14 }}>
        {checked && <Feedback t={t} locale={locale} step={step} picked={picked} checked={checked} />}
        {checked ? (
          <Button full onClick={next}>
            {t("common.continue")}
          </Button>
        ) : (
          <Button full disabled={picked === null} onClick={check}>
            {t("common.check")}
          </Button>
        )}
      </div>
    </>
  );
}
