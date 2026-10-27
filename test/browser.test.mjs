// THE APP IN A REAL BROWSER — headless Chrome clicks through the main
// flows on a throwaway server: onboarding, a full lesson, a Money Mission,
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
import { ALL_LESSONS } from "../src/modules/lessons/content.js";
import { MISSIONS } from "../src/modules/missions/catalog.js";
import { newGoal } from "../src/modules/goals/plan.js";
import { weekStart } from "../src/core/progress.js";

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
let serverOut = ""; // emailed links are printed here (no email service)
await new Promise((resolve) => server.stdout.on("data", (d) => ((serverOut += d), String(d).includes("Northvale Learn on") && resolve())));
const BASE = `http://127.0.0.1:${port}/`;
const post = (path, body, extra = {}) => fetch(`${BASE.slice(0, -1)}${path}`, { method: "POST", headers: { "X-Northvale": "1", "Content-Type": "application/json", ...extra }, body: JSON.stringify(body) }).then((r) => r.json());
const admin = (path, body) => post(path, body, { "X-Admin-Token": env.ADMIN_TOKEN });
// A new account (from outside the browser); returns its session cookie.
const account = (body) => fetch(`${BASE}api/auth/signup`, { method: "POST", headers: { "X-Northvale": "1", "Content-Type": "application/json" }, body: JSON.stringify({ password: "a long enough password", guardian: true, ...body }) }).then((r) => r.headers.get("set-cookie").split(";")[0]);
const day = (n) => new Date(Date.now() + n * 864e5).toLocaleDateString("en-CA", { timeZone: "America/Mexico_City" });
// A learner who's been through onboarding.
const learner = (profile, progress = {}, modules = {}) => ({ version: 1, updatedAt: 1, profile: { onboarded: true, nickname: "", avatar: 0, ...profile }, settings: { lang: "en", region: "US", look: "white", reduceMotion: true }, progress: { xp: 0, days: {}, streak: { count: 0, last: null, best: 0, frozen: [] }, freezes: 1, dailyGoal: 20, lessons: {}, lessonDays: [], badges: {}, counters: {}, practiced: {}, startUnit: "budget", placed: [], ...progress }, modules });

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
async function open(seed, { cookie } = {}) {
  const context = await browser.newContext({ viewport: { width: 390, height: 800 }, locale: "en-US", timezoneId: "America/Mexico_City", serviceWorkers: "block", reducedMotion: "reduce" });
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
    await page.getByText("Invites and sharing").waitFor();
    await page.getByText("classroom: off").waitFor();
    await clean("admin");
    console.log("ok: the admin page, with what brings people back");
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
      const app = await open(learner({ ageBand, nickname }), { cookie });
      await app.menu("Me");
      await app.page.getByText(sees, { exact: true }).waitFor();
      assert.equal(await app.page.getByText(never, { exact: true }).count(), 0, `${nickname} doesn't see ${never}`);
      if (ageBand === "13-17") await app.page.getByText("You're in a league with other learners aged 13–17 only.").waitFor();
      await app.clean(`league (${ageBand})`);
      await app.close();
    }
    console.log("ok: the everyone league keeps 13–17 and 18+ apart");
  }

  // --- share cards: no names or amounts unless an adult turns them on for that card ---
  for (const ageBand of ["18-25", "13-17"]) {
    const app = await open(learner({ ageBand }, {}, { goals: { goals: [newGoal({ id: "g1", templateId: "car", name: "Secret Car Fund", target: 5000, start: 1234, months: 24, today: day(-10) })] } }));
    const { page, top, button, clean } = app;
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
    const inviter = await open(learner({ ageBand: "18-25", nickname: "Leo" }, { counters: { lessons: 3 }, freezes: 1 }));
    await inviter.menu("Me");
    await inviter.button("Get my link").click();
    const link = await inviter.page.getByText(/\?invite=/).innerText();
    const friend = await open();
    await friend.page.goto(link);
    await friend.button("Get started").click();
    await friend.button(/^Save for something/).click();
    await friend.button(/^Car/).click();
    await friend.button("Continue").click();
    await friend.button(/^I'm new to this/).click();
    await friend.button(/^10 minutes a day/).click();
    await play(friend);
    await friend.page.getByText("You and the friend who invited you each got a streak freeze.").waitFor();
    await friend.close();
    await inviter.page.reload();
    await inviter.page.getByText("1 friend finished a first lesson through your link: a streak freeze for you.").waitFor();
    await inviter.page.waitForFunction(() => JSON.parse(localStorage.getItem("northvale-learn-v1")).progress.freezes === 2);
    console.log("ok: an invite link: the friend's first lesson gives each of them a streak freeze");
    await inviter.close();
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
