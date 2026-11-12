// The landing page's pictures, taken from the real app (so they never
// show anything the app doesn't do): Today, a lesson, the practice
// portfolio, Money Missions and a goal, in English and Spanish, plus the
// share-preview image for each page. Re-run after the app's look changes:
//   npm run build && node scripts/landing-shots.mjs
// Writes web/shots/{en,es}-{1..5}.jpg and web/og-{en,es}.jpg.
import { spawn } from "node:child_process";
import { mkdtempSync, mkdirSync, readFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { chromium } from "playwright-core";
import { newGoal } from "../src/modules/goals/plan.js";
import { ALL_LESSONS, UNITS } from "../src/modules/lessons/content.js";

const ROOT = join(import.meta.dirname, "..");
const OUT = join(ROOT, "web/shots");
mkdirSync(OUT, { recursive: true });
const port = 20000 + Math.floor(Math.random() * 20000);
const env = { ...process.env, NORTHVALE_DOTENV: "0", PORT: String(port), NORTHVALE_DATA: mkdtempSync(join(tmpdir(), "nvl-landing-")), ANTHROPIC_API_KEY: "", ANTHROPIC_AUTH_TOKEN: "", TWELVEDATA_API_KEY: "", SMTP_USER: "", SMTP_PASS: "", NEWS_FEEDS: JSON.stringify({ US: [], MX: [] }) };
const server = spawn(process.execPath, [join(ROOT, "server/index.js")], { env, stdio: ["ignore", "pipe", "inherit"] });
await new Promise((r) => server.stdout.on("data", (d) => String(d).includes("Northvale Learn on") && r()));
const BASE = `http://127.0.0.1:${port}/`;
const browser = await chromium.launch({ channel: "chrome", headless: true });
const day = (n) => new Date(Date.now() + n * 864e5).toLocaleDateString("en-CA");

// A learner a few weeks in: a goal with some saved, the first seven units
// done (practice T-bills/CETES unlocked) and the first fund lesson.
const DONE = ALL_LESSONS.filter((l) => ["budget", "save", "banking", "paycheck", "credit", "scams", "compound"].includes(l.unit) || l.id === "etf-1");
const NEXT = ALL_LESSONS.find((l) => l.unit === "taxes");
function learner(lang, region) {
  const lessons = Object.fromEntries(DONE.map((l, i) => [l.id, { done: true, at: day(i - 30), last: day(i - 30), best: 0, times: 1 }]));
  const goal = { ...newGoal({ id: "g1", templateId: "car", target: region === "MX" ? 60000 : 5000, months: 18, start: 0, path: "save", today: day(-30), region }), contributions: [{ date: day(-20), amount: region === "MX" ? 8000 : 700 }, { date: day(-5), amount: region === "MX" ? 5000 : 450 }] };
  const days = Object.fromEntries(Array.from({ length: 6 }, (_, i) => [day(i - 5), 25]));
  return { version: 1, updatedAt: 1, profile: { onboarded: true, nickname: "Alex", ageBand: "18-25", avatar: 1, ageAsked: true, remindAsked: true, seenIntros: { practice: day(-20), portfolio: day(-20), tools: day(-20), news: day(-20) } }, settings: { lang, region, look: "white", reduceMotion: true, analytics: false }, progress: { xp: 290, days, streak: { count: 6, last: day(0), best: 6, frozen: [] }, freezes: 1, dailyGoal: 20, lessons, lessonDays: Object.keys(days), badges: { first_lesson: day(-14) }, counters: { lessons: DONE.length }, practiced: {}, startUnit: "budget", placed: [], seen: day(0) }, modules: { goals: { goals: [goal], checkIn: day(0) }, feedback: { pending: [], survey: "very" } } };
}

// The logo (the same paths as Mark in src/core/ui.jsx).
const MARK = ["M50 4L53 13L62 16L53 19L50 28L47 19L38 16L47 13Z", "M46 32V74H20Z", "M52 42V74H74Z", "M14 80H86L76 92H24Z"].map((d) => `<path d="${d}"/>`).join("");
const jpeg = (page, name) => page.screenshot({ path: join(OUT, name), type: "jpeg", quality: 72 });
try {
  for (const [lang, region] of [["en", "US"], ["es", "MX"]]) {
    const ctx = await browser.newContext({ viewport: { width: 390, height: 780 }, deviceScaleFactor: 1.5, locale: lang === "es" ? "es-MX" : "en-US", serviceWorkers: "block", reducedMotion: "reduce" });
    await ctx.addInitScript((s) => localStorage.getItem("northvale-learn-v1") || localStorage.setItem("northvale-learn-v1", s), JSON.stringify(learner(lang, region)));
    const page = await ctx.newPage();
    page.setDefaultTimeout(8000);
    await page.goto(BASE);
    await page.addStyleTag({ content: "*,*::before,*::after{animation:none!important;transition:none!important}" });
    // A tab, and a row on its page.
    const menu = async (tab, row) => {
      await page.getByRole("navigation").getByRole("button", { name: tab, exact: true }).click();
      if (row) await page.getByRole("button", { name: new RegExp(`^${row}`) }).first().click();
      await page.waitForTimeout(300);
    };
    const es = lang === "es";
    await page.waitForTimeout(4000); // achievement toasts come and go
    await jpeg(page, `${lang}-1.jpg`);
    // A lesson, at its first question with an answer picked.
    await page.getByRole("button", { name: new RegExp(`^(Unit|Unidad) ${UNITS.findIndex((u) => u.id === NEXT.unit) + 1} · `) }).click();
    await page.getByRole("button", { name: new RegExp(`^${NEXT.title[lang].replace(/[.*+?^${}()|[\]\\]/g, "\\$&")} — `) }).click();
    for (let i = 0; i < 10 && !(await page.getByRole("radio").count()); i++) await page.getByRole("dialog").getByRole("button", { name: /^(Continue|Continuar)$/ }).click();
    await page.waitForTimeout(300);
    await jpeg(page, `${lang}-2.jpg`);
    await page.getByRole("dialog").last().getByRole("button", { name: /^(Close|Cerrar)$/ }).first().click();
    await page.getByRole("button", { name: /^(Leave|Salir)$/ }).click();
    // The practice portfolio, after a practice buy.
    await menu(es ? "Práctica" : "Practice", es ? "Portafolio de práctica" : "Practice portfolio");
    await page.getByRole("button", { name: /^VOO/ }).first().click();
    await page.getByRole("dialog").getByRole("button", { name: "25%" }).click();
    await page.getByRole("dialog").getByRole("button", { name: /^(Buy|Comprar)$/ }).click();
    await page.waitForTimeout(400);
    await page.keyboard.press("Escape");
    await page.evaluate(() => window.scrollTo(0, 0));
    await page.waitForTimeout(4000);
    await jpeg(page, `${lang}-3.jpg`);
    // Money Missions, and the goal.
    await menu(es ? "Práctica" : "Practice", es ? "Misiones de dinero" : "Money Missions");
    await jpeg(page, `${lang}-4.jpg`);
    await menu(es ? "Metas" : "Goals");
    await jpeg(page, `${lang}-5.jpg`);
    await ctx.close();
  }

  // Share previews (1200×630): the wordmark, one honest line, and Home.
  // (Fonts inline: a page made with setContent can't load them from the server.)
  const font = (f) => `url(data:font/woff2;base64,${readFileSync(join(ROOT, "web/fonts", f)).toString("base64")})`;
  for (const [lang, line, sub] of [
    ["en", "Learn money by doing.", "Short lessons, a goal planner and a practice portfolio with pretend money. Free beta, ages 13+."],
    ["es", "Aprende de dinero practicando.", "Lecciones cortas, un planeador de metas y un portafolio con dinero de práctica. Beta gratuita, 13+."],
  ]) {
    const ctx = await browser.newContext({ viewport: { width: 1200, height: 630 } });
    const page = await ctx.newPage();
    const shot = readFileSync(join(OUT, `${lang}-1.jpg`)).toString("base64");
    await page.setContent(`<style>@font-face{font-family:Inter;font-weight:100 900;src:${font("inter-latin-wght-normal.woff2")}}@font-face{font-family:"EB Garamond";font-weight:600 700;src:${font("eb-garamond-latin-600-normal.woff2")}}body{margin:0;width:1200px;height:630px;background:#13315C;color:#F7F2E8;font-family:Inter;display:flex;overflow:hidden}.l{flex:1;padding:72px 0 0 80px}.w{font-family:"EB Garamond";font-weight:650;font-size:56px;display:flex;align-items:center;gap:16px}.m{width:64px;height:64px;fill:#F7F2E8;flex-shrink:0}.k{font-size:20px;letter-spacing:6px;opacity:.7;margin:6px 0 0 3px}h1{font-size:66px;line-height:1.08;letter-spacing:-1.5px;margin:120px 0 0;max-width:600px}.r{width:96px;height:8px;background:#E3CFA4;margin:28px 0}p{font-size:26px;line-height:1.4;opacity:.88;max-width:590px;margin:0}img{width:360px;margin:60px 70px 0 0;border-radius:28px;border:8px solid #0D1A2D;box-shadow:0 20px 50px rgba(0,0,0,.35);align-self:flex-start}</style><div class="l"><div class="w"><svg class="m" viewBox="0 0 100 100">${MARK}</svg>Northvale</div><div class="k">LEARN</div><h1>${line}</h1><div class="r"></div><p>${sub}</p></div><img src="data:image/jpeg;base64,${shot}">`);
    await page.evaluate(() => document.fonts.ready);
    await page.screenshot({ path: join(ROOT, `web/og-${lang}.jpg`), type: "jpeg", quality: 80 });
    await ctx.close();
  }
  console.log("Landing pictures written to web/shots and web/og-*.jpg");
} finally {
  await browser.close();
  server.kill();
}
