// UNIT — Working across the border (Wave 1, Life Across Borders, Build; Border).
// DRAFT: not in the app until a reviewer signs it off. To ship it, follow the steps at the top of
// sending.js. Needs a licensed professional's read (immigration, labor law, social security).
// Mission to add then: "List the papers you'd keep in one folder if you worked in both countries (just
// a list, no numbers written down)". Reflection: "Which paper would be hardest to replace?"
// Border units write both countries at once, so amounts are {US$…} and {MX$…}.
// Lesson 4 depends on the fact usMxSsaAgreementStatus (the 2004 agreement has not taken effect).
// The people and example pay are made up.
import { T, card, choice, tf, act, concept, order, match, number, scenario, fit } from "./helpers.js";

export default {
  id: "borderwork",
  icon: "clock",
  draft: true,
  title: T("Working across the border", "Trabajar a los dos lados de la frontera"),
  sources: [
    // "Read" = the page itself was opened. "Seen" = I read a search summary of the page, not the page: a reviewer opens each of these.
    { name: "USCIS, Form I-9 (read): every US employer completes it for every hire to verify identity and permission to work", url: "https://www.uscis.gov/i-9", checked: "2026-11-17" },
    { name: "USCIS, Find legal services (read): who may give immigration legal help; a \"notario\" is not a US lawyer", url: "https://www.uscis.gov/scams-fraud-and-misconduct/avoid-scams/find-legal-services", checked: "2026-11-17" },
    { name: "US Department of Labor, Fact Sheet #23, overtime (seen): time and one-half over 40 hours; not waivable by agreement; Wage and Hour Division says it enforces the law without regard to immigration status (worker rights page, seen)", url: "https://www.dol.gov/agencies/whd/fact-sheets/23-flsa-overtime-pay", checked: "2026-11-17" },
    { name: "IRS, Employer shared responsibility provisions (seen): employers with 50 or more full-time employees, counting equivalents", url: "https://www.irs.gov/affordable-care-act/employers/employer-shared-responsibility-provisions", checked: "2026-11-17" },
    { name: "SSA, Benefits Planner: credits (seen): 40 credits, at most 4 a year; SSA totalization needs at least 6 quarters of US coverage (seen)", url: "https://www.ssa.gov/benefits/retirement/planner/credits.html", checked: "2026-11-17" },
    { name: "STPS, bulletin 15/2026 (read): the 40-hour week phase-in; overtime today is double for the first 9 hours a week, then triple", url: "https://www.gob.mx/stps/prensa/stps-reforma-laboral-de-40-horas-reduce-jornada-sin-disminuir-salarios-y-establece-limites-claros-a-horas-extra?idiom=es", checked: "2026-11-17" },
    { name: "IMSS, constancia de semanas cotizadas (seen): free; online it asks for CURP and NSS. Ley del Seguro Social art. 15: the employer registers workers (seen)", url: "https://www.gob.mx/public/tramites/detalleTramite.xhtml?homoclave=IMSS-02-025-A", checked: "2026-11-17" },
  ],
  concepts: [
    concept(
      "work_papers",
      T("Permission to work", "Permiso para trabajar"),
      card(
        T("Permission comes first", "Primero el permiso"),
        T(
          "Each country decides who may work there and which paper shows it. A US employer must check every new hire's permission to work. For your own case, a licensed attorney, an accredited representative or the agency itself can say what fits.",
          "Cada país decide quién puede trabajar ahí y qué papel lo demuestra. Un empleador de EE. UU. debe revisar el permiso de trabajo de cada persona que contrata. Para tu caso, un abogado con licencia, un representante acreditado o la propia agencia pueden decir qué te corresponde."
        )
      ),
      tf("work_papers", T("A paper that lets you work in one country lets you work in the other.", "Un papel que te deja trabajar en un país te deja trabajar en el otro."), false, T("Each country sets its own rules for who may work there.", "Cada país pone sus propias reglas sobre quién puede trabajar ahí.")),
      choice(
        "work_papers",
        T("Who can tell you which paper fits your own situation?", "¿Quién puede decirte qué papel corresponde a tu situación?"),
        [T("A licensed attorney, an accredited representative or the agency", "Un abogado con licencia, un representante acreditado o la agencia"), T("A friend who got a job", "Un amigo que consiguió trabajo"), T("Whoever promises papers fastest", "Quien prometa papeles más rápido")],
        0,
        T("Each case is different, and only those sources can look at yours.", "Cada caso es distinto, y solo esas fuentes pueden ver el tuyo."),
        [null, T("What worked for a friend may not fit your case.", "Lo que le sirvió a un amigo puede no servir en tu caso."), T("A promise of speed is a warning sign, not an answer.", "Una promesa de rapidez es señal de alerta, no una respuesta.")]
      )
    ),
    concept(
      "pay_rules",
      T("Pay rules by country", "Reglas de pago por país"),
      card(
        T("Same work, different rules", "Mismo trabajo, distintas reglas"),
        T(
          "Overtime, weekly hours and deductions follow the country where you work. The same hours can pay differently on each side, so check the rules where the job is.",
          "El tiempo extra, las horas por semana y los descuentos siguen al país donde trabajas. Las mismas horas pueden pagarse distinto de cada lado, así que revisa las reglas de donde está el trabajo."
        )
      ),
      tf("pay_rules", T("The overtime rules are the same in the US and in Mexico.", "Las reglas de tiempo extra son las mismas en EE. UU. y en México."), false, T("Each country sets its own hours limits and its own extra pay.", "Cada país pone sus propios límites de horas y su propio pago extra.")),
      choice(
        "pay_rules",
        T("Lupe earns {MX$100} an hour in Monterrey. She works 3 overtime hours, paid double. What do those hours pay?", "Lupe gana {MX$100} por hora en Monterrey. Trabaja 3 horas extra pagadas al doble. ¿Cuánto pagan esas horas?"),
        [T("{MX$600}", "{MX$600}"), T("{MX$300}", "{MX$300}"), T("{MX$450}", "{MX$450}")],
        0,
        T("Double is {MX$200} an hour, and 3 × 200 = {MX$600}.", "El doble son {MX$200} por hora, y 3 × 200 = {MX$600}."),
        [null, T("That's the normal rate, with no extra for overtime.", "Eso es el pago normal, sin extra por tiempo extra."), T("That's time and a half, not double.", "Eso es una vez y media, no el doble.")]
      )
    ),
    concept(
      "health_cover",
      T("Health coverage from a job", "Cobertura de salud por el trabajo"),
      card(
        T("Where coverage comes from", "De dónde viene la cobertura"),
        T(
          "In Mexico, an employer must register employees with the IMSS, which opens its health services. In the US, coverage usually comes from an employer plan, a marketplace plan or a public program. Each system serves people in its own country.",
          "En México, el patrón debe inscribir a sus empleados en el IMSS, lo que abre sus servicios de salud. En EE. UU., la cobertura suele venir de un plan del empleador, un plan del mercado de seguros o un programa público. Cada sistema atiende a gente de su propio país."
        )
      ),
      tf("health_cover", T("Employers in Mexico register their employees with the IMSS.", "Los patrones en México inscriben a sus empleados en el IMSS."), true, T("The Social Security Law puts that duty on the employer.", "La Ley del Seguro Social pone esa obligación en el patrón.")),
      choice(
        "health_cover",
        T("Which is true about health coverage from a job in the US?", "¿Qué es cierto sobre la cobertura de salud por un trabajo en EE. UU.?"),
        [T("It usually comes from an employer plan, a marketplace plan or a public program", "Suele venir de un plan del empleador, un plan del mercado de seguros o un programa público"), T("The IMSS covers it automatically", "El IMSS la cubre automáticamente"), T("Every employer must offer a plan to all workers", "Todos los empleadores deben ofrecer un plan a todos los trabajadores")],
        0,
        T("The US has no single system tied to every job.", "EE. UU. no tiene un sistema único ligado a todos los empleos."),
        [null, T("The IMSS is Mexico's institution.", "El IMSS es la institución de México."), T("Only larger employers must offer coverage, and part-time workers can be left out.", "Solo los empleadores grandes deben ofrecer cobertura, y se puede excluir a quienes trabajan medio tiempo.")]
      )
    ),
    concept(
      "pension_credits",
      T("Credits and weeks", "Créditos y semanas"),
      card(
        T("Each country counts its own work", "Cada país cuenta su propio trabajo"),
        T(
          "US Social Security counts work in credits: {@usSsCredits} credits, about 10 years, qualify you for retirement benefits. Mexico's IMSS counts weeks of contributions. An agreement to count both together was signed in 2004, but it {@usMxSsaAgreementStatus}.",
          "El Seguro Social de EE. UU. cuenta el trabajo en créditos: {@usSsCredits} créditos, unos 10 años, te dan derecho a una pensión de retiro. El IMSS de México cuenta semanas de cotización. En 2004 se firmó un convenio para contar ambos juntos, pero {@usMxSsaAgreementStatus}."
        )
      ),
      tf("pension_credits", T("Work years in Mexico automatically count toward US Social Security.", "Los años de trabajo en México cuentan automáticamente para el Seguro Social de EE. UU."), false, T("The agreement that would combine them {@usMxSsaAgreementStatus}, so each system counts its own work.", "El convenio que los combinaría {@usMxSsaAgreementStatus}, así que cada sistema cuenta su propio trabajo.")),
      choice(
        "pension_credits",
        T("Someone has 5 years of US work and 9 in Mexico. How many of those years count toward US retirement benefits?", "Alguien tiene 5 años de trabajo en EE. UU. y 9 en México. ¿Cuántos de esos años cuentan para la pensión de retiro de EE. UU.?"),
        [T("The 5 US years", "Los 5 años de EE. UU."), T("All 14 years", "Los 14 años"), T("The 9 Mexican years", "Los 9 años de México")],
        0,
        T("Without a working agreement, US Social Security counts only work covered by the US system.", "Sin un convenio vigente, el Seguro Social de EE. UU. cuenta solo el trabajo cubierto por su sistema."),
        [null, T("That would need an agreement that combines the two systems.", "Eso requeriría un convenio que combine los dos sistemas."), T("Mexican work is counted by Mexico's system, not the US one.", "El trabajo en México lo cuenta el sistema de México, no el de EE. UU.")]
      )
    ),
    concept(
      "work_records",
      T("Records of your work", "Registros de tu trabajo"),
      card(
        T("A folder for later", "Una carpeta para después"),
        T(
          "Pay stubs, tax forms and benefit records show what you earned and paid into each system. A folder with copies lets you check your record, fix mistakes and prove your years of work.",
          "Los recibos de pago, las constancias de impuestos y los registros de prestaciones muestran lo que ganaste y aportaste a cada sistema. Una carpeta con copias te permite revisar tu historial, corregir errores y comprobar tus años de trabajo."
        )
      ),
      tf("work_records", T("A folder of pay records helps you check your history and fix mistakes later.", "Una carpeta con recibos de pago te ayuda a revisar tu historial y corregir errores después."), true, T("Records are your proof if an employer or an agency has an error.", "Los registros son tu prueba si un patrón o una oficina cometen un error.")),
      choice(
        "work_records",
        T("Where can you see how many weeks you've contributed to the IMSS?", "¿Dónde puedes ver cuántas semanas has cotizado al IMSS?"),
        [T("The IMSS constancia de semanas cotizadas", "La constancia de semanas cotizadas del IMSS"), T("A US W-2 form", "Un formulario W-2 de EE. UU."), T("A credit report", "Un reporte de crédito")],
        0,
        T("The constancia lists your weeks and your employers. It's free from the IMSS.", "La constancia lista tus semanas y tus patrones. Es gratis en el IMSS."),
        [null, T("A W-2 shows US pay and taxes, not IMSS weeks.", "Un W-2 muestra pago e impuestos de EE. UU., no semanas del IMSS."), T("A credit report tracks debts, not work weeks.", "Un reporte de crédito registra deudas, no semanas de trabajo.")]
      )
    )
  ],
  lessons: [
    {
      id: "borderwork-1",
      title: T("Who can work where", "Quién puede trabajar dónde"),
      life: T("Write down which paper shows you may work in each country, and who you'd ask if you're not sure.", "Anota qué papel muestra que puedes trabajar en cada país y a quién le preguntarías si no estás seguro."),
      steps: [
        card(
          T("Two job offers", "Dos ofertas de trabajo"),
          T(
            "Camila, a Mexican citizen, gets a job offer in El Paso. Her cousin Beto, a US citizen, gets one in Ciudad Juárez. Each country decides who may work there and which paper shows it. What do they check first?",
            "Camila, ciudadana mexicana, recibe una oferta de trabajo en El Paso. Su primo Beto, ciudadano de EE. UU., recibe una en Ciudad Juárez. Cada país decide quién puede trabajar ahí y qué papel lo demuestra. ¿Qué revisan primero?"
          )
        ),
        choice(
          "work_papers",
          T("Who checks that a new hire in the US may work there?", "¿Quién revisa que una persona recién contratada en EE. UU. puede trabajar ahí?"),
          [T("The employer, using Form I-9", "El empleador, con el formulario I-9"), T("The bank", "El banco"), T("Nobody checks", "Nadie lo revisa")],
          0,
          T("Every US employer completes a Form I-9 for every hire, to verify identity and permission to work.", "Todo empleador en EE. UU. llena un formulario I-9 por cada persona que contrata, para verificar identidad y permiso de trabajo."),
          [null, T("A bank checks accounts, not jobs.", "Un banco revisa cuentas, no empleos."), T("The law requires the employer to check and keep the form.", "La ley exige que el empleador revise y guarde el formulario.")]
        ),
        card(
          T("Where to ask", "Dónde preguntar"),
          T(
            "For your own case, ask a licensed attorney, an accredited representative or the agency itself. In the US a \"notario\" is not a lawyer, and anyone who promises papers for a fee is a warning sign. This unit explains how it works. It can't decide your case.",
            "Para tu caso, pregunta a un abogado con licencia, un representante acreditado o la propia agencia. En EE. UU. un \"notario\" no es abogado, y quien promete papeles a cambio de dinero es una señal de alerta. Esta unidad explica cómo funciona. No puede decidir tu caso."
          )
        ),
        scenario(
          "work_papers",
          T("A \"recruiter\" says he can fix your work papers fast, for a fee. What do you do?", "Un \"reclutador\" dice que arregla tus papeles de trabajo rápido, por una cuota. ¿Qué haces?"),
          [
            fit(T("Look for licensed legal help before paying anyone", "Buscas ayuda legal con licencia antes de pagarle a alguien"), "good", T("Only attorneys and accredited representatives can give legal advice.", "Solo abogados y representantes acreditados pueden dar asesoría legal.")),
            fit(T("Ask for his license, then decide", "Le pides su licencia y luego decides"), "ok", T("A fair start, but verify it with the licensing body.", "Es un buen inicio, pero verifícala con la autoridad que otorga licencias.")),
            fit(T("Pay half to hold your spot", "Le pagas la mitad para apartar tu lugar"), "poor", T("Paying first is how this scam works.", "Pagar primero es como funciona esta estafa."))
          ],
          T("Check who is allowed to help before any money moves.", "Revisa quién puede ayudarte antes de mover dinero.")
        ),
        tf("work_papers", T("A US employer can skip the Form I-9 for a worker who comes recommended.", "Un empleador de EE. UU. puede omitir el formulario I-9 si la persona viene recomendada."), false, T("All US employers must complete Form I-9 for every person they hire.", "Todo empleador de EE. UU. debe llenar el formulario I-9 por cada persona que contrata.")),
        act("goals.create", T("Make a goal for the small costs of getting papers in order: copies and trips.", "Crea una meta para los gastos pequeños de arreglar papeles: copias y traslados."), { name: { en: "Papers and appointments", es: "Papeles y citas" }, target: [150, 2500], months: 4 })
      ]
    },
    {
      id: "borderwork-2",
      title: T("Pay, overtime and deductions", "Pago, tiempo extra y descuentos"),
      life: T("On your next pay stub, find the hours, any overtime, and what was held back.", "En tu próximo recibo de pago, busca las horas, el tiempo extra y lo que se descontó."),
      steps: [
        card(
          T("Two cousins, two weeks", "Dos primos, dos semanas"),
          T(
            "Mateo earns {US$20} an hour in San Antonio and worked 45 hours this week. Lupe earns {MX$100} an hour in Monterrey and worked 3 overtime hours. Each country has its own overtime rules. What does Mateo's week pay?",
            "Mateo gana {US$20} por hora en San Antonio y trabajó 45 horas esta semana. Lupe gana {MX$100} por hora en Monterrey y trabajó 3 horas extra. Cada país tiene sus propias reglas de tiempo extra. ¿Cuánto paga la semana de Mateo?"
          )
        ),
        number(
          "pay_rules",
          T("Mateo is a covered hourly worker. Hours past 40 pay time and a half. What does his 45-hour week pay in dollars?", "Mateo es trabajador por hora con derecho a tiempo extra. Las horas después de 40 pagan una vez y media. ¿Cuántos dólares paga su semana de 45 horas?"),
          { unit: "number", answer: 950, tol: 0.5 },
          [T("40 × 20 = 800 dollars.", "40 × 20 = 800 dólares."), T("5 extra hours at 30 = 150 dollars.", "5 horas extra a 30 = 150 dólares."), T("800 + 150 = 950 dollars.", "800 + 150 = 950 dólares.")]
        ),
        card(
          T("Rules by country", "Reglas por país"),
          T(
            "In the US, covered hourly workers get time and a half past {@usOvertimeHours} hours a week. In Mexico the week is shrinking from {@mxWeekHours} to {@mxWeekHoursFinal} hours by 2030, and extra hours pay double, then triple past a limit. Both pay stubs show tax and social security deductions.",
            "En EE. UU., los trabajadores por hora con derecho a tiempo extra reciben una vez y media después de {@usOvertimeHours} horas a la semana. En México la semana baja de {@mxWeekHours} a {@mxWeekHoursFinal} horas para 2030, y las horas extra se pagan al doble y luego al triple pasado un límite. Ambos recibos muestran descuentos de impuestos y seguridad social."
          )
        ),
        choice(
          "pay_rules",
          T("A US boss says you signed away overtime, so none is owed. For a covered worker, is that right?", "Un jefe en EE. UU. dice que firmaste renunciar al tiempo extra, así que no te debe. Para un trabajador con derecho a él, ¿es correcto?"),
          [T("No. Overtime can't be waived by agreement", "No. No se puede renunciar al tiempo extra por acuerdo"), T("Yes. A signature settles it", "Sí. Una firma lo resuelve"), T("Yes, if the pay is high", "Sí, si el pago es alto")],
          0,
          T("The Department of Labor says covered workers' overtime can't be waived by agreement.", "El Departamento del Trabajo dice que el tiempo extra de quien tiene derecho a él no se puede renunciar por acuerdo."),
          [null, T("A signature doesn't cancel what the law requires.", "Una firma no cancela lo que exige la ley."), T("Pay level doesn't change the rule.", "El nivel de pago no cambia la regla.")]
        ),
        tf("pay_rules", T("In the US, overtime rules apply only to workers with US citizenship.", "En EE. UU., las reglas de tiempo extra solo aplican a quienes tienen ciudadanía estadounidense."), false, T("The Department of Labor says it enforces wage laws without regard to immigration status.", "El Departamento del Trabajo dice que hace cumplir las leyes de pago sin importar el estatus migratorio.")),
        act("goals.paycheck", T("Move the gross pay and see what you'd take home.", "Mueve el sueldo bruto y mira cuánto te llegaría."), { gross: [1600, 12000] })
      ]
    },
    {
      id: "borderwork-3",
      title: T("Health coverage and benefits", "Cobertura de salud y prestaciones"),
      life: T("Ask a new employer who offers health coverage, when it starts and what it costs you.", "Pregunta a un empleador nuevo quién ofrece cobertura de salud, cuándo empieza y cuánto te cuesta."),
      steps: [
        card(
          T("Two jobs, two systems", "Dos empleos, dos sistemas"),
          T(
            "Sofía works in Monterrey. Her employer registered her with the IMSS, so she can use its clinics. Her brother Iker works in Phoenix, and his coverage comes from a plan his employer offers. Whose job was it to register Sofía?",
            "Sofía trabaja en Monterrey. Su patrón la inscribió en el IMSS, así que puede usar sus clínicas. Su hermano Iker trabaja en Phoenix y su cobertura viene de un plan que ofrece su empleador. ¿A quién le tocaba inscribir a Sofía?"
          )
        ),
        choice(
          "health_cover",
          T("Whose job is it to register a worker with the IMSS?", "¿A quién le toca inscribir a un trabajador en el IMSS?"),
          [T("The employer's", "Al patrón"), T("The worker's alone", "Solo al trabajador"), T("The consulate's", "Al consulado")],
          0,
          T("The Social Security Law makes the employer register workers with the IMSS.", "La Ley del Seguro Social obliga al patrón a inscribir a los trabajadores en el IMSS."),
          [null, T("Workers can ask the IMSS to register them, but the duty is the employer's.", "El trabajador puede pedirle al IMSS que lo inscriba, pero la obligación es del patrón."), T("A consulate doesn't register people for IMSS.", "Un consulado no inscribe a las personas en el IMSS.")]
        ),
        card(
          T("What each side offers", "Qué ofrece cada lado"),
          T(
            "The IMSS covers sickness and maternity, work injuries, disability and life, retirement and childcare. In the US, employers with about {@usLargeEmployer} or more full-time-equivalent workers must offer coverage or may owe a payment. Smaller employers don't have to.",
            "El IMSS cubre enfermedades y maternidad, riesgos de trabajo, invalidez y vida, retiro y guarderías. En EE. UU., los empleadores con unos {@usLargeEmployer} o más trabajadores de tiempo completo, contando equivalentes, deben ofrecer cobertura o pueden deber un pago. Los más pequeños no tienen que hacerlo."
          )
        ),
        match(
          "health_cover",
          T("Match each to what it is.", "Une cada uno con lo que es."),
          [
            [T("IMSS", "IMSS"), T("Mexico's social security institute for private-sector workers", "El instituto de seguridad social de México para trabajadores del sector privado")],
            [T("Employer plan", "Plan del empleador"), T("US coverage offered through a job", "Cobertura en EE. UU. que ofrece un empleo")],
            [T("Marketplace plan", "Plan del mercado de seguros"), T("US coverage you buy yourself", "Cobertura en EE. UU. que compras por tu cuenta")]
          ],
          T("Where the coverage comes from tells you who to ask.", "De dónde viene la cobertura te dice a quién preguntarle.")
        ),
        tf("health_cover", T("Every US employer must offer health coverage to every worker.", "Todo empleador de EE. UU. debe ofrecer cobertura de salud a todos sus trabajadores."), false, T("Only larger employers must offer it, and part-time workers can be left out.", "Solo los empleadores grandes deben ofrecerla, y se puede excluir a quienes trabajan medio tiempo.")),
        act("goals.insurance", T("Compare a low-premium plan and a low-deductible plan.", "Compara un plan de prima baja con uno de deducible bajo."))
      ]
    },
    {
      id: "borderwork-4",
      title: T("Two pension systems", "Dos sistemas de pensión"),
      life: T("Count your own years of work in each country, and write them in two separate lists.", "Cuenta tus años de trabajo en cada país y anótalos en dos listas separadas."),
      steps: [
        card(
          T("Fourteen years of work", "Catorce años de trabajo"),
          T(
            "Rosa worked 6 years in the US and 8 in Mexico. US Social Security counts credits, and {@usSsCredits} credits, about 10 years, qualify you for retirement benefits. Mexico's IMSS counts weeks. The two countries signed an agreement in 2004 to count both, but it {@usMxSsaAgreementStatus}.",
            "Rosa trabajó 6 años en EE. UU. y 8 en México. El Seguro Social de EE. UU. cuenta créditos, y {@usSsCredits} créditos, unos 10 años, dan derecho a una pensión de retiro. El IMSS de México cuenta semanas. Los dos países firmaron en 2004 un convenio para contar ambos, pero {@usMxSsaAgreementStatus}."
          )
        ),
        choice(
          "pension_credits",
          T("How is Rosa's work counted?", "¿Cómo se cuenta el trabajo de Rosa?"),
          [T("Each system counts only the work covered by its own rules", "Cada sistema cuenta solo el trabajo cubierto por sus reglas"), T("Both count all 14 years", "Los dos cuentan los 14 años"), T("Only the first country she worked in counts", "Solo cuenta el primer país donde trabajó")],
          0,
          T("Without a working agreement, her 6 US years sit in the US system and her 8 Mexican years in Mexico's.", "Sin un convenio vigente, sus 6 años en EE. UU. quedan en el sistema de EE. UU. y sus 8 años en México en el de México."),
          [null, T("That would need an agreement that combines the systems.", "Eso requeriría un convenio que combine los sistemas."), T("Each system counts the work its own rules cover, whenever it was done.", "Cada sistema cuenta el trabajo que cubren sus reglas, sin importar cuándo se hizo.")]
        ),
        card(
          T("What a deal would do", "Qué haría un convenio"),
          T(
            "A totalization agreement lets a worker add credits from both countries to qualify, then each country pays a share for the years worked in its own system. The US requires at least six quarters of US work to use one. Check the SSA's list for this agreement's status.",
            "Un convenio de totalización permite sumar créditos de ambos países para calificar, y luego cada país paga una parte por los años trabajados en su sistema. EE. UU. exige al menos seis trimestres de trabajo en EE. UU. para usarlo. Consulta la lista del SSA para ver el estado de este convenio."
          )
        ),
        tf("pension_credits", T("With a working agreement, each country would pay a share based on work done in its own system.", "Con un convenio vigente, cada país pagaría una parte según el trabajo hecho en su propio sistema."), true, T("The benefit is prorated, so each country pays for its own part.", "El beneficio se prorratea, así que cada país paga su parte.")),
        number(
          "pension_credits",
          T("A US worker earns the most credits possible each year, four. How many years of work to reach {@usSsCredits} credits?", "Un trabajador en EE. UU. gana el máximo de créditos al año, cuatro. ¿Cuántos años de trabajo para llegar a {@usSsCredits} créditos?"),
          { unit: "number", answer: 10, tol: 0.5 },
          [T("{@usSsCredits} credits ÷ 4 a year.", "{@usSsCredits} créditos ÷ 4 al año."), T("10 years.", "10 años.")]
        ),
        act("goals.retire", T("See how contributions grow by age {@retirementAge}.", "Mira cómo crecen las aportaciones a los {@retirementAge}."), { monthly: [100, 1500], extraPct: [0, 0], age: 22, voluntary: true })
      ]
    },
    {
      id: "borderwork-5",
      title: T("Keeping records for later", "Guardar tus registros para después"),
      life: T("Start a folder, paper or digital, with one pay record from each job you've had.", "Empieza una carpeta, de papel o digital, con un recibo de pago de cada trabajo que has tenido."),
      steps: [
        card(
          T("The shoebox problem", "El problema de la caja de zapatos"),
          T(
            "Tomás worked in Tucson for years, then in Hermosillo. Now he wants to know what he has built up in each country. His US pay stubs are gone and he can't recall his numbers. What would have helped him most?",
            "Tomás trabajó años en Tucson y luego en Hermosillo. Ahora quiere saber qué ha acumulado en cada país. Se le perdieron los recibos de pago de EE. UU. y no recuerda sus números. ¿Qué le habría ayudado más?"
          )
        ),
        choice(
          "work_records",
          T("What would have helped Tomás most?", "¿Qué le habría ayudado más a Tomás?"),
          [T("A folder with pay stubs, tax forms and his numbers from each country", "Una carpeta con recibos, constancias de impuestos y sus números de cada país"), T("Remembering his employers' names", "Acordarse de los nombres de sus patrones"), T("A letter from a coworker", "Una carta de un compañero")],
          0,
          T("Records show what he earned and paid into each system, and they're his proof.", "Los registros muestran lo que ganó y aportó a cada sistema, y son su prueba."),
          [null, T("Names help, but they don't show earnings or weeks.", "Los nombres ayudan, pero no muestran ingresos ni semanas."), T("A coworker's letter isn't a record of his pay.", "La carta de un compañero no es un registro de su pago.")]
        ),
        card(
          T("What to keep", "Qué guardar"),
          T(
            "US: pay stubs, W-2 forms and your Social Security statement. Mexico: recibos de nómina, your NSS and the IMSS constancia de semanas cotizadas, free with your CURP and NSS. Keep copies in two places, and don't share these numbers with strangers.",
            "EE. UU.: recibos de pago, formularios W-2 y tu estado de cuenta del Seguro Social. México: recibos de nómina, tu NSS y la constancia de semanas cotizadas del IMSS, gratis con tu CURP y tu NSS. Guarda copias en dos lugares y no compartas estos números con desconocidos."
          )
        ),
        order(
          "work_records",
          T("Put these steps in order to build your folder.", "Pon estos pasos en orden para armar tu carpeta."),
          [T("List every employer and country", "Anota cada patrón y país"), T("Find your own ID numbers", "Encuentra tus propios números de identificación"), T("Collect pay stubs and tax forms", "Junta recibos de pago y constancias de impuestos"), T("Get your Social Security statement and IMSS constancia", "Consigue tu estado del Seguro Social y la constancia del IMSS"), T("Store copies in two safe places", "Guarda copias en dos lugares seguros")],
          T("You need the list before you can collect what belongs on it.", "Necesitas la lista antes de juntar lo que va en ella.")
        ),
        tf("work_records", T("You can check your IMSS weeks online with your CURP and NSS.", "Puedes revisar tus semanas del IMSS en línea con tu CURP y tu NSS."), true, T("The constancia is free and lists your weeks and your employers.", "La constancia es gratis y lista tus semanas y tus patrones.")),
        act("goals.create", T("Make a goal for the small costs of copies, a folder and trips to offices.", "Crea una meta para los gastos pequeños de copias, una carpeta y traslados a oficinas."), { name: { en: "Records folder", es: "Carpeta de registros" }, target: [50, 900], months: 2 })
      ]
    }
  ]
};
