// UNIT — Compound interest. Its lessons and the concepts they teach (format in helpers.js).
import { T, card, choice, tf, act, concept, estimate, number, scenario, fit, fv, round } from "./helpers.js";
import { fact } from "../../../core/facts.js";

export default {
  id: "compound",
  icon: "chart",
  title: T("Compound interest", "Interés compuesto"),
  concepts: [
    concept(
      "compound_interest",
      T("Compound interest", "Interés compuesto"),
      card(T("Growth on top of growth", "Crecimiento sobre crecimiento"), T("With simple interest, you earn only on your original money. With compound interest, last year's interest earns interest too. {$100|1000} at 10%: year one adds {$10|100}; year two adds {$11|110}, because you're now earning on {$110|1100}.", "Con interés simple, ganas solo sobre tu dinero original. Con interés compuesto, los intereses del año pasado también generan intereses. {$100|1000} al 10%: el primer año suman {$10|100}; el segundo, {$11|110}, porque ya ganas sobre {$110|1100}.")),
      tf("compound_interest", T("With compound interest, the interest you earn can earn interest too.", "Con interés compuesto, los intereses que ganas también pueden generar intereses."), true, T("That's the snowball: each year grows on a slightly bigger amount.", "Esa es la bola de nieve: cada año crece sobre un monto un poco mayor.")),
      choice(
        "compound_interest",
        T("{$1000|10000} grows 5% a year, compounded once a year. About how much after 3 years?", "{$1000|10000} crecen 5% al año, con interés compuesto anual. ¿Más o menos cuánto hay después de 3 años?"),
        [T("{$1150|11500}", "{$1150|11500}"), T("{$1158|11576}", "{$1158|11576}"), T("{$1500|15000}", "{$1500|15000}")],
        1,
        T("{$1000|10000} × 1.05 × 1.05 × 1.05 ≈ {$1158|11576}. The extra over {$1150|11500} is interest on interest.", "{$1000|10000} × 1.05 × 1.05 × 1.05 ≈ {$1158|11576}. Lo que pasa de {$1150|11500} es interés sobre interés."),
        [T("That's simple interest: 5% of the original, three times. Compounding adds a little more.", "Eso es interés simple: 5% del monto original, tres veces. El compuesto suma un poco más."), null, T("That's 50% growth. At 5% a year, that takes about 8 years, not 3.", "Eso es crecer 50%. Al 5% anual, eso toma unos 8 años, no 3.")]
      )
    ),
    concept(
      "starting_early",
      T("Starting early", "Empezar temprano"),
      card(T("Time does the heavy lifting", "El tiempo hace el trabajo pesado"), T("Money invested earlier has more years to compound. That's why someone who starts small at 18 can end up with more than someone who starts bigger at 35 — even though the later starter puts in more.", "El dinero que se invierte antes tiene más años para crecer. Por eso alguien que empieza con poco a los 18 puede terminar con más que alguien que empieza con más a los 35, aunque esa persona aporte más dinero.")),
      tf("starting_early", T("Starting to save earlier gives your money more time to grow.", "Empezar a ahorrar antes le da a tu dinero más tiempo para crecer."), true, T("More years means more rounds of growth on top of growth.", "Más años significan más rondas de crecimiento sobre crecimiento.")),
      choice(
        "starting_early",
        T("Using the Rule of 72, at 6% a year about how long does money take to double?", "Con la Regla del 72, al 6% anual, ¿más o menos cuánto tarda el dinero en duplicarse?"),
        [T("6 years", "6 años"), T("12 years", "12 años"), T("72 years", "72 años")],
        1,
        T("72 ÷ 6 = 12. It's a shortcut, not an exact answer, but it's close.", "72 ÷ 6 = 12. Es un atajo, no un cálculo exacto, pero se acerca mucho."),
        [T("Doubling in 6 years would take about 12% a year (72 ÷ 12 = 6).", "Duplicarse en 6 años requeriría cerca de 12% anual (72 ÷ 12 = 6)."), null, T("72 is the number you divide, not the answer.", "72 es el número que divides, no el resultado.")]
      )
    ),
    concept(
      "safe_investments",
      T("Safe investments", "Inversiones seguras"),
      card(T("Lending to the government", "Prestarle al gobierno"), T("A T-bill is a short loan to the US government: you pay a bit less now and get the full amount back in weeks or months. It grows slowly but steadily, which suits money you'll need soon.", "Un T-bill es un préstamo corto al gobierno de EE. UU.: pagas un poco menos ahora y recibes el monto completo en semanas o meses. Crece despacio pero estable, algo que va bien con dinero que necesitarás pronto.", { en: "CETES are a short loan to Mexico's government: you pay a bit less now and get the full amount back in weeks or months. They grow slowly but steadily, and you can buy them from {@cetesMinimum} on cetesdirecto.", es: "Los CETES son un préstamo corto al gobierno de México: pagas un poco menos ahora y recibes el monto completo en semanas o meses. Crecen despacio pero estable, y puedes comprarlos desde {@cetesMinimum} en cetesdirecto." })),
      tf("safe_investments", T("Safe investments usually grow more slowly than stocks over the long run.", "Las inversiones seguras suelen crecer más despacio que las acciones a largo plazo."), true, T("Less risk usually comes with less reward. That's the trade.", "Menos riesgo suele venir con menos rendimiento. Ese es el intercambio.")),
      choice(
        "safe_investments",
        T("You'll need {$2000|30000} in 8 months for a trip. Which fits that money best?", "Vas a necesitar {$2000|30000} en 8 meses para un viaje. ¿Qué le queda mejor a ese dinero?"),
        [T("A single stock you like", "Una acción que te guste"), T("A short-term government investment, like T-bills", "Una inversión de corto plazo del gobierno, como los T-bills", { en: "A short-term government investment, like CETES", es: "Una inversión de corto plazo del gobierno, como los CETES" }), T("Crypto", "Cripto")],
        1,
        T("Money needed soon should be steady. Short-term government debt is built for that.", "El dinero que necesitas pronto debe ser estable. La deuda de corto plazo del gobierno está hecha para eso."),
        [T("One stock can fall a lot in 8 months.", "Una sola acción puede caer mucho en 8 meses."), null, T("Crypto prices can swing wildly in days — not a fit for money you need soon.", "Los precios de las cripto pueden moverse muchísimo en días; no van con dinero que necesitas pronto.")]
      )
    ),
  ],
  lessons: [
    {
      id: "compound-1",
      title: T("Interest on interest", "Intereses sobre intereses"),
      steps: [
        card(T("Money that grows itself", "Dinero que crece solo"), T("Earn 5% on {$100|1000} and you have {$105|1050}. Next year you earn 5% on {$105|1050}, not just on {$100|1000}. Your interest starts earning interest. That's compounding.", "Si ganas 5% sobre {$100|1000}, tienes {$105|1050}. Al año siguiente ganas 5% sobre {$105|1050}, no solo sobre {$100|1000}. Tus intereses empiezan a ganar intereses. Eso es el interés compuesto.")),
        choice(
          "compound_interest",
          T("{$100|1000} grows 10% a year. After 2 years, how much?", "{$100|1000} crece 10% al año. Después de 2 años, ¿cuánto hay?"),
          [T("{$120|1200}", "{$120|1200}"), T("{$121|1210}", "{$121|1210}"), T("{$110|1100}", "{$110|1100}")],
          1,
          T("Year 1: {$110|1100}. Year 2: 10% of {$110|1100} is {$11|110} more, so {$121|1210}. That extra {$1|10} is interest on interest.", "Año 1: {$110|1100}. Año 2: el 10% de {$110|1100} son {$11|110} más, así que {$121|1210}. Ese {$1|10} extra es interés sobre interés."),
          [T("That's simple interest — 10% of the original, twice. In year two you also earn on year one's interest.", "Eso es interés simple: 10% del monto original, dos veces. El segundo año también ganas sobre los intereses del primero."), null, T("That's after one year. Year two adds another 10% on top.", "Eso es después de un año. El segundo año suma otro 10% encima.")]
        ),
        card(T("Slow, then fast", "Lento, luego rápido"), T("At first compounding looks boring. Over many years the curve bends upward — most of the growth comes near the end.", "Al principio el interés compuesto parece aburrido. Con los años, la curva se dispara: la mayor parte del crecimiento llega al final.")),
        tf("compound_interest", T("Compounding works against you on debt, too.", "El interés compuesto también juega en tu contra con las deudas."), true, T("Unpaid interest on a card gets added to what you owe, and then that earns interest. Same math, wrong direction.", "Los intereses que no pagas de una tarjeta se suman a lo que debes, y eso genera más intereses. La misma cuenta, pero al revés.")),
        estimate(
          "compound_interest",
          T("You put {$100|2000} a month into an investment for 10 years, earning an example {@indexExampleRate} a year. About how much do you end up with?", "Pones {$100|2000} al mes en una inversión durante 10 años, ganando un {@indexExampleRate} anual de ejemplo. ¿Con cuánto terminas, más o menos?"),
          { unit: "money", min: [2000, 40000], max: [50000, 1000000], step: [500, 10000], answer: [round(fv(100, fact("indexExampleRate") / 100, 10), 100), round(fv(2000, fact("indexExampleRate") / 100, 10), 1000)], grow: { monthly: [100, 2000], rate: fact("indexExampleRate") / 100, years: 10 } },
          T("You put in {$12000|240000}; the rest is growth you never paid in. Most of it comes in the later years, which is why time matters so much.", "Pusiste {$12000|240000}; lo demás es crecimiento que nunca pagaste. La mayor parte llega en los últimos años, por eso el tiempo importa tanto.")
        ),
        act("goals.compare", T("Compare saving the same amount in cash vs. a savings account over 10 years.", "Compara ahorrar lo mismo en efectivo vs. en una cuenta de ahorro durante 10 años.", { en: "Compare saving the same amount in cash vs. CETES over 10 years.", es: "Compara ahorrar lo mismo en efectivo vs. en CETES durante 10 años." }), {show: ["cash","save"],years: 10}),
      ],
    },
    {
      id: "compound-2",
      title: T("Time is your superpower", "El tiempo es tu superpoder"),
      steps: [
        card(T("Starting early beats starting big", "Empezar temprano le gana a empezar con mucho"), T("At about {@indexExampleRate} a year, someone who starts investing at 16 can end up with more than someone who invests twice as much each month starting at 26 — just because their money had more years to compound.", "Con alrededor de {@indexExampleRate} al año, alguien que empieza a invertir a los 16 puede terminar con más que alguien que invierte el doble cada mes pero empieza a los 26, solo porque su dinero tuvo más años para crecer.")),
        choice(
          "starting_early",
          T("Who probably ends up with more at 60?", "¿Quién probablemente tiene más a los 60?"),
          [T("Ana: {$50|750}/month from age 16", "Ana: {$50|750} al mes desde los 16"), T("Leo: {$50|750}/month from age 36", "Leo: {$50|750} al mes desde los 36")],
          0,
          T("Same monthly amount, but Ana's money gets 20 extra years to grow. Time does the heavy lifting.", "La misma cantidad al mes, pero el dinero de Ana tiene 20 años más para crecer. El tiempo hace el trabajo pesado."),
          [null, T("Same monthly amount, but Ana's money gets 20 more years to compound.", "El mismo monto al mes, pero el dinero de Ana tiene 20 años más para crecer.")]
        ),
        card(T("The Rule of 72", "La regla del 72"), T("Divide 72 by a yearly growth rate to estimate how many years it takes to double. At 6%: 72 ÷ 6 = about 12 years.", "Divide 72 entre la tasa de crecimiento anual para estimar en cuántos años se duplica tu dinero. Al 6%: 72 ÷ 6 = unos 12 años.")),
        tf("starting_early", T("At 8% a year, money doubles in about 9 years.", "Al 8% anual, el dinero se duplica en unos 9 años."), true, T("72 ÷ 8 = 9. A handy shortcut — not exact, but close.", "72 ÷ 8 = 9. Un atajo útil: no es exacto, pero se acerca.")),
        number("starting_early", T("Rule of 72: at an example 8% a year, about how many years does money take to double?", "Regla del 72: con un 8% anual de ejemplo, ¿en cuántos años se duplica el dinero, más o menos?"), { unit: "years", answer: 9 }, [T("72 ÷ 8 = 9.", "72 ÷ 8 = 9."), T("About 9 years. At 6% it would take about 12.", "Unos 9 años. Al 6% tardaría unos 12.")]),
        act("goals.early", T("See the difference between starting at 16 and at 26.", "Mira la diferencia entre empezar a los 16 y a los 26."), {monthly: [50,750],ages: [16,26]}),
      ],
    },
    {
      id: "compound-3",
      title: T("Your first safe investment", "Tu primera inversión segura"),
      steps: [
        card(T("Lending to the government", "Prestarle al gobierno"), T("Treasury bills (T-bills) are short loans to the US government. You lend money for a few weeks or months and get it back with interest. They're considered one of the safest places for money.", "Los Treasury bills (T-bills) son préstamos cortos al gobierno de Estados Unidos. Prestas dinero por unas semanas o meses y te lo regresan con intereses. Se consideran de los lugares más seguros para el dinero.", { en: "CETES are short loans to the Mexican government. You lend money for 28 days (or longer) and get it back with interest. You can buy them at cetesdirecto.com starting at {@cetesMinimum} — with an adult's help if you're under 18.", es: "Los CETES son préstamos cortos al gobierno de México. Prestas dinero por 28 días (o más) y te lo regresan con intereses. Puedes comprarlos en cetesdirecto.com desde {@cetesMinimum}; si eres menor de edad, con ayuda de un adulto." })),
        card(T("Safe ≠ big growth", "Seguro ≠ mucho crecimiento"), T("Safe investments grow slowly. They're great for money you'll need soon, like an emergency fund or a goal in a year or two.", "Las inversiones seguras crecen despacio. Son ideales para dinero que vas a necesitar pronto, como tu fondo de emergencia o una meta en uno o dos años.")),
        choice(
          "safe_investments",
          T("What's a T-bill?", "¿Qué es un T-bill?", { en: "What are CETES?", es: "¿Qué son los CETES?" }),
          [T("A share of a company", "Una parte de una empresa"), T("A short loan to the government", "Un préstamo corto al gobierno"), T("A kind of credit card", "Un tipo de tarjeta de crédito")],
          1,
          T("You're the lender. The government pays you back with interest.", "Tú eres quien presta. El gobierno te paga de vuelta con intereses."),
          [T("A share is ownership in a company. A T-bill is a loan to the government.", "Una acción es ser dueño de una parte de una empresa. Un T-bill es un préstamo al gobierno.", { en: "A share is ownership in a company. CETES are a loan to the government.", es: "Una acción es ser dueño de una parte de una empresa. Los CETES son un préstamo al gobierno." }), null, T("It's not a card or a loan to you — you're the one lending.", "No es una tarjeta ni un préstamo para ti: tú eres quien presta.")]
        ),
        tf("safe_investments", T("Safe investments are a good place for money you'll need next year.", "Las inversiones seguras son buen lugar para el dinero que vas a necesitar el próximo año."), true, T("Short time + money you can't afford to lose = keep it safe.", "Poco tiempo + dinero que no puedes perder = mantenlo seguro.")),
        scenario(
          "safe_investments",
          T("You'll need {$2000|30000} in 6 months for a car down payment. Where do you keep it until then?", "Vas a necesitar {$2000|30000} en 6 meses para el enganche de un coche. ¿Dónde lo guardas mientras?"),
          [
            fit(T("Treasury bills or a high-yield savings account", "Letras del Tesoro o una cuenta de ahorro con buen rendimiento", { en: "CETES or a savings account with a good return", es: "CETES o una cuenta de ahorro con buen rendimiento" }), "good", T("Safe, ready on time, and it earns a little.", "Seguro, listo a tiempo, y gana un poco.")),
            fit(T("Your checking account", "Tu cuenta de cheques", { en: "Your debit account", es: "Tu cuenta de débito" }), "ok", T("Safe and easy, but it earns about nothing.", "Seguro y fácil, pero casi no gana nada.")),
            fit(T("A stock index fund", "Un fondo indexado de acciones"), "poor", T("Great for long goals, but in 6 months it could be down right when you need it.", "Muy bueno para metas largas, pero en 6 meses podría estar abajo justo cuando lo necesites.")),
          ],
          T("Money with a near deadline belongs somewhere safe, even if it grows slowly.", "El dinero con fecha cercana va en algo seguro, aunque crezca poco.")
        ),
        act("portfolio.buy", T("Practice: put {$1000|20000} of your pretend money into a safe investment.", "Práctica: pon {$1000|20000} de tu dinero de práctica en una inversión segura."), {type: "safe",amount: [1000,20000]}),
      ],
    },
  ],
};
