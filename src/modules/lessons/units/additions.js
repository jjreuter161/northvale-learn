// LESSONS ADDED TO UNITS THAT ARE ALREADY LIVE (Wave 1: Budgeting +2, Saving +2, Debt & credit +2).
// DRAFT: kept out of the unit files on purpose. The app loads a unit file and matches its lessons
// to the course index by position (content.js, hydrate), so lessons added to a live unit file
// would reach learners at once. Here they are checked by the validator (scripts/validate-content.mjs
// merges them into their unit) and stay out of the app until a reviewer signs them off.
// TO SHIP a set: move its `concepts` and `lessons` into the end of the unit file (budget.js, save.js
// or credit.js), delete its entry here, add the lessons' missions if any, and run
// node scripts/lesson-index.mjs. Review copy: node scripts/render-unit.mjs budget-additions
// T(en, es, { en, es }) is the Mexico version; amounts use {$US|MX}. People and amounts are made up.
import { T, card, choice, tf, act, concept, order, match, number, scenario, fit } from "./helpers.js";

export const ADDITIONS = [
  {
    unit: "budget",
    sources: [
      // "Seen" = a search summary of the page, not the page itself; a reviewer opens each.
      { name: "CFPB, Your Money, Your Goals and building-block guides (seen): track income and spending for at least a month; classify income as regular, irregular, seasonal or one-time; weekly cash-flow budgets", url: "https://files.consumerfinance.gov/f/documents/cfpb_your-money-your-goals_cash_flow_budget_tool_2018-11_ADA.pdf", checked: "2026-11-18" },
      { name: "CONDUSEF, \"Empieza tu presupuesto con el pie derecho\" and \"¿Llevas un registro de tus gastos?\" (seen): record every expense for a month; conservative variable income; the Presupuesto Familiar app", url: "https://www.gob.mx/condusef/articulos/llevas-un-registro-de-tus-gastos", checked: "2026-11-18" },
    ],
    concepts: [
      concept(
        "track_spending",
        T("Tracking what you spend", "Registrar lo que gastas"),
        card(
          T("Know it before you plan it", "Conócelo antes de planearlo"),
          T(
            "A budget starts with what you really spend. Write down every purchase for a month, in a notebook, an app or a spreadsheet, then group them into categories. The best method is the one you'll keep using.",
            "Un presupuesto empieza con lo que de verdad gastas. Anota cada compra durante un mes, en una libreta, una app o una hoja de cálculo, y agrúpalas por categorías. El mejor método es el que sigas usando."
          )
        ),
        tf("track_spending", T("Guessing your spending is as accurate as writing it down.", "Adivinar tus gastos es tan exacto como anotarlos."), false, T("Small purchases get forgotten, so a written record is more accurate.", "Las compras chicas se olvidan, así que un registro escrito es más exacto.")),
        choice(
          "track_spending",
          T("Why track spending for a whole month?", "¿Para qué registrar los gastos durante un mes completo?"),
          [T("To see what you really spend, by category", "Para ver lo que de verdad gastas, por categoría"), T("To prove you spend too much", "Para demostrar que gastas de más"), T("To avoid making a budget", "Para no hacer un presupuesto")],
          0,
          T("A month shows the pattern, including bills that come once and small habits.", "Un mes muestra el patrón, incluidos los pagos que llegan una vez y los hábitos pequeños."),
          [null, T("Tracking isn't a verdict. It's information.", "Registrar no es un juicio. Es información."), T("Tracking is the first step of a budget, not a replacement.", "Registrar es el primer paso de un presupuesto, no un reemplazo.")]
        )
      ),
      concept(
        "irregular_income",
        T("Budgeting when pay changes", "Presupuestar cuando el ingreso cambia"),
        card(
          T("Plan for the low months", "Planea para los meses bajos"),
          T(
            "When pay changes from month to month, build the budget on a careful figure, not your best month. Use good months to cover slow ones. It helps to sort income as regular, irregular, seasonal or one-time.",
            "Cuando el ingreso cambia de un mes a otro, arma el presupuesto con una cifra prudente, no con tu mejor mes. Usa los meses buenos para cubrir los lentos. Ayuda clasificar el ingreso como regular, irregular, de temporada o único."
          )
        ),
        tf("irregular_income", T("With uneven pay, the safest budget is built on your best month.", "Con ingresos desiguales, el presupuesto más seguro se arma con tu mejor mes."), false, T("A bad month would leave bills unpaid. A careful figure is safer.", "Un mal mes dejaría cuentas sin pagar. Una cifra prudente es más segura.")),
        choice(
          "irregular_income",
          T("Which month is the riskiest to build the whole budget on?", "¿En qué mes es más arriesgado basar todo el presupuesto?"),
          [T("Your best month", "Tu mejor mes"), T("Your lowest month", "Tu mes más bajo"), T("An average of many months", "Un promedio de muchos meses")],
          0,
          T("If a slower month comes, a best-month budget runs short.", "Si llega un mes más lento, un presupuesto de mejor mes se queda corto."),
          [null, T("The lowest month is the cautious choice.", "El mes más bajo es la opción prudente."), T("An average is a common, steadier base.", "Un promedio es una base común y más estable.")]
        )
      ),
      concept(
        "goal_pots",
        T("Saving for a goal", "Ahorrar para una meta"),
        card(
          T("A name, a price, a date", "Un nombre, un precio, una fecha"),
          T(
            "A goal you can name and price is easier to reach. Divide its cost by the months you have to get a monthly amount, and keep that money in its own place so it doesn't get spent.",
            "Una meta que puedes nombrar y ponerle precio es más fácil de alcanzar. Divide su costo entre los meses que tienes para obtener un monto mensual, y guarda ese dinero en su propio lugar para que no se gaste."
          )
        ),
        tf("goal_pots", T("Dividing a goal's cost by the months left tells you what to save each month.", "Dividir el costo de una meta entre los meses que faltan te dice cuánto ahorrar cada mes."), true, T("Cost ÷ months is the monthly amount.", "Costo ÷ meses es el monto mensual.")),
        choice(
          "goal_pots",
          T("A {$600|9000} trip is 6 months away. How much a month?", "Un viaje de {$600|9000} está a 6 meses. ¿Cuánto al mes?"),
          [T("{$100|1500}", "{$100|1500}"), T("{$60|900}", "{$60|900}"), T("{$600|9000}", "{$600|9000}")],
          0,
          T("{$600|9000} ÷ 6 = {$100|1500} a month.", "{$600|9000} ÷ 6 = {$100|1500} al mes."),
          [null, T("That's 10 months' worth, not 6.", "Eso es para 10 meses, no para 6."), T("That's the whole cost, not a monthly share.", "Eso es el costo total, no una parte mensual.")]
        )
      ),
      concept(
        "auto_saving",
        T("Making saving automatic", "Automatizar el ahorro"),
        card(
          T("Decide once", "Decide una vez"),
          T(
            "Automatic saving moves money before you can spend it: a transfer set for a day or two after payday, or a split of your paycheck. The amount can start small and be changed later.",
            "El ahorro automático mueve el dinero antes de que lo gastes: una transferencia programada uno o dos días después del pago, o una división de tu sueldo. El monto puede empezar chico y cambiarse después."
          )
        ),
        tf("auto_saving", T("Automatic saving means you can never change the amount.", "El ahorro automático significa que nunca puedes cambiar el monto."), false, T("You can change or stop it any time.", "Puedes cambiarlo o detenerlo cuando quieras.")),
        choice(
          "auto_saving",
          T("When is a good day to set an automatic transfer?", "¿Cuándo es un buen día para programar una transferencia automática?"),
          [T("A day or two after payday", "Uno o dos días después del pago"), T("The day before payday", "El día antes del pago"), T("Whenever the account is empty", "Cuando la cuenta esté vacía")],
          0,
          T("The money has arrived, so the transfer won't overdraw the account.", "El dinero ya llegó, así que la transferencia no deja la cuenta en negativo."),
          [null, T("Your pay may not be there yet.", "Quizá tu pago aún no haya llegado."), T("An empty account has nothing to move.", "Una cuenta vacía no tiene nada que mover.")]
        )
      )
    ],
    lessons: [
      {
        id: "budget-4",
        title: T("Tracking what you spend", "Registrar lo que gastas"),
        life: T("Pick one method, a notebook, an app or envelopes, and use it for a week.", "Elige un método, una libreta, una app o sobres, y úsalo una semana."),
        steps: [
          card(
            T("Where did it go?", "¿A dónde se fue?"),
            T(
              "Mia always ends the month short and can't say why. She guesses her extras at {$100|1500}. Then she writes down every purchase for four weeks and sorts them into groups. Her extras come to {$330|4500}. What did the record show that her memory didn't?",
              "Mia siempre termina el mes corta y no sabe por qué. Calcula sus extras en {$100|1500}. Luego anota cada compra durante cuatro semanas y las agrupa. Sus extras suman {$330|4500}. ¿Qué mostró el registro que su memoria no?"
            )
          ),
          number(
            "track_spending",
            T("How much more are Mia's extras than she guessed?", "¿Cuánto más son los extras de Mia de lo que calculaba?"),
            { unit: "money", answer: [230, 3000], tol: 0.5 },
            [T("Tracked: {$330|4500}. Guessed: {$100|1500}.", "Registrado: {$330|4500}. Calculado: {$100|1500}."), T("{$330|4500} − {$100|1500} = {$230|3000}.", "{$330|4500} − {$100|1500} = {$230|3000}.")]
          ),
          card(
            T("Three common ways", "Tres formas comunes"),
            T(
              "A notebook: write each purchase as it happens. An app or spreadsheet: log it, then total each category. Envelopes: put cash for each category in its own envelope and stop when it's empty. Add up each category at month's end.",
              "Una libreta: anota cada compra cuando ocurre. Una app u hoja de cálculo: regístrala y suma cada categoría. Sobres: pon el efectivo de cada categoría en su sobre y detente cuando se acabe. Suma cada categoría al fin de mes."
            ,
              { en: "A notebook: write each purchase as it happens. An app or spreadsheet, such as CONDUSEF's free Presupuesto Familiar app: log it, then total each category. Envelopes: cash for each category in its own envelope. Add up each category at month's end.", es: "Una libreta: anota cada compra cuando ocurre. Una app u hoja de cálculo, como la app gratuita Presupuesto Familiar de la CONDUSEF: regístrala y suma cada categoría. Sobres: el efectivo de cada categoría en su sobre. Suma cada categoría al fin de mes." }
            )
          ),
          choice(
            "track_spending",
            T("Three people track with a notebook, an app and envelopes. Which method works best?", "Tres personas registran con una libreta, una app y sobres. ¿Qué método funciona mejor?"),
            [T("The one each person will keep using", "El que cada persona siga usando"), T("The app, for everyone", "La app, para todos"), T("The notebook, for everyone", "La libreta, para todos")],
            0,
            T("A method only helps if it becomes a habit.", "Un método solo ayuda si se vuelve un hábito."),
            [null, T("An app suits some people and not others.", "Una app le sirve a unas personas y a otras no."), T("A notebook suits some people and not others.", "Una libreta le sirve a unas personas y a otras no.")]
          ),
          match(
            "track_spending",
            T("Match each method to how it works.", "Une cada método con cómo funciona."),
            [
              [T("Notebook", "Libreta"), T("Write each purchase as it happens", "Anota cada compra cuando ocurre")],
              [T("Envelopes", "Sobres"), T("Cash set aside for each category", "Efectivo apartado para cada categoría")],
              [T("App or spreadsheet", "App u hoja de cálculo"), T("Log purchases and total each category", "Registra compras y suma cada categoría")]
            ],
            T("Different tools, same goal: see where the money goes.", "Distintas herramientas, la misma meta: ver a dónde va el dinero.")
          ),
          act("goals.budget", T("Split a month's income and see what each category gets.", "Reparte el ingreso de un mes y mira cuánto recibe cada categoría."), { income: [1500, 25000] })
        ]
      },
      {
        id: "budget-5",
        title: T("Budgeting when pay changes", "Presupuestar cuando el ingreso cambia"),
        life: T("If your pay changes, write your lowest recent month and what bills it must cover.", "Si tu ingreso cambia, anota tu mes más bajo reciente y qué cuentas debe cubrir."),
        steps: [
          card(
            T("Three paychecks", "Tres pagos"),
            T(
              "Leo does deliveries. In the last three months he earned {$1800|30000}, {$900|15000} and {$1500|24000}. Rent and food cost {$1100|18000} every month. In which month does his pay fall short?",
              "Leo hace entregas. En los últimos tres meses ganó {$1800|30000}, {$900|15000} y {$1500|24000}. La renta y la comida cuestan {$1100|18000} cada mes. ¿En qué mes su pago se queda corto?"
            )
          ),
          choice(
            "irregular_income",
            T("In which month does his pay fall short of rent and food?", "¿En qué mes su pago se queda corto frente a la renta y la comida?"),
            [T("The month he earned {$900|15000}", "El mes que ganó {$900|15000}"), T("The month he earned {$1500|24000}", "El mes que ganó {$1500|24000}"), T("None, his average covers it", "Ninguno, su promedio lo cubre")],
            0,
            T("{$900|15000} is below {$1100|18000}. Bills come due in a specific month.", "{$900|15000} es menos que {$1100|18000}. Las cuentas se pagan en un mes específico."),
            [null, T("{$1500|24000} covers the {$1100|18000} bills.", "{$1500|24000} cubre los {$1100|18000} de gastos."), T("An average doesn't pay a bill in a short month.", "Un promedio no paga una cuenta en un mes corto.")]
          ),
          card(
            T("Plan for the low months", "Planea para los meses bajos"),
            T(
              "The CFPB suggests listing income by month to see which months are tight. A careful base is a low month or an average, not your best. In good months, set some money aside for slow ones, and sort income as regular, irregular, seasonal or one-time.",
              "La CFPB sugiere anotar el ingreso por mes para ver cuáles meses son apretados. Una base prudente es un mes bajo o un promedio, no tu mejor mes. En los meses buenos, aparta algo para los lentos y clasifica el ingreso como regular, irregular, de temporada o único.",
              { en: "A federal guide in Mexico suggests writing variable income lower than it could be, not counting on it for basic needs, and averaging the last 12 months if you have the history. In good months, set some aside for slow ones.", es: "Una guía federal en México sugiere anotar el ingreso variable por debajo de lo que podría ser, no contar con él para necesidades básicas y promediar los últimos 12 meses si tienes el historial. En los meses buenos, aparta algo para los lentos." }
            )
          ),
          number(
            "irregular_income",
            T("What is Leo's average pay over the three months?", "¿Cuál es el pago promedio de Leo en los tres meses?"),
            { unit: "money", answer: [1400, 23000], tol: 0.5 },
            [T("Add: {$1800|30000} + {$900|15000} + {$1500|24000} = {$4200|69000}.", "Suma: {$1800|30000} + {$900|15000} + {$1500|24000} = {$4200|69000}."), T("Divide by 3: {$1400|23000}.", "Divide entre 3: {$1400|23000}.")]
          ),
          tf("irregular_income", T("With changing pay, a budget built on the best month is the safest.", "Con ingresos que cambian, un presupuesto armado con el mejor mes es el más seguro."), false, T("A slower month would leave bills unpaid.", "Un mes más lento dejaría cuentas sin pagar.")),
          act("goals.create", T("Make a goal for a cushion that covers a slow month.", "Crea una meta para un colchón que cubra un mes lento."), { name: { en: "Slow-month cushion", es: "Colchón para meses lentos" }, target: [1100, 18000], months: 6 })
        ]
      }
    ]
  },
  {
    unit: "save",
    sources: [
      { name: "CFPB, \"Looking for an easy way to save money? Make it automatic\" and \"Set a goal and start a savings habit\" (seen): recurring transfer a day or two after payday; split direct deposit; a separate account for a goal", url: "https://www.consumerfinance.gov/archive/blog/looking-easy-way-save-money-make-it-automatic/", checked: "2026-11-18" },
      { name: "CFPB, \"Building your savings? Start with small goals\" (seen) and CONDUSEF budgeting guide (seen): name the goal, price it, divide by months, treat savings as a fixed amount", url: "https://files.consumerfinance.gov/f/documents/cfpb_your-money-your-goals_savings_booklet_cobrand.pdf", checked: "2026-11-18" },
    ],
    concepts: [],
    lessons: [
      {
        id: "save-4",
        title: T("Saving for a goal in small pots", "Ahorrar para una meta en bolsitas"),
        life: T("Name one goal, put a price on it and divide it by the months you have.", "Ponle nombre y precio a una meta y divídela entre los meses que tienes."),
        steps: [
          card(
            T("Three goals, one pile", "Tres metas, un montón"),
            T(
              "Jo wants a {$600|9000} trip, a {$300|4500} phone-repair fund and {$200|3000} for gifts. All the saving goes into one account, and by December Jo can't tell what belongs to what. What could Jo have done differently?",
              "Jo quiere un viaje de {$600|9000}, un fondo de {$300|4500} para reparar el celular y {$200|3000} para regalos. Todo el ahorro va a una sola cuenta, y en diciembre Jo no sabe qué es de qué. ¿Qué pudo haber hecho distinto?"
            )
          ),
          choice(
            "goal_pots",
            T("What helps most with several goals?", "¿Qué ayuda más con varias metas?"),
            [T("Give each goal its own name, amount and place", "Darle a cada meta su nombre, monto y lugar"), T("Put everything in one pile and remember", "Poner todo en un montón y acordarse"), T("Save only for the biggest goal", "Ahorrar solo para la meta más grande")],
            0,
            T("A separate place keeps each goal from being spent on another.", "Un lugar aparte evita que una meta se gaste en otra."),
            [null, T("Memory fades, and the pile gets spent.", "La memoria falla y el montón se gasta."), T("The smaller goals still matter, and finishing one builds momentum.", "Las metas chicas también importan, y terminar una da impulso.")]
          ),
          card(
            T("Name it, price it, divide it", "Nómbrala, ponle precio, divídela"),
            T(
              "Name the goal, price it, then divide by the months you have. Keep it in its own account or a labeled pot if your bank allows. Small goals feel doable, and finishing one is a win that makes the next one easier.",
              "Nombra la meta, ponle precio y divídela entre los meses que tienes. Guárdala en su propia cuenta o en una bolsita con nombre, si tu banco lo permite. Las metas chicas se sienten posibles, y terminar una es un logro que facilita la siguiente.",
              { en: "Name the goal, price it, then divide by the months you have. CONDUSEF's budgeting guide says to treat saving as a fixed amount in the budget, not what's left over. Small goals feel doable, and finishing one makes the next easier.", es: "Nombra la meta, ponle precio y divídela entre los meses que tienes. La guía de presupuesto de la CONDUSEF dice que el ahorro es una cantidad fija del presupuesto, no lo que sobra. Las metas chicas se sienten posibles, y terminar una facilita la siguiente." }
            )
          ),
          number(
            "goal_pots",
            T("The trip costs {$600|9000} and Jo has 6 months. How much a month?", "El viaje cuesta {$600|9000} y Jo tiene 6 meses. ¿Cuánto al mes?"),
            { unit: "money", answer: [100, 1500], tol: 0.5 },
            [T("Cost ÷ months.", "Costo ÷ meses."), T("{$600|9000} ÷ 6 = {$100|1500}.", "{$600|9000} ÷ 6 = {$100|1500}.")]
          ),
          tf("goal_pots", T("A goal with no price or date is easier to save for than one with both.", "Una meta sin precio ni fecha es más fácil de ahorrar que una con ambos."), false, T("A price and a date give you a monthly amount to aim for.", "Un precio y una fecha te dan un monto mensual al cual apuntar.")),
          act("goals.create", T("Make a goal with a price and a date.", "Crea una meta con precio y fecha."), { name: { en: "Trip fund", es: "Fondo para un viaje" }, target: [600, 9000], months: 6 })
        ]
      },
      {
        id: "save-5",
        title: T("Making saving automatic", "Automatizar el ahorro"),
        life: T("Look up how your bank sets a recurring transfer, and think of a small amount to start with.", "Averigua cómo programa tu banco una transferencia recurrente y piensa en un monto pequeño para empezar."),
        steps: [
          card(
            T("Pay yourself on payday", "Págate el día de pago"),
            T(
              "Dana sets a {$40|700} transfer to savings every month, right after payday. Kai plans to \"save what's left\" and has saved {$50|900} in six months. Dana has saved much more, without thinking about it. What made the difference?",
              "Dana programa una transferencia de {$40|700} al mes a su ahorro, justo después del pago. Kai piensa \"ahorrar lo que sobre\" y ha ahorrado {$50|900} en seis meses. Dana ha ahorrado mucho más, sin pensarlo. ¿Qué hizo la diferencia?"
            )
          ),
          choice(
            "auto_saving",
            T("What made the difference?", "¿Qué hizo la diferencia?"),
            [T("Her saving happened first, automatically", "Su ahorro ocurrió primero, de forma automática"), T("She earns more", "Ella gana más"), T("Luck", "Suerte")],
            0,
            T("Money that moves before it can be spent adds up on its own.", "El dinero que se mueve antes de poder gastarse se acumula solo."),
            [null, T("Nothing says her pay is higher.", "Nada dice que su sueldo sea mayor."), T("The difference comes from a habit she set once.", "La diferencia viene de un hábito que ella programó una vez.")]
          ),
          card(
            T("How to set it up", "Cómo programarlo"),
            T(
              "Ask your bank for a recurring transfer from checking to savings a day or two after payday, or ask your employer to split your direct deposit. Start small, and keep a cushion in checking so a transfer never overdraws it.",
              "Pide a tu banco una transferencia recurrente de tu cuenta de cheques a la de ahorro uno o dos días después del pago, o pide a tu empleador que divida tu depósito directo. Empieza con poco y deja un colchón en la cuenta de cheques para que la transferencia no la deje en negativo.",
              { en: "Ask your bank to set up a recurring transfer to a savings account, timed just after your pay arrives, or use any savings feature it offers. Start small, and keep a cushion in your account so a transfer never leaves it empty.", es: "Pide a tu banco una transferencia recurrente a una cuenta de ahorro, programada justo después de que llegue tu pago, o usa la función de ahorro que ofrezca. Empieza con poco y deja un colchón en tu cuenta para que la transferencia no la deje vacía." }
            )
          ),
          number(
            "auto_saving",
            T("How much more has Dana saved than Kai in six months?", "¿Cuánto más ha ahorrado Dana que Kai en seis meses?"),
            { unit: "money", answer: [190, 3300], tol: 0.5 },
            [T("Dana: 6 × {$40|700} = {$240|4200}.", "Dana: 6 × {$40|700} = {$240|4200}."), T("{$240|4200} − {$50|900} = {$190|3300}.", "{$240|4200} − {$50|900} = {$190|3300}.")]
          ),
          order(
            "auto_saving",
            T("Put the setup steps in order.", "Pon en orden los pasos para programarlo."),
            [T("Pick an amount you won't miss", "Elige un monto que no extrañes"), T("Choose the savings account", "Elige la cuenta de ahorro"), T("Set the transfer for a day or two after payday", "Programa la transferencia para uno o dos días después del pago"), T("Check after a month and adjust", "Revisa después de un mes y ajusta")],
            T("You decide how much and where before you set the timing.", "Decides cuánto y dónde antes de fijar el momento.")
          ),
          act("goals.create", T("Make a goal for automatic saving.", "Crea una meta para el ahorro automático."), { name: { en: "Automatic savings", es: "Ahorro automático" }, target: [240, 4200], months: 6 })
        ]
      }
    ]
  },
  {
    unit: "credit",
    sources: [
      { name: "CFPB, credit card statement and minimum payment pages (seen): due date, minimum payment, interest charged; the statement must show how long paying only the minimum would take", url: "https://www.consumerfinance.gov/ask-cfpb/a-box-on-my-credit-card-bill-says-that-i-will-pay-off-the-balance-in-three-years-if-i-pay-a-certain-amount-what-does-that-mean-do-i-have-to-pay-that-much-if-i-pay-that-much-and-make-new-purchases-will-i-still-owe-nothing-after-three-years-en-36/", checked: "2026-11-18" },
      { name: "CONDUSEF, \"¿Sabes cómo leer tu estado de cuenta?\" (seen): fecha de corte, fecha límite de pago, pago para no generar intereses, pago mínimo, CAT", url: "https://www.gob.mx/condusef/articulos/sabes-leer-tu-estado-de-cuenta", checked: "2026-11-18" },
      { name: "CFPB, \"How to rebuild your credit\" (read in the credit-scores unit): paying in full each month avoids finance charges", url: "https://www.consumerfinance.gov/consumer-tools/credit-reports-and-scores/how-to-rebuild-your-credit/", checked: "2026-11-17" },
    ],
    concepts: [
      concept(
        "read_statement",
        T("Reading a card statement", "Leer un estado de cuenta"),
        card(
          T("Four lines to find first", "Cuatro renglones para buscar primero"),
          T(
            "Find the payment due date, the minimum payment, the interest charged and the APR. The statement also shows how long paying only the minimum would take. Paying the full balance by the due date avoids interest.",
            "Busca la fecha límite de pago, el pago mínimo, los intereses cobrados y la tasa (APR). El estado de cuenta también muestra cuánto tardarías pagando solo el mínimo. Pagar el saldo completo antes de la fecha límite evita intereses.",
            { en: "Find the cut-off date, the payment due date, the payment to avoid interest, the minimum payment and the CAT. Paying the \"payment to avoid interest\" by the due date means no interest next period.", es: "Busca la fecha de corte, la fecha límite de pago, el pago para no generar intereses, el pago mínimo y el CAT. Pagar el \"pago para no generar intereses\" antes de la fecha límite significa que no se cobran intereses el siguiente periodo." }
          )
        ),
        tf("read_statement", T("Paying only the minimum pays off the balance quickly.", "Pagar solo el mínimo liquida el saldo rápido."), false, T("Most of a minimum payment goes to interest, so the balance shrinks slowly.", "La mayor parte de un pago mínimo se va en intereses, así que el saldo baja despacio.")),
        choice(
          "read_statement",
          T("Which payment keeps you from being charged interest?", "¿Qué pago evita que te cobren intereses?"),
          [T("The full statement balance, paid by the due date", "El saldo completo del estado de cuenta, pagado antes de la fecha límite"), T("The minimum, paid on time", "El mínimo, pagado a tiempo"), T("Any amount, paid late", "Cualquier monto, pagado tarde")],
          0,
          T("Paying the whole balance by the due date avoids finance charges.", "Pagar todo el saldo antes de la fecha límite evita cargos financieros."),
          [null, T("The minimum keeps you current, but interest still builds.", "El mínimo te mantiene al corriente, pero los intereses se acumulan."), T("Paying late can add fees and interest.", "Pagar tarde puede sumar comisiones e intereses.")]
        )
      ),
      concept(
        "borrow_test",
        T("When borrowing makes sense", "Cuándo tiene sentido pedir prestado"),
        card(
          T("Questions before you borrow", "Preguntas antes de pedir prestado"),
          T(
            "Before borrowing, many people ask: What's the total cost? Could I pay it in a slow month? What happens if I wait or don't borrow? Does it last, or help me earn more? Comparing the APR or CAT helps.",
            "Antes de pedir prestado, mucha gente pregunta: ¿Cuál es el costo total? ¿Podría pagarlo en un mes lento? ¿Qué pasa si espero o no lo pido? ¿Dura, o me ayuda a ganar más? Comparar el CAT o la tasa ayuda."
          )
        ),
        tf("borrow_test", T("If the monthly payment fits your budget, the total cost doesn't matter.", "Si el pago mensual cabe en tu presupuesto, el costo total no importa."), false, T("A small payment over a long time can cost much more in total.", "Un pago pequeño durante mucho tiempo puede costar mucho más en total.")),
        choice(
          "borrow_test",
          T("A loan's price is {$600|10000}, plus {$60|1000} interest. What's the total cost?", "El precio de algo es {$600|10000} y el préstamo suma {$60|1000} de intereses. ¿Cuál es el costo total?"),
          [T("{$660|11000}", "{$660|11000}"), T("{$600|10000}", "{$600|10000}"), T("{$60|1000}", "{$60|1000}")],
          0,
          T("{$600|10000} + {$60|1000} = {$660|11000}.", "{$600|10000} + {$60|1000} = {$660|11000}."),
          [null, T("That's the price without the interest.", "Eso es el precio sin los intereses."), T("That's only the interest.", "Eso es solo el interés.")]
        )
      )
    ],
    lessons: [
      {
        id: "credit-4",
        title: T("Reading a credit card statement", "Leer un estado de cuenta de tarjeta"),
        life: T("Find the due date and the minimum payment on a real statement, yours or a family member's.", "Busca la fecha límite y el pago mínimo en un estado de cuenta real, tuyo o de un familiar."),
        steps: [
          card(
            T("Four boxes", "Cuatro recuadros"),
            T(
              "Priya opens her card statement. Four things matter first: the due date, the minimum payment, the interest charged this month and the APR. Which payment keeps her from being charged interest next month?",
              "Priya abre el estado de cuenta de su tarjeta. Cuatro cosas importan primero: la fecha límite, el pago mínimo, los intereses del mes y la tasa (APR). ¿Qué pago evita que le cobren intereses el próximo mes?",
              { en: "Rafael opens his card statement. Four things matter first: the due date, the payment to avoid interest, the minimum payment and the CAT. Which payment keeps him from being charged interest next period?", es: "Rafael abre el estado de cuenta de su tarjeta. Cuatro cosas importan primero: la fecha límite de pago, el pago para no generar intereses, el pago mínimo y el CAT. ¿Qué pago evita que le cobren intereses el siguiente periodo?" }
            )
          ),
          choice(
            "read_statement",
            T("Which payment avoids interest?", "¿Qué pago evita intereses?"),
            [T("The full balance, by the due date", "El saldo completo, antes de la fecha límite", { en: "The payment to avoid interest, by the due date", es: "El pago para no generar intereses, antes de la fecha límite" }), T("The minimum, on time", "El mínimo, a tiempo"), T("Any amount, paid late", "Cualquier monto, pagado tarde")],
            0,
            T("Paying the whole balance by the due date avoids interest.", "Pagar todo el saldo antes de la fecha límite evita intereses.", { en: "That amount is calculated to avoid interest if paid by the due date.", es: "Ese monto está calculado para evitar intereses si se paga antes de la fecha límite." }),
            [null, T("The minimum keeps you current, but interest builds.", "El mínimo te mantiene al corriente, pero los intereses se acumulan.", { en: "The minimum keeps you current, but interest still builds on the rest.", es: "El mínimo te mantiene al corriente, pero se siguen cobrando intereses sobre el resto." }), T("Paying late can add fees and interest.", "Pagar tarde puede sumar comisiones e intereses.")]
          ),
          card(
            T("The minimum isn't the goal", "El mínimo no es la meta"),
            T(
              "Issuers must show how long paying only the minimum would take. The minimum covers mostly interest and a little of the balance. The APR is the yearly rate on purchases, and paying late can bring fees.",
              "Los emisores deben mostrar cuánto tardarías pagando solo el mínimo. El mínimo cubre sobre todo intereses y un poco del saldo. La tasa (APR) es el rédito anual de las compras, y pagar tarde puede traer comisiones.",
              { en: "CONDUSEF says most of a minimum payment goes to interest. The cut-off date closes the period, and the due date usually comes about 20 days later. The CAT shows the yearly cost of the card, including interest and fees.", es: "La CONDUSEF dice que la mayor parte de un pago mínimo se va en intereses. La fecha de corte cierra el periodo, y la fecha límite suele llegar unos 20 días después. El CAT muestra el costo anual de la tarjeta, con intereses y comisiones." }
            )
          ),
          number(
            "read_statement",
            T("A {$1000|10000} balance with no payments for a year, at the typical card rate of {@cardAprTypical}. About how much interest?", "Un saldo de {$1000|10000} sin pagos por un año, a la tasa típica de {@cardAprTypical}. ¿Cuánto serían los intereses, más o menos?", { en: "A {$1000|10000} balance with no payments for a year, at the typical CAT of {@catTypical}. About how much interest?", es: "Un saldo de {$1000|10000} sin pagos por un año, al CAT típico de {@catTypical}. ¿Cuánto serían los intereses, más o menos?" }),
            { unit: "money", answer: [200, 4000], tol: 0.5 },
            [T("{@cardAprTypical} of {$1000|10000}.", "{@cardAprTypical} de {$1000|10000}.", { en: "{@catTypical} of {$1000|10000}.", es: "{@catTypical} de {$1000|10000}." }), T("0.2 × {$1000|10000} = {$200|2000}.", "0.2 × {$1000|10000} = {$200|2000}.", { en: "0.4 × {$1000|10000} = {$400|4000}.", es: "0.4 × {$1000|10000} = {$400|4000}." })]
          ),
          match(
            "read_statement",
            T("Match each line to what it tells you.", "Une cada renglón con lo que te dice."),
            [
              [T("Due date", "Fecha límite de pago"), T("The last day to pay on time", "El último día para pagar a tiempo")],
              [T("Minimum payment", "Pago mínimo"), T("The least to stay current, with interest still building", "Lo menos para estar al corriente, con intereses que siguen sumando")],
              [T("Interest charged", "Intereses cobrados", { en: "CAT", es: "CAT" }), T("What the card cost you this month", "Lo que te costó la tarjeta este mes", { en: "The yearly total cost of the card", es: "El costo anual total de la tarjeta" })]
            ],
            T("Each line answers a different question about the bill.", "Cada renglón responde una pregunta distinta sobre el cobro.")
          ),
          act("goals.debt", T("Compare paying the minimum vs. paying double on a card balance.", "Compara pagar el mínimo vs. pagar el doble en el saldo de una tarjeta."), { balance: [800, 12000], apr: 24, payment: [25, 400], compareDouble: true })
        ]
      },
      {
        id: "credit-5",
        title: T("When borrowing makes sense", "Cuándo tiene sentido pedir prestado"),
        life: T("Before you borrow for something, write its total cost and what waiting would cost.", "Antes de pedir prestado para algo, anota su costo total y cuánto costaría esperar."),
        steps: [
          card(
            T("A laptop for school", "Una laptop para la escuela"),
            T(
              "Sam needs a {$600|10000} laptop for school. A loan would let him pay it over 12 months, with {$60|1000} of interest. Or he could wait six months and pay cash. Is borrowing worth it? It depends on what waiting costs him.",
              "Sam necesita una laptop de {$600|10000} para la escuela. Un préstamo le permitiría pagarla en 12 meses, con {$60|1000} de intereses. O podría esperar seis meses y pagar en efectivo. ¿Vale la pena pedir prestado? Depende de lo que le cueste esperar."
            )
          ),
          number(
            "borrow_test",
            T("The loan's total is the price plus the interest. How much will Sam pay in all?", "El total del préstamo es el precio más los intereses. ¿Cuánto pagará Sam en total?"),
            { unit: "money", answer: [660, 11000], tol: 0.5 },
            [T("Price {$600|10000} plus interest {$60|1000}.", "Precio {$600|10000} más intereses {$60|1000}."), T("= {$660|11000}.", "= {$660|11000}.")]
          ),
          choice(
            "borrow_test",
            T("Which question helps most in deciding?", "¿Qué pregunta ayuda más a decidir?"),
            [T("What does it cost in total, and what does waiting cost me?", "¿Cuánto cuesta en total y cuánto me cuesta esperar?"), T("Can I get approved?", "¿Me aprobarán?"), T("What's the lowest monthly payment?", "¿Cuál es el pago mensual más bajo?")],
            0,
            T("Total cost against the cost of waiting is the heart of it.", "El costo total frente al costo de esperar es lo central."),
            [null, T("Approval says the lender is willing, not that it's worth it.", "La aprobación dice que el prestamista quiere, no que valga la pena."), T("A low payment can hide a high total.", "Un pago bajo puede esconder un total alto.")]
          ),
          card(
            T("Four questions", "Cuatro preguntas"),
            T(
              "Many people ask: What's the total cost? Could I pay in a slow month? What happens if I wait or don't borrow? Does it last, or help me earn more? Comparing the APR or CAT lets you set offers side by side. These are questions, not a rule.",
              "Mucha gente pregunta: ¿Cuál es el costo total? ¿Podría pagar en un mes lento? ¿Qué pasa si espero o no pido prestado? ¿Dura, o me ayuda a ganar más? Comparar el CAT o la tasa te permite poner las ofertas lado a lado. Son preguntas, no una regla."
            )
          ),
          scenario(
            "borrow_test",
            T("Your bike, needed to get to work, breaks. A repair costs {$200|3500} and you have {$50|900} saved. What do you do first?", "Se descompone tu bicicleta, que necesitas para ir a trabajar. La reparación cuesta {$200|3500} y tienes {$50|900} ahorrados. ¿Qué haces primero?"),
            [
              fit(T("Compare the total cost of borrowing, other ways to pay, and the cost of waiting", "Comparas el costo total de pedir prestado, otras formas de pagar y el costo de esperar"), "good", T("You see the whole picture before you choose.", "Ves el panorama completo antes de elegir.")),
              fit(T("Ask a family member whether they could help, then decide", "Le preguntas a un familiar si podría ayudar y luego decides"), "ok", T("Another option to weigh, though the cost question remains.", "Es otra opción para valorar, pero sigue la pregunta del costo.")),
              fit(T("Take the first loan offered", "Aceptas el primer préstamo que te ofrezcan"), "poor", T("You haven't compared the cost or the alternatives.", "No has comparado el costo ni las alternativas."))
            ],
            T("Compare before you commit.", "Compara antes de comprometerte.")
          ),
          act("goals.debt", T("See how long {$1000|15000} at 24% takes to pay off, and how paying more changes it.", "Mira cuánto tardas en pagar {$1000|15000} al 24% y cómo cambia si pagas más."), { balance: [1000, 15000], apr: 24, payment: [50, 750] })
        ]
      }
    ]
  }
];
