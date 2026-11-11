// Milestone 4.5 ("Fun, but professional") mockups: quick HTML prototypes
// of the key moments (not the app), photographed at phone size, in the
// approved clarity look. Content is the app's real course where possible.
//   node docs/design/fun/mockups.mjs   → docs/design/fun/*.png + mockups.html
import { ic, header, tabs, row, qbar, render } from "../kit.mjs";

const DIR = import.meta.dirname;
const phone = (inner, dark) => `<div class="phone ${dark ? "dark" : ""}">${inner}</div>`;
const bottom = (inner) => `<div style="position:absolute;left:16px;right:16px;bottom:30px">${inner}</div>`;

// A small growth chart: the money put in (grey) and what it grew to (navy),
// with the learner's guess marked.
const growth = (guessX) => `<svg viewBox="0 0 340 130" width="100%" height="130">
  <line x1="0" y1="120" x2="340" y2="120" stroke="var(--line)"/>
  <path d="M0 120 L340 50" stroke="var(--low)" stroke-width="2" stroke-dasharray="5 4" fill="none"/>
  <path d="M0 120 C120 100 230 70 340 22" stroke="var(--navy)" stroke-width="3" fill="none"/>
  <circle cx="340" cy="22" r="5" fill="var(--navy)"/>
  <line x1="0" y1="${guessX}" x2="340" y2="${guessX}" stroke="var(--navy)" stroke-width="1" stroke-dasharray="2 4" opacity=".6"/>
  <text x="2" y="${guessX - 6}" font-size="12" fill="var(--mid)" font-family="Inter">Your guess</text>
</svg>`;

const finish = (dark) =>
  phone(
    `<div style="padding:70px 22px 0;text-align:center">
  <div style="position:relative;width:148px;height:148px;margin:0 auto">
    <svg width="148" height="148" viewBox="0 0 148 148"><circle cx="74" cy="74" r="64" stroke="var(--surface2)" stroke-width="8" fill="none"/><circle cx="74" cy="74" r="64" stroke="var(--navy)" stroke-width="8" fill="none" stroke-linecap="round" stroke-dasharray="402" stroke-dashoffset="100" transform="rotate(-90 74 74)"/></svg>
    <div style="position:absolute;inset:0;display:flex;flex-direction:column;align-items:center;justify-content:center"><div style="font-size:34px;font-weight:750;letter-spacing:-.8px">+15</div><div class="meta" style="margin-top:-2px">XP</div></div>
  </div>
  <div class="meta" style="margin-top:10px">15 of 20 XP today · 6-day streak</div>
  <h1 style="margin:22px 0 4px;font-size:28px">Lesson complete</h1>
  <div class="meta" style="font-size:16px">Pay yourself first</div>
  <div class="card" style="text-align:left;margin-top:22px"><div class="label">In real life</div><div style="font-size:16px">Next payday, move your savings first, before anything else gets a chance at it.</div></div>
  <div style="display:flex;align-items:center;gap:8px;justify-content:center;margin-top:14px;font-size:14px;color:var(--mid)">${ic("star", 16, "var(--navy)")} Getting solid: Paying yourself first</div>
</div>${bottom(`<div class="btn">Next: Emergency fund</div><div class="btn sec" style="margin-top:10px">Done</div>`)}`,
    dark
  );

const today = (lang, myth) =>
  phone(`${header()}<div class="body">
  <div class="date">${lang === "es" ? "Martes, 10 de noviembre" : "Tuesday, November 10"}</div><h1>${lang === "es" ? "Hoy" : "Today"}</h1>
  <div class="card" style="padding:20px"><div class="eyebrow">${lang === "es" ? "Unidad 6 · Fraudes y estafas" : "Unit 6 · Scams and fraud"}</div><div style="font-size:24px;font-weight:750;letter-spacing:-.4px;margin:4px 0 2px">${lang === "es" ? "Inversiones falsas" : "Fake investments"}</div><div class="meta">${lang === "es" ? "Lección 2 de 4 · 3 min" : "Lesson 2 of 4 · 3 min"}</div>
  <div class="btn" style="margin-top:16px">${lang === "es" ? "Continuar" : "Continue"}</div></div>
  <div class="rows">${row("flame", lang === "es" ? "Racha de 6 días" : "6-day streak", lang === "es" ? "Listo por hoy" : "Done for today", false)}${row("refresh", lang === "es" ? "Repaso" : "Review", lang === "es" ? "3 ideas para refrescar · 2 min" : "3 ideas to refresh · 2 min")}</div>
  ${myth}
  </div>${tabs(0, lang)}`);

const mythAsk = `<div class="card" style="margin-top:12px"><div class="label">Myth or fact?</div><div style="font-size:19px;font-weight:700;line-height:1.35;margin-bottom:14px">“Checking your own credit score lowers it.”</div>
  <div style="display:flex;gap:10px"><div class="btn sec" style="flex:1;height:46px">Myth</div><div class="btn sec" style="flex:1;height:46px">Fact</div></div><div class="fine" style="margin-top:10px">15 seconds · +2 XP</div></div>`;
const mythEs = `<div class="card" style="margin-top:12px"><div class="label">¿Mito o realidad?</div><div style="font-size:17px;font-weight:700;line-height:1.35">“Revisar tu reporte de Buró de Crédito baja tu calificación.”</div>
  <div style="display:flex;align-items:center;gap:8px;margin-top:12px;font-weight:750;color:var(--right)">${ic("check", 18, "var(--right)")} Mito</div>
  <div style="font-size:15px;margin-top:4px">Consultar tu propio reporte no afecta tu historial. Lo que sí cuenta es pagar a tiempo.</div><div class="fine" style="margin-top:8px">+2 XP · Mañana hay otro</div></div>`;

const screens = {
  // ---- Step 2: new kinds of questions -----------------------------------
  "1-order": phone(`${qbar(30)}<div class="body" style="padding-top:12px">
  <div class="label">Put in order</div><div class="q">Order these from safest to riskiest.</div>
  <div class="opt sel"><span class="num on">1</span>Savings account</div>
  <div class="opt sel"><span class="num on">2</span>Treasury bills</div>
  <div class="opt"><span class="num"></span>Index fund</div>
  <div class="opt"><span class="num"></span>One company's stock</div>
  <div class="opt"><span class="num"></span>A new cryptocurrency</div>
  <p class="fine" style="margin-top:6px">Tap them in order. Tap again to undo.</p></div>${bottom(`<div class="btn off">Check</div>`)}`),

  "2-estimate": phone(`${qbar(55)}<div class="body" style="padding-top:12px">
  <div class="label">Estimate</div><div class="q" style="font-size:21px">You invest $100 a month for 10 years at an example 7% a year. About how much do you end up with?</div>
  <div class="card" style="padding:16px 16px 10px">${growth(66)}
  <div style="display:flex;justify-content:space-between;font-size:14px;margin-top:6px"><span class="meta">You put in</span><b>$12,000</b></div>
  <div style="display:flex;justify-content:space-between;font-size:14px;margin-top:2px"><span class="meta">Your guess</span><b>$15,000</b></div>
  <div style="display:flex;justify-content:space-between;font-size:16px;margin-top:2px"><span style="color:var(--navy);font-weight:650">It grows to about</span><b style="color:var(--navy)">$17,300</b></div></div></div>
  <div class="feedback"><div class="fb-head fb-near">${ic("check", 20, "var(--navy)")} Close: within 15%</div><div style="font-size:15px">$5,300 of it is growth you never paid in. Most of that comes in the last few years, which is why starting early matters.</div><div class="btn" style="margin-top:14px">Continue</div></div>`),

  "3-match": phone(`${qbar(40)}<div class="body" style="padding-top:12px">
  <div class="label">Match the pairs</div><div class="q">Match each word to what it means.</div>
  <div style="display:grid;grid-template-columns:1fr 1.5fr;gap:10px">
    <div class="opt right" style="margin:0;justify-content:center">${ic("check", 16, "var(--right)")} APR</div><div class="opt right" style="margin:0;font-size:14px">The yearly cost of borrowing</div>
    <div class="opt sel" style="margin:0;justify-content:center">Index fund</div><div class="opt" style="margin:0;font-size:14px">Money kept only for surprises</div>
    <div class="opt" style="margin:0;justify-content:center">Emergency fund</div><div class="opt" style="margin:0;font-size:14px">A basket of many companies</div>
    <div class="opt" style="margin:0;justify-content:center">Credit score</div><div class="opt" style="margin:0;font-size:14px">How you've handled borrowing</div>
  </div><p class="fine" style="margin-top:12px">Tap a word, then its meaning.</p></div>`),

  "4-number": phone(`${qbar(70)}<div class="body" style="padding-top:12px">
  <div class="label">Work it out</div><div class="q">Your paycheck is $600. You save 20% of it first. How much do you save?</div>
  <div style="display:flex;align-items:center;gap:8px;border:2px solid var(--right);background:var(--rightSoft);border-radius:14px;padding:12px 16px;font-size:26px;font-weight:750"><span class="meta" style="font-size:24px">$</span>120</div></div>
  <div class="feedback"><div class="fb-head fb-right">${ic("check", 20, "var(--right)")} Right</div>
  <div style="font-size:15px;line-height:1.6"><div>20% is 20 out of every 100, or 0.20.</div><div>0.20 × $600 = <b>$120</b> saved, $480 to spend.</div></div><div class="btn" style="margin-top:14px">Continue</div></div>`),

  "5-spot": phone(`${qbar(60)}<div class="body" style="padding-top:12px">
  <div class="label">Spot the problem</div><div class="q" style="font-size:21px">This text just arrived. Tap the two biggest red flags.</div>
  <div class="card" style="padding:14px"><div class="meta" style="font-size:13px;margin-bottom:8px">Text message · +1 (555) 013-2291</div>
  <div style="background:var(--bg);border-radius:16px 16px 16px 4px;padding:12px 14px;font-size:16px;line-height:1.7">YourBank: Your account is <u style="text-decoration-color:var(--line)">LOCKED</u>. <mark style="background:var(--warnSoft);border:2px solid var(--warn);border-radius:6px;padding:0 3px">Verify within 1 hour</mark> at <mark style="background:var(--warnSoft);border:2px solid var(--warn);border-radius:6px;padding:0 3px">yourbank-secure-login.co</mark> or it will be closed.</div></div></div>
  <div class="feedback"><div class="fb-head fb-right">${ic("check", 20, "var(--right)")} You found both</div><div style="font-size:15px"><b>The link</b> isn't your bank's real address, and <b>the 1-hour deadline</b> is there to rush you. A real bank never asks you to verify through a text link. Open your bank's app instead.</div><div class="btn" style="margin-top:14px">Continue</div></div>`),

  "6-choice": phone(`${qbar(85)}<div class="body" style="padding-top:12px">
  <div class="label">Real-life choice</div><div class="q" style="font-size:21px">You get $400 for your birthday. You have no emergency fund yet, and you've wanted $150 headphones. What would you do?</div>
  <div class="opt dim" style="font-size:15px">Save all $400</div>
  <div class="opt right" style="font-size:15px">${ic("check", 18, "var(--right)")} Buy the headphones, save $250</div>
  <div class="opt dim" style="font-size:15px">Invest all $400 in an index fund</div></div>
  <div class="feedback"><div class="fb-head fb-right">${ic("check", 20, "var(--right)")} A good fit</div>
  <div style="font-size:14px;line-height:1.5"><div><b>Headphones + $250:</b> you enjoy some now and still start the cushion.</div><div style="margin-top:4px"><b>Save it all:</b> also smart; the safest choice.</div><div style="margin-top:4px"><b>Invest it all:</b> it can grow, but could be down the day you need it.</div></div><div class="btn" style="margin-top:12px">Continue</div></div>`),

  // ---- Step 3: moments that feel good ------------------------------------
  "7-finish": finish(false),

  "8-milestone-streak": phone(`<div style="padding:120px 28px 0;text-align:center">
  <div style="position:relative;width:180px;height:180px;margin:0 auto">
    <svg width="180" height="180" viewBox="0 0 180 180"><circle cx="90" cy="90" r="80" stroke="var(--navy)" stroke-width="3" fill="none"/></svg>
    <div style="position:absolute;inset:0;display:flex;align-items:center;justify-content:center;font-size:84px;font-weight:750;letter-spacing:-3px;color:var(--navy)">7</div></div>
  <div style="display:flex;gap:8px;justify-content:center;margin-top:22px">${Array.from({ length: 7 }, () => `<span style="width:10px;height:10px;border-radius:5px;background:var(--navy)"></span>`).join("")}</div>
  <h1 style="margin:28px 0 8px">A week, every day.</h1><p style="font-size:17px;color:var(--mid)">Seven days in a row. This is about where habits start.</p></div>
  ${bottom(`<div class="btn sec">${ic("share", 18)} Share</div><div class="btn" style="margin-top:10px">Continue</div>`)}`),

  "9-milestone-unit": phone(`<div style="padding:120px 28px 0;text-align:center">
  <span style="width:84px;height:84px;border-radius:24px;background:var(--navySoft);color:var(--navy);display:inline-flex;align-items:center;justify-content:center">${ic("shield", 42)}</span>
  <div class="eyebrow" style="margin-top:26px">Unit 6 of 17 · complete</div>
  <h1 style="margin:6px 0 8px">Scams and fraud</h1><p style="font-size:17px;color:var(--mid)">You can now spot phishing, fake investments and pyramid schemes, and lock down your accounts. Most adults never learned this.</p>
  <div class="card" style="margin-top:24px;display:flex;justify-content:space-around;text-align:center"><div><div style="font-size:22px;font-weight:750">4</div><div class="meta">lessons</div></div><div><div style="font-size:22px;font-weight:750">92%</div><div class="meta">right</div></div><div><div style="font-size:22px;font-weight:750">3</div><div class="meta">ideas solid</div></div></div></div>
  ${bottom(`<div class="btn sec">${ic("share", 18)} Share</div><div class="btn" style="margin-top:10px">Continue</div>`)}`),

  "10-reminder-and-settings": phone(`<div style="background:linear-gradient(#cfd6df,#e3e7ec);height:372px;padding:50px 14px 0">
  <div style="text-align:center;font-size:52px;font-weight:300;color:#1f2328;letter-spacing:-1px">6:00</div>
  <div style="background:rgba(255,255,255,.82);border-radius:18px;padding:12px 14px;margin-top:22px;font-size:14px"><div style="display:flex;justify-content:space-between;color:#5b6573;font-size:12px;font-weight:600"><span>NORTHVALE LEARN</span><span>now</span></div><div style="font-weight:700;margin-top:2px">Your 12-day streak is still on</div><div>One 3-minute lesson keeps it that way. It's not asking for much.</div></div>
  <div style="background:rgba(255,255,255,.82);border-radius:18px;padding:12px 14px;margin-top:8px;font-size:14px"><div style="display:flex;justify-content:space-between;color:#5b6573;font-size:12px;font-weight:600"><span>NORTHVALE LEARN</span><span>now</span></div><div style="font-weight:700;margin-top:2px">Tu racha de 12 días sigue en pie</div><div>Una lección de 3 minutos la mantiene. No pide mucho.</div></div></div>
  <div class="body" style="padding-top:18px"><div style="font-size:18px;font-weight:700;margin-bottom:10px">Sound and touch</div>
  <div class="rows" style="margin-top:0">
  <div class="row"><div class="x"><div class="t">Sounds</div><div class="s">A soft tone for right answers and finishes</div></div><span class="switch"></span></div>
  <div class="row"><div class="x"><div class="t">Vibration</div><div class="s">A light tap on right answers (Android; iPhones don't allow it for web apps)</div></div><span class="switch on"></span></div>
  <div class="row"><div class="x"><div class="t">Reduce motion</div><div class="s">No animations, anywhere</div></div><span class="switch"></span></div></div></div>`),

  // ---- Step 5: small daily hooks ------------------------------------------
  "11-today-myth": today("en", mythAsk),
  "12-today-myth-es": today("es", mythEs),

  "13-money-week": phone(`${header()}<div class="scrim"></div><div class="sheet" style="top:70px">
  <div class="grab"></div><div class="eyebrow">Nov 2 – 8</div><div style="font-size:24px;font-weight:750;letter-spacing:-.4px;margin:2px 0 14px">Your money week</div>
  <div class="rows" style="margin-top:0">
  ${row("book", "You learned", "4 lessons, mostly Scams and fraud", false)}
  ${row("star", "Now solid", "Spotting phishing", false)}
  ${row("flame", "6-day streak", "Your best so far", false)}
  ${row("car", "Car: $950 → $1,000", "20% of the way there", false)}</div>
  <div class="card" style="margin-top:12px;background:var(--navySoft)"><div class="label" style="color:var(--navy)">For next week</div><div style="font-size:16px">Two lessons finish Scams and fraud. Then Compound interest, the one that makes the car fund grow.</div></div>
  <div style="font-weight:650;margin:18px 0 10px">Did you set anything aside this week?</div>
  <div style="display:flex;gap:10px"><div class="btn" style="flex:1;height:48px;font-size:16px">Yes, record it</div><div class="btn sec" style="flex:1;height:48px;font-size:16px">Not this week</div></div></div>`),

  "14-real-cost": phone(`${header("Practice")}<div class="body">
  <div class="card"><div class="label">The real cost</div><div style="font-size:19px;font-weight:700;line-height:1.35">Small daily things add up. Pick one.</div>
  <div style="display:flex;flex-wrap:wrap;gap:8px;margin:14px 0"><span class="pill on">Coffee · $5</span><span class="pill">Snack · $3</span><span class="pill">Ride · $12</span><span class="pill">Your own</span></div>
  <div style="font-size:16px;line-height:1.55">$5 every workday is about <b>$1,300 a year</b>. Put toward an investment at an example 7% for 10 years, it would grow to about <b>$18,750</b>.</div>
  <div class="meta" style="margin-top:10px;font-size:15px">If it's the best part of your day, it may well be worth it. The point is choosing on purpose.</div></div>
  <div class="card" style="margin-top:12px"><div class="label">This week's hidden cost</div><div style="font-size:16px;line-height:1.5">A $1,000 card balance at 24% APR, paying $25 a month: about <b>7 years</b>, and about <b>$1,000 in interest</b> on top.</div><div style="display:flex;align-items:center;gap:6px;margin-top:10px;font-weight:650;color:var(--navy);font-size:15px">${ic("book", 16)} Lesson: Credit cards</div></div>
  <p class="fine" style="margin-top:12px">Example numbers, for learning. Not advice.</p></div>${tabs(2)}`),

  "15-spot-es": phone(`${qbar(60, "Preguntar")}<div class="body" style="padding-top:12px">
  <div class="label">Encuentra el problema</div><div class="q" style="font-size:21px">Te llegó este mensaje. Toca las dos señales de alerta más grandes.</div>
  <div class="card" style="padding:14px"><div class="meta" style="font-size:13px;margin-bottom:8px">SMS · 55 1234 0987</div>
  <div style="background:var(--bg);border-radius:16px 16px 16px 4px;padding:12px 14px;font-size:16px;line-height:1.7">TuBanco: Detectamos un cargo de $8,900. Si no lo reconoces, <span style="border:2px solid var(--navy);border-radius:6px;padding:0 3px">llama ya al 55 0000 1111</span> y <span style="border:2px solid var(--navy);border-radius:6px;padding:0 3px">dinos tu NIP</span> para cancelarlo.</div></div>
  <p class="fine" style="margin-top:10px">2 de 2 elegidas</p></div>${bottom(`<div class="btn">Comprobar</div>`)}`),

  "16-finish-dark": finish(true),
};

await render(DIR, "Northvale Learn — Milestone 4.5 mockups", screens);
console.log(`${Object.keys(screens).length} mockups in docs/design/fun/`);
