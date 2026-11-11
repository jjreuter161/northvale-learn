// "After" screenshots for the clarity rebuild: the same moments as
// capture-before.mjs (a new learner's first minutes, and Dani three weeks
// in), in the rebuilt app on a phone screen — English (US), plus a few in
// Spanish (Mexico) and dark mode.
//   npm run build && node docs/design/clarity/capture-after.mjs [folder]
import { spawn } from "node:child_process";
import { mkdtempSync, mkdirSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { chromium } from "playwright-core";
import { daniState } from "../../../scripts/seed-demo.mjs";
import { dayKey } from "../../../src/core/progress.js";

const ROOT = join(import.meta.dirname, "../../..");
const OUT = process.argv[2] || join(import.meta.dirname, "after");
mkdirSync(OUT, { recursive: true });
const port = 20000 + Math.floor(Math.random() * 20000);
const env = { ...process.env, NORTHVALE_DOTENV: "0", PORT: String(port), NORTHVALE_DATA: mkdtempSync(join(tmpdir(), "nvl-after-")), ANTHROPIC_API_KEY: "", TWELVEDATA_API_KEY: "", SMTP_USER: "", SMTP_PASS: "", NEWS_FEEDS: JSON.stringify({ US: [], MX: [] }) };
const server = spawn(process.execPath, [join(ROOT, "server/index.js")], { env, stdio: ["ignore", "pipe", "inherit"] });
await new Promise((r) => server.stdout.on("data", (d) => String(d).includes("Northvale Learn on") && r()));
const BASE = `http://127.0.0.1:${port}/`;
const browser = await chromium.launch({ channel: "chrome", headless: true });
const context = async (seed, { lang = "en", dark = false } = {}) => {
  const ctx = await browser.newContext({ viewport: { width: 390, height: 844 }, deviceScaleFactor: 2, locale: lang === "es" ? "es-MX" : "en-US", timezoneId: "America/Chicago", serviceWorkers: "block", reducedMotion: "reduce", colorScheme: dark ? "dark" : "light" });
  if (seed) await ctx.addInitScript((s) => localStorage.getItem("northvale-learn-v1") || localStorage.setItem("northvale-learn-v1", s), JSON.stringify(seed));
  const page = await ctx.newPage();
  page.setDefaultTimeout(8000);
  await page.goto(BASE);
  await page.addStyleTag({ content: "*,*::before,*::after{animation:none!important;transition:none!important}" });
  return { ctx, page };
};
const shot = async (page, name, full = false) => (await page.waitForTimeout(400), page.screenshot({ path: join(OUT, `${name}.png`), fullPage: full }));
const tab = (page, name) => page.getByRole("navigation").getByRole("button", { name, exact: true }).click();
const row = (page, name) => page.getByRole("button", { name: new RegExp(`^${name}`) }).first().click();
async function play(page) {
  for (let i = 0; i < 40; i++) {
    const d = page.getByRole("dialog").last();
    const names = await d.getByRole("button").evaluateAll((bs) => bs.map((x) => x.getAttribute("aria-label") || x.innerText.trim()));
    if (names.includes("Check") || names.includes("Comprobar")) (await d.getByRole("radio").first().click(), await d.getByRole("button", { name: /^(Check|Comprobar)$/ }).click());
    else if (names.includes("Continue") || names.includes("Continuar")) await d.getByRole("button", { name: /^(Continue|Continuar)$/ }).click();
    else if (names.some((n) => /^(Skip for now|Saltar por ahora)$/.test(n))) await d.getByRole("button", { name: /^(Skip for now|Saltar por ahora)$/ }).click();
    else break;
  }
}
const dani = (lang = "en", region = "US", dark = false) => {
  const s = daniState(dayKey());
  return { ...s, settings: { ...s.settings, lang, region, look: dark ? "navy" : "white" }, profile: { ...s.profile, seenIntros: { practice: dayKey() } }, updatedAt: 1 };
};
try {
  // A new learner: three screens, the first lesson, then Today.
  for (const lang of ["en", "es"]) {
    const { ctx, page } = await context(null, { lang });
    const p = lang === "es" ? "es-" : "";
    const b = (n) => page.getByRole("button", { name: n }).first();
    if (lang === "es") await page.getByRole("button", { name: "Español" }).click();
    if (lang === "es") await page.getByRole("button", { name: /México|MXN/ }).click();
    await shot(page, `${p}01-welcome`);
    await b(/^(Get started|Empezar)$/).click();
    await shot(page, `${p}02-onboarding-what-for`);
    await b(/^(Car|Coche)/).click();
    await shot(page, `${p}03-onboarding-how-to-start`);
    await b(/^(From the beginning|Desde el principio)/).click();
    await shot(page, `${p}04-first-lesson`);
    await play(page);
    await shot(page, `${p}05-lesson-complete`);
    await page.getByRole("dialog").last().getByRole("button", { name: /^(Done|Listo)$/ }).click();
    await shot(page, `${p}06-today-after-first-lesson`);
    await shot(page, `${p}06-today-after-first-lesson-full`, true);
    await tab(page, lang === "es" ? "Práctica" : "Practice");
    await shot(page, `${p}07-practice-locked`);
    await ctx.close();
  }
  // Dani, three weeks in.
  for (const [lang, region, dark] of [["en", "US", false], ["es", "MX", false], ["en", "US", true]]) {
    const { ctx, page } = await context(dani(lang, region, dark), { lang, dark });
    const p = dark ? "dark-" : lang === "es" ? "es-" : "";
    if (await page.getByRole("dialog").count()) await page.keyboard.press("Escape");
    const L = lang === "es" ? { learn: "Aprender", goals: "Metas", practice: "Práctica", me: "Yo", ask: "Preguntar", pf: "Portafolio de práctica" } : { learn: "Learn", goals: "Goals", practice: "Practice", me: "Me", ask: "Ask", pf: "Practice portfolio" };
    await shot(page, `${p}10-dani-today`);
    if (dark) {
      await tab(page, L.practice);
      await shot(page, `${p}13-dani-practice`);
      await ctx.close();
      continue;
    }
    await shot(page, `${p}10-dani-learn-full`, true);
    await tab(page, L.goals);
    await shot(page, `${p}12-dani-goals`);
    await tab(page, L.practice);
    await shot(page, `${p}13-dani-practice`);
    await shot(page, `${p}13-dani-practice-full`, true);
    if (lang === "en") {
      await row(page, L.pf);
      await shot(page, `${p}14-dani-portfolio`);
      await tab(page, L.practice);
      await row(page, "Tools from your lessons");
      await shot(page, `${p}14-dani-tools`);
    }
    await tab(page, L.me);
    await shot(page, `${p}15-dani-me`);
    await shot(page, `${p}15-dani-me-full`, true);
    await page.getByRole("button", { name: L.ask, exact: true }).click();
    await page.getByRole("dialog").getByRole("textbox").fill(lang === "es" ? "¿cómo cobran intereses las tarjetas?" : "how do credit cards charge interest");
    await page.keyboard.press("Enter");
    await shot(page, `${p}16-dani-tutor-offline`);
    await ctx.close();
  }
  console.log("after screenshots written");
} finally {
  await browser.close();
  server.kill();
}
