// Lays screenshots out as one contact sheet (a JPEG), so many screens can be looked at together.
//   node docs/design/redesign/contact.mjs <out.jpg> <columns> <cell width px> <png> [<png> ...]
import { chromium } from "playwright-core";
import { basename, join } from "node:path";
import { mkdtempSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { pathToFileURL } from "node:url";

const [out, cols, cell, ...files] = process.argv.slice(2);
if (!out || !files.length) throw new Error("usage: contact.mjs <out.jpg> <columns> <cell width> <png>...");
const label = (f) => basename(f, ".png").replace(/^[a-z]-\d+-/, "");
const html = `<!doctype html><meta charset="utf-8"><style>
body{margin:0;padding:14px;background:#d9d4c8;font:12px/1.3 Inter,system-ui,sans-serif;color:#1B3560}
.g{display:grid;grid-template-columns:repeat(${Number(cols)},${Number(cell)}px);gap:14px;align-items:start}
.c img{width:100%;display:block;border-radius:6px;box-shadow:0 1px 4px rgba(0,0,0,.35)}.c div{margin-top:4px;word-break:break-word}
</style><div class="g">${files.map((f, i) => `<div class="c"><img src="${pathToFileURL(f).href}"><div>${i + 1}. ${label(f)}</div></div>`).join("")}</div>`;
const b = await chromium.launch({ channel: "chrome", headless: true });
const p = await b.newPage({ viewport: { width: Number(cols) * (Number(cell) + 14) + 14, height: 400 } });
const page = join(mkdtempSync(join(tmpdir(), "nvl-contact-")), "sheet.html");
writeFileSync(page, html);
await p.goto(pathToFileURL(page).href);
await p.waitForLoadState("load");
await p.waitForTimeout(400);
await p.screenshot({ path: out, type: "jpeg", quality: 80, fullPage: true });
await b.close();
