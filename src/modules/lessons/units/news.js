// UNIT — Reading financial news. Its lessons and the concepts they teach (format in helpers.js).
import { T, card, choice, tf, act, concept, estimate, match, scenario, fit } from "./helpers.js";

export default {
  id: "news",
  icon: "news",
  title: T("Reading financial news", "Leer noticias financieras"),
  concepts: [
    concept(
      "market_terms",
      T("Market words", "Palabras del mercado"),
      card(T("Bull, bear and indexes", "Toro, oso e índices"), T("A bull market is a long rise; a bear market is a fall of 20% or more from a high. Indexes like the S&P 500 are scoreboards for a group of stocks, so \"the market fell 2%\" usually means an index did.", "Un mercado alcista (toro) es una subida larga; uno bajista (oso) es una caída de 20% o más desde un máximo. Índices como el S&P 500 son marcadores de un grupo de acciones, así que \"el mercado cayó 2%\" suele significar que un índice cayó.", { en: "A bull market is a long rise; a bear market is a fall of 20% or more from a high. Indexes like Mexico's S&P/BMV IPC are scoreboards for a group of stocks, so \"the market fell 2%\" usually means an index did.", es: "Un mercado alcista (toro) es una subida larga; uno bajista (oso) es una caída de 20% o más desde un máximo. Índices como el S&P/BMV IPC son marcadores de un grupo de acciones, así que \"el mercado cayó 2%\" suele significar que un índice cayó." })),
      tf("market_terms", T("A bear market means prices have fallen a lot.", "Un mercado bajista significa que los precios cayeron mucho."), true, T("Usually 20% or more from a recent high.", "Normalmente 20% o más desde un máximo reciente.")),
      choice(
        "market_terms",
        T("The S&P 500 is \"up 1%\" today. What does that mean?", "El S&P 500 \"sube 1%\" hoy. ¿Qué significa?", { en: "The IPC is \"up 1%\" today. What does that mean?", es: "El IPC \"sube 1%\" hoy. ¿Qué significa?" }),
        [T("The group of stocks it tracks rose about 1% overall", "El grupo de acciones que sigue subió cerca de 1% en conjunto"), T("Every stock rose 1%", "Todas las acciones subieron 1%"), T("Savings accounts paid 1%", "Las cuentas de ahorro pagaron 1%")],
        0,
        T("An index is an overall score for a group. Some stocks rose more, some fell.", "Un índice es un marcador general de un grupo. Algunas acciones subieron más y otras bajaron."),
        [null, T("Some stocks in it rose more and some fell; the index shows the overall move.", "Algunas subieron más y otras bajaron; el índice muestra el movimiento general."), T("Indexes track stocks, not savings accounts.", "Los índices siguen acciones, no cuentas de ahorro.")]
      )
    ),
    concept(
      "inflation_rates",
      T("Inflation and interest rates", "Inflación y tasas de interés"),
      card(T("Prices up, money worth less", "Precios arriba, dinero que vale menos"), T("Inflation means prices rise over time, so the same money buys less. The Federal Reserve raises interest rates to slow inflation, which makes borrowing cost more and savings tend to pay more.", "La inflación significa que los precios suben con el tiempo, así que el mismo dinero alcanza para menos. La Reserva Federal sube las tasas de interés para frenar la inflación, lo que encarece los préstamos y suele hacer que el ahorro pague más.", { en: "Inflation means prices rise over time, so the same money buys less. Banxico raises interest rates to slow inflation, which makes borrowing cost more and savings tend to pay more.", es: "La inflación significa que los precios suben con el tiempo, así que el mismo dinero alcanza para menos. Banxico sube las tasas de interés para frenar la inflación, lo que encarece los préstamos y suele hacer que el ahorro pague más." })),
      tf("inflation_rates", T("Inflation means prices go up over time.", "La inflación significa que los precios suben con el tiempo."), true, T("Which is why the same money buys a little less each year.", "Por eso el mismo dinero alcanza para un poco menos cada año.")),
      choice(
        "inflation_rates",
        T("Your savings earn 3% a year and inflation is 5%. What happens to your buying power?", "Tu ahorro gana 3% al año y la inflación es de 5%. ¿Qué le pasa a tu poder de compra?"),
        [T("It shrinks by about 2% a year", "Baja cerca de 2% al año"), T("It grows 3%", "Crece 3%"), T("It grows 8%", "Crece 8%")],
        0,
        T("Your money grows 3%, but prices grow 5%, so you can buy about 2% less each year.", "Tu dinero crece 3%, pero los precios 5%, así que puedes comprar cerca de 2% menos cada año."),
        [null, T("Your balance grows 3%, but prices rise faster, so it buys less.", "Tu saldo crece 3%, pero los precios suben más rápido, así que alcanza para menos."), T("Inflation doesn't add to your growth — it works against it.", "La inflación no se suma a tu crecimiento: va en contra.")]
      )
    ),
    concept(
      "news_reactions",
      T("Reacting to news", "Reaccionar a las noticias"),
      card(T("By the time you read it, it's priced in", "Cuando lo lees, ya está en el precio"), T("Markets react to news in seconds. By the time a headline reaches you, prices have usually already moved, so selling on a scary headline often means selling after the drop. A plan made in calm times is a better guide than a headline.", "Los mercados reaccionan a las noticias en segundos. Cuando un titular te llega, los precios normalmente ya se movieron, así que vender por un titular alarmante suele ser vender después de la caída. Un plan hecho con calma es mejor guía que un titular.")),
      tf("news_reactions", T("Big market news is usually already reflected in prices by the time you read it.", "Las grandes noticias del mercado normalmente ya están reflejadas en los precios cuando las lees."), true, T("Professional traders react in seconds; headlines arrive later.", "Los operadores profesionales reaccionan en segundos; los titulares llegan después.")),
      choice(
        "news_reactions",
        T("Markets drop 5% in a day on scary news. What do many long-term investors do?", "Los mercados caen 5% en un día por una noticia alarmante. ¿Qué hacen muchos inversionistas de largo plazo?"),
        [T("Stick to their plan and avoid selling in a panic", "Siguen su plan y evitan vender por pánico"), T("Sell everything and wait for good news", "Venden todo y esperan buenas noticias"), T("Borrow money to buy as much as they can", "Piden prestado para comprar todo lo que puedan")],
        0,
        T("Sharp daily drops happen. Panic-selling locks in losses, and waiting for \"good news\" often means buying back higher.", "Las caídas fuertes en un día pasan. Vender por pánico vuelve reales las pérdidas, y esperar \"buenas noticias\" suele significar volver a comprar más caro."),
        [null, T("Selling after a drop locks in the loss, and good news often comes after prices have already recovered.", "Vender después de una caída vuelve real la pérdida, y las buenas noticias suelen llegar cuando los precios ya se recuperaron."), T("Borrowing to invest magnifies losses as well as gains.", "Pedir prestado para invertir hace más grandes tanto las pérdidas como las ganancias.")]
      )
    ),
  ],
  lessons: [
    {
      id: "news-1",
      title: T("Headlines decoded", "Titulares sin misterio"),
      steps: [
        card(T("The words you'll see", "Las palabras que vas a ver"), T("A \"bull market\" is a long stretch of rising prices; a \"bear market\" is a drop of 20% or more. A \"rally\" is a quick rise; a \"sell-off\" is a quick fall.", "Un \"mercado alcista\" (bull market) es una racha larga de precios al alza; un \"mercado bajista\" (bear market) es una caída de 20% o más. Un \"rally\" es una subida rápida; un \"sell-off\", una caída rápida.")),
        card(T("Indexes are the scoreboard", "Los índices son el marcador"), T("When the news says \"the market,\" it usually means an index like the S&P 500 or the Dow.", "Cuando las noticias dicen \"el mercado\", casi siempre hablan de un índice como el S&P 500 o el Dow.", { en: "In Mexico, \"the market\" usually means the S&P/BMV IPC — the main index of the Mexican Stock Exchange.", es: "En México, \"la bolsa\" casi siempre se refiere al S&P/BMV IPC, el índice principal de la Bolsa Mexicana de Valores." })),
        choice(
          "market_terms",
          T("\"Stocks enter bear market territory.\" What happened?", "\"Las acciones entran en terreno bajista.\" ¿Qué pasó?"),
          [T("Prices fell 20% or more from a high", "Los precios cayeron 20% o más desde un máximo"), T("Prices hit a record", "Los precios llegaron a un récord"), T("The market closed early", "La bolsa cerró temprano")],
          0,
          T("Bear = down 20%+. Scary headline, normal event — it has happened many times before.", "Bajista = 20% abajo o más. Titular que asusta, evento normal: ha pasado muchas veces."),
          [null, T("A record high is the opposite — that's bull territory.", "Un máximo histórico es lo contrario: eso es territorio alcista."), T("A bear market is about falling prices, not trading hours.", "Un mercado bajista se trata de precios que caen, no de horarios.")]
        ),
        tf("news_reactions", T("A scary headline is a reason to sell everything.", "Un titular que da miedo es razón para vender todo."), false, T("Headlines are written to grab attention. Your plan should be built for bad days too.", "Los titulares están hechos para llamar la atención. Tu plan debe estar hecho también para los días malos.")),
        match(
          "market_terms",
          T("Match each headline word to what it means.", "Une cada palabra de los titulares con lo que significa."),
          [
            [T("Bull market", "Mercado alcista"), T("Prices rising for a long stretch", "Precios subiendo por mucho tiempo")],
            [T("Bear market", "Mercado bajista"), T("Prices down 20% or more from a peak", "Precios 20% o más abajo de un máximo")],
            [T("Index", "Índice"), T("A scoreboard for a group of stocks", "Un marcador para un grupo de acciones")],
            [T("Recession", "Recesión"), T("The economy shrinking for a while", "La economía achicándose por un tiempo")],
          ],
          T("Knowing the words makes the headlines a lot less dramatic.", "Conocer las palabras hace los titulares mucho menos dramáticos.")
        ),
        act("news.read", T("Read one of today's headlines, explained.", "Lee uno de los titulares de hoy, explicado."), {}),
      ],
    },
    {
      id: "news-2",
      title: T("Rates and inflation", "Tasas e inflación"),
      steps: [
        card(T("Inflation", "Inflación"), T("Inflation means prices rise over time, so each dollar buys a bit less. The US central bank aims for about {@fedInflationTarget} a year.", "La inflación significa que los precios suben con el tiempo, así que cada peso compra un poco menos. El banco central de EE. UU. busca alrededor de {@fedInflationTarget} al año.", { en: "Inflation means prices rise over time, so each peso buys a bit less. Mexico's central bank, Banxico, aims for about {@banxicoInflationTarget} a year.", es: "La inflación significa que los precios suben con el tiempo, así que cada peso compra un poco menos. Banxico, el banco central de México, busca alrededor de {@banxicoInflationTarget} al año." })),
        card(T("Why rates matter", "Por qué importan las tasas"), T("To fight high inflation, the Federal Reserve (the Fed) raises interest rates. Loans get pricier and savings pay more. When it cuts rates, the opposite happens.", "Para frenar la inflación alta, la Reserva Federal (la Fed) sube las tasas de interés. Los préstamos se encarecen y el ahorro paga más. Cuando las baja, pasa lo contrario.", { en: "To fight high inflation, Banxico raises its interest rate. Loans get pricier and CETES pay more. When it cuts rates, the opposite happens.", es: "Para frenar la inflación alta, Banxico sube su tasa de interés. Los préstamos se encarecen y los CETES pagan más. Cuando la baja, pasa lo contrario." })),
        choice(
          "inflation_rates",
          T("The central bank raises interest rates. What usually happens?", "El banco central sube las tasas de interés. ¿Qué suele pasar?"),
          [T("Borrowing gets more expensive", "Pedir prestado se vuelve más caro"), T("Everything gets cheaper right away", "Todo se abarata al instante"), T("Savings accounts pay less", "Las cuentas de ahorro pagan menos")],
          0,
          T("Higher rates = pricier loans, and usually better rates on savings.", "Tasas más altas = préstamos más caros, y normalmente mejores rendimientos para el ahorro."),
          [null, T("Higher rates can slow price rises over time, but prices don't drop right away.", "Tasas más altas pueden frenar la subida de precios con el tiempo, pero los precios no bajan de inmediato."), T("It's usually the opposite: savings rates tend to rise when the central bank's rate goes up.", "Suele ser lo contrario: las tasas de ahorro tienden a subir cuando sube la tasa del banco central.")]
        ),
        tf("inflation_rates", T("If your savings earn less than inflation, your money loses buying power.", "Si tu ahorro gana menos que la inflación, tu dinero pierde poder de compra."), true, T("Earning 1% while prices rise 4% means you can buy less next year.", "Ganar 1% mientras los precios suben 4% significa que el próximo año puedes comprar menos.")),
        estimate("inflation_rates", T("If prices rise 3% a year, about what will {$100|1000} of groceries cost in 10 years?", "Si los precios suben 3% al año, ¿cuánto costará más o menos en 10 años el súper que hoy cuesta {$100|1000}?"), { unit: "money", min: [100, 1000], max: [300, 3000], step: [1, 10], answer: [134, 1340], tol: 0.1 }, T("Prices compound too: {$100|1000} × 1.03 ten times is about {$134|1340}. That's why savings need to earn something.", "Los precios también se componen: {$100|1000} × 1.03 diez veces son unos {$134|1340}. Por eso el ahorro tiene que ganar algo.")),
        act("portfolio.review", T("Check how your practice portfolio did since you started.", "Revisa cómo le ha ido a tu portafolio de práctica desde que empezaste."), {}),
      ],
    },
    {
      id: "news-3",
      title: T("Don't trade on headlines", "No inviertas por titulares"),
      steps: [
        card(T("News is already in the price", "La noticia ya está en el precio"), T("By the time you read a headline, millions of people and computers have already acted on it. Trading on news is a race you're late to.", "Para cuando lees un titular, millones de personas y computadoras ya actuaron. Invertir por noticias es una carrera a la que llegas tarde.")),
        card(T("Use news to learn, not to react", "Usa las noticias para aprender, no para reaccionar"), T("Good questions: What does this mean for my long-term plan? Does it change why I own this? Usually the answer is: nothing to do.", "Buenas preguntas: ¿qué significa esto para mi plan a largo plazo? ¿Cambia la razón por la que tengo esta inversión? Casi siempre la respuesta es: no hay que hacer nada.")),
        choice(
          "news_reactions",
          T("A headline says a company you own is \"plunging.\" Best first move?", "Un titular dice que una empresa que tienes \"se desploma\". ¿Mejor primer paso?"),
          [T("Sell immediately", "Vender de inmediato"), T("Read past the headline and check your plan", "Leer más allá del titular y revisar tu plan"), T("Post about it", "Publicarlo en redes")],
          1,
          T("Headlines exaggerate. Get the facts, then decide calmly — often by doing nothing.", "Los titulares exageran. Infórmate y luego decide con calma; muchas veces, sin hacer nada."),
          [T("By the time you read it, the price has usually already moved. Selling in a rush often means selling low.", "Cuando lo lees, el precio casi siempre ya se movió. Vender con prisa suele significar vender barato."), null, T("Posting doesn't change your investment — understanding the news does.", "Publicarlo no cambia tu inversión; entender la noticia, sí.")]
        ),
        tf("news_reactions", T("Checking your investments every hour usually leads to better results.", "Revisar tus inversiones cada hora suele dar mejores resultados."), false, T("Checking constantly makes normal swings feel scary and tempts you to trade too much.", "Revisar todo el tiempo hace que los movimientos normales den miedo y te tienta a mover tus inversiones de más.")),
        scenario(
          "news_reactions",
          T("A headline says “Stocks plunge 3% on rate fears.” You invest in an index fund every month for the long run. What do you do?", "Un titular dice “Las acciones se desploman 3% por miedo a las tasas”. Inviertes en un fondo indexado cada mes a largo plazo. ¿Qué haces?"),
          [
            fit(T("Read why it happened, and keep your plan", "Leer por qué pasó y seguir con tu plan"), "good", T("You learn something, and your plan was made for days like this.", "Aprendes algo, y tu plan está hecho para días así.")),
            fit(T("Pause new money for a few months", "Pausar las aportaciones unos meses"), "ok", T("Not a disaster, but you'd skip buying while prices are lower.", "No es grave, pero dejarías de comprar justo cuando los precios están más bajos.")),
            fit(T("Sell everything before it falls further", "Vender todo antes de que baje más"), "poor", T("By the time a headline is out, the news is already in the price.", "Para cuando sale el titular, la noticia ya está en el precio.")),
          ],
          T("Use news to learn, not to react.", "Usa las noticias para aprender, no para reaccionar.")
        ),
        act("portfolio.review", T("Look at your portfolio and make a calm decision: hold, or adjust with a reason.", "Mira tu portafolio y toma una decisión con calma: mantener, o ajustar con una razón."), {decide: true}),
      ],
    },
  ],
};
