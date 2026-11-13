// Screenshots of a brand-new person's first minute: welcome, the warm-up question, answered, and "what for".
//   node docs/design/easy/first-run.mjs        -> docs/design/easy/first-run-{en,es}-{1..4}.jpg
import { spawn } from "node:child_process";
import { mkdtempSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { chromium } from "playwright-core";

const ROOT = join(import.meta.dirname, "../../..");
const port = 20000 + Math.floor(Math.random() * 20000);
const env = { ...process.env, NORTHVALE_DOTENV: "0", PORT: String(port), NORTHVALE_DATA: mkdtempSync(join(tmpdir(), "nvl-first-")), ANTHROPIC_API_KEY: "" };
const server = spawn(process.execPath, [join(ROOT, "server/index.js")], { env, stdio: ["ignore", "pipe", "inherit"] });
await new Promise((r) => server.stdout.on("data", (d) => String(d).includes("Northvale Learn on") && r()));
const browser = await chromium.launch({ channel: "chrome", headless: true });
try {
  for (const lang of ["en", "es"]) {
    const es = lang === "es";
    const ctx = await browser.newContext({ viewport: { width: 390, height: 800 }, deviceScaleFactor: 1.5, locale: es ? "es-MX" : "en-US", serviceWorkers: "block", reducedMotion: "reduce" });
    const page = await ctx.newPage();
    page.setDefaultTimeout(8000);
    const shot = (n) => page.screenshot({ path: join(import.meta.dirname, `first-run-${lang}-${n}.jpg`), type: "jpeg", quality: 78 });
    await page.goto(`http://127.0.0.1:${port}/`);
    await page.waitForTimeout(700);
    await shot(1);
    await page.getByRole("button", { name: es ? "Empezar" : "Get started", exact: true }).click();
    await page.getByRole("radio").first().waitFor();
    await shot(2);
    await page.getByRole("radio").first().click();
    await page.getByRole("button", { name: es ? "Comprobar" : "Check", exact: true }).click();
    await page.waitForTimeout(500);
    await shot(3);
    await page.getByRole("button", { name: es ? "Continuar" : "Continue", exact: true }).click();
    await page.waitForTimeout(500);
    await shot(4);
    await ctx.close();
  }
  console.log("first-run shots done");
} finally {
  await browser.close();
  server.kill();
}
