// Screenshots of the BUILT app at four sizes: a phone (390), a tablet (820), a laptop (1366) and a large desktop (1920).
//   npm run build && node docs/design/computer/shots.mjs
// Writes docs/design/computer/{size}-{screen}.jpg and index.html (all of them on one page).
import { spawn } from "node:child_process";
import { mkdirSync, mkdtempSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { chromium } from "playwright-core";

const ROOT = join(import.meta.dirname, "../../..");
const OUT = import.meta.dirname;
mkdirSync(OUT, { recursive: true });
const port = 20000 + Math.floor(Math.random() * 20000);
const env = { ...process.env, NORTHVALE_DOTENV: "0", PORT: String(port), NORTHVALE_DATA: mkdtempSync(join(tmpdir(), "nvl-computer-")), ANTHROPIC_API_KEY: "", TWELVEDATA_API_KEY: "" };
const server = spawn(process.execPath, [join(ROOT, "server/index.js")], { env, stdio: ["ignore", "pipe", "inherit"] });
await new Promise((r) => server.stdout.on("data", (d) => String(d).includes("Northvale Learn on") && r()));
const BASE = `http://127.0.0.1:${port}/`;
const browser = await chromium.launch({ channel: "chrome", headless: true });

const d = (n) => new Date(Date.now() - n * 864e5).toLocaleDateString("en-CA");
const days = [4, 3, 2, 1, 0].map(d);
const done = ["budget-1", "budget-2", "budget-3", "save-1", "save-2", "save-3", "banking-1", "banking-2", "banking-3", "banking-4", "paycheck-1"];
const learner = {
  version: 1, updatedAt: 1,
  profile: { onboarded: true, nickname: "Alex", ageBand: "18-25", avatar: 1, ageAsked: true, remindAsked: true, seenIntros: { practice: d(9), portfolio: true, tools: true, news: true, goals: true } },
  settings: { lang: "en", region: "US", look: "white", reduceMotion: true, analytics: false },
  progress: { xp: 190, days: Object.fromEntries(days.map((x) => [x, 25])), streak: { count: 5, last: d(0), best: 5, frozen: [] }, freezes: 1, dailyGoal: 20, lessons: Object.fromEntries(done.map((id) => [id, { done: true, at: d(8), last: d(8), best: 0, times: 1 }])), lessonDays: days, badges: { first_lesson: d(14) }, counters: { lessons: done.length }, practiced: {}, startUnit: "budget", placed: [], seen: d(0) },
  modules: { goals: { goals: [{ id: "g1", template: "car", name: "My first car", currency: "USD", target: 4000, months: 18, start: 0, path: "save", createdAt: d(30), contributions: [{ date: d(20), amount: 600 }, { date: d(5), amount: 400 }] }], checkIn: d(0) }, feedback: { pending: [], survey: "very" } },
};
const SIZES = [["phone", 390, 844], ["tablet", 820, 1180], ["laptop", 1366, 768], ["desktop", 1920, 1080]];
const SCREENS = [["today", "Today and the sea chart"], ["goals", "Goals"], ["practice", "Practice"], ["me", "Me"], ["settings", "Settings"], ["question", "A lesson question"], ["dialog", "A dialog (the streak)"]];
const written = [];
for (const [size, w, h] of SIZES) {
  const ctx = await browser.newContext({ viewport: { width: w, height: h }, deviceScaleFactor: w < 600 ? 2 : 1, isMobile: w < 600, hasTouch: w < 1024, serviceWorkers: "block", reducedMotion: "reduce" });
  await ctx.addInitScript((s) => localStorage.setItem("northvale-learn-v1", s), JSON.stringify(learner));
  const page = await ctx.newPage();
  page.setDefaultTimeout(10000);
  await page.goto(BASE);
  await page.evaluate(() => document.fonts.ready);
  await page.waitForTimeout(600);
  const shot = async (name) => {
    await page.waitForTimeout(450);
    await page.screenshot({ path: join(OUT, `${size}-${name}.jpg`), type: "jpeg", quality: 74 });
    written.push([size, name]);
  };
  const tab = (name) => page.getByRole("navigation", { name: "Main tabs" }).getByRole("button", { name, exact: true }).click();
  await shot("today");
  for (const [name, label] of [["goals", "Goals"], ["practice", "Practice"], ["me", "Me"]]) (await tab(label), await shot(name));
  await page.getByRole("button", { name: /^Settings/ }).first().click();
  await shot("settings");
  await tab("Learn");
  await page.getByRole("button", { name: /^Streak: \d+ days/ }).first().click();
  await shot("dialog");
  await page.keyboard.press("Escape");
  // The next lesson: its button on Today, or its row when a review comes first.
  const go = page.getByRole("button", { name: /^Continue$/ }).first();
  if (await go.count()) await go.click();
  else await page.getByText("Next lesson").first().click();
  await page.getByRole("dialog").first().waitFor();
  for (let i = 0; i < 4 && !(await page.getByRole("radio").count()); i++) await page.locator("[data-player]").getByRole("button", { name: "Continue", exact: true }).click(), await page.waitForTimeout(250);
  await page.getByRole("radio").nth(1).click();
  await shot("question");
  await ctx.close();
}
await browser.close();
server.kill();
writeFileSync(join(OUT, "index.html"), `<!doctype html><meta charset="utf-8"><title>Northvale Learn at four sizes</title><body style="font:15px system-ui;margin:24px;background:#F7F2E8;color:#1B3560"><h1>Northvale Learn at four sizes</h1>${SCREENS.map(([name, label]) => `<h2>${label}</h2><div style="display:flex;gap:14px;align-items:flex-start;flex-wrap:wrap">${SIZES.map(([size, w]) => `<figure style="margin:0"><img src="${size}-${name}.jpg" style="width:${w < 600 ? 195 : w < 1000 ? 260 : w < 1500 ? 420 : 560}px;border:1px solid #E3D9C6"><figcaption>${size} (${w}px)</figcaption></figure>`).join("")}</div>`).join("")}</body>`);
console.log(`wrote ${written.length} screenshots and index.html to docs/design/computer`);
