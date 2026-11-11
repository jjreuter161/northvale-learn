// npm run seed:demo — the demo people, for the preview or a local copy:
//   Dani, the demo learner (18–25, English/US): two goals with money set
//     aside, three weeks of lessons (five units done and Compound interest),
//     a 6-day streak, a practice T-bill fund, a finished Money Mission;
//   this week's league around Dani: Maya, Leo and Ari (18+), and Sofía and
//     Teo in the 13–17 league.
// It works through a running server on this computer (default
// http://localhost:8950) and refuses anything else — another address, the
// production server (its /api/health says so), or a machine set up as the
// live one (NODE_ENV=production or Fly.io). Running it again puts the demo
// people back where they started; real accounts aren't touched.
//   npm run seed:demo
//   npm run seed:demo -- --url http://localhost:8951
// The demo accounts use @example.test addresses (that domain can't get
// mail) and the one test password below. To see Dani in the app, sign in
// with dani@example.test in Settings.
import { pathToFileURL } from "node:url";
import { ALL_LESSONS } from "../src/modules/lessons/content.js";
import { MISSIONS } from "../src/modules/missions/catalog.js";
import { newGoal } from "../src/modules/goals/plan.js";
import { newPortfolio, buy } from "../src/modules/portfolio/engine.js";
import { sampleQuote } from "../src/modules/portfolio/sample.js";
import { dayKey, addDays, weekStart } from "../src/core/progress.js";

export const DEMO_PASSWORD = "northvale-demo-only-2026";
const LOCAL = new Set(["localhost", "127.0.0.1", "[::1]"]);

// Refuses unless this is clearly a test server on this computer.
export async function checkSafe(base) {
  if (process.env.NODE_ENV === "production" || process.env.FLY_APP_NAME || process.env.FLY_MACHINE_ID) throw new Error("This looks like the live server (NODE_ENV=production or Fly.io). Demo data is only for the preview or a local copy.");
  const url = new URL(base);
  if (!LOCAL.has(url.hostname)) throw new Error(`${url.host} isn't this computer. Demo data is only for the preview or a local copy.`);
  const health = await api(base, "/api/health");
  if (health.json.production) throw new Error("That server says it's the production server. Demo data is only for the preview or a local copy.");
}

async function api(base, path, { method = "GET", body, cookie } = {}) {
  const res = await fetch(new URL(path, base), { method, headers: { "X-Northvale": "1", "Content-Type": "application/json", ...(cookie ? { Cookie: cookie } : {}) }, body: body ? JSON.stringify(body) : undefined });
  return { status: res.status, json: await res.json().catch(() => ({})), cookie: (res.headers.get("set-cookie") || "").split(";")[0] };
}

// Signed in as this demo person: a new account, or the existing one.
async function session(base, p) {
  const signup = await api(base, "/api/auth/signup", { method: "POST", body: { email: p.email, password: DEMO_PASSWORD, nickname: p.nickname, ageBand: p.ageBand, avatar: p.avatar, guardian: p.ageBand === "13-17" } });
  if (signup.status === 200) return signup.cookie;
  const login = await api(base, "/api/auth/login", { method: "POST", body: { email: p.email, password: DEMO_PASSWORD } });
  if (login.status !== 200) throw new Error(`Couldn't sign in as ${p.email} (${login.json.error ? login.json.error.message : login.status}).`);
  return login.cookie;
}

const state = ({ nickname, ageBand, avatar, lang, region }, progress, modules = {}) => ({
  version: 1,
  updatedAt: Date.now(),
  profile: { onboarded: true, nickname, ageBand, avatar, ageAsked: true },
  settings: { lang, region, look: "white", reduceMotion: false },
  progress: { xp: 0, days: {}, streak: { count: 0, last: null, best: 0, frozen: [] }, freezes: 1, dailyGoal: 20, lessons: {}, lessonDays: [], badges: {}, counters: {}, practiced: {}, startUnit: "budget", placed: [], ...progress },
  modules,
});

// Dani, three weeks in.
export function daniState(today) {
  const d = (n) => addDays(today, n);
  const units = ["budget", "save", "banking", "paycheck", "credit", "compound"];
  const done = ALL_LESSONS.filter((l) => units.includes(l.unit));
  // Lesson days: a 4-day run, a 3-day break, then 6 days in a row up to yesterday.
  const lessonDays = [d(-16), d(-15), d(-14), d(-13), d(-9), d(-8), d(-6), d(-5), d(-4), d(-3), d(-2), d(-1)].filter((x, i, a) => a.indexOf(x) === i);
  const streakDays = [d(-6), d(-5), d(-4), d(-3), d(-2), d(-1)];
  const lessons = {};
  const days = {};
  done.forEach((l, i) => {
    const on = lessonDays[Math.min(lessonDays.length - 1, Math.floor((i * lessonDays.length) / done.length))];
    lessons[l.id] = { done: true, at: on, last: on, best: i % 3 ? 0 : 1, times: 1 };
    days[on] = (days[on] || 0) + (i % 3 ? 15 : 10);
  });
  const xp = Object.values(days).reduce((t, x) => t + x, 0) + 20;
  const car = { ...newGoal({ id: "demo-car", templateId: "car", target: 5000, months: 18, start: 0, path: "save", today: d(-21), region: "US" }), contributions: [{ date: d(-18), amount: 400 }, { date: d(-11), amount: 300 }, { date: d(-4), amount: 250 }] };
  const fund = { ...newGoal({ id: "demo-fund", templateId: "emergency", target: 1000, months: 10, start: 150, path: "save", today: d(-14), region: "US" }), contributions: [{ date: d(-7), amount: 60 }] };
  const quote = sampleQuote("SGOV", new Date(`${d(-5)}T12:00:00`));
  const pf = buy(newPortfolio("US", d(-6)), { symbol: "SGOV", amount: 1000, price: quote.price, at: `${d(-5)}T18:00:00.000Z` }).pf;
  const mission = MISSIONS[0];
  return state(
    { nickname: "Dani", ageBand: "18-25", avatar: 1, lang: "en", region: "US" },
    {
      xp,
      days: { ...days, [d(-5)]: (days[d(-5)] || 0) + 20 },
      streak: { count: streakDays.length, last: d(-1), best: streakDays.length, frozen: [] },
      lessons,
      lessonDays,
      badges: { first_lesson: d(-16), perfect: d(-16), streak_3: d(-14), unit: d(-14), goal_setter: d(-21), first_trade: d(-5), mission_1: d(-5) },
      counters: { lessons: done.length, perfect: done.filter((_, i) => i % 3).length, goal: 2, trade: 1, missions: 1 },
      practiced: { goal: [d(-21)], trade: [d(-5)] },
      seen: d(-1),
    },
    { goals: { goals: [car, fund], checkIn: d(-2) }, portfolio: { pf }, missions: { active: null, log: [{ id: mission.id, day: d(-5), week: weekStart(d(-5)) }], pick: null }, feedback: { pending: [], survey: "very" } }
  );
}

// The league: a little XP today for each, so this week's standings fill in.
const LEAGUE = [
  { email: "maya@example.test", nickname: "Maya", ageBand: "18-25", avatar: 2, lang: "en", region: "US", xp: 85 },
  { email: "leo@example.test", nickname: "Leo", ageBand: "18-25", avatar: 3, lang: "es", region: "MX", xp: 60 },
  { email: "ari@example.test", nickname: "Ari", ageBand: "26+", avatar: 4, lang: "en", region: "US", xp: 40 },
  { email: "sofia@example.test", nickname: "Sofía", ageBand: "13-17", avatar: 5, lang: "es", region: "MX", xp: 70 },
  { email: "teo@example.test", nickname: "Teo", ageBand: "13-17", avatar: 0, lang: "en", region: "US", xp: 45 },
];
export const DANI = { email: "dani@example.test", nickname: "Dani", ageBand: "18-25", avatar: 1 };

export async function hasDemo(base) {
  return (await api(base, "/api/auth/login", { method: "POST", body: { email: DANI.email, password: DEMO_PASSWORD } })).status === 200;
}

export async function seedDemo(base) {
  await checkSafe(base);
  const today = dayKey();
  const people = [{ ...DANI, s: daniState(today) }, ...LEAGUE.map((p) => ({ ...p, s: state(p, { xp: p.xp * 4, days: { [today]: p.xp }, lessonDays: [today] }) }))];
  for (const p of people) {
    const cookie = await session(base, p);
    await api(base, "/api/me", { method: "PATCH", body: { nickname: p.nickname, avatar: p.avatar, league: "everyone" }, cookie });
    const r = await api(base, "/api/progress", { method: "PUT", body: { state: p.s, updatedAt: Date.now() }, cookie });
    if (r.status !== 200) throw new Error(`Couldn't save ${p.nickname}'s progress (${r.status}).`);
  }
  return people.map((p) => p.nickname);
}

if (import.meta.url === pathToFileURL(process.argv[1]).href) {
  const i = process.argv.indexOf("--url");
  const base = i > 0 ? process.argv[i + 1] : "http://localhost:8950";
  try {
    const names = await seedDemo(base);
    console.log(`Demo people ready on ${base}: ${names.join(", ")}. Sign in as ${DANI.email} (password in scripts/seed-demo.mjs) to see Dani.`);
  } catch (e) {
    console.error(e.message === "fetch failed" ? `No server at ${base}. Start the preview (or npm run dev) first.` : e.message);
    process.exit(1);
  }
}
