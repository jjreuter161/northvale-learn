// THE COURSE, as the app loads it: a small index up front (index.gen.js,
// made by scripts/lesson-index.mjs) and each unit's cards and questions
// fetched the first time they're needed (loadUnits in ../content.js). In
// the build, each unit is its own small file. The whole course at once,
// for scripts and tests: all.js.
import { INDEX } from "./index.gen.js";
export { PLACEMENT } from "./placement.js";

// Units nobody has signed off yet (reviews.js) stay hidden, unless this tab asked to preview them (?preview=units) or, in
// Node (tests, scripts), NORTHVALE_PREVIEW_UNITS=1.
function previewing() {
  try {
    if (typeof location !== "undefined") {
      if (new URLSearchParams(location.search).get("preview") === "units") sessionStorage.setItem("nv-preview-units", "1");
      return sessionStorage.getItem("nv-preview-units") === "1";
    }
  } catch {}
  return typeof process !== "undefined" && !!process.env && process.env.NORTHVALE_PREVIEW_UNITS === "1";
}
const PREVIEW = previewing();
export const UNITS = INDEX.filter((u) => u.reviewed || PREVIEW).map((u) => ({ ...u, concepts: u.concepts.map((c) => ({ ...c, unit: u.id })), lessons: u.lessons.map((l, index) => ({ ...l, unit: u.id, index })) }));
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
  borders: () => import("./borders.js"),
  remit: () => import("./remit.js"),
  twobanks: () => import("./twobanks.js"),
  crosswork: () => import("./crosswork.js"),
  borderscams: () => import("./borderscams.js"),
};
