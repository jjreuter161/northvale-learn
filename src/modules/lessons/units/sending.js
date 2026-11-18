// UNIT — Sending and receiving money (Wave 1, Life Across Borders, Start; Border).
// DRAFT: not in the app until a reviewer signs it off (docs/CONTENT-ROADMAP.md, "Quality plan").
// To ship: set `reviewed: "YYYY-MM-DD · initials"` and remove `draft`, add it to index.js's
// LOADERS, add a "why.sending" line in lessons/index.jsx, add its mission to missions/catalog.js,
// and run node scripts/lesson-index.mjs. Where it opens in the course order: content.js (the
// Border units).
// Mission to add then: "Compare what arrives from two services for the same amount, same day, same
// payout method (use Profeco's comparison; send nothing)": reflection "Which one cost less, and by how much?"
// Border units always write both countries at once, so amounts are {US$…} and {MX$…}.
// The example services are made up. No real company is named or ranked.
import { T, card, choice, tf, act, concept, order, match, number, scenario, fit } from "./helpers.js";

export default {
  id: "sending",
  icon: "send",
  draft: true,
  title: T("Sending and receiving money", "Enviar y recibir dinero"),
  sources: [
    // Read on the checked date: what the page says is in the lessons; a human reviewer re-checks each one.
    { name: "CFPB, \"What is a remittance transfer?\": disclosures (fees, exchange rate, amount delivered) and the 30-minute cancel window", url: "https://www.consumerfinance.gov/ask-cfpb/what-is-a-remittance-transfer-en-1161/", checked: "2026-11-17" },
    { name: "Profeco, \"Quién es Quién en el Envío de Dinero\": compares fees, rate, delivery time and pesos received", url: "https://qqed.profeco.gob.mx/", checked: "2026-11-17" },
    { name: "31 CFR 1010.410(e), funds-transfer recordkeeping for transmittals of $3,000 or more (read on law.cornell.edu; the reviewer confirms on ecfr.gov or fincen.gov)", url: "https://www.law.cornell.edu/cfr/text/31/1010.410", checked: "2026-11-17" },
  ],
  concepts: [
    concept(
      "total_cost",
      T("What a transfer really costs", "Cuánto cuesta de verdad un envío"),
      card(
        T("Judge it by what arrives", "Júzgalo por lo que llega"),
        T(
          "Take the fair exchange rate, the one in the news, and multiply it by your dollars. That is the most pesos that could arrive. Whatever falls short is the cost: the fee you see plus the gap in the rate.",
          "Toma el tipo de cambio justo, el de las noticias, y multiplícalo por tus dólares. Esos son los pesos máximos que podrían llegar. Lo que falte es el costo: la comisión que ves más la diferencia en el tipo de cambio."
        )
      ),
      tf("total_cost", T("A transfer with no fee can still cost you money.", "Un envío sin comisión aun así puede costarte dinero."), true, T("A rate worse than the fair one takes pesos from the receiver, fee or no fee.", "Un tipo de cambio peor que el justo le quita pesos a quien recibe, haya comisión o no.")),
      choice(
        "total_cost",
        T("The fair rate is {MX$18}. You pay {US$200} in all. Service A delivers {MX$3500}, Service B delivers {MX$3560}. Which costs less?", "El tipo justo es {MX$18}. Pagas {US$200} en total. El Servicio A entrega {MX$3500} y el B entrega {MX$3560}. ¿Cuál cuesta menos?"),
        [T("Service A", "Servicio A"), T("Service B", "Servicio B"), T("They cost the same", "Cuestan igual")],
        1,
        T("The fair amount is {MX$3600}. A is {MX$100} short. B is {MX$40} short.", "Lo justo son {MX$3600}. Al A le faltan {MX$100}. Al B le faltan {MX$40}."),
        [T("A leaves the receiver {MX$100} short of fair. B leaves {MX$40}.", "A deja a quien recibe {MX$100} abajo de lo justo. B lo deja {MX$40}."), null, T("Compare each to {MX$3600}. They fall short by different amounts.", "Compara cada uno con {MX$3600}. Les falta una cantidad distinta.")]
      )
    ),
    concept(
      "send_ways",
      T("Ways to send money", "Formas de enviar dinero"),
      card(
        T("Four trade-offs", "Cuatro cosas que sopesar"),
        T(
          "Cash at a store, a bank transfer, an app and a card all move money. They differ in speed, cost, safety and reach. A way that is cheap but that the receiver can't use isn't cheap.",
          "Efectivo en una tienda, una transferencia bancaria, una app y una tarjeta mueven dinero. Se distinguen en rapidez, costo, seguridad y alcance. Una forma barata que quien recibe no puede usar no es barata."
        )
      ),
      tf("send_ways", T("The cheapest way to send is the right one for every family.", "La forma más barata de enviar es la adecuada para todas las familias."), false, T("The receiver may not have the app, the account or the ID that way needs.", "Quien recibe quizá no tenga la app, la cuenta o la identificación que esa forma pide.")),
      choice(
        "send_ways",
        T("Which statement about ways to send money is true?", "¿Qué afirmación sobre las formas de enviar dinero es cierta?"),
        [T("Each way trades speed, cost, safety and reach", "Cada forma cambia rapidez, costo, seguridad y alcance"), T("The fastest way is always the cheapest", "La forma más rápida siempre es la más barata"), T("Cash pickup is always the safest", "Recoger efectivo siempre es lo más seguro")],
        0,
        T("No way wins on everything, so the fit matters.", "Ninguna forma gana en todo, así que importa que se ajuste."),
        [null, T("Speed often costs extra.", "La rapidez muchas veces cuesta más."), T("Cash can be lost or taken. Safety depends on the details.", "El efectivo se puede perder o robar. La seguridad depende de los detalles.")]
      )
    ),
    concept(
      "receive_ready",
      T("Receiving money", "Recibir dinero"),
      card(
        T("What the receiver needs", "Lo que necesita quien recibe"),
        T(
          "To collect cash, the receiver usually shows an official photo ID and the reference number from the sender. For a deposit, the account details must be exact. The sender usually pays the fees, so ask whether the pickup place adds any.",
          "Para cobrar en efectivo, quien recibe suele mostrar una identificación oficial con foto y el número de referencia que da quien envía. Para un depósito, los datos de la cuenta deben ser exactos. Quien envía suele pagar las comisiones; pregunta si el lugar de pago cobra alguna."
        )
      ),
      tf("receive_ready", T("The receiver can usually collect cash with only the reference number.", "Quien recibe por lo general puede cobrar en efectivo solo con el número de referencia."), false, T("Pickup usually also asks for an official ID with a matching name.", "Para cobrar suelen pedir también una identificación oficial con el mismo nombre.")),
      choice(
        "receive_ready",
        T("The transfer says \"Lucy Ramírez\" but the ID says \"Lucía Ramírez Soto\". What helps?", "El envío dice \"Lucy Ramírez\" pero la identificación dice \"Lucía Ramírez Soto\". ¿Qué ayuda?"),
        [T("The sender asks the service to correct the name to match the ID", "Quien envía le pide al servicio que corrija el nombre para que coincida"), T("Lucía pays the clerk a little extra", "Lucía le paga algo extra al empleado"), T("Lucía tries again with a nickname", "Lucía lo intenta otra vez con un apodo")],
        0,
        T("Pickup compares the name on the transfer with the ID. They need to match.", "El pago compara el nombre del envío con la identificación. Deben coincidir."),
        [null, T("Extra payments don't fix a mismatch, and they can be a scam.", "Un pago extra no arregla la diferencia y puede ser una estafa."), T("A nickname makes the mismatch bigger.", "Un apodo hace más grande la diferencia.")]
      )
    ),
    concept(
      "send_safely",
      T("Sending safely", "Enviar con seguridad"),
      card(
        T("Rules that protect you", "Reglas que te protegen"),
        T(
          "Services ask for ID, set limits and keep records, more so on bigger amounts. Those rules also help stop fraud. A simple check works best: send only to people you know, and confirm any request by calling a number you already have.",
          "Los servicios piden identificación, ponen límites y guardan registros, más en montos grandes. Esas reglas también ayudan a frenar fraudes. Una revisión sencilla funciona mejor: envía solo a gente que conoces y confirma cualquier petición llamando a un número que ya tienes."
        )
      ),
      tf("send_safely", T("Paying a stranger a \"fee\" to unlock money they promised you is a common scam.", "Pagarle a un desconocido una \"comisión\" para liberar dinero que te prometió es una estafa común."), true, T("Real senders pay the fees. Anyone who asks you to pay first is a warning sign.", "Quien de verdad envía paga las comisiones. Que te pidan pagar primero es una señal de alerta.")),
      choice(
        "send_safely",
        T("A message from a new number says \"it's your cousin\" and asks for {US$400} today. What first?", "Un mensaje de un número nuevo dice \"soy tu primo\" y pide {US$400} hoy. ¿Qué haces primero?"),
        [T("Call your cousin on the number you already have", "Llamar a tu primo al número que ya tienes"), T("Send half now, the rest later", "Enviar la mitad ahora y el resto después"), T("Reply to the new number with questions", "Responder al número nuevo con preguntas")],
        0,
        T("Pressure and a new number are the pattern. A call to a known number settles it.", "La prisa y un número nuevo son el patrón. Una llamada a un número conocido lo aclara."),
        [null, T("Half is still {US$200} gone if it's a scam.", "La mitad son {US$200} perdidos si es una estafa."), T("The scammer answers your questions too. Use a number you trust.", "El estafador también responde preguntas. Usa un número de confianza.")]
      )
    ),
  ],
  lessons: [
    {
      id: "sending-1",
      title: T("What arrives is the score", "Lo que llega es lo que cuenta"),
      life: T("Before you send, ask: how many pesos will arrive, and how far is that from the fair rate?", "Antes de enviar, pregunta: ¿cuántos pesos van a llegar y qué tan lejos están de lo justo?"),
      steps: [
        card(
          T("Two apps, one family", "Dos apps, una familia"),
          T(
            "Marisol pays {US$300} in all to send money to her mother in Zacatecas. App X says no fee and gives {MX$17} per dollar. App Y charges {US$6} and gives {MX$17.5} on the rest. The news says the fair rate is {MX$18}.",
            "Marisol paga {US$300} en total para enviarle dinero a su mamá en Zacatecas. La app X dice sin comisión y da {MX$17} por dólar. La app Y cobra {US$6} y da {MX$17.5} por el resto. En las noticias, el tipo justo es {MX$18}."
          )
        ),
        choice(
          "total_cost",
          T("Which app puts more pesos in her mother's hands?", "¿Cuál app le deja más pesos en las manos a su mamá?"),
          [T("App X, with no fee", "La app X, sin comisión"), T("App Y, with the fee", "La app Y, con comisión"), T("They deliver the same", "Entregan lo mismo")],
          1,
          T("X: 300 × 17 = {MX$5100}. Y: 294 × 17.5 = {MX$5145}. Y delivers {MX$45} more.", "X: 300 × 17 = {MX$5100}. Y: 294 × 17.5 = {MX$5145}. Y entrega {MX$45} más."),
          [T("No fee, but its rate gives up more pesos than Y's fee does.", "Sin comisión, pero su tipo de cambio cede más pesos de los que cuesta la comisión de Y."), null, T("Work each one out. They differ by {MX$45}.", "Calcula cada una. Difieren en {MX$45}.")]
        ),
        card(
          T("The fair-rate yardstick", "La vara del tipo justo"),
          T(
            "The fair rate, also called the mid-market rate, is the one in the news. Multiply: {US$300} × 18 = {MX$5400}. That is the most that could arrive. The pesos missing are the real cost, fee and rate gap together.",
            "El tipo justo, o tipo de cambio medio del mercado, es el de las noticias. Multiplica: {US$300} × 18 = {MX$5400}. Eso es lo máximo que podría llegar. Los pesos que faltan son el costo real, comisión y diferencia juntas."
          )
        ),
        number(
          "total_cost",
          T("Against the fair {MX$5400}, how many pesos does App X cost Marisol?", "Frente a los {MX$5400} justos, ¿cuántos pesos le cuesta la app X a Marisol?"),
          { unit: "number", answer: 300, tol: 0.5 },
          [T("Fair amount: 300 × 18 = 5400 pesos.", "Monto justo: 300 × 18 = 5400 pesos."), T("5400 − 5100 = 300 pesos short.", "5400 − 5100 = 300 pesos de menos.")]
        ),
        tf("total_cost", T("If two services show the same fee, they cost you the same.", "Si dos servicios muestran la misma comisión, te cuestan lo mismo."), false, T("Their rates can differ, and the rate gap is part of the cost.", "Sus tipos de cambio pueden ser distintos, y esa diferencia es parte del costo.")),
        act("goals.remit", T("Slide the amount and watch what arrives from each service.", "Mueve el monto y mira lo que llega de cada servicio."))
      ]
    },
    {
      id: "sending-2",
      title: T("Comparing services", "Comparar servicios"),
      life: T("Compare two services at the same amount, on the same day, for the same pickup method.", "Compara dos servicios con el mismo monto, el mismo día y la misma forma de entrega."),
      steps: [
        card(
          T("Three screens, three prices", "Tres pantallas, tres precios"),
          T(
            "Before you pay, a service in the US must show you the exchange rate, the fees and the amount that will arrive. Rosa, in Houston, wants to send {US$200}. Three services show three different numbers. Which one do you read first?",
            "Antes de que pagues, un servicio en EE. UU. debe mostrarte el tipo de cambio, las comisiones y el monto que va a llegar. Rosa, en Houston, quiere enviar {US$200}. Tres servicios muestran tres números distintos. ¿Cuál lees primero?"
          )
        ),
        choice(
          "total_cost",
          T("Which line compares the services best?", "¿Qué renglón compara mejor los servicios?"),
          [T("The fee alone", "La comisión sola"), T("The amount that arrives", "El monto que llega"), T("The advertised rate alone", "El tipo de cambio anunciado solo")],
          1,
          T("The amount that arrives already has the fee and the rate gap built in.", "El monto que llega ya incluye la comisión y la diferencia del tipo de cambio."),
          [T("A low fee can hide a poor rate.", "Una comisión baja puede esconder un mal tipo de cambio."), null, T("A good-looking rate can come with a big fee.", "Un buen tipo de cambio puede venir con una comisión grande.")]
        ),
        card(
          T("An official yardstick", "Una vara oficial"),
          T(
            "Profeco, Mexico's consumer agency, publishes a free comparison of services that send money to Mexico. Compare the same amount, on the same day, with the same pickup method, or the numbers can't sit side by side.",
            "Profeco, la agencia de consumo de México, publica una comparación gratis de los servicios que envían dinero a México. Compara el mismo monto, el mismo día y la misma forma de entrega, o los números no se pueden poner lado a lado."
          )
        ),
        scenario(
          "total_cost",
          T("Two services look close on {US$200}. What do you check next?", "Dos servicios se ven parecidos con {US$200}. ¿Qué revisas después?"),
          [
            fit(T("The amount received for the same pickup method on both", "El monto recibido con la misma forma de entrega en ambos"), "good", T("Cash and deposit can price differently.", "El efectivo y el depósito pueden tener precios distintos.")),
            fit(T("Which has the cheaper fee", "Cuál tiene la comisión más barata"), "ok", T("Half the picture. The rate matters too.", "Es la mitad del cuadro. El tipo de cambio también cuenta.")),
            fit(T("Which has the nicer app", "Cuál tiene la app más bonita"), "poor", T("Looks don't change what arrives.", "La apariencia no cambia lo que llega."))
          ],
          T("Compare what arrives, same terms on both.", "Compara lo que llega, con las mismas condiciones en ambos.")
        ),
        order(
          "total_cost",
          T("Put these steps in order before you pay.", "Pon estos pasos en orden antes de pagar."),
          [T("Pick the amount and how it will be collected", "Elige el monto y cómo se va a cobrar"), T("Compare the amount that arrives across services", "Compara el monto que llega entre servicios"), T("Check the receiver's name and details", "Revisa el nombre y los datos de quien recibe"), T("Read the disclosure, then pay", "Lee la hoja de datos y luego paga")],
          T("You can't compare until the amount and method match.", "No puedes comparar hasta que el monto y la forma coincidan.")
        ),
        act("goals.remit", T("Try your own amount and see which service delivers more.", "Prueba tu propio monto y mira qué servicio entrega más."))
      ]
    },
    {
      id: "sending-3",
      title: T("Cash, bank, app or card", "Efectivo, banco, app o tarjeta"),
      life: T("Ask the person you send to how they would rather receive money, and why.", "Pregúntale a quien le envías cómo prefiere recibir el dinero, y por qué."),
      steps: [
        card(
          T("One sender, three needs", "Quien envía, tres necesidades"),
          T(
            "Tomás, in Fresno, sends money home to Chihuahua. His sister has a bank account. His grandmother has no account and no smartphone. A cousin lives far from any bank. Will one way of sending work for all three?",
            "Tomás, en Fresno, envía dinero a Chihuahua. Su hermana tiene cuenta de banco. Su abuela no tiene cuenta ni smartphone. Un primo vive lejos de cualquier banco. ¿Una sola forma de enviar sirve para los tres?"
          )
        ),
        choice(
          "send_ways",
          T("Which way reaches his grandmother most easily?", "¿Qué forma le llega más fácil a su abuela?"),
          [T("Cash pickup at a store she can walk to", "Cobrar en efectivo en una tienda a la que puede ir caminando"), T("A deposit to a bank account", "Un depósito a una cuenta de banco"), T("A transfer to a phone app", "Una transferencia a una app del celular")],
          0,
          T("She has no account and no phone, so cash pickup is the way that reaches her.", "No tiene cuenta ni celular, así que cobrar en efectivo es la forma que le llega."),
          [null, T("She has no account to receive it.", "No tiene una cuenta para recibirlo."), T("She has no smartphone to use an app.", "No tiene un smartphone para usar una app.")]
        ),
        card(
          T("Four things to weigh", "Cuatro cosas que sopesar"),
          T(
            "Speed: minutes or days. Cost: fee plus rate gap. Safety: can it be traced, and canceled? Reach: can the receiver actually collect it? A way that wins on cost but fails on reach doesn't help the family.",
            "Rapidez: minutos o días. Costo: comisión más diferencia del tipo de cambio. Seguridad: ¿se puede rastrear y cancelar? Alcance: ¿quien recibe de verdad lo puede cobrar? Una forma que gana en costo pero falla en alcance no ayuda a la familia."
          )
        ),
        match(
          "send_ways",
          T("Match each word to what it asks.", "Une cada palabra con lo que pregunta."),
          [
            [T("Speed", "Rapidez"), T("How soon the money can be used", "Qué tan pronto se puede usar el dinero")],
            [T("Safety", "Seguridad"), T("Records, tracing and canceling", "Registros, rastreo y cancelación")],
            [T("Reach", "Alcance"), T("Whether the receiver can collect it", "Si quien recibe lo puede cobrar")]
          ],
          T("Cost is the fourth. Weigh all four together.", "El costo es el cuarto. Sopésalos juntos.")
        ),
        tf("send_ways", T("A cheap transfer the receiver can't collect has saved money.", "Un envío barato que quien recibe no puede cobrar ahorró dinero."), false, T("Money that can't be collected, or comes late, hasn't helped, whatever the fee.", "El dinero que no se puede cobrar, o que llega tarde, no ayudó, sea cual sea la comisión.")),
        act("goals.remit", T("Change the amount and see how the costs shift between services.", "Cambia el monto y mira cómo se mueven los costos entre servicios."))
      ]
    },
    {
      id: "sending-4",
      title: T("Receiving money", "Recibir dinero"),
      life: T("If someone will send you money, ask what ID and reference number the pickup place needs.", "Si alguien va a enviarte dinero, pregunta qué identificación y qué número de referencia pide el lugar de pago."),
      steps: [
        card(
          T("The name on the paper", "El nombre en el papel"),
          T(
            "Lucía's uncle sends her money from Dallas. In Monterrey, she gives the pickup counter the reference number. The clerk says no. The transfer says \"Lucy Ramírez\". Her ID says \"Lucía Ramírez Soto\". What went wrong?",
            "El tío de Lucía le envía dinero desde Dallas. En Monterrey, ella da el número de referencia en la ventanilla. El empleado dice que no. El envío dice \"Lucy Ramírez\". Su identificación dice \"Lucía Ramírez Soto\". ¿Qué falló?"
          )
        ),
        choice(
          "receive_ready",
          T("What most likely fixes it?", "¿Qué lo arregla más probablemente?"),
          [T("The sender asks the service to correct the name", "Quien envía le pide al servicio que corrija el nombre"), T("Lucía pays the clerk a little extra", "Lucía le paga algo extra al empleado"), T("Lucía brings a friend with an ID", "Lucía lleva a un amigo con identificación")],
          0,
          T("Pickup compares the transfer's name with her ID, so the name must match.", "El pago compara el nombre del envío con su identificación, así que debe coincidir."),
          [null, T("Extra payments don't fix a mismatch.", "Un pago extra no arregla la diferencia."), T("The money is for Lucía, so only her ID counts.", "El dinero es para Lucía, así que solo cuenta su identificación.")]
        ),
        card(
          T("What receiving takes", "Lo que se necesita para recibir"),
          T(
            "For cash: the reference number, an official photo ID and a matching name. For a bank deposit: the exact account number, a CLABE in Mexico, or routing and account numbers in the US. Check for pickup fees before the sender pays.",
            "Para efectivo: el número de referencia, una identificación oficial con foto y el mismo nombre. Para un depósito: el número de cuenta exacto, una CLABE en México, o números de ruta y de cuenta en EE. UU. Revisa si hay comisión de pago antes de que quien envía pague."
          )
        ),
        match(
          "receive_ready",
          T("Match each item to its job.", "Une cada dato con su función."),
          [
            [T("Reference number", "Número de referencia"), T("Tells the pickup place which transfer to pay", "Le dice al lugar de pago qué envío pagar")],
            [T("Official ID", "Identificación oficial"), T("Shows the collector is the named person", "Muestra que quien cobra es la persona indicada")],
            [T("CLABE", "CLABE"), T("The 18-digit account number for deposits in Mexico", "El número de cuenta de 18 dígitos para depósitos en México")]
          ],
          T("Each one answers a different question for the clerk.", "Cada uno responde una pregunta distinta para quien atiende.")
        ),
        tf("receive_ready", T("The sender usually pays the transfer fees, but the pickup place may add its own.", "Quien envía suele pagar las comisiones, pero el lugar de pago puede agregar las suyas."), true, T("Ask both sides before sending, so nothing surprises the receiver.", "Pregunta en ambos lados antes de enviar, para que nada sorprenda a quien recibe.")),
        act("goals.remit", T("See what arrives for a few amounts, then compare it with what you'd expect.", "Mira lo que llega con varios montos y compáralo con lo que esperabas."))
      ]
    },
    {
      id: "sending-5",
      title: T("Limits, records and staying safe", "Límites, registros y seguridad"),
      life: T("Keep the receipt of every transfer until the money has arrived and the receiver has confirmed it.", "Guarda el comprobante de cada envío hasta que el dinero llegue y quien recibe lo confirme."),
      steps: [
        card(
          T("The unexpected questions", "Las preguntas inesperadas"),
          T(
            "Ana tries to send {US$3500} for her brother's tuition. The service asks for her ID, her address and why she's sending it. She wonders if she did something wrong. What is the service doing?",
            "Ana intenta enviar {US$3500} para la colegiatura de su hermano. El servicio le pide su identificación, su domicilio y para qué lo envía. Se pregunta si hizo algo mal. ¿Qué está haciendo el servicio?"
          )
        ),
        choice(
          "send_safely",
          T("Why did the service ask Ana so much?", "¿Por qué el servicio le preguntó tanto a Ana?"),
          [T("Bigger transfers get more checks, and it must keep records", "A los envíos grandes les hacen más revisiones y debe guardar registros"), T("It thinks she did something wrong", "Cree que ella hizo algo malo"), T("It wants her to pay extra", "Quiere que pague extra")],
          0,
          T("Asking and recording is routine on larger amounts. It isn't an accusation.", "Preguntar y registrar es rutina en montos grandes. No es una acusación."),
          [null, T("Questions are routine on bigger amounts, not a sign of suspicion.", "Las preguntas son rutina en montos grandes, no una sospecha."), T("Identity checks don't add to the price.", "Verificar la identidad no sube el precio.")]
        ),
        card(
          T("Why the rules exist", "Para qué son las reglas"),
          T(
            "In the US, money transmitters keep the sender's details for transfers of {@remitRecordUSD} or more, and services set their own limits. Splitting a transfer to avoid questions can look suspicious and sometimes breaks the law. Ask the service instead.",
            "En EE. UU., los servicios de envío guardan los datos de quien envía en transferencias de {@remitRecordUSD} o más, y cada servicio pone sus límites. Dividir un envío para evitar preguntas puede verse sospechoso y a veces es ilegal. Mejor pregunta al servicio."
          )
        ),
        tf("send_safely", T("Splitting one transfer into pieces to avoid questions is always harmless.", "Dividir un envío en pedazos para evitar preguntas siempre es inofensivo."), false, T("It can look suspicious and, in some cases, break the law. Ask the service about limits.", "Puede verse sospechoso y, en algunos casos, ser ilegal. Pregunta al servicio por sus límites.")),
        scenario(
          "send_safely",
          T("A new number says \"I'm your cousin, I lost my phone, send {US$400} now.\" What do you do?", "Un número nuevo dice \"soy tu primo, perdí mi celular, envía {US$400} ya\". ¿Qué haces?"),
          [
            fit(T("Call your cousin on the number you already have", "Llamas a tu primo al número que ya tienes"), "good", T("A known number settles it in a minute.", "Un número conocido lo aclara en un minuto.")),
            fit(T("Ask the new number a question only he'd know", "Le haces al número nuevo una pregunta que solo él sabría"), "ok", T("Better than nothing, but a scammer may know it.", "Mejor que nada, pero un estafador podría saberla.")),
            fit(T("Send it now, in case it's real", "Lo envías ya, por si es verdad"), "poor", T("Pressure to hurry is the scam's main tool.", "La prisa es la herramienta principal de la estafa."))
          ],
          T("Confirm through a channel the scammer doesn't control.", "Confirma por un canal que el estafador no controle.")
        ),
        act("goals.remit", T("Try a larger amount and watch how the fee and the rate gap change.", "Prueba un monto mayor y mira cómo cambian la comisión y la diferencia del tipo de cambio."))
      ]
    }
  ]
};
