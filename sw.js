// Pages load from the cache, and each launch quietly refreshes every file in the background,
// so a push reaches installed apps on their second launch. Bump CACHE only when ASSETS changes.
const CACHE = "stoa-v2";
const ASSETS = [
  "./",
  "index.html",
  "styles.css",
  "app.js",
  "quotes.js",
  "manifest.webmanifest",
  "icons/icon-192.png",
  "icons/icon-512.png",
  "icons/apple-touch-icon.png",
];

self.addEventListener("install", (event) => {
  event.waitUntil(
    caches.open(CACHE).then((cache) => cache.addAll(ASSETS)).then(() => self.skipWaiting()),
  );
});

self.addEventListener("activate", (event) => {
  event.waitUntil(
    caches.keys()
      .then((keys) => Promise.all(keys.filter((key) => key !== CACHE).map((key) => caches.delete(key))))
      .then(() => self.clients.claim()),
  );
});

// Swap in all files together or none, so a new app.js never runs against an old index.html.
async function download() {
  try {
    const responses = await Promise.all(
      ASSETS.map((url) => fetch(url, { cache: "no-cache" }).then((response) => {
        if (!response.ok) throw new Error(`${url}: ${response.status}`);
        return response;
      })),
    );
    const cache = await caches.open(CACHE);
    await Promise.all(responses.map((response, i) => cache.put(ASSETS[i], response)));
  } catch {
    // Offline or a failed download: keep the current copy and try again next launch.
  }
}

// Run downloads one after another, so an older download can never overwrite a newer one.
let queue = Promise.resolve();
function refresh() {
  queue = queue.then(download);
  return queue;
}

self.addEventListener("fetch", (event) => {
  const { request } = event;
  if (request.method !== "GET" || new URL(request.url).origin !== self.location.origin) return;
  if (request.mode === "navigate") event.waitUntil(refresh());
  event.respondWith(
    caches.match(request, { ignoreSearch: true }).then((cached) => {
      if (cached) return cached;
      if (request.mode === "navigate") {
        return fetch(request).catch(() => caches.match("index.html"));
      }
      return fetch(request);
    }),
  );
});
