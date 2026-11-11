// UNIT — Your first paycheck. Its lessons and the concepts they teach (format in helpers.js).
import { T, card, choice, tf, act, concept, match, number, spot, tap, order } from "./helpers.js";

export default {
  id: "paycheck",
  icon: "wallet",
  title: T("Your first paycheck", "Tu primer sueldo"),
  concepts: [
    concept(
      "gross_net",
      T("Gross vs. net pay", "Sueldo bruto vs. neto"),
      card(T("Before and after", "Antes y después"), T("Gross pay is what you earn before anything is taken out. Net pay — take-home pay — is what lands in your account after taxes and other deductions. If a job pays {$15|60} an hour, your paycheck will show less than hours × {$15|60}.", "El sueldo bruto es lo que ganas antes de cualquier descuento. El neto es lo que llega a tu cuenta después de impuestos y otros descuentos. Si un trabajo paga {$15|60} la hora, tu pago va a mostrar menos que horas × {$15|60}.")),
      tf("gross_net", T("Net pay is what's left after taxes and other deductions.", "El sueldo neto es lo que queda después de impuestos y otros descuentos."), true, T("Net is the take-home number — the one to plan your budget with.", "El neto es lo que te llega: con ese número se arma el presupuesto.")),
      choice(
        "gross_net",
        T("You work 20 hours at {$15|60} an hour, and {$45|150} is taken out. What's your net pay?", "Trabajas 20 horas a {$15|60} la hora y te descuentan {$45|150}. ¿Cuál es tu sueldo neto?"),
        [T("{$255|1050}", "{$255|1050}"), T("{$300|1200}", "{$300|1200}"), T("{$345|1350}", "{$345|1350}")],
        0,
        T("Gross is 20 × {$15|60} = {$300|1200}. Take away {$45|150} and you keep {$255|1050}.", "El bruto es 20 × {$15|60} = {$300|1200}. Quitando {$45|150}, te quedan {$255|1050}."),
        [null, T("That's your gross pay, before deductions.", "Ese es tu sueldo bruto, antes de descuentos."), T("Deductions are taken away, not added.", "Los descuentos se restan, no se suman.")]
      )
    ),
    concept(
      "payroll_deductions",
      T("What comes out of a paycheck", "Lo que se descuenta del sueldo"),
      card(
        T("Where the money goes", "A dónde va ese dinero"),
        T("Your employer withholds federal income tax (and state tax in most states) and pays it for you. Social Security ({@socialSecurityRate}) and Medicare ({@medicareRate}) fund retirement and health benefits. Some jobs also take out health insurance or 401(k) savings — those you choose.", "Tu empleador retiene el impuesto federal sobre la renta (y el estatal en la mayoría de los estados) y lo paga por ti. Social Security ({@socialSecurityRate}) y Medicare ({@medicareRate}) financian pensiones y servicios de salud. Algunos trabajos también descuentan seguro médico o ahorro para el 401(k); esos los eliges tú.", {
          en: "Your employer withholds income tax (ISR) and pays it to the SAT for you, plus your share of IMSS contributions — which fund health care, disability coverage and your AFORE. Your employer pays its own share on top.",
          es: "Tu patrón te retiene el impuesto sobre la renta (ISR) y lo paga al SAT por ti, además de tu parte de las cuotas del IMSS, que financian atención médica, seguros y tu AFORE. Tu patrón paga su propia parte encima.",
        })
      ),
      tf("payroll_deductions", T("Some of your pay goes to taxes before it reaches you.", "Una parte de tu sueldo se va a impuestos antes de llegarte."), true, T("Your employer withholds it and sends it on your behalf.", "Tu empleador lo retiene y lo entrega por ti.", { en: "Your employer withholds ISR and IMSS contributions and pays them for you.", es: "Tu patrón retiene el ISR y las cuotas del IMSS y los paga por ti." })),
      choice(
        "payroll_deductions",
        T("Who pays the tax your employer withholds?", "¿Quién paga el impuesto que tu empleador retiene?", { en: "Who pays the ISR your employer withholds?", es: "¿Quién paga el ISR que te retiene tu patrón?" }),
        [T("You do — it comes out of your pay, and your employer sends it in", "Tú: sale de tu sueldo y tu empleador lo entrega"), T("Your employer pays it from its own money", "Tu empleador lo paga con su propio dinero"), T("Nobody, if you're young", "Nadie, si eres joven")],
        0,
        T("Withholding is your tax, collected from each paycheck so you don't owe it all at once.", "La retención es tu impuesto, cobrado en cada pago para que no lo debas todo de golpe."),
        [null, T("It's taken from your pay. (Employers do pay some taxes of their own, separately.)", "Sale de tu sueldo. (Los empleadores sí pagan algunos impuestos propios, por separado.)"), T("Age doesn't exempt you. Low earners may owe little, but withholding still applies.", "La edad no te exenta. Quien gana poco puede deber poco, pero la retención sigue aplicando.")]
      )
    ),
    concept(
      "pay_stub",
      T("Reading a pay stub", "Leer un recibo de nómina"),
      card(T("Three parts", "Tres partes"), T("A pay stub shows what you earned (gross), what was taken out and why, and what you got (net). It also shows year-to-date totals. Checking it catches mistakes — wrong hours, wrong rate, missing pay.", "El recibo de pago muestra lo que ganaste (bruto), lo que te descontaron y por qué, y lo que recibiste (neto). También muestra los totales del año. Revisarlo ayuda a detectar errores: horas mal contadas, tarifa equivocada, pago faltante.", { en: "A payslip (\"recibo de nómina\", an official CFDI) shows \"percepciones\" — what you earned — and \"deducciones\" — what was taken out — and your net pay. Checking it catches mistakes, and it's proof of your income.", es: "El recibo de nómina (un CFDI oficial) muestra las percepciones (lo que ganaste), las deducciones (lo que te descontaron) y tu pago neto. Revisarlo ayuda a detectar errores, y es comprobante de tus ingresos." })),
      tf("pay_stub", T("It's a good idea to check your pay stub for mistakes.", "Es buena idea revisar tu recibo de pago por si hay errores."), true, T("Hours and rates are entered by people and systems — both make mistakes.", "Las horas y tarifas las capturan personas y sistemas, y los dos se equivocan.")),
      choice(
        "pay_stub",
        T("Your stub shows 18 hours, but you worked 22. What's a sensible first step?", "Tu recibo dice 18 horas, pero trabajaste 22. ¿Qué es un buen primer paso?"),
        [T("Ask your manager or payroll to check it, with your own record of hours", "Pedirle a tu jefe o a nómina que lo revise, con tu propio registro de horas"), T("Ignore it — it'll even out", "Ignorarlo; ya se emparejará"), T("Quit the job", "Renunciar")],
        0,
        T("Payroll mistakes are common and usually fixed quickly when you bring your own record.", "Los errores de nómina son comunes y suelen arreglarse rápido si llevas tu propio registro."),
        [null, T("Missed hours don't fix themselves. Unreported, that pay is simply lost.", "Las horas faltantes no se arreglan solas. Si no lo reportas, ese pago se pierde."), T("A mistake is usually just a mistake. Ask first.", "Un error casi siempre es solo un error. Primero pregunta.")]
      )
    ),
    concept(
      "job_paperwork",
      T("First-job paperwork", "Trámites del primer trabajo"),
      card(T("Forms you'll fill in", "Los formularios que vas a llenar"), T("A new job asks for a W-4 (how much federal tax to withhold from each paycheck) and an I-9 (proof you can work in the US), plus your Social Security number. At year's end you get a W-2 showing what you earned and what was withheld.", "Un trabajo nuevo te pide el W-4 (cuánto impuesto federal retener de cada pago) y el I-9 (prueba de que puedes trabajar en EE. UU.), además de tu número de Seguro Social. Al final del año recibes el W-2 con lo que ganaste y lo que te retuvieron.", { en: "A formal job asks for your RFC (taxpayer ID, from the SAT), your CURP and your NSS (IMSS number) — you can get the NSS online too. Your employer registers you with IMSS, which also starts your AFORE contributions.", es: "Un trabajo formal te pide tu RFC (clave de contribuyente del SAT), tu CURP y tu NSS (número de seguridad social del IMSS), que también puedes sacar en línea. Tu patrón te da de alta en el IMSS, y así empiezan también las aportaciones a tu AFORE." })),
      tf("job_paperwork", T("The W-4 tells your employer how much federal tax to withhold.", "El W-4 le dice a tu empleador cuánto impuesto federal retener.", { en: "Your RFC is your taxpayer ID from the SAT.", es: "Tu RFC es tu clave de contribuyente del SAT." }), true, T("Fill it in carefully — it shapes every paycheck.", "Llénalo con cuidado: influye en cada pago.", { en: "You'll use it for your job, your payslips and any tax filing.", es: "Lo vas a usar en tu trabajo, en tus recibos de nómina y en cualquier declaración." })),
      choice(
        "job_paperwork",
        T("At the end of the year, which form shows what you earned and what was withheld?", "Al final del año, ¿qué formulario muestra lo que ganaste y lo que te retuvieron?", { en: "Which number tells your employer to register you for social security (health care and your AFORE)?", es: "¿Qué número permite que tu patrón te registre en la seguridad social (atención médica y tu AFORE)?" }),
        [T("The W-2", "El W-2", { en: "Your NSS (IMSS number)", es: "Tu NSS (número del IMSS)" }), T("The W-4", "El W-4", { en: "Your bank card number", es: "El número de tu tarjeta bancaria" }), T("Your library card", "Tu credencial de la biblioteca", { en: "Your phone number", es: "Tu número de teléfono" })],
        0,
        T("The W-2 sums up the year — you'll need it to file your taxes.", "El W-2 resume el año; lo vas a necesitar para declarar impuestos.", { en: "The NSS links your work to IMSS: health care, disability coverage and your AFORE.", es: "El NSS liga tu trabajo con el IMSS: atención médica, seguros y tu AFORE." }),
        [null, T("The W-4 is what you fill in when you start — it sets withholding, it doesn't report it.", "El W-4 es el que llenas al empezar: fija la retención, no la reporta.", { en: "Your employer pays you into an account, but registration uses your NSS, not a card number.", es: "Tu patrón te paga a una cuenta, pero el registro usa tu NSS, no el número de una tarjeta." }), T("Only tax forms count here.", "Aquí solo cuentan los formularios fiscales.", { en: "A phone number isn't an official ID for social security.", es: "Un número de teléfono no es una clave oficial para la seguridad social." })]
      )
    ),
  ],
  lessons: [
    {
      id: "paycheck-1",
      title: T("Gross vs. net", "Bruto vs. neto"),
      steps: [
        card(T("The number on the offer", "El número de la oferta"), T("When a job says \"{$15|60} an hour\" or \"{$2000|9000} a month\", that's gross pay: before anything is taken out. It's the starting point, not what you'll get.", "Cuando un trabajo dice \"{$15|60} la hora\" o \"{$2000|9000} al mes\", eso es el sueldo bruto: antes de cualquier descuento. Es el punto de partida, no lo que vas a recibir.")),
        card(T("The number in your account", "El número en tu cuenta"), T("Net pay is what arrives after taxes and deductions. Build your budget on net pay — that's the money you actually have.", "El sueldo neto es lo que llega después de impuestos y descuentos. Arma tu presupuesto con el neto: es el dinero que de verdad tienes.")),
        order("gross_net", T("Order these from biggest to smallest.", "Ordena de mayor a menor."), [T("Gross pay: the number on the offer", "Sueldo bruto: el número de la oferta"), T("Net pay: what reaches your account", "Sueldo neto: lo que llega a tu cuenta"), T("Spending money: net pay after you save", "Dinero para gastar: el neto después de ahorrar")], T("Your budget starts from net pay, the money you actually get, not the gross on the offer.", "Tu presupuesto empieza con el sueldo neto, el dinero que de verdad recibes, no con el bruto de la oferta.")),
        tf("gross_net", T("Gross pay is usually bigger than net pay.", "El sueldo bruto suele ser mayor que el neto."), true, T("Deductions come out of gross to give you net.", "Los descuentos salen del bruto para dar el neto.")),
        number("gross_net", T("Your job offer says {$15|80} an hour, 20 hours a week. What's your gross pay for one week?", "Tu oferta de trabajo dice {$15|80} la hora, 20 horas a la semana. ¿Cuál es tu sueldo bruto de una semana?"), { unit: "money", answer: [300, 1600] }, [T("Gross is before anything comes out: {$15|80} × 20 hours.", "El bruto es antes de que te descuenten nada: {$15|80} × 20 horas."), T("That's {$300|1600}. Your net pay, after taxes, will be less.", "Son {$300|1600}. Tu sueldo neto, después de impuestos, será menor.")]),
        act("goals.paycheck", T("Move the gross pay and see what you'd take home.", "Mueve el sueldo bruto y mira cuánto te llegaría."), { gross: [1600, 12000] }),
      ],
    },
    {
      id: "paycheck-2",
      title: T("What comes out of your pay", "Lo que se descuenta de tu sueldo"),
      steps: [
        card(
          T("Taxes, withheld for you", "Impuestos, retenidos por ti"),
          T("Each paycheck, your employer withholds federal income tax and, in most states, state income tax. You don't pay them separately — they come out before your pay arrives.", "En cada pago, tu empleador retiene el impuesto federal sobre la renta y, en la mayoría de los estados, el estatal. No los pagas aparte: salen antes de que te llegue el sueldo.", { en: "Each payday, your employer withholds income tax (ISR) following the SAT's table. Low earners can get a subsidy that lowers it. You don't pay it separately — it comes out before your pay arrives.", es: "En cada pago, tu patrón te retiene el impuesto sobre la renta (ISR) según la tabla del SAT. Quien gana poco puede recibir un subsidio que lo reduce. No lo pagas aparte: sale antes de que te llegue el sueldo." })
        ),
        card(
          T("Social Security and Medicare", "Social Security y Medicare", { en: "IMSS contributions", es: "Cuotas del IMSS" }),
          T("These are a fixed share of pay: {@socialSecurityRate} for Social Security (up to a yearly earnings limit) and {@medicareRate} for Medicare (together, \"FICA\"). They pay for retirement and health benefits later in life. Your employer pays the same amount again on top.", "Son una parte fija del sueldo: {@socialSecurityRate} para Social Security (hasta un límite anual de ingresos) y {@medicareRate} para Medicare (juntos, \"FICA\"). Pagan pensiones y servicios de salud más adelante. Tu empleador paga la misma cantidad encima.", { en: "A small share of your pay goes to IMSS — roughly a few percent, depending on your salary. It covers health care, disability coverage and part of your AFORE. Your employer and the government add more on top.", es: "Una parte pequeña de tu sueldo va al IMSS, unos cuantos puntos porcentuales según tu salario. Cubre atención médica, seguros y parte de tu AFORE. Tu patrón y el gobierno ponen más encima." })
        ),
        choice(
          "payroll_deductions",
          T("What does Social Security tax pay for?", "¿Para qué es el impuesto de Social Security?", { en: "What do IMSS contributions pay for?", es: "¿Para qué son las cuotas del IMSS?" }),
          [T("Retirement and disability benefits", "Pensiones y beneficios por discapacidad", { en: "Health care, disability coverage and your AFORE", es: "Atención médica, seguros y tu AFORE" }), T("Your employer's profits", "Las ganancias de tu empleador"), T("Your phone plan", "Tu plan de celular")],
          0,
          T("It's insurance for later in life, paid a little at a time.", "Es un seguro para más adelante, pagado poco a poco.", { en: "Social security in Mexico covers health care now and retirement savings for later.", es: "La seguridad social en México cubre atención médica ahora y ahorro para el retiro después." }),
          [null, T("It goes to the government program, not to your employer.", "Va al programa del gobierno, no a tu empleador.", { en: "It goes to IMSS and your AFORE, not to your employer.", es: "Va al IMSS y a tu AFORE, no a tu patrón." }), T("Payroll deductions are for taxes and benefits, not your bills.", "Los descuentos de nómina son para impuestos y prestaciones, no para tus cuentas.")]
        ),
        tf("payroll_deductions", T("Your employer pays part of these costs too, on top of what comes out of your pay.", "Tu empleador también paga parte de estos costos, además de lo que sale de tu sueldo."), true, T("Your share is only part of the total.", "Tu parte es solo una porción del total.")),
        match(
          "payroll_deductions",
          T("Match what comes out of your pay to what it's for.", "Une cada descuento de tu sueldo con para qué es."),
          [
            [T("Income tax", "Impuesto sobre la renta", { en: "ISR", es: "ISR" }), T("A share of what you earn, for public services", "Una parte de lo que ganas, para servicios públicos")],
            [T("State income tax", "Impuesto estatal", { en: "IMSS", es: "IMSS" }), T("In most states, a share of what you earn", "En la mayoría de los estados, una parte de lo que ganas", { en: "Health care, disability coverage and part of your AFORE", es: "Atención médica, incapacidades y parte de tu AFORE" })],
            [T("Medicare", "Medicare", { en: "Employment subsidy", es: "Subsidio para el empleo" }), T("Health care when you're older", "Atención médica cuando seas mayor", { en: "Lowers the tax for people who earn less", es: "Baja el impuesto a quienes ganan menos" })],
          ],
          T("These come out before your pay arrives, so your net pay is smaller than your gross.", "Se descuentan antes de que llegue tu sueldo, por eso el neto es menor que el bruto.")
        ),
        act("goals.paycheck", T("Change the example tax rate and watch take-home pay change.", "Cambia la tasa de impuesto de ejemplo y mira cómo cambia lo que te llega."), { gross: [2000, 10000] }),
      ],
    },
    {
      id: "paycheck-3",
      title: T("Reading a pay stub", "Cómo leer tu recibo de nómina"),
      steps: [
        card(T("What's on it", "Qué trae"), T("Your pay stub lists hours and pay rate, gross pay, each deduction, and net pay — for this period and year to date. Keep it, or at least check it, every time you're paid.", "Tu recibo de pago muestra horas y tarifa, sueldo bruto, cada descuento y el neto, del periodo y del año. Guárdalo, o por lo menos revísalo, cada vez que te paguen.", { en: "Your payslip lists your \"percepciones\" (salary, overtime, bonuses), \"deducciones\" (ISR, IMSS) and net pay. It's an official electronic invoice (CFDI) — you can also find it on the SAT's website.", es: "Tu recibo de nómina muestra tus percepciones (sueldo, horas extra, bonos), tus deducciones (ISR, IMSS) y el neto. Es una factura electrónica oficial (CFDI): también lo puedes encontrar en el portal del SAT." })),
        card(T("Why check it", "Por qué revisarlo"), T("Mistakes happen: missing hours, the wrong rate, a deduction you didn't sign up for. Comparing your stub with your own record of hours is the easiest way to catch them.", "Los errores pasan: horas que faltan, una tarifa equivocada, un descuento que no pediste. Comparar tu recibo con tu propio registro de horas es la forma más fácil de detectarlos.")),
        choice(
          "pay_stub",
          T("On a pay stub, what does \"YTD\" mean?", "En un recibo de pago, ¿qué significa \"YTD\"?", { en: "On a payslip, what are \"percepciones\"?", es: "En un recibo de nómina, ¿qué son las percepciones?" }),
          [T("Year to date — the total so far this year", "Year to date: el total en lo que va del año", { en: "What you earned: salary, overtime, bonuses", es: "Lo que ganaste: sueldo, horas extra, bonos" }), T("Your tax refund", "Tu devolución de impuestos", { en: "The taxes taken out", es: "Los impuestos que te descontaron" }), T("Your manager's initials", "Las iniciales de tu jefe", { en: "Your manager's notes", es: "Las notas de tu jefe" })],
          0,
          T("YTD columns add up everything since January.", "Las columnas YTD suman todo desde enero.", { en: "Percepciones are everything you earned; deducciones are what was taken out.", es: "Las percepciones son todo lo que ganaste; las deducciones, lo que te descontaron." }),
          [null, T("A refund, if any, comes after you file your taxes — not on a pay stub.", "Una devolución, si hay, llega después de declarar, no en el recibo de pago.", { en: "That's the \"deducciones\" part.", es: "Eso es la parte de deducciones." }), T("It's an amount, not a signature.", "Es un monto, no una firma.", { en: "It's a list of amounts, not notes.", es: "Es una lista de montos, no notas." })]
        ),
        number("pay_stub", T("Your stub: gross $480, federal tax $38, Social Security $30, Medicare $7, state tax $14. What's your net pay?", "Tu recibo: bruto $480, impuesto federal $38, Seguro Social $30, Medicare $7, impuesto estatal $14. ¿Cuál es tu sueldo neto?", { en: "Your payslip: gross $2,700, ISR $230, IMSS $70. What's your net pay?", es: "Tu recibo: bruto $2,700, ISR $230, IMSS $70. ¿Cuál es tu sueldo neto?" }), { unit: "money", answer: [391, 2400] }, [T("Add what comes out: $38 + $30 + $7 + $14 = $89.", "Suma los descuentos: $38 + $30 + $7 + $14 = $89.", { en: "Add what comes out: $230 + $70 = $300.", es: "Suma los descuentos: $230 + $70 = $300." }), T("$480 − $89 = $391 reaches your account.", "$480 − $89 = $391 llegan a tu cuenta.", { en: "$2,700 − $300 = $2,400 reaches your account.", es: "$2,700 − $300 = $2,400 llegan a tu cuenta." })]),
        spot(
          "pay_stub",
          T("You worked 36 hours at {$16|90} an hour. Tap the 2 lines on this pay stub that are wrong.", "Trabajaste 36 horas a {$16|90} la hora. Toca las 2 líneas de este recibo que están mal."),
          "receipt",
          T("Pay stub · Nov 1–14", "Recibo de pago · 1–14 de nov.", { en: "Payslip · Nov 1–15", es: "Recibo de nómina · 1–15 de nov." }),
          [
            tap(T("Hours worked: 32", "Horas trabajadas: 32"), true),
            tap(T("Pay rate: {$15|80} an hour", "Pago por hora: {$15|80}"), true),
            tap(T("Federal tax withheld: $38", "Impuesto federal retenido: $38", { en: "ISR withheld: $230", es: "ISR retenido: $230" })),
            tap(T("Pay date: Nov 15", "Fecha de pago: 15 de nov.")),
          ],
          T("32 hours at {$15|80} is less than you earned. Check hours and rate on every stub: mistakes happen, and they get fixed when you ask.", "32 horas a {$15|80} es menos de lo que ganaste. Revisa horas y tarifa en cada recibo: los errores pasan y se corrigen si preguntas.")
        ),
        act("goals.budget", T("Plan a month using a net pay of {$1400|8000}.", "Planea un mes con un sueldo neto de {$1400|8000}."), { income: [1400, 8000] }),
      ],
    },
    {
      id: "paycheck-4",
      title: T("Paperwork for your first job", "Trámites para tu primer trabajo"),
      steps: [
        card(T("Day-one forms", "Los formularios del primer día"), T("Expect a W-4 (sets your federal tax withholding), an I-9 (proves you can work in the US) and a request for your Social Security number. In many states there's a state withholding form too. Under 18, some states also require a work permit.", "Prepárate para el W-4 (fija la retención de impuesto federal), el I-9 (prueba que puedes trabajar en EE. UU.) y que te pidan tu número de Seguro Social. En muchos estados también hay un formulario estatal. Si eres menor de 18, algunos estados piden además un permiso de trabajo.", { en: "Expect to give your RFC (from the SAT, free online with your CURP), your CURP and your NSS (IMSS number, also online). Your employer registers you with IMSS. Under 18, the law sets extra rules on hours and type of work.", es: "Prepárate para dar tu RFC (del SAT, gratis en línea con tu CURP), tu CURP y tu NSS (número del IMSS, también en línea). Tu patrón te da de alta en el IMSS. Si eres menor de 18, la ley pone reglas adicionales sobre horario y tipo de trabajo." })),
        card(T("Keep copies", "Guarda copias"), T("Keep your W-2 and pay stubs in one place. You'll need them to file your taxes and to prove income later.", "Guarda tu W-2 y tus recibos en un solo lugar. Los vas a necesitar para declarar impuestos y para comprobar ingresos más adelante.", { en: "Keep your payslips and your RFC and NSS details in one place. You'll need them if you file a tax return and to prove income later.", es: "Guarda tus recibos de nómina y tus datos de RFC y NSS en un solo lugar. Los vas a necesitar si presentas una declaración y para comprobar ingresos más adelante." })),
        choice(
          "job_paperwork",
          T("What does the W-4 form do?", "¿Para qué sirve el formulario W-4?", { en: "Where do you get your RFC?", es: "¿Dónde sacas tu RFC?" }),
          [T("Tells your employer how much federal tax to withhold", "Le dice a tu empleador cuánto impuesto federal retener", { en: "From the SAT, free, using your CURP", es: "Del SAT, gratis, con tu CURP" }), T("Opens a bank account for you", "Te abre una cuenta de banco", { en: "From your bank", es: "En tu banco" }), T("Reports what you earned last year", "Reporta lo que ganaste el año pasado", { en: "From your school", es: "En tu escuela" })],
          0,
          T("You fill it in when you start; you can update it if your situation changes.", "Lo llenas al empezar y lo puedes actualizar si tu situación cambia.", { en: "The SAT issues it — online or at its offices.", es: "Lo emite el SAT, en línea o en sus oficinas." }),
          [null, T("Your employer may pay into your account, but the W-4 is about taxes.", "Tu empleador puede pagarte a tu cuenta, pero el W-4 es sobre impuestos.", { en: "Banks may ask for your RFC, but only the SAT issues it.", es: "Los bancos te lo pueden pedir, pero solo el SAT lo emite." }), T("That's the W-2, which you get at the end of the year.", "Ese es el W-2, que recibes al final del año.", { en: "Schools don't issue tax IDs.", es: "Las escuelas no emiten claves fiscales." })]
        ),
        tf("job_paperwork", T("You get a W-2 at the end of the year showing your pay and withholding.", "Al final del año recibes un W-2 con tu sueldo y lo que te retuvieron.", { en: "Your employer registers you with IMSS when you start a formal job.", es: "Tu patrón te da de alta en el IMSS cuando empiezas un trabajo formal." }), true, T("Employers must send it by the end of January.", "Los empleadores deben enviarlo a más tardar a fines de enero.", { en: "That registration gives you health care and starts your AFORE contributions.", es: "Ese registro te da atención médica y empieza las aportaciones a tu AFORE." })),
        match(
          "job_paperwork",
          T("Match each first-job paper to what it's for.", "Une cada papel del primer trabajo con para qué sirve."),
          [
            [T("Direct deposit form", "Formulario de depósito directo", { en: "RFC", es: "RFC" }), T("Tells your employer where to send your pay", "Le dice a tu empleador a dónde mandar tu sueldo", { en: "Your tax ID, from the SAT", es: "Tu clave para impuestos, del SAT" })],
            [T("I-9", "I-9", { en: "NSS", es: "NSS" }), T("Shows you're allowed to work in the US", "Muestra que puedes trabajar en EE. UU.", { en: "Your IMSS number", es: "Tu número del IMSS" })],
            [T("W-2", "W-2", { en: "Payslip", es: "Recibo de nómina" }), T("A yearly summary of your pay and taxes", "Un resumen anual de tu sueldo e impuestos", { en: "The record of each payday", es: "El comprobante de cada pago" })],
          ],
          T("Keep copies of all of them in one place. You'll need them again.", "Guarda copias de todos en un solo lugar. Los vas a volver a necesitar.")
        ),
        act("goals.create", T("Make a goal for part of your first paychecks.", "Crea una meta para una parte de tus primeros sueldos."), { name: T("Savings from my first job", "Ahorro de mi primer trabajo"), target: [500, 6000], months: 6 }),
      ],
    },
  ],
};
