// WRITES docs/VERIFY-BEFORE-LAUNCH.md — every fact, number and rule to check
// before launch, with where to check it. The changing parts come from the
// code (facts.js, the worked examples, the myths), so the list can't miss
// one; `npm test` fails if the file is out of date (--check).
//   node scripts/verify-list.mjs           write it
//   node scripts/verify-list.mjs --check   fail if it's out of date
import { readFileSync, writeFileSync } from "node:fs";
import { join } from "node:path";
import { FACTS } from "../src/core/facts.js";
import { MYTHS } from "../src/modules/lessons/myths.js";
import { text } from "../src/core/i18n.js";
import { WORKED } from "./validate-content.mjs";

const OUT = join(import.meta.dirname, "../docs/VERIFY-BEFORE-LAUNCH.md");
const cell = (s) => String(s).replace(/\|/g, "\\|").replace(/\n/g, " ");
const show = (f) => {
  const v = f.value;
  if (f.kind === "text") return `${v.en} / ${v.es}`;
  const n = Number(v).toLocaleString("en-US", { maximumFractionDigits: 2 });
  return f.kind === "pct" ? `${n}%` : f.kind === "usd" ? `$${n}` : f.kind === "mxn" ? `$${n} MXN` : n;
};
const T = (x, only) => text(x, { lang: "en", region: only === "MX" ? "MX" : "US" });

const md = `# Verify before launch

Every fact, number and rule the app states, with where to check it. Tick each one, or fix it, before the public launch, and again on the "how often" schedule. This file is written by \`scripts/verify-list.mjs\` from the code (facts.js, the worked examples, the myths), so it lists everything; \`npm test\` fails if it falls out of date. To change a number: edit \`src/core/facts.js\`, then run \`node scripts/verify-list.mjs\`.

**Status:** the advisor checked the content facts on 2026-10-25 and 2026-10-26 (see \`docs/CONTENT-REVIEW.md\`). What's new since then is marked **new**. Nothing here is legal advice.

## 1. Numbers that change (src/core/facts.js): ${Object.keys(FACTS).length}

Each one appears in the lessons, the glossary or the tools as \`{@name}\`; \`docs/FACTS.md\` says where.

| ✓ | Fact | Now | Check at | How often |
|---|---|---|---|---|
${Object.entries(FACTS)
  .map(([k, f]) => `| ☐ | \`${k}\`${["ficoRange", "ficoFactors", "buroFreeReportMonths", "rothRule", "remitRateExample", "remitSendExample", "remitFeeExampleA", "remitMarkupExampleA", "remitFeeExampleB", "remitMarkupExampleB", "remitCancelMinutes", "fbarThreshold", "f1WorkHours"].includes(k) ? " **new**" : ""} | ${cell(show(f))} | ${cell(f.check)} | ${cell(f.review)} |`)
  .join("\n")}

## 2. Worked examples: ${WORKED.length}

Calculations in lessons done with a fact's current value. The content check re-does each one from facts.js, so if a fact changes, \`npm test\` names the lesson to rewrite. Nothing to check by hand unless a fact changes.

${WORKED.map(([w]) => `- ${w}`).join("\n")}

## 3. Statements in lessons that the advisor confirmed (recheck yearly)

From \`docs/CONTENT-REVIEW.md\` (Phase 2 and Phase 3 lists, confirmed 2026-10-26):

- ☐ **Mexico: IMSS worker share** is roughly 2–3% of salary, depending on the salary band (the paycheck tool's 2.5% is an example). Source: imss.gob.mx.
- ☐ **Mexico: annual return.** Employees file a declaración anual above \`mxSalaryFilingMin\`, with two employers at once, or with other income. Source: LISR art. 98, sat.gob.mx.
- ☐ **Mexico: IVA.** 16% generally; 8% in the border regions by a temporary decree (until \`ivaBorderEnds\`); 0% on most basic food. Source: LIVA, sat.gob.mx, the border decree in the DOF.
- ☐ **Mexico: car insurance.** Civil liability is required on federal highways, and several states require it everywhere. Source: Ley de Caminos, Puentes y Autotransporte Federal; state laws.
- ☐ **Mexico: students** at public high schools and universities can have IMSS coverage (seguro facultativo). Source: imss.gob.mx.
- ☐ **Mexico: RESICO** is a simplified regime with low rates; business clients withhold part of the tax. Source: LISR arts. 113-E to 113-J.
- ☐ **Mexico: aguinaldo,** at least \`aguinaldoDays\` days of salary, by December 20. Source: LFT art. 87 (watch for the 30-day proposals).
- ☐ **US: sales tax** varies by place; a few states have none. Source: taxfoundation.org.
- ☐ **US: health coverage** on a parent's plan until \`parentHealthPlanAge\`. Source: healthcare.gov.
- ☐ **US: car insurance** is required in almost every state (New Hampshire is the main exception). Source: state DMVs, iii.org.
- ☐ **US: forms.** The W-2 arrives by the end of January; some states require work permits for minors; the ITIN is for people who must pay US taxes but can't get an SSN. Source: irs.gov, dol.gov/youthrules.
- ☐ **Crypto** isn't legal tender in Mexico, Banxico has warned about it, and neither IPAB nor FDIC covers it. Source: banxico.org.mx, ipab.org.mx, fdic.gov.
- ☐ **Behavioral findings:** losses feel about twice as strong as equal gains (Kahneman and Tversky, 1979); missing a few of the market's best days greatly lowers long-run returns. Sources: the original paper; J.P. Morgan's "Guide to Retirement" best-days chart.
- ☐ **Index returns:** roughly 10% a year before inflation, about 7% after, over long periods (\`marketAvgNominal\`, \`marketAvgReal\`). Source: S&P 500 long-run data (for example, NYU Stern's historical returns table).
- ☐ **Active vs. index funds:** most actively managed funds trail their index over 10+ years, attributed to S&P's SPIVA reports. Source: spglobal.com/spdji (SPIVA scorecards).
- ☐ **Card rates:** "often over \`cardAprTypical\`" (US) and "CAT often over \`catTypical\`" (Mexico) are deliberately low. Sources: Federal Reserve G.19; Banxico's card indicators.
- ☐ **US: free credit reports** at AnnualCreditReport.com (now weekly). **Mexico:** a free Reporte de Crédito Especial every \`buroFreeReportMonths\` months at burodecredito.com.mx.
- ☐ **Mexico: finding your AFORE** with your CURP in AforeMóvil or at e-sar.com.mx.
- ☐ **Card statements:** US statements show how long minimum payments take (CARD Act); Mexican statements show the "pago para no generar intereses". Sources: consumerfinance.gov; Banxico's rules on statements.
- ☐ **Mexico: CONDUSEF's** Buró de Entidades Financieras compares institutions on complaints, fines and fees. Source: condusef.gob.mx.
- ☐ **US: colleges** have a net price calculator (required for schools taking federal student aid). Source: studentaid.gov.
- ☐ **Explain this (new).** The prompt tells a scam victim where to report: **reportfraud.ftc.gov** (US) and the bank plus **CONDUSEF** or the **Policía Cibernética** (Mexico). Check each is current and the right place for a young person. It must never say to sign, accept, buy or pay (tested in \`scripts/tutor-check.mjs\`; run it with \`--yes\` before launch, it costs a few cents). The privacy policy's "Explain this" paragraph needs the lawyer's check (pasted text can hold other people's data). Photos stay out until a lawyer reviews them.
- ☐ **Your Money Year (new).** A simulation with example numbers: the amounts in \`src/modules/year/content.js\` and the starting situations in \`engine.js\` are teaching numbers, not data; card interest, the savings rate and the aguinaldo come from \`cardAprTypical\`, \`catTypical\`, \`savingsExampleRate\`, \`cetesExampleRate\` and \`aguinaldoDays\`. The market path is made up (a spring dip, then recovery). Check that the text claims nothing a real person could take as a forecast, that Mexico's year-end reads as the aguinaldo and the US one as a bonus, and that "a refund / saldo a favor" in month 3 matches how the tax lessons describe it.
- ☐ **Certificates (new).** The five tracks and their names (\`src/modules/certs/tracks.js\`) and the wording on the certificate and the public page: it says it marks finishing lessons in the app and is not a school credit or a professional qualification. Check that wording with the lawyer, along with the privacy policy's "Certificates" paragraph (a name kept for adults who choose it; none for anyone under 18 or with no age; a public page that shows track, date and that name). Check that \`/verify\` and \`/verificar\` show nothing else.
- ☐ **Money across borders (new).** The unit "Money across borders" and its tool state the following. Check each against its source, and that the example numbers (\`remit*\` facts) are plain teaching numbers, never a real company's rates.
  - ☐ The US **Remittance Rule** requires the exchange rate, fees and amount received to be shown before you pay, and a sender can usually cancel within \`remitCancelMinutes\` minutes. Source: consumerfinance.gov.
  - ☐ **Profeco's** official comparison of money-sending services exists and works at **qqed.profeco.gob.mx** (the app names no companies and links no rankings). Confirm the address still works, in both languages' text.
  - ☐ **FBAR:** people in the US report foreign accounts that total more than \`fbarThreshold\` at any time in the year. Source: fincen.gov.
  - ☐ **F-1 students** can usually work on campus up to \`f1WorkHours\` hours a week during classes. Source: studyinthestates.dhs.gov.
  - ☐ **Credit files are separate** in the US and Mexico (US history doesn't transfer to Buró de Crédito, or the reverse), and **some US lenders accept an ITIN** instead of an SSN. Source: consumerfinance.gov, burodecredito.com.mx; a lender's own rules.
  - ☐ **Card terminals abroad:** choosing the local currency usually gives a better rate than letting the merchant convert (dynamic currency conversion). Source: consumerfinance.gov.
  - ☐ **FDIC** covers only US banks; **IPAB** covers only Mexican banks. Source: fdic.gov, ipab.org.mx.
  - ☐ A US debit card often adds a **foreign ATM fee and a currency fee** abroad; the lessons give no number.
- ☐ **US: Social Security card:** keep it safe at home, not in your wallet. Source: ssa.gov.
- ☐ **Retirement (Mexico):** employer, worker and government contribute to the AFORE for IMSS workers (ISSSTE and independent workers differ); the PPR deduction rule (\`pprDeductionPct\`, \`pprDeductionUmas\`, \`pprAge\`, not in RESICO). Source: LSS, LISR art. 151 fracc. V, consar.gob.mx.
- ☐ **Retirement (US):** a custodial Roth IRA for teens with earned income, up to what they earned or \`iraLimit\`; managed by an adult until 18 or 21 depending on the state. Source: irs.gov Publication 590-A.

## 4. Myth or fact? ${MYTHS.length} daily statements **new** (Milestone 4.5)

Added after the advisor's review, so none has been checked by a person yet. Each answer and its reason should be confirmed.

| ✓ | Statement | Answer | Why (as the app says it) | Only |
|---|---|---|---|---|
${MYTHS.map((m) => `| ☐ | ${cell(T(m.claim, m.only))} | ${m.answer} | ${cell(T(m.why, m.only))} | ${m.only || "both"} |`).join("\n")}

## 5. Other content added since the advisor's review **new**

- ☐ **The six new kinds of question** (Milestone 4.5, one or more in every lesson: put in order, estimate, match, work it out, spot the problem, real-life choice). Their numbers are teaching examples, and their answers are checked by the content check and played in \`test/lessons.test.mjs\`; the statements in them follow the lessons above. Worth one read-through by the advisor.
- ☐ **"The real cost" (Practice):** everyday choices (a coffee, a snack, a ride, at example prices) and hidden costs (card interest at a fixed payment, a monthly fee, forgotten subscriptions). Example amounts, not facts.
- ☐ **"Your money week" (Today, Sundays):** shows the learner's own goal numbers only.
- ☐ **Spanish wording** shortened in six places so every lesson fits 4.5 minutes in Spanish too (RC1). Same meaning; the advisor may want to read them: Budgeting 2, Banking 1 (two), Retirement 1 and 3, Taxes 4, Scams 4.

## 6. The app's own rules (match them to the privacy policy and terms)

| ✓ | Rule | Now | Where it lives |
|---|---|---|---|
| ☐ | Who can use it | 13 and up; 13–17 need a parent's or guardian's OK for an account; no age counts as 13–17 | \`server/index.js\` (sign-up), Onboarding, \`docs/legal/terms.*.md\` |
| ☐ | 18+ only | checking your credit report; finding your AFORE; share cards with a goal's name or amounts | \`src/modules/missions/catalog.js\`, \`src/core/share.jsx\` |
| ☐ | Backups | daily, kept 14 days; what a restore replaces, also 14 days | \`server/store.js\` |
| ☐ | Feedback | kept up to 2 years | \`server/insights.js\`, privacy policy |
| ☐ | Archived classes | deleted after 90 days (classroom mode is off for real users) | \`server/classes.js\` |
| ☐ | Waitlist | deleted within 30 days after the beta | \`server/waitlist.js\`, privacy policy |
| ☐ | AI spending | a monthly budget (\`AI_MONTHLY_BUDGET_USD\`, 25 in .env.example); per account \`TUTOR_DAILY_LIMIT\` 30 a day, \`EXPLAIN_DAILY_LIMIT\` 8 a day and \`TUTOR_PER_MINUTE\` 5 a minute | \`server/ai.js\`, \`.env\` |
| ☐ | League | at most 500 XP a day counts; 13–17 and 18+ in separate leagues | \`server/index.js\`, \`server/store.js\` |
| ☐ | Sign-in limits | 5 failed sign-ins per email and 20 per address in 15 minutes; 120 sign-ups per address | \`server/index.js\` |
| ☐ | Reminders | opt-in, at most one a day, not 9 pm–8 am unless quiet hours are off | \`server/push.js\` |
| ☐ | Streak freezes | at most 2; one free repair a month | \`src/core/progress.js\` |
| ☐ | A lesson left partway | picks up at the same step for a week | \`src/modules/lessons/index.jsx\` |

## 7. Legal, names and contact (yours and the lawyer's)

- ☐ **Your name or company, contact email and postal address** in \`docs/legal/privacy.*.md\` and \`terms.*.md\` (now **[your name / company, address, email]**), and \`CONTACT_EMAIL\` in .env.
- ☐ **\`MAIL_POSTAL_ADDRESS\`** before any email goes out.
- ☐ **The lawyer's list** in \`the private compliance notes\` ("Still open", items 1–10), including the names "Northvale Learn" and **"Real-life missions" / "Misiones de la vida real"** **new**.
- ☐ **The name and logo:** the clearance search and filing in \`docs/BRAND-CHECK.md\`.
- ☐ **Every outside link** in lessons and missions opens the official page (last checked: see \`docs/RC1-RESULTS.md\`).
`;

if (process.argv.includes("--check")) {
  let now = "";
  try {
    now = readFileSync(OUT, "utf8");
  } catch {}
  if (now !== md) {
    console.error("docs/VERIFY-BEFORE-LAUNCH.md is out of date: run node scripts/verify-list.mjs");
    process.exit(1);
  }
} else {
  writeFileSync(OUT, md);
  console.log(`docs/VERIFY-BEFORE-LAUNCH.md: ${Object.keys(FACTS).length} facts, ${WORKED.length} worked examples, ${MYTHS.length} myths`);
}
