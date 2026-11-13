// THE CERTIFICATES SHEET — loaded when the Me card opens (index.jsx). Finish every lesson in a track and claim its certificate (Me
// tab). It needs a free account: the server checks the lessons your account
// has finished before it issues a code, and a public page (/verify) answers a
// code with the track, the date and — for adults who choose it — a name.
// Under 18 (or no age given) no name is ever kept or shown there; the file you
// download can show your nickname if you choose. The image and PDF are drawn
// on this device (render.js, loaded on demand). "Share" uses the share cards,
// which never show a name.
import { useEffect, useState } from "react";
import { useAppState, useSlice, setSlice } from "../../core/store.js";
import { useSession } from "../../core/session.js";
import { api } from "../../core/api.js";
import { track as logEvent } from "../../core/analytics.js";
import { addStrings, text } from "../../core/i18n.js";
import { openShare } from "../../core/share.jsx";
import { SELECTED, Button, Card, Icon, Loading, Note, Progress, Sheet, toast } from "../../core/ui.jsx";
import { ALL_LESSONS } from "../lessons/content.js";
import { TRACKS, trackById, lessonsOfTrack } from "./tracks.js";

const S = (en, es) => ({ en, es });
addStrings({
  "cert.sub": S("Earn one by finishing every lesson in a track.", "Gana uno al terminar todas las lecciones de un tema."),
  "cert.account": S("Certificates need a free account, so your progress is saved and the certificate can be checked.", "Los certificados necesitan una cuenta gratis, para guardar tu avance y poder verificar el certificado."),
  "cert.offline": S("Certificates need a connection.", "Los certificados necesitan conexión."),
  "cert.signin": S("Create an account", "Crear cuenta"),
  "cert.progress": S("{done} of {total} lessons", "{done} de {total} lecciones"),
  "cert.earned": S("Earned", "Obtenido"),
  "cert.get": S("Get your certificate", "Obtener tu certificado"),
  "cert.view": S("View certificate", "Ver certificado"),
  "cert.back": S("Back to certificates", "Volver a certificados"),
  "cert.name.title": S("What name goes on it?", "¿Qué nombre lleva?"),
  "cert.name.nick": S("My nickname ({name})", "Mi apodo ({name})"),
  "cert.name.real": S("My name", "Mi nombre"),
  "cert.name.real.ph": S("First and last name", "Nombre y apellido"),
  "cert.name.none": S("No name", "Sin nombre"),
  "cert.name.teen": S("For your safety: a nickname, or no name. The public check page never shows a name for anyone under 18. It shows only the track and the date.", "Por tu seguridad: un apodo, o sin nombre. La página pública de verificación nunca muestra un nombre en menores de 18 años. Solo muestra el tema y la fecha."),
  "cert.name.adult": S("The public check page shows the track, the date and the name you pick here. Nothing else.", "La página pública de verificación muestra el tema, la fecha y el nombre que elijas aquí. Nada más."),
  "cert.name.error": S("Enter your name with letters only (2–60 characters).", "Escribe tu nombre solo con letras (de 2 a 60 caracteres)."),
  "cert.create": S("Create certificate", "Crear certificado"),
  "cert.code": S("Code {code}", "Código {code}"),
  "cert.verify": S("Anyone can check it at {url}", "Cualquiera puede verificarlo en {url}"),
  "cert.save.img": S("Save image", "Guardar imagen"),
  "cert.save.pdf": S("Save PDF", "Guardar PDF"),
  "cert.share": S("Share", "Compartir"),
  "cert.change": S("Change the name", "Cambiar el nombre"),
  "cert.delete": S("Delete this certificate", "Eliminar este certificado"),
  "cert.delete.sure": S("Delete it? The code stops working.", "¿Eliminarlo? El código dejará de funcionar."),
  "cert.delete.yes": S("Yes, delete", "Sí, eliminar"),
  "cert.deleted": S("Certificate deleted", "Certificado eliminado"),
  "cert.notyet": S("Your progress is still saving to your account. Try again in a moment.", "Tu avance todavía se está guardando en tu cuenta. Inténtalo en un momento."),
  "cert.error": S("That didn't work. Check your connection and try again.", "No funcionó. Revisa tu conexión e inténtalo de nuevo."),
  "cert.fine": S("A Northvale Learn certificate marks finishing lessons in the app. It isn't a school credit or a professional qualification.", "Un certificado de Northvale Learn marca que terminaste lecciones en la app. No es un crédito escolar ni una calificación profesional."),
  "cert.img.heading": S("Certificate of completion", "Certificado de finalización"),
  "cert.img.certifies": S("This certifies that", "Se certifica que"),
  "cert.img.finished": S("has finished every lesson in", "terminó todas las lecciones de"),
  "cert.img.finished.anon": S("Every lesson finished in", "Todas las lecciones terminadas en"),
  "cert.img.issued": S("Issued {date}", "Expedido el {date}"),
  "cert.img.alt": S("Certificate: {title}, issued {date}", "Certificado: {title}, expedido el {date}"),
  "share.cert": S("Earned a certificate", "Obtuve un certificado"),
});

export const DEFAULTS = { nick: {} };
const adult = (ageBand) => ageBand === "18-25" || ageBand === "26+";
const pretty = (code) => (code || "").replace(/(.{4})(?=.)/g, "$1-");
const progressOf = (track, lessons) => {
  const ids = lessonsOfTrack(track, ALL_LESSONS);
  return { done: ids.filter((id) => lessons[id] && lessons[id].done).length, total: ids.length };
};

export default function CertSheet({ t, locale, go, onClose }) {
  const session = useSession();
  const lessons = useAppState((s) => s.progress.lessons || {});
  const profile = useAppState((s) => s.profile);
  const local = useSlice("certs", DEFAULTS);
  const isAdult = adult(profile.ageBand);
  const signedIn = session.online && !!session.user;
  const [server, setServer] = useState(null); // { certs, ready }
  const [view, setView] = useState({ id: "list" });
  const [choice, setChoice] = useState("nick");
  const [realName, setRealName] = useState("");
  const [error, setError] = useState(null);
  const [busy, setBusy] = useState(false);
  const [sure, setSure] = useState(false);
  const [img, setImg] = useState(null);
  const certOf = (id) => server && server.certs.find((c) => c.track === id);
  const reload = () => api("/api/cert/mine").then(setServer, () => setServer({ certs: [], ready: [], failed: true }));
  useEffect(() => {
    if (signedIn) reload();
  }, [signedIn]);

  const cert = view.id === "cert" ? certOf(view.track) : null;
  const tr = view.track ? trackById(view.track) : null;
  const shownName = cert && (isAdult ? cert.name : local.nick[cert.track] ? profile.nickname || null : null);
  const dateText = cert && new Date(`${cert.date}T12:00:00`).toLocaleDateString(`${locale.lang}-${locale.region}`, { dateStyle: "long" });
  const verifyUrl = `${location.host}/${locale.lang === "es" ? "verificar" : "verify"}`;
  const lines = cert && {
    heading: t("cert.img.heading"),
    certifies: t("cert.img.certifies"),
    name: shownName,
    finished: t(shownName ? "cert.img.finished" : "cert.img.finished.anon"),
    title: text(tr.title, locale),
    issued: t("cert.img.issued", { date: dateText }),
    code: t("cert.code", { code: pretty(cert.code) }),
    verify: t("cert.verify", { url: verifyUrl }),
    fine: t("cert.fine"),
  };
  // Draw it (on this device) whenever the certificate or its name changes.
  useEffect(() => {
    if (!cert) return;
    let gone = false;
    let url = null;
    import("./render.js")
      .then((r) => r.drawCertificate(lines))
      .then((blob) => {
        if (gone || !blob) return;
        url = URL.createObjectURL(blob);
        setImg({ blob, url });
      });
    return () => {
      gone = true;
      if (url) URL.revokeObjectURL(url);
      setImg(null);
    };
  }, [cert && cert.code, shownName, locale.lang]);

  const download = (href, name) => {
    const a = document.createElement("a");
    a.href = href;
    a.download = name;
    a.click();
  };
  const savePdf = async () => {
    const r = await import("./render.js");
    const jpeg = await r.drawCertificate(lines, "image/jpeg", 0.92);
    const pdf = r.pdfFromJpeg(new Uint8Array(await jpeg.arrayBuffer()), r.CERT_W, r.CERT_H);
    const url = URL.createObjectURL(new Blob([pdf], { type: "application/pdf" }));
    download(url, `northvale-learn-${cert.track}.pdf`);
    setTimeout(() => URL.revokeObjectURL(url), 5000);
  };

  const create = async () => {
    if (busy) return;
    setBusy(true);
    setError(null);
    try {
      const name = isAdult ? choice : "none";
      const body = { track: view.track, name, realName };
      const made = await api("/api/cert/issue", { method: "POST", body });
      setSlice("certs", (s) => ({ ...s, nick: { ...s.nick, [view.track]: !isAdult && choice === "nick" } }), DEFAULTS);
      setServer((s) => ({ ...(s || { ready: [] }), certs: [...((s && s.certs) || []).filter((c) => c.track !== made.track), made] }));
      logEvent("cert_issue", { track: made.track });
      setView({ id: "cert", track: made.track });
    } catch (e) {
      setError(e.code === "NAME" ? t("cert.name.error") : e.code === "NOT_FINISHED" ? t("cert.notyet") : t("cert.error"));
    } finally {
      setBusy(false);
    }
  };
  const remove = async () => {
    try {
      await api("/api/cert/delete", { method: "POST", body: { code: cert.code } });
      setServer((s) => ({ ...s, certs: s.certs.filter((c) => c.code !== cert.code) }));
      setSure(false);
      setView({ id: "list" });
      toast(t("cert.deleted"));
    } catch {
      setError(t("cert.error"));
    }
  };

  const chip = (value, label) => (
    <button key={value} role="radio" aria-checked={choice === value} onClick={() => setChoice(value)} className="nv-press" style={{ display: "block", width: "100%", textAlign: "left", minHeight: 48, padding: "10px 14px", borderRadius: 14, ...(choice === value ? SELECTED : { border: "2px solid var(--line)" }), background: choice === value ? "var(--brandSoft)" : "var(--surface)", color: "var(--ink)", fontSize: 16, fontWeight: 650, cursor: "pointer" }}>
      {label}
    </button>
  );

  return (
    <Sheet open onClose={onClose} title={t("cert.title")} tall>
      {view.id === "list" && (
        <>
          <p style={{ margin: "0 0 12px", color: "var(--mid)" }}>{t("cert.sub")}</p>
          {!signedIn && (
            <Note icon="info" style={{ marginBottom: 12 }}>
              <strong style={{ display: "block" }}>{session.online ? t("cert.account") : t("cert.offline")}</strong>
              {session.online && (
                <Button size="sm" kind="secondary" style={{ marginTop: 10 }} onClick={() => (onClose(), go("settings"))}>
                  {t("cert.signin")}
                </Button>
              )}
            </Note>
          )}
          <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
            {TRACKS.map((tr0) => {
              const p = progressOf(tr0, lessons);
              const complete = p.done === p.total;
              const have = certOf(tr0.id);
              return (
                <Card key={tr0.id} pad={16}>
                  <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                    <div style={{ flex: 1, fontWeight: 700, fontSize: 17 }}>{text(tr0.title, locale)}</div>
                    {have && <span style={{ fontSize: 13, fontWeight: 700, color: "var(--good)" }}>✓ {t("cert.earned")}</span>}
                  </div>
                  <div style={{ fontSize: 14, color: "var(--mid)", lineHeight: 1.4, margin: "4px 0 10px" }}>{text(tr0.blurb, locale)}</div>
                  {!complete && (
                    <>
                      <Progress value={p.done} max={p.total} height={8} label={text(tr0.title, locale)} />
                      <div style={{ fontSize: 13, color: "var(--low)", marginTop: 6 }}>{t("cert.progress", p)}</div>
                    </>
                  )}
                  {complete && signedIn && (
                    <Button size="sm" kind={have ? "secondary" : "primary"} onClick={() => (setError(null), setChoice("nick"), setView(have ? { id: "cert", track: tr0.id } : { id: "name", track: tr0.id }))}>
                      {have ? t("cert.view") : t("cert.get")}
                    </Button>
                  )}
                </Card>
              );
            })}
          </div>
          <p style={{ fontSize: 12, color: "var(--low)", margin: "14px 0 0" }}>{t("cert.fine")}</p>
        </>
      )}

      {view.id === "name" && (
        <>
          <h2 className="nv-disp" style={{ fontSize: 24, margin: "0 0 4px" }}>{text(tr.title, locale)}</h2>
          <p style={{ margin: "0 0 12px", color: "var(--mid)" }}>{t("cert.name.title")}</p>
          <div role="radiogroup" aria-label={t("cert.name.title")} style={{ display: "flex", flexDirection: "column", gap: 8 }}>
            {profile.nickname && chip("nick", t("cert.name.nick", { name: profile.nickname }))}
            {isAdult && chip("real", t("cert.name.real"))}
            {chip("none", t("cert.name.none"))}
          </div>
          {isAdult && choice === "real" && (
            <input value={realName} onChange={(e) => setRealName(e.target.value)} placeholder={t("cert.name.real.ph")} aria-label={t("cert.name.real.ph")} maxLength={60} autoComplete="name" style={{ width: "100%", boxSizing: "border-box", marginTop: 10, minHeight: 48, borderRadius: 14, border: "1px solid var(--line)", background: "var(--surface)", color: "var(--ink)", padding: "0 14px", fontSize: 16 }} />
          )}
          <Note icon="shield" style={{ marginTop: 12 }}>{t(isAdult ? "cert.name.adult" : "cert.name.teen")}</Note>
          {error && <p role="alert" style={{ color: "var(--ink)", fontWeight: 650, margin: "10px 0 0" }}>{error}</p>}
          <div style={{ display: "flex", flexDirection: "column", gap: 8, marginTop: 14 }}>
            <Button full onClick={create} disabled={busy || (isAdult && choice === "real" && realName.trim().length < 2)}>{t("cert.create")}</Button>
            <Button full kind="ghost" onClick={() => setView({ id: "list" })}>{t("cert.back")}</Button>
          </div>
        </>
      )}

      {view.id === "cert" && !cert && <Loading label={t("cert.title")} size={30} />}
      {view.id === "cert" && cert && (
        <>
          <div style={{ aspectRatio: "1600 / 1131", borderRadius: 12, overflow: "hidden", background: "var(--bg)", border: "1px solid var(--line)", marginBottom: 12 }}>
            {img ? <img src={img.url} alt={t("cert.img.alt", { title: text(tr.title, locale), date: dateText })} style={{ width: "100%", height: "100%", display: "block" }} /> : <Loading label={t("cert.title")} size={30} />}
          </div>
          <p style={{ margin: "0 0 2px", fontWeight: 700, fontVariantNumeric: "tabular-nums" }}>{t("cert.code", { code: pretty(cert.code) })}</p>
          <p style={{ margin: "0 0 12px", fontSize: 14, color: "var(--mid)" }}>{t("cert.verify", { url: verifyUrl })}</p>
          {error && <p role="alert" style={{ color: "var(--ink)", fontWeight: 650 }}>{error}</p>}
          <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
            <Button full disabled={!img} onClick={() => (download(img.url, `northvale-learn-${cert.track}.png`), logEvent("share", { kind: "cert-image" }))}>{t("cert.save.img")}</Button>
            <Button full kind="secondary" disabled={!img} onClick={savePdf}>{t("cert.save.pdf")}</Button>
            <Button full kind="secondary" onClick={() => openShare({ kind: "cert", title: text(tr.title, locale) })}>{t("cert.share")}</Button>
            <Button full kind="ghost" onClick={() => (setChoice(shownName ? (isAdult && cert.name !== profile.nickname ? "real" : "nick") : "none"), setError(null), setView({ id: "name", track: cert.track }))}>{t("cert.change")}</Button>
            {!sure ? (
              <Button full kind="ghost" onClick={() => setSure(true)}>{t("cert.delete")}</Button>
            ) : (
              <Note tone="bad" icon="info">
                <strong style={{ display: "block" }}>{t("cert.delete.sure")}</strong>
                <Button size="sm" kind="secondary" style={{ marginTop: 10 }} onClick={remove}>{t("cert.delete.yes")}</Button>
              </Note>
            )}
            <Button full kind="ghost" onClick={() => setView({ id: "list" })}>{t("cert.back")}</Button>
          </div>
        </>
      )}
    </Sheet>
  );
}
