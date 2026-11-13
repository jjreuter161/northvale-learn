// The marketing kit (docs/marketing): the QR code encoder, the facts in the flyer and one-pager (they match the app),
// English and Spanish saying the same things, no made-up claims in anything meant to be published, the PDFs
// (one page each, built from the current words), and the plan, script and teacher message.
import assert from "node:assert/strict";
import { existsSync, readFileSync, statSync } from "node:fs";
import { join } from "node:path";
import { chromium } from "playwright-core";
import { COPY, PROMISE } from "../docs/marketing/content.mjs";
import { aboutHtml, fingerprint, flyerHtml, readBack } from "../docs/marketing/build.mjs";
import { qrMatrix, qrSvg } from "../docs/marketing/lib/qr.mjs";
import { UNITS } from "../src/modules/lessons/units/all.js";

const ROOT = join(import.meta.dirname, "..");
const MK = join(ROOT, "docs", "marketing");
const read = (p) => readFileSync(join(ROOT, p), "utf8");
const lessons = UNITS.reduce((n, u) => n + u.lessons.length, 0);

// --- the QR encoder: sizes, finder patterns, and (on a Mac) the Mac's own reader says what we put in ---
for (const [text, size] of [["A", 21], ["x".repeat(14), 21], ["x".repeat(15), 25], ["https://northvale-learn.fly.dev/welcome", 29], ["x".repeat(106), 41]]) {
  const m = qrMatrix(text);
  assert.equal(m.length, size, `${text.length} bytes → ${size} modules`);
  for (const [x, y] of [[0, 0], [size - 7, 0], [0, size - 7]]) {
    assert.ok(m[y][x] && m[y + 3][x + 3] && !m[y + 1][x + 1] && m[y][x + 6] && m[y + 6][x + 6], "finder pattern");
  }
}
assert.throws(() => qrMatrix("x".repeat(107)), /too long/);
assert.notEqual(qrSvg("https://a.example/x"), qrSvg("https://a.example/y"));
const browser = await chromium.launch({ channel: "chrome", headless: true });
const page = await browser.newPage();
const BASE = "https://learn.example.org";
let decoded = 0;
for (const text of [`${BASE}/welcome`, `${BASE}/bienvenida`, "A", "https://northvale-learn.fly.dev/bienvenida", "x".repeat(97), "ñandú → 123"]) {
  const got = await readBack(page, qrSvg(text, { dark: "#1B3560", light: "#fff" }));
  if (got === null) break;
  assert.equal(got, text, "the Mac's QR reader should read back exactly what was encoded");
  decoded++;
}
console.log(decoded ? `ok: the QR encoder: sizes and finder patterns, and ${decoded} codes read back by this Mac's own QR reader` : "ok: the QR encoder: sizes and finder patterns (read-back skipped: it needs a Mac)");

// --- English and Spanish say the same things, and the facts match the app ---
const shape = (x) => (Array.isArray(x) ? x.map(shape) : x && typeof x === "object" ? Object.fromEntries(Object.keys(x).map((k) => [k, shape(x[k])])) : "s");
assert.deepEqual(shape({ ...COPY.en, lang: 0, page: 0 }), shape({ ...COPY.es, lang: 0, page: 0 }), "English and Spanish have the same parts");
assert.deepEqual(Object.keys(PROMISE).sort(), ["en", "es"]);
const strings = (x) => (typeof x === "string" ? [x] : Object.values(x).flatMap(strings));
for (const lang of ["en", "es"]) {
  const all = strings(COPY[lang]).join("\n");
  for (const m of all.matchAll(/(\d+) (?:short )?(?:lessons|lecciones(?: cortas)?)/g)) assert.equal(Number(m[1]), lessons, `${lang}: ${m[0]} should be ${lessons}`);
  for (const m of all.matchAll(/(\d+) (?:units|unidades)/g)) assert.equal(Number(m[1]), UNITS.length, `${lang}: ${m[0]} should be ${UNITS.length}`);
  assert.ok(/63/.test(all) && /18/.test(all), "the lesson and unit counts are on the sheets");
}
assert.equal(lessons, 63);
assert.equal(UNITS.length, 18);
// The landing pages say the same numbers and carry the same promise and tagline.
for (const [file, lang] of [["web/welcome.html", "en"], ["web/bienvenida.html", "es"]]) {
  const html = read(file);
  assert.ok(html.includes(PROMISE[lang]), `${file}: the promise, word for word`);
  assert.ok(html.includes(`<p class="tagline">${COPY[lang].tagline}</p>`), `${file}: the tagline`);
  assert.ok(html.includes(COPY[lang].h1.replace(/\.$/, "")), `${file}: the one clear line`);
  assert.ok(new RegExp(`${lessons} (short )?(lessons|lecciones cortas) (in|en) ${UNITS.length} (units|unidades)`).test(html), `${file}: the lesson and unit counts`);
  assert.match(html, /Ciudad Juárez/, `${file}: names the border cities`);
  assert.match(html, /id="built"/, `${file}: has the "built by a student" section`);
  assert.match(html, /id="border"/, `${file}: has the section for the border and for everyone`);
}
assert.match(read("web/welcome.html"), /<h2 id="built">Built by a student, for students<\/h2>/);
assert.match(read("web/bienvenida.html"), /<h2 id="built">Hecha por un estudiante, para estudiantes<\/h2>/);
console.log("ok: English and Spanish match, and the lesson and unit counts, the promise and the tagline match the app and the landing pages");

// --- no made-up claims in anything meant to be published ---
const BANNED = [
  [/\b\d[\d,.]*\+?\s*(users|students|learners|downloads|teachers|schools|members|families|sign-?ups|estudiantes|usuarios|descargas|docentes|escuelas|familias)\b/i, "a count of people"],
  [/\b(trusted by|loved by|thousands of|millions of|hundreds of|miles de|millones de|cientos de|confiad[ao] por|querid[ao] por)\b/i, "a crowd claim"],
  [/(?:^|\s)#1\b|\b(award|premiad[ao]|guarantee[ds]?|garantiz|number one|número uno|best[- ]in|the best|the only|la mejor|la única|as seen (on|in)|5[- ]star|rated)\b/i, "a claim that can't be shown"],
  [/\b(you'll (save|earn|make)|ahorrarás|ganarás ?\$?\d|get rich|hazte rico)\b/i, "a promise of results"],
  [/“[^”]{12,}”\s*[—-]/, "a quote with a byline (testimonial)"],
];
const social = readFileSync(join(MK, "social-plan.md"), "utf8");
const video = readFileSync(join(MK, "video-script.md"), "utf8");
const teacher = readFileSync(join(MK, "teacher-message.md"), "utf8");
const landing = ["web/welcome.html", "web/bienvenida.html"].flatMap((f) => [...read(f).matchAll(/<(?:h1|h2|h3|p|li|span)[^>]*>([^<]+)</g)].map((m) => m[1]));
const publishable = [
  ...strings(COPY),
  ...landing,
  ...[...social.matchAll(/^- \*\*Caption \((?:EN|ES)\):\*\* (.+)$/gm)].map((m) => m[1]),
  ...[...social.matchAll(/^\*\*(?:English|Español):\*\* (.+)$/gm)].map((m) => m[1]),
  ...[...video.matchAll(/^\| 0:\d\d–0:\d\d \|[^|]*\|([^|]*)\|([^|]*)\|([^|]*)\|$/gm)].flatMap((m) => m.slice(1)),
  ...teacher.split(/\n---\n/).slice(1, 4).filter((b) => /\*\*(Subject|Asunto|English|Español):\*\*|^Hi |^Hola/m.test(b)),
];
assert.ok(publishable.length > 80, `found the publishable text (${publishable.length} pieces)`);
for (const text of publishable) for (const [re, what] of BANNED) assert.ok(!re.test(text), `${what} in: ${text.slice(0, 90)}`);
console.log(`ok: no made-up claims in ${publishable.length} pieces of publishable text (counts of people, crowd claims, "the best", promised results, testimonials)`);

// --- the social plan, the script, the teacher message ---
const posts = [...social.matchAll(/^### (\d+)\. (.+)$/gm)];
assert.deepEqual(posts.map((m) => Number(m[1])), Array.from({ length: 15 }, (_, i) => i + 1), "15 posts, numbered");
const sections = social.split(/^### \d+\. .+$/m).slice(1);
sections.forEach((s, i) => {
  assert.match(s, /^- \*\*Caption \(EN\):\*\* .{40,}$/m, `post ${i + 1}: an English caption`);
  assert.match(s, /^- \*\*Caption \(ES\):\*\* .{40,}$/m, `post ${i + 1}: a Spanish caption`);
  assert.match(s, /^- \*\*Check first:\*\* .+$/m, `post ${i + 1}: what to check before posting`);
  assert.match(s, /^- \*\*(Picture|Clip|Picture or clip):\*\* .+$/m, `post ${i + 1}: the picture or clip`);
});
for (const h of ["Money myths (4 posts)", "Border money tips (4 posts)", '"Explain this" examples (4 posts)', "App moments (3 posts)"]) assert.ok(social.includes(h), h);
assert.ok(social.includes("@northvalelearn"));
const rows = [...video.matchAll(/^\| (\d):(\d\d)–(\d):(\d\d) \|[^|]*\|([^|]*)\|([^|]*)\|/gm)];
assert.ok(rows.length >= 6, "the script has its beats");
assert.equal(rows[0][1] + rows[0][2], "000", "starts at 0:00");
const end = Number(rows.at(-1)[3]) * 60 + Number(rows.at(-1)[4]);
assert.ok(end >= 30 && end <= 60, `the script runs ${end} seconds (30–60)`);
for (const [i, name] of [[5, "English"], [6, "Spanish"]]) {
  const words = rows.flatMap((r) => r[i].trim().split(/\s+/)).length;
  assert.ok(words >= 60 && words <= end * 2.4, `${name} voice-over is ${words} words for ${end} seconds`);
}
assert.match(teacher, /## English[\s\S]*## Español/);
assert.match(teacher, /\[Teacher's name\][\s\S]*\[Nombre de la maestra o el maestro\]/);
assert.match(teacher, /classroom mode is a test|Classroom mode is a test|small beta/i);
assert.ok(!/@|https?:\/\//.test(teacher.replace(/\[link\]/g, "")), "no addresses or emails baked in (they're brackets for you to fill)");
for (const f of ["README.md", "teacher-message.md", "social-plan.md", "video-script.md"]) assert.ok(existsSync(join(MK, f)), f);
console.log("ok: 15 posts (4 myths, 4 border tips, 4 “Explain this”, 3 app moments) each with English and Spanish captions and a check; a video script of " + end + " seconds; a teacher message in both languages");

// --- the PDFs: there, one page each, built from the current words, QR codes pointing at the landing pages ---
const built = JSON.parse(readFileSync(join(MK, "pdf", "build.json"), "utf8"));
assert.match(built.url, /^https:\/\/[^/\s]+$/);
assert.equal(built.fingerprint, fingerprint(built.url), "the words or layout changed since the PDFs were made: run node docs/marketing/build.mjs");
for (const f of ["flyer-en", "flyer-es", "about-en", "about-es"]) {
  const file = join(MK, "pdf", `${f}.pdf`);
  assert.ok(existsSync(file), `${f}.pdf`);
  const buf = readFileSync(file);
  assert.equal(buf.subarray(0, 5).toString(), "%PDF-");
  assert.equal((buf.toString("latin1").match(/\/Type\s*\/Page\b/g) || []).length, 1, `${f}.pdf is one page`);
  assert.ok(statSync(file).size > 20_000 && statSync(file).size < 600_000, `${f}.pdf is a sensible size`);
}
for (const lang of ["en", "es"]) {
  assert.ok(existsSync(join(MK, "pdf", `qr-${lang}.svg`)));
  for (const html of [flyerHtml(lang, built.url), aboutHtml(lang, built.url)]) {
    assert.ok(html.includes(`${built.url.replace(/^https:\/\//, "")}/${COPY[lang].page}`), `${lang}: the address under the QR code`);
    assert.ok(!/\[[^\]]+\]|undefined|NaN|\{[@$]/.test(html.replace(/<style>[\s\S]*?<\/style>/, "").replace(/<svg[\s\S]*?<\/svg>/g, "")), `${lang}: no placeholders or broken text`);
  }
}
// The flyer and one-pager fit on one page in a real browser, in both languages.
for (const lang of ["en", "es"]) for (const make of [flyerHtml, aboutHtml]) {
  await page.setContent(make(lang, built.url).replace(/url\(file:[^)]*\)/g, "url(about:blank)"));
  await page.emulateMedia({ media: "print" });
  const over = await page.evaluate(() => { const p = document.querySelector(".page"); return p.scrollHeight - p.clientHeight; });
  assert.ok(over <= 1, `${make.name} (${lang}) runs ${over}px past the page`);
}
await browser.close();
console.log(`ok: four PDFs (flyer and about, English and Spanish), one page each, made from the current words; the QR codes point at ${built.url}`);
