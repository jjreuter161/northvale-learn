// Growth and schools, on the server: the classroom flag, what a teacher
// needs, joining with a code (13+, unique nicknames, closed classes, new
// codes, wrong-code throttling), what the teacher sees (and never sees),
// concept totals only from 3+ students, the student's own view and
// leaderboard (hide yourself), leaving, pausing and deleting classes;
// invite links and their rewards, friends; the recap's pause note.
import assert from "node:assert/strict";
import { mkdtempSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";

process.env.NORTHVALE_DATA = mkdtempSync(join(tmpdir(), "nvlearn-classroom-"));
process.env.SMTP_USER = "";
const { store } = await import("../server/store.js");
const flags = await import("../server/flags.js");
const classes = await import("../server/classes.js");
const invites = await import("../server/invites.js");
const recap = await import("../server/recap.js");
const { UNITS } = await import("../src/modules/lessons/content.js");
const { classReport } = await import("../src/modules/classroom/report.js");
const { dayKey, addDays, weekStart } = await import("../src/core/progress.js");

const code = (fn) => {
  try {
    fn();
  } catch (e) {
    return e.code || e.status;
  }
  return "no error";
};
const today = dayKey();

// --- the flag, and what a teacher needs ---
const teacher = store.addUser({ email: "ms.r@school.example", passwordHash: "x", nickname: "Ms R", ageBand: "26+" });
const teen = store.addUser({ email: "teen@example.com", passwordHash: "x", nickname: "Teen", ageBand: "13-17" });
assert.deepEqual(flags.flagsFor(teacher), { classroom: false }, "off by default");
assert.equal(code(() => classes.create(teacher, "Period 3")), "NO_CLASSROOM");
flags.set("classroom", { email: "MS.R@school.example", on: true });
flags.set("classroom", { email: "teen@example.com", on: true });
assert.equal(flags.isOn("classroom", teacher), true);
assert.equal(flags.isOn("classroom", null), false, "not for anyone else");
assert.equal(code(() => classes.create(teen, "My class")), "ADULT", "teachers are 18+");
assert.equal(code(() => classes.create(teacher, "Period 3")), "VERIFY", "with a confirmed email");
store.updateUser(teacher.id, { emailVerifiedAt: "2026-10-26T00:00:00Z" });
assert.equal(code(() => classes.create(teacher, "Period 3")), "TERMS", "and the teacher terms accepted");
store.updateUser(teacher.id, { teacherTermsAt: "2026-10-26T00:00:00Z" });
const { id } = classes.create(teacher, "Period 3 <b>Econ</b>");
let view = classes.teacherView(teacher, id);
assert.equal(view.name, "Period 3 bEcon/b");
assert.match(view.code, /^[A-HJ-NP-Z2-9]{6}$/, "6 characters, none that look alike");
console.log("ok: classroom mode is off unless turned on per account; teachers need 18+, a confirmed email and the teacher terms");

// --- joining ---
const ip = "10.0.0.1";
assert.equal(code(() => classes.lookup("ZZZZZZ", ip)), "BAD_CODE");
assert.deepEqual(classes.lookup(view.code.toLowerCase().replace(/(...)/, "$1-"), ip), { name: "Period 3 bEcon/b" }, "codes forgive case and dashes");
assert.equal(code(() => classes.join({ code: view.code, nickname: "Kid", ageBand: null }, ip)), "AGE", "13 and up");
const enter = (nickname) => classes.join({ code: view.code, nickname, ageBand: "13-17" }, ip);
const s1 = enter("Ana");
const s2 = enter("Beto");
const s3 = enter("Caro");
assert.equal(code(() => enter("ana")), "TAKEN", "one nickname per class");
assert.equal(s1.name, "Period 3 bEcon/b");
assert.ok(s1.key.length >= 32, "a secret key for the device");
classes.update(teacher, id, { open: false });
assert.equal(code(() => enter("Dani")), "CLOSED", "a teacher can close a class to new students");
classes.update(teacher, id, { open: true, newCode: true });
assert.equal(code(() => enter("Dani")), "BAD_CODE", "a new code: the old one stops working");
view = classes.teacherView(teacher, id);
for (let i = 0; i < 125; i++) code(() => classes.lookup("WRONG1", "10.0.0.9"));
assert.equal(code(() => classes.lookup(view.code, "10.0.0.9")), 429, "wrong codes are throttled per address");
console.log("ok: joining with a code and a nickname (13+, one nickname per class); close to new students, new code, wrong codes throttled");

// --- what the device reports, and what the teacher sees ---
const budget = UNITS.find((u) => u.id === "budget");
const lessonIds = budget.lessons.map((l) => l.id);
const joined = addDays(today, -3);
const membership = { classId: id, memberId: s1.memberId, key: s1.key, joined, base: { budgeting: [2, 1] } };
const state = {
  progress: {
    days: { [today]: 30, [addDays(today, -10)]: 99 },
    lessons: { ...Object.fromEntries(lessonIds.map((l) => [l, { done: true, at: addDays(today, -20), last: today }])), "save-1": { done: true, at: addDays(today, -20), last: addDays(today, -20) } },
  },
  modules: {
    lessons: { concepts: { budgeting: { box: 0, seen: 5, right: 2 }, needs_wants: { box: 1, seen: 1, right: 1 } } },
    missions: { log: [{ id: "spend-3", week: weekStart(joined), day: today, note: "My secret note" }, { id: "old", day: addDays(today, -30), note: "older" }] },
    goals: { goals: [{ name: "Car for mom", target: 5000 }] },
  },
};
const r = classReport(state, membership, today);
assert.deepEqual(r.lessons, lessonIds, "only lessons finished since joining");
assert.deepEqual(r.concepts, { budgeting: [3, 2], needs_wants: [1, 0] }, "answers since joining (minus what was there at joining)");
assert.equal(r.missions, 1);
assert.equal(r.xp, 30, "this week's XP since joining");
assert.doesNotMatch(JSON.stringify(r), /secret|Car for mom|5000|older/, "no notes, goals or amounts leave the device");
const who = (s) => ({ classId: id, memberId: s.memberId, key: s.key });
classes.report(who(s1), { ...r, goals: [{ name: "Car for mom", amount: 5000 }], note: "My secret note", email: "ana@example.com", ageBand: "13-17", tutor: ["how do I…"] });
classes.report(who(s2), { lessons: lessonIds.slice(0, 2), concepts: { budgeting: [2, 2] }, missions: 0, week: weekStart(today), xp: 10 });
classes.report(who(s3), { lessons: ["nope", lessonIds[0]], concepts: { budgeting: [1, 0], fake_concept: [9, 9], needs_wants: [1, 1] }, missions: 99999, week: weekStart(today), xp: 999999 });
classes.assign(teacher, id, { unit: "budget", due: addDays(today, 7) });
assert.equal(code(() => classes.assign(teacher, id, { unit: "budget", due: "2001-01-01" })), 400);
view = classes.teacherView(teacher, id);
assert.deepEqual(Object.keys(view).sort(), ["archivedAt", "assignments", "code", "concepts", "deletesOn", "id", "name", "open", "students"]);
assert.deepEqual(Object.keys(view.students[0]).sort(), ["assignments", "id", "lessons", "missions", "nickname", "units"], "per student: only these");
const ana = view.students.find((s) => s.nickname === "Ana");
assert.equal(ana.lessons, lessonIds.length);
assert.equal(ana.units, 1);
assert.equal(ana.missions, 1);
assert.deepEqual(Object.values(ana.assignments)[0], { done: lessonIds.length, of: lessonIds.length });
assert.deepEqual(view.assignments.map((a) => [a.unit, a.done, a.of]), [["budget", 1, 3]]);
assert.equal(view.students.find((s) => s.nickname === "Caro").missions, 500, "capped");
assert.deepEqual(view.concepts.map((c) => [c.id, c.students, c.seen, c.missed]), [["budgeting", 3, 6, 4]], "class-wide totals, only for concepts 3+ students answered");
assert.doesNotMatch(JSON.stringify(view), /secret|Car for mom|5000|@example|13-17|how do I|fake_concept|nope/, "nothing else reaches the teacher");
console.log("ok: the teacher sees nicknames, lessons/units/missions since joining, assignment progress and class-wide concept totals (3+ students) — never goals, amounts, notes, tutor questions, age or email");

// --- the student's side: leaderboard, hiding, leaving ---
let sv = classes.studentView(who(s2));
assert.deepEqual(sv.board.map((b) => [b.nickname, b.xp]), [["Caro", 3500], ["Ana", 30], ["Beto", 10]]);
assert.deepEqual(Object.keys(sv.board[0]).sort(), ["nickname", "xp", "you"], "nicknames and XP only");
classes.hide(who(s3), true);
sv = classes.studentView(who(s2));
assert.deepEqual(sv.board.map((b) => b.nickname), ["Ana", "Beto"], "hidden students are left off everyone else's board");
assert.ok(classes.studentView(who(s3)).board.some((b) => b.you), "but still see themselves");
assert.equal(code(() => classes.studentView({ ...who(s2), key: "wrong" })), "GONE", "the member key is checked");
classes.leave(who(s1));
assert.equal(code(() => classes.report(who(s1), r)), "GONE");
assert.ok(!classes.teacherView(teacher, id).students.some((s) => s.nickname === "Ana"), "leaving removes the student from the teacher's view");
classes.removeStudent(teacher, id, s2.memberId);
assert.equal(code(() => classes.studentView(who(s2))), "GONE", "a teacher can remove a student");
console.log("ok: the class leaderboard (nicknames, this week's XP; anyone can hide); leaving deletes the student's record");

// --- paused, ended, deleted ---
flags.set("classroom", { email: "ms.r@school.example", on: false });
assert.equal(classes.report(who(s3), r).status, "paused", "turned off for the teacher: the class pauses");
assert.equal(code(() => classes.lookup(view.code, ip)), "BAD_CODE", "and its code stops working");
flags.set("classroom", { email: "ms.r@school.example", on: true });
classes.update(teacher, id, { archived: true });
assert.equal(classes.studentView(who(s3)).status, "ended");
assert.equal(classes.list(teacher)[0].deletesOn, addDays(today, 90));
classes.purge(addDays(today, 89));
assert.equal(classes.list(teacher).length, 1);
classes.purge(addDays(today, 90));
assert.equal(classes.list(teacher).length, 0, "archived classes are deleted after 90 days");
classes.create(teacher, "Club");
classes.dropTeacher(teacher.id);
assert.equal(classes.list(teacher).length, 0, "a deleted teacher account takes its classes");
console.log("ok: a class pauses when classroom mode is turned off for its teacher; archived classes are deleted 90 days later, and with the teacher's account");

// --- invites and friends ---
const a = invites.ensure({}, null, ip);
assert.ok(a.code && a.key);
assert.deepEqual(invites.ensure(a, teacher, ip), { code: a.code }, "the same link; an account now owns it");
const friend = "11111111-2222-4333-8444-555555555555";
invites.opened(a.code, friend, ip);
invites.opened(a.code, friend, ip);
assert.deepEqual(invites.joined(a.code, friend, ip), { reward: true }, "a friend's first lesson: a freeze for them…");
assert.deepEqual(invites.joined(a.code, friend, ip), { reward: false }, "once");
assert.deepEqual(invites.claim(a.code, a.key), { rewards: 1, joined: 1 }, "…and one waiting for the inviter");
assert.deepEqual(invites.claim(a.code, a.key), { rewards: 0, joined: 1 });
assert.equal(code(() => invites.claim(a.code, "wrong")), 404);
for (let i = 0; i < 30; i++) invites.joined(a.code, `11111111-2222-4333-8444-${String(i).padStart(12, "0")}`, `10.1.0.${i}`);
assert.equal(invites.claim(a.code, a.key).rewards, 19, "at most 20 rewards per link");
assert.deepEqual(invites.stats(), { links: 1, opened: 1, joined: 31, rewarded: 20, friendLinks: 0 });
assert.equal(code(() => invites.befriend(teacher, a.code)), 400, "not your own link");
invites.befriend(teen, a.code);
assert.deepEqual(invites.friendsOf(teacher.id).map((f) => f.userId), [teen.id]);
invites.unfriend(teen, invites.friendsOf(teen.id)[0].id);
assert.equal(invites.friendsOf(teacher.id).length, 0, "either friend can remove the link");
invites.befriend(teen, a.code);
invites.dropUser(teacher.id);
assert.equal(invites.friendsOf(teen.id).length, 0, "a deleted account leaves no friend links");
invites.forget(a.code, a.key);
assert.equal(invites.stats().links, 0);
console.log("ok: invite links: a streak freeze each when the friend finishes a first lesson (once per friend, 20 at most), friends leagues through links, all removable");

// --- the weekly recap pauses itself, with one short note ---
process.env.MAIL_POSTAL_ADDRESS = "PO Box 123, Austin, TX 78701";
const leo = store.addUser({ email: "leo@example.com", passwordHash: "x", nickname: "Leo", ageBand: "18-25" });
assert.equal(leo.recap, undefined, "the recap is off until the learner turns it on");
store.updateUser(leo.id, { recap: true });
store.setProgress(leo.id, { settings: { lang: "es" }, progress: { lessonDays: ["2026-09-01"] }, snapshot: { tz: "America/Chicago" } }, 1, "2026-10-26");
const mails = [];
await recap.tick(new Date("2026-11-01T23:30:00Z"), { users: store.allUsers, progressOf: store.progress, base: "https://learn.example", send: async (x) => mails.push(x) });
assert.equal(mails.length, 1);
assert.equal(mails[0].subject, "Pausamos tu resumen semanal");
assert.match(mails[0].text, /Pausamos tu resumen semanal\. Puedes volver a activarlo cuando quieras en Ajustes\./);
assert.match(mails[0].text, /PO Box 123, Austin, TX 78701$/, "the mailing address from settings, at the bottom");
assert.equal(store.userById(leo.id).recap, false, "and it's off now");
await recap.tick(new Date("2026-11-08T23:30:00Z"), { users: store.allUsers, progressOf: store.progress, base: "x", send: async (x) => mails.push(x) });
assert.equal(mails.length, 1, "then nothing");
const week = recap.recapFor({ user: leo, state: { settings: { lang: "en" }, progress: { lessonDays: ["2026-10-30"] } }, today: "2026-11-01", base: "x" });
assert.match(week.text, /PO Box 123, Austin, TX 78701$/);
delete process.env.MAIL_POSTAL_ADDRESS;
console.log("ok: the recap pauses itself after 4 quiet weeks with one short note (\"Turn them back on anytime in Settings\"); the mailing address goes in the footer once it's set");
