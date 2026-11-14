// Computer screenshots of the BUILT app for two kinds of learner: a brand-new one (through setup, then the main
// screens) and one three weeks in. Used for the before-and-after of the professional pass.
//   npm run build && node docs/design/professional/shots.mjs after            (this checkout)
//   APP_ROOT=/path/to/older/checkout node docs/design/professional/shots.mjs before
// Writes docs/design/professional/{before|after}/{1366|1920}-{new|weeks}-{screen}.jpg
import { spawn } from "node:child_process";
import { mkdirSync, mkdtempSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { chromium } from "playwright-core";

const HERE = import.meta.dirname;
const APP = process.env.APP_ROOT || join(HERE, "../../..");
const which = process.argv[2] === "before" ? "before" : "after";
const SIZES = which === "before" ? [[1366, 768]] : [[1366, 768], [1920, 1080]];
const OUT = join(HERE, which);
mkdirSync(OUT, { recursive: true });
const port = 20000 + Math.floor(Math.random() * 20000);
const env = { ...process.env, NORTHVALE_DOTENV: "0", PORT: String(port), NORTHVALE_DATA: mkdtempSync(join(tmpdir(), "nvl-pro-")), ANTHROPIC_API_KEY: "", TWELVEDATA_API_KEY: "" };
const server = spawn(process.execPath, [join(APP, "server/index.js")], { env, stdio: ["ignore", "pipe", "inherit"] });
await new Promise((r) => server.stdout.on("data", (d) => String(d).includes("Northvale Learn on") && r()));
const BASE = `http://127.0.0.1:${port}/`;
const browser = await chromium.launch({ channel: "chrome", headless: true });
const { ALL_LESSONS } = await import(join(APP, "src/modules/lessons/content.js"));
const P = await import(join(APP, "src/modules/goals/plan.js"));

const d = (n) => new Date(Date.now() - n * 864e5).toLocaleDateString("en-CA");
// A learner three weeks in: 28 lessons, a nine-day streak, a goal with money set aside, a few badges.
const weeks = (() => {
  const done = ALL_LESSONS.slice(0, 28).map((l) => l.id);
  const xp = [0, 25, 20, 0, 30, 25, 20, 40, 0, 25, 30, 20, 25, 0, 35, 25, 20, 30, 25, 20, 25];
  const days = Object.fromEntries(xp.map((v, i) => [d(20 - i), v]).filter(([, v]) => v));
  return {
    version: 1, updatedAt: 1,
    profile: { onboarded: true, nickname: "Alex", ageBand: "18-25", avatar: 1, ageAsked: true, remindAsked: true, seenNote: "x", reason: "car", seenIntros: { practice: d(15), portfolio: true, tools: true, news: true, goals: true, goalPlan: true, keys: d(15) }, goalFor: "car" },
    settings: { lang: "en", region: "US", look: "white", reduceMotion: true, analytics: false },
    progress: { xp: 640, days, streak: { count: 9, last: d(0), best: 9, frozen: [] }, freezes: 1, dailyGoal: 20, lessons: Object.fromEntries(done.map((id, i) => [id, { done: true, at: d(20 - Math.floor(i * 0.7)), last: d(20 - Math.floor(i * 0.7)), best: i % 3 ? 0 : 1, times: 1 }])), lessonDays: Object.keys(days), badges: { first_lesson: d(20), streak_3: d(15), streak_7: d(10), perfect: d(12), goal_setter: d(19), unit: d(14) }, counters: { lessons: 28 }, practiced: {}, startUnit: "budget", placed: [], seen: d(0) },
    modules: { goals: { goals: [{ ...P.newGoal({ id: "g1", templateId: "car", name: "My first car", target: 4000, months: 18, start: 0, path: "save", today: d(20), region: "US" }), contributions: [{ date: d(18), amount: 300 }, { date: d(11), amount: 250 }, { date: d(4), amount: 350 }] }], checkIn: d(0) }, feedback: { pending: [], survey: "very" } },
  };
})();

const tab = (page, name) => page.getByRole("navigation", { name: "Main tabs" }).getByRole("button", { name, exact: true }).click();
async function main(page, who, w, shot) {
  await page.waitForTimeout(500);
  await shot("today");
  for (const [name, label] of [["goals", "Goals"], ["practice", "Practice"], ["me", "Me"]]) (await tab(page, label), await shot(name));
  await page.getByRole("button", { name: /^Settings/ }).first().click();
  await shot("settings");
}
for (const [w, h] of SIZES) {
  for (const who of ["new", "weeks"]) {
    const ctx = await browser.newContext({ viewport: { width: w, height: h }, serviceWorkers: "block", reducedMotion: "reduce" });
    if (who === "weeks") await ctx.addInitScript((s) => localStorage.setItem("northvale-learn-v1", s), JSON.stringify(weeks));
    const page = await ctx.newPage();
    page.setDefaultTimeout(10000);
    await page.goto(BASE);
    await page.evaluate(() => document.fonts.ready);
    await page.waitForTimeout(600);
    const shot = async (name) => {
      await page.waitForTimeout(400);
      await page.screenshot({ path: join(OUT, `${w}-${who}-${name}.jpg`), type: "jpeg", quality: 72 });
    };
    if (who === "new") {
      await shot("1-welcome");
      await page.getByRole("button", { name: /Get started/ }).click();
      await page.waitForTimeout(400);
      await shot("2-question");
      await page.getByRole("radio").first().click();
      await page.getByRole("button", { name: "Check", exact: true }).click();
      await page.getByRole("button", { name: "Continue", exact: true }).click();
      await page.waitForTimeout(400);
      await shot("3-goal");
      await page.getByRole("button", { name: /^Emergency fund/ }).click();
      await page.getByRole("dialog").first().waitFor();
      await page.waitForTimeout(400);
      await shot("4-first-lesson");
      await page.getByRole("button", { name: "Close", exact: true }).first().click();
      await page.getByRole("button", { name: "Leave", exact: true }).click();
      await page.waitForTimeout(500);
    }
    await main(page, who, w, shot);
    if (who === "weeks") {
      await tab(page, "Learn");
      await page.getByRole("button", { name: /^Continue$/ }).first().click().catch(() => page.getByText("Next lesson").first().click());
      await page.getByRole("dialog").first().waitFor();
      for (let i = 0; i < 4 && !(await page.getByRole("radio").count()); i++) await page.locator("[data-player]").getByRole("button", { name: "Continue", exact: true }).click(), await page.waitForTimeout(250);
      await page.getByRole("radio").nth(1).click();
      await shot("question");
    }
    await ctx.close();
  }
}
await browser.close();
server.kill();
console.log(`wrote ${which} screenshots to docs/design/professional/${which}`);
