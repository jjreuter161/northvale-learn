// npm run setup — a step-by-step wizard that fills in .env. For each key it asks, then TRIES it right away
// (free: it lists AI models, gets one price, signs in to Gmail without sending anything) and says in plain
// words whether it works or what to fix, so a typo is caught on the spot. Keys you type are hidden and never
// printed; press Enter to keep what's already there or to skip an optional one. The admin token is made for
// you. The file is saved so only your user account can read it. At the end it lists anything still missing.
//   SETUP_ENV_PATH=...    write somewhere else (tests)      SETUP_SKIP_CHECKS=1   don't try the keys (tests)
import { createInterface } from "node:readline";
import { Writable } from "node:stream";
import { readFileSync, writeFileSync, existsSync, chmodSync } from "node:fs";
import { randomBytes } from "node:crypto";
import { join } from "node:path";
import { runCheck } from "./lib/key-checks.mjs";

const root = join(import.meta.dirname, "..");
const file = process.env.SETUP_ENV_PATH || join(root, ".env");
const skipChecks = process.env.SETUP_SKIP_CHECKS === "1";
const current = existsSync(file) ? Object.fromEntries(readFileSync(file, "utf8").split("\n").map((l) => /^([A-Z_]+)=(.*)$/.exec(l)).filter(Boolean).map((m) => [m[1], m[2]])) : {};
const appName = (/^app = "([^"]+)"/m.exec(readFileSync(join(root, "fly.toml"), "utf8")) || [])[1] || "northvale-learn";

// Output that can be muted while a secret is typed.
let muted = false;
const out = new Writable({ write: (chunk, _, done) => (muted || process.stdout.write(chunk), done()) });
const rl = createInterface({ input: process.stdin, output: out, terminal: !!process.stdin.isTTY });
const lines = rl[Symbol.asyncIterator]();
async function ask(question, { secret, fallback } = {}) {
  const shown = fallback ? ` [${secret ? "keep what's there" : fallback}]` : "";
  process.stdout.write(`   ${question}${shown}: `);
  muted = !!secret && !!process.stdin.isTTY;
  const { value = "" } = await lines.next();
  if (muted) process.stdout.write("\n");
  muted = false;
  return value.trim() || fallback || "";
}

const TOTAL = 6;
let stepNo = 0;
const step = (title, hint) => console.log(`\nStep ${++stepNo} of ${TOTAL}: ${title}${hint ? `\n   ${hint}` : ""}`);
const good = (m) => console.log(`   ✓ ${m}`);
const warn = (m) => console.log(`   ! ${m}`);

// Ask for the values, try them, and let the person fix a typo right away.
async function tried(kind, readValues, { optional } = {}) {
  for (;;) {
    const values = await readValues();
    if (skipChecks) return values;
    const r = runCheck(kind, values);
    if (r.ok) {
      r.lines.forEach(good);
      return values;
    }
    if (r.ok === null) {
      console.log(`   · ${r.problem}`);
      return values;
    }
    warn(r.problem);
    const again = await ask(optional ? "Press Enter to try again, or type skip to leave it for now" : "Press Enter to try again, or type skip to go on anyway");
    if (/^skip$/i.test(again)) return values;
  }
}

console.log("\nNorthvale Learn setup. It takes about 10 minutes with the accounts ready (docs/LAUNCH.md, steps 1–4).");
console.log("Paste each value and press Enter. Keys stay hidden. Enter alone keeps what's there or skips an optional one.");
const v = { ...current };
const missing = [];

step("Gmail for the app", "It sends password-reset links. You need the address and its 16-letter app password.");
Object.assign(v, await tried("gmail", async () => ({
  SMTP_USER: await ask("Gmail address", { fallback: v.SMTP_USER }),
  SMTP_PASS: (await ask("Gmail app password (16 letters)", { secret: true, fallback: v.SMTP_PASS })).replace(/\s+/g, ""),
})));
v.CONTACT_EMAIL = await ask("Contact email shown to testers (the app's Gmail is fine)", { fallback: v.CONTACT_EMAIL || v.SMTP_USER });

step("The AI tutor (Anthropic)", "The key starts with sk-ant-. Set a monthly spend limit in the Anthropic console too.");
v.TUTOR_MODEL = v.TUTOR_MODEL || "claude-haiku-5-5";
Object.assign(v, await tried("anthropic", async () => ({ ANTHROPIC_API_KEY: await ask("Anthropic API key", { secret: true, fallback: v.ANTHROPIC_API_KEY }), TUTOR_MODEL: v.TUTOR_MODEL })));
v.AI_MONTHLY_BUDGET_USD = await ask("Monthly AI budget in US dollars", { fallback: v.AI_MONTHLY_BUDGET_USD || "25" });

step("Market prices (Twelve Data), optional", "Free. Without it the practice portfolio shows labeled sample prices, which is fine for the beta.");
Object.assign(v, await tried("twelve", async () => ({ TWELVEDATA_API_KEY: await ask("Twelve Data API key (Enter to skip)", { secret: true, fallback: v.TWELVEDATA_API_KEY }) }), { optional: true }));

step("Your web address", `Hosting on Fly.io gives https://${appName}.fly.dev. If you bought your own domain, type it with https://.`);
v.PUBLIC_URL = await ask("The app's web address", { fallback: v.PUBLIC_URL || `https://${appName}.fly.dev` });

step("Closed beta", "An invite word only your testers know. Without it anyone with the link can make an account.");
v.SIGNUP_CODE = await ask("Invite code (Enter for none)", { fallback: v.SIGNUP_CODE });

step("Admin page", "Made for you: a long random token you'll type at /admin.");
v.ADMIN_TOKEN = v.ADMIN_TOKEN || randomBytes(24).toString("base64url");
good("admin token made (it's in .env as ADMIN_TOKEN; it's never printed)");
rl.close();

const order = ["ANTHROPIC_API_KEY", "TUTOR_MODEL", "AI_MONTHLY_BUDGET_USD", "TWELVEDATA_API_KEY", "SMTP_USER", "SMTP_PASS", "CONTACT_EMAIL", "PUBLIC_URL", "SIGNUP_CODE", "ADMIN_TOKEN"];
const rest = Object.keys(v).filter((k) => !order.includes(k));
writeFileSync(file, `# Made by npm run setup. Never commit or share this file.\n${[...order, ...rest].filter((k) => v[k]).map((k) => `${k}=${v[k]}`).join("\n")}\n`, { mode: 0o600 });
chmodSync(file, 0o600);

// What's still missing: by name, never by value.
const NEEDED = { ANTHROPIC_API_KEY: "the Anthropic key (step 2)", SMTP_USER: "the Gmail address (step 1)", SMTP_PASS: "the Gmail app password (step 1)", CONTACT_EMAIL: "a contact email", PUBLIC_URL: "the web address", ADMIN_TOKEN: "the admin token" };
for (const [k, what] of Object.entries(NEEDED)) if (!v[k]) missing.push(what);
console.log(`\nSaved ${file} (only you can read it).`);
if (missing.length) {
  console.log(`\nStill missing: ${missing.join("; ")}.`);
  console.log("Run npm run setup again when you have them; what you typed is kept.");
} else {
  console.log("\nEverything needed is there. Your admin token is in .env as ADMIN_TOKEN: you'll type it at " + v.PUBLIC_URL + "/admin.");
  console.log("Last: put your name and contact in the four legal drafts (docs/LAUNCH.md, step 6), then run: npm run ready");
}
