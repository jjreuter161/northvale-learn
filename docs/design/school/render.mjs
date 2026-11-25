// Renders mockup.html to PNGs (phone screens in one image, each laptop screen on its own), in English and Spanish.
//   node docs/design/school/render.mjs
import { join } from "node:path";
import { pathToFileURL } from "node:url";
import { chromium } from "playwright-core";

const DIR = import.meta.dirname;
const browser = await chromium.launch({ channel: "chrome", headless: true });
try {
  for (const lang of ["en", "es"]) {
    const page = await browser.newPage({ viewport: { width: 2200, height: 1000 }, deviceScaleFactor: 1 });
    await page.goto(`${pathToFileURL(join(DIR, "mockup.html")).href}#${lang}`);
    await page.evaluate(() => document.fonts.ready);
    await page.locator("#phones").screenshot({ path: join(DIR, `phone-${lang}.png`) });
    const laptops = page.locator("#laptops figure");
    for (let i = 0; i < (await laptops.count()); i++) await laptops.nth(i).screenshot({ path: join(DIR, `laptop-${i + 1}-${lang}.png`) });
    await page.close();
    console.log(`rendered ${lang}`);
  }
} finally {
  await browser.close();
}
