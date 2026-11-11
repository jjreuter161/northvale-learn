// NEWS, EXPLAINED — a short daily feed of real finance headlines (US or
// Mexico sources), each with a 2–3 sentence "what this means" in the
// learner's language, the money words in it, and a link to the story.
// Summaries come from the server's AI; without it, headlines still show.
import { useEffect, useState } from "react";
import { registerModule, service } from "../../core/registry.js";
import { recordPractice } from "../../core/game.js";
import { api } from "../../core/api.js";
import { addStrings } from "../../core/i18n.js";
import { Button, Card, Chip, Icon, ListRow, Note, Title } from "../../core/ui.jsx";
import { useAppState } from "../../core/store.js";
import { useSeen, markIntro, lessonsDone } from "../../core/Practice.jsx";

const S = (en, es) => ({ en, es });
addStrings({
  "news.nav": S("News", "Noticias"),
  "news.title": S("News, explained", "Noticias explicadas"),
  "news.row.sub": S("Real headlines in plain words", "Noticias reales en palabras sencillas"),
  "news.row.locked": S("Opens after 5 lessons", "Se abre después de 5 lecciones"),
  "news.sub": S("Today's money headlines in plain words.", "Los titulares de dinero de hoy, en palabras sencillas."),
  "news.means": S("What this means", "Qué significa"),
  "news.terms": S("Words to know", "Palabras clave"),
  "news.ask": S("Ask the tutor about this", "Pregúntale al tutor"),
  "news.read": S("Read the story", "Leer la nota"),
  "news.got_it": S("Mark as read", "Marcar como leída"),
  "news.read_done": S("Read", "Leída"),
  "news.no_summary": S("Plain-words summaries appear here once the server's AI is turned on. For now: today's headlines and their sources.", "Los resúmenes en palabras sencillas aparecen aquí cuando el servidor tenga la IA activada. Por ahora: los titulares de hoy y sus fuentes."),
  "news.offline": S("News needs the Northvale Learn server, which isn't reachable right now.", "Las noticias necesitan el servidor de Northvale Learn, que no está disponible ahorita."),
  "news.empty": S("No headlines right now. Check back later.", "No hay titulares ahorita. Vuelve más tarde."),
  "news.loading": S("Loading today's headlines…", "Cargando los titulares de hoy…"),
  "news.disclaimer": S("Summaries are written by AI to explain the news simply — they can miss details, and they're not advice. Headlines link to the original publisher.", "Los resúmenes los escribe una IA para explicar la noticia de forma sencilla: pueden omitir detalles y no son recomendaciones. Los titulares llevan a la fuente original."),
  "news.from": S("From {source}", "De {source}"),
});

function useNews(locale) {
  const [state, setState] = useState({ loading: true });
  useEffect(() => {
    let gone = false;
    setState({ loading: true });
    api(`/api/news?lang=${locale.lang}&region=${locale.region}`)
      .then((r) => !gone && setState(r))
      .catch(() => !gone && setState({ error: true }));
    return () => {
      gone = true;
    };
  }, [locale.lang, locale.region]);
  return state;
}

function Story({ item, t, onRead, read }) {
  const ago = item.published ? new Date(item.published).toLocaleString(t("locale.tag"), { month: "short", day: "numeric", hour: "numeric", minute: "2-digit" }) : null;
  return (
    <Card>
      <div style={{ fontSize: 13, fontWeight: 650, color: "var(--low)" }}>
        {item.source}
        {ago ? ` · ${ago}` : ""}
      </div>
      <h3 style={{ fontSize: 19, fontWeight: 750, lineHeight: 1.3, margin: "6px 0 10px" }}>{item.headline || item.title}</h3>
      {item.headline && item.headline !== item.title && <p style={{ fontSize: 13, color: "var(--low)", margin: "-4px 0 10px", fontStyle: "italic" }}>“{item.title}”</p>}
      {item.summary && (
        <div style={{ background: "var(--brandSoft)", borderRadius: 14, padding: "12px 14px" }}>
          <div style={{ fontSize: 13, fontWeight: 750, marginBottom: 4 }}>{t("news.means")}</div>
          <p style={{ margin: 0, fontSize: 16, lineHeight: 1.5 }}>{item.summary}</p>
        </div>
      )}
      {item.terms && item.terms.length > 0 && (
        <div style={{ marginTop: 10 }}>
          <div style={{ fontSize: 13, fontWeight: 650, color: "var(--mid)", marginBottom: 6 }}>{t("news.terms")}</div>
          <div style={{ display: "flex", flexWrap: "wrap", gap: 6 }}>
            {item.terms.map((term) => (
              <Chip key={term} onClick={() => service("tutor", "open")({ question: term })} style={{ padding: "6px 12px", minHeight: 36, fontSize: 14 }}>
                {term}
              </Chip>
            ))}
          </div>
        </div>
      )}
      <div style={{ display: "flex", gap: 8, flexWrap: "wrap", marginTop: 14 }}>
        <Button size="sm" kind={read ? "secondary" : "good"} onClick={onRead}>
          {read ? t("news.read_done") : t("news.got_it")}
        </Button>
        <Button size="sm" kind="secondary" onClick={() => service("tutor", "open")({ question: t("news.ask"), context: `${item.title}${item.summary ? ` — ${item.summary}` : ""}` })}>
          <Icon name="sparkles" size={16} /> {t("news.ask")}
        </Button>
        {item.link && (
          <a href={item.link} target="_blank" rel="noopener noreferrer" style={{ display: "inline-flex", alignItems: "center", gap: 6, fontSize: 15, fontWeight: 650, color: "var(--sky)", textDecoration: "none", padding: "8px 6px", minHeight: 36 }}>
            {t("news.read")} <Icon name="external" size={15} />
          </a>
        )}
      </div>
    </Card>
  );
}

function Feed({ t, locale, limit, onAnyRead }) {
  const news = useNews(locale);
  const [read, setRead] = useState({});
  if (news.loading) return <p className="nv-pulse" style={{ color: "var(--mid)" }}>{t("news.loading")}</p>;
  if (news.error) return <Note icon="info">{t("news.offline")}</Note>;
  if (!news.items || !news.items.length) return <Note icon="info">{t("news.empty")}</Note>;
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
      {!news.ai && <Note icon="info">{t("news.no_summary")}</Note>}
      {news.items.slice(0, limit || 8).map((item) => (
        <Story
          key={item.id}
          item={item}
          t={t}
          read={!!read[item.id]}
          onRead={() => {
            if (!read[item.id]) recordPractice("news");
            setRead((r) => ({ ...r, [item.id]: true }));
            onAnyRead && onAnyRead();
          }}
        />
      ))}
    </div>
  );
}

function Screen({ t, locale }) {
  return (
    <div>
      <Title sub={t("news.sub")}>{t("news.title")}</Title>
      <Feed t={t} locale={locale} />
      <Note icon="info" style={{ marginTop: 16 }}>{t("news.disclaimer")}</Note>
    </div>
  );
}

function ReadAction({ t, locale, onDone }) {
  return <Feed t={t} locale={locale} limit={2} onAnyRead={onDone} />;
}

// Its row on the Practice tab: after 5 lessons (a little vocabulary first),
// or for anyone who has already read the news here.
function PracticeRow({ t, go }) {
  const p = useAppState((s) => s.progress);
  const seen = useSeen("news");
  const open = lessonsDone(p) >= 5 || (p.practiced.news || []).length > 0;
  return <ListRow icon="news" title={t("news.title")} sub={open ? t("news.row.sub") : t("news.row.locked")} locked={!open} isNew={open && !seen && t("common.new")} onClick={() => (markIntro("news"), go("news"))} />;
}

registerModule({
  id: "news",
  nav: { tab: "practice", label: "news.nav" },
  practice: { order: 4, Row: PracticeRow },
  Screen,
  actions: { "news.read": ReadAction },
});
