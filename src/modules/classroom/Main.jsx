// CLASSROOM MODE — classes for schools and clubs, behind the "classroom"
// feature flag (server/flags.js: off until a lawyer has reviewed it).
// Students join with a class code or the teacher's link (?join=CODE) and a
// nickname — no account needed — after a screen that says exactly what the
// teacher will and won't see; their device then sends a short report
// (report.js). Teachers (adults with an account, email confirmed, teacher
// terms accepted) see class progress and assign units. No messages of any
// kind. The rules are enforced on the server (server/classes.js).
import { useEffect, useState } from "react";
import { service } from "../../core/registry.js";
import { getState, setSlice, slice as sliceOf, update, useAppState, useSlice } from "../../core/store.js";
import { addStrings, makeT, shortDate, text } from "../../core/i18n.js";
import { api } from "../../core/api.js";
import { dayKey } from "../../core/progress.js";
import { sendVerify, acceptTeacherTerms, sessionNow, setLeague } from "../../core/session.js";
import { Button, Card, Field, Icon, Label, Loading, Note, Sheet, Switch, Title, toast } from "../../core/ui.jsx";
import { classReport, conceptCounts } from "./report.js";

const S = (en, es) => ({ en, es });
addStrings({
  "cls.none": S("You're not in a class. When a teacher gives you a code or a link, you can join here.", "No estás en ninguna clase. Cuando un profe te dé un código o un enlace, puedes unirte aquí."),
  "cls.join": S("Join a class", "Unirme a una clase"),
  "cls.code": S("Class code", "Código de la clase"),
  "cls.code.hint": S("Your teacher gives you this code.", "Te lo da tu profe."),
  "cls.sees.title": S("Before you join", "Antes de unirte"),
  "cls.sees.class": S("Class: {name}", "Clase: {name}"),
  "cls.sees.yes": S("Your teacher sees", "Tu profe ve"),
  "cls.sees.nick": S("The nickname you pick below", "El apodo que elijas abajo"),
  "cls.sees.lessons": S("Lessons and units you finish from now on", "Las lecciones y unidades que termines desde ahora"),
  "cls.sees.missions": S("How many real-life missions you finish (never your notes)", "Cuántas misiones de la vida real terminas (nunca tus notas)"),
  "cls.sees.assign": S("Your progress on what your teacher assigns", "Tu avance en lo que asigne tu profe"),
  "cls.sees.concepts": S("Which topics the class finds hard, as class totals — never just yours", "Qué temas se le dificultan al grupo, en totales del grupo — nunca solo los tuyos"),
  "cls.sees.no": S("Your teacher never sees", "Tu profe nunca ve"),
  "cls.sees.goals": S("Your goals or any amounts", "Tus metas ni ninguna cantidad"),
  "cls.sees.portfolio": S("Your practice portfolio", "Tu portafolio de práctica"),
  "cls.sees.notes": S("Your mission notes", "Tus notas de misiones"),
  "cls.sees.tutor": S("What you ask the tutor", "Lo que le preguntas al tutor"),
  "cls.sees.age": S("Your age or email", "Tu edad ni tu correo"),
  "cls.sees.before": S("Anything from before you join, unless you choose to count lessons you already finished for assignments", "Nada de antes de unirte, salvo que elijas contar para las tareas las lecciones que ya terminaste"),
  "cls.earlier": S("Count lessons I already finished for class assignments", "Contar para las tareas de la clase las lecciones que ya terminé"),
  "cls.earlier.sub": S("Only lessons in assigned units, and only toward those assignments.", "Solo lecciones de unidades asignadas, y solo para esas tareas."),
  "cls.sees.board": S("Your nickname and this week's XP show on the class leaderboard. You can hide yourself anytime.", "Tu apodo y tu XP de la semana aparecen en la tabla de la clase. Puedes ocultarte cuando quieras."),
  "cls.sees.leave": S("You can leave anytime. Then your teacher no longer sees anything about you.", "Puedes salirte cuando quieras. Después, tu profe ya no ve nada sobre ti."),
  "cls.sees.messages": S("There are no messages: nobody can contact you through the class.", "No hay mensajes: nadie puede contactarte por la clase."),
  "cls.nick": S("Nickname for this class", "Apodo para esta clase"),
  "cls.nick.hint": S("Use a nickname, not your full name.", "Usa un apodo, no tu nombre completo."),
  "cls.age.young": S("Classes are for ages 13 and up for now.", "Por ahora, las clases son para mayores de 13 años."),
  "cls.join.yes": S("Join class", "Unirme a la clase"),
  "cls.joined": S("You joined {name}", "Te uniste a {name}"),
  "cls.assigned": S("Assigned", "Tareas"),
  "cls.due": S("Due {date}", "Para el {date}"),
  "cls.progress": S("{done} of {of} lessons", "{done} de {of} lecciones"),
  "cls.start": S("Start", "Empezar"),
  "cls.finished": S("Finished", "Terminada"),
  "cls.assigned.none": S("No assignments right now. Enjoy it.", "No hay tareas por ahora. Disfrútalo."),
  "cls.board": S("Class leaderboard", "Tabla de la clase"),
  "cls.board.show": S("Show me on the class leaderboard", "Mostrarme en la tabla de la clase"),
  "cls.board.hidden": S("Your row is hidden: only you see it.", "Tu fila está oculta: solo tú la ves."),
  "cls.what": S("What your teacher sees", "Lo que ve tu profe"),
  "cls.leave": S("Leave class", "Salir de la clase"),
  "cls.leave.body": S("Leave {name}? Your teacher will no longer see anything about you, and you'll leave the class leaderboard.", "¿Salir de {name}? Tu profe ya no verá nada sobre ti y saldrás de la tabla de la clase."),
  "cls.left": S("You left {name}", "Saliste de {name}"),
  "cls.gone": S("You're no longer in {name}.", "Ya no estás en {name}."),
  "cls.paused": S("This class is paused for now.", "Esta clase está en pausa por ahora."),
  "cls.ended": S("Your teacher ended this class. You can leave it.", "Tu profe terminó esta clase. Puedes salirte."),
  // Teachers
  "cls.t.title": S("Teaching", "Para docentes"),
  "cls.t.guide": S("Teacher guide (printable)", "Guía para docentes (para imprimir)"),
  "cls.t.account": S("To teach a class, sign in or make an account first.", "Para dar una clase, primero inicia sesión o crea una cuenta."),
  "cls.t.adult": S("Teaching a class needs an account for an adult (18 or older).", "Para dar una clase se necesita la cuenta de una persona adulta (18 años o más)."),
  "cls.t.verify": S("Confirm your email", "Confirma tu correo"),
  "cls.t.verify.sub": S("We'll email you a link. Teaching needs a confirmed email.", "Te mandamos un enlace por correo. Para dar clases se necesita un correo confirmado."),
  "cls.t.verify.send": S("Send the link", "Enviar el enlace"),
  "cls.t.verify.sent": S("Check your inbox for the link, then come back here.", "Revisa tu correo, abre el enlace y vuelve aquí."),
  "cls.t.verified": S("Email confirmed", "Correo confirmado"),
  "cls.t.terms": S("Teacher terms", "Términos para docentes"),
  "cls.t.terms.sub": S("In short: use classes for teaching, follow your school's rules for student apps (and get its OK first), let students use nicknames, and never ask them for personal information.", "En corto: usa las clases para enseñar, sigue las reglas de tu escuela sobre apps para estudiantes (y pide su visto bueno antes), deja que usen apodos y nunca les pidas datos personales."),
  "cls.t.terms.read": S("Read the teacher terms", "Leer los términos para docentes"),
  "cls.t.terms.agree": S("I agree to the teacher terms", "Acepto los términos para docentes"),
  "cls.t.terms.yes": S("Accept", "Aceptar"),
  "cls.t.new": S("New class", "Clase nueva"),
  "cls.t.name": S("Class name", "Nombre de la clase"),
  "cls.t.name.hint": S("Like “Period 3 Economics” or “Money Club”.", "Como “Economía 3.º B” o “Club de finanzas”."),
  "cls.t.create": S("Create class", "Crear clase"),
  "cls.t.students": S("{n} {n|student|students}", "{n} {n|estudiante|estudiantes}"),
  "cls.t.archived": S("Archived · deleted on {date}", "Archivada · se borra el {date}"),
  "cls.t.back": S("All classes", "Todas las clases"),
  "cls.t.link": S("Join link", "Enlace para unirse"),
  "cls.t.copied": S("Link copied", "Enlace copiado"),
  "cls.t.open": S("Taking new students", "Acepta estudiantes nuevos"),
  "cls.t.open.sub": S("Turn it off once everyone's in.", "Desactívalo cuando ya estén todos."),
  "cls.t.newcode": S("New code", "Código nuevo"),
  "cls.t.newcode.done": S("New code ready. The old one no longer works.", "Código nuevo listo. El anterior ya no funciona."),
  "cls.t.privacy": S("You see nicknames; lessons and units finished since each student joined; how many missions they've finished; assignment progress; and class-wide totals for hard topics. You never see goals, amounts, practice portfolios, mission notes, tutor questions, age or email. Students can leave at any time, and there's no messaging.", "Ves apodos; lecciones y unidades terminadas desde que cada estudiante se unió; cuántas misiones terminó; el avance en las tareas, y totales del grupo de los temas difíciles. Nunca ves metas, cantidades, portafolios de práctica, notas de misiones, preguntas al tutor, edad ni correo. Pueden salirse cuando quieran y no hay mensajes."),
  "cls.t.assign": S("Assign", "Asignar"),
  "cls.t.unit": S("Unit", "Unidad"),
  "cls.t.due": S("Due date", "Fecha de entrega"),
  "cls.t.assign.done": S("{done} of {of} students finished", "{done} de {of} estudiantes terminaron"),
  "cls.t.remove": S("Remove", "Quitar"),
  "cls.t.roster": S("Students", "Estudiantes"),
  "cls.t.col.lessons": S("Lessons", "Lecciones"),
  "cls.t.col.units": S("Units", "Unidades"),
  "cls.t.col.missions": S("Missions", "Misiones"),
  "cls.t.empty": S("No students yet. Share the code or the join link.", "Aún no hay estudiantes. Comparte el código o el enlace."),
  "cls.t.remove.student": S("Remove {name} from the class? Their progress in this class is deleted.", "¿Quitar a {name} de la clase? Se borra su avance en esta clase."),
  "cls.t.hard": S("Topics the class finds hard", "Temas que se le dificultan al grupo"),
  "cls.t.hard.row": S("{missed} of {seen} answers missed · {n} students", "{missed} de {seen} respuestas falladas · {n} estudiantes"),
  "cls.t.hard.none": S("Shows once 3 or more students have answered questions on a topic.", "Aparece cuando 3 o más estudiantes hayan respondido preguntas de un tema."),
  "cls.t.archive": S("Archive class", "Archivar clase"),
  "cls.t.archive.sub": S("Students can no longer use it, and it's deleted for good 90 days later.", "Los estudiantes ya no pueden usarla y se borra por completo 90 días después."),
  "cls.t.restore": S("Restore", "Restaurar"),
  "cls.t.delete": S("Delete now", "Borrar ya"),
  "cls.t.delete.body": S("Delete {name} and everything in it? This can't be undone.", "¿Borrar {name} y todo lo que tiene? No se puede deshacer."),
  "cls.t.deleted": S("Class deleted", "Clase borrada"),
});

const DEFAULTS = { memberships: [] };
const save = (fn) => setSlice("classroom", fn, DEFAULTS);
export const memberships = () => sliceOf("classroom", DEFAULTS).memberships;
export const who = (m) => ({ classId: m.classId, memberId: m.memberId, key: m.key });
const units = () => service("lessons", "units")() || [];
const tNow = () => makeT({ lang: getState().settings.lang, region: getState().settings.region });
const errorText = (t, e) => (e.code === "OFFLINE" ? t("account.offline") : e.message);
// Out of a class. Competing with "my class" and no class left → everyone.
function drop(m) {
  save((s) => ({ ...s, memberships: s.memberships.filter((x) => x.memberId !== m.memberId) }));
  const user = sessionNow().user;
  if (!memberships().length && user && user.league === "class") setLeague("everyone").catch(() => {});
}
// Lessons that count toward assignments: finished since joining, plus
// earlier ones if the student chose to count them.
const counted = (m) => new Set(Object.entries(getState().progress.lessons).filter(([, l]) => l.done && (m.shareEarlier || (l.last || l.at) >= m.joined)).map(([id]) => id));
const setMember = (m, patch) => save((s) => ({ ...s, memberships: s.memberships.map((x) => (x.memberId === m.memberId ? { ...x, ...patch } : x)) }));

// Each class gets this device's report a few seconds after a change. A
// class that's gone (left elsewhere, removed, deleted) is forgotten.
async function sendReports() {
  const today = dayKey();
  for (const m of memberships()) {
    const assignedLessons = units().filter((u) => (m.assigned || []).includes(u.id)).flatMap((u) => u.lessons.map((l) => l.id));
    const report = classReport(getState(), { ...m, assignedLessons }, today, service("lessons", "conceptsNow")() || {});
    const r = await api("/api/class/report", { method: "POST", body: { ...who(m), report } }).catch((e) => (e.status === 404 && (drop(m), toast(tNow()("cls.gone", { name: m.name }))), null));
    // Newly assigned units: the next report can count earlier lessons in them.
    if (r && r.assigned && r.assigned.join() !== (m.assigned || []).join()) setMember(m, { assigned: r.assigned });
  }
}

const Bullets = ({ items, icon, color }) => (
  <ul style={{ listStyle: "none", padding: 0, margin: "6px 0 12px" }}>
    {items.map((x) => (
      <li key={x} style={{ display: "flex", gap: 8, alignItems: "flex-start", fontSize: 15, lineHeight: 1.45, margin: "6px 0" }}>
        <Icon name={icon} size={18} color={color} />
        <span>{x}</span>
      </li>
    ))}
  </ul>
);
// Exactly what the teacher will and won't see — before joining, and any
// time after from the class.
function WhatTeacherSees({ t }) {
  return (
    <div>
      <div style={{ fontWeight: 700 }}>{t("cls.sees.yes")}</div>
      <Bullets icon="check" color="var(--accent)" items={["cls.sees.nick", "cls.sees.lessons", "cls.sees.missions", "cls.sees.assign", "cls.sees.concepts"].map((k) => t(k))} />
      <div style={{ fontWeight: 700 }}>{t("cls.sees.no")}</div>
      <Bullets icon="close" color="var(--mid)" items={["cls.sees.goals", "cls.sees.portfolio", "cls.sees.notes", "cls.sees.tutor", "cls.sees.age", "cls.sees.before"].map((k) => t(k))} />
      {["cls.sees.board", "cls.sees.leave", "cls.sees.messages"].map((k) => (
        <p key={k} style={{ fontSize: 14, color: "var(--mid)", lineHeight: 1.45, margin: "0 0 8px" }}>
          {t(k)}
        </p>
      ))}
    </div>
  );
}

const AGES = [["13-17", "13–17"], ["18-25", "18–25"], ["26+", null], ["under13", null]];
function JoinSheet({ t, go, initialCode, onClose }) {
  const profile = useAppState((s) => s.profile);
  const [code, setCode] = useState(initialCode || "");
  const [name, setName] = useState(null);
  const [nickname, setNickname] = useState(profile.nickname || "");
  const [age, setAge] = useState(profile.ageBand || "");
  const [shareEarlier, setShareEarlier] = useState(false);
  const [error, setError] = useState(null);
  const [busy, setBusy] = useState(false);
  const run = async (fn) => {
    setBusy(true);
    setError(null);
    try {
      await fn();
    } catch (e) {
      setError(errorText(t, e));
    } finally {
      setBusy(false);
    }
  };
  const lookup = () => run(async () => setName((await api("/api/class/lookup", { method: "POST", body: { code } })).name));
  useEffect(() => {
    if (initialCode) lookup();
  }, []);
  const join = () =>
    run(async () => {
      const base = conceptCounts(service("lessons", "conceptsNow")() || {});
      const r = await api("/api/class/join", { method: "POST", body: { code, nickname, ageBand: age } });
      save((s) => ({ ...s, memberships: [...s.memberships, { classId: r.classId, memberId: r.memberId, key: r.key, name: r.name, joined: r.joined, nickname: nickname.trim(), base, shareEarlier }] }));
      if (!profile.ageBand) update((s) => ({ ...s, profile: { ...s.profile, ageBand: age, ageAsked: true } }));
      sendReports();
      toast(t("cls.joined", { name: r.name }), "good");
      onClose();
      go("classroom");
    });
  return (
    <Sheet open onClose={onClose} title={name ? t("cls.sees.title") : t("cls.join")} tall={!!name}>
      {!name ? (
        <form onSubmit={(e) => (e.preventDefault(), lookup())}>
          <Field label={t("cls.code")} hint={t("cls.code.hint")} value={code} onChange={(e) => setCode(e.target.value.toUpperCase())} autoCapitalize="characters" autoComplete="off" required maxLength={12} />
          {error && <Note tone="bad" style={{ marginBottom: 12 }}>{error}</Note>}
          <Button full type="submit" disabled={busy || !code.trim()}>
            {t("common.continue")}
          </Button>
        </form>
      ) : (
        <form onSubmit={(e) => (e.preventDefault(), join())}>
          <div style={{ fontSize: 17, fontWeight: 700, margin: "0 0 10px" }}>{t("cls.sees.class", { name })}</div>
          <WhatTeacherSees t={t} />
          <Field label={t("cls.nick")} hint={t("cls.nick.hint")} value={nickname} onChange={(e) => setNickname(e.target.value.slice(0, 24))} maxLength={24} required autoComplete="nickname" />
          {!profile.ageBand && (
            <label style={{ display: "block", marginBottom: 14 }}>
              <span style={{ display: "block", fontSize: 14, fontWeight: 650, color: "var(--mid)", marginBottom: 6 }}>{t("onb.age.title")}</span>
              <select required value={age} onChange={(e) => setAge(e.target.value)} style={{ width: "100%", border: "1px solid var(--line)", borderRadius: 6, padding: "13px 12px", background: "var(--surface)", color: "var(--ink)", fontSize: 16 }}>
                <option value="" disabled>
                  {t("account.age.pick")}
                </option>
                {AGES.map(([v, label]) => (
                  <option key={v} value={v}>
                    {label || t(v === "26+" ? "onb.age.26" : "onb.age.under13")}
                  </option>
                ))}
              </select>
            </label>
          )}
          {age === "under13" && <Note tone="bad" icon="info" style={{ marginBottom: 12 }}>{t("cls.age.young")}</Note>}
          <label style={{ display: "flex", gap: 10, alignItems: "flex-start", fontSize: 15, lineHeight: 1.45, marginBottom: 14, cursor: "pointer" }}>
            <input type="checkbox" checked={shareEarlier} onChange={(e) => setShareEarlier(e.target.checked)} style={{ width: 20, height: 20, marginTop: 1, accentColor: "var(--brand)", flexShrink: 0 }} />
            <span>
              {t("cls.earlier")}
              <span style={{ display: "block", fontSize: 13, color: "var(--mid)" }}>{t("cls.earlier.sub")}</span>
            </span>
          </label>
          {error && <Note tone="bad" style={{ marginBottom: 12 }}>{error}</Note>}
          <Button full type="submit" disabled={busy || !nickname.trim() || !age || age === "under13"}>
            {t("cls.join.yes")}
          </Button>
        </form>
      )}
    </Sheet>
  );
}

// ---- a student's class -----------------------------------------------------------

function ClassCard({ t, locale, go, m }) {
  useAppState((s) => s.updatedAt);
  const [view, setView] = useState(null);
  const [sheet, setSheet] = useState(null);
  const [error, setError] = useState(null);
  const load = () =>
    api("/api/class/view", { method: "POST", body: who(m) }).then((v) => {
      setView(v);
      const assigned = v.assignments.map((a) => a.unit);
      if (assigned.join() !== (m.assigned || []).join()) setMember(m, { assigned });
    }, (e) => {
      if (e.status === 404) (drop(m), toast(t("cls.gone", { name: m.name })));
      else setError(errorText(t, e));
    });
  useEffect(() => {
    load();
  }, [m.memberId]);
  const done = counted(m);
  const leave = () =>
    api("/api/class/leave", { method: "POST", body: who(m) })
      .catch((e) => {
        if (e.status !== 404) throw e;
      })
      .then(() => (drop(m), toast(t("cls.left", { name: m.name }))), (e) => setError(errorText(t, e)));
  return (
    <Card style={{ marginTop: 12 }}>
      <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
        <Icon name="users" size={24} color="var(--mid)" />
        <div style={{ flex: 1, minWidth: 0, fontWeight: 750, fontSize: 18 }}>{(view && view.name) || m.name}</div>
      </div>
      {error && <Note tone="bad" style={{ marginTop: 10 }}>{error}</Note>}
      {view && view.status !== "ok" && <Note style={{ marginTop: 10 }}>{t(view.status === "ended" ? "cls.ended" : "cls.paused")}</Note>}
      {view && view.status === "ok" && (
        <>
          <Label>{t("cls.assigned")}</Label>
          {!view.assignments.length && <p style={{ fontSize: 14, color: "var(--mid)", margin: 0 }}>{t("cls.assigned.none")}</p>}
          {view.assignments.map((a) => {
            const u = units().find((x) => x.id === a.unit);
            if (!u) return null;
            const n = u.lessons.filter((l) => done.has(l.id)).length;
            const next = u.lessons.find((l) => !done.has(l.id));
            return (
              <div key={a.id} style={{ display: "flex", alignItems: "center", gap: 10, padding: "10px 0", borderTop: "1px solid var(--line)" }}>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ fontWeight: 650 }}>{text(u.title, locale)}</div>
                  <div style={{ fontSize: 14, color: "var(--mid)" }}>
                    {t("cls.due", { date: shortDate(a.due, locale) })} · {t("cls.progress", { done: n, of: u.lessons.length })}
                  </div>
                </div>
                {next ? (
                  <Button size="sm" kind="secondary" onClick={() => go("lessons", { lesson: next.id, assigned: true })}>
                    {t("cls.start")}
                  </Button>
                ) : (
                  <span style={{ fontSize: 14, fontWeight: 650, color: "var(--accent)" }}>{t("cls.finished")}</span>
                )}
              </div>
            );
          })}
          <Label>{t("cls.board")}</Label>
          {view.board.map((r, i) => (
            <div key={r.nickname} style={{ display: "flex", alignItems: "center", gap: 12, padding: "8px 0", borderTop: "1px solid var(--line)", fontWeight: r.you ? 650 : 500 }}>
              <span style={{ width: 22, textAlign: "center", color: "var(--low)", fontVariantNumeric: "tabular-nums" }}>{i + 1}</span>
              <span style={{ flex: 1, minWidth: 0, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{r.you ? t("league.you", { name: r.nickname }) : r.nickname}</span>
              <span style={{ color: "var(--mid)", fontVariantNumeric: "tabular-nums" }}>{r.xp} XP</span>
            </div>
          ))}
          <div style={{ display: "flex", alignItems: "center", gap: 12, paddingTop: 12, borderTop: "1px solid var(--line)" }}>
            <div style={{ flex: 1 }}>
              <div style={{ fontWeight: 650 }}>{t("cls.board.show")}</div>
              {view.hidden && <div style={{ fontSize: 14, color: "var(--mid)" }}>{t("cls.board.hidden")}</div>}
            </div>
            <Switch label={t("cls.board.show")} checked={!view.hidden} onChange={(v) => api("/api/class/hide", { method: "POST", body: { ...who(m), hidden: !v } }).then(load, (e) => setError(errorText(t, e)))} />
          </div>
          <div style={{ display: "flex", alignItems: "center", gap: 12, paddingTop: 12 }}>
            <div style={{ flex: 1 }}>
              <div style={{ fontWeight: 650 }}>{t("cls.earlier")}</div>
              <div style={{ fontSize: 14, color: "var(--mid)" }}>{t("cls.earlier.sub")}</div>
            </div>
            <Switch label={t("cls.earlier")} checked={!!m.shareEarlier} onChange={(v) => setMember(m, { shareEarlier: v })} />
          </div>
        </>
      )}
      <div style={{ display: "flex", gap: 8, flexWrap: "wrap", marginTop: 14 }}>
        <Button size="md" kind="secondary" onClick={() => setSheet("sees")}>
          {t("cls.what")}
        </Button>
        <Button size="md" kind="ghost" onClick={() => setSheet("leave")}>
          {t("cls.leave")}
        </Button>
      </div>
      <Sheet open={sheet === "sees"} onClose={() => setSheet(null)} title={t("cls.what")} tall>
        <WhatTeacherSees t={t} />
      </Sheet>
      <Sheet open={sheet === "leave"} onClose={() => setSheet(null)} title={t("cls.leave")}>
        <p style={{ fontSize: 16, lineHeight: 1.5, marginTop: 0 }}>{t("cls.leave.body", { name: m.name })}</p>
        <Button full kind="bad" onClick={() => (setSheet(null), leave())}>
          {t("cls.leave")}
        </Button>
      </Sheet>
    </Card>
  );
}

// ---- teachers ----------------------------------------------------------------------

function Teaching({ t, locale, go, session }) {
  const [data, setData] = useState(null);
  const [error, setError] = useState(null);
  const [open, setOpen] = useState(null);
  const [name, setName] = useState("");
  const [agree, setAgree] = useState(false);
  const [sent, setSent] = useState(false);
  const load = () => api("/api/teach").then(setData, (e) => setError(errorText(t, e)));
  useEffect(() => {
    if (session.user) load();
  }, [session.user && session.user.verified, session.user && session.user.teacherTerms]);
  const act = (p) => p.then(load, (e) => setError(errorText(t, e)));
  const guide = (
    <a href={locale.lang === "es" ? "/guia-docente.html" : "/teacher-guide.html"} target="_blank" rel="noopener" style={{ display: "inline-flex", alignItems: "center", gap: 6, color: "var(--sky)", fontWeight: 650, fontSize: 15, minHeight: 44 }}>
      <Icon name="book" size={18} /> {t("cls.t.guide")}
    </a>
  );
  if (!session.user)
    return (
      <Card>
        <p style={{ margin: "0 0 12px", color: "var(--mid)", lineHeight: 1.45 }}>{t("cls.t.account")}</p>
        <Button size="md" kind="secondary" onClick={() => go("settings")}>
          {t("account.signin")}
        </Button>
        <div style={{ marginTop: 8 }}>{guide}</div>
      </Card>
    );
  if (!data) return error ? <Note tone="bad">{error}</Note> : <Card><Loading label={t("common.loading")} /></Card>;
  if (open) return <ClassAdmin t={t} locale={locale} id={open} onBack={() => (setOpen(null), load())} />;
  const r = data.ready;
  return (
    <div>
      {error && <Note tone="bad" style={{ marginBottom: 10 }}>{error}</Note>}
      {!r.adult && <Note icon="info">{t("cls.t.adult")}</Note>}
      {r.adult && !r.verified && (
        <Card style={{ marginBottom: 10 }}>
          <div style={{ fontWeight: 650 }}>{t("cls.t.verify")}</div>
          <p style={{ fontSize: 14, color: "var(--mid)", lineHeight: 1.45, margin: "4px 0 12px" }}>{sent ? t("cls.t.verify.sent") : t("cls.t.verify.sub")}</p>
          <Button size="md" kind={sent ? "secondary" : "primary"} onClick={() => sendVerify(locale.lang).then(() => setSent(true), (e) => setError(errorText(t, e)))}>
            {t("cls.t.verify.send")}
          </Button>
        </Card>
      )}
      {r.adult && !r.terms && (
        <Card style={{ marginBottom: 10 }}>
          <div style={{ fontWeight: 650 }}>{t("cls.t.terms")}</div>
          <p style={{ fontSize: 14, color: "var(--mid)", lineHeight: 1.45, margin: "4px 0 6px" }}>{t("cls.t.terms.sub")}</p>
          <Button size="sm" kind="ghost" style={{ paddingLeft: 0 }} onClick={() => go("legal", { doc: "teacher", from: "classroom" })}>
            {t("cls.t.terms.read")}
          </Button>
          <label style={{ display: "flex", gap: 10, alignItems: "center", fontSize: 15, margin: "8px 0 12px", cursor: "pointer" }}>
            <input type="checkbox" checked={agree} onChange={(e) => setAgree(e.target.checked)} style={{ width: 20, height: 20, accentColor: "var(--brand)" }} />
            {t("cls.t.terms.agree")}
          </label>
          <Button size="md" disabled={!agree} onClick={() => acceptTeacherTerms().then(load, (e) => setError(errorText(t, e)))}>
            {t("cls.t.terms.yes")}
          </Button>
        </Card>
      )}
      {r.adult && r.verified && r.terms && (
        <Card style={{ marginBottom: 10 }}>
          <form onSubmit={(e) => (e.preventDefault(), act(api("/api/teach/classes", { method: "POST", body: { name } }).then(() => setName(""))))}>
            <Field label={t("cls.t.name")} hint={t("cls.t.name.hint")} value={name} onChange={(e) => setName(e.target.value)} maxLength={40} required />
            <Button size="md" type="submit" disabled={!name.trim()}>
              {t("cls.t.create")}
            </Button>
          </form>
        </Card>
      )}
      {data.classes.map((c) => (
        <Card key={c.id} onClick={() => setOpen(c.id)} style={{ marginBottom: 10, cursor: "pointer" }}>
          <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
            <div style={{ flex: 1, minWidth: 0 }}>
              <div style={{ fontWeight: 700 }}>{c.name}</div>
              <div style={{ fontSize: 14, color: "var(--mid)" }}>{c.archivedAt ? t("cls.t.archived", { date: shortDate(c.deletesOn, { ...locale, year: true }) }) : `${t("cls.t.students", { n: c.students })} · ${c.code}`}</div>
            </div>
            <Icon name="next" size={18} color="var(--low)" />
          </div>
        </Card>
      ))}
      {guide}
    </div>
  );
}

// One class, as its teacher sees it (server/classes.js teacherView: only
// nicknames and learning progress since joining).
function ClassAdmin({ t, locale, id, onBack }) {
  const [v, setV] = useState(null);
  const [error, setError] = useState(null);
  const [unit, setUnit] = useState("");
  const [due, setDue] = useState("");
  const [confirm, setConfirm] = useState(null);
  const load = () => api(`/api/teach/class?id=${encodeURIComponent(id)}`).then(setV, (e) => setError(errorText(t, e)));
  useEffect(() => {
    load();
  }, [id]);
  const act = (p, then) => p.then(() => (then && then(), load()), (e) => setError(errorText(t, e)));
  const patch = (body) => act(api("/api/teach/class", { method: "PATCH", body: { id, ...body } }));
  const back = (
    <button onClick={onBack} className="nv-press" style={{ display: "inline-flex", alignItems: "center", gap: 4, border: "none", background: "transparent", color: "var(--mid)", fontSize: 15, fontWeight: 600, padding: "10px 4px", marginLeft: -4, cursor: "pointer", minHeight: 44 }}>
      <Icon name="back" size={18} /> {t("cls.t.back")}
    </button>
  );
  if (!v) return <div>{back}{error ? <Note tone="bad">{error}</Note> : <Loading label={t("common.loading")} />}</div>;
  const all = units();
  const unitTitle = (u) => text((all.find((x) => x.id === u) || { title: { en: u } }).title, locale);
  const link = `${location.origin}/?join=${v.code}`;
  const cell = { padding: "8px 6px", borderTop: "1px solid var(--line)", fontSize: 14, textAlign: "left", fontVariantNumeric: "tabular-nums" };
  return (
    <div>
      {back}
      <h2 style={{ fontSize: 24, fontWeight: 700, letterSpacing: -0.4, margin: "4px 0 12px" }}>{v.name}</h2>
      {error && <Note tone="bad" style={{ marginBottom: 10 }}>{error}</Note>}
      {v.archivedAt ? (
        <Card>
          <p style={{ margin: "0 0 12px" }}>{t("cls.t.archived", { date: shortDate(v.deletesOn, { ...locale, year: true }) })}</p>
          <div style={{ display: "flex", gap: 8 }}>
            <Button size="md" kind="secondary" onClick={() => patch({ archived: false })}>
              {t("cls.t.restore")}
            </Button>
            <Button size="md" kind="ghost" onClick={() => setConfirm("delete")}>
              {t("cls.t.delete")}
            </Button>
          </div>
        </Card>
      ) : (
        <Card>
          <div style={{ fontSize: 13, color: "var(--mid)", fontWeight: 650 }}>{t("cls.code")}</div>
          <div aria-label={t("cls.code")} style={{ fontSize: 40, fontWeight: 750, letterSpacing: 6, fontVariantNumeric: "tabular-nums", margin: "2px 0 10px" }}>{v.code}</div>
          <div style={{ fontSize: 13, color: "var(--mid)", fontWeight: 650 }}>{t("cls.t.link")}</div>
          <div style={{ display: "flex", gap: 8, alignItems: "center", marginTop: 4 }}>
            <div style={{ flex: 1, minWidth: 0, padding: "10px 12px", borderRadius: 8, background: "var(--surface2)", fontSize: 14, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{link}</div>
            <Button size="md" kind="secondary" aria-label={t("inv.copy")} onClick={() => navigator.clipboard.writeText(link).then(() => toast(t("cls.t.copied"), "good"), () => {})}>
              <Icon name="copy" size={18} />
            </Button>
          </div>
          <div style={{ display: "flex", alignItems: "center", gap: 12, marginTop: 14 }}>
            <div style={{ flex: 1 }}>
              <div style={{ fontWeight: 650 }}>{t("cls.t.open")}</div>
              <div style={{ fontSize: 14, color: "var(--mid)" }}>{t("cls.t.open.sub")}</div>
            </div>
            <Switch label={t("cls.t.open")} checked={v.open} onChange={(open) => patch({ open })} />
          </div>
          <Button size="sm" kind="ghost" style={{ paddingLeft: 0, marginTop: 6 }} onClick={() => act(api("/api/teach/class", { method: "PATCH", body: { id, newCode: true } }), () => toast(t("cls.t.newcode.done"), "good"))}>
            {t("cls.t.newcode")}
          </Button>
        </Card>
      )}
      <Note icon="shield" style={{ marginTop: 12 }}>{t("cls.t.privacy")}</Note>

      <Label>{t("cls.assigned")}</Label>
      <Card>
        {v.assignments.map((a) => (
          <div key={a.id} style={{ display: "flex", alignItems: "center", gap: 10, padding: "8px 0", borderBottom: "1px solid var(--line)" }}>
            <div style={{ flex: 1, minWidth: 0 }}>
              <div style={{ fontWeight: 650 }}>{unitTitle(a.unit)}</div>
              <div style={{ fontSize: 14, color: "var(--mid)" }}>
                {t("cls.due", { date: shortDate(a.due, locale) })} · {t("cls.t.assign.done", { done: a.done, of: a.of })}
              </div>
            </div>
            <Button size="sm" kind="ghost" onClick={() => act(api("/api/teach/assign", { method: "DELETE", body: { id, assignment: a.id } }))}>
              {t("cls.t.remove")}
            </Button>
          </div>
        ))}
        {!v.archivedAt && (
          <form onSubmit={(e) => (e.preventDefault(), act(api("/api/teach/assign", { method: "POST", body: { id, unit, due } }), () => setUnit("")))} style={{ display: "flex", gap: 8, flexWrap: "wrap", alignItems: "flex-end", marginTop: 10 }}>
            <label style={{ flex: 2, minWidth: 160 }}>
              <span style={{ display: "block", fontSize: 14, fontWeight: 650, color: "var(--mid)", marginBottom: 6 }}>{t("cls.t.unit")}</span>
              <select required value={unit} onChange={(e) => setUnit(e.target.value)} style={{ width: "100%", border: "1px solid var(--line)", borderRadius: 6, padding: "12px", background: "var(--surface)", color: "var(--ink)", fontSize: 16 }}>
                <option value="" disabled>
                  {t("cls.t.unit")}
                </option>
                {all.map((u) => (
                  <option key={u.id} value={u.id}>
                    {text(u.title, locale)}
                  </option>
                ))}
              </select>
            </label>
            <label style={{ flex: 1, minWidth: 140 }}>
              <span style={{ display: "block", fontSize: 14, fontWeight: 650, color: "var(--mid)", marginBottom: 6 }}>{t("cls.t.due")}</span>
              <input type="date" required min={dayKey()} value={due} onChange={(e) => setDue(e.target.value)} style={{ width: "100%", border: "1px solid var(--line)", borderRadius: 6, padding: "11px 12px", background: "var(--surface)", color: "var(--ink)", fontSize: 16 }} />
            </label>
            <Button size="md" type="submit">
              {t("cls.t.assign")}
            </Button>
          </form>
        )}
      </Card>

      <Label>{t("cls.t.roster")}</Label>
      <Card pad={v.students.length ? 8 : 18}>
        {!v.students.length ? (
          <p style={{ margin: 0, color: "var(--mid)" }}>{t("cls.t.empty")}</p>
        ) : (
          <div style={{ overflowX: "auto" }}>
            <table style={{ width: "100%", borderCollapse: "collapse" }}>
              <thead>
                <tr>
                  {["", t("cls.t.col.lessons"), t("cls.t.col.units"), t("cls.t.col.missions"), ...v.assignments.map((a) => unitTitle(a.unit)), ""].map((h, i) => (
                    <th key={i} style={{ ...cell, borderTop: "none", color: "var(--mid)", fontWeight: 650 }}>
                      {h}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {v.students.map((s) => (
                  <tr key={s.id}>
                    <td style={{ ...cell, fontWeight: 650 }}>{s.nickname}</td>
                    <td style={cell}>{s.lessons}</td>
                    <td style={cell}>{s.units}</td>
                    <td style={cell}>{s.missions}</td>
                    {v.assignments.map((a) => (
                      <td key={a.id} style={cell}>
                        {s.assignments[a.id].done}/{s.assignments[a.id].of}
                      </td>
                    ))}
                    <td style={cell}>
                      <Button size="sm" kind="ghost" onClick={() => setConfirm({ student: s })}>
                        {t("cls.t.remove")}
                      </Button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </Card>

      <Label>{t("cls.t.hard")}</Label>
      <Card>
        {!v.concepts.length && <p style={{ margin: 0, color: "var(--mid)", fontSize: 14 }}>{t("cls.t.hard.none")}</p>}
        {v.concepts.map((c) => (
          <div key={c.id} style={{ padding: "6px 0" }}>
            <div style={{ fontWeight: 650 }}>{text(service("lessons", "conceptTitle")(c.id) || { en: c.id }, locale)}</div>
            <div style={{ fontSize: 14, color: "var(--mid)" }}>{t("cls.t.hard.row", { missed: c.missed, seen: c.seen, n: c.students })}</div>
          </div>
        ))}
      </Card>

      {!v.archivedAt && (
        <div style={{ marginTop: 18 }}>
          <Button size="md" kind="secondary" onClick={() => patch({ archived: true })}>
            {t("cls.t.archive")}
          </Button>
          <p style={{ fontSize: 13, color: "var(--low)", margin: "8px 0 0" }}>{t("cls.t.archive.sub")}</p>
        </div>
      )}
      <Sheet open={!!(confirm && confirm.student)} onClose={() => setConfirm(null)} title={t("cls.t.remove")}>
        <p style={{ fontSize: 16, lineHeight: 1.5, marginTop: 0 }}>{confirm && confirm.student && t("cls.t.remove.student", { name: confirm.student.nickname })}</p>
        <Button full kind="bad" onClick={() => act(api("/api/teach/student", { method: "DELETE", body: { id, student: confirm.student.id } }), () => setConfirm(null))}>
          {t("cls.t.remove")}
        </Button>
      </Sheet>
      <Sheet open={confirm === "delete"} onClose={() => setConfirm(null)} title={t("cls.t.delete")}>
        <p style={{ fontSize: 16, lineHeight: 1.5, marginTop: 0 }}>{t("cls.t.delete.body", { name: v.name })}</p>
        <Button full kind="bad" onClick={() => api("/api/teach/class", { method: "DELETE", body: { id } }).then(() => (toast(t("cls.t.deleted")), onBack()), (e) => setError(errorText(t, e)))}>
          {t("cls.t.delete")}
        </Button>
      </Sheet>
    </div>
  );
}

// ---- the screen, and what's always running ------------------------------------------

export function Screen(ctx) {
  const { t, session } = ctx;
  const s = useSlice("classroom", DEFAULTS);
  const [joining, setJoining] = useState(false);
  const on = !!session.flags.classroom;
  return (
    <div>
      <Title>{t("cls.nav")}</Title>
      {s.memberships.map((m) => (
        <ClassCard key={m.memberId} {...ctx} m={m} />
      ))}
      {!s.memberships.length && !on && <Note icon="info">{t("cls.none")}</Note>}
      {on && (
        <>
          <Label style={{ marginTop: s.memberships.length ? 30 : 4 }}>{t("cls.t.title")}</Label>
          <Teaching {...ctx} />
          <Button kind="secondary" size="md" style={{ marginTop: 24 }} onClick={() => setJoining(true)}>
            <Icon name="plus" size={18} /> {t("cls.join")}
          </Button>
        </>
      )}
      {joining && <JoinSheet {...ctx} onClose={() => setJoining(false)} />}
    </div>
  );
}

// A teacher's join link (?join=CODE) opens the join screen (after
// onboarding, for someone new), and reports go out after each change.
export function Overlay(ctx) {
  const [code, setCode] = useState(() => new URLSearchParams(location.search).get("join"));
  useEffect(() => {
    if (!code) return;
    const q = new URLSearchParams(location.search);
    q.delete("join");
    history.replaceState(null, "", location.pathname + (q.size ? `?${q}` : ""));
  }, []);
  const updatedAt = useAppState((s) => s.updatedAt);
  const n = useSlice("classroom", DEFAULTS).memberships.length;
  useEffect(() => {
    if (!n) return;
    const timer = setTimeout(sendReports, 5000);
    return () => clearTimeout(timer);
  }, [updatedAt, n]);
  return code ? <JoinSheet {...ctx} initialCode={code} onClose={() => setCode(null)} /> : null;
}
