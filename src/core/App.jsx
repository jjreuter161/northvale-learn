// THE SHELL — header (streak, today's goal, the tutor), the ☰ menu built
// from whatever modules are registered, and the screen for the current
// route. On phones the menu slides in (☰ or a swipe from the left edge);
// on wide screens it sits beside the content.
import { useEffect, useMemo, useRef, useState } from "react";
import { useAppState, update, on } from "./store.js";
import { makeT } from "./i18n.js";
import { allModules, getModule } from "./registry.js";
import { LOOKS, GLOBAL_CSS, Icon, Wordmark, Toasts, Sheet, toast, Button } from "./ui.jsx";
import { useSession, refreshSession, schedulePush } from "./session.js";
import { settleOnOpen } from "./game.js";
import { dayKey, addDays, MAX_FREEZES, BADGES } from "./progress.js";
import Onboarding from "./Onboarding.jsx";
import Me from "./Me.jsx";
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

const CORE_SCREENS = { me: Me, settings: Settings, legal: Legal };

export default function App() {
  const settings = useAppState((s) => s.settings);
  const profile = useAppState((s) => s.profile);
  const progress = useAppState((s) => s.progress);
  const session = useSession();
  const locale = useMemo(() => ({ lang: settings.lang, region: settings.region }), [settings.lang, settings.region]);
  const t = useMemo(() => makeT(locale), [locale]);
  const [route, setRoute] = useState({ id: "goals", params: {} });
  const [menu, setMenu] = useState(false);
  const [streakOpen, setStreakOpen] = useState(false);
  const [notice, setNotice] = useState(null);
  const [resetToken, setResetToken] = useState(() => (/^#reset=([\w-]{20,})$/.exec(location.hash) || [])[1] || null);
  const wide = useWide();
  const swipe = useRef(null);

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
  // Missed days: a freeze covers them, or the streak starts over. Said kindly.
  useEffect(() => {
    if (!profile.onboarded) return;
    const p = progress;
    track("app_open", { streak: p.streak.count, lessons: p.counters.lessons || 0 });
    const e = settleOnOpen();
    if (e) setNotice(e);
  }, [profile.onboarded]);
  useEffect(() => {
    const offStore = on("badges.earned", ({ ids }) => ids.forEach((id) => toast(t("badge.earned", { name: t(`badge.${id}`) }), "good")));
    return offStore;
  }, [t]);
  // Signed in: every change is sent to the server a moment later.
  const updatedAt = useAppState((s) => s.updatedAt);
  useEffect(() => {
    if (session.user) schedulePush();
  }, [updatedAt, session.user]);

  const go = (id, params = {}) => {
    setRoute({ id, params });
    setMenu(false);
    window.scrollTo(0, 0);
  };

  const look = LOOKS[settings.look] || LOOKS.white;
  const rootStyle = { ...look, background: "var(--bg)", color: "var(--ink)", minHeight: "100dvh", fontFamily: "'Inter', system-ui, sans-serif" };

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

  const nav = allModules()
    .filter((m) => m.nav)
    .sort((a, b) => a.nav.order - b.nav.order)
    .map((m) => ({ id: m.id, icon: m.nav.icon, label: t(m.nav.label) }));
  const coreNav = [
    { id: "me", icon: "user", label: t("nav.me") },
    { id: "settings", icon: "settings", label: t("nav.settings") },
  ];
  const titleOf = (id) => (nav.find((n) => n.id === id) || coreNav.find((n) => n.id === id) || { label: id === "legal" ? t("settings.legal") : "" }).label;
  const mod = getModule(route.id);
  const Screen = mod ? mod.Screen : CORE_SCREENS[route.id];
  const today = dayKey();
  const ctx = { t, locale, go, route, session, wide };

  const sidebar = (
    <nav aria-label={t("nav.menu")} style={{ display: "flex", flexDirection: "column", height: "100%", padding: "18px 14px calc(18px + env(safe-area-inset-bottom))" }}>
      <div style={{ padding: "4px 10px 18px" }}>
        <Wordmark size={28} />
        <div style={{ fontSize: 13, fontWeight: 650, color: "var(--low)", letterSpacing: 0.4, marginTop: 4 }}>LEARN</div>
      </div>
      {[...nav, null, ...coreNav].map((n, i) =>
        n ? (
          <button key={n.id} onClick={() => go(n.id)} aria-current={route.id === n.id ? "page" : undefined} className="nv-press" style={{ display: "flex", alignItems: "center", gap: 14, width: "100%", border: "none", borderRadius: 14, padding: "12px 12px", minHeight: 48, background: route.id === n.id ? "var(--brandSoft)" : "transparent", color: "var(--ink)", fontSize: 16, fontWeight: 650, cursor: "pointer", textAlign: "left" }}>
            <Icon name={n.icon} size={22} />
            {n.label}
          </button>
        ) : (
          <div key={`sep${i}`} style={{ height: 1, background: "var(--line)", margin: "10px 8px" }} />
        )
      )}
      <div style={{ flex: 1 }} />
      <button onClick={() => (setMenu(false), getModule("feedback") && getModule("feedback").services.open({}))} className="nv-press" style={{ display: "flex", alignItems: "center", gap: 14, width: "100%", border: "none", borderRadius: 14, padding: "12px 12px", minHeight: 48, background: "transparent", color: "var(--mid)", fontSize: 15, fontWeight: 600, cursor: "pointer", textAlign: "left" }}>
        <Icon name="chat" size={20} />
        {t("fb.title")}
      </button>
      <p style={{ fontSize: 12, lineHeight: 1.45, color: "var(--low)", margin: "16px 10px 0" }}>{t("disclaimer.short")}</p>
    </nav>
  );

  const header = (
    <header style={{ position: "sticky", top: 0, zIndex: 20, background: "var(--bg)", padding: "calc(8px + env(safe-area-inset-top)) 12px 8px", display: "flex", alignItems: "center", gap: 8, borderBottom: "1px solid var(--line)" }}>
      {!wide && (
        <button onClick={() => setMenu(true)} aria-label={t("nav.menu")} style={iconBtn}>
          <Icon name="menu" />
        </button>
      )}
      <div style={{ flex: 1, minWidth: 0, fontSize: 18, fontWeight: 750, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{route.id === "goals" && !wide ? <Wordmark size={24} /> : titleOf(route.id)}</div>
      <button onClick={() => setStreakOpen(true)} aria-label={t("streak.aria", { n: progress.streak.count })} className="nv-press" style={{ ...chip, color: "var(--mid)" }}>
        <Icon name="flame" size={18} color={progress.streak.last === today ? "var(--flame)" : "var(--low)"} />
        <span style={{ fontWeight: 650, fontSize: 15, fontVariantNumeric: "tabular-nums" }}>{progress.streak.count}</span>
      </button>
      {getModule("tutor") && (
        <button onClick={() => getModule("tutor").services.open({})} aria-label={t("nav.tutor")} style={iconBtn}>
          <Icon name="chat" />
        </button>
      )}
    </header>
  );

  return (
    <div
      style={rootStyle}
      className={settings.reduceMotion ? "nv-reduce" : undefined}
      onTouchStart={(e) => {
        const x = e.touches[0].clientX;
        swipe.current = { x, y: e.touches[0].clientY };
      }}
      onTouchEnd={(e) => {
        const s = swipe.current;
        if (!s || wide) return;
        const dx = e.changedTouches[0].clientX - s.x;
        const dy = Math.abs(e.changedTouches[0].clientY - s.y);
        if (s.x < 24 && dx > 60 && dy < 50) setMenu(true);
        if (menu && dx < -60 && dy < 50) setMenu(false);
      }}
    >
      <style>{GLOBAL_CSS}</style>
      <div style={{ display: "flex", justifyContent: "center" }}>
        {wide && <aside style={{ width: 260, flexShrink: 0, position: "sticky", top: 0, height: "100dvh", borderRight: "1px solid var(--line)" }}>{sidebar}</aside>}
        <div style={{ flex: 1, minWidth: 0, maxWidth: wide ? 720 : 640 }}>
          {header}
          <main key={route.id} className="nv-in" style={{ padding: "16px 16px calc(32px + env(safe-area-inset-bottom))" }}>
            <Boundary t={t} screen={route.id}>{Screen ? <Screen {...ctx} /> : null}</Boundary>
            <div style={{ textAlign: "center", marginTop: 36 }}>
              <button onClick={() => getModule("feedback") && getModule("feedback").services.open({})} style={{ border: "none", background: "transparent", color: "var(--low)", fontSize: 14, fontWeight: 600, cursor: "pointer", padding: "10px 12px", minHeight: 44 }}>
                {t("fb.title")}
              </button>
            </div>
          </main>
        </div>
      </div>
      {!wide && menu && (
        <div style={{ position: "fixed", inset: 0, zIndex: 50 }}>
          <div onClick={() => setMenu(false)} style={{ position: "absolute", inset: 0, background: "rgba(5,12,25,.45)", animation: "nvFade .2s both" }} />
          <aside style={{ position: "absolute", top: 0, bottom: 0, left: 0, width: "min(300px, 84vw)", background: "var(--bg)", paddingTop: "env(safe-area-inset-top)", animation: "nvDrawer .25s cubic-bezier(.2,.7,.2,1) both", overflowY: "auto" }}>{sidebar}</aside>
        </div>
      )}
      {allModules()
        .filter((m) => m.Overlay)
        .map((m) => (
          <m.Overlay key={m.id} {...ctx} />
        ))}
      <StreakSheet open={streakOpen} onClose={() => setStreakOpen(false)} t={t} progress={progress} today={today} />
      <Sheet open={!!notice} onClose={() => setNotice(null)} title={notice && notice.type === "freeze_used" ? t("streak.saved.title") : t("streak.reset.title")}>
        {notice && (
          <div style={{ textAlign: "center", padding: "6px 4px 4px" }}>
            <div style={{ width: 64, height: 64, borderRadius: 32, margin: "0 auto", background: "var(--brandSoft)", display: "flex", alignItems: "center", justifyContent: "center" }}>
              <Icon name={notice.type === "freeze_used" ? "snow" : "refresh"} size={30} color="var(--sky)" />
            </div>
            <p style={{ fontSize: 17, lineHeight: 1.5, margin: "8px 0 18px" }}>{notice.type === "freeze_used" ? t("streak.saved.body", { n: notice.count, streak: notice.streak }) : t("streak.reset.body", { n: notice.lost })}</p>
            <Button full onClick={() => (setNotice(null), go("lessons"))}>{t("streak.cta")}</Button>
          </div>
        )}
      </Sheet>
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
      <p style={{ fontSize: 14, color: "var(--mid)", lineHeight: 1.5, margin: "14px 2px 0" }}>{t("streak.rule")}</p>
    </Sheet>
  );
}

export function setLook(look) {
  update((s) => ({ ...s, settings: { ...s.settings, look } }));
}
