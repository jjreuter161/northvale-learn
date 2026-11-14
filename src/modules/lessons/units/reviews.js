// WHICH UNITS HAVE BEEN REVIEWED, and by whom. A unit that isn't listed here is hidden from learners (the app, and the
// server's certificates and classes) until a human reviewer with a finance background has signed it off (the plan:
// docs/CONTENT-ROADMAP.md, "Quality plan"). To look at unreviewed units yourself, add ?preview=units to the address
// (it's remembered for that tab); tests set NORTHVALE_PREVIEW_UNITS=1. To release a unit after sign-off:
//   node scripts/review.mjs "Reviewer Name" unit1 unit2 …     (writes the lines below and records docs/reviews/)
const LAUNCH = "advisor review before Wave 1";
export const REVIEWED = {
  budget: LAUNCH, save: LAUNCH, banking: LAUNCH, paycheck: LAUNCH, credit: LAUNCH, scams: LAUNCH, compound: LAUNCH, taxes: LAUNCH, insurance: LAUNCH,
  psychology: LAUNCH, stocks: LAUNCH, etf: LAUNCH, risk: LAUNCH, crypto: LAUNCH, retire: LAUNCH, earning: LAUNCH, news: LAUNCH, borders: LAUNCH,
  // (added by scripts/review.mjs)
};
