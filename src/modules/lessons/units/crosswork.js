// UNIT — Working across the border. Its lessons and the concepts they teach (format in helpers.js).
// Written for life between the US and Mexico: amounts are always dollars or pesos. It explains how things work and where to
// get official help; it never says what a person's papers allow (that depends on their own situation).
// Needs a human review before it goes live (and a licensed professional's look at lessons 1 and 4).
import { T, card, choice, tf, act, concept, order, number, match, spot, tap, scenario, fit } from "./helpers.js";

export default {
  id: "crosswork",
  icon: "users",
  title: T("Working across the border", "Trabajar a los dos lados de la frontera"),
  concepts: [
    concept(
      "work_papers",
      T("Papers for work", "Papeles para trabajar"),
      card(
        T("Work needs permission", "Trabajar requiere permiso"),
        T("In each country, working legally depends on your status and papers. The employer checks them. Never pay anyone who promises work papers fast: use the official government offices.", "En cada país, trabajar legalmente depende de tu situación y tus papeles. El empleador los revisa. Nunca pagues a quien te prometa papeles de trabajo rápido: usa las oficinas oficiales del gobierno.")
      ),
      tf("work_papers", T("Anyone who offers work papers for a fee can be trusted.", "Se puede confiar en cualquiera que ofrezca papeles de trabajo por una cuota."), false, T("Many offers are scams. Only official offices can issue them, and many help for free.", "Muchas ofertas son estafas. Solo las oficinas oficiales los emiten, y muchas ayudan gratis.")),
      choice(
        "work_papers",
        T("A stranger offers a job on the other side if you pay a \"processing fee\" first. What's your best move?", "Un desconocido te ofrece un empleo del otro lado si pagas antes una \"cuota de trámite\". ¿Qué es lo mejor?"),
        [T("Don't pay. Check the employer and ask an official office or a trusted adult", "No pagar. Revisar al empleador y preguntar en una oficina oficial o a un adulto de confianza"), T("Pay, because jobs are hard to find", "Pagar, porque los empleos son difíciles de encontrar"), T("Pay half to see if it's real", "Pagar la mitad para ver si es real")],
        0,
        T("Real employers don't charge you to hire you. Asking first costs nothing.", "Los empleadores reales no te cobran por contratarte. Preguntar primero no cuesta nada."),
        [null, T("That's what scammers count on. A fee up front is a warning sign.", "En eso confían los estafadores. Una cuota por adelantado es señal de alerta."), T("Half a payment is still a loss if it's a scam.", "La mitad del pago sigue siendo una pérdida si es una estafa.")]
      )
    ),
    concept(
      "pay_both_sides",
      T("Pay and deductions on each side", "Sueldo y descuentos en cada lado"),
      card(
        T("Take-home pay differs", "Lo que llevas a casa cambia"),
        T("The same salary pays differently on each side. The US withholds income tax, Social Security and Medicare. Mexico withholds ISR and the IMSS share. Compare take-home pay, not the headline number.", "El mismo sueldo rinde distinto en cada lado. EE. UU. retiene impuesto sobre la renta, Seguro Social y Medicare. México retiene el ISR y la parte del IMSS. Compara lo que te queda, no el número de cartel.")
      ),
      tf("pay_both_sides", T("A bigger salary always means more take-home pay.", "Un sueldo mayor siempre significa más dinero en la mano."), false, T("Deductions, benefits and living costs differ, so compare what you keep.", "Descuentos, prestaciones y costo de vida cambian, así que compara lo que te queda.")),
      choice(
        "pay_both_sides",
        T("Two offers: {US$2000} a month in the US, or {MX$25000} in Mexico. What helps you compare?", "Dos ofertas: {US$2000} al mes en EE. UU., o {MX$25000} en México. ¿Qué ayuda a comparar?"),
        [T("Take-home pay after deductions, and what your costs would be in each place", "Lo que queda después de descuentos, y cuáles serían tus gastos en cada lugar"), T("Convert both at today's rate and pick the larger one", "Convertir ambas al tipo de hoy y elegir la mayor"), T("Whichever sounds bigger", "La que suene más grande")],
        0,
        T("What you keep, against what you pay to live there, is the real comparison.", "Lo que conservas, frente a lo que cuesta vivir ahí, es la comparación real."),
        [null, T("Converting ignores deductions and costs on each side.", "Convertir ignora los descuentos y los costos de cada lado."), T("The number alone tells you very little.", "El número por sí solo dice muy poco.")]
      )
    ),
    concept(
      "health_benefits",
      T("Health coverage and benefits", "Salud y prestaciones"),
      card(
        T("Coverage stays on its side", "La cobertura se queda de su lado"),
        T("Health coverage usually follows the country where you work. IMSS covers workers in Mexico; in the US, coverage often comes from an employer plan or a public program. Check what you're covered for, and where.", "La cobertura de salud suele seguir al país donde trabajas. El IMSS cubre a quienes trabajan en México; en EE. UU. suele venir de un plan del empleador o de un programa público. Revisa qué cubre y dónde.")
      ),
      tf("health_benefits", T("Coverage from one country always works in the other.", "La cobertura de un país siempre sirve en el otro."), false, T("Often it doesn't, or only in emergencies. Ask your plan what it covers abroad.", "A menudo no sirve, o solo en emergencias. Pregunta a tu plan qué cubre fuera.")),
      choice(
        "health_benefits",
        T("You work in Mexico with IMSS but live part of the week in the US. What should you check?", "Trabajas en México con IMSS pero vives parte de la semana en EE. UU. ¿Qué deberías revisar?"),
        [T("Where you can get care under your coverage, and what happens in an emergency on the other side", "Dónde puedes recibir atención con tu cobertura y qué pasa en una emergencia del otro lado"), T("Nothing, coverage goes where you go", "Nada, la cobertura va donde vas"), T("Only the price of the plan", "Solo el precio del plan")],
        0,
        T("Knowing where your coverage works before you need it avoids huge surprise bills.", "Saber dónde funciona tu cobertura antes de necesitarla evita cuentas enormes por sorpresa."),
        [null, T("Many plans only cover care on their own side.", "Muchos planes solo cubren atención de su propio lado."), T("The price matters, but a plan that won't cover you where you need care isn't cheap.", "El precio importa, pero un plan que no te cubre donde necesitas atención no es barato.")]
      )
    ),
    concept(
      "records_pensions",
      T("Records and pensions", "Registros y pensiones"),
      card(
        T("Your work history counts", "Tu historial laboral cuenta"),
        T("Retirement benefits depend on how long you worked and paid in. The US and Mexico have an agreement so time worked in both can count, and you don't pay the same social security tax twice. Keep records of every job.", "Las prestaciones de retiro dependen de cuánto tiempo trabajaste y cotizaste. EE. UU. y México tienen un acuerdo para que el tiempo trabajado en ambos pueda contar y no pagues dos veces el mismo impuesto de seguridad social. Guarda registros de cada empleo.")
      ),
      tf("records_pensions", T("Papers from old jobs aren't worth keeping.", "Los papeles de empleos anteriores no vale la pena guardarlos."), false, T("Pay stubs and statements can prove your work history for benefits years later.", "Los recibos de pago y estados de cuenta pueden probar tu historial laboral para prestaciones años después.")),
      choice(
        "records_pensions",
        T("You worked three years in each country. What best protects your retirement benefits?", "Trabajaste tres años en cada país. ¿Qué protege mejor tus prestaciones de retiro?"),
        [T("Keeping pay records and numbers from both, and asking each agency how your time counts", "Guardar registros y números de ambos y preguntar a cada agencia cómo cuenta tu tiempo"), T("Throwing away old papers to keep things simple", "Tirar los papeles viejos para simplificar"), T("Assuming it all adds up by itself", "Suponer que todo se suma solo")],
        0,
        T("Records plus a question to each agency settle how your time counts.", "Los registros y una pregunta a cada agencia aclaran cómo cuenta tu tiempo."),
        [null, T("Without records, proving years worked can be hard.", "Sin registros, probar los años trabajados puede ser difícil."), T("It might, but only if the agencies can match your records. Check.", "Quizá, pero solo si las agencias pueden relacionar tus registros. Compruébalo.")]
      )
    ),
  ],
  lessons: [
    {
      id: "crosswork-1",
      title: T("Who can work where", "Quién puede trabajar dónde"),
      life: T("Find the official government page on working legally in the country you're interested in, and read the first screen.", "Busca la página oficial del gobierno sobre trabajar legalmente en el país que te interesa y lee la primera pantalla."),
      steps: [
        card(T("Rules depend on your situation", "Las reglas dependen de tu situación"), T("Who can work where depends on citizenship, visa and other papers. Official websites explain the options. This lesson can't say what your papers allow, so check for your case.", "Quién puede trabajar dónde depende de la ciudadanía, la visa y otros papeles. Los sitios oficiales explican las opciones. Esta lección no puede decir qué permiten tus papeles, así que revísalo para tu caso.")),
        tf("work_papers", T("Employers in both countries are required to check that a worker is allowed to work.", "Los empleadores de ambos países deben revisar que un trabajador pueda trabajar."), true, T("That's part of the law in each country. It protects workers and employers.", "Es parte de la ley en cada país. Protege a trabajadores y empleadores.")),
        spot(
          "work_papers",
          T("Read this message. Tap the 2 red flags.", "Lee este mensaje. Toca las 2 señales de alerta."),
          "sms",
          T("Message · +1 (555) 013-4402", "Mensaje · 55 4455 0192"),
          [
            tap(T("Jobs across the border, no papers needed!", "¡Empleos al otro lado, sin papeles!"), true),
            T(" Pay a ", " Paga una "),
            tap(T("{US$150} fee today", "cuota de {US$150} hoy"), true),
            T(" and ", " y "),
            tap(T("we'll find you work.", "te conseguimos trabajo.")),
          ],
          T("\"No papers\" and an up-front fee are classic scam signs. Real jobs go through real employers.", "\"Sin papeles\" y una cuota por adelantado son señales clásicas de estafa. Los empleos reales pasan por empleadores reales.")
        ),
        scenario(
          "work_papers",
          T("You want to work across the border. What's the best first step?", "Quieres trabajar del otro lado de la frontera. ¿Cuál es el mejor primer paso?"),
          [
            fit(T("Read the official government page, and ask a free help office", "Leer la página oficial del gobierno y preguntar en una oficina de ayuda gratuita"), "good", T("Official sources are free and current.", "Las fuentes oficiales son gratuitas y actuales.")),
            fit(T("Ask a friend how they did it", "Preguntar a un amigo cómo lo hizo"), "ok", T("Helpful for ideas, but rules depend on each case.", "Útil para ideas, pero las reglas dependen de cada caso.")),
            fit(T("Pay a stranger who promises papers", "Pagar a un desconocido que promete papeles"), "poor", T("This is how many people lose money, and sometimes their chance of a legal status.", "Así pierden dinero muchas personas, y a veces la posibilidad de tener estatus legal.")),
          ],
          T("Start with official, free sources, not with promises.", "Empieza con fuentes oficiales y gratuitas, no con promesas.")
        ),
        card(T("Free help exists", "Existe ayuda gratuita"), T("Consulates and many nonprofits give free advice about working papers. Look for official or well-known ones, and never pay for forms that are free from the government.", "Los consulados y muchas organizaciones sin fines de lucro dan asesoría gratuita sobre papeles de trabajo. Busca las oficiales o bien conocidas, y nunca pagues por formularios que el gobierno da gratis.")),
        act("goals.scam", T("Look at a job message and find what gives it away.", "Mira un mensaje de empleo y encuentra qué lo delata.")),
      ],
    },
    {
      id: "crosswork-2",
      title: T("Pay and deductions on each side", "Sueldo y descuentos en cada lado"),
      life: T("Next time you see a pay offer, ask: how much would I take home after deductions?", "La próxima vez que veas una oferta de sueldo, pregunta: ¿cuánto me quedaría después de descuentos?"),
      steps: [
        card(T("Gross and net, on both sides", "Bruto y neto, en ambos lados"), T("Gross pay is before deductions; net pay is what you keep. In the US the deductions include income tax, Social Security and Medicare. In Mexico they include ISR and the IMSS share.", "El sueldo bruto es antes de descuentos; el neto es lo que te queda. En EE. UU. los descuentos incluyen impuesto sobre la renta, Seguro Social y Medicare. En México incluyen el ISR y la parte del IMSS.")),
        number(
          "pay_both_sides",
          T("Your gross pay is {US$2000} and about {US$300} is withheld. What's your net pay?", "Tu sueldo bruto es de {US$2000} y se retienen unos {US$300}. ¿Cuál es tu sueldo neto?"),
          { unit: "number", answer: 1700, tol: 1 },
          [T("Gross minus what's withheld.", "Bruto menos lo que se retiene."), T("2000 − 300 = 1,700 dollars.", "2000 − 300 = 1,700 dólares.")]
        ),
        match(
          "pay_both_sides",
          T("Match each deduction to its side.", "Une cada descuento con su lado."),
          [
            [T("Social Security and Medicare", "Seguro Social y Medicare"), T("US pay stubs", "Recibos de EE. UU.")],
            [T("ISR and IMSS", "ISR e IMSS"), T("Mexican pay stubs (recibo de nómina)", "Recibos de nómina mexicanos")],
            [T("Net pay", "Sueldo neto"), T("What you actually take home", "Lo que de verdad te llevas")],
          ],
          T("Different names and rates, same idea: some of your pay goes to taxes and benefits before you see it.", "Nombres y tasas distintos, misma idea: parte de tu sueldo va a impuestos y prestaciones antes de que lo veas.")
        ),
        tf("pay_both_sides", T("Overtime pay and rest days follow the labor rules of the country where you work.", "El pago de horas extra y los días de descanso siguen las reglas laborales del país donde trabajas."), true, T("Each country has its own rules. Ask your employer, or the labor office, what applies.", "Cada país tiene sus propias reglas. Pregunta a tu empleador o a la oficina laboral qué aplica.")),
        card(T("Compare the whole picture", "Compara el panorama completo"), T("Add the benefits, the commute and living costs. A job that pays less but includes health coverage and a shorter commute can leave you with more.", "Suma las prestaciones, el traslado y el costo de vida. Un empleo que paga menos pero incluye seguro médico y un traslado más corto puede dejarte más.")),
        act("goals.paycheck", T("Enter a gross pay and see how much you'd take home.", "Escribe un sueldo bruto y mira cuánto te llevarías a casa.")),
      ],
    },
    {
      id: "crosswork-3",
      title: T("Health coverage and benefits", "Salud y prestaciones"),
      life: T("Find out where your health coverage works, and what to do in an emergency on the other side.", "Averigua dónde sirve tu cobertura de salud y qué hacer en una emergencia del otro lado."),
      steps: [
        card(T("Coverage follows the job", "La cobertura sigue al empleo"), T("In Mexico, formal workers are enrolled in IMSS. In the US, many get a health plan through an employer, and others use public programs or buy a plan. Each plan has its own network.", "En México, los trabajadores formales están inscritos en el IMSS. En EE. UU., muchos tienen un plan de salud por el empleador y otros usan programas públicos o compran un plan. Cada plan tiene su propia red.")),
        match(
          "health_benefits",
          T("Match each word to its meaning.", "Une cada palabra con su significado."),
          [
            [T("Network", "Red"), T("The doctors and hospitals your plan covers", "Los médicos y hospitales que cubre tu plan")],
            [T("Emergency care", "Atención de urgencia"), T("Care you can't wait for", "Atención que no puede esperar")],
            [T("Out of network", "Fuera de la red"), T("Care your plan covers less, or not at all", "Atención que tu plan cubre menos o no cubre")],
          ],
          T("Knowing these three words helps you read what your plan really covers.", "Conocer estas tres palabras te ayuda a leer qué cubre de verdad tu plan.")
        ),
        scenario(
          "health_benefits",
          T("You feel sick while visiting family on the other side. What's the smartest move?", "Te sientes mal mientras visitas a tu familia del otro lado. ¿Cuál es la mejor decisión?"),
          [
            fit(T("Ask your plan how it handles care abroad before you go", "Preguntar a tu plan cómo maneja la atención fuera del país antes de ir"), "good", T("That's best, and it takes one call. Some plans cover emergencies only.", "Es lo mejor y toma una llamada. Algunos planes solo cubren urgencias.")),
            fit(T("Assume your coverage works everywhere", "Suponer que tu cobertura sirve en todas partes"), "poor", T("A bill for a visit you thought was covered can be very large.", "La cuenta de una visita que creías cubierta puede ser muy grande.")),
            fit(T("Skip care to avoid cost", "Evitar atención para no gastar"), "poor", T("Skipping care can turn a small problem into a big one.", "Evitar la atención puede convertir un problema pequeño en uno grande.")),
          ],
          T("Ask your plan before you need care, not after.", "Pregunta a tu plan antes de necesitar atención, no después.")
        ),
        tf("health_benefits", T("An employer plan can have different benefits than another employer's plan.", "Un plan del empleador puede tener prestaciones distintas a las de otro empleador."), true, T("Compare what's covered, what you pay, and which doctors you can use.", "Compara qué cubre, cuánto pagas y qué médicos puedes usar.")),
        card(T("Benefits are part of pay", "Las prestaciones son parte del pago"), T("Paid rest days, aguinaldo, retirement contributions and health coverage all have a value. When you compare two jobs, count them.", "Los días de descanso pagados, el aguinaldo, las aportaciones de retiro y la cobertura médica tienen un valor. Al comparar dos empleos, cuéntalos.")),
        act("goals.insurance", T("Try a few plan choices and notice what changes your costs.", "Prueba algunas opciones de plan y fíjate qué cambia tus costos.")),
      ],
    },
    {
      id: "crosswork-4",
      title: T("Social Security and IMSS: the US–Mexico agreement", "Seguro Social e IMSS: el acuerdo entre EE. UU. y México"),
      life: T("Write down the dates and employers of each job you've had, in both countries, in one place.", "Anota en un solo lugar las fechas y los empleadores de cada trabajo que has tenido, en ambos países."),
      steps: [
        card(T("Two systems, one agreement", "Dos sistemas, un acuerdo"), T("The US and Mexico signed a social security agreement. It lets time worked in both countries count toward some benefits, and it can stop you from paying into both systems for the same work.", "EE. UU. y México firmaron un acuerdo de seguridad social. Permite que el tiempo trabajado en ambos países cuente para algunas prestaciones, y puede evitar que cotices en los dos sistemas por el mismo trabajo.")),
        tf("records_pensions", T("Because of the agreement, time worked in both countries can count toward some benefits.", "Por el acuerdo, el tiempo trabajado en ambos países puede contar para algunas prestaciones."), true, T("The details depend on the benefit and your history. The agencies can tell you.", "Los detalles dependen de la prestación y de tu historial. Las agencias pueden decírtelo.")),
        match(
          "records_pensions",
          T("Match each system to where it applies.", "Une cada sistema con donde aplica."),
          [
            [T("Social Security (SSA)", "Seguro Social (SSA)"), T("The US system", "El sistema de EE. UU.")],
            [T("IMSS and AFORE", "IMSS y AFORE"), T("The Mexican system", "El sistema mexicano")],
            [T("The agreement", "El acuerdo"), T("Lets time in both count for some benefits", "Permite que el tiempo en ambos cuente para algunas prestaciones")],
          ],
          T("Each country keeps its own system; the agreement connects them.", "Cada país conserva su propio sistema; el acuerdo los conecta.")
        ),
        choice(
          "records_pensions",
          T("You want to know how your work in both countries counts for retirement. Who should you ask?", "Quieres saber cómo cuenta tu trabajo en ambos países para el retiro. ¿A quién deberías preguntar?"),
          [T("The Social Security Administration and IMSS, the official sources", "A la Administración del Seguro Social y al IMSS, las fuentes oficiales"), T("Whoever advertises \"pension rescue\"", "A quien anuncie \"rescate de pensiones\""), T("Nobody, it's too complicated", "A nadie, es demasiado complicado")],
          0,
          T("The agencies keep your records and apply the rules. Advice from them is free.", "Las agencias llevan tus registros y aplican las reglas. Su asesoría es gratuita."),
          [null, T("Paid middlemen can charge you for what the agencies do for free.", "Los intermediarios de paga pueden cobrarte por lo que las agencias hacen gratis."), T("It can feel that way, but one question to the right office can clear a lot up.", "Puede parecerlo, pero una pregunta a la oficina correcta aclara mucho.")]
        ),
        card(T("Start early", "Empieza temprano"), T("Questions about benefits are easier to answer with records. Ask early, keep every statement, and keep your numbers (such as NSS and Social Security) private and safe.", "Las dudas sobre prestaciones se resuelven más fácil con registros. Pregunta temprano, guarda cada estado de cuenta y mantén tus números (como el NSS y el del Seguro Social) privados y seguros.")),
        act("goals.retire", T("See how years of saving change what you'd have later.", "Mira cómo los años de ahorro cambian lo que tendrías después.")),
      ],
    },
    {
      id: "crosswork-5",
      title: T("Keeping records for later", "Guardar registros para después"),
      life: T("Make one folder, paper or digital, for pay stubs, contracts and statements from every job.", "Haz una carpeta, de papel o digital, para recibos de pago, contratos y estados de cuenta de cada empleo."),
      steps: [
        card(T("Records are proof", "Los registros son prueba"), T("Pay stubs, contracts, tax forms and benefit statements prove what you earned and paid. Keep them in one safe place. Years later they can settle a question in minutes.", "Los recibos de pago, contratos, formularios de impuestos y estados de prestaciones prueban lo que ganaste y pagaste. Guárdalos en un lugar seguro. Años después pueden resolver una duda en minutos.")),
        order(
          "records_pensions",
          T("Put the steps in order to keep good records.", "Pon los pasos en orden para llevar buenos registros."),
          [T("Ask for a pay stub or receipt each pay period", "Pedir un recibo de pago en cada periodo"), T("Save it in one folder", "Guardarlo en una sola carpeta"), T("Back it up (a photo or a scan)", "Hacerle una copia (foto o escaneo)"), T("Keep them for years, not months", "Conservarlos por años, no por meses")],
          T("Each step protects the next. A photo on a phone you lose isn't a backup.", "Cada paso protege al siguiente. Una foto en un teléfono que pierdes no es una copia.")
        ),
        tf("records_pensions", T("It's safe to share a photo of your Social Security or NSS number with anyone who asks.", "Es seguro compartir una foto de tu número de Seguro Social o NSS con quien lo pida."), false, T("These numbers can be used to steal your identity. Share them only with an employer or agency you've checked.", "Estos números sirven para robar tu identidad. Compártelos solo con un empleador o agencia que ya verificaste.")),
        choice(
          "records_pensions",
          T("Where is a good place to keep a copy of your work records?", "¿Dónde es buen lugar para guardar una copia de tus registros laborales?"),
          [T("A folder you control, with a backup in a second place", "Una carpeta que controlas, con una copia en un segundo lugar"), T("A group chat", "Un chat de grupo"), T("Only your employer's files", "Solo en los archivos de tu empleador")],
          0,
          T("You control it, and a second copy covers a lost phone or a closed employer.", "Tú la controlas, y una segunda copia cubre un teléfono perdido o un empleador que cierra."),
          [null, T("A group chat isn't private and files vanish.", "Un chat de grupo no es privado y los archivos desaparecen."), T("Employers close, change systems or lose files. Keep your own.", "Los empleadores cierran, cambian de sistema o pierden archivos. Guarda los tuyos.")]
        ),
        card(T("Small habit, big payoff", "Hábito pequeño, gran ganancia"), T("Take thirty seconds at the end of each pay period to save the stub. It can matter for taxes, loans, benefits and proving your work.", "Dedica treinta segundos al final de cada periodo a guardar el recibo. Puede importar para impuestos, préstamos, prestaciones y para probar tu trabajo.")),
        act("goals.paycheck", T("Read a sample pay stub and find each deduction.", "Lee un recibo de pago de ejemplo y encuentra cada descuento.")),
      ],
    },
  ],
};
