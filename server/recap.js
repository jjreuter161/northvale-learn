// THE WEEKLY EMAIL RECAP — for learners with an account who turn it on
// (Settings), and only once email is set up on the server. Sunday evening
// in their time zone: their goals, the week's lessons, and the next step.
// It stops on its own after 4 weeks without a lesson (no nagging), and the
// link at the bottom turns it off without signing in.
import { createHmac, randomBytes, timingSafeEqual } from "node:crypto";
import { store } from "./store.js";
import { sendMail, mailMode } from "./mail.js";
import { allowed, countRecap } from "./insights.js";
import { localNow } from "./push.js";
import { weekStart, weekXp, daysBetween } from "../src/core/progress.js";

const SEND_FROM = 17 * 60; // Sunday, 5 pm on
const QUIET_AFTER = 28; // days without a lesson
const ZONES = { US: "America/New_York", MX: "America/Mexico_City" };
const bad = (m) => Object.assign(new Error(m), { status: 400 });
const str = (x, n) => String(x == null ? "" : x).replace(/[\u0000-\u001f]/g, " ").slice(0, n);

const secret = () => store.section("recapKey", () => ({ key: randomBytes(32).toString("hex") })).key;
const sig = (userId) => createHmac("sha256", secret()).update(`recap-off:${userId}`).digest("base64url");
export const offToken = (userId) => `${userId}.${sig(userId)}`;
// From the link in the email (no sign-in needed).
export function turnOff(token, ip) {
  if (!allowed(`recapoff:${ip}`, 30)) throw Object.assign(new Error("Too many tries — try again later."), { status: 429 });
  const [id, given] = String(token || "").split(".");
  const want = id && sig(id);
  if (!want || !given || given.length !== want.length || !timingSafeEqual(Buffer.from(given), Buffer.from(want)) || !store.userById(id)) throw bad("That link isn't valid anymore.");
  store.updateUser(id, { recap: false });
  return { ok: true };
}

const WORDS = {
  en: {
    subject: "Your week in Northvale Learn",
    hi: (n) => (n ? `Hi ${n},` : "Hi,"),
    week: (w) => `This week: ${w.lessons} ${w.lessons === 1 ? "lesson" : "lessons"} on ${w.days} ${w.days === 1 ? "day" : "days"}, ${w.xp} XP, and a ${w.streak}-day streak.`,
    quiet: "No lessons this week, and that's okay. Here's where you are.",
    goals: "Your goals",
    goal: (g) => `- ${g.name}: ${g.saved} of ${g.target} (${g.percent}%)`,
    next: "Next step",
    lesson: (t) => `- Next lesson: ${t} (about 3 minutes)`,
    mission: (t) => `- This week's mission: ${t}`,
    open: (u) => `Open Northvale Learn: ${u}`,
    why: (u) => `You get this because you turned on the weekly recap. Turn it off: ${u}`,
    fine: "Northvale Learn is for learning. All money in the app is pretend, and nothing here is financial advice.",
  },
  es: {
    subject: "Tu semana en Northvale Learn",
    hi: (n) => (n ? `Hola, ${n}:` : "Hola:"),
    week: (w) => `Esta semana: ${w.lessons} ${w.lessons === 1 ? "lección" : "lecciones"} en ${w.days} ${w.days === 1 ? "día" : "días"}, ${w.xp} XP y una racha de ${w.streak} ${w.streak === 1 ? "día" : "días"}.`,
    quiet: "Esta semana no hubo lecciones, y está bien. Aquí vas.",
    goals: "Tus metas",
    goal: (g) => `- ${g.name}: ${g.saved} de ${g.target} (${g.percent}%)`,
    next: "Siguiente paso",
    lesson: (t) => `- Siguiente lección: ${t} (unos 3 minutos)`,
    mission: (t) => `- La misión de esta semana: ${t}`,
    open: (u) => `Abre Northvale Learn: ${u}`,
    why: (u) => `Te llega porque activaste el resumen semanal. Para apagarlo: ${u}`,
    fine: "Northvale Learn es para aprender. Todo el dinero en la app es de práctica y nada aquí es asesoría financiera.",
  },
};

// The email for one learner's week (`today` is their Sunday), or null when
// there's nothing to send (no lesson in 4 weeks).
export function recapFor({ user, state, today, base }) {
  const p = (state && state.progress) || {};
  const snap = (state && state.snapshot) || {};
  const lessonDays = Array.isArray(p.lessonDays) ? p.lessonDays : [];
  const last = [...lessonDays].sort().pop();
  if (!last || daysBetween(last, today) > QUIET_AFTER) return null;
  const week = weekStart(today);
  const w = {
    lessons: Object.values(p.lessons || {}).filter((l) => l && l.last >= week && l.last <= today).length,
    days: lessonDays.filter((d) => d >= week && d <= today).length,
    xp: weekXp({ days: p.days || {} }, today),
    streak: (p.streak && p.streak.count) || 0,
  };
  const L = WORDS[state.settings && state.settings.lang === "es" ? "es" : "en"];
  const goals = (Array.isArray(snap.goals) ? snap.goals : []).slice(0, 3).map((g) => ({ name: str(g.name, 60), saved: str(g.saved, 24), target: str(g.target, 24), percent: Math.round(Number(g.percent) || 0) }));
  const lines = [L.hi(str(user.nickname, 24)), "", w.lessons ? L.week(w) : L.quiet];
  if (goals.length) lines.push("", L.goals, ...goals.map(L.goal));
  const next = [snap.next && L.lesson(str(snap.next, 120)), snap.mission && snap.mission.title && L.mission(str(snap.mission.title, 120))].filter(Boolean);
  if (next.length) lines.push("", L.next, ...next);
  lines.push("", L.open(`${base}/?from=recap`), "", "--", L.why(`${base}/?recap_off=${offToken(user.id)}`), L.fine);
  return { subject: L.subject, text: lines.join("\n") };
}

// Every so often: whoever has the recap on and whose Sunday evening it is
// gets this week's (once a week).
export async function tick(now = new Date(), { users, progressOf, base, send = sendMail }) {
  if (mailMode() === "off") return;
  for (const user of users()) {
    if (!user.recap) continue;
    const saved = progressOf(user.id);
    const state = saved && saved.state;
    if (!state) continue;
    const zone = (state.snapshot && state.snapshot.tz) || ZONES[state.settings && state.settings.region] || ZONES.US;
    let at;
    try {
      at = localNow(now, zone);
    } catch {
      at = localNow(now, ZONES.US);
    }
    if (new Date(`${at.day}T12:00:00Z`).getUTCDay() !== 0 || at.min < SEND_FROM || user.recapWeek === weekStart(at.day)) continue;
    store.updateUser(user.id, { recapWeek: weekStart(at.day) });
    const mail = recapFor({ user, state, today: at.day, base });
    if (!mail) continue;
    const ok = await send({ to: user.email, ...mail }).then(() => true, () => false);
    countRecap(ok);
  }
}
