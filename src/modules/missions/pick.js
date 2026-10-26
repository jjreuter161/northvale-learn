// Which missions fit someone, in what order, and the weekly bookkeeping —
// pure functions over the missions slice, so the rules are easy to test.
//
// The rules, in plain words:
// - A mission fits your country and age (some are 18+; an unknown age
//   counts as 13–17), and some need a goal (or a goal of one kind).
// - Order: missions for your main goal first, then ones for units you
//   studied this week, then setting money aside (with a goal), then units
//   you've started, then course order.
// - Each week (Monday to Sunday) suggests one; "show another" moves down
//   the list. You can start any mission any time.
// - XP the first time you finish each mission; repeatable ones (setting
//   money aside) earn it once a week. Notes stay with your progress.
import { weekStart } from "../../core/progress.js";
import { MISSIONS, missionById } from "./catalog.js";

export const NOTE_MAX = 280;
export const DEFAULTS = { active: null, log: [], pick: null };

const adultBand = (ageBand) => ageBand === "18-25" || ageBand === "26+";
export function fits(m, { region, ageBand, goalKinds = [] }) {
  if (m.only && m.only !== region) return false;
  if (m.adult && !adultBand(ageBand)) return false;
  if (m.needsGoal === true && !goalKinds.length) return false;
  if (typeof m.needsGoal === "string" && !goalKinds.includes(m.needsGoal)) return false;
  return true;
}
// Done for good — or, for a repeatable one, done this week.
export const finished = (m, log, today) => log.some((e) => e.id === m.id && (!m.repeat || e.week === weekStart(today)));

// ctx: { region, ageBand, goalKinds (main goal first), units: { started, recent } }
export function recommend(ctx, log, today) {
  const kinds = ctx.goalKinds || [];
  const { started = [], recent = [] } = ctx.units || {};
  const score = (m) => {
    const g = m.goals || [];
    let s = g.includes(kinds[0]) ? 6 : g.some((k) => kinds.includes(k)) ? 2 : 0;
    if (m.needsGoal === true) s += 2;
    s += recent.includes(m.unit) ? 3 : started.includes(m.unit) ? 1 : 0;
    return s;
  };
  return MISSIONS.filter((m) => fits(m, ctx) && !finished(m, log, today))
    .map((m, i) => [m, score(m), i])
    .sort((a, b) => b[1] - a[1] || a[2] - b[2])
    .map(([m]) => m);
}

// This week: the mission in progress, what's done, and the suggestion
// (kept for the week so it doesn't change every time Home opens).
export function thisWeek(slice, ctx, today) {
  const week = weekStart(today);
  const ranked = recommend(ctx, slice.log, today);
  const kept = slice.pick && slice.pick.week === week && ranked.find((m) => m.id === slice.pick.id);
  return { week, active: slice.active && missionById(slice.active.id), done: slice.log.filter((e) => e.week === week), suggestion: kept || ranked[0] || null, ranked };
}
export function another(slice, ctx, today) {
  const { week, ranked, suggestion } = thisWeek(slice, ctx, today);
  if (!ranked.length) return slice;
  const next = ranked[(ranked.indexOf(suggestion) + 1) % ranked.length];
  return { ...slice, pick: { week, id: next.id } };
}
export const start = (slice, id, today) => ({ ...slice, active: { id, day: today } });
export const drop = (slice) => ({ ...slice, active: null });

// Marks a mission done. `first`: whether it earns XP.
export function finish(slice, id, note, today) {
  const m = missionById(id);
  const first = !!m && !finished(m, slice.log, today);
  const text = String(note || "").trim().slice(0, NOTE_MAX);
  const entry = { id, day: today, week: weekStart(today), ...(text ? { note: text } : {}) };
  return { slice: { ...slice, active: slice.active && slice.active.id === id ? null : slice.active, log: [...slice.log, entry].slice(-200) }, first };
}
export const weeksWithMissions = (log) => new Set(log.map((e) => e.week)).size;

// A mission that goes with a unit (after one of its lessons), if one fits.
export const forUnit = (unit, ctx, log, today) => recommend(ctx, log, today).find((m) => m.unit === unit) || null;
