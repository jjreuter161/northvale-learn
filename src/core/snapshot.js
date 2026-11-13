// WHAT'S NEXT, IN A FEW WORDS — for the daily reminder and the weekly
// email, which go out while the app is closed. Made here on the device
// (where the names and the language are) and sent only with reminders on
// (to /api/push) or with an account (with the synced progress, for the
// recap). No mission notes, amounts only as the goal's progress line.
import { getState } from "./store.js";
import { service } from "./registry.js";
import { text } from "./i18n.js";

export function snapshot() {
  const s = getState();
  const locale = { lang: s.settings.lang, region: s.settings.region, both: !!s.settings.both };
  const p = s.progress;
  const next = service("lessons", "nextFor")(service("goals", "recommendedUnits")() || []);
  const goals = service("goals", "progressLines")(locale) || [];
  const m = service("missions", "status")(locale) || {};
  let tz = null;
  try {
    tz = Intl.DateTimeFormat().resolvedOptions().timeZone || null;
  } catch {}
  return {
    tz,
    lessonDay: (p.lessonDays || [])[(p.lessonDays || []).length - 1] || null,
    streak: { count: p.streak.count, last: p.streak.last },
    lessonsDone: Object.values(p.lessons || {}).filter((l) => l && l.done).length,
    reviewDue: service("lessons", "reviewDueOn")() || null,
    goals,
    checkIn: service("goals", "checkInDone")() || null,
    mission: m.mission || null,
    missionWeek: m.missionWeek || null,
    next: next ? text(next.title, locale) : null,
  };
}
