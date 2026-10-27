// WHAT A STUDENT'S DEVICE TELLS THEIR CLASS — made here, on the device,
// from what happened since joining, and nothing else:
//   lessons   ids of lessons finished (last time) on or after the join day
//   concepts  { id: [answered, missed] } since joining (today's counts
//             minus the ones saved at joining, `base`)
//   missions  how many Money Missions were finished since joining
//   week, xp  this week's XP since joining (the class leaderboard)
//   earlier   only if the student chose to (`shareEarlier`): lessons in
//             assigned units they'd finished before joining — counted
//             toward assignments, nothing else
// No goals, amounts, portfolio, mission notes, tutor questions, age or
// email are ever read here. server/classes.js checks and caps it again.
import { addDays, weekStart } from "../../core/progress.js";

// Today's answers per concept, as [answered, missed].
export const conceptCounts = (concepts = {}) => Object.fromEntries(Object.entries(concepts).map(([id, r]) => [id, [r.seen || 0, (r.seen || 0) - (r.right || 0)]]));

export function classReport(state, { joined, base = {}, shareEarlier = false, assignedLessons = [] }, today, concepts = (state.modules.lessons || {}).concepts) {
  const p = state.progress;
  const concepts2 = {};
  for (const [id, [seen, missed]] of Object.entries(conceptCounts(concepts))) {
    const [s0, m0] = base[id] || [0, 0];
    if (seen > s0) concepts2[id] = [seen - s0, Math.max(0, missed - m0)];
  }
  const week = weekStart(today);
  const from = joined > week ? joined : week;
  let xp = 0;
  for (let d = from; d <= today; d = addDays(d, 1)) xp += (p.days || {})[d] || 0;
  return {
    lessons: Object.entries(p.lessons || {})
      .filter(([, l]) => l.done && (l.last || l.at) >= joined)
      .map(([id]) => id),
    earlier: shareEarlier
      ? Object.entries(p.lessons || {})
          .filter(([id, l]) => l.done && (l.last || l.at) < joined && assignedLessons.includes(id))
          .map(([id]) => id)
      : [],
    concepts: concepts2,
    missions: (((state.modules.missions || {}).log) || []).filter((e) => e.day >= joined).length,
    week,
    xp,
  };
}
