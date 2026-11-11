// UNIT — Stocks. Its lessons and the concepts they teach (format in helpers.js).
import { T, card, choice, tf, act, concept, order, estimate, match, scenario, fit, number } from "./helpers.js";

export default {
  id: "stocks",
  icon: "building",
  title: T("Stocks", "Acciones"),
  concepts: [
    concept(
      "what_stock",
      T("What a stock is", "Qué es una acción"),
      card(T("Part-owner, not lender", "Dueño de una parte, no prestamista"), T("Buying a share makes you a part-owner of a company. If the company does well, your share can become worth more, and some companies pay part of their profit to owners (dividends). If it does badly, your share can lose value — nobody promises to pay you back.", "Comprar una acción te hace dueño de una parte de una empresa. Si le va bien, tu acción puede valer más, y algunas empresas reparten parte de sus ganancias a los dueños (dividendos). Si le va mal, tu acción puede perder valor: nadie promete devolverte tu dinero.")),
      tf("what_stock", T("A share of stock is a small piece of ownership in a company.", "Una acción es una pequeña parte de la propiedad de una empresa."), true, T("Own a share, own a slice — small, but real.", "Tienes una acción, tienes una rebanada: pequeña, pero real.")),
      choice(
        "what_stock",
        T("What's the key difference between a stock and a bond?", "¿Cuál es la diferencia clave entre una acción y un bono?"),
        [T("A stock is ownership; a bond is a loan", "Una acción es propiedad; un bono es un préstamo"), T("Stocks are always safer", "Las acciones siempre son más seguras"), T("Bonds are pieces of ownership", "Los bonos son partes de propiedad")],
        0,
        T("Owners share in gains and losses. Lenders are promised interest and repayment — though a borrower can still fail to pay.", "Los dueños comparten ganancias y pérdidas. A quienes prestan se les promete interés y pago, aunque quien pide prestado puede no pagar."),
        [null, T("Stocks usually swing more than bonds, not less.", "Las acciones suelen moverse más que los bonos, no menos."), T("A bondholder is a lender, not an owner.", "Quien tiene un bono es un prestamista, no un dueño.")]
      )
    ),
    concept(
      "price_moves",
      T("Why prices move", "Por qué se mueven los precios"),
      card(T("Expectations move prices", "Las expectativas mueven los precios"), T("A stock's price is what buyers will pay right now, and that depends on what they expect next. News that's better than expected tends to push it up; worse than expected tends to push it down — even if the news sounds good.", "El precio de una acción es lo que los compradores pagarían ahora, y eso depende de lo que esperan después. Una noticia mejor de lo esperado suele subirlo; una peor de lo esperado suele bajarlo, aunque la noticia suene bien.")),
      tf("price_moves", T("A stock's price can change every day the market is open.", "El precio de una acción puede cambiar cada día que abre el mercado."), true, T("Buyers and sellers trade all day, so the price keeps adjusting.", "Compradores y vendedores operan todo el día, así que el precio se sigue ajustando.")),
      choice(
        "price_moves",
        T("A company reports higher profits, but its stock falls. What's a likely reason?", "Una empresa reporta más ganancias, pero su acción baja. ¿Cuál es una razón probable?"),
        [T("Investors expected even higher profits", "Los inversionistas esperaban ganancias todavía más altas"), T("Higher profits always make stocks fall", "Más ganancias siempre hacen que las acciones bajen"), T("The market was closed", "El mercado estaba cerrado")],
        0,
        T("Prices react to news compared with expectations. Good news that's less good than expected can still disappoint.", "Los precios reaccionan a la noticia comparada con lo esperado. Una buena noticia, menos buena de lo esperado, puede decepcionar."),
        [null, T("There's no \"always\" — it depends on what people expected.", "No hay un \"siempre\": depende de lo que la gente esperaba."), T("If the market were closed, the price wouldn't have moved.", "Si el mercado estuviera cerrado, el precio no se habría movido.")]
      )
    ),
    concept(
      "volatility",
      T("Ups and downs", "Subidas y bajadas"),
      card(T("Bumpy is normal", "Lo normal es que haya baches"), T("Stock prices can rise or fall 10% or more in a few weeks and still grow over long periods — though that isn't guaranteed. That's why investing is usually for money you won't need for years: there's time to wait out the drops.", "Los precios de las acciones pueden subir o bajar 10% o más en unas semanas y aun así crecer en periodos largos, aunque no está garantizado. Por eso invertir suele ser para dinero que no vas a necesitar en años: hay tiempo para esperar a que pasen las caídas.")),
      tf("volatility", T("It's normal for stock prices to go down sometimes.", "Es normal que los precios de las acciones bajen a veces."), true, T("Drops are part of investing, not a sign something is broken.", "Las caídas son parte de invertir, no una señal de que algo esté mal.")),
      choice(
        "volatility",
        T("Why is money you need in 6 months usually kept out of stocks?", "¿Por qué el dinero que necesitas en 6 meses normalmente no se pone en acciones?"),
        [T("Stocks can be down right when you need to sell", "Las acciones pueden estar abajo justo cuando necesitas vender"), T("Stocks can't be sold for 6 months", "Las acciones no se pueden vender durante 6 meses"), T("Stocks never go up in 6 months", "Las acciones nunca suben en 6 meses")],
        0,
        T("Over a few months, a drop is very possible, and selling then turns it into a real loss.", "En unos meses una caída es muy posible, y vender en ese momento vuelve real la pérdida."),
        [null, T("You can usually sell any day the market is open. The risk is the price, not the rules.", "Normalmente puedes vender cualquier día que abre el mercado. El riesgo es el precio, no las reglas."), T("They often do go up — the problem is you can't count on it.", "Muchas veces sí suben; el problema es que no puedes contar con eso.")]
      )
    ),
  ],
  lessons: [
    {
      id: "stocks-1",
      title: T("What's a stock?", "¿Qué es una acción?"),
      steps: [
        card(T("Owning a tiny piece", "Ser dueño de un pedacito"), T("A stock (or share) is a tiny piece of a company. If you own a share of a company that makes sneakers, you own a sliver of every pair they sell.", "Una acción es un pedacito de una empresa. Si tienes una acción de una empresa que hace tenis, eres dueño de una parte diminuta de cada par que venden.")),
        card(T("Why companies sell shares", "Por qué las empresas venden acciones"), T("Companies sell shares to raise money to grow. Investors buy them hoping the company grows and the shares become worth more.", "Las empresas venden acciones para conseguir dinero y crecer. Los inversionistas las compran esperando que la empresa crezca y sus acciones valgan más.")),
        choice(
          "what_stock",
          T("If you own a share of a company, you…", "Si tienes una acción de una empresa, tú…"),
          [T("Lent the company money", "Le prestaste dinero a la empresa"), T("Own a small part of it", "Eres dueño de una pequeña parte"), T("Work for the company", "Trabajas para la empresa")],
          1,
          T("Shareholders are part-owners. Lending would be a bond.", "Los accionistas son dueños de una parte. Prestar sería un bono."),
          [T("Lending money to a company is a bond. A share is ownership.", "Prestarle dinero a una empresa es un bono. Una acción es propiedad."), null, T("Owning shares doesn't make you an employee.", "Tener acciones no te convierte en empleado.")]
        ),
        number("what_stock", T("A share goes from {$50|1000} to {$40|800}. By what percent did it fall?", "Una acción pasa de {$50|1000} a {$40|800}. ¿Qué porcentaje bajó?"), { unit: "percent", answer: 20 }, [T("It fell {$10|200}.", "Bajó {$10|200}."), T("{$10|200} ÷ {$50|1000} = 20%. Prices go down as well as up.", "{$10|200} ÷ {$50|1000} = 20%. Los precios bajan igual que suben.")]),
        match(
          "what_stock",
          T("Match each word to what it means.", "Une cada palabra con lo que significa."),
          [
            [T("Bond", "Bono"), T("A loan to a company or government", "Un préstamo a una empresa o gobierno")],
            [T("Dividend", "Dividendo"), T("Part of the profit paid to owners", "Parte de las ganancias que se paga a los dueños")],
            [T("Stock exchange", "Bolsa de valores"), T("Where shares are bought and sold", "Donde se compran y venden acciones")],
            [T("Ticker", "Clave de pizarra"), T("A stock's short code", "El código corto de una acción")],
          ],
          T("Own a share, and you own a sliver of the company and its future profits.", "Si tienes una acción, eres dueño de un pedacito de la empresa y de sus ganancias futuras.")
        ),
        act("portfolio.watch", T("Find 2 companies you know and add them to your watchlist.", "Busca 2 empresas que conozcas y agrégalas a tu lista."), {count: 2}),
      ],
    },
    {
      id: "stocks-2",
      title: T("Why prices move", "Por qué se mueven los precios"),
      steps: [
        card(T("Buyers and sellers", "Compradores y vendedores"), T("A stock's price is whatever buyers will pay and sellers will accept right now. Good news can bring more buyers; bad news, more sellers.", "El precio de una acción es lo que los compradores están dispuestos a pagar y los vendedores a aceptar en ese momento. Las buenas noticias atraen compradores; las malas, vendedores.")),
        card(T("Short term vs. long term", "Corto vs. largo plazo"), T("Day to day, prices bounce around for lots of reasons, some random. Over many years, they tend to follow how much the company actually earns.", "De un día a otro, los precios suben y bajan por muchas razones, algunas al azar. A lo largo de muchos años, tienden a seguir cuánto gana de verdad la empresa.")),
        choice(
          "price_moves",
          T("A company reports much bigger profits than expected. What often happens to its stock that day?", "Una empresa reporta ganancias mucho mayores a lo esperado. ¿Qué suele pasar con su acción ese día?"),
          [T("It tends to go up", "Tiende a subir"), T("It always goes down", "Siempre baja"), T("Nothing, ever", "Nada, nunca")],
          0,
          T("Often up — but not always. If people expected even more, it can drop. Markets are about surprises.", "Muchas veces sube, pero no siempre. Si la gente esperaba aún más, puede bajar. Los mercados reaccionan a las sorpresas."),
          [null, T("Better-than-expected profits usually push the price up, not down.", "Ganancias mejores de lo esperado suelen subir el precio, no bajarlo."), T("Prices react to news like this all the time.", "Los precios reaccionan a noticias así todo el tiempo.")]
        ),
        tf("price_moves", T("If a stock went up last month, it will go up next month too.", "Si una acción subió el mes pasado, va a subir el próximo mes."), false, T("Past moves don't predict the next one. Anyone who says they know is guessing.", "Lo que pasó no predice lo que sigue. Quien diga que sabe, está adivinando.")),
        order("price_moves", T("Put this in order: how a stock's price falls after news.", "Ordena esto: cómo baja el precio de una acción después de una noticia."), [T("The company earns less than people expected", "La empresa gana menos de lo que se esperaba"), T("Some owners decide to sell", "Algunos dueños deciden vender"), T("There are more sellers than buyers", "Hay más vendedores que compradores"), T("The price drops until buyers step in", "El precio baja hasta que llegan compradores")], T("Prices move with expectations: the gap between what people expected and what happened.", "Los precios se mueven con las expectativas: la diferencia entre lo que se esperaba y lo que pasó.")),
        act("portfolio.chart", T("Open a 1-year chart for any company. Find its highest and lowest point.", "Abre la gráfica de 1 año de cualquier empresa. Encuentra su punto más alto y el más bajo."), {}),
      ],
    },
    {
      id: "stocks-3",
      title: T("Ups and downs are normal", "Las subidas y bajadas son normales"),
      steps: [
        card(T("Volatility", "Volatilidad"), T("Volatility is how much a price swings. Single companies can drop 30% or more in a year — even great ones.", "La volatilidad es cuánto se mueve un precio. Una sola empresa puede caer 30% o más en un año, incluso las buenas.")),
        card(T("Don't panic-sell", "No vendas por pánico"), T("Selling when prices drop locks in the loss. People who stay calm and hold good investments for years usually do better than those who jump in and out.", "Vender cuando los precios caen hace que la pérdida se vuelva real. Quienes mantienen la calma y conservan buenas inversiones por años suelen irles mejor que a quienes entran y salen.")),
        scenario(
          "volatility",
          T("Your practice stock drops 15% in a week. What's your first move?", "Tu acción de práctica baja 15% en una semana. ¿Qué haces primero?"),
          [
            fit(T("Find out why, then check it against your plan", "Averiguar por qué y compararlo con tu plan"), "good", T("A drop with no real change at the company is often just noise.", "Una caída sin un cambio real en la empresa suele ser solo ruido.")),
            fit(T("Do nothing for now and look again next month", "No hacer nada por ahora y revisar el próximo mes"), "ok", T("Calm, though knowing why helps you decide next time.", "Con calma, aunque saber por qué te ayuda a decidir la próxima vez.")),
            fit(T("Sell everything right now", "Vender todo ahora mismo"), "poor", T("That locks in the loss, sometimes right before a bounce.", "Eso vuelve real la pérdida, a veces justo antes de un rebote.")),
          ],
          T("Ups and downs are normal. Your plan, not the week, decides what you do.", "Las subidas y bajadas son normales. Tu plan, no la semana, decide qué haces.")
        ),
        tf("volatility", T("Only invest money you won't need for several years.", "Solo invierte dinero que no vas a necesitar en varios años."), true, T("That way a bad year doesn't force you to sell at a low price.", "Así un mal año no te obliga a vender a un precio bajo.")),
        estimate("volatility", T("An investment drops 20%. How much does it then have to rise to get back to where it started?", "Una inversión baja 20%. ¿Cuánto tiene que subir después para volver a donde empezó?"), { unit: "percent", min: 0, max: 100, step: 1, answer: 25 }, T("{$100|1000} falls to {$80|800}. Getting back to {$100|1000} takes {$20|200} more, which is 25% of {$80|800}.", "{$100|1000} baja a {$80|800}. Volver a {$100|1000} requiere {$20|200} más, que es el 25% de {$80|800}.")),
        act("portfolio.chart", T("Look at a 1-year chart and ask the tutor to explain it.", "Mira una gráfica de 1 año y pídele al tutor que te la explique."), {explain: true}),
      ],
    },
  ],
};
