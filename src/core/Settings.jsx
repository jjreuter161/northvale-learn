// SETTINGS — account, daily goal and reminder, language and country, look,
// privacy, and the "educational only" fine print in full.
import { useState } from "react";
import { useAppState, update, resetState } from "./store.js";
import { LANGS, REGIONS } from "./i18n.js";
import { DAILY_GOALS } from "./progress.js";
import { AVATARS, Button, Card, Field, Label, Note, Segmented, Sheet, Switch, Title, toast } from "./ui.jsx";
import { useSession, signIn, signUp, signOut, changePassword, deleteAccount, setNickname, setRecap, forgotPassword, resetPassword } from "./session.js";
import { analyticsOn, installId, forgetInstall } from "./analytics.js";
import { api } from "./api.js";
import { ReminderSettings, turnOff as remindersOff } from "./reminders.jsx";
import { forgetInvite } from "./invites.jsx";
import { service } from "./registry.js";


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
            <select required value={age} onChange={(e) => setAge(e.target.value)} style={{ width: "100%", border: "1px solid var(--line)", borderRadius: 10, padding: "13px 12px", background: "var(--surface)", color: "var(--ink)" }}>
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

function downloadReminder(t, time) {
  const [h, m] = time.split(":");
  const d = new Date();
  const stamp = (x) => `${x.getFullYear()}${String(x.getMonth() + 1).padStart(2, "0")}${String(x.getDate()).padStart(2, "0")}`;
  const ics = ["BEGIN:VCALENDAR", "VERSION:2.0", "PRODID:-//Northvale//Learn//EN", "BEGIN:VEVENT", `UID:northvale-learn-daily-${Date.now()}@northvale`, `DTSTAMP:${stamp(d)}T000000Z`, `DTSTART:${stamp(d)}T${h}${m}00`, "DURATION:PT5M", "RRULE:FREQ=DAILY", `SUMMARY:${t("reminder.summary")}`, `DESCRIPTION:${t("reminder.description")}`, "BEGIN:VALARM", "TRIGGER:PT0M", "ACTION:DISPLAY", `DESCRIPTION:${t("reminder.summary")}`, "END:VALARM", "END:VEVENT", "END:VCALENDAR"].join("\r\n");
  const url = URL.createObjectURL(new Blob([ics], { type: "text/calendar" }));
  const a = document.createElement("a");
  a.href = url;
  a.download = "northvale-learn-reminder.ics";
  a.click();
  setTimeout(() => URL.revokeObjectURL(url), 1000);
}

// Everything about you, everywhere: the account (if any), this device's
// usage stats on the server, class memberships (the teacher stops seeing
// you), your invite link, reminders, and everything saved on this device.
async function deleteEverything(signedIn, password) {
  if (signedIn) await deleteAccount(password);
  await service("classroom", "leaveAll")();
  await forgetInvite();
  await remindersOff();
  const id = installId();
  forgetInstall();
  await api("/api/events", { method: "DELETE", body: { installId: id } }).catch(() => {});
  try {
    localStorage.clear();
  } catch {}
  location.reload();
}

export default function Settings({ t, locale, go }) {
  const settings = useAppState((s) => s.settings);
  const profile = useAppState((s) => s.profile);
  const progress = useAppState((s) => s.progress);
  const session = useSession();
  const [time, setTime] = useState("18:00");
  const [confirm, setConfirm] = useState(null);
  const [pw, setPw] = useState({ current: "", next: "" });
  const [delPw, setDelPw] = useState("");
  const [err, setErr] = useState(null);

  const row = (label, sub, right) => (
    <div style={{ display: "flex", alignItems: "center", gap: 12, padding: "12px 0", borderTop: "1px solid var(--line)" }}>
      <div style={{ flex: 1, minWidth: 0 }}>
        <div style={{ fontWeight: 650, fontSize: 16 }}>{label}</div>
        {sub && <div style={{ fontSize: 14, color: "var(--mid)", lineHeight: 1.4, marginTop: 2 }}>{sub}</div>}
      </div>
      {right}
    </div>
  );

  return (
    <div>
      <Title>{t("nav.settings")}</Title>

      <Label>{t("settings.account")}</Label>
      <Card>
        {session.user ? (
          <>
            <div style={{ fontWeight: 750, fontSize: 17 }}>{session.user.email}</div>
            <div style={{ fontSize: 14, color: "var(--mid)", margin: "4px 0 14px" }}>{t("account.synced")}</div>
            {session.recap && row(t("recap.title"), t("recap.sub"), <Switch label={t("recap.title")} checked={!!session.user.recap} onChange={(v) => setRecap(v).then(() => toast(t(v ? "recap.on" : "recap.off"), "good"), (e) => toast(e.message))} />)}
            <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
              <Button kind="secondary" size="md" onClick={() => signOut().then(() => toast(t("account.signed_out")))}>
                {t("account.signout")}
              </Button>
              <Button kind="secondary" size="md" onClick={() => (setErr(null), setConfirm("password"))}>
                {t("account.change_pw")}
              </Button>
              <Button kind="ghost" size="md" style={{ color: "var(--bad)" }} onClick={() => (setErr(null), setConfirm("delete"))}>
                {t("account.delete")}
              </Button>
            </div>
          </>
        ) : (
          <>
            <p style={{ fontSize: 15, lineHeight: 1.5, margin: "0 0 14px", color: "var(--mid)" }}>{t("account.why")}</p>
            <AccountForm t={t} />
          </>
        )}
      </Card>

      <Label>{t("settings.profile")}</Label>
      <Card>
        <Field label={t("onb.nick.label")} value={profile.nickname} maxLength={24} onChange={(e) => update((s) => ({ ...s, profile: { ...s.profile, nickname: e.target.value.slice(0, 24) } }))} onBlur={() => session.user && setNickname(profile.nickname).catch(() => {})} placeholder={t("onb.nick.placeholder")} hint={t("onb.nick.hint")} />
        <div style={{ fontSize: 14, fontWeight: 650, color: "var(--mid)", marginBottom: 8 }}>{t("onb.avatar")}</div>
        <div style={{ display: "flex", gap: 10, flexWrap: "wrap" }}>
          {AVATARS.map((c, i) => (
            <button key={c} onClick={() => update((s) => ({ ...s, profile: { ...s.profile, avatar: i } }))} aria-label={t("onb.avatar.n", { n: i + 1 })} aria-pressed={profile.avatar === i} style={{ width: 40, height: 40, borderRadius: 20, background: c, border: profile.avatar === i ? "3px solid var(--ink)" : "3px solid transparent", cursor: "pointer" }} />
          ))}
        </div>
      </Card>

      <Label>{t("settings.learning")}</Label>
      <Card>
        <div style={{ fontWeight: 650, marginBottom: 10 }}>{t("settings.daily_goal")}</div>
        <Segmented label={t("settings.daily_goal")} value={progress.dailyGoal} onChange={(v) => update((s) => ({ ...s, progress: { ...s.progress, dailyGoal: v } }))} options={DAILY_GOALS.map((g) => ({ value: g, label: t("goal.minutes", { n: g / 2 }) }))} />
        <div style={{ marginTop: 16, paddingTop: 14, borderTop: "1px solid var(--line)" }}>
          <ReminderSettings
            t={t}
            calendar={
              <>
                <div style={{ display: "flex", alignItems: "flex-end", gap: 10 }}>
                  <label style={{ flex: 1 }}>
                    <span style={{ display: "block", fontWeight: 650, marginBottom: 6 }}>{t("settings.reminder")}</span>
                    <input type="time" value={time} onChange={(e) => setTime(e.target.value)} style={{ width: "100%", border: "1px solid var(--line)", borderRadius: 14, padding: "11px 12px", background: "var(--surface)", color: "var(--ink)" }} />
                  </label>
                  <Button size="md" onClick={() => downloadReminder(t, time)}>
                    {t("settings.reminder.add")}
                  </Button>
                </div>
                <p style={{ fontSize: 13, color: "var(--low)", margin: "8px 0 0", lineHeight: 1.4 }}>{t("settings.reminder.how")}</p>
              </>
            }
          />
        </div>
      </Card>

      <Label>{t("settings.language")}</Label>
      <Card>
        <Segmented label={t("settings.language")} value={settings.lang} onChange={(v) => setSetting("lang", v)} options={Object.entries(LANGS).map(([value, label]) => ({ value, label }))} />
        <div style={{ height: 12 }} />
        <Segmented label={t("settings.country")} value={settings.region} onChange={(v) => setSetting("region", v)} options={Object.entries(REGIONS).map(([value, r]) => ({ value, label: `${r.flag} ${r.name[locale.lang]}` }))} />
        <p style={{ fontSize: 13, color: "var(--low)", margin: "10px 0 0", lineHeight: 1.4 }}>{t("settings.country.how")}</p>
      </Card>

      <Label>{t("settings.look")}</Label>
      <Card>
        <Segmented label={t("settings.look")} value={settings.look} onChange={(v) => setSetting("look", v)} options={[{ value: "white", label: t("look.white") }, { value: "navy", label: t("look.navy") }]} />
        {row(t("settings.motion"), t("settings.motion.sub"), <Switch label={t("settings.motion")} checked={settings.reduceMotion} onChange={(v) => setSetting("reduceMotion", v)} />)}
      </Card>

      <Label>{t("settings.privacy")}</Label>
      <Card>
        <p style={{ fontSize: 15, lineHeight: 1.55, margin: 0 }}>{t("privacy.body")}</p>
        {row(t("settings.analytics"), t("settings.analytics.sub"), <Switch label={t("settings.analytics")} checked={analyticsOn()} onChange={(v) => setSetting("analytics", v)} />)}
        <div style={{ display: "flex", gap: 8, flexWrap: "wrap", marginTop: 14 }}>
          <Button kind="secondary" size="md" onClick={() => setConfirm("reset")}>
            {t("settings.reset")}
          </Button>
          <Button kind="ghost" size="md" style={{ color: "var(--bad)" }} onClick={() => (setErr(null), setConfirm("wipe"))}>
            {t("settings.delete_data")}
          </Button>
        </div>
      </Card>

      <Label>{t("settings.legal")}</Label>
      <Card pad={0}>
        {[
          ["privacy", t("legal.privacy")],
          ["terms", t("legal.terms")],
        ].map(([doc, label], i) => (
          <button key={doc} onClick={() => go("legal", { doc })} style={{ display: "flex", justifyContent: "space-between", alignItems: "center", width: "100%", border: "none", borderTop: i ? "1px solid var(--line)" : "none", background: "transparent", color: "var(--ink)", padding: "14px 16px", fontSize: 15, fontWeight: 600, cursor: "pointer", minHeight: 52 }}>
            {label}
            <span style={{ fontSize: 12, fontWeight: 600, color: "var(--mid)", background: "var(--surface2)", borderRadius: 6, padding: "3px 7px" }}>{t("legal.draft")}</span>
          </button>
        ))}
      </Card>

      <Label>{t("settings.about")}</Label>
      <Note icon="shield">{t("disclaimer.full")}</Note>

      <Sheet open={confirm === "reset"} onClose={() => setConfirm(null)} title={t("settings.reset")}>
        <p style={{ fontSize: 16, lineHeight: 1.5, marginTop: 0 }}>{t("settings.reset.body")}</p>
        <Button full kind="bad" onClick={() => (resetState(), setConfirm(null))}>
          {t("settings.reset.yes")}
        </Button>
      </Sheet>
      <Sheet open={confirm === "wipe"} onClose={() => setConfirm(null)} title={t("settings.delete_data")}>
        <p style={{ fontSize: 16, lineHeight: 1.5, marginTop: 0 }}>{t(session.user ? "settings.delete_data.body_account" : "settings.delete_data.body")}</p>
        <form
          onSubmit={async (e) => {
            e.preventDefault();
            try {
              await deleteEverything(!!session.user, delPw);
            } catch (x) {
              setErr(x.message);
            }
          }}
        >
          {session.user && <Field label={t("account.password")} type="password" autoComplete="current-password" required value={delPw} onChange={(e) => setDelPw(e.target.value)} />}
          {err && <Note tone="bad" style={{ marginBottom: 12 }}>{err}</Note>}
          <Button full kind="bad" type="submit">{t("settings.delete_data.yes")}</Button>
        </form>
      </Sheet>
      <Sheet open={confirm === "password"} onClose={() => setConfirm(null)} title={t("account.change_pw")}>
        <form
          onSubmit={async (e) => {
            e.preventDefault();
            try {
              await changePassword(pw.current, pw.next);
              setConfirm(null);
              setPw({ current: "", next: "" });
              toast(t("account.pw_changed"), "good");
            } catch (x) {
              setErr(x.message);
            }
          }}
        >
          <Field label={t("account.pw_current")} type="password" autoComplete="current-password" required value={pw.current} onChange={(e) => setPw({ ...pw, current: e.target.value })} />
          <Field label={t("account.pw_new")} type="password" autoComplete="new-password" required minLength={10} value={pw.next} onChange={(e) => setPw({ ...pw, next: e.target.value })} hint={t("account.password.hint")} />
          {err && <Note tone="bad" style={{ marginBottom: 12 }}>{err}</Note>}
          <Button full type="submit">{t("account.change_pw")}</Button>
        </form>
      </Sheet>
      <Sheet open={confirm === "delete"} onClose={() => setConfirm(null)} title={t("account.delete")}>
        <p style={{ fontSize: 16, lineHeight: 1.5, marginTop: 0 }}>{t("account.delete.body")}</p>
        <form
          onSubmit={async (e) => {
            e.preventDefault();
            try {
              await deleteAccount(delPw);
              setConfirm(null);
              setDelPw("");
              toast(t("account.deleted"));
            } catch (x) {
              setErr(x.message);
            }
          }}
        >
          <Field label={t("account.password")} type="password" autoComplete="current-password" required value={delPw} onChange={(e) => setDelPw(e.target.value)} />
          {err && <Note tone="bad" style={{ marginBottom: 12 }}>{err}</Note>}
          <Button full kind="bad" type="submit">{t("account.delete.yes")}</Button>
        </form>
      </Sheet>
    </div>
  );
}
