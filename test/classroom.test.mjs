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
assert.deepEqual(Object.keys(view).sort(), ["archivedAt", "assignments", "code", "concepts", "deletesOn", "id", "name", "open", "pilot", "students"]);
assert.deepEqual(Object.keys(view.pilot).sort(), ["feedback", "phase", "post", "pre", "questions", "started", "units"], "the pilot: totals only (tested below)");
assert.deepEqual(Object.keys(view.students[0]).sort(), ["assignments", "done", "id", "lessons", "missions", "nickname", "units"], "per student: only these");
const ana = view.students.find((s) => s.nickname === "Ana");
assert.equal(ana.lessons, lessonIds.length);
// `done`: which lessons, the list the teacher's screen shows. Only real lesson IDs, nothing else.
assert.deepEqual(ana.done, lessonIds);
assert.deepEqual(view.students.find((s) => s.nickname === "Caro").done, [lessonIds[0]], "a made-up lesson ID is dropped");
assert.equal(ana.units, 1);
assert.equal(ana.missions, 1);
assert.deepEqual(Object.values(ana.assignments)[0], { done: lessonIds.length, of: lessonIds.length });
assert.deepEqual(view.assignments.map((a) => [a.unit, a.done, a.of]), [["budget", 1, 3]]);
assert.equal(view.students.find((s) => s.nickname === "Caro").missions, 500, "capped");
assert.deepEqual(view.concepts.map((c) => [c.id, c.students, c.seen, c.missed]), [["budgeting", 3, 6, 4]], "class-wide totals, only for concepts 3+ students answered");
assert.doesNotMatch(JSON.stringify(view), /secret|Car for mom|5000|@example|13-17|how do I|fake_concept|nope/, "nothing else reaches the teacher");
// Earlier lessons: only if the student chooses, only in assigned units, only for assignments.
const save = UNITS.find((u) => u.id === "save");
assert.deepEqual(classReport(state, membership, today).earlier, [], "off by default");
assert.deepEqual(classReport(state, { ...membership, shareEarlier: true, assignedLessons: save.lessons.map((l) => l.id) }, today).earlier, ["save-1"], "on: lessons in assigned units finished before joining");
classes.assign(teacher, id, { unit: "save", due: addDays(today, 14) });
assert.deepEqual(classes.report(who(s3), { lessons: [lessonIds[0]], earlier: [save.lessons[0].id, lessonIds[1], "credit-1", lessonIds[0]], week: weekStart(today), xp: 999999 }).assigned, ["budget", "save"]);
const caro = classes.teacherView(teacher, id).students.find((s) => s.nickname === "Caro");
assert.equal(caro.lessons, 1, "earlier lessons don't count as finished since joining");
const [aBudget, aSave] = classes.teacherView(teacher, id).assignments;
assert.deepEqual([caro.assignments[aBudget.id].done, caro.assignments[aSave.id].done], [2, 1], "…only toward assignments (and only assigned units)");
classes.unassign(teacher, id, aSave.id);
console.log("ok: the teacher sees nicknames, lessons/units/missions since joining, assignment progress (earlier lessons only if the student chooses) and class-wide concept totals (3+ students) — never goals, amounts, notes, tutor questions, age or email");

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

// ACCOUNTS AND CLASSES (docs/SCHOOL-PLAN.md, Step 3): any account can belong to classes; the account stands in
// for the device's key, so a class follows a student from a school computer to their phone; progress never lives
// in a class.
{
  const t2 = store.addUser({ email: "t2@school.example", passwordHash: "x", nickname: "T2", ageBand: "26+" });
  store.updateUser(t2.id, { emailVerifiedAt: new Date().toISOString(), teacherTermsAt: new Date().toISOString() });
  flags.set("classroom", { email: "t2@school.example", on: true });
  const { id: cid } = classes.create(t2, "Linked class");
  const code2 = classes.list(t2).find((c) => c.id === cid).code;
  const user = (u) => store.userById(u.id);
  const kid = store.addUser({ email: "kid@home.example", passwordHash: "x", nickname: "Kid", ageBand: "13-17" });
  // Joined while signed in: linked at once.
  const j = classes.join({ code: code2, nickname: "Kid", ageBand: "13-17" }, "10.7.0.1", kid);
  assert.deepEqual(user(kid).classes, [{ classId: j.classId, memberId: j.memberId }]);
  // Another device: no key, the account stands in; signed out, the device keeps it (401, not "gone").
  const noKey = { classId: j.classId, memberId: j.memberId };
  assert.equal(classes.studentView(noKey, user(kid)).name, "Linked class");
  assert.equal(code(() => classes.studentView(noKey)), "SIGNED_OUT");
  const stranger = store.addUser({ email: "stranger@example.com", passwordHash: "x", nickname: "S", ageBand: "26+" });
  assert.equal(code(() => classes.studentView(noKey, stranger)), "GONE", "someone else's account can't");
  assert.deepEqual(classes.myClasses(user(kid)).classes.map((c) => [c.name, c.nickname]), [["Linked class", "Kid"]]);
  classes.report(noKey, { lessons: [UNITS[0].lessons[0].id] }, user(kid));
  assert.deepEqual(classes.teacherView(t2, cid).students.find((s) => s.nickname === "Kid").done, [UNITS[0].lessons[0].id], "a report from the other device counts");
  // A device that joined first, then signs in: the account claims the class.
  const later = store.addUser({ email: "later@home.example", passwordHash: "x", nickname: "Later", ageBand: "13-17" });
  const j2 = classes.join({ code: code2, nickname: "Later", ageBand: "13-17" }, "10.7.0.1");
  assert.equal(code(() => classes.claim(later, { ...j2, key: "wrong" })), "GONE", "only with the device's key");
  classes.claim(later, j2);
  assert.deepEqual(user(later).classes, [{ classId: j2.classId, memberId: j2.memberId }]);
  // Leaving, from any device, unlinks the account (the progress was never in the class).
  classes.leave(noKey, user(kid));
  assert.deepEqual(user(kid).classes, []);
  assert.equal(classes.teacherView(t2, cid).students.some((s) => s.nickname === "Kid"), false);
  // Removed by the teacher: the account's link is tidied away the next time it's read.
  classes.removeStudent(t2, cid, j2.memberId);
  assert.deepEqual(classes.myClasses(user(later)).classes, []);
  assert.deepEqual(user(later).classes, []);
  // An account deleted: its class records go with it.
  const gone = store.addUser({ email: "gone@home.example", passwordHash: "x", nickname: "Gone", ageBand: "13-17" });
  classes.join({ code: code2, nickname: "Gone", ageBand: "13-17" }, "10.7.0.1", gone);
  classes.dropStudent(user(gone));
  assert.equal(classes.teacherView(t2, cid).students.some((s) => s.nickname === "Gone"), false);
}
console.log("ok: any account can belong to classes: joined signed in or claimed later, then the account stands in for the device's key on another device; leaving or being removed unlinks it; deleting the account removes its class records");

// THE PILOT QUIZ AND FEEDBACK (docs/PILOT-PLAN.md): the same 10 questions before and after, from up to 4 units;
// graded on the server; the teacher sees totals only, from 3 students on; typed comments go to the owner only.
{
  const { quizFor } = await import("../src/modules/classroom/quiz.js");
  const { UNITS: FULL } = await import("../src/modules/lessons/units/all.js");
  const t3 = store.addUser({ email: "t3@school.example", passwordHash: "x", nickname: "T3", ageBand: "26+" });
  store.updateUser(t3.id, { emailVerifiedAt: new Date().toISOString(), teacherTermsAt: new Date().toISOString() });
  flags.set("classroom", { email: "t3@school.example", on: true });
  const { id: pid } = classes.create(t3, "Pilot class");
  const pcode = classes.list(t3).find((c) => c.id === pid).code;
  const kids = ["P1", "P2", "P3", "P4"].map((nickname) => classes.join({ code: pcode, nickname, ageBand: "13-17" }, "10.8.0.1"));
  const pv = () => classes.teacherView(t3, pid).pilot;
  assert.equal(code(() => classes.update(t3, pid, { quiz: "pre" })), "NO_UNITS", "units first");
  classes.update(t3, pid, { pilotUnits: ["budget", "save", "banking", "credit", "scams", "nope"] });
  assert.deepEqual(pv().units, ["budget", "save", "banking", "credit"], "up to 4 real units");
  classes.update(t3, pid, { pilotUnits: ["budget", "save", "banking"] });
  const qs = quizFor(FULL, ["budget", "save", "banking"]);
  assert.equal(qs.length, 10, "10 questions, taken in turn from each unit");
  assert.equal(quizFor(FULL, ["budget"]).length, 4, "fewer when the units have fewer");
  assert.deepEqual(pv().questions.map((q) => q.id), qs.map((q) => q.id), "the teacher sees the same questions");
  assert.equal(code(() => classes.answerQuiz(kids[0], { phase: "pre", answers: [] })), "CLOSED_QUIZ", "not before it opens");
  classes.update(t3, pid, { quiz: "pre" });
  const seen = classes.studentView(kids[0]).quiz;
  assert.equal(seen.phase, "pre");
  assert.equal(seen.questions.length, 10);
  assert.ok(seen.questions.every((q) => !("answer" in q)), "a device never gets the answers");
  const right = qs.map((q) => q.answer);
  const wrong = qs.map((q) => (q.answer + 1) % (q.tf ? 2 : q.options.length));
  assert.deepEqual(classes.answerQuiz(kids[0], { phase: "pre", answers: right }), { score: 10, of: 10 });
  assert.equal(code(() => classes.answerQuiz(kids[0], { phase: "pre", answers: right })), "TAKEN", "once");
  classes.answerQuiz(kids[1], { phase: "pre", answers: wrong });
  assert.deepEqual(pv().pre, { taken: 2 }, "under 3 students: a count, no scores");
  assert.equal(code(() => classes.update(t3, pid, { pilotUnits: ["credit"] })), "STARTED", "units stay once it's started");
  classes.answerQuiz(kids[2], { phase: "pre", answers: right.map((a, i) => (i < 5 ? a : wrong[i])) });
  assert.equal(pv().pre.taken, 3);
  assert.equal(pv().pre.average, 50, "(10 + 0 + 5) of 30");
  assert.equal(pv().pre.perQuestion.length, 10);
  assert.equal(classes.studentView(kids[0]).quiz.taken, true);
  assert.equal(classes.studentView(kids[0]).quiz.questions, null);
  // After: everyone right; then the end-of-pilot questions.
  classes.update(t3, pid, { quiz: "post" });
  assert.equal(code(() => classes.feedback(kids[0], { enjoyed: "yes", learned: "yes", again: "yes" })), 400, "only after the after quiz");
  for (const k of kids.slice(0, 3)) classes.answerQuiz(k, { phase: "post", answers: right });
  assert.equal(pv().post.average, 100);
  assert.deepEqual(classes.studentView(kids[0]).feedback, { given: false });
  assert.equal(code(() => classes.feedback(kids[0], { enjoyed: "yes", learned: "maybe", again: "yes" })), 400, "real choices only");
  classes.feedback(kids[0], { enjoyed: "yes", learned: "yes", again: "maybe", comment: "The <b>zebracorn</b> card confused me" });
  classes.feedback(kids[1], { enjoyed: "some", learned: "yes", again: "yes" });
  assert.deepEqual(pv().feedback, { n: 2 }, "under 3: a count only");
  classes.feedback(kids[2], { enjoyed: "yes", learned: "some", again: "no" });
  assert.deepEqual(pv().feedback, { n: 3, enjoyed: { yes: 2, some: 1, no: 0 }, learned: { yes: 2, some: 1, no: 0 }, again: { yes: 1, maybe: 1, no: 1 } });
  const comments = classes.pilotComments();
  assert.equal(comments[0].text, "The  b zebracorn /b  card confused me", "no markup kept");
  assert.equal(comments[0].className, "Pilot class");
  assert.deepEqual(Object.keys(comments[0]).sort(), ["className", "day", "text"], "no nickname or member with a comment");
  const tv = JSON.stringify(classes.teacherView(t3, pid));
  assert.ok(!tv.includes("zebracorn"), "the teacher never sees what students typed");
  assert.ok(!/"score"|"P1"[^}]*"pre"/.test(tv), "no per-student scores");
  // Leaving takes a student's answers out of the totals.
  classes.leave(kids[0]);
  assert.equal(pv().pre.taken, 2);
  assert.deepEqual(pv().feedback, { n: 2 });
}
console.log("ok: the pilot quiz: up to 4 units, the same 10 questions before and after, graded on the server (a device never gets the answers), once per student, totals only from 3 students; end-of-pilot answers as totals, typed comments for the owner only; leaving takes a student's answers out");

// ON FOR TESTERS ONLY (docs/PILOT-PLAN.md): by email before the account exists, or listed in the environment; off
// for everyone else.
{
  const later = () => store.userByEmail("pilot.teacher@school.example");
  assert.deepEqual(flags.set("classroom", { email: "Pilot.Teacher@School.example", on: true }), { ok: true }, "an email with no account yet");
  let row = flags.list().find((f) => f.flag === "classroom");
  assert.ok(row.waiting.includes("pilot.teacher@school.example"));
  assert.equal(row.all, false, "still off for everyone");
  const pt = store.addUser({ email: "pilot.teacher@school.example", passwordHash: "x", nickname: "PT", ageBand: "26+" });
  assert.equal(flags.isOn("classroom", pt), true, "it applies when they sign up");
  assert.equal(flags.isOn("classroom", store.addUser({ email: "someone.else@example.com", passwordHash: "x", nickname: "S", ageBand: "26+" })), false, "nobody else");
  row = flags.list().find((f) => f.flag === "classroom");
  assert.ok(!row.waiting.includes("pilot.teacher@school.example"), "no longer waiting once the account exists");
  flags.set("classroom", { email: "pilot.teacher@school.example", on: false });
  assert.equal(flags.isOn("classroom", later()), false, "off again");
  assert.equal(code(() => flags.set("classroom", { email: "not an email", on: true })), 400);
  // Named in the environment (a host's .env, or a home test).
  process.env.CLASSROOM_TESTERS = " Pilot.Teacher@school.example , other@x.example";
  assert.equal(flags.isOn("classroom", later()), true);
  assert.deepEqual(flags.list().find((f) => f.flag === "classroom").env, ["pilot.teacher@school.example", "other@x.example"]);
  delete process.env.CLASSROOM_TESTERS;
  assert.equal(flags.isOn("classroom", later()), false);
  // An account deleted: its email is forgotten too.
  flags.set("classroom", { email: "gone.teacher@school.example", on: true });
  flags.forget("no-such-id", "gone.teacher@school.example");
  assert.ok(!flags.list().find((f) => f.flag === "classroom").waiting.includes("gone.teacher@school.example"));
}
console.log("ok: classroom mode on for testers only: by email before they have an account (it applies at sign-up), or listed in CLASSROOM_TESTERS; nobody else; off again; a deleted account's email is forgotten");
