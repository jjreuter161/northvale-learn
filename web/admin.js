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

// What brings people back, and whether it works. "Back within 7 days" =
// used the app again in the 7 days after (only events 7+ days old count).
const back = (r) => `${pct(r.pct)} back within 7 days (of ${r.of})`;
function comingBack(c) {
  const p = c.push;
  return [
    el("h2", {}, "What brings people back"),
    el(
      "div",
      { class: "grid" },
      card("Welcome-back screen (3+ days away)", c.comeback.shown, `${c.comeback.started} started a lesson from it · ${pct(c.comeback.lessonSameDay)} finished one that day · ${back(c.comeback.back7)}`),
      card("Streak repairs", `${c.repair.repaired} of ${c.repair.lost}`, `streaks lost and repaired · repaired: ${back(c.repair.back7Repaired)} · not: ${back(c.repair.back7NotRepaired)}`),
      card("Reminders on", p.devicesNow, `${p.learnersOn} ${p.learnersOn === 1 ? "learner" : "learners"} ever turned them on · day-7 return with: ${pct(p.day7With.pct)} (of ${p.day7With.of}), without: ${pct(p.day7Without.pct)} (of ${p.day7Without.of})`),
      card("Reminders sent", p.sent, `${p.opened} opened (${pct(p.openPct)}) · ${p.failed} failed`),
      card("Weekly email recap", c.recap.emailOn ? c.recap.optedIn : "off", c.recap.emailOn ? `opted in · ${c.recap.sent} sent (${c.recap.paused} of them "paused" notes after 4 quiet weeks) · ${c.recap.opened} opened (${pct(c.recap.openPct)}) · ${c.recap.failed} failed` : "email isn't set up on the server yet")
    ),
    table(["Reminder", "Sent", "Opened"], p.kinds.map((k) => [{ streak: "Streak at risk", checkin: "Sunday check-in", review: "Review ready", mission: "Mission", next: "Next lesson" }[k.kind] || k.kind, k.sent, k.opened])),
    el("p", {}, testButton()),
  ];
}
// Checks that reminders reach real phones: one test reminder to every device.
function testButton() {
  const out = el("span", { class: "muted" });
  const b = el("button", { type: "button" }, "Send a test reminder to every device");
  b.addEventListener("click", async () => {
    out.textContent = " Sending…";
    const res = await fetch("/api/admin/push-test", { method: "POST", headers: { "X-Northvale": "1", "X-Admin-Token": sessionStorage.getItem("nvl-admin") || "" } });
    const r = await res.json();
    out.textContent = res.ok ? ` ${r.delivered} of ${r.devices} delivered${r.failed ? `, ${r.failed} failed` : ""}.` : ` ${(r.error && r.error.message) || "Failed."}`;
  });
  return [b, out];
}

// Invites, share cards and classes.
function growth(s) {
  const g = s.growth;
  const c = s.classroom;
  const kinds = { streak: "Streak", unit: "Finished unit", badge: "Badge", goal: "Goal progress" };
  return [
    el("h2", {}, "Invites and sharing"),
    el("div", { class: "grid" }, card("Invite links made", g.links), card("Opened", g.opened, "people who opened someone's link"), card("Joined", g.joined, "finished a first lesson through a link"), card("Freezes earned", g.rewarded, "by people who invited someone"), card("Friend links", g.friendLinks, "pairs in a friends league"), card("Share cards shared", Object.values(s.shares).reduce((t, n) => t + n, 0))),
    table(["Share card", "Shared or saved"], Object.entries(s.shares).map(([k, n]) => [kinds[k] || k, n])),
    el("h2", {}, "Classroom mode (testers only)"),
    el("div", { class: "grid" }, card("Classes", c.classes, `${c.archived} archived (deleted 90 days after archiving)`), card("Teachers", c.teachers), card("Students", c.students, `${c.reporting} have sent progress`)),
  ];
}
// The landing page's waitlist: who's on it, a CSV download, and deleting.
const adminPost = (path, body = {}) => fetch(path, { method: "POST", headers: { "X-Northvale": "1", "Content-Type": "application/json", "X-Admin-Token": sessionStorage.getItem("nvl-admin") || "" }, body: JSON.stringify(body) }).then(async (r) => ({ ok: r.ok, json: await r.json() }));
function waitlistSection(w) {
  const roles = { student: "Students", teacher: "Teachers", parent: "Parents", other: "Other" };
  const download = el("button", { type: "button" }, "Download the list (CSV)");
  download.addEventListener("click", async () => {
    const r = await adminPost("/api/admin/waitlist/export");
    if (!r.ok) return;
    const a = el("a", { href: URL.createObjectURL(new Blob([r.json.csv], { type: "text/csv" })), download: `northvale-waitlist-${new Date().toISOString().slice(0, 10)}.csv` });
    a.click();
  });
  const del = (e) => {
    const b = el("button", { type: "button", class: "quiet" }, "Delete");
    b.addEventListener("click", async () => confirm(`Delete ${e.email} from the waitlist?`) && (await adminPost("/api/admin/waitlist/delete", { id: e.id })).ok && load(sessionStorage.getItem("nvl-admin")));
    return b;
  };
  return [
    el("h2", {}, "Waitlist (landing page)"),
    el("div", { class: "grid" }, card("On the waitlist", w.total), ...Object.entries(roles).map(([k, label]) => card(label, w.byRole[k] || 0)), card("13–17", w.byAge["13-17"] || 0, "with a parent's or guardian's OK"), card("Mexico / US / other", `${w.byCountry.MX || 0} / ${w.byCountry.US || 0} / ${w.byCountry.other || 0}`)),
    el("p", {}, download, el("span", { class: "muted" }, w.total > w.latest.length ? ` (the table shows the latest ${w.latest.length})` : "")),
    table(["Joined", "Email", "Country", "Role", "Age", "Language", ""], w.latest.map((e) => [new Date(e.createdAt).toLocaleDateString(), e.email, e.country, e.role, e.ageBand, e.lang, del(e)])),
  ];
}
// Built but switched off: turn a feature on for one account (testers) or everyone.
function flagsSection(list) {
  return [
    el("h2", {}, "Feature switches"),
    ...list.map((f) => {
      const out = el("span", { class: "muted" });
      const email = el("input", { type: "email", placeholder: "Account email", autocomplete: "off" });
      const send = async (body) => {
        out.textContent = " Saving…";
        const res = await fetch("/api/admin/flags", { method: "POST", headers: { "X-Northvale": "1", "Content-Type": "application/json", "X-Admin-Token": sessionStorage.getItem("nvl-admin") || "" }, body: JSON.stringify({ flag: f.flag, ...body }) });
        const r = await res.json();
        if (!res.ok) return (out.textContent = ` ${(r.error && r.error.message) || "Failed."}`);
        load(sessionStorage.getItem("nvl-admin"));
      };
      const add = el("button", { type: "button" }, "Turn on for this account");
      add.addEventListener("click", () => send({ email: email.value, on: true }));
      const everyone = el("button", { type: "button", class: f.all ? "" : "quiet" }, f.all ? "Turn off for everyone" : "Turn on for everyone");
      everyone.addEventListener("click", () => (f.all || confirm(`Turn ${f.flag} on for EVERYONE?`)) && send({ all: !f.all }));
      return el(
        "div",
        { class: "card" },
        el("div", { class: "big", style: "font-size:18px" }, `${f.flag}: ${f.all ? "on for everyone" : f.accounts.length ? `on for ${f.accounts.length} ${f.accounts.length === 1 ? "account" : "accounts"}` : "off"}`),
        el("div", { class: "label" }, f.about),
        el("ul", {}, f.accounts.map((a) => {
          const off = el("button", { type: "button", class: "quiet" }, "Turn off");
          off.addEventListener("click", () => send({ email: a, on: false }));
          return el("li", {}, `${a} `, off);
        })),
        el("div", { class: "row" }, email, add, everyone, out)
      );
    }),
  ];
}

// THE FIRST WEEK — the beta's numbers against its targets (docs/BETA.md),
// with a plain verdict (never color alone).
const verdict = (value, of, good, low) => (value == null || of < 5 ? "Not enough people yet (5+)" : value >= good ? `On track (target ${good}%+)` : value < low ? `Needs work (under ${low}%)` : `Watch it (target ${good}%+)`);
function firstWeek(s) {
  const w = s.firstWeek;
  return [
    el("h2", {}, "First week of the beta"),
    el(
      "div",
      { class: "grid" },
      card("Testers", s.learners, `${w.startedThisWeek} started this week · ${s.withAccount} with an account · ${s.activeToday} today`),
      card("Came back the next day", pct(s.retention.day1.pct), `${verdict(s.retention.day1.pct, s.retention.day1.of, 30, 20)} · of ${s.retention.day1.of}`),
      card("Came back on day 7", pct(s.retention.day7.pct), `${verdict(s.retention.day7.pct, s.retention.day7.of, 15, 10)} · of ${s.retention.day7.of}`),
      card("“Very disappointed” without it", pct(s.survey.veryPct), `${verdict(s.survey.veryPct, s.survey.answers, 40, 25)} · ${s.survey.answers} answers`),
      card("Finished 3+ lessons", w.threePlus, `of ${s.learners} · they get the survey`),
      card("This week", `${w.feedbackThisWeek} notes`, `feedback · ${w.errorsThisWeek} new errors (below)`)
    ),
  ];
}

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
    ...firstWeek(s),
    el("h2", {}, "The big question"),
    el(
      "div",
      { class: "grid" },
      card("“Very disappointed” without Northvale", pct(s.survey.veryPct), `${s.survey.very} of ${s.survey.answers} answers · 40%+ is a strong signal`),
      card("Somewhat / not disappointed", `${s.survey.somewhat} / ${s.survey.not}`)
    ),
    el("h2", {}, "Coming back"),
    el("div", { class: "grid" }, card("Day-1 return", pct(s.retention.day1.pct), `of ${s.retention.day1.of} who started 1+ days ago`), card("Day-7 return", pct(s.retention.day7.pct), `of ${s.retention.day7.of} who started 7+ days ago`), card("Back within a week", pct(s.retention.within7.pct), `of ${s.retention.within7.of}`), card("Day-30 return", pct(s.retention.day30.pct), `of ${s.retention.day30.of} who started 30+ days ago`), card("Active today", s.activeToday, `${s.learners} learners · ${s.accounts} accounts`)),
    ...comingBack(s.comingBack),
    ...waitlistSection(s.waitlist),
    ...growth(s),
    el("h2", {}, "Learning"),
    el("div", { class: "grid" }, card("Lessons finished", s.lessons.total), card("Per learner", `${s.lessons.perLearnerAvg} avg`, `median ${s.lessons.perLearnerMedian} · ${s.lessons.zero} finished none`), card("Streaks", `${s.streaks.median} median`, `longest ${s.streaks.max} · ${s.streaks.atLeast3} at 3+ · ${s.streaks.atLeast7} at 7+`), card("Tutor questions", s.tutor.questions, `${s.tutor.learnersAsking} learners asked`)),
    el("h2", {}, "Real-life missions"),
    el("div", { class: "grid" }, card("Missions finished", s.missions.done), card("Learners with a mission", s.missions.learners, `of ${s.learners} learners`)),
    table(["Mission", "Started", "Finished", "With a note"], s.missions.list.map((m) => [m.title, m.started, m.done, m.notes])),
    el("h2", {}, "Where people stop inside a lesson (started 1+ days ago, not finished)"),
    table(["Lesson", "Stopped at step", "Learners", "Started"], s.quitPoints.map((q) => [q.title, q.step, q.learners, q.ofStarted])),
    el("h2", {}, "Why they came"),
    table(["Reason", "Learners"], Object.entries(s.reasons).map(([k, v]) => [k, v])),
    ...flagsSection(s.flags),
    el("h2", {}, "AI spending this month"),
    el("div", { class: "card" }, el("div", { class: "big" }, `$${s.ai.spent.toFixed(2)} of $${s.ai.budget}`), el("div", { class: "label" }, `${s.ai.calls} calls · tutor $${(s.ai.tutor || 0).toFixed(2)} · news $${(s.ai.news || 0).toFixed(2)} · explain this $${(s.ai.explain || 0).toFixed(2)} (${s.ai.explainCalls || 0} uses${s.ai.explainPerUse ? ", $" + s.ai.explainPerUse.toFixed(4) + " each" : ""}, ${s.ai.explainLimit}/person/day) · ${s.ai.on ? "on" : "paused"}`), el("div", { class: "bar" }, el("div", { style: `width:${Math.min(100, (s.ai.spent / s.ai.budget) * 100)}%` }))),
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
