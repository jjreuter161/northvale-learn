// POSTGRES — two copies of the server sharing one database (as on Vercel):
// each sees the other's changes after load(), different records never
// overwrite each other, deletions travel, backups keep 14 days, and the
// tables are closed to Supabase's public API. Runs on PGlite (a Postgres
// inside this process), so it needs no internet or account.
import assert from "node:assert/strict";
import { PGlite } from "@electric-sql/pglite";
import { persistence, records } from "../server/pgstore.js";

const pg = new PGlite();
const wrap = (c) => ({ query: async (text, params) => (await c.query(text, params)).rows });
const db = { ...wrap(pg), tx: (fn) => pg.transaction((t) => fn(wrap(t))) };
const fresh = () => ({ users: {}, sessions: {}, progress: {}, weeks: {}, usage: {}, ai: null, resets: {} });

const a = fresh();
const b = fresh();
const A = persistence(db, a);
const B = persistence(db, b);
await A.setup();
await A.setup(); // twice is fine
await A.load();
await B.load();

// A signs someone up; B sees it.
a.users.u1 = { id: "u1", email: "ana@example.com", nickname: "Ana", ageBand: "13-17" };
a.sessions.s1 = { userId: "u1", expiresAt: Date.now() + 1e6 };
a.weeks["2026-11-09"] = ["u1"];
a.ai = { month: "2026-11", spent: 0.01, calls: 1 };
assert.equal(await A.commit(), 4);
assert.equal(await A.commit(), 0, "nothing new to save");
await B.load();
assert.deepEqual(b.users.u1, a.users.u1);
assert.deepEqual(b.weeks, a.weeks);
assert.deepEqual(b.ai, a.ai);
console.log("ok: one copy of the server saves; the other sees it after load()");

// Both change different records at the same time: neither is lost.
a.progress.u1 = { state: { xp: 10 }, updatedAt: 1 };
b.users.u1 = { ...b.users.u1, nickname: "Ana B." };
b.sessions.s2 = { userId: "u1", expiresAt: Date.now() + 1e6 };
await A.commit();
await B.commit();
await A.load();
await B.load();
for (const x of [a, b]) {
  assert.equal(x.users.u1.nickname, "Ana B.");
  assert.deepEqual(x.progress.u1, { state: { xp: 10 }, updatedAt: 1 });
  assert.ok(x.sessions.s2);
}
console.log("ok: two copies changing different records at once: both changes kept");

// Deleting travels too (an account removed on one copy is gone on the other).
delete b.users.u1;
delete b.sessions.s1;
delete b.sessions.s2;
await B.commit();
await A.load();
assert.equal(a.users.u1, undefined);
assert.deepEqual(a.sessions, {});
// …and a third copy starting from scratch sees the same thing.
const c = fresh();
await persistence(db, c).load();
assert.deepEqual(records(c).sort(), records(b).sort());
console.log("ok: deletions reach every copy; a new copy loads exactly the saved data");

// Backups: one a day, the last 14 kept.
for (let i = 1; i <= 16; i++) await A.backup(`2026-10-${String(i).padStart(2, "0")}`);
assert.equal(await A.backup("2026-10-16"), null, "one a day");
const kept = (await db.query("select day from northvale.backups order by day")).map((r) => r.day);
assert.equal(kept.length, 14);
assert.equal(kept[0], "2026-10-03");
console.log("ok: a backup a day in Postgres, the last 14 kept");

// Closed to Supabase's public API: own schema, row-level security on.
const rls = await db.query("select relname, relrowsecurity from pg_class c join pg_namespace n on n.oid = c.relnamespace where n.nspname = 'northvale' and c.relkind = 'r' order by relname");
assert.deepEqual(rls.map((r) => [r.relname, r.relrowsecurity]), [["backups", true], ["meta", true], ["records", true]]);
assert.equal((await db.query("select count(*)::int as n from information_schema.tables where table_schema = 'public'"))[0].n, 0, "nothing in the public schema");
console.log("ok: the data sits in its own schema with row-level security (Supabase's public API can't read it)");
await pg.close();
