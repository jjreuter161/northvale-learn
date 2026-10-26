// MONEY MISSIONS — real-life practice. Each week suggests one small task
// that goes with what you're learning and your goal ("find the fees on a
// bank account"); you do it on your own, mark it done and can write a
// short note. XP and achievements for finishing. No money moves; the note
// is saved with your progress (synced if you have an account) and usage
// stats only count that a mission was finished.
// The catalog is in catalog.js, the rules in pick.js (tested).
import { useState } from "react";
import { registerModule, service } from "../../core/registry.js";
import { useAppState, useSlice, setSlice, getState, slice as sliceOf } from "../../core/store.js";
import { recordMission } from "../../core/game.js";
import { track } from "../../core/analytics.js";
import { addStrings, shortDate, text } from "../../core/i18n.js";
import { dayKey } from "../../core/progress.js";
import { Button, Card, Icon, Label, Note, Sheet, Title } from "../../core/ui.jsx";
import { MISSIONS, missionById } from "./catalog.js";
import { DEFAULTS, NOTE_MAX, thisWeek, another, start, drop, finish, finished, recommend, forUnit, weeksWithMissions } from "./pick.js";

const S = (en, es) => ({ en, es });
addStrings({
  "mi.nav": S("Missions", "Misiones"),
  "mi.title": S("Money Missions", "Misiones de dinero"),
  "mi.sub": S("Small real-life tasks that put what you learn to work. Nothing here moves real money: you do them on your own and mark them done.", "Pequeñas tareas de la vida real para poner en práctica lo que aprendes. Aquí no se mueve dinero real: las haces por tu cuenta y las marcas como hechas."),
  "mi.week": S("This week's mission", "Misión de la semana"),
  "mi.started": S("In progress · started {date}", "En curso · la empezaste el {date}"),
  "mi.start": S("Start mission", "Empezar misión"),
  "mi.another": S("Show another", "Ver otra"),
  "mi.mark": S("Mark done", "Marcar como hecha"),
  "mi.stop": S("Stop this mission", "Dejar esta misión"),
  "mi.week_done": S("Mission done this week", "Misión de la semana cumplida"),
  "mi.week_done.sub": S("A new one is suggested on Monday.", "El lunes te sugerimos otra."),
  "mi.do_another": S("Do another", "Hacer otra"),
  "mi.all": S("More missions", "Más misiones"),
  "mi.done": S("Done", "Hechas"),
  "mi.done_on": S("Done {date}", "Hecha el {date}"),
  "mi.weekly": S("Weekly", "Semanal"),
  "mi.time.min": S("About {n} min", "Unos {n} min"),
  "mi.time.days": S("Over a few days", "En unos días"),
  "mi.time.week": S("During the week", "Durante la semana"),
  "mi.ask": S("Afterward, think about: {q}", "Después, piensa: {q}"),
  "mi.note.hint": S("Optional. Only you can see this; it's saved with your progress. Leave out account numbers, passwords and other private details.", "Opcional. Solo tú lo ves; se guarda con tu progreso. No escribas números de cuenta, contraseñas ni otros datos privados."),
  "mi.finish": S("Finish mission", "Terminar misión"),
  "mi.finished": S("Mission done", "Misión cumplida"),
  "mi.xp": S("+{n} XP", "+{n} XP"),
  "mi.no_xp": S("Done again. XP is for the first time.", "Hecha otra vez. Los XP son para la primera vez."),
  "mi.no_xp.weekly": S("Done again this week. XP is once a week.", "Hecha otra vez esta semana. Los XP son una vez por semana."),
  "mi.record": S("Record the amount on {name}", "Registra el monto en {name}"),
  "mi.close": S("Close", "Cerrar"),
  "mi.try": S("Try it for real", "Pruébalo en la vida real"),
  "mi.see": S("See mission", "Ver misión"),
  "mi.none": S("You've done every mission that fits you for now. Repeatable ones come back on Monday.", "Ya hiciste todas las misiones que te tocan por ahora. Las que se repiten vuelven el lunes."),
  "mi.private": S("Missions never move money. Your notes are private: they're saved with your progress, and usage stats only count that a mission was finished, never what you wrote. XP comes the first time you finish each one.", "Las misiones nunca mueven dinero. Tus notas son privadas: se guardan con tu progreso, y las estadísticas de uso solo cuentan que terminaste una misión, nunca lo que escribiste. Los XP llegan la primera vez que terminas cada una."),
});

// ---- who's doing them --------------------------------------------------------

const adult = (ageBand) => ageBand === "18-25" || ageBand === "26+";
function ctxNow() {
  const s = getState();
  const goals = service("goals", "goalKinds")() || [];
  return { region: s.settings.region, ageBand: s.profile.ageBand, goals, goalKinds: goals.map((g) => g.kind), units: service("lessons", "unitActivity")() || {} };
}
// Re-reads on every change (goals, lessons, settings), then works from getState.
const useCtx = () => (useAppState((s) => s.updatedAt), ctxNow());
const save = (fn) => setSlice("missions", fn, DEFAULTS);
const howFor = (m, ctx) => (m.teen && !adult(ctx.ageBand) ? m.teen : m.how);

// ---- pieces ------------------------------------------------------------------

function TimeTag({ t, m }) {
  const label = typeof m.time === "number" ? t("mi.time.min", { n: m.time }) : t(`mi.time.${m.time}`);
  return (
    <span style={{ display: "inline-flex", alignItems: "center", gap: 6, fontSize: 13, color: "var(--mid)" }}>
      <Icon name="clock" size={14} />
      {label}
      {m.repeat && <span>· {t("mi.weekly")}</span>}
    </span>
  );
}

function Head({ t, locale, m, sub }) {
  return (
    <div style={{ display: "flex", alignItems: "flex-start", gap: 12 }}>
      <span style={{ width: 40, height: 40, borderRadius: 10, background: "var(--surface2)", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
        <Icon name={m.icon} size={20} />
      </span>
      <div style={{ flex: 1, minWidth: 0 }}>
        <div style={{ fontWeight: 650, fontSize: 16, lineHeight: 1.35 }}>{text(m.title, locale)}</div>
        <div style={{ marginTop: 3 }}>{sub || <TimeTag t={t} m={m} />}</div>
      </div>
    </div>
  );
}

const body = { fontSize: 15, lineHeight: 1.55, margin: "12px 0 14px" };
const textBtn = { display: "block", margin: "8px auto 0", border: "none", background: "transparent", color: "var(--mid)", fontSize: 14, fontWeight: 600, cursor: "pointer", padding: "10px 12px", minHeight: 44 };

// Finishing: an optional note, then XP and (for "set money aside") a way
// to record the amount on the goal.
function DoneSheet({ t, locale, go, id, onClose }) {
  const [note, setNote] = useState("");
  const [result, setResult] = useState(null);
  const m = id && missionById(id);
  const close = () => (setNote(""), setResult(null), onClose());
  const goal = m && m.needsGoal === true && (ctxNow().goals[0] || null);
  return (
    <Sheet open={!!m} onClose={close} title={result ? t("mi.finished") : m ? text(m.title, locale) : ""}>
      {m && !result && (
        <>
          <label htmlFor="ms-note" style={{ display: "block", fontWeight: 650, fontSize: 15, marginBottom: 8 }}>
            {text(m.ask, locale)}
          </label>
          <textarea id="ms-note" value={note} onChange={(e) => setNote(e.target.value)} maxLength={NOTE_MAX} rows={3} style={{ width: "100%", border: "1px solid var(--line)", borderRadius: 12, padding: 12, fontSize: 16, background: "var(--surface)", color: "var(--ink)", resize: "vertical" }} />
          <p style={{ fontSize: 13, color: "var(--low)", lineHeight: 1.45, margin: "6px 0 14px" }}>{t("mi.note.hint")}</p>
          <Button
            full
            onClick={() => {
              const today = dayKey();
              const r = finish(sliceOf("missions", DEFAULTS), id, note, today);
              save(() => r.slice);
              setResult(recordMission({ id, first: r.first, note }));
            }}
          >
            {t("mi.finish")}
          </Button>
        </>
      )}
      {m && result && (
        <div style={{ textAlign: "center", padding: "4px 0 2px" }}>
          <div style={{ width: 56, height: 56, borderRadius: 28, margin: "0 auto 12px", background: "var(--accentSoft)", color: "var(--accent)", display: "flex", alignItems: "center", justifyContent: "center" }}>
            <Icon name="check" size={28} stroke={2.4} />
          </div>
          <p style={{ fontSize: 17, fontWeight: 650, margin: "0 0 4px" }}>{text(m.title, locale)}</p>
          <p style={{ fontSize: 15, color: "var(--mid)", margin: "0 0 18px" }}>{result.gained ? t("mi.xp", { n: result.gained }) : t(m.repeat ? "mi.no_xp.weekly" : "mi.no_xp")}</p>
          <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
            {goal && (
              <Button full onClick={() => (close(), go("goals", { record: goal.id }))}>
                {t("mi.record", { name: goal.name })}
              </Button>
            )}
            <Button full kind={goal ? "secondary" : "primary"} onClick={close}>
              {t("mi.close")}
            </Button>
          </div>
        </div>
      )}
    </Sheet>
  );
}

// The week's mission: in progress, done, or a suggestion to start.
function WeekCard({ t, locale, go, label = true }) {
  const ctx = useCtx();
  const slice = useSlice("missions", DEFAULTS);
  const [more, setMore] = useState(false);
  const [doneId, setDoneId] = useState(null);
  const today = dayKey();
  const w = thisWeek(slice, ctx, today);
  const begin = (id) => (save((s) => start(s, id, today)), track("mission_start", { mission: id }), setMore(false));
  let card;
  if (w.active) {
    const m = w.active;
    card = (
      <Card>
        <Head t={t} locale={locale} m={m} sub={<span style={{ fontSize: 13, color: "var(--mid)" }}>{t("mi.started", { date: shortDate(slice.active.day, locale) })}</span>} />
        <p style={body}>{text(howFor(m, ctx), locale)}</p>
        <Button full onClick={() => setDoneId(m.id)}>
          {t("mi.mark")}
        </Button>
        <button onClick={() => save(drop)} className="nv-press" style={textBtn}>
          {t("mi.stop")}
        </button>
      </Card>
    );
  } else if (w.done.length && !more) {
    card = (
      <Card>
        <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
          <span style={{ width: 40, height: 40, borderRadius: 20, background: "var(--accentSoft)", color: "var(--accent)", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
            <Icon name="check" size={22} stroke={2.4} />
          </span>
          <div style={{ flex: 1, minWidth: 0 }}>
            <div style={{ fontWeight: 650, fontSize: 16 }}>{t("mi.week_done")}</div>
            <div style={{ fontSize: 14, color: "var(--mid)", lineHeight: 1.4 }}>{w.done.map((e) => text(missionById(e.id).title, locale)).join(" · ")}</div>
          </div>
        </div>
        <p style={{ fontSize: 14, color: "var(--mid)", margin: "12px 0" }}>{t("mi.week_done.sub")}</p>
        {w.suggestion && (
          <Button full kind="secondary" style={{ border: "1px solid var(--line)" }} onClick={() => setMore(true)}>
            {t("mi.do_another")}
          </Button>
        )}
      </Card>
    );
  } else if (w.suggestion) {
    const m = w.suggestion;
    card = (
      <Card>
        <Head t={t} locale={locale} m={m} />
        <p style={body}>{text(howFor(m, ctx), locale)}</p>
        <Button full onClick={() => begin(m.id)}>
          {t("mi.start")}
        </Button>
        {w.ranked.length > 1 && (
          <button onClick={() => save((s) => another(s, ctx, today))} className="nv-press" style={textBtn}>
            {t("mi.another")}
          </button>
        )}
      </Card>
    );
  } else card = <Note icon="check">{t("mi.none")}</Note>;
  return (
    <>
      {label && <Label>{t("mi.week")}</Label>}
      {card}
      <DoneSheet t={t} locale={locale} go={go} id={doneId} onClose={() => setDoneId(null)} />
    </>
  );
}

// One mission's details (from the list, or after a lesson).
function MissionSheet({ t, locale, id, onClose, onDone }) {
  const ctx = useCtx();
  const slice = useSlice("missions", DEFAULTS);
  const m = id && missionById(id);
  const today = dayKey();
  const isActive = m && slice.active && slice.active.id === m.id;
  const last = m && [...slice.log].reverse().find((e) => e.id === m.id);
  const closed = m && finished(m, slice.log, today);
  return (
    <Sheet open={!!m} onClose={onClose} title={m ? text(m.title, locale) : ""}>
      {m && (
        <>
          <TimeTag t={t} m={m} />
          <p style={body}>{text(howFor(m, ctx), locale)}</p>
          <p style={{ fontSize: 14, color: "var(--mid)", lineHeight: 1.5, margin: "0 0 16px" }}>{t("mi.ask", { q: text(m.ask, locale) })}</p>
          {last && (
            <Note icon="check" style={{ marginBottom: 14 }}>
              {t("mi.done_on", { date: shortDate(last.day, locale) })}
              {last.note ? ` — “${last.note}”` : ""}
            </Note>
          )}
          {isActive ? (
            <Button full onClick={() => (onClose(), onDone(m.id))}>
              {t("mi.mark")}
            </Button>
          ) : (
            !closed && (
              <Button full onClick={() => (save((s) => start(s, m.id, today)), track("mission_start", { mission: m.id }), onClose())}>
                {t("mi.start")}
              </Button>
            )
          )}
        </>
      )}
    </Sheet>
  );
}

// ---- the screen --------------------------------------------------------------

function Screen({ t, locale, go, route }) {
  const ctx = useCtx();
  const slice = useSlice("missions", DEFAULTS);
  const [open, setOpen] = useState(route.params.id || null);
  const [doneId, setDoneId] = useState(null);
  const today = dayKey();
  const w = thisWeek(slice, ctx, today);
  // Everything else that fits (the week's card already shows one).
  const shown = w.active || (w.done.length ? null : w.suggestion);
  const rest = recommend(ctx, slice.log, today).filter((m) => m !== shown);
  const done = [...slice.log].reverse();
  const row = (m, sub, key) => (
    <Card key={key} pad={14} onClick={() => setOpen(m.id)}>
      <Head t={t} locale={locale} m={m} sub={sub} />
    </Card>
  );
  return (
    <div>
      <Title sub={t("mi.sub")}>{t("mi.title")}</Title>
      <WeekCard t={t} locale={locale} go={go} />
      {rest.length > 0 && <Label>{t("mi.all")}</Label>}
      <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>{rest.map((m) => row(m, null, m.id))}</div>
      {done.length > 0 && <Label>{t("mi.done")}</Label>}
      <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
        {done.map((e, i) => {
          const m = missionById(e.id);
          return (
            m &&
            row(
              m,
              <>
                <span style={{ display: "block", fontSize: 13, color: "var(--mid)" }}>{t("mi.done_on", { date: shortDate(e.day, locale) })}</span>
                {e.note && <span style={{ display: "block", fontSize: 14, color: "var(--ink)", lineHeight: 1.45, marginTop: 4 }}>“{e.note}”</span>}
              </>,
              `${e.id}-${i}`
            )
          );
        })}
      </div>
      <Note icon="shield" style={{ marginTop: 18 }}>{t("mi.private")}</Note>
      <MissionSheet t={t} locale={locale} id={open} onClose={() => setOpen(null)} onDone={setDoneId} />
      <DoneSheet t={t} locale={locale} go={go} id={doneId} onClose={() => setDoneId(null)} />
    </div>
  );
}

// After a lesson: a mission for that unit, when nothing's in progress.
function TryCard({ t, locale, go, unit }) {
  const s = sliceOf("missions", DEFAULTS);
  const m = !s.active && forUnit(unit, ctxNow(), s.log, dayKey());
  if (!m) return null;
  return (
    <Card>
      <div style={{ fontSize: 12, fontWeight: 650, color: "var(--low)", letterSpacing: 0.4, textTransform: "uppercase", marginBottom: 10 }}>{t("mi.try")}</div>
      <Head t={t} locale={locale} m={m} />
      <Button full size="md" kind="secondary" style={{ marginTop: 12, border: "1px solid var(--line)" }} onClick={() => go("missions", { id: m.id })}>
        {t("mi.see")}
      </Button>
    </Card>
  );
}

registerModule({
  id: "missions",
  nav: { icon: "flag", label: "mi.nav", order: 1.5 },
  Screen,
  // For achievements: missions finished, and in how many different weeks.
  facts: (state) => {
    const log = (state.modules.missions && state.modules.missions.log) || [];
    return { missionsDone: log.length, missionWeeks: weeksWithMissions(log) };
  },
  services: {
    WeekCard,
    TryCard,
  },
});

export { MISSIONS };
