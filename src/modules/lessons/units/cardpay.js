// UNIT — Cards and digital payments (Wave 1, Everyday Money, Start; Both).
// DRAFT: not in the app until a reviewer signs it off. To ship it, follow the steps at the top of
// sending.js. "Both" means a US and a Mexico version where the system differs: T(en, es, { en, es })
// is the Mexico version, and amounts use {$US|MX}.
// Mission to add then: "Find the foreign-transaction line on one card's published fee table (just
// reading)". Reflection: "What would that fee be on a purchase of the size you'd make?"
// Real products (Zelle, Venmo, Cash App, SPEI, DiMo, CoDi) are named only to say what kind of thing
// they are. Nothing is recommended. People and amounts are made up.
import { T, card, choice, tf, act, concept, order, match, number, scenario, fit } from "./helpers.js";

export default {
  id: "cardpay",
  icon: "card",
  draft: true,
  title: T("Cards and digital payments", "Tarjetas y pagos digitales"),
  sources: [
    // "Read" = the page was opened. "Seen" = a search summary of the page; a reviewer opens each.
    { name: "FTC, \"Mobile payment apps: how to avoid a scam when you use one\" (read): money in an app balance; hard to get back; check the recipient; contact the app or bank", url: "https://consumer.ftc.gov/articles/mobile-payment-apps-how-avoid-scam-when-you-use-one", checked: "2026-11-17" },
    { name: "CFPB, \"How do I dispute a charge on my credit card bill?\" (read): call first; written billing error notice within 60 calendar days", url: "https://www.consumerfinance.gov/ask-cfpb/how-do-i-dispute-a-charge-on-my-credit-card-bill-en-61/", checked: "2026-11-17" },
    { name: "CFPB, Regulation E 1005.6 and Regulation Z 1026.12 (seen): $50 caps; debit liability rises if you wait past two business days", url: "https://www.consumerfinance.gov/rules-policy/regulations/1005/6/", checked: "2026-11-17" },
    { name: "CFPB, foreign transaction fees on credit and prepaid cards (seen): usually a percentage; network and issuer fees can stack", url: "https://www.consumerfinance.gov/ask-cfpb/what-types-of-fees-do-prepaid-cards-typically-charge-en-2053/", checked: "2026-11-17" },
    { name: "Banxico, MI SPEI (read): CLABE is 18 digits; DiMo uses a 10-digit phone number; CoDi uses a QR code or a notification", url: "https://www.banxico.org.mx/servicios/mi-spei_-transferencias-ban.html", checked: "2026-11-17" },
    { name: "CONDUSEF, \"¿Cargos en tu tarjeta que no reconoces?\" (read, 2018, citing Banxico): 90 natural days; acuse with a folio; abono within four days; go to CONDUSEF", url: "https://revista.condusef.gob.mx/usuario-inteligente/a-tu-favor/2018/02/cargos-en-tu-tarjeta-que-no-reconoces/", checked: "2026-11-17" },
  ],
  concepts: [
    concept(
      "card_types",
      T("Debit, credit and prepaid", "Débito, crédito y prepago"),
      card(
        T("Whose money is it?", "¿De quién es el dinero?"),
        T(
          "Debit takes money straight from your account. Credit lends you money to pay back later, with interest if you don't pay in full. Prepaid spends only the money you loaded in advance.",
          "El débito toma dinero directo de tu cuenta. El crédito te presta dinero para pagar después, con intereses si no pagas completo. El prepago gasta solo el dinero que cargaste antes."
        )
      ),
      tf("card_types", T("A debit card spends money you borrowed.", "Una tarjeta de débito gasta dinero que pediste prestado."), false, T("Debit uses your own money. Credit is the one that borrows.", "El débito usa tu propio dinero. El crédito es el que presta.")),
      choice(
        "card_types",
        T("A {$40|700} purchase comes straight out of your checking account. Which card was it?", "Una compra de {$40|700} sale directo de tu cuenta de cheques. ¿Qué tarjeta fue?"),
        [T("Debit", "Débito"), T("Credit", "Crédito"), T("Prepaid", "Prepago")],
        0,
        T("Debit pulls from your account right away.", "El débito sale de tu cuenta de inmediato."),
        [null, T("Credit borrows, so nothing leaves your account until you pay the bill.", "El crédito presta, así que nada sale de tu cuenta hasta que pagas el estado de cuenta."), T("Prepaid uses a balance you loaded, not your checking account.", "El prepago usa un saldo que cargaste, no tu cuenta de cheques.")]
      )
    ),
    concept(
      "contactless",
      T("Chip, tap and phone wallets", "Chip, pago sin contacto y carteras en el celular"),
      card(
        T("A fresh code each time", "Un código nuevo cada vez"),
        T(
          "A chip makes a one-time code for each purchase, so a copied card number is worth less than it was on the magnetic stripe. Tapping uses the same chip. A phone wallet adds a lock and usually sends a substitute number, not your real one.",
          "Un chip genera un código de un solo uso en cada compra, así que un número de tarjeta copiado vale menos que en la banda magnética. El pago sin contacto usa el mismo chip. Una cartera en el celular añade un bloqueo y suele enviar un número sustituto, no el real."
        )
      ),
      tf("contactless", T("A phone wallet sends the store your real card number.", "Una cartera en el celular le manda a la tienda tu número real de tarjeta."), false, T("It usually sends a substitute number, and the phone is locked.", "Suele enviar un número sustituto, y el celular tiene bloqueo.")),
      choice(
        "contactless",
        T("Which is harder for a thief to copy and reuse?", "¿Qué es más difícil de copiar y reutilizar para un ladrón?"),
        [T("A chip purchase, which uses a one-time code", "Una compra con chip, que usa un código de un solo uso"), T("The magnetic stripe", "La banda magnética"), T("Both are the same", "Las dos son iguales")],
        0,
        T("A one-time code can't be replayed the way a stripe's fixed data can.", "Un código de un solo uso no se puede repetir como los datos fijos de una banda."),
        [null, T("The stripe holds the same data every time.", "La banda guarda los mismos datos cada vez."), T("They differ: the chip changes its code each time.", "Son distintas: el chip cambia su código cada vez.")]
      )
    ),
    concept(
      "pay_apps",
      T("Payment apps and instant transfers", "Apps de pago y transferencias inmediatas"),
      card(
        T("Close to handing over cash", "Casi como entregar efectivo"),
        T(
          "Apps like Zelle, Venmo and Cash App move money in seconds, and a payment you send on purpose is very hard to get back. Check the name and the number or email first. A balance left in an app may not have deposit insurance.",
          "Apps como Zelle, Venmo y Cash App mueven dinero en segundos, y un pago que envías a propósito es muy difícil de recuperar. Revisa primero el nombre y el número o correo. Un saldo dejado en una app puede no tener seguro de depósitos.",
          { en: "Transfers by SPEI, DiMo and CoDi move money in seconds, and a payment you send on purpose is very hard to get back. Check the name and the CLABE or phone number first.", es: "Las transferencias por SPEI, DiMo y CoDi mueven dinero en segundos, y un pago que envías a propósito es muy difícil de recuperar. Revisa primero el nombre y la CLABE o el número de celular." }
        )
      ),
      tf("pay_apps", T("A payment you sent to the wrong person is easy to take back.", "Un pago que enviaste a la persona equivocada es fácil de recuperar."), false, T("Once it's sent, getting it back is hard. Check before you press send.", "Una vez enviado, recuperarlo es difícil. Revisa antes de enviar.")),
      choice(
        "pay_apps",
        T("Before sending {$50|900} to someone new, what's the best check?", "Antes de enviar {$50|900} a alguien nuevo, ¿qué revisión es la mejor?"),
        [T("Confirm the name and the account, number or email", "Confirmar el nombre y la cuenta, número o correo"), T("Send it and ask later", "Enviarlo y preguntar después"), T("Trust the first search result", "Confiar en el primer resultado de búsqueda")],
        0,
        T("Most mistakes are a wrong digit or a wrong person, and checking first catches them.", "La mayoría de los errores son un dígito mal o la persona equivocada, y revisar antes los detecta."),
        [null, T("After it's sent, it's very hard to undo.", "Una vez enviado, es muy difícil deshacerlo."), T("A search result can be an ad or a copy.", "Un resultado de búsqueda puede ser un anuncio o una copia.")]
      )
    ),
    concept(
      "abroad_costs",
      T("Costs of paying abroad", "Costos de pagar en el extranjero"),
      card(
        T("Three fees can stack", "Pueden sumarse tres comisiones"),
        T(
          "A card or ATM abroad can add the ATM owner's fee, your bank's fee and a currency fee, often a percentage. If a machine offers to charge you in your home currency, the machine picks the rate, often a worse one.",
          "Una tarjeta o un cajero en el extranjero pueden sumar la comisión del dueño del cajero, la de tu banco y una por cambio de moneda, a menudo un porcentaje. Si una terminal ofrece cobrarte en tu moneda, la terminal elige el tipo de cambio, a menudo uno peor."
        )
      ),
      tf("abroad_costs", T("A card's foreign transaction fee is always a flat amount.", "La comisión de una tarjeta por compras en el extranjero siempre es una cantidad fija."), false, T("It's usually a percentage of the purchase.", "Suele ser un porcentaje de la compra.")),
      choice(
        "abroad_costs",
        T("A card charges 3% on foreign purchases. What are the fees on a {$200|3600} purchase?", "Una tarjeta cobra 3% por compras en el extranjero. ¿Cuánto son las comisiones en una compra de {$200|3600}?"),
        [T("{$6|108}", "{$6|108}"), T("{$3|54}", "{$3|54}"), T("{$60|1080}", "{$60|1080}")],
        0,
        T("3% of {$200|3600} is {$6|108}.", "El 3% de {$200|3600} es {$6|108}."),
        [null, T("That's 1.5%, half of what's charged.", "Eso es 1.5%, la mitad de lo que cobran."), T("That's 30%, ten times too much.", "Eso es 30%, diez veces de más.")]
      )
    ),
    concept(
      "payment_disputes",
      T("Disputing a charge", "Disputar un cargo"),
      card(
        T("Report early, keep proof", "Reporta pronto, guarda pruebas"),
        T(
          "If a charge is wrong or unauthorized, tell your card company right away. On a credit card, your loss for unauthorized use is capped at {@usCardLiability}, and you dispute in writing within {@usDisputeDays} days of the statement. Keep receipts.",
          "Si un cargo es incorrecto o no autorizado, avisa de inmediato a tu emisor. En una tarjeta de crédito, tu pérdida por uso no autorizado tiene un tope de {@usCardLiability}, y disputas por escrito dentro de {@usDisputeDays} días del estado de cuenta. Guarda tus recibos.",
          { en: "If a charge is wrong or unauthorized, tell your bank right away. In Mexico you can object to a charge you don't recognize within about {@mxDisputeDays} natural days, and the bank must give you a receipt with a folio number. Keep receipts.", es: "Si un cargo es incorrecto o no autorizado, avisa de inmediato a tu banco. En México puedes objetar un cargo que no reconoces dentro de unos {@mxDisputeDays} días naturales, y el banco debe darte un acuse con folio. Guarda tus recibos." }
        )
      ),
      tf("payment_disputes", T("You can dispute a charge any time, even years later.", "Puedes disputar un cargo en cualquier momento, incluso años después."), false, T("Disputes have deadlines, so report soon.", "Las disputas tienen plazos, así que reporta pronto.")),
      choice(
        "payment_disputes",
        T("You see a charge you didn't make. What first?", "Ves un cargo que no hiciste. ¿Qué haces primero?"),
        [T("Tell your card company right away", "Avisarle de inmediato a tu emisor"), T("Wait until the bill is due", "Esperar a que venza el pago"), T("Pay it and forget it", "Pagarlo y olvidarlo")],
        0,
        T("The clock starts early, and a quick report can limit what you owe.", "El plazo empieza pronto, y un reporte rápido puede limitar lo que debes."),
        [null, T("Waiting uses up the deadline.", "Esperar gasta el plazo."), T("Paying doesn't stop you disputing, but it makes the money harder to get back.", "Pagar no te impide disputar, pero hace más difícil recuperar el dinero.")]
      )
    )
  ],
  lessons: [
    {
      id: "cardpay-1",
      title: T("Debit, credit and prepaid, side by side", "Débito, crédito y prepago, lado a lado"),
      life: T("Look at the cards in your wallet and say, for each one, whose money it spends.", "Mira las tarjetas de tu cartera y di, de cada una, de quién es el dinero que gasta."),
      steps: [
        card(
          T("Three friends, one dinner", "Tres amigos, una cena"),
          T(
            "Rosa, Marco and Lía each pay for a {$60|1000} dinner. Rosa uses debit, Marco uses credit and Lía uses a prepaid card. At the end of the week, whose dinner was paid with money that wasn't theirs yet?",
            "Rosa, Marco y Lía pagan cada uno una cena de {$60|1000}. Rosa usa débito, Marco usa crédito y Lía usa una tarjeta de prepago. Al final de la semana, ¿la cena de quién se pagó con dinero que todavía no era suyo?"
          )
        ),
        choice(
          "card_types",
          T("Whose dinner was paid with borrowed money?", "¿La cena de quién se pagó con dinero prestado?"),
          [T("Rosa's (debit)", "La de Rosa (débito)"), T("Marco's (credit)", "La de Marco (crédito)"), T("Lía's (prepaid)", "La de Lía (prepago)")],
          1,
          T("Credit lends the money, and Marco owes it when the bill comes.", "El crédito presta el dinero, y Marco lo debe cuando llega el estado de cuenta."),
          [T("Debit took it from Rosa's own account.", "El débito lo tomó de la cuenta de Rosa."), null, T("Lía's balance was her own money, loaded earlier.", "El saldo de Lía era su propio dinero, cargado antes.")]
        ),
        card(
          T("Side by side", "Lado a lado"),
          T(
            "Debit: your own money, out of your account now. Credit: the bank's money until you pay the bill, with interest on what you carry. Prepaid: only what you loaded, and fees vary. Credit cards and loans are what lenders use to build a credit history; debit and prepaid usually aren't.",
            "Débito: tu propio dinero, sale de tu cuenta ya. Crédito: dinero del banco hasta que pagas el estado de cuenta, con intereses sobre lo que arrastras. Prepago: solo lo que cargaste, y las comisiones varían. Con tarjetas de crédito y préstamos los prestamistas arman un historial; con débito y prepago, por lo general, no."
          )
        ),
        match(
          "card_types",
          T("Match each card to what it spends.", "Une cada tarjeta con lo que gasta."),
          [
            [T("Debit", "Débito"), T("Your own money, from your account", "Tu propio dinero, de tu cuenta")],
            [T("Credit", "Crédito"), T("Money you borrow and owe later", "Dinero que pides prestado y debes después")],
            [T("Prepaid", "Prepago"), T("Only what you loaded in advance", "Solo lo que cargaste antes")]
          ],
          T("The difference is whose money it is.", "La diferencia es de quién es el dinero.")
        ),
        tf("card_types", T("Paying with a debit card builds your credit history.", "Pagar con una tarjeta de débito construye tu historial de crédito."), false, T("Debit spends your own money. Lenders look at borrowing, like credit cards and loans.", "El débito gasta tu propio dinero. Los prestamistas miran lo que pides prestado, como tarjetas de crédito y préstamos.")),
        act("goals.debt", T("See what carrying a credit card balance costs, and how paying more changes it.", "Mira cuánto cuesta arrastrar un saldo en la tarjeta y cómo cambia si pagas más."), { balance: [500, 7500], apr: 24, payment: [50, 750] })
      ]
    },
    {
      id: "cardpay-2",
      title: T("Tap, chip and phone wallets", "Chip, pago sin contacto y carteras en el celular"),
      life: T("Check that your phone has a lock, and know how you'd tell your bank if it were lost.", "Revisa que tu celular tenga bloqueo y sabe cómo le avisarías a tu banco si se perdiera."),
      steps: [
        card(
          T("Wallet and phone, both gone", "Cartera y celular, los dos perdidos"),
          T(
            "Marta's wallet and phone are taken on the same bus. In the wallet is a chip card. On the phone is a card in a phone wallet that needs her face or fingerprint to open. Which one can a thief use more easily?",
            "A Marta le roban la cartera y el celular en el mismo camión. En la cartera hay una tarjeta con chip. En el celular hay una tarjeta en una cartera digital que pide su cara o su huella para abrirse. ¿Cuál puede usar más fácilmente un ladrón?"
          )
        ),
        choice(
          "contactless",
          T("Which is easier for a thief to use?", "¿Cuál es más fácil de usar para un ladrón?"),
          [T("The card in the wallet", "La tarjeta de la cartera"), T("The card in the locked phone wallet", "La tarjeta en la cartera digital bloqueada"), T("Both are equally easy", "Las dos son igual de fáciles")],
          0,
          T("The phone wallet needs her face or fingerprint. The card has no lock, and small taps may need no PIN.", "La cartera digital pide su cara o su huella. La tarjeta no tiene bloqueo, y los pagos pequeños sin contacto pueden no pedir NIP."),
          [null, T("The phone wallet asks for a face or fingerprint first.", "La cartera digital pide primero una cara o una huella."), T("The lock on the phone makes them different.", "El bloqueo del celular las hace distintas.")]
        ),
        card(
          T("What each one does", "Qué hace cada una"),
          T(
            "A chip makes a one-time code for each purchase. Tapping uses the same chip held near the reader, and some cards skip the PIN for small amounts. A phone wallet adds a lock and usually sends a substitute number. Tell your bank right away if a card or phone is lost.",
            "Un chip genera un código de un solo uso en cada compra. El pago sin contacto usa el mismo chip cerca del lector, y algunas tarjetas no piden NIP en montos pequeños. Una cartera digital añade un bloqueo y suele enviar un número sustituto. Avisa a tu banco de inmediato si se pierde una tarjeta o el celular."
          )
        ),
        tf("contactless", T("A phone wallet sends the store your real card number.", "Una cartera digital le manda a la tienda tu número real de tarjeta."), false, T("It usually sends a substitute number, and the phone stays locked.", "Suele enviar un número sustituto, y el celular sigue bloqueado.")),
        order(
          "contactless",
          T("Put these steps in order after a phone is lost.", "Pon estos pasos en orden después de perder un celular."),
          [T("Lock or find the phone", "Bloquea o localiza el celular"), T("Tell your bank or card company", "Avisa a tu banco o emisor de tarjeta"), T("Check recent charges", "Revisa los cargos recientes"), T("Replace the cards", "Reemplaza las tarjetas")],
          T("Locking comes first, because it stops use while you call.", "Bloquear va primero, porque frena el uso mientras llamas.")
        ),
        act("goals.leak", T("Tap payments make small buys easy. See what one small habit adds up to.", "Los pagos sin contacto hacen fáciles las compras chicas. Mira cuánto suma un hábito pequeño."), { leak: [5, 80], perWeek: 4 })
      ]
    },
    {
      id: "cardpay-3",
      title: T("Payment apps and instant transfers", "Apps de pago y transferencias inmediatas"),
      life: T("Before you send money to someone new, check their name and number against what they told you in person.", "Antes de enviar dinero a alguien nuevo, compara su nombre y número con lo que te dijo en persona."),
      steps: [
        card(
          T("Sent to the wrong person", "Enviado a la persona equivocada"),
          T(
            "Sam meant to send {$50|900} to his friend Dani. He typed one digit wrong in the phone number, and the money went to a stranger. The app shows \"sent\". Can he take it back?",
            "Sam quería enviar {$50|900} a su amiga Dani. Se equivocó en un dígito del número de teléfono y el dinero llegó a un desconocido. La app dice \"enviado\". ¿Puede recuperarlo?",
            { en: "Mateo meant to send {$50|900} to his friend Dani by SPEI. He typed one digit wrong in the CLABE, and the money went to a stranger's account. The app shows \"sent\". Can he take it back?", es: "Mateo quería enviar {$50|900} a su amiga Dani por SPEI. Se equivocó en un dígito de la CLABE y el dinero llegó a la cuenta de un desconocido. La app dice \"enviado\". ¿Puede recuperarlo?" }
          )
        ),
        choice(
          "pay_apps",
          T("What's the best first step?", "¿Cuál es el mejor primer paso?"),
          [T("Contact the app or his bank right away and ask for help", "Contactar de inmediato a la app o a su banco y pedir ayuda"), T("Wait for the stranger to send it back", "Esperar a que el desconocido lo devuelva"), T("Send another payment to test", "Enviar otro pago de prueba")],
          0,
          T("The FTC says to contact the app or bank at once. Speed helps, though a reversal isn't guaranteed.", "La FTC dice que contactes de inmediato a la app o al banco. La rapidez ayuda, aunque la reversión no está garantizada."),
          [null, T("A stranger has no reason to send it back.", "Un desconocido no tiene motivo para devolverlo."), T("A second payment adds to the problem.", "Un segundo pago agrega al problema.")]
        ),
        card(
          T("Before you press send", "Antes de enviar"),
          T(
            "Check the name and the number or email. Be careful with requests from people you don't know, and know that scammers may pose as your bank. Money held in an app may not have deposit insurance, so many people move it to a bank account.",
            "Revisa el nombre y el número o correo. Ten cuidado con peticiones de gente que no conoces, y ten presente que los estafadores pueden hacerse pasar por tu banco. El dinero guardado en una app puede no tener seguro de depósitos, así que mucha gente lo pasa a una cuenta de banco.",
            { en: "Check the name and the CLABE or the phone number. Be careful with requests from people you don't know, and know that scammers may pose as your bank. SPEI transfers show a status such as \"in process\" and then \"settled\", and a settled transfer can't be taken back on your own.", es: "Revisa el nombre y la CLABE o el número de celular. Ten cuidado con peticiones de gente que no conoces, y ten presente que los estafadores pueden hacerse pasar por tu banco. Las transferencias SPEI muestran un estado como \"en proceso\" y luego \"liquidado\", y una transferencia liquidada no se puede deshacer por tu cuenta." }
          )
        ),
        match(
          "pay_apps",
          T("Match each to what it is.", "Une cada uno con lo que es."),
          [
            [T("Zelle", "Zelle", { en: "SPEI", es: "SPEI" }), T("Moves money from bank to bank using a phone number or email", "Mueve dinero de banco a banco con un número de celular o correo", { en: "Bank-to-bank transfers using an 18-digit CLABE", es: "Transferencias de banco a banco con una CLABE de 18 dígitos" })],
            [T("App balance", "Saldo en una app", { en: "DiMo", es: "DiMo" }), T("May not have deposit insurance", "Puede no tener seguro de depósitos", { en: "Transfers using the recipient's 10-digit phone number", es: "Transferencias con el número de celular de 10 dígitos de quien recibe" })],
            [T("A payment you sent", "Un pago que enviaste", { en: "CoDi", es: "CoDi" }), T("Very hard to take back", "Muy difícil de recuperar", { en: "Payments by QR code or a notification to the payer's phone", es: "Pagos con código QR o una notificación al celular de quien paga" })]
          ],
          T("Each name tells you what you're relying on.", "Cada nombre te dice en qué estás confiando.")
        ),
        tf("pay_apps", T("A payment you sent on purpose is easy to get back if you ask.", "Un pago que enviaste a propósito es fácil de recuperar si lo pides."), false, T("Sent on purpose usually means very hard to reverse, even if it was a mistake.", "Enviado a propósito suele significar muy difícil de revertir, aunque haya sido un error.")),
        act("goals.scam", T("Tap the red flags in this message.", "Toca las señales de alerta en este mensaje."), { set: "phishing" })
      ]
    },
    {
      id: "cardpay-4",
      title: T("What an ATM or card abroad really costs", "Cuánto cuesta de verdad un cajero o una tarjeta en el extranjero"),
      life: T("Find the foreign-transaction line on your card's fee table before a trip.", "Busca la línea de comisión por compras en el extranjero en la tabla de tu tarjeta antes de un viaje."),
      steps: [
        card(
          T("One withdrawal, two fees", "Un retiro, dos comisiones"),
          T(
            "Julia withdraws {$200|3600} from an ATM abroad. The ATM's owner charges {$5|90}. Her bank adds a 3% foreign fee on the amount. How much extra does that one withdrawal cost her?",
            "Julia retira {$200|3600} de un cajero en el extranjero. El dueño del cajero cobra {$5|90}. Su banco suma una comisión de 3% sobre el monto. ¿Cuánto extra le cuesta ese retiro?"
          )
        ),
        number(
          "abroad_costs",
          T("What do the two fees add up to?", "¿A cuánto suman las dos comisiones?"),
          { unit: "money", answer: [11, 198], tol: 0.5 },
          [T("Bank's fee: 3% of {$200|3600} is {$6|108}.", "Comisión del banco: 3% de {$200|3600} son {$6|108}."), T("Add the ATM's {$5|90}: {$11|198}.", "Suma los {$5|90} del cajero: {$11|198}.")]
        ),
        card(
          T("Why it stacks", "Por qué se suma"),
          T(
            "The ATM's owner, the card network and your bank can each charge. A fee is often a percentage, sometimes with a flat charge added. If a machine offers to charge you in your home currency, it picks the rate, often a worse one. Read your card's fee table first.",
            "El dueño del cajero, la red de la tarjeta y tu banco pueden cobrar cada uno. Una comisión suele ser un porcentaje, a veces con un cargo fijo. Si una terminal ofrece cobrarte en tu moneda, ella elige el tipo de cambio, a menudo uno peor. Lee primero la tabla de comisiones de tu tarjeta."
          )
        ),
        match(
          "abroad_costs",
          T("Match each charge to where it comes from.", "Une cada cargo con su origen."),
          [
            [T("ATM fee", "Comisión del cajero"), T("Charged by whoever owns the machine", "La cobra el dueño de la máquina")],
            [T("Foreign transaction fee", "Comisión por compras en el extranjero"), T("Often a percentage, from the network and your bank", "Suele ser un porcentaje, de la red y de tu banco")],
            [T("Conversion at the machine", "Conversión en la terminal"), T("Done by the machine's operator when you pick your home currency", "La hace el operador de la terminal si eliges tu moneda")]
          ],
          T("Three different charges can stack on one purchase.", "Tres cargos distintos se pueden sumar en una compra.")
        ),
        tf("abroad_costs", T("Choosing your home currency at a foreign machine is usually cheaper.", "Elegir tu moneda en una terminal extranjera suele salir más barato."), false, T("The machine's rate is often worse than your bank's.", "El tipo de cambio de la terminal suele ser peor que el de tu banco.")),
        act("goals.fees", T("Change how you'd use each account and watch the yearly cost change.", "Cambia cómo usarías cada cuenta y mira cómo cambia el costo anual."))
      ]
    },
    {
      id: "cardpay-5",
      title: T("When a payment goes wrong", "Cuando un pago sale mal"),
      life: T("Keep receipts for online orders until they arrive, and note the date you'd need to dispute by.", "Guarda los recibos de compras en línea hasta que lleguen y anota hasta cuándo podrías disputarlas."),
      steps: [
        card(
          T("Charged twice", "Cobrado dos veces"),
          T(
            "Leo's statement shows the same {$85|1500} charge twice from a shop he visited once. He wants his money back. What does he do first?",
            "El estado de cuenta de Leo muestra dos veces el mismo cargo de {$85|1500} de una tienda que visitó una sola vez. Quiere recuperar su dinero. ¿Qué hace primero?"
          )
        ),
        choice(
          "payment_disputes",
          T("What should Leo do first?", "¿Qué debe hacer Leo primero?"),
          [T("Tell his card company, and keep the receipt", "Avisarle a su emisor y guardar el recibo"), T("Ignore it, it will fix itself", "Ignorarlo, se arregla solo"), T("Pay it and move on", "Pagarlo y seguir")],
          0,
          T("Reporting early starts the clock in his favor, and the receipt is his proof.", "Reportar pronto pone el plazo a su favor, y el recibo es su prueba."),
          [null, T("Waiting uses up the deadline.", "Esperar gasta el plazo."), T("Paying first can make the money harder to get back.", "Pagar primero puede hacer más difícil recuperar el dinero.")]
        ),
        card(
          T("Your clock", "Tu plazo"),
          T(
            "On a credit card, send a written dispute within {@usDisputeDays} days of the statement. A chargeback asks the card company to reverse the payment. For a debit card, report a lost card within {@usDebitReportDays} business days to cap your loss at {@usCardLiability}.",
            "En una tarjeta de crédito, envía una disputa por escrito dentro de {@usDisputeDays} días del estado de cuenta. Un contracargo pide al emisor revertir el pago. En débito, reporta una tarjeta perdida dentro de {@usDebitReportDays} días hábiles para limitar tu pérdida a {@usCardLiability}.",
            { en: "Object to a charge you don't recognize within about {@mxDisputeDays} natural days, and ask your bank for a receipt with a folio, date and time. A chargeback asks the card company to reverse a payment. If the bank doesn't resolve it, you can go to CONDUSEF.", es: "Objeta un cargo que no reconoces dentro de unos {@mxDisputeDays} días naturales y pide a tu banco un acuse con folio, fecha y hora. Un contracargo pide al emisor revertir un pago. Si el banco no lo resuelve, puedes acudir a la CONDUSEF." }
          )
        ),
        order(
          "payment_disputes",
          T("Put these steps in order when a charge looks wrong.", "Pon estos pasos en orden cuando un cargo se ve mal."),
          [T("Check the charge against your receipts", "Compara el cargo con tus recibos"), T("Tell your bank or card company", "Avisa a tu banco o emisor"), T("Put it in writing and keep a copy", "Ponlo por escrito y guarda una copia"), T("Check the next statement for the fix", "Revisa en el siguiente estado de cuenta si lo corrigieron")],
          T("You check first so you report the right charge.", "Primero revisas para reportar el cargo correcto.")
        ),
        scenario(
          "payment_disputes",
          T("A site you paid by card never delivered, and the seller stopped answering. What do you do?", "Un sitio al que pagaste con tarjeta nunca entregó y el vendedor dejó de contestar. ¿Qué haces?"),
          [
            fit(T("Dispute it with your card company and keep your order proof", "Lo disputas con tu emisor y guardas tu comprobante de compra"), "good", T("Not receiving what you paid for is a reason to dispute.", "No recibir lo que pagaste es motivo para disputar.")),
            fit(T("Keep messaging the seller for months", "Sigues escribiéndole al vendedor por meses"), "poor", T("Deadlines keep running while you wait.", "Los plazos siguen corriendo mientras esperas.")),
            fit(T("Pay the seller again to get it moving", "Le pagas otra vez al vendedor para que se mueva"), "poor", T("It risks losing more money.", "Arriesgas perder más dinero."))
          ],
          T("Use the card company's dispute process before the deadline.", "Usa el proceso de disputa del emisor antes de que venza el plazo.")
        ),
        act("goals.scam", T("Which of these tips are risky?", "¿Cuáles de estos consejos son riesgosos?"), { set: "security" })
      ]
    }
  ]
};
