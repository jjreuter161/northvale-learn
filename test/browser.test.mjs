// THE APP IN A REAL BROWSER — headless Chrome clicks through the main
// flows on a throwaway server: onboarding, a full lesson, a Money Mission,
// a new goal, every calculator, a review, a practice buy, every lesson's
// "do it" tool, and every screen in English (US) and Spanish (Mexico).
// Every screen it passes must show no raw text keys ("compare.go"), no
// unfilled {placeholders}, no NaN or "undefined", and log no console
// errors. npm test builds the app first, so this tests the current code.
//
// Uses the installed Google Chrome; without it, Playwright's own Chromium
// (npx playwright-core install chromium).
import { spawn } from "node:child_process";
import { mkdtempSync, readdirSync, readFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import assert from "node:assert/strict";
import { chromium } from "playwright-core";
import { ALL_LESSONS } from "../src/modules/lessons/content.js";

const ROOT = join(import.meta.dirname, "..");

// Text keys look like "prefix.rest"; collect every prefix the app defines.
const prefixes = new Set();
for (const f of readdirSync(join(ROOT, "src"), { recursive: true }).filter((f) => /\.jsx?$/.test(f)))
  for (const m of readFileSync(join(ROOT, "src", f), "utf8").matchAll(/"([a-z_]+)\.[a-z0-9_.]+":\s*S\(/g)) prefixes.add(m[1]);
const RAW = new RegExp(`(?<![\\w@/.-])(?:${[...prefixes].join("|")})\\.[a-z0-9_]+(?:\\.[a-z0-9_]+)*(?![\\w-])`, "g");
const BROKEN = /\{[@$]?[A-Za-z_][^{}]*\}|\bNaN\b|\bundefined\b|\[object Object\]/g;

// The server, on throwaway data, with every outside service off.
const port = 20000 + Math.floor(Math.random() * 20000);
const env = { ...process.env, PORT: String(port), NORTHVALE_DATA: mkdtempSync(join(tmpdir(), "nvlearn-browser-")), ANTHROPIC_API_KEY: "", ANTHROPIC_AUTH_TOKEN: "", TWELVEDATA_API_KEY: "", SMTP_USER: "", SMTP_PASS: "", ALERT_WEBHOOK_URL: "", NEWS_FEEDS: JSON.stringify({ US: [], MX: [] }), SIGNUP_CODE: "", ADMIN_TOKEN: "browser-test-admin-token-1234" };
const server = spawn(process.execPath, [join(ROOT, "server/index.js")], { env, stdio: ["ignore", "pipe", "inherit"] });
await new Promise((resolve) => server.stdout.on("data", (d) => String(d).includes("Northvale Learn on") && resolve()));
const BASE = `http://127.0.0.1:${port}/`;

let browser;
try {
  browser = await chromium.launch({ channel: "chrome", headless: true });
} catch {
  try {
    browser = await chromium.launch({ headless: true });
  } catch {
    server.kill();
    throw new Error("No browser for the click-through tests. Install Google Chrome, or run: npx playwright-core install chromium");
  }
}

let current = null; // on a failure, what the page showed
async function open(seed) {
  const context = await browser.newContext({ viewport: { width: 390, height: 800 }, locale: "en-US", timezoneId: "America/Mexico_City", serviceWorkers: "block", reducedMotion: "reduce" });
  if (seed) await context.addInitScript((s) => localStorage.getItem("northvale-learn-v1") || localStorage.setItem("northvale-learn-v1", s), JSON.stringify(seed));
  const page = await context.newPage();
  current = page;
  page.setDefaultTimeout(5000);
  const errors = [];
  page.on("console", (m) => m.type() === "error" && errors.push(m.text()));
  page.on("pageerror", (e) => errors.push(String(e)));
  await page.goto(BASE);
  const top = () => page.getByRole("dialog").last();
  const button = (name, scope = page) => scope.getByRole("button", { name, exact: typeof name === "string" }).first();
  // Everything visible right now must read cleanly.
  const clean = async (where) => {
    const text = await page.evaluate(() => document.body.innerText);
    assert.deepEqual(text.match(RAW) || [], [], `${where}: raw text keys`);
    assert.deepEqual(text.match(BROKEN) || [], [], `${where}: broken text`);
    assert.deepEqual(errors, [], `${where}: console errors`);
  };
  const menu = async (name) => {
    await button(/^(Menu|Menú)$/).click();
    await button(name, page.getByRole("navigation")).click();
  };
  // The tutor opens as a sheet over the current screen.
  const shut = async () => (await page.getByRole("dialog").count()) && page.keyboard.press("Escape");
  return { page, top, button, clean, menu, shut, close: () => context.close() };
}

// Plays the open lesson, review or challenge: first option for each
// question (a miss comes back once at the end), skips the "do it" step.
// `untilAction` stops at the "do it" step instead.
async function play({ top, button }, { untilAction = false } = {}) {
  for (let i = 0; i < 80; i++) {
    const d = top();
    const names = await d.getByRole("button").evaluateAll((bs) => bs.map((b) => b.getAttribute("aria-label") || b.innerText.trim()));
    if (process.env.DEBUG) console.log(i, JSON.stringify(names));
    if (names.includes("Skip for now") || names.includes("Saltar por ahora")) {
      if (untilAction) return;
      await button(/^(Skip for now|Saltar por ahora)$/, d).click();
    } else if (names.includes("Check") || names.includes("Comprobar")) {
      await d.getByRole("radio").first().click();
      await button(/^(Check|Comprobar)$/, d).click();
    } else if (names.includes("Continue") || names.includes("Continuar")) await button(/^(Continue|Continuar)$/, d).click();
    else return;
  }
  throw new Error("the session never ended");
}

const CALCULATORS = ["Budget planner", "Debt payoff", "Starting early", "Investing range", "Retirement", "Paycheck", "Side hustle"];
const SCREENS = ["Home", "Learn", "Missions", "Portfolio", "News", "Tutor", "Me", "Settings"];

try {
  // --- a new learner ---
  {
    const app = await open();
    const { page, top, button, clean, menu, shut } = app;
    await clean("welcome");
    await button("Get started").click();
    await button(/^Save for something/).click();
    await button(/^Car/).click();
    await clean("first goal");
    await button("Continue").click();
    await button(/^I'm new to this/).click();
    await button(/^10 minutes a day/).click();
    await page.getByRole("dialog", { name: "What's a budget?" }).waitFor();
    console.log("ok: onboarding (reason, first goal, placement, daily time) opens the first lesson");

    await play(app);
    await top().getByText("Lesson complete").waitFor();
    await top().getByText(/\+1[05] XP/).waitFor();
    await clean("lesson complete");
    await button("Done", top()).click();
    await page.getByText("YOUR GOAL", { exact: false }).first().waitFor();
    await clean("home");
    console.log("ok: a full lesson, start to finish, then Home");

    await page.getByText("How old are you?").waitFor();
    await button("18–25").click();
    await page.getByText("How old are you?").waitFor({ state: "detached" });
    await page.waitForFunction(() => JSON.parse(localStorage.getItem("northvale-learn-v1")).profile.ageBand === "18-25");
    console.log("ok: asked once for an age range (after the first lesson)");

    await button("Start mission").click();
    await button("Mark done").click();
    await top().getByRole("textbox").fill("Gas and insurance cost more than I thought.");
    await button("Finish mission", top()).click();
    await top().getByText("+20 XP").waitFor();
    await clean("mission done");
    await page.keyboard.press("Escape");
    console.log("ok: a Money Mission, marked done with a note (+20 XP)");

    await button("New goal").click();
    await button(/^Travel/, top()).click();
    await button("Create goal", top()).click();
    await page.getByText("Set aside $124 a month in a savings account to reach $1,500").waitFor();
    await clean("new goal");
    await menu("Home");
    console.log("ok: a second goal, and its plan");

    for (const name of CALCULATORS) {
      await button(name).click();
      await top().getByText(name).first().waitFor();
      await clean(`calculator: ${name}`);
      await page.keyboard.press("Escape");
    }
    console.log(`ok: all ${CALCULATORS.length} calculators open with real text`);

    await menu("Learn");
    await button(/^(Review|Practice anyway)$/).click();
    await play(app);
    await top().getByText("Review complete").waitFor();
    await clean("review complete");
    await button("Done", top()).click();
    console.log("ok: a review");

    for (const name of SCREENS) {
      await menu(name);
      await page.waitForTimeout(150);
      await clean(`screen: ${name}`);
      await shut();
    }
    console.log(`ok: all ${SCREENS.length} main screens, no raw text or console errors (English, US)`);

    // Spanish, Mexico: the same screens and calculators.
    await page.getByRole("radio", { name: "Español" }).click();
    await page.getByRole("radio", { name: /México/ }).click();
    for (const name of ["Inicio", "Aprender", "Misiones", "Portafolio", "Noticias", "Tutor", "Yo", "Ajustes"]) {
      await menu(name);
      await page.waitForTimeout(150);
      await clean(`pantalla: ${name}`);
      await shut();
    }
    await menu("Inicio");
    const calcs = await page.getByRole("button").evaluateAll((bs) => bs.map((b) => b.innerText.trim()));
    for (const name of ["Planeador de presupuesto", "Pagar una deuda", "Empezar temprano", "Rango de inversión", "Retiro", "Sueldo neto", "Ingreso extra"]) {
      assert.ok(calcs.includes(name), `calculadora: ${name}`);
      await button(name).click();
      await clean(`calculadora: ${name}`);
      await page.keyboard.press("Escape");
    }
    console.log("ok: the same in Spanish (Mexico): every screen and calculator");
    await app.close();
  }

  // --- back after 5 days away, with a 4-day streak that ended ---
  {
    const day = (n) => new Date(Date.now() + n * 864e5).toLocaleDateString("en-CA", { timeZone: "America/Mexico_City" });
    const lessonDays = [day(-8), day(-7), day(-6), day(-5)];
    const lessons = Object.fromEntries(ALL_LESSONS.slice(0, 4).map((l, i) => [l.id, { done: true, at: lessonDays[i], last: lessonDays[i], best: 0, times: 1 }]));
    const seed = { version: 1, updatedAt: 1, profile: { onboarded: true, nickname: "Dani", ageBand: "18-25", avatar: 0 }, settings: { lang: "en", region: "US", look: "white", reduceMotion: true }, progress: { xp: 60, days: Object.fromEntries(lessonDays.map((d) => [d, 15])), streak: { count: 4, last: day(-5), best: 4, frozen: [] }, freezes: 0, dailyGoal: 20, lessons, lessonDays, badges: {}, counters: { lessons: 4 }, practiced: {}, startUnit: "budget", placed: [], seen: day(-5) }, modules: {} };
    const app = await open(seed);
    const { page, top, button, clean, menu } = app;
    await page.getByRole("dialog", { name: "Welcome back, Dani" }).waitFor();
    await top().getByText("It's been 5 days.").waitFor();
    await clean("welcome back");
    await button("Repair my streak", top()).click();
    await top().getByText("Your 4-day streak is back.").waitFor();
    await button(/^Ease back in: /, top()).click();
    await page.getByRole("dialog", { name: ALL_LESSONS[4].title.en }).waitFor();
    await play(app);
    await top().getByText("5-day streak").waitFor();
    await clean("lesson after a break");
    console.log("ok: back after 5 days: a welcome-back screen, the free streak repair, one lesson to restart (streak 4 → 5)");

    // Reminders, in Settings: times outside quiet hours by default.
    await button("Done", top()).click();
    await menu("Settings");
    await page.getByText("Turn on reminders").waitFor();
    const times = await page.getByRole("combobox", { name: "Time" }).evaluate((s) => [...s.options].map((o) => o.value));
    assert.equal(times[0], "08:00");
    assert.equal(times.at(-1), "20:30");
    await clean("settings: reminders");
    // Opened from a reminder, and a bad "turn off the recap" link.
    await page.goto(`${BASE}?from=push&kind=mission`);
    await page.getByRole("heading", { name: "Money Missions" }).waitFor();
    assert.equal(new URL(page.url()).search, "", "the address is tidied");
    await page.goto(`${BASE}?recap_off=nope.nope`);
    await page.getByText("That link isn't valid anymore.").waitFor();
    console.log("ok: reminder settings (quiet hours by default); a reminder opens where it points; the recap's turn-off link");
    await app.close();
  }

  // --- the admin page ---
  {
    const app = await open();
    const { page, clean } = app;
    await page.goto(`${BASE}admin`);
    await page.getByPlaceholder("Admin token").fill(env.ADMIN_TOKEN);
    await page.keyboard.press("Enter");
    await page.getByText("What brings people back").waitFor();
    await page.getByText("Day-30 return").waitFor();
    await page.getByRole("button", { name: "Send a test reminder to every device" }).click();
    await page.getByText("0 of 0 delivered.").waitFor();
    await clean("admin");
    console.log("ok: the admin page, with what brings people back");
    await app.close();
  }

  // --- a learner who has finished every lesson ---
  {
    const day = new Date().toLocaleDateString("en-CA", { timeZone: "America/Mexico_City" });
    const lessons = Object.fromEntries(ALL_LESSONS.map((l) => [l.id, { done: true, at: day, last: day, best: 0, times: 1 }]));
    const seed = { version: 1, updatedAt: 1, profile: { onboarded: true, nickname: "", ageBand: "18-25", avatar: 0 }, settings: { lang: "en", region: "US", look: "white", reduceMotion: true }, progress: { xp: 600, days: {}, streak: { count: 0, last: null, best: 0, frozen: [] }, freezes: 1, dailyGoal: 20, lessons, lessonDays: [], badges: {}, counters: {}, practiced: {}, startUnit: "budget", placed: [] }, modules: {} };
    const app = await open(seed);
    const { page, top, button, clean, menu, shut } = app;

    await menu("Portfolio");
    await button(/^VOO/).click();
    await button("10%", top()).click();
    await button("Buy", top()).click();
    await page.getByText(/You own|Bought|Compraste/).first().waitFor();
    await clean("after a buy");
    await page.keyboard.press("Escape");
    console.log("ok: a practice buy");

    // The first lesson that uses each "do it" tool.
    const firsts = new Map();
    for (const l of ALL_LESSONS) for (const s of l.steps) if (s.type === "action" && !firsts.has(s.kind)) firsts.set(s.kind, l);
    await menu("Learn");
    for (const [kind, lesson] of firsts) {
      await page.getByRole("button", { name: new RegExp(`^${lesson.title.en.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")} — `) }).click();
      await play(app, { untilAction: true });
      await clean(`tool ${kind} (${lesson.id})`);
      await button("Close", top()).click();
      await button("Leave", top()).click();
    }
    console.log(`ok: all ${firsts.size} lesson tools open with real text`);
    await app.close();
  }
} catch (e) {
  if (current) console.error(`The page showed:\n${(await current.evaluate(() => document.body.innerText).catch(() => "")).slice(-1500)}`);
  throw e;
} finally {
  await browser.close();
  server.kill();
}
