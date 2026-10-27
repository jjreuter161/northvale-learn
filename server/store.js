// Accounts, sessions, synced progress and weekly leagues, kept in one JSON
// file on this machine (NORTHVALE_DATA, default server/data).
// - Passwords only as scrypt hashes, sessions only as SHA-256s of their
//   tokens (see auth.js).
// - What a learner shares: email (to sign in), a nickname, an age range
//   and their progress. Never a real name, birthday or bank details.
// ponytail: one file and an in-memory copy, written on each change — fine
// for thousands of learners on one server; move to a database (and add a
// "bank" module's encrypted secrets) when it outgrows that.
import { randomUUID } from "node:crypto";
import { readFileSync, writeFileSync, existsSync, mkdirSync, renameSync, copyFileSync, readdirSync, unlinkSync, chmodSync } from "node:fs";
import { join } from "node:path";

const DIR = process.env.NORTHVALE_DATA || join(import.meta.dirname, "data");
const FILE = join(DIR, "learn.json");
mkdirSync(DIR, { recursive: true, mode: 0o700 });

const data = { users: {}, sessions: {}, progress: {}, weeks: {}, usage: {}, ai: null, resets: {}, ...(existsSync(FILE) ? JSON.parse(readFileSync(FILE, "utf8")) : {}) };
let timer = null;
function save() {
  // Write-then-rename, so a crash mid-write never leaves a broken file.
  // Batched a little: progress syncs can come in quick bursts.
  clearTimeout(timer);
  timer = setTimeout(flush, 200);
}
export function flush() {
  clearTimeout(timer);
  writeFileSync(`${FILE}.tmp`, JSON.stringify(data), { mode: 0o600 });
  renameSync(`${FILE}.tmp`, FILE);
}
process.on("exit", flush);

// BACKUPS — once a day, a copy of the data file in backups/ (the last 14
// days are kept). On a host, also turn on its disk snapshots (README).
const BACKUPS = join(DIR, "backups");
export function backup(today = new Date().toISOString().slice(0, 10)) {
  mkdirSync(BACKUPS, { recursive: true, mode: 0o700 });
  const target = join(BACKUPS, `learn-${today}.json`);
  if (existsSync(target)) return null;
  flush();
  copyFileSync(FILE, target);
  chmodSync(target, 0o600);
  const old = readdirSync(BACKUPS).filter((f) => /^learn-\d{4}-\d{2}-\d{2}\.json$/.test(f)).sort().slice(0, -14);
  old.forEach((f) => unlinkSync(join(BACKUPS, f)));
  return target;
}

export const AGE_BANDS = ["13-17", "18-25", "26+"];
export const cleanNickname = (s) => String(s || "").replace(/[\u0000-\u001f\u007f<>]/g, "").trim().slice(0, 24);
const LEAGUE_SIZE = 30;

export const store = {
  // A named part of the saved data for another server module (analytics,
  // feedback, errors) to keep its own records in; call store.changed()
  // after changing it.
  section(name, init) {
    data[name] ||= init();
    return data[name];
  },
  changed: () => save(),
  userCount: () => Object.keys(data.users).length,
  allUsers: () => Object.values(data.users),
  userById: (id) => data.users[id] || null,
  userByEmail: (email) => Object.values(data.users).find((u) => u.email === email) || null,
  addUser({ email, passwordHash, nickname, ageBand, avatar, guardianConsentAt = null }) {
    const user = { id: randomUUID(), email, passwordHash, nickname: cleanNickname(nickname), ageBand, avatar: Number(avatar) || 0, guardianConsentAt, createdAt: new Date().toISOString() };
    data.users[user.id] = user;
    save();
    return user;
  },
  updateUser(id, patch) {
    Object.assign(data.users[id], patch);
    save();
    return data.users[id];
  },
  setPassword(id, passwordHash) {
    data.users[id].passwordHash = passwordHash;
    save();
  },
  removeUser(id) {
    delete data.users[id];
    delete data.progress[id];
    delete data.usage[id];
    for (const [k, r] of Object.entries(data.resets || {})) if (r.userId === id) delete data.resets[k];
    store.leaveLeagues(id);
    for (const [k, s] of Object.entries(data.sessions)) if (s.userId === id) delete data.sessions[k];
    save();
  },

  addSession(hash, userId, expiresAt) {
    for (const [k, s] of Object.entries(data.sessions)) if (s.expiresAt < Date.now()) delete data.sessions[k];
    data.sessions[hash] = { userId, expiresAt };
    save();
  },
  sessionUser(hash) {
    const s = data.sessions[hash];
    return s && s.expiresAt > Date.now() ? data.users[s.userId] || null : null;
  },
  removeSession(hash) {
    delete data.sessions[hash];
    save();
  },
  // EMAILED LINKS — password reset (30 minutes) and confirming an email
  // address ("verify", 24 hours): one link of each kind at a time per
  // account, kept only as its SHA-256, used once.
  addReset(hash, userId, kind = "reset", ttl = 30 * 60000) {
    const now = Date.now();
    data.resets ||= {};
    for (const [k, r] of Object.entries(data.resets)) if (r.expiresAt < now || (r.userId === userId && (r.kind || "reset") === kind)) delete data.resets[k];
    data.resets[hash] = { userId, kind, expiresAt: now + ttl };
    save();
  },
  takeReset(hash, kind = "reset") {
    const r = data.resets && data.resets[hash];
    if (!r || (r.kind || "reset") !== kind) return null;
    delete data.resets[hash];
    save();
    return r.expiresAt > Date.now() ? data.users[r.userId] || null : null;
  },
  removeAllSessions(userId) {
    for (const [k, s] of Object.entries(data.sessions)) if (s.userId === userId) delete data.sessions[k];
    save();
  },
  removeOtherSessions(userId, keepHash) {
    for (const [k, s] of Object.entries(data.sessions)) if (s.userId === userId && k !== keepHash) delete data.sessions[k];
    save();
  },

  // PROGRESS SYNC — the app's saved state, newest copy wins.
  progress: (userId) => data.progress[userId] || null,
  setProgress(userId, state, updatedAt, week, league = true) {
    data.progress[userId] = { state, updatedAt };
    // Joining this week's league happens on the first sync of the week
    // (unless the learner chose friends or their class instead).
    const w = (data.weeks[week] ||= []);
    if (league && !w.includes(userId)) w.push(userId);
    // Old weeks go after a month.
    for (const k of Object.keys(data.weeks)) if (k < weekMinus(week, 5)) delete data.weeks[k];
    save();
  },

  // Out of every weekly league (competing with friends or a class instead).
  leaveLeagues(userId) {
    for (const w of Object.values(data.weeks)) {
      const i = w.indexOf(userId);
      if (i >= 0) w.splice(i, 1);
    }
    save();
  },

  // A learner's league this week: up to 30 people of the same age group
  // (13–17, or 18 and up) who joined the week around the same time — so
  // teens never compete with adults they don't know.
  league(userId, week, xpOf) {
    const group = (id) => (data.users[id] && data.users[id].ageBand === "13-17" ? "teen" : "adult");
    const w = (data.weeks[week] || []).filter((id) => data.users[id] && group(id) === group(userId));
    const i = w.indexOf(userId);
    if (i < 0) return [];
    const start = Math.floor(i / LEAGUE_SIZE) * LEAGUE_SIZE;
    return w.slice(start, start + LEAGUE_SIZE).filter((id) => data.users[id]).map((id) => ({ id, user: data.users[id], xp: xpOf(data.progress[id] && data.progress[id].state, week) }));
  },

  // AI SPENDING — estimated dollars this month, from each call's own token
  // counts (see ai.js costOf). A new month starts at zero.
  aiSpend: (month) => (data.ai && data.ai.month === month ? data.ai : { month, spent: 0, calls: 0, tutor: 0, news: 0 }),
  addAiSpend(month, kind, cost) {
    const a = store.aiSpend(month);
    data.ai = { ...a, spent: a.spent + cost, calls: a.calls + 1, [kind]: (a[kind] || 0) + cost };
    save();
    return data.ai;
  },

  // How many tutor questions today (per account).
  useTutor(userId, day, limit) {
    const u = data.usage[userId] && data.usage[userId].day === day ? data.usage[userId] : { day, tutor: 0 };
    if (u.tutor >= limit) return false;
    data.usage[userId] = { ...u, tutor: u.tutor + 1 };
    save();
    return true;
  },
};

function weekMinus(week, n) {
  const d = new Date(`${week}T12:00:00Z`);
  d.setUTCDate(d.getUTCDate() - 7 * n);
  return d.toISOString().slice(0, 10);
}
