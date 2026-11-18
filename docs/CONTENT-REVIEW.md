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

**Advisor's review (2026-10-26).** All 8, plus the three left over from Phase 2 (W-2 timing and work permits, behavioral findings, index returns), were confirmed correct. Wording changed:
- **Index returns** (Scams 2): now "roughly 10% a year before inflation, or about 7% after inflation, over long periods." Both are in facts.js (`marketAvgNominal`, `marketAvgReal`). The retirement tool's note was also fixed: its example 7% is the after-inflation figure, so its amounts are roughly in today's money (it used to say the opposite).
- **CONDUSEF** (bank fees mission): the Buró de Entidades Financieras is described as comparing financial institutions on complaints, fines and fees.
- **ITIN** (Taxes): "for people who need to pay US taxes but can't get a Social Security number."

## Business sample lesson (draft, not shipped)

**Please verify** before "Money in, money out" (`docs/samples/`) goes into the app:
- **Amazon (checked 2026-11-18).** Amazon's own Form 10-K for 2002 shows a net loss in every year from 1998 to 2002 ($124.5 million, $720.0 million, $1,411.3 million, $567.3 million, $149.1 million), and its press release of 27 January 2004 reports net income of $35 million for 2003 against a net loss of $149 million in 2002. The lesson now says only that: "Amazon lost money every year from 1998 to 2002, then made $35 million in 2003." I dropped "reinvested to grow", because the filings I read don't say that for those years (the 2003 release mentions lower prices and investing in new businesses). The 10-K pages after the first 100,000 characters weren't read, so earlier years (1995 to 1997) are not claimed.
- Rosa, Luis and their numbers are made up and labeled as examples.

## Wave 1, unit 32: Sending and receiving money (draft, not in the app)

Read copy: `docs/reviews/draft/sending.md` (rebuild with `node scripts/render-unit.mjs sending`). The unit file is `src/modules/lessons/units/sending.js` and carries `draft: true`, so it is checked by the tests but never reaches learners until it has a `reviewed` sign-off.

**Read on 2026-11-17 and matches the lessons:**
- **CFPB** (consumerfinance.gov, "What is a remittance transfer?"): providers give fees and taxes, the exchange rate, fees charged abroad, and the amount to be delivered; after paying, a sender has up to 30 minutes to cancel at no charge unless the money was already picked up or deposited.
- **Profeco** (qqed.profeco.gob.mx): "Quién es Quién en el Envío de Dinero" compares fees, rate, delivery time and pesos received for transfers from the US to Mexico.
- **31 CFR 1010.410(e)**: recordkeeping for transmittals "in the amount of $3,000 or more" (read on law.cornell.edu, not the official eCFR).

**Please verify (not checked against a source this session):**
1. **Lesson 2, first card.** "Before you pay, a service in the US must show you the exchange rate, the fees and the amount that will arrive." The CFPB page says providers disclose "before and after you pay" but doesn't say which items come before. I believe all three are in the pre-payment disclosure under Regulation E subpart B; confirm against the rule.
2. **Lesson 4.** That a pickup usually needs an official photo ID and a name that matches; that the sender usually pays the fees and a pickup place may add its own; that a CLABE is the 18-digit account number used for deposits in Mexico. All from general knowledge. Mexico's side (what pickup places and banks ask for) was not looked up.
3. **Lesson 5, second card.** "Services set their own limits," and "splitting a transfer to avoid questions can look suspicious and sometimes breaks the law." The second is meant to point at structuring rules; a licensed professional should confirm it is accurate and not too broad, and that it reads as teaching, not advice.
4. **Lesson 5, the $3,000.** Confirm on ecfr.gov or fincen.gov, and that Ana's {US$3500} example sits above it for the right reason.
5. **Sources list.** Three sources (the unit needs two). The rule is "one per country where the system differs"; a Mexican regulator source for receiving (CONDUSEF or Banxico) should be added once the Mexico side is checked.
6. **Teens.** Nothing asks anyone to open an account or send money. The action is the practice slider only. The unit's mission (compare two services' amounts received, send nothing) is written in the unit header and added to the catalog when the unit ships.

The example services, Marisol, Rosa, Tomás, Lucía and Ana are made up. No real company is named or ranked.

## Wave 1, unit 33: Banking in two countries (draft, not in the app)

Read copy: `docs/reviews/draft/twobanks.md` (rebuild with `node scripts/render-unit.mjs twobanks`). Unit file: `src/modules/lessons/units/twobanks.js`, `draft: true`.

**Read on 2026-11-17 and matches the lessons:**
- **CFPB checklist** (opening a bank or credit union account): a bank verifies name, birth date, address and an ID number (SSN, ITIN, or passport number and country); many require a government photo ID; some banks and credit unions accept foreign passports and consular IDs such as the matrícula consular; an opening deposit is usually $25–$100; a minimum balance may be needed to avoid or reduce fees. The PDF would not convert cleanly, so I read its text from the raw file; a reviewer should read the PDF itself.
- **CONDUSEF "Paisano…" page (10 Nov 2014):** institutions should treat the matrícula consular as valid ID; a traditional deposit account asks for an official ID (matrícula consular or CURP) and a proof of address no older than three months; it suggests asking whether an institution accepts people living abroad.
- **CONDUSEF "Ahorrar en dólares o en pesos mexicanos" (2023):** banks in Mexico offer dollar accounts with conditions; they are often tied to high fees; traditional banks' conversion rates are often unfavorable; converting back to pesos can shrink your money depending on the rate.

**Please verify (not confirmed against a source):**
1. **The Mexico papers are from a 2014 page.** The lessons say banks in Mexico "usually" ask for an official ID and a "recent" proof of address, not "three months", on purpose. Check what banks ask now, including digital accounts, and whether the matrícula consular is still accepted everywhere the page says.
2. **Lesson 3, dollar accounts.** I did not confirm who may open a dollar account in Mexico. Banxico's FAQ (older) says individuals in the border strip may open one, and CONDUSEF lists banks that offer them to individuals. The lesson therefore only says they exist with conditions and fees. I also did not confirm whether IPAB insurance covers dollar-denominated deposits: the IPAB page I read doesn't say, so the lessons make no claim about it.
3. **Lesson 3, pesos in the US.** "Most accounts at US banks hold dollars" is general knowledge. Nothing was looked up about whether a US bank can hold pesos, and the lesson only tells people to ask.
4. **Lesson 2.** "Many accounts waive the fee only above a minimum balance" follows the CFPB checklist. The $10 fee, $500 minimum, and the peso fee are made up and labeled as examples through the story.
5. **Lesson 2, pointer.** It says reporting rules for accounts abroad are in "Money across borders", where the live lesson covers the FBAR. (It first pointed at unit 36, which does not teach the FBAR, so I changed it on 2026-11-18.)
6. **Lesson 5.** "Rules for unused accounts differ by bank and by place" is general and unsourced, so it names no dormancy periods. Add a source if the reviewer wants specifics (US state unclaimed-property rules, Mexican rules on inactive accounts).
7. **Teens.** Nothing asks anyone to open an account; the unit teaches what to ask. The action tools are practice only. Its mission (read one bank's list of what it needs) is written in the unit header and added to the catalog when the unit ships.

Daniel, Paola, Elena, Hugo and Iván are made up. No real bank is named or ranked.

## Wave 1, unit 34: Working across the border (draft, not in the app)

Read copy: `docs/reviews/draft/borderwork.md` (rebuild with `node scripts/render-unit.mjs borderwork`). Unit file: `src/modules/lessons/units/borderwork.js`, `draft: true`. **Needs a licensed professional's read** (immigration, labor law, social security) before it ships.

**Two findings that changed the plan:**
1. **The US–Mexico Social Security agreement does not appear to be in force.** The roadmap's lesson was "Social Security and IMSS: the US–Mexico agreement", as if it let people combine years. Every source I could open (KPMG's treaty tracker and mobility note, two tax-firm guides, a 2018 SSA bulletin table listing the agreement's effective date as pending) says it was signed 29 June 2004 and never took effect. I could not open any SSA page for it (they returned 403), so this rests on secondary sources. The lesson is now "Two pension systems", and it uses a text fact, `usMxSsaAgreementStatus` ("has not taken effect"), so it shows in `docs/VERIFY-BEFORE-LAUNCH.md` and gets checked yearly. **If the agreement is in force, lesson 4 has to be rewritten, not just the fact.** The roadmap's outline line was updated.
2. **Mexico's workweek is changing.** The reform to 40 hours: the constitutional change was published in the DOF in the evening edition of 3 March 2026 (in force 4 March), and the Ley Federal del Trabajo change is reported published and in force on 1 May 2026, with weekly hours of 48 in 2026, 46 in 2027, 44 in 2028, 42 in 2029 and 40 in 2030. That comes from the Cámara de Diputados' own news pages and STPS bulletin 15/2026; the DOF decrees themselves would not open (403). `mxWeekHours` is 48 now and **must change every January**. The lesson says overtime pays double and then triple "past a limit" and gives no hours cap, because the sources disagree on the new limit (a 12-hour weekly cap is mentioned).

**Read on 2026-11-17 and matches the lessons:** USCIS Form I-9 page (every US employer completes it for every hire); USCIS "Find legal services" (who may give legal help; a "notario" is not a US lawyer); STPS bulletin 15/2026 (the phase-in; today's overtime is double for the first 9 hours, then triple).

**Seen only in search summaries, not opened (confirm each source page):**
- **DOL:** time and a half over 40 hours (Fact Sheet #23); overtime can't be waived by agreement; the Wage and Hour Division says it enforces wage laws without regard to immigration status. The newest pages I saw were several years old, so please confirm the current position.
- **IRS:** employers with 50 or more full-time employees, counting full-time equivalents, must offer coverage or may owe a payment.
- **SSA:** 40 credits, at most 4 a year; totalization needs at least six quarters of US coverage.
- **IMSS:** the constancia de semanas cotizadas is free and, online, asks for CURP and NSS; Ley del Seguro Social art. 15 puts registering workers on the employer (a worker can also ask IMSS, art. 18); the five insurances in the lesson are from art. 11.

**Please verify (nothing checked against a source):**
1. **Mexico's side of "who can work."** The unit never says what a foreign national needs to work in Mexico, because I didn't look it up. Lesson 1's Beto is a US citizen in Ciudad Juárez, and the lesson only says each country decides.
2. **"Your Social Security statement"** (lesson 5) from your online SSA account: from general knowledge.
3. **Lesson 3.** That each health system serves people in its own country is a general statement; I made no claim about emergencies or reciprocity.
4. **Lesson 1's scenario** and the immigration-help wording: the whole lesson is a candidate for the immigration professional's read.
5. **Teens.** Nothing asks anyone to apply, open an account or share numbers. The actions are practice tools only. The mission (list the papers you'd keep in one folder) is in the unit header and goes to the catalog when the unit ships.

Camila, Beto, Mateo, Lupe, Sofía, Iker, Rosa and Tomás are made up, as are all their pay figures.

## Wave 1, unit 35: Border scams (draft, not in the app)

Read copy: `docs/reviews/draft/borderscams.md` (rebuild with `node scripts/render-unit.mjs borderscams`). Unit file: `src/modules/lessons/units/borderscams.js`, `draft: true`. It also adds two practice sets to the scam tool, `family` and `official` (in `src/modules/goals/life.jsx`). Those ship with the app code now, but nothing reaches a learner until the unit does. The app's first download grew from 213 KB to 215 KB (budget 220 KB), so there is little room left for more tool sets before the budget needs a look.

**Read on 2026-11-17 and matches the lessons:**
- **FTC "Job scams":** honest employers never ask you to pay to get a job; the fake-check overpayment scam ("the check will bounce, and the bank will want you to repay the amount"); scammers ask for gift cards, wires, payment apps, cash reload cards and crypto; if you paid, contact the company you used right away and report at ReportFraud.ftc.gov.
- **FTC "How to avoid a government impersonator scam":** no agency demands gift cards, wires, crypto or a payment app; the IRS and its collectors won't threaten arrest; hang up and call a number you know.
- **CFPB "Who do I contact for help with a scam":** FBI IC3, FTC, state attorney general, local police. **That page does not say the CFPB takes scam reports itself**, so the lessons don't send people to the CFPB (the roadmap said "FTC and CFPB").
- **Guardia Nacional 088 page:** "llama al 088 Atención Ciudadana" for guidance on filing a cybercrime report; the report is secure and confidential. It says nothing about cost, or about fraud by phone.

**Seen only in search summaries (a reviewer opens them):** FTC's family-emergency alerts (call a number you already have; secrecy and rush; gift cards, wires, cash, crypto; AI-cloned voices); CONDUSEF's SIPRES registry and financial-fraud portal.

**Gaps and things to confirm:**
1. **Mexico is thinner than the US.** Lesson 3's "the same habit works on either side" is general; I found no Mexican source on fake customs or police callers, extortion calls or "virtual kidnapping". A reviewer from Mexico should add what's worth teaching, and confirm what 088 actually takes.
2. **Profeco** (in the roadmap's reporting lesson) is not in the unit. I found nothing confirming its role for scams. Add it if the reviewer confirms.
3. **"Registered" services.** Lesson 2's concept says a real exchange service "is registered", but the unit doesn't teach how to check. CONDUSEF's SIPRES lists casas de cambio, and US money transmitters are licensed by states and registered with FinCEN. Neither was confirmed for money transfer services, so the how-to is left out for the reviewer to supply.
4. **Lesson 2's tf:** "a fake check can look fine at first, and the bank can take the money back later" is consistent with the FTC page but not a direct quote.
5. **Lesson 1.** It says scammers can clone a voice (FTC, seen in a search summary). The scenario's {US$2000} and the "lawyer" are made up. **Tone:** no wit anywhere in this unit, and it names no real company or officer.
6. **Facts to keep current:** `usReportSite` (ReportFraud.ftc.gov) and `mxReportLine` (088) are text facts in the verify list, checked yearly.
7. **Teens.** Nothing asks anyone to pay, open an account or share numbers. The mission (write the family's call-back rule) is in the unit header and goes to the catalog when the unit ships.

All people, amounts and the "Border Customs Office" in the practice set are made up.

## Wave 1, unit 7: Cards and digital payments (draft, not in the app)

Read copy: `docs/reviews/draft/cardpay.md` (rebuild with `node scripts/render-unit.mjs cardpay`; for "Both" units it now shows all four combinations of English or Spanish with US or Mexico text). Unit file: `src/modules/lessons/units/cardpay.js`, `draft: true`. The unit has a US and a Mexico version where the systems differ (payment apps, disputes).

**Read on 2026-11-17 and matches the lessons:**
- **FTC, mobile payment apps:** a balance sits in the app; scammers know it's hard to get the money back; check the recipient before paying; for unauthorized payments or a scammer, contact the app (Venmo, Cash App and PayPal support options listed). It does not say a sent payment is "like cash" or describe refunds for mistaken payments, so the lesson says contact the app or bank "and ask for help" and that a reversal isn't guaranteed.
- **CFPB, "How do I dispute a charge on my credit card bill?":** call first; a written billing error notice within 60 calendar days after the charge appeared on the statement. It does not define a chargeback.
- **Banxico, MI SPEI:** the CLABE has 18 digits; DiMo uses the recipient's 10-digit cell number; CoDi uses a QR code or a notification; statuses "en proceso" and "liquidado". It says nothing about speed, hours or cost, so the lessons don't claim any.
- **CONDUSEF article of 6 Feb 2018 (updated 2021), citing Banxico:** up to 90 natural days from the cut date, or from the charge; an acuse with a folio, date and time; the bank must credit the amount within four days; no ruling in 45 days means the claim stands; go to CONDUSEF for guidance.

**Seen only in search summaries (a reviewer opens them):** Regulation E 1005.6 (liability $50 if reported within two business days, up to $500 after, 60 days from the statement) and Regulation Z 1026.12 ($50 cap on unauthorized credit card use); the CFPB's "chargeback" wording; the CFPB's foreign-transaction-fee pages (usually a percentage; a network's 1% and an issuer's 2% can stack; a card agreement with 3% in the CFPB database); the CFPB advisory that money in a payment app may lack deposit insurance. The lessons use 3% only as an example.

**Please verify (nothing found in a source):**
1. **Lesson 2, chip, tap and wallets.** That a chip makes a one-time code, that some cards skip the PIN for small taps, that phone wallets usually send a substitute number, and that a locked phone wallet is harder to use than a card are all general knowledge. I found no official page to cite. A reviewer should confirm or reword.
2. **Mexico's chip exception.** The CONDUSEF summary notes that the rule releasing you from a charge "does not apply when the issuer proves the charges were authorized in the store using the card's chip". Lesson 5's Mexico text doesn't mention it, so a Mexican learner could think any unrecognized charge is reversed. Add it once confirmed.
3. **How the 90 days count in Mexico** (from the cut date or from the charge) and whether the four-day credit and 45-day ruling still hold. The source is from 2018. Debit and prepaid cards in Mexico are not covered separately.
4. **US debit and prepaid.** Lesson 5 gives the debit two-business-day rule; it does not explain prepaid protections (the CFPB's rule covers registered prepaid accounts), only that "fees vary" in lesson 1.
5. **Lesson 3.** "Scammers may pose as your bank" comes from an FTC alert (seen, not opened). "Many people move it to a bank account" is soft and unsourced. No wit about money apps. Zelle's litigation with the CFPB is not mentioned.
6. **Lesson 4.** "The machine picks the rate, often a worse one" matches the live "Money across borders" lesson but none of the CFPB pages I saw covered it. The $5 ATM fee, the 3% and the amounts are examples.
7. **Product names.** Zelle, Venmo, Cash App, SPEI, DiMo and CoDi appear only to say what kind of thing each is, not as recommendations. The roadmap listed CoDi; I added DiMo because Banxico lists both as current.
8. **Facts to keep current** (all in the verify list): `usCardLiability`, `usDisputeDays`, `usDebitReportDays`, `mxDisputeDays`.
9. **Teens.** Nothing asks anyone to open an account or send money. The mission is in the unit header.

Rosa, Marco, Lía, Marta, Sam, Mateo, Julia and Leo are made up, as are all their amounts.

## Wave 1, unit 15: Credit scores and reports (draft, not in the app)

Read copy: `docs/reviews/draft/creditscores.md` (rebuild with `node scripts/render-unit.mjs creditscores`; it shows the US and Mexico text in both languages). Unit file: `src/modules/lessons/units/creditscores.js`, `draft: true`. It reuses the live facts `ficoRange`, `ficoFactors` and `buroFreeReportMonths`.

**Read on 2026-11-17 and matches the lessons:**
- **FTC, "Disputing errors on your credit reports":** dispute with the bureau and with the business that reported it; the bureau has 30 days to investigate; results come in writing; you can add a statement of the dispute; a free copy if your file changes.
- **CFPB, "How to rebuild your credit":** pay on time, keep balances low (some experts say under 30% of the limit, others under 10%), secured cards (deposit equals the limit; fees and interest can be high), debit, cash and prepaid cards don't show you can repay. It does **not** mention credit-builder loans or authorized-user status, so the lessons leave them out.

**Seen only in search summaries (a reviewer opens them):**
- **FTC:** free weekly reports became permanent (Oct 2023); AnnualCreditReport.com is the only site authorized by law. Federal law's own right is one free report per bureau every 12 months, so confirm the weekly program still runs. `usFreeReportFrequency` is a text fact and is checked yearly.
- **CFPB:** most accurate negative items stay 7 years, bankruptcy 10 (a CFPB rebuilding table lists Chapter 13 at 7; confirm); accurate information can't be removed early.
- **CONDUSEF, "No es una lista negra":** everyone with credit is in the Buró; negative records stay 1, 2, 4 or up to 6 years depending on the debt's size (in UDIs); no one can erase accurate records early; sites that promise to clear a history are fraud.
- **Buró de Crédito:** the Reporte de Crédito Especial is free if it's the first request in 12 months and is delivered by email or picked up; courier or a second request in the year costs an amount set by Banxico. The Buró's own guide page returned 403, so I never opened it.

**Please verify:**
1. **Mexican scores.** Sources disagree on Buró's Mi Score range (CONDUSEF pages say 400 to 850; a newer Buró page lists different bands), and Círculo de Crédito's scale is 300 to 850. The lessons give no Mexican range. Only "estimates the chance of a payment 90 days late within 12 months" comes from a Buró page, seen in a summary.
2. **Mexican disputes.** The lesson says only that you can file an aclaración and that CONDUSEF can guide you. I saw "29 business days" and "two free claims a year" in a summary, with no confirmation, so no number is stated.
3. **Círculo de Crédito's free report.** The lessons say "from each bureau", from the live lesson and the law cited in the `buroFreeReportMonths` fact. Only Buró's page was seen.
4. **General statements with no source:** lenders, landlords and some employers can ask to see a report (employers need your permission); checking your own report doesn't lower a score; a credit report doesn't show income or bank balances. A reviewer should confirm or cite.
5. **Lesson 2.** "Paying on time is the biggest part of most scores" rests on the FICO weights in `ficoFactors`. Mexican scores' weights weren't found.
6. **Teens.** Nothing asks anyone to request a report in the lessons. The mission ("request a free report from the official source, just reading what you get") should be adult-only (18+), since a minor usually has no file; the header says so. Nothing in the unit asks for numbers from the report.
7. **Lesson 5** overlaps with the live "Money across borders" lesson on credit when you move. It adds the comparison of bureaus and rules.
8. **Facts to keep current:** `usNegativeYears`, `usBankruptcyYears`, `usCreditDisputeDays`, `usFreeReportFrequency` and `mxBuroMaxYears`, all in the verify list.

Ben, Ana, Dana, Chris, Marta, Mateo, Sofía and Camila are made up, as are their amounts.

## Wave 1, unit 10: Judging a job offer (draft, not in the app)

Read copy: `docs/reviews/draft/joboffer.md` (rebuild with `node scripts/render-unit.mjs joboffer`; shows the US and Mexico text in both languages). Unit file: `src/modules/lessons/units/joboffer.js`, `draft: true`. It reuses the live fact `aguinaldoDays`. **Needs a Mexican labor-law reader** for lessons 3 and 5.

**Nothing was opened for this unit.** Every source below is a search summary of the page, not the page. A reviewer opens each and checks the lesson against it.

- **PROFEDET (rights and vacation pages):** aguinaldo of at least 15 days of salary, paid before 20 December (LFT art. 87, as reformed 16 Dec 2024); vacations of 12 working days after the first year, rising 2 a year to 20 in year five (art. 76, reform of 27 Dec 2022); vacation can't be paid out in cash (art. 79); a prima vacacional of at least 25% of the vacation pay (art. 80). A search result also showed a Chamber of Deputies PDF mentioning "12 days" with increases up to 24 under another article, which I did not resolve.
- **SAT, Reparto de utilidades 2026:** deadlines 30 May (companies) and 29 June (individuals); cap of three months' pay or the average of the last three years' PTU, whichever is better for the worker; one year to claim. The lessons only say PTU is "a share of profits for many workers". **I did not confirm the 10% share**, so it isn't stated.
- **Ley Federal del Trabajo arts. 39-A to 39-E (consolidated text, reform of 21 Feb 2025):** probation of up to 30 days, up to 180 for management or specialized technical roles; salary, social security and benefits still apply; it must be in writing or the job is treated as permanent (39-C); it can't be extended or repeated (39-D); it counts toward seniority (39-E). Some online versions show longer figures that seem to belong to the initial-training rule (39-B).
- **US Department of Labor:** the FLSA doesn't require paid vacation, sick leave or holidays; state law decides whether they must be given.
- **CareerOneStop Salary Finder (US, from BLS data) and STPS Observatorio Laboral (Mexico, monthly income by career from the national employment survey):** used as places to look up pay. Their data vintages differ, some pages are old, and the two aren't comparable.

**Please verify:**
1. **The US "at-will" explanation** (either side can end the job at any time, with exceptions the law protects) is general knowledge with no source. Cite a Department of Labor or state page, or reword.
2. **"Some states and cities require paid sick leave."** The DOL summary says only that state law decides. "Cities" is my addition.
3. **Lesson 5's finiquito** ("pending pay and the part of aguinaldo and vacation owed") and the idea that people usually "give notice and ask in writing for their final pay" are general. Please confirm what a finiquito includes.
4. **Lesson 4 (asking for more)** has no official source for how to ask. It's framed as "many people" and "one common way", with a lookup of pay in government data. A reviewer should confirm it reads as teaching, not personal advice.
5. **Lesson 2, retirement.** "Employers pay into your AFORE through the IMSS" and "a 401(k) match adds money when you save" are general; the live retirement unit covers both.
6. **Mexico's aguinaldo** may change: proposals to raise it exist (the live fact notes none had passed as of Oct 2026). The vacation numbers and probation limits are facts in the verify list (`mxVacationDaysYear1`, `mxVacationDaysYear5`, `mxPrimaVacacionalPct`, `mxProbationDays`, `mxProbationDaysSenior`), reviewed yearly.
7. **Overlap.** Unit 34 (Working across the border, draft) covers overtime and pay deductions; this unit covers the offer itself.
8. **Teens.** Nothing asks anyone to apply, share numbers or negotiate for real. The mission (line up the benefits of two real posts, just reading) is in the unit header; teens can do it by reading.

Leo, Nia, Sam, Lupe, Ana, Sofía and Mateo are made up, as are the jobs and amounts. No employer is named.

## Wave 1, unit 36: Taxes in two countries (draft, not in the app)

Read copy: `docs/reviews/draft/bordertaxes.md` (rebuild with `node scripts/render-unit.mjs bordertaxes`). Unit file: `src/modules/lessons/units/bordertaxes.js`, `draft: true`. **This unit must be read by a licensed tax professional who knows both US and Mexican tax before it ships.** It teaches how the two systems work and where to get help. It never says what a person should file or claim. Treat it as the highest-risk unit in Wave 1.

**Read on 2026-11-17 and matches the lessons:**
- **IRS, "U.S. citizens and residents abroad: filing requirements":** generally required to file; the test counts worldwide gross income; excluded foreign earned income still counts toward the filing test. It does not mention the foreign tax credit.
- **ANAM, "Declaración de dinero":** declare more than the equivalent of US$10,000 on entering or leaving Mexico (cash, checks, money orders, other receivable documents); carrying it isn't a crime, not declaring is; fine of 20% to 40% of the excess. The prison terms above US$30,000 are on the page and are deliberately **not** in the lessons.
- **IRS, ghost preparers:** a preparer who won't sign or give a PTIN is a major red flag; the taxpayer is legally responsible for what is filed; never sign a blank return.

**Seen only in search summaries (a reviewer opens each):**
- **IRS, Publication 54 and Topic 851:** US citizens and resident aliens taxed on worldwide income; a noncitizen is a US resident for tax by the green card test or the substantial presence test (the lesson drops the test's name and the 31/183-day numbers); nonresident aliens are taxed on US-source income.
- **IRS, Gifts from foreign person / Form 3520:** an information return, because foreign gifts aren't subject to income tax; reported above $100,000 in a year from a nonresident alien or foreign estate; gifts from related persons are added together. A lower line applies to foreign corporations and partnerships (not taught).
- **US–Mexico income tax convention, Article 24, and the foreign tax credit:** a US credit for income tax paid to Mexico; excluded income can't also generate a credit.
- **CBP and FinCEN Form 105:** report more than $10,000 in currency or monetary instruments carried in or out; no limit on how much you can carry; a family or group traveling together adds its amounts.
- **SAT, LISR art. 93, and Código Fiscal de la Federación art. 9:** gifts between spouses, and to descendants from ascendants in a direct line, are exempt whatever the amount; other gifts only up to three times the annual minimum wage; residence starts with the home, then the center of vital interests.

**Please verify (nothing found, or sources conflict):**
1. **Mexico taxes residents on income from anywhere, and non-residents on Mexican income.** I believe that is LISR art. 1, but I opened no source for it (the SAT residence page refused my connection), so the lessons don't state it. Lesson 1 says only that Mexico "looks first at where your home is". A reviewer should decide whether to add it.
2. **Mexico's side of double-tax relief.** The unit explains the US foreign tax credit and the treaty, not what Mexico gives a resident for tax paid in the US. Add it once confirmed.
3. **Gifts into Mexico.** One Chamber of Deputies note says remittances count as exempt gifts only from first-degree relatives and within the three-minimum-wage limit, and a bill to exempt more remittances is pending. The lesson says "in Mexico some gifts are exempt: between spouses and from parents to children, and others up to a limit". It doesn't say what happens to money from an uncle or a sibling above the limit. This matters a lot to families and needs a Mexican tax professional.
4. **The US donor's side** (gift tax, Form 709) is not taught. The search could not confirm the 2026 annual exclusion or the rules for a foreign donor.
5. **Not taught:** the FBAR (it's in the live "Money across borders" unit), Form 8938, Mexican reporting of foreign accounts, Mexican reporting of cash deposits, the Mexican annual return's deadline and ITIN rules. A reviewer should say which belong in this unit.
6. **Lesson 4:** the unit says splitting a carried amount to avoid a report is "a red flag". The CBP rule on groups is in a search summary only.
7. **Lesson 5:** "ask for a contador's cédula", and the SAT never asking for passwords or the e.firma, come from SAT alerts seen in summaries (2016 and 2026) and from general knowledge. The unit does not claim any Mexican registry to check a preparer.
8. **The mission** (write three questions for a preparer, share no numbers) is in the unit header. The unit asks for no personal numbers.
9. **Facts in the verify list:** `foreignGiftReportUSD` and `cashDeclareUSD`.

Valeria, Elena, Tomás, Rosa and the "man at a stall" are made up, as are all amounts. No real preparer or firm is named.

## Wave 1, lessons added to live units (draft, not in the app)

Six lessons: **Budgeting** (budget-4 "Tracking what you spend", budget-5 "Budgeting when pay changes"), **Saving** (save-4 "Saving for a goal in small pots", save-5 "Making saving automatic"), **Debt & credit** (credit-4 "Reading a credit card statement", credit-5 "When borrowing makes sense"). Each unit goes from 3 to 5 lessons. All have US and Mexico text where the systems differ.

**Where they live, and why.** `src/modules/lessons/units/additions.js`, not the unit files. The app loads a unit file and matches its lessons to the course index by position (`hydrate` in `content.js`), so lessons added to a live unit file would reach learners at once, and a longer file than the index would break loading. The validator merges them into their unit; the app never sees them. To ship a set: move its concepts and lessons to the end of `budget.js`, `save.js` or `credit.js`, delete its entry in `additions.js`, run `node scripts/lesson-index.mjs`. Review copies: `docs/reviews/draft/budget-additions.md`, `save-additions.md`, `credit-additions.md` (rebuild with `node scripts/render-unit.mjs budget-additions`, and so on).

**Nothing was opened for these lessons.** Every source below is a search summary, except the CFPB "How to rebuild your credit" page, which I read earlier.
- **CFPB (budget):** track income and spending for at least a month; income is regular, irregular, seasonal or one-time; weekly cash-flow budgets; an annual planner to see tight months. **No CFPB page I saw says to base a budget on the lowest month**, so the US wording "a careful base is a low month or an average, not your best" is unsourced.
- **CONDUSEF and a federal guide (Mexico):** record every expense for a month in a notebook, spreadsheet or app and group by category; write variable income lower than it could be, don't use it for basic needs, or average the last 12 months; divide a goal's cost by the months you have and treat saving as a fixed amount; a free planner and the app "Presupuesto Familiar" exist. Several of these pages are old (one is from 2012), so check the app and planner still exist.
- **CFPB (saving):** a recurring transfer a day or two after payday; split your direct deposit; a separate account for a goal; start with small goals.
- **CFPB (cards):** the statement shows the due date, the minimum payment and interest charged; issuers must show how long paying only the minimum would take; paying in full each month avoids finance charges (read).
- **CONDUSEF (cards):** fecha de corte, fecha límite de pago (usually about 20 days later), pago para no generar intereses, pago mínimo (mostly interest), CAT.

**Please verify:**
1. **Envelopes** (budget-4) have no source in what I saw. It's a description of the method, not a claim.
2. **A programmed transfer in Mexico** (save-5): "ask your bank to set up a recurring transfer" is general knowledge. No Mexican source was found. "Keep a cushion so a transfer never overdraws" is also general.
3. **"Paying the full balance by the due date avoids interest"** (credit-4) is simplified. A card can lose its grace period if a balance is carried; the live "Credit cards" lesson may already cover it. A reviewer should say whether to add it.
4. **The CAT** "includes interest and fees" is general knowledge. CONDUSEF said a new universal statement format began in October 2024; I didn't check whether it changes what's shown.
5. **credit-5 is the most judgment-heavy lesson.** The "four questions" have no official source. It's framed as "many people ask" and "these are questions, not a rule", and the scenario's best option is to compare, not to borrow or not borrow. A reviewer should check it reads as teaching, not advice. Numbers (a {$600|10000} laptop, {$60|1000} interest) are examples.
6. **Overlap with live lessons.** budget-3 already has "Track for one week", save-1 has a "Make it automatic" card and credit-2 has "The minimum payment trap". The new lessons go further, but a reviewer should check for repetition.
7. **No new facts.** credit-4 reuses the live `cardAprTypical` (20%) and `catTypical` (40%) and has a worked-example check in the validator.
8. **Teens.** Nothing asks anyone to open an account or borrow. Actions are practice tools.

Mia, Leo, Jo, Dana, Kai, Priya, Rafael and Sam are made up, as are all their amounts.

**A bug found and fixed along the way:** facts of kind "percent" print their own "%", so text like "{@cardAprTypical}%" would show "20%%". It appeared in two places (this set and the job-offer unit's prima vacacional line). Both are fixed. Worth remembering when writing text with a percent fact.
