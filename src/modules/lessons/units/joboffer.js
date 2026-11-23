// UNIT — Judging a job offer. Its lessons and the concepts they teach (format in helpers.js).
// For everyone: amounts are {$US|MX}; where the US and Mexico differ (what the law sets and what an employer offers) the
// text has a Mexico version. Rates and minimums are in core/facts.js. Needs a human review before it goes live.
import { T, card, choice, tf, act, concept, order, number, match, spot, tap, scenario, fit } from "./helpers.js";

export default {
  id: "joboffer",
  icon: "scale",
  title: T("Judging a job offer", "Cómo evaluar una oferta de trabajo"),
  concepts: [
    concept(
      "total_pay",
      T("Pay is more than the number", "El pago es más que el número"),
      card(
        T("Count the whole offer", "Cuenta toda la oferta"),
        T("An offer is pay plus benefits, minus the costs of the job: commute, uniforms, taxes and deductions. Compare what you'd keep and what you'd get, not only the salary.", "Una oferta es sueldo más prestaciones, menos los costos del trabajo: traslado, uniformes, impuestos y descuentos. Compara lo que te quedaría y lo que recibirías, no solo el sueldo.")
      ),
      tf("total_pay", T("The job with the bigger salary is always the better offer.", "El empleo con el sueldo más grande siempre es la mejor oferta."), false, T("Benefits, costs and hours can change which one leaves you better off.", "Las prestaciones, los costos y las horas pueden cambiar cuál te deja mejor.")),
      choice(
        "total_pay",
        T("Job A pays {$2000|25000} a month and has no benefits. Job B pays {$1800|23000} but covers health care and a bus pass. What helps you compare?", "El empleo A paga {$2000|25000} al mes y no tiene prestaciones. El B paga {$1800|23000} pero cubre atención médica y transporte. ¿Qué ayuda a comparar?"),
        [T("Adding what B saves you each month, and comparing take-home pay", "Sumar lo que B te ahorra cada mes y comparar lo que te queda"), T("Choosing A, because the number is higher", "Elegir A, porque el número es mayor"), T("Choosing B, because benefits are always better", "Elegir B, porque las prestaciones siempre son mejores")],
        0,
        T("Benefits have a value. Count it, then compare what's left after costs.", "Las prestaciones tienen un valor. Cuéntalo y compara lo que queda después de los costos."),
        [null, T("A bigger number can leave you with less after costs you'd pay yourself.", "Un número mayor puede dejarte menos después de costos que pagarías tú."), T("Not always. Count them to see if B really comes out ahead.", "No siempre. Cuéntalas para ver si B de verdad sale ganando.")]
      )
    ),
    concept(
      "job_benefits",
      T("Health, rest and retirement", "Salud, descanso y retiro"),
      card(
        T("The benefits that matter most", "Las prestaciones que más importan"),
        T("Look for health coverage, paid time off, and a retirement plan with an employer match (free money: a match of {@matchExampleUS}% means they add 50 cents per dollar you put in, up to a limit). Few of these are required by law in the US.", "Busca cobertura de salud, días de descanso pagados y un plan de retiro con aportación del empleador (dinero gratis: una aportación de {@matchExampleUS}% significa que ponen 50 centavos por cada dólar que tú pones, hasta un límite). Pocas son obligatorias por ley en EE. UU.", { en: "Look for the benefits beyond the law: bonuses, extra vacation days, health insurance on top of IMSS, savings funds and food vouchers. Compare them in pesos a year.", es: "Busca las prestaciones por encima de la ley: bonos, más días de vacaciones, seguro médico además del IMSS, fondo de ahorro y vales de despensa. Compáralas en pesos al año." })
      ),
      tf("job_benefits", T("Every employer must give the same benefits.", "Todos los empleadores deben dar las mismas prestaciones."), false, T("The law sets a floor, and employers can offer more. Compare them offer by offer.", "La ley fija un mínimo y los empleadores pueden ofrecer más. Compáralas oferta por oferta.")),
      choice(
        "job_benefits",
        T("An employer offers a retirement match. What's the smartest way to think about it?", "Un empleador ofrece una aportación para el retiro. ¿Cuál es la forma más inteligente de verla?"),
        [T("As part of your pay: it's money you'd miss if you skipped it", "Como parte de tu pago: es dinero que perderías si no lo aprovechas"), T("As a bonus that doesn't matter", "Como un extra que no importa"), T("As a reason to take any job", "Como una razón para aceptar cualquier empleo")],
        0,
        T("A match is part of what you earn. Ask how it works and what you must do to get it.", "Una aportación es parte de lo que ganas. Pregunta cómo funciona y qué debes hacer para recibirla."),
        [null, T("It can be worth hundreds or thousands a year.", "Puede valer cientos o miles al año."), T("It's one part of the offer. Weigh it with everything else.", "Es una parte de la oferta. Pésala con todo lo demás.")]
      )
    ),
    concept(
      "mx_benefits",
      T("What the law sets", "Lo que fija la ley"),
      card(
        T("Rules differ by country", "Las reglas cambian por país"),
        T("In the US, little is set by law: paid time off, sick days and health coverage often depend on the employer and the state. Always ask for the details in writing before you accept.", "En EE. UU., poco lo fija la ley: los días de descanso pagados, los días por enfermedad y la cobertura de salud suelen depender del empleador y del estado. Pide siempre los detalles por escrito antes de aceptar.", { en: "In Mexico, the law sets minimums for formal jobs: an aguinaldo of at least {@aguinaldoDays} days of pay, at least {@vacationDaysFirstYearMX} paid vacation days after a year, a prima vacacional of at least {@primaVacacionalPct}% on them, IMSS coverage and a share of company profits (PTU).", es: "En México, la ley fija mínimos para el empleo formal: un aguinaldo de al menos {@aguinaldoDays} días de sueldo, al menos {@vacationDaysFirstYearMX} días de vacaciones pagadas después de un año, una prima vacacional de al menos {@primaVacacionalPct}% sobre ellas, cobertura del IMSS y una parte de las utilidades de la empresa (PTU)." })
      ),
      tf("mx_benefits", T("Your offer should tell you in writing what time off, health coverage and extras you get.", "Tu oferta debe decirte por escrito qué descanso, cobertura médica y extras recibes."), true, T("Written terms avoid surprises, and they're what you can point to later.", "Los términos por escrito evitan sorpresas, y es a lo que puedes recurrir después.")),
      choice(
        "mx_benefits",
        T("An offer says \"we'll talk about benefits after you start\". What's the sensible response?", "Una oferta dice \"hablamos de las prestaciones cuando empieces\". ¿Cuál es la respuesta sensata?"),
        [T("Ask for the benefits in writing before accepting", "Pedir las prestaciones por escrito antes de aceptar"), T("Accept now and trust them", "Aceptar ya y confiar"), T("Ask the other workers later", "Preguntar después a los demás empleados")],
        0,
        T("Writing it down first protects you, and a good employer won't mind.", "Ponerlo por escrito primero te protege, y a un buen empleador no le molestará."),
        [null, T("Without the terms in writing, you can't compare or hold anyone to them.", "Sin los términos por escrito no puedes comparar ni exigirlos."), T("Coworkers can help, but only the offer and the law bind the employer.", "Los compañeros pueden ayudar, pero solo la oferta y la ley obligan al empleador.")]
      )
    ),
    concept(
      "negotiate",
      T("Asking for more", "Pedir más"),
      card(
        T("It's normal to ask", "Es normal preguntar"),
        T("Most employers expect some questions. Research what similar jobs pay, say what you bring, ask politely for a number, and stay calm if the answer is no. You can often ask for other things: start date, schedule or training.", "La mayoría de los empleadores espera algunas preguntas. Investiga cuánto pagan trabajos parecidos, di qué aportas, pide un número con respeto y mantén la calma si la respuesta es no. Muchas veces puedes pedir otras cosas: fecha de inicio, horario o capacitación.")
      ),
      tf("negotiate", T("Asking about pay can make an employer take back a fair offer.", "Preguntar por el sueldo puede hacer que un empleador retire una oferta justa."), false, T("A respectful question is normal. Rarely does a fair offer vanish because of one.", "Una pregunta respetuosa es normal. Rara vez una oferta justa desaparece por una.")),
      choice(
        "negotiate",
        T("You'd like more pay. What's the best way to start?", "Quisieras ganar más. ¿Cuál es la mejor forma de empezar?"),
        [T("Research what similar jobs pay, then politely ask if there's room", "Investigar cuánto pagan trabajos parecidos y preguntar con respeto si hay margen"), T("Say \"I won't work for less\" right away", "Decir \"no trabajo por menos\" de entrada"), T("Say nothing and hope for a raise", "No decir nada y esperar un aumento")],
        0,
        T("Facts and a polite question work best. You can still say yes to a no.", "Los datos y una pregunta cortés funcionan mejor. Aun con un no, puedes aceptar."),
        [null, T("An ultimatum closes doors you may want open.", "Un ultimátum cierra puertas que quizá quieras abiertas."), T("Raises often go to those who ask, with reasons.", "Los aumentos suelen ir a quien pregunta con razones.")]
      )
    ),
    concept(
      "contracts",
      T("Contracts and leaving well", "Contratos y salir bien"),
      card(
        T("Read before you sign", "Lee antes de firmar"),
        T("A contract or offer letter should say the pay, hours, start date, trial period and how either side can end the job. Keep a copy. If something is missing or unclear, ask. Never sign a blank page.", "Un contrato o carta de oferta debe decir el sueldo, el horario, la fecha de inicio, el periodo de prueba y cómo puede terminar la relación cualquiera de las partes. Guarda una copia. Si algo falta o no es claro, pregunta. Nunca firmes una hoja en blanco.")
      ),
      tf("contracts", T("It's fine to sign a blank page and fill it in later.", "Está bien firmar una hoja en blanco y llenarla después."), false, T("Never. Anything can be written above your signature.", "Nunca. Pueden escribir lo que sea sobre tu firma.")),
      choice(
        "contracts",
        T("You're asked to sign today. You haven't read the contract. What's the wise move?", "Te piden firmar hoy. No has leído el contrato. ¿Qué es lo sensato?"),
        [T("Ask to take it home, read it and ask questions first", "Pedir llevártelo a casa, leerlo y hacer preguntas antes"), T("Sign to look eager", "Firmar para verte entusiasta"), T("Sign without reading, it's standard", "Firmar sin leer, es lo normal")],
        0,
        T("A fair employer lets you read first. Pressure to sign right now is a warning sign.", "Un empleador justo te deja leer primero. La presión para firmar ahora es una señal de alerta."),
        [null, T("Looking eager isn't worth being tied to terms you didn't read.", "Verte entusiasta no vale quedar atado a términos que no leíste."), T("\"Standard\" is no reason to skip reading.", "\"Es lo normal\" no es razón para no leer.")]
      )
    ),
  ],
  lessons: [
    {
      id: "joboffer-1",
      title: T("Pay is more than the number", "El pago es más que el número"),
      life: T("Next time you hear a pay number, ask: is that before or after deductions, and what else comes with it?", "La próxima vez que oigas un sueldo, pregunta: ¿es antes o después de descuentos y qué más incluye?"),
      steps: [
        card(T("Whole offer, not one number", "La oferta completa, no un número"), T("Add up pay and benefits, then subtract costs like transport and uniforms and what's deducted. That's the offer's real value. A smaller salary with good benefits can beat a bigger one without.", "Suma el pago y las prestaciones, y resta costos como transporte y uniformes y lo que se descuenta. Ese es el valor real de la oferta. Un sueldo menor con buenas prestaciones puede ganarle a uno mayor sin ellas.")),
        number(
          "total_pay",
          T("A job pays {$16|90} an hour for 40 hours a week. About how much is that in a 52-week year?", "Un empleo paga {$16|90} la hora por 40 horas a la semana. ¿Cuánto es más o menos en un año de 52 semanas?"),
          { unit: "number", answer: [33280, 187200], tol: 0.5 },
          [T("Hourly pay × 40 hours × 52 weeks.", "Pago por hora × 40 horas × 52 semanas."), T("{$16|90} × 40 × 52 = {$33280|187200}.", "{$16|90} × 40 × 52 = {$33280|187200}.")]
        ),
        scenario(
          "total_pay",
          T("Two offers pay the same. One is 10 minutes away and has health coverage; the other is 90 minutes away and has none. What helps?", "Dos ofertas pagan igual. Una está a 10 minutos y tiene cobertura médica; la otra está a 90 minutos y no tiene. ¿Qué ayuda?"),
          [
            fit(T("Count commute time and cost, and the value of the coverage", "Contar el tiempo y costo del traslado y el valor de la cobertura"), "good", T("Time and benefits are part of pay.", "El tiempo y las prestaciones son parte del pago.")),
            fit(T("Pick whichever is closer, no matter what", "Elegir la más cercana, sin importar nada más"), "ok", T("It's reasonable, but check what you give up.", "Es razonable, pero revisa a qué renuncias.")),
            fit(T("Flip a coin", "Echar una moneda"), "poor", T("You have facts to use. Use them.", "Tienes datos que usar. Úsalos.")),
          ],
          T("The right offer is the one that leaves your life better, not the biggest number.", "La oferta correcta es la que mejora tu vida, no la del número más grande.")
        ),
        tf("total_pay", T("Costs like transport and uniforms reduce what an offer is really worth.", "Costos como transporte y uniformes reducen lo que realmente vale una oferta."), true, T("Subtract them, and compare what's left.", "Réstalos y compara lo que queda.")),
        card(T("Ask the right questions", "Haz las preguntas correctas"), T("Ask: what's the pay before and after deductions, how many hours, what benefits, what costs would I have, and what's the trial period? Write down the answers.", "Pregunta: ¿cuál es el pago antes y después de descuentos, cuántas horas, qué prestaciones, qué costos tendría y cuál es el periodo de prueba? Anota las respuestas.")),
        act("goals.paycheck", T("Enter a pay and see what you'd take home.", "Escribe un sueldo y mira cuánto te llevarías a casa.")),
      ],
    },
    {
      id: "joboffer-2",
      title: T("Benefits: health, rest and retirement", "Prestaciones: salud, descanso y retiro"),
      life: T("Make a short list: health, time off, retirement. Mark which ones a job you're considering offers.", "Haz una lista corta: salud, descanso, retiro. Marca cuáles ofrece un empleo que consideras."),
      steps: [
        card(T("Three big ones", "Tres grandes"), T("Health coverage can save thousands. Paid time off protects your income when you rest or get sick. A retirement contribution from the employer is money added to your future.", "La cobertura de salud puede ahorrarte miles. Los días de descanso pagados protegen tu ingreso cuando descansas o te enfermas. Una aportación del empleador para el retiro es dinero que se suma a tu futuro.")),
        match(
          "job_benefits",
          T("Match each benefit to what it does for you.", "Une cada prestación con lo que hace por ti."),
          [
            [T("Health coverage", "Cobertura médica"), T("Lowers big medical bills", "Reduce cuentas médicas grandes")],
            [T("Paid time off", "Días de descanso pagados"), T("You keep earning while you rest", "Sigues ganando mientras descansas")],
            [T("Retirement contribution", "Aportación para el retiro"), T("Adds to your savings for later", "Suma a tu ahorro para después")],
          ],
          T("Each one is real money, even though it doesn't show in your paycheck.", "Cada una es dinero real, aunque no aparezca en tu cheque.")
        ),
        number(
          "job_benefits",
          T("Your employer matches 50% of what you put in, up to 6% of {US$30000}. What's the most the match can be in a year?", "Tu empleador aporta 50% de lo que tú pones, hasta 6% de {US$30000}. ¿Cuánto es lo máximo que puede aportar en un año?", { en: "Your daily pay is {MX$400}. Your employer gives an extra savings fund of 10 days of pay each year. How much is that?", es: "Tu sueldo diario es de {MX$400}. Tu empleador da un fondo de ahorro extra de 10 días de sueldo al año. ¿Cuánto es?" }),
          { unit: "number", answer: [900, 4000], tol: 0.5 },
          [T("6% of 30,000 is 1,800. The employer adds half of that.", "6% de 30,000 es 1,800. El empleador pone la mitad.", { en: "Daily pay × 10 days.", es: "Sueldo diario × 10 días." }), T("0.5 × 1,800 = 900 dollars.", "0.5 × 1,800 = 900 dólares.", { en: "400 × 10 = 4,000 pesos.", es: "400 × 10 = 4,000 pesos." })]
        ),
        tf("job_benefits", T("Benefits can be worth thousands a year, even if they never appear in your paycheck.", "Las prestaciones pueden valer miles al año, aunque nunca aparezcan en tu cheque."), true, T("Count them when you compare offers.", "Cuéntalas cuando compares ofertas.")),
        card(T("Ask how to get them", "Pregunta cómo obtenerlas"), T("Some benefits need a waiting period or a minimum number of hours. Ask when each one starts and what you must do to keep it.", "Algunas prestaciones requieren un periodo de espera o un mínimo de horas. Pregunta cuándo empieza cada una y qué debes hacer para conservarla.")),
        act("goals.retire", T("See what a retirement contribution can grow into.", "Mira en qué puede convertirse una aportación para el retiro.")),
      ],
    },
    {
      id: "joboffer-3",
      title: T("What the law sets, and what employers add", "Lo que fija la ley y lo que agregan los empleadores"),
      life: T("Write what's required by law in your country for jobs, and what you'd want an employer to add.", "Escribe lo que la ley exige en tu país para los empleos y qué te gustaría que agregara un empleador."),
      steps: [
        card(T("A floor, not a ceiling", "Un piso, no un techo"), T("The law sets minimums, and many employers offer more. In the US the minimums are few and vary by state. In Mexico the formal-job minimums include aguinaldo, vacation days, prima vacacional, IMSS and PTU.", "La ley fija mínimos y muchos empleadores ofrecen más. En EE. UU. los mínimos son pocos y varían por estado. En México los mínimos del empleo formal incluyen aguinaldo, vacaciones, prima vacacional, IMSS y PTU.")),
        match(
          "mx_benefits",
          T("Match each benefit to what it is.", "Une cada prestación con lo que es."),
          [
            [T("Written terms", "Términos por escrito"), T("What you can point to later", "Lo que puedes mostrar después")],
            [T("The legal minimum", "El mínimo legal"), T("The least an employer must give", "Lo mínimo que debe dar el empleador")],
            [T("Extra benefits", "Prestaciones extra"), T("What an employer adds on top", "Lo que agrega un empleador por encima")],
          ],
          T("Get the minimum and the extras in writing, so you can compare.", "Pide el mínimo y los extras por escrito para poder comparar.")
        ),
        choice(
          "mx_benefits",
          T("Which question tells you the most about an offer?", "¿Qué pregunta te dice más sobre una oferta?"),
          [T("What benefits come with it, and where is that in writing?", "¿Qué prestaciones incluye y dónde está eso por escrito?"), T("Is the office nice?", "¿La oficina es bonita?"), T("How many people work there?", "¿Cuánta gente trabaja ahí?")],
          0,
          T("Benefits in writing are what you can count and rely on.", "Las prestaciones por escrito son lo que puedes contar y en lo que puedes confiar."),
          [null, T("A nice office doesn't pay your bills.", "Una oficina bonita no paga tus cuentas."), T("Size doesn't tell you what you'd get.", "El tamaño no te dice qué recibirías.")]
        ),
        tf("mx_benefits", T("An employer can usually offer more than the legal minimum.", "Un empleador normalmente puede ofrecer más que el mínimo legal."), true, T("Many do, to attract workers. Ask what they offer.", "Muchos lo hacen para atraer trabajadores. Pregunta qué ofrecen.")),
        card(T("Beware of off-the-books work", "Cuidado con el trabajo sin contrato"), T("Work with no contract, no pay stub and no coverage can leave you without protection if you're hurt, fired or need proof of income. Ask for a contract.", "El trabajo sin contrato, sin recibo de pago y sin cobertura puede dejarte sin protección si te lastimas, te despiden o necesitas probar ingresos. Pide un contrato.")),
        act("goals.paycheck", T("Compare take-home pay for different offers.", "Compara lo que te llevarías en distintas ofertas.")),
      ],
    },
    {
      id: "joboffer-4",
      title: T("Asking for a raise or a better offer", "Pedir un aumento o una mejor oferta"),
      life: T("Write down one thing you'd say if you asked for a raise: what you did, and what you'd like.", "Anota una cosa que dirías si pidieras un aumento: qué hiciste y qué quisieras."),
      steps: [
        card(T("Facts, then a question", "Datos y luego una pregunta"), T("Know what similar jobs pay, list what you've done, ask for a specific number or range, and listen. If the answer is no, ask what it would take, or ask for another benefit.", "Conoce cuánto pagan trabajos parecidos, haz una lista de lo que has hecho, pide un número o rango específico y escucha. Si la respuesta es no, pregunta qué se necesitaría o pide otra prestación.")),
        order(
          "negotiate",
          T("Put the steps in order to prepare.", "Pon los pasos en orden para prepararte."),
          [T("Research what similar jobs pay", "Investigar cuánto pagan trabajos parecidos"), T("List what you've done and learned", "Hacer una lista de lo que has hecho y aprendido"), T("Pick a number or range to ask for", "Elegir un número o rango para pedir"), T("Ask politely and listen", "Preguntar con respeto y escuchar")],
          T("Preparation first, then the question. Each step makes the next easier.", "Primero la preparación, luego la pregunta. Cada paso facilita el siguiente.")
        ),
        scenario(
          "negotiate",
          T("You ask for {$20|110} an hour and they say they can only do {$18|100}. What's a good response?", "Pides {$20|110} la hora y te dicen que solo pueden dar {$18|100}. ¿Qué respuesta es buena?"),
          [
            fit(T("Ask what would get you to {$20|110}, or whether other benefits could make up the gap", "Preguntar qué te llevaría a {$20|110} o si otras prestaciones podrían compensar la diferencia"), "good", T("It keeps the talk going and opens other options.", "Mantiene la conversación y abre otras opciones.")),
            fit(T("Accept right away without asking more", "Aceptar de inmediato sin preguntar más"), "ok", T("It's allowed, but you may leave value on the table.", "Se puede, pero quizá dejes valor sobre la mesa.")),
            fit(T("Walk out angrily", "Irte molesto"), "poor", T("It burns a bridge for no gain.", "Quema un puente sin ganar nada.")),
          ],
          T("A calm follow-up question often gets more than an ultimatum.", "Una pregunta tranquila de seguimiento suele conseguir más que un ultimátum.")
        ),
        tf("negotiate", T("You can ask for things other than pay, like schedule, start date or training.", "Puedes pedir cosas distintas al sueldo, como horario, fecha de inicio o capacitación."), true, T("These can be worth as much as a few extra dollars an hour.", "Pueden valer tanto como unos pesos más por hora.")),
        card(T("Get it in writing", "Ponlo por escrito"), T("Whatever you agree, ask to see it in writing before you start. A friendly email that repeats what was said is enough to begin with.", "Lo que acuerden, pide verlo por escrito antes de empezar. Un correo amable que repita lo que se dijo basta para empezar.")),
        act("goals.paycheck", T("Try a higher pay and see how much more you'd take home.", "Prueba un sueldo más alto y mira cuánto más te llevarías.")),
      ],
    },
    {
      id: "joboffer-5",
      title: T("Contracts, probation and leaving well", "Contratos, periodo de prueba y salir bien"),
      life: T("If you're ever handed a contract, take it home to read it and ask three questions before you sign.", "Si algún día te dan un contrato, llévatelo a leer y haz tres preguntas antes de firmar."),
      steps: [
        card(T("What a contract says", "Qué dice un contrato"), T("Pay, hours, duties, start date, trial period and how to end the job. A trial period is when either side can end things more easily. Keep a copy of everything you sign.", "Sueldo, horario, funciones, fecha de inicio, periodo de prueba y cómo terminar la relación. En el periodo de prueba cualquiera de las partes puede terminar con más facilidad. Guarda una copia de todo lo que firmes.")),
        spot(
          "contracts",
          T("Read this job message. Tap the 2 red flags.", "Lee este mensaje de empleo. Toca las 2 señales de alerta."),
          "offer",
          T("Message · \"Recruiter\"", "Mensaje · \"Reclutador\""),
          [
            T("We'd love to hire you. ", "Nos encantaría contratarte. "),
            tap(T("No contract, we'll pay you in cash.", "Sin contrato, te pagamos en efectivo."), true),
            T(" Start Monday. ", " Empiezas el lunes. "),
            tap(T("Send {$100|1800} first for your uniform.", "Envía primero {$100|1800} para tu uniforme."), true),
            tap(T(" Hours are 9 to 5.", " El horario es de 9 a 5.")),
          ],
          T("Cash-only with no contract leaves you unprotected, and a fee up front is a scam sign. A real employer provides the uniform or deducts it openly.", "Pago solo en efectivo sin contrato te deja sin protección, y una cuota por adelantado es señal de estafa. Un empleador real da el uniforme o lo descuenta de forma abierta.")
        ),
        tf("contracts", T("It's fine to leave a job without telling anyone, if it isn't working.", "Está bien dejar un empleo sin avisar a nadie, si no funciona."), false, T("Giving notice protects your references and any pay you're owed.", "Avisar protege tus referencias y el pago que se te deba.")),
        choice(
          "contracts",
          T("You decide to leave a job. What helps you leave well?", "Decides dejar un empleo. ¿Qué te ayuda a salir bien?"),
          [T("Give notice, finish the work you can, and ask for a written confirmation of what you're owed", "Avisar, terminar el trabajo que puedas y pedir una confirmación por escrito de lo que se te debe"), T("Stop showing up", "Dejar de ir"), T("Delete your pay records", "Borrar tus registros de pago")],
          0,
          T("A clean exit keeps a good reference and makes sure you get what you're owed.", "Una salida limpia conserva una buena referencia y asegura que recibas lo que se te debe."),
          [null, T("Abandoning a job can cost you pay and references.", "Abandonar un empleo puede costarte pago y referencias."), T("You may need those records later. Keep them.", "Quizá necesites esos registros después. Guárdalos.")]
        ),
        card(T("Know your rights", "Conoce tus derechos"), T("Labor offices in each country can tell you your rights about pay, hours and ending a job, for free. Find yours before you need them.", "Las oficinas laborales de cada país pueden decirte tus derechos sobre sueldo, horario y terminación de un empleo, gratis. Busca la tuya antes de necesitarla.")),
        act("goals.scam", T("Look at a job message and find what gives it away.", "Mira un mensaje de empleo y encuentra qué lo delata.")),
      ],
    },
  ],
};
