// MASTERY — how well each concept is known, and when to see it again.
// Pure functions (tested in test/mastery.test.mjs).
//
// Each concept the learner has met has a record { box, seen, right, last,
// due }. `box` is a Leitner box, 0–5: a right answer moves it up one (only
// when it was due, so cramming doesn't count), a miss drops it to 0 and
// makes it due today. The gap before the next review grows with the box.
//   new (no record) → learning (box 0–2) → solid (3–4) → mastered (5)
import { addDays } from "../../core/progress.js";

export const LEVELS = ["new", "learning", "solid", "mastered"];
export const INTERVALS = [0, 1, 3, 7, 16, 35]; // days until due, by box
export const REVIEW_SIZE = 5; // concepts per review: 2–3 minutes

export const levelOf = (r) => (!r ? "new" : r.box >= 5 ? "mastered" : r.box >= 3 ? "solid" : "learning");

export function applyResult(r, right, today) {
  if (!r) return { box: right ? 1 : 0, seen: 1, right: right ? 1 : 0, last: today, due: addDays(today, right ? INTERVALS[1] : 0) };
  const base = { ...r, seen: r.seen + 1, right: r.right + (right ? 1 : 0), last: today };
  if (!right) return { ...base, box: 0, due: today };
  if (r.due > today) return base; // early: counted, but no promotion
  const box = Math.min(5, r.box + 1);
  return { ...base, box, due: addDays(today, INTERVALS[box]) };
}

// A session's first attempts ([{ c, right }]) → updated records. A concept
// asked twice counts as right only if both were right.
export function applySession(concepts, answers, today) {
  const byConcept = {};
  for (const a of answers) if (a.c) byConcept[a.c] = (byConcept[a.c] ?? true) && a.right;
  const next = { ...concepts };
  for (const [c, right] of Object.entries(byConcept)) next[c] = applyResult(concepts[c], right, today);
  return next;
}

// What to review: due concepts, weakest and most overdue first. With fewer
// than 3 due, the longest-unseen known concepts fill in ("practice anyway").
export function pickReview(concepts, today, n = REVIEW_SIZE) {
  const known = Object.entries(concepts);
  const due = known.filter(([, r]) => r.due <= today).sort((a, b) => a[1].box - b[1].box || (a[1].due < b[1].due ? -1 : 1));
  const ids = due.slice(0, n).map(([c]) => c);
  if (ids.length < 3) {
    const rest = known.filter(([c]) => !ids.includes(c)).sort((a, b) => (a[1].last < b[1].last ? -1 : 1));
    ids.push(...rest.slice(0, Math.min(n, 3) - ids.length).map(([c]) => c));
  }
  return { ids, due: due.length };
}
export const nextDue = (concepts) => Object.values(concepts).reduce((d, r) => (!d || r.due < d ? r.due : d), null);

// Which question to ask for a concept, by how well it's known: weak → the
// easier one or a lesson question; middling → lesson questions; strong →
// the challenge. Rotates so a review doesn't repeat itself.
export function pickQuestion(pool, r) {
  const box = r ? r.box : 0;
  const list = box <= 1 ? [pool.easy, ...pool.lesson] : box <= 3 ? [...pool.lesson, pool.easy] : [pool.challenge, ...pool.lesson];
  const usable = list.filter(Boolean);
  return usable[(r ? r.seen : 0) % usable.length];
}

// MIGRATION — learners from before mastery existed: each finished lesson's
// concepts start as learning (box 1; box 2 if the lesson was perfect),
// due today so the first review has something in it.
export function seedFromLessons(lessonsDone, conceptsOfLesson, today) {
  const out = {};
  for (const [id, l] of Object.entries(lessonsDone)) {
    if (!l || !l.done) continue;
    for (const c of conceptsOfLesson(id)) {
      const box = l.best === 0 ? 2 : 1;
      if (!out[c] || out[c].box < box) out[c] = { box, seen: 1, right: 1, last: l.last || today, due: today };
    }
  }
  return out;
}

// PLACEMENT — concepts in units the learner tested out of start as solid.
export function placeConcepts(concepts, ids, today) {
  const next = { ...concepts };
  for (const c of ids) if (!next[c] || next[c].box < 3) next[c] = { box: 3, seen: 1, right: 1, last: today, due: addDays(today, INTERVALS[3]) };
  return next;
}
// Placement stops at the first miss: units before it are skipped.
export const placedUnits = (unitsInOrder, results) => {
  const i = results.findIndex((r) => !r);
  return unitsInOrder.slice(0, i === -1 ? results.length : i);
};

// Adaptive difficulty: a perfect lesson offers its harder challenge
// version. (The other half — a miss brings an extra card and an easier
// question right away — lives in the player.)
export const offersChallenge = (lessonRecord) => !!(lessonRecord && lessonRecord.done && lessonRecord.best === 0);
