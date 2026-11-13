# Launch kit: Northvale Learn's first testers

Everything for launch day, in order.
- **Part 1** is yours. Do it with a parent or guardian: about an hour.
- **Part 2** is what the builder does once you say **"Setup is done, go ahead and deploy."**
- **Parts 3 and 4** are for inviting testers and for the first week.

> **Keys stay in `.env`.** Never paste a key, password or the admin token into a chat, an email or a screenshot, even to the builder. The builder never needs to see them: the checks below say only whether each one is there.

## What it costs

| Service | Cost | Who holds the account |
|---|---|---|
| Fly.io (hosting) | about **$2–3 a month**. Needs a card. | a parent or guardian (18+) |
| Anthropic (the AI tutor) | pay as you go. You set a monthly cap (25 dollars to start). With Haiku, an answer costs about 0.05¢, so 10 testers use a dollar or two a month. You buy credit first (at least $5). | a parent or guardian (18+) |
| Gmail for the app | free | a parent or guardian, or you with their OK |
| Twelve Data (real delayed prices) | free plan; optional | anyone |
| A web address | none needed: the app gets `https://<name>.fly.dev` | — |
| Your own domain (optional) | about **$10–15 a year** for `northvalelearn.com`. Fly.io sets up the HTTPS certificate; check fly.io's pricing page for its current cost before adding it. | a parent or guardian (18+) |

Nothing else costs money. Nothing is charged automatically beyond Fly.io's small monthly bill and the AI credit you choose to buy.

---

## Part 1 — what you do (with a parent or guardian)

A guided checklist. Tick each box as you go. Total time: about an hour, most of it waiting for emails and sign-up pages. **Two commands do the hard parts**: `npm run setup` asks for each key and tries it for you the moment you type it, and `npm run ready` tells you when everything is done.

> **Never paste a key into a chat, an email or a screenshot.** You type keys only into your own Terminal (hidden), and they're saved in `.env` on your computer.

### Before you start: have these ready

- [ ] A parent or guardian next to you (they hold the accounts that need a card)
- [ ] About an hour
- [ ] A note file open, only for the 16-letter Gmail password and the Anthropic key, until you've typed them into `npm run setup`. Delete the note after.

### Step 1. A Gmail just for the app (free, about 10 minutes)

It sends password-reset links, the "confirm your email" link for teachers, waitlist confirmations and the weekly recap.

- [ ] Open **gmail.com**, click **Create account → For my personal use**, and make one, for example `northvale.learn.app@gmail.com`.
- [ ] Click your picture (top right) → **Manage your Google Account** → **Security** (left side).
- [ ] Under "How you sign in to Google", click **2-Step Verification** → **Get started**, and finish turning it on.
- [ ] Back on the **Security** page, use the search box at the top and type **App passwords**. Open it, type the name **Northvale Learn**, click **Create**.
- [ ] Google shows 16 letters in a yellow box. **Copy them into your note.** (If you can't find "App passwords", 2-Step Verification isn't on yet.)

More detail: [SETUP-KEYS.md §4](SETUP-KEYS.md).

### Step 2. The Anthropic key (the AI tutor)

The adult does the sign-up and the card.

- [ ] Open **console.anthropic.com** and click **Sign up** (or **Log in**).
- [ ] Left menu → **Billing** → **Add credit** (or **Buy credits**): $5–10 is plenty to start.
- [ ] Left menu → **Limits** (or **Billing → Limits**) → set a **monthly spend limit**, for example **$25**. This is a second safety cap on top of the app's own.
- [ ] Left menu → **API keys** → **Create key**. Name it **Northvale Learn** and copy the key into your note (it starts with `sk-ant-`). Anthropic shows it only once.

### Step 3. Twelve Data (optional, free)

Without it the practice portfolio uses clearly labeled sample prices, which is fine for the beta. Skip this if you're short on time.

- [ ] Open **twelvedata.com** → **Sign up** (the free plan).
- [ ] In the **Dashboard**, find **API key** and copy it into your note.

### Step 4. Fly.io (hosting)

- [ ] In Terminal, in the project folder:

  ```bash
  brew install flyctl
  ```

- [ ] Then:

  ```bash
  fly auth signup
  ```

  A browser page opens. The adult creates the account and adds the card there (about $2–3 a month).
- [ ] **The app's name** becomes its address: `https://northvale-learn.fly.dev`. If you want a different name, tell the builder now, because it has to match in a few files.

**Optional: your own domain.** If you'd like testers to see `northvalelearn.com`, the adult buys it at any registrar (Cloudflare, Porkbun, Namecheap, GoDaddy). At deploy time the builder will tell you exactly which two or three records to add. **Decide before inviting testers**: each phone keeps a tester's progress under the address they first used, so a tester without an account would start over if the address changed later. A domain is recommended because we plan to move to Vercel + Supabase after the first week (`docs/VERCEL-SUPABASE.md`); with your own domain the address never changes.

### Step 5. Fill in `.env` with the wizard

- [ ] In Terminal, in the project folder:

  ```bash
  npm run setup
  ```

  It has six short steps. For each key it **tries it right away** (free: it lists AI models, gets one price, and signs in to Gmail without sending anything) and tells you in plain words if something's wrong, so a typo is fixed on the spot:

  | Step | It asks for | What to type |
  |---|---|---|
  | 1 | Gmail address, then the app password | from step 1 (spaces don't matter). Then a contact email: Enter keeps the Gmail. |
  | 2 | Anthropic API key, then the monthly budget | from step 2; for the budget, `25` |
  | 3 | Twelve Data API key | from step 3, or Enter to skip |
  | 4 | The web address | Enter, to keep `https://northvale-learn.fly.dev` |
  | 5 | Invite code | a word only your testers will know, like `NORTHSTAR` (or Enter for none) |
  | 6 | (nothing) | it makes the admin token for you |

  Your typing is hidden, and nothing is ever printed back. At the end it says **"Everything needed is there"** or lists, by name, what's still missing (run it again when you have it; what you typed is kept).
- [ ] Delete your note with the keys.

### Step 6. Your name and contact in the legal drafts

- [ ] Open these four files and replace each **[bracketed blank]** that asks for a name or contact:
  - `docs/legal/privacy.en.md`: your name or company, an address, and the contact email, in 3 places;
  - `docs/legal/privacy.es.md`: the same, in Spanish;
  - `docs/legal/terms.en.md` and `docs/legal/terms.es.md`: your name or company, and the email.
- [ ] If you're under 18, decide with your parent or guardian whose name goes there: often the adult's. Leave the **[Lawyer: …]** notes as they are. They're fine for a beta and get answered before a public launch.
- [ ] Save the change in git:

  ```bash
  git add docs/legal
  ```

  ```bash
  git commit -m "Contact details in the legal drafts"
  ```

### Step 7. One command: are you ready?

- [ ] In Terminal:

  ```bash
  npm run ready
  ```

  It tries every key for real, then runs the full launch checklist (about 6 minutes, because the tests click through the app in a browser). You want the big box that says **"You're ready to deploy."** If it says **"Not yet"**, the lines marked ✗ say exactly what to fix; then run it again. (`npm run ready -- --quick` skips the tests, for a fast look at just the keys and settings.) It never shows a key.

### Step 8. Tell the builder

- [ ] Send this message:

  > **Setup is done, go ahead and deploy.**

That message is also your OK for:
- the Fly.io charges (about $2–3 a month);
- the AI safety check (a few cents).

---

## Part 2 — what the builder does once you say go

The builder works in your Terminal, signed in to your Fly.io account. Your keys are never shown.

1. **Preflight again**, so everything passes on the code that goes live, then **`npm run deploy:dry-run`**: it does what the Dockerfile does, in a clean folder, starts the result in production mode and checks it serves (17 checks, about 10 seconds). You don't need Docker on your computer: `fly deploy` uploads the project to one of Fly's own build machines, which builds the Dockerfile there.
2. **Create the app and its disk:**
   - `fly launch --no-deploy --copy-config --name northvale-learn`;
   - `fly volumes create northvale_data --size 1 --region dfw`. That's 1 GB, with daily snapshots kept 14 days.
3. **Hand the settings to Fly as secrets**, straight from `.env`: `fly secrets import`. They're encrypted on Fly and never in the code or the logs.
4. **Deploy:** `fly deploy`.
   - **Optional, if you bought a domain (step 4b): your own address with HTTPS.**
     1. `fly certs add northvalelearn.com` and `fly certs add www.northvalelearn.com`. Fly sets up HTTPS certificates for both (see the costs table).
     2. `fly ips list` (or `fly certs setup northvalelearn.com`) shows the DNS records. You add them at the registrar: an **A** record and an **AAAA** record for `northvalelearn.com` with the app's IPv4 and IPv6 addresses, and a **CNAME** record for `www` pointing to `northvale-learn.fly.dev`.
     3. `fly certs check northvalelearn.com` until it says the certificate is issued (minutes, sometimes up to an hour).
     4. The builder adds both names to `ALLOWED_HOSTS` in `fly.toml`: `"northvale-learn.fly.dev,northvalelearn.com,www.northvalelearn.com"`. Without this, the server refuses the new address ("Unknown host").
     5. `fly secrets set PUBLIC_URL=https://northvalelearn.com`, so emails, share previews and invite links use the new address. Then `fly deploy` again.
     6. The live checks below run on `https://northvalelearn.com`. The `fly.dev` address keeps working too.
5. **Live checks**, each one reported back as passed or failed:
   - the health check `/healthz`;
   - the landing pages `/welcome` and `/bienvenida`;
   - the app's first five minutes on a phone-sized screen, in English and Spanish;
   - making an account with the invite code, and that one without the code is refused;
   - password reset: the email arrives at the app's Gmail;
   - `/admin` opens with the token, the **classroom switch is off for everyone**, the AI is on with your cap, and price data is coming in;
   - the waitlist accepts a sign-up and the CSV downloads; under 13 is refused;
   - the data disk is mounted, and a snapshot appears the next day.
6. **The AI safety check:** `node scripts/tutor-check.mjs --yes`. It asks the real tutor 20 everyday and tricky questions, checks the answers, and prints them for you to read. That includes no "buy this", flagging scams, safe handling of harmful and off-topic questions, money stress, follow-ups that need the previous answer (in English and Spanish), Expert depth, and telling a 15-year-old to involve an adult. It costs about 2¢.
7. **Things only you can check, on your phone** (the builder walks you through them):
   - paste `/welcome` into a chat and see the preview card;
   - add the app to your Home Screen;
   - turn on reminders, then press **Send a test reminder** on `/admin`.
8. **The report:** the links, what passed, and anything to fix.

Updating later is the same: the builder runs `fly deploy`, and the data stays on the disk.

**Each new release** (the builder's checklist):
1. Bump the version in `package.json` (`npm version x.y.z --no-git-tag-version`) and `VERSION` in `src/core/errors.jsx` (npm test checks they match).
2. Add the release to `CHANGELOG.md`, and a note at the top of `NOTES` in `src/core/whatsnew.jsx` (people from the last version see it once on Today).
3. Change `CACHE` in `web/sw.js` (so phones drop the last release's offline files).
4. If any fact changed: `src/core/facts.js`, then `node scripts/verify-list.mjs` (npm test names any lesson to rewrite).
5. `npm run preflight`, `npm run deploy:dry-run`, then commit, tag (`git tag vx.y.z`), push, and `fly deploy`.

---

## Part 3 — inviting testers

**Start with about 10 people you know:**
- a mix of ages;
- at least 3 Spanish speakers;
- anyone 13–17 only with a parent's or guardian's OK in writing first (a text message is fine; the note below).

Wait a week before inviting more. Send the landing page (`/welcome`) to people you don't know; they land on the waitlist, which `/admin` shows.

### Invite message (English)

> Hey! I'm building **Northvale Learn**, an app that teaches money in about 5 minutes a day, with pretend money only. Could you try it for one week and tell me what you think?
>
> 👉 https://northvale-learn.fly.dev  (invite code if you make an account: **[CODE]**)
>
> On your phone: open the link → Share → "Add to Home Screen". There's a "Send feedback" button at the bottom of every screen, and the flag icon in a lesson reports that exact step. Honest is the most helpful — it's okay to say something is boring or confusing!

### Mensaje de invitación (español)

> ¡Hola! Estoy creando **Northvale Learn**, una app que enseña de dinero en unos 5 minutos al día, solo con dinero de práctica. ¿Me ayudas a probarla una semana y me dices qué opinas?
>
> 👉 https://northvale-learn.fly.dev  (código de invitación si creas una cuenta: **[CÓDIGO]**)
>
> En tu celular: abre el enlace → Compartir → "Agregar a inicio". Hay un botón de "Enviar comentarios" al final de cada pantalla, y la bandera en una lección reporta ese paso exacto. Lo que más ayuda es la honestidad: ¡está bien decir que algo es aburrido o confuso!

### For parents of testers under 18 (to forward)

> [Your name] invited your teen to test **Northvale Learn** for one week. It's an educational app about money. It uses only pretend money, gives no financial advice, has no ads and doesn't sell data. An account asks only for an email, a nickname and an age range, and teens are only in leagues with other teens. The privacy policy is in the app under Settings → Legal. Is it okay for them to join?

> [Tu nombre] invitó a tu hijo o hija a probar **Northvale Learn** durante una semana. Es una app educativa sobre dinero. Solo usa dinero de práctica, no da asesoría financiera, no tiene anuncios y no vende datos. Una cuenta pide solo un correo, un apodo y un rango de edad, y los adolescentes solo compiten con otros adolescentes. El aviso de privacidad está en la app, en Ajustes → Legal. ¿Está bien que participe?

### After one week: what to ask (5 minutes)

| English | Español |
|---|---|
| 1. How would you feel if you could no longer use Northvale? (Very / Somewhat / Not disappointed) | 1. ¿Cómo te sentirías si ya no pudieras usar Northvale? (Muy / Algo / Nada decepcionado o decepcionada) |
| 2. What's the main benefit you get from it? | 2. ¿Cuál es el principal beneficio que te da? |
| 3. What kind of person would benefit most from it? | 3. ¿Qué tipo de persona crees que aprovecharía más la app? |
| 4. How can we improve it for you? | 4. ¿Cómo podemos mejorarla para ti? |
| 5. What almost made you stop using it? | 5. ¿Qué casi hizo que dejaras de usarla? |
| 6. Was anything confusing or wrong (lessons, portfolio, tutor)? | 6. ¿Algo te confundió o estaba mal (lecciones, portafolio, tutor)? |
| 7. Did you use the AI tutor? Did it ever say something odd? | 7. ¿Usaste el tutor con IA? ¿Alguna vez dijo algo raro? |
| 8. Would you tell a friend about it? Why or why not? | 8. ¿Se la recomendarías a alguien? ¿Por qué sí o por qué no? |

Questions 1–4 are the standard "would you miss it" survey. Read question 2's answers from the people who said "very disappointed" closely: that's what to build more of.

---

## Part 4 — the first week on /admin

Open `https://northvale-learn.fly.dev/admin` with the admin token. Spend 5 minutes a day. The page opens on **"First week of the beta"**: testers, next-day and day-7 return, "very disappointed", 3+ lessons, and this week's feedback and errors, each with a plain verdict against the targets below ("On track", "Watch it", "Needs work", or "Not enough people yet" under 5).

### Every day

- **Errors** (bottom of the page). Anything new or repeating → tell the builder that day.
- **Feedback.** Read all of it. Bugs → tell the builder; ideas → write them down for after the week.
- **Where people stop inside a lesson.** A step where several people stop is the first thing to rewrite.
- **AI spending.** It should be a few cents a day. The AI pauses by itself at the cap.
- **Active today**, and the **Waitlist** if you shared `/welcome`.

### What "this is working" looks like

Rough targets for a first beta of 10–50 people (the same as [BETA.md](BETA.md)):

| Number on /admin | Working | Needs attention |
|---|---|---|
| Day-1 return | **30%+** (50%+ is great for friends and family) | under 20%: the first lesson or the hook |
| Day-7 return | **15%+** | under 10% |
| Lessons per learner (median) | **5+** in the first week | 1–2: people try once and leave |
| "Very disappointed" | **40%+** (needs 10+ answers) | under 25%: ask the "somewhat" group what would make it a must-have |
| Errors | none repeating | the same error again and again |

Small numbers swing a lot: with 10 people, one person is 10%. Read them together with the feedback.

### The rule for this week

**No new features until testers have used the app for at least a week.** Fix bugs and confusing wording only. After the week, the builder helps sort the feedback into the 3 biggest problems, and you decide what's next. Phase 7 (experiments and measurement) waits until then.
