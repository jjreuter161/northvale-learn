// THE COURSE, as the app loads it: a small index up front (index.gen.js,
// made by scripts/lesson-index.mjs) and each unit's cards and questions
// fetched the first time they're needed (loadUnits in ../content.js). In
// the build, each unit is its own small file. The whole course at once,
// for scripts and tests: all.js.
import { INDEX } from "./index.gen.js";
export { PLACEMENT } from "./placement.js";

export const UNITS = INDEX.map((u) => ({ ...u, concepts: u.concepts.map((c) => ({ ...c, unit: u.id })), lessons: u.lessons.map((l, index) => ({ ...l, unit: u.id, index })) }));
export const LOADERS = {
  budget: () => import("./budget.js"),
  save: () => import("./save.js"),
  banking: () => import("./banking.js"),
  paycheck: () => import("./paycheck.js"),
  credit: () => import("./credit.js"),
  scams: () => import("./scams.js"),
  compound: () => import("./compound.js"),
  taxes: () => import("./taxes.js"),
  insurance: () => import("./insurance.js"),
  psychology: () => import("./psychology.js"),
  stocks: () => import("./stocks.js"),
  etf: () => import("./etf.js"),
  risk: () => import("./risk.js"),
  crypto: () => import("./crypto.js"),
  retire: () => import("./retire.js"),
  earning: () => import("./earning.js"),
  news: () => import("./news.js"),
};
