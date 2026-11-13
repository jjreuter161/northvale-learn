// THE FILES THE APP NEEDS TO START (web/precache.json), so the service
// worker keeps them from the very first visit and the app opens offline
// right after it's installed: app.js and every file it imports (not the
// units, which load when opened). Run by `npm run build`, after esbuild.
import { readFileSync, writeFileSync } from "node:fs";
import { join, posix } from "node:path";

const WEB = join(import.meta.dirname, "../web");
const seen = new Set();
const visit = (file) => {
  if (seen.has(file)) return;
  seen.add(file);
  // Static imports only (`from"./x.js"`, `import"./x.js"`); `import("…")` loads later.
  for (const m of readFileSync(join(WEB, file), "utf8").matchAll(/(?:\bfrom|\bimport)\s*"(\.\/[^"]+\.js)"/g)) visit(posix.join(posix.dirname(file), m[1]));
};
visit("app.js");
writeFileSync(join(WEB, "precache.json"), `${JSON.stringify([...seen].map((f) => `/${f}`))}\n`);
