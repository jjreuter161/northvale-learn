# Moving to Vercel + Supabase

The plan (decided 2026-11-11):
- **Testers start on Fly.io** (`docs/LAUNCH.md`).
- This branch, `vercel-supabase`, has everything needed to run on **Vercel** (the server) and **Supabase** (the database) instead.
- **After testers' first week**, we switch and move their data across.

## How it works

- **Vercel runs the server as one function** (`api/index.js`). `vercel.json` sends every address there, so the app, the pages and the API behave exactly as they do on Fly.io.
- **Supabase's Postgres holds the data.** When `DATABASE_URL` is set, the server keeps each record (one user, one learner's progress, one session…) as a row in the `northvale` schema. The schema has row-level security on, so Supabase's public API can't read it. Before each request the server loads what changed; after it, the server saves what it changed (`server/pgstore.js`).
- **Scheduled work** (reminders, recaps, the daily backup) runs when `/api/cron` is called with `CRON_SECRET`:
  - Supabase calls it every 15 minutes (`pg_cron`, set up by `npm run db:setup`);
  - Vercel Cron calls it once a day as a backup. That's the most the free Hobby plan allows.
- **Backups:** one copy a day goes in `northvale.backups`, and the last 14 are kept.
- **Without `DATABASE_URL`** nothing changes: the server keeps using its data file (Fly.io, your laptop, the tests).
- **Tests:** `npm test` runs the server tests twice, once with the file and once with a real Postgres (PGlite, inside the test), plus `test/pg.test.mjs` for two servers sharing one database.

## Before the launch on Fly.io: use your own domain

Learners without an account keep their progress **in the browser, tied to the web address**. If testers start on `northvale-learn.fly.dev` and we later move to a `…vercel.app` address, their progress stays behind (accounts are fine).

**So: buy `northvalelearn.com` before inviting testers,** and launch on it (`docs/LAUNCH.md`, step 4b). At the switch, only the domain's settings change and nobody notices.

## Your part (with a parent or guardian)

Each of these makes an account; nothing here costs money on the free plans.

1. **GitHub.** Finish signing in. The builder runs `gh auth login` in the Terminal panel. Press Enter, copy the code, sign in at github.com and click Authorize. The builder then makes a **private** repository and pushes the code.
2. **Supabase** (supabase.com):
   1. Sign up and make a project called `northvale-learn`, in a US region (East US).
   2. Make a strong database password and keep it in a password manager.
   3. **Connect**, then **Transaction pooler**: copy the address and put your password in it.
   4. Paste it into `.env` as `DATABASE_URL=` yourself. **Never paste it in a chat.**
   5. Add `CRON_SECRET=`: 32 random letters and digits (your password manager can make them).
3. **Vercel** (vercel.com):
   1. Sign up with your GitHub account (Hobby plan, free; its terms say Hobby is for non-commercial projects).
   2. **Add New, then Project**, and import `northvale-learn`.
   3. Before clicking Deploy, open **Build and Output Settings** and set **Output Directory** to `public`. That stops the `main` branch from publishing anything until the switch.
   4. Then **Settings, then Git, then Production Branch**: `vercel-supabase` (until the switch).
   5. **Settings, then Environment Variables**: add the same keys as `.env`. For each line below, type the name; you fill in the values yourself:
      - `DATABASE_URL`, `CRON_SECRET`
      - `PUBLIC_URL`: `https://northvalelearn.com` (or the `….vercel.app` address Vercel shows)
      - `ALLOWED_HOSTS`: `northvalelearn.com,www.northvalelearn.com,*.vercel.app`
      - `TRUST_PROXY`: `1`
      - and the same `ANTHROPIC_API_KEY`, `AI_MONTHLY_BUDGET_USD`, `ADMIN_TOKEN`, `TWELVEDATA_API_KEY`, `SMTP_USER`, `SMTP_PASS`, `CONTACT_EMAIL` as on Fly.io.
4. Tell the builder **"Supabase and Vercel are set up"**. The builder then:
   - runs `npm run db:setup` (it makes the tables and schedules the 15-minute call; it never shows your keys);
   - checks a preview deployment end to end: sign up, a lesson, sync on a second device, the tutor, a reminder.

## The switch (after testers' first week)

1. Merge the week's work into `main`, then this branch into `main`.
2. **Move the data:** copy the file off Fly.io (`fly ssh sftp get /data/learn.json learn-from-fly.json`), then run `npm run db:move -- learn-from-fly.json`. It refuses to overwrite data that's already in Supabase, and checks that every record arrived.
3. In Vercel, set the **Production Branch** back to `main` and redeploy.
4. Point `northvalelearn.com` at Vercel: **Vercel, then Settings, then Domains, then Add**, then update the domain's DNS as Vercel shows. HTTPS is automatic.
5. Check the live app, then stop the Fly.io app (`fly scale count 0`). Keep it for a week before deleting it.

## Limits to know

- **Vercel Hobby** allows scheduled jobs once a day only. That's why Supabase makes the 15-minute call.
- **Vercel functions** stop after 60 seconds (`vercel.json`). A tutor answer takes a few seconds.
- **Supabase's free plan pauses a project after a week with no activity,** and has no downloadable backups. Our own daily copy goes in `northvale.backups`. Before the public launch, consider Supabase's paid plan (about $25 a month) for its daily backups.
- **Rate limits** (tutor questions per minute, sign-in attempts) live in each running copy's memory, so they're a little looser when several copies run.
- Check current plans and prices on vercel.com/pricing and supabase.com/pricing.
