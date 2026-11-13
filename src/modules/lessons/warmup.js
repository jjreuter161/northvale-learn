// THE WARM-UP — the first thing after "Get started": one real question, no
// account, no sign-up, nothing to read first (about 10 seconds). It's the
// idea of the first lesson ("pay yourself first"), so the answer is the start
// of what comes next. Same shape as a lesson's choice question.
import { T } from "./units/helpers.js";

export const WARMUP = {
  type: "choice",
  q: T("You get {$400|6000} today and want to save some. What's a good first move?", "Hoy te llegan {$400|6000} y quieres ahorrar algo. ¿Qué conviene hacer primero?"),
  options: [
    T("Set some aside right away, then spend the rest", "Apartar algo de inmediato y gastar el resto"),
    T("Spend first and save whatever is left", "Gastar primero y ahorrar lo que sobre"),
    T("Wait until the end of the month to decide", "Esperar a fin de mes para decidir"),
  ],
  answer: 0,
  why: T("Saving first works because the money is already safe before you can spend it. What's left is yours to enjoy.", "Ahorrar primero funciona porque el dinero ya está a salvo antes de que puedas gastarlo. Lo que queda es para disfrutar."),
  miss: [null, T("There's often nothing left at the end. Saving first protects it.", "Muchas veces no sobra nada al final. Ahorrar primero lo protege."), T("Waiting makes it easy to spend it all. A plan before the money arrives works better.", "Esperar hace fácil gastarlo todo. Un plan antes de que llegue el dinero funciona mejor.")],
};
