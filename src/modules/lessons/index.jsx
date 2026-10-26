// LESSONS — the path and the player (lessons, reviews, challenges). Owns
// the content and each learner's mastery of its concepts; reports finished
// sessions to the core (XP, streak, badges); the "do it" step at the end
// of each lesson is a widget from whichever module owns it (portfolio,
// goals, news), found through the registry.
import { useEffect, useMemo, useRef, useState } from "react";
import { registerModule, actionWidget, service } from "../../core/registry.js";
import { useAppState, getState } from "../../core/store.js";
import { recordLesson, recordReview } from "../../core/game.js";
import { track } from "../../core/analytics.js";
import { text, addStrings } from "../../core/i18n.js";
import { xpOn, dayKey, addDays } from "../../core/progress.js";
import { Button, Card, Icon, Layer, Progress, Ring, Sheet, toast } from "../../core/ui.jsx";
import { UNITS, ALL_LESSONS, lessonById, lessonState, nextLesson, nextFor, unitDone, isQuestion, conceptPool, conceptsOfLesson, conceptsOfUnit, minutes } from "./content.js";
import { conceptById } from "./concepts.js";
import * as M from "./mastery.js";
import { QuestionView, Feedback, ReviewCard, SessionDone, SkillsCard, Placement, conceptsNow, saveConcepts, reviewStatus } from "./practice.jsx";

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
  "lessons.explain": S("Explain more", "Explícame más"),
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
});

const useLocaleText = (locale) => (x, vars) => text(x, locale, vars);

function Path({ t, locale, go }) {
  const progress = useAppState((s) => s.progress);
  const tx = useLocaleText(locale);
  const next = nextLesson(progress);
  const today = dayKey();
  const nextUnit = next ? UNITS.find((u) => u.id === next.unit) : null;
  const doneCount = ALL_LESSONS.filter((l) => lessonState(progress, l.id) === "done").length;
  return (
    <div>
      <Card pad={20} style={{ background: "var(--brand)", border: "none", color: "var(--onBrand)" }}>
        {next ? (
          <>
            <div style={{ display: "flex", justifyContent: "space-between", fontSize: 13, fontWeight: 600, opacity: 0.8 }}>
              <span>
                {t("lessons.unit_n", { n: UNITS.indexOf(nextUnit) + 1 })} · {tx(nextUnit.title)}
              </span>
              <span>{t("lessons.minutes", { n: Math.round(minutes(next)) })}</span>
            </div>
            <div style={{ fontSize: 24, fontWeight: 700, letterSpacing: -0.4, lineHeight: 1.2, margin: "8px 0 18px" }}>{tx(next.title)}</div>
            <Button full onClick={() => go("lessons", { lesson: next.id })} style={{ background: "var(--onBrand)", color: "var(--brand)" }}>
              {doneCount ? t("lessons.continue") : t("lessons.start")}
            </Button>
          </>
        ) : (
          <div style={{ fontSize: 17, fontWeight: 600, lineHeight: 1.45 }}>{t("lessons.all_done")}</div>
        )}
      </Card>
      <div style={{ display: "flex", alignItems: "center", gap: 12, margin: "14px 2px 0" }}>
        <Progress value={doneCount} max={ALL_LESSONS.length} color="var(--good)" height={6} label={t("lessons.overall")} />
        <span style={{ fontSize: 13, fontWeight: 600, color: "var(--mid)", whiteSpace: "nowrap" }}>{t("lessons.overall_n", { done: doneCount, total: ALL_LESSONS.length })}</span>
      </div>
      <p style={{ display: "flex", alignItems: "center", gap: 8, margin: "10px 2px 0", fontSize: 14, color: "var(--mid)" }}>
        <Icon name="flame" size={16} color={progress.streak.last === today ? "var(--flame)" : "var(--low)"} />
        {progress.streak.last === today ? t("lessons.streak_today") : progress.streak.count ? t("lessons.streak_keep", { n: progress.streak.count }) : t("lessons.streak_start")}
      </p>
      <ReviewCard t={t} locale={locale} go={go} />

      {UNITS.map((u, ui) => {
        const done = u.lessons.filter((l) => lessonState(progress, l.id) === "done").length;
        const complete = done === u.lessons.length;
        return (
          <section key={u.id} style={{ marginTop: 28 }} aria-label={tx(u.title)}>
            <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 10 }}>
              <span style={{ width: 40, height: 40, borderRadius: 10, background: "var(--brandSoft)", color: "var(--brand)", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
                <Icon name={u.icon} size={20} />
              </span>
              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{ fontSize: 12, fontWeight: 600, color: "var(--low)" }}>{t("lessons.unit_n", { n: ui + 1 })}</div>
                <div style={{ fontSize: 18, fontWeight: 700, letterSpacing: -0.2 }}>{tx(u.title)}</div>
              </div>
              <span style={{ fontSize: 13, fontWeight: 600, color: complete ? "var(--good)" : "var(--low)" }}>
                {complete ? <Icon name="check" size={18} stroke={2.5} /> : `${done}/${u.lessons.length}`}
              </span>
            </div>
            <Card pad={0}>
              {u.lessons.map((l, i) => {
                const st = lessonState(progress, l.id);
                const challenge = M.offersChallenge(progress.lessons[l.id]);
                return (
                  <div key={l.id} style={{ display: "flex", alignItems: "center", borderTop: i ? "1px solid var(--line)" : "none" }}>
                  <button
                    onClick={() => (st === "locked" ? toast(t("lessons.locked")) : go("lessons", { lesson: l.id }))}
                    aria-label={`${tx(l.title)} — ${st === "done" ? t("lessons.review") : st === "open" ? t("lessons.start") : t("lessons.locked")}`}
                    className="nv-press"
                    style={{ display: "flex", alignItems: "center", gap: 14, flex: 1, minWidth: 0, textAlign: "left", border: "none", background: "transparent", color: "var(--ink)", padding: "14px 16px", cursor: "pointer", minHeight: 60 }}
                  >
                    <span style={{ width: 30, height: 30, borderRadius: 15, flexShrink: 0, display: "flex", alignItems: "center", justifyContent: "center", background: st === "done" ? "var(--accent)" : "transparent", border: st === "done" ? "none" : `1.5px solid ${st === "open" ? "var(--brand)" : "var(--line)"}`, color: st === "done" ? "var(--onBrand)" : st === "open" ? "var(--brand)" : "var(--low)" }}>
                      {st === "done" ? <Icon name="check" size={16} stroke={2.6} /> : st === "open" ? <Icon name="play" size={12} fill="currentColor" stroke={0} /> : <Icon name="lock" size={13} />}
                    </span>
                    <span style={{ flex: 1, minWidth: 0 }}>
                      <span style={{ display: "block", fontSize: 15, fontWeight: st === "open" ? 650 : 500, color: st === "locked" ? "var(--low)" : "var(--ink)" }}>{tx(l.title)}</span>
                      <span style={{ display: "block", fontSize: 13, color: "var(--low)", marginTop: 2 }}>{st === "done" ? t("lessons.done_review") : t("lessons.minutes", { n: Math.round(minutes(l)) })}</span>
                    </span>
                    {st !== "locked" && !challenge && <Icon name="next" size={18} color="var(--low)" />}
                  </button>
                  {challenge && (
                    <button onClick={() => go("lessons", { challenge: l.id })} className="nv-press" style={{ border: "1px solid var(--line)", background: "var(--surface)", color: "var(--brand)", borderRadius: 999, padding: "6px 12px", marginRight: 14, fontSize: 13, fontWeight: 650, cursor: "pointer", minHeight: 36, flexShrink: 0 }}>
                      {t("challenge.chip")}
                    </button>
                  )}
                  </div>
                );
              })}
            </Card>
          </section>
        );
      })}
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
      <Overlay>
        <SessionDone t={t} locale={locale} mode={mode} result={result} answers={firsts.current} onDone={onExit} />
      </Overlay>
    );
  if (result) {
    const progress = getState().progress;
    const nl = nextFor(progress, service("goals", "recommendedUnits")() || []);
    const link = service("goals", "lessonLink")(lesson.unit);
    const TryCard = service("missions", "TryCard");
    const facts = [
      t("lessons.xp", { n: result.gained }),
      t("lessons.streak", { n: result.streak }),
      ...(result.goalJustMet ? [t("lessons.goal_met")] : []),
      ...(mistakes === 0 ? [t("lessons.perfect")] : []),
    ];
    return (
      <Overlay>
        <div style={{ flex: 1, display: "flex", flexDirection: "column", justifyContent: "center", gap: 18, paddingBottom: 18 }}>
          <div style={{ textAlign: "center" }}>
            <div style={{ width: 56, height: 56, borderRadius: 28, margin: "0 auto 14px", background: "var(--accentSoft)", color: "var(--accent)", display: "flex", alignItems: "center", justifyContent: "center" }}>
              <Icon name="check" size={28} stroke={2.4} />
            </div>
            <h1 style={{ fontSize: 26, fontWeight: 700, letterSpacing: -0.4, margin: 0 }}>{t("lessons.complete")}</h1>
            <p style={{ color: "var(--mid)", margin: "6px 0 0" }}>{tx(lesson.title)}</p>
            <p style={{ fontSize: 14, color: "var(--mid)", margin: "10px 0 0" }}>{facts.join("  ·  ")}</p>
          </div>
          {link && (
            <Card>
              <div style={{ fontSize: 12, fontWeight: 650, color: "var(--low)", letterSpacing: 0.4, textTransform: "uppercase" }}>{t("lessons.for_goal")}</div>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "baseline", gap: 10, margin: "6px 0 8px" }}>
                <span style={{ fontWeight: 650, fontSize: 17 }}>{link.name}</span>
                <span style={{ fontSize: 14, color: "var(--mid)" }}>{link.amounts}</span>
              </div>
              <Progress value={link.pct} max={100} color="var(--accent)" height={6} label={link.name} />
              <p style={{ fontSize: 15, lineHeight: 1.5, margin: "12px 0 0" }}>{link.sentence}</p>
            </Card>
          )}
          <TryCard t={t} locale={locale} go={go} unit={lesson.unit} />
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
          {mistakes === 0 && (
            <Button full kind="secondary" style={{ border: "1px solid var(--line)" }} onClick={() => go("lessons", { challenge: lesson.id })}>
              {t("challenge.offer")}
            </Button>
          )}
          <Button full kind={nl ? "secondary" : "primary"} onClick={() => go(service("goals", "recommendedUnits")() ? "goals" : "lessons")}>
            {t("common.done")}
          </Button>
        </div>
      </Overlay>
    );
  }

  const Widget = step.type === "action" ? actionWidget(step.kind) : null;
  const canCheck = (step.type === "choice" || step.type === "tf") && picked !== null && !checked;

  return (
    <Overlay>
      <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 20 }}>
        <button onClick={() => setQuit(true)} aria-label={t("common.close")} style={{ border: "none", background: "transparent", color: "var(--low)", width: 44, height: 44, display: "flex", alignItems: "center", justifyContent: "center", cursor: "pointer" }}>
          <Icon name="close" />
        </button>
        <Progress value={at} max={total} color="var(--accent)" height={6} label={run.title} />
        <button onClick={() => service("feedback", "open")({ kind: "content", context: `${mode === "lesson" ? lesson.id : `${mode} ${step.c || ""}`} · step ${at + 1} · ${tx(step.title || step.q || step.prompt || "")}`.slice(0, 280) })} aria-label={t("lessons.report")} title={t("lessons.report")} style={{ border: "none", background: "transparent", color: "var(--low)", width: 44, height: 44, display: "flex", alignItems: "center", justifyContent: "center", cursor: "pointer", flexShrink: 0 }}>
          <Icon name="flag" size={20} />
        </button>
      </div>

      <div key={step.key} className="nv-in" style={{ flex: 1, overflowY: "auto" }}>
        {step.type === "card" && (
          <div>
            <h2 style={{ fontSize: 26, fontWeight: 750, margin: "0 0 12px", lineHeight: 1.2 }}>{tx(step.title)}</h2>
            <p style={{ fontSize: 19, lineHeight: 1.55, margin: 0 }}>{tx(step.body)}</p>
            {service("tutor", "canExplain")(`${tx(step.title)} ${tx(step.body)}`) && <button onClick={() => service("tutor", "explain")({ question: tx(step.title), context: tx(step.body) })} style={{ marginTop: 18, border: "none", background: "var(--brandSoft)", color: "var(--ink)", borderRadius: 999, padding: "10px 16px", fontWeight: 650, fontSize: 15, cursor: "pointer", display: "inline-flex", alignItems: "center", gap: 8, minHeight: 44 }}>
              <Icon name="sparkles" size={18} /> {t("lessons.explain")}
            </button>}
          </div>
        )}
        {isQuestion(step) && <QuestionView t={t} locale={locale} step={step} picked={picked} setPicked={setPicked} checked={checked} label={mode === "challenge" ? t("challenge.chip") : mode === "review" ? t("review.title") : null} />}
        {step.type === "action" && (
          <div>
            <div style={{ display: "inline-flex", alignItems: "center", gap: 6, fontSize: 13, fontWeight: 750, letterSpacing: 0.6, color: "var(--onBrand)", background: "var(--brand)", borderRadius: 999, padding: "6px 12px", textTransform: "uppercase", marginBottom: 12 }}>
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
              {actionDone ? `${t("lessons.done_it")} ${t("common.continue")}` : Widget ? t("lessons.do_it") : t("common.continue")}
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
function Overlay({ children }) {
  useEffect(() => {
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = prev;
    };
  }, []);
  return (
    <Layer>
      <div style={{ position: "fixed", inset: 0, zIndex: 40, background: "var(--bg)", color: "var(--ink)", overflowY: "auto" }}>
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
  return l && lessonState(progress, id) !== "locked" ? { mode: "lesson", lesson: l, title: text(l.title, locale), steps: l.steps } : null;
}

function Screen(ctx) {
  const p = ctx.route.params;
  const key = p.review ? "review" : p.challenge ? `challenge:${p.challenge}` : p.lesson || p.startUnit || null;
  const session = useMemo(() => (key ? sessionFor(p, ctx.t, ctx.locale) : null), [key]);
  return (
    <>
      <Path {...ctx} />
      {session && <Player key={key} {...ctx} run={session} onExit={() => ctx.go("lessons")} />}
    </>
  );
}

registerModule({
  id: "lessons",
  nav: { icon: "book", label: "lessons.nav", order: 1 },
  Screen,
  Onboard: Placement,
  MeCard: SkillsCard,
  facts: (state) => {
    const done = UNITS.filter((u) => unitDone(state.progress, u)).length;
    return { unitsDone: done, pathDone: done === UNITS.length };
  },
  services: {
    // How many concepts are due for review (Home shows it).
    reviewStatus,
    // For Money Missions: units with a finished lesson (or tested out of),
    // and units studied in the last week.
    unitActivity: () => {
      const p = getState().progress;
      const weekAgo = addDays(dayKey(), -7);
      const done = Object.entries(p.lessons).filter(([id, l]) => l.done && lessonById(id));
      const unitsOf = (list) => [...new Set(list.map(([id]) => lessonById(id).unit))];
      return { started: [...new Set([...unitsOf(done), ...(p.placed || [])])], recent: unitsOf(done.filter(([, l]) => (l.last || l.at) >= weekAgo)) };
    },
    // The next open lesson for these units (in order), else what's next
    // on the path; null when everything's done.
    nextFor: (units) => {
      const l = nextFor(getState().progress, units);
      return l && { ...l, unitTitle: UNITS.find((u) => u.id === l.unit).title };
    },
  },
});

export { ALL_LESSONS };
