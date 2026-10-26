// npm run setup — fills in .env by asking for each setting in your own
// Terminal. Keys you type are hidden and never printed; press Enter to keep
// what's already there or to skip. The admin token is made for you. The
// file is saved so only your user account can read it.
import { createInterface } from "node:readline";
import { Writable } from "node:stream";
import { readFileSync, writeFileSync, existsSync, chmodSync } from "node:fs";
import { randomBytes } from "node:crypto";
import { join } from "node:path";

const root = join(import.meta.dirname, "..");
const file = process.env.SETUP_ENV_PATH || join(root, ".env");
const current = existsSync(file) ? Object.fromEntries(readFileSync(file, "utf8").split("\n").map((l) => /^([A-Z_]+)=(.*)$/.exec(l)).filter(Boolean).map((m) => [m[1], m[2]])) : {};
const appName = (/^app = "([^"]+)"/m.exec(readFileSync(join(root, "fly.toml"), "utf8")) || [])[1] || "northvale-learn";

// Output that can be muted while a secret is typed.
let muted = false;
const out = new Writable({ write: (chunk, _, done) => (muted || process.stdout.write(chunk), done()) });
const rl = createInterface({ input: process.stdin, output: out, terminal: !!process.stdin.isTTY });
const lines = rl[Symbol.asyncIterator]();
async function ask(question, { secret, fallback } = {}) {
  const shown = fallback ? ` [${secret ? "keep current" : fallback}]` : "";
  process.stdout.write(`${question}${shown}: `);
  muted = !!secret && !!process.stdin.isTTY;
  const { value = "" } = await lines.next();
  if (muted) process.stdout.write("\n");
  muted = false;
  return value.trim() || fallback || "";
}

console.log("\nNorthvale Learn setup — paste each value and press Enter (Enter alone keeps or skips it).");
console.log("Where to get each one: docs/SETUP-KEYS.md. Typed keys stay hidden.\n");
const v = { ...current };
console.log("1) Market prices — Twelve Data (free)");
v.TWELVEDATA_API_KEY = await ask("   Twelve Data API key", { secret: true, fallback: current.TWELVEDATA_API_KEY });
console.log("2) AI tutor — Anthropic");
v.ANTHROPIC_API_KEY = await ask("   Anthropic API key (starts with sk-ant-)", { secret: true, fallback: current.ANTHROPIC_API_KEY });
v.TUTOR_MODEL = current.TUTOR_MODEL || "claude-haiku-5-5";
v.AI_MONTHLY_BUDGET_USD = await ask("   Monthly AI budget in US dollars", { fallback: current.AI_MONTHLY_BUDGET_USD || "25" });
console.log("3) Password reset email — your dedicated Gmail");
v.SMTP_USER = await ask("   Gmail address", { fallback: current.SMTP_USER });
v.SMTP_PASS = (await ask("   Gmail app password (16 letters)", { secret: true, fallback: current.SMTP_PASS })).replace(/\s+/g, "");
v.CONTACT_EMAIL = await ask("   Contact email shown to testers", { fallback: current.CONTACT_EMAIL || v.SMTP_USER });
v.PUBLIC_URL = await ask("   The app's web address", { fallback: current.PUBLIC_URL || `https://${appName}.fly.dev` });
console.log("4) Closed beta");
v.SIGNUP_CODE = await ask("   Invite code testers need to make an account (Enter for none)", { fallback: current.SIGNUP_CODE });
v.ADMIN_TOKEN = current.ADMIN_TOKEN || randomBytes(24).toString("base64url");
rl.close();

const order = ["ANTHROPIC_API_KEY", "TUTOR_MODEL", "AI_MONTHLY_BUDGET_USD", "TWELVEDATA_API_KEY", "SMTP_USER", "SMTP_PASS", "CONTACT_EMAIL", "PUBLIC_URL", "SIGNUP_CODE", "ADMIN_TOKEN"];
const rest = Object.keys(v).filter((k) => !order.includes(k));
writeFileSync(file, `# Made by npm run setup. Never commit or share this file.\n${[...order, ...rest].filter((k) => v[k]).map((k) => `${k}=${v[k]}`).join("\n")}\n`, { mode: 0o600 });
chmodSync(file, 0o600);
console.log(`\nSaved ${file} (only you can read it).`);
console.log(`Set: ${[...order, ...rest].filter((k) => v[k]).join(", ")}`);
console.log(`Your admin token is in .env as ADMIN_TOKEN — you'll type it at ${v.PUBLIC_URL}/admin.`);
console.log("Next: npm run check-setup");
