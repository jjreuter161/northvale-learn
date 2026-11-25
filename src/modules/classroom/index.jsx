// CLASSROOM MODE — registration (the screen, the join sheet and the teacher setup live in Main.jsx, loaded when
// needed). See Main.jsx for what it does, and docs/SCHOOL-PLAN.md for the plan.
// School mode (the choice "I'm a student / I'm a teacher" at the start, and "Join a class" under Me) shows for a
// device whose tester link was opened (?school=on, remembered; ?school=off forgets it) or when the "classroom"
// flag is on for everyone. Making a class still needs the flag on for that teacher's account (server/flags.js).
import { Suspense, lazy, useState } from "react";
import { registerModule } from "../../core/registry.js";
import { getState, slice as sliceOf, update, useSlice } from "../../core/store.js";
import { addStrings } from "../../core/i18n.js";
import { api } from "../../core/api.js";
import { sessionNow } from "../../core/session.js";
import { Card, Icon, Loading } from "../../core/ui.jsx";

const S = (en, es) => ({ en, es });
addStrings({
  "cls.nav": S("Classes", "Clases"),
  "cls.today.class": S("Your class: {name}", "Tu clase: {name}"),
  "cls.today.class.sub": S("Your teacher sees which lessons you finish.", "Tu profe ve qué lecciones terminas."),
  "cls.today.teach": S("Your classes", "Tus clases"),
  "cls.today.teach.sub": S("See who finished which lessons.", "Ve quién terminó qué lecciones."),
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
// Nothing loads unless there's a join link in the address, a join asked for at the start, or this device is in a class.
function Overlay(ctx) {
  const s = useSlice("classroom", DEFAULTS);
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
