// DAILY REMINDERS — notifications from the installed app, opt-in only. The
// learner picks the time; quiet hours (none 9 pm–8 am) are on by default;
// the server sends at most one a day, and only when something's waiting
// (server/push.js decides what to say from snapshot.js). A reminder
// belongs to this device, so its settings live here, not in the synced
// progress. Where the browser can't do notifications, the calendar
// reminder (an .ics file) still works.
import { useState, useSyncExternalStore } from "react";
import { getState, update, useAppState } from "./store.js";
import { addStrings } from "./i18n.js";
import { api } from "./api.js";
import { track } from "./analytics.js";
import { snapshot } from "./snapshot.js";
import { Button, Card, Note, Switch, toast } from "./ui.jsx";

const S = (en, es) => ({ en, es });
addStrings({
  "remind.title": S("Daily reminder", "Recordatorio diario"),
  "remind.how": S("At most one a day, at the time you choose, and only when something's waiting: your streak, a review, the Sunday check-in, your mission or the next lesson.", "Uno al día como máximo, a la hora que elijas, y solo cuando algo te espera: tu racha, un repaso, la revisión del domingo, tu misión o la siguiente lección."),
  "remind.on": S("Turn on reminders", "Activar recordatorios"),
  "remind.off": S("Turn off", "Desactivar"),
  "remind.at": S("Reminders on, at {time}", "Recordatorios activos, a las {time}"),
  "remind.time": S("Time", "Hora"),
  "remind.quiet": S("Quiet hours", "Horas de silencio"),
  "remind.quiet.sub": S("No reminders between 9 pm and 8 am.", "Nada de recordatorios entre las 9 pm y las 8 am."),
  "remind.saved": S("Reminder set for {time}", "Recordatorio a las {time}"),
  "remind.denied": S("Notifications are blocked for Northvale Learn. You can allow them in your browser's or phone's settings.", "Las notificaciones están bloqueadas para Northvale Learn. Puedes permitirlas en los ajustes de tu navegador o celular."),
  "remind.failed": S("Couldn't turn on reminders. Check your connection and try again.", "No se pudieron activar los recordatorios. Revisa tu conexión e intenta de nuevo."),
  "remind.ios": S("On iPhone or iPad, add Northvale Learn to your Home Screen first (Share → Add to Home Screen), then turn reminders on from there.", "En iPhone o iPad, primero agrega Northvale Learn a tu pantalla de inicio (Compartir → Agregar a inicio) y activa los recordatorios desde ahí."),
  "remind.unsupported": S("This browser can't show reminders. You can still add one to your calendar.", "Este navegador no puede mostrar recordatorios. Aún puedes agregar uno a tu calendario."),
  "remind.calendar": S("Or add it to your calendar", "O agrégalo a tu calendario"),
  "remind.ask.title": S("Want a daily reminder?", "¿Quieres un recordatorio diario?"),
  "remind.ask.no": S("No thanks", "No, gracias"),
});

const KEY = "northvale-learn-push";
const listeners = new Set();
function read() {
  try {
    return JSON.parse(localStorage.getItem(KEY)) || null;
  } catch {
    return null;
  }
}
let current = typeof window === "undefined" ? null : read();
function write(v) {
  current = v;
  try {
    if (v) localStorage.setItem(KEY, JSON.stringify(v));
    else localStorage.removeItem(KEY);
  } catch {}
  listeners.forEach((l) => l());
}
export const useReminder = () => useSyncExternalStore((l) => (listeners.add(l), () => listeners.delete(l)), () => current);

export const pushSupported = () => typeof window !== "undefined" && window.isSecureContext && "serviceWorker" in navigator && "PushManager" in window && "Notification" in window;
const isIOS = () => /iPad|iPhone|iPod/.test(navigator.userAgent) || (navigator.platform === "MacIntel" && navigator.maxTouchPoints > 1);
const zone = () => {
  try {
    return Intl.DateTimeFormat().resolvedOptions().timeZone || "UTC";
  } catch {
    return "UTC";
  }
};
const QUIET = (min) => min >= 21 * 60 || min < 8 * 60;
const toMin = (hhmm) => Number(hhmm.slice(0, 2)) * 60 + Number(hhmm.slice(3));
// Every half hour; within quiet hours only when they're off.
export const timeOptions = (quiet) => Array.from({ length: 48 }, (_, i) => `${String(Math.floor(i / 2)).padStart(2, "0")}:${i % 2 ? "30" : "00"}`).filter((x) => !quiet || !QUIET(toMin(x)));
export const timeLabel = (hhmm, lang) => new Date(2000, 0, 1, Number(hhmm.slice(0, 2)), Number(hhmm.slice(3))).toLocaleTimeString(lang === "es" ? "es-MX" : "en-US", { hour: "numeric", minute: "2-digit" });

const body = (r) => ({ id: r.id, time: r.time, quiet: r.quiet, tz: zone(), lang: getState().settings.lang, summary: snapshot() });
const fromB64 = (s) => Uint8Array.from(atob(s.replace(/-/g, "+").replace(/_/g, "/")), (c) => c.charCodeAt(0));

export async function turnOn({ time, quiet = true }) {
  if ((await Notification.requestPermission()) !== "granted") throw Object.assign(new Error("denied"), { code: "DENIED" });
  const reg = await Promise.race([navigator.serviceWorker.ready, new Promise((_, no) => setTimeout(() => no(new Error("no service worker")), 10000))]);
  const { key } = await api("/api/push/key");
  const sub = (await reg.pushManager.getSubscription()) || (await reg.pushManager.subscribe({ userVisibleOnly: true, applicationServerKey: fromB64(key) }));
  const r = { id: (current && current.id) || crypto.randomUUID(), time, quiet };
  await api("/api/push", { method: "PUT", body: { ...body(r), sub: sub.toJSON() } });
  write(r);
  track("push_on");
}
export async function changeReminder(patch) {
  const r = { ...current, ...patch };
  await api("/api/push", { method: "PUT", body: body(r) });
  write(r);
}
// Also used by "Delete my data".
export async function turnOff() {
  const r = current;
  write(null);
  if (!r) return;
  await api("/api/push", { method: "DELETE", body: { id: r.id } }).catch(() => {});
  try {
    const reg = await navigator.serviceWorker.getRegistration();
    const sub = reg && (await reg.pushManager.getSubscription());
    if (sub) await sub.unsubscribe();
  } catch {}
  track("push_off");
}

// While reminders are on, the server's few words about what's next follow
// the app (a few seconds after each change).
let timer = null;
export function scheduleReminderUpdate() {
  if (!current) return;
  clearTimeout(timer);
  timer = setTimeout(() => current && api("/api/push", { method: "PUT", body: body(current) }).catch(() => {}), 5000);
}

function TimeSelect({ t, lang, value, quiet, onChange }) {
  return (
    <label style={{ flex: 1, minWidth: 140 }}>
      <span style={{ display: "block", fontSize: 14, fontWeight: 650, color: "var(--mid)", marginBottom: 6 }}>{t("remind.time")}</span>
      <select value={value} onChange={(e) => onChange(e.target.value)} style={{ width: "100%", border: "1px solid var(--line)", borderRadius: 14, padding: "12px", background: "var(--surface)", color: "var(--ink)", fontSize: 16 }}>
        {timeOptions(quiet).map((x) => (
          <option key={x} value={x}>
            {timeLabel(x, lang)}
          </option>
        ))}
      </select>
    </label>
  );
}

const failMessage = (t, e) => (e.code === "DENIED" ? t("remind.denied") : t("remind.failed"));

// Settings → Learning. `calendar` is the .ics fallback (Settings has it).
export function ReminderSettings({ t, calendar }) {
  const lang = useAppState((s) => s.settings.lang);
  const r = useReminder();
  const [time, setTime] = useState((r && r.time) || "18:00");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState(null);
  const run = async (fn) => {
    setBusy(true);
    setError(null);
    try {
      await fn();
    } catch (e) {
      setError(failMessage(t, e));
    } finally {
      setBusy(false);
    }
  };
  const row = { display: "flex", alignItems: "flex-end", gap: 10, flexWrap: "wrap" };
  return (
    <div>
      <div style={{ fontWeight: 650, marginBottom: 4 }}>{r ? t("remind.at", { time: timeLabel(r.time, lang) }) : t("remind.title")}</div>
      <p style={{ fontSize: 14, color: "var(--mid)", lineHeight: 1.45, margin: "0 0 10px" }}>{t("remind.how")}</p>
      {!pushSupported() ? (
        <Note icon="info" style={{ marginBottom: 12 }}>{isIOS() ? t("remind.ios") : t("remind.unsupported")}</Note>
      ) : r ? (
        <>
          <div style={row}>
            <TimeSelect t={t} lang={lang} value={r.time} quiet={r.quiet} onChange={(v) => run(() => changeReminder({ time: v }).then(() => toast(t("remind.saved", { time: timeLabel(v, lang) }), "good")))} />
            <Button size="md" kind="secondary" disabled={busy} onClick={() => run(turnOff)}>
              {t("remind.off")}
            </Button>
          </div>
          <div style={{ display: "flex", alignItems: "center", gap: 12, marginTop: 12 }}>
            <div style={{ flex: 1 }}>
              <div style={{ fontWeight: 650 }}>{t("remind.quiet")}</div>
              <div style={{ fontSize: 14, color: "var(--mid)" }}>{t("remind.quiet.sub")}</div>
            </div>
            <Switch label={t("remind.quiet")} checked={r.quiet} onChange={(quiet) => run(() => changeReminder(quiet && QUIET(toMin(r.time)) ? { quiet, time: "18:00" } : { quiet }))} />
          </div>
        </>
      ) : (
        <div style={row}>
          <TimeSelect t={t} lang={lang} value={time} quiet onChange={setTime} />
          <Button size="md" disabled={busy} onClick={() => run(() => turnOn({ time }).then(() => toast(t("remind.saved", { time: timeLabel(time, lang) }), "good")))}>
            {t("remind.on")}
          </Button>
        </div>
      )}
      {error && <Note tone="bad" style={{ marginTop: 10 }}>{error}</Note>}
      {!r && calendar && (
        <details style={{ marginTop: 12 }}>
          <summary style={{ cursor: "pointer", fontSize: 14, fontWeight: 650, color: "var(--mid)", minHeight: 32 }}>{t("remind.calendar")}</summary>
          <div style={{ marginTop: 10 }}>{calendar}</div>
        </details>
      )}
    </div>
  );
}

// Home, once: after a second day of learning, where the browser can do it.
export function ReminderCard({ t }) {
  const profile = useAppState((s) => s.profile);
  const days = useAppState((s) => (s.progress.lessonDays || []).length);
  const lang = useAppState((s) => s.settings.lang);
  const r = useReminder();
  const [time, setTime] = useState("18:00");
  const [error, setError] = useState(null);
  if (r || profile.remindAsked || days < 2 || !pushSupported() || !(profile.ageBand || profile.ageAsked)) return null;
  const done = () => update((s) => ({ ...s, profile: { ...s.profile, remindAsked: true } }));
  return (
    <Card style={{ marginTop: 12 }}>
      <div style={{ fontWeight: 750, fontSize: 17 }}>{t("remind.ask.title")}</div>
      <p style={{ fontSize: 14, color: "var(--mid)", lineHeight: 1.45, margin: "4px 0 12px" }}>{t("remind.how")}</p>
      <div style={{ display: "flex", alignItems: "flex-end", gap: 10, flexWrap: "wrap" }}>
        <TimeSelect t={t} lang={lang} value={time} quiet onChange={setTime} />
        <Button size="md" onClick={() => turnOn({ time }).then(() => (done(), toast(t("remind.saved", { time: timeLabel(time, lang) }), "good")), (e) => setError(failMessage(t, e)))}>
          {t("remind.on")}
        </Button>
      </div>
      {error && <Note tone="bad" style={{ marginTop: 10 }}>{error}</Note>}
      <Button kind="ghost" size="md" onClick={done} style={{ marginTop: 6 }}>
        {t("remind.ask.no")}
      </Button>
    </Card>
  );
}
