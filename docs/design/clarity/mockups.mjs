// The clarity plan's mockups: quick HTML prototypes of the proposed
// screens (not the app), photographed at phone size. Content is the app's
// real course (unit and lesson titles, the demo learner Dani).
//   node docs/design/clarity/mockups.mjs   → docs/design/clarity/*.png + mockups.html
import { readFileSync, writeFileSync } from "node:fs";
import { join } from "node:path";
import { chromium } from "playwright-core";

const DIR = import.meta.dirname;
const ROOT = join(DIR, "../../..");
const font = (f) => `data:font/woff2;base64,${readFileSync(join(ROOT, "web/fonts", f)).toString("base64")}`;
const src = readFileSync(join(ROOT, "src/core/ui.jsx"), "utf8");
const PATHS = Object.fromEntries([...src.slice(src.indexOf("const PATHS")).matchAll(/^\s*([a-z_]+):\s*"([^"]+)"/gm)].map((m) => [m[1], m[2]]));
const FLAME = "M12 2c1 4 6 6 6 12a6 6 0 01-12 0c0-3 2-5 3-6 0 2 1 3 2 3 0-3-1-6 1-9z";
const ic = (name, size = 20, color = "currentColor", fill = false) =>
  name === "flame" ? `<svg width="${size}" height="${size}" viewBox="0 0 24 24"><path d="${FLAME}" fill="${color}"/></svg>` : `<svg width="${size}" height="${size}" viewBox="0 0 24 24" fill="${fill ? color : "none"}" stroke="${color}" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="${PATHS[name] || ""}"/></svg>`;

const CSS = `
@font-face{font-family:Inter;font-weight:100 900;src:url(${font("inter-latin-wght-normal.woff2")})}
@font-face{font-family:Garamond;font-weight:600 700;src:url(${font("eb-garamond-latin-600-normal.woff2")})}
*{box-sizing:border-box;margin:0;padding:0}
body{background:#d9dde3;font-family:Inter,system-ui,sans-serif;padding:24px;display:flex;flex-wrap:wrap;gap:24px}
.phone{--bg:#fff;--surface:#f4f5f7;--surface2:#eceef1;--ink:#1f2328;--mid:#5b6573;--low:#98a1ae;--line:#e9ebee;--navy:#13315c;--onNavy:#fff;--navySoft:#e8edf5;--good:#1e7a5f;--goodSoft:#e6f2ee;--warn:#9a5b12;--warnSoft:#fbf1e4;
  width:390px;height:844px;background:var(--bg);color:var(--ink);position:relative;overflow:hidden;font-size:16px;line-height:1.45;border-radius:0}
.phone.dark{--bg:#0f1216;--surface:#191d23;--surface2:#222730;--ink:#e8eaed;--mid:#a6afbb;--low:#6f7986;--line:#262b33;--navy:#9db8e6;--onNavy:#0f1216;--navySoft:#1d2a40;--good:#4db892;--goodSoft:#12302a}
.top{height:56px;display:flex;align-items:center;gap:10px;padding:0 16px}
.mark{font-family:Garamond,Georgia,serif;font-weight:650;font-size:25px;letter-spacing:-.3px}
.tabtitle{font-size:18px;font-weight:700}
.grow{flex:1}
.chip{display:inline-flex;align-items:center;gap:5px;font-weight:650;font-size:15px;color:var(--mid);height:36px;padding:0 6px}
.ask{display:inline-flex;align-items:center;gap:6px;height:36px;padding:0 14px;border-radius:18px;background:var(--surface);font-weight:650;font-size:15px;color:var(--ink)}
.body{padding:4px 16px 100px}
.date{font-size:14px;color:var(--low);font-weight:500}
h1{font-size:30px;font-weight:750;letter-spacing:-.6px;line-height:1.15;margin:2px 0 14px}
h2{font-size:18px;font-weight:700;margin:26px 0 10px}
.card{background:var(--surface);border-radius:18px;padding:18px}
.hero{padding:22px 20px}
.eyebrow{font-size:13px;color:var(--mid);font-weight:600}
.hero .title{font-size:26px;font-weight:750;letter-spacing:-.4px;margin:4px 0 2px}
.meta{font-size:14px;color:var(--mid)}
.why{font-size:15px;color:var(--ink);margin:12px 0 18px;line-height:1.45}
.btn{display:flex;align-items:center;justify-content:center;height:54px;border-radius:14px;background:var(--navy);color:var(--onNavy);font-weight:700;font-size:17px;width:100%}
.btn.sec{background:var(--surface);color:var(--ink)}
.btn.small{height:40px;font-size:15px;width:auto;padding:0 16px;display:inline-flex}
.reason{display:flex;align-items:center;gap:8px;margin-top:14px;font-size:14px;color:var(--mid)}
.rows{background:var(--surface);border-radius:18px;padding:2px 0;margin-top:12px}
.row{display:flex;align-items:center;gap:12px;padding:14px 16px;min-height:56px}
.row+.row{border-top:1px solid var(--line)}
.row .t{font-weight:650;font-size:16px}
.row .s{font-size:14px;color:var(--mid)}
.row .x{flex:1;min-width:0}
.tile{width:36px;height:36px;border-radius:10px;background:var(--bg);display:flex;align-items:center;justify-content:center;color:var(--ink);flex-shrink:0}
.dark .tile{background:var(--surface2)}
.chev{color:var(--low)}
.bar{height:6px;border-radius:3px;background:var(--surface2);overflow:hidden}
.bar>i{display:block;height:100%;background:var(--navy);border-radius:3px}
.tabs{position:absolute;z-index:5;left:0;right:0;bottom:0;height:84px;background:var(--bg);border-top:1px solid var(--line);display:flex;padding:8px 8px 26px}
.tab{flex:1;display:flex;flex-direction:column;align-items:center;gap:3px;font-size:12px;font-weight:650;color:var(--low)}
.tab.on{color:var(--navy)}
.step{display:flex;align-items:center;gap:14px;padding:12px 0}
.dot{width:28px;height:28px;border-radius:14px;border:2px solid var(--surface2);display:flex;align-items:center;justify-content:center;flex-shrink:0;background:var(--bg);position:relative;z-index:1}
.step .x{flex:1;min-width:0}
.dot.done{background:var(--navy);border-color:var(--navy);color:var(--onNavy)}
.dot.now{border-color:var(--navy);border-width:3px}
.line{position:absolute;left:13px;top:28px;bottom:-12px;width:2px;background:var(--surface2)}
.steps{position:relative}
.unit{display:flex;align-items:center;gap:12px;padding:13px 16px}
.unit+.unit{border-top:1px solid var(--line)}
.opt{display:flex;align-items:center;gap:14px;background:var(--surface);border-radius:16px;padding:14px 16px;margin-bottom:10px}
.opt .t{font-weight:650}
.opt .s{font-size:14px;color:var(--mid)}
.qopt{border-radius:14px;padding:16px;margin-bottom:10px;background:var(--surface);font-weight:600;font-size:17px;border:2px solid transparent}
.qopt.sel{border-color:var(--navy);background:var(--navySoft)}
.sheet{position:absolute;z-index:7;left:0;right:0;bottom:0;background:var(--bg);border-radius:22px 22px 0 0;padding:10px 16px 26px;box-shadow:0 -8px 30px rgba(0,0,0,.12)}
.scrim{position:absolute;z-index:6;inset:0;background:rgba(15,18,22,.42)}
.grab{width:40px;height:5px;border-radius:3px;background:var(--surface2);margin:0 auto 12px}
.seg{display:flex;background:var(--surface);border-radius:10px;padding:3px;gap:3px}
.seg span{flex:1;text-align:center;padding:6px 10px;border-radius:8px;font-size:14px;font-weight:650;color:var(--mid)}
.seg .on{background:var(--bg);color:var(--ink);box-shadow:0 1px 2px rgba(0,0,0,.08)}
.me{align-self:flex-end;background:var(--navy);color:var(--onNavy);border-radius:18px 18px 4px 18px;padding:10px 14px;max-width:80%;font-size:15px}
.ai{align-self:flex-start;background:var(--surface);border-radius:18px 18px 18px 4px;padding:12px 14px;max-width:88%;font-size:15px;line-height:1.5}
.convo{display:flex;flex-direction:column;gap:10px;margin:12px 0}
.link{display:flex;align-items:center;gap:8px;margin-top:10px;padding:10px 12px;background:var(--bg);border-radius:12px;font-size:14px;font-weight:600;color:var(--navy)}
.input{display:flex;align-items:center;gap:8px;background:var(--surface);border-radius:24px;padding:6px 6px 6px 16px;color:var(--low);font-size:15px}
.send{width:38px;height:38px;border-radius:19px;background:var(--navy);display:flex;align-items:center;justify-content:center;color:var(--onNavy)}
.sugg{display:flex;flex-wrap:wrap;gap:8px;margin:10px 0 14px}
.sugg span{background:var(--surface);border-radius:16px;padding:8px 12px;font-size:14px;font-weight:600}
.banner{display:flex;gap:10px;background:var(--warnSoft);color:var(--ink);border-radius:14px;padding:12px 14px;font-size:14px;line-height:1.45}
.tag{display:inline-block;font-size:12px;font-weight:700;color:var(--navy);background:var(--navySoft);border-radius:8px;padding:3px 8px}
.label{font-size:13px;color:var(--low);font-weight:600;margin:0 0 6px}
.fine{font-size:13px;color:var(--low);line-height:1.45}
.caption{width:390px;font-size:15px;font-weight:700;color:#1f2328;margin-top:-14px}
`;

const header = ({ title, mark, dark }) => `<div class="top">${mark ? `<span class="mark">Northvale</span>` : `<span class="tabtitle">${title}</span>`}<span class="grow"></span><span class="chip">${ic("flame", 18, "var(--navy)")}6</span><span class="ask">${ic("chat", 17)}Ask</span></div>`;
const tabs = (on, L = EN) => `<div class="tabs">${[["book", L.learn], ["target", L.goals], ["compass", L.practice], ["user", L.me]].map(([i, l], k) => `<div class="tab ${k === on ? "on" : ""}">${ic(i, 24)}<span>${l}</span></div>`).join("")}</div>`;
const EN = { learn: "Learn", goals: "Goals", practice: "Practice", me: "Me" };
const ES = { learn: "Aprender", goals: "Metas", practice: "Práctica", me: "Yo" };
const row = (icon, t, s, right = ic("next", 18, "var(--low)")) => `<div class="row"><span class="tile">${ic(icon, 19)}</span><div class="x"><div class="t">${t}</div>${s ? `<div class="s">${s}</div>` : ""}</div>${right}</div>`;

// Today: the top of the Learn tab.
const today = (L, dark) =>
  L === "es"
    ? `<div class="phone ${dark ? "dark" : ""}">${header({ mark: true })}<div class="body">
  <div class="date">Jueves 5 de noviembre</div><h1>Hoy</h1>
  <div class="card hero"><div class="eyebrow">Unidad 6 · Fraudes y estafas</div><div class="title">Phishing</div><div class="meta">Lección 1 de 4 · 3 min</div>
  <div class="why">Un solo fraude puede borrar meses de ahorro.</div><div class="btn">Continuar</div>
  <div class="reason">${ic("target", 16)} Aprendes para: tu coche</div></div>
  <div class="rows">${row("refresh", "Repaso", "5 ideas para refrescar · 2 min")}${row("flame", "Racha de 6 días", "Una lección hoy la mantiene", "")}</div>
  <h2>Tu curso</h2><div class="meta" style="margin-bottom:8px">20 de 59 lecciones</div><div class="bar"><i style="width:34%"></i></div>
  </div>${tabs(0, ES)}</div>`
    : `<div class="phone ${dark ? "dark" : ""}">${header({ mark: true })}<div class="body">
  <div class="date">Thursday, November 5</div><h1>Today</h1>
  <div class="card hero"><div class="eyebrow">Unit 6 · Scams and fraud</div><div class="title">Phishing</div><div class="meta">Lesson 1 of 4 · 3 min</div>
  <div class="why">One scam can undo months of saving.</div><div class="btn">Continue</div>
  <div class="reason">${ic("target", 16)} Building toward: your car</div></div>
  <div class="rows">${row("refresh", "Review", "5 ideas to refresh · 2 min")}${row("flame", "6-day streak", "A lesson today keeps it going", "")}${row("flag", "This week's mission", "Price the full cost of a car")}</div>
  <h2>Your course</h2><div class="meta" style="margin-bottom:8px">20 of 59 lessons</div><div class="bar"><i style="width:34%"></i></div>
  </div>${tabs(0)}</div>`;

const lessonStep = (status, title, meta, last) => `<div class="step" style="position:relative">${last ? "" : `<span class="line"></span>`}<span class="dot ${status}">${status === "done" ? ic("check", 15, "currentColor") : status === "lock" ? ic("lock", 13, "var(--low)") : ""}</span><div class="x"><div class="t" style="font-weight:${status === "now" ? 750 : 600};color:${status === "lock" ? "var(--low)" : "var(--ink)"}">${title}</div><div class="s" style="font-size:14px;color:var(--mid)">${meta}</div></div>${status === "now" ? `<span class="btn small">Start</span>` : ""}</div>`;
const unitRow = (state, n, title, meta) => `<div class="unit"><span class="dot ${state === "done" ? "done" : ""}" style="width:24px;height:24px">${state === "done" ? ic("check", 13, "currentColor") : state === "lock" ? ic("lock", 12, "var(--low)") : ""}</span><div class="x" style="flex:1"><div style="font-size:13px;color:var(--low);font-weight:600">Unit ${n}</div><div style="font-weight:650;color:${state === "lock" ? "var(--mid)" : "var(--ink)"}">${title}</div></div><span class="meta">${meta}</span></div>`;

const screens = {
  "1-welcome": `<div class="phone"><div style="padding:150px 28px 0;text-align:center"><div class="mark" style="font-size:52px">Northvale</div><div style="font-size:13px;font-weight:650;letter-spacing:4px;color:var(--low);margin-top:4px">LEARN</div>
  <div style="font-size:30px;font-weight:750;letter-spacing:-.6px;margin-top:64px;line-height:1.15">Learn money by doing.</div><p style="font-size:17px;color:var(--mid);margin-top:12px">Three-minute lessons, a goal to learn for, and practice with pretend money.</p></div>
  <div style="position:absolute;left:20px;right:20px;bottom:34px"><div class="btn">Get started</div><div class="btn sec" style="margin-top:10px">I already have an account</div>
  <div style="display:flex;justify-content:center;gap:8px;margin-top:16px"><span class="seg" style="display:inline-flex"><span class="on">English</span><span>Español</span></span><span class="seg" style="display:inline-flex"><span class="on">US</span><span>México</span></span></div>
  <p class="fine" style="text-align:center;margin-top:14px">Educational only · pretend money only</p></div></div>`,

  "2-why": `<div class="phone"><div class="top">${ic("back", 22)}<span class="grow"></span><span class="meta">1 of 2</span></div><div class="body">
  <h1 style="font-size:27px">What do you want to learn money skills for?</h1><p class="meta" style="margin:-4px 0 18px;font-size:15px">It picks your first lessons. You can change it any time.</p>
  ${[["car", "A car", "Saving up, and what it really costs"], ["book", "College", "Paying for school without surprises"], ["shield", "An emergency fund", "A cushion for when things go wrong"], ["chart", "My first investment", "How investing works, step by step"], ["globe", "A trip", "Planning and saving for travel"], ["card", "Getting out of debt", "Cards, loans and paying them down"], ["bulb", "Just understanding money", "Start with the basics"]].map(([i, t, s]) => `<div class="opt"><span class="tile">${ic(i, 19)}</span><div><div class="t">${t}</div><div class="s">${s}</div></div></div>`).join("")}
  </div></div>`,

  "3-start": `<div class="phone"><div class="top">${ic("back", 22)}<span class="grow"></span><span class="meta">2 of 2</span></div><div class="body">
  <h1 style="font-size:27px">How do you want to start?</h1><p class="meta" style="margin:-4px 0 18px;font-size:15px">Lessons take about 3 minutes.</p>
  <div class="opt" style="border:2px solid var(--navy);background:var(--navySoft)"><span class="tile">${ic("play", 19)}</span><div style="flex:1"><div class="t">From the beginning</div><div class="s">Budgeting, lesson 1: What's a budget?</div></div></div>
  <div class="opt"><span class="tile">${ic("target", 19)}</span><div style="flex:1"><div class="t">I know some basics</div><div class="s">A 2-minute check skips what you know</div></div></div>
  <div class="card" style="margin-top:22px"><div class="label">Why these lessons</div><div style="font-size:15px">For a car: budgeting, saving, your first paycheck, credit and insurance come first.</div></div>
  </div><div style="position:absolute;left:20px;right:20px;bottom:34px"><div class="btn">Start my first lesson</div></div></div>`,

  "4-today": today("en"),

  "5-learn-path": `<div class="phone">${header({ title: "Learn" })}<div class="body">
  <h1 style="font-size:26px">Your course</h1><div class="meta" style="margin:-8px 0 10px">20 of 59 lessons · 6 of 17 units</div><div class="bar"><i style="width:34%"></i></div>
  <div class="rows" style="margin-top:18px">${unitRow("done", 1, "Budgeting", "3 of 3")}${unitRow("done", 2, "Saving", "3 of 3")}${unitRow("done", 3, "Banking for real", "4 of 4")}${unitRow("done", 4, "Your first paycheck", "4 of 4")}${unitRow("done", 5, "Debt & credit", "3 of 3")}</div>
  <div class="card" style="margin-top:12px;padding:16px 18px 6px"><div style="font-size:13px;color:var(--low);font-weight:600">Unit 6 · Now</div><div style="font-size:20px;font-weight:750;margin-bottom:6px">Scams and fraud</div>
  <div class="steps">${lessonStep("now", "Phishing", "3 min")}${lessonStep("", "Fake investments", "3 min")}${lessonStep("", "Pyramid schemes", "3 min")}${lessonStep("", "Protect your accounts", "3 min", true)}</div></div>
  <div class="rows">${unitRow("done", 7, "Compound interest", "3 of 3")}${unitRow("", 8, "Taxes made simple", "4 lessons")}${unitRow("lock", 9, "Insurance basics", "after Unit 8")}</div>
  <div class="meta" style="text-align:center;margin-top:12px">8 more units</div>
  </div>${tabs(0)}</div>`,

  "6-lesson": `<div class="phone"><div class="top">${ic("close", 22, "var(--low)")}<div class="bar" style="flex:1;margin:0 8px"><i style="width:45%"></i></div><span class="ask" style="height:32px;padding:0 12px">${ic("chat", 15)}Ask</span>${ic("flag", 18, "var(--low)")}</div><div class="body" style="padding-top:18px">
  <div class="label" style="text-transform:none">Question</div><div style="font-size:23px;font-weight:750;letter-spacing:-.3px;line-height:1.25;margin-bottom:20px">A text says your bank account is locked and asks you to "verify" with a link. What should you do?</div>
  <div class="qopt">Tap the link and log in quickly</div><div class="qopt sel">Open your bank's app or call the number on your card</div><div class="qopt">Reply with your account number</div>
  </div><div style="position:absolute;left:16px;right:16px;bottom:34px"><div class="btn">Check</div></div></div>`,

  "7-goals": `<div class="phone">${header({ title: "Goals" })}<div class="body">
  <h1 style="font-size:26px;margin-bottom:4px">Goals</h1><p class="meta" style="margin-bottom:16px">What you're learning for.</p>
  <div class="card"><div style="display:flex;align-items:center;gap:12px"><span class="tile">${ic("car", 19)}</span><div style="flex:1"><div style="font-weight:700;font-size:17px">Car</div><div class="meta">1 yr 5 mo left</div></div><span class="tag">Ahead</span></div>
  <div style="display:flex;align-items:baseline;gap:8px;margin:14px 0 8px"><span style="font-size:30px;font-weight:750;letter-spacing:-.6px">$950</span><span class="meta">of $5,000</span></div><div class="bar"><i style="width:19%"></i></div>
  <div class="meta" style="margin-top:8px">$271 a month · savings account</div><div class="reason" style="margin-top:12px">${ic("book", 16)} 3 lessons left that help this goal</div></div>
  <div class="card" style="margin-top:12px"><div style="display:flex;align-items:center;gap:12px"><span class="tile">${ic("shield", 19)}</span><div style="flex:1"><div style="font-weight:700;font-size:17px">Emergency fund</div><div class="meta">$210 of $1,000 · 9 mo left</div></div></div><div class="bar" style="margin-top:12px"><i style="width:21%"></i></div></div>
  <div class="rows">${row("plus", "Record money set aside", "")}${row("calendar", "Weekly check-in", "Sunday · 2 minutes")}${row("target", "New goal", "")}</div>
  <p class="fine" style="margin-top:14px">Goals are a planning exercise with example rates. Northvale never holds or moves real money.</p>
  </div>${tabs(1)}</div>`,

  "8-practice": `<div class="phone">${header({ title: "Practice" })}<div class="body">
  <h1 style="font-size:26px;margin-bottom:4px">Practice</h1><p class="meta" style="margin-bottom:16px">Try what you learned. Pretend money only.</p>
  <div class="card"><div class="label" style="text-transform:none">This week's mission</div><div style="font-weight:700;font-size:17px">Price the full cost of a car</div><div class="meta" style="margin:2px 0 12px">About 20 min · on your own, no money moves</div><span class="btn small">Start mission</span></div>
  <div class="rows">${row("chart", "Practice portfolio", "$10,000 pretend · you own 1 fund")}${row("pie", "Tools from your lessons", "Budget planner, Paycheck, Starting early")}${row("news", "News, explained", "3 stories this week")}${row("flag", "All Money Missions", "31 small real-life tasks")}</div>
  <p class="fine" style="margin-top:14px">New tools appear here as the lessons that use them are finished.</p>
  </div>${tabs(2)}</div>`,

  "9-me": `<div class="phone">${header({ title: "Me" })}<div class="body">
  <div style="display:flex;align-items:center;gap:14px;margin:4px 0 16px"><span style="width:54px;height:54px;border-radius:27px;background:var(--navy);color:var(--onNavy);display:flex;align-items:center;justify-content:center;font-weight:700;font-size:22px">D</span><div><div style="font-size:22px;font-weight:750">Dani</div><div class="meta">Level 3 · 285 XP</div></div></div>
  <div class="card" style="display:flex;justify-content:space-around;text-align:center;padding:14px">${[["6", "day streak"], ["285", "XP"], ["1", "freeze"]].map(([n, l]) => `<div><div style="font-size:22px;font-weight:750">${n}</div><div class="meta">${l}</div></div>`).join("")}</div>
  <h2>This week's league</h2><div class="rows">${[["1", "Maya", "85"], ["2", "Leo", "60"], ["3", "Dani (you)", "35"]].map(([r, n, x]) => `<div class="row" style="min-height:48px;padding:10px 16px"><span style="width:18px;color:var(--low);font-weight:650">${r}</span><span class="x" style="font-weight:${n.includes("you") ? 750 : 550}">${n}</span><span class="meta">${x} XP</span></div>`).join("")}</div>
  <div class="rows">${row("trophy", "Achievements", "7 of 20")}${row("star", "Skills", "20 learning · 39 new")}${row("users", "Invite a friend", "A streak freeze for each of you")}${row("settings", "Settings", "")}${row("chat", "Send feedback", "")}</div>
  </div>${tabs(3)}</div>`,

  "10-ask": `<div class="phone">${today("en").replace(/^<div class="phone ">/, "").replace(/<\/div>$/, "")}<div class="scrim"></div><div class="sheet" style="top:96px">
  <div class="grab"></div><div style="display:flex;align-items:center;gap:10px"><div style="font-size:20px;font-weight:750;flex:1">Ask</div><div class="seg" style="width:170px"><span class="on">Simple</span><span>Expert</span></div></div>
  <div class="convo"><div class="me">Why keep an emergency fund in a savings account?</div>
  <div class="ai">Because you might need it fast. A savings account keeps it apart from your spending money, you can get to it in a day or two, and in the US it's usually insured by the FDIC up to $250,000 per bank. Investing it could mean selling at a bad time.<div class="link">${ic("book", 16)} Covered in Saving · Where to keep savings</div></div>
  <div class="me">what about for teens?</div>
  <div class="ai">Same idea. Under 18, you usually open it with a parent or guardian (a joint or custodial account). Look for no monthly fee and no minimum balance.</div></div>
  <div style="position:absolute;left:16px;right:16px;bottom:30px"><div class="input"><span style="flex:1">Ask anything about money…</span><span class="send">${ic("send", 17, "currentColor")}</span></div><p class="fine" style="margin-top:8px;text-align:center">For learning, not advice. It never tells you what to buy.</p></div></div></div>`,

  "11-ask-offline": `<div class="phone">${today("en").replace(/^<div class="phone ">/, "").replace(/<\/div>$/, "")}<div class="scrim"></div><div class="sheet" style="top:96px">
  <div class="grab"></div><div style="display:flex;align-items:center;gap:10px"><div style="font-size:20px;font-weight:750;flex:1">Ask</div></div>
  <div class="banner" style="margin-top:12px">${ic("info", 18)}<span><b>The tutor is in offline mode,</b> so it can only explain basic terms. Ask about a word like "APR" or "index fund".</span></div>
  <div class="convo"><div class="me">how do credit cards charge you interest</div>
  <div class="ai"><div class="label" style="text-transform:none;margin-bottom:4px">From the glossary: APR</div>The yearly interest rate on a balance you don't pay off. Pay the full statement balance by the due date and most cards charge no interest at all.<div class="link">${ic("book", 16)} Lesson: Debt & credit · Credit cards</div></div></div>
  <div class="label" style="text-transform:none">Try asking</div><div class="sugg"><span>What's an index fund?</span><span>What's compound interest?</span><span>What's a credit score?</span><span>What's a budget?</span></div>
  <div style="position:absolute;left:16px;right:16px;bottom:30px"><div class="input"><span style="flex:1">Ask about a money word…</span><span class="send">${ic("send", 17, "currentColor")}</span></div></div></div></div>`,

  "12-intro-practice": `<div class="phone">${today("en").replace(/^<div class="phone ">/, "").replace(/<\/div>$/, "")}<div class="scrim"></div><div class="sheet">
  <div class="grab"></div><span class="tile" style="width:52px;height:52px;background:var(--navySoft);color:var(--navy)">${ic("compass", 26)}</span>
  <div style="font-size:22px;font-weight:750;margin:14px 0 6px">New: Practice</div><p style="color:var(--mid);font-size:16px">You've finished 3 lessons, so <b style="color:var(--ink)">Money Missions</b> are open: small real-life tasks, like finding the fees on a bank account. You do them on your own; no money moves.</p>
  <p style="color:var(--mid);font-size:16px;margin-top:10px">The practice portfolio opens with the investing lessons.</p>
  <div class="btn" style="margin-top:20px">Take a look</div><div style="text-align:center;margin-top:12px;font-weight:650;color:var(--mid)">Later</div></div></div>`,

  "13-today-dark": today("en", true),
  "14-today-es": today("es"),
};

const html = `<!doctype html><meta charset="utf-8"><title>Northvale Learn — clarity mockups</title><style>${CSS}</style>${Object.entries(screens).map(([id, h]) => `<div><div id="s-${id}">${h}</div><div class="caption" style="margin-top:8px">${id}</div></div>`).join("")}`;
writeFileSync(join(DIR, "mockups.html"), html);

const browser = await chromium.launch({ channel: "chrome", headless: true });
const page = await browser.newPage({ viewport: { width: 1800, height: 1000 }, deviceScaleFactor: 2 });
await page.setContent(html);
await page.evaluate(() => document.fonts.ready);
for (const id of Object.keys(screens)) await page.locator(`#s-${id} .phone`).first().screenshot({ path: join(DIR, `${id}.png`) });
await page.setViewportSize({ width: 1800, height: 1000 });
await page.screenshot({ path: join(DIR, "0-all-screens.png"), fullPage: true });
await browser.close();
console.log(`${Object.keys(screens).length} mockups in docs/design/clarity/`);
