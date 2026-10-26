// The admin page: asks for the token, shows the numbers. Everything
// testers wrote is put in with textContent, never as HTML.
const $ = (id) => document.getElementById(id);
const el = (tag, attrs = {}, ...kids) => {
  const n = document.createElement(tag);
  for (const [k, v] of Object.entries(attrs)) k === "class" ? (n.className = v) : n.setAttribute(k, v);
  for (const k of kids.flat()) n.append(k instanceof Node ? k : document.createTextNode(k == null ? "" : String(k)));
  return n;
};
const pct = (x) => (x == null ? "—" : `${x}%`);
const card = (label, value, note) => el("div", { class: "card" }, el("div", { class: "label" }, label), el("div", { class: "big" }, value), note ? el("div", { class: "label" }, note) : "");
const table = (head, rows) => el("table", {}, el("tr", {}, head.map((h) => el("th", {}, h))), rows.length ? rows.map((r) => el("tr", {}, r.map((c) => el("td", {}, c)))) : el("tr", {}, el("td", { colspan: head.length, class: "muted" }, "Nothing yet.")));

async function load(token) {
  $("error").textContent = "";
  const res = await fetch("/api/admin/stats", { headers: { "X-Northvale": "1", "X-Admin-Token": token } });
  const s = await res.json();
  if (!res.ok) throw new Error((s.error && s.error.message) || `HTTP ${res.status}`);
  sessionStorage.setItem("nvl-admin", token);
  if ($("login")) $("login").remove();
  $("sub").textContent = `Updated ${new Date(s.generatedAt).toLocaleString()} · refreshes every minute`;
  const out = $("out");
  out.replaceChildren(
    el("h2", {}, "The big question"),
    el(
      "div",
      { class: "grid" },
      card("“Very disappointed” without Northvale", pct(s.survey.veryPct), `${s.survey.very} of ${s.survey.answers} answers · 40%+ is a strong signal`),
      card("Somewhat / not disappointed", `${s.survey.somewhat} / ${s.survey.not}`)
    ),
    el("h2", {}, "Coming back"),
    el("div", { class: "grid" }, card("Day-1 return", pct(s.retention.day1.pct), `of ${s.retention.day1.of} who started 1+ days ago`), card("Day-7 return", pct(s.retention.day7.pct), `of ${s.retention.day7.of} who started 7+ days ago`), card("Back within a week", pct(s.retention.within7.pct), `of ${s.retention.within7.of}`), card("Active today", s.activeToday, `${s.learners} learners · ${s.accounts} accounts`)),
    el("h2", {}, "Learning"),
    el("div", { class: "grid" }, card("Lessons finished", s.lessons.total), card("Per learner", `${s.lessons.perLearnerAvg} avg`, `median ${s.lessons.perLearnerMedian} · ${s.lessons.zero} finished none`), card("Streaks", `${s.streaks.median} median`, `longest ${s.streaks.max} · ${s.streaks.atLeast3} at 3+ · ${s.streaks.atLeast7} at 7+`), card("Tutor questions", s.tutor.questions, `${s.tutor.learnersAsking} learners asked`)),
    el("h2", {}, "Money Missions"),
    el("div", { class: "grid" }, card("Missions finished", s.missions.done), card("Learners with a mission", s.missions.learners, `of ${s.learners} learners`)),
    table(["Mission", "Started", "Finished", "With a note"], s.missions.list.map((m) => [m.title, m.started, m.done, m.notes])),
    el("h2", {}, "Where people stop inside a lesson (started 1+ days ago, not finished)"),
    table(["Lesson", "Stopped at step", "Learners", "Started"], s.quitPoints.map((q) => [q.title, q.step, q.learners, q.ofStarted])),
    el("h2", {}, "Why they came"),
    table(["Reason", "Learners"], Object.entries(s.reasons).map(([k, v]) => [k, v])),
    el("h2", {}, "AI spending this month"),
    el("div", { class: "card" }, el("div", { class: "big" }, `$${s.ai.spent.toFixed(2)} of $${s.ai.budget}`), el("div", { class: "label" }, `${s.ai.calls} calls · tutor $${(s.ai.tutor || 0).toFixed(2)} · news $${(s.ai.news || 0).toFixed(2)} · ${s.ai.on ? "on" : "paused"}`), el("div", { class: "bar" }, el("div", { style: `width:${Math.min(100, (s.ai.spent / s.ai.budget) * 100)}%` }))),
    el("h2", {}, "Survey answers (latest)"),
    table(["When", "Answer", "Lessons", "Why"], s.survey.recent.map((r) => [new Date(r.at).toLocaleDateString(), r.answer, r.lessons, r.why])),
    el("h2", {}, "Feedback (latest)"),
    table(["When", "Kind", "Where", "Message"], s.feedback.map((f) => [new Date(f.at).toLocaleString(), f.kind, [f.screen, f.context].filter(Boolean).join(" · "), f.text])),
    el("h2", {}, "Errors"),
    table(["Last seen", "Where", "Count", "Message"], s.errors.map((e) => [new Date(e.last).toLocaleString(), e.where, e.count, el("div", {}, e.message, e.stack ? el("pre", {}, e.stack.split("\n").slice(0, 4).join("\n")) : "")]))
  );
}

$("login").addEventListener("submit", (e) => {
  e.preventDefault();
  load($("token").value).catch((x) => ($("error").textContent = x.message));
});
const saved = sessionStorage.getItem("nvl-admin");
if (saved) load(saved).catch(() => sessionStorage.removeItem("nvl-admin"));
setInterval(() => {
  const t = sessionStorage.getItem("nvl-admin");
  if (t) load(t).catch(() => {});
}, 60000);
