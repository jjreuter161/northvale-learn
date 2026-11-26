// THE PILOT, ON SCREEN — the teacher's Pilot quiz card, a student's quiz and the end-of-pilot questions
// (docs/PILOT-PLAN.md). Its own file, loaded only when a class page or a student's class needs it.
import { useState } from "react";
import { service } from "../../core/registry.js";
import { addStrings, text } from "../../core/i18n.js";
import { api } from "../../core/api.js";
import { Button, Card, Icon, Label, Note, Sheet, toast } from "../../core/ui.jsx";
import { MAX_PILOT_UNITS } from "./quiz.js";

const S = (en, es) => ({ en, es });
const units = () => service("lessons", "units")() || [];
const who = (m) => ({ classId: m.classId, memberId: m.memberId, key: m.key });
const errorText = (t, e) => (e.code === "OFFLINE" ? t("account.offline") : e.message);

addStrings({
  "cls.p.title": S("Pilot quiz", "Cuestionario del piloto"),
  "cls.p.sub": S("The same questions before and after (up to 10), from the units you pick. You see class totals only, once 3 or more students have taken it.", "Las mismas preguntas antes y después (hasta 10), de las unidades que elijas. Ves solo los totales de la clase, cuando 3 o más estudiantes lo hayan hecho."),
  "cls.p.count": S("{n} {n|question|questions}", "{n} {n|pregunta|preguntas}"),
  "cls.p.units": S("Units for the pilot (up to 4)", "Unidades del piloto (hasta 4)"),
  "cls.p.units.locked": S("The quiz has started, so its units stay as they are.", "El cuestionario ya empezó, así que sus unidades se quedan como están."),
  "cls.p.units.change": S("Change units", "Cambiar unidades"),
  "cls.p.units.ok": S("Done", "Listo"),
  "cls.p.open.pre": S("Open the before quiz", "Abrir el cuestionario de antes"),
  "cls.p.open.post": S("Open the after quiz", "Abrir el cuestionario de después"),
  "cls.p.close": S("Close the quiz", "Cerrar el cuestionario"),
  "cls.p.is.pre": S("The before quiz is open.", "El cuestionario de antes está abierto."),
  "cls.p.is.post": S("The after quiz is open.", "El cuestionario de después está abierto."),
  "cls.p.before": S("Before", "Antes"),
  "cls.p.after": S("After", "Después"),
  "cls.p.taken": S("{n} {n|student|students} took it", "{n} {n|estudiante lo hizo|estudiantes lo hicieron}"),
  "cls.p.avg": S("{pct}% right on average", "{pct}% de aciertos en promedio"),
  "cls.p.wait": S("Shows once 3 or more students have taken it.", "Aparece cuando 3 o más estudiantes lo hayan hecho."),
  "cls.p.change": S("Change: {sign}{n} points", "Cambio: {sign}{n} puntos"),
  "cls.p.byq": S("By question (% right before → after)", "Por pregunta (% de aciertos antes → después)"),
  "cls.p.fb": S("What students said", "Lo que dijeron los estudiantes"),
  "cls.p.fb.wait": S("Shows once 3 or more students have answered.", "Aparece cuando 3 o más estudiantes hayan respondido."),
  "cls.p.fb.enjoyed": S("Enjoyed it", "Les gustó"),
  "cls.p.fb.learned": S("Learned something", "Aprendieron algo"),
  "cls.p.fb.again": S("Would keep using it", "Lo seguirían usando"),
  "cls.p.fb.row": S("{yes} yes · {mid} {midWord} · {no} no", "{yes} sí · {mid} {midWord} · {no} no"),
  "cls.p.fb.some": S("somewhat", "más o menos"),
  "cls.p.fb.maybe": S("maybe", "tal vez"),
  // Students
  "cls.q.n": S("Question {i} of {n}", "Pregunta {i} de {n}"),
  "cls.q.next": S("Next", "Siguiente"),
  "cls.q.finish": S("Finish", "Terminar"),
  "cls.q.score": S("You got {score} of {of} right.", "Acertaste {score} de {of}."),
  "cls.q.done": S("Done", "Listo"),
  "cls.f.enjoyed": S("Did you enjoy using Northvale?", "¿Te gustó usar Northvale?"),
  "cls.f.learned": S("Did you learn something about money?", "¿Aprendiste algo sobre el dinero?"),
  "cls.f.again": S("Would you keep using it?", "¿Lo seguirías usando?"),
  "cls.f.yes": S("Yes", "Sí"),
  "cls.f.some": S("Somewhat", "Más o menos"),
  "cls.f.maybe": S("Maybe", "Tal vez"),
  "cls.f.no": S("No", "No"),
  "cls.f.comment": S("What was confusing? (optional)", "¿Qué fue confuso? (opcional)"),
  "cls.f.comment.note": S("Only the Northvale team reads this, not your teacher. Leave out names and personal details.", "Solo lo lee el equipo de Northvale, no tu profe. No pongas nombres ni datos personales."),
  "cls.f.send": S("Send", "Enviar"),
  "cls.f.thanks": S("Thank you. Your answers help make Northvale better.", "Gracias. Tus respuestas ayudan a mejorar Northvale."),
});

// The teacher's card: which units, which quiz is open, and the class totals.
export function PilotCard({ t, locale, v, patch }) {
  const p = v.pilot;
  // All 18 units only while picking; afterwards just the chosen ones (and once a quiz is taken, they're locked).
  const [picking, setPicking] = useState(!p.units.length);
  const all = units().filter((u) => (picking && !p.started) || p.units.includes(u.id));
  const title = (u) => text(u.title, locale);
  const toggle = (id) => patch({ pilotUnits: p.units.includes(id) ? p.units.filter((x) => x !== id) : [...p.units, id].slice(0, MAX_PILOT_UNITS) });
  const totals = (label, r) => (
    <div style={{ padding: "8px 0", borderTop: "1px solid var(--line)" }}>
      <div style={{ fontWeight: 650 }}>{label}</div>
      <div style={{ fontSize: 14, color: "var(--mid)" }}>
        {t("cls.p.taken", { n: r.taken })}
        {r.average !== undefined ? ` · ${t("cls.p.avg", { pct: r.average })}` : ` · ${t("cls.p.wait")}`}
      </div>
    </div>
  );
  const change = p.pre.average !== undefined && p.post.average !== undefined ? p.post.average - p.pre.average : null;
  const fb = p.feedback;
  const fbRow = (k, mid) => t("cls.p.fb.row", { yes: fb[k].yes, mid: fb[k][mid], midWord: t(`cls.p.fb.${mid}`), no: fb[k].no });
  return (
    <div data-pilot="">
      <Label>{t("cls.p.title")}</Label>
      <Card>
        <p style={{ fontSize: 14, color: "var(--mid)", lineHeight: 1.45, margin: "0 0 12px" }}>{t("cls.p.sub")}</p>
        <div role="group" aria-label={t("cls.p.units")}>
          <div style={{ fontSize: 14, fontWeight: 650, color: "var(--mid)", marginBottom: 6 }}>{t("cls.p.units")}</div>
          <div style={{ display: "flex", flexWrap: "wrap", gap: 6 }}>
            {all.map((u) => {
              const on = p.units.includes(u.id);
              const off = p.started || (!on && p.units.length >= MAX_PILOT_UNITS);
              return (
                <button key={u.id} type="button" aria-pressed={on} disabled={off} onClick={() => toggle(u.id)} className="nv-press" style={{ minHeight: 44, padding: "6px 12px", borderRadius: 8, fontSize: 14, fontWeight: 650, cursor: off ? "default" : "pointer", color: "var(--ink)", opacity: off && !on ? 0.5 : 1, background: on ? "var(--surface2)" : "var(--surface)", border: on ? "2px solid var(--ink)" : "1px solid var(--line)" }}>
                  {on && <Icon name="check" size={14} />} {title(u)}
                </button>
              );
            })}
          </div>
          {!p.started && !!p.units.length && (
            <Button size="sm" kind="ghost" style={{ paddingLeft: 0, marginTop: 4 }} onClick={() => setPicking(!picking)}>
              {picking ? t("cls.p.units.ok") : t("cls.p.units.change")}
            </Button>
          )}
          {!!p.units.length && <p style={{ fontSize: 13, color: "var(--mid)", margin: "4px 0 0" }}>{t("cls.p.count", { n: p.questions.length })}</p>}
          {p.started && <p style={{ fontSize: 13, color: "var(--low)", margin: "8px 0 0" }}>{t("cls.p.units.locked")}</p>}
        </div>
        <div style={{ display: "flex", flexWrap: "wrap", gap: 8, alignItems: "center", margin: "14px 0 6px" }}>
          {p.phase ? (
            <>
              <span style={{ fontWeight: 650, flex: "1 1 200px" }}>{t(`cls.p.is.${p.phase}`)}</span>
              <Button size="md" kind="secondary" onClick={() => patch({ quiz: null })}>
                {t("cls.p.close")}
              </Button>
            </>
          ) : (
            <>
              <Button size="md" disabled={!p.units.length} onClick={() => patch({ quiz: "pre" })}>
                {t("cls.p.open.pre")}
              </Button>
              <Button size="md" kind="secondary" disabled={!p.units.length} onClick={() => patch({ quiz: "post" })}>
                {t("cls.p.open.post")}
              </Button>
            </>
          )}
        </div>
        {totals(t("cls.p.before"), p.pre)}
        {totals(t("cls.p.after"), p.post)}
        {change !== null && <div style={{ fontWeight: 700, padding: "6px 0" }}>{t("cls.p.change", { sign: change > 0 ? "+" : change < 0 ? "−" : "", n: Math.abs(change) })}</div>}
        {(p.pre.perQuestion || p.post.perQuestion) && (
          <details style={{ marginTop: 6 }}>
            <summary style={{ cursor: "pointer", fontWeight: 650, minHeight: 44, display: "flex", alignItems: "center", gap: 6 }}>
              <Icon name="next" size={16} /> {t("cls.p.byq")}
            </summary>
            <ol style={{ margin: "4px 0 0", paddingLeft: 22, fontSize: 14, lineHeight: 1.45 }}>
              {p.questions.map((q, i) => (
                <li key={q.id} style={{ margin: "6px 0" }}>
                  {text(q.q, locale)}{" "}
                  <strong style={{ whiteSpace: "nowrap" }}>
                    {p.pre.perQuestion ? `${p.pre.perQuestion[i]}%` : "–"} → {p.post.perQuestion ? `${p.post.perQuestion[i]}%` : "–"}
                  </strong>
                </li>
              ))}
            </ol>
          </details>
        )}
        <div style={{ paddingTop: 8, borderTop: "1px solid var(--line)", marginTop: 6 }}>
          <div style={{ fontWeight: 650 }}>{t("cls.p.fb")}</div>
          {fb.enjoyed ? (
            <div style={{ fontSize: 14, color: "var(--mid)", lineHeight: 1.6 }}>
              <div>{t("cls.p.fb.enjoyed")}: {fbRow("enjoyed", "some")}</div>
              <div>{t("cls.p.fb.learned")}: {fbRow("learned", "some")}</div>
              <div>{t("cls.p.fb.again")}: {fbRow("again", "maybe")}</div>
            </div>
          ) : (
            <div style={{ fontSize: 14, color: "var(--mid)" }}>{t("cls.p.fb.wait")}</div>
          )}
        </div>
      </Card>
    </div>
  );
}

// A student's quiz: one question at a time, no right-or-wrong until the end, then their own score.
export function QuizSheet({ t, locale, m, quiz, onClose, onDone }) {
  const [i, setI] = useState(0);
  const [answers, setAnswers] = useState([]);
  const [result, setResult] = useState(null);
  const [error, setError] = useState(null);
  const [busy, setBusy] = useState(false);
  const qs = quiz.questions;
  const q = qs[i];
  const options = q && (q.tf ? [t("lessons.true"), t("lessons.false")] : q.options.map((o) => text(o, locale)));
  const pick = answers[i];
  const next = async () => {
    if (i < qs.length - 1) return setI(i + 1);
    setBusy(true);
    try {
      setResult(await api("/api/class/quiz", { method: "POST", body: { ...who(m), phase: quiz.phase, answers } }));
    } catch (e) {
      setError(errorText(t, e));
    } finally {
      setBusy(false);
    }
  };
  return (
    <Sheet open onClose={result ? onDone : onClose} title={t("cls.p.title")} tall>
      {result ? (
        <div data-quiz-done="">
          <p style={{ fontSize: 22, fontWeight: 750, margin: "0 0 8px" }}>{t("cls.q.score", { score: result.score, of: result.of })}</p>
          <p style={{ fontSize: 15, color: "var(--mid)", lineHeight: 1.45, margin: "0 0 16px" }}>{t("cls.q.card.sub")}</p>
          <Button full onClick={onDone}>
            {t("cls.q.done")}
          </Button>
        </div>
      ) : (
        <div>
          <div style={{ fontSize: 14, color: "var(--mid)", fontWeight: 650 }}>{t("cls.q.n", { i: i + 1, n: qs.length })}</div>
          <h3 style={{ fontSize: 20, lineHeight: 1.3, margin: "6px 0 14px" }}>{text(q.q, locale)}</h3>
          <div role="radiogroup" aria-label={text(q.q, locale)} style={{ display: "flex", flexDirection: "column", gap: 8 }}>
            {options.map((o, k) => (
              <button key={k} type="button" role="radio" aria-checked={pick === k} onClick={() => setAnswers((a) => Object.assign([...a], { [i]: k }))} className="nv-press" style={{ textAlign: "left", minHeight: 52, padding: "12px 14px", borderRadius: 10, fontSize: 16, fontWeight: 600, color: "var(--ink)", cursor: "pointer", background: "var(--surface)", border: pick === k ? "2px solid var(--ink)" : "1px solid var(--line)" }}>
                {o}
              </button>
            ))}
          </div>
          {error && <Note tone="bad" style={{ marginTop: 12 }}>{error}</Note>}
          <Button full style={{ marginTop: 16 }} disabled={pick === undefined || busy} onClick={next}>
            {i < qs.length - 1 ? t("cls.q.next") : t("cls.q.finish")}
          </Button>
        </div>
      )}
    </Sheet>
  );
}

// The end-of-pilot questions: three taps (the teacher sees totals) and an optional comment (the owner only).
export function FeedbackSheet({ t, m, onClose, onDone }) {
  const [a, setA] = useState({});
  const [comment, setComment] = useState("");
  const [error, setError] = useState(null);
  const [busy, setBusy] = useState(false);
  const ask = (k, opts) => (
    <div role="radiogroup" aria-label={t(`cls.f.${k}`)} style={{ marginBottom: 14 }}>
      <div style={{ fontWeight: 650, marginBottom: 6 }}>{t(`cls.f.${k}`)}</div>
      <div style={{ display: "flex", gap: 6 }}>
        {opts.map((o) => (
          <button key={o} type="button" role="radio" aria-checked={a[k] === o} onClick={() => setA((x) => ({ ...x, [k]: o }))} style={{ flex: 1, minHeight: 44, borderRadius: 8, fontSize: 15, fontWeight: 650, cursor: "pointer", color: "var(--ink)", background: a[k] === o ? "var(--surface2)" : "var(--surface)", border: a[k] === o ? "2px solid var(--ink)" : "1px solid var(--line)" }}>
            {t(`cls.f.${o}`)}
          </button>
        ))}
      </div>
    </div>
  );
  const send = async () => {
    setBusy(true);
    try {
      await api("/api/class/feedback", { method: "POST", body: { ...who(m), ...a, comment } });
      toast(t("cls.f.thanks"), "good");
      onDone();
    } catch (e) {
      setError(errorText(t, e));
      setBusy(false);
    }
  };
  return (
    <Sheet open onClose={onClose} title={t("cls.f.card")} tall>
      {ask("enjoyed", ["yes", "some", "no"])}
      {ask("learned", ["yes", "some", "no"])}
      {ask("again", ["yes", "maybe", "no"])}
      <label style={{ display: "block", marginBottom: 6 }}>
        <span style={{ display: "block", fontWeight: 650, marginBottom: 6 }}>{t("cls.f.comment")}</span>
        <textarea value={comment} onChange={(e) => setComment(e.target.value.slice(0, 500))} rows={3} maxLength={500} style={{ width: "100%", border: "1px solid var(--line)", borderRadius: 8, background: "var(--bg)", color: "var(--ink)", padding: "10px 12px", fontSize: 16, fontFamily: "inherit" }} />
      </label>
      <p style={{ fontSize: 13, color: "var(--low)", lineHeight: 1.45, margin: "0 0 14px" }}>{t("cls.f.comment.note")}</p>
      {error && <Note tone="bad" style={{ marginBottom: 12 }}>{error}</Note>}
      <Button full disabled={busy || !a.enjoyed || !a.learned || !a.again} onClick={send}>
        {t("cls.f.send")}
      </Button>
    </Sheet>
  );
}

