// The waitlist, on the server: the same age rules as the app (13+, a
// parent's or guardian's OK for 13–17), only the fields the form asks
// for, the hidden bot field and rate limits, "already on the list", the
// confirmation email (English/Spanish, with the take-me-off link), taking
// yourself off with that link, and the admin page's CSV and delete.
import assert from "node:assert/strict";
import { mkdtempSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";

process.env.NORTHVALE_DATA = mkdtempSync(join(tmpdir(), "nvlearn-waitlist-"));
process.env.SMTP_USER = "";
const w = await import("../server/waitlist.js");

const code = async (p) => p.then(() => "no error", (e) => e.code);
const mails = [];
const send = async (m) => mails.push(m);
const ok = { email: "Ana@Example.com ", country: "MX", role: "student", ageBand: "18-25", lang: "es" };
const join_ = (b, ip = "10.0.0.1") => w.join({ ...ok, ...b }, ip, "https://learn.example", send);

// --- the rules ---
assert.equal(await code(join_({ ageBand: "under13" })), "AGE", "under 13: no");
assert.equal(await code(join_({ ageBand: undefined })), "AGE");
assert.equal(await code(join_({ ageBand: "13-17" })), "GUARDIAN", "13–17: a parent's or guardian's OK first");
assert.equal(await code(join_({ email: "not an email" })), "EMAIL");
assert.equal(await code(join_({ country: "FR" })), "COUNTRY");
assert.equal(await code(join_({ role: "admin" })), "ROLE");
const bot = await join_({ website: "http://spam.example", email: "bot@example.com" });
assert.deepEqual(bot, { ok: true }, "the hidden field: a bot gets the same answer…");
assert.equal(w.summary().total, 0, "…and nothing is kept");
console.log("ok: 13+ only, 13–17 with a parent's or guardian's OK, real email, known country and role; the hidden bot field");

// --- signing up ---
const a = await join_({ secret: "x", name: "Ana López", phone: "555" });
assert.equal(a.ok, true);
assert.ok(a.token);
const [entry] = w.summary().latest;
assert.deepEqual(Object.keys(entry).sort(), ["ageBand", "country", "createdAt", "email", "id", "lang", "role"]);
assert.equal(entry.email, "ana@example.com", "emails are cleaned up");
assert.doesNotMatch(JSON.stringify(w.csv()), /Ana López|555/, "only what the form asks is kept");
assert.deepEqual(await join_({ role: "teacher" }), { ok: true, already: true }, "the same email again: already on the list, nothing changes");
assert.equal(w.summary().byRole.student, 1);
const teen = await join_({ email: "teen@example.com", ageBand: "13-17", guardian: true, role: "student", lang: "en", country: "US" });
assert.ok(teen.token);
assert.ok(w.csv().includes('"teen@example.com","US","student","13-17","20'), "for 13–17, when the parent's or guardian's OK was given");
console.log("ok: sign-ups keep only email, country, role, age range (and the OK for 13–17), language and date; the same email twice is \"already on the list\"");

// --- the confirmation email: only once email is set up (here it's printed: "log") ---
assert.equal(mails.length, 2, "one per new sign-up");
assert.equal(mails[0].subject, "Ya estás en la lista de espera de Northvale Learn");
assert.match(mails[0].text, /https:\/\/learn\.example\/bienvenida\?leave=[\w-]+\.[\w-]+/);
assert.match(mails[1].text, /Since you're under 18, make sure a parent or guardian knows/);
process.env.MAIL_POSTAL_ADDRESS = "PO Box 1, Austin, TX";
const t = w.confirmation({ id: "x", lang: "en", role: "teacher", ageBand: "26+" }, "https://learn.example");
assert.match(t.text, /Classroom mode for teachers is being tested now/);
assert.match(t.text, /PO Box 1, Austin, TX$/);
delete process.env.MAIL_POSTAL_ADDRESS;
console.log("ok: a confirmation email in the sign-up's language, with the take-me-off link (and the mailing address once it's set)");

// --- taking yourself off ---
assert.equal(await code(Promise.resolve().then(() => w.leave(a.token.replace(/.$/, (c) => (c === "A" ? "B" : "A")), "10.0.0.2"))), "BAD_LINK");
assert.equal(await code(Promise.resolve().then(() => w.leave(`${w.summary().latest[0].id}.${a.token.split(".")[1]}`, "10.0.0.2"))), "BAD_LINK", "a link only works for its own entry");
w.leave(a.token, "10.0.0.2");
assert.equal(w.summary().total, 1);
assert.deepEqual(w.leave(a.token, "10.0.0.2"), { ok: true }, "again: still fine");
console.log("ok: the take-me-off link works for its own entry only");

// --- rate limits ---
for (let i = 0; i < 10; i++) await join_({ email: `x${i}@example.com` }, "10.9.9.9");
assert.equal(await code(join_({ email: "x99@example.com" }, "10.9.9.9")), "RATE", "10 sign-ups an hour per address");
console.log("ok: sign-ups are rate-limited per address");

// --- the admin page: CSV (formula-safe) and delete ---
await join_({ email: "+cmd@example.com", ageBand: "26+", role: "parent" }, "10.0.0.3");
const csv = w.csv().split("\r\n");
assert.equal(csv[0], '"email","country","role","age_range","guardian_ok_at","language","joined_at"');
assert.ok(csv.some((r) => r.startsWith(`"'+cmd@example.com"`)), "a spreadsheet won't run it as a formula");
const n = w.summary().total;
w.remove(w.summary().latest[0].id);
assert.equal(w.summary().total, n - 1);
console.log("ok: the admin page's CSV export (safe in spreadsheets) and delete");
