// The core's side of XP, streaks and badges: modules report what happened
// (a finished lesson, a practice trade), and this applies the rules in
// progress.js to the saved state. Badges that check module facts (units
// done, holdings…) ask the registry, so no module is imported here.
import { update, getState, emit } from "./store.js";
import { completeLesson, completeReview, completeMission, practiced, settleStreak, repairStreak, canRepair, awayDays, awardBadges, dayKey, goalMet } from "./progress.js";
import { facts } from "./registry.js";
import { track } from "./analytics.js";

function withBadges(s, today) {
  const { p, fresh } = awardBadges(s.progress, facts(s), today);
  return { s: p === s.progress ? s : { ...s, progress: p }, fresh };
}

export function recordLesson({ id, perfect, mistakes }) {
  const today = dayKey();
  let out = null;
  update((s) => {
    const before = goalMet(s.progress, today);
    const r = completeLesson(s.progress, { id, perfect, mistakes }, today);
    const b = withBadges({ ...s, progress: r.p }, today);
    out = { gained: r.gained, streakUp: r.streakUp, freezeEarned: r.freezeEarned, streak: r.p.streak.count, goalJustMet: !before && goalMet(r.p, today), badges: b.fresh };
    return b.s;
  });
  track("lesson_complete", { lesson: id, mistakes, xp: out.gained, streak: out.streak });
  emit("lesson.completed", { id, ...out });
  return out;
}

// A review or challenge session (kind: "review" | "challenge").
export function recordReview({ kind = "review", mistakes = 0 }) {
  const today = dayKey();
  let out = null;
  update((s) => {
    const before = goalMet(s.progress, today);
    const r = completeReview(s.progress, { kind }, today);
    const b = withBadges({ ...s, progress: r.p }, today);
    out = { gained: r.gained, streakUp: r.streakUp, freezeEarned: r.freezeEarned, streak: r.p.streak.count, goalJustMet: !before && goalMet(r.p, today), badges: b.fresh };
    return b.s;
  });
  track(`${kind}_complete`, { mistakes, xp: out.gained, streak: out.streak });
  emit(`${kind}.completed`, out);
  return out;
}

// A finished real-life mission. Only the mission and whether there's a note
// are counted — never the note itself.
export function recordMission({ id, first, note }) {
  const today = dayKey();
  let out = null;
  update((s) => {
    const r = completeMission(s.progress, { first }, today);
    const b = withBadges({ ...s, progress: r.p }, today);
    out = { gained: r.gained, badges: b.fresh };
    return b.s;
  });
  track("mission_done", { mission: id, note: !!note, first: !!first });
  if (out.badges.length) emit("badges.earned", { ids: out.badges });
  return out;
}

// kind: "trade" | "goal" | "news" | "tutor" | "watch" | "chart" | "review"
export function recordPractice(kind) {
  track("practice", { kind });
  const today = dayKey();
  let out = null;
  update((s) => {
    const r = practiced(s.progress, kind, today);
    const b = withBadges({ ...s, progress: r.p }, today);
    out = { gained: r.gained, badges: b.fresh };
    return b.s;
  });
  if (out.badges.length) emit("badges.earned", { ids: out.badges });
  return out;
}

// Re-checks badges after something a module did changed its facts
// (e.g. a third holding → "diversified").
export function checkBadges() {
  const today = dayKey();
  let fresh = [];
  update((s) => {
    const b = withBadges(s, today);
    fresh = b.fresh;
    return b.s;
  });
  if (fresh.length) emit("badges.earned", { ids: fresh });
  return fresh;
}

// On opening the app: missed days use streak freezes, or the streak ends;
// and how many days it's been since the last visit (3+: "welcome back").
export function settleOnOpen() {
  const today = dayKey();
  let event = null;
  let away = null;
  update((s) => {
    away = awayDays(s.progress, today);
    const r = settleStreak(s.progress, today);
    event = r.event;
    return r.p === s.progress && s.progress.seen === today ? s : { ...s, progress: { ...r.p, seen: today } };
  });
  if (event && event.type === "streak_reset") track("streak_lost", { lost: event.lost });
  return { event, away };
}

// The free monthly streak repair (progress.js has the rules).
export const repairAvailable = () => canRepair(getState().progress, dayKey());
export function repairNow() {
  const today = dayKey();
  update((s) => ({ ...s, progress: repairStreak(s.progress, today) }));
  const count = getState().progress.streak.count;
  track("streak_repair", { streak: count });
  return count;
}

export const progressNow = () => getState().progress;
