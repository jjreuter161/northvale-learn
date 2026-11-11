// FEEL — a light tap on a right answer and a finish, and an optional soft
// tone. Vibration is on by default where it works (Android: iPhones don't
// let web apps vibrate); sound is off by default. Both are in Settings.
import { getState } from "./store.js";

export const canVibrate = () => typeof navigator !== "undefined" && typeof navigator.vibrate === "function";
const PATTERN = { right: 12, finish: [14, 60, 22] };
const NOTES = { right: [660, 880], finish: [523, 659, 784] };
let audio = null;

export function feel(kind) {
  const s = getState().settings;
  if (s.vibrate !== false && canVibrate()) {
    try {
      navigator.vibrate(PATTERN[kind]);
    } catch {
      // (some browsers refuse without a recent tap; nothing to do)
    }
  }
  if (s.sound) chime(NOTES[kind]);
}

// A few quiet sine notes, made on the spot (no audio files).
function chime(notes) {
  try {
    audio ||= new (window.AudioContext || window.webkitAudioContext)();
    const t0 = audio.currentTime;
    notes.forEach((f, i) => {
      const o = audio.createOscillator();
      const g = audio.createGain();
      const t = t0 + i * 0.09;
      o.type = "sine";
      o.frequency.value = f;
      g.gain.setValueAtTime(0, t);
      g.gain.linearRampToValueAtTime(0.05, t + 0.015);
      g.gain.exponentialRampToValueAtTime(0.0001, t + 0.22);
      o.connect(g).connect(audio.destination);
      o.start(t);
      o.stop(t + 0.25);
    });
  } catch {
    // (no audio here; the answer still counts)
  }
}

// The learner's "reduce motion" setting, or the phone's.
export const reducedMotion = () => !!getState().settings.reduceMotion || (typeof matchMedia === "function" && matchMedia("(prefers-reduced-motion: reduce)").matches);
