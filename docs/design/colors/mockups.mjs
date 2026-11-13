// Makes the Step 1 mockups for the navy / cream / signal red direction: the real app, running with the
// proposed colors (tokens.mjs) laid over it, plus mocked-up versions of the two screens that don't exist
// yet (the color picker, and Explain this with a red flag). Nothing in the app itself changes.
//   node docs/design/colors/mockups.mjs
// Writes docs/design/colors/mockups/{preset}-{screen}.jpg and an overview for each preset.
import { spawn } from "node:child_process";
import { mkdtempSync, mkdirSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { chromium } from "playwright-core";
import { ALL_LESSONS, UNITS } from "../../../src/modules/lessons/content.js";
import { UNITS as FULL } from "../../../src/modules/lessons/units/all.js";
import { lookFrom, PRESETS, COLORS, TINTS, allowed, contrast } from "./tokens.mjs";

const ROOT = join(import.meta.dirname, "../../..");
const OUT = join(import.meta.dirname, "mockups");
mkdirSync(OUT, { recursive: true });
const port = 20000 + Math.floor(Math.random() * 20000);
const env = { ...process.env, NORTHVALE_DOTENV: "0", PORT: String(port), NORTHVALE_DATA: mkdtempSync(join(tmpdir(), "nvl-colors-")), ANTHROPIC_API_KEY: "", ANTHROPIC_AUTH_TOKEN: "", TWELVEDATA_API_KEY: "" };
const server = spawn(process.execPath, [join(ROOT, "server/index.js")], { env, stdio: ["ignore", "pipe", "inherit"] });
await new Promise((r) => server.stdout.on("data", (d) => String(d).includes("Northvale Learn on") && r()));
const BASE = `http://127.0.0.1:${port}/`;
const browser = await chromium.launch({ channel: "chrome", headless: true });
const day = (n) => new Date(Date.now() + n * 864e5).toLocaleDateString("en-CA");

const DONE = ALL_LESSONS.filter((l) => ["budget", "save", "banking"].includes(l.unit));
const learner = (lang, region) => {
  const lessons = Object.fromEntries(DONE.map((l, i) => [l.id, { done: true, at: day(i - 20), last: day(i - 20), best: 0, times: 1 }]));
  const days = Object.fromEntries(Array.from({ length: 5 }, (_, i) => [day(i - 4), 25]));
  const goal = { id: "g1", template: "car", name: lang === "es" ? "Mi primer carro" : "My first car", currency: region === "MX" ? "MXN" : "USD", target: region === "MX" ? 60000 : 4000, months: 18, start: 0, path: "save", createdAt: day(-30), contributions: [{ date: day(-20), amount: region === "MX" ? 8000 : 600 }, { date: day(-5), amount: region === "MX" ? 5000 : 400 }] };
  return { version: 1, updatedAt: 1, profile: { onboarded: true, nickname: "Alex", ageBand: "18-25", avatar: 1, ageAsked: true, remindAsked: true, seenIntros: { practice: day(-9), portfolio: true, tools: true, news: true, goals: true } }, settings: { lang, region, look: "white", reduceMotion: true, analytics: false }, progress: { xp: 190, days, streak: { count: 5, last: day(0), best: 5, frozen: [] }, freezes: 1, dailyGoal: 20, lessons, lessonDays: Object.keys(days), badges: { first_lesson: day(-14) }, counters: { lessons: DONE.length }, practiced: {}, startUnit: "budget", placed: [], seen: day(0) }, modules: { goals: { goals: [goal], checkIn: day(0) }, feedback: { pending: [], survey: "very" } } };
};

// The look over the running app: variables, plus the three rules that variables alone can't say.
async function applyLook(page, p) {
  const L = lookFrom(p.bg, p.text, p.hi);
  const ink = COLORS[p.text].hex;
  const css = `
    /* a red button on navy gets an edge in the text color: it keeps the button visible */
    ${p.bg === "navy" && p.hi === "red" ? `.nv-btn[style*="var(--brand)"]{box-shadow:0 0 0 2px ${ink},0 5px 0 2px ${TINTS.navyDeep}!important}` : ""}
    /* a "not quite" answer: neutral, dashed, never a colored border */
    [data-right="false"]{border-style:dashed!important}
    /* words are never the red: a link or label that used the brand color uses the text color */
    [style*="color: var(--brand)"]{color:var(--ink)!important}
  `;
  await page.evaluate(({ L, css }) => {
    const roots = [document.documentElement, document.querySelector("#root > div")].filter(Boolean);
    for (const el of roots) for (const [k, v] of Object.entries(L)) el.style.setProperty(k, v);
    document.documentElement.style.colorScheme = getComputedStyle(document.documentElement).getPropertyValue("--bg").trim() === "#F7F2E8" ? "light" : "dark";
    let s = document.getElementById("mock-look");
    if (!s) (s = document.createElement("style")), (s.id = "mock-look"), document.head.append(s);
    s.textContent = css + "*,*::before,*::after{animation:none!important;transition:none!important}";
  }, { L, css });
}

const swatch = (id) => COLORS[id].hex;
// The mocked color picker (Settings → Look): presets, then three groups; only passing combinations are active.
function pickerHTML(p, lang) {
  const es = lang === "es";
  const T = (en, esT) => (es ? esT : en);
  const reasons = {
    text: T("Can't be read on this background", "No se lee bien sobre este fondo"),
    highlight: T("Blends into the background", "Se confunde con el fondo"),
  };
  const dot = (id, group) => {
    const bg = group === "bg" ? id : p.bg, text = group === "text" ? id : p.text, hi = group === "hi" ? id : p.hi;
    const ok = allowed(bg, text, hi);
    const selected = (group === "bg" ? p.bg : group === "text" ? p.text : p.hi) === id;
    const why = !ok ? (group === "hi" ? reasons.highlight : reasons.text) : id === "red" && group === "bg" ? T("Bold: not for long sessions", "Intensa: no para sesiones largas") : id === "red" && group === "hi" && p.bg === "navy" ? T("With a cream edge", "Con un borde crema") : "";
    return `<div style="flex:1;text-align:center;opacity:${ok ? 1 : 0.4}">
      <div aria-hidden="true" style="width:52px;height:52px;border-radius:26px;margin:0 auto;background:${swatch(id)};border:3px solid ${selected ? "var(--ink)" : "var(--line)"};box-shadow:${selected ? "0 0 0 3px var(--bg),0 0 0 5px var(--ink)" : "none"};position:relative">${!ok ? `<span style="position:absolute;inset:0;display:flex;align-items:center;justify-content:center;font-size:26px;color:${id === "cream" ? "#10223F" : "#F7F2E8"}">⌀</span>` : ""}</div>
      <div style="font-size:14px;font-weight:650;margin-top:6px">${COLORS[id].name[es ? "es" : "en"]}</div>
      <div style="font-size:11.5px;color:var(--mid);min-height:28px;line-height:1.25;margin-top:2px">${why}</div></div>`;
  };
  const group = (title, g) => `<div style="margin:18px 0 0"><div style="font-size:15px;font-weight:700;margin-bottom:10px">${title}</div><div style="display:flex;gap:6px">${["navy", "cream", "red"].map((id) => dot(id, g)).join("")}</div></div>`;
  const preset = (x) => {
    const sel = x.id === p.id;
    const L = lookFrom(x.bg, x.text, x.hi);
    return `<div style="border:2px solid ${sel ? "var(--ink)" : "var(--line)"};border-radius:18px;padding:10px;background:var(--surface)">
      <div style="height:62px;border-radius:12px;background:${L["--bg"]};border:1px solid var(--line);padding:9px 10px;display:flex;flex-direction:column;justify-content:space-between">
        <span style="font:700 17px/1 ui-serif,Georgia,serif;color:${L["--ink"]}">Aa</span>
        <span style="height:14px;width:58px;border-radius:7px;background:${L["--brand"]};${x.bg === "navy" && x.hi === "red" ? `box-shadow:0 0 0 1.5px ${L["--ink"]}` : ""}"></span></div>
      <div style="font-weight:700;font-size:14.5px;margin-top:8px">${x.name[es ? "es" : "en"]}${sel ? " ✓" : ""}</div>
      <div style="font-size:12px;color:var(--mid);line-height:1.3">${x.note[es ? "es" : "en"]}</div></div>`;
  };
  return `<div style="padding:18px 16px 28px;color:var(--ink);background:var(--bg);min-height:100vh;font-family:Inter,system-ui,sans-serif">
    <div style="font-size:13px;color:var(--mid);margin-bottom:4px">${T("Settings", "Ajustes")}</div>
    <h1 class="nv-disp" style="font-size:32px;margin:0 0 4px">${T("Colors", "Colores")}</h1>
    <p style="margin:0 0 14px;color:var(--mid);font-size:15px;line-height:1.4">${T("Pick a ready-made look, or choose each color yourself. Only readable combinations are offered.", "Elige un estilo listo, o escoge cada color tú. Solo se ofrecen combinaciones que se leen bien.")}</p>
    <div style="display:grid;grid-template-columns:1fr 1fr;gap:10px">${PRESETS.map(preset).join("")}</div>
    <div style="display:flex;align-items:center;gap:12px;margin:16px 0 0;padding:12px 14px;border-radius:16px;background:var(--surface)"><div style="flex:1"><div style="font-weight:650">${T("Match my device", "Igual que mi dispositivo")}</div><div style="font-size:13px;color:var(--mid)">${T("Navy at night, Cream by day", "Azul de noche, crema de día")}</div></div><div style="width:52px;height:32px;border-radius:16px;background:var(--surface2);border:2px solid var(--line);position:relative"><div style="position:absolute;top:3px;left:3px;width:22px;height:22px;border-radius:11px;background:var(--mid)"></div></div></div>
    ${group(T("Background", "Fondo"), "bg")}${group(T("Text and icons", "Texto e íconos"), "text")}${group(T("Main buttons and highlights", "Botones principales y resaltes"), "hi")}
    <button class="nv-btn nv-press" style="margin-top:22px;width:100%;border:none;border-radius:18px;min-height:52px;font-size:17px;font-weight:700;background:var(--brand);color:var(--onBrand);${p.bg === "navy" && p.hi === "red" ? `box-shadow:0 0 0 2px var(--ink),0 5px 0 2px ${TINTS.navyDeep}` : ""}">${T("Use this look", "Usar este estilo")}</button>
  </div>`;
}
// Explain this, with a scam red flag: the red is a small mark beside the words, never the words themselves.
function explainHTML(p, lang) {
  const es = lang === "es";
  const T = (en, esT) => (es ? esT : en);
  const mark = p.hi === "red" ? (p.bg === "cream" ? COLORS.red.hex : TINTS.redLight) : "var(--ink)";
  const flag = `<svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="${mark}" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M5 21V4"/><path d="M5 4h12l-2.5 4 2.5 4H5"/></svg>`;
  const sec = (label, body) => `<div style="margin:0 0 12px"><div style="font-weight:700">${label}</div><div style="color:var(--ink)">${body}</div></div>`;
  return `<div style="padding:16px;background:var(--bg);color:var(--ink);min-height:100vh;font-family:Inter,system-ui,sans-serif">
    <h1 class="nv-disp" style="font-size:30px;margin:4px 0 12px">${T("Tutor", "Tutor")}</h1>
    <div style="display:flex;background:var(--surface);border-radius:14px;padding:4px;gap:4px;margin-bottom:12px"><div style="flex:1;text-align:center;padding:9px;color:var(--mid);font-weight:650">Chat</div><div style="flex:1;text-align:center;padding:9px;border-radius:11px;background:var(--surface2);font-weight:700">${T("Explain this", "Explícame esto")}</div></div>
    <div style="background:var(--surface);border-radius:18px;padding:14px;font-size:15px;line-height:1.45;color:var(--mid);margin-bottom:12px;border:1px solid var(--line)">${T("Chase Alert: your account is LOCKED. Verify within 24 hours at chase-secure-verify.co with your card [card or account number hidden] and your PIN.", "Alerta del banco: tu cuenta está BLOQUEADA. Confirma en 24 horas en banco-seguro.co con tu tarjeta [número de tarjeta o cuenta oculto] y tu NIP.")}</div>
    <div style="background:var(--surface);border-radius:18px 18px 18px 4px;padding:14px 16px;font-size:16px;line-height:1.5">
      ${sec(T("What this is", "Qué es esto"), T("A text pretending to be your bank. It says your account is locked and asks for your PIN.", "Un mensaje que finge ser tu banco. Dice que tu cuenta está bloqueada y pide tu NIP."))}
      ${sec(T("Numbers that matter", "Los números que importan"), T("A 24-hour deadline. Real banks never ask for a PIN.", "Un plazo de 24 horas. Los bancos de verdad nunca piden el NIP."))}
      <div style="display:flex;gap:12px;margin:0 0 12px;padding:12px 12px 12px 10px;border-radius:14px;background:${p.hi === "red" ? "var(--badSoft)" : "var(--surface2)"};border-left:5px solid ${mark}">
        <div style="padding-top:1px">${flag}</div>
        <div><div style="font-weight:750">${T("Watch out for: this looks like a scam", "Ojo con esto: parece una estafa")}</div><div>${T("Urgency, a link that isn't your bank's, and a request for your PIN. Don't click or reply. Check with your bank through its own app or phone number.", "Prisa, un enlace que no es de tu banco y la petición de tu NIP. No des clic ni respondas. Confírmalo con tu banco desde su app o su teléfono oficial.")}</div></div></div>
      ${sec(T("Questions to ask", "Preguntas para hacer"), T("Does my bank's app show a lock? Who can I call at the number on my card?", "¿Mi app del banco muestra un bloqueo? ¿A qué número de mi tarjeta puedo llamar?"))}
      <div style="display:flex;align-items:center;gap:10px;margin-top:6px;padding-top:10px;border-top:1px solid var(--line);font-size:14px;color:var(--mid)"><span aria-hidden="true">📖</span><span style="flex:1">${T("Related lesson: Scams · Phishing", "Lección relacionada: Fraudes · Phishing")}</span><span style="padding:7px 14px;border-radius:12px;background:var(--surface2);font-weight:700;color:var(--ink)">${T("Open", "Abrir")}</span></div>
    </div></div>`;
}

const shot = async (page, preset, name) => (page.__look && (await applyLook(page, page.__look)), page.screenshot({ path: join(OUT, `${preset}-${name}.jpg`), type: "jpeg", quality: 78 }));
const esc = (s) => s.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
const SCREENS = ["1-today", "2-sea-chart", "3-question", "4-correct", "5-not-quite", "6-finish", "7-goals", "8-practice", "9-me", "10-color-picker", "11-explain-red-flag", "12-money-year"];

async function runPreset(p, lang = "en", region = "US", only = null) {
  const es = lang === "es";
  const tag = es ? `${p.id}-es` : p.id;
  const ctx = await browser.newContext({ viewport: { width: 390, height: 800 }, deviceScaleFactor: 1.5, locale: es ? "es-MX" : "en-US", serviceWorkers: "block", reducedMotion: "reduce" });
  await ctx.addInitScript((s) => localStorage.getItem("northvale-learn-v1") || localStorage.setItem("northvale-learn-v1", s), JSON.stringify(learner(lang, region)));
  const page = await ctx.newPage();
  page.setDefaultTimeout(8000);
  await page.goto(BASE);
  await page.waitForTimeout(600);
  page.__look = p;
  await applyLook(page, p);
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

  // The mocked screens, drawn with the same fonts and variables.
  const mock = async (html, name) => {
    await page.evaluate((h) => {
      document.getElementById("root").style.display = "none";
      let m = document.getElementById("mock");
      if (!m) (m = document.createElement("div")), (m.id = "mock"), document.body.append(m);
      m.innerHTML = h;
    }, html);
    await page.evaluate(() => window.scrollTo(0, 0));
    await page.waitForTimeout(200);
    await page.screenshot({ path: join(OUT, `${tag}-${name}.jpg`), type: "jpeg", quality: 78, fullPage: true });
  };
  await mock(pickerHTML(p, lang), "10-color-picker");
  await mock(explainHTML(p, lang), "11-explain-red-flag");
  await page.evaluate(() => {
    document.getElementById("mock").remove();
    document.getElementById("root").style.display = "";
  });

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
  // An overview of each preset: all twelve screens on one sheet (also mockups/index.html), for looking at on a phone.
  const ids = [...PRESETS.slice(0, 3).map((p) => p.id), `${PRESETS[0].id}-es`];
  const section = (id) => {
    const list = id.endsWith("-es") ? ["1-today", "9-me", "10-color-picker", "11-explain-red-flag", "12-money-year"] : SCREENS;
    const tiles = list.map((x) => `<figure><img src="${id}-${x}.jpg" alt="${id} ${x}"/><figcaption>${x.replace(/^\d+-/, "")}</figcaption></figure>`).join("");
    return `<section id="s-${id}"><h2>${id}</h2><div class="grid">${tiles}</div></section>`;
  };
  const html = `<!doctype html><meta charset="utf-8"><title>Navy, cream and signal red: mockups</title><style>body{margin:16px;font:14px system-ui;background:#fff;color:#222}h2{margin:18px 0 8px}.grid{display:flex;flex-wrap:wrap;gap:14px}figure{margin:0;width:270px}img{width:270px;border-radius:14px;display:block}figcaption{color:#555;margin-top:4px}section{width:1700px}</style>${ids.map(section).join("")}`;
  writeFileSync(join(OUT, "index.html"), html);
  const page = await browser.newPage({ viewport: { width: 1740, height: 900 } });
  await page.goto(`file://${join(OUT, "index.html")}`);
  await page.waitForLoadState("load");
  await page.waitForTimeout(800);
  for (const id of ids) await page.locator(`#s-${id}`).screenshot({ path: join(OUT, `overview-${id}.jpg`), type: "jpeg", quality: 72 });
  console.log("mockups done");
} finally {
  await browser.close();
  server.kill();
}
