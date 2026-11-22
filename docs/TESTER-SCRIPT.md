# Tester script: 10 minutes with a new person

What this is for: to watch one real person use Northvale Learn for the first time and write down where they hesitate. A script can check that buttons work; only a person can tell you whether the app makes sense. Use the English or the Spanish half, whichever the tester is more at home in. (Español abajo.)

---

## English

### Before they start (2 minutes, without the tester)

1. On your computer, in the project folder, run `npm run home-test`. It builds the latest version and prints an address such as `http://192.168.1.20:8960`. Phones on the **same Wi-Fi** can open it while the command runs. Press Ctrl+C when you are done; nothing stays open.
2. Open the address on the tester's phone yourself first. Go to Me, then Settings: at the bottom, the version line ("Version …, built …") should show today's date: then you know the phone has the latest build. If it shows an older day, close the tab and open the address again.
3. Clear the practice data so they start as new: in Settings, choose "Reset all progress", then "Erase and start over" (or run `npm run home-test -- --fresh` instead in step 1).
4. Have a sheet of paper for notes, or copy the table at the end of this page.

Good to know:
- The AI tutor is in offline mode during a home test (no key is used). Ask still answers common words from its glossary. That is expected, not a bug.
- If the tester is under 18, ask a parent or guardian first. Do not ask for their real name, email or any money details: the app never needs them, and neither do you.

### What to say (read it out, word for word)

> "This is an app for learning about money. I didn't make it to test you; I'm testing the app. There are no wrong moves. Please say out loud what you're thinking as you go, even small things like 'I don't know where to tap'. I'll stay quiet and won't help, because I want to see where the app needs to do better. If you get really stuck, tell me and we'll move on."

Then stay quiet. Do not point, do not explain, do not say "almost". If they ask you something, say "What would you try?"

### The tasks (about 10 minutes)

Read each one out only when the last one is done. Time each one roughly.

| # | Say this | About | Done when |
|---|---|---|---|
| 1 | "Open the app and set it up for yourself." | 1 min | They are on Today with a lesson ready |
| 2 | "Do your first lesson, all the way to the end." | 4 min | They reach "Lesson complete" and go back to Today |
| 3 | "You picked something you're saving for. Find it, and give it an amount and a date." | 2 min | A goal with an amount and date shows on Goals |
| 4 | "Pick a money word you'd like explained, and ask the app about it." | 1 min | They have read an answer in Ask |
| 5 | "Switch the app to Spanish, then back to English." (in Spanish: the other way round) | 1 min | It is back in their language |
| 6 | "Show me where you'd go tomorrow to keep learning." | 30 s | They point at the next lesson |

### What to watch for (write these down, with the time)

- **Hesitation:** more than about 5 seconds without tapping anything. Where were they looking?
- **Wrong taps:** tapping something that is not a button, or the wrong button. What did they expect?
- **Getting lost:** pressing the phone's Back and leaving the app, or saying "how do I get back?".
- **Reading:** do they read the lesson cards, skim them, or skip them? Do they look bored or interested?
- **Words:** any word they ask about or read twice ("APY", "streak freeze", "XP").
- **The first question:** do they understand that they pick an answer and then press Check?
- **The goal:** do they find their goal without help? Do they understand amount and date?
- **Anything broken:** a blank screen, text cut off, a button that does nothing, an error message. Note what they had just done.
- **Mood:** sighs, smiles, "oh, nice", "huh?". These matter as much as the times.

### Five questions after (ask exactly these, and write down their words)

1. "In one sentence, what is this app for?"
2. "What was the most confusing moment?"
3. "The lesson: too easy, about right, or too hard? Too long, about right, or too short?"
4. "Would you open it again tomorrow? Why, or why not?"
5. "If you could change one thing, what would it be?"

Thank them. Do not defend the app or explain what they "should" have done; just write it down.

### Notes table

| Task | Time taken | Hesitated at | Wrong taps | Said out loud | Broken? |
|---|---|---|---|---|---|
| 1 Set up | | | | | |
| 2 First lesson | | | | | |
| 3 Goal | | | | | |
| 4 Ask | | | | | |
| 5 Language | | | | | |
| 6 Tomorrow | | | | | |

Answers: 1 ______ 2 ______ 3 ______ 4 ______ 5 ______

Afterwards, add a short line per tester to `docs/USABILITY-AUDIT.md` (a "Real testers" section): who (age range only), phone, and the three most important notes.

---

## Español

### Antes de empezar (2 minutos, sin la persona)

1. En tu computadora, en la carpeta del proyecto, corre `npm run home-test`. Prepara la versión más reciente y muestra una dirección como `http://192.168.1.20:8960`. Los teléfonos en la **misma red Wi-Fi** pueden abrirla mientras el comando esté corriendo. Presiona Ctrl+C al terminar; nada se queda abierto.
2. Abre tú primero la dirección en el teléfono de la persona. Ve a Yo y luego a Ajustes: hasta abajo, la línea de versión debe decir la fecha de hoy: así sabes que el teléfono tiene la versión más reciente. Si dice un día anterior, cierra la pestaña y vuelve a abrir la dirección.
3. Borra los datos de práctica para que empiece desde cero: en Ajustes, elige "Reiniciar todo el progreso" y luego "Borrar y empezar de nuevo" (o en el paso 1 corre `npm run home-test -- --fresh`).
4. Ten una hoja para notas, o copia la tabla del final.

Bueno saber:
- El tutor con IA está en modo sin conexión durante la prueba en casa (no se usa ninguna clave). Preguntar sigue respondiendo palabras comunes con su glosario. Es lo esperado, no un error.
- Si la persona tiene menos de 18 años, pide permiso a su mamá, papá o tutor. No le pidas su nombre real, correo ni datos de dinero: la app nunca los necesita, y tú tampoco.

### Qué decir (léelo en voz alta, tal cual)

> "Esta es una app para aprender sobre dinero. No te voy a evaluar a ti; estoy probando la app. No hay movimientos equivocados. Por favor di en voz alta lo que vas pensando, aunque sean cosas pequeñas como 'no sé dónde tocar'. Me voy a quedar callado y no te voy a ayudar, porque quiero ver dónde la app tiene que mejorar. Si de verdad te atoras, dime y pasamos a lo siguiente."

Después, quédate en silencio. No señales, no expliques, no digas "ya casi". Si te pregunta algo, responde: "¿Qué intentarías?"

### Las tareas (unos 10 minutos)

Lee cada una solo cuando termine la anterior. Toma el tiempo de forma aproximada.

| # | Di esto | Aprox. | Termina cuando |
|---|---|---|---|
| 1 | "Abre la app y configúrala para ti." | 1 min | Está en Hoy con una lección lista |
| 2 | "Haz tu primera lección, hasta el final." | 4 min | Llega a "Lección completa" y vuelve a Hoy |
| 3 | "Elegiste algo para lo que estás ahorrando. Encuéntralo y ponle un monto y una fecha." | 2 min | En Metas aparece una meta con monto y fecha |
| 4 | "Elige una palabra de dinero que quieras que te expliquen y pregúntale a la app." | 1 min | Leyó una respuesta en Preguntar |
| 5 | "Cambia la app a inglés y luego regrésala a español." | 1 min | Está otra vez en su idioma |
| 6 | "Enséñame a dónde irías mañana para seguir aprendiendo." | 30 s | Señala la siguiente lección |

### Qué observar (anótalo, con la hora)

- **Dudas:** más de unos 5 segundos sin tocar nada. ¿A dónde estaba mirando?
- **Toques equivocados:** tocar algo que no es un botón, o el botón equivocado. ¿Qué esperaba?
- **Perderse:** usar el botón Atrás del teléfono y salirse de la app, o decir "¿cómo regreso?".
- **Lectura:** ¿lee las tarjetas de la lección, las ve por encima o se las salta? ¿Se ve aburrido o interesado?
- **Palabras:** cualquier palabra por la que pregunte o que lea dos veces ("rendimiento", "protector de racha", "XP").
- **La primera pregunta:** ¿entiende que elige una respuesta y luego toca Comprobar?
- **La meta:** ¿encuentra su meta sin ayuda? ¿Entiende monto y fecha?
- **Algo roto:** una pantalla en blanco, texto cortado, un botón que no hace nada, un mensaje de error. Anota qué acababa de hacer.
- **Ánimo:** suspiros, sonrisas, "ah, qué bien", "¿eh?". Importan tanto como los tiempos.

### Cinco preguntas al final (haz exactamente estas y anota sus palabras)

1. "En una frase, ¿para qué es esta app?"
2. "¿Cuál fue el momento más confuso?"
3. "La lección: ¿muy fácil, bien o muy difícil? ¿Muy larga, bien o muy corta?"
4. "¿La volverías a abrir mañana? ¿Por qué sí o por qué no?"
5. "Si pudieras cambiar una sola cosa, ¿cuál sería?"

Dale las gracias. No defiendas la app ni le expliques lo que "debía" hacer; solo anótalo.

### Tabla de notas

| Tarea | Tiempo | Dudó en | Toques equivocados | Lo que dijo | ¿Algo roto? |
|---|---|---|---|---|---|
| 1 Configurar | | | | | |
| 2 Primera lección | | | | | |
| 3 Meta | | | | | |
| 4 Preguntar | | | | | |
| 5 Idioma | | | | | |
| 6 Mañana | | | | | |

Respuestas: 1 ______ 2 ______ 3 ______ 4 ______ 5 ______

Después, agrega una línea corta por persona en `docs/USABILITY-AUDIT.md` (una sección "Personas reales"): quién (solo rango de edad), teléfono y las tres notas más importantes.
