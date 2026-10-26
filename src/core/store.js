// THE STORE — one saved state with a slice per module ("lessons",
// "portfolio"…), plus the core's own (profile, settings, progress). Modules
// read and write only their own slice; they talk to each other through
// events (emit/on), never by reaching into another slice. That's what lets
// a module be added or removed without touching the others.
import { useSyncExternalStore } from "react";
import { newProgress } from "./progress.js";
import { guessLocale } from "./i18n.js";

const KEY = "northvale-learn-v1";

export function initialState() {
  const { lang, region } = guessLocale();
  return {
    version: 1,
    updatedAt: 0,
    profile: { onboarded: false, nickname: "", ageBand: null, avatar: 0 },
    settings: { lang, region, look: "white", reduceMotion: false },
    progress: newProgress(),
    modules: {},
  };
}

function load() {
  try {
    const raw = localStorage.getItem(KEY);
    if (!raw) return initialState();
    const saved = JSON.parse(raw);
    const base = initialState();
    return { ...base, ...saved, profile: { ...base.profile, ...saved.profile }, settings: { ...base.settings, ...saved.settings }, progress: { ...base.progress, ...saved.progress }, modules: saved.modules || {} };
  } catch {
    return initialState();
  }
}

let state = typeof window === "undefined" ? initialState() : load();
const listeners = new Set();
let saveTimer = null;

export const getState = () => state;
// `fn` gets the whole state and returns the next one. Saved shortly after.
export function update(fn, { touch = true } = {}) {
  const next = fn(state);
  if (next === state) return;
  state = touch ? { ...next, updatedAt: Date.now() } : next;
  listeners.forEach((l) => l());
  clearTimeout(saveTimer);
  saveTimer = setTimeout(() => {
    try {
      localStorage.setItem(KEY, JSON.stringify(state));
    } catch {
      // Private mode or full storage: the app still works for this visit.
    }
  }, 300);
}
export function replaceState(next) {
  update(() => next, { touch: false });
}
export function resetState() {
  const keep = state.settings;
  update(() => ({ ...initialState(), settings: keep }));
}
const subscribe = (l) => {
  listeners.add(l);
  return () => listeners.delete(l);
};
export const useAppState = (select = (s) => s) => useSyncExternalStore(subscribe, () => select(state));

// A module's own slice, with its defaults filled in.
export function slice(id, defaults = {}) {
  return { ...defaults, ...(state.modules[id] || {}) };
}
export function setSlice(id, fn, defaults = {}) {
  update((s) => ({ ...s, modules: { ...s.modules, [id]: fn({ ...defaults, ...(s.modules[id] || {}) }) } }));
}
export function useSlice(id, defaults = {}) {
  const raw = useAppState((s) => s.modules[id]);
  return { ...defaults, ...(raw || {}) };
}

// EVENTS — "lesson.completed", "portfolio.trade", "goals.saved",
// "news.read", "tutor.asked"… The core listens and turns them into XP,
// streaks and badges; modules can listen to each other the same way.
const handlers = {};
export function on(type, fn) {
  (handlers[type] ||= new Set()).add(fn);
  return () => handlers[type].delete(fn);
}
export function emit(type, payload = {}) {
  [...(handlers[type] || []), ...(handlers["*"] || [])].forEach((fn) => fn(payload, type));
}
