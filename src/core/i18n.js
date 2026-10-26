// LANGUAGE AND REGION. Two languages (English, Spanish) and two regions
// (United States, Mexico), chosen separately: a Spanish speaker in the US
// gets US money in Spanish. Text everywhere is { en, es }; a region can
// override it with { ..., MX: { en, es } }. Amounts in text are written
// {$50|1000}: $50 in the US, $1,000 in Mexico (round numbers that feel
// right in each place, not an exchange-rate conversion). {n|day|days}
// picks a word by the number n.
import { FACTS } from "./facts.js";

export const LANGS = { en: "English", es: "Español" };
export const REGIONS = {
  US: { currency: "USD", flag: "🇺🇸", name: { en: "United States", es: "Estados Unidos" } },
  MX: { currency: "MXN", flag: "🇲🇽", name: { en: "Mexico", es: "México" } },
};

// A best guess for a first visit; the user confirms both in onboarding.
export function guessLocale(nav = typeof navigator === "undefined" ? {} : navigator) {
  const tag = String(nav.language || "en-US");
  const zone = (() => {
    try {
      return Intl.DateTimeFormat().resolvedOptions().timeZone || "";
    } catch {
      return "";
    }
  })();
  // English unless the browser is set to Spanish; the country follows the
  // browser (or a Mexican time zone with Spanish). Both can be changed.
  const lang = tag.toLowerCase().startsWith("es") ? "es" : "en";
  const region = /-MX$/i.test(tag) || (lang === "es" && /^America\/(Mexico_City|Monterrey|Merida|Cancun|Chihuahua|Hermosillo|Mazatlan|Tijuana|Matamoros|Ojinaga|Bahia_Banderas)/.test(zone)) ? "MX" : "US";
  return { lang, region };
}

const intlTag = (lang, region) => `${lang}-${region}`;

// Money in a region's currency. Whole units unless cents matter.
export function money(amount, { lang = "en", region = "US", currency, cents } = {}) {
  const cur = currency || REGIONS[region].currency;
  const showCents = cents ?? (Math.abs(amount) < 100 && Math.round(amount * 100) % 100 !== 0);
  // Always "$"; the other country's currency gets its code after it
  // ("$111.74 USD" in Mexico, "$1,000 MXN" in the US).
  const s = new Intl.NumberFormat(intlTag(lang, region), { style: "currency", currency: cur, currencyDisplay: "narrowSymbol", minimumFractionDigits: showCents ? 2 : 0, maximumFractionDigits: showCents ? 2 : 0 }).format(amount);
  return cur === REGIONS[region].currency ? s : `${s} ${cur}`;
}
export const number = (n, { lang = "en", region = "US", digits = 0 } = {}) => new Intl.NumberFormat(intlTag(lang, region), { maximumFractionDigits: digits, minimumFractionDigits: digits }).format(n);
export const percent = (n, { lang = "en", region = "US", digits = 1 } = {}) => new Intl.NumberFormat(intlTag(lang, region), { style: "percent", maximumFractionDigits: digits, minimumFractionDigits: 0 }).format(n / 100);
export const shortDate = (key, { lang = "en", region = "US", year } = {}) => new Date(`${key}T12:00:00`).toLocaleDateString(intlTag(lang, region), { month: "short", day: "numeric", ...(year ? { year: "numeric" } : {}) });

// Picks the text for a language and region from { en, es, MX?: {...} }.
// Plain strings pass through.
export function pick(text, lang, region) {
  if (text == null) return "";
  if (typeof text === "string") return text;
  const local = text[region] && (text[region][lang] ?? text[region]);
  const chosen = typeof local === "string" ? local : text[lang] ?? text.en ?? "";
  return chosen;
}
// A fact from facts.js, formatted for the reader.
function factText(name, lang, region) {
  const f = FACTS[name];
  if (!f) return `{@${name}}`;
  if (f.kind === "usd" || f.kind === "mxn") return money(f.value, { lang, region, currency: f.kind.toUpperCase() });
  if (f.kind === "pct") return `${number(f.value, { lang, region, digits: f.value % 1 ? (f.value * 10) % 1 ? 2 : 1 : 0 })}%`;
  if (f.kind === "text") return f.value[lang] || f.value.en;
  return number(f.value, { lang, region });
}
// …then fills {@fact} values, {$us|mx} amounts, {n|one|other} and {name}.
export function fill(s, { lang, region }, vars = {}) {
  return String(s)
    .replace(/\{@(\w+)\}/g, (_, name) => factText(name, lang, region))
    .replace(/\{\$([\d.]+)\|([\d.]+)\}/g, (_, us, mx) => money(Number(region === "MX" ? mx : us), { lang, region }))
    .replace(/\{(\w+)\|([^|{}]*)\|([^{}]*)\}/g, (m, k, one, other) => (k in vars ? (Number(vars[k]) === 1 ? one : other) : m))
    .replace(/\{(\w+)\}/g, (m, k) => (k in vars ? String(vars[k]) : m));
}
export const text = (t, locale, vars) => fill(pick(t, locale.lang, locale.region), locale, vars);

// UI strings. Each module adds its own with addStrings, so a module brings
// its words with it.
const STRINGS = {};
export function addStrings(table) {
  Object.assign(STRINGS, table);
}
export function makeT(locale) {
  return (key, vars) => {
    const s = STRINGS[key];
    if (!s) return key;
    return fill(pick(s, locale.lang, locale.region), locale, vars);
  };
}
export const allStrings = () => STRINGS;
