// The Goals module's rules: a new goal's plan, saved vs. "with practice
// investments", on track / behind / ahead against the plan, what it takes
// from here, milestones once each, re-planning after an edit (entries
// kept), the Sunday check-in, each goal's own currency, and the templates.
import assert from "node:assert/strict";
import * as G from "../src/modules/goals/plan.js";
import { exampleRates, monthlyFor, monthsTo } from "../src/modules/goals/engine.js";
import { UNITS } from "../src/modules/lessons/content.js";

const today = "2026-01-15";
const car = G.newGoal({ id: "g1", templateId: "car", name: "A car", target: 5000, months: 36, start: 400, today, region: "US" });
assert.equal(car.targetDate, "2029-01-15");
assert.equal(car.path, "save", "the car template plans on a savings account");
assert.equal(car.monthly, Math.ceil(monthlyFor({ start: 400, target: 5000, months: 36, annualPct: 3.5 })));
assert.equal(G.addMonths("2026-01-31", 1), "2026-02-28", "month ends stay valid");
console.log("ok: a new goal gets a dated plan (monthly amount on its path)");

assert.equal(G.progressOf(car, 0), 400);
const withMore = { ...car, contributions: [{ date: "2026-02-01", amount: 120 }] };
assert.equal(G.progressOf(withMore, 300), 820, "set aside + recorded + linked investments");
assert.equal(G.statusOf(car, 400, today), "on_track", "a brand-new goal is on track");
// Six months in: the plan expects about 400 + 6 monthly amounts.
const sixMonths = "2026-07-15";
const expected = G.expectedNow(car, sixMonths);
assert.ok(expected > 400 + 6 * car.monthly - 1 && expected < 400 + 6 * car.monthly + 40, "about six planned months (with a little growth)");
assert.equal(G.statusOf(car, expected, sixMonths), "on_track");
assert.equal(G.statusOf(car, expected + car.monthly, sixMonths), "ahead");
assert.equal(G.statusOf(car, expected - car.monthly, sixMonths), "behind");
assert.equal(G.statusOf(car, 5000, sixMonths), "done");
assert.equal(G.statusOf({ ...car, status: "paused" }, 100, sixMonths), "paused");
console.log("ok: on track / ahead / behind against the plan; done and paused");

const n = G.needs(car, 2000, sixMonths);
assert.equal(n.monthsLeft, 30);
assert.equal(n.perMonth, Math.ceil(monthlyFor({ start: 2000, target: 5000, months: 30, annualPct: 3.5 })));
assert.deepEqual(n.byPath.map((p) => p.path), ["cash", "save", "invest"]);
assert.ok(n.byPath[0].months >= n.byPath[1].months && n.byPath[1].months >= n.byPath[2].months, "growth shortens the timeline");
assert.equal(n.byPath[0].months, monthsTo({ start: 2000, monthly: car.monthly, target: 5000 }));
assert.equal(G.needs(car, 6000, sixMonths).perMonth, 0);
const midMonth = "2026-07-20"; // 6 plan months gone, a few days past the 15th
const aheadNow = G.expectedNow(car, midMonth) + car.monthly;
assert.equal(G.statusOf(car, aheadNow, midMonth), "ahead");
assert.ok(G.needs(car, aheadNow, midMonth).perMonth < car.monthly, "ahead of the plan never needs more than the plan");
console.log("ok: what it takes from here, and how each path changes the timeline");

assert.deepEqual(G.newMilestones(car, 1300), [25]);
assert.deepEqual(G.newMilestones({ ...car, milestones: { 25: "x" } }, 2600), [50]);
assert.deepEqual(G.newMilestones(car, 5000), [25, 50, 75, 100]);
assert.deepEqual(G.newMilestones({ ...car, milestones: { 25: "x", 50: "x", 75: "x", 100: "x" } }, 5000), []);
const halfway = G.newGoal({ templateId: "travel", name: "Trip", target: 1000, months: 6, start: 600, today });
assert.deepEqual(G.newMilestones(halfway, 600), [], "a goal that starts half-funded doesn't celebrate 25/50 on day one");
assert.deepEqual(G.newMilestones(halfway, 760), [75]);
console.log("ok: milestones at 25/50/75/100%, each once");

const later = "2026-07-15";
const edited = G.replan(withMore, { target: 8000 }, later);
assert.deepEqual(edited.contributions, withMore.contributions, "past entries stay visible");
assert.equal(edited.start, 400);
assert.equal(G.saved(edited), 520, "what's been set aside carries over");
assert.equal(edited.planFrom, later);
assert.equal(edited.createdAt, today, "the goal's age doesn't change");
assert.equal(edited.monthly, Math.ceil(monthlyFor({ start: 520, target: 8000, months: 30, annualPct: 3.5 })));
assert.equal(G.statusOf(edited, 520, later), "on_track", "the plan restarts from what's saved today");
assert.equal(G.planLine(edited)[0][1], 520);
console.log("ok: editing a goal re-plans from today and keeps its entries");

let h = G.withHistory(car, "2026-01-15", 400);
h = G.withHistory(h, "2026-01-20", 500);
h = G.withHistory(h, "2026-01-27", 650);
h = G.withHistory(h, "2026-01-27", 700);
assert.equal(h.history.length, 3, "one point a day");
assert.equal(G.progressAt(h, "2026-01-25"), 500);
console.log("ok: savings history, one point a day");

// 6. The weekly check-in is a Sunday ritual: open from Sunday until the
// next Sunday (or until answered), for goals made before that Sunday.
assert.equal(G.lastSunday("2026-01-17"), "2026-01-11", "a Saturday belongs to the Sunday before");
assert.equal(G.lastSunday("2026-01-18"), "2026-01-18", "a Sunday is its own");
assert.equal(G.checkInDue([car], null, "2026-01-17"), false, "car was made on Thu Jan 15: no check-in that week");
assert.equal(G.checkInDue([car], null, "2026-01-18"), true, "it opens on Sunday");
assert.equal(G.checkInDue([car], null, "2026-01-21"), true, "and stays open midweek");
assert.equal(G.checkInDue([car], "2026-01-18", "2026-01-21"), false, "once answered, done until next Sunday");
assert.equal(G.checkInDue([car], "2026-01-18", "2026-01-25"), true, "next Sunday it's back");
assert.equal(G.checkInDue([{ ...car, status: "paused" }], null, "2026-01-18"), false, "not for paused goals");
assert.equal(G.weekChange(h, "2026-01-25"), 100, "the week that ended Sunday Jan 25: 400 → 500");
assert.equal(G.weekChange(h, "2026-02-01"), 200, "the week after: 500 → 700");
console.log("ok: the weekly check-in opens on Sunday, stays until the next one, sums up that week");

// 4. The main number is saved (cash only). Linked practice investments are
// a separate "with your practice investments" line; status and milestones
// don't count on them (they move with prices).
const sixMo = "2026-07-15";
const st = G.standing(car, 2000, sixMo);
assert.equal(st.saved, 400);
assert.equal(st.withInvest, 2400);
assert.equal(st.pct, 8);
assert.equal(st.pctWithInvest, 48);
assert.equal(st.status, "behind", "status is about money saved, not investments");
assert.deepEqual(st.fresh, [], "no milestone from investments alone");
assert.deepEqual(G.standing({ ...car, contributions: [{ date: "2026-02-01", amount: 900 }] }, 0, sixMo).fresh, [25], "milestones come from saving");
console.log("ok: saved is the main number; investments are a separate line and don't drive status or milestones");

// 8. Each goal keeps its own currency. Converted amounts use USD/MXN; linked
// holdings in another currency count at the converted value.
const peso = G.newGoal({ templateId: "emergency", name: "Fondo", target: 15000, months: 12, today, region: "MX" });
assert.equal(peso.currency, "MXN");
assert.equal(car.currency, "USD");
assert.equal(peso.monthly, Math.ceil(monthlyFor({ start: 0, target: 15000, months: 12, annualPct: exampleRates("MX").save })), "a peso goal plans on CETES");
assert.equal(G.regionOf(peso), "MX");
assert.equal(G.convert(100, "USD", "MXN", 18.5), 1850);
assert.equal(G.convert(1850, "MXN", "USD", 18.5), 100);
assert.equal(G.convert(100, "USD", "USD", null), 100);
assert.equal(G.convert(100, "USD", "MXN", null), null, "no rate, no conversion");
const voo = [{ symbol: "VOO", value: 600 }, { symbol: "SGOV", value: 50 }];
assert.equal(G.linkedValue({ ...peso, linked: ["VOO"] }, voo, "USD", 18.5), 11100, "a dollar holding counts in pesos at the rate");
assert.equal(G.linkedValue({ ...car, linked: ["VOO"] }, [{ symbol: "VOO", value: 11100 }], "MXN", 18.5), 600);
assert.equal(G.linkedValue({ ...car, linked: ["VOO", "SGOV"] }, voo, "USD", null), 650);
assert.equal(G.linkedValue({ ...peso, linked: ["VOO"] }, voo, "USD", null), 0, "without a rate it isn't guessed");
console.log("ok: each goal keeps its currency; conversions and linked holdings use the USD/MXN rate");

const unitIds = new Set(UNITS.map((u) => u.id));
for (const t of G.TEMPLATES) {
  assert.ok(t.amount[0] > 0 && t.amount[1] > t.amount[0], `${t.id}: US and Mexico starting amounts`);
  assert.ok(t.units.length && t.units.every((u) => unitIds.has(u)), `${t.id}: recommends real units`);
}
assert.deepEqual(G.unitsFor(car), ["budget", "save", "paycheck", "credit", "insurance"]);
assert.equal(G.primaryGoal([{ ...car, status: "paused" }, { ...car, id: "g2" }]).id, "g2", "the first active goal leads");
console.log("ok: templates have country amounts and recommend real lessons");
