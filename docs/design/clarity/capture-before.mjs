// "Before" screenshots for the clarity rebuild: the app as it was at
// commit 65d538b (☰ menu, goal-first Home), on a phone screen — a new
// learner's first minutes, and Dani three weeks in. (capture-after.mjs
// takes the same moments in the rebuilt app.)
//   npm run build && node docs/design/clarity/capture-before.mjs
import { spawn } from "node:child_process";
import { mkdtempSync, mkdirSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { chromium } from "playwright-core";
import { daniState } from "../../../scripts/seed-demo.mjs";
import { dayKey } from "../../../src/core/progress.js";

const ROOT = join(import.meta.dirname, "../../..");
const OUT = join(import.meta.dirname, "before");
mkdirSync(OUT, { recursive: true });
const port = 20000 + Math.floor(Math.random() * 20000);
const env = { ...process.env, NORTHVALE_DOTENV: "0", PORT: String(port), NORTHVALE_DATA: mkdtempSync(join(tmpdir(), "nvl-before-")), ANTHROPIC_API_KEY: "", TWELVEDATA_API_KEY: "", SMTP_USER: "", SMTP_PASS: "", NEWS_FEEDS: JSON.stringify({ US: [], MX: [] }) };
const server = spawn(process.execPath, [join(ROOT, "server/index.js")], { env, stdio: ["ignore", "pipe", "inherit"] });
await new Promise((r) => server.stdout.on("data", (d) => String(d).includes("Northvale Learn on") && r()));
const BASE = `http://127.0.0.1:${port}/`;
const browser = await chromium.launch({ channel: "chrome", headless: true });
const context = async (seed) => {
  const ctx = await browser.newContext({ viewport: { width: 390, height: 844 }, deviceScaleFactor: 2, locale: "en-US", timezoneId: "America/Chicago", serviceWorkers: "block", reducedMotion: "reduce" });
  if (seed) await ctx.addInitScript((s) => localStorage.getItem("northvale-learn-v1") || localStorage.setItem("northvale-learn-v1", s), JSON.stringify(seed));
  const page = await ctx.newPage();
  page.setDefaultTimeout(8000);
  await page.goto(BASE);
  await page.addStyleTag({ content: "*,*::before,*::after{animation:none!important;transition:none!important}" });
  return { ctx, page };
};
const shot = async (page, name, full = false) => (await page.waitForTimeout(400), page.screenshot({ path: join(OUT, `${name}.png`), fullPage: full }));
try {
  // A new learner: onboarding, the first lesson, then Home.
  {
    const { ctx, page } = await context();
    const b = (n) => page.getByRole("button", { name: n, exact: typeof n === "string" }).first();
    await shot(page, "01-welcome");
    await b("Get started").click();
    await shot(page, "02-onboarding-reason");
    await b(/^Save for something/).click();
    await shot(page, "03-onboarding-goal");
    await b(/^Car/).click();
    await shot(page, "04-onboarding-amount");
    await b("Continue").click();
    await shot(page, "05-onboarding-placement");
    await b(/^I'm new to this/).click();
    await shot(page, "06-onboarding-daily-time");
    await b(/^10 minutes a day/).click();
    await shot(page, "07-first-lesson");
    for (let i = 0; i < 40; i++) {
      const d = page.getByRole("dialog").last();
      const names = await d.getByRole("button").evaluateAll((bs) => bs.map((x) => x.getAttribute("aria-label") || x.innerText.trim()));
      if (names.includes("Check")) (await d.getByRole("radio").first().click(), await d.getByRole("button", { name: "Check", exact: true }).click());
      else if (names.includes("Continue")) await d.getByRole("button", { name: "Continue", exact: true }).click();
      else if (names.some((n) => n === "Skip for now")) await d.getByRole("button", { name: "Skip for now" }).click();
      else break;
    }
    await shot(page, "08-lesson-complete");
    await page.getByRole("dialog").last().getByRole("button", { name: "Done", exact: true }).click();
    await shot(page, "09-home-after-first-lesson");
    await ctx.close();
  }
  // Dani, three weeks in.
  {
    const { ctx, page } = await context({ ...daniState(dayKey()), updatedAt: 1 });
    if (await page.getByRole("dialog").count()) await page.keyboard.press("Escape");
    const menu = async (name) => (await page.getByRole("button", { name: "Menu", exact: true }).click(), await page.getByRole("navigation").getByRole("button", { name, exact: true }).click(), await page.evaluate(() => scrollTo(0, 0)));
    await shot(page, "10-dani-home");
    await shot(page, "10-dani-home-full", true);
    await page.getByRole("button", { name: "Menu", exact: true }).click();
    await shot(page, "11-dani-menu");
    await page.getByRole("navigation").getByRole("button", { name: "Home", exact: true }).click();
    for (const [name, file] of [["Learn", "12-dani-learn"], ["Missions", "13-dani-missions"], ["Portfolio", "14-dani-portfolio"], ["Me", "15-dani-me"]]) (await menu(name), await shot(page, file), await shot(page, `${file}-full`, true));
    await page.getByRole("button", { name: "Ask the tutor" }).click();
    await page.getByRole("dialog").getByRole("textbox").fill("how do credit cards charge interest");
    await page.keyboard.press("Enter");
    await shot(page, "16-dani-tutor-offline");
    await ctx.close();
  }
  console.log("before screenshots written");
} finally {
  await browser.close();
  server.kill();
}
