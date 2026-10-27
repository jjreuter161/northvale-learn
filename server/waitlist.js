// THE WAITLIST — from the landing page (/welcome, /bienvenida). It keeps
// only what the form asks: email, country, role and age range (13 and up;
// for 13–17, that a parent or guardian said it's OK), plus the language
// for emails and the date. No outside services: a hidden "website" field
// catches bots (people never see it), and sign-ups are rate-limited per
// address. Once email is set up, a short confirmation goes out; anyone can
// take themselves off the list with the link in it (or on the "You're on
// the list" screen). The admin page lists, exports (CSV) and deletes.
import { createHmac, randomBytes, randomUUID, timingSafeEqual } from "node:crypto";
import { store, AGE_BANDS } from "./store.js";
import { normalEmail, validEmail } from "./auth.js";
import { allowed } from "./insights.js";
import { sendMail, mailMode } from "./mail.js";

export const COUNTRIES = ["US", "MX", "other"];
export const ROLES = ["student", "teacher", "parent", "other"];
const MAX = 100000;
const fail = (status, message, code) => Object.assign(new Error(message), { status, code });
const list = () => store.section("waitlist", () => ({}));
const secret = () => store.section("waitlistKey", () => ({ key: randomBytes(32).toString("hex") })).key;
const sig = (id) => createHmac("sha256", secret()).update(`waitlist-leave:${id}`).digest("base64url");
export const leaveToken = (id) => `${id}.${sig(id)}`;

const WORDS = {
  en: {
    subject: "You're on the Northvale Learn waitlist",
    body: (e, link) =>
      [
        "Hi,",
        "",
        "Thanks for joining the Northvale Learn waitlist. Northvale Learn is a free app, now in a small beta, with short lessons about money, a goal planner and a practice portfolio. It uses pretend money only.",
        "",
        "We'll email you when there's a spot for you in the beta.",
        ...(e.role === "teacher" ? ["", "Classroom mode for teachers is being tested now. We'll tell you when it's ready."] : []),
        ...(e.ageBand === "13-17" ? ["", "Since you're under 18, make sure a parent or guardian knows you signed up."] : []),
        "",
        `Changed your mind? Take yourself off the list: ${link}`,
        "",
        "--",
        "You get this because this address was entered on the Northvale Learn waitlist. If that wasn't you, use the link above.",
        "Northvale Learn is for learning. All money in the app is pretend, and nothing in it is financial advice.",
      ].join("\n"),
  },
  es: {
    subject: "Ya estás en la lista de espera de Northvale Learn",
    body: (e, link) =>
      [
        "Hola:",
        "",
        "Gracias por unirte a la lista de espera de Northvale Learn. Northvale Learn es una app gratuita, ahora en una beta pequeña, con lecciones cortas sobre dinero, un planeador de metas y un portafolio de práctica. Solo usa dinero de práctica.",
        "",
        "Te escribiremos cuando haya un lugar para ti en la beta.",
        ...(e.role === "teacher" ? ["", "El modo de clase para docentes está en prueba. Te avisaremos cuando esté listo."] : []),
        ...(e.ageBand === "13-17" ? ["", "Como tienes menos de 18 años, asegúrate de que tu mamá, papá o tutor sepa que te registraste."] : []),
        "",
        `¿Cambiaste de opinión? Sal de la lista: ${link}`,
        "",
        "--",
        "Te llega porque esta dirección se registró en la lista de espera de Northvale Learn. Si no fuiste tú, usa el enlace de arriba.",
        "Northvale Learn es para aprender. Todo el dinero en la app es de práctica y nada en ella es asesoría financiera.",
      ].join("\n"),
  },
};
export function confirmation(e, base) {
  const L = WORDS[e.lang];
  const link = `${base}/${e.lang === "es" ? "bienvenida" : "welcome"}?leave=${leaveToken(e.id)}`;
  const address = process.env.MAIL_POSTAL_ADDRESS ? `\n${String(process.env.MAIL_POSTAL_ADDRESS).slice(0, 200)}` : "";
  return { subject: L.subject, text: L.body(e, link) + address };
}

// One sign-up. The same email again: "already on the list" (nothing changes).
export async function join(body, ip, base, send = sendMail) {
  // The hidden field: only bots fill it in. They get the same answer.
  if (body.website) return { ok: true };
  if (!allowed(`waitlist:${ip}`, 10)) throw fail(429, "Too many sign-ups from here. Try again in an hour.", "RATE");
  const email = normalEmail(body.email);
  if (!validEmail(email)) throw fail(400, "Enter a real email address.", "EMAIL");
  // 13 and up, like the app (the page asks first; this is the rule).
  if (!AGE_BANDS.includes(body.ageBand)) throw fail(400, "Northvale Learn is for ages 13 and up.", "AGE");
  if (body.ageBand === "13-17" && body.guardian !== true) throw fail(400, "Check with a parent or guardian first, then tick the box.", "GUARDIAN");
  if (!COUNTRIES.includes(body.country)) throw fail(400, "Pick a country.", "COUNTRY");
  if (!ROLES.includes(body.role)) throw fail(400, "Pick what describes you.", "ROLE");
  if (Object.values(list()).some((e) => e.email === email)) return { ok: true, already: true };
  if (Object.keys(list()).length >= MAX) throw fail(503, "The waitlist is full for now.", "FULL");
  const now = new Date().toISOString();
  const e = { id: randomUUID(), email, country: body.country, role: body.role, ageBand: body.ageBand, guardianOkAt: body.ageBand === "13-17" ? now : null, lang: body.lang === "es" ? "es" : "en", createdAt: now };
  list()[e.id] = e;
  store.changed();
  if (mailMode() !== "off") send({ to: email, ...confirmation(e, base) }).catch(() => {});
  // "mailed": a real email went out (not just printed, as on this machine).
  return { ok: true, token: leaveToken(e.id), mailed: mailMode() === "smtp" };
}

// Off the list, with the link (no sign-in needed).
export function leave(token, ip) {
  if (!allowed(`waitlistoff:${ip}`, 30)) throw fail(429, "Too many tries. Try again later.", "RATE");
  const [id, given] = String(token || "").split(".");
  const want = id && sig(id);
  if (!want || !given || given.length !== want.length || !timingSafeEqual(Buffer.from(given), Buffer.from(want))) throw fail(400, "That link isn't valid.", "BAD_LINK");
  if (Object.hasOwn(list(), id)) delete list()[id];
  store.changed();
  return { ok: true };
}

// ---- the admin page ------------------------------------------------------------------

export function summary() {
  const all = Object.values(list()).sort((a, b) => b.createdAt.localeCompare(a.createdAt));
  const count = (k) => all.reduce((m, e) => ({ ...m, [e[k]]: (m[e[k]] || 0) + 1 }), {});
  return { total: all.length, byRole: count("role"), byCountry: count("country"), byAge: count("ageBand"), latest: all.slice(0, 200).map(({ id, email, country, role, ageBand, lang, createdAt }) => ({ id, email, country, role, ageBand, lang, createdAt })) };
}
// Every field quoted; a value that a spreadsheet would read as a formula
// (=, +, -, @) gets a leading apostrophe.
const cell = (v) => `"${String(v == null ? "" : v).replace(/^[=+\-@\t\r]/, "'$&").replace(/"/g, '""')}"`;
export function csv() {
  const rows = Object.values(list()).sort((a, b) => a.createdAt.localeCompare(b.createdAt));
  return [["email", "country", "role", "age_range", "guardian_ok_at", "language", "joined_at"], ...rows.map((e) => [e.email, e.country, e.role, e.ageBand, e.guardianOkAt, e.lang, e.createdAt])].map((r) => r.map(cell).join(",")).join("\r\n");
}
export function remove(id) {
  if (Object.hasOwn(list(), String(id))) delete list()[String(id)];
  store.changed();
  return { ok: true };
}
