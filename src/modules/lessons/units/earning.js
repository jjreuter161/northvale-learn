// UNIT — Earning more. Its lessons and the concepts they teach (format in helpers.js).
import { T, card, choice, tf, act, concept, match, number, scenario, fit, order } from "./helpers.js";

export default {
  id: "earning",
  icon: "star",
  title: T("Earning more", "Ganar más"),
  concepts: [
    concept(
      "side_hustles",
      T("Side hustles", "Ingresos extra"),
      card(T("Skills people pay for", "Habilidades por las que la gente paga"), T("A side hustle is paid work on your own time: tutoring, pet sitting, editing videos, selling things you make. Start with what you're already good at and what people around you need.", "Un ingreso extra es trabajo pagado en tu propio tiempo: dar clases, cuidar mascotas, editar videos, vender cosas que haces. Empieza con lo que ya sabes hacer bien y con lo que necesita la gente a tu alrededor.")),
      tf("side_hustles", T("A good side hustle often starts with a skill you already have.", "Un buen ingreso extra suele empezar con una habilidad que ya tienes."), true, T("It's faster to sell what you can already do well.", "Es más rápido vender lo que ya sabes hacer bien.")),
      choice(
        "side_hustles",
        T("Which is the best first step for a new side hustle?", "¿Cuál es el mejor primer paso para un ingreso extra nuevo?"),
        [T("Try it small with a few customers before spending much", "Probarlo en pequeño con pocos clientes antes de gastar mucho"), T("Buy lots of equipment first", "Comprar mucho equipo primero"), T("Borrow money to look professional", "Pedir prestado para verte profesional")],
        0,
        T("Testing small tells you whether people will pay — before you've spent money you can't get back.", "Probar en pequeño te dice si la gente va a pagar, antes de gastar dinero que no puedes recuperar."),
        [null, T("Equipment before customers risks spending on something nobody buys.", "Comprar equipo antes de tener clientes arriesga gastar en algo que nadie compra."), T("Debt before income turns an experiment into a problem.", "Endeudarte antes de tener ingresos convierte un experimento en un problema.")]
      )
    ),
    concept(
      "freelancing",
      T("Working for yourself", "Trabajar por tu cuenta"),
      card(
        T("You're the business now", "Ahora tú eres el negocio"),
        T("Freelance income usually has no tax withheld. In the US, you owe self-employment tax ({@selfEmploymentTaxRate}) plus income tax, and you must file if you net {@selfEmploymentFilingMin} or more in a year. Many freelancers set aside a share of each payment for taxes.", "En el trabajo independiente normalmente no te retienen impuestos. En EE. UU. debes el impuesto de autoempleo ({@selfEmploymentTaxRate}) más el impuesto sobre la renta, y debes declarar si ganas {@selfEmploymentFilingMin} o más en un año. Muchos independientes apartan una parte de cada pago para impuestos.", {
          en: "Earning on your own means registering with the SAT, issuing invoices (facturas) and paying taxes on it. Small earners can use a simplified regime (RESICO) with low rates. Many freelancers set aside a share of each payment for taxes.",
          es: "Ganar por tu cuenta implica darte de alta en el SAT, emitir facturas y pagar impuestos por eso. Quienes ganan poco pueden usar un régimen simplificado (RESICO) con tasas bajas. Muchos independientes apartan una parte de cada pago para impuestos.",
        })
      ),
      tf("freelancing", T("Freelance pay usually arrives without taxes taken out.", "El pago por trabajo independiente normalmente llega sin impuestos descontados."), true, T("Which is why it's on you to set money aside for them.", "Por eso te toca a ti apartar dinero para pagarlos.")),
      choice(
        "freelancing",
        T("You earn {$1000|15000} freelancing this month. What's a sensible habit?", "Este mes ganas {$1000|15000} por tu cuenta. ¿Qué es un buen hábito?"),
        [T("Set aside part of it for taxes right away", "Apartar de inmediato una parte para impuestos"), T("Spend it all — taxes come out automatically", "Gastarlo todo: los impuestos se descuentan solos"), T("Ignore taxes until someone asks", "Ignorar los impuestos hasta que alguien pregunte")],
        0,
        T("Nobody withholds for you, so saving for taxes as you go avoids a painful bill later.", "Nadie retiene por ti, así que ahorrar para impuestos sobre la marcha evita una cuenta dolorosa después."),
        [null, T("That's true for a regular paycheck, not freelance income.", "Eso aplica a un sueldo normal, no a ingresos por tu cuenta."), T("Unpaid taxes grow with penalties and interest.", "Los impuestos sin pagar crecen con multas e intereses.")]
      )
    ),
    concept(
      "pricing_profit",
      T("Pricing and profit", "Precio y ganancia"),
      card(T("Revenue isn't profit", "Ventas no es ganancia"), T("Revenue is everything customers pay you. Profit is what's left after your costs — materials, fees, transport. Then divide by your hours: that's what you really earn per hour.", "Las ventas son todo lo que te pagan los clientes. La ganancia es lo que queda después de tus costos: materiales, comisiones, transporte. Luego divide entre tus horas: eso es lo que de verdad ganas por hora.")),
      tf("pricing_profit", T("Profit is what's left after your costs.", "La ganancia es lo que queda después de tus costos."), true, T("Revenue minus costs. That's the number that matters.", "Ventas menos costos. Ese es el número que importa.")),
      choice(
        "pricing_profit",
        T("You sell 10 bracelets at {$12|180}. Materials cost {$4|60} each and you spend 5 hours. What's your profit per hour?", "Vendes 10 pulseras a {$12|180}. Los materiales cuestan {$4|60} cada una y trabajas 5 horas. ¿Cuánto ganas por hora?"),
        [T("{$16|240}", "{$16|240}"), T("{$24|360}", "{$24|360}"), T("{$120|1800}", "{$120|1800}")],
        0,
        T("Revenue {$120|1800} − costs {$40|600} = profit {$80|1200}. Over 5 hours, that's {$16|240} an hour.", "Ventas {$120|1800} − costos {$40|600} = ganancia {$80|1200}. En 5 horas, son {$16|240} por hora."),
        [null, T("That's revenue per hour. Take out the {$40|600} in materials first.", "Esas son ventas por hora. Primero resta los {$40|600} de materiales."), T("That's total revenue, not profit per hour.", "Eso es el total de ventas, no la ganancia por hora.")]
      )
    ),
    concept(
      "small_business",
      T("Starting small", "Empezar en pequeño"),
      card(T("Test, then grow", "Prueba y luego crece"), T("Most successful small businesses start tiny: a few customers, low costs, quick changes. Keep business money separate from personal money, keep records, and grow what's working.", "La mayoría de los negocios pequeños que funcionan empiezan diminutos: pocos clientes, costos bajos, cambios rápidos. Mantén el dinero del negocio separado del personal, lleva registros y haz crecer lo que funciona.")),
      tf("small_business", T("Keeping business money separate from personal money makes it easier to see if you're profitable.", "Separar el dinero del negocio del personal hace más fácil ver si estás ganando."), true, T("Mixed money hides whether the business is really making money.", "El dinero mezclado esconde si el negocio de verdad está ganando.")),
      choice(
        "small_business",
        T("Your small business made sales but you're not sure it's profitable. What helps most?", "Tu negocio pequeño vendió, pero no sabes si gana. ¿Qué ayuda más?"),
        [T("Recording every sale and cost", "Registrar cada venta y cada costo"), T("Raising prices without checking", "Subir los precios sin revisar"), T("Spending more on ads", "Gastar más en publicidad")],
        0,
        T("You can't manage what you don't measure. Records show where money comes from and goes.", "No puedes manejar lo que no mides. Los registros muestran de dónde viene y a dónde va el dinero."),
        [null, T("Prices might need to change — but you need the numbers first.", "Quizá haya que cambiar precios, pero primero necesitas los números."), T("More ads before knowing your profit can just lose money faster.", "Más publicidad sin saber tu ganancia puede hacerte perder dinero más rápido.")]
      )
    ),
  ],
  lessons: [
    {
      id: "earning-1",
      title: T("Side hustles", "Ingresos extra"),
      steps: [
        card(T("Ideas that work for teens", "Ideas que funcionan para jóvenes"), T("Tutoring younger students, pet or plant sitting, yard work, editing photos or videos, reselling things you no longer use, making crafts. Check age rules for any platform you use.", "Dar clases a alumnos más chicos, cuidar mascotas o plantas, jardinería, editar fotos o videos, revender cosas que ya no usas, hacer manualidades. Revisa las reglas de edad de cualquier plataforma que uses.")),
        card(T("Time is money — really", "El tiempo es dinero, de verdad"), T("Count all the hours: travel, messages, setup. A job that pays {$30|450} but takes 3 hours pays {$10|150} an hour.", "Cuenta todas las horas: traslados, mensajes, preparación. Un trabajo que paga {$30|450} pero toma 3 horas paga {$10|150} la hora.")),
        choice(
          "side_hustles",
          T("A job pays {$40|600} and takes 2 hours, plus 1 hour of travel. What do you really earn per hour?", "Un trabajo paga {$40|600} y toma 2 horas, más 1 hora de traslado. ¿Cuánto ganas de verdad por hora?"),
          [T("About {$13|200}", "Unos {$13|200}"), T("{$20|300}", "{$20|300}"), T("{$40|600}", "{$40|600}")],
          0,
          T("{$40|600} over 3 real hours is about {$13|200} an hour.", "{$40|600} entre 3 horas reales son unos {$13|200} por hora."),
          [null, T("That leaves out the travel hour.", "Eso deja fuera la hora de traslado."), T("That's the whole payment, not per hour.", "Ese es el pago completo, no por hora.")]
        ),
        order("side_hustles", T("Order these jobs from best to worst real pay per hour.", "Ordena estos trabajos de mejor a peor pago real por hora."), [T("{$30|450} for 1 hour, no travel", "{$30|450} por 1 hora, sin traslado"), T("{$50|750} for 2 hours, plus 1 hour of travel", "{$50|750} por 2 horas, más 1 hora de traslado"), T("{$40|600} for 3 hours, plus 1 hour of travel", "{$40|600} por 3 horas, más 1 hora de traslado")], T("Count every hour it takes: {$30|450}, about {$17|250} and {$10|150} an hour.", "Cuenta cada hora que te toma: {$30|450}, unos {$17|250} y {$10|150} por hora.")),
        number("side_hustles", T("You charge {$15|200} to mow a lawn and do 4 a week for 10 weeks. How much do you earn?", "Cobras {$15|200} por cortar un pasto y haces 4 a la semana durante 10 semanas. ¿Cuánto ganas?", { en: "You charge $200 to wash a car and do 4 a week for 10 weeks. How much do you earn?", es: "Cobras $200 por lavar un coche y lavas 4 a la semana durante 10 semanas. ¿Cuánto ganas?" }), { unit: "money", answer: [600, 8000] }, [T("{$15|200} × 4 a week = {$60|800} a week.", "{$15|200} × 4 a la semana = {$60|800} a la semana."), T("× 10 weeks = {$600|8000}, before any costs like gas or supplies.", "× 10 semanas = {$600|8000}, antes de costos como gasolina o materiales.")]),
        act("goals.hustle", T("Try a side hustle: set your price, cost and hours.", "Prueba un ingreso extra: pon tu precio, costo y horas."), { price: [25, 400], cost: [0, 0], count: 4, hours: 2 }),
      ],
    },
    {
      id: "earning-2",
      title: T("Freelancing basics", "Trabajar por tu cuenta"),
      steps: [
        card(
          T("No one withholds for you", "Nadie retiene por ti"),
          T("Freelance clients usually pay the full amount — no taxes taken out. In the US, you may get a 1099 form, and you owe self-employment tax ({@selfEmploymentTaxRate}) plus income tax. Filing is required once you net {@selfEmploymentFilingMin} or more in a year.", "Los clientes de trabajo independiente normalmente pagan el monto completo, sin retener impuestos. En EE. UU. puedes recibir un formulario 1099, y debes el impuesto de autoempleo ({@selfEmploymentTaxRate}) más el impuesto sobre la renta. Debes declarar si ganas {@selfEmploymentFilingMin} o más en un año.", {
            en: "To charge as a freelancer you register with the SAT and issue facturas (CFDI). Small earners — up to about {@resicoIncomeCap} a year — can use RESICO, a simplified regime with rates of roughly {@resicoRateLow} to {@resicoRateHigh}. Companies that pay you withhold {@resicoWithholding}; the rest you pay yourself.",
            es: "Para cobrar como independiente te das de alta en el SAT y emites facturas (CFDI). Quienes ganan hasta unos {@resicoIncomeCap} al año pueden usar el RESICO, un régimen simplificado con tasas de alrededor de {@resicoRateLow} a {@resicoRateHigh}. Las empresas que te pagan retienen {@resicoWithholding}; el resto lo pagas tú.",
          })
        ),
        card(T("Get paid safely", "Cobra con seguridad"), T("Agree on the work and price in writing, ask for part up front on bigger jobs, and use payment methods that leave a record.", "Acuerda el trabajo y el precio por escrito, pide una parte por adelantado en trabajos grandes y usa formas de pago que dejen registro.")),
        number("freelancing", T("You earn {$1000|10000} freelancing this month. No one withholds tax, so your plan is to set aside 25%. How much is that?", "Ganas {$1000|10000} como independiente este mes. Nadie te retiene impuestos, así que tu plan es apartar el 25%. ¿Cuánto es?"), { unit: "money", answer: [250, 2500] }, [T("25% is a quarter.", "El 25% es una cuarta parte."), T("{$1000|10000} ÷ 4 = {$250|2500}, kept aside until taxes are due.", "{$1000|10000} ÷ 4 = {$250|2500}, guardados hasta que toque pagar impuestos.")]),
        tf("freelancing", T("Agreeing on price and work in writing helps avoid problems with clients.", "Acordar el precio y el trabajo por escrito ayuda a evitar problemas con los clientes."), true, T("A short written agreement settles most disputes before they start.", "Un acuerdo corto por escrito resuelve casi todos los problemas antes de que empiecen.")),
        scenario(
          "freelancing",
          T("A new client wants you to start their website now and pay “when it's done”. What do you do?", "Un cliente nuevo quiere que empieces su página web ya y te pague “cuando esté lista”. ¿Qué haces?"),
          [
            fit(T("Ask for half up front and a short written agreement", "Pedir la mitad por adelantado y un acuerdo corto por escrito"), "good", T("You're protected if they disappear, and you both know what “done” means.", "Estás protegido si desaparecen, y los dos saben qué significa “lista”.")),
            fit(T("Start, but email them the price and dates first", "Empezar, pero mandarles antes por correo el precio y las fechas"), "ok", T("Something in writing helps, though you still carry all the risk.", "Algo por escrito ayuda, aunque todo el riesgo sigue siendo tuyo.")),
            fit(T("Start right away with nothing in writing", "Empezar de inmediato sin nada por escrito"), "poor", T("If they never pay, you have nothing to point to.", "Si nunca pagan, no tienes nada con qué respaldarte.")),
          ],
          T("Agree on the price, the work and the dates before you start, and get part of it up front.", "Acuerden el precio, el trabajo y las fechas antes de empezar, y cobra una parte por adelantado.")
        ),
        act("goals.hustle", T("Set a freelance rate and see the weekly profit — then think about the tax share.", "Pon una tarifa independiente y mira la ganancia semanal; luego piensa en la parte para impuestos."), { price: [40, 600], cost: [5, 60], count: 3, hours: 3 }),
      ],
    },
    {
      id: "earning-3",
      title: T("Pricing and profit", "Precio y ganancia"),
      steps: [
        card(T("Start from your costs", "Empieza por tus costos"), T("Add up what each sale costs you — materials, packaging, shipping, platform fees. Your price has to cover that, plus pay you for your time.", "Suma lo que te cuesta cada venta: materiales, empaque, envío, comisiones de la plataforma. Tu precio debe cubrir eso y además pagarte tu tiempo.")),
        card(T("Then check the market", "Luego revisa el mercado"), T("See what similar things sell for. If your costs are higher than market prices, change the product, lower your costs or find a different customer.", "Mira a cuánto se venden cosas parecidas. Si tus costos son mayores que los precios del mercado, cambia el producto, baja tus costos o busca otro cliente.")),
        choice(
          "pricing_profit",
          T("Each item costs you {$6|90} to make. Which price at least covers costs?", "Cada producto te cuesta {$6|90} hacerlo. ¿Qué precio al menos cubre los costos?"),
          [T("{$10|150}", "{$10|150}"), T("{$5|75}", "{$5|75}"), T("{$6|90}, with nothing for your time", "{$6|90}, sin nada por tu tiempo")],
          0,
          T("{$10|150} covers the {$6|90} cost and leaves {$4|60} for your time.", "{$10|150} cubre el costo de {$6|90} y deja {$4|60} por tu tiempo."),
          [null, T("Below cost, every sale loses money.", "Por debajo del costo, cada venta pierde dinero."), T("Breaking even means working for free.", "Quedar tablas significa trabajar gratis.")]
        ),
        scenario("pricing_profit", T("Your bracelets cost {$2|30} each to make. You sell 25 a month at {$6|90}. A shop offers to sell 100 a month if you charge them {$2.50|38}. What do you do?", "Hacer cada pulsera te cuesta {$2|30}. Vendes 25 al mes a {$6|90}. Una tienda te ofrece vender 100 al mes si se las dejas en {$2.50|38}. ¿Qué haces?"), [fit(T("Keep selling 25 at {$6|90}", "Seguir vendiendo 25 a {$6|90}"), "good", T("{$100|1500} profit a month for the work you already do.", "{$100|1500} de ganancia al mes por el trabajo que ya haces.")), fit(T("Ask the shop for a better price, then compare", "Pedirle a la tienda un mejor precio y luego comparar"), "ok", T("Worth a try; just do the math before you say yes.", "Vale la pena intentarlo; solo haz la cuenta antes de aceptar.")), fit(T("Take the deal: 100 is more than 25", "Aceptar: 100 son más que 25"), "poor", T("Only {$50|800} profit, for four times the work.", "Solo {$50|800} de ganancia, por cuatro veces el trabajo."))], T("More sales only help if each one still leaves a profit.", "Vender más solo ayuda si cada venta todavía deja ganancia.")),
        number("pricing_profit", T("Bracelets: materials cost {$2|30} each and you sell them for {$6|90}. You sell 25. What's your profit?", "Pulseras: los materiales cuestan {$2|30} cada una y las vendes en {$6|90}. Vendes 25. ¿Cuál es tu ganancia?"), { unit: "money", answer: [100, 1500] }, [T("Each one leaves {$6|90} − {$2|30} = {$4|60}.", "Cada una te deja {$6|90} − {$2|30} = {$4|60}."), T("× 25 = {$100|1500} in profit, before counting your time.", "× 25 = {$100|1500} de ganancia, sin contar tu tiempo.")]),
        act("goals.hustle", T("Change your price and costs until the profit per hour is worth your time.", "Cambia tu precio y costos hasta que la ganancia por hora valga tu tiempo."), { price: [12, 180], cost: [4, 60], count: 10, hours: 0.5 }),
      ],
    },
    {
      id: "earning-4",
      title: T("Starting small", "Empezar en pequeño"),
      steps: [
        card(T("Small on purpose", "Pequeño a propósito"), T("Start with what you can do now, with little money. Ask early customers what they'd pay for and what they'd change. Grow only what's working.", "Empieza con lo que puedes hacer ahora, con poco dinero. Pregúntales a tus primeros clientes por qué pagarían y qué cambiarían. Haz crecer solo lo que funciona.")),
        card(T("Keep it organized", "Mantenlo en orden"), T("A separate account (or at least a separate list) for business money, a record of every sale and cost, and a share set aside for taxes. Under 18, you may need an adult to open accounts or sign agreements.", "Una cuenta aparte (o por lo menos una lista aparte) para el dinero del negocio, un registro de cada venta y costo, y una parte apartada para impuestos. Si eres menor de 18, quizá necesites a un adulto para abrir cuentas o firmar acuerdos.")),
        choice(
          "small_business",
          T("Why start a business small?", "¿Por qué empezar un negocio en pequeño?"),
          [T("To learn what customers want before risking much money", "Para aprender qué quieren los clientes antes de arriesgar mucho dinero"), T("Because big businesses aren't allowed", "Porque no se permiten negocios grandes"), T("Small businesses don't pay taxes", "Los negocios pequeños no pagan impuestos")],
          0,
          T("Small, cheap experiments teach you fast and cost little when they fail.", "Los experimentos chicos y baratos te enseñan rápido y cuestan poco cuando fallan."),
          [null, T("Any size is allowed — small is just less risky to start.", "Cualquier tamaño se permite; pequeño es solo menos riesgoso para empezar."), T("Small businesses pay taxes too, sometimes in simplified ways.", "Los negocios pequeños también pagan impuestos, a veces de forma simplificada.")]
        ),
        number("small_business", T("This month: sales {$420|6300}, materials {$150|2250}, ads {$30|450}, app fees {$20|300}. What's your profit?", "Este mes: ventas {$420|6300}, materiales {$150|2250}, anuncios {$30|450}, comisiones de la app {$20|300}. ¿Cuál es tu ganancia?"), { unit: "money", answer: [220, 3300] }, [T("Costs: {$150|2250} + {$30|450} + {$20|300} = {$200|3000}.", "Costos: {$150|2250} + {$30|450} + {$20|300} = {$200|3000}."), T("{$420|6300} − {$200|3000} = {$220|3300}. Without the records, you'd only see the {$420|6300}.", "{$420|6300} − {$200|3000} = {$220|3300}. Sin registros, solo verías los {$420|6300}.")]),
        match(
          "small_business",
          T("Match each habit to why it helps a small business.", "Une cada hábito con por qué le ayuda a un negocio pequeño."),
          [
            [T("A separate account", "Una cuenta aparte"), T("Keeps business money apart from yours", "Separa el dinero del negocio del tuyo")],
            [T("A record of every sale and cost", "Un registro de cada venta y gasto"), T("Shows your real profit", "Muestra tu ganancia real")],
            [T("A share set aside", "Una parte apartada"), T("Covers the taxes you'll owe", "Cubre los impuestos que vas a deber")],
            [T("Asking early customers", "Preguntar a los primeros clientes"), T("Tells you what to change", "Te dice qué cambiar")],
          ],
          T("Small and organized beats big and messy.", "Pequeño y ordenado le gana a grande y desordenado.")
        ),
        act("goals.create", T("Make a goal for a small starting fund for a business idea.", "Crea una meta para un pequeño fondo inicial para una idea de negocio."), { name: T("Business starter fund", "Fondo para mi negocio"), target: [300, 4500], months: 6 }),
      ],
    },
  ],
};
