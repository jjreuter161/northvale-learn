// CONTENT AUDIT — the checklists of the two Northvale writing skills, run over every live lesson:
//   northvale-lesson-writer   (shape, question kinds, voice, facts)
//   northvale-bilingual-audit (English and Spanish side by side: meaning, tone, terms, gender, length)
// It reports; it never rewrites. Findings are MUST (meaning, terms, advice), SHOULD (tone, gender, shape) or NIT (length).
//   node scripts/content-audit.mjs              the report, and a count by rule
//   node scripts/content-audit.mjs --table      the findings as a table (location | EN | ES | issue)
//   node scripts/content-audit.mjs --rule gender  only one rule
// Units that are drafts (behind the review gate) are not in the list the app uses, so they are not audited or touched.
// test/content-audit.test.mjs imports `auditUnits` and `auditStrings` (so the checks themselves are tested too).
import { readFileSync, readdirSync } from "node:fs";
import { join, relative } from "node:path";
import { UNITS } from "../src/modules/lessons/units/all.js";
import { isQuestion } from "../src/modules/lessons/content.js";

const clip = (v) => String(v || "").replace(/\s+/g, " ").slice(0, 140);
const finding = (severity, rule, where, en, es, issue) => ({ severity, rule, where, en: clip(en), es: clip(es), issue });

// A text in each language: the US version, and the Mexico version if there is one.
const variants = (x) => (x && typeof x === "object" && "en" in x ? [["US", x.en, x.es], ...(x.MX ? [["MX", x.MX.en, x.MX.es]] : [])] : [["US", x, x]]);
const strip = (s) => String(s || "").replace(/\{[$@][^}]*\}/g, " ").replace(/\s+/g, " ").trim();
const words = (s) => strip(s).split(/\s+/).filter(Boolean).length;
const tokens = (s) => [...String(s || "").matchAll(/\{[$@][^}]*\}/g)].map((m) => m[0]).sort();
const numbers = (s) => (strip(s).match(/\d[\d,.]*\d|\d/g) || []).map((n) => n.replace(/[,.]$/, "")).sort();

// The text of a step, as [label, value] pairs.
function parts(step) {
  const out = [];
  const q = (k, v) => v !== undefined && v !== null && out.push([k, v]);
  if (step.type === "card") (q("title", step.title), q("body", step.body));
  else if (step.type === "action") q("prompt", step.prompt);
  else {
    q("question", step.q);
    (step.options || []).forEach((o, i) => q(`option ${i + 1}`, o && o.text ? o.text : o));
    (step.items || []).forEach((o, i) => q(`item ${i + 1}`, o));
    (step.pairs || []).forEach((p, i) => (q(`pair ${i + 1} left`, p[0]), q(`pair ${i + 1} right`, p[1])));
    (step.parts || []).forEach((p, i) => q(`part ${i + 1}`, p && p.tap ? p.tap : p));
    (Array.isArray(step.why) ? step.why : [step.why]).forEach((w, i) => q(`why ${i + 1}`, w));
    (step.miss || []).forEach((m, i) => q(`miss ${i + 1}`, m));
    (step.options || []).forEach((o, i) => o && o.why && q(`tradeoff ${i + 1}`, o.why));
  }
  return out;
}

// Words that make a promise or give personal advice, in each language.
const ADVICE_EN = /\b(you should (?:buy|sell|invest|put|move|open|get|choose|pick|switch|stop|start)|you need to (?:buy|sell|invest)|guaranteed|will definitely|always works|can't lose|risk-free|the best (?:stock|fund|investment|way to get rich))\b/i;
const ADVICE_ES = /\b(deberías (?:comprar|vender|invertir|abrir|elegir|cambiar|dejar|empezar)|tienes que (?:comprar|vender|invertir)|garantizado|seguro que ganas|sin riesgo|la mejor (?:acción|inversión|forma de hacerte rico))\b/i;
// Spanish that assumes a gender (the skill: prefer "nadie más", "con buen ojo", "quien use la app").
const GENDER = /\b(el único (?:que|en|con)\b|los únicos (?:que|en|con)\b|nuevo usuario|nuevos usuarios|el usuario|los usuarios|el estudiante|los estudiantes|los jóvenes|las jóvenes|los chicos|el novato|bienvenido\b|bienvenida\b|cuidadoso\b|cuidadosa\b|el dueño|(?:estás|eres|quedas|te sientes|estarás|serás|quedarás|seas|estés)\s+(?!bien\b|mal\b|más\b|menos\b|en\b|con\b|de\b|por\b|para\b|a\b|listo\b|ahora\b|aquí\b|allí\b|acá\b|solo\b|sola\b|\w*(?:ando|iendo|yendo)\b)\w+[oa]s?\b)/i;
// Spain's Spanish, wrong for Mexico (and a few words that are rude there).
const SPAIN = /\b(ordenador|móvil|coger|cógelo|aparcar|vosotros|vuestro|guay|chaval|tío|pasta\b|currar|apetece|enfadar|autobús urbano)\b|(?:^|[.¿¡]\s*)vale[.,!?]/i;
const USTED = /\b(usted|ustedes|su dinero de usted)\b/i;
// Terms that belong to one country's money system.
const US_ONLY = /\b(FDIC|W-4|W-2|401\(k\)|IRA\b|Roth|sales tax|SEC\b|FINRA|APR\b|APY\b|FICO|IRS|Social Security|Medicare|Medicaid|ACH\b)/;
const MX_ONLY = /\b(IPAB|CAT\b|GAT\b|RFC\b|AFORE|PPR\b|IVA\b|CNBV|CONDUSEF|aguinaldo|recibo de nómina|SAT\b|IMSS|CONSAR|Banxico|INEGI|CURP|Cetes)\b/;

export function auditUnits(units) {
  const found = [];
  const add = (...a) => found.push(finding(...a));
  for (const u of units) for (const l of u.lessons) lesson(u, l);
  return found;

function lesson(u, l) {
  const where = (step, i) => `${l.id} ${step ? `step ${i + 1} (${step.type})` : ""}`.trim();
  const steps = l.steps || [];
  const cards = steps.filter((s) => s.type === "card");
  const qs = steps.filter(isQuestion);
  const kinds = new Set(qs.map((s) => s.type));
  const tfs = qs.filter((s) => s.type === "tf").length;

  // --- shape (lesson-writer)
  if (cards.length !== 2) add("SHOULD", "shape", l.id, "", "", `${cards.length} cards (the standard is 2, one idea each)`);
  if (qs.length !== 3) add("NIT", "shape", l.id, "", "", `${qs.length} questions (the standard is 3)`);
  if (kinds.size < 3) add("SHOULD", "kinds", l.id, "", "", `only ${kinds.size} kind(s) of question: ${[...kinds].join(", ")} (at least 3)`);
  if (tfs > 1) add("SHOULD", "tf", l.id, "", "", `${tfs} true/false questions (at most one, the easy check; prefer scenarios)`);
  if (!l.life) add("MUST", "life", l.id, "", "", 'no "In real life" line');
  else for (const [, en, es] of variants(l.life)) if (words(en) > 40) add("NIT", "length", l.id, en, es, `"In real life" is ${words(en)} words`);
  if (steps.length && steps[steps.length - 1].type !== "action") add("MUST", "shape", l.id, "", "", "does not end with an action");
  cards.forEach((c, i) => {
    for (const [, en, es] of variants(c.body)) {
      const n = words(en);
      if (n < 25 || n > 80) add("NIT", "cardwords", where(c, steps.indexOf(c)), en, es, `card body is ${n} words (about 40 to 70)`);
    }
    for (const [, en, es] of variants(c.title)) {
      if (strip(en).length > 35) add("NIT", "length", where(c, steps.indexOf(c)), en, es, `card title is ${strip(en).length} characters in English (35 at most)`);
      if (strip(es).length > 40) add("NIT", "length", where(c, steps.indexOf(c)), en, es, `card title is ${strip(es).length} characters in Spanish (about 35, and Spanish runs longer)`);
    }
  });

  // --- every text, English and Spanish side by side
  steps.forEach((step, i) => {
    for (const [label, x] of [...parts(step), ...(i === 0 && l.life ? [["life", l.life]] : [])]) {
      for (const [country, en, es] of variants(x)) {
        const here = `${where(step, i)} ${label}${country === "MX" ? " (Mexico)" : ""}`;
        if (en === undefined || es === undefined) continue;
        // Meaning: the same amounts and facts in both.
        const te = tokens(en), ts = tokens(es);
        if (te.join("|") !== ts.join("|")) add("MUST", "tokens", here, en, es, `amounts or facts differ: English ${te.join(" ") || "none"}, Spanish ${ts.join(" ") || "none"}`);
        const ne = numbers(en), ns = numbers(es);
        const spelled = /\b(million|billion|mil millones|millones|millón|mil)\b/i;
        const age = /\b(menor|mayor) de edad\b/i.test(es) && ne.filter((n) => !ns.includes(n)).every((n) => n === "18");
        if (ne.join("|") !== ns.join("|") && !(spelled.test(en) && spelled.test(es)) && !age) add("SHOULD", "numbers", here, en, es, `numbers differ: English ${ne.join(" ") || "none"}, Spanish ${ns.join(" ") || "none"}`);
        // Voice and advice.
        const quoted = ["spot", "match"].includes(step.type) || /[“"][^”"]*[!¡][^”"]*[”"]/.test(en);
        // The lesson teaching against a promise ("nothing is guaranteed", "can't lose is never true", a wrong option, a quoted pitch).
        const against = /\b(never|nothing|no one|can't|cannot|isn't|aren't|not|don't|doesn't|won't|fake|scam|pitch|promises?|claims?|says?|"[^"]*")\b|[“"][^”"]+[”"]/i.test(en) || /\b(nunca|nada|nadie|no |ni |falso|estafa|promete|dice)\b/i.test(es) || /^option /.test(label) || /^miss /.test(label) || label === "question";
        if (!quoted && (/!/.test(en) || /[¡!]/.test(es))) add("MUST", "voice", here, en, es, "exclamation mark");
        if (/[\u{1F300}-\u{1FAFF}\u{2600}-\u{27BF}]/u.test(`${en}${es}`)) add("MUST", "voice", here, en, es, "emoji");
        if (!quoted && !against && ADVICE_EN.test(en)) add("MUST", "advice", here, en, es, `advice or a promise in English: "${en.match(ADVICE_EN)[0]}"`);
        if (!quoted && !against && ADVICE_ES.test(es)) add("MUST", "advice", here, en, es, `advice or a promise in Spanish: "${es.match(ADVICE_ES)[0]}"`);
        // Spanish: gender-neutral.
        if (GENDER.test(es)) add("SHOULD", "gender", here, en, es, `Spanish that assumes a gender: "${es.match(GENDER)[0]}"`);
        if (SPAIN.test(es)) add("MUST", "regional", here, en, es, `Spain's Spanish: "${es.match(SPAIN)[0]}" (Mexican Spanish, informal tú)`);
        if (USTED.test(es)) add("SHOULD", "tone", here, en, es, `"usted/ustedes" (the voice is informal tú): "${es.match(USTED)[0]}"`);
        // Country terms: the US text speaks US, the Mexico text speaks Mexico.
        if (u.id !== "borders" && country === "US" && MX_ONLY.test(strip(en) + strip(es))) add("MUST", "terms", here, en, es, `a Mexico term in the US text: "${(strip(en) + strip(es)).match(MX_ONLY)[0]}"`);
        if (u.id !== "borders" && country === "MX" && US_ONLY.test(strip(en) + strip(es))) add("MUST", "terms", here, en, es, `a US term in the Mexico text: "${(strip(en) + strip(es)).match(US_ONLY)[0]}"`);
        // Long sentences (English, grade 7 to 8: under 20 words).
        if (["body", "why 1", "why 2", "question"].includes(label) || label.startsWith("miss")) {
          for (const sentence of strip(en).split(/(?<=[.?!])\s+/)) if (words(sentence) > 24) add("NIT", "sentence", here, sentence, "", `a sentence of ${words(sentence)} words (under 20)`);
        }
      }
    }
  });
}
}

// --- the app's own words (every "key": S("English", "Español") in src/): the bilingual checks that apply to short interface text
const ROOT = join(import.meta.dirname, "..");
const sourceFiles = (d) => readdirSync(d, { withFileTypes: true }).flatMap((e) => (e.isDirectory() ? sourceFiles(join(d, e.name)) : /\.(jsx?|mjs)$/.test(e.name) ? [join(d, e.name)] : []));
const UNQ = (v) => v.replace(/\\(.)/g, "$1");
// files: [{ file, src }]
export function auditStrings(files) {
  const found = [];
  const add = (...a) => found.push(finding(...a));
  let strings = 0;
for (const { file: f, src } of files) {
  for (const m of src.matchAll(/"([a-z0-9_.]+)":\s*S\(\s*"((?:[^"\\]|\\.)*)"\s*,\s*"((?:[^"\\]|\\.)*)"\s*\)/g)) {
    strings++;
    const [, key, en0, es0] = m;
    const en = UNQ(en0), es = UNQ(es0);
    const where = `${f} ${key}`;
    // Plain {name} placeholders; {n|día|días} only picks a plural form (Spanish uses it where English writes "-day").
    const ph = (v) => [...new Set([...v.matchAll(/\{(\w+)\}/g)].map((x) => x[1]))].sort().join(",");
    if (ph(en) !== ph(es)) add("MUST", "ui-tokens", where, en, es, `placeholders differ: English {${ph(en)}}, Spanish {${ph(es)}}`);
    if (/!/.test(en) || /[¡!]/.test(es)) add("MUST", "ui-voice", where, en, es, "exclamation mark");
    if (/[\u{1F300}-\u{1FAFF}\u{2600}-\u{27BF}]/u.test(`${en}${es}`)) add("MUST", "ui-voice", where, en, es, "emoji");
    const denial = /\b(never|nothing|no one|can't|cannot|isn't|aren't|not|don't|doesn't|won't)\b/i.test(en) || /\b(nunca|nada|nadie|no )\b/i.test(es);
    if (!denial && (ADVICE_EN.test(en) || ADVICE_ES.test(es))) add("MUST", "ui-advice", where, en, es, "advice or a promise");
    if (SPAIN.test(es)) add("MUST", "ui-regional", where, en, es, `Spain's Spanish: "${es.match(SPAIN)[0]}"`);
    if (GENDER.test(es)) add("SHOULD", "ui-gender", where, en, es, `Spanish that assumes a gender: "${es.match(GENDER)[0]}"`);
    if (USTED.test(es)) add("SHOULD", "ui-tone", where, en, es, `"usted/ustedes": "${es.match(USTED)[0]}"`);
    // Same words in both languages (not a name, a number or one short word).
    if (en === es && en.length > 14 && /\s/.test(en) && !/^[\d\s.,:;$%/-]+$/.test(en)) add("SHOULD", "ui-same", where, en, es, "the same text in both languages (untranslated?)");
    // Ends differently: one is a sentence and the other isn't.
    const end = (v) => (v.trim().match(/[.?!:…]$/) || [""])[0].replace("!", ".");
    if (en.length > 12 && end(en) !== end(es) && !(end(en) === "?" && es.trim().endsWith("?"))) add("NIT", "ui-punct", where, en, es, `ends differently: English "${end(en) || "no mark"}", Spanish "${end(es) || "no mark"}"`);
    // Buttons and labels: short in both languages (the skill: about 20 characters for a button).
    if (/\.(cta|go|yes|no|start|continue|save|done|open|close|cancel|skip|next|back|send|add|new|retry|share|copy)$/.test(key) || /(^|\.)(btn|button)\b/.test(key)) {
      if (en.length > 24) add("NIT", "ui-length", where, en, es, `button text is ${en.length} characters in English`);
      if (es.length > 28) add("NIT", "ui-length", where, en, es, `button text is ${es.length} characters in Spanish`);
    }
    // Short labels where Spanish is much longer than English: likely to wrap on a 320px phone.
    else if (en.length <= 22 && es.length > Math.ceil(en.length * 1.6) + 6) add("NIT", "ui-length", where, en, es, `Spanish is ${es.length} characters against ${en.length}: may wrap or clip on a small phone`);
  }
}
  return { found, strings };
}

export function audit() {
  const files = sourceFiles(join(ROOT, "src")).map((f) => ({ file: relative(ROOT, f), src: readFileSync(f, "utf8") }));
  const ui = auditStrings(files);
  return { found: [...auditUnits(UNITS), ...ui.found], strings: ui.strings };
}

if (import.meta.url === `file://${process.argv[1]}`) {
const table = process.argv.includes("--table");
const only = process.argv.includes("--rule") ? process.argv[process.argv.indexOf("--rule") + 1] : null;
const { found, strings } = audit();
const shown = found.filter((f) => !only || f.rule === only);
const order = { MUST: 0, SHOULD: 1, NIT: 2 };
shown.sort((a, b) => order[a.severity] - order[b.severity] || a.where.localeCompare(b.where));
if (table) {
  console.log("| severity | location | EN | ES | issue |\n|---|---|---|---|---|");
  for (const f of shown) console.log(`| ${f.severity} | ${f.where} | ${f.en.replace(/\|/g, "/")} | ${f.es.replace(/\|/g, "/")} | ${f.issue.replace(/\|/g, "/")} |`);
} else {
  for (const f of shown) console.log(`${f.severity.padEnd(6)} ${f.where.padEnd(34)} ${f.issue}${f.en ? `\n         EN: ${f.en}` : ""}${f.es ? `\n         ES: ${f.es}` : ""}`);
}
const by = {};
for (const f of found) (by[f.rule] ||= { MUST: 0, SHOULD: 0, NIT: 0 })[f.severity]++;
const total = { MUST: 0, SHOULD: 0, NIT: 0 };
for (const f of found) total[f.severity]++;
console.log(`\n${UNITS.reduce((n, u) => n + u.lessons.length, 0)} lessons in ${UNITS.length} units and ${strings} interface strings audited.`);
console.log("By rule:", Object.entries(by).map(([r, c]) => `${r} ${c.MUST + c.SHOULD + c.NIT}`).join(" · "));
console.log(`MUST FIX ${total.MUST} · SHOULD FIX ${total.SHOULD} · NIT ${total.NIT}`);
}
