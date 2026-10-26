// THE COURSE, in order. Units open one after another (or by placement);
// adding a unit = a file in this folder + a line here. Learners who were
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

export const UNITS = [budget, save, banking, paycheck, credit, scams, compound, taxes, insurance, psychology, stocks, etf, risk, crypto, retire, earning, news];

// The placement test: one challenge per unit, in course order, for the
// first nine units (about 2 minutes). It stops at the first miss.
export const PLACEMENT = [
  ["budget", "budgeting"],
  ["save", "emergency_fund"],
  ["banking", "comparing_accounts"],
  ["paycheck", "gross_net"],
  ["credit", "credit_cards"],
  ["scams", "phishing"],
  ["compound", "compound_interest"],
  ["taxes", "tax_brackets"],
  ["insurance", "premium_deductible"],
];
