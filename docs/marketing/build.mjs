// Makes the print-ready PDFs in docs/marketing/pdf/: a one-page flyer and a one-page "about" sheet, each in English and
// Spanish, with a QR code that opens the landing page. The words are in content.mjs.
//
//   node docs/marketing/build.mjs                          uses PUBLIC_URL from .env, else https://<app>.fly.dev from fly.toml
//   node docs/marketing/build.mjs --url https://example.org   the address to put in the QR code (https, no slash at the end)
//
// It needs Chrome (the same one the tests use). On a Mac it also reads each QR code back with the Mac's own reader
// (verify-qr.swift) and stops if the code doesn't say what it should. Rebuild whenever the web address changes.
import { chromium } from "playwright-core";
import { createHash } from "node:crypto";
import { spawnSync } from "node:child_process";
import { existsSync, mkdirSync, mkdtempSync, readFileSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { dirname, join } from "node:path";
import { fileURLToPath, pathToFileURL } from "node:url";
import { COPY, PROMISE } from "./content.mjs";
import { qrSvg } from "./lib/qr.mjs";

const HERE = dirname(fileURLToPath(import.meta.url));
const ROOT = join(HERE, "..", "..");
const FONTS = pathToFileURL(join(ROOT, "web", "fonts")).href;
const NAVY = "#1B3560", CREAM = "#F7F2E8", RED = "#C8202A";

const esc = (s) => String(s).replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");

export function baseUrl(argv = process.argv) {
  const i = argv.indexOf("--url");
  let url = i > -1 ? argv[i + 1] : process.env.PUBLIC_URL;
  if (!url && existsSync(join(ROOT, ".env"))) url = /^PUBLIC_URL=(\S+)/m.exec(readFileSync(join(ROOT, ".env"), "utf8"))?.[1];
  if (!url) url = `https://${/^app\s*=\s*"([^"]+)"/m.exec(readFileSync(join(ROOT, "fly.toml"), "utf8"))[1]}.fly.dev`;
  url = url.replace(/^["']|["']$/g, "");
  if (!/^https:\/\/[^/\s]+$/.test(url)) throw new Error(`The web address should look like https://example.org (https, no slash at the end), not "${url}".`);
  return url;
}

const pageUrl = (lang, base) => `${base}/${COPY[lang].page}`;
const qr = (lang, base) => qrSvg(pageUrl(lang, base), { scale: 8, dark: NAVY, light: "#fff" });
const shown = (lang, base) => pageUrl(lang, base).replace(/^https:\/\//, "");

const LOGO = `<svg class="logo" viewBox="0 0 512 512" aria-hidden="true"><rect width="512" height="512" rx="112" fill="${NAVY}"/><g transform="translate(82 89) scale(3.48)" fill="${CREAM}"><path d="M50 4L53 13L62 16L53 19L50 28L47 19L38 16L47 13Z"/><path d="M46 32V74H20Z"/><path d="M52 42V74H74Z"/><path d="M14 80H86L76 92H24Z"/></g></svg>`;

const CSS = `
@font-face { font-family: "Inter"; font-weight: 100 900; src: url(${FONTS}/inter-latin-wght-normal.woff2) format("woff2"); }
@font-face { font-family: "Inter"; font-weight: 100 900; src: url(${FONTS}/inter-latin-ext-wght-normal.woff2) format("woff2"); unicode-range: U+0100-02AF, U+1E00-1EFF, U+2020, U+20A0-20AB, U+20AD-20CF, U+2113, U+2C60-2C7F, U+A720-A7FF; }
@font-face { font-family: "EB Garamond"; font-weight: 600 700; src: url(${FONTS}/eb-garamond-latin-600-normal.woff2) format("woff2"); }
@page { size: 8.5in 11in; margin: 0 }
* { box-sizing: border-box }
html, body { margin: 0; -webkit-print-color-adjust: exact; print-color-adjust: exact }
body { color: ${NAVY}; font: 15px/1.45 Inter, system-ui, sans-serif }
.page { width: 8.5in; height: 11in; padding: .5in; display: flex; flex-direction: column; gap: 18px; background: #fff; overflow: hidden }
header { display: flex; align-items: center; gap: 12px }
.logo { width: 46px; height: 46px; flex-shrink: 0 }
.word { font: 650 32px/1 "EB Garamond", Georgia, serif; letter-spacing: -.3px }
.pill { margin-left: auto; font-weight: 650; font-size: 13px; background: #EFE7D8; border-radius: 99px; padding: 6px 14px }
h1, h2, h3, p, ul { margin: 0 }
h1, .promise, .teachers { text-wrap: balance }
.hero { background: ${NAVY}; color: ${CREAM}; border-radius: 22px; padding: 34px 36px }
.hero h1 { font: 800 37px/1.08 Inter, sans-serif; letter-spacing: -1px; margin-bottom: 14px }
.hero .tag { font: 650 27px/1.1 "EB Garamond", Georgia, serif }
.mid { display: grid; grid-template-columns: 1fr 270px; gap: 30px; flex: 1; min-height: 0; align-items: center }
.points { list-style: none; padding: 0; display: grid; gap: 26px; align-content: center; font-size: 16.5px }
.points li { position: relative; padding-left: 28px }
.points li::before { content: ""; position: absolute; left: 0; top: 8px; width: 13px; height: 13px; border-radius: 50%; background: ${RED} }
.points b { display: block; font-size: 21px; margin-bottom: 3px; letter-spacing: -.3px }
.points span { color: #3e5376 }
.scan { background: ${CREAM}; border: 1px solid #E3D9C6; border-radius: 20px; padding: 16px; text-align: center }
.scan .code { background: #fff; border-radius: 12px; padding: 4px }
.scan svg { width: 100%; height: auto; display: block }
.cta { background: ${RED}; color: ${CREAM}; font-weight: 700; border-radius: 12px; padding: 11px 8px; margin-top: 12px; font-size: 15.5px; line-height: 1.25 }
.url { font-weight: 650; margin-top: 9px; font-size: 13px; word-break: break-all }
.promise { background: ${CREAM}; border-left: 6px solid ${RED}; padding: 14px 18px; border-radius: 10px; font-size: 17.5px; font-weight: 700 }
.teachers { font-size: 14px; color: #3e5376; text-align: center }
footer { display: flex; flex-direction: column; gap: 2px; font-size: 12px; color: #546683; border-top: 1px solid #E3D9C6; padding-top: 10px }
footer b { color: ${NAVY} }
`;

const ABOUT_CSS = `
.about { gap: 10px; font-size: 12.3px; line-height: 1.4 }
.about h1 { font: 800 27px/1.1 Inter, sans-serif; letter-spacing: -.8px }
.about .lead { font-size: 14px; color: #3e5376; max-width: 7in }
.cols { columns: 2; column-gap: 26px }
.cols > section { break-inside: avoid; margin-bottom: 13px }
.about h2 { font: 700 15px/1.2 Inter, sans-serif; letter-spacing: -.1px; margin-bottom: 4px }
.about ul { padding-left: 17px }
.about li { margin-bottom: 4px }
.about li::marker { color: ${RED} }
.about .promise { font-size: 15px; font-weight: 700 }
.about .promise h2 { font-size: 12px; letter-spacing: 1.2px; text-transform: uppercase; color: ${RED}; margin-bottom: 4px }
.about .promise small { display: block; margin-top: 6px; font: 500 12px/1.35 Inter, sans-serif; color: #3e5376 }
.bottom { margin-top: auto; display: grid; grid-template-columns: 1fr 220px; gap: 22px; align-items: center; background: ${CREAM}; border: 1px solid #E3D9C6; border-radius: 18px; padding: 12px 16px }
.glance { display: grid; grid-template-columns: auto 1fr; gap: 5px 14px; margin: 0 }
.glance dt { font-weight: 700 }
.glance dd { margin: 0 }
.bottom .scan { background: none; border: 0; padding: 0 }
.bottom .code { max-width: 150px; margin: 0 auto }
.bottom .cta { background: none; color: ${NAVY}; font-size: 12px; padding: 0; margin-top: 6px }
.bottom .url { font-size: 10.5px; white-space: nowrap }
`;

function doc(title, css, body, lang) {
  return `<!doctype html><html lang="${lang}"><head><meta charset="utf-8"><title>${esc(title)}</title><style>${CSS}${css}</style></head><body>${body}</body></html>`;
}

export function flyerHtml(lang, base) {
  const c = COPY[lang];
  return doc(`Northvale Learn: ${c.tagline}`, "", `<div class="page">
  <header>${LOGO}<span class="word">Northvale Learn</span><span class="pill">${esc(c.pill)}</span></header>
  <section class="hero"><h1>${esc(c.h1)}</h1><p class="tag">${esc(c.tagline)}</p></section>
  <section class="mid">
    <ul class="points">${c.points.map(([h, p]) => `<li><b>${esc(h)}</b><span>${esc(p)}</span></li>`).join("")}</ul>
    <aside class="scan"><div class="code">${qr(lang, base)}</div><p class="cta">${esc(c.scan)}</p><p class="url">${esc(shown(lang, base))}</p></aside>
  </section>
  <p class="promise">${esc(PROMISE[lang])}</p>
  <p class="teachers">${esc(c.teachers)}</p>
  <footer><span><b>${esc(c.built)}</b></span><span>${esc(c.fine)}</span></footer>
</div>`, lang);
}

export function aboutHtml(lang, base) {
  const c = COPY[lang], a = c.about;
  const bullets = (items) => `<ul>${items.map((t) => `<li>${esc(t)}</li>`).join("")}</ul>`;
  const bold = (items) => `<ul>${items.map(([b, t]) => `<li><b>${esc(b)}</b> ${esc(t)}</li>`).join("")}</ul>`;
  return doc(a.title, ABOUT_CSS, `<div class="page about">
  <header>${LOGO}<span class="word">Northvale Learn</span><span class="pill">${esc(c.pill)}</span></header>
  <h1>${esc(a.title)}</h1>
  <p class="lead">${esc(a.lead)}</p>
  <div class="cols">
    <section><h2>${esc(a.what[0])}</h2><p>${esc(a.what[1])}</p></section>
    <section><h2>${esc(a.who[0])}</h2>${bullets(a.who[1])}</section>
    <section><h2>${esc(a.why[0])}</h2>${bold(a.why[1])}</section>
    <section class="promise"><h2>${esc(a.promiseTitle)}</h2><p>${esc(PROMISE[lang])}</p><small>${esc(a.promiseNote)}</small></section>
    <section><h2>${esc(a.isnt[0])}</h2>${bullets(a.isnt[1])}</section>
    <section><h2>${esc(a.teachers[0])}</h2><p>${esc(a.teachers[1])}</p></section>
    <section><h2>${esc(a.story[0])}</h2><p>${esc(a.story[1])}</p></section>
  </div>
  <section class="bottom">
    <div><h2>${esc(a.glance[0])}</h2><dl class="glance">${a.glance[1].map(([k, v]) => `<dt>${esc(k)}</dt><dd>${esc(v)}</dd>`).join("")}</dl></div>
    <aside class="scan"><div class="code">${qr(lang, base)}</div><p class="cta">${esc(a.scan)}</p><p class="url">${esc(shown(lang, base))}</p></aside>
  </section>
  <footer><span>${esc(a.fine)}</span></footer>
</div>`, lang);
}

// A fingerprint of everything that goes into the four PDFs. build.mjs saves it in pdf/build.json; test/marketing.test.mjs
// and `npm run preflight` compare it, so a change to the words, the layout or the address without a rebuild is caught.
export function fingerprint(base) {
  const h = createHash("sha256");
  for (const lang of ["en", "es"]) h.update(flyerHtml(lang, base).replaceAll(FONTS, "fonts")).update(aboutHtml(lang, base).replaceAll(FONTS, "fonts")); // (not the folder it sits in)
  return h.digest("hex");
}

// Reads a QR code back with the Mac's own detector (Mac only). Returns what it says, or null where it can't check.
export async function readBack(page, svg) {
  if (process.platform !== "darwin" || spawnSync("swift", ["--version"], { stdio: "ignore" }).status !== 0) return null;
  await page.setContent(`<body style="margin:0;background:#fff">${svg.replace(/width="\d+" height="\d+"/, 'width="400" height="400"')}</body>`);
  const file = join(mkdtempSync(join(tmpdir(), "nv-qr-")), "qr.png");
  await page.screenshot({ path: file, clip: { x: 0, y: 0, width: 400, height: 400 } });
  return spawnSync("swift", [join(HERE, "verify-qr.swift"), file], { encoding: "utf8" }).stdout.trim();
}

if (import.meta.url === pathToFileURL(process.argv[1] || "").href) {
  const base = baseUrl();
  const out = join(HERE, "pdf");
  mkdirSync(out, { recursive: true });
  const work = mkdtempSync(join(tmpdir(), "nv-marketing-"));
  const browser = await chromium.launch({ channel: "chrome", headless: true });
  const page = await browser.newPage();
  let checked = 0;
  for (const lang of ["en", "es"]) {
    const got = await readBack(page, qr(lang, base));
    if (got !== null) {
      if (got !== pageUrl(lang, base)) throw new Error(`The ${lang} QR code reads back as "${got}", not "${pageUrl(lang, base)}". Not writing PDFs.`);
      checked++;
    }
    writeFileSync(join(out, `qr-${lang}.svg`), qr(lang, base) + "\n");
    for (const [kind, make] of [["flyer", flyerHtml], ["about", aboutHtml]]) {
      const file = join(work, `${kind}-${lang}.html`);
      writeFileSync(file, make(lang, base));
      await page.goto(pathToFileURL(file).href);
      await page.evaluate(() => document.fonts.ready);
      const over = await page.evaluate(() => { const p = document.querySelector(".page"); return p.scrollHeight - p.clientHeight; });
      if (over > 1) throw new Error(`${kind}-${lang}: the text runs ${over}px past the page. Shorten it in content.mjs.`);
      const pdf = await page.pdf({ width: "8.5in", height: "11in", printBackground: true, preferCSSPageSize: true });
      const pages = (pdf.toString("latin1").match(/\/Type\s*\/Page\b/g) || []).length;
      if (pages !== 1) throw new Error(`${kind}-${lang}: came out ${pages} pages, not 1.`);
      writeFileSync(join(out, `${kind}-${lang}.pdf`), pdf);
      console.log(`✓ pdf/${kind}-${lang}.pdf  (${Math.round(pdf.length / 1024)} KB)`);
    }
  }
  await browser.close();
  writeFileSync(join(out, "build.json"), JSON.stringify({ url: base, fingerprint: fingerprint(base) }, null, 2) + "\n");
  console.log(`\nQR codes point to ${pageUrl("en", base)} and ${pageUrl("es", base)}`);
  console.log(checked ? `Both were read back with this Mac's QR reader and say exactly that.` : `Not checked here (the read-back check needs a Mac). Scan a printed copy with two phones before you print many.`);
}
