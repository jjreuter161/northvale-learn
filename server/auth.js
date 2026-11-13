// SIGN-IN. Passwords are stored as scrypt hashes and checked in constant
// time. A session is a random token in an HttpOnly, SameSite=Strict cookie
// (Secure over HTTPS); the server keeps only its SHA-256. Repeated wrong
// passwords — from one device or against one email — pause sign-in for a
// while, so a password can't be guessed by trying.
import { randomBytes, scrypt, timingSafeEqual, createHash } from "node:crypto";
import { promisify } from "node:util";

const COST = { N: 32768, r: 8, p: 1, maxmem: 64 * 1024 * 1024 };
// Each hash takes 32 MB for ~0.1 s. At most 2 at once, the rest wait their
// turn: a burst of sign-ups (launch day, a class) stays within a 256 MB
// server (measured by `npm run load-check`).
// ponytail: one queue for the whole server; raise HASHES_AT_ONCE with the memory.
const HASHES_AT_ONCE = 2;
let hashing = 0;
const queue = [];
const run = promisify(scrypt);
async function scryptAsync(...args) {
  if (hashing >= HASHES_AT_ONCE) await new Promise((r) => queue.push(r));
  hashing++;
  try {
    return await run(...args);
  } finally {
    hashing--;
    if (queue.length) queue.shift()();
  }
}
const SESSION_DAYS = 30;
export const COOKIE = "nvl_session";

export const sha256 = (x) => createHash("sha256").update(x).digest("base64url");

export async function hashPassword(password) {
  const salt = randomBytes(16);
  const key = await scryptAsync(password, salt, 64, COST);
  return `scrypt$${salt.toString("base64")}$${key.toString("base64")}`;
}
export async function passwordMatches(password, stored) {
  const [, salt, key] = stored.split("$");
  const tried = await scryptAsync(password, Buffer.from(salt, "base64"), 64, COST);
  return timingSafeEqual(tried, Buffer.from(key, "base64"));
}
// Checked against when there's no such account, so a wrong email takes as
// long as a wrong password and the two can't be told apart.
const NOBODY = await hashPassword(randomBytes(16).toString("hex"));
export const passwordFor = (user) => (user ? user.passwordHash : NOBODY);

export const sameSecret = (a, b) => timingSafeEqual(Buffer.from(sha256(String(a))), Buffer.from(sha256(String(b))));

export function newSession() {
  const token = randomBytes(32).toString("base64url");
  return { token, hash: sha256(token), expiresAt: Date.now() + SESSION_DAYS * 864e5 };
}
export const sessionCookie = (token, secure) => `${COOKIE}=${token}; Path=/; HttpOnly; SameSite=Strict; Max-Age=${SESSION_DAYS * 86400}${secure ? "; Secure" : ""}`;
export const clearedCookie = (secure) => `${COOKIE}=; Path=/; HttpOnly; SameSite=Strict; Max-Age=0${secure ? "; Secure" : ""}`;
export function cookieToken(req) {
  const hit = (req.headers.cookie || "").split(";").map((c) => c.trim()).find((c) => c.startsWith(`${COOKIE}=`));
  return hit ? hit.slice(COOKIE.length + 1) : null;
}

export const normalEmail = (e) => String(e || "").trim().toLowerCase().slice(0, 200);
// Plain addresses only (no quotes, spaces, ";", "<>"…): they go into email
// headers for password reset.
export const validEmail = (e) => /^[a-z0-9._%+-]{1,64}@[a-z0-9-]+(\.[a-z0-9-]+)*\.[a-z]{2,}$/.test(e);
export const PASSWORD_MIN = 10;
export const validPassword = (p) => typeof p === "string" && p.length >= PASSWORD_MIN && p.length <= 200;

// THROTTLE — too many misses within 15 minutes and that key waits out the
// rest of the 15 minutes: 5 for one email, 20 for one address (a household
// or office shares one, so it gets more room).
// ponytail: in memory, so a restart forgets; fine for one server process.
const WINDOW = 15 * 60000;
// Sign-ups and class codes get more room per address: a whole class on
// school Wi-Fi shares one.
const limitOf = (key) => (key.startsWith("signup:") || key.startsWith("join:") ? 120 : key.startsWith("ip:") ? 20 : 5);
const misses = new Map();
export function throttled(keys) {
  const now = Date.now();
  return keys.some((k) => {
    const m = misses.get(k);
    return m && m.until > now && m.count >= limitOf(k);
  });
}
export function recordMiss(keys) {
  const now = Date.now();
  for (const [k, m] of misses) if (m.until <= now) misses.delete(k);
  for (const k of keys) {
    const m = misses.get(k);
    misses.set(k, m && m.until > now ? { count: m.count + 1, until: m.until } : { count: 1, until: now + WINDOW });
  }
}
export const clearMisses = (keys) => keys.forEach((k) => misses.delete(k));
