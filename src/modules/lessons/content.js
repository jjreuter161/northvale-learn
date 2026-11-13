// THE PATH — the course's units (one file each in ./units), in order, and
// the rules for what's open and what's next. The content format is in
// units/helpers.js; scripts/validate-content.mjs checks it.
import { UNITS, LOADERS } from "./units/index.js";
import { CONCEPTS, conceptById } from "./concepts.js";
import { QUESTION_TYPES, isQuestion } from "./units/time.js";

export { UNITS, QUESTION_TYPES, isQuestion };
export const ALL_LESSONS = UNITS.flatMap((u) => u.lessons);
export const lessonById = (id) => ALL_LESSONS.find((l) => l.id === id) || null;
// How long a lesson takes (worked out from its steps by the index: units/time.js).
export const minutes = (lesson) => lesson.minutes;

// CONCEPTS — which a lesson tests, and every question there is for one
// (the questions of units loaded so far).
export const conceptsOfLesson = (id) => (lessonById(id) || { concepts: [] }).concepts;
export const conceptsOfUnit = (unitId) => CONCEPTS.filter((c) => c.unit === unitId).map((c) => c.id);
export function conceptPool(id) {
  const c = conceptById(id);
  return { easy: c && c.easy, challenge: c && c.challenge, lesson: ALL_LESSONS.flatMap((l) => (l.steps || []).filter((s) => isQuestion(s) && s.c === id)) };
}

// LOADING — a unit's cards and questions (and its concepts' extra card,
// easier and harder questions) arrive the first time they're needed: a
// lesson, a review, a challenge, the placement test. Each unit is loaded
// once; a failed load (offline, not cached yet) can be tried again.
const loading = new Map();
export function loadUnits(ids) {
  const want = [...new Set(ids)].filter((id) => LOADERS[id]);
  return Promise.all(
    want.map((id) => {
      if (!loading.has(id)) loading.set(id, LOADERS[id]().then((m) => hydrate(m.default)).catch((e) => (loading.delete(id), Promise.reject(e))));
      return loading.get(id);
    }),
  );
}
function hydrate(full) {
  const u = UNITS.find((x) => x.id === full.id);
  full.lessons.forEach((l, i) => (u.lessons[i].steps = l.steps));
  for (const c of full.concepts) Object.assign(conceptById(c.id), { explain: c.explain, easy: c.easy, challenge: c.challenge });
  // A concept from another unit used here (its extra card after a miss) loads too.
  const others = [...new Set(full.lessons.flatMap((l) => l.steps.map((s) => s.c)).filter(Boolean).map((c) => (conceptById(c) || {}).unit).filter((x) => x && x !== full.id))];
  return others.length ? loadUnits(others) : null;
}
export const loadAll = () => loadUnits(UNITS.map((u) => u.id));
export const unitLoaded = (id) => !!(UNITS.find((u) => u.id === id) || { lessons: [{}] }).lessons[0].steps;
// THE ORDER. Learners start in the unit their goal points to (onboarding);
// that unit and every unit before it are open, later units open one by one
// as the previous unit is finished — or tested out of in the placement
// test (`progress.placed`). Inside a unit lessons go in order. Units
// tested out of stay open to take, but "what's next" skips them. A unit
// the learner has already reached (a lesson done in it or in any later
// unit) stays open — so adding units never locks anyone out.
const isDone = (progress, id) => !!(progress.lessons[id] && progress.lessons[id].done);
const unitIndex = (id) => UNITS.findIndex((u) => u.id === id);
const placed = (progress, unitId) => (progress.placed || []).includes(unitId);
export const unitDone = (progress, unit) => unit.lessons.every((l) => isDone(progress, l.id));
const started = (progress, unit) => unit.lessons.some((l) => isDone(progress, l.id));
const reached = (progress, ui) => UNITS.slice(ui).some((u) => started(progress, u));
export function lessonState(progress, id) {
  if (isDone(progress, id)) return "done";
  const l = ALL_LESSONS.find((x) => x.id === id);
  if (!l) return "locked";
  const ui = unitIndex(l.unit);
  const start = Math.max(0, unitIndex(progress.startUnit || UNITS[0].id));
  const prev = UNITS[ui - 1];
  if (ui > start && !unitDone(progress, prev) && !placed(progress, prev.id) && !placed(progress, l.unit) && !reached(progress, ui)) return "locked";
  return l.index === 0 || placed(progress, l.unit) || isDone(progress, UNITS[ui].lessons[l.index - 1].id) ? "open" : "locked";
}
const fresh = (progress, l) => lessonState(progress, l.id) === "open" && !placed(progress, l.unit);
// What's next for a goal: the first open lesson in the units that help it
// most (in that order), else simply what's next on the path.
export function nextFor(progress, units = []) {
  for (const u of units) {
    const l = ALL_LESSONS.find((x) => x.unit === u && fresh(progress, x));
    if (l) return l;
  }
  return nextLesson(progress);
}
// What's next: finish a unit already started; otherwise from the starting
// unit onward, then anything earlier; tested-out units last.
export function nextLesson(progress) {
  const start = Math.max(0, unitIndex(progress.startUnit || UNITS[0].id));
  const order = [...UNITS.slice(start), ...UNITS.slice(0, start)].flatMap((u) => ALL_LESSONS.filter((l) => l.unit === u.id));
  const inProgress = order.find((l) => fresh(progress, l) && started(progress, UNITS[unitIndex(l.unit)]));
  return inProgress || order.find((l) => fresh(progress, l)) || order.find((l) => lessonState(progress, l.id) === "open") || null;
}
