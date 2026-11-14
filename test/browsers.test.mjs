// THE MAIN FLOWS IN THREE BROWSER ENGINES — Chrome, Firefox and Safari's engine (WebKit), each on a laptop and on a phone
// (WebKit on an iPhone 13; Chrome on a phone-sized touch screen; Firefox at phone size). In each: setup for someone new
// (two halves on a laptop, just the form on a phone), then a learner three weeks in: Today, every tab, Settings, the
// streak dialog, Ask, and a lesson (1–4 and Enter on a laptop, taps on a phone). Each screen must have no console errors,
// nothing off the side or cut off, and no raw text keys or broken text.
// Firefox and WebKit are installed for testing only:  node node_modules/playwright-core/cli.js install firefox webkit
// (an engine that isn't installed is skipped, with a note). Runs after `npm run build`.
import assert from "node:assert/strict";
import { spawn } from "node:child_process";
import { mkdtempSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { chromium, devices, firefox, webkit } from "playwright-core";
import { counter, look, tab, watch, weeks } from "./lib/screens.mjs";

const ROOT = join(import.meta.dirname, "..");
const port = 30000 + Math.floor(Math.random() * 20000);
const env = { ...process.env, NORTHVALE_DOTENV: "0", PORT: String(port), NORTHVALE_DATA: mkdtempSync(join(tmpdir(), "nvl-browsers-")), ANTHROPIC_API_KEY: "", TWELVEDATA_API_KEY: "", SMTP_USER: "", SMTP_PASS: "" };
const server = spawn(process.execPath, [join(ROOT, "server/index.js")], { env, stdio: ["ignore", "pipe", "inherit"] });
await new Promise((r) => server.stdout.on("data", (d) => String(d).includes("Northvale Learn on") && r()));
const BASE = `http://127.0.0.1:${port}/`;

const ENGINES = [
  ["Chrome", /Chrome\//, () => chromium.launch({ channel: "chrome", headless: true }), (phone) => (phone ? { viewport: { width: 390, height: 844 }, isMobile: true, hasTouch: true } : {})],
  ["Firefox", /Firefox\//, () => firefox.launch({ headless: true }), (phone) => (phone ? { viewport: { width: 390, height: 844 } } : {})],
  ["Safari (WebKit)", /^((?!Chrome|Firefox).)*Safari\//, () => webkit.launch({ headless: true }), (phone) => (phone ? { ...devices["iPhone 13"] } : {})],
];
const LAPTOP = { viewport: { width: 1366, height: 768 } };
const ran = [];
const skipped = [];

try {
  for (const [name, uaPattern, launch, extra] of ENGINES) {
    let browser;
    try {
      browser = await launch();
    } catch (e) {
      skipped.push(name);
      console.log(`skipped ${name}: not installed (node node_modules/playwright-core/cli.js install firefox webkit)`);
      continue;
    }
    for (const phone of [false, true]) {
      const where = `${name}, ${phone ? "phone" : "laptop"}`;
      const open = async (seed) => {
        const ctx = await browser.newContext({ ...(phone ? {} : LAPTOP), ...extra(phone), locale: "en-US", timezoneId: "America/Chicago", serviceWorkers: "block", reducedMotion: "reduce" });
        if (seed) await ctx.addInitScript((s) => localStorage.getItem("northvale-learn-v1") || localStorage.setItem("northvale-learn-v1", s), JSON.stringify(seed));
        const page = await ctx.newPage();
        page.setDefaultTimeout(10000);
        const trouble = watch(page);
        await page.goto(BASE);
        assert.match(await page.evaluate(() => navigator.userAgent), uaPattern, `${where}: really running in ${name}`);
        await page.evaluate(() => document.fonts.ready);
        await page.waitForTimeout(400);
        return { ctx, page, trouble };
      };

      // --- setup, for someone new ---
      {
        const { ctx, page, trouble } = await open();
        assert.equal(await page.locator(".nv-brand").count(), phone ? 0 : 1, `${where}: ${phone ? "setup is just the form on a phone" : "the brand is on the left of setup"}`);
        await look(page, trouble, `${where}: welcome`);
        await page.getByRole("button", { name: "I already have an account" }).click();
        await look(page, trouble, `${where}: sign-in`);
        await page.getByRole("button", { name: "Back" }).first().click();
        await page.getByRole("button", { name: /Get started/ }).click();
        await look(page, trouble, `${where}: first question`);
        await page.getByRole("radio").first().click();
        await page.getByRole("button", { name: "Check", exact: true }).click();
        await page.getByRole("button", { name: "Continue", exact: true }).click();
        await look(page, trouble, `${where}: goal`);
        await page.getByRole("button", { name: /^Emergency fund/ }).click();
        await page.getByRole("dialog").first().waitFor();
        await page.getByRole("button", { name: "Close", exact: true }).first().click();
        await page.getByRole("button", { name: "Leave", exact: true }).click();
        await page.getByRole("navigation", { name: "Main tabs" }).waitFor();
        await look(page, trouble, `${where}: Today, brand new`);
        await ctx.close();
      }

      // --- three weeks in ---
      {
        const { ctx, page, trouble } = await open(weeks);
        await look(page, trouble, `${where}: Today`);
        assert.equal(await page.locator(".nv-side").count(), phone ? 0 : 1, `${where}: ${phone ? "bottom tabs" : "a sidebar"}`);
        for (const label of ["Goals", "Practice", "Me"]) (await tab(page, label), await look(page, trouble, `${where}: ${label}`));
        await page.getByRole("button", { name: /^Settings/ }).first().click();
        await look(page, trouble, `${where}: Settings`);
        if (!phone) {
          await page.getByRole("navigation", { name: "Settings" }).getByRole("button", { name: "Colors", exact: true }).click();
          await page.getByRole("radiogroup", { name: "Colors" }).waitFor();
          await look(page, trouble, `${where}: Settings, Colors`);
        }
        await tab(page, "Learn");
        await page.getByRole("button", { name: /^Streak: \d+ days/ }).first().click();
        await page.getByRole("dialog").waitFor();
        await look(page, trouble, `${where}: the streak dialog`);
        await page.keyboard.press("Escape");
        await page.getByRole("button", { name: "Ask", exact: true }).first().click();
        await page.getByRole("dialog").waitFor();
        await look(page, trouble, `${where}: Ask`);
        await page.keyboard.press("Escape");
        await page.getByText("Next lesson").first().click();
        await page.getByRole("dialog").first().waitFor();
        const player = page.locator("[data-player]");
        for (let i = 0; i < 5 && !(await page.getByRole("radio").count()); i++) {
          await player.getByRole("button", { name: "Continue", exact: true }).click();
          await page.waitForTimeout(250);
        }
        assert.ok(await page.getByRole("radio").count() >= 3, `${where}: reached a choice question`);
        if (phone) {
          await page.getByRole("radio").nth(1).click();
        } else {
          await page.keyboard.press("2");
          assert.equal(await page.getByRole("radio").nth(1).getAttribute("aria-checked"), "true", `${where}: 2 picks the second answer`);
        }
        await look(page, trouble, `${where}: a lesson question`);
        if (phone) await player.getByRole("button", { name: "Check", exact: true }).click();
        else await page.keyboard.press("Enter");
        await page.locator('[role="status"][data-right]').waitFor();
        await look(page, trouble, `${where}: the answer`);
        await page.getByRole("button", { name: "Close", exact: true }).first().click();
        await page.getByRole("button", { name: "Leave", exact: true }).click();
        await ctx.close();
      }
      ran.push(where);
      console.log(`ok: ${where}: setup for someone new, then Today, every tab, Settings, the streak dialog, Ask and a lesson, with no console errors, nothing cut off, no raw text`);
    }
    await browser.close();
  }
  assert.ok(ran.length >= 2, "at least Chrome ran");
  console.log(`(${counter.looked} screens looked at; ran: ${ran.length / 2} browsers${skipped.length ? `; skipped: ${skipped.join(", ")}` : ""})`);
} finally {
  server.kill();
}
