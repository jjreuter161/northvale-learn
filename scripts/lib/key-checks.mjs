// Tries one outside service for real, without spending money or sending anything, and says in plain words what
// works or what to fix. Never prints a key. Used by npm run setup (right after each key is typed), npm run
// check-setup and npm run ready.
//   node scripts/lib/key-checks.mjs anthropic|twelve|gmail     (reads the settings from the environment, prints JSON)
import { spawnSync } from "node:child_process";
import { fileURLToPath, pathToFileURL } from "node:url";

// -> { ok: true|false|null, lines: [good news], problem: "what to do" | null }   (null = optional and left empty)
export async function check(kind, e = process.env) {
  if (kind === "anthropic") {
    if (!e.ANTHROPIC_API_KEY) return { ok: false, lines: [], problem: "There's no Anthropic key yet. Make one at console.anthropic.com → API Keys (docs/LAUNCH.md, step 2)." };
    try {
      const { default: Anthropic } = await import("@anthropic-ai/sdk");
      const page = await new Anthropic({ apiKey: e.ANTHROPIC_API_KEY }).models.list({ limit: 50 });
      const model = e.TUTOR_MODEL || "claude-haiku-5-5";
      if (!page.data.some((m) => m.id === model)) return { ok: false, lines: ["the key works"], problem: `The key works, but ${model} isn't in this account's model list.` };
      return { ok: true, lines: ["the key works", `${model} is available`] };
    } catch (x) {
      return { ok: false, lines: [], problem: x.status === 401 ? "Anthropic didn't accept that key. Copy it again from console.anthropic.com → API Keys (it starts with sk-ant-)." : x.status === 403 ? "The key is real, but the account can't use the API yet. Add credit under Billing." : `Couldn't reach Anthropic (${String(x.message).slice(0, 80)}). Check your internet and try again.` };
    }
  }
  if (kind === "twelve") {
    if (!e.TWELVEDATA_API_KEY) return { ok: null, lines: [], problem: "No Twelve Data key: the practice portfolio will use clearly labeled sample prices. That's fine for the beta." };
    try {
      const r = await fetch("https://api.twelvedata.com/quote?symbol=VOO", { headers: { Authorization: `apikey ${e.TWELVEDATA_API_KEY}` } }).then((x) => x.json());
      return r.close ? { ok: true, lines: [`the key works (VOO last close ${r.close})`] } : { ok: false, lines: [], problem: `Twelve Data said: ${String(r.message || "no price").slice(0, 100)}. Copy the key again from twelvedata.com → Dashboard.` };
    } catch (x) {
      return { ok: false, lines: [], problem: `Couldn't reach Twelve Data (${String(x.message).slice(0, 80)}).` };
    }
  }
  if (kind === "gmail") {
    if (!e.SMTP_USER || !e.SMTP_PASS) return { ok: false, lines: [], problem: "The Gmail address or app password is empty. Make an app password at Google Account → Security → App passwords (docs/LAUNCH.md, step 1)." };
    try {
      const mail = await import("../../server/mail.js");
      await mail.checkLogin();
      return { ok: true, lines: [`signed in to ${e.SMTP_USER} (no email was sent)`] };
    } catch (x) {
      return { ok: false, lines: [], problem: `Gmail refused the sign-in (${String(x.message).slice(0, 80)}). Use the 16-letter app password, not the normal password, and make sure 2-Step Verification is on.` };
    }
  }
  throw new Error(`unknown check: ${kind}`);
}

// The same check in a fresh process (settings are read when the mail code first loads, so a new try needs a new process).
export function runCheck(kind, env) {
  const r = spawnSync(process.execPath, [fileURLToPath(import.meta.url), kind], { env: { ...process.env, ...env }, encoding: "utf8", timeout: 60000 });
  try {
    return JSON.parse(r.stdout.trim().split("\n").pop());
  } catch {
    return { ok: false, lines: [], problem: "That check didn't finish. Check your internet and try again." };
  }
}

if (process.argv[1] && import.meta.url === pathToFileURL(process.argv[1]).href) console.log(JSON.stringify(await check(process.argv[2], process.env)));
