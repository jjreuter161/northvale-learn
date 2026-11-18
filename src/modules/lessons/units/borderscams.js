// UNIT — Border scams (Wave 1, Life Across Borders, Build; Border).
// DRAFT: not in the app until a reviewer signs it off. To ship it, follow the steps at the top of
// sending.js. The practice sets "family" and "official" for goals.scam live in goals/life.jsx.
// Mission to add then: "Write your family's rule for money requests: one sentence everyone agrees
// on, like \"we always call back on a number we already have\"". Reflection: "Who did you agree it with?"
// Tone rule: no wit on scams. Border units write both countries at once ({US$…}, {MX$…}).
// The people and amounts are made up. No real company, agency worker or phone number (except the
// official reporting channels named in the facts) appears.
import { T, card, choice, tf, act, concept, order, match, number, scenario, fit } from "./helpers.js";

export default {
  id: "borderscams",
  icon: "shield",
  draft: true,
  title: T("Border scams", "Fraudes en la frontera"),
  sources: [
    // "Read" = the page was opened. "Seen" = a search summary of the page; a reviewer opens each.
    { name: "FTC, \"Job scams\" (read): never pay to get a job; the fake-check overpayment scam; payment methods scammers ask for", url: "https://consumer.ftc.gov/articles/job-scams", checked: "2026-11-17" },
    { name: "FTC, \"How to avoid a government impersonator scam\" (read): no agency demands gift cards, wires, crypto or a payment app, or threatens arrest; hang up and call a number you know", url: "https://consumer.ftc.gov/articles/how-avoid-government-impersonator-scam", checked: "2026-11-17" },
    { name: "FTC consumer alerts on family emergency scams (seen): call a number you already have; secrecy and rush; gift cards, wires, cash and crypto; cloned voices", url: "https://consumer.ftc.gov/consumer-alerts/2021/06/dont-send-them-money", checked: "2026-11-17" },
    { name: "CFPB, \"Who do I contact for help with a scam or fraud?\" (read): FBI IC3, FTC, state attorney general, local police", url: "https://www.consumerfinance.gov/ask-cfpb/i-think-i-or-someone-i-know-was-the-victim-of-a-scam-or-financial-exploitation-who-can-i-contact-for-help-en-1777/", checked: "2026-11-17" },
    { name: "Guardia Nacional (CERT-MX), 088 Atención Ciudadana (read): guidance for reporting a cybercrime; the report is secure and confidential", url: "https://www.gob.mx/gncertmx/articulos/en-caso-de-ser-victima-de-algun-ciberdelito-llama-al-088-atencion-ciudadana", checked: "2026-11-17" },
  ],
  concepts: [
    concept(
      "fake_relative",
      T("The family emergency script", "El guion de la emergencia familiar"),
      card(
        T("Trouble, rush, secrecy", "Problema, prisa, secreto"),
        T(
          "Someone you love is in trouble, there's no time, and you must tell no one. The money goes by gift card, transfer or crypto. A familiar voice or the right names prove nothing. Hang up and call back on a number you already have.",
          "Alguien a quien quieres está en problemas, no hay tiempo y no debes decirle a nadie. El dinero va por tarjeta de regalo, transferencia o criptomoneda. Una voz conocida o los nombres correctos no prueban nada. Cuelga y llama de vuelta a un número que ya tienes."
        )
      ),
      tf("fake_relative", T("If the voice sounds like your relative, it must be them.", "Si la voz suena como tu familiar, tiene que ser él o ella."), false, T("Voices can be copied. Confirm another way.", "Las voces se pueden copiar. Confirma de otra forma.")),
      choice(
        "fake_relative",
        T("Which is the clearest sign that a \"family emergency\" is a scam?", "¿Cuál es la señal más clara de que una \"emergencia familiar\" es una estafa?"),
        [T("It demands secrecy and instant payment by gift card or transfer", "Exige secreto y pago inmediato con tarjeta de regalo o transferencia"), T("It arrives at night", "Llega de noche"), T("It uses your first name", "Usa tu nombre de pila")],
        0,
        T("Secrecy plus a rush plus hard-to-trace payment is the script.", "Secreto, prisa y un pago difícil de rastrear son el guion."),
        [null, T("Real emergencies also happen at night.", "Las emergencias reales también ocurren de noche."), T("Names are easy to find, so using one proves nothing.", "Los nombres son fáciles de encontrar, así que usar uno no prueba nada.")]
      )
    ),
    concept(
      "fake_deals",
      T("Pay first, or send back", "Pagar primero o devolver"),
      card(
        T("The money goes out first", "El dinero sale primero"),
        T(
          "Fake rates, fake jobs and fake checks all ask you to send money before anything arrives. A real exchange service shows its rate and fee and is registered. A real employer never asks you to pay to get hired.",
          "Los tipos de cambio falsos, los empleos falsos y los cheques falsos piden que envíes dinero antes de que llegue algo. Un servicio de cambio real muestra su tipo de cambio y comisión y está registrado. Un empleador real nunca te pide pagar para contratarte."
        )
      ),
      tf("fake_deals", T("A real employer may ask you to pay a fee to get hired.", "Un empleador real puede pedirte una cuota para contratarte."), false, T("The FTC says honest employers never ask you to pay to get a job.", "La FTC dice que los empleadores honestos nunca te piden pagar para conseguir un empleo.")),
      choice(
        "fake_deals",
        T("A job offer sends you a check and asks you to send part of it back. What is it?", "Una oferta de empleo te manda un cheque y te pide devolver una parte. ¿Qué es?"),
        [T("A scam: the check bounces and you owe the bank", "Una estafa: el cheque rebota y le debes al banco"), T("A normal advance", "Un adelanto normal"), T("A bank error", "Un error del banco")],
        0,
        T("The check is fake. The money you sent is real, and the bank wants its money back.", "El cheque es falso. El dinero que enviaste es real, y el banco quiere que se lo devuelvas."),
        [null, T("Real employers don't ask you to send money back.", "Los empleadores reales no te piden devolver dinero."), T("Nothing is wrong with the bank. The check is the problem.", "El banco no se equivocó. El problema es el cheque.")]
      )
    ),
    concept(
      "fake_officials",
      T("Fake officials and fake fees", "Falsos oficiales y falsas cuotas"),
      card(
        T("Officials don't demand", "Los oficiales no exigen"),
        T(
          "No government agency demands payment by gift card, wire, cryptocurrency or payment app, or threatens you to pay at once. A caller who does is not an official. Hang up and contact the agency at a number you found yourself.",
          "Ninguna agencia de gobierno exige pagos con tarjetas de regalo, transferencias, criptomonedas o apps de pago, ni te amenaza para que pagues de inmediato. Quien lo hace no es un oficial. Cuelga y contacta a la agencia en un número que encontraste tú."
        )
      ),
      tf("fake_officials", T("A real agency may demand payment in gift cards.", "Una agencia real puede exigir pago con tarjetas de regalo."), false, T("No government agency demands gift cards, wires, crypto or payment apps.", "Ninguna agencia de gobierno exige tarjetas de regalo, transferencias, criptomonedas ni apps de pago.")),
      choice(
        "fake_officials",
        T("A caller says he's from a government agency and demands a gift-card payment. What now?", "Alguien dice ser de una agencia de gobierno y exige un pago con tarjetas de regalo. ¿Qué haces?"),
        [T("Hang up and call the agency on a number you looked up", "Colgar y llamar a la agencia a un número que buscaste"), T("Pay, since it's an agency", "Pagar, porque es una agencia"), T("Give your card number to check the debt", "Dar tu número de tarjeta para revisar la deuda")],
        0,
        T("A number you found yourself reaches the real agency.", "Un número que encontraste tú llega a la agencia real."),
        [null, T("Real agencies don't ask for gift cards.", "Las agencias reales no piden tarjetas de regalo."), T("That hands your card to the scammer.", "Eso le entrega tu tarjeta al estafador.")]
      )
    ),
    concept(
      "report_it",
      T("Reporting a scam", "Reportar una estafa"),
      card(
        T("Act fast, then report", "Actúa rápido y luego reporta"),
        T(
          "If you paid a scammer, contact the company you used to send the money right away and ask to reverse it. Then report the scam. Anyone can be caught by one. Reporting isn't an admission of fault.",
          "Si le pagaste a un estafador, contacta de inmediato a la empresa con la que enviaste el dinero y pide revertirlo. Luego reporta la estafa. A cualquiera lo puede atrapar una. Reportar no es admitir culpa."
        )
      ),
      tf("report_it", T("If you paid a scammer, the first call is to the company you used to send the money.", "Si le pagaste a un estafador, la primera llamada es a la empresa con la que enviaste el dinero."), true, T("The FTC says to contact it immediately and ask to reverse the transaction.", "La FTC dice que la contactes de inmediato y pidas revertir la operación.")),
      choice(
        "report_it",
        T("You sent money to a scammer by bank transfer an hour ago. What first?", "Enviaste dinero a un estafador por transferencia hace una hora. ¿Qué haces primero?"),
        [T("Contact your bank right away, then report the scam", "Contactar a tu banco de inmediato y luego reportar la estafa"), T("Wait to see if they answer", "Esperar a ver si responden"), T("Send more to fix it", "Enviar más para arreglarlo")],
        0,
        T("The sooner the bank hears, the better the chance to stop or reverse it.", "Entre antes sepa el banco, más posibilidades hay de frenarlo o revertirlo."),
        [null, T("Waiting gives the scammer time to move the money.", "Esperar le da tiempo al estafador para mover el dinero."), T("Sending more is what scammers hope for.", "Enviar más es lo que esperan los estafadores.")]
      )
    )
  ],
  lessons: [
    {
      id: "borderscams-1",
      title: T("Fake relatives and \"emergency\" transfers", "Falsos familiares y transferencias de \"emergencia\""),
      life: T("Agree with your family on one rule: any request for money gets a call back on a number you already have.", "Acuerda con tu familia una regla: toda petición de dinero se confirma llamando a un número que ya tienes."),
      steps: [
        card(
          T("The call at 11 p.m.", "La llamada de las 11 de la noche"),
          T(
            "A call comes at night. The voice sounds like your uncle, crying: \"I've been arrested near the border. Don't tell anyone.\" A \"lawyer\" takes the phone and asks for {US$2000} today, by transfer. Your uncle is far away. Is that really him?",
            "Llega una llamada de noche. La voz suena como tu tío, llorando: \"Me arrestaron cerca de la frontera. No le digas a nadie.\" Un \"abogado\" toma el teléfono y pide {US$2000} hoy, por transferencia. Tu tío está lejos. ¿De verdad es él?"
          )
        ),
        choice(
          "fake_relative",
          T("The voice sounds exactly like your uncle. Is that proof?", "La voz suena exactamente como tu tío. ¿Es una prueba?"),
          [T("No. Voices can be copied, so confirm another way", "No. Las voces se pueden copiar, así que confirma de otra forma"), T("Yes. You know his voice", "Sí. Conoces su voz"), T("Only if the caller knows your name", "Solo si quien llama sabe tu nombre")],
          0,
          T("The FTC warns that scammers can clone a voice, so a familiar voice proves nothing.", "La FTC advierte que los estafadores pueden clonar una voz, así que una voz conocida no prueba nada."),
          [null, T("Knowing a voice used to be enough. It isn't now.", "Conocer una voz antes bastaba. Ahora no."), T("Names are easy to find, so they prove nothing.", "Los nombres son fáciles de encontrar, así que no prueban nada.")]
        ),
        card(
          T("The same script every time", "El mismo guion cada vez"),
          T(
            "Family emergency scams follow a script: someone you love is in trouble, there's no time, and you must stay quiet. They ask for gift cards, transfers or crypto. The fix is simple: hang up, then call your relative, or another relative, on a number you already have.",
            "Las estafas de emergencia familiar siguen un guion: alguien que quieres está en problemas, no hay tiempo y debes callar. Piden tarjetas de regalo, transferencias o criptomonedas. La solución es sencilla: cuelga y llama a tu familiar, o a otro, a un número que ya tienes."
          )
        ),
        scenario(
          "fake_relative",
          T("The \"lawyer\" insists on {US$2000} by transfer today. What do you do?", "El \"abogado\" insiste en {US$2000} por transferencia hoy. ¿Qué haces?"),
          [
            fit(T("Hang up and call your uncle and another relative on numbers you already have", "Cuelgas y llamas a tu tío y a otro familiar a números que ya tienes"), "good", T("Two known numbers settle it in minutes.", "Dos números conocidos lo aclaran en minutos.")),
            fit(T("Ask the \"lawyer\" for a case number first", "Le pides primero al \"abogado\" un número de caso"), "ok", T("It buys time, but he can invent one.", "Gana tiempo, pero él puede inventar uno.")),
            fit(T("Send it now and sort it out later", "Lo envías ya y lo arreglas después"), "poor", T("Transfers are hard to get back.", "Las transferencias son difíciles de recuperar."))
          ],
          T("Check with people you can reach on known numbers.", "Confirma con personas a las que localizas en números conocidos.")
        ),
        tf("fake_relative", T("A caller who knows your name and your uncle's name must be a real lawyer.", "Quien llama y sabe tu nombre y el de tu tío debe ser un abogado de verdad."), false, T("Names are easy to find, so knowing them proves nothing.", "Los nombres son fáciles de encontrar, así que saberlos no prueba nada.")),
        act("goals.scam", T("Tap the red flags in this message.", "Toca las señales de alerta en este mensaje."), { set: "family" })
      ]
    },
    {
      id: "borderscams-2",
      title: T("Fake rates and fake jobs", "Tipos de cambio y empleos falsos"),
      life: T("Before you send money to get a rate or a job, ask: who gets paid first, and would a real one ask that?", "Antes de enviar dinero para un tipo de cambio o un empleo, pregunta: ¿quién cobra primero y lo pediría uno real?"),
      steps: [
        card(
          T("Too good to be true", "Demasiado bueno para ser cierto"),
          T(
            "A post offers {MX$19.5} per dollar when the fair rate is {MX$18}: send dollars to a personal account. Another offers a job in Texas if you first pay {US$300} for training. Both ask you to send money before anything arrives.",
            "Una publicación ofrece {MX$19.5} por dólar cuando el tipo justo es {MX$18}: manda dólares a una cuenta personal. Otra ofrece un empleo en Texas si primero pagas {US$300} de capacitación. Las dos piden que envíes dinero antes de que llegue algo."
          )
        ),
        number(
          "fake_deals",
          T("At {MX$19.5} instead of {MX$18}, how many extra pesos would {US$1000} bring?", "A {MX$19.5} en lugar de {MX$18}, ¿cuántos pesos extra traerían {US$1000}?"),
          { unit: "number", answer: 1500, tol: 0.5 },
          [T("Extra per dollar: 19.5 − 18 = 1.5 pesos.", "Extra por dólar: 19.5 − 18 = 1.5 pesos."), T("1000 × 1.5 = 1500 pesos.", "1000 × 1.5 = 1500 pesos.")]
        ),
        card(
          T("The fake check", "El cheque falso"),
          T(
            "A common job scam sends a check and asks you to deposit it and send part back. The check bounces later, and the bank wants its money back from you. The FTC says honest employers never ask you to pay to get a job.",
            "Una estafa de empleo común manda un cheque y te pide depositarlo y devolver una parte. El cheque rebota después y el banco te pide el dinero a ti. La FTC dice que los empleadores honestos nunca te piden pagar para conseguir un empleo."
          )
        ),
        tf("fake_deals", T("If a deposited check shows up in your account, it's safe to send money back.", "Si un cheque depositado aparece en tu cuenta, es seguro devolver dinero."), false, T("A fake check can look fine at first. The bank can take the money back later.", "Un cheque falso puede verse bien al principio. El banco puede quitarte el dinero después.")),
        match(
          "fake_deals",
          T("Match each offer to what it really is.", "Une cada oferta con lo que realmente es."),
          [
            [T("Pay for training to get hired", "Pagar capacitación para que te contraten"), T("A fee for a job: a warning sign", "Una cuota por un empleo: señal de alerta")],
            [T("Deposit a check, send some back", "Depositar un cheque y devolver una parte"), T("The fake-check scam", "La estafa del cheque falso")],
            [T("A rate far above the fair one", "Un tipo de cambio muy por encima del justo"), T("A rate no real service could afford", "Un tipo que ningún servicio real podría ofrecer")]
          ],
          T("In each one, your money leaves first.", "En cada una, tu dinero sale primero.")
        ),
        act("goals.remit", T("Slide the amount and see what a real rate gap costs.", "Mueve el monto y mira cuánto cuesta una diferencia real en el tipo de cambio."))
      ]
    },
    {
      id: "borderscams-3",
      title: T("Fake officials and fake fees", "Falsos oficiales y falsas cuotas"),
      life: T("If a caller says he's an official, hang up and call the agency on a number you look up yourself.", "Si quien llama dice ser un oficial, cuelga y llama a la agencia a un número que busques tú."),
      steps: [
        card(
          T("The \"officer\" on the phone", "El \"oficial\" en el teléfono"),
          T(
            "A caller says he is an officer. A package from your family is held at the border, and you must pay a {US$150} release fee today in gift cards, or you'll be arrested. Real agencies don't work like that. What gives him away?",
            "Alguien dice ser un oficial. Un paquete de tu familia está retenido en la frontera y debes pagar hoy {US$150} de cuota en tarjetas de regalo, o te arrestarán. Las agencias reales no trabajan así. ¿Qué lo delata?"
          )
        ),
        choice(
          "fake_officials",
          T("Which payment method does no government agency demand?", "¿Qué forma de pago no exige ninguna agencia de gobierno?"),
          [T("Gift cards, wires, crypto or a payment app", "Tarjetas de regalo, transferencias, criptomonedas o una app de pago"), T("A check by mail", "Un cheque por correo"), T("A payment on an official notice", "Un pago con un aviso oficial")],
          0,
          T("The FTC says no agency demands those, because they're hard to trace and to recover.", "La FTC dice que ninguna agencia los exige, porque son difíciles de rastrear y de recuperar."),
          [null, T("Agencies do accept some payments by mail, with an official notice.", "Las agencias sí aceptan algunos pagos por correo, con un aviso oficial."), T("A notice you received by an official route can carry a real payment.", "Un aviso recibido por una vía oficial puede llevar un pago real.")]
        ),
        card(
          T("How real agencies act", "Cómo actúan las agencias reales"),
          T(
            "Real agencies send official notices, don't threaten arrest to get paid and let you check. If a caller claims to be an official, hang up and find the agency's number yourself. The same habit works with any caller on either side of the border.",
            "Las agencias reales envían avisos oficiales, no amenazan con arresto para cobrar y te dejan verificar. Si quien llama dice ser oficial, cuelga y busca tú el número de la agencia. El mismo hábito sirve con cualquier llamada de ambos lados de la frontera."
          )
        ),
        scenario(
          "fake_officials",
          T("A text says a package is held and you must pay {MX$900} at a link within an hour. What do you do?", "Un mensaje dice que un paquete está retenido y debes pagar {MX$900} en un enlace en una hora. ¿Qué haces?"),
          [
            fit(T("Look up the carrier's real website or app and check there", "Buscas el sitio o la app real de la paquetería y revisas ahí"), "good", T("You reach the real company, not the text's link.", "Llegas a la empresa real, no al enlace del mensaje.")),
            fit(T("Ask a relative to check with you before deciding", "Le pides a un familiar que lo revisen juntos antes de decidir"), "ok", T("A second view helps, but check with the carrier too.", "Una segunda opinión ayuda, pero revisa también con la paquetería.")),
            fit(T("Tap the link and pay quickly", "Tocas el enlace y pagas rápido"), "poor", T("The link is where the scammer takes your card.", "En el enlace es donde el estafador toma tu tarjeta."))
          ],
          T("Go to the real source yourself, not through the message.", "Ve tú a la fuente real, no por el mensaje.")
        ),
        tf("fake_officials", T("A real agency may threaten arrest if you don't pay by gift card today.", "Una agencia real puede amenazar con arresto si no pagas hoy con tarjetas de regalo."), false, T("The FTC says real agencies don't threaten you to get paid.", "La FTC dice que las agencias reales no te amenazan para cobrar.")),
        act("goals.scam", T("Tap the red flags in this call.", "Toca las señales de alerta en esta llamada."), { set: "official" })
      ]
    },
    {
      id: "borderscams-4",
      title: T("Where to report", "Dónde reportar"),
      life: T("Save the reporting sites and numbers where your family can find them before they're needed.", "Guarda los sitios y números para reportar donde tu familia los encuentre antes de necesitarlos."),
      steps: [
        card(
          T("An hour too late", "Una hora tarde"),
          T(
            "Ana sent {US$500} to a fake \"cousin\" by transfer. She feels ashamed and wants to tell no one. Scams catch smart, careful people, and the first hour matters most. What does she do first?",
            "Ana envió {US$500} por transferencia a un \"primo\" falso. Siente vergüenza y no quiere decirle a nadie. Las estafas atrapan a gente lista y cuidadosa, y la primera hora es la que más importa. ¿Qué hace primero?"
          )
        ),
        choice(
          "report_it",
          T("What does Ana do first?", "¿Qué hace Ana primero?"),
          [T("Contacts the company she used to send it and asks to reverse it", "Contacta a la empresa con la que lo envió y pide revertirlo"), T("Waits to see if the \"cousin\" writes back", "Espera a ver si el \"primo\" le escribe"), T("Posts about it to warn friends first", "Publica para avisar a sus amigos primero")],
          0,
          T("The sender may be able to stop or reverse it, but only if it hears quickly.", "Quien envió puede frenar o revertir la operación, pero solo si se entera pronto."),
          [null, T("Waiting gives the scammer time to move the money.", "Esperar le da tiempo al estafador para mover el dinero."), T("Warning friends helps, but the money comes first.", "Avisar a los amigos ayuda, pero primero va el dinero.")]
        ),
        card(
          T("Who to tell", "A quién avisar"),
          T(
            "US: {@usReportSite}, the FBI's ic3.gov for online crimes, your state attorney general and local police. Mexico: {@mxReportLine} (Guardia Nacional) for guidance on reporting a cybercrime, CONDUSEF's financial-fraud portal, and your Fiscalía. Keep screenshots, receipts and numbers.",
            "EE. UU.: {@usReportSite}, ic3.gov del FBI para delitos en línea, la fiscalía general de tu estado y la policía local. México: el {@mxReportLine} (Guardia Nacional) para orientación al denunciar un ciberdelito, el portal de fraudes financieros de la CONDUSEF y tu Fiscalía. Guarda capturas, comprobantes y números."
          )
        ),
        match(
          "report_it",
          T("Match each place to what it's for.", "Une cada lugar con para qué sirve."),
          [
            [T("{@usReportSite}", "{@usReportSite}"), T("The US government's place to report fraud and scams", "El lugar del gobierno de EE. UU. para reportar fraudes y estafas")],
            [T("ic3.gov", "ic3.gov"), T("The FBI's place to report online crimes", "El lugar del FBI para reportar delitos en línea")],
            [T("{@mxReportLine}", "{@mxReportLine}"), T("Mexico's line for guidance on reporting a cybercrime", "La línea de México para orientación al denunciar un ciberdelito")]
          ],
          T("Different places, one habit: keep the evidence and report.", "Distintos lugares, un hábito: guardar la evidencia y reportar.")
        ),
        order(
          "report_it",
          T("Put these steps in order after you've paid a scammer.", "Pon estos pasos en orden después de pagarle a un estafador."),
          [T("Contact the company you used to send the money", "Contacta a la empresa con la que enviaste el dinero"), T("Save screenshots, receipts and numbers", "Guarda capturas, comprobantes y números"), T("Report the scam to the right agencies", "Reporta la estafa a las agencias correctas"), T("Tell your family so they stay alert", "Avisa a tu familia para que estén alerta")],
          T("The money comes first. Everything else builds on the evidence.", "Primero el dinero. Lo demás se apoya en la evidencia.")
        ),
        act("goals.scam", T("Practice spotting the red flags in a message.", "Practica encontrar las señales de alerta en un mensaje."), { set: "phishing" })
      ]
    }
  ]
};
