// Lays the screens from before the redesign next to the same screens after it, as contact sheets.
//   node docs/design/redesign/before-after.mjs <before folder> <after folder> <output folder>
// Each folder is what shots.mjs writes (it has phone/ and laptop/ inside). A screen is matched by its file name.
// Nothing here changes the app.
import { chromium } from "playwright-core";
import { existsSync, mkdirSync, mkdtempSync, readdirSync, writeFileSync } from "node:fs";
import { basename, join } from "node:path";
import { tmpdir } from "node:os";
import { pathToFileURL } from "node:url";

const [before, after, out] = process.argv.slice(2);
if (!before || !after || !out) throw new Error("usage: before-after.mjs <before folder> <after folder> <output folder>");
mkdirSync(out, { recursive: true });

// The main screens, in the order a person meets them (a file name, minus its number).
const MAIN = {
  phone: ["welcome", "warmup-question", "goal-pick", "l1-card", "l1-question-choice", "l1-picked", "l1-feedback", "l1-question-number", "l1-handson", "l1-finish", "today-after-lesson-1", "learn", "goals", "practice", "me", "settings", "ask-open", "year-first-month", "not-found", "learn-navy", "navy-question-choice", "navy-feedback", "aprende", "metas", "yo"],
  laptop: ["welcome", "l1-card", "l1-question-choice", "l1-feedback", "l1-finish", "today-after-lesson-1", "learn", "goals", "practice", "me", "settings", "ask-open", "learn-navy", "navy-question-choice", "aprende", "metas", "yo"],
};
const key = (f) => basename(f, ".png").replace(/^[a-z]-\d+-/, "");

const browser = await chromium.launch({ channel: "chrome", headless: true });
for (const size of ["phone", "laptop"]) {
  const dirs = [join(before, size), join(after, size)];
  if (!dirs.every(existsSync)) continue;
  const index = (d) => Object.fromEntries(readdirSync(d).filter((f) => f.endsWith(".png")).map((f) => [key(f), join(d, f)]));
  const [b, a] = dirs.map(index);
  const names = MAIN[size].filter((n) => b[n] && a[n]);
  const cell = size === "phone" ? 250 : 520;
  const cols = size === "phone" ? 2 : 1;
  const pair = (n) => `<div class="pair"><div class="c"><img src="${pathToFileURL(b[n]).href}"><div>Before</div></div><div class="c"><img src="${pathToFileURL(a[n]).href}"><div>After</div></div><div class="n">${n}</div></div>`;
  // Several sheets so each stays readable: six pairs on a phone sheet, three on a laptop sheet.
  const per = size === "phone" ? 6 : 4;
  for (let i = 0; i * per < names.length; i++) {
    const html = `<!doctype html><meta charset="utf-8"><style>
body{margin:0;padding:14px;background:#d9d4c8;font:12px/1.3 Inter,system-ui,sans-serif;color:#1B3560}
.g{display:grid;grid-template-columns:repeat(${cols},auto);gap:18px;justify-content:start}
.pair{display:flex;gap:8px;flex-wrap:wrap;align-items:start;position:relative}.c{width:${cell}px}.c img{width:100%;display:block;border-radius:6px;box-shadow:0 1px 4px rgba(0,0,0,.35)}.c div{margin-top:4px;font-weight:600}
.n{width:100%;order:3;color:#46576f}
</style><div class="g">${names.slice(i * per, (i + 1) * per).map(pair).join("")}</div>`;
    const file = join(mkdtempSync(join(tmpdir(), "nvl-ba-")), "sheet.html");
    writeFileSync(file, html);
    const p = await browser.newPage({ viewport: { width: size === "phone" ? 3 * (2 * cell + 26) + 28 : 2 * cell + 60, height: 400 } });
    await p.goto(pathToFileURL(file).href);
    await p.waitForLoadState("load");
    await p.waitForTimeout(300);
    await p.screenshot({ path: join(out, `before-after-${size}-${i + 1}.jpg`), type: "jpeg", quality: 82, fullPage: true });
    await p.close();
  }
  console.log(`${size}: ${names.length} screens in ${Math.ceil(names.length / per)} sheets`);
}
await browser.close();
