// npm run preflight — everything to check before going live, as one
// pass/fail list (the exit code is 0 only when all of it passes). It never
// prints a setting's value, only whether it's there and looks right.
//   npm run preflight             runs the whole test suite too (~3 minutes)
//   npm run preflight -- --quick  skips the tests
// (npm run check-setup is the other half: it tries each key for real.)
import { existsSync, readFileSync } from "node:fs";
import { execFileSync, spawnSync } from "node:child_process";
import { parseEnv } from "node:util";
import { join } from "node:path";

const ROOT = join(import.meta.dirname, "..");
const quick = process.argv.includes("--quick");
const results = [];
const check = (group, ok, label, fix) => results.push({ group, ok, label, fix });
const note = (group, label) => results.push({ group, ok: null, label });

// ---- settings (.env) ----------------------------------------------------------------
const S = "Settings in .env (values are never shown)";
const envFile = join(ROOT, ".env");
const env = existsSync(envFile) ? parseEnv(readFileSync(envFile, "utf8")) : null;
if (!env) check(S, false, ".env", "There's no .env yet. Run npm run setup (docs/LAUNCH.md, step 5).");
else {
  const v = (k) => String(env[k] || "").trim();
  const email = (x) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(x);
  const REQUIRED = [
    ["ADMIN_TOKEN", (x) => x.length >= 20, "20+ random characters; npm run setup makes one."],
    ["PUBLIC_URL", (x) => /^https:\/\/[^/\s]+$/.test(x), "The address testers open, like https://northvale-learn.fly.dev (https, no slash at the end)."],
    ["CONTACT_EMAIL", email, "The email testers can write to (the app's Gmail is fine)."],
    ["ANTHROPIC_API_KEY", (x) => x.length > 20, "From console.anthropic.com → API Keys (docs/SETUP-KEYS.md §2)."],
    ["TUTOR_MODEL", (x) => /^claude-haiku-/.test(x), "Must be Haiku for the beta: claude-haiku-5-5."],
    ["AI_MONTHLY_BUDGET_USD", (x) => Number(x) > 0 && Number(x) <= 100, "The monthly AI cap in dollars, like 25 (the AI pauses when it's reached)."],
    ["SMTP_USER", email, "The app's Gmail address (docs/SETUP-KEYS.md §4)."],
    ["SMTP_PASS", (x) => x.replace(/\s/g, "").length >= 16, "The Gmail app password (16 characters), not the normal password."],
  ];
  for (const [k, valid, fix] of REQUIRED) check(S, !!v(k) && valid(v(k)), k, v(k) ? `Looks wrong. ${fix}` : `Missing. ${fix}`);
  // The address has to match the hosting settings, or the server refuses it.
  const fly = readFileSync(join(ROOT, "fly.toml"), "utf8");
  const app = (/^app = "([^"]+)"/m.exec(fly) || [])[1];
  const hosts = [(/ALLOWED_HOSTS = "([^"]*)"/.exec(fly) || [])[1], v("ALLOWED_HOSTS")].join(",").split(",").map((h) => h.trim()).filter(Boolean);
  const host = /^https:\/\//.test(v("PUBLIC_URL")) ? new URL(v("PUBLIC_URL")).host : null;
  if (host) {
    check(S, hosts.includes(host), "PUBLIC_URL matches the allowed hosts", `Add its host to ALLOWED_HOSTS in fly.toml (now: ${hosts.join(", ") || "none"}).`);
    if (host.endsWith(".fly.dev")) check(S, host === `${app}.fly.dev`, "PUBLIC_URL matches the Fly.io app name", `fly.toml says app = "${app}", so the address would be https://${app}.fly.dev.`);
  }
  for (const [k, what] of [["TWELVEDATA_API_KEY", "real delayed prices (without it, prices are labeled samples)"], ["SIGNUP_CODE", "only people with the code can make accounts"], ["ALERT_WEBHOOK_URL", "alerts in Discord or Slack when something breaks"], ["MAIL_POSTAL_ADDRESS", "the mailing address for emails (needed before the public launch, not the beta)"]]) note(S, `${k} ${v(k) ? "is set" : "isn't set (optional)"}: ${what}`);
}

// ---- classroom mode ----------------------------------------------------------------
const C = "Classroom mode";
const dataFile = join(process.env.NORTHVALE_DATA || join(ROOT, "server", "data"), "learn.json");
const flags = existsSync(dataFile) ? (JSON.parse(readFileSync(dataFile, "utf8")).flags || {}).classroom : null;
check(C, !flags || (!flags.all && !(flags.accounts || []).length), "off for everyone", "Turn it off on /admin → Feature switches (for everyone and every account).");
note(C, "The live server starts with it off; the builder checks /admin → Feature switches after deploying.");

// ---- tests ---------------------------------------------------------------------------------
const T = "Tests";
if (quick) note(T, "skipped (--quick)");
else {
  process.stdout.write("Running every test, including the browser click-through (about 3 minutes)…\n");
  const r = spawnSync("npm", ["test"], { cwd: ROOT, encoding: "utf8", maxBuffer: 64 * 1024 * 1024 });
  const out = `${r.stdout}\n${r.stderr}`;
  const oks = (out.match(/^ok: /gm) || []).length;
  check(T, r.status === 0, r.status === 0 ? `all ${oks} checks pass, browser tests included` : `failed after ${oks} passing checks`, `Run npm test to see what failed:\n${out.trim().split("\n").slice(-8).join("\n")}`);
}

// ---- git ------------------------------------------------------------------------------------
const G = "Git";
const git = (...a) => execFileSync("git", a, { cwd: ROOT, encoding: "utf8" });
const dirty = git("status", "--porcelain").split("\n").filter(Boolean);
check(G, !dirty.length, "nothing uncommitted", `Commit or put away: ${dirty.slice(0, 6).map((l) => l.slice(3)).join(", ")}${dirty.length > 6 ? "…" : ""}`);
const tracked = git("ls-files").split("\n");
const secret = tracked.filter((f) => /(^|\/)\.env$|^server\/data\/|(^|\/)backups\/|(^|\/)learn[^/]*\.json$/.test(f));
check(G, !secret.length, ".env, the database and backups aren't in git", `Remove from git: ${secret.join(", ")}`);
const ignore = readFileSync(join(ROOT, ".gitignore"), "utf8");
check(G, [".env", "server/data/", "backups/"].every((x) => ignore.split("\n").includes(x)), ".gitignore keeps them out", "Add .env, server/data/ and backups/ to .gitignore.");

// ---- legal drafts ---------------------------------------------------------------------------
const L = "Legal drafts (docs/legal)";
for (const f of ["privacy.en.md", "privacy.es.md", "terms.en.md", "terms.es.md"]) {
  const text = readFileSync(join(ROOT, "docs", "legal", f), "utf8");
  const blanks = [...text.matchAll(/\*\*\[([^\]]+)\]\*\*/g)].map((m) => m[1]);
  const toFill = blanks.filter((b) => !/lawyer|abogad/i.test(b));
  check(L, !toFill.length, `${f}: name and contact filled in`, `Replace: ${toFill.map((b) => `[${b}]`).join(", ")}`);
  const lawyer = blanks.length - toFill.length;
  if (lawyer) note(L, `${f}: ${lawyer} note${lawyer === 1 ? "" : "s"} for a lawyer (fine for the beta; before a public launch)`);
}

// ---- the list -------------------------------------------------------------------------------
console.log("\nNorthvale Learn — preflight\n");
let fails = 0;
for (const group of [...new Set(results.map((r) => r.group))]) {
  console.log(group);
  for (const r of results.filter((x) => x.group === group)) {
    if (r.ok === null) console.log(`  · ${r.label}`);
    else if (r.ok) console.log(`  ✓ ${r.label}`);
    else (fails++, console.log(`  ✗ ${r.label}\n      ${r.fix.replace(/\n/g, "\n      ")}`));
  }
  console.log("");
}
console.log(fails ? `${fails} to fix. docs/LAUNCH.md says how; run npm run preflight again after.` : `Everything passes. Tell the builder: "Setup is done, go ahead and deploy."`);
process.exit(fails ? 1 : 0);
