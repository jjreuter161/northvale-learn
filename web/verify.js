// The public certificate check: a code in, the track and date (and the name an
// adult chose to show) out. Nothing is stored in the browser, and nothing but
// the code is sent. Text is set with textContent only.
const es = document.documentElement.lang === "es";
const T = es
  ? { ok: "Certificado válido", track: "Tema", date: "Fecha", name: "Otorgado a", no: "No encontramos ese código. Revisa cada letra y número.", rate: "Demasiados intentos. Espera un minuto.", off: "No se pudo conectar. Inténtalo de nuevo." }
  : { ok: "Valid certificate", track: "Track", date: "Issued", name: "Awarded to", no: "We couldn't find that code. Check each letter and number.", rate: "Too many tries. Wait a minute.", off: "Couldn't connect. Please try again." };
const out = document.getElementById("result");
const input = document.getElementById("code");
const el = (tag, cls, text) => Object.assign(document.createElement(tag), cls ? { className: cls } : {}, text != null ? { textContent: text } : {});
const show = (...nodes) => ((out.hidden = false), out.replaceChildren(...nodes));
async function check(code) {
  try {
    const res = await fetch(`/api/cert/verify?code=${encodeURIComponent(code)}`, { headers: { "X-Northvale": "1" } });
    const data = await res.json().catch(() => ({}));
    if (res.status === 429) return show(el("p", "no", T.rate));
    if (!data.valid) return show(el("p", "no", T.no));
    const dl = el("dl");
    const row = (k, v) => dl.append(el("dt", "", k), el("dd", "", v));
    row(T.track, (data.title && (es ? data.title.es : data.title.en)) || data.track);
    row(T.date, new Date(`${data.date}T12:00:00`).toLocaleDateString(es ? "es-MX" : "en-US", { dateStyle: "long" }));
    if (data.name) row(T.name, data.name);
    show(el("p", "ok", `✓ ${T.ok}`), dl);
  } catch {
    show(el("p", "no", T.off));
  }
}
document.getElementById("form").addEventListener("submit", (e) => {
  e.preventDefault();
  check(input.value);
});
const fromLink = new URLSearchParams(location.search).get("code");
if (fromLink) {
  input.value = fromLink.slice(0, 20);
  check(fromLink);
}
