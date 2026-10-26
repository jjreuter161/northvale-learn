// TELLING YOU WHEN SOMETHING BREAKS — a short message to a chat webhook
// (ALERT_WEBHOOK_URL: a Discord or Slack "incoming webhook" URL) for new
// errors and AI spending at 80% / 100% of the month's budget. The same
// alert goes out at most once an hour. Without a webhook, alerts only go
// to the server log (and errors show on the admin page).
const URL_ = process.env.ALERT_WEBHOOK_URL || "";
const sent = new Map();

export function alert(key, text) {
  const now = Date.now();
  if (sent.has(key) && now - sent.get(key) < 3600000) return;
  sent.set(key, now);
  console.error(`[alert] ${text}`);
  if (!/^https:\/\//.test(URL_)) return;
  // Discord reads "content", Slack reads "text".
  fetch(URL_, { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ content: `Northvale Learn: ${text}`, text: `Northvale Learn: ${text}` }), signal: AbortSignal.timeout(5000) }).catch(() => {});
}
