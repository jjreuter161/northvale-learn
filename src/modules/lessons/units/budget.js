// UNIT — Budgeting. Its lessons and the concepts they teach (format in helpers.js).
import { T, card, choice, tf, act, concept, estimate, number, scenario, fit, match } from "./helpers.js";

export default {
  id: "budget",
  icon: "pie",
  title: T("Budgeting", "Presupuesto"),
  concepts: [
    concept(
      "budgeting",
      T("Budgeting", "Presupuesto"),
      card(T("A plan, not a limit", "Un plan, no un límite"), T("A budget is deciding ahead of time where your money goes. Say you get {$400|6000}: you might plan {$200|3000} for needs, {$120|1800} for wants and {$80|1200} for saving. When the money arrives, you already know what to do with it.", "Un presupuesto es decidir con anticipación a dónde va tu dinero. Si recibes {$400|6000}, podrías planear {$200|3000} para necesidades, {$120|1800} para gustos y {$80|1200} para ahorro. Cuando llega el dinero, ya sabes qué hacer con él.")),
      tf("budgeting", T("A budget is a plan for where your money will go.", "Un presupuesto es un plan de a dónde va a ir tu dinero."), true, T("That's all it is: deciding ahead of time, so your money goes where you want it to.", "Eso es todo: decidir con anticipación para que tu dinero vaya a donde tú quieres.")),
      choice(
        "budgeting",
        T("You get {$600|9000} a month and use 50/30/20 as a guide. Your needs cost {$360|5400}. What's going on?", "Recibes {$600|9000} al mes y usas el 50/30/20 como guía. Tus necesidades cuestan {$360|5400}. ¿Qué pasa?"),
        [T("Needs take 60%, so wants or saving have to shrink for now", "Las necesidades son el 60%, así que por ahora deben bajar los gustos o el ahorro"), T("Nothing — that's exactly 50%", "Nada: eso es justo el 50%"), T("Saving should be the 50%", "El ahorro debería ser el 50%")],
        0,
        T("{$360|5400} is 60% of {$600|9000}, ten points over the guide. Something has to give: trim wants, find cheaper needs, or save a little less until things change.", "{$360|5400} es el 60% de {$600|9000}, diez puntos arriba de la guía. Algo tiene que ajustarse: recortar gustos, buscar necesidades más baratas o ahorrar un poco menos mientras tanto."),
        [null, T("50% of {$600|9000} is {$300|4500}, not {$360|5400}.", "El 50% de {$600|9000} es {$300|4500}, no {$360|5400}."), T("In 50/30/20, saving is the 20%. Half your money would be a very different plan.", "En el 50/30/20, el ahorro es el 20%. La mitad de tu dinero sería un plan muy distinto.")]
      )
    ),
    concept(
      "needs_wants",
      T("Needs vs. wants", "Necesidades vs. gustos"),
      card(T("Ask: what if I skip it?", "Pregúntate: ¿y si no lo compro?"), T("If skipping it would hurt your health, your safety or your way of getting to school or work, it's probably a need. If life goes on fine without it, it's a want. Buying wants is fine — just plan for them.", "Si no comprarlo afectaría tu salud, tu seguridad o tu forma de llegar a la escuela o al trabajo, probablemente es una necesidad. Si tu vida sigue igual sin eso, es un gusto. Comprar gustos está bien; solo planéalos.")),
      tf("needs_wants", T("Food is usually a need.", "La comida suele ser una necesidad."), true, T("You need to eat. Some things in the cart, like fancy snacks, can still be wants.", "Necesitas comer. Algunas cosas del carrito, como botanas caras, sí pueden ser gustos.")),
      choice(
        "needs_wants",
        T("Your phone works fine, but a new model is out. Which is true?", "Tu celular funciona bien, pero salió un modelo nuevo. ¿Qué es cierto?"),
        [T("The new phone is a want", "El celular nuevo es un gusto"), T("The new phone is a need, because phones are important", "El celular nuevo es una necesidad, porque los celulares son importantes"), T("Wanting it means you should never buy it", "Que lo quieras significa que nunca deberías comprarlo")],
        0,
        T("Having a working phone can be a need — and you already have one. Upgrading is a want. You can still plan and save for it.", "Tener un celular que funcione puede ser una necesidad, y ya lo tienes. Cambiarlo es un gusto. Aun así puedes planearlo y ahorrar para él."),
        [null, T("The need is a phone that works, and yours does. The newer model is extra.", "La necesidad es un celular que funcione, y el tuyo funciona. El modelo nuevo es un extra."), T("Wants aren't forbidden. The point is to plan for them so they don't crowd out needs or saving.", "Los gustos no están prohibidos. La idea es planearlos para que no desplacen a las necesidades ni al ahorro.")]
      )
    ),
    concept(
      "small_leaks",
      T("Small leaks", "Gastos hormiga"),
      card(T("Multiply before you buy", "Multiplica antes de comprar"), T("To see a small cost's real size, multiply it out: price × times a week × 52 weeks. A {$4|60} drink five times a week is about {$1040|15600} a year. Then ask if it's worth that much to you.", "Para ver el tamaño real de un gasto pequeño, multiplícalo: precio × veces por semana × 52 semanas. Una bebida de {$4|60} cinco veces por semana son unos {$1040|15600} al año. Luego pregúntate si para ti vale eso.")),
      tf("small_leaks", T("Small purchases repeated often can add up to more than one big purchase.", "Las compras pequeñas que se repiten mucho pueden sumar más que una compra grande."), true, T("A little, many times, becomes a lot. That's why small leaks are worth noticing.", "Poco, muchas veces, se vuelve mucho. Por eso vale la pena notar las fugas pequeñas.")),
      choice(
        "small_leaks",
        T("Which costs the most in a year?", "¿Qué cuesta más en un año?"),
        [T("{$3|45} every weekday", "{$3|45} cada día entre semana"), T("A {$10|150} subscription each month", "Una suscripción de {$10|150} al mes"), T("One {$500|7500} purchase", "Una compra de {$500|7500}")],
        0,
        T("{$3|45} × 5 days × 52 weeks is about {$780|11700} a year — more than the one big purchase.", "{$3|45} × 5 días × 52 semanas son unos {$780|11700} al año: más que la compra grande."),
        [null, T("{$10|150} × 12 months is {$120|1800} a year.", "{$10|150} × 12 meses son {$120|1800} al año."), T("{$500|7500} is a lot at once, but the daily one adds up to more over a year.", "{$500|7500} es mucho de golpe, pero el gasto diario suma más en un año.")]
      )
    ),
  ],
  lessons: [
    {
      id: "budget-1",
      title: T("What's a budget?", "¿Qué es un presupuesto?"),
      steps: [
        card(T("A plan for your money", "Un plan para tu dinero"), T("A budget is just a plan: before you spend, you decide where your money goes. It's not about saying no to everything — it's about saying yes to what matters most to you.", "Un presupuesto es solo un plan: antes de gastar, decides a dónde va tu dinero. No se trata de decir que no a todo, sino de decir que sí a lo que más te importa.")),
        card(T("The 50/30/20 idea", "La idea 50/30/20"), T("A simple starting point: about 50% for needs (things you must pay), 30% for wants (fun stuff), and 20% for saving. It's a guide, not a law — adjust it to your life.", "Un punto de partida sencillo: más o menos 50% para necesidades (lo que sí o sí debes pagar), 30% para gustos y 20% para ahorrar. Es una guía, no una ley: ajústala a tu vida.")),
        match("budgeting", T("Match each part of 50/30/20 to an example.", "Une cada parte del 50/30/20 con un ejemplo."), [[T("50% needs", "50% necesidades"), T("Rent, groceries, the bus to work", "Renta, comida, el camión al trabajo")], [T("30% wants", "30% gustos"), T("Streaming, eating out, a new game", "Streaming, comer fuera, un juego nuevo")], [T("20% saving", "20% ahorro"), T("An emergency fund and your goals", "Un fondo de emergencia y tus metas")]], T("It's a guide, not a law: adjust the split to your life.", "Es una guía, no una ley: ajusta la repartición a tu vida.")),
        tf("budgeting", T("A budget means you can never buy anything fun.", "Tener presupuesto significa que nunca puedes comprar nada divertido."), false, T("Fun money is part of the plan. A budget just makes sure fun doesn't eat your rent or your savings.", "El dinero para gustos es parte del plan. El presupuesto solo cuida que los gustos no se coman tus pagos ni tu ahorro.")),
        number("budgeting", T("You get {$400|6000} a month and follow 50/30/20. How much goes to saving each month?", "Recibes {$400|6000} al mes y sigues el 50/30/20. ¿Cuánto va al ahorro cada mes?"), { unit: "money", answer: [80, 1200] }, [T("Saving is the 20%, which is 0.20.", "El ahorro es el 20%, o sea 0.20."), T("0.20 × {$400|6000} = {$80|1200} a month.", "0.20 × {$400|6000} = {$80|1200} al mes.")]),
        act("goals.budget", T("Split {$400|6000} a month your way. Try to save at least 10%.", "Reparte {$400|6000} al mes a tu manera. Intenta ahorrar al menos 10%."), {income: [400,6000]}),
      ],
    },
    {
      id: "budget-2",
      title: T("Needs vs. wants", "Necesidades vs. gustos"),
      steps: [
        card(T("Need or want?", "¿Necesidad o gusto?"), T("Needs keep your life running: food, a way to get to school or work, your phone bill if you need it. Wants make life fun: new sneakers, games, eating out. Both are fine — just know which is which.", "Las necesidades mantienen tu vida en marcha: comida, cómo llegar a la escuela o al trabajo, tu plan de celular si lo necesitas. Los gustos hacen la vida divertida: tenis nuevos, videojuegos, comer fuera. Las dos cosas están bien; solo identifica cuál es cuál.")),
        choice(
          "needs_wants",
          T("Which one is a want?", "¿Cuál es un gusto?"),
          [T("Bus fare to get to work", "El pasaje para llegar al trabajo"), T("A third streaming service", "Un tercer servicio de streaming"), T("Groceries", "El súper")],
          1,
          T("You can live without a third streaming app. Wants aren't bad — they're just the first thing to trim when money is tight.", "Puedes vivir sin una tercera app de streaming. Los gustos no son malos; solo son lo primero que se recorta cuando el dinero no alcanza."),
          [T("Getting to work is usually a need — without it, you can't earn.", "Llegar al trabajo suele ser una necesidad: sin eso no puedes ganar dinero."), null, T("Food is a need. (Fancy extras in the cart can be wants.)", "La comida es una necesidad. (Los antojos extra del carrito sí pueden ser gustos.)")]
        ),
        card(T("Goals make it easier", "Las metas lo hacen más fácil"), T("Saying no to a want is easier when you're saying yes to a goal. \"I'm saving for a phone\" beats \"I'm not allowed to spend.\"", "Decirle que no a un gusto es más fácil cuando le dices que sí a una meta. \"Estoy ahorrando para un celular\" funciona mejor que \"no puedo gastar\".")),
        tf("needs_wants", T("The same thing can be a need for one person and a want for another.", "Una misma cosa puede ser necesidad para una persona y gusto para otra."), true, T("A car is a need if there's no other way to get to work — and a want if the bus works fine. Context matters.", "Un coche es necesidad si no hay otra forma de llegar al trabajo, y es gusto si el transporte público te sirve bien. Depende de tu situación.")),
        scenario(
          "needs_wants",
          T("You have {$60|900} left until payday and still need groceries. A friend invites you to a {$40|600} concert tonight. What would you do?", "Te quedan {$60|900} hasta el día de pago y todavía necesitas comprar comida. Un amigo te invita a un concierto de {$40|600} hoy en la noche. ¿Qué harías?"),
          [
            fit(T("Buy groceries first, then go only if enough is left", "Comprar la comida primero e ir solo si alcanza"), "good", T("Needs first, and the fun still happens if the money's there.", "Primero las necesidades, y la diversión sigue en pie si alcanza.")),
            fit(T("Skip it this time and suggest something free", "No ir esta vez y proponer un plan gratis"), "ok", T("Easy on your budget, and you still see your friend.", "Cuida tu presupuesto y aun así ves a tu amigo.")),
            fit(T("Go, and figure out food later", "Ir y ver lo de la comida después"), "poor", T("The want eats the need. Food is the one you can't skip.", "El gusto se come la necesidad. La comida es la que no puedes saltarte.")),
          ],
          T("Needs get paid first; wants fit in the space that's left.", "Las necesidades se pagan primero; los gustos caben en lo que sobra.")
        ),
        act("goals.create", T("Make your first goal: something you want, how much it costs, and when.", "Crea tu primera meta: algo que quieras, cuánto cuesta y para cuándo."), {name: {en: "New headphones",es: "Audífonos nuevos"},target: [300,5000],months: 6}),
      ],
    },
    {
      id: "budget-3",
      title: T("Small leaks", "Gastos hormiga"),
      steps: [
        card(T("Tiny costs add up", "Lo pequeño suma"), T("Small, frequent buys — snacks, delivery fees, in-game coins — feel like nothing. But {$5|80} a few times a week becomes hundreds a year.", "Las compras pequeñas y frecuentes —botanas, envíos, monedas en juegos— parecen nada. Pero {$5|80} unas veces por semana se vuelven cientos al año.", { en: "In Mexico they're called \"gastos hormiga\" — ant expenses: tiny, but there are a lot of them. {$5|80} a few times a week becomes thousands of pesos a year.", es: "En México les decimos gastos hormiga: pequeñitos, pero son muchos. {$5|80} unas veces por semana se vuelven miles de pesos al año." })),
        choice(
          "small_leaks",
          T("{$5|80} three times a week. About how much is that in a year?", "{$5|80} tres veces por semana. ¿Cuánto es más o menos al año?"),
          [T("{$60|960}", "{$60|960}"), T("{$260|4200}", "{$260|4200}"), T("{$780|12500}", "{$780|12500}")],
          2,
          T("{$5|80} × 3 × 52 weeks ≈ {$780|12500}. Not saying never buy snacks — just know the real price.", "{$5|80} × 3 × 52 semanas ≈ {$780|12500}. No es que nunca compres botanas; solo conoce el precio real."),
          [T("That's only about a month. Multiply by 52 weeks: {$5|80} × 3 × 52.", "Eso es apenas un mes. Multiplica por 52 semanas: {$5|80} × 3 × 52."), T("That's about once a week for a year. Three times a week is three times as much.", "Eso es como una vez por semana durante un año. Tres veces por semana es el triple."), null]
        ),
        card(T("Track for one week", "Anótalo una semana"), T("Write down everything you spend for 7 days. Most people are surprised. You can't fix a leak you can't see.", "Anota todo lo que gastes durante 7 días. Casi a todos les sorprende. No puedes tapar una fuga que no ves.")),
        tf("small_leaks", T("Subscriptions you forgot about are a common small leak.", "Las suscripciones que olvidaste son una fuga muy común."), true, T("Free trials turn into monthly charges. Check your app store subscriptions once in a while.", "Las pruebas gratis se vuelven cobros mensuales. Revisa de vez en cuando las suscripciones en tu tienda de apps.")),
        estimate("small_leaks", T("A {$4|60} drink, five days a week. About how much is that in a year?", "Una bebida de {$4|60}, cinco días a la semana. ¿Cuánto es más o menos en un año?"), { unit: "money", min: [100, 1500], max: [3000, 45000], step: [20, 300], answer: [1040, 15600] }, T("{$4|60} × 5 days × 52 weeks is about {$1040|15600}. A little, many times.", "{$4|60} × 5 días × 52 semanas son unos {$1040|15600}. Poco, muchas veces.")),
        act("goals.leak", T("See what cutting one small leak does to your goal.", "Mira qué le pasa a tu meta si tapas una fuga pequeña."), {leak: [5,80],perWeek: 3}),
      ],
    },
  ],
};
