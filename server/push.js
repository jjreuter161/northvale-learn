// PUSH REMINDERS — the installed app's daily reminder. Opt-in only: the
// learner picks the time; quiet hours (no reminders 9 pm–8 am) are on by
// default; at most one a day, and only when something's waiting (a streak
// at risk, the Sunday check-in, a review, this week's mission, the next
// lesson) — otherwise nothing is sent.
//
// What's kept per device, under a random ID made on it (not an account or
// the usage-stats ID): the browser's push address and keys, the time,
// quiet hours, time zone, language, and a few words about what's next
// (made on the device: the streak, next lesson's title, the mission's
// title). Deleted when reminders are turned off, with "Delete my data", or
// when the browser's push service says the address is gone.
//
// Web Push in Node's own crypto, so no extra library: VAPID (RFC 8292) to
// identify this server, aes128gcm encryption (RFC 8291) of each message.
// The VAPID keys are made on first use and kept with the data.
import { generateKeyPairSync, createECDH, createPrivateKey, sign, randomBytes, hkdfSync, createCipheriv } from "node:crypto";
import { store } from "./store.js";
import { allowed, countPush } from "./insights.js";
import { addDays, weekStart, daysBetween } from "../src/core/progress.js";

const ID = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
const DAY = /^\d{4}-\d{2}-\d{2}$/;
const TIME = /^([01]\d|2[0-3]):[0-5]\d$/;
// Browsers' push services; a push address anywhere else is refused (so
// this server can't be made to send requests to other places).
const PUSH_HOSTS = /(^|\.)(fcm\.googleapis\.com|push\.services\.mozilla\.com|push\.apple\.com|notify\.windows\.com)$/;
const MAX_DEVICES = 50000;
const QUIET = [21 * 60, 8 * 60]; // 9 pm to 8 am
const WINDOW = 120; // minutes after the chosen time it may still go out
const bad = (m) => Object.assign(new Error(m), { status: 400 });
const b64 = (s) => Buffer.from(String(s), "base64url");
const str = (x, n) => String(x == null ? "" : x).replace(/[\u0000-\u001f]/g, " ").slice(0, n);
const int = (x) => (Number.isFinite(Number(x)) ? Math.max(0, Math.min(10000, Math.floor(Number(x)))) : 0);
const day = (x) => (DAY.test(String(x)) ? String(x) : null);

const devices = () => store.section("push", () => ({}));
function vapidKeys() {
  return store.section("vapid", () => {
    const { publicKey, privateKey } = generateKeyPairSync("ec", { namedCurve: "prime256v1" });
    const pub = publicKey.export({ format: "jwk" });
    return { publicKey: Buffer.concat([Buffer.from([4]), b64(pub.x), b64(pub.y)]).toString("base64url"), jwk: privateKey.export({ format: "jwk" }) };
  });
}
export const publicKey = () => vapidKeys().publicKey;

// RFC 8291: encrypt `plaintext` for one browser. `fixed` (tests only) pins
// the server's one-time key and the salt.
export function encrypt(plaintext, keys, fixed = {}) {
  const ua = b64(keys.p256dh);
  const ecdh = createECDH("prime256v1");
  if (fixed.asPrivate) ecdh.setPrivateKey(b64(fixed.asPrivate));
  else ecdh.generateKeys();
  const asPublic = ecdh.getPublicKey();
  const salt = fixed.salt ? b64(fixed.salt) : randomBytes(16);
  const ikm = Buffer.from(hkdfSync("sha256", ecdh.computeSecret(ua), b64(keys.auth), Buffer.concat([Buffer.from("WebPush: info\0"), ua, asPublic]), 32));
  const cek = Buffer.from(hkdfSync("sha256", ikm, salt, Buffer.from("Content-Encoding: aes128gcm\0"), 16));
  const nonce = Buffer.from(hkdfSync("sha256", ikm, salt, Buffer.from("Content-Encoding: nonce\0"), 12));
  const cipher = createCipheriv("aes-128-gcm", cek, nonce);
  const body = Buffer.concat([cipher.update(Buffer.concat([Buffer.from(plaintext), Buffer.from([2])])), cipher.final(), cipher.getAuthTag()]);
  const header = Buffer.alloc(21);
  salt.copy(header, 0);
  header.writeUInt32BE(4096, 16);
  header[20] = asPublic.length;
  return Buffer.concat([header, asPublic, body]);
}

// RFC 8292: who's sending, signed with this server's key. Push services
// want a way to reach the sender: CONTACT_EMAIL, else PUBLIC_URL.
export function vapidHeader(endpoint, now = Date.now()) {
  const k = vapidKeys();
  const contact = process.env.CONTACT_EMAIL ? `mailto:${process.env.CONTACT_EMAIL}` : process.env.PUBLIC_URL || "mailto:northvale-learn@example.com";
  const part = (o) => Buffer.from(JSON.stringify(o)).toString("base64url");
  const unsigned = `${part({ typ: "JWT", alg: "ES256" })}.${part({ aud: new URL(endpoint).origin, exp: Math.floor(now / 1000) + 12 * 3600, sub: contact })}`;
  const sig = sign("sha256", Buffer.from(unsigned), { key: createPrivateKey({ key: k.jwk, format: "jwk" }), dsaEncoding: "ieee-p1363" }).toString("base64url");
  return `vapid t=${unsigned}.${sig}, k=${k.publicKey}`;
}

async function deliver(device, message) {
  const res = await fetch(device.sub.endpoint, {
    method: "POST",
    headers: { Authorization: vapidHeader(device.sub.endpoint), TTL: "14400", Urgency: "normal", "Content-Encoding": "aes128gcm", "Content-Type": "application/octet-stream" },
    body: encrypt(JSON.stringify(message), device.sub.keys),
    signal: AbortSignal.timeout(10000),
  });
  return res.status;
}

// WHAT TO SAY — the first that applies on `today` (the learner's date),
// or nothing. Calm and short; no guilt, no exclamation marks. A streak
// reminder rotates through a few lines (by date), so it doesn't nag.
const turn = (today, lines) => lines[Number(today.slice(8)) % lines.length];
const WORDS = {
  en: {
    title: "Northvale Learn",
    streak: (s, today) =>
      turn(today, [
        (n) => `Your ${n}-day streak is still on. One short lesson keeps it that way.`,
        (n) => `${n} days in a row. Today's lesson takes about 4 minutes.`,
        (n) => `Your streak would like a word: one short lesson keeps it at ${n} days.`,
        (n) => `Still time today: one short lesson keeps your ${n}-day streak going.`,
      ])(s.streak.count),
    checkin: () => "It's Sunday check-in: a minute to record what you set aside this week.",
    review: () => "A quick review is ready: about 2 minutes on what you learned before.",
    mission: (s) => (s.mission.started ? `Still on your mission, "${s.mission.title}"? Mark it done when you've finished.` : `This week's mission: ${s.mission.title}.`),
    next: (s) => `Next up: ${s.next}. About 4 minutes.`,
  },
  es: {
    title: "Northvale Learn",
    streak: (s, today) =>
      turn(today, [
        (n) => `Tu racha de ${n} días sigue en pie. Una lección corta la mantiene.`,
        (n) => `${n} días seguidos. La lección de hoy toma unos 4 minutos.`,
        (n) => `Tu racha quiere decirte algo: una lección corta la mantiene en ${n} días.`,
        (n) => `Todavía hay tiempo hoy: una lección corta mantiene tu racha de ${n} días.`,
      ])(s.streak.count),
    checkin: () => "Es domingo de revisión: un minuto para anotar lo que apartaste esta semana.",
    review: () => "Hay un repaso listo: unos 2 minutos sobre lo que ya aprendiste.",
    mission: (s) => (s.mission.started ? `¿Sigues con tu misión, "${s.mission.title}"? Márcala como hecha cuando termines.` : `La misión de esta semana: ${s.mission.title}.`),
    next: (s) => `Sigue: ${s.next}. Unos 4 minutos.`,
  },
};
export function pick(s, today, lang = "en") {
  const learned = s.lessonDay === today;
  const sunday = new Date(`${today}T12:00:00Z`).getUTCDay() === 0;
  const kind =
    (!learned && s.streak && s.streak.count >= 2 && s.streak.last === addDays(today, -1) && "streak") ||
    (sunday && s.goals > 0 && s.checkIn !== today && "checkin") ||
    (!learned && s.reviewDue && s.reviewDue <= today && "review") ||
    (s.mission && s.missionWeek !== weekStart(today) && (s.mission.started ? daysBetween(s.mission.started, today) >= 2 : [4, 5, 6].includes(new Date(`${today}T12:00:00Z`).getUTCDay())) && "mission") ||
    (!learned && s.next && "next") ||
    null;
  if (!kind) return null;
  const w = WORDS[lang] || WORDS.en;
  return { kind, title: w.title, body: w[kind](s, today), url: `/?from=push&kind=${kind}`, tag: "northvale-daily" };
}

// The learner's date and minutes past midnight, in their time zone.
export function localNow(now, tz) {
  const p = Object.fromEntries(new Intl.DateTimeFormat("en-CA", { timeZone: tz, year: "numeric", month: "2-digit", day: "2-digit", hour: "2-digit", minute: "2-digit", hourCycle: "h23" }).formatToParts(now).map((x) => [x.type, x.value]));
  return { day: `${p.year}-${p.month}-${p.day}`, min: Number(p.hour) * 60 + Number(p.minute) };
}
const minutes = (hhmm) => Number(hhmm.slice(0, 2)) * 60 + Number(hhmm.slice(3));
export const isQuiet = (min) => min >= QUIET[0] || min < QUIET[1];

// Every minute: whoever's time it is gets at most one reminder today.
export async function tick(now = new Date(), send = deliver) {
  const all = devices();
  let changed = false;
  for (const [id, d] of Object.entries(all)) {
    const at = localNow(now, d.tz);
    const target = minutes(d.time);
    if (at.day === d.lastTried || at.min < target || at.min >= target + WINDOW || (d.quiet && isQuiet(at.min))) continue;
    d.lastTried = at.day;
    changed = true;
    const message = pick(d.summary || {}, at.day, d.lang);
    if (!message) continue;
    const status = await send(d, message).catch(() => 0);
    if (status === 404 || status === 410) delete all[id];
    else if (status >= 200 && status < 300) d.lastSent = at.day;
    countPush(message.kind, status >= 200 && status < 300);
  }
  if (changed) store.changed();
}

// The app's summary of what's next, kept to known fields and sizes.
function cleanSummary(s) {
  if (!s || typeof s !== "object") return {};
  const m = s.mission && typeof s.mission === "object" && s.mission.title ? { title: str(s.mission.title, 120), started: day(s.mission.started) } : null;
  return { lessonDay: day(s.lessonDay), streak: { count: int(s.streak && s.streak.count), last: day(s.streak && s.streak.last) }, reviewDue: day(s.reviewDue), goals: Array.isArray(s.goals) ? s.goals.length : int(s.goals), checkIn: day(s.checkIn), mission: m, missionWeek: day(s.missionWeek), next: s.next ? str(s.next, 120) : null };
}
function validTz(tz) {
  try {
    new Intl.DateTimeFormat("en", { timeZone: String(tz) });
    return /^[A-Za-z_]+(\/[A-Za-z0-9_+-]+){0,2}$/.test(String(tz));
  } catch {
    return false;
  }
}

// Turn on, change the time, or update the summary (PUT /api/push).
export function save(body, ip) {
  if (!ID.test(String(body.id))) throw bad("Bad device ID.");
  if (!allowed(`push:${ip}`, 600)) throw Object.assign(new Error("Too many changes — try again later."), { status: 429 });
  const all = devices();
  const d = all[body.id];
  if (!d && !body.sub) throw bad("Turn on reminders first.");
  if (!d && Object.keys(all).length >= MAX_DEVICES) throw Object.assign(new Error("Reminders are full right now."), { status: 503 });
  const next = { ...(d || { created: new Date().toISOString() }) };
  if (body.sub) {
    const { endpoint, keys } = body.sub || {};
    let url = null;
    try {
      url = new URL(String(endpoint));
    } catch {}
    if (!url || url.protocol !== "https:" || !PUSH_HOSTS.test(url.hostname) || String(endpoint).length > 1000) throw bad("That push address isn't from a browser's push service.");
    if (!keys || b64(keys.p256dh).length !== 65 || b64(keys.p256dh)[0] !== 4 || b64(keys.auth).length !== 16) throw bad("Bad push keys.");
    next.sub = { endpoint: String(endpoint), keys: { p256dh: String(keys.p256dh), auth: String(keys.auth) } };
  }
  if (!TIME.test(String(body.time)) || !validTz(body.tz)) throw bad("Pick a time.");
  next.quiet = body.quiet !== false;
  if (next.quiet && isQuiet(minutes(body.time))) throw bad("That's inside quiet hours (9 pm–8 am).");
  if (next.time !== body.time) delete next.lastTried; // a new time can still go out today
  Object.assign(next, { time: String(body.time), tz: String(body.tz), lang: body.lang === "es" ? "es" : "en", summary: cleanSummary(body.summary), updated: new Date().toISOString() });
  all[body.id] = next;
  store.changed();
  return { ok: true };
}

export function remove(id) {
  const all = devices();
  if (ID.test(String(id)) && all[id]) {
    delete all[id];
    store.changed();
  }
  return { ok: true };
}

export const deviceCount = () => Object.keys(devices()).length;

// From the admin page: a test reminder to every device now, to check that
// reminders reach real phones (not counted in the stats).
export async function sendTest(send = deliver) {
  const result = { devices: 0, delivered: 0, failed: 0 };
  for (const d of Object.values(devices())) {
    result.devices++;
    const status = await send(d, { kind: "test", title: "Northvale Learn", body: d.lang === "es" ? "Este es un recordatorio de prueba." : "This is a test reminder.", url: "/", tag: "northvale-test" }).catch(() => 0);
    result[status >= 200 && status < 300 ? "delivered" : "failed"]++;
  }
  return result;
}
