// CLASSROOM MODE — a teacher's class, joined by students with a code and
// a nickname. Built around student privacy (docs/COMPLIANCE.md):
// - Behind the "classroom" flag (flags.js): only teachers it's on for can
//   make classes, and a class works only while its teacher still has it.
// - Teachers: an account, 18+, email confirmed, teacher terms accepted.
// - Students need no account. Joining gives the device a member ID and a
//   secret key; the device then sends a short report about what it did
//   since joining (src/modules/classroom/report.js), and nothing else:
//   lessons finished, how many missions finished, answers per concept,
//   this week's XP. Never goals, amounts, the portfolio, mission notes,
//   tutor questions, age or email.
// - The teacher sees only teacherView() below; concept totals appear only
//   once 3+ students have answered on that concept.
// - Students can hide from the class leaderboard and leave at any time
//   (their record is deleted). There are no messages of any kind.
// - Archived classes are deleted 90 days later; deleting a teacher's
//   account deletes their classes.
// ponytail: classes live in the one data file and are found by scanning —
// fine for hundreds of classes; index codes and members if it grows.
import { randomBytes, randomInt, timingSafeEqual } from "node:crypto";
import { store, AGE_BANDS, cleanNickname } from "./store.js";
import { sha256, throttled, recordMiss } from "./auth.js";
import { allowed } from "./insights.js";
import { isOn } from "./flags.js";
import { ALL_LESSONS, UNITS } from "../src/modules/lessons/content.js";
import { CONCEPTS } from "../src/modules/lessons/concepts.js";
import { addDays, dayKey, weekStart } from "../src/core/progress.js";

export const KEEP_ARCHIVED_DAYS = 90;
export const MIN_GROUP = 3; // students before a concept's totals show
const MAX_MEMBERS = 200;
const MAX_CLASSES = 20; // per teacher
const MAX_ASSIGNMENTS = 30;
const CODE_CHARS = "ABCDEFGHJKMNPQRSTUVWXYZ23456789"; // no 0/O, 1/I/L
const LESSONS = new Set(ALL_LESSONS.map((l) => l.id));
const UNIT_IDS = new Set(UNITS.map((u) => u.id));
const CONCEPT_IDS = new Set(CONCEPTS.map((c) => c.id));
const DAY = /^\d{4}-\d{2}-\d{2}$/;

const fail = (status, message, code = null) => Object.assign(new Error(message), { status, code });
const all = () => store.section("classes", () => ({}));
const int = (x, max) => Math.max(0, Math.min(max, Math.floor(Number(x) || 0)));
const newCode = () => Array.from({ length: 6 }, () => CODE_CHARS[randomInt(CODE_CHARS.length)]).join("");
const normalCode = (s) => String(s || "").toUpperCase().replace(/[^A-Z0-9]/g, "").slice(0, 12);
const cleanName = (s) => String(s || "").replace(/[\u0000-\u001f\u007f<>]/g, "").trim().slice(0, 40);
const sameHash = (a, b) => a.length === b.length && timingSafeEqual(Buffer.from(a), Buffer.from(b));
const own = (o, k) => (Object.hasOwn(o, k) ? o[k] : null);
const teacherOf = (c) => store.userById(c.teacherId);
const live = (c) => !c.archivedAt && isOn("classroom", teacherOf(c));
const unitLessons = Object.fromEntries(UNITS.map((u) => [u.id, u.lessons.map((l) => l.id)]));
const unitsDone = (lessons) => UNITS.filter((u) => unitLessons[u.id].every((id) => lessons.includes(id))).map((u) => u.id);

// ---- teachers ------------------------------------------------------------------

// What a teacher still needs before making a class.
export function readiness(user) {
  return { adult: user.ageBand === "18-25" || user.ageBand === "26+", verified: !!user.emailVerifiedAt, terms: !!user.teacherTermsAt };
}
function mine(user, id) {
  if (!isOn("classroom", user)) throw fail(403, "Classroom mode isn't on for this account.", "NO_CLASSROOM");
  if (id === undefined) return null;
  const c = own(all(), String(id));
  if (!c || c.teacherId !== user.id) throw fail(404, "That class isn't there.");
  return c;
}

export function create(user, name) {
  mine(user);
  const r = readiness(user);
  if (!r.adult) throw fail(403, "Teacher accounts are for adults (18 and up).", "ADULT");
  if (!r.verified) throw fail(403, "Confirm your email address first.", "VERIFY");
  if (!r.terms) throw fail(403, "Agree to the teacher terms first.", "TERMS");
  if (!cleanName(name)) throw fail(400, "Give the class a name.");
  if (Object.values(all()).filter((c) => c.teacherId === user.id).length >= MAX_CLASSES) throw fail(400, `You can have up to ${MAX_CLASSES} classes. Delete an old one first.`);
  const c = { id: randomBytes(9).toString("base64url"), teacherId: user.id, name: cleanName(name), code: freshCode(), open: true, createdAt: dayKey(), archivedAt: null, assignments: [], members: {} };
  all()[c.id] = c;
  store.changed();
  return { id: c.id };
}
function freshCode() {
  const used = new Set(Object.values(all()).map((c) => c.code));
  let code;
  do code = newCode();
  while (used.has(code));
  return code;
}

export const list = (user) =>
  (mine(user),
  Object.values(all())
    .filter((c) => c.teacherId === user.id)
    .map((c) => ({ id: c.id, name: c.name, code: c.code, open: c.open, students: Object.keys(c.members).length, archivedAt: c.archivedAt, deletesOn: c.archivedAt ? addDays(c.archivedAt, KEEP_ARCHIVED_DAYS) : null }))
    .sort((a, b) => !!a.archivedAt - !!b.archivedAt || a.name.localeCompare(b.name)));

// EVERYTHING A TEACHER SEES — built field by field, so nothing else can
// slip in: nicknames; lessons and units finished, missions finished and
// assignment progress, all since the student joined; and class-wide
// totals for the concepts the class misses most.
export function teacherView(user, id) {
  const c = mine(user, id);
  const members = Object.entries(c.members).map(([mid, m]) => ({ mid, nickname: m.nickname, r: m.report || { lessons: [], missions: 0, concepts: {} } }));
  const progressOn = (r, a) => ({ done: unitLessons[a.unit].filter((l) => r.lessons.includes(l)).length, of: unitLessons[a.unit].length });
  const concepts = {};
  for (const { r } of members)
    for (const [cid, [seen, missed]] of Object.entries(r.concepts)) {
      const t = (concepts[cid] ||= { id: cid, students: 0, seen: 0, missed: 0 });
      t.students++;
      t.seen += seen;
      t.missed += missed;
    }
  return {
    id: c.id,
    name: c.name,
    code: c.code,
    open: c.open,
    archivedAt: c.archivedAt,
    deletesOn: c.archivedAt ? addDays(c.archivedAt, KEEP_ARCHIVED_DAYS) : null,
    students: members
      .map(({ mid, nickname, r }) => ({ id: mid, nickname, lessons: r.lessons.length, units: unitsDone(r.lessons).length, missions: r.missions, assignments: Object.fromEntries(c.assignments.map((a) => [a.id, progressOn(r, a)])) }))
      .sort((a, b) => a.nickname.localeCompare(b.nickname)),
    assignments: c.assignments.map((a) => ({ id: a.id, unit: a.unit, due: a.due, done: members.filter(({ r }) => progressOn(r, a).done === unitLessons[a.unit].length).length, of: members.length })),
    concepts: Object.values(concepts)
      .filter((x) => x.students >= MIN_GROUP && x.missed > 0)
      .sort((a, b) => b.missed / b.seen - a.missed / a.seen || b.missed - a.missed)
      .slice(0, 6),
  };
}

export function update(user, id, { name, open, newCode: rotate, archived }) {
  const c = mine(user, id);
  if (name !== undefined) {
    if (!cleanName(name)) throw fail(400, "Give the class a name.");
    c.name = cleanName(name);
  }
  if (open !== undefined) c.open = open === true;
  if (rotate === true) c.code = freshCode();
  if (archived !== undefined) c.archivedAt = archived === true ? c.archivedAt || dayKey() : null;
  store.changed();
  return { ok: true };
}
export function remove(user, id) {
  mine(user, id);
  delete all()[id];
  store.changed();
  return { ok: true };
}
export function assign(user, id, { unit, due }) {
  const c = mine(user, id);
  if (!UNIT_IDS.has(unit)) throw fail(400, "Pick a unit.");
  if (!DAY.test(String(due)) || due < dayKey()) throw fail(400, "Pick a due date from today on.");
  if (c.assignments.length >= MAX_ASSIGNMENTS) throw fail(400, "That's a lot of assignments. Remove an old one first.");
  c.assignments = [...c.assignments.filter((a) => a.unit !== unit), { id: randomBytes(6).toString("base64url"), unit, due }].sort((a, b) => a.due.localeCompare(b.due));
  store.changed();
  return { ok: true };
}
export function unassign(user, id, aid) {
  const c = mine(user, id);
  c.assignments = c.assignments.filter((a) => a.id !== aid);
  store.changed();
  return { ok: true };
}
export function removeStudent(user, id, mid) {
  const c = mine(user, id);
  delete c.members[mid];
  store.changed();
  return { ok: true };
}

// ---- students ------------------------------------------------------------------

function byCode(code, ip) {
  const keys = [`join:${ip}`];
  if (throttled(keys)) throw fail(429, "Too many tries. Wait 15 minutes, then try again.");
  const c = Object.values(all()).find((x) => x.code === normalCode(code));
  if (!c || !live(c)) {
    recordMiss(keys);
    throw fail(404, "That class code doesn't work. Check it with your teacher.", "BAD_CODE");
  }
  if (!c.open) throw fail(403, "This class isn't taking new students right now. Ask your teacher.", "CLOSED");
  return c;
}
// Before joining: the class's name, to show with what the teacher will see.
export const lookup = (code, ip) => ({ name: byCode(code, ip).name });

export function join({ code, nickname, ageBand }, ip) {
  const c = byCode(code, ip);
  // 13 and up (the app asks first; this is the rule, not the UI).
  if (!AGE_BANDS.includes(ageBand)) throw fail(400, "Classes are for ages 13 and up.", "AGE");
  const nick = cleanNickname(nickname);
  if (!nick) throw fail(400, "Pick a nickname.");
  if (Object.values(c.members).some((m) => m.nickname.toLowerCase() === nick.toLowerCase())) throw fail(409, "Someone in this class already uses that nickname. Try another.", "TAKEN");
  if (Object.keys(c.members).length >= MAX_MEMBERS) throw fail(403, "This class is full.");
  if (!allowed(`joins:${ip}`, 300)) throw fail(429, "Too many joins from here. Try again later.");
  const mid = randomBytes(9).toString("base64url");
  const key = randomBytes(24).toString("base64url");
  c.members[mid] = { keyHash: sha256(key), nickname: nick, joined: dayKey(), hidden: false, report: null };
  store.changed();
  return { classId: c.id, memberId: mid, key, name: c.name, joined: dayKey() };
}

// A student's own membership, by its secret key. Gone (left, removed, or
// the class deleted) → 404, and the app forgets it.
function member({ classId, memberId, key }) {
  const c = own(all(), String(classId));
  const m = c && own(c.members, String(memberId));
  if (!m || !sameHash(m.keyHash, sha256(String(key || "")))) throw fail(404, "You're not in this class anymore.", "GONE");
  return { c, m };
}
const status = (c) => (c.archivedAt ? "ended" : live(c) ? "ok" : "paused");

// What the student's device says it did since joining — checked against
// what exists, and capped, so a made-up report can't break the class.
export function report(who, r = {}) {
  const { c, m } = member(who);
  if (status(c) !== "ok") return { ok: false, status: status(c) };
  if (!allowed(`report:${who.memberId}`, 300)) return { ok: true, dropped: true };
  const concepts = {};
  for (const [id, v] of Object.entries(r.concepts && typeof r.concepts === "object" ? r.concepts : {}).slice(0, 300)) {
    if (!CONCEPT_IDS.has(id) || !Array.isArray(v)) continue;
    const seen = int(v[0], 10000);
    if (seen) concepts[id] = [seen, Math.min(seen, int(v[1], 10000))];
  }
  m.report = {
    lessons: [...new Set((Array.isArray(r.lessons) ? r.lessons : []).filter((id) => LESSONS.has(id)))],
    missions: int(r.missions, 500),
    concepts,
    week: DAY.test(String(r.week)) ? r.week : null,
    xp: int(r.xp, 3500),
  };
  store.changed();
  return { ok: true };
}

// The class as a student sees it: its name, assignments, and the
// leaderboard (nicknames and this week's XP; hidden students left out).
export function studentView(who) {
  const { c, m } = member(who);
  const week = weekStart(dayKey());
  const xp = (x) => (x.report && x.report.week === week ? x.report.xp : 0);
  return {
    name: c.name,
    status: status(c),
    hidden: m.hidden,
    assignments: c.assignments.map((a) => ({ id: a.id, unit: a.unit, due: a.due })),
    board: Object.values(c.members)
      .filter((x) => !x.hidden || x === m)
      .map((x) => ({ nickname: x.nickname, xp: xp(x), you: x === m }))
      .sort((a, b) => b.xp - a.xp || a.nickname.localeCompare(b.nickname)),
  };
}
export function hide(who, hidden) {
  const { m } = member(who);
  m.hidden = hidden === true;
  store.changed();
  return { ok: true };
}
// Leaving deletes the student's record: the teacher no longer sees them.
export function leave(who) {
  const { c } = member(who);
  delete c.members[String(who.memberId)];
  store.changed();
  return { ok: true };
}

// ---- housekeeping ------------------------------------------------------------------

// Daily: archived classes go 90 days after archiving.
export function purge(today = dayKey()) {
  for (const [id, c] of Object.entries(all())) if (c.archivedAt && addDays(c.archivedAt, KEEP_ARCHIVED_DAYS) <= today) delete all()[id];
  store.changed();
}
// A teacher's account deleted: their classes go with it.
export function dropTeacher(userId) {
  for (const [id, c] of Object.entries(all())) if (c.teacherId === userId) delete all()[id];
  store.changed();
}
export function stats() {
  const list = Object.values(all());
  const active = list.filter((c) => !c.archivedAt);
  return { classes: active.length, archived: list.length - active.length, teachers: new Set(list.map((c) => c.teacherId)).size, students: active.reduce((t, c) => t + Object.keys(c.members).length, 0), reporting: active.reduce((t, c) => t + Object.values(c.members).filter((m) => m.report).length, 0) };
}
