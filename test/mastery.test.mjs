// The learning engine: mastery levels per concept, spaced review, review
// picking and question choice by strength, the migration for learners
// from before mastery, and placement. (The content it needs is checked by
// test/content.test.mjs.)
import assert from "node:assert/strict";
import * as M from "../src/modules/lessons/mastery.js";
import { conceptsOfLesson, conceptPool, lessonState, nextLesson, nextFor, loadAll, unitLoaded } from "../src/modules/lessons/content.js";
import { newProgress, completeReview } from "../src/core/progress.js";

const day = "2026-03-02";
let r = M.applyResult(undefined, true, day);
assert.deepEqual([M.levelOf(undefined), M.levelOf(r)], ["new", "learning"]);
assert.equal(r.due, "2026-03-03", "first right answer: see it again tomorrow");
r = M.applyResult(r, true, "2026-03-03");
r = M.applyResult(r, true, "2026-03-06");
assert.equal(r.box, 3);
assert.equal(M.levelOf(r), "solid");
assert.equal(r.due, "2026-03-13", "a solid concept comes back after a week");
const early = M.applyResult(r, true, "2026-03-07");
assert.equal(early.box, 3, "reviewing before it's due doesn't promote it");
assert.equal(early.seen, r.seen + 1);
const missed = M.applyResult(r, false, "2026-03-13");
assert.equal(missed.box, 0);
assert.equal(missed.due, "2026-03-13", "a miss makes it due right away");
let m = r;
for (const d of ["2026-03-13", "2026-03-29", "2026-05-03"]) m = M.applyResult(m, true, d);
assert.equal(M.levelOf(m), "mastered");
assert.equal(m.box, 5);
console.log("ok: mastery levels new → learning → solid → mastered, spaced, misses reset");

const session = M.applySession({}, [{ c: "fees", right: true }, { c: "fees", right: false }, { c: "budgeting", right: true }, { c: null, right: true }], day);
assert.equal(session.fees.box, 0, "asked twice in a session: right only if both were right");
assert.equal(session.budgeting.box, 1);
assert.equal(Object.keys(session).length, 2);
console.log("ok: a session updates each concept once");

const concepts = {
  a: { box: 3, seen: 3, right: 3, last: "2026-02-20", due: "2026-03-01" },
  b: { box: 0, seen: 2, right: 1, last: "2026-03-01", due: "2026-03-01" },
  c: { box: 4, seen: 4, right: 4, last: "2026-02-01", due: "2026-04-01" },
  d: { box: 2, seen: 2, right: 2, last: "2026-02-27", due: "2026-03-02" },
};
assert.deepEqual(M.pickReview(concepts, day), { ids: ["b", "d", "a"], due: 3 }, "due concepts, weakest first");
assert.deepEqual(M.pickReview({ c: concepts.c }, day).ids, ["c"], "nothing due: practice the longest-unseen anyway");
assert.equal(M.pickReview({}, day).ids.length, 0);
assert.equal(M.nextDue({ c: concepts.c, a: concepts.a }), "2026-03-01");
// Units load on demand: before, a unit's questions aren't there; after, they are.
assert.equal(unitLoaded("compound"), false, "units start unloaded (the app fetches them when needed)");
await loadAll();
assert.equal(unitLoaded("compound"), true);
const pool = conceptPool("compound_interest");
assert.equal(pool.lesson.length, 3);
assert.ok(pool.lesson.some((q) => q.type === "estimate"), "the new kinds of question join reviews too");
assert.equal(M.pickQuestion(pool, undefined), pool.easy, "new or weak: the easier question first");
assert.equal(M.pickQuestion(pool, { box: 5, seen: 0 }), pool.challenge, "strong: the challenge");
assert.ok(pool.lesson.includes(M.pickQuestion(pool, { box: 2, seen: 0 })), "in between: a lesson question");
assert.notEqual(M.pickQuestion(pool, { box: 2, seen: 0 }), M.pickQuestion(pool, { box: 2, seen: 1 }), "rotates");
console.log("ok: review picks due concepts weakest-first, and questions by strength");

const seeded = M.seedFromLessons({ "budget-1": { done: true, best: 0, last: "2026-02-10" }, "credit-1": { done: true, best: 2 }, "save-1": { done: false } }, conceptsOfLesson, day);
assert.deepEqual(Object.keys(seeded).sort(), ["borrowing_cost", "budgeting"]);
assert.equal(seeded.budgeting.box, 2, "a perfect lesson starts a little stronger");
assert.equal(seeded.borrowing_cost.box, 1);
assert.equal(seeded.budgeting.due, day, "due today, so the first review has something");
console.log("ok: learners from before mastery start from the lessons they finished");

assert.deepEqual(M.placedUnits(["budget", "save", "credit"], [true, true, false]), ["budget", "save"]);
assert.deepEqual(M.placedUnits(["budget", "save"], [false]), []);
assert.deepEqual(M.placedUnits(["budget", "save"], [true, true]), ["budget", "save"]);
const placedC = M.placeConcepts({}, ["budgeting", "needs_wants"], day);
assert.equal(M.levelOf(placedC.budgeting), "solid");
let p = { ...newProgress(), startUnit: "budget", placed: ["budget", "save"] };
assert.equal(lessonState(p, "banking-1"), "open", "the unit after tested-out ones opens");
assert.equal(lessonState(p, "budget-2"), "open", "tested-out units stay open to take");
assert.equal(lessonState(p, "credit-1"), "locked");
assert.equal(nextLesson(p).id, "banking-1", "what's next skips tested-out units");
assert.equal(nextFor(p, ["budget", "save", "banking"]).id, "banking-1");
assert.equal(nextLesson({ ...newProgress(), startUnit: "budget" }).id, "budget-1", "without placement nothing changes");
assert.ok(M.offersChallenge({ done: true, best: 0 }) && !M.offersChallenge({ done: true, best: 1 }));
const rv = completeReview({ ...newProgress(), dailyGoal: 10 }, { kind: "review" }, day);
assert.equal(rv.p.days[day], 10, "a review counts toward today's goal");
assert.equal(rv.p.streak.count, 1, "and the streak");
assert.deepEqual(rv.p.lessons, {}, "without marking a lesson done");
console.log("ok: placement opens later units and skips known ones; reviews count toward goal and streak");
