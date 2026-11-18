// UNIT — Judging a job offer (Wave 1, Work and Income, Build; Both).
// DRAFT: not in the app until a reviewer signs it off. To ship it, follow the steps at the top of
// sending.js. T(en, es, { en, es }) is the Mexico version; amounts use {$US|MX}.
// Mission to add then: "Line up the benefits of two real job posts you find (just reading)". Teens can
// do it by reading only. Reflection: "Which benefit was hardest to put a number on?"
// Lessons 3 and 5 depend on the Mexican law facts (vacation days, prima, probation); the at-will
// description for the US is general knowledge, not sourced (see docs/CONTENT-REVIEW.md).
// People, jobs and amounts are made up. No employer is named.
import { T, card, choice, tf, act, concept, order, match, number, scenario, fit } from "./helpers.js";

export default {
  id: "joboffer",
  icon: "layers",
  draft: true,
  title: T("Judging a job offer", "Cómo evaluar una oferta de trabajo"),
  sources: [
    // "Read" = the page was opened. "Seen" = a search summary of the page; a reviewer opens each.
    { name: "PROFEDET, \"Conoce tus prestaciones laborales\" and vacation pages (seen): aguinaldo, vacation days, prima vacacional", url: "https://www.profedet.gob.mx/profedet/transparencia/focalizada/conoce_prestaciones_labores.html", checked: "2026-11-17" },
    { name: "SAT, \"Reparto de utilidades 2026\" (seen): PTU deadlines (30 May for companies, 29 June for individuals) and the cap of three months' pay or the three-year average", url: "https://www.sat.gob.mx/minisitio/RepartodeUtilidades/index.html", checked: "2026-11-17" },
    { name: "Ley Federal del Trabajo, art. 39-A to 39-E, consolidated text (seen): probation of up to 30 days, up to 180 for management or technical roles, in writing", url: "https://www.diputados.gob.mx/LeyesBiblio/pdf/LFT.pdf", checked: "2026-11-17" },
    { name: "US Department of Labor, \"Vacation leave\" and Wages (seen): the FLSA doesn't require paid vacation, sick leave or holidays; state law may", url: "https://www.dol.gov/general/topic/workhours/vacation_leave", checked: "2026-11-17" },
    { name: "CareerOneStop Salary Finder (seen): wages by occupation and place, from BLS data", url: "https://www.careeronestop.org/Toolkit/Wages/find-salary.aspx", checked: "2026-11-17" },
    { name: "STPS Observatorio Laboral (seen): monthly income by career from the national employment survey", url: "https://www.observatoriolaboral.gob.mx/", checked: "2026-11-17" },
  ],
  concepts: [
    concept(
      "total_pay",
      T("Total pay", "Pago total"),
      card(
        T("Gross, net and the rest", "Bruto, neto y lo demás"),
        T(
          "Gross pay is before deductions. Net pay is what reaches you. Total pay also counts what a job adds, like benefits, and what it costs you, like commuting. Compare offers on the same measure.",
          "El sueldo bruto es antes de descuentos. El neto es lo que te llega. El pago total también cuenta lo que el trabajo agrega, como prestaciones, y lo que te cuesta, como el transporte. Compara las ofertas con la misma medida."
        )
      ),
      tf("total_pay", T("The offer with the biggest gross pay always leaves you the most.", "La oferta con el sueldo bruto más grande siempre te deja más."), false, T("Commuting, deductions and benefits can change which one leaves you more.", "El transporte, los descuentos y las prestaciones pueden cambiar cuál te deja más.")),
      choice(
        "total_pay",
        T("Which belongs in a fair comparison of two offers?", "¿Qué debe entrar en una comparación justa de dos ofertas?"),
        [T("Commute cost, benefits and what's withheld", "Costo del transporte, prestaciones y descuentos"), T("Only the salary", "Solo el sueldo"), T("Only the job title", "Solo el nombre del puesto")],
        0,
        T("What reaches you, and what it costs to earn it, is what you compare.", "Se compara lo que te llega y lo que cuesta ganarlo."),
        [null, T("Salary alone leaves out costs and benefits.", "El sueldo solo deja fuera costos y prestaciones."), T("A title doesn't say what you'll keep.", "Un puesto no dice con cuánto te quedas.")]
      )
    ),
    concept(
      "benefits_value",
      T("What benefits are worth", "Cuánto valen las prestaciones"),
      card(
        T("Benefits have a price", "Las prestaciones tienen precio"),
        T(
          "Health coverage, paid days off and retirement contributions are part of what a job pays. If you'd otherwise buy them yourself, count what they would cost.",
          "La cobertura de salud, los días de descanso pagados y las aportaciones al retiro son parte de lo que paga un trabajo. Si de otro modo tendrías que comprarlos, cuenta lo que costarían."
        )
      ),
      tf("benefits_value", T("Benefits are extra, so they don't change what an offer is worth.", "Las prestaciones son extra, así que no cambian cuánto vale una oferta."), false, T("They replace things you'd pay for, so they add real value.", "Reemplazan cosas que pagarías, así que suman valor real.")),
      choice(
        "benefits_value",
        T("One job pays {$2800|16500} a month with health coverage worth {$250|2500}. Another pays {$3000|18000} with none. Which is worth more a month?", "Un trabajo paga {$2800|16500} al mes con cobertura de salud que vale {$250|2500}. Otro paga {$3000|18000} sin ella. ¿Cuál vale más al mes?"),
        [T("The one with coverage", "El que tiene cobertura"), T("The one paying {$3000|18000}", "El que paga {$3000|18000}"), T("They're the same", "Son iguales")],
        0,
        T("{$2800|16500} + {$250|2500} = {$3050|19000}, more than {$3000|18000}.", "{$2800|16500} + {$250|2500} = {$3050|19000}, más que {$3000|18000}."),
        [null, T("Add the coverage's value before comparing.", "Suma el valor de la cobertura antes de comparar."), T("Add the coverage's value and they differ.", "Suma el valor de la cobertura y verás que son distintos.")]
      )
    ),
    concept(
      "legal_minimums",
      T("What the law sets", "Qué fija la ley"),
      card(
        T("The law sets a floor", "La ley fija un mínimo"),
        T(
          "Some benefits come from the law and some from the offer. In Mexico the law sets minimums such as aguinaldo and vacation. In the US, federal law sets minimum wage and overtime, and most paid time off is up to the employer.",
          "Algunas prestaciones vienen de la ley y otras de la oferta. En México la ley fija mínimos como el aguinaldo y las vacaciones. En EE. UU., la ley federal fija el salario mínimo y el tiempo extra, y casi todo el tiempo libre pagado depende del empleador."
        )
      ),
      tf(
        "legal_minimums",
        T("In the US, federal law requires paid vacation.", "En EE. UU., la ley federal exige vacaciones pagadas.", { en: "In Mexico, aguinaldo is a bonus the employer may skip.", es: "En México, el aguinaldo es un bono que el patrón puede omitir." }),
        false,
        T("The Department of Labor says the FLSA doesn't require paid vacation. It's up to the employer, and some states add rules.", "El Departamento del Trabajo dice que la FLSA no exige vacaciones pagadas. Depende del empleador, y algunos estados agregan reglas.", { en: "The Ley Federal del Trabajo requires an aguinaldo of at least {@aguinaldoDays} days of salary.", es: "La Ley Federal del Trabajo exige un aguinaldo de por lo menos {@aguinaldoDays} días de salario." })
      ),
      choice(
        "legal_minimums",
        T("Where do you check whether a US job gives paid vacation?", "¿Dónde revisas si un trabajo en EE. UU. da vacaciones pagadas?", { en: "Where do you check the minimum vacation days for a job in Mexico?", es: "¿Dónde revisas los días mínimos de vacaciones de un trabajo en México?" }),
        [T("The offer or the employer's policy", "La oferta o la política del empleador", { en: "The Ley Federal del Trabajo (PROFEDET explains it)", es: "La Ley Federal del Trabajo (la PROFEDET la explica)" }), T("A federal law that sets it", "Una ley federal que lo fija", { en: "Only the offer", es: "Solo la oferta" }), T("The IRS", "El IRS", { en: "The SAT", es: "El SAT" })],
        0,
        T("In the US, paid time off is mostly the employer's choice, so it's in the offer.", "En EE. UU., el tiempo libre pagado es sobre todo decisión del empleador, así que está en la oferta.", { en: "The law sets the minimums, and an offer can only add to them.", es: "La ley fija los mínimos, y una oferta solo puede mejorarlos." }),
        [null, T("No federal law sets paid vacation.", "Ninguna ley federal fija vacaciones pagadas.", { en: "An offer can add to the legal minimum but not go below it.", es: "Una oferta puede mejorar el mínimo legal pero no bajarlo." }), T("The IRS handles taxes, not vacation.", "El IRS ve impuestos, no vacaciones.", { en: "The SAT handles taxes, not vacation.", es: "El SAT ve impuestos, no vacaciones." })]
      )
    ),
    concept(
      "ask_better",
      T("Asking for more", "Pedir más"),
      card(
        T("Look up, then ask", "Investiga y luego pide"),
        T(
          "Before asking for more, look up what the job usually pays where you'd work, and know what you'd bring. Ask a question instead of making a demand. If pay can't move, other parts of the package might.",
          "Antes de pedir más, averigua cuánto suele pagar ese trabajo donde trabajarías y sabe qué aportarías. Haz una pregunta en vez de una exigencia. Si el sueldo no puede subir, quizá otras partes del paquete sí."
        )
      ),
      tf("ask_better", T("The only thing you can ask about is the salary.", "Lo único que puedes preguntar es el sueldo."), false, T("Days off, a review date, training and start date are part of the package too.", "Los días libres, una fecha de revisión, la capacitación y la fecha de inicio también son parte del paquete.")),
      choice(
        "ask_better",
        T("Which helps most before you ask for more pay?", "¿Qué ayuda más antes de pedir más sueldo?"),
        [T("Looking up typical pay for the job in your area", "Averiguar el sueldo típico del puesto en tu zona"), T("Picking a very big number", "Elegir un número muy grande"), T("Waiting until you're upset", "Esperar a estar molesto")],
        0,
        T("A real range gives you a fair number to talk about.", "Un rango real te da un número justo para hablar."),
        [null, T("A number with no basis is easy to turn down.", "Un número sin base es fácil de rechazar."), T("Asking calmly works better than asking angry.", "Pedir con calma funciona mejor que pedir enojado.")]
      )
    ),
    concept(
      "contract_terms",
      T("Contract and probation", "Contrato y periodo de prueba"),
      card(
        T("Put it in writing", "Que quede por escrito"),
        T(
          "A written offer shows pay, start date, benefits and how the job can end. A promise you only heard is hard to prove. Read it before you sign, ask about anything unclear, and keep a copy.",
          "Una oferta por escrito muestra el sueldo, la fecha de inicio, las prestaciones y cómo puede terminar el trabajo. Una promesa que solo oíste es difícil de probar. Léela antes de firmar, pregunta lo que no entiendas y guarda una copia."
        )
      ),
      tf("contract_terms", T("A promise you only heard is as easy to prove as a written one.", "Una promesa que solo oíste es tan fácil de probar como una escrita."), false, T("A written offer is your proof.", "Una oferta por escrito es tu prueba.")),
      choice(
        "contract_terms",
        T("One line in your offer is unclear. What's a good first step?", "Una línea de tu oferta no es clara. ¿Cuál es un buen primer paso?"),
        [T("Ask the employer to explain it before you sign", "Pedirle al empleador que la explique antes de firmar"), T("Sign now and ask later", "Firmar ya y preguntar después"), T("Guess what it means", "Adivinar qué significa")],
        0,
        T("Questions are easiest to ask, and answers easiest to get, before you sign.", "Las preguntas son más fáciles de hacer, y las respuestas de conseguir, antes de firmar."),
        [null, T("After signing, you've already agreed to it.", "Después de firmar, ya aceptaste."), T("A guess can be wrong, and it's your pay.", "Una suposición puede estar mal, y es tu sueldo.")]
      )
    )
  ],
  lessons: [
    {
      id: "joboffer-1",
      title: T("Pay is more than the number", "El pago es más que un número"),
      life: T("Next time you see a pay number, subtract what it costs you to earn it.", "La próxima vez que veas un sueldo, réstale lo que te cuesta ganarlo."),
      steps: [
        card(
          T("Two offers for Leo", "Dos ofertas para Leo"),
          T(
            "Leo has two offers. Offer A pays {$3000|18000} a month, but getting there costs {$250|1600} a month. Offer B pays {$2800|16500} and is a ten-minute walk. Which one leaves Leo with more?",
            "Leo tiene dos ofertas. La oferta A paga {$3000|18000} al mes, pero llegar cuesta {$250|1600} al mes. La oferta B paga {$2800|16500} y está a diez minutos a pie. ¿Cuál le deja más a Leo?"
          )
        ),
        choice(
          "total_pay",
          T("After the travel cost, which leaves Leo with more each month?", "Después del costo del transporte, ¿cuál le deja más a Leo cada mes?"),
          [T("Offer B", "La oferta B"), T("Offer A", "La oferta A"), T("The same", "Lo mismo")],
          0,
          T("A: {$3000|18000} − {$250|1600} = {$2750|16400}. B: {$2800|16500}.", "A: {$3000|18000} − {$250|1600} = {$2750|16400}. B: {$2800|16500}."),
          [null, T("A's bigger number shrinks once travel is subtracted.", "El número más grande de A se achica al restar el transporte."), T("Work each one out. B ends up ahead.", "Calcula cada una. B queda adelante.")]
        ),
        card(
          T("Count everything", "Cuenta todo"),
          T(
            "Gross pay is before deductions. Net pay is what reaches you. Total pay adds what the job gives, like benefits, and subtracts what it costs, like travel, uniforms and health premiums. Compare offers on the same measure.",
            "El sueldo bruto es antes de descuentos. El neto es lo que te llega. El pago total suma lo que da el trabajo, como prestaciones, y resta lo que cuesta, como transporte, uniforme y cuotas de salud. Compara las ofertas con la misma medida."
          )
        ),
        number(
          "total_pay",
          T("An offer pays {$3600|21600} gross a month and {$540|3240} is withheld. How much is the net?", "Una oferta paga {$3600|21600} brutos al mes y se descuentan {$540|3240}. ¿Cuánto es el neto?"),
          { unit: "money", answer: [3060, 18360], tol: 0.5 },
          [T("Net = gross − withheld.", "Neto = bruto − descuentos."), T("{$3600|21600} − {$540|3240} = {$3060|18360}.", "{$3600|21600} − {$540|3240} = {$3060|18360}.")]
        ),
        tf("total_pay", T("The offer with the biggest gross pay always leaves you the most.", "La oferta con el sueldo bruto más grande siempre te deja más."), false, T("Travel, deductions and benefits can change which one leaves you more.", "El transporte, los descuentos y las prestaciones pueden cambiar cuál te deja más.")),
        act("goals.paycheck", T("Move the gross pay and see what you'd take home.", "Mueve el sueldo bruto y mira cuánto te llegaría."), { gross: [3000, 18000] })
      ]
    },
    {
      id: "joboffer-2",
      title: T("Benefits: health, rest and retirement", "Prestaciones: salud, descanso y retiro"),
      life: T("Pick one job post and write what it offers for health, days off and retirement.", "Elige una vacante y anota qué ofrece de salud, días de descanso y retiro."),
      steps: [
        card(
          T("Same pay, different jobs", "Mismo sueldo, distintos trabajos"),
          T(
            "Two offers both pay {$3000|18000} a month. Offer A includes health coverage, paid days off and a retirement contribution. Offer B includes none. Nia thinks they're equal. How could she put a number on the difference?",
            "Dos ofertas pagan {$3000|18000} al mes. La oferta A incluye cobertura de salud, días de descanso pagados y una aportación al retiro. La B no incluye nada. Nia piensa que son iguales. ¿Cómo podría ponerle número a la diferencia?"
          )
        ),
        number(
          "benefits_value",
          T("Offer A's health coverage would cost {$250|2500} a month if Nia bought it herself. What is it worth over a year?", "La cobertura de salud de la oferta A costaría {$250|2500} al mes si Nia la comprara. ¿Cuánto vale en un año?"),
          { unit: "money", answer: [3000, 30000], tol: 0.5 },
          [T("12 months × {$250|2500}.", "12 meses × {$250|2500}."), T("= {$3000|30000} a year.", "= {$3000|30000} al año.")]
        ),
        card(
          T("Three kinds of value", "Tres tipos de valor"),
          T(
            "Health: the part the employer pays is money you don't spend. Rest: paid days off are pay for days you don't work. Retirement: in the US, a 401(k) match adds money when you save. Each is worth a number.",
            "Salud: lo que paga el empleador es dinero que tú no gastas. Descanso: los días libres pagados son sueldo por días que no trabajas. Retiro: en EE. UU., el match de un 401(k) suma dinero cuando ahorras. Cada uno vale un número.",
            { en: "Health: the part the employer pays is money you don't spend. Rest: paid days off are pay for days you don't work. Retirement: employers pay into your AFORE through the IMSS. Each is worth a number.", es: "Salud: lo que paga el patrón es dinero que tú no gastas. Descanso: los días libres pagados son sueldo por días que no trabajas. Retiro: los patrones aportan a tu AFORE por medio del IMSS. Cada uno vale un número." }
          )
        ),
        match(
          "benefits_value",
          T("Match each benefit to what it is worth.", "Une cada prestación con lo que vale."),
          [
            [T("Health coverage", "Cobertura de salud"), T("Care you don't pay for yourself", "Atención que no pagas tú")],
            [T("Paid days off", "Días libres pagados"), T("Pay for days you don't work", "Sueldo por días que no trabajas")],
            [T("Retirement match", "Aportación al retiro", { en: "Retirement contribution", es: "Aportación al retiro" }), T("Money added to your retirement savings", "Dinero que se suma a tu ahorro para el retiro")]
          ],
          T("Each one saves you money or adds to it.", "Cada una te ahorra dinero o te lo suma.")
        ),
        tf("benefits_value", T("A job with lower pay and good benefits can be worth more than a higher-paying one with none.", "Un trabajo con menos sueldo y buenas prestaciones puede valer más que uno con más sueldo y ninguna."), true, T("If the benefits replace costs you'd pay, they can outweigh a pay gap.", "Si las prestaciones reemplazan costos que pagarías, pueden pesar más que la diferencia de sueldo.")),
        act("goals.insurance", T("Compare a low-premium plan and a low-deductible plan.", "Compara un plan de prima baja con uno de deducible bajo."))
      ]
    },
    {
      id: "joboffer-3",
      title: T("What the law guarantees", "Lo que garantiza la ley"),
      life: T("Before an offer, find out which benefits come from the law and which only from the employer.", "Antes de una oferta, averigua qué prestaciones vienen de la ley y cuáles solo del empleador."),
      steps: [
        card(
          T("An offer and a question", "Una oferta y una pregunta"),
          T(
            "Sam has a job offer in Phoenix. It doesn't mention paid vacation, and he assumes the law makes employers give some. Is he right?",
            "Sam tiene una oferta de trabajo en Phoenix. No menciona vacaciones pagadas, y supone que la ley obliga a los empleadores a dar algunas. ¿Tiene razón?",
            { en: "Lupe has a job offer in Monterrey. It lists an aguinaldo of {@aguinaldoDays} days and little else. She wonders what else the law gives her.", es: "Lupe tiene una oferta de trabajo en Monterrey. Menciona un aguinaldo de {@aguinaldoDays} días y casi nada más. Se pregunta qué más le da la ley." }
          )
        ),
        choice(
          "legal_minimums",
          T("Does federal law require an employer to give paid vacation?", "¿La ley federal exige que un empleador dé vacaciones pagadas?", { en: "What's the least aguinaldo a Mexican employer must pay?", es: "¿Cuál es el aguinaldo mínimo que debe pagar un patrón en México?" }),
          [T("No. It's up to the employer, and some states add rules", "No. Depende del empleador, y algunos estados agregan reglas", { en: "{@aguinaldoDays} days of salary, paid before 20 December", es: "{@aguinaldoDays} días de salario, pagados antes del 20 de diciembre" }), T("Yes, two weeks", "Sí, dos semanas", { en: "One month of salary", es: "Un mes de salario" }), T("Yes, after one year", "Sí, después de un año", { en: "Nothing, it's optional", es: "Nada, es opcional" })],
          0,
          T("The Department of Labor says the FLSA doesn't require paid vacation, sick leave or holidays.", "El Departamento del Trabajo dice que la FLSA no exige vacaciones, días de enfermedad ni días festivos pagados.", { en: "The LFT sets {@aguinaldoDays} days of salary as the minimum, due before 20 December.", es: "La LFT fija {@aguinaldoDays} días de salario como mínimo, a pagar antes del 20 de diciembre." }),
          [null, T("No federal law sets that.", "Ninguna ley federal fija eso.", { en: "That's more than the minimum. An offer can add to it.", es: "Eso es más que el mínimo. Una oferta puede mejorarlo." }), T("No federal law sets a length of service for it.", "Ninguna ley federal fija una antigüedad para eso.", { en: "The aguinaldo is a legal right, not optional.", es: "El aguinaldo es un derecho legal, no es opcional." })]
        ),
        card(
          T("The floor, country by country", "El piso, país por país"),
          T(
            "In the US, federal law sets minimum wage and overtime, not paid time off. Vacation, sick days and holidays come from the offer, with some state and city rules. So read the offer for them.",
            "En EE. UU., la ley federal fija el salario mínimo y el tiempo extra, no el tiempo libre pagado. Vacaciones, días de enfermedad y festivos vienen de la oferta, con algunas reglas de estados y ciudades. Por eso hay que leer la oferta.",
            { en: "In Mexico the law sets minimums: an aguinaldo of at least {@aguinaldoDays} days; {@mxVacationDaysYear1} vacation days after the first year, rising to {@mxVacationDaysYear5} in year five; a prima vacacional of at least {@mxPrimaVacacionalPct} of vacation pay; a share of profits (PTU) for many workers; and IMSS coverage.", es: "En México la ley fija mínimos: un aguinaldo de al menos {@aguinaldoDays} días; {@mxVacationDaysYear1} días de vacaciones tras el primer año, hasta {@mxVacationDaysYear5} en el quinto; una prima vacacional de al menos {@mxPrimaVacacionalPct} del pago de vacaciones; una parte de las utilidades (PTU) para muchos trabajadores; y cobertura del IMSS." }
          )
        ),
        number(
          "legal_minimums",
          T("An offer gives 10 paid vacation days. Your daily pay is {$120|600}. What are those days worth?", "Una oferta da 10 días de vacaciones pagados. Tu pago diario es de {$120|600}. ¿Cuánto valen esos días?", { en: "The minimum aguinaldo is {@aguinaldoDays} days of salary. Your daily pay is {$120|600}. What's the minimum aguinaldo?", es: "El aguinaldo mínimo es de {@aguinaldoDays} días de salario. Tu pago diario es de {$120|600}. ¿Cuál es el aguinaldo mínimo?" }),
          { unit: "money", answer: [1200, 9000], tol: 0.5 },
          [T("10 days × {$120|600}.", "10 días × {$120|600}.", { en: "{@aguinaldoDays} days × {$120|600}.", es: "{@aguinaldoDays} días × {$120|600}." }), T("= {$1200|6000}.", "= {$1200|6000}.", { en: "= {$1800|9000}.", es: "= {$1800|9000}." })]
        ),
        tf(
          "legal_minimums",
          T("In the US, federal law requires employers to pay for sick days.", "En EE. UU., la ley federal exige que los empleadores paguen los días de enfermedad.", { en: "In Mexico, unused vacation days can simply be paid out in cash.", es: "En México, los días de vacaciones sin usar se pueden pagar simplemente en efectivo." }),
          false,
          T("Paid sick leave isn't required by the FLSA. Some states and cities require it.", "La FLSA no exige días de enfermedad pagados. Algunos estados y ciudades sí.", { en: "The LFT says vacation can't be swapped for money.", es: "La LFT dice que las vacaciones no se pueden cambiar por dinero." })
        ),
        act("goals.paycheck", T("Move the gross pay and see what you'd take home.", "Mueve el sueldo bruto y mira cuánto te llegaría."), { gross: [3000, 18000] })
      ]
    },
    {
      id: "joboffer-4",
      title: T("Asking for a raise or a better offer", "Pedir un aumento o una mejor oferta"),
      life: T("Look up what one job usually pays in your area, and write the range.", "Averigua cuánto suele pagar un trabajo en tu zona y anota el rango."),
      steps: [
        card(
          T("Is it fair?", "¿Es justa?"),
          T(
            "Ana has an offer of {$3000|18000} a month and isn't sure it's fair. Before she answers, she looks up what the job usually pays near her, using the US government's Salary Finder. What does she do with the range she finds?",
            "Ana tiene una oferta de {$3000|18000} al mes y no sabe si es justa. Antes de responder, averigua cuánto suele pagar ese trabajo cerca de ella, con el Salary Finder del gobierno de EE. UU. ¿Qué hace con el rango que encuentra?",
            { en: "Ana has an offer of {$3000|18000} a month and isn't sure it's fair. Before she answers, she looks up what the job usually pays, using the Observatorio Laboral's income by career. What does she do with the range she finds?", es: "Ana tiene una oferta de {$3000|18000} al mes y no sabe si es justa. Antes de responder, averigua cuánto suele pagar ese trabajo en el Observatorio Laboral, que muestra ingresos por carrera. ¿Qué hace con el rango que encuentra?" }
          )
        ),
        choice(
          "ask_better",
          T("What's the strongest basis for asking for more?", "¿Cuál es la base más fuerte para pedir más?"),
          [T("What similar jobs pay here, and what you bring", "Lo que pagan trabajos parecidos aquí y lo que tú aportas"), T("That you need the money", "Que necesitas el dinero"), T("That a friend earns more", "Que un amigo gana más")],
          0,
          T("A real range and your own skills give the employer something to weigh.", "Un rango real y tus propias habilidades le dan al empleador algo que valorar."),
          [null, T("Need is real but doesn't change what the job is worth.", "La necesidad es real pero no cambia lo que vale el trabajo."), T("Your friend's job may differ in ways you can't see.", "El trabajo de tu amigo puede ser distinto en cosas que no ves.")]
        ),
        card(
          T("One common way to ask", "Una forma común de pedir"),
          T(
            "Many people look up typical pay, say what they'd add to the job, and ask a question instead of making a demand. If pay can't move, they ask about other parts: days off, a review in six months, training. A no is information.",
            "Mucha gente averigua el sueldo típico, dice qué aportaría al trabajo y hace una pregunta en vez de una exigencia. Si el sueldo no puede subir, pregunta por otras partes: días libres, una revisión en seis meses, capacitación. Un no es información."
          )
        ),
        scenario(
          "ask_better",
          T("The employer says the pay can't go up. What do you do?", "El empleador dice que el sueldo no puede subir. ¿Qué haces?"),
          [
            fit(T("Ask whether days off, a review date or training can change", "Preguntas si pueden cambiar los días libres, una fecha de revisión o la capacitación"), "good", T("Pay isn't the only part of the package.", "El sueldo no es la única parte del paquete.")),
            fit(T("Accept without asking anything else", "Aceptas sin preguntar nada más"), "ok", T("It's your choice, but you may leave value on the table.", "Es tu decisión, pero puedes dejar valor sin pedir.")),
            fit(T("Say you'll walk away unless it changes", "Dices que te vas si no cambia"), "poor", T("An ultimatum with no basis can end the conversation.", "Un ultimátum sin base puede terminar la conversación."))
          ],
          T("Keep the conversation open and look at the whole package.", "Mantén la conversación abierta y mira todo el paquete.")
        ),
        order(
          "ask_better",
          T("Put these steps in order before you ask.", "Pon estos pasos en orden antes de pedir."),
          [T("Look up typical pay where you'd work", "Averigua el sueldo típico donde trabajarías"), T("List what you'd bring to the job", "Anota lo que aportarías al trabajo"), T("Decide the lowest you'd accept", "Decide lo mínimo que aceptarías"), T("Ask your question calmly", "Haz tu pregunta con calma")],
          T("You need the facts and your own limit before you ask.", "Necesitas los datos y tu propio límite antes de pedir.")
        ),
        act("goals.paycheck", T("Move the gross pay and see what a raise adds to take-home pay.", "Mueve el sueldo bruto y mira cuánto suma un aumento a lo que te llega."), { gross: [3000, 18000] })
      ]
    },
    {
      id: "joboffer-5",
      title: T("Contracts, probation and leaving well", "Contratos, periodo de prueba y cómo irte bien"),
      life: T("Before you sign anything, ask for the offer in writing and keep a copy.", "Antes de firmar algo, pide la oferta por escrito y guarda una copia."),
      steps: [
        card(
          T("What it says, and doesn't", "Lo que dice y lo que no"),
          T(
            "Sofía's offer says \"at-will employment\". In the US that usually means either side can end the job at any time, with some exceptions the law protects. Nothing says how long it lasts. What should she read for?",
            "La oferta de Sofía dice \"empleo a voluntad\" (at-will). En EE. UU. eso suele significar que cualquiera de las partes puede terminar el trabajo en cualquier momento, con algunas excepciones que protege la ley. Nada dice cuánto dura. ¿Qué debe buscar al leer?",
            { en: "Mateo's offer includes a probation period. In Mexico the law lets it run up to {@mxProbationDays} days, or up to {@mxProbationDaysSenior} for management or specialized technical roles, and it must be in writing. Salary, IMSS and benefits still apply. What should he read for?", es: "La oferta de Mateo incluye un periodo de prueba. En México la ley permite hasta {@mxProbationDays} días, o hasta {@mxProbationDaysSenior} en puestos directivos o técnicos especializados, y debe constar por escrito. El sueldo, el IMSS y las prestaciones siguen aplicando. ¿Qué debe buscar al leer?" }
          )
        ),
        choice(
          "contract_terms",
          T("What does \"at-will\" usually mean?", "¿Qué suele significar \"a voluntad\" (at-will)?", { en: "How long can a probation period be for a regular job?", es: "¿Cuánto puede durar un periodo de prueba en un trabajo normal?" }),
          [T("Either side can end the job at any time", "Cualquiera de las partes puede terminar el trabajo en cualquier momento", { en: "Up to {@mxProbationDays} days", es: "Hasta {@mxProbationDays} días" }), T("The job lasts a full year", "El trabajo dura un año completo", { en: "Six months", es: "Seis meses" }), T("The employer must give a reason", "El empleador debe dar una razón", { en: "One year", es: "Un año" })],
          0,
          T("It's common in US jobs, with exceptions such as discrimination.", "Es común en trabajos de EE. UU., con excepciones como la discriminación.", { en: "Only management or specialized technical roles can go up to {@mxProbationDaysSenior} days.", es: "Solo los puestos directivos o técnicos especializados pueden llegar a {@mxProbationDaysSenior} días." }),
          [null, T("At-will doesn't promise any length.", "At-will no promete ninguna duración.", { en: "Six months isn't allowed for regular roles.", es: "Seis meses no se permite en puestos normales." }), T("At-will usually means no reason is required.", "At-will suele significar que no se requiere razón.", { en: "A year is far beyond the limit.", es: "Un año está muy por encima del límite." })]
        ),
        card(
          T("Read before you sign", "Lee antes de firmar"),
          T(
            "Check pay and pay dates, hours, benefits, start date and how either side ends the job. Ask for it in writing and keep a copy. When leaving, many people give notice, return what's the employer's and ask in writing for their final pay.",
            "Revisa el sueldo y sus fechas de pago, el horario, las prestaciones, la fecha de inicio y cómo puede terminar el trabajo cualquiera de las partes. Pídelo por escrito y guarda una copia. Al irse, mucha gente avisa, devuelve lo del empleador y pide por escrito su pago final.",
            { en: "Check pay and pay dates, hours, benefits, start date and how either side ends the job. Ask for it in writing and keep a copy. When leaving, many people give notice, return what's the employer's and ask in writing for their finiquito: pending pay and the part of aguinaldo and vacation owed.", es: "Revisa el sueldo y sus fechas de pago, el horario, las prestaciones, la fecha de inicio y cómo puede terminar el trabajo cualquiera de las partes. Pídelo por escrito y guarda una copia. Al irse, mucha gente avisa, devuelve lo del patrón y pide por escrito su finiquito: sueldo pendiente y la parte proporcional de aguinaldo y vacaciones." }
          )
        ),
        tf(
          "contract_terms",
          T("A promise you only heard is as easy to prove as one in writing.", "Una promesa que solo oíste es tan fácil de probar como una escrita.", { en: "A probation period doesn't need to be in writing.", es: "Un periodo de prueba no necesita constar por escrito." }),
          false,
          T("A written offer is your proof.", "Una oferta por escrito es tu prueba.", { en: "The LFT says a probation must be in writing, or the job is treated as permanent.", es: "La LFT dice que el periodo de prueba debe constar por escrito, o la relación se entiende por tiempo indeterminado." })
        ),
        scenario(
          "contract_terms",
          T("You've decided to leave a job. How do you leave?", "Decidiste dejar un trabajo. ¿Cómo te vas?"),
          [
            fit(T("Give notice, return what's theirs and ask in writing for your final pay", "Avisas, devuelves lo suyo y pides por escrito tu pago final", { en: "Give notice, return what's theirs and ask in writing for your finiquito", es: "Avisas, devuelves lo suyo y pides por escrito tu finiquito" }), "good", T("A clear, written exit protects you and keeps doors open.", "Una salida clara y por escrito te protege y deja puertas abiertas.")),
            fit(T("Tell a coworker and just stop coming", "Le dices a un compañero y dejas de ir"), "poor", T("Your final pay and your record can suffer.", "Tu pago final y tu historial pueden salir afectados.")),
            fit(T("Leave with no notice, then send an email", "Te vas sin avisar y luego mandas un correo"), "poor", T("It gives the employer no chance to settle things.", "No le da al empleador oportunidad de dejar todo en orden."))
          ],
          T("Leave in a way you can prove.", "Vete de una forma que puedas probar.")
        ),
        act("goals.create", T("Make a goal for one month of expenses as a cushion between jobs.", "Crea una meta de un mes de gastos como colchón entre trabajos."), { name: { en: "Cushion between jobs", es: "Colchón entre trabajos" }, target: [2500, 15000], months: 6 })
      ]
    }
  ]
};
