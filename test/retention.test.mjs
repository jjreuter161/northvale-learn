// Bringing people back, on the server: push reminders (encryption against
// the RFC 8291 example, the VAPID signature, what to say and when, quiet
// hours, once a day, refusing addresses that aren't push services) and
// the weekly email recap (what's in it, Sunday evening once, stopping when
// someone stopped learning, the "turn off" link).
import assert from "node:assert/strict";
import { mkdtempSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { createPublicKey, verify } from "node:crypto";

process.env.NORTHVALE_DATA = mkdtempSync(join(tmpdir(), "nvlearn-retention-"));
process.env.SMTP_USER = "";
const push = await import("../server/push.js");
const recap = await import("../server/recap.js");
const insights = await import("../server/insights.js");
const { store } = await import("../server/store.js");

// --- encryption: RFC 8291, Appendix A ---
const body = push.encrypt("When I grow up, I want to be a watermelon", { p256dh: "BCVxsr7N_eNgVRqvHtD0zTZsEc6-VV-JvLexhqUzORcxaOzi6-AYWXvTBHm4bjyPjs7Vd8pZGH6SRpkNtoIAiw4", auth: "BTBZMqHH6r4Tts7J_aSIgg" }, { asPrivate: "yfWPiYE-n46HLnH0KqZOF1fJJU3MYrct3AELtAQ-oRw", salt: "DGv6ra1nlYgDCS1FRnbzlw" });
assert.equal(body.toString("base64url"), "DGv6ra1nlYgDCS1FRnbzlwAAEABBBP4z9KsN6nGRTbVYI_c7VJSPQTBtkgcy27mlmlMoZIIgDll6e3vCYLocInmYWAmS6TlzAC8wEqKK6PBru3jl7A_yl95bQpu6cVPTpK4Mqgkf1CXztLVBSt2Ks3oZwbuwXPXLWyouBWLVWGNWQexSgSxsj_Qulcy4a-fN");
console.log("ok: push messages encrypted exactly as RFC 8291's example");

// --- VAPID: signed by this server's key, for that push service ---
const header = push.vapidHeader("https://fcm.googleapis.com/fcm/send/abc", 1_800_000_000_000);
const [, jwt, k] = /^vapid t=([^,]+), k=(.+)$/.exec(header);
const [h, claims, sig] = jwt.split(".");
const raw = Buffer.from(k, "base64url");
const key = createPublicKey({ key: { kty: "EC", crv: "P-256", x: raw.subarray(1, 33).toString("base64url"), y: raw.subarray(33).toString("base64url") }, format: "jwk" });
assert.ok(verify("sha256", Buffer.from(`${h}.${claims}`), { key, dsaEncoding: "ieee-p1363" }, Buffer.from(sig, "base64url")), "signature checks out");
const c = JSON.parse(Buffer.from(claims, "base64url"));
assert.equal(c.aud, "https://fcm.googleapis.com");
assert.equal(c.exp, 1_800_000_000 + 12 * 3600);
assert.equal(k, push.publicKey(), "the same key the app subscribes with");
console.log("ok: VAPID header signed (ES256) for the push service's origin, 12-hour expiry");

// --- what to say ---
const fri = "2026-10-30"; // a Friday
const sun = "2026-11-01";
const base = { lessonDay: "2026-10-28", streak: { count: 5, last: "2026-10-29" }, reviewDue: "2026-10-29", goals: 1, checkIn: null, mission: { title: "Track everything you spend for 3 days", started: null }, missionWeek: null, next: "Needs vs. wants" };
assert.equal(push.pick(base, fri).kind, "streak");
assert.match(push.pick(base, fri).body, /5-day streak/);
assert.match(push.pick(base, fri, "es").body, /racha de 5 días/);
assert.equal(push.pick({ ...base, streak: { count: 0 } }, sun).kind, "checkin", "Sunday: the check-in");
assert.equal(push.pick({ ...base, streak: { count: 0 }, goals: 0 }, sun).kind, "review");
assert.equal(push.pick({ ...base, streak: { count: 0 }, reviewDue: null }, fri).kind, "mission", "Thursday–Saturday: this week's mission");
assert.equal(push.pick({ ...base, streak: { count: 0 }, reviewDue: null }, "2026-10-27").kind, "next", "early in the week: the next lesson");
assert.equal(push.pick({ ...base, streak: { count: 0 }, reviewDue: null, mission: { title: "X", started: "2026-10-26" } }, "2026-10-28").kind, "mission", "a started mission, 2 days on");
assert.equal(push.pick({ ...base, lessonDay: fri, missionWeek: "2026-10-26" }, fri), null, "learned today, mission done: nothing to say");
assert.equal(push.pick(base, fri).url, "/?from=push&kind=streak");
console.log("ok: one message, the first that applies: streak at risk, Sunday check-in, review, mission, next lesson — or none");

// --- when: the chosen time, the learner's time zone, quiet hours, once a day ---
const id = "11111111-2222-4333-8444-555555555555";
const sub = { endpoint: "https://fcm.googleapis.com/fcm/send/device-1", keys: { p256dh: "BCVxsr7N_eNgVRqvHtD0zTZsEc6-VV-JvLexhqUzORcxaOzi6-AYWXvTBHm4bjyPjs7Vd8pZGH6SRpkNtoIAiw4", auth: "BTBZMqHH6r4Tts7J_aSIgg" } };
const reg = (b) => push.save({ id, sub, time: "18:00", tz: "America/Mexico_City", lang: "en", summary: base, ...b }, "1.2.3.4");
assert.throws(() => reg({ sub: { ...sub, endpoint: "http://169.254.169.254/latest" } }), /push service/);
assert.throws(() => reg({ sub: { ...sub, endpoint: "https://evil.example/fcm.googleapis.com" } }), /push service/);
assert.throws(() => reg({ sub: { ...sub, keys: { p256dh: "AAAA", auth: "BBBB" } } }), /keys/);
assert.throws(() => reg({ time: "22:30" }), /quiet hours/, "quiet hours are on by default");
assert.throws(() => reg({ tz: "Mars/Olympus" }), /time/);
assert.throws(() => push.save({ id: "22222222-2222-4333-8444-555555555555", time: "18:00", tz: "UTC" }, "1.2.3.4"), /Turn on/, "a new device needs its push address");
assert.equal(reg({}).ok, true);
assert.ok(reg({ time: "22:30", quiet: false }).ok, "quiet hours can be turned off");
reg({});
const sent = [];
const fake = (status) => async (d, m) => (sent.push({ endpoint: d.sub.endpoint, ...m }), status);
// 18:00 in Mexico City is 00:00 UTC the next day.
await push.tick(new Date("2026-10-30T23:30:00Z"), fake(201)); // 17:30 there
assert.equal(sent.length, 0, "not before the chosen time");
await push.tick(new Date("2026-10-31T00:05:00Z"), fake(201)); // 18:05 on Friday the 30th
assert.equal(sent.length, 1);
assert.equal(sent[0].kind, "streak");
await push.tick(new Date("2026-10-31T00:30:00Z"), fake(201));
assert.equal(sent.length, 1, "at most one a day");
await push.tick(new Date("2026-11-01T03:00:00Z"), fake(201)); // 21:00 on the 31st: past the 2-hour window
assert.equal(sent.length, 1, "too late in the day: skipped");
await push.tick(new Date("2026-11-02T00:10:00Z"), fake(410)); // Sunday the 1st, 18:10
assert.equal(sent.length, 2);
assert.equal(push.deviceCount(), 0, "a device the push service says is gone is forgotten");
reg({ lang: "es" });
const tests = [];
assert.deepEqual(await push.sendTest(async (d, m) => (tests.push(m), 201)), { devices: 1, delivered: 1, failed: 0 });
assert.equal(tests[0].body, "Este es un recordatorio de prueba.", "the admin page's test reminder, in the device's language");
assert.equal(push.remove(id).ok, true);
assert.equal(push.deviceCount(), 0, "turned off: deleted");
const s = insights.stats("2026-11-02").comingBack.push;
assert.equal(s.sent, 1, "delivered");
assert.equal(s.failed, 1, "the 410");
assert.deepEqual(s.kinds.find((x) => x.kind === "streak"), { kind: "streak", sent: 1, opened: 0 });
console.log("ok: at the chosen time in the learner's time zone, never in quiet hours, once a day; only push services; gone or turned off = deleted");

// --- the weekly email ---
const user = { id: "u1", email: "dani@example.com", nickname: "Dani", recap: true };
const state = {
  settings: { lang: "en", region: "US" },
  progress: { lessonDays: ["2026-10-27", "2026-10-29"], lessons: { a: { last: "2026-10-27" }, b: { last: "2026-10-29" }, c: { last: "2026-10-10" } }, days: { "2026-10-27": 15, "2026-10-29": 10, "2026-10-20": 50 }, streak: { count: 1 } },
  snapshot: { tz: "America/Chicago", next: "Fees to watch", mission: { title: "Find the fees on a bank account" }, goals: [{ name: "Car", saved: "$300", target: "$5,000", percent: 6 }] },
};
const m = recap.recapFor({ user, state, today: sun, base: "https://learn.example" });
assert.equal(m.subject, "Your week in Northvale Learn");
assert.match(m.text, /^Hi Dani,/);
assert.match(m.text, /2 lessons on 2 days, 25 XP, and a 1-day streak/);
assert.match(m.text, /- Car: \$300 of \$5,000 \(6%\)/);
assert.match(m.text, /Next lesson: Fees to watch/);
assert.match(m.text, /mission: Find the fees on a bank account/);
assert.match(m.text, /https:\/\/learn\.example\/\?from=recap/);
const token = /recap_off=([\w.-]+)/.exec(m.text)[1];
assert.match(recap.recapFor({ user, state: { ...state, settings: { lang: "es" } }, today: sun, base: "x" }).text, /^Hola, Dani:[\s\S]*2 lecciones en 2 días/);
assert.equal(recap.recapFor({ user, state, today: "2026-12-06", base: "x" }), null, "4+ weeks without a lesson: it stops");
console.log("ok: the recap: the week's lessons, days, XP and streak, goals, next lesson and mission, in English or Spanish; stops after 4 quiet weeks");

// Sunday evening in their time zone, once a week, through the mail module (log mode here).
const u = store.addUser({ email: "leo@example.com", passwordHash: "x", nickname: "Leo", ageBand: "18-25" });
store.updateUser(u.id, { recap: true });
store.setProgress(u.id, state, Date.now(), "2026-10-26");
const mails = [];
const run = (when) => recap.tick(new Date(when), { users: store.allUsers, progressOf: store.progress, base: "https://learn.example", send: async (x) => mails.push(x) });
await run("2026-11-01T21:00:00Z"); // 3 pm in Chicago
assert.equal(mails.length, 0, "not before 5 pm");
await run("2026-11-01T23:30:00Z"); // 5:30 pm
assert.equal(mails.length, 1);
assert.equal(mails[0].to, "leo@example.com");
await run("2026-11-02T01:00:00Z");
assert.equal(mails.length, 1, "once a week");
assert.throws(() => recap.turnOff(token.replace(/.$/, (ch) => (ch === "A" ? "B" : "A")), "1.2.3.4"), /isn't valid/);
assert.throws(() => recap.turnOff(`${u.id}.${token.split(".")[1]}`, "1.2.3.4"), /isn't valid/, "a token is only good for its own account");
assert.equal(recap.turnOff(recap.offToken(u.id), "1.2.3.4").ok, true);
assert.equal(store.userById(u.id).recap, false);
console.log("ok: sent Sunday from 5 pm in the learner's time zone, once a week; the turn-off link works only for its own account");
