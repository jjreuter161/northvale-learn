// USAGE STATS — first-party only, for learning whether Northvale Learn
// helps people and brings them back. What's sent: a random ID made on this
// device (not your account, name or email), what happened ("lesson
// finished", "left a lesson at step 3"), the language and country setting,
// and the day. No IP address is kept, nothing goes to ad or analytics
// companies, and nothing is sold. Off in Settings → Privacy, and off by
// default when the browser asks sites not to track (GPC / Do Not Track).
import { getState } from "./store.js";

const ID_KEY = "northvale-learn-install";
let queue = [];
let timer = null;

export function installId() {
  try {
    let id = localStorage.getItem(ID_KEY);
    if (!id) {
      id = crypto.randomUUID();
      localStorage.setItem(ID_KEY, id);
    }
    return id;
  } catch {
    return null;
  }
}
// "Delete my data": drop anything not yet sent, then the ID itself.
export function forgetInstall() {
  queue = [];
  clearTimeout(timer);
  timer = null;
  try {
    localStorage.removeItem(ID_KEY);
  } catch {}
}

const browserSaysNo = () => typeof navigator !== "undefined" && (navigator.globalPrivacyControl === true || navigator.doNotTrack === "1");
export const analyticsOn = () => {
  const pref = getState().settings.analytics;
  return pref === undefined ? !browserSaysNo() : !!pref;
};

const today = () => {
  const d = new Date();
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
};

export function track(name, props = {}) {
  if (!analyticsOn()) return;
  const s = getState().settings;
  queue.push({ name, props, day: today(), lang: s.lang, region: s.region });
  if (queue.length >= 20) flush();
  else if (!timer) timer = setTimeout(flush, 8000);
}

// keepalive lets the last batch go out even as the page closes, with the
// same X-Northvale header every API call carries.
export function flush() {
  clearTimeout(timer);
  timer = null;
  if (!queue.length) return;
  const id = installId();
  if (!queue.length || !id) return;
  const body = JSON.stringify({ installId: id, events: queue.splice(0, 50) });
  fetch("/api/events", { method: "POST", headers: { "X-Northvale": "1", "Content-Type": "application/json" }, body, keepalive: true }).catch(() => {});
}

if (typeof window !== "undefined") {
  document.addEventListener("visibilitychange", () => document.visibilityState === "hidden" && flush());
}
