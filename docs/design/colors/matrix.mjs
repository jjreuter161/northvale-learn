import { COLORS, allowed, problem, contrast, lookFrom, PRESETS } from "./tokens.mjs";
const ids = Object.keys(COLORS);
const rows = [];
for (const bg of ids) for (const text of ids) for (const hi of ids) rows.push([bg, text, hi, allowed(bg, text, hi), problem(bg, text, hi)]);
console.log("allowed:", rows.filter((r) => r[3]).map((r) => r.slice(0, 3).join("/")).join("  "));
console.log("not allowed:", rows.filter((r) => !r[3]).map((r) => r.slice(0, 3).join("/") + "(" + r[4] + ")").join("  "));
for (const p of PRESETS) {
  const L = lookFrom(p.bg, p.text, p.hi);
  const pairs = [["ink/bg", L["--ink"], L["--bg"]], ["mid/bg", L["--mid"], L["--bg"]], ["low/bg", L["--low"], L["--bg"]], ["ink/surface", L["--ink"], L["--surface"]], ["mid/surface", L["--mid"], L["--surface"]], ["low/surface", L["--low"], L["--surface"]], ["onBrand/brand", L["--onBrand"], L["--brand"]], ["brand/bg", L["--brand"], L["--bg"]], ["warm(star)/bg", L["--warm"], L["--bg"]], ["bad(word)/surface", L["--bad"], L["--surface"]]];
  console.log(p.id, pairs.map(([n, a, b]) => `${n} ${contrast(a, b).toFixed(1)}`).join(" · "));
}
