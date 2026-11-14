// EVERY SCREEN, ON A COMPUTER — the bug hunt as a test. At a laptop (1366px) and a large desktop (1920px), in Chrome:
// the setup flow for someone new (the split layout: the brand on the left, the question on the right; the welcome
// screen, a question, the goal, sign-in), then every screen a learner three weeks in can reach by clicking: Today,
// each tab, a goal and a new goal, every row in Practice, Me and its sections, every section of Settings, Ask,
// the streak, a lesson and a review (started, then left), the legal pages. On each: no errors in the console, no
// failed requests, nothing running off the side or cut off, no raw text keys, "undefined", "NaN" or {placeholders}.
// Runs after `npm run build`.
import assert from "node:assert/strict";
import { spawn } from "node:child_process";
import { mkdtempSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { chromium } from "playwright-core";
import { counter, look, tab, watch, weeks } from "./lib/screens.mjs";

const ROOT = join(import.meta.dirname, "..");
const port = 30000 + Math.floor(Math.random() * 20000);
const env = { ...process.env, NORTHVALE_DOTENV: "0", PORT: String(port), NORTHVALE_DATA: mkdtempSync(join(tmpdir(), "nvl-screens-")), ANTHROPIC_API_KEY: "", TWELVEDATA_API_KEY: "", SMTP_USER: "", SMTP_PASS: "" };
const server = spawn(process.execPath, [join(ROOT, "server/index.js")], { env, stdio: ["ignore", "pipe", "inherit"] });
await new Promise((r) => server.stdout.on("data", (d) => String(d).includes("Northvale Learn on") && r()));
const BASE = `http://127.0.0.1:${port}/`;
const browser = await chromium.launch({ channel: "chrome", headless: true });


async function open(w, h, seed) {
  const ctx = await browser.newContext({ viewport: { width: w, height: h }, locale: "en-US", timezoneId: "America/Chicago", serviceWorkers: "block", reducedMotion: "reduce" });
  if (seed) await ctx.addInitScript((s) => localStorage.getItem("northvale-learn-v1") || localStorage.setItem("northvale-learn-v1", s), JSON.stringify(seed));
  const page = await ctx.newPage();
  page.setDefaultTimeout(8000);
  const trouble = watch(page);
  await page.goto(BASE);
  await page.evaluate(() => document.fonts.ready);
  await page.waitForTimeout(300);
  return { ctx, page, trouble };
}
const back = (page) => page.getByRole("button", { name: /^Back:/ }).first().click();

try {
  for (const [w, h] of [[1366, 768], [1920, 1080]]) {
    const at = (s) => `${w}px: ${s}`;

    // --- setup, for someone new: two halves ---
    {
      const { ctx, page, trouble } = await open(w, h);
      const half = async (where) => {
        const brand = await page.locator(".nv-brand").evaluate((el) => { const b = el.getBoundingClientRect(); return { left: b.left, right: b.right, top: b.top, bottom: b.bottom }; });
        const form = await page.locator(".nv-formside > *").first().evaluate((el) => { const b = el.getBoundingClientRect(); return { left: b.left, right: b.right, width: b.width }; });
        assert.ok(brand.left === 0 && brand.right > w * 0.35 && brand.right < w * 0.55 && brand.top === 0 && brand.bottom >= h - 1, `${at(where)}: the brand fills the left side (${JSON.stringify(brand)})`);
        assert.ok(form.left >= brand.right && form.width <= 481 && form.width >= 300, `${at(where)}: the form sits on the right, at a comfortable width (${Math.round(form.width)}px)`);
        assert.ok(await page.locator(".nv-brand").getByText("Find your open water").count(), `${at(where)}: the tagline is on the brand side`);
      };
      await half("welcome");
      await look(page, trouble, at("welcome"));
      await page.getByRole("button", { name: "I already have an account" }).click();
      await half("sign-in");
      assert.ok(await page.getByRole("heading", { name: "Sign in" }).count() || await page.getByText("Sign in").count(), `${at("sign-in")}: the form`);
      await look(page, trouble, at("sign-in"));
      await page.getByRole("button", { name: "Back" }).first().click();
      await page.getByRole("button", { name: /Get started/ }).click();
      await half("first question");
      await look(page, trouble, at("first question"));
      await page.getByRole("radio").first().click();
      await page.getByRole("button", { name: "Check", exact: true }).click();
      await page.getByRole("button", { name: "Continue", exact: true }).click();
      await half("goal");
      await look(page, trouble, at("goal"));
      await page.getByRole("button", { name: /^Emergency fund/ }).click();
      await page.getByRole("dialog").first().waitFor();
      await page.getByRole("button", { name: "Close", exact: true }).first().click();
      await page.getByRole("button", { name: "Leave", exact: true }).click();
      await page.getByRole("navigation", { name: "Main tabs" }).waitFor();
      assert.equal(await page.locator(".nv-split").count(), 0, `${at("after setup")}: the split is only for setup`);
      const panel = await page.getByRole("complementary", { name: "At a glance" }).innerText();
      for (const text of ["0-day streak", "Today: 0 / 20 XP", "Set a goal", "Opens after your first three lessons", "A daily question, starting tomorrow"]) assert.ok(panel.includes(text), `${at("Today, brand new")}: the panel says what goes there: "${text}"`);
      await look(page, trouble, at("Today, brand new"));
      for (const name of ["Goals", "Practice", "Me"]) (await tab(page, name), await look(page, trouble, at(`${name}, brand new`)));
      await ctx.close();
    }

    // --- three weeks in: every screen ---
    {
      const { ctx, page, trouble } = await open(w, h, weeks);
      await look(page, trouble, at("Today"));
      // The sea chart: open a unit from its island.
      await page.getByRole("button", { name: /^Unit 2 ·/ }).first().click();
      await look(page, trouble, at("Today, a unit opened"));
      // Goals: the goal, a new goal.
      await tab(page, "Goals");
      await look(page, trouble, at("Goals"));
      await page.getByRole("button", { name: /My first car/ }).first().click();
      await look(page, trouble, at("a goal"));
      await tab(page, "Goals");
      await page.getByRole("button", { name: /^Car/ }).first().click();
      await page.getByRole("dialog").waitFor();
      await look(page, trouble, at("a new goal"));
      await page.keyboard.press("Escape");
      // Practice: every row.
      await tab(page, "Practice");
      await look(page, trouble, at("Practice"));
      const rows = await page.locator("main .nv-list > button").count();
      assert.ok(rows >= 3, `${at("Practice")}: rows to open (${rows})`);
      for (let i = 0; i < rows; i++) {
        await tab(page, "Practice");
        const row = page.locator("main .nv-list > button").nth(i);
        const name = (await row.innerText()).split("\n")[0];
        await row.click();
        await look(page, trouble, at(`Practice › ${name}`));
      }
      // Me: its sections.
      await tab(page, "Me");
      await look(page, trouble, at("Me"));
      for (const name of [/^Achievements/, /^Skills/]) {
        await tab(page, "Me");
        await page.locator("main").getByRole("button", { name }).first().click();
        await look(page, trouble, at(`Me › ${name}`));
      }
      // Settings: every section on the left, then the legal pages.
      await tab(page, "Me");
      await page.getByRole("button", { name: /^Settings/ }).first().click();
      const side = page.getByRole("navigation", { name: "Settings" });
      for (const name of await side.getByRole("button").allInnerTexts()) {
        await side.getByRole("button", { name, exact: true }).click();
        await look(page, trouble, at(`Settings › ${name}`));
      }
      await side.getByRole("button", { name: "Legal", exact: true }).click();
      await page.getByRole("button", { name: /Privacy/ }).first().click();
      await look(page, trouble, at("the privacy policy"));
      // Ask, the streak, a lesson and a review (started, then left).
      await tab(page, "Learn");
      await page.getByRole("button", { name: "Ask", exact: true }).click();
      await page.getByRole("dialog").waitFor();
      await look(page, trouble, at("Ask"));
      await page.keyboard.press("Escape");
      await page.getByRole("button", { name: /^Streak: \d+ days/ }).first().click();
      await look(page, trouble, at("the streak"));
      await page.keyboard.press("Escape");
      for (const start of [() => page.getByRole("button", { name: /^(Continue|Start review)$/ }).first().click(), () => page.getByText("Next lesson").first().click()]) {
        await start();
        await page.getByRole("dialog").first().waitFor();
        await look(page, trouble, at("a lesson or review"));
        await page.getByRole("button", { name: "Close", exact: true }).first().click();
        await page.getByRole("button", { name: "Leave", exact: true }).click();
        await page.getByRole("navigation", { name: "Main tabs" }).waitFor();
      }
      await ctx.close();
    }
    console.log(`ok: ${w}px: setup in two halves (welcome, sign-in, a question, the goal), then every screen three weeks in, with no console errors, nothing cut off, no raw text`);
  }
  console.log(`(${counter.looked} screens looked at)`);
} finally {
  await browser.close();
  server.kill();
}
