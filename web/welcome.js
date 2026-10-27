// The landing page (/welcome, /bienvenida): the waitlist form — 13 and up,
// a parent's or guardian's OK for 13–17, a hidden field that only bots fill
// in — "You're on the list", taking yourself off (right away, or from the
// link in the email: ?leave=…), and the teacher button. Every word shown
// is in the page itself, so this works for both languages.
const $ = (id) => document.getElementById(id);
const form = $("waitlist");
const age = $("age");
const lang = document.documentElement.lang === "es" ? "es" : "en";
let token = null;

const errorText = (code) => form.dataset[`err${code[0]}${code.slice(1).toLowerCase().replace(/_(\w)/g, (_, c) => c.toUpperCase())}`] || form.dataset.errOther;
const showError = (code) => {
  $("err").textContent = code ? errorText(code) : "";
  $("err").hidden = !code;
};
const post = async (path, body) => {
  let res;
  try {
    res = await fetch(path, { method: "POST", headers: { "X-Northvale": "1", "Content-Type": "application/json" }, body: JSON.stringify(body) });
  } catch {
    throw Object.assign(new Error("offline"), { code: "OFFLINE" });
  }
  const data = await res.json().catch(() => ({}));
  if (!res.ok) throw Object.assign(new Error("failed"), { code: (data.error && data.error.code) || "OTHER" });
  return data;
};
const reveal = (id) => {
  for (const p of ["waitlist", "done", "left", "leave-link"]) $(p).hidden = p !== id;
  $(id).focus && $(id).focus();
};

// Under 13: no sign-up. 13–17: check with a parent or guardian first.
function ageChanged() {
  $("young").hidden = age.value !== "under13";
  $("teen").hidden = age.value !== "13-17";
  $("submit").disabled = age.value === "under13";
}
age.addEventListener("change", ageChanged);

form.addEventListener("submit", async (e) => {
  e.preventDefault();
  const email = $("email").value.trim();
  const missing = !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email) ? "EMAIL" : !$("country").value ? "COUNTRY" : !$("role").value ? "ROLE" : !age.value || age.value === "under13" ? "AGE" : age.value === "13-17" && !$("guardian").checked ? "GUARDIAN" : null;
  if (missing) return showError(missing);
  showError(null);
  $("submit").disabled = true;
  try {
    const r = await post("/api/waitlist", { email, country: $("country").value, role: $("role").value, ageBand: age.value, guardian: $("guardian").checked, website: $("website").value, lang });
    token = r.token || null;
    $("done-new").hidden = !!r.already;
    $("done-already").hidden = !r.already;
    $("done-mailed").hidden = !r.mailed;
    $("done-teacher").hidden = $("role").value !== "teacher";
    $("leave-now").hidden = !token;
    reveal("done");
  } catch (err) {
    showError(err.code);
  } finally {
    ageChanged();
  }
});

const leave = (t) =>
  post("/api/waitlist/leave", { token: t }).then(
    () => reveal("left"),
    (err) => alert(errorText(err.code))
  );
$("leave-now").addEventListener("click", () => leave(token));

// From the email's link: ask first (a mail scanner opening the link
// mustn't take anyone off the list).
const fromLink = new URLSearchParams(location.search).get("leave");
if (fromLink) {
  history.replaceState(null, "", location.pathname + "#join");
  reveal("leave-link");
  $("leave-confirm").addEventListener("click", () => leave(fromLink));
}

// "Join as a teacher": the form, with Teacher picked.
for (const a of document.querySelectorAll("[data-role]")) a.addEventListener("click", () => ($("role").value = a.dataset.role));
