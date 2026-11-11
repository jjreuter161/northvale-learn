// UNIT — Risk & diversification. Its lessons and the concepts they teach (format in helpers.js).
import { T, card, choice, tf, act, concept, order, number, scenario, fit } from "./helpers.js";

export default {
  id: "risk",
  icon: "scale",
  title: T("Risk & diversification", "Riesgo y diversificación"),
  concepts: [
    concept(
      "risk_reward",
      T("Risk and reward", "Riesgo y rendimiento"),
      card(T("Higher return, higher risk", "Más rendimiento, más riesgo"), T("Investments that can earn more can also lose more. Anyone promising high returns with no risk is either mistaken or running a scam. A safe account pays little because it almost never loses.", "Las inversiones que pueden ganar más también pueden perder más. Quien promete altos rendimientos sin riesgo está equivocado o es un fraude. Una cuenta segura paga poco porque casi nunca pierde.")),
      tf("risk_reward", T("Higher possible returns usually come with higher risk.", "Rendimientos posibles más altos suelen venir con más riesgo."), true, T("There's no free lunch: the chance to earn more comes with the chance to lose more.", "Nada es gratis: la posibilidad de ganar más viene con la posibilidad de perder más.")),
      choice(
        "risk_reward",
        T("Which is the biggest warning sign of an investment scam?", "¿Cuál es la señal de alerta más grande de un fraude de inversión?"),
        [T("A guaranteed high return with no risk", "Un rendimiento alto garantizado y sin riesgo"), T("A fund that publishes its fees", "Un fondo que publica sus comisiones"), T("Deposits insured by the government", "Depósitos asegurados por el gobierno", { en: "Deposits protected by IPAB", es: "Depósitos protegidos por el IPAB" })],
        0,
        T("Real investments can't guarantee high returns. \"Guaranteed\" plus \"high\" plus \"no risk\" is the classic scam pitch.", "Las inversiones reales no pueden garantizar rendimientos altos. \"Garantizado\" más \"alto\" más \"sin riesgo\" es la promesa clásica de un fraude."),
        [null, T("Publishing fees is a good sign — honest investments are clear about costs.", "Publicar las comisiones es buena señal: las inversiones honestas son claras con sus costos."), T("Deposit protection is real and useful, not a warning sign.", "La protección de depósitos es real y útil, no una señal de alerta.")]
      )
    ),
    concept(
      "diversification",
      T("Diversification", "Diversificación"),
      card(T("Don't let one thing sink you", "Que una sola cosa no te hunda"), T("If all your money is in one company and it fails, you lose a lot. Spread across hundreds of companies, one failure barely matters. Diversifying lowers the risk of a big loss from any single investment — it can't remove all risk.", "Si todo tu dinero está en una empresa y quiebra, pierdes mucho. Repartido entre cientos de empresas, que una falle casi no se nota. Diversificar baja el riesgo de una gran pérdida por una sola inversión; no elimina todo el riesgo.")),
      tf("diversification", T("Owning many different investments spreads out your risk.", "Tener muchas inversiones distintas reparte tu riesgo."), true, T("When one falls, the others don't have to fall with it.", "Cuando una cae, las demás no tienen por qué caer con ella.")),
      choice(
        "diversification",
        T("Which pair is least diversified?", "¿Qué par está menos diversificado?"),
        [T("Two funds that hold the same 500 large US companies", "Dos fondos con las mismas 500 grandes empresas de EE. UU."), T("A US stock fund and an international stock fund", "Un fondo de acciones de EE. UU. y uno de acciones internacionales"), T("A stock fund and a bond fund", "Un fondo de acciones y uno de bonos")],
        0,
        T("Two funds holding the same companies are basically one investment twice. Different regions or kinds of investments spread risk more.", "Dos fondos con las mismas empresas son, en el fondo, una sola inversión dos veces. Distintas regiones o tipos de inversión reparten más el riesgo."),
        [null, T("US and international stocks don't always move together, so the pair spreads risk.", "Las acciones de EE. UU. y las internacionales no siempre se mueven juntas, así que el par reparte riesgo."), T("Stocks and bonds often behave differently — that's diversification.", "Las acciones y los bonos suelen comportarse distinto: eso es diversificar.")]
      )
    ),
    concept(
      "stock_picking",
      T("Picking single stocks", "Elegir acciones individuales"),
      card(T("Great company ≠ great investment", "Gran empresa ≠ gran inversión"), T("A company can be excellent and its stock still be a poor buy if the price already assumes great things. Even full-time professionals often get it wrong. That's why many people keep single stocks to a small part of what they invest.", "Una empresa puede ser excelente y su acción aun así ser mala compra si el precio ya da por hecho cosas increíbles. Hasta los profesionales de tiempo completo se equivocan seguido. Por eso mucha gente deja las acciones individuales como una parte pequeña de lo que invierte.")),
      tf("stock_picking", T("Liking a company's products is not enough reason to invest heavily in its stock.", "Que te gusten los productos de una empresa no es razón suficiente para invertir mucho en su acción."), true, T("A great product doesn't tell you whether the stock's price is a good deal.", "Un gran producto no te dice si el precio de la acción conviene.")),
      choice(
        "stock_picking",
        T("Why can a great company be a bad investment?", "¿Por qué una gran empresa puede ser una mala inversión?"),
        [T("Its price may already reflect how great it is", "Su precio puede reflejar ya lo buena que es"), T("Great companies never grow", "Las grandes empresas nunca crecen"), T("Their stock can't be bought", "Sus acciones no se pueden comprar")],
        0,
        T("If everyone already knows it's great, the price is high. To profit, it has to do even better than people expect.", "Si todos saben que es buena, el precio ya está alto. Para ganar, tiene que irle todavía mejor de lo que la gente espera."),
        [null, T("Great companies can grow a lot — the question is what you pay for that growth.", "Las grandes empresas pueden crecer mucho; la pregunta es cuánto pagas por ese crecimiento."), T("Anyone can buy them. The issue is the price.", "Cualquiera puede comprarlas. El problema es el precio.")]
      )
    ),
  ],
  lessons: [
    {
      id: "risk-1",
      title: T("Risk and reward", "Riesgo y recompensa"),
      steps: [
        card(T("No free lunch", "Nadie regala nada"), T("Investments that can grow more can also drop more. Safe ones (like T-bills) barely move; stocks can jump or fall a lot. Higher possible reward comes with higher risk.", "Las inversiones que pueden crecer más también pueden caer más. Las seguras (como los T-bills) casi no se mueven; las acciones pueden subir o bajar mucho. Más recompensa posible viene con más riesgo.", { en: "Investments that can grow more can also drop more. Safe ones (like CETES) barely move; stocks can jump or fall a lot. Higher possible reward comes with higher risk.", es: "Las inversiones que pueden crecer más también pueden caer más. Las seguras (como los CETES) casi no se mueven; las acciones pueden subir o bajar mucho. Más recompensa posible viene con más riesgo." })),
        card(T("Time changes risk", "El tiempo cambia el riesgo"), T("Over one year, stocks can lose a lot. Over 20 years, they've historically done much better than cash — but there are no guarantees.", "En un año, las acciones pueden perder mucho. En 20 años, históricamente les ha ido mucho mejor que al efectivo, pero no hay garantías.")),
        choice(
          "risk_reward",
          T("Someone promises 30% a month with \"no risk.\" That's most likely…", "Alguien te promete 30% al mes \"sin riesgo\". Lo más probable es que sea…"),
          [T("A great deal", "Una gran oportunidad"), T("A scam", "Una estafa"), T("A savings account", "Una cuenta de ahorro")],
          1,
          T("High return + no risk = a red flag. Real investments don't work that way.", "Mucha ganancia + cero riesgo = foco rojo. Las inversiones reales no funcionan así."),
          [T("Real investments can't promise 30% a month with no risk. That pitch is a classic scam.", "Ninguna inversión real puede prometer 30% al mes sin riesgo. Esa promesa es un fraude clásico."), null, T("Savings accounts pay a few percent a year, not 30% a month.", "Las cuentas de ahorro pagan unos cuantos puntos al año, no 30% al mes.")]
        ),
        tf("risk_reward", T("A higher possible return usually means higher risk.", "Una ganancia posible más alta normalmente significa más riesgo."), true, T("That's the trade-off at the heart of investing.", "Ese es el intercambio que está en el centro de invertir.")),
        order("risk_reward", T("Order these from safest to riskiest.", "Ordena del más seguro al más riesgoso."), [T("An insured savings account", "Una cuenta de ahorro asegurada", { en: "A savings account protected by IPAB", es: "Una cuenta de ahorro protegida por el IPAB" }), T("Treasury bills", "Letras del Tesoro", { en: "CETES", es: "CETES" }), T("A fund of the whole stock market", "Un fondo de todo el mercado de acciones"), T("One company's stock", "La acción de una sola empresa"), T("A brand-new cryptocurrency", "Una criptomoneda recién creada")], T("More possible reward comes with more possible loss. Safe things grow slowly; risky ones can grow fast or vanish.", "Más ganancia posible viene con más pérdida posible. Lo seguro crece despacio; lo riesgoso puede crecer rápido o desaparecer.")),
        act("goals.invest", T("Compare the safe path and the stock-market path for a 5-year goal.", "Compara el camino seguro y el de la bolsa para una meta a 5 años."), {monthly: [100,1500],years: 5,compareSafe: true}),
      ],
    },
    {
      id: "risk-2",
      title: T("Don't put all your eggs in one basket", "No pongas todos los huevos en una canasta"),
      steps: [
        card(T("Diversification", "Diversificación"), T("Spreading money across many different investments means one bad one can't sink you. Different kinds — companies, countries, bonds — tend to have bad years at different times.", "Repartir tu dinero en muchas inversiones distintas hace que una mala no te hunda. Los distintos tipos —empresas, países, bonos— suelen tener años malos en momentos diferentes.")),
        order("diversification", T("Order these from least to most diversified.", "Ordena del menos al más diversificado."), [T("All in one company you love", "Todo en una empresa que te encanta"), T("Three tech companies", "Tres empresas de tecnología"), T("A fund of the whole stock market", "Un fondo de todo el mercado de acciones"), T("A whole-market fund + an international fund + a bond fund", "Un fondo de todo el mercado + uno internacional + uno de bonos")], T("More companies, more industries, more countries and more kinds of investment each spread the risk further.", "Más empresas, más sectores, más países y más tipos de inversión reparten cada vez más el riesgo.")),
        card(T("Know what you own", "Conoce lo que tienes"), T("Owning five funds that all hold the same big companies isn't real variety. Check what's inside.", "Tener cinco fondos que tienen las mismas grandes empresas no es variedad de verdad. Revisa qué hay adentro.")),
        tf("diversification", T("Diversification can remove all risk.", "Diversificar puede eliminar todo el riesgo."), false, T("It lowers the risk of one investment ruining you, but the whole market can still fall.", "Reduce el riesgo de que una sola inversión te arruine, pero todo el mercado puede caer igual.")),
        scenario(
          "diversification",
          T("A friend owns four stocks, all video game companies. What would spread their risk best?", "Un amigo tiene cuatro acciones, todas de empresas de videojuegos. ¿Qué repartiría mejor su riesgo?"),
          [
            fit(T("Moving part of it into a whole-market fund", "Pasar una parte a un fondo de todo el mercado"), "good", T("Hundreds of companies in many industries, so one bad year for games hurts less.", "Cientos de empresas de muchas industrias, así un mal año para los videojuegos duele menos.")),
            fit(T("Adding a few companies from other industries", "Agregar algunas empresas de otras industrias"), "ok", T("A real improvement, though still a small basket.", "Mejora de verdad, aunque sigue siendo una canasta pequeña.")),
            fit(T("Adding a fifth video game company", "Agregar una quinta empresa de videojuegos"), "poor", T("More companies, same risk: one bad year for games hits all five.", "Más empresas, el mismo riesgo: un mal año para los videojuegos les pega a las cinco.")),
          ],
          T("Diversifying means owning things that don't all fall for the same reason.", "Diversificar es tener cosas que no caen todas por la misma razón.")
        ),
        act("portfolio.diversify", T("Get at least 3 different investments in your practice portfolio.", "Ten al menos 3 inversiones distintas en tu portafolio de práctica."), {min: 3}),
      ],
    },
    {
      id: "risk-3",
      title: T("Picking stocks is hard", "Escoger acciones es difícil"),
      steps: [
        card(T("Why it's hard", "Por qué es difícil"), T("When you buy a single stock, someone is selling it to you — often a professional with more information. Even experts pick losers all the time.", "Cuando compras una acción, alguien te la está vendiendo, muchas veces un profesional con más información. Hasta los expertos escogen perdedoras todo el tiempo.")),
        card(T("Keep it small", "Que sea poquito"), T("If you want to own a few companies for fun or to learn, many people keep it to a small slice — like 5–10% — and keep the rest in broad funds.", "Si quieres tener algunas empresas para aprender o por gusto, mucha gente lo limita a una parte pequeña —como 5 a 10%— y deja el resto en fondos amplios.")),
        choice(
          "stock_picking",
          T("You love a brand. Is that enough reason to put most of your money in its stock?", "Te encanta una marca. ¿Es suficiente razón para poner casi todo tu dinero en su acción?"),
          [T("Yes, I know it's good", "Sí, sé que es buena"), T("No — a great product doesn't mean a great investment at any price", "No: un gran producto no significa una gran inversión a cualquier precio")],
          1,
          T("Loving a product is a start for research, not a full plan. Price and risk matter too.", "Que te guste un producto es un punto de partida para investigar, no un plan completo. El precio y el riesgo también importan."),
          [T("Loving the product doesn't tell you if the stock's price is a good deal — or protect you if it falls.", "Que te encante el producto no te dice si el precio de la acción conviene, ni te protege si cae."), null]
        ),
        tf("stock_picking", T("In this app you're unlocking individual stocks. Real stock trading usually needs an adult's help until you're 18.", "En esta app desbloqueas acciones individuales. En la vida real, comprar acciones normalmente requiere ayuda de un adulto hasta que tengas 18."), true, T("In real life, under-18s usually invest through an account an adult opens for them (a custodial account).", "En la vida real, los menores de 18 normalmente invierten con una cuenta que abre un adulto por ellos.")),
        number("stock_picking", T("You put {$1000|10000} into one stock. It falls 50%, then rises 50%. How much do you have now?", "Pones {$1000|10000} en una acción. Baja 50% y luego sube 50%. ¿Cuánto tienes ahora?"), { unit: "money", answer: [750, 7500] }, [T("After the fall: {$500|5000}.", "Después de la caída: {$500|5000}."), T("50% of {$500|5000} is {$250|2500}, so {$750|7500}. The rise is figured on a smaller amount.", "El 50% de {$500|5000} son {$250|2500}, así que {$750|7500}. La subida se calcula sobre una cantidad menor.")]),
        act("portfolio.buy", T("Stocks are unlocked! Practice: buy a small slice of one company — under 10% of your portfolio.", "¡Acciones desbloqueadas! Práctica: compra una parte pequeña de una empresa, menos del 10% de tu portafolio."), {type: "stock",maxShare: 0.1}),
      ],
    },
  ],
};
