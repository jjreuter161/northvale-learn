// LOAD CHECK — about 50 testers at once against a server on this computer
// (throwaway data, every outside service off). Each simulated tester comes
// from their own network address (as real testers would) and:
//   1. opens the app (the page, the app, its units, fonts, icons);
//   2. makes an account (30 of them; 20 stay signed out, like many testers);
//   3. for about a minute, does what the app does while someone learns,
//      but faster than a person: saves progress, sends usage stats, checks
//      the league, news and prices, sends feedback now and then.
// It reports how long the server took per kind of request (median, 95th
// percentile, slowest), any errors, and the server's memory and CPU.
//
// npm run load-check [-- --testers 50 --seconds 60]
import { spawn, execSync } from "node:child_process";
import { mkdtempSync, readdirSync, readFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";

const arg = (k, d) => (process.argv.includes(k) ? Number(process.argv[process.argv.indexOf(k) + 1]) : d);
const TESTERS = arg("--testers", 50);
const SECONDS = arg("--seconds", 60);
const ROOT = join(import.meta.dirname, "..");
const port = 30000 + Math.floor(Math.random() * 20000);
const env = { ...process.env, NORTHVALE_DOTENV: "0", PORT: String(port), TRUST_PROXY: "1", NORTHVALE_DATA: mkdtempSync(join(tmpdir(), "nvl-load-")), ANTHROPIC_API_KEY: "", TWELVEDATA_API_KEY: "", SMTP_USER: "", SMTP_PASS: "", NEWS_FEEDS: JSON.stringify({ US: [], MX: [] }) };
const server = spawn(process.execPath, [join(ROOT, "server/index.js")], { env, stdio: ["ignore", "pipe", "inherit"] });
await new Promise((r) => server.stdout.on("data", (d) => String(d).includes("Northvale Learn on") && r()));
const BASE = `http://127.0.0.1:${port}`;
const memNow = () => Number(execSync(`ps -o rss= -p ${server.pid}`).toString().trim()) / 1024;
const idle = memNow();

// What the app downloads when it opens.
const html = await (await fetch(`${BASE}/`)).text();
const ASSETS = ["/", "/app.js", "/manifest.webmanifest", "/icon-192.png", ...readdirSync(join(ROOT, "web/chunks")).filter((f) => f.endsWith(".js")).slice(0, 8).map((f) => `/chunks/${f}`), ...[...html.matchAll(/href="(\/fonts\/[^"]+)"/g)].map((m) => m[1])];
const state = JSON.parse(readFileSync(join(ROOT, "test/fixtures/saved-playful.json"), "utf8"));

const times = {}; // kind → [ms]
const errors = {};
let requests = 0;
async function call(kind, ip, path, { method = "GET", body, cookie, raw } = {}) {
  const t = performance.now();
  try {
    const r = await fetch(BASE + path, { method, headers: { "X-Northvale": "1", "Content-Type": "application/json", "X-Forwarded-For": ip, "Accept-Encoding": "gzip", ...(cookie ? { Cookie: cookie } : {}) }, body: body && JSON.stringify(body) });
    const data = raw ? await r.arrayBuffer() : await r.json().catch(() => null);
    (times[kind] ||= []).push(performance.now() - t);
    requests++;
    if (r.status >= 400) errors[`${kind} ${r.status}`] = (errors[`${kind} ${r.status}`] || 0) + 1;
    return { status: r.status, data, cookie: (r.headers.get("set-cookie") || "").split(";")[0] };
  } catch (e) {
    errors[`${kind} ${e.cause ? e.cause.code : e.message}`] = (errors[`${kind} ${e.cause ? e.cause.code : e.message}`] || 0) + 1;
    return { status: 0 };
  }
}
const pause = (ms) => new Promise((r) => setTimeout(r, ms * (0.5 + Math.random())));

async function tester(n, until) {
  const ip = `10.0.${Math.floor(n / 250)}.${(n % 250) + 1}`;
  const install = crypto.randomUUID();
  const day = new Date().toLocaleDateString("en-CA");
  // 1. Opening the app.
  await Promise.all(ASSETS.map((a) => call(a === "/" ? "open: page" : a.startsWith("/chunks") ? "open: units" : a === "/app.js" ? "open: app" : "open: fonts, icons", ip, a, { raw: true })));
  await call("health", ip, "/api/health");
  // 2. An account, for most.
  let cookie = null;
  if (n % 5 < 3) {
    const r = await call("sign-up", ip, "/api/auth/signup", { method: "POST", body: { email: `tester${n}@example.test`, password: "a long enough password", nickname: `Tester ${n}`, ageBand: n % 4 ? "18-25" : "13-17", guardian: true } });
    cookie = r.cookie;
    await call("me", ip, "/api/me", { cookie });
    await call("progress (load)", ip, "/api/progress", { cookie });
  }
  // 3. Learning, quickly.
  let xp = 0;
  for (let i = 0; Date.now() < until; i++) {
    xp += 10;
    await call("usage stats", ip, "/api/events", { method: "POST", body: { installId: install, events: [{ name: "lesson_step", day, lang: "en", region: "US", props: { lesson: "budget-1", step: i % 9, of: 9 } }] } });
    if (cookie) await call("progress (save)", ip, "/api/progress", { method: "PUT", cookie, body: { state: { ...state, progress: { ...state.progress, xp: state.progress.xp + xp } }, updatedAt: Date.now() } });
    if (i % 3 === 0 && cookie) await call("league", ip, "/api/league", { cookie });
    if (i % 4 === 0) await call("news", ip, `/api/news?region=${n % 2 ? "MX" : "US"}&lang=${n % 2 ? "es" : "en"}`);
    if (i % 4 === 2) await call("prices", ip, "/api/market/quotes?symbols=VOO,CETES28");
    if (i % 25 === 5) await call("feedback", ip, "/api/feedback", { method: "POST", body: { installId: install, kind: "idea", text: "A load-check note.", context: "load check", lang: "en" } });
    await pause(1500);
  }
}

const t0 = Date.now();
const rss = [];
const watch = setInterval(() => {
  try {
    const [r, c] = execSync(`ps -o rss=,%cpu= -p ${server.pid}`).toString().trim().split(/\s+/).map(Number);
    rss.push([r / 1024, c]);
  } catch {}
}, 1000);
await Promise.all(Array.from({ length: TESTERS }, (_, n) => pause(n * 40).then(() => tester(n, t0 + SECONDS * 1000))));
clearInterval(watch);
server.kill("SIGTERM");

const q = (a, p) => a[Math.min(a.length - 1, Math.floor((a.length * p) / 100))];
const rows = Object.entries(times).map(([k, a]) => (a.sort((x, y) => x - y), [k, a.length, q(a, 50), q(a, 95), a[a.length - 1]]));
console.log(`\n${TESTERS} testers for ${SECONDS} s: ${requests} requests (${(requests / ((Date.now() - t0) / 1000)).toFixed(0)} a second)\n`);
console.log(`${"request".padEnd(20)} ${"count".padStart(6)} ${"median".padStart(8)} ${"95%".padStart(8)} ${"slowest".padStart(8)}`);
for (const [k, n, p50, p95, max] of rows) console.log(`${k.padEnd(20)} ${String(n).padStart(6)} ${p50.toFixed(0).padStart(6)}ms ${p95.toFixed(0).padStart(6)}ms ${max.toFixed(0).padStart(6)}ms`);
const errs = Object.entries(errors);
console.log(`\nErrors: ${errs.length ? errs.map(([k, n]) => `${k} ×${n}`).join(", ") : "none"}`);
if (process.env.DEBUG) console.log("memory by second:", rss.map((r) => r[0].toFixed(0)).join(" "));
if (rss.length) console.log(`Server memory: ${idle.toFixed(0)} MB idle, ${Math.max(...rss.map((r) => r[0])).toFixed(0)} MB at most, ${rss[rss.length - 1][0].toFixed(0)} MB at the end · CPU: ${(rss.reduce((s, r) => s + r[1], 0) / rss.length).toFixed(0)}% on average, ${Math.max(...rss.map((r) => r[1])).toFixed(0)}% at most (of one core)`);
process.exit(errs.some(([k]) => !/ 429$/.test(k)) ? 1 : 0);
