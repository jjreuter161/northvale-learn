# Putting Northvale Learn online for testers

## Where to host it

The server keeps its data in a file, so it needs a host with a **persistent disk**. That rules out free tiers that wipe the disk on every restart, such as Render's free tier. The options:

| Option | Cost | Effort | Notes |
|---|---|---|---|
| **Fly.io** (recommended) | about **$2–3/month** (one small machine + a 1 GB disk) | ~20 minutes | HTTPS and a real URL included (`https://<name>.fly.dev`), daily disk snapshots, logs. Needs a card. |
| Oracle Cloud "Always Free" VM | $0 | a few hours | Truly free and capable, but you run the Linux server yourself (HTTPS, updates, restarts). Needs a card to sign up. |
| Railway | ~$5/month | ~20 minutes | Similar to Fly; a bit pricier. |

**Recommendation:** Fly.io. A few dollars a month buys HTTPS, a URL, backups and no server maintenance, which matters more than $0 for a 20–50 person beta.

## Deploying to Fly.io (step by step)

You'll need the Fly account; I can't create it for you. Run these in Terminal from the project folder.

1. Install the Fly tool and sign up (this opens the browser; add a card when asked):

   ```bash
   brew install flyctl
   ```

   ```bash
   fly auth signup
   ```

2. Pick an app name, which becomes the URL. In `fly.toml`:
   - change `app = "northvale-learn"` to your name, if that one's taken;
   - set `ALLOWED_HOSTS` to the matching `<name>.fly.dev`;
   - pick `primary_region`: `dfw` (Dallas) is central to the US and Mexico, and `qro` is Querétaro, Mexico.

   Then create the app without deploying yet:

   ```bash
   fly launch --no-deploy --copy-config --name northvale-learn
   ```

3. Create the 1 GB data disk:

   ```bash
   fly volumes create northvale_data --size 1 --region dfw
   ```

4. Add the settings as **secrets**. They're encrypted on Fly and never in the code. Paste each value yourself:

   ```bash
   fly secrets set ADMIN_TOKEN="…" SIGNUP_CODE="…"
   ```

   ```bash
   fly secrets set ANTHROPIC_API_KEY="…" AI_MONTHLY_BUDGET_USD=25 TUTOR_MODEL=claude-haiku-5-5
   ```

   ```bash
   fly secrets set SMTP_USER="northvale.app@gmail.com" SMTP_PASS="…" PUBLIC_URL="https://<name>.fly.dev" CONTACT_EMAIL="northvale.app@gmail.com"
   ```

   ```bash
   fly secrets set TWELVEDATA_API_KEY="…"
   ```

   Optional: `ALERT_WEBHOOK_URL` (a Discord/Slack webhook) and `CETES_RATE`.

5. Deploy:

   ```bash
   fly deploy
   ```

6. Open `https://<name>.fly.dev` on your phone. Then:
   - the landing page to send people is `https://<name>.fly.dev/welcome` (Spanish: `/bienvenida`). Set `PUBLIC_URL` so its share previews (the picture and title when you paste the link in a chat) point to the right address;
   - check `https://<name>.fly.dev/admin` with your `ADMIN_TOKEN`;
   - run `fly logs` to watch the server.

**Updating later:** run `fly deploy` again. Your data stays on the disk.

## Backups

You get three layers:

1. **Fly disk snapshots.** Fly takes a daily snapshot of the disk; `fly.toml` keeps 14 days of them. To restore one:

   ```bash
   fly volumes snapshots list <volume-id>
   ```

   Then create a new volume from a snapshot.
2. **Daily copies in the app.** The server copies its data file to `/data/backups/` once a day and keeps the last 14.
3. **A copy on your computer** (do this weekly during the beta):

   ```bash
   fly ssh sftp get /data/learn.json ./backup-learn.json
   ```

## Knowing when something breaks

- **Errors from phones and from the server** appear on `/admin`, with counts.
- **Alerts** for new errors, AI spending at 80% and 100% of the budget, and failed backups go to your chat if you set `ALERT_WEBHOOK_URL`. In Discord: Server settings → Integrations → Webhooks → New webhook → copy URL.
- **Fly health checks** restart the app if `/healthz` stops answering.

## Installing on phones

Testers open the URL, then:

- **iPhone:** Share → **Add to Home Screen**;
- **Android:** ⋮ → **Install app**.

It opens full-screen with the Northvale icon. Once it has loaded, lessons, the practice portfolio (with sample prices) and the goal simulator also work offline, and progress syncs when the phone is back online. News and the AI tutor need a connection.

## A custom domain (optional)

To use a domain such as `learn.yourname.com`:

```bash
fly certs add learn.yourname.com
```

Then follow the DNS instructions it prints. Add the domain to `ALLOWED_HOSTS` too.
