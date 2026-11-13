// SETTINGS — account, daily goal and reminder, language and country, look,
// privacy, and the "educational only" fine print in full.
import { useState } from "react";
import { useAppState, update, resetState } from "./store.js";
import { LANGS, REGIONS } from "./i18n.js";
import { DAILY_GOALS } from "./progress.js";
import { COLORS, PRESETS, specFor, snap, optionOk, whyNot, lookValueFor } from "./colors.js";
import { SELECTED, AVATARS, lookFrom, Icon, Button, Card, Field, Label, Note, Segmented, Sheet, Switch, Title, toast } from "./ui.jsx";
import { useSession, signIn, signUp, signOut, changePassword, deleteAccount, setNickname, setRecap, forgotPassword, resetPassword } from "./session.js";
import { analyticsOn, installId, forgetInstall } from "./analytics.js";
import { api } from "./api.js";
import { ReminderSettings, turnOff as remindersOff } from "./reminders.jsx";
import { forgetInvite } from "./invites.jsx";
import { service } from "./registry.js";
import { canVibrate } from "./feel.js";
import { AccountForm } from "./Account.jsx";

const setSetting = (k, v) => update((s) => ({ ...s, settings: { ...s.settings, [k]: v } }));

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
  const [more, setMore] = useState(false);
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
              <Button kind="ghost" size="md" onClick={() => (setErr(null), setConfirm("delete"))}>
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
                <div style={{ display: "flex", alignItems: "flex-end", gap: 10, flexWrap: "wrap" }}>
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
        <Segmented
          label={t("settings.country")}
          value={settings.both ? "BOTH" : settings.region}
          onChange={(v) => (v === "BOTH" ? setSetting("both", true) : (setSetting("region", v), setSetting("both", false)))}
          options={[...Object.entries(REGIONS).map(([value, r]) => ({ value, label: `${r.flag} ${r.name[locale.lang]}` })), { value: "BOTH", label: `🇺🇸🇲🇽 ${t("settings.country.both")}` }]}
        />
        {settings.both && (
          <>
            <div style={{ height: 12 }} />
            <Segmented label={t("settings.country.main")} value={settings.region} onChange={(v) => setSetting("region", v)} options={Object.entries(REGIONS).map(([value, r]) => ({ value, label: `${r.flag} ${r.currency}` }))} />
          </>
        )}
        <p style={{ fontSize: 13, color: "var(--low)", margin: "10px 0 0", lineHeight: 1.4 }}>{t("settings.country.how")}</p>
      </Card>

      <Label>{t("settings.look")}</Label>
      <Card>
        <LookPicker t={t} settings={settings} setSetting={setSetting} />
        {row(t("settings.motion"), t("settings.motion.sub"), <Switch label={t("settings.motion")} checked={settings.reduceMotion} onChange={(v) => setSetting("reduceMotion", v)} />)}
      </Card>

      {/* Rarely needed: tucked away so the settings stay short. */}
      <button onClick={() => setMore(!more)} aria-expanded={more} className="nv-press" style={{ display: "flex", alignItems: "center", justifyContent: "space-between", width: "100%", marginTop: 22, minHeight: 52, padding: "10px 16px", borderRadius: 18, border: "1px solid var(--line)", background: "var(--surface)", color: "var(--ink)", fontSize: 17, fontWeight: 700, cursor: "pointer", textAlign: "left" }}>
        <span>
          {t("settings.more")}
          <span style={{ display: "block", fontSize: 13, fontWeight: 500, color: "var(--mid)" }}>{t("settings.more.sub")}</span>
        </span>
        <Icon name={more ? "minus" : "plus"} size={20} />
      </button>
      {more && (
        <>
      <Label>{t("settings.soundfeel")}</Label>
      <Card>
        {row(t("settings.sound"), t("settings.sound.sub"), <Switch label={t("settings.sound")} checked={!!settings.sound} onChange={(v) => setSetting("sound", v)} />)}
        {canVibrate() && row(t("settings.vibrate"), t("settings.vibrate.sub"), <Switch label={t("settings.vibrate")} checked={settings.vibrate !== false} onChange={(v) => setSetting("vibrate", v)} />)}
      </Card>

      <Label>{t("settings.privacy")}</Label>
      <Card>
        <p style={{ fontSize: 15, lineHeight: 1.55, margin: 0 }}>{t("privacy.body")}</p>
        {row(t("settings.analytics"), t("settings.analytics.sub"), <Switch label={t("settings.analytics")} checked={analyticsOn()} onChange={(v) => setSetting("analytics", v)} />)}
        <div style={{ display: "flex", gap: 8, flexWrap: "wrap", marginTop: 14 }}>
          <Button kind="secondary" size="md" onClick={() => setConfirm("reset")}>
            {t("settings.reset")}
          </Button>
          <Button kind="ghost" size="md" onClick={() => (setErr(null), setConfirm("wipe"))}>
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
          <button key={doc} onClick={() => go("legal", { doc, from: "settings" })} style={{ display: "flex", justifyContent: "space-between", alignItems: "center", width: "100%", border: "none", borderTop: i ? "1px solid var(--line)" : "none", background: "transparent", color: "var(--ink)", padding: "14px 16px", fontSize: 15, fontWeight: 600, cursor: "pointer", minHeight: 52 }}>
            {label}
            <span style={{ fontSize: 12, fontWeight: 600, color: "var(--mid)", background: "var(--surface2)", borderRadius: 6, padding: "3px 7px" }}>{t("legal.draft")}</span>
          </button>
        ))}
      </Card>

      <Label>{t("settings.about")}</Label>
      <Note icon="shield">{t("disclaimer.full")}</Note>
        </>
      )}

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

// LOOK — four ready-made looks and Match my device, each with a small preview, and
// "Choose your own colors": three groups (background, text and icons, main buttons
// and highlights) where only readable combinations are on offer (colors.js).
function LookPicker({ t, settings, setSetting }) {
  const [own, setOwn] = useState(settings.look === "custom");
  const spec = specFor(settings, false);
  const mini = (L) => (
    <span style={{ flex: 1, display: "block", background: L["--bg"], padding: 7 }}>
      <span style={{ display: "block", height: 5, width: "55%", borderRadius: 3, background: L["--head"] }} />
      <span style={{ display: "block", height: 20, marginTop: 6, borderRadius: 6, background: L["--surface"] }} />
      <span style={{ display: "block", height: 9, marginTop: 5, borderRadius: 5, background: L["--fill"], boxShadow: `0 0 0 ${L["--ringW"]} ${L["--ringC"]}` }} />
    </span>
  );
  const previews = Object.fromEntries(PRESETS.map((p) => [p.value, lookFrom(p.bg, p.text, p.hi)]));
  const pick = (next) => {
    setSetting("look", lookValueFor(next));
    setSetting("colors", next);
  };
  const keys = [...PRESETS.map((p) => p.value), "auto"];
  const group = (g) => (
    <div key={g} style={{ marginTop: 16 }}>
      <div id={`look-g-${g}`} style={{ fontSize: 15, fontWeight: 700, marginBottom: 8 }}>{t(`look.group.${g}`)}</div>
      <div role="radiogroup" aria-labelledby={`look-g-${g}`} style={{ display: "flex", gap: 6 }}>
        {["navy", "cream", "red"].map((id) => {
          const ok = optionOk(spec, g, id);
          const on = spec[g] === id;
          const note = !ok ? t(`look.why.${whyNot(spec, g, id)}`) : g === "bg" && id === "red" ? t("look.note.bold") : g === "hi" && id === "red" && spec.bg === "navy" ? t("look.note.edge") : "";
          return (
            <button key={id} role="radio" aria-checked={on} aria-disabled={!ok} aria-describedby={note ? `look-n-${g}-${id}` : undefined} onClick={() => ok && pick(snap(spec, g, id))} className="nv-press" style={{ flex: 1, minWidth: 0, background: "transparent", border: "none", padding: 0, textAlign: "center", opacity: ok ? 1 : 0.45, cursor: ok ? "pointer" : "default", color: "var(--ink)" }}>
              <span aria-hidden="true" style={{ display: "block", width: 48, height: 48, borderRadius: 24, margin: "0 auto", background: COLORS[id].hex, border: `3px solid ${on ? "var(--ink)" : "var(--line)"}`, boxShadow: on ? "0 0 0 3px var(--bg), 0 0 0 5px var(--ink)" : "none" }} />
              <span style={{ display: "block", fontSize: 14, fontWeight: 650, marginTop: 6 }}>{t(`look.c.${id}`)}</span>
              <span id={`look-n-${g}-${id}`} style={{ display: "block", fontSize: 12, color: "var(--mid)", lineHeight: 1.25, minHeight: 30, marginTop: 2 }}>{note}</span>
            </button>
          );
        })}
      </div>
    </div>
  );
  return (
    <div style={{ marginBottom: 6 }}>
      <div role="radiogroup" aria-label={t("settings.look")} style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(130px, 1fr))", gap: 10 }}>
        {keys.map((k) => {
          const on = settings.look === k;
          return (
            <button key={k} role="radio" aria-checked={on} onClick={() => (setSetting("look", k), k !== "auto" && setSetting("colors", { bg: PRESETS.find((p) => p.value === k).bg, text: PRESETS.find((p) => p.value === k).text, hi: PRESETS.find((p) => p.value === k).hi }))} className="nv-press" style={{ gridColumn: k === "auto" ? "1 / -1" : undefined, textAlign: "left", ...(on ? SELECTED : { border: "2px solid transparent", boxShadow: "var(--lift)" }), borderRadius: 20, padding: 8, background: "var(--surface)", cursor: "pointer", color: "var(--ink)" }}>
              <span aria-hidden="true" style={{ display: "flex", height: k === "auto" ? 64 : 80, borderRadius: 14, overflow: "hidden" }}>
                {k === "auto" ? (
                  <>
                    {mini(previews.white)}
                    {mini(previews.navy)}
                  </>
                ) : (
                  mini(previews[k])
                )}
              </span>
              <span style={{ display: "flex", alignItems: "center", gap: 7, marginTop: 8, fontWeight: 700, color: "var(--head)" }}>
                <span aria-hidden="true" style={{ width: 18, height: 18, borderRadius: 8, border: "2px solid var(--brand)", display: "inline-flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
                  {on && <span style={{ width: 9, height: 9, borderRadius: 5, background: "var(--brand)" }} />}
                </span>
                {t(`look.${k}`)}
              </span>
              <span style={{ display: "block", fontSize: 13, color: "var(--low)", marginTop: 2, lineHeight: 1.35 }}>{t(`look.${k}.sub`)}</span>
            </button>
          );
        })}
      </div>
      <button onClick={() => setOwn(!own)} aria-expanded={own} className="nv-press" style={{ display: "flex", alignItems: "center", justifyContent: "space-between", width: "100%", marginTop: 12, minHeight: 48, padding: "10px 14px", borderRadius: 16, border: "1px solid var(--line)", background: "transparent", color: "var(--ink)", fontSize: 16, fontWeight: 650, cursor: "pointer", textAlign: "left" }}>
        <span>
          {t("look.own")}
          {settings.look === "custom" && <span style={{ display: "block", fontSize: 13, color: "var(--mid)", fontWeight: 500 }}>{[spec.bg, spec.text, spec.hi].map((id) => t(`look.c.${id}`)).join(" · ")}</span>}
        </span>
        <Icon name={own ? "minus" : "plus"} size={18} />
      </button>
      {own && (
        <div>
          <p style={{ fontSize: 13, color: "var(--mid)", margin: "10px 2px 0", lineHeight: 1.4 }}>{t("look.own.sub")}</p>
          {["bg", "text", "hi"].map(group)}
        </div>
      )}
    </div>
  );
}
