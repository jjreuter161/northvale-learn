// NORTHVALE LEARN SERVER — serves the app, and a small API: optional
// accounts (progress on every device, weekly leagues, the AI tutor), news
// with plain-words summaries, and market prices for the practice
// portfolio. No route touches real money: there are no bank or brokerage
// connections in this version.
//
// Settings (.env): PORT, HOST, ALLOWED_HOSTS, TRUST_PROXY, SIGNUP_CODE,
// ANTHROPIC_API_KEY, TUTOR_MODEL, NEWS_MODEL, AI_MONTHLY_BUDGET_USD,
// TUTOR_DAILY_LIMIT, TUTOR_PER_MINUTE, TWELVEDATA_API_KEY, CETES_RATE,
// CETES_RATE_DATE, ADMIN_TOKEN, ALERT_WEBHOOK_URL, SMTP_USER, SMTP_PASS,
// MAIL_FROM, MAIL_POSTAL_ADDRESS, PUBLIC_URL, CONTACT_EMAIL, NORTHVALE_DATA
// — see README.
import http from "node:http";
import { readFile } from "node:fs/promises";
import { existsSync } from "node:fs";
import { join, extname, resolve, sep } from "node:path";

const ROOT = join(import.meta.dirname, "..");
if (existsSync(join(ROOT, ".env"))) process.loadEnvFile(join(ROOT, ".env"));

const { store, AGE_BANDS, cleanNickname, backup } = await import("./store.js");
const insights = await import("./insights.js");
const { alert } = await import("./alerts.js");
const mail = await import("./mail.js");
const { ALL_LESSONS } = await import("../src/modules/lessons/content.js");
const { MISSIONS } = await import("../src/modules/missions/catalog.js");
const auth = await import("./auth.js");
const market = await import("./market.js");
const news = await import("./news.js");
const push = await import("./push.js");
const recap = await import("./recap.js");
const flags = await import("./flags.js");
const classes = await import("./classes.js");
const invites = await import("./invites.js");
const { weekXp, weekStart, dayKey } = await import("../src/core/progress.js");
// Anthropic's SDK loads only when there's a key, so the rest needs nothing installed.
const ai = process.env.ANTHROPIC_API_KEY || process.env.ANTHROPIC_AUTH_TOKEN ? await import("./ai.js") : null;

const PORT = Number(process.env.PORT) || 8950;
const HOST = process.env.HOST || "127.0.0.1";
const WEB = join(ROOT, "web");
const TRUST_PROXY = process.env.TRUST_PROXY === "1";
const TUTOR_DAILY_LIMIT = Number(process.env.TUTOR_DAILY_LIMIT) || 30;
const TUTOR_PER_MINUTE = Number(process.env.TUTOR_PER_MINUTE) || 5;
// The AI stops for the rest of the month once this much is spent (the
// tutor falls back to the glossary; news shows headlines only).
const AI_BUDGET = Number(process.env.AI_MONTHLY_BUDGET_USD) || 25;
const thisMonth = () => dayKey().slice(0, 7);
const aiOpen = () => !!ai && store.aiSpend(thisMonth()).spent < AI_BUDGET;
function spend(kind, cost) {
  const before = store.aiSpend(thisMonth()).spent;
  const after = store.addAiSpend(thisMonth(), kind, cost).spent;
  for (const level of [0.8, 1])
    if (before < AI_BUDGET * level && after >= AI_BUDGET * level) alert(`budget-${thisMonth()}-${level}`, `AI spending reached ${level * 100}% of this month's $${AI_BUDGET} budget ($${after.toFixed(2)}).${level === 1 ? " The tutor and news summaries are paused until next month." : ""}`);
}
// ADMIN — the private stats page (/admin) needs ADMIN_TOKEN (20+
// characters); wrong tokens are throttled like passwords.
const ADMIN_TOKEN = process.env.ADMIN_TOKEN && process.env.ADMIN_TOKEN.length >= 20 ? process.env.ADMIN_TOKEN : null;
function adminOnly(c) {
  const keys = [`admin:${c.ip}`];
  if (!ADMIN_TOKEN) throw fail(503, "Set ADMIN_TOKEN (20+ characters) on the server to use the admin page.");
  if (auth.throttled(keys)) throw fail(429, "Too many tries. Wait 15 minutes.");
  if (!auth.sameSecret(c.req.headers["x-admin-token"] || "", ADMIN_TOKEN)) {
    auth.recordMiss(keys);
    throw fail(401, "That admin token isn't right.");
  }
}
const titles = Object.fromEntries(ALL_LESSONS.map((l) => [l.id, l.title.en]));
const missionTitles = Object.fromEntries(MISSIONS.map((m) => [m.id, m.title.en]));
// Questions in the last minute, per account (in memory).
const recent = new Map();
setInterval(() => {
  const now = Date.now();
  for (const [k, list] of recent) if (!list.some((t) => now - t < 60000)) recent.delete(k);
}, 600000).unref();
function tooFast(userId) {
  const now = Date.now();
  const list = (recent.get(userId) || []).filter((t) => now - t < 60000);
  recent.set(userId, list);
  if (list.length >= TUTOR_PER_MINUTE) return true;
  list.push(now);
  return false;
}
const HOSTS = new Set([`localhost:${PORT}`, `127.0.0.1:${PORT}`, `[::1]:${PORT}`, ...(process.env.ALLOWED_HOSTS || "").split(",").map((h) => h.trim()).filter(Boolean)]);
const TYPES = { ".woff2": "font/woff2", ".txt": "text/plain; charset=utf-8", ".html": "text/html; charset=utf-8", ".js": "text/javascript; charset=utf-8", ".map": "application/json", ".json": "application/json", ".webmanifest": "application/manifest+json", ".svg": "image/svg+xml", ".png": "image/png", ".ico": "image/x-icon" };

// (The socket can already be gone — e.g. a too-large upload cut short.)
const https = (req) => (TRUST_PROXY ? req.headers["x-forwarded-proto"] === "https" : !!(req.socket && req.socket.encrypted));
// Behind a proxy, only the last X-Forwarded-For entry is the proxy's word.
const ipOf = (req) => (TRUST_PROXY && req.headers["x-forwarded-for"] ? req.headers["x-forwarded-for"].split(",").pop().trim() : req.socket.remoteAddress);
const fail = (status, message, code = null) => Object.assign(new Error(message), { status, code });
const publicUser = (u) => ({ email: u.email, nickname: u.nickname, avatar: u.avatar, ageBand: u.ageBand, recap: !!u.recap, verified: !!u.emailVerifiedAt, teacherTerms: !!u.teacherTermsAt, league: u.league || "everyone", createdAt: u.createdAt });
// Links in emails point here.
const baseOf = (c) => process.env.PUBLIC_URL || `${c.secure ? "https" : "http"}://${c.req.headers.host}`;
const LEAGUES = ["everyone", "friends", "class"];
function startSession(c, user) {
  const s = auth.newSession();
  store.addSession(s.hash, user.id, s.expiresAt);
  c.setCookie(auth.sessionCookie(s.token, c.secure));
  return { user: publicUser(user) };
}
const thisWeek = () => weekStart(dayKey());
// League XP is the app's word, so each day counts at most MAX_DAY_XP
// (finishing all 27 lessons in a day is ~400): a hand-edited number can't
// put anyone on top.
const MAX_DAY_XP = 500;
const xpThisWeek = (state, week) => {
  const days = state && state.progress && state.progress.days;
  if (!days || typeof days !== "object") return 0;
  const capped = Object.fromEntries(Object.entries(days).map(([d, x]) => [d, Math.max(0, Math.min(MAX_DAY_XP, Number(x) || 0))]));
  return weekXp({ days: capped }, week);
};

// The API. `open` routes work signed out; the rest need an account.
const routes = {
  "GET /api/health": { open: true, run: async (c) => ({ ok: true, ai: aiOpen(), aiPaused: !!ai && !aiOpen(), news: true, passwordReset: mail.mailMode() !== "off", recap: mail.mailMode() !== "off", contact: process.env.CONTACT_EMAIL || null, market: market.marketInfo(), signup: !process.env.SIGNUP_CODE || "code", flags: flags.flagsFor(c.user), user: c.user ? publicUser(c.user) : null }) },

  "POST /api/auth/signup": {
    open: true,
    run: async (c) => {
      const keys = [`signup:${c.ip}`];
      if (auth.throttled(keys)) throw fail(429, "Too many tries. Wait 15 minutes, then try again.");
      if (process.env.SIGNUP_CODE && !auth.sameSecret(c.body.code || "", process.env.SIGNUP_CODE)) {
        auth.recordMiss(keys);
        throw fail(403, "This Northvale Learn needs an invite code to sign up.");
      }
      // 13 and up only (the app asks first; this is the rule, not the UI).
      if (!AGE_BANDS.includes(c.body.ageBand)) throw fail(400, "Northvale Learn accounts are for ages 13 and up.", "AGE");
      // Under 18: a parent or guardian says yes first (see docs/COMPLIANCE.md).
      if (c.body.ageBand === "13-17" && c.body.guardian !== true) throw fail(400, "Ask a parent or guardian, then tick the box to say they agreed.", "GUARDIAN");
      const email = auth.normalEmail(c.body.email);
      if (!auth.validEmail(email)) throw fail(400, "Enter a real email address.");
      if (!auth.validPassword(c.body.password)) throw fail(400, `Use a password of at least ${auth.PASSWORD_MIN} characters.`);
      if (store.userByEmail(email)) throw fail(409, "There's already an account with that email. Sign in instead.");
      // Each new account costs a hash and a little disk: count it.
      auth.recordMiss(keys);
      return startSession(c, store.addUser({ email, passwordHash: await auth.hashPassword(c.body.password), nickname: c.body.nickname, ageBand: c.body.ageBand, avatar: c.body.avatar, guardianConsentAt: c.body.ageBand === "13-17" ? new Date().toISOString() : null }));
    },
  },
  "POST /api/auth/login": {
    open: true,
    run: async (c) => {
      const email = auth.normalEmail(c.body.email);
      const keys = [`ip:${c.ip}`, `email:${email}`];
      if (auth.throttled(keys)) throw fail(429, "Too many tries. Wait 15 minutes, then try again.");
      const user = store.userByEmail(email);
      const ok = await auth.passwordMatches(String(c.body.password || ""), auth.passwordFor(user));
      if (!user || !ok) {
        auth.recordMiss(keys);
        throw fail(401, "That email and password don't match.");
      }
      auth.clearMisses(keys);
      return startSession(c, user);
    },
  },
  // FORGOT PASSWORD — always the same answer (so it can't be used to find
  // out who has an account); the link is emailed only if there is one.
  "POST /api/auth/forgot": {
    open: true,
    run: async (c) => {
      const email = auth.normalEmail(c.body.email);
      const keys = [`ip:${c.ip}`, `email:${email}`];
      if (auth.throttled(keys)) throw fail(429, "Too many tries. Wait 15 minutes, then try again.");
      auth.recordMiss(keys);
      if (mail.mailMode() === "off") throw fail(503, "Password reset isn't set up yet.", "NO_MAIL");
      const user = auth.validEmail(email) ? store.userByEmail(email) : null;
      if (user) {
        const s = auth.newSession();
        store.addReset(s.hash, user.id);
        const base = baseOf(c);
        const es = c.body.lang === "es";
        // The token rides in the #fragment, so it never reaches server logs.
        const link = `${base}/#reset=${s.token}`;
        mail
          .sendMail({
            to: user.email,
            subject: es ? "Restablece tu contraseña de Northvale Learn" : "Reset your Northvale Learn password",
            text: es ? `Hola${user.nickname ? ` ${user.nickname}` : ""}:\n\nPara elegir una contraseña nueva, abre este enlace (funciona durante 30 minutos y una sola vez):\n\n${link}\n\nSi no lo pediste, ignora este correo: tu contraseña no cambia.\n\nNorthvale Learn` : `Hi${user.nickname ? ` ${user.nickname}` : ""},\n\nTo choose a new password, open this link (it works for 30 minutes, once):\n\n${link}\n\nIf you didn't ask for this, ignore this email — your password won't change.\n\nNorthvale Learn`,
          })
          .catch((e) => serverError(e));
      }
      return { ok: true };
    },
  },
  "POST /api/auth/reset": {
    open: true,
    run: async (c) => {
      const keys = [`ip:${c.ip}`];
      if (auth.throttled(keys)) throw fail(429, "Too many tries. Wait 15 minutes, then try again.");
      if (!auth.validPassword(c.body.password)) throw fail(400, `Use a password of at least ${auth.PASSWORD_MIN} characters.`);
      const user = store.takeReset(auth.sha256(String(c.body.token || "")));
      if (!user) {
        auth.recordMiss(keys);
        throw fail(400, "That link has expired or was already used. Ask for a new one.", "BAD_LINK");
      }
      store.setPassword(user.id, await auth.hashPassword(c.body.password));
      store.removeAllSessions(user.id);
      auth.clearMisses([`email:${user.email}`]);
      return startSession(c, user);
    },
  },
  // CONFIRMING AN EMAIL ADDRESS — needed to teach a class. The link
  // (#verify=…) works for 24 hours, once.
  "POST /api/auth/verify/send": {
    run: async (c) => {
      if (c.user.emailVerifiedAt) return { ok: true };
      if (!insights.allowed(`verify:${c.user.id}`, 5)) throw fail(429, "That's a few links already. Check your inbox (and spam), or try again in an hour.");
      if (mail.mailMode() === "off") throw fail(503, "Email isn't set up on this server yet.", "NO_MAIL");
      const s = auth.newSession();
      store.addReset(s.hash, c.user.id, "verify", 24 * 3600000);
      const link = `${baseOf(c)}/#verify=${s.token}`;
      const es = c.body.lang === "es";
      mail
        .sendMail({
          to: c.user.email,
          subject: es ? "Confirma tu correo de Northvale Learn" : "Confirm your Northvale Learn email",
          text: es ? `Hola${c.user.nickname ? ` ${c.user.nickname}` : ""}:\n\nPara confirmar que este correo es tuyo, abre este enlace (funciona durante 24 horas y una sola vez):\n\n${link}\n\nSi no lo pediste, ignora este correo.\n\nNorthvale Learn` : `Hi${c.user.nickname ? ` ${c.user.nickname}` : ""},\n\nTo confirm this email address is yours, open this link (it works for 24 hours, once):\n\n${link}\n\nIf you didn't ask for this, ignore this email.\n\nNorthvale Learn`,
        })
        .catch((e) => serverError(e));
      return { ok: true };
    },
  },
  "POST /api/auth/verify": {
    open: true,
    run: async (c) => {
      const keys = [`ip:${c.ip}`];
      if (auth.throttled(keys)) throw fail(429, "Too many tries. Wait 15 minutes, then try again.");
      const user = store.takeReset(auth.sha256(String(c.body.token || "")), "verify");
      if (!user) {
        auth.recordMiss(keys);
        throw fail(400, "That link has expired or was already used. Ask for a new one.", "BAD_LINK");
      }
      store.updateUser(user.id, { emailVerifiedAt: new Date().toISOString() });
      return { ok: true };
    },
  },
  "POST /api/auth/logout": {
    open: true,
    run: async (c) => {
      if (c.sessionHash) store.removeSession(c.sessionHash);
      c.setCookie(auth.clearedCookie(c.secure));
      return { ok: true };
    },
  },
  "GET /api/me": { run: async (c) => ({ user: publicUser(c.user) }) },
  "PATCH /api/me": {
    run: async (c) => {
      const patch = {};
      if ("nickname" in c.body) patch.nickname = cleanNickname(c.body.nickname);
      if ("avatar" in c.body) patch.avatar = Math.max(0, Math.min(9, Number(c.body.avatar) || 0));
      // The weekly email recap: opt-in, and only once email is set up.
      if ("recap" in c.body) {
        if (c.body.recap === true && mail.mailMode() === "off") throw fail(503, "Email isn't set up on this server yet.");
        patch.recap = c.body.recap === true;
      }
      // Who to compete with: everyone (this week's group), friends, or a
      // class — the last two take you out of the everyone league.
      if ("league" in c.body) {
        if (!LEAGUES.includes(c.body.league)) throw fail(400, "Pick everyone, friends or your class.");
        patch.league = c.body.league;
        if (c.body.league !== "everyone") store.leaveLeagues(c.user.id);
      }
      // The teacher terms (docs/legal/teacher.*.md), adults only.
      if (c.body.teacherTerms === true) {
        if (!classes.readiness(c.user).adult) throw fail(403, "Teacher accounts are for adults (18 and up).", "ADULT");
        patch.teacherTermsAt = c.user.teacherTermsAt || new Date().toISOString();
      }
      return { user: publicUser(store.updateUser(c.user.id, patch)) };
    },
  },
  "POST /api/auth/password": {
    run: async (c) => {
      const keys = [`ip:${c.ip}`, `email:${c.user.email}`];
      if (auth.throttled(keys)) throw fail(429, "Too many tries. Wait 15 minutes, then try again.");
      if (!(await auth.passwordMatches(String(c.body.current || ""), c.user.passwordHash))) {
        auth.recordMiss(keys);
        throw fail(401, "Your current password isn't right.");
      }
      if (!auth.validPassword(c.body.next)) throw fail(400, `Use a password of at least ${auth.PASSWORD_MIN} characters.`);
      store.setPassword(c.user.id, await auth.hashPassword(c.body.next));
      store.removeOtherSessions(c.user.id, c.sessionHash);
      return { ok: true };
    },
  },
  "DELETE /api/me": {
    run: async (c) => {
      const keys = [`ip:${c.ip}`, `email:${c.user.email}`];
      if (auth.throttled(keys)) throw fail(429, "Too many tries. Wait 15 minutes, then try again.");
      if (!(await auth.passwordMatches(String(c.body.password || ""), c.user.passwordHash))) {
        auth.recordMiss(keys);
        throw fail(401, "That password isn't right.");
      }
      classes.dropTeacher(c.user.id);
      invites.dropUser(c.user.id);
      flags.forget(c.user.id);
      store.removeUser(c.user.id);
      c.setCookie(auth.clearedCookie(c.secure));
      return { ok: true };
    },
  },

  // PROGRESS — the app's saved state; the newer copy wins.
  "GET /api/progress": { run: async (c) => store.progress(c.user.id) || { state: null, updatedAt: 0 } },
  "PUT /api/progress": {
    limit: 600000,
    run: async (c) => {
      const { state, updatedAt } = c.body;
      if (!state || typeof state !== "object" || Array.isArray(state) || !state.progress || typeof state.progress !== "object") throw fail(400, "That progress isn't readable.");
      const at = Number(updatedAt) || Date.now();
      const current = store.progress(c.user.id);
      if (current && current.updatedAt > at) return { ok: true, kept: "server", updatedAt: current.updatedAt };
      // ponytail: XP is the app's word (no server-side replay of lessons) —
      // fine for friendly leagues; verify lesson events server-side if
      // prizes ever ride on it.
      store.setProgress(c.user.id, state, at, thisWeek(), (c.user.league || "everyone") === "everyone");
      return { ok: true, updatedAt: at };
    },
  },
  // This week's league: the group you joined the week with, or (?with=
  // friends) you and your friends.
  "GET /api/league": {
    run: async (c) => {
      const week = thisWeek();
      const xpOf = (id) => xpThisWeek(store.progress(id) && store.progress(id).state, week);
      const rows =
        c.query.get("with") === "friends"
          ? [{ id: c.user.id, user: c.user, xp: xpOf(c.user.id) }, ...invites.friendsOf(c.user.id).map((f) => ({ id: f.userId, link: f.id, user: store.userById(f.userId), xp: xpOf(f.userId) }))]
          : store.league(c.user.id, week, xpThisWeek);
      return { week, standings: rows.sort((a, b) => b.xp - a.xp).map((r) => ({ nickname: r.user.nickname || null, avatar: r.user.avatar || 0, xp: r.xp, you: r.id === c.user.id, ...(r.link ? { link: r.link } : {}) })) };
    },
  },

  // INVITES and FRIENDS (invites.js).
  "PUT /api/invite": { open: true, run: async (c) => invites.ensure(c.body, c.user, c.ip) },
  "POST /api/invite/open": { open: true, run: async (c) => invites.opened(c.body.code, c.body.by, c.ip) },
  "POST /api/invite/joined": { open: true, run: async (c) => invites.joined(c.body.code, c.body.by, c.ip) },
  "POST /api/invite/claim": { open: true, run: async (c) => invites.claim(c.body.code, c.body.key) },
  "DELETE /api/invite": { open: true, run: async (c) => invites.forget(c.body.code, c.body.key) },
  "POST /api/friends": { run: async (c) => invites.befriend(c.user, c.body.code) },
  "DELETE /api/friends": { run: async (c) => invites.unfriend(c.user, c.body.link) },

  // CLASSROOM MODE (classes.js). Teachers, with an account:
  "GET /api/teach": { run: async (c) => ({ ready: classes.readiness(c.user), classes: classes.list(c.user) }) },
  "POST /api/teach/classes": { run: async (c) => classes.create(c.user, c.body.name) },
  "GET /api/teach/class": { run: async (c) => classes.teacherView(c.user, c.query.get("id")) },
  "PATCH /api/teach/class": { run: async (c) => classes.update(c.user, c.body.id, c.body) },
  "DELETE /api/teach/class": { run: async (c) => classes.remove(c.user, c.body.id) },
  "POST /api/teach/assign": { run: async (c) => classes.assign(c.user, c.body.id, c.body) },
  "DELETE /api/teach/assign": { run: async (c) => classes.unassign(c.user, c.body.id, c.body.assignment) },
  "DELETE /api/teach/student": { run: async (c) => classes.removeStudent(c.user, c.body.id, c.body.student) },
  // …and students, with the class code, then their member key (in the
  // body, never the address).
  "POST /api/class/lookup": { open: true, run: async (c) => classes.lookup(c.body.code, c.ip) },
  "POST /api/class/join": { open: true, run: async (c) => classes.join(c.body, c.ip) },
  "POST /api/class/report": { open: true, limit: 32000, run: async (c) => classes.report(c.body, c.body.report) },
  "POST /api/class/view": { open: true, run: async (c) => classes.studentView(c.body) },
  "POST /api/class/hide": { open: true, run: async (c) => classes.hide(c.body, c.body.hidden) },
  "POST /api/class/leave": { open: true, run: async (c) => classes.leave(c.body) },

  // One tutor reply, streamed as Server-Sent Events: "text" as it's
  // written, then "done" (or "error").
  "POST /api/tutor/turn": {
    limit: 200000,
    stream: true,
    run: async (c) => {
      if (!ai) throw fail(503, "The AI tutor isn't set up on this server.", "AI_OFF");
      if (!aiOpen()) throw fail(503, "The AI tutor is resting until next month. The glossary still works.", "AI_PAUSED");
      const request = ai.tutorRequest(c.body);
      if (tooFast(c.user.id)) throw fail(429, "That's a lot of questions at once — wait a minute, then ask again.", "SLOW_DOWN");
      if (!store.useTutor(c.user.id, dayKey(), TUTOR_DAILY_LIMIT)) throw fail(429, "You've asked a lot today! The tutor is back tomorrow.", "DAILY_LIMIT");
      const turn = await ai.tutorTurn(request, (text) => c.sse("text", { text }));
      spend("tutor", turn.cost);
      c.sse("done", { text: turn.text, stop_reason: turn.stop_reason });
    },
  },

  // TESTER INSIGHTS — usage events, the survey, feedback, app errors.
  "POST /api/events": { open: true, limit: 32000, run: async (c) => insights.record(c.body, c.ip) },
  "DELETE /api/events": { open: true, run: async (c) => (insights.forget(String(c.body.installId || "")), { ok: true }) },
  // REMINDERS (push.js) and the weekly recap's "turn off" link (recap.js).
  "GET /api/push/key": { open: true, run: async () => ({ key: push.publicKey() }) },
  "PUT /api/push": { open: true, limit: 8000, run: async (c) => push.save(c.body, c.ip) },
  "DELETE /api/push": { open: true, run: async (c) => push.remove(c.body.id) },
  "POST /api/recap/off": { open: true, run: async (c) => recap.turnOff(c.body.token, c.ip) },
  "POST /api/survey": { open: true, run: async (c) => insights.survey(c.body) },
  "POST /api/feedback": { open: true, limit: 16000, run: async (c) => insights.feedback(c.body, c.user && c.user.id, c.ip) },
  "POST /api/errors": {
    open: true,
    limit: 8000,
    run: async (c) => {
      const r = insights.error({ ...c.body, where: "app" }, c.ip);
      if (r.isNew) alert(`err-${String(c.body.message).slice(0, 80)}`, `New app error: ${String(c.body.message).slice(0, 200)}`);
      return { ok: true };
    },
  },
  "GET /api/admin/stats": {
    open: true,
    run: async (c) => {
      adminOnly(c);
      const ai = store.aiSpend(thisMonth());
      const s = insights.stats(dayKey(), titles, missionTitles);
      s.comingBack.push.devicesNow = push.deviceCount();
      s.comingBack.recap.optedIn = store.allUsers().filter((u) => u.recap).length;
      s.comingBack.recap.emailOn = mail.mailMode() !== "off";
      return { ...s, accounts: store.userCount(), growth: invites.stats(), classroom: classes.stats(), flags: flags.list(), ai: { ...ai, budget: AI_BUDGET, on: aiOpen() }, generatedAt: new Date().toISOString() };
    },
  },
  // Features that are built but off: on for one account, or everyone.
  "POST /api/admin/flags": {
    open: true,
    run: async (c) => {
      adminOnly(c);
      return flags.set(c.body.flag, c.body);
    },
  },

  "POST /api/admin/push-test": {
    open: true,
    run: async (c) => {
      adminOnly(c);
      return push.sendTest();
    },
  },

  "GET /api/news": {
    open: true,
    run: async (c) => news.getNews({ lang: c.query.get("lang") === "es" ? "es" : "en", region: c.query.get("region") === "MX" ? "MX" : "US" }, aiOpen() ? { explainNews: (items, lang, region) => ai.explainNews(items, lang, region, (cost) => spend("news", cost)) } : null),
  },
  "GET /api/market/quotes": {
    open: true,
    run: async (c) => market.getQuotes(String(c.query.get("symbols") || "").split(",").map((s) => s.trim()).filter(Boolean).slice(0, 40)),
  },
  "GET /api/market/history": { open: true, run: async (c) => market.getHistory(String(c.query.get("symbol") || "")) },
};

async function body(req, limit = 65536) {
  let raw = "";
  for await (const chunk of req) {
    raw += chunk;
    if (raw.length > limit) throw fail(413, "Too large.");
  }
  try {
    return raw ? JSON.parse(raw) : {};
  } catch {
    throw fail(400, "That request wasn't readable.");
  }
}

// Every response: no sniffing, no framing, no referrer; over HTTPS, stay
// there. The page also gets a content policy: scripts and connections only
// to this server (fonts from Google Fonts).
function headers(req, extra) {
  return {
    "X-Content-Type-Options": "nosniff",
    "X-Frame-Options": "DENY",
    "Referrer-Policy": "no-referrer",
    "Permissions-Policy": "camera=(), geolocation=(), microphone=()",
    ...(https(req) ? { "Strict-Transport-Security": "max-age=31536000" } : {}),
    ...extra,
  };
}
const CSP = ["default-src 'self'", "script-src 'self'", "style-src 'self' 'unsafe-inline'", "font-src 'self'", "img-src 'self' data: blob:", "connect-src 'self'", "worker-src 'self'", "manifest-src 'self'", "base-uri 'none'", "form-action 'self'", "frame-ancestors 'none'"].join("; ");
const send = (req, res, status, payload, cookie) => {
  res.writeHead(status, headers(req, { "Content-Type": "application/json", "Cache-Control": "no-store", ...(cookie ? { "Set-Cookie": cookie } : {}) }));
  res.end(JSON.stringify(payload));
};
async function serveFile(req, res, path) {
  const file = resolve(WEB, `.${path === "/" ? "/index.html" : path}`);
  if (!file.startsWith(WEB + sep)) return send(req, res, 404, { error: { message: "Not found" } });
  try {
    const data = await readFile(file);
    res.writeHead(200, headers(req, { "Content-Type": TYPES[extname(file)] || "application/octet-stream", "Cache-Control": "no-cache", ...(file.endsWith(".html") ? { "Content-Security-Policy": CSP } : {}) }));
    res.end(data);
  } catch {
    send(req, res, 404, { error: { message: "Not found" } });
  }
}

function serverError(e) {
  const r = insights.error({ message: e && e.message, stack: e && e.stack, where: "server" });
  if (r.isNew) alert(`srv-${String(e && e.message).slice(0, 80)}`, `New server error: ${String(e && e.message).slice(0, 200)}`);
}
// Any error, as a status and a message for people.
function errorReply(e) {
  const asked = ai && ai.aiError(e);
  if (asked) return { status: asked.status, error: { code: null, message: asked.message } };
  if (e.status) return { status: e.status, error: { code: e.code || null, message: e.message } };
  console.error(e);
  serverError(e);
  return { status: 500, error: { code: null, message: "Something went wrong on the Northvale Learn server." } };
}

async function handle(req, res) {
    // For the host's health checks: no data, so before the host and header
    // checks (the host's checker uses an internal address).
    if (req.url === "/healthz") {
      res.writeHead(200, { "Content-Type": "text/plain", "Cache-Control": "no-store" });
      return res.end("ok");
    }
    if (!HOSTS.has(req.headers.host)) return send(req, res, 421, { error: { message: "Unknown host" } });
    const url = new URL(req.url, "http://x");
    if (!url.pathname.startsWith("/api/")) return req.method === "GET" ? serveFile(req, res, url.pathname === "/admin" ? "/admin.html" : url.pathname) : send(req, res, 405, {});
    // A header other sites can't send without asking first (and the server
    // never says yes), so a web page elsewhere can't drive this API.
    if (req.headers["x-northvale"] !== "1") return send(req, res, 403, { error: { message: "Forbidden" } });
    const r = routes[`${req.method} ${url.pathname}`];
    if (!r) return send(req, res, 404, { error: { message: "Not found" } });
    const token = auth.cookieToken(req);
    const sessionHash = token ? auth.sha256(token) : null;
    const user = sessionHash ? store.sessionUser(sessionHash) : null;
    if (!r.open && !user) return send(req, res, 401, { error: { code: "SIGNED_OUT", message: "Sign in first." } });
    let cookie = null;
    let streaming = false;
    try {
      const c = { req, user, sessionHash, query: url.searchParams, ip: ipOf(req), secure: https(req), setCookie: (v) => (cookie = v), body: req.method === "GET" ? {} : await body(req, r.limit) };
      if (r.stream) {
        c.sse = (event, data) => {
          if (!streaming) res.writeHead(200, headers(req, { "Content-Type": "text/event-stream; charset=utf-8", "Cache-Control": "no-store", "X-Accel-Buffering": "no" }));
          streaming = true;
          res.write(`event: ${event}\ndata: ${JSON.stringify(data)}\n\n`);
        };
        await r.run(c);
        return res.end();
      }
      send(req, res, 200, await r.run(c), cookie);
    } catch (e) {
      const { status, error } = errorReply(e);
      if (streaming) {
        res.write(`event: error\ndata: ${JSON.stringify(error)}\n\n`);
        return res.end();
      }
      send(req, res, status, { error }, cookie);
    }
}

// One bad request must never take the server down for everyone.
http
  .createServer((req, res) =>
    handle(req, res).catch((e) => {
      console.error(e);
      serverError(e);
      if (!res.headersSent && !res.destroyed) send(req, res, 500, { error: { message: "Something went wrong." } });
      else res.destroy();
    })
  )
  .listen(PORT, HOST, () => {
    const daily = () => {
      try {
        backup();
      } catch (e) {
        alert("backup", `Backup failed: ${e.message}`);
      }
      classes.purge();
    };
    daily();
    setInterval(daily, 6 * 3600000).unref();
    // Reminders each minute; recaps every 10 minutes (Sunday evenings).
    setInterval(() => push.tick().catch((e) => serverError(e)), 60000).unref();
    const base = process.env.PUBLIC_URL || `http://localhost:${PORT}`;
    setInterval(() => recap.tick(new Date(), { users: store.allUsers, progressOf: store.progress, base }).catch((e) => serverError(e)), 600000).unref();
    const m = market.marketInfo();
    console.log(`Northvale Learn on http://${HOST === "0.0.0.0" ? "localhost" : HOST}:${PORT}`);
    console.log(`  tutor:  ${ai ? `Claude (${ai.TUTOR_MODEL}), budget $${AI_BUDGET}/month` : "glossary only (set ANTHROPIC_API_KEY for the AI tutor and news summaries)"}`);
    console.log(`  admin:  ${ADMIN_TOKEN ? "/admin" : "off (set ADMIN_TOKEN, 20+ characters)"} · alerts: ${process.env.ALERT_WEBHOOK_URL ? "webhook" : "log only"} · password reset email: ${{ smtp: "on", log: "links printed here (local)", off: "off (set SMTP_USER/SMTP_PASS)" }[mail.mailMode()]}`);
    console.log(`  prices: ${m.source === "twelvedata" ? "Twelve Data (delayed)" : "sample prices (set TWELVEDATA_API_KEY for real delayed prices)"}`);
    console.log(`  accounts: ${store.userCount()}${process.env.SIGNUP_CODE ? " · sign-up needs SIGNUP_CODE" : " · sign-up open"}`);
  });
