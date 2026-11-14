// UNIT — Border scams. Its lessons and the concepts they teach (format in helpers.js).
// Written for life between the US and Mexico: amounts are always dollars or pesos. Names of agencies are for
// reporting and checking, never for buying anything. Needs a human review before it goes live.
import { T, card, choice, tf, act, concept, order, match, spot, tap, scenario, fit } from "./helpers.js";

export default {
  id: "borderscams",
  icon: "shield",
  title: T("Border scams", "Fraudes en la frontera"),
  concepts: [
    concept(
      "relative_scam",
      T("Fake relatives and emergencies", "Familiares falsos y emergencias"),
      card(
        T("Urgent and secret", "Urgente y en secreto"),
        T("A call or message says a relative is in trouble and needs money now, and you must tell no one. The relative is usually fine. Hang up, and call them on the number you already have.", "Una llamada o mensaje dice que un familiar está en problemas y necesita dinero ya, y que no le digas a nadie. Casi siempre el familiar está bien. Cuelga y llámale al número que ya tienes.")
      ),
      tf("relative_scam", T("If someone says a relative needs money right now, send it first and check later.", "Si alguien dice que un familiar necesita dinero ahora, envíalo primero y verifica después."), false, T("Scammers use panic. Check with the relative first, at a number you already know.", "Los estafadores usan el pánico. Verifica primero con el familiar, a un número que ya conozcas.")),
      choice(
        "relative_scam",
        T("A voice on the phone says, \"Grandma, it's me. I'm in trouble. Don't tell anyone.\" What's the best move?", "Una voz al teléfono dice: \"Abuela, soy yo. Estoy en problemas. No le digas a nadie\". ¿Qué es lo mejor?"),
        [T("Hang up and call your grandchild on the number you already have", "Colgar y llamar a tu nieto al número que ya tienes"), T("Ask the caller to prove it by guessing a name", "Pedirle a quien llama que lo pruebe adivinando un nombre"), T("Send money, then ask questions", "Enviar dinero y preguntar después")],
        0,
        T("A real call to a known number settles it in a minute.", "Una llamada real a un número conocido lo aclara en un minuto."),
        [null, T("Scammers learn names from social media. A name isn't proof.", "Los estafadores sacan los nombres de las redes sociales. Un nombre no es prueba."), T("Once the money is sent, it's almost never coming back.", "Una vez enviado, casi nunca se recupera el dinero.")]
      )
    ),
    concept(
      "fake_deals",
      T("Fake rates, fake jobs, fake offers", "Tipos de cambio, empleos y ofertas falsos"),
      card(
        T("Too good, too fast", "Demasiado bueno, demasiado rápido"),
        T("Border scams often promise a great exchange rate, easy work, a cheap rental or papers. The tell is pressure, payment up front, and payment in ways that can't be traced.", "Los fraudes en la frontera suelen prometer un tipo de cambio excelente, trabajo fácil, una renta barata o papeles. La señal es la presión, el pago por adelantado y los pagos que no se pueden rastrear.")
      ),
      tf("fake_deals", T("A rate much better than every bank's is a good sign.", "Un tipo de cambio mucho mejor que el de todos los bancos es buena señal."), false, T("If it beats the fair rate by a lot, ask what's the catch. Often there's one.", "Si supera por mucho el tipo justo, pregunta dónde está la trampa. Casi siempre hay una.")),
      choice(
        "fake_deals",
        T("An apartment ad shows a very low rent. The \"owner\" is abroad and wants a deposit by transfer before you see it. What now?", "Un anuncio de departamento muestra una renta muy baja. El \"dueño\" está en el extranjero y quiere un depósito por transferencia antes de que lo veas. ¿Qué haces?"),
        [T("Don't pay. See it in person, and check who really owns it", "No pagar. Verlo en persona y comprobar quién es el dueño de verdad"), T("Send the deposit to hold it", "Enviar el depósito para apartarlo"), T("Send half now", "Enviar la mitad ahora")],
        0,
        T("Seeing the place and checking the owner is the only way to know it's real.", "Ver el lugar y verificar al dueño es la única forma de saber que es real."),
        [null, T("A deposit sent before you see the place is a classic way to lose money.", "Un depósito antes de ver el lugar es una forma clásica de perder dinero."), T("Half a deposit to a stranger is still a loss.", "La mitad del depósito a un desconocido sigue siendo una pérdida.")]
      )
    ),
    concept(
      "fake_officials",
      T("Fake officials and fees", "Autoridades y cuotas falsas"),
      card(
        T("Agencies don't threaten by phone", "Las agencias no amenazan por teléfono"),
        T("Tax agencies, immigration and customs usually write to you, not call to demand money at once. If someone threatens arrest unless you pay today, or asks for gift cards or crypto, it's a scam.", "Las agencias de impuestos, migración y aduanas suelen escribirte, no llamar para exigir dinero de inmediato. Si alguien amenaza con arresto si no pagas hoy, o pide tarjetas de regalo o criptomonedas, es una estafa.")
      ),
      tf("fake_officials", T("A real tax agency may demand payment in gift cards over the phone.", "Una agencia de impuestos real puede exigir el pago en tarjetas de regalo por teléfono."), false, T("No real agency does this. Gift cards are only for scammers.", "Ninguna agencia real lo hace. Las tarjetas de regalo son solo para estafadores.")),
      choice(
        "fake_officials",
        T("A caller says they're from a tax agency and you owe money, or they'll send police today. What's the best response?", "Quien llama dice ser de una agencia de impuestos y que debes dinero, o enviará a la policía hoy. ¿Cuál es la mejor respuesta?"),
        [T("Hang up. Look up the agency's official number and ask", "Colgar. Buscar el número oficial de la agencia y preguntar"), T("Pay to make it go away", "Pagar para que se acabe"), T("Give your account number to \"verify\" it", "Dar tu número de cuenta para \"verificarlo\"")],
        0,
        T("A real debt can be checked by contacting the agency yourself, at the number on its official site.", "Una deuda real se comprueba contactando tú a la agencia, al número de su sitio oficial."),
        [null, T("Paying a scammer doesn't end it. They come back for more.", "Pagarle a un estafador no lo termina. Regresan por más."), T("Never give account numbers to someone who called you.", "Nunca des números de cuenta a quien te llamó.")]
      )
    ),
    concept(
      "report_scam",
      T("Reporting a scam", "Reportar un fraude"),
      card(
        T("Report it, fast", "Repórtalo, rápido"),
        T("Tell your bank or the service you paid right away. Then report to the authorities: in the US the FTC and CFPB, in Mexico CONDUSEF, Profeco or the police. Keep screenshots and receipts.", "Avisa cuanto antes a tu banco o al servicio con el que pagaste. Luego reporta a las autoridades: en EE. UU. la FTC y la CFPB, en México CONDUSEF, Profeco o la policía. Guarda capturas y comprobantes.")
      ),
      tf("report_scam", T("Reporting a scam is pointless because nothing happens.", "Reportar un fraude no sirve porque no pasa nada."), false, T("Fast reports can stop a payment, and many reports help authorities spot patterns.", "Un reporte rápido puede frenar un pago, y muchos reportes ayudan a las autoridades a detectar patrones.")),
      choice(
        "report_scam",
        T("You sent money to a scammer an hour ago. What do you do first?", "Enviaste dinero a un estafador hace una hora. ¿Qué haces primero?"),
        [T("Contact your bank or the service right away and ask if it can be stopped", "Contactar de inmediato a tu banco o al servicio y preguntar si se puede detener"), T("Wait a week to see what happens", "Esperar una semana a ver qué pasa"), T("Feel embarrassed and say nothing", "Sentir vergüenza y no decir nada")],
        0,
        T("Time matters. The sooner they know, the more they can sometimes do.", "El tiempo importa. Mientras antes lo sepan, más pueden hacer a veces."),
        [null, T("Waiting makes it harder to stop the payment.", "Esperar hace más difícil detener el pago."), T("Scams happen to smart people. Telling someone is the first step to fixing it.", "Los fraudes le pasan a gente lista. Contarlo es el primer paso para arreglarlo.")]
      )
    ),
  ],
  lessons: [
    {
      id: "borderscams-1",
      title: T("Fake relatives and \"emergency\" transfers", "Familiares falsos y envíos de \"emergencia\""),
      life: T("Pick a family code word that only your family knows, and tell it to the people who might get that call.", "Elige una palabra clave familiar que solo tu familia conozca y díselas a quienes podrían recibir esa llamada."),
      steps: [
        card(T("The call that rushes you", "La llamada que te apura"), T("In one version, a \"relative\" says they're in trouble. In another, a caller says a relative has been kidnapped, while the real person is fine. Both want you scared and paying, fast.", "En una versión, un \"familiar\" dice que está en problemas. En otra, quien llama dice que secuestraron a un familiar, cuando la persona real está bien. Las dos quieren que tengas miedo y pagues rápido.")),
        spot(
          "relative_scam",
          T("A text arrives from a new number. Tap the 2 red flags.", "Llega un mensaje de un número nuevo. Toca las 2 señales de alerta."),
          "sms",
          T("Text message · +1 (555) 013-9920", "Mensaje de texto · 55 9920 1133"),
          [
            tap(T("Mom, my phone broke, this is my new number.", "Mamá, se me rompió el teléfono, este es mi número nuevo.")),
            T(" I need ", " Necesito que me "),
            tap(T("{US$300} sent right now", "envíes {US$300} ahorita"), true),
            T(" for a bill. ", " para una cuenta. "),
            tap(T("Don't call me, and don't tell Dad.", "No me llames y no le digas a papá."), true),
          ],
          T("Money right now and \"don't call\" are the two signs: the point is to stop you from checking. The new number itself isn't proof either way.", "Dinero ya y \"no me llames\" son las dos señales: la idea es que no compruebes. El número nuevo por sí solo no prueba nada.")
        ),
        scenario(
          "relative_scam",
          T("A caller says your cousin was kidnapped and demands {MX$20000} now. What do you do?", "Quien llama dice que secuestraron a tu primo y exige {MX$20000} ahora. ¿Qué haces?"),
          [
            fit(T("Hang up, call your cousin and the family, and report the call", "Colgar, llamar a tu primo y a la familia, y reportar la llamada"), "good", T("Most of these calls are fake. Checking takes a minute.", "La mayoría de estas llamadas son falsas. Comprobar toma un minuto.")),
            fit(T("Stay on the line and send the money", "Quedarte en la línea y enviar el dinero"), "poor", T("Staying on the line keeps you from checking, which is the plan.", "Quedarte en la línea te impide comprobar, y ese es el plan.")),
            fit(T("Ask the caller for proof, still on the line", "Pedirle pruebas a quien llama, sin colgar"), "ok", T("Better than paying, but hanging up to check is safer.", "Mejor que pagar, pero colgar para comprobar es más seguro.")),
          ],
          T("Hang up, check, then decide. The call is designed to stop you from checking.", "Cuelga, comprueba y luego decide. La llamada está diseñada para que no compruebes.")
        ),
        tf("relative_scam", T("A family code word can help tell a real relative from a scammer.", "Una palabra clave familiar puede ayudar a distinguir a un familiar real de un estafador."), true, T("Pick one that isn't on social media, and change it if it leaks.", "Elige una que no esté en redes sociales, y cámbiala si se filtra.")),
        card(T("Pause is the shield", "La pausa es el escudo"), T("Scams run on speed and secrecy. Any message that says \"now\" and \"tell no one\" deserves a pause and a call to someone you trust.", "Las estafas funcionan con prisa y secreto. Todo mensaje que diga \"ahora\" y \"no le digas a nadie\" merece una pausa y una llamada a alguien de confianza.")),
        act("goals.scam", T("Look at an emergency message and find what gives it away.", "Mira un mensaje de emergencia y encuentra qué lo delata.")),
      ],
    },
    {
      id: "borderscams-2",
      title: T("Fake exchange, fake rates, fake jobs", "Cambios, tipos de cambio y empleos falsos"),
      life: T("Before you send money for an offer you found online, ask one person you trust what they think.", "Antes de enviar dinero por una oferta que viste en línea, pregunta a una persona de confianza qué opina."),
      steps: [
        card(T("Offers that skip the usual steps", "Ofertas que se saltan los pasos normales"), T("Scams at the border often use real needs: exchanging money, finding a job, renting a place, or fixing papers. They push you to pay first, by a way that can't be undone.", "Las estafas en la frontera suelen usar necesidades reales: cambiar dinero, encontrar empleo, rentar un lugar o arreglar papeles. Te presionan a pagar primero, por una vía que no se puede deshacer.")),
        match(
          "fake_deals",
          T("Match each offer to its warning sign.", "Une cada oferta con su señal de alerta."),
          [
            [T("Exchange at a rate far better than banks", "Cambio a un tipo muy superior al de los bancos"), T("If it beats the fair rate by a lot, ask why", "Si supera por mucho el tipo justo, pregunta por qué")],
            [T("Job that needs a fee first", "Empleo que pide una cuota antes"), T("Real employers don't charge to hire you", "Los empleadores reales no cobran por contratarte")],
            [T("\"Owner\" who can't show the place", "\"Dueño\" que no puede mostrar el lugar"), T("Deposits before seeing it are a trap", "Depósitos antes de verlo son una trampa")],
          ],
          T("The offer changes, but the pattern is the same: pay first, check never.", "La oferta cambia, pero el patrón es el mismo: pagar primero, nunca comprobar.")
        ),
        choice(
          "fake_deals",
          T("Someone offers to change {US$500} at a rate much better than banks, but only if you meet in a parking lot. What's wise?", "Alguien ofrece cambiar {US$500} a un tipo mucho mejor que los bancos, pero solo si se ven en un estacionamiento. ¿Qué es sensato?"),
          [T("Say no and use a bank or a known exchange house", "Decir que no y usar un banco o una casa de cambio conocida"), T("Go, but bring a friend", "Ir, pero llevar a un amigo"), T("Go quickly before the rate changes", "Ir rápido antes de que cambie el tipo de cambio")],
          0,
          T("A bank or known exchange house costs a little more but protects you from theft and counterfeit bills.", "Un banco o una casa de cambio conocida cuesta un poco más pero te protege de robos y billetes falsos."),
          [null, T("A friend helps, but the risk of theft and fake bills remains.", "Un amigo ayuda, pero el riesgo de robo y billetes falsos sigue."), T("Hurry is the scammer's tool.", "La prisa es la herramienta del estafador.")]
        ),
        tf("fake_deals", T("A real employer asks you to pay for training or papers before hiring you.", "Un empleador real te pide pagar capacitación o papeles antes de contratarte."), false, T("Real employers pay you. Asking you to pay first is a red flag.", "Los empleadores reales te pagan a ti. Pedirte que pagues primero es señal de alerta.")),
        card(T("Check the other side", "Revisa al otro lado"), T("Look up the business in an official registry, search its name with \"scam\", and ask someone who knows the area. Five minutes can save months of savings.", "Busca el negocio en un registro oficial, busca su nombre con la palabra \"fraude\" y pregunta a alguien que conozca la zona. Cinco minutos pueden salvar meses de ahorro.")),
        act("goals.scam", T("Look at an offer and find what gives it away.", "Mira una oferta y encuentra qué la delata.")),
      ],
    },
    {
      id: "borderscams-3",
      title: T("Fake officials and fake fees", "Autoridades falsas y cuotas falsas"),
      life: T("Write down the official website of the tax agency in each country, so you can check any call or letter.", "Anota el sitio oficial de la agencia de impuestos de cada país, para verificar cualquier llamada o carta."),
      steps: [
        card(T("Pretending to be the government", "Fingir ser el gobierno"), T("Scammers pose as tax, immigration or customs officers. They threaten arrest, deportation or fines, and ask for payment by gift card, crypto or transfer. Real agencies don't work that way.", "Los estafadores se hacen pasar por agentes de impuestos, migración o aduanas. Amenazan con arresto, deportación o multas y piden pago con tarjetas de regalo, criptomonedas o transferencias. Las agencias reales no trabajan así.")),
        spot(
          "fake_officials",
          T("Read this call summary. Tap the 2 red flags.", "Lee este resumen de llamada. Toca las 2 señales de alerta."),
          "sms",
          T("Voicemail · Unknown number", "Buzón de voz · Número desconocido"),
          [
            tap(T("This is the tax office.", "Habla la oficina de impuestos.")),
            T(" You owe money. ", " Debes dinero. "),
            tap(T("Pay within one hour with gift cards", "Paga en una hora con tarjetas de regalo"), true),
            T(" or ", " o "),
            tap(T("police will come to your door.", "la policía irá a tu casa."), true),
          ],
          T("A one-hour deadline, gift cards and threats of arrest are three signs of a scam. A real notice comes in writing and lets you respond.", "Un plazo de una hora, tarjetas de regalo y amenazas de arresto son tres señales de estafa. Un aviso real llega por escrito y te deja responder.")
        ),
        order(
          "fake_officials",
          T("Put the steps in order when an \"officer\" calls.", "Pon los pasos en orden cuando llama un \"agente\"."),
          [T("Stay calm and don't give any numbers", "Mantener la calma y no dar ningún número"), T("Hang up", "Colgar"), T("Look up the agency's official number", "Buscar el número oficial de la agencia"), T("Call and ask if there's a real notice", "Llamar y preguntar si hay un aviso real")],
          T("Each step puts you in control: you call them, not the other way around.", "Cada paso te pone al mando: tú los llamas, no al revés.")
        ),
        tf("fake_officials", T("It's safe to give a caller your account number if they say they're from the government.", "Es seguro darle tu número de cuenta a quien llama si dice ser del gobierno."), false, T("Never give personal or account numbers to someone who contacts you first.", "Nunca des números personales o de cuenta a quien te contacta primero.")),
        card(T("Official fees are paid officially", "Las cuotas oficiales se pagan oficialmente"), T("Real fees are paid at official offices or on official websites, not to a person's account or in gift cards. If you aren't sure, ask the office directly.", "Las cuotas reales se pagan en oficinas oficiales o en sitios oficiales, no en la cuenta de una persona ni con tarjetas de regalo. Si no estás seguro, pregunta directamente a la oficina.")),
        act("goals.scam", T("Look at a message from an \"official\" and find what gives it away.", "Mira un mensaje de una \"autoridad\" y encuentra qué lo delata.")),
      ],
    },
    {
      id: "borderscams-4",
      title: T("Where to report", "Dónde reportar"),
      life: T("Save the contact page of your bank and the reporting sites in your phone, so you can act fast if you ever need to.", "Guarda en tu teléfono la página de contacto de tu banco y los sitios para reportar, para actuar rápido si algún día lo necesitas."),
      steps: [
        card(T("Quick, then official", "Primero rápido, luego oficial"), T("First, call your bank or the service you paid. Then report: the FTC and CFPB in the US, CONDUSEF, Profeco or the police in Mexico. Save screenshots, numbers and receipts.", "Primero, llama a tu banco o al servicio con el que pagaste. Luego reporta: la FTC y la CFPB en EE. UU., CONDUSEF, Profeco o la policía en México. Guarda capturas, números y comprobantes.")),
        order(
          "report_scam",
          T("Put the steps in order after a scam.", "Pon los pasos en orden después de un fraude."),
          [T("Contact your bank or the service right away", "Contactar de inmediato a tu banco o al servicio"), T("Save screenshots, numbers and receipts", "Guardar capturas, números y comprobantes"), T("Report to the official agencies", "Reportar a las agencias oficiales"), T("Warn family and friends", "Avisar a familia y amigos")],
          T("Speed first, then proof, then reports, then warning others.", "Primero la rapidez, luego las pruebas, luego los reportes y después avisar a otros.")
        ),
        match(
          "report_scam",
          T("Match each place to where it helps.", "Une cada lugar con dónde ayuda."),
          [
            [T("FTC and CFPB", "FTC y CFPB"), T("Reports and complaints in the US", "Reportes y quejas en EE. UU.")],
            [T("CONDUSEF and Profeco", "CONDUSEF y Profeco"), T("Complaints about banks and sellers in Mexico", "Quejas sobre bancos y vendedores en México")],
            [T("Your bank", "Tu banco"), T("The first call, to try to stop a payment", "La primera llamada, para intentar frenar un pago")],
          ],
          T("Each one covers part of the problem. Start with your bank, because time matters.", "Cada uno cubre una parte del problema. Empieza con tu banco, porque el tiempo importa.")
        ),
        scenario(
          "report_scam",
          T("You were scammed out of {US$200} and feel embarrassed. What's best?", "Te estafaron {US$200} y sientes vergüenza. ¿Qué es lo mejor?"),
          [
            fit(T("Report it quickly and tell someone you trust", "Reportarlo rápido y contárselo a alguien de confianza"), "good", T("Reporting can sometimes stop a payment, and telling someone protects others.", "Reportar a veces puede frenar un pago, y contarlo protege a otros.")),
            fit(T("Keep quiet so nobody finds out", "Callarte para que nadie se entere"), "poor", T("Silence helps only the scammer.", "El silencio solo ayuda al estafador.")),
            fit(T("Try to get it back from the scammer yourself", "Intentar recuperarlo tú mismo con el estafador"), "poor", T("It can lead to more losses or danger.", "Puede llevar a más pérdidas o a peligro.")),
          ],
          T("Fast and open beats quiet. Scams happen to careful people.", "Rápido y abierto vale más que callado. Los fraudes le pasan a gente cuidadosa.")
        ),
        card(T("You help others by reporting", "Ayudas a otros al reportar"), T("Reports let agencies find patterns and warn people. Even if you can't get the money back, yours may protect the next person.", "Los reportes permiten a las agencias encontrar patrones y avisar a la gente. Aunque no recuperes el dinero, el tuyo puede proteger a la siguiente persona.")),
        act("goals.scam", T("Practice spotting a scam before it costs you.", "Practica detectar un fraude antes de que te cueste.")),
      ],
    },
  ],
};
