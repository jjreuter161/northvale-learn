# A free school pilot: 2 to 4 weeks with one class

What this is for: trying Northvale Learn with one real class, so we learn whether it works in school and have honest proof to show the next school. Free for the school. Classroom mode stays off for everyone else (`server/flags.js`). The plan behind it: `docs/SCHOOL-PLAN.md`. The printable guide for the teacher: `/teacher-guide.html` (Spanish: `/guia-docente.html`).

**Before any real student joins,** the items marked ⚖ need a lawyer or the school to check them (the private compliance notes, "School pilot").

## 1. Before the pilot (about a week ahead)

**The teacher and the school**
- ☐ A teacher you trust, who teaches students aged 13 or older (classes refuse anyone under 13).
- ☐ ⚖ The school's OK, in writing (an email is fine), following its own rules for student apps. Some schools or districts need a signed data-privacy agreement first; a lawyer prepares that.
- ☐ The teacher reads the teacher terms (in the app, on the teacher setup screen) and the teacher guide.
- ☐ The teacher agrees to:
  - use the class only for teaching;
  - let students use nicknames, never full names;
  - not collect names, emails, phone numbers, photos or birthdays through the app;
  - keep what they see inside the school;
  - send the parent note below (or the school's own) before the first lesson;
  - let us quote them only with their written permission.
- ☐ Agree on the dates, the units (for example Budgeting, Saving and Banking for real) and one 10–15 minute slot a week.

**On our side**
- ☐ Turn classroom mode on for the teacher's email: on the admin page (`/admin`, Feature switches), or in the host's `.env` (`CLASSROOM_TESTERS`, comma-separated). It works before the teacher has an account: it applies when they sign up with that email. It stays off for everyone else. (To try it at home first: `npm run home-test -- --teacher you@example.com`.)
- ☐ Send the teacher the tester link: the app's address with `?school=on` at the end. It shows the choice "I'm a student / I'm a teacher" on that device.
- ☐ The teacher sets up their account ("I'm a teacher"), confirms their email, and names the class.
- ☐ In the class, under **Pilot quiz**, the teacher picks the pilot's units (up to 4). The quiz is up to 10 questions, the same before and after.
- ☐ Check on a phone and a school computer that the class code works (Join a class).
- ☐ ⚖ The parent note is sent (below), in the language families read.

## 2. A note for parents and guardians

Send it through the school's usual channel, a few days before the first lesson. Fill in the brackets.

**English**

> Dear families,
>
> Our class [class name] will try **Northvale Learn** for [number] weeks, starting [date]. It's a free app with short lessons about money: budgeting, saving, banking and avoiding scams. It uses pretend money only and gives no financial advice.
>
> - Students join our class with a **nickname**. No email or account is needed.
> - As the teacher, I see which lessons each student finishes. I never see their personal goals, amounts, notes, questions to the app's tutor, age or email.
> - At the start and at the end there's a short quiz. I see only the class's totals, never a student's score. At the end, students answer three quick questions about the app; anything they type goes only to the Northvale team, without their nickname.
> - There are no ads and no messages, and student information is never sold or shared.
> - Students can leave the class at any time and keep their own progress. If they'd like to use the app at home too, they can make a free account; for anyone under 18, a parent or guardian says OK first.
>
> Questions or concerns? Reply to this message, or write to [teacher's school email].
>
> [Teacher's name], [school]

**Español**

> Estimadas familias:
>
> Nuestro grupo [nombre de la clase] va a probar **Northvale Learn** durante [número] semanas, a partir del [fecha]. Es una app gratuita con lecciones cortas sobre dinero: presupuesto, ahorro, bancos y cómo evitar fraudes. Solo usa dinero de práctica y no da asesoría financiera.
>
> - Cada estudiante se une a la clase con un **apodo**. No necesita correo ni cuenta.
> - Como docente, veo qué lecciones termina cada estudiante. Nunca veo sus metas personales, cantidades, notas, preguntas al tutor de la app, edad ni correo.
> - Al principio y al final hay un cuestionario corto. Solo veo los totales del grupo, nunca el resultado de cada quien. Al final, responden tres preguntas rápidas sobre la app; lo que escriban solo lo lee el equipo de Northvale, sin su apodo.
> - No hay anuncios ni mensajes, y la información de estudiantes nunca se vende ni se comparte.
> - Pueden salirse de la clase cuando quieran y conservan su propio avance. Si quieren usar la app también en casa, pueden crear una cuenta gratis; para menores de 18, primero da el OK su mamá, papá o tutor.
>
> ¿Dudas o comentarios? Respondan a este mensaje o escriban a [correo de la escuela del docente].
>
> [Nombre del docente], [escuela]

## 3. The timeline (4 weeks; for 2 weeks, do weeks 1 and 4)

| When | In class (10–15 min) | At home (optional) |
|---|---|---|
| Week 1, day 1 | Students join with the code (5 min). The teacher opens the **before quiz**; everyone takes it (about 5 min); the teacher closes it. The first Budgeting lesson together. | Budgeting |
| Week 2 | Look at the class list together (who has started Saving?). | Saving |
| Week 3 | Banking: what a fee looks like (no personal accounts). | Banking for real |
| Week 4, last day | The teacher opens the **after quiz**; everyone takes it; then the three questions about the pilot. The teacher closes the quiz and reads the totals with the class. | — |
| After | The teacher ends the class (Class settings); it's deleted 90 days later. A short conversation with the teacher (below). | |

## 4. Running the quizzes

- **Pick the units first** (the teacher's class page, Pilot quiz). Once anyone has taken a quiz, the units are locked, so before and after stay the same questions.
- **Before:** tap *Open the before quiz*. Students see "Class quiz" in Classes; it asks one question at a time and shows only their own score at the end. Tap *Close the quiz* when everyone's done.
- **After:** tap *Open the after quiz* on the last day. When a student finishes it, they're asked three quick questions about the pilot, with an optional box for anything that was confusing.
- **What the teacher sees:** how many took each quiz, the average before and after, the change in points, the share right for each question, and the totals of the three questions. Nothing appears until 3 or more students have answered, and there are never per-student scores.
- **What students type** at the end goes only to the owner (admin page, "Pilot comments from students"), with the class's name and the day, never a nickname.
- A student who missed the before quiz can still take the after quiz; the totals simply include fewer students before.

## 5. The proof to collect

All of it is class-level; nothing that identifies a student leaves the class.

- ☐ **Quiz totals:** a screenshot of the Pilot quiz card at the end (before, after, change, by question).
- ☐ **What students said:** the totals of the three questions (same card), and the typed comments from the admin page. Read them for patterns; quote one only if it identifies no one.
- ☐ **How much was used:** the class list at the end (how many lessons the class finished; a screenshot with nicknames stays private).
- ☐ **A teacher quote, with permission:** ask the three questions below, write the answer down, and get the teacher's written OK (an email: "Yes, you can quote this, with my name and school" or "without my name") before using it anywhere.
  1. What did your students get out of it?
  2. What would you change before using it again?
  3. Would you use it with another class? Why or why not?
- ☐ Store the screenshots and the teacher's OK in the private notes, not in this repository (it's public).

## 6. What can go wrong, and what to do

- **A student lost their device:** with an account, they sign in on the new one and the class comes with them; without one, they join again with a new nickname, and the teacher removes the old entry (Class settings).
- **The code is shared outside the class:** the teacher makes a new code (Class settings); the old one stops working. Turn off "Taking new students" once everyone's in.
- **A parent asks for their child's data to be deleted:** the student leaves the class (or the teacher removes them); with an account, Settings, Privacy, Delete my data removes everything (backups age out within 14 days).
- **The quiz units were wrong:** if nobody has taken a quiz yet, change them; afterwards, they stay (so before and after are comparable).
