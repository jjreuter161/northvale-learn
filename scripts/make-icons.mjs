// The app icons (web/icon-180.png, -192, -512, -maskable-512) drawn from web/icon.svg, so
// they always match it. Re-run after the icon changes:
//   node scripts/make-icons.mjs
import { readFileSync } from "node:fs";
import { join } from "node:path";
import { chromium } from "playwright-core";

const WEB = join(import.meta.dirname, "../web");
const svg = readFileSync(join(WEB, "icon.svg"), "utf8");
const browser = await chromium.launch({ channel: "chrome", headless: true });
try {
  // The phone's own shape goes on the Apple icon and the "maskable" one, so
  // they're square to the edges (iOS fills see-through corners with black).
  const square = svg.replace(/ rx="\d+"/, "");
  for (const [name, size, art] of [["icon-180", 180, square], ["icon-192", 192, svg], ["icon-512", 512, svg], ["icon-maskable-512", 512, square]]) {
    const page = await browser.newPage({ viewport: { width: size, height: size } });
    await page.setContent(`<style>html,body{margin:0;background:transparent}svg{display:block;width:${size}px;height:${size}px}</style>${art}`);
    await page.screenshot({ path: join(WEB, `${name}.png`), omitBackground: true });
    await page.close();
  }
} finally {
  await browser.close();
}
console.log("icons written: web/icon-180.png, icon-192.png, icon-512.png, icon-maskable-512.png");
