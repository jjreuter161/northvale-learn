// npm run ready — the one command after setup: tries every key for real (check-setup), then runs the whole
// preflight list (tests included), and tells you plainly whether you're ready to deploy.
//   npm run ready             everything (about 6 minutes: the tests click through the app in a browser)
//   npm run ready -- --quick  skips the tests (keys and settings only)
import { spawnSync } from "node:child_process";
import { join } from "node:path";

const root = join(import.meta.dirname, "..");
const quick = process.argv.includes("--quick");
const run = (script, args = []) => spawnSync(process.execPath, [join(root, "scripts", script), ...args], { cwd: root, stdio: "inherit" }).status === 0;

console.log("Step 1 of 2: trying each key for real (free, nothing is sent)");
const keys = run("check-setup.mjs");
console.log("\nStep 2 of 2: the full launch checklist" + (quick ? " (quick: tests skipped)" : ""));
const list = run("preflight.mjs", quick ? ["--quick"] : []);

if (keys && list) {
  console.log("\n==============================================");
  console.log(" You're ready to deploy.");
  console.log(quick ? " (That was the quick check; run npm run ready once more without --quick for the tests.)" : "");
  console.log(" Tell the builder: \"Setup is done, go ahead and deploy.\"");
  console.log("==============================================");
  process.exit(0);
}
console.log("\n==============================================");
console.log(" Not yet. Fix the lines marked ✗ above, then run npm run ready again.");
console.log(" docs/LAUNCH.md says how for each one. Nothing here ever shows a key.");
console.log("==============================================");
process.exit(1);
