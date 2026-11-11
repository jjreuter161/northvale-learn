// THE SHELL — a header (where you are, the streak, the Ask button), the
// screen for the current route, and a bottom tab bar with 4 tabs: Learn
// (opens on Today), Goals, Practice, Me. Every screen belongs to one tab
// (a module says which in nav.tab); screens below a tab get a back button.
import { useEffect, useMemo, useState } from "react";
import { useAppState, update, on } from "./store.js";
import { makeT } from "./i18n.js";
import { allModules, getModule } from "./registry.js";
import { LOOKS, GLOBAL_CSS, Icon, Wordmark, Toasts, Sheet, toast, Button } from "./ui.jsx";
import { useSession, refreshSession, schedulePush, verifyEmail } from "./session.js";
import { settleOnOpen } from "./game.js";
import { OpenNotice, RepairOffer, COMEBACK_DAYS } from "./Comeback.jsx";
import { scheduleReminderUpdate } from "./reminders.jsx";
import { ShareHost, openShare } from "./share.jsx";
import { arrived, claimRewards } from "./invites.jsx";
import { api } from "./api.js";
import { dayKey, addDays, MAX_FREEZES, BADGES } from "./progress.js";
import Onboarding from "./Onboarding.jsx";
import Me from "./Me.jsx";
import Practice from "./Practice.jsx";
import Settings, { ResetPassword } from "./Settings.jsx";
import Legal from "./Legal.jsx";
import "./strings.js";
import { track } from "./analytics.js";
import { Boundary } from "./errors.jsx";

function useWide() {
  const q = "(min-width: 900px)";
  const [wide, setWide] = useState(() => typeof matchMedia !== "undefined" && matchMedia(q).matches);
  useEffect(() => {
    const m = matchMedia(q);
    const f = () => setWide(m.matches);
    m.addEventListener("change", f);
    return () => m.removeEventListener("change", f);
  }, []);
  return wide;
}

const CORE_SCREENS = { me: Me, settings: Settings, legal: Legal, practice: Practice };
// The 4 tabs and the route each one opens.
export const TABS = [
  { id: "learn", route: "lessons", icon: "book", label: "lessons.nav" },
  { id: "goals", route: "goals", icon: "target", label: "goals.nav" },
  { id: "practice", route: "practice", icon: "compass", label: "nav.practice" },
  { id: "me", route: "me", icon: "user", label: "nav.me" },
];
const CORE_TAB = { practice: "practice", me: "me", settings: "me", legal: "me" };
const CORE_TITLE = { practice: "nav.practice", me: "nav.me", settings: "nav.settings", legal: "settings.legal" };

export default function App() {
  const settings = useAppState((s) => s.settings);
  const profile = useAppState((s) => s.profile);
  const progress = useAppState((s) => s.progress);
  const session = useSession();
  const locale = useMemo(() => ({ lang: settings.lang, region: settings.region }), [settings.lang, settings.region]);
  const t = useMemo(() => makeT(locale), [locale]);
  const [route, setRoute] = useState({ id: "lessons", params: {} });
  // A tap on a tab always opens it fresh (the goals list, not the goal
  // that was open).
  const [visit, setVisit] = useState(0);
  const [streakOpen, setStreakOpen] = useState(false);
  const [notice, setNotice] = useState(null);
  const [resetToken, setResetToken] = useState(() => (/^#reset=([\w-]{20,})$/.exec(location.hash) || [])[1] || null);
  // The privacy policy or terms on their own (?legal=privacy&lang=es), for
  // the landing page's links — the same files the app shows.
  const [legalPage] = useState(() => {
    const q = new URLSearchParams(location.search);
    return ["privacy", "terms", "teacher"].includes(q.get("legal")) ? { doc: q.get("legal"), lang: ["en", "es"].includes(q.get("lang")) ? q.get("lang") : settings.lang } : null;
  });
  // Opened from a teacher's class link: that comes first, not "welcome back".
  const [classLink] = useState(() => new URLSearchParams(location.search).has("join"));
  const wide = useWide();

  // The look's colors live on the page root, so layers opened at the top of
  // the page (sheets, lessons) use them too.
  useEffect(() => {
    const root = document.documentElement;
    root.lang = settings.lang;
    for (const [k, v] of Object.entries(LOOKS[settings.look] || LOOKS.white)) root.style.setProperty(k, v);
    root.classList.toggle("nv-reduce", !!settings.reduceMotion);
    const meta = document.querySelector('meta[name="theme-color"]');
    if (meta) meta.setAttribute("content", LOOKS[settings.look]["--bg"]);
  }, [settings.lang, settings.look, settings.reduceMotion]);
  useEffect(() => {
    refreshSession();
  }, []);
  // Missed days: a freeze covers them, or the streak starts over; after 3+
  // days away, a short catch-up instead (Comeback.jsx). Said kindly.
  useEffect(() => {
    if (!profile.onboarded) return;
    const p = progress;
    track("app_open", { streak: p.streak.count, lessons: p.counters.lessons || 0 });
    const n = settleOnOpen();
    if (n.away >= COMEBACK_DAYS) track("comeback", { away: Math.min(n.away, 365) });
    if ((n.event || n.away >= COMEBACK_DAYS) && !classLink) setNotice(n);
    claimRewards(t).catch(() => {});
  }, [profile.onboarded]);
  useEffect(() => {
    const offStore = on("badges.earned", ({ ids }) => ids.forEach((id) => toast(t("badge.earned", { name: t(`badge.${id}`) }), "good")));
    return offStore;
  }, [t]);
  // Signed in: every change is sent to the server a moment later.
  const updatedAt = useAppState((s) => s.updatedAt);
  useEffect(() => {
    if (session.user) schedulePush();
    scheduleReminderUpdate();
  }, [updatedAt, session.user]);
  // Opened from a reminder (?from=push&kind=…), the weekly email
  // (?from=recap, or its "turn off" link ?recap_off=…), a friend's invite
  // link (?invite=…) or the "confirm your email" link (#verify=…): count
  // it, go where it points, then tidy the address. (A class link, ?join=…,
  // is the classroom module's.)
  useEffect(() => {
    const q = new URLSearchParams(location.search);
    const verify = (/^#verify=([\w-]{20,})$/.exec(location.hash) || [])[1];
    if (verify) verifyEmail(verify).then(() => toast(t("account.verified"), "good"), (e) => toast(e.message));
    if (!q.has("from") && !q.has("recap_off") && !q.has("invite") && !verify) return;
    const kind = q.get("kind");
    if (q.get("from") === "push") track("push_open", { kind });
    if (q.get("from") === "recap") track("recap_open");
    if (q.has("recap_off")) api("/api/recap/off", { method: "POST", body: { token: q.get("recap_off") } }).then(() => toast(t("recap.unsubscribed"), "good"), (e) => toast(e.message));
    if (q.has("invite")) arrived(q.get("invite"));
    ["from", "kind", "recap_off", "invite"].forEach((k) => q.delete(k));
    history.replaceState(null, "", location.pathname + (q.size ? `?${q}` : ""));
    if (!profile.onboarded) return;
    if (kind === "review") go("lessons", { review: true });
    else if (kind === "mission") go("missions");
    else if (kind === "streak" || kind === "next") go("lessons");
  }, []);

  const go = (id, params = {}) => {
    setRoute({ id, params });
    window.scrollTo(0, 0);
  };

  const look = LOOKS[settings.look] || LOOKS.white;
  const rootStyle = { ...look, background: "var(--bg)", color: "var(--ink)", minHeight: "100dvh", fontFamily: "'Inter', system-ui, sans-serif" };

  if (legalPage) {
    const lt = makeT({ ...locale, lang: legalPage.lang });
    return (
      <div style={rootStyle}>
        <style>{GLOBAL_CSS}</style>
        <main lang={legalPage.lang} style={{ maxWidth: 720, margin: "0 auto", padding: "calc(16px + env(safe-area-inset-top)) 18px 40px" }}>
          <Legal route={{ params: { doc: legalPage.doc, from: "back" } }} locale={{ ...locale, lang: legalPage.lang }} t={lt} go={() => (history.length > 1 ? history.back() : location.assign(legalPage.lang === "es" ? "/bienvenida" : "/welcome"))} />
        </main>
      </div>
    );
  }

  // A password reset link (#reset=…) opens its own page, on any device.
  if (resetToken) {
    return (
      <div style={rootStyle}>
        <style>{GLOBAL_CSS}</style>
        <ResetPassword t={t} token={resetToken} onDone={() => (history.replaceState(null, "", location.pathname), setResetToken(null))} />
        <Toasts />
      </div>
    );
  }

  if (!profile.onboarded) {
    return (
      <div style={rootStyle} className={settings.reduceMotion ? "nv-reduce" : undefined}>
        <style>{GLOBAL_CSS}</style>
        <Onboarding t={t} locale={locale} onDone={(unit) => go("lessons", unit ? { startUnit: unit } : {})} />
        <Toasts />
      </div>
    );
  }

  const mod = getModule(route.id);
  const Screen = mod ? mod.Screen : CORE_SCREENS[route.id];
  const tabOf = (id) => (getModule(id) && getModule(id).nav ? getModule(id).nav.tab : CORE_TAB[id]) || "learn";
  const tab = TABS.find((x) => x.id === tabOf(route.id));
  const isRoot = TABS.some((x) => x.route === route.id) && !(route.id === "me" && route.params.section);
  // The header never repeats the page's own title: on a tab it shows the
  // wordmark; deeper in, a back button named for where it goes.
  const from = route.params.from;
  const back = from ? (getModule(from) && getModule(from).nav ? getModule(from).nav.label : CORE_TITLE[from]) : tab.label;
  const today = dayKey();
  const ctx = { t, locale, go, route, session, wide, openStreak: () => setStreakOpen(true) };
  const openTab = (x) => (setVisit((v) => v + 1), go(x.route));

  const header = (
    <header style={{ position: "sticky", top: 0, zIndex: 20, background: "var(--bg)", padding: "calc(8px + env(safe-area-inset-top)) 12px 6px 16px", display: "flex", alignItems: "center", gap: 6 }}>
      {!isRoot && (
        <button onClick={() => go(from || tab.route)} aria-label={`${t("common.back")}: ${t(back)}`} className="nv-press" style={{ ...iconBtn, width: "auto", gap: 2, padding: "0 10px 0 2px", marginLeft: -8, fontSize: 16, fontWeight: 650, minWidth: 0 }}>
          <Icon name="back" /> <span style={{ overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{t(back)}</span>
        </button>
      )}
      <div style={{ flex: 1, minWidth: 0 }}>{isRoot && <Wordmark size={25} />}</div>
      <button onClick={() => setStreakOpen(true)} aria-label={t("streak.aria", { n: progress.streak.count })} className="nv-press" style={{ ...chip, color: "var(--mid)" }}>
        <Icon name="flame" size={18} color={progress.streak.last === today ? "var(--flame)" : "var(--low)"} />
        <span style={{ fontWeight: 650, fontSize: 15, fontVariantNumeric: "tabular-nums" }}>{progress.streak.count}</span>
      </button>
      {getModule("tutor") && (
        <button onClick={() => getModule("tutor").services.open({})} className="nv-press" style={{ display: "inline-flex", alignItems: "center", gap: 6, border: "none", background: "var(--surface)", color: "var(--ink)", borderRadius: 999, height: 38, padding: "0 14px", fontSize: 15, fontWeight: 650, cursor: "pointer", flexShrink: 0 }}>
          <Icon name="chat" size={17} /> {t("nav.ask")}
        </button>
      )}
    </header>
  );

  const tabBar = (
    <nav aria-label={t("nav.menu")} style={{ position: "fixed", left: 0, right: 0, bottom: 0, zIndex: 30, background: "var(--bg)", borderTop: "1px solid var(--line)", paddingBottom: "env(safe-area-inset-bottom)" }}>
      <div style={{ display: "flex", maxWidth: 640, margin: "0 auto" }}>
        {TABS.map((x) => (
          <button key={x.id} onClick={() => openTab(x)} aria-current={tab.id === x.id ? "page" : undefined} className="nv-press" style={{ flex: 1, display: "flex", flexDirection: "column", alignItems: "center", gap: 3, border: "none", background: "transparent", color: tab.id === x.id ? "var(--brand)" : "var(--low)", padding: "8px 4px 6px", minHeight: 58, fontSize: 12, fontWeight: 650, cursor: "pointer" }}>
            <Icon name={x.icon} size={24} />
            {t(x.label)}
          </button>
        ))}
      </div>
    </nav>
  );

  return (
    <div style={rootStyle} className={settings.reduceMotion ? "nv-reduce" : undefined}>
      <style>{GLOBAL_CSS}</style>
      <div style={{ maxWidth: wide ? 720 : 640, margin: "0 auto" }}>
        {header}
        <main key={`${route.id}:${visit}`} className="nv-in" style={{ padding: "8px 16px calc(96px + env(safe-area-inset-bottom))" }}>
          <Boundary t={t} screen={route.id}>{Screen ? <Screen {...ctx} /> : null}</Boundary>
        </main>
      </div>
      {tabBar}
      {allModules()
        .filter((m) => m.Overlay)
        .map((m) => (
          <m.Overlay key={m.id} {...ctx} />
        ))}
      <StreakSheet open={streakOpen} onClose={() => setStreakOpen(false)} t={t} progress={progress} today={today} />
      <OpenNotice t={t} locale={locale} notice={notice} onClose={() => setNotice(null)} go={go} />
      <ShareHost t={t} />
      <Toasts />
    </div>
  );
}

const iconBtn = { border: "none", background: "transparent", color: "var(--ink)", width: 44, height: 44, borderRadius: 12, display: "flex", alignItems: "center", justifyContent: "center", cursor: "pointer", flexShrink: 0 };
const chip = { border: "none", background: "transparent", display: "flex", alignItems: "center", gap: 4, height: 44, padding: "0 8px", borderRadius: 12, cursor: "pointer", flexShrink: 0 };

function StreakSheet({ open, onClose, t, progress, today }) {
  const s = progress.streak;
  const days = Array.from({ length: 14 }, (_, i) => addDays(today, i - 13));
  const lessonDays = new Set(progress.lessonDays || []);
  return (
    <Sheet open={open} onClose={onClose} title={t("streak.title")}>
      <div style={{ display: "flex", alignItems: "center", gap: 14, marginBottom: 16 }}>
        <Icon name="flame" size={54} color="var(--flame)" />
        <div>
          <div style={{ fontSize: 34, fontWeight: 750, lineHeight: 1 }}>{t("streak.days", { n: s.count })}</div>
          <div style={{ fontSize: 14, color: "var(--mid)", marginTop: 4 }}>{t("streak.best", { n: s.best })}</div>
        </div>
      </div>
      <div style={{ display: "grid", gridTemplateColumns: "repeat(7, 1fr)", gap: 6, marginBottom: 16 }} aria-label={t("streak.calendar")}>
        {days.map((d) => {
          const lesson = lessonDays.has(d);
          const frozen = s.frozen.includes(d);
          return (
            <div key={d} title={d} style={{ aspectRatio: "1", borderRadius: 12, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 13, fontWeight: 650, background: frozen ? "var(--brandSoft)" : lesson ? "var(--flame)" : "var(--surface2)", color: lesson && !frozen ? "#fff" : "var(--mid)", outline: d === today ? "1px solid var(--ink)" : "none" }}>
              {frozen ? <Icon name="snow" size={16} color="var(--sky)" /> : Number(d.slice(8))}
            </div>
          );
        })}
      </div>
      <div style={{ display: "flex", alignItems: "center", gap: 12, background: "var(--surface)", border: "1px solid var(--line)", borderRadius: 16, padding: 14 }}>
        <Icon name="snow" size={28} color="var(--sky)" />
        <div style={{ flex: 1 }}>
          <div style={{ fontWeight: 750 }}>{t("streak.freezes", { n: progress.freezes, max: MAX_FREEZES })}</div>
          <div style={{ fontSize: 14, color: "var(--mid)", lineHeight: 1.4 }}>{t("streak.freezes.how")}</div>
        </div>
      </div>
      <div style={{ marginTop: 14 }}>
        <RepairOffer t={t} />
      </div>
      <p style={{ fontSize: 14, color: "var(--mid)", lineHeight: 1.5, margin: "0 2px" }}>{t("streak.rule")}</p>
      {s.count >= 2 && (
        <Button full kind="secondary" style={{ marginTop: 14 }} onClick={() => (onClose(), openShare({ kind: "streak", n: s.count }))}>
          <Icon name="share" size={18} /> {t("share.button")}
        </Button>
      )}
    </Sheet>
  );
}

export function setLook(look) {
  update((s) => ({ ...s, settings: { ...s.settings, look } }));
}
