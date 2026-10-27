# Rules for an app used by people 13+ (US and Mexico)

**This is an orientation, not legal advice.** It explains which rules likely apply and what the app already does about them. Before a public launch, have a lawyer licensed in the US and one in Mexico confirm it. The laws for minors online changed a lot in 2024–2025.

## United States

### COPPA (Children's Online Privacy Protection Act) — under 13

**What it is.** A federal law covering apps that are directed to children under 13, or that know they're collecting personal information from them. Collecting it needs verifiable parental consent first. The FTC updated the COPPA Rule in 2025.

**What the app does:**

- **The app is for 13+.** Accounts can't be created by anyone who says they're under 13; the server enforces this, not just the screen.
- **No personal information without an account.** Usage stats use a random ID with no name, email or IP. COPPA counts persistent identifiers as personal information, so the policy says we delete anything we learn came from a child.
- **The age question is neutral.** It offers a list of age ranges, and "under 13" is a normal choice; nothing suggests the "right" answer.

**Lawyer to check:**

- whether the Learn content or marketing could make it "directed to children" (keep marketing aimed at 13+);
- whether the analytics ID falls under COPPA's "internal operations" exception.

### State privacy and teen laws

- **California (CCPA/CPRA).** Selling or sharing data of anyone under 16 needs opt-in consent. We don't sell or share, and there are no ad trackers. Most CCPA duties start only above size thresholds (for example $25M+ revenue).
- **Laws in other states.** Many states (Connecticut, Colorado, Virginia, Texas, Utah and more) have privacy or "kids' code" laws, with extra duties for minors' data: no targeted ads, data minimization, default privacy settings, and impact assessments. Several are being challenged in court. Most have size thresholds, and many target social features. Our league shows only a nickname and XP, and there's no chat between users.
- **Lawyer to check:** which state laws apply at your expected size, and whether the league counts as a "social" feature anywhere.

### Financial rules (SEC / FINRA / FTC)

- Giving personalized investment advice for pay can require registration as an investment adviser. General, impersonal education doesn't.
- **What the app does:**
  - It names no "best" investments and makes no predictions.
  - The tutor's instructions forbid buy/sell recommendations, and the safety check (`scripts/tutor-check.mjs`) tests for it.
  - Every money screen says "educational only".
  - Simulated returns are labeled as assumptions.
- **FTC Act.** Claims must be truthful: no fake urgency, and no promises of returns. The streak design avoids dark patterns: freezes cover a missed day automatically, and a broken streak gets a kind message.

### School use (classroom mode, Phase 5)

Classroom mode is built but **switched off for real users** (the `classroom` feature switch on the admin page: off, on for listed tester accounts, or on for everyone). Keep it to testers until a lawyer has reviewed this section. A class only works while its teacher's account has the switch on, so turning it off pauses every class.

Laws that can apply once a school uses it:

- **FERPA.** Information from a student's school record is protected. A school can share it with an app only under the "school official" exception: the app is under the school's direct control and uses the data only for what the school allows. Northvale Learn doesn't receive school records (no names, IDs or grades go in), but what it shows the teacher becomes part of what the school handles.
- **COPPA, school consent.** For under-13 students, a school can consent for parents, for school use only. **Classes are blocked for under 13** (the join screen asks an age range, and the server refuses "under 13"), so this doesn't apply yet.
- **State student-privacy laws** (California's SOPIPA, New York's Education Law 2-d, Illinois' SOPPA, Connecticut, Colorado and others). They cover services built for K-12 school use: no ads based on student data, no selling it, no profiles beyond school purposes, reasonable security, and deleting it when the school asks. Several states require a **signed data-privacy agreement** with each school or district (often the Student Data Privacy Consortium's National DPA), and some require publishing it.
- **Mexico.** LFPDPPP still applies; for students under 18, a parent's or guardian's consent is the normal basis, and a school may need to give its own privacy notice. **Lawyer to confirm** how classroom use works under it, and whether the school, the teacher or Northvale is the "responsable".

**What's built for this:**

- **Teachers:** an account, 18+ (self-declared at sign-up), a **confirmed email** (a one-time link, 24 hours), and the **teacher terms** accepted ([docs/legal/teacher.en.md](legal/teacher.en.md), Spanish too). The date of each is kept.
- **Students:** join with a class code or the teacher's link. **No account or email**: only a nickname for the class and an age range (13+). A screen before joining says exactly what the teacher will and won't see.
- **The teacher sees only:** nicknames; lessons and units finished since the student joined; how many Money Missions they finished; progress on assigned units (which counts earlier lessons only if the student ticks "Count lessons I already finished for class assignments" — off by default, changeable any time, and only lessons in assigned units); and **class-wide** totals for topics the class misses (only once 3+ students have answered on a topic). Never goals, amounts, savings, the practice portfolio, mission notes, tutor questions, age, email, or anything from before joining. The server builds the teacher's view field by field (`server/classes.js teacherView`), and the student's device only ever sends those fields (`src/modules/classroom/report.js`). Tests check that private data never reaches the teacher.
- **Codes:** 6 characters (no look-alikes), changeable by the teacher (the old one stops working), and the teacher can close the class to new students. Wrong codes are throttled per network address; joins are capped per address.
- **No messaging of any kind.**
- **Class leaderboard:** nicknames and this week's XP only. Any student can hide.
- **Leaving:** any time; it deletes the student's record, so the teacher no longer sees them. A teacher can also remove a student.
- **Deleting:** an archived class is deleted 90 days after archiving (checked daily). Deleting a teacher's account deletes their classes. "Delete my data" takes a student out of every class.
- **Printable teacher guide** in English and Spanish (`/teacher-guide.html`, `/guia-docente.html`), with a note for families.

**What a school or teacher needs to agree to first** (the teacher terms are the draft; a school may want its own written agreement):

1. Use classes only for teaching, under the school's rules for student apps, with the school's OK **before** using it with students.
2. Tell families, the way the school does for a new app (the guide has a note).
3. Students use nicknames; the teacher doesn't collect names, emails, phone numbers, addresses, birthdays or photos through the app.
4. Use what they see only for teaching that class; don't share it outside the school.
5. Don't pressure students to stay in the class or on the leaderboard.
6. On our side (for the agreement): what we collect (the list above), that we never sell student data or use it for ads or profiles, how long we keep it (above), security (SECURITY-REVIEW.md), deleting on request, and telling the school about a breach. **For a district, this becomes a data-privacy agreement (DPA)** — a lawyer should prepare one from the National DPA before any school pilot.

## Mexico

### Personal data law (LFPDPPP)

**What it is.** Mexico replaced its private-sector data protection law in March 2025. Oversight moved from the former INAI to the Secretaría Anticorrupción y Buen Gobierno. What the law requires:

- a clear **Aviso de Privacidad** in Spanish (ours is `docs/legal/privacy.es.md`);
- collecting only what's needed;
- consent;
- security measures;
- honoring **ARCO** rights: access, rectification, cancellation, opposition.

**Minors.** Under Mexican law, people under 18 can't consent on their own. A parent or guardian must. The app asks 13–17-year-olds to confirm a parent or guardian agreed, and records the date. **A checkbox is weak proof.** A lawyer should decide whether the beta needs stronger verification, for example a parent confirming by email (which needs an email provider).

**What the app collects about a minor.** Without an account, nothing that identifies them. With an account: email, nickname, age range and progress. Real names, birthdays, CURP, phone numbers and bank details are never asked for.

### Financial and consumer rules

- **Investment advice.** Under the Ley del Mercado de Valores, investment advice is a regulated activity: advisers register with the CNBV. Financial education isn't. The same safeguards as in the US apply.
- **Consumer protection.** PROFECO and the Ley Federal de Protección al Consumidor cover terms of use and advertising. Keep claims honest, and keep the terms in Spanish.

## What's already built in

- **Collecting little:**
  - accounts are optional;
  - the server stores a nickname and an age range, not a name or birthday;
  - no third-party trackers;
  - fonts are self-hosted, so no Google requests;
  - IP addresses are used only briefly for security.
- **Deleting everything:** Settings → Privacy → **Delete my data** removes the account, this device's usage stats and the device's data. Backups age out within 14 days.
- **Turning analytics off:** analytics can be switched off, and they're off automatically with Global Privacy Control or Do Not Track.
- **Legal drafts in both languages:** a privacy policy and terms in English and Spanish, marked as drafts.
- **Money Missions (real-world tasks):**
  - nothing is collected: people do them on their own and mark them done;
  - notes are optional, capped at 280 characters, stored with the learner's progress, and never sent with usage stats (only "finished, with or without a note");
  - the note box says to leave out account numbers, passwords and other private details;
  - 18+ only: checking a credit report and finding your AFORE. An unknown age counts as 13–17;
  - 13–17 versions involve a parent or guardian (reading a pay stub together, help with account security, talking before taking on any work);
  - missions that touch outside sites say "just reading — don't apply / sign up / pay", and point only to official sites (AnnualCreditReport.com, Buró de Crédito, sat.gob.mx, e-sar.com.mx, CONDUSEF);
  - in classroom mode, teachers see how many missions a student finished since joining, never which notes or what they said.
- **Bringing people back (Phase 4):**
  - reminders are opt-in, at a time the learner picks, never 9 pm–8 am unless they turn quiet hours off, at most one a day, and calm (no guilt, no countdowns). The server keeps them under a random device ID, not the account, and deletes them when turned off;
  - the weekly email is opt-in on the account (off by default for everyone, including 13–17), has a turn-off link that works without signing in, and pauses itself after 4 weeks without a lesson with one short last note ("We've paused your weekly recaps. Turn them back on anytime in Settings."). It's a progress summary, not marketing. **Lawyer question:** whether CAN-SPAM's rules apply to it (it's closer to an account message). To be safe, the footer shows a mailing address once `MAIL_POSTAL_ADDRESS` is set in `.env` — use a P.O. box or virtual mailbox, not a home address, before the public launch. Also Mexico's LFPDPPP notice;
  - **decided (advisor):** no extra parent OK for 13–17 reminders or the recap; the recap is off unless the learner turns it on.
- **Invites and share cards (Phase 5):**
  - an invite is a personal link the learner shares themselves: no contact-list access, no auto-sending, nothing shared on their behalf. The invited person is counted under a random ID made only for that, so invites can't link two people's usage stats;
  - share cards are drawn on the device and never show names, location or a class. A goal's name or amounts appear only if the learner turns that on for that one card, and **for 13–17 (or no age) the option doesn't exist**;
  - **no public profiles** of any kind. Friends leagues are made only through an invite link the invited person accepts; each sees the other's nickname and weekly XP, and either can remove it. Choosing "friends" or "my class" takes the learner out of the everyone league. **The everyone league keeps age groups apart:** 13–17 only with 13–17, 18+ only with 18+, so teens never compete with adults they don't know (friends and classmates are people they chose).
- **Safety in the product:**
  - "educational only" on every money screen;
  - the tutor is told to send minors to an adult for real accounts, flag scams, and handle distress kindly.

- **The landing page and waitlist (Phase 6):**
  - honest content only: real app screenshots (made by `scripts/landing-shots.mjs` from the app itself), "beta" in plain view, no testimonials, ratings, user counts or "as seen in" logos;
  - the waitlist asks only email, country, role and age range; under 13 can't join (the page and the server both refuse); 13–17 see "check with a parent or guardian" and must tick that they did (the date is kept);
  - no trackers, outside fonts or cookies on the page; spam is stopped with a hidden field and per-address rate limits;
  - the confirmation email (once Gmail is approved) is a transactional notice with a take-me-off link that asks before removing (so mail scanners can't); the admin page exports (CSV) and deletes entries;
  - **lawyer:** whether waitlist emails to 13–17 need anything more in Mexico (LFPDPPP) or in US states with teen privacy laws; the same mailing-address question as the recap.

## Still open — your decisions or a lawyer's

1. **Who is the data controller?** Your name or a company, the contact email, and a postal address are needed in both legal documents.
2. **Hosting region.** Where the server and data live (for example US or Mexico), and the hosting provider's data-processing terms.
3. **Anthropic's data terms.** Confirm retention and no-training for API data, and name Anthropic as a processor.
4. **Guardian consent.** Is a checkbox enough for the beta, or do you need email verification?
5. **Forgotten passwords.** Recovering them needs an email service (an account and possibly a cost). Until then, a tester who forgets their password has to make a new account.
6. **Beta testers under 18.** Get written parent or guardian permission before inviting them (see BETA.md).
7. **Classroom mode, before any real class** (lawyer):
   - review the teacher terms, the student join screen and this section;
   - prepare a school/district data-privacy agreement (from the National DPA) and decide which states to support first;
   - confirm that a self-declared age range is enough to keep under-13s out, and whether a school pilot needs parent notice or consent (US and Mexico);
   - confirm who is responsible for student data in Mexico (school, teacher or Northvale);
   - confirm 90 days is the right deletion time for archived classes.
8. **Recap mailing address.** Set `MAIL_POSTAL_ADDRESS` (P.O. box or virtual mailbox) before the public launch, and confirm with the lawyer whether CAN-SPAM requires it for an opted-in progress recap.
