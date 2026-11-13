// CERTIFICATES — the Me tab's card (the sheet it opens is Sheet.jsx, loaded on
// demand, so the app starts as fast as before). Finish every lesson in a track
// and claim its certificate: it needs a free account, the server checks the
// lessons that account has finished before it issues a code, and a public page
// (/verify) answers a code with the track, the date and, for adults who choose
// it, a name. Under 18 (or no age given) no name is kept or shown there.
import { Suspense, lazy, useState } from "react";
import { registerModule } from "../../core/registry.js";
import { useAppState } from "../../core/store.js";
import { addStrings } from "../../core/i18n.js";
import { Card, Icon } from "../../core/ui.jsx";
import { ALL_LESSONS } from "../lessons/content.js";
import { TRACKS, lessonsOfTrack } from "./tracks.js";

const S = (en, es) => ({ en, es });
addStrings({
  "cert.title": S("Certificates", "Certificados"),
  "cert.card.none": S("Finish a track to earn your first", "Termina un tema para ganar el primero"),
  "cert.card.some": S("{n} of {total} tracks finished", "{n} de {total} temas terminados"),
});

const CertSheet = lazy(() => import("./Sheet.jsx"));

function MeCard({ t, locale, go }) {
  const lessons = useAppState((s) => s.progress.lessons || {});
  const [open, setOpen] = useState(false);
  const finished = TRACKS.filter((tr) => {
    const ids = lessonsOfTrack(tr, ALL_LESSONS);
    return ids.length > 0 && ids.every((id) => lessons[id] && lessons[id].done);
  }).length;
  return (
    <>
      <Card pad={16} onClick={() => setOpen(true)}>
        <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
          <span style={{ width: 38, height: 38, borderRadius: 12, background: "var(--bg)", display: "flex", alignItems: "center", justifyContent: "center" }}>
            <Icon name="trophy" size={19} />
          </span>
          <div style={{ flex: 1 }}>
            <div style={{ fontWeight: 700 }}>{t("cert.title")}</div>
            <div style={{ fontSize: 14, color: "var(--mid)" }}>{finished ? t("cert.card.some", { n: finished, total: TRACKS.length }) : t("cert.card.none")}</div>
          </div>
        </div>
      </Card>
      {open && (
        <Suspense fallback={null}>
          <CertSheet t={t} locale={locale} go={go} onClose={() => setOpen(false)} />
        </Suspense>
      )}
    </>
  );
}

registerModule({ id: "certs", MeCard });
