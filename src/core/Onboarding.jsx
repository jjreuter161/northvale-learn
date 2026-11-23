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
import { Button, Scene, Wordmark, Icon, BetaTag, Segmented } from "./ui.jsx";
import { LATEST_NOTE } from "./whatsnew.jsx";
import { AccountForm } from "./Account.jsx";
import { track } from "./analytics.js";
import { useLayout } from "./layout.js";
import Split from "./Split.jsx";
import { allModules } from "./registry.js";

const ORDER = ["lessons", "goals"]; // the warm-up question first, then what you want money skills for
const rank = (m) => (ORDER.includes(m.id) ? ORDER.indexOf(m.id) : ORDER.length);

export default function Onboarding(props) {
  const phone = useLayout() === "phone";
  return (
    <Split t={props.t} phone={phone}>
      <Steps {...props} phone={phone} />
    </Split>
  );
}

function Steps({ t, locale, onDone, phone }) {
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
    <div className="nv-in" key={step} style={phone ? { maxWidth: 520, margin: "0 auto", minHeight: "100dvh", display: "flex", flexDirection: "column", padding: "calc(16px + env(safe-area-inset-top)) 18px calc(20px + env(safe-area-inset-bottom))" } : { width: "100%", maxWidth: 480, display: "flex", flexDirection: "column", padding: "24px 0" }}>
      {children}
    </div>
  );
  const top = (title, sub, back = () => setStep(step - 1)) => (
    <>
      <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 24, minHeight: 44 }}>
        <button onClick={back} aria-label={t("common.back")} style={{ border: "none", background: "transparent", color: "var(--ink)", width: 44, height: 44, display: "flex", alignItems: "center", justifyContent: "center", cursor: "pointer" }}>
          <Icon name="back" />
        </button>
        <div style={{ flex: 1, height: 6, borderRadius: 12, background: "var(--surface2)", overflow: "hidden" }}>
          <div style={{ width: `${(step / steps) * 100}%`, height: "100%", background: "var(--accent)", borderRadius: 12, transition: "width var(--m-sheet) ease-out" }} />
        </div>
        <span style={{ fontSize: "var(--t-sm)", color: "var(--mid)", whiteSpace: "nowrap" }}>{t("onb.step", { n: step, total: steps })}</span>
      </div>
      <h1 className="nv-disp" style={{ fontSize: "var(--t-head)", margin: "0 0 8px", lineHeight: 1.2 }}>{title}</h1>
      {sub && <p style={{ fontSize: "var(--t-body)", color: "var(--mid)", margin: "0 0 24px", lineHeight: 1.5 }}>{sub}</p>}
    </>
  );
  const option = (key, icon, label, sub, onClick) => (
    <button key={key} onClick={onClick} className="nv-press" style={{ display: "flex", alignItems: "center", gap: 16, width: "100%", textAlign: "left", border: "1px solid var(--line)", background: "var(--surface)", color: "var(--ink)", borderRadius: 12, padding: 16, marginBottom: 12, cursor: "pointer", minHeight: 64 }}>
      {icon && (
        <span style={{ width: 38, height: 38, borderRadius: 12, background: "var(--brandSoft)", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
          <Icon name={icon} size={20} />
        </span>
      )}
      <span style={{ flex: 1 }}>
        <span style={{ display: "block", fontSize: "var(--t-body)", fontWeight: 600 }}>{label}</span>
        {sub && <span style={{ display: "block", fontSize: "var(--t-sm)", color: "var(--mid)", marginTop: 4 }}>{sub}</span>}
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
        <h1 className="nv-disp" style={{ fontSize: "var(--t-head)", margin: "0 0 16px" }}>{t("account.signin")}</h1>
        <AccountForm t={t} mode="signin" signinOnly onDone={() => update((s) => ({ ...s, profile: { ...s.profile, onboarded: true } }))} />
      </>
    );

  if (step === 0) {
    const setRegion = (v) => (v === "both" ? setSetting("both", true) : (setSetting("region", v), setSetting("both", false)));
    // Language and country: labelled controls, in words.
    const controls = (
      <div style={{ display: "flex", flexDirection: "column", gap: 16, marginTop: 24 }}>
        <div>
          <div className="nv-cap" aria-hidden="true" style={{ marginBottom: 8 }}>{t("settings.language.row")}</div>
          <Segmented toggle label={t("settings.language.row")} value={locale.lang} onChange={(v) => setSetting("lang", v)} options={Object.entries(LANGS).map(([k, name]) => ({ value: k, label: name }))} />
        </div>
        <div>
          <div className="nv-cap" aria-hidden="true" style={{ marginBottom: 8 }}>{t("settings.country")}</div>
          <Segmented toggle label={t("settings.country")} value={locale.both ? "both" : locale.region} onChange={setRegion} options={[...Object.entries(REGIONS).map(([k, r]) => ({ value: k, label: r.name[locale.lang] })), { value: "both", label: t("settings.country.both") }]} />
        </div>
      </div>
    );
    return (
      <div className="nv-in" style={phone ? { maxWidth: 520, margin: "0 auto", minHeight: "100dvh", display: "flex", flexDirection: "column" } : { width: "100%", maxWidth: 440 }}>
        {/* The boat out on open water: the whole picture, at the top. */}
        {phone && (
          <div style={{ background: "var(--artSky)", paddingTop: "env(safe-area-inset-top)" }}>
            <Scene name="welcome" w={390} h={200} style={{ maxHeight: "min(26dvh, 220px)", width: "100%" }} />
          </div>
        )}
        <div style={{ flex: 1, display: "flex", flexDirection: "column", padding: phone ? "16px 24px calc(24px + env(safe-area-inset-bottom))" : 0 }}>
          {phone && (
            <>
              <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                <Wordmark size={28} />
                <span className="nv-cap" style={{ letterSpacing: 4 }}>LEARN</span> <BetaTag label={t("common.beta")} />
              </div>
              <div style={{ fontSize: "var(--t-sm)", color: "var(--mid)", marginTop: 4 }}>{t("brand.tagline")}</div>
            </>
          )}
          <h1 className="nv-disp" style={{ fontSize: phone ? "var(--t-disp)" : "var(--t-head)", margin: phone ? "12px 0 8px" : "0 0 8px" }}>{t("onb.tagline")}</h1>
          <p style={{ fontSize: "var(--t-lead)", color: "var(--mid)", margin: 0 }}>{t("onb.tagline.sub")}</p>
          <div style={{ flex: 1, minHeight: 24 }} />
          <div style={{ display: "flex", flexDirection: "column", gap: 12, marginTop: phone ? 0 : 24 }}>
            <Button full onClick={() => setStep(1)}>
              {t("onb.start")}
            </Button>
            <Button full kind="secondary" onClick={() => setSigningIn(true)}>
              {t("onb.have_account")}
            </Button>
          </div>
          {controls}
          <p style={{ fontSize: "var(--t-sm)", color: "var(--low)", margin: "24px 0 0" }}>{t("disclaimer.short")}</p>
        </div>
      </div>
    );
  }

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
