// Captures the app's main screens for the design audit, at phone and laptop size, from the real app.
//   node docs/design/redesign/shots.mjs <output folder> [phone|laptop] [fresh|tabs|navy|es]
// Raw PNGs go to <output folder>/<size>/; contact.mjs turns them into contact sheets.
// Nothing here changes the app. It starts the server on a random port with no keys and a temporary
// data folder, like the tests do.
import { chromium } from "playwright-core";
import { spawn } from "node:child_process";
import { mkdirSync, mkdtempSync } from "node:fs";
import { join } from "node:path";
import { tmpdir } from "node:os";
import { UNITS } from "../../../src/modules/lessons/units/all.js";

const ROOT = join(import.meta.dirname, "../../..");
const OUT = process.argv[2];
const ONLY_SIZE = process.argv[3] && !["fresh", "tabs", "navy", "es"].includes(process.argv[3]) ? process.argv[3] : null;
const ONLY_FLOW = process.argv.slice(3).find((a) => ["fresh", "tabs", "navy", "es"].includes(a)) || null;
if (!OUT) throw new Error("usage: node shots.mjs <output folder> [phone|laptop] [fresh|tabs|navy|es]");

const port = 30000 + Math.floor(Math.random() * 20000);
const env = { ...process.env, NORTHVALE_DOTENV: "0", PORT: String(port), NORTHVALE_DATA: mkdtempSync(join(tmpdir(), "nvl-shots-")), ANTHROPIC_API_KEY: "", TWELVEDATA_API_KEY: "", SMTP_USER: "", SMTP_PASS: "", NEWS_FEEDS: JSON.stringify({ US: [], MX: [] }) };
const server = spawn(process.execPath, [join(ROOT, "server/index.js")], { env, stdio: ["ignore", "pipe", "inherit"] });
await new Promise((r) => server.stdout.on("data", (d) => String(d).includes("Northvale Learn on") && r()));
const BASE = `http://127.0.0.1:${port}/`;
const browser = await chromium.launch({ channel: "chrome", headless: true });

const SIZES = {
  phone: { viewport: { width: 390, height: 844 }, deviceScaleFactor: 2, isMobile: true, hasTouch: true },
  laptop: { viewport: { width: 1366, height: 768 }, deviceScaleFactor: 1 },
};
const W = {
  en: { start: "Get started", check: "Check", next: "Continue", skip: /^(Skip for now|Done — continue)$/, done: "Done" },
  es: { start: "Empezar", check: "Comprobar", next: "Continuar", skip: /^(Saltar por ahora|Listo, continuar)$/, done: "Listo" },
};
const at = (v, region) => (Array.isArray(v) ? v[region === "MX" ? 1 : 0] : v);
const d = (n) => new Date(Date.now() - n * 864e5).toLocaleDateString("en-CA");
const learner = (lang, region, look, done) => ({
  version: 1, updatedAt: 1,
  profile: { onboarded: true, nickname: "Dani", ageBand: "18-25", avatar: 0, ageAsked: true, remindAsked: true, seenIntros: { practice: true, portfolio: true, tools: true, news: true } },
  settings: { lang, region, look, reduceMotion: true },
  progress: { xp: 130, days: { [d(0)]: 15 }, streak: { count: 3, last: d(0), best: 3, frozen: [] }, freezes: 1, dailyGoal: 20, lessons: Object.fromEntries(done.map((id) => [id, { done: true, at: d(0), last: d(0), best: 0, times: 1 }])), lessonDays: [d(0)], badges: {}, counters: { lessons: done.length }, practiced: {}, startUnit: "budget", placed: [] },
  modules: { feedback: { pending: [], survey: "skipped" } },
});
const lesson = (id) => UNITS.flatMap((u) => u.lessons).find((l) => l.id === id);

async function answer(dlg, s, region) {
  const q = (k) => dlg.locator(`[data-q="${k}"]`);
  switch (s.type) {
    case "choice": return dlg.getByRole("radio").nth(s.answer).click();
    case "tf": return dlg.getByRole("radio").nth(s.answer ? 0 : 1).click();
    case "scenario": return dlg.getByRole("radio").nth(s.options.findIndex((o) => o.fit === "good")).click();
    case "order": for (let i = 0; i < s.items.length; i++) await q("order-item").and(dlg.locator(`[data-i="${i}"]`)).click(); return;
    case "match": for (let k = 0; k < s.pairs.length; k++) { await q("match-left").nth(k).click(); await q("match-right").and(dlg.locator(`[data-i="${k}"]`)).click(); } return;
    case "number": return q("number").fill(String(at(s.spec.answer, region)));
    case "spot": for (const [i, p] of s.parts.entries()) if (p.tap && p.flag) await q("spot-part").and(dlg.locator(`[data-i="${i}"]`)).click(); return;
    case "estimate": { const a = at(s.spec.answer, region); return q("estimate").evaluate((el, v) => (Object.getOwnPropertyDescriptor(HTMLInputElement.prototype, "value").set.call(el, String(v)), el.dispatchEvent(new Event("input", { bubbles: true }))), a); }
  }
  throw new Error(`no way to answer a "${s.type}" question`);
}

async function session(size, opts, run) {
  const dir = join(OUT, size);
  mkdirSync(dir, { recursive: true });
  const ctx = await browser.newContext({ ...SIZES[size], locale: opts.lang === "es" ? "es-MX" : "en-US", timezoneId: "America/Chicago", serviceWorkers: "block", colorScheme: "light", reducedMotion: "reduce" });
  if (opts.seed) await ctx.addInitScript((s) => localStorage.getItem("northvale-learn-v1") || localStorage.setItem("northvale-learn-v1", s), JSON.stringify(opts.seed));
  const page = await ctx.newPage();
  page.setDefaultTimeout(6000);
  const prefix = opts.prefix;
  let n = 0;
  const shot = async (name, full = false) => {
    await page.waitForTimeout(450);
    await page.screenshot({ path: join(dir, `${prefix}-${String(++n).padStart(2, "0")}-${name}.png`), fullPage: full });
  };
  const safe = async (name, fn) => { try { await fn(); } catch (e) { console.log(`  [${size} ${prefix}] ${name}: ${String(e.message).split("\n")[0].slice(0, 110)}`); } };
  await run({ page, shot, safe, size, w: W[opts.lang || "en"] });
  await ctx.close();
}

const top = (page) => page.getByRole("dialog").last();
const btn = (page, name, scope) => (scope || page).getByRole("button", { name, exact: typeof name === "string" }).first();
const tab = (page, name) => page.getByRole("navigation").getByRole("button", { name, exact: true }).first();

async function playLesson(page, shot, safe, l, w, region, prefix, nPics) {
  const t = () => top(page);
  let nq = 0, nc = 0;
  for (const [i, s] of l.steps.entries()) {
    if (s.type === "card") { if (nc++ < nPics) await shot(`${prefix}-card`); await btn(page, w.next, t()).click(); }
    else if (s.type === "action") { await shot(`${prefix}-handson`); await btn(page, w.skip, t()).click(); }
    else {
      if (nq < nPics) await shot(`${prefix}-question-${s.type}`);
      await answer(t(), s, region);
      if (nq < nPics) await shot(`${prefix}-picked`);
      await btn(page, w.check, t()).click();
      if (nq < nPics) await shot(`${prefix}-feedback`);
      await btn(page, w.next, t()).click();
      nq++;
    }
  }
  await shot(`${prefix}-finish`);
}

for (const size of Object.keys(SIZES)) {
  if (ONLY_SIZE && ONLY_SIZE !== size) continue;
  // 1. A brand-new person: welcome, warm-up question, goal, first lesson, the day after it.
  if (!ONLY_FLOW || ONLY_FLOW === "fresh")
    await session(size, { prefix: "a", lang: "en" }, async ({ page, shot, safe, w }) => {
      await page.goto(BASE);
      await shot("welcome");
      await safe("start", async () => {
        await btn(page, w.start).click();
        await shot("warmup-question");
        await page.getByRole("radio").first().click();
        await shot("warmup-picked");
        await btn(page, w.check).click();
        await shot("warmup-feedback");
        await btn(page, w.next).click();
        await shot("goal-pick");
        await page.getByRole("button", { name: /^Emergency fund/ }).click();
        await top(page).waitFor();
      });
      await safe("first lesson", async () => {
        const l = lesson("save-1");
        await playLesson(page, shot, safe, l, w, "US", "l1", 2);
        await btn(page, w.done, top(page)).click();
        await shot("today-after-lesson-1");
        await shot("today-after-lesson-1-full", true);
      });
    });
  // 2. Someone four lessons in: every tab and the sheets.
  if (!ONLY_FLOW || ONLY_FLOW === "tabs")
    await session(size, { prefix: "b", lang: "en", seed: learner("en", "US", "auto", ["budget-1", "budget-2", "budget-3", "save-1"]) }, async ({ page, shot, safe }) => {
      await page.goto(BASE);
      await shot("learn");
      await shot("learn-full", true);
      for (const [name, label] of [["goals", "Goals"], ["practice", "Practice"], ["me", "Me"]]) await safe(name, async () => { await tab(page, label).click(); await shot(name); if (name !== "me") await shot(`${name}-full`, true); });
      await safe("settings", async () => { await btn(page, /^Settings/).click(); await shot("settings"); await shot("settings-full", true); await page.keyboard.press("Escape"); });
      await safe("ask", async () => { await tab(page, "Learn").click(); await btn(page, /^Ask/).click(); await shot("ask-open"); await page.getByRole("textbox").last().fill("How should I split my paycheck?"); await page.keyboard.press("Enter"); await page.waitForTimeout(900); await shot("ask-answer"); await page.keyboard.press("Escape"); });
      await safe("year", async () => { await tab(page, "Practice").click(); await page.getByRole("button", { name: /^Your Money Year/ }).click(); await shot("year-intro"); await page.getByRole("button", { name: /^Your first full-time job/ }).click(); await shot("year-first-month"); });
      await safe("404", async () => { await page.goto(BASE + "nope"); await shot("not-found"); });
    });
  // 3. The Navy look: Learn, a lesson, the finish screen.
  if (!ONLY_FLOW || ONLY_FLOW === "navy")
    await session(size, { prefix: "c", lang: "en", seed: learner("en", "US", "navy", ["budget-1", "budget-2"]) }, async ({ page, shot, safe, w }) => {
      await page.goto(BASE);
      await shot("learn-navy");
      await safe("lesson", async () => { await btn(page, /^(Continue|Start)/).click(); await top(page).waitFor(); await playLesson(page, shot, safe, lesson("budget-3"), w, "US", "navy", 1); await btn(page, w.done, top(page)).click(); });
      await safe("goals", async () => { await tab(page, "Goals").click(); await shot("goals-navy"); });
    });
  // 4. Spanish and Mexico: Learn, a lesson question, Goals, Settings.
  if (!ONLY_FLOW || ONLY_FLOW === "es")
    await session(size, { prefix: "d", lang: "es", seed: learner("es", "MX", "auto", ["budget-1", "budget-2", "budget-3", "save-1"]) }, async ({ page, shot, safe, w }) => {
      await page.goto(BASE);
      await shot("aprende");
      await safe("metas", async () => { await tab(page, "Metas").click(); await shot("metas"); });
      await safe("yo", async () => { await tab(page, "Yo").click(); await shot("yo"); });
    });
}
await browser.close();
server.kill();
console.log("done");
