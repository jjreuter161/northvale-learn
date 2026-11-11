// THE PLUG-IN POINT. Every feature is a module that registers itself here:
//
//   registerModule({
//     id: "portfolio",              // its slice of the store is modules.portfolio
//     nav: { tab, label },          // which of the 4 tabs it lives under
//                                   // (learn, goals, practice, me) and its title
//     Screen,                       // its main screen (gets { go, locale, t })
//     practice: { order, Entry },   // its row on the Practice tab (optional)
//     actions: { "portfolio.buy": Widget },  // things a lesson can ask you to do
//     facts: (state) => ({ holdings: 3 }),    // what badges may check
//     services: { explain() {} },             // what other modules may call
//     Onboard,                      // a first-run step (optional)
//     MeCard,                       // a card on the Me page (optional)
//   })
//
// The core never imports a module; main.jsx lists which ones are in the
// app. A future module (a real bank connection, a real brokerage, the
// Northvale money manager) plugs in the same way: its own screen, its own
// slice, its own server routes — the core and the other modules don't
// change. See README → "Adding a module".
const modules = new Map();

export function registerModule(m) {
  if (!m.id) throw new Error("A module needs an id.");
  modules.set(m.id, m);
}
export const allModules = () => [...modules.values()];
export const getModule = (id) => modules.get(id) || null;

// A lesson's "do it" step names an action ("goals.create"); the module that
// owns it renders it. Unknown actions simply aren't shown.
export function actionWidget(kind) {
  for (const m of modules.values()) if (m.actions && m.actions[kind]) return m.actions[kind];
  return null;
}
export const allActionKinds = () => allModules().flatMap((m) => Object.keys(m.actions || {}));

// One module calling another, by name, without importing it:
// service("tutor", "explain")({ ... }). Missing → a no-op.
export function service(moduleId, name) {
  const m = modules.get(moduleId);
  return (m && m.services && m.services[name]) || (() => {});
}

export const facts = (state) => Object.assign({}, ...allModules().map((m) => (m.facts ? m.facts(state) : {})));
