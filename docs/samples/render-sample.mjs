// Renders docs/samples/business-sample.mjs to docs/samples/BUSINESS-SAMPLE-LESSON.md
// (English with US numbers, then Spanish with Mexico numbers) and checks the
// lesson's length and question kinds with the same code the validator uses.
import { writeFileSync } from "node:fs";
import { lesson, concepts, sources } from "./business-sample.mjs";
import { minutesOf, isQuestion } from "../../src/modules/lessons/units/time.js";

const fmt = (n, mx) => (mx ? "MX$" : "$") + n.replace(/\B(?=(\d{3})+(?!\d))/g, ",");
const txt = (x, lang, mx) => {
  const v = x && (typeof x === "string" ? x : mx && x.MX ? x.MX[lang] : x[lang]);
  return (v || "").replace(/\{\$([\d.]+)\|([\d.]+)\}/g, (_, us, m) => (mx ? fmt(m, true) : fmt(us, false)));
};
const num = (a, mx) => (Array.isArray(a) ? a[mx ? 1 : 0] : a);

function step(s, i, lang, mx) {
  const t = (x) => txt(x, lang, mx);
  const L = lang === "en" ? { right: "Right answer", why: "Why", miss: "If you picked this", cards: "Card", q: "Question", act: "Action (hands-on)", ans: "Answer", st: "Steps", best: "Good", ok: "OK", poor: "Poor" } : { right: "Respuesta correcta", why: "Por qué", miss: "Si elegiste esta", cards: "Tarjeta", q: "Pregunta", act: "Acción (práctica)", ans: "Respuesta", st: "Pasos", best: "Buena", ok: "Regular", poor: "Floja" };
  const out = [];
  if (s.type === "card") out.push(`**${L.cards}: ${t(s.title)}**\n\n> ${t(s.body)}`);
  else if (s.type === "action") out.push(`**${L.act}:** ${t(s.prompt)}`);
  else if (s.type === "choice") {
    out.push(`**${L.q} (${s.type}, concept: ${s.c}):** ${t(s.q)}\n`);
    s.options.forEach((o, k) => out.push(`${k === s.answer ? "- ✅" : "- ◻️"} ${t(o)}${s.miss[k] ? `\n  - *${L.miss}:* ${t(s.miss[k])}` : ""}`));
    out.push(`\n*${L.why}:* ${t(s.why)}`);
  } else if (s.type === "number") {
    out.push(`**${L.q} (work it out, concept: ${s.c}):** ${t(s.q)}\n\n- ${L.ans}: ${fmt(String(num(s.spec.answer, mx)), mx)}\n- ${L.st}: ${s.why.map(t).join(" → ")}`);
  } else if (s.type === "scenario") {
    out.push(`**${L.q} (real-life choice, concept: ${s.c}):** ${t(s.q)}\n`);
    s.options.forEach((o) => out.push(`- **${{ good: L.best, ok: L.ok, poor: L.poor }[o.fit]}:** ${t(o.text)}\n  - ${t(o.why)}`));
    out.push(`\n*${L.why}:* ${t(s.why)}`);
  } else if (s.type === "tf") out.push(`**${L.q} (true/false):** ${t(s.q)} → ${s.answer}\n\n*${L.why}:* ${t(s.why)}`);
  return out.join("\n");
}

const kinds = new Set(lesson.steps.filter(isQuestion).map((s) => s.type));
const en = minutesOf(lesson, "en");
const es = minutesOf(lesson, "es");
const words = (x, l) => (x && x[l] ? x[l].split(/\s+/).length : 0);
const cards = lesson.steps.filter((s) => s.type === "card");
const report = `- Estimated length: **${en.toFixed(1)} min in English, ${es.toFixed(1)} min in Spanish** (limit 4.5).
- Question kinds: **${[...kinds].join(", ")}** (at least 3 required).
- Card lengths in words: ${cards.map((c) => `${words(c.body, "en")} EN / ${words(c.body, "es")} ES`).join("; ")} (target 40–70; Spanish runs longer).`;

if (Math.max(en, es) > 4.5 || kinds.size < 3) {
  console.error("FAILS:\n" + report);
  process.exit(1);
}

const part = (lang, mx) => lesson.steps.map((s, i) => step(s, i, lang, mx)).join("\n\n");
const md = `# Sample lesson: "Money in, money out" (draft for approval)

Unit: **Revenue, costs and profit** · first lesson · big-idea tag: **capture value** · not shipped, not wired into the app.
Source of truth: \`docs/samples/business-sample.mjs\` (the real lesson format). Run \`node docs/samples/render-sample.mjs\` to rebuild this page.
${report}

How to read it: this is what a learner goes through, in order. ✅ marks the right answer. English shows US numbers; Spanish shows Mexico numbers (the app lets people mix any language with any country).

---

## English (US numbers)

**Lesson: ${txt(lesson.title, "en")}**

${part("en", false)}

**In real life:** ${txt(lesson.life, "en")}

---

## Español (números de México)

**Lección: ${txt(lesson.title, "es", true)}**

${part("es", true)}

**En la vida real:** ${txt(lesson.life, "es", true)}

---

## The two concepts this lesson teaches (each gets an explainer, an easier question and a harder one)

${concepts.map((c) => `- **${txt(c.name, "en")}** / ${txt(c.name, "es")}`).join("\n")}

## How the design rules show up

| Rule | Where it is |
|---|---|
| Concept before terminology | Card 1 tells Rosa's month with no business words; "revenue," "costs," "profit" appear only on card 2, after the learner has already worked out she lost money |
| Open with a question | Card 1 ends with "did Rosa have money left?" and the first question makes the learner commit to an answer |
| Local example + well-known company | Rosa's taquería and Luis's juice stand (local, made up); Amazon's early losses on card 2 (one short sentence, our words, no logo) |
| Application | A work-it-out price change, then the hands-on month in the simulator (a real-life-choice question didn't fit the 4.5-minute limit; later lessons in the unit use one) |
| Failure case | Luis's juice stand: "would selling more have saved it?" (the answer explains what to check first) |
| Tests understanding | No "define profit." Every question is a situation |
| Big idea | Card 2 says it directly: Rosa created and delivered value but didn't capture any |

## Sources for this lesson (our own words, official sources first)

${sources.map((s) => `- ${s}`).join("\n")}
`;
writeFileSync(new URL("./BUSINESS-SAMPLE-LESSON.md", import.meta.url), md);
console.log(report);
