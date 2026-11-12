// POSTGRES (Supabase) — where the data lives when DATABASE_URL is set, as
// on Vercel, where there's no lasting disk and several copies of the
// server can run at once. store.js keeps working on its in-memory copy:
// before each request, load() brings in what other copies changed; after
// it, commit() saves only the records this request changed.
//
// Each record is one row in northvale.records: one user, one session, one
// learner's progress, one week's league, one waitlist entry… (section, id),
// with its value as JSON. Sections that aren't a list of records (the AI
// spend, the push keys, the survey answers) are one row each (id "").
// The tables live in their own schema with row-level security on and no
// policies, so Supabase's public API can't read them; only the server's
// own connection can.
//
// ponytail: last write wins per record, and records are compared by their
// JSON text after each request — fine for a beta and thousands of
// learners. If many servers write the same busy record (AI spend,
// analytics), give those their own tables with SQL increments.

const SINGLE = new Set(["ai", "vapid", "recapKey", "waitlistKey", "analytics"]);
const isMap = (v) => !!v && typeof v === "object" && !Array.isArray(v);
const keyOf = (section, id) => `${section}\u0000${id}`;

// Every record in the data, as [section, id, value].
export function records(data) {
  const out = [];
  for (const [section, v] of Object.entries(data)) {
    if (!isMap(v) || SINGLE.has(section)) out.push([section, "", v]);
    else for (const [id, x] of Object.entries(v)) if (id) out.push([section, id, x]);
  }
  return out;
}

export const SETUP = [
  "create schema if not exists northvale",
  "create table if not exists northvale.meta (id int primary key, rev int not null)",
  "insert into northvale.meta (id, rev) values (1, 0) on conflict (id) do nothing",
  "create table if not exists northvale.records (section text not null, id text not null, value jsonb, deleted boolean not null default false, rev int not null, primary key (section, id))",
  "create index if not exists records_rev on northvale.records (rev)",
  "create table if not exists northvale.backups (day text primary key, data jsonb not null)",
  "alter table northvale.meta enable row level security",
  "alter table northvale.records enable row level security",
  "alter table northvale.backups enable row level security",
];

// `db` is { query(text, params) → rows, tx(fn(db)) }: the postgres library
// in production, PGlite in tests (see dbFor below).
export function persistence(db, data) {
  let rev = -1; // the newest change this copy has loaded
  const seen = new Map(); // record → its JSON as last loaded or saved

  async function setup() {
    for (const q of SETUP) await db.query(q);
  }

  // Bring in every record another copy changed since our last look.
  async function load() {
    const [{ rev: now }] = await db.query("select rev from northvale.meta where id = 1");
    if (now === rev) return;
    for (const r of await db.query("select section, id, value, deleted from northvale.records where rev > $1 order by rev", [rev])) {
      const k = keyOf(r.section, r.id);
      if (r.id === "") {
        data[r.section] = r.deleted ? null : r.value;
      } else if (r.deleted) {
        if (isMap(data[r.section])) delete data[r.section][r.id];
      } else {
        if (!isMap(data[r.section])) data[r.section] = {};
        data[r.section][r.id] = r.value;
      }
      if (r.deleted) seen.delete(k);
      else seen.set(k, JSON.stringify(r.value) ?? "null");
    }
    rev = now;
  }

  // Save the records that changed (new, edited or deleted) in one go.
  async function commit() {
    const now = new Map();
    for (const [s, i, v] of records(data)) now.set(keyOf(s, i), [s, i, JSON.stringify(v) ?? "null"]);
    const puts = [...now.entries()].filter(([k, [, , j]]) => seen.get(k) !== j);
    const dels = [...seen.keys()].filter((k) => !now.has(k));
    if (!puts.length && !dels.length) return 0;
    await db.tx(async (q) => {
      const [{ rev: r }] = await q.query("update northvale.meta set rev = rev + 1 where id = 1 returning rev");
      for (const [, [s, i, j]] of puts) await q.query("insert into northvale.records (section, id, value, deleted, rev) values ($1, $2, $3::jsonb, false, $4) on conflict (section, id) do update set value = excluded.value, deleted = false, rev = excluded.rev", [s, i, j, r]);
      for (const k of dels) {
        const [s, i] = k.split("\u0000");
        await q.query("update northvale.records set value = null, deleted = true, rev = $3 where section = $1 and id = $2", [s, i, r]);
      }
    });
    for (const [k, [, , j]] of puts) seen.set(k, j);
    for (const k of dels) seen.delete(k);
    return puts.length + dels.length;
  }

  // One copy of everything a day; the last 14 days are kept.
  async function backup(day) {
    const [had] = await db.query("select 1 as x from northvale.backups where day = $1", [day]);
    if (had) return null;
    await db.query("insert into northvale.backups (day, data) values ($1, $2::jsonb) on conflict (day) do nothing", [day, JSON.stringify(data)]);
    await db.query("delete from northvale.backups where day not in (select day from northvale.backups order by day desc limit 14)");
    return day;
  }

  return { setup, load, commit, backup };
}

// A database connection: Supabase's Postgres from DATABASE_URL, or, for
// tests (NORTHVALE_PGLITE=1), a small Postgres that runs in this process.
export async function dbFor(url) {
  if (process.env.NORTHVALE_PGLITE === "1") {
    const { PGlite } = await import("@electric-sql/pglite");
    // Kept in the data folder when there is one, so a restart keeps it.
    const pg = new PGlite(process.env.NORTHVALE_DATA ? `${process.env.NORTHVALE_DATA}/pglite` : undefined);
    const wrap = (c) => ({ query: async (text, params) => (await c.query(text, params)).rows });
    return { ...wrap(pg), tx: (fn) => pg.transaction((t) => fn(wrap(t))), close: () => pg.close() };
  }
  const { default: postgres } = await import("postgres");
  // prepare: false works with Supabase's connection pooler.
  const sql = postgres(url, { ssl: "require", max: 3, prepare: false, idle_timeout: 20 });
  const wrap = (c) => ({ query: (text, params) => c.unsafe(text, params || []) });
  return { ...wrap(sql), tx: (fn) => sql.begin((t) => fn(wrap(t))), close: () => sql.end() };
}
