// NEWS — a few of today's money headlines from public RSS feeds (US or
// Mexican publishers), refreshed every 2 hours. With the AI on, each gets a
// plain-words "what this means" in the learner's language, written once
// and shared by everyone. The app shows the headline, our summary and a
// link to the publisher — never the article itself.
const FEEDS = {
  US: [
    { url: "https://www.cnbc.com/id/21324812/device/rss/rss.html", source: "CNBC" },
    { url: "https://www.cnbc.com/id/20910258/device/rss/rss.html", source: "CNBC" },
  ],
  MX: [
    { url: "https://www.elfinanciero.com.mx/arc/outboundfeeds/rss/category/mercados/?outputType=xml", source: "El Financiero" },
    { url: "https://www.elfinanciero.com.mx/arc/outboundfeeds/rss/category/economia/?outputType=xml", source: "El Financiero" },
    { url: "https://expansion.mx/rss/economia", source: "Expansión" },
  ],
};
// Tests point the feeds somewhere else.
const override = process.env.NEWS_FEEDS ? JSON.parse(process.env.NEWS_FEEDS) : null;
const PER_REGION = 6;
// An editorial choice for a learning app: skip political horse-race
// stories (polls, elections, approval ratings) — they don't teach money.
const SKIP = /\b(approval rating|poll(s|ing)?|midterms?|election|campaign|encuesta|elecci[oó]n|aprobaci[oó]n)\b/i;
const TTL = 2 * 3600000;

// Entities first (feeds often escape their HTML), then tags out, &amp; last.
const decode = (s) =>
  s
    .replace(/<!\[CDATA\[([\s\S]*?)\]\]>/g, "$1")
    .replace(/&lt;/g, "<")
    .replace(/&gt;/g, ">")
    .replace(/&quot;/g, '"')
    .replace(/&apos;|&#39;/g, "'")
    .replace(/&#(\d+);/g, (_, n) => String.fromCodePoint(Number(n)))
    .replace(/<[^>]+>/g, "")
    .replace(/&amp;/g, "&")
    .replace(/\s+/g, " ")
    .trim();
const tag = (block, name) => {
  const m = new RegExp(`<${name}[^>]*>([\\s\\S]*?)</${name}>`, "i").exec(block);
  return m ? decode(m[1]) : "";
};

// The few fields we use from an RSS 2.0 feed.
export function parseRss(xml, source) {
  return [...xml.matchAll(/<item[\s>][\s\S]*?<\/item>/gi)]
    .map(([block]) => {
      const link = tag(block, "link");
      const title = tag(block, "title");
      const published = Date.parse(tag(block, "pubDate")) || null;
      return { title, link: /^https:\/\//.test(link) ? link : null, description: tag(block, "description").slice(0, 600), published: published ? new Date(published).toISOString() : null, source };
    })
    .filter((x) => x.title && x.link);
}

const idOf = (link) => {
  let h = 0;
  for (const c of link) h = (h * 31 + c.charCodeAt(0)) | 0;
  return `n${(h >>> 0).toString(36)}`;
};

const feeds = {}; // region → { at, items }
async function headlines(region) {
  const hit = feeds[region];
  if (hit && Date.now() - hit.at < TTL) return hit.items;
  const list = (override && override[region]) || FEEDS[region];
  const results = await Promise.all(
    list.map((f) =>
      fetch(f.url, { headers: { "User-Agent": "NorthvaleLearn/0.1 (+educational news summaries)" }, signal: AbortSignal.timeout(8000) })
        .then((r) => (r.ok ? r.text() : ""))
        .then((xml) => parseRss(xml, f.source))
        .catch(() => [])
    )
  );
  // Newest first, one per story, a handful per region.
  const seen = new Set();
  const items = results
    .flat()
    .sort((a, b) => (b.published || "").localeCompare(a.published || ""))
    .filter((x) => !SKIP.test(x.title) && !seen.has(x.link) && seen.add(x.link))
    .slice(0, PER_REGION)
    .map((x) => ({ ...x, id: idOf(x.link) }));
  if (items.length || !hit) feeds[region] = { at: Date.now(), items };
  return feeds[region].items;
}

const explained = {}; // `${id}:${lang}:${region}` → { headline, summary, terms }
const pending = {};

export async function getNews({ lang, region }, ai) {
  const items = await headlines(region);
  if (ai) {
    const missing = items.filter((x) => !explained[`${x.id}:${lang}:${region}`]);
    if (missing.length) {
      const k = `${lang}:${region}:${missing.map((x) => x.id).join(",")}`;
      // One request at a time for the same set; others wait for it.
      pending[k] ||= ai
        .explainNews(missing, lang, region)
        .then((rows) => {
          // ponytail: a plain object capped by clearing — summaries are cheap to redo.
          if (Object.keys(explained).length > 3000) for (const k of Object.keys(explained)) delete explained[k];
          rows.forEach((r) => (explained[`${r.id}:${lang}:${region}`] = r));
          // Any the AI skipped (or that were dropped as suspicious) stay
          // headline-only, so they aren't paid for again on every visit.
          missing.forEach((x) => (explained[`${x.id}:${lang}:${region}`] ||= { headline: null, summary: null, terms: [] }));
        })
        .catch((e) => console.error("news summaries:", e.message))
        .finally(() => delete pending[k]);
      await pending[k];
    }
  }
  return {
    ai: !!ai,
    items: items.map((x) => {
      const e = explained[`${x.id}:${lang}:${region}`];
      return { id: x.id, title: x.title, link: x.link, source: x.source, published: x.published, headline: e ? e.headline : null, summary: e ? e.summary : null, terms: e ? e.terms : [] };
    }),
  };
}
