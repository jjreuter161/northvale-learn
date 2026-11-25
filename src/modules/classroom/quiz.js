// THE PILOT QUIZ (docs/SCHOOL-PLAN.md, docs/PILOT-PLAN.md) — the same 10 questions before and after a pilot, so the
// difference shows what the class learned. They come from the lessons of the units the teacher picked (up to 4),
// taken in turn from each unit, in course order: the multiple-choice and true-or-false questions only, in English
// and Spanish like everything else. The server grades them (server/classes.js); a device never gets the answers.
export const QUIZ_SIZE = 10;
export const MAX_PILOT_UNITS = 4;

// units: full unit objects (src/modules/lessons/units/all.js); ids: the pilot's units, in the teacher's order.
export function quizFor(units, ids) {
  const pools = ids
    .map((id) => units.find((u) => u.id === id && !u.draft))
    .filter(Boolean)
    .map((u) => u.lessons.flatMap((l) => l.steps.map((s, i) => ({ s, id: `${l.id}:${i}` }))).filter(({ s }) => s.type === "choice" || s.type === "tf"));
  const out = [];
  for (let round = 0; out.length < QUIZ_SIZE && pools.some((p) => p.length > round); round++)
    for (const p of pools) if (p[round] && out.length < QUIZ_SIZE) out.push(p[round]);
  return out.map(({ s, id }) => ({ id, q: s.q, tf: s.type === "tf", options: s.type === "tf" ? null : s.options, answer: s.type === "tf" ? (s.answer ? 0 : 1) : s.answer }));
}
// What a student's device gets: the questions without their answers.
export const forStudent = (qs) => qs.map(({ answer, ...q }) => q);
