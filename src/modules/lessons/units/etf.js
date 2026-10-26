// UNIT — ETFs & index funds. Its lessons and the concepts they teach (format in helpers.js).
import { T, card, choice, tf, act, concept } from "./helpers.js";

export default {
  id: "etf",
  icon: "layers",
  title: T("ETFs & index funds", "ETFs y fondos indexados"),
  concepts: [
    concept(
      "index_funds",
      T("Index funds", "Fondos indexados"),
      card(T("One buy, many companies", "Una compra, muchas empresas"), T("A fund pools many people's money to buy many investments at once. An index fund simply copies a list, like the S&P 500, instead of trying to pick winners. That spreads your money out and usually keeps costs low.", "Un fondo junta el dinero de mucha gente para comprar muchas inversiones a la vez. Un fondo indexado simplemente copia una lista, como el S&P 500, en lugar de intentar elegir ganadoras. Eso reparte tu dinero y normalmente mantiene bajos los costos.", { en: "A fund pools many people's money to buy many investments at once. An index fund simply copies a list, like the S&P 500 or Mexico's S&P/BMV IPC, instead of trying to pick winners. That spreads your money out and usually keeps costs low.", es: "Un fondo junta el dinero de mucha gente para comprar muchas inversiones a la vez. Un fondo indexado simplemente copia una lista, como el S&P 500 o el S&P/BMV IPC de México, en lugar de intentar elegir ganadoras. Eso reparte tu dinero y normalmente mantiene bajos los costos." })),
      tf("index_funds", T("An index fund holds many companies, not just one.", "Un fondo indexado tiene muchas empresas, no solo una."), true, T("That's the point: one purchase, a whole basket.", "Esa es la idea: una compra, toda una canasta.")),
      choice(
        "index_funds",
        T("Why have index funds beaten most professional stock pickers over long periods?", "¿Por qué los fondos indexados le han ganado a la mayoría de los profesionales que eligen acciones en periodos largos?"),
        [T("Lower costs, and beating the whole market consistently is very hard", "Costos más bajos, y ganarle a todo el mercado de forma constante es muy difícil"), T("Index funds are guaranteed to rise", "Los fondos indexados tienen garantizado subir"), T("Professionals aren't allowed to pick stocks", "A los profesionales no se les permite elegir acciones")],
        0,
        T("According to S&P's SPIVA reports, most actively managed funds have trailed their index over 10+ years, largely because of higher costs and how hard it is to stay ahead.", "Según los reportes SPIVA de S&P, la mayoría de los fondos administrados activamente han quedado por debajo de su índice en periodos de 10 años o más, sobre todo por costos más altos y lo difícil que es mantenerse adelante."),
        [null, T("Index funds fall when the market falls. Nothing is guaranteed.", "Los fondos indexados bajan cuando baja el mercado. Nada está garantizado."), T("They're allowed — it's just hard to do better than the whole market after costs.", "Sí se les permite; solo es difícil hacerlo mejor que todo el mercado después de costos.")]
      )
    ),
    concept(
      "fees",
      T("Fund fees", "Comisiones de los fondos"),
      card(T("Small percentages, big amounts", "Porcentajes pequeños, montos grandes"), T("A fund's yearly fee (its expense ratio) comes out of your money every year, whether the fund does well or not. 1% vs. 0.1% sounds tiny, but over decades it can eat a large share of your growth.", "La comisión anual de un fondo (su gasto total anual) sale de tu dinero cada año, le vaya bien o mal al fondo. 1% contra 0.1% suena a poco, pero en décadas puede comerse una buena parte de tu crecimiento.")),
      tf("fees", T("A fund's fee is charged every year.", "La comisión de un fondo se cobra cada año."), true, T("Year after year, which is why low fees add up.", "Año tras año; por eso las comisiones bajas hacen diferencia.")),
      choice(
        "fees",
        T("You have {$10000|150000} in a fund for a year. How much more does a 1% fee cost than a 0.1% fee?", "Tienes {$10000|150000} en un fondo durante un año. ¿Cuánto más cuesta una comisión de 1% que una de 0.1%?"),
        [T("{$90|1350}", "{$90|1350}"), T("{$9|135}", "{$9|135}"), T("The same", "Lo mismo")],
        0,
        T("1% of {$10000|150000} is {$100|1500}; 0.1% is {$10|150}. That's {$90|1350} more — every year, on a growing balance.", "El 1% de {$10000|150000} es {$100|1500}; el 0.1% es {$10|150}. Son {$90|1350} más, cada año, sobre un saldo que crece."),
        [null, T("That's ten times too small: the gap is 0.9%, which is {$90|1350}.", "Es diez veces menos de lo real: la diferencia es 0.9%, o sea {$90|1350}."), T("1% is ten times 0.1%, so the cost is too.", "1% es diez veces 0.1%, y el costo también.")]
      )
    ),
    concept(
      "dollar_cost_averaging",
      T("Investing regularly", "Invertir con regularidad"),
      card(T("Same amount, different prices", "Mismo monto, distintos precios"), T("Investing a fixed amount on a schedule means you buy more shares when prices are low and fewer when they're high. You don't have to guess the best moment — the habit does the work.", "Invertir un monto fijo con un calendario hace que compres más acciones cuando los precios están bajos y menos cuando están altos. No tienes que adivinar el mejor momento: el hábito hace el trabajo.")),
      tf("dollar_cost_averaging", T("Investing the same amount every month means you don't have to guess the best time to buy.", "Invertir el mismo monto cada mes significa que no tienes que adivinar el mejor momento para comprar."), true, T("The schedule decides, not the headlines.", "Decide el calendario, no los titulares.")),
      choice(
        "dollar_cost_averaging",
        T("You invest {$100|1500} a month. Shares cost {$10|150} in month one and {$5|75} in month two. How many shares do you have?", "Inviertes {$100|1500} al mes. Las acciones cuestan {$10|150} el primer mes y {$5|75} el segundo. ¿Cuántas acciones tienes?"),
        [T("20", "20"), T("30", "30"), T("15", "15")],
        1,
        T("Month one buys 10 shares. Month two buys 20 at the lower price. That's 30 in total.", "El primer mes compras 10 acciones. El segundo, 20 al precio más bajo. Son 30 en total."),
        [T("That's two months at the first price. When the price halved, the same money bought twice as many.", "Eso sería dos meses al primer precio. Cuando el precio bajó a la mitad, el mismo dinero compró el doble."), null, T("Lower prices buy more shares, not fewer: month two alone bought 20.", "Precios más bajos compran más acciones, no menos: solo el segundo mes compró 20.")]
      )
    ),
  ],
  lessons: [
    {
      id: "etf-1",
      title: T("A basket of companies", "Una canasta de empresas"),
      steps: [
        card(T("Buy many at once", "Compra muchas a la vez"), T("An ETF (exchange-traded fund) is a basket of many investments you can buy as one. One share of an S&P 500 fund gives you a small piece of 500 big US companies.", "Un ETF (fondo cotizado) es una canasta con muchas inversiones que compras como una sola. Una parte de un fondo del S&P 500 te da un pedacito de 500 grandes empresas de Estados Unidos.", { en: "An ETF (exchange-traded fund) is a basket of many investments you can buy as one. NAFTRAC, for example, holds the biggest companies on the Mexican Stock Exchange, and from Mexico you can also buy US funds through the SIC (Sistema Internacional de Cotizaciones).", es: "Un ETF (fondo cotizado) es una canasta con muchas inversiones que compras como una sola. El NAFTRAC, por ejemplo, tiene a las empresas más grandes de la Bolsa Mexicana, y desde México también puedes comprar fondos de Estados Unidos a través del SIC (Sistema Internacional de Cotizaciones)." })),
        card(T("Why it helps", "Por qué ayuda"), T("If one company in the basket has a terrible year, it's just a small part of what you own. The others can make up for it.", "Si a una empresa de la canasta le va muy mal, es solo una parte pequeña de lo que tienes. Las demás pueden compensarlo.")),
        choice(
          "index_funds",
          T("What does one share of an S&P 500 index fund hold?", "¿Qué tiene una parte de un fondo indexado del S&P 500?"),
          [T("One company", "Una sola empresa"), T("Tiny pieces of about 500 companies", "Pedacitos de unas 500 empresas"), T("Government bonds only", "Solo bonos del gobierno")],
          1,
          T("That's the magic: instant variety in one purchase.", "Esa es la magia: variedad instantánea en una sola compra."),
          [T("That's a single stock. A fund holds many.", "Eso es una sola acción. Un fondo tiene muchas."), null, T("The S&P 500 is made of stocks of about 500 large US companies, not bonds.", "El S&P 500 está formado por acciones de unas 500 grandes empresas de EE. UU., no por bonos.")]
        ),
        tf("index_funds", T("ETFs trade on the stock market, like stocks.", "Los ETFs se compran y venden en la bolsa, como las acciones."), true, T("That's the \"exchange-traded\" part — you can buy and sell them any trading day.", "Esa es la parte de \"cotizado\": los puedes comprar y vender cualquier día hábil de la bolsa.")),
        act("portfolio.buy", T("Practice: buy a broad index fund with your pretend money.", "Práctica: compra un fondo indexado amplio con tu dinero de práctica."), {type: "etf",amount: [2000,40000]}),
      ],
    },
    {
      id: "etf-2",
      title: T("Index funds and fees", "Fondos indexados y comisiones"),
      steps: [
        card(T("Follow the whole market", "Seguir a todo el mercado"), T("An index fund doesn't try to pick winners. It just buys everything in an index (like the S&P 500) and follows it. Because it's simple, it's usually cheap.", "Un fondo indexado no intenta escoger ganadores. Solo compra todo lo que hay en un índice (como el S&P 500) y lo sigue. Como es sencillo, suele ser barato.", { en: "An index fund doesn't try to pick winners. It just buys everything in an index (like Mexico's S&P/BMV IPC or the US S&P 500) and follows it. Because it's simple, it's usually cheap.", es: "Un fondo indexado no intenta escoger ganadores. Solo compra todo lo que hay en un índice (como el S&P/BMV IPC de México o el S&P 500 de EE. UU.) y lo sigue. Como es sencillo, suele ser barato." })),
        card(T("Fees eat returns", "Las comisiones se comen tus ganancias"), T("Funds charge a yearly fee called the expense ratio. 0.05% vs. 1% sounds tiny, but over 30 years the cheaper fund can leave you thousands more.", "Los fondos cobran una comisión anual (en inglés, expense ratio). 0.05% contra 1% parece poco, pero en 30 años el fondo más barato puede dejarte miles más.")),
        choice(
          "fees",
          T("Two funds hold the same companies. Which should you usually pick?", "Dos fondos tienen las mismas empresas. ¿Cuál conviene normalmente?"),
          [T("The one with the lower fee", "El de la comisión más baja"), T("The one with the higher fee", "El de la comisión más alta"), T("It doesn't matter", "Da igual")],
          0,
          T("Same stuff inside, lower cost: more of the growth stays with you.", "Lo mismo por dentro, menor costo: más del crecimiento se queda contigo."),
          [null, T("With the same holdings, a higher fee just means less for you.", "Con las mismas inversiones, una comisión más alta solo significa menos para ti."), T("Fees come out every year, so over time they matter a lot.", "Las comisiones se cobran cada año, así que con el tiempo importan mucho.")]
        ),
        tf("index_funds", T("Most professional fund managers beat the index over long periods.", "La mayoría de los administradores profesionales le ganan al índice a largo plazo."), false, T("According to S&P's SPIVA reports, most actively managed funds have trailed their index over 10+ years, often because of higher fees. That's why index funds are popular.", "Según los reportes SPIVA de S&P, la mayoría de los fondos administrados activamente han quedado por debajo de su índice en periodos de 10 años o más, muchas veces por comisiones más altas. Por eso los fondos indexados son tan populares.")),
        act("portfolio.buy", T("Practice: add a different kind of fund — like international companies or bonds.", "Práctica: agrega otro tipo de fondo, como empresas internacionales o bonos."), {type: "etf",amount: [1000,20000],different: true}),
      ],
    },
    {
      id: "etf-3",
      title: T("A little every month", "Un poco cada mes"),
      steps: [
        card(T("Dollar-cost averaging", "Invertir de a poco"), T("Investing the same amount every month — no matter what prices do — is called dollar-cost averaging. When prices are low, your money buys more shares.", "Invertir la misma cantidad cada mes, sin importar lo que hagan los precios, se llama promediar el costo (en inglés, dollar-cost averaging). Cuando los precios están bajos, tu dinero compra más.")),
        card(T("No need to time it", "No necesitas adivinar el momento"), T("Nobody can reliably guess the best day to buy. A steady habit removes the guessing — and the stress.", "Nadie puede adivinar de forma confiable el mejor día para comprar. Un hábito constante quita las adivinanzas y el estrés.")),
        choice(
          "dollar_cost_averaging",
          T("You invest {$100|1500} every month. Prices fall this month. What happens?", "Inviertes {$100|1500} cada mes. Este mes bajan los precios. ¿Qué pasa?"),
          [T("Your {$100|1500} buys more shares", "Tus {$100|1500} compran más"), T("You must skip this month", "Debes saltarte este mes"), T("You lose your {$100|1500}", "Pierdes tus {$100|1500}")],
          0,
          T("Lower price, more shares for the same money. That's the quiet upside of a down month.", "Precio más bajo, más partes por el mismo dinero. Esa es la ventaja escondida de un mes malo."),
          [null, T("Nothing forces you to skip. Lower prices just mean more shares for the same money.", "Nada te obliga a saltártelo. Precios más bajos solo significan más acciones por el mismo dinero."), T("Your money buys shares at the lower price — it's still invested, not lost.", "Tu dinero compra acciones al precio más bajo: sigue invertido, no se pierde.")]
        ),
        tf("dollar_cost_averaging", T("Investing a fixed amount every month means you never need to watch the news to decide when to buy.", "Invertir una cantidad fija cada mes significa que no necesitas ver las noticias para decidir cuándo comprar."), true, T("The schedule decides, not the headlines.", "Decide el calendario, no los titulares.")),
        act("goals.invest", T("See where {$100|1500} a month in an index fund could be in 10 years — good years and bad.", "Mira dónde podrían estar {$100|1500} al mes en un fondo indexado en 10 años, con años buenos y malos."), {monthly: [100,1500],years: 10}),
      ],
    },
  ],
};
