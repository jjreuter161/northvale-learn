// Finds values in src/ that are outside the design tokens (src/core/tokens.js):
// text sizes, weights, line heights, corner radii, spacing, durations, and hard-coded colors. Used by
// test/design-tokens.test.mjs and by scripts/design-codemod.mjs.
//   node scripts/design-scan.mjs           totals by kind
//   node scripts/design-scan.mjs --list    every offender with its line
//
// What counts: a number written straight into a style (padding: 14, "10px 14px",
// big ? 17 : 15). What doesn't: numbers that are part of a calculation or a test
// (size * 0.4, length > 110), anything inside var(), env() or calc(), and `${…}`
// inside a template string. A font size must be a --t-* token; a size that is
// computed from something else is reported as "computed" so a person decides.
import { readFileSync, readdirSync } from "node:fs";
import { join, relative } from "node:path";
import { ALLOWED } from "../src/core/tokens.js";

const ROOT = join(import.meta.dirname, "..");
// Files that may hold raw colors and shapes: the palette itself, the tokens, and the pictures.
const EXEMPT = new Set(["src/core/colors.js", "src/core/tokens.js", "src/core/art.js"]);

export const KINDS = {
  font: ["fontSize", "font-size"],
  weight: ["fontWeight", "font-weight"],
  leading: ["lineHeight", "line-height"],
  radius: ["borderRadius", "borderTopLeftRadius", "borderTopRightRadius", "borderBottomLeftRadius", "borderBottomRightRadius", "border-radius"],
  space: ["padding", "paddingTop", "paddingBottom", "paddingLeft", "paddingRight", "paddingInline", "paddingBlock", "margin", "marginTop", "marginBottom", "marginLeft", "marginRight", "marginInline", "marginBlock", "gap", "rowGap", "columnGap", "padding-top", "padding-bottom", "padding-left", "padding-right", "margin-top", "margin-bottom", "margin-left", "margin-right", "row-gap", "column-gap"],
};
const KIND_OF = Object.fromEntries(Object.entries(KINDS).flatMap(([k, ps]) => ps.map((p) => [p, k])));
const KEY = new RegExp(`(?<![\\w-])(${Object.keys(KIND_OF).sort((a, b) => b.length - a.length).join("|")})\\s*:\\s*`, "g");

export function files(dir = join(ROOT, "src")) {
  return readdirSync(dir, { withFileTypes: true }).flatMap((e) => (e.isDirectory() ? files(join(dir, e.name)) : /\.(jsx?|mjs)$/.test(e.name) ? [join(dir, e.name)] : []));
}

// The value that follows `prop:` — a quoted string, or an expression up to a comma, semicolon or closing brace.
function valueAt(src, i) {
  const q = src[i];
  if (q === '"' || q === "'" || q === "`") {
    let j = i + 1;
    while (j < src.length && src[j] !== q) j += src[j] === "\\" ? 2 : 1;
    return src.slice(i, j + 1);
  }
  let depth = 0;
  let j = i;
  for (; j < src.length; j++) {
    const c = src[j];
    if (c === "(" || c === "[" || c === "{") depth++;
    else if (c === ")" || c === "]" || c === "}") {
      if (depth === 0) break;
      depth--;
    } else if ((c === "," || c === ";") && depth === 0) break;
    else if (c === "\n" && depth === 0 && /^\s*\/\//.test(src.slice(j + 1, j + 40))) break;
  }
  return src.slice(i, j);
}

// Is position i of a value inside a quoted string?
function inQuote(val, i) {
  let q = null;
  for (let k = 0; k < i; k++) {
    const c = val[k];
    if (q) { if (c === "\\") k++; else if (c === q) q = null; }
    else if (c === '"' || c === "'" || c === "`") q = c;
  }
  return !!q;
}

// Blank out `${…}` (same length) so numbers in code inside a template string aren't read as sizes.
function mask(val) {
  let out = "", depth = 0;
  for (let i = 0; i < val.length; i++) {
    if (!depth && val[i] === "$" && val[i + 1] === "{") { depth = 1; out += "  "; i++; continue; }
    if (depth) { if (val[i] === "{") depth++; else if (val[i] === "}") depth--; out += " "; continue; }
    out += val[i];
  }
  return out;
}

// A plain CSS list of numbers: `14`, `10px 14px`, `0 auto`.
const PURE = /^\s*(?:-?\d+(?:\.\d+)?(?:px)?|auto)(?:\s+(?:-?\d+(?:\.\d+)?(?:px)?|auto))*\s*$/;

// Numbers in a value that are not allowed for its kind (pixel numbers only), with where they sit.
function bad(kind, raw) {
  const value = mask(raw);
  if (/\b(calc|min|max|clamp)\(/.test(value)) return [];
  const pure = PURE.test(value);
  const out = [];
  for (const m of value.matchAll(/(?<![\w.#%-])-?(\d+(?:\.\d+)?)(px)?(?![\w%.])/g)) {
    const before = value.slice(0, m.index);
    // Skip what sits inside var(...) or env(...).
    const last = Math.max(before.lastIndexOf("var("), before.lastIndexOf("env("));
    if (last >= 0 && before.indexOf(")", last) < 0) continue;
    const quoted = inQuote(value, m.index);
    // Outside a string, only a number that stands on its own counts (not one in a sum or a comparison).
    if (!quoted && !pure) {
      const prev = before.trimEnd().slice(-1);
      const next = value.slice(m.index + m[0].length).trimStart().slice(0, 1);
      if (!["", "?", ":", "(", "|", "&"].includes(prev) || !["", ":", ")", "}", "|", "&", "?", "!"].includes(next)) continue;
    }
    const n = Math.abs(parseFloat(m[1]));
    const off = kind === "font" ? true : kind === "weight" ? !ALLOWED.weight.includes(n) : kind === "leading" ? !ALLOWED.leading.includes(n) : kind === "radius" ? !ALLOWED.radius.includes(n) : !ALLOWED.space.includes(n);
    if (off) out.push({ n, idx: m.index + (m[0].startsWith("-") ? 1 : 0), len: m[1].length + (m[2] ? 2 : 0), px: !!m[2], quoted });
  }
  return out;
}

// The offenders in one file's text (`rel` is only the name to report).
export function scanSource(src, rel = "snippet.jsx") {
  const found = [];
  const line = (i) => src.slice(0, i).split("\n").length;
  for (const m of src.matchAll(KEY)) {
    const kind = KIND_OF[m[1]];
    const valStart = m.index + m[0].length;
    const val = valueAt(src, valStart);
    const offs = bad(kind, val);
    for (const b of offs) found.push({ file: rel, kind, line: line(m.index), prop: m[1], value: val.trim().slice(0, 60), n: b.n, abs: valStart + b.idx, len: b.len, px: b.px, quoted: b.quoted });
    // A font size that is neither a --t-* token nor a plain name (a prop passed in) is computed: a person decides.
    if (kind === "font" && !offs.length && !/var\(--t-/.test(val) && !/^[A-Za-z_$][\w$.]*$/.test(val.trim()) && !/^["'](inherit|initial|unset)["']$/.test(val.trim())) found.push({ file: rel, kind, line: line(m.index), prop: m[1], value: val.trim().slice(0, 60), n: "computed", abs: -1, len: 0 });
  }
  // Motion: a transition or animation takes its time from a --m-* token (the 0.01ms of "reduce motion" is the one exception).
  for (const m of src.matchAll(/(?<![\w-])(?:transition|animation)(?:Duration|-duration)?\s*:\s*/g)) {
    const at = m.index + m[0].length;
    const val = src.slice(at, at + 240).replace(/^["'`]/, "").split(/[;}"'`\n]/)[0];
    for (const d of val.matchAll(/(?<![\w.-])(\d*\.?\d+)(ms|s)\b/g)) if (!(parseFloat(d[1]) === 0.01 && d[2] === "ms")) found.push({ file: rel, kind: "motion", line: line(m.index), prop: "duration", value: val.trim().slice(0, 60), n: d[0], abs: -1, len: 0 });
  }
  // A Card's pad={…} prop is spacing too.
  for (const m of src.matchAll(/\bpad=\{/g)) {
    const valStart = m.index + m[0].length;
    let depth = 1, j = valStart;
    for (; j < src.length && depth; j++) depth += src[j] === "{" ? 1 : src[j] === "}" ? -1 : 0;
    const val = src.slice(valStart, j - 1);
    for (const b of bad("space", val)) found.push({ file: rel, kind: "space", line: line(m.index), prop: "pad", value: val.trim().slice(0, 60), n: b.n, abs: valStart + b.idx, len: b.len, px: b.px, quoted: b.quoted });
  }
  // Colors: a hex value or rgb()/hsl() written outside colors.js. A comment doesn't count.
  for (const m of src.matchAll(/#[0-9a-fA-F]{6}\b|#[0-9a-fA-F]{3}\b(?![0-9a-fA-F])|\b(?:rgba?|hsla?)\(/g)) {
    const start = src.lastIndexOf("\n", m.index) + 1;
    if (/^\s*(\/\/|\*|\/\*)/.test(src.slice(start, m.index))) continue;
    if (/\/\/[^\n]*$/.test(src.slice(start, m.index))) continue;
    found.push({ file: rel, kind: "color", line: line(m.index), prop: m[0].startsWith("#") ? "hex" : "function", value: m[0], n: m[0] });
  }
  return found;
}

export function scan() {
  return files().flatMap((f) => {
    const rel = relative(ROOT, f);
    return EXEMPT.has(rel) ? [] : scanSource(readFileSync(f, "utf8"), rel);
  });
}

export function counts(found = scan()) {
  const c = {};
  for (const x of found) (c[x.file] ||= {})[x.kind] = ((c[x.file] || {})[x.kind] || 0) + 1;
  return c;
}

if (import.meta.url === `file://${process.argv[1]}`) {
  const found = scan();
  if (process.argv.includes("--list")) for (const x of found) console.log(`${x.file}:${x.line}  ${x.kind}  ${x.prop}: ${x.value}  [${x.n}]`);
  const totals = {};
  for (const x of found) totals[x.kind] = (totals[x.kind] || 0) + 1;
  console.log(`${found.length} values outside the tokens:`, totals, "in", Object.keys(counts(found)).length, "files");
}
