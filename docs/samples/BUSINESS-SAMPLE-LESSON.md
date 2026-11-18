# Sample lesson: "Money in, money out" (draft for approval)

Unit: **Revenue, costs and profit** · first lesson · big-idea tag: **capture value** · not shipped, not wired into the app.
Source of truth: `docs/samples/business-sample.mjs` (the real lesson format). Run `node docs/samples/render-sample.mjs` to rebuild this page.
- Estimated length: **4.4 min in English, 4.5 min in Spanish** (limit 4.5).
- Question kinds: **choice, number, scenario** (at least 3 required).
- Card lengths in words: 40 EN / 40 ES; 53 EN / 67 ES (target 40–70; Spanish runs longer).

How to read it: this is what a learner goes through, in order. ✅ marks the right answer. English shows US numbers; Spanish shows Mexico numbers (the app lets people mix any language with any country).

---

## English (US numbers)

**Lesson: Money in, money out**

**Card: The line out the door**

> Rosa's taquería has a line every night. Last month, customers paid her $10,000. She paid $5,000 for food, $2,500 for rent and gas, and $4,000 to her helpers. Did she have any money left at the end of the month?

**Question (choice, concept: profit):** Did Rosa make money last month?

- ✅ No. She spent $1,500 more than she took in
- ◻️ Yes. $10,000 came in
  - *If you picked this:* That's only money in. Add up money out too.
- ◻️ Yes. A line out the door means it works
  - *If you picked this:* A line shows people want the tacos, not that prices cover costs.

*Why:* $10,000 came in, $11,500 went out: a hole of $1,500.

**Card: Now it has names**

> Money paid by customers is revenue; money spent to operate is costs. Revenue minus costs is profit; below zero, a loss. Rosa created and delivered value but kept none. Some losses come with growth: Amazon lost money every year from 1998 to 2002, then made $35 million in 2003. Rosa's was a surprise.

**Question (work it out, concept: profit):** Rosa sells 1,000 plates a month at $10. She raises each price by $2 and keeps every customer. What's her profit?

- Answer: $500
- Steps: 1,000 × $2 = $2,000 more revenue. → $12,000 − $11,500 = $500.

**Question (real-life choice, concept: unit_cost):** Luis's juice stand sells out daily. A juice sells for $4 and costs $5. A friend says sell more. What do you do first?

- **Good:** Work out what one juice costs, then fix the price or cost
  - Each juice loses $1. A sale must leave something.
- **OK:** Raise the price a little
  - A start, but you need the cost too.
- **Poor:** Sell more, since people want it
  - More sales means a bigger loss.

*Why:* Check what a sale leaves first.

**Action (hands-on):** Run Rosa's taquería for one month.

**In real life:** This week, pick a small business you visit and guess its three biggest costs.

---

## Español (números de México)

**Lección: Dinero que entra, dinero que sale**

**Tarjeta: La fila hasta la calle**

> La taquería de doña Rosa tiene fila todas las noches. El mes pasado, los clientes le pagaron MX$60,000. Ella pagó MX$30,000 de comida, MX$15,000 de renta y gas, y MX$24,000 a sus ayudantes. ¿Le sobró dinero al final del mes?

**Pregunta (choice, concept: profit):** ¿Ganó dinero Rosa el mes pasado?

- ✅ No. Gastó MX$9,000 más de lo que recibió
- ◻️ Sí. Entraron MX$60,000
  - *Si elegiste esta:* Eso es solo lo que entra. Suma también lo que sale.
- ◻️ Sí. Una fila hasta la calle significa que funciona
  - *Si elegiste esta:* La fila muestra que quieren los tacos, no que los precios cubran los costos.

*Por qué:* Entraron MX$60,000, salieron MX$69,000: un hoyo de MX$9,000.

**Tarjeta: Ahora tiene nombre**

> Lo que pagan los clientes son los ingresos; lo que se gasta para operar, los costos. Ingresos menos costos es la ganancia; menos de cero, una pérdida. Rosa creó y entregó valor, pero no se quedó con nada. Algunas pérdidas llegan con el crecimiento: Amazon perdió dinero cada año de 1998 a 2002 y en 2003 ganó 35 millones de dólares. La de Rosa fue una sorpresa.

**Pregunta (work it out, concept: profit):** Rosa vende 1,000 órdenes al mes a MX$60. Sube cada precio MX$12 y conserva a todos sus clientes. ¿Cuál es su ganancia?

- Respuesta: MX$3,000
- Pasos: 1,000 × MX$12 = MX$12,000 más de ingresos. → MX$72,000 − MX$69,000 = MX$3,000.

**Pregunta (real-life choice, concept: unit_cost):** El puesto de jugos de Luis se agota a diario. Un jugo se vende en MX$60 y cuesta MX$75. Un amigo dice que vendas más. ¿Qué haces primero?

- **Buena:** Calculas cuánto cuesta un jugo y arreglas precio o costo
  - Cada jugo pierde MX$15. Una venta debe dejar algo.
- **Regular:** Subes un poco el precio
  - Es un inicio, pero necesitas el costo.
- **Floja:** Vendes más, pues lo quieren
  - Más ventas es más pérdida.

*Por qué:* Revisa qué deja una venta primero.

**Acción (práctica):** Corre un mes la taquería de Rosa.

**En la vida real:** Esta semana, elige un negocio pequeño que visites y adivina sus tres gastos más grandes.

---

## The two concepts this lesson teaches (each gets an explainer, an easier question and a harder one)

- **Profit** / Ganancia
- **Cost of one item** / Costo de una pieza

## How the design rules show up

| Rule | Where it is |
|---|---|
| Concept before terminology | Card 1 tells Rosa's month with no business words; "revenue," "costs," "profit" appear only on card 2, after the learner has already worked out she lost money |
| Open with a question | Card 1 ends with "did Rosa have money left?" and the first question makes the learner commit to an answer |
| Local example + well-known company | Rosa's taquería and Luis's juice stand (local, made up); Amazon's losses from 1998 to 2002 and its 2003 profit on card 2 (one sentence, our words, no logo, checked against its filings) |
| Application | A work-it-out price change, a real-life choice about Luis's stand, then the hands-on month in the simulator |
| Failure case | Luis's juice stand: a real-life choice about what to do first when each juice loses money (selling more is the poor answer) |
| Tests understanding | No "define profit," and no true/false in the lesson itself: every question is a situation (the easy true/false lives in the idea cards) |
| Big idea | Card 2 says it directly: Rosa created and delivered value but didn't capture any |

## Sources for this lesson (our own words, official sources first)

- Amazon.com, Inc., Form 10-K for 2002 (sec.gov, Archives/edgar/data/1018724/000095014903000355): net loss of $124.5 million (1998), $720.0 million (1999), $1,411.3 million (2000), $567.3 million (2001) and $149.1 million (2002). Amazon.com press release of 27 Jan 2004 (press.aboutamazon.com): net income of $35 million in 2003 against a net loss of $149 million in 2002. Both read on 2026-11-18.
- SBA, 'Calculate your startup costs' and 'Manage your finances' (sba.gov): revenue, costs and profit in plain words.
- SAT, 'Régimen Simplificado de Confianza' pages (sat.gob.mx): used later in the unit, not in this lesson.
- Rosa and Luis are made-up examples. All numbers are examples.
