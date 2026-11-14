// UNIT — Sending and receiving money. Its lessons and the concepts they teach (format in helpers.js).
// Written for life between the US and Mexico: amounts are always dollars or pesos, whoever reads them
// ({US$200}, {MX$3600}). Example rates and fees are teaching numbers (see core/facts.js, remit*).
// Needs a human review before it goes live (units/reviews.js).
import { T, card, choice, tf, act, concept, order, estimate, number, match, spot, tap, scenario, fit } from "./helpers.js";

export default {
  id: "remit",
  icon: "send",
  title: T("Sending and receiving money", "Enviar y recibir dinero"),
  concepts: [
    concept(
      "full_cost",
      T("The full cost of a transfer", "El costo total de un envío"),
      card(
        T("Count what arrives", "Cuenta lo que llega"),
        T("The best way to compare transfers is to count what arrives. Divide the pesos the family gets by the dollars you paid, fee included. That's the rate you really got. A lower number is a higher cost.", "La mejor forma de comparar envíos es contar lo que llega. Divide los pesos que recibe la familia entre los dólares que pagaste, comisión incluida. Ese es el tipo de cambio que de verdad obtuviste. Un número más bajo es un costo más alto.")
      ),
      tf("full_cost", T("Comparing only the fee tells you which transfer is cheapest.", "Comparar solo la comisión te dice cuál envío es el más barato."), false, T("The exchange rate can hide a bigger cost than the fee. Compare the pesos that arrive.", "El tipo de cambio puede esconder un costo mayor que la comisión. Compara los pesos que llegan.")),
      choice(
        "full_cost",
        T("Service A: you pay {US$200} and {MX$3500} arrive. Service B: you pay {US$210} and {MX$3600} arrive. Which gives more pesos for each dollar you pay?", "Servicio A: pagas {US$200} y llegan {MX$3500}. Servicio B: pagas {US$210} y llegan {MX$3600}. ¿Cuál da más pesos por cada dólar que pagas?"),
        [T("A", "A"), T("B", "B"), T("They're the same", "Son iguales")],
        0,
        T("{MX$3500} ÷ 200 = 17.5 pesos per dollar. {MX$3600} ÷ 210 is about 17.1. More pesos arriving isn't a better deal if you paid more.", "{MX$3500} ÷ 200 = 17.5 pesos por dólar. {MX$3600} ÷ 210 son casi 17.1. Que lleguen más pesos no es mejor trato si pagaste más."),
        [null, T("B delivers more pesos, but it also cost you {US$10} more. Divide each by what you paid.", "B entrega más pesos, pero también te costó {US$10} más. Divide cada uno entre lo que pagaste."), T("Divide: 17.5 against about 17.1.", "Divide: 17.5 contra casi 17.1.")]
      )
    ),
    concept(
      "send_ways",
      T("Ways to send and receive", "Formas de enviar y recibir"),
      card(
        T("Cost, speed and safety", "Costo, rapidez y seguridad"),
        T("Cash pickup is fast but can cost more. A bank transfer can be cheaper but slower. An app or card is easy, but still check the rate. Pick by what matters most this time: cost, speed or safety.", "Recoger en efectivo es rápido, pero puede costar más. Una transferencia bancaria puede ser más barata, pero más lenta. Una app o tarjeta es fácil, pero igual revisa el tipo de cambio. Elige según lo que más importe esta vez: costo, rapidez o seguridad.")
      ),
      tf("send_ways", T("The fastest way to send money is always the cheapest.", "La forma más rápida de enviar dinero siempre es la más barata."), false, T("Speed often costs extra. If there's no rush, a slower way can cost less.", "La rapidez suele costar de más. Si no hay prisa, una forma más lenta puede costar menos.")),
      choice(
        "send_ways",
        T("Your family needs rent money in two days and has a bank account. What's a sensible way to choose?", "Tu familia necesita el dinero de la renta en dos días y tiene cuenta de banco. ¿Cuál es una forma sensata de elegir?"),
        [T("Compare the cost and delivery time of a bank or app transfer with a cash option", "Comparar el costo y el tiempo de entrega de una transferencia por banco o app con una opción en efectivo"), T("Pick whichever ad says \"fastest\"", "Elegir el que diga \"el más rápido\" en su anuncio"), T("Send cash in an envelope", "Mandar efectivo en un sobre")],
        0,
        T("Two days is enough for several options. Compare what arrives and when, then choose.", "Dos días alcanzan para varias opciones. Compara lo que llega y cuándo, y luego elige."),
        [null, T("Ads are written to sell. The numbers are what count.", "Los anuncios se escriben para vender. Lo que cuenta son los números."), T("Cash in an envelope can be lost or stolen, and nobody can trace it.", "El efectivo en un sobre se puede perder o robar, y nadie puede rastrearlo.")]
      )
    ),
    concept(
      "send_safe",
      T("Sending safely", "Enviar con seguridad"),
      card(
        T("Know the rules", "Conoce las reglas"),
        T("Before you pay, a US service has to show you the exchange rate, the fees and the amount that arrives. You can usually cancel within {@remitCancelMinutes} minutes. No real service asks you to pay with gift cards.", "Antes de que pagues, un servicio en EE. UU. tiene que mostrarte el tipo de cambio, las comisiones y lo que va a llegar. Por lo general puedes cancelar dentro de {@remitCancelMinutes} minutos. Ningún servicio real te pide pagar con tarjetas de regalo.")
      ),
      tf("send_safe", T("Paying a transfer with gift cards is normal.", "Pagar un envío con tarjetas de regalo es normal."), false, T("Only scammers ask for gift cards. A real service takes a bank account, card or cash.", "Solo los estafadores piden tarjetas de regalo. Un servicio real acepta cuenta de banco, tarjeta o efectivo.")),
      choice(
        "send_safe",
        T("Ten minutes after sending, you notice you typed the wrong person's details. What's the best move?", "Diez minutos después de enviar, notas que escribiste mal los datos de la persona. ¿Qué es lo mejor?"),
        [T("Contact the service right away and ask to cancel", "Contactar al servicio de inmediato y pedir que lo cancelen"), T("Wait and see if it arrives", "Esperar a ver si llega"), T("Send it again to the right person", "Enviarlo otra vez a la persona correcta")],
        0,
        T("You can usually cancel within {@remitCancelMinutes} minutes. Every minute you wait makes it harder.", "Por lo general puedes cancelar dentro de {@remitCancelMinutes} minutos. Cada minuto que esperas lo hace más difícil."),
        [null, T("Once it's paid out, it's hard to get back. Act while you still can cancel.", "Una vez que se paga, es difícil recuperarlo. Actúa mientras todavía puedes cancelar."), T("Now the money is out twice, and the first one may be gone.", "Ahora el dinero salió dos veces, y la primera puede estar perdida.")]
      )
    ),
  ],
  lessons: [
    {
      id: "remit-1",
      title: T("Fee plus exchange rate: the full cost", "Comisión más tipo de cambio: el costo total"),
      life: T("Next time you send money, write down what you pay and the pesos that arrive, then divide.", "La próxima vez que envíes dinero, anota lo que pagas y los pesos que llegan, y divide."),
      steps: [
        card(T("Divide to compare", "Divide para comparar"), T("Divide the pesos that arrive by the dollars you pay. At a fair rate of {MX$18}, getting {MX$17.5} per dollar means you lost a bit under 3%. That loss is the cost, fee or no fee.", "Divide los pesos que llegan entre los dólares que pagas. Con un tipo justo de {MX$18}, recibir {MX$17.5} por dólar significa que perdiste un poco menos del 3%. Esa pérdida es el costo, haya o no comisión.")),
        number(
          "full_cost",
          T("You pay {US$200} in all and {MX$3500} arrive. How many pesos did you get for each dollar?", "Pagas {US$200} en total y llegan {MX$3500}. ¿Cuántos pesos recibiste por cada dólar?"),
          { unit: "number", answer: 17.5, tol: 0.1 },
          [T("Pesos that arrive ÷ dollars you paid.", "Pesos que llegan ÷ dólares que pagaste."), T("3500 ÷ 200 = 17.5.", "3500 ÷ 200 = 17.5.")]
        ),
        choice(
          "full_cost",
          T("A service says \"no fee\". What should you still check?", "Un servicio dice \"sin comisión\". ¿Qué más deberías revisar?"),
          [T("The exchange rate, and the pesos that arrive", "El tipo de cambio y los pesos que llegan"), T("Nothing. No fee means no cost", "Nada. Sin comisión no hay costo"), T("Only how fast it is", "Solo qué tan rápido es")],
          0,
          T("A cost can hide in a worse rate. The pesos that arrive show it.", "Un costo puede esconderse en un tipo de cambio peor. Los pesos que llegan lo muestran."),
          [null, T("No fee can still be expensive: the rate may be worse than the fair one.", "Sin comisión aún puede salir caro: el tipo de cambio puede ser peor que el justo."), T("Speed matters, but it doesn't tell you what you lost.", "La rapidez importa, pero no te dice cuánto perdiste.")]
        ),
        card(T("The fair rate", "El tipo justo"), T("The fair rate is the one you see in the news or in your bank's app. The gap between it and the rate you get is a cost. Checking it takes ten seconds.", "El tipo justo es el que ves en las noticias o en la app de tu banco. La diferencia entre ese y el que te dan es un costo. Revisarlo toma diez segundos.")),
        estimate(
          "full_cost",
          T("The fair rate is {MX$18} and you got {MX$17.5}. About what share of your money did you lose?", "El tipo justo es {MX$18} y recibiste {MX$17.5}. ¿Qué parte de tu dinero perdiste, más o menos?"),
          { unit: "percent", min: 0, max: 10, step: 0.2, answer: 2.8, tol: 0.15 },
          T("The gap is 0.5 pesos on 18: 0.5 ÷ 18 is about 2.8%.", "La diferencia es 0.5 pesos de 18: 0.5 ÷ 18 es casi 2.8%.")
        ),
        act("goals.remit", T("Slide the amount and watch which service costs less.", "Mueve el monto y mira qué servicio cuesta menos.")),
      ],
    },
    {
      id: "remit-2",
      title: T("Comparing services", "Comparar servicios"),
      life: T("Look up Profeco's money-transfer comparison and compare two services for the amount you usually send.", "Busca el comparativo de envíos de dinero de Profeco y compara dos servicios con el monto que sueles enviar."),
      steps: [
        card(T("Same amount, same moment", "Mismo monto, mismo momento"), T("Fees and rates change all day and differ by service. To compare fairly, use the same amount, the same moment and the same delivery speed. Profeco, Mexico's consumer agency, publishes an official comparison of transfer services.", "Las comisiones y los tipos de cambio cambian todo el día y varían por servicio. Para comparar con justicia, usa el mismo monto, el mismo momento y la misma rapidez. Profeco, la agencia de consumo de México, publica un comparativo oficial de servicios de envío.")),
        match(
          "full_cost",
          T("Match each word to its meaning.", "Une cada palabra con su significado."),
          [
            [T("Fee", "Comisión"), T("A charge you can see", "Un cargo que se ve")],
            [T("Rate gap", "Diferencia de tipo de cambio"), T("Fair rate minus the rate you get", "Tipo justo menos el que te dan")],
            [T("Delivery time", "Tiempo de entrega"), T("How long until the money arrives", "Cuánto tarda en llegar el dinero")],
          ],
          T("Fee, rate gap and delivery time are the three things to compare.", "Comisión, diferencia de tipo de cambio y tiempo de entrega son las tres cosas que comparar.")
        ),
        spot(
          "full_cost",
          T("Read this ad. Tap the 2 claims you can't trust without checking the numbers.", "Lee este anuncio. Toca las 2 frases que no puedes creer sin revisar los números."),
          "offer",
          T("Ad · QuickSend", "Anuncio · EnvíoRápido"),
          [
            tap(T("NO FEES!", "¡SIN COMISIONES!"), true),
            T(" Send money home in minutes. ", " Envía dinero a casa en minutos. "),
            tap(T("Best rate guaranteed.", "El mejor tipo de cambio garantizado."), true),
            tap(T("Today's rate and the amount that arrives are shown before you pay.", "El tipo de cambio de hoy y lo que llega se muestran antes de que pagues.")),
          ],
          T("\"No fees\" can hide a worse rate, and \"best\" can't be checked. The last line, showing the rate and what arrives, is the useful part.", "\"Sin comisiones\" puede esconder un tipo de cambio peor, y \"el mejor\" no se puede comprobar. La última frase, que muestra el tipo y lo que llega, es lo útil.")
        ),
        tf("send_ways", T("The cheapest service is the same for every amount and every day.", "El servicio más barato es el mismo para cualquier monto y cualquier día."), false, T("A flat fee matters more on small amounts, a rate gap on big ones, and both change daily.", "Una comisión fija pesa más en montos chicos, una diferencia de tipo de cambio en montos grandes, y ambas cambian a diario.")),
        card(T("Write it down", "Anótalo"), T("Make a small table: service, you pay, pesos that arrive, minutes to arrive. Two minutes of checking can be worth a few hundred pesos over a year of sending.", "Haz una tablita: servicio, lo que pagas, pesos que llegan, minutos que tarda. Dos minutos de revisar pueden valer unos cientos de pesos al año si envías seguido.")),
        act("goals.remit", T("Change the amount and see how the cheapest service changes.", "Cambia el monto y mira cómo cambia el servicio más barato.")),
      ],
    },
    {
      id: "remit-3",
      title: T("Cash, bank, app or card", "Efectivo, banco, app o tarjeta"),
      life: T("Ask your family which way of receiving money is easiest for them, and what it costs them.", "Pregunta a tu familia qué forma de recibir dinero les resulta más fácil y cuánto les cuesta."),
      steps: [
        card(T("Four ways, four trade-offs", "Cuatro formas, cuatro compromisos"), T("Cash pickup: fast, but you need to go and carry cash. Bank deposit: safe and often cheaper, but needs an account. App: easy, but check the rate. Card: handy, but fees can add up.", "Efectivo: rápido, pero hay que ir y llevar dinero. Depósito en banco: seguro y a veces más barato, pero requiere cuenta. App: fácil, pero revisa el tipo de cambio. Tarjeta: práctica, pero las comisiones se acumulan.")),
        match(
          "send_ways",
          T("Match each way to its main trade-off.", "Une cada forma con su principal compromiso."),
          [
            [T("Cash pickup", "Efectivo en ventanilla"), T("Fast, but cash is risky to carry", "Rápido, pero llevar efectivo es riesgoso")],
            [T("Bank deposit", "Depósito en banco"), T("Safe, but needs an account", "Seguro, pero requiere una cuenta")],
            [T("App", "App"), T("Easy, but check the rate", "Fácil, pero revisa el tipo de cambio")],
          ],
          T("Each way trades something for something else. There's no best one for everyone.", "Cada forma cambia una cosa por otra. No hay una mejor para todos.")
        ),
        scenario(
          "send_ways",
          T("You send {US$150} to your grandmother, who lives far from a bank and doesn't use apps. What fits?", "Envías {US$150} a tu abuela, que vive lejos de un banco y no usa apps. ¿Qué conviene?"),
          [
            fit(T("Cash pickup at a nearby store she can reach", "Efectivo en una tienda cercana a la que ella pueda llegar"), "good", T("It fits how she lives. Check the fee and the rate first.", "Se ajusta a cómo vive ella. Revisa antes la comisión y el tipo de cambio.")),
            fit(T("A bank deposit she can't get to", "Un depósito en un banco al que no puede ir"), "poor", T("Cheaper, but useless if she can't reach it.", "Más barato, pero inútil si no puede llegar.")),
            fit(T("An app transfer she'd have to set up alone", "Una transferencia por app que tendría que configurar sola"), "ok", T("Works only with help from someone she trusts.", "Solo funciona con ayuda de alguien de confianza.")),
          ],
          T("The best option fits the person receiving it, not only the price.", "La mejor opción se ajusta a quien recibe, no solo al precio.")
        ),
        tf("send_ways", T("Receiving a transfer in a bank account usually needs the person to have an account.", "Recibir un envío en una cuenta de banco normalmente requiere que la persona tenga cuenta."), true, T("That's why a bank deposit suits people who already bank and not everyone else.", "Por eso un depósito en banco sirve a quien ya tiene banco y no a todos.")),
        card(T("Cost is only one part", "El costo es solo una parte"), T("A cheaper way that fails to arrive costs more than an expensive one that works. Reliable and easy to use often matter as much as the lowest price.", "Una forma más barata que no llega cuesta más que una cara que funciona. Que sea confiable y fácil de usar importa tanto como el precio más bajo.")),
        act("goals.fees", T("Change how you'd send and see how the yearly cost changes.", "Cambia cómo enviarías y mira cómo cambia el costo anual.")),
      ],
    },
    {
      id: "remit-4",
      title: T("Receiving: who pays what, and ID", "Recibir: quién paga qué, y la identificación"),
      life: T("If you receive money, keep the receipt and check that the amount matches what the sender said.", "Si recibes dinero, guarda el comprobante y revisa que el monto sea el que dijo quien lo envió."),
      steps: [
        card(T("Receiving takes planning too", "Recibir también requiere planear"), T("The person receiving usually needs ID and the sender's reference number. Some services charge the receiver, too. Ask the sender up front who pays what, so the amount that arrives is a surprise to no one.", "Quien recibe suele necesitar identificación y el número de referencia del envío. Algunos servicios también cobran a quien recibe. Pregunta antes quién paga qué, para que el monto que llega no sea sorpresa para nadie.")),
        order(
          "send_ways",
          T("Put the steps in order for receiving cash.", "Pon en orden los pasos para recibir efectivo."),
          [T("The sender gives you the reference number", "Quien envía te da el número de referencia"), T("You go to the pickup place with your ID", "Vas al lugar de entrega con tu identificación"), T("You show the number and ID", "Muestras el número y la identificación"), T("You count the money and keep the receipt", "Cuentas el dinero y guardas el comprobante")],
          T("Each step needs the one before it. Keep the receipt in case something doesn't match.", "Cada paso necesita el anterior. Guarda el comprobante por si algo no coincide.")
        ),
        choice(
          "send_ways",
          T("The sender says {MX$3600} should arrive, but you're given {MX$3450}. What do you do first?", "Quien envía dice que deben llegar {MX$3600}, pero te dan {MX$3450}. ¿Qué haces primero?"),
          [T("Ask what was deducted and why, and keep the receipt", "Preguntar qué se descontó y por qué, y guardar el comprobante"), T("Take it and say nothing", "Recibirlo sin decir nada"), T("Leave and come back another day", "Irte y volver otro día")],
          0,
          T("A fee or a different rate may explain it. Ask, compare with what the sender saw, and keep the proof.", "Una comisión o un tipo de cambio distinto pueden explicarlo. Pregunta, compara con lo que vio quien envió y guarda el comprobante."),
          [null, T("Maybe it's a normal fee, but you won't know unless you ask.", "Quizá sea una comisión normal, pero no lo sabrás si no preguntas."), T("Leaving doesn't explain the difference, and the details may be harder to check later.", "Irte no explica la diferencia, y después puede ser más difícil comprobarlo.")]
        ),
        tf("send_safe", T("Only the person named on the transfer should give their ID to collect it.", "Solo la persona nombrada en el envío debe dar su identificación para cobrarlo."), true, T("The ID and name have to match. Never share a reference number or ID with someone who contacts you out of the blue.", "La identificación y el nombre deben coincidir. Nunca compartas un número de referencia o una identificación con alguien que te contacta de la nada.")),
        card(T("A message that asks for your code", "Un mensaje que pide tu código"), T("A real service never asks the receiver to pay a fee first in order to \"release\" money. If someone says you won money and must pay to collect it, it's a scam.", "Un servicio real nunca le pide a quien recibe pagar una cuota antes para \"liberar\" el dinero. Si alguien dice que ganaste dinero y debes pagar para cobrarlo, es una estafa.")),
        act("goals.remit", T("Try a few amounts and notice what the receiver would get.", "Prueba algunos montos y fíjate en lo que recibiría la otra persona.")),
      ],
    },
    {
      id: "remit-5",
      title: T("Limits, reporting and staying safe", "Límites, reportes y cómo cuidarte"),
      life: T("Save the service's customer-service number in your phone, so you never have to search for it in a hurry.", "Guarda en tu teléfono el número de atención del servicio, para no tener que buscarlo con prisa."),
      steps: [
        card(T("Rules you'll run into", "Reglas con las que te vas a topar"), T("Services set limits on how much you can send and ask for ID on bigger amounts. That's normal: it's part of the rules against fraud. If one says you need no ID at all, be careful.", "Los servicios ponen límites a lo que puedes enviar y piden identificación en montos mayores. Es normal: son reglas contra el fraude. Si uno dice que no hace falta identificación, ten cuidado.")),
        spot(
          "send_safe",
          T("This text arrived after you sent money. Tap the 2 red flags.", "Este mensaje llegó después de que enviaste dinero. Toca las 2 señales de alerta."),
          "sms",
          T("Text message · +1 (555) 013-7788", "Mensaje de texto · 55 8812 3300"),
          [
            tap(T("Your transfer is on hold.", "Tu envío está retenido.")),
            tap(T("Pay a release fee with gift cards", "Paga una cuota de liberación con tarjetas de regalo"), true),
            T(" and send us the codes ", " y envíanos los códigos "),
            tap(T("within 30 minutes", "en menos de 30 minutos"), true),
            T(" or it will be canceled.", " o se cancelará."),
          ],
          T("Gift cards and a countdown are classic scam signs. If unsure, contact the service yourself, using the number in its app.", "Tarjetas de regalo y una cuenta regresiva son señales clásicas de estafa. Si dudas, contacta tú al servicio con el número de su app.")
        ),
        scenario(
          "send_safe",
          T("A \"friend\" you've never met asks you to receive a transfer and forward most of it. What do you do?", "Un \"amigo\" que nunca has visto te pide recibir un envío y reenviarle casi todo. ¿Qué haces?"),
          [
            fit(T("Say no and stop replying", "Decir que no y dejar de responder"), "good", T("Moving money for strangers is a common way to hide stolen funds, and you could be held responsible.", "Mover dinero para desconocidos es una forma común de ocultar dinero robado, y podrían responsabilizarte.")),
            fit(T("Do it once, keeping a small cut", "Hacerlo una vez y quedarte con una parte"), "poor", T("That's exactly the trap. You may lose your own money and your account.", "Esa es justo la trampa. Puedes perder tu dinero y tu cuenta.")),
            fit(T("Ask a bank or a trusted adult first", "Preguntar primero a un banco o a un adulto de confianza"), "ok", T("A good instinct, though the answer is almost always no.", "Buen instinto, aunque casi siempre la respuesta es no.")),
          ],
          T("If a stranger needs you to move their money, assume it's a scam.", "Si un desconocido necesita que muevas su dinero, supón que es una estafa.")
        ),
        tf("send_safe", T("You can usually cancel a transfer within {@remitCancelMinutes} minutes of paying.", "Por lo general puedes cancelar un envío dentro de {@remitCancelMinutes} minutos después de pagar."), true, T("In the US, that window is part of the transfer rules. Act fast and keep your receipt.", "En EE. UU. esa ventana es parte de las reglas de los envíos. Actúa rápido y guarda tu comprobante.")),
        card(T("When something goes wrong", "Cuando algo sale mal"), T("Contact the service first, with your receipt. Then use the official channels: the CFPB in the US, CONDUSEF or Profeco in Mexico. Report scams to protect others.", "Contacta primero al servicio, con tu comprobante. Luego usa los canales oficiales: la CFPB en EE. UU., CONDUSEF o Profeco en México. Reporta las estafas para proteger a otros.")),
        act("goals.scam", T("Look at a scam message and spot what gives it away.", "Mira un mensaje fraudulento y encuentra qué lo delata.")),
      ],
    },
  ],
};
