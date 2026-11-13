# The marketing kit

Everything for telling people about Northvale Learn, in English and Spanish. Honest on purpose: nothing here claims a user count, a review, a result or a feature that isn't real today.

**Who it speaks to:** young people whose lives cross the US–Mexico border (a student in Ciudad Juárez with family in El Paso, say). **Who the app is for:** everyone 13 and up. The landing page says both, in that order.

| What | Where |
|---|---|
| **Landing page** (English, Spanish) | `web/welcome.html`, `web/bienvenida.html`. One clear line at the top, the promise right under it, a section for the border and for everyone, and "Built by a student, for students" |
| **Flyer** (one page, with a QR code to the landing page) | `pdf/flyer-en.pdf`, `pdf/flyer-es.pdf` |
| **About sheet** (one page: what it is, who it's for, why it's different, the promise) | `pdf/about-en.pdf`, `pdf/about-es.pdf` |
| **Teacher message** (email and short chat message, with answers to their questions) | [teacher-message.md](teacher-message.md) |
| **Social plan** (15 posts for @northvalelearn, captions in both languages) | [social-plan.md](social-plan.md) |
| **Video script** (45 seconds, you record it) | [video-script.md](video-script.md) |
| The QR codes by themselves, to reuse on a poster or sticker | `pdf/qr-en.svg`, `pdf/qr-es.svg` |

## Before you use any of it (about 15 minutes)

1. **Add your first name to the landing pages.** Search both pages for `[Your first name]` and `[Tu nombre]` (in the "Built by a student, for students" section) and put in your **first name only**. Nothing else about you is needed: no last name, age, school or photo. You can also change the words around it to sound like you. `npm run preflight` won't pass until the brackets are gone.
2. **Decide the web address.** The QR codes point at your `PUBLIC_URL` (from `.env`), or `https://northvale-learn.fly.dev` until you've set one. If you buy your own domain (`northvalelearn.com` was free when we checked: `docs/BRAND-CHECK.md`), set `PUBLIC_URL` and rebuild the PDFs **before you print anything**:
   ```bash
   node docs/marketing/build.mjs
   ```
   Or for a one-off address: `node docs/marketing/build.mjs --url https://example.org`. It needs Chrome. On a Mac it also reads each QR code back with the Mac's own reader and stops if one doesn't say what it should.
3. **Print one copy and scan it** with two different phones before you print many. (The test only proves the code is right on screen. Printers and paper can still surprise you.)
4. **Claim `@northvalelearn`** on each app, so nobody else can.
5. **Fill the brackets** in the teacher message (`[Teacher's name]`, `[link]`, `[Your first name]`) when you send it.

The flyer is Letter size and prints fine on an ordinary printer: it leaves a white margin, so nothing is cut off.

## The rules (please keep them)

- **True today, or not at all.** No user counts, "trusted by", reviews, awards, "the best", or promised results. If you get real feedback, ask the person in writing before quoting them, and quote only their exact words.
- **The promise leads, and never changes:** *No ads. We never sell your data. Nobody pays us to recommend anything.* The test checks it appears word for word on both landing pages and both PDFs.
- **Never advice.** Nothing tells a person what to buy, sell or open. Every sheet says it's educational only.
- **You, kept small.** The story is "built by a student, for students". Your first name is the only personal detail the kit ever asks for.
- **Facts about money** (limits, rules, fees) get checked against the official source in the week you post them. The social plan says what to look at for each post.
- **Only the real app on screen** in any video or screenshot, with nothing real of anyone's in it.

## What's tested

`test/marketing.test.mjs` (part of `npm test`) checks: the QR encoder (and, on a Mac, that every code reads back exactly); that the flyer, one-pager and landing pages say the same lesson and unit counts as the app, and carry the promise and tagline word for word; that English and Spanish have the same parts; that nothing in anything publishable claims a count of people, a crowd, "the best" or a result; that the social plan has 15 posts with both captions and a "check first" line each; that the script is 30–60 seconds with a sensible number of spoken words; that the PDFs exist, are one page each, and were built from the current words (change `content.mjs` and forget to rebuild, and it fails).

## Files

- `content.mjs`: the words on the flyer and about sheet (English and Spanish)
- `build.mjs`: makes the four PDFs and the QR images, and checks them
- `lib/qr.mjs`: a small QR code maker (no outside library or website)
- `verify-qr.swift`: reads a QR image with the Mac's own detector (used by the build and the test)
- `pdf/`: the PDFs, the QR images, and `build.json` (which address and words they were built from)
