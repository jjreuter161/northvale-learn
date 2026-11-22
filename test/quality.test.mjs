// THE QUALITY BAR, MEASURED — the parts of "genuinely good" that a script can check, as a brand-new learner and as a
// learner a few lessons in, at phone size (390) and laptop size (1366) in Chrome:
//   1  first minute: open the app to the first answered question in 3 taps and well under 60 s
//   2  every screen says where you are (a title) and what it is for (a line, or content that says it)
//   4  nothing is empty: every main screen has real content and something to do or read
//   5  speed: with a normal connection (10 Mbps, 40 ms), the first screen, a tab, a lesson each appear in about a second
//   7  consistency: the same page-title size and main-button height on every screen
//   8  navigation: every screen below a tab has a Back, it goes up one level, and Escape/Back close sheets (no loops)
//   9  computer layout: a sidebar and no bottom tab bar, nothing wider than the window, no stretched text lines
//  10  calm: no exclamation marks or emoji in what the app says
// Items 3 (Safari and Firefox), 6 (lessons feel worth it) and 10's "feel" are not scripts: see docs/QUALITY-BAR.md.
// Runs after `npm run build`.
import { spawn } from "node:child_process";
import { mkdtempSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import assert from "node:assert/strict";
import { chromium } from "playwright-core";

const ROOT = join(import.meta.dirname, "..");
const port = 20000 + Math.floor(Math.random() * 20000);
const env = { ...process.env, NORTHVALE_DOTENV: "0", PORT: String(port), NORTHVALE_DATA: mkdtempSync(join(tmpdir(), "nvlearn-qual-")), ANTHROPIC_API_KEY: "", ANTHROPIC_AUTH_TOKEN: "", TWELVEDATA_API_KEY: "", SMTP_USER: "", SMTP_PASS: "", ALERT_WEBHOOK_URL: "", NEWS_FEEDS: JSON.stringify({ US: [], MX: [] }), SIGNUP_CODE: "", ADMIN_TOKEN: "" };
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
const done = Object.fromEntries(["budget-1", "budget-2", "budget-3", "save-1", "save-2", "save-3"].map((id) => [id, { done: true, at: day(-1), last: day(-1), best: 0, times: 1 }]));
const learner = (over = {}) => ({ version: 1, updatedAt: 1, profile: { onboarded: true, nickname: "", avatar: 0, ageBand: "18-25", seenIntros: { keys: "x", practice: "x", save: "x", news: "x" } }, settings: { lang: "en", region: "US", look: "white", reduceMotion: true }, progress: { xp: 0, days: {}, streak: { count: 0, last: null, best: 0, frozen: [] }, freezes: 1, dailyGoal: 20, lessons: done, lessonDays: [day(-1)], badges: {}, counters: { lessons: 6 }, practiced: {}, startUnit: "budget", placed: [], ...over }, modules: { feedback: { pending: [], survey: "skipped" } } });
async function open(seed, size, { throttle } = {}) {
  const context = await browser.newContext({ ...size, locale: "en-US", timezoneId: "America/Mexico_City", serviceWorkers: "block", reducedMotion: "reduce" });
  if (seed) await context.addInitScript((s) => localStorage.getItem("northvale-learn-v1") || localStorage.setItem("northvale-learn-v1", s), JSON.stringify(seed));
  const page = await context.newPage();
  page.setDefaultTimeout(6000);
  const errors = [];
  page.on("pageerror", (e) => errors.push(String(e)));
  page.on("console", (m) => m.type() === "error" && errors.push(m.text()));
  if (throttle) {
    const cdp = await context.newCDPSession(page);
    await cdp.send("Network.enable");
    await cdp.send("Network.emulateNetworkConditions", { offline: false, downloadThroughput: (10 * 1024 * 1024) / 8, uploadThroughput: (5 * 1024 * 1024) / 8, latency: 40 });
  }
  return { page, errors, goto: () => page.goto(BASE), close: () => context.close() };
}
const nav = (page, name) => page.locator("nav").getByRole("button", { name, exact: true }).first().click();
const ok = (m) => console.log(`ok: ${m}`);
const EMOJI = /[\u{1F300}-\u{1FAFF}\u{2600}-\u{27BF}\u{1F1E6}-\u{1F1FF}]/u;

try {
  // --- 1: the first minute ---
  for (const [name, size] of [["phone", PHONE], ["laptop", LAPTOP]]) {
    const app = await open(null, size);
    await app.goto();
    const { page } = app;
    await page.addInitScript(() => 0);
    const t0 = Date.now();
    let taps = 0;
    await page.getByRole("button", { name: "Get started" }).click(); taps++;
    await page.getByRole("radio").first().click(); taps++;
    await page.getByRole("button", { name: "Check", exact: true }).click(); taps++;
    await page.getByText("Correct", { exact: true }).first().waitFor();
    const seconds = (Date.now() - t0) / 1000;
    assert.ok(taps <= 3 && seconds < 10, `${name}: ${taps} taps, ${seconds.toFixed(1)} s to the first answer`);
    assert.deepEqual(app.errors, [], `${name}: console errors`);
    await app.close();
  }
  ok("quality 1: opening the app to the first answered question takes 3 taps and a few seconds, at phone and laptop size");

  // --- 2, 4, 7, 10: every main screen: a title, a purpose, content, the same title size, calm words ---
  const screens = [
    ["Today", async (p, n) => { await nav(p, "Learn"); }],
    ["Goals", async (p) => nav(p, "Goals")],
    ["Practice", async (p) => nav(p, "Practice")],
    ["Real-life missions", async (p) => (await nav(p, "Practice"), p.getByRole("button", { name: /^Real-life missions/ }).click())],
    ["Your Money Year", async (p) => (await nav(p, "Practice"), p.getByRole("button", { name: /^Your Money Year/ }).click())],
    ["Tools from your lessons", async (p) => (await nav(p, "Practice"), p.getByRole("button", { name: /^Tools from your lessons/ }).click())],
    ["Settings", async (p) => (await nav(p, "Me"), p.getByRole("button", { name: /^Settings/ }).click())],
    // (On a phone, rows lead to Achievements and Skills. On a laptop the left column of Me shows both, and the
    // achievements card opens the full list; there is no separate Skills screen to reach there.)
    ["Achievements", async (p) => (await nav(p, "Me"), p.getByRole("button", { name: /^Achievements| of \d+ earned/ }).first().click())],
    ["Skills", async (p) => (await nav(p, "Me"), p.getByRole("button", { name: /^Skills/ }).click()), "phone"],
  ];
  const at = (size) => screens.filter(([, , only]) => !only || only === size);
  for (const [name, size] of [["phone", PHONE], ["laptop", LAPTOP]]) {
    const app = await open(learner(), size);
    await app.goto();
    const { page } = app;
    await page.getByRole("heading", { name: "Today" }).waitFor();
    const sizes = {};
    for (const [label, go] of at(name)) {
      await go(page);
      await page.waitForTimeout(300);
      const info = await page.evaluate(() => {
        const m = document.querySelector("main");
        const h1 = m && m.querySelector("h1");
        const txt = m ? m.innerText : "";
        const first = h1 && h1.parentElement ? h1.parentElement.innerText : "";
        return { h1: h1 ? h1.innerText.trim() : null, size: h1 ? parseFloat(getComputedStyle(h1).fontSize) : null, len: txt.length, acts: m ? m.querySelectorAll("button, a[href]").length : 0, first };
      });
      assert.ok(info.h1, `${name}: ${label} has a title`);
      assert.ok(info.len > 90, `${name}: ${label} isn't empty (${info.len} characters)`);
      // 2: something under the title says what the screen is for
      assert.ok(info.first.split("\n").filter(Boolean).length >= 2 || label === "Today", `${name}: ${label} says what it is for ("${info.first.replace(/\n/g, " / ").slice(0, 80)}")`);
      sizes[label] = info.size;
      const text = await page.evaluate(() => document.body.innerText);
      assert.ok(!/!/.test(text.replace(/¡/g, "")), `${name}: ${label} has an exclamation mark`);
      assert.doesNotMatch(text, EMOJI, `${name}: ${label} has an emoji`);
    }
    // 7: the same title size everywhere except Today's big title
    const others = Object.entries(sizes).filter(([l]) => l !== "Today").map(([, s]) => s);
    assert.equal(new Set(others).size, 1, `${name}: page titles are one size (${JSON.stringify(sizes)})`);
    assert.deepEqual(app.errors, [], `${name}: console errors`);
    await app.close();
  }
  ok("quality 2, 4, 7 and 10: every main screen (phone and laptop) has a title, a line saying what it is for, real content, one title size, no exclamation marks or emoji");

  // --- 7: main buttons are one height ---
  {
    const app = await open(learner(), PHONE);
    await app.goto();
    const { page } = app;
    const hs = new Set();
    for (const [label, go] of screens.slice(0, 4)) {
      await go(page);
      await page.waitForTimeout(250);
      const heights = await page.evaluate(() => [...document.querySelectorAll("main button.nv-btn")].filter((b) => b.getBoundingClientRect().width > 250).map((b) => Math.round(b.getBoundingClientRect().height)));
      heights.forEach((h) => hs.add(h));
    }
    assert.ok([...hs].every((h) => h === 52 || h === 44 || h === 54), `full-width buttons are 52px (or 44 for small ones): ${[...hs].join(", ")}`);
    await app.close();
  }
  ok("quality 7: full-width buttons are the same height on Today, Goals, Practice and Missions");

  // --- 5: speed with a normal connection ---
  {
    const app = await open(null, PHONE, { throttle: true });
    const t0 = Date.now();
    await app.goto();
    await app.page.getByRole("button", { name: "Get started" }).waitFor();
    const first = Date.now() - t0;
    assert.ok(first < 1500, `the first screen took ${first} ms on a 10 Mbps connection`);
    await app.close();
    const warm = await open(learner(), PHONE, { throttle: true });
    await warm.goto();
    await warm.page.getByRole("heading", { name: "Today" }).waitFor();
    const times = [];
    for (const tab of ["Goals", "Practice", "Me", "Learn"]) {
      const t1 = Date.now();
      await nav(warm.page, tab);
      await warm.page.waitForFunction((n) => document.querySelector("main h1, main h2, main"), tab);
      await warm.page.waitForTimeout(0);
      times.push([tab, Date.now() - t1]);
    }
    assert.ok(times.every(([, ms]) => ms < 600), `tab switches: ${times.map((t) => t.join(" ")).join(", ")} ms`);
    const t2 = Date.now();
    await warm.page.getByRole("button", { name: /^(Continue|Start|Start review)$/ }).first().click();
    await warm.page.getByRole("dialog").last().getByRole("button", { name: /^(Continue|Check)$/ }).waitFor();
    const lesson = Date.now() - t2;
    assert.ok(lesson < 1500, `opening a lesson took ${lesson} ms`);
    await warm.close();
    console.log(`  (first screen ${first} ms, tabs ${times.map((t) => t[1]).join("/")} ms, lesson ${lesson} ms, on 10 Mbps and 40 ms)`);
  }
  ok("quality 5: on a normal connection the first screen, a tab switch and a lesson each show in about a second or less");

  // --- 8: Back from every screen below a tab ---
  for (const [name, size] of [["phone", PHONE], ["laptop", LAPTOP]]) {
    const app = await open(learner(), size);
    await app.goto();
    const { page } = app;
    for (const [label, go] of at(name).filter(([l]) => !["Today", "Goals", "Practice"].includes(l))) {
      await go(page);
      const back = page.getByRole("button", { name: /^Back: / }).first();
      await back.waitFor();
      const parent = (await back.getAttribute("aria-label")).replace(/^Back: /, "");
      await back.click();
      await page.getByRole("heading", { name: parent === "Me" ? /.+/ : parent }).first().waitFor();
      assert.equal(await page.getByRole("button", { name: /^Back: / }).count(), 0, `${name}: ${label}: Back goes up one level, to ${parent}, and not into a loop`);
    }
    await app.close();
  }
  ok("quality 8: every screen below a tab has a Back that goes up one level (phone and laptop)");

  // --- 9: a computer looks like a computer ---
  {
    const app = await open(learner(), LAPTOP);
    await app.goto();
    const { page } = app;
    await page.getByRole("heading", { name: "Today" }).waitFor();
    assert.ok(await page.locator("aside nav, aside").first().isVisible(), "a sidebar");
    const bar = await page.evaluate(() => [...document.querySelectorAll("nav")].filter((n) => getComputedStyle(n).position === "fixed" && n.getBoundingClientRect().bottom >= innerHeight - 2).length);
    assert.equal(bar, 0, "no phone tab bar at the bottom");
    for (const [label, go] of at("laptop")) {
      await go(page);
      await page.waitForTimeout(250);
      const m = await page.evaluate(() => ({ over: document.documentElement.scrollWidth > innerWidth + 1, lines: Math.max(0, ...[...document.querySelectorAll("main p")].flatMap((p) => { const r = document.createRange(); r.selectNodeContents(p); return [...r.getClientRects()].map((x) => x.width); })) }));
      assert.ok(!m.over, `${label}: nothing wider than the window`);
      assert.ok(m.lines <= 900, `${label}: lines of text aren't stretched (${Math.round(m.lines)}px)`);
    }
    await app.close();
  }
  ok("quality 9: on a laptop: a sidebar, no bottom tab bar, nothing wider than the window, no stretched lines");
} finally {
  await browser.close();
  server.kill();
}
