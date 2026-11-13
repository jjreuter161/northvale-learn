// DEPLOY DRY RUN — does what the Dockerfile does, with plain Node in a
// clean folder (no Docker needed), then starts the result in production
// mode and checks it serves. Run before a deploy:
//   npm run deploy:dry-run
// Uses only the npm cache on this computer (--offline: nothing downloaded).
// Fly itself builds the Dockerfile on its own remote builder: `fly deploy`
// uploads this folder (minus .dockerignore) and builds it there, so no
// Docker is needed here either.
import { execSync, spawn } from "node:child_process";
import { cpSync, existsSync, mkdtempSync, readFileSync, rmSync } from "node:fs";
import { tmpdir } from "node:os";
import http from "node:http";
import { join } from "node:path";

const ROOT = join(import.meta.dirname, "..");
const sh = (cmd, cwd) => execSync(cmd, { cwd, stdio: ["ignore", "pipe", "pipe"], encoding: "utf8" });
const size = (dir) => sh(`du -sk "${dir}"`).split("\t")[0] / 1024;
const t0 = Date.now();
const step = (what) => console.log(`· ${what} (${((Date.now() - t0) / 1000).toFixed(0)} s)`);
const checks = [];
const check = (ok, what) => (checks.push([ok, what]), console.log(`  ${ok ? "ok" : "FAIL"}: ${what}`));

// Stage 1 (build): the committed files, all dependencies, npm run build.
const build = mkdtempSync(join(tmpdir(), "nvl-dry-build-"));
step("stage 1: the committed files (git archive HEAD)");
sh(`git archive HEAD | tar -x -C "${build}"`, ROOT);
for (const ignored of readFileSync(join(ROOT, ".dockerignore"), "utf8").split("\n").filter((l) => l && !l.startsWith("#"))) rmSync(join(build, ignored), { recursive: true, force: true });
step("stage 1: npm ci (from this computer's npm cache)");
sh("npm ci --offline --no-audit --no-fund", build);
step("stage 1: npm run build");
sh("npm run build --silent", build);
// Stage 2 (run): production dependencies and what the Dockerfile copies.
const app = mkdtempSync(join(tmpdir(), "nvl-dry-app-"));
step("stage 2: npm ci --omit=dev");
for (const f of ["package.json", "package-lock.json"]) cpSync(join(build, f), join(app, f));
sh("npm ci --omit=dev --offline --no-audit --no-fund", app);
for (const d of ["web", "server", "src", "docs", "scripts/restore.mjs"]) cpSync(join(build, d), join(app, d), { recursive: true });
step(`stage 2: ${size(app).toFixed(1)} MB in all (node_modules ${size(join(app, "node_modules")).toFixed(1)} MB)`);

// Start it as Fly would (production, behind a proxy), on throwaway data.
const port = 30000 + Math.floor(Math.random() * 20000);
const data = mkdtempSync(join(tmpdir(), "nvl-dry-data-"));
const env = { PATH: process.env.PATH, HOME: process.env.HOME, NODE_ENV: "production", HOST: "127.0.0.1", PORT: String(port), TRUST_PROXY: "1", NORTHVALE_DATA: data, NORTHVALE_DOTENV: "0", NEWS_FEEDS: JSON.stringify({ US: [], MX: [] }) };
const server = spawn(process.execPath, [join(app, "server/index.js")], { env, cwd: app, stdio: ["ignore", "pipe", "pipe"] });
let log = "";
server.stdout.on("data", (d) => (log += d));
server.stderr.on("data", (d) => (log += d));
try {
  await new Promise((ok, no) => {
    const t = setTimeout(() => no(new Error(`the server didn't start:\n${log}`)), 15000);
    server.stdout.on("data", (d) => String(d).includes("Northvale Learn on") && (clearTimeout(t), ok()));
    server.on("exit", (c) => no(new Error(`the server stopped (${c}):\n${log}`)));
  });
  step("started in production mode");
  const B = `http://127.0.0.1:${port}`;
  const get = (p, headers = {}) => fetch(B + p, { headers: { "X-Forwarded-Proto": "https", "X-Northvale": "1", ...headers } });
  const health = await get("/healthz");
  check(health.status === 200, "/healthz answers (Fly's health check)");
  const page = await get("/");
  const html = await page.text();
  check(page.status === 200 && html.includes('src="/app.js"'), "the app's page");
  check(/default-src 'self'/.test(page.headers.get("content-security-policy") || ""), "the content policy is on");
  check(!!page.headers.get("strict-transport-security"), "HTTPS only (HSTS) behind Fly's proxy");
  const pre = await (await get("/precache.json")).json();
  const files = await Promise.all(pre.map((f) => get(f)));
  check(files.every((r) => r.status === 200), `the ${pre.length} files the app starts with`);
  const chunk = pre.find((f) => f.startsWith("/chunks/"));
  check((await get(chunk)).headers.get("cache-control").includes("immutable"), "unit files cached for a year");
  for (const p of ["/welcome", "/bienvenida", "/admin", "/manifest.webmanifest", "/sw.js", "/icon-maskable-512.png", "/shots/en-6.jpg", "/api/health"]) check((await get(p)).status === 200, p);
  check((await get("/.env")).status === 404 && (await get("/../server/store.js")).status === 404, "settings and code aren't served");
  check(existsSync(join(app, "scripts/restore.mjs")), "npm run restore is in the image");
  // (fetch can't change Host; a plain request can.)
  const status = await new Promise((ok) => http.get({ host: "127.0.0.1", port, path: "/", headers: { Host: "evil.example" } }, (r) => (r.resume(), ok(r.statusCode))).on("error", () => ok(0)));
  check(status === 421, "an unknown host is refused (set ALLOWED_HOSTS on Fly)");
} finally {
  server.kill();
  for (const d of [build, app, data]) rmSync(d, { recursive: true, force: true });
}
const failed = checks.filter(([ok]) => !ok);
console.log(`\n${failed.length ? `${failed.length} FAILED` : "Dry run passed"}: ${checks.length - failed.length} of ${checks.length} checks, ${((Date.now() - t0) / 1000).toFixed(0)} s.`);
process.exit(failed.length ? 1 : 0);
