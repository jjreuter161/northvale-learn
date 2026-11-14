// UNIT — Cards and digital payments. Its lessons and the concepts they teach (format in helpers.js).
// For everyone: amounts are {$US|MX} and text has a Mexico version where the system differs (apps and bank transfers).
// App names are examples of how people pay, never recommendations. Needs a human review before it goes live.
import { T, card, choice, tf, act, concept, order, number, match, spot, tap, scenario, fit } from "./helpers.js";

export default {
  id: "payments",
  icon: "card",
  title: T("Cards and digital payments", "Tarjetas y pagos digitales"),
  concepts: [
    concept(
      "card_types",
      T("Debit, credit and prepaid", "Débito, crédito y prepago"),
      card(
        T("Whose money is it?", "¿De quién es el dinero?"),
        T("A debit card spends your own money from your account. A credit card spends the bank's money, which you repay later. A prepaid card spends only what you loaded onto it.", "Una tarjeta de débito gasta tu propio dinero de tu cuenta. Una de crédito gasta dinero del banco, que pagas después. Una prepagada gasta solo lo que le cargaste.")
      ),
      tf("card_types", T("A credit card spends your own money, straight from your account.", "Una tarjeta de crédito gasta tu propio dinero, directo de tu cuenta."), false, T("That's a debit card. Credit spends the bank's money first, and you repay it.", "Eso es una tarjeta de débito. La de crédito gasta primero dinero del banco y tú lo pagas.")),
      choice(
        "card_types",
        T("You want a card you can't overspend, with no debt. Which fits best?", "Quieres una tarjeta con la que no puedas gastar de más ni endeudarte. ¿Cuál conviene más?"),
        [T("A prepaid card, or a debit card with a balance you watch", "Una prepagada, o una de débito con un saldo que vigilas"), T("A credit card with a high limit", "Una tarjeta de crédito con límite alto"), T("Any card, they're the same", "Cualquiera, son iguales")],
        0,
        T("Prepaid and debit can only spend what's there, which limits debt.", "La prepagada y la de débito solo gastan lo que hay, lo que limita las deudas."),
        [null, T("A big credit limit makes it easy to spend more than you have.", "Un límite alto de crédito facilita gastar más de lo que tienes."), T("They differ in whose money you spend and what protections you get.", "Cambia de quién es el dinero que gastas y qué protecciones tienes.")]
      )
    ),
    concept(
      "tap_wallets",
      T("Chip, tap and phone wallets", "Chip, contactless y billeteras en el celular"),
      card(
        T("Safer than they look", "Más seguros de lo que parecen"),
        T("A chip makes a one-time code for each payment, which is harder to copy than a magnetic stripe. Tapping and phone wallets use the same idea and often hide your real card number. Lock your phone, too.", "El chip genera un código de un solo uso en cada pago, más difícil de copiar que una banda magnética. El contactless y las billeteras del celular usan la misma idea y suelen ocultar tu número real de tarjeta. Bloquea también tu celular.")
      ),
      tf("tap_wallets", T("Paying with a phone wallet usually doesn't show the store your real card number.", "Pagar con la billetera del celular normalmente no muestra a la tienda tu número real de tarjeta."), true, T("A stand-in number is used, which helps if a store is hacked.", "Se usa un número sustituto, lo que ayuda si hackean una tienda.")),
      choice(
        "tap_wallets",
        T("Which is the best habit to protect a card you use by tapping?", "¿Cuál es el mejor hábito para proteger una tarjeta que usas por contactless?"),
        [T("Turn on alerts, lock your phone and check your statements", "Activar alertas, bloquear tu celular y revisar tus estados de cuenta"), T("Write the PIN on the card", "Escribir el NIP en la tarjeta"), T("Share your card photo to \"verify\" it", "Compartir la foto de tu tarjeta para \"verificarla\"")],
        0,
        T("Alerts and checking statements catch problems early, and a locked phone protects your wallet.", "Las alertas y revisar tus estados de cuenta detectan problemas a tiempo, y un celular bloqueado protege tu billetera."),
        [null, T("A PIN on the card gives a thief everything they need.", "Un NIP en la tarjeta le da al ladrón todo lo que necesita."), T("Never send photos of your card to anyone.", "Nunca mandes fotos de tu tarjeta a nadie.")]
      )
    ),
    concept(
      "pay_apps",
      T("Payment apps and bank transfers", "Apps de pago y transferencias"),
      card(
        T("Fast to send, hard to undo", "Rápido de enviar, difícil de deshacer"),
        T("Apps like Zelle, Venmo and Cash App, and in Mexico SPEI transfers and CoDi, move money in seconds. They're meant for people you know. Once it's sent, it's often hard to get back.", "Apps como Zelle, Venmo y Cash App, y en México las transferencias SPEI y CoDi, mueven dinero en segundos. Están pensadas para gente que conoces. Una vez enviado, suele ser difícil recuperarlo.", { en: "Banks' transfer systems like SPEI, and QR payments like CoDi, move money in seconds. They're meant for people and shops you know. Once it's sent, it's often hard to get back.", es: "Los sistemas de transferencia de los bancos como SPEI, y los pagos con QR como CoDi, mueven dinero en segundos. Están pensados para gente y comercios que conoces. Una vez enviado, suele ser difícil recuperarlo." })
      ),
      tf("pay_apps", T("It's easy to get money back after you send it to the wrong person in an app.", "Es fácil recuperar el dinero después de enviarlo a la persona equivocada en una app."), false, T("Often it isn't. Check the name and number before you send.", "Muchas veces no. Revisa el nombre y el número antes de enviar.")),
      choice(
        "pay_apps",
        T("A stranger selling something asks you to pay by app before you see it. What's the safest move?", "Un desconocido que vende algo te pide pagar por app antes de verlo. ¿Qué es lo más seguro?"),
        [T("Meet in a public place, inspect it, then pay", "Verse en un lugar público, revisarlo y pagar"), T("Pay first to hold it", "Pagar primero para apartarlo"), T("Pay half and the rest later", "Pagar la mitad y el resto después")],
        0,
        T("Paying only after you've seen the item keeps your money safe.", "Pagar solo después de ver el artículo protege tu dinero."),
        [null, T("A transfer sent first can be impossible to reverse if it's a scam.", "Una transferencia hecha primero puede ser imposible de revertir si es una estafa."), T("Half is still money you can lose.", "La mitad sigue siendo dinero que puedes perder.")]
      )
    ),
    concept(
      "card_abroad",
      T("Paying abroad", "Pagar en el extranjero"),
      card(
        T("Currency and fees", "Moneda y comisiones"),
        T("Using a card in another country can add a foreign-transaction fee and a worse rate. When a terminal asks to charge you in your home currency or the local one, choose the local one.", "Usar una tarjeta en otro país puede sumar una comisión por operaciones en el extranjero y un tipo de cambio peor. Cuando una terminal te pregunta si cobrar en tu moneda o en la local, elige la local.")
      ),
      tf("card_abroad", T("Choosing your home currency at a foreign terminal usually gets you the best rate.", "Elegir tu moneda en una terminal extranjera suele darte el mejor tipo de cambio."), false, T("The store's conversion usually has a worse rate. The local currency is usually better.", "La conversión de la tienda suele tener un peor tipo de cambio. La moneda local suele convenir más.")),
      choice(
        "card_abroad",
        T("You're paying in another country. Before you tap, what's a smart check?", "Vas a pagar en otro país. Antes de acercar la tarjeta, ¿qué revisión es inteligente?"),
        [T("Ask your bank about foreign fees, and pick the local currency at the terminal", "Preguntar a tu banco por las comisiones en el extranjero y elegir la moneda local en la terminal"), T("Nothing, fees are the same everywhere", "Nada, las comisiones son iguales en todos lados"), T("Choose whatever the terminal suggests", "Elegir lo que sugiera la terminal")],
        0,
        T("One question to your bank and one choice at the terminal can save several percent.", "Una pregunta a tu banco y una elección en la terminal pueden ahorrarte varios puntos porcentuales."),
        [null, T("Fees vary a lot by bank and card.", "Las comisiones varían mucho según el banco y la tarjeta."), T("The terminal's suggestion often favors the store's own conversion rate.", "La sugerencia de la terminal suele favorecer el tipo de cambio de la propia tienda.")]
      )
    ),
    concept(
      "payment_disputes",
      T("When a payment goes wrong", "Cuando un pago sale mal"),
      card(
        T("You can dispute a card charge", "Puedes disputar un cargo de tarjeta"),
        T("If a card charge is wrong, like a charge you didn't make, or a purchase that never arrived, contact the card issuer. Disputes have time limits, so act soon and keep your proof.", "Si un cargo de tarjeta es incorrecto, como un cargo que no hiciste o una compra que nunca llegó, contacta al emisor de la tarjeta. Las disputas tienen plazos, así que actúa pronto y guarda tus pruebas.")
      ),
      tf("payment_disputes", T("You can only dispute a card charge on the day it happens.", "Solo puedes disputar un cargo de tarjeta el mismo día en que ocurre."), false, T("Usually you have weeks, but the sooner the better, and each issuer sets its own limit.", "Normalmente tienes semanas, pero entre más pronto mejor, y cada emisor fija su plazo.")),
      choice(
        "payment_disputes",
        T("You see a charge you don't recognize on your statement. What's first?", "Ves en tu estado de cuenta un cargo que no reconoces. ¿Qué haces primero?"),
        [T("Contact your card issuer to report it, and ask to dispute it", "Contactar al emisor de tu tarjeta para reportarlo y pedir una disputa"), T("Ignore it and hope it goes away", "Ignorarlo y esperar que desaparezca"), T("Pay it to avoid trouble", "Pagarlo para evitar problemas")],
        0,
        T("The issuer can freeze the card, investigate and, if it's fraud, remove the charge.", "El emisor puede bloquear la tarjeta, investigar y, si es fraude, retirar el cargo."),
        [null, T("Unreported charges may be harder to dispute later.", "Los cargos no reportados pueden ser más difíciles de disputar después."), T("Paying it could mean you accept it. Report first.", "Pagarlo puede significar que lo aceptas. Reporta primero.")]
      )
    ),
  ],
  lessons: [
    {
      id: "payments-1",
      title: T("Debit, credit and prepaid, side by side", "Débito, crédito y prepago, lado a lado"),
      life: T("Look at the cards in your wallet and say, for each one, whose money it spends.", "Mira las tarjetas de tu cartera y di, de cada una, de quién es el dinero que gasta."),
      steps: [
        card(T("Three cards, three rules", "Tres tarjetas, tres reglas"), T("Debit: your money, right away. Credit: the bank's money first, repaid later (interest if you don't pay in full). Prepaid: only what you loaded. The protections and fees differ.", "Débito: tu dinero, al instante. Crédito: dinero del banco primero, que pagas después (con intereses si no pagas todo). Prepago: solo lo que cargaste. Las protecciones y comisiones cambian.")),
        match(
          "card_types",
          T("Match each card to what it does.", "Une cada tarjeta con lo que hace."),
          [
            [T("Debit", "Débito"), T("Spends your own money right away", "Gasta tu dinero al instante")],
            [T("Credit", "Crédito"), T("Spends the bank's money, repaid later", "Gasta dinero del banco, que pagas después")],
            [T("Prepaid", "Prepago"), T("Spends only what you loaded", "Gasta solo lo que cargaste")],
          ],
          T("Whose money is spent, and when you repay, are the key differences.", "De quién es el dinero y cuándo lo pagas son las diferencias clave.")
        ),
        scenario(
          "card_types",
          T("You're new to cards and tend to spend what you have. What fits best?", "Eres nuevo con las tarjetas y sueles gastar lo que tienes. ¿Qué te conviene más?"),
          [
            fit(T("Debit, watching the balance", "Débito, vigilando el saldo"), "good", T("It can't spend more than the balance, so there's no debt.", "No puede gastar más que el saldo, así que no hay deuda.")),
            fit(T("Credit, paid in full every month", "Crédito, pagado completo cada mes"), "ok", T("It builds history, but it takes habit. Interest hurts if you slip.", "Construye historial, pero requiere hábito. Los intereses duelen si te descuidas.")),
            fit(T("Credit, paying only the minimum", "Crédito, pagando solo el mínimo"), "poor", T("Interest piles up on what's left.", "Los intereses se acumulan sobre lo que queda.")),
          ],
          T("Choose the card that fits how you actually behave with money.", "Elige la tarjeta que se ajusta a cómo realmente manejas el dinero.")
        ),
        tf("card_types", T("Debit and credit cards offer the same protections if someone steals your card.", "Las tarjetas de débito y crédito ofrecen las mismas protecciones si te roban la tarjeta."), false, T("Rules differ: with debit, the money leaves your account first. Ask your bank.", "Las reglas cambian: con débito el dinero sale primero de tu cuenta. Pregunta a tu banco.")),
        card(T("Fees to watch", "Comisiones por revisar"), T("Check monthly fees, ATM fees and foreign-transaction fees. Pick a card for how you'll use it, not the one with the nicest design.", "Revisa comisiones mensuales, de cajero y por operaciones en el extranjero. Elige una tarjeta por cómo la vas a usar, no por el diseño más bonito.")),
        act("goals.fees", T("Change how you'd use a card and see how fees change the cost.", "Cambia cómo usarías una tarjeta y mira cómo las comisiones cambian el costo.")),
      ],
    },
    {
      id: "payments-2",
      title: T("Tap, chip and phone wallets", "Chip, contactless y billeteras en el celular"),
      life: T("Turn on purchase alerts for your card or account, so any charge shows up on your phone.", "Activa las alertas de compra de tu tarjeta o cuenta, para que cada cargo te llegue al celular."),
      steps: [
        card(T("One-time codes", "Códigos de un solo uso"), T("A chip creates a new code for each payment, so a copied number is harder to reuse. Tap and phone wallets work the same way. Skimmers copy magnetic stripes more easily.", "El chip crea un código nuevo en cada pago, así que un número copiado es más difícil de reutilizar. El contactless y las billeteras del celular funcionan igual. Los clonadores copian las bandas magnéticas con más facilidad.")),
        order(
          "tap_wallets",
          T("Put the steps in order to set up a phone wallet safely.", "Pon los pasos en orden para configurar con seguridad una billetera en el celular."),
          [T("Lock your phone with a code or fingerprint", "Bloquear tu celular con código o huella"), T("Add your card from your bank's own app", "Agregar tu tarjeta desde la app de tu propio banco"), T("Turn on payment alerts", "Activar las alertas de pago"), T("Check the first week of charges", "Revisar los cargos de la primera semana")],
          T("A lock first, then the card, then alerts, then a check. Each step protects the next.", "Primero el bloqueo, luego la tarjeta, luego las alertas y luego una revisión. Cada paso protege al siguiente.")
        ),
        tf("tap_wallets", T("If you lose your phone, you should call your bank and lock the card.", "Si pierdes tu celular, debes llamar a tu banco y bloquear la tarjeta."), true, T("Most banks can freeze a card in minutes, or you can lock it in the app.", "La mayoría de los bancos puede congelar una tarjeta en minutos, o puedes bloquearla en la app.")),
        scenario(
          "tap_wallets",
          T("You notice a {$40|600} charge you didn't make. What do you do?", "Notas un cargo de {$40|600} que no hiciste. ¿Qué haces?"),
          [
            fit(T("Lock the card, report the charge and ask for a new one", "Bloquear la tarjeta, reportar el cargo y pedir una nueva"), "good", T("Fast action limits the damage and starts a dispute.", "Actuar rápido limita el daño e inicia una disputa.")),
            fit(T("Wait to see if it happens again", "Esperar a ver si vuelve a pasar"), "poor", T("Small test charges often come before bigger ones.", "Los cargos pequeños de prueba suelen venir antes de los grandes.")),
            fit(T("Ignore it, it's small", "Ignorarlo, es poco"), "poor", T("Small charges can be a test, and ignoring them can cost you more.", "Los cargos pequeños pueden ser una prueba, y ignorarlos puede costarte más.")),
          ],
          T("Act the first time you see a charge you don't know.", "Actúa la primera vez que veas un cargo que no conoces.")
        ),
        card(T("Never share these", "Nunca compartas esto"), T("Your PIN, the one-time codes sent by text, and the security code on the back of your card. A real bank never asks you for them by text or phone.", "Tu NIP, los códigos de un solo uso que llegan por mensaje y el código de seguridad al reverso de tu tarjeta. Un banco real nunca te los pide por mensaje o por teléfono.")),
        act("goals.scam", T("Look at a message that asks for a code and find what gives it away.", "Mira un mensaje que pide un código y encuentra qué lo delata.")),
      ],
    },
    {
      id: "payments-3",
      title: T("Payment apps and transfers", "Apps de pago y transferencias"),
      life: T("Before sending money by app, read the name that shows up for the number. If it isn't who you expect, stop.", "Antes de enviar dinero por app, lee el nombre que aparece para ese número. Si no es quien esperas, detente."),
      steps: [
        card(T("Meant for people you know", "Pensadas para gente que conoces"), T("Zelle, Venmo and Cash App in the US, and SPEI transfers and CoDi in Mexico, are fast and often irreversible. Use them with people you know, and check the name before you confirm.", "Zelle, Venmo y Cash App en EE. UU., y las transferencias SPEI y CoDi en México, son rápidas y muchas veces irreversibles. Úsalas con gente que conoces y revisa el nombre antes de confirmar.")),
        spot(
          "pay_apps",
          T("Read this message after you listed an item for sale. Tap the 2 red flags.", "Lee este mensaje después de publicar un artículo en venta. Toca las 2 señales de alerta."),
          "sms",
          T("Message · Buyer", "Mensaje · Comprador"),
          [
            T("Hi! I'll buy it. ", "¡Hola! Lo compro. "),
            tap(T("I overpaid by mistake: refund me the extra", "Pagué de más por error: devuélveme el sobrante"), true),
            T(" and ", " y "),
            tap(T("ship it today, don't wait for the payment to clear.", "envíalo hoy, no esperes a que el pago se acredite."), true),
            tap(T(" Thanks!", " ¡Gracias!")),
          ],
          T("Overpaying then asking for a refund, and rushing you to ship before the payment clears, are classic scams. Wait for cleared money.", "Pagar de más y pedir la devolución, y apurarte a enviar antes de que se acredite el pago, son estafas clásicas. Espera a que el dinero se acredite.")
        ),
        match(
          "pay_apps",
          T("Match each term to its meaning.", "Une cada término con su significado."),
          [
            [T("Irreversible", "Irreversible"), T("Hard or impossible to undo", "Difícil o imposible de deshacer")],
            [T("Cleared", "Acreditado"), T("The money is really in your account", "El dinero de verdad está en tu cuenta")],
            [T("Confirm the name", "Confirmar el nombre"), T("Check who gets the money before you send", "Revisar quién recibe el dinero antes de enviar")],
          ],
          T("These three words are your safety checklist for any app payment.", "Estas tres palabras son tu lista de seguridad para cualquier pago por app.")
        ),
        tf("pay_apps", T("A bank or app will always refund money you send to a scammer by mistake.", "Un banco o app siempre devolverá el dinero que le envíes por error a un estafador."), false, T("Many transfers are final. That's why checking first matters.", "Muchas transferencias son definitivas. Por eso importa revisar antes.")),
        card(T("Mexico and the US", "México y EE. UU."), T("Apps and transfer systems differ by country and bank, and not every app works across the border. Check how a payment is made and who gets it before you send.", "Las apps y los sistemas de transferencia cambian por país y banco, y no todas funcionan al cruzar la frontera. Revisa cómo se hace el pago y quién lo recibe antes de enviar.")),
        act("goals.scam", T("Look at a payment message and find what gives it away.", "Mira un mensaje de pago y encuentra qué lo delata.")),
      ],
    },
    {
      id: "payments-4",
      title: T("What a card abroad really costs", "Cuánto cuesta de verdad una tarjeta en el extranjero"),
      life: T("Ask your bank: what's the foreign-transaction fee, and what do ATMs abroad charge?", "Pregunta a tu banco: ¿cuánto es la comisión por operaciones en el extranjero y cuánto cobran los cajeros fuera?"),
      steps: [
        card(T("Three possible costs", "Tres posibles costos"), T("A foreign-transaction fee (often a few percent), an ATM fee, and the exchange rate itself. Some cards charge no foreign fee. Check your own fee table.", "Una comisión por operaciones en el extranjero (a veces unos pocos puntos porcentuales), una comisión de cajero y el tipo de cambio mismo. Algunas tarjetas no cobran comisión en el extranjero. Revisa tu propia tabla de comisiones.")),
        number(
          "card_abroad",
          T("A card charges a 3% foreign fee. You spend {$200|3000}. How much is the fee?", "Una tarjeta cobra 3% de comisión en el extranjero. Gastas {$200|3000}. ¿Cuánto es la comisión?"),
          { unit: "number", answer: [6, 90], tol: 0.5 },
          [T("3% is 0.03.", "3% es 0.03."), T("{$200|3000} × 0.03 = {$6|90}.", "{$200|3000} × 0.03 = {$6|90}.")]
        ),
        choice(
          "card_abroad",
          T("A terminal abroad asks: charge in your home currency or the local one? Which is usually better?", "Una terminal en el extranjero pregunta: ¿cobrar en tu moneda o en la local? ¿Cuál suele ser mejor?"),
          [T("The local currency", "La moneda local"), T("Your home currency, so you see the price", "Tu moneda, para ver el precio"), T("It never matters", "Nunca importa")],
          0,
          T("Choosing your home currency lets the store pick the rate, which is often worse than your bank's.", "Elegir tu moneda deja que la tienda ponga el tipo de cambio, que suele ser peor que el de tu banco."),
          [null, T("The price looks clear, but the conversion costs you.", "El precio se ve claro, pero la conversión te cuesta."), T("It can matter by several percent.", "Puede importar varios puntos porcentuales.")]
        ),
        tf("card_abroad", T("Using an ATM abroad can charge a fee from the ATM and another from your bank.", "Usar un cajero en el extranjero puede cobrar una comisión del cajero y otra de tu banco."), true, T("Use bank ATMs, take out larger amounts less often, and check your bank's fees first.", "Usa cajeros de bancos, saca montos mayores menos veces y revisa antes las comisiones de tu banco.")),
        card(T("A small plan", "Un plan pequeño"), T("Before a trip: ask your bank about foreign fees, tell it you're traveling if it asks, carry a backup way to pay, and pick the local currency at terminals.", "Antes de un viaje: pregunta a tu banco por las comisiones en el extranjero, avísale que viajas si lo pide, lleva otra forma de pago de respaldo y elige la moneda local en las terminales.")),
        act("goals.fees", T("Change how you'd use a card abroad and watch the yearly cost change.", "Cambia cómo usarías una tarjeta en el extranjero y mira cómo cambia el costo anual.")),
      ],
    },
    {
      id: "payments-5",
      title: T("When a payment goes wrong", "Cuando un pago sale mal"),
      life: T("Find where to report a lost card or a wrong charge in your bank's app, and save the number.", "Busca en la app de tu banco dónde reportar una tarjeta perdida o un cargo incorrecto, y guarda el número."),
      steps: [
        card(T("Cards are easier to fix than cash", "Las tarjetas se arreglan más fácil que el efectivo"), T("If a card charge is wrong, you can dispute it. Contact the issuer soon, say what happened, and keep receipts and messages. App transfers are harder to reverse.", "Si un cargo de tarjeta es incorrecto, puedes disputarlo. Contacta pronto al emisor, di qué pasó y guarda recibos y mensajes. Las transferencias por app son más difíciles de revertir.")),
        order(
          "payment_disputes",
          T("Put the steps in order to dispute a charge.", "Pon los pasos en orden para disputar un cargo."),
          [T("Spot the charge on your statement", "Detectar el cargo en tu estado de cuenta"), T("Contact the card issuer", "Contactar al emisor de la tarjeta"), T("Explain what happened and give proof", "Explicar qué pasó y dar pruebas"), T("Follow up until you get an answer", "Dar seguimiento hasta tener una respuesta")],
          T("Report first, prove it next, and follow up. The details of each step are on your issuer's site.", "Primero reportar, luego probar y dar seguimiento. Los detalles de cada paso están en el sitio de tu emisor.")
        ),
        scenario(
          "payment_disputes",
          T("You paid {$80|1200} for something that never arrived, and the seller stopped answering. What now?", "Pagaste {$80|1200} por algo que nunca llegó, y el vendedor dejó de contestar. ¿Qué haces?"),
          [
            fit(T("Dispute the charge with your card issuer, with your proof", "Disputar el cargo con el emisor de tu tarjeta, con tus pruebas"), "good", T("If you paid by card, you often have this protection.", "Si pagaste con tarjeta, muchas veces tienes esta protección.")),
            fit(T("Keep messaging the seller for months", "Seguir escribiéndole al vendedor por meses"), "poor", T("Time limits may pass while you wait.", "Los plazos pueden vencer mientras esperas.")),
            fit(T("Write it off", "Darlo por perdido"), "ok", T("Sometimes that's the end, but try a dispute first.", "A veces ese es el final, pero intenta primero una disputa.")),
          ],
          T("Use the protection you may have before the time runs out.", "Usa la protección que puedas tener antes de que se acabe el plazo.")
        ),
        tf("payment_disputes", T("Keeping screenshots and receipts helps if you need to dispute a payment.", "Guardar capturas y recibos ayuda si necesitas disputar un pago."), true, T("Proof of what you bought, when and what was said makes a dispute stronger.", "Pruebas de qué compraste, cuándo y qué se dijo fortalecen una disputa.")),
        card(T("Prevent it", "Evítalo"), T("Pay with a card for online purchases when you can, and use a payment method that offers protection. Be careful with sellers who ask for transfers only.", "Paga con tarjeta las compras en línea cuando puedas y usa un método de pago que ofrezca protección. Ten cuidado con vendedores que piden solo transferencias.")),
        act("goals.fees", T("Compare ways to pay and see which would protect you best.", "Compara formas de pagar y mira cuál te protegería mejor.")),
      ],
    },
  ],
};
