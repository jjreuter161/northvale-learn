// FIRST RUN — three screens, then straight into a lesson: welcome, the
// steps modules add (Lessons: one warm-up question, answered in 3 taps from
// opening the app; Goals: what you want money skills for, which picks the
// first unit). No account, no age, no name first: the first lesson is the
// hook, and the account offer comes after it (that's where the age check
// lives). The 2-minute "skip what you know" check is offered later, after a
// lesson (Today and the finish screen), not before anyone has started.
import { useState } from "react";
import { update, useAppState } from "./store.js";
import { useSession } from "./session.js";
import { LANGS, REGIONS } from "./i18n.js";
import { Button, Scene, Wordmark, Icon, BetaTag, SELECTED, Chosen } from "./ui.jsx";
import { LATEST_NOTE } from "./whatsnew.jsx";
import { AccountForm } from "./Account.jsx";
import { track } from "./analytics.js";
import { useLayout } from "./layout.js";
import Split from "./Split.jsx";
import { allModules, service } from "./registry.js";

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
  // School mode (a tester link, or the classroom flag on for everyone): "I'm a student / I'm a teacher" first.
  const session = useSession();
  const school = !!(useAppState((s) => s.settings.school) || (session.flags || {}).classroom);
  const [role, setRole] = useState("student");
  const [teaching, setTeaching] = useState(false);
  const extra = allModules()
    .filter((m) => m.Onboard)
    .sort((a, b) => rank(a) - rank(b));
  const steps = extra.length;
  const setSetting = (k, v) => update((s) => ({ ...s, settings: { ...s.settings, [k]: v } }));
  const finish = (start) => {
    // Someone new doesn't need "What's new".
    update((s) => ({ ...s, profile: { ...s.profile, onboarded: true, reason, seenNote: LATEST_NOTE, ...(school ? { role: "student" } : {}) }, progress: { ...s.progress, startUnit: start } }));
    track("onboarding", { reason });
    onDone(start);
  };
  // A teacher's account is made; their classes are next (the email to confirm, then a class to name).
  const finishTeacher = () => {
    update((s) => ({ ...s, profile: { ...s.profile, onboarded: true, reason: "teach", role: "teacher", seenNote: LATEST_NOTE } }));
    track("onboarding", { reason: "teach" });
    onDone(null, "classroom");
  };
  // "Have a class code?": straight to Today, where the join screen opens.
  const joinClass = () => {
    service("classroom", "askJoin")();
    update((s) => ({ ...s, profile: { ...s.profile, onboarded: true, reason, role: "student", seenNote: LATEST_NOTE } }));
    track("onboarding", { reason: "join" });
    onDone(null);
  };

  const wrap = (children) => (
    <div className="nv-in" key={step} style={phone ? { maxWidth: 520, margin: "0 auto", minHeight: "100dvh", display: "flex", flexDirection: "column", padding: "calc(16px + env(safe-area-inset-top)) 18px calc(20px + env(safe-area-inset-bottom))" } : { width: "100%", maxWidth: 480, display: "flex", flexDirection: "column", padding: "24px 0" }}>
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
      <h1 className="nv-disp" style={{ fontSize: 28, margin: "0 0 8px", lineHeight: 1.15 }}>{title}</h1>
      {sub && <p style={{ fontSize: 16, color: "var(--mid)", margin: "0 0 22px", lineHeight: 1.45 }}>{sub}</p>}
    </>
  );
  const option = (key, icon, label, sub, onClick) => (
    <button key={key} onClick={onClick} className="nv-press" style={{ display: "flex", alignItems: "center", gap: 14, width: "100%", textAlign: "left", border: "1px solid var(--line)", background: "var(--surface)", color: "var(--ink)", borderRadius: 8, padding: "14px 16px", marginBottom: 10, cursor: "pointer", minHeight: 64 }}>
      {icon && (
        <span style={{ width: 38, height: 38, borderRadius: 6, background: "var(--brandSoft)", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
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
        <h1 className="nv-disp" style={{ fontSize: 28, margin: "0 0 16px" }}>{t("account.signin")}</h1>
        <AccountForm t={t} mode="signin" signinOnly onDone={() => update((s) => ({ ...s, profile: { ...s.profile, onboarded: true } }))} />
      </>
    );

  if (teaching) {
    const Setup = service("classroom", "TeacherSetup");
    return wrap(
      <>
        <button onClick={() => setTeaching(false)} aria-label={t("common.back")} style={{ border: "none", background: "transparent", color: "var(--ink)", width: 44, height: 44, display: "flex", alignItems: "center", justifyContent: "center", cursor: "pointer", marginBottom: 8 }}>
          <Icon name="back" />
        </button>
        <h1 className="nv-disp" style={{ fontSize: 28, margin: "0 0 16px", lineHeight: 1.15 }}>{t("cls.setup.title")}</h1>
        <Setup t={t} locale={locale} onDone={finishTeacher} onSignIn={() => (setTeaching(false), setSigningIn(true))} />
      </>
    );
  }

  const roles = school && (
    <div role="radiogroup" aria-label={t("onb.role.title")} style={{ width: "100%", display: "flex", flexDirection: "column", gap: 10, textAlign: "left" }}>
      {[["student", "book"], ["teacher", "users"]].map(([r, icon]) => (
        <button key={r} role="radio" aria-checked={role === r} onClick={() => setRole(r)} className="nv-press" style={{ display: "flex", alignItems: "flex-start", gap: 14, width: "100%", textAlign: "left", background: "var(--surface)", color: "var(--ink)", borderRadius: 12, padding: "14px 16px", cursor: "pointer", ...(role === r ? SELECTED : { border: "1px solid var(--line)" }) }}>
          <span style={{ width: 40, height: 40, borderRadius: 8, background: "var(--surface2)", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
            <Icon name={icon} size={20} />
          </span>
          <span style={{ flex: 1 }}>
            <span style={{ display: "block", fontSize: 17, fontWeight: 700 }}>{t(`onb.role.${r}`)}</span>
            <span style={{ display: "block", fontSize: 14, color: "var(--mid)", marginTop: 2, lineHeight: 1.4 }}>{t(`onb.role.${r}.sub`)}</span>
          </span>
        </button>
      ))}
      <Button kind="ghost" size="md" full onClick={joinClass}>
        {t("onb.role.join")}
      </Button>
    </div>
  );

  if (step === 0)
    return (
      <div className="nv-in" style={phone ? { maxWidth: 520, margin: "0 auto", minHeight: "100dvh", display: "flex", flexDirection: "column", alignItems: "center", textAlign: "center", padding: "0 22px calc(24px + env(safe-area-inset-bottom))" } : { width: "100%", maxWidth: 480, display: "flex", flexDirection: "column", gap: 28, padding: "24px 0" }}>
        {/* The logo's boat out on open water (a picture; the name follows). */}
        {phone && (
          <div style={{ width: "calc(100% + 44px)", margin: "0 -22px", background: "var(--artSky)", paddingTop: "env(safe-area-inset-top)" }}>
            <Scene name="welcome" w={390} h={200} style={{ maxHeight: "min(26dvh, 220px)", width: "100%" }} />
          </div>
        )}
        {!phone && (
          // On a computer the brand is the left half; here only what to do.
          <div>
            <h1 className="nv-disp" style={{ fontSize: 38, lineHeight: 1.1, margin: 0 }}>{t(school ? "onb.role.title" : "onb.tagline")}</h1>
            <p style={{ fontSize: 18, color: "var(--mid)", lineHeight: 1.5, margin: "12px 0 0" }}>{t(school ? "onb.role.sub" : "onb.tagline.sub")}</p>
          </div>
        )}
        {!phone && roles}
        {phone && <div style={{ flex: 1, display: "flex", flexDirection: "column", justifyContent: "center", alignItems: "center", gap: 10, paddingTop: 8 }}>
          <Wordmark size={50} />
          <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
            <span style={{ fontSize: 13, fontWeight: 650, letterSpacing: 4, color: "var(--low)" }}>LEARN</span> <BetaTag label={t("common.beta")} />
          </div>
          <div style={{ fontSize: 15, color: "var(--mid)", marginTop: 2 }}>{t("brand.tagline")}</div>
          <h1 className="nv-disp" style={{ fontSize: school ? 26 : 32, lineHeight: 1.12, margin: school ? "14px 0 0" : "26px 0 0" }}>{t(school ? "onb.role.title" : "onb.tagline")}</h1>
          <p style={{ fontSize: 17, color: "var(--mid)", maxWidth: 340, lineHeight: 1.45, margin: "4px 0 0" }}>{t(school ? "onb.role.sub" : "onb.tagline.sub")}</p>
        </div>}
        {phone && roles && <div style={{ width: "100%", marginTop: 14 }}>{roles}</div>}
        <div style={{ width: "100%", display: "flex", flexDirection: "column", gap: 10 }}>
          <Button full onClick={() => (school && role === "teacher" ? setTeaching(true) : setStep(1))}>
            {t(school ? "common.continue" : "onb.start")}
          </Button>
          <Button full kind="secondary" onClick={() => setSigningIn(true)}>
            {t("onb.have_account")}
          </Button>
          <div role="group" aria-label={t("settings.language.row")} style={{ display: "flex", alignItems: "center", justifyContent: phone ? "center" : "flex-start", gap: 6, marginTop: 8, flexWrap: "wrap", marginLeft: phone ? 0 : -8 }}>
            <span style={{ fontSize: 13, fontWeight: 650, color: "var(--mid)", minWidth: 64, textAlign: phone ? "right" : "left", padding: phone ? 0 : "0 4px 0 8px" }}>{t("settings.language.row")}</span>
            {Object.entries(LANGS).map(([k, name]) => (
              <button key={k} onClick={() => setSetting("lang", k)} aria-pressed={locale.lang === k} style={chip(locale.lang === k)}>
                {locale.lang === k && <Chosen size={14} />}
                {name}
              </button>
            ))}
          </div>
          <div role="group" aria-label={t("settings.country")} style={{ display: "flex", alignItems: "center", justifyContent: phone ? "center" : "flex-start", gap: 6, flexWrap: "wrap", marginLeft: phone ? 0 : -8 }}>
            <span style={{ fontSize: 13, fontWeight: 650, color: "var(--mid)", minWidth: 64, textAlign: phone ? "right" : "left", padding: phone ? 0 : "0 4px 0 8px" }}>{t("settings.country")}</span>
            {Object.entries(REGIONS).map(([k, r]) => (
              <button key={k} onClick={() => (setSetting("region", k), setSetting("both", false))} aria-pressed={!locale.both && locale.region === k} style={chip(!locale.both && locale.region === k)}>
                {!locale.both && locale.region === k && <Chosen size={14} />}
                {r.name[locale.lang]}
              </button>
            ))}
            <button onClick={() => setSetting("both", true)} aria-pressed={!!locale.both} style={chip(!!locale.both)}>
              {locale.both && <Chosen size={14} />}
              {t("settings.country.both")}
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

const chip = (on) => ({ ...(on ? SELECTED : { border: "2px solid transparent" }), display: "inline-flex", alignItems: "center", gap: 5, background: on ? "var(--brandSoft)" : "transparent", color: "var(--ink)", borderRadius: 8, padding: "8px 12px", fontWeight: 600, fontSize: 14, cursor: "pointer", minHeight: 40 });
