// UNIT — Crypto and risky investments. Strictly educational: no coins are
// recommended. Its lessons and the concepts they teach (format in helpers.js).
import { T, card, choice, tf, act, concept, estimate, match, number, spot, tap } from "./helpers.js";

export default {
  id: "crypto",
  icon: "layers",
  title: T("Crypto and risky investments", "Cripto e inversiones de alto riesgo"),
  concepts: [
    concept(
      "crypto_basics",
      T("What crypto is", "Qué son las criptomonedas"),
      card(T("Digital tokens on a shared ledger", "Fichas digitales en un registro compartido"), T("A cryptocurrency is a digital token recorded on a blockchain — a shared ledger kept by many computers. It isn't issued or backed by a government or central bank, and crypto held on an exchange isn't covered by bank deposit insurance.", "Una criptomoneda es una ficha digital registrada en una blockchain: un registro compartido que mantienen muchas computadoras. No la emite ni la respalda un gobierno o banco central, y la cripto que tienes en una plataforma no está cubierta por el seguro de depósitos bancarios.")),
      tf("crypto_basics", T("Crypto held on an exchange is protected like a bank deposit.", "La cripto que tienes en una plataforma está protegida como un depósito bancario."), false, T("Deposit insurance (FDIC, IPAB) covers bank deposits — not crypto.", "El seguro de depósitos (FDIC, IPAB) cubre depósitos bancarios, no cripto.")),
      choice(
        "crypto_basics",
        T("What gives a cryptocurrency its price?", "¿Qué le da su precio a una criptomoneda?"),
        [T("Mostly what buyers are willing to pay at the moment", "Sobre todo lo que los compradores están dispuestos a pagar en ese momento"), T("A government guarantee", "Una garantía del gobierno"), T("The company's profits", "Las ganancias de la empresa")],
        0,
        T("With no government backing and no company earnings behind most coins, price rests on demand — which can change fast.", "Sin respaldo de gobierno y sin ganancias de una empresa detrás de la mayoría de las monedas, el precio depende de la demanda, que puede cambiar rápido."),
        [null, T("Most cryptocurrencies have no government guarantee.", "La mayoría de las criptomonedas no tiene garantía de un gobierno."), T("That's how stocks work. A coin usually isn't a share of a company.", "Así funcionan las acciones. Una moneda normalmente no es parte de una empresa.")]
      )
    ),
    concept(
      "crypto_volatility",
      T("Why crypto swings", "Por qué la cripto se mueve tanto"),
      card(T("Big moves, both ways", "Movimientos grandes, para los dos lados"), T("Crypto prices can rise or fall 10% in a day and more than 50% in a year. Bitcoin, the largest, has dropped by more than half several times. That's why it's often described as a high-risk, speculative asset.", "Los precios de la cripto pueden subir o bajar 10% en un día y más de 50% en un año. Bitcoin, la más grande, ha caído a menos de la mitad varias veces. Por eso suele describirse como un activo especulativo de alto riesgo.")),
      tf("crypto_volatility", T("Crypto prices can fall by half or more within a year.", "Los precios de la cripto pueden caer a la mitad o más en un año."), true, T("It has happened repeatedly, even to the biggest coins.", "Ha pasado varias veces, incluso con las monedas más grandes.")),
      choice(
        "crypto_volatility",
        T("A coin falls 50%, then rises 50%. Where does it end up?", "Una moneda cae 50% y luego sube 50%. ¿Dónde termina?"),
        [T("25% below where it started", "25% abajo de donde empezó"), T("Back where it started", "Donde empezó"), T("50% above where it started", "50% arriba de donde empezó")],
        0,
        T("{$100|1000} → {$50|500} after the fall. A 50% rise on {$50|500} only gets back to {$75|750}.", "{$100|1000} → {$50|500} después de la caída. Subir 50% sobre {$50|500} solo regresa a {$75|750}."),
        [null, T("A rise works on the smaller amount, so the same % doesn't make up the loss.", "La subida se calcula sobre el monto menor, así que el mismo % no recupera la pérdida."), T("The two moves don't cancel, let alone add up.", "Los dos movimientos ni se cancelan, mucho menos suman.")]
      )
    ),
    concept(
      "hype",
      T("Spotting hype", "Detectar el hype"),
      card(T("Loud isn't the same as good", "Ruidoso no es lo mismo que bueno"), T("Hype sounds like: \"100× soon\", \"get in before it explodes\", \"never sell\", celebrity endorsements, and countdowns. Real information sounds like: who runs it, how it works, what the risks are. Influencers are often paid to promote.", "El hype suena así: \"100× pronto\", \"entra antes de que explote\", \"nunca vendas\", famosos que la promueven y cuentas regresivas. La información real suena así: quién lo dirige, cómo funciona, cuáles son los riesgos. A los influencers muchas veces les pagan por promocionar.")),
      tf("hype", T("A celebrity promoting a coin is good evidence it's a sound investment.", "Que una celebridad promueva una moneda es buena prueba de que es una inversión sólida."), false, T("Celebrities are often paid to promote. Fame isn't research.", "A las celebridades muchas veces les pagan por promocionar. La fama no es investigación.")),
      choice(
        "hype",
        T("Which is a sign of hype rather than information?", "¿Cuál es señal de hype y no de información?"),
        [T("\"Buy now before it goes to the moon!\"", "\"¡Compra ya antes de que se vaya a la luna!\""), T("\"Here's who runs the project and how it makes money\"", "\"Esto es quién dirige el proyecto y cómo gana dinero\""), T("\"Here are the main risks\"", "\"Estos son los principales riesgos\"")],
        0,
        T("Urgency and big promises are hype. Facts about who, how and the risks are information.", "La urgencia y las promesas grandes son hype. Los datos sobre quién, cómo y los riesgos son información."),
        [null, T("Explaining who's behind it and how it works is real information.", "Explicar quién está detrás y cómo funciona es información real."), T("Being open about risks is a good sign, not hype.", "Ser claro sobre los riesgos es buena señal, no hype.")]
      )
    ),
    concept(
      "risky_bets",
      T("Other risky bets", "Otras apuestas riesgosas"),
      card(T("When the downside can be everything", "Cuando puedes perderlo todo"), T("Some bets can lose everything quickly: borrowing to invest (leverage), short-term trading of options, meme stocks chasing a trend, and gambling apps. Many people keep anything like this to a small amount they could lose without it hurting their goals.", "Algunas apuestas pueden perderlo todo rápido: pedir prestado para invertir (apalancamiento), operar opciones a corto plazo, acciones de moda que siguen una tendencia y las apps de apuestas. Mucha gente limita esto a una cantidad pequeña que podría perder sin afectar sus metas.")),
      tf("risky_bets", T("Borrowing money to invest can make losses bigger.", "Pedir prestado para invertir puede hacer más grandes las pérdidas."), true, T("You lose on the investment and still owe the loan.", "Pierdes en la inversión y todavía debes el préstamo.")),
      choice(
        "risky_bets",
        T("You invest {$100|1500} of your own and {$100|1500} borrowed. The investment falls 50%. What's left of your own money?", "Inviertes {$100|1500} tuyos y {$100|1500} prestados. La inversión cae 50%. ¿Qué queda de tu dinero?"),
        [T("Nothing — the {$100|1500} left goes to repay the loan", "Nada: los {$100|1500} que quedan se van a pagar el préstamo"), T("{$50|750}", "{$50|750}"), T("{$100|1500}", "{$100|1500}")],
        0,
        T("{$200|3000} becomes {$100|1500}. Repay the {$100|1500} loan and your own money is gone — a 50% drop wiped out 100% of your stake.", "{$200|3000} se vuelven {$100|1500}. Pagas el préstamo de {$100|1500} y tu dinero desaparece: una caída de 50% borró el 100% de lo tuyo."),
        [null, T("That would be true without borrowing. Leverage doubles the hit to your own money.", "Eso sería sin pedir prestado. El apalancamiento duplica el golpe a tu dinero."), T("The loss doesn't skip your money — the lender gets paid first.", "La pérdida no se salta tu dinero: primero se le paga a quien prestó.")]
      )
    ),
  ],
  lessons: [
    {
      id: "crypto-1",
      title: T("What crypto is", "Qué son las criptomonedas"),
      steps: [
        card(T("A digital token", "Una ficha digital"), T("Bitcoin and other cryptocurrencies are tokens recorded on a blockchain. You can buy them on apps and exchanges. Unlike pesos or dollars, they aren't issued by a central bank.", "Bitcoin y otras criptomonedas son fichas registradas en una blockchain. Puedes comprarlas en apps y plataformas. A diferencia del peso o el dólar, no las emite un banco central.")),
        card(T("What protects you — and what doesn't", "Qué te protege y qué no"), T("Crypto on an exchange isn't covered by deposit insurance, and transfers usually can't be reversed. If an exchange fails or you send to the wrong address, the money may be gone.", "La cripto en una plataforma no está cubierta por el seguro de depósitos, y las transferencias normalmente no se pueden revertir. Si la plataforma quiebra o mandas a una dirección equivocada, el dinero puede perderse.", { en: "Crypto isn't legal tender in Mexico, and Banxico has warned about its risks. It isn't covered by IPAB, and transfers usually can't be reversed.", es: "La cripto no es moneda de curso legal en México, y Banxico ha advertido sobre sus riesgos. No está cubierta por el IPAB, y las transferencias normalmente no se pueden revertir." })),
        choice(
          "crypto_basics",
          T("Who issues most cryptocurrencies?", "¿Quién emite la mayoría de las criptomonedas?"),
          [T("Not a government or central bank — a network or a project", "No un gobierno ni un banco central: una red o un proyecto"), T("The central bank", "El banco central"), T("Your bank", "Tu banco")],
          0,
          T("That's the big difference from regular money.", "Esa es la gran diferencia con el dinero normal."),
          [null, T("Central banks issue pesos and dollars, not Bitcoin.", "Los bancos centrales emiten pesos y dólares, no Bitcoin."), T("Banks may let you buy crypto, but they don't create it.", "Los bancos pueden dejarte comprar cripto, pero no la crean.")]
        ),
        tf("crypto_basics", T("A crypto transfer to the wrong address can usually be reversed.", "Una transferencia de cripto a una dirección equivocada normalmente se puede revertir."), false, T("Most crypto transfers are final. That's one reason scammers like it.", "La mayoría de las transferencias de cripto son definitivas. Esa es una razón por la que les gusta a los estafadores.")),
        match(
          "crypto_basics",
          T("Match each crypto word to what it means.", "Une cada palabra de cripto con lo que significa."),
          [
            [T("Blockchain", "Blockchain"), T("A shared record of every transfer", "Un registro compartido de cada transferencia")],
            [T("Exchange", "Exchange (casa de cambio de cripto)"), T("A company where you buy and sell crypto", "Una empresa donde compras y vendes cripto")],
            [T("Seed phrase", "Frase semilla"), T("Secret words that control a wallet: never share them", "Palabras secretas que controlan una cartera: nunca las compartas")],
            [T("Central bank", "Banco central"), T("Issues dollars and pesos, not crypto", "Emite dólares y pesos, no cripto")],
          ],
          T("Crypto isn't issued by a central bank, and on an exchange it isn't covered by deposit insurance.", "Las criptomonedas no las emite un banco central, y en un exchange no las cubre el seguro de depósitos.")
        ),
        act("goals.swing", T("Watch a very volatile (made-up) asset next to a broad fund.", "Mira un activo muy volátil (inventado) junto a un fondo amplio.")),
      ],
    },
    {
      id: "crypto-2",
      title: T("Why it swings so much", "Por qué se mueve tanto"),
      steps: [
        card(T("Nothing to anchor the price", "Nada que ancle el precio"), T("A stock's price is tied, in the long run, to a company's profits. Most coins have no profits or cash flows behind them, so price moves with demand, news and mood — and can move a lot.", "El precio de una acción, a largo plazo, está ligado a las ganancias de una empresa. La mayoría de las monedas no tiene ganancias ni flujos detrás, así que el precio se mueve con la demanda, las noticias y el ánimo, y se puede mover mucho.")),
        card(T("The math of a drop", "Las matemáticas de una caída"), T("After a 50% fall, you need a 100% rise just to get back to even. Big drops are much harder to recover from than they look.", "Después de una caída de 50%, necesitas una subida de 100% solo para volver al punto de partida. Las caídas grandes cuestan mucho más recuperarlas de lo que parece.")),
        choice(
          "crypto_volatility",
          T("After a 50% drop, how much does it need to rise to get back to where it started?", "Después de una caída de 50%, ¿cuánto tiene que subir para volver a donde empezó?"),
          [T("100%", "100%"), T("50%", "50%"), T("25%", "25%")],
          0,
          T("Half of {$100|1000} is {$50|500}; doubling {$50|500} — a 100% rise — gets back to {$100|1000}.", "La mitad de {$100|1000} son {$50|500}; duplicar {$50|500} —subir 100%— regresa a {$100|1000}."),
          [null, T("A 50% rise on {$50|500} only reaches {$75|750}.", "Subir 50% sobre {$50|500} solo llega a {$75|750}."), T("A 25% rise on {$50|500} reaches about {$63|625}.", "Subir 25% sobre {$50|500} llega a unos {$63|625}.")]
        ),
        tf("crypto_volatility", T("Most cryptocurrencies have company profits behind their price, like stocks.", "La mayoría de las criptomonedas tiene ganancias de una empresa detrás de su precio, como las acciones."), false, T("Most don't — which is part of why prices swing so much.", "La mayoría no, y eso es parte de por qué los precios se mueven tanto.")),
        estimate("crypto_volatility", T("A coin drops 50%. How much does it then have to rise to get back to where it started?", "Una moneda baja 50%. ¿Cuánto tiene que subir después para volver a donde empezó?"), { unit: "percent", min: 0, max: 300, step: 5, answer: 100, tol: 0.1 }, T("{$100|1000} falls to {$50|500}. Doubling, a 100% rise, only gets you back to {$100|1000}.", "{$100|1000} baja a {$50|500}. Duplicarse, subir 100%, solo te regresa a {$100|1000}.")),
        act("goals.swing", T("Run a few made-up years and compare the biggest drops.", "Corre unos cuantos años inventados y compara las mayores caídas.")),
      ],
    },
    {
      id: "crypto-3",
      title: T("Spotting hype", "Cómo detectar el hype"),
      steps: [
        card(T("What hype sounds like", "Cómo suena el hype"), T("\"It'll 100×!\", \"get in early\", \"everyone's buying\", \"never sell.\" Urgency plus big promises plus social proof — the same tactics as ads and scams.", "\"¡Se va a multiplicar 100 veces!\", \"entra temprano\", \"todos están comprando\", \"nunca vendas\". Urgencia más promesas grandes más prueba social: las mismas tácticas que los anuncios y los fraudes.")),
        card(T("What information sounds like", "Cómo suena la información"), T("Who runs it, how it works, what problem it solves, what could go wrong. If you can't find these, that tells you something.", "Quién lo dirige, cómo funciona, qué problema resuelve, qué podría salir mal. Si no encuentras esto, eso ya te dice algo.")),
        choice(
          "hype",
          T("An influencer says a coin \"can't lose.\" What should you assume?", "Un influencer dice que una moneda \"no puede perder\". ¿Qué deberías suponer?"),
          [T("It's hype — every investment can lose, and they may be paid to promote it", "Es hype: toda inversión puede perder, y quizá le pagan por promocionarla"), T("It's safe because many people follow them", "Es segura porque mucha gente lo sigue"), T("You should buy before others do", "Deberías comprar antes que los demás")],
          0,
          T("\"Can't lose\" is never true in investing.", "\"No puede perder\" nunca es cierto al invertir."),
          [null, T("Followers aren't evidence. Popular can still crash.", "Los seguidores no son evidencia. Lo popular también se puede desplomar."), T("Rushing is exactly what hype wants.", "Apresurarte es justo lo que quiere el hype.")]
        ),
        tf("hype", T("If you can't find who runs a crypto project, that's a warning sign.", "Si no encuentras quién dirige un proyecto de cripto, eso es una señal de alerta."), true, T("Anonymous projects make it easy to disappear with the money.", "Los proyectos anónimos hacen fácil desaparecer con el dinero.")),
        spot(
          "hype",
          T("A post about a new coin. Tap the 2 signs of hype.", "Una publicación sobre una moneda nueva. Toca las 2 señales de exageración."),
          "offer",
          T("Post · @moon.signals", "Publicación · @moon.signals"),
          [
            tap(T("This coin will go up 100× by Friday", "Esta moneda va a subir 100× para el viernes"), true),
            T(". ", ". "),
            tap(T("Get in before it's too late", "Entra antes de que sea tarde"), true),
            T(". ", ". "),
            tap(T("Total supply: 1 billion tokens", "Oferta total: mil millones de tokens")),
            T(". ", ". "),
            tap(T("Code published on GitHub", "Código publicado en GitHub")),
          ],
          T("Promises of huge, fast gains and pressure to hurry are hype. A token count and published code are information you can check, though they don't make it a good investment.", "Las promesas de ganancias enormes y rápidas y la prisa son exageración. La cantidad de tokens y el código publicado son información que puedes revisar, aunque no la hacen una buena inversión.")
        ),
        act("goals.scam", T("Find the hype in this post.", "Encuentra el hype en esta publicación."), { set: "hype" }),
      ],
    },
    {
      id: "crypto-4",
      title: T("Other risky bets", "Otras apuestas riesgosas"),
      steps: [
        card(T("Leverage, options, meme stocks, betting", "Apalancamiento, opciones, acciones de moda, apuestas"), T("Borrowing to invest, short-term options trading, chasing whatever stock is trending, and sports-betting or gambling apps can all lose money fast. Many are designed to feel like games.", "Pedir prestado para invertir, operar opciones a corto plazo, perseguir la acción de moda y las apps de apuestas pueden hacer perder dinero rápido. Muchas están diseñadas para sentirse como juegos.")),
        card(T("Keep it small, if at all", "Pequeño, si acaso"), T("A common approach: keep anything this risky to a small amount you could lose completely without touching your goals or emergency fund. In this app, risky bets stay out of the practice portfolio.", "Un enfoque común: mantener cualquier cosa así de riesgosa en una cantidad pequeña que podrías perder por completo sin tocar tus metas ni tu fondo de emergencia. En esta app, las apuestas riesgosas se quedan fuera del portafolio de práctica.")),
        choice(
          "risky_bets",
          T("Why is leverage (borrowing to invest) risky?", "¿Por qué es riesgoso el apalancamiento (pedir prestado para invertir)?"),
          [T("It makes losses bigger, and you still owe the loan", "Hace más grandes las pérdidas, y todavía debes el préstamo"), T("It's illegal", "Es ilegal"), T("It always loses", "Siempre pierde")],
          0,
          T("Leverage magnifies both directions — but the loan doesn't shrink when you lose.", "El apalancamiento agranda las dos direcciones, pero el préstamo no se achica cuando pierdes."),
          [null, T("It's legal in many forms — just very risky.", "Es legal en muchas formas; solo es muy riesgoso."), T("It can win too. The problem is how much it can lose.", "También puede ganar. El problema es cuánto puede perder.")]
        ),
        tf("risky_bets", T("Gambling-style apps are often designed to keep you playing.", "Las apps tipo apuesta suelen estar diseñadas para que sigas jugando."), true, T("Streaks, near-misses and rewards keep you coming back — the house still wins on average.", "Las rachas, los \"casi gano\" y las recompensas te hacen volver; en promedio, la casa gana.")),
        number("risky_bets", T("You put in {$100|1000} with 5× leverage, so you control {$500|5000}. The price drops 20%. How much of your money is left?", "Pones {$100|1000} con apalancamiento de 5×, así que controlas {$500|5000}. El precio baja 20%. ¿Cuánto de tu dinero queda?"), { unit: "money", answer: 0 }, [T("20% of {$500|5000} is {$100|1000}.", "El 20% de {$500|5000} son {$100|1000}."), T("That's all of your own money: nothing left. With leverage, a small drop can wipe you out.", "Es todo tu dinero: no queda nada. Con apalancamiento, una caída pequeña te puede dejar en cero.")]),
        act("portfolio.diversify", T("Spread your practice money so no single bet can sink it.", "Reparte tu dinero de práctica para que ninguna apuesta sola lo hunda."), {}),
      ],
    },
  ],
};
