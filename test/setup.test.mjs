// THE SETUP WIZARD and the launch checks, without any outside service: the wizard walks through its six steps,
// saves .env readable only by you, never prints a key (typed or saved), keeps what's already there, and says
// plainly what's still missing; each key check answers in plain words and names what to do; npm run ready
// refuses ("Not yet") when something's missing.
import assert from "node:assert/strict";
import { spawnSync } from "node:child_process";
import { mkdtempSync, readFileSync, statSync, existsSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { check } from "../scripts/lib/key-checks.mjs";

const ROOT = join(import.meta.dirname, "..");
const dir = mkdtempSync(join(tmpdir(), "nvl-setup-"));
const envPath = join(dir, ".env");
const wizard = (input, extra = {}) => spawnSync(process.execPath, [join(ROOT, "scripts/setup.mjs")], { cwd: ROOT, input, encoding: "utf8", env: { ...process.env, SETUP_ENV_PATH: envPath, SETUP_SKIP_CHECKS: "1", ...extra } });

// A full run: Gmail + app password, contact (Enter), Anthropic key, budget (Enter), Twelve Data key, address (Enter), invite code.
const SECRETS = ["nvl.app@gmail.com", "abcd efgh ijkl mnop", "sk-ant-api03-SECRETSECRETSECRET", "td_SECRETKEY123"];
const r1 = wizard([SECRETS[0], SECRETS[1], "", SECRETS[2], "", SECRETS[3], "", "NORTHSTAR", ""].join("\n") + "\n");
assert.equal(r1.status, 0, r1.stderr);
for (const n of [1, 2, 3, 4, 5, 6]) assert.match(r1.stdout, new RegExp(`Step ${n} of 6`), `step ${n} is announced`);
for (const secret of [SECRETS[1], "abcdefghijklmnop", SECRETS[2], SECRETS[3]]) assert.ok(!r1.stdout.includes(secret) && !r1.stderr.includes(secret), "a key never appears in what the wizard prints");
const env1 = readFileSync(envPath, "utf8");
assert.match(env1, /^SMTP_USER=nvl\.app@gmail\.com$/m);
assert.match(env1, /^SMTP_PASS=abcdefghijklmnop$/m, "the app password is saved without spaces");
assert.match(env1, /^ANTHROPIC_API_KEY=sk-ant-api03-SECRETSECRETSECRET$/m);
assert.match(env1, /^TUTOR_MODEL=claude-haiku-5-5$/m, "Haiku by default");
assert.match(env1, /^AI_MONTHLY_BUDGET_USD=25$/m);
assert.match(env1, /^SIGNUP_CODE=NORTHSTAR$/m);
assert.match(env1, /^ADMIN_TOKEN=[\w-]{30,}$/m, "an admin token is made");
assert.equal(statSync(envPath).mode & 0o777, 0o600, "only you can read .env");
assert.match(r1.stdout, /Everything needed is there/);
assert.ok(!r1.stdout.includes(env1.match(/^ADMIN_TOKEN=(.*)$/m)[1]), "the admin token isn't printed either");
const token = env1.match(/^ADMIN_TOKEN=(.*)$/m)[1];

// A second run keeps everything (Enter for each) and the same admin token.
const r2 = wizard("\n".repeat(12));
assert.equal(r2.status, 0, r2.stderr);
const env2 = readFileSync(envPath, "utf8");
assert.match(env2, /^ANTHROPIC_API_KEY=sk-ant-api03-SECRETSECRETSECRET$/m, "Enter keeps the key");
assert.equal(env2.match(/^ADMIN_TOKEN=(.*)$/m)[1], token, "the admin token stays the same");

// A first run with nothing typed says what's missing, by name.
const empty = join(dir, "empty.env");
const r3 = spawnSync(process.execPath, [join(ROOT, "scripts/setup.mjs")], { cwd: ROOT, input: "\n".repeat(12), encoding: "utf8", env: { ...process.env, SETUP_ENV_PATH: empty, SETUP_SKIP_CHECKS: "1" } });
assert.match(r3.stdout, /Still missing: .*Anthropic key.*Gmail address.*Gmail app password/s);
assert.ok(existsSync(empty));
console.log("ok: the setup wizard: six announced steps, keys hidden and never printed, saved for you only, kept on a second run, and anything missing is named");

// The key checks name what to do, in plain words, without reaching any service when the key is empty.
const noKey = await check("anthropic", {});
assert.equal(noKey.ok, false);
assert.match(noKey.problem, /console\.anthropic\.com/);
const noMail = await check("gmail", {});
assert.equal(noMail.ok, false);
assert.match(noMail.problem, /App passwords/);
const noPrices = await check("twelve", {});
assert.equal(noPrices.ok, null, "Twelve Data is optional");
assert.match(noPrices.problem, /sample prices/);
console.log("ok: each key check says in plain words what's wrong and where to fix it; Twelve Data is optional");

// npm run ready won't say "ready" without a .env (quick: no tests).
const ready = spawnSync(process.execPath, [join(ROOT, "scripts/ready.mjs"), "--quick"], { cwd: ROOT, encoding: "utf8", env: { ...process.env, SETUP_ENV_PATH: join(dir, "nope.env") } });
assert.equal(ready.status, 1);
assert.match(ready.stdout, /Not yet\./);
assert.doesNotMatch(ready.stdout, /You're ready to deploy/);
console.log("ok: npm run ready says \"Not yet\" and what to do when setup isn't finished");
