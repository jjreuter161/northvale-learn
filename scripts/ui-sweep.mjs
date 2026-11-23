// A sweep of every screen a person can reach, at several window sizes, in both languages and two looks.
// For each it reports what a quick look would miss: the page running off the side, something you tap that is
// smaller than 44px, text smaller than 12px, text that is cut off, an image with no name, and console errors.
//   node scripts/ui-sweep.mjs                    the usual sizes, English and Spanish, Cream and Navy
//   node scripts/ui-sweep.mjs --sizes 320x568    only these sizes (comma-separated WxH)
//   node scripts/ui-sweep.mjs --shots <folder>   also save a screenshot of every screen
//   node scripts/ui-sweep.mjs --spacing          with the text spacing people can set (WCAG 1.4.12): lines 1.5, letters .12em, words .16em
// It starts the server on a random port with no keys and a temporary data folder (like the tests), and changes nothing.
import { chromium } from "playwright-core";
import { spawn } from "node:child_process";
import { mkdirSync, mkdtempSync } from "node:fs";
import { join } from "node:path";
import { tmpdir } from "node:os";

const ROOT = join(import.meta.dirname, "..");
const arg = (name) => { const i = process.argv.indexOf(`--${name}`); return i >= 0 ? process.argv[i + 1] : null; };
const SIZES = (arg("sizes") || "320x568,390x844,768x1024,1366x768").split(",").map((s) => s.split("x").map(Number));
const SHOTS = arg("shots");
const SPACING = process.argv.includes("--spacing");
if (SHOTS) mkdirSync(SHOTS, { recursive: true });

const port = 30000 + Math.floor(Math.random() * 20000);
const env = { ...process.env, NORTHVALE_DOTENV: "0", PORT: String(port), NORTHVALE_DATA: mkdtempSync(join(tmpdir(), "nvl-sweep-")), ANTHROPIC_API_KEY: "", TWELVEDATA_API_KEY: "", SMTP_USER: "", SMTP_PASS: "", NEWS_FEEDS: JSON.stringify({ US: [], MX: [] }) };
const server = spawn(process.execPath, [join(ROOT, "server/index.js")], { env, stdio: ["ignore", "pipe", "inherit"] });
await new Promise((r) => server.stdout.on("data", (d) => String(d).includes("Northvale Learn on") && r()));
const BASE = `http://127.0.0.1:${port}/`;
const browser = await chromium.launch({ channel: "chrome", headless: true });

const d = (n) => new Date(Date.now() - n * 864e5).toLocaleDateString("en-CA");
const DONE = ["budget-1", "budget-2", "budget-3", "save-1", "save-2", "save-3", "banking-1", "banking-2", "banking-3", "banking-4", "paycheck-1", "paycheck-2", "paycheck-3"];
const learner = (lang, look) => ({
  version: 1, updatedAt: 1,
  profile: { onboarded: true, nickname: "Dani", ageBand: "18-25", avatar: 0, ageAsked: true, remindAsked: true, seenIntros: { practice: true, portfolio: true, tools: true, news: true, keys: true, save: true } },
  settings: { lang, region: lang === "es" ? "MX" : "US", look, reduceMotion: true },
  progress: { xp: 260, days: Object.fromEntries([6, 5, 4, 3, 2, 1, 0].map((n) => [d(n), 20])), streak: { count: 7, last: d(0), best: 7, frozen: [] }, freezes: 1, dailyGoal: 20, lessons: Object.fromEntries(DONE.map((id) => [id, { done: true, at: d(1), last: d(1), best: 0, times: 1 }])), lessonDays: [d(3), d(2), d(1), d(0)], badges: {}, counters: { lessons: DONE.length }, practiced: {}, startUnit: "budget", placed: [] },
  modules: { feedback: { pending: [], survey: "skipped" }, goals: { goals: [{ id: "g1", template: "emergency", name: "", currency: lang === "es" ? "MXN" : "USD", target: lang === "es" ? 15000 : 1000, start: 0, contributions: [{ date: d(3), amount: lang === "es" ? 1500 : 100 }], linked: [], status: "active", createdAt: d(9), planFrom: d(9), targetDate: new Date(Date.now() + 300 * 864e5).toLocaleDateString("en-CA"), path: "save", history: [] }], budget: null } },
});

// What to measure on a screen.
const MEASURE = () => {
  const out = { wide: document.documentElement.scrollWidth - window.innerWidth, small: [], tiny: [], cut: [], noname: [], reds: 0 };
  const vis = (e) => { const b = e.getBoundingClientRect(); const s = getComputedStyle(e); return b.width > 0 && b.height > 0 && s.visibility !== "hidden" && s.display !== "none" && !e.closest("[aria-hidden=true]") && !e.closest("[inert]") && !(e.closest("details:not([open])") && !e.closest("summary")); };
  const label = (e) => `${e.tagName.toLowerCase()}${e.className && typeof e.className === "string" ? "." + e.className.split(" ")[0] : ""} "${(e.getAttribute("aria-label") || e.innerText || e.value || "").trim().replace(/\s+/g, " ").slice(0, 36)}"`;
  for (const e of document.querySelectorAll("button, a[href], [role=button], [role=radio], [role=switch], input:not([type=hidden]), select, textarea, summary")) {
    if (!vis(e)) continue;
    // A link inside a sentence is as big as its text; only controls count.
    if (e.tagName === "A" && e.closest("p, li, span") && getComputedStyle(e).display === "inline") continue;
    const b = e.getBoundingClientRect();
    if (b.height < 43.5 || b.width < 43.5) out.small.push(`${label(e)} ${Math.round(b.width)}x${Math.round(b.height)}`);
  }
  for (const e of document.querySelectorAll("body *")) {
    if (!vis(e) || e.closest("svg")) continue;
    const own = [...e.childNodes].some((n) => n.nodeType === 3 && n.textContent.trim());
    if (own && parseFloat(getComputedStyle(e).fontSize) < 11.5) out.tiny.push(`${label(e)} ${getComputedStyle(e).fontSize}`);
    const s = getComputedStyle(e);
    if (own && (s.overflow === "hidden" || s.overflowX === "hidden") && e.scrollWidth > e.clientWidth + 1 && s.textOverflow !== "ellipsis" && s.whiteSpace !== "nowrap") out.cut.push(`${label(e)} ${e.scrollWidth}>${e.clientWidth}`);
  }
  for (const e of document.querySelectorAll("img:not([alt]), button:not([aria-label]):empty, a:not([aria-label]):empty")) if (vis(e)) out.noname.push(label(e));
  // One red thing per screen: the signal red as a fill (the main button) shows once at most.
  out.reds = [...document.querySelectorAll("body *")].filter((e) => vis(e) && getComputedStyle(e).backgroundColor === "rgb(200, 32, 42)").length;
  return out;
};

// Every screen: how to get there from the learner's home (Today), and what it is called.
const L = {
  en: { learn: "Learn", goals: "Goals", practice: "Practice", me: "Me", settings: /^Settings/, ask: /^Ask$/, rows: { goal: /^Emergency fund/, record: /^Record money set aside/, newGoal: /New goal|Add a goal/, budgetTool: /^Budget planner/, startMission: /^Start mission/, certs: /^Certificates/, missions: /^Real-life missions/, year: /^Your Money Year/, tools: /^Tools from your lessons/, news: /^News, explained/, portfolio: /^Practice portfolio/, ach: /^Achievements/, skills: /^Skills/, profile: /^Profile$/, learning: /^Learning$/, account: /^Account/, sound: /^Sound and feel/, privacy: /^Privacy$/, legal: /^Legal$/, about: /^About/ } },
  es: { learn: "Aprender", goals: "Metas", practice: "Práctica", me: "Yo", settings: /^Ajustes/, ask: /^Preguntar$/, rows: { goal: /^Fondo de emergencia/, record: /^Registrar dinero apartado/, newGoal: /Nueva meta|Agregar una meta/, budgetTool: /^Planificador|^Presupuesto/, startMission: /^(Empezar|Iniciar|Comenzar|Hacer).*misión|^Empezar la misión/i, certs: /^Certificados/, missions: /^Misiones/, year: /^Tu año/, tools: /^Herramientas/, news: /^Noticias/, portfolio: /^Portafolio/, ach: /^Logros/, skills: /^Habilidades/, profile: /^Perfil$/, learning: /^Aprendizaje$/, account: /^Cuenta/, sound: /^Sonido/, privacy: /^Privacidad$/, legal: /^Legal$/, about: /^Acerca/ } },
};
const SCREENS = (l) => [
  ["today", async (p) => { await tab(p, l.learn); }],
  ["goals", async (p) => { await tab(p, l.goals); }],
  ["practice", async (p) => { await tab(p, l.practice); }],
  ["me", async (p) => { await tab(p, l.me); }],
  ...["missions", "year", "tools", "news", "portfolio"].map((k) => [k, async (p) => { await tab(p, l.practice); await row(p, l.rows[k]); }]),
  ...["ach", "skills"].map((k) => [k, async (p) => { await tab(p, l.me); await row(p, l.rows[k]); }]),
  ["settings", async (p) => { await tab(p, l.me); await row(p, l.settings); }],
  ...["profile", "learning", "account", "sound", "privacy", "legal", "about"].map((k) => [`settings-${k}`, async (p) => { await tab(p, l.me); await row(p, l.settings); await row(p, l.rows[k]); }]),
  ["goal", async (p) => { await tab(p, l.goals); await p.getByRole("button", { name: l.rows.goal }).first().click({ timeout: 3000 }); }],
  ["goal-record", async (p) => { await tab(p, l.goals); await p.getByRole("button", { name: l.rows.record }).first().click({ timeout: 3000 }); }],
  ["goal-new", async (p) => { await tab(p, l.goals); await p.getByRole("button", { name: l.rows.newGoal }).first().click({ timeout: 3000 }); }],
  ["tool-budget", async (p) => { await tab(p, l.practice); await row(p, l.rows.tools); await row(p, l.rows.budgetTool); }],
  ["mission-start", async (p) => { await tab(p, l.practice); await p.getByRole("button", { name: l.rows.startMission }).first().click({ timeout: 3000 }); }],
  ["certificates", async (p) => { await tab(p, l.me); await row(p, l.rows.certs); }],
  ["ask", async (p) => { await tab(p, l.learn); await row(p, l.ask); }],
  ["streak", async (p) => { await tab(p, l.learn); await p.getByRole("button", { name: /\d+/ }).first().click(); }],
  ["course", async (p) => { await tab(p, l.learn); await p.locator("#nv-course").scrollIntoViewIfNeeded(); }],
];
const tab = (p, name) => p.getByRole("navigation").getByRole("button", { name, exact: true }).first().click({ timeout: 3000 });
const row = (p, re) => p.getByRole("button", { name: re }).first().click({ timeout: 3000 });

const problems = [];
let looked = 0;
for (const lang of ["en", "es"]) {
  for (const look of ["white", "navy"]) {
    for (const [w, h] of SIZES) {
      const ctx = await browser.newContext({ viewport: { width: w, height: h }, deviceScaleFactor: 1, locale: lang === "es" ? "es-MX" : "en-US", serviceWorkers: "block", reducedMotion: "reduce" });
      await ctx.addInitScript((s) => localStorage.getItem("northvale-learn-v1") || localStorage.setItem("northvale-learn-v1", s), JSON.stringify(learner(lang, look)));
      const page = await ctx.newPage();
      page.setDefaultTimeout(4000);
      const errors = [];
      page.on("console", (m) => m.type() === "error" && errors.push(m.text()));
      page.on("pageerror", (e) => errors.push(String(e)));
      await page.goto(BASE);
      await page.evaluate(() => document.fonts.ready);
      const desk = w >= 1024;
      for (const [name, go] of SCREENS(L[lang])) {
        const where = `${lang} ${look === "white" ? "cream" : look} ${w}x${h} ${name}`;
        try {
          // Back to the start each time, so a screen doesn't depend on the one before it.
          await page.goto(BASE);
          await page.waitForTimeout(150);
          await go(page);
          await page.waitForTimeout(250);
        } catch (e) {
          if (!(desk && name === "streak")) problems.push(`${where}: couldn't open (${String(e.message).split("\n")[0].slice(0, 70)})`);
          continue;
        }
        looked++;
        if (SPACING) { await page.addStyleTag({ content: "*{line-height:1.5!important;letter-spacing:.12em!important;word-spacing:.16em!important}p{margin-bottom:2em!important}" }); await page.waitForTimeout(150); }
        const m = await page.evaluate(MEASURE);
        if (m.wide > 0) problems.push(`${where}: ${m.wide}px wider than the screen`);
        for (const s of m.small) problems.push(`${where}: small to tap: ${s}`);
        for (const s of m.tiny) problems.push(`${where}: tiny text: ${s}`);
        for (const s of m.cut) problems.push(`${where}: text cut off: ${s}`);
        for (const s of m.noname) problems.push(`${where}: no name: ${s}`);
        if (m.reds > 1) problems.push(`${where}: ${m.reds} red buttons (one at most)`);
        if (errors.length) problems.push(`${where}: console: ${errors.splice(0).join(" | ").slice(0, 120)}`);
        if (SHOTS) await page.screenshot({ path: join(SHOTS, `${lang}-${look}-${w}x${h}-${name}.png`) });
      }
      await ctx.close();
    }
  }
}
await browser.close();
server.kill();
// The same finding at another size or look counts once, with where it showed.
const grouped = new Map();
for (const p of problems) {
  const i = p.indexOf(": ");
  const where = p.slice(0, i), what = p.slice(i + 2).replace(/ \d+x\d+$/, "").replace(/ \d+>\d+$/, "").replace(/ [\d.]+px$/, "");
  (grouped.get(what) || grouped.set(what, []).get(what)).push(where);
}
console.log(`${looked} screens looked at, ${problems.length} things to look at (${grouped.size} different)`);
for (const [what, where] of [...grouped].sort((a, b) => b[1].length - a[1].length).slice(0, 90)) console.log(`${String(where.length).padStart(3)}×  ${what}   [${[...new Set(where)].slice(0, 3).join("; ")}${where.length > 3 ? "; …" : ""}]`);
