// CLASSROOM MODE — registration (the screen and the join sheet live in Main.jsx, loaded when needed: a join link,
// a class this device is in, or the Classes screen). See Main.jsx for what it does.
import { Suspense, lazy } from "react";
import { registerModule } from "../../core/registry.js";
import { slice as sliceOf, useSlice } from "../../core/store.js";
import { addStrings } from "../../core/i18n.js";
import { api } from "../../core/api.js";
import { Loading } from "../../core/ui.jsx";

const S = (en, es) => ({ en, es });
addStrings({
  "cls.nav": S("Classes", "Clases"),
});

const DEFAULTS = { memberships: [] };
const memberships = () => sliceOf("classroom", DEFAULTS).memberships;
const who = (m) => ({ classId: m.classId, memberId: m.memberId, key: m.key });
const MainScreen = lazy(() => import("./Main.jsx").then((m) => ({ default: m.Screen })));
const MainOverlay = lazy(() => import("./Main.jsx").then((m) => ({ default: m.Overlay })));

function Screen(ctx) {
  return (
    <Suspense fallback={<Loading label={ctx.t("cls.nav")} size={32} />}>
      <MainScreen {...ctx} />
    </Suspense>
  );
}
// Nothing loads unless there's a join link in the address or this device is in a class.
function Overlay(ctx) {
  const n = useSlice("classroom", DEFAULTS).memberships.length;
  const link = typeof location !== "undefined" && new URLSearchParams(location.search).get("join");
  return n || link ? (
    <Suspense fallback={null}>
      <MainOverlay {...ctx} />
    </Suspense>
  ) : null;
}

registerModule({
  id: "classroom",
  // Under Me, for testers it's on for and for students in a class.
  nav: { tab: "me", label: "cls.nav", show: ({ session }) => !!session.flags.classroom || memberships().length > 0 },
  Screen,
  Overlay,
  services: {
    // The first class's leaderboard, for Me → league "My class".
    board: async () => {
      const m = memberships()[0];
      if (!m) return null;
      const v = await api("/api/class/view", { method: "POST", body: who(m) });
      return { name: v.name, standings: v.board };
    },
    inClass: () => memberships().length > 0,
    // "Delete my data": leave every class (the teacher stops seeing you).
    leaveAll: () => Promise.all(memberships().map((m) => api("/api/class/leave", { method: "POST", body: who(m) }).catch(() => {}))),
  },
});
