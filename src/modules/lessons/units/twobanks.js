// UNIT — Banking in two countries (Wave 1, Life Across Borders, Build; Border).
// DRAFT: not in the app until a reviewer signs it off. To ship it, follow the steps at the top of
// sending.js (reviewed, LOADERS, "why.twobanks", mission, order in the course).
// Mission to add then: "Read what one bank asks for to open an account: the list of IDs, proof of
// address and tax number (just reading, don't apply)". Reflection: "What surprised you?"
// Border units write both countries at once, so amounts are {US$…} and {MX$…}.
// The people and the example fees are made up. No real bank is named or ranked.
import { T, card, choice, tf, act, concept, order, match, number, scenario, fit } from "./helpers.js";

export default {
  id: "twobanks",
  icon: "building",
  draft: true,
  title: T("Banking in two countries", "Bancos en dos países"),
  sources: [
    // Read on the checked date. A human reviewer re-checks each one (see docs/CONTENT-REVIEW.md).
    { name: "CFPB, \"A Newcomer's Guide to Managing Money\": checklist for opening a bank or credit union account (papers, opening deposit, minimum balance)", url: "https://files-prod.consumerfinance.gov/f/documents/cfpb_checklist_opening_bank_account_web.pdf", checked: "2026-11-17" },
    { name: "CONDUSEF, \"Paisano, ¿sabes cómo abrir una cuenta en México…?\" (2014): matrícula consular, CURP, proof of address", url: "https://www.gob.mx/condusef/prensa/paisano-sabes-como-abrir-una-cuenta-en-mexico-y-que-opciones-tienes-para-el-envio-de-remesas", checked: "2026-11-17" },
    { name: "CONDUSEF, \"Ahorrar en dólares o en pesos mexicanos\" (2023): dollar accounts, fees, conversion", url: "https://revista.condusef.gob.mx/usuario-inteligente/tu-bolsillo/2023/09/ahorrar-endolares-o-en-pesos-mexicanos/", checked: "2026-11-17" },
  ],
  concepts: [
    concept(
      "bank_papers",
      T("Papers a bank asks for", "Papeles que pide un banco"),
      card(
        T("Who, where, which number", "Quién, dónde, qué número"),
        T(
          "A bank checks who you are, where you live and an ID or tax number. Which papers count differs by bank and by country, so asking first saves a trip.",
          "Un banco revisa quién eres, dónde vives y un número de identificación o de impuestos. Qué papeles sirven cambia según el banco y el país, así que preguntar antes te ahorra un viaje."
        )
      ),
      tf("bank_papers", T("Every bank accepts the same papers.", "Todos los bancos aceptan los mismos papeles."), false, T("Each bank sets its own list, so asking first is worth it.", "Cada banco tiene su propia lista, así que vale la pena preguntar antes.")),
      choice(
        "bank_papers",
        T("You have a passport and no Social Security number. What's a good first step to open a US account?", "Tienes pasaporte y no tienes número de Seguro Social. ¿Qué es un buen primer paso para abrir una cuenta en EE. UU.?"),
        [T("Ask which papers the bank accepts, like a passport number or an ITIN", "Preguntar qué papeles acepta el banco, como el número de pasaporte o un ITIN"), T("Skip it, accounts always need an SSN", "Dejarlo, las cuentas siempre piden SSN"), T("Borrow someone else's number", "Prestarte el número de otra persona")],
        0,
        T("Banks verify identity with several kinds of papers. Which ones count is the bank's choice.", "Los bancos verifican la identidad con varios tipos de papeles. Cuáles sirven lo decide el banco."),
        [null, T("Many banks accept other papers. You find out by asking.", "Muchos bancos aceptan otros papeles. Lo sabes preguntando."), T("Using another person's number is fraud, and the bank checks it.", "Usar el número de otra persona es fraude, y el banco lo revisa.")]
      )
    ),
    concept(
      "other_account",
      T("An account in the other country", "Una cuenta en el otro país"),
      card(
        T("Each side has its own rules", "Cada lado tiene sus reglas"),
        T(
          "An account in the other country comes with its own papers, its own fees and its own deposit insurance. The first country's insurance doesn't follow your money across the border.",
          "Una cuenta en el otro país trae sus propios papeles, sus propias comisiones y su propio seguro de depósitos. El seguro del primer país no acompaña a tu dinero al cruzar la frontera."
        )
      ),
      tf("other_account", T("Deposit insurance from one country covers your account in the other.", "El seguro de depósitos de un país cubre tu cuenta en el otro."), false, T("FDIC covers US banks and IPAB covers Mexican banks. Each stays on its own side.", "El FDIC cubre bancos de EE. UU. y el IPAB cubre bancos de México. Cada uno se queda de su lado.")),
      choice(
        "other_account",
        T("What's true about a second account in the other country?", "¿Qué es cierto de una segunda cuenta en el otro país?"),
        [T("It has its own fees and its own deposit insurance", "Tiene sus propias comisiones y su propio seguro de depósitos"), T("It follows the first country's rules", "Sigue las reglas del primer país"), T("It has no fees", "No tiene comisiones")],
        0,
        T("Rules, fees and insurance belong to the country where the bank is.", "Las reglas, comisiones y el seguro dependen del país donde está el banco."),
        [null, T("A bank follows the rules of the country where it operates.", "Un banco sigue las reglas del país donde opera."), T("Many accounts charge fees, especially when the balance is low.", "Muchas cuentas cobran comisiones, sobre todo con saldo bajo.")]
      )
    ),
    concept(
      "two_currencies",
      T("Holding two currencies", "Tener dos monedas"),
      card(
        T("Rates move, conversions cost", "El tipo se mueve, convertir cuesta"),
        T(
          "If you hold dollars and spend pesos, what your money buys changes with the exchange rate. Each conversion also costs something, because a bank's rate is usually worse than the fair one.",
          "Si tienes dólares y gastas pesos, lo que compra tu dinero cambia con el tipo de cambio. Cada conversión además cuesta, porque el tipo de un banco suele ser peor que el justo."
        )
      ),
      tf("two_currencies", T("Converting dollars to pesos and back always gives you the same dollars.", "Convertir dólares a pesos y de regreso siempre te devuelve los mismos dólares."), false, T("The rate moves, and each conversion has a gap, so you can end up with less.", "El tipo de cambio se mueve y cada conversión tiene una diferencia, así que puedes quedar con menos.")),
      choice(
        "two_currencies",
        T("Two banks convert {US$100}: one at {MX$17.8}, one at {MX$17.4}. The fair rate is {MX$18}. Which costs more?", "Dos bancos convierten {US$100}: uno a {MX$17.8} y otro a {MX$17.4}. El tipo justo es {MX$18}. ¿Cuál cuesta más?"),
        [T("The bank at {MX$17.8}", "El banco a {MX$17.8}"), T("The bank at {MX$17.4}", "El banco a {MX$17.4}"), T("They cost the same", "Cuestan igual")],
        1,
        T("{MX$17.4} is {MX$0.6} below fair, so {MX$60} short. {MX$17.8} is only {MX$20} short.", "{MX$17.4} está {MX$0.6} abajo de lo justo, o sea {MX$60} de menos. {MX$17.8} solo {MX$20}."),
        [T("{MX$17.8} is closer to fair, so it keeps more pesos for you.", "{MX$17.8} está más cerca de lo justo, así que te deja más pesos."), null, T("Compare each rate to {MX$18}. The gaps differ.", "Compara cada tipo con {MX$18}. Las diferencias son distintas.")]
      )
    ),
    concept(
      "account_upkeep",
      T("Keeping an account in good shape", "Mantener una cuenta en orden"),
      card(
        T("Fees don't stop when you do", "Las comisiones no paran cuando tú paras"),
        T(
          "An unused account can still charge fees or be closed. Before leaving an account alone or closing it, people check the fee, the minimum balance and the bank's policy on unused accounts.",
          "Una cuenta sin uso aún puede cobrar comisiones o cerrarse. Antes de dejarla quieta o cerrarla, la gente revisa la comisión, el saldo mínimo y la política del banco sobre cuentas sin uso."
        )
      ),
      tf("account_upkeep", T("An account you never use can't cost you anything.", "Una cuenta que nunca usas no te puede costar nada."), false, T("Monthly fees can keep coming, and the balance can run out.", "Las comisiones mensuales pueden seguir y el saldo puede acabarse.")),
      choice(
        "account_upkeep",
        T("Which step comes first when closing an account?", "¿Qué paso va primero al cerrar una cuenta?"),
        [T("Move the money you want to keep and move automatic payments", "Mover el dinero que quieres conservar y cambiar los pagos automáticos"), T("Just stop using it", "Solo dejar de usarla"), T("Take everything out in cash and walk away", "Sacar todo en efectivo e irte")],
        0,
        T("Payments aimed at a closed account can bounce, so move them first.", "Los pagos hacia una cuenta cerrada pueden rebotar, así que cámbialos primero."),
        [null, T("An unused account can keep charging fees.", "Una cuenta sin uso puede seguir cobrando comisiones."), T("It leaves automatic payments aimed at an account that may stay open.", "Deja pagos automáticos apuntando a una cuenta que quizá siga abierta.")]
      )
    )
  ],
  lessons: [
    {
      id: "twobanks-1",
      title: T("What banks ask for", "Lo que piden los bancos"),
      life: T("Before you visit a bank, call and ask which IDs and papers it accepts.", "Antes de ir a un banco, llama y pregunta qué identificaciones y papeles acepta."),
      steps: [
        card(
          T("Daniel's passport", "El pasaporte de Daniel"),
          T(
            "Daniel moves from Tijuana to San Diego with a passport and a matrícula consular. He has no Social Security number. The bank wants to know who he is, where he lives and his tax number. Can he open an account?",
            "Daniel se muda de Tijuana a San Diego con un pasaporte y una matrícula consular. No tiene número de Seguro Social. El banco quiere saber quién es, dónde vive y su número de impuestos. ¿Puede abrir una cuenta?"
          )
        ),
        choice(
          "bank_papers",
          T("Which is true about opening a US account without a Social Security number?", "¿Qué es cierto sobre abrir una cuenta en EE. UU. sin número de Seguro Social?"),
          [T("It depends on the bank: many accept a passport number or an ITIN, and some a consular ID", "Depende del banco: muchos aceptan número de pasaporte o un ITIN, y algunos una identificación consular"), T("No US bank will open one", "Ningún banco de EE. UU. la abre"), T("Every bank must accept a matrícula consular", "Todos los bancos deben aceptar una matrícula consular")],
          0,
          T("Banks check name, birth date, address and an ID number. Which papers count is each bank's choice.", "Los bancos revisan nombre, fecha de nacimiento, domicilio y un número de identificación. Cuáles papeles sirven lo decide cada banco."),
          [null, T("Many banks do. The papers they take differ.", "Muchos sí. Los papeles que aceptan varían."), T("Accepting a consular ID is the bank's choice, not a rule.", "Aceptar una identificación consular es decisión del banco, no una regla.")]
        ),
        card(
          T("Three jobs for papers", "Tres trabajos para los papeles"),
          T(
            "A bank checks who you are, where you live and your number. In the US, an ITIN is an IRS tax number for people who can't get a Social Security number. In Mexico, banks usually ask for an official ID and a recent proof of address.",
            "Un banco revisa quién eres, dónde vives y tu número. En EE. UU., un ITIN es un número de impuestos del IRS para quien no puede obtener número de Seguro Social. En México, los bancos suelen pedir una identificación oficial y un comprobante de domicilio reciente."
          )
        ),
        match(
          "bank_papers",
          T("Match each paper to what it is.", "Une cada papel con lo que es."),
          [
            [T("ITIN", "ITIN"), T("A US tax number for people without an SSN", "Un número de impuestos de EE. UU. para quien no tiene SSN")],
            [T("Matrícula consular", "Matrícula consular"), T("An ID card from a Mexican consulate", "Una identificación de un consulado de México")],
            [T("Comprobante de domicilio", "Comprobante de domicilio"), T("A recent bill showing where you live", "Un recibo reciente que muestra dónde vives")]
          ],
          T("Each answers a different question for the bank.", "Cada uno responde una pregunta distinta para el banco.")
        ),
        tf("bank_papers", T("Banks in Mexico usually ask for a proof of address, like a recent bill.", "Los bancos en México suelen pedir un comprobante de domicilio, como un recibo reciente."), true, T("They need an address to send mail, and they usually want it recent.", "Necesitan un domicilio para mandar correspondencia, y suelen querer uno reciente.")),
        act("goals.create", T("Make a goal for an opening deposit and a cushion above the minimum balance.", "Crea una meta para el depósito de apertura y un colchón sobre el saldo mínimo."), { name: { en: "Opening a new account", es: "Abrir una cuenta nueva" }, target: [200, 3600], months: 3 })
      ]
    },
    {
      id: "twobanks-2",
      title: T("An account in the other country", "Una cuenta en el otro país"),
      life: T("Ask the bank what an account costs to keep: the minimum balance, the monthly fee and card fees abroad.", "Pregunta al banco cuánto cuesta mantener una cuenta: saldo mínimo, comisión mensual y comisiones de tarjeta en el extranjero."),
      steps: [
        card(
          T("Two accounts, two fee lists", "Dos cuentas, dos listas de comisiones"),
          T(
            "Paola lives in El Paso and works in Ciudad Juárez some weeks, so she keeps an account in each country. Her US account charges {US$10} a month unless she keeps {US$500} in it. Which fee do you watch?",
            "Paola vive en El Paso y a veces trabaja en Ciudad Juárez, así que tiene una cuenta en cada país. Su cuenta de EE. UU. cobra {US$10} al mes a menos que mantenga {US$500}. ¿Qué comisión vigilas?"
          )
        ),
        choice(
          "other_account",
          T("Paola's US balance drops to {US$300} for a month. What may happen?", "El saldo de Paola en EE. UU. baja a {US$300} un mes. ¿Qué puede pasar?"),
          [T("She may pay the monthly fee", "Puede pagar la comisión mensual"), T("Nothing changes", "No cambia nada"), T("The account closes at once", "La cuenta se cierra de inmediato")],
          0,
          T("Many accounts waive the fee only above a minimum balance, and hers fell below.", "Muchas cuentas quitan la comisión solo arriba de un saldo mínimo, y el suyo bajó de él."),
          [null, T("A fee tied to a minimum balance applies when the balance drops below it.", "Una comisión ligada a un saldo mínimo aplica cuando el saldo baja de él."), T("A low balance usually means a fee, not an instant closing.", "Un saldo bajo suele significar una comisión, no un cierre inmediato.")]
        ),
        card(
          T("Why people keep two", "Por qué algunos tienen dos"),
          T(
            "A second account lets you pay in local money. It also means two fee lists, two sets of papers and deposit insurance that stays on its own side. Reporting rules for accounts abroad are in \"Money across borders\".",
            "Una segunda cuenta permite pagar en moneda local. También trae dos listas de comisiones, dos juegos de papeles y un seguro de depósitos que se queda de su lado. Las reglas para reportar cuentas en el extranjero están en \"Dinero entre fronteras\"."
          )
        ),
        number(
          "other_account",
          T("Paola's Mexican account charges {MX$100} in months her average balance is low. That happened in 4 months. How many pesos in fees?", "La cuenta mexicana de Paola cobra {MX$100} en los meses con saldo promedio bajo. Pasó en 4 meses. ¿Cuántos pesos de comisiones?"),
          { unit: "number", answer: 400, tol: 0.5 },
          [T("Fee per low month: 100 pesos.", "Comisión por mes bajo: 100 pesos."), T("100 × 4 = 400 pesos.", "100 × 4 = 400 pesos.")]
        ),
        scenario(
          "other_account",
          T("You'll spend a year in Mexico and have a US account. What do you compare first?", "Pasarás un año en México y tienes una cuenta en EE. UU. ¿Qué comparas primero?"),
          [
            fit(T("What each account costs to keep, and what a second account needs", "Cuánto cuesta mantener cada cuenta y qué pide una segunda cuenta"), "good", T("Fees and papers decide what fits.", "Las comisiones y los papeles deciden qué te conviene.")),
            fit(T("Keep the US account without checking its fees", "Dejar la cuenta de EE. UU. sin revisar sus comisiones"), "ok", T("It may stay open, but fees can quietly add up.", "Quizá siga abierta, pero las comisiones se pueden acumular sin que lo notes.")),
            fit(T("Close it now and decide later", "Cerrarla ya y decidir después"), "poor", T("Bills and deposits may still point to it.", "Los pagos y depósitos pueden seguir apuntando a ella."))
          ],
          T("Check the costs on both sides before changing anything.", "Revisa los costos de ambos lados antes de cambiar algo.")
        ),
        act("goals.fees", T("Change how you'd use each account and watch the yearly cost change.", "Cambia cómo usarías cada cuenta y mira cómo cambia el costo anual."))
      ]
    },
    {
      id: "twobanks-3",
      title: T("Dollars in Mexico, pesos in the US", "Dólares en México, pesos en EE. UU."),
      life: T("If a bank offers a dollar account, ask who can open it, what it costs and what rate it uses to convert.", "Si un banco ofrece una cuenta en dólares, pregunta quién la puede abrir, cuánto cuesta y qué tipo de cambio usa."),
      steps: [
        card(
          T("A dollar account in Monterrey", "Una cuenta en dólares en Monterrey"),
          T(
            "Elena, in Monterrey, is paid in dollars by a US client. A Mexican bank offers her a dollar account. CONDUSEF says these often come with conditions, higher fees and less favorable rates. What does converting really cost her?",
            "Elena, en Monterrey, recibe dólares de un cliente de EE. UU. Un banco mexicano le ofrece una cuenta en dólares. La CONDUSEF dice que suelen tener condiciones, comisiones más altas y tipos de cambio menos favorables. ¿Cuánto le cuesta convertir en realidad?"
          )
        ),
        number(
          "two_currencies",
          T("The bank converts at {MX$17.2}. The fair rate is {MX$18}. On {US$1000}, how many pesos does the gap cost Elena?", "El banco convierte a {MX$17.2}. El tipo justo es {MX$18}. En {US$1000}, ¿cuántos pesos le cuesta la diferencia a Elena?"),
          { unit: "number", answer: 800, tol: 0.5 },
          [T("Gap per dollar: 18 − 17.2 = 0.8 pesos.", "Diferencia por dólar: 18 − 17.2 = 0.8 pesos."), T("1000 × 0.8 = 800 pesos.", "1000 × 0.8 = 800 pesos.")]
        ),
        card(
          T("Pesos in the US", "Pesos en EE. UU."),
          T(
            "Most accounts at US banks hold dollars. Holding pesos usually means converting through a service made for it, and each conversion has a rate gap. Ask whether an account can hold pesos, and how the money is protected if it can.",
            "La mayoría de las cuentas en bancos de EE. UU. son en dólares. Tener pesos suele implicar convertir con un servicio hecho para eso, y cada conversión tiene su diferencia. Pregunta si una cuenta puede tener pesos y cómo se protege el dinero si puede."
          )
        ),
        choice(
          "two_currencies",
          T("You save in dollars but spend in pesos. What changes how many pesos you'll have?", "Ahorras en dólares pero gastas en pesos. ¿Qué cambia cuántos pesos tendrás?"),
          [T("The rate on the day you convert, plus the conversion cost", "El tipo de cambio del día que conviertas, más el costo de convertir"), T("Nothing, dollars are fixed", "Nada, los dólares son fijos"), T("Only the bank's name", "Solo el nombre del banco")],
          0,
          T("Rates move both ways, and every conversion costs something.", "El tipo de cambio sube y baja, y cada conversión cuesta algo."),
          [null, T("Dollars are fixed in dollars, not in pesos.", "Los dólares son fijos en dólares, no en pesos."), T("The bank's rate and fees matter more than its name.", "El tipo de cambio y las comisiones del banco importan más que su nombre.")]
        ),
        tf("two_currencies", T("Moving dollars to pesos and back costs nothing if the rate doesn't move.", "Pasar dólares a pesos y de regreso no cuesta nada si el tipo de cambio no se mueve."), false, T("Each conversion uses a rate with a gap, so you can lose money even if the rate stays put.", "Cada conversión usa un tipo con diferencia, así que puedes perder dinero aunque el tipo no se mueva.")),
        act("goals.remit", T("Try a bigger amount and see how a rate gap grows.", "Prueba un monto mayor y mira cómo crece una diferencia en el tipo de cambio."))
      ]
    },
    {
      id: "twobanks-4",
      title: T("Money in two currencies", "Dinero en dos monedas"),
      life: T("List your bills by currency, and note which ones you pay in the same currency you earn.", "Anota tus gastos por moneda y marca cuáles pagas en la misma moneda en que ganas."),
      steps: [
        card(
          T("Rent in pesos, pay in dollars", "Renta en pesos, sueldo en dólares"),
          T(
            "Hugo is paid {US$600} every two weeks in Laredo. His rent in Nuevo Laredo is {MX$7200} a month. Each time he converts, the rate is a little different. How many dollars does the rent need?",
            "A Hugo le pagan {US$600} cada dos semanas en Laredo. Su renta en Nuevo Laredo es de {MX$7200} al mes. Cada vez que convierte, el tipo de cambio es un poco distinto. ¿Cuántos dólares necesita la renta?"
          )
        ),
        number(
          "two_currencies",
          T("If the rate falls to {MX$16}, how many dollars does the {MX$7200} rent need?", "Si el tipo de cambio baja a {MX$16}, ¿cuántos dólares necesita la renta de {MX$7200}?"),
          { unit: "number", answer: 450, tol: 0.5 },
          [T("At 18 pesos per dollar the rent is 400 dollars.", "A 18 pesos por dólar la renta son 400 dólares."), T("At 16: 7200 ÷ 16 = 450 dollars.", "A 16: 7200 ÷ 16 = 450 dólares.")]
        ),
        card(
          T("Match and leave room", "Empareja y deja margen"),
          T(
            "One way to cut rate risk is to match: pesos for peso bills, dollars for dollar bills, so you convert less. Rates move both ways, so some room in the budget covers a bad month. Nobody can predict the rate.",
            "Una forma de reducir el riesgo del tipo de cambio es emparejar: pesos para gastos en pesos y dólares para gastos en dólares, así conviertes menos. El tipo sube y baja, así que algo de margen cubre un mal mes. Nadie puede predecir el tipo de cambio."
          )
        ),
        tf("two_currencies", T("When the rate drops from {MX$18} to {MX$16}, {US$400} buys fewer pesos.", "Cuando el tipo baja de {MX$18} a {MX$16}, {US$400} compran menos pesos."), true, T("400 × 16 = {MX$6400}, against {MX$7200} at 18.", "400 × 16 = {MX$6400}, contra {MX$7200} a 18.")),
        order(
          "two_currencies",
          T("Put these steps in order to plan a month with bills in two currencies.", "Pon estos pasos en orden para planear un mes con gastos en dos monedas."),
          [T("List your bills by currency", "Anota tus gastos por moneda"), T("Note when and in what currency you're paid", "Anota cuándo y en qué moneda te pagan"), T("Match income to bills in the same currency", "Empareja ingresos con gastos de la misma moneda"), T("Plan the part you must convert, with room for the rate", "Planea la parte que debes convertir, con margen para el tipo de cambio")],
          T("You can't match what you haven't listed.", "No puedes emparejar lo que no has anotado.")
        ),
        act("goals.budget", T("Plan a month where rent is in one currency and groceries in the other.", "Planea un mes donde la renta es en una moneda y el súper en la otra."), { income: [1500, 27000] })
      ]
    },
    {
      id: "twobanks-5",
      title: T("Fees, closing and unused accounts", "Comisiones, cierre y cuentas sin uso"),
      life: T("Ask each bank what happens to an account you stop using.", "Pregunta a cada banco qué pasa con una cuenta que dejas de usar."),
      steps: [
        card(
          T("The account nobody used", "La cuenta que nadie usó"),
          T(
            "Iván moved from Houston to Guadalajara and stopped using his US account. Monthly fees slowly used up the balance, and the bank closed it. Iván is made up, but the pattern is real. What could he have checked?",
            "Iván se mudó de Houston a Guadalajara y dejó de usar su cuenta de EE. UU. Las comisiones mensuales fueron acabando el saldo y el banco la cerró. Iván es inventado, pero el patrón es real. ¿Qué pudo haber revisado?"
          )
        ),
        choice(
          "account_upkeep",
          T("What could Iván have checked before leaving?", "¿Qué pudo revisar Iván antes de irse?"),
          [T("The monthly fee, the minimum balance and the policy on unused accounts", "La comisión mensual, el saldo mínimo y la política sobre cuentas sin uso"), T("Nothing, banks never charge unused accounts", "Nada, los bancos nunca cobran cuentas sin uso"), T("Only the bank's name", "Solo el nombre del banco")],
          0,
          T("Those three show whether an account can sit quietly or will cost him.", "Esos tres muestran si una cuenta puede quedarse quieta o le va a costar."),
          [null, T("Many accounts keep charging fees while unused.", "Muchas cuentas siguen cobrando comisiones aunque no se usen."), T("A name says nothing about fees or unused-account rules.", "Un nombre no dice nada de comisiones ni de reglas para cuentas sin uso.")]
        ),
        card(
          T("Before you close one", "Antes de cerrar una"),
          T(
            "Closing takes a few steps: move the money you want to keep, switch automatic payments and deposits, ask the bank to close the account, and keep the written confirmation. Rules for unused accounts differ by bank and by place, so ask for the policy.",
            "Cerrar una cuenta lleva algunos pasos: mover el dinero que quieres conservar, cambiar pagos y depósitos automáticos, pedir al banco que la cierre y guardar la confirmación por escrito. Las reglas para cuentas sin uso cambian según el banco y el lugar, así que pide la política."
          )
        ),
        order(
          "account_upkeep",
          T("Put the steps of closing an account in order.", "Pon en orden los pasos para cerrar una cuenta."),
          [T("Move the money you want to keep", "Mueve el dinero que quieres conservar"), T("Switch automatic payments and deposits", "Cambia los pagos y depósitos automáticos"), T("Ask the bank to close it", "Pide al banco que la cierre"), T("Keep the written confirmation", "Guarda la confirmación por escrito")],
          T("Each step protects the next one.", "Cada paso protege al siguiente.")
        ),
        tf("account_upkeep", T("Leaving an account unused is free, so it can't cost you.", "Dejar una cuenta sin uso es gratis, así que no te puede costar."), false, T("Fees can keep coming, and a low balance can run out.", "Las comisiones pueden seguir y un saldo bajo puede acabarse.")),
        act("goals.fees", T("Compare two accounts and see which costs less if you barely use one.", "Compara dos cuentas y mira cuál cuesta menos si casi no usas una."))
      ]
    }
  ]
};
