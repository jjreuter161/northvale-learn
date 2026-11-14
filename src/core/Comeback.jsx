// OPENING THE APP AFTER A BREAK — said kindly. A missed day or two: a
// freeze covered it, or the streak starts over (with the free monthly
// repair, if it applies). Three or more days away: a short catch-up
// instead — your goal, where you were, one short lesson to restart.
import { useState } from "react";
import { useAppState } from "./store.js";
import { addStrings, text } from "./i18n.js";
import { service } from "./registry.js";
import { repairAvailable, repairNow } from "./game.js";
import { track } from "./analytics.js";
import { Button, Icon, Sheet, toast } from "./ui.jsx";

export const COMEBACK_DAYS = 3;
const S = (en, es) => ({ en, es });

addStrings({
  "back.title": S("Welcome back", "Qué bueno verte"),
  "back.title.name": S("Welcome back, {name}", "Qué bueno verte, {name}"),
  "back.sub": S("It's been {n} days. Here's where you left off.", "Pasaron {n} días. Aquí vas."),
  "back.goal": S("Your goal", "Tu meta"),
  "back.next": S("Next lesson", "Siguiente lección"),
  "back.start": S("Ease back in: {title}", "Retoma con: {title}"),
  "back.minutes": S("{unit} · about 4 minutes", "{unit} · unos 4 minutos"),
  "back.review": S("Review what you learned", "Repasa lo que aprendiste"),
  "back.later": S("Not now", "Ahora no"),
  "repair.offer": S("Your {n}-day streak ended. You have one free repair a month: bring it back now, and keep going from there.", "Tu racha de {n} {n|día|días} terminó. Tienes una reparación gratis al mes: recupérala ahora y sigue desde ahí."),
  "repair.button": S("Repair my streak", "Reparar mi racha"),
  "repair.done": S("Streak repaired: {n} days", "Racha reparada: {n} {n|día|días}"),
  "repair.after": S("Your {n}-day streak is back. A lesson today keeps it going.", "Tu racha de {n} {n|día|días} volvió. Una lección hoy la mantiene."),
});

// The free repair, where it applies (here and in the streak sheet).
export function RepairOffer({ t, onRepaired }) {
  const broken = useAppState((s) => s.progress.streak.broken);
  if (!repairAvailable()) return null;
  return (
    <div style={{ background: "var(--surface)", border: "1px solid var(--line)", borderRadius: 8, padding: 14, margin: "0 0 14px", textAlign: "left" }}>
      <p style={{ fontSize: 15, lineHeight: 1.5, margin: "0 0 10px" }}>{t("repair.offer", { n: broken.count })}</p>
      <Button
        full
        size="md"
        kind="secondary"
        style={{ border: "1px solid var(--line)" }}
        onClick={() => {
          const n = repairNow();
          toast(t("repair.done", { n }), "good");
          onRepaired && onRepaired();
        }}
      >
        <Icon name="refresh" size={18} /> {t("repair.button")}
      </Button>
    </div>
  );
}

// `notice`: { event, away } from settleOnOpen.
export function OpenNotice({ t, locale, notice, onClose, go }) {
  const nickname = useAppState((s) => s.profile.nickname);
  const streak = useAppState((s) => s.progress.streak.count);
  const [repaired, setRepaired] = useState(false);
  if (!notice) return null;
  const { event, away } = notice;
  const comeback = away >= COMEBACK_DAYS;
  const close = () => onClose();

  if (comeback) {
    const goal = (service("goals", "goalKinds")() || [])[0];
    const next = service("lessons", "nextFor")(service("goals", "recommendedUnits")() || []);
    const row = (label, value, sub) => (
      <div style={{ padding: "12px 0", borderTop: "1px solid var(--line)" }}>
        <div style={{ fontSize: 12, fontWeight: 650, color: "var(--low)" }}>{label}</div>
        <div style={{ fontWeight: 700, fontSize: 17, marginTop: 2 }}>{value}</div>
        {sub && <div style={{ fontSize: 14, color: "var(--mid)", marginTop: 2 }}>{sub}</div>}
      </div>
    );
    return (
      <Sheet open onClose={close} title={nickname ? t("back.title.name", { name: nickname }) : t("back.title")}>
        <p style={{ fontSize: 16, color: "var(--mid)", lineHeight: 1.5, margin: "0 0 6px" }}>{t("back.sub", { n: away })}</p>
        <div style={{ marginBottom: 14 }}>
          {goal && row(t("back.goal"), goal.name || t(`tpl.${goal.kind}`))}
          {next && row(t("back.next"), text(next.title, locale), t("back.minutes", { unit: text(next.unitTitle, locale) }))}
        </div>
        {event && event.type === "freeze_used" && <p style={{ fontSize: 15, lineHeight: 1.5, margin: "0 0 14px" }}>{t("streak.saved.body", { n: event.count, streak: event.streak })}</p>}
        {event && event.type === "streak_reset" && (repaired ? <p style={{ fontSize: 15, lineHeight: 1.5, margin: "0 0 14px" }}>{t("repair.after", { n: streak })}</p> : repairAvailable() ? <RepairOffer t={t} onRepaired={() => setRepaired(true)} /> : <p style={{ fontSize: 15, lineHeight: 1.5, margin: "0 0 14px" }}>{t("streak.reset.body", { n: event.lost })}</p>)}
        <Button
          full
          onClick={() => {
            track("comeback_start");
            close();
            go("lessons", next ? { lesson: next.id } : {});
          }}
        >
          {next ? t("back.start", { title: text(next.title, locale) }) : t("back.review")}
        </Button>
        <Button full kind="ghost" onClick={close} style={{ marginTop: 4 }}>
          {t("back.later")}
        </Button>
      </Sheet>
    );
  }

  if (!event) return null;
  const saved = event.type === "freeze_used";
  return (
    <Sheet open onClose={close} title={saved ? t("streak.saved.title") : t("streak.reset.title")}>
      <div style={{ textAlign: "center", padding: "6px 4px 4px" }}>
        <div style={{ width: 64, height: 64, borderRadius: 32, margin: "0 auto", background: "var(--brandSoft)", display: "flex", alignItems: "center", justifyContent: "center" }}>
          <Icon name={saved ? "snow" : "refresh"} size={30} color="var(--sky)" />
        </div>
        {saved || repaired || !repairAvailable() ? (
          <p style={{ fontSize: 17, lineHeight: 1.5, margin: "8px 0 18px" }}>{saved ? t("streak.saved.body", { n: event.count, streak: event.streak }) : repaired ? t("repair.after", { n: streak }) : t("streak.reset.body", { n: event.lost })}</p>
        ) : (
          <div style={{ marginTop: 12 }}>
            <RepairOffer t={t} onRepaired={() => setRepaired(true)} />
          </div>
        )}
        <Button full onClick={() => (close(), go("lessons"))}>{t("streak.cta")}</Button>
      </div>
    </Sheet>
  );
}
