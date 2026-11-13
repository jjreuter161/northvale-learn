// DATA SAFETY — nobody's progress is lost:
// 1. A real backup can be restored: the server's daily copy, put back with
//    `npm run restore`, brings back exactly what it held (the data it
//    replaced is kept), and a file that isn't a backup is refused.
// 2. Data from older versions still works: a data file written by the
//    launch-prep server (Milestone 4), and a learner saved by the app at
//    every milestone (test/fixtures: before Milestone 4, rebuilt from the
//    code's compatibility paths; Milestone 4, Clarity, M4.5 and the playful
//    design, from each version's own code) open with nothing lost: lessons,
//    XP, streak, goals, the practice portfolio, the language and the look
//    ("white" stays Cream, "navy" stays Navy). Someone new matches their
//    device.
// 3. Closing mid-lesson never loses progress: even if the app is shut
//    without warning (a crash, the phone closing it), the lesson picks up
//    at the same step, and a lesson finished a moment before is kept.
// Runs after `npm run build`.
import assert from "node:assert/strict";
import { spawn, spawnSync } from "node:child_process";
import { copyFileSync, existsSync, mkdtempSync, readFileSync, readdirSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { chromium } from "playwright-core";
import { text } from "../src/core/i18n.js";
import { UNITS } from "../src/modules/lessons/units/all.js";

const ROOT = join(import.meta.dirname, "..");
const FIX = join(import.meta.dirname, "fixtures");
const fixture = (name) => JSON.parse(readFileSync(join(FIX, name), "utf8"));
const env = (dir, port) => ({ ...process.env, NORTHVALE_DOTENV: "0", PORT: String(port), NORTHVALE_DATA: dir, ANTHROPIC_API_KEY: "", TWELVEDATA_API_KEY: "", SMTP_USER: "", SMTP_PASS: "", NEWS_FEEDS: JSON.stringify({ US: [], MX: [] }) });
async function start(dir) {
  const port = 30000 + Math.floor(Math.random() * 20000);
  const p = spawn(process.execPath, [join(ROOT, "server/index.js")], { env: env(dir, port), stdio: ["ignore", "pipe", "inherit"] });
  await new Promise((r) => p.stdout.on("data", (d) => String(d).includes("Northvale Learn on") && r()));
  const base = `http://127.0.0.1:${port}`;
  const H = { "X-Northvale": "1", "Content-Type": "application/json" };
  const call = async (path, { method = "GET", body, cookie } = {}) => {
    const r = await fetch(base + path, { method, headers: { ...H, ...(cookie ? { Cookie: cookie } : {}) }, body: body && JSON.stringify(body) });
    return { status: r.status, cookie: (r.headers.get("set-cookie") || "").split(";")[0], json: await r.json().catch(() => null) };
  };
  const login = (email) => call("/api/auth/login", { method: "POST", body: { email, password: "a long enough password" } });
  const stop = () => (p.kill("SIGTERM"), new Promise((r) => p.on("exit", r)));
  return { base: `${base}/`, call, login, stop };
}
const progressOf = async (s, email) => {
  const { cookie, status } = await s.login(email);
  assert.equal(status, 200, `${email} can sign in`);
  return { cookie, state: (await s.call("/api/progress", { cookie })).json.state };
};

// ---- 1 and 2 (server): an old data file, its backup, a restore -------------------
{
  const dir = mkdtempSync(join(tmpdir(), "nvl-data-"));
  const old = fixture("server-data-m4.json");
  copyFileSync(join(FIX, "server-data-m4.json"), join(dir, "learn.json"));
  let s = await start(dir);
  // Today's server reads the old file: both accounts, their age ranges and progress.
  const dani = await progressOf(s, "dani@example.test");
  const oldDani = Object.values(old.progress).find((p) => p.state.profile.nickname === "Dani" || p.state.settings.lang === "en").state;
  assert.deepEqual(dani.state.progress, oldDani.progress, "the old file's progress reads back unchanged");
  const sofia = await s.login("sofia@example.test");
  assert.equal((await s.call("/api/me", { cookie: sofia.cookie })).json.user.ageBand, "13-17");
  // The server made today's backup when it started.
  const backups = join(dir, "backups");
  const [copy] = readdirSync(backups);
  assert.match(copy, /^learn-\d{4}-\d{2}-\d{2}\.json$/);
  // Then things change: a new account, and Dani's progress is overwritten.
  assert.equal((await s.call("/api/auth/signup", { method: "POST", body: { email: "after@example.test", password: "a long enough password", nickname: "After", ageBand: "18-25", guardian: true } })).status, 200);
  const put = await s.call("/api/progress", { method: "PUT", cookie: dani.cookie, body: { state: { ...dani.state, progress: { ...dani.state.progress, xp: 1, lessons: {} } }, updatedAt: Date.now() } });
  assert.equal(put.status, 200);
  await s.stop();
  // Not a backup: refused, and nothing changes.
  writeFileSync(join(dir, "not-a-backup.json"), JSON.stringify({ hello: "world" }));
  const bad = spawnSync(process.execPath, [join(ROOT, "scripts/restore.mjs"), join(dir, "not-a-backup.json")], { env: env(dir, 0), encoding: "utf8" });
  assert.equal(bad.status, 1, "a file that isn't a backup is refused");
  assert.ok(!existsSync(join(dir, "learn.json.restore")));
  // The restore.
  const r = spawnSync(process.execPath, [join(ROOT, "scripts/restore.mjs"), join(backups, copy)], { env: env(dir, 0), encoding: "utf8" });
  assert.equal(r.status, 0, r.stderr);
  assert.match(r.stdout, /Ready to restore 2 accounts/);
  s = await start(dir);
  const back = await progressOf(s, "dani@example.test");
  assert.deepEqual(back.state.progress, oldDani.progress, "the backup's progress is back");
  assert.equal((await s.login("after@example.test")).status, 401, "what came after the backup is gone from the live data");
  const kept = readdirSync(dir).filter((f) => f.startsWith("learn.before-restore-"));
  assert.equal(kept.length, 1, "the replaced data is kept");
  assert.ok(Object.values(JSON.parse(readFileSync(join(dir, kept[0]), "utf8")).users).some((u) => u.email === "after@example.test"));
  await s.stop();
  // The replaced data is deleted with the backups' 14 days.
  process.env.NORTHVALE_DATA = dir;
  const { backup } = await import("../server/store.js");
  backup(new Date(Date.now() + 15 * 864e5).toISOString().slice(0, 10));
  assert.equal(readdirSync(dir).filter((f) => f.startsWith("learn.before-restore-")).length, 0, "the replaced data goes after 14 days");
  console.log("ok: a data file from the Milestone 4 server opens with nothing lost; its daily backup restores with npm run restore (the replaced data kept 14 days; a non-backup refused)");
}

// ---- the app in a browser --------------------------------------------------------
const s = await start(mkdtempSync(join(tmpdir(), "nvl-data-app-")));
const browser = await chromium.launch({ channel: "chrome", headless: true });
const KEY = "northvale-learn-v1";
const W = {
  en: { tabs: ["Learn", "Goals", "Practice", "Me"], settings: /^Settings/, look: { white: "Cream", navy: "Navy", auto: "Match my device" }, next: "Continue", check: "Check", skip: /^(Skip for now|Done — continue)$/, done: "Done", close: "Close", leave: "Leave", cont: /^(Continue|Start)$/ },
  es: { tabs: ["Aprender", "Metas", "Práctica", "Yo"], settings: /^Ajustes/, look: { white: "Crema", navy: "Azul marino", auto: "Igual que mi dispositivo" }, next: "Continuar", check: "Comprobar", skip: /^(Saltar por ahora|Listo, continuar)$/, done: "Listo", close: "Cerrar", leave: "Salir", cont: /^(Continuar|Empezar)$/ },
};
const BROKEN = /\{[@$]?[A-Za-z_][^{}]*\}|\bNaN\b|\bundefined\b|\[object Object\]/;
async function open(seed, extra = {}) {
  const ctx = await browser.newContext({ viewport: { width: 390, height: 844 }, timezoneId: "America/Chicago", serviceWorkers: "block", reducedMotion: "reduce", ...extra });
  if (seed) await ctx.addInitScript(([k, v]) => localStorage.getItem(k) || localStorage.setItem(k, v), [KEY, JSON.stringify(seed)]);
  const errors = [];
  const page = async () => {
    const p = await ctx.newPage();
    p.setDefaultTimeout(8000);
    p.on("console", (m) => m.type() === "error" && errors.push(m.text()));
    p.on("pageerror", (e) => errors.push(String(e)));
    await p.goto(s.base);
    return p;
  };
  return { ctx, errors, page };
}
const saved = (p) => p.evaluate((k) => JSON.parse(localStorage.getItem(k)), KEY);
// One-time sheets an older learner sees (welcome back, "New: Practice"):
// closed the way a person would.
async function settle(p) {
  for (let i = 0, quiet = 0; i < 10 && quiet < 2; i++) {
    await p.waitForTimeout(200);
    const d = p.getByRole("dialog").last();
    if (!(await d.count())) {
      quiet++;
      continue;
    }
    quiet = 0;
    const close = d.getByRole("button", { name: /^(Not now|Ahora no|Take a look|Echar un vistazo|Got it|Entendido|Close|Cerrar)$/ });
    if (await close.count()) await close.first().click();
    else await p.keyboard.press("Escape");
  }
}
const tab = (p, name) => p.getByRole("navigation").getByRole("button", { name, exact: true }).click();
const top = (p) => p.getByRole("dialog").last();
const btn = (p, name) => top(p).getByRole("button", { name, exact: typeof name === "string" }).first();
// Some answer to whatever question is showing.
async function answerAny(d) {
  const q = (k) => d.locator(`[data-q="${k}"]`);
  if (await q("order-item").count()) for (const b of await q("order-item").all()) await b.click();
  else if (await q("match-left").count()) for (let i = 0; i < (await q("match-left").count()); i++) (await q("match-left").nth(i).click(), await q("match-right").nth(i).click());
  else if (await q("number").count()) await q("number").fill("1");
  else if (await q("spot-part").count()) for (const b of await q("spot-part").all()) await b.click();
  else if (!(await q("estimate").count())) await d.getByRole("radio").first().click();
}
// One step forward in the open lesson.
async function step(p, w) {
  const names = await top(p).getByRole("button").evaluateAll((bs) => bs.map((b) => b.getAttribute("aria-label") || b.innerText.trim()));
  if (names.some((n) => w.skip.test(n))) await btn(p, w.skip).click();
  else if (names.includes(w.check)) (await answerAny(top(p)), await btn(p, w.check).click(), await btn(p, w.next).click());
  else await btn(p, w.next).click();
}
const atStep = (p) => p.getByRole("dialog").last().getByRole("progressbar").first().getAttribute("aria-valuenow").then(Number);
// The app shut without warning (no pagehide, nothing saved on the way out).
const crash = async (p) => {
  const cdp = await p.context().newCDPSession(p);
  await Promise.race([cdp.send("Page.crash").catch(() => {}), new Promise((r) => setTimeout(r, 1000))]);
  await p.close().catch(() => {});
};

// Today suggests one best next step: the lesson, or a review when many ideas are due (then the lesson is its own row).
const startLesson = async (p, w) => {
  if (await p.getByRole("button", { name: w.cont }).count()) await p.getByRole("button", { name: w.cont }).first().click();
  else await p.getByRole("button", { name: /^(Next lesson|Siguiente lección)/ }).first().click();
};

try {
  // ---- 2 (the app): a learner saved by every milestone ----
  const MILESTONES = [["saved-early.json", "before Milestone 4"], ["saved-m4-launch-prep.json", "Milestone 4 (launch prep)"], ["saved-clarity.json", "Clarity"], ["saved-m4.5.json", "Milestone 4.5"], ["saved-playful.json", "the playful design"]];
  for (const [file, when] of MILESTONES) {
    const before = fixture(file);
    const w = W[before.settings.lang];
    const app = await open(before, { locale: before.settings.lang === "es" ? "es-MX" : "en-US" });
    const p = await app.page();
    for (const name of w.tabs) {
      await settle(p);
      await tab(p, name);
      await settle(p);
      await p.waitForTimeout(150);
      const t = await p.evaluate(() => document.body.innerText);
      assert.ok(!BROKEN.test(t), `${when}, ${name}: shows ${t.match(BROKEN)}`);
    }
    // Someone who used an earlier version gets "What's new" on Today, once.
    await tab(p, w.tabs[0]);
    await settle(p);
    const news = p.getByRole("heading", { name: before.settings.lang === "es" ? "Novedades" : "What's new" });
    assert.equal(await news.count(), 1, `${when}: "What's new" on Today`);
    await tab(p, w.tabs[3]);
    await settle(p);
    await p.getByRole("button", { name: w.settings }).first().click();
    await settle(p);
    const look = await p.getByRole("radio", { name: new RegExp(`^${w.look[before.settings.look]}(?! &| y )`) }).getAttribute("aria-checked");
    assert.equal(look, "true", `${when}: "${before.settings.look}" still shows as ${w.look[before.settings.look]}`);
    await p.evaluate(() => dispatchEvent(new Event("pagehide")));
    const after = await saved(p);
    assert.deepEqual(app.errors, [], `${when}: console errors`);
    // Nothing lost.
    assert.equal(after.profile.nickname, before.profile.nickname);
    assert.deepEqual([after.settings.lang, after.settings.region, after.settings.look], [before.settings.lang, before.settings.region, before.settings.look]);
    assert.ok(after.progress.xp >= before.progress.xp, `${when}: XP kept`);
    for (const [id, l] of Object.entries(before.progress.lessons)) assert.ok(after.progress.lessons[id] && after.progress.lessons[id].done === l.done, `${when}: lesson ${id} kept`);
    assert.ok(after.progress.streak.best >= before.progress.streak.best, `${when}: best streak kept`);
    assert.deepEqual(after.progress.badges, { ...before.progress.badges, ...after.progress.badges }, `${when}: badges kept`);
    const goals = (x) => (x.modules.goals ? x.modules.goals.goals : []).map((g) => [g.id, g.name, g.target]);
    assert.deepEqual(goals(after), goals(before), `${when}: goals kept`);
    const pf = (x) => x.modules.portfolio && x.modules.portfolio.pf && [x.modules.portfolio.pf.cash, x.modules.portfolio.pf.holdings, x.modules.portfolio.pf.trades.length];
    assert.deepEqual(pf(after), pf(before), `${when}: practice portfolio kept`);
    // …and it still works: a lesson, finished and saved.
    await tab(p, w.tabs[0]);
    await settle(p);
    await p.getByRole("button", { name: before.settings.lang === "es" ? "Entendido" : "Got it", exact: true }).click();
    assert.equal(await news.count(), 0, `${when}: "What's new" goes once it's read`);
    const xp = after.progress.xp;
    await startLesson(p, w);
    await p.locator('[aria-busy="true"]').waitFor({ state: "detached", timeout: 10000 });
    for (let i = 0; i < 60 && !(await btn(p, w.done).count()); i++) await step(p, w);
    await p.evaluate(() => dispatchEvent(new Event("pagehide")));
    assert.ok((await saved(p)).progress.xp > xp, `${when}: a new lesson adds XP`);
    assert.equal((await saved(p)).profile.seenNote, "1.1.0-colors", `${when}: "What's new" stays read`);
    assert.deepEqual(app.errors, [], `${when}: console errors in a lesson`);
    await app.ctx.close();
  }
  console.log(`ok: a learner saved at each milestone (${MILESTONES.map((m) => m[1]).join(", ")}) opens with lessons, XP, streak, badges, goals, portfolio, language and look kept, see "What's new" once, and can finish a new lesson`);

  // Someone new: the look matches their device.
  for (const scheme of ["light", "dark"]) {
    const app = await open(null, { locale: "en-US", colorScheme: scheme });
    const p = await app.page();
    const bg = await p.evaluate(() => getComputedStyle(document.body).backgroundColor);
    const dark = (await p.evaluate(() => getComputedStyle(document.documentElement).colorScheme)) === "dark";
    assert.equal(dark, scheme === "dark", `someone new with a ${scheme} phone gets ${scheme === "dark" ? "Navy" : "Cream"} (background ${bg})`);
    await app.ctx.close();
  }
  console.log("ok: someone new gets Match my device (Cream on a light phone, Navy on a dark one)");

  // ---- 3: closing mid-lesson ----
  {
    const before = fixture("saved-playful.json");
    const w = W.en;
    const app = await open(before, { locale: "en-US" });
    let p = await app.page();
    await settle(p);
    await startLesson(p, w);
    await p.locator('[aria-busy="true"]').waitFor({ state: "detached", timeout: 10000 });
    const title = await top(p).getAttribute("aria-label");
    const lesson = UNITS.flatMap((u) => u.lessons).find((l) => l.title.en === title);
    assert.ok(lesson, `the open lesson (${title}) is in the course`);
    for (let i = 0; i < 3; i++) await step(p, w);
    const at = await atStep(p);
    assert.equal(at, 3);
    // Shut without warning (no pagehide): the place was already saved.
    await crash(p);
    p = await app.page();
    await settle(p);
    await startLesson(p, w);
    await p.locator('[aria-busy="true"]').waitFor({ state: "detached", timeout: 10000 });
    assert.equal(await top(p).getAttribute("aria-label"), title, "the same lesson opens");
    assert.equal(await atStep(p), at, "it picks up at the same step");
    const s3 = lesson.steps[3];
    assert.ok((await top(p).innerText()).replace(/\s+/g, " ").includes(text(s3.q || s3.title || s3.prompt, { lang: "en", region: "US" })), "showing that step");
    // Leaving on purpose keeps the place too.
    await step(p, w);
    await btn(p, w.close).click();
    await p.getByRole("dialog").getByRole("button", { name: w.leave, exact: true }).click();
    await startLesson(p, w);
    await p.locator('[aria-busy="true"]').waitFor({ state: "detached", timeout: 10000 });
    assert.equal(await atStep(p), at + 1, "after Leave, it picks up where it was left");
    // Finished, then shut a moment later: the lesson is kept.
    for (let i = 0; i < 60 && !(await btn(p, w.done).count()); i++) await step(p, w);
    await crash(p);
    p = await app.page();
    const after = await saved(p);
    assert.ok(after.progress.lessons[lesson.id] && after.progress.lessons[lesson.id].done, "the finished lesson was saved before the app shut");
    assert.equal(after.modules.lessons.open, null, "and nothing is left half-open");
    assert.deepEqual(app.errors.filter((e) => !/crash/i.test(e)), []);
    await app.ctx.close();
    console.log("ok: closing mid-lesson (even a crash) picks up at the same step; Leave does too; a lesson finished just before the app shuts is kept");
  }
} finally {
  await browser.close();
  await s.stop();
}
