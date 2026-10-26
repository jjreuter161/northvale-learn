# Content review (2026-10-24)

**What was reviewed:**
- all 27 lessons (135 steps) in English and Spanish, with the Mexico versions;
- the 35-term glossary;
- the goal simulator's math.

The math is covered by `npm test`: monthly-needed vs. months-to-goal agree, debt payoff, start-early, and retirement.

**Recommended before launch:** a person with a finance-education background reads it once in each language. Ideally that's one US reviewer and one Mexican reviewer. This review was done by an AI.

## Fixed

| Where | Problem | Change |
|---|---|---|
| Compound interest 2, card | "Starting at 16 beats twice as much from 26" is only true at higher returns (true at 7%, false at 5%). | Now says "at about {@indexExampleRate} a year" and "twice as much each month". |
| Retirement 1, true/false | "Small in your 20s beats big in your 40s" stated as always true. | Now "can beat… though it depends on the amounts". |
| Retirement 2, card "Never skip the match" | Read as an instruction. | Now "Why the match matters", which explains rather than instructs. |
| Glossary "inflation" | Said the Fed targets CPI inflation (it targets PCE). | Corrected. |
| Retirement tool note | Said amounts were in "today's money" (they aren't inflation-adjusted). | Now says plainly that they aren't adjusted for inflation. |
| Needs vs. wants (Spanish) | "camión" means truck outside Mexico. | Now "transporte público". |
| Onboarding (Spanish) | "dinero de mentiras" sounded childish. | Now "dinero ficticio". |
| Every changeable number | Scattered through the text. | Moved to `src/core/facts.js` (see FACTS.md). |

## Could read as personal financial advice

All of these are general rules of thumb that financial-education programs commonly teach. None names a product or tells a specific person what to do with their money. Each is listed with what was decided:

| Where | Wording | Decision |
|---|---|---|
| Debt & credit 2 | "What's the best way to use a credit card? → Pay the full balance each month" | Keep. This is standard consumer education. |
| Stocks 3 | "Only invest money you won't need for several years" | Keep. It's a widely taught principle; the lesson explains why. |
| Risk 3 | "Many people keep single stocks to 5–10%" | Keep. It's framed as what many people do. The practice action caps the buy at 10% of the pretend portfolio. |
| ETFs 2 | "Two funds hold the same companies — usually pick the lower fee" | Keep. It's about fees in general, not a specific fund. |
| Saving 2 | "Aim for a small cushion like {$500\|8000}" | Keep. It's an example amount. |
| Practice portfolio | Names real funds and companies (VOO, Apple, CETES…) | Keep, labeled "Well-known examples to practice with — not recommendations". Nothing in the app ranks or highlights one. |
| AI tutor | Could be asked "what should I buy?" | Its instructions forbid picks and predictions. `scripts/tutor-check.mjs` tests this against the real AI. |

## Worth a second look by a human

- **Spanish register.** It uses informal Mexican "tú" throughout. Terms used: "domingo" for allowance, "gastos hormiga" for small leaks, "totalero" for someone who pays the full card balance. They suit Mexico; Spanish speakers in the US may find a few terms regional.
- **US retirement lesson.** It mentions a custodial Roth IRA for teens with earned income: up to what they earned or `{@iraLimit}`, whichever is lower, managed by a parent or guardian until 18 or 21 depending on the state. (Corrected 2026-10-25 after a fact check.)
- **Mexico retirement lesson.**
  - It says "your employer, you and the government" contribute to the AFORE. That's true for IMSS workers; ISSSTE and independent workers differ.
  - The PPR deduction now states the actual rule (corrected 2026-10-25 after a fact check):
    - up to 10% of yearly income, capped at 5 annual UMAs;
    - one limit shared with long-term voluntary AFORE contributions (short-term ones don't count);
    - withdrawing before 65 without a disability makes it taxable income;
    - not available in RESICO;
    - voluntary contributions can be made through Afore Móvil or Afore Web.
- **Active vs. index funds.** Attributed to S&P's SPIVA reports ("according to…"), since some researchers argue SPIVA's count-based method makes active funds look worse.
- **Credit lesson.** "Cards often charge over 20%" (US) and "CAT often over 40%" (Mexico) are deliberately conservative lower bounds.

## Milestone 4, Phase 2: eight new units (2026-10-25)

Banking, Your first paycheck, Scams and fraud, Taxes, Insurance, The psychology of money, Crypto and risky investments, and Earning more were added: 32 lessons and 32 concepts. All of it was reviewed for factual errors and for anything that reads as personal advice.

**Choices made to avoid advice.**
- Crypto, leverage and other risky bets are described, never recommended. The crypto unit names no coin except Bitcoin as a fact (the largest, and it has fallen by half several times).
- "Many people keep risky bets to a small amount they could lose" is framed as what people do, not what the reader should do. The same goes for "many freelancers set aside a share for taxes."
- Insurance lessons compare plan types with made-up numbers and say which costs less *in that example*, not which to buy.
- Tax tools use labeled example rates and example brackets ("not real tax rates"). Only rates set by law (Social Security, Medicare, IVA, self-employment tax) come from facts.js.

**Advisor review, 2026-10-26.** Items 1–11 below were checked. Nine were right; two were fixed:
- **IVA border rate:** it is a temporary decree incentive, not permanent law, and only for businesses in the padrón de beneficiarios. The text now says so, and the end date (`ivaBorderEnds`, Dec 31, 2026) is in facts.js.
- **US sales tax example:** now 7.5% (Tax Foundation's 2026 national average is 7.53%).

Added detail: the seguro facultativo is for students at public high schools and universities; RESICO's income cap, rates and the 1.25% withholding are in facts.js; New Hampshire is named as the main state without a car insurance requirement; Social Security applies only up to a yearly earnings limit. Items 12, 14 and 15 were not on the list sent for review and are still open.

**Please verify** (my best understanding; dates and thresholds are in facts.js):
1. **Mexico: IMSS worker share.** The paycheck tool shows an example 2.5% and says "roughly 2–3% depending on salary." The real share varies by salary band.
2. **Mexico: annual return.** Employees must file a declaración anual if they earned more than $400,000 MXN, had two employers at once, or had other income (LISR art. 98). The SAT pre-fills much of it.
3. **Mexico: IVA.** 16% generally, 8% in the northern and southern border regions (by decree), and 0% on most basic food.
4. **Mexico: car insurance.** Civil liability insurance is required on federal highways, and several states require it everywhere.
5. **Mexico: students.** Students can be covered by IMSS (the "seguro facultativo").
6. **Mexico: RESICO.** It's described as "a simplified regime with low rates for small earners." Business clients may withhold part of the tax.
7. **Mexico: aguinaldo.** At least 15 days of salary, paid by December 20 (LFT art. 87).
8. **US: sales tax.** The average combined state and local rate is about 7% (used as an example), and a few states have none.
9. **US: health coverage.** You can usually stay on a parent's health plan until 26.
10. **US: car insurance.** It's required in almost every state.
11. **US: self-employment.** Self-employment tax is 15.3%, and you must file once net self-employment earnings reach $400. Clients may send a 1099.
12. **US: forms and deadlines.** The W-2 is due from employers by the end of January. Some states require work permits for minors. The ITIN is for people without an SSN.
13. **Crypto in Mexico.** It isn't legal tender, Banxico has warned about it, and it isn't covered by IPAB. It isn't covered by FDIC in the US either.
14. **Behavioral findings.** Losses feel about twice as strong as equal gains (Kahneman and Tversky). Missing a few of the market's best days greatly reduces long-run returns, and the best days cluster near the worst.
15. **Index returns.** "Stock index funds have averaged roughly 7–10% a year over long periods" (about 7% after inflation, about 10% before).

## Milestone 4, Phase 3: Money Missions (2026-10-26)

31 missions in `src/modules/missions/catalog.js`, in English and Spanish with Mexico versions. They were reviewed for advice, safety for 13–17, and anything that asks people to share data.

**Choices made.**
- **No data handed over.** Missions that touch a bank, a card or a fund say "just reading — don't apply" and point to public pages. None asks for amounts back; the note is optional and private.
- **18+ only.** Checking your credit report, and finding your AFORE (Mexico). An unknown age counts as 13–17.
- **Versions for 13–17.** Reading a pay stub with a parent (who can cover the amounts), help from a parent with two-step verification, and talking with a parent before taking on any work.
- **No product named as a choice.** "A well-known index fund", "a big bank and an online bank".

**Please verify:**
1. **US: free credit reports.** AnnualCreditReport.com is the official free site, and reports are free (now weekly).
2. **Mexico: Buró de Crédito.** You can get a free Reporte de Crédito Especial every 12 months at burodecredito.com.mx.
3. **Mexico: finding your AFORE.** You can locate it with your CURP in the AforeMóvil app or at e-sar.com.mx.
4. **Mexico: IVA on a receipt.** At 16%, the IVA is about 14% of a price that already includes it (16 ÷ 116 ≈ 13.8%).
5. **Card statements.** US statements show how long paying only the minimum would take (CARD Act). Mexican statements show the "pago para no generar intereses".
6. **Mexico: CONDUSEF.** The Buró de Entidades Financieras compares bank fees.
7. **US: colleges.** College websites have a net price calculator (required for schools that take federal student aid).
8. **US: Social Security card.** Keep it somewhere safe at home, not in your wallet (SSA guidance).
