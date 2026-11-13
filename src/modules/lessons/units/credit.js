// UNIT — Debt & credit. Its lessons and the concepts they teach (format in helpers.js).
import { T, card, choice, tf, act, concept, estimate, number, scenario, fit, order } from "./helpers.js";
import { fact } from "../../../core/facts.js";

export default {
  id: "credit",
  icon: "card",
  title: T("Debt & credit", "Deudas y crédito"),
  concepts: [
    concept(
      "borrowing_cost",
      T("The cost of borrowing", "El costo de pedir prestado"),
      card(T("Interest is the price of a loan", "El interés es el precio de un préstamo"), T("Borrowing {$1000|15000} at 20% a year costs about {$200|3000} a year in interest if you don't pay any back. The APR is the price tag — compare it the way you'd compare prices in a store.", "Pedir {$1000|15000} al 20% anual cuesta unos {$200|3000} al año de intereses si no pagas nada. La APR es la etiqueta de precio: compárala como compararías precios en una tienda.", { en: "Borrowing {$1000|15000} at 20% a year costs about {$200|3000} a year in interest if you don't pay any back. The CAT is the price tag — compare it the way you'd compare prices in a store.", es: "Pedir {$1000|15000} al 20% anual cuesta unos {$200|3000} al año de intereses si no pagas nada. El CAT es la etiqueta de precio: compáralo como compararías precios en una tienda." })),
      tf("borrowing_cost", T("For the same amount and time, a lower interest rate means the loan costs less.", "Por el mismo monto y plazo, una tasa más baja significa que el préstamo cuesta menos."), true, T("The rate is the price. Lower price, lower cost.", "La tasa es el precio. Menor precio, menor costo.")),
      choice(
        "borrowing_cost",
        T("You owe {$1000|15000} at 24% a year and pay nothing back. About how much interest is that in a year, before any compounding?", "Debes {$1000|15000} al 24% anual y no pagas nada. ¿Más o menos cuánto interés es en un año, sin contar el interés compuesto?"),
        [T("{$24|360}", "{$24|360}"), T("{$240|3600}", "{$240|3600}"), T("{$2400|36000}", "{$2400|36000}")],
        1,
        T("24% of {$1000|15000} is {$240|3600}. When interest is charged monthly, it ends up a bit more.", "El 24% de {$1000|15000} es {$240|3600}. Si el interés se cobra cada mes, termina siendo un poco más."),
        [T("That would be 2.4% a year, not 24%.", "Eso sería 2.4% al año, no 24%."), null, T("That's more than double what you borrowed. 24% a year is {$240|3600}.", "Eso es más del doble de lo que pediste. El 24% anual es {$240|3600}.")]
      )
    ),
    concept(
      "credit_cards",
      T("Credit cards", "Tarjetas de crédito"),
      card(T("The card lends, you repay", "La tarjeta presta y tú pagas"), T("Each purchase on a credit card is a small loan. Pay the full statement balance by the due date and you usually pay no interest. Pay less, and interest is charged on what's left — often over {@cardAprTypical} a year.", "Cada compra con tarjeta de crédito es un pequeño préstamo. Si pagas el saldo total del estado de cuenta a tiempo, normalmente no pagas intereses. Si pagas menos, te cobran intereses sobre lo que queda, a menudo más de {@cardAprTypical} al año.", { en: "Each purchase on a credit card is a small loan. Pay the full balance by the due date (the \"pago para no generar intereses\") and you usually pay no interest. Pay less, and interest is charged on what's left — the CAT is often over {@catTypical}.", es: "Cada compra con tarjeta de crédito es un pequeño préstamo. Si cubres el pago para no generar intereses a tiempo, normalmente no pagas intereses. Si pagas menos, te cobran intereses sobre lo que queda; el CAT suele ser de más de {@catTypical}." })),
      tf("credit_cards", T("Paying your full balance each month usually avoids credit card interest.", "Pagar el total cada mes normalmente evita los intereses de la tarjeta."), true, T("No balance left over, nothing for interest to grow on.", "Si no queda saldo, no hay nada sobre qué cobrar intereses.")),
      choice(
        "credit_cards",
        T("Your balance is {$300|4500} and the minimum payment is {$25|375}. You pay only the minimum. What happens?", "Tu saldo es de {$300|4500} y el pago mínimo es de {$25|375}. Pagas solo el mínimo. ¿Qué pasa?"),
        [T("You owe nothing more", "Ya no debes nada"), T("Interest is charged on the rest, so it costs more over time", "Te cobran intereses sobre el resto, así que con el tiempo cuesta más"), T("Your credit limit goes up", "Te suben el límite de crédito")],
        1,
        T("The minimum keeps the account in good standing, but the remaining {$275|4125} keeps building interest.", "El mínimo mantiene la cuenta al corriente, pero los {$275|4125} que quedan siguen generando intereses."),
        [T("You still owe the remaining {$275|4125} — plus interest.", "Todavía debes los {$275|4125} restantes, más intereses."), null, T("Paying the minimum doesn't raise your limit.", "Pagar el mínimo no sube tu límite.")]
      )
    ),
    concept(
      "credit_history",
      T("Credit history", "Historial crediticio"),
      card(T("A record of how you repay", "Un registro de cómo pagas"), T("Lenders keep a record of your loans and cards: how much you owe and whether you pay on time. It's summed up as a credit score. Later, a good history can mean better rates on a car loan or an easier time renting.", "Las empresas que prestan llevan un registro de tus préstamos y tarjetas: cuánto debes y si pagas a tiempo. Se resume en un puntaje de crédito. Más adelante, un buen historial puede significar mejores tasas para un crédito de auto o más facilidad para rentar.", { en: "In Mexico, Buró de Crédito and Círculo de Crédito keep a record of your loans and cards: how much you owe and whether you pay on time. Later, a good history can mean better rates on a car loan or an easier time renting.", es: "En México, el Buró de Crédito y el Círculo de Crédito guardan el registro de tus préstamos y tarjetas: cuánto debes y si pagas a tiempo. Más adelante, un buen historial puede significar mejores tasas para un crédito de auto o más facilidad para rentar." })),
      tf("credit_history", T("Paying on time helps your credit history.", "Pagar a tiempo ayuda a tu historial crediticio."), true, T("On-time payments are the biggest thing lenders look at.", "Los pagos puntuales son lo que más revisan quienes prestan.")),
      choice(
        "credit_history",
        T("Which habit builds the strongest credit history over time?", "¿Qué hábito construye el mejor historial crediticio con el tiempo?"),
        [T("Opening many cards at once", "Abrir muchas tarjetas a la vez"), T("Using a little credit and paying on time, every month", "Usar un poco de crédito y pagar a tiempo, cada mes"), T("Never checking your report", "Nunca revisar tu reporte")],
        1,
        T("A long record of on-time payments with low balances is what lenders want to see.", "Un historial largo de pagos puntuales con saldos bajos es lo que quieren ver quienes prestan."),
        [T("Applying for lots of credit at once can look risky to lenders.", "Pedir mucho crédito a la vez puede verse riesgoso."), null, T("Checking your own report doesn't hurt it — and it helps you catch mistakes or fraud.", "Revisar tu propio reporte no lo afecta, y te ayuda a detectar errores o fraudes.")]
      )
    ),
  ],
  lessons: [
    {
      id: "credit-1",
      title: T("Borrowing costs money", "Pedir prestado cuesta"),
      life: T("Before borrowing anything, find the APR and work out what it costs for a year.", "Antes de pedir prestado, busca la tasa anual y calcula cuánto cuesta en un año.", { en: "Before borrowing anything, find the CAT and work out what it costs for a year.", es: "Antes de pedir prestado, busca el CAT y calcula cuánto cuesta en un año." }),
      steps: [
        card(T("Debt = future money, spent now", "Deuda = dinero del futuro, gastado hoy"), T("When you borrow, you get money now and pay it back later — plus interest. Interest is the price of borrowing.", "Cuando pides prestado, recibes dinero hoy y lo pagas después, más intereses. Los intereses son el precio de pedir prestado.")),
        card(T("Read the APR", "Fíjate en la tasa"), T("APR (annual percentage rate) tells you what borrowing costs per year. Credit cards often charge over {@cardAprTypical} a year — that's expensive.", "La tasa anual te dice cuánto cuesta pedir prestado por año. Las tarjetas de crédito suelen cobrar más de {@cardAprTypical} al año, y eso es caro.", { en: "In Mexico, look at the CAT (Costo Anual Total): it includes interest and fees, so you can compare loans fairly. Credit cards often have a CAT over {@catTypical} a year.", es: "En México, fíjate en el CAT (Costo Anual Total): incluye intereses y comisiones, así puedes comparar préstamos de forma justa. Es común que las tarjetas tengan un CAT de más de {@catTypical} al año." })),
        number("borrowing_cost", T("You borrow {$1000|15000} for a year. A loan charges 8% and a credit card charges 25%. How much less interest does the loan cost?", "Pides prestados {$1000|15000} por un año. Un préstamo cobra 8% y una tarjeta cobra 25%. ¿Cuántos intereses menos cuesta el préstamo?"), { unit: "money", answer: [170, 2550] }, [T("Loan: 8% of {$1000|15000} = {$80|1200}. Card: 25% = {$250|3750}.", "Préstamo: 8% de {$1000|15000} = {$80|1200}. Tarjeta: 25% = {$250|3750}."), T("The loan costs {$170|2550} less. The rate is the price of the money.", "El préstamo cuesta {$170|2550} menos. La tasa es el precio del dinero.")]),
        tf("borrowing_cost", T("Some debt can be useful, like a reasonable loan for school or a car you need for work.", "Algunas deudas pueden ser útiles, como un préstamo razonable para estudiar o un coche que necesitas para trabajar."), true, T("Debt is a tool. It's useful when it helps you earn more or get something you truly need — and risky when it pays for wants.", "La deuda es una herramienta. Sirve cuando te ayuda a ganar más o a tener algo que de verdad necesitas, y es riesgosa cuando paga gustos.")),
        estimate("borrowing_cost", T("You borrow {$1000|10000} at {@cardAprTypical} a year and pay it all back after a year. About how much is the interest?", "Pides prestados {$1000|10000} a {@cardAprTypical} al año y lo pagas todo después de un año. ¿Cuánto son los intereses, más o menos?", { en: "You borrow $10,000 with a CAT of {@catTypical} and pay it all back after a year. About how much does it cost?", es: "Pides prestados $10,000 con un CAT de {@catTypical} y lo pagas todo después de un año. ¿Cuánto te cuesta, más o menos?" }), { unit: "money", min: [0, 0], max: [1000, 12000], step: [10, 100], answer: [fact("cardAprTypical") * 10, fact("catTypical") * 100] }, T("{@cardAprTypical} of {$1000|10000} is about {$200|4000}. Interest is the price of using money now.", "El {@cardAprTypical} de {$1000|10000} son unos {$200|4000}. Los intereses son el precio de usar dinero ahora.", { en: "{@catTypical} of $10,000 is about $4,000. Interest and fees are the price of using money now.", es: "El {@catTypical} de $10,000 son unos $4,000. Los intereses y comisiones son el precio de usar dinero ahora." })),
        act("goals.debt", T("See how long {$1000|15000} at 24% takes to pay off — and how paying more changes it.", "Mira cuánto tardas en pagar {$1000|15000} al 24% y cómo cambia si pagas más."), {balance: [1000,15000],apr: 24,payment: [50,750]}),
      ],
    },
    {
      id: "credit-2",
      title: T("Credit cards", "Tarjetas de crédito"),
      life: T("If you get a card, decide now that you'll pay the full balance every month.", "Si tienes una tarjeta, decide desde ahora que vas a pagar el total cada mes."),
      steps: [
        card(T("Borrowing with a card", "Pedir prestado con una tarjeta"), T("A credit card lets you buy now and pay the bank later. Pay the full balance every month and it's usually free. Carry a balance and interest starts piling up.", "Una tarjeta de crédito te deja comprar hoy y pagarle al banco después. Si pagas el total cada mes, normalmente no te cuesta. Si dejas saldo, los intereses se empiezan a acumular.", { en: "A credit card lets you buy now and pay the bank later. Pay the full balance every month (being a \"totalero\") and it's usually free. Carry a balance and interest starts piling up.", es: "Una tarjeta de crédito te deja comprar hoy y pagarle al banco después. Si pagas el total cada mes (ser \"totalero\"), normalmente no te cuesta. Si dejas saldo, los intereses se empiezan a acumular." })),
        card(T("The minimum payment trap", "La trampa del pago mínimo"), T("The card shows a small \"minimum payment.\" Paying only that keeps you in debt for years, because most of it goes to interest.", "La tarjeta te muestra un \"pago mínimo\" pequeño. Si solo pagas eso, te quedas años en deuda, porque casi todo se va a intereses.")),
        scenario(
          "credit_cards",
          T("Your card statement says {$300|4500}. You have {$350|5250} in your account until payday. What do you pay?", "Tu estado de cuenta dice {$300|4500}. Tienes {$350|5250} en tu cuenta hasta el día de pago. ¿Cuánto pagas?"),
          [
            fit(T("The full {$300|4500}", "Los {$300|4500} completos"), "good", T("No interest at all, and it builds your history.", "Cero intereses, y construye tu historial.")),
            fit(T("Half now, the rest next month", "La mitad ahora y el resto el próximo mes"), "ok", T("Better than the minimum, but interest starts on what's left.", "Mejor que el mínimo, pero se cobran intereses sobre lo que queda.")),
            fit(T("Just the minimum payment", "Solo el pago mínimo"), "poor", T("Interest piles onto the rest, and minimums can stretch a balance out for years.", "Los intereses se acumulan sobre el resto, y con pagos mínimos una deuda puede durar años.")),
          ],
          T("Paying the full statement balance every month makes a card free to use.", "Pagar el saldo total cada mes hace que usar la tarjeta no cueste nada.")
        ),
        tf("credit_cards", T("A credit card is extra money the bank gives you.", "Una tarjeta de crédito es dinero extra que te regala el banco."), false, T("It's a loan. Every purchase is money you owe back.", "Es un préstamo. Cada compra es dinero que debes regresar.")),
        number("credit_cards", T("You owe {$600|9000} on a card that charges 24% a year. About how much interest is added in one month if you pay nothing?", "Debes {$600|9000} en una tarjeta que cobra 24% al año. ¿Cuántos intereses se suman en un mes si no pagas nada?"), { unit: "money", answer: [12, 180] }, [T("24% a year ÷ 12 months = 2% a month.", "24% al año ÷ 12 meses = 2% al mes."), T("2% of {$600|9000} = {$12|180}, and next month it's charged on the bigger balance.", "El 2% de {$600|9000} = {$12|180}, y el mes siguiente se cobra sobre un saldo más grande.")]),
        act("goals.debt", T("Compare paying the minimum vs. paying double on a card balance.", "Compara pagar el mínimo vs. pagar el doble en el saldo de una tarjeta."), {balance: [800,12000],apr: 24,payment: [25,400],compareDouble: true}),
      ],
    },
    {
      id: "credit-3",
      title: T("Your credit history", "Tu historial crediticio"),
      life: T("Set up one reminder so no bill is ever paid late.", "Pon un recordatorio para que ninguna cuenta se pague tarde."),
      steps: [
        card(T("Your money reputation", "Tu reputación con el dinero"), T("A credit score is a number ({@ficoRange} for FICO) that shows lenders how you've handled borrowing. Higher means cheaper loans, easier apartment rentals, and sometimes lower phone deposits.", "Un puntaje de crédito es un número (de {@ficoRange} en FICO) que muestra a los prestamistas cómo has manejado tus deudas. Más alto significa préstamos más baratos, rentar más fácil y a veces depósitos más bajos.", { en: "In Mexico, credit bureaus (Buró de Crédito and Círculo de Crédito) keep a record of how you pay your loans and cards. \"Being in Buró\" isn't bad — everyone with credit is. What matters is paying on time.", es: "En México, las sociedades de información crediticia (Buró de Crédito y Círculo de Crédito) guardan un registro de cómo pagas tus préstamos y tarjetas. \"Estar en Buró\" no es malo: todos los que tienen crédito están. Lo que importa es pagar a tiempo." })),
        card(T("What helps most", "Lo que más ayuda"), T("Paying on time is the biggest part. Using only a small part of your credit limit and keeping accounts open a long time help too.", "Pagar a tiempo es lo más importante. Usar solo una parte pequeña de tu límite y tener cuentas abiertas por mucho tiempo también ayuda.", { en: "Paying on time is the biggest part. You can check your record for free once every 12 months with each bureau.", es: "Pagar a tiempo es lo más importante. Puedes pedir tu reporte gratis una vez cada 12 meses con cada sociedad." })),
        order("credit_history", T("Order these from most harmful to your credit history to least.", "Ordena del que más daña tu historial crediticio al que menos."), [T("Paying late", "Pagar tarde"), T("Using almost all of your credit limit", "Usar casi todo tu límite de crédito"), T("Opening several new cards at once", "Abrir varias tarjetas nuevas a la vez"), T("Checking your own credit report", "Revisar tu propio reporte de crédito")], T("Late payments hurt most, then high balances, then a lot of new credit at once. Checking your own report doesn't hurt at all.", "Los pagos tardíos dañan más, luego los saldos altos y luego mucho crédito nuevo de golpe. Revisar tu propio reporte no daña nada.")),
        tf("credit_history", T("You can build a good history by borrowing a little and always paying on time.", "Puedes construir buen historial pidiendo poco prestado y pagando siempre a tiempo."), true, T("Small, on-time payments build trust. That's how a first card or a student card works best.", "Pagos pequeños y a tiempo construyen confianza. Así funciona mejor una primera tarjeta.")),
        scenario(
          "credit_history",
          T("You just got your first credit card. Which habit builds your credit best?", "Acabas de recibir tu primera tarjeta de crédito. ¿Qué hábito construye mejor tu historial?"),
          [
            fit(T("Use it for one small bill and pay the full balance on time every month", "Usarla para un gasto pequeño y pagar el total a tiempo cada mes"), "good", T("On-time payments matter most, and paying in full costs nothing.", "Los pagos puntuales son lo que más cuenta, y pagar el total no cuesta nada.")),
            fit(T("Keep it in a drawer and almost never use it", "Guardarla en un cajón y casi nunca usarla"), "ok", T("Safe, but a card you never use builds little history.", "Es seguro, pero una tarjeta que no usas construye poco historial.")),
            fit(T("Carry a balance from month to month to “show activity”", "Dejar saldo pendiente cada mes para “mostrar movimiento”"), "poor", T("A myth. Carrying a balance only adds interest; paying in full builds the same history.", "Es un mito. Dejar saldo solo suma intereses; pagar el total construye el mismo historial.")),
          ],
          T("Pay on time, keep balances low, and the history builds itself.", "Paga a tiempo, mantén saldos bajos y el historial se construye solo.")
        ),
        act("goals.debt", T("See what paying {$100|1500} more each month does to a balance.", "Mira qué pasa con una deuda si pagas {$100|1500} más cada mes."), {balance: [2000,30000],apr: 22,payment: [80,1200],extra: [100,1500]}),
      ],
    },
  ],
};
