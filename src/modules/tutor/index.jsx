// AI TUTOR ("Ask") — explains any term, chart or headline in plain words.
// Two modes: Simple (explain like I'm new) and Expert (numbers and detail).
// Always education, never personal advice. Opens from anywhere: the Ask
// button on every tab and in the lesson bar, "Ask about this" on a lesson
// card, "Explain this chart", a news story. Through the server (signed in),
// streamed; otherwise offline mode, which says so up front and answers from
// the glossary. Either way, answers link the lesson that covers the topic.
import { useEffect, useRef, useState } from "react";
import { registerModule, service } from "../../core/registry.js";
import { useSlice, setSlice, getState } from "../../core/store.js";
import { recordPractice } from "../../core/game.js";
import { track } from "../../core/analytics.js";
import { addStrings, text } from "../../core/i18n.js";
import { stream } from "../../core/api.js";
import { useSession } from "../../core/session.js";
import { level } from "../../core/progress.js";
import { Button, Chip, Icon, Note, Segmented, Sheet } from "../../core/ui.jsx";
import { lookup, suggestedWords, findLesson } from "./glossary.js";
import { sessionNow } from "../../core/session.js";
import { UNITS, ALL_LESSONS, unitDone, lessonState } from "../lessons/content.js";
import { conceptById } from "../lessons/concepts.js";

const lessonFor = (q) => findLesson(q, ALL_LESSONS, (id) => (conceptById(id) || {}).name);

const S = (en, es) => ({ en, es });
addStrings({
  "tutor.title": S("Tutor", "Tutor"),
  "tutor.nav": S("Tutor", "Tutor"),
  "tutor.simple": S("Simple", "Sencillo"),
  "tutor.expert": S("Expert", "Experto"),
  "tutor.mode": S("How deep?", "¿Qué tan a fondo?"),
  "tutor.placeholder": S("Ask about any money word, chart or headline", "Pregunta por cualquier palabra, gráfica o titular"),
  "tutor.send": S("Send", "Enviar"),
  "tutor.hello": S("Ask about any money word, chart or headline and I'll explain it in plain language. I teach how things work; I don't tell you what to buy.", "Pregunta por cualquier palabra, gráfica o titular de dinero y te lo explico en lenguaje sencillo. Explico cómo funcionan las cosas; no te digo qué comprar."),
  "tutor.about": S("About: {what}", "Sobre: {what}"),
  "tutor.thinking": S("Thinking…", "Pensando…"),
  "tutor.new": S("New chat", "Nueva conversación"),
  "tutor.offline.banner": S("The tutor is in offline mode, so it can only explain basic terms.", "El tutor está en modo sin conexión, así que solo puede explicar términos básicos."),
  "tutor.offline.account": S("A free account turns on the full tutor, which answers any money question.", "Una cuenta gratis activa el tutor completo, que responde cualquier pregunta de dinero."),
  "tutor.offline": S("From the glossary:", "Del glosario:"),
  "tutor.offline.lesson": S("Offline, I can only explain basic terms, but this lesson covers your question:", "Sin conexión solo puedo explicar términos básicos, pero esta lección cubre tu pregunta:"),
  "tutor.offline.none": S("I couldn't match that to a money term. Try a single word, like one of these:", "No encontré un término de dinero para eso. Prueba con una palabra, como alguna de estas:"),
  "tutor.related": S("Related lesson: {unit} · {lesson}", "Lección relacionada: {unit} · {lesson}"),
  "tutor.open": S("Open", "Abrir"),
  "tutor.c.lesson": S("Explain “{title}” simply", "Explícame “{title}” de forma sencilla"),
  "tutor.c.simpler": S("Explain this more simply", "Explícamelo más sencillo"),
  "tutor.c.example": S("Give me an example", "Dame un ejemplo"),
  "tutor.c.why": S("Why does this matter?", "¿Por qué importa esto?"),
  "tutor.signin": S("Create an account", "Crear cuenta"),
  "tutor.glossary": S("From the glossary", "Del glosario"),
  "tutor.words": S("Words I can explain right now", "Palabras que te puedo explicar ya"),
  "tutor.disclaimer": S("Educational only — not financial advice. The AI can make mistakes.", "Solo educativo, no es asesoría financiera. La IA puede equivocarse."),
  "tutor.error": S("That didn't go through. Check your connection and try again. Nothing you did was lost.", "No se envió. Revisa tu conexión e inténtalo de nuevo. No se perdió nada."),
  "tutor.limit": S("That's today's questions used up. The tutor's back tomorrow.", "Ya usaste las preguntas de hoy. El tutor regresa mañana."),
  "tutor.slow": S("That's a lot of questions at once. Give it a minute, then ask again.", "Son muchas preguntas seguidas. Dale un minuto y vuelve a preguntar."),
  "tutor.paused": S("The AI tutor is resting until next month. The glossary still works — try a single money word.", "El tutor con IA descansa hasta el próximo mes. El glosario sigue funcionando: prueba con una palabra."),
  "tutor.s1": S("What's an ETF?", "¿Qué es un ETF?"),
  "tutor.s2": S("Explain compound interest with an example", "Explícame el interés compuesto con un ejemplo"),
  "tutor.s3": S("Stocks vs. bonds — what's the difference?", "¿Qué diferencia hay entre acciones y bonos?"),
  "tutor.s4": S("How do credit scores work?", "¿Cómo funciona un puntaje de crédito?"),
  "tutor.s4.MX": S("What is the Buró de Crédito?", "¿Qué es el Buró de Crédito?"),
  "tutor.s5": S("What's a Roth IRA?", "¿Qué es una Roth IRA?"),
  "tutor.s5.MX": S("How does my AFORE work?", "¿Cómo funciona mi AFORE?"),
});

const DEFAULTS = { mode: "simple", messages: [], api: [] };
let openFn = null;

// A small reply formatter: paragraphs, bullets, **bold** — as elements.
function Rich({ value }) {
  const inline = (s) => s.split(/(\*\*[^*]+\*\*)/g).map((p, i) => (/^\*\*[^*]+\*\*$/.test(p) ? <strong key={i}>{p.slice(2, -2)}</strong> : p));
  const out = [];
  let list = null;
  value.split("\n").forEach((raw, i) => {
    const line = raw.trimEnd();
    const b = /^\s*(?:[-*•]|\d+[.)])\s+(.*)$/.exec(line);
    if (b) {
      if (!list) out.push((list = { items: [], key: i }));
      list.items.push(b[1]);
      return;
    }
    list = null;
    if (line.trim()) out.push({ p: line.replace(/^#+\s*/, ""), key: i });
  });
  return out.map((x) =>
    x.items ? (
      <ul key={x.key} style={{ margin: "6px 0", paddingLeft: 20 }}>
        {x.items.map((it, j) => (
          <li key={j} style={{ margin: "3px 0" }}>{inline(it)}</li>
        ))}
      </ul>
    ) : (
      <p key={x.key} style={{ margin: "0 0 8px" }}>{inline(x.p)}</p>
    )
  );
}

// What the tutor knows about the learner: progress, goals (kind and
// numbers, not their names) and practice portfolio in broad strokes — no
// name, no email, nothing personal.
function learnerSnapshot() {
  const s = getState();
  const units = UNITS.filter((u) => unitDone(s.progress, u)).map((u) => u.id);
  const pf = service("portfolio", "summary")();
  return { level: level(s.progress.xp).level, unitsDone: units, ageBand: s.profile.ageBand, goals: service("goals", "summary")() || [], portfolio: pf };
}

function Overlay({ t, locale, go }) {
  const [open, setOpen] = useState(false);
  const [about, setAbout] = useState(null);
  const [input, setInput] = useState("");
  const [busy, setBusy] = useState(false);
  const slice = useSlice("tutor", DEFAULTS);
  const session = useSession();
  const endRef = useRef(null);
  const aiReady = session.online && session.ai && session.user;
  const save = (fn) => setSlice("tutor", fn, DEFAULTS);

  openFn = ({ question, context } = {}) => {
    setOpen(true);
    setAbout(context ? { question, context } : null);
    if (question && !context) setTimeout(() => ask(question), 50);
    else if (question) setInput(question);
  };
  useEffect(() => {
    if (open && endRef.current) endRef.current.scrollIntoView({ block: "end" });
  }, [slice.messages.length, open, busy]);

  const ask = async (q) => {
    const question = String(q ?? input).trim();
    if (!question || busy) return;
    setInput("");
    const ctx = about;
    setAbout(null);
    recordPractice("tutor");
    track("tutor_ask", { mode: slice.mode, ai: !!aiReady });
    const id = Date.now();
    const userMsg = { id: `u${id}`, role: "user", text: question, about: ctx ? ctx.context.slice(0, 120) : null };
    const lesson = lessonFor(ctx ? `${question} ${ctx.context}` : question);
    if (!aiReady) {
      const g = lookup(question, locale.region, { loose: true }) || (ctx && lookup(`${ctx.question || ""} ${ctx.context || ""}`, locale.region));
      const answer = g ? text(slice.mode === "expert" ? g.expert : g.simple, locale) : null;
      save((s) => ({ ...s, messages: [...s.messages, userMsg, { id: `a${id}`, role: "assistant", offline: true, text: answer, glossary: !!g, lesson: lesson && lesson.id }].slice(-60) }));
      return;
    }
    const reply = { id: `a${id}`, role: "assistant", text: "", lesson: lesson && lesson.id };
    save((s) => ({ ...s, messages: [...s.messages, userMsg, reply].slice(-60) }));
    setBusy(true);
    const show = (patch) => save((s) => ({ ...s, messages: s.messages.map((m) => (m.id === reply.id ? { ...m, ...patch } : m)) }));
    let acc = "";
    try {
      const done = await stream(
        "/api/tutor/turn",
        { history: slice.api.slice(-20), question, context: ctx ? ctx.context : null, mode: slice.mode, lang: locale.lang, region: locale.region, learner: learnerSnapshot() },
        (piece) => {
          acc += piece;
          show({ text: acc });
        }
      );
      const answer = done.text || acc;
      show({ text: answer });
      save((s) => ({ ...s, api: [...s.api, { role: "user", content: ctx ? `${ctx.context}\n\n${question}` : question }, { role: "assistant", content: answer }].slice(-40) }));
    } catch (e) {
      show({ text: e.code === "DAILY_LIMIT" ? t("tutor.limit") : e.code === "SLOW_DOWN" ? t("tutor.slow") : e.code === "AI_PAUSED" ? t("tutor.paused") : e.message && e.status !== 0 ? e.message : t("tutor.error"), error: true });
    } finally {
      setBusy(false);
    }
  };

  // Suggestions for where the learner is: about a lesson card, the lesson
  // they're on, then the usual starters. Offline: words it can explain.
  const now = service("lessons", "current")();
  const suggestions = about
    ? [t("tutor.c.simpler"), t("tutor.c.example"), t("tutor.c.why")]
    : [...(now ? [t("tutor.c.lesson", { title: text(now.title, locale) })] : []), ...["tutor.s1", "tutor.s2", locale.region === "MX" ? "tutor.s4.MX" : "tutor.s4"].map((k) => t(k))];
  const glossaryWords = suggestedWords(locale.lang, locale.region);
  const last = slice.messages[slice.messages.length - 1];
  const missed = last && last.offline && !last.text && !last.lesson;
  const related = (id) => {
    const l = ALL_LESSONS.find((x) => x.id === id);
    if (!l) return null;
    const u = UNITS.find((x) => x.id === l.unit);
    const open = lessonState(getState().progress, id) !== "locked";
    return (
      <div style={{ display: "flex", alignItems: "center", gap: 10, marginTop: 10, paddingTop: 10, borderTop: "1px solid var(--line)" }}>
        <Icon name="book" size={18} color="var(--mid)" />
        <span style={{ flex: 1, fontSize: 14, color: "var(--mid)" }}>{t("tutor.related", { unit: text(u.title, locale), lesson: text(l.title, locale) })}</span>
        <Button size="sm" kind="secondary" onClick={() => (setOpen(false), go("lessons", open ? { lesson: id } : {}))}>
          {t("tutor.open")}
        </Button>
      </div>
    );
  };

  return (
    <Sheet open={open} onClose={() => setOpen(false)} title={t("tutor.title")} tall>
      <div style={{ display: "flex", gap: 10, alignItems: "center", marginBottom: 12 }}>
        <div style={{ flex: 1 }}>
          <Segmented label={t("tutor.mode")} value={slice.mode} onChange={(mode) => save((s) => ({ ...s, mode }))} options={[{ value: "simple", label: t("tutor.simple") }, { value: "expert", label: t("tutor.expert") }]} />
        </div>
        {slice.messages.length > 0 && (
          <Button kind="ghost" size="sm" onClick={() => save(() => ({ ...DEFAULTS, mode: slice.mode }))} disabled={busy}>
            {t("tutor.new")}
          </Button>
        )}
      </div>

      {!aiReady && (
        <Note icon="info" style={{ marginBottom: 12 }}>
          <strong style={{ display: "block" }}>{t("tutor.offline.banner")}</strong>
          {!session.user && session.online && (
            <>
              <span style={{ display: "block", fontSize: 14, color: "var(--mid)", marginTop: 4 }}>{t("tutor.offline.account")}</span>
              <Button size="sm" kind="secondary" style={{ marginTop: 10 }} onClick={() => (setOpen(false), go("settings"))}>
                {t("tutor.signin")}
              </Button>
            </>
          )}
        </Note>
      )}
      <div style={{ display: "flex", flexDirection: "column", gap: 10, minHeight: 200 }}>
        {slice.messages.length === 0 && (
          <div style={{ background: "var(--surface)", borderRadius: 18, padding: 14, fontSize: 16, lineHeight: 1.5 }}>
            {t("tutor.hello")}
          </div>
        )}
        {slice.messages.map((m) =>
          m.role === "user" ? (
            <div key={m.id} style={{ alignSelf: "flex-end", maxWidth: "86%" }}>
              {m.about && <div style={{ fontSize: 12, color: "var(--low)", textAlign: "right", marginBottom: 4 }}>{t("tutor.about", { what: m.about })}…</div>}
              <div style={{ background: "var(--brand)", color: "var(--onBrand)", borderRadius: "18px 18px 4px 18px", padding: "11px 14px", fontSize: 16, lineHeight: 1.45 }}>{m.text}</div>
            </div>
          ) : (
            <div key={m.id} style={{ alignSelf: "flex-start", maxWidth: "94%", background: "var(--surface)", borderRadius: "18px 18px 18px 4px", padding: "12px 14px", fontSize: 16, lineHeight: 1.5, color: m.error ? "var(--bad)" : "var(--ink)", overflowWrap: "anywhere" }}>
              {m.offline ? (
                <>
                  <p style={{ margin: "0 0 8px", color: "var(--mid)", fontSize: 14 }}>{m.glossary ? t("tutor.offline") : m.lesson ? t("tutor.offline.lesson") : t("tutor.offline.none")}</p>
                  {m.text && <p style={{ margin: 0, fontWeight: 650 }}>{m.text}</p>}
                </>
              ) : m.text ? (
                <Rich value={m.text} />
              ) : (
                <span className="nv-pulse" style={{ color: "var(--low)" }}>{t("tutor.thinking")}</span>
              )}
              {m.lesson && !m.error && (m.offline || m.text) && related(m.lesson)}
            </div>
          )
        )}
        <div ref={endRef} />
      </div>

      {(slice.messages.length === 0 || missed) && (
        <div style={{ display: "flex", flexWrap: "wrap", gap: 8, margin: "14px 0 4px" }}>
          {(aiReady ? suggestions : glossaryWords).map((s) => (
            <Chip key={s} onClick={() => ask(s)} style={{ fontSize: 14 }}>
              {s}
            </Chip>
          ))}
        </div>
      )}

      {about && (
        <Note icon="sparkles" style={{ marginTop: 12 }}>
          <strong>{t("tutor.about", { what: about.question || about.context })}</strong>
          <div style={{ fontSize: 13, color: "var(--mid)", marginTop: 4, maxHeight: 60, overflow: "hidden" }}>{about.context}</div>
        </Note>
      )}
      <form
        onSubmit={(e) => {
          e.preventDefault();
          ask();
        }}
        style={{ display: "flex", gap: 8, marginTop: 12, position: "sticky", bottom: 0, background: "var(--bg)", paddingTop: 8 }}
      >
        <input value={input} onChange={(e) => setInput(e.target.value)} placeholder={t("tutor.placeholder")} aria-label={t("tutor.placeholder")} enterKeyHint="send" maxLength={2000} style={{ flex: 1, minWidth: 0, border: "1px solid var(--line)", borderRadius: 999, padding: "12px 16px", fontSize: 16, background: "var(--surface)", color: "var(--ink)" }} />
        <button type="submit" disabled={busy || !input.trim()} aria-label={t("tutor.send")} style={{ width: 48, height: 48, borderRadius: 24, border: "none", background: "var(--brand)", color: "var(--onBrand)", display: "flex", alignItems: "center", justifyContent: "center", cursor: "pointer", opacity: busy || !input.trim() ? 0.5 : 1, flexShrink: 0 }}>
          <Icon name="send" size={20} />
        </button>
      </form>
      <p style={{ fontSize: 12, color: "var(--low)", textAlign: "center", margin: "8px 0 0" }}>{t("tutor.disclaimer")}</p>
    </Sheet>
  );
}

registerModule({
  id: "tutor",
  // A sheet over any screen, opened by the Ask button (no screen of its own).
  Overlay,
  services: {
    open: (x) => openFn && openFn(x),
    // "Ask about this" in a lesson: with the AI, ask about the card; without
    // it, answer from the glossary when the card is about a known term
    // (and say there's nothing to explain otherwise — the button hides).
    canExplain: (text) => {
      const s = sessionNow();
      return !!((s.online && s.ai && s.user) || lookup(text, getState().settings.region));
    },
    explain: ({ question, context }) => {
      const s = sessionNow();
      if (s.online && s.ai && s.user) return openFn && openFn({ question, context });
      const g = lookup(`${question} ${context}`, getState().settings.region);
      if (g && openFn) openFn({ question: g.keys[0] });
    },
  },
});
