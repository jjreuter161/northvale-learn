// Offline: the app, its fonts and icons, and each unit once it has been
// opened (units load on demand, in web/chunks), come
// from the cache when there's no connection, so lessons, the practice
// portfolio (sample prices) and the goal simulator work offline; progress
// syncs when the connection is back. /api always goes to the network.
// Also shows the daily reminder (server/push.js) and opens the app on tap.
const CACHE = "northvale-learn-v5";
const SHELL = ["/", "/app.js", "/manifest.webmanifest", "/icon.svg", "/icon-192.png", "/icon-512.png", "/icon-180.png", "/fonts/inter-latin-wght-normal.woff2", "/fonts/inter-latin-ext-wght-normal.woff2", "/fonts/eb-garamond-latin-600-normal.woff2", "/fonts/fraunces-latin-soft-normal.woff2"];
self.addEventListener("install", (e) => e.waitUntil(caches.open(CACHE).then((c) => c.addAll(SHELL)).then(() => self.skipWaiting())));
self.addEventListener("activate", (e) => e.waitUntil(caches.keys().then((ks) => Promise.all(ks.filter((k) => k !== CACHE).map((k) => caches.delete(k)))).then(() => self.clients.claim())));
self.addEventListener("fetch", (e) => {
  const url = new URL(e.request.url);
  if (e.request.method !== "GET" || url.origin !== location.origin || url.pathname.startsWith("/api/")) return;
  // Network first, so updates arrive; cache as the fallback.
  e.respondWith(
    fetch(e.request)
      .then((r) => {
        const copy = r.clone();
        caches.open(CACHE).then((c) => c.put(e.request, copy));
        return r;
      })
      .catch(() => caches.match(e.request).then((r) => r || caches.match("/")))
  );
});

self.addEventListener("push", (e) => {
  let m = {};
  try {
    m = e.data.json();
  } catch {}
  e.waitUntil(self.registration.showNotification(m.title || "Northvale Learn", { body: m.body || "", tag: m.tag || "northvale-daily", icon: "/icon-192.png", data: { url: m.url || "/" } }));
});
self.addEventListener("notificationclick", (e) => {
  e.notification.close();
  const url = new URL((e.notification.data && e.notification.data.url) || "/", self.location.origin);
  if (url.origin !== self.location.origin) return;
  e.waitUntil(
    self.clients.matchAll({ type: "window", includeUncontrolled: true }).then((list) => {
      const open = list.find((c) => new URL(c.url).origin === self.location.origin);
      return open ? open.navigate(url.href).then((c) => (c || open).focus()) : self.clients.openWindow(url.href);
    })
  );
});
