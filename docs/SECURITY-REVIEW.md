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

## Known limits (accepted for the beta)

- **Sign-up reveals whether an email has an account.** That's common and low risk here. Sign-in doesn't reveal it.
- **No password reset.** It needs an email service; see COMPLIANCE.md.
- **Guardian consent is a checkbox,** not a verification (a legal question more than a security one).
- **Rate limits live in memory,** so a server restart resets them. That's fine with one server; move them to a shared store if you run more than one.
- **One JSON data file.** It's fine for hundreds or a few thousand testers. Move to a database (for example SQLite or Postgres) before growing past that or running more than one server.
- **Usage stats can be faked** by anyone who posts events. They're also rate-limited per install and per address. Read the admin numbers as directional.
