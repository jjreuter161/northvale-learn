// Mockups for the next round (nothing in the app changes):
//   1 · "Your course": calm and detailed, in Cream and Navy
//   2 · The lighthouse's sweeping beam: frames, plus lighthouse.webm
//   3 · Cream, Navy and Match my device (the Settings picker; real screens)
//   4 · Milestone 5's signature features
//   node docs/design/next/mockups.mjs
import { readFileSync, writeFileSync, existsSync } from "node:fs";
import { join } from "node:path";
import { chromium } from "playwright-core";
import { UNIT_ART, MARK_PATHS, star, boat, wave } from "../../../src/core/art.js";
import { LANDMARK, landmark } from "./landmarks.mjs";

const HERE = import.meta.dirname;
const ROOT = join(HERE, "../../..");
const font = (family, file, weight) => `@font-face{font-family:${family};font-weight:${weight};src:url(data:font/woff2;base64,${readFileSync(join(ROOT, "web/fonts", file)).toString("base64")})}`;
const FONTS = font("Inter", "inter-latin-wght-normal.woff2", "100 900") + font("Garamond", "eb-garamond-latin-600-normal.woff2", "600 700") + font("Fraunces", "fraunces-latin-soft-normal.woff2", "100 900");
// The app's two looks (src/core/ui.jsx LOOKS), as Cream and Navy.
const TOKENS = (c) => Object.entries(c).map(([k, v]) => `--${k}:${v}`).join(";");
const CREAM = { bg: "#F7F2E8", surface: "#FFFDF8", surface2: "#EFE7D8", ink: "#22303F", head: "#13315C", mid: "#4C5866", low: "#5C6573", line: "#E6DCCB", brand: "#13315C", onBrand: "#FFFDF8", brandSoft: "#E3E7EE", edge: "#071833", right: "#1B6F54", rightSoft: "#E1EFE6", warn: "#8C520E", warnSoft: "#F7E9D2", warm: "#E9805F", warmSoft: "#FBE4D9", warmInk: "#A8462A", artInk: "#13315C", artPaper: "#FFFDF8", artSky: "#E8EDF4", artSea: "#D3DDEA", artSea2: "#A9BBD5", artSand: "#EFE0C2", artSun: "#E9805F", artSun2: "#F5C2AC", lift: "0 1px 0 rgba(19,49,92,.04), 0 12px 26px -16px rgba(19,49,92,.28)" };
const NAVY = { bg: "#0D1A2D", surface: "#15253C", surface2: "#1F3150", ink: "#F2EBDC", head: "#F7F1E6", mid: "#CFC7B7", low: "#B3AC9E", line: "#2A3C58", brand: "#F0E3C6", onBrand: "#0D1A2D", brandSoft: "#24344F", edge: "#B3A07A", right: "#63C9A2", rightSoft: "#123A33", warn: "#EBB663", warnSoft: "#3A2E19", warm: "#F29B7D", warmSoft: "#3D2C30", warmInk: "#F6B39C", artInk: "#F0E3C6", artPaper: "#15253C", artSky: "#16294A", artSea: "#22395B", artSea2: "#3A5784", artSand: "#2F4263", artSun: "#F29B7D", artSun2: "#A35F4C", lift: "0 12px 26px -16px rgba(0,0,0,.7)" };

const CSS = `
*{box-sizing:border-box;margin:0;padding:0}
body{background:#d9dde3;font-family:Inter,system-ui,sans-serif;padding:28px;width:1760px}
section{margin-bottom:44px}
section>h2{font:750 24px Inter;color:#1f2328;margin:0 0 6px}
section>p{font:15px/1.5 Inter;color:#3d4550;max-width:1180px;margin-bottom:18px}
.grid{display:flex;flex-wrap:wrap;gap:26px 24px;align-items:flex-start}
.cap{width:390px;font:700 15px Inter;color:#1f2328;margin-top:9px}
.cap small{display:block;font-weight:500;color:#4b5563;font-size:13px;margin-top:2px;line-height:1.4}
.phone{${TOKENS(CREAM)};width:390px;height:844px;background:var(--bg);color:var(--ink);position:relative;overflow:hidden;font:16px/1.45 Inter,sans-serif}
.phone.navy{${TOKENS(NAVY)}}
.disp{font-family:Fraunces,Georgia,serif;font-variation-settings:"SOFT" 100,"WONK" 0;font-weight:620;color:var(--head)}
.top{height:58px;display:flex;align-items:center;gap:7px;padding:0 16px}
.word{font-family:Garamond,Georgia,serif;font-weight:650;font-size:25px;letter-spacing:-.3px;color:var(--head)}
.grow{flex:1}
.chip{display:inline-flex;align-items:center;gap:6px;font-weight:700;font-size:15px;color:var(--mid);height:36px;padding:0 8px}
.ask{display:inline-flex;align-items:center;gap:6px;height:36px;padding:0 14px;border-radius:999px;background:var(--surface);font-weight:650;font-size:15px;color:var(--ink);box-shadow:var(--lift)}
.body{padding:6px 16px 110px}
.card{background:var(--surface);border-radius:24px;padding:18px;box-shadow:var(--lift);position:relative}
.eyebrow{font-size:13px;color:var(--low);font-weight:650}
.meta{font-size:14px;color:var(--mid)}
.fine{font-size:13px;color:var(--low);line-height:1.45}
.btn{display:flex;align-items:center;justify-content:center;gap:8px;height:52px;border-radius:18px;background:var(--brand);color:var(--onBrand);font-weight:700;font-size:16px;width:100%;box-shadow:0 3px 0 var(--edge)}
.btn.sec{background:var(--surface);color:var(--ink);border:1.5px solid var(--line);box-shadow:0 3px 0 var(--line)}
.btn.small{height:38px;width:auto;padding:0 14px;font-size:14px;border-radius:14px;display:inline-flex}
.bar{height:7px;border-radius:999px;background:var(--surface2);overflow:hidden}
.bar>i{display:block;height:100%;background:var(--brand);border-radius:999px}
.tabs{position:absolute;z-index:5;left:0;right:0;bottom:0;height:86px;background:var(--bg);border-top:1px solid var(--line);display:flex;padding:8px 8px 26px}
.tab{flex:1;display:flex;flex-direction:column;align-items:center;gap:3px;font-size:12px;font-weight:650;color:var(--low)}
.tab .pill{width:58px;height:30px;border-radius:999px;display:flex;align-items:center;justify-content:center}
.tab.on{color:var(--head)}
.tab.on .pill{background:var(--brandSoft)}
.pc{display:inline-flex;align-items:center;gap:6px;border-radius:999px;padding:7px 12px;font-weight:650;font-size:14px;background:var(--surface2);color:var(--ink)}
.pc.on{background:var(--brand);color:var(--onBrand)}
.tag{display:inline-flex;align-items:center;gap:4px;border-radius:999px;padding:2px 9px;font-size:12px;font-weight:700;background:var(--rightSoft);color:var(--right)}
.tag.now{background:var(--warmSoft);color:var(--warmInk)}
.tag.mist{background:var(--surface2);color:var(--low)}
svg{display:block}
@keyframes bob{0%,100%{transform:translateY(0) rotate(-4deg)}50%{transform:translateY(-3px) rotate(4deg)}}
@keyframes sweep{0%{transform:rotate(-28deg);opacity:.55}50%{opacity:.9}100%{transform:rotate(28deg);opacity:.55}}
@keyframes drift{from{transform:translateX(0)}to{transform:translateX(-24px)}}
.bob{animation:bob 2.4s ease-in-out infinite;transform-box:fill-box;transform-origin:50% 90%}
.anim .beam{animation:sweep 3s ease-in-out infinite alternate;transform-box:view-box;transform-origin:60px 32px}
.anim .drift{animation:drift 6s ease-in-out infinite alternate}
.phone.frame{width:220px;height:auto;border-radius:22px;overflow:hidden;background:var(--artSky)}
.panel{border-radius:22px;padding:18px;background:#fff}
`;

// ---- shared pieces ----------------------------------------------------------------------------
const icon = (d, size = 20, extra = "") => `<svg width="${size}" height="${size}" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" ${extra}><path d="${d}"/></svg>`;
const P = { book: "M5 4h9a3 3 0 013 3v13H8a3 3 0 01-3-3V4zm0 13a3 3 0 013-3h9", target: "M12 3a9 9 0 100 18 9 9 0 000-18zm0 4a5 5 0 100 10 5 5 0 000-10zm0 4a1 1 0 100 2 1 1 0 000-2z", compass: "M12 3a9 9 0 100 18 9 9 0 000-18zm3.5 5.5l-2 5-5 2 2-5 5-2z", user: "M12 12a4 4 0 100-8 4 4 0 000 8zm-7 8a7 7 0 0114 0", chat: "M5 5h14v10H10l-4 4v-4H5z", check: "M5 12.5l4.5 4.5L19 7.5", lock: "M7 11V8a5 5 0 0110 0v3M6 11h12v9H6z", next: "M9 5l7 7-7 7", close: "M6 6l12 12M18 6L6 18", back: "M15 5l-7 7 7 7", info: "M12 8h.01M11 12h1v5h1M12 3a9 9 0 100 18 9 9 0 000-18z", flag: "M5 21V4m0 0h11l-2 4 2 4H5", globe: "M12 3a9 9 0 100 18 9 9 0 000-18zM3 12h18M12 3c2.5 2.5 3.5 5.5 3.5 9s-1 6.5-3.5 9c-2.5-2.5-3.5-5.5-3.5-9s1-6.5 3.5-9z", shield: "M12 3l7 3v6c0 4.5-3 7.5-7 9-4-1.5-7-4.5-7-9V6l7-3z", share: "M4 12v8a2 2 0 002 2h12a2 2 0 002-2v-8M16 6l-4-4-4 4M12 2v13", sun: "M12 7a5 5 0 100 10 5 5 0 000-10zM12 1v2M12 21v2M4.2 4.2l1.4 1.4M18.4 18.4l1.4 1.4M1 12h2M21 12h2M4.2 19.8l1.4-1.4M18.4 5.6l1.4-1.4", copy: "M20 9h-9a2 2 0 00-2 2v9a2 2 0 002 2h9a2 2 0 002-2v-9a2 2 0 00-2-2zM5 15H4a2 2 0 01-2-2V4a2 2 0 012-2h9a2 2 0 012 2v1" };
const STAR4 = "M12 2L14.7 9.3L22 12L14.7 14.7L12 22L9.3 14.7L2 12L9.3 9.3Z";
const mark = (size, fill = 1) => {
  const y = 74 - 42 * fill;
  const id = `m${Math.random().toString(36).slice(2, 8)}`;
  return `<svg width="${size}" height="${size}" viewBox="0 0 100 100"><defs><clipPath id="${id}"><rect x="0" y="${y}" width="100" height="100"/></clipPath></defs><path d="${MARK_PATHS[0]}" fill="var(--head)"/><path d="${MARK_PATHS[1]}${MARK_PATHS[2]}" fill="none" stroke="var(--head)" stroke-width="5" stroke-linejoin="round"/><path d="${MARK_PATHS[1]}${MARK_PATHS[2]}" fill="var(--head)" clip-path="url(#${id})"/><path d="${MARK_PATHS[3]}" fill="var(--head)"/></svg>`;
};
const top = (es) => `<div class="top">${mark(30, 0.5)}<span class="word">Northvale</span><span class="grow"></span><span class="chip"><svg width="18" height="18" viewBox="0 0 24 24"><path d="${STAR4}" fill="var(--head)"/></svg>6</span><span class="ask">${icon(P.chat, 17)}${es ? "Preguntar" : "Ask"}</span></div>`;
const TABS = [["book", "Learn"], ["target", "Goals"], ["compass", "Practice"], ["user", "Me"]];
const tabs = (on) => `<div class="tabs">${TABS.map(([i, l], k) => `<div class="tab ${k === on ? "on" : ""}"><span class="pill">${icon(P[i], 22)}</span><span>${l}</span></div>`).join("")}</div>`;
const phone = (cls, html, h = 844) => `<div class="phone ${cls}" style="height:${h}px">${html}</div>`;
const art = (id, w) => `<svg width="${w}" height="${Math.round(w * 0.75)}" viewBox="0 0 160 120" aria-hidden="true">${UNIT_ART[id]}</svg>`;

// The course: 17 units, Dani has finished 5 and is on lesson 2 of Scams and fraud.
const UNITS = [["budget", "Budgeting", 3], ["save", "Saving", 3], ["banking", "Banking for real", 4], ["paycheck", "Your first paycheck", 4], ["credit", "Debt & credit", 3], ["scams", "Scams and fraud", 4], ["compound", "Compound interest", 3], ["taxes", "Taxes made simple", 4], ["insurance", "Insurance basics", 4], ["psychology", "The psychology of money", 4], ["stocks", "Stocks", 3], ["etf", "ETFs & index funds", 3], ["risk", "Risk & diversification", 3], ["crypto", "Crypto and risky investments", 4], ["retire", "Retirement", 3], ["earning", "Earning more", 4], ["news", "Reading financial news", 3]];
const CUR = 5;
const LESSONS = [["Phishing", "done"], ["Fake investments", "now"], ["Pyramid schemes", "locked"], ["Protect your accounts", "locked"]];
const courseHead = `<div class="disp" style="font-size:30px;line-height:1.1">Your course</div><div class="meta" style="margin:4px 0 10px">18 of 59 lessons · 5 of 17 units</div><div class="bar"><i style="width:31%"></i></div>`;
const lessonList = () => LESSONS.map(([t, s], i) => `<div style="display:flex;align-items:center;gap:14px;min-height:${s === "now" ? 64 : 54}px;position:relative">
    ${i < LESSONS.length - 1 ? `<span style="position:absolute;left:15px;top:38px;bottom:-16px;border-left:3px dotted var(--artSea2)"></span>` : ""}
    ${s === "done" ? `<span style="width:32px;height:32px;border-radius:16px;background:var(--brand);color:var(--onBrand);display:flex;align-items:center;justify-content:center;position:relative">${icon(P.check, 17)}</span>`
      : s === "now" ? `<span style="width:44px;height:44px;border-radius:22px;margin:0 -6px;background:var(--artSky);box-shadow:0 0 0 3px var(--brand);display:flex;align-items:center;justify-content:center;position:relative"><svg class="bob" width="28" height="28" viewBox="0 0 100 100"><path d="${MARK_PATHS.join("")}" fill="var(--artInk)"/></svg></span>`
      : `<span style="width:32px;height:32px;border-radius:16px;border:2px solid var(--line);background:var(--surface);color:var(--low);display:flex;align-items:center;justify-content:center;position:relative">${icon(P.lock, 14)}</span>`}
    <div style="flex:1;${s === "locked" ? "color:var(--low)" : ""}"><div style="font-weight:${s === "now" ? 750 : 600};${s === "now" ? "color:var(--head);font-size:17px" : ""}">${t}</div><div class="meta">${s === "done" ? "Completed · review" : "4 min"}</div></div>
    ${s === "now" ? `<span class="btn small">Start</span>` : ""}</div>`).join("");

// Calm: unit cards on a dotted route, each with its landmark and its progress.
function calm(cls) {
  const card = (u, i) => {
    const [id, title, n] = u;
    const state = i < CUR ? "done" : i === CUR ? "now" : "next";
    if (state === "now")
      return `<div class="card" style="padding:0;overflow:hidden;box-shadow:0 0 0 2px var(--head),var(--lift)">
        <div style="position:relative;height:132px;background:var(--artSky)"><div class="drift" style="position:absolute;left:0;right:-30px;bottom:0"><svg width="420" height="34" viewBox="0 0 420 34" preserveAspectRatio="none"><path d="${wave(420, 34, 3, 7, 12)}" fill="var(--artSea)"/></svg></div>
          <div style="position:absolute;right:6px;bottom:6px">${art("scams", 150)}</div>
          <div style="position:absolute;left:18px;top:16px;max-width:52%"><span class="tag now">Now · Unit 6</span><div class="disp" style="font-size:25px;line-height:1.12;margin-top:8px">Scams and fraud</div><div class="meta" style="margin-top:4px">1 of 4 lessons</div><div class="bar" style="margin-top:6px;width:120px"><i style="width:25%"></i></div></div></div>
        <div style="padding:12px 16px 14px">${lessonList()}</div></div>`;
    return `<div class="card" style="display:flex;align-items:center;gap:12px;padding:10px 14px 10px 10px;${state === "next" ? "opacity:.62" : ""}">
      <span style="width:76px;height:60px;border-radius:16px;background:var(--artSky);display:flex;align-items:flex-end;justify-content:center;overflow:hidden;flex-shrink:0">${landmark(id, 76)}</span>
      <div style="flex:1;min-width:0"><div class="eyebrow">Unit ${i + 1}</div><div style="font-weight:700;font-size:16px;color:var(--head)">${title}</div>
        <div style="display:flex;align-items:center;gap:8px;margin-top:4px">${state === "done" ? `<span class="tag">${icon(P.check, 13)}${n} of ${n}</span>` : `<span class="tag mist">After Unit ${i}</span><span class="meta" style="font-size:13px">${n} lessons</span>`}</div></div>
      ${icon(state === "next" ? P.lock : P.next, 18, 'style="color:var(--low)"')}</div>`;
  };
  const shown = UNITS.slice(0, CUR + 4);
  const list = shown.map((u, i) => `${i ? `<div style="height:18px;margin-left:47px;border-left:3px dotted var(--artSea2)"></div>` : ""}${card(u, i)}`).join("");
  return phone(cls + " anim", `${top()}<div class="body"><div style="margin-top:6px">${courseHead}</div><div style="margin-top:16px">${list}</div>
    <div class="meta" style="text-align:center;font-weight:650;margin-top:16px;color:var(--head)">8 more units</div></div>${tabs(0)}`, 1700);
}

// Detailed: a sea chart. Islands zigzag down the page along a dotted route;
// birds, buoys and soft waves; the boat at the current island; the next
// ones in the mist; open water at the bottom.
function detailed(cls) {
  const W = 358, ROW = 132, TOP = 26;
  const shown = UNITS.slice(0, CUR + 4);
  // The current unit's row is taller: its card has a button.
  const Y = [];
  let acc = TOP;
  for (let i = 0; i < shown.length; i++) (Y.push(acc), (acc += i === CUR ? ROW + 56 : ROW));
  const H = acc + 170;
  const pos = (i) => (i % 2 ? [W - 136, Y[i]] : [16, Y[i]]);
  const ctr = (i) => [pos(i)[0] + 60, pos(i)[1] + 62];
  // Seeded scatter for the water's texture.
  let seed = 7;
  const rnd = () => ((seed = (seed * 9301 + 49297) % 233280) / 233280);
  const waves = Array.from({ length: 46 }, () => [rnd() * (W - 30) + 8, rnd() * (H - 40) + 20]).filter(([x, y]) => !shown.some((_, i) => Math.abs(x - ctr(i)[0]) < 64 && Math.abs(y - ctr(i)[1] + 8) < 46)).map(([x, y]) => `<path d="M${x.toFixed(0)} ${y.toFixed(0)}q5-3 10 0t10 0" stroke="var(--artSea2)" stroke-width="1.6" fill="none" stroke-linecap="round" opacity=".55"/>`).join("");
  const pts = shown.map((_, i) => ctr(i));
  const curve = (p) => p.slice(0, -1).map((a, i) => { const p0 = p[i - 1] || a, p2 = p[i + 1], p3 = p[i + 2] || p2; return `${i ? "" : `M${a}`}C${a[0] + (p2[0] - p0[0]) / 6},${a[1] + (p2[1] - p0[1]) / 6} ${p2[0] - (p3[0] - a[0]) / 6},${p2[1] - (p3[1] - a[1]) / 6} ${p2}`; }).join("");
  const buoys = pts.slice(0, -1).map((a, i) => { const b = pts[i + 1]; const x = (a[0] + b[0]) / 2 + (i % 2 ? -18 : 18), y = (a[1] + b[1]) / 2; return `<g transform="translate(${x} ${y})"><path d="M-5 6h10l-2-11h-6Z" fill="${i < CUR ? "var(--artSun)" : "var(--artSea2)"}"/><path d="M0 -5v-5" stroke="var(--artInk)" stroke-width="1.4"/><ellipse cx="0" cy="7" rx="8" ry="2" fill="var(--artSea2)" opacity=".5"/></g>`; }).join("");
  const birds = [[W - 70, 40], [W - 52, 52], [90, ctr(CUR)[1] - 70], [108, ctr(CUR)[1] - 80]].map(([x, y]) => `<path d="M${x} ${y}q5-5 10 0q5-5 10 0" stroke="var(--artInk)" stroke-width="1.6" fill="none" stroke-linecap="round" opacity=".7"/>`).join("");
  const isles = shown.map((u, i) => {
    const [x, y] = pos(i);
    const st = i < CUR ? "done" : i === CUR ? "now" : "next";
    const s = st === "now" ? 1.18 : 1;
    const flag = st === "done" ? `<path d="M${x + 96} ${y + 60}V${y + 34}" stroke="var(--artInk)" stroke-width="2.2" stroke-linecap="round"/><path d="M${x + 97} ${y + 34}L${x + 110} ${y + 38.5}L${x + 97} ${y + 43}Z" fill="var(--artSun)"/>` : "";
    const halo = st === "now" ? `<ellipse cx="${x + 60}" cy="${y + 58}" rx="78" ry="54" fill="var(--artPaper)" opacity=".55"/>` : "";
    return `${halo}<g transform="translate(${x + 60 - 60 * s} ${y + 4 - 12 * (s - 1)}) scale(${s})" opacity="${st === "next" ? 0.42 : 1}">${LANDMARK[u[0]]}</g>${flag}`;
  }).join("");
  const mist = `<defs><linearGradient id="mist" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="var(--artPaper)" stop-opacity="0"/><stop offset="1" stop-color="var(--artPaper)" stop-opacity=".7"/></linearGradient></defs><rect x="0" y="${pos(CUR + 1)[1] - 10}" width="${W}" height="${3 * ROW + 40}" fill="url(#mist)"/>`;
  const horizon = `<rect x="0" y="${H - 120}" width="${W}" height="120" fill="var(--artSea)" opacity=".6"/><circle cx="${W / 2}" cy="${H - 120}" r="40" fill="var(--artSun2)"/><rect x="0" y="${H - 120}" width="${W}" height="120" fill="var(--artSea)"/><path d="M0 ${H - 120}H${W}" stroke="var(--artSea2)" stroke-width="2"/>${star(W / 2, H - 186, 10, "var(--artSun)")}<path d="M${W / 2 - 30} ${H - 104}h60M${W / 2 - 16} ${H - 94}h32" stroke="var(--artSun2)" stroke-width="4" stroke-linecap="round"/>`;
  const svg = `<svg width="${W}" height="${H}" viewBox="0 0 ${W} ${H}" style="position:absolute;inset:0">${waves}${horizon}<path d="${curve(pts.slice(CUR))}" fill="none" stroke="var(--artSea2)" stroke-width="3" stroke-linecap="round" stroke-dasharray="0.1 9"/><path d="${curve(pts.slice(0, CUR + 1))}" fill="none" stroke="var(--artInk)" stroke-width="3" stroke-linecap="round" stroke-dasharray="0.1 9"/>${buoys}${birds}${isles}${mist}
    <g class="bob">${boat(ctr(CUR)[0] + (CUR % 2 ? -98 : 58), ctr(CUR)[1] - 6, 0.4)}</g></svg>`;
  const labels = shown.map((u, i) => {
    const [x, y] = pos(i);
    const st = i < CUR ? "done" : i === CUR ? "now" : "next";
    const left = i % 2 ? 14 : 150;
    if (st === "now") return `<div style="position:absolute;left:${i % 2 ? 10 : 168}px;top:${y + 2}px;width:180px;background:var(--surface);border-radius:18px;padding:12px 12px 12px;box-shadow:0 0 0 2px var(--head),var(--lift)"><span class="tag now">Now · Unit ${i + 1}</span><div class="disp" style="font-size:19px;line-height:1.15;margin:6px 0 2px">${u[1]}</div><div class="meta" style="font-size:13px">1 of ${u[2]} lessons</div><div class="bar" style="margin:6px 0 10px"><i style="width:25%"></i></div><span class="btn small" style="width:100%">Continue</span></div>`;
    return `<div style="position:absolute;left:${left}px;top:${y + 24}px;width:176px;${st === "next" ? "opacity:.55" : ""}"><div class="eyebrow">Unit ${i + 1}</div><div style="font-weight:700;color:var(--head);font-size:15px;line-height:1.25">${u[1]}</div><div style="margin-top:4px">${st === "done" ? `<span class="tag">${icon(P.check, 12)}${u[2]} of ${u[2]}</span>` : `<span class="tag mist">In the mist · after Unit ${i}</span>`}</div></div>`;
  }).join("");
  const end = `<div style="position:absolute;left:0;right:0;top:${H - 168}px;text-align:center"><span style="display:inline-block;background:var(--surface);border-radius:999px;padding:7px 14px;font-weight:650;font-size:14px;color:var(--head);box-shadow:var(--lift)">8 more islands in the mist</span></div><div style="position:absolute;left:0;right:0;bottom:62px;text-align:center;font-weight:650;font-size:13px;color:var(--mid)">Open water</div>`;
  return phone(cls + " anim", `${top()}<div class="body"><div style="margin-top:6px">${courseHead}</div>
    <div style="position:relative;margin-top:16px;height:${H}px;border-radius:28px;overflow:hidden;background:linear-gradient(180deg,var(--artSky),color-mix(in srgb,var(--artSea) 55%,var(--artSky)));box-shadow:var(--lift)">${svg}${labels}${end}</div></div>${tabs(0)}`, H + 230);
}

// ---- 2 · the lighthouse ------------------------------------------------------------------------
const lighthouse = (deg, w = 220) => `<svg width="${w}" height="${Math.round(w * 0.75)}" viewBox="0 0 160 120"><g transform="rotate(${deg} 80 35)" opacity="${0.6 + 0.3 * Math.cos((deg * Math.PI) / 56)}"><path d="M80 35L4 16V54Z" fill="var(--artSun2)"/><path d="M80 35L156 16V54Z" fill="var(--artSun2)"/></g>${UNIT_ART.scams.replace(/<path d="M80 35L4 16V54Z"[^>]*\/><path d="M80 35L156 16V54Z"[^>]*\/>/, "")}</svg>`;
const lighthouseLive = `<div class="phone anim" style="width:440px;height:330px;background:var(--artSky);display:flex;align-items:center;justify-content:center" id="live"><svg width="420" height="315" viewBox="0 0 160 120"><g class="beam" style="transform-origin:80px 35px;transform-box:view-box"><path d="M80 35L4 16V54Z" fill="var(--artSun2)"/><path d="M80 35L156 16V54Z" fill="var(--artSun2)"/></g>${UNIT_ART.scams.replace(/<path d="M80 35L4 16V54Z"[^>]*\/><path d="M80 35L156 16V54Z"[^>]*\/>/, "")}</svg></div>`;

// ---- 3 · Cream, Navy, Match my device -------------------------------------------------------
function looksPicker(cls) {
  const tile = (name, sub, on, look) => `<div style="flex:1;border-radius:20px;padding:10px;background:var(--surface);box-shadow:${on ? "0 0 0 2.5px var(--brand)" : "0 0 0 1.5px var(--line)"}">
    <div style="height:92px;border-radius:14px;overflow:hidden;display:flex">${look === "auto" ? `<div style="flex:1;background:${CREAM.bg};padding:8px"><div style="height:6px;width:60%;border-radius:3px;background:${CREAM.head}"></div><div style="height:22px;margin-top:8px;border-radius:7px;background:${CREAM.surface}"></div><div style="height:10px;margin-top:6px;border-radius:5px;background:${CREAM.brand}"></div></div><div style="flex:1;background:${NAVY.bg};padding:8px"><div style="height:6px;width:60%;border-radius:3px;background:${NAVY.head}"></div><div style="height:22px;margin-top:8px;border-radius:7px;background:${NAVY.surface}"></div><div style="height:10px;margin-top:6px;border-radius:5px;background:${NAVY.brand}"></div></div>`
      : `<div style="flex:1;background:${look.bg};padding:8px"><div style="height:6px;width:50%;border-radius:3px;background:${look.head}"></div><div style="height:30px;margin-top:8px;border-radius:8px;background:${look.surface};position:relative;overflow:hidden"><div style="position:absolute;right:4px;bottom:2px;width:22px;height:16px;background:${look.artSky};border-radius:4px"></div></div><div style="height:12px;margin-top:6px;border-radius:6px;background:${look.brand}"></div></div>`}</div>
    <div style="display:flex;align-items:center;gap:6px;margin-top:8px;font-weight:700;color:var(--head)"><span style="width:18px;height:18px;border-radius:9px;border:2px solid var(--brand);display:flex;align-items:center;justify-content:center">${on ? `<span style="width:9px;height:9px;border-radius:5px;background:var(--brand)"></span>` : ""}</span>${name}</div><div class="fine" style="margin-top:2px">${sub}</div></div>`;
  return phone(cls, `<div class="top" style="gap:4px">${icon(P.back, 22)}<span style="font-weight:650">Me</span></div><div class="body"><div class="disp" style="font-size:32px">Settings</div>
    <div class="eyebrow" style="margin:18px 0 8px;font-size:14px">Look</div>
    <div style="display:flex;gap:10px">${tile("Cream", "Warm and light", cls === "", CREAM)}${tile("Navy", "Deep and calm", cls === "navy", NAVY)}</div>
    <div style="margin-top:10px">${tile("Match my device", "Cream by day, Navy when your phone is dark", false, "auto")}</div>
    <div class="card" style="margin-top:18px;padding:6px 16px">${["Language · English", "Country · United States", "Text size · Default", "Reduce motion · Off"].map((r, i) => `<div style="display:flex;justify-content:space-between;align-items:center;min-height:52px;${i ? "border-top:1px solid var(--line)" : ""}"><span style="font-weight:600">${r.split(" · ")[0]}</span><span class="meta">${r.split(" · ")[1]}</span></div>`).join("")}</div></div>${tabs(3)}`);
}

// ---- 4 · Milestone 5 --------------------------------------------------------------------------
const BORDER_ART = `<rect width="160" height="120" fill="var(--artSky)"/><circle cx="80" cy="40" r="14" fill="var(--artSun2)"/><path d="${wave(160, 120, 3, 4, 76)}" fill="var(--artSea)"/><path d="M0 70c10-12 34-14 46 0V120H0Z" fill="var(--artSand)"/><path d="M114 70c12-14 36-12 46 0V120H114Z" fill="var(--artSand)"/><rect x="14" y="52" width="20" height="18" fill="var(--artPaper)" stroke="var(--artInk)" stroke-width="2"/><path d="M11 53L24 42L37 53Z" fill="var(--artInk)"/><rect x="126" y="52" width="20" height="18" fill="var(--artPaper)" stroke="var(--artInk)" stroke-width="2"/><path d="M123 53L136 42L149 53Z" fill="var(--artInk)"/><path d="M40 84C60 72 100 72 120 84" stroke="var(--artInk)" stroke-width="2.6" stroke-dasharray="0.1 7" stroke-linecap="round" fill="none"/>${boat(66, 54, 0.28)}<text x="24" y="36" text-anchor="middle" font-family="Inter" font-weight="800" font-size="12" fill="var(--artInk)">US$</text><text x="136" y="36" text-anchor="middle" font-family="Inter" font-weight="800" font-size="12" fill="var(--artInk)">MX$</text>`;
function m5Two() {
  return phone("", `<div class="top">${icon(P.back, 22)}<span class="grow"></span><span class="meta">2 of 3</span></div><div class="body"><div class="disp" style="font-size:30px;line-height:1.12">Where does your money life happen?</div><div class="meta" style="margin:8px 0 18px">It picks your currency, examples and laws. You can change it any time.</div>
    ${[["🇺🇸", "United States", "Dollars, credit scores, 401(k)s"], ["🇲🇽", "Mexico", "Pesos, Buró de Crédito, AFORE"], ["🇺🇸🇲🇽", "Both", "Family, school or work in both countries"]].map(([f, t, s], i) => `<div class="card" style="display:flex;gap:12px;align-items:center;margin-bottom:10px;${i === 2 ? "box-shadow:0 0 0 2.5px var(--brand),var(--lift)" : ""}"><span style="font-size:26px">${f}</span><div style="flex:1"><div style="font-weight:700;color:var(--head)">${t}</div><div class="meta">${s}</div></div>${i === 2 ? `<span class="tag">Picked</span>` : ""}</div>`).join("")}
    <div class="card" style="margin-top:14px;padding:0;overflow:hidden"><svg width="358" height="150" viewBox="0 10 160 100" preserveAspectRatio="xMidYMid slice">${BORDER_ART}</svg><div style="padding:12px 16px 16px"><span class="tag now">New unit for you</span><div class="disp" style="font-size:22px;margin-top:6px">Money across borders</div><div class="meta">Exchange rates, sending money home, credit in two countries · 5 lessons</div></div></div>
    <div style="position:absolute;left:16px;right:16px;bottom:30px"><div class="btn">Continue</div></div></div>`);
}
function m5Remit() {
  const sent = 300, fee = 8, mkt = 18.5, offered = 18.1;
  const arrives = (sent - fee) * offered, ideal = sent * mkt, lost = ideal - arrives;
  const f = (n, d = 0) => n.toLocaleString("en-US", { minimumFractionDigits: d, maximumFractionDigits: d });
  const feeMx = fee * mkt, markMx = lost - feeMx;
  const seg = (v, c) => `<i style="width:${((v / ideal) * 100).toFixed(1)}%;background:${c};display:block;height:100%"></i>`;
  return phone("", `${top()}<div class="body"><div class="eyebrow">Practice · Tools</div><div class="disp" style="font-size:28px;line-height:1.12;margin:2px 0 12px">What actually arrives</div>
    <div class="card"><div class="meta">You send</div><div class="disp" style="font-size:40px">$${sent} <span class="meta" style="font-size:16px;font-family:Inter">USD</span></div>
      <div style="display:grid;grid-template-columns:1fr 1fr;gap:10px;margin-top:12px"><div style="background:var(--bg);border-radius:14px;padding:10px"><div class="fine">Fee</div><div style="font-weight:750;font-size:18px">$${fee}</div></div><div style="background:var(--bg);border-radius:14px;padding:10px"><div class="fine">Their rate (market ${mkt})</div><div style="font-weight:750;font-size:18px">${offered} per $1</div></div></div></div>
    <div class="card" style="margin-top:12px"><div class="meta">Arrives in Mexico</div><div class="disp" style="font-size:36px">MX$${f(arrives)}</div>
      <div style="display:flex;height:16px;border-radius:8px;overflow:hidden;margin:12px 0 8px">${seg(arrives, "var(--brand)")}${seg(feeMx, "var(--warm)")}${seg(markMx, "var(--artSea2)")}</div>
      <div class="fine" style="display:grid;gap:3px"><span>■ Arrives: MX$${f(arrives)}</span><span style="color:var(--warmInk)">■ The fee: about MX$${f(feeMx)}</span><span>■ The hidden cost in the rate: about MX$${f(markMx)}</span></div>
      <div style="margin-top:12px;font-weight:700;color:var(--head)">Total cost: about $${f(lost / mkt, 2)} (${f((lost / ideal) * 100, 1)}% of what you sent)</div></div>
    <div class="fine" style="margin-top:12px">Example numbers, for learning. To compare real companies' fees and rates, see Profeco's “Quién es Quién en el Envío de Dinero” →</div></div>${tabs(2)}`);
}
function m5SimStart() {
  return phone("", `${top()}<div class="body"><div class="eyebrow">Practice</div><div class="disp" style="font-size:30px;line-height:1.1;margin:2px 0 6px">Your money year</div><div class="meta" style="margin-bottom:14px">Live one year, a month at a time. Your choices carry forward. About 8 minutes · example numbers</div>
    <div style="border-radius:24px;overflow:hidden;margin-bottom:14px"><svg width="358" height="140" viewBox="0 0 358 140" preserveAspectRatio="none"><rect width="358" height="140" fill="var(--artSky)"/>${[...Array(12)].map((_, i) => `<circle cx="${30 + i * 27}" cy="${96 - Math.sin(i / 2) * 10 - i * 3}" r="${i === 0 ? 7 : 4}" fill="${i === 0 ? "var(--artSun)" : "var(--artSea2)"}"/>`).join("")}<path d="${wave(358, 140, 4, 6, 112)}" fill="var(--artSea)"/>${boat(14, 58, 0.34)}</svg></div>
    <div class="eyebrow" style="margin-bottom:8px">Start as</div>${[["First job", "18, living with family, $1,600 a month"], ["Student", "18, part-time job, $700 a month"], ["On your own", "19, renting a room, $2,100 a month"]].map(([t, s], i) => `<div class="card" style="display:flex;gap:12px;align-items:center;margin-bottom:10px;padding:14px 16px;${i === 0 ? "box-shadow:0 0 0 2.5px var(--brand),var(--lift)" : ""}"><div style="flex:1"><div style="font-weight:700;color:var(--head)">${t}</div><div class="meta">${s}</div></div>${icon(P.next, 18, 'style="color:var(--low)"')}</div>`).join("")}
    <div style="margin-top:8px" class="btn">Start the year</div></div>${tabs(2)}`);
}
function m5SimMonth() {
  const stat = (t, v, c = "var(--head)") => `<div style="flex:1;background:var(--surface);border-radius:16px;padding:8px 10px;box-shadow:var(--lift)"><div class="fine">${t}</div><div style="font-weight:750;color:${c}">${v}</div></div>`;
  return phone("", `<div class="top">${icon(P.close, 22)}<div class="bar" style="flex:1;margin:0 10px"><i style="width:30%"></i></div><span class="meta">Apr</span></div><div class="body">
    <div style="display:flex;gap:8px">${stat("Savings", "$420")}${stat("Card debt", "$0")}${stat("Peace of mind", "Steady", "var(--right)")}</div>
    <div class="card" style="margin-top:14px;padding:0;overflow:hidden"><div style="height:110px;background:var(--artSky);position:relative"><svg width="358" height="110" viewBox="0 0 358 110"><path d="M150 18h58a8 8 0 018 8v66a8 8 0 01-8 8h-58a8 8 0 01-8-8V26a8 8 0 018-8z" fill="var(--artInk)"/><path d="M152 26h54v60h-54z" fill="var(--artSea2)"/><path d="M164 34l18 20-10 6 22 22" stroke="var(--artPaper)" stroke-width="2.4" fill="none" stroke-linecap="round"/></svg></div>
      <div style="padding:14px 18px 18px"><div class="eyebrow">Month 4 · Something happens</div><div class="disp" style="font-size:24px;line-height:1.15;margin:4px 0 6px">Your phone screen cracks. A repair costs $180.</div><div class="meta">What do you do?</div></div></div>
    <div style="display:grid;gap:10px;margin-top:12px">${["Pay from savings", "Put it on a credit card", "Live with the crack for now"].map((t, i) => `<div class="card" style="padding:14px 16px;font-weight:650;${i === 0 ? "box-shadow:0 0 0 2.5px var(--brand),var(--lift);background:var(--brandSoft)" : ""}">${t}</div>`).join("")}</div>
    <div class="fine" style="margin-top:12px;display:flex;gap:6px;align-items:center">${icon(P.book, 15)} What's an emergency fund? · Lesson: Emergency fund</div>
    <div style="position:absolute;left:16px;right:16px;bottom:30px"><div class="btn">Choose</div></div></div>`);
}
function m5SimYear() {
  const pts = [420, 520, 610, 430, 540, 660, 760, 820, 940, 1050, 1150, 1240];
  const alt = [420, 520, 610, 610, 590, 640, 650, 690, 720, 800, 900, 1026];
  const line = (a, c, dash) => `<path d="${a.map((v, i) => `${i ? "L" : "M"}${10 + i * 30},${130 - v / 11}`).join("")}" fill="none" stroke="${c}" stroke-width="3" ${dash ? 'stroke-dasharray="5 5"' : ""} stroke-linecap="round" stroke-linejoin="round"/>`;
  return phone("", `<div class="top">${icon(P.close, 22)}</div><div class="body"><div class="eyebrow">Your money year · December</div><div class="disp" style="font-size:30px;line-height:1.1;margin:2px 0 12px">Your first year</div>
    <div class="card"><div class="meta">What you own minus what you owe</div><div class="disp" style="font-size:38px">$1,240</div>
      <svg width="326" height="140" viewBox="0 0 350 140" style="margin-top:6px">${line(alt, "var(--artSea2)", true)}${line(pts, "var(--brand)")}</svg>
      <div class="fine" style="display:flex;gap:14px"><span style="color:var(--head);font-weight:700">— Your choices</span><span>- - If you'd used the card in April</span></div></div>
    <div style="display:grid;grid-template-columns:1fr 1fr;gap:10px;margin-top:12px">${[["Savings", "$1,240"], ["Debt", "$0"], ["Credit", "Building"], ["Peace of mind", "Steady"]].map(([t, v]) => `<div class="card" style="padding:12px 14px"><div class="fine">${t}</div><div style="font-weight:750;font-size:18px;color:var(--head)">${v}</div></div>`).join("")}</div>
    <div class="card" style="margin-top:12px;padding:14px 16px;background:var(--warmSoft);box-shadow:none"><div style="font-weight:700;color:var(--head)">The card path ends $214 lower</div><div class="meta">Interest on $180 at 24% a year, plus a late fee in June. Lesson: Credit cards →</div></div>
    <div style="display:flex;gap:10px;margin-top:14px"><div class="btn sec">Play again</div><div class="btn">Done</div></div></div>`);
}
function m5Explain(result) {
  const paste = `Get $500 TODAY! No credit check. Just $75 every 2 weeks. Card on file: •••• •••• •••• 4821. Offer ends tonight!`;
  const sheet = result
    ? `<div class="eyebrow">Explain this · Simple</div><div class="disp" style="font-size:24px;line-height:1.15;margin:4px 0 10px">This is a payday loan offer</div>
      <p style="margin:0 0 12px">They lend $500 and charge $75 every two weeks. Over a year that's like paying <b>about 390%</b> interest. A credit card is usually 20–30%.</p>
      <div class="eyebrow" style="margin-bottom:6px">The numbers that matter</div><div style="display:flex;flex-wrap:wrap;gap:8px;margin-bottom:12px"><span class="pc">$75 fee every 2 weeks</span><span class="pc">≈ 390% a year</span></div>
      <div style="background:var(--warnSoft);border-radius:16px;padding:12px 14px"><div style="font-weight:750;color:var(--warn);margin-bottom:4px">Red flags</div><div style="font-size:15px;display:grid;gap:4px"><span>• “Offer ends tonight”: pressure to decide fast</span><span>• Fees every two weeks, with no total shown</span><span>• “No credit check” often means a very high price</span></div></div>
      <div class="meta" style="margin-top:12px;display:flex;gap:6px;align-items:center">${icon(P.book, 15)} Lesson: Borrowing costs money</div>
      <div class="fine" style="margin-top:10px">For learning, not advice. We hid a card number before sending, and nothing you pasted is saved.</div>`
    : `<div class="disp" style="font-size:24px;margin-bottom:6px">Explain this</div><div class="meta" style="margin-bottom:12px">Paste an offer, a receipt, a pay stub or a headline. You'll get it in plain words.</div>
      <div style="background:var(--surface);border:1.5px solid var(--brand);border-radius:16px;padding:12px;min-height:120px;font-size:15px">${paste.replace("•••• •••• •••• 4821", `<mark style="background:var(--warmSoft);color:var(--warmInk);border-radius:4px;padding:0 2px">•••• •••• •••• 4821</mark>`)}</div>
      <div style="display:flex;gap:8px;align-items:flex-start;margin-top:10px;background:var(--brandSoft);border-radius:14px;padding:10px 12px;font-size:14px">${icon(P.shield, 18)}<span>We hide long numbers, like card and account numbers, <b>before</b> anything is sent. Nothing you paste is saved.</span></div>
      <div style="margin-top:14px" class="btn">Explain</div>`;
  return phone("", `${top()}<div style="position:absolute;inset:0;background:rgba(5,12,25,.42)"></div><div style="position:absolute;left:0;right:0;bottom:0;top:${result ? 70 : 150}px;background:var(--bg);border-radius:24px 24px 0 0;padding:10px 18px 30px"><div style="width:40px;height:5px;border-radius:3px;background:var(--line);margin:0 auto 10px"></div>
    <div style="display:flex;gap:8px;margin-bottom:14px"><span class="pc">Ask</span><span class="pc on">Explain this</span></div>${sheet}</div>`);
}
function m5Cert() {
  return phone("", `<div class="top">${icon(P.back, 22)}<span style="font-weight:650">Me</span></div><div class="body"><div class="disp" style="font-size:30px;margin-bottom:12px">Certificates</div>
    <div style="background:var(--surface);border-radius:20px;padding:22px 20px;box-shadow:0 0 0 6px var(--surface),0 0 0 7.5px var(--head),var(--lift);text-align:center;margin:8px 4px">
      <div style="display:flex;justify-content:center">${mark(44)}</div><div style="font-family:Garamond,Georgia,serif;font-weight:650;font-size:20px;color:var(--head);margin-top:4px">Northvale Learn</div>
      <div class="eyebrow" style="letter-spacing:2px;margin-top:14px">CERTIFICATE OF COMPLETION</div><div class="disp" style="font-size:30px;margin:6px 0 2px">Dani</div><div class="meta">finished the track</div><div class="disp" style="font-size:24px;margin:4px 0 12px">Money Foundations</div>
      <div class="fine">Budgeting · Saving · Banking · Your first paycheck · Debt & credit<br>15 lessons · November 12, 2026</div>
      <svg width="64" height="64" viewBox="0 0 24 24" style="margin:12px auto 6px"><circle cx="12" cy="12" r="11" fill="var(--warmSoft)"/><path d="${STAR4}" fill="var(--warm)"/></svg>
      <div class="fine">Check it: northvalelearn.com/verify · NVL-7K3Q-82</div></div>
    <div style="display:flex;gap:10px;margin-top:16px"><div class="btn sec">${icon(P.copy, 17)}Copy link</div><div class="btn">${icon(P.share, 17)}Share</div></div>
    <div class="fine" style="margin-top:12px">Shows your nickname. Under 18, it's always your nickname.</div></div>${tabs(3)}`);
}

// ---- the sheets ---------------------------------------------------------------------------------
const shot = (f) => (existsSync(join(HERE, "../playful/after", f)) ? `<img src="data:image/png;base64,${readFileSync(join(HERE, "../playful/after", f)).toString("base64")}" style="width:390px;display:block;border-radius:6px">` : `<div class="phone" style="display:flex;align-items:center;justify-content:center">${f}</div>`);
const SECTIONS = [
  { id: "course", file: "1-your-course", title: "1 · “Your course”: calm and detailed, in Cream and Navy", note: "Every unit is its own landmark: a chart house for Budgeting, a harbor for Saving, a market for Banking, cargo for Your first paycheck, a bridge for Debt & credit, the lighthouse for Scams… The current unit is bigger and highlighted, with the boat. Finished units have a flag and a check; the next ones sit in the mist. Calm: cards on a dotted route. Detailed: a sea chart with soft waves, buoys, birds and open water at the end. The full screens scroll; these are photographed whole.",
    items: [["Calm · Cream", "Cards with each unit's landmark and progress", calm("")], ["Calm · Navy", "", calm("navy")], ["Detailed · Cream", "A sea chart; the boat bobs, the water moves", detailed("")], ["Detailed · Navy", "", detailed("navy")]] },
  { id: "light", file: "2-lighthouse", title: "2 · The lighthouse's beam sweeps, slowly", note: "A soft cone of light sweeps across and back about every 6 seconds, brightening as it passes the middle. Used in the Scams picture, its island on the map, and the “Practice opens soon” empty screen. With Reduce motion it stays still, at the middle. Frames below; lighthouse.webm shows it moving.",
    items: [...[-28, -16, -5, 5, 16, 28].map((d, i) => [`${(i * 0.6).toFixed(1)} s`, "", `<div class="phone frame">${lighthouse(d)}</div>`]), ["Cream", "", `<div class="phone frame" style="width:240px;padding:8px">${landmark("scams", 220)}</div>`], ["Navy", "", `<div class="phone navy frame" style="width:240px;padding:8px">${landmark("scams", 220)}</div>`]] },
  { id: "looks", file: "3-cream-vs-navy", title: "3 · Cream and Navy (and Match my device)", note: "Settings → Look: Cream, Navy, or Match my device. Navy is designed, not inverted: deep navy pages, cream type, cream sails and islands, a warmer coral that still glows, the sea map's mist lightened for dark water. The real app's screens below (built on the branch), side by side.",
    items: [["Settings · Cream", "", looksPicker("")], ["Settings · Navy", "", looksPicker("navy")], ["Today · Cream", "", shot("02-today.png")], ["Today · Navy", "", shot("dark-02-today.png")], ["Lesson complete · Cream", "", shot("06-lesson-complete.png")], ["Lesson complete · Navy", "", shot("dark-06-lesson-complete.png")], ["Achievements · Cream", "", shot("11-achievements.png")], ["Achievements · Navy", "", shot("dark-11-achievements.png")]] },
  { id: "m5", file: "4-milestone-5", title: "4 · Milestone 5: the signature features", note: "Where each one lives: two countries in onboarding and Settings (and a new unit), the remittance tool in Practice → Tools, Your money year in Practice, Explain this in the Ask button, certificates in Me. No new tabs or menus.",
    items: [["Two countries: onboarding", "And the new unit, Money across borders", m5Two()], ["What actually arrives", "The remittance tool (example numbers; Profeco for real prices)", m5Remit()], ["Your money year: start", "In Practice", m5SimStart()], ["Your money year: a month", "One decision; it carries forward", m5SimMonth()], ["Your money year: the year", "Compared with the path you didn't take", m5SimYear()], ["Explain this: paste", "In Ask; numbers hidden before sending", m5Explain(false)], ["Explain this: the answer", "Plain words, the key numbers, red flags, a lesson", m5Explain(true)], ["A certificate", "Nickname only under 18; a code to check it", m5Cert()]] },
];

const html = `<!doctype html><meta charset="utf-8"><title>Northvale: next mockups</title><style>${FONTS}${CSS}</style>${SECTIONS.map((s) => `<section id="${s.id}"><h2>${s.title}</h2><p>${s.note}</p><div class="grid">${s.items.map(([c, sub, h]) => `<div>${h}<div class="cap">${c}${sub ? `<small>${sub}</small>` : ""}</div></div>`).join("")}</div></section>`).join("")}<div id="live-wrap" style="position:absolute;left:-2000px;top:0">${lighthouseLive}</div>`;
writeFileSync(join(HERE, "mockups.html"), html);
const browser = await chromium.launch({ channel: "chrome", headless: true });
const page = await browser.newPage({ viewport: { width: 1816, height: 1200 }, deviceScaleFactor: 2 });
await page.setContent(html);
await page.evaluate(() => document.fonts.ready);
// Stills: animations paused at their middle frame.
await page.addStyleTag({ content: ".bob,.anim .beam,.anim .drift{animation-play-state:paused!important;animation-delay:-1.2s!important}" });
for (const s of SECTIONS) await page.locator(`#${s.id}`).screenshot({ path: join(HERE, `${s.file}.png`) });
// The lighthouse moving: screenshots for 6 seconds, made into a WebM in the browser.
const live = await browser.newPage({ viewport: { width: 440, height: 330 }, deviceScaleFactor: 2 });
await live.setContent(`<style>${CSS}body{padding:0;width:auto;background:#d9dde3}</style>${lighthouseLive}`);
const frames = [];
const t0 = Date.now();
while (Date.now() - t0 < 6000) frames.push(await live.locator("#live").screenshot());
const b64 = await live.evaluate(async (urls) => {
  const imgs = await Promise.all(urls.map((u) => new Promise((ok) => Object.assign(new Image(), { onload() { ok(this); }, src: u }))));
  const c = Object.assign(document.createElement("canvas"), { width: 880, height: 660 });
  const x = c.getContext("2d");
  const rec = new MediaRecorder(c.captureStream(30), { mimeType: "video/webm" });
  const chunks = [];
  rec.ondataavailable = (e) => chunks.push(e.data);
  rec.start();
  const per = 6000 / imgs.length;
  for (const img of imgs) (x.drawImage(img, 0, 0, 880, 660), await new Promise((r) => setTimeout(r, per)));
  rec.stop();
  await new Promise((r) => (rec.onstop = r));
  const bytes = new Uint8Array(await new Blob(chunks, { type: "video/webm" }).arrayBuffer());
  let s = "";
  for (let i = 0; i < bytes.length; i += 8192) s += String.fromCharCode(...bytes.subarray(i, i + 8192));
  return btoa(s);
}, frames.map((f) => `data:image/png;base64,${f.toString("base64")}`));
writeFileSync(join(HERE, "lighthouse.webm"), Buffer.from(b64, "base64"));
await browser.close();
console.log(`Mockups written to docs/design/next (${frames.length} lighthouse frames)`);
