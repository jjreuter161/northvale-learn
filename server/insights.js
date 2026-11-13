// WHAT TESTERS DO — usage events, the "how disappointed would you be"
// survey, feedback, and errors, kept as small counts per random install ID
// (made on the device; not linked to an account, name, email or IP), plus
// the numbers the admin page shows: day-1, day-7 and day-30 return,
// lessons per learner, where people stop inside a lesson, streaks, tutor
// questions, and what brings people back (reminders, the welcome-back
// screen, streak repair, the weekly email) and whether it works.
import { store } from "./store.js";

const EVENTS = new Set(["app_open", "onboarding", "lesson_step", "lesson_complete", "review_complete", "challenge_complete", "placement", "tutor_ask", "practice", "account_created", "mission_start", "mission_done", "comeback", "comeback_start", "streak_lost", "streak_repair", "push_on", "push_off", "push_open", "recap_open", "share"]);
const ID = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
const DAY = /^\d{4}-\d{2}-\d{2}$/;
const str = (x, n = 64) => String(x == null ? "" : x).replace(/[\u0000-\u001f]/g, " ").slice(0, n);
const num = (x) => (Number.isFinite(Number(x)) ? Math.max(0, Math.min(1e6, Number(x))) : 0);
const bad = (m) => Object.assign(new Error(m), { status: 400 });

const A = () => store.section("analytics", () => ({ installs: {}, lessons: {}, practice: {} }));

// ponytail: in-memory rate limits per install and per address — fine for
// one server process.
const seen = new Map();
// Forget keys with nothing recent, so the map doesn't grow forever.
setInterval(() => {
  const now = Date.now();
  for (const [k, list] of seen) if (!list.some((t) => now - t < 86400000)) seen.delete(k);
}, 600000).unref();
export function allowed(key, max, windowMs = 3600000) {
  const now = Date.now();
  const list = (seen.get(key) || []).filter((t) => now - t < windowMs);
  if (list.length >= max) return false;
  list.push(now);
  seen.set(key, list);
  return true;
}

export function record({ installId, events }, ip) {
  if (!ID.test(String(installId))) throw bad("Bad install ID.");
  if (!Array.isArray(events) || events.length > 50) throw bad("Bad events.");
  if (!allowed(`ev:${installId}`, 400) || !allowed(`evip:${ip}`, 2000)) return { ok: true, dropped: true };
  const a = A();
  for (const e of events) {
    if (!e || !EVENTS.has(e.name) || !DAY.test(String(e.day))) continue;
    const p = e.props && typeof e.props === "object" ? e.props : {};
    const inst = (a.installs[installId] ||= { first: e.day, last: e.day, days: [], lessons: 0, tutor: 0, streakMax: 0 });
    if (e.day < inst.first) inst.first = e.day;
    if (e.day > inst.last) inst.last = e.day;
    if (!inst.days.includes(e.day)) inst.days = [...inst.days, e.day].sort().slice(-90);
    inst.lang = e.lang === "es" ? "es" : "en";
    inst.region = e.region === "MX" ? "MX" : "US";
    if (e.name === "app_open") inst.streakMax = Math.max(inst.streakMax, Math.min(3650, num(p.streak)));
    if (e.name === "onboarding") Object.assign(inst, { reason: str(p.reason, 16), minutes: num(p.minutes) });
    if (e.name === "lesson_step" || e.name === "lesson_complete") {
      const lesson = str(p.lesson, 24);
      const k = `${installId}|${lesson}`;
      const l = (a.lessons[k] ||= { step: 0, of: num(p.of), done: false, day: e.day });
      l.step = Math.max(l.step, num(p.step));
      if (e.name === "lesson_complete" && !l.done) {
        l.done = true;
        inst.lessons++;
      }
    }
    // Days with a finished lesson or review, and the retention features —
    // so the admin page can show what happened after each.
    if (e.name === "lesson_complete" || e.name === "review_complete") inst.lessonDays = addTo(inst.lessonDays, e.day, 90);
    if (e.name === "comeback") inst.comebacks = addTo(inst.comebacks, e.day, 30);
    if (e.name === "comeback_start") a.comebackStarts = (a.comebackStarts || 0) + 1;
    if (e.name === "streak_lost") inst.lost = addTo(inst.lost, e.day, 30);
    if (e.name === "streak_repair") inst.repairs = addTo(inst.repairs, e.day, 30);
    if (e.name === "push_on") Object.assign(inst, { push: true, pushOn: inst.pushOn || e.day });
    if (e.name === "push_off") inst.push = false;
    if (e.name === "push_open") (a.pushOpens ||= {})[str(p.kind, 16)] = (a.pushOpens[str(p.kind, 16)] || 0) + 1;
    if (e.name === "recap_open") a.recapOpens = (a.recapOpens || 0) + 1;
    // Share cards: which kind only (what's on a card stays on the device).
    if (e.name === "share") (a.shares ||= {})[str(p.kind, 16)] = (a.shares[str(p.kind, 16)] || 0) + 1;
    if (e.name === "tutor_ask") inst.tutor++;
    if (e.name === "practice") a.practice[str(p.kind, 16)] = (a.practice[str(p.kind, 16)] || 0) + 1;
    if (e.name === "account_created") inst.account = true;
    // real-life missions: which mission, and whether a note was written — the
    // note itself never leaves the device.
    if (e.name === "mission_start" || e.name === "mission_done") {
      const mm = ((a.missions ||= {})[str(p.mission, 24)] ||= { started: 0, done: 0, notes: 0 });
      if (e.name === "mission_start") mm.started++;
      else {
        mm.done++;
        if (p.note === true) mm.notes++;
        inst.missions = (inst.missions || 0) + 1;
      }
    }
  }
  store.changed();
  return { ok: true };
}

const addTo = (list, day, max) => ((list || []).includes(day) ? list : [...(list || []), day].sort().slice(-max));

// Reminders and recaps sent by the server (push.js, recap.js).
export function countPush(kind, ok) {
  const s = (A().pushSent ||= { kinds: {}, failed: 0 });
  if (ok) s.kinds[kind] = (s.kinds[kind] || 0) + 1;
  else s.failed++;
  store.changed();
}
export function countRecap(ok, paused = false) {
  const s = (A().recapSent ||= { sent: 0, failed: 0 });
  s[ok ? "sent" : "failed"]++;
  if (ok && paused) s.paused = (s.paused || 0) + 1;
  store.changed();
}

export function forget(installId) {
  const a = A();
  delete a.installs[installId];
  for (const k of Object.keys(a.lessons)) if (k.startsWith(`${installId}|`)) delete a.lessons[k];
  const s = store.section("survey", () => []);
  for (let i = s.length - 1; i >= 0; i--) if (s[i].installId === installId) s.splice(i, 1);
  const f = store.section("feedback", () => []);
  for (const x of f) if (x.installId === installId) x.installId = null;
  store.changed();
}

export function survey({ installId, answer, why, lessons }) {
  if (!ID.test(String(installId)) || !["very", "somewhat", "not"].includes(answer)) throw bad("Bad survey answer.");
  if (!allowed(`sv:${installId}`, 3, 86400000)) return { ok: true };
  const s = store.section("survey", () => []);
  const i = s.findIndex((x) => x.installId === installId);
  const row = { installId, answer, why: str(why, 1000), lessons: num(lessons), at: new Date().toISOString() };
  if (i >= 0) s[i] = row;
  else s.push(row);
  store.changed();
  return { ok: true };
}

export function feedback({ installId, kind, text, context, screen, lang, region }, userId, ip) {
  if (!String(text || "").trim()) throw bad("Write something first.");
  if (!allowed(`fb:${ip}`, 30)) throw Object.assign(new Error("That's a lot of feedback at once — try again later."), { status: 429 });
  const f = store.section("feedback", () => []);
  f.push({ at: new Date().toISOString(), kind: ["idea", "problem", "content", "other"].includes(kind) ? kind : "other", text: str(text, 2000), context: str(context, 300), screen: str(screen, 32), lang: lang === "es" ? "es" : "en", region: region === "MX" ? "MX" : "US", installId: ID.test(String(installId)) ? installId : null, account: !!userId });
  if (f.length > 2000) f.splice(0, f.length - 2000);
  store.changed();
  return { ok: true };
}

// Errors from the app and the server; the same message counts up.
export function error({ message, stack, where, screen, version }, ip) {
  if (ip && !allowed(`err:${ip}`, 60)) return { ok: true, dropped: true };
  const list = store.section("errors", () => []);
  const msg = str(message, 300) || "(no message)";
  const hit = list.find((x) => x.message === msg && x.where === str(where, 16));
  const now = new Date().toISOString();
  let isNew = false;
  if (hit) Object.assign(hit, { count: hit.count + 1, last: now });
  else {
    isNew = true;
    list.push({ message: msg, stack: str(stack, 1500), where: str(where, 16), screen: str(screen, 32), version: str(version, 16), first: now, last: now, count: 1 });
    if (list.length > 300) list.splice(0, list.length - 300);
  }
  store.changed();
  return { ok: true, isNew };
}

const addDays = (key, n) => {
  const d = new Date(`${key}T12:00:00Z`);
  d.setUTCDate(d.getUTCDate() + n);
  return d.toISOString().slice(0, 10);
};
const pct = (a, b) => (b ? Math.round((a / b) * 1000) / 10 : null);
// Active on any day after `day`, up to 7 days later.
const backWithin7 = (i, day) => i.days.some((d) => d > day && d <= addDays(day, 7));

// WHAT BRINGS PEOPLE BACK, and what happened next. "Back within 7 days"
// only counts events at least 7 days old, so recent ones don't drag it down.
function comingBack(installs, a, today) {
  const old = (d) => d <= addDays(today, -7);
  const comebacks = installs.flatMap((i) => (i.comebacks || []).map((day) => ({ i, day })));
  const losses = installs.flatMap((i) => (i.lost || []).map((day) => ({ i, day, repaired: (i.repairs || []).some((r) => r >= day && r <= addDays(day, 7)) })));
  const rate = (list) => ({ pct: pct(list.filter((x) => old(x.day) && backWithin7(x.i, x.day)).length, list.filter((x) => old(x.day)).length), of: list.filter((x) => old(x.day)).length });
  const pushOn = installs.filter((i) => i.pushOn);
  const d7 = (list) => {
    const cohort = list.filter((i) => i.first <= addDays(today, -7));
    return { pct: pct(cohort.filter((i) => i.days.includes(addDays(i.first, 7))).length, cohort.length), of: cohort.length };
  };
  const sent = (a.pushSent && a.pushSent.kinds) || {};
  const opens = a.pushOpens || {};
  const sentTotal = Object.values(sent).reduce((t, n) => t + n, 0);
  const openTotal = Object.values(opens).reduce((t, n) => t + n, 0);
  return {
    comeback: { shown: comebacks.length, started: a.comebackStarts || 0, lessonSameDay: pct(comebacks.filter((x) => (x.i.lessonDays || []).includes(x.day)).length, comebacks.length), back7: rate(comebacks) },
    repair: { lost: losses.length, repaired: losses.filter((x) => x.repaired).length, back7Repaired: rate(losses.filter((x) => x.repaired)), back7NotRepaired: rate(losses.filter((x) => !x.repaired)) },
    push: { learnersOn: pushOn.length, onNow: installs.filter((i) => i.push).length, sent: sentTotal, failed: (a.pushSent && a.pushSent.failed) || 0, opened: openTotal, openPct: pct(openTotal, sentTotal), kinds: Object.keys({ ...sent, ...opens }).map((k) => ({ kind: k, sent: sent[k] || 0, opened: opens[k] || 0 })), day7With: d7(pushOn), day7Without: d7(installs.filter((i) => !i.pushOn)) },
    recap: { sent: (a.recapSent && a.recapSent.sent) || 0, failed: (a.recapSent && a.recapSent.failed) || 0, paused: (a.recapSent && a.recapSent.paused) || 0, opened: a.recapOpens || 0, openPct: pct(a.recapOpens || 0, (a.recapSent && a.recapSent.sent) || 0) },
  };
}
const median = (xs) => {
  if (!xs.length) return 0;
  const s = [...xs].sort((a, b) => a - b);
  const m = Math.floor(s.length / 2);
  return s.length % 2 ? s[m] : (s[m - 1] + s[m]) / 2;
};

// The admin numbers. `today` is a YYYY-MM-DD key; `titles` maps lesson ids
// to names.
export function stats(today, titles = {}, missionTitles = {}) {
  const a = A();
  const installs = Object.values(a.installs);
  const d1Cohort = installs.filter((i) => i.first <= addDays(today, -1));
  const d7Cohort = installs.filter((i) => i.first <= addDays(today, -7));
  const d30Cohort = installs.filter((i) => i.first <= addDays(today, -30));
  const back = (i, n) => i.days.includes(addDays(i.first, n));
  const within7 = (i) => i.days.some((d) => d > i.first && d <= addDays(i.first, 7));
  const quits = {};
  const started = {};
  for (const [k, l] of Object.entries(a.lessons)) {
    const lesson = k.split("|")[1];
    started[lesson] = (started[lesson] || 0) + 1;
    // A lesson started over a day ago and never finished: where they stopped.
    if (!l.done && l.day < today) {
      const key = `${lesson}#${l.step}`;
      quits[key] = (quits[key] || 0) + 1;
    }
  }
  const survey = store.section("survey", () => []);
  const count = (v) => survey.filter((x) => x.answer === v).length;
  const streaks = installs.map((i) => i.streakMax);
  const weekAgo = addDays(today, -6);
  return {
    // The beta's first week at a glance (/admin's top section).
    firstWeek: {
      startedThisWeek: installs.filter((i) => i.first >= weekAgo).length,
      threePlus: installs.filter((i) => i.lessons >= 3).length,
      feedbackThisWeek: store.section("feedback", () => []).filter((f) => f.at.slice(0, 10) >= weekAgo).length,
      errorsThisWeek: store.section("errors", () => []).filter((e) => String(e.first).slice(0, 10) >= weekAgo).length,
    },
    learners: installs.length,
    withAccount: installs.filter((i) => i.account).length,
    activeToday: installs.filter((i) => i.days.includes(today)).length,
    retention: {
      day1: { pct: pct(d1Cohort.filter((i) => back(i, 1)).length, d1Cohort.length), of: d1Cohort.length },
      day7: { pct: pct(d7Cohort.filter((i) => back(i, 7)).length, d7Cohort.length), of: d7Cohort.length },
      within7: { pct: pct(d7Cohort.filter(within7).length, d7Cohort.length), of: d7Cohort.length },
      day30: { pct: pct(d30Cohort.filter((i) => back(i, 30)).length, d30Cohort.length), of: d30Cohort.length },
    },
    comingBack: comingBack(installs, a, today),
    lessons: { total: installs.reduce((t, i) => t + i.lessons, 0), perLearnerAvg: installs.length ? Math.round((installs.reduce((t, i) => t + i.lessons, 0) / installs.length) * 10) / 10 : 0, perLearnerMedian: median(installs.map((i) => i.lessons)), zero: installs.filter((i) => !i.lessons).length },
    quitPoints: Object.entries(quits)
      .sort((x, y) => y[1] - x[1])
      .slice(0, 15)
      .map(([k, n]) => {
        const [lesson, step] = k.split("#");
        return { lesson, title: titles[lesson] || lesson, step: Number(step) + 1, learners: n, ofStarted: started[lesson] || 0 };
      }),
    streaks: { median: median(streaks), max: Math.max(0, ...streaks), atLeast3: streaks.filter((s) => s >= 3).length, atLeast7: streaks.filter((s) => s >= 7).length },
    tutor: { questions: installs.reduce((t, i) => t + i.tutor, 0), learnersAsking: installs.filter((i) => i.tutor > 0).length },
    reasons: installs.reduce((m, i) => (i.reason ? { ...m, [i.reason]: (m[i.reason] || 0) + 1 } : m), {}),
    practice: a.practice,
    shares: a.shares || {},
    missions: {
      done: installs.reduce((t, i) => t + (i.missions || 0), 0),
      learners: installs.filter((i) => i.missions).length,
      list: Object.entries(a.missions || {})
        .map(([id, m]) => ({ id, title: missionTitles[id] || id, ...m }))
        .sort((x, y) => y.done - x.done || y.started - x.started),
    },
    survey: { answers: survey.length, very: count("very"), somewhat: count("somewhat"), not: count("not"), veryPct: pct(count("very"), survey.length), recent: survey.slice(-20).reverse().map(({ answer, why, lessons, at }) => ({ answer, why, lessons, at })) },
    feedback: store.section("feedback", () => []).slice(-50).reverse().map(({ installId, ...rest }) => rest),
    errors: [...store.section("errors", () => [])].sort((x, y) => y.last.localeCompare(x.last)).slice(0, 30),
  };
}
