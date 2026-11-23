// THE WRITING CHECKLISTS, AS A TEST — scripts/content-audit.mjs runs the northvale-lesson-writer and
// northvale-bilingual-audit checklists over every live lesson and every interface string. This test:
//   1. proves each check can fail, with small made-up lessons and strings that break one rule at a time
//   2. proves a clean lesson passes
//   3. fails if the real content has a MUST or SHOULD finding (NITs, such as a short card, are reported but allowed)
import assert from "node:assert/strict";
import { auditUnits, auditStrings, audit } from "../scripts/content-audit.mjs";
import { T, card, choice, tf, act, order, scenario, fit } from "../src/modules/lessons/units/helpers.js";

const body = T(
  "A budget is a plan for your money. Before you spend, you decide where it goes: what you must pay, what you want, and what you keep. It is not about saying no to everything. It is about saying yes to what matters most to you.",
  "Un presupuesto es un plan para tu dinero. Antes de gastar, decides a dónde va: lo que debes pagar, lo que quieres y lo que guardas. No se trata de decir que no a todo. Se trata de decir que sí a lo que más te importa.",
);
const good = () => ({
  id: "demo-1",
  life: T("This week, write down three things your money will go to.", "Esta semana, anota tres cosas a las que irá tu dinero."),
  steps: [
    card(T("A plan for your money", "Un plan para tu dinero"), body),
    card(T("Needs and wants", "Necesidades y gustos"), body),
    choice("c", T("Which is a need?", "¿Cuál es una necesidad?"), [T("Rent", "La renta"), T("A game", "Un juego")], 0, T("Rent keeps a roof over you.", "La renta te da un techo."), [null, T("A game is a want.", "Un juego es un gusto.")]),
    scenario("c", T("You get paid. What first?", "Te pagan. ¿Qué haces primero?"), [fit(T("Set money aside", "Apartar dinero"), "good", T("It is there when you need it.", "Está cuando lo necesitas.")), fit(T("Spend it all", "Gastarlo todo"), "poor", T("Nothing is left.", "No queda nada."))], T("Plan before you spend.", "Planea antes de gastar.")),
    order("c", T("Put these in order.", "Pon esto en orden."), [T("Get paid", "Te pagan"), T("Plan", "Planeas"), T("Spend", "Gastas")], T("Plan comes before spending.", "El plan va antes de gastar.")),
    act("goal", T("Make a goal.", "Haz una meta.")),
  ],
});
const run = (mutate) => { const l = good(); mutate(l); return auditUnits([{ id: "demo", lessons: [l] }]); };
const rules = (found, severity) => found.filter((f) => !severity || f.severity === severity).map((f) => f.rule);

// --- 1 and 2: each check can fail; a clean lesson passes
assert.deepEqual(rules(run(() => {}), null).filter((r) => r !== "cardwords"), [], "a clean lesson has no findings (a card of 45 words is the right size)");
assert.ok(rules(run((l) => { l.steps[2].why = T("Rent keeps a roof over you!", "¡La renta te da un techo!"); })).includes("voice"), "an exclamation mark is caught");
assert.ok(rules(run((l) => { l.steps[0].body = T("It costs {$100|1500} a month.", "Cuesta {$100|1500} al mes y {@fdicLimit} cubre."); })).includes("tokens"), "amounts or facts that differ between languages are caught");
assert.ok(rules(run((l) => { l.steps[0].body = T("You should buy this stock now.", "Compra esta acción ahora."); })).includes("advice"), "advice is caught");
assert.ok(rules(run((l) => { l.steps[0].body = T("It is safe.", "Estás protegido con esto."); })).includes("gender"), "Spanish that assumes a gender is caught");
assert.ok(rules(run((l) => { l.steps[0].body = T("Use your phone.", "Usa tu ordenador."); })).includes("regional"), "Spain's Spanish is caught");
assert.ok(rules(run((l) => { l.steps[0].body = T("Use your phone.", "Usted puede usar su teléfono."); })).includes("tone"), "usted is caught");
assert.ok(rules(run((l) => { l.steps[0].body = T("A FDIC account is safe.", "Una cuenta del FDIC es segura.", { en: "An FDIC account is safe.", es: "Una cuenta del FDIC es segura." }); })).includes("terms"), "a US term in the Mexico text is caught");
assert.ok(rules(run((l) => { delete l.life; })).includes("life"), 'a lesson with no "In real life" line is caught');
assert.ok(rules(run((l) => { l.steps = l.steps.filter((s) => s.type !== "order" && s.type !== "scenario").concat([l.steps[4]]); })).includes("kinds"), "fewer than three kinds of question is caught");
assert.ok(rules(run((l) => { l.steps.splice(2, 0, tf("c", T("True?", "¿Cierto?"), true, T("Yes.", "Sí.")), tf("c", T("True again?", "¿Cierto otra vez?"), true, T("Yes.", "Sí."))); })).includes("tf"), "more than one true/false is caught");
assert.ok(rules(run((l) => { l.steps.pop(); })).includes("shape"), "a lesson that does not end with an action is caught");
assert.ok(rules(run((l) => { l.steps[0].title = T("A title that goes on for far too many characters", "Un título"); })).includes("length"), "a long card title is caught");
const strings = (src) => auditStrings([{ file: "x.js", src }]).found;
assert.ok(rules(strings('"a.b": S("Save {n} lessons", "Guarda lecciones"),')).includes("ui-tokens"), "a placeholder missing in one language is caught");
assert.deepEqual(rules(strings('"a.b": S("{n}-day streak", "Racha de {n} {n|día|días}"),')), [], "a Spanish plural form is not a missing placeholder");
assert.ok(rules(strings('"a.b": S("Well done!", "Muy bien"),')).includes("ui-voice"), "an exclamation mark in the interface is caught");
assert.ok(rules(strings('"a.b": S("Open your account here", "Open your account here"),')).includes("ui-same"), "text left in English is caught");
assert.ok(rules(strings('"a.go": S("Continue", "Continuar con el siguiente paso de la lección"),')).includes("ui-length"), "a Spanish button label that is too long is caught");
console.log("ok: each writing check can fail (an exclamation, mismatched amounts, advice, a gendered or Spain-only or usted Spanish word, a wrong-country term, a missing life line, too few kinds of question, too many true/false, no action, a long title, mismatched placeholders, untranslated text), and a clean lesson passes");

// --- 3: the real content
const { found, strings: n } = audit();
const must = found.filter((f) => f.severity === "MUST" || f.severity === "SHOULD");
assert.deepEqual(must.map((f) => `${f.severity} ${f.where}: ${f.issue}  EN: ${f.en.slice(0, 60)}  ES: ${f.es.slice(0, 60)}`), [], "the lessons and interface text have nothing to fix");
console.log(`ok: ${n} interface strings and every live lesson pass the English and Spanish checklists (${found.length} small notes, such as short cards, are in node scripts/content-audit.mjs)`);
