// CLASSROOM MODE — registration (the screen, the join sheet and the teacher setup live in Main.jsx, loaded when
// needed). See Main.jsx for what it does, and docs/SCHOOL-PLAN.md for the plan.
// School mode (the choice "I'm a student / I'm a teacher" at the start, and "Join a class" under Me) shows for a
// device whose tester link was opened (?school=on, remembered; ?school=off forgets it) or when the "classroom"
// flag is on for everyone. Making a class still needs the flag on for that teacher's account (server/flags.js).
import { Suspense, lazy, useEffect, useState } from "react";
import { registerModule } from "../../core/registry.js";
import { getState, setSlice, slice as sliceOf, update, useSlice } from "../../core/store.js";
import { addStrings } from "../../core/i18n.js";
import { api } from "../../core/api.js";
import { sessionNow } from "../../core/session.js";
import { Button, Card, Icon, Loading } from "../../core/ui.jsx";

const S = (en, es) => ({ en, es });
addStrings({
  "cls.nav": S("Classes", "Clases"),
  "cls.today.class": S("Your class: {name}", "Tu clase: {name}"),
  "cls.today.class.sub": S("Your teacher sees which lessons you finish.", "Tu profe ve qué lecciones terminas."),
  "cls.today.teach": S("Your classes", "Tus clases"),
  "cls.today.teach.sub": S("See who finished which lessons.", "Ve quién terminó qué lecciones."),
  "cls.home.title": S("Use Northvale at home too", "Usa Northvale también en casa"),
  "cls.home.sub": S("Save your progress with a free account; your lessons and your class follow you to any phone or computer. Under 18: a parent or guardian says OK first.", "Guarda tu avance con una cuenta gratis; tus lecciones y tu clase te siguen en cualquier teléfono o computadora. Menores de 18: primero da el OK una mamá, papá o tutor."),
  "cls.home.go": S("Save my progress", "Guardar mi avance"),
  // (Shown by Onboarding before the classroom screens have loaded.)
  "cls.setup.title": S("Set up your teacher account", "Crea tu cuenta de docente"),
});

// The tester link: ?school=on turns school mode on for this device, ?school=off turns it off.
if (typeof location !== "undefined") {
  const q = new URLSearchParams(location.search);
  const v = q.get("school");
  if (v === "on" || v === "off") {
    update((s) => ({ ...s, settings: { ...s.settings, school: v === "on" } }));
    q.delete("school");
    history.replaceState(null, "", location.pathname + (q.size ? `?${q}` : "") + location.hash);
  }
}
export const schoolOn = (session = sessionNow(), state = getState()) => !!((session.flags || {}).classroom || state.settings.school);

const DEFAULTS = { memberships: [] };
const memberships = () => sliceOf("classroom", DEFAULTS).memberships;
const who = (m) => ({ classId: m.classId, memberId: m.memberId, key: m.key });
const isTeacher = (session) => !!(session.user && session.user.role === "teacher" && (session.flags || {}).classroom);
const MainScreen = lazy(() => import("./Main.jsx").then((m) => ({ default: m.Screen })));
const MainOverlay = lazy(() => import("./Main.jsx").then((m) => ({ default: m.Overlay })));
const MainSetup = lazy(() => import("./Main.jsx").then((m) => ({ default: m.TeacherSetup })));

function Screen(ctx) {
  return (
    <Suspense fallback={<Loading label={ctx.t("cls.nav")} size={32} />}>
      <MainScreen {...ctx} />
    </Suspense>
  );
}
// Signed in: the classes this device joined go with the account (claim), and the account's classes from other
// devices show up here (no key: the account stands in for it). Progress itself syncs with the account as always.
async function linkAccount() {
  for (const m of memberships().filter((x) => x.key && !x.linked))
    await api("/api/class/claim", { method: "POST", body: who(m) }).then(
      () => setSlice("classroom", (s) => ({ ...s, memberships: s.memberships.map((x) => (x.memberId === m.memberId ? { ...x, linked: true } : x)) }), DEFAULTS),
      () => {},
    );
  const r = await api("/api/class/mine").catch(() => null);
  if (!r) return;
  const have = new Set(memberships().map((x) => x.memberId));
  const add = r.classes.filter((c) => !have.has(c.memberId)).map((c) => ({ classId: c.classId, memberId: c.memberId, name: c.name, joined: c.joined, nickname: c.nickname, linked: true }));
  if (add.length) setSlice("classroom", (s) => ({ ...s, memberships: [...s.memberships, ...add] }), DEFAULTS);
}

// Nothing loads unless there's a join link in the address, a join asked for at the start, or this device is in a class.
function Overlay(ctx) {
  const s = useSlice("classroom", DEFAULTS);
  const email = ctx.session.user && ctx.session.user.email;
  useEffect(() => {
    if (!email) return undefined;
    // (After signing in, the account's copy of the progress may replace this device's first.)
    const timer = setTimeout(linkAccount, 2000);
    return () => clearTimeout(timer);
  }, [email]);
  // Read once: the join sheet removes ?join= from the address, and that must not unload it.
  const [link] = useState(() => typeof location !== "undefined" && new URLSearchParams(location.search).get("join"));
  return s.memberships.length || link || s.openJoin ? (
    <Suspense fallback={null}>
      <MainOverlay {...ctx} />
    </Suspense>
  ) : null;
}
// The teacher setup at the start (Onboarding shows it after "I'm a teacher").
function TeacherSetup(props) {
  return (
    <Suspense fallback={<Loading label={props.t("common.loading")} size={32} />}>
      <MainSetup {...props} />
    </Suspense>
  );
}
// On Today: the class a student is in, or a teacher's classes.
function TodayCard({ t, go, session }) {
  const s = useSlice("classroom", DEFAULTS);
  const teacher = isTeacher(session);
  const m = s.memberships[0];
  if (!teacher && !m) return null;
  return (
    <>
    <Card onClick={() => go("classroom")} style={{ marginTop: 12 }}>
      <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
        <span style={{ width: 40, height: 40, borderRadius: 8, background: "var(--surface2)", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
          <Icon name="users" size={20} />
        </span>
        <div style={{ flex: 1, minWidth: 0 }}>
          <div style={{ fontWeight: 700 }}>{teacher ? t("cls.today.teach") : t("cls.today.class", { name: m.name })}</div>
          <div style={{ fontSize: 14, color: "var(--mid)" }}>{teacher ? t("cls.today.teach.sub") : t("cls.today.class.sub")}</div>
        </div>
        <Icon name="next" size={18} color="var(--low)" />
      </div>
    </Card>
    {/* In a class without an account: progress lives on this device only, so offer an account (a parent's OK under 18). */}
    {m && !session.user && (
      <Card style={{ marginTop: 12 }}>
        <div style={{ fontWeight: 700 }}>{t("cls.home.title")}</div>
        <p style={{ fontSize: 14, color: "var(--mid)", lineHeight: 1.45, margin: "4px 0 12px" }}>{t("cls.home.sub")}</p>
        <Button full kind="secondary" size="md" onClick={() => go("settings", { section: "account" })}>
          {t("cls.home.go")}
        </Button>
      </Card>
    )}
    </>
  );
}

registerModule({
  id: "classroom",
  // Under Me: for teachers it's on for, students in a class, and (to join one) anyone in school mode.
  nav: { tab: "me", label: "cls.nav", show: ({ session }) => schoolOn(session) || memberships().length > 0 },
  Screen,
  Overlay,
  services: {
    // The class leaderboard is hidden during the pilot (docs/SCHOOL-PLAN.md), so Me offers no "My class" league.
    leagueOn: () => false,
    board: async () => {
      const m = memberships()[0];
      if (!m) return null;
      const v = await api("/api/class/view", { method: "POST", body: who(m) });
      return { name: v.name, standings: v.board };
    },
    inClass: () => memberships().length > 0,
    schoolOn: () => schoolOn(),
    // "Join a class" at the start: the join sheet opens once the app is up.
    askJoin: () => update((s) => ({ ...s, modules: { ...s.modules, classroom: { ...DEFAULTS, ...(s.modules.classroom || {}), openJoin: true } } })),
    TeacherSetup,
    TodayCard,
    // "Delete my data": leave every class (the teacher stops seeing you).
    leaveAll: () => Promise.all(memberships().map((m) => api("/api/class/leave", { method: "POST", body: who(m) }).catch(() => {}))),
  },
});
