// SUPABASE SETUP — run once after making the Supabase project and filling
// DATABASE_URL, CRON_SECRET and PUBLIC_URL in .env:
//   npm run db:setup
// Makes Northvale's tables (in their own "northvale" schema, closed to
// Supabase's public API), and schedules the 15-minute call that sends
// reminders and recaps (pg_cron + pg_net, both built into Supabase).
// Safe to run again. It never prints your keys.
import { existsSync } from "node:fs";
import { join } from "node:path";
import { SETUP, dbFor } from "../server/pgstore.js";

const ROOT = join(import.meta.dirname, "..");
if (existsSync(join(ROOT, ".env"))) process.loadEnvFile(join(ROOT, ".env"));
const { DATABASE_URL, CRON_SECRET, PUBLIC_URL } = process.env;
if (!DATABASE_URL) throw new Error("Put DATABASE_URL (from Supabase → Connect → Transaction pooler) in .env first.");
const db = await dbFor(DATABASE_URL);
try {
  for (const q of SETUP) await db.query(q);
  console.log("✓ Tables ready (schema northvale, row-level security on).");
  if (!/^[A-Za-z0-9_-]{20,}$/.test(CRON_SECRET || "") || !/^https:\/\/[A-Za-z0-9.-]+\/?$/.test(PUBLIC_URL || "")) {
    console.log("· Reminders not scheduled yet: set CRON_SECRET (20+ letters, digits, - or _) and PUBLIC_URL (like https://northvalelearn.com) in .env, then run this again.");
  } else {
    await db.query("create extension if not exists pg_cron");
    await db.query("create extension if not exists pg_net");
    const body = `select net.http_post(url := '${PUBLIC_URL.replace(/\/$/, "")}/api/cron', headers := jsonb_build_object('Authorization', 'Bearer ${CRON_SECRET}', 'Content-Type', 'application/json'), body := '{}'::jsonb)`;
    await db.query("select cron.schedule($1, $2, $3)", ["northvale-tick", "*/15 * * * *", body]);
    console.log(`✓ Every 15 minutes, Supabase calls ${PUBLIC_URL.replace(/\/$/, "")}/api/cron (reminders, recaps, the daily backup).`);
  }
} finally {
  await db.close();
}
