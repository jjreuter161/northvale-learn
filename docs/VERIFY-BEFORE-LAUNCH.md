# Verify before launch

Every fact, number and rule the app states, with where to check it. Tick each one, or fix it, before the public launch, and again on the "how often" schedule. This file is written by `scripts/verify-list.mjs` from the code (facts.js, the worked examples, the myths), so it lists everything; `npm test` fails if it falls out of date. To change a number: edit `src/core/facts.js`, then run `node scripts/verify-list.mjs`.

**Status:** the advisor checked the content facts on 2026-10-25 and 2026-10-26 (see `docs/CONTENT-REVIEW.md`). What's new since then is marked **new**. Nothing here is legal advice.

## 1. Numbers that change (src/core/facts.js): 61

Each one appears in the lessons, the glossary or the tools as `{@name}`; `docs/FACTS.md` says where.

| ✓ | Fact | Now | Check at | How often |
|---|---|---|---|---|
| ☐ | `fdicLimit` | $250,000 | fdic.gov — per depositor, per bank, per ownership category | yearly (set by law) |
| ☐ | `ipabLimitUdis` | 400,000 | ipab.org.mx — per person, per bank | yearly (set by law) |
| ☐ | `ipabLimitPesosMillions` | 3 | 400,000 × today's UDI value (banxico.org.mx), rounded down | yearly |
| ☐ | `cardAprTypical` | 20% | Federal Reserve G.19 — average credit card interest rate | yearly |
| ☐ | `catTypical` | 40% | Banxico / CONDUSEF — CAT promedio de tarjetas | yearly |
| ☐ | `fedInflationTarget` | 2% | federalreserve.gov | rarely changes |
| ☐ | `banxicoInflationTarget` | 3% | banxico.org.mx (3% ± 1 point) | rarely changes |
| ☐ | `cetesMinimum` | $100 MXN | cetesdirecto.com — minimum purchase | yearly |
| ☐ | `cetesExampleRate` | 7% | banxico.org.mx — latest 28-day CETES auction (also the CETES_RATE server setting) | monthly |
| ☐ | `savingsExampleRate` | 3.5% | a typical high-yield savings rate in the US | every few months |
| ☐ | `indexExampleRate` | 7% | an example yearly return: about the US market's long-run average after inflation (marketAvgReal), so results are roughly in today's money | rarely |
| ☐ | `marketAvgNominal` | 10% | US stock market (S&P 500), long-run yearly average before inflation — roughly 10% | rarely |
| ☐ | `marketAvgReal` | 7% | the same average after inflation — about 7% | rarely |
| ☐ | `indexRangeLow` | 3% | a weak-stretch example | rarely |
| ☐ | `indexRangeHigh` | 10% | a strong-stretch example | rarely |
| ☐ | `matchExampleUS` | 50% | an example employer match (50% of what you put in) | rarely |
| ☐ | `aforeExtraExampleMX` | 30% | an example of employer + government AFORE contributions on top of yours | yearly (contribution rates are rising under the 2020 reform) |
| ☐ | `retirementAge` | 65 | an example retirement age | rarely |
| ☐ | `iraLimit` | $7,500 | irs.gov — yearly IRA contribution limit under age 50 (2026: IRS Notice 2025-67); a custodial IRA can't exceed the child's earned income | yearly (announced each November) |
| ☐ | `rothRule` **new** | age 59½ and a 5-year rule / 59½ años y regla de 5 años | irs.gov — Roth IRA qualified distributions (Publication 590-B) | rarely (set by law) |
| ☐ | `umaAnnual` | $42,794.64 MXN | inegi.org.mx — UMA anual (2026 value: $42,794.64, in force from Feb 1, 2026) | yearly (published each January) |
| ☐ | `pprDeductionPct` | 10% | LISR art. 151 fracc. V — share of yearly accumulable income | rarely (set by law) |
| ☐ | `pprDeductionUmas` | 5 | LISR art. 151 fracc. V — cap, in annual UMAs; one limit shared by PPRs and long-term voluntary AFORE contributions | rarely (set by law) |
| ☐ | `pprAge` | 65 | LISR art. 151 fracc. V — withdrawing before this age (without a disability) makes it taxable income | rarely (set by law) |
| ☐ | `ficoRange` **new** | 300 to 850 / 300 a 850 | myfico.com — the FICO Score range (VantageScore uses the same range) | rarely |
| ☐ | `ficoFactors` **new** | payment history (~35%), amounts owed (~30%), length of history (~15%), new credit (~10%) and credit mix (~10%) / historial de pagos (~35%), montos que debes (~30%), antigüedad (~15%), crédito nuevo (~10%) y mezcla de créditos (~10%) | myfico.com — "What's in my FICO Scores" (the published weights) | rarely |
| ☐ | `buroFreeReportMonths` **new** | 12 | Ley para Regular las Sociedades de Información Crediticia, art. 40, and burodecredito.com.mx — one free Reporte de Crédito Especial every this many months | rarely (set by law) |
| ☐ | `socialSecurityRate` | 6.2% | ssa.gov — employee share of Social Security tax (up to the yearly wage base) | yearly |
| ☐ | `medicareRate` | 1.45% | irs.gov — employee share of Medicare tax | yearly |
| ☐ | `selfEmploymentTaxRate` | 15.3% | irs.gov — self-employment tax (Social Security + Medicare, both halves) | yearly |
| ☐ | `selfEmploymentFilingMin` | $400 | irs.gov — net self-employment earnings at which you must file | yearly |
| ☐ | `usTaxDeadline` | April 15 / 15 de abril | irs.gov — usual federal filing deadline (moves when it falls on a weekend or holiday) | yearly |
| ☐ | `federalWithholdingExample` | 8% | an example share of pay withheld for federal income tax for a young worker; real withholding depends on the W-4 and income | rarely |
| ☐ | `stateTaxExample` | 3% | an example state income tax; rates vary and some states have none | rarely |
| ☐ | `salesTaxExample` | 7.5% | taxfoundation.org — population-weighted average combined state + local rate (2026: 7.53%); varies by place | yearly |
| ☐ | `parentHealthPlanAge` | 26 | healthcare.gov — you can usually stay on a parent's health plan until this age | rarely (set by law) |
| ☐ | `ivaRate` | 16% | sat.gob.mx — general IVA rate | rarely (set by law) |
| ☐ | `ivaBorderRate` | 8% | Decreto de estímulos fiscales, región fronteriza norte y sur — a temporary incentive, only for businesses in the padrón de beneficiarios; not permanent law | each December (the decree must be renewed) |
| ☐ | `ivaBorderEnds` | December 31, 2026 / 31 de diciembre de 2026 | the decree published Dec 31, 2025 extended the border incentive through this date; update or remove the border rate when it changes | each December |
| ☐ | `isrWithholdingExample` | 8% | an example share of pay withheld for ISR for a young worker; real withholding depends on the ISR table and income | rarely |
| ☐ | `imssWorkerExample` | 2.5% | IMSS — the worker's share of cuotas is roughly 2–3% of salary depending on salary; an example, verify | yearly |
| ☐ | `aguinaldoDays` | 15 | Ley Federal del Trabajo art. 87 — minimum aguinaldo in days of salary, paid by Dec 20 (proposals for 30 days exist; none had passed as of Oct 2026) | yearly (watch for the 30-day reform) |
| ☐ | `resicoIncomeCap` | $3,500,000 MXN | LISR art. 113-E — RESICO is for individuals earning up to this much a year | yearly |
| ☐ | `resicoRateLow` | 1% | LISR art. 113-E — lowest RESICO ISR rate | yearly |
| ☐ | `resicoRateHigh` | 2.5% | LISR art. 113-E — highest RESICO ISR rate | yearly |
| ☐ | `resicoWithholding` | 1.25% | LISR art. 113-J — ISR a company (persona moral) withholds when paying someone in RESICO | yearly |
| ☐ | `mxTaxDeadline` | April 30 / 30 de abril | sat.gob.mx — personas físicas file the declaración anual during April | yearly |
| ☐ | `mxSalaryFilingMin` | $400,000 MXN | LISR art. 98 — employees earning more than this in a year must file a declaración anual | rarely (set by law) |
| ☐ | `remitRateExample` **new** | 18 | an easy teaching number for pesos per US dollar; keep it within about 10% of the real rate (banxico.org.mx, FIX) | yearly |
| ☐ | `remitSendExample` **new** | $200 | an example amount sent; teaching number | rarely |
| ☐ | `remitFeeExampleA` **new** | $5 | an example flat fee for a service that charges one; real fees vary and can be $0 (compare at qqed.profeco.gob.mx) | yearly |
| ☐ | `remitMarkupExampleA` **new** | 3% | an example markup hidden in the exchange rate; real markups vary by service, amount and day | yearly |
| ☐ | `remitFeeExampleB` **new** | $0 | an example of a service advertising no fee; teaching number | yearly |
| ☐ | `remitMarkupExampleB` **new** | 5% | an example bigger markup hidden in the exchange rate; teaching number | yearly |
| ☐ | `remitCancelMinutes` **new** | 30 | consumerfinance.gov — the Remittance Rule: a sender can usually cancel within 30 minutes of paying, if the money hasn't been picked up or deposited | rarely (set by law) |
| ☐ | `fbarThreshold` **new** | $10,000 | fincen.gov — people in the US must report foreign accounts if together they top this at any time in the year (FBAR) | rarely (set by law) |
| ☐ | `f1WorkHours` **new** | 20 | studyinthestates.dhs.gov — an F-1 student can usually work on campus up to this many hours a week while classes are in session | rarely (set by law) |
| ☐ | `sampleUsdMxn` | 18.5 | banxico.org.mx FIX rate — keep near reality even as a sample | monthly |
| ☐ | `startCashUS` | $10,000 | product choice | — |
| ☐ | `startCashMX` | $200,000 MXN | product choice | — |
| ☐ | `pprDeductionCap` | $213,973 MXN | pprDeductionUmas × umaAnnual (computed) | with umaAnnual |

## 2. Worked examples: 10

Calculations in lessons done with a fact's current value. The content check re-does each one from facts.js, so if a fact changes, `npm test` names the lesson to rewrite. Nothing to check by hand unless a fact changes.

- Debt & credit 1, step 5: $1,000 at the card rate is about $200 (Mexico: $10,000 at the CAT, about $4,000)
- Compound interest 1, step 5: grows at the example rate (indexExampleRate)
- Retirement 1, step 5: grows at the example rate (indexExampleRate)
- Compound interest 2, step 4: $50 a month from age 16, 26 and 36 to 60 is about $176,000, $83,000 and $37,000 (Mexico: $750 → $2,644,000, $1,251,000, $558,000)
- Compound interest 2, first card: starting at 16 beats twice as much from 26 (to age 60)
- Retirement 2, step 5: the match on 6% of $30,000 is $900
- Taxes 1, step 4: a $20 shirt plus sales tax is $21.50
- Taxes 1, step 4 (Mexico): the IVA in a $232 price tag is $32
- The idea "What taxes are for": a tax included in the price is about $13.79 of $100 (Mexico: $160 of $1,160), at 16%
- Mission "Find the sales tax on a receipt": IVA is about 14% of a price that includes it

## 3. Statements in lessons that the advisor confirmed (recheck yearly)

From `docs/CONTENT-REVIEW.md` (Phase 2 and Phase 3 lists, confirmed 2026-10-26):

- ☐ **Mexico: IMSS worker share** is roughly 2–3% of salary, depending on the salary band (the paycheck tool's 2.5% is an example). Source: imss.gob.mx.
- ☐ **Mexico: annual return.** Employees file a declaración anual above `mxSalaryFilingMin`, with two employers at once, or with other income. Source: LISR art. 98, sat.gob.mx.
- ☐ **Mexico: IVA.** 16% generally; 8% in the border regions by a temporary decree (until `ivaBorderEnds`); 0% on most basic food. Source: LIVA, sat.gob.mx, the border decree in the DOF.
- ☐ **Mexico: car insurance.** Civil liability is required on federal highways, and several states require it everywhere. Source: Ley de Caminos, Puentes y Autotransporte Federal; state laws.
- ☐ **Mexico: students** at public high schools and universities can have IMSS coverage (seguro facultativo). Source: imss.gob.mx.
- ☐ **Mexico: RESICO** is a simplified regime with low rates; business clients withhold part of the tax. Source: LISR arts. 113-E to 113-J.
- ☐ **Mexico: aguinaldo,** at least `aguinaldoDays` days of salary, by December 20. Source: LFT art. 87 (watch for the 30-day proposals).
- ☐ **US: sales tax** varies by place; a few states have none. Source: taxfoundation.org.
- ☐ **US: health coverage** on a parent's plan until `parentHealthPlanAge`. Source: healthcare.gov.
- ☐ **US: car insurance** is required in almost every state (New Hampshire is the main exception). Source: state DMVs, iii.org.
- ☐ **US: forms.** The W-2 arrives by the end of January; some states require work permits for minors; the ITIN is for people who must pay US taxes but can't get an SSN. Source: irs.gov, dol.gov/youthrules.
- ☐ **Crypto** isn't legal tender in Mexico, Banxico has warned about it, and neither IPAB nor FDIC covers it. Source: banxico.org.mx, ipab.org.mx, fdic.gov.
- ☐ **Behavioral findings:** losses feel about twice as strong as equal gains (Kahneman and Tversky, 1979); missing a few of the market's best days greatly lowers long-run returns. Sources: the original paper; J.P. Morgan's "Guide to Retirement" best-days chart.
- ☐ **Index returns:** roughly 10% a year before inflation, about 7% after, over long periods (`marketAvgNominal`, `marketAvgReal`). Source: S&P 500 long-run data (for example, NYU Stern's historical returns table).
- ☐ **Active vs. index funds:** most actively managed funds trail their index over 10+ years, attributed to S&P's SPIVA reports. Source: spglobal.com/spdji (SPIVA scorecards).
- ☐ **Card rates:** "often over `cardAprTypical`" (US) and "CAT often over `catTypical`" (Mexico) are deliberately low. Sources: Federal Reserve G.19; Banxico's card indicators.
- ☐ **US: free credit reports** at AnnualCreditReport.com (now weekly). **Mexico:** a free Reporte de Crédito Especial every `buroFreeReportMonths` months at burodecredito.com.mx.
- ☐ **Mexico: finding your AFORE** with your CURP in AforeMóvil or at e-sar.com.mx.
- ☐ **Card statements:** US statements show how long minimum payments take (CARD Act); Mexican statements show the "pago para no generar intereses". Sources: consumerfinance.gov; Banxico's rules on statements.
- ☐ **Mexico: CONDUSEF's** Buró de Entidades Financieras compares institutions on complaints, fines and fees. Source: condusef.gob.mx.
- ☐ **US: colleges** have a net price calculator (required for schools taking federal student aid). Source: studentaid.gov.
- ☐ **Explain this (new).** The prompt tells a scam victim where to report: **reportfraud.ftc.gov** (US) and the bank plus **CONDUSEF** or the **Policía Cibernética** (Mexico). Check each is current and the right place for a young person. It must never say to sign, accept, buy or pay (tested in `scripts/tutor-check.mjs`; run it with `--yes` before launch, it costs a few cents). The privacy policy's "Explain this" paragraph needs the lawyer's check (pasted text can hold other people's data). Photos stay out until a lawyer reviews them.
- ☐ **Your Money Year (new).** A simulation with example numbers: the amounts in `src/modules/year/content.js` and the starting situations in `engine.js` are teaching numbers, not data; card interest, the savings rate and the aguinaldo come from `cardAprTypical`, `catTypical`, `savingsExampleRate`, `cetesExampleRate` and `aguinaldoDays`. The market path is made up (a spring dip, then recovery). Check that the text claims nothing a real person could take as a forecast, that Mexico's year-end reads as the aguinaldo and the US one as a bonus, and that "a refund / saldo a favor" in month 3 matches how the tax lessons describe it.
- ☐ **Certificates (new).** The five tracks and their names (`src/modules/certs/tracks.js`) and the wording on the certificate and the public page: it says it marks finishing lessons in the app and is not a school credit or a professional qualification. Check that wording with the lawyer, along with the privacy policy's "Certificates" paragraph (a name kept for adults who choose it; none for anyone under 18 or with no age; a public page that shows track, date and that name). Check that `/verify` and `/verificar` show nothing else.
- ☐ **Money across borders (new).** The unit "Money across borders" and its tool state the following. Check each against its source, and that the example numbers (`remit*` facts) are plain teaching numbers, never a real company's rates.
  - ☐ The US **Remittance Rule** requires the exchange rate, fees and amount received to be shown before you pay, and a sender can usually cancel within `remitCancelMinutes` minutes. Source: consumerfinance.gov.
  - ☐ **Profeco's** official comparison of money-sending services exists and works at **qqed.profeco.gob.mx** (the app names no companies and links no rankings). Confirm the address still works, in both languages' text.
  - ☐ **FBAR:** people in the US report foreign accounts that total more than `fbarThreshold` at any time in the year. Source: fincen.gov.
  - ☐ **F-1 students** can usually work on campus up to `f1WorkHours` hours a week during classes. Source: studyinthestates.dhs.gov.
  - ☐ **Credit files are separate** in the US and Mexico (US history doesn't transfer to Buró de Crédito, or the reverse), and **some US lenders accept an ITIN** instead of an SSN. Source: consumerfinance.gov, burodecredito.com.mx; a lender's own rules.
  - ☐ **Card terminals abroad:** choosing the local currency usually gives a better rate than letting the merchant convert (dynamic currency conversion). Source: consumerfinance.gov.
  - ☐ **FDIC** covers only US banks; **IPAB** covers only Mexican banks. Source: fdic.gov, ipab.org.mx.
  - ☐ A US debit card often adds a **foreign ATM fee and a currency fee** abroad; the lessons give no number.
- ☐ **US: Social Security card:** keep it safe at home, not in your wallet. Source: ssa.gov.
- ☐ **Retirement (Mexico):** employer, worker and government contribute to the AFORE for IMSS workers (ISSSTE and independent workers differ); the PPR deduction rule (`pprDeductionPct`, `pprDeductionUmas`, `pprAge`, not in RESICO). Source: LSS, LISR art. 151 fracc. V, consar.gob.mx.
- ☐ **Retirement (US):** a custodial Roth IRA for teens with earned income, up to what they earned or `iraLimit`; managed by an adult until 18 or 21 depending on the state. Source: irs.gov Publication 590-A.

## 4. Myth or fact? 66 daily statements **new** (Milestone 4.5)

Added after the advisor's review, so none has been checked by a person yet. Each answer and its reason should be confirmed.

| ✓ | Statement | Answer | Why (as the app says it) | Only |
|---|---|---|---|---|
| ☐ | Checking your own credit score lowers it. | myth | Checking your own score is a “soft” check and doesn't change it. Applying for new credit can lower it a little. | both |
| ☐ | You need a lot of money to start investing. | myth | Many funds let you start with a few dollars, and what matters most is starting early. | both |
| ☐ | A budget means you can't have any fun. | myth | A budget plans for fun on purpose. Wants get their own line, so you can enjoy them without guilt. | both |
| ☐ | Paying the minimum on a credit card keeps you out of trouble. | myth | Interest keeps adding up on the rest. Minimum payments can stretch a balance out for years. | both |
| ☐ | Carrying a credit card balance helps your credit score. | myth | Paying the full balance on time builds the same history and costs nothing. Carrying a balance only adds interest. | both |
| ☐ | An emergency fund should be easy to reach quickly. | fact | Emergencies don't wait. Keep it somewhere safe that you can get to in a day or two, not in stocks. | both |
| ☐ | Prices tend to rise over time. | fact | That's inflation. Central banks aim for a small, steady amount each year. | both |
| ☐ | Money in a savings account can lose buying power. | fact | If it earns less than inflation, the same money buys a little less each year. | both |
| ☐ | A raise can lower your take-home pay by putting you in a higher tax bracket. | myth | Only the part above the line is taxed at the higher rate. A raise always leaves you with more. | both |
| ☐ | Stock prices only go up over time. | myth | Over long periods the market has tended to rise, but it falls along the way, sometimes a lot. Nothing is guaranteed. | both |
| ☐ | An index fund spreads your money across many companies. | fact | One purchase can own hundreds of companies, so one bad one barely moves it. | both |
| ☐ | A 1% yearly fee is too small to matter. | myth | It comes out every year, so over decades it can take a large share of your growth. | both |
| ☐ | Insurance makes the most sense for big, rare costs. | fact | Small costs are cheaper to cover from savings. Insurance is for the ones that could set you back for years. | both |
| ☐ | If an investment guarantees high returns, it's a good deal. | myth | Real investments can't promise high returns. A guarantee like that is one of the clearest scam signs. | both |
| ☐ | Your real bank will never ask for your password by text message. | fact | If a text asks for it, it's not your bank. Open the bank's own app instead. | both |
| ☐ | Crypto on an exchange is protected like money in a bank. | myth | It isn't covered by FDIC deposit insurance. If an exchange fails, the money may be gone. | both |
| ☐ | Paying on time is the biggest part of a good credit history. | fact | Late payments hurt more than almost anything else, and they stay on your record for years. | both |
| ☐ | Using a debit card builds your credit history. | myth | Debit spends your own money, so there's no borrowing to report. Credit history comes from loans and credit cards. | both |
| ☐ | You can start saving for retirement as a teenager. | fact | With money from a job, a teen can have a custodial Roth IRA, opened with a parent or guardian. | both |
| ☐ | At about 7% a year, money roughly doubles every 10 years. | fact | The Rule of 72: 72 ÷ 7 is about 10. That's why starting ten years earlier can about double the result. | both |
| ☐ | Buy now, pay later can never cost you extra. | myth | Miss a payment and there can be late fees, and some plans charge interest. It's still a loan. | both |
| ☐ | A store credit card offered at checkout is a loan. | fact | Store cards often have high rates. The discount today can cost more than it saves if you carry a balance. | both |
| ☐ | Your net pay is smaller than your gross pay. | fact | Taxes and other deductions come out first. Budget from net pay, the money that actually arrives. | both |
| ☐ | A tax refund is a bonus from the government. | myth | It's your own money: tax that was withheld beyond what you owed, coming back. | both |
| ☐ | Renters insurance can cover your own things, even though you don't own the home. | fact | The landlord's insurance covers the building, not your laptop or your bike. | both |
| ☐ | Car liability insurance pays for damage you cause to other people. | fact | It covers the other person's car and injuries, not your own car. That needs other coverage. | both |
| ☐ | Your emergency fund belongs in stocks, so it grows faster. | myth | Stocks can be down right when the emergency happens. This money's job is to be there, not to grow. | both |
| ☐ | Diversifying removes all risk. | myth | It lowers the risk of one company or industry sinking you, but whole markets can still fall. | both |
| ☐ | After a 50% loss, you need a 100% gain to get back to even. | fact | $100 falls to $50. Only doubling brings it back to $100. | both |
| ☐ | Most people who join pyramid schemes lose money. | fact | The money comes from new recruits, and recruits run out. Only the few at the top come out ahead. | both |
| ☐ | A message with a company's real logo is safe to trust. | myth | Logos are easy to copy. Go to the company's app or website yourself instead of using the message's link. | both |
| ☐ | Two-step verification makes accounts much harder to steal. | fact | A stolen password isn't enough on its own. Turn it on for your email first: it protects everything else. | both |
| ☐ | Sharing a login code with a friend is fine if they ask nicely. | myth | Their account may be hacked, and that code is the key to yours. Nobody legitimate needs it. | both |
| ☐ | Credit card interest rates are usually much higher than savings rates. | fact | A typical card charges around 20% a year, many times what savings earn. Paying off a card usually beats saving. | both |
| ☐ | Simple and compound interest grow money at the same speed. | myth | Compound interest also earns on past interest, so it pulls ahead more every year. | both |
| ☐ | Small daily purchases can add up to more than one big purchase. | fact | $3 every weekday is about $780 a year. Multiplying by 52 shows a small cost's real size. | both |
| ☐ | Saving a small amount every week is pointless. | myth | $10 a week is $520 a year, and the habit is what makes bigger saving easy later. | both |
| ☐ | Most professional fund managers beat the market over long periods. | myth | Over long periods, most trail a simple index fund, often because of their higher fees. | both |
| ☐ | An investment that did well last year will do well next year. | myth | Past results don't predict the future. Last year's winner is often an average performer next year. | both |
| ☐ | A single company's stock can fall to zero. | fact | Companies can fail. That's why one company should be a small slice of what you invest, if any. | both |
| ☐ | Owning one share means you own a small part of a company. | fact | Shareholders own the company together and share in its profits, sometimes as dividends. | both |
| ☐ | By the time you read big market news, prices have usually already moved. | fact | Professionals react in seconds. News is better for learning than for trading. | both |
| ☐ | Investing with borrowed money can make you lose more than you put in. | fact | Losses grow along with gains, and the loan still has to be paid back. | both |
| ☐ | If you're paid in cash, you don't owe taxes on it. | myth | Income is income, however it's paid. Freelancers have to set money aside and report it themselves. | both |
| ☐ | Freelancers have taxes taken out of their pay automatically. | myth | Usually nobody withholds for them, so they set a share aside for taxes themselves. | both |
| ☐ | Checking accounts usually pay more interest than savings accounts. | myth | It's the other way around. Everyday accounts usually pay little or nothing; savings accounts pay more. | both |
| ☐ | Most bank fees can be avoided. | fact | No-fee accounts, your own bank's ATMs and watching your balance avoid most of them. | both |
| ☐ | The APR shows the yearly cost of borrowing. | fact | It lets you compare loans and cards fairly before you sign. | both |
| ☐ | A higher deductible usually means a lower monthly premium. | fact | You agree to pay more yourself if something happens, so the insurer charges less each month. | both |
| ☐ | You only need insurance if you expect something to go wrong. | myth | Nobody expects the accident. Insurance is for the big costs you can't predict or afford. | both |
| ☐ | An employer's 401(k) match is extra money on top of your pay. | fact | Putting in enough to get all of it is usually the first goal. | both |
| ☐ | Social Security and Medicare come out of most paychecks. | fact | They're a share of your pay that funds benefits later in life, and your employer adds more on top. | both |
| ☐ | In most US states, the price on the tag includes sales tax. | myth | It's usually added at the register, and rates vary by state and city. | US |
| ☐ | In Mexico, the price on the tag usually already includes IVA. | fact | What you see is what you pay. Your receipt shows how much of it was IVA. | MX |
| ☐ | Buying CETES means lending money to the Mexican government. | fact | You get it back with interest at the end of the term. That's why they're considered very safe. | MX |
| ☐ | Money in a US bank is insured up to $250,000 per person, per bank. | fact | That's FDIC insurance. If the bank fails, insured deposits are paid back. | US |
| ☐ | IPAB protects bank deposits up to 400,000 UDIs per person, per bank. | fact | If a bank fails, protected deposits are paid back up to that limit. | MX |
| ☐ | Being in Buró de Crédito is always bad. | myth | Everyone with credit is in it. What matters is whether you pay on time. | MX |
| ☐ | Your AFORE holds money for your retirement. | fact | Part of your pay, plus your employer's and the government's share, goes into it while you work formally. | MX |
| ☐ | A teen with a job can have a Roth IRA, with an adult's help. | fact | It's a custodial account: a parent or guardian manages it until you're an adult. | US |
| ☐ | When the central bank raises rates, loans usually get more expensive. | fact | Higher rates cool borrowing and spending, which slows inflation. Savings usually pay more too. | both |
| ☐ | A scam can't reach you through a friend's account. | myth | Hacked accounts are a favorite way in, because you trust the name. Check with your friend another way. | both |
| ☐ | Feeling bored or stressed makes impulse buys more likely. | fact | A pause helps: wait a day on anything you didn't plan. | both |
| ☐ | “Only 3 left!” messages are mainly there to rush you. | fact | Scarcity is a pressure trick. Naming it takes away most of its power. | both |
| ☐ | Losing money feels about as bad as winning the same amount feels good. | myth | Losses feel about twice as strong. That's why it helps to decide what you'll do before a drop. | both |
| ☐ | Selling more always means earning more. | myth | Only if each sale still leaves a profit after costs. Cheap prices can mean more work for less. | both |

## 5. Other content added since the advisor's review **new**

- ☐ **The six new kinds of question** (Milestone 4.5, one or more in every lesson: put in order, estimate, match, work it out, spot the problem, real-life choice). Their numbers are teaching examples, and their answers are checked by the content check and played in `test/lessons.test.mjs`; the statements in them follow the lessons above. Worth one read-through by the advisor.
- ☐ **"The real cost" (Practice):** everyday choices (a coffee, a snack, a ride, at example prices) and hidden costs (card interest at a fixed payment, a monthly fee, forgotten subscriptions). Example amounts, not facts.
- ☐ **"Your money week" (Today, Sundays):** shows the learner's own goal numbers only.
- ☐ **Spanish wording** shortened in six places so every lesson fits 4.5 minutes in Spanish too (RC1). Same meaning; the advisor may want to read them: Budgeting 2, Banking 1 (two), Retirement 1 and 3, Taxes 4, Scams 4.

## 6. The app's own rules (match them to the privacy policy and terms)

| ✓ | Rule | Now | Where it lives |
|---|---|---|---|
| ☐ | Who can use it | 13 and up; 13–17 need a parent's or guardian's OK for an account; no age counts as 13–17 | `server/index.js` (sign-up), Onboarding, `docs/legal/terms.*.md` |
| ☐ | 18+ only | checking your credit report; finding your AFORE; share cards with a goal's name or amounts | `src/modules/missions/catalog.js`, `src/core/share.jsx` |
| ☐ | Backups | daily, kept 14 days; what a restore replaces, also 14 days | `server/store.js` |
| ☐ | Feedback | kept up to 2 years | `server/insights.js`, privacy policy |
| ☐ | Archived classes | deleted after 90 days (classroom mode is off for real users) | `server/classes.js` |
| ☐ | Waitlist | deleted within 30 days after the beta | `server/waitlist.js`, privacy policy |
| ☐ | AI spending | a monthly budget (`AI_MONTHLY_BUDGET_USD`, 25 in .env.example); per account `TUTOR_DAILY_LIMIT` 30 a day, `EXPLAIN_DAILY_LIMIT` 8 a day and `TUTOR_PER_MINUTE` 5 a minute | `server/ai.js`, `.env` |
| ☐ | League | at most 500 XP a day counts; 13–17 and 18+ in separate leagues | `server/index.js`, `server/store.js` |
| ☐ | Sign-in limits | 5 failed sign-ins per email and 20 per address in 15 minutes; 120 sign-ups per address | `server/index.js` |
| ☐ | Reminders | opt-in, at most one a day, not 9 pm–8 am unless quiet hours are off | `server/push.js` |
| ☐ | Streak freezes | at most 2; one free repair a month | `src/core/progress.js` |
| ☐ | A lesson left partway | picks up at the same step for a week | `src/modules/lessons/index.jsx` |

## 7. Legal, names and contact (yours and the lawyer's)

- ☐ **Your name or company, contact email and postal address** in `docs/legal/privacy.*.md` and `terms.*.md` (now **[your name / company, address, email]**), and `CONTACT_EMAIL` in .env.
- ☐ **`MAIL_POSTAL_ADDRESS`** before any email goes out.
- ☐ **The lawyer's list** in `the private compliance notes` ("Still open", items 1–10), including the names "Northvale Learn" and **"Real-life missions" / "Misiones de la vida real"** **new**.
- ☐ **The name and logo:** the clearance search and filing in `docs/BRAND-CHECK.md`.
- ☐ **Every outside link** in lessons and missions opens the official page (last checked: see `docs/RC1-RESULTS.md`).
