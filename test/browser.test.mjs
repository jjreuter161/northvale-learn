// THE APP IN A REAL BROWSER — headless Chrome clicks through the main
// flows on a throwaway server: onboarding, a full lesson, a real-life mission,
// a new goal, every calculator, a review, a practice buy, every lesson's
// "do it" tool, and every screen in English (US) and Spanish (Mexico);
// classroom mode (a teacher, a student who joins after seeing what the
// teacher will see, then leaves — and a teacher view without any private
// data); share cards that hide private details; an invite link's reward.
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
import { ALL_LESSONS, UNITS } from "../src/modules/lessons/content.js";
import { UNITS as FULL_UNITS } from "../src/modules/lessons/units/all.js";
import { MISSIONS } from "../src/modules/missions/catalog.js";
import { newGoal } from "../src/modules/goals/plan.js";
import { weekStart, dayKey } from "../src/core/progress.js";
import { daniState } from "../scripts/seed-demo.mjs";

const ROOT = join(import.meta.dirname, "..");

// Text keys look like "prefix.rest"; collect every prefix the app defines.
const prefixes = new Set();
for (const f of readdirSync(join(ROOT, "src"), { recursive: true }).filter((f) => /\.jsx?$/.test(f)))
  for (const m of readFileSync(join(ROOT, "src", f), "utf8").matchAll(/"([a-z_]+)\.[a-z0-9_.]+":\s*S\(/g)) prefixes.add(m[1]);
const RAW = new RegExp(`(?<![\\w@/.-])(?:${[...prefixes].join("|")})\\.[a-z0-9_]+(?:\\.[a-z0-9_]+)*(?![\\w-])`, "g");
const BROKEN = /\{[@$]?[A-Za-z_][^{}]*\}|\bNaN\b|\bundefined\b|\[object Object\]/g;

// The server, on throwaway data, with every outside service off.
const port = 20000 + Math.floor(Math.random() * 20000);
const env = { ...process.env, NORTHVALE_DOTENV: "0", PORT: String(port), NORTHVALE_DATA: mkdtempSync(join(tmpdir(), "nvlearn-browser-")), ANTHROPIC_API_KEY: "", ANTHROPIC_AUTH_TOKEN: "", TWELVEDATA_API_KEY: "", SMTP_USER: "", SMTP_PASS: "", ALERT_WEBHOOK_URL: "", NEWS_FEEDS: JSON.stringify({ US: [], MX: [] }), SIGNUP_CODE: "", ADMIN_TOKEN: "browser-test-admin-token-1234" };
const server = spawn(process.execPath, [join(ROOT, "server/index.js")], { env, stdio: ["ignore", "pipe", "inherit"] });
let serverOut = ""; // emailed links are printed here (no email service)
await new Promise((resolve) => server.stdout.on("data", (d) => ((serverOut += d), String(d).includes("Northvale Learn on") && resolve())));
const BASE = `http://127.0.0.1:${port}/`;
const post = (path, body, extra = {}) => fetch(`${BASE.slice(0, -1)}${path}`, { method: "POST", headers: { "X-Northvale": "1", "Content-Type": "application/json", ...extra }, body: JSON.stringify(body) }).then((r) => r.json());
const admin = (path, body) => post(path, body, { "X-Admin-Token": env.ADMIN_TOKEN });
// A new account (from outside the browser); returns its session cookie.
const account = (body) => fetch(`${BASE}api/auth/signup`, { method: "POST", headers: { "X-Northvale": "1", "Content-Type": "application/json" }, body: JSON.stringify({ password: "a long enough password", guardian: true, ...body }) }).then((r) => r.headers.get("set-cookie").split(";")[0]);
const day = (n) => new Date(Date.now() + n * 864e5).toLocaleDateString("en-CA", { timeZone: "America/Mexico_City" });
// A learner who's been through onboarding.
const learner = (profile, progress = {}, modules = {}) => ({ version: 1, updatedAt: 1, profile: { onboarded: true, nickname: "", avatar: 0, ...profile }, settings: { lang: "en", region: "US", look: "white", reduceMotion: true }, progress: { xp: 0, days: {}, streak: { count: 0, last: null, best: 0, frozen: [] }, freezes: 1, dailyGoal: 20, lessons: {}, lessonDays: [], badges: {}, counters: {}, practiced: {}, startUnit: "budget", placed: [], ...progress }, modules: { feedback: { pending: [], survey: "skipped" }, ...modules } });

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
// `cookie`: signed in to that account.
async function open(seed, { cookie, motion } = {}) {
  const context = await browser.newContext({ viewport: { width: 390, height: 800 }, locale: "en-US", timezoneId: "America/Mexico_City", serviceWorkers: "block", reducedMotion: motion ? "no-preference" : "reduce" });
  if (cookie) await context.addCookies([{ name: "nvl_session", value: cookie.split("=")[1], url: BASE }]);
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
  // Goes to a place in the app through the tab bar (and a row on that
  // tab's page, for the places inside one).
  const menu = async (name, opts = {}) => {
    if (name === "Tutor") return (await button(/^(Ask|Preguntar)$/).click(), true);
    const [tab, row] = PLACES[name];
    await button(tab, page.getByRole("navigation")).click();
    // The one-time Practice introduction, the first time it opens.
    await page.waitForTimeout(60);
    if (await page.getByRole("dialog", { name: /^(New: Practice|Nuevo: Práctica)$/ }).count()) await page.keyboard.press("Escape");
    if (!row) return true;
    const go = page.getByRole("button", { name: new RegExp(`^${esc(row)}`) }).first();
    if (opts.ifOpen && !(await go.count())) return false; // (still locked)
    await go.click();
    return true;
  };
  // The tutor opens as a sheet over the current screen.
  const shut = async () => (await page.getByRole("dialog").count()) && page.keyboard.press("Escape");
  return { page, top, button, clean, menu, shut, close: () => context.close() };
}

// Gives some answer to whatever question is showing (not necessarily the
// right one): every kind of question has its own controls.
async function answerAny(d) {
  const q = (k) => d.locator(`[data-q="${k}"]`);
  if (await q("order-item").count()) for (const b of await q("order-item").all()) await b.click();
  else if (await q("match-left").count()) for (let i = 0; i < (await q("match-left").count()); i++) (await q("match-left").nth(i).click(), await q("match-right").nth(i).click());
  else if (await q("number").count()) await q("number").fill("1");
  else if (await q("spot-part").count()) for (const b of await q("spot-part").all()) await b.click();
  else if (await q("estimate").count()) return; // (a guess is already set)
  else await d.getByRole("radio").first().click();
}
// Sets a slider the way a person dragging it would (React hears "input").
const slide = (el, v) => el.evaluate((e, v) => (Object.getOwnPropertyDescriptor(HTMLInputElement.prototype, "value").set.call(e, String(v)), e.dispatchEvent(new Event("input", { bubbles: true }))), v);

// Plays the open lesson, review or challenge: first option for each
// question (a miss comes back once at the end), skips the "do it" step.
// `untilAction` stops at the "do it" step instead.
async function play({ page, top, button }, { untilAction = false, untilMoment = false } = {}) {
  // A unit still loading shows the boat for a moment first.
  await page.locator('[aria-busy="true"]').waitFor({ state: "detached", timeout: 10000 });
  for (let i = 0; i < 80; i++) {
    const d = top();
    if (untilMoment && (await d.locator("[data-moment]").count())) return;
    const names = await d.getByRole("button").evaluateAll((bs) => bs.map((b) => b.getAttribute("aria-label") || b.innerText.trim()));
    if (process.env.DEBUG) console.log(i, JSON.stringify(names));
    if (names.includes("Skip for now") || names.includes("Saltar por ahora")) {
      if (untilAction) return;
      await button(/^(Skip for now|Saltar por ahora)$/, d).click();
    } else if (names.includes("Check") || names.includes("Comprobar")) {
      await answerAny(d);
      await button(/^(Check|Comprobar)$/, d).click();
    } else if (names.includes("Continue") || names.includes("Continuar")) await button(/^(Continue|Continuar)$/, d).click();
    else return;
  }
  throw new Error("the session never ended");
}

const esc = (x) => x.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
// Where each place is: a tab, and a row on its page.
const PLACES = {
  Learn: ["Learn"], Aprender: ["Aprender"], Goals: ["Goals"], Metas: ["Metas"], Practice: ["Practice"], Práctica: ["Práctica"], Me: ["Me"], Yo: ["Yo"],
  Missions: ["Practice", "Real-life missions"], Misiones: ["Práctica", "Misiones de la vida real"],
  Portfolio: ["Practice", "Practice portfolio"], Portafolio: ["Práctica", "Portafolio de práctica"],
  News: ["Practice", "News, explained"], Noticias: ["Práctica", "Noticias explicadas"],
  Tools: ["Practice", "Tools from your lessons"], Herramientas: ["Práctica", "Herramientas de tus lecciones"],
  Achievements: ["Me", "Achievements"], Logros: ["Yo", "Logros"], Skills: ["Me", "Skills"], Habilidades: ["Yo", "Habilidades"],
  Invite: ["Me", "Invite a friend"], Settings: ["Me", "Settings"], Ajustes: ["Yo", "Ajustes"], Classes: ["Me", "Classes"], Clases: ["Yo", "Clases"],
};
const CALCULATORS = ["Budget planner", "Debt payoff", "Starting early", "Investing range", "Retirement", "Paycheck", "Side hustle"];
const SCREENS = ["Learn", "Goals", "Practice", "Missions", "Portfolio", "News", "Tools", "Tutor", "Me", "Achievements", "Skills", "Settings"];
const PANTALLAS = ["Aprender", "Metas", "Práctica", "Misiones", "Portafolio", "Noticias", "Herramientas", "Tutor", "Yo", "Logros", "Habilidades", "Ajustes"];
// The top bar never repeats the page's own title.
const noRepeatedTitle = async (page, where) => {
  const [bar, h1] = await page.evaluate(() => [document.querySelector("header").innerText, (document.querySelector("main h1") || {}).innerText || ""]);
  assert.ok(!h1 || !bar.includes(h1.trim()), `${where}: the top bar repeats the title "${h1}"`);
};
const lessonDays3 = () => [1, 2, 3].map((n) => new Date(Date.now() - n * 864e5).toLocaleDateString("en-CA", { timeZone: "America/Mexico_City" }));
// The welcome screen, "what for" and "how to start" (from the beginning).
const onboard = async ({ button }) => (await button("Get started").click(), await button(/^Car/).click(), await button(/^From the beginning/).click());

try {
  // --- a new learner ---
  {
    const app = await open();
    const { page, top, button, clean, menu, shut } = app;
    await clean("welcome");
    await page.getByText("Find your open water", { exact: true }).waitFor();
    await button("Get started").click();
    await page.getByRole("heading", { name: "What do you want to learn money skills for?" }).waitFor();
    await clean("what for");
    await button(/^Car/).click();
    await page.getByText(/^For your goal \(Car\), these come first: Budgeting, Saving/).waitFor();
    await button(/^From the beginning\s*Budgeting, lesson 1: What's a budget\?/).waitFor();
    await clean("how to start");
    await button(/^From the beginning/).click();
    await page.getByRole("dialog", { name: "What's a budget?" }).waitFor();
    console.log("ok: onboarding in 3 screens (welcome, what for, how to start) opens the first lesson");

    await play(app);
    await top().getByText("Lesson complete").waitFor();
    await top().getByText(/^\+1[05]$/).waitFor();
    await top().getByText(/^1[05] of 20 XP today · 1-day streak$/).waitFor();
    await top().getByText("In real life").waitFor();
    await top().getByText("This week, write down three things your money will go to before it arrives.").waitFor();
    await clean("lesson complete");
    await button("Done", top()).click();
    await page.getByRole("heading", { name: "Today" }).waitFor();
    await page.getByText("Building toward: Car").first().waitFor();
    await page.getByText("Lesson 2 of 3", { exact: false }).waitFor();
    assert.equal(await page.getByText("Myth or fact?").count(), 0, "day 1 is just the first lesson: no myth card");
    assert.equal(await page.getByRole("heading", { name: "What's new" }).count(), 0, "someone new doesn't get \"What's new\"");
    assert.equal(await page.locator("header").getByText("Beta", { exact: true }).count(), 1, "a small Beta label in the header");
    await clean("today");
    console.log("ok: a full lesson, start to finish, then Today (the next lesson, and what it's building toward)");

    // The goal's amount and date: asked after the first lesson, and optional.
    await page.getByText("Make a plan for your goal?").waitFor();
    await button("Make a plan").click();
    await button("Create goal", top()).click();
    await page.getByText(/^Set aside \$[\d,]+ a month in a savings account to reach/).waitFor();
    await clean("the car goal");
    await menu("Learn");
    assert.equal(await page.getByText("Make a plan for your goal?").count(), 0, "asked only once");
    console.log("ok: the goal plan, asked after the first lesson (optional), from the goal picked in onboarding");

    await page.getByText("How old are you?").waitFor();
    await button("18–25").click();
    await page.getByText("How old are you?").waitFor({ state: "detached" });
    await page.waitForFunction(() => JSON.parse(localStorage.getItem("northvale-learn-v1")).profile.ageBand === "18-25");
    console.log("ok: asked once for an age range (after the first lesson)");

    // Practice: there from day one, a preview until 3 lessons.
    await menu("Practice");
    await page.getByText("Opens after 3 lessons").waitFor();
    await page.getByText("Practice investing with $10,000 of pretend money", { exact: false }).waitFor();
    await page.getByText("1 of 3 lessons").first().waitFor();
    await clean("practice, before it opens");
    await button("Continue learning").click();
    for (let i = 0; i < 2; i++) {
      await button("Continue").click(); // Today's one big button
      await page.getByRole("dialog", { name: ALL_LESSONS[i + 1].title.en }).waitFor();
      await play(app, { untilMoment: i === 1 });
      if (i === 1) {
        // The first unit done: one calm full-screen moment, with a share option.
        await top().getByText("Unit 1 of 18 · complete").waitFor();
        await top().getByRole("heading", { name: "Budgeting" }).waitFor();
        await button("Share", top()).waitFor();
        await clean("unit moment");
        await button("Continue", top()).click();
        await top().getByText("Lesson complete").waitFor();
      }
      await button("Done", top()).click();
    }
    // After the third lesson: the one-question survey, once back from the lesson.
    await page.getByRole("dialog", { name: "Quick question" }).waitFor({ timeout: 10000 });
    await page.keyboard.press("Escape");
    await page.waitForFunction(() => (JSON.parse(localStorage.getItem("northvale-learn-v1")).modules.feedback || {}).survey === "skipped");
    await button("Practice", page.getByRole("navigation")).click();
    await page.getByRole("dialog", { name: "New: Practice" }).waitFor();
    await clean("practice intro");
    await button("Take a look", top()).click();
    await page.getByText("Opens with the lesson “Your first safe investment”").waitFor();
    await page.getByText("Opens after 5 lessons").waitFor();
    console.log("ok: Practice opens after 3 lessons, with a one-time introduction; inside, the portfolio and News wait for their lessons");

    await button("Start mission").click();
    await button("Mark done").click();
    await top().getByRole("textbox").fill("Gas and insurance cost more than I thought.");
    await button("Finish mission", top()).click();
    await top().getByText("+20 XP").waitFor();
    await clean("mission done");
    await page.keyboard.press("Escape");
    console.log("ok: a real-life mission, marked done with a note (+20 XP)");

    await menu("Goals");
    await button("New goal").click();
    await button(/^Travel/, top()).click();
    await button("Create goal", top()).click();
    await page.getByText("Set aside $124 a month in a savings account to reach $1,500").waitFor();
    await clean("new goal");
    console.log("ok: a second goal, and its plan");

    // Tools: each one after the lesson that uses it.
    await menu("Tools");
    await button(/^Budget planner/).click();
    await top().getByText("Budget planner").first().waitFor();
    await clean("calculator: Budget planner");
    await page.keyboard.press("Escape");
    await page.getByText(/^Retirement\s*Opens after the lesson “/).waitFor();
    assert.equal(await page.getByRole("button", { name: /^Retirement/ }).count(), 0, "a tool before its lesson doesn't open");
    console.log("ok: Practice → Tools: open after their lesson, locked (and saying which lesson) before it");

    await menu("Skills");
    await button(/^(Review|Practice anyway)$/).click();
    await play(app);
    await top().getByText("Review complete").waitFor();
    await clean("review complete");
    await button("Done", top()).click();
    console.log("ok: a review (Me → Skills)");

    for (const name of SCREENS) {
      if (!(await menu(name, { ifOpen: true }))) continue;
      await page.waitForTimeout(150);
      await clean(`screen: ${name}`);
      await noRepeatedTitle(page, name);
      await shut();
    }
    console.log(`ok: all ${SCREENS.length} main screens, no raw text or console errors (English, US)`);

    // Spanish, Mexico: the same screens.
    await page.getByRole("radio", { name: "Español" }).click();
    await page.getByRole("radio", { name: /México/ }).click();
    for (const name of PANTALLAS) {
      if (!(await menu(name, { ifOpen: true }))) continue;
      await page.waitForTimeout(150);
      await clean(`pantalla: ${name}`);
      await noRepeatedTitle(page, name);
      await shut();
    }
    console.log("ok: the same in Spanish (Mexico): every screen");
    await app.close();
  }

  // --- the new kinds of question: each one answered right, one answered wrong, Spanish, and what a screen reader hears ---
  {
    const done = (ids) => Object.fromEntries(ids.map((id) => [id, { done: true, at: "2026-11-01", last: "2026-11-01", best: 0, times: 1 }]));
    const app = await open(learner({ ageBand: "18-25" }, { lessons: done(["budget-1", "budget-2", "budget-3", "save-1", "save-2", "save-3"]), counters: { lessons: 6 } }));
    const { page, top, button, clean } = app;
    // Opens a lesson from the course (unfolding its unit), then plays up to the question with `data-q` = kind.
    const reach = async (unit, title, kind) => {
      const u = page.getByRole("button", { name: new RegExp(`^Unit ${unit} · `) });
      if ((await u.getAttribute("aria-expanded")) === "false") await u.click();
      await page.getByRole("button", { name: new RegExp(`^${esc(title)} — `) }).click();
      for (let i = 0; i < 20 && !(await top().locator(`[data-q="${kind}"], [data-q="${kind}-item"], [data-q="${kind}-left"], [data-q="${kind}-part"]`).count()); i++) {
        const names = await top().getByRole("button").evaluateAll((bs) => bs.map((b) => b.innerText.trim()));
        if (names.includes("Skip for now")) await button("Skip for now", top()).click();
        else {
          if (names.includes("Check")) (await answerAny(top()), await button("Check", top()).click());
          await button("Continue", top()).click();
        }
      }
    };
    const check = async (heading, why) => {
      await button("Check", top()).click();
      await top().getByRole("status").getByText(heading, { exact: true }).waitFor();
      if (why) await top().getByRole("status").getByText(why, { exact: false }).waitFor();
      await clean(`feedback: ${heading}`);
      await button("Continue", top()).click();
    };
    const leave = async () => (await button("Close", top()).click(), await button("Leave", top()).click());

    await reach(1, "What's a budget?", "number");
    await top().locator('[data-q="number"]').fill("80");
    await check("Correct", "0.20 × $400 = $80 a month.");
    await leave();

    await reach(1, "Needs vs. wants", "scenario");
    await top().getByRole("radio", { name: /^1?\s*Buy groceries first/ }).click();
    await check("A good fit", "Go, and figure out food later (here's the catch)");
    await leave();

    await reach(1, "Small leaks", "estimate");
    await slide(top().locator('[data-q="estimate"]'), 1040);
    await check("Spot on", "about $1,040");
    await leave();

    // A wrong order: amber, and the right order spelled out. Then (leaving
    // keeps the place) the same lesson picks up after it, and the order
    // question comes back at the end for a second try: the right order.
    await reach(2, "Pay yourself first", "order");
    for (const item of ["You spend what's left on wants", "You pay for your needs", "An automatic transfer moves your savings out", "Your pay lands in your account"]) await top().getByRole("button", { name: new RegExp(`^${esc(item)}`) }).click();
    await check("Not quite", "The right order");
    await leave();

    await reach(2, "Pay yourself first", "order");
    for (const item of ["Your pay lands in your account", "An automatic transfer moves your savings out", "You pay for your needs"]) await top().getByRole("button", { name: new RegExp(`^${esc(item)}`) }).click();
    assert.equal(await top().getByRole("button", { name: "Position 3: You pay for your needs" }).count(), 1, "a screen reader hears each item's place");
    await top().getByRole("button", { name: /^You spend what's left on wants/ }).click();
    await check("Correct", "Then needs, then wants.");
    // That was the lesson's last step: it's finished.
    if (await top().locator("[data-moment]").count()) await button("Continue", top()).click();
    await button("Done", top()).click();

    await reach(2, "Where to keep savings", "match");
    for (const [a, b] of [["Savings account", "Pays interest"], ["Checking account", "Made for everyday"], ["Cash at home", "Earns nothing"], ["FDIC insurance", "Protects deposits"]]) (await top().locator('[data-q="match-left"]', { hasText: a }).click(), await top().locator('[data-q="match-right"]', { hasText: b }).click());
    await check("Correct", "slowly growing");
    await leave();
    await app.close();

    // Spot the problem, in a scam text; then the same lesson in Spanish (Mexico).
    const scam = await open(learner({ ageBand: "18-25" }, { startUnit: "scams" }));
    const S2 = scam;
    const u6 = S2.page.getByRole("button", { name: /^Phishing — / });
    await u6.click();
    for (let i = 0; i < 20 && !(await S2.top().locator('[data-q="spot-part"]').count()); i++) {
      const names = await S2.top().getByRole("button").evaluateAll((bs) => bs.map((b) => b.innerText.trim()));
      if (names.includes("Check")) (await answerAny(S2.top()), await S2.button("Check", S2.top()).click());
      await S2.button("Continue", S2.top()).click();
    }
    await S2.top().getByRole("button", { name: "Verify within 1 hour" }).click();
    await S2.top().getByRole("button", { name: "yourbank-secure-login.co" }).click();
    await S2.button("Check", S2.top()).click();
    await S2.top().getByRole("status").getByText("You found both", { exact: true }).waitFor();
    await S2.clean("spot the problem");
    await scam.close();

    const es = await open({ ...learner({ ageBand: "18-25" }), settings: { lang: "es", region: "MX", look: "white", reduceMotion: true } });
    await es.button("Empezar").click();
    for (let i = 0; i < 20 && !(await es.top().locator('[data-q="number"]').count()); i++) {
      const names = await es.top().getByRole("button").evaluateAll((bs) => bs.map((b) => b.innerText.trim()));
      if (names.includes("Comprobar")) (await answerAny(es.top()), await es.button("Comprobar", es.top()).click());
      await es.button("Continuar", es.top()).click();
    }
    await es.top().locator('[data-q="number"]').fill("1,200");
    await es.button("Comprobar", es.top()).click();
    await es.top().getByRole("status").getByText("0.20 × $6,000 = $1,200 al mes.").waitFor();
    await es.clean("haz la cuenta (MX)");
    await es.close();
    console.log("ok: the new kinds of question (work it out, real-life choice, estimate, put in order, match, spot the problem): right and wrong answers, Spanish (Mexico), and screen-reader labels");
  }

  // --- one tap from Today to the first lesson (a learner who closed it) ---
  {
    const app = await open(learner({}, { startUnit: "budget" }));
    const { page, button, clean } = app;
    await page.getByRole("heading", { name: "Today" }).waitFor();
    await clean("today, before any lesson");
    await button("Start").click();
    await page.getByRole("dialog", { name: "What's a budget?" }).waitFor();
    console.log("ok: one tap from Today to the first lesson");
    await app.close();
  }

  // --- Today for a long-time learner: the lesson on top, at most 2 small rows, no reminder offer competing ---
  {
    const app = await open({ ...daniState(dayKey()), updatedAt: 1 });
    const { page, clean } = app;
    await page.getByRole("heading", { name: "Today" }).waitFor();
    const order = await page.evaluate(() => {
      const main = document.querySelector("main");
      const lesson = [...main.querySelectorAll("button")].find((b) => b.innerText.trim() === "Continue");
      const list = main.querySelector(".nv-list");
      return { rows: list.children.length, lessonFirst: !!(lesson.compareDocumentPosition(list) & Node.DOCUMENT_POSITION_FOLLOWING), review: list.innerText.includes("Review") };
    });
    assert.ok(order.lessonFirst, "the lesson button comes first");
    assert.ok(order.rows <= 2, `at most 2 small rows (saw ${order.rows})`);
    assert.ok(order.review, "a due review is one of them");
    assert.equal(await page.getByText("Want a daily reminder?").count(), 0, "no reminder offer while something else needs doing");
    await clean("today, three weeks in");
    console.log("ok: Today for a long-time learner: the lesson first, at most 2 small rows, no competing reminder offer");
    await app.close();
  }

  // --- a 7-day streak: its moment, then the finish; sound and touch settings ---
  {
    const d = (n) => new Date(Date.now() - n * 864e5).toLocaleDateString("en-CA", { timeZone: "America/Mexico_City" });
    const days = [6, 5, 4, 3, 2, 1].map(d);
    const app = await open(learner({ ageBand: "18-25" }, { streak: { count: 6, last: d(1), best: 6, frozen: [] }, lessonDays: days, days: Object.fromEntries(days.map((x) => [x, 10])) }));
    const { page, top, button, clean, menu } = app;
    await button("Start").click();
    await play(app, { untilMoment: true });
    await top().getByRole("heading", { name: "A week, every day." }).waitFor();
    await top().getByText("Seven days in a row. This is about where habits start.").waitFor();
    await clean("7-day moment");
    await button("Continue", top()).click();
    await top().getByText(/· 7-day streak$/).waitFor();
    await button("Done", top()).click();
    await menu("Settings");
    const sound = page.getByRole("switch", { name: "Sounds" });
    assert.equal(await sound.getAttribute("aria-checked"), "false", "sounds are off by default");
    assert.equal(await page.getByRole("switch", { name: "Vibration" }).getAttribute("aria-checked"), "true", "vibration is on by default where it works");
    await sound.click();
    await page.waitForFunction(() => JSON.parse(localStorage.getItem("northvale-learn-v1")).settings.sound === true);
    console.log("ok: a 7-day streak gets its moment (then the finish screen); sounds off and vibration on by default, both in Settings");
    await app.close();
  }

  // --- the playful look: the course as a voyage; every animation stops with Reduce motion ---
  {
    const done = (ids) => Object.fromEntries(ids.map((id) => [id, { done: true, at: "2026-11-01", last: "2026-11-01", best: 0, times: 1 }]));
    const seed = learner({ ageBand: "18-25" }, { lessons: done(["budget-1", "budget-2", "budget-3", "save-1"]), counters: { lessons: 4 } });
    seed.settings.reduceMotion = false;
    const app = await open(seed, { motion: true });
    const { page, menu, clean } = app;
    // Unit 1 is an island you can open; the boat sits at the current lesson.
    const isle = page.getByRole("button", { name: "Unit 1 · Budgeting · 3 of 3" });
    await isle.click();
    assert.equal(await isle.getAttribute("aria-expanded"), "true", "an island opens its unit");
    await page.getByRole("button", { name: /^What's a budget\? — / }).waitFor();
    assert.equal(await page.locator(".nv-glide").count(), 1, "one boat, at the current lesson");
    await clean("the course as a voyage");
    // Each animation class, measured inside the app (motion on, then Reduce motion).
    const timings = () =>
      page.evaluate(() => {
        const root = document.querySelector("#root > div");
        return ["nv-ripple", "nv-bob", "nv-drift", "nv-twinkle", "nv-glide", "nv-btn", "nv-in", "nv-beam", "nv-water"].map((c) => {
          const e = Object.assign(document.createElement("span"), { className: c });
          root.appendChild(e);
          const st = getComputedStyle(e);
          const v = Math.max(parseFloat(st.animationDuration) || 0, parseFloat(st.transitionDuration) || 0);
          e.remove();
          return [c, v];
        });
      });
    for (const [c, v] of await timings()) assert.ok(v >= 0.1, `${c} moves with motion on (${v}s)`);
    await menu("Settings");
    await page.getByRole("switch", { name: "Reduce motion" }).click();
    await page.waitForFunction(() => !!document.querySelector(".nv-reduce"));
    for (const [c, v] of await timings()) assert.ok(v < 0.01, `${c} is still with Reduce motion (${v}s)`);
    console.log("ok: the course as a voyage (an island opens its unit, the boat at the current lesson); every animation stops with Reduce motion");
    await app.close();
  }

  // --- daily hooks: Money Myth or Fact, Your money week, The real cost ---
  {
    const d = (n) => new Date(Date.now() - n * 864e5).toLocaleDateString("en-CA", { timeZone: "America/Mexico_City" });
    const seed = learner({ ageBand: "18-25" }, { lessonDays: [d(1)], days: { [d(1)]: 10 }, xp: 30, counters: { lessons: 3 }, streak: { count: 1, last: d(1), best: 1, frozen: [] } }, { goals: { goals: [newGoal({ id: "w1", templateId: "car", target: 5000, start: 300, months: 24, today: d(12) })] } });
    const app = await open(seed);
    const { page, top, button, clean, menu } = app;
    // Myth or fact: two plain buttons, an answer, +2 XP; then one line until tomorrow.
    const card = page.locator("[data-myth]");
    await card.getByText("Myth or fact?").waitFor();
    await clean("myth card");
    await card.getByRole("button", { name: "Myth", exact: true }).click();
    await card.getByRole("status").getByText(/(Right|Not quite): it's a (myth|fact)\./).waitFor();
    await page.waitForFunction(() => JSON.parse(localStorage.getItem("northvale-learn-v1")).progress.xp === 32);
    await clean("myth answered");
    await page.reload();
    await page.getByText("Today's myth: answered · another one tomorrow").waitFor();
    console.log("ok: Money Myth or Fact on Today: not on day 1, +2 XP, then one line until tomorrow");
    // Your money week: a short look back, then the check-in.
    await page.getByRole("button", { name: /^Your money week/ }).click();
    await top().getByText("You learned").waitFor();
    await top().getByText(/^For next week$/).waitFor();
    await top().getByText(/^Car: \$[\d,]+ so far$/).waitFor(); // no check-ins yet, so no "from → to"
    await clean("your money week");
    await button("Not this week", top()).click();
    await page.waitForFunction(() => !!JSON.parse(localStorage.getItem("northvale-learn-v1")).modules.goals.checkIn);
    assert.equal(await page.getByRole("button", { name: /^Your money week/ }).count(), 0, "done for the week");
    console.log("ok: Your money week: what you learned, the streak, the goal, next week's lesson, then the check-in");
    // The real cost, in Practice: an everyday choice or a hidden cost, by week.
    await menu("Practice");
    const rc = page.locator("[data-rc]");
    await rc.waitFor();
    if ((await rc.getAttribute("data-rc")) === "everyday") {
      await rc.getByRole("radio", { name: /^Snack/ }).click();
      await rc.getByText("$3 every day is about $1,095 a year.", { exact: false }).waitFor();
      await rc.getByText("The point is choosing on purpose.", { exact: false }).waitFor();
    } else await rc.getByRole("button", { name: /^Lesson: / }).waitFor();
    await clean("the real cost");
    // A week later it's the other kind (a page clock set 7 days ahead).
    const kind = await rc.getAttribute("data-rc");
    await app.close();
    const later = await browser.newContext({ viewport: { width: 390, height: 800 }, locale: "en-US", timezoneId: "America/Mexico_City", serviceWorkers: "block", reducedMotion: "reduce" });
    await later.addInitScript((x) => localStorage.getItem("northvale-learn-v1") || localStorage.setItem("northvale-learn-v1", x), JSON.stringify(seed));
    const lp = await later.newPage();
    lp.setDefaultTimeout(5000);
    // (only the date moves a week ahead; timers and animation frames are untouched)
    await later.addInitScript(() => {
      const D = Date;
      const shift = 7 * 864e5;
      class Later extends D {
        constructor(...a) {
          super(...(a.length ? a : [D.now() + shift]));
        }
        static now() {
          return D.now() + shift;
        }
      }
      globalThis.Date = Later;
    });
    await lp.goto(BASE);
    await lp.waitForTimeout(300);
    if (await lp.getByRole("dialog").count()) await lp.keyboard.press("Escape"); // (a week away: welcome back)
    await lp.getByRole("navigation").getByRole("button", { name: "Practice", exact: true }).click();
    if (await lp.getByRole("dialog").count()) await lp.keyboard.press("Escape");
    const other = lp.locator("[data-rc]");
    await other.waitFor();
    assert.notEqual(await other.getAttribute("data-rc"), kind, "the real cost alternates by week");
    if ((await other.getAttribute("data-rc")) === "hidden") {
      await other.getByRole("button", { name: /^Lesson: / }).waitFor();
      assert.match(await other.innerText(), /(takes about \d+ years|a year)/);
    } else await other.getByRole("radio", { name: /^Coffee/ }).waitFor();
    assert.ok(!/NaN|undefined|\{/.test(await other.innerText()), "the other week's card reads cleanly");
    await later.close();
    console.log("ok: The real cost in Practice: everyday choices one week, a hidden cost with its lesson the next");
    const es = await open({ ...seed, settings: { lang: "es", region: "MX", look: "white", reduceMotion: true } });
    await es.page.locator("[data-myth]").getByText("¿Mito o realidad?").waitFor();
    await es.clean("mito o realidad");
    await es.close();
  }

  // --- the streak row opens the streak details ---
  {
    const app = await open(learner({ ageBand: "18-25" }, { streak: { count: 2, last: lessonDays3()[0], best: 2, frozen: [] } }));
    const { page, top } = app;
    await page.getByRole("button", { name: /^2-day streak/ }).click();
    await top().getByText("Your streak").first().waitFor();
    console.log("ok: the streak row on Today opens the streak details");
    await app.close();
  }

  // --- the brand: "Our promise" from Me and by link (Spanish), the Spanish tagline on the welcome screen ---
  {
    const app = await open(learner({ ageBand: "18-25" }));
    await app.menu("Me");
    await app.button(/^Our promise/).click();
    await app.page.getByRole("heading", { name: "Our promise", exact: true }).waitFor();
    await app.page.getByText("Nobody pays us to recommend anything.", { exact: false }).waitFor();
    await app.clean("our promise");
    await app.page.goto(`${BASE}?legal=promise&lang=es`);
    await app.page.getByRole("heading", { name: "Nuestra promesa", exact: true }).waitFor();
    await app.page.getByText("Rumbo a mar abierto.", { exact: false }).waitFor();
    await app.clean("nuestra promesa");
    await app.close();
    const es = await open({ ...learner({}), profile: { onboarded: false, nickname: "", avatar: 0 }, settings: { lang: "es", region: "MX", look: "white", reduceMotion: true } });
    await es.page.getByText("Rumbo a mar abierto", { exact: true }).waitFor();
    await es.clean("bienvenida");
    await es.close();
    console.log("ok: the brand: “Our promise” (English, and Spanish by link), the tagline on the welcome screen in Spanish");
  }

  // --- the lesson-3 survey can't be lost: missed (app closed first), it shows on the next open; answered, never again ---
  {
    const app = await open(learner({ ageBand: "18-25" }, { counters: { lessons: 3 } }, { feedback: { pending: [], survey: null } }));
    const { page, top, button, clean } = app;
    await page.getByRole("dialog", { name: "Quick question" }).waitFor({ timeout: 10000 });
    await clean("the survey");
    await top().getByRole("radio", { name: "Very disappointed" }).click();
    await top().getByRole("textbox").fill("It explains things clearly.");
    const sent = page.waitForRequest((r) => r.url().endsWith("/api/survey") && r.method() === "POST");
    await button("Send", top()).click();
    assert.equal(JSON.parse((await sent).postData()).answer, "very");
    await page.reload();
    await page.waitForTimeout(3500);
    assert.equal(await page.getByRole("dialog", { name: "Quick question" }).count(), 0, "answered surveys don't come back");
    console.log("ok: the lesson-3 survey shows even if its moment was missed (on the next open), sends the answer, and never comes back");
    await app.close();
  }

  // --- the tab bar and the header never cover what's scrolled into view ---
  {
    const app = await open(learner({ ageBand: "18-25" }, { lessonDays: lessonDays3(), counters: { lessons: 3 } }));
    const { page, menu } = app;
    for (const name of ["Learn", "Goals", "Me", "Settings"]) {
      await menu(name);
      await page.waitForTimeout(150);
      // Each control, focused from the keyboard (which scrolls it into view), must sit fully between the header and the tab bar.
      const covered = await page.evaluate(async () => {
        const out = [];
        for (const el of document.querySelectorAll("main button:not([disabled]), main input, main select, main textarea, main a[href]")) {
          if (!el.checkVisibility({ visibilityProperty: true })) continue; // (e.g. inside a closed <details>)
          el.focus();
          await new Promise((r) => requestAnimationFrame(() => requestAnimationFrame(r)));
          const r = el.getBoundingClientRect();
          const top = document.querySelector("header").getBoundingClientRect().bottom;
          const bottom = document.querySelector("nav").getBoundingClientRect().top;
          if (r.height <= bottom - top && (r.top < top - 1 || r.bottom > bottom + 1)) out.push((el.getAttribute("aria-label") || el.innerText || el.tagName).slice(0, 40));
        }
        return out;
      });
      assert.deepEqual(covered, [], `${name}: covered by the tab bar or header after scrolling to it`);
    }
    // And a tap near the bottom of a long page reaches its control, not the tab bar.
    await page.getByRole("radio", { name: "Español" }).click();
    await page.getByRole("radio", { name: /México/ }).click({ timeout: 2000 });
    console.log("ok: the tab bar and the header never cover a control that's scrolled into view (keyboard focus and taps)");
    await app.close();
  }

  // --- a learner from before the tabs, who used the calculators on Home ---
  {
    const app = await open(learner({ ageBand: "18-25" }, { counters: { sim: 2, trade: 1 }, practiced: { news: ["2026-11-01"] } }));
    const { page, top, button, clean, menu } = app;
    await menu("Practice");
    assert.equal(await page.getByText("Opens after 3 lessons").count(), 0, "Practice is open for someone who already used it");
    for (const name of ["Portfolio", "News"]) (await menu(name), await page.waitForTimeout(150), await clean(`screen: ${name} (used before)`));
    await menu("Tools");
    for (const name of CALCULATORS) {
      await button(new RegExp(`^${esc(name)}`)).click();
      await top().getByText(name).first().waitFor();
      await clean(`calculator: ${name}`);
      await page.keyboard.press("Escape");
    }
    await menu("Settings");
    await page.getByRole("radio", { name: "Español" }).click();
    await page.getByRole("radio", { name: /México/ }).click();
    await menu("Herramientas");
    for (const name of ["Planeador de presupuesto", "Pagar una deuda", "Empezar temprano", "Rango de inversión", "Retiro", "Sueldo neto", "Ingreso extra"]) {
      await button(new RegExp(`^${esc(name)}`)).click();
      await clean(`calculadora: ${name}`);
      await page.keyboard.press("Escape");
    }
    for (const name of ["Portafolio", "Noticias"]) (await menu(name), await page.waitForTimeout(150), await clean(`pantalla: ${name} (usada antes)`));
    console.log(`ok: someone who used Practice before keeps it open: the portfolio, News and all ${CALCULATORS.length} calculators, in English and Spanish`);
    await app.close();
  }

  // --- the tutor in offline mode (no AI here): says so up front, and matches other wording ---
  {
    const app = await open(learner({ ageBand: "18-25" }));
    const { page, top, button, clean, menu } = app;
    await menu("Tutor");
    await top().getByText("The tutor is in offline mode, so it can only explain basic terms.").waitFor();
    await clean("tutor, offline");
    for (const [q, answer] of [
      ["how do cards charge interest??", "The yearly cost of borrowing, as a percent."],
      ["what is a fund for an emergency", "Money saved only for surprises, so a bad day doesn't become debt."],
      ["how do i make a budget", "A plan for where your money goes before you spend it."],
    ]) {
      await top().getByRole("textbox").fill(q);
      await page.keyboard.press("Enter");
      await top().getByText(answer).waitFor();
    }
    await top().getByText("Related lesson: Saving · Emergency fund").waitFor();
    await top().getByText("Related lesson: Budgeting · What's a budget?").waitFor();
    await clean("tutor, offline answers");
    await top().getByRole("button", { name: "Open" }).last().click();
    await page.getByRole("dialog", { name: "What's a budget?" }).waitFor();
    console.log("ok: offline Ask says so before you ask, matches different wording, and links the lesson");
    await page.keyboard.press("Escape");
    await app.close();
  }

  // --- back after 5 days away, with a 4-day streak that ended ---
  {
    const day = (n) => new Date(Date.now() + n * 864e5).toLocaleDateString("en-CA", { timeZone: "America/Mexico_City" });
    const lessonDays = [day(-8), day(-7), day(-6), day(-5)];
    const lessons = Object.fromEntries(ALL_LESSONS.slice(0, 4).map((l, i) => [l.id, { done: true, at: lessonDays[i], last: lessonDays[i], best: 0, times: 1 }]));
    const seed = { version: 1, updatedAt: 1, profile: { onboarded: true, nickname: "Dani", ageBand: "18-25", avatar: 0 }, settings: { lang: "en", region: "US", look: "white", reduceMotion: true }, progress: { xp: 60, days: Object.fromEntries(lessonDays.map((d) => [d, 15])), streak: { count: 4, last: day(-5), best: 4, frozen: [] }, freezes: 0, dailyGoal: 20, lessons, lessonDays, badges: {}, counters: { lessons: 4 }, practiced: {}, startUnit: "budget", placed: [], seen: day(-5) }, modules: { feedback: { pending: [], survey: "skipped" } } };
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
    await page.getByRole("heading", { name: "Real-life missions" }).waitFor();
    assert.equal(new URL(page.url()).search, "", "the address is tidied");
    await page.goto(`${BASE}?recap_off=nope.nope`);
    await page.getByText("That link isn't valid anymore.").waitFor();
    console.log("ok: reminder settings (quiet hours by default); a reminder opens where it points; the recap's turn-off link");
    await app.close();
  }

  // --- feedback: from Me, and from a lesson step (it says which) ---
  {
    const app = await open(learner({ ageBand: "18-25" }, { counters: { lessons: 3 } }, { feedback: { pending: [], survey: "skipped" } }));
    const { page, top, button, clean, menu } = app;
    await menu("Me");
    await button("Send feedback").click();
    await top().getByRole("button", { name: "Idea", exact: true }).click();
    await top().getByRole("textbox", { name: "Send feedback" }).fill("The sea chart is lovely. A test note from the browser test.");
    await clean("feedback");
    await button("Send", top()).click();
    await page.getByText("Got it, thank you. We read every one.").waitFor();
    await menu("Learn");
    await page.getByRole("button", { name: /^(Continue|Start)$/ }).first().click();
    await page.locator('[aria-busy="true"]').waitFor({ state: "detached", timeout: 10000 });
    await top().getByRole("button", { name: "Report a problem with this step" }).click();
    await top().getByText(/^About: /).waitFor();
    await top().getByRole("textbox", { name: "Send feedback" }).fill("A test note about a lesson step.");
    await button("Send", top()).click();
    await page.getByText("Got it, thank you. We read every one.").waitFor();
    await app.close();
    console.log("ok: feedback from Me and from a lesson step (which says where it came from)");
  }

  // --- the admin page ---
  {
    const app = await open();
    const { page, clean } = app;
    await page.goto(`${BASE}admin`);
    await page.getByPlaceholder("Admin token").fill(env.ADMIN_TOKEN);
    await page.keyboard.press("Enter");
    await page.getByText("What brings people back").waitFor();
    // The first week, first: the beta's numbers against their targets, in words.
    assert.equal(await page.locator("h2").first().textContent(), "First week of the beta");
    for (const label of ["Testers", "Came back the next day", "Came back on day 7", "“Very disappointed” without it", "Finished 3+ lessons", "This week"]) await page.getByText(label, { exact: true }).waitFor();
    await page.getByText(/^(Not enough people yet|On track|Watch it|Needs work)/).first().waitFor();
    await page.getByText("A test note about a lesson step.").waitFor();
    assert.match(await page.getByText(/^\d+ notes$/).innerText(), /^[1-9]\d* notes$/, "this week's feedback is counted");
    await page.getByText("Day-30 return").waitFor();
    await page.getByRole("button", { name: "Send a test reminder to every device" }).click();
    await page.getByText("0 of 0 delivered.").waitFor();
    await page.getByText("Invites and sharing").waitFor();
    await page.getByText("Waitlist (landing page)").waitFor();
    await page.getByRole("button", { name: "Download the list (CSV)" }).waitFor();
    await page.getByText("classroom: off").waitFor();
    await clean("admin");
    console.log("ok: the admin page: the first week against its targets, then what brings people back");
    await app.close();
  }

  // --- classroom mode: a teacher (a tester), a student who joins and leaves ---
  {
    // What the student has that the teacher must never see.
    const PRIVATE = ["Secret Car Fund", "1,234", "5,000", "my private note", "13–17", "13-17", "ana@"];
    const before = day(-10);
    const student = await open(
      learner(
        { ageBand: "13-17", nickname: "Ana" },
        { lessons: Object.fromEntries(ALL_LESSONS.slice(0, 2).map((l) => [l.id, { done: true, at: before, last: before, best: 0, times: 1 }])), lessonDays: [before], counters: { lessons: 1 }, days: { [before]: 30 }, xp: 30 }, // (lessons: 1 keeps the after-lesson-3 survey away)
        { goals: { goals: [newGoal({ id: "g1", templateId: "car", name: "Secret Car Fund", target: 5000, start: 1234, months: 24, today: before })] }, missions: { log: [{ id: MISSIONS[0].id, day: before, week: weekStart(before), note: "my private note" }] } }
      )
    );
    const teacher = await open(learner({ ageBand: "26+", nickname: "Ms R" }));
    const T = teacher;
    await T.page.evaluate(() => fetch("/api/auth/signup", { method: "POST", headers: { "X-Northvale": "1", "Content-Type": "application/json" }, body: JSON.stringify({ email: "ms.r@school.test", password: "a long teacher password", ageBand: "26+", nickname: "Ms R" }) }));
    assert.deepEqual(await admin("/api/admin/flags", { flag: "classroom", email: "ms.r@school.test", on: true }), { ok: true });
    await T.page.reload();
    await T.menu("Classes");
    await T.button("Send the link").click();
    await T.page.getByText("Check your inbox for the link").waitFor();
    const link = (/(http:\/\/\S+#verify=[\w-]+)/.exec(serverOut) || [])[1];
    assert.ok(link, "the confirmation link was emailed (printed)");
    await T.page.goto(link); // (only the #fragment changes,)
    await T.page.reload(); // (so open it fresh, as from the email)
    await T.page.getByText("Email confirmed").waitFor();
    await T.menu("Classes");
    await T.page.getByRole("checkbox", { name: "I agree to the teacher terms" }).check();
    await T.button("Accept").click();
    await T.page.getByLabel("Class name").fill("Period 3");
    await T.button("Create class").click();
    await T.page.getByText("0 students ·").click();
    const code = await T.page.getByLabel("Class code", { exact: true }).innerText();
    assert.match(code, /^[A-Z2-9]{6}$/);
    await T.page.getByRole("combobox", { name: "Unit" }).selectOption("budget");
    await T.page.getByLabel("Due date").fill(day(7));
    await T.button("Assign").click();
    await T.page.getByText("0 of 0 students finished").waitFor();
    await T.clean("teacher: a new class");
    // Three classmates on other devices, so the class has topic totals.
    for (const nickname of ["Beto", "Caro", "Dani"]) {
      const m = await post("/api/class/join", { code, nickname, ageBand: "13-17" });
      await post("/api/class/report", { ...m, report: { lessons: [], concepts: { budgeting: [2, 1], needs_wants: [1, 1] }, missions: 0, week: weekStart(day(0)), xp: 10 } });
    }
    console.log("ok: a teacher (turned on from the admin page) confirms their email, accepts the teacher terms, makes a class and assigns a unit");

    const S = student;
    await S.page.goto(`${BASE}?join=${code}`);
    await S.page.getByRole("dialog", { name: "Before you join" }).waitFor();
    await S.top().getByText("Class: Period 3").waitFor();
    for (const line of ["Your teacher sees", "Lessons and units you finish from now on", "Your teacher never sees", "Your goals or any amounts", "Your mission notes", "What you ask the tutor", "Your age or email", "Anything from before you join, unless you choose to count lessons you already finished for assignments", "You can leave anytime. Then your teacher no longer sees anything about you."]) await S.top().getByText(line, { exact: true }).waitFor();
    await S.clean("what your teacher sees, before joining");
    assert.equal(await S.top().getByLabel("Nickname for this class").inputValue(), "Ana");
    assert.equal(await S.top().getByRole("checkbox", { name: /Count lessons I already finished/ }).isChecked(), false, "earlier lessons aren't shared unless the student chooses");
    await S.button("Join class", S.top()).click();
    await S.page.getByText("You joined Period 3").waitFor();
    await S.page.getByText("Budgeting").waitFor();
    await S.page.getByText("0 of 3 lessons").waitFor();
    await S.clean("student: the class");
    console.log("ok: a student joins with the teacher's link and a nickname, after a screen that says what the teacher will and won't see");

    await S.button("Start").click();
    await S.page.getByRole("dialog", { name: ALL_LESSONS[0].title.en }).waitFor();
    await play(S);
    await S.button("Done", S.top()).click();
    await S.menu("Classes");
    await S.page.getByText("1 of 3 lessons").waitFor();
    await S.page.waitForTimeout(6000); // the report goes out a few seconds after a change
    await T.button("All classes").click();
    await T.page.getByText("4 students ·").click();
    await T.page.getByRole("cell", { name: "Ana" }).waitFor();
    const shown = await T.page.evaluate(() => document.body.innerText);
    assert.match(shown, /Ana\s+1\s+0\s+0\s+1\/3/, "Ana: 1 lesson since joining (not the one from before), 0 units, 0 missions, 1 of 3 assigned");
    const raw = await T.page.evaluate(async () => JSON.stringify(await (await fetch(`/api/teach/class?id=${encodeURIComponent((await (await fetch("/api/teach", { headers: { "X-Northvale": "1" } })).json()).classes[0].id)}`, { headers: { "X-Northvale": "1" } })).json()));
    for (const x of PRIVATE) {
      assert.ok(!shown.includes(x), `the teacher's screen shows "${x}"`);
      assert.ok(!raw.includes(x), `the teacher's data includes "${x}"`);
    }
    await T.page.getByText(/answers missed · [34] students/).first().waitFor();
    assert.ok(!/needs_wants|\bbudgeting\b/.test(shown), "topics show by name, not their ids");
    await T.clean("teacher: the class with a student");
    console.log("ok: the teacher sees Ana's lessons since joining and assignment progress — none of her goals, amounts, notes or age");

    // Ana chooses to count the lesson she'd finished before joining.
    await S.page.getByRole("switch", { name: "Count lessons I already finished for class assignments" }).click();
    await S.page.getByText("2 of 3 lessons").waitFor();
    await S.page.waitForTimeout(6000);
    await T.button("All classes").click();
    await T.page.getByText("4 students ·").click();
    await T.page.getByRole("cell", { name: "Ana" }).waitFor();
    assert.match(await T.page.evaluate(() => document.body.innerText), /Ana\s+1\s+0\s+0\s+2\/3/, "it counts toward the assignment, not as a lesson since joining");
    console.log("ok: a student can choose to count lessons finished before joining — for assignments only");

    await S.button("What your teacher sees").click();
    await S.top().getByText("Your teacher never sees", { exact: true }).waitFor();
    await S.page.keyboard.press("Escape");
    await S.page.getByRole("switch", { name: "Show me on the class leaderboard" }).click();
    await S.page.getByText("Your row is hidden: only you see it.").waitFor();
    // In Spanish (Mexico), then leaving.
    await S.menu("Settings");
    await S.page.getByRole("radio", { name: "Español" }).click();
    await S.page.getByRole("radio", { name: /México/ }).click();
    await S.menu("Clases");
    await S.page.getByText("Tu fila está oculta: solo tú la ves.").waitFor();
    await S.clean("estudiante: la clase");
    await S.button("Salir de la clase").click();
    await S.button("Salir de la clase", S.top()).click();
    await S.page.getByText("Saliste de Period 3").waitFor();
    await S.page.getByText("No estás en ninguna clase.", { exact: false }).waitFor();
    await S.clean("estudiante: después de salir");
    await T.button("All classes").click();
    await T.page.getByText("3 students ·").click();
    await T.page.getByRole("cell", { name: "Beto" }).waitFor();
    assert.equal(await T.page.getByRole("cell", { name: "Ana" }).count(), 0, "Ana is gone from the teacher's view");
    // An old or duplicate entry: the teacher removes it.
    await T.page.getByRole("row", { name: /Dani/ }).getByRole("button", { name: "Remove" }).click();
    await T.button("Remove", T.top()).click();
    await T.page.getByRole("cell", { name: "Dani" }).waitFor({ state: "detached" });
    await T.menu("Settings");
    await T.page.getByRole("radio", { name: "Español" }).click();
    await T.menu("Clases");
    await T.page.getByText("2 estudiantes ·").click();
    await T.page.getByText("Temas que se le dificultan al grupo", { exact: false }).waitFor();
    await T.clean("docente: la clase");
    console.log("ok: the student can hide from the class leaderboard and leave (here in Spanish); leaving removes them from the teacher's view; a teacher removes an old entry");
    await S.close();
    await T.close();
  }

  // --- the everyone league: 13–17 only with 13–17, 18+ only with 18+ ---
  {
    const sync = (cookie, xp) => fetch(`${BASE}api/progress`, { method: "PUT", headers: { "X-Northvale": "1", "Content-Type": "application/json", Cookie: cookie }, body: JSON.stringify({ state: { progress: { xp, days: { [day(0)]: xp } } }, updatedAt: 1 }) });
    const tia = await account({ email: "tia@example.test", nickname: "Tia", ageBand: "13-17" });
    const tom = await account({ email: "tom@example.test", nickname: "Tom", ageBand: "13-17" });
    const ada = await account({ email: "ada@example.test", nickname: "Ada", ageBand: "26+" });
    await Promise.all([sync(tia, 30), sync(tom, 50), sync(ada, 80)]);
    for (const [cookie, nickname, ageBand, sees, never] of [[tia, "Tia", "13-17", "Tom", "Ada"], [ada, "Ada", "26+", "Ada (you)", "Tom"]]) {
      const app = await open(learner({ ageBand, nickname }, { lessonDays: lessonDays3() }), { cookie });
      await app.menu("Me");
      await app.page.getByText(sees, { exact: true }).waitFor();
      assert.equal(await app.page.getByText(never, { exact: true }).count(), 0, `${nickname} doesn't see ${never}`);
      if (ageBand === "13-17") await app.page.getByText("You're in a league with other learners aged 13–17 only.").waitFor();
      await app.clean(`league (${ageBand})`);
      await app.close();
    }
    const fresh = await open(learner({ ageBand: "18-25", nickname: "Neo" }), { cookie: tia });
    await fresh.menu("Me");
    assert.equal(await fresh.page.getByText("Weekly league", { exact: true }).count(), 0, "no league before 3 learning days");
    await fresh.close();
    console.log("ok: the everyone league keeps 13–17 and 18+ apart (and appears after 3 learning days)");
  }

  // --- signing in on a new device keeps the account's progress ---
  {
    const cookie = await account({ email: "kim@example.test", nickname: "Kim", ageBand: "18-25" });
    const saved = learner({ ageBand: "18-25", nickname: "Kim" }, { xp: 300, lessons: Object.fromEntries(ALL_LESSONS.slice(0, 6).map((l) => [l.id, { done: true, at: day(-3), last: day(-3), best: 0, times: 1 }])), counters: { lessons: 6 } }, { goals: { goals: [newGoal({ id: "k1", templateId: "travel", name: "Kim's trip", target: 1500, months: 12, today: day(-20) })] } });
    await fetch(`${BASE}api/progress`, { method: "PUT", headers: { "X-Northvale": "1", "Content-Type": "application/json", Cookie: cookie }, body: JSON.stringify({ state: { ...saved, updatedAt: Date.now() - 864e5 }, updatedAt: Date.now() - 864e5 }) });
    // A fresh phone: onboarding and a first lesson (so this copy is newer), then sign in.
    const app = await open();
    const { page, button, menu } = app;
    await onboard(app);
    await play(app);
    await button("Done", app.top()).click();
    await menu("Settings");
    await button("I already have an account").click();
    await page.getByLabel("Email", { exact: true }).fill("kim@example.test");
    await page.getByLabel("Password", { exact: true }).fill("a long enough password");
    await button("Sign in").click();
    await page.waitForFunction(() => JSON.parse(localStorage.getItem("northvale-learn-v1")).progress.xp === 300);
    await menu("Goals");
    await page.getByText("Kim's trip").first().waitFor();
    console.log("ok: signing in on a fresh device keeps the account's progress (the device's newer, emptier copy doesn't overwrite it)");
    await app.close();
  }

  // --- share cards: no names or amounts unless an adult turns them on for that card ---
  for (const ageBand of ["18-25", "13-17"]) {
    const app = await open(learner({ ageBand }, {}, { goals: { goals: [newGoal({ id: "g1", templateId: "car", name: "Secret Car Fund", target: 5000, start: 1234, months: 24, today: day(-10) })] } }));
    const { page, top, button, clean } = app;
    await app.menu("Goals");
    await page.getByText("Secret Car Fund").first().click();
    await button("Share").click();
    const img = top().getByRole("img");
    await img.waitFor();
    const alt = await img.getAttribute("alt");
    assert.match(alt, /^\d+% of the way to a goal — Saving with a plan$/);
    for (const x of ["Secret Car Fund", "1,234", "5,000"]) assert.ok(!alt.includes(x), `the card shows "${x}"`);
    const details = top().getByRole("switch", { name: "Show the goal's name and amounts" });
    if (ageBand === "13-17") {
      assert.equal(await details.count(), 0, "13–17: there's no option to show them");
      await top().getByText("No names, amounts or location on the card.").waitFor();
    } else {
      await details.click();
      await page.waitForFunction(() => /Secret Car Fund: \$1,234 of \$5,000/.test(document.querySelector("[role=dialog] img")?.alt || ""));
    }
    await clean(`share card (${ageBand})`);
    await app.close();
  }
  console.log("ok: share cards show no goal name or amounts; an adult can turn them on for one card, 13–17 can't");

  // --- an invite link: a streak freeze each when the friend finishes a first lesson ---
  {
    const inviter = await open(learner({ ageBand: "18-25", nickname: "Leo" }, { counters: { lessons: 3 }, freezes: 1, lessonDays: lessonDays3() }));
    await inviter.menu("Invite");
    await inviter.button("Get my link").click();
    const link = await inviter.page.getByText(/\?invite=/).innerText();
    const friend = await open();
    await friend.page.goto(link);
    await onboard(friend);
    await play(friend);
    await friend.page.getByText("You and the friend who invited you each got a streak freeze.").waitFor();
    await friend.close();
    await inviter.page.reload();
    await inviter.page.getByText("1 friend finished a first lesson through your link: a streak freeze for you.").waitFor();
    await inviter.page.waitForFunction(() => JSON.parse(localStorage.getItem("northvale-learn-v1")).progress.freezes === 2);
    console.log("ok: an invite link: the friend's first lesson gives each of them a streak freeze");
    await inviter.close();
  }

  // --- the landing page and its waitlist, in English and Spanish ---
  const LANDING = [
    { path: "welcome", lang: "en", country: "US", tagline: "Find your open water.", story: "Find your open water", promise: "Our promise", labels: ["Email", "Country", "I'm a…", "Age range"], join: "Join the waitlist", young: "Northvale Learn is for ages 13 and up, so we can't add you to the list.", teen: "Please check with a parent or guardian before you join the list.", guardian: "A parent or guardian says it's OK.", guardianErr: "Check with a parent or guardian first, then tick the box.", done: "You're on the list.", leaveNow: "Changed your mind? Take me off the list", leaveLink: "Take me off the list", left: "You're off the list.", teacher: "Join as a teacher", privacy: "privacy policy", heading: "Privacy Policy" },
    { path: "bienvenida", lang: "es", country: "MX", tagline: "Rumbo a mar abierto.", story: "Rumbo a mar abierto", promise: "Nuestra promesa", labels: ["Correo", "País", "Soy…", "Edad"], join: "Unirme a la lista de espera", young: "Northvale Learn es para mayores de 13 años, así que no podemos agregarte a la lista.", teen: "Antes de unirte a la lista, pregúntale a tu mamá, papá o tutor.", guardian: "Mi mamá, papá o tutor está de acuerdo.", guardianErr: "Primero pregúntale a tu mamá, papá o tutor y luego marca la casilla.", done: "Ya estás en la lista.", leaveNow: "¿Cambiaste de opinión? Sácame de la lista", leaveLink: "Sácame de la lista", left: "Ya saliste de la lista.", teacher: "Unirme como docente", privacy: "aviso de privacidad", heading: "Aviso de privacidad" },
  ];
  for (const L of LANDING) {
    const context = await browser.newContext({ viewport: { width: 390, height: 800 }, locale: L.lang === "es" ? "es-MX" : "en-US", serviceWorkers: "block", reducedMotion: "reduce" });
    const page = await context.newPage();
    current = page;
    page.setDefaultTimeout(5000);
    const errors = [];
    const outside = [];
    page.on("console", (m) => m.type() === "error" && errors.push(m.text()));
    page.on("pageerror", (e) => errors.push(String(e)));
    page.on("request", (r) => !r.url().startsWith(BASE) && !r.url().startsWith("data:") && outside.push(r.url()));
    await page.goto(BASE + L.path);
    // Every picture loads (scrolling past the lazy ones), nothing from other sites, clean text.
    await page.evaluate(async () => {
      for (const img of document.images) {
        img.scrollIntoView({ block: "center", inline: "center" });
        // (stay on each one until it has loaded, or 4 seconds)
        await new Promise((r) => (img.complete && img.naturalWidth ? r() : (img.addEventListener("load", r, { once: true }), img.addEventListener("error", r, { once: true }), setTimeout(r, 4000))));
      }
    });
    await page.waitForFunction(() => [...document.images].every((i) => i.complete && i.naturalWidth > 0));
    const text = await page.evaluate(() => document.body.innerText);
    assert.deepEqual(text.match(BROKEN) || [], [], `${L.path}: broken text`);
    assert.ok(!text.includes("{{"), `${L.path}: an unfilled address`);
    assert.equal(await page.evaluate(() => document.documentElement.scrollWidth > innerWidth), false, `${L.path}: no sideways scrolling on a phone`);
    assert.equal(await page.locator("header .mark svg.logo").count(), 1, `${L.path}: the logo in the header`);
    await page.getByText(L.tagline, { exact: true }).waitFor();
    await page.getByRole("heading", { name: L.story, exact: true }).waitFor();
    assert.ok((await page.getByRole("link", { name: L.promise }).count()) >= 1, `${L.path}: a link to ${L.promise}`);
    const [email, country, role, age] = L.labels.map((x) => page.getByLabel(x, { exact: false }).first());
    // Under 13: no sign-up.
    await age.selectOption("under13");
    await page.getByText(L.young).waitFor();
    assert.equal(await page.getByRole("button", { name: L.join }).isDisabled(), true, "under 13 can't sign up");
    // 13–17: a parent or guardian first.
    await email.fill(`teen-${L.lang}@example.test`);
    await country.selectOption(L.country);
    await role.selectOption("student");
    await age.selectOption("13-17");
    await page.getByText(L.teen).waitFor();
    await page.getByRole("button", { name: L.join }).click();
    await page.getByText(L.guardianErr).waitFor();
    await page.getByLabel(L.guardian).check();
    await page.getByRole("button", { name: L.join }).click();
    await page.getByText(L.done).waitFor();
    if (L.lang === "en") {
      await page.getByRole("button", { name: L.leaveNow }).click();
    } else {
      // From the link in the confirmation email (printed here: no email service).
      await page.waitForTimeout(200);
      const link = (/(http:\/\/\S+\/bienvenida\?leave=[\w.-]+)/.exec(serverOut) || [])[1];
      assert.ok(link, "the confirmation email has a take-me-off link");
      await page.goto(link);
      await page.getByRole("button", { name: L.leaveLink, exact: true }).click();
    }
    await page.getByText(L.left).waitFor();
    // The teacher button picks "Teacher"; the privacy policy opens in this language.
    await page.goto(BASE + L.path);
    await page.getByRole("link", { name: L.teacher }).click();
    assert.equal(await role.inputValue(), "teacher");
    await page.getByRole("link", { name: L.privacy }).first().click();
    await page.getByRole("heading", { name: L.heading }).waitFor({ timeout: 10000 }); // (the app loads first; slower when the machine is busy)
    assert.deepEqual(errors, [], `${L.path}: console errors`);
    assert.deepEqual(outside, [], `${L.path}: requests to other sites`);
    await context.close();
  }
  console.log("ok: the landing page and waitlist in English and Spanish: real screenshots load, nothing from other sites, under 13 blocked, 13–17 with a parent's or guardian's OK, on and off the list (also from the email's link), the teacher button, the privacy policy");

  // --- a learner who has finished every lesson ---
  {
    const day = new Date().toLocaleDateString("en-CA", { timeZone: "America/Mexico_City" });
    const lessons = Object.fromEntries(ALL_LESSONS.map((l) => [l.id, { done: true, at: day, last: day, best: 0, times: 1 }]));
    const seed = { version: 1, updatedAt: 1, profile: { onboarded: true, nickname: "", ageBand: "18-25", avatar: 0 }, settings: { lang: "en", region: "US", look: "white", reduceMotion: true }, progress: { xp: 600, days: {}, streak: { count: 0, last: null, best: 0, frozen: [] }, freezes: 1, dailyGoal: 20, lessons, lessonDays: [], badges: {}, counters: {}, practiced: {}, startUnit: "budget", placed: [] }, modules: {} };
    const app = await open(seed);
    const { page, top, button, clean, menu, shut } = app;
    await page.getByText("You finished the whole course. Open water ahead.").waitFor();
    console.log("ok: finishing the whole course: “Open water ahead.”");

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
    for (const u of FULL_UNITS) for (const l of u.lessons) for (const s of l.steps) if (s.type === "action" && !firsts.has(s.kind)) firsts.set(s.kind, { ...l, unit: u.id });
    await menu("Learn");
    for (const [kind, lesson] of firsts) {
      const unit = page.getByRole("button", { name: new RegExp(`^Unit ${UNITS.findIndex((u) => u.id === lesson.unit) + 1} · `) });
      if ((await unit.getAttribute("aria-expanded")) === "false") await unit.click();
      await page.getByRole("button", { name: new RegExp(`^${esc(lesson.title.en)} — `) }).click();
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
