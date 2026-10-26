# Numbers that change over time

All of these are in **`src/core/facts.js`**. Text facts (like a filing deadline) have English and Spanish values. Change a value there and every lesson, glossary entry and simulator that uses it updates. In text they appear as `{@name}`, so you can search for that to see each place.

| Fact | Now | Where it shows up | Check at | How often |
|---|---|---|---|---|
| `fdicLimit` | $250,000 | Saving 3 · glossary "FDIC" | fdic.gov | yearly |
| `ipabLimitUdis` | 400,000 UDIs | Saving 3 (Mexico) · glossary "IPAB" | ipab.org.mx | yearly |
| `ipabLimitPesosMillions` | "over 3 million pesos" | same | 400,000 × the UDI value at banxico.org.mx | yearly |
| `cardAprTypical` | "over 20%" | Debt & credit 1 | Federal Reserve G.19 | yearly |
| `catTypical` | "over 40%" | Debt & credit 1 (Mexico) | Banxico / CONDUSEF | yearly |
| `fedInflationTarget` | 2% | News 2 · glossary "inflation" | federalreserve.gov | rarely |
| `banxicoInflationTarget` | 3% | News 2 (Mexico) · glossary "inflation", "Banxico" | banxico.org.mx | rarely |
| `cetesMinimum` | $100 MXN | Compound interest 3 (Mexico) · glossary "CETES" | cetesdirecto.com | yearly |
| `cetesExampleRate` | 7% | goal simulator (Mexico savings path) · sample CETES price | Banxico 28-day auction; also set `CETES_RATE` on the server | monthly |
| `savingsExampleRate` | 3.5% | goal simulator (US savings path) | typical high-yield savings | every few months |
| `indexExampleRate` | 7% | goal simulator, retirement and start-early tools, Compound interest 2 | keep as a teaching example | rarely |
| `indexRangeLow` / `indexRangeHigh` | 3% / 10% | "investing range" band | teaching example | rarely |
| `matchExampleUS` | 50% | retirement tool, Retirement 2 | teaching example | rarely |
| `aforeExtraExampleMX` | 30% | retirement tool (Mexico), Retirement 2 | AFORE contribution rates rise yearly through 2030 under the 2020 reform | yearly |
| `retirementAge` | 65 | retirement tool | teaching example | rarely |
| `iraLimit` | $7,500 (2026) | Retirement 3 (US) · concept "Your own retirement account" | irs.gov (2026: Notice 2025-67) | yearly, each November |
| `umaAnnual` | $42,794.64 MXN (2026) | used to compute `pprDeductionCap` | inegi.org.mx (in force from Feb 1, 2026) | yearly, each January |
| `pprDeductionPct` / `pprDeductionUmas` | 10% / 5 annual UMAs | Retirement 3 (Mexico) · glossary "PPR" | LISR art. 151, fracc. V (one shared limit with long-term voluntary AFORE contributions) | rarely (law) |
| `pprDeductionCap` | ≈ $213,973 MXN | Retirement 3 (Mexico) | computed: 5 × `umaAnnual` | with `umaAnnual` |
| `pprAge` | 65 | Retirement 3 (Mexico) · glossary "PPR" | LISR art. 151, fracc. V | rarely (law) |
| `socialSecurityRate` / `medicareRate` | 6.2% / 1.45% | Your first paycheck 2 · paycheck tool · glossary "FICA" | ssa.gov / irs.gov | yearly |
| `selfEmploymentTaxRate` / `selfEmploymentFilingMin` | 15.3% / $400 | Earning more 2 · side-hustle tool · glossary "1099" | irs.gov | yearly |
| `usTaxDeadline` | April 15 | Taxes 3 (US) | irs.gov (moves when it falls on a weekend or holiday) | yearly |
| `federalWithholdingExample` / `stateTaxExample` | 8% / 3% | paycheck tool (US), labeled examples | teaching examples | rarely |
| `salesTaxExample` | 7.5% | sales-tax tool (US) · receipt mission (US) | taxfoundation.org (2026 population-weighted average combined rate: 7.53%) | yearly |
| `parentHealthPlanAge` | 26 | Insurance 3 (US) | healthcare.gov | rarely (law) |
| `ivaRate` | 16% | Taxes 1 (Mexico) · sales-tax tool · glossary "IVA" · receipt mission (Mexico) | sat.gob.mx | rarely (law) |
| `ivaBorderRate` / `ivaBorderEnds` | 8% / December 31, 2026 | sales-tax tool (Mexico) · glossary "IVA" | the border-region decree: a **temporary** incentive for businesses in the padrón de beneficiarios, extended for 2026 by the decree of Dec 31, 2025 | **each December**: if it isn't renewed, remove the border rate from the text |
| `isrWithholdingExample` / `imssWorkerExample` | 8% / 2.5% | paycheck tool (Mexico), labeled examples | teaching examples; IMSS worker share is roughly 2–3% | yearly |
| `aguinaldoDays` | 15 days | paycheck tool (Mexico) | Ley Federal del Trabajo art. 87 (proposals for 30 days had not passed as of Oct 2026) | yearly (watch for the reform) |
| `resicoIncomeCap` / `resicoRateLow` / `resicoRateHigh` / `resicoWithholding` | $3,500,000 MXN / 1% / 2.5% / 1.25% | Earning more 2 (Mexico) · side-hustle tool · glossary "RESICO" | LISR arts. 113-E and 113-J | yearly |
| `mxTaxDeadline` | April 30 | Taxes 3 (Mexico) | sat.gob.mx | yearly |
| `mxSalaryFilingMin` | $400,000 MXN | Taxes 3 (Mexico) | LISR art. 98 | rarely (law) |
| `sampleUsdMxn` | 18.5 | sample prices only (when no market data key) | Banxico FIX rate | monthly |
| `startCashUS` / `startCashMX` | $10,000 / $200,000 MXN | practice portfolio, onboarding | product choice | — |

## Not in facts.js on purpose

- **Rules and definitions that don't drift.** 50/30/20, a bear market = −20%, the Rule of 72, FICO's 300–850 range, Roth withdrawal rules (age 59½, 5-year rule), form names (W-4, W-2, 1040, 1099, CFDI), a custodial account passing to the child at 18 or 21 depending on the state. If any of these changes, it's a content edit.
- **Product rules.** XP amounts, streak freezes and daily goals live in `src/core/progress.js`. AI prices and limits live in `server/ai.js` and `.env`.
- **Live data.** Real prices come from Twelve Data when `TWELVEDATA_API_KEY` is set, and the CETES rate comes from `CETES_RATE`.
