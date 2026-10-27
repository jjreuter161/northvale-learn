# Security review (2026-10-24)

**Scope:** sign-up, sign-in and sessions; every API route; the admin page; data storage and backups; outside data (news, prices, AI). Method: a code review, plus tests for each fix in `npm test`. This was not an external penetration test; get one before a large public launch.

## Fixed in this review

| Issue | Risk | Fix |
|---|---|---|
| An oversized request crashed the whole server | Anyone could knock the service offline | Fixed. Each request's errors are now contained, and a test sends an oversized request. The same fix went into the Northvale money-manager server. |
| League XP was whatever the app said | A hand-edited number tops the league | Fixed: each day counts at most 500 XP on the server. Tested. |
| Sign-up allowed only 20 accounts per network address every 15 minutes | A class on one school Wi-Fi gets locked out | Fixed: sign-ups get 120 per address. Failed sign-ins keep the strict limits. |
| News summaries come from outside RSS text and everyone sees them | A feed could try to steer the AI into a link or "buy" message | Fixed: summaries with links or buy/sell calls are dropped and not paid for again. Tested. |
| Fonts loaded from Google | Every visitor's IP went to a third party | Fixed: fonts are self-hosted, and the content policy now allows only our own server. |
| Rate-limit memory never shrank | Slow memory growth under heavy traffic | Fixed: idle entries are cleared every 10 minutes. |
| Backup copies used default file permissions | Other users on the host machine could read backups | Fixed: backups are made readable only by the server. |
| No spending ceiling on the AI | A bug or abuse could run up a large bill | Fixed: a monthly budget pauses the AI. There are also per-account limits per minute and per day, and alerts at 80% and 100%. Tested. |

## Already in place (checked)

- **Passwords:**
  - stored with scrypt (N=32768) and a per-user salt, compared in constant time;
  - a wrong email takes as long as a wrong password;
  - 10+ characters required.
- **Sessions:**
  - a random 256-bit token in an HttpOnly, SameSite=Strict cookie, Secure over HTTPS;
  - the server keeps only the token's SHA-256;
  - 30-day expiry;
  - a password change signs out other devices;
  - deleting the account ends all of its sessions.
- **Guessing:** 5 failed sign-ins per email and 20 per address in 15 minutes, then a pause. The admin token gets 5.
- **Reminders (Phase 4, `server/push.js`):**
  - the server only ever sends to push addresses on browsers' push services (Google FCM, Mozilla, Apple, Microsoft), over HTTPS, so a made-up "push address" can't make it call other machines (no SSRF);
  - each message is encrypted for the device (RFC 8291) and signed with the server's own VAPID key (made on first start, kept in the data file);
  - the summary a device sends is cut down to known fields and lengths; sign-ups are rate-limited per address and capped at 50,000 devices; a random device ID (122 bits) is the only way to change or delete one.
- **The weekly recap's turn-off link** carries an HMAC of the account ID (a server secret made on first start), checked in constant time; it can only turn the recap off, and only for that account.
- **Cross-site attacks:** every API call needs an `X-Northvale` header, which other sites can't send without permission (and the server never grants it), plus SameSite=Strict cookies. A host allowlist blocks DNS-rebinding.
- **Page security:**
  - a strict content policy: scripts and connections only to our own server, no inline scripts;
  - no framing (anti-clickjacking);
  - no referrer;
  - nosniff;
  - HSTS over HTTPS.
- **Injection:**
  - React escapes all text;
  - the admin page writes everything with textContent;
  - nicknames are cleaned;
  - every input has a size limit.
- **Files:**
  - only `web/` is served, with a path-traversal guard;
  - `.env` and the data folder are never served;
  - the data file and backups are readable only by the server.
- **Outside services:**
  - the server only calls fixed addresses (Anthropic, Twelve Data, the RSS feeds); no user input picks a URL;
  - the market-symbol lists are limited to known assets;
  - news and prices are cached, so outside calls are bounded.
- **AI prompt:**
  - the tutor's instructions live on the server;
  - the learner snapshot is size-limited;
  - no email or nickname is sent.
- **Dependencies:** `npm audit` found no known vulnerabilities in the runtime dependencies.
- **Classroom mode (Phase 5, `server/classes.js`):**
  - off unless the admin turns the `classroom` switch on for an account (admin token only); a class stops working when its teacher loses the switch;
  - teacher routes need a session, the switch, and ownership of the class; a teacher can't open another teacher's class (tested);
  - class codes: 6 characters from 31 (about 887 million codes), wrong codes throttled at 120 per address per 15 minutes, joins capped at 300 per address per hour; teachers can close joins and change the code;
  - a student's member key is 24 random bytes, kept only as a SHA-256 and compared in constant time; it travels in the request body, never the address;
  - the teacher's view is built field by field; a student's report is checked against real lesson and concept IDs and capped (missions, answers, XP), extra fields are dropped, and reports are rate-limited per member (tested with goals, notes, email and age in a forged report: none reach the teacher);
  - lookups by ID use own properties only, so names like `__proto__` can't reach object internals.
- **Email confirmation:** a one-time link valid 24 hours, kept only as a SHA-256, of a separate kind from password reset (a confirmation link can't reset a password; tested), 5 sends per hour per account.
- **Invites and friends (`server/invites.js`):** random codes; each link's key kept only as a SHA-256; rewards at most 20 per link and once per invited person; opens and joins rate-limited per address; friend links only between accounts, removable by either; all removed with the account.
- **Share cards** are drawn in the browser; nothing about them reaches the server except their kind.
- **The waitlist (Phase 6, `server/waitlist.js`):** a hidden honeypot field (bots get the same answer, nothing is stored), 10 sign-ups per address per hour, server-side checks of every field (13+ and the guardian rule too), at most 100,000 entries; the take-me-off link is an HMAC of the entry ID (a server secret), checked in constant time and rate-limited, and the page asks before using it; the admin CSV quotes every field and defuses spreadsheet formulas (`=`, `+`, `-`, `@`). The landing pages are static, load nothing from other sites (tested), and their share-preview address comes from `PUBLIC_URL` or the allow-listed Host header.
- **Compression:** text files are gzipped once and cached in memory (no new dependency).
- **Teacher guide pages** have no inline scripts (the print button is a script file), so the content policy stays strict.

## Known limits (accepted for the beta)

- **Sign-up reveals whether an email has an account.** That's common and low risk here. Sign-in doesn't reveal it.
- **No password reset.** It needs an email service; see COMPLIANCE.md.
- **Guardian consent is a checkbox,** not a verification (a legal question more than a security one).
- **Rate limits live in memory,** so a server restart resets them. That's fine with one server; move them to a shared store if you run more than one.
- **One JSON data file.** It's fine for hundreds or a few thousand testers. Move to a database (for example SQLite or Postgres) before growing past that or running more than one server.
- **Usage stats can be faked** by anyone who posts events. They're also rate-limited per install and per address. Read the admin numbers as directional.
- **Class progress is self-reported** by the student's device, like XP. It's checked and capped, but a determined student could inflate their own numbers. Fine for teaching; don't use it for grades that matter.
- **Ages are self-declared,** for teachers (18+) and students (13+). The school agreement, not the app, is the real check.
- **Class membership lives on the device** (and in the account's synced progress, if any). A lost device means the student joins again; the teacher removes the old row.
- **The waitlist says "already on the list"** for an email that's on it, so someone could check whether an address signed up. It's rate-limited (10 per hour per address); accepted for a beta list.
- **Invite rewards can be farmed** a little (new browser profiles), up to 20 per link, and freezes are capped at 2 anyway.
