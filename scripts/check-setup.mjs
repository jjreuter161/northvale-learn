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

const show = (r) => {
  for (const l of r.lines) ok(l);
  if (r.ok === false) bad(r.problem);
  else if (r.ok === null) console.log(`  · ${r.problem}`);
};
const { check } = await import("./lib/key-checks.mjs");
console.log("\nAnthropic (AI tutor)");
show(await check("anthropic"));
if (e.ANTHROPIC_API_KEY) ok(`monthly AI budget: $${e.AI_MONTHLY_BUDGET_USD || 25} (also set a spend limit in the Anthropic console)`);

console.log("\nTwelve Data (prices)");
show(await check("twelve"));

console.log("\nGmail (password reset emails)");
show(await check("gmail"));
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
