// The mockup kit: the app's look (white, grey, navy; Inter; the app's own
// icons) as plain HTML pieces, and a function that photographs each screen
// at phone size. Used by docs/design/fun/mockups.mjs. (The clarity mockups
// keep their own copy: they're the approved record and stay as they were.)
import { readFileSync, writeFileSync } from "node:fs";
import { join } from "node:path";
import { chromium } from "playwright-core";

const ROOT = join(import.meta.dirname, "../..");
const font = (f) => `data:font/woff2;base64,${readFileSync(join(ROOT, "web/fonts", f)).toString("base64")}`;
const src = readFileSync(join(ROOT, "src/core/ui.jsx"), "utf8");
const PATHS = Object.fromEntries([...src.slice(src.indexOf("const PATHS")).matchAll(/^\s*([a-z_]+):\s*"([^"]+)"/gm)].map((m) => [m[1], m[2]]));
const FLAME = "M12 2c1 4 6 6 6 12a6 6 0 01-12 0c0-3 2-5 3-6 0 2 1 3 2 3 0-3-1-6 1-9z";
export const ic = (name, size = 20, color = "currentColor") =>
  name === "flame" ? `<svg width="${size}" height="${size}" viewBox="0 0 24 24"><path d="${FLAME}" fill="${color}"/></svg>` : `<svg width="${size}" height="${size}" viewBox="0 0 24 24" fill="none" stroke="${color}" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="${PATHS[name] || ""}"/></svg>`;

export const CSS = `
@font-face{font-family:Inter;font-weight:100 900;src:url(${font("inter-latin-wght-normal.woff2")})}
@font-face{font-family:Garamond;font-weight:600 700;src:url(${font("eb-garamond-latin-600-normal.woff2")})}
*{box-sizing:border-box;margin:0;padding:0}
body{background:#d9dde3;font-family:Inter,system-ui,sans-serif;padding:24px;display:flex;flex-wrap:wrap;gap:24px}
.phone{--bg:#F7F2E8;--surface:#FFFDF8;--surface2:#EFE7D8;--ink:#22303F;--head:#13315C;--mid:#4C5866;--low:#5C6573;--line:#E6DCCB;--navy:#13315C;--onNavy:#FFFDF8;--navySoft:#E3E7EE;--right:#1B6F54;--rightSoft:#E1EFE6;--warn:#8C520E;--warnSoft:#F7E9D2;
  width:390px;height:844px;background:var(--bg);color:var(--ink);position:relative;overflow:hidden;font-size:16px;line-height:1.45}
.phone.dark{--bg:#0D1A2D;--surface:#15253C;--surface2:#1F3150;--ink:#F2EBDC;--head:#F7F1E6;--mid:#CFC7B7;--low:#B3AC9E;--line:#2A3C58;--navy:#F0E3C6;--onNavy:#0D1A2D;--navySoft:#24344F;--right:#63C9A2;--rightSoft:#123A33}
.phone h1,.phone .q{color:var(--head)}
.top{height:56px;display:flex;align-items:center;gap:10px;padding:0 16px}
.mark{font-family:Garamond,Georgia,serif;font-weight:650;font-size:25px;letter-spacing:-.3px}
.grow{flex:1}
.chip{display:inline-flex;align-items:center;gap:5px;font-weight:650;font-size:15px;color:var(--mid);height:36px;padding:0 6px}
.ask{display:inline-flex;align-items:center;gap:6px;height:36px;padding:0 14px;border-radius:18px;background:var(--surface);font-weight:650;font-size:15px;color:var(--ink)}
.ask.line{background:var(--bg);border:1px solid var(--line);height:34px;padding:0 12px;font-size:14px}
.body{padding:4px 16px 100px}
.date{font-size:14px;color:var(--mid);font-weight:600}
h1{font-size:30px;font-weight:750;letter-spacing:-.6px;line-height:1.15;margin:2px 0 14px}
.q{font-size:23px;font-weight:750;letter-spacing:-.3px;line-height:1.25;margin:4px 0 18px}
.card{background:var(--surface);border-radius:18px;padding:18px}
.eyebrow{font-size:13px;color:var(--low);font-weight:600}
.meta{font-size:14px;color:var(--mid)}
.btn{display:flex;align-items:center;justify-content:center;gap:8px;height:52px;border-radius:14px;background:var(--navy);color:var(--onNavy);font-weight:700;font-size:17px;width:100%}
.btn.sec{background:var(--bg);color:var(--ink);border:1px solid var(--line)}
.btn.ghost{background:transparent;color:var(--navy);height:44px;font-size:16px}
.btn.off{opacity:.45}
.rows{background:var(--surface);border-radius:18px;margin-top:12px}
.row{display:flex;align-items:center;gap:12px;padding:13px 16px;min-height:58px}
.row+.row{border-top:1px solid var(--line)}
.row .t{font-weight:650;font-size:16px}
.row .s{font-size:14px;color:var(--mid)}
.row .x{flex:1;min-width:0}
.tile{width:36px;height:36px;border-radius:10px;background:var(--bg);display:flex;align-items:center;justify-content:center;color:var(--ink);flex-shrink:0}
.dark .tile{background:var(--surface2)}
.bar{height:6px;border-radius:3px;background:var(--surface2);overflow:hidden;flex:1}
.bar>i{display:block;height:100%;background:var(--navy);border-radius:3px}
.tabs{position:absolute;z-index:5;left:0;right:0;bottom:0;height:84px;background:var(--bg);border-top:1px solid var(--line);display:flex;padding:8px 8px 26px}
.tab{flex:1;display:flex;flex-direction:column;align-items:center;gap:3px;font-size:12px;font-weight:650;color:var(--low)}
.tab.on{color:var(--navy)}
.opt{display:flex;align-items:center;gap:12px;background:var(--surface);border-radius:14px;padding:14px 16px;margin-bottom:10px;font-weight:600;font-size:16px;border:2px solid transparent;min-height:56px}
.opt.sel{border-color:var(--navy);background:var(--navySoft)}
.opt.right{border-color:var(--right);background:var(--rightSoft)}
.opt.dim{opacity:.45}
.num{width:28px;height:28px;border-radius:14px;flex-shrink:0;display:flex;align-items:center;justify-content:center;font-size:14px;font-weight:750;background:var(--bg);color:var(--low);border:1.5px solid var(--line)}
.num.on{background:var(--navy);color:var(--onNavy);border-color:var(--navy)}
.feedback{position:absolute;left:0;right:0;bottom:0;padding:16px 16px 30px;border-top:1px solid var(--line);background:var(--bg)}
.fb-head{display:flex;align-items:center;gap:8px;font-weight:750;font-size:18px;margin-bottom:6px}
.fb-right{color:var(--right)}
.fb-near{color:var(--navy)}
.qbar{display:flex;align-items:center;gap:12px;height:56px;padding:0 12px 0 8px}
.sheet{position:absolute;z-index:7;left:0;right:0;bottom:0;background:var(--bg);border-radius:22px 22px 0 0;padding:10px 16px 28px;box-shadow:0 -8px 30px rgba(0,0,0,.12)}
.scrim{position:absolute;z-index:6;inset:0;background:rgba(15,18,22,.42)}
.grab{width:40px;height:5px;border-radius:3px;background:var(--surface2);margin:0 auto 12px}
.label{font-size:14px;color:var(--mid);font-weight:650;margin:0 0 6px}
.fine{font-size:13px;color:var(--low);line-height:1.45}
.switch{width:44px;height:26px;border-radius:13px;background:var(--surface2);position:relative;flex-shrink:0}
.switch::after{content:"";position:absolute;top:3px;left:3px;width:20px;height:20px;border-radius:10px;background:#fff;box-shadow:0 1px 2px rgba(0,0,0,.2)}
.switch.on{background:var(--navy)}
.switch.on::after{left:21px}
.pill{display:inline-flex;align-items:center;gap:6px;border-radius:999px;padding:8px 14px;font-weight:650;font-size:15px;background:var(--surface)}
.pill.on{background:var(--navy);color:var(--onNavy)}
.caption{width:390px;font-size:15px;font-weight:700;color:#1f2328;margin-top:8px}
`;

export const header = (title) => `<div class="top">${title ? `<span style="font-size:18px;font-weight:700">${title}</span>` : `<span class="mark">Northvale</span>`}<span class="grow"></span><span class="chip">${ic("flame", 18, "var(--navy)")}6</span><span class="ask">${ic("chat", 17)}Ask</span></div>`;
const LABELS = { en: ["Learn", "Goals", "Practice", "Me"], es: ["Aprender", "Metas", "Práctica", "Yo"] };
export const tabs = (on, lang = "en") => `<div class="tabs">${["book", "target", "compass", "user"].map((i, k) => `<div class="tab ${k === on ? "on" : ""}">${ic(i, 24)}<span>${LABELS[lang][k]}</span></div>`).join("")}</div>`;
export const row = (icon, t, s, chev = true) => `<div class="row"><span class="tile">${ic(icon, 19)}</span><div class="x"><div class="t">${t}</div>${s ? `<div class="s">${s}</div>` : ""}</div>${chev ? ic("next", 18, "var(--low)") : ""}</div>`;
// The lesson bar: close, progress, Ask, report.
export const qbar = (pct, ask = "Ask") => `<div class="qbar">${ic("close", 22, "var(--low)")}<div class="bar" style="margin:0 6px"><i style="width:${pct}%"></i></div><span class="ask line">${ic("chat", 15)}${ask}</span>${ic("flag", 18, "var(--low)")}</div>`;

// Writes mockups.html and one PNG per screen (plus an overview) into `dir`.
export async function render(dir, title, screens) {
  const html = `<!doctype html><meta charset="utf-8"><title>${title}</title><style>${CSS}</style>${Object.entries(screens).map(([id, h]) => `<div><div id="s-${id}">${h}</div><div class="caption">${id}</div></div>`).join("")}`;
  writeFileSync(join(dir, "mockups.html"), html);
  const browser = await chromium.launch({ channel: "chrome", headless: true });
  const page = await browser.newPage({ viewport: { width: 1800, height: 1000 }, deviceScaleFactor: 2 });
  await page.setContent(html);
  await page.evaluate(() => document.fonts.ready);
  for (const id of Object.keys(screens)) await page.locator(`#s-${id} .phone`).first().screenshot({ path: join(dir, `${id}.png`) });
  await page.screenshot({ path: join(dir, "0-all-screens.png"), fullPage: true });
  await browser.close();
}
