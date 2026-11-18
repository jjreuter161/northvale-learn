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
  remitRecordUSD: { value: 3000, kind: "usd", check: "31 CFR 1010.410(e) — nonbank financial institutions (money transmitters) must collect and keep the sender's details for transmittals of this amount or more. Text read on law.cornell.edu 2026-11-17; confirm on ecfr.gov or fincen.gov", review: "rarely (set by law)" },
  fbarThreshold: { value: 10000, kind: "usd", check: "fincen.gov — people in the US must report foreign accounts if together they top this at any time in the year (FBAR)", review: "rarely (set by law)" },
  f1WorkHours: { value: 20, kind: "number", check: "studyinthestates.dhs.gov — an F-1 student can usually work on campus up to this many hours a week while classes are in session", review: "rarely (set by law)" },
  // Working across the border (draft unit "Working across the border")
  usOvertimeHours: { value: 40, kind: "number", check: "dol.gov, Fact Sheet #23 — covered, non-exempt US workers get at least time and one-half for hours over 40 in a workweek (federal rule; some states add their own)", review: "rarely (set by law)" },
  usSsCredits: { value: 40, kind: "number", check: "ssa.gov, Benefits Planner — 40 Social Security credits (about 10 years of work, at most 4 a year) to qualify for retirement benefits", review: "rarely (set by law)" },
  usLargeEmployer: { value: 50, kind: "number", check: "irs.gov, Employer shared responsibility — employers with 50 or more full-time employees, counting full-time equivalents, must offer affordable coverage or may owe a payment", review: "rarely (set by law)" },
  mxWeekHours: { value: 48, kind: "number", check: "Mexico's 2026 workweek reform (Constitution art. 123 reform in force 4 March 2026; LFT reform in force 1 May 2026, as reported by the Cámara de Diputados): maximum weekly hours step down 48 (2026), 46 (2027), 44 (2028), 42 (2029), 40 (2030). Read the DOF decree. THIS NUMBER CHANGES EACH JANUARY", review: "yearly (steps down each January)" },
  mxWeekHoursFinal: { value: 40, kind: "number", check: "the same reform: 40 hours a week from 2030. Read the DOF decree", review: "yearly" },
  usMxSsaAgreementStatus: { value: { en: "has not taken effect", es: "no ha entrado en vigor" }, kind: "text", check: "ssa.gov list of international agreements — the US–Mexico Social Security agreement was signed 29 June 2004; secondary sources (KPMG, tax guides) say it never entered into force. SSA's pages would not load for me, so confirm there. If it is now in force, REWRITE lesson 4 of 'Working across the border'", review: "yearly" },
  // Border scams (draft unit "Border scams")
  usReportSite: { value: { en: "ReportFraud.ftc.gov", es: "ReportFraud.ftc.gov" }, kind: "text", check: "reportfraud.ftc.gov — the FTC's place to report fraud and scams (consumer.ftc.gov, 'What to do if you were scammed')", review: "yearly" },
  mxReportLine: { value: { en: "088", es: "088" }, kind: "text", check: "gob.mx/gncertmx — the Guardia Nacional's 088 Atención Ciudadana gives guidance on filing a cybercrime report. Confirm the number and what it covers (fraud by phone and in person is not clearly stated)", review: "yearly" },
  // Cards and digital payments (draft unit "Cards and digital payments")
  usCardLiability: { value: 50, kind: "usd", check: "consumerfinance.gov, Regulation Z 1026.12 and Regulation E 1005.6 — most you can owe for unauthorized use of a credit card ($50), and of a debit card if you report within two business days", review: "rarely (set by law)" },
  usDisputeDays: { value: 60, kind: "number", check: "consumerfinance.gov — send a written billing error notice within 60 calendar days after the charge appeared on your credit card statement (Regulation Z 1026.13)", review: "rarely (set by law)" },
  usDebitReportDays: { value: 2, kind: "number", check: "consumerfinance.gov, Regulation E 1005.6 — report a lost or stolen debit card within two business days to cap your loss at $50 (it rises to $500 after that)", review: "rarely (set by law)" },
  mxDisputeDays: { value: 90, kind: "number", check: "CONDUSEF (article of 6 Feb 2018, citing Banxico's rules) — 90 natural days from the statement cut date, or from the charge, to object to a charge you don't recognize. The article is old: confirm the current Banxico rule and how the days are counted", review: "yearly" },
  // Credit scores and reports (draft unit "Credit scores and reports")
  usNegativeYears: { value: 7, kind: "number", check: "consumerfinance.gov and consumer.ftc.gov (Fair Credit Reporting Act) — most accurate negative items can be reported for 7 years", review: "rarely (set by law)" },
  usBankruptcyYears: { value: 10, kind: "number", check: "consumerfinance.gov and consumer.ftc.gov — a bankruptcy can be reported for up to 10 years. A CFPB table lists Chapter 13 at 7; confirm", review: "rarely (set by law)" },
  usCreditDisputeDays: { value: 30, kind: "number", check: "consumer.ftc.gov, Disputing errors on your credit reports — the credit bureau has 30 days to investigate a dispute", review: "rarely (set by law)" },
  usFreeReportFrequency: { value: { en: "once a week", es: "una vez por semana" }, kind: "text", check: "consumer.ftc.gov (Oct 2023) — the three nationwide bureaus made free weekly reports at AnnualCreditReport.com permanent. Federal law's right is one free report per bureau every 12 months, so confirm the weekly program still runs", review: "yearly" },
  mxBuroMaxYears: { value: 6, kind: "number", check: "Ley para Regular las Sociedades de Información Crediticia, art. 23, via CONDUSEF — negative records stay from 1 year (debts up to 25 UDIs) up to 6 years (over 1,000 UDIs, under 400,000 UDIs, not in court or fraud). Confirm the tiers", review: "yearly" },
  // Judging a job offer (draft unit "Judging a job offer")
  mxVacationDaysYear1: { value: 12, kind: "number", check: "Ley Federal del Trabajo art. 76 (reform of 27 Dec 2022), via PROFEDET — at least 12 vacation days after the first year of work", review: "yearly" },
  mxVacationDaysYear5: { value: 20, kind: "number", check: "LFT art. 76, via PROFEDET — +2 days a year up to 20 in the fifth year (then +2 every five years)", review: "yearly" },
  mxPrimaVacacionalPct: { value: 25, kind: "pct", check: "LFT art. 80, via PROFEDET — prima vacacional of at least 25% of the pay for the vacation days", review: "rarely (set by law)" },
  mxProbationDays: { value: 30, kind: "number", check: "LFT art. 39-A (consolidated text, last reform 21 Feb 2025) — a probation of up to 30 days; it must be in writing (art. 39-C)", review: "yearly" },
  mxProbationDaysSenior: { value: 180, kind: "number", check: "LFT art. 39-A — up to 180 days only for management roles or specialized technical or professional work", review: "yearly" },
  // Taxes in two countries (draft unit "Taxes in two countries"; needs a licensed tax professional)
  foreignGiftReportUSD: { value: 100000, kind: "usd", check: "irs.gov, Gifts from foreign person / Instructions for Form 3520 — a US person who receives more than this in a year from a nonresident alien or foreign estate reports it on Form 3520 (an information return; foreign gifts aren't subject to income tax). Gifts from related people are added together. Separate, lower line for foreign corporations and partnerships", review: "yearly (inflation-adjusted lines exist for other cases)" },
  cashDeclareUSD: { value: 10000, kind: "usd", check: "cbp.gov / FinCEN Form 105 (US: report more than $10,000 in currency or monetary instruments carried in or out) and anam.gob.mx (Mexico: declare more than the equivalent of US$10,000 on entry or exit; fine of 20% to 40% of the excess)", review: "rarely (set by law)" },
  // Sample market data (used only when no market data key is set)
  sampleUsdMxn: { value: 18.5, kind: "number", check: "banxico.org.mx FIX rate — keep near reality even as a sample", review: "monthly" },
  // The practice portfolio
  startCashUS: { value: 10000, kind: "usd", check: "product choice", review: "—" },
  startCashMX: { value: 200000, kind: "mxn", check: "product choice", review: "—" },
};

// Derived: the PPR / voluntary AFORE deduction cap in pesos (5 annual UMAs).
FACTS.pprDeductionCap = { value: Math.round(FACTS.umaAnnual.value * FACTS.pprDeductionUmas.value), kind: "mxn", check: "pprDeductionUmas × umaAnnual (computed)", review: "with umaAnnual" };

export const fact = (name) => FACTS[name].value;
