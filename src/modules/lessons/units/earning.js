// UNIT — Earning more. Its lessons and the concepts they teach (format in helpers.js).
import { T, card, choice, tf, act, concept } from "./helpers.js";

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
        tf("side_hustles", T("Travel and setup time count when you work out what a job really pays.", "El traslado y la preparación cuentan al calcular lo que de verdad paga un trabajo."), true, T("They're hours you can't spend on anything else.", "Son horas que no puedes usar en otra cosa.")),
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
        choice(
          "freelancing",
          T("What's different about freelance pay compared with a regular paycheck?", "¿Qué tiene de distinto el pago por trabajo independiente comparado con un sueldo normal?"),
          [T("Taxes usually aren't withheld, so you set money aside yourself", "Normalmente no te retienen impuestos, así que tú apartas el dinero"), T("It's tax-free", "No paga impuestos"), T("It's always paid weekly", "Siempre se paga cada semana")],
          0,
          T("You're responsible for paying the taxes on it.", "Tú eres responsable de pagar sus impuestos."),
          [null, T("Freelance income is taxed — it just isn't withheld for you.", "El ingreso independiente sí paga impuestos; solo que nadie los retiene por ti."), T("Timing depends on your agreement with each client.", "La frecuencia depende de lo que acuerdes con cada cliente.")]
        ),
        tf("freelancing", T("Agreeing on price and work in writing helps avoid problems with clients.", "Acordar el precio y el trabajo por escrito ayuda a evitar problemas con los clientes."), true, T("A short written agreement settles most disputes before they start.", "Un acuerdo corto por escrito resuelve casi todos los problemas antes de que empiecen.")),
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
        tf("pricing_profit", T("Selling more always means earning more.", "Vender más siempre significa ganar más."), false, T("If each sale costs more than its price, selling more loses more.", "Si cada venta cuesta más que su precio, vender más pierde más.")),
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
        tf("small_business", T("Recording every sale and cost shows whether a business is really profitable.", "Registrar cada venta y costo muestra si un negocio de verdad gana."), true, T("Without records, it's guesswork.", "Sin registros, son puras adivinanzas.")),
        act("goals.create", T("Make a goal for a small starting fund for a business idea.", "Crea una meta para un pequeño fondo inicial para una idea de negocio."), { name: T("Business starter fund", "Fondo para mi negocio"), target: [300, 4500], months: 6 }),
      ],
    },
  ],
};
