// UNIT — Debt & credit. Its lessons and the concepts they teach (format in helpers.js).
import { T, card, choice, tf, act, concept } from "./helpers.js";

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
      steps: [
        card(T("Debt = future money, spent now", "Deuda = dinero del futuro, gastado hoy"), T("When you borrow, you get money now and pay it back later — plus interest. Interest is the price of borrowing.", "Cuando pides prestado, recibes dinero hoy y lo pagas después, más intereses. Los intereses son el precio de pedir prestado.")),
        card(T("Read the APR", "Fíjate en la tasa"), T("APR (annual percentage rate) tells you what borrowing costs per year. Credit cards often charge over {@cardAprTypical} a year — that's expensive.", "La tasa anual te dice cuánto cuesta pedir prestado por año. Las tarjetas de crédito suelen cobrar más de {@cardAprTypical} al año, y eso es caro.", { en: "In Mexico, look at the CAT (Costo Anual Total): it includes interest and fees, so you can compare loans fairly. Credit cards often have a CAT over {@catTypical} a year.", es: "En México, fíjate en el CAT (Costo Anual Total): incluye intereses y comisiones, así puedes comparar préstamos de forma justa. Es común que las tarjetas tengan un CAT de más de {@catTypical} al año." })),
        choice(
          "borrowing_cost",
          T("You borrow {$1000|15000}. Which deal costs you less?", "Pides prestado {$1000|15000}. ¿Qué opción te cuesta menos?"),
          [T("A loan at 8% a year", "Un préstamo al 8% anual"), T("A credit card at 25% a year", "Una tarjeta al 25% anual"), T("They cost the same", "Cuestan lo mismo")],
          0,
          T("Same amount, lower rate, less to pay back. Comparing rates is the easiest money you'll ever save.", "Misma cantidad, tasa más baja, menos que pagar. Comparar tasas es el ahorro más fácil que vas a lograr."),
          [null, T("25% a year costs about three times as much interest as 8% on the same amount.", "Un 25% anual cuesta unas tres veces más intereses que un 8% por el mismo monto."), T("The rate is the price of the loan. Different rates, different costs.", "La tasa es el precio del préstamo. Tasas distintas, costos distintos.")]
        ),
        tf("borrowing_cost", T("Some debt can be useful, like a reasonable loan for school or a car you need for work.", "Algunas deudas pueden ser útiles, como un préstamo razonable para estudiar o un coche que necesitas para trabajar."), true, T("Debt is a tool. It's useful when it helps you earn more or get something you truly need — and risky when it pays for wants.", "La deuda es una herramienta. Sirve cuando te ayuda a ganar más o a tener algo que de verdad necesitas, y es riesgosa cuando paga gustos.")),
        act("goals.debt", T("See how long {$1000|15000} at 24% takes to pay off — and how paying more changes it.", "Mira cuánto tardas en pagar {$1000|15000} al 24% y cómo cambia si pagas más."), {balance: [1000,15000],apr: 24,payment: [50,750]}),
      ],
    },
    {
      id: "credit-2",
      title: T("Credit cards", "Tarjetas de crédito"),
      steps: [
        card(T("Borrowing with a card", "Pedir prestado con una tarjeta"), T("A credit card lets you buy now and pay the bank later. Pay the full balance every month and it's usually free. Carry a balance and interest starts piling up.", "Una tarjeta de crédito te deja comprar hoy y pagarle al banco después. Si pagas el total cada mes, normalmente no te cuesta. Si dejas saldo, los intereses se empiezan a acumular.", { en: "A credit card lets you buy now and pay the bank later. Pay the full balance every month (being a \"totalero\") and it's usually free. Carry a balance and interest starts piling up.", es: "Una tarjeta de crédito te deja comprar hoy y pagarle al banco después. Si pagas el total cada mes (ser \"totalero\"), normalmente no te cuesta. Si dejas saldo, los intereses se empiezan a acumular." })),
        card(T("The minimum payment trap", "La trampa del pago mínimo"), T("The card shows a small \"minimum payment.\" Paying only that keeps you in debt for years, because most of it goes to interest.", "La tarjeta te muestra un \"pago mínimo\" pequeño. Si solo pagas eso, te quedas años en deuda, porque casi todo se va a intereses.")),
        choice(
          "credit_cards",
          T("What's the best way to use a credit card?", "¿Cuál es la mejor forma de usar una tarjeta de crédito?"),
          [T("Pay the minimum each month", "Pagar el mínimo cada mes"), T("Pay the full balance each month", "Pagar el total cada mes"), T("Use it for things you can't afford", "Usarla para cosas que no te alcanzan")],
          1,
          T("Paying in full means no interest — you get the convenience without the cost.", "Pagar el total significa cero intereses: tienes la comodidad sin el costo."),
          [T("The minimum avoids late fees, but interest keeps growing on the rest.", "El mínimo evita cargos por atraso, pero los intereses siguen creciendo sobre el resto."), null, T("That's how card debt starts. A card is a loan, not extra money.", "Así empiezan las deudas de tarjeta. Una tarjeta es un préstamo, no dinero extra.")]
        ),
        tf("credit_cards", T("A credit card is extra money the bank gives you.", "Una tarjeta de crédito es dinero extra que te regala el banco."), false, T("It's a loan. Every purchase is money you owe back.", "Es un préstamo. Cada compra es dinero que debes regresar.")),
        act("goals.debt", T("Compare paying the minimum vs. paying double on a card balance.", "Compara pagar el mínimo vs. pagar el doble en el saldo de una tarjeta."), {balance: [800,12000],apr: 24,payment: [25,400],compareDouble: true}),
      ],
    },
    {
      id: "credit-3",
      title: T("Your credit history", "Tu historial crediticio"),
      steps: [
        card(T("Your money reputation", "Tu reputación con el dinero"), T("A credit score is a number (300 to 850 for FICO) that shows lenders how you've handled borrowing. Higher means cheaper loans, easier apartment rentals, and sometimes lower phone deposits.", "Un puntaje de crédito es un número (de 300 a 850 en FICO) que muestra a los prestamistas cómo has manejado tus deudas. Más alto significa préstamos más baratos, rentar más fácil y a veces depósitos más bajos.", { en: "In Mexico, credit bureaus (Buró de Crédito and Círculo de Crédito) keep a record of how you pay your loans and cards. \"Being in Buró\" isn't bad — everyone with credit is. What matters is paying on time.", es: "En México, las sociedades de información crediticia (Buró de Crédito y Círculo de Crédito) guardan un registro de cómo pagas tus préstamos y tarjetas. \"Estar en Buró\" no es malo: todos los que tienen crédito están. Lo que importa es pagar a tiempo." })),
        card(T("What helps most", "Lo que más ayuda"), T("Paying on time is the biggest part. Using only a small part of your credit limit and keeping accounts open a long time help too.", "Pagar a tiempo es lo más importante. Usar solo una parte pequeña de tu límite y tener cuentas abiertas por mucho tiempo también ayuda.", { en: "Paying on time is the biggest part. You can check your record for free once every 12 months with each bureau.", es: "Pagar a tiempo es lo más importante. Puedes pedir tu reporte gratis una vez cada 12 meses con cada sociedad." })),
        choice(
          "credit_history",
          T("What hurts your credit history the most?", "¿Qué daña más tu historial crediticio?"),
          [T("Checking your own report", "Revisar tu propio reporte"), T("Paying late", "Pagar tarde"), T("Paying in full", "Pagar el total")],
          1,
          T("Late payments stay on your record for years. Checking your own report never hurts.", "Los pagos atrasados se quedan en tu historial por años. Revisar tu propio reporte nunca te afecta."),
          [T("Checking your own report doesn't hurt it. It's a good habit.", "Revisar tu propio reporte no lo afecta. Es un buen hábito."), null, T("Paying in full shows you handle credit well — it helps.", "Pagar el total muestra que manejas bien el crédito: te ayuda.")]
        ),
        tf("credit_history", T("You can build a good history by borrowing a little and always paying on time.", "Puedes construir buen historial pidiendo poco prestado y pagando siempre a tiempo."), true, T("Small, on-time payments build trust. That's how a first card or a student card works best.", "Pagos pequeños y a tiempo construyen confianza. Así funciona mejor una primera tarjeta.")),
        act("goals.debt", T("See what paying {$100|1500} more each month does to a balance.", "Mira qué pasa con una deuda si pagas {$100|1500} más cada mes."), {balance: [2000,30000],apr: 22,payment: [80,1200],extra: [100,1500]}),
      ],
    },
  ],
};
