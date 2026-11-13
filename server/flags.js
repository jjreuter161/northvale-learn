// FEATURE FLAGS — features that are built but not switched on for
// everyone. Each one is off, on for the accounts listed on the admin page
// (testers), or on for everyone. Off is the default.
import { store } from "./store.js";

export const FLAGS = {
  classroom: "Classroom mode: teachers' classes and their students. Keep it to testers until a lawyer has reviewed it (the private compliance notes).",
};
const of = (flag) => (store.section("flags", () => ({}))[flag] ||= { all: false, accounts: [] });

export const isOn = (flag, user) => of(flag).all || (!!user && of(flag).accounts.includes(user.id));
export const flagsFor = (user) => Object.fromEntries(Object.keys(FLAGS).map((f) => [f, isOn(f, user)]));

// From the admin page: one account by email, or everyone.
export function set(flag, { email, all, on }) {
  if (!FLAGS[flag]) throw Object.assign(new Error("No such feature."), { status: 400 });
  const f = of(flag);
  if (all !== undefined) f.all = all === true;
  else {
    const user = store.userByEmail(String(email || "").trim().toLowerCase());
    if (!user) throw Object.assign(new Error("No account with that email."), { status: 404 });
    f.accounts = f.accounts.filter((id) => id !== user.id);
    if (on) f.accounts.push(user.id);
  }
  store.changed();
  return { ok: true };
}
export const list = () => Object.entries(FLAGS).map(([flag, about]) => ({ flag, about, all: of(flag).all, accounts: of(flag).accounts.map(store.userById).filter(Boolean).map((u) => u.email) }));

export function forget(userId) {
  for (const flag of Object.keys(FLAGS)) of(flag).accounts = of(flag).accounts.filter((id) => id !== userId);
  store.changed();
}
