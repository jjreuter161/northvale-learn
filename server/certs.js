// CERTIFICATES — finishing a track earns a certificate with a code, checked
// against the lessons this account has finished (synced progress). The server
// keeps only: the code, the track, the date, which account owns it and — for
// adults who choose to — the name to show. A public page checks a code and
// answers with the track, the date and (adults only) that name: no profile,
// nothing else. For anyone 13–17, or with no age given, no name is ever kept
// or shown. Deleting a certificate, or the account, removes it.
import { randomInt } from "node:crypto";
import { store } from "./store.js";
import { TRACKS, trackById, lessonsOfTrack } from "../src/modules/certs/tracks.js";
import { ALL_LESSONS } from "../src/modules/lessons/content.js";

const fail = (status, message, code) => Object.assign(new Error(message), { status, code });
const ALPHABET = "ABCDEFGHJKMNPQRSTUVWXYZ23456789"; // no 0/O/1/I/L: easy to read out
const newCode = () => Array.from({ length: 12 }, () => ALPHABET[randomInt(ALPHABET.length)]).join("");
export const cleanCode = (x) => String(x || "").toUpperCase().replace(/[^A-Z0-9]/g, "").slice(0, 12);
export const adult = (u) => u.ageBand === "18-25" || u.ageBand === "26+";
// A name to print: letters, spaces and a few marks, 2–60 characters; no digits, links or emails.
export const cleanName = (x) => {
  const s = String(x || "").normalize("NFC").replace(/\s+/g, " ").trim();
  return s.length >= 2 && s.length <= 60 && /^\p{L}[\p{L}\p{M} .'’-]*$/u.test(s) ? s : null;
};

const finished = (userId, track) => {
  const rec = store.progress(userId);
  const lessons = (rec && rec.state && rec.state.progress && rec.state.progress.lessons) || {};
  const need = lessonsOfTrack(track, ALL_LESSONS);
  return need.length > 0 && need.every((id) => lessons[id] && lessons[id].done);
};
const shape = (c) => ({ code: c.code, track: c.track, date: c.date, name: c.name || null });

// What this account can claim, and what it has.
export const mine = (user) => ({ certs: store.certsOf(user.id).map(shape), ready: TRACKS.filter((t) => finished(user.id, t)).map((t) => t.id) });

// Issue (or change the name on) the certificate for a track.
export function issue(user, body, today) {
  const track = trackById(body && body.track);
  if (!track) throw fail(400, "That isn't a certificate track.", "TRACK");
  if (!finished(user.id, track)) throw fail(409, "Finish every lesson in this track first. Your progress has to be saved to your account (it syncs when you're online).", "NOT_FINISHED");
  let name = null;
  if (adult(user)) {
    if (body.name === "nickname") name = user.nickname || null;
    else if (body.name === "real") {
      name = cleanName(body.realName);
      if (!name) throw fail(400, "Enter your name with letters only (2–60 characters).", "NAME");
    }
  }
  const existing = store.certsOf(user.id).find((c) => c.track === track.id);
  const rec = existing ? { ...existing, name } : { code: newCode(), user: user.id, track: track.id, date: today, name };
  store.setCert(rec);
  return shape(rec);
}

export function remove(user, code) {
  const c = store.certByCode(cleanCode(code));
  if (!c || c.user !== user.id) throw fail(404, "That certificate isn't yours.", "NOT_FOUND");
  store.removeCert(c.code);
  return { ok: true };
}

// The public check: only what a stranger may see.
const tries = new Map();
export function verify(code, ip) {
  const now = Date.now();
  const list = (tries.get(ip) || []).filter((t) => now - t < 60000);
  if (list.length >= 20) throw fail(429, "Too many tries. Wait a minute and try again.", "RATE");
  list.push(now);
  tries.set(ip, list);
  if (tries.size > 5000) for (const [k, v] of tries) if (!v.some((t) => now - t < 60000)) tries.delete(k);
  const c = store.certByCode(cleanCode(code));
  if (!c) return { valid: false };
  const track = trackById(c.track);
  return { valid: true, track: c.track, title: track ? track.title : null, date: c.date, name: c.name || null };
}
