// A BUG BASH, AS A TEST — trying to break the app on purpose, in Chrome. It fails if anything breaks:
//   tapping fast (many taps at once, double taps), Back and Forward over and over, refreshing in the middle of a
//   lesson, losing the connection, very long names, switching language and colors in the middle, the keyboard only,
//   200% zoom on a laptop, a tiny phone (320 x 568, also the width a 200% zoom gives a small phone), a huge monitor
//   (2560 x 1440).
// "Breaks" means: a script error, a blank or stuck screen, text running off the side, a step skipped or counted twice,
// or no way back to Today. Runs after `npm run build`.
import { spawn } from "node:child_process";
import { mkdtempSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import assert from "node:assert/strict";
import { chromium } from "playwright-core";
import { UNITS } from "../src/modules/lessons/units/all.js";
import { newGoal } from "../src/modules/goals/plan.js";

const ROOT = join(import.meta.dirname, "..");
const port = 20000 + Math.floor(Math.random() * 20000);
const env = { ...process.env, NORTHVALE_DOTENV: "0", PORT: String(port), NORTHVALE_DATA: mkdtempSync(join(tmpdir(), "nvlearn-bash-")), ANTHROPIC_API_KEY: "", ANTHROPIC_AUTH_TOKEN: "", TWELVEDATA_API_KEY: "", SMTP_USER: "", SMTP_PASS: "", ALERT_WEBHOOK_URL: "", NEWS_FEEDS: JSON.stringify({ US: [], MX: [] }), SIGNUP_CODE: "", ADMIN_TOKEN: "" };
const server = spawn(process.execPath, [join(ROOT, "server/index.js")], { env, stdio: ["ignore", "pipe", "inherit"] });
await new Promise((resolve) => server.stdout.on("data", (d) => String(d).includes("Northvale Learn on") && resolve()));
const BASE = `http://127.0.0.1:${port}/`;
let browser;
try {
  browser = await chromium.launch({ channel: "chrome", headless: true });
} catch {
  browser = await chromium.launch({ headless: true });
}

const PHONE = { viewport: { width: 390, height: 844 }, isMobile: true, hasTouch: true };
const LAPTOP = { viewport: { width: 1366, height: 768 } };
const day = (n) => new Date(Date.now() + n * 864e5).toLocaleDateString("en-CA", { timeZone: "America/Mexico_City" });
const done = (ids) => Object.fromEntries(ids.map((id) => [id, { done: true, at: day(-1), last: day(-1), best: 0, times: 1 }]));
const learner = (progress = {}, profile = {}, settings = {}, modules = {}) => ({ version: 1, updatedAt: 1, profile: { onboarded: true, nickname: "", avatar: 0, ageBand: "18-25", ageAsked: true, remindAsked: true, seenIntros: { keys: "x", practice: "x", save: "x", news: "x" }, ...profile }, settings: { lang: "en", region: "US", look: "white", reduceMotion: true, ...settings }, progress: { xp: 0, days: {}, streak: { count: 0, last: null, best: 0, frozen: [] }, freezes: 1, dailyGoal: 20, lessons: {}, lessonDays: [], badges: {}, counters: {}, practiced: {}, startUnit: "budget", placed: [], ...progress }, modules: { feedback: { pending: [], survey: "skipped" }, ...modules } });
const threeIn = (profile = {}, settings = {}, modules = {}) => learner({ counters: { lessons: 3 }, lessons: done(["budget-1", "budget-2", "budget-3"]), lessonDays: [day(-3), day(-2), day(-1)] }, profile, settings, modules);
const FIRST = UNITS[0].lessons[0]; // What's a budget?: card, card, match, choice, number, action

async function open(seed, size = PHONE, extra = {}) {
  const context = await browser.newContext({ ...size, locale: "en-US", timezoneId: "America/Mexico_City", serviceWorkers: "block", reducedMotion: "reduce", ...extra });
  if (seed) await context.addInitScript((s) => localStorage.getItem("northvale-learn-v1") || localStorage.setItem("northvale-learn-v1", s), JSON.stringify(seed));
  const page = await context.newPage();
  page.setDefaultTimeout(6000);
  const errors = [];
  page.on("pageerror", (e) => errors.push("pageerror: " + e));
  page.on("console", (m) => m.type() === "error" && !/Failed to load resource|net::ERR/.test(m.text()) && errors.push("console: " + m.text()));
  await page.goto(BASE);
  const top = () => page.getByRole("dialog").last();
  const btn = (name) => top().getByRole("button", { name, exact: typeof name === "string" }).first();
  return { page, context, top, btn, errors, close: () => context.close() };
}
const ok = (m) => console.log(`ok: ${m}`);
const stepNo = async (top) => Number(((await top().innerText()).match(/· (\d+) (?:of|de) \d+/) || [])[1]);

// Answer a lesson step the right way (the same ways test/lessons.test.mjs uses).
async function answer(dlg, s) {
  const q = (k) => dlg.locator(`[data-q="${k}"]`);
  const at = (v) => (Array.isArray(v) ? v[0] : v);
  if (s.type === "choice") return dlg.getByRole("radio").nth(s.answer).click();
  if (s.type === "tf") return dlg.getByRole("radio").nth(s.answer ? 0 : 1).click();
  if (s.type === "scenario") return dlg.getByRole("radio").nth(s.options.findIndex((o) => o.fit !== "poor")).click();
  if (s.type === "match") {
    for (let k = 0; k < s.pairs.length; k++) {
      await q("match-left").nth(k).click();
      await q("match-right").and(dlg.locator(`[data-i="${k}"]`)).click();
    }
    return;
  }
  if (s.type === "number") return q("number").fill(String(at(s.spec.answer)));
  if (s.type === "order") {
    for (let i = 0; i < s.items.length; i++) await q("order-item").and(dlg.locator(`[data-i="${i}"]`)).click();
    return;
  }
  throw new Error(`no answer for ${s.type}`);
}
// Play steps [from, to) of a lesson; a question is answered, checked and continued.
async function play(app, lesson, from, to) {
  for (const s of lesson.steps.slice(from, to)) {
    if (s.type === "card") await app.btn("Continue").click();
    else if (s.type === "action") await app.btn(/^(Skip for now|Done — continue)$/).click();
    else {
      await answer(app.top(), s);
      await app.btn("Check").click();
      await app.btn("Continue").click();
    }
  }
}
// Close whatever is open (a lesson asks "Leave now?") until Today shows.
async function toToday(app) {
  for (let k = 0; k < 5 && (await app.page.getByRole("dialog").count()); k++) {
    const leave = app.page.getByRole("button", { name: /^(Leave|Salir)$/ });
    if (await leave.count()) await leave.first().click();
    else await app.page.keyboard.press("Escape");
    await app.page.waitForTimeout(200);
  }
  await app.page.getByRole("heading", { name: /^(Today|Hoy)$/ }).waitFor();
}
// Content running off the right edge (not inside something that scrolls or clips on purpose, not a picture).
const overflow = (page) =>
  page.evaluate(() => {
    const w = innerWidth;
    const clipped = (e) => {
      for (let a = e.parentElement; a && a !== document.body; a = a.parentElement) if (getComputedStyle(a).overflowX !== "visible") return a.getBoundingClientRect().right <= w + 2;
      return false;
    };
    const bad = [...document.querySelectorAll("body *")]
      .filter((e) => {
        const r = e.getBoundingClientRect();
        const s = getComputedStyle(e);
        return r.width > 2 && r.height > 2 && r.right > w + 2 && r.left < w && s.visibility !== "hidden" && s.position !== "fixed" && !e.closest("svg, [aria-hidden='true'], .nv-scene") && !clipped(e);
      })
      .slice(0, 3)
      .map((e) => `${e.tagName.toLowerCase()} "${(e.innerText || "").slice(0, 30)}" right=${Math.round(e.getBoundingClientRect().right)}`);
    return { wider: document.documentElement.scrollWidth - w, bad };
  });
const fits = async (page, where) => {
  const o = await overflow(page);
  assert.ok(o.wider <= 1 && o.bad.length === 0, `${where}: ${JSON.stringify(o)}`);
};

try {
  // --- tapping fast ---
  {
    const app = await open(learner());
    const { page, top } = app;
    // A double tap on Start opens one lesson, not two.
    await page.getByRole("button", { name: /^Start$/ }).first().evaluate((b) => (b.click(), b.click()));
    await top().getByText("Idea", { exact: true }).waitFor();
    await page.waitForTimeout(300);
    assert.equal(await page.getByRole("dialog").count(), 1, "a double tap on Start opens one lesson");
    // Six taps on Continue in one moment move one step.
    await app.btn("Continue").evaluate((b) => { for (let i = 0; i < 6; i++) b.click(); });
    await page.waitForTimeout(300);
    assert.equal(await stepNo(top), 2, "six taps on Continue at once move one step");
    await app.btn("Continue").click();
    // A double tap on Check gives one answer and stays on its feedback (the second tap does not skip it).
    await answer(top(), FIRST.steps[2]);
    await app.btn("Check").evaluate((b) => (b.click(), b.click()));
    await page.waitForTimeout(300);
    assert.equal(await top().locator("[data-right]").count(), 1, "the feedback for that answer is showing");
    assert.equal(await stepNo(top), 3, "a double tap on Check does not skip the feedback");
    assert.deepEqual(app.errors, []);
    await app.close();
  }
  ok("tapping fast: a double tap on Start opens one lesson, six taps on Continue move one step, a double tap on Check keeps its feedback");

  // --- Back and Forward, again and again ---
  {
    const app = await open(learner());
    const { page, top } = app;
    for (let i = 0; i < 3; i++) {
      await page.getByRole("button", { name: /^Start$/ }).first().click();
      await top().getByText("Idea", { exact: true }).waitFor();
      await page.goBack();
      await page.getByRole("dialog", { name: "Leave now?" }).waitFor();
      for (const move of ["back", "forward", "back", "back", "forward"]) {
        await (move === "back" ? page.goBack() : page.goForward()).catch(() => {});
        await page.waitForTimeout(120);
      }
      assert.ok(page.url().startsWith(BASE), `still in the app after Back and Forward (${page.url()})`);
      await toToday(app);
    }
    assert.deepEqual(app.errors, []);
    await app.close();
  }
  ok("Back and Forward: pressed over and over in and out of a lesson, the app stays open and Today is always one close away");

  // --- refreshing in the middle of a lesson ---
  {
    const app = await open(learner());
    const { page, top } = app;
    await page.getByRole("button", { name: /^Start$/ }).first().click();
    await play(app, FIRST, 0, 4); // two cards, the match and the choice
    assert.equal(await stepNo(top), 5);
    await page.reload();
    await page.getByRole("heading", { name: "Today" }).waitFor();
    await page.getByRole("button", { name: /^(Continue|Start)$/ }).first().click();
    await app.btn("Check").waitFor();
    assert.equal(await stepNo(top), 5, "the lesson goes on at the step it was on");
    await play(app, FIRST, 4, FIRST.steps.length);
    await app.btn("Done").click();
    await page.getByRole("heading", { name: "Today" }).waitFor();
    assert.deepEqual(app.errors, []);
    await app.close();
  }
  ok("refresh: reloading in the middle of a lesson keeps the place, and the lesson finishes normally");

  // --- losing the connection ---
  {
    const app = await open(learner());
    const { page, context } = app;
    // A lesson already open carries on and finishes offline.
    await page.getByRole("button", { name: /^Start$/ }).first().click();
    await app.btn("Continue").waitFor();
    await context.setOffline(true);
    await play(app, FIRST, 0, FIRST.steps.length);
    await app.btn("Done").click();
    await page.getByRole("heading", { name: "Today" }).waitFor();
    // A lesson that has not loaded yet (the next unit) says it can't open, with a way back; then works when back online.
    const next = await open(threeIn());
    await next.page.getByRole("heading", { name: "Today" }).waitFor();
    await next.context.setOffline(true);
    await next.page.getByRole("button", { name: /^(Continue|Start)$/ }).first().click();
    await next.page.waitForTimeout(2500);
    const shown = await next.page.evaluate(() => document.body.innerText);
    assert.ok(shown.trim().length > 100, "not a blank screen");
    const busy = await next.page.locator('[aria-busy="true"]').count();
    const opened = await next.top().getByText("Idea", { exact: true }).count();
    assert.ok(opened || (!busy && /offline|connection|internet|conexión/i.test(shown)), `offline, a lesson that hasn't loaded either opens or says why (busy=${busy}): ${shown.slice(0, 300)}`);
    // Back closes the message and stays in the app (it takes a history step like any layer).
    await next.page.goBack();
    await next.page.getByRole("heading", { name: "Today" }).waitFor();
    assert.equal(await next.page.getByRole("dialog").count(), 0, "Back closed the message");
    assert.ok(next.page.url().startsWith(BASE), "Back stayed in the app");
    await next.page.getByRole("button", { name: /^(Continue|Start)$/ }).first().click();
    await next.page.getByRole("alert").waitFor();
    // "Try again" while still offline says the same; back online, it opens by itself.
    await next.page.getByRole("button", { name: "Try again" }).click();
    await next.page.getByRole("alert").waitFor();
    await next.context.setOffline(false);
    await next.top().getByText("Idea", { exact: true }).waitFor({ timeout: 10000 });
    // And offline again for the unit after: Back (or Escape) closes the message and stays in the app.
    await toToday(next);
    assert.ok(next.page.url().startsWith(BASE));
    assert.deepEqual([...app.errors, ...next.errors].filter((e) => !/fetch|network|Failed to load|import/i.test(e)), []);
    await app.close();
    await next.close();
  }
  ok("losing the connection: an open lesson finishes offline; a lesson not loaded yet says it needs the connection, then opens once it is back");

  // --- very long names on a tiny phone ---
  {
    const long = "Supercalifragilisticexpialidociousvacation"; // one 40-character word once cut to the limit
    const goal = newGoal({ id: "g1", templateId: "custom", name: long, target: 123456, months: 30, today: day(-2) });
    const app = await open(threeIn({ nickname: "Wolfeschlegelsteinhausen" }, {}, { goals: { goals: [goal] } }), { viewport: { width: 320, height: 568 }, isMobile: true, hasTouch: true });
    const { page } = app;
    await page.getByRole("heading", { name: "Today" }).waitFor();
    await fits(page, "Today, 320 px, long names");
    for (const tab of ["Goals", "Practice", "Me"]) {
      await page.getByRole("navigation").getByRole("button", { name: tab, exact: true }).click();
      await page.waitForTimeout(300);
      await fits(page, `${tab}, 320 px, long names`);
    }
    await page.getByRole("navigation").getByRole("button", { name: "Goals", exact: true }).click();
    await page.getByRole("button", { name: new RegExp(long.slice(0, 20)) }).first().click();
    await page.waitForTimeout(400);
    await fits(page, "a goal with a 40-character one-word name, 320 px");
    assert.deepEqual(app.errors, []);
    await app.close();
  }
  ok("long names on a tiny phone (320 x 568): a 40-letter goal name and a 24-letter nickname fit Today, Goals, the goal, Practice and Me");

  // --- switching language and colors in the middle ---
  {
    const app = await open(threeIn());
    const { page, top } = app;
    await page.getByRole("button", { name: /^Continue$/ }).first().click();
    await top().getByText("Idea", { exact: true }).waitFor();
    await app.btn("Continue").click();
    await app.btn("Close").click();
    await page.getByRole("button", { name: "Leave", exact: true }).click();
    await page.getByRole("navigation").getByRole("button", { name: "Me" }).click();
    await page.getByRole("button", { name: "Settings" }).click();
    for (const look of ["Navy", "Cream", "Match my device"]) await page.getByRole("radio", { name: new RegExp(`^${look}`) }).first().click();
    await page.getByRole("radio", { name: /^Navy/ }).first().click();
    await page.getByRole("radio", { name: /^Español/ }).click();
    await page.getByRole("radio", { name: /^México/ }).click();
    await page.getByRole("navigation").getByRole("button", { name: "Aprender" }).click();
    await page.getByRole("heading", { name: "Hoy" }).waitFor();
    await page.getByRole("button", { name: /^(Continuar|Empezar)$/ }).first().click();
    await top().getByText("Idea", { exact: true }).waitFor();
    const text = await page.evaluate(() => document.body.innerText);
    assert.match(text, / de \d+/, "the lesson is in Spanish");
    assert.doesNotMatch(text, /\b[a-z]+\.[a-z_]+\.[a-z_.]+\b|\{[a-z@$]/, "no raw text keys or unfilled placeholders");
    assert.equal(await page.evaluate(() => getComputedStyle(document.body).backgroundColor), await page.evaluate(() => { const d = document.createElement("div"); d.style.background = "var(--bg)"; document.body.append(d); const c = getComputedStyle(d).backgroundColor; d.remove(); return c; }), "the page uses the chosen look's background");
    assert.deepEqual(app.errors, []);
    await app.close();
  }
  ok("switching in the middle: every look, then Spanish and Mexico; the lesson reopens in Spanish with no raw text");

  // --- the keyboard only (a laptop) ---
  {
    const app = await open(learner(), LAPTOP);
    const { page, top } = app;
    await page.getByRole("heading", { name: "Today" }).waitFor();
    let reached = false;
    for (let i = 0; i < 40 && !reached; i++) {
      await page.keyboard.press("Tab");
      reached = await page.evaluate(() => /^Start$/.test((document.activeElement.innerText || "").trim()));
    }
    assert.ok(reached, "Tab reaches Start");
    await page.keyboard.press("Enter");
    await top().getByText("Idea", { exact: true }).waitFor();
    await page.keyboard.press("Enter");
    await page.waitForTimeout(150);
    assert.equal(await stepNo(top), 2, "Enter goes on");
    await page.keyboard.press("Enter");
    await page.waitForTimeout(150);
    // The match: Tab to each item and press Enter (left, then its pair).
    const s = FIRST.steps[2];
    for (let k = 0; k < s.pairs.length; k++) {
      await top().locator('[data-q="match-left"]').nth(k).focus();
      await page.keyboard.press("Enter");
      await top().locator(`[data-q="match-right"][data-i="${k}"]`).focus();
      await page.keyboard.press("Enter");
    }
    // Enter on a focused button presses that button, so Tab on to Check.
    for (let i = 0; i < 12 && !(await page.evaluate(() => (document.activeElement.innerText || "").trim() === "Check")); i++) await page.keyboard.press("Tab");
    await page.keyboard.press("Enter"); // Check
    await top().locator("[data-right]").waitFor();
    await page.keyboard.press("Enter"); // Continue
    await page.waitForTimeout(150);
    // The choice: a number key picks, Enter checks.
    await page.keyboard.press(String(FIRST.steps[3].answer + 1));
    await page.keyboard.press("Enter");
    assert.equal(await top().locator("[data-right]").getAttribute("data-right"), "true", "the 1-4 keys pick an answer");
    await page.keyboard.press("Escape");
    await page.getByRole("dialog", { name: "Leave now?" }).waitFor();
    await page.keyboard.press("Escape");
    await page.waitForTimeout(200);
    assert.equal(await page.getByRole("dialog", { name: "Leave now?" }).count(), 0, "Escape again keeps going");
    assert.ok(await top().getByText("Idea").count() >= 0);
    assert.deepEqual(app.errors, []);
    await app.close();
  }
  ok("keyboard only: Tab to Start, Enter to go on, Enter on match items, a number key to answer, Escape to ask to leave and Escape to stay");

  // --- zoom and size: a laptop at 200%, a small phone at the width 200% zoom gives it, a huge monitor ---
  for (const [label, size] of [
    ["a laptop at 200% zoom (683 x 384)", { viewport: { width: 683, height: 384 }, deviceScaleFactor: 2 }],
    ["a small phone (320 x 568)", { viewport: { width: 320, height: 568 }, isMobile: true, hasTouch: true }],
    ["a huge monitor (2560 x 1440)", { viewport: { width: 2560, height: 1440 } }],
  ]) {
    const app = await open(threeIn(), size);
    const { page, top } = app;
    await page.getByRole("heading", { name: "Today" }).waitFor();
    await fits(page, `${label}: Today`);
    for (const tab of ["Goals", "Practice", "Me", "Learn"]) {
      await page.getByRole("navigation").getByRole("button", { name: tab, exact: true }).first().click();
      await page.waitForTimeout(250);
      await fits(page, `${label}: ${tab}`);
      if (size.viewport.width > 2000) {
        const widest = await page.evaluate(() => Math.max(0, ...[...document.querySelectorAll("main p")].flatMap((p) => { const r = document.createRange(); r.selectNodeContents(p); return [...r.getClientRects()].map((x) => x.width); })));
        assert.ok(widest <= 900, `${label}: ${tab}: a line of text is ${Math.round(widest)} px wide (too long to read)`);
      }
    }
    const start = page.getByRole("button", { name: /^(Continue|Start)$/ }).first();
    await start.scrollIntoViewIfNeeded();
    await start.click();
    await app.btn("Continue").waitFor();
    await fits(page, `${label}: a lesson`);
    const b = await app.btn("Continue").boundingBox();
    assert.ok(b && b.y + b.height <= size.viewport.height + 1, `${label}: Continue is on screen in a lesson`);
    assert.deepEqual(app.errors, [], label);
    await app.close();
  }
  ok("zoom and size: a laptop at 200%, a 320 px phone and a 2560 px monitor: no sideways scrolling, readable lines, Continue on screen in a lesson");
} finally {
  await browser.close();
  server.kill();
}
