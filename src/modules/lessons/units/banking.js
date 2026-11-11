// UNIT — Banking for real. Its lessons and the concepts they teach (format in helpers.js).
import { T, card, choice, tf, act, concept, match, spot, tap, scenario, fit, number } from "./helpers.js";

export default {
  id: "banking",
  icon: "building",
  title: T("Banking for real", "Bancos en la vida real"),
  concepts: [
    concept(
      "checking_savings",
      T("Checking vs. savings", "Cuenta para gastar vs. de ahorro", { en: "Debit vs. savings accounts", es: "Cuenta de débito vs. de ahorro" }),
      card(T("One for spending, one for saving", "Una para gastar, otra para ahorrar"), T("A checking account is for money that comes and goes: your debit card, payments, transfers. A savings account is for money you're keeping, and it usually pays more interest. Many people use both, so savings don't get spent by accident.", "Una cuenta de cheques es para el dinero que entra y sale: tu tarjeta de débito, pagos, transferencias. Una cuenta de ahorro es para el dinero que guardas, y normalmente paga más intereses. Mucha gente usa las dos para que el ahorro no se gaste por accidente.", { en: "A debit account (or payroll account, \"cuenta de nómina\") is for money that comes and goes: your card, payments, transfers. A savings account or investment is for money you're keeping, and it usually pays more. Many people use both, so savings don't get spent by accident.", es: "Una cuenta de débito (o de nómina) es para el dinero que entra y sale: tu tarjeta, pagos, transferencias. Una cuenta de ahorro o una inversión es para el dinero que guardas, y normalmente paga más. Mucha gente usa las dos para que el ahorro no se gaste por accidente." })),
      tf("checking_savings", T("A savings account is usually for money you're keeping, not spending day to day.", "Una cuenta de ahorro suele ser para el dinero que guardas, no para gastar a diario."), true, T("That's the split: spending money in one place, saved money in another.", "Esa es la división: el dinero para gastar en un lugar y el ahorrado en otro.")),
      choice(
        "checking_savings",
        T("Why do many people keep savings in a separate account from their spending money?", "¿Por qué mucha gente guarda su ahorro en una cuenta aparte del dinero para gastar?"),
        [T("So savings don't get spent by accident, and they can earn more interest", "Para que el ahorro no se gaste por accidente y pueda ganar más intereses"), T("Because banks don't allow both in one account", "Porque los bancos no permiten las dos cosas en una cuenta"), T("So they pay more fees", "Para pagar más comisiones")],
        0,
        T("Out of sight, out of your card's reach — and savings accounts usually pay more than spending accounts.", "Lejos de la vista y del alcance de tu tarjeta; además, las cuentas de ahorro suelen pagar más que las de gastos."),
        [null, T("You can keep everything in one account. Splitting it is a habit, not a rule.", "Puedes tener todo en una cuenta. Separarlo es un hábito, no una regla."), T("Two accounts don't have to cost more. Plenty of savings accounts have no monthly fee.", "Dos cuentas no tienen por qué costar más. Hay muchas cuentas de ahorro sin comisión mensual.")]
      )
    ),
    concept(
      "bank_fees",
      T("Bank fees", "Comisiones bancarias"),
      card(T("Fees are a price, too", "Las comisiones también son un precio"), T("Common fees: a monthly maintenance fee (often waived with a minimum balance or direct deposit), using another bank's ATM, and overdraft fees when you spend more than you have. They're all listed in the account's fee schedule.", "Comisiones comunes: una comisión mensual (a veces se quita si mantienes un saldo mínimo o depositas tu sueldo), usar cajeros de otro banco y cargos por sobregiro cuando gastas más de lo que tienes. Todas aparecen en la lista de comisiones de la cuenta.", { en: "Common fees: a monthly fee if you go under a minimum balance, using another bank's ATM, and charges for things like replacing a card. Banks must publish them — CONDUSEF's site lets you compare.", es: "Comisiones comunes: una comisión mensual si bajas del saldo mínimo, usar cajeros de otro banco y cargos por cosas como reponer una tarjeta. Los bancos deben publicarlas, y en el sitio de la CONDUSEF puedes compararlas." })),
      tf("bank_fees", T("Using another bank's ATM can cost you a fee.", "Usar un cajero de otro banco te puede costar una comisión."), true, T("Often from both banks. Small fees add up when they happen every week.", "A veces de los dos bancos. Las comisiones pequeñas suman cuando pasan cada semana.")),
      choice(
        "bank_fees",
        T("An account charges {$12|150} a month unless you keep {$1500|20000} in it. You usually have about {$300|4000}. What's the yearly cost?", "Una cuenta cobra {$12|150} al mes salvo que mantengas {$1500|20000}. Normalmente tienes unos {$300|4000}. ¿Cuánto cuesta al año?"),
        [T("{$144|1800}", "{$144|1800}"), T("{$12|150}", "{$12|150}"), T("Nothing", "Nada")],
        0,
        T("You're under the minimum every month, so it's {$12|150} × 12 = {$144|1800} a year — for an account a free one could replace.", "Estás por debajo del mínimo cada mes, así que son {$12|150} × 12 = {$144|1800} al año, por una cuenta que una gratuita podría reemplazar."),
        [null, T("That's one month. The fee repeats every month you're under the minimum.", "Eso es un mes. La comisión se repite cada mes que estás por debajo del mínimo."), T("The fee is only waived above the minimum, and you're below it.", "La comisión solo se quita por encima del mínimo, y estás por debajo.")]
      )
    ),
    concept(
      "comparing_accounts",
      T("Comparing accounts", "Comparar cuentas"),
      card(T("Compare the yearly number", "Compara el número anual"), T("To compare savings accounts, look at the APY — the yearly return including compounding — and the fees. Check that it's FDIC insured (or NCUA at a credit union). A high rate with high fees can lose to a plain, free account.", "Para comparar cuentas de ahorro, revisa la APY (el rendimiento anual incluyendo el interés compuesto) y las comisiones. Confirma que esté asegurada por el FDIC (o la NCUA en una cooperativa). Una tasa alta con comisiones altas puede perder contra una cuenta sencilla y gratis.", { en: "To compare savings or investment accounts, look at the GAT — the yearly return including compounding — and the fees. Check that the institution is regulated and that deposits are protected by IPAB (banks) where it applies. A high rate with high fees can lose to a plain, free account.", es: "Para comparar cuentas de ahorro o inversión, revisa la GAT (el rendimiento anual incluyendo el interés compuesto) y las comisiones. Confirma que la institución esté regulada y que los depósitos estén protegidos por el IPAB (en bancos) cuando aplique. Una tasa alta con comisiones altas puede perder contra una cuenta sencilla y gratis." })),
      tf("comparing_accounts", T("When comparing savings accounts, fees matter as well as the interest rate.", "Al comparar cuentas de ahorro, importan las comisiones además de la tasa."), true, T("What you keep is interest minus fees.", "Lo que te queda son los intereses menos las comisiones.")),
      choice(
        "comparing_accounts",
        T("You'll keep {$1000|15000} saved. Which account leaves you with more after a year?", "Vas a tener {$1000|15000} ahorrados. ¿Qué cuenta te deja más después de un año?"),
        [T("4% a year, no fees", "4% al año, sin comisiones"), T("5% a year, {$5|75} monthly fee", "5% al año, comisión mensual de {$5|75}"), T("They end up the same", "Terminan igual")],
        0,
        T("4% of {$1000|15000} is {$40|600}. 5% is {$50|750}, but {$5|75} × 12 = {$60|900} in fees leaves you {$10|150} behind.", "El 4% de {$1000|15000} son {$40|600}. El 5% son {$50|750}, pero {$5|75} × 12 = {$60|900} de comisiones te dejan {$10|150} abajo."),
        [null, T("The higher rate earns {$50|750}, but the fees take {$60|900} — you'd lose money.", "La tasa más alta gana {$50|750}, pero las comisiones se llevan {$60|900}: perderías dinero."), T("Fees make the difference: one earns {$40|600}, the other ends {$10|150} down.", "Las comisiones hacen la diferencia: una gana {$40|600} y la otra termina {$10|150} abajo.")]
      )
    ),
    concept(
      "debit_credit",
      T("Debit vs. credit cards", "Débito vs. crédito"),
      card(T("Your money vs. a loan", "Tu dinero o un préstamo"), T("A debit card spends money that's already in your account. A credit card borrows from the card company, and you pay it back later — with interest if you don't pay the full balance. Credit cards usually have stronger fraud protection; debit cards make overspending harder.", "Una tarjeta de débito gasta dinero que ya está en tu cuenta. Una de crédito pide prestado a la empresa de la tarjeta y lo pagas después, con intereses si no pagas el total. Las de crédito suelen tener mejor protección contra fraudes; las de débito hacen más difícil gastar de más.")),
      tf("debit_credit", T("A debit card spends money that's already in your account.", "Una tarjeta de débito gasta dinero que ya está en tu cuenta."), true, T("No loan involved — when the money's gone, it's gone.", "No hay préstamo: cuando se acaba el dinero, se acabó.")),
      choice(
        "debit_credit",
        T("You buy a {$60|900} jacket on a credit card and pay only {$20|300} this month. What happens?", "Compras una chamarra de {$60|900} con tarjeta de crédito y este mes pagas solo {$20|300}. ¿Qué pasa?"),
        [T("Interest is charged on the {$40|600} you still owe", "Te cobran intereses sobre los {$40|600} que todavía debes"), T("The bank forgives the rest", "El banco te perdona el resto"), T("It comes out of your savings automatically", "Se descuenta de tu ahorro automáticamente")],
        0,
        T("What you don't pay off is a loan, and loans cost interest.", "Lo que no pagas es un préstamo, y los préstamos cuestan intereses."),
        [null, T("Nothing is forgiven — the {$40|600} stays on your balance.", "No se perdona nada: los {$40|600} siguen en tu saldo."), T("A credit card doesn't touch your savings. The balance just stays — and grows with interest.", "Una tarjeta de crédito no toca tu ahorro. El saldo se queda y crece con los intereses.")]
      )
    ),
  ],
  lessons: [
    {
      id: "banking-1",
      title: T("Checking vs. savings", "Cuenta para gastar vs. de ahorro", { en: "Debit vs. savings accounts", es: "Cuenta de débito vs. de ahorro" }),
      steps: [
        card(T("Two jobs, two accounts", "Dos trabajos, dos cuentas"), T("A checking account handles everyday money: your debit card, paying bills, getting paid. A savings account holds money you're keeping. Savings accounts usually pay more interest and are less tempting to spend.", "Una cuenta de cheques maneja el dinero del día a día: tu tarjeta de débito, pagar cuentas, recibir tu pago. Una cuenta de ahorro guarda el dinero que no vas a gastar. Las de ahorro suelen pagar más intereses y tientan menos.", { en: "A debit account — often your payroll account, \"cuenta de nómina\" — handles everyday money: your card, paying bills, getting paid. A savings account or a simple investment holds money you're keeping. Those usually pay more and are less tempting to spend.", es: "Una cuenta de débito —muchas veces tu cuenta de nómina— maneja el dinero del día a día: tu tarjeta, pagar cuentas, recibir tu sueldo. Una cuenta de ahorro o una inversión sencilla guarda el dinero que no vas a gastar. Esas suelen pagar más y tientan menos." })),
        card(T("Opening your first account", "Abrir tu primera cuenta"), T("You'll usually need an ID and your Social Security number; under 18, often a parent or guardian too. Look for no monthly fee, a free debit card and a good app.", "Normalmente necesitas una identificación y tu número de Seguro Social; si eres menor de 18, a menudo también a tu mamá, papá o tutor. Busca que no cobre comisión mensual, que la tarjeta de débito sea gratis y que la app sea buena.", { en: "You'll usually need an official ID, your CURP and proof of address; under 18, often a parent or guardian too. Some banks offer accounts for minors. Look for no monthly fee and a good app.", es: "Normalmente necesitas una identificación oficial, tu CURP y un comprobante de domicilio; si eres menor de 18, a menudo también a tu mamá, papá o tutor. Algunos bancos tienen cuentas para menores. Busca que no cobre comisión mensual y que la app sea buena." })),
        choice(
          "checking_savings",
          T("Where does money for this week's groceries usually belong?", "¿Dónde suele estar el dinero para el súper de esta semana?"),
          [T("In your checking account", "En tu cuenta de cheques", { en: "In your debit account", es: "En tu cuenta de débito" }), T("In your emergency fund", "En tu fondo de emergencia"), T("In stocks", "En acciones")],
          0,
          T("Everyday spending goes through the everyday account. That keeps savings for saving.", "El gasto diario pasa por la cuenta del día a día. Así el ahorro se queda para ahorrar."),
          [null, T("Groceries are a planned cost, not an emergency. The emergency fund is for surprises.", "El súper es un gasto planeado, no una emergencia. El fondo de emergencia es para imprevistos."), T("Money you need this week shouldn't ride the stock market's ups and downs.", "El dinero que necesitas esta semana no debería depender de las subidas y bajadas de la bolsa.")]
        ),
        tf("checking_savings", T("Keeping all your money in one account makes it easier to spend savings by accident.", "Tener todo tu dinero en una sola cuenta hace más fácil gastarte el ahorro sin querer."), true, T("When savings sit next to your card, every purchase quietly dips into them.", "Cuando el ahorro está junto a tu tarjeta, cada compra lo va tocando sin que lo notes.")),
        scenario(
          "checking_savings",
          T("Your first job starts next week. Where should your pay go?", "Tu primer trabajo empieza la próxima semana. ¿A dónde debería ir tu sueldo?"),
          [
            fit(T("Into checking, with a set amount moved to savings each payday", "A tu cuenta de cheques, pasando una cantidad fija al ahorro cada pago", { en: "Into your payroll account, with a set amount moved to savings each payday", es: "A tu cuenta de nómina, pasando una cantidad fija al ahorro cada pago" }), "good", T("Spending is easy, and saving happens on its own.", "Gastar es fácil y el ahorro se hace solo.")),
            fit(T("All into savings, moving money out when you need it", "Todo al ahorro, sacando dinero cuando lo necesites"), "ok", T("You save more by default, but everyday payments get clumsy.", "Ahorras más sin pensarlo, pero los pagos del día a día se complican.")),
            fit(T("Cash it and keep it at home", "Cobrarlo en efectivo y guardarlo en casa"), "poor", T("No protection, no interest, and it's easy to spend or lose.", "Sin protección, sin intereses, y es fácil gastarlo o perderlo.")),
          ],
          T("Two accounts, two jobs: one for spending, one for keeping.", "Dos cuentas, dos trabajos: una para gastar y otra para guardar.")
        ),
        act("goals.compare", T("Compare keeping {$50|1000} a month in cash versus a savings account for a few years.", "Compara guardar {$50|1000} al mes en efectivo contra una cuenta de ahorro durante unos años.", { en: "Compare keeping {$50|1000} a month in cash versus CETES for a few years.", es: "Compara guardar {$50|1000} al mes en efectivo contra CETES durante unos años." }), { show: ["cash", "save"], years: 3 }),
      ],
    },
    {
      id: "banking-2",
      title: T("Fees to watch", "Comisiones a vigilar"),
      steps: [
        card(T("Where fees hide", "Dónde se esconden las comisiones"), T("Monthly maintenance fees, other banks' ATMs, overdrafts, paper statements, replacing a lost card. Each looks small. Together, they can cost more than your savings earn.", "Comisiones mensuales, cajeros de otros bancos, sobregiros, estados de cuenta en papel, reponer una tarjeta perdida. Cada una parece pequeña. Juntas, pueden costar más de lo que gana tu ahorro.", { en: "Monthly fees for going under a minimum balance, other banks' ATMs, replacing a card, some transfers. Each looks small. Together, they can cost more than your savings earn.", es: "Comisiones mensuales por bajar del saldo mínimo, cajeros de otros bancos, reponer una tarjeta, algunas transferencias. Cada una parece pequeña. Juntas, pueden costar más de lo que gana tu ahorro." })),
        card(T("Most fees can be avoided", "Casi todas se pueden evitar"), T("Pick an account without a monthly fee, use your bank's own ATMs, and turn on low-balance alerts. If you're charged a fee by mistake, ask the bank to remove it — they often do.", "Elige una cuenta sin comisión mensual, usa los cajeros de tu banco y activa alertas de saldo bajo. Si te cobran una comisión por error, pide que la quiten; muchas veces lo hacen.", { en: "Pick an account without a monthly fee, use your bank's own ATMs, and turn on balance alerts. If you're charged something you don't recognize, you can file a complaint with the bank and with CONDUSEF.", es: "Elige una cuenta sin comisión mensual, usa los cajeros de tu banco y activa alertas de saldo. Si te cobran algo que no reconoces, puedes reclamar al banco y a la CONDUSEF." })),
        number("bank_fees", T("You take out cash at another bank's ATM twice a week and pay {$3|30} each time. How much is that in a year?", "Sacas efectivo en cajeros de otro banco dos veces por semana y pagas {$3|30} cada vez. ¿Cuánto es al año?"), { unit: "money", answer: [312, 3120] }, [T("{$3|30} × 2 = {$6|60} a week.", "{$3|30} × 2 = {$6|60} a la semana."), T("× 52 weeks = {$312|3120} a year. Your own bank's ATMs would cost nothing.", "× 52 semanas = {$312|3120} al año. Los cajeros de tu banco no costarían nada.")]),
        tf("bank_fees", T("A bank's fees are a secret until you're charged.", "Las comisiones de un banco son secretas hasta que te cobran."), false, T("Banks must publish their fees. Read the fee schedule before you open an account.", "Los bancos deben publicar sus comisiones. Lee la lista antes de abrir una cuenta.")),
        spot(
          "bank_fees",
          T("Your first bank statement. Tap the 3 fees you could probably avoid.", "Tu primer estado de cuenta. Toca las 3 comisiones que probablemente podrías evitar."),
          "receipt",
          T("Monthly statement · YourBank", "Estado de cuenta mensual · TuBanco"),
          [
            tap(T("Paycheck deposit +{$420|6300}", "Depósito de nómina +{$420|6300}")),
            tap(T("Monthly maintenance fee −{$12|150}", "Comisión por manejo de cuenta −{$12|150}"), true),
            tap(T("Card purchase: groceries −{$46|690}", "Compra con tarjeta: súper −{$46|690}")),
            tap(T("Another bank's ATM −{$3|35}", "Cajero de otro banco −{$3|35}"), true),
            tap(T("Overdraft fee −{$35|500}", "Cargo por sobregiro −{$35|500}", { en: "Below-minimum-balance fee −$100", es: "Comisión por saldo mínimo −$100" }), true),
          ],
          T("Many banks drop the monthly fee with direct deposit or a minimum balance, your own bank's ATMs are free, and watching your balance avoids overdrafts.", "Muchos bancos quitan la comisión mensual con depósito de nómina o un saldo mínimo, los cajeros de tu banco no cobran y vigilar tu saldo evita sobregiros.", { en: "Many banks have accounts with no maintenance fee, your own bank's ATMs are free, and keeping the minimum balance avoids that charge.", es: "Muchos bancos tienen cuentas sin comisión por manejo, los cajeros de tu banco no cobran y mantener el saldo mínimo evita ese cargo." })
        ),
        act("goals.fees", T("Compare two accounts and see which costs less for the way you'd use it.", "Compara dos cuentas y mira cuál cuesta menos según cómo la usarías.")),
      ],
    },
    {
      id: "banking-3",
      title: T("Comparing accounts", "Cómo comparar cuentas"),
      steps: [
        card(T("The number to compare", "El número que hay que comparar"), T("Banks show the APY (annual percentage yield): what you'd earn in a year, including compounding. It lets you compare accounts fairly. Rates change, so check again now and then.", "Los bancos muestran la APY (rendimiento porcentual anual): lo que ganarías en un año, incluyendo el interés compuesto. Te deja comparar cuentas de forma justa. Las tasas cambian, así que vuelve a revisar de vez en cuando.", { en: "Banks and investment platforms show the GAT (ganancia anual total): what you'd earn in a year, including compounding. Mexico also shows a \"GAT real\", after expected inflation. Rates change, so check again now and then.", es: "Los bancos y plataformas de inversión muestran la GAT (ganancia anual total): lo que ganarías en un año, incluyendo el interés compuesto. En México también aparece la \"GAT real\", descontando la inflación esperada. Las tasas cambian, así que vuelve a revisar de vez en cuando." })),
        card(T("Safe first, then rate", "Primero seguro, luego la tasa"), T("Check that deposits are insured (FDIC at banks, NCUA at credit unions). Then compare the rate, the fees and how easy it is to move money in and out.", "Revisa que los depósitos estén asegurados (FDIC en bancos, NCUA en cooperativas). Luego compara la tasa, las comisiones y qué tan fácil es meter y sacar dinero.", { en: "Check that the institution is authorized (CONDUSEF's registry lists them) and whether deposits are protected by IPAB. Then compare the rate, the fees and how easy it is to move money in and out.", es: "Revisa que la institución esté autorizada (el registro de la CONDUSEF las lista) y si los depósitos están protegidos por el IPAB. Luego compara la tasa, las comisiones y qué tan fácil es meter y sacar dinero." })),
        choice(
          "comparing_accounts",
          T("What does the APY tell you?", "¿Qué te dice la APY?", { en: "What does the GAT tell you?", es: "¿Qué te dice la GAT?" }),
          [T("What you'd earn in a year, including compounding", "Lo que ganarías en un año, incluyendo el interés compuesto"), T("The monthly fee", "La comisión mensual"), T("How safe the bank is", "Qué tan seguro es el banco")],
          0,
          T("It's the yearly return in one number, so accounts can be compared side by side.", "Es el rendimiento anual en un solo número, para poder comparar cuentas lado a lado."),
          [null, T("Fees are listed separately — and you should check them too.", "Las comisiones aparecen aparte, y también hay que revisarlas."), T("Safety comes from deposit protection and regulation, not the rate.", "La seguridad viene de la protección de depósitos y la regulación, no de la tasa.")]
        ),
        tf("comparing_accounts", T("The account with the highest rate is always the best one.", "La cuenta con la tasa más alta siempre es la mejor."), false, T("Fees, protection and access matter too. A slightly lower rate with no fees can leave you with more.", "También importan las comisiones, la protección y el acceso. Una tasa un poco menor sin comisiones te puede dejar más.")),
        scenario(
          "comparing_accounts",
          T("Two insured savings accounts for your {$1500|15000}. Which leaves you with more after a year?", "Dos cuentas de ahorro protegidas para tus {$1500|15000}. ¿Cuál te deja más después de un año?"),
          [
            fit(T("3.5% a year, no fees", "3.5% al año, sin comisiones"), "good", T("About {$53|525} in interest, and you keep all of it.", "Unos {$53|525} de intereses, y te quedas con todo.")),
            fit(T("4% a year, with a {$5|60} monthly fee", "4% al año, con comisión de {$5|60} al mes"), "poor", T("About {$60|600} in interest, minus {$60|720} in fees: less than the no-fee account.", "Unos {$60|600} de intereses, menos {$60|720} de comisiones: menos que la cuenta sin comisiones.")),
          ],
          T("Compare what you keep: the rate minus the fees.", "Compara lo que te queda: la tasa menos las comisiones.")
        ),
        act("goals.fees", T("Change how you'd use each account and watch the yearly cost change.", "Cambia cómo usarías cada cuenta y mira cómo cambia el costo anual.")),
      ],
    },
    {
      id: "banking-4",
      title: T("Debit vs. credit cards", "Débito vs. crédito"),
      steps: [
        card(T("Same swipe, different money", "Mismo pago, distinto dinero"), T("They look alike, but a debit card takes money from your account right away, while a credit card is a loan you repay later. Paying the full credit balance each month avoids interest; carrying a balance costs a lot.", "Se parecen, pero una tarjeta de débito toma dinero de tu cuenta al momento, y una de crédito es un préstamo que pagas después. Pagar el total del crédito cada mes evita intereses; arrastrar saldo cuesta mucho.")),
        card(T("Each has its strengths", "Cada una tiene lo suyo"), T("Debit: you can't spend money you don't have. Credit: stronger protection if your card is stolen, and on-time payments build your credit history. Either way, check your statement each month.", "Débito: no puedes gastar dinero que no tienes. Crédito: más protección si te roban la tarjeta, y los pagos puntuales construyen tu historial. Con cualquiera, revisa tu estado de cuenta cada mes.")),
        choice(
          "debit_credit",
          T("Which is true about a credit card?", "¿Qué es cierto sobre una tarjeta de crédito?"),
          [T("It's a loan you pay back later", "Es un préstamo que pagas después"), T("It spends money already in your account", "Gasta dinero que ya está en tu cuenta"), T("It's free money from the bank", "Es dinero gratis del banco")],
          0,
          T("Every credit purchase is borrowed money. Paid in full on time, it usually costs no interest.", "Cada compra a crédito es dinero prestado. Si pagas el total a tiempo, normalmente no cuesta intereses."),
          [null, T("That's a debit card.", "Esa es la tarjeta de débito."), T("It's borrowed, not given — you owe every peso or dollar back.", "Es prestado, no regalado: debes devolver cada peso o dólar.")]
        ),
        tf("debit_credit", T("Paying your credit card on time helps build your credit history.", "Pagar tu tarjeta de crédito a tiempo ayuda a construir tu historial crediticio."), true, T("On-time payments are the biggest part of a good history.", "Los pagos puntuales son la parte más importante de un buen historial.")),
        match(
          "debit_credit",
          T("Match each word to what it means.", "Une cada palabra con lo que significa."),
          [
            [T("Debit card", "Tarjeta de débito"), T("Spends money already in your account", "Gasta dinero que ya está en tu cuenta")],
            [T("Statement balance", "Saldo del estado de cuenta"), T("What you owe for the month", "Lo que debes del mes")],
            [T("Credit limit", "Límite de crédito"), T("The most you can borrow on the card", "Lo máximo que te prestan con la tarjeta")],
            [T("Paying in full", "Pagar el total"), T("Avoids interest on a credit card", "Evita intereses en una tarjeta de crédito")],
          ],
          T("Same swipe, different money: yours with debit, the bank's with credit.", "Mismo pago, distinto dinero: el tuyo con débito, el del banco con crédito.")
        ),
        act("goals.debt", T("See what carrying a credit card balance costs — and how paying more changes it.", "Mira cuánto cuesta arrastrar un saldo en la tarjeta y cómo cambia si pagas más."), { balance: [500, 7500], apr: 24, payment: [50, 750] }),
      ],
    },
  ],
};
