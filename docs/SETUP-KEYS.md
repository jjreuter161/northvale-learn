# Turning on the real services

Both keys go in **one file: `.env` in the project folder.** That file:

- is listed in `.gitignore`, so it's never committed;
- is never sent to the app or shown on any screen; only the server reads it;
- shouldn't be pasted into chats, emails or screenshots. Paste the keys straight into the file.

**The easy way:** get the keys below, then run this in Terminal from the project folder:

```bash
npm run setup
```

It asks for each key (what you type stays hidden), makes the admin token for you, and saves `.env` so only you can read it. Then run:

```bash
npm run check-setup
```

It checks every key without spending anything:

- Anthropic: it only lists the available models;
- Twelve Data: it gets one free price;
- Gmail: it signs in and sends nothing;
- Fly.io: it checks the sign-in.

It tells you exactly what to fix.

You can also edit the file by hand: copy `.env.example` to `.env` and open it in a text editor.

## 1. Twelve Data (real delayed prices) — free

1. Go to **https://twelvedata.com** → **Get free API key** → sign up with your email.
2. After you confirm your email, open **Dashboard → API Keys** and copy the key.
3. In `.env`, paste it after `TWELVEDATA_API_KEY=` with no spaces or quotes:

   ```
   TWELVEDATA_API_KEY=paste-it-here
   ```

The free plan allows 8 requests a minute and 800 a day. The server caches prices for 15 minutes, so that's enough for a beta. Mexican-exchange stocks (WALMEX, FEMSA, Bimbo, América Móvil, NAFTRAC) need a paid plan; without one, they're hidden rather than shown with made-up prices.

## 2. Anthropic (the AI tutor and news summaries) — pay as you go

1. Go to **https://console.anthropic.com** → sign up.
2. **Settings → Billing**: add a payment method and buy a small amount of credit (for example $10). The API won't work without credit.
3. **Settings → Limits**: set a **monthly spend limit** there too (for example $25). This is a second safety net on top of the app's own budget.
4. **Settings → API Keys → Create Key**. Name it "northvale-learn" and copy it. It starts with `sk-ant-`, and it's shown only once.
5. In `.env`:

   ```
   ANTHROPIC_API_KEY=paste-it-here
   AI_MONTHLY_BUDGET_USD=25
   TUTOR_MODEL=claude-haiku-5-5
   ```

### Which model? (`TUTOR_MODEL`) — Haiku for the beta

These numbers come from the real size of what each question sends, at list prices. Simple mode costs less than Expert.

| Model | About per tutor answer | What $25 a month covers |
|---|---|---|
| `claude-haiku-5-5` (**default, beta**) | ~0.05¢ | ~40,000 answers |
| `claude-sonnet-5-5` | ~1¢ | ~2,500 answers |
| `claude-opus-5-5` (most capable) | ~2¢ | ~1,200 answers |

With Haiku, normal beta use (50 testers asking ~3 questions a day) is about **$3 a month**. Even if all 50 hit the 30-a-day limit every day, it would be ~$27, and the budget stops it at $25. News summaries add pennies. Switch to Sonnet later only if answers feel too shallow, and raise the budget when you do.

The app stops calling the AI once `AI_MONTHLY_BUDGET_USD` is spent. The tutor then falls back to the glossary, and news shows headlines only, until the next month. Each account also has limits:

- `TUTOR_DAILY_LIMIT` questions a day (default 30);
- `TUTOR_PER_MINUTE` questions a minute (default 5).

## 3. Check the AI before testers see it

With the key in `.env`, run:

```bash
node scripts/tutor-check.mjs --yes
```

It asks the tutor 10 everyday and tricky questions and checks that the answers:

- never say "buy this";
- flag scams;
- handle off-topic and harmful questions safely;
- stay short in Simple mode;
- answer in Spanish when asked in Spanish;
- tell a 15-year-old they need an adult to open a real account.

It prints every answer so you can read them too. With Haiku it costs about 1¢.

## 4. Password reset email (free: a dedicated Gmail)

Forgotten-password emails are sent from a Gmail account you control, through Google's servers. No other service or domain is needed, and the limit is about 500 emails a day.

1. Create a Gmail just for the app, for example `northvale.app@gmail.com`. It needs an adult as the account holder.
2. In that account: **Google Account → Security → 2-Step Verification**, and turn it on (app passwords need it).
3. **Google Account → Security → App passwords** (or search "App passwords"). Create one named "Northvale Learn" and copy the 16-character password.
4. In `.env`:

   ```
   SMTP_USER=northvale.app@gmail.com
   SMTP_PASS=the-16-character-app-password
   PUBLIC_URL=https://your-app.fly.dev
   CONTACT_EMAIL=northvale.app@gmail.com
   ```

**Without these:**

- Locally, the reset link is printed in the server's terminal, which is handy for testing.
- On the live site, "Forgot password?" is hidden and testers see "Write to `CONTACT_EMAIL`" instead.

`PUBLIC_URL` is the address the link opens. `CONTACT_EMAIL` is shown to testers who need help.

**The same Gmail also sends the weekly recap** that learners can turn on in Settings (Sunday evenings). It's off on the server until these settings are in, and locally the recap is printed in the terminal instead. At ~500 emails a day, Gmail covers a few hundred weekly recaps; past that, you'd move to an email service (that would be an account and possibly a cost, so ask first).

## 4b. Daily reminders (no key, no account)

Reminders need nothing from you: the server makes its own key pair (VAPID) the first time it starts and keeps it in its data file. Browsers' push services (Google, Apple, Mozilla, Microsoft) deliver them for free. Two things help:

- set `CONTACT_EMAIL` (or `PUBLIC_URL`): push services use it to reach you if something's wrong;
- keep the data file (and its backups): losing it means a new key, and everyone has to turn reminders on again.

To check them on a real phone: open the app, turn on reminders in Settings, then on `/admin` press **Send a test reminder to every device**. On an iPhone, add the app to the Home Screen first (Share → Add to Home Screen) and turn reminders on from there.

## 5. Other settings for the beta

```
ADMIN_TOKEN=          # 20+ random characters; opens /admin (stats, feedback, errors)
ALERT_WEBHOOK_URL=    # optional: a Discord or Slack webhook for "something broke" alerts
SIGNUP_CODE=          # optional: only people with this code can make accounts
CETES_RATE=           # optional: today's 28-day CETES rate from banxico.org.mx (e.g. 7.1)
CETES_RATE_DATE=      # the auction date for that rate
```

To make a random admin token:

```bash
node -e "console.log(require('crypto').randomBytes(24).toString('base64url'))"
```

Restart the server after changing `.env`.
