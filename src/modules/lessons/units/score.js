// UNIT — Credit scores and reports. Its lessons and the concepts they teach (format in helpers.js).
// For everyone: amounts are {$US|MX}; the US and Mexico systems differ (bureaus, scores, free reports), so many texts have a
// Mexico version. Numbers that change are in core/facts.js. Needs a human review before it goes live.
import { T, card, choice, tf, act, concept, order, number, match, scenario, fit } from "./helpers.js";

export default {
  id: "score",
  icon: "chart",
  title: T("Credit scores and reports", "Historial y puntaje de crédito"),
  concepts: [
    concept(
      "credit_report",
      T("What a credit report is", "Qué es un reporte de crédito"),
      card(
        T("Your credit story", "Tu historia crediticia"),
        T("A credit report lists your credit accounts and whether you paid them on time. Lenders read it to decide if they'll lend to you. In the US, three bureaus keep reports: Equifax, Experian and TransUnion.", "Un reporte de crédito lista tus cuentas de crédito y si las pagaste a tiempo. Los prestamistas lo leen para decidir si te prestan. En EE. UU. tres burós llevan los reportes: Equifax, Experian y TransUnion.", { en: "A credit report lists your credit accounts and whether you paid them on time. Lenders read it to decide if they'll lend to you. In Mexico, two bureaus keep reports: Buró de Crédito and Círculo de Crédito.", es: "Un reporte de crédito lista tus cuentas de crédito y si las pagaste a tiempo. Los prestamistas lo leen para decidir si te prestan. En México dos burós llevan los reportes: Buró de Crédito y Círculo de Crédito." })
      ),
      tf("credit_report", T("A credit report shows how much money you earn.", "Un reporte de crédito muestra cuánto dinero ganas."), false, T("It shows accounts, payments and inquiries. Your pay and bank balance aren't on it.", "Muestra cuentas, pagos y consultas. Tu sueldo y tu saldo del banco no están en él.")),
      choice(
        "credit_report",
        T("Which of these is on a credit report?", "¿Cuál de estas cosas aparece en un reporte de crédito?"),
        [T("Your credit accounts and whether you paid them on time", "Tus cuentas de crédito y si las pagaste a tiempo"), T("Your savings balance", "Tu saldo de ahorro"), T("Your salary", "Tu sueldo")],
        0,
        T("A report is the record of how you've handled credit, not of your wealth.", "Un reporte es el registro de cómo has manejado el crédito, no de tu riqueza."),
        [null, T("Savings aren't tracked in credit reports.", "Los ahorros no se registran en los reportes de crédito."), T("Pay isn't part of a report either.", "El sueldo tampoco es parte de un reporte.")]
      )
    ),
    concept(
      "score_factors",
      T("Where a score comes from", "De dónde sale un puntaje"),
      card(
        T("A number that sums it up", "Un número que lo resume"),
        T("A credit score turns your report into one number, from {@ficoRange}. The biggest parts: {@ficoFactors}. Paying on time matters most.", "Un puntaje de crédito convierte tu reporte en un número, de {@ficoRange}. Las partes más grandes: {@ficoFactors}. Pagar a tiempo es lo que más importa.", { en: "A credit score turns your report into one number: the Score de Buró runs {@buroScoreRange}. It rewards similar things: paying on time, owing little against your limits and a longer, steady history.", es: "Un puntaje de crédito convierte tu reporte en un número: el Score de Buró va de {@buroScoreRange}. Premia cosas parecidas: pagar a tiempo, deber poco frente a tus límites y un historial largo y constante." })
      ),
      tf("score_factors", T("Checking your own credit report lowers your score.", "Revisar tu propio reporte de crédito baja tu puntaje."), false, T("Looking at your own report doesn't hurt your score.", "Consultar tu propio reporte no daña tu puntaje.")),
      choice(
        "score_factors",
        T("Which habit helps a score most?", "¿Qué hábito ayuda más a un puntaje?"),
        [T("Paying on time, every time", "Pagar a tiempo, siempre"), T("Applying for many cards at once", "Pedir muchas tarjetas a la vez"), T("Closing your oldest account", "Cerrar tu cuenta más antigua")],
        0,
        T("A long record of on-time payments is the biggest single factor.", "Un historial largo de pagos puntuales es el factor individual más grande."),
        [null, T("Many applications at once can lower it, and you may not be approved.", "Muchas solicitudes a la vez pueden bajarlo y quizá no te aprueben."), T("Your oldest account shows a long history. Closing it can shorten it.", "Tu cuenta más antigua muestra un historial largo. Cerrarla puede acortarlo.")]
      )
    ),
    concept(
      "free_report",
      T("Your free report", "Tu reporte gratuito"),
      card(
        T("Free and official", "Gratuito y oficial"),
        T("In the US, annualcreditreport.com is the official site for your free reports from the three bureaus, {@usFreeReportFrequency}. It never asks for payment. Be careful with lookalike sites.", "En EE. UU., annualcreditreport.com es el sitio oficial para tus reportes gratuitos de los tres burós, {@usFreeReportFrequency}. Nunca pide pago. Ten cuidado con sitios parecidos.", { en: "In Mexico, each bureau must give you one free report every {@buroFreeReportMonths} months, through its official site. It never needs a payment. Be careful with lookalike sites.", es: "En México, cada buró debe darte un reporte gratuito cada {@buroFreeReportMonths} meses, en su sitio oficial. Nunca requiere pago. Ten cuidado con sitios parecidos." })
      ),
      tf("free_report", T("You must pay a company to see your own credit report.", "Tienes que pagar a una empresa para ver tu propio reporte de crédito."), false, T("You're entitled to free reports from the official sources.", "Tienes derecho a reportes gratuitos en las fuentes oficiales.")),
      choice(
        "free_report",
        T("A site offers your \"free credit report\" but asks for a card number first. What's wise?", "Un sitio ofrece tu \"reporte de crédito gratis\" pero pide primero un número de tarjeta. ¿Qué es sensato?"),
        [T("Leave, and go to the official site", "Salir e ir al sitio oficial"), T("Enter the card, it's probably free", "Poner la tarjeta, seguro es gratis"), T("Send a photo of your ID too", "Mandar también una foto de tu identificación")],
        0,
        T("Official sources don't ask for a card for a free report.", "Las fuentes oficiales no piden tarjeta para un reporte gratuito."),
        [null, T("\"Free\" with a card often becomes a monthly charge.", "\"Gratis\" con tarjeta suele volverse un cobro mensual."), T("Never send your ID photo to an unfamiliar site.", "Nunca mandes la foto de tu identificación a un sitio desconocido.")]
      )
    ),
    concept(
      "fix_errors",
      T("Fixing mistakes", "Corregir errores"),
      card(
        T("Reports can be wrong", "Los reportes pueden tener errores"),
        T("A report can show an account that isn't yours, or a late payment you made on time. Dispute it with the bureau and the lender, with proof. They have to look into it.", "Un reporte puede mostrar una cuenta que no es tuya o un pago tarde que hiciste a tiempo. Disputa con el buró y con el prestamista, con pruebas. Tienen que investigarlo.")
      ),
      tf("fix_errors", T("If your report has a mistake, you can ask to have it fixed.", "Si tu reporte tiene un error, puedes pedir que lo corrijan."), true, T("Both countries have a process. Keep proof like receipts and statements.", "Ambos países tienen un proceso. Guarda pruebas como recibos y estados de cuenta.")),
      choice(
        "fix_errors",
        T("You see a late payment you know you paid on time. What's the best next step?", "Ves un pago tarde que sabes que hiciste a tiempo. ¿Cuál es el mejor siguiente paso?"),
        [T("Dispute it in writing with proof, with the bureau and the lender", "Disputarlo por escrito con pruebas, con el buró y con el prestamista"), T("Ignore it", "Ignorarlo"), T("Pay a company to \"erase\" it", "Pagar a una empresa para \"borrarlo\"")],
        0,
        T("A written dispute with proof starts the official process.", "Una disputa por escrito con pruebas inicia el proceso oficial."),
        [null, T("An error left alone can follow you for years.", "Un error que no corriges puede seguirte por años."), T("Credit repair companies can't remove accurate information, and many charge a lot. Disputing is free.", "Las empresas de reparación de crédito no pueden quitar información correcta y muchas cobran mucho. Disputar es gratis.")]
      )
    ),
    concept(
      "two_histories",
      T("Two countries, two histories", "Dos países, dos historiales"),
      card(
        T("They don't share", "No se comparten"),
        T("US bureaus and Mexican bureaus keep separate files. Paying on time in one country doesn't build credit in the other. If you live between both, you may need to build, and check, both.", "Los burós de EE. UU. y los de México llevan expedientes separados. Pagar a tiempo en un país no construye crédito en el otro. Si vives entre los dos, quizá necesites construir y revisar ambos.")
      ),
      tf("two_histories", T("A good score in the US counts automatically at a Mexican bank.", "Un buen puntaje en EE. UU. cuenta automáticamente en un banco mexicano."), false, T("Files aren't shared across the border, so each side builds its own.", "Los expedientes no se comparten entre países, así que cada lado construye el suyo.")),
      choice(
        "two_histories",
        T("You pay everything on time in the US but plan to rent in Mexico. What helps there?", "Pagas todo a tiempo en EE. UU. pero piensas rentar en México. ¿Qué te ayuda allá?"),
        [T("Building a record with a Mexican account or card, and keeping proof of your income", "Construir un historial con una cuenta o tarjeta mexicana y guardar pruebas de tus ingresos"), T("Expecting the US score to be used", "Esperar que se use el puntaje de EE. UU."), T("Skipping credit altogether", "Evitar el crédito por completo")],
        0,
        T("A local record, and proof of income, are what local landlords and lenders can use.", "Un historial local y pruebas de ingresos son lo que pueden usar los arrendadores y prestamistas locales."),
        [null, T("They usually can't see your US file.", "Normalmente no pueden ver tu expediente de EE. UU."), T("Without any record, it's harder to be approved.", "Sin ningún historial es más difícil que te aprueben.")]
      )
    ),
  ],
  lessons: [
    {
      id: "score-1",
      title: T("What a credit report is", "Qué es un reporte de crédito"),
      life: T("Ask a family member whether they've ever looked at their credit report, and what they found.", "Pregunta a alguien de tu familia si alguna vez ha visto su reporte de crédito y qué encontró."),
      steps: [
        card(T("A record, not a grade", "Un registro, no una calificación"), T("A credit report is a record: which credit accounts you have, how much you owe, whether you paid on time, and who has asked to see it. It's kept by credit bureaus.", "Un reporte de crédito es un registro: qué cuentas de crédito tienes, cuánto debes, si pagaste a tiempo y quién pidió verlo. Lo llevan los burós de crédito.")),
        match(
          "credit_report",
          T("Match each part of a report to what it shows.", "Une cada parte del reporte con lo que muestra."),
          [
            [T("Accounts", "Cuentas"), T("The credit you have or had", "El crédito que tienes o tuviste")],
            [T("Payment history", "Historial de pagos"), T("Whether you paid on time", "Si pagaste a tiempo")],
            [T("Inquiries", "Consultas"), T("Who looked at your report", "Quién vio tu reporte")],
          ],
          T("These three parts tell the story lenders read.", "Estas tres partes cuentan la historia que leen los prestamistas.")
        ),
        scenario(
          "credit_report",
          T("A friend says, \"My credit report shows my salary, so lenders know I earn enough.\" What's true?", "Un amigo dice: \"Mi reporte de crédito muestra mi sueldo, así que los prestamistas saben que gano lo suficiente\". ¿Qué es cierto?"),
          [
            fit(T("Reports show credit history. Income is asked for separately", "Los reportes muestran el historial de crédito. El ingreso se pide aparte"), "good", T("Lenders look at both, but from different sources.", "Los prestamistas ven ambos, pero de fuentes distintas.")),
            fit(T("Reports show your income and savings", "Los reportes muestran tu ingreso y ahorros"), "poor", T("They don't. Income and savings aren't on a report.", "No. El ingreso y los ahorros no aparecen en un reporte.")),
            fit(T("Reports show only your score", "Los reportes solo muestran tu puntaje"), "ok", T("A score is a summary. The report holds the details.", "Un puntaje es un resumen. El reporte tiene los detalles.")),
          ],
          T("A report is your credit history, nothing more and nothing less.", "Un reporte es tu historial de crédito, ni más ni menos.")
        ),
        tf("credit_report", T("If you've never used credit, you may not have a credit report at all.", "Si nunca has usado crédito, quizá no tengas ningún reporte de crédito."), true, T("That's called having no credit history. It's a starting point, not a bad mark.", "Eso se llama no tener historial de crédito. Es un punto de partida, no una mala nota.")),
        card(T("Who sees it", "Quién lo ve"), T("Lenders, and sometimes landlords, employers or phone companies, can ask to see it, usually with your permission. You can see yours, too.", "Los prestamistas, y a veces arrendadores, empleadores o compañías de teléfono, pueden pedir verlo, normalmente con tu permiso. Tú también puedes ver el tuyo.")),
        act("goals.debt", T("See how a balance and a payment shape what you owe over time.", "Mira cómo un saldo y un pago moldean lo que debes con el tiempo.")),
      ],
    },
    {
      id: "score-2",
      title: T("Where your score comes from", "De dónde sale tu puntaje"),
      life: T("Pick one habit from this lesson, like paying on the due date, and do it this month.", "Elige un hábito de esta lección, como pagar en la fecha límite, y hazlo este mes."),
      steps: [
        card(T("Mostly: pay on time", "Sobre todo: pagar a tiempo"), T("Scores weigh how reliably you pay, how much of your limits you use, how long you've had credit, and how often you apply for new credit. Paying on time and using little of your limit help most.", "Los puntajes pesan qué tan puntual pagas, cuánto usas de tus límites, cuánto tiempo llevas con crédito y qué tan seguido pides crédito nuevo. Pagar a tiempo y usar poco de tu límite ayuda más.")),
        order(
          "score_factors",
          T("Put these in order, from biggest effect to smallest.", "Pon esto en orden, del mayor efecto al menor."),
          [T("Paying on time", "Pagar a tiempo"), T("How much you owe against your limits", "Cuánto debes frente a tus límites"), T("How long you've had credit", "Cuánto tiempo llevas con crédito")],
          T("Payment history counts most, then how much you owe, then the length of your history.", "El historial de pagos pesa más, luego cuánto debes y luego la antigüedad de tu historial.")
        ),
        number(
          "score_factors",
          T("A card has a limit of {$1000|15000}, and you owe {$300|4500}. What percent of your limit are you using?", "Una tarjeta tiene un límite de {$1000|15000} y debes {$300|4500}. ¿Qué porcentaje de tu límite usas?"),
          { unit: "percent", answer: 30, tol: 0.5 },
          [T("Balance ÷ limit.", "Saldo ÷ límite."), T("300 ÷ 1000 = 0.30, which is 30%.", "300 ÷ 1000 = 0.30, o sea 30%.")]
        ),
        tf("score_factors", T("Using most of your credit limit can lower your score, even if you pay on time.", "Usar casi todo tu límite de crédito puede bajar tu puntaje, aunque pagues a tiempo."), true, T("Using a lot of your limit looks risky. Many people keep it well below the limit.", "Usar mucho de tu límite se ve riesgoso. Mucha gente lo mantiene muy por debajo del límite.")),
        card(T("A score is a snapshot", "Un puntaje es una foto"), T("Your score changes as your report changes. It's not a grade for you as a person, and lenders use their own versions. What counts is the habit behind it.", "Tu puntaje cambia al cambiar tu reporte. No es una calificación de ti como persona y cada prestamista usa su propia versión. Lo que cuenta es el hábito detrás.")),
        act("goals.debt", T("Try a payment and see how it changes what you owe.", "Prueba un pago y mira cómo cambia lo que debes.")),
      ],
    },
    {
      id: "score-3",
      title: T("Getting your free report and checking it", "Pedir tu reporte gratuito y revisarlo"),
      life: T("Get your free report from the official source this month, and check each account is yours.", "Pide este mes tu reporte gratuito en la fuente oficial y revisa que cada cuenta sea tuya."),
      steps: [
        card(T("Official only", "Solo oficial"), T("Use only the official source for your free report. In the US that's annualcreditreport.com; in Mexico, each bureau's own site. A real free report never needs a card number.", "Usa solo la fuente oficial para tu reporte gratuito. En EE. UU. es annualcreditreport.com; en México, el sitio de cada buró. Un reporte gratuito real nunca necesita un número de tarjeta."), ),
        order(
          "free_report",
          T("Put the steps in order to check your report.", "Pon los pasos en orden para revisar tu reporte."),
          [T("Go to the official site", "Ir al sitio oficial"), T("Prove who you are", "Comprobar quién eres"), T("Read each account and each payment", "Leer cada cuenta y cada pago"), T("Note anything that isn't right", "Anotar lo que no esté bien")],
          T("Start at the official source, prove your identity, then read the report line by line.", "Empieza en la fuente oficial, comprueba tu identidad y luego lee el reporte línea por línea.")
        ),
        scenario(
          "free_report",
          T("An ad says \"See your FREE credit score\" and asks for your Social Security or CURP number before showing anything. What do you do?", "Un anuncio dice \"Ve tu puntaje de crédito GRATIS\" y pide tu número de Seguro Social o CURP antes de mostrar nada. ¿Qué haces?"),
          [
            fit(T("Skip it and use the official site", "Ignorarlo y usar el sitio oficial"), "good", T("The official source is free, and you don't hand your number to unknown sites.", "La fuente oficial es gratuita y no le das tu número a sitios desconocidos.")),
            fit(T("Enter the number, it's a big company", "Poner el número, es una empresa grande"), "poor", T("Look-alike sites copy big names to steal identities.", "Los sitios imitadores copian nombres grandes para robar identidades.")),
            fit(T("Enter fake numbers to try it", "Poner números falsos para probar"), "ok", T("Safer, but pointless. The official site doesn't need tricks.", "Más seguro, pero inútil. El sitio oficial no necesita trucos.")),
          ],
          T("Only the official source, and never your number to an ad.", "Solo la fuente oficial, y nunca tu número a un anuncio.")
        ),
        tf("free_report", T("It's smart to look at your report once in a while, even if you don't plan to borrow.", "Es inteligente ver tu reporte de vez en cuando, aunque no pienses pedir prestado."), true, T("Mistakes and identity theft show up there first.", "Los errores y el robo de identidad aparecen primero ahí.")),
        card(T("What to look for", "Qué buscar"), T("Accounts you don't recognize, late payments you made on time, wrong balances, and addresses that aren't yours. Any of these can mean a mistake or identity theft.", "Cuentas que no reconoces, pagos tarde que hiciste a tiempo, saldos incorrectos y domicilios que no son tuyos. Cualquiera puede significar un error o un robo de identidad.")),
        act("goals.scam", T("Look at a \"free credit score\" ad and find what gives it away.", "Mira un anuncio de \"puntaje gratis\" y encuentra qué lo delata.")),
      ],
    },
    {
      id: "score-4",
      title: T("Fixing errors and rebuilding", "Corregir errores y reconstruir"),
      life: T("If you find an error, write down what's wrong and what proof you have, before you contact anyone.", "Si encuentras un error, anota qué está mal y qué pruebas tienes, antes de contactar a nadie."),
      steps: [
        card(T("Dispute in writing", "Disputa por escrito"), T("To fix an error, tell the bureau and the lender what's wrong, in writing, with proof. They have to investigate. Free to do yourself.", "Para corregir un error, dile al buró y al prestamista qué está mal, por escrito y con pruebas. Tienen que investigarlo. Es gratis hacerlo tú mismo.")),
        order(
          "fix_errors",
          T("Put the steps in order to dispute an error.", "Pon los pasos en orden para disputar un error."),
          [T("Find the error on your report", "Encontrar el error en tu reporte"), T("Gather proof (statements, receipts)", "Reunir pruebas (estados de cuenta, recibos)"), T("Write to the bureau and the lender", "Escribir al buró y al prestamista"), T("Check the result and keep copies", "Revisar el resultado y guardar copias")],
          T("Proof first, then the letter, then follow-up.", "Primero las pruebas, luego la carta y luego el seguimiento.")
        ),
        scenario(
          "fix_errors",
          T("An ad promises to \"erase bad credit\" for {$500|7500}. What do you do?", "Un anuncio promete \"borrar el mal historial\" por {$500|7500}. ¿Qué haces?"),
          [
            fit(T("Skip it. Dispute errors yourself, for free", "Ignorarlo. Disputar los errores tú mismo, gratis"), "good", T("Accurate negative items can't be removed by anyone. Errors can be disputed for free.", "Nadie puede quitar datos negativos correctos. Los errores se disputan gratis.")),
            fit(T("Pay and hope", "Pagar y esperar"), "poor", T("Many of these promises are scams.", "Muchas de estas promesas son estafas.")),
            fit(T("Pay half to test it", "Pagar la mitad para probar"), "poor", T("Half is still a loss if it's false.", "La mitad sigue siendo una pérdida si es falso.")),
          ],
          T("You can do everything these companies do, for free.", "Puedes hacer todo lo que hacen esas empresas, gratis.")
        ),
        tf("fix_errors", T("Paying off a debt on time from now on helps rebuild your record over time.", "Pagar a tiempo una deuda de ahora en adelante ayuda a reconstruir tu historial con el tiempo."), true, T("Time and on-time payments are the real repair. There are no shortcuts.", "El tiempo y los pagos puntuales son la verdadera reparación. No hay atajos.")),
        card(T("Rebuilding is slow and steady", "Reconstruir es lento y constante"), T("Pay on time, use little of your limits and avoid opening many accounts at once. A secured or starter card can help. It takes months, and it works.", "Paga a tiempo, usa poco de tus límites y evita abrir muchas cuentas a la vez. Una tarjeta garantizada o de inicio puede ayudar. Toma meses, y funciona.")),
        act("goals.debt", T("Try paying a little extra and see how much sooner you're done.", "Prueba pagar un poco más y mira cuánto antes terminas.")),
      ],
    },
    {
      id: "score-5",
      title: T("Two countries, two histories", "Dos países, dos historiales"),
      life: T("If you move between countries, list the credit proof you'd bring: statements, a letter from your bank, proof of income.", "Si te mueves entre países, haz la lista de pruebas de crédito que llevarías: estados de cuenta, una carta de tu banco, comprobantes de ingresos."),
      steps: [
        card(T("Starting over, on purpose", "Empezar de nuevo, a propósito"), T("US and Mexican bureaus don't share files. Moving means building a new record, but you can bring proof: bank letters, statements and proof of income. Some lenders look at them.", "Los burós de EE. UU. y de México no comparten expedientes. Mudarte significa construir un historial nuevo, pero puedes llevar pruebas: cartas del banco, estados de cuenta y comprobantes de ingresos. Algunos prestamistas los consideran.")),
        match(
          "two_histories",
          T("Match each item to how it helps in a new country.", "Une cada cosa con cómo ayuda en un país nuevo."),
          [
            [T("Local bank account", "Cuenta de banco local"), T("Starts a local relationship and record", "Empieza una relación y un historial locales")],
            [T("Proof of income", "Comprobante de ingresos"), T("Shows you can pay", "Muestra que puedes pagar")],
            [T("Letters and statements", "Cartas y estados de cuenta"), T("Show your record from the other country", "Muestran tu historial del otro país")],
          ],
          T("None of these replaces a local score, but together they open doors.", "Ninguna reemplaza un puntaje local, pero juntas abren puertas.")
        ),
        scenario(
          "two_histories",
          T("You just moved and want to rent. The landlord asks for credit history you don't have here. What helps?", "Acabas de mudarte y quieres rentar. El arrendador pide historial de crédito que aquí no tienes. ¿Qué ayuda?"),
          [
            fit(T("Offer proof of income, bank statements and a reference", "Ofrecer comprobantes de ingresos, estados de cuenta y una referencia"), "good", T("Landlords often accept other proof of reliability.", "Los arrendadores suelen aceptar otras pruebas de que eres confiable.")),
            fit(T("Say your old score will count", "Decir que tu puntaje anterior contará"), "poor", T("They usually can't see it.", "Normalmente no pueden verlo.")),
            fit(T("Walk away from renting", "Dejar de buscar renta"), "ok", T("Other options exist. Ask what else they'd accept.", "Hay otras opciones. Pregunta qué más aceptarían.")),
          ],
          T("Offer proof you can pay, not a score they can't see.", "Ofrece pruebas de que puedes pagar, no un puntaje que no pueden ver.")
        ),
        tf("two_histories", T("Your credit record in one country is automatically copied to the other.", "Tu historial de crédito en un país se copia automáticamente al otro."), false, T("It isn't. Each country keeps its own.", "No. Cada país guarda el suyo.")),
        card(T("Check both sides", "Revisa ambos lados"), T("If you live in both, look at your report in both countries now and then. Each one can have mistakes, and each one matters where you use it.", "Si vives en los dos, mira tu reporte en ambos países de vez en cuando. Cada uno puede tener errores y cada uno importa donde lo usas.")),
        act("goals.debt", T("Plan how you'd pay down a balance while you build a new record.", "Planea cómo pagarías un saldo mientras construyes un historial nuevo.")),
      ],
    },
  ],
};
