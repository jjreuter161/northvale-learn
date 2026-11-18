// SAMPLE (not shipped): the first lesson of the business unit "Revenue, costs
// and profit". Written in the real lesson format (src/modules/lessons/units/
// helpers.js) so it can move into a unit file after approval. It is NOT wired
// into units/index.js. Render it to Markdown with:
//   node docs/samples/render-sample.mjs
// New in this draft (needs building if approved): the `value` tag on a lesson
// ("create" | "deliver" | "capture") and the action kind "business.month".
import { T, card, choice, tf, act, concept, number } from "../../src/modules/lessons/units/helpers.js";

export const concepts = [
  concept(
    "profit",
    T("Profit", "Ganancia"),
    card(
      T("Left over, or not", "Lo que sobra, o no"),
      T(
        "Look at one month of a business. Add up what customers paid. Add up what the business spent. If the first number is bigger, the difference is what's left over. If it's smaller, the business paid to be open.",
        "Mira un mes de un negocio. Suma lo que pagaron los clientes. Suma lo que gastó el negocio. Si el primer número es mayor, la diferencia es lo que sobra. Si es menor, el negocio pagó por estar abierto."
      )
    ),
    tf(
      "profit",
      T("A business that takes in {$5000|30000} and spends {$4000|24000} has {$1000|6000} left over.", "Un negocio que recibe {$5000|30000} y gasta {$4000|24000} se queda con {$1000|6000}."),
      true,
      T("Money in minus money out: {$5000|30000} − {$4000|24000} = {$1000|6000}.", "Dinero que entra menos dinero que sale: {$5000|30000} − {$4000|24000} = {$1000|6000}.")
    ),
    choice(
      "profit",
      T("A food stand takes in {$8000|48000} and spends {$8500|51000}. What happened?", "Un puesto de comida recibe {$8000|48000} y gasta {$8500|51000}. ¿Qué pasó?"),
      [
        T("It lost {$500|3000} this month", "Perdió {$500|3000} este mes"),
        T("It made {$8000|48000} this month", "Ganó {$8000|48000} este mes"),
        T("It broke even", "Quedó en equilibrio")
      ],
      0,
      T("It spent {$500|3000} more than it took in. That's a loss, even though {$8000|48000} came in.", "Gastó {$500|3000} más de lo que recibió. Eso es una pérdida, aunque entraron {$8000|48000}."),
      [
        null,
        T("{$8000|48000} is only what came in. The business also paid {$8500|51000} out.", "{$8000|48000} es solo lo que entró. El negocio también pagó {$8500|51000}."),
        T("Breaking even means money in equals money out. Here, more went out.", "Quedar en equilibrio es que lo que entra sea igual a lo que sale. Aquí salió más.")
      ]
    )
  ),
  concept(
    "unit_cost",
    T("Cost of one item", "Costo de una pieza"),
    card(
      T("Price against cost", "Precio contra costo"),
      T(
        "Before you sell more, check one sale. What does one juice cost to make: fruit, cup, a share of the rent? If the price is lower, every sale makes the hole bigger. Selling more only helps when each sale leaves something.",
        "Antes de vender más, revisa una sola venta. ¿Cuánto cuesta hacer un jugo: fruta, vaso, una parte de la renta? Si el precio es menor, cada venta hace el hoyo más grande. Vender más solo ayuda cuando cada venta deja algo."
      )
    ),
    tf(
      "unit_cost",
      T("If each sale loses money, selling more makes the loss bigger.", "Si cada venta pierde dinero, vender más hace la pérdida más grande."),
      true,
      T("Ten sales that each lose {$1|15} lose {$10|150}. A hundred lose {$100|1500}.", "Diez ventas que pierden {$1|15} cada una pierden {$10|150}. Cien pierden {$100|1500}.")
    ),
    choice(
      "unit_cost",
      T("A bracelet costs {$6|90} to make and sells for {$5|75}. What helps first?", "Una pulsera cuesta {$6|90} hacerla y se vende en {$5|75}. ¿Qué ayuda primero?"),
      [
        T("Change the price or the cost so each sale leaves something", "Cambiar el precio o el costo para que cada venta deje algo"),
        T("Sell twice as many", "Vender el doble"),
        T("Wait for people to get used to the price", "Esperar a que la gente se acostumbre al precio")
      ],
      0,
      T("Each bracelet loses {$1|15}. The gap has to close before volume helps.", "Cada pulsera pierde {$1|15}. Primero hay que cerrar esa diferencia; después el volumen ayuda."),
      [
        null,
        T("Twice as many bracelets means twice the loss.", "El doble de pulseras es el doble de pérdida."),
        T("Getting used to a price doesn't change what each bracelet costs.", "Acostumbrarse a un precio no cambia lo que cuesta cada pulsera.")
      ]
    )
  )
];

export const lesson = {
  id: "biz-profit-1",
  title: T("Money in, money out", "Dinero que entra, dinero que sale"),
  value: "capture", // which part of the big idea this lesson is about
  life: T("This week, pick a small business you visit and guess its three biggest costs.", "Esta semana, elige un negocio pequeño que visites y adivina sus tres gastos más grandes."),
  steps: [
    card(
      T("The line out the door", "La fila hasta la calle"),
      T(
        "Rosa's taquería has a line every night. Last month, customers paid her {$10000|60000}. She paid {$5000|30000} for food, {$2500|15000} for rent and gas, and {$4000|24000} to her helpers. Did she have any money left at the end of the month?",
        "La taquería de doña Rosa tiene fila todas las noches. El mes pasado, los clientes le pagaron {$10000|60000}. Ella pagó {$5000|30000} de comida, {$2500|15000} de renta y gas, y {$4000|24000} a sus ayudantes. ¿Le sobró dinero al final del mes?"
      )
    ),
    choice(
      "profit",
      T("Did Rosa make money last month?", "¿Ganó dinero Rosa el mes pasado?"),
      [
        T("No. She spent {$1500|9000} more than she took in", "No. Gastó {$1500|9000} más de lo que recibió"),
        T("Yes. {$10000|60000} came in", "Sí. Entraron {$10000|60000}"),
        T("Yes. A line out the door means it works", "Sí. Una fila hasta la calle significa que funciona")
      ],
      0,
      T("{$10000|60000} came in and {$11500|69000} went out. That leaves a hole of {$1500|9000}.", "Entraron {$10000|60000} y salieron {$11500|69000}. Eso deja un hoyo de {$1500|9000}."),
      [
        null,
        T("That's only money in. Add up money out too.", "Eso es solo lo que entra. Suma también lo que sale."),
        T("A line shows people want the tacos, not that prices cover costs.", "La fila muestra que quieren los tacos, no que los precios cubran los costos.")
      ]
    ),
    card(
      T("Now it has names", "Ahora tiene nombre"),
      T(
        "Money customers pay is revenue. Money spent to run the business is costs. Revenue minus costs is profit; below zero, a loss. Rosa created value and delivered it, since people line up, but she kept none. Some losses are chosen: Amazon spent years reporting losses while it reinvested to grow. Rosa's was a surprise.",
        "El dinero que pagan los clientes son los ingresos. El dinero que se gasta para operar son los costos. Ingresos menos costos es la ganancia; menos de cero, una pérdida. Rosa creó valor y lo entregó, pues la gente hace fila, pero no se quedó con nada. Algunas pérdidas son elegidas: Amazon pasó años con pérdidas mientras reinvertía para crecer. La de Rosa fue una sorpresa."
      )
    ),
    number(
      "profit",
      T("Rosa sells 1,000 plates a month at {$10|60}. She raises each price by {$2|12} and keeps every customer. What's her profit?", "Rosa vende 1,000 órdenes al mes a {$10|60}. Sube cada precio {$2|12} y conserva a todos sus clientes. ¿Cuál es su ganancia?"),
      { unit: "money", answer: [500, 3000] },
      [
        T("1,000 × {$2|12} = {$2000|12000} more revenue.", "1,000 × {$2|12} = {$2000|12000} más de ingresos."),
        T("{$12000|72000} − {$11500|69000} = {$500|3000}.", "{$12000|72000} − {$11500|69000} = {$500|3000}.")
      ]
    ),
    tf(
      "unit_cost",
      T("Luis's juice stand sold out daily, then closed. Each juice sold for {$4|60} and cost {$5|75} to make. Selling more would have saved it. True or false?", "El puesto de jugos de Luis se agotaba a diario y luego cerró. Cada jugo se vendía en {$4|60} y costaba {$5|75}. Vender más lo habría salvado. ¿Verdadero o falso?"),
      false,
      T("Each juice lost {$1|15}, so more juice meant a bigger loss. Checking what one juice costs, then fixing the price or the cost, comes first.", "Cada jugo perdía {$1|15}, así que más jugo era más pérdida. Primero hay que revisar cuánto cuesta un jugo y arreglar el precio o el costo.")
    ),
    act("business.month", T("Run one month of Rosa's taquería. Set the price and see profit.", "Corre un mes de la taquería de Rosa. Fija el precio y mira la ganancia."), { business: "taqueria", income: [10000, 60000] })
  ]
};

export const sources = [
  "Amazon.com, Inc. annual reports (Form 10-K), filed with the SEC (sec.gov/edgar): net loss years and the return to profit. VERIFY the exact wording before shipping.",
  "SBA, 'Calculate your startup costs' and 'Manage your finances' (sba.gov): revenue, costs and profit in plain words.",
  "SAT, 'Régimen Simplificado de Confianza' pages (sat.gob.mx): used later in the unit, not in this lesson.",
  "Rosa and Luis are made-up examples. All numbers are examples."
];
