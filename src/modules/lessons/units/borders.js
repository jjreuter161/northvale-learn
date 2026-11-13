// UNIT — Money across borders. Its lessons and the concepts they teach (format in helpers.js).
// For everyone, at the end of the course; for someone who picks "Both" in Settings it
// opens after Banking. Amounts here are always dollars or pesos, whoever reads them:
// {US$200} and {MX$3600}. Illustrative numbers live in core/facts.js (remit*).
import { T, card, choice, tf, act, concept, order, estimate, number, match, scenario, fit } from "./helpers.js";

export default {
  id: "borders",
  icon: "globe",
  title: T("Money across borders", "Dinero entre fronteras"),
  concepts: [
    concept(
      "fx_rates",
      T("Exchange rates", "Tipos de cambio"),
      card(
        T("Pesos per dollar", "Pesos por dólar"),
        T("An exchange rate says how many pesos one dollar buys. At {MX$18} per {US$1}, {US$100} becomes {MX$1800}. The rate moves every day.", "Un tipo de cambio dice cuántos pesos compra un dólar. A {MX$18} por {US$1}, {US$100} se vuelven {MX$1800}. El tipo de cambio se mueve todos los días.")
      ),
      tf("fx_rates", T("The exchange rate stays the same from one day to the next.", "El tipo de cambio es el mismo de un día para otro."), false, T("It moves all the time, so the same dollars can buy more or fewer pesos next week.", "Se mueve todo el tiempo, así que los mismos dólares pueden comprar más o menos pesos la próxima semana.")),
      choice(
        "fx_rates",
        T("The rate goes from {MX$17} to {MX$19} per dollar. For someone sending dollars to Mexico:", "El tipo de cambio pasa de {MX$17} a {MX$19} por dólar. Para quien envía dólares a México:"),
        [T("Each dollar buys more pesos", "Cada dólar compra más pesos"), T("Each dollar buys fewer pesos", "Cada dólar compra menos pesos"), T("Nothing changes", "No cambia nada")],
        0,
        T("{MX$19} is more pesos for the same dollar, so the family gets more.", "{MX$19} son más pesos por el mismo dólar, así que la familia recibe más."),
        [null, T("It's the other way around: more pesos per dollar means each dollar goes further.", "Es al revés: más pesos por dólar significa que cada dólar rinde más."), T("The rate is the whole point: when it moves, the pesos that arrive move too.", "El tipo de cambio es justo eso: cuando se mueve, los pesos que llegan también.")]
      )
    ),
    concept(
      "remit_cost",
      T("What sending money costs", "Cuánto cuesta enviar dinero"),
      card(
        T("Two costs, one hidden", "Dos costos, uno escondido"),
        T("A transfer can cost a fee you see, plus a markup hidden in the exchange rate. Add both to get the total cost.", "Un envío puede costar una comisión que ves, más un margen escondido en el tipo de cambio. Suma los dos y tienes el costo total.")
      ),
      tf("remit_cost", T("A service that says \"no fee\" can still be expensive.", "Un servicio que dice \"sin comisión\" aun así puede salir caro."), true, T("The cost can hide in a worse exchange rate.", "El costo puede esconderse en un tipo de cambio peor.")),
      choice(
        "remit_cost",
        T("You send {US$100}. The fee is {US$4} and the markup is 1%. What's the total cost?", "Envías {US$100}. La comisión es de {US$4} y el margen es de 1%. ¿Cuál es el costo total?"),
        [T("{US$5}", "{US$5}"), T("{US$4}", "{US$4}"), T("{US$104}", "{US$104}")],
        0,
        T("The fee is {US$4}, and 1% of what's left is about {US$1}. Together: about {US$5}.", "La comisión es de {US$4} y el 1% de lo que queda es casi {US$1}. Juntos: casi {US$5}."),
        [null, T("That's only the fee. Add the markup hidden in the rate.", "Eso es solo la comisión. Suma el margen escondido en el tipo de cambio."), T("That's what you pay in all, not what it costs. The cost is what you lose to the service.", "Eso es lo que pagas en total, no lo que cuesta. El costo es lo que se queda el servicio.")]
      )
    ),
    concept(
      "two_accounts",
      T("Accounts and cards in two countries", "Cuentas y tarjetas en dos países"),
      card(
        T("Insurance stops at the border", "El seguro se queda en la frontera"),
        T("FDIC protects deposits in US banks. IPAB protects deposits in Mexican banks. Neither covers the other country.", "El FDIC protege depósitos en bancos de EE. UU. El IPAB protege depósitos en bancos de México. Ninguno cubre al otro país.")
      ),
      tf("two_accounts", T("A US debit card costs the same abroad as at home.", "Una tarjeta de débito de EE. UU. cuesta lo mismo en el extranjero que en casa."), false, T("Foreign ATM and currency fees can add up. Check your bank's fees before you travel.", "Las comisiones de cajeros extranjeros y de cambio de moneda se acumulan. Revisa las de tu banco antes de viajar.")),
      choice(
        "two_accounts",
        T("Which protects money in a Mexican bank account?", "¿Qué protege el dinero en una cuenta de un banco mexicano?"),
        [T("FDIC", "FDIC"), T("IPAB", "IPAB"), T("Neither", "Ninguno")],
        1,
        T("IPAB covers deposits in Mexican banks. FDIC covers US banks.", "El IPAB cubre depósitos en bancos mexicanos. El FDIC cubre bancos de EE. UU."),
        [T("FDIC only covers banks in the US.", "El FDIC solo cubre bancos de EE. UU."), null, T("Both exist for a reason: each protects deposits in its own country.", "Los dos existen por algo: cada uno protege depósitos en su país.")]
      )
    ),
    concept(
      "moving_credit",
      T("Credit when you move", "Crédito cuando te mudas"),
      card(
        T("Credit doesn't travel", "El crédito no viaja"),
        T("Each country keeps its own credit files. A good history in the US doesn't transfer to Buró de Crédito, or the other way. Moving means starting over.", "Cada país lleva sus propios expedientes de crédito. Un buen historial en EE. UU. no pasa a Buró de Crédito, ni al revés. Mudarte es empezar de cero.")
      ),
      tf("moving_credit", T("A good credit history in the US counts automatically in Mexico.", "Un buen historial de crédito en EE. UU. cuenta automáticamente en México."), false, T("Each country has its own credit bureaus, so you build it again.", "Cada país tiene sus propios burós de crédito, así que lo construyes otra vez.")),
      choice(
        "moving_credit",
        T("You arrive with no credit history. What's a good first step?", "Llegas sin historial de crédito. ¿Qué es un buen primer paso?"),
        [T("A starter or secured card, used lightly and paid on time", "Una tarjeta de inicio o garantizada, usada poco y pagada a tiempo"), T("Apply for five cards at once", "Pedir cinco tarjetas a la vez"), T("Wait a few years", "Esperar unos años")],
        0,
        T("A small, on-time habit builds a record. Lenders see the pattern.", "Un hábito pequeño y puntual crea un historial. Los prestamistas ven el patrón."),
        [null, T("Many applications at once can hurt you, and you may not be approved.", "Muchas solicitudes a la vez pueden perjudicarte y quizá no te aprueben."), T("Waiting builds nothing. History only starts when you use credit.", "Esperar no construye nada. El historial solo empieza cuando usas crédito.")]
      )
    ),
  ],
  lessons: [
    {
      id: "borders-1",
      title: T("Exchange rates", "Tipos de cambio"),
      life: T("Look up today's dollar-peso rate and say what {US$100} would be in pesos.", "Busca el tipo de cambio de hoy y calcula cuántos pesos serían {US$100}."),
      steps: [
        card(T("Dollars into pesos", "De dólares a pesos"), T("The exchange rate is the price of one currency in another. At {MX$18} per dollar, {US$50} buys {MX$900}. Multiply to go from dollars to pesos.", "El tipo de cambio es el precio de una moneda en otra. A {MX$18} por dólar, {US$50} compran {MX$900}. Multiplica para pasar de dólares a pesos.")),
        choice(
          "fx_rates",
          T("At {MX$18} per dollar, how many pesos is {US$50}?", "A {MX$18} por dólar, ¿cuántos pesos son {US$50}?"),
          [T("{MX$90}", "{MX$90}"), T("{MX$900}", "{MX$900}"), T("{MX$9000}", "{MX$9000}")],
          1,
          T("{US$50} × 18 = {MX$900}.", "{US$50} × 18 = {MX$900}."),
          [T("That's too small. Multiply 50 by 18, not by 1.8.", "Eso es muy poco. Multiplica 50 por 18, no por 1.8."), null, T("That's ten times too big. Check your zeros: 50 × 18 = 900.", "Eso es diez veces más. Revisa los ceros: 50 × 18 = 900.")]
        ),
        card(T("The rate you're offered", "El tipo de cambio que te ofrecen"), T("Services often use a rate a bit worse than the fair one in the news. That gap is a cost, even when they say \"no fee\".", "Los servicios suelen usar un tipo de cambio algo peor que el justo de las noticias. Esa diferencia es un costo, aunque digan \"sin comisión\".")),
        tf("fx_rates", T("When the dollar buys more pesos than last month, the peso has gotten weaker against the dollar.", "Cuando el dólar compra más pesos que el mes pasado, el peso se debilitó frente al dólar."), true, T("More pesos per dollar means each peso is worth less in dollars.", "Más pesos por dólar significa que cada peso vale menos en dólares.")),
        estimate(
          "fx_rates",
          T("The fair rate is {MX$18}, but a service gives {MX$17.5}. On {US$200}, about how many pesos short is that?", "El tipo justo es {MX$18}, pero un servicio da {MX$17.5}. En {US$200}, ¿cuántos pesos te faltan, más o menos?"),
          { unit: "number", min: 0, max: 400, step: 10, answer: 100, tol: 0.15 },
          T("0.5 pesos less on each of 200 dollars is 100 pesos.", "0.5 pesos menos por cada uno de 200 dólares son 100 pesos.")
        ),
        act("goals.create", T("Make a goal that crosses the border, like a trip to see family.", "Crea una meta que cruce la frontera, como un viaje para ver a la familia."), { name: { en: "Trip to see family", es: "Viaje para ver a la familia" }, target: [500, 9000], months: 8 }),
      ],
    },
    {
      id: "borders-2",
      title: T("What sending money really costs", "Cuánto cuesta de verdad enviar dinero"),
      life: T("Before you send money, ask: what is the fee, and what exchange rate am I getting?", "Antes de enviar dinero, pregunta: ¿cuál es la comisión y qué tipo de cambio me dan?"),
      steps: [
        card(T("Fee plus markup", "Comisión más margen"), T("Total cost = the fee you see + the markup hidden in the exchange rate. Compare the pesos that arrive, not the advertised fee.", "Costo total = la comisión que ves + el margen escondido en el tipo de cambio. Compara los pesos que llegan, no la comisión.")),
        choice(
          "remit_cost",
          T("Sending {US$500}: Service A charges {US$5} and marks up the rate 3%. Service B charges no fee and marks it up 5%. Which costs less?", "Enviando {US$500}: el Servicio A cobra {US$5} y sube el tipo de cambio 3%. El Servicio B no cobra comisión y lo sube 5%. ¿Cuál cuesta menos?"),
          [T("Service A", "Servicio A"), T("Service B", "Servicio B"), T("They cost the same", "Cuestan igual")],
          0,
          T("A: {US$5} + about {US$15} = about {US$20}. B: {US$0} + {US$25} = {US$25}. \"No fee\" wasn't cheaper.", "A: {US$5} + casi {US$15} = casi {US$20}. B: {US$0} + {US$25} = {US$25}. \"Sin comisión\" no salió más barato."),
          [null, T("No fee sounds cheaper, but 5% of {US$500} is {US$25}, more than A's total.", "Sin comisión suena más barato, pero el 5% de {US$500} es {US$25}, más que todo lo de A."), T("Add each service's fee and markup: about {US$20} against {US$25}.", "Suma comisión y margen: casi {US$20} contra {US$25}.")]
        ),
        tf("remit_cost", T("The cheapest service can change depending on how much you send.", "El servicio más barato puede cambiar según cuánto envíes."), true, T("A flat fee matters more on small amounts. A markup matters more on big ones.", "Una comisión fija pesa más en montos chicos. Un margen pesa más en montos grandes.")),
        number(
          "remit_cost",
          T("You send {US$400}. The markup is 2%. How many dollars is the markup?", "Envías {US$400}. El margen es de 2%. ¿Cuántos dólares son de margen?"),
          { unit: "number", answer: 8, tol: 0.5 },
          [T("2% is 0.02.", "2% es 0.02."), T("400 × 0.02 = 8 dollars.", "400 × 0.02 = 8 dólares.")]
        ),
        match(
          "remit_cost",
          T("Match each word to its meaning.", "Une cada palabra con su significado."),
          [
            [T("Fee", "Comisión"), T("A charge you can see", "Un cargo que se ve")],
            [T("Markup", "Margen"), T("A cost hidden in the rate", "Un costo escondido en el tipo de cambio")],
            [T("Total cost", "Costo total"), T("Fee plus markup", "Comisión más margen")],
          ],
          T("Fee and markup are both costs. Only together do they tell you the total.", "Comisión y margen son costos. Juntos dan el total.")
        ),
        card(T("Compare before you send", "Compara antes de enviar"), T("Profeco, Mexico's consumer agency, publishes an official comparison. In the US, you must be shown the rate and fees before paying, and can usually cancel within {@remitCancelMinutes} minutes.", "Profeco, la agencia de consumo, publica un comparativo oficial. En EE. UU. te muestran el tipo de cambio y las comisiones antes de pagar, y por lo general puedes cancelar en {@remitCancelMinutes} minutos.")),
        act("goals.remit", T("Slide the amount and watch which service costs less.", "Mueve el monto y mira qué servicio cuesta menos.")),
      ],
    },
    {
      id: "borders-3",
      title: T("Accounts and cards in two countries", "Cuentas y tarjetas en dos países"),
      life: T("Ask your bank what it charges for ATM use and card purchases abroad.", "Pregunta en tu banco cuánto cobra por usar cajeros y pagar con tarjeta en el extranjero."),
      steps: [
        card(T("Fees follow your card", "Las comisiones te siguen"), T("Using a card abroad can add a foreign ATM fee and a currency fee. If a terminal asks to charge you in dollars or pesos, choose the local currency.", "Usar tu tarjeta en el extranjero puede sumar comisión de cajero extranjero y de cambio de moneda. Si la terminal te pregunta si cobrar en dólares o pesos, elige la moneda local.")),
        choice(
          "two_accounts",
          T("In Mexico a card terminal offers to charge you in dollars or pesos. What's usually better?", "En México una terminal te ofrece cobrar en dólares o en pesos. ¿Qué suele convenir más?"),
          [T("Pesos, the local currency", "Pesos, la moneda local"), T("Dollars, so you know the price", "Dólares, para saber el precio")],
          0,
          T("Choosing dollars lets the merchant's service set the rate, which is often worse.", "Elegir dólares deja que el servicio del comercio fije el tipo de cambio, que suele ser peor."),
          [null, T("It looks clear, but the conversion rate is usually worse than your bank's.", "Parece claro, pero el tipo de cambio suele ser peor que el de tu banco.")]
        ),
        tf("two_accounts", T("FDIC insurance protects money in a Mexican bank account.", "El seguro del FDIC protege el dinero en una cuenta de un banco mexicano."), false, T("FDIC covers US banks. IPAB covers Mexican ones.", "El FDIC cubre bancos de EE. UU. El IPAB cubre los mexicanos.")),
        card(T("Two countries, two rules", "Dos países, dos reglas"), T("If you live in the US and your accounts abroad add up to more than {@fbarThreshold} at any time, you must report them to the US government.", "Si vives en EE. UU. y tus cuentas en el extranjero suman más de {@fbarThreshold} en algún momento, debes reportarlas al gobierno de EE. UU.")),
        scenario(
          "two_accounts",
          T("You land in Mexico and need cash. What would you do?", "Llegas a México y necesitas efectivo. ¿Qué harías?"),
          [
            fit(T("Use a bank's ATM and pay in pesos", "Usar el cajero de un banco y pagar en pesos"), "good", T("Local currency and a real bank keep the fees low.", "La moneda local y un banco de verdad mantienen bajas las comisiones.")),
            fit(T("Use a street ATM that charges extra", "Usar un cajero de la calle que cobra de más"), "poor", T("Standalone ATMs often add big fees.", "Los cajeros independientes suelen sumar comisiones altas.")),
            fit(T("Use an airport exchange kiosk", "Usar una casa de cambio del aeropuerto"), "ok", T("Easy, but airport rates are usually worse.", "Es fácil, pero los tipos de cambio del aeropuerto suelen ser peores.")),
          ],
          T("Compare the real cost, not the easiest option.", "Compara el costo real, no la opción más fácil.")
        ),
        act("goals.fees", T("Change how you'd use each account and watch the yearly cost change.", "Cambia cómo usarías cada cuenta y mira cómo cambia el costo anual.")),
      ],
    },
    {
      id: "borders-4",
      title: T("Credit and work when you move", "Crédito y trabajo cuando te mudas"),
      life: T("If you move countries, find out which credit bureau and which work rules apply there.", "Si te mudas de país, averigua qué buró de crédito y qué reglas de trabajo aplican."),
      steps: [
        card(T("Starting over", "Empezar de cero"), T("The US and Mexico keep separate credit files, so history doesn't follow you. Some US lenders accept an ITIN instead of a Social Security number.", "EE. UU. y México llevan expedientes de crédito separados, así que el historial no te sigue. Algunos prestamistas de EE. UU. aceptan un ITIN en lugar de un número de Seguro Social.")),
        choice(
          "moving_credit",
          T("You move from Mexico to the US with a good Buró de Crédito record. What's true about your US credit?", "Te mudas de México a EE. UU. con un buen Buró de Crédito. ¿Qué pasa con tu crédito en EE. UU.?"),
          [T("It starts fresh", "Empieza de cero"), T("It transfers automatically", "Se transfiere automáticamente")],
          0,
          T("Bureaus don't share files across the border, so you build a new record.", "Los burós no comparten expedientes entre países, así que construyes un historial nuevo."),
          [null, T("It would be handy, but each country keeps its own credit files.", "Sería práctico, pero cada país tiene sus propios expedientes.")]
        ),
        tf("moving_credit", T("Paying on time in one country builds credit in the other.", "Pagar a tiempo en un país construye crédito en el otro."), false, T("Only the bureaus in that country see it.", "Solo los burós de ese país lo ven.")),
        order(
          "moving_credit",
          T("Put these steps in order to build credit in a new country.", "Pon estos pasos en orden para construir crédito en un país nuevo."),
          [T("Open a bank account", "Abrir una cuenta de banco"), T("Get a starter or secured card", "Conseguir una tarjeta de inicio o garantizada"), T("Use it a little and pay on time", "Usarla poco y pagar a tiempo"), T("Check your credit report once a year", "Revisar tu reporte de crédito una vez al año")],
          T("Each step builds on the one before it.", "Cada paso se apoya en el anterior.")
        ),
        card(T("Studying or working abroad", "Estudiar o trabajar fuera"), T("Work rules depend on your visa. A student on an F-1 visa can usually work on campus up to {@f1WorkHours} hours a week during classes. Check the official source for your case.", "Las reglas de trabajo dependen de tu visa. Un estudiante con visa F-1 por lo general puede trabajar en el campus hasta {@f1WorkHours} horas por semana durante clases. Consulta la fuente oficial de tu caso.")),
        act("goals.budget", T("Plan a month in your other country: split your income your way.", "Planea un mes en tu otro país: reparte tu ingreso a tu manera."), { income: [1200, 20000] }),
      ],
    },
  ],
};
