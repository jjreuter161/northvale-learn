// INSTALL AND OFFLINE — the app installs as a phone app (Chrome finds
// nothing missing; the icons are the North star and sailboat at the sizes
// the manifest says, square to the edges where the phone cuts its own
// shape), and once a lesson has been opened it works with no connection:
// the app opens, the lesson plays to the end, and a unit never opened says
// plainly that it needs a connection, then loads when it's back.
// Runs after `npm run build`.
import assert from "node:assert/strict";
import { spawn } from "node:child_process";
import { mkdtempSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { chromium } from "playwright-core";
import { UNITS } from "../src/modules/lessons/units/all.js";

const ROOT = join(import.meta.dirname, "..");
const port = 30000 + Math.floor(Math.random() * 20000);
const env = { ...process.env, NORTHVALE_DOTENV: "0", PORT: String(port), NORTHVALE_DATA: mkdtempSync(join(tmpdir(), "nvl-install-")), ANTHROPIC_API_KEY: "", TWELVEDATA_API_KEY: "", SMTP_USER: "", SMTP_PASS: "", NEWS_FEEDS: JSON.stringify({ US: [], MX: [] }) };
const server = spawn(process.execPath, [join(ROOT, "server/index.js")], { env, stdio: ["ignore", "pipe", "inherit"] });
await new Promise((r) => server.stdout.on("data", (d) => String(d).includes("Northvale Learn on") && r()));
// The service worker needs a secure origin: localhost counts.
const BASE = `http://localhost:${port}/`;
const d = (n) => new Date(Date.now() - n * 864e5).toLocaleDateString("en-CA");
const learner = {
  version: 1, updatedAt: 1,
  profile: { onboarded: true, nickname: "Dani", ageBand: "18-25", avatar: 0, ageAsked: true, remindAsked: true, seenIntros: { practice: true, portfolio: true, tools: true, news: true } },
  settings: { lang: "en", region: "US", look: "white", reduceMotion: true },
  progress: { xp: 5000, days: { [d(1)]: 20 }, streak: { count: 1, last: d(1), best: 9, frozen: [] }, freezes: 0, dailyGoal: 20, lessons: Object.fromEntries(UNITS.flatMap((u) => u.lessons).map((l) => [l.id, { done: true, at: d(30), last: d(30), best: 0, times: 1 }])), lessonDays: [d(1)], badges: {}, counters: { lessons: 59 }, practiced: {}, startUnit: "budget", placed: [] },
  modules: { feedback: { pending: [], survey: "skipped" } },
};

let ctx;
try {
  // A normal profile, not incognito: Chrome won't install from incognito.
  ctx = await chromium.launchPersistentContext(mkdtempSync(join(tmpdir(), "nvl-profile-")), { channel: "chrome", headless: true, viewport: { width: 390, height: 844 }, locale: "en-US", timezoneId: "America/Chicago", reducedMotion: "reduce" });
  await ctx.addInitScript((s) => localStorage.getItem("northvale-learn-v1") || localStorage.setItem("northvale-learn-v1", s), JSON.stringify(learner));
  const page = ctx.pages()[0] || (await ctx.newPage());
  page.setDefaultTimeout(8000);
  const errors = [];
  page.on("console", (m) => m.type() === "error" && errors.push(m.text()));
  page.on("pageerror", (e) => errors.push(String(e)));
  await page.goto(BASE);
  await page.evaluate(() => Promise.race([navigator.serviceWorker.ready, new Promise((_, no) => setTimeout(() => no(new Error("the service worker didn't install")), 10000))]));
  // Straight after the first visit, with no connection: the app opens
  // (from the service worker alone: the browser's own cache can be emptied
  // by the phone, and a home-screen app on iPhone doesn't share it).
  const cdp = await ctx.newCDPSession(page);
  await cdp.send("Network.clearBrowserCache");
  await ctx.setOffline(true);
  await page.reload();
  await page.getByRole("navigation").getByRole("button", { name: "Learn", exact: true }).waitFor();
  await ctx.setOffline(false);
  await page.reload();
  assert.ok(await page.evaluate(() => !!navigator.serviceWorker.controller), "the service worker runs the page");
  console.log("ok: right after the first visit, the app opens with no connection");

  // ---- installs as an app ----
  const { installabilityErrors } = await cdp.send("Page.getInstallabilityErrors");
  assert.deepEqual(installabilityErrors, [], "Chrome can install it");
  const manifest = await (await fetch(`${BASE}manifest.webmanifest`)).json();
  assert.equal(manifest.display, "standalone");
  assert.equal(manifest.name, "Northvale Learn");
  const icons = [...manifest.icons.filter((i) => i.type === "image/png"), { src: await page.getAttribute('link[rel="apple-touch-icon"]', "href"), sizes: "180x180", purpose: "apple" }];
  for (const icon of icons) {
    const r = await page.evaluate(async (src) => {
      const img = new Image();
      img.src = src;
      await img.decode();
      const c = Object.assign(document.createElement("canvas"), { width: img.naturalWidth, height: img.naturalHeight });
      const g = c.getContext("2d");
      g.drawImage(img, 0, 0);
      const at = (x, y) => [...g.getImageData(x, y, 1, 1).data];
      const w = img.naturalWidth;
      // The star: cream at the top middle; the sail below it.
      return { size: `${w}x${img.naturalHeight}`, corner: at(0, 0)[3], star: at(Math.round(w * 0.5), Math.round(w * 0.28)), navy: at(Math.round(w * 0.2), Math.round(w * 0.5)) };
    }, icon.src);
    assert.equal(r.size, icon.sizes, `${icon.src} is ${icon.sizes}`);
    assert.ok(r.star[0] > 200 && r.star[1] > 200, `${icon.src}: the North star is there`);
    assert.ok(r.navy[2] > r.navy[0] && r.navy[0] < 60, `${icon.src}: on navy`);
    if (icon.purpose !== "any") assert.equal(r.corner, 255, `${icon.src}: square to the edges (${icon.purpose})`);
  }
  console.log(`ok: installs as a phone app (Chrome finds nothing missing); ${icons.length} icons with the North star, the right sizes, square where the phone cuts its own shape`);

  // ---- offline ----
  const island = (n) => page.getByRole("button", { name: new RegExp(`^Unit ${n} · `) });
  const openLesson = async (n, title) => {
    if ((await island(n).getAttribute("aria-expanded")) === "false") await island(n).click();
    await page.getByRole("button", { name: new RegExp(`^${title.replace(/[?.]/g, "\\$&")} — `) }).click();
  };
  const top = () => page.getByRole("dialog").last();
  const btn = (name) => top().getByRole("button", { name, exact: typeof name === "string" }).first();
  // Online: a lesson in Unit 1, opened and left.
  await openLesson(1, "What's a budget?");
  await btn("Continue").waitFor();
  await btn("Close").click();
  await page.getByRole("dialog").getByRole("button", { name: "Leave", exact: true }).click();
  await page.waitForTimeout(500);
  // No connection (and the browser's own cache emptied): the app still
  // opens, and the lesson plays to the end.
  await cdp.send("Network.clearBrowserCache");
  await ctx.setOffline(true);
  await page.reload();
  await page.getByRole("navigation").getByRole("button", { name: "Learn", exact: true }).waitFor();
  await openLesson(1, "What's a budget?");
  for (let i = 0; i < 60 && !(await btn("Done").count()); i++) {
    const names = await top().getByRole("button").evaluateAll((bs) => bs.map((b) => b.getAttribute("aria-label") || b.innerText.trim()));
    if (names.some((n) => /^(Skip for now|Done — continue)$/.test(n))) await btn(/^(Skip for now|Done — continue)$/).click();
    else if (names.includes("Check")) {
      const q = (k) => top().locator(`[data-q="${k}"]`);
      if (await q("order-item").count()) for (const b of await q("order-item").all()) await b.click();
      else if (await q("match-left").count()) for (let k = 0; k < (await q("match-left").count()); k++) (await q("match-left").nth(k).click(), await q("match-right").nth(k).click());
      else if (await q("number").count()) await q("number").fill("1");
      else if (await q("spot-part").count()) for (const b of await q("spot-part").all()) await b.click();
      else if (!(await q("estimate").count())) await top().getByRole("radio").first().click();
      await btn("Check").click();
      await btn("Continue").click();
    } else await btn("Continue").click();
  }
  await btn("Done").click();
  // A unit never opened: a plain message, then it loads once the connection is back.
  const far = UNITS.findIndex((u) => u.id === "psychology") + 1;
  await openLesson(far, UNITS[far - 1].lessons[0].title.en);
  await page.getByText("This didn't load. Check your connection, then try again.").waitFor();
  await ctx.setOffline(false);
  await page.keyboard.press("Escape");
  await page.waitForTimeout(300);
  if (await page.getByRole("dialog").count()) await page.getByRole("dialog").getByRole("button", { name: /^(Close|Try again)$/ }).first().click();
  await openLesson(far, UNITS[far - 1].lessons[0].title.en);
  await btn("Continue").waitFor();
  const real = errors.filter((e) => !/ERR_INTERNET_DISCONNECTED|Failed to (load|fetch)|NetworkError|net::/i.test(e));
  assert.deepEqual(real, [], "console errors");
  console.log("ok: offline, the app opens and an opened lesson plays to the end; a unit never opened says it needs a connection, then loads when it's back");
} finally {
  await ctx?.close();
  server.kill();
}
