// UNIT — Saving. Its lessons and the concepts they teach (format in helpers.js).
import { T, card, choice, tf, act, concept, order, match, number, scenario, fit } from "./helpers.js";

export default {
  id: "save",
  icon: "piggy",
  title: T("Saving", "Ahorro"),
  concepts: [
    concept(
      "pay_yourself_first",
      T("Pay yourself first", "Págate a ti primero"),
      card(T("Savings come out first", "El ahorro sale primero"), T("Picture payday: {$300|4500} arrives. Before buying anything, {$30|450} goes to savings, and you live on the other {$270|4050}. It's easier not to miss money that never reached your spending.", "Imagina el día de pago: llegan {$300|4500}. Antes de comprar nada, {$30|450} se van al ahorro y vives con los otros {$270|4050}. Es más fácil no extrañar el dinero que nunca llegó a tu gasto.")),
      tf("pay_yourself_first", T("Paying yourself first means saving before you spend.", "Pagarte primero significa ahorrar antes de gastar."), true, T("Savings come off the top, like a bill you owe to future-you.", "El ahorro sale primero, como un pago que le debes a tu yo del futuro.")),
      choice(
        "pay_yourself_first",
        T("Which plan is most likely to build savings steadily?", "¿Qué plan tiene más probabilidades de hacer crecer el ahorro de forma constante?"),
        [T("Save whatever is left at the end of the month", "Ahorrar lo que sobre a fin de mes"), T("An automatic transfer to savings on payday", "Una transferencia automática al ahorro el día de pago"), T("Save only when you get a gift or a bonus", "Ahorrar solo cuando te den un regalo o un bono")],
        1,
        T("Automatic and first beats leftover and occasional — it doesn't depend on willpower or luck.", "Automático y primero le gana a lo que sobra y a lo ocasional: no depende de la fuerza de voluntad ni de la suerte."),
        [T("Most months, little or nothing is left. Leftovers aren't a plan.", "Casi todos los meses sobra poco o nada. Lo que sobra no es un plan."), null, T("Gifts and bonuses are irregular, so your savings would be too.", "Los regalos y bonos no son regulares, así que tu ahorro tampoco lo sería.")]
      )
    ),
    concept(
      "emergency_fund",
      T("Emergency fund", "Fondo de emergencia"),
      card(T("A cushion, not a treat jar", "Un colchón, no una alcancía para gustos"), T("An emergency fund is money kept only for surprises you can't avoid: a medical bill, a repair you need, losing a job. Having it means a surprise doesn't turn into debt. Many people build toward a few months of basic costs over time — starting small is fine.", "Un fondo de emergencia es dinero guardado solo para imprevistos que no puedes evitar: un gasto médico, una reparación necesaria, perder el trabajo. Tenerlo evita que un imprevisto se vuelva deuda. Mucha gente lo va juntando hasta cubrir unos meses de gastos básicos; empezar con poco está bien.")),
      tf("emergency_fund", T("An emergency fund is for unexpected costs you can't avoid.", "Un fondo de emergencia es para gastos inesperados que no puedes evitar."), true, T("It's for real surprises, not planned fun — that's what keeps it there when you need it.", "Es para imprevistos de verdad, no para gustos planeados; así está ahí cuando lo necesitas.")),
      choice(
        "emergency_fund",
        T("Where does an emergency fund usually belong?", "¿Dónde suele guardarse un fondo de emergencia?"),
        [T("In stocks, so it grows faster", "En acciones, para que crezca más rápido"), T("Somewhere safe you can reach quickly", "En un lugar seguro y al que puedas acceder rápido"), T("Lent to a friend, so it's not tempting", "Prestado a un amigo, para no tener la tentación")],
        1,
        T("It needs to be there, at full value, the day you need it. Growth isn't its job.", "Tiene que estar ahí, completo, el día que lo necesites. Su trabajo no es crecer."),
        [T("Stocks can be down right when the emergency hits.", "Las acciones pueden estar abajo justo cuando llega la emergencia."), null, T("A loan to a friend may not come back when you need it.", "Un préstamo a un amigo puede no regresar cuando lo necesites.")]
      )
    ),
    concept(
      "savings_accounts",
      T("Where to keep savings", "Dónde guardar tu ahorro"),
      card(T("Safe, reachable, paying something", "Seguro, a la mano y que pague algo"), T("A good place for savings is protected (in the US, bank deposits are insured by the FDIC up to {@fdicLimit}), easy to reach, and pays interest. Cash at home pays nothing and can be lost or stolen.", "Un buen lugar para el ahorro está protegido (en EE. UU., el FDIC asegura los depósitos bancarios hasta {@fdicLimit}), es fácil de usar y paga intereses. El efectivo en casa no paga nada y se puede perder o te lo pueden robar.", { en: "A good place for savings is protected (in Mexico, IPAB protects bank deposits up to about {@ipabLimitPesosMillions} million pesos), easy to reach, and pays interest. Cash at home pays nothing and can be lost or stolen.", es: "Un buen lugar para el ahorro está protegido (en México, el IPAB protege los depósitos bancarios hasta unos {@ipabLimitPesosMillions} millones de pesos), es fácil de usar y paga intereses. El efectivo en casa no paga nada y se puede perder o te lo pueden robar." })),
      tf("savings_accounts", T("Interest on a savings account is money the bank pays you.", "El interés de una cuenta de ahorro es dinero que el banco te paga."), true, T("The bank uses deposits to make loans and pays you a small percent for it.", "El banco usa los depósitos para prestar y te paga un pequeño porcentaje por eso.")),
      choice(
        "savings_accounts",
        T("Two insured savings accounts: one pays 0.5% a year, the other 4%. You keep {$1000|15000} in one for a year. About how much more does the 4% account pay?", "Dos cuentas de ahorro protegidas: una paga 0.5% al año y la otra 4%. Guardas {$1000|15000} un año. ¿Cuánto más paga, más o menos, la de 4%?"),
        [T("{$35|525}", "{$35|525}"), T("{$4|60}", "{$4|60}"), T("Nothing — insured accounts all pay the same", "Nada: todas las cuentas protegidas pagan lo mismo")],
        0,
        T("{$1000|15000} × 4% = {$40|600}; × 0.5% = {$5|75}. The difference is {$35|525} — every year you leave it there.", "{$1000|15000} × 4% = {$40|600}; × 0.5% = {$5|75}. La diferencia es {$35|525}, cada año que lo dejes ahí."),
        [null, T("That's far too small: the gap is 3.5 points, and 3.5% of {$1000|15000} is {$35|525}.", "Es demasiado poco: la diferencia es de 3.5 puntos, y el 3.5% de {$1000|15000} es {$35|525}."), T("Protection keeps your money safe; it doesn't set the rate. Rates differ a lot, so comparing pays.", "La protección cuida tu dinero; no fija la tasa. Las tasas varían mucho, así que conviene comparar.")]
      )
    ),
  ],
  lessons: [
    {
      id: "save-1",
      title: T("Pay yourself first", "Págate a ti primero"),
      life: T("Next payday, move your savings first, before anything else gets a chance at it.", "El próximo día de pago, aparta tu ahorro primero, antes de que otra cosa lo alcance."),
      steps: [
        card(T("Save first, spend the rest", "Primero ahorra, luego gasta"), T("Most people save what's left at the end of the month — which is usually nothing. Flip it: the moment money comes in, move your savings out first. Then spend what's left.", "Mucha gente ahorra lo que sobra a fin de mes, que casi siempre es nada. Voltéalo: en cuanto te llegue dinero, aparta primero tu ahorro. Luego gasta lo que queda.")),
        card(T("Make it automatic", "Hazlo automático"), T("An automatic transfer on payday means you don't have to remember — or resist. Even a small amount builds the habit.", "Una transferencia automática el día de pago hace que no tengas que acordarte ni aguantarte las ganas. Aunque sea poco, construyes el hábito.")),
        choice(
          "pay_yourself_first",
          T("What's the main idea of \"pay yourself first\"?", "¿Cuál es la idea principal de \"págate a ti primero\"?"),
          [T("Buy yourself a treat every payday", "Darte un gusto cada día de pago"), T("Set savings aside before spending", "Apartar el ahorro antes de gastar"), T("Pay your friends back first", "Pagarle primero a tus amigos")],
          1,
          T("Savings come off the top, like a bill you owe to future-you.", "El ahorro sale primero, como un pago que le debes a tu yo del futuro."),
          [T("A treat is spending, not saving. Here, \"yourself\" means future-you's savings.", "Darte un gusto es gastar, no ahorrar. Aquí, \"tú\" es tu yo del futuro y su ahorro."), null, T("Paying people back matters, but this idea is about savings coming out first.", "Pagar lo que debes importa, pero esta idea trata de que el ahorro salga primero.")]
        ),
        number("pay_yourself_first", T("You save {$10|150} every week. How much is that after a year?", "Ahorras {$10|150} cada semana. ¿Cuánto es después de un año?"), { unit: "money", answer: [520, 7800] }, [T("{$10|150} × 52 weeks.", "{$10|150} × 52 semanas."), T("{$520|7800}. Small and steady adds up, and it builds the habit.", "{$520|7800}. Poco y constante se acumula, y crea el hábito.")]),
        order("pay_yourself_first", T("Payday. Put “pay yourself first” in order.", "Día de pago. Ordena “págate primero a ti”."), [T("Your pay lands in your account", "Tu sueldo llega a tu cuenta"), T("An automatic transfer moves your savings out", "Una transferencia automática aparta tu ahorro"), T("You pay for your needs", "Pagas tus necesidades"), T("You spend what's left on wants", "Gastas lo que queda en gustos")], T("Saving comes right after payday, before anything else gets a chance at it. Then needs, then wants.", "El ahorro va justo después del pago, antes de que otra cosa lo alcance. Luego las necesidades y luego los gustos.")),
        act("goals.create", T("Set a goal and pick how much you'll put aside each month.", "Pon una meta y elige cuánto vas a apartar cada mes."), {name: {en: "Savings goal",es: "Meta de ahorro"},target: [1000,15000],months: 12}),
      ],
    },
    {
      id: "save-2",
      title: T("Emergency fund", "Fondo de emergencia"),
      life: T("Pick a first emergency-fund target, even {$100|1500}, and give it its own place.", "Elige una primera meta para tu fondo de emergencia, aunque sea de {$100|1500}, y dale su propio lugar."),
      steps: [
        card(T("Money for surprises", "Dinero para imprevistos"), T("Phones break. Bikes get flat tires. An emergency fund is money you keep just for surprises, so a bad day doesn't turn into debt.", "Los celulares se rompen. Las bicis se ponchan. Un fondo de emergencia es dinero que guardas solo para imprevistos, para que un mal día no se convierta en deuda.")),
        card(T("How much?", "¿Cuánto?"), T("When you're starting out, aim for a small cushion like {$500|8000}. Once you have bills of your own, the usual goal is 3 to 6 months of expenses.", "Cuando vas empezando, apunta a un colchón pequeño, como {$500|8000}. Cuando ya tengas tus propios gastos fijos, la meta típica es de 3 a 6 meses de gastos.")),
        scenario(
          "emergency_fund",
          T("Three things come up this month. Which one is your emergency fund for?", "Este mes pasan tres cosas. ¿Para cuál es tu fondo de emergencia?"),
          [
            fit(T("Your phone screen cracks, and you need the phone for work", "Se rompe la pantalla de tu celular y lo necesitas para trabajar"), "good", T("Sudden, necessary and unplanned: exactly what the fund is for.", "Repentino, necesario y no planeado: justo para eso es el fondo.")),
            fit(T("Tickets for a concert you just heard about", "Boletos para un concierto del que te acabas de enterar"), "poor", T("A want, not an emergency. Save for it separately.", "Es un gusto, no una emergencia. Ahorra para eso aparte.")),
            fit(T("A sale on sneakers you've wanted", "Una oferta de unos tenis que querías"), "poor", T("A good deal is still a want. The fund stays for real surprises.", "Una buena oferta sigue siendo un gusto. El fondo es para imprevistos de verdad.")),
          ],
          T("An emergency is sudden, necessary and unplanned. Everything else gets its own savings goal.", "Una emergencia es repentina, necesaria y no planeada. Todo lo demás tiene su propia meta de ahorro.")
        ),
        tf("emergency_fund", T("Your emergency fund should be easy to reach quickly.", "Tu fondo de emergencia debe estar a la mano rápido."), true, T("Keep it somewhere safe that you can get to in a day or two — not invested in something that might be down when you need it.", "Guárdalo en un lugar seguro al que puedas acceder en uno o dos días, no invertido en algo que pueda ir a la baja justo cuando lo necesites.")),
        number("emergency_fund", T("Your basic costs are {$500|7500} a month. A starter goal of 3 months of costs is how much?", "Tus gastos básicos son {$500|7500} al mes. Una meta inicial de 3 meses de gastos, ¿de cuánto es?"), { unit: "money", answer: [1500, 22500] }, [T("3 months × {$500|7500} a month.", "3 meses × {$500|7500} al mes."), T("That's {$1500|22500}. Building it a little at a time is normal.", "Son {$1500|22500}. Juntarlo poco a poco es lo normal.")]),
        act("goals.create", T("Start your emergency fund goal.", "Empieza tu meta de fondo de emergencia."), {name: {en: "Emergency fund",es: "Fondo de emergencia"},target: [500,8000],months: 10,template: "emergency"}),
      ],
    },
    {
      id: "save-3",
      title: T("Where to keep savings", "Dónde guardar tu ahorro"),
      life: T("Find out whether your savings are in an insured account, and what it pays.", "Averigua si tu ahorro está en una cuenta asegurada y cuánto paga.", { en: "Find out whether your savings are protected by IPAB, and what they earn.", es: "Averigua si tu ahorro está protegido por el IPAB y cuánto gana." }),
      steps: [
        card(T("Not under the mattress", "No debajo del colchón"), T("Cash at home can be lost or stolen and earns nothing. A savings account at a bank or credit union keeps it safe — and pays you a little interest.", "El efectivo en casa se puede perder o te lo pueden robar, y no gana nada. Una cuenta de ahorro en un banco o credit union lo mantiene seguro y te paga un poco de intereses.", { en: "Cash at home can be lost or stolen and earns nothing. A savings account at a bank keeps it safe — and some pay you a little interest.", es: "El efectivo en casa se puede perder o te lo pueden robar, y no gana nada. Una cuenta de ahorro en un banco lo mantiene seguro, y algunas te pagan un poco de intereses." })),
        card(T("Protected by law", "Protegido por ley"), T("In the US, money in a bank is insured by the FDIC (credit unions: NCUA) up to {@fdicLimit} per person, per bank. If the bank fails, you still get it back.", "En Estados Unidos, el dinero en un banco está asegurado por la FDIC (en credit unions, la NCUA) hasta {@fdicLimit} por persona, por banco. Si el banco quiebra, igual recuperas tu dinero.", { en: "In Mexico, bank deposits are protected by the IPAB up to {@ipabLimitUdis} UDIs (over {@ipabLimitPesosMillions} million pesos) per person, per bank. If the bank fails, you still get it back.", es: "En México, el dinero en el banco está protegido por el IPAB hasta {@ipabLimitUdis} UDIS (más de {@ipabLimitPesosMillions} millones de pesos) por persona, por banco. Si el banco quiebra, igual recuperas tu dinero." })),
        choice(
          "savings_accounts",
          T("What's interest on a savings account?", "¿Qué son los intereses de una cuenta de ahorro?"),
          [T("A fee the bank charges you", "Una comisión que te cobra el banco"), T("Money the bank pays you for keeping your money there", "Dinero que el banco te paga por tener tu dinero ahí"), T("A type of tax", "Un tipo de impuesto")],
          1,
          T("The bank uses deposits to make loans, and pays you a small percent for it. Rates differ a lot, so it pays to compare.", "El banco usa los depósitos para prestar, y te paga un pequeño porcentaje por eso. Las tasas cambian mucho entre bancos, así que conviene comparar."),
          [T("Fees are what you pay the bank. Interest on savings is the bank paying you.", "Las comisiones son lo que tú le pagas al banco. El interés del ahorro es el banco pagándote a ti."), null, T("Interest isn't a tax — though interest you earn can be taxed.", "El interés no es un impuesto, aunque el interés que ganas puede pagar impuestos.")]
        ),
        tf("savings_accounts", T("If you're under 18, you usually need an adult to open a bank account with you.", "Si eres menor de 18, normalmente necesitas a un adulto para abrir una cuenta contigo."), true, T("Most banks offer teen or youth accounts opened together with a parent or guardian.", "La mayoría de los bancos tienen cuentas para jóvenes que se abren junto con tu mamá, papá o tutor.")),
        match(
          "savings_accounts",
          T("Match each place to what it does with your savings.", "Une cada lugar con lo que hace con tu ahorro."),
          [
            [T("Savings account", "Cuenta de ahorro"), T("Pays interest and keeps money apart from spending", "Paga intereses y separa el dinero del gasto")],
            [T("Checking account", "Cuenta de cheques", { en: "Debit account", es: "Cuenta de débito" }), T("Made for everyday spending", "Hecha para el gasto diario")],
            [T("Cash at home", "Efectivo en casa"), T("Earns nothing and can be lost or stolen", "No gana nada y se puede perder o robar")],
            [T("FDIC insurance", "Seguro de la FDIC", { en: "IPAB protection", es: "Protección del IPAB" }), T("Protects deposits if the bank fails", "Protege tus depósitos si el banco quiebra")],
          ],
          T("A savings account keeps money safe, separate and slowly growing.", "Una cuenta de ahorro mantiene el dinero seguro, aparte y creciendo poco a poco.")
        ),
        act("goals.compare", T("Compare keeping your goal money in cash vs. a savings account.", "Compara guardar el dinero de tu meta en efectivo vs. en una cuenta de ahorro.", { en: "Compare keeping your goal money in cash vs. CETES.", es: "Compara guardar el dinero de tu meta en efectivo vs. en CETES." }), {show: ["cash","save"]}),
      ],
    },
  ],
};
