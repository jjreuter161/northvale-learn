// WHAT'S NEW — a short note on Today after an update, shown once to people
// who used an earlier version, until they tap "Got it" (profile.seenNote).
// Someone new never sees it: onboarding marks the newest note as seen.
// For each release, put a new note first; keep each to a few lines.
import { addStrings } from "./i18n.js";
import { update, useAppState } from "./store.js";
import { Button, Card, Icon } from "./ui.jsx";

const S = (en, es) => ({ en, es });
export const NOTES = [
  {
    id: "1.1.0-colors",
    lines: [
      S("New colors: navy and cream, with a small touch of red only where it matters.", "Colores nuevos: azul marino y crema, con un toque de rojo solo donde importa."),
      S("Pick a ready-made look or choose your own colors in Me → Settings → Colors. Only readable combinations are offered.", "Elige un estilo listo o tus propios colores en Yo → Ajustes → Colores. Solo se ofrecen combinaciones que se leen bien."),
      S("A wrong answer is never red now: just a gentle \"Not quite\" and the reason.", "Una respuesta incorrecta ya no es roja: solo un \"No del todo\" amable y el porqué."),
      S("New: Explain this in Ask, Your Money Year in Practice, and certificates in Me.", "Nuevo: Explícame esto en Preguntar, Tu Año de Dinero en Práctica y certificados en Yo."),
    ],
  },
  {
    id: "1.0.0-rc1",
    lines: [
      S("Your course is a sea chart now: every unit has its own island.", "Tu curso ahora es una carta de navegación: cada unidad tiene su isla."),
      S("Cream, Navy or Match my device: choose in Me → Settings → Colors.", "Crema, Azul marino o Igual que mi dispositivo: elige en Yo → Ajustes → Colores."),
      S("Left a lesson halfway? It picks up right where you were.", "¿Dejaste una lección a la mitad? Sigue justo donde ibas."),
      S("\"Money Missions\" are now Real-life missions. Same tasks, new name.", "Las misiones ahora se llaman Misiones de la vida real. Las mismas tareas."),
    ],
  },
];
export const LATEST_NOTE = NOTES[0].id;
addStrings({
  "new.title": S("What's new", "Novedades"),
  "new.ok": S("Got it", "Entendido"),
});

export function WhatsNewCard({ t, locale }) {
  const seen = useAppState((s) => s.profile.seenNote);
  if (seen === LATEST_NOTE) return null;
  const note = NOTES[0];
  return (
    <Card style={{ marginTop: 12 }}>
      <h2 className="nv-disp" style={{ fontSize: 20, margin: "0 0 8px", display: "flex", alignItems: "center", gap: 8, color: "var(--head)" }}>
        <Icon name="star" size={18} /> {t("new.title")}
      </h2>
      <ul style={{ margin: "0 0 14px", paddingLeft: 20, fontSize: 15, lineHeight: 1.5 }}>
        {note.lines.map((l, i) => (
          <li key={i}>{l[locale.lang] || l.en}</li>
        ))}
      </ul>
      <Button full kind="ghost" onClick={() => update((s) => ({ ...s, profile: { ...s.profile, seenNote: LATEST_NOTE } }))}>
        {t("new.ok")}
      </Button>
    </Card>
  );
}
