// ACCOUNT — sign up / sign in, the age question and the password reset screen. Small, and needed at the very
// start (first-run sign-in, the age card on Today), so it lives apart from the big Settings screen.
import { useState } from "react";
import { useAppState, update } from "./store.js";
import { Button, Card, Field, Note, toast } from "./ui.jsx";
import { useSession, signIn, signUp, forgotPassword, resetPassword } from "./session.js";

const setSetting = (k, v) => update((s) => ({ ...s, settings: { ...s.settings, [k]: v } }));

export function AccountForm({ t, mode: start = "signup", signinOnly, onDone }) {
  const profile = useAppState((x) => x.profile);
  const lang = useAppState((x) => x.settings.lang);
  const [mode, setMode] = useState(signinOnly ? "signin" : start);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [nickname, setNick] = useState(profile.nickname || "");
  const [age, setAge] = useState(profile.ageBand || "");
  const [guardian, setGuardian] = useState(false);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState(null);
  const session = useSession();
  if (session.checked && !session.online) return <Note icon="info">{t("account.offline")}</Note>;
  const signup = mode === "signup";
  const tooYoung = signup && age === "under13";
  if (mode === "forgot")
    return (
      <form
        onSubmit={async (e) => {
          e.preventDefault();
          setBusy(true);
          setError(null);
          try {
            await forgotPassword(email, lang);
            setMode("sent");
          } catch (err) {
            setError(err.code === "OFFLINE" ? t("account.offline") : err.message);
          } finally {
            setBusy(false);
          }
        }}
      >
        <p style={{ margin: "0 0 12px", color: "var(--mid)", lineHeight: 1.45 }}>{t("account.forgot.sub")}</p>
        <Field label={t("account.email")} type="email" autoComplete="username" required value={email} onChange={(e) => setEmail(e.target.value)} />
        {error && <Note tone="bad" style={{ marginBottom: 12 }}>{error}</Note>}
        <Button full type="submit" disabled={busy}>{t("account.forgot.send")}</Button>
        <Button full kind="ghost" onClick={() => setMode("signin")} style={{ marginTop: 6 }}>{t("common.back")}</Button>
      </form>
    );
  if (mode === "sent")
    return (
      <div>
        <Note tone="good" icon="check" style={{ marginBottom: 12 }}>{t("account.forgot.sent")}</Note>
        <Button full kind="secondary" onClick={() => setMode("signin")}>{t("account.signin")}</Button>
      </div>
    );
  const needsGuardian = signup && age === "13-17";
  const submit = async (e) => {
    e.preventDefault();
    if (tooYoung) return;
    setBusy(true);
    setError(null);
    try {
      if (signup) {
        update((x) => ({ ...x, profile: { ...x.profile, ageBand: age, nickname: nickname.trim().slice(0, 24) || x.profile.nickname } }));
        await signUp({ email, password, nickname: nickname.trim(), guardian });
      } else await signIn({ email, password });
      toast(t(signup ? "account.created" : "account.welcome_back"), "good");
      onDone && onDone();
    } catch (err) {
      setError(err.code === "OFFLINE" ? t("account.offline") : err.message);
    } finally {
      setBusy(false);
    }
  };
  return (
    <form onSubmit={submit}>
      <Field label={t("account.email")} type="email" autoComplete="username" required value={email} onChange={(e) => setEmail(e.target.value)} />
      <Field label={t("account.password")} type="password" autoComplete={signup ? "new-password" : "current-password"} required minLength={signup ? 10 : undefined} value={password} onChange={(e) => setPassword(e.target.value)} hint={signup ? t("account.password.hint") : undefined} />
      {signup && (
        <>
          <Field label={t("onb.nick.label")} value={nickname} onChange={(e) => setNick(e.target.value)} placeholder={t("onb.nick.placeholder")} maxLength={24} autoComplete="nickname" hint={t("onb.nick.hint")} />
          <label style={{ display: "block", marginBottom: 14 }}>
            <span style={{ display: "block", fontSize: 14, fontWeight: 650, color: "var(--mid)", marginBottom: 6 }}>{t("onb.age.title")}</span>
            <select required value={age} onChange={(e) => setAge(e.target.value)} style={{ width: "100%", border: "1px solid var(--line)", borderRadius: 6, padding: "13px 12px", background: "var(--surface)", color: "var(--ink)" }}>
              <option value="" disabled>{t("account.age.pick")}</option>
              <option value="under13">{t("onb.age.under13")}</option>
              <option value="13-17">13–17</option>
              <option value="18-25">18–25</option>
              <option value="26+">{t("onb.age.26")}</option>
            </select>
          </label>
          {tooYoung && <Note tone="bad" icon="info" style={{ marginBottom: 12 }}>{t("onb.age.too_young")}</Note>}
          {needsGuardian && (
            <label style={{ display: "flex", gap: 10, alignItems: "flex-start", fontSize: 14, lineHeight: 1.45, marginBottom: 14, cursor: "pointer" }}>
              <input type="checkbox" required checked={guardian} onChange={(e) => setGuardian(e.target.checked)} style={{ width: 20, height: 20, marginTop: 1, accentColor: "var(--brand)", flexShrink: 0 }} />
              <span>{t("account.guardian")}</span>
            </label>
          )}
          <p style={{ fontSize: 13, color: "var(--low)", lineHeight: 1.45, margin: "0 0 12px" }}>{t("account.agree")}</p>
        </>
      )}
      {error && <Note tone="bad" style={{ marginBottom: 12 }}>{error}</Note>}
      <Button full type="submit" disabled={busy || tooYoung}>
        {t(signup ? "account.create" : "account.signin")}
      </Button>
      {!signup &&
        (session.passwordReset ? (
          <Button full kind="ghost" onClick={() => (setMode("forgot"), setError(null))} style={{ marginTop: 6 }}>
            {t("account.forgot")}
          </Button>
        ) : (
          session.contact && <p style={{ fontSize: 13, color: "var(--low)", textAlign: "center", margin: "10px 0 0" }}>{t("account.forgot.contact", { email: session.contact })}</p>
        ))}
      {!signinOnly && (
        <Button full kind="ghost" onClick={() => (setMode(signup ? "signin" : "signup"), setError(null))} style={{ marginTop: 6 }}>
          {t(signup ? "account.have" : "account.new")}
        </Button>
      )}
    </form>
  );
}

// The page the emailed reset link opens (#reset=token).
// Learners without an age range (no account, or from before it was asked)
// count as 13–17, which hides what's for 18 and up. Asked once, on Home,
// after the first lesson.
export function AgeCard({ t }) {
  const profile = useAppState((x) => x.profile);
  const lessons = useAppState((x) => x.progress.counters.lessons || 0);
  if (profile.ageBand || profile.ageAsked || !lessons) return null;
  const answer = (ageBand) => update((x) => ({ ...x, profile: { ...x.profile, ageBand, ageAsked: true } }));
  return (
    <Card style={{ marginTop: 12 }}>
      <div style={{ fontWeight: 750, fontSize: 17 }}>{t("onb.age.title")}</div>
      <p style={{ fontSize: 14, color: "var(--mid)", lineHeight: 1.45, margin: "4px 0 12px" }}>{t("age.ask.sub")}</p>
      <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
        {[["13-17", "13–17"], ["18-25", "18–25"], ["26+", t("onb.age.26")]].map(([v, label]) => (
          <Button key={v} kind="secondary" size="md" style={{ border: "1px solid var(--line)" }} onClick={() => answer(v)}>
            {label}
          </Button>
        ))}
        <Button kind="ghost" size="md" onClick={() => answer(null)}>
          {t("age.ask.later")}
        </Button>
      </div>
    </Card>
  );
}

export function ResetPassword({ t, token, onDone }) {
  const [password, setPassword] = useState("");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState(null);
  return (
    <div className="nv-in" style={{ maxWidth: 480, margin: "0 auto", padding: "calc(40px + env(safe-area-inset-top)) 18px 24px" }}>
      <h1 style={{ fontSize: 26, fontWeight: 700, letterSpacing: -0.4, margin: "0 0 6px" }}>{t("account.reset.title")}</h1>
      <p style={{ color: "var(--mid)", margin: "0 0 18px", lineHeight: 1.45 }}>{t("account.reset.sub")}</p>
      <form
        onSubmit={async (e) => {
          e.preventDefault();
          setBusy(true);
          setError(null);
          try {
            await resetPassword(token, password);
            toast(t("account.reset.done"), "good");
            onDone();
          } catch (err) {
            setError(err.code === "OFFLINE" ? t("account.offline") : err.message);
          } finally {
            setBusy(false);
          }
        }}
      >
        <Field label={t("account.pw_new")} type="password" autoComplete="new-password" required minLength={10} value={password} onChange={(e) => setPassword(e.target.value)} hint={t("account.password.hint")} />
        {error && <Note tone="bad" style={{ marginBottom: 12 }}>{error}</Note>}
        <Button full type="submit" disabled={busy}>{t("account.reset.save")}</Button>
      </form>
      <Button full kind="ghost" onClick={onDone} style={{ marginTop: 6 }}>{t("common.cancel")}</Button>
    </div>
  );
}

