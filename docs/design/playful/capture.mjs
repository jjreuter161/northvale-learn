// The playful design, photographed from the real app on a phone screen
// (Light and Dark, English and Spanish) into docs/design/playful/after/.
//   npm run build && node docs/design/playful/capture.mjs
import { spawn } from "node:child_process";
import { mkdtempSync, mkdirSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { chromium } from "playwright-core";
import { newGoal } from "../../../src/modules/goals/plan.js";

const ROOT = join(import.meta.dirname, "../../..");
const OUT = join(import.meta.dirname, "after");
mkdirSync(OUT, { recursive: true });
const port = 20000 + Math.floor(Math.random() * 20000);
const env = { ...process.env, NORTHVALE_DOTENV: "0", PORT: String(port), NORTHVALE_DATA: mkdtempSync(join(tmpdir(), "nvl-playful-")), ANTHROPIC_API_KEY: "", TWELVEDATA_API_KEY: "", SMTP_USER: "", SMTP_PASS: "", NEWS_FEEDS: JSON.stringify({ US: [], MX: [] }) };
const server = spawn(process.execPath, [join(ROOT, "server/index.js")], { env, stdio: ["ignore", "pipe", "inherit"] });
await new Promise((r) => server.stdout.on("data", (d) => String(d).includes("Northvale Learn on") && r()));
const BASE = `http://127.0.0.1:${port}/`;
const browser = await chromium.launch({ channel: "chrome", headless: true });
const d = (n) => new Date(Date.now() - n * 864e5).toLocaleDateString("en-CA");
const days = [6, 5, 4, 3, 2, 1].map(d);
const ids = ["budget-1", "budget-2", "budget-3", "save-1", "save-2", "save-3", "banking-1", "banking-2", "banking-3", "banking-4", "paycheck-1", "paycheck-2", "paycheck-3", "paycheck-4", "credit-1", "credit-2", "credit-3", "scams-1"];
const lessons = Object.fromEntries(ids.map((id) => [id, { done: true, at: d(8), last: d(2), best: 0, times: 1 }]));
// Dani: five units done, in Scams and fraud, a 6-day streak, a car goal.
const dani = (lang, region, look = "white") => ({
  version: 1, updatedAt: 1,
  profile: { onboarded: true, nickname: "Dani", ageBand: "18-25", avatar: 0, ageAsked: true, remindAsked: true, seenIntros: { practice: true, portfolio: true, tools: true, news: true } },
  settings: { lang, region, look, reduceMotion: false },
  progress: { xp: 285, days: Object.fromEntries([...days.map((x) => [x, 20]), [d(0), 10]]), streak: { count: 6, last: d(1), best: 6, frozen: [] }, freezes: 1, dailyGoal: 20, lessons, lessonDays: days, badges: { first_lesson: d(20), streak_3: d(10), unit: d(15), goal_setter: d(19), mission_1: d(9) }, counters: { lessons: 18 }, practiced: {}, startUnit: "budget", placed: [] },
  modules: { feedback: { pending: [], survey: "skipped" }, goals: { goals: [newGoal({ id: "g1", templateId: "car", target: region === "MX" ? 60000 : 5000, start: region === "MX" ? 11000 : 950, months: 24, today: d(40), region })] } },
});
async function context(seed, lang, dark) {
  const ctx = await browser.newContext({ viewport: { width: 390, height: 844 }, deviceScaleFactor: 2, locale: lang === "es" ? "es-MX" : "en-US", timezoneId: "America/Chicago", serviceWorkers: "block", colorScheme: dark ? "dark" : "light" });
  if (seed) await ctx.addInitScript((s) => localStorage.getItem("northvale-learn-v1") || localStorage.setItem("northvale-learn-v1", s), JSON.stringify(seed));
  const page = await ctx.newPage();
  page.setDefaultTimeout(8000);
  await page.goto(BASE);
  await page.evaluate(() => document.fonts.ready);
  return { ctx, page };
}
const shot = async (page, name, full) => (await page.waitForTimeout(700), page.screenshot({ path: join(OUT, `${name}.png`), fullPage: !!full }));
const tab = (page, name) => page.getByRole("navigation").getByRole("button", { name, exact: true }).click();
// Plays the open lesson to its finish (answers whatever is showing).
let rightShot = false;
async function play(page) {
  for (let i = 0; i < 40; i++) {
    const dlg = page.getByRole("dialog").last();
    if (await dlg.getByText(/^(Lesson complete|Lección completa)$/).count()) return;
    const q = (k) => dlg.locator(`[data-q="${k}"]`);
    const question = (await dlg.locator("[data-q]").count()) || (await dlg.getByRole("radio").count());
    const check = dlg.getByRole("button", { name: /^(Check|Comprobar)$/ });
    if (question && (await check.count()) && (await check.isEnabled().catch(() => false)) === false) {
      if (await q("order-item").count()) for (const b of await q("order-item").all()) await b.click();
      else if (await q("match-left").count()) for (let k = 0; k < (await q("match-left").count()); k++) (await q("match-left").nth(k).click(), await q("match-right").nth(k).click());
      else if (await q("number").count()) await q("number").fill("80");
      else if (await q("spot-part").count()) for (const b of await q("spot-part").all()) await b.click();
      else if (!(await q("estimate").count())) await dlg.getByRole("radio").first().click();
    }
    if (question && (await check.count())) {
      await check.click();
      if (!rightShot && (await dlg.locator(".nv-ripple").count())) (rightShot = true, await page.waitForTimeout(250), await page.screenshot({ path: join(OUT, "05-right-answer.png") }));
    }
    const skip = dlg.getByRole("button", { name: /^(Skip for now|Saltar por ahora)$/ });
    const next = dlg.getByRole("button", { name: /^(Continue|Continuar)$/ });
    if (await skip.count()) await skip.click();
    else if (await next.count()) await next.first().click();
    else return;
  }
}
try {
  for (const [lang, region, dark] of [["en", "US", false], ["en", "US", true], ["es", "MX", false]]) {
    const p = `${dark ? "dark-" : ""}${lang === "es" ? "es-" : ""}`;
    // Welcome, for a new learner (it opens in Light).
    if (!dark) {
      const { ctx, page } = await context(null, lang, dark);
      if (lang === "es") (await page.getByRole("button", { name: "Español" }).click(), await page.getByRole("button", { name: "México" }).click());
      await shot(page, `${p}01-welcome`);
      await ctx.close();
    }
    const { ctx, page } = await context(dani(lang, region, dark ? "navy" : "white"), lang, dark);
    await shot(page, `${p}02-today`);
    await page.getByRole("heading", { name: /^(Your course|Tu curso)$/ }).scrollIntoViewIfNeeded();
    await page.evaluate(() => window.scrollBy(0, -70));
    await shot(page, `${p}03-learn-map`);
    // The whole sea chart, top to bottom.
    await page.locator("section[aria-label]").last().screenshot({ path: join(OUT, `${p}03c-course-full.png`) });
    if (lang === "en") {
      await page.getByRole("button", { name: /^Unit 2 · / }).click();
      await shot(page, `${p}03b-island-opened`);
      await page.evaluate(() => window.scrollTo(0, 0));
      await page.getByRole("button", { name: /^(Continue|Continuar)$/ }).first().click();
      await page.waitForTimeout(400);
      await shot(page, `${p}04-lesson`);
      await play(page);
      await page.waitForTimeout(900);
      await shot(page, `${p}06-lesson-complete`);
      await page.getByRole("dialog").last().getByRole("button", { name: "Done", exact: true }).click();
      await page.locator(".nv-glide").scrollIntoViewIfNeeded();
      await page.evaluate(() => window.scrollBy(0, 160));
      await shot(page, `${p}07-boat-moved-on`);
    }
    await tab(page, lang === "es" ? "Metas" : "Goals");
    await shot(page, `${p}08-goals`);
    await tab(page, lang === "es" ? "Práctica" : "Practice");
    await shot(page, `${p}09-practice`);
    await tab(page, lang === "es" ? "Yo" : "Me");
    await shot(page, `${p}10-me`);
    if (lang === "en") {
      await page.getByRole("button", { name: /^Achievements/ }).click();
      await shot(page, `${p}11-achievements`);
    }
    await ctx.close();
  }
  // Practice before it opens, and Goals with no goal yet (empty screens).
  {
    const seed = dani("en", "US");
    seed.progress.lessons = { "budget-1": lessons["budget-1"] };
    seed.progress.counters = { lessons: 1 };
    seed.modules.goals = { goals: [] };
    const { ctx, page } = await context(seed, "en");
    await tab(page, "Practice");
    await shot(page, "12-practice-before-it-opens");
    await tab(page, "Goals");
    await shot(page, "13-goals-empty");
    await ctx.close();
  }
  console.log("Pictures written to docs/design/playful/after");
} finally {
  await browser.close();
  server.kill();
}
