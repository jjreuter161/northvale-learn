// UNIT — Taxes in two countries. Its lessons and the concepts they teach (format in helpers.js).
// Written for life between the US and Mexico: amounts are always dollars or pesos. It explains how the systems relate and where to
// get official or licensed help; it never says what a particular person owes (that depends on their facts).
// MUST be read by a licensed tax professional before it goes live (units/reviews.js, docs/CONTENT-ROADMAP.md).
import { T, card, choice, tf, act, concept, order, number, match, scenario, fit } from "./helpers.js";

export default {
  id: "taxestwo",
  icon: "layers",
  title: T("Taxes in two countries", "Impuestos en dos países"),
  concepts: [
    concept(
      "tax_residence",
      T("Residence and where you owe", "Residencia y dónde debes impuestos"),
      card(
        T("Where you live matters", "Importa dónde vives"),
        T("Countries tax people mostly by residence. A resident is usually taxed on income from anywhere; a non-resident on income from that country. The US also taxes its citizens and green-card holders wherever they live. Which one applies depends on your facts.", "Los países gravan a las personas sobre todo por residencia. Un residente suele pagar por ingresos de cualquier lugar; un no residente, por ingresos de ese país. EE. UU. también grava a sus ciudadanos y titulares de tarjeta de residente donde vivan. Cuál aplica depende de tus hechos.")
      ),
      tf("tax_residence", T("You only owe tax in the country where you are standing today.", "Solo debes impuestos en el país donde estás parado hoy."), false, T("It's about residence and where income comes from, not only where you are today.", "Depende de la residencia y de dónde viene el ingreso, no solo de dónde estás hoy.")),
      choice(
        "tax_residence",
        T("Someone lives in Ciudad Juárez and works in El Paso. What's the wise first step?", "Alguien vive en Ciudad Juárez y trabaja en El Paso. ¿Cuál es el primer paso sensato?"),
        [T("Find out how each country sees their residence and income, and ask a free or licensed tax helper", "Averiguar cómo ve cada país su residencia y su ingreso y preguntar a un ayudante fiscal gratuito o con licencia"), T("Assume only one country matters", "Suponer que solo importa un país"), T("Skip it and hope nobody asks", "No hacer nada y esperar que nadie pregunte")],
        0,
        T("Each country has its own rules, and a helper can apply them to one person's facts.", "Cada país tiene sus reglas y un ayudante puede aplicarlas a los hechos de una persona."),
        [null, T("Both may have a claim, so ignoring one can mean penalties later.", "Ambos pueden tener derecho a cobrar, así que ignorar uno puede significar multas después."), T("Penalties and interest can grow. Asking early costs little.", "Las multas y los intereses pueden crecer. Preguntar temprano cuesta poco.")]
      )
    ),
    concept(
      "foreign_income",
      T("Income from the other country", "Ingresos del otro país"),
      card(
        T("Not twice, if you do it right", "No dos veces, si lo haces bien"),
        T("If both countries could tax the same income, each has ways to reduce paying twice, like a credit for tax already paid abroad, and the two countries have a tax treaty. You usually have to claim them on your return, with records.", "Si los dos países pueden gravar el mismo ingreso, cada uno tiene formas de reducir el pago doble, como un crédito por el impuesto ya pagado en el extranjero, y los dos países tienen un tratado fiscal. Normalmente debes reclamarlos en tu declaración, con registros.")
      ),
      tf("foreign_income", T("A tax already paid in one country is automatically deducted in the other.", "Un impuesto ya pagado en un país se descuenta automáticamente en el otro."), false, T("You usually have to claim the credit on your return, with proof.", "Normalmente debes reclamar el crédito en tu declaración, con pruebas.")),
      choice(
        "foreign_income",
        T("You paid tax on income earned in one country. What helps you avoid paying twice?", "Pagaste impuestos por un ingreso ganado en un país. ¿Qué te ayuda a no pagar dos veces?"),
        [T("Keep the records, and ask a helper about credits and the treaty", "Guardar los registros y preguntar a un ayudante por los créditos y el tratado"), T("Pay again to be safe", "Pagar otra vez por seguridad"), T("Throw away the receipts", "Tirar los recibos")],
        0,
        T("Records plus a question about credits can keep you from paying the same tax twice.", "Los registros y una pregunta sobre créditos pueden evitar que pagues el mismo impuesto dos veces."),
        [null, T("Paying twice isn't safer. It's costly.", "Pagar dos veces no es más seguro. Es caro."), T("Without proof, you may not be able to claim the credit.", "Sin pruebas, quizá no puedas reclamar el crédito.")]
      )
    ),
    concept(
      "gifts_money",
      T("Money from family, and what gets reported", "Dinero de la familia y lo que se reporta"),
      card(
        T("Gifts and income are different", "Regalo e ingreso son distintos"),
        T("Money a family member sends you as a gift is usually not taxed as your income, but large amounts can have reporting rules. Wages, business income and interest are income. Keep a note of who sent what and why.", "El dinero que un familiar te envía como regalo normalmente no se grava como tu ingreso, pero los montos grandes pueden tener reglas de reporte. Los sueldos, el ingreso de un negocio y los intereses sí son ingreso. Guarda una nota de quién envió qué y por qué.")
      ),
      tf("gifts_money", T("Every dollar sent to you is the same, for tax purposes.", "Cada dólar que te envían es igual, para efectos de impuestos."), false, T("A gift, a payment for work and interest are treated differently. Keep a note of why.", "Un regalo, un pago por trabajo y un interés se tratan distinto. Guarda una nota del motivo.")),
      choice(
        "gifts_money",
        T("A relative sends you {US$1500} to help with school. What's a good habit?", "Un pariente te envía {US$1500} para ayudarte con la escuela. ¿Qué hábito es bueno?"),
        [T("Keep the receipt and a note that it was a gift for school", "Guardar el comprobante y una nota de que fue un regalo para la escuela"), T("Hide it", "Esconderlo"), T("Tell everyone it was payment for work", "Decir a todos que fue pago por trabajo")],
        0,
        T("A record of what it was keeps you ready if anyone asks.", "Un registro de qué fue te deja listo si alguien pregunta."),
        [null, T("Hiding money invites trouble and makes proof harder.", "Esconder el dinero atrae problemas y dificulta las pruebas."), T("Calling a gift \"pay\" can make it taxable income. Describe it truthfully.", "Llamar \"pago\" a un regalo puede hacerlo ingreso gravable. Descríbelo con verdad.")]
      )
    ),
    concept(
      "cash_border",
      T("Cash across the border", "Efectivo al cruzar la frontera"),
      card(
        T("Declare large cash", "Declara el efectivo grande"),
        T("Carrying more than {@cashDeclareUsd} in cash, or its equivalent, across the US–Mexico border has to be declared, in either direction. Carrying it isn't illegal. Not declaring it can mean losing it and penalties.", "Llevar más de {@cashDeclareUsd} dólares en efectivo, o su equivalente, al cruzar la frontera entre EE. UU. y México debe declararse, en cualquier dirección. Llevarlo no es ilegal. No declararlo puede significar perderlo y recibir multas.")
      ),
      tf("cash_border", T("You only have to declare cash if you're doing something illegal.", "Solo tienes que declarar efectivo si haces algo ilegal."), false, T("Large amounts have to be declared, whatever the reason. Declaring is how you keep it legal.", "Los montos grandes se declaran, sea cual sea el motivo. Declarar es lo que lo mantiene legal.")),
      choice(
        "cash_border",
        T("You'll carry {US$12000} in cash across the border for a purchase. What's the right move?", "Llevarás {US$12000} en efectivo al otro lado de la frontera para una compra. ¿Qué es lo correcto?"),
        [T("Declare it, and ask if there's a safer way to move the money", "Declararlo y preguntar si hay una forma más segura de mover el dinero"), T("Split it up and hide some", "Dividirlo y esconder una parte"), T("Say you have nothing to declare", "Decir que no tienes nada que declarar")],
        0,
        T("Declaring is the lawful way, and a bank transfer can be safer than cash.", "Declararlo es lo legal, y una transferencia bancaria puede ser más segura que el efectivo."),
        [null, T("Splitting and hiding can be treated as a crime, and you can lose all of it.", "Dividir y esconder puede tratarse como delito y puedes perderlo todo."), T("A false statement can lead to seizure and penalties.", "Una declaración falsa puede llevar a decomiso y multas.")]
      )
    ),
    concept(
      "tax_help",
      T("Finding a trusted preparer", "Encontrar un preparador de confianza"),
      card(
        T("Help exists, some of it free", "Existe ayuda, parte gratuita"),
        T("In the US, free programs like VITA help people who qualify, and a paid preparer must sign your return. In Mexico, the SAT offers free guidance and PRODECON defends taxpayers for free. Be wary of anyone promising a bigger refund before seeing your papers.", "En EE. UU., programas gratuitos como VITA ayudan a quienes califican, y un preparador de paga debe firmar tu declaración. En México, el SAT ofrece orientación gratuita y PRODECON defiende gratis a los contribuyentes. Desconfía de quien prometa un reembolso mayor antes de ver tus papeles.")
      ),
      tf("tax_help", T("A preparer who won't sign your return is a good sign.", "Un preparador que no quiere firmar tu declaración es buena señal."), false, T("In the US a paid preparer has to sign. Refusing is a red flag.", "En EE. UU. un preparador de paga debe firmar. Negarse es una señal de alerta.")),
      choice(
        "tax_help",
        T("A preparer promises a huge refund and takes a cut of it. What's wise?", "Un preparador promete un reembolso enorme y se queda con una parte. ¿Qué es sensato?"),
        [T("Walk away, and use a free program or a licensed preparer", "Irte y usar un programa gratuito o un preparador con licencia"), T("Sign right away", "Firmar de inmediato"), T("Give your numbers so they can \"check\"", "Dar tus números para que \"revisen\"")],
        0,
        T("Promises of big refunds before seeing your papers are a warning sign.", "Las promesas de grandes reembolsos antes de ver tus papeles son una señal de alerta."),
        [null, T("Signing fast gives them room to put anything on your return.", "Firmar rápido les da lugar a poner cualquier cosa en tu declaración."), T("Don't share personal numbers with someone you haven't checked.", "No compartas números personales con alguien que no hayas verificado.")]
      )
    ),
  ],
  lessons: [
    {
      id: "taxestwo-1",
      title: T("Residence and where you owe", "Residencia y dónde debes impuestos"),
      life: T("Write down which country you lived in each month this year, and where each paycheck came from.", "Anota en qué país viviste cada mes de este año y de dónde vino cada pago."),
      steps: [
        card(T("Two questions", "Dos preguntas"), T("Ask: where am I a resident, and where did the income come from? Each country answers those two questions in its own way, and a person can be a resident in both.", "Pregúntate: ¿dónde soy residente y de dónde vino el ingreso? Cada país responde esas dos preguntas a su manera, y una persona puede ser residente en ambos.")),
        match(
          "tax_residence",
          T("Match each word to its meaning.", "Une cada palabra con su significado."),
          [
            [T("Resident", "Residente"), T("Usually taxed on income from anywhere", "Normalmente paga por ingresos de cualquier lugar")],
            [T("Non-resident", "No residente"), T("Usually taxed on income from that country", "Normalmente paga por ingresos de ese país")],
            [T("Tax treaty", "Tratado fiscal"), T("An agreement that reduces paying twice", "Un acuerdo que reduce el pago doble")],
          ],
          T("These three ideas are the map. Your facts decide where you stand.", "Estas tres ideas son el mapa. Tus hechos deciden dónde estás.")
        ),
        scenario(
          "tax_residence",
          T("You moved to the other country in the middle of the year. What helps?", "Te mudaste al otro país a mitad del año. ¿Qué ayuda?"),
          [
            fit(T("Keep records of dates and income, and ask a helper how both countries see it", "Guardar registros de fechas e ingresos y preguntar a un ayudante cómo lo ve cada país"), "good", T("Dates and records are what decide residence for the year.", "Las fechas y los registros son lo que decide la residencia del año.")),
            fit(T("Assume the new country is all that matters", "Suponer que solo importa el país nuevo"), "ok", T("Often partly true, but the old country may still count part of the year.", "A veces es cierto en parte, pero el país anterior puede contar una parte del año.")),
            fit(T("Ignore it", "Ignorarlo"), "poor", T("That's how people end up with surprise bills.", "Así llegan las cuentas sorpresa.")),
          ],
          T("Dates and records first. They tell the story.", "Primero las fechas y los registros. Cuentan la historia.")
        ),
        tf("tax_residence", T("A citizen of one country can still owe tax there while living in another.", "Un ciudadano de un país puede deber impuestos ahí aunque viva en otro."), true, T("The US taxes its citizens wherever they live. Other countries have their own rules.", "EE. UU. grava a sus ciudadanos donde vivan. Otros países tienen sus propias reglas.")),
        card(T("This isn't advice", "Esto no es asesoría"), T("This lesson explains the map, not what you owe. Tax rules are detailed and change, so use free or licensed help for your own situation.", "Esta lección explica el mapa, no lo que debes. Las reglas fiscales son detalladas y cambian, así que usa ayuda gratuita o con licencia para tu situación.")),
        act("goals.brackets", T("See how tax brackets work with example numbers.", "Mira cómo funcionan los tramos de impuestos con números de ejemplo.")),
      ],
    },
    {
      id: "taxestwo-2",
      title: T("Income from the other country", "Ingresos del otro país"),
      life: T("Keep a folder with every tax form and receipt from each country, labeled by year.", "Guarda una carpeta con cada formulario de impuestos y recibo de cada país, marcada por año."),
      steps: [
        card(T("Avoiding double tax", "Evitar el doble impuesto"), T("When two countries can tax the same income, there are ways to avoid paying twice, such as a credit for tax paid abroad and the treaty. You usually have to ask for them on your return, with proof.", "Cuando dos países pueden gravar el mismo ingreso, hay formas de no pagar dos veces, como un crédito por el impuesto pagado en el extranjero y el tratado. Normalmente debes pedirlos en tu declaración, con pruebas.")),
        order(
          "foreign_income",
          T("Put the steps in order to avoid paying twice.", "Pon los pasos en orden para no pagar dos veces."),
          [T("Keep forms and receipts from the first country", "Guardar formularios y recibos del primer país"), T("Ask a helper which credits apply", "Preguntar a un ayudante qué créditos aplican"), T("File in each country that requires it", "Declarar en cada país que lo exija"), T("Claim the credit with proof", "Reclamar el crédito con pruebas")],
          T("Records come first, because everything else depends on them.", "Los registros van primero, porque todo lo demás depende de ellos.")
        ),
        number(
          "foreign_income",
          T("You earned {US$10000} abroad and paid {US$1500} tax there. Which total would you show a helper as tax already paid, in dollars?", "Ganaste {US$10000} en el extranjero y pagaste {US$1500} de impuesto allá. ¿Qué total le mostrarías a un ayudante como impuesto ya pagado, en dólares?"),
          { unit: "number", answer: 1500, tol: 1 },
          [T("The tax you paid there is the number to document.", "El impuesto que pagaste allá es el número que debes documentar."), T("1,500 dollars, with the receipt.", "1,500 dólares, con el recibo.")]
        ),
        tf("foreign_income", T("You can usually reduce the tax you pay twice by claiming a credit.", "Normalmente puedes reducir el impuesto que pagarías dos veces reclamando un crédito."), true, T("It depends on the case, but credits and treaties exist for this reason.", "Depende del caso, pero los créditos y tratados existen por esta razón.")),
        card(T("Dates and deadlines", "Fechas y plazos"), T("Each country has its own yearly deadline: the US around {@usTaxDeadline}, Mexico around {@mxTaxDeadline}. Missing one can mean a penalty, so mark both on a calendar.", "Cada país tiene su propia fecha anual: EE. UU. alrededor del {@usTaxDeadline}, México alrededor del {@mxTaxDeadline}. Perder una puede significar una multa, así que marca ambas en un calendario.")),
        act("goals.paycheck", T("See how much of a paycheck goes to taxes.", "Mira cuánto de un pago se va en impuestos.")),
      ],
    },
    {
      id: "taxestwo-3",
      title: T("Remittances, gifts and what gets reported", "Remesas, regalos y lo que se reporta"),
      life: T("When money comes from or goes to family, write one line: who, how much, why and when.", "Cuando llegue o salga dinero de la familia, escribe una línea: quién, cuánto, por qué y cuándo."),
      steps: [
        card(T("A gift isn't pay", "Un regalo no es un pago"), T("Money from family is usually a gift, not income. Pay for work is income, even from a relative. Large transfers can have reporting rules, so keep a short note of what each one was.", "El dinero de la familia suele ser un regalo, no ingreso. El pago por trabajo es ingreso, aunque venga de un pariente. Las transferencias grandes pueden tener reglas de reporte, así que guarda una nota breve de qué fue cada una.")),
        match(
          "gifts_money",
          T("Match each kind of money to how it's usually treated.", "Une cada tipo de dinero con cómo suele tratarse."),
          [
            [T("A gift from family", "Un regalo de la familia"), T("Usually not your income", "Normalmente no es tu ingreso")],
            [T("Pay for work", "Pago por trabajo"), T("Income, even from a relative", "Ingreso, aunque venga de un pariente")],
            [T("Interest on savings", "Intereses de ahorro"), T("Income", "Ingreso")],
          ],
          T("What the money is for decides how it's treated. Describe it truthfully.", "Para qué es el dinero decide cómo se trata. Descríbelo con verdad.")
        ),
        scenario(
          "gifts_money",
          T("You receive {US$300} a month from a parent, for rent. What's a good habit?", "Recibes {US$300} al mes de tu mamá o papá, para la renta. ¿Qué hábito es bueno?"),
          [
            fit(T("Keep the transfer receipts and one note saying it's family support", "Guardar los comprobantes de transferencia y una nota que diga que es apoyo familiar"), "good", T("A record keeps things simple if anyone asks.", "Un registro simplifica las cosas si alguien pregunta.")),
            fit(T("Call it salary so it looks official", "Llamarlo sueldo para que parezca oficial"), "poor", T("Calling a gift pay can create tax you didn't owe.", "Llamar pago a un regalo puede crear un impuesto que no debías.")),
            fit(T("Throw away the receipts", "Tirar los comprobantes"), "poor", T("You may need them to show what the money was.", "Quizá los necesites para mostrar qué era el dinero.")),
          ],
          T("Truthful notes and receipts are your best protection.", "Notas veraces y comprobantes son tu mejor protección.")
        ),
        tf("gifts_money", T("Rules about large gifts and transfers can differ between the two countries.", "Las reglas sobre regalos y transferencias grandes pueden cambiar entre los dos países."), true, T("That's why a short chat with a licensed helper is worth it for big amounts.", "Por eso una breve plática con un ayudante con licencia vale la pena en montos grandes.")),
        card(T("When in doubt, ask", "Ante la duda, pregunta"), T("If you're sending or receiving a large amount, ask the bank or a tax helper how to document it. A few minutes now beats a problem later.", "Si vas a enviar o recibir un monto grande, pregunta al banco o a un ayudante fiscal cómo documentarlo. Unos minutos ahora valen más que un problema después.")),
        act("goals.remit", T("Try an amount and see what arrives, then note how you'd document it.", "Prueba un monto y mira qué llega, y anota cómo lo documentarías.")),
      ],
    },
    {
      id: "taxestwo-4",
      title: T("Carrying cash across the border", "Llevar efectivo al cruzar la frontera"),
      life: T("Before a trip with cash, look up the official border page and write down the declaration limit in each direction.", "Antes de un viaje con efectivo, busca la página oficial de la frontera y anota el límite de declaración en cada dirección."),
      steps: [
        card(T("The limit", "El límite"), T("More than {@cashDeclareUsd} in cash (or its equivalent in another currency, checks or similar) has to be declared when you cross, in either direction. It's a reporting rule: carrying cash isn't a crime, hiding it is.", "Más de {@cashDeclareUsd} dólares en efectivo (o su equivalente en otra moneda, cheques o similares) debe declararse al cruzar, en cualquier dirección. Es una regla de reporte: llevar efectivo no es delito, esconderlo sí.")),
        number(
          "cash_border",
          T("You carry {US$12500}. How many dollars over the {@cashDeclareUsd} limit is that?", "Llevas {US$12500}. ¿Cuántos dólares son sobre el límite de {@cashDeclareUsd}?"),
          { unit: "number", answer: 2500, tol: 1 },
          [T("Subtract the limit from what you carry.", "Resta el límite a lo que llevas."), T("12,500 − 10,000 = 2,500 dollars.", "12,500 − 10,000 = 2,500 dólares.")]
        ),
        scenario(
          "cash_border",
          T("A friend says, \"Just carry {US$9900} so you don't have to declare.\" What's the best response?", "Un amigo dice: \"Lleva nada más {US$9900} para no tener que declarar\". ¿Cuál es la mejor respuesta?"),
          [
            fit(T("Don't structure it to dodge the rule. Declare if it's over, or use a bank transfer", "No fraccionarlo para esquivar la regla. Declarar si pasa del límite o usar una transferencia bancaria"), "good", T("Splitting amounts to avoid reporting is itself a problem.", "Fraccionar montos para evitar el reporte es en sí un problema.")),
            fit(T("Carry slightly less each trip, over and over", "Llevar un poco menos cada viaje, una y otra vez"), "poor", T("Repeated just-under amounts can look like hiding money.", "Montos repetidos justo por debajo pueden parecer que se esconde dinero.")),
            fit(T("Ask a friend to carry some of it for you", "Pedir a un amigo que lleve una parte por ti"), "poor", T("It can create trouble for both of you.", "Puede crear problemas para los dos.")),
          ],
          T("Move money openly: declare it, or use a bank.", "Mueve el dinero abiertamente: decláralo o usa un banco.")
        ),
        tf("cash_border", T("A bank transfer can be a safer way to move a large amount than carrying cash.", "Una transferencia bancaria puede ser una forma más segura de mover un monto grande que llevar efectivo."), true, T("It leaves a record, and nothing can be lost or stolen on the road.", "Deja registro y nada se puede perder o robar en el camino.")),
        card(T("Check the official page", "Revisa la página oficial"), T("Rules can change, so check the customs or border agency's own page before you travel, in both countries. Official pages are free.", "Las reglas pueden cambiar, así que revisa la página de la aduana o agencia fronteriza antes de viajar, en ambos países. Las páginas oficiales son gratuitas.")),
        act("goals.remit", T("Compare a bank or app transfer with carrying cash.", "Compara una transferencia por banco o app con llevar efectivo.")),
      ],
    },
    {
      id: "taxestwo-5",
      title: T("Finding a trusted preparer", "Encontrar un preparador de confianza"),
      life: T("Before you hire anyone for taxes, write down three questions to ask, including who signs your return.", "Antes de contratar a alguien para tus impuestos, anota tres preguntas, incluida quién firma tu declaración."),
      steps: [
        card(T("Free first", "Primero lo gratuito"), T("Free help exists. In the US, VITA programs help people who qualify. In Mexico, the SAT gives free guidance and PRODECON defends taxpayers for free. If you pay, pick someone licensed who signs your return.", "Existe ayuda gratuita. En EE. UU., los programas VITA ayudan a quienes califican. En México, el SAT da orientación gratuita y PRODECON defiende gratis a los contribuyentes. Si pagas, elige a alguien con licencia que firme tu declaración.")),
        order(
          "tax_help",
          T("Put the steps in order to choose a preparer.", "Pon los pasos en orden para elegir un preparador."),
          [T("Check for free help you qualify for", "Revisar si hay ayuda gratuita para la que calificas"), T("If you pay, check the person's license", "Si pagas, revisar la licencia de la persona"), T("Ask who signs your return and how fees work", "Preguntar quién firma tu declaración y cómo se cobran los honorarios"), T("Read the return before it's sent", "Leer la declaración antes de enviarla")],
          T("Free first, then credentials, then questions, then a careful read.", "Primero lo gratuito, luego credenciales, luego preguntas y luego una lectura cuidadosa.")
        ),
        scenario(
          "tax_help",
          T("A \"preparer\" in a pop-up office says, \"Pay {US$300}, and I'll get you the biggest refund. I don't sign returns.\" What's wise?", "Un \"preparador\" en una oficina improvisada dice: \"Paga {US$300} y te consigo el reembolso más grande. Yo no firmo declaraciones\". ¿Qué es sensato?"),
          [
            fit(T("Leave and use a free program or a licensed preparer who signs", "Irte y usar un programa gratuito o un preparador con licencia que firme"), "good", T("Someone who won't sign and promises \"the biggest refund\" is a red flag.", "Alguien que no firma y promete \"el reembolso más grande\" es una señal de alerta.")),
            fit(T("Pay, since it's quick", "Pagar, porque es rápido"), "poor", T("A false return can cost you penalties, and you're responsible.", "Una declaración falsa puede costarte multas y tú eres el responsable.")),
            fit(T("Give your papers and come back later", "Dar tus papeles y volver después"), "poor", T("Handing over your papers to an unchecked person risks identity theft.", "Entregar tus papeles a alguien sin verificar arriesga el robo de identidad.")),
          ],
          T("You sign the return, so you're responsible for what's on it. Choose someone who stands behind it.", "Tú firmas la declaración, así que eres responsable de lo que contiene. Elige a alguien que dé la cara.")
        ),
        tf("tax_help", T("You're responsible for what's on your tax return, even if someone else prepared it.", "Eres responsable de lo que dice tu declaración de impuestos, aunque la haya preparado otra persona."), true, T("That's why you read it first, and why you choose who prepares it with care.", "Por eso la lees antes y por eso eliges con cuidado quién la prepara.")),
        card(T("Keep it safe", "Mantenlo seguro"), T("Never send photos of your tax numbers or ID to someone you haven't checked. Share them only through official or well-established channels.", "Nunca mandes fotos de tus números fiscales o identificación a alguien que no hayas verificado. Compártelos solo por canales oficiales o bien establecidos.")),
        act("goals.scam", T("Look at a message from a \"preparer\" and find what gives it away.", "Mira un mensaje de un \"preparador\" y encuentra qué lo delata.")),
      ],
    },
  ],
};
