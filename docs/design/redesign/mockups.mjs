// The proposed redesign, drawn as mockups from the real app's colors (colors.js), icons (ui.jsx),
// logo paths (art.js) and lesson text (units/*.js). Nothing here changes the app.
//   node docs/design/redesign/mockups.mjs            writes mockups/*.html and mockups/*.png
// Same three colors and the same rules as docs/design/colors/PLAN.md: one red spark per screen,
// a pick is outlined in the text color (never red), a wrong answer is never red.
import { chromium } from "playwright-core";
import { readFileSync, writeFileSync, mkdirSync } from "node:fs";
import { join } from "node:path";
import { lookFrom, COLORS, PRESETS } from "../../../src/core/colors.js";
import { MARK_PATHS } from "../../../src/core/art.js";
import { pick, fill } from "../../../src/core/i18n.js";
import { UNITS } from "../../../src/modules/lessons/units/all.js";

const OUT = join(import.meta.dirname, "mockups");
mkdirSync(OUT, { recursive: true });

// Icons: the app's own paths.
const src = readFileSync(join(import.meta.dirname, "../../../src/core/ui.jsx"), "utf8");
const i0 = src.indexOf("const PATHS = {");
const PATHS = new Function("return " + src.slice(i0 + "const PATHS = ".length, src.indexOf("\n};", i0) + 3).replace(/;\s*$/, ""))();
const ic = (name, size = 22, sw = 2) => `<svg width="${size}" height="${size}" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="${sw}" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">${[].concat(PATHS[name]).map((d) => `<path d="${d}"/>`).join("")}</svg>`;
const star = (s = 18) => `<svg width="${s}" height="${s}" viewBox="0 0 24 24" aria-hidden="true"><path d="M12 2l2.2 7.8L22 12l-7.8 2.2L12 22l-2.2-7.8L2 12l7.8-2.2z" fill="currentColor"/></svg>`;

// Real lesson text.
const unit = (id) => UNITS.find((u) => u.id === id);
const save1 = unit("save").lessons[0];
const idea = save1.steps[0];
const q1 = save1.steps.find((s) => s.type === "choice");
const save2 = unit("save").lessons[1];

const STR = {
  en: { today: "Today", date: "Thursday, November 19", next: "Next step", cont: "Continue", path: "Your path", tabs: ["Learn", "Goals", "Practice", "Me"], review: "Review", reviewSub: "2 ideas to refresh · 2 min", mission: "This week's mission", missionSub: "Track everything you spend for 3 days", ask: "Ask", unitOf: "Unit 2 of 18 · Saving", lessonOf: "Lesson 2 of 3 · 4 min", week: "This week", xp: "15 of 20 XP today", streak: "3-day streak", days: ["M", "T", "W", "T", "F", "S", "S"], welcome: "Learn money by doing.", sub: "Four-minute lessons, a goal to learn for, and practice with pretend money.", start: "Get started", have: "I already have an account", language: "Language", country: "Country", us: "United States", mx: "Mexico", both: "Both", note: "Northvale Learn is for learning. All money here is pretend, and nothing here is financial advice.", ads: "No ads. We never sell your data.", find: "Find your open water" },
  es: { today: "Hoy", date: "Jueves, 19 de noviembre", next: "Siguiente paso", cont: "Continuar", path: "Tu ruta", tabs: ["Aprender", "Metas", "Práctica", "Yo"], review: "Repaso", reviewSub: "2 ideas por repasar · 2 min", mission: "La misión de esta semana", missionSub: "Anota todo lo que gastas durante 3 días", ask: "Preguntar", unitOf: "Unidad 2 de 18 · Ahorro", lessonOf: "Lección 2 de 3 · 4 min", week: "Esta semana", xp: "15 de 20 XP hoy", streak: "Racha de 3 días", days: ["L", "M", "M", "J", "V", "S", "D"], welcome: "Aprende de dinero practicando.", sub: "Lecciones de cuatro minutos, una meta para aprender y práctica con dinero de mentiras.", start: "Empezar", have: "Ya tengo una cuenta", language: "Idioma", country: "País", us: "Estados Unidos", mx: "México", both: "Ambos", note: "Northvale Learn es para aprender. Todo el dinero aquí es de mentiras y nada es asesoría financiera.", ads: "Sin anuncios. Nunca vendemos tus datos.", find: "Encuentra tu mar abierto" },
};
const T = (lang, x) => (x && typeof x === "object" ? fill(pick(x, lang, "US"), { lang, region: "US" }) : x);

// ---------- the design system, as CSS ----------
const CSS = `
@font-face{font-family:Inter;font-weight:100 900;src:url(../../../../web/fonts/inter-latin-wght-normal.woff2) format("woff2")}
@font-face{font-family:"EB Garamond";font-weight:600;src:url(../../../../web/fonts/eb-garamond-latin-600-normal.woff2) format("woff2")}
:root{
  /* spacing: eight steps on a 4px base (the app uses seventeen) */
  --s1:4px;--s2:8px;--s3:12px;--s4:16px;--s5:24px;--s6:32px;--s7:48px;--s8:64px;
  /* three radii (the app uses sixteen) */
  --r1:12px;--r2:18px;--r3:28px;
  /* eight text sizes, three weights (the app uses 22 sizes and five weights) */
  --t-cap:12px;--t-sm:14px;--t-body:16px;--t-lead:18px;--t-title:22px;--t-head:28px;--t-disp:36px;--t-fig:44px;
  --w1:450;--w2:600;--w3:700;
}
.lg{--t-cap:13px;--t-sm:15px;--t-body:18px;--t-lead:20px;--t-title:26px;--t-head:34px;--t-disp:46px;--t-fig:56px}
*{box-sizing:border-box;margin:0;padding:0}
body{background:var(--bg);color:var(--ink);font:var(--w1) var(--t-body)/1.5 Inter,system-ui,sans-serif;font-feature-settings:'cv11','ss01';-webkit-font-smoothing:antialiased;overflow:hidden}
.num{font-variant-numeric:tabular-nums}
.disp{font-weight:var(--w3);letter-spacing:-.025em;line-height:1.1}
.cap{font-size:var(--t-cap);font-weight:var(--w2);letter-spacing:.06em;text-transform:uppercase;color:var(--mid)}
.mid{color:var(--mid)}.low{color:var(--low)}
.word{font:600 26px/1 "EB Garamond",serif;letter-spacing:-.01em;display:inline-flex;align-items:center;gap:8px}
.beta{font:var(--w2) 10px/1 Inter;border:1.5px solid var(--ink);border-radius:5px;padding:2px 4px;letter-spacing:.04em}
/* buttons: one red per screen */
.btn{display:flex;align-items:center;justify-content:center;gap:var(--s2);height:56px;border-radius:var(--r2);font:var(--w2) var(--t-lead)/1 Inter;border:0;background:var(--fill);color:var(--onFill);box-shadow:0 0 0 var(--ringW) var(--ringC),0 1px 0 var(--edge);width:100%}
.btn.sec{background:transparent;color:var(--ink);box-shadow:inset 0 0 0 2px var(--ink)}
.btn.quiet{background:transparent;color:var(--mid);box-shadow:none;height:48px}
.btn.off{background:var(--surface2);color:var(--low);box-shadow:none}
.btn.sm{height:44px;font-size:var(--t-sm);border-radius:var(--r1);width:auto;padding:0 var(--s4)}
/* cards and rows */
.card{background:var(--surface);border:1px solid var(--line);border-radius:var(--r2)}
.row{display:flex;align-items:center;gap:var(--s3);padding:var(--s4)}
.row+.row{border-top:1px solid var(--line)}
.row .t{font-weight:var(--w2)}.row .s{font-size:var(--t-sm);color:var(--mid)}
.row .ico{width:40px;height:40px;border-radius:var(--r1);background:var(--surface2);display:grid;place-items:center;flex:none}
.chev{margin-left:auto;color:var(--low)}
.chip{display:inline-flex;align-items:center;gap:6px;height:28px;padding:0 var(--s3);border-radius:99px;background:var(--surface2);font-size:var(--t-cap);font-weight:var(--w2);color:var(--ink)}
/* answer options: a pick is outlined in the text color */
.opt{display:flex;align-items:center;gap:var(--s3);min-height:64px;padding:var(--s3) var(--s4);border-radius:var(--r2);background:var(--surface);border:2px solid var(--line);font-weight:var(--w2);font-size:var(--t-lead);line-height:1.3}
.opt .k{width:30px;height:30px;border-radius:50%;border:2px solid var(--line);display:grid;place-items:center;font-size:var(--t-sm);font-weight:var(--w2);flex:none;color:var(--mid)}
.opt.sel{border-color:var(--select);background:var(--surface2)}
.opt.sel .k{background:var(--ink);border-color:var(--ink);color:var(--bg)}
.opt+.opt{margin-top:var(--s3)}
/* feedback: different icon and edge, no color */
.fb{border-radius:var(--r2);padding:var(--s4);background:var(--surface);border:2px solid var(--ink);display:flex;gap:var(--s3)}
.fb.no{border-style:dashed;border-color:var(--mid)}
.fb b{display:block;font-size:var(--t-lead)}
/* progress */
.bar{height:6px;border-radius:99px;background:var(--line);overflow:hidden}.bar i{display:block;height:100%;background:var(--ink);border-radius:99px}
.hdr{display:flex;align-items:center;gap:var(--s4);height:56px;padding:0 var(--s4)}
.hdr .bar{flex:1}
.iconbtn{width:44px;height:44px;border-radius:50%;display:grid;place-items:center;color:var(--ink)}
/* tab bar: 64px, labels 12px, the current tab is a filled pill */
.tabs{position:absolute;left:0;right:0;bottom:0;height:72px;display:flex;background:var(--bg);border-top:1px solid var(--line);padding:8px var(--s2) 12px}
.tab{flex:1;display:flex;flex-direction:column;align-items:center;justify-content:center;gap:2px;font-size:var(--t-cap);font-weight:var(--w2);color:var(--mid)}
.tab .pill{width:56px;height:30px;border-radius:99px;display:grid;place-items:center}
.tab.on{color:var(--ink);font-weight:var(--w3)}.tab.on .pill{background:var(--surface2)}
.dock{position:absolute;left:0;right:0;padding:var(--s3) var(--s4) var(--s4);background:linear-gradient(transparent,var(--bg) 28%)}
.stage{position:relative;width:100%;height:100%;overflow:hidden}
.scroll{padding:0 var(--s4)}
.sea{background:linear-gradient(var(--artSky),var(--artSea));border-radius:var(--r2);position:relative;overflow:hidden}
.node{width:44px;height:44px;border-radius:50%;display:grid;place-items:center;background:var(--surface);border:2px solid var(--ink);color:var(--ink);flex:none}
.node.done{background:var(--ink);color:var(--bg)}.node.far{border-color:var(--artSea2);color:var(--low);background:transparent}
.node.now{width:56px;height:56px;box-shadow:0 0 0 6px var(--surface2)}
`;

const vars = (look) => Object.entries(look === "navy" ? lookFrom("navy", "cream", "red") : look === "navycream" ? lookFrom("navy", "cream", "cream") : lookFrom("cream", "navy", "red")).map(([k, v]) => `${k}:${v}`).join(";");
const page = (body, { look = "cream", lg = false, w, h }) => `<!doctype html><html><head><meta charset="utf-8"><meta name="viewport" content="width=${w}"><style>${CSS}</style></head><body class="${lg ? "lg" : ""}" style="${vars(look)};width:${w}px;height:${h}px"><div class="stage">${body}</div></body></html>`;

// ---------- pieces ----------
const boat = (s = 40, fill = "var(--ink)") => `<svg width="${s}" height="${s}" viewBox="0 0 100 100" aria-hidden="true">${MARK_PATHS.map((d) => `<path d="${d}" fill="${fill}"/>`).join("")}</svg>`;
const hero = (h = 260) => `<svg width="100%" height="${h}" viewBox="0 0 390 ${h}" preserveAspectRatio="xMidYMax slice" aria-hidden="true"><rect width="390" height="${h}" fill="var(--artSky)"/><circle cx="292" cy="${h * 0.38}" r="40" fill="var(--artSand)"/><path d="M0 ${h * 0.62}q48-22 97 0t98 0 98 0 98 0V${h}H0z" fill="var(--artSea)"/><path d="M0 ${h * 0.78}q48-20 97 0t98 0 98 0 98 0V${h}H0z" fill="var(--artSea2)" opacity=".7"/><g transform="translate(120 ${h * 0.2}) scale(1.05)">${MARK_PATHS.map((d) => `<path d="${d}" fill="var(--ink)"/>`).join("")}</g></svg>`;
const tabbar = (lang, on = 0) => `<nav class="tabs">${["book", "target", "compass", "user"].map((n, i) => `<div class="tab ${i === on ? "on" : ""}"><div class="pill">${ic(n, 24)}</div>${STR[lang].tabs[i]}</div>`).join("")}</nav>`;
const topbar = (lang) => `<div style="display:flex;align-items:center;justify-content:space-between;padding:var(--s3) var(--s4) 0;height:56px"><span class="word">${boat(26)}Northvale <span class="beta">BETA</span></span><span style="display:flex;align-items:center;gap:var(--s2)"><span class="chip" style="height:36px;padding:0 var(--s3)">${star(16)} <span class="num">3</span></span><span class="chip" style="height:36px;padding:0 var(--s3)">${ic("chat", 18)} ${STR[lang].ask}</span></span></div>`;
const week = (lang) => `<div style="display:flex;gap:var(--s2);justify-content:space-between">${STR[lang].days.map((d, i) => `<div style="flex:1;text-align:center"><div style="height:36px;border-radius:var(--r1);background:${i === 3 ? "var(--ink)" : "var(--surface2)"};color:${i === 3 ? "var(--bg)" : "var(--low)"};display:grid;place-items:center;font-weight:var(--w2)">${i === 3 ? ic("check", 18, 3) : ""}</div><div class="cap" style="margin-top:4px;letter-spacing:0">${d}</div></div>`).join("")}</div>`;
const lessonHeader = (n, of, lang = "en") => `<div class="hdr"><div class="iconbtn">${ic("close", 24)}</div><div class="bar"><i style="width:${(n / of) * 100}%"></i></div><span class="num mid" style="font-size:var(--t-sm);font-weight:var(--w2);min-width:44px;text-align:right">${n} ${lang === "es" ? "de" : "of"} ${of}</span></div>`;

const todayNext = (lang) => {
  const s = STR[lang];
  const lt = T(lang, save2.title);
  return `<div class="card" style="padding:var(--s4) var(--s5) var(--s5);border-radius:var(--r3)"><div style="display:flex;align-items:center;justify-content:space-between"><span class="cap">${s.next}</span><span class="chip">${ic("piggy", 16)} ${lang === "es" ? "Ahorro" : "Saving"}</span></div><div class="disp" style="font-size:var(--t-head);margin:var(--s2) 0 var(--s2)">${lt}</div><div class="mid" style="font-size:var(--t-body);line-height:1.4">${T(lang, save2.life)}</div><div class="mid" style="font-size:var(--t-sm);margin:var(--s2) 0 var(--s4)">${s.lessonOf}</div><div class="btn">${s.cont} ${ic("next", 22, 2.4)}</div></div>`;
};
const pathStrip = (lang) => {
  const ic5 = ["pie", "piggy", "building", "wallet", "card"];
  return `<div class="card" style="padding:var(--s4) var(--s4) var(--s3)"><div style="display:flex;justify-content:space-between;align-items:baseline"><span class="cap">${STR[lang].path}</span><span class="mid" style="font-size:var(--t-sm)">${STR[lang].unitOf}</span></div><div style="display:flex;align-items:center;margin-top:var(--s4);position:relative"><div style="position:absolute;left:22px;right:22px;top:50%;border-top:2px dashed var(--artSea2)"></div>${ic5.map((n, i) => `<div style="flex:1;display:flex;justify-content:${i === 0 ? "flex-start" : i === 4 ? "flex-end" : "center"};position:relative"><div class="node ${i === 0 ? "done" : i === 1 ? "now" : "far"}">${i === 0 ? ic("check", 20, 3) : ic(n, i === 1 ? 24 : 20)}</div></div>`).join("")}</div></div>`;
};

// ---------- phone screens ----------
const SCREENS = {};

SCREENS.welcome = (lang = "en", look = "cream") => {
  const s = STR[lang];
  const seg = (label, items, on) => `<div><div class="cap" style="margin-bottom:var(--s2)">${label}</div><div style="display:flex;border-radius:var(--r1);background:var(--surface2);padding:3px;gap:3px">${items.map((x, i) => `<div style="flex:1;height:40px;border-radius:9px;display:grid;place-items:center;font-size:var(--t-sm);font-weight:var(--w2);${i === on ? "background:var(--surface);box-shadow:inset 0 0 0 2px var(--select)" : "color:var(--mid)"}">${x}</div>`).join("")}</div></div>`;
  return page(`<div>${hero(200)}</div><div style="padding:var(--s4) var(--s5) 0"><span class="word" style="font-size:28px">Northvale</span> <span class="cap" style="margin-left:6px">LEARN</span><div class="disp" style="font-size:var(--t-disp);margin:var(--s3) 0 var(--s2)">${s.welcome}</div><div class="mid" style="font-size:var(--t-body);line-height:1.45">${s.sub}</div><div style="display:flex;flex-direction:column;gap:var(--s3);margin-top:var(--s4)"><div class="btn">${s.start}</div><div class="btn sec">${s.have}</div></div><div style="display:flex;flex-direction:column;gap:var(--s3);margin-top:var(--s4)">${seg(s.language, ["English", "Español"], lang === "en" ? 0 : 1)}${seg(s.country, [s.us, s.mx, s.both], lang === "en" ? 0 : 1)}</div><div class="low" style="font-size:var(--t-cap);margin-top:var(--s4);line-height:1.45">${s.note}</div></div>`, { look, w: 390, h: 844 });
};

// Today, option A: the next step first, the path under it.
SCREENS.todayA = (lang = "en", look = "cream") => {
  const s = STR[lang];
  return page(`${topbar(lang)}<div class="scroll"><div style="padding:var(--s2) var(--s1) var(--s3)"><div class="mid" style="font-size:var(--t-sm)">${s.date}</div><div class="disp" style="font-size:var(--t-head)">${s.today}</div></div>${todayNext(lang)}<div style="margin-top:var(--s3)">${pathStrip(lang)}</div><div class="card" style="margin-top:var(--s3);overflow:hidden"><div class="row"><div class="ico">${ic("refresh", 20)}</div><div><div class="t">${s.review}</div><div class="s">${s.reviewSub}</div></div><span class="chev">${ic("next", 20)}</span></div><div class="row"><div class="ico">${ic("flag", 20)}</div><div><div class="t">${s.mission}</div><div class="s">${s.missionSub}</div></div><span class="chev">${ic("next", 20)}</span></div></div></div>${tabbar(lang, 0)}`, { look, w: 390, h: 844 });
};

// Today, option B: the path is the home; the next step docks above the tab bar.
SCREENS.todayB = (lang = "en", look = "cream") => {
  const s = STR[lang];
  const nodes = [["pie", "done", lang === "es" ? "Presupuesto" : "Budgeting", 70, 64], ["piggy", "now", lang === "es" ? "Ahorro" : "Saving", 215, 138], ["building", "far", lang === "es" ? "Bancos" : "Banking", 110, 252], ["wallet", "far", lang === "es" ? "Primer sueldo" : "Your first paycheck", 250, 340]];
  return page(`${topbar(lang)}<div class="scroll"><div style="padding:var(--s4) var(--s1) var(--s3);display:flex;justify-content:space-between;align-items:flex-end"><div><div class="mid" style="font-size:var(--t-sm)">${s.date}</div><div class="disp" style="font-size:var(--t-head)">${s.path}</div></div><span class="mid" style="font-size:var(--t-sm);padding-bottom:4px">${s.unitOf.split(" · ")[0]}</span></div><div class="sea" style="height:470px"><svg width="100%" height="470" viewBox="0 0 358 470" aria-hidden="true" style="position:absolute;inset:0"><path d="M70 64C70 120 215 90 215 138S110 200 110 252 250 300 250 340" fill="none" stroke="var(--artSea2)" stroke-width="3" stroke-dasharray="2 8" stroke-linecap="round"/><path d="M0 410q45-18 90 0t89 0 89 0 90 0V470H0z" fill="var(--artSea)"/></svg>${nodes.map(([n, k, lab, x, y]) => `<div style="position:absolute;left:${x - 28}px;top:${y - 28}px;width:56px;display:flex;flex-direction:column;align-items:center"><div class="node ${k}">${k === "done" ? ic("check", 20, 3) : ic(n, k === "now" ? 26 : 20)}</div><div style="margin-top:6px;font-size:var(--t-sm);font-weight:${k === "now" ? "var(--w3)" : "var(--w2)"};white-space:nowrap;color:${k === "far" ? "var(--mid)" : "var(--ink)"}">${lab}</div></div>`).join("")}<div style="position:absolute;right:16px;bottom:16px;opacity:.9">${boat(44)}</div></div></div><div class="dock" style="bottom:72px"><div class="card" style="padding:var(--s4);display:flex;align-items:center;gap:var(--s3);border-radius:var(--r3)"><div style="flex:1;min-width:0"><div class="cap">${s.next}</div><div style="font-weight:var(--w3);font-size:var(--t-lead);white-space:nowrap;overflow:hidden;text-overflow:ellipsis">${T(lang, save2.title)}</div><div class="mid" style="font-size:var(--t-sm)">${s.lessonOf}</div></div><div class="btn" style="width:auto;padding:0 var(--s5);height:52px">${s.cont}</div></div></div>${tabbar(lang, 0)}`, { look, w: 390, h: 844 });
};

// Lesson idea card, option A: the text, then a worked example in numbers.
const ideaBody = (lang) => `<div style="padding:var(--s4) var(--s5) 0"><div class="cap">${lang === "es" ? "Idea" : "Idea"} · ${T(lang, save1.title)}</div><div class="disp" style="font-size:var(--t-head);margin:var(--s2) 0 var(--s4)">${T(lang, idea.title)}</div><div style="font-size:var(--t-lead);line-height:1.55">${T(lang, idea.body)}</div>`;
SCREENS.ideaA = (lang = "en", look = "cream") => page(`${lessonHeader(1, 6, lang)}${ideaBody(lang)}<div class="card" style="margin-top:var(--s5);padding:var(--s4);border-radius:var(--r2)"><div class="cap" style="margin-bottom:var(--s3)">${lang === "es" ? "Un ejemplo" : "An example"}</div><div style="display:flex;justify-content:space-between;align-items:baseline"><span class="mid">${lang === "es" ? "Día de pago" : "Payday"}</span><b class="num" style="font-size:var(--t-title)">$1,000</b></div><div style="display:flex;height:16px;border-radius:99px;overflow:hidden;margin:var(--s3) 0"><i style="width:10%;background:var(--ink)"></i><i style="flex:1;background:var(--surface2)"></i></div><div style="display:flex;justify-content:space-between;font-size:var(--t-sm)"><span><b>${lang === "es" ? "Ahorras primero" : "Save first"}</b> <span class="num mid">$100</span></span><span><b>${lang === "es" ? "Gastas el resto" : "Spend the rest"}</b> <span class="num mid">$900</span></span></div></div></div><div class="dock" style="bottom:0"><div class="btn">${STR[lang].cont}</div></div>`, { look, w: 390, h: 844 });
// Option B: the text, then a picture of the idea (the order of the steps).
SCREENS.ideaB = (lang = "en", look = "cream") => page(`${lessonHeader(1, 6, lang)}${ideaBody(lang)}<div class="card" style="margin-top:var(--s5);padding:var(--s4)"><div style="display:flex;align-items:center;gap:var(--s2)">${[["wallet", lang === "es" ? "Llega el pago" : "Money arrives"], ["piggy", lang === "es" ? "Ahorro primero" : "Savings first"], ["card", lang === "es" ? "Gastas el resto" : "Spend the rest"]].map(([n, t], i) => `${i ? `<span class="low">${ic("next", 18)}</span>` : ""}<div style="flex:1;text-align:center"><div class="node ${i === 1 ? "done" : ""}" style="margin:0 auto var(--s2);width:52px;height:52px">${ic(n, 24)}</div><div style="font-size:var(--t-sm);font-weight:var(--w2);line-height:1.25">${t}</div></div>`).join("")}</div></div></div><div class="dock" style="bottom:0"><div class="btn">${STR[lang].cont}</div></div>`, { look, w: 390, h: 844 });

// A question with one option picked.
const qBody = (lang, picked, feedback) => {
  const opts = q1.options.map((o, i) => `<div class="opt ${picked === i ? "sel" : ""}"><span class="k">${picked === i ? ic("check", 16, 3) : i + 1}</span>${T(lang, o)}</div>`).join("");
  return `<div style="padding:var(--s3) var(--s5) 0"><div class="cap">${lang === "es" ? "Pregunta" : "Question"} · ${T(lang, save1.title)}</div><div class="disp" style="font-size:var(--t-title);margin:var(--s2) 0 var(--s5);line-height:1.2">${T(lang, q1.q)}</div>${opts}${feedback || ""}</div>`;
};
SCREENS.question = (lang = "en", look = "cream") => page(`${lessonHeader(3, 6, lang)}${qBody(lang, 1)}<div class="dock" style="bottom:0"><div class="btn">${lang === "es" ? "Comprobar" : "Check"}</div></div>`, { look, w: 390, h: 844 });
SCREENS.feedbackRight = (lang = "en", look = "cream") => page(`${lessonHeader(3, 6, lang)}${qBody(lang, 1, `<div class="fb" style="margin-top:var(--s4)"><span style="margin-top:2px">${ic("check", 22, 3)}</span><div><b>${lang === "es" ? "Correcto" : "Correct"}</b><span class="mid" style="font-size:var(--t-sm)">${T(lang, q1.why)}</span></div></div>`)}<div class="dock" style="bottom:0"><div class="btn">${STR[lang].cont}</div></div>`, { look, w: 390, h: 844 });
SCREENS.feedbackWrong = (lang = "en", look = "cream") => page(`${lessonHeader(3, 6, lang)}${qBody(lang, 0, `<div class="fb no" style="margin-top:var(--s4)"><span style="margin-top:2px">${ic("bulb", 22)}</span><div><b>${lang === "es" ? "Casi" : "Not quite"}</b><span class="mid" style="font-size:var(--t-sm)">${T(lang, q1.miss[0]) || ""}</span><div style="font-size:var(--t-sm);margin-top:var(--s2)"><b>${lang === "es" ? "Respuesta:" : "Answer:"}</b> ${T(lang, q1.options[q1.answer])}</div></div></div>`)}<div class="dock" style="bottom:0"><div class="btn">${STR[lang].cont}</div></div>`, { look, w: 390, h: 844 });

SCREENS.finish = (lang = "en", look = "cream") => {
  const es = lang === "es";
  return page(`<div class="hdr" style="justify-content:flex-end"><div class="iconbtn">${ic("close", 24)}</div></div><div style="text-align:center;padding:0 var(--s5)"><div style="width:132px;height:132px;margin:var(--s2) auto var(--s4);position:relative"><svg width="132" height="132" viewBox="0 0 132 132"><circle cx="66" cy="66" r="58" fill="none" stroke="var(--line)" stroke-width="8"/><circle cx="66" cy="66" r="58" fill="none" stroke="var(--ink)" stroke-width="8" stroke-linecap="round" stroke-dasharray="365" stroke-dashoffset="91" transform="rotate(-90 66 66)"/></svg><div style="position:absolute;inset:0;display:grid;place-items:center"><div><div class="disp num" style="font-size:var(--t-head)">+15</div><div class="cap" style="letter-spacing:.04em">XP</div></div></div></div><div class="disp" style="font-size:var(--t-head)">${es ? "Lección completa" : "Lesson complete"}</div><div class="mid" style="margin-top:var(--s1);font-size:var(--t-lead)">${T(lang, save1.title)} · ${es ? "Sin errores" : "No mistakes"}</div><div style="display:flex;gap:var(--s2);justify-content:center;margin:var(--s4) 0 var(--s5)"><span class="chip" style="height:32px">${star(16)} ${es ? "Racha de 1 día" : "1-day streak"}</span><span class="chip" style="height:32px">${es ? "15 de 20 XP hoy" : "15 of 20 XP today"}</span></div><div class="card" style="text-align:left;padding:var(--s4)"><div class="cap">${es ? "En la vida real" : "In real life"}</div><div style="font-size:var(--t-lead);line-height:1.45;margin-top:var(--s2)">${T(lang, save1.life)}</div></div><div class="mid" style="font-size:var(--t-sm);margin-top:var(--s4)">${es ? "Logros: Primera lección · Lección perfecta" : "Achievements: First lesson · Perfect lesson"}</div></div><div class="dock" style="bottom:0"><div style="display:flex;flex-direction:column;gap:var(--s2)"><div class="btn">${es ? "Siguiente: " : "Next: "}${T(lang, save2.title)}</div><div class="btn sec" style="height:52px">${es ? "Listo" : "Done"}</div></div></div>`, { look, w: 390, h: 844 });
};

SCREENS.goals = (lang = "en", look = "cream") => {
  const es = lang === "es";
  return page(`${topbar(lang)}<div class="scroll"><div style="padding:var(--s4) var(--s1) var(--s3)"><div class="disp" style="font-size:var(--t-head)">${STR[lang].tabs[1]}</div><div class="mid">${es ? "Para qué estás aprendiendo." : "What you're learning for."}</div></div><div class="card" style="padding:var(--s5);border-radius:var(--r3)"><div style="display:flex;align-items:center;gap:var(--s3)"><div class="ico node" style="width:44px;height:44px">${ic("shield", 22)}</div><div style="flex:1"><div style="font-weight:var(--w3);font-size:var(--t-lead)">${es ? "Fondo de emergencia" : "Emergency fund"}</div><div class="mid" style="font-size:var(--t-sm)">${es ? "Un colchón para imprevistos" : "A cushion for surprises"}</div></div><span class="chip">${es ? "Al día" : "On track"}</span></div><div style="display:flex;justify-content:space-between;align-items:baseline;margin:var(--s5) 0 var(--s2)"><b class="disp num" style="font-size:var(--t-fig)">$0</b><span class="mid num">${es ? "de" : "of"} $1,000</span></div><div class="bar"><i style="width:3%"></i></div><div class="mid" style="font-size:var(--t-sm);margin-top:var(--s3)">$83 ${es ? "al mes" : "a month"} · ${es ? "falta 1 año" : "1 year left"}</div><div class="btn sec" style="margin-top:var(--s5);height:52px">${es ? "Registrar ahorro" : "Record savings"}</div></div><div class="card" style="margin-top:var(--s3);overflow:hidden"><div class="row"><div class="ico">${ic("book", 20)}</div><div><div class="t">${es ? "Lección para esta meta" : "Next lesson for this goal"}</div><div class="s">${T(lang, save2.title)} · 4 min</div></div><span class="chev">${ic("next", 20)}</span></div><div class="row"><div class="ico">${ic("plus", 20)}</div><div><div class="t">${es ? "Agregar otra meta" : "Add another goal"}</div></div><span class="chev">${ic("next", 20)}</span></div></div></div>${tabbar(lang, 1)}`, { look, w: 390, h: 844 });
};

SCREENS.settings = (lang = "en", look = "cream") => {
  const es = lang === "es";
  const seg = (items, on) => `<div style="display:flex;border-radius:var(--r1);background:var(--surface2);padding:3px;gap:3px">${items.map((x, i) => `<div style="flex:1;height:44px;border-radius:9px;display:grid;place-items:center;font-size:var(--t-sm);font-weight:var(--w2);${i === on ? "background:var(--surface);box-shadow:inset 0 0 0 2px var(--select)" : "color:var(--mid)"}">${x}</div>`).join("")}</div>`;
  const swatch = (pr, on) => `<div style="flex:1;text-align:center"><div style="height:56px;border-radius:var(--r1);background:${COLORS[pr.bg].hex};color:${COLORS[pr.text].hex};display:flex;align-items:center;justify-content:center;gap:6px;font-weight:var(--w3);box-shadow:${on ? "0 0 0 3px var(--bg),0 0 0 5px var(--select)" : "inset 0 0 0 1px var(--line)"}">Aa<i style="width:10px;height:10px;border-radius:50%;background:${COLORS[pr.hi].hex};display:inline-block"></i></div><div style="font-size:var(--t-cap);margin-top:6px;font-weight:${on ? "var(--w3)" : "var(--w2)"};line-height:1.2">${pr.name[es ? "es" : "en"]}</div></div>`;
  return page(`<div class="hdr"><div class="iconbtn">${ic("back", 24)}</div><div style="font-weight:var(--w3);font-size:var(--t-lead)">${es ? "Ajustes" : "Settings"}</div></div><div class="scroll"><div class="cap" style="margin:var(--s3) var(--s1) var(--s2)">${es ? "Idioma y país" : "Language and country"}</div><div class="card" style="padding:var(--s4)"><div class="mid" style="font-size:var(--t-sm);margin-bottom:var(--s2)">${es ? "Idioma" : "Language"}</div>${seg(["English", "Español"], es ? 1 : 0)}<div class="mid" style="font-size:var(--t-sm);margin:var(--s4) 0 var(--s2)">${es ? "País y moneda" : "Country and currency"}</div>${seg([es ? "EE. UU." : "US", es ? "México" : "Mexico", es ? "Ambos" : "Both"], es ? 1 : 0)}<div class="low" style="font-size:var(--t-cap);margin-top:var(--s3);line-height:1.4">${es ? "Cambia la moneda y los ejemplos de las lecciones." : "Changes the currency and the examples in lessons."}</div></div><div class="cap" style="margin:var(--s5) var(--s1) var(--s2)">${es ? "Colores" : "Colors"}</div><div class="card" style="padding:var(--s4)"><div style="display:flex;gap:var(--s3)">${[PRESETS[1], PRESETS[0], PRESETS[2], PRESETS[3]].map((pr, i) => swatch(pr, i === 0)).join("")}</div></div><div class="card" style="margin-top:var(--s5);overflow:hidden">${[["user", es ? "Perfil" : "Profile"], ["clock", es ? "Aprendizaje y recordatorios" : "Learning and reminders"], ["volume", es ? "Sonido y vibración" : "Sound and feel"], ["lock", es ? "Privacidad" : "Privacy"]].map(([n, t]) => `<div class="row"><div class="ico">${ic(n, 20)}</div><div class="t">${t}</div><span class="chev">${ic("next", 20)}</span></div>`).join("")}</div><div class="card" style="margin-top:var(--s3);overflow:hidden"><div class="row"><div class="ico">${ic("shield", 20)}</div><div><div class="t">${es ? "Cuenta" : "Account"}</div><div class="s">${es ? "Guarda tu progreso en otro dispositivo" : "Keep your progress on another device"}</div></div><span class="chev">${ic("next", 20)}</span></div></div></div>`, { look, w: 390, h: 844 });
};

// ---------- laptop screens (1366 x 768) ----------
const side = (lang, on = 0) => `<aside style="position:absolute;left:0;top:0;bottom:0;width:248px;border-right:1px solid var(--line);padding:var(--s5) var(--s4);display:flex;flex-direction:column;gap:var(--s1)"><div class="word" style="margin:0 var(--s2) var(--s5)">${boat(30)}Northvale <span class="beta">BETA</span></div>${["book", "target", "compass", "user"].map((n, i) => `<div style="display:flex;align-items:center;gap:var(--s3);height:52px;padding:0 var(--s4);border-radius:var(--r1);font-weight:${i === on ? "var(--w3)" : "var(--w2)"};font-size:var(--t-lead);background:${i === on ? "var(--surface2)" : "transparent"};color:${i === on ? "var(--ink)" : "var(--mid)"}">${ic(n, 24)}${STR[lang].tabs[i]}</div>`).join("")}<div style="margin-top:auto;display:flex;align-items:center;gap:var(--s3);height:52px;padding:0 var(--s4);color:var(--mid);font-weight:var(--w2);font-size:var(--t-lead)">${ic("chat", 24)}${STR[lang].ask}</div></aside>`;
const LAPTOP = {};
LAPTOP.today = (lang = "en", look = "cream") => {
  const s = STR[lang];
  const ic5 = [["pie", "done", lang === "es" ? "Presupuesto" : "Budgeting"], ["piggy", "now", lang === "es" ? "Ahorro" : "Saving"], ["building", "far", lang === "es" ? "Bancos" : "Banking"], ["wallet", "far", lang === "es" ? "Primer sueldo" : "First paycheck"], ["card", "far", lang === "es" ? "Crédito" : "Credit"], ["shield", "far", lang === "es" ? "Estafas" : "Scams"]];
  return page(`${side(lang, 0)}<main style="position:absolute;left:248px;right:360px;top:0;bottom:0;padding:var(--s6) var(--s7) 0"><div class="mid" style="font-size:var(--t-body)">${s.date}</div><div class="disp" style="font-size:var(--t-head);margin-bottom:var(--s5)">${s.today}</div><div class="card" style="padding:var(--s6);border-radius:var(--r3);display:flex;gap:var(--s6);align-items:center"><div style="flex:1"><div style="display:flex;gap:var(--s3);align-items:center"><span class="cap">${s.next}</span><span class="chip">${ic("piggy", 16)} ${lang === "es" ? "Ahorro" : "Saving"}</span></div><div class="disp" style="font-size:var(--t-head);margin:var(--s3) 0 var(--s2)">${T(lang, save2.title)}</div><div class="mid" style="font-size:var(--t-lead);line-height:1.45;max-width:440px">${T(lang, save2.life)}</div><div class="mid" style="margin:var(--s3) 0 var(--s5)">${s.lessonOf}</div><div class="btn" style="width:240px">${s.cont} ${ic("next", 22, 2.4)}</div></div></div><div class="sea" style="margin-top:var(--s5);height:250px"><div style="position:absolute;left:var(--s5);top:var(--s4);right:var(--s5);display:flex;justify-content:space-between;align-items:baseline"><span class="cap">${s.path}</span><span class="mid">${s.unitOf}</span></div><svg width="100%" height="250" viewBox="0 0 700 250" preserveAspectRatio="none" aria-hidden="true" style="position:absolute;inset:0"><path d="M0 205q58-20 117 0t117 0 117 0 117 0 116 0 116 0V250H0z" fill="var(--artSea)"/><path d="M0 225q58-16 117 0t117 0 117 0 117 0 116 0 116 0V250H0z" fill="var(--artSea2)" opacity=".6"/></svg><div style="position:absolute;left:var(--s5);right:var(--s5);top:78px;display:flex;align-items:flex-start"><div style="position:absolute;left:30px;right:30px;top:28px;border-top:2px dashed var(--artSea2)"></div>${ic5.map(([n, k, lab]) => `<div style="flex:1;display:flex;flex-direction:column;align-items:center;position:relative"><div class="node ${k}" style="${k === "now" ? "" : "margin:6px 0"}">${k === "done" ? ic("check", 22, 3) : ic(n, k === "now" ? 26 : 22)}</div><div style="margin-top:var(--s2);font-size:var(--t-sm);font-weight:${k === "now" ? "var(--w3)" : "var(--w2)"};color:${k === "far" ? "var(--mid)" : "var(--ink)"};text-align:center">${lab}</div></div>`).join("")}</div><div style="position:absolute;right:var(--s5);bottom:var(--s4)">${boat(48)}</div></div></main><aside style="position:absolute;right:0;top:0;bottom:0;width:360px;padding:var(--s6) var(--s5);display:flex;flex-direction:column;gap:var(--s3);border-left:1px solid var(--line)"><div class="card" style="padding:var(--s4)"><div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:var(--s3)"><b>${s.week}</b><span class="chip">${star(14)} ${s.streak}</span></div>${week(lang)}<div class="mid num" style="font-size:var(--t-sm);margin-top:var(--s3)">${s.xp}</div></div><div class="card" style="overflow:hidden"><div class="row"><div class="ico">${ic("refresh", 20)}</div><div><div class="t">${s.review}</div><div class="s">${s.reviewSub}</div></div><span class="chev">${ic("next", 20)}</span></div><div class="row"><div class="ico">${ic("flag", 20)}</div><div><div class="t">${s.mission}</div><div class="s">${s.missionSub}</div></div><span class="chev">${ic("next", 20)}</span></div></div></aside>`, { look, lg: true, w: 1366, h: 768 });
};
const lapHdr = (n, of) => `<div style="position:absolute;left:0;right:0;top:0;height:72px;display:flex;align-items:center;gap:var(--s5);padding:0 var(--s6)"><div class="iconbtn">${ic("close", 26)}</div><div class="bar" style="flex:1;height:8px"><i style="width:${(n / of) * 100}%"></i></div><span class="num mid" style="font-weight:var(--w2)">${n} of ${of}</span><span class="chip" style="height:36px">${ic("chat", 16)} Ask</span></div>`;
const lessonSide = (cur) => `<aside style="width:280px;padding-top:var(--s7)"><div class="cap" style="margin-bottom:var(--s3)">In this lesson</div>${save1.steps.map((st, i) => { const k = i < cur ? "done" : i === cur ? "now" : ""; const lab = st.type === "card" ? T("en", st.title) : st.type === "action" ? "Practice" : "Question"; return `<div style="display:flex;align-items:center;gap:var(--s3);padding:var(--s2) 0;color:${i > cur ? "var(--mid)" : "var(--ink)"};font-weight:${i === cur ? "var(--w3)" : "var(--w2)"};font-size:var(--t-sm)"><span class="node ${k}" style="width:26px;height:26px;border-width:2px;${i === cur ? "box-shadow:0 0 0 4px var(--surface2)" : ""}">${i < cur ? ic("check", 14, 3) : `<span style="font-size:12px">${i + 1}</span>`}</span><span style="white-space:nowrap;overflow:hidden;text-overflow:ellipsis">${lab}</span></div>`; }).join("")}<div class="btn sec sm" style="margin-top:var(--s5);width:100%">${ic("chat", 18)} Ask about this</div></aside>`;
const lapWrap = (main, cur) => `<div style="position:absolute;left:50%;transform:translateX(-50%);top:96px;width:1040px;display:flex;gap:var(--s7)"><div style="width:712px">${main}</div>${lessonSide(cur)}</div>`;
LAPTOP.idea = (lang = "en", look = "cream") => page(`${lapHdr(1, 6)}${lapWrap(`<div class="cap">Idea · ${save1.title.en}</div><div class="disp" style="font-size:var(--t-head);margin:var(--s3) 0 var(--s5)">${idea.title.en}</div><div style="font-size:var(--t-lead);line-height:1.6;max-width:680px">${idea.body.en}</div><div class="card" style="margin-top:var(--s6);padding:var(--s5)"><div class="cap" style="margin-bottom:var(--s3)">An example</div><div style="display:flex;justify-content:space-between;align-items:baseline"><span class="mid">Payday</span><b class="num" style="font-size:var(--t-title)">$1,000</b></div><div style="display:flex;height:18px;border-radius:99px;overflow:hidden;margin:var(--s3) 0"><i style="width:10%;background:var(--ink)"></i><i style="flex:1;background:var(--surface2)"></i></div><div style="display:flex;justify-content:space-between"><span><b>Save first</b> <span class="num mid">$100</span></span><span><b>Spend the rest</b> <span class="num mid">$900</span></span></div></div><div style="display:flex;align-items:center;gap:var(--s5);margin-top:var(--s6)"><div class="btn" style="width:280px">Continue</div><span class="low" style="font-size:var(--t-sm)">Press Enter</span></div>`, 0)}`, { look, lg: true, w: 1366, h: 768 });
LAPTOP.question = (lang = "en", look = "cream") => page(`${lapHdr(3, 6)}${lapWrap(`<div class="cap">Question · ${save1.title.en}</div><div class="disp" style="font-size:var(--t-head);margin:var(--s3) 0 var(--s5);line-height:1.2">${q1.q.en}</div>${q1.options.map((o, i) => `<div class="opt ${i === 1 ? "sel" : ""}"><span class="k">${i === 1 ? ic("check", 16, 3) : i + 1}</span>${o.en}</div>`).join("")}<div style="display:flex;align-items:center;gap:var(--s5);margin-top:var(--s5)"><div class="btn" style="width:280px">Check</div><span class="low" style="font-size:var(--t-sm)">Press 1 to 3 to choose, Enter to check</span></div>`, 2)}`, { look, lg: true, w: 1366, h: 768 });
LAPTOP.welcome = (lang = "en", look = "cream") => {
  const s = STR[lang];
  const seg = (label, items, on) => `<div><div class="cap" style="margin-bottom:var(--s2)">${label}</div><div style="display:flex;border-radius:var(--r1);background:var(--surface2);padding:3px;gap:3px">${items.map((x, i) => `<div style="flex:1;height:46px;border-radius:9px;display:grid;place-items:center;font-size:var(--t-sm);font-weight:var(--w2);${i === on ? "background:var(--surface);box-shadow:inset 0 0 0 2px var(--select)" : "color:var(--mid)"}">${x}</div>`).join("")}</div></div>`;
  return page(`<div style="position:absolute;left:0;top:0;bottom:0;width:46%;background:var(--ink);color:var(--bg);padding:var(--s7);display:flex;flex-direction:column"><div class="word" style="color:var(--bg)">${boat(32, "var(--bg)")}Northvale</div><div style="margin-top:auto;margin-bottom:var(--s7)"><div class="disp" style="font-size:var(--t-disp);max-width:420px">${s.find}</div><div style="margin-top:var(--s4);font-size:var(--t-lead);line-height:1.5;max-width:440px;opacity:.85">${lang === "es" ? "Lecciones prácticas y tranquilas de dinero en inglés y español, hechas para la vida entre EE. UU. y México." : "Calm, practical money lessons in English and Spanish, made for life between the US and Mexico."}</div></div><div style="font-size:var(--t-sm);opacity:.75">${s.ads}</div></div><div style="position:absolute;right:0;top:0;bottom:0;width:54%;display:grid;place-items:center"><div style="width:440px"><div class="disp" style="font-size:var(--t-head)">${s.welcome}</div><div class="mid" style="font-size:var(--t-lead);margin:var(--s3) 0 var(--s5);line-height:1.45">${s.sub}</div><div style="display:flex;flex-direction:column;gap:var(--s3)"><div class="btn">${s.start}</div><div class="btn sec">${s.have}</div></div><div style="display:flex;flex-direction:column;gap:var(--s4);margin-top:var(--s6)">${seg(s.language, ["English", "Español"], lang === "en" ? 0 : 1)}${seg(s.country, [s.us, s.mx, s.both], lang === "en" ? 0 : 1)}</div><div class="low" style="font-size:var(--t-sm);margin-top:var(--s5);line-height:1.5">${s.note}</div></div></div>`, { look, lg: true, w: 1366, h: 768 });
};

// ---------- write and render ----------
const JOBS = [
  ["phone-welcome", SCREENS.welcome(), 390, 844], ["phone-welcome-es", SCREENS.welcome("es"), 390, 844],
  ["phone-todayA", SCREENS.todayA(), 390, 844], ["phone-todayB", SCREENS.todayB(), 390, 844], ["phone-todayA-es", SCREENS.todayA("es"), 390, 844], ["phone-todayA-navy", SCREENS.todayA("en", "navy"), 390, 844], ["phone-todayA-navycream", SCREENS.todayA("en", "navycream"), 390, 844],
  ["phone-ideaA", SCREENS.ideaA(), 390, 844], ["phone-ideaB", SCREENS.ideaB(), 390, 844],
  ["phone-question", SCREENS.question(), 390, 844], ["phone-question-navy", SCREENS.question("en", "navy"), 390, 844], ["phone-feedback-right", SCREENS.feedbackRight(), 390, 844], ["phone-feedback-wrong", SCREENS.feedbackWrong(), 390, 844],
  ["phone-finish", SCREENS.finish(), 390, 844], ["phone-ideaA-es", SCREENS.ideaA("es"), 390, 844], ["phone-question-es", SCREENS.question("es"), 390, 844], ["phone-finish-es", SCREENS.finish("es"), 390, 844], ["phone-goals-es", SCREENS.goals("es"), 390, 844], ["phone-goals", SCREENS.goals(), 390, 844], ["phone-settings", SCREENS.settings(), 390, 844], ["phone-settings-es", SCREENS.settings("es"), 390, 844],
  ["laptop-welcome", LAPTOP.welcome(), 1366, 768], ["laptop-today", LAPTOP.today(), 1366, 768], ["laptop-today-navy", LAPTOP.today("en", "navy"), 1366, 768], ["laptop-today-es", LAPTOP.today("es"), 1366, 768], ["laptop-idea", LAPTOP.idea(), 1366, 768], ["laptop-question", LAPTOP.question(), 1366, 768],
];
const only = process.argv[2];
const browser = await chromium.launch({ channel: "chrome", headless: true });
for (const [name, html, w, h] of JOBS) {
  if (only && !name.includes(only)) continue;
  writeFileSync(join(OUT, `${name}.html`), html);
  const p = await browser.newPage({ viewport: { width: w, height: h }, deviceScaleFactor: w < 500 ? 2 : 1 });
  await p.goto(`file://${join(OUT, `${name}.html`)}`);
  await p.evaluate(() => document.fonts.ready);
  await p.screenshot({ path: join(OUT, `${name}.png`) });
  await p.close();
}
await browser.close();
console.log("mockups written to", OUT);
