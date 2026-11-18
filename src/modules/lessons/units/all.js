// THE WHOLE COURSE, every unit file loaded at once: for the content
// checks, the tests, the scripts and scripts/lesson-index.mjs. The app
// itself loads units/index.js (a small index) and fetches each unit's
// cards and questions when they're needed. Units open one after another
// (or by placement); adding a unit = a file in this folder + a line here
// and in index.js's LOADERS. Learners who were
// already further along keep everything they'd reached open (see
// lessonState in ../content.js), so new units can be added anywhere.
import budget from "./budget.js";
import save from "./save.js";
import banking from "./banking.js";
import paycheck from "./paycheck.js";
import credit from "./credit.js";
import scams from "./scams.js";
import compound from "./compound.js";
import taxes from "./taxes.js";
import insurance from "./insurance.js";
import psychology from "./psychology.js";
import stocks from "./stocks.js";
import etf from "./etf.js";
import risk from "./risk.js";
import crypto from "./crypto.js";
import retire from "./retire.js";
import earning from "./earning.js";
import news from "./news.js";
import borders from "./borders.js";
// DRAFT units (draft: true) are checked by the validator and the tests but
// stay out of the app until a reviewer signs them off (see docs/CONTENT-ROADMAP.md).
import sending from "./sending.js";
import twobanks from "./twobanks.js";
import borderwork from "./borderwork.js";
import borderscams from "./borderscams.js";
import cardpay from "./cardpay.js";
import creditscores from "./creditscores.js";
import joboffer from "./joboffer.js";
import bordertaxes from "./bordertaxes.js";

export const UNITS = [budget, save, banking, paycheck, credit, scams, compound, taxes, insurance, psychology, stocks, etf, risk, crypto, retire, earning, news, borders, sending, twobanks, borderwork, borderscams, cardpay, creditscores, joboffer, bordertaxes];

export { PLACEMENT } from "./placement.js";
// Draft lessons for units that are already live (see additions.js). Not in the app.
export { ADDITIONS } from "./additions.js";
