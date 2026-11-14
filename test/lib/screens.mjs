// What the every-screen tests share (test/screens.test.mjs, test/browsers.test.mjs): a learner three weeks in, a watcher
// for anything going wrong in a page, and `look`, which fails on errors, anything off the side or cut off, a raw text key,
// "undefined", "NaN" or an unfilled {placeholder}.
import assert from "node:assert/strict";
import { readFileSync, readdirSync } from "node:fs";
import { join } from "node:path";
import { ALL_LESSONS } from "../../src/modules/lessons/content.js";
import * as P from "../../src/modules/goals/plan.js";

const ROOT = join(import.meta.dirname, "..", "..");
export const counter = { looked: 0 };

// The text keys the app uses ("lessons.start"), so a key showing on screen is caught.
const prefixes = new Set();
for (const f of readdirSync(join(ROOT, "src"), { recursive: true }).filter((f) => /\.jsx?$/.test(f)))
  for (const m of readFileSync(join(ROOT, "src", f), "utf8").matchAll(/"([a-z_]+)\.[a-z0-9_.]+":\s*S\(/g)) prefixes.add(m[1]);
const RAW = new RegExp(`(?<![\\w@/.-])(?:${[...prefixes].join("|")})\\.[a-z0-9_]+(?:\\.[a-z0-9_]+)*(?![\\w-])`, "g");
const BROKEN = /\{[@$]?[A-Za-z_][^{}]*\}|\bNaN\b|\bundefined\b|\[object Object\]/g;

export const d = (n) => new Date(Date.now() - n * 864e5).toLocaleDateString("en-CA");
const done = ALL_LESSONS.slice(0, 28).map((l) => l.id);
const xp = [0, 25, 20, 0, 30, 25, 20, 40, 0, 25, 30, 20, 25, 0, 35, 25, 20, 30, 25, 20, 25];
const days = Object.fromEntries(xp.map((v, i) => [d(20 - i), v]).filter(([, v]) => v));
export const weeks = {
  version: 1, updatedAt: 1,
  profile: { onboarded: true, nickname: "Alex", ageBand: "18-25", avatar: 1, ageAsked: true, remindAsked: true, seenNote: "x", reason: "car", seenIntros: { practice: d(15), portfolio: true, tools: true, news: true, goals: true, goalPlan: true, keys: d(15) }, goalFor: "car" },
  settings: { lang: "en", region: "US", look: "white", reduceMotion: true, analytics: false },
  progress: { xp: 640, days, streak: { count: 9, last: d(0), best: 9, frozen: [] }, freezes: 1, dailyGoal: 20, lessons: Object.fromEntries(done.map((id, i) => [id, { done: true, at: d(20 - Math.floor(i * 0.7)), last: d(20 - Math.floor(i * 0.7)), best: i % 3 ? 0 : 1, times: 1 }])), lessonDays: Object.keys(days), badges: { first_lesson: d(20), streak_3: d(15), streak_7: d(10), perfect: d(12), goal_setter: d(19), unit: d(14) }, counters: { lessons: 28 }, practiced: {}, startUnit: "budget", placed: [], seen: d(0) },
  modules: { goals: { goals: [{ ...P.newGoal({ id: "g1", templateId: "car", name: "My first car", target: 4000, months: 18, start: 0, path: "save", today: d(20), region: "US" }), contributions: [{ date: d(18), amount: 300 }, { date: d(11), amount: 250 }, { date: d(4), amount: 350 }] }], checkIn: d(0) }, feedback: { pending: [], survey: "very" } },
};


// Listen to a page: anything wrong (console errors, failed requests, server errors) is collected in the array it returns.
export function watch(page) {
  const trouble = [];
  page.on("console", (m) => m.type() === "error" && trouble.push(`console: ${m.text().slice(0, 160)}`));
  page.on("pageerror", (e) => trouble.push(`error: ${String(e).slice(0, 160)}`));
  page.on("requestfailed", (r) => !/favicon|\/api\/(analytics|events)/.test(r.url()) && trouble.push(`failed: ${r.url().slice(0, 100)}`));
  page.on("response", (r) => r.status() >= 500 && trouble.push(`${r.status()}: ${r.url().slice(0, 100)}`));
  return trouble;
}

export async function look(page, trouble, where) {
  await page.waitForTimeout(250);
  counter.looked++;
  const r = await page.evaluate(() => {
    const clipped = (el) => {
      for (let p = el.parentElement; p && p !== document.body; p = p.parentElement) if (/(auto|scroll|hidden|clip)/.test(getComputedStyle(p).overflowX)) return true;
      return false;
    };
    const cut = [];
    for (const el of document.querySelectorAll("body *")) {
      if (el.closest(".nv-sr") || el instanceof SVGElement) continue;
      const b = el.getBoundingClientRect();
      if (!b.width || !b.height) continue;
      if ((b.right > innerWidth + 1 || b.left < -1) && !clipped(el)) cut.push(`${el.tagName.toLowerCase()} ${Math.round(b.left)}–${Math.round(b.right)} “${(el.textContent || "").trim().slice(0, 30)}”`);
    }
    return { over: document.documentElement.scrollWidth - innerWidth, cut: cut.slice(0, 3), text: document.body.innerText };
  });
  assert.ok(r.over <= 0, `${where}: the page is ${r.over}px wider than the screen`);
  assert.deepEqual(r.cut, [], `${where}: cut off: ${r.cut.join("; ")}`);
  assert.deepEqual([...r.text.matchAll(RAW)].map((m) => m[0]).slice(0, 3), [], `${where}: a raw text key is showing`);
  assert.deepEqual([...r.text.matchAll(BROKEN)].map((m) => m[0]).slice(0, 3), [], `${where}: broken text`);
  assert.deepEqual(trouble.splice(0), [], `${where}: errors`);
}

export const tab = (page, name) => page.getByRole("navigation", { name: "Main tabs" }).getByRole("button", { name, exact: true }).click();
