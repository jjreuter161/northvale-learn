// How long a lesson takes, roughly: reading on a phone (~150 words a
// minute), about 25 seconds per question with its feedback, and a minute
// and a half for the hands-on action. ponytail: a model, not a
// measurement — check it against real step timings once testers arrive.
// (Used by scripts/lesson-index.mjs, which stores each lesson's minutes
// in the index, and by the content checks.)
export const QUESTION_TYPES = ["choice", "tf", "order", "estimate", "match", "number", "spot", "scenario"];
export const isQuestion = (s) => QUESTION_TYPES.includes(s.type);
// All the text a learner reads in a step.
const stepTexts = (s) => [s.q, ...[].concat(s.why || []), ...(s.options || []).map((o) => (o && o.text) || o), ...(s.options || []).map((o) => o && o.why), ...(s.items || []), ...(s.pairs || []).flat(), ...(s.parts || []).map((p) => p.tap || p)].filter(Boolean);
const words = (x) => (x && x.en ? x.en.split(/\s+/).filter(Boolean).length : 0);
export function minutesOf(lesson) {
  let w = 0;
  let q = 0;
  for (const s of lesson.steps) {
    if (s.type === "card") w += words(s.title) + words(s.body);
    if (isQuestion(s)) (q++, (w += stepTexts(s).reduce((t, x) => t + words(x), 0)));
    if (s.type === "action") w += words(s.prompt);
  }
  return w / 150 + q * 0.4 + (lesson.steps.some((s) => s.type === "action") ? 1.5 : 0);
}
