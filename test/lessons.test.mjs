// EVERY LESSON, PLAYED THROUGH — all 59 lessons, start to finish, in
// English (US, Cream) and Spanish (Mexico, Navy), in a real browser. In each
// lesson the first question is answered wrong on purpose and everything else
// right, so both kinds of feedback, the extra card, the easier question and
// the miss coming back at the end are all played. On every step: the step
// the content says should be next is the one showing, the right/wrong grade
// is what it should be, and the screen has no console errors, raw text keys
// ("q.order"), unfilled {placeholders}, NaN/undefined, or anything running
// off the side. Runs after `npm run build`.
import assert from "node:assert/strict";
import { spawn } from "node:child_process";
import { mkdtempSync, readdirSync, readFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { chromium } from "playwright-core";
import { text } from "../src/core/i18n.js";
import { UNITS } from "../src/modules/lessons/units/all.js";

const ROOT = join(import.meta.dirname, "..");
const prefixes = new Set();
for (const f of readdirSync(join(ROOT, "src"), { recursive: true }).filter((f) => /\.jsx?$/.test(f)))
  for (const m of readFileSync(join(ROOT, "src", f), "utf8").matchAll(/"([a-z_]+)\.[a-z0-9_.]+":\s*S\(/g)) prefixes.add(m[1]);
const RAW = new RegExp(`(?<![\\w@/.-])(?:${[...prefixes].join("|")})\\.[a-z0-9_]+(?:\\.[a-z0-9_]+)*(?![\\w-])`, "g");
const BROKEN = /\{[@$]?[A-Za-z_][^{}]*\}|\bNaN\b|\bundefined\b|\[object Object\]/g;

const port = 30000 + Math.floor(Math.random() * 20000);
const env = { ...process.env, NORTHVALE_DOTENV: "0", PORT: String(port), NORTHVALE_DATA: mkdtempSync(join(tmpdir(), "nvl-lessons-")), ANTHROPIC_API_KEY: "", TWELVEDATA_API_KEY: "", SMTP_USER: "", SMTP_PASS: "", NEWS_FEEDS: JSON.stringify({ US: [], MX: [] }) };
const server = spawn(process.execPath, [join(ROOT, "server/index.js")], { env, stdio: ["ignore", "pipe", "inherit"] });
await new Promise((r) => server.stdout.on("data", (d) => String(d).includes("Northvale Learn on") && r()));
const BASE = `http://127.0.0.1:${port}/`;
const browser = await chromium.launch({ channel: "chrome", headless: true });

const at = (v, region) => (Array.isArray(v) ? v[region === "MX" ? 1 : 0] : v);
const isQ = (s) => s.type !== "card" && s.type !== "action";
const esc = (x) => x.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
const squash = (s) => s.replace(/\s+/g, " ").trim();
const concept = Object.fromEntries(UNITS.flatMap((u) => u.concepts.map((c) => [c.id, c])));
const d = (n) => new Date(Date.now() - n * 864e5).toLocaleDateString("en-CA");
// Someone who has finished everything, so every lesson can be opened.
const learner = (lang, region, look) => ({
  version: 1, updatedAt: 1,
  profile: { onboarded: true, nickname: "Dani", ageBand: "18-25", avatar: 0, ageAsked: true, remindAsked: true, seenIntros: { practice: true, portfolio: true, tools: true, news: true } },
  settings: { lang, region, look, reduceMotion: true },
  progress: { xp: 5000, days: { [d(1)]: 20 }, streak: { count: 1, last: d(1), best: 9, frozen: [] }, freezes: 0, dailyGoal: 20, lessons: Object.fromEntries(UNITS.flatMap((u) => u.lessons).map((l) => [l.id, { done: true, at: d(30), last: d(30), best: 0, times: 1 }])), lessonDays: [d(1)], badges: {}, counters: { lessons: 59 }, practiced: {}, startUnit: "budget", placed: [] },
  modules: { feedback: { pending: [], survey: "skipped" } },
});

// Estimates: the slider snaps to its steps.
const snap = (s, v) => Math.min(s.max, Math.max(s.min, s.min + Math.round((v - s.min) / s.step) * s.step));
const estOff = (s, v) => Math.abs(v - s.answer) / Math.abs(s.answer);
const est = (step, region) => Object.fromEntries(["min", "max", "step", "answer", "tol"].map((k) => [k, at(step.spec[k], region)]));
// Can this question be answered wrong on purpose?
const missable = (s, region) => {
  if (s.type === "order") return s.items.length > 1;
  if (s.type === "match") return s.pairs.length > 1;
  if (s.type === "estimate") {
    const e = est(s, region);
    return Math.max(estOff(e, e.min), estOff(e, e.max)) > (e.tol ?? 0.15);
  }
  return true;
};

async function answer(dlg, s, right, region) {
  const q = (k) => dlg.locator(`[data-q="${k}"]`);
  const radio = (i) => dlg.getByRole("radio").nth(i);
  switch (s.type) {
    case "choice":
      return radio(right ? s.answer : (s.answer + 1) % s.options.length).click();
    case "tf":
      return radio(s.answer === right ? 0 : 1).click();
    case "scenario":
      return radio(s.options.findIndex((o) => (o.fit === "poor") !== right)).click();
    case "order": {
      const order = s.items.map((_, i) => i);
      for (const i of right ? order : order.reverse()) await q("order-item").and(dlg.locator(`[data-i="${i}"]`)).click();
      return;
    }
    case "match":
      for (let k = 0; k < s.pairs.length; k++) {
        await q("match-left").nth(k).click();
        await q("match-right").and(dlg.locator(`[data-i="${right ? k : (k + 1) % s.pairs.length}"]`)).click();
      }
      return;
    case "number": {
      const a = at(s.spec.answer, region);
      return q("number").fill(String(right ? a : a * 2 + 7));
    }
    case "spot": {
      const taps = s.parts.map((p, i) => ({ ...p, i })).filter((p) => p.tap);
      const flags = taps.filter((p) => p.flag);
      const pick = right ? flags : [...taps.filter((p) => !p.flag), ...flags].slice(0, flags.length);
      for (const p of pick) await q("spot-part").and(dlg.locator(`[data-i="${p.i}"]`)).click();
      return;
    }
    case "estimate": {
      const e = est(s, region);
      const v = right ? snap(e, e.answer) : estOff(e, e.min) > estOff(e, e.max) ? e.min : e.max;
      assert.equal(estOff(e, v) <= (e.tol ?? 0.15), right, `estimate "${s.q.en}": the slider can't reach a ${right ? "right" : "wrong"} answer`);
      return q("estimate").evaluate((el, v) => (Object.getOwnPropertyDescriptor(HTMLInputElement.prototype, "value").set.call(el, String(v)), el.dispatchEvent(new Event("input", { bubbles: true }))), v);
    }
  }
  throw new Error(`no way to answer a "${s.type}" question`);
}

async function playAll(lang, region, look) {
  const locale = { lang, region };
  const W = lang === "es" ? { unit: "Unidad", next: "Continuar", check: "Comprobar", skip: /^(Saltar por ahora|Listo, continuar)$/, done: "Listo" } : { unit: "Unit", next: "Continue", check: "Check", skip: /^(Skip for now|Done — continue)$/, done: "Done" };
  const ctx = await browser.newContext({ viewport: { width: 390, height: 844 }, locale: lang === "es" ? "es-MX" : "en-US", timezoneId: "America/Chicago", serviceWorkers: "block", reducedMotion: "reduce" });
  await ctx.addInitScript((s) => localStorage.getItem("northvale-learn-v1") || localStorage.setItem("northvale-learn-v1", s), JSON.stringify(learner(lang, region, look)));
  const page = await ctx.newPage();
  page.setDefaultTimeout(8000);
  const errors = [];
  page.on("console", (m) => m.type() === "error" && errors.push(m.text()));
  page.on("pageerror", (e) => errors.push(String(e)));
  await page.goto(BASE);
  const top = () => page.getByRole("dialog").last();
  const btn = (name) => top().getByRole("button", { name, exact: typeof name === "string" }).first();
  const problems = [];
  // Everything showing reads cleanly and fits the screen.
  const clean = async (where) => {
    const r = await page.evaluate(() => {
      const w = window.innerWidth;
      const out = [...document.querySelectorAll('[role="dialog"] *')].filter((e) => {
        const b = e.getBoundingClientRect();
        // (Pictures can bleed off the edge on purpose; content can't.)
        return !e.closest("svg") && b.width > 2 && b.height > 2 && b.right > w + 1 && getComputedStyle(e).visibility !== "hidden";
      });
      return { text: document.body.innerText, wide: document.documentElement.scrollWidth - w, out: out.slice(0, 3).map((e) => `${e.tagName.toLowerCase()} "${(e.innerText || "").slice(0, 40)}"`) };
    });
    const bad = [...(r.text.match(RAW) || []), ...(r.text.match(BROKEN) || [])];
    if (bad.length) problems.push(`${where}: shows ${[...new Set(bad)].join(", ")}`);
    if (r.wide > 1) problems.push(`${where}: the page is ${r.wide}px wider than the screen`);
    if (r.out.length) problems.push(`${where}: runs off the side: ${r.out.join(", ")}`);
    if (errors.length) problems.push(`${where}: console: ${errors.splice(0).join(" | ")}`);
  };
  let lessons = 0;
  let questions = 0;
  for (const [n, u] of UNITS.entries()) {
    for (const l of u.lessons) {
      const where = `${lang}-${region} ${l.id}`;
      const t0 = Date.now();
      // Open it from the course: its island, then the lesson.
      const isle = page.getByRole("button", { name: new RegExp(`^${W.unit} ${n + 1} · `) });
      if (!(await isle.count())) await page.getByRole("button", { name: /mist|niebla/ }).click();
      if ((await isle.getAttribute("aria-expanded")) === "false") await isle.click();
      await page.getByRole("button", { name: new RegExp(`^${esc(text(l.title, locale))} — `) }).click();
      await page.locator('[aria-busy="true"]').waitFor({ state: "detached", timeout: 10000 });
      // The steps as the player should show them: a miss adds the concept's
      // explanation and its easier question right after, and comes back at the end.
      const queue = l.steps.map((s) => ({ ...s }));
      const missAt = queue.findIndex((s) => isQ(s) && missable(s, region));
      for (let i = 0; i < queue.length; i++) {
        const s = queue[i];
        const here = `${where} step ${i + 1} (${s.type}${s.extra ? ", extra" : ""}${s.retry ? ", again" : ""})`;
        const shown = squash(await top().innerText());
        const expect = squash(text(isQ(s) ? s.q : s.type === "card" ? s.title : "", locale));
        assert.ok(shown.includes(expect), `${here}: expected "${expect}", the screen shows: ${shown.slice(0, 300)}`);
        if (s.type === "card") {
          await clean(here);
          await btn(W.next).click();
        } else if (s.type === "action") {
          // Skipped, or (for a tool that counts as soon as it's seen) done.
          await clean(here);
          await btn(W.skip).click();
        } else {
          const right = i !== missAt;
          await answer(top(), s, right, region);
          await btn(W.check).click();
          const graded = await top().locator("[data-right]").getAttribute("data-right");
          assert.equal(graded, String(right), `${here}: answered ${right ? "right" : "wrong"} but graded ${graded === "true" ? "right" : "wrong"}`);
          await clean(`${here} feedback`);
          questions++;
          if (!right) {
            const c = concept[s.c];
            queue.splice(i + 1, 0, { ...c.explain, extra: true }, { ...c.easy, c: s.c, extra: true });
            queue.push({ ...s, retry: true });
          }
          await btn(W.next).click();
        }
      }
      // A unit or streak moment comes first; then the finish.
      if (await top().locator("[data-moment]").count()) await btn(W.next).click();
      await btn(W.done).waitFor();
      await clean(`${where} finish`);
      await btn(W.done).click();
      await page.getByRole("dialog").waitFor({ state: "detached" });
      lessons++;
      if (process.env.DEBUG) console.log(where, `${((Date.now() - t0) / 1000).toFixed(1)}s`);
    }
  }
  await ctx.close();
  return { lessons, questions, problems };
}

try {
  const runs = await Promise.all([playAll("en", "US", "white"), playAll("es", "MX", "navy")]);
  const problems = runs.flatMap((r) => r.problems);
  assert.deepEqual(problems, [], `problems while playing every lesson:\n  ${problems.join("\n  ")}`);
  const total = UNITS.reduce((n, u) => n + u.lessons.length, 0);
  for (const r of runs) assert.equal(r.lessons, total);
  console.log(`ok: all ${total} lessons played start to finish in English (US, Cream) and Spanish (Mexico, Navy): ${runs[0].questions + runs[1].questions} questions graded as expected (one missed on purpose in each lesson, with its extra card, easier question and second try), no errors, raw keys, broken numbers or cut-off text`);
} finally {
  await browser.close();
  server.kill();
}
