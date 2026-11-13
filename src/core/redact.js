// HIDING PRIVATE NUMBERS — before text for "Explain this" leaves the phone,
// card numbers, account numbers, ID numbers (US Social Security number,
// Mexico's CURP and RFC, a CLABE) and long digit strings are replaced with a
// label like [card or account number hidden]. The server does it again,
// so a changed app can't skip it. It errs toward hiding: amounts, dates and
// percentages are left alone, and a few harmless numbers may be hidden too.
// ponytail: patterns, not a guarantee; the screen also asks people to remove
// these numbers themselves, and the text is never stored (docs/legal).
const ID = "ID number hidden";
const ACCOUNT = "card or account number hidden";
const OTHER = "number hidden";

export function redact(input) {
  let hidden = 0;
  const hide = (label) => (hidden++, `[${label}]`);
  let out = String(input ?? "");
  // 13–19 digits in one run, with spaces or dashes: a card number or a CLABE.
  out = out.replace(/(?<![\d$.,])(?:\d[ -]?){12,18}\d(?!\d)/g, (m) => (m.replace(/\D/g, "").length >= 13 ? hide(ACCOUNT) : m));
  // IDs with a fixed shape.
  out = out.replace(/\b\d{3}-\d{2}-\d{4}\b/g, () => hide(ID));
  out = out.replace(/\b[A-ZÑ&]{4}\d{6}[HM][A-Z]{5}[A-Z0-9]\d\b/gi, () => hide(ID));
  out = out.replace(/\b[A-ZÑ&]{3,4}\d{6}[A-Z0-9]{3}\b/gi, (m) => (/\d/.test(m) ? hide(ID) : m));
  // A number right after a label that says what it is.
  out = out.replace(/(\b(?:account|acct|routing|aba|iban|swift|clabe|cuenta|tarjeta|card|ssn|social security|itin|ein|curp|rfc|nss|folio|member|policy|póliza|poliza|pin|nip|cvv|cvc|security code)\b[^\d\n]{0,16})(\d[\d -]{1,}\d)/gi, (m, pre) => pre + hide(OTHER));
  // Any other 9–12 digits in a row (a routing number, an account number).
  out = out.replace(/(?<![\d$.,])\d{9,12}(?![\d]|\.\d)/g, () => hide(OTHER));
  return { text: out, hidden };
}
