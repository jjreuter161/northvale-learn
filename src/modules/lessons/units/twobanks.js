// UNIT — Banking in two countries. Its lessons and the concepts they teach (format in helpers.js).
// Written for life between the US and Mexico: amounts are always dollars or pesos ({US$1000}, {MX$17600}).
// Rules about ID and tax numbers differ by bank: the lessons say so and point to the bank. Needs a human review before it goes live.
import { T, card, choice, tf, act, concept, order, estimate, number, match, scenario, fit } from "./helpers.js";

export default {
  id: "twobanks",
  icon: "building",
  title: T("Banking in two countries", "Bancos en dos países"),
  concepts: [
    concept(
      "bank_asks",
      T("What banks ask for", "Qué piden los bancos"),
      card(
        T("Three things", "Tres cosas"),
        T("Banks usually ask for ID, proof of where you live and a tax number. Which ones they accept differs by bank and by country. Ask before you go.", "Los bancos suelen pedir identificación, comprobante de domicilio y un número fiscal. Cuáles aceptan cambia según el banco y el país. Pregunta antes de ir.")
      ),
      tf("bank_asks", T("Every bank asks for exactly the same papers.", "Todos los bancos piden exactamente los mismos papeles."), false, T("Each bank sets its own list within the law. The bank's website or branch can tell you.", "Cada banco tiene su propia lista dentro de la ley. El sitio o la sucursal te lo pueden decir.")),
      choice(
        "bank_asks",
        T("You're not sure what to bring to open an account. What's the best first step?", "No sabes qué llevar para abrir una cuenta. ¿Cuál es el mejor primer paso?"),
        [T("Check the bank's website or call to see what it accepts", "Revisar el sitio del banco o llamar para saber qué acepta"), T("Show up and hope for the best", "Ir y esperar que funcione"), T("Ask a friend which bank is easiest", "Preguntar a un amigo cuál banco es más fácil")],
        0,
        T("The bank itself knows what it accepts today. A friend's experience may be out of date.", "El banco sabe lo que acepta hoy. La experiencia de un amigo puede estar desactualizada."),
        [null, T("You may lose a trip if you're missing one paper.", "Puedes perder el viaje si te falta un papel."), T("A friend's experience helps, but rules differ by bank and change over time.", "La experiencia de un amigo ayuda, pero las reglas cambian según el banco y con el tiempo.")]
      )
    ),
    concept(
      "other_account",
      T("An account in the other country", "Una cuenta en el otro país"),
      card(
        T("Banking on the other side", "Banca del otro lado"),
        T("Some people keep an account in each country. Opening one usually means visiting a branch, or using a bank that serves both sides. The bank sets the rules, fees and what it accepts as ID.", "Algunas personas tienen una cuenta en cada país. Abrirla suele implicar ir a una sucursal o usar un banco que atienda los dos lados. El banco fija las reglas, las comisiones y qué identificación acepta.")
      ),
      tf("other_account", T("A bank must open an account for you online without checking who you are.", "Un banco tiene que abrirte una cuenta en línea sin verificar quién eres."), false, T("Banks must confirm your identity. Expect questions and documents.", "Los bancos deben confirmar tu identidad. Espera preguntas y documentos.")),
      choice(
        "other_account",
        T("A cousin in Ciudad Juárez will be paid by an El Paso employer and wants a US account. What should they check first?", "Un primo en Ciudad Juárez recibirá pago de un empleador en El Paso y quiere una cuenta en EE. UU. ¿Qué debería revisar primero?"),
        [T("Whether the bank accepts their ID, how it handles a Mexican address, and the fees", "Si el banco acepta su identificación, cómo maneja una dirección en México y las comisiones"), T("How good the app looks", "Qué tan bonita se ve la app"), T("Which bank has the most ads", "Qué banco tiene más anuncios")],
        0,
        T("ID, address and fees decide whether the account works for them.", "La identificación, la dirección y las comisiones deciden si la cuenta les sirve."),
        [null, T("A nice app helps, but it won't help if the account can't be opened or costs too much.", "Una buena app ayuda, pero no sirve si la cuenta no se puede abrir o cuesta demasiado."), T("Ads are not a reason to choose a bank.", "Los anuncios no son motivo para elegir un banco.")]
      )
    ),
    concept(
      "two_currencies",
      T("Money in two currencies", "Dinero en dos monedas"),
      card(
        T("Every conversion costs something", "Cada conversión cuesta algo"),
        T("A peso account holds pesos and a dollar account holds dollars. Each time you convert, you pay a fee or the spread: the gap between the bank's buy and sell rates. Converting less often usually costs less.", "Una cuenta en pesos guarda pesos y una cuenta en dólares guarda dólares. Cada vez que conviertes pagas una comisión o el diferencial: la brecha entre el tipo de compra y el de venta del banco. Convertir menos veces suele costar menos.")
      ),
      tf("two_currencies", T("Converting dollars to pesos is free if the bank charges no fee.", "Convertir dólares a pesos es gratis si el banco no cobra comisión."), false, T("The spread between buy and sell rates is a cost, fee or no fee.", "El diferencial entre compra y venta es un costo, haya o no comisión.")),
      choice(
        "two_currencies",
        T("You're paid in dollars and spend in pesos. Which habit tends to cost less?", "Te pagan en dólares y gastas en pesos. ¿Qué hábito suele costar menos?"),
        [T("Convert a larger amount less often, after checking the rate", "Convertir una cantidad mayor menos veces, después de revisar el tipo de cambio"), T("Convert a few dollars every day", "Convertir unos pocos dólares cada día"), T("Never look at the rate", "No mirar nunca el tipo de cambio")],
        0,
        T("Fewer conversions means fewer spreads and fees. Checking the rate keeps you from a bad day's price.", "Menos conversiones significa menos diferenciales y comisiones. Revisar el tipo de cambio evita el precio de un mal día."),
        [null, T("Each small conversion pays the spread again, and small fixed fees weigh more.", "Cada conversión pequeña paga el diferencial otra vez, y las comisiones fijas pesan más."), T("The rate changes daily, and it's the one number that decides your cost.", "El tipo de cambio cambia a diario y es el número que decide tu costo.")]
      )
    ),
    concept(
      "account_upkeep",
      T("Keeping an account alive", "Mantener viva una cuenta"),
      card(
        T("Fees, minimums, dormant accounts", "Comisiones, mínimos y cuentas inactivas"),
        T("An account can charge a monthly fee, ask for a minimum balance, or be closed if you don't use it. To close one, move the money first and ask for written confirmation.", "Una cuenta puede cobrar comisión mensual, pedir un saldo mínimo o cerrarse si no la usas. Para cerrarla, mueve el dinero antes y pide una confirmación por escrito.")
      ),
      tf("account_upkeep", T("An account you never use always stays open and free.", "Una cuenta que nunca usas siempre sigue abierta y gratis."), false, T("It may charge fees or be closed for inactivity. Check the bank's rules.", "Puede cobrar comisiones o cerrarse por inactividad. Revisa las reglas del banco.")),
      choice(
        "account_upkeep",
        T("You're moving and want to close an account. What's the sensible order?", "Te mudas y quieres cerrar una cuenta. ¿Cuál es el orden sensato?"),
        [T("Move the money, close it, keep written confirmation", "Mover el dinero, cerrarla y guardar la confirmación por escrito"), T("Just stop using it", "Simplemente dejar de usarla"), T("Close it and forget about the balance", "Cerrarla y olvidarte del saldo")],
        0,
        T("Moving the money first avoids losing it, and the confirmation proves the account is closed.", "Mover el dinero primero evita perderlo, y la confirmación prueba que la cuenta está cerrada."),
        [null, T("An unused account can keep charging fees and go negative.", "Una cuenta sin usar puede seguir cobrando comisiones y quedar en negativo."), T("Money left behind can be hard to get back.", "El dinero que se queda puede ser difícil de recuperar.")]
      )
    ),
  ],
  lessons: [
    {
      id: "twobanks-1",
      title: T("What banks ask for", "Qué piden los bancos"),
      life: T("Before you open an account, make a list of what the bank accepts, and check that you have each paper.", "Antes de abrir una cuenta, haz una lista de lo que acepta el banco y revisa que tengas cada papel."),
      steps: [
        card(T("ID, address, tax number", "Identificación, domicilio, número fiscal"), T("Banks must know who you are. In the US a tax number is usually a Social Security number or an ITIN. In Mexico it's often a CURP, and sometimes an RFC.", "Los bancos deben saber quién eres. En EE. UU. el número fiscal suele ser un número de Seguro Social o un ITIN. En México suele ser la CURP, y a veces el RFC.")),
        match(
          "bank_asks",
          T("Match each paper to what it shows.", "Une cada papel con lo que demuestra."),
          [
            [T("ID", "Identificación"), T("Who you are", "Quién eres")],
            [T("Proof of address", "Comprobante de domicilio"), T("Where you live", "Dónde vives")],
            [T("Tax number", "Número fiscal"), T("How tax authorities know you", "Cómo te identifican las autoridades fiscales")],
          ],
          T("Banks check all three, each for its own reason.", "Los bancos revisan los tres, cada uno por una razón distinta.")
        ),
        scenario(
          "bank_asks",
          T("You have an ID and a utility bill, but no tax number yet. What do you do?", "Tienes una identificación y un recibo de luz, pero aún no tienes número fiscal. ¿Qué haces?"),
          [
            fit(T("Ask the bank what it accepts and what else you can bring", "Preguntar al banco qué acepta y qué más puedes llevar"), "good", T("Some banks accept alternatives. Only the bank can say.", "Algunos bancos aceptan alternativas. Solo el banco puede decirlo.")),
            fit(T("Pay someone to get one fast", "Pagar a alguien para conseguirlo rápido"), "poor", T("Never pay unofficial helpers. Use the official offices.", "Nunca pagues a ayudantes no oficiales. Usa las oficinas oficiales.")),
            fit(T("Give up on banking", "Renunciar a tener cuenta"), "ok", T("There are usually options. Ask before deciding.", "Normalmente hay opciones. Pregunta antes de decidir.")),
          ],
          T("Ask the bank first, and use only official channels for papers.", "Pregunta primero al banco y usa solo canales oficiales para los papeles.")
        ),
        tf("bank_asks", T("An ITIN is a tax number from the US tax agency for people who can't get a Social Security number.", "Un ITIN es un número fiscal de la agencia de impuestos de EE. UU. para quienes no pueden obtener un número de Seguro Social."), true, T("Banks that accept it say so on their sites. Always check, because policies differ.", "Los bancos que lo aceptan lo dicen en sus sitios. Revísalo siempre, porque las políticas cambian.")),
        card(T("Bring copies", "Lleva copias"), T("Take originals and a copy of each paper, and ask if an appointment is needed. It can save a second trip.", "Lleva los originales y una copia de cada papel, y pregunta si necesitas cita. Puede ahorrarte un segundo viaje.")),
        act("goals.fees", T("Compare two accounts and see how their fees change your yearly cost.", "Compara dos cuentas y mira cómo sus comisiones cambian tu costo anual.")),
      ],
    },
    {
      id: "twobanks-2",
      title: T("An account in the other country", "Una cuenta en el otro país"),
      life: T("If you may need an account across the border, write down the questions to ask a bank before you apply.", "Si quizá necesites una cuenta al otro lado de la frontera, anota las preguntas que le harías a un banco antes de solicitarla."),
      steps: [
        card(T("Why people do it", "Por qué lo hacen"), T("A paycheck in dollars, family in Mexico, school or work on both sides: an account in each country can make life simpler. It can also double your fees, so it has to be worth it.", "Un sueldo en dólares, familia en México, estudio o trabajo en los dos lados: una cuenta en cada país puede simplificar la vida. También puede duplicar las comisiones, así que debe valer la pena.")),
        tf("other_account", T("Having an account in each country always saves money.", "Tener una cuenta en cada país siempre ahorra dinero."), false, T("It depends on the fees, the minimums and how you'd use each account.", "Depende de las comisiones, los mínimos y de cómo usarías cada cuenta.")),
        choice(
          "other_account",
          T("Which question helps most when choosing a bank for a second country?", "¿Qué pregunta ayuda más al elegir un banco para un segundo país?"),
          [T("What ID, address and fees apply to someone like me?", "¿Qué identificación, domicilio y comisiones aplican a alguien como yo?"), T("Which branch has the nicest lobby?", "¿Qué sucursal tiene el vestíbulo más bonito?"), T("Who advertises the most?", "¿Quién anuncia más?")],
          0,
          T("Your situation decides what works. Ask it in plain words.", "Tu situación decide qué te sirve. Pregúntalo con palabras claras."),
          [null, T("A lobby doesn't change your fees or papers.", "Un vestíbulo no cambia tus comisiones ni tus papeles."), T("Ads don't tell you what applies to you.", "Los anuncios no te dicen qué aplica a ti.")]
        ),
        card(T("Protected in each country", "Protegido en cada país"), T("Deposit insurance stays in its country: FDIC for US banks, IPAB for Mexican ones. Neither covers the other side, so don't count on one for the other.", "El seguro de depósitos se queda en su país: FDIC en bancos de EE. UU., IPAB en los mexicanos. Ninguno cubre al otro lado, así que no cuentes con uno para el otro.")),
        order(
          "other_account",
          T("Put the steps in order.", "Pon los pasos en orden."),
          [T("Decide why you need the account", "Decidir para qué necesitas la cuenta"), T("Ask two banks what they need and charge", "Preguntar a dos bancos qué piden y qué cobran"), T("Pick one and bring your papers", "Elegir uno y llevar tus papeles"), T("Check the first statement for fees", "Revisar en el primer estado de cuenta las comisiones")],
          T("Knowing the purpose first keeps you from paying for an account you don't need.", "Saber primero el propósito evita pagar por una cuenta que no necesitas.")
        ),
        act("goals.fees", T("Try using each account differently and watch the cost change.", "Prueba usar cada cuenta de otra forma y mira cómo cambia el costo.")),
      ],
    },
    {
      id: "twobanks-3",
      title: T("Dollar accounts in Mexico", "Cuentas en dólares en México"),
      life: T("Look up the buy and sell rate your bank uses for dollars today, and work out the gap.", "Busca el tipo de cambio de compra y de venta que usa hoy tu banco para dólares y calcula la diferencia."),
      steps: [
        card(T("Buy and sell are different", "Compra y venta son distintos"), T("A bank buys dollars from you at one rate and sells them at a higher one. The gap is its spread. If you convert there and back, the spread is what you lose.", "Un banco te compra dólares a un tipo de cambio y te los vende a uno más alto. La brecha es su diferencial. Si conviertes de ida y vuelta, el diferencial es lo que pierdes.")),
        number(
          "two_currencies",
          T("The bank buys dollars at {MX$17.6}. You convert {US$1000}. How many pesos do you get?", "El banco compra dólares a {MX$17.6}. Conviertes {US$1000}. ¿Cuántos pesos recibes?"),
          { unit: "number", answer: 17600, tol: 1 },
          [T("Dollars × the buy rate.", "Dólares × el tipo de compra."), T("1000 × 17.6 = 17,600 pesos.", "1000 × 17.6 = 17,600 pesos.")]
        ),
        estimate(
          "two_currencies",
          T("The bank sells dollars at {MX$18.4}. You convert {US$1000} to pesos and straight back. About what share do you lose?", "El banco vende dólares a {MX$18.4}. Conviertes {US$1000} a pesos y de inmediato de vuelta. ¿Qué parte pierdes, más o menos?"),
          { unit: "percent", min: 0, max: 12, step: 0.5, answer: 4.3, tol: 0.15 },
          T("{MX$17600} buys back {US$956}, so you lose {US$44}: about 4.3%.", "{MX$17600} compran de vuelta {US$956}, así que pierdes {US$44}: casi 4.3%.")
        ),
        match(
          "two_currencies",
          T("Match each word to its meaning.", "Une cada palabra con su significado."),
          [
            [T("Buy rate", "Tipo de compra"), T("What the bank pays for your dollars", "Lo que el banco paga por tus dólares")],
            [T("Sell rate", "Tipo de venta"), T("What the bank charges for dollars", "Lo que el banco cobra por dólares")],
            [T("Spread", "Diferencial"), T("The gap between the two", "La brecha entre los dos")],
          ],
          T("The spread is the bank's price for converting, and it's built into the rates.", "El diferencial es el precio de convertir para el banco y está dentro de los tipos de cambio.")
        ),
        card(T("A dollar account", "Una cuenta en dólares"), T("Mexican banks can hold dollars in a dollar account. It avoids converting each time, but check the minimum balance, the fees and how you can withdraw dollars.", "Los bancos mexicanos pueden guardar dólares en una cuenta en dólares. Evita convertir cada vez, pero revisa el saldo mínimo, las comisiones y cómo puedes retirar dólares.")),
        act("goals.remit", T("Try an amount and look at how the rate changes what arrives.", "Prueba un monto y mira cómo el tipo de cambio cambia lo que llega.")),
      ],
    },
    {
      id: "twobanks-4",
      title: T("Keeping money in two currencies", "Tener dinero en dos monedas"),
      life: T("Write down which bills you pay in pesos and which in dollars, and keep the right currency for each.", "Anota qué pagos haces en pesos y cuáles en dólares, y guarda la moneda correcta para cada uno."),
      steps: [
        card(T("Match money to bills", "Combina dinero y pagos"), T("Keep a currency for the bills you pay in it. If rent is in pesos and pay is in dollars, you'll convert each month. Converting a month at a time costs less than doing it every day.", "Guarda cada moneda para los pagos que haces con ella. Si la renta es en pesos y el sueldo en dólares, convertirás cada mes. Convertir un mes de una vez cuesta menos que hacerlo a diario.")),
        tf("two_currencies", T("Rates move, so what you convert today may be worth different pesos next week.", "Los tipos de cambio se mueven, así que lo que conviertas hoy valdrá otros pesos la próxima semana."), true, T("That's rate risk. It cuts both ways, and nobody can predict it.", "Eso es riesgo cambiario. Va en ambos sentidos y nadie puede predecirlo.")),
        scenario(
          "two_currencies",
          T("You're paid {US$1200} each month and pay {MX$12000} rent in pesos. What's a sensible plan?", "Te pagan {US$1200} al mes y pagas {MX$12000} de renta en pesos. ¿Qué plan es sensato?"),
          [
            fit(T("Convert what you need for the month once, after checking the rate", "Convertir lo del mes una sola vez, después de revisar el tipo de cambio"), "good", T("One conversion, a known cost, and no daily guessing.", "Una conversión, un costo conocido y nada de adivinar cada día.")),
            fit(T("Convert a little every day", "Convertir un poco cada día"), "ok", T("It spreads the rate risk, but small conversions can cost more in fees.", "Reparte el riesgo cambiario, pero las conversiones pequeñas pueden costar más en comisiones.")),
            fit(T("Wait for a \"perfect\" rate before paying rent", "Esperar un tipo de cambio \"perfecto\" para pagar la renta"), "poor", T("Nobody can time rates, and late rent has its own costs.", "Nadie puede adivinar el tipo de cambio, y la renta tardía tiene sus propios costos.")),
          ],
          T("Plan around your bills, not around guessing the rate.", "Planea según tus pagos, no según adivinar el tipo de cambio.")
        ),
        choice(
          "two_currencies",
          T("Which is a reason to hold some money in each currency?", "¿Cuál es una razón para tener algo de dinero en cada moneda?"),
          [T("You'll spend in both, so you convert less often", "Gastarás en las dos, así que conviertes menos veces"), T("It guarantees a profit", "Garantiza una ganancia"), T("Banks require it", "Los bancos lo exigen")],
          0,
          T("Holding what you'll spend in each currency cuts conversions, and the costs that come with them.", "Tener lo que gastarás en cada moneda reduce las conversiones y sus costos."),
          [null, T("No setup of two currencies guarantees a profit.", "Ninguna combinación de dos monedas garantiza una ganancia."), T("Nothing requires it. It's a choice that should fit your life.", "Nada lo exige. Es una decisión que debe ajustarse a tu vida.")]
        ),
        card(T("Not an investment", "No es una inversión"), T("Holding dollars is for spending, not for getting rich. If you're saving or investing, that's a different decision with different risks.", "Tener dólares es para gastar, no para hacerte rico. Si ahorras o inviertes, es otra decisión con otros riesgos.")),
        act("goals.budget", T("Split a month of income across pesos and dollars and see what you need.", "Reparte un mes de ingreso entre pesos y dólares y mira qué necesitas."), { income: [1200, 20000] }),
      ],
    },
    {
      id: "twobanks-5",
      title: T("Fees, closing and keeping accounts alive", "Comisiones, cierre y cuentas activas"),
      life: T("Read your last statement and circle every fee. Ask the bank about any you don't understand.", "Lee tu último estado de cuenta y marca cada comisión. Pregunta al banco por las que no entiendas."),
      steps: [
        card(T("Small fees, every month", "Comisiones pequeñas, cada mes"), T("A {US$12} monthly fee is {US$144} a year, for an account that could be free. Many banks waive it with a minimum balance or direct deposit. Ask what you'd need.", "Una comisión de {US$12} al mes son {US$144} al año, por una cuenta que podría ser gratis. Muchos bancos la quitan con un saldo mínimo o con depósito de nómina. Pregunta qué necesitarías.")),
        number(
          "account_upkeep",
          T("An account charges {US$8} a month. How many dollars is that in a year?", "Una cuenta cobra {US$8} al mes. ¿Cuántos dólares son al año?"),
          { unit: "number", answer: 96, tol: 0.5 },
          [T("Fee × 12 months.", "Comisión × 12 meses."), T("8 × 12 = 96 dollars.", "8 × 12 = 96 dólares.")]
        ),
        order(
          "account_upkeep",
          T("Put the steps in order to close an account safely.", "Pon en orden los pasos para cerrar una cuenta con seguridad."),
          [T("Move or spend the balance", "Mover o gastar el saldo"), T("Cancel automatic payments tied to it", "Cancelar los pagos automáticos ligados a ella"), T("Ask the bank to close it", "Pedir al banco que la cierre"), T("Keep the written confirmation", "Guardar la confirmación por escrito")],
          T("Each step protects the next: no balance left, no surprise charges, proof when you're done.", "Cada paso protege al siguiente: sin saldo olvidado, sin cargos sorpresa, con prueba al terminar.")
        ),
        tf("account_upkeep", T("A bank can close an account that has been unused for a long time.", "Un banco puede cerrar una cuenta que lleva mucho tiempo sin usarse."), true, T("Rules vary, so check yours, and try to use an account you want to keep once in a while.", "Las reglas varían, así que revisa la tuya y usa de vez en cuando una cuenta que quieras conservar.")),
        card(T("Compare, don't assume", "Compara, no supongas"), T("Fees differ a lot between banks. Compare the monthly fee, the minimum balance, ATM fees and foreign-card fees before you open, and again once a year.", "Las comisiones varían mucho entre bancos. Compara la comisión mensual, el saldo mínimo, las comisiones de cajero y de tarjeta en el extranjero antes de abrir, y otra vez cada año.")),
        act("goals.fees", T("Change how you'd use each account and watch the yearly cost change.", "Cambia cómo usarías cada cuenta y mira cómo cambia el costo anual.")),
      ],
    },
  ],
};
