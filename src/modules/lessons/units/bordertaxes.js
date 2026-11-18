// UNIT — Taxes in two countries (Wave 1, Life Across Borders, Go further; Border).
// DRAFT. NEEDS A LICENSED TAX PROFESSIONAL (US and Mexico) BEFORE IT SHIPS. Held for review; it is
// the last unit in Wave 1. To ship it, follow the steps at the top of sending.js. It does not
// teach the FBAR (foreign account) report: that is in the live "Money across borders" unit.
// Mission to add then: "Write down three questions to ask a tax preparer (just a list; share no
// numbers)". Reflection: "Which question would you most want answered?"
// This unit teaches how the two systems work and where to get help. It never says what a person
// should file or claim. People and amounts are made up.
// Border units write both countries at once, so amounts are {US$…} and {MX$…}.
import { T, card, choice, tf, act, concept, order, match, number, scenario, fit } from "./helpers.js";

export default {
  id: "bordertaxes",
  icon: "scale",
  draft: true,
  title: T("Taxes in two countries", "Impuestos en dos países"),
  sources: [
    // "Read" = the page was opened. "Seen" = a search summary of the page; a reviewer opens each.
    { name: "IRS, \"U.S. citizens and residents abroad: filing requirements\" (read): generally required to file; worldwide gross income; excluded income still counts toward the filing test", url: "https://www.irs.gov/individuals/international-taxpayers/us-citizens-and-residents-abroad-filing-requirements", checked: "2026-11-17" },
    { name: "ANAM, \"Declaración de dinero\" (read): declare more than the equivalent of US$10,000 on entering or leaving Mexico; not a crime in itself, not declaring is; fine of 20% to 40% of the excess", url: "https://www.anam.gob.mx/declaracion-de-dinero/", checked: "2026-11-17" },
    { name: "IRS, ghost preparers (read): a preparer who won't sign or give a PTIN is a major red flag; the taxpayer is responsible for what's filed", url: "https://www.irs.gov/newsroom/be-informed-not-fooled-by-ghost-preparers-and-tax-credit-scams", checked: "2026-11-17" },
    { name: "IRS, Publication 54 and Topic 851 (seen): citizens and residents taxed on worldwide income; green card test and substantial presence test; nonresident aliens taxed on US-source income", url: "https://www.irs.gov/publications/p54", checked: "2026-11-17" },
    { name: "IRS, Gifts from foreign person / Form 3520 (seen): information return for foreign gifts above $100,000; related persons added together", url: "https://www.irs.gov/businesses/gifts-from-foreign-person", checked: "2026-11-17" },
    { name: "IRS, Foreign Tax Credit and the US–Mexico income tax convention, Article 24 (seen): a credit for income tax paid to Mexico", url: "https://www.irs.gov/pub/irs-trty/mexico.pdf", checked: "2026-11-17" },
    { name: "CBP, Money and other monetary instruments / FinCEN Form 105 (seen): report more than $10,000 carried in or out; groups traveling together add their amounts", url: "https://www.cbp.gov/travel/international-visitors/money-monetary-instruments", checked: "2026-11-17" },
    { name: "SAT, Ley del ISR art. 93 (seen) and Código Fiscal de la Federación art. 9 (seen): exempt gifts; residence by home and center of vital interests", url: "https://wwwmatnp.sat.gob.mx/articulo/15199/articulo-93", checked: "2026-11-17" },
  ],
  concepts: [
    concept(
      "tax_residence",
      T("Residence and where you owe", "Residencia y dónde debes impuestos"),
      card(
        T("Two questions", "Dos preguntas"),
        T(
          "Countries ask where you live and where the money came from. The US taxes citizens and residents on income from anywhere in the world, and non-residents on US income. Mexico looks first at where your home is. Living in one country and earning in the other can bring both countries' rules.",
          "Los países preguntan dónde vives y de dónde vino el dinero. EE. UU. grava a ciudadanos y residentes por ingresos de cualquier parte del mundo, y a no residentes por ingresos de EE. UU. México mira primero dónde está tu casa. Vivir en un país y ganar en el otro puede traer las reglas de los dos."
        )
      ),
      tf("tax_residence", T("A US citizen who moves to Mexico has no more US tax duties.", "Un ciudadano de EE. UU. que se muda a México ya no tiene obligaciones de impuestos en EE. UU."), false, T("The IRS says citizens and residents abroad generally must still file.", "El IRS dice que los ciudadanos y residentes en el extranjero por lo general deben seguir presentando declaración.")),
      choice(
        "tax_residence",
        T("A US citizen lives in Mexico and earns pesos there. What's generally true about US tax?", "Un ciudadano de EE. UU. vive en México y gana pesos ahí. ¿Qué suele ser cierto sobre los impuestos de EE. UU.?"),
        [T("The US still counts income from anywhere, so a filing may be required", "EE. UU. sigue contando ingresos de cualquier parte, así que quizá deba presentar declaración"), T("The US stops counting it", "EE. UU. deja de contarlo"), T("Only Mexico can tax it", "Solo México puede gravarlo")],
        0,
        T("US citizens are generally taxed on worldwide income, wherever they live.", "Los ciudadanos de EE. UU. generalmente pagan impuestos por ingresos de todo el mundo, vivan donde vivan."),
        [null, T("Living abroad doesn't end the US filing duty by itself.", "Vivir en el extranjero no termina por sí solo la obligación de declarar en EE. UU."), T("Both countries can have a claim. Relief is a separate question.", "Los dos países pueden tener una pretensión. El alivio es otra cuestión.")]
      )
    ),
    concept(
      "double_tax",
      T("Income taxed twice", "Ingresos gravados dos veces"),
      card(
        T("The same income, two claims", "El mismo ingreso, dos reclamos"),
        T(
          "When two countries both claim part of the same income, a tax credit or a treaty can reduce the double bill. The US lets people credit income tax paid to a foreign country, and the US–Mexico treaty says how. The rules are detailed, and a preparer who knows both countries can apply them.",
          "Cuando dos países reclaman parte del mismo ingreso, un crédito fiscal o un tratado pueden reducir la doble carga. EE. UU. permite acreditar el impuesto sobre la renta pagado a otro país, y el tratado entre EE. UU. y México dice cómo. Las reglas son detalladas, y un preparador que conozca los dos países puede aplicarlas."
        )
      ),
      tf("double_tax", T("Two countries can never both tax the same income.", "Dos países nunca pueden gravar el mismo ingreso."), false, T("They can, which is why credits and treaties exist.", "Pueden, y por eso existen los créditos y los tratados.")),
      choice(
        "double_tax",
        T("What does a foreign tax credit do?", "¿Qué hace un crédito por impuestos extranjeros?"),
        [T("Lets tax paid to one country reduce the tax owed to the other on the same income", "Permite que el impuesto pagado a un país reduzca el que se debe al otro por el mismo ingreso"), T("Cancels all tax in both countries", "Cancela todo el impuesto en ambos países"), T("Adds a new tax", "Agrega un impuesto nuevo")],
        0,
        T("It reduces the double bill, but only as far as its rules allow.", "Reduce la doble carga, pero solo hasta donde lo permiten sus reglas."),
        [null, T("A credit reduces tax. It doesn't erase both bills.", "Un crédito reduce el impuesto. No borra las dos cuentas."), T("A credit lowers tax. It isn't a new one.", "Un crédito baja el impuesto. No es uno nuevo.")]
      )
    ),
    concept(
      "gift_reporting",
      T("Gifts and what gets reported", "Regalos y qué se reporta"),
      card(
        T("Gift or income?", "¿Regalo o ingreso?"),
        T(
          "Money a relative sends as a gift is treated differently from pay for work. In the US, a gift from abroad isn't income to the person who gets it, but a very large one must be reported. In Mexico the rules depend on the relationship and the amount. Reporting isn't the same as paying.",
          "El dinero que un familiar manda como regalo se trata distinto que un pago por trabajo. En EE. UU., un regalo del extranjero no es ingreso para quien lo recibe, pero uno muy grande debe reportarse. En México las reglas dependen del parentesco y del monto. Reportar no es lo mismo que pagar."
        )
      ),
      tf("gift_reporting", T("Reporting a foreign gift always means you owe tax on it.", "Reportar un regalo del extranjero siempre significa que debes impuestos por él."), false, T("Form 3520 is an information return. Foreign gifts aren't subject to US income tax.", "El formulario 3520 es una declaración informativa. Los regalos del extranjero no pagan impuesto sobre la renta en EE. UU.")),
      choice(
        "gift_reporting",
        T("What is Form 3520 for a large foreign gift?", "¿Qué es el formulario 3520 para un regalo grande del extranjero?"),
        [T("An information return: it reports the gift", "Una declaración informativa: reporta el regalo"), T("A bill for tax on the gift", "Un cobro de impuestos por el regalo"), T("A loan application", "Una solicitud de préstamo")],
        0,
        T("It tells the IRS about the gift. Foreign gifts aren't taxed as income.", "Informa al IRS del regalo. Los regalos del extranjero no se gravan como ingreso."),
        [null, T("It isn't a bill. Late or missing reports can bring penalties, though.", "No es un cobro. Los reportes tardíos u omitidos sí pueden traer multas."), T("It's a tax form, not a loan form.", "Es un formulario de impuestos, no de préstamos.")]
      )
    ),
    concept(
      "cash_declaration",
      T("Carrying cash across the border", "Llevar efectivo por la frontera"),
      card(
        T("Report it, don't hide it", "Decláralo, no lo ocultes"),
        T(
          "Carrying more than {@cashDeclareUSD} in cash or similar items across the border isn't illegal. Not reporting it is. The US asks for a report (FinCEN Form 105) and Mexico asks for a declaration to customs. It isn't a tax, and groups traveling together add their amounts.",
          "Llevar más de {@cashDeclareUSD} en efectivo o documentos similares por la frontera no es ilegal. No declararlo sí lo es. EE. UU. pide un reporte (formulario FinCEN 105) y México pide una declaración en la aduana. No es un impuesto, y los grupos que viajan juntos suman sus montos."
        )
      ),
      tf("cash_declaration", T("Carrying more than $10,000 across the border is illegal in itself.", "Llevar más de $10,000 dólares por la frontera es ilegal por sí mismo."), false, T("Not reporting it is the problem. There's no limit on how much you may carry.", "No declararlo es el problema. No hay límite de cuánto puedes llevar.")),
      choice(
        "cash_declaration",
        T("What does the US ask of a traveler with more than $10,000 in cash?", "¿Qué pide EE. UU. a un viajero con más de $10,000 dólares en efectivo?"),
        [T("To file a report (FinCEN Form 105)", "Presentar un reporte (formulario FinCEN 105)"), T("To pay a tax on it", "Pagar un impuesto sobre ese dinero"), T("Nothing", "Nada")],
        0,
        T("The duty is to report it. It isn't a tax.", "La obligación es reportarlo. No es un impuesto."),
        [null, T("The report isn't a tax payment.", "El reporte no es un pago de impuestos."), T("Above the line, a report is required.", "Arriba del límite se exige un reporte.")]
      )
    ),
    concept(
      "tax_preparer",
      T("Choosing a tax preparer", "Elegir a quien te hace los impuestos"),
      card(
        T("A preparer you can check", "Un preparador que puedas verificar"),
        T(
          "In the US, a paid preparer must sign your return and include a PTIN. In both countries, you're responsible for what's filed. Be careful with anyone who promises a big refund, won't sign, or asks for your passwords.",
          "En EE. UU., un preparador pagado debe firmar tu declaración e incluir un PTIN. En ambos países, tú eres responsable de lo que se presenta. Ten cuidado con quien promete un reembolso grande, no firma o te pide tus contraseñas."
        )
      ),
      tf("tax_preparer", T("If a preparer makes a mistake on your return, you aren't responsible.", "Si un preparador comete un error en tu declaración, tú no eres responsable."), false, T("The IRS says the taxpayer is legally responsible for what is filed.", "El IRS dice que el contribuyente es legalmente responsable de lo que se presenta.")),
      choice(
        "tax_preparer",
        T("A preparer won't sign your return. What does that tell you?", "Un preparador no quiere firmar tu declaración. ¿Qué te dice eso?"),
        [T("It's a warning sign: paid preparers must sign and use a PTIN", "Es una señal de alerta: los preparadores pagados deben firmar y usar un PTIN"), T("It's normal", "Es normal"), T("It means your return is private", "Significa que tu declaración es privada")],
        0,
        T("A refusal to sign leaves you holding the whole responsibility.", "Una negativa a firmar te deja toda la responsabilidad."),
        [null, T("The IRS calls it a major red flag.", "El IRS lo llama una señal de alerta importante."), T("Privacy isn't the reason. The rule is that a paid preparer signs.", "La privacidad no es la razón. La regla es que un preparador pagado firma.")]
      )
    )
  ],
  lessons: [
    {
      id: "bordertaxes-1",
      title: T("Residence and where you owe", "Residencia y dónde debes impuestos"),
      life: T("Write which country you live in and which you earn in, and note if they differ.", "Anota en qué país vives y en cuál ganas, y si son distintos."),
      steps: [
        card(
          T("A commuter in two systems", "Una persona que cruza, en dos sistemas"),
          T(
            "Valeria lives in Ciudad Juárez and works in El Paso, crossing home each night. The US asks where her pay came from. Mexico asks where her home is. She isn't doing anything wrong. She's in two systems at once. Where could she owe tax?",
            "Valeria vive en Ciudad Juárez y trabaja en El Paso, y cruza a su casa cada noche. EE. UU. pregunta de dónde vino su sueldo. México pregunta dónde está su casa. Ella no hace nada malo: está en dos sistemas a la vez. ¿Dónde podría deber impuestos?"
          )
        ),
        choice(
          "tax_residence",
          T("What does Mexico look at first to decide if a person is a tax resident?", "¿Qué mira primero México para decidir si una persona es residente fiscal?"),
          [T("Where the person's home is", "Dónde está la casa de la persona"), T("Which bank they use", "Qué banco usan"), T("Which language they speak", "Qué idioma hablan")],
          0,
          T("The Federal Tax Code starts with the home. If a person has homes in two countries, it looks at where their main interests are.", "El Código Fiscal de la Federación empieza por la casa. Si una persona tiene casas en dos países, mira dónde están sus intereses principales."),
          [null, T("A bank doesn't decide residence.", "El banco no decide la residencia."), T("Language isn't a test of residence.", "El idioma no es una prueba de residencia.")]
        ),
        card(
          T("Two tests, two countries", "Dos pruebas, dos países"),
          T(
            "The US taxes citizens and residents on worldwide income. A noncitizen is a resident for tax with a green card or enough days in the US. Otherwise, only US-source income is taxed. Mexico asks where your home is, then your main interests.",
            "EE. UU. grava a ciudadanos y residentes por ingresos de todo el mundo. Un no ciudadano es residente fiscal con una tarjeta verde o suficientes días en EE. UU. Si no, solo se gravan los ingresos de fuente de EE. UU. México pregunta dónde está tu casa y luego tus intereses principales."
          )
        ),
        match(
          "tax_residence",
          T("Match each situation to what generally follows.", "Une cada situación con lo que suele seguir."),
          [
            [T("A US citizen living abroad", "Un ciudadano de EE. UU. que vive fuera"), T("Generally still files, on worldwide income", "Por lo general sigue declarando, por ingresos de todo el mundo")],
            [T("A nonresident of the US", "Un no residente de EE. UU."), T("Taxed on US-source income", "Paga por ingresos de fuente de EE. UU.")],
            [T("A home in Mexico", "Una casa en México"), T("A main sign of Mexican tax residence", "Una señal principal de residencia fiscal en México")]
          ],
          T("Each country asks about you in its own way.", "Cada país pregunta por ti a su manera.")
        ),
        tf("tax_residence", T("A person with a home in Mexico can still have US tax duties.", "Una persona con casa en México todavía puede tener obligaciones fiscales en EE. UU."), true, T("Citizenship, a green card or days spent in the US can create US duties.", "La ciudadanía, una tarjeta verde o los días en EE. UU. pueden crear obligaciones en EE. UU.")),
        act("goals.brackets", T("Move the income and watch each slice's tax.", "Mueve el ingreso y mira el impuesto de cada rebanada."))
      ]
    },
    {
      id: "bordertaxes-2",
      title: T("Income from the other country", "Ingresos del otro país"),
      life: T("If you earn in two countries, list each income and the country that paid it.", "Si ganas en dos países, anota cada ingreso y el país que lo pagó."),
      steps: [
        card(
          T("Elena's two bills", "Las dos cuentas de Elena"),
          T(
            "Elena, a US citizen, lives in Monterrey and a Mexican company pays her in pesos. Mexico taxes that pay. The US also counts it, because she's a citizen. Does she pay full tax twice?",
            "Elena, ciudadana de EE. UU., vive en Monterrey y una empresa mexicana le paga en pesos. México grava ese sueldo. EE. UU. también lo cuenta, porque ella es ciudadana. ¿Paga el impuesto completo dos veces?"
          )
        ),
        choice(
          "double_tax",
          T("What keeps her from paying the full tax twice?", "¿Qué evita que pague el impuesto completo dos veces?"),
          [T("Tax credits and the US–Mexico tax treaty", "Los créditos fiscales y el tratado de impuestos entre EE. UU. y México"), T("Nothing, she pays twice", "Nada, paga dos veces"), T("She can ignore one country", "Puede ignorar a uno de los países")],
          0,
          T("The US allows a credit for income tax paid to Mexico, and the treaty sets rules for it.", "EE. UU. permite un crédito por el impuesto sobre la renta pagado a México, y el tratado fija reglas para ello."),
          [null, T("Relief exists, but it has to be claimed correctly.", "Existe un alivio, pero hay que reclamarlo bien."), T("Ignoring a country's filing can bring penalties.", "Ignorar la declaración de un país puede traer multas.")]
        ),
        card(
          T("How relief works", "Cómo funciona el alivio"),
          T(
            "The US lets you credit income tax paid to Mexico against your US tax, and the treaty sets some rules. Some income earned abroad can also be excluded. Which applies depends on the facts. Excluded income still counts when checking whether you must file.",
            "EE. UU. permite acreditar el impuesto sobre la renta pagado a México contra tu impuesto de EE. UU., y el tratado fija algunas reglas. Cierto ingreso ganado en el extranjero también puede excluirse. Qué aplica depende de los hechos. El ingreso excluido igual cuenta para saber si debes declarar."
          )
        ),
        number(
          "double_tax",
          T("Elena owes {US$3000} of US tax on income that already paid {US$2200} of tax to Mexico, and a credit allows all of it. How much US tax is left?", "Elena debe {US$3000} de impuesto de EE. UU. por un ingreso que ya pagó {US$2200} de impuesto a México, y un crédito permite acreditar todo. ¿Cuánto impuesto de EE. UU. queda?"),
          { unit: "number", answer: 800, tol: 0.5 },
          [T("Credit for the Mexican tax: 2200 dollars.", "Crédito por el impuesto mexicano: 2200 dólares."), T("3000 − 2200 = 800 dollars left.", "3000 − 2200 = 800 dólares restantes.")]
        ),
        tf("double_tax", T("Income excluded as foreign earned income doesn't count when checking whether you must file.", "El ingreso excluido como ingreso ganado en el extranjero no cuenta para saber si debes declarar."), false, T("The IRS says to count excluded income toward the filing test.", "El IRS dice que se cuenta el ingreso excluido para la prueba de si debes declarar.")),
        act("goals.brackets", T("See how total tax and the effective rate change as income rises.", "Mira cómo cambian el impuesto total y la tasa efectiva cuando sube el ingreso."))
      ]
    },
    {
      id: "bordertaxes-3",
      title: T("Remittances, gifts and what gets reported", "Remesas, regalos y qué se reporta"),
      life: T("If money moves between family across the border, note who sends it and how they're related.", "Si el dinero se mueve entre familiares por la frontera, anota quién lo manda y qué parentesco tienen."),
      steps: [
        card(
          T("A gift from an uncle", "Un regalo de un tío"),
          T(
            "Tomás, who lives in the US, gets money every month from an uncle in Mexico to help with rent. Is it income? Does anything get reported? The answer depends on the amount, the relationship and which country you ask.",
            "Tomás, que vive en EE. UU., recibe dinero cada mes de un tío en México para ayudar con la renta. ¿Es ingreso? ¿Se reporta algo? La respuesta depende del monto, del parentesco y del país al que preguntes."
          )
        ),
        choice(
          "gift_reporting",
          T("In the US, is a gift from a relative abroad the receiver's income?", "En EE. UU., ¿un regalo de un familiar en el extranjero es ingreso para quien lo recibe?"),
          [T("No. Foreign gifts aren't subject to income tax", "No. Los regalos del extranjero no pagan impuesto sobre la renta"), T("Yes, always", "Sí, siempre"), T("Only if it came by transfer", "Solo si llegó por transferencia")],
          0,
          T("The IRS says foreign gifts aren't subject to income tax. Large ones are reported on an information return.", "El IRS dice que los regalos del extranjero no pagan impuesto sobre la renta. Los grandes se reportan en una declaración informativa."),
          [null, T("A gift isn't pay for work, so it isn't taxed as income.", "Un regalo no es pago por trabajo, así que no se grava como ingreso."), T("How it arrives doesn't change what it is.", "La forma en que llega no cambia lo que es.")]
        ),
        card(
          T("The reporting line", "El límite para reportar"),
          T(
            "In the US, someone who gets more than {@foreignGiftReportUSD} in a year from a foreign person or estate reports it on Form 3520, an information return. Gifts from related people are added together. In Mexico some gifts are exempt: between spouses and from parents to children, and others up to a limit. Ask which applies.",
            "En EE. UU., quien recibe más de {@foreignGiftReportUSD} en un año de una persona o sucesión extranjera lo reporta en el formulario 3520, una declaración informativa. Los regalos de personas relacionadas se suman. En México algunos regalos están exentos: entre cónyuges y de padres a hijos, y otros hasta un límite. Pregunta cuál aplica."
          )
        ),
        number(
          "gift_reporting",
          T("Two related relatives abroad give you {US$60000} and {US$45000} in a year. What do they add up to for the reporting line?", "Dos familiares relacionados en el extranjero te dan {US$60000} y {US$45000} en un año. ¿A cuánto suman para el límite de reporte?"),
          { unit: "number", answer: 105000, tol: 0.5 },
          [T("Gifts from related people are added together.", "Los regalos de personas relacionadas se suman."), T("60000 + 45000 = 105000 dollars.", "60000 + 45000 = 105000 dólares.")]
        ),
        match(
          "gift_reporting",
          T("Match each term to what it is.", "Une cada término con lo que es."),
          [
            [T("Form 3520", "Formulario 3520"), T("A US information return for large foreign gifts", "Una declaración informativa de EE. UU. para regalos grandes del extranjero")],
            [T("Related persons", "Personas relacionadas"), T("Their gifts are added together for the line", "Sus regalos se suman para el límite")],
            [T("Gifts between spouses (Mexico)", "Regalos entre cónyuges (México)"), T("Exempt from Mexican income tax, whatever the amount", "Exentos del impuesto sobre la renta en México, sea cual sea el monto")]
          ],
          T("Different rules, and the relationship matters in both.", "Reglas distintas, y el parentesco importa en ambos.")
        ),
        act("goals.remit", T("Slide the amount and see what a transfer would cost.", "Mueve el monto y mira cuánto costaría una transferencia."))
      ]
    },
    {
      id: "bordertaxes-4",
      title: T("Carrying cash across the border", "Llevar efectivo por la frontera"),
      life: T("If you ever carry cash across, find out the reporting line in both countries first.", "Si algún día llevas efectivo por la frontera, averigua primero el límite para declarar en ambos países."),
      steps: [
        card(
          T("Two travelers, one car", "Dos viajeros, un coche"),
          T(
            "Rosa carries {US$6000} and her husband carries {US$5500} on a family trip to Tijuana. Neither is over {@cashDeclareUSD} alone. Does that settle it?",
            "Rosa lleva {US$6000} y su esposo lleva {US$5500} en un viaje familiar a Tijuana. Ninguno pasa de {@cashDeclareUSD} por separado. ¿Eso lo resuelve?"
          )
        ),
        number(
          "cash_declaration",
          T("Traveling together, what's their combined total?", "Viajando juntos, ¿cuál es su total combinado?"),
          { unit: "number", answer: 11500, tol: 0.5 },
          [T("The line applies to a group traveling together, such as a family.", "El límite aplica a un grupo que viaja junto, como una familia."), T("6000 + 5500 = 11500 dollars.", "6000 + 5500 = 11500 dólares.")]
        ),
        card(
          T("What counts", "Qué cuenta"),
          T(
            "Cash, checks, money orders and similar items count. The line is {@cashDeclareUSD} or its equivalent, in both directions. There's no limit on how much you may carry. The duty is to report. Not reporting can mean seizure and penalties, and in Mexico a fine of 20% to 40% of the excess.",
            "Cuentan el efectivo, los cheques, las órdenes de pago y documentos similares. El límite es {@cashDeclareUSD} o su equivalente, en ambos sentidos. No hay límite de cuánto puedes llevar. La obligación es declarar. No declarar puede significar decomiso y multas, y en México una multa de 20% a 40% del excedente."
          )
        ),
        tf("cash_declaration", T("A family can each carry just under the line to avoid reporting.", "Cada miembro de una familia puede llevar justo debajo del límite para evitar declarar."), false, T("The line applies to the group's combined total, and splitting it up to avoid the report is a red flag.", "El límite aplica al total del grupo, y dividirlo para evitar el reporte es una señal de alerta.")),
        scenario(
          "cash_declaration",
          T("At the booth, an officer asks if you carry more than $10,000. You do. What do you do?", "En la caseta, un oficial pregunta si llevas más de $10,000 dólares. Sí los llevas. ¿Qué haces?"),
          [
            fit(T("Say yes, and file the report or declaration", "Dices que sí y presentas el reporte o la declaración"), "good", T("Reporting is the duty, and carrying it isn't a crime.", "Declarar es la obligación, y llevarlo no es un delito.")),
            fit(T("Hand some to a friend to carry", "Le pasas una parte a un amigo para que la lleve"), "poor", T("It looks like hiding it, and the group total can still count.", "Parece ocultarlo, y el total del grupo puede contar igual.")),
            fit(T("Say no and hope", "Dices que no y esperas"), "poor", T("A false answer can mean seizure and penalties.", "Una respuesta falsa puede significar decomiso y multas."))
          ],
          T("Say what you carry. It isn't illegal to carry it.", "Di lo que llevas. No es ilegal llevarlo.")
        ),
        act("goals.budget", T("Plan a trip's costs: how much cash would you actually need?", "Planea los gastos de un viaje: ¿cuánto efectivo necesitarías en realidad?"), { income: [1200, 20000] })
      ]
    },
    {
      id: "bordertaxes-5",
      title: T("Finding a trusted preparer", "Cómo encontrar a un preparador de confianza"),
      life: T("Write three questions you'd ask a tax preparer before hiring one.", "Anota tres preguntas que le harías a un preparador de impuestos antes de contratarlo."),
      steps: [
        card(
          T("The easy refund", "El reembolso fácil"),
          T(
            "A man at a stall offers to do taxes for {US$40}. He promises a big refund and says he doesn't sign returns. A friend says he's \"fast\". Is that a good sign?",
            "Un hombre en un puesto ofrece hacer los impuestos por {US$40}. Promete un reembolso grande y dice que no firma las declaraciones. Un amigo dice que es \"rápido\". ¿Es buena señal?"
          )
        ),
        choice(
          "tax_preparer",
          T("What's the clearest warning sign?", "¿Cuál es la señal de alerta más clara?"),
          [T("He won't sign or give a PTIN", "No quiere firmar ni dar un PTIN"), T("He asks to see your documents", "Pide ver tus documentos"), T("He charges a fee", "Cobra una tarifa")],
          0,
          T("The IRS calls a refusal to sign or give a PTIN a major red flag. You stay responsible for what's filed.", "El IRS llama una señal de alerta importante a la negativa a firmar o dar un PTIN. Tú sigues siendo responsable de lo que se presenta."),
          [null, T("A real preparer needs your documents.", "Un preparador real necesita tus documentos."), T("Professionals charge. A fee isn't the warning sign.", "Los profesionales cobran. Una tarifa no es la señal de alerta.")]
        ),
        card(
          T("Questions worth asking", "Preguntas que vale la pena hacer"),
          T(
            "Many people ask: Are you licensed, and will you sign my return with your PTIN? How do you charge? Have you handled returns with income in both countries? In Mexico, ask for a contador's cédula, and never hand over your e.firma or passwords.",
            "Mucha gente pregunta: ¿Tienes licencia y firmarás mi declaración con tu PTIN? ¿Cómo cobras? ¿Has llevado declaraciones con ingresos en ambos países? En México, pide la cédula del contador y nunca entregues tu e.firma ni tus contraseñas."
          )
        ),
        order(
          "tax_preparer",
          T("Put these steps in order when choosing a preparer.", "Pon estos pasos en orden al elegir a un preparador."),
          [T("Ask for credentials and a PTIN or cédula", "Pide credenciales y un PTIN o cédula"), T("Ask how they charge", "Pregunta cómo cobran"), T("Ask about experience with both countries", "Pregunta por su experiencia con ambos países"), T("Read the return before you sign, and keep a copy", "Lee la declaración antes de firmar y guarda una copia")],
          T("You check who they are before the details, and the return last.", "Primero verificas quién es, luego los detalles, y al final la declaración.")
        ),
        scenario(
          "tax_preparer",
          T("A \"preparer\" promises a big refund, won't sign, and asks for your account passwords. What do you do?", "Un \"preparador\" promete un reembolso grande, no quiere firmar y te pide las contraseñas de tus cuentas. ¿Qué haces?"),
          [
            fit(T("Walk away and look for a credentialed professional who signs", "Te vas y buscas a un profesional con credenciales que firme"), "good", T("A signed return from someone you can check protects you.", "Una declaración firmada por alguien que puedes verificar te protege.")),
            fit(T("Give the passwords but ask him to sign later", "Das las contraseñas pero le pides que firme después"), "poor", T("Passwords give him control of your accounts.", "Las contraseñas le dan control de tus cuentas.")),
            fit(T("Accept, since the refund is big", "Aceptas, porque el reembolso es grande"), "poor", T("A promised refund is bait, and you carry the responsibility.", "Un reembolso prometido es un anzuelo, y la responsabilidad es tuya."))
          ],
          T("Check who they are before any documents change hands.", "Verifica quién es antes de entregar documentos.")
        ),
        act("goals.scam", T("Tap the red flags in this message.", "Toca las señales de alerta en este mensaje."), { set: "phishing" })
      ]
    }
  ]
};
