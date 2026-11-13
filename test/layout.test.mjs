// THE COMPUTER LAYOUT — the same app at four sizes: a phone (390), a tablet (820), a laptop (1366) and a large
// desktop (1920), plus a laptop zoomed to 200%. On every main screen: nothing runs off the side or is cut off; the
// right navigation (bottom tabs on a phone and tablet, a sidebar on a computer); the panel beside Today only on a
// wide screen; two columns where there's room; dialogs centered on big screens and from the bottom on a phone;
// lessons in a calm centered column; Settings as sections on the left and options on the right; the keyboard in
// a lesson (1–4, Enter); hover states. Runs after `npm run build`.
import assert from "node:assert/strict";
import { spawn } from "node:child_process";
import { mkdtempSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { chromium } from "playwright-core";

const ROOT = join(import.meta.dirname, "..");
const port = 30000 + Math.floor(Math.random() * 20000);
const env = { ...process.env, NORTHVALE_DOTENV: "0", PORT: String(port), NORTHVALE_DATA: mkdtempSync(join(tmpdir(), "nvl-layout-")), ANTHROPIC_API_KEY: "", TWELVEDATA_API_KEY: "", SMTP_USER: "", SMTP_PASS: "" };
const server = spawn(process.execPath, [join(ROOT, "server/index.js")], { env, stdio: ["ignore", "pipe", "inherit"] });
await new Promise((r) => server.stdout.on("data", (d) => String(d).includes("Northvale Learn on") && r()));
const BASE = `http://127.0.0.1:${port}/`;
const browser = await chromium.launch({ channel: "chrome", headless: true });

const d = (n) => new Date(Date.now() - n * 864e5).toLocaleDateString("en-CA");
const days = [4, 3, 2, 1, 0].map(d);
const done = ["budget-1", "budget-2", "budget-3", "save-1", "save-2", "save-3", "banking-1", "banking-2", "banking-3", "banking-4", "paycheck-1"]; // the next lesson, paycheck-2, starts with two cards and a choice
const learner = (lang, region) => ({
  version: 1, updatedAt: 1,
  profile: { onboarded: true, nickname: "Dani", ageBand: "18-25", avatar: 0, ageAsked: true, remindAsked: true, seenIntros: { practice: true, portfolio: true, tools: true, news: true, goals: true } },
  settings: { lang, region, look: "white", reduceMotion: true, analytics: false },
  progress: { xp: 200, days: Object.fromEntries(days.map((x) => [x, 25])), streak: { count: 5, last: d(0), best: 5, frozen: [] }, freezes: 1, dailyGoal: 20, lessons: Object.fromEntries(done.map((id) => [id, { done: true, at: d(8), last: d(8), best: 0, times: 1 }])), lessonDays: days, badges: { first_lesson: d(8) }, counters: { lessons: done.length }, practiced: {}, startUnit: "budget", placed: [], seen: d(0) },
  modules: { goals: { goals: [{ id: "g1", template: "car", name: lang === "es" ? "Mi primer carro" : "My first car", currency: region === "MX" ? "MXN" : "USD", target: region === "MX" ? 60000 : 4000, months: 18, start: 0, path: "save", createdAt: d(30), contributions: [{ date: d(20), amount: region === "MX" ? 8000 : 600 }] }], checkIn: d(0) }, feedback: { pending: [], survey: "skipped" } },
});
const SIZES = [["phone", 390, 844], ["tablet", 820, 1180], ["laptop", 1366, 768], ["desktop", 1920, 1080]];
const open = async (w, h, lang = "en", extra = {}) => {
  const ctx = await browser.newContext({ viewport: { width: w, height: h }, isMobile: w < 600, hasTouch: w < 1024, locale: lang === "es" ? "es-MX" : "en-US", timezoneId: "America/Chicago", serviceWorkers: "block", reducedMotion: "reduce", ...extra });
  await ctx.addInitScript((s) => localStorage.getItem("northvale-learn-v1") || localStorage.setItem("northvale-learn-v1", s), JSON.stringify(learner(lang, lang === "es" ? "MX" : "US")));
  const page = await ctx.newPage();
  page.setDefaultTimeout(8000);
  await page.goto(BASE);
  await page.evaluate(() => document.fonts.ready);
  await page.waitForTimeout(300);
  return { ctx, page };
};
const NAMES = { en: { menu: "Main tabs", learn: "Learn", goals: "Goals", practice: "Practice", me: "Me", settings: "Settings" }, es: { menu: "Secciones", learn: "Aprender", goals: "Metas", practice: "Práctica", me: "Yo", settings: "Ajustes" } };
const tab = (page, lang, name) => page.getByRole("navigation", { name: NAMES[lang].menu }).getByRole("button", { name: NAMES[lang][name], exact: true }).click();
const openSettings = async (page, lang) => {
  await tab(page, lang, "me");
  await page.getByRole("button", { name: new RegExp(`^${NAMES[lang].settings}`) }).first().click();
  await page.waitForTimeout(250);
};

// Nothing runs off the side of the screen or is cut off (inside a box that scrolls or clips on purpose is fine).
async function fits(page, where) {
  await page.waitForTimeout(250);
  const r = await page.evaluate(() => {
    const clipped = (el) => {
      for (let p = el.parentElement; p && p !== document.body; p = p.parentElement) if (/(auto|scroll|hidden|clip)/.test(getComputedStyle(p).overflowX)) return true;
      return false;
    };
    const cut = [];
    for (const el of document.querySelectorAll("main *, aside *, nav *")) {
      if (el.closest(".nv-sr") || el instanceof SVGElement) continue;
      const b = el.getBoundingClientRect();
      if (!b.width || !b.height) continue;
      if ((b.right > innerWidth + 1 || b.left < -1) && !clipped(el)) cut.push(`${el.tagName.toLowerCase()} ${Math.round(b.left)}–${Math.round(b.right)} “${(el.textContent || "").trim().slice(0, 30)}”`);
    }
    return { over: document.documentElement.scrollWidth - innerWidth, cut: cut.slice(0, 4) };
  });
  assert.ok(r.over <= 0, `${where}: the page is ${r.over}px wider than the screen`);
  assert.deepEqual(r.cut, [], `${where}: cut off: ${r.cut.join("; ")}`);
}
const rectOf = (page, sel) => page.locator(sel).first().evaluate((el) => { const b = el.getBoundingClientRect(); return { left: b.left, right: b.right, top: b.top, bottom: b.bottom, width: b.width, height: b.height }; });
const startLesson = async (page) => {
  const go = page.getByRole("button", { name: /^Continue$/ }).first();
  if (await go.count()) await go.click();
  else await page.getByText("Next lesson").first().click();
  await page.getByRole("dialog").first().waitFor();
  await page.waitForTimeout(500);
};

try {
  for (const [name, w, h] of SIZES) {
    const computer = w >= 1024;
    const wide = w >= 1180;
    const { ctx, page } = await open(w, h);

    // --- Today and the sea chart: the right navigation, the panel, the room ---
    const nav = await rectOf(page, `nav[aria-label="Main tabs"]`);
    if (computer) {
      assert.equal(await page.locator(".nv-side").count(), 1, `${name}: a sidebar`);
      assert.ok(nav.left < 20 && nav.width >= 200 && nav.width <= 260 && nav.top < 200, `${name}: the tabs run down the left (${JSON.stringify(nav)})`);
      assert.ok(await page.getByRole("button", { name: "Ask", exact: true }).count(), `${name}: Ask is in the sidebar`);
    } else {
      assert.equal(await page.locator(".nv-side").count(), 0, `${name}: no sidebar`);
      assert.ok(nav.bottom >= h - 2 && nav.width >= w - 2, `${name}: the tabs run along the bottom (${JSON.stringify(nav)})`);
    }
    assert.equal(await page.getByRole("navigation", { name: "Main tabs" }).count(), 1, `${name}: exactly one set of tabs`);
    const panel = page.getByRole("complementary", { name: "At a glance" });
    if (wide) {
      await panel.waitFor();
      const text = await panel.innerText();
      assert.match(text, /5-day streak/);
      assert.match(text, /Today: \d+ \/ 20 XP/);
      assert.match(text, /My first car/);
      const p = await rectOf(page, `aside[aria-label="At a glance"]`);
      assert.ok(p.left > w * 0.55 && p.width >= 280 && p.width <= 320, `${name}: the panel sits on the right (${JSON.stringify(p)})`);
      assert.equal(await page.getByText("Myth or fact?").count(), 1, `${name}: Myth or fact is in the panel once, not twice`);
    } else assert.equal(await panel.count(), 0, `${name}: no panel`);
    // Today's column stays readable; the sea chart is bigger on bigger screens.
    const today = await rectOf(page, "h1.nv-disp");
    const chart = await page.evaluate(() => { const c = [...document.querySelectorAll("div")].find((x) => x.style.aspectRatio); return c ? c.getBoundingClientRect().width : 0; });
    assert.ok(chart >= (name === "phone" ? 320 : name === "tablet" ? 520 : 600), `${name}: the sea chart is ${Math.round(chart)}px wide`);
    assert.ok(chart <= 640, `${name}: the sea chart isn't stretched (${Math.round(chart)}px)`);
    const card = await rectOf(page, "main .nv-learn > div");
    assert.ok(card.width <= 701, `${name}: Today's column is ${Math.round(card.width)}px (at most 700)`);
    assert.ok(today.left >= 0);
    await fits(page, `${name}: Today`);
    if (computer) assert.equal(await page.getByText(/more islands? in the mist/).count(), 0, `${name}: every island is shown`);

    // --- the other tabs ---
    for (const t of ["goals", "practice", "me"]) {
      await tab(page, "en", t);
      await fits(page, `${name}: ${t}`);
      const cols = await page.evaluate(() => { const c = document.querySelector("main .nv-cols"); return c ? getComputedStyle(c).gridTemplateColumns.split(" ").length : 0; });
      if (t !== "goals") assert.equal(cols, w >= 600 ? 2 : 1, `${name}: ${t} has ${w >= 600 ? "two columns" : "one column"} (${cols})`);
    }

    // --- Settings: sections on the left and options on the right (a computer), or one long page ---
    await openSettings(page, "en");
    if (computer) {
      const side = page.getByRole("navigation", { name: "Settings" });
      assert.equal(await side.getByRole("button").count(), 9, `${name}: nine sections on the left`);
      assert.ok(await page.getByText("Create a free account").count(), `${name}: Account is the first section`);
      await side.getByRole("button", { name: "Colors" }).click();
      await page.getByRole("radiogroup", { name: "Colors" }).waitFor();
      assert.equal(await page.getByText("Create a free account").count(), 0, `${name}: only the picked section shows`);
      const s = await rectOf(page, `nav[aria-label="Settings"]`);
      const o = await rectOf(page, `main [role="radiogroup"]`);
      assert.ok(o.left > s.right, `${name}: the options are to the right of the sections`);
      await side.getByRole("button", { name: "Sound and feel" }).click();
      assert.ok(await page.getByRole("switch").count(), `${name}: the parts under “More” are in the list`);
    } else {
      assert.equal(await page.getByRole("navigation", { name: "Settings" }).count(), 0, `${name}: no section list`);
      assert.ok(await page.getByRole("heading", { name: "Account" }).count(), `${name}: Settings is one page`);
    }
    await fits(page, `${name}: Settings`);

    // --- a dialog: centered on a big screen, up from the bottom on a phone ---
    await tab(page, "en", "learn");
    await page.getByRole("button", { name: /^Streak: \d+ days/ }).first().click();
    await page.getByRole("dialog").waitFor();
    await page.waitForTimeout(450);
    const box = await rectOf(page, ".nv-sheet");
    if (w >= 700) assert.ok(box.top > 30 && box.bottom < h - 30 && Math.abs((box.left + box.right) / 2 - w / 2) < 3 && box.width <= 561, `${name}: the dialog is centered (${JSON.stringify(box)})`);
    else assert.ok(box.bottom >= h - 2, `${name}: the sheet comes up from the bottom (${JSON.stringify(box)})`);
    await page.keyboard.press("Escape");

    // --- a lesson: a calm centered column ---
    await startLesson(page);
    const col = await rectOf(page, ".nv-ovl");
    assert.ok(col.width <= 641, `${name}: the lesson column is ${Math.round(col.width)}px (at most 640)`);
    assert.ok(Math.abs((col.left + col.right) / 2 - w / 2) < 3, `${name}: the lesson column is centered`);
    const hint = page.getByText(/Tip: press 1–4/);

    if (name === "laptop") {
      // The keyboard: Enter on the two cards, then a choice: 2 picks the second answer, Enter checks, Enter goes on.
      assert.equal(await hint.count(), 0, "the hint appears with a question, not a card");
      for (let i = 0; i < 4 && !(await page.getByRole("radio").count()); i++) (await page.keyboard.press("Enter"), await page.waitForTimeout(250));
      assert.ok(await page.getByRole("radio").count() >= 3, "reached a choice question with the keyboard alone (Enter on cards)");
      assert.equal(await hint.count(), 1, "the small hint shows once, on a computer");
      assert.equal(await page.getByRole("button", { name: "Check", exact: true }).isDisabled(), true, "Check waits for an answer");
      await page.keyboard.press("2");
      assert.equal(await page.getByRole("radio").nth(1).getAttribute("aria-checked"), "true", "2 picks the second answer");
      assert.equal(await page.getByRole("radio").nth(0).getAttribute("aria-checked"), "false");
      await page.keyboard.press("Enter");
      await page.locator('[role="status"][data-right]').waitFor();
      assert.ok(await page.locator("[data-player]").getByRole("button", { name: "Continue", exact: true }).count(), "Enter checked the answer");
      await page.keyboard.press("Enter");
      await page.waitForTimeout(300);
      assert.equal(await page.locator('[role="status"][data-right]').count(), 0, "Enter went on to the next step");
      // A dialog on top keeps its keys: with the quit sheet open, 1 and Enter don't touch the lesson behind it.
      await page.getByRole("button", { name: "Close" }).first().click();
      await page.getByRole("dialog").nth(1).waitFor();
      await page.keyboard.press("1");
      await page.keyboard.press("Enter");
      await page.waitForTimeout(300);
      assert.equal(await page.getByRole("dialog").count(), 2, "keys stay with the dialog on top: the quit question is still there");
      await page.keyboard.press("Escape");
      await page.waitForTimeout(200);
    } else if (name === "phone") {
      for (let i = 0; i < 4 && !(await page.getByRole("radio").count()); i++) {
        await page.locator("[data-player]").getByRole("button", { name: "Continue", exact: true }).click();
        await page.waitForTimeout(250);
      }
      assert.equal(await hint.count(), 0, "no keyboard hint on a phone");
    }
    await fits(page, `${name}: a lesson`);
    await ctx.close();

    // --- hover on a computer: a row answers the mouse ---
    if (name === "laptop") {
      const { ctx: c2, page: p2 } = await open(w, h);
      await tab(p2, "en", "practice");
      const row = p2.locator("main .nv-list > button").first();
      const before = await row.evaluate((el) => getComputedStyle(el).backgroundColor);
      await row.hover();
      await p2.waitForTimeout(250);
      const after = await row.evaluate((el) => getComputedStyle(el).backgroundColor);
      assert.notEqual(after, before, "a row changes color under the mouse");
      await p2.getByRole("button", { name: /^Unit \d/ }).first().hover().catch(() => {});
      await c2.close();
    }
    console.log(`ok: ${name} (${w}px): ${computer ? "sidebar" : "bottom tabs"}${wide ? " and the panel on Today" : ""}; every tab and Settings fit${w >= 600 ? "; two columns" : ""}; the dialog ${w >= 700 ? "centered" : "from the bottom"}; the lesson in a ≤640px column${name === "laptop" ? "; the keyboard (1–4, Enter) and hover" : ""}`);
  }

  // --- 200% zoom on a laptop (1366px at double size is 683px wide): the tablet layout, nothing off the side ---
  {
    const { ctx, page } = await open(683, 384, "en", { deviceScaleFactor: 2 });
    assert.equal(await page.locator(".nv-side").count(), 0, "zoomed to 200%, the sidebar gives way to the bottom tabs");
    await fits(page, "200%: Today");
    for (const t of ["goals", "practice", "me"]) (await tab(page, "en", t), await fits(page, `200%: ${t}`));
    await openSettings(page, "en");
    await fits(page, "200%: Settings");
    await ctx.close();
    console.log("ok: a laptop zoomed to 200% (683px) switches to the tablet layout; every tab and Settings fit");
  }

  // --- Spanish, the longer language: a phone and a laptop ---
  for (const [w, h] of [[390, 844], [1366, 768]]) {
    const { ctx, page } = await open(w, h, "es");
    await fits(page, `es ${w}: Hoy`);
    for (const t of ["goals", "practice", "me"]) (await tab(page, "es", t), await fits(page, `es ${w}: ${t}`));
    await openSettings(page, "es");
    await fits(page, `es ${w}: Ajustes`);
    await ctx.close();
  }
  console.log("ok: Spanish fits too, on a phone and a laptop");

  // --- the public pages ---
  for (const path of ["welcome", "bienvenida", "admin", "verify", "verificar", "teacher-guide", "guia-docente"]) {
    for (const [name, w, h] of SIZES) {
      const ctx = await browser.newContext({ viewport: { width: w, height: h }, serviceWorkers: "block", reducedMotion: "reduce" });
      const page = await ctx.newPage();
      await page.goto(`${BASE}${path}`);
      await page.waitForTimeout(300);
      const over = await page.evaluate(() => document.documentElement.scrollWidth - innerWidth);
      assert.ok(over <= 0, `${path} at ${name} is ${over}px wider than the screen`);
      await ctx.close();
    }
  }
  console.log("ok: the landing, admin, check-a-certificate and teacher-guide pages fit at all four sizes");
} finally {
  await browser.close();
  server.kill();
}
