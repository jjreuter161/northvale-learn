// CLASSROOM MODE — classes for schools and clubs, behind the "classroom"
// feature flag (server/flags.js: off until a lawyer has reviewed it). The
// pilot uses its simple version (docs/SCHOOL-PLAN.md, below the strings).
// Students join with a class code or the teacher's link (?join=CODE) and a
// nickname — no account needed — after a screen that says exactly what the
// teacher will and won't see; their device then sends a short report
// (report.js). Teachers (adults with an account, email confirmed, teacher
// terms accepted) see class progress and assign units. No messages of any
// kind. The rules are enforced on the server (server/classes.js).
import { Suspense, lazy, useEffect, useState } from "react";
import { service } from "../../core/registry.js";
import { getState, setSlice, slice as sliceOf, update, useAppState, useSlice } from "../../core/store.js";
import { addStrings, makeT, shortDate, text } from "../../core/i18n.js";
import { api } from "../../core/api.js";
import { dayKey } from "../../core/progress.js";
import { sendVerify, acceptTeacherTerms, sessionNow, setLeague, signUp } from "../../core/session.js";
import { Button, Card, Field, Icon, Label, Loading, Note, Sheet, Switch, Title, toast } from "../../core/ui.jsx";
import { useLayout } from "../../core/layout.js";
import Legal from "../../core/Legal.jsx";
import { classReport } from "./report.js";

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

// The pilot's simple version (docs/SCHOOL-PLAN.md): one list for the teacher, a short join screen, no leaderboard,
// assignments or topic totals on screen, and a report that says only which lessons were finished.
addStrings({
  "cls.sees.nick2": S("Your nickname", "Tu apodo"),
  "cls.sees.lessons2": S("Which lessons you finish from now on", "Qué lecciones terminas desde ahora"),
  "cls.sees.never": S("Never", "Nunca"),
  "cls.sees.private": S("Your goals, amounts or notes", "Tus metas, cantidades ni notas"),
  "cls.sees.short": S("No messages. Leave anytime; your progress stays yours.", "Sin mensajes. Sal cuando quieras; tu avance sigue siendo tuyo."),
  "cls.mine.sub": S("Your teacher sees which lessons you finish, nothing else.", "Tu profe ve qué lecciones terminas, nada más."),
  "cls.leave.keep": S("Leave {name}? Your teacher will no longer see anything about you. You keep all your lessons and progress.", "¿Salir de {name}? Tu profe ya no verá nada sobre ti. Conservas todas tus lecciones y tu avance."),
  "cls.none2": S("When your teacher gives you a class code, join here.", "Cuando tu profe te dé un código de clase, únete aquí."),
  "cls.t.notyet": S("Classroom mode isn't on for your account yet. During the pilot, Northvale turns it on for each teacher.", "El modo clase aún no está activado en tu cuenta. Durante el piloto, Northvale lo activa para cada docente."),
  "cls.t.how": S("Students tap “Join a class” and type the code, or open the link.", "Los estudiantes tocan “Únete a una clase” y escriben el código, o abren el enlace."),
  "cls.t.copylink": S("Copy join link", "Copiar enlace para unirse"),
  "cls.t.who": S("Who finished which lessons", "Quién terminó qué lecciones"),
  "cls.t.notyet.lessons": S("No lessons yet", "Aún sin lecciones"),
  "cls.t.n.lessons": S("{n} {n|lesson|lessons}", "{n} {n|lección|lecciones}"),
  "cls.t.unit.row": S("{unit}: {done} of {of} lessons", "{unit}: {done} de {of} lecciones"),
  "cls.t.col.nick": S("Nickname", "Apodo"),
  "cls.t.cell.done": S("{lesson}: finished", "{lesson}: terminada"),
  "cls.t.cell.not": S("{lesson}: not yet", "{lesson}: todavía no"),
  "cls.t.units.note": S("A unit shows once someone in the class starts it.", "Una unidad aparece cuando alguien de la clase la empieza."),
  "cls.t.privacy2": S("You see nicknames and finished lessons, nothing else: never goals, amounts, notes, tutor questions, age or email.", "Ves apodos y lecciones terminadas, nada más: nunca metas, cantidades, notas, preguntas al tutor, edad ni correo."),
  "cls.t.free": S("Free during the pilot. No ads, ever. Student data is never sold or shared.", "Gratis durante el piloto. Nunca hay anuncios. Los datos de estudiantes nunca se venden ni se comparten."),
  "cls.t.settings": S("Class settings", "Ajustes de la clase"),
  "cls.t.remove.who": S("Remove a student", "Quitar a un estudiante"),
  "cls.t.end": S("End the class", "Terminar la clase"),
  "cls.t.end.sub": S("Students can no longer use it, and it's deleted for good 90 days later. Their own progress stays theirs.", "Los estudiantes ya no pueden usarla y se borra por completo 90 días después. Su avance sigue siendo suyo."),
  // The teacher setup at the start
  "cls.setup.email": S("Email", "Correo"),
  "cls.setup.password": S("Password", "Contraseña"),
  "cls.setup.age": S("Your age", "Tu edad"),
  "cls.setup.free": S("Free during the pilot. No ads, ever.", "Gratis durante el piloto. Nunca hay anuncios."),
  "cls.setup.data": S("We never sell or share student data.", "Nunca vendemos ni compartimos datos de estudiantes."),
  "cls.setup.nick": S("Students use nicknames. You see which lessons they finish, nothing else.", "Los estudiantes usan apodos. Ves qué lecciones terminan, nada más."),
  "cls.setup.create": S("Create account", "Crear cuenta"),
  "cls.setup.next": S("Next: confirm your email, then name your class.", "Después: confirma tu correo y ponle nombre a tu clase."),
  "cls.setup.signin": S("I already have an account", "Ya tengo una cuenta"),
  // (The pilot cards on a student's class; the rest of the pilot's words are in Pilot.jsx.)
  "cls.q.card": S("Class quiz: {n} questions, about {min} minutes", "Cuestionario de la clase: {n} preguntas, unos {min} minutos"),
  "cls.q.card.sub": S("Your teacher sees class totals only, never your score.", "Tu profe ve solo los totales de la clase, nunca tu resultado."),
  "cls.q.start": S("Start the quiz", "Empezar el cuestionario"),
  "cls.f.card": S("A few questions about the pilot", "Unas preguntas sobre el piloto"),
  "cls.f.card.sub": S("Three taps, and a box if you want to say more.", "Tres toques, y un espacio si quieres decir algo más."),
  "cls.f.open": S("Answer", "Responder"),
});

const DEFAULTS = { memberships: [] };
const save = (fn) => setSlice("classroom", fn, DEFAULTS);
// The pilot's screens (Pilot.jsx) load only when needed.
const pilotPart = (name) => lazy(() => import("./Pilot.jsx").then((m) => ({ default: m[name] })));
const PilotCard = pilotPart("PilotCard");
const QuizSheet = pilotPart("QuizSheet");
const FeedbackSheet = pilotPart("FeedbackSheet");
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

// Each class gets this device's report a few seconds after a change: only the lessons finished since joining
// (report.js can say more, but the pilot's simple version doesn't collect it). A class that's gone (left
// elsewhere, removed, deleted) is forgotten.
async function sendReports() {
  const today = dayKey();
  for (const m of memberships()) {
    const { lessons } = classReport(getState(), m, today, {});
    await api("/api/class/report", { method: "POST", body: { ...who(m), report: { lessons } } }).catch((e) => (e.status === 404 && (drop(m), toast(tNow()("cls.gone", { name: m.name }))), null));
  }
}

const Bullets = ({ items, icon, color }) => (
  <ul style={{ listStyle: "none", padding: 0, margin: "4px 0 10px" }}>
    {items.map((x) => (
      <li key={x} style={{ display: "flex", gap: 8, alignItems: "flex-start", fontSize: 15, lineHeight: 1.45, margin: "5px 0" }}>
        <Icon name={icon} size={18} color={color} />
        <span>{x}</span>
      </li>
    ))}
  </ul>
);
// Exactly what the teacher will and won't see: before joining, and any time after from the class.
function WhatTeacherSees({ t }) {
  return (
    <Card pad={14} style={{ marginBottom: 14 }}>
      <div style={{ fontWeight: 700 }}>{t("cls.sees.yes")}</div>
      <Bullets icon="check" color="var(--ink)" items={[t("cls.sees.nick2"), t("cls.sees.lessons2")]} />
      <div style={{ fontWeight: 700 }}>{t("cls.sees.never")}</div>
      <Bullets icon="close" color="var(--mid)" items={[t("cls.sees.private"), t("cls.sees.tutor"), t("cls.sees.age")]} />
      <p style={{ fontSize: 14, color: "var(--mid)", lineHeight: 1.45, margin: 0 }}>{t("cls.sees.short")}</p>
    </Card>
  );
}

const AGES = [["13-17", "13–17"], ["18-25", "18–25"], ["26+", null], ["under13", null]];
function JoinSheet({ t, go, initialCode, onClose }) {
  const profile = useAppState((s) => s.profile);
  const [code, setCode] = useState(initialCode || "");
  const [name, setName] = useState(null);
  const [nickname, setNickname] = useState(profile.nickname || "");
  const [age, setAge] = useState(profile.ageBand || "");
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
      const r = await api("/api/class/join", { method: "POST", body: { code, nickname, ageBand: age } });
      // (Signed in: the server linked the class to the account already.)
      save((s) => ({ ...s, memberships: [...s.memberships, { classId: r.classId, memberId: r.memberId, key: r.key, name: r.name, joined: r.joined, nickname: nickname.trim(), linked: !!sessionNow().user }] }));
      if (!profile.ageBand) update((s) => ({ ...s, profile: { ...s.profile, ageBand: age, ageAsked: true } }));
      if (!profile.role) update((s) => ({ ...s, profile: { ...s.profile, role: "student" } }));
      sendReports();
      toast(t("cls.joined", { name: r.name }), "good");
      onClose();
      go("classroom");
    });
  return (
    <Sheet open onClose={onClose} title={t("cls.join")} tall={!!name}>
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
          <div style={{ display: "flex", alignItems: "center", gap: 6, fontSize: 17, fontWeight: 700, margin: "0 0 12px" }}>
            <Icon name="check" size={18} /> {t("cls.sees.class", { name })}
          </div>
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

function ClassCard({ t, locale, m }) {
  const [view, setView] = useState(null);
  const [sheet, setSheet] = useState(null);
  const [error, setError] = useState(null);
  const load = () =>
    api("/api/class/view", { method: "POST", body: who(m) }).then(setView, (e) => {
      if (e.status === 404) (drop(m), toast(t("cls.gone", { name: m.name })));
      else setError(errorText(t, e));
    });
  useEffect(() => {
    load();
  }, [m.memberId]);
  const quiz = view && view.status === "ok" && view.quiz && !view.quiz.taken && view.quiz.questions && view.quiz.questions.length ? view.quiz : null;
  const askFeedback = view && view.feedback && !view.feedback.given;
  const leave = () =>
    api("/api/class/leave", { method: "POST", body: who(m) })
      .catch((e) => {
        if (e.status !== 404) throw e;
      })
      .then(() => (drop(m), toast(t("cls.left", { name: m.name }))), (e) => setError(errorText(t, e)));
  return (
    <Card style={{ marginTop: 12 }}>
      <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
        <span style={{ width: 40, height: 40, borderRadius: 8, background: "var(--surface2)", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
          <Icon name="users" size={20} />
        </span>
        <div style={{ flex: 1, minWidth: 0 }}>
          <div style={{ fontWeight: 750, fontSize: 18 }}>{(view && view.name) || m.name}</div>
          <div style={{ fontSize: 14, color: "var(--mid)" }}>{t("cls.mine.sub")}</div>
        </div>
      </div>
      {error && <Note tone="bad" style={{ marginTop: 10 }}>{error}</Note>}
      {view && view.status !== "ok" && <Note style={{ marginTop: 10 }}>{t(view.status === "ended" ? "cls.ended" : "cls.paused")}</Note>}
      {quiz && (
        <div style={{ marginTop: 14, padding: 14, borderRadius: 10, background: "var(--surface2)" }}>
          <div style={{ fontWeight: 700 }}>{t("cls.q.card", { n: quiz.questions.length, min: Math.max(2, Math.ceil(quiz.questions.length / 2)) })}</div>
          <div style={{ fontSize: 14, color: "var(--mid)", margin: "2px 0 10px" }}>{t("cls.q.card.sub")}</div>
          <Button size="md" onClick={() => setSheet("quiz")}>
            {t("cls.q.start")}
          </Button>
        </div>
      )}
      {!quiz && askFeedback && (
        <div style={{ marginTop: 14, padding: 14, borderRadius: 10, background: "var(--surface2)" }}>
          <div style={{ fontWeight: 700 }}>{t("cls.f.card")}</div>
          <div style={{ fontSize: 14, color: "var(--mid)", margin: "2px 0 10px" }}>{t("cls.f.card.sub")}</div>
          <Button size="md" onClick={() => setSheet("feedback")}>
            {t("cls.f.open")}
          </Button>
        </div>
      )}
      <Suspense fallback={null}>
        {sheet === "quiz" && quiz && <QuizSheet t={t} locale={locale} m={m} quiz={quiz} onClose={() => setSheet(null)} onDone={() => (setSheet(null), load())} />}
        {sheet === "feedback" && <FeedbackSheet t={t} m={m} onClose={() => setSheet(null)} onDone={() => (setSheet(null), load())} />}
      </Suspense>
      <div style={{ display: "flex", gap: 8, flexWrap: "wrap", marginTop: 14 }}>
        <Button size="md" kind="secondary" onClick={() => setSheet("sees")}>
          {t("cls.what")}
        </Button>
        <Button size="md" kind="ghost" onClick={() => setSheet("leave")}>
          {t("cls.leave")}
        </Button>
      </div>
      <Sheet open={sheet === "sees"} onClose={() => setSheet(null)} title={t("cls.what")}>
        <WhatTeacherSees t={t} />
      </Sheet>
      <Sheet open={sheet === "leave"} onClose={() => setSheet(null)} title={t("cls.leave")}>
        <p style={{ fontSize: 16, lineHeight: 1.5, marginTop: 0 }}>{t("cls.leave.keep", { name: m.name })}</p>
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
        <Button size="md" kind="secondary" onClick={() => go("settings", { section: "account" })}>
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
          <form onSubmit={(e) => (e.preventDefault(), act(api("/api/teach/classes", { method: "POST", body: { name } }).then((c) => (setName(""), c && c.id && setOpen(c.id)))))}>
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
      <Note icon="shield" style={{ marginTop: 4, marginBottom: 6 }}>{t("cls.t.free")}</Note>
      {guide}
    </div>
  );
}

// WHO FINISHED WHICH LESSONS — the one list. Units appear once anyone in the class has started them. On a phone:
// a row per student with a dot per lesson; on a computer: a table, a column per lesson under its unit.
function Progress({ t, locale, students, wide }) {
  const all = units();
  const started = all.filter((u) => students.some((s) => u.lessons.some((l) => s.done.includes(l.id))));
  if (!students.length) return <Card><p style={{ margin: 0, color: "var(--mid)" }}>{t("cls.t.empty")}</p></Card>;
  const title = (x) => text(x.title, locale);
  if (wide)
    return (
      <Card pad={8}>
        <div style={{ overflowX: "auto" }}>
          <table data-progress="" style={{ width: "100%", borderCollapse: "collapse", fontSize: 14 }}>
            <thead>
              <tr>
                <th scope="col" rowSpan={2} style={{ textAlign: "left", padding: "8px 10px", color: "var(--mid)", fontWeight: 650, borderBottom: "1px solid var(--line)" }}>{t("cls.t.col.nick")}</th>
                {started.map((u) => (
                  <th key={u.id} scope="colgroup" colSpan={u.lessons.length} style={{ padding: "8px 6px 0", fontWeight: 700, color: "var(--ink)" }}>{title(u)}</th>
                ))}
                <th scope="col" rowSpan={2} style={{ padding: "8px 10px", color: "var(--mid)", fontWeight: 650, borderBottom: "1px solid var(--line)" }}>{t("cls.t.col.lessons")}</th>
              </tr>
              <tr>
                {started.flatMap((u) => u.lessons.map((l, i) => (
                  <th key={l.id} scope="col" title={title(l)} style={{ padding: "4px 6px 8px", color: "var(--mid)", fontWeight: 600, borderBottom: "1px solid var(--line)" }}>{i + 1}</th>
                )))}
              </tr>
            </thead>
            <tbody>
              {students.map((s) => (
                <tr key={s.id}>
                  <th scope="row" style={{ textAlign: "left", padding: "10px", fontWeight: 700, borderBottom: "1px solid var(--line)" }}>{s.nickname}</th>
                  {started.flatMap((u) => u.lessons.map((l) => {
                    const done = s.done.includes(l.id);
                    return (
                      <td key={l.id} aria-label={t(done ? "cls.t.cell.done" : "cls.t.cell.not", { lesson: title(l) })} style={{ textAlign: "center", padding: "10px 6px", borderBottom: "1px solid var(--line)", color: done ? "var(--ink)" : "var(--line)", fontWeight: 800 }}>
                        {done ? "✓" : "·"}
                      </td>
                    );
                  }))}
                  <td style={{ textAlign: "center", padding: "10px", borderBottom: "1px solid var(--line)", fontVariantNumeric: "tabular-nums" }}>{s.done.length}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Card>
    );
  return (
    <div data-progress="" style={{ background: "var(--surface)", borderRadius: 12, boxShadow: "var(--lift)", overflow: "hidden" }}>
      {students.map((s, i) => (
        <div key={s.id} style={{ padding: "12px 16px", borderTop: i ? "1px solid var(--line)" : "none" }}>
          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: 10 }}>
            <span style={{ fontWeight: 700, fontSize: 16, minWidth: 0, overflowWrap: "anywhere" }}>{s.nickname}</span>
            <span style={{ fontSize: 14, color: "var(--mid)", flexShrink: 0 }}>{s.done.length ? t("cls.t.n.lessons", { n: s.done.length }) : t("cls.t.notyet.lessons")}</span>
          </div>
          {!!s.done.length && (
            <div style={{ display: "flex", flexWrap: "wrap", gap: "4px 14px", marginTop: 6 }}>
              {started.filter((u) => u.lessons.some((l) => s.done.includes(l.id))).map((u) => {
                const n = u.lessons.filter((l) => s.done.includes(l.id)).length;
                return (
                  <span key={u.id} role="img" aria-label={t("cls.t.unit.row", { unit: title(u), done: n, of: u.lessons.length })} style={{ display: "inline-flex", alignItems: "center", gap: 6, fontSize: 13, color: "var(--mid)" }}>
                    {title(u)}
                    <span aria-hidden="true" style={{ display: "inline-flex", gap: 3 }}>
                      {u.lessons.map((l) => (
                        <span key={l.id} style={{ width: 9, height: 9, borderRadius: 5, border: "1.5px solid var(--ink)", background: s.done.includes(l.id) ? "var(--ink)" : "transparent" }} />
                      ))}
                    </span>
                  </span>
                );
              })}
            </div>
          )}
        </div>
      ))}
    </div>
  );
}

// One class, as its teacher sees it (server/classes.js teacherView: only nicknames and the lessons each
// student finished since joining).
function ClassAdmin({ t, locale, id, onBack }) {
  const wide = useLayout() !== "phone";
  const [v, setV] = useState(null);
  const [error, setError] = useState(null);
  const [sheet, setSheet] = useState(null);
  const load = () => api(`/api/teach/class?id=${encodeURIComponent(id)}`).then(setV, (e) => setError(errorText(t, e)));
  useEffect(() => {
    load();
  }, [id]);
  const act = (p, then) => p.then(() => (then && then(), load()), (e) => setError(errorText(t, e)));
  const patch = (body, then) => act(api("/api/teach/class", { method: "PATCH", body: { id, ...body } }), then);
  const back = (
    <button onClick={onBack} className="nv-press" style={{ display: "inline-flex", alignItems: "center", gap: 4, border: "none", background: "transparent", color: "var(--mid)", fontSize: 15, fontWeight: 600, padding: "10px 4px", marginLeft: -4, cursor: "pointer", minHeight: 44 }}>
      <Icon name="back" size={18} /> {t("cls.t.back")}
    </button>
  );
  if (!v) return <div>{back}{error ? <Note tone="bad">{error}</Note> : <Loading label={t("common.loading")} />}</div>;
  const link = `${location.origin}/?join=${v.code}`;
  const codeCard = (
    <Card>
      <div style={{ fontSize: 13, color: "var(--mid)", fontWeight: 650 }}>{t("cls.code")}</div>
      <div aria-label={t("cls.code")} style={{ fontSize: 40, fontWeight: 750, letterSpacing: 6, fontVariantNumeric: "tabular-nums", margin: "2px 0 10px" }}>{v.code}</div>
      <Button size="md" kind="secondary" full onClick={() => navigator.clipboard.writeText(link).then(() => toast(t("cls.t.copied"), "good"), () => toast(link))}>
        <Icon name="copy" size={18} /> {t("cls.t.copylink")}
      </Button>
      <p style={{ fontSize: 14, color: "var(--mid)", lineHeight: 1.45, margin: "10px 0 0" }}>{t("cls.t.how")}</p>
    </Card>
  );
  const list = (
    <div>
      <Label style={{ marginTop: wide ? 0 : 20 }}>
        {t("cls.t.who")} <span style={{ fontWeight: 500, color: "var(--mid)" }}>· {t("cls.t.students", { n: v.students.length })}</span>
      </Label>
      <Progress t={t} locale={locale} students={v.students} wide={wide} />
      <p style={{ fontSize: 13, color: "var(--low)", lineHeight: 1.45, margin: "10px 2px 0" }}>
        {t("cls.t.units.note")} {t("cls.t.privacy2")}
      </p>
      <Suspense fallback={<Loading label={t("common.loading")} />}>
        <PilotCard t={t} locale={locale} v={v} patch={patch} />
      </Suspense>
    </div>
  );
  const settings = (
    <Button size="md" kind="secondary" full style={{ marginTop: 12 }} onClick={() => setSheet("settings")}>
      <Icon name="settings" size={18} /> {t("cls.t.settings")}
    </Button>
  );
  return (
    <div>
      {back}
      <h2 className="nv-disp" style={{ fontSize: 26, letterSpacing: -0.4, margin: "4px 0 12px" }}>{v.name}</h2>
      {error && <Note tone="bad" style={{ marginBottom: 10 }}>{error}</Note>}
      {v.archivedAt ? (
        <Card>
          <p style={{ margin: "0 0 12px" }}>{t("cls.t.archived", { date: shortDate(v.deletesOn, { ...locale, year: true }) })}</p>
          <div style={{ display: "flex", gap: 8 }}>
            <Button size="md" kind="secondary" onClick={() => patch({ archived: false })}>
              {t("cls.t.restore")}
            </Button>
            <Button size="md" kind="ghost" onClick={() => setSheet("delete")}>
              {t("cls.t.delete")}
            </Button>
          </div>
        </Card>
      ) : wide ? (
        <div style={{ display: "flex", gap: 28, alignItems: "flex-start" }}>
          <div style={{ flex: 1, minWidth: 0 }}>{list}</div>
          <div style={{ width: 320, flexShrink: 0 }}>
            {codeCard}
            {settings}
            <Note icon="shield" style={{ marginTop: 12 }}>{t("cls.t.free")}</Note>
          </div>
        </div>
      ) : (
        <>
          {codeCard}
          {list}
          {settings}
          <Note icon="shield" style={{ marginTop: 12 }}>{t("cls.t.free")}</Note>
        </>
      )}
      <Sheet open={sheet === "settings"} onClose={() => setSheet(null)} title={t("cls.t.settings")} tall>
        <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
          <div style={{ flex: 1 }}>
            <div style={{ fontWeight: 650 }}>{t("cls.t.open")}</div>
            <div style={{ fontSize: 14, color: "var(--mid)" }}>{t("cls.t.open.sub")}</div>
          </div>
          <Switch label={t("cls.t.open")} checked={v.open} onChange={(open) => patch({ open })} />
        </div>
        <Button size="md" kind="secondary" style={{ marginTop: 14 }} onClick={() => patch({ newCode: true }, () => toast(t("cls.t.newcode.done"), "good"))}>
          {t("cls.t.newcode")}
        </Button>
        {!!v.students.length && (
          <>
            <Label>{t("cls.t.remove.who")}</Label>
            {v.students.map((s) => (
              <div key={s.id} style={{ display: "flex", alignItems: "center", gap: 10, padding: "4px 0", borderTop: "1px solid var(--line)" }}>
                <span style={{ flex: 1, fontWeight: 650, overflowWrap: "anywhere" }}>{s.nickname}</span>
                <Button size="sm" kind="ghost" onClick={() => setSheet({ student: s })}>
                  {t("cls.t.remove")}
                </Button>
              </div>
            ))}
          </>
        )}
        <Label>{t("cls.t.end")}</Label>
        <p style={{ fontSize: 14, color: "var(--mid)", lineHeight: 1.45, margin: "0 0 10px" }}>{t("cls.t.end.sub")}</p>
        <Button size="md" kind="secondary" onClick={() => patch({ archived: true }, () => setSheet(null))}>
          {t("cls.t.end")}
        </Button>
      </Sheet>
      <Sheet open={!!(sheet && sheet.student)} onClose={() => setSheet(null)} title={t("cls.t.remove")}>
        <p style={{ fontSize: 16, lineHeight: 1.5, marginTop: 0 }}>{sheet && sheet.student && t("cls.t.remove.student", { name: sheet.student.nickname })}</p>
        <Button full kind="bad" onClick={() => act(api("/api/teach/student", { method: "DELETE", body: { id, student: sheet.student.id } }), () => setSheet(null))}>
          {t("cls.t.remove")}
        </Button>
      </Sheet>
      <Sheet open={sheet === "delete"} onClose={() => setSheet(null)} title={t("cls.t.delete")}>
        <p style={{ fontSize: 16, lineHeight: 1.5, marginTop: 0 }}>{t("cls.t.delete.body", { name: v.name })}</p>
        <Button full kind="bad" onClick={() => api("/api/teach/class", { method: "DELETE", body: { id } }).then(() => (toast(t("cls.t.deleted")), onBack()), (e) => setError(errorText(t, e)))}>
          {t("cls.t.delete")}
        </Button>
      </Sheet>
    </div>
  );
}

// ---- the teacher setup at the start ----------------------------------------------------

// After "I'm a teacher": an account, the teacher's age band (adults only), the teacher terms and what the
// school gets, on one screen. Then the email to confirm, and the class to name (Teaching, above).
export function TeacherSetup({ t, locale, onDone, onSignIn }) {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [age, setAge] = useState("");
  const [agree, setAgree] = useState(false);
  const [terms, setTerms] = useState(false);
  const [error, setError] = useState(null);
  const [busy, setBusy] = useState(false);
  const submit = async (e) => {
    e.preventDefault();
    setBusy(true);
    setError(null);
    try {
      await signUp({ email, password, ageBand: age, teacher: true });
      update((s) => ({ ...s, profile: { ...s.profile, role: "teacher", ageBand: age, ageAsked: true } }));
      await sendVerify(locale.lang).catch(() => {});
      onDone();
    } catch (err) {
      setError(errorText(t, err));
      setBusy(false);
    }
  };
  const chip = (on) => ({ flex: 1, minHeight: 48, borderRadius: 8, fontSize: 15, fontWeight: 650, cursor: "pointer", color: "var(--ink)", background: on ? "var(--surface2)" : "var(--surface)", border: on ? "2px solid var(--ink)" : "1px solid var(--line)" });
  return (
    <form onSubmit={submit} style={{ display: "flex", flexDirection: "column", flex: 1 }}>
      <Field label={t("cls.setup.email")} type="email" value={email} onChange={(e) => setEmail(e.target.value)} autoComplete="email" required />
      <Field label={t("cls.setup.password")} type="password" value={password} onChange={(e) => setPassword(e.target.value)} autoComplete="new-password" required minLength={10} hint={t("account.password.hint")} />
      <div role="radiogroup" aria-label={t("cls.setup.age")} style={{ marginBottom: 14 }}>
        <span style={{ display: "block", fontSize: 14, fontWeight: 650, color: "var(--mid)", marginBottom: 6 }}>{t("cls.setup.age")}</span>
        <div style={{ display: "flex", gap: 8 }}>
          {[["18-25", "18–25"], ["26+", t("onb.age.26")]].map(([v, label]) => (
            <button key={v} type="button" role="radio" aria-checked={age === v} onClick={() => setAge(v)} style={chip(age === v)}>
              {label}
            </button>
          ))}
        </div>
      </div>
      <label style={{ display: "flex", gap: 10, alignItems: "center", fontSize: 15, margin: "0 0 4px", cursor: "pointer", minHeight: 44 }}>
        <input type="checkbox" checked={agree} onChange={(e) => setAgree(e.target.checked)} style={{ width: 22, height: 22, accentColor: "var(--brand)", flexShrink: 0 }} />
        {t("cls.t.terms.agree")}
      </label>
      <Button size="sm" kind="ghost" style={{ alignSelf: "flex-start", paddingLeft: 0, marginBottom: 8 }} onClick={() => setTerms(true)}>
        {t("cls.t.terms.read")}
      </Button>
      <Note icon="shield" style={{ marginBottom: 16 }}>
        <ul style={{ margin: 0, paddingLeft: 18, lineHeight: 1.45 }}>
          <li>{t("cls.setup.free")}</li>
          <li>{t("cls.setup.data")}</li>
          <li>{t("cls.setup.nick")}</li>
        </ul>
      </Note>
      {error && <Note tone="bad" style={{ marginBottom: 12 }}>{error}</Note>}
      <div style={{ flex: 1 }} />
      <Button full type="submit" disabled={busy || !email.trim() || password.length < 10 || !age || !agree}>
        {t("cls.setup.create")}
      </Button>
      <p style={{ fontSize: 14, color: "var(--mid)", textAlign: "center", margin: "10px 0 4px" }}>{t("cls.setup.next")}</p>
      <Button kind="ghost" size="md" full onClick={onSignIn}>
        {t("cls.setup.signin")}
      </Button>
      <Sheet open={terms} onClose={() => setTerms(false)} title={t("cls.t.terms")} tall>
        <Legal route={{ params: { doc: "teacher" } }} locale={locale} t={t} />
      </Sheet>
    </form>
  );
}

// ---- the screen, and what's always running ------------------------------------------

export function Screen(ctx) {
  const { t, session } = ctx;
  const s = useSlice("classroom", DEFAULTS);
  const [joining, setJoining] = useState(false);
  const on = !!session.flags.classroom;
  const teacher = !!(session.user && session.user.role === "teacher");
  return (
    <div>
      <Title>{t("cls.nav")}</Title>
      {s.memberships.map((m) => (
        <ClassCard key={m.memberId} {...ctx} m={m} />
      ))}
      {on && (
        <>
          {/* (A "Teaching" heading only when the same screen also shows a class this person is in.) */}
          {!!s.memberships.length && <Label style={{ marginTop: 30 }}>{t("cls.t.title")}</Label>}
          <Teaching {...ctx} />
        </>
      )}
      {!on && teacher && <Note icon="info">{t("cls.t.notyet")}</Note>}
      {!s.memberships.length && !on && !teacher && <Note icon="info">{t("cls.none2")}</Note>}
      {!teacher && (
        <Button kind="secondary" size="md" style={{ marginTop: 24 }} onClick={() => setJoining(true)}>
          <Icon name="plus" size={18} /> {t("cls.join")}
        </Button>
      )}
      {joining && <JoinSheet {...ctx} onClose={() => setJoining(false)} />}
    </div>
  );
}

// A teacher's join link (?join=CODE), or "Join a class" at the start, opens the join screen (after onboarding,
// for someone new), and reports go out after each change.
export function Overlay(ctx) {
  const [code, setCode] = useState(() => new URLSearchParams(location.search).get("join"));
  const asked = useSlice("classroom", DEFAULTS).openJoin;
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
  const close = () => (setCode(null), asked && save((s) => ({ ...s, openJoin: false })));
  return code || asked ? <JoinSheet {...ctx} initialCode={code || ""} onClose={close} /> : null;
}
