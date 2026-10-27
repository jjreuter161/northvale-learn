// LEGAL — the privacy policy and terms, shown from the same files a lawyer
// reviews (docs/legal/*.md), in the learner's language.
import privacyEn from "../../docs/legal/privacy.en.md";
import privacyEs from "../../docs/legal/privacy.es.md";
import termsEn from "../../docs/legal/terms.en.md";
import termsEs from "../../docs/legal/terms.es.md";
import teacherEn from "../../docs/legal/teacher.en.md";
import teacherEs from "../../docs/legal/teacher.es.md";
import { Button } from "./ui.jsx";

const DOCS = { privacy: { en: privacyEn, es: privacyEs }, terms: { en: termsEn, es: termsEs }, teacher: { en: teacherEn, es: teacherEs } };

// Just enough Markdown for these pages: headings, lists, **bold**.
function Md({ text }) {
  const inline = (s) => s.split(/(\*\*[^*]+\*\*)/g).map((p, i) => (/^\*\*[^*]+\*\*$/.test(p) ? <strong key={i}>{p.slice(2, -2)}</strong> : p));
  const out = [];
  let list = null;
  text.split("\n").forEach((line, i) => {
    const li = /^- (.*)$/.exec(line);
    if (li) {
      if (!list) out.push((list = { items: [], key: i }));
      list.items.push(li[1]);
      return;
    }
    list = null;
    const h = /^(#{1,3}) (.*)$/.exec(line);
    if (h) out.push(h[1].length === 1 ? <h1 key={i} style={{ fontSize: 26, fontWeight: 700, letterSpacing: -0.4, margin: "0 0 10px" }}>{h[2]}</h1> : <h2 key={i} style={{ fontSize: 17, fontWeight: 700, margin: "22px 0 6px" }}>{h[2]}</h2>);
    else if (line.trim()) out.push(<p key={i} style={{ margin: "0 0 10px", lineHeight: 1.55 }}>{inline(line)}</p>);
  });
  return out.map((x) =>
    x.items ? (
      <ul key={x.key} style={{ margin: "0 0 10px", paddingLeft: 22, lineHeight: 1.55 }}>
        {x.items.map((it, j) => (
          <li key={j} style={{ marginBottom: 4 }}>{inline(it)}</li>
        ))}
      </ul>
    ) : (
      x
    )
  );
}

export default function Legal({ route, locale, go, t }) {
  const doc = DOCS[route.params.doc] || DOCS.privacy;
  return (
    <div>
      <Button kind="ghost" size="sm" onClick={() => go(route.params.from || "settings")} style={{ paddingLeft: 0 }}>
        ← {t(route.params.from ? "common.back" : "nav.settings")}
      </Button>
      <article style={{ marginTop: 8, fontSize: 15 }}>
        <Md text={doc[locale.lang] || doc.en} />
      </article>
    </div>
  );
}
