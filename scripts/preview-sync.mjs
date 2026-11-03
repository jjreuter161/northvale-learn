// npm run preview:sync — the copy of the app that a preview runs from.
// Some previews can only read a folder of their own (Claude's preview pane
// can't read ~/Downloads), so this builds the app and copies what the
// server needs into PREVIEW_DIR: package.json, server/, src/, web/ and
// docs/ (no node_modules, .env, .git or design screenshots). The copy's
// data (server/data) is kept. If it has no demo people yet, they're made
// (npm run seed:demo) — so an emptied folder comes back with one command:
//   PREVIEW_DIR=/path/to/copy npm run preview:sync
//   npm run preview:sync -- /path/to/copy --reseed   (also resets the demo people)
// Then restart the preview server so it runs the new code. Nothing here
// is the only copy of anything: the project and git are.
import { cpSync, existsSync, mkdirSync, readdirSync, rmSync } from "node:fs";
import { execFileSync, spawn } from "node:child_process";
import { join, resolve } from "node:path";
import { seedDemo, hasDemo, checkSafe } from "./seed-demo.mjs";

const ROOT = join(import.meta.dirname, "..");
const args = process.argv.slice(2);
const target = resolve(args.find((a) => !a.startsWith("--")) || process.env.PREVIEW_DIR || "");
const PREVIEW_URL = process.env.PREVIEW_URL || "http://localhost:8950";
if (!process.env.PREVIEW_DIR && !args.some((a) => !a.startsWith("--"))) {
  console.error("Where's the preview's copy? Set PREVIEW_DIR, or: npm run preview:sync -- /path/to/copy");
  process.exit(1);
}
if (target === ROOT || target.startsWith(ROOT + "/")) {
  console.error("The preview's copy has to be outside the project folder.");
  process.exit(1);
}

execFileSync("npm", ["run", "build", "--silent"], { cwd: ROOT, stdio: "inherit" });
mkdirSync(target, { recursive: true });
// Fresh code; the copy's own data stays.
for (const dir of ["src", "web", "docs"]) {
  rmSync(join(target, dir), { recursive: true, force: true });
  cpSync(join(ROOT, dir), join(target, dir), { recursive: true, filter: (f) => !f.includes(`${join(ROOT, "docs", "design")}`) });
}
mkdirSync(join(target, "server"), { recursive: true });
for (const f of readdirSync(join(target, "server"))) if (f !== "data") rmSync(join(target, "server", f), { recursive: true, force: true });
for (const f of readdirSync(join(ROOT, "server"))) if (f !== "data") cpSync(join(ROOT, "server", f), join(target, "server", f), { recursive: true });
cpSync(join(ROOT, "package.json"), join(target, "package.json"));
console.log(`Copied the app to ${target}`);

// Demo people: through the running preview, or a short-lived server on
// the copy's own data when the preview isn't running.
const up = await fetch(`${PREVIEW_URL}/healthz`).then((r) => r.ok, () => false);
let temp = null;
let base = PREVIEW_URL;
if (!up) {
  const port = 20000 + Math.floor(Math.random() * 20000);
  base = `http://127.0.0.1:${port}`;
  temp = spawn(process.execPath, [join(target, "server/index.js")], { env: { ...process.env, NORTHVALE_DOTENV: "0", PORT: String(port), NORTHVALE_DATA: join(target, "server", "data"), NODE_ENV: "development" }, stdio: ["ignore", "pipe", "inherit"] });
  await new Promise((ok, no) => {
    temp.stdout.on("data", (d) => String(d).includes("Northvale Learn on") && ok());
    temp.on("exit", () => no(new Error("The copy's server didn't start.")));
  });
}
try {
  await checkSafe(base);
  if (args.includes("--reseed") || !(await hasDemo(base))) console.log(`Demo people: ${(await seedDemo(base)).join(", ")}`);
  else console.log("Demo people are already there (add --reseed to reset them).");
} finally {
  // A normal stop, so the server saves what was just written.
  if (temp) await new Promise((ok) => (temp.removeAllListeners("exit"), temp.on("exit", ok), temp.kill("SIGTERM")));
}
console.log(up ? "Restart the preview server so it runs the new code." : "Start the preview now.");
if (!existsSync(join(target, "server", "data", "learn.json"))) console.log("(Its data appears when the server first saves.)");
