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
// More kinds of question (how each looks and is graded: ../qtypes.jsx).
// Numbers can be [US, Mexico] when the amounts differ.
//   order(concept, q, items, why)              items in the right order
//                                              (shown shuffled), 3–6
//   estimate(concept, q, spec, why)            a slider guess. spec: { unit:
//                                              "money"|"percent"|"years"|
//                                              "number", min, max, step,
//                                              answer, tol (share, 0.15),
//                                              grow: { monthly, rate, years } }
//   match(concept, q, pairs, why)              [[word, meaning], …], 3–4
//   number(concept, q, spec, why)              type the answer. spec: { unit,
//                                              answer, tol (absolute, 0.5) };
//                                              why: a list of steps
//   spot(concept, q, frame, from, parts, why)  frame: "sms"|"email"|"offer"|
//                                              "receipt"; parts: text, or
//                                              tap(text, isRedFlag)
//   scenario(concept, q, options, why)         options: fit(text, "good"|
//                                              "ok"|"poor", tradeOff)
// Concepts: concept(id, name, explain card, easy tf, challenge choice).
export const T = (en, es, MX) => (MX ? { en, es, MX } : { en, es });
export const card = (title, body) => ({ type: "card", title, body });
export const choice = (c, q, options, answer, why, miss) => ({ type: "choice", c, q, options, answer, why, miss });
export const tf = (c, q, answer, why) => ({ type: "tf", c, q, answer, why });
export const act = (kind, prompt, params = {}) => ({ type: "action", kind, prompt, params });
export const concept = (id, name, explain, easy, challenge) => ({ id, name, explain, easy, challenge });
export const order = (c, q, items, why) => ({ type: "order", c, q, items, why });
export const estimate = (c, q, spec, why) => ({ type: "estimate", c, q, spec, why });
export const match = (c, q, pairs, why) => ({ type: "match", c, q, pairs, why });
export const number = (c, q, spec, why) => ({ type: "number", c, q, spec, why });
export const spot = (c, q, frame, from, parts, why) => ({ type: "spot", c, q, frame, from, parts, why });
export const tap = (text, flag = false) => ({ tap: text, flag });
export const scenario = (c, q, options, why) => ({ type: "scenario", c, q, options, why });
export const fit = (text, fit, why) => ({ text, fit, why });
// Monthly saving grown at a yearly rate (for estimate answers and charts).
export const fv = (monthly, rate, years) => {
  const r = rate / 12;
  return r ? (monthly * ((1 + r) ** (years * 12) - 1)) / r : monthly * years * 12;
};
export const round = (v, to) => Math.round(v / to) * to;
