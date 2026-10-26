// UNIT — Taxes made simple. Its lessons and the concepts they teach (format in helpers.js).
import { T, card, choice, tf, act, concept } from "./helpers.js";

export default {
  id: "taxes",
  icon: "scale",
  title: T("Taxes made simple", "Impuestos sin complicaciones"),
  concepts: [
    concept(
      "taxes_purpose",
      T("What taxes are for", "Para qué son los impuestos"),
      card(T("The shared bill", "La cuenta compartida"), T("Taxes pay for things a whole country shares: roads, schools, hospitals, firefighters, parks. There are taxes on income, on purchases (sales tax in the US, IVA in Mexico) and on paychecks for social programs.", "Los impuestos pagan lo que todo un país comparte: caminos, escuelas, hospitales, bomberos, parques. Hay impuestos sobre el ingreso, sobre las compras (sales tax en EE. UU., IVA en México) y sobre el sueldo para programas sociales.")),
      tf("taxes_purpose", T("Sales tax (or IVA) is a tax on things you buy.", "El sales tax (o el IVA) es un impuesto sobre lo que compras."), true, T("You pay it at the register — in Mexico it's already in the price.", "Lo pagas en la caja; en México ya viene incluido en el precio.")),
      choice(
        "taxes_purpose",
        T("A {$100|1160} purchase in a place where the tax is 16% and already included in the price. How much of it is tax?", "Una compra de {$100|1160} en un lugar donde el impuesto es de 16% y ya viene incluido en el precio. ¿Cuánto es impuesto?"),
        [T("About {$13.79|160}", "Unos {$13.79|160}"), T("About {$16|186}", "Unos {$16|186}"), T("Nothing", "Nada")],
        0,
        T("If tax is included, the price is 116% of the base: {$100|1160} ÷ 1.16 ≈ {$86.21|1000}, so the tax is about {$13.79|160}.", "Si el impuesto está incluido, el precio es el 116% de la base: {$100|1160} ÷ 1.16 ≈ {$86.21|1000}, así que el impuesto es de unos {$13.79|160}."),
        [null, T("16% of the full price would be tax on top of tax. When it's included, it's 16% of the base.", "El 16% del precio completo sería impuesto sobre impuesto. Cuando está incluido, es el 16% de la base."), T("Included doesn't mean zero — it's inside the price.", "Incluido no significa cero: está dentro del precio.")]
      )
    ),
    concept(
      "tax_brackets",
      T("Tax brackets", "Tasas por tramos"),
      card(T("Slices, not a cliff", "Rebanadas, no un precipicio"), T("Income tax is progressive: income is split into slices, and each slice is taxed at its own rate. Earning enough to reach a higher bracket only taxes the extra at the higher rate — the rest stays at the lower rates.", "El impuesto sobre la renta es progresivo: el ingreso se divide en rebanadas y cada una paga su propia tasa. Ganar lo suficiente para entrar a un tramo más alto solo grava lo extra con la tasa más alta; lo demás sigue con las tasas bajas.")),
      tf("tax_brackets", T("Getting a raise can never make you take home less after income tax.", "Un aumento nunca puede hacer que te quede menos después del impuesto sobre la renta."), true, T("Only the extra is taxed at the higher rate, so you always keep part of a raise.", "Solo lo extra paga la tasa más alta, así que siempre te queda parte del aumento.")),
      choice(
        "tax_brackets",
        T("Example brackets: 0% up to {$10000|150000}, 10% above that. You earn {$15000|200000}. What's your tax?", "Tramos de ejemplo: 0% hasta {$10000|150000} y 10% arriba de eso. Ganas {$15000|200000}. ¿Cuánto pagas?"),
        [T("{$500|5000}", "{$500|5000}"), T("{$1500|20000}", "{$1500|20000}"), T("Nothing", "Nada")],
        0,
        T("Only the {$5000|50000} above {$10000|150000} is taxed at 10%: {$500|5000}. That's an effective rate of about 3.3%.", "Solo los {$5000|50000} arriba de {$10000|150000} pagan 10%: {$500|5000}. Es una tasa efectiva de cerca de 3.3%.", { en: "Only the 50,000 pesos above 150,000 is taxed at 10%: 5,000 pesos. That's an effective rate of 2.5%.", es: "Solo los 50,000 pesos arriba de 150,000 pagan 10%: 5,000 pesos. Es una tasa efectiva de 2.5%." }),
        [null, T("That would be 10% of everything. The first slice is taxed at 0%.", "Eso sería el 10% de todo. La primera rebanada paga 0%."), T("Your income goes above the 0% slice, so the part above it is taxed.", "Tu ingreso pasa la rebanada de 0%, así que la parte de arriba sí paga.")]
      )
    ),
    concept(
      "tax_filing",
      T("Filing a tax return", "Presentar tu declaración"),
      card(
        T("Settling up once a year", "Hacer cuentas una vez al año"),
        T("Withholding is an estimate. Once a year you file a return (Form 1040) — usually by {@usTaxDeadline} — to settle up: if too much was withheld you get a refund; if too little, you owe the rest. Even if you don't have to file, filing can get your withheld tax back.", "La retención es un cálculo aproximado. Una vez al año presentas tu declaración (formulario 1040), normalmente a más tardar el {@usTaxDeadline}, para hacer cuentas: si te retuvieron de más, te devuelven; si fue de menos, pagas lo que falta. Aunque no estés obligado, declarar puede devolverte lo que te retuvieron.", {
          en: "Your employer's ISR withholding usually settles things. You must file a \"declaración anual\" (by {@mxTaxDeadline}) if, for example, you earned more than {@mxSalaryFilingMin} in a year or had two employers at once. Filing can also get you a refund (\"saldo a favor\").",
          es: "La retención de ISR de tu patrón normalmente lo resuelve. Debes presentar la declaración anual (a más tardar el {@mxTaxDeadline}) si, por ejemplo, ganaste más de {@mxSalaryFilingMin} en el año o tuviste dos patrones al mismo tiempo. Declarar también te puede dar un saldo a favor.",
        })
      ),
      tf("tax_filing", T("A tax refund is money that was withheld from you beyond what you owed.", "Una devolución de impuestos es dinero que te retuvieron de más."), true, T("It's your own money coming back, not a bonus.", "Es tu propio dinero de regreso, no un premio.")),
      choice(
        "tax_filing",
        T("{$900|9000} was withheld from your pay this year, but you only owed {$400|5000}. What happens when you file?", "Este año te retuvieron {$900|9000}, pero solo debías {$400|5000}. ¿Qué pasa al declarar?"),
        [T("You get about {$500|4000} back", "Te devuelven unos {$500|4000}"), T("You owe {$500|4000} more", "Debes {$500|4000} más"), T("Nothing changes", "No cambia nada")],
        0,
        T("You paid more than you owed, so the difference comes back to you as a refund.", "Pagaste más de lo que debías, así que la diferencia te regresa como devolución.", { en: "You paid more than you owed, so the difference is a \"saldo a favor\" you can get back.", es: "Pagaste más de lo que debías, así que la diferencia es un saldo a favor que puedes recuperar." }),
        [null, T("You'd owe more only if too little had been withheld.", "Deberías más solo si te hubieran retenido de menos."), T("Withholding over what you owe comes back only if you file.", "Lo retenido de más solo regresa si presentas tu declaración.")]
      )
    ),
    concept(
      "tax_id",
      T("Your tax ID", "Tu identificación fiscal"),
      card(T("A number that follows you", "Un número que te acompaña"), T("In the US, your Social Security number (SSN) is your tax ID — for jobs, banks and tax returns. Guard it: with your SSN, someone can open accounts in your name.", "En EE. UU., tu número de Seguro Social (SSN) es tu identificación fiscal: para trabajos, bancos y declaraciones. Cuídalo: con tu SSN alguien puede abrir cuentas a tu nombre.", { en: "In Mexico, your RFC is your taxpayer ID, issued by the SAT for free using your CURP. You'll need it for a formal job and to invoice if you work on your own. Keep your e.firma and password private.", es: "En México, tu RFC es tu clave de contribuyente, que el SAT te da gratis con tu CURP. Lo vas a necesitar para un trabajo formal y para facturar si trabajas por tu cuenta. Mantén en privado tu e.firma y tu contraseña." })),
      tf("tax_id", T("You should share your Social Security number only when it's truly required.", "Solo debes compartir tu número de Seguro Social cuando de verdad lo piden por ley.", { en: "You can get your RFC from the SAT for free.", es: "Puedes sacar tu RFC en el SAT gratis." }), true, T("Employers, banks and the IRS need it; most others don't.", "Lo necesitan empleadores, bancos y el IRS; casi nadie más.", { en: "Online with your CURP, or at an SAT office — no fee.", es: "En línea con tu CURP o en una oficina del SAT, sin costo." })),
      choice(
        "tax_id",
        T("A website offering a free gift asks for your Social Security number. What should you do?", "Un sitio que regala algo te pide tu número de Seguro Social. ¿Qué haces?", { en: "Someone offers to \"get your RFC for you\" for a fee, if you send your e.firma password. What should you do?", es: "Alguien te ofrece \"sacarte tu RFC\" por un pago, si le mandas la contraseña de tu e.firma. ¿Qué haces?" }),
        [T("Don't give it — a giveaway has no reason to need it", "No darlo: un regalo no tiene por qué necesitarlo", { en: "Don't — the RFC is free from the SAT, and your e.firma must stay private", es: "No: el RFC es gratis en el SAT y tu e.firma debe ser privada" }), T("Give it if the site looks professional", "Darlo si el sitio se ve profesional", { en: "Pay, if they seem trustworthy", es: "Pagar, si parecen confiables" }), T("Give only the last four digits, then the rest later", "Dar solo los últimos cuatro dígitos y luego el resto", { en: "Send the password but not the file", es: "Mandar la contraseña, pero no el archivo" })],
        0,
        T("Your SSN unlocks credit in your name. Share it only with employers, banks and tax authorities.", "Tu SSN abre la puerta a créditos a tu nombre. Compártelo solo con empleadores, bancos y autoridades fiscales.", { en: "Your e.firma works like a legal signature. With it, someone can act in your name before the SAT.", es: "Tu e.firma funciona como una firma legal. Con ella, alguien puede actuar a tu nombre ante el SAT." }),
        [null, T("Looking professional is easy. The question is whether they need it — and they don't.", "Verse profesional es fácil. La pregunta es si lo necesitan, y no.", { en: "Paying doesn't make it safe — and the RFC is free anyway.", es: "Pagar no lo vuelve seguro, y el RFC es gratis de todos modos." }), T("Pieces of your SSN are still valuable to scammers.", "Los pedazos de tu SSN también le sirven a un estafador.", { en: "The password is the key. Never share it.", es: "La contraseña es la llave. Nunca la compartas." })]
      )
    ),
  ],
  lessons: [
    {
      id: "taxes-1",
      title: T("What taxes are for", "Para qué sirven los impuestos"),
      steps: [
        card(T("What you get for them", "Lo que recibes a cambio"), T("Public schools, roads, emergency services, parks, public health. Taxes are how a country pays for what everyone uses together.", "Escuelas públicas, caminos, servicios de emergencia, parques, salud pública. Los impuestos son la forma en que un país paga lo que todos usamos juntos.")),
        card(T("Three you'll meet", "Tres que vas a conocer"), T("Income tax (on what you earn), payroll taxes (Social Security and Medicare), and sales tax on what you buy — usually added at the register, at rates that vary by state.", "El impuesto sobre la renta (sobre lo que ganas), los impuestos de nómina (Social Security y Medicare) y el sales tax sobre lo que compras, que normalmente se suma en la caja y cambia según el estado.", { en: "ISR (income tax, on what you earn), IMSS contributions on your salary, and IVA on what you buy — {@ivaRate} in most of the country, already included in shelf prices.", es: "El ISR (impuesto sobre lo que ganas), las cuotas del IMSS sobre tu salario y el IVA sobre lo que compras: {@ivaRate} en casi todo el país, ya incluido en los precios." })),
        choice(
          "taxes_purpose",
          T("Which of these is usually paid for with taxes?", "¿Cuál de estos se paga normalmente con impuestos?"),
          [T("Public schools", "Las escuelas públicas"), T("Your streaming subscription", "Tu suscripción de streaming"), T("A private company's ads", "La publicidad de una empresa privada")],
          0,
          T("Shared services like public schools are funded by taxes.", "Los servicios compartidos, como las escuelas públicas, se pagan con impuestos."),
          [null, T("Subscriptions are private purchases — you pay those yourself.", "Las suscripciones son compras privadas: las pagas tú."), T("Companies pay for their own ads.", "Las empresas pagan su propia publicidad.")]
        ),
        tf("taxes_purpose", T("In most US states, the price tag doesn't include sales tax.", "En la mayoría de los estados de EE. UU., la etiqueta no incluye el sales tax.", { en: "In Mexico, prices for shoppers already include IVA.", es: "En México, los precios al público ya incluyen el IVA." }), true, T("It's added at the register, so the total is a bit more than the tag.", "Se suma en la caja, así que el total es un poco más que la etiqueta.", { en: "That's why the tag is what you pay.", es: "Por eso lo que dice la etiqueta es lo que pagas." })),
        act("goals.salestax", T("See how much tax is in a price.", "Mira cuánto impuesto hay en un precio.")),
      ],
    },
    {
      id: "taxes-2",
      title: T("How tax brackets work", "Cómo funcionan los tramos"),
      steps: [
        card(T("A myth to drop", "Un mito que hay que soltar"), T("\"If I earn more, I'll move into a higher bracket and take home less.\" Not true. Higher rates apply only to the income inside the higher bracket.", "\"Si gano más, paso a un tramo más alto y me queda menos.\" No es cierto. Las tasas más altas solo se aplican al ingreso dentro de ese tramo.")),
        card(T("Marginal vs. effective", "Marginal vs. efectiva"), T("Your marginal rate is the rate on your last dollar. Your effective rate is your total tax divided by your income — always lower than your top rate.", "Tu tasa marginal es la tasa de tu último peso. Tu tasa efectiva es tu impuesto total entre tu ingreso, y siempre es menor que tu tasa más alta.")),
        choice(
          "tax_brackets",
          T("A raise moves part of your income into a higher bracket. What happens?", "Un aumento hace que parte de tu ingreso entre a un tramo más alto. ¿Qué pasa?"),
          [T("Only the part above the line is taxed at the higher rate", "Solo la parte arriba del límite paga la tasa más alta"), T("All your income is taxed at the higher rate", "Todo tu ingreso paga la tasa más alta"), T("You stop paying tax on the lower part", "Dejas de pagar impuesto sobre la parte baja")],
          0,
          T("That's how progressive brackets work: each slice keeps its own rate.", "Así funcionan los tramos progresivos: cada rebanada conserva su propia tasa."),
          [null, T("That's the myth. Only the slice above the line pays the higher rate.", "Ese es el mito. Solo la rebanada arriba del límite paga la tasa más alta."), T("The lower slices are still taxed at their lower rates.", "Las rebanadas bajas siguen pagando sus tasas bajas.")]
        ),
        tf("tax_brackets", T("Your effective tax rate is usually lower than your top bracket rate.", "Tu tasa efectiva suele ser menor que la tasa de tu tramo más alto."), true, T("Most of your income is taxed in the lower slices.", "La mayor parte de tu ingreso paga en las rebanadas bajas.")),
        act("goals.brackets", T("Move the income and watch each slice's tax.", "Mueve el ingreso y mira el impuesto de cada rebanada.")),
      ],
    },
    {
      id: "taxes-3",
      title: T("Filing your taxes", "Tu declaración de impuestos"),
      steps: [
        card(
          T("Once a year", "Una vez al año"),
          T("Each year you file a federal return (Form 1040), usually by {@usTaxDeadline}, using your W-2. Most states have a return too. Free filing options exist for many people — check the IRS website.", "Cada año presentas tu declaración federal (formulario 1040), normalmente a más tardar el {@usTaxDeadline}, usando tu W-2. La mayoría de los estados también tienen la suya. Hay opciones gratuitas para mucha gente: revisa el sitio del IRS.", { en: "If you're an employee, your employer's withholding usually covers it. You must file the declaración anual in April (by {@mxTaxDeadline}) if you earned more than {@mxSalaryFilingMin}, had two employers at once, or had other income. The SAT pre-fills much of it online.", es: "Si eres empleado, la retención de tu patrón normalmente lo cubre. Debes presentar la declaración anual en abril (a más tardar el {@mxTaxDeadline}) si ganaste más de {@mxSalaryFilingMin}, tuviste dos patrones al mismo tiempo u otros ingresos. El SAT llena buena parte en línea." })
        ),
        card(T("Refund or owe", "Devolución o pago"), T("Filing compares what was withheld with what you actually owe. Too much withheld? Refund. Too little? You pay the difference.", "Declarar compara lo que te retuvieron con lo que realmente debes. ¿Te retuvieron de más? Te devuelven. ¿De menos? Pagas la diferencia.")),
        choice(
          "tax_filing",
          T("Why might a teen with a part-time job want to file even if they don't have to?", "¿Por qué un joven con trabajo de medio tiempo querría declarar aunque no esté obligado?", { en: "What's a \"saldo a favor\"?", es: "¿Qué es un saldo a favor?" }),
          [T("To get back tax that was withheld from their pay", "Para recuperar el impuesto que le retuvieron", { en: "Tax you paid beyond what you owed, which you can get back", es: "Impuesto que pagaste de más y puedes recuperar" }), T("Filing doubles your pay", "Declarar duplica tu sueldo", { en: "A fine for filing late", es: "Una multa por declarar tarde" }), T("It's the only way to keep your job", "Es la única forma de conservar el trabajo", { en: "A discount at stores", es: "Un descuento en tiendas" })],
          0,
          T("If more was withheld than they owe, filing is how they get it back.", "Si le retuvieron más de lo que debe, declarar es la forma de recuperarlo.", { en: "If more was withheld than you owe, the difference is yours — you request it in your return.", es: "Si te retuvieron más de lo que debes, la diferencia es tuya: la pides en tu declaración." }),
          [null, T("A refund is your own money back, not extra pay.", "Una devolución es tu propio dinero de regreso, no un sueldo extra.", { en: "That's the opposite — a saldo a favor is money owed to you.", es: "Es lo contrario: un saldo a favor es dinero que te deben a ti." }), T("Taxes and your job are separate. Filing is about settling your taxes.", "Los impuestos y tu trabajo son cosas aparte. Declarar es para hacer cuentas.", { en: "It's a tax term, not a store promotion.", es: "Es un término fiscal, no una promoción." })]
        ),
        tf("tax_filing", T("Withholding during the year is only an estimate of what you owe.", "La retención durante el año es solo un cálculo aproximado de lo que debes."), true, T("Filing is when the real number is worked out.", "Al declarar es cuando se calcula el número real.")),
        act("goals.brackets", T("See how total tax and the effective rate change as income rises.", "Mira cómo cambian el impuesto total y la tasa efectiva cuando sube el ingreso.")),
      ],
    },
    {
      id: "taxes-4",
      title: T("Your tax ID", "Tu identificación fiscal"),
      steps: [
        card(T("Your number", "Tu número"), T("Your Social Security number is your tax ID in the US. Employers, banks and the IRS use it. If you don't have one, the IRS issues an ITIN for tax filing.", "Tu número de Seguro Social es tu identificación fiscal en EE. UU. Lo usan empleadores, bancos y el IRS. Si no tienes uno, el IRS emite un ITIN para declarar impuestos.", { en: "Your RFC is your taxpayer ID — the SAT issues it for free with your CURP. You'll need it for a formal job, to issue invoices (facturas) if you work on your own, and to file a return.", es: "Tu RFC es tu clave de contribuyente: el SAT lo da gratis con tu CURP. Lo vas a necesitar para un trabajo formal, para emitir facturas si trabajas por tu cuenta y para declarar." })),
        card(T("Guard it", "Cuídalo"), T("With your SSN, a thief can open credit in your name. Don't carry the card, don't post it, and give it only when it's truly required.", "Con tu SSN, un ladrón puede sacar créditos a tu nombre. No traigas la tarjeta, no la publiques y dala solo cuando de verdad te la pidan por ley.", { en: "Your e.firma (electronic signature) and SAT password let someone act in your name. Keep them private, and be wary of anyone offering to do SAT procedures for you for a fee.", es: "Tu e.firma y tu contraseña del SAT permiten actuar a tu nombre. Mantenlas en privado y desconfía de quien te ofrezca hacer trámites del SAT por un pago." })),
        choice(
          "tax_id",
          T("Who usually needs your Social Security number?", "¿Quién suele necesitar tu número de Seguro Social?", { en: "What is the RFC?", es: "¿Qué es el RFC?" }),
          [T("Your employer, your bank and the IRS", "Tu empleador, tu banco y el IRS", { en: "Your taxpayer ID from the SAT", es: "Tu clave de contribuyente del SAT" }), T("Any website that asks", "Cualquier sitio que lo pida", { en: "Your bank account number", es: "El número de tu cuenta bancaria" }), T("Your friends", "Tus amigos", { en: "A school ID", es: "Una credencial escolar" })],
          0,
          T("Those three have legal reasons to need it. Almost everyone else doesn't.", "Esos tres tienen razones legales para necesitarlo. Casi nadie más.", { en: "It identifies you for taxes, jobs and invoices.", es: "Te identifica para impuestos, trabajos y facturas." }),
          [null, T("Most sites have no reason to need it — asking is a warning sign.", "La mayoría de los sitios no tiene por qué necesitarlo: pedirlo es señal de alerta.", { en: "Your bank account has its own number (CLABE).", es: "Tu cuenta bancaria tiene su propio número (CLABE)." }), T("Friends never need it.", "Tus amigos nunca lo necesitan.", { en: "School IDs are separate from taxes.", es: "Las credenciales escolares no tienen que ver con impuestos." })]
        ),
        tf("tax_id", T("Posting a photo of your Social Security card online is risky.", "Publicar una foto de tu tarjeta de Seguro Social en internet es riesgoso.", { en: "Your e.firma should be kept private, like a signature.", es: "Tu e.firma debe mantenerse privada, como una firma." }), true, T("Anyone could copy the number and use it.", "Cualquiera podría copiar el número y usarlo.", { en: "With it, someone can act in your name before the SAT.", es: "Con ella, alguien puede actuar a tu nombre ante el SAT." })),
        act("goals.paycheck", T("Look again at what's taken out of a paycheck — now you know where it goes.", "Vuelve a ver lo que se descuenta de un sueldo; ahora sabes a dónde va."), { gross: [1800, 11000] }),
      ],
    },
  ],
};
