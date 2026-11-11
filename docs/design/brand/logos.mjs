// Three sailboat logo options (proposals, not in the app yet), each as an
// app icon in navy on cream and cream on navy, at small size, and with
// the name. One color each, so they also work printed or engraved.
//   node docs/design/brand/logos.mjs   → docs/design/brand/logos.png + logo-*.svg
import { readFileSync, writeFileSync } from "node:fs";
import { join } from "node:path";
import { chromium } from "playwright-core";

const DIR = import.meta.dirname;
const ROOT = join(DIR, "../../..");
const font = (f) => `data:font/woff2;base64,${readFileSync(join(ROOT, "web/fonts", f)).toString("base64")}`;
const NAVY = "#13315C";
const CREAM = "#F7F2E8";

// Each mark is drawn in a 100×100 box in one color (currentColor).
export const MARKS = {
  a: {
    name: "A · Sloop",
    note: "Two geometric sails over a hull. The clearest at tiny sizes; classic.",
    svg: `<polygon points="47,10 47,70 15,70" fill="currentColor"/><polygon points="53,22 53,70 80,70" fill="currentColor"/><path d="M12 76H88L77 89H23Z" fill="currentColor"/>`,
  },
  b: {
    name: "B · Open water",
    note: "One wind-filled sail drawn in a single line, over a wave. The lightest and most modern; thinner at very small sizes.",
    svg: `<g fill="none" stroke="currentColor" stroke-width="6.5" stroke-linecap="round" stroke-linejoin="round"><path d="M47 12V66"/><path d="M47 12C64 26 70 46 68 66H47"/><path d="M41 24L26 66H41"/><path d="M24 74H72L64 82H32Z"/><path d="M14 92C22 88 30 88 38 92S54 96 62 92 78 88 86 92"/></g>`,
  },
  c: {
    name: "C · North star",
    note: "One sail with a small four-point star above it: navigating by the north star, the “North” in Northvale.",
    svg: `<path d="M50 4L53 13L62 16L53 19L50 28L47 19L38 16L47 13Z" fill="currentColor"/><polygon points="46,32 46,74 20,74" fill="currentColor"/><polygon points="52,42 52,74 74,74" fill="currentColor"/><path d="M14 80H86L76 92H24Z" fill="currentColor"/>`,
  },
};
const mark = (m, color, size) => `<svg width="${size}" height="${size}" viewBox="0 0 100 100" style="color:${color};display:block">${m.svg}</svg>`;
const icon = (m, bg, fg, size) => `<div style="width:${size}px;height:${size}px;border-radius:${size * 0.22}px;background:${bg};display:flex;align-items:center;justify-content:center">${mark(m, fg, size * 0.68)}</div>`;

for (const [k, m] of Object.entries(MARKS)) writeFileSync(join(DIR, `logo-${k}.svg`), `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100" color="${NAVY}">${m.svg}</svg>\n`);

const row = ([k, m]) => `<section>
  <h2>${m.name}</h2><p>${m.note}</p>
  <div class="row">
    ${icon(m, NAVY, CREAM, 180)}${icon(m, CREAM, NAVY, 180)}
    <div class="small">${icon(m, NAVY, CREAM, 48)}${icon(m, CREAM, NAVY, 48)}${icon(m, NAVY, CREAM, 29)}${icon(m, CREAM, NAVY, 29)}<span>${mark(m, NAVY, 20)}</span></div>
    <div class="lockup" style="background:${CREAM};color:${NAVY}">${mark(m, NAVY, 64)}<div><div class="w">Northvale</div><div class="l">LEARN · FIND YOUR OPEN WATER</div></div></div>
    <div class="lockup" style="background:${NAVY};color:${CREAM}">${mark(m, CREAM, 64)}<div><div class="w">Northvale</div><div class="l">LEARN · FIND YOUR OPEN WATER</div></div></div>
  </div></section>`;
const html = `<!doctype html><meta charset="utf-8"><style>
@font-face{font-family:Inter;font-weight:100 900;src:url(${font("inter-latin-wght-normal.woff2")})}
@font-face{font-family:Garamond;font-weight:600 700;src:url(${font("eb-garamond-latin-600-normal.woff2")})}
body{margin:0;padding:28px;background:#E9E3D6;font-family:Inter,sans-serif;color:#22303F;width:1500px}
h1{font-size:26px;margin:0 0 6px}h2{font-size:20px;margin:0 0 2px;color:${NAVY}}p{margin:0 0 14px;color:#4C5866}
section{background:#FFFDF8;border-radius:20px;padding:22px;margin-top:18px}
.row{display:flex;align-items:center;gap:22px}
.small{display:flex;align-items:center;gap:12px;padding:0 6px}
.lockup{display:flex;align-items:center;gap:14px;padding:22px 26px;border-radius:16px}
.w{font-family:Garamond,Georgia,serif;font-weight:650;font-size:40px;letter-spacing:-.4px;line-height:1}
.l{font-size:11px;font-weight:700;letter-spacing:2.4px;margin-top:6px;opacity:.8}
</style><h1>Northvale Learn — three sailboat logo options (proposals)</h1><p>App icon in navy on cream and cream on navy, at 180, 48 and 29 px (the smallest phone icon), one color at 20 px, and with the name and tagline.</p>${Object.entries(MARKS).map(row).join("")}`;
const browser = await chromium.launch({ channel: "chrome", headless: true });
const page = await browser.newPage({ viewport: { width: 1556, height: 900 }, deviceScaleFactor: 2 });
await page.setContent(html);
await page.evaluate(() => document.fonts.ready);
await page.screenshot({ path: join(DIR, "logos.png"), fullPage: true });
await browser.close();
console.log("logos.png and logo-a/b/c.svg written");
