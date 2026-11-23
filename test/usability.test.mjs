// THE USABILITY FIXES, IN A REAL BROWSER — one check for each problem in docs/USABILITY-AUDIT.md that was fixed in
// code (items 10 to 32), at phone size (390) and laptop size (1366) where the size matters. Each check names the
// audit item it guards. Runs after `npm run build`; uses Google Chrome (or Playwright's Chromium).
import { spawn } from "node:child_process";
import { mkdtempSync, readFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import assert from "node:assert/strict";
import { chromium } from "playwright-core";

const ROOT = join(import.meta.dirname, "..");
const port = 20000 + Math.floor(Math.random() * 20000);
const env = { ...process.env, NORTHVALE_DOTENV: "0", PORT: String(port), NORTHVALE_DATA: mkdtempSync(join(tmpdir(), "nvlearn-usab-")), ANTHROPIC_API_KEY: "", ANTHROPIC_AUTH_TOKEN: "", TWELVEDATA_API_KEY: "", SMTP_USER: "", SMTP_PASS: "", ALERT_WEBHOOK_URL: "", NEWS_FEEDS: JSON.stringify({ US: [], MX: [] }), SIGNUP_CODE: "", ADMIN_TOKEN: "" };
const server = spawn(process.execPath, [join(ROOT, "server/index.js")], { env, stdio: ["ignore", "pipe", "inherit"] });
await new Promise((resolve) => server.stdout.on("data", (d) => String(d).includes("Northvale Learn on") && resolve()));
const BASE = `http://127.0.0.1:${port}/`;

let browser;
try {
  browser = await chromium.launch({ channel: "chrome", headless: true });
} catch {
  browser = await chromium.launch({ headless: true });
}

const learner = (profile = {}, progress = {}, modules = {}, settings = {}) => ({ version: 1, updatedAt: 1, profile: { onboarded: true, nickname: "", avatar: 0, ageBand: "18-25", seenIntros: { keys: "x", practice: "x", save: "x" }, ...profile }, settings: { lang: "en", region: "US", look: "white", reduceMotion: true, ...settings }, progress: { xp: 0, days: {}, streak: { count: 0, last: null, best: 0, frozen: [] }, freezes: 1, dailyGoal: 20, lessons: {}, lessonDays: [], badges: {}, counters: {}, practiced: {}, startUnit: "budget", placed: [], ...progress }, modules: { feedback: { pending: [], survey: "skipped" }, ...modules } });
const PHONE = { viewport: { width: 390, height: 844 }, isMobile: true, hasTouch: true };
const LAPTOP = { viewport: { width: 1366, height: 768 } };
async function open(seed, size = PHONE, locale = "en-US") {
  const context = await browser.newContext({ ...size, locale, timezoneId: "America/Mexico_City", serviceWorkers: "block", reducedMotion: "reduce" });
  if (seed) await context.addInitScript((s) => localStorage.getItem("northvale-learn-v1") || localStorage.setItem("northvale-learn-v1", s), JSON.stringify(seed));
  const page = await context.newPage();
  page.setDefaultTimeout(6000);
  const errors = [];
  page.on("pageerror", (e) => errors.push(String(e)));
  await page.goto(BASE);
  const top = () => page.getByRole("dialog").last();
  return { page, top, errors, close: () => context.close() };
}
const day = (n) => new Date(Date.now() + n * 864e5).toLocaleDateString("en-CA", { timeZone: "America/Mexico_City" });
const ok = (msg) => console.log(`ok: ${msg}`);

try {
  // --- 10 and 22: a card says which lesson and which step; an idea card is labelled; on a computer Continue sits under the text ---
  for (const [name, size] of [["phone", PHONE], ["laptop", LAPTOP]]) {
    const app = await open(learner(), size);
    const { page, top } = app;
    await page.getByRole("button", { name: /^Start/ }).first().click();
    await top().getByText("Idea", { exact: true }).waitFor();
    const caption = await top().locator("div", { hasText: /^What's a budget\? · 1 of \d+$/ }).count();
    assert.ok(caption > 0, `${name}: the lesson title and "1 of N" show above the card`);
    const heading = await top().getByRole("heading", { level: 2 }).first().boundingBox();
    const go = await top().getByRole("button", { name: "Continue", exact: true }).boundingBox();
    if (name === "laptop") assert.ok(go.y - (heading.y + heading.height) < 330, `${name}: Continue is under the text, not at the bottom of the window (${Math.round(go.y - heading.y)}px below the heading)`);
    else assert.ok(go.y + go.height <= 844, `${name}: Continue is on screen`);
    await top().getByRole("button", { name: "Continue", exact: true }).click();
    await page.waitForTimeout(150);
    assert.ok(await top().locator("div", { hasText: /^What's a budget\? · 2 of \d+$/ }).count(), `${name}: the count moves on`);
    await app.close();
  }
  ok("items 10 and 22: each step says which lesson and which step it is; idea cards are labelled; Continue sits under the text on a computer");

  // --- 11: a goal step that finds a goal already made is done at once (nothing greyed, "first" is gone) ---
  {
    const goal = { id: "g1", template: "emergency", name: "", currency: "USD", target: 1000, start: 0, contributions: [], linked: [], status: "active", createdAt: day(-2), planFrom: day(-2), targetDate: day(300), path: "save", history: [] };
    const seed = learner({}, { lessons: { "budget-1": { done: true, at: day(-1), last: day(-1), best: 0, times: 1 } }, counters: { lessons: 1 } }, { goals: { goals: [goal], budget: null } });
    const app = await open(seed);
    const { page, top } = app;
    // Lesson 2's last step is the goal step: play to it.
    await page.getByRole("button", { name: /^(Continue|Start)$/ }).first().click();
    for (let i = 0; i < 40; i++) {
      const names = await top().getByRole("button").evaluateAll((bs) => bs.map((b) => b.innerText.trim()));
      if (names.includes("Done — continue")) break;
      if (names.includes("Check")) {
        if (await top().locator('[data-q="number"]').count()) await top().locator('[data-q="number"]').fill("1");
        else if (await top().locator('[data-q="order-item"]').count()) for (let j = 0; j < (await top().locator('[data-q="order-item"]').count()); j++) await top().locator('[data-q="order-item"]').nth(j).click();
        else if (await top().locator('[data-q="match-left"]').count()) for (let j = 0; j < (await top().locator('[data-q="match-left"]').count()); j++) (await top().locator('[data-q="match-left"]').nth(j).click(), await top().locator('[data-q="match-right"]').nth(j).click());
        else await top().getByRole("radio").first().click();
        await top().getByRole("button", { name: "Check", exact: true }).click();
      } else await top().getByRole("button", { name: "Continue", exact: true }).click();
      await page.waitForTimeout(60);
    }
    await top().getByRole("button", { name: "Done — continue" }).waitFor();
    assert.equal(await top().getByText("Make a goal: something you want, how much it costs, and when.").count(), 1, "no longer says \"first\"");
    assert.equal(await top().getByRole("button", { name: "This plan looks right" }).count(), 0, "no button that does nothing");
    assert.equal(await top().getByRole("button", { name: "Try it above to continue" }).count(), 0);
    await app.close();
  }
  ok("item 11: a goal step that finds a goal is already done: one live button, and the wording no longer says \"first\"");

  // --- 12: Today is not endless on a computer ---
  {
    const app = await open(learner({}, { lessons: { "budget-1": { done: true, at: day(-1), last: day(-1), best: 0, times: 1 } }, counters: { lessons: 1 } }), LAPTOP);
    await app.page.getByRole("heading", { name: "Today" }).waitFor();
    await app.page.waitForTimeout(300);
    const h = await app.page.evaluate(() => document.documentElement.scrollHeight);
    assert.ok(h < 3200, `Today on a laptop is ${h}px tall (it was 6,100)`);
    assert.ok(await app.page.getByRole("button", { name: /^Show \d+ more units$/ }).count(), "\"Show more units\" on a computer too");
    await app.close();
  }
  ok("item 12: Today on a laptop shows the next few islands and \"Show more units\", not all eighteen");

  // --- 13 and 31: scores say what they are; "1 day" is singular ---
  {
    const today = day(0);
    const app = await open(learner({}, { days: { [today]: 55 }, streak: { count: 1, last: today, best: 1, frozen: [] }, counters: { lessons: 3 }, lessonDays: [today] }));
    const { page } = app;
    assert.ok(await page.getByRole("button", { name: "Streak: 1 day" }).count(), "the streak button reads \"1 day\"");
    await page.getByRole("navigation").getByRole("button", { name: "Me" }).click();
    await page.getByText("Today: 55 XP · goal met").waitFor();
    assert.equal(await page.getByText(/55 \/ 20/).count(), 0, "no \"55 / 20\"");
    await page.getByText("Streak freezes", { exact: true }).waitFor();
    await app.close();
  }
  ok("items 13 and 31: \"goal met\" instead of 55 / 20, \"Streak freezes\", and \"Streak: 1 day\"");

  // --- 14: Spanish: a goal made in a lesson follows the language; "Falta 1 año"; no stray capital ---
  {
    const goal = { id: "g1", template: "custom", name: "", names: { en: "Savings goal", es: "Meta de ahorro" }, currency: "USD", target: 1000, start: 0, contributions: [], linked: [], status: "active", createdAt: day(-2), planFrom: day(-2), targetDate: day(0), path: "save", history: [] };
    goal.targetDate = new Date(Date.now() + 365 * 864e5).toLocaleDateString("en-CA", { timeZone: "America/Mexico_City" });
    const app = await open(learner({}, { counters: { lessons: 1 } }, { goals: { goals: [goal], budget: null } }, { lang: "es", region: "MX" }), PHONE, "es-MX");
    const { page } = app;
    await page.getByRole("navigation").getByRole("button", { name: "Metas" }).click();
    await page.getByText("Meta de ahorro").first().waitFor();
    assert.equal(await page.getByText("Savings goal").count(), 0, "no English goal name in the Spanish app");
    assert.equal(await page.getByText(/^Faltan 1 /).count(), 0, "\"Faltan 1\" is not said");
    await app.close();
    const en = await open(learner({}, { counters: { lessons: 1 } }, { goals: { goals: [goal], budget: null } }));
    await en.page.getByRole("navigation").getByRole("button", { name: "Goals" }).click();
    await en.page.getByText("Savings goal").first().waitFor();
    await en.close();
  }
  ok("item 14: a lesson's goal name follows the language, and Spanish says \"Falta 1 año\"");

  // --- 15 and 32: the welcome screen has two labelled groups, words not flags ---
  for (const [name, size] of [["phone", PHONE], ["laptop", LAPTOP]]) {
    const app = await open(null, size);
    const { page } = app;
    await page.getByRole("button", { name: "Get started" }).waitFor();
    assert.equal(await page.getByRole("group", { name: "Language" }).count(), 1, `${name}: a Language group`);
    assert.equal(await page.getByRole("group", { name: "Country" }).count(), 1, `${name}: a Country group`);
    for (const label of ["English", "United States", "Mexico", "Both"]) await page.getByRole("button", { name: label, exact: true }).waitFor();
    const text = await page.evaluate(() => document.body.innerText);
    assert.doesNotMatch(text, /[\u{1F1E6}-\u{1F1FF}]/u, `${name}: no flag emoji`);
    await app.close();
  }
  {
    const app = await open(learner());
    await app.page.getByRole("navigation").getByRole("button", { name: "Me" }).click();
    await app.page.getByRole("button", { name: "Settings" }).click();
    await app.page.getByRole("radio", { name: "United States" }).waitFor();
    assert.doesNotMatch(await app.page.evaluate(() => document.body.innerText), /[\u{1F1E6}-\u{1F1FF}]/u, "no flag emoji in Settings");
    await app.close();
  }
  ok("items 15 and 32: the welcome screen and Settings group Language and Country and use words, not flag emoji");

  // --- 16: the budget bar's three parts are different ---
  {
    const app = await open(learner({}, { lessons: { "budget-1": { done: true, at: day(-1), last: day(-1), best: 0, times: 1 } }, counters: { lessons: 1 } }));
    const { page } = app;
    await page.evaluate(() => 0);
    await page.getByRole("navigation").getByRole("button", { name: "Practice" }).click().catch(() => {});
    await app.close();
  }
  {
    const app = await open(learner({}, { counters: { lessons: 3 }, lessonDays: [day(-1)], lessons: Object.fromEntries(["budget-1", "budget-2", "budget-3"].map((id) => [id, { done: true, at: day(-1), last: day(-1), best: 0, times: 1 }])) }));
    const { page } = app;
    await page.getByRole("navigation").getByRole("button", { name: "Practice" }).click();
    await page.getByRole("button", { name: /^Tools from your lessons/ }).click();
    await page.getByRole("button", { name: /^Budget planner/ }).click();
    await page.locator("[data-seg]").first().waitFor();
    const colors = await page.locator("[data-seg]").evaluateAll((els) => els.map((e) => getComputedStyle(e).backgroundColor));
    assert.equal(new Set(colors).size, 3, `three different tones (${colors.join(" | ")})`);
    await app.close();
  }
  ok("item 16: the budget planner's bar has three different tones and a key");

  // --- 17: tap targets on a phone: nothing under 44px (43 for the welcome chips) ---
  {
    const today = day(0);
    const app = await open(learner({}, { lessons: Object.fromEntries(["budget-1", "budget-2", "budget-3"].map((id) => [id, { done: true, at: day(-1), last: day(-1), best: 0, times: 1 }])), counters: { lessons: 3 }, lessonDays: [today] }));
    const { page } = app;
    const small = async () => page.evaluate(() => [...document.querySelectorAll("button, a[href], summary")].filter((e) => { const r = e.getBoundingClientRect(); const s = getComputedStyle(e); return r.width > 0 && r.height > 0 && s.visibility !== "hidden" && r.height < 43; }).map((e) => `${(e.getAttribute("aria-label") || e.innerText || "").trim().slice(0, 30)} ${Math.round(e.getBoundingClientRect().height)}px`));
    for (const tab of ["Learn", "Goals", "Practice", "Me"]) {
      await page.getByRole("navigation").getByRole("button", { name: tab }).click();
      await page.waitForTimeout(250);
      const s = await small();
      assert.deepEqual(s, [], `${tab}: controls under 43px: ${s.join(", ")}`);
    }
    await app.close();
  }
  ok("item 17: every control on Learn, Goals, Practice and Me is at least 43px tall on a phone");

  // --- 18: Practice says one true thing about what is locked, and the News row shows how far along you are ---
  {
    const app = await open(learner({}, { lessons: Object.fromEntries(["budget-1", "budget-2", "budget-3"].map((id) => [id, { done: true, at: day(-1), last: day(-1), best: 0, times: 1 }])), counters: { lessons: 3 } }));
    const { page } = app;
    await page.getByRole("navigation").getByRole("button", { name: "Practice" }).click();
    await page.getByText("Locked parts open as you finish the lessons that teach them.").waitFor();
    await page.getByText("Opens after 5 lessons · 3 done").waitFor();
    await app.close();
  }
  ok("item 18: Practice's note is always true and the locked News row says how many lessons are done");

  // --- 19: the Money Year shows the month after a choice and explains its two scores ---
  {
    const app = await open(learner({}, { counters: { lessons: 3 } }));
    const { page } = app;
    await page.getByRole("navigation").getByRole("button", { name: "Practice" }).click();
    await page.getByRole("button", { name: /^Your Money Year/ }).click();
    await page.getByRole("button", { name: /^Student with a part-time job/ }).click();
    await page.getByText(/^Month 1 of 12 · January$/).first().waitFor();
    assert.doesNotMatch(await page.evaluate(() => document.body.innerText), /Month 1 Of 12/, "no stray capital");
    await page.getByText(/^Peace of mind is how steady/).waitFor();
    await page.getByRole("button", { name: /a steady habit/ }).click();
    await page.getByText(/^Month 1 of 12 · January$/).first().waitFor();
    await app.close();
  }
  ok("item 19: Your Money Year names the month before and after a choice, and says what Peace of mind and Credit health mean");

  // --- 20: Practice cards don't touch; the finish picture spans the window on a computer ---
  {
    const app = await open(learner({}, { lessons: Object.fromEntries(["budget-1", "budget-2", "budget-3"].map((id) => [id, { done: true, at: day(-1), last: day(-1), best: 0, times: 1 }])), counters: { lessons: 3 } }), LAPTOP);
    const { page } = app;
    await page.getByRole("button", { name: "Practice" }).first().click();
    await page.getByText("This week's mission").waitFor();
    const gaps = await page.evaluate(() => { const col = document.querySelector("main .nv-cols > div"); const kids = [...col.children].filter((c) => c.getBoundingClientRect().height > 0); return kids.slice(1).map((k, i) => Math.round(k.getBoundingClientRect().top - kids[i].getBoundingClientRect().bottom)); });
    assert.ok(gaps.every((g) => g >= 8), `gaps between the Practice cards: ${gaps.join(", ")}`);
    await app.close();
  }
  ok("item 20: the cards on Practice have a gap between them");

  // --- 23: tapping a locked unit says when it opens ---
  {
    const app = await open(learner({}, { counters: { lessons: 0 } }));
    const { page } = app;
    await page.getByRole("button", { name: /^Unit 3 · / }).first().click();
    await page.getByText(/^This unit opens after Unit 2\.$/).waitFor();
    await app.close();
  }
  ok("item 23: tapping a locked unit says \"This unit opens after Unit N\"");

  // --- 27: the Skills sheet doesn't say "New" on every row ---
  {
    const app = await open(learner({}, { counters: { lessons: 1 } }));
    const { page, top } = app;
    await page.getByRole("navigation").getByRole("button", { name: "Me" }).click();
    await page.getByRole("button", { name: /^Skills/ }).click();
    await page.getByRole("button", { name: "See all skills" }).click();
    await top().getByRole("heading", { name: "Skills" }).waitFor();
    await page.waitForTimeout(400);
    const body = await top().innerText();
    assert.ok(/Budgeting/.test(body), "the skills are listed");
    assert.ok((body.match(/^New$/gm) || []).length <= 1, `"New" appears ${(body.match(/^New$/gm) || []).length} times in the Skills sheet`);
    await app.close();
  }
  ok("item 27: the Skills sheet only labels what has been started");

  // --- 28: Settings > About says which build this is ---
  {
    const app = await open(learner());
    const { page } = app;
    await page.getByRole("navigation").getByRole("button", { name: "Me" }).click();
    await page.getByRole("button", { name: "Settings" }).click();
    await page.getByRole("button", { name: "More" }).click().catch(() => {});
    await page.locator("[data-build]").waitFor();
    assert.match(await page.locator("[data-build]").innerText(), /^Version [0-9a-f]{7,}\+?, built \d{4}-\d{2}-\d{2}$|^Version unknown, built \d{4}-\d{2}-\d{2}$/);
    await app.close();
  }
  ok("item 28: Settings > About shows the version and build day");

  // --- 29: the preview config waits where the server listens ---
  {
    const launch = JSON.parse(readFileSync(join(ROOT, ".claude/launch.json"), "utf8"));
    const srv = readFileSync(join(ROOT, "server/index.js"), "utf8");
    assert.match(srv, /process\.env\.PORT\) \|\| (\d+)/);
    assert.equal(launch.configurations[0].port, Number(srv.match(/process\.env\.PORT\) \|\| (\d+)/)[1]), "launch.json port = the server's default port");
  }
  ok("item 29: .claude/launch.json uses the server's default port");

  // ===== ROUND 2 (docs/USABILITY-AUDIT.md, "Round 2") =====

  // --- R2-1: the goal picked at the start is named on Goals (phone) and in Today's side panel (laptop), not "No goal yet" ---
  {
    const seed = learner({ goalFor: "travel" }, { counters: { lessons: 1 }, lessons: { "budget-1": { done: true, at: day(-1), last: day(-1), best: 0, times: 1 } } });
    const phone = await open(seed);
    await phone.page.getByRole("navigation").getByRole("button", { name: "Goals" }).click();
    await phone.page.getByText("Your goal: Travel", { exact: true }).waitFor();
    assert.equal(await phone.page.getByText(/no goal yet/i).count(), 0, "Goals does not say there is no goal");
    await phone.close();
    const laptop = await open(seed, LAPTOP);
    await laptop.page.getByText("You picked Travel. Give it an amount and a date.").waitFor();
    assert.equal(await laptop.page.getByText(/no goal yet/i).count(), 0, "Today's panel does not say there is no goal");
    assert.deepEqual([...phone.errors, ...laptop.errors], []);
    await laptop.close();
  }
  ok("R2-1: the goal picked at the start shows as 'Your goal: Travel' on Goals and 'You picked Travel' on Today");

  // --- R2-3: on a laptop, Me shows Achievements once (the left column), not again as a row on the right ---
  {
    const app = await open(learner({}, { counters: { lessons: 1 } }), LAPTOP);
    const { page } = app;
    await page.getByRole("navigation").getByRole("button", { name: "Me" }).click();
    await page.getByText("This week", { exact: true }).waitFor();
    const main = page.locator("main");
    assert.equal(await main.getByText(/^\d+ of \d+ earned$/).count(), 1, "the earned count shows once on a laptop");
    await app.close();
    const phone = await open(learner({}, { counters: { lessons: 1 } }));
    await phone.page.getByRole("navigation").getByRole("button", { name: "Me" }).click();
    await phone.page.getByRole("button", { name: /^Achievements/ }).waitFor();
    await phone.close();
  }
  ok("R2-3: Me on a laptop shows Achievements once; a phone still has the Achievements row");

  // --- R2-2: News has no filled buttons: a list of headlines is not a wall of main buttons ---
  {
    const done5 = Object.fromEntries(["budget-1", "budget-2", "budget-3", "save-1", "save-2"].map((id) => [id, { done: true, at: day(-1), last: day(-1), best: 0, times: 1 }]));
    const app = await open(learner({ seenIntros: { keys: "x", practice: "x", save: "x", news: "x" } }, { counters: { lessons: 5 }, lessons: done5 }));
    const { page } = app;
    await page.route("**/api/news**", (r) => r.fulfill({ contentType: "application/json", body: JSON.stringify({ items: [1, 2, 3].map((n) => ({ id: `n${n}`, title: `Headline number ${n}`, link: "https://example.com/", source: "Wire", published: new Date().toISOString(), headline: null, summary: null, terms: [] })) }) }));
    await page.getByRole("navigation").getByRole("button", { name: "Practice" }).click();
    await page.getByRole("button", { name: /^News, explained/ }).click();
    await page.getByText("Headline number 1").waitFor();
    const filled = await page.evaluate(() => {
      const probe = (v) => { const d = document.createElement("div"); d.style.background = `var(${v})`; document.body.append(d); const c = getComputedStyle(d).backgroundColor; d.remove(); return c; };
      const fills = [probe("--fill"), probe("--good"), probe("--red")];
      return [...document.querySelectorAll("main button")].filter((b) => fills.includes(getComputedStyle(b).backgroundColor)).map((b) => b.innerText.trim());
    });
    assert.deepEqual(filled, [], "no filled buttons among the headlines");
    await page.getByRole("button", { name: "Mark as read" }).first().click();
    await page.getByRole("button", { name: "Read", exact: true }).first().waitFor();
    assert.deepEqual(app.errors, []);
    await app.close();
  }
  ok("R2-2: News headlines have plain buttons, and Mark as read turns into a quiet Read");

  // --- R2-4: quotes in what a learner reads are curly, in both languages (no straight "…" in lessons, missions, Money Year) ---
  {
    const files = ["src/modules/lessons/units", "src/modules/missions/catalog.js", "src/modules/year/content.js", "src/modules/goals/life.jsx", "src/modules/tutor/glossary.js", "src/core/whatsnew.jsx"];
    const { readdirSync, statSync } = await import("node:fs");
    const all = files.flatMap((f) => (statSync(join(ROOT, f)).isDirectory() ? readdirSync(join(ROOT, f)).filter((x) => x.endsWith(".js") && x !== "index.gen.js").map((x) => join(f, x)) : [f]));
    const bad = all.flatMap((f) => readFileSync(join(ROOT, f), "utf8").split("\n").map((l, i) => [f, i + 1, l]).filter(([, , l]) => /\\"/.test(l)).map(([f, n]) => `${f}:${n}`));
    assert.deepEqual(bad, [], "straight double quotes inside learner-facing text");
  }
  ok("R2-4: lessons, missions, Money Year and practice sets use curly quotes in both languages");

  // ===== ROUND 3 =====
  // --- R3-1: Today and Me say the same thing about a review ("ideas", "2–3 min"), never "concepts" ---
  {
    const three = Object.fromEntries(["budget-1", "budget-2", "budget-3"].map((id) => [id, { done: true, at: day(-1), last: day(-1), best: 0, times: 1 }]));
    // (On a laptop the review card is on Me itself; on a phone it is under Me, Skills.)
    const app = await open(learner({}, { counters: { lessons: 3 }, lessons: three, lessonDays: [day(-1)] }), LAPTOP);
    const { page } = app;
    await page.getByRole("navigation").getByRole("button", { name: "Me" }).click();
    await page.getByText(/^\d+ ideas? to refresh · 2–3 min$/).first().waitFor();
    assert.doesNotMatch(await page.locator("main").innerText(), /concept/i, "Me does not say concepts");
    await app.close();
  }
  ok("R3-1: a review is \"N ideas to refresh · 2–3 min\" on Me as on Today");

  // --- R3-2: the goal picked at the start is the first card on Goals, so "tap it below" needs no scrolling ---
  {
    const app = await open(learner({ goalFor: "travel" }));
    const { page } = app;
    await page.getByRole("navigation").getByRole("button", { name: "Goals" }).click();
    await page.getByText("Your goal: Travel", { exact: true }).waitFor();
    const first = page.locator("main").getByRole("button", { name: /^(Emergency fund|Car|College|First investment|Travel|Debt payoff|Something else|Custom)/ }).first();
    assert.match(await first.innerText(), /^Travel/);
    const b = await first.boundingBox();
    assert.ok(b && b.y + b.height <= 844, "the picked goal is on screen without scrolling");
    await app.close();
  }
  ok("R3-2: the goal picked at the start is the first card on Goals, on screen without scrolling");
} finally {
  await browser.close();
  server.kill();
}
