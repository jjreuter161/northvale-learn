// Screenshots of the BUILT app in each look (no overlay: the look is chosen the way a person chooses it).
//   node docs/design/colors/shots.mjs
// Writes docs/design/colors/build/{preset}-{screen}.jpg, an overview for each preset and build/index.html.
import { spawn } from "node:child_process";
import { mkdtempSync, mkdirSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { chromium } from "playwright-core";
import { ALL_LESSONS, UNITS } from "../../../src/modules/lessons/content.js";
import { UNITS as FULL } from "../../../src/modules/lessons/units/all.js";
import { PRESETS } from "./tokens.mjs";

const ROOT = join(import.meta.dirname, "../../..");
const OUT = join(import.meta.dirname, "build");
mkdirSync(OUT, { recursive: true });
const port = 20000 + Math.floor(Math.random() * 20000);
const env = { ...process.env, NORTHVALE_DOTENV: "0", PORT: String(port), NORTHVALE_DATA: mkdtempSync(join(tmpdir(), "nvl-colors-")), ANTHROPIC_API_KEY: "", ANTHROPIC_AUTH_TOKEN: "", TWELVEDATA_API_KEY: "" };
const server = spawn(process.execPath, [join(ROOT, "server/index.js")], { env, stdio: ["ignore", "pipe", "inherit"] });
await new Promise((r) => server.stdout.on("data", (d) => String(d).includes("Northvale Learn on") && r()));
const BASE = `http://127.0.0.1:${port}/`;
const browser = await chromium.launch({ channel: "chrome", headless: true });
const day = (n) => new Date(Date.now() + n * 864e5).toLocaleDateString("en-CA");

const DONE = ALL_LESSONS.filter((l) => ["budget", "save", "banking"].includes(l.unit));
const learner = (lang, region, look = "white") => {
  const lessons = Object.fromEntries(DONE.map((l, i) => [l.id, { done: true, at: day(i - 20), last: day(i - 20), best: 0, times: 1 }]));
  const days = Object.fromEntries(Array.from({ length: 5 }, (_, i) => [day(i - 4), 25]));
  const goal = { id: "g1", template: "car", name: lang === "es" ? "Mi primer carro" : "My first car", currency: region === "MX" ? "MXN" : "USD", target: region === "MX" ? 60000 : 4000, months: 18, start: 0, path: "save", createdAt: day(-30), contributions: [{ date: day(-20), amount: region === "MX" ? 8000 : 600 }, { date: day(-5), amount: region === "MX" ? 5000 : 400 }] };
  return { version: 1, updatedAt: 1, profile: { onboarded: true, nickname: "Alex", ageBand: "18-25", avatar: 1, ageAsked: true, remindAsked: true, seenIntros: { practice: day(-9), portfolio: true, tools: true, news: true, goals: true } }, settings: { lang, region, look, reduceMotion: true, analytics: false }, progress: { xp: 190, days, streak: { count: 5, last: day(0), best: 5, frozen: [] }, freezes: 1, dailyGoal: 20, lessons, lessonDays: Object.keys(days), badges: { first_lesson: day(-14) }, counters: { lessons: DONE.length }, practiced: {}, startUnit: "budget", placed: [], seen: day(0) }, modules: { goals: { goals: [goal], checkIn: day(0) }, feedback: { pending: [], survey: "very" } } };
};

// The app's own colors stay; only animations are frozen so screenshots are steady.
async function applyLook(page) {
  await page.evaluate(() => {
    let st = document.getElementById("mock-look");
    if (!st) (st = document.createElement("style")), (st.id = "mock-look"), document.head.append(st);
    st.textContent = "*,*::before,*::after{animation:none!important;transition:none!important}";
  });
}

const signup = async (email) => {
  const res = await fetch(`${BASE}api/auth/signup`, { method: "POST", headers: { "X-Northvale": "1", "Content-Type": "application/json" }, body: JSON.stringify({ email, password: "a good long password", nickname: "Alex", ageBand: "18-25" }) });
  return res.headers.get("set-cookie").split(";")[0];
};
const ANSWER = {
  en: "**What this is** — A text pretending to be your bank. It says your account is locked and asks for your PIN.\n**Numbers that matter** — A 24-hour deadline. Real banks never ask for a PIN.\n**Watch out for** — This looks like a scam: urgency, a link that isn't your bank's, and a PIN request. Don't click or reply. Check with your bank through its own app or phone number.\n**Questions to ask** — Does my bank's app show a lock? Who can I call at the number on my card?",
  es: "**Qué es esto** — Un mensaje que finge ser tu banco. Dice que tu cuenta está bloqueada y pide tu NIP.\n**Los números que importan** — Un plazo de 24 horas. Los bancos de verdad nunca piden el NIP.\n**Ojo con esto** — Parece una estafa: prisa, un enlace que no es de tu banco y la petición de tu NIP. No des clic ni respondas. Confírmalo con tu banco desde su app o su teléfono oficial.\n**Preguntas para hacer** — ¿Mi app del banco muestra un bloqueo? ¿A qué número de mi tarjeta puedo llamar?",
};
const shot = async (page, preset, name) => (page.__look && (await applyLook(page)), page.screenshot({ path: join(OUT, `${preset}-${name}.jpg`), type: "jpeg", quality: 78 }));
const esc = (s) => s.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
const SCREENS = ["1-today", "2-sea-chart", "3-question", "4-correct", "5-not-quite", "6-finish", "7-goals", "8-practice", "9-me", "10-color-picker", "11-explain-red-flag", "12-money-year"];

async function runPreset(p, lang = "en", region = "US", only = null) {
  const es = lang === "es";
  const tag = es ? `${p.id}-es` : p.id;
  const seed = learner(lang, region, p.value);
  const cookie = await signup(`shots-${tag}@example.test`);
  await fetch(`${BASE}api/progress`, { method: "PUT", headers: { "X-Northvale": "1", "Content-Type": "application/json", Cookie: cookie }, body: JSON.stringify({ state: seed, updatedAt: seed.updatedAt }) });
  const ctx = await browser.newContext({ viewport: { width: 390, height: 800 }, deviceScaleFactor: 1.5, locale: es ? "es-MX" : "en-US", serviceWorkers: "block", reducedMotion: "reduce" });
  await ctx.addCookies([{ name: "nvl_session", value: cookie.split("=")[1], url: BASE }]);
  await ctx.addInitScript((s) => localStorage.getItem("northvale-learn-v1") || localStorage.setItem("northvale-learn-v1", s), JSON.stringify(seed));
  const page = await ctx.newPage();
  await page.route("**/api/health", async (r) => r.fulfill({ json: { ...(await (await r.fetch()).json()), ai: true } }));
  await page.route("**/api/explain/turn", async (r) => {
    const ev = (e, d) => `event: ${e}\ndata: ${JSON.stringify(d)}\n\n`;
    await r.fulfill({ status: 200, headers: { "Content-Type": "text/event-stream" }, body: ev("text", { text: ANSWER[lang] + "\n[Topics: scams]" }) + ev("done", { text: ANSWER[lang], topics: ["scams"], stop_reason: "end_turn" }) });
  });
  page.setDefaultTimeout(8000);
  await page.goto(BASE);
  await page.waitForTimeout(600);
  page.__look = p;
  await applyLook(page);
  await page.waitForTimeout(4600); // achievement toasts come and go
  const nav = (en, esn) => page.getByRole("navigation").getByRole("button", { name: es ? esn : en, exact: true }).click();
  const top = () => page.getByRole("dialog").last();
  const btn = (re) => top().getByRole("button", { name: re }).first();
  const next = () => btn(es ? /^Continuar$/ : /^Continue$/).click();
  const check = () => btn(es ? /^Comprobar$/ : /^Check$/).click();
  await shot(page, tag, "1-today");
  if (only === "today") return ctx.close();

  // The course.
  await page.evaluate(() => window.scrollTo(0, 880));
  await page.waitForTimeout(300);
  await shot(page, tag, "2-sea-chart");
  await page.evaluate(() => window.scrollTo(0, 0));

  // A lesson played right (a question, a right answer, the finish), then the next lesson's first question answered "not quite".
  const FULLL = FULL.flatMap((u) => u.lessons.map((l) => ({ ...l, unit: u.id })));
  const openLesson = async (id) => {
    const l = FULLL.find((x) => x.id === id);
    const unitNo = UNITS.findIndex((u) => u.id === l.unit) + 1;
    const isle = page.getByRole("button", { name: new RegExp(`^${es ? "Unidad" : "Unit"} ${unitNo} · `) });
    if ((await isle.getAttribute("aria-expanded")) === "false") await isle.click();
    await page.getByRole("button", { name: new RegExp(`^${esc(l.title[lang])} — `) }).click();
    await page.locator('[aria-busy="true"]').waitFor({ state: "detached", timeout: 10000 });
    return l;
  };
  const doOrder = async (st, right) => {
    const idx = st.items.map((_, i) => i);
    for (const i of right ? idx : idx.reverse()) await top().locator(`[data-q="order-item"][data-i="${i}"]`).click();
  };
  const lesson = await openLesson("paycheck-1");
  await next();
  await next();
  await page.waitForTimeout(250);
  await shot(page, tag, "3-question");
  await doOrder(lesson.steps[2], true);
  await check();
  await page.waitForTimeout(350);
  await shot(page, tag, "4-correct");
  await next();
  await top().getByRole("radio").nth(0).click();
  await check();
  await next();
  await top().locator('[data-q="number"]').fill(String([].concat(lesson.steps[4].spec.answer)[region === "MX" ? 1 : 0] ?? lesson.steps[4].spec.answer));
  await check();
  await next();
  await btn(es ? /^(Saltar por ahora|Listo, continuar)$/ : /^(Skip for now|Done — continue)$/).click();
  if (await top().locator("[data-moment]").count()) await next();
  await top().getByRole("button", { name: es ? /^Listo$/ : /^Done$/ }).waitFor();
  await page.waitForTimeout(500);
  await shot(page, tag, "6-finish");
  await top().getByRole("button", { name: es ? /^Listo$/ : /^Done$/ }).click();
  await page.getByRole("dialog").waitFor({ state: "detached" });
  const second = await openLesson("paycheck-2");
  await next();
  await next();
  await top().getByRole("radio").nth((second.steps[2].answer + 1) % second.steps[2].options.length).click();
  await check();
  await page.waitForTimeout(350);
  await shot(page, tag, "5-not-quite");
  await top().getByRole("button", { name: es ? /^(Cerrar)$/ : /^Close$/ }).first().click();
  await page.getByRole("button", { name: es ? /^Salir$/ : /^Leave$/ }).click();

  await nav("Goals", "Metas");
  await page.waitForTimeout(350);
  await shot(page, tag, "7-goals");
  await nav("Practice", "Práctica");
  await page.waitForTimeout(350);
  await shot(page, tag, "8-practice");
  await nav("Me", "Yo");
  await page.waitForTimeout(350);
  await shot(page, tag, "9-me");

  // Settings → Colors (the real picker, with your own colors open), and Explain this with a scam warning.
  await page.getByRole("button", { name: es ? /^Ajustes/ : /^Settings/ }).first().click();
  const lookGroup = page.getByRole("radiogroup", { name: es ? "Apariencia" : "Look" });
  await lookGroup.scrollIntoViewIfNeeded();
  await page.getByRole("button", { name: es ? /^Elige tus propios colores/ : /^Choose your own colors/ }).click();
  await page.getByRole("radiogroup", { name: es ? "Fondo" : "Background" }).scrollIntoViewIfNeeded();
  await page.evaluate(() => window.scrollBy(0, -330));
  await page.waitForTimeout(250);
  await shot(page, tag, "10-color-picker");
  await page.evaluate(() => window.scrollTo(0, 0));
  await page.locator("header").getByRole("button", { name: es ? "Preguntar" : "Ask" }).click();
  await top().getByRole("radio", { name: es ? "Explícame esto" : "Explain this" }).click();
  await top().getByRole("textbox").fill(es ? "Banco: tu cuenta fue BLOQUEADA. Confirma en 24 horas en banco-seguro.co con tu NIP." : "Chase Alert: your account is LOCKED. Verify within 24 hours at chase-secure-verify.co with your PIN.");
  await top().getByRole("button", { name: es ? "Explícame esto" : "Explain this", exact: true }).click();
  await top().getByText(es ? "Ojo con esto" : "Watch out for").waitFor();
  await top().getByText(es ? "Preguntas para hacer" : "Questions to ask").scrollIntoViewIfNeeded();
  await page.waitForTimeout(400);
  await shot(page, tag, "11-explain-red-flag");
  await page.keyboard.press("Escape");

  // Your Money Year.
  await nav("Practice", "Práctica");
  await page.getByRole("button", { name: es ? /^Tu Año de Dinero/ : /^Your Money Year/ }).first().click();
  await page.getByRole("button", { name: es ? /^Tu primer trabajo/ : /^Your first full-time job/ }).click();
  await page.getByRole("group", { name: es ? "Elige una" : "Choose one" }).getByRole("button").first().waitFor();
  await page.waitForTimeout(300);
  await shot(page, tag, "12-money-year");
  await ctx.close();
}

try {
  for (const p of PRESETS.slice(0, 3)) await runPreset(p);
  await runPreset(PRESETS[0], "es", "MX");
  // An overview of each preset: all twelve screens on one sheet (also build/index.html), for looking at on a phone.
  const ids = [...PRESETS.slice(0, 3).map((p) => p.id), `${PRESETS[0].id}-es`];
  const section = (id) => {
    const list = id.endsWith("-es") ? ["1-today", "9-me", "10-color-picker", "11-explain-red-flag", "12-money-year"] : SCREENS;
    const tiles = list.map((x) => `<figure><img src="${id}-${x}.jpg" alt="${id} ${x}"/><figcaption>${x.replace(/^\d+-/, "")}</figcaption></figure>`).join("");
    return `<section id="s-${id}"><h2>${id}</h2><div class="grid">${tiles}</div></section>`;
  };
  const html = `<!doctype html><meta charset="utf-8"><title>Navy, cream and signal red: the built app</title><style>body{margin:16px;font:14px system-ui;background:#fff;color:#222}h2{margin:18px 0 8px}.grid{display:flex;flex-wrap:wrap;gap:14px}figure{margin:0;width:270px}img{width:270px;border-radius:14px;display:block}figcaption{color:#555;margin-top:4px}section{width:1700px}</style>${ids.map(section).join("")}`;
  writeFileSync(join(OUT, "index.html"), html);
  const page = await browser.newPage({ viewport: { width: 1740, height: 900 } });
  await page.goto(`file://${join(OUT, "index.html")}`);
  await page.waitForLoadState("load");
  await page.waitForTimeout(800);
  for (const id of ids) await page.locator(`#s-${id}`).screenshot({ path: join(OUT, `overview-${id}.jpg`), type: "jpeg", quality: 72 });
  console.log("screenshots done");
} finally {
  await browser.close();
  server.kill();
}
