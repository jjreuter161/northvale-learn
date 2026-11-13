// EVERY NUMBER THAT CAN CHANGE OVER TIME, in one place. Lessons, the
// glossary and the simulators read these (in text as {@name}), so updating
// a value here updates it everywhere. Each has where to check it and how
// often. Example rates are teaching examples, not forecasts.
// (docs/FACTS.md lists them with where they appear.)
export const FACTS = {
  // Deposit insurance
  fdicLimit: { value: 250000, kind: "usd", check: "fdic.gov — per depositor, per bank, per ownership category", review: "yearly (set by law)" },
  ipabLimitUdis: { value: 400000, kind: "number", check: "ipab.org.mx — per person, per bank", review: "yearly (set by law)" },
  ipabLimitPesosMillions: { value: 3, kind: "number", check: "400,000 × today's UDI value (banxico.org.mx), rounded down", review: "yearly" },
  // Borrowing costs ("often over …")
  cardAprTypical: { value: 20, kind: "pct", check: "Federal Reserve G.19 — average credit card interest rate", review: "yearly" },
  catTypical: { value: 40, kind: "pct", check: "Banxico / CONDUSEF — CAT promedio de tarjetas", review: "yearly" },
  // Central bank inflation targets
  fedInflationTarget: { value: 2, kind: "pct", check: "federalreserve.gov", review: "rarely changes" },
  banxicoInflationTarget: { value: 3, kind: "pct", check: "banxico.org.mx (3% ± 1 point)", review: "rarely changes" },
  // CETES
  cetesMinimum: { value: 100, kind: "mxn", check: "cetesdirecto.com — minimum purchase", review: "yearly" },
  cetesExampleRate: { value: 7, kind: "pct", check: "banxico.org.mx — latest 28-day CETES auction (also the CETES_RATE server setting)", review: "monthly" },
  // Simulator examples (yearly %)
  savingsExampleRate: { value: 3.5, kind: "pct", check: "a typical high-yield savings rate in the US", review: "every few months" },
  indexExampleRate: { value: 7, kind: "pct", check: "an example yearly return: about the US market's long-run average after inflation (marketAvgReal), so results are roughly in today's money", review: "rarely" },
  marketAvgNominal: { value: 10, kind: "pct", check: "US stock market (S&P 500), long-run yearly average before inflation — roughly 10%", review: "rarely" },
  marketAvgReal: { value: 7, kind: "pct", check: "the same average after inflation — about 7%", review: "rarely" },
  indexRangeLow: { value: 3, kind: "pct", check: "a weak-stretch example", review: "rarely" },
  indexRangeHigh: { value: 10, kind: "pct", check: "a strong-stretch example", review: "rarely" },
  matchExampleUS: { value: 50, kind: "pct", check: "an example employer match (50% of what you put in)", review: "rarely" },
  aforeExtraExampleMX: { value: 30, kind: "pct", check: "an example of employer + government AFORE contributions on top of yours", review: "yearly (contribution rates are rising under the 2020 reform)" },
  retirementAge: { value: 65, kind: "number", check: "an example retirement age", review: "rarely" },
  // Retirement accounts: limits set by law
  iraLimit: { value: 7500, kind: "usd", check: "irs.gov — yearly IRA contribution limit under age 50 (2026: IRS Notice 2025-67); a custodial IRA can't exceed the child's earned income", review: "yearly (announced each November)" },
  rothRule: { value: { en: "age 59½ and a 5-year rule", es: "59½ años y regla de 5 años" }, kind: "text", check: "irs.gov — Roth IRA qualified distributions (Publication 590-B)", review: "rarely (set by law)" },
  umaAnnual: { value: 42794.64, kind: "mxn", check: "inegi.org.mx — UMA anual (2026 value: $42,794.64, in force from Feb 1, 2026)", review: "yearly (published each January)" },
  pprDeductionPct: { value: 10, kind: "pct", check: "LISR art. 151 fracc. V — share of yearly accumulable income", review: "rarely (set by law)" },
  pprDeductionUmas: { value: 5, kind: "number", check: "LISR art. 151 fracc. V — cap, in annual UMAs; one limit shared by PPRs and long-term voluntary AFORE contributions", review: "rarely (set by law)" },
  pprAge: { value: 65, kind: "number", check: "LISR art. 151 fracc. V — withdrawing before this age (without a disability) makes it taxable income", review: "rarely (set by law)" },
  // Credit
  ficoRange: { value: { en: "300 to 850", es: "300 a 850" }, kind: "text", check: "myfico.com — the FICO Score range (VantageScore uses the same range)", review: "rarely" },
  ficoFactors: { value: { en: "payment history (~35%), amounts owed (~30%), length of history (~15%), new credit (~10%) and credit mix (~10%)", es: "historial de pagos (~35%), montos que debes (~30%), antigüedad (~15%), crédito nuevo (~10%) y mezcla de créditos (~10%)" }, kind: "text", check: "myfico.com — \"What's in my FICO Scores\" (the published weights)", review: "rarely" },
  buroFreeReportMonths: { value: 12, kind: "number", check: "Ley para Regular las Sociedades de Información Crediticia, art. 40, and burodecredito.com.mx — one free Reporte de Crédito Especial every this many months", review: "rarely (set by law)" },
  // Paychecks and taxes — US
  socialSecurityRate: { value: 6.2, kind: "pct", check: "ssa.gov — employee share of Social Security tax (up to the yearly wage base)", review: "yearly" },
  medicareRate: { value: 1.45, kind: "pct", check: "irs.gov — employee share of Medicare tax", review: "yearly" },
  selfEmploymentTaxRate: { value: 15.3, kind: "pct", check: "irs.gov — self-employment tax (Social Security + Medicare, both halves)", review: "yearly" },
  selfEmploymentFilingMin: { value: 400, kind: "usd", check: "irs.gov — net self-employment earnings at which you must file", review: "yearly" },
  usTaxDeadline: { value: { en: "April 15", es: "15 de abril" }, kind: "text", check: "irs.gov — usual federal filing deadline (moves when it falls on a weekend or holiday)", review: "yearly" },
  federalWithholdingExample: { value: 8, kind: "pct", check: "an example share of pay withheld for federal income tax for a young worker; real withholding depends on the W-4 and income", review: "rarely" },
  stateTaxExample: { value: 3, kind: "pct", check: "an example state income tax; rates vary and some states have none", review: "rarely" },
  salesTaxExample: { value: 7.5, kind: "pct", check: "taxfoundation.org — population-weighted average combined state + local rate (2026: 7.53%); varies by place", review: "yearly" },
  parentHealthPlanAge: { value: 26, kind: "number", check: "healthcare.gov — you can usually stay on a parent's health plan until this age", review: "rarely (set by law)" },
  // Paychecks and taxes — Mexico
  ivaRate: { value: 16, kind: "pct", check: "sat.gob.mx — general IVA rate", review: "rarely (set by law)" },
  ivaBorderRate: { value: 8, kind: "pct", check: "Decreto de estímulos fiscales, región fronteriza norte y sur — a temporary incentive, only for businesses in the padrón de beneficiarios; not permanent law", review: "each December (the decree must be renewed)" },
  ivaBorderEnds: { value: { en: "December 31, 2026", es: "31 de diciembre de 2026" }, kind: "text", check: "the decree published Dec 31, 2025 extended the border incentive through this date; update or remove the border rate when it changes", review: "each December" },
  isrWithholdingExample: { value: 8, kind: "pct", check: "an example share of pay withheld for ISR for a young worker; real withholding depends on the ISR table and income", review: "rarely" },
  imssWorkerExample: { value: 2.5, kind: "pct", check: "IMSS — the worker's share of cuotas is roughly 2–3% of salary depending on salary; an example, verify", review: "yearly" },
  aguinaldoDays: { value: 15, kind: "number", check: "Ley Federal del Trabajo art. 87 — minimum aguinaldo in days of salary, paid by Dec 20 (proposals for 30 days exist; none had passed as of Oct 2026)", review: "yearly (watch for the 30-day reform)" },
  resicoIncomeCap: { value: 3500000, kind: "mxn", check: "LISR art. 113-E — RESICO is for individuals earning up to this much a year", review: "yearly" },
  resicoRateLow: { value: 1, kind: "pct", check: "LISR art. 113-E — lowest RESICO ISR rate", review: "yearly" },
  resicoRateHigh: { value: 2.5, kind: "pct", check: "LISR art. 113-E — highest RESICO ISR rate", review: "yearly" },
  resicoWithholding: { value: 1.25, kind: "pct", check: "LISR art. 113-J — ISR a company (persona moral) withholds when paying someone in RESICO", review: "yearly" },
  mxTaxDeadline: { value: { en: "April 30", es: "30 de abril" }, kind: "text", check: "sat.gob.mx — personas físicas file the declaración anual during April", review: "yearly" },
  mxSalaryFilingMin: { value: 400000, kind: "mxn", check: "LISR art. 98 — employees earning more than this in a year must file a declaración anual", review: "rarely (set by law)" },
  // Money across borders (illustrative numbers never name or rank real companies)
  remitRateExample: { value: 18, kind: "number", check: "an easy teaching number for pesos per US dollar; keep it within about 10% of the real rate (banxico.org.mx, FIX)", review: "yearly" },
  remitSendExample: { value: 200, kind: "usd", check: "an example amount sent; teaching number", review: "rarely" },
  remitFeeExampleA: { value: 5, kind: "usd", check: "an example flat fee for a service that charges one; real fees vary and can be $0 (compare at qqed.profeco.gob.mx)", review: "yearly" },
  remitMarkupExampleA: { value: 3, kind: "pct", check: "an example markup hidden in the exchange rate; real markups vary by service, amount and day", review: "yearly" },
  remitFeeExampleB: { value: 0, kind: "usd", check: "an example of a service advertising no fee; teaching number", review: "yearly" },
  remitMarkupExampleB: { value: 5, kind: "pct", check: "an example bigger markup hidden in the exchange rate; teaching number", review: "yearly" },
  remitCancelMinutes: { value: 30, kind: "number", check: "consumerfinance.gov — the Remittance Rule: a sender can usually cancel within 30 minutes of paying, if the money hasn't been picked up or deposited", review: "rarely (set by law)" },
  fbarThreshold: { value: 10000, kind: "usd", check: "fincen.gov — people in the US must report foreign accounts if together they top this at any time in the year (FBAR)", review: "rarely (set by law)" },
  f1WorkHours: { value: 20, kind: "number", check: "studyinthestates.dhs.gov — an F-1 student can usually work on campus up to this many hours a week while classes are in session", review: "rarely (set by law)" },
  // Sample market data (used only when no market data key is set)
  sampleUsdMxn: { value: 18.5, kind: "number", check: "banxico.org.mx FIX rate — keep near reality even as a sample", review: "monthly" },
  // The practice portfolio
  startCashUS: { value: 10000, kind: "usd", check: "product choice", review: "—" },
  startCashMX: { value: 200000, kind: "mxn", check: "product choice", review: "—" },
};

// Derived: the PPR / voluntary AFORE deduction cap in pesos (5 annual UMAs).
FACTS.pprDeductionCap = { value: Math.round(FACTS.umaAnnual.value * FACTS.pprDeductionUmas.value), kind: "mxn", check: "pprDeductionUmas × umaAnnual (computed)", review: "with umaAnnual" };

export const fact = (name) => FACTS[name].value;
