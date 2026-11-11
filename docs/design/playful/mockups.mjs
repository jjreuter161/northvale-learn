// "Playful navy and cream", Step 1: mockups only. Nothing in the app changes.
// Where the right amount of play isn't obvious, a screen comes in two
// strengths, "calm" and "playful", side by side.
//   node docs/design/playful/mockups.mjs   → mockups.html and 5 sheets (PNG)
import { readFileSync, writeFileSync } from "node:fs";
import { join } from "node:path";
import { chromium } from "playwright-core";
import { ic } from "../kit.mjs";

const HERE = import.meta.dirname;
const ROOT = join(HERE, "../../..");
const font = (family, file, weight) => `@font-face{font-family:${family};font-weight:${weight};src:url(data:font/woff2;base64,${readFileSync(file).toString("base64")})}`;
const FONTS = [
  font("Inter", join(ROOT, "web/fonts/inter-latin-wght-normal.woff2"), "100 900"),
  font("Garamond", join(ROOT, "web/fonts/eb-garamond-latin-600-normal.woff2"), "600 700"),
  font("Fraunces", join(HERE, "fonts/fraunces-soft.woff2"), "100 900"),
  font("Bricolage", join(HERE, "fonts/bricolage-opsz.woff2"), "200 800"),
  font("Nunito", join(HERE, "fonts/nunito.woff2"), "200 1000"),
].join("");

// ---- colors: today's navy and cream, plus one warm accent ---------------------------------
const LIGHT = { bg: "#F7F2E8", surface: "#FFFDF8", navy: "#13315C", ink: "#22303F", coral: "#E9805F", coralInk: "#A8462A", sand: "#D9A441" };
const DARK = { bg: "#0D1A2D", surface: "#15253C", cream: "#F0E3C6", coral: "#F29B7D", sand: "#E3B45E" };
const lum = (hex) => {
  const c = [1, 3, 5].map((i) => parseInt(hex.slice(i, i + 2), 16) / 255).map((v) => (v <= 0.03928 ? v / 12.92 : ((v + 0.055) / 1.055) ** 2.4));
  return 0.2126 * c[0] + 0.7152 * c[1] + 0.0722 * c[2];
};
const ratio = (a, b) => {
  const [x, y] = [lum(a), lum(b)].sort((p, q) => q - p);
  return Math.round(((x + 0.05) / (y + 0.05)) * 10) / 10;
};
const CONTRAST = [
  ["Navy text on a coral fill", ratio(LIGHT.navy, LIGHT.coral), 4.5],
  ["Dark coral text (#A8462A) on cream", ratio(LIGHT.coralInk, LIGHT.bg), 4.5],
  ["Coral shape on cream (decoration only)", ratio(LIGHT.coral, LIGHT.bg), 3],
  ["Coral on dark navy", ratio(DARK.coral, DARK.bg), 3],
  ["Navy text on a sand fill", ratio(LIGHT.navy, LIGHT.sand), 4.5],
  ["Sand shape on cream (decoration only)", ratio(LIGHT.sand, LIGHT.bg), 3],
];

const CSS = `
*{box-sizing:border-box;margin:0;padding:0}
body{background:#d9dde3;font-family:Inter,system-ui,sans-serif;padding:28px;width:1760px}
section{margin-bottom:44px;padding:4px 0}
section>h2{font:750 24px Inter;color:#1f2328;margin:0 0 6px}
section>p{font:15px/1.5 Inter;color:#3d4550;max-width:1180px;margin-bottom:18px}
.grid{display:flex;flex-wrap:wrap;gap:26px 24px;align-items:flex-start}
.cap{width:390px;font:700 15px Inter;color:#1f2328;margin-top:9px}
.cap small{display:block;font-weight:500;color:#4b5563;font-size:13px;margin-top:2px;line-height:1.4}
.phone{--bg:#F7F2E8;--surface:#FFFDF8;--surface2:#EFE7D8;--ink:#22303F;--head:#13315C;--mid:#4C5866;--low:#5C6573;--line:#E6DCCB;
  --brand:#13315C;--onBrand:#FFFDF8;--brandSoft:#E3E7EE;--edge:#071833;--right:#1B6F54;--rightSoft:#E1EFE6;--warn:#8C520E;--warnSoft:#F7E9D2;
  --accent:#E9805F;--accentSoft:#FBE4D9;--accentInk:#A8462A;
  --i-ink:#13315C;--i-paper:#FFFDF8;--i-sky:#E8EDF4;--i-sea:#D3DDEA;--i-sea2:#A9BBD5;--i-sand:#EFE0C2;--i-sun:#E9805F;--i-sun2:#F5C2AC;
  --shadow:0 1px 0 rgba(19,49,92,.04),0 12px 26px -16px rgba(19,49,92,.30);
  --disp:Fraunces;--dispVar:"SOFT" 100,"WONK" 0;--dispW:620;--rc:22px;--rb:16px;
  width:390px;height:844px;background:var(--bg);color:var(--ink);position:relative;overflow:hidden;font:16px/1.45 Inter,sans-serif}
.phone.dark{--bg:#0D1A2D;--surface:#15253C;--surface2:#1F3150;--ink:#F2EBDC;--head:#F7F1E6;--mid:#CFC7B7;--low:#B3AC9E;--line:#2A3C58;
  --brand:#F0E3C6;--onBrand:#0D1A2D;--brandSoft:#26385A;--edge:#B3A07A;--right:#63C9A2;--rightSoft:#123A33;--warn:#EBB663;--warnSoft:#3A2E17;
  --accent:#F29B7D;--accentSoft:#3D2C30;--accentInk:#F6B39C;
  --i-ink:#F0E3C6;--i-paper:#15253C;--i-sky:#16294A;--i-sea:#22395B;--i-sea2:#3A5784;--i-sand:#2F4263;--i-sun:#F29B7D;--i-sun2:#A35F4C;
  --shadow:0 12px 26px -16px rgba(0,0,0,.7)}
.phone.sand,.panel.sand{--accent:#D9A441;--accentSoft:#F6EBCF;--i-sun:#D9A441;--i-sun2:#EED79F}
.phone.dark.sand,.panel.dark.sand{--accent:#E3B45E;--accentSoft:#3A3220;--i-sun:#E3B45E;--i-sun2:#8F7238}
.f-bricolage{--disp:Bricolage;--dispVar:normal;--dispW:700}
.f-nunito{--disp:Nunito;--dispVar:normal;--dispW:800}
.playful{--rc:28px;--rb:20px}
.disp,.phone h1,.h2,.qt,.num{font-family:var(--disp),Inter,sans-serif;font-variation-settings:var(--dispVar);font-weight:var(--dispW)}
.calm .h2,.calm .qt{font-family:Inter,sans-serif;font-variation-settings:normal;font-weight:750}
.top{height:58px;display:flex;align-items:center;gap:7px;padding:0 16px;position:relative;z-index:2}
.word{font-family:Garamond,Georgia,serif;font-weight:650;font-size:25px;letter-spacing:-.3px;color:var(--head)}
.grow{flex:1}
.chip{display:inline-flex;align-items:center;gap:6px;font-weight:700;font-size:15px;color:var(--mid);height:36px;padding:0 8px}
.ask{display:inline-flex;align-items:center;gap:6px;height:36px;padding:0 14px;border-radius:999px;background:var(--surface);font-weight:650;font-size:15px;color:var(--ink);box-shadow:var(--shadow)}
.body{padding:6px 16px 110px;position:relative}
.date{font-size:14px;color:var(--mid);font-weight:600}
.phone h1{font-size:36px;line-height:1.08;letter-spacing:-.5px;color:var(--head);margin:2px 0 16px}
.card{background:var(--surface);border-radius:var(--rc);padding:20px;box-shadow:var(--shadow);position:relative;overflow:hidden}
.card+.card,.rows+.card,.card+.rows{margin-top:14px}
.eyebrow{font-size:13px;color:var(--low);font-weight:650}
.h2{font-size:26px;line-height:1.15;color:var(--head);margin:3px 0 4px;letter-spacing:-.2px}
.calm .h2{font-size:24px;letter-spacing:-.4px}
.meta{font-size:14px;color:var(--mid)}
.p{font-size:16px;line-height:1.5;margin:10px 0 16px}
.btn{display:flex;align-items:center;justify-content:center;gap:8px;height:54px;border-radius:var(--rb);background:var(--brand);color:var(--onBrand);font-weight:700;font-size:17px;width:100%;
  box-shadow:0 1px 1px rgba(0,0,0,.08),0 10px 18px -10px rgba(19,49,92,.7)}
.dark .btn{box-shadow:0 10px 18px -10px rgba(0,0,0,.8)}
.playful .btn{box-shadow:0 3px 0 var(--edge)}
.btn.pressed{transform:translateY(3px);box-shadow:0 0 0 var(--edge)}
.calm .btn.pressed{box-shadow:0 1px 2px rgba(19,49,92,.4)}
.btn.sec{background:var(--surface);color:var(--ink);border:1.5px solid var(--line);box-shadow:none}
.playful .btn.sec{box-shadow:0 3px 0 var(--line)}
.btn.small{height:40px;width:auto;padding:0 18px;font-size:15px;display:inline-flex}
.btns{display:flex;flex-direction:column;gap:12px}
.rows{background:var(--surface);border-radius:var(--rc);box-shadow:var(--shadow);margin-top:14px}
.r{display:flex;align-items:center;gap:12px;padding:14px 16px;min-height:64px}
.r+.r{border-top:1px solid var(--line)}
.r .t{font-weight:650}
.r .s{font-size:14px;color:var(--mid)}
.r .x{flex:1;min-width:0}
.tile{width:42px;height:42px;border-radius:14px;background:var(--bg);display:flex;align-items:center;justify-content:center;color:var(--head);flex-shrink:0;overflow:hidden}
.dark .tile{background:var(--surface2)}
.tabs{position:absolute;z-index:5;left:0;right:0;bottom:0;height:88px;background:var(--bg);border-top:1px solid var(--line);display:flex;padding:8px 8px 26px}
.tab{flex:1;display:flex;flex-direction:column;align-items:center;gap:3px;font-size:12px;font-weight:650;color:var(--low)}
.tab .pill{width:60px;height:32px;border-radius:999px;display:flex;align-items:center;justify-content:center}
.tab.on{color:var(--head)}
.tab.on .pill{background:var(--brandSoft)}
.bar{height:8px;border-radius:999px;background:var(--surface2);overflow:hidden}
.bar>i{display:block;height:100%;background:var(--brand);border-radius:999px}
.opt{display:flex;align-items:center;gap:14px;background:var(--surface);border-radius:18px;padding:15px 16px;margin-bottom:12px;font-weight:600;border:2px solid var(--line);min-height:62px}
.playful .opt{border-radius:20px;box-shadow:0 3px 0 var(--line)}
.opt .k{width:32px;height:32px;border-radius:11px;display:flex;align-items:center;justify-content:center;font-size:14px;font-weight:750;background:var(--bg);color:var(--low);flex-shrink:0;border:1.5px solid var(--line)}
.opt.sel{border-color:var(--brand);background:var(--brandSoft)}
.opt.sel .k{background:var(--brand);color:var(--onBrand);border-color:var(--brand)}
.opt.right{border-color:var(--right);background:var(--rightSoft);box-shadow:0 3px 0 var(--right)}
.opt.right .k{background:var(--right);color:var(--surface);border-color:var(--right);box-shadow:0 0 0 7px color-mix(in srgb,var(--right) 22%,transparent),0 0 0 15px color-mix(in srgb,var(--right) 9%,transparent)}
.opt.dim{opacity:.5}
.qbar{display:flex;align-items:center;gap:12px;height:58px;padding:0 12px 0 10px}
.ask.line{background:var(--bg);border:1px solid var(--line);height:34px;padding:0 12px;font-size:14px;box-shadow:none}
.fb{position:absolute;left:0;right:0;bottom:0;padding:20px 16px 30px;background:var(--rightSoft);border-radius:var(--rc) var(--rc) 0 0}
.fb .h{display:flex;align-items:center;gap:8px;color:var(--right);font-size:21px;margin-bottom:6px}
.pc{display:inline-flex;align-items:center;gap:6px;border-radius:999px;padding:9px 15px;font-weight:650;font-size:15px;background:var(--surface2);color:var(--ink)}
.pc.on{background:var(--brand);color:var(--onBrand)}
.tag{display:inline-flex;align-items:center;gap:4px;border-radius:999px;padding:3px 10px;font-size:13px;font-weight:700;background:var(--rightSoft);color:var(--right)}
.lang{display:inline-flex;align-items:center;gap:5px;border-radius:999px;padding:8px 13px;font-size:14px;font-weight:650;color:var(--mid)}
.lang.on{background:var(--brandSoft);color:var(--head)}
.fine{font-size:13px;color:var(--low);line-height:1.45}
.center{text-align:center}
.num{color:var(--head);letter-spacing:-.5px}
svg{display:block}
.locked{filter:grayscale(1);opacity:.4}
.panel{--bg:#F7F2E8;--surface:#FFFDF8;--surface2:#EFE7D8;--ink:#22303F;--head:#13315C;--mid:#4C5866;--low:#5C6573;--line:#E6DCCB;--brand:#13315C;--onBrand:#FFFDF8;--brandSoft:#E3E7EE;--edge:#071833;
  --accent:#E9805F;--accentSoft:#FBE4D9;--i-ink:#13315C;--i-paper:#FFFDF8;--i-sky:#E8EDF4;--i-sea:#D3DDEA;--i-sea2:#A9BBD5;--i-sand:#EFE0C2;--i-sun:#E9805F;--i-sun2:#F5C2AC;
  background:var(--bg);color:var(--ink);border-radius:22px;padding:22px;font:15px/1.45 Inter}
.panel.dark{--bg:#0D1A2D;--surface:#15253C;--surface2:#1F3150;--ink:#F2EBDC;--head:#F7F1E6;--mid:#CFC7B7;--low:#B3AC9E;--line:#2A3C58;--brand:#F0E3C6;--onBrand:#0D1A2D;--brandSoft:#26385A;--edge:#B3A07A;
  --accent:#F29B7D;--accentSoft:#3D2C30;--i-ink:#F0E3C6;--i-paper:#15253C;--i-sky:#16294A;--i-sea:#22395B;--i-sea2:#3A5784;--i-sand:#2F4263;--i-sun:#F29B7D;--i-sun2:#A35F4C}
.panel h3{font:700 16px Inter;color:var(--head);margin-bottom:12px}
.items{display:flex;gap:18px;flex-wrap:wrap;align-items:flex-end}
.item{display:flex;flex-direction:column;align-items:center;gap:8px;font-size:13px;font-weight:600;color:var(--mid);text-align:center;max-width:148px}
.swatch{width:64px;height:64px;border-radius:18px}
`;

// ---- drawing helpers ------------------------------------------------------------------------
let uid = 0;
const MARK = ["M50 4L53 13L62 16L53 19L50 28L47 19L38 16L47 13Z", "M46 32V74H20Z", "M52 42V74H74Z", "M14 80H86L76 92H24Z"];
const star = (cx, cy, r, fill = "var(--i-ink)") => {
  const k = r * 0.27;
  return `<path d="M${cx} ${cy - r}L${cx + k} ${cy - k}L${cx + r} ${cy}L${cx + k} ${cy + k}L${cx} ${cy + r}L${cx - k} ${cy + k}L${cx - r} ${cy}L${cx - k} ${cy - k}Z" fill="${fill}"/>`;
};
const boat = (x, y, s, fill = "var(--i-ink)") => `<g transform="translate(${x} ${y}) scale(${s})"><path d="${MARK.join("")}" fill="${fill}"/></g>`;
// A row of soft waves from y0 down to h.
const wave = (w, h, amp, n, y0) => {
  const step = w / n;
  let d = `M0 ${y0}`;
  for (let i = 0; i < n; i++) d += `q${step / 4} ${-amp} ${step / 2} 0t${step / 2} 0`;
  return `${d}V${h}H0Z`;
};
// The logo; the sails fill from the bottom as the day's goal fills.
function mark(size, pct = 100) {
  const id = `m${++uid}`;
  const y = 74 - (42 * pct) / 100;
  return `<svg width="${size}" height="${size}" viewBox="0 0 100 100" aria-hidden="true"><defs><clipPath id="${id}"><rect x="0" y="${y}" width="100" height="100"/></clipPath></defs>
    <path d="${MARK[0]}" fill="${pct >= 100 ? "var(--i-sun)" : "var(--i-ink)"}"/><path d="${MARK[1]}${MARK[2]}" fill="none" stroke="var(--i-ink)" stroke-width="5" stroke-linejoin="round"/>
    <path d="${MARK[1]}${MARK[2]}" fill="var(--i-ink)" clip-path="url(#${id})"/><path d="${MARK[3]}" fill="var(--i-ink)"/></svg>`;
}
// The streak star: a soft glow from 7 days, brighter at 30, small rays at 100.
function streakStar(size, n) {
  const g = n >= 100 ? 3 : n >= 30 ? 2 : n >= 7 ? 1 : 0;
  const rays = g === 3 ? [45, 135, 225, 315].map((a) => `<path d="M12 12L${12 + 13 * Math.cos((a * Math.PI) / 180)} ${12 + 13 * Math.sin((a * Math.PI) / 180)}" stroke="var(--accent)" stroke-width="1.6" stroke-linecap="round"/>`).join("") : "";
  return `<svg width="${size}" height="${size}" viewBox="0 0 24 24" style="overflow:visible" aria-hidden="true">${g ? `<circle cx="12" cy="12" r="${6.5 + g * 2.8}" fill="var(--accent)" opacity="${0.24 + g * 0.12}"/>` : ""}${rays}${star(12, 12, 10, "var(--head)")}</svg>`;
}

// ---- illustrations: one small scene per unit (5 of 17 shown) -------------------------------
const ART = {
  budget: `<rect x="22" y="16" width="116" height="90" rx="12" fill="var(--i-sand)"/><path d="M61 16v90M100 16v90" stroke="var(--i-paper)" stroke-width="2.5"/>
    <ellipse cx="48" cy="40" rx="13" ry="7" fill="var(--i-sea2)"/><ellipse cx="96" cy="90" rx="10" ry="5" fill="var(--i-sea2)"/>
    <path d="M38 92C52 86 50 70 66 66S98 58 104 46 114 34 116 32" fill="none" stroke="var(--i-ink)" stroke-width="3.4" stroke-linecap="round" stroke-dasharray="0.1 7.5"/>
    <circle cx="38" cy="92" r="5" fill="var(--i-ink)"/>${star(118, 30, 11, "var(--i-sun)")}`,
  save: `<circle cx="118" cy="44" r="17" fill="var(--i-sun2)"/><path d="${wave(160, 120, 3.5, 4, 80)}" fill="var(--i-sea)"/>
    <rect x="12" y="64" width="78" height="7" rx="3.5" fill="var(--i-ink)"/>${[22, 50, 78].map((x) => `<rect x="${x}" y="64" width="6" height="40" rx="3" fill="var(--i-ink)"/>`).join("")}
    <path d="M86 70Q94 80 104 83" stroke="var(--i-ink)" stroke-width="1.6" fill="none"/><path d="M100 84H142L136 93H106Z" fill="var(--i-ink)"/>
    <path d="M119 46V80H103Z" fill="var(--i-paper)" stroke="var(--i-ink)" stroke-width="3" stroke-linejoin="round"/><path d="M124 56V80H137Z" fill="var(--i-ink)"/>
    <path d="M18 110q8-4 16 0M64 114q8-4 16 0M112 108q8-4 16 0" stroke="var(--i-sea2)" stroke-width="3" fill="none" stroke-linecap="round"/>`,
  scams: `<path d="M80 35L4 16V54Z" fill="var(--i-sun2)" opacity=".75"/><path d="M80 35L156 16V54Z" fill="var(--i-sun2)" opacity=".75"/>
    <path d="${wave(160, 120, 3.5, 4, 94)}" fill="var(--i-sea)"/><path d="M48 106c4-12 16-16 32-16s28 4 32 16Z" fill="var(--i-sea2)"/>
    <path d="M71 46H89L94 98H66Z" fill="var(--i-paper)" stroke="var(--i-ink)" stroke-width="3" stroke-linejoin="round"/><path d="M69.4 63H90.6L91.8 76H68.2Z" fill="var(--i-ink)"/>
    <rect x="77" y="86" width="6" height="12" rx="3" fill="var(--i-ink)"/><rect x="68" y="42" width="24" height="5" rx="2.5" fill="var(--i-ink)"/>
    <rect x="72.5" y="29" width="15" height="13" rx="2" fill="var(--i-sun)"/><path d="M68 30L80 18L92 30Z" fill="var(--i-ink)" stroke="var(--i-ink)" stroke-width="2" stroke-linejoin="round"/>`,
  compound: `<circle cx="40" cy="40" r="15" fill="var(--i-sun2)"/><path d="M0 104C40 104 70 96 100 84S140 64 160 60V120H0Z" fill="var(--i-sea)"/>
    <path d="M0 114C50 112 100 102 160 92V120H0Z" fill="var(--i-sea2)"/>${star(30, 92, 3, "var(--i-sun)")}${star(62, 83, 4.5, "var(--i-sun)")}${star(94, 70, 6, "var(--i-sun)")}${boat(118, 38, 0.34)}`,
  retire: `<circle cx="102" cy="70" r="22" fill="var(--i-sun2)"/><rect x="0" y="70" width="160" height="50" fill="var(--i-sea)"/>
    <path d="M24 72c6-11 34-11 44 0Z" fill="var(--i-ink)"/><path d="M45 66c0-9 2-17 7-24" stroke="var(--i-ink)" stroke-width="3" fill="none" stroke-linecap="round"/>
    <path d="M52 42c-8-4-16-2-20 4M52 42c8-5 16-3 20 2M52 42c-1-6 3-11 9-13M52 42c-4-6-11-8-16-6" stroke="var(--i-ink)" stroke-width="3" fill="none" stroke-linecap="round"/>
    <path d="M88 80h24M93 88h14" stroke="var(--i-sun2)" stroke-width="3" stroke-linecap="round"/>${boat(120, 76, 0.3)}`,
  // Not a unit: the empty and course-finished screens.
  harbor: `<circle cx="44" cy="46" r="15" fill="var(--i-sun2)"/><path d="${wave(160, 120, 3, 4, 84)}" fill="var(--i-sea)"/>
    <path d="M18 112q8-4 16 0M70 106q8-4 16 0" stroke="var(--i-sea2)" stroke-width="3" fill="none" stroke-linecap="round"/>${boat(78, 34, 0.5)}`,
};
const UNIT_NAMES = { budget: ["Budgeting", "Presupuesto"], save: ["Saving · a harbor", "Ahorro"], scams: ["Scams and fraud · a lighthouse", "Fraudes y estafas"], compound: ["Compound interest · waves that grow", "Interés compuesto"], retire: ["Retirement · an island ahead", "Retiro"] };
const art = (name, w, extra = "") => `<svg width="${w}" height="${Math.round(w * 0.75)}" viewBox="0 0 160 120" aria-hidden="true" ${extra}>${ART[name]}</svg>`;

// ---- badges ---------------------------------------------------------------------------------
const BADGES = {
  first_lesson: ["First lesson", `<circle cx="61" cy="40" r="13" fill="var(--i-sun2)"/>${boat(24, 22, 0.5)}`],
  streak_7: ["7-day streak", `<circle cx="48" cy="40" r="20" fill="var(--i-sun2)" opacity=".75"/>${star(48, 40, 17)}${[0, 1, 2, 3, 4, 5, 6].map((i) => {
    const a = Math.PI * (0.18 + (0.64 * i) / 6);
    return `<circle cx="${(48 - 27 * Math.cos(a)).toFixed(1)}" cy="${(44 + 27 * Math.sin(a)).toFixed(1)}" r="2.8" fill="var(--i-sun)"/>`;
  }).join("")}`],
  unit: ["First unit", `<rect x="0" y="62" width="96" height="40" fill="var(--i-sea)"/><path d="M20 66c6-15 50-15 56 0Z" fill="var(--i-sand)"/><path d="M48 58V24" stroke="var(--i-ink)" stroke-width="3.5" stroke-linecap="round"/><path d="M49.5 25L70 31.5L49.5 38Z" fill="var(--i-sun)"/>`],
  mission_1: ["First mission", `<g transform="rotate(-28 48 48)"><rect x="16" y="40" width="24" height="17" rx="4" fill="var(--i-ink)"/><rect x="39" y="42" width="21" height="13" rx="3" fill="var(--i-sun)"/><rect x="59" y="44" width="18" height="9" rx="2.5" fill="var(--i-ink)"/></g>${star(70, 26, 6, "var(--i-sun)")}`],
  goal_setter: ["Goal set", `<circle cx="48" cy="60" r="17" fill="var(--i-sun2)"/><rect x="0" y="60" width="96" height="40" fill="var(--i-sea)"/>${star(48, 30, 10)}<path d="M32 70h32M40 78h16" stroke="var(--i-paper)" stroke-width="3" stroke-linecap="round" opacity=".8"/>`],
};
function badge(id, size = 88, locked = false) {
  const k = `b${++uid}`;
  return `<svg width="${size}" height="${size}" viewBox="0 0 96 96" aria-hidden="true" ${locked ? 'class="locked"' : ""}><defs><clipPath id="${k}"><circle cx="48" cy="48" r="38"/></clipPath></defs>
    <circle cx="48" cy="48" r="46" fill="var(--i-sea)"/><circle cx="48" cy="48" r="38" fill="var(--i-paper)"/><g clip-path="url(#${k})">${BADGES[id][1]}</g></svg>`;
}

// ---- app pieces -------------------------------------------------------------------------------
const L = (o, en, es) => (o.es ? es : en);
const top = (o = {}) => `<div class="top">${mark(30, o.goal ?? 50)}<span class="word">Northvale</span><span class="grow"></span><span class="chip">${streakStar(18, o.streak ?? 6)}${o.streak ?? 6}</span><span class="ask">${ic("chat", 17)}${L(o, "Ask", "Preguntar")}</span></div>`;
const TABS = { en: ["Learn", "Goals", "Practice", "Me"], es: ["Aprender", "Metas", "Práctica", "Yo"] };
const tabs = (on, o = {}) => `<div class="tabs">${["book", "target", "compass", "user"].map((i, k) => `<div class="tab ${k === on ? "on" : ""}"><span class="pill">${ic(i, 22)}</span><span>${TABS[o.es ? "es" : "en"][k]}</span></div>`).join("")}</div>`;
const row = (icon, t, s, end = ic("next", 18, "var(--low)")) => `<div class="r"><span class="tile">${icon.startsWith("<") ? icon : ic(icon, 20)}</span><div class="x"><div class="t">${t}</div>${s ? `<div class="s">${s}</div>` : ""}</div>${end}</div>`;
const phone = (cls, html) => `<div class="phone ${cls}">${html}</div>`;
const cls = (mode, o = {}) => [mode, o.dark && "dark", o.font && `f-${o.font}`, o.sand && "sand"].filter(Boolean).join(" ");
const ring = (pct, size, stroke = "var(--brand)") => {
  const c = 2 * Math.PI * 44;
  return `<svg width="${size}" height="${size}" viewBox="0 0 100 100"><circle cx="50" cy="50" r="44" fill="var(--surface)" stroke="var(--surface2)" stroke-width="7"/><circle cx="50" cy="50" r="44" fill="none" stroke="${stroke}" stroke-width="7" stroke-linecap="round" stroke-dasharray="${(c * pct).toFixed(1)} ${c.toFixed(1)}" transform="rotate(-90 50 50)"/></svg>`;
};

// The lesson card on Today: a small picture (calm) or a header scene with a wave edge (playful).
function lessonCard(mode, o) {
  const eyebrow = L(o, "Unit 6 · Scams and fraud", "Unidad 6 · Fraudes y estafas");
  const meta = L(o, "Lesson 1 of 4 · 4 min", "Lección 1 de 4 · 4 min");
  const after = `<div class="p" style="margin-top:6px">${L(o, "One scam can undo months of saving.", "Un solo fraude puede borrar meses de ahorro.")}</div>
    <div class="btn">${L(o, "Continue", "Continuar")}</div><div class="meta" style="display:flex;gap:6px;align-items:center;margin-top:12px">${ic("target", 15)}${L(o, "Building toward: Car", "Aprendes para: Coche")}</div>`;
  if (mode === "calm")
    return `<div class="card"><div style="display:flex;gap:12px"><div style="flex:1"><div class="eyebrow">${eyebrow}</div><div class="h2">Phishing</div><div class="meta">${meta}</div></div>
      <div style="width:84px;height:66px;border-radius:16px;background:var(--i-sky);overflow:hidden;display:flex;align-items:flex-end;justify-content:center">${art("scams", 84)}</div></div>${after}</div>`;
  return `<div class="card" style="padding:0"><div style="position:relative;height:136px;background:var(--i-sky)">
      <svg width="358" height="136" style="position:absolute;left:0;top:0"><path d="${wave(358, 136, 3, 6, 104)}" fill="var(--i-sea)"/></svg>
      <div style="position:absolute;right:4px;bottom:10px">${art("scams", 150)}</div>
      <svg width="358" height="24" viewBox="0 0 358 24" preserveAspectRatio="none" style="position:absolute;left:0;bottom:-1px"><path d="${wave(358, 24, 6, 5, 14)}" fill="var(--surface)"/></svg>
      <div style="position:absolute;left:20px;top:18px;max-width:190px"><div class="eyebrow">${eyebrow}</div><div class="h2" style="font-size:30px">Phishing</div><div class="meta">${meta}</div></div></div>
    <div style="padding:2px 20px 20px">${after}</div></div>`;
}
function today(mode, o = {}) {
  return phone(cls(mode, o), `${top(o)}<div class="body"><div class="date">${L(o, "Wednesday, November 11", "Miércoles, 11 de noviembre")}</div><h1>${L(o, "Today", "Hoy")}</h1>
    ${lessonCard(mode, o)}
    <div class="rows">${row("refresh", L(o, "Review", "Repaso"), L(o, "5 ideas to refresh · 2 min", "5 ideas para refrescar · 2 min"))}${row("calendar", L(o, "Your money week", "Tu semana de dinero"), L(o, "A short look back, then the check-in", "Un repaso corto y luego la revisión"))}</div>
    <div class="card"><div class="eyebrow">${L(o, "Myth or fact?", "¿Mito o realidad?")}</div><div class="h2" style="font-size:20px;line-height:1.3">${L(o, "“After a 50% loss, you need a 100% gain to get back to even.”", "“Después de perder 50%, necesitas ganar 100% para recuperarte.”")}</div>
      <div style="display:flex;gap:10px;margin-top:14px"><div class="btn sec" style="height:46px">${L(o, "Myth", "Mito")}</div><div class="btn sec" style="height:46px">${L(o, "Fact", "Realidad")}</div></div></div>
  </div>${tabs(0, o)}`);
}

// The course as a voyage.
function lessonRoute(o = {}) {
  const items = [["Phishing", "done"], ["Fake investments", "now"], ["Pyramid schemes", "locked"], ["Protect your accounts", "locked"]];
  const node = (s) =>
    s === "done" ? `<span style="width:34px;height:34px;border-radius:17px;background:var(--brand);color:var(--onBrand);display:flex;align-items:center;justify-content:center">${ic("check", 18)}</span>`
    : s === "now" ? `<span style="width:52px;height:52px;border-radius:26px;background:var(--i-sky);box-shadow:0 0 0 3px var(--brand);display:flex;align-items:center;justify-content:center;margin:0 -9px">${mark(34, 100)}</span>`
    : `<span style="width:34px;height:34px;border-radius:17px;border:2px solid var(--line);background:var(--surface);color:var(--low);display:flex;align-items:center;justify-content:center">${ic("lock", 15)}</span>`;
  return `<div style="position:relative;margin-top:8px"><svg width="4" height="230" style="position:absolute;left:15px;top:20px"><path d="M2 0V230" stroke="var(--i-sea2)" stroke-width="3" stroke-linecap="round" stroke-dasharray="0.1 8"/></svg>
    ${items.map(([t, s]) => `<div style="display:flex;align-items:center;gap:14px;min-height:${s === "now" ? 76 : 62}px;position:relative">${node(s)}<div style="flex:1;${s === "locked" ? "color:var(--low)" : ""}"><div style="font-weight:${s === "now" ? 750 : 650};${s === "now" ? "font-size:17px;color:var(--head)" : ""}">${t}</div><div class="s meta">4 min</div></div>${s === "now" ? `<div class="btn small">Start</div>` : ""}</div>`).join("")}</div>`;
}
function voyageMap() {
  // A snaking route: units 1–3 along the bottom, 4–5 and the boat (unit 6) above, faint units ahead.
  const pts = [[60, 290], [180, 290], [300, 290], [340, 248], [296, 206], [176, 206], [62, 206], [24, 166], [110, 124], [232, 124], [312, 86], [318, 36]];
  const done = [[0, "Budgeting"], [1, "Saving"], [2, "Banking"], [4, "Paycheck"], [5, "Credit"]];
  const curve = (p) => p.slice(0, -1).map((a, i) => {
    const p0 = p[i - 1] || a, p2 = p[i + 1], p3 = p[i + 2] || p2;
    const c1 = [a[0] + (p2[0] - p0[0]) / 6, a[1] + (p2[1] - p0[1]) / 6], c2 = [p2[0] - (p3[0] - a[0]) / 6, p2[1] - (p3[1] - a[1]) / 6];
    return `${i ? "" : `M${a}`}C${c1} ${c2} ${p2}`;
  }).join("");
  const island = ([x, y], label, faint) => {
    const s = (0.6 + (0.45 * y) / 330).toFixed(2);
    const flag = faint ? "" : `<path d="M2 -5V-30" stroke="var(--i-ink)" stroke-width="2.6" stroke-linecap="round"/><path d="M3.3 -30L19 -25L3.3 -20Z" fill="var(--i-sun)"/>`;
    return `<g transform="translate(${x} ${y - 4}) scale(${s})" opacity="${faint ? 0.45 : 1}"><ellipse cx="0" cy="6" rx="32" ry="7" fill="var(--i-sea2)" opacity=".55"/><path d="M-27 6c6-17 48-17 54 0Z" fill="var(--i-sand)"/>${flag}</g>
      ${label ? `<text x="${x}" y="${y + 22}" text-anchor="middle" font-family="Inter" font-size="11.5" font-weight="700" fill="var(--head)">${label}</text>` : ""}`;
  };
  return `<svg width="358" height="330" viewBox="0 0 358 330" style="border-radius:var(--rc);background:var(--i-sky)">
    <path d="M0 40H358" stroke="var(--i-sea2)" stroke-width="1.5"/>${star(318, 24, 9, "var(--i-sun)")}
    <text x="300" y="29" text-anchor="end" font-family="Inter" font-size="11.5" font-weight="650" fill="var(--mid)">Open water</text>
    ${[[30, 74], [180, 84], [262, 164], [96, 250], [236, 250]].map(([x, y]) => `<path d="M${x} ${y}q6-3 12 0t12 0" stroke="var(--i-sea2)" stroke-width="2" fill="none" stroke-linecap="round" opacity=".7"/>`).join("")}
    <path d="${curve(pts.slice(6))}" fill="none" stroke="var(--i-sea2)" stroke-width="3" stroke-linecap="round" stroke-dasharray="0.1 9"/>
    <path d="${curve(pts.slice(0, 7))}" fill="none" stroke="var(--i-ink)" stroke-width="3" stroke-linecap="round" stroke-dasharray="0.1 9"/>
    ${done.map(([i, name], k) => island(pts[i], `${k + 1} · ${name}`, false)).join("")}${[8, 9].map((i) => island(pts[i], "", true)).join("")}
    <circle cx="62" cy="200" r="27" fill="var(--surface)" opacity=".9"/>${boat(44, 176, 0.36)}
    <text x="62" y="242" text-anchor="middle" font-family="Inter" font-size="12" font-weight="800" fill="var(--head)">6 · Now</text></svg>`;
}
function path(variant, o = {}) {
  const mode = "playful";
  const head = `<div class="disp" style="font-size:30px;color:var(--head);line-height:1.1">Your course</div><div class="meta" style="margin:4px 0 10px">20 of 59 lessons · 6 of 17 units</div>`;
  const unitCard = `<div class="card" style="margin-top:14px"><div style="display:flex;gap:12px;align-items:center"><div style="flex:1"><div class="eyebrow">Unit 6 · Now</div><div class="h2" style="font-size:24px">Scams and fraud</div></div>
    <div style="width:74px;height:58px;border-radius:16px;background:var(--i-sky);overflow:hidden;display:flex;align-items:flex-end;justify-content:center">${art("scams", 76)}</div></div>${lessonRoute(o)}</div>`;
  if (variant === "islands") return phone(cls(mode, o), `${top(o)}<div class="body">${head}${voyageMap()}${unitCard}</div>${tabs(0, o)}`);
  const done = (n, t) => row(`<span style="width:30px;height:30px;border-radius:15px;background:var(--brand);color:var(--onBrand);display:flex;align-items:center;justify-content:center">${ic("check", 16)}</span>`, t, `Unit ${n} · done`, `<span class="meta">3 of 3</span>`);
  return phone(cls(mode, o), `${top(o)}<div class="body">${head}<div class="bar" style="margin-bottom:6px"><i style="width:34%"></i></div>
    <div class="rows">${done(4, "Your first paycheck")}${done(5, "Debt & credit")}</div>${unitCard}
    <div class="rows">${row("lock", "Compound interest", "Unit 7 · after Unit 6", "")}</div></div>${tabs(0, o)}`);
}

function finish(mode, o = {}) {
  const ringBlock = `<div style="position:relative;width:176px;height:176px;margin:0 auto">${ring(0.5, 176)}<div style="position:absolute;inset:0;display:flex;flex-direction:column;align-items:center;justify-content:center"><div class="num" style="font-size:48px;line-height:1">+10</div><div style="font-size:13px;font-weight:700;color:var(--low)">XP</div></div></div>`;
  const rest = `<div class="meta center" style="margin-top:12px">${L(o, "10 of 20 XP today · 1-day streak", "10 de 20 XP hoy · racha de 1 día")}</div>
    <h1 class="center" style="font-size:34px;margin:8px 0 2px">${L(o, "Lesson complete", "Lección completa")}</h1><div class="meta center">${L(o, "What's a budget?", "¿Qué es un presupuesto?")}</div>
    <div class="card" style="margin-top:18px"><div class="eyebrow">${L(o, "In real life", "En la vida real")}</div><div style="margin-top:4px">${L(o, "This week, write down three things your money will go to before it arrives.", "Esta semana, anota tres cosas a las que irá tu dinero antes de recibirlo.")}</div></div>
    <div style="display:flex;align-items:center;gap:10px;justify-content:center;margin-top:16px">${badge("first_lesson", 36)}<span class="meta" style="font-weight:650">${L(o, "Achievement: First lesson", "Logro: Primera lección")}</span></div>`;
  const btns = `<div class="btns" style="position:absolute;left:16px;right:16px;bottom:30px"><div class="btn">${L(o, "Next: Needs vs. wants", "Siguiente: Necesidades vs. gustos")}</div><div class="btn sec">${L(o, "Done", "Listo")}</div></div>`;
  if (mode === "calm") return phone(cls(mode, o), `<div class="body" style="padding-top:46px">${ringBlock}${rest}</div>${btns}`);
  const sparkle = [[70, 70, 7], [318, 92, 9], [96, 196, 5], [300, 200, 6], [58, 140, 4]].map(([x, y, r]) => star(x, y, r, "var(--accent)")).join("");
  return phone(cls(mode, o), `<svg width="390" height="300" style="position:absolute;top:0;left:0"><defs><linearGradient id="sky${++uid}" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="var(--bg)"/><stop offset="1" stop-color="var(--accentSoft)"/></linearGradient></defs>
      <rect width="390" height="300" fill="url(#sky${uid})"/>${sparkle}<path d="${wave(390, 300, 7, 5, 236)}" fill="var(--i-sea)"/><path d="${wave(390, 300, 6, 4, 262)}" fill="var(--i-sea2)" opacity=".7"/><path d="${wave(390, 300, 5, 6, 284)}" fill="var(--bg)"/>${boat(292, 196, 0.42)}</svg>
    <div class="body" style="padding-top:40px">${ringBlock}<div style="height:96px"></div>${rest.replace('margin-top:12px', 'margin-top:0')}</div>${btns}`);
}

function welcome(mode, o = {}) {
  const words = `<div class="word" style="font-size:44px;line-height:1">Northvale</div><div style="font-size:12px;letter-spacing:4px;font-weight:650;color:var(--mid);margin-top:6px">LEARN</div>
    <div style="color:var(--mid);margin-top:6px">${L(o, "Find your open water", "Rumbo a mar abierto")}</div>`;
  const body = `<h1 style="font-size:32px;margin:26px 0 8px">${L(o, "Learn money by doing.", "Aprende de dinero practicando.")}</h1>
    <div style="color:var(--mid)">${L(o, "Four-minute lessons, a goal to learn for, and practice with pretend money.", "Lecciones de cuatro minutos, una meta para aprender y dinero de práctica para probar.")}</div>`;
  const bottom = `<div style="position:absolute;left:16px;right:16px;bottom:22px"><div class="btns"><div class="btn">${L(o, "Get started", "Empezar")}</div><div class="btn sec">${L(o, "I already have an account", "Ya tengo cuenta")}</div></div>
    <div style="display:flex;justify-content:center;gap:4px;margin-top:12px"><span class="lang on">English</span><span class="lang">Español</span><span style="width:1px;background:var(--line);margin:6px 4px"></span><span class="lang on">🇺🇸 USD</span><span class="lang">🇲🇽 MXN</span></div>
    <div class="fine center" style="margin-top:6px">Northvale Learn is for learning. All money here is pretend, and nothing here is financial advice.</div></div>`;
  if (mode === "calm")
    return phone(cls(mode, o), `<div class="center" style="padding:70px 24px 0"><div style="display:flex;justify-content:center">${mark(76)}</div><div style="margin-top:10px">${words}</div>${body}</div>${bottom}`);
  return phone(cls(mode, o), `<svg width="390" height="330" style="position:absolute;top:0;left:0"><rect width="390" height="330" fill="var(--i-sky)"/><circle cx="292" cy="150" r="46" fill="var(--i-sun2)"/>
      ${star(86, 70, 6, "var(--i-sun)")}${star(118, 46, 3.5, "var(--i-sun)")}<path d="${wave(390, 330, 7, 4, 214)}" fill="var(--i-sea)"/>${boat(130, 106, 1.25)}<path d="${wave(390, 330, 6, 5, 252)}" fill="var(--i-sea2)" opacity=".75"/><path d="${wave(390, 330, 8, 3, 300)}" fill="var(--bg)"/></svg>
    <div class="center" style="padding:316px 24px 0;position:relative">${words}${body.replace("margin:26px 0 8px", "margin:18px 0 8px")}</div>${bottom}`);
}

function question(o = {}, answered = false) {
  const opts = [["A", "A message that rushes you to act now"], ["B", "An email from a friend you were expecting"], ["C", "A bill you set up yourself"]];
  const qbar = `<div class="qbar">${ic("close", 22, "var(--low)")}<div style="flex:1;position:relative;margin:0 6px"><div class="bar"><i style="width:${answered ? 46 : 38}%"></i></div><span style="position:absolute;top:-17px;left:calc(${answered ? 46 : 38}% - 15px)">${mark(28, 100)}</span></div><span class="ask line">${ic("chat", 15)}Ask</span>${ic("flag", 18, "var(--low)")}</div>`;
  const list = opts.map(([k, t], i) => `<div class="opt ${answered ? (i === 0 ? "right" : "dim") : i === 0 ? "sel" : ""}"><span class="k">${answered && i === 0 ? ic("check", 17) : k}</span>${t}</div>`).join("");
  const foot = answered
    ? `<div class="fb"><div class="h disp">${ic("check", 22)}Correct</div><div style="margin-bottom:16px">Scammers rush you so you don't stop to check. Slow down and go to the real website yourself.</div><div class="btn">Continue</div></div>`
    : `<div style="position:absolute;left:16px;right:16px;bottom:30px"><div class="btn">Check</div></div>`;
  return phone(cls("playful", o), `${qbar}<div class="body" style="padding-top:14px"><div class="eyebrow">Pick one</div><div class="qt" style="font-size:27px;line-height:1.2;color:var(--head);margin:6px 0 22px">Which of these is a sign of phishing?</div>${list}</div>${foot}`);
}

function goals(o = {}) {
  const pct = 19;
  const track = `<div style="position:relative;height:40px;margin:18px 4px 4px"><svg width="318" height="40" style="position:absolute;left:0;top:0"><path d="M6 26H300" stroke="var(--i-sea2)" stroke-width="3" stroke-linecap="round" stroke-dasharray="0.1 8"/><path d="M6 26H${6 + (294 * pct) / 100}" stroke="var(--brand)" stroke-width="5" stroke-linecap="round"/>
      <g transform="translate(300 26)"><path d="M-14 4c4-11 24-11 28 0Z" fill="var(--i-sand)"/><path d="M1 -2V-20" stroke="var(--i-ink)" stroke-width="2.2" stroke-linecap="round"/><path d="M2 -20L13 -16L2 -12Z" fill="var(--i-sun)"/></g></svg>
      <span style="position:absolute;left:${(294 * pct) / 100 - 10}px;top:-2px">${mark(30, 100)}</span></div>`;
  return phone(cls("playful", o), `${top(o)}<div class="body"><h1>Goals</h1><div class="meta" style="margin:-10px 0 16px">What you're learning for.</div>
    <div class="card"><div style="display:flex;gap:12px;align-items:center"><span class="tile">${ic("car", 20)}</span><div style="flex:1"><div style="font-weight:700;font-size:17px">Car</div><div class="meta">1 yr 5 mo left</div></div><span class="tag">Ahead</span></div>
      <div class="eyebrow" style="margin-top:16px">Saved so far</div><div style="display:flex;align-items:baseline;gap:8px"><span class="num" style="font-size:40px">$950</span><span class="meta">of $5,000</span></div>${track}
      <div class="meta" style="display:flex;justify-content:space-between"><span>$271/month · Savings account</span><span>${pct}%</span></div></div>
    <div class="card"><div style="display:flex;gap:8px;align-items:center;font-weight:700">${ic("calendar", 18)}Weekly check-in</div><div style="margin:10px 0 14px">Did you set anything aside this week?</div><div style="display:flex;gap:10px"><div class="btn" style="height:46px">Yes, record it</div><div class="btn sec" style="height:46px">Not this week</div></div></div>
  </div>${tabs(1, o)}`);
}

function practice(o = {}) {
  return phone(cls("playful", o), `${top(o)}<div class="body"><h1>Practice</h1><div class="meta" style="margin:-10px 0 16px">Try what you learned. Pretend money only.</div>
    <div class="card" style="padding:0"><div style="display:flex;align-items:center;gap:14px;padding:18px 20px 6px"><div style="flex:1"><div class="eyebrow">This week's mission</div><div class="h2" style="font-size:22px">Price the full cost of a car</div><div class="meta">About 20 min</div></div>${badge("mission_1", 64)}</div>
      <div style="padding:6px 20px 20px"><div class="p" style="margin-top:4px">Besides the price, estimate a month of gas, insurance and upkeep. Add it up.</div><div class="btn">Start mission</div></div></div>
    <div class="card"><div class="eyebrow">The real cost</div><div class="h2" style="font-size:21px">Small daily things add up. Pick one.</div>
      <div style="display:flex;flex-wrap:wrap;gap:8px;margin:12px 0"><span class="pc on">Coffee · $5</span><span class="pc">Snack · $3</span><span class="pc">Ride · $12</span><span class="pc">Your own</span></div>
      <div>$5 every workday is about <b>$1,300 a year</b>. Put toward an investment at an example 7% for 10 years, it could grow to about <b>$18,750</b>.</div></div>
    <div class="rows">${row("flag", "Money Missions", "31 small real-life tasks")}${row("chart", "Practice portfolio", "You own 1 practice investment")}</div>
  </div>${tabs(2, o)}`);
}

function me(o = {}) {
  const stat = (icon, n, t) => `<div class="card" style="flex:1;padding:14px 14px 12px;margin-top:0">${icon}<div class="num" style="font-size:28px;margin-top:6px">${n}</div><div class="meta" style="font-size:13px">${t}</div></div>`;
  const bars = [62, 30, 48, 0, 0, 0, 0];
  return phone(cls("playful", o), `${top({ ...o, streak: 12 })}<div class="body">
    <div style="display:flex;gap:14px;align-items:center;margin-bottom:16px"><span style="width:60px;height:60px;border-radius:30px;background:var(--brand);color:var(--onBrand);display:flex;align-items:center;justify-content:center" class="disp"><span style="font-size:28px">D</span></span>
      <div style="flex:1"><div class="disp" style="font-size:30px;color:var(--head);line-height:1">Dani</div><div style="display:flex;gap:10px;align-items:center;margin-top:8px"><span class="meta" style="font-weight:650">Level 3</span><div class="bar" style="flex:1"><i style="width:84%"></i></div><span class="meta">135/150</span></div></div></div>
    <div style="display:flex;gap:10px;margin-bottom:14px">${stat(streakStar(22, 12), 12, "Day streak")}${stat(ic("sparkles", 22, "var(--head)"), 285, "Total XP")}${stat(ic("shield", 22, "var(--head)"), "1/2", "Freezes")}</div>
    <div class="card"><div style="display:flex;justify-content:space-between;align-items:baseline"><div style="font-weight:700">This week</div><div class="meta">40 XP</div></div>
      <div style="display:flex;gap:12px;align-items:flex-end;height:96px;margin-top:12px">${bars.map((h, i) => `<div style="flex:1;display:flex;flex-direction:column;align-items:center;gap:6px"><div style="width:100%;height:${Math.max(h, 6)}px;border-radius:10px;background:${h ? "var(--brand)" : "var(--surface2)"};${i === 2 ? "outline:2px solid var(--accent);outline-offset:2px" : ""}"></div><span class="fine" style="font-weight:650">${"MTWTFSS"[i]}</span></div>`).join("")}</div></div>
    <div class="card"><div style="display:flex;justify-content:space-between;align-items:baseline"><div style="font-weight:700">Achievements</div><div class="meta">7 of 20</div></div>
      <div style="display:flex;justify-content:space-between;margin-top:14px">${["first_lesson", "streak_7", "unit", "mission_1"].map((b) => badge(b, 62)).join("")}${badge("goal_setter", 62, true)}</div></div>
  </div>${tabs(3, o)}`);
}

function empty(o = {}) {
  return phone(cls("playful", o), `${top({ ...o, streak: 1, goal: 50 })}<div class="body"><h1>Practice</h1><div class="meta" style="margin:-10px 0 16px">Try what you learned. Pretend money only.</div>
    <div class="card center" style="padding:0 0 22px"><svg width="358" height="170" viewBox="0 0 358 170" style="background:var(--i-sky)"><circle cx="112" cy="62" r="24" fill="var(--i-sun2)"/>${star(276, 40, 6, "var(--i-sun)")}<path d="${wave(358, 170, 5, 5, 120)}" fill="var(--i-sea)"/>${boat(160, 54, 0.74)}<path d="${wave(358, 170, 4, 6, 146)}" fill="var(--i-sea2)" opacity=".7"/></svg>
      <div style="padding:16px 22px 0"><div class="h2" style="font-size:26px">Opens after 3 lessons</div><div class="p" style="color:var(--mid)">Practice investing with $10,000 of pretend money, plus Money Missions, calculators and news.</div>
      <div style="display:flex;align-items:center;gap:10px;margin-bottom:16px"><div class="bar" style="flex:1"><i style="width:33%"></i></div><span class="meta">1 of 3 lessons</span></div><div class="btn">Continue learning</div></div></div>
  </div>${tabs(2, o)}`);
}

function courseDone(o = {}) {
  return phone(cls("playful", o), `<svg width="390" height="390" style="position:absolute;top:0;left:0"><rect width="390" height="390" fill="var(--i-sky)"/>${star(200, 70, 16, "var(--i-sun)")}${star(126, 110, 5, "var(--i-sun)")}${star(286, 120, 6, "var(--i-sun)")}
      <circle cx="195" cy="250" r="64" fill="var(--i-sun2)"/><rect x="0" y="250" width="390" height="140" fill="var(--i-sea)"/><path d="M160 262h70M174 276h42" stroke="var(--i-sun2)" stroke-width="5" stroke-linecap="round"/>${boat(78, 228, 0.62)}<path d="${wave(390, 390, 8, 3, 360)}" fill="var(--bg)"/></svg>
    <div class="body center" style="padding-top:396px"><div class="eyebrow">59 of 59 lessons · 17 units</div><h1 style="font-size:34px;margin:8px 0 10px">You finished the whole course.</h1><div class="disp" style="font-size:24px;color:var(--head)">Open water ahead.</div>
      <div class="p" style="color:var(--mid)">Reviews keep it fresh, and your goals keep going.</div></div>
    <div class="btns" style="position:absolute;left:16px;right:16px;bottom:30px"><div class="btn">${ic("share", 18)}Share</div><div class="btn sec">Done</div></div>`);
}

// ---- type, illustration, badge, color and motion panels --------------------------------------
function typeCard(f, name, about, size) {
  return `<div class="phone playful f-${f}" style="height:auto;padding:24px 22px 26px"><div class="eyebrow" style="font-size:14px">${name} · ${size}</div><div class="meta" style="margin-bottom:16px">${about}</div>
    <div class="disp" style="font-size:40px;color:var(--head);line-height:1.05">Today</div><div class="disp" style="font-size:30px;color:var(--head);margin-top:10px;line-height:1.1">Lesson complete</div>
    <div class="disp" style="font-size:30px;color:var(--head);line-height:1.1">Lección completa</div><div style="display:flex;gap:18px;align-items:baseline;margin-top:12px"><span class="num" style="font-size:56px;line-height:1">+10</span><span class="num" style="font-size:36px">$1,300</span><span class="num" style="font-size:36px">¿Sí?</span></div>
    <div class="qt" style="font-size:24px;line-height:1.2;color:var(--head);margin-top:14px">Which of these is a sign of phishing?</div>
    <div style="margin-top:10px;color:var(--mid)">Body text stays Inter: clear at small sizes, on every phone, in both languages.</div></div>`;
}
const panel = (cls2, title, inner, w) => `<div class="panel ${cls2}" style="width:${w}px"><h3>${title}</h3>${inner}</div>`;
function details() {
  const units = (dark) => panel(dark ? "dark" : "", dark ? "Unit pictures, dark mode" : "Unit pictures (5 of 17)", `<div class="items">${Object.keys(UNIT_NAMES).map((k) => `<div class="item"><div style="background:var(--i-sky);border-radius:18px;padding:8px 6px 0">${art(k, 128)}</div>${UNIT_NAMES[k][0]}</div>`).join("")}</div>`, 852);
  const badges = (dark) => panel(dark ? "dark" : "", dark ? "Badges, dark mode" : "Badges (5, plus one not earned yet)", `<div class="items">${Object.keys(BADGES).map((k) => `<div class="item">${badge(k, 96)}${BADGES[k][0]}</div>`).join("")}<div class="item">${badge("goal_setter", 96, true)}Not earned yet</div></div>`, 852);
  const accent = (sand) => {
    const name = sand ? "Golden sand" : "Sunrise coral (recommended)";
    const swatches = `<div class="items">${[["Accent", "var(--accent)"], ["Soft", "var(--accentSoft)"], ["Navy", "#13315C"], ["Cream", "#F7F2E8"]].map(([t, c]) => `<div class="item"><div class="swatch" style="background:${c};box-shadow:inset 0 0 0 1px rgba(0,0,0,.08)"></div>${t}</div>`).join("")}</div>`;
    const sample = (dark) => `<div class="panel ${dark ? "dark" : ""} ${sand ? "sand" : ""}" style="padding:12px;display:flex;gap:12px;align-items:center;margin-top:12px"><div style="background:var(--i-sky);border-radius:14px;padding:6px 4px 0">${art("scams", 104)}</div>${badge("streak_7", 70)}<div style="display:flex;gap:6px">${streakStar(26, 7)}${streakStar(26, 30)}${streakStar(26, 100)}</div></div>`;
    return panel(sand ? "sand" : "", name, `${swatches}${sample(false)}${sample(true)}`, 414);
  };
  const contrast = panel("", "Contrast checks", `<table style="border-collapse:collapse;font-size:14px;width:100%">${CONTRAST.map(([t, r, min]) => `<tr><td style="padding:6px 0;border-bottom:1px solid var(--line)">${t}</td><td style="text-align:right;font-weight:700;border-bottom:1px solid var(--line)">${r}:1</td><td style="text-align:right;padding-left:10px;border-bottom:1px solid var(--line);color:${r >= min ? "#1B6F54" : "#8C520E"}">${r >= min ? "passes" : "decoration only"}</td></tr>`).join("")}</table>
    <div class="fine" style="margin-top:10px">The accent never carries a meaning (right, behind, a warning), so shapes in it don't need 3:1. Text never uses the light accent; if it ever needs to, it uses #A8462A.</div>`, 852);
  const motion = panel("", "Motion (still frames; all of it off with Reduce motion)", `<div class="items">
    ${[0, 40, 75, 100].map((p) => `<div class="item">${mark(60, p)}Sail ${p}%${p === 100 ? ", goal met" : ""}</div>`).join("")}
    <div style="width:1px;height:70px;background:var(--line)"></div>
    ${[1, 7, 30, 100].map((n) => `<div class="item"><div style="padding:12px">${streakStar(40, n)}</div>${n}-day streak</div>`).join("")}
    <div style="width:1px;height:70px;background:var(--line)"></div>
    ${[-6, 0, 6].map((d) => `<div class="item"><svg width="74" height="60" viewBox="0 0 74 60"><path d="${wave(74, 60, 3, 2, 46)}" fill="var(--i-sea)"/><g transform="rotate(${d} 37 40)">${boat(20, 10, 0.34)}</g></svg>${d ? "" : "Loading: the boat bobs"}</div>`).join("")}</div>`, 852);
  const buttons = panel("", "Buttons: calm and playful, normal and pressed", `<div style="display:flex;gap:16px"><div class="phone calm" style="height:auto;width:186px;background:none;padding:6px;display:flex;flex-direction:column;gap:14px"><div class="btn">Continue</div><div class="btn pressed">Pressed</div><div class="meta center">Calm: soft shadow</div></div>
    <div class="phone playful" style="height:auto;width:186px;background:none;padding:6px;display:flex;flex-direction:column;gap:14px"><div class="btn">Continue</div><div class="btn pressed">Pressed</div><div class="meta center">Playful: a 3 px edge</div></div></div>`, 414);
  return [["", "", units(false)], ["", "", badges(false)], ["", "", units(true)], ["", "", badges(true)], ["", "", accent(false)], ["", "", accent(true)], ["", "", contrast], ["", "", motion], ["", "", buttons]];
}

// ---- the sheets -------------------------------------------------------------------------------------
const SECTIONS = [
  { id: "compare", file: "1-calm-vs-playful", title: "1 · Calm or playful? The four key screens, side by side", note: "Calm: today's app with rounder shapes, a heading font, small pictures and soft buttons. Playful: bigger rounder shapes, scenes with a wave edge, buttons with a pressable edge, and the voyage map with islands. Everything else is the same.",
    items: [["Today · calm", "", today("calm")], ["Today · playful", "", today("playful")], ["Lesson complete · calm", "", finish("calm")], ["Lesson complete · playful", "The ring rises like a sun over the sea; small stars, no confetti", finish("playful")],
      ["Learn path · route, no islands", "The boat sits at your lesson and glides to the next one", path("route")], ["Learn path · with islands", "Finished units become islands with a flag; the next ones are faint", path("islands")], ["Welcome · calm", "", welcome("calm")], ["Welcome · playful", "", welcome("playful")]] },
  { id: "screens", file: "2-screens", title: "2 · The other screens (playful version)", note: "A lesson question and a right answer (a soft ripple), Goals as a voyage to an island, Practice, Me with illustrated badges, an empty screen, the whole course finished, and Today in Spanish.",
    items: [["A lesson question", "The boat on the progress bar moves as you go", question()], ["A right answer", "A soft ripple around the check; green still means right", question({}, true)], ["Goals", "Saved so far as a voyage: the boat, the route, the island", goals()], ["Practice", "", practice()],
      ["Me", "The streak star glows from 7 days; badges are illustrated", me()], ["An empty screen", "Practice before it opens", empty()], ["The whole course finished", "The approved line: “Open water ahead.”", courseDone()], ["Today in Spanish", "", today("playful", { es: true })]] },
  { id: "dark", file: "3-dark", title: "3 · Dark mode", note: "Same pictures, with cream as the ink and deep navy as the sea. The accent gets a little lighter so it still glows.",
    items: [["Today · dark", "", today("playful", { dark: true })], ["Learn path with islands · dark", "", path("islands", { dark: true })], ["Lesson complete · dark", "", finish("playful", { dark: true })], ["A right answer · dark", "", question({ dark: true }, true)]] },
  { id: "fonts", file: "4-fonts", title: "4 · A heading font: three options (Inter stays for everything else)", note: "All three are free (SIL Open Font License) and would be self-hosted like Inter, with no Google Fonts. Sizes are the Latin file the app would load, which covers Spanish.",
    items: [["Fraunces (soft) · recommended", "Warm and premium; its soft corners echo the serif logo", typeCard("fraunces", "Fraunces, soft", "A soft serif with rounded details", "62 KB")], ["Bricolage Grotesque", "Lively and modern; a bit quirky", typeCard("bricolage", "Bricolage Grotesque", "A lively sans with character", "77 KB")], ["Nunito", "The most rounded; the closest to “a kids' app”", typeCard("nunito", "Nunito", "A fully rounded sans", "39 KB")]] },
  { id: "details", file: "5-pictures-badges-motion", title: "5 · Pictures, badges, the accent color, motion and buttons", note: "Every picture is a small SVG in navy, cream and the accent (about 1–1.5 KB each). No faces, no characters, no anchors or ship's wheels.", items: details() },
];

const html = `<!doctype html><meta charset="utf-8"><title>Playful navy and cream</title><style>${FONTS}${CSS}</style>${SECTIONS.map((s) => `<section id="${s.id}"><h2>${s.title}</h2><p>${s.note}</p><div class="grid">${s.items.map(([cap, sub, h]) => `<div>${h}${cap ? `<div class="cap">${cap}${sub ? `<small>${sub}</small>` : ""}</div>` : ""}</div>`).join("")}</div></section>`).join("")}`;
writeFileSync(join(HERE, "mockups.html"), html);
const browser = await chromium.launch({ channel: "chrome", headless: true });
const page = await browser.newPage({ viewport: { width: 1816, height: 1200 }, deviceScaleFactor: 2 });
await page.setContent(html);
await page.evaluate(() => document.fonts.ready);
for (const s of SECTIONS) await page.locator(`#${s.id}`).screenshot({ path: join(HERE, `${s.file}.png`) });
await browser.close();
console.log(CONTRAST.map(([t, r]) => `${t}: ${r}:1`).join("\n"));
