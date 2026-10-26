// npm run check-setup — checks each setting in .env without spending money:
// Anthropic (lists models: free), Twelve Data (one price: free plan), Gmail
// (signs in and leaves: no email sent), and the Fly.io command line.
// Prints what works and what to fix; never prints a key.
import { existsSync } from "node:fs";
import { execFileSync } from "node:child_process";
import { join } from "node:path";

const root = join(import.meta.dirname, "..");
const envFile = process.env.SETUP_ENV_PATH || join(root, ".env");
if (!existsSync(envFile)) {
  console.log("No .env yet — run: npm run setup");
  process.exit(1);
}
process.loadEnvFile(envFile);
const e = process.env;
let problems = 0;
const ok = (m) => console.log(`  ✓ ${m}`);
const bad = (m) => (problems++, console.log(`  ✗ ${m}`));

console.log("\nAnthropic (AI tutor)");
if (!e.ANTHROPIC_API_KEY) bad("ANTHROPIC_API_KEY is empty — see docs/SETUP-KEYS.md §2");
else {
  try {
    const { default: Anthropic } = await import("@anthropic-ai/sdk");
    const page = await new Anthropic().models.list({ limit: 50 });
    const ids = page.data.map((m) => m.id);
    ok("the key works");
    const model = e.TUTOR_MODEL || "claude-haiku-5-5";
    ids.includes(model) ? ok(`${model} is available`) : bad(`${model} isn't in this account's model list`);
    ok(`monthly AI budget: $${e.AI_MONTHLY_BUDGET_USD || 25} (also set a spend limit in the Anthropic console)`);
  } catch (x) {
    bad(x.status === 401 ? "the key wasn't accepted — copy it again from console.anthropic.com → API Keys" : x.status === 403 ? "the key works but the account can't use the API yet — add credit under Billing" : `couldn't check the key (${String(x.message).slice(0, 80)})`);
  }
}

console.log("\nTwelve Data (prices)");
if (!e.TWELVEDATA_API_KEY) bad("TWELVEDATA_API_KEY is empty — prices will be labeled samples");
else {
  try {
    const r = await fetch("https://api.twelvedata.com/quote?symbol=VOO", { headers: { Authorization: `apikey ${e.TWELVEDATA_API_KEY}` } }).then((x) => x.json());
    r.close ? ok(`the key works (VOO last close ${r.close})`) : bad(`Twelve Data said: ${String(r.message || "no price").slice(0, 100)}`);
  } catch (x) {
    bad(`couldn't reach Twelve Data (${x.message})`);
  }
}

console.log("\nGmail (password reset emails)");
if (!e.SMTP_USER || !e.SMTP_PASS) bad("SMTP_USER / SMTP_PASS are empty — password reset will show your contact email instead");
else {
  try {
    const mail = await import("../server/mail.js");
    await mail.checkLogin();
    ok(`signed in to ${e.SMTP_USER} (no email was sent)`);
  } catch (x) {
    bad(`Gmail refused the sign-in (${String(x.message).slice(0, 90)}). Use an app password, not the normal password, with 2-Step Verification on`);
  }
}
e.PUBLIC_URL ? ok(`reset links will open ${e.PUBLIC_URL}`) : bad("PUBLIC_URL is empty");
e.CONTACT_EMAIL ? ok(`contact email: ${e.CONTACT_EMAIL}`) : bad("CONTACT_EMAIL is empty");

console.log("\nAdmin and beta");
e.ADMIN_TOKEN && e.ADMIN_TOKEN.length >= 20 ? ok("admin token is set") : bad("ADMIN_TOKEN is missing or shorter than 20 characters — run npm run setup");
e.SIGNUP_CODE ? ok("sign-ups need the invite code") : console.log("  · no invite code: anyone with the link can make an account");

console.log("\nFly.io (hosting)");
try {
  const who = execFileSync("fly", ["auth", "whoami"], { encoding: "utf8", stdio: ["ignore", "pipe", "ignore"] }).trim();
  ok(`signed in to Fly.io as ${who}`);
} catch {
  bad("the fly command isn't installed or you're not signed in — brew install flyctl, then fly auth login");
}

console.log(problems ? `\n${problems} thing(s) to fix above.` : "\nEverything checks out. Tell the builder setup is done.");
process.exit(problems ? 1 : 0);
