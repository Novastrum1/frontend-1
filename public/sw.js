/* VELTRIXAE PWA shell. Never cache API, wallet, quote, or transaction data. */
const CACHE_NAME = "veltrixae-shell-v1";
const SHELL_PATHS = ["/", "/app", "/offline", "/icon.svg"];

self.addEventListener("install", (event) => {
  event.waitUntil(caches.open(CACHE_NAME).then((cache) => cache.addAll(SHELL_PATHS)));
  self.skipWaiting();
});

self.addEventListener("activate", (event) => {
  event.waitUntil(
    caches.keys().then((keys) => Promise.all(keys.filter((key) => key.startsWith("veltrixae-shell-") && key !== CACHE_NAME).map((key) => caches.delete(key)))),
  );
  self.clients.claim();
});

function isShellPath(pathname) {
  return pathname === "/" || pathname === "/app" || pathname === "/offline";
}

function isStaticAsset(pathname) {
  return pathname.startsWith("/_next/static/") || /\.(?:css|js|woff2?|png|svg|ico)$/i.test(pathname);
}

self.addEventListener("fetch", (event) => {
  const { request } = event;
  if (request.method !== "GET") return;

  const url = new URL(request.url);
  if (url.origin !== self.location.origin || url.pathname.startsWith("/api/")) return;

  if (request.mode === "navigate") {
    event.respondWith(
      fetch(request)
        .then((response) => {
          if (response.ok && isShellPath(url.pathname)) {
            void caches.open(CACHE_NAME).then((cache) => cache.put(request, response.clone()));
          }
          return response;
        })
        .catch(async () => (await caches.match(request)) || (await caches.match("/offline"))),
    );
    return;
  }

  if (!isStaticAsset(url.pathname)) return;

  event.respondWith(
    caches.match(request).then((cached) => {
      const network = fetch(request)
        .then((response) => {
          if (response.ok) void caches.open(CACHE_NAME).then((cache) => cache.put(request, response.clone()));
          return response;
        })
        .catch(() => cached);
      return cached || network;
    }),
  );
});
