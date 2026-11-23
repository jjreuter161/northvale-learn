// Tabs through every main screen and a lesson with the keyboard, and checks each stop (WCAG 2.2: 2.4.7 and 2.4.11):
//   the focused control is on the screen (not scrolled out of view)
//   nothing sits on top of it (the tab bar, a pinned button, the header) so it is not hidden
//   it shows a focus ring (an outline or a ring made with a shadow)
//   --size WxH      the window (default 390x667, a small phone: the pinned bars take the most room)
//   --lang en|es    the language (default en)
// It starts the server on a random port with no keys and a temporary data folder, like the tests, and changes nothing.
import { chromium } from "playwright-core";
import { spawn } from "node:child_process";
import { mkdtempSync } from "node:fs";
import { join } from "node:path";
import { tmpdir } from "node:os";

const ROOT = join(import.meta.dirname, "..");
const arg = (name, fallback) => { const i = process.argv.indexOf(`--${name}`); return i >= 0 ? process.argv[i + 1] : fallback; };
const [W, H] = arg("size", "390x667").split("x").map(Number);
const lang = arg("lang", "en");
const port = 30000 + Math.floor(Math.random() * 20000);
const env = { ...process.env, NORTHVALE_DOTENV: "0", PORT: String(port), NORTHVALE_DATA: mkdtempSync(join(tmpdir(), "nvl-focus-")), ANTHROPIC_API_KEY: "", TWELVEDATA_API_KEY: "", SMTP_USER: "", SMTP_PASS: "", NEWS_FEEDS: JSON.stringify({ US: [], MX: [] }) };
const server = spawn(process.execPath, [join(ROOT, "server/index.js")], { env, stdio: ["ignore", "pipe", "inherit"] });
await new Promise((r) => server.stdout.on("data", (d) => String(d).includes("Northvale Learn on") && r()));
const BASE = `http://127.0.0.1:${port}/`;
const browser = await chromium.launch({ channel: "chrome", headless: true });

const d = (n) => new Date(Date.now() - n * 864e5).toLocaleDateString("en-CA");
const DONE = ["budget-1", "budget-2", "budget-3", "save-1"];
const learner = {
  version: 1, updatedAt: 1,
  profile: { onboarded: true, nickname: "Dani", ageBand: "18-25", avatar: 0, ageAsked: true, remindAsked: true, seenIntros: { practice: true, portfolio: true, tools: true, news: true, keys: true, save: true } },
  settings: { lang, region: lang === "es" ? "MX" : "US", look: "white", reduceMotion: true },
  progress: { xp: 120, days: Object.fromEntries([3, 2, 1, 0].map((n) => [d(n), 20])), streak: { count: 4, last: d(0), best: 4, frozen: [] }, freezes: 1, dailyGoal: 20, lessons: Object.fromEntries(DONE.map((id) => [id, { done: true, at: d(1), last: d(1), best: 0, times: 1 }])), lessonDays: [d(2), d(1), d(0)], badges: {}, counters: { lessons: DONE.length }, practiced: {}, startUnit: "budget", placed: [] },
  modules: { feedback: { pending: [], survey: "skipped" } },
};
const T = lang === "es" ? { learn: "Aprender", goals: "Metas", practice: "Práctica", me: "Yo", settings: /^Ajustes/, check: "Comprobar" } : { learn: "Learn", goals: "Goals", practice: "Practice", me: "Me", settings: /^Settings/, check: "Check" };

// One Tab stop: what is focused, whether it is in view, whether anything covers it, and whether a ring shows.
const STOP = () => {
  const e = document.activeElement;
  if (!e || e === document.body) return null;
  const b = e.getBoundingClientRect();
  const s = getComputedStyle(e);
  const vw = innerWidth, vh = innerHeight;
  const inView = b.width > 0 && b.height > 0 && b.bottom > 0 && b.top < vh && b.right > 0 && b.left < vw;
  // The top-most thing at the middle of the control, and at its four corners (inset a little): if none of them is the control, it is covered.
  const pts = [[0.5, 0.5], [0.15, 0.2], [0.85, 0.2], [0.15, 0.8], [0.85, 0.8]].map(([x, y]) => [b.left + b.width * x, b.top + b.height * y]).filter(([x, y]) => x >= 0 && y >= 0 && x < vw && y < vh);
  const hit = pts.map(([x, y]) => { const t = document.elementFromPoint(x, y); return !!t && (e === t || e.contains(t) || t.contains(e)); });
  const covered = inView && hit.length > 0 && !hit.some(Boolean);
  const partly = inView && hit.some((v) => !v) && hit.some(Boolean);
  const ring = (s.outlineStyle !== "none" && parseFloat(s.outlineWidth) >= 2) || /\d+px/.test(s.boxShadow.replace(/rgba?\([^)]*\)/g, "").replace(/inset/g, "")) && s.boxShadow !== "none";
  const name = (e.getAttribute("aria-label") || e.innerText || e.value || e.placeholder || e.tagName).trim().replace(/\s+/g, " ").slice(0, 40);
  return { name: `${e.tagName.toLowerCase()} "${name}"`, inView, covered, partly, ring, top: Math.round(b.top), bottom: Math.round(b.bottom) };
};

const problems = [];
let stops = 0;
async function tabThrough(page, where, max = 70) {
  await page.evaluate(() => { document.activeElement && document.activeElement.blur && document.activeElement.blur(); window.scrollTo(0, 0); const d = document.querySelector("[data-player]"); if (d) d.scrollTop = 0; });
  const seen = new Set();
  for (let i = 0; i < max; i++) {
    await page.keyboard.press("Tab");
    await page.waitForTimeout(40);
    const st = await page.evaluate(STOP);
    if (!st) continue;
    const key = `${st.name}@${i}`;
    if (seen.has(st.name) && i > 8 && [...seen].filter((k) => k === st.name).length > 1) break; // came back round
    seen.add(st.name);
    stops++;
    if (!st.inView) problems.push(`${where}: ${st.name} has focus but is out of view`);
    else if (st.covered) problems.push(`${where}: ${st.name} has focus but is hidden behind something (${st.top}–${st.bottom}px)`);
    else if (st.partly) problems.push(`${where}: ${st.name} has focus and is partly covered (${st.top}–${st.bottom}px)`);
    if (st.inView && !st.ring) problems.push(`${where}: ${st.name} shows no focus ring`);
  }
}

const ctx = await browser.newContext({ viewport: { width: W, height: H }, locale: lang === "es" ? "es-MX" : "en-US", serviceWorkers: "block", reducedMotion: "reduce" });
await ctx.addInitScript((s) => localStorage.getItem("northvale-learn-v1") || localStorage.setItem("northvale-learn-v1", s), JSON.stringify(learner));
const page = await ctx.newPage();
page.setDefaultTimeout(4000);
const tab = (name) => page.getByRole("navigation").getByRole("button", { name, exact: true }).first().click();
await page.goto(BASE);
await page.evaluate(() => document.fonts.ready);

for (const [name, go] of [
  ["today", async () => tab(T.learn)],
  ["goals", async () => tab(T.goals)],
  ["practice", async () => tab(T.practice)],
  ["me", async () => tab(T.me)],
  ["settings", async () => { await tab(T.me); await page.getByRole("button", { name: T.settings }).first().click(); }],
]) {
  try { await page.goto(BASE); await page.waitForTimeout(200); await go(); await page.waitForTimeout(250); await tabThrough(page, `${lang} ${W}x${H} ${name}`); } catch (e) { problems.push(`${name}: couldn't run (${String(e.message).split("\n")[0].slice(0, 80)})`); }
}

// A lesson: an idea card, a question with its options, and the feedback (the pinned button is at the bottom of the window).
try {
  await page.goto(BASE);
  await page.getByRole("button", { name: /^(Start|Continue|Empezar|Continuar)/ }).first().click();
  const dlg = page.getByRole("dialog").last();
  await dlg.waitFor();
  await page.waitForTimeout(300);
  await tabThrough(page, `${lang} ${W}x${H} lesson: idea card`, 14);
  for (let i = 0; i < 12; i++) {
    if (await dlg.getByRole("radio").count()) break;
    await dlg.getByRole("button", { name: /^(Continue|Continuar)$/ }).click();
    await page.waitForTimeout(150);
  }
  await tabThrough(page, `${lang} ${W}x${H} lesson: question`, 14);
  await dlg.getByRole("radio").first().click();
  await dlg.getByRole("button", { name: T.check, exact: true }).click();
  await page.waitForTimeout(300);
  await tabThrough(page, `${lang} ${W}x${H} lesson: feedback`, 14);
} catch (e) { problems.push(`lesson: couldn't run (${String(e.message).split("\n")[0].slice(0, 80)})`); }

await browser.close();
server.kill();
console.log(`${stops} keyboard stops checked at ${W}x${H} in ${lang === "es" ? "Spanish" : "English"}; ${problems.length} problems`);
for (const p of [...new Set(problems)]) console.log(`  ${p}`);
process.exitCode = problems.length ? 1 : 0;
