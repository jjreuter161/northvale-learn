// YOUR MONEY YEAR — the twelve months. One decision per month, in order
// (month 11 has two versions: the card balance you carry, or a thin credit
// history). Every event has exactly three choices; the one marked `steady` is
// the sound choice the end screen compares you with. Text uses {amount}
// names filled from engine.eventVars (amounts in the person's currency).
// All numbers are examples. Writing rules: docs/CONTENT-STYLE.md.
import { T } from "../lessons/units/helpers.js";
import { patch, feel, credit, payFrom, payDebt, owe, amt } from "./engine.js";

const r0 = Math.round;
const ev = (id, lesson, fields) => ({ id, lesson, amounts: {}, ...fields });
const ch = (label, result, effect, steady = false) => ({ label, result, effect, steady });

export const STARTS_TEXT = {
  student: { title: T("Student with a part-time job", "Estudiante con un trabajo de medio tiempo"), body: T("Classes, a small paycheck and shared housing. Money is tight, so small choices matter.", "Clases, un sueldo pequeño y vivienda compartida. El dinero es poco, así que las decisiones pequeñas importan.") },
  firstjob: { title: T("Your first full-time job", "Tu primer trabajo de tiempo completo"), body: T("A real paycheck and your own place. More room to save, and more ways to overspend.", "Un sueldo de verdad y tu propio lugar. Más espacio para ahorrar y más formas de gastar de más.") },
  family: { title: T("Living with family", "Viviendo con tu familia"), body: T("You help at home and have a little saved. A good year to build a cushion.", "Ayudas en casa y tienes algo ahorrado. Un buen año para construir un colchón.") },
  moveout: { title: T("Just moved out", "Recién independizado"), body: T("Higher rent and a card balance from the move. It starts tighter, and what you do now counts.", "Renta más alta y un saldo en la tarjeta por la mudanza. Empieza más justo, y lo que hagas ahora cuenta.") },
};

export const EVENTS = [
  // 1
  [
    ev("plan", "save-1", {
      title: T("Pay yourself first", "Págate primero a ti"),
      body: T("You take home {income} a month. How much goes into savings automatically, before you can spend it?", "Te llegan {income} al mes. ¿Cuánto se va a ahorro de forma automática, antes de que puedas gastarlo?"),
      choices: [
        ch(T("5%: a gentle start", "5%: un inicio suave"), T("Easy to keep, and it grows slowly. A start is a start.", "Fácil de mantener y crece despacio. Empezar ya es algo."), (r) => patch(r, { autoSavePct: 5 })),
        ch(T("15%: a steady habit", "15%: un hábito constante"), T("You barely notice it, and it adds up month after month.", "Casi no lo notas y se va sumando mes con mes."), (r) => patch(r, { autoSavePct: 15 }), true),
        ch(T("30%: go big", "30%: con todo"), T("Fast progress, but there's less left for fun.", "Avanzas rápido, pero queda menos para divertirte."), (r) => feel(patch(r, { autoSavePct: 30 }), -2)),
      ],
    }),
  ],
  // 2
  [
    ev("housing", "budget-2", {
      title: T("Housing check-in", "Revisión de vivienda"),
      body: T("Your housing costs {rent} a month. What do you do?", "Tu vivienda cuesta {rent} al mes. ¿Qué haces?"),
      choices: [
        ch(T("Find a way to split the cost", "Buscar cómo repartir el costo"), T("Rent drops by almost a third. Less privacy, more room in your budget.", "La renta baja casi una tercera parte. Menos privacidad, más espacio en tu presupuesto."), (r) => feel(patch(r, { rent: r0(r.rent * 0.7) }), -2), true),
        ch(T("Keep things as they are", "Dejar todo como está"), T("No surprises. Your costs stay the same.", "Sin sorpresas. Tus gastos siguen igual."), (r) => r),
        ch(T("Move somewhere nicer", "Mudarte a un lugar mejor"), T("It feels great, and more of every paycheck goes to rent.", "Se siente muy bien, y más de cada sueldo se va en renta."), (r) => feel(patch(r, { rent: r0(r.rent * 1.25) }), 3)),
      ],
    }),
  ],
  // 3
  [
    ev("refund", "taxes-3", {
      amounts: { refund: [450, 4000] },
      title: T("A refund arrives", "Llega una devolución", { en: "A tax balance in your favor", es: "Un saldo a favor de impuestos" }),
      body: T("Your tax refund arrives: {refund}. It's your own money coming back.", "Llega tu devolución de impuestos: {refund}. Es tu propio dinero que regresa.", { en: "Your annual tax return shows a balance in your favor (saldo a favor): {refund}. It's your own money coming back.", es: "Tu declaración anual muestra un saldo a favor: {refund}. Es tu propio dinero que regresa." }),
      choices: [
        ch(T("Add it to savings", "Sumarlo a tus ahorros"), T("Your cushion gets a real boost.", "Tu colchón recibe un buen empujón."), (r, a) => feel(patch(r, { savings: r.savings + a("refund") }), 2), true),
        ch(T("Pay down the card", "Pagar la tarjeta"), T("Any card balance shrinks, and what's left stays in your pocket.", "El saldo de la tarjeta baja, y lo que sobra se queda contigo."), (r, a) => payDebt(patch(r, { cash: r.cash + a("refund") }), a("refund"), ["cash"])),
        ch(T("Spend it on something fun", "Gastarlo en algo divertido"), T("A great month, and the money is gone.", "Un gran mes, y el dinero se va."), (r) => feel(r, 4)),
      ],
    }),
  ],
  // 4
  [
    ev("emergency", "save-2", {
      amounts: { cost: [380, 4500] },
      title: T("A surprise bill", "Un gasto inesperado"),
      body: T("Something breaks and can't wait: a repair or a doctor's visit. It costs {cost}.", "Algo se descompone y no puede esperar: una reparación o una visita al médico. Cuesta {cost}."),
      choices: [
        ch(
          T("Pay with savings or cash", "Pagar con ahorros o efectivo"),
          T("It hurts less with a cushion. Without one, the rest lands on the card.", "Duele menos con un colchón. Sin él, el resto se va a la tarjeta."),
          (r, a) => {
            const { run, used } = payFrom(r, a("cost"), ["savings", "cash"]);
            return feel(run, used.card > 0 ? -9 : used.savings >= a("cost") ? -2 : -3);
          },
          true
        ),
        ch(T("Put it all on the card", "Ponerlo todo en la tarjeta"), T("No cash out today, but it'll cost interest every month.", "No sale efectivo hoy, pero costará intereses cada mes."), (r, a) => credit(feel(owe(r, a("cost")), -4), -1)),
        ch(
          T("Ask family to cover half", "Pedir a tu familia que cubra la mitad"),
          T("It helps a lot, and it's a little awkward to ask.", "Ayuda mucho, y da un poco de pena pedirlo."),
          (r, a) => {
            const { run, used } = payFrom(r, r0(a("cost") / 2), ["savings", "cash"]);
            return feel(run, used.card > 0 ? -6 : -3);
          }
        ),
      ],
    }),
  ],
  // 5
  [
    ev("purchase", "psychology-1", {
      amounts: { cost: [240, 3800] },
      title: T("A tempting sale", "Una oferta tentadora"),
      body: T("Something you've wanted is on sale for {cost}. The ad says \"today only!\"", "Algo que querías está en oferta por {cost}. El anuncio dice \"¡solo hoy!\""),
      choices: [
        ch(T("Buy it on the card", "Comprarlo con la tarjeta"), T("It feels great now, and the bill follows you with interest.", "Se siente genial ahora, y la cuenta te sigue con intereses."), (r, a) => credit(feel(owe(r, a("cost")), 5), -1)),
        ch(T("Buy it with cash", "Comprarlo en efectivo"), T("You enjoy it without debt, and your cash is lower.", "Lo disfrutas sin deuda, y tu efectivo baja."), (r, a) => feel(payFrom(r, a("cost"), ["cash"]).run, 4)),
        ch(T("Sleep on it and skip it", "Esperar y no comprarlo"), T("The urge fades in a day or two, and the money stays yours.", "Las ganas se pasan en un día o dos, y el dinero sigue siendo tuyo."), (r) => feel(r, 1), true),
      ],
    }),
  ],
  // 6
  [
    ev("invest", "etf-3", {
      amounts: { monthly: [50, 500], lump: [150, 2000] },
      title: T("The market dipped", "El mercado cayó"),
      body: T("Stocks fell this spring. A friend says it's a great time to invest, and tells you about a stock that \"will double.\" What do you do?", "Las acciones bajaron esta primavera. Un amigo dice que es buen momento para invertir y te cuenta de una acción que \"se va a duplicar\". ¿Qué haces?"),
      choices: [
        ch(T("Invest {monthly} a month in a broad index fund", "Invertir {monthly} al mes en un fondo indexado amplio"), T("A little every month in many companies. Ups and downs come, and time helps.", "Un poco cada mes en muchas empresas. Habrá altas y bajas, y el tiempo ayuda."), (r, a) => feel(patch(r, { investMonthly: a("monthly") }), -1), true),
        ch(T("Keep everything in savings", "Dejar todo en ahorros"), T("Safe and calm, and it grows slowly.", "Seguro y tranquilo, y crece despacio."), (r) => feel(r, 1)),
        ch(
          T("Put {lump} into the stock that \"will double\"", "Poner {lump} en la acción que \"se va a duplicar\""),
          T("Exciting. But nobody knows what one stock will do.", "Emociona. Pero nadie sabe qué hará una sola acción."),
          (r, a) => {
            const put = Math.min(a("lump"), Math.max(0, r.cash) + Math.max(0, r.savings));
            const { run } = payFrom(r, put, ["cash", "savings"]);
            return feel(patch(run, { hot: run.hot + put }), 2);
          }
        ),
      ],
    }),
  ],
  // 7
  [
    ev("raise", "paycheck-1", {
      derive: (r) => ({ raise: r0(r.income * 0.08) }),
      title: T("You get a raise", "Te dan un aumento"),
      body: T("Good news: you take home {raise} more every month. What happens to it?", "Buena noticia: te llegan {raise} más cada mes. ¿Qué pasa con ese dinero?"),
      choices: [
        ch(T("Upgrade your lifestyle", "Subir tu nivel de vida"), T("Life feels better, and most of the raise disappears into bigger costs.", "La vida se siente mejor, y casi todo el aumento se va en gastos más grandes."), (r, a) => feel(patch(r, { income: r.income + a("raise"), essentials: r.essentials + r0(a("raise") * 0.8) }), 3)),
        ch(T("Save half of it", "Ahorrar la mitad"), T("You enjoy some and save some, every month.", "Disfrutas una parte y ahorras otra, cada mes."), (r, a) => patch(r, { income: r.income + a("raise"), extraSave: r.extraSave + r0(a("raise") * 0.5) }), true),
        ch(T("Save all of it", "Ahorrarlo todo"), T("Your savings grow fast. Your daily life stays the same.", "Tus ahorros crecen rápido. Tu vida diaria sigue igual."), (r, a) => patch(r, { income: r.income + a("raise"), extraSave: r.extraSave + a("raise") })),
      ],
    }),
  ],
  // 8
  [
    ev("scam", "scams-1", {
      amounts: { fee: [30, 500] },
      title: T("A text says you won", "Un mensaje dice que ganaste"),
      body: T("A text says you won a prize, but you must pay a {fee} \"fee\" with gift cards first, right now.", "Un mensaje dice que ganaste un premio, pero primero debes pagar una \"comisión\" de {fee} con tarjetas de regalo, ya."),
      choices: [
        ch(T("Pay the fee to get the prize", "Pagar la comisión para recibir el premio"), T("There's no prize. The money is gone, and so is some of your peace of mind.", "No hay premio. El dinero se fue, y también parte de tu tranquilidad."), (r, a) => feel(payFrom(r, a("fee"), ["cash", "savings"]).run, -6)),
        ch(T("Ignore it", "Ignorarlo"), T("Nothing lost. Real prizes never ask you to pay first.", "No pierdes nada. Los premios de verdad nunca piden que pagues primero.")  , (r) => r),
        ch(T("Block it and report it", "Bloquearlo y reportarlo"), T("You protect yourself, and maybe someone else.", "Te proteges, y quizá a alguien más."), (r) => feel(r, 2), true),
      ],
    }),
  ],
  // 9
  [
    ev("leaks", "budget-3", {
      amounts: { subs: [45, 600] },
      title: T("Small leaks", "Gastos hormiga"),
      body: T("Subscriptions and little purchases have crept up to about {subs} a month. What do you do?", "Las suscripciones y las compras pequeñas ya suman unos {subs} al mes. ¿Qué haces?"),
      choices: [
        ch(T("Cancel what you don't use", "Cancelar lo que no usas"), T("You trade a little convenience for money back each month.", "Cambias un poco de comodidad por dinero de vuelta cada mes."), (r, a) => feel(patch(r, { essentials: r.essentials - r0(a("subs") * 0.6) }), -1), true),
        ch(T("Keep everything", "Dejar todo igual"), T("Nothing changes, and it keeps leaking.", "No cambia nada, y la fuga sigue."), (r) => r),
        ch(T("Add one more you want", "Agregar una más que quieres"), T("A small treat, and a bit more every month.", "Un gustito, y un poco más cada mes."), (r, a) => feel(patch(r, { essentials: r.essentials + r0(a("subs") * 0.3) }), 2)),
      ],
    }),
  ],
  // 10
  [
    ev("family", "budget-1", {
      amounts: { trip: [260, 3000] },
      derive: (r) => ({ half: r0(amt([260, 3000], r.region) / 2) }),
      title: T("A trip with family and friends", "Un viaje con familia y amigos"),
      body: T("A trip you'd hate to miss costs {trip} if you do it up. How do you do it?", "Un viaje que no te quieres perder cuesta {trip} si lo haces a lo grande. ¿Cómo lo haces?"),
      choices: [
        ch(T("Go all in", "Ir con todo"), T("Great memories, and your cash takes the hit.", "Grandes recuerdos, y tu efectivo lo resiente."), (r, a) => feel(payFrom(r, a("trip"), ["cash"]).run, 6)),
        ch(T("Go on a budget", "Ir con presupuesto"), T("You still go, and spend about half.", "Aun así vas, y gastas más o menos la mitad."), (r, a) => feel(payFrom(r, a("half"), ["cash"]).run, 4), true),
        ch(T("Skip it", "No ir"), T("Your money stays, and you wonder what you missed.", "Tu dinero se queda, y te preguntas qué te perdiste."), (r) => feel(r, -3)),
      ],
    }),
  ],
  // 11 (two versions)
  [
    ev("debt", "credit-2", {
      amounts: { extra: [100, 1000] },
      when: (r) => r.debt > 0,
      title: T("The card balance", "El saldo de la tarjeta"),
      body: T("You owe {debt} on your card, and interest keeps adding up. What do you do this month?", "Debes {debt} en tu tarjeta, y los intereses siguen sumando. ¿Qué haces este mes?"),
      choices: [
        ch(T("Pay only the minimum", "Pagar solo el mínimo"), T("It stays manageable and the balance barely moves.", "Se mantiene manejable y el saldo casi no baja."), (r) => feel(r, -1)),
        ch(T("Pay {extra} extra", "Pagar {extra} extra"), T("The balance falls faster, and you pay less interest.", "El saldo baja más rápido y pagas menos intereses."), (r, a) => feel(payDebt(r, a("extra"), ["cash"]), 1), true),
        ch(T("Pay it all from savings", "Pagarlo todo con tus ahorros"), T("No more interest, and a thinner cushion.", "Se acaban los intereses, y tu colchón queda más delgado."), (r) => feel(payDebt(r, r.debt, ["savings", "cash"]), 2)),
      ],
    }),
    ev("nodebt", "credit-3", {
      amounts: { small: [60, 800] },
      title: T("Your credit history", "Tu historial de crédito"),
      body: T("You have no card balance, but your credit history is thin. Lenders can't see how you handle borrowing. What do you do?", "No tienes saldo en tarjeta, pero tu historial de crédito es corto. Los prestamistas no ven cómo manejas el crédito. ¿Qué haces?"),
      choices: [
        ch(T("Open a starter card, use it for one small bill and pay it off every month", "Abrir una tarjeta de inicio, usarla para una cuenta pequeña y pagarla cada mes"), T("A clean record starts to build.", "Empieza a formarse un historial limpio."), (r) => credit(r, 4), true),
        ch(T("Skip credit for now", "Dejar el crédito por ahora"), T("Nothing risky, and nothing built.", "Sin riesgo, y sin construir nada."), (r) => r),
        ch(T("Open a card and use it freely", "Abrir una tarjeta y usarla sin freno"), T("Fun at first, then a balance with interest.", "Divertido al principio, luego un saldo con intereses."), (r, a) => credit(feel(owe(r, a("small")), 2), -2)),
      ],
    }),
  ],
  // 12
  [
    ev("yearend", "save-3", {
      derive: (r) => {
        const bonus = r0(r.income * (r.region === "MX" ? 0.5 : 0.2));
        return { bonus, half: r0(bonus / 2) };
      },
      title: T("A year-end bonus", "Un bono de fin de año", { en: "Your aguinaldo", es: "Tu aguinaldo" }),
      body: T("A holiday bonus of {bonus} arrives to end the year. What do you do with it?", "Llega un bono de fin de año de {bonus}. ¿Qué haces con él?", { en: "Your aguinaldo arrives, worth {bonus} (the law says at least {@aguinaldoDays} days of pay). What do you do with it?", es: "Llega tu aguinaldo, de {bonus} (la ley dice al menos {@aguinaldoDays} días de sueldo). ¿Qué haces con él?" }),
      choices: [
        ch(T("Save all of it", "Ahorrarlo todo"), T("You start next year with a bigger cushion.", "Empiezas el próximo año con un colchón más grande."), (r, a) => feel(patch(r, { savings: r.savings + a("bonus") }), 2), true),
        ch(T("Save half, invest half", "Ahorrar la mitad e invertir la otra"), T("A cushion and a start in the market.", "Un colchón y un inicio en el mercado."), (r, a) => feel(patch(r, { savings: r.savings + a("half"), invested: r.invested + a("half") }), 2)),
        ch(T("Spend it all", "Gastarlo todo"), T("A great holiday, and the money is gone.", "Unas fiestas geniales, y el dinero se fue."), (r) => feel(r, 5)),
      ],
    }),
  ],
];

// The lesson an event points to when you want to understand it.
export const lessonOf = (eventId) => EVENTS.flat().find((e) => e.id === eventId).lesson;
