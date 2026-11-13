// UNIT — Insurance basics. Its lessons and the concepts they teach (format in helpers.js).
import { T, card, choice, tf, act, concept, order, match, number, scenario, fit } from "./helpers.js";

export default {
  id: "insurance",
  icon: "shield",
  title: T("Insurance basics", "Seguros básicos"),
  concepts: [
    concept(
      "insurance_basics",
      T("How insurance works", "Cómo funciona un seguro"),
      card(T("Many small payments, one big protection", "Muchos pagos chicos, una gran protección"), T("Lots of people each pay a small, regular amount (the premium). When something expensive happens to one of them — an accident, an illness, a theft — the pool pays. You trade a small certain cost for protection from a big uncertain one.", "Mucha gente paga cada quien una cantidad pequeña y regular (la prima). Cuando a alguien le pasa algo caro —un accidente, una enfermedad, un robo— el fondo común paga. Cambias un costo pequeño y seguro por protección contra uno grande e incierto.")),
      tf("insurance_basics", T("Insurance protects you from costs that would be too big to pay on your own.", "Un seguro te protege de costos demasiado grandes para pagarlos tú solo."), true, T("That's its job: making a rare, big loss manageable.", "Ese es su trabajo: volver manejable una pérdida grande y poco común.")),
      choice(
        "insurance_basics",
        T("Which is the best fit for insurance?", "¿Para qué tiene más sentido un seguro?"),
        [T("A rare event that would cost far more than you could pay", "Algo poco común que costaría mucho más de lo que podrías pagar"), T("A small cost that happens every week", "Un costo pequeño que pasa cada semana"), T("Something you'll definitely buy anyway", "Algo que de todos modos vas a comprar")],
        0,
        T("Insurance shines for rare, expensive risks. Small, regular costs are cheaper to just budget for.", "El seguro brilla con riesgos raros y caros. Los costos pequeños y regulares sale más barato presupuestarlos."),
        [null, T("Insuring small regular costs means paying the insurer's overhead on money you'd spend anyway.", "Asegurar costos pequeños y regulares es pagarle a la aseguradora por dinero que de todos modos vas a gastar."), T("If it's certain, it isn't a risk — budget for it.", "Si es seguro que pasará, no es un riesgo: presupuéstalo.")]
      )
    ),
    concept(
      "premium_deductible",
      T("Premiums and deductibles", "Prima y deducible"),
      card(T("Two numbers to compare", "Dos números para comparar"), T("The premium is what you pay regularly to stay covered. The deductible is what you pay yourself before the insurance starts paying. A higher deductible usually means a lower premium — and more out of your pocket if something happens.", "La prima es lo que pagas regularmente para estar cubierto. El deducible es lo que pagas tú antes de que el seguro empiece a pagar. Un deducible más alto suele bajar la prima, y te toca pagar más si algo pasa.")),
      tf("premium_deductible", T("A higher deductible usually means a lower premium.", "Un deducible más alto suele significar una prima más baja."), true, T("You take on more of the risk, so the insurer charges less.", "Tú asumes más del riesgo, así que la aseguradora cobra menos.")),
      choice(
        "premium_deductible",
        T("Your plan's deductible is {$1000|15000}. A covered repair costs {$600|9000}. Who pays?", "El deducible de tu seguro es de {$1000|15000}. Una reparación cubierta cuesta {$600|9000}. ¿Quién paga?"),
        [T("You pay all {$600|9000} — it's under the deductible", "Tú pagas los {$600|9000}: está por debajo del deducible"), T("The insurer pays all of it", "La aseguradora paga todo"), T("You each pay half", "Cada uno paga la mitad")],
        0,
        T("Until your costs pass the deductible, they're yours. Insurance covers what comes after.", "Hasta que tus gastos pasan el deducible, son tuyos. El seguro cubre lo que sigue."),
        [null, T("The insurer pays only after you've paid the deductible.", "La aseguradora paga solo después de que cubriste el deducible."), T("Sharing (coinsurance) can kick in later — but only after the deductible.", "Compartir el costo (coaseguro) puede aplicar después, pero solo pasando el deducible.")]
      )
    ),
    concept(
      "insurance_types",
      T("Common kinds of insurance", "Seguros comunes"),
      card(
        T("The ones you'll meet first", "Los primeros que vas a conocer"),
        T("Health insurance pays for medical care — you can usually stay on a parent's plan until {@parentHealthPlanAge}. Car insurance is required to drive in almost every state (New Hampshire is the main exception). Renters insurance covers your belongings and is often inexpensive.", "El seguro médico paga la atención de salud; normalmente puedes seguir en el plan de tu mamá o papá hasta los {@parentHealthPlanAge} años. El seguro de auto es obligatorio para manejar en casi todos los estados (New Hampshire es la principal excepción). El seguro de inquilino cubre tus cosas y suele ser barato.", {
          en: "Formal jobs come with IMSS health care. Private major-medical insurance (\"gastos médicos mayores\") covers big medical costs. Car insurance with civil liability (\"responsabilidad civil\") is required on federal highways, and some states require it everywhere.",
          es: "Los trabajos formales incluyen atención del IMSS. Un seguro privado de gastos médicos mayores cubre gastos médicos grandes. El seguro de auto con responsabilidad civil es obligatorio en carreteras federales, y algunos estados lo exigen en todos lados.",
        })
      ),
      tf("insurance_types", T("Car insurance is required to drive in almost every US state.", "El seguro de auto es obligatorio para manejar en casi todos los estados de EE. UU.", { en: "Car liability insurance is required on Mexico's federal highways.", es: "El seguro de auto de responsabilidad civil es obligatorio en las carreteras federales de México." }), true, T("At least liability coverage, which pays for damage you cause to others.", "Al menos la cobertura de responsabilidad, que paga los daños que le causes a otros.", { en: "It pays for damage you cause to others.", es: "Paga los daños que le causes a otros." })),
      choice(
        "insurance_types",
        T("What does liability car insurance pay for?", "¿Qué paga el seguro de auto de responsabilidad civil?"),
        [T("Damage or injuries you cause to others", "Daños o lesiones que le causes a otros"), T("Repairs to your own car, always", "Siempre las reparaciones de tu propio auto"), T("Your gas", "Tu gasolina")],
        0,
        T("Liability protects other people from your mistakes — and you from paying for them yourself.", "La responsabilidad civil protege a otros de tus errores, y a ti de pagarlos de tu bolsa."),
        [null, T("Damage to your own car needs extra coverage (collision or comprehensive).", "Los daños a tu propio auto necesitan otra cobertura (colisión o amplia)."), T("Insurance covers risks, not regular running costs.", "El seguro cubre riesgos, no gastos normales.")]
      )
    ),
    concept(
      "insurance_and_savings",
      T("Insurance + emergency fund", "Seguro + fondo de emergencia"),
      card(T("A team, not rivals", "Un equipo, no rivales"), T("An emergency fund pays the deductible and the small surprises. Insurance pays for the huge ones. With savings, you can choose a higher deductible and pay a lower premium — without being exposed.", "Un fondo de emergencia paga el deducible y los imprevistos chicos. El seguro paga los enormes. Con ahorro, puedes elegir un deducible más alto y pagar una prima más baja, sin quedar desprotegido.")),
      tf("insurance_and_savings", T("An emergency fund can help you pay a deductible.", "Un fondo de emergencia te puede ayudar a pagar un deducible."), true, T("That's one of its main jobs.", "Ese es uno de sus trabajos principales.")),
      choice(
        "insurance_and_savings",
        T("Why does having an emergency fund make a higher deductible less risky?", "¿Por qué tener un fondo de emergencia hace menos riesgoso un deducible más alto?"),
        [T("You can cover the deductible without borrowing", "Puedes cubrir el deducible sin pedir prestado"), T("It lowers the insurer's prices for everyone", "Baja los precios de la aseguradora para todos"), T("It replaces insurance completely", "Reemplaza por completo al seguro")],
        0,
        T("If you can pay the deductible from savings, the lower premium is pure savings.", "Si puedes pagar el deducible con tus ahorros, la prima más baja es puro ahorro."),
        [null, T("Your savings don't change the insurer's prices — they change what you can safely choose.", "Tu ahorro no cambia los precios de la aseguradora; cambia lo que puedes elegir con seguridad."), T("Savings handle small and medium shocks; big ones still need insurance.", "El ahorro cubre golpes chicos y medianos; los grandes todavía necesitan seguro.")]
      )
    ),
  ],
  lessons: [
    {
      id: "insurance-1",
      title: T("What insurance does", "Para qué sirve un seguro"),
      life: T("Ask an adult what insurance your family has and what it covers.", "Pregúntale a un adulto qué seguros tiene tu familia y qué cubren."),
      steps: [
        card(T("Sharing the risk", "Compartir el riesgo"), T("Most people won't crash a car or need surgery this year — but some will, and it can cost a fortune. Insurance spreads that cost across everyone who pays in.", "La mayoría de la gente no va a chocar ni a necesitar una cirugía este año, pero algunas personas sí, y puede costar una fortuna. El seguro reparte ese costo entre todos los que pagan.")),
        card(T("When it makes sense", "Cuándo tiene sentido"), T("Insure what you couldn't afford to replace or pay for. Small, predictable costs are usually cheaper to cover from your budget.", "Asegura lo que no podrías reponer o pagar tú. Los costos chicos y previsibles suele salir más barato cubrirlos con tu presupuesto.")),
        choice(
          "insurance_basics",
          T("What is a premium?", "¿Qué es la prima?"),
          [T("What you pay regularly to stay covered", "Lo que pagas regularmente para estar cubierto"), T("What the insurer pays you each month", "Lo que la aseguradora te paga cada mes"), T("A bonus for not making claims", "Un premio por no hacer reclamos")],
          0,
          T("The premium is the price of the protection.", "La prima es el precio de la protección."),
          [null, T("It's the other way around: you pay the insurer.", "Es al revés: tú le pagas a la aseguradora."), T("Some insurers give discounts, but the premium itself is your payment.", "Algunas aseguradoras dan descuentos, pero la prima es tu pago.")]
        ),
        tf("insurance_basics", T("Insurance is mainly for costs that are rare but very large.", "El seguro es sobre todo para costos poco comunes pero muy grandes."), true, T("That's where sharing the risk helps most.", "Ahí es donde compartir el riesgo ayuda más.")),
        scenario(
          "insurance_basics",
          T("Phone insurance costs {$12|180} a month with a {$100|1500} deductible. Your phone cost {$300|4500}, and you have {$500|7500} saved. What do you do?", "Un seguro para tu celular cuesta {$12|180} al mes con deducible de {$100|1500}. Tu celular costó {$300|4500} y tienes {$500|7500} ahorrados. ¿Qué haces?"),
          [
            fit(T("Skip it: your savings could replace the phone", "No contratarlo: tu ahorro podría reponer el celular"), "good", T("In two years you'd pay {$288|4320} in premiums for a {$300|4500} phone.", "En dos años pagarías {$288|4320} de primas por un celular de {$300|4500}.")),
            fit(T("Buy it, because never worrying is worth it to you", "Contratarlo, porque no preocuparte vale la pena para ti"), "ok", T("Fair if a broken phone would really hurt; it just costs more on average.", "Es válido si un celular roto te afectaría mucho; solo cuesta más en promedio.")),
            fit(T("Buy it and stop saving", "Contratarlo y dejar de ahorrar"), "poor", T("Then everything else that goes wrong has nothing to land on.", "Así, todo lo demás que salga mal no tiene con qué cubrirse.")),
          ],
          T("Insure what you couldn't afford to replace. Small losses are what savings are for.", "Asegura lo que no podrías reponer. Las pérdidas pequeñas son para el ahorro.")
        ),
        act("goals.insurance", T("Compare a low-premium plan and a low-deductible plan.", "Compara un plan de prima baja con uno de deducible bajo.")),
      ],
    },
    {
      id: "insurance-2",
      title: T("Premiums and deductibles", "Prima y deducible"),
      life: T("When you compare policies, compare the deductible as well as the monthly price.", "Cuando compares pólizas, compara el deducible además del precio mensual."),
      steps: [
        card(T("The trade-off", "El intercambio"), T("Low premium, high deductible: cheaper every month, more to pay if something happens. High premium, low deductible: pricier every month, less to pay when you use it. Which costs less depends on how much you end up needing it.", "Prima baja y deducible alto: más barato cada mes, más que pagar si algo pasa. Prima alta y deducible bajo: más caro cada mes, menos que pagar cuando lo usas. Cuál sale más barato depende de cuánto lo termines usando.")),
        card(T("Reading a policy", "Leer una póliza"), T("Look for the premium, the deductible, what's covered and what isn't, and any coinsurance (the share you still pay after the deductible). The exclusions matter as much as the price.", "Busca la prima, el deducible, qué cubre y qué no, y el coaseguro (la parte que todavía pagas después del deducible). Las exclusiones importan tanto como el precio.")),
        choice(
          "premium_deductible",
          T("You rarely need medical care and have savings for surprises. Which plan type often costs less overall?", "Casi nunca necesitas atención médica y tienes ahorro para imprevistos. ¿Qué tipo de plan suele costar menos en total?"),
          [T("Lower premium, higher deductible", "Prima baja, deducible alto"), T("Higher premium, lower deductible", "Prima alta, deducible bajo"), T("No insurance at all", "Nada de seguro")],
          0,
          T("If you rarely use it, a lower premium saves money most years — and your savings cover the deductible if needed.", "Si casi no lo usas, una prima baja ahorra dinero casi todos los años, y tu ahorro cubre el deducible si hace falta."),
          [null, T("A high premium pays off mainly if you expect to use the coverage a lot.", "Una prima alta conviene sobre todo si esperas usar mucho la cobertura."), T("Skipping insurance leaves you exposed to the rare, huge cost — that's the one that matters.", "No tener seguro te deja expuesto al costo raro y enorme: justo el que importa.")]
        ),
        number("premium_deductible", T("Your car insurance deductible is {$500|7500}. A repair costs {$300|4500}. How much does the insurance pay?", "El deducible de tu seguro de auto es de {$500|7500}. Una reparación cuesta {$300|4500}. ¿Cuánto paga el seguro?"), { unit: "money", answer: 0 }, [T("The repair is less than the deductible.", "La reparación cuesta menos que el deducible."), T("So insurance pays nothing, and you pay all {$300|4500}. That's why savings matter even with insurance.", "Así que el seguro no paga nada y tú pagas los {$300|4500}. Por eso el ahorro importa aunque tengas seguro.")]),
        order("premium_deductible", T("The same policy with four deductibles. Order them from the lowest monthly premium to the highest.", "La misma póliza con cuatro deducibles. Ordénalos de la prima mensual más baja a la más alta."), [T("{$2000|30000} deductible", "Deducible de {$2000|30000}"), T("{$1000|15000} deductible", "Deducible de {$1000|15000}"), T("{$500|7500} deductible", "Deducible de {$500|7500}"), T("{$250|3750} deductible", "Deducible de {$250|3750}")], T("The more you agree to pay yourself when something happens, the less the insurer charges each month.", "Entre más aceptas pagar tú cuando pasa algo, menos te cobra la aseguradora cada mes.")),
        act("goals.insurance", T("Slide the yearly costs and find where the two plans cross.", "Mueve los gastos del año y encuentra dónde se cruzan los dos planes.")),
      ],
    },
    {
      id: "insurance-3",
      title: T("Health, car and renters", "Salud, auto y hogar"),
      life: T("If you rent or drive, find out which insurance you're required to have.", "Si rentas o manejas, averigua qué seguro estás obligado a tener."),
      steps: [
        card(
          T("Health", "Salud"),
          T("Medical bills are one of the biggest money risks in the US. You can usually stay on a parent's plan until {@parentHealthPlanAge}; after that, jobs, the marketplace (HealthCare.gov) or Medicaid are the main options.", "Las cuentas médicas son uno de los mayores riesgos de dinero en EE. UU. Normalmente puedes seguir en el plan de tu mamá o papá hasta los {@parentHealthPlanAge}; después, las opciones principales son el trabajo, el mercado de seguros (HealthCare.gov) o Medicaid.", { en: "With a formal job you get IMSS care; students at public high schools and universities can also get IMSS coverage (the \"seguro facultativo\"). Private major-medical insurance (\"gastos médicos mayores\") is for big hospital bills, and many families add it.", es: "Con un trabajo formal tienes atención del IMSS; los estudiantes de preparatorias y universidades públicas también pueden tener IMSS (el seguro facultativo). El seguro privado de gastos médicos mayores es para cuentas grandes de hospital, y muchas familias lo contratan." })
        ),
        card(
          T("Car and home", "Auto y hogar"),
          T("Car insurance is required to drive in almost every state — at least liability, for damage you cause to others. Renters insurance covers your stuff against theft or fire and is often inexpensive.", "El seguro de auto es obligatorio en casi todos los estados, al menos de responsabilidad, para los daños que causes a otros. El seguro de inquilino cubre tus cosas contra robo o incendio y suele ser barato.", { en: "Civil liability car insurance is required on federal highways, and several states require it everywhere. Home insurance covers your belongings and, for owners, the building.", es: "El seguro de auto de responsabilidad civil es obligatorio en carreteras federales, y varios estados lo exigen en todos lados. El seguro de hogar cubre tus cosas y, si eres dueño, la construcción." })
        ),
        choice(
          "insurance_types",
          T("You rent an apartment. Which insurance covers your laptop if it's stolen there?", "Rentas un departamento. ¿Qué seguro cubre tu laptop si te la roban ahí?", { en: "Which insurance is required on Mexico's federal highways?", es: "¿Qué seguro es obligatorio en las carreteras federales de México?" }),
          [T("Renters insurance", "El seguro de inquilino", { en: "Car civil liability insurance", es: "El seguro de auto de responsabilidad civil" }), T("Car insurance", "El seguro de auto", { en: "Life insurance", es: "El seguro de vida" }), T("The landlord's insurance", "El seguro del dueño", { en: "Pet insurance", es: "El seguro de mascotas" })],
          0,
          T("Renters insurance covers your belongings; the landlord's covers the building.", "El seguro de inquilino cubre tus cosas; el del dueño cubre el edificio.", { en: "It pays for damage you cause to others on the road.", es: "Paga los daños que les causes a otros en el camino." }),
          [null, T("Car insurance covers your car, not your apartment.", "El seguro de auto cubre tu auto, no tu departamento.", { en: "Life insurance is for your family if you die — not for road damage.", es: "El seguro de vida es para tu familia si falleces, no para daños en el camino." }), T("The landlord's policy usually covers only the building, not your things.", "La póliza del dueño normalmente cubre solo el edificio, no tus cosas.", { en: "Pet insurance isn't required anywhere for driving.", es: "El seguro de mascotas no se exige para manejar." })]
        ),
        number("insurance_types", T("Your health plan has a {$1000|15000} deductible, then pays 80%. A hospital bill is {$6000|90000}. How much do you pay?", "Tu seguro médico tiene un deducible de {$1000|15000} y luego paga el 80%. Una cuenta del hospital es de {$6000|90000}. ¿Cuánto pagas tú?"), { unit: "money", answer: [2000, 30000] }, [T("First the deductible: {$1000|15000}.", "Primero el deducible: {$1000|15000}."), T("Then 20% of the other {$5000|75000}: {$1000|15000}.", "Luego el 20% de los otros {$5000|75000}: {$1000|15000}."), T("Total {$2000|30000} instead of {$6000|90000}.", "Total {$2000|30000} en lugar de {$6000|90000}.")]),
        match(
          "insurance_types",
          T("Match each insurance to what it pays for.", "Une cada seguro con lo que paga."),
          [
            [T("Health insurance", "Seguro médico", { en: "Medical expenses insurance", es: "Seguro de gastos médicos" }), T("Doctor and hospital bills", "Consultas y cuentas del hospital")],
            [T("Car liability insurance", "Seguro de auto de responsabilidad civil"), T("Damage you cause to other people and cars", "Daños que causas a otras personas y coches")],
            [T("Renters insurance", "Seguro de inquilino", { en: "Home contents insurance", es: "Seguro de hogar (contenidos)" }), T("Your things at home, if stolen or damaged", "Tus cosas en casa, si las roban o se dañan")],
          ],
          T("Each covers one kind of big, unlikely loss.", "Cada uno cubre un tipo de pérdida grande y poco probable.")
        ),
        act("goals.insurance", T("See how a big medical bill changes which plan costs less.", "Mira cómo una cuenta médica grande cambia qué plan cuesta menos.")),
      ],
    },
    {
      id: "insurance-4",
      title: T("Emergency fund + insurance", "Fondo de emergencia + seguro"),
      life: T("Make your emergency fund at least as big as your highest deductible.", "Haz que tu fondo de emergencia sea por lo menos del tamaño de tu deducible más alto."),
      steps: [
        card(T("Small shocks, big shocks", "Golpes chicos, golpes grandes"), T("Your emergency fund handles the small and medium surprises: a deductible, a repair, a few weeks without pay. Insurance handles the rare, huge ones. You need both.", "Tu fondo de emergencia se encarga de los imprevistos chicos y medianos: un deducible, una reparación, unas semanas sin sueldo. El seguro se encarga de los raros y enormes. Necesitas los dos.")),
        card(T("They make each other cheaper", "Se abaratan entre sí"), T("Savings let you pick a higher deductible and a lower premium. Insurance means your savings don't get wiped out by one bad event.", "El ahorro te deja elegir un deducible más alto y una prima más baja. El seguro hace que un solo mal evento no se acabe tu ahorro.")),
        choice(
          "insurance_and_savings",
          T("Your car needs a {$400|6000} repair and your deductible is {$500|7500}. What usually pays?", "Tu auto necesita una reparación de {$400|6000} y tu deducible es de {$500|7500}. ¿Qué la paga normalmente?"),
          [T("Your emergency fund", "Tu fondo de emergencia"), T("The insurer", "La aseguradora"), T("A new credit card", "Una tarjeta de crédito nueva")],
          0,
          T("It's under the deductible, so it's on you — which is exactly what the emergency fund is for.", "Está por debajo del deducible, así que te toca a ti: justo para eso es el fondo de emergencia."),
          [null, T("Below the deductible, the insurer doesn't pay.", "Por debajo del deducible, la aseguradora no paga."), T("Borrowing for a surprise turns it into debt with interest.", "Pedir prestado para un imprevisto lo convierte en deuda con intereses.")]
        ),
        match("insurance_and_savings", T("Match each cost to what usually pays for it.", "Une cada gasto con lo que normalmente lo paga."), [[T("A {$40|600} doctor's visit", "Una consulta médica de {$40|600}"), T("Your everyday budget", "Tu presupuesto del día a día")], [T("Your {$500|7500} deductible", "Tu deducible de {$500|7500}"), T("Your emergency fund", "Tu fondo de emergencia")], [T("A {$20000|300000} hospital stay", "Una hospitalización de {$20000|300000}"), T("Insurance, after the deductible", "El seguro, después del deducible")]], T("Insurance takes the huge shocks; savings take the deductible and the small ones. You need both.", "El seguro cubre los golpes enormes; el ahorro cubre el deducible y los pequeños. Necesitas los dos.")),
        number("insurance_and_savings", T("Your car insurance has a {$500|7500} deductible. A repair costs {$1800|27000}. How much do you pay?", "Tu seguro de auto tiene un deducible de {$500|7500}. Una reparación cuesta {$1800|27000}. ¿Cuánto pagas tú?"), { unit: "money", answer: [500, 7500] }, [T("You pay the deductible: {$500|7500}.", "Tú pagas el deducible: {$500|7500}."), T("Insurance pays the other {$1300|19500}. Your emergency fund is what covers the deductible.", "El seguro paga los otros {$1300|19500}. Tu fondo de emergencia es lo que cubre el deducible.")]),
        act("goals.create", T("Start (or check) an emergency fund goal.", "Empieza (o revisa) tu meta de fondo de emergencia."), { name: T("Emergency fund", "Fondo de emergencia"), target: [1000, 15000], months: 12, template: "emergency" }),
      ],
    },
  ],
};
