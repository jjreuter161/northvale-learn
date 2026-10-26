// THE CONTENT FORMAT. Each unit is one file in this folder: its lessons
// and the concepts they teach. scripts/validate-content.mjs checks all of
// it (npm test runs it). Writing rules: docs/CONTENT-STYLE.md.
//
// Text: T(en, es) or, where money works differently in Mexico,
// T(en, es, { en, es }) — the Mexico version. Inside text:
//   {$400|6000}   an amount: US dollars | Mexican pesos
//   {@fdicLimit}  a number that changes over time, from core/facts.js
//
// Steps (3–5 minutes per lesson; every lesson ends with an action):
//   card(title, body)                               one idea, a few sentences
//   choice(concept, q, options, answer, why, miss)  miss: why each wrong
//                                                   option is wrong (null
//                                                   for the right one)
//   tf(concept, q, answer, why)                     true or false
//   act(kind, prompt, params)                       the "do it" step: a
//                                                   module's widget
// Concepts: concept(id, name, explain card, easy tf, challenge choice).
export const T = (en, es, MX) => (MX ? { en, es, MX } : { en, es });
export const card = (title, body) => ({ type: "card", title, body });
export const choice = (c, q, options, answer, why, miss) => ({ type: "choice", c, q, options, answer, why, miss });
export const tf = (c, q, answer, why) => ({ type: "tf", c, q, answer, why });
export const act = (kind, prompt, params = {}) => ({ type: "action", kind, prompt, params });
export const concept = (id, name, explain, easy, challenge) => ({ id, name, explain, easy, challenge });
