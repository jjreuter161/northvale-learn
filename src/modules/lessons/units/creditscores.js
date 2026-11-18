// UNIT — Credit scores and reports (Wave 1, Credit and Debt, Build; Both).
// DRAFT: not in the app until a reviewer signs it off. To ship it, follow the steps at the top of
// sending.js. T(en, es, { en, es }) is the Mexico version; amounts use {$US|MX}.
// Mission to add then (adult: true, 18+; a teen version would be to read with a parent): "Request a
// free credit report from the official source (just reading what you get)". Reflection: "What
// surprised you?" Never ask for numbers from the report.
// Mexico's score ranges differ by bureau and have changed, so the unit gives no Mexican range.
// Bureaus are named as what they are. People and amounts are made up.
import { T, card, choice, tf, act, concept, order, match, number, scenario, fit } from "./helpers.js";

export default {
  id: "creditscores",
  icon: "chart",
  draft: true,
  title: T("Credit scores and reports", "Historial y puntaje de crédito"),
  sources: [
    // "Read" = the page was opened. "Seen" = a search summary of the page; a reviewer opens each.
    { name: "FTC, \"Disputing errors on your credit reports\" (read): dispute with the bureau and the business; the bureau has 30 days; results in writing; a statement of the dispute", url: "https://consumer.ftc.gov/articles/disputing-errors-your-credit-reports", checked: "2026-11-17" },
    { name: "CFPB, \"How to rebuild your credit\" (read): on-time payments, keeping balances low, secured cards; debit, cash and prepaid don't show you can repay", url: "https://www.consumerfinance.gov/consumer-tools/credit-reports-and-scores/how-to-rebuild-your-credit/", checked: "2026-11-17" },
    { name: "FTC, free weekly credit reports are permanent; AnnualCreditReport.com is the only authorized site (seen)", url: "https://consumer.ftc.gov/consumer-alerts/2023/10/you-now-have-permanent-access-free-weekly-credit-reports", checked: "2026-11-17" },
    { name: "CFPB, \"How long does information stay on my credit report?\" (seen): most negative items 7 years; bankruptcy 10; accurate information can't be removed early", url: "https://www.consumerfinance.gov/ask-cfpb/how-long-does-information-stay-on-my-credit-report-en-323/", checked: "2026-11-17" },
    { name: "CONDUSEF, \"No es una lista negra\" (seen): everyone with credit is in the Buró; record periods by debt size; no one can erase accurate records early", url: "https://www.gob.mx/condusef/articulos/no-es-una-lista-negra", checked: "2026-11-17" },
    { name: "Buró de Crédito, Reporte de Crédito Especial (seen): free if it's the first request in 12 months and delivered by email or picked up", url: "https://www.burodecredito.com.mx/personas-f%C3%ADsicas/productos/reporte-de-cr%C3%A9dito-especial/", checked: "2026-11-17" },
  ],
  concepts: [
    concept(
      "credit_report",
      T("A credit report", "Un reporte de crédito"),
      card(
        T("A record of how you borrow", "Un registro de cómo pides prestado"),
        T(
          "A credit report lists your credit accounts, your balances and whether you paid on time. It doesn't show your bank balance or your income. Lenders, landlords and some employers can ask to see it.",
          "Un reporte de crédito lista tus cuentas de crédito, tus saldos y si pagaste a tiempo. No muestra el saldo de tu banco ni tus ingresos. Prestamistas, arrendadores y algunos empleadores pueden pedir verlo."
        )
      ),
      tf("credit_report", T("A credit report shows how much money is in your bank account.", "Un reporte de crédito muestra cuánto dinero hay en tu cuenta de banco."), false, T("It shows borrowing and payment history, not your bank balance.", "Muestra créditos e historial de pagos, no el saldo de tu banco.")),
      choice(
        "credit_report",
        T("Which of these appears on a credit report?", "¿Cuál de estas cosas aparece en un reporte de crédito?"),
        [T("A credit card's limit, balance and payment history", "El límite, el saldo y el historial de pagos de una tarjeta de crédito"), T("Your monthly income", "Tu ingreso mensual"), T("Your savings balance", "El saldo de tus ahorros")],
        0,
        T("Reports track credit accounts and how you paid them.", "Los reportes siguen las cuentas de crédito y cómo las pagaste."),
        [null, T("Income isn't on a credit report.", "El ingreso no está en un reporte de crédito."), T("Savings aren't on a credit report.", "Los ahorros no están en un reporte de crédito.")]
      )
    ),
    concept(
      "score_factors",
      T("What moves a score", "Qué mueve un puntaje"),
      card(
        T("Habits, not tricks", "Hábitos, no trucos"),
        T(
          "A score turns the report into one number. Paying on time counts most, and using a small share of your limits helps. Each bureau and lender uses its own formula, so the same person can have different scores.",
          "Un puntaje convierte el reporte en un solo número. Pagar a tiempo es lo que más cuenta, y usar una parte pequeña de tus límites ayuda. Cada buró y cada prestamista usa su propia fórmula, así que una misma persona puede tener puntajes distintos."
        )
      ),
      tf("score_factors", T("Everyone has one single credit score.", "Todos tienen un solo puntaje de crédito."), false, T("Different bureaus and lenders use different formulas, so scores can differ.", "Distintos burós y prestamistas usan fórmulas distintas, así que los puntajes pueden diferir.")),
      choice(
        "score_factors",
        T("Two people have the same income. One pays on time and uses 10% of her limits; one pays late and uses 95%. Whose score is likely higher?", "Dos personas ganan lo mismo. Una paga a tiempo y usa el 10% de sus límites; otra paga tarde y usa el 95%. ¿Quién probablemente tiene mejor puntaje?"),
        [T("The one who pays on time and uses less", "La que paga a tiempo y usa menos"), T("The one who uses more of her limits", "La que usa más de sus límites"), T("They'd be the same", "Serían iguales")],
        0,
        T("On-time payments and low use are the two big habits.", "Pagar a tiempo y usar poco son los dos grandes hábitos."),
        [null, T("Using nearly all your limits tends to lower a score.", "Usar casi todos tus límites tiende a bajar el puntaje."), T("Habits differ, so the scores would differ.", "Los hábitos son distintos, así que los puntajes también.")]
      )
    ),
    concept(
      "check_report",
      T("Checking your own report", "Revisar tu propio reporte"),
      card(
        T("Go to the official source", "Ve a la fuente oficial"),
        T(
          "You have a right to see your report free from the official source. Fake sites copy the name and ask for a card number. Type the official address yourself, and read the report line by line for anything you don't recognize.",
          "Tienes derecho a ver tu reporte gratis en la fuente oficial. Los sitios falsos copian el nombre y piden un número de tarjeta. Escribe tú la dirección oficial y lee el reporte renglón por renglón buscando lo que no reconoces."
        )
      ),
      tf("check_report", T("A site that offers your free report should ask for your card number.", "Un sitio que ofrece tu reporte gratis debe pedirte el número de tu tarjeta."), false, T("A real free report doesn't need a card. A card request is a warning sign.", "Un reporte gratis de verdad no necesita tarjeta. Pedirla es una señal de alerta.")),
      choice(
        "check_report",
        T("What do you look for first when you read your report?", "¿Qué buscas primero al leer tu reporte?"),
        [T("Accounts or addresses you don't recognize", "Cuentas o domicilios que no reconoces"), T("Only your score", "Solo tu puntaje"), T("The bureau's logo", "El logotipo del buró")],
        0,
        T("An account you didn't open can be a mistake or a sign of identity theft.", "Una cuenta que no abriste puede ser un error o una señal de robo de identidad."),
        [null, T("The score comes from the report, so the report is where mistakes live.", "El puntaje sale del reporte, así que los errores están en el reporte."), T("A logo says nothing about whether the data is right.", "Un logotipo no dice si los datos son correctos.")]
      )
    ),
    concept(
      "fix_errors",
      T("Fixing errors and rebuilding", "Corregir errores y reconstruir"),
      card(
        T("Dispute errors, not facts", "Disputa errores, no hechos"),
        T(
          "A wrong item can be disputed with the bureau and with the business that reported it. Accurate negative items can't be erased early. They fade with time as new, on-time payments build a better record.",
          "Un dato equivocado se puede disputar con el buró y con la empresa que lo reportó. Los datos negativos correctos no se borran antes de tiempo. Se van diluyendo mientras nuevos pagos puntuales construyen un mejor historial."
        )
      ),
      tf("fix_errors", T("A company can legally erase accurate negative information for a fee.", "Una empresa puede borrar legalmente información negativa correcta a cambio de dinero."), false, T("Accurate negative information stays for its legal time. Errors are what get fixed.", "La información negativa correcta se queda su tiempo legal. Lo que se corrige son los errores.")),
      choice(
        "fix_errors",
        T("A late payment on your report is a mistake. What's the right way to fix it?", "Un pago tardío en tu reporte es un error. ¿Cuál es la forma correcta de corregirlo?"),
        [T("Dispute it, with proof, with the bureau and the business", "Disputarlo, con pruebas, ante el buró y la empresa"), T("Pay a company that promises to erase it", "Pagarle a una empresa que promete borrarlo"), T("Ignore it and hope it expires", "Ignorarlo y esperar que caduque")],
        0,
        T("Both the bureau and the business must correct information that's wrong.", "Tanto el buró como la empresa deben corregir la información equivocada."),
        [null, T("Companies that promise to erase records are a common scam.", "Las empresas que prometen borrar registros son una estafa común."), T("A mistake can sit there for years if you don't dispute it.", "Un error puede quedarse años si no lo disputas.")]
      )
    ),
    concept(
      "two_histories",
      T("Two countries, two histories", "Dos países, dos historiales"),
      card(
        T("Files that don't connect", "Expedientes que no se conectan"),
        T(
          "The US and Mexico each keep their own credit files, with their own bureaus and rules. A record in one country usually isn't visible in the other, so someone who moves starts a new history.",
          "EE. UU. y México llevan sus propios expedientes de crédito, con sus propios burós y reglas. Un historial en un país por lo general no se ve en el otro, así que quien se muda empieza un historial nuevo."
        )
      ),
      tf("two_histories", T("A good credit record in one country counts automatically in the other.", "Un buen historial de crédito en un país cuenta automáticamente en el otro."), false, T("Each country's bureaus keep their own files.", "Los burós de cada país llevan sus propios expedientes.")),
      choice(
        "two_histories",
        T("After moving countries, which helps build a new history?", "Después de mudarte de país, ¿qué ayuda a construir un historial nuevo?"),
        [T("An account that reports payments, used lightly and paid on time", "Una cuenta que reporte pagos, usada poco y pagada a tiempo"), T("Waiting several years", "Esperar varios años"), T("Applying for many cards at once", "Pedir muchas tarjetas a la vez")],
        0,
        T("A history only starts when payments are reported.", "Un historial solo empieza cuando se reportan los pagos."),
        [null, T("Waiting builds nothing, since there's nothing to report.", "Esperar no construye nada, pues no hay nada que reportar."), T("Many applications at once can hurt and may be turned down.", "Muchas solicitudes a la vez pueden perjudicar y pueden rechazarte.")]
      )
    )
  ],
  lessons: [
    {
      id: "creditscores-1",
      title: T("What a credit report is", "Qué es un reporte de crédito"),
      life: T("Name one place that keeps a record of how you pay, and one thing that isn't in it.", "Nombra un lugar que guarda un registro de cómo pagas y algo que no está en él."),
      steps: [
        card(
          T("Why he needs a deposit", "Por qué le piden un depósito"),
          T(
            "Ben applies for a phone plan and is asked for a {$100|1800} deposit. His friend, with the same job, isn't. The company looked at a record of how each of them has paid bills and loans. What is that record, and who keeps it?",
            "Ben pide un plan de celular y le piden un depósito de {$100|1800}. A su amigo, con el mismo trabajo, no. La empresa miró un registro de cómo ha pagado cada uno sus cuentas y préstamos. ¿Qué es ese registro y quién lo guarda?",
            { en: "Ana applies for a phone plan and is asked for a {$100|1800} deposit. Her friend, with the same job, isn't. The company looked at a record of how each of them has paid bills and loans. What is that record, and who keeps it?", es: "Ana pide un plan de celular y le piden un depósito de {$100|1800}. A su amiga, con el mismo trabajo, no. La empresa miró un registro de cómo ha pagado cada una sus cuentas y préstamos. ¿Qué es ese registro y quién lo guarda?" }
          )
        ),
        choice(
          "credit_report",
          T("What does a credit report show?", "¿Qué muestra un reporte de crédito?"),
          [T("How you've handled borrowing: accounts, balances and payments", "Cómo has manejado el crédito: cuentas, saldos y pagos"), T("Your bank balance and your income", "El saldo de tu banco y tu ingreso"), T("Everything you've ever bought", "Todo lo que has comprado")],
          0,
          T("A credit report is a record of borrowing and paying, which is what lenders want to know.", "Un reporte de crédito es un registro de créditos y pagos, que es lo que quieren saber los prestamistas."),
          [null, T("Bank balances and income aren't on it.", "Los saldos del banco y el ingreso no aparecen en él."), T("It tracks credit accounts, not every purchase.", "Sigue cuentas de crédito, no todas tus compras.")]
        ),
        card(
          T("Report, score and bureau", "Reporte, puntaje y buró"),
          T(
            "Three nationwide companies, Equifax, Experian and TransUnion, keep reports in the US. A score is a number calculated from a report. Most accurate negative items can be reported for {@usNegativeYears} years, and a bankruptcy for {@usBankruptcyYears}.",
            "Tres empresas nacionales, Equifax, Experian y TransUnion, guardan reportes en EE. UU. Un puntaje es un número calculado a partir de un reporte. La mayoría de los datos negativos correctos se pueden reportar {@usNegativeYears} años, y una bancarrota {@usBankruptcyYears}.",
            { en: "In Mexico, two bureaus, Buró de Crédito and Círculo de Crédito, keep the records. Being in the Buró isn't bad: everyone who has credit is there. Negative records stay from one year up to {@mxBuroMaxYears}, depending on the size of the debt.", es: "En México, dos burós, Buró de Crédito y Círculo de Crédito, guardan los registros. Estar en el Buró no es malo: ahí está todo el que tiene crédito. Los registros negativos se quedan de uno hasta {@mxBuroMaxYears} años, según el tamaño de la deuda." }
          )
        ),
        match(
          "credit_report",
          T("Match each word to what it means.", "Une cada palabra con lo que significa."),
          [
            [T("Credit report", "Reporte de crédito"), T("The record of your accounts and payments", "El registro de tus cuentas y pagos")],
            [T("Credit score", "Puntaje de crédito"), T("A number calculated from the report", "Un número calculado a partir del reporte")],
            [T("Credit bureau", "Buró de crédito"), T("A company that collects and keeps reports", "Una empresa que reúne y guarda reportes")]
          ],
          T("The bureau keeps the report, and the score comes from it.", "El buró guarda el reporte, y el puntaje sale de él.")
        ),
        tf("credit_report", T("A credit report shows how much money is in your bank account.", "Un reporte de crédito muestra cuánto dinero hay en tu cuenta de banco."), false, T("It shows borrowing and payment history, not your bank balance.", "Muestra créditos e historial de pagos, no el saldo de tu banco.")),
        act("goals.debt", T("See how a credit card balance and payments change over time.", "Mira cómo cambian con el tiempo el saldo y los pagos de una tarjeta."), { balance: [1000, 15000], apr: 24, payment: [50, 750] })
      ]
    },
    {
      id: "creditscores-2",
      title: T("Where your score comes from", "De dónde sale tu puntaje"),
      life: T("Look at your credit card limit and balance and say what share of the limit you use.", "Mira el límite y el saldo de tu tarjeta de crédito y di qué parte del límite usas."),
      steps: [
        card(
          T("Same pay, two habits", "Mismo sueldo, dos hábitos"),
          T(
            "Dana and Chris earn the same. Dana pays every bill on time and uses a small part of her card limit. Chris pays late twice and uses nearly all of his. A lender reads both reports. Whose score will likely be higher?",
            "Dana y Chris ganan lo mismo. Dana paga todo a tiempo y usa una parte pequeña del límite de su tarjeta. Chris paga tarde dos veces y usa casi todo su límite. Un prestamista lee los dos reportes. ¿Quién probablemente tendrá mejor puntaje?"
          )
        ),
        choice(
          "score_factors",
          T("What is the biggest single part of most scores?", "¿Cuál es la parte más grande de la mayoría de los puntajes?"),
          [T("Paying on time", "Pagar a tiempo"), T("How much you earn", "Cuánto ganas"), T("How many cards you carry", "Cuántas tarjetas traes")],
          0,
          T("Payment history carries the most weight in the common FICO formula.", "El historial de pagos pesa más en la fórmula FICO común."),
          [null, T("Income isn't part of the score.", "El ingreso no es parte del puntaje."), T("The number of cards matters far less than how you pay.", "El número de tarjetas importa mucho menos que cómo pagas.")]
        ),
        card(
          T("What goes into it", "Qué entra"),
          T(
            "FICO scores run {@ficoRange} and weigh {@ficoFactors}. How much of your limit you use matters too: some experts suggest staying under 30%, others under 10%.",
            "Los puntajes FICO van de {@ficoRange} y consideran {@ficoFactors}. También importa qué parte de tu límite usas: algunos expertos sugieren menos de 30%, otros menos de 10%.",
            { en: "Each Mexican bureau has its own score on its own scale, and lenders add things like income. Buró's \"Mi Score\" estimates the chance of a payment 90 days late within 12 months. Paying on time and not using your whole limit helps everywhere.", es: "Cada buró en México tiene su propio puntaje en su propia escala, y los prestamistas suman cosas como el ingreso. El \"Mi Score\" del Buró estima la probabilidad de un atraso de 90 días en 12 meses. Pagar a tiempo y no usar todo tu límite ayuda en todos lados." }
          )
        ),
        number(
          "score_factors",
          T("Dana's limit is {$2000|20000} and her balance is {$400|4000}. What percent of her limit is she using?", "El límite de Dana es de {$2000|20000} y su saldo es de {$400|4000}. ¿Qué porcentaje de su límite usa?"),
          { unit: "percent", answer: 20, tol: 0.5 },
          [T("Balance ÷ limit: 400 ÷ 2000 = 0.2.", "Saldo ÷ límite: 400 ÷ 2000 = 0.2."), T("0.2 is 20%.", "0.2 es 20%.")]
        ),
        tf("score_factors", T("Checking your own credit report lowers your score.", "Revisar tu propio reporte de crédito baja tu puntaje."), false, T("Looking at your own report doesn't hurt a score.", "Ver tu propio reporte no daña un puntaje.")),
        act("goals.debt", T("Compare paying the minimum vs. paying double on a card balance.", "Compara pagar el mínimo vs. pagar el doble en el saldo de una tarjeta."), { balance: [800, 12000], apr: 24, payment: [25, 400], compareDouble: true })
      ]
    },
    {
      id: "creditscores-3",
      title: T("Getting your free report and checking it", "Conseguir tu reporte gratis y revisarlo"),
      life: T("Write the official address for your free report, and one thing you'd look for when you read it.", "Anota la dirección oficial de tu reporte gratis y algo que buscarías al leerlo."),
      steps: [
        card(
          T("Free, but only here", "Gratis, pero solo aquí"),
          T(
            "Marta wants to see her credit report. A site says \"your free report\" and asks for her card number. By law, the official free place is AnnualCreditReport.com, run by the three bureaus, and you can get a report from each {@usFreeReportFrequency}. How does Marta tell the real one from a lookalike?",
            "Marta quiere ver su reporte de crédito. Un sitio dice \"tu reporte gratis\" y le pide el número de su tarjeta. Por ley, el lugar oficial y gratis es AnnualCreditReport.com, operado por los tres burós, y puedes sacar un reporte de cada uno {@usFreeReportFrequency}. ¿Cómo distingue Marta el real de una copia?",
            { en: "Mateo wants to see his credit record. A site says \"your free report\" and asks for his card number. The official place is the bureau's own site, where the Reporte de Crédito Especial is free once every {@buroFreeReportMonths} months by email or at the office. How does Mateo tell the real one from a lookalike?", es: "Mateo quiere ver su historial de crédito. Un sitio dice \"tu reporte gratis\" y le pide el número de su tarjeta. El lugar oficial es el sitio del propio buró, donde el Reporte de Crédito Especial es gratis una vez cada {@buroFreeReportMonths} meses por correo electrónico o en la oficina. ¿Cómo distingue Mateo el real de una copia?" }
          )
        ),
        scenario(
          "check_report",
          T("A site offers \"your free report\" but wants your card number first. What do you do?", "Un sitio ofrece \"tu reporte gratis\" pero primero pide el número de tu tarjeta. ¿Qué haces?"),
          [
            fit(T("Leave, and type the official address yourself", "Te sales y escribes tú la dirección oficial"), "good", T("A real free report doesn't need a card.", "Un reporte gratis de verdad no necesita tarjeta.")),
            fit(T("Enter a card you don't use much", "Pones una tarjeta que casi no usas"), "poor", T("It still hands your card to the wrong site.", "Aun así le entregas tu tarjeta al sitio equivocado.")),
            fit(T("Use it, since it says free", "Lo usas, porque dice gratis"), "poor", T("Lookalike sites charge you after you try.", "Los sitios copia te cobran después de que lo intentas."))
          ],
          T("Go to the official source yourself.", "Ve tú a la fuente oficial.")
        ),
        card(
          T("Reading it line by line", "Leerlo renglón por renglón"),
          T(
            "A report has your details, your accounts, any late payments and a list of who asked to see it. Look for accounts you don't recognize, wrong addresses and payments marked late that weren't. A mistake is easier to fix early.",
            "Un reporte trae tus datos, tus cuentas, los pagos tardíos y una lista de quién pidió verlo. Busca cuentas que no reconoces, domicilios equivocados y pagos marcados como tardíos que no lo fueron. Un error es más fácil de corregir pronto."
          )
        ),
        tf(
          "check_report",
          T("The official free reports are at AnnualCreditReport.com.", "Los reportes gratis oficiales están en AnnualCreditReport.com.", { en: "The Reporte de Crédito Especial is free once every {@buroFreeReportMonths} months from the bureau's own site.", es: "El Reporte de Crédito Especial es gratis una vez cada {@buroFreeReportMonths} meses en el sitio del propio buró." }),
          true,
          T("It's the only site the law authorizes for free reports.", "Es el único sitio que la ley autoriza para reportes gratis.", { en: "The law gives you one free copy in each 12-month period. Request it from the bureau itself, not a lookalike.", es: "La ley te da una copia gratis en cada periodo de 12 meses. Pídela al propio buró, no a una copia." })
        ),
        order(
          "check_report",
          T("Put these steps in order when you read a report.", "Pon estos pasos en orden al leer un reporte."),
          [T("Check your name, address and ID details", "Revisa tu nombre, domicilio y datos de identificación"), T("Look at each account: limit, balance, status", "Mira cada cuenta: límite, saldo, estado"), T("Look for accounts you don't recognize", "Busca cuentas que no reconoces"), T("Check late payments and who asked to see it", "Revisa pagos tardíos y quién pidió verlo")],
          T("Start with who the report is about, then go account by account.", "Empieza por de quién es el reporte y luego ve cuenta por cuenta.")
        ),
        act("goals.scam", T("Tap the red flags in this message.", "Toca las señales de alerta en este mensaje."), { set: "phishing" })
      ]
    },
    {
      id: "creditscores-4",
      title: T("Fixing errors and rebuilding", "Corregir errores y reconstruir"),
      life: T("If you ever find a wrong item on a report, write down what it is and what proof you'd send.", "Si algún día encuentras un dato equivocado en un reporte, anota qué es y qué pruebas enviarías."),
      steps: [
        card(
          T("An account that isn't hers", "Una cuenta que no es suya"),
          T(
            "Sofía finds a late payment on a card she never opened. She feels sure it's a mistake. In the US she can dispute it with the bureau and the business that reported it, and the bureau has {@usCreditDisputeDays} days to investigate. What does she need?",
            "Sofía encuentra un pago tardío de una tarjeta que nunca abrió. Está segura de que es un error. En EE. UU. puede disputarlo ante el buró y ante la empresa que lo reportó, y el buró tiene {@usCreditDisputeDays} días para investigar. ¿Qué necesita?",
            { en: "Sofía finds a late payment on a card she never opened. She feels sure it's a mistake. In Mexico she can file an aclaración with the bureau and with the lender that reported it, and CONDUSEF can guide her if it isn't resolved. What does she need?", es: "Sofía encuentra un pago tardío de una tarjeta que nunca abrió. Está segura de que es un error. En México puede presentar una aclaración ante el buró y ante la institución que lo reportó, y la CONDUSEF puede orientarla si no se resuelve. ¿Qué necesita?" }
          )
        ),
        choice(
          "fix_errors",
          T("What's the right way to fix the error?", "¿Cuál es la forma correcta de corregir el error?"),
          [T("Dispute it in writing, with proof", "Disputarlo por escrito, con pruebas"), T("Pay a company that promises to erase it", "Pagarle a una empresa que promete borrarlo"), T("Ignore it and hope it expires", "Ignorarlo y esperar que caduque")],
          0,
          T("Both the bureau and the business must correct information that's wrong, and proof helps.", "Tanto el buró como la empresa deben corregir la información equivocada, y las pruebas ayudan."),
          [null, T("Erase-it companies are a common scam, and they can't remove accurate records.", "Las empresas que borran registros son una estafa común, y no pueden quitar registros correctos."), T("A mistake can sit there for years.", "Un error se puede quedar años.")]
        ),
        card(
          T("Rebuilding", "Reconstruir"),
          T(
            "Accurate negative items can't be erased early. They fade over {@usNegativeYears} years for most. Rebuilding means new on-time payments, such as a secured card used lightly and paid in full. Debit, cash and prepaid cards don't show you can repay.",
            "Los datos negativos correctos no se borran antes de tiempo. Se desvanecen en {@usNegativeYears} años para la mayoría. Reconstruir significa nuevos pagos puntuales, como una tarjeta garantizada usada poco y pagada completa. El débito, el efectivo y el prepago no muestran que puedes pagar.",
            { en: "No one can erase accurate records early, and sites that promise to clear your history in hours are fraud, says CONDUSEF. Rebuilding means new on-time payments and not using your whole limit. Debit and cash don't show you can repay.", es: "Nadie puede borrar registros correctos antes de tiempo, y los sitios que prometen limpiar tu historial en horas son un fraude, dice la CONDUSEF. Reconstruir significa nuevos pagos puntuales y no usar todo tu límite. El débito y el efectivo no muestran que puedes pagar." }
          )
        ),
        tf("fix_errors", T("A company can legally erase accurate negative information for a fee.", "Una empresa puede borrar legalmente información negativa correcta a cambio de dinero."), false, T("Accurate information stays for its legal time. Only errors get corrected.", "La información correcta se queda su tiempo legal. Solo se corrigen los errores.")),
        number(
          "fix_errors",
          T("A secured card has a {$300|5000} limit. To stay at 30% or less, what's the highest balance?", "Una tarjeta garantizada tiene un límite de {$300|5000}. Para quedar en 30% o menos, ¿cuál es el saldo máximo?"),
          { unit: "money", answer: [90, 1500], tol: 0.5 },
          [T("30% is 0.3.", "30% es 0.3."), T("0.3 × {$300|5000} = {$90|1500}.", "0.3 × {$300|5000} = {$90|1500}.")]
        ),
        act("goals.create", T("Make a goal for a secured card deposit.", "Crea una meta para el depósito de una tarjeta garantizada."), { name: { en: "Secured card deposit", es: "Depósito de tarjeta garantizada" }, target: [300, 5000], months: 6 })
      ]
    },
    {
      id: "creditscores-5",
      title: T("Two countries, two histories", "Dos países, dos historiales"),
      life: T("If you live between two countries, write which bureau keeps your record in each.", "Si vives entre dos países, anota qué buró guarda tu historial en cada uno."),
      steps: [
        card(
          T("Starting over, again", "Empezar de cero otra vez"),
          T(
            "Camila paid every loan on time in Mexico. In Houston, a lender asks for a US history, and she has none. Each country's bureaus keep their own files, so her Mexican record usually isn't visible there. What does she do?",
            "Camila pagó todos sus créditos a tiempo en México. En Houston, un prestamista pide un historial de EE. UU. y ella no tiene. Los burós de cada país llevan sus propios expedientes, así que su historial mexicano por lo general no se ve allá. ¿Qué hace?"
          )
        ),
        match(
          "two_histories",
          T("Match each to the country it fits.", "Une cada uno con el país al que corresponde."),
          [
            [T("Equifax, Experian, TransUnion", "Equifax, Experian, TransUnion"), T("The three nationwide bureaus in the US", "Los tres burós nacionales de EE. UU.")],
            [T("Buró de Crédito and Círculo de Crédito", "Buró de Crédito y Círculo de Crédito"), T("The two main bureaus in Mexico", "Los dos burós principales de México")],
            [T("Free report {@usFreeReportFrequency}", "Reporte gratis {@usFreeReportFrequency}"), T("Available in the US, from each bureau", "Disponible en EE. UU., de cada buró")]
          ],
          T("Each country has its own bureaus and its own rules.", "Cada país tiene sus propios burós y sus propias reglas.")
        ),
        card(
          T("Same idea, different rules", "La misma idea, otras reglas"),
          T(
            "Both systems record how you borrow and pay. They differ in who keeps the files, how often you can get a free copy, and how long old problems last. In Mexico you can get a free copy once every {@buroFreeReportMonths} months from each bureau.",
            "Los dos sistemas registran cómo pides prestado y pagas. Se distinguen en quién guarda los expedientes, cada cuánto puedes sacar una copia gratis y cuánto duran los problemas viejos. En México puedes sacar una copia gratis una vez cada {@buroFreeReportMonths} meses de cada buró."
          )
        ),
        tf("two_histories", T("A good credit record in one country counts automatically in the other.", "Un buen historial de crédito en un país cuenta automáticamente en el otro."), false, T("Each country's bureaus keep their own files.", "Los burós de cada país llevan sus propios expedientes.")),
        scenario(
          "two_histories",
          T("You moved to the US and want a first card. A lender asks for a US history you don't have. What do you do?", "Te mudaste a EE. UU. y quieres una primera tarjeta. Un prestamista pide un historial de EE. UU. que no tienes. ¿Qué haces?"),
          [
            fit(T("Ask about starter or secured cards, and plan to pay on time", "Preguntas por tarjetas de inicio o garantizadas y planeas pagar a tiempo"), "good", T("They're made for people with no history.", "Están hechas para quien no tiene historial.")),
            fit(T("Wait a few years", "Esperas unos años"), "poor", T("A history only starts when payments are reported.", "Un historial solo empieza cuando se reportan los pagos.")),
            fit(T("Apply to many lenders at once", "Solicitas con muchos prestamistas a la vez"), "poor", T("Many requests can hurt, and you may be turned down.", "Muchas solicitudes pueden perjudicar y pueden rechazarte."))
          ],
          T("Start a record that reports on-time payments.", "Empieza un historial que reporte pagos puntuales.")
        ),
        act("goals.create", T("Make a goal for a secured card deposit.", "Crea una meta para el depósito de una tarjeta garantizada."), { name: { en: "Secured card deposit", es: "Depósito de tarjeta garantizada" }, target: [300, 5000], months: 6 })
      ]
    }
  ]
};
