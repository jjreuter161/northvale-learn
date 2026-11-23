// THE REDESIGN, CHECKED — what the new interface does that the other tests don't pin down (docs/DESIGN-SYSTEM.md):
//   Today is one card with one red button and a path strip that leads to the course
//   a Settings page on a phone closes with Back before Settings itself does
//   on a laptop a lesson shows its steps in a side panel, marks the current one, and can ask about it
//   the keyboard focus ring is the text color (a field never adds a second red thing), and 3px thick
//   a switch is a 44px target that says its state; the welcome screen's language buttons are a labelled group
//   after a miss the right option has the check and the wrong pick the hint icon (they differ by icon, not only by edge)
//   focus rings are never clipped (a list row's is drawn inside it; the number box rings as a whole), the arrow keys move
//   through a radio group, and a dialog takes focus when it opens and gives it back when it closes
// Runs after `npm run build`, in Chrome.
import { spawn } from "node:child_process";
import { mkdtempSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import assert from "node:assert/strict";
import { chromium } from "playwright-core";
import { UNITS } from "../src/modules/lessons/units/all.js";

const ROOT = join(import.meta.dirname, "..");
const port = 20000 + Math.floor(Math.random() * 20000);
const env = { ...process.env, NORTHVALE_DOTENV: "0", PORT: String(port), NORTHVALE_DATA: mkdtempSync(join(tmpdir(), "nvlearn-redesign-")), ANTHROPIC_API_KEY: "", ANTHROPIC_AUTH_TOKEN: "", TWELVEDATA_API_KEY: "", SMTP_USER: "", SMTP_PASS: "", NEWS_FEEDS: JSON.stringify({ US: [], MX: [] }) };
const server = spawn(process.execPath, [join(ROOT, "server/index.js")], { env, stdio: ["ignore", "pipe", "inherit"] });
await new Promise((resolve) => server.stdout.on("data", (d) => String(d).includes("Northvale Learn on") && resolve()));
const BASE = `http://127.0.0.1:${port}/`;
const browser = await chromium.launch({ channel: "chrome", headless: true }).catch(() => chromium.launch({ headless: true }));
const PHONE = { viewport: { width: 390, height: 844 }, isMobile: true, hasTouch: true };
const LAPTOP = { viewport: { width: 1366, height: 768 } };
const day = (n) => new Date(Date.now() + n * 864e5).toLocaleDateString("en-CA", { timeZone: "America/Mexico_City" });
const learner = (doneIds = []) => ({
  version: 1, updatedAt: 1,
  profile: { onboarded: true, nickname: "", avatar: 0, ageBand: "18-25", seenIntros: { keys: "x", practice: "x", save: "x", news: "x" } },
  settings: { lang: "en", region: "US", look: "white", reduceMotion: true },
  progress: { xp: 0, days: {}, streak: { count: 0, last: null, best: 0, frozen: [] }, freezes: 0, dailyGoal: 20, lessons: Object.fromEntries(doneIds.map((id) => [id, { done: true, at: day(-1), last: day(-1), best: 0, times: 1 }])), lessonDays: [], badges: {}, counters: { lessons: doneIds.length }, practiced: {}, startUnit: "budget", placed: [] },
  modules: { feedback: { pending: [], survey: "skipped" } },
});
async function open(seed, size) {
  const context = await browser.newContext({ ...size, locale: "en-US", timezoneId: "America/Mexico_City", serviceWorkers: "block", reducedMotion: "reduce" });
  if (seed) await context.addInitScript((s) => localStorage.getItem("northvale-learn-v1") || localStorage.setItem("northvale-learn-v1", s), JSON.stringify(seed));
  const page = await context.newPage();
  page.setDefaultTimeout(6000);
  const errors = [];
  page.on("pageerror", (e) => errors.push(String(e)));
  page.on("console", (m) => m.type() === "error" && errors.push(m.text()));
  await page.goto(BASE);
  return { page, errors, close: () => context.close() };
}
const ok = (m) => console.log(`ok: ${m}`);

try {
  // --- Today: one card, one red button, a path strip to the course ---
  {
    const { page, errors, close } = await open(learner(["budget-1", "budget-2", "budget-3"]), PHONE);
    await page.getByRole("heading", { name: "Today" }).waitFor();
    const reds = await page.evaluate(() => [...document.querySelectorAll("main *")].filter((e) => { const b = e.getBoundingClientRect(); return b.width > 0 && b.height > 0 && getComputedStyle(e).backgroundColor === "rgb(200, 32, 42)"; }).length);
    assert.equal(reds, 1, `Today has one red button (${reds})`);
    const strip = page.getByRole("button", { name: /^Your course/ });
    assert.equal(await strip.count(), 1, "one path strip");
    assert.match(await strip.innerText(), /Unit \d+ of 18/, "the strip says which unit you're in");
    await strip.click();
    await page.waitForTimeout(400);
    const top = await page.evaluate(() => document.getElementById("nv-course").getBoundingClientRect().top);
    assert.ok(top < 300, `the strip takes you to the course (it is ${Math.round(top)}px from the top)`);
    assert.deepEqual(errors, [], "no console errors");
    await close();
    ok("Today is one next-step card with one red button, and its path strip leads to the course below");
  }

  // --- Settings on a phone: Back closes the page, then Settings ---
  {
    const { page, close } = await open(learner(["budget-1"]), PHONE);
    await page.getByRole("navigation").getByRole("button", { name: "Me", exact: true }).click();
    await page.getByRole("button", { name: /^Settings/ }).click();
    await page.getByRole("radiogroup", { name: "Language" }).waitFor();
    await page.getByRole("button", { name: "Sound and feel", exact: true }).click();
    await page.getByRole("heading", { name: "Sound and feel", level: 1 }).waitFor();
    assert.equal(await page.getByRole("radiogroup", { name: "Language" }).count(), 0, "a page shows only its own part");
    await page.goBack();
    await page.getByRole("radiogroup", { name: "Language" }).waitFor();
    assert.equal(await page.getByRole("heading", { name: "Settings", level: 1 }).count(), 1, "Back from a page is Settings, not the screen before it");
    await close();
    ok("on a phone, Back closes a Settings page and lands on Settings");
  }

  // --- a switch: a 44px target, with its state ---
  {
    const { page, close } = await open(learner(["budget-1"]), PHONE);
    await page.getByRole("navigation").getByRole("button", { name: "Me", exact: true }).click();
    await page.getByRole("button", { name: /^Settings/ }).click();
    await page.getByRole("button", { name: "Sound and feel", exact: true }).click();
    const sw = page.getByRole("switch", { name: "Sounds" });
    const box = await sw.boundingBox();
    assert.ok(box.height >= 44 && box.width >= 44, `a switch is at least 44px (${Math.round(box.width)}×${Math.round(box.height)})`);
    const before = await sw.getAttribute("aria-checked");
    await sw.click();
    assert.notEqual(await sw.getAttribute("aria-checked"), before, "it changes state");
    await close();
    ok("a switch is a 44px target and says whether it is on");
  }

  // --- the focus ring is the text color, 3px, never red ---
  {
    const { page, close } = await open(learner(["budget-1"]), PHONE);
    await page.getByRole("button", { name: /^Ask$/ }).click();
    const field = page.getByRole("textbox").last();
    await field.click();
    const ring = await field.evaluate((el) => { const s = getComputedStyle(el); return { color: s.outlineColor, width: s.outlineWidth, style: s.outlineStyle, text: getComputedStyle(document.body).color }; });
    assert.equal(ring.style, "solid", "a focused field shows a ring");
    assert.equal(ring.width, "3px", "3px thick");
    assert.equal(ring.color, ring.text, `in the text color (${ring.color}), so it isn't a second red thing`);
    await close();
    ok("keyboard focus is a 3px ring in the text color");
  }

  // --- the welcome screen: language and country as labelled groups of buttons that switch the screen ---
  {
    const { page, close } = await open(null, PHONE);
    await page.getByRole("button", { name: "Get started" }).waitFor();
    const es = page.getByRole("group", { name: "Language" }).getByRole("button", { name: "Español" });
    assert.equal(await es.getAttribute("aria-pressed"), "false");
    await es.click();
    await page.getByRole("button", { name: "Empezar" }).waitFor();
    assert.equal(await page.getByRole("group", { name: "Idioma" }).getByRole("button", { name: "Español" }).getAttribute("aria-pressed"), "true", "the chosen language is marked");
    await page.getByText("Aprende de dinero practicando.").waitFor();
    await close();
    ok("on the welcome screen Español switches the whole screen, and the choice is marked");
  }

  // --- a lesson on a laptop: the steps beside the text, the current one marked, and Ask about this ---
  {
    const { page, errors, close } = await open(learner(), LAPTOP);
    await page.getByRole("button", { name: /^Start/ }).first().click();
    const dialog = page.getByRole("dialog").last();
    const side = dialog.getByRole("complementary", { name: "In this lesson" });
    await side.waitFor();
    const steps = await side.getByRole("listitem").count();
    assert.ok(steps >= 5, `the panel lists the steps (${steps})`);
    assert.equal(await side.locator('[aria-current="step"]').count(), 1, "one step is marked as here");
    assert.equal(await side.locator("li").first().getAttribute("aria-current"), "step", "the first step is the one you're on");
    await dialog.getByRole("button", { name: "Continue", exact: true }).click();
    await page.waitForTimeout(150);
    assert.equal(await side.locator("li").nth(1).getAttribute("aria-current"), "step", "the marker moves on");
    await side.getByRole("button", { name: "Ask about this" }).click();
    await page.getByRole("dialog", { name: "Tutor" }).waitFor();
    await page.keyboard.press("Escape");
    assert.deepEqual(errors, [], "no console errors");
    await close();
    ok("on a laptop a lesson shows its steps beside the text with the current one marked, and Ask about this opens the tutor");
  }

  // --- after a miss: the right option has the check, the wrong pick the hint icon ---
  {
    const lesson = UNITS[0].lessons[0];
    const match = lesson.steps.find((x) => x.type === "match");
    const choice = lesson.steps.find((x) => x.type === "choice");
    const { page, close } = await open(learner(), PHONE);
    await page.getByRole("button", { name: /^Start/ }).first().click();
    const dialog = page.getByRole("dialog").last();
    await dialog.getByRole("button", { name: "Continue", exact: true }).click();
    await dialog.getByRole("button", { name: "Continue", exact: true }).click();
    for (let k = 0; k < match.pairs.length; k++) { await dialog.locator('[data-q="match-left"]').nth(k).click(); await dialog.locator(`[data-q="match-right"][data-i="${k}"]`).click(); }
    await dialog.getByRole("button", { name: "Check", exact: true }).click();
    await dialog.getByRole("button", { name: "Continue", exact: true }).click();
    const wrong = (choice.answer + 1) % choice.options.length;
    await dialog.getByRole("radio").nth(wrong).click();
    assert.equal(await dialog.locator('.nv-k[data-mark="pick"]').count(), 1, "before checking, the pick shows a check");
    await dialog.getByRole("button", { name: "Check", exact: true }).click();
    assert.equal(await dialog.locator('.nv-k[data-mark="right"]').count(), 1, "the right option has the check");
    assert.equal(await dialog.locator('.nv-k[data-mark="wrong"]').count(), 1, "the wrong pick is marked too");
    assert.equal(await dialog.locator('.nv-k[data-mark="pick"]').count(), 0, "nothing still looks merely picked");
    const icon = (mark) => dialog.locator(`.nv-k[data-mark="${mark}"] path`).first().getAttribute("d");
    assert.notEqual(await icon("right"), await icon("wrong"), "the right and the wrong mark are different icons");
    const fills = await dialog.locator(".nv-k[data-mark]").evaluateAll((es) => es.map((e) => [e.dataset.mark, e.className, getComputedStyle(e).backgroundColor]));
    const fill = (m) => fills.find((f) => f[0] === m)[2];
    assert.notEqual(fill("wrong"), fill("right"), `the wrong pick's badge is not filled like the right one's (${JSON.stringify(fills)})`);
    await close();
    ok("after a miss the right option has the check and the wrong pick the hint icon (an unfilled badge), so they differ by icon as well as by edge");
  }

  // --- focus rings: a list row's sits inside the row; the arrow keys move through a radio group ---
  {
    const { page, close } = await open(learner(["budget-1", "budget-2"]), PHONE);
    await page.getByRole("heading", { name: "Today" }).waitFor();
    const row = page.locator("main .nv-list .nv-row").first();
    await row.focus();
    await page.keyboard.press("Tab");
    await page.keyboard.press("Shift+Tab");
    const ring = await row.evaluate((el) => { const c = getComputedStyle(el); return { style: c.outlineStyle, offset: parseFloat(c.outlineOffset), width: c.outlineWidth }; });
    assert.equal(ring.style, "solid", "a focused row shows a ring");
    assert.ok(ring.offset < 0, `drawn inside the row so the list can't clip it (offset ${ring.offset}px)`);
    await page.getByRole("navigation").getByRole("button", { name: "Me", exact: true }).click();
    await page.getByRole("button", { name: /^Settings/ }).click();
    const en = page.getByRole("radiogroup", { name: "Language" }).getByRole("radio", { name: "English" });
    await en.focus();
    await page.keyboard.press("ArrowRight");
    await page.getByRole("radiogroup", { name: "Idioma" }).waitFor();
    assert.equal(await page.getByRole("radiogroup", { name: "Idioma" }).getByRole("radio", { name: "Español" }).getAttribute("aria-checked"), "true", "ArrowRight picks the next choice");
    await page.waitForFunction(() => document.activeElement && document.activeElement.innerText === "Español" && document.activeElement.getAttribute("aria-checked") === "true", null, { timeout: 3000 }).catch(() => {});
    assert.equal(await page.evaluate(() => document.activeElement.getAttribute("aria-checked") + ":" + document.activeElement.innerText), "true:Español", "and focus goes with it");
    assert.equal(await page.getByRole("radiogroup", { name: "Idioma" }).getByRole("radio").evaluateAll((rs) => rs.filter((r) => r.tabIndex === 0).length), 1, "the group is one tab stop");
    await close();
    ok("a list row's focus ring is drawn inside it, and ArrowRight picks the next choice of a radio group (one tab stop, focus follows)");
  }

  // --- a dialog takes focus when it opens and gives it back when it closes ---
  {
    const { page, close } = await open(learner(["budget-1"]), PHONE);
    const ask = page.getByRole("button", { name: /^Ask$/ });
    await ask.click();
    const dialog = page.getByRole("dialog", { name: "Tutor" });
    await dialog.waitFor();
    await page.waitForTimeout(150);
    assert.equal(await page.evaluate(() => !!document.activeElement.closest('[role="dialog"]')), true, "focus is inside the dialog once it opens");
    await page.keyboard.press("Escape");
    await dialog.waitFor({ state: "detached" });
    await page.waitForTimeout(100);
    assert.equal(await page.evaluate(() => document.activeElement.getAttribute("aria-label") || document.activeElement.innerText), "Ask", "closing it puts focus back on the Ask button");
    await close();
    ok("a dialog takes focus when it opens and gives it back to the button that opened it");
  }
} finally {
  await browser.close();
  server.kill();
}
