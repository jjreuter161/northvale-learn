// THE COLORS — navy, cream and signal red (docs/design/colors/PLAN.md). A look is
// three choices: the background, the text-and-icons color, and the color of the
// main buttons and highlights. `lookFrom` turns them into the app's CSS
// variables; `problem`/`allowed` say whether a combination is readable (WCAG
// AA), so Settings only offers combinations that pass. Red is a spark, never a
// text color on navy, and never the color of a wrong answer.
export const COLORS = {
  navy: { hex: "#1B3560", name: { en: "Navy", es: "Azul marino" } },
  cream: { hex: "#F7F2E8", name: { en: "Cream", es: "Crema" } },
  red: { hex: "#C8202A", name: { en: "Signal red", es: "Rojo señal" } },
};
// Tints (depth only): cards, borders, shadows, illustrations, the red spark on navy.
export const TINTS = {
  navyDeep: "#10223F", navyCard: "#233F70", navyCard2: "#2D4D86", navyLine: "#46679F", navySea: "#2A4A80",
  creamCard: "#FFFDF8", creamSand: "#EFE7D8", creamLine: "#E3D9C6", creamDim: "#CFC8B8",
  redDeep: "#A21A22", redDeeper: "#8B141B", redLight: "#FF8E8B", redSoft: "#F6DAD5",
};

const lum = (h) => {
  const c = [1, 3, 5].map((i) => parseInt(h.slice(i, i + 2), 16) / 255).map((v) => (v <= 0.03928 ? v / 12.92 : ((v + 0.055) / 1.055) ** 2.4));
  return 0.2126 * c[0] + 0.7152 * c[1] + 0.0722 * c[2];
};
export const contrast = (a, b) => {
  const x = lum(a), y = lum(b);
  return (Math.max(x, y) + 0.05) / (Math.min(x, y) + 0.05);
};
const mix = (a, b, t) => "#" + [1, 3, 5].map((i) => Math.round(parseInt(a.slice(i, i + 2), 16) * (1 - t) + parseInt(b.slice(i, i + 2), 16) * t).toString(16).padStart(2, "0")).join("");

// How far the quieter text shades (mid, low) move toward the background: red leaves little room, so its shades barely move.
const SOFTER = { navy: [0.16, 0.26], cream: [0.16, 0.26], red: [0.03, 0.06] };
const SURFACES = {
  navy: { surface: TINTS.navyCard, surface2: TINTS.navyCard2, line: TINTS.navyLine },
  cream: { surface: TINTS.creamCard, surface2: TINTS.creamSand, line: TINTS.creamLine },
  red: { surface: TINTS.redDeep, surface2: TINTS.redDeeper, line: "#D4545C" },
};
// Whichever of cream or navy reads better on `fill` (for a button's label).
const labelOn = (fill) => (contrast(COLORS.cream.hex, fill) >= contrast(COLORS.navy.hex, fill) ? COLORS.cream.hex : COLORS.navy.hex);

// Why a combination isn't offered (or null if it passes).
export function problem(bg, text, hi) {
  const B = COLORS[bg].hex, T = COLORS[text].hex, H = COLORS[hi].hex;
  if (bg === text) return "text";
  if (contrast(T, B) < 4.5) return "text";
  // Quieter text (mid, low) must also stay readable, on the page and on cards.
  for (const back of [B, SURFACES[bg].surface]) for (const share of SOFTER[bg]) if (contrast(mix(T, B, share), back) < 4.5) return "text";
  if (bg === hi) return "highlight";
  if (contrast(labelOn(H), H) < 4.5) return "highlight";
  // The button must stand out from the background (3:1), except red on navy: it gets a cream edge, which does.
  if (contrast(H, B) < 3 && !(bg === "navy" && hi === "red")) return "highlight";
  return null;
}
export const allowed = (bg, text, hi) => problem(bg, text, hi) === null;
export const bold = (bg, text, hi) => bg === "red" || text === "red" || hi === "red" && bg === "red";

export function lookFrom(bg, text, hi) {
  const B = COLORS[bg].hex, T = COLORS[text].hex, H = COLORS[hi].hex;
  const S = SURFACES[bg];
  const dark = bg !== "cream";
  // The red spark: on navy or red, the lighter red tint (the deep red is too close to the background to see).
  const mark = hi === "red" ? (bg === "cream" ? COLORS.red.hex : TINTS.redLight) : H;
  return {
    "--bg": B, "--surface": S.surface, "--surface2": S.surface2, "--line": S.line,
    "--ink": T, "--head": T, "--mid": mix(T, B, SOFTER[bg][0]), "--low": mix(T, B, SOFTER[bg][1]),
    // --brand is calm and safe for words, icons and borders (the text color); the main button's
    // fill is --fill (the highlight color) with --onFill for its label, and on navy a red
    // button gets an edge in the text color (--ring) so it stays visible.
    "--brand": T, "--onBrand": B, "--brandSoft": S.surface2,
    "--fill": H, "--onFill": labelOn(H), "--ringW": bg === "navy" && hi === "red" ? "2px" : "0px", "--ringC": T,
    "--link": T, "--red": COLORS.red.hex, "--onRed": COLORS.cream.hex, "--ringBad": bg === "cream" ? "0px" : "2px",
    "--spark": mark,
    // Whatever is chosen (an answer, a chip, a tab, a setting) is outlined in the main button's color, with the same cream edge on navy; keyboard focus uses the readable red (or the text color).
    "--select": H,
    // Calm by default: progress, selected states and "good" are the text color, never the red.
    "--accent": T, "--accentSoft": S.surface2, "--good": T, "--goodSoft": S.surface2,
    // Feedback without color: a check for right, a gentle hint icon for "not quite", both neutral.
    "--right": T, "--rightSoft": S.surface2, "--warn": T, "--warnSoft": S.surface2,
    // "bad" is only for words that really warn (a scam red flag); on navy it's the light red tint.
    "--bad": hi !== "red" ? T : bg === "cream" ? TINTS.redDeep : bg === "navy" ? TINTS.redLight : T, "--badSoft": hi !== "red" ? S.surface2 : bg === "cream" ? TINTS.redSoft : bg === "navy" ? mix(B, COLORS.red.hex, 0.25) : S.surface2,
    "--flame": T, "--gold": T, "--sky": T,
    "--level1": S.line, "--level2": mix(T, B, 0.45), "--level3": T,
    "--focus": hi === "red" && bg !== "red" ? mark : H,
    "--shadow": "none", "--lift": dark ? "0 12px 26px -16px rgba(0,0,0,.6)" : "0 1px 0 rgba(27,53,96,.04), 0 12px 26px -16px rgba(27,53,96,.28)",
    "--edge": dark ? TINTS.navyDeep : "#10223F",
    "--warm": T, "--warmSoft": S.surface2, "--warmInk": T,
    // Pictures: ink, paper, water; the "sun" is a cream tint, so the only red in a picture is a deliberate spark.
    "--artInk": T, "--artPaper": S.surface, "--artSky": dark ? mix(B, "#000000", 0.18) : "#E8EDF4",
    "--artSea": dark ? TINTS.navySea : "#D3DDEA", "--artSea2": dark ? TINTS.navyLine : "#A9BBD5", "--artSand": dark ? TINTS.navyCard2 : "#EFE0C2",
    "--artSun": dark ? COLORS.cream.hex : TINTS.creamSand, "--artSun2": dark ? TINTS.creamDim : "#E3D9C6",
  };
}

export const PRESETS = [
  { id: "navy", bg: "navy", text: "cream", hi: "red", name: { en: "Navy", es: "Azul marino" }, note: { en: "Default: deep and calm, one red spark", es: "Por defecto: profundo y tranquilo, una chispa roja" } },
  { id: "cream", bg: "cream", text: "navy", hi: "red", name: { en: "Cream", es: "Crema" }, note: { en: "Warm and bright, one red spark", es: "Cálido y claro, una chispa roja" } },
  { id: "navy-cream", bg: "navy", text: "cream", hi: "cream", name: { en: "Navy & cream", es: "Azul y crema" }, note: { en: "The calmest: no red at all", es: "La más tranquila: sin rojo" } },
  { id: "cream-navy", bg: "cream", text: "navy", hi: "navy", name: { en: "Cream & navy", es: "Crema y azul" }, note: { en: "Quiet and classic: no red at all", es: "Tranquila y clásica: sin rojo" } },
];

// What gets saved in settings.look: "auto", a preset's `value`, or "custom" (with settings.colors).
// The two original names stay: "white" is Cream and "navy" is Navy, so saved looks keep working.
for (const p of PRESETS) p.value = p.id === "cream" ? "white" : p.id;
export const presetByValue = (v) => PRESETS.find((p) => p.value === v || p.id === v) || null;
// The three colors for a saved look. "auto" is Navy when the device is dark, Cream when it's light.
export function specFor(settings, deviceDark = false) {
  const look = settings && settings.look;
  if (look === "custom" && settings.colors && COLORS[settings.colors.bg] && COLORS[settings.colors.text] && COLORS[settings.colors.hi] && allowed(settings.colors.bg, settings.colors.text, settings.colors.hi)) return settings.colors;
  const p = look === "auto" || !presetByValue(look) ? (deviceDark ? PRESETS[0] : PRESETS[1]) : presetByValue(look);
  return { bg: p.bg, text: p.text, hi: p.hi };
}
export const looksDark = (spec) => spec.bg !== "cream";
// Every combination that passes: used by the picker and checked by test/colors.test.mjs.
export const ALL_ALLOWED = ["navy", "cream", "red"].flatMap((bg) => ["navy", "cream", "red"].flatMap((text) => ["navy", "cream", "red"].filter((hi) => allowed(bg, text, hi)).map((hi) => ({ bg, text, hi }))));

// Picking one color for one group: if it isn't readable with the other two, the
// others move to the closest combination that is (the same highlight and text
// where they still work), so there's always a way from one look to another.
export function snap(spec, group, value) {
  const next = { ...spec, [group]: value };
  if (allowed(next.bg, next.text, next.hi)) return next;
  const options = ALL_ALLOWED.filter((c) => c[group] === value);
  if (!options.length) return spec;
  const score = (c) => ["bg", "text", "hi"].filter((k) => k !== group && c[k] === spec[k]).length;
  return [...options].sort((a, b) => score(b) - score(a))[0];
}
// Is this color on offer in its group, given the background? (Any background is: the others follow it.)
export const optionOk = (spec, group, id) => (group === "bg" ? ALL_ALLOWED.some((c) => c.bg === id) : ALL_ALLOWED.some((c) => c.bg === spec.bg && c[group] === id));
// Why not: "text" (can't be read on this background) or "highlight" (blends into it).
export const whyNot = (spec, group, id) => (group === "text" ? "text" : "highlight");
// The saved look for three colors: a preset's name if they match one, else "custom".
export const lookValueFor = (spec) => {
  const p = PRESETS.find((x) => x.bg === spec.bg && x.text === spec.text && x.hi === spec.hi);
  return p ? p.value : "custom";
};
