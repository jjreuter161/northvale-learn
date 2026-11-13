// REAL-LIFE TOOLS — the "do it" steps for paychecks, taxes, banking,
// scams, insurance, risky investments and earning more. Math in
// engine.js; every rate is a labeled example or comes from core/facts.js.
import { useState } from "react";
import { addStrings, money, text } from "../../core/i18n.js";
import { fact } from "../../core/facts.js";
import { Button, Card, Icon, Legend, LineChart, Note, Slider } from "../../core/ui.jsx";
import { paycheck, withTaxAdded, taxInside, bracketTax, accountYear, insuranceYear, hustle, swingPath, remit } from "./engine.js";
import { amt, useTouched } from "./tools.jsx";

const S = (en, es) => ({ en, es });
const T = (en, es, MX) => (MX ? { en, es, MX } : { en, es });
addStrings({
  "pay.gross": S("Gross pay this month", "Sueldo bruto del mes"),
  "pay.income": S("Income tax withheld (example)", "Impuesto retenido (ejemplo)"),
  "pay.income.MX": S("ISR withheld (example)", "ISR retenido (ejemplo)"),
  "pay.state": S("State income tax (example)", "Impuesto estatal (ejemplo)"),
  "pay.ss": S("Social Security", "Seguro Social (Social Security)"),
  "pay.medicare": S("Medicare", "Medicare"),
  "pay.imss": S("IMSS (example)", "IMSS (ejemplo)"),
  "pay.net": S("Take-home pay", "Lo que te llega (neto)"),
  "pay.deductions": S("Taken out", "Descuentos"),
  "pay.note": S("Withholding depends on your W-4, your income and your state; some states have no income tax. Social Security and Medicare are set by law.", "La retención depende de tu W-4, tus ingresos y tu estado; algunos estados no cobran impuesto sobre el ingreso. Social Security y Medicare los fija la ley."),
  "pay.note.MX": S("ISR withheld follows SAT's table and your income, and IMSS depends on your salary — these are examples. By law, formal jobs also pay an aguinaldo of at least {@aguinaldoDays} days of salary by December 20.", "El ISR retenido sigue la tabla del SAT y tu ingreso, y el IMSS depende de tu salario; estos son ejemplos. Por ley, en un empleo formal también recibes un aguinaldo de al menos {@aguinaldoDays} días de salario a más tardar el 20 de diciembre."),
  "tax.price": S("Price on the tag", "Precio en la etiqueta"),
  "tax.added": S("At the register, with an example {pct} sales tax", "En la caja, con un impuesto de ejemplo de {pct}"),
  "tax.added.note": S("In most US states the tag doesn't include sales tax; it's added at the register. Rates vary by state and city, and a few states have none.", "En la mayoría de los estados de EE. UU. la etiqueta no incluye el impuesto; se suma en la caja. Las tasas cambian según el estado y la ciudad, y unos pocos estados no lo cobran."),
  "tax.inside": S("IVA already inside that price ({pct})", "IVA ya incluido en ese precio ({pct})"),
  "tax.inside.note": S("In Mexico, shelf prices for shoppers already include IVA — {@ivaRate} in most of the country. In the border regions, registered businesses can use a temporary {@ivaBorderRate} rate (through {@ivaBorderEnds}).", "En México, los precios al público ya incluyen el IVA: {@ivaRate} en casi todo el país. En las regiones fronterizas, los negocios registrados pueden usar una tasa temporal de {@ivaBorderRate} (hasta el {@ivaBorderEnds})."),
  "br.income": S("Yearly income", "Ingreso anual"),
  "br.example": S("Example brackets — not real tax rates", "Tramos de ejemplo, no son tasas reales"),
  "br.row": S("{pct} on {from}–{to}", "{pct} sobre {from}–{to}"),
  "br.row.top": S("{pct} above {from}", "{pct} arriba de {from}"),
  "br.total": S("Total tax", "Impuesto total"),
  "br.effective": S("Effective rate: {pct} of your income", "Tasa efectiva: {pct} de tu ingreso"),
  "br.note": S("Moving into a higher bracket only taxes the extra at the higher rate. A raise never lowers your pay after tax.", "Pasar a un tramo más alto solo grava lo extra con la tasa más alta. Un aumento nunca baja lo que te queda después de impuestos."),
  "fee.title.a": S("Account A", "Cuenta A"),
  "fee.title.b": S("Account B", "Cuenta B"),
  "fee.a": S("{fee} monthly fee, waived if you keep {min} in it", "Comisión mensual de {fee}, sin cobro si mantienes {min}"),
  "fee.b": S("No monthly fee; {fee} for each ATM withdrawal outside its network", "Sin comisión mensual; {fee} por cada retiro en cajeros de otra red"),
  "fee.keep": S("I keep at least {min} in it", "Mantengo al menos {min}"),
  "fee.atm": S("Outside-network ATM withdrawals a month", "Retiros al mes en cajeros de otra red"),
  "fee.year": S("{amount} a year", "{amount} al año"),
  "fee.note": S("The cheapest account depends on how you use it. Fee schedules are public — read them before you open an account.", "La cuenta más barata depende de cómo la uses. Las comisiones son públicas: léelas antes de abrir una cuenta."),
  "scam.check": S("Check", "Revisar"),
  "scam.score": S("You spotted {n} of {total} red flags.", "Detectaste {n} de {total} señales de alerta."),
  "scam.flag": S("Red flag", "Señal de alerta"),
  "scam.missed": S("Missed red flag", "Señal que se te pasó"),
  "scam.fine": S("Not a red flag", "No es señal de alerta"),
  "ins.costs": S("Medical costs this year", "Gastos médicos este año"),
  "ins.a": S("Plan A: {premium}/month, you pay the first {deductible}", "Plan A: {premium}/mes, tú pagas los primeros {deductible}"),
  "ins.b": S("Plan B: {premium}/month, you pay the first {deductible}", "Plan B: {premium}/mes, tú pagas los primeros {deductible}"),
  "ins.year": S("Your cost for the year: {amount}", "Tu costo del año: {amount}"),
  "ins.cheaper": S("At this level of costs, {plan} costs less.", "Con estos gastos, {plan} cuesta menos."),
  "ins.note": S("Simplified: real plans also have coinsurance and a yearly out-of-pocket maximum. A higher deductible means a lower premium, but more to pay if something happens.", "Simplificado: los planes reales también tienen coaseguro y un máximo anual a tu cargo. Un deducible más alto baja la prima, pero pagas más si algo pasa."),
  "sw.invest": S("Invested", "Invertido"),
  "sw.volatile": S("Very volatile asset (made-up)", "Activo muy volátil (inventado)"),
  "sw.fund": S("Broad index fund (made-up)", "Fondo indexado amplio (inventado)"),
  "sw.another": S("Show another year", "Ver otro año"),
  "sw.result": S("After 12 months: {a} vs. {b}. Biggest drop along the way: {da} vs. {db}.", "Después de 12 meses: {a} contra {b}. Mayor caída en el camino: {da} contra {db}."),
  "sw.note": S("Made-up paths for learning, not predictions. Very volatile assets can rise or fall by half within months.", "Trayectorias inventadas para aprender, no predicciones. Los activos muy volátiles pueden subir o caer a la mitad en meses."),
  "hu.price": S("Price per job or item", "Precio por trabajo o producto"),
  "hu.cost": S("Your cost per job or item", "Tu costo por trabajo o producto"),
  "hu.count": S("Jobs or items a week", "Trabajos o productos por semana"),
  "hu.hours": S("Hours per job", "Horas por trabajo"),
  "hu.result": S("A week: {revenue} in sales, {profit} profit — about {hour} an hour.", "Por semana: {revenue} en ventas y {profit} de ganancia; unos {hour} por hora."),
  "hu.note": S("Set aside part of your profit for taxes: self-employment tax is {@selfEmploymentTaxRate}, plus income tax, and you must file if you net {@selfEmploymentFilingMin} or more in a year.", "Aparta parte de tu ganancia para impuestos: el impuesto de autoempleo es de {@selfEmploymentTaxRate}, más el impuesto sobre la renta, y debes declarar si ganas {@selfEmploymentFilingMin} o más en un año."),
  "hu.note.MX": S("Earning on your own means registering with the SAT and paying taxes on it; small earners can use a simplified regime (RESICO), with rates of roughly {@resicoRateLow} to {@resicoRateHigh}. Set aside part of your profit for that.", "Ganar por tu cuenta implica darte de alta en el SAT y pagar impuestos por eso; quienes ganan poco pueden usar un régimen simplificado (RESICO), con tasas de alrededor de {@resicoRateLow} a {@resicoRateHigh}. Aparta parte de tu ganancia para eso."),
});

const row = { display: "flex", justifyContent: "space-between", alignItems: "baseline", gap: 10, padding: "8px 0", borderTop: "1px solid var(--line)", fontVariantNumeric: "tabular-nums" };
const big = { fontSize: 22, fontWeight: 700, fontVariantNumeric: "tabular-nums", whiteSpace: "nowrap" };
const pct = (n, locale) => `${Number(n.toFixed(1)).toLocaleString(locale.lang === "es" ? "es-MX" : "en-US")}%`;

// ---- Paycheck: gross → take-home ------------------------------------------
export function PaycheckTool({ params = {}, t, locale, onDone, done }) {
  const R = locale.region;
  const fmt = (n) => money(n, { ...locale, cents: true });
  const [gross, setGross] = useState(amt(params.gross || [1600, 12000], R));
  const [income, setIncome] = useState(fact(R === "MX" ? "isrWithholdingExample" : "federalWithholdingExample"));
  const [state, setState] = useState(fact("stateTaxExample"));
  const touch = useTouched(onDone, done);
  const rates = R === "MX" ? { "pay.income.MX": income, "pay.imss": fact("imssWorkerExample") } : { "pay.income": income, "pay.state": state, "pay.ss": fact("socialSecurityRate"), "pay.medicare": fact("medicareRate") };
  const p = paycheck(gross, rates);
  const set = (f) => (v) => (f(v), touch());
  return (
    <Card>
      <Slider label={t("pay.gross")} value={gross} min={amt([400, 3000], R)} max={amt([6000, 50000], R)} step={amt([50, 500], R)} onChange={set(setGross)} display={money(gross, locale)} />
      <Slider label={t(R === "MX" ? "pay.income.MX" : "pay.income")} value={income} min={0} max={25} step={0.5} onChange={set(setIncome)} display={`${income}%`} />
      {R !== "MX" && <Slider label={t("pay.state")} value={state} min={0} max={10} step={0.5} onChange={set(setState)} display={`${state}%`} />}
      <div style={{ display: "flex", height: 10, borderRadius: 5, overflow: "hidden", margin: "4px 0 12px", background: "var(--surface2)" }} aria-hidden>
        <div style={{ width: `${(p.net / gross) * 100}%`, background: "var(--accent)" }} />
        <div style={{ flex: 1, background: "var(--warn)", opacity: 0.55 }} />
      </div>
      {p.items.map(([k, v]) => (
        <div key={k} style={row}>
          <span style={{ color: "var(--mid)" }}>{t(k)}</span>
          <span style={{ whiteSpace: "nowrap" }}>−{fmt(v)}</span>
        </div>
      ))}
      <div style={{ ...row, fontWeight: 650 }}>
        <span>{t("pay.net")}</span>
        <span style={big}>{fmt(p.net)}</span>
      </div>
      <p style={{ fontSize: 13, color: "var(--low)", lineHeight: 1.45, margin: "10px 0 0" }}>{t(R === "MX" ? "pay.note.MX" : "pay.note")}</p>
    </Card>
  );
}

// ---- Sales tax (US) / IVA (MX) --------------------------------------------
export function SalesTaxTool({ t, locale, onDone, done }) {
  const R = locale.region;
  const fmt = (n) => money(n, { ...locale, cents: true });
  const [price, setPrice] = useState(amt([20, 300], R));
  const touch = useTouched(onDone, done);
  const rate = fact(R === "MX" ? "ivaRate" : "salesTaxExample");
  return (
    <Card>
      <Slider label={t("tax.price")} value={price} min={amt([1, 10], R)} max={amt([200, 3000], R)} step={amt([1, 10], R)} onChange={(v) => (setPrice(v), touch())} display={fmt(price)} />
      {R === "MX" ? (
        <>
          <div style={row}>
            <span style={{ color: "var(--mid)" }}>{t("tax.inside", { pct: `${rate}%` })}</span>
            <span style={big}>{fmt(taxInside(price, rate))}</span>
          </div>
          <p style={{ fontSize: 13, color: "var(--low)", lineHeight: 1.45, margin: "10px 0 0" }}>{t("tax.inside.note")}</p>
        </>
      ) : (
        <>
          <div style={row}>
            <span style={{ color: "var(--mid)" }}>{t("tax.added", { pct: `${rate}%` })}</span>
            <span style={big}>{fmt(withTaxAdded(price, rate))}</span>
          </div>
          <p style={{ fontSize: 13, color: "var(--low)", lineHeight: 1.45, margin: "10px 0 0" }}>{t("tax.added.note")}</p>
        </>
      )}
    </Card>
  );
}

// ---- Brackets (an example system) -----------------------------------------
const EXAMPLE_BRACKETS = { US: [[10000, 0], [40000, 10], [Infinity, 20]], MX: [[150000, 0], [600000, 10], [Infinity, 20]] };
export function BracketTool({ t, locale, onDone, done }) {
  const R = locale.region;
  const fmt = (n) => money(n, locale);
  const [income, setIncome] = useState(amt([30000, 300000], R));
  const touch = useTouched(onDone, done);
  const b = bracketTax(income, EXAMPLE_BRACKETS[R === "MX" ? "MX" : "US"]);
  return (
    <Card>
      <Note icon="info" style={{ marginBottom: 12 }}>{t("br.example")}</Note>
      <Slider label={t("br.income")} value={income} min={0} max={amt([100000, 1500000], R)} step={amt([1000, 10000], R)} onChange={(v) => (setIncome(v), touch())} display={fmt(income)} />
      {b.rows.map((r) => (
        <div key={r.from} style={row}>
          <span style={{ color: "var(--mid)" }}>{r.upTo === Infinity ? t("br.row.top", { pct: `${r.pct}%`, from: fmt(r.from) }) : t("br.row", { pct: `${r.pct}%`, from: fmt(r.from), to: fmt(r.upTo) })}</span>
          <span style={{ whiteSpace: "nowrap" }}>{fmt(r.tax)}</span>
        </div>
      ))}
      <div style={{ ...row, fontWeight: 650 }}>
        <span>{t("br.total")}</span>
        <span style={big}>{fmt(b.total)}</span>
      </div>
      <p style={{ margin: "8px 0 0", fontWeight: 600 }}>{t("br.effective", { pct: pct(b.effective, locale) })}</p>
      <p style={{ fontSize: 13, color: "var(--low)", lineHeight: 1.45, margin: "8px 0 0" }}>{t("br.note")}</p>
    </Card>
  );
}

addStrings({
  "remit.amount": S("You send", "Tú envías"),
  "remit.service": S("Service {n}", "Servicio {n}"),
  "remit.fee": S("Fee: {amount}", "Comisión: {amount}"),
  "remit.markup": S("Hidden in the exchange rate: {pct} (about {amount})", "Escondido en el tipo de cambio: {pct} (unos {amount})"),
  "remit.arrives": S("Arrives: {amount}", "Llegan: {amount}"),
  "remit.cost": S("Total cost: {amount} ({pct})", "Costo total: {amount} ({pct})"),
  "remit.best": S("Costs less", "Cuesta menos"),
  "remit.gap": S("The difference: {usd} of your money, about {mxn} for the family.", "La diferencia: {usd} de tu dinero, unos {mxn} para tu familia."),
  "remit.note": S("Illustrative numbers, not real companies. Real fees and markups change by service, amount and day. Compare real options with Profeco's official comparison (qqed.profeco.gob.mx) before you send.", "Números ilustrativos, no de empresas reales. Las comisiones y los márgenes reales cambian según el servicio, el monto y el día. Compara opciones reales con el comparativo oficial de Profeco (qqed.profeco.gob.mx) antes de enviar."),
});

// ---- Sending money across the border ----------------------------------------------
export function RemitTool({ t, locale, onDone, done }) {
  const usd = (n) => money(n, { ...locale, currency: "USD" });
  const mxn = (n) => money(n, { ...locale, currency: "MXN" });
  const [amount, setAmount] = useState(fact("remitSendExample"));
  const touch = useTouched(onDone, done);
  const rate = fact("remitRateExample");
  const svc = [
    { n: "A", fee: fact("remitFeeExampleA"), markupPct: fact("remitMarkupExampleA") },
    { n: "B", fee: fact("remitFeeExampleB"), markupPct: fact("remitMarkupExampleB") },
  ].map((x) => ({ ...x, ...remit({ amount, fee: x.fee, markupPct: x.markupPct, rate }) }));
  const best = svc[0].costUsd <= svc[1].costUsd ? 0 : 1;
  const other = svc[1 - best];
  return (
    <Card>
      <Slider label={t("remit.amount")} value={amount} min={50} max={1000} step={10} display={usd(amount)} onChange={(v) => (setAmount(v), touch())} />
      <div style={{ display: "flex", gap: 10, marginBottom: 12 }}>
        {svc.map((x, i) => (
          <div key={x.n} style={{ flex: 1, border: `1px solid ${i === best ? "var(--accent)" : "var(--line)"}`, borderRadius: 12, padding: 12, background: i === best ? "var(--accentSoft)" : "var(--surface)" }}>
            <div style={{ fontWeight: 650, marginBottom: 6 }}>{t("remit.service", { n: x.n })}{i === best ? ` · ${t("remit.best")}` : ""}</div>
            <div style={{ fontSize: 13, color: "var(--mid)", lineHeight: 1.4 }}>{t("remit.fee", { amount: usd(x.fee) })}</div>
            <div style={{ fontSize: 13, color: "var(--mid)", lineHeight: 1.4, minHeight: 52 }}>{t("remit.markup", { pct: pct(x.markupPct, locale), amount: usd((amount * x.markupPct) / 100) })}</div>
            <div style={{ fontWeight: 700, fontVariantNumeric: "tabular-nums", marginTop: 4 }}>{t("remit.arrives", { amount: mxn(x.arrives) })}</div>
            <div style={{ fontSize: 13, fontVariantNumeric: "tabular-nums", marginTop: 4 }}>{t("remit.cost", { amount: usd(x.costUsd), pct: pct(x.costPct, locale) })}</div>
          </div>
        ))}
      </div>
      <p style={{ margin: "0 0 8px", fontWeight: 600 }}>{t("remit.gap", { usd: usd(other.costUsd - svc[best].costUsd), mxn: mxn(svc[best].arrives - other.arrives) })}</p>
      <p style={{ fontSize: 13, color: "var(--low)", lineHeight: 1.45, margin: 0 }}>{t("remit.note")}</p>
    </Card>
  );
}

// ---- Bank account fees ------------------------------------------------------
export function FeeTool({ t, locale, onDone, done }) {
  const R = locale.region;
  const fmt = (n) => money(n, locale);
  const [keep, setKeep] = useState(false);
  const [atm, setAtm] = useState(2);
  const touch = useTouched(onDone, done);
  const A = { monthly: amt([12, 150], R), waived: keep };
  const B = { atmFee: amt([3, 30], R), atmPerMonth: atm };
  const min = amt([1500, 20000], R);
  const yA = accountYear(A);
  const yB = accountYear(B);
  const box = (title, desc, year, best) => (
    <div style={{ flex: 1, border: `1px solid ${best ? "var(--accent)" : "var(--line)"}`, borderRadius: 12, padding: 12, background: best ? "var(--accentSoft)" : "var(--surface)" }}>
      <div style={{ fontWeight: 650 }}>{title}</div>
      <div style={{ fontSize: 13, color: "var(--mid)", lineHeight: 1.35, margin: "4px 0 8px", minHeight: 52 }}>{desc}</div>
      <div style={{ fontWeight: 700, fontVariantNumeric: "tabular-nums" }}>{t("fee.year", { amount: fmt(year) })}</div>
    </div>
  );
  return (
    <Card>
      <div style={{ display: "flex", gap: 10, marginBottom: 14 }}>
        {box(t("fee.title.a"), t("fee.a", { fee: fmt(A.monthly), min: fmt(min) }), yA, yA < yB)}
        {box(t("fee.title.b"), t("fee.b", { fee: fmt(B.atmFee) }), yB, yB < yA)}
      </div>
      <label style={{ display: "flex", alignItems: "center", gap: 10, fontSize: 15, marginBottom: 10, minHeight: 44, cursor: "pointer" }}>
        <input type="checkbox" checked={keep} onChange={(e) => (setKeep(e.target.checked), touch())} style={{ width: 20, height: 20, accentColor: "var(--brand)" }} />
        {t("fee.keep", { min: fmt(min) })}
      </label>
      <Slider label={t("fee.atm")} value={atm} min={0} max={10} onChange={(v) => (setAtm(v), touch())} />
      <p style={{ fontSize: 13, color: "var(--low)", lineHeight: 1.45, margin: 0 }}>{t("fee.note")}</p>
    </Card>
  );
}

// ---- Red flags: scams, pressure tactics, hype ---------------------------------
const L = (text_, flag, why) => ({ text: text_, flag, why });
const SETS = {
  phishing: {
    ask: T("A text arrives. Tap anything that looks like a red flag.", "Te llega un mensaje. Toca todo lo que parezca señal de alerta."),
    from: T("From: Account Security <alerts@bank-secure-help.co>", "De: Seguridad de Cuentas <alertas@banco-seguro-ayuda.co>"),
    lines: [
      L(T("Your account has been LOCKED due to unusual activity.", "Tu cuenta fue BLOQUEADA por actividad inusual."), true, T("Scary claims are meant to rush you.", "Las amenazas buscan que actúes con prisa.")),
      L(T("Verify your identity within 24 hours or it will be closed.", "Verifica tu identidad en 24 horas o se cancelará."), true, T("A deadline pressures you to act before you think.", "Un plazo te presiona para actuar sin pensar.")),
      L(T("Tap here: bank-secure-help.co/verify", "Toca aquí: banco-seguro-ayuda.co/verificar"), true, T("That isn't your bank's website. Open the bank's app or type its address yourself.", "Ese no es el sitio de tu banco. Abre la app del banco o escribe tú la dirección.")),
      L(T("Have your card number and PIN ready.", "Ten a la mano tu número de tarjeta y tu NIP."), true, T("No real bank asks for your PIN. Ever.", "Ningún banco de verdad te pide tu NIP. Nunca.")),
      L(T("Thank you for banking with us.", "Gracias por ser nuestro cliente."), false, T("Polite words are normal — scammers copy them too, so they prove nothing either way.", "Las palabras amables son normales; los estafadores también las copian, así que no prueban nada.")),
    ],
  },
  investment: {
    ask: T("A message from someone you met online. Tap the red flags.", "Un mensaje de alguien que conociste en internet. Toca las señales de alerta."),
    lines: [
      L(T("I made {$3000|50000} last week with this trading app!", "¡Gané {$3000|50000} la semana pasada con esta app de inversión!"), true, T("Bragging about fast gains is bait. Real investing doesn't work that fast.", "Presumir ganancias rápidas es un anzuelo. Invertir de verdad no funciona tan rápido.")),
      L(T("Guaranteed 20% returns every week.", "Rendimientos garantizados de 20% cada semana."), true, T("Guaranteed high returns don't exist. This is the biggest red flag of all.", "Los rendimientos altos garantizados no existen. Es la señal de alerta más grande.")),
      L(T("Only 10 spots left — join today.", "Solo quedan 10 lugares: entra hoy."), true, T("Made-up scarcity is there to rush you.", "La escasez inventada es para apresurarte.")),
      L(T("Send the money to my personal account to get started.", "Manda el dinero a mi cuenta personal para empezar."), true, T("Real investment firms never ask you to pay a person.", "Las empresas de inversión reales nunca te piden pagarle a una persona.")),
      L(T("It's registered with the regulators.", "Está registrada ante las autoridades."), false, T("A claim isn't proof — check it yourself on FINRA's BrokerCheck or the SEC's site.", "Decirlo no lo prueba: revísalo tú en BrokerCheck de FINRA o en el sitio de la SEC.", { en: "A claim isn't proof — check it yourself with the CNBV and CONDUSEF.", es: "Decirlo no lo prueba: revísalo tú con la CNBV y la CONDUSEF." })),
    ],
  },
  pyramid: {
    ask: T("A friend invites you to a \"business.\" Tap the red flags.", "Un amigo te invita a un \"negocio\". Toca las señales de alerta."),
    lines: [
      L(T("Join for just {$100|1500} and start earning.", "Entra con solo {$100|1500} y empieza a ganar."), true, T("Paying to join is a classic sign: the money comes from new members.", "Pagar para entrar es una señal clásica: el dinero viene de los nuevos miembros.")),
      L(T("You earn {$50|750} for every friend you sign up.", "Ganas {$50|750} por cada amigo que inscribas."), true, T("Pay that comes from recruiting, not from selling anything, is how pyramids work.", "Ganar por reclutar y no por vender algo es como funcionan las pirámides.")),
      L(T("Our products are wellness supplements.", "Nuestros productos son suplementos de bienestar."), false, T("Having a product doesn't decide it. What matters is whether people earn from customers or from recruits.", "Tener un producto no lo define. Lo que importa es si ganan por clientes o por reclutas.")),
      L(T("The people at the top are all rich.", "Los de arriba son todos ricos."), true, T("The top earns from everyone below. Most people who join lose money.", "Los de arriba ganan con todos los de abajo. La mayoría de quienes entran pierde dinero.")),
    ],
  },
  security: {
    ask: T("Advice you got today. Tap the risky ones.", "Consejos que te dieron hoy. Toca los riesgosos."),
    lines: [
      L(T("\"I sent you a code by mistake — can you send it back?\"", "\"Te mandé un código por error, ¿me lo reenvías?\""), true, T("That code is almost certainly your login code. Sharing it hands over your account.", "Ese código casi seguro es tu código de acceso. Compartirlo entrega tu cuenta.")),
      L(T("Use one password for everything so you don't forget it.", "Usa la misma contraseña para todo para no olvidarla."), true, T("One leak opens everything. Different passwords (a password manager helps) keep a leak small.", "Una filtración abre todo. Contraseñas distintas (un administrador de contraseñas ayuda) hacen pequeña una filtración.")),
      L(T("Turn on two-step verification.", "Activa la verificación en dos pasos."), false, T("Good advice — a second step stops most account takeovers.", "Buen consejo: un segundo paso frena la mayoría de los robos de cuenta.")),
      L(T("Post a photo of your new debit card.", "Publica una foto de tu tarjeta de débito nueva."), true, T("Anyone can copy the number from a photo.", "Cualquiera puede copiar el número de una foto.")),
      L(T("Check your bank app for charges you don't recognize.", "Revisa en la app del banco si hay cargos que no reconoces."), false, T("Good habit — the sooner you report fraud, the easier it is to fix.", "Buen hábito: entre antes reportes un fraude, más fácil es arreglarlo.")),
    ],
  },
  fomo: {
    ask: T("An ad for sneakers. Tap each pressure tactic.", "Un anuncio de tenis. Toca cada táctica de presión."),
    lines: [
      L(T("LAST CHANCE: 3 hours left!", "ÚLTIMA OPORTUNIDAD: ¡quedan 3 horas!"), true, T("A countdown pushes you to decide before you think.", "Una cuenta regresiva te empuja a decidir sin pensar.")),
      L(T("Everyone is wearing these — don't be left out.", "Todos los están usando: no te quedes fuera."), true, T("That's FOMO: it works on the fear of missing out.", "Eso es FOMO: juega con el miedo a quedarte fuera.")),
      L(T("Only 2 pairs left in your size.", "Solo quedan 2 pares de tu talla."), true, T("Scarcity, real or not, speeds up decisions.", "La escasez, real o no, acelera las decisiones.")),
      L(T("Free returns within 30 days.", "Devoluciones gratis en 30 días."), false, T("A clear return policy is a good sign, not pressure.", "Una política de devolución clara es buena señal, no presión.")),
      L(T("Split it into 4 easy payments!", "¡Págalo en 4 pagos fáciles!"), true, T("Splitting the price makes it feel smaller. It costs the same — or more if you pay late.", "Dividir el precio lo hace sentir más chico. Cuesta lo mismo, o más si pagas tarde.")),
    ],
  },
  hype: {
    ask: T("A post about a new coin. Tap the hype.", "Una publicación sobre una moneda nueva. Toca lo que es hype."),
    lines: [
      L(T("This coin will 100× by next month!", "¡Esta moneda va a multiplicarse 100 veces el próximo mes!"), true, T("Nobody can promise that. Bold price predictions are hype.", "Nadie puede prometer eso. Las predicciones exageradas de precio son hype.")),
      L(T("Celebrities are buying in.", "Las celebridades están comprando."), true, T("Famous people are often paid to promote. That's marketing, not research.", "A los famosos muchas veces les pagan por promocionar. Es publicidad, no investigación.")),
      L(T("Get in before the price explodes.", "Entra antes de que el precio explote."), true, T("Urgency plus fear of missing out is the hype formula.", "Urgencia más miedo a quedarte fuera es la fórmula del hype.")),
      L(T("The project publishes who runs it and how it works.", "El proyecto publica quién lo dirige y cómo funciona."), false, T("Openness is a good sign — though it doesn't make an investment safe.", "La transparencia es buena señal, aunque no hace segura una inversión.")),
      L(T("Never sell, no matter what.", "Nunca vendas, pase lo que pase."), true, T("Being told never to sell, whatever happens, is pressure, not analysis.", "Que te digan que nunca vendas, pase lo que pase, es presión, no análisis.")),
    ],
  },
};
export function ScamTool({ params = {}, t, locale, onDone, done }) {
  const set = SETS[params.set] || SETS.phishing;
  const x = (v) => text(v, locale);
  const [picked, setPicked] = useState(() => set.lines.map(() => false));
  const [checked, setChecked] = useState(false);
  const touch = useTouched(onDone, done);
  const flags = set.lines.filter((l) => l.flag).length;
  const found = set.lines.filter((l, i) => l.flag && picked[i]).length;
  return (
    <Card>
      <p style={{ margin: "0 0 10px", fontWeight: 600, lineHeight: 1.4 }}>{x(set.ask)}</p>
      {set.from && <div style={{ fontSize: 13, color: "var(--mid)", margin: "0 0 8px", wordBreak: "break-word" }}>{x(set.from)}</div>}
      <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
        {set.lines.map((l, i) => {
          const on = picked[i];
          const verdict = checked && (l.flag ? (on ? "flag" : "missed") : on ? "fine" : null);
          const tone = verdict === "flag" ? ["var(--accent)", "var(--accentSoft)"] : verdict === "missed" || verdict === "fine" ? ["var(--warn)", "var(--warnSoft)"] : on ? ["var(--brand)", "var(--brandSoft)"] : ["var(--line)", "var(--surface)"];
          return (
            <button key={i} disabled={checked} onClick={() => setPicked((p) => p.map((v, j) => (j === i ? !v : v)))} aria-pressed={on} className="nv-press" style={{ textAlign: "left", border: `1px solid ${tone[0]}`, background: tone[1], color: "var(--ink)", borderRadius: 12, padding: "12px 14px", fontSize: 15, lineHeight: 1.4, cursor: checked ? "default" : "pointer", minHeight: 48 }}>
              <span style={{ display: "flex", gap: 10, alignItems: "flex-start" }}>
                <span style={{ flexShrink: 0, marginTop: 2, color: tone[0] }}>
                  <Icon name={on ? "flag" : "plus"} size={16} />
                </span>
                <span>
                  {x(l.text)}
                  {checked && (l.flag || on) && (
                    <span style={{ display: "block", fontSize: 13, color: "var(--mid)", marginTop: 6 }}>
                      <strong style={{ color: tone[0] }}>{t(verdict === "flag" ? "scam.flag" : verdict === "missed" ? "scam.missed" : "scam.fine")}.</strong> {x(l.why)}
                    </span>
                  )}
                </span>
              </span>
            </button>
          );
        })}
      </div>
      {!checked ? (
        <Button full style={{ marginTop: 12 }} disabled={!picked.some(Boolean)} onClick={() => (setChecked(true), touch())}>
          {t("scam.check")}
        </Button>
      ) : (
        <Note tone="good" icon="check" style={{ marginTop: 12 }}>{t("scam.score", { n: found, total: flags })}</Note>
      )}
    </Card>
  );
}

// ---- Insurance: premium vs. deductible --------------------------------------
export function InsuranceTool({ t, locale, onDone, done }) {
  const R = locale.region;
  const fmt = (n) => money(n, locale);
  const A = { premium: amt([40, 600], R), deductible: amt([3000, 45000], R) };
  const B = { premium: amt([110, 1650], R), deductible: amt([500, 7500], R) };
  const [costs, setCosts] = useState(amt([300, 4500], R));
  const touch = useTouched(onDone, done);
  const yA = insuranceYear(A, costs);
  const yB = insuranceYear(B, costs);
  const plan = (name, p, y, best) => (
    <div style={{ border: `1px solid ${best ? "var(--accent)" : "var(--line)"}`, background: best ? "var(--accentSoft)" : "var(--surface)", borderRadius: 12, padding: 12, marginBottom: 8 }}>
      <div style={{ fontSize: 14, color: "var(--mid)" }}>{t(name, { premium: fmt(p.premium), deductible: fmt(p.deductible) })}</div>
      <div style={{ fontWeight: 700, marginTop: 4, fontVariantNumeric: "tabular-nums" }}>{t("ins.year", { amount: fmt(y) })}</div>
    </div>
  );
  return (
    <Card>
      <Slider label={t("ins.costs")} value={costs} min={0} max={amt([10000, 150000], R)} step={amt([100, 1500], R)} onChange={(v) => (setCosts(v), touch())} display={fmt(costs)} />
      {plan("ins.a", A, yA, yA < yB)}
      {plan("ins.b", B, yB, yB < yA)}
      <p style={{ margin: "6px 0 0", fontWeight: 600 }}>{t("ins.cheaper", { plan: yA <= yB ? "A" : "B" })}</p>
      <p style={{ fontSize: 13, color: "var(--low)", lineHeight: 1.45, margin: "8px 0 0" }}>{t("ins.note")}</p>
    </Card>
  );
}

// ---- Swings: a volatile asset vs. a broad fund (made-up paths) -----------------
export function SwingTool({ t, locale, onDone, done }) {
  const R = locale.region;
  const fmt = (n) => money(Math.round(n), locale);
  const start = amt([100, 1500], R);
  const [seed, setSeed] = useState(39);
  const touch = useTouched(onDone, done);
  const a = swingPath(start, 30, seed);
  // A broad fund: smaller monthly moves around a small upward drift (about
  // 7% a year — the example rate), still made-up.
  const b = swingPath(start, 3, seed + 1000, 12, 0.6);
  const toPts = (v) => v.map((y, i) => [i, y]);
  return (
    <Card>
      <div style={{ fontSize: 14, color: "var(--mid)" }}>
        {t("sw.invest")}: <strong style={{ color: "var(--ink)" }}>{fmt(start)}</strong>
      </div>
      <div style={{ marginTop: 10 }}>
        <LineChart lines={[{ points: toPts(a.pts), color: "var(--warn)" }, { points: toPts(b.pts), color: "var(--accent)" }]} markers={[{ value: start }]} height={130} label={t("sw.volatile")} />
        <Legend items={[{ label: t("sw.volatile"), color: "var(--warn)" }, { label: t("sw.fund"), color: "var(--accent)" }]} />
      </div>
      <p style={{ margin: "10px 0", lineHeight: 1.5 }}>{t("sw.result", { a: fmt(a.end), b: fmt(b.end), da: `${Math.round(a.maxDrop)}%`, db: `${Math.round(b.maxDrop)}%` })}</p>
      <Button full kind="secondary" style={{ border: "1px solid var(--line)" }} onClick={() => (setSeed((s) => s + 7), touch())}>
        <Icon name="refresh" size={18} /> {t("sw.another")}
      </Button>
      <p style={{ fontSize: 13, color: "var(--low)", lineHeight: 1.45, margin: "10px 0 0" }}>{t("sw.note")}</p>
    </Card>
  );
}

// ---- Side hustle: price, cost, time → profit ---------------------------------
export function HustleTool({ params = {}, t, locale, onDone, done }) {
  const R = locale.region;
  const fmt = (n) => money(n, locale);
  const [price, setPrice] = useState(amt(params.price || [20, 300], R));
  const [cost, setCost] = useState(amt(params.cost || [5, 80], R));
  const [count, setCount] = useState(params.count || 5);
  const [hours, setHours] = useState(params.hours || 1);
  const touch = useTouched(onDone, done);
  const h = hustle({ price, cost: Math.min(cost, price), perWeek: count, hours });
  const set = (f) => (v) => (f(v), touch());
  return (
    <Card>
      <Slider label={t("hu.price")} value={price} min={amt([1, 20], R)} max={amt([100, 1500], R)} step={amt([1, 10], R)} onChange={set(setPrice)} display={fmt(price)} />
      <Slider label={t("hu.cost")} value={Math.min(cost, price)} min={0} max={price} step={amt([1, 10], R)} onChange={set(setCost)} display={fmt(Math.min(cost, price))} />
      <Slider label={t("hu.count")} value={count} min={1} max={30} onChange={set(setCount)} />
      <Slider label={t("hu.hours")} value={hours} min={0.25} max={8} step={0.25} onChange={set(setHours)} display={`${hours} h`} />
      <p style={{ margin: "4px 0 0", fontSize: 16, fontWeight: 600, lineHeight: 1.45 }}>{t("hu.result", { revenue: fmt(h.revenue), profit: fmt(h.profit), hour: fmt(h.perHour) })}</p>
      <p style={{ fontSize: 13, color: "var(--low)", lineHeight: 1.45, margin: "10px 0 0" }}>{t(R === "MX" ? "hu.note.MX" : "hu.note")}</p>
    </Card>
  );
}
