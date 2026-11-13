// FIRST RUN — three screens, then straight into a lesson: welcome, the
// steps modules add (Lessons: one warm-up question, answered in 3 taps from
// opening the app; Goals: what you want money skills for, which picks the
// first unit). No account, no age, no name first: the first lesson is the
// hook, and the account offer comes after it (that's where the age check
// lives). The 2-minute "skip what you know" check is offered later, after a
// lesson (Today and the finish screen), not before anyone has started.
import { useState } from "react";
import { update } from "./store.js";
import { LANGS, REGIONS } from "./i18n.js";
import { Button, Scene, Wordmark, Icon, BetaTag, SELECTED, Chosen } from "./ui.jsx";
import { LATEST_NOTE } from "./whatsnew.jsx";
import { AccountForm } from "./Settings.jsx";
import { track } from "./analytics.js";
import { allModules } from "./registry.js";

const ORDER = ["lessons", "goals"]; // the warm-up question first, then what you want money skills for
const rank = (m) => (ORDER.includes(m.id) ? ORDER.indexOf(m.id) : ORDER.length);

export default function Onboarding({ t, locale, onDone }) {
  const [step, setStep] = useState(0);
  const [reason, setReason] = useState("curious");
  const [startUnit, setStartUnit] = useState("budget");
  const [signingIn, setSigningIn] = useState(false);
  const extra = allModules()
    .filter((m) => m.Onboard)
    .sort((a, b) => rank(a) - rank(b));
  const steps = extra.length;
  const setSetting = (k, v) => update((s) => ({ ...s, settings: { ...s.settings, [k]: v } }));
  const finish = (start) => {
    // Someone new doesn't need "What's new".
    update((s) => ({ ...s, profile: { ...s.profile, onboarded: true, reason, seenNote: LATEST_NOTE }, progress: { ...s.progress, startUnit: start } }));
    track("onboarding", { reason });
    onDone(start);
  };

  const wrap = (children) => (
    <div className="nv-in" key={step} style={{ maxWidth: 520, margin: "0 auto", minHeight: "100dvh", display: "flex", flexDirection: "column", padding: "calc(16px + env(safe-area-inset-top)) 18px calc(20px + env(safe-area-inset-bottom))" }}>
      {children}
    </div>
  );
  const top = (title, sub, back = () => setStep(step - 1)) => (
    <>
      <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 22, minHeight: 44 }}>
        <button onClick={back} aria-label={t("common.back")} style={{ border: "none", background: "transparent", color: "var(--ink)", width: 44, height: 44, display: "flex", alignItems: "center", justifyContent: "center", cursor: "pointer" }}>
          <Icon name="back" />
        </button>
        <div style={{ flex: 1, height: 6, borderRadius: 3, background: "var(--surface2)", overflow: "hidden" }}>
          <div style={{ width: `${(step / steps) * 100}%`, height: "100%", background: "var(--accent)", borderRadius: 3, transition: "width .4s" }} />
        </div>
        <span style={{ fontSize: 14, color: "var(--mid)", whiteSpace: "nowrap" }}>{t("onb.step", { n: step, total: steps })}</span>
      </div>
      <h1 className="nv-disp" style={{ fontSize: 29, margin: "0 0 8px", lineHeight: 1.15 }}>{title}</h1>
      {sub && <p style={{ fontSize: 16, color: "var(--mid)", margin: "0 0 22px", lineHeight: 1.45 }}>{sub}</p>}
    </>
  );
  const option = (key, icon, label, sub, onClick) => (
    <button key={key} onClick={onClick} className="nv-press" style={{ display: "flex", alignItems: "center", gap: 14, width: "100%", textAlign: "left", border: "1px solid var(--line)", background: "var(--surface)", color: "var(--ink)", borderRadius: 14, padding: "14px 16px", marginBottom: 10, cursor: "pointer", minHeight: 64 }}>
      {icon && (
        <span style={{ width: 38, height: 38, borderRadius: 10, background: "var(--brandSoft)", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
          <Icon name={icon} size={20} />
        </span>
      )}
      <span style={{ flex: 1 }}>
        <span style={{ display: "block", fontSize: 16, fontWeight: 650 }}>{label}</span>
        {sub && <span style={{ display: "block", fontSize: 14, color: "var(--mid)", marginTop: 2 }}>{sub}</span>}
      </span>
      <Icon name="next" size={18} color="var(--low)" />
    </button>
  );

  if (signingIn)
    return wrap(
      <>
        <button onClick={() => setSigningIn(false)} aria-label={t("common.back")} style={{ border: "none", background: "transparent", color: "var(--ink)", width: 44, height: 44, display: "flex", alignItems: "center", justifyContent: "center", cursor: "pointer", marginBottom: 12 }}>
          <Icon name="back" />
        </button>
        <h1 className="nv-disp" style={{ fontSize: 29, margin: "0 0 16px" }}>{t("account.signin")}</h1>
        <AccountForm t={t} mode="signin" signinOnly onDone={() => update((s) => ({ ...s, profile: { ...s.profile, onboarded: true } }))} />
      </>
    );

  if (step === 0)
    return (
      <div className="nv-in" style={{ maxWidth: 520, margin: "0 auto", minHeight: "100dvh", display: "flex", flexDirection: "column", alignItems: "center", textAlign: "center", padding: "0 22px calc(24px + env(safe-area-inset-bottom))" }}>
        {/* The logo's boat out on open water (a picture; the name follows). */}
        <div style={{ width: "calc(100% + 44px)", margin: "0 -22px", background: "var(--artSky)", paddingTop: "env(safe-area-inset-top)" }}>
          <Scene name="welcome" w={390} h={280} style={{ height: "min(30dvh, 260px)", width: "100%" }} />
        </div>
        <div style={{ flex: 1, display: "flex", flexDirection: "column", justifyContent: "center", alignItems: "center", gap: 10, paddingTop: 8 }}>
          <Wordmark size={50} />
          <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
            <span style={{ fontSize: 13, fontWeight: 650, letterSpacing: 4, color: "var(--low)" }}>LEARN</span> <BetaTag label={t("common.beta")} />
          </div>
          <div style={{ fontSize: 15, color: "var(--mid)", marginTop: 2 }}>{t("brand.tagline")}</div>
          <h1 className="nv-disp" style={{ fontSize: 33, lineHeight: 1.12, margin: "26px 0 0" }}>{t("onb.tagline")}</h1>
          <p style={{ fontSize: 17, color: "var(--mid)", maxWidth: 340, lineHeight: 1.45, margin: "4px 0 0" }}>{t("onb.tagline.sub")}</p>
        </div>
        <div style={{ width: "100%", display: "flex", flexDirection: "column", gap: 10 }}>
          <Button full onClick={() => setStep(1)}>
            {t("onb.start")}
          </Button>
          <Button full kind="secondary" onClick={() => setSigningIn(true)}>
            {t("onb.have_account")}
          </Button>
          <div style={{ display: "flex", justifyContent: "center", gap: 6, marginTop: 8, flexWrap: "wrap" }}>
            {Object.entries(LANGS).map(([k, name]) => (
              <button key={k} onClick={() => setSetting("lang", k)} aria-pressed={locale.lang === k} style={chip(locale.lang === k)}>
                {locale.lang === k && <Chosen size={14} />}
                {name}
              </button>
            ))}
            <span style={{ width: 1, background: "var(--line)", margin: "6px 4px" }} />
            {Object.entries(REGIONS).map(([k, r]) => (
              <button key={k} onClick={() => (setSetting("region", k), setSetting("both", false))} aria-pressed={!locale.both && locale.region === k} style={chip(!locale.both && locale.region === k)}>
                {!locale.both && locale.region === k && <Chosen size={14} />}
                <span aria-hidden="true">{r.flag}</span> {r.currency}
                <span className="nv-sr"> · {r.name[locale.lang]}</span>
              </button>
            ))}
            <button onClick={() => setSetting("both", true)} aria-pressed={!!locale.both} style={chip(!!locale.both)}>
              {locale.both && <Chosen size={14} />}
              <span aria-hidden="true">🇺🇸🇲🇽</span> {t("settings.country.both")}
            </button>
          </div>
          <p style={{ fontSize: 13, color: "var(--low)", margin: "6px 0 0", lineHeight: 1.45 }}>{t("disclaimer.short")}</p>
        </div>
      </div>
    );

  const mod = extra[step - 1];
  return wrap(
    <mod.Onboard
      t={t}
      locale={locale}
      header={top}
      option={option}
      startUnit={startUnit}
      onNext={(r = {}) => {
        const start = r.startUnit || startUnit;
        if (r.startUnit) setStartUnit(r.startUnit);
        if (r.reason) setReason(r.reason);
        if (step < steps) setStep(step + 1);
        else finish(start);
      }}
    />
  );
}

const chip = (on) => ({ ...(on ? SELECTED : { border: "2px solid transparent" }), display: "inline-flex", alignItems: "center", gap: 5, background: on ? "var(--brandSoft)" : "transparent", color: "var(--ink)", borderRadius: 999, padding: "8px 12px", fontWeight: 600, fontSize: 14, cursor: "pointer", minHeight: 40 });
