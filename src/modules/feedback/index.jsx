// FEEDBACK — "Send feedback" from any screen (and "Report this step" in a
// lesson), plus one question after the 3rd lesson: how disappointed would
// you be without Northvale? Sent with the random install ID only; if the
// server can't be reached, it waits on the device and goes next time.
import { useEffect, useState } from "react";
import { registerModule } from "../../core/registry.js";
import { useSlice, setSlice, getState, useAppState } from "../../core/store.js";
import { addStrings } from "../../core/i18n.js";
import { api } from "../../core/api.js";
import { installId, track } from "../../core/analytics.js";
import { SELECTED, Button, Chip, Note, Sheet, toast } from "../../core/ui.jsx";

const S = (en, es) => ({ en, es });
addStrings({
  "fb.title": S("Send feedback", "Enviar comentarios"),
  "fb.sub": S("What's working, what's confusing, what's wrong? We read everything.", "¿Qué te gusta, qué confunde, qué está mal? Leemos todo."),
  "fb.kind.idea": S("Idea", "Idea"),
  "fb.kind.problem": S("Something broke", "Algo falló"),
  "fb.kind.content": S("Wrong or confusing", "Incorrecto o confuso"),
  "fb.kind.other": S("Other", "Otro"),
  "fb.placeholder": S("Tell us in a sentence or two…", "Cuéntanos en una o dos frases…"),
  "fb.private": S("Don't include your name, email or anything private.", "No incluyas tu nombre, correo ni nada privado."),
  "fb.send": S("Send", "Enviar"),
  "fb.thanks": S("Got it, thank you. We read every one.", "Recibido, gracias. Leemos todos."),
  "fb.queued": S("Saved. It'll send when you're back online.", "Guardado. Se enviará cuando vuelvas a tener conexión."),
  "fb.about": S("About: {what}", "Sobre: {what}"),
  "survey.title": S("Quick question", "Una pregunta rápida"),
  "survey.q": S("How would you feel if you could no longer use Northvale?", "¿Cómo te sentirías si ya no pudieras usar Northvale?"),
  "survey.very": S("Very disappointed", "Muy decepcionado"),
  "survey.somewhat": S("Somewhat disappointed", "Algo decepcionado"),
  "survey.not": S("Not disappointed", "Nada decepcionado"),
  "survey.why": S("What's the main reason? (optional)", "¿Cuál es la razón principal? (opcional)"),
  "survey.send": S("Send", "Enviar"),
  "survey.skip": S("Not now", "Ahora no"),
  "survey.thanks": S("Thank you. This genuinely shapes what we build next.", "Gracias. Esto de verdad define lo que hacemos después."),
});

const DEFAULTS = { pending: [], survey: null };
let openFeedback = null;

async function sendOrKeep(path, body) {
  try {
    await api(path, { method: "POST", body });
    return true;
  } catch (e) {
    if (e.code === "OFFLINE" || e.status === 0 || e.status >= 500) {
      setSlice("feedback", (s) => ({ ...s, pending: [...s.pending, { path, body }].slice(-20) }), DEFAULTS);
      return false;
    }
    throw e;
  }
}

function Overlay({ t, locale, route }) {
  const slice = useSlice("feedback", DEFAULTS);
  const [open, setOpen] = useState(null); // { context }
  const [kind, setKind] = useState("idea");
  const [msg, setMsg] = useState("");
  const [survey, setSurvey] = useState(false);
  const [answer, setAnswer] = useState(null);
  const [why, setWhy] = useState("");
  openFeedback = (x = {}) => {
    setKind(x.kind || "idea");
    setOpen({ context: x.context || "" });
  };

  // Anything that couldn't be sent earlier goes now.
  useEffect(() => {
    const pending = getState().modules.feedback && getState().modules.feedback.pending;
    if (!pending || !pending.length) return;
    setSlice("feedback", (s) => ({ ...s, pending: [] }), DEFAULTS);
    pending.forEach((p) => sendOrKeep(p.path, p.body).catch(() => {}));
  }, []);
  // The survey, once, after the 3rd finished lesson. It's due from what's
  // saved (not a one-off timer), so it can't be lost: it waits until no
  // lesson or other window is open, and if the app closes first, it shows
  // the next time the app opens.
  const due = useAppState((s) => (s.progress.counters.lessons || 0) >= 3 && !(s.modules.feedback || {}).survey);
  useEffect(() => {
    if (!due || survey) return;
    const id = setInterval(() => {
      if (document.querySelector('[role="dialog"]')) return;
      clearInterval(id);
      setSurvey(true);
    }, 1500);
    return () => clearInterval(id);
  }, [due, survey]);

  const sendFeedback = async () => {
    const body = { installId: installId(), kind, text: msg.trim(), context: open.context, screen: route.id, lang: locale.lang, region: locale.region };
    try {
      const sent = await sendOrKeep("/api/feedback", body);
      toast(t(sent ? "fb.thanks" : "fb.queued"), "good");
      setMsg("");
      setOpen(null);
    } catch (e) {
      toast(e.message, "bad");
    }
  };
  const sendSurvey = async (skip) => {
    setSlice("feedback", (s) => ({ ...s, survey: skip ? "skipped" : answer }), DEFAULTS);
    setSurvey(false);
    if (skip) return;
    track("survey", { answer });
    await sendOrKeep("/api/survey", { installId: installId(), answer, why: why.trim(), lessons: getState().progress.counters.lessons || 0 }).catch(() => {});
    toast(t("survey.thanks"), "good");
  };

  return (
    <>
      <Sheet open={!!open} onClose={() => setOpen(null)} title={t("fb.title")}>
        {open && (
          <div>
            <p style={{ margin: "0 0 12px", color: "var(--mid)", lineHeight: 1.45 }}>{t("fb.sub")}</p>
            {open.context && <Note icon="info" style={{ marginBottom: 12 }}>{t("fb.about", { what: open.context })}</Note>}
            <div style={{ display: "flex", flexWrap: "wrap", gap: 8, marginBottom: 12 }}>
              {["idea", "problem", "content", "other"].map((k) => (
                <Chip key={k} active={kind === k} onClick={() => setKind(k)} style={{ fontSize: 14 }}>
                  {t(`fb.kind.${k}`)}
                </Chip>
              ))}
            </div>
            <textarea value={msg} onChange={(e) => setMsg(e.target.value)} maxLength={2000} rows={4} placeholder={t("fb.placeholder")} aria-label={t("fb.title")} style={{ width: "100%", border: "1px solid var(--line)", borderRadius: 12, padding: 12, fontSize: 16, background: "var(--surface)", color: "var(--ink)", resize: "vertical" }} />
            <p style={{ fontSize: 13, color: "var(--low)", margin: "6px 0 12px" }}>{t("fb.private")}</p>
            <Button full disabled={!msg.trim()} onClick={sendFeedback}>
              {t("fb.send")}
            </Button>
          </div>
        )}
      </Sheet>
      <Sheet open={survey} onClose={() => sendSurvey(true)} title={t("survey.title")}>
        <p style={{ fontSize: 18, fontWeight: 650, lineHeight: 1.4, margin: "0 0 14px" }}>{t("survey.q")}</p>
        <div role="radiogroup" style={{ display: "flex", flexDirection: "column", gap: 8, marginBottom: 12 }}>
          {["very", "somewhat", "not"].map((k) => (
            <button key={k} role="radio" aria-checked={answer === k} onClick={() => setAnswer(k)} className="nv-press" style={{ textAlign: "left", ...(answer === k ? SELECTED : { border: "1px solid var(--line)" }), background: answer === k ? "var(--brandSoft)" : "var(--surface)", color: "var(--ink)", borderRadius: 12, padding: "14px 16px", fontSize: 16, fontWeight: 600, cursor: "pointer", minHeight: 52 }}>
              {t(`survey.${k}`)}
            </button>
          ))}
        </div>
        {answer && <textarea value={why} onChange={(e) => setWhy(e.target.value)} maxLength={1000} rows={3} placeholder={t("survey.why")} aria-label={t("survey.why")} style={{ width: "100%", border: "1px solid var(--line)", borderRadius: 12, padding: 12, fontSize: 16, background: "var(--surface)", color: "var(--ink)", marginBottom: 12 }} />}
        <Button full disabled={!answer} onClick={() => sendSurvey(false)}>
          {t("survey.send")}
        </Button>
        <Button full kind="ghost" onClick={() => sendSurvey(true)} style={{ marginTop: 4 }}>
          {t("survey.skip")}
        </Button>
      </Sheet>
    </>
  );
}

registerModule({
  id: "feedback",
  Overlay,
  services: { open: (x) => openFeedback && openFeedback(x) },
});
