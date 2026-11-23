# Where the lessons' claims come from

The lessons are written in our own words, from understanding the topic; nothing is copied or closely paraphrased from a source. This page says which **official** sources each unit's claims rest on, so a reviewer can check them. It is the "sources list" the lesson-writing checklist asks for.

- **Official sources only** for rules, limits and definitions: for the US the IRS, SSA, FDIC, CFPB, FTC, SEC and FINRA (investor.gov), the Federal Reserve, healthcare.gov and the Bureau of Labor Statistics; for Mexico the SAT, IMSS, CONSAR, Banxico, CONDUSEF, CNBV, INEGI, IPAB and the text of the law (LISR, LFT).
- **Numbers that change** (limits, rates set by law, deadlines, example rates) are not written into a lesson. They live in `src/core/facts.js` and show up as `{@name}`; `docs/FACTS.md` says where to check each one and how often, and `docs/VERIFY-BEFORE-LAUNCH.md` is the list to check before launch (`node scripts/verify-list.mjs`).
- **Examples are labelled as examples.** Example rates and amounts (a 7% index fund, a $1,000 paycheck) are for teaching and say so.
- **Named claims.** Two lessons lean on research that is not an official rule, and name it: the ETFs unit cites S&P's SPIVA scorecards (most actively managed funds have trailed their index over long periods), and the psychology unit's loss aversion lesson reflects the prospect-theory research of Kahneman and Tversky (a loss tends to feel roughly twice as strong as an equal gain; "roughly" because the exact ratio varies between studies). Treat both as "research suggests", never as a rule.
- Anything unsure goes under "Please verify" in `docs/CONTENT-REVIEW.md` and `docs/VERIFY-BEFORE-LAUNCH.md`, not into a lesson as a bare fact.

| Unit | United States | Mexico | Facts it uses (`docs/FACTS.md`) |
|---|---|---|---|
| Budgeting | CFPB (budgeting and "your money, your goals" tools). The 50/30/20 split is a rule of thumb, taught as a guide, not a law | CONDUSEF and Banxico financial-education pages on budgeting | none |
| Saving | FDIC (deposit insurance), CFPB (emergency savings, savings accounts) | IPAB (deposit protection), CONDUSEF, Banxico | `fdicLimit`, `ipabLimitUdis`, `ipabLimitPesosMillions` |
| Banking for real | CFPB (checking, overdraft and account fees; debit and credit cards), FDIC | CONDUSEF (account fees and commissions; its registry of financial institutions), Banxico, CNBV | none |
| Your first paycheck | IRS (Form W-4, Publication 15, withholding), SSA (FICA) | SAT (CFDI payroll receipt, ISR withholding), IMSS (contributions), LFT | `socialSecurityRate`, `medicareRate` |
| Debt & credit | CFPB (credit cards, credit reports and scores), Federal Reserve (G.19 consumer credit), annualcreditreport.com | Banxico (CAT), CONDUSEF (credit bureau guidance, cards) | `cardAprTypical`, `catTypical`, `ficoRange` |
| Scams and fraud | FTC (consumer.ftc.gov), CFPB, SEC and FINRA (investor.gov: fake investments, pyramid schemes) | CONDUSEF (fraud alerts), CNBV | none |
| Compound interest | SEC (investor.gov compound interest calculator), TreasuryDirect | Cetesdirecto (CETES), Banxico (CETES auctions) | `cetesMinimum`, `indexExampleRate` |
| Taxes made simple | IRS (tax brackets, filing, Free File) | SAT (annual return, RFC, IVA), LISR | `usTaxDeadline`, `mxTaxDeadline`, `mxSalaryFilingMin`, `ivaRate`, `salesTaxExample` |
| Insurance basics | healthcare.gov (marketplace plans, coverage for young adults on a parent's plan), state insurance regulators (NAIC consumer pages) | IMSS (health coverage, including students), CONDUSEF and CNSF (insurance) | `parentHealthPlanAge` |
| The psychology of money | No rule to cite: behavioural research (see "Named claims" above) | the same | none |
| Stocks | SEC and FINRA (investor.gov: stocks, how markets work) | BMV and CNBV | none |
| ETFs & index funds | SEC and FINRA (investor.gov: ETFs, index funds, fees); S&P SPIVA scorecards (named) | BMV and CNBV | none |
| Risk & diversification | SEC and FINRA (investor.gov: risk, diversification) | CNBV, BMV | none |
| Crypto and risky investments | SEC, CFTC, FTC and CFPB (crypto and investment-scam alerts) | Banxico and CNBV (virtual assets and the fintech law), CONDUSEF | none |
| Retirement | IRS (IRAs and the Roth, Publications 590-A and 590-B), SSA, Department of Labor | CONSAR (AFORE), SAT and LISR art. 151 (PPR deduction), IMSS (pensions) | `pprDeductionPct`, `pprDeductionUmas`, `pprAge`, `pprDeductionCap`, `iraLimit`, `indexExampleRate`, `matchExampleUS`, `retirementAge` |
| Earning more | IRS (self-employment tax, Forms 1099 and Schedule SE), SBA | SAT (RESICO and other regimes for freelancers and small businesses), LISR | `selfEmploymentTaxRate`, `selfEmploymentFilingMin`, `resicoIncomeCap`, `resicoRateLow`, `resicoRateHigh`, `resicoWithholding` |
| Reading financial news | Federal Reserve (inflation target), Bureau of Labor Statistics (CPI) | Banxico (inflation target), INEGI (INPC) | `fedInflationTarget`, `banxicoInflationTarget` |
| Money across borders | CFPB (the remittance rule, including the cancellation window), FinCEN (reporting of foreign accounts), USCIS and ICE (student work rules) | Banxico (exchange rate), CONDUSEF, SAT | `remitCancelMinutes`, `fbarThreshold`, `f1WorkHours` |

## Please verify

These are facts and wording a human with access to the primary source should confirm before launch. They are the same items `docs/VERIFY-BEFORE-LAUNCH.md` lists with their current values:

- Every `{@fact}` above, against the "Check at" column in `docs/FACTS.md` (several change every year: the IRA limit, the UMA, the tax deadlines, the CETES minimum).
- The two named claims (SPIVA and loss aversion): confirm the current SPIVA wording, and that "roughly twice" is how you want the research stated.
- The Mexico versions of the insurance and retirement units (IMSS coverage for students, the PPR deduction), which depend on current rules and should be read by someone who works with Mexican tax and social-security rules.
