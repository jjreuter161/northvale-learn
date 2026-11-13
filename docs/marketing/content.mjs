// The words on the printed flyer and the "about" sheet, in English and Spanish. build.mjs turns these into PDFs;
// test/marketing.test.mjs checks the facts in them (lesson counts, the promise, English and Spanish matching).
// Only say things that are true today. No user counts, no testimonials, no results. See README.md.

export const PROMISE = {
  en: "No ads. We never sell your data. Nobody pays us to recommend anything.",
  es: "Sin anuncios. Nunca vendemos tus datos. Nadie nos paga por recomendar nada.",
};

export const COPY = {
  en: {
    lang: "en",
    page: "welcome",
    pill: "Free beta · Ages 13 and up",
    h1: "The calm, bilingual money app for young people whose lives cross the border.",
    tagline: "Find your open water.",
    points: [
      ["Four-minute lessons", "63 short lessons in 18 units: budgeting, your first paycheck, credit, scams, taxes and investing basics."],
      ["Both sides of the border", "Dollars and pesos, FDIC and IPAB, 401(k) and AFORE, in English or Spanish."],
      ["Pretend money only", "Practice with a pretend portfolio. No real money moves and no bank connections."],
      ["Plain-words help", "Ask the AI tutor to explain a term or a headline. It never tells you what to buy."],
    ],
    scan: "Scan to join the free beta",
    teachers: "Teachers and clubs: classroom mode is a small test with invited teachers. Scan, then choose “Join as a teacher.”",
    built: "Built by a student, for students.",
    fine: "Educational only. Not financial advice. No real money moves in the app.",
    about: {
      title: "About Northvale Learn",
      lead: "A calm, bilingual app for learning how money works. Made for young people whose lives cross the US–Mexico border, and useful to anyone 13 and up.",
      what: ["What it is", "Northvale Learn is a free beta app that teaches money in four-minute lessons, in English or Spanish. You set a goal, learn what it takes, and practice with pretend money. Nothing in it moves real money."],
      who: ["Who it's for", [
        "Teens 13–17: the basics before the money gets real. An account needs a parent's or guardian's OK.",
        "Young adults with a first paycheck, a first card or a first investment.",
        "Families, teachers and clubs who want a calm place: no ads, nothing to buy.",
      ]],
      why: ["Why it's different", [
        ["Built for two countries.", "Every lesson has a US and a Mexico version: dollars or pesos, FDIC or IPAB, 401(k) or AFORE. Choose “Both” to see them together."],
        ["Made for the border.", "Exchange rates, what sending money costs, accounts and cards in two countries, and credit when you move."],
        ["Easy to start.", "Open it and answer a first question in three taps. No sign-up; an account is optional."],
      ]],
      promiseTitle: "The promise",
      promiseNote: "It's written in the app too: Me, then Our promise.",
      isnt: ["What it isn't", [
        "Not a bank or a broker. No real money or bank connections.",
        "Not advice. Lessons explain how money works and never say what to buy or sell.",
        "Not finished. It's a small beta. Every screen has a feedback button, and every message is read.",
      ]],
      teachers: ["Teachers and clubs", "Classroom mode is a small test with invited teachers. Students join with a class code and a nickname, no email. Teachers see lesson progress, never goals, amounts or notes. No messaging of any kind."],
      story: ["Built by a student, for students", "Made by a student who wanted a calm place to learn about money: no ads, no pressure, no jargon."],
      glance: ["At a glance", [
        ["Price", "Free beta"], ["Ages", "13 and up"], ["Languages", "English, Spanish"], ["Countries", "United States, Mexico"],
        ["Lessons", "63 lessons, 18 units"], ["Account", "Optional"],
      ]],
      scan: "Scan to join the free beta",
      fine: "Educational only. Not financial advice. No real money moves in the app.",
    },
  },
  es: {
    lang: "es",
    page: "bienvenida",
    pill: "Beta gratis · Mayores de 13 años",
    h1: "La app de dinero, tranquila y bilingüe, para jóvenes cuya vida cruza la frontera.",
    tagline: "Rumbo a mar abierto.",
    points: [
      ["Lecciones de cuatro minutos", "63 lecciones cortas en 18 unidades: presupuesto, tu primer sueldo, crédito, fraudes, impuestos y lo básico de invertir."],
      ["Los dos lados de la frontera", "Pesos y dólares, IPAB y FDIC, AFORE y 401(k), en español o en inglés."],
      ["Solo dinero de práctica", "Practica con un portafolio de práctica. No se mueve dinero real ni se conecta ningún banco."],
      ["Ayuda con palabras sencillas", "Pídele al tutor con IA que te explique un término o una noticia. Nunca te dice qué comprar."],
    ],
    scan: "Escanea para unirte a la beta gratis",
    teachers: "Docentes y clubes: el modo de clase es una prueba pequeña con docentes invitados. Escanea y elige “Unirme como docente”.",
    built: "Hecha por un estudiante, para estudiantes.",
    fine: "Solo con fines educativos. No es asesoría financiera. En la app no se mueve dinero real.",
    about: {
      title: "Acerca de Northvale Learn",
      lead: "Una app tranquila y bilingüe para aprender cómo funciona el dinero. Hecha para jóvenes cuya vida cruza la frontera entre México y Estados Unidos, y útil para cualquiera de 13 años en adelante.",
      what: ["Qué es", "Northvale Learn es una app gratuita en beta que enseña de dinero en lecciones de cuatro minutos, en español o en inglés. Te pones una meta, aprendes lo que se necesita y practicas con dinero de práctica. Nada en ella mueve dinero real."],
      who: ["Para quién es", [
        "Adolescentes de 13 a 17 años: lo básico antes de que el dinero sea de verdad. Crear una cuenta requiere el permiso de su mamá, papá o tutor.",
        "Jóvenes adultos con su primer sueldo, su primera tarjeta o su primera inversión.",
        "Familias, docentes y clubes que buscan un lugar tranquilo: sin anuncios y sin nada que comprar.",
      ]],
      why: ["Qué la hace distinta", [
        ["Hecha para dos países.", "Cada lección tiene versión de México y de EE. UU.: pesos o dólares, IPAB o FDIC, AFORE o 401(k). Elige “Ambos” para verlas juntas."],
        ["Pensada para la frontera.", "Tipos de cambio, cuánto cuesta enviar dinero, cuentas y tarjetas en dos países y crédito cuando te mudas."],
        ["Fácil de empezar.", "Ábrela y contesta una primera pregunta en tres toques. Sin registro; la cuenta es opcional."],
      ]],
      promiseTitle: "La promesa",
      promiseNote: "También está escrita en la app: Yo, y luego Nuestra promesa.",
      isnt: ["Lo que no es", [
        "No es un banco ni una casa de bolsa. Sin dinero real ni conexión a bancos.",
        "No es asesoría. Las lecciones explican cómo funciona el dinero y nunca dicen qué comprar o vender.",
        "No está terminada. Es una beta pequeña. Cada pantalla tiene un botón de comentarios y se lee cada mensaje.",
      ]],
      teachers: ["Docentes y clubes", "El modo de clase es una prueba pequeña con docentes invitados. Los estudiantes entran con un código y un apodo, sin correo. Los docentes ven el avance en las lecciones, nunca metas, montos ni notas. Sin mensajes de ningún tipo."],
      story: ["Hecha por un estudiante, para estudiantes", "La hace un estudiante que quería un lugar tranquilo para aprender de dinero: sin anuncios, sin presión y sin tecnicismos."],
      glance: ["De un vistazo", [
        ["Precio", "Beta gratis"], ["Edad", "13 años en adelante"], ["Idiomas", "Español, inglés"], ["Países", "México, Estados Unidos"],
        ["Lecciones", "63 lecciones, 18 unidades"], ["Cuenta", "Opcional"],
      ]],
      scan: "Escanea para unirte a la beta gratis",
      fine: "Solo con fines educativos. No es asesoría financiera. En la app no se mueve dinero real.",
    },
  },
};
