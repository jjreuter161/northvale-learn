// npm run home-test — opens the app to phones on your home Wi-Fi, so a
// parent, a sibling or a friend can use it while you watch. It builds the
// app, starts the server on your computer's Wi-Fi address and prints what
// to type into the phone's browser (plus a QR code if `qrencode` is
// installed: brew install qrencode).
//   npm run home-test              (port 8960; --port 9000 for another)
//   npm run home-test -- --fresh   (forget the practice data from last time)
// Nothing here uses your real keys: .env is not read, the AI tutor stays in
// offline mode, and the data lives in a temporary folder, not in the project.
// Only devices on the same Wi-Fi can reach it, and only while this runs.
// Press Ctrl+C to stop.
import { execFileSync, spawn } from "node:child_process";
import { rmSync, mkdirSync } from "node:fs";
import { networkInterfaces, tmpdir, hostname } from "node:os";
import { join } from "node:path";

const ROOT = join(import.meta.dirname, "..");
const args = process.argv.slice(2);
const portArg = args.indexOf("--port");
const PORT = Number(portArg >= 0 ? args[portArg + 1] : process.env.PORT) || 8960;
const DATA = join(tmpdir(), "northvale-home-test");

// The computer's Wi-Fi address: a private IPv4 address that isn't loopback.
function lanAddress(nets = networkInterfaces()) {
  const all = Object.values(nets).flat().filter((n) => n && n.family === "IPv4" && !n.internal);
  const isPrivate = (a) => /^(10\.|192\.168\.|172\.(1[6-9]|2\d|3[01])\.)/.test(a);
  return (all.find((n) => isPrivate(n.address)) || all[0] || {}).address;
}

const ip = lanAddress();
if (!ip) {
  console.error("I can't find a Wi-Fi address. Is this computer connected to your home Wi-Fi?");
  process.exit(1);
}

if (args.includes("--fresh")) rmSync(DATA, { recursive: true, force: true });
mkdirSync(DATA, { recursive: true });
execFileSync("npm", ["run", "build", "--silent"], { cwd: ROOT, stdio: "inherit" });

const url = `http://${ip}:${PORT}`;
const env = { ...process.env, NORTHVALE_DOTENV: "0", HOST: "0.0.0.0", PORT: String(PORT), ALLOWED_HOSTS: `${ip}:${PORT},${hostname()}:${PORT}`, NORTHVALE_DATA: DATA };
for (const k of ["ANTHROPIC_API_KEY", "ANTHROPIC_AUTH_TOKEN", "SMTP_USER", "SMTP_PASS", "PUBLIC_URL", "ADMIN_TOKEN", "ALERT_WEBHOOK_URL"]) delete env[k];

console.log(`
  Home test: open this on a phone that is on the same Wi-Fi:

      ${url}
`);
try {
  execFileSync("qrencode", ["-t", "ANSIUTF8", url], { stdio: "inherit" });
} catch {
  console.log("  (No QR code: type the address in. For a QR code: brew install qrencode)\n");
}
console.log(`  Your computer may ask "Allow incoming network connections?". Click Allow.
  (If it doesn't connect: System Settings → Network → Firewall, or check that
  the phone is on the same Wi-Fi, not mobile data or a guest network.)
  The AI tutor is in offline mode; real keys are not used. Ctrl+C stops it.

  WHAT TO WATCH FOR (don't help; let them struggle for a moment):
   • Where do they pause or ask "what do I tap?" That's a button or word to fix.
   • Do they find Continue, Learn, Goals, Practice and Me without being told?
   • Do they read the cards or skip straight to the questions?
   • Which question makes them laugh, groan or get annoyed? Which feel too easy or too hard?
   • Do they understand the sea chart, the streak and the XP, or ignore them?
   • Does any text look cut off, too small or too faint on their phone?
   • What do they do after finishing a lesson? Do they want another?
   • Ask afterwards: "What was the most confusing part? Would you open this again tomorrow? Why or why not?"
   Write each thing down in their words. Don't defend the app while they use it.
`);

const server = spawn(process.execPath, ["server/index.js"], { cwd: ROOT, env, stdio: "inherit" });
for (const sig of ["SIGINT", "SIGTERM"]) process.on(sig, () => server.kill(sig));
server.on("exit", (code) => process.exit(code ?? 0));
