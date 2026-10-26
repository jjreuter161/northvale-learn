// UNIT — Scams and fraud. Its lessons and the concepts they teach (format in helpers.js).
import { T, card, choice, tf, act, concept } from "./helpers.js";

export default {
  id: "scams",
  icon: "shield",
  title: T("Scams and fraud", "Fraudes y estafas"),
  concepts: [
    concept(
      "phishing",
      T("Phishing", "Phishing (suplantación)"),
      card(T("Fake messages, real damage", "Mensajes falsos, daño real"), T("Phishing is a message pretending to be your bank, a delivery company or an app, trying to get your password, codes or card number. The tell-tale signs: urgency, a strange link, and a request for something a real company would never ask for.", "El phishing es un mensaje que se hace pasar por tu banco, una paquetería o una app para sacarte tu contraseña, códigos o número de tarjeta. Las señales: urgencia, un enlace raro y una petición de algo que una empresa real nunca te pediría.")),
      tf("phishing", T("A real bank will never ask for your PIN or a login code by message.", "Un banco real nunca te va a pedir tu NIP ni un código de acceso por mensaje."), true, T("If a message asks for those, it's a scam — no matter how official it looks.", "Si un mensaje te los pide, es fraude, por más oficial que se vea.")),
      choice(
        "phishing",
        T("You get a text from \"your bank\" with a link to \"fix a problem.\" What's the safest move?", "Te llega un mensaje de \"tu banco\" con un enlace para \"resolver un problema\". ¿Qué es lo más seguro?"),
        [T("Ignore the link and open your bank's app or call the number on your card", "Ignorar el enlace y abrir la app del banco o llamar al número de tu tarjeta"), T("Tap the link quickly before your account closes", "Tocar el enlace rápido antes de que cierren tu cuenta"), T("Reply asking if it's real", "Contestar preguntando si es real")],
        0,
        T("Contact the company through a channel you already trust. If there's a real problem, it'll be there.", "Contacta a la empresa por un canal en el que ya confías. Si hay un problema real, ahí va a aparecer."),
        [null, T("The rush is the trick. Fake links lead to fake login pages.", "La prisa es el truco. Los enlaces falsos llevan a páginas de acceso falsas."), T("A scammer will happily say yes. Replying also tells them your number is active.", "Un estafador con gusto te va a decir que sí. Contestar también le confirma que tu número está activo.")]
      )
    ),
    concept(
      "fake_investments",
      T("Fake investments", "Inversiones falsas"),
      card(T("If it's guaranteed and huge, it's fake", "Si es garantizado y enorme, es falso"), T("Investment scams promise big, guaranteed returns, fast — often from a stranger online, a \"mentor\" or a new friend. Real investments can't guarantee high returns. Before sending money, check that the firm is registered (in the US: FINRA BrokerCheck or the SEC).", "Los fraudes de inversión prometen rendimientos grandes, garantizados y rápidos, muchas veces de un desconocido en internet, un \"mentor\" o un amigo nuevo. Las inversiones reales no pueden garantizar rendimientos altos. Antes de mandar dinero, revisa que la empresa esté registrada (en EE. UU.: BrokerCheck de FINRA o la SEC).", { en: "Investment scams promise big, guaranteed returns, fast — often from a stranger online, a \"mentor\" or a new friend. Real investments can't guarantee high returns. Before sending money, check that the firm is authorized (the CNBV and CONDUSEF publish lists, including firms that aren't authorized).", es: "Los fraudes de inversión prometen rendimientos grandes, garantizados y rápidos, muchas veces de un desconocido en internet, un \"mentor\" o un amigo nuevo. Las inversiones reales no pueden garantizar rendimientos altos. Antes de mandar dinero, revisa que la empresa esté autorizada (la CNBV y la CONDUSEF publican listas, incluso de las que no están autorizadas)." })),
      tf("fake_investments", T("A guaranteed high return is a warning sign.", "Un rendimiento alto garantizado es una señal de alerta."), true, T("Higher returns always come with risk. A guarantee of both is the classic scam pitch.", "Los rendimientos altos siempre vienen con riesgo. Garantizar las dos cosas es la promesa clásica del fraude.")),
      choice(
        "fake_investments",
        T("Someone you met online offers to \"teach you to trade\" if you send money to their account. What's the biggest red flag?", "Alguien que conociste en internet te ofrece \"enseñarte a invertir\" si le mandas dinero a su cuenta. ¿Cuál es la mayor señal de alerta?"),
        [T("Sending money to a person instead of a registered firm", "Mandar dinero a una persona en lugar de a una empresa registrada"), T("They're friendly", "Es amable"), T("They use a nice-looking app", "Usa una app bonita")],
        0,
        T("Legitimate platforms hold your money in your own account at a regulated firm — not with a person you met online.", "Las plataformas legítimas guardan tu dinero en tu propia cuenta en una empresa regulada, no con una persona que conociste en internet."),
        [null, T("Scammers are often very friendly — that's part of how they build trust.", "Los estafadores suelen ser muy amables: así se ganan tu confianza."), T("A polished app is easy to fake. Registration is what to check.", "Una app bonita es fácil de falsificar. Lo que hay que revisar es el registro.")]
      )
    ),
    concept(
      "pyramid_schemes",
      T("Pyramid schemes", "Esquemas piramidales"),
      card(T("Paid by the people below you", "Te pagan los de abajo"), T("In a pyramid scheme, people earn mainly by recruiting others who pay to join, not by selling something real. A Ponzi scheme pays old investors with new investors' money. Both collapse when new money slows — and most people lose.", "En un esquema piramidal, la gente gana sobre todo por reclutar a otros que pagan por entrar, no por vender algo real. Un esquema Ponzi les paga a los inversionistas viejos con el dinero de los nuevos. Los dos se caen cuando deja de entrar dinero nuevo, y la mayoría pierde.")),
      tf("pyramid_schemes", T("In a pyramid scheme, most of the money comes from new recruits.", "En un esquema piramidal, la mayor parte del dinero viene de los nuevos reclutas."), true, T("That's why it needs endless new members — and why it always runs out.", "Por eso necesita miembros nuevos sin fin, y por eso siempre se acaba.")),
      choice(
        "pyramid_schemes",
        T("Why do pyramid schemes always collapse?", "¿Por qué los esquemas piramidales siempre se caen?"),
        [T("They need an endless supply of new recruits, and that runs out", "Necesitan reclutas nuevos sin fin, y eso se acaba"), T("The government closes all businesses after a year", "El gobierno cierra todos los negocios después de un año"), T("The products expire", "Los productos caducan")],
        0,
        T("Each level needs many more people below it. Within a few levels, you'd need more people than exist.", "Cada nivel necesita a muchas más personas abajo. En pocos niveles, harían falta más personas de las que existen."),
        [null, T("Real businesses last for decades. Pyramids fail because of their math.", "Los negocios reales duran décadas. Las pirámides fallan por sus matemáticas."), T("The product is usually a cover. The problem is how the money moves.", "El producto suele ser una fachada. El problema es cómo se mueve el dinero.")]
      )
    ),
    concept(
      "account_security",
      T("Protecting your accounts", "Proteger tus cuentas"),
      card(T("Three habits that stop most attacks", "Tres hábitos que frenan casi todos los ataques"), T("Use a different password for each important account (a password manager helps), turn on two-step verification, and never share a code sent to you. Check your accounts for charges you don't recognize, and report them fast.", "Usa una contraseña distinta para cada cuenta importante (un administrador de contraseñas ayuda), activa la verificación en dos pasos y nunca compartas un código que te manden. Revisa tus cuentas por si hay cargos que no reconoces y repórtalos rápido.")),
      tf("account_security", T("Two-step verification makes it much harder for someone to take over your account.", "La verificación en dos pasos hace mucho más difícil que alguien se robe tu cuenta."), true, T("A stolen password alone isn't enough to get in.", "Una contraseña robada ya no basta para entrar.")),
      choice(
        "account_security",
        T("A friend's account messages you: \"I sent a code to your phone by mistake, can you send it to me?\" What's going on?", "La cuenta de un amigo te escribe: \"Te mandé un código por error, ¿me lo pasas?\". ¿Qué está pasando?"),
        [T("Probably a hacker using your friend's account to take over yours", "Probablemente alguien hackeó la cuenta de tu amigo y quiere robar la tuya"), T("Your friend made a simple mistake", "Tu amigo se equivocó y ya"), T("The app is testing you", "La app te está probando")],
        0,
        T("That code is almost always a login or reset code for your account. Never share it.", "Ese código casi siempre es para entrar o restablecer tu cuenta. Nunca lo compartas."),
        [null, T("Codes go to the account owner's phone — yours. Your friend has no reason to need it.", "Los códigos llegan al teléfono de quien es dueño de la cuenta: el tuyo. Tu amigo no tiene por qué necesitarlo."), T("Apps don't test you by asking for codes in chats.", "Las apps no te prueban pidiéndote códigos por chat.")]
      )
    ),
  ],
  lessons: [
    {
      id: "scams-1",
      title: T("Phishing", "Phishing"),
      steps: [
        card(T("It looks official", "Parece oficial"), T("Phishing messages copy logos, names and the tone of real companies. They arrive by text, email, social media or phone calls, and they all want the same thing: to get you to tap, log in or share something.", "Los mensajes de phishing copian logos, nombres y el tono de empresas reales. Llegan por mensaje, correo, redes sociales o llamada, y todos quieren lo mismo: que toques, entres o compartas algo.")),
        card(T("Slow down, go direct", "Ve despacio y ve directo"), T("Urgency is the trick. Don't use links or numbers from the message. Open the company's app, or type its address yourself, and check there.", "La urgencia es el truco. No uses enlaces ni números del mensaje. Abre la app de la empresa o escribe tú la dirección, y revisa ahí.")),
        choice(
          "phishing",
          T("Which is the clearest sign a message is phishing?", "¿Cuál es la señal más clara de que un mensaje es phishing?"),
          [T("It asks for your password or a code", "Te pide tu contraseña o un código"), T("It has the company's logo", "Trae el logo de la empresa"), T("It arrived in the morning", "Llegó en la mañana")],
          0,
          T("Real companies don't ask for passwords or codes by message. That request alone tells you.", "Las empresas reales no piden contraseñas ni códigos por mensaje. Esa petición ya te lo dice todo."),
          [null, T("Logos are easy to copy. They prove nothing.", "Los logos son fáciles de copiar. No prueban nada."), T("Timing doesn't matter — what it asks for does.", "La hora no importa; lo que pide, sí.")]
        ),
        tf("phishing", T("If a message looks official, it's safe to use its link.", "Si un mensaje se ve oficial, es seguro usar su enlace."), false, T("Looking official is exactly what phishing does. Go to the app or website yourself.", "Verse oficial es justo lo que hace el phishing. Entra tú a la app o al sitio.")),
        act("goals.scam", T("Spot the red flags in this message.", "Encuentra las señales de alerta en este mensaje."), { set: "phishing" }),
      ],
    },
    {
      id: "scams-2",
      title: T("Fake investments", "Inversiones falsas"),
      steps: [
        card(T("The pitch", "La promesa"), T("\"Guaranteed\" returns, \"risk-free\", \"only a few spots left\", screenshots of big profits. Fake investments often start with a friendly stranger online and end with a request to send money — usually as crypto or a transfer to a person.", "Rendimientos \"garantizados\", \"sin riesgo\", \"quedan pocos lugares\", capturas de ganancias enormes. Las inversiones falsas suelen empezar con un desconocido amable en internet y terminar pidiendo que mandes dinero, casi siempre en cripto o por transferencia a una persona.")),
        card(
          T("How to check", "Cómo revisar"),
          T("Look up the firm on FINRA's BrokerCheck or the SEC's website. If it isn't registered, or you can't find it, don't send money. Report scams to the FTC at ReportFraud.ftc.gov.", "Busca la empresa en BrokerCheck de FINRA o en el sitio de la SEC. Si no está registrada o no la encuentras, no mandes dinero. Reporta los fraudes a la FTC en ReportFraud.ftc.gov.", { en: "Check that the firm is authorized: the CNBV and CONDUSEF publish lists, including warnings about firms that aren't. If you can't confirm it, don't send money. You can report fraud to CONDUSEF.", es: "Revisa que la empresa esté autorizada: la CNBV y la CONDUSEF publican listas, incluso alertas sobre las que no lo están. Si no lo puedes confirmar, no mandes dinero. Puedes reportar fraudes a la CONDUSEF." })
        ),
        choice(
          "fake_investments",
          T("An app promises 2% a day, guaranteed. That's about…", "Una app promete 2% diario, garantizado. Eso es más o menos…"),
          [T("A sign it's almost certainly a scam", "Una señal de que casi seguro es un fraude"), T("A normal savings rate", "Una tasa de ahorro normal"), T("What index funds usually pay", "Lo que suelen pagar los fondos indexados")],
          0,
          T("2% a day would multiply money more than a thousand times in a year. No real investment can promise that.", "Un 2% diario multiplicaría el dinero más de mil veces en un año. Ninguna inversión real puede prometer eso."),
          [null, T("Savings accounts pay a few percent a year, not per day.", "Las cuentas de ahorro pagan unos cuantos puntos al año, no al día."), T("Even stock index funds have averaged roughly 7–10% a year over long periods — a year, not a day, and with no guarantee.", "Incluso los fondos indexados de acciones han promediado más o menos 7–10% al año en periodos largos: al año, no al día, y sin garantía.")]
        ),
        tf("fake_investments", T("Checking whether a firm is registered takes only a few minutes.", "Revisar si una empresa está registrada toma solo unos minutos."), true, T("A quick search on the regulator's site can save you from losing everything.", "Una búsqueda rápida en el sitio del regulador te puede salvar de perderlo todo.")),
        act("goals.scam", T("Spot the red flags in this investment pitch.", "Encuentra las señales de alerta en esta oferta de inversión."), { set: "investment" }),
      ],
    },
    {
      id: "scams-3",
      title: T("Pyramid schemes", "Esquemas piramidales"),
      steps: [
        card(T("Follow the money", "Sigue el dinero"), T("Ask one question: where does the money come from? If it comes from customers buying something they want, it's a business. If it comes mainly from new members paying to join, it's a pyramid.", "Hazte una pregunta: ¿de dónde sale el dinero? Si sale de clientes que compran algo que quieren, es un negocio. Si sale sobre todo de miembros nuevos que pagan por entrar, es una pirámide.")),
        card(T("The math doesn't work", "Las cuentas no dan"), T("If each person must recruit six, the 13th level alone would need more people than live on Earth. Long before that, recruiting stalls — and the people who joined last lose their money.", "Si cada persona debe reclutar a seis, solo el nivel 13 necesitaría más gente de la que vive en la Tierra. Mucho antes, el reclutamiento se frena, y quienes entraron al final pierden su dinero.")),
        choice(
          "pyramid_schemes",
          T("A \"business\" pays you mainly for each friend who joins and pays a fee. That's…", "Un \"negocio\" te paga sobre todo por cada amigo que entra y paga una cuota. Eso es…"),
          [T("A pyramid scheme", "Un esquema piramidal"), T("A normal sales job", "Un trabajo normal de ventas"), T("A savings plan", "Un plan de ahorro")],
          0,
          T("Getting paid for recruits, not for sales to real customers, is the defining sign.", "Que te paguen por reclutas y no por ventas a clientes reales es la señal que lo define."),
          [null, T("Normal sales jobs pay you for selling to customers, not for signing up other sellers.", "Los trabajos de ventas normales te pagan por venderle a clientes, no por inscribir a otros vendedores."), T("A savings plan keeps your money yours. Here it flows up to others.", "Un plan de ahorro mantiene tu dinero como tuyo. Aquí se va hacia los de arriba.")]
        ),
        tf("pyramid_schemes", T("Most people who join pyramid schemes lose money.", "La mayoría de quienes entran a esquemas piramidales pierde dinero."), true, T("Only those near the top earn — paid by everyone below them.", "Solo ganan los de arriba, con el dinero de todos los de abajo.")),
        act("goals.scam", T("Spot the red flags in this \"business opportunity.\"", "Encuentra las señales de alerta en esta \"oportunidad de negocio\"."), { set: "pyramid" }),
      ],
    },
    {
      id: "scams-4",
      title: T("Protect your accounts", "Protege tus cuentas"),
      steps: [
        card(T("Locks that work", "Candados que sí funcionan"), T("Different passwords for important accounts, two-step verification turned on, and the phone's own lock screen. These three stop most account takeovers.", "Contraseñas distintas para las cuentas importantes, verificación en dos pasos activada y el bloqueo de pantalla del teléfono. Estos tres frenan la mayoría de los robos de cuenta.")),
        card(T("If something goes wrong", "Si algo sale mal"), T("See a charge you don't recognize? Lock the card in your bank's app and call the bank right away. Banks have rules for disputes, and the faster you report, the more you're protected.", "¿Ves un cargo que no reconoces? Bloquea la tarjeta en la app del banco y llama de inmediato. Los bancos tienen reglas para aclaraciones, y entre más rápido reportes, más protegido estás.", { en: "See a charge you don't recognize? Lock the card in your bank's app, call the bank right away and file a clarification (\"aclaración\"). If it isn't resolved, you can go to CONDUSEF.", es: "¿Ves un cargo que no reconoces? Bloquea la tarjeta en la app del banco, llama de inmediato y presenta una aclaración. Si no se resuelve, puedes acudir a la CONDUSEF." })),
        choice(
          "account_security",
          T("Which habit protects your accounts best?", "¿Qué hábito protege mejor tus cuentas?"),
          [T("Two-step verification and a different password for each important account", "Verificación en dos pasos y una contraseña distinta para cada cuenta importante"), T("One strong password for everything", "Una contraseña fuerte para todo"), T("Writing passwords in your phone's notes", "Anotar las contraseñas en las notas del teléfono")],
          0,
          T("Unique passwords limit the damage of a leak; the second step stops most break-ins.", "Las contraseñas únicas limitan el daño de una filtración, y el segundo paso frena la mayoría de los accesos."),
          [null, T("However strong, one leaked password then opens everything.", "Por más fuerte que sea, una contraseña filtrada abre todo."), T("Plain notes aren't protected. A password manager is built for this.", "Las notas comunes no están protegidas. Un administrador de contraseñas está hecho para eso.")]
        ),
        tf("account_security", T("It's fine to share a login code with a friend if they ask nicely.", "Está bien compartir un código de acceso con un amigo si te lo pide con amabilidad."), false, T("Never share codes. The \"friend\" may be someone who took over their account.", "Nunca compartas códigos. El \"amigo\" puede ser alguien que se robó su cuenta.")),
        act("goals.scam", T("Which of these tips are risky?", "¿Cuáles de estos consejos son riesgosos?"), { set: "security" }),
      ],
    },
  ],
};
