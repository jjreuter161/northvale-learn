// PRACTICE — try what you learned, pretend money only: Money Missions, the
// practice portfolio, the tools from your lessons and News explained. Each
// module adds itself (registry: practice: { order, Card, Row }). The tab is
// there from day one so the bar never changes shape; until 3 lessons are
// done it shows a clear preview of what opens. Inside, the portfolio,
// news and tools still open with the lessons that teach them.
import { useState } from "react";
import { getState, update, useAppState } from "./store.js";
import { addStrings, money } from "./i18n.js";
import { fact } from "./facts.js";
import { allModules } from "./registry.js";
import { dayKey } from "./progress.js";
import { Button, Card, Icon, List, Progress, Sheet, Title } from "./ui.jsx";

const S = (en, es) => ({ en, es });
addStrings({
  "practice.sub": S("Try what you learned. Pretend money only.", "Prueba lo que aprendiste. Solo dinero de práctica."),
  "practice.locked.title": S("Opens after 3 lessons", "Se abre después de 3 lecciones"),
  "practice.locked.body": S("Practice investing with {cash} of pretend money, plus Money Missions, calculators and news.", "Practica invertir con {cash} de dinero de práctica, además de Misiones de dinero, calculadoras y noticias."),
  "practice.locked.n": S("{n} of 3 lessons", "{n} de 3 lecciones"),
  "practice.locked.go": S("Continue learning", "Seguir aprendiendo"),
  "practice.fine": S("New tools appear here as you finish the lessons that use them.", "Las herramientas nuevas aparecen aquí al terminar las lecciones que las usan."),
  "practice.intro.title": S("New: Practice", "Nuevo: Práctica"),
  "practice.intro.body": S("You've finished 3 lessons, so Money Missions are open: small real-life tasks, like finding the fees on a bank account. You do them on your own; no money moves.", "Terminaste 3 lecciones, así que ya están abiertas las Misiones de dinero: pequeñas tareas de la vida real, como encontrar las comisiones de una cuenta. Las haces por tu cuenta; no se mueve dinero."),
  "practice.intro.more": S("The practice portfolio opens with the investing lessons, and News after 5 lessons.", "El portafolio de práctica se abre con las lecciones de inversión, y las noticias después de 5 lecciones."),
  "practice.intro.go": S("Take a look", "Echar un vistazo"),
});

// Open once 3 lessons are done — or right away for anyone who has already
// used something here (nothing anyone had disappears).
// Lessons finished (the counter, or the lessons themselves for progress
// saved before the counter existed).
export const lessonsDone = (p) => Math.max(p.counters.lessons || 0, Object.values(p.lessons || {}).filter((l) => l && l.done).length);
export const practiceOpen = (p) => lessonsDone(p) >= 3 || (p.counters.missions || 0) > 0 || (p.counters.trade || 0) > 0 || (p.counters.sim || 0) > 0 || (p.practiced.news || []).length > 0;

// One-time introductions and "New" tags, remembered in the profile.
export const seenIntro = (key) => !!(getState().profile.seenIntros || {})[key];
export const markIntro = (key) => update((s) => ({ ...s, profile: { ...s.profile, seenIntros: { ...(s.profile.seenIntros || {}), [key]: dayKey() } } }));
export const useSeen = (key) => !!useAppState((s) => (s.profile.seenIntros || {})[key]);

export default function Practice(ctx) {
  const { t, locale } = ctx;
  const progress = useAppState((s) => s.progress);
  const introSeen = useSeen("practice");
  const [intro, setIntro] = useState(() => practiceOpen(progress) && !introSeen);
  const parts = allModules()
    .filter((m) => m.practice)
    .sort((a, b) => a.practice.order - b.practice.order);
  if (!practiceOpen(progress)) {
    const n = Math.min(3, lessonsDone(progress));
    const cash = money(fact(locale.region === "MX" ? "startCashMX" : "startCashUS"), { ...locale, currency: locale.region === "MX" ? "MXN" : "USD" }).replace(/\.00$/, "");
    return (
      <div>
        <Title sub={t("practice.sub")}>{t("nav.practice")}</Title>
        <Card pad={22}>
          <span style={{ width: 48, height: 48, borderRadius: 14, background: "var(--bg)", display: "flex", alignItems: "center", justifyContent: "center", marginBottom: 14 }}>
            <Icon name="lock" size={22} color="var(--mid)" />
          </span>
          <div style={{ fontSize: 20, fontWeight: 750, marginBottom: 6 }}>{t("practice.locked.title")}</div>
          <p style={{ margin: "0 0 16px", color: "var(--mid)", lineHeight: 1.5 }}>{t("practice.locked.body", { cash })}</p>
          <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 18 }}>
            <Progress value={n} max={3} height={6} label={t("practice.locked.n", { n })} />
            <span style={{ fontSize: 14, color: "var(--mid)", whiteSpace: "nowrap" }}>{t("practice.locked.n", { n })}</span>
          </div>
          <Button full onClick={() => ctx.go("lessons")}>
            {t("practice.locked.go")}
          </Button>
        </Card>
      </div>
    );
  }
  const close = () => (markIntro("practice"), setIntro(false));
  return (
    <div>
      <Title sub={t("practice.sub")}>{t("nav.practice")}</Title>
      {parts.filter((m) => m.practice.Card).map((m) => (
        <m.practice.Card key={m.id} {...ctx} />
      ))}
      <List style={{ marginTop: 12 }}>
        {parts.filter((m) => m.practice.Row).map((m) => (
          <m.practice.Row key={m.id} {...ctx} />
        ))}
      </List>
      <p style={{ fontSize: 13, color: "var(--low)", lineHeight: 1.45, margin: "14px 2px 0" }}>{t("practice.fine")}</p>
      <Sheet open={intro} onClose={close} title={t("practice.intro.title")}>
        <p style={{ margin: "0 0 10px", lineHeight: 1.5 }}>{t("practice.intro.body")}</p>
        <p style={{ margin: "0 0 18px", lineHeight: 1.5, color: "var(--mid)" }}>{t("practice.intro.more")}</p>
        <Button full onClick={close}>
          {t("practice.intro.go")}
        </Button>
      </Sheet>
    </div>
  );
}
