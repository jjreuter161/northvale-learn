// Release Candidate 1 pictures, from the real app on a phone screen.
//   npm run build && node docs/design/rc1/capture.mjs [before-dir]
// - first5/: someone new, their first five minutes (welcome → first lesson
//   → its finish → Today), in English/US and Spanish/Mexico, Cream and Navy
//   (the look follows the phone's light or dark setting, as it does for
//   anyone new), plus one sheet per combination.
// - after/ (and before/, given the folder of an older build): a returning
//   learner's main screens in the same four combinations.
import { spawn } from "node:child_process";
import { mkdirSync, mkdtempSync, readFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { chromium } from "playwright-core";
import { newGoal } from "../../../src/modules/goals/plan.js";

const HERE = import.meta.dirname;
const ROOT = join(HERE, "../../..");
const BEFORE = process.argv[2];
const browser = await chromium.launch({ channel: "chrome", headless: true });
const COMBOS = [["en", "US", "white"], ["en", "US", "navy"], ["es", "MX", "white"], ["es", "MX", "navy"]];
const tag = (lang, look) => `${lang}-${look === "navy" ? "navy" : "cream"}`;
const d = (n) => new Date(Date.now() - n * 864e5).toLocaleDateString("en-CA");

async function serve(root) {
  const port = 20000 + Math.floor(Math.random() * 20000);
  const env = { ...process.env, NORTHVALE_DOTENV: "0", PORT: String(port), NORTHVALE_DATA: mkdtempSync(join(tmpdir(), "nvl-rc1-")), ANTHROPIC_API_KEY: "", TWELVEDATA_API_KEY: "", SMTP_USER: "", SMTP_PASS: "", NEWS_FEEDS: JSON.stringify({ US: [], MX: [] }) };
  const p = spawn(process.execPath, [join(root, "server/index.js")], { env, stdio: ["ignore", "pipe", "inherit"] });
  await new Promise((r) => p.stdout.on("data", (x) => String(x).includes("Northvale Learn on") && r()));
  return { base: `http://127.0.0.1:${port}/`, stop: () => p.kill() };
}
async function open(base, { seed, lang, dark }) {
  const ctx = await browser.newContext({ viewport: { width: 390, height: 844 }, deviceScaleFactor: 2, locale: lang === "es" ? "es-MX" : "en-US", timezoneId: "America/Chicago", serviceWorkers: "block", reducedMotion: "reduce", colorScheme: dark ? "dark" : "light" });
  if (seed) await ctx.addInitScript((s) => localStorage.getItem("northvale-learn-v1") || localStorage.setItem("northvale-learn-v1", s), JSON.stringify(seed));
  const page = await ctx.newPage();
  page.setDefaultTimeout(8000);
  await page.goto(base);
  await page.evaluate(() => document.fonts.ready);
  return { ctx, page };
}
const top = (page) => page.getByRole("dialog").last();
async function answer(dlg) {
  const q = (k) => dlg.locator(`[data-q="${k}"]`);
  if (await q("order-item").count()) for (const b of await q("order-item").all()) await b.click();
  else if (await q("match-left").count()) for (let k = 0; k < (await q("match-left").count()); k++) (await q("match-left").nth(k).click(), await q("match-right").nth(k).click());
  else if (await q("number").count()) await q("number").fill("80");
  else if (await q("spot-part").count()) for (const b of await q("spot-part").all()) await b.click();
  else if (!(await q("estimate").count())) await dlg.getByRole("radio").first().click();
}
// One step of the open lesson; `shoot(name)` at the first question, its feedback.
async function playLesson(page, shoot) {
  await page.locator('[aria-busy="true"]').waitFor({ state: "detached", timeout: 10000 }).catch(() => {});
  let asked = false;
  for (let i = 0; i < 50; i++) {
    const dlg = top(page);
    if (await dlg.locator("[data-moment]").count()) {
      await shoot("moment");
      await dlg.getByRole("button", { name: /^(Continue|Continuar)$/ }).click();
      continue;
    }
    const names = await dlg.getByRole("button").evaluateAll((bs) => bs.map((b) => b.getAttribute("aria-label") || b.innerText.trim()));
    if (names.some((n) => /^(Done|Listo)$/.test(n))) return;
    if (names.some((n) => /^(Skip for now|Saltar por ahora|Done — continue|Listo, continuar)$/.test(n))) await dlg.getByRole("button", { name: /^(Skip for now|Saltar por ahora|Done — continue|Listo, continuar)$/ }).click();
    else if (names.some((n) => /^(Check|Comprobar)$/.test(n))) {
      if (!asked) await shoot("question");
      await answer(dlg);
      await dlg.getByRole("button", { name: /^(Check|Comprobar)$/ }).click();
      if (!asked) await shoot("feedback");
      asked = true;
      await dlg.getByRole("button", { name: /^(Continue|Continuar)$/ }).click();
    } else if (names.some((n) => /^(Continue|Continuar)$/.test(n))) await dlg.getByRole("button", { name: /^(Continue|Continuar)$/ }).first().click();
    else return;
  }
}
// Closes one-time sheets (welcome back, "New: …", a quick question).
async function settle(page) {
  for (let i = 0; i < 6; i++) {
    await page.waitForTimeout(250);
    const dlg = page.getByRole("dialog").last();
    if (!(await dlg.count())) return;
    const b = dlg.getByRole("button", { name: /^(Not now|Ahora no|Take a look|Echar un vistazo|Got it|Entendido|Close|Cerrar)$/ });
    if (await b.count()) await b.first().click();
    else await page.keyboard.press("Escape");
  }
}
// The pictures of one combination, on one sheet (for reading them side by side).
async function sheet(files, out, title) {
  const page = await browser.newPage({ viewport: { width: 1600, height: 900 }, deviceScaleFactor: 1 });
  const imgs = files.map(([f, label]) => `<figure><img src="data:image/png;base64,${readFileSync(f).toString("base64")}"><figcaption>${label}</figcaption></figure>`).join("");
  await page.setContent(`<style>body{margin:0;padding:16px;font:14px system-ui;background:#ddd}h1{font-size:18px;margin:0 0 10px}div{display:flex;flex-wrap:wrap;gap:12px}figure{margin:0;width:195px}img{width:195px;border-radius:12px;display:block}figcaption{margin-top:4px}</style><h1>${title}</h1><div>${imgs}</div>`);
  await page.screenshot({ path: out, fullPage: true });
  await page.close();
}

const OUT1 = join(HERE, "first5");
const OUT2 = (which) => join(HERE, which);
try {
  // ---- someone new: the first five minutes ----
  const app = await serve(ROOT);
  mkdirSync(OUT1, { recursive: true });
  for (const [lang, , look] of COMBOS) {
    const t = tag(lang, look);
    const files = [];
    const { ctx, page } = await open(app.base, { lang, dark: look === "navy" });
    let n = 0;
    const shoot = async (name) => {
      await page.waitForTimeout(450);
      const f = join(OUT1, `${t}-${String(++n).padStart(2, "0")}-${name}.png`);
      await page.screenshot({ path: f });
      files.push([f, `${n}. ${name}`]);
    };
    if (lang === "es") (await page.getByRole("button", { name: "Español" }).click(), await page.getByRole("button", { name: "México" }).click());
    await shoot("welcome");
    await page.getByRole("button", { name: /^(Get started|Empezar)$/ }).click();
    await shoot("what-for");
    await page.getByRole("button", { name: /^(Car|Coche)/ }).first().click();
    await shoot("how-to-start");
    await page.getByRole("button", { name: /^(From the beginning|Desde el principio)/ }).click();
    await page.locator('[aria-busy="true"]').waitFor({ state: "detached", timeout: 10000 }).catch(() => {});
    await shoot("lesson-first-card");
    await playLesson(page, shoot);
    await page.waitForTimeout(900);
    await shoot("finish");
    await top(page).getByRole("button", { name: /^(Done|Listo)$/ }).click();
    await shoot("after-the-lesson");
    await settle(page);
    await shoot("today");
    await ctx.close();
    await sheet(files, join(OUT1, `sheet-${t}.png`), `First five minutes · ${lang === "es" ? "Español (México)" : "English (US)"} · ${look === "navy" ? "Navy" : "Cream"}`);
  }
  app.stop();

  // ---- a returning learner: the main screens, after (and before) ----
  for (const [which, root] of [["after", ROOT], ...(BEFORE ? [["before", BEFORE]] : [])]) {
    const s = await serve(root);
    mkdirSync(OUT2(which), { recursive: true });
    for (const [lang, region, look] of COMBOS) {
      const days = [6, 5, 4, 3, 2, 1].map(d);
      const done = ["budget-1", "budget-2", "budget-3", "save-1", "save-2", "save-3", "banking-1", "banking-2"];
      const goal = newGoal({ id: "g1", templateId: "car", target: region === "MX" ? 60000 : 5000, start: region === "MX" ? 4000 : 350, months: 24, today: d(12), region });
      const seed = {
        version: 1, updatedAt: 1,
        profile: { onboarded: true, nickname: "Dani", ageBand: "18-25", avatar: 0, ageAsked: true, remindAsked: true, seenIntros: { practice: true, portfolio: true, tools: true, news: true } },
        settings: { lang, region, look, reduceMotion: true },
        progress: { xp: 180, days: Object.fromEntries(days.map((x) => [x, 20])), streak: { count: 6, last: d(1), best: 6, frozen: [] }, freezes: 1, dailyGoal: 20, lessons: Object.fromEntries(done.map((id) => [id, { done: true, at: d(8), last: d(2), best: 0, times: 1 }])), lessonDays: days, badges: { first_lesson: d(9) }, counters: { lessons: done.length }, practiced: {}, startUnit: "budget", placed: [], seen: d(1) },
        modules: { feedback: { pending: [], survey: "skipped" }, goals: { goals: [goal] } },
      };
      const t = tag(lang, look);
      const { ctx, page } = await open(s.base, { seed, lang, dark: look === "navy" });
      const shoot = async (name) => (await page.waitForTimeout(450), page.screenshot({ path: join(OUT2(which), `${t}-${name}.png`) }));
      await settle(page);
      await shoot("1-today");
      // The course: scrolled to the current unit.
      const cur = page.locator('[aria-expanded="true"]').first();
      if (await cur.count()) await cur.scrollIntoViewIfNeeded();
      else await page.mouse.wheel(0, 700);
      await shoot("2-course");
      await page.evaluate(() => scrollTo(0, 0));
      await page.getByRole("button", { name: /^(Continue|Start|Continuar|Empezar)$/ }).first().click();
      await playLesson(page, (name) => (name === "question" ? shoot("3-question") : name === "feedback" ? shoot("4-feedback") : null));
      await page.waitForTimeout(900);
      await shoot("5-finish");
      await top(page).getByRole("button", { name: /^(Done|Listo)$/ }).click();
      await settle(page);
      for (const [name, label] of [["6-goals", lang === "es" ? "Metas" : "Goals"], ["7-me", lang === "es" ? "Yo" : "Me"]]) {
        await page.getByRole("navigation").getByRole("button", { name: label, exact: true }).click();
        await settle(page);
        await shoot(name);
      }
      await ctx.close();
    }
    s.stop();
  }
  console.log(`RC1 pictures written to docs/design/rc1 (first5/, after/${BEFORE ? ", before/" : ""})`);
} finally {
  await browser.close();
}
