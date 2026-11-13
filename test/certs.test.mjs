// CERTIFICATES without a browser: every unit is in exactly one track (so the
// whole course earns certificates and none twice), every track's text is
// complete in both languages, names are cleaned, and the PDF writer makes a
// well-formed file (its cross-reference table points at each object).
import assert from "node:assert/strict";
import { TRACKS, trackById, lessonsOfTrack } from "../src/modules/certs/tracks.js";
import { UNITS, ALL_LESSONS } from "../src/modules/lessons/content.js";
import { cleanName, cleanCode, adult } from "../server/certs.js";
import { pick } from "../src/core/i18n.js";

// The tracks cover the course once.
const inTracks = TRACKS.flatMap((t) => t.units);
assert.deepEqual([...inTracks].sort(), UNITS.map((u) => u.id).sort(), "every unit is in a track, and in only one");
for (const t of TRACKS) {
  assert.ok(lessonsOfTrack(t, ALL_LESSONS).length >= 3, `${t.id} has lessons`);
  for (const lang of ["en", "es"]) for (const f of ["title", "blurb"]) assert.ok(pick(t[f], lang, "US").trim(), `${t.id} ${f} in ${lang}`);
  assert.equal(trackById(t.id), t);
}
assert.equal(trackById("nope"), null);
assert.deepEqual(TRACKS.map((t) => t.id).slice(0, 3), ["foundations", "protect", "investing"]);
console.log("ok: five certificate tracks cover every unit exactly once, with text in both languages");

// Names and codes.
assert.equal(cleanName("  Ana   María López "), "Ana María López");
assert.equal(cleanName("José O'Neil-Núñez"), "José O'Neil-Núñez");
assert.equal(cleanName("李小龍"), "李小龍");
for (const bad of ["", "A", "Ana2", "a@b.co", "<b>x</b>", "https://x.co", "x".repeat(61), "123", "-Ana"]) assert.equal(cleanName(bad), null, JSON.stringify(bad));
assert.equal(cleanCode("abcd-efgh jk2m"), "ABCDEFGHJK2M");
assert.equal(cleanCode("x".repeat(40)).length, 12);
assert.deepEqual([adult({ ageBand: "18-25" }), adult({ ageBand: "26+" }), adult({ ageBand: "13-17" }), adult({})], [true, true, false, false], "no age given counts as under 18");
console.log("ok: names keep letters, accents and apostrophes but not digits, links or emails; codes ignore case and dashes; no age counts as under 18");

// The PDF: structure and offsets (the browser draws the image; here, fake JPEG bytes).
{
  // The renderer imports the UI (browser code); only the PDF part is tested, so load it with a stand-in.
  const src = (await import("node:fs")).readFileSync(new URL("../src/modules/certs/render.js", import.meta.url), "utf8");
  const body = src.slice(src.indexOf("// A one-page PDF around a JPEG"));
  const { pdfFromJpeg } = await import(`data:text/javascript,${encodeURIComponent(body)}`);
  const jpeg = Uint8Array.from({ length: 500 }, (_, i) => (i * 7) % 256);
  const pdf = pdfFromJpeg(jpeg, 1600, 1131);
  const text = Buffer.from(pdf).toString("latin1");
  assert.equal(text.slice(0, 8), "%PDF-1.4");
  assert.ok(text.trimEnd().endsWith("%%EOF"));
  const start = Number(/startxref\n(\d+)\n%%EOF/.exec(text)[1]);
  assert.equal(text.slice(start, start + 4), "xref", "startxref points at the table");
  const rows = [...text.slice(start).matchAll(/(\d{10}) 00000 n /g)].map((m) => Number(m[1]));
  assert.equal(rows.length, 5);
  rows.forEach((off, i) => assert.equal(text.slice(off, off + `${i + 1} 0 obj`.length), `${i + 1} 0 obj`, `object ${i + 1} is where the table says`));
  assert.ok(Buffer.from(pdf).includes(Buffer.from(jpeg)), "the image bytes are inside");
  assert.match(text, /\/MediaBox \[0 0 842 595\]/, "A4-landscape proportions");
  console.log("ok: the PDF writer makes a one-page file whose table points at every object");
}
