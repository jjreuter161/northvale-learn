// FEATURE FLAGS — features that are built but not switched on for
// everyone. Each one is off, on for the accounts listed on the admin page
// (testers), or on for everyone. Off is the default.
// A tester can be named by email before they have an account (it applies when
// they sign up with it), and the classroom testers can also be listed in the
// environment: CLASSROOM_TESTERS="ms.rivera@school.org,you@example.com" (a host's
// .env, or `npm run home-test -- --teacher you@example.com`).
import { store } from "./store.js";

export const FLAGS = {
  classroom: "Classroom mode: teachers' classes and their students. Keep it to testers until a lawyer has reviewed it (the private compliance notes).",
};
const of = (flag) => {
  const f = (store.section("flags", () => ({}))[flag] ||= { all: false, accounts: [] });
  f.emails ||= [];
  return f;
};
const lower = (e) => String(e || "").trim().toLowerCase();
const fromEnv = (flag) => (flag === "classroom" ? String(process.env.CLASSROOM_TESTERS || "").split(",").map(lower).filter((e) => e.includes("@")) : []);

export const isOn = (flag, user) => of(flag).all || (!!user && (of(flag).accounts.includes(user.id) || [...of(flag).emails, ...fromEnv(flag)].includes(lower(user.email))));
export const flagsFor = (user) => Object.fromEntries(Object.keys(FLAGS).map((f) => [f, isOn(f, user)]));

// From the admin page: one account by email (or an email that has no account yet), or everyone.
export function set(flag, { email, all, on }) {
  if (!FLAGS[flag]) throw Object.assign(new Error("No such feature."), { status: 400 });
  const f = of(flag);
  if (all !== undefined) f.all = all === true;
  else {
    const addr = lower(email);
    if (!/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(addr)) throw Object.assign(new Error("Enter an email address."), { status: 400 });
    const user = store.userByEmail(addr);
    f.emails = f.emails.filter((e) => e !== addr);
    if (user) f.accounts = f.accounts.filter((id) => id !== user.id);
    if (on) user ? f.accounts.push(user.id) : f.emails.push(addr);
  }
  store.changed();
  return { ok: true };
}
// accounts: testers with an account; waiting: emails without one yet; env: named in the environment (read-only here).
export const list = () =>
  Object.entries(FLAGS).map(([flag, about]) => ({ flag, about, all: of(flag).all, accounts: of(flag).accounts.map(store.userById).filter(Boolean).map((u) => u.email), waiting: of(flag).emails.filter((e) => !store.userByEmail(e)), env: fromEnv(flag) }));

export function forget(userId, email = null) {
  for (const flag of Object.keys(FLAGS)) {
    of(flag).accounts = of(flag).accounts.filter((id) => id !== userId);
    if (email) of(flag).emails = of(flag).emails.filter((e) => e !== lower(email));
  }
  store.changed();
}
