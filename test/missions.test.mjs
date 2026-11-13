// real-life missions: which ones fit (country, age, goal), their order (main
// goal, then this week's units), the weekly suggestion, finishing with a
// note, XP once (weekly for repeatable ones), and the achievements.
import assert from "node:assert/strict";
import * as M from "../src/modules/missions/pick.js";
import { MISSIONS } from "../src/modules/missions/catalog.js";
import { newProgress, completeMission, awardBadges, XP } from "../src/core/progress.js";

const monday = "2026-10-26";
const ids = (list) => list.map((m) => m.id);
const base = { region: "US", ageBand: "18-25", goalKinds: [], units: {} };

// Who each mission fits.
const all = ids(M.recommend(base, [], monday));
assert.ok(!all.includes("afore"), "Mexico-only missions stay out of the US");
assert.ok(ids(M.recommend({ ...base, region: "MX" }, [], monday)).includes("afore"));
assert.ok(all.includes("creditreport"), "adults get the credit report mission");
assert.ok(!ids(M.recommend({ ...base, ageBand: "13-17" }, [], monday)).includes("creditreport"), "13–17 don't");
assert.ok(!ids(M.recommend({ ...base, ageBand: null }, [], monday)).includes("creditreport"), "an unknown age counts as 13–17");
assert.ok(!all.includes("setaside") && !all.includes("debtrate"), "goal missions need a goal");
assert.ok(ids(M.recommend({ ...base, goalKinds: ["car"] }, [], monday)).includes("setaside"));
assert.ok(!ids(M.recommend({ ...base, goalKinds: ["car"] }, [], monday)).includes("debtrate"), "the debt mission needs a debt goal");
for (const region of ["US", "MX"]) for (const ageBand of ["13-17", "18-25"]) assert.ok(M.recommend({ ...base, region, ageBand, goalKinds: ["custom"] }, [], monday).length >= 25, "plenty for everyone");
console.log("ok: missions fit the country, the age range and the goals");

// Order: the main goal's missions, then units studied this week, then started units.
assert.equal(M.recommend({ ...base, goalKinds: ["car", "travel"] }, [], monday)[0].id, "carcost");
assert.equal(M.recommend({ ...base, goalKinds: ["travel", "car"] }, [], monday)[0].id, "tripcost");
assert.deepEqual(ids(M.recommend({ ...base, goalKinds: ["car"], units: { started: ["save"], recent: ["save"] } }, [], monday)).slice(0, 2), ["carcost", "setaside"], "the goal's own mission, then setting money aside");
const studied = M.recommend({ ...base, units: { started: ["budget", "banking"], recent: ["banking"] } }, [], monday);
assert.deepEqual(ids(studied).slice(0, 2), ["bankfees", "compare2"], "this week's unit first");
assert.equal(studied[2].unit, "budget", "then a started unit");
assert.equal(M.forUnit("scams", base, [], monday).id, "redflags", "after a lesson: a mission from its unit");
console.log("ok: ordered by the main goal, then this week's lessons");

// The week's suggestion stays put, "show another" moves on, and a new week resets it.
let s = { ...M.DEFAULTS };
const first = M.thisWeek(s, base, monday).suggestion.id;
assert.equal(M.thisWeek(s, base, "2026-10-29").suggestion.id, first, "same suggestion all week");
s = M.another(s, base, monday);
const second = M.thisWeek(s, base, "2026-10-30").suggestion.id;
assert.notEqual(second, first);
assert.equal(M.thisWeek(s, base, "2026-11-02").suggestion.id, first, "Monday starts fresh");
console.log("ok: one suggestion a week; show another moves down the list");

// Start, finish with a note, XP once.
s = M.start(s, "track3", monday);
assert.equal(M.thisWeek(s, base, monday).active.id, "track3");
let r = M.finish(s, "track3", `  ${"x".repeat(400)}  `, "2026-10-28");
assert.equal(r.first, true);
assert.equal(r.slice.active, null);
assert.equal(r.slice.log[0].note.length, M.NOTE_MAX, "notes are capped");
assert.deepEqual({ ...r.slice.log[0], note: undefined }, { id: "track3", day: "2026-10-28", week: monday, note: undefined });
assert.equal(M.finish(r.slice, "sort10", "   ", monday).slice.log[1].note, undefined, "a blank note isn't kept");
assert.ok(!ids(M.recommend(base, r.slice.log, "2027-01-04")).includes("track3"), "done for good");
assert.equal(M.finish(r.slice, "track3", "", "2026-12-01").first, false, "no XP the second time");
const goal = { ...base, goalKinds: ["car"] };
let w = M.finish(M.DEFAULTS, "setaside", "", monday);
assert.ok(!ids(M.recommend(goal, w.slice.log, "2026-11-01")).includes("setaside"), "weekly: done for this week");
assert.equal(M.finish(w.slice, "setaside", "", "2026-11-01").first, false, "weekly: XP once a week");
assert.ok(ids(M.recommend(goal, w.slice.log, "2026-11-02")).includes("setaside"), "weekly: back next week");
assert.equal(M.finish(w.slice, "setaside", "", "2026-11-02").first, true);
assert.equal(M.thisWeek(r.slice, base, "2026-10-28").done.length, 1, "this week's finished missions");
console.log("ok: finishing keeps an optional short note; XP the first time (weekly ones, once a week)");

// XP and achievements.
let p = newProgress();
let x = completeMission(p, { first: true }, monday);
assert.equal(x.gained, XP.mission);
assert.equal(x.p.days[monday], XP.mission, "counts toward today's goal and the league");
assert.equal(x.p.streak.count, 0, "missions don't extend the learning streak");
assert.equal(completeMission(x.p, { first: false }, monday).gained, 0);
const log = ["2026-10-05", "2026-10-12", "2026-10-19", "2026-10-26", "2026-10-27"].map((day, i) => ({ id: MISSIONS[i].id, day, week: day === "2026-10-27" ? "2026-10-26" : day }));
assert.equal(M.weeksWithMissions(log), 4);
assert.deepEqual(awardBadges(p, { missionsDone: 5, missionWeeks: 4 }, monday).fresh, ["mission_1", "mission_5", "mission_weeks_4"]);
console.log("ok: 20 XP a mission (not the streak); achievements at 1, 5 and 4 different weeks");
