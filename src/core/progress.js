// PROGRESS — XP, levels, the daily streak (with streak freezes), the daily
// goal, weekly XP for the league, and badges. Pure functions over a plain
// object, so the rules are easy to test and the same everywhere.
//
// The rules, in plain words:
// - A day counts for your streak when you finish at least one lesson.
// - Miss a day and a streak freeze (if you have one) covers it
//   automatically. You start with one, earn another every 7 streak days,
//   and hold at most 2. No freeze left: the streak starts over — no guilt
//   trips, the best streak is kept.
// - Streak repair: once a calendar month, a streak of 2+ days that ended
//   can be brought back for free, within 7 days of ending (the days in
//   between count like freeze days).
// - XP: 10 a lesson (+5 if perfect), 5 for replaying a finished lesson,
//   and a little for doing things in the practice tools (once a day each).
// - Money Missions: 20 XP the first time you finish each one. They don't
//   count for the streak (that's for learning in the app).

export const dayKey = (d = new Date()) => `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
export function addDays(key, n) {
  const d = new Date(`${key}T12:00:00`);
  d.setDate(d.getDate() + n);
  return dayKey(d);
}
export const daysBetween = (a, b) => Math.round((new Date(`${b}T12:00:00`) - new Date(`${a}T12:00:00`)) / 864e5);
// Weeks start on Monday (leagues reset then).
export function weekStart(key) {
  const d = new Date(`${key}T12:00:00`);
  return addDays(key, -((d.getDay() + 6) % 7));
}

// Why someone's here → the unit they start in (onboarding).
export const START_UNITS = { save: "save", invest: "compound", debt: "credit", curious: "budget" };

export const MAX_FREEZES = 2;
export const DAILY_GOALS = [10, 20, 30, 50];
export const XP = { lesson: 10, perfect: 5, replay: 5, practice: 5, review: 10, mission: 20 };

export function newProgress() {
  return { xp: 0, days: {}, streak: { count: 0, last: null, best: 0, frozen: [] }, freezes: 1, dailyGoal: 20, lessons: {}, lessonDays: [], badges: {}, counters: {}, practiced: {}, startUnit: null, placed: [] };
}

// Level n starts at 25·n·(n−1) XP: 0, 50, 150, 300, 500, 750…
export function level(xp) {
  let n = 1;
  while (25 * (n + 1) * n <= xp) n++;
  const start = 25 * n * (n - 1);
  const next = 25 * (n + 1) * n;
  return { level: n, into: xp - start, need: next - start };
}

export const xpOn = (p, key) => p.days[key] || 0;
export const weekXp = (p, key) => {
  const start = weekStart(key);
  let total = 0;
  for (let i = 0; i < 7; i++) total += xpOn(p, addDays(start, i));
  return total;
};

function addXp(p, amount, today) {
  return { ...p, xp: p.xp + amount, days: { ...p.days, [today]: xpOn(p, today) + amount } };
}

// On opening the app: days missed since the last streak day are covered by
// freezes if there are enough, otherwise the streak ends. Returns what
// happened so the app can say so kindly.
export function settleStreak(p, today) {
  const s = p.streak;
  if (!s.last || s.count === 0) return { p, event: null };
  const missed = daysBetween(s.last, today) - 1;
  if (missed <= 0) return { p, event: null };
  if (missed <= p.freezes) {
    const frozen = Array.from({ length: missed }, (_, i) => addDays(s.last, i + 1));
    return { p: { ...p, freezes: p.freezes - missed, streak: { ...s, last: addDays(today, -1), frozen: [...s.frozen, ...frozen].slice(-60) } }, event: { type: "freeze_used", count: missed, streak: s.count } };
  }
  return { p: { ...p, streak: { ...s, count: 0, broken: { count: s.count, last: s.last, on: today } } }, event: { type: "streak_reset", lost: s.count } };
}

// STREAK REPAIR — see the rules above. Works before or after the first
// lesson of the new streak (then the two join up).
const REPAIR_DAYS = 7;
export const monthOf = (key) => key.slice(0, 7);
export function canRepair(p, today) {
  const s = p.streak;
  const b = s.broken;
  return !!b && b.count >= 2 && daysBetween(b.on, today) <= REPAIR_DAYS && s.repaired !== monthOf(today);
}
export function repairStreak(p, today) {
  if (!canRepair(p, today)) return p;
  const s = p.streak;
  const b = s.broken;
  // The new streak's first day (or today, if there isn't one yet).
  const resume = s.count > 0 ? addDays(s.last, -(s.count - 1)) : today;
  const gap = Array.from({ length: Math.max(0, daysBetween(b.last, resume) - 1) }, (_, i) => addDays(b.last, i + 1));
  const count = b.count + s.count;
  const { broken, ...rest } = s;
  return { ...p, streak: { ...rest, count, last: s.count > 0 ? s.last : addDays(today, -1), best: Math.max(s.best, count), frozen: [...s.frozen, ...gap].slice(-60), repaired: monthOf(today) } };
}

// Days since the app was last opened (null: never recorded). Older saves
// don't have `seen`; their last active day stands in.
export function awayDays(p, today) {
  const last = p.seen || [...(p.lessonDays || []), ...Object.keys(p.days || {})].sort().pop();
  return last ? daysBetween(last, today) : null;
}

// A finished lesson: XP, then the streak for today.
export function completeLesson(p, { id, perfect, mistakes = 0 }, today) {
  const replay = !!(p.lessons[id] && p.lessons[id].done);
  const gained = replay ? XP.replay : XP.lesson + (perfect ? XP.perfect : 0);
  let next = addXp(p, gained, today);
  const prev = p.lessons[id];
  next.lessons = { ...p.lessons, [id]: { done: true, at: prev ? prev.at : today, last: today, best: prev && prev.best != null ? Math.min(prev.best, mistakes) : mistakes, times: ((prev && prev.times) || 0) + 1 } };
  next.counters = { ...p.counters, lessons: (p.counters.lessons || 0) + 1, perfect: (p.counters.perfect || 0) + (perfect ? 1 : 0) };
  next.lessonDays = (p.lessonDays || []).includes(today) ? p.lessonDays : [...(p.lessonDays || []), today].slice(-120);
  const extended = extendStreak(next, today);
  return { p: extended.p, gained, streakUp: extended.up, freezeEarned: extended.freezeEarned };
}

// A finished review or challenge: counts toward today's goal and the
// streak, like a lesson, without marking any lesson done.
export function completeReview(p, { kind = "review" }, today) {
  let next = addXp(p, XP.review, today);
  next.counters = { ...p.counters, [kind]: (p.counters[kind] || 0) + 1 };
  next.lessonDays = (p.lessonDays || []).includes(today) ? p.lessonDays : [...(p.lessonDays || []), today].slice(-120);
  const extended = extendStreak(next, today);
  return { p: extended.p, gained: XP.review, streakUp: extended.up, freezeEarned: extended.freezeEarned };
}

// A finished Money Mission: XP if it's the first time (see missions/pick.js).
export function completeMission(p, { first }, today) {
  const gained = first ? XP.mission : 0;
  const next = gained ? addXp(p, gained, today) : p;
  return { p: { ...next, counters: { ...p.counters, missions: (p.counters.missions || 0) + 1 } }, gained };
}

function extendStreak(p, today) {
  const s = p.streak;
  if (s.last === today) return { p, up: false, freezeEarned: false };
  const count = s.last && daysBetween(s.last, today) === 1 ? s.count + 1 : 1;
  const freezeEarned = count % 7 === 0 && p.freezes < MAX_FREEZES;
  return { p: { ...p, freezes: p.freezes + (freezeEarned ? 1 : 0), streak: { ...s, count, last: today, best: Math.max(s.best, count) } }, up: true, freezeEarned };
}

// Doing something in a practice tool (a trade, a goal, reading the news,
// asking the tutor): counted always, a little XP once a day per kind.
export function practiced(p, kind, today) {
  const counters = { ...p.counters, [kind]: (p.counters[kind] || 0) + 1 };
  const days = p.practiced[kind] || [];
  const first = !days.includes(today);
  const next = { ...p, counters, practiced: { ...p.practiced, [kind]: first ? [...days, today].slice(-60) : days } };
  return first ? { p: addXp(next, XP.practice, today), gained: XP.practice } : { p: next, gained: 0 };
}

export const goalMet = (p, today) => xpOn(p, today) >= p.dailyGoal;

// BADGES — each is a check over progress plus what the modules report
// (`facts`: holdings count, goals made, units done…). Earned once, kept.
export const BADGES = [
  { id: "first_lesson", icon: "book", test: (p) => (p.counters.lessons || 0) >= 1 },
  { id: "perfect", icon: "target", test: (p) => (p.counters.perfect || 0) >= 1 },
  { id: "streak_3", icon: "flame", test: (p) => p.streak.best >= 3 },
  { id: "streak_7", icon: "calendar", test: (p) => p.streak.best >= 7 },
  { id: "streak_30", icon: "trophy", test: (p) => p.streak.best >= 30 },
  { id: "unit", icon: "compass", test: (p, f) => (f.unitsDone || 0) >= 1 },
  { id: "path", icon: "star", test: (p, f) => f.pathDone === true },
  { id: "first_trade", icon: "chart", test: (p) => (p.counters.trade || 0) >= 1 },
  { id: "diversified", icon: "layers", test: (p, f) => (f.holdings || 0) >= 3 },
  { id: "goal_setter", icon: "target", test: (p) => (p.counters.goal || 0) >= 1 },
  { id: "news_5", icon: "news", test: (p) => (p.practiced.news || []).length >= 5 },
  { id: "curious", icon: "chat", test: (p) => (p.counters.tutor || 0) >= 5 },
  { id: "level_5", icon: "star", test: (p) => level(p.xp).level >= 5 },
  // Money Missions (real-life practice).
  { id: "mission_1", icon: "flag", test: (p, f) => (f.missionsDone || 0) >= 1 },
  { id: "mission_5", icon: "star", test: (p, f) => (f.missionsDone || 0) >= 5 },
  { id: "mission_weeks_4", icon: "calendar", test: (p, f) => (f.missionWeeks || 0) >= 4 },
  // Goal milestones reached by saving: an achievement, never XP (savings
  // are self-reported; XP comes from learning).
  { id: "ms_25", icon: "flag", test: (p, f) => (f.milestone || 0) >= 25 },
  { id: "ms_50", icon: "flag", test: (p, f) => (f.milestone || 0) >= 50 },
  { id: "ms_75", icon: "flag", test: (p, f) => (f.milestone || 0) >= 75 },
  { id: "ms_100", icon: "trophy", test: (p, f) => (f.milestone || 0) >= 100 },
];
export function awardBadges(p, facts, today) {
  const fresh = BADGES.filter((b) => !p.badges[b.id] && b.test(p, facts)).map((b) => b.id);
  if (!fresh.length) return { p, fresh };
  return { p: { ...p, badges: { ...p.badges, ...Object.fromEntries(fresh.map((id) => [id, today])) } }, fresh };
}
