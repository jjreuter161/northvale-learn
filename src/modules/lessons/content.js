// THE PATH — the course's units (one file each in ./units), in order, and
// the rules for what's open and what's next. The content format is in
// units/helpers.js; scripts/validate-content.mjs checks it.
import { UNITS } from "./units/index.js";
import { CONCEPTS, conceptById } from "./concepts.js";

export { UNITS };
export const ALL_LESSONS = UNITS.flatMap((u) => u.lessons.map((l, i) => ({ ...l, unit: u.id, index: i })));
export const lessonById = (id) => ALL_LESSONS.find((l) => l.id === id) || null;
export const isQuestion = (s) => s.type === "choice" || s.type === "tf";

// How long a lesson takes, roughly: reading on a phone (~150 words a
// minute), about 25 seconds per question with its feedback, and a minute
// and a half for the hands-on action. ponytail: a model, not a
// measurement — check it against real step timings once testers arrive.
const words = (x) => (x && x.en ? x.en.split(/\s+/).filter(Boolean).length : 0);
export function minutes(lesson) {
  let w = 0;
  let q = 0;
  for (const s of lesson.steps) {
    if (s.type === "card") w += words(s.title) + words(s.body);
    if (isQuestion(s)) (q++, (w += words(s.q) + words(s.why) + (s.options || []).reduce((t, o) => t + words(o), 0)));
    if (s.type === "action") w += words(s.prompt);
  }
  return w / 150 + q * 0.4 + (lesson.steps.some((s) => s.type === "action") ? 1.5 : 0);
}

// CONCEPTS — which a lesson tests, and every question there is for one.
export const conceptsOfLesson = (id) => [...new Set((lessonById(id) || { steps: [] }).steps.filter(isQuestion).map((s) => s.c))];
export const conceptsOfUnit = (unitId) => CONCEPTS.filter((c) => c.unit === unitId).map((c) => c.id);
export function conceptPool(id) {
  const c = conceptById(id);
  return { easy: c && c.easy, challenge: c && c.challenge, lesson: ALL_LESSONS.flatMap((l) => l.steps.filter((s) => isQuestion(s) && s.c === id)) };
}
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
