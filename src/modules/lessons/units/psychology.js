// UNIT — The psychology of money. Its lessons and the concepts they teach (format in helpers.js).
import { T, card, choice, tf, act, concept, order, spot, tap, scenario, fit, match } from "./helpers.js";

export default {
  id: "psychology",
  icon: "bulb",
  title: T("The psychology of money", "La psicología del dinero"),
  concepts: [
    concept(
      "impulse_spending",
      T("Impulse spending", "Compras impulsivas"),
      card(T("Put time between want and buy", "Pon tiempo entre el antojo y la compra"), T("Impulse buys happen in the moment — a sale, a feeling, a scroll. A simple rule helps: wait 24 hours (or a week for bigger things) before buying anything you didn't plan. If you still want it, go ahead.", "Las compras impulsivas pasan en el momento: una oferta, una emoción, una publicación. Una regla sencilla ayuda: espera 24 horas (o una semana para cosas grandes) antes de comprar algo que no planeaste. Si todavía lo quieres, adelante.")),
      tf("impulse_spending", T("Waiting a day before an unplanned purchase helps cut impulse buys.", "Esperar un día antes de una compra no planeada ayuda a reducir las compras impulsivas."), true, T("The urge fades; real wants stay.", "El antojo se pasa; lo que de verdad quieres, se queda.")),
      choice(
        "impulse_spending",
        T("Which setup makes impulse spending harder?", "¿Qué hace más difícil comprar por impulso?"),
        [T("Removing saved cards from shopping apps and turning off sale notifications", "Quitar las tarjetas guardadas de las apps de compras y apagar las notificaciones de ofertas"), T("One-click checkout on every site", "Comprar con un clic en todos los sitios"), T("Following more shops on social media", "Seguir a más tiendas en redes sociales")],
        0,
        T("A little friction — typing your card, fewer nudges — gives your plan time to win.", "Un poco de fricción —escribir tu tarjeta, menos avisos— le da tiempo a tu plan para ganar."),
        [null, T("One click removes the pause where you'd think twice.", "Un clic elimina la pausa donde lo pensarías dos veces."), T("More shops in your feed means more prompts to buy.", "Más tiendas en tu feed significan más invitaciones a comprar.")]
      )
    ),
    concept(
      "fomo",
      T("FOMO and pressure tactics", "FOMO y tácticas de presión"),
      card(T("The fear of missing out", "El miedo a quedarte fuera"), T("FOMO is the feeling that everyone else is getting something you'll miss. Ads use it with countdowns, \"only 2 left\" and \"everyone's buying.\" Naming the tactic takes away much of its power.", "El FOMO es la sensación de que todos están consiguiendo algo que te vas a perder. Los anuncios lo usan con cuentas regresivas, \"solo quedan 2\" y \"todos lo están comprando\". Ponerle nombre a la táctica le quita mucha de su fuerza.")),
      tf("fomo", T("A countdown timer in an ad is designed to make you decide faster.", "Una cuenta regresiva en un anuncio está hecha para que decidas más rápido."), true, T("Less time to think usually means more buying.", "Menos tiempo para pensar suele significar más compras.")),
      choice(
        "fomo",
        T("Your friends all bought a new game, and a \"48-hour sale\" ends tonight. What's a calm way to decide?", "Todos tus amigos compraron un juego nuevo y una \"oferta de 48 horas\" termina hoy. ¿Cómo decidir con calma?"),
        [T("Check it against your budget and goals, as if there were no deadline", "Compararlo con tu presupuesto y tus metas, como si no hubiera fecha límite"), T("Buy now so you're not left out", "Comprarlo ya para no quedarte fuera"), T("Buy two in case it runs out", "Comprar dos por si se acaba")],
        0,
        T("If it fits your plan at full price, the sale is a bonus. If it doesn't, the deadline isn't a reason.", "Si cabe en tu plan a precio completo, la oferta es un extra. Si no, la fecha límite no es razón."),
        [null, T("That's FOMO deciding for you.", "Eso es el FOMO decidiendo por ti."), T("Scarcity pressure works best when you don't notice it — like here.", "La presión de escasez funciona mejor cuando no la notas, como aquí.")]
      )
    ),
    concept(
      "loss_aversion",
      T("Loss aversion", "Aversión a las pérdidas"),
      card(T("Losses feel bigger than gains", "Las pérdidas pesan más que las ganancias"), T("Research finds that losing {$100|1500} feels much worse than winning {$100|1500} feels good. That's why people panic-sell after drops, or hold on to a bad choice to avoid admitting a loss. Knowing the bias helps you stick to a plan.", "Las investigaciones encuentran que perder {$100|1500} se siente mucho peor de lo bien que se siente ganar {$100|1500}. Por eso la gente vende por pánico después de una caída o se aferra a una mala decisión para no aceptar la pérdida. Conocer este sesgo te ayuda a seguir tu plan.")),
      tf("loss_aversion", T("For most people, a loss feels stronger than a gain of the same size.", "Para la mayoría de la gente, una pérdida se siente más fuerte que una ganancia del mismo tamaño."), true, T("That imbalance pushes people into rushed decisions after a drop.", "Ese desequilibrio empuja a decisiones apresuradas después de una caída.")),
      choice(
        "loss_aversion",
        T("Your practice fund is down 10% this month. Loss aversion pushes you to…", "Tu fondo de práctica bajó 10% este mes. La aversión a las pérdidas te empuja a…"),
        [T("Sell to stop the pain — even if your plan says to wait", "Vender para que deje de doler, aunque tu plan diga esperar"), T("Calmly check your plan", "Revisar tu plan con calma"), T("Ignore all information forever", "Ignorar toda la información para siempre")],
        0,
        T("The urge to escape a loss is the bias at work. Checking your plan is how you answer it.", "Las ganas de escapar de la pérdida son el sesgo trabajando. Revisar tu plan es como le respondes."),
        [null, T("That's the healthy response — the bias pushes the other way.", "Esa es la respuesta sana; el sesgo empuja hacia el otro lado."), T("Ignoring everything isn't the bias — it's avoidance. The bias pushes you to act fast.", "Ignorarlo todo no es el sesgo, es evitarlo. El sesgo te empuja a actuar rápido.")]
      )
    ),
    concept(
      "consistency",
      T("Consistency beats timing", "La constancia le gana al timing"),
      card(T("The boring strategy that works", "La estrategia aburrida que sí funciona"), T("Nobody reliably predicts the best day to buy or sell. Missing just a few of the market's best days can shrink long-term returns a lot — and those days often come right after the worst ones. Investing steadily keeps you in for them.", "Nadie predice de forma confiable el mejor día para comprar o vender. Perderse unos pocos de los mejores días del mercado puede reducir mucho los rendimientos a largo plazo, y esos días suelen llegar justo después de los peores. Invertir con constancia te mantiene dentro.")),
      tf("consistency", T("Even professionals can't reliably predict the market's best days.", "Ni los profesionales pueden predecir de forma confiable los mejores días del mercado."), true, T("Which is why a steady plan often beats trying to time it.", "Por eso un plan constante suele ganarle a intentar adivinar el momento.")),
      choice(
        "consistency",
        T("Why can trying to time the market backfire?", "¿Por qué intentar adivinar el momento del mercado puede salir mal?"),
        [T("The best days often come right after the worst, so jumping out can mean missing them", "Los mejores días suelen llegar justo después de los peores, así que salirte puede hacer que te los pierdas"), T("The market is closed on good days", "El mercado cierra los días buenos"), T("Timing is illegal", "Intentarlo es ilegal")],
        0,
        T("Selling after a drop and waiting for calm often means missing the rebound.", "Vender después de una caída y esperar a que se calme suele hacer que te pierdas la recuperación."),
        [null, T("Markets are open on good days — the problem is knowing which days those will be.", "El mercado abre los días buenos; el problema es saber cuáles serán."), T("It's legal — just very hard to do well.", "Es legal; solo es muy difícil hacerlo bien.")]
      )
    ),
  ],
  lessons: [
    {
      id: "psychology-1",
      title: T("Impulse spending", "Compras impulsivas"),
      steps: [
        card(T("Why we buy on impulse", "Por qué compramos por impulso"), T("Stress, boredom, a sale or a perfect ad can trigger a buy that feels great for a minute. Apps make it easy: saved cards, one-tap checkout, endless feeds.", "El estrés, el aburrimiento, una oferta o un anuncio perfecto pueden provocar una compra que se siente genial un minuto. Las apps lo facilitan: tarjetas guardadas, pagar con un toque, feeds sin fin.")),
        card(T("Add a pause", "Agrega una pausa"), T("Try the 24-hour rule, a wishlist instead of a cart, or a monthly \"fun money\" amount. When it's gone, the wishlist waits until next month.", "Prueba la regla de 24 horas, una lista de deseos en lugar de un carrito, o un monto mensual de \"dinero para gustos\". Cuando se acaba, la lista espera al siguiente mes.")),
        choice(
          "impulse_spending",
          T("What's the 24-hour rule?", "¿Qué es la regla de las 24 horas?"),
          [T("Wait a day before buying something you didn't plan", "Esperar un día antes de comprar algo que no planeaste"), T("Buy anything within 24 hours of seeing it", "Comprar cualquier cosa en las 24 horas después de verla"), T("Return everything after a day", "Devolver todo después de un día")],
          0,
          T("A day is often enough for the impulse to pass.", "Un día suele bastar para que el impulso pase."),
          [null, T("That's the opposite — the rule adds a pause.", "Es lo contrario: la regla agrega una pausa."), T("It's about deciding before you buy, not returning after.", "Se trata de decidir antes de comprar, no de devolver después.")]
        ),
        tf("impulse_spending", T("Feeling stressed or bored can make impulse buys more likely.", "Sentirte estresado o aburrido puede hacer más probables las compras impulsivas."), true, T("Spending can feel like a quick fix for a mood.", "Gastar puede sentirse como un arreglo rápido para el ánimo.")),
        scenario(
          "impulse_spending",
          T("Sneakers you love are {$90|1350}, “today only”. Your plan has {$40|600} for wants this week. What do you do?", "Unos tenis que te encantan cuestan {$90|1350}, “solo hoy”. Tu plan tiene {$40|600} para gustos esta semana. ¿Qué haces?"),
          [
            fit(T("Wait a day and see if you still want them", "Esperar un día y ver si todavía los quieres"), "good", T("A pause lets the rush fade. “Today only” sales come back more often than they say.", "Una pausa deja que pase el impulso. Las ofertas de “solo hoy” vuelven más seguido de lo que dicen.")),
            fit(T("Buy them and skip wants for the next two weeks", "Comprarlos y no gastar en gustos las próximas dos semanas"), "ok", T("It fits the plan if you really stick to it.", "Cabe en el plan si de verdad lo cumples.")),
            fit(T("Put them on a card and figure it out later", "Pagarlos con tarjeta y ver después"), "poor", T("Later usually means interest, and next week's plan already spent.", "Después suele significar intereses y el plan de la próxima semana ya gastado.")),
          ],
          T("Impulse buys are about the feeling of now. A pause gives the plan a chance.", "Las compras por impulso son por la emoción del momento. Una pausa le da una oportunidad al plan.")
        ),
        act("goals.leak", T("See what one small impulse habit does to your goal.", "Mira qué le hace a tu meta un pequeño hábito impulsivo."), { leak: [8, 120], perWeek: 2 }),
      ],
    },
    {
      id: "psychology-2",
      title: T("FOMO", "FOMO: miedo a quedarte fuera"),
      steps: [
        card(T("Everyone else seems to have it", "Parece que todos lo tienen"), T("Social media shows highlights: new phones, trips, wins. It can make normal spending feel like falling behind. Remember that you see what people post, not their bills.", "Las redes muestran lo mejor de cada quien: celulares nuevos, viajes, logros. Eso puede hacer que gastar normal se sienta como quedarse atrás. Recuerda que ves lo que la gente publica, no sus cuentas por pagar.")),
        card(T("Spot the tactics", "Detecta las tácticas"), T("Countdowns, \"only 2 left\", \"everyone's buying\", limited drops. They're designed to speed you up. When you notice one, slow down on purpose.", "Cuentas regresivas, \"solo quedan 2\", \"todos lo están comprando\", lanzamientos limitados. Están hechas para apresurarte. Cuando notes una, ve más despacio a propósito.")),
        match("fomo", T("Match each line to the pressure trick behind it.", "Une cada frase con el truco de presión que usa."), [[T("“Only 3 left!”", "“¡Solo quedan 3!”"), T("Scarcity", "Escasez")], [T("“Sale ends at midnight”", "“La oferta termina a medianoche”"), T("A deadline", "Una fecha límite")], [T("“Everyone's buying it”", "“Todos lo están comprando”"), T("Social proof", "Prueba social")], [T("“Was {$80|1200}, now {$40|600}”", "“Antes {$80|1200}, ahora {$40|600}”"), T("Anchoring you to a higher price", "Anclarte a un precio más alto")]], T("Naming the trick takes away most of its power.", "Ponerle nombre al truco le quita casi todo su poder.")),
        tf("fomo", T("Social media shows a realistic picture of what people spend.", "Las redes sociales muestran una imagen realista de lo que la gente gasta."), false, T("You see the highlights, not the debts or the trade-offs.", "Ves lo mejor, no las deudas ni lo que sacrificaron.")),
        spot(
          "fomo",
          T("This ad wants you to hurry. Tap the 2 pressure tactics.", "Este anuncio quiere que te apures. Toca las 2 tácticas de presión."),
          "offer",
          T("Ad · SneakerDrop", "Anuncio · SneakerDrop"),
          [
            T("The shoes everyone's wearing this season. ", "Los tenis que todos traen esta temporada. "),
            tap(T("Only 2 left in your size!", "¡Solo quedan 2 en tu talla!"), true),
            T(" · ", " · "),
            tap(T("Sale ends in 09:59", "La oferta termina en 09:59"), true),
            T(" · ", " · "),
            tap(T("Free returns within 30 days", "Devolución gratis en 30 días")),
            T(" · ", " · "),
            tap(T("Size guide", "Guía de tallas")),
          ],
          T("Scarcity and a ticking clock are there to rush you. Free returns and a size guide are just useful information.", "La escasez y un reloj corriendo están para apresurarte. La devolución gratis y la guía de tallas son solo información útil.")
        ),
        act("goals.scam", T("Find the pressure tactics in this ad.", "Encuentra las tácticas de presión en este anuncio."), { set: "fomo" }),
      ],
    },
    {
      id: "psychology-3",
      title: T("Loss aversion", "Aversión a las pérdidas"),
      steps: [
        card(T("Why drops feel so bad", "Por qué las caídas se sienten tan mal"), T("Studies of decision-making find that losses hit us about twice as hard as equal gains. It's human — and it makes people sell at the worst moments.", "Los estudios sobre cómo decidimos encuentran que las pérdidas nos pegan como el doble que las ganancias del mismo tamaño. Es humano, y hace que la gente venda en los peores momentos.")),
        card(T("Decide before you feel it", "Decide antes de sentirlo"), T("Write your plan when things are calm: what you're investing for, for how long, and what you'll do in a drop. Then follow the plan, not the feeling.", "Escribe tu plan cuando todo esté tranquilo: para qué inviertes, por cuánto tiempo y qué harás en una caída. Luego sigue el plan, no la emoción.")),
        choice(
          "loss_aversion",
          T("What's a good defense against loss aversion?", "¿Qué es una buena defensa contra la aversión a las pérdidas?"),
          [T("A plan written in advance for what you'll do in a drop", "Un plan escrito de antemano de lo que harás en una caída"), T("Checking prices every few minutes", "Revisar los precios cada pocos minutos"), T("Following whatever feels right that day", "Seguir lo que se sienta bien ese día")],
          0,
          T("Decisions made in calm moments hold up better under stress.", "Las decisiones tomadas con calma aguantan mejor bajo estrés."),
          [null, T("Watching every move makes losses feel bigger and more frequent.", "Ver cada movimiento hace que las pérdidas se sientan más grandes y frecuentes."), T("Feelings are exactly what the bias distorts.", "Las emociones son justo lo que el sesgo distorsiona.")]
        ),
        tf("loss_aversion", T("Loss aversion can make people sell after a drop instead of sticking to their plan.", "La aversión a las pérdidas puede hacer que la gente venda después de una caída en vez de seguir su plan."), true, T("Escaping the feeling of loss can feel more urgent than the long-term goal.", "Escapar de la sensación de pérdida puede sentirse más urgente que la meta de largo plazo.")),
        scenario(
          "loss_aversion",
          T("Your practice investment is down 15% this month. What do you do?", "Tu inversión de práctica bajó 15% este mes. ¿Qué haces?"),
          [
            fit(T("Stick to the plan you made before the drop", "Seguir el plan que hiciste antes de la caída"), "good", T("You decided calmly; a drop is exactly when that plan helps.", "Lo decidiste con calma; una caída es justo cuando ese plan ayuda.")),
            fit(T("Check it less often for a while", "Revisarla menos seguido por un tiempo"), "ok", T("Fewer looks, less pain, and fewer rushed decisions.", "Menos vistazos, menos angustia y menos decisiones apresuradas.")),
            fit(T("Sell everything so it stops hurting", "Vender todo para que deje de doler"), "poor", T("That turns a drop on paper into a real loss, often right before a recovery.", "Eso convierte una caída en papel en una pérdida real, a veces justo antes de una recuperación.")),
          ],
          T("Losses feel about twice as bad as gains feel good. Deciding ahead of time protects you from that feeling.", "Las pérdidas se sienten como el doble de mal de lo bien que se sienten las ganancias. Decidir con anticipación te protege de esa sensación.")
        ),
        act("portfolio.chart", T("Read a real chart with ups and downs, and notice how the drops feel.", "Lee una gráfica real con subidas y bajadas, y nota cómo se sienten las caídas.")),
      ],
    },
    {
      id: "psychology-4",
      title: T("Consistency beats timing", "La constancia le gana al timing"),
      steps: [
        card(T("Nobody knows the best day", "Nadie sabe cuál es el mejor día"), T("Trying to sell before drops and buy before rises sounds smart. In practice, almost no one does it reliably — and the best and worst days tend to come close together.", "Intentar vender antes de las caídas y comprar antes de las subidas suena inteligente. En la práctica, casi nadie lo logra de forma constante, y los mejores y peores días suelen llegar muy juntos.")),
        card(T("Same amount, same schedule", "Mismo monto, mismo calendario"), T("Investing a set amount on a schedule takes the guessing out. Over long periods, staying invested has mattered more than picking the moment — though nothing is guaranteed.", "Invertir un monto fijo con un calendario quita las adivinanzas. En periodos largos, quedarse invertido ha importado más que elegir el momento, aunque nada está garantizado.")),
        choice(
          "consistency",
          T("Which habit is most likely to help over many years?", "¿Qué hábito tiene más probabilidades de ayudar a lo largo de muchos años?"),
          [T("Investing a set amount regularly and staying in", "Invertir un monto fijo con regularidad y quedarse"), T("Moving everything in and out based on headlines", "Meter y sacar todo según los titulares"), T("Waiting for the perfect moment to start", "Esperar el momento perfecto para empezar")],
          0,
          T("A steady habit keeps you invested through the days that matter most.", "Un hábito constante te mantiene invertido en los días que más importan."),
          [null, T("By the time news reaches you, prices have usually moved.", "Cuando la noticia te llega, los precios casi siempre ya se movieron."), T("Waiting for perfect often means not starting — and losing years of compounding.", "Esperar lo perfecto suele significar no empezar, y perder años de interés compuesto.")]
        ),
        tf("consistency", T("Staying invested through ups and downs has historically mattered more than picking the perfect moment.", "Quedarse invertido en las subidas y bajadas históricamente ha importado más que elegir el momento perfecto."), true, T("History isn't a promise, but it's a strong pattern.", "La historia no es una promesa, pero es un patrón fuerte.")),
        order("consistency", T("Put the steps of investing on a schedule in order.", "Ordena los pasos para invertir con calendario."), [T("Pick an amount you can keep up", "Elige una cantidad que puedas mantener"), T("Pick a day, like payday", "Elige un día, como el de pago"), T("Make it automatic", "Hazlo automático"), T("Check in a few times a year, not every day", "Revisa unas cuantas veces al año, no a diario")], T("Decide once, automate it, then let time do the work.", "Decide una vez, automatízalo y deja que el tiempo haga el trabajo.")),
        act("goals.invest", T("See where a steady monthly amount could go — in good years and bad.", "Mira a dónde podría llegar un monto mensual constante, en años buenos y malos."), { monthly: [50, 750], years: 10 }),
      ],
    },
  ],
};
