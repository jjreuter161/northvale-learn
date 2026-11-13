// CONTENT VALIDATOR — checks every unit, lesson and concept:
//   - English and Spanish everywhere (and both, if there's a Mexico version)
//   - every question tagged with a concept that exists
//   - every question explained; every wrong option says why it's wrong
//   - every {@fact} exists in core/facts.js and every {$US|MX} amount is
//     well formed (nothing left unfilled, in US or Mexico, either language)
//   - every lesson ends with a real action, and takes 2.5–4.5 minutes (English and Spanish)
//   - every concept has its extra material and is taught somewhere
//   - every real-life mission: both languages, a real unit, a known icon and time
//   - every t("key") the app shows has its text (English and Spanish)
//   - every worked example still matches the facts it was worked out with
// Run: node scripts/validate-content.mjs (npm test runs it too).
import { readFileSync, readdirSync } from "node:fs";
import { join } from "node:path";
import { UNITS, PLACEMENT } from "../src/modules/lessons/units/all.js";
import { FACTS } from "../src/core/facts.js";
import { pick, fill } from "../src/core/i18n.js";
import { minutesOf as minutes, isQuestion, QUESTION_TYPES } from "../src/modules/lessons/units/time.js";
import { fv } from "../src/modules/lessons/units/helpers.js";
import { MISSIONS } from "../src/modules/missions/catalog.js";
import { MYTHS } from "../src/modules/lessons/myths.js";

const root = join(import.meta.dirname, "..");
const MINUTES = { min: 2.5, max: 4.5 };

// WORKED EXAMPLES — numbers in lessons worked out with a fact's current
// value (src/core/facts.js). Change the fact and its check here fails,
// naming what to rewrite.
const F = (k) => FACTS[k].value;
const step = (id, n) => UNITS.flatMap((u) => u.lessons).find((l) => l.id === id).steps[n - 1];
const near = (a, b, share = 0.02) => Math.abs(a - b) <= Math.abs(b) * share;
const r = F("indexExampleRate") / 100;
export const WORKED = [
  ["Debt & credit 1, step 5: $1,000 at the card rate is about $200 (Mexico: $10,000 at the CAT, about $4,000)", () => near(1000 * F("cardAprTypical") / 100, step("credit-1", 5).spec.answer[0]) && near(10000 * F("catTypical") / 100, step("credit-1", 5).spec.answer[1])],
  ...[["compound-1", 5], ["retire-1", 5]].map(([id, n]) => [`${id === "compound-1" ? "Compound interest 1" : "Retirement 1"}, step ${n}: grows at the example rate (indexExampleRate)`, () => step(id, n).spec.grow.rate === r]),
  ["Compound interest 2, step 4: $50 a month from age 16, 26 and 36 to 60 is about $176,000, $83,000 and $37,000 (Mexico: $750 → $2,644,000, $1,251,000, $558,000)", () => [[50, [176000, 83000, 37000]], [750, [2644000, 1251000, 558000]]].every(([m, ends]) => [44, 34, 24].every((y, i) => near(fv(m, r, y), ends[i])))],
  ["Compound interest 2, first card: starting at 16 beats twice as much from 26 (to age 60)", () => fv(1, r, 44) > fv(2, r, 34)],
  ["Retirement 2, step 5: the match on 6% of $30,000 is $900", () => near(30000 * 0.06 * F("matchExampleUS") / 100, step("retire-2", 5).spec.answer[0])],
  ["Taxes 1, step 4: a $20 shirt plus sales tax is $21.50", () => near(20 * (1 + F("salesTaxExample") / 100), step("taxes-1", 4).spec.answer[0], 0.001)],
  ["Taxes 1, step 4 (Mexico): the IVA in a $232 price tag is $32", () => near(232 - 232 / (1 + F("ivaRate") / 100), step("taxes-1", 4).spec.answer[1], 0.001)],
  ["The idea \"What taxes are for\": a tax included in the price is about $13.79 of $100 (Mexico: $160 of $1,160), at 16%", () => F("ivaRate") === 16],
  ["Mission \"Find the sales tax on a receipt\": IVA is about 14% of a price that includes it", () => Math.round((F("ivaRate") / (100 + F("ivaRate"))) * 100) === 14],
];

// Every action kind a module provides (its `actions: { … }` block).
export function actionKinds() {
  const dir = join(root, "src/modules");
  const src = readdirSync(dir)
    .map((m) => {
      try {
        return readFileSync(join(dir, m, "index.jsx"), "utf8");
      } catch {
        return "";
      }
    })
    .join("\n");
  return new Set([...src.matchAll(/actions: \{([^}]*)\}/g)].flatMap((m) => [...m[1].matchAll(/"([a-z]+\.[a-z_]+)":/g)].map((k) => k[1])));
}


const sourceFiles = (dir) => readdirSync(dir, { withFileTypes: true }).flatMap((e) => (e.isDirectory() ? sourceFiles(join(dir, e.name)) : /\.jsx?$/.test(e.name) ? [join(dir, e.name)] : []));

export function validateContent() {
  const problems = [];
  const fail = (where, msg) => problems.push(`${where}: ${msg}`);
  const kinds = actionKinds();
  const concepts = new Map();
  const taught = new Set();
  const seenLessons = new Set();

  const text = (x, where) => {
    if (!x || typeof x !== "object") return fail(where, "missing text");
    for (const lang of ["en", "es"]) if (typeof x[lang] !== "string" || !x[lang].trim()) fail(where, `no ${lang === "en" ? "English" : "Spanish"}`);
    if (x.MX) for (const lang of ["en", "es"]) if (typeof x.MX[lang] !== "string" || !x.MX[lang].trim()) fail(where, `Mexico version has no ${lang === "en" ? "English" : "Spanish"}`);
    for (const s of [x.en, x.es, ...(x.MX ? [x.MX.en, x.MX.es] : [])].filter((v) => typeof v === "string"))
      for (const [, name] of s.matchAll(/\{@(\w+)\}/g)) if (!FACTS[name]) fail(where, `unknown fact {@${name}}`);
    for (const region of ["US", "MX"])
      for (const lang of ["en", "es"]) {
        const out = fill(pick(x, lang, region), { lang, region });
        if (/[{}]/.test(out)) fail(where, `unfilled placeholder (${lang}-${region}): ${out.slice(0, 80)}`);
      }
  };
  // A number, or [US, Mexico].
  const regional = (v) => (Array.isArray(v) ? v : [v, v]);
  const nums = (v) => regional(v).length === 2 && regional(v).every(Number.isFinite);
  const UNITS_OF = ["money", "percent", "years", "number"];
  const question = (s, where, conceptId) => {
    if (!QUESTION_TYPES.includes(s.type)) return fail(where, `not a question (${s.type})`);
    if (!s.c) fail(where, "no concept tag");
    if (conceptId && s.c !== conceptId) fail(where, `tagged ${s.c}, expected ${conceptId}`);
    text(s.q, `${where} question`);
    if (Array.isArray(s.why)) s.why.forEach((w, i) => text(w, `${where} explanation step ${i + 1}`));
    else text(s.why, `${where} explanation`);
    if (s.type === "order") {
      if (!Array.isArray(s.items) || s.items.length < 3 || s.items.length > 6) return fail(where, "order: 3–6 items");
      return s.items.forEach((x, i) => text(x, `${where} item ${i + 1}`));
    }
    if (s.type === "match") {
      if (!Array.isArray(s.pairs) || s.pairs.length < 3 || s.pairs.length > 4) return fail(where, "match: 3–4 pairs");
      return s.pairs.forEach((p, i) => (text(p[0], `${where} pair ${i + 1} word`), text(p[1], `${where} pair ${i + 1} meaning`)));
    }
    if (s.type === "estimate" || s.type === "number") {
      const p = s.spec || {};
      if (!UNITS_OF.includes(p.unit)) fail(where, `unit must be one of ${UNITS_OF.join(", ")}`);
      if (!nums(p.answer)) return fail(where, "needs a numeric answer (or [US, Mexico])");
      if (s.type === "number") return;
      if (!nums(p.min) || !nums(p.max) || !nums(p.step)) return fail(where, "estimate: min, max and step");
      const tol = p.tol ?? 0.15;
      if (!(tol > 0 && tol <= 0.25)) fail(where, "estimate: tolerance up to 25%");
      for (const r of [0, 1]) {
        const [min, max, step, answer] = [p.min, p.max, p.step, p.answer].map((v) => regional(v)[r]);
        const R = r ? "Mexico" : "US";
        if (!(min < answer && answer < max)) fail(where, `estimate (${R}): the answer must be inside the slider`);
        // Not moving the slider mustn't count as right.
        const mid = min + (max - min) / 2;
        if (Math.abs(mid - answer) / Math.abs(answer) <= tol) fail(where, `estimate (${R}): the slider starts too close to the answer`);
        if (p.grow) {
          const g = Object.fromEntries(Object.entries(p.grow).map(([k, v]) => [k, regional(v)[r]]));
          if (Math.abs(fv(g.monthly, g.rate, g.years) - answer) / answer > 0.01) fail(where, `estimate (${R}): the answer doesn't match its growth chart`);
        }
      }
      return;
    }
    if (s.type === "spot") {
      if (!["sms", "email", "offer", "receipt"].includes(s.frame)) fail(where, "spot: frame must be sms, email, offer or receipt");
      text(s.from, `${where} from`);
      if (!Array.isArray(s.parts)) return fail(where, "spot: parts");
      const taps = s.parts.filter((p) => p.tap);
      if (taps.length < 2) fail(where, "spot: at least 2 parts to tap");
      if (!taps.some((p) => p.flag)) fail(where, "spot: at least one red flag");
      if (taps.every((p) => p.flag)) fail(where, "spot: something to tap that isn't a red flag");
      return s.parts.forEach((p, i) => text(p.tap || p, `${where} part ${i + 1}`));
    }
    if (s.type === "scenario") {
      if (!Array.isArray(s.options) || s.options.length < 2 || s.options.length > 3) return fail(where, "real-life choice: 2–3 options");
      if (!s.options.some((o) => o.fit === "good")) fail(where, "real-life choice: at least one good fit");
      return s.options.forEach((o, i) => (["good", "ok", "poor"].includes(o.fit) || fail(where, `option ${i + 1}: fit must be good, ok or poor`), text(o.text, `${where} option ${i + 1}`), text(o.why, `${where} option ${i + 1} trade-off`)));
    }
    if (s.type === "tf") {
      if (typeof s.answer !== "boolean") fail(where, "true/false answer must be true or false");
      return;
    }
    if (!Array.isArray(s.options) || s.options.length < 2 || s.options.length > 4) return fail(where, "2–4 options");
    s.options.forEach((o, i) => text(o, `${where} option ${i + 1}`));
    if (!Number.isInteger(s.answer) || s.answer < 0 || s.answer >= s.options.length) fail(where, "answer out of range");
    if (!Array.isArray(s.miss) || s.miss.length !== s.options.length) return fail(where, "needs a why-it's-wrong (miss) entry per option");
    s.miss.forEach((m, i) => (i === s.answer ? m !== null && fail(where, "the right option shouldn't have a miss") : text(m, `${where} why option ${i + 1} is wrong`)));
  };

  const unitIds = new Set();
  for (const u of UNITS) {
    const at = `unit ${u.id}`;
    if (unitIds.has(u.id)) fail(at, "duplicate unit id");
    unitIds.add(u.id);
    text(u.title, `${at} title`);
    if (!u.icon) fail(at, "no icon");
    if (!(u.lessons.length >= 3 && u.lessons.length <= 5)) fail(at, `${u.lessons.length} lessons (3–5)`);
    for (const c of u.concepts || []) {
      const cat = `concept ${c.id}`;
      if (concepts.has(c.id)) fail(cat, "duplicate concept id");
      concepts.set(c.id, u.id);
      text(c.name, `${cat} name`);
      if (!c.explain || c.explain.type !== "card") fail(cat, "explain must be a card");
      else (text(c.explain.title, `${cat} explain title`), text(c.explain.body, `${cat} explain body`));
      if (!c.easy || c.easy.type !== "tf") fail(cat, "easy must be a true/false question");
      else question(c.easy, `${cat} easy`, c.id);
      if (!c.challenge || c.challenge.type !== "choice") fail(cat, "challenge must be a multiple-choice question");
      else question(c.challenge, `${cat} challenge`, c.id);
    }
  }
  for (const u of UNITS)
    for (const l of u.lessons) {
      const at = `lesson ${l.id}`;
      if (seenLessons.has(l.id)) fail(at, "duplicate lesson id");
      seenLessons.add(l.id);
      text(l.title, `${at} title`);
      text(l.life, `${at} "In real life" line`);
      const steps = l.steps || [];
      const qs = steps.filter(isQuestion);
      if (!steps.some((s) => s.type === "card")) fail(at, "needs at least one card");
      if (qs.length < 2) fail(at, "needs at least two questions");
      if (new Set(qs.map((s) => s.type)).size < 3) fail(at, "use at least 3 kinds of question");
      const last = steps[steps.length - 1];
      if (!last || last.type !== "action") fail(at, "must end with an action");
      steps.forEach((s, i) => {
        const where = `${at} step ${i + 1}`;
        if (s.type === "card") (text(s.title, `${where} title`), text(s.body, `${where} body`));
        else if (s.type === "action") {
          text(s.prompt, `${where} prompt`);
          if (!kinds.has(s.kind)) fail(where, `no module provides the action "${s.kind}"`);
          if (i !== steps.length - 1) fail(where, "the action should be the last step");
        } else if (isQuestion(s)) {
          question(s, where);
          if (s.c && !concepts.has(s.c)) fail(where, `unknown concept "${s.c}"`);
          taught.add(s.c);
        } else fail(where, `unknown step type "${s.type}"`);
      });
      // In English and in Spanish (which usually runs a few more words).
      const m = minutes(l);
      const mEs = minutes(l, "es");
      if (Math.max(m, mEs) > MINUTES.max) fail(at, `about ${Math.max(m, mEs).toFixed(2)} minutes${mEs > m ? " in Spanish" : ""} — keep lessons to ${MINUTES.max}`);
      if (m < MINUTES.min) fail(at, `about ${m.toFixed(1)} minutes — too short for a lesson`);
    }
  for (const [c] of concepts) if (!taught.has(c)) fail(`concept ${c}`, "isn't taught in any lesson");
  // Money Myth or Fact: every statement and answer in both languages, at
  // least 60 for each country.
  const mythIds = new Set();
  for (const x of MYTHS) {
    const at = `myth ${x.id}`;
    if (mythIds.has(x.id)) fail(at, "duplicate id");
    mythIds.add(x.id);
    if (!["myth", "fact"].includes(x.answer)) fail(at, "answer must be myth or fact");
    if (x.only && !["US", "MX"].includes(x.only)) fail(at, "only: US or MX");
    text(x.claim, `${at} statement`);
    text(x.why, `${at} answer`);
  }
  for (const r of ["US", "MX"]) if (MYTHS.filter((x) => !x.only || x.only === r).length < 60) fail("myths", `fewer than 60 for ${r}`);
  let last = -1;
  for (const [unit, c] of PLACEMENT) {
    const i = UNITS.findIndex((u) => u.id === unit);
    if (i <= last) fail("placement", `${unit} is out of course order`);
    last = i;
    if (concepts.get(c) !== unit) fail("placement", `${c} isn't a concept of ${unit}`);
  }
  // Today and the lesson's end say why each unit matters, in one line.
  const lessonsSrc = readFileSync(join(root, "src/modules/lessons/index.jsx"), "utf8");
  for (const u of UNITS) if (!lessonsSrc.includes(`"why.${u.id}":`)) fail(`unit ${u.id}`, `no "why.${u.id}" line in lessons/index.jsx`);
  // Every piece of app text a screen asks for — t("key") — exists.
  const appSrc = sourceFiles(join(root, "src")).map((f) => readFileSync(f, "utf8")).join("\n");
  const keys = [...appSrc.matchAll(/^\s*"([\w.]+)":\s*(?:S\(|\{)/gm)].map((x) => x[1]);
  const defined = new Set(keys);
  // One meaning per key: a second module using the same key would overwrite it.
  for (const k of defined) if (keys.indexOf(k) !== keys.lastIndexOf(k)) fail("app text", `"${k}" is defined twice`);
  for (const [, key] of appSrc.matchAll(/\bt\(\s*"([\w.]+)"/g)) if (!defined.has(key)) fail("app text", `"${key}" is used but never defined`);
  const icons = new Set([...readFileSync(join(root, "src/core/ui.jsx"), "utf8").matchAll(/^  (\w+): "M/gm)].map((x) => x[1]));
  const missionIds = new Set();
  for (const m of MISSIONS) {
    const at = `mission ${m.id}`;
    if (missionIds.has(m.id)) fail(at, "duplicate mission id");
    missionIds.add(m.id);
    for (const k of ["title", "how", "ask"]) text(m[k], `${at} ${k}`);
    if (m.teen) text(m.teen, `${at} teen`);
    if (!unitIds.has(m.unit)) fail(at, `unknown unit "${m.unit}"`);
    if (!icons.has(m.icon)) fail(at, `unknown icon "${m.icon}"`);
    if (!(typeof m.time === "number" || m.time === "days" || m.time === "week")) fail(at, "time must be minutes, \"days\" or \"week\"");
    if (m.only && m.only !== "US" && m.only !== "MX") fail(at, "only must be US or MX");
  }
  for (const [what, ok] of WORKED) if (!ok()) fail("worked example", `${what}: it no longer matches facts.js; rewrite it with the new value`);
  const lessons = UNITS.flatMap((u) => u.lessons);
  return { problems, stats: { missions: MISSIONS.length, units: UNITS.length, lessons: lessons.length, concepts: concepts.size, questions: lessons.flatMap((l) => l.steps).filter(isQuestion).length, kinds: Object.fromEntries(QUESTION_TYPES.map((k) => [k, lessons.flatMap((l) => l.steps).filter((s) => s.type === k).length])), actions: kinds.size, minutes: lessons.map((l) => minutes(l)) } };
}

if (process.argv[1] && process.argv[1].endsWith("validate-content.mjs")) {
  const { problems, stats } = validateContent();
  const m = stats.minutes;
  console.log(`${stats.units} units, ${stats.lessons} lessons, ${stats.concepts} concepts, ${stats.questions} questions; lessons ${Math.min(...m).toFixed(1)}–${Math.max(...m).toFixed(1)} min; ${stats.missions} missions`);
  if (problems.length) {
    console.log(`\n${problems.length} problem(s):`);
    for (const p of problems) console.log(`  - ${p}`);
    process.exit(1);
  }
  console.log("Content checks out.");
}
