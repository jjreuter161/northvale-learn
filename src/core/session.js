// THE SERVER AND YOUR ACCOUNT. Northvale Learn works without an account —
// everything is saved on this device. Signing in adds: your progress on
// every device, the weekly league, and the AI tutor (it costs money to
// run, so it's for accounts). When signed in, progress syncs both ways;
// the newer copy wins.
import { useSyncExternalStore } from "react";
import { api } from "./api.js";
import { getState, replaceState, update } from "./store.js";
import { track } from "./analytics.js";
import { snapshot } from "./snapshot.js";

let status = { checked: false, online: false, ai: false, market: null, news: false, signup: false, passwordReset: false, recap: false, contact: null, flags: {}, user: null };
const listeners = new Set();
const set = (patch) => {
  status = { ...status, ...patch };
  listeners.forEach((l) => l());
};
export const useSession = () => useSyncExternalStore((l) => (listeners.add(l), () => listeners.delete(l)), () => status);
export const sessionNow = () => status;

// An account's age range (asked at sign-up) fills in "not asked yet".
function adoptAge(user) {
  if (user && user.ageBand && !getState().profile.ageBand) update((x) => ({ ...x, profile: { ...x.profile, ageBand: user.ageBand } }));
}

export async function refreshSession() {
  try {
    const h = await api("/api/health");
    set({ checked: true, online: true, ai: !!h.ai, market: h.market || null, news: !!h.news, signup: h.signup !== false, passwordReset: !!h.passwordReset, recap: !!h.recap, contact: h.contact || null, flags: h.flags || {}, user: h.user || null });
    if (h.user) await pull();
    adoptAge(h.user);
  } catch {
    set({ checked: true, online: false, user: null });
  }
}

// Features switched on for this account (server/flags.js).
const refreshFlags = () => api("/api/health").then((h) => set({ flags: h.flags || {} }), () => {});

// Server copy newer → take it (keeping this device's look); otherwise
// send ours. What's sent includes a few words about what's next, for the
// weekly email (snapshot.js).
// Signing in on a device is different from a device that's already signed
// in: the device may have a fresh, almost empty copy (just went through
// onboarding) that's newer than the account's real progress. So when
// signing in, the account's copy wins unless this device has learned more
// (more XP); afterwards, the newer copy wins.
// ponytail: XP decides, no merge — a device's own goals are dropped if the
// account has learned more; merge per section if testers hit that.
async function pull({ signingIn = false } = {}) {
  try {
    const r = await api("/api/progress");
    const local = getState();
    const serverWins = r.state && (signingIn ? ((r.state.progress && r.state.progress.xp) || 0) >= (local.progress.xp || 0) : r.updatedAt > (local.updatedAt || 0));
    if (serverWins) replaceState({ ...r.state, settings: { ...r.state.settings, look: local.settings.look, colors: local.settings.colors } });
    else await push();
  } catch {
    // Offline for now; the next change tries again.
  }
}
let pushTimer = null;
export async function push() {
  if (!status.user) return;
  const s = getState();
  await api("/api/progress", { method: "PUT", body: { state: { ...s, snapshot: snapshot() }, updatedAt: s.updatedAt } }).catch(() => {});
}
// Called on every change; sends a few seconds after the last one.
export function schedulePush() {
  if (!status.user) return;
  clearTimeout(pushTimer);
  pushTimer = setTimeout(push, 2500);
}

export async function signUp({ email, password, nickname, guardian }) {
  const s = getState();
  const r = await api("/api/auth/signup", { method: "POST", body: { email, password, nickname: nickname || s.profile.nickname, ageBand: s.profile.ageBand, avatar: s.profile.avatar, guardian: !!guardian } });
  set({ user: r.user });
  track("account_created");
  refreshFlags();
  if (r.user.nickname && !s.profile.nickname) update((x) => ({ ...x, profile: { ...x.profile, nickname: r.user.nickname } }));
  await push();
  return r.user;
}
export async function signIn({ email, password }) {
  const r = await api("/api/auth/login", { method: "POST", body: { email, password } });
  set({ user: r.user });
  refreshFlags();
  await pull({ signingIn: true });
  adoptAge(r.user);
  return r.user;
}
export async function forgotPassword(email, lang) {
  return api("/api/auth/forgot", { method: "POST", body: { email, lang } });
}
// From the emailed link: a new password signs you in (and everywhere
// else out), then your saved progress comes down.
export async function resetPassword(token, password) {
  const r = await api("/api/auth/reset", { method: "POST", body: { token, password } });
  set({ user: r.user });
  refreshFlags();
  await pull({ signingIn: true });
  adoptAge(r.user);
  return r.user;
}
export async function signOut() {
  await push();
  await api("/api/auth/logout", { method: "POST" }).catch(() => {});
  set({ user: null });
  refreshFlags();
}
export async function changePassword(current, next) {
  return api("/api/auth/password", { method: "POST", body: { current, next } });
}
export async function deleteAccount(password) {
  await api("/api/me", { method: "DELETE", body: { password } });
  set({ user: null });
  refreshFlags();
}
export async function setRecap(on) {
  const r = await api("/api/me", { method: "PATCH", body: { recap: on } });
  set({ user: r.user });
}
// Who to compete with: "everyone", "friends" or "class".
export async function setLeague(league) {
  const r = await api("/api/me", { method: "PATCH", body: { league } });
  set({ user: r.user });
}
export async function acceptTeacherTerms() {
  const r = await api("/api/me", { method: "PATCH", body: { teacherTerms: true } });
  set({ user: r.user });
}
// Confirming the account's email (to teach a class): a link by email…
export const sendVerify = (lang) => api("/api/auth/verify/send", { method: "POST", body: { lang } });
// …which opens the app at #verify=…
export async function verifyEmail(token) {
  await api("/api/auth/verify", { method: "POST", body: { token } });
  await refreshSession();
}
export async function setNickname(nickname) {
  if (status.user) {
    const r = await api("/api/me", { method: "PATCH", body: { nickname } });
    set({ user: r.user });
  }
}
