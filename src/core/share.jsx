// SHARE CARDS — a clean image of something learned or kept up (a streak,
// a finished unit, a badge, a goal's progress), drawn here on the device
// and shared through the phone's own share sheet (or saved). Never on a
// card: names, location or a class. Amounts and goal names only if the
// learner turns them on for that one card — and for 13–17 (or no age
// given) that option doesn't exist. Only the kind of card is counted.
import { useEffect, useState } from "react";
import { useAppState } from "./store.js";
import { addStrings } from "./i18n.js";
import { track } from "./analytics.js";
import { FONT, SERIF, MARK_PATHS, Button, Note, Sheet, Switch } from "./ui.jsx";
import { inviteUrl } from "./invites.jsx";

const S = (en, es) => ({ en, es });
addStrings({
  "share.title": S("Share", "Compartir"),
  "share.button": S("Share", "Compartir"),
  "share.save": S("Save image", "Guardar imagen"),
  "share.saved": S("Image saved", "Imagen guardada"),
  "share.private": S("No names, amounts or location on the card.", "La tarjeta no muestra nombres, cantidades ni ubicación."),
  "share.details": S("Show the goal's name and amounts", "Mostrar el nombre y las cantidades de la meta"),
  "share.details.sub": S("Only on this card.", "Solo en esta tarjeta."),
  "share.text": S("Learning money by doing, with Northvale Learn:", "Aprendiendo de dinero con práctica, en Northvale Learn:"),
  "share.footer": S("Learn money by doing · practice money only", "Aprende de dinero practicando · solo dinero de práctica"),
  "share.streak": S("{n}-day streak", "Racha de {n} {n|día|días}"),
  "share.streak.sub": S("Learning about money a few minutes a day", "Aprendiendo de dinero unos minutos al día"),
  "share.unit": S("Finished a unit", "Terminé una unidad"),
  "share.badge.sub": S("Achievement unlocked", "Logro desbloqueado"),
  "share.goal": S("{pct}% of the way to a goal", "{pct}% del camino a una meta"),
  "share.goal.sub": S("Saving with a plan", "Ahorrando con un plan"),
  "share.goal.named": S("{name}: {saved} of {target}", "{name}: {saved} de {target}"),
});

const adult = (ageBand) => ageBand === "18-25" || ageBand === "26+";
const listeners = new Set();
// card: { kind: "streak", n } | { kind: "unit", title } | { kind: "badge", name }
//       | { kind: "goal", pct, name, saved, target } (name/saved/target
//         only appear when the learner turns them on)
export const openShare = (card) => listeners.forEach((l) => l(card));

// What the card says — also the image's description for screen readers.
export function cardLines(t, card, details) {
  if (card.kind === "streak") return [t("share.streak", { n: card.n }), t("share.streak.sub")];
  if (card.kind === "unit") return [t("share.unit"), card.title];
  if (card.kind === "badge") return [card.name, t("share.badge.sub")];
  return [t("share.goal", { pct: card.pct }), details ? t("share.goal.named", { name: card.name, saved: card.saved, target: card.target }) : t("share.goal.sub")];
}

// Words onto lines no wider than `width`.
function wrap(ctx, text, width) {
  const lines = [];
  for (const word of String(text).split(/\s+/)) {
    const last = lines[lines.length - 1];
    if (last && ctx.measureText(`${last} ${word}`).width <= width) lines[lines.length - 1] = `${last} ${word}`;
    else lines.push(word);
  }
  return lines;
}
// A 1080×1080 PNG: navy, the logo and wordmark in cream, the line, a sand rule, the fine print.
async function draw([big, sub], footer) {
  await document.fonts.ready.catch(() => {});
  const c = document.createElement("canvas");
  c.width = c.height = 1080;
  const x = c.getContext("2d");
  x.fillStyle = "#13315C";
  x.fillRect(0, 0, 1080, 1080);
  x.fillStyle = "#F7F2E8";
  x.textBaseline = "alphabetic";
  x.save();
  x.translate(92, 104);
  x.scale(0.86, 0.86);
  for (const d of MARK_PATHS) x.fill(new Path2D(d));
  x.restore();
  x.font = `650 76px ${SERIF}`;
  x.fillText("Northvale", 196, 170);
  x.font = `650 30px ${FONT}`;
  x.globalAlpha = 0.7;
  x.fillText("L E A R N", 200, 222);
  x.globalAlpha = 1;
  x.font = `700 104px ${FONT}`;
  const lines = wrap(x, big, 888).slice(0, 4);
  let y = 560 - (lines.length - 1) * 58;
  for (const l of lines) (x.fillText(l, 96, y), (y += 116));
  x.fillStyle = "#E3CFA4";
  x.fillRect(96, y - 70, 120, 10);
  x.fillStyle = "#F7F2E8";
  x.font = `500 46px ${FONT}`;
  x.globalAlpha = 0.9;
  for (const l of wrap(x, sub, 888).slice(0, 3)) (x.fillText(l, 96, y + 10), (y += 60));
  x.font = `500 30px ${FONT}`;
  x.globalAlpha = 0.65;
  x.fillText(footer, 96, 1000);
  return new Promise((ok) => c.toBlob(ok, "image/png"));
}

export function ShareHost({ t }) {
  const ageBand = useAppState((s) => s.profile.ageBand);
  const [card, setCard] = useState(null);
  const [details, setDetails] = useState(false);
  const [image, setImage] = useState(null);
  useEffect(() => {
    const l = (c) => (setDetails(false), setCard(c));
    listeners.add(l);
    return () => listeners.delete(l);
  }, []);
  const lines = card && cardLines(t, card, details && card.kind === "goal" && adult(ageBand));
  useEffect(() => {
    if (!card) return;
    let gone = false;
    let url = null;
    draw(lines, t("share.footer")).then((blob) => {
      if (gone || !blob) return;
      url = URL.createObjectURL(blob);
      setImage({ blob, url });
    });
    return () => {
      gone = true;
      if (url) URL.revokeObjectURL(url);
      setImage(null);
    };
  }, [card, details]);
  if (!card) return null;
  const file = image && new File([image.blob], "northvale-learn.png", { type: "image/png" });
  const canShare = !!(file && navigator.canShare && navigator.canShare({ files: [file] }));
  const save = () => {
    const a = document.createElement("a");
    a.href = image.url;
    a.download = "northvale-learn.png";
    a.click();
    track("share", { kind: card.kind });
  };
  const share = () =>
    navigator.share({ files: [file], text: `${t("share.text")} ${inviteUrl() || location.origin}` }).then(
      () => track("share", { kind: card.kind }),
      () => {}
    );
  return (
    <Sheet open onClose={() => setCard(null)} title={t("share.title")}>
      <div style={{ aspectRatio: "1", borderRadius: 16, overflow: "hidden", background: "#13315C", marginBottom: 12 }}>{image && <img src={image.url} alt={lines.join(" — ")} style={{ width: "100%", height: "100%", display: "block" }} />}</div>
      {card.kind === "goal" && adult(ageBand) ? (
        <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 12 }}>
          <div style={{ flex: 1 }}>
            <div style={{ fontWeight: 650 }}>{t("share.details")}</div>
            <div style={{ fontSize: 14, color: "var(--mid)" }}>{t("share.details.sub")}</div>
          </div>
          <Switch label={t("share.details")} checked={details} onChange={setDetails} />
        </div>
      ) : (
        <Note icon="shield" style={{ marginBottom: 12 }}>{t("share.private")}</Note>
      )}
      <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
        {canShare && (
          <Button full disabled={!image} onClick={share}>
            {t("share.button")}
          </Button>
        )}
        <Button full kind={canShare ? "secondary" : "primary"} disabled={!image} onClick={save}>
          {t("share.save")}
        </Button>
      </div>
    </Sheet>
  );
}
