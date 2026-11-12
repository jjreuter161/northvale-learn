// MOVING THE DATA from Fly.io (one file) to Supabase (Postgres), once, at
// the switch. First copy the file off Fly.io:
//   fly ssh sftp get /data/learn.json learn-from-fly.json
// then, with DATABASE_URL in .env:
//   npm run db:move -- learn-from-fly.json
// It refuses to run if Supabase already has learner data (use --replace to
// overwrite on purpose). Afterwards it checks every record arrived.
import { existsSync, readFileSync } from "node:fs";
import { join } from "node:path";
import assert from "node:assert/strict";
import { SETUP, dbFor, persistence, records } from "../server/pgstore.js";

const ROOT = join(import.meta.dirname, "..");
if (existsSync(join(ROOT, ".env"))) process.loadEnvFile(join(ROOT, ".env"));
const file = process.argv.slice(2).find((a) => !a.startsWith("--"));
if (!file || !existsSync(file)) throw new Error("Give the copied data file: npm run db:move -- learn-from-fly.json");
if (!process.env.DATABASE_URL && process.env.NORTHVALE_PGLITE !== "1") throw new Error("Put DATABASE_URL in .env first.");
const data = JSON.parse(readFileSync(file, "utf8"));
const db = await dbFor(process.env.DATABASE_URL);
try {
  for (const q of SETUP) await db.query(q);
  const [{ n }] = await db.query("select count(*)::int as n from northvale.records where not deleted");
  if (n && !process.argv.includes("--replace")) throw new Error(`Supabase already has ${n} records. Nothing was changed. Use --replace to overwrite them.`);
  if (n) await db.query("update northvale.records set deleted = true, value = null, rev = (select rev + 1 from northvale.meta where id = 1)");
  const saved = await persistence(db, data).commit();
  // Read it all back as a new copy of the server would, and compare.
  const back = {};
  await persistence(db, back).load();
  // (Postgres may store a record's fields in another order; the values must match.)
  const byKey = (d) => Object.fromEntries(records(d).map(([s, i, v]) => [`${s}/${i}`, v]));
  assert.deepEqual(byKey(back), byKey(data));
  console.log(`✓ Moved ${saved} records (${Object.keys(data.users || {}).length} accounts) and checked every one.`);
} finally {
  await db.close();
}
