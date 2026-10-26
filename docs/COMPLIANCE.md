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

### School use

If schools ever adopt Northvale Learn, other rules can apply: FERPA, state student-privacy laws, and COPPA's school-consent rules. Treat school partnerships as a separate project.

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
  - for classroom mode (Phase 5): teachers may see that a mission was finished, never the note.
- **Bringing people back (Phase 4):**
  - reminders are opt-in, at a time the learner picks, never 9 pm–8 am unless they turn quiet hours off, at most one a day, and calm (no guilt, no countdowns). The server keeps them under a random device ID, not the account, and deletes them when turned off;
  - the weekly email is opt-in on the account, has a turn-off link that works without signing in, and stops by itself after 4 weeks without a lesson. It's a progress summary, not marketing; **lawyer to confirm** whether CAN-SPAM's postal-address and unsubscribe rules apply to it, and Mexico's LFPDPPP notice;
  - for 13–17, both are still the learner's own choice (no default-on). **Your decision:** whether reminders or the recap for 13–17 should need a parent's OK, as sign-up does.
- **Safety in the product:**
  - "educational only" on every money screen;
  - the tutor is told to send minors to an adult for real accounts, flag scams, and handle distress kindly.

## Still open — your decisions or a lawyer's

1. **Who is the data controller?** Your name or a company, the contact email, and a postal address are needed in both legal documents.
2. **Hosting region.** Where the server and data live (for example US or Mexico), and the hosting provider's data-processing terms.
3. **Anthropic's data terms.** Confirm retention and no-training for API data, and name Anthropic as a processor.
4. **Guardian consent.** Is a checkbox enough for the beta, or do you need email verification?
5. **Forgotten passwords.** Recovering them needs an email service (an account and possibly a cost). Until then, a tester who forgets their password has to make a new account.
6. **Beta testers under 18.** Get written parent or guardian permission before inviting them (see BETA.md).
