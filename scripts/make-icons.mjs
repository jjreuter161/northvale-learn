// The app icons (web/icon-180.png, -192, -512) drawn from web/icon.svg, so
// they always match it. Re-run after the icon changes:
//   node scripts/make-icons.mjs
import { readFileSync } from "node:fs";
import { join } from "node:path";
import { chromium } from "playwright-core";

const WEB = join(import.meta.dirname, "../web");
const svg = readFileSync(join(WEB, "icon.svg"), "utf8");
const browser = await chromium.launch({ channel: "chrome", headless: true });
try {
  for (const size of [180, 192, 512]) {
    const page = await browser.newPage({ viewport: { width: size, height: size } });
    await page.setContent(`<style>html,body{margin:0;background:transparent}svg{display:block;width:${size}px;height:${size}px}</style>${svg}`);
    await page.screenshot({ path: join(WEB, `icon-${size}.png`), omitBackground: true });
    await page.close();
  }
} finally {
  await browser.close();
}
console.log("icons written: web/icon-180.png, icon-192.png, icon-512.png");
