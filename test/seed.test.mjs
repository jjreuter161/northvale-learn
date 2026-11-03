// npm run seed:demo, checked: it refuses a production server, another
// address and a machine set up as the live one; on a local test server it
// makes Dani and the league (13–17 and 18+ apart), and running it again
// resets them instead of making duplicates.
import assert from "node:assert/strict";
import { spawn } from "node:child_process";
import { mkdtempSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { seedDemo, DEMO_PASSWORD, DANI } from "../scripts/seed-demo.mjs";

const start = (extra) =>
  new Promise((resolve) => {
    const port = 20000 + Math.floor(Math.random() * 20000);
    const p = spawn(process.execPath, [join(import.meta.dirname, "../server/index.js")], { env: { ...process.env, NORTHVALE_DOTENV: "0", PORT: String(port), NORTHVALE_DATA: mkdtempSync(join(tmpdir(), "nvlearn-seed-")), ANTHROPIC_API_KEY: "", SMTP_USER: "", SIGNUP_CODE: "", ...extra }, stdio: ["ignore", "pipe", "inherit"] });
    p.stdout.on("data", (d) => String(d).includes("Northvale Learn on") && resolve({ p, base: `http://127.0.0.1:${port}` }));
  });
const stop = (p) => new Promise((ok) => (p.on("exit", ok), p.kill("SIGTERM")));
const refused = (p) => p.then(() => null, (e) => e.message);

const prod = await start({ NODE_ENV: "production", ALLOWED_HOSTS: "" });
try {
  assert.match(await refused(seedDemo(prod.base)), /production server/, "a server that says it's production");
} finally {
  await stop(prod.p);
}
assert.match(await refused(seedDemo("https://northvale-learn.fly.dev")), /isn't this computer/, "another address");
process.env.FLY_APP_NAME = "northvale-learn";
assert.match(await refused(seedDemo("http://127.0.0.1:1")), /live server/, "a machine set up as the live one");
delete process.env.FLY_APP_NAME;
console.log("ok: seed:demo refuses the production server, other addresses and the live machine");

const local = await start({});
try {
  const call = async (path, { method = "GET", body, cookie } = {}) => {
    const r = await fetch(local.base + path, { method, headers: { "X-Northvale": "1", "Content-Type": "application/json", ...(cookie ? { Cookie: cookie } : {}) }, body: body ? JSON.stringify(body) : undefined });
    return { json: await r.json(), cookie: (r.headers.get("set-cookie") || "").split(";")[0], status: r.status };
  };
  assert.deepEqual(await seedDemo(local.base), ["Dani", "Maya", "Leo", "Ari", "Sofía", "Teo"]);
  await seedDemo(local.base); // again: the same people, reset
  const dani = await call("/api/auth/login", { method: "POST", body: { email: DANI.email, password: DEMO_PASSWORD } });
  assert.equal(dani.status, 200);
  const { state } = (await call("/api/progress", { cookie: dani.cookie })).json;
  assert.equal(state.profile.nickname, "Dani");
  assert.equal(state.modules.goals.goals.length, 2);
  assert.equal(state.progress.streak.count, 6);
  assert.ok(state.modules.portfolio.pf.holdings.SGOV, "a practice T-bill fund");
  assert.ok(Object.keys(state.progress.lessons).length >= 20);
  const league = (await call("/api/league", { cookie: dani.cookie })).json.standings.map((s) => s.nickname);
  assert.deepEqual(league.sort(), ["Ari", "Dani", "Leo", "Maya"], "Dani's league: 18+ only, no duplicates");
  const sofia = await call("/api/auth/login", { method: "POST", body: { email: "sofia@example.test", password: DEMO_PASSWORD } });
  assert.deepEqual((await call("/api/league", { cookie: sofia.cookie })).json.standings.map((s) => s.nickname).sort(), ["Sofía", "Teo"], "the 13–17 league");
  console.log("ok: seed:demo makes Dani (goals, lessons, streak, practice fund) and the league, 13–17 and 18+ apart; running it again resets them");
} finally {
  await stop(local.p);
}
