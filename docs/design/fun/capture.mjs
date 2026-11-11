// Milestone 4.5 pictures, from the real app on a phone screen: a new
// learner's first five minutes (English/US and Spanish/Mexico) with the new
// kinds of question and the finish, day two's Today with Myth or Fact,
// Your money week, The real cost, a 7-day streak moment, and a short video
// of the lesson finish (finish.webm).
//   npm run build && node docs/design/fun/capture.mjs
import { spawn } from "node:child_process";
import { mkdtempSync, mkdirSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { chromium } from "playwright-core";
import { newGoal } from "../../../src/modules/goals/plan.js";

const ROOT = join(import.meta.dirname, "../../..");
const OUT = join(import.meta.dirname, "after");
mkdirSync(OUT, { recursive: true });
const port = 20000 + Math.floor(Math.random() * 20000);
const env = { ...process.env, NORTHVALE_DOTENV: "0", PORT: String(port), NORTHVALE_DATA: mkdtempSync(join(tmpdir(), "nvl-fun-")), ANTHROPIC_API_KEY: "", TWELVEDATA_API_KEY: "", SMTP_USER: "", SMTP_PASS: "", NEWS_FEEDS: JSON.stringify({ US: [], MX: [] }) };
const server = spawn(process.execPath, [join(ROOT, "server/index.js")], { env, stdio: ["ignore", "pipe", "inherit"] });
await new Promise((r) => server.stdout.on("data", (d) => String(d).includes("Northvale Learn on") && r()));
const BASE = `http://127.0.0.1:${port}/`;
const browser = await chromium.launch({ channel: "chrome", headless: true });
const d = (n) => new Date(Date.now() - n * 864e5).toLocaleDateString("en-CA");
const learner = (lang, region, progress = {}, modules = {}) => ({ version: 1, updatedAt: 1, profile: { onboarded: true, nickname: "Dani", ageBand: "18-25", avatar: 0, ageAsked: true, remindAsked: true }, settings: { lang, region, look: "white", reduceMotion: false }, progress: { xp: 30, days: { [d(1)]: 30 }, streak: { count: 1, last: d(1), best: 1, frozen: [] }, freezes: 1, dailyGoal: 20, lessons: {}, lessonDays: [d(1)], badges: { first_lesson: d(9) }, counters: { lessons: 3 }, practiced: {}, startUnit: "budget", placed: [], ...progress }, modules: { feedback: { pending: [], survey: "skipped" }, ...modules } });
async function context(seed, lang) {
  const ctx = await browser.newContext({ viewport: { width: 390, height: 844 }, deviceScaleFactor: 2, locale: lang === "es" ? "es-MX" : "en-US", timezoneId: "America/Chicago", serviceWorkers: "block" });
  if (seed) await ctx.addInitScript((s) => localStorage.getItem("northvale-learn-v1") || localStorage.setItem("northvale-learn-v1", s), JSON.stringify(seed));
  const page = await ctx.newPage();
  page.setDefaultTimeout(8000);
  await page.goto(BASE);
  return { ctx, page };
}
const shot = async (page, name) => (await page.waitForTimeout(500), page.screenshot({ path: join(OUT, `${name}.png`) }));
// Frames → a WebM video, in a blank page (canvas + MediaRecorder).
async function webm(frames, file) {
  const page = await browser.newPage();
  const b64 = await page.evaluate(async (urls) => {
    const imgs = await Promise.all(urls.map((u) => new Promise((ok) => Object.assign(new Image(), { onload() { ok(this); }, src: u }))));
    const c = Object.assign(document.createElement("canvas"), { width: 390, height: 844 });
    const x = c.getContext("2d");
    const rec = new MediaRecorder(c.captureStream(30), { mimeType: "video/webm" });
    const chunks = [];
    rec.ondataavailable = (e) => chunks.push(e.data);
    rec.start();
    const wait = (ms) => new Promise((r) => setTimeout(r, ms));
    for (const img of imgs) (x.drawImage(img, 0, 0, 390, 844), await wait(70));
    for (let i = 0; i < 25; i++) (x.drawImage(imgs[imgs.length - 1], 0, 0, 390, 844), await wait(70));
    rec.stop();
    await new Promise((r) => (rec.onstop = r));
    const bytes = new Uint8Array(await new Blob(chunks, { type: "video/webm" }).arrayBuffer());
    let s = "";
    for (let i = 0; i < bytes.length; i += 8192) s += String.fromCharCode(...bytes.subarray(i, i + 8192));
    return btoa(s);
  }, frames.map((f) => `data:image/png;base64,${f.toString("base64")}`));
  await page.close();
  writeFileSync(file, Buffer.from(b64, "base64"));
}
// Answers whatever is showing (sometimes wrong, as people do).
async function answer(dlg) {
  const q = (k) => dlg.locator(`[data-q="${k}"]`);
  if (await q("order-item").count()) for (const b of await q("order-item").all()) await b.click();
  else if (await q("match-left").count()) for (let k = 0; k < (await q("match-left").count()); k++) (await q("match-left").nth(k).click(), await q("match-right").nth(k).click());
  else if (await q("number").count()) await q("number").fill("80");
  else if (await q("spot-part").count()) for (const b of await q("spot-part").all()) await b.click();
  else if (!(await q("estimate").count())) await dlg.getByRole("radio").first().click();
}
// Plays the open lesson; photographs the first of each new kind of question.
async function play(page, prefix, seen = new Set()) {
  for (let i = 0; i < 40; i++) {
    const dlg = page.getByRole("dialog").last();
    if ((await dlg.locator("[data-moment]").count()) || (await dlg.getByText(/^(Lesson complete|Lección completa)$/).count())) return;
    const names = await dlg.getByRole("button").evaluateAll((bs) => bs.map((b) => b.innerText.trim()));
    if (names.some((n) => /^(Check|Comprobar)$/.test(n))) {
      const kind = await dlg.locator("[data-q]").first().getAttribute("data-q").catch(() => null);
      if (kind && !seen.has(kind)) (seen.add(kind), await shot(page, `${prefix}q-${kind}`));
      await answer(dlg);
      await dlg.getByRole("button", { name: /^(Check|Comprobar)$/ }).click();
      if (kind && seen.size <= 2) await shot(page, `${prefix}q-${kind}-feedback`);
    }
    const next = dlg.getByRole("button", { name: /^(Continue|Continuar)$/ });
    if (await next.count()) await next.first().click();
    else {
      const skip = dlg.getByRole("button", { name: /^(Skip for now|Saltar por ahora)$/ });
      if (!(await skip.count())) return;
      await skip.click();
    }
  }
}
try {
  // The first five minutes, both languages.
  for (const [lang, region] of [["en", "US"], ["es", "MX"]]) {
    const p = lang === "es" ? "es-" : "";
    const { ctx, page } = await context(null, lang);
    if (lang === "es") (await page.getByRole("button", { name: "Español" }).click(), await page.getByRole("button", { name: "México" }).click());
    await shot(page, `${p}01-welcome`);
    await page.getByRole("button", { name: /^(Get started|Empezar)$/ }).click();
    await page.getByRole("button", { name: /^(Car|Coche)/ }).first().click();
    await page.getByRole("button", { name: /^(From the beginning|Desde el principio)/ }).click();
    await play(page, `${p}02-`);
    await page.waitForTimeout(1200);
    await shot(page, `${p}03-finish`);
    await page.getByRole("dialog").last().getByRole("button", { name: /^(Done|Listo)$/ }).click();
    await shot(page, `${p}04-today-day1`);
    await ctx.close();
  }
  // Day two: Myth or Fact, the money week, the real cost.
  for (const [lang, region] of [["en", "US"], ["es", "MX"]]) {
    const p = lang === "es" ? "es-" : "";
    const goal = newGoal({ id: "g1", templateId: "car", target: region === "MX" ? 60000 : 5000, start: region === "MX" ? 4000 : 350, months: 24, today: d(12), region });
    // Two lessons last week, so Your money week has something to look back on.
    const lastWeek = new Date(Date.now() - ((new Date().getDay() || 7) + 2) * 864e5).toLocaleDateString("en-CA");
    const lessons = { "budget-1": { done: true, at: lastWeek, last: lastWeek }, "budget-2": { done: true, at: lastWeek, last: lastWeek } };
    const { ctx, page } = await context(learner(lang, region, { lessons, lessonDays: [lastWeek, d(1)] }, { goals: { goals: [goal] } }), lang);
    await shot(page, `${p}10-today-myth`);
    await page.locator("[data-myth]").getByRole("button").first().click();
    await shot(page, `${p}11-myth-answered`);
    await page.getByRole("button", { name: /^(Your money week|Tu semana de dinero)/ }).click();
    await shot(page, `${p}12-money-week`);
    await page.getByRole("dialog").getByRole("button", { name: /^(Close|Cerrar)$/ }).click();
    await page.getByRole("navigation").getByRole("button", { name: lang === "es" ? "Práctica" : "Practice", exact: true }).click();
    await page.waitForTimeout(400);
    if (await page.getByRole("dialog").count()) await page.getByRole("dialog").getByRole("button", { name: /^(Close|Cerrar)$/ }).click();
    await page.locator("[data-rc]").scrollIntoViewIfNeeded();
    await shot(page, `${p}13-practice-real-cost`);
    await ctx.close();
  }
  // A 7-day streak moment.
  {
    const days = [6, 5, 4, 3, 2, 1].map(d);
    const { ctx, page } = await context(learner("en", "US", { streak: { count: 6, last: d(1), best: 6, frozen: [] }, lessonDays: days, days: Object.fromEntries(days.map((x) => [x, 10])) }), "en");
    await page.getByRole("button", { name: "Start" }).click();
    await play(page, "x-", new Set(["order-item", "match-left", "number", "spot-part", "estimate", "scenario"]));
    await shot(page, "20-moment-7-days");
    // The finish, as a short video: quick screenshots while the ring fills
    // and the XP counts up, turned into a WebM by Chrome's own recorder.
    await page.getByRole("dialog").last().getByRole("button", { name: "Continue", exact: true }).click();
    const frames = [];
    const t0 = Date.now();
    while (Date.now() - t0 < 1300) frames.push(await page.screenshot({ scale: "css" }));
    await ctx.close();
    await webm(frames, join(OUT, "finish.webm"));
  }
  console.log("Milestone 4.5 pictures written to docs/design/fun/after (and finish.webm)");
} finally {
  await browser.close();
  server.kill();
}
