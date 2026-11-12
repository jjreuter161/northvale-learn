// REAL-LIFE MISSIONS — small real-life tasks that put a lesson to work. Nothing
// moves real money and nothing is collected: people do them on their own
// and mark them done. Text uses the lesson format (T, {$US|MX}, {@fact});
// scripts/validate-content.mjs checks these too.
//
//   unit       the course unit it goes with (lessons/units/index.js)
//   time       minutes, or "days" / "week" for things that take a while
//   how        what to do (`teen`: the version for ages 13–17, if different)
//   ask        the reflection question
//   only       "US" | "MX" — one country only
//   adult      18+ only (things a teen usually can't do yet)
//   goals      goal kinds it helps (ranked higher for those goals)
//   needsGoal  true: needs any goal · "debt": needs a goal of that kind
//   repeat     can be done again — once a week
import { T } from "../lessons/units/helpers.js";

const m = (id, fields) => ({ id, ...fields });

export const MISSIONS = [
  // Budgeting
  m("track3", {
    unit: "budget",
    icon: "wallet",
    time: "days",
    title: T("Track everything you spend for 3 days", "Anota todo lo que gastas durante 3 días"),
    how: T("For three days, write down every purchase — even small ones like a snack or an app. Use your phone's notes or paper. At the end, add it up by type: food, fun, transport, other.", "Durante tres días, anota cada compra, aunque sea pequeña, como un antojo o una app. Usa las notas del celular o un papel. Al final, súmalo por tipo: comida, diversión, transporte y otros."),
    ask: T("What surprised you most?", "¿Qué te sorprendió más?"),
  }),
  m("sort10", {
    unit: "budget",
    icon: "pie",
    time: 15,
    title: T("Sort your last 10 purchases", "Clasifica tus últimas 10 compras"),
    how: T("Look back at your last 10 purchases — a receipt, your bank app or your memory. Mark each one a need or a want. No judging; just notice the split.", "Revisa tus últimas 10 compras: un ticket, la app del banco o de memoria. Marca cada una como necesidad o gusto. Sin juzgarte: solo observa cómo se reparten."),
    ask: T("Which want would you skip next time?", "¿Qué gusto te saltarías la próxima vez?"),
  }),
  m("schoolcost", {
    unit: "budget",
    icon: "book",
    time: 20,
    goals: ["college"],
    title: T("Find the real cost of a school", "Encuentra el costo real de una escuela"),
    how: T("Pick a school you like. On its website, find the net price calculator to see a year's full cost — tuition, housing, books — after typical aid. Then find one scholarship you could apply for.", "Elige una escuela que te guste. En su sitio, busca la calculadora de precio neto (net price calculator) para ver el costo total de un año (colegiatura, vivienda, libros) después de la ayuda típica. Luego encuentra una beca a la que podrías aplicar.", {
      en: "Pick a school you like. Find what a year costs: tuition (colegiatura), registration, books and transport. Then find one scholarship (beca) you could apply for.",
      es: "Elige una escuela que te guste. Averigua cuánto cuesta un año: colegiatura, inscripción, libros y transporte. Luego encuentra una beca a la que podrías aplicar.",
    }),
    ask: T("Which cost didn't you expect?", "¿Qué costo no esperabas?"),
  }),
  m("tripcost", {
    unit: "budget",
    icon: "globe",
    time: 20,
    goals: ["travel"],
    title: T("Price your trip three ways", "Cotiza tu viaje de tres formas"),
    how: T("Look up the trip you want three ways — different dates, transport or places to stay. Write down each total. Just looking; no booking.", "Cotiza el viaje que quieres de tres formas: otras fechas, otro transporte u otro hospedaje. Anota cada total. Solo cotiza; no reserves."),
    ask: T("How big was the difference?", "¿Qué tan grande fue la diferencia?"),
  }),

  // Saving
  m("setaside", {
    unit: "save",
    icon: "piggy",
    time: "week",
    needsGoal: true,
    repeat: true,
    title: T("Set aside any amount toward your goal", "Aparta cualquier cantidad para tu meta"),
    how: T("This week, put any amount — even a small one — somewhere separate for your goal: a savings account, a jar, an envelope. Doing it matters more than the amount.", "Esta semana, aparta cualquier cantidad, aunque sea pequeña, en un lugar separado para tu meta: una cuenta de ahorro, una alcancía, un sobre. Importa más hacerlo que el monto."),
    ask: T("How did you make room for it?", "¿Cómo le hiciste espacio?"),
  }),
  m("nospend", {
    unit: "save",
    icon: "calendar",
    time: "week",
    title: T("Have one no-spend day", "Ten un día sin gastar"),
    how: T("Pick a day this week to buy nothing beyond true needs. When you feel like buying something, write it down instead, and look at the list the next day.", "Elige un día de esta semana para no comprar nada más allá de lo necesario. Cuando se te antoje algo, anótalo en vez de comprarlo y revisa la lista al día siguiente."),
    ask: T("Did you still want those things the next day?", "¿Al día siguiente todavía querías esas cosas?"),
  }),
  m("essentials", {
    unit: "save",
    icon: "calendar",
    time: 15,
    goals: ["emergency"],
    title: T("Add up a month of essentials", "Suma un mes de gastos esenciales"),
    how: T("List what you'd need to cover for one month if money stopped coming in: phone, transport, food — whatever you pay for. An emergency fund goal can start from that number.", "Haz una lista de lo que necesitarías cubrir en un mes si dejara de llegarte dinero: celular, transporte, comida, lo que tú pagues. Una meta de fondo de emergencia puede partir de ese número."),
    ask: T("Was it more or less than you guessed?", "¿Fue más o menos de lo que pensabas?"),
  }),

  // Banking
  m("bankfees", {
    unit: "banking",
    icon: "building",
    time: 15,
    title: T("Find the fees on a bank account", "Encuentra las comisiones de una cuenta"),
    how: T("Open a bank's public fee schedule (search \"[bank name] fee schedule\" — no need to sign in). Find the monthly fee, the overdraft fee and the out-of-network ATM fee, and how to avoid each one.", "Abre la lista pública de comisiones de un banco (busca \"[nombre del banco] fee schedule\"; no necesitas iniciar sesión). Encuentra la comisión mensual, la de sobregiro (overdraft) y la de cajeros fuera de la red, y cómo evitar cada una.", {
      en: "Open a bank's public fee page (search \"[bank name] comisiones\" — no need to sign in) or CONDUSEF's Buró de Entidades Financieras, which compares banks and other financial institutions on complaints, fines and fees. Find the account-management fee, the minimum-balance fee and the fee for other banks' ATMs.",
      es: "Abre la página pública de comisiones de un banco (busca \"[nombre del banco] comisiones\"; no necesitas iniciar sesión) o el Buró de Entidades Financieras de la CONDUSEF, que compara a bancos y otras instituciones financieras por quejas, multas y comisiones. Encuentra la comisión por manejo de cuenta, la de saldo mínimo y la de cajeros de otros bancos.",
    }),
    ask: T("Which fee would be easiest to pay by accident?", "¿Qué comisión sería más fácil de pagar sin querer?"),
  }),
  m("compare2", {
    unit: "banking",
    icon: "scale",
    time: 20,
    goals: ["emergency"],
    title: T("Compare two places to keep savings", "Compara dos lugares para guardar tu ahorro"),
    how: T("Find the APY of two savings accounts — say, a big bank and an online bank. Check that both are FDIC-insured, and note any fees or minimums.", "Busca el APY de dos cuentas de ahorro, por ejemplo, un banco grande y uno en línea. Revisa que las dos estén aseguradas por la FDIC y anota comisiones o saldos mínimos.", {
      en: "Find the GAT of two options — say, a bank savings account and CETES at cetesdirecto.com. Check that the bank is covered by IPAB, and note any fees or minimums.",
      es: "Busca el GAT de dos opciones, por ejemplo, una cuenta de ahorro de un banco y CETES en cetesdirecto.com. Revisa que el banco esté protegido por el IPAB y anota comisiones o montos mínimos.",
    }),
    ask: T("Besides the rate, what mattered?", "Además de la tasa, ¿qué importó?"),
  }),

  // Your first paycheck
  m("paystub", {
    unit: "paycheck",
    icon: "card",
    time: 15,
    title: T("Read a real pay stub", "Lee un recibo de pago real", { en: "Read a real payslip", es: "Lee un recibo de nómina real" }),
    how: T("Look at your latest pay stub. Find gross pay, each tax and deduction, and net pay. Check that the hours and the pay rate are right.", "Revisa tu recibo de pago más reciente. Encuentra el pago bruto, cada impuesto y descuento, y el pago neto. Revisa que las horas y la tarifa estén bien.", {
      en: "Look at your latest payslip (recibo de nómina). Find the percepciones (what you earned), the deducciones (ISR, IMSS) and the net pay.",
      es: "Revisa tu recibo de nómina más reciente. Encuentra las percepciones (lo que ganaste), las deducciones (ISR, IMSS) y el neto.",
    }),
    teen: T("If you have a job, look at your latest pay stub. If not, ask a parent or another working adult to look at one with you — they can cover the amounts. Find gross pay, taxes and deductions, and net pay.", "Si tienes trabajo, revisa tu recibo de pago más reciente. Si no, pídele a tu mamá, papá u otro adulto que trabaje que revise uno contigo; pueden tapar las cantidades. Encuentra el pago bruto, los impuestos y descuentos, y el neto.", {
      en: "If you have a job, look at your latest payslip. If not, ask a parent or another working adult to look at a recibo de nómina with you — they can cover the amounts. Find the percepciones, the deducciones and the net pay.",
      es: "Si tienes trabajo, revisa tu recibo de nómina más reciente. Si no, pídele a tu mamá, papá u otro adulto que trabaje que revise uno contigo; pueden tapar las cantidades. Encuentra las percepciones, las deducciones y el neto.",
    }),
    ask: T("Which deduction didn't you expect?", "¿Qué descuento no esperabas?"),
  }),
  m("hours", {
    unit: "paycheck",
    icon: "clock",
    time: 5,
    title: T("Price something in hours of work", "Calcula algo en horas de trabajo"),
    how: T("Pick something you want. Divide its price by an hourly pay — yours, or an example like {$15|60} an hour. That's how many hours of work it costs.", "Elige algo que quieras. Divide su precio entre un pago por hora: el tuyo o uno de ejemplo, como {$15|60} por hora. Esas son las horas de trabajo que cuesta."),
    ask: T("Is it worth that many hours to you?", "¿Para ti vale esas horas?"),
  }),

  // Debt & credit
  m("cardterms", {
    unit: "credit",
    icon: "card",
    time: 15,
    title: T("Find the real cost of a credit card", "Encuentra el costo real de una tarjeta"),
    how: T("Open a credit card's public terms (search \"[card name] pricing and terms\"). Find the APR, the annual fee and the late fee. Just reading — don't apply.", "Abre los términos públicos de una tarjeta de crédito (busca \"[nombre de la tarjeta] pricing and terms\"). Encuentra la APR, la cuota anual y el cargo por pago tardío. Solo lee; no la solicites.", {
      en: "Open a credit card's public page and find its CAT, its annual fee (anualidad) and its late-payment fee. CONDUSEF's comparison tools help. Just reading — don't apply.",
      es: "Abre la página pública de una tarjeta de crédito y encuentra su CAT, la anualidad y la comisión por pago tardío. Las herramientas de comparación de la CONDUSEF ayudan. Solo lee; no la solicites.",
    }),
    ask: T("Which number surprised you?", "¿Qué número te sorprendió?"),
  }),
  m("creditreport", {
    unit: "credit",
    icon: "shield",
    time: 20,
    adult: true,
    title: T("Check your credit report for free", "Revisa tu reporte de crédito gratis"),
    how: T("Get your free credit report at AnnualCreditReport.com — the official site; skip look-alikes. Check that every account on it is yours. No accounts yet? That's normal.", "Consigue tu reporte de crédito gratis en AnnualCreditReport.com, el sitio oficial; evita imitaciones. Revisa que cada cuenta sea tuya. ¿Aún no tienes cuentas? Es normal.", {
      en: "Request your free Reporte de Crédito Especial from Buró de Crédito (burodecredito.com.mx) — you can get one free every 12 months. Check that every account on it is yours. No credit yet? That's normal.",
      es: "Pide tu Reporte de Crédito Especial gratis en Buró de Crédito (burodecredito.com.mx); puedes obtener uno gratis cada 12 meses. Revisa que cada cuenta sea tuya. ¿Aún no tienes créditos? Es normal.",
    }),
    ask: T("Did anything look unfamiliar?", "¿Algo se veía desconocido?"),
  }),
  m("debtrate", {
    unit: "credit",
    icon: "card",
    time: 10,
    goals: ["debt"],
    needsGoal: "debt",
    title: T("Find the rate on what you owe", "Encuentra la tasa de lo que debes"),
    how: T("Look at a statement for a card or loan you have. Find the APR, the minimum payment, and how long paying only the minimum would take (card statements show this).", "Revisa el estado de cuenta de una tarjeta o préstamo que tengas. Encuentra la APR, el pago mínimo y cuánto tardarías pagando solo el mínimo (los estados de cuenta de tarjetas lo muestran).", {
      en: "Look at a statement for a card or loan you have. Find the CAT, the interest rate, the minimum payment, and the payment that avoids interest (pago para no generar intereses).",
      es: "Revisa el estado de cuenta de una tarjeta o préstamo que tengas. Encuentra el CAT, la tasa de interés, el pago mínimo y el pago para no generar intereses.",
    }),
    ask: T("Which number stood out?", "¿Qué número te llamó la atención?"),
  }),

  // Scams and fraud
  m("redflags", {
    unit: "scams",
    icon: "shield",
    time: 10,
    title: T("Check 3 messages for red flags", "Revisa 3 mensajes en busca de señales de alerta"),
    how: T("Look through your email, texts or DMs for messages that rush you, ask you to click a link, or ask for a code or password. Don't click or reply — just spot the signs.", "Revisa tu correo, mensajes o DMs y busca los que te apuran, te piden abrir un enlace o te piden un código o una contraseña. No abras ni respondas: solo detecta las señales."),
    ask: T("What gave them away?", "¿Qué los delató?"),
  }),
  m("twostep", {
    unit: "scams",
    icon: "lock",
    time: 10,
    title: T("Turn on two-step verification", "Activa la verificación en dos pasos"),
    how: T("Pick one important account — your email is a good start — and turn on two-step verification in its security settings.", "Elige una cuenta importante (tu correo es un buen inicio) y activa la verificación en dos pasos en su configuración de seguridad."),
    teen: T("Pick one important account — your email is a good start — and turn on two-step verification in its security settings. Ask a parent or guardian if you get stuck.", "Elige una cuenta importante (tu correo es un buen inicio) y activa la verificación en dos pasos en su configuración de seguridad. Si te atoras, pídele ayuda a tu mamá, papá o tutor."),
    ask: T("Was it easier or harder than you expected?", "¿Fue más fácil o más difícil de lo que esperabas?"),
  }),

  // Compound interest
  m("interview", {
    unit: "compound",
    icon: "chat",
    time: "week",
    title: T("Ask someone older about saving", "Pregúntale a alguien mayor sobre ahorrar"),
    how: T("Ask a parent, grandparent or another adult you trust: \"What do you wish you'd known about money at my age?\" Listen for anything about starting early.", "Pregúntale a tu mamá, papá, abuelo, abuela u otro adulto de confianza: \"¿Qué te hubiera gustado saber sobre el dinero a mi edad?\" Pon atención a lo que diga sobre empezar temprano."),
    ask: T("What did they say?", "¿Qué te dijeron?"),
  }),

  // Taxes
  m("receipt", {
    unit: "taxes",
    icon: "card",
    time: 5,
    title: T("Find the sales tax on a receipt", "Encuentra el impuesto en un ticket", { en: "Find the IVA on a receipt", es: "Encuentra el IVA en un ticket" }),
    how: T("Grab a store receipt. Find the subtotal, the tax and the total. Work out the rate: tax ÷ subtotal. How close is it to the national average of about {@salesTaxExample}?", "Toma un ticket de una tienda. Encuentra el subtotal, el impuesto y el total. Calcula la tasa: impuesto ÷ subtotal. ¿Qué tan cerca está del promedio nacional, de alrededor de {@salesTaxExample}?", {
      en: "Grab a store receipt (ticket) or an invoice — many show the IVA on its own line. Compare it with the total: at {@ivaRate}, IVA is about 14% of a price that includes it.",
      es: "Toma un ticket o una factura; muchos muestran el IVA en su propia línea. Compáralo con el total: con una tasa de {@ivaRate}, el IVA es alrededor del 14% de un precio que ya lo incluye.",
    }),
    ask: T("How much tax was on it?", "¿Cuánto impuesto tenía?"),
  }),
  m("taxid", {
    unit: "taxes",
    icon: "user",
    time: 10,
    title: T("Know where your Social Security card is", "Ubica tu tarjeta del Seguro Social", { en: "Find out how to get your RFC", es: "Averigua cómo sacar tu RFC" }),
    how: T("Find out where your Social Security card is kept. It belongs somewhere safe at home — not in your wallet or your phone's photos. Notice who asks for your number, and why.", "Averigua dónde se guarda tu tarjeta del Seguro Social. Debe estar en un lugar seguro en casa, no en tu cartera ni en las fotos del celular. Fíjate quién te pide tu número y para qué.", {
      en: "On sat.gob.mx, look up how to get an RFC with your CURP. Note what you need and whether you can do it online. You'll need an RFC for a formal job or to issue invoices.",
      es: "En sat.gob.mx, busca cómo obtener tu RFC con tu CURP. Anota qué necesitas y si puedes hacerlo en línea. Vas a necesitar el RFC para un trabajo formal o para facturar.",
    }),
    ask: T("What did you find out?", "¿Qué averiguaste?"),
  }),

  // Insurance
  m("askins", {
    unit: "insurance",
    icon: "shield",
    time: "week",
    title: T("Ask about one insurance policy", "Pregunta por un seguro"),
    how: T("Ask a family member about one insurance they have — car, health, home or phone. What does it cover, what's the deductible, and have they ever used it? Amounts are optional.", "Pregúntale a alguien de tu familia por un seguro que tenga: de auto, de gastos médicos, de casa o del celular. ¿Qué cubre, cuál es el deducible y alguna vez lo ha usado? Las cantidades son opcionales."),
    ask: T("What did it cover that surprised you?", "¿Qué cubría que te sorprendió?"),
  }),
  m("carcost", {
    unit: "insurance",
    icon: "car",
    time: 20,
    goals: ["car"],
    title: T("Price the full cost of a car", "Calcula el costo completo de un coche"),
    how: T("Pick a car you'd like. Besides the price, estimate a month of gas, insurance and upkeep — ask a family member or look online. Add it up.", "Elige un coche que te guste. Además del precio, estima un mes de gasolina, seguro y mantenimiento; pregúntale a alguien de tu familia o busca en línea. Súmalo."),
    ask: T("How did the monthly cost compare with what you expected?", "¿Cómo se comparó el costo mensual con lo que esperabas?"),
  }),

  // The psychology of money
  m("fomo3", {
    unit: "psychology",
    icon: "sparkles",
    time: "days",
    title: T("Spot 3 ads that use FOMO", "Detecta 3 anuncios que usan FOMO"),
    how: T("Over the next few days, notice ads or posts with countdown timers, \"only 2 left\" or \"everyone's getting this.\" Screenshot or write down three.", "En los próximos días, fíjate en anuncios o publicaciones con cuentas regresivas, \"solo quedan 2\" o \"todos lo están comprando\". Toma captura o anota tres."),
    ask: T("Which trick works best on you?", "¿Qué truco te funciona más a ti?"),
  }),
  m("wait48", {
    unit: "psychology",
    icon: "clock",
    time: "days",
    title: T("Try a 48-hour wait", "Prueba esperar 48 horas"),
    how: T("Next time you want something you didn't plan for, wait 48 hours before buying. Put it on a list and look again in two days.", "La próxima vez que quieras algo que no planeabas, espera 48 horas antes de comprarlo. Anótalo en una lista y vuelve a verlo en dos días."),
    ask: T("Did you still want it?", "¿Todavía lo querías?"),
  }),

  // Stocks, funds, risk
  m("company", {
    unit: "stocks",
    icon: "chart",
    time: 10,
    title: T("Look up a company you buy from", "Investiga una empresa a la que le compras"),
    how: T("Pick a brand you use. Find the company behind it, its ticker and what it sells most. If it's in the practice portfolio, look at its 1-year chart.", "Elige una marca que uses. Encuentra la empresa detrás de ella, su clave de cotización (ticker) y qué vende más. Si está en el portafolio de práctica, mira su gráfica de 1 año."),
    ask: T("Would you have guessed how it did?", "¿Habrías adivinado cómo le fue?"),
  }),
  m("fundfees", {
    unit: "etf",
    icon: "pie",
    time: 10,
    goals: ["invest"],
    title: T("Look up a fund's yearly fee", "Busca la comisión anual de un fondo"),
    how: T("Pick a well-known index fund or ETF and find its expense ratio on the fund's page. Work out the yearly cost on {$1000|20000}: fee % × amount.", "Elige un fondo indexado o ETF conocido y busca su comisión anual (expense ratio) en su página. Calcula el costo al año sobre {$1000|20000}: comisión % × monto.", {
      en: "Pick a well-known index fund or ETF and find its yearly management fee (comisión) on its page or a broker's. Work out the yearly cost on {$1000|20000}: fee % × amount.",
      es: "Elige un fondo indexado o ETF conocido y busca su comisión anual por administración en su página o en la de una casa de bolsa. Calcula el costo al año sobre {$1000|20000}: comisión % × monto.",
    }),
    ask: T("What would the fee cost in a year?", "¿Cuánto costaría la comisión en un año?"),
  }),
  m("count", {
    unit: "risk",
    icon: "layers",
    time: 10,
    goals: ["invest"],
    title: T("Count the companies in one fund", "Cuenta las empresas de un fondo"),
    how: T("Look up how many companies a broad index fund holds — it's on the fund's page. Compare that with owning one company's stock.", "Busca cuántas empresas tiene un fondo indexado amplio; viene en su página. Compáralo con tener acciones de una sola empresa."),
    ask: T("How would one bad company affect each?", "¿Cómo afectaría una empresa mala a cada uno?"),
  }),
  m("hype", {
    unit: "crypto",
    icon: "bulb",
    time: 10,
    title: T("Spot a \"guaranteed returns\" claim", "Detecta una promesa de \"ganancias garantizadas\""),
    how: T("Find a post, video or ad that promises big or guaranteed returns — crypto, trading courses, \"passive income.\" List its red flags. Don't click, sign up or pay.", "Encuentra una publicación, video o anuncio que prometa ganancias grandes o garantizadas: cripto, cursos de trading, \"ingresos pasivos\". Haz una lista de sus señales de alerta. No abras enlaces, no te registres ni pagues."),
    ask: T("What red flags did you find?", "¿Qué señales de alerta encontraste?"),
  }),

  // Retirement
  m("benefits", {
    unit: "retire",
    icon: "building",
    time: 10,
    title: T("Find the benefits in a job posting", "Encuentra las prestaciones de una vacante"),
    how: T("Open a few job postings that interest you. Look for a 401(k) and whether the employer adds a match, plus health insurance and paid time off.", "Abre algunas vacantes que te interesen. Busca si ofrecen 401(k) y si el empleador aporta (match), además de seguro médico y días de descanso pagados.", {
      en: "Open a few job postings that interest you. Look for the prestaciones: IMSS, aguinaldo, vacation days, and anything \"above the law\" like a savings fund or grocery vouchers.",
      es: "Abre algunas vacantes que te interesen. Busca las prestaciones: IMSS, aguinaldo, vacaciones y cualquier prestación superior a la ley, como fondo de ahorro o vales de despensa.",
    }),
    ask: T("Which benefit would matter most to you?", "¿Qué prestación te importaría más?"),
  }),
  m("afore", {
    unit: "retire",
    icon: "piggy",
    time: 15,
    only: "MX",
    adult: true,
    title: T("Find your AFORE", "Localiza tu AFORE"),
    how: T("If you've had a formal job, find which AFORE holds your account using your CURP — in the AforeMóvil app or at e-sar.com.mx. Check that your contact details are right.", "Si has tenido un trabajo formal, averigua qué AFORE tiene tu cuenta con tu CURP, en la app AforeMóvil o en e-sar.com.mx. Revisa que tus datos de contacto estén bien."),
    ask: T("What did you find?", "¿Qué encontraste?"),
  }),

  // Earning more
  m("priceskill", {
    unit: "earning",
    icon: "chart",
    time: 20,
    title: T("Price a skill you have", "Ponle precio a algo que sabes hacer"),
    how: T("Pick something you could do for others — tutoring, pet sitting, editing videos. Find what similar services charge near you, list your costs, and work out your profit per hour.", "Elige algo que podrías hacer para otros: dar clases, cuidar mascotas, editar videos. Averigua cuánto cobran servicios parecidos cerca de ti, anota tus costos y calcula tu ganancia por hora."),
    teen: T("Pick something you could do for others — tutoring, pet sitting, editing videos. Find what similar services charge near you, list your costs, and work out your profit per hour. Talk with a parent or guardian before taking on any work.", "Elige algo que podrías hacer para otros: dar clases, cuidar mascotas, editar videos. Averigua cuánto cobran servicios parecidos cerca de ti, anota tus costos y calcula tu ganancia por hora. Habla con tu mamá, papá o tutor antes de aceptar cualquier trabajo."),
    ask: T("What would you earn per hour after costs?", "¿Cuánto ganarías por hora después de costos?"),
  }),

  // Reading the news
  m("headline", {
    unit: "news",
    icon: "news",
    time: "week",
    title: T("Explain a money headline", "Explica una noticia de dinero"),
    how: T("Read one business or money headline this week. Then explain it in your own words to a friend or family member — or to the tutor.", "Lee una noticia de negocios o de dinero esta semana. Luego explícala con tus palabras a alguien de tu familia o a un amigo, o al tutor."),
    ask: T("What question did they ask you?", "¿Qué te preguntaron?"),
  }),
];

export const missionById = (id) => MISSIONS.find((x) => x.id === id) || null;
