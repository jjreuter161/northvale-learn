// THE PROPOSED COLOR SYSTEM (Step 1: a plan and mockups; nothing in the app uses this yet).
// Three colors, with lighter and darker tints for depth. A look is three choices:
// the background, the text-and-icons color, and the main-buttons-and-highlights color.
// `lookFrom` turns the three choices into the app's CSS variables, and `allowed`
// says whether the combination passes WCAG AA (so the picker only offers those).
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
  // Quieter text (mid, low) must also stay readable on cards.
  const s = SURFACES[bg].surface;
  if (contrast(mix(T, B, 0.2), s) < 4.5) return "text";
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
    "--ink": T, "--head": T, "--mid": mix(T, B, 0.16), "--low": mix(T, B, 0.26),
    "--brand": H, "--onBrand": labelOn(H), "--brandSoft": S.surface2,
    // Calm by default: progress, selected states and "good" are the text color, never the red.
    "--accent": T, "--accentSoft": S.surface2, "--good": T, "--goodSoft": S.surface2,
    // Feedback without color: a check for right, a gentle hint icon for "not quite", both neutral.
    "--right": T, "--rightSoft": S.surface2, "--warn": T, "--warnSoft": S.surface2,
    // "bad" is only for words that really warn (a scam red flag); on navy it's the light red tint.
    "--bad": bg === "cream" ? COLORS.red.hex : TINTS.redLight, "--badSoft": bg === "cream" ? TINTS.redSoft : mix(B, COLORS.red.hex, 0.25),
    "--flame": mark, "--gold": T, "--sky": T,
    "--level1": S.line, "--level2": mix(T, B, 0.45), "--level3": T,
    "--focus": dark ? TINTS.creamDim : COLORS.navy.hex,
    "--shadow": "none", "--lift": dark ? "0 12px 26px -16px rgba(0,0,0,.6)" : "0 1px 0 rgba(27,53,96,.04), 0 12px 26px -16px rgba(27,53,96,.28)",
    "--edge": dark ? TINTS.navyDeep : "#10223F",
    "--warm": mark, "--warmSoft": S.surface2, "--warmInk": mark,
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
