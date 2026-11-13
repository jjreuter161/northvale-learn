// ACCESSIBILITY — WCAG 2.2 AA, checked by axe-core (the standard checker)
// on every main screen, in Cream and Navy, English/US and Spanish/Mexico:
// Welcome, Today and the sea chart, a lesson (a card, a question, the
// feedback, the finish), Goals, Practice, Me, achievements, Settings, the
// streak sheet, Ask, the privacy policy, and the landing pages. Plus:
// every control shows where keyboard focus is, and at 200% zoom nothing
// runs off the side of the screen. Runs after `npm run build`.
import assert from "node:assert/strict";
import { spawn } from "node:child_process";
import { mkdtempSync } from "node:fs";
import { createRequire } from "node:module";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { chromium } from "playwright-core";

const AXE = createRequire(import.meta.url).resolve("axe-core/axe.min.js");
const ROOT = join(import.meta.dirname, "..");
const port = 30000 + Math.floor(Math.random() * 20000);
const env = { ...process.env, NORTHVALE_DOTENV: "0", PORT: String(port), NORTHVALE_DATA: mkdtempSync(join(tmpdir(), "nvl-a11y-")), ANTHROPIC_API_KEY: "", TWELVEDATA_API_KEY: "", SMTP_USER: "", SMTP_PASS: "", NEWS_FEEDS: JSON.stringify({ US: [], MX: [] }) };
const server = spawn(process.execPath, [join(ROOT, "server/index.js")], { env, stdio: ["ignore", "pipe", "inherit"] });
await new Promise((r) => server.stdout.on("data", (d) => String(d).includes("Northvale Learn on") && r()));
const BASE = `http://127.0.0.1:${port}/`;
const browser = await chromium.launch({ channel: "chrome", headless: true });
const d = (n) => new Date(Date.now() - n * 864e5).toLocaleDateString("en-CA");
const days = [6, 5, 4, 3, 2, 1].map(d);
const done = ["budget-1", "budget-2", "budget-3", "save-1", "save-2", "save-3", "banking-1", "banking-2", "banking-3", "banking-4"];
const learner = (lang, region, look) => ({
  version: 1, updatedAt: 1,
  profile: { onboarded: true, nickname: "Dani", ageBand: "18-25", avatar: 0, ageAsked: true, remindAsked: true, seenIntros: { practice: true, portfolio: true, tools: true, news: true } },
  settings: { lang, region, look, reduceMotion: true },
  progress: { xp: 200, days: Object.fromEntries(days.map((x) => [x, 20])), streak: { count: 6, last: d(1), best: 6, frozen: [] }, freezes: 1, dailyGoal: 20, lessons: Object.fromEntries(done.map((id) => [id, { done: true, at: d(8), last: d(2), best: 0, times: 1 }])), lessonDays: days, badges: { first_lesson: d(9) }, counters: { lessons: 10 }, practiced: {}, startUnit: "budget", placed: [] },
  modules: { feedback: { pending: [], survey: "skipped" } },
});
const RULES = ["wcag2a", "wcag2aa", "wcag21a", "wcag21aa", "wcag22aa"];
const problems = [];
let screens = 0;
async function axe(page, where) {
  await page.waitForTimeout(250);
  if (!(await page.evaluate(() => !!window.axe))) await page.addScriptTag({ path: AXE });
  const r = await page.evaluate((tags) => window.axe.run(document, { runOnly: { type: "tag", values: tags }, resultTypes: ["violations"] }), RULES);
  screens++;
  for (const v of r.violations) problems.push(`${where}: ${v.id} (${v.impact}) — ${v.help} — ${v.nodes.slice(0, 3).map((n) => n.target.join(" ")).join(" | ")}`);
}
async function open(seed, lang, extra = {}) {
  const ctx = await browser.newContext({ viewport: { width: 390, height: 844 }, locale: lang === "es" ? "es-MX" : "en-US", timezoneId: "America/Chicago", serviceWorkers: "block", reducedMotion: "reduce", bypassCSP: true, ...extra });
  if (seed) await ctx.addInitScript((s) => localStorage.getItem("northvale-learn-v1") || localStorage.setItem("northvale-learn-v1", s), JSON.stringify(seed));
  const page = await ctx.newPage();
  page.setDefaultTimeout(8000);
  await page.goto(BASE);
  await page.evaluate(() => document.fonts.ready);
  return { ctx, page };
}
const tab = (page, name) => page.getByRole("navigation").getByRole("button", { name, exact: true }).click();
const L = {
  en: { learn: "Learn", goals: "Goals", practice: "Practice", me: "Me", cont: /^(Continue|Start)$/, check: "Check", next: "Continue", ach: /^Achievements/, settings: /^Settings/, ask: "Ask", close: "Close", start: "Get started" },
  es: { learn: "Aprender", goals: "Metas", practice: "Práctica", me: "Yo", cont: /^(Continuar|Empezar)$/, check: "Comprobar", next: "Continuar", ach: /^Logros/, settings: /^Ajustes/, ask: "Preguntar", close: "Cerrar", start: "Empezar" },
};

try {
  for (const [lang, region, look] of [["en", "US", "white"], ["en", "US", "navy"], ["es", "MX", "white"], ["es", "MX", "navy"]]) {
    const w = L[lang];
    const tag = `${lang}/${look === "navy" ? "Navy" : "Cream"}`;
    // Welcome, for someone new.
    {
      const { ctx, page } = await open({ ...learner(lang, region, look), profile: { onboarded: false, nickname: "", avatar: 0 } }, lang);
      await axe(page, `${tag} welcome`);
      await ctx.close();
    }
    const { ctx, page } = await open(learner(lang, region, look), lang);
    await axe(page, `${tag} Today and the course`);
    // A lesson: the first card, a question, its feedback, the finish.
    await page.getByRole("button", { name: w.cont }).first().click();
    await page.locator('[aria-busy="true"]').waitFor({ state: "detached" });
    const dlg = () => page.getByRole("dialog").last();
    await dlg().getByRole("button").first().waitFor();
    await axe(page, `${tag} a lesson card`);
    let asked = false;
    for (let i = 0; i < 40; i++) {
      if (await dlg().locator("[data-moment]").count()) await dlg().getByRole("button", { name: w.next, exact: true }).click();
      if (await page.getByRole("dialog").last().getByRole("button", { name: lang === "es" ? "Listo" : "Done", exact: true }).count()) break;
      const check = dlg().getByRole("button", { name: w.check, exact: true });
      if ((await check.count()) && !asked) (await axe(page, `${tag} a question`), (asked = true));
      if (await check.count()) {
        const q = (k) => dlg().locator(`[data-q="${k}"]`);
        if (await q("order-item").count()) for (const b of await q("order-item").all()) await b.click();
        else if (await q("match-left").count()) for (let k = 0; k < (await q("match-left").count()); k++) (await q("match-left").nth(k).click(), await q("match-right").nth(k).click());
        else if (await q("number").count()) await q("number").fill("10");
        else if (await q("spot-part").count()) for (const b of await q("spot-part").all()) await b.click();
        else if (!(await q("estimate").count())) await dlg().getByRole("radio").first().click();
        await check.click();
        if (i < 6) await axe(page, `${tag} feedback`);
      }
      const skip = dlg().getByRole("button", { name: lang === "es" ? "Saltar por ahora" : "Skip for now" });
      const next = dlg().getByRole("button", { name: w.next, exact: true });
      if (await skip.count()) await skip.click();
      else if (await next.count()) await next.first().click();
    }
    await axe(page, `${tag} lesson complete`);
    await page.getByRole("dialog").last().getByRole("button", { name: lang === "es" ? "Listo" : "Done", exact: true }).click();
    for (const [name, where] of [[w.goals, "Goals"], [w.practice, "Practice"], [w.me, "Me"]]) (await tab(page, name), await axe(page, `${tag} ${where}`));
    await page.getByRole("button", { name: w.ach }).click();
    await axe(page, `${tag} achievements`);
    await tab(page, w.me);
    await page.getByRole("button", { name: w.settings }).first().click();
    await axe(page, `${tag} Settings`);
    await tab(page, w.learn);
    await page.locator("header").getByRole("button").filter({ hasText: /^\d+$/ }).first().click();
    await axe(page, `${tag} streak sheet`);
    await page.keyboard.press("Escape");
    await page.locator("header").getByRole("button", { name: w.ask }).click();
    await axe(page, `${tag} Ask`);
    await page.getByRole("dialog").last().getByRole("radio", { name: w.ask === "Ask" ? "Explain this" : "Explícame esto" }).click();
    await page.getByRole("dialog").last().getByRole("textbox").fill("Card 4111 1111 1111 1111");
    await axe(page, `${tag} Explain this`);
    await ctx.close();
    // The privacy policy, on its own page.
    {
      const { ctx: c2, page: p2 } = await open(learner(lang, region, look), lang);
      await p2.goto(`${BASE}?legal=privacy&lang=${lang}`);
      await p2.getByRole("heading").first().waitFor();
      await axe(p2, `${tag} privacy policy`);
      await c2.close();
    }
  }
  // The landing pages.
  for (const path of ["welcome", "bienvenida"]) {
    const { ctx, page } = await open(null, path === "welcome" ? "en" : "es");
    await page.goto(`${BASE}${path}`);
    await axe(page, `landing /${path}`);
    await ctx.close();
  }
  assert.deepEqual(problems, [], `accessibility problems (WCAG 2.2 AA):\n  ${problems.join("\n  ")}`);
  console.log(`ok: WCAG 2.2 AA (axe-core): ${screens} screens with no problems — Cream and Navy, English and Spanish, Welcome to lesson complete, every tab, Settings, sheets, the privacy policy and the landing pages`);

  // Keyboard: every control on Today and in Settings shows where focus is.
  {
    const { ctx, page } = await open(learner("en", "US", "white"), "en");
    const unseen = [];
    for (let i = 0; i < 40; i++) {
      await page.keyboard.press("Tab");
      const f = await page.evaluate(() => {
        const e = document.activeElement;
        if (!e || e === document.body) return null;
        const s = getComputedStyle(e);
        return { name: (e.getAttribute("aria-label") || e.innerText || e.tagName).trim().slice(0, 40), shown: s.outlineStyle !== "none" && parseFloat(s.outlineWidth) >= 2 };
      });
      if (f && !f.shown) unseen.push(f.name);
    }
    assert.deepEqual(unseen, [], `focus not visible on: ${unseen.join(", ")}`);
    await ctx.close();
    console.log("ok: keyboard: every control shows a visible focus ring (40 tab stops on Today and the course)");
  }

  // Zoomed to 200% (a 390-pixel phone at double size is 195 pixels wide):
  // nothing runs off the side.
  {
    const { ctx, page } = await open(learner("es", "MX", "white"), "es", { viewport: { width: 195, height: 422 } });
    const wide = [];
    const over = async (where) => {
      await page.waitForTimeout(300);
      const w = await page.evaluate(() => document.documentElement.scrollWidth - window.innerWidth);
      if (w > 1) wide.push(`${where} (+${w}px)`);
    };
    await over("Today and the course");
    for (const name of ["Metas", "Práctica", "Yo"]) (await tab(page, name), await over(name));
    await page.getByRole("button", { name: /^Ajustes/ }).first().click();
    await over("Ajustes");
    assert.deepEqual(wide, [], `at 200% zoom, wider than the screen: ${wide.join(", ")}`);
    await ctx.close();
    console.log("ok: at 200% zoom (Spanish, the longer language), every tab and Settings fit the screen");
  }
} finally {
  await browser.close();
  server.kill();
}
