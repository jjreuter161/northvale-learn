// RESTORE A BACKUP — npm run restore -- <backup file>
// For example: npm run restore -- server/data/backups/learn-2026-11-12.json
// On Fly: fly ssh console -C "node scripts/restore.mjs /data/backups/learn-2026-11-12.json"
//
// Checks that the file is a whole Northvale Learn data file, then sets it to
// replace the data the next time the server starts (a running server keeps
// its data in memory and would save over a file copied in directly). Then
// restart the app: locally, stop and start it; on Fly, `fly apps restart`.
// The data it replaces is kept as learn.before-restore-<time>.json.
import { copyFileSync, existsSync, readFileSync } from "node:fs";
import { basename, dirname, join, resolve } from "node:path";

const file = process.argv[2];
if (!file) {
  console.error("Which backup? npm run restore -- <backup file>   (the daily copies are in the data folder's backups/)");
  process.exit(1);
}
const ROOT = join(import.meta.dirname, "..");
if (process.env.NORTHVALE_DOTENV !== "0" && existsSync(join(ROOT, ".env"))) process.loadEnvFile(join(ROOT, ".env"));
// The data folder: the one the backup came from (…/backups/x.json), else the server's.
const from = dirname(resolve(file));
const DIR = basename(from) === "backups" ? dirname(from) : process.env.NORTHVALE_DATA || join(ROOT, "server", "data");
let d;
try {
  d = JSON.parse(readFileSync(file, "utf8"));
} catch (e) {
  console.error(`Can't read that file as a data file: ${e.message}`);
  process.exit(1);
}
if (!d || typeof d.users !== "object" || typeof d.progress !== "object") {
  console.error("That isn't a Northvale Learn data file (it has no accounts or progress). Nothing was changed.");
  process.exit(1);
}
copyFileSync(file, join(DIR, "learn.json.restore"));
console.log(`Ready to restore ${Object.keys(d.users).length} accounts into ${DIR}. Restart the app to finish (on Fly: fly apps restart). The data it replaces will be kept as learn.before-restore-….json.`);
