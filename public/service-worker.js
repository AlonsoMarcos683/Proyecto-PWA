
const VERSION = "v1.1.0";
const STATIC_CACHE  = `static-${VERSION}`;
const DYNAMIC_CACHE = `dynamic-${VERSION}`;
const IMAGE_CACHE   = `images-${VERSION}`;

const APP_SHELL = [
  "/",            // SPA
  "/index.html",
  "/offline.html",
];

const NAV_CACHE_WHITELIST = new Set([
  "/",               
  "/index.html",
]);

async function limitCache(cacheName, maxItems = 60) {
  const cache = await caches.open(cacheName);
  const keys = await cache.keys();
  if (keys.length > maxItems) {
    await cache.delete(keys[0]);
    return limitCache(cacheName, maxItems);
  }
}

self.addEventListener("install", (event) => {
  event.waitUntil(
    caches.open(STATIC_CACHE).then((cache) => cache.addAll(APP_SHELL))
  );
});

self.addEventListener("activate", (event) => {
  event.waitUntil(
    (async () => {
      const keys = await caches.keys();
      await Promise.all(
        keys
          .filter((k) => ![STATIC_CACHE, DYNAMIC_CACHE, IMAGE_CACHE].includes(k))
          .map((k) => caches.delete(k))
      );
      await self.clients.claim();
    })()
  );
});

self.addEventListener("fetch", (event) => {
  const req = event.request;
  const url = new URL(req.url);

  if (req.mode === "navigate") {
    event.respondWith(networkFirstForPages(req));
    return;
  }

  const dest = req.destination; 
  if (dest === "style" || dest === "script" || dest === "font") {
    event.respondWith(cacheFirst(req, STATIC_CACHE));
    return;
  }

  if (dest === "image") {
    event.respondWith(staleWhileRevalidate(req, IMAGE_CACHE, 120));
    return;
  }
  if (url.pathname.startsWith("/api/")) {
    event.respondWith(networkFirstForAPI(req));
    return;
  }

  event.respondWith(defaultNetworkWithCacheFallback(req));
});

async function networkFirstForPages(req) {
  try {
    const ctrl = new AbortController();
    const id = setTimeout(() => ctrl.abort(), 5000); 
    const res = await fetch(req, { signal: ctrl.signal });
    clearTimeout(id);

    const { pathname } = new URL(req.url);
    if (NAV_CACHE_WHITELIST.has(pathname)) {
      const cache = await caches.open(DYNAMIC_CACHE);
      cache.put(req, res.clone());
    }
    return res;
  } catch (err) {
    const cached = await caches.match(req);
    if (cached) return cached;
    return caches.match("/offline.html");
  }
}

async function cacheFirst(req, cacheName) {
  const cached = await caches.match(req);
  if (cached) return cached;
  const res = await fetch(req);
  const cache = await caches.open(cacheName);
  cache.put(req, res.clone());
  return res;
}

async function staleWhileRevalidate(req, cacheName, maxItems = 60) {
  const cache = await caches.open(cacheName);
  const cachedPromise = cache.match(req);

  const fetchPromise = fetch(req)
    .then((res) => {
      if (res && res.status === 200 && res.type !== "error") {
        cache.put(req, res.clone());
        limitCache(cacheName, maxItems);
      }
      return res;
    })
    .catch(() => null);

  const cached = await cachedPromise;
  return cached || (await fetchPromise) || new Response(null, { status: 504 });
}

async function networkFirstForAPI(req) {
  try {
    const ctrl = new AbortController();
    const id = setTimeout(() => ctrl.abort(), 7000); 
    const res = await fetch(req, { signal: ctrl.signal });
    clearTimeout(id);

    if (req.method === "GET" && res && res.status === 200) {
      const cache = await caches.open(DYNAMIC_CACHE);
      cache.put(req, res.clone());
      limitCache(DYNAMIC_CACHE, 80);
    }
    return res;
  } catch (err) {
    const cached = await caches.match(req);
    if (cached) return cached;
    return new Response(JSON.stringify({ error: "Offline" }), {
      headers: { "Content-Type": "application/json" },
      status: 503,
    });
  }
}

async function defaultNetworkWithCacheFallback(req) {
  try {
    return await fetch(req);
  } catch {
    const cached = await caches.match(req);
    if (cached) return cached;
    if (req.destination === "document") {
      return caches.match("/offline.html");
    }
    return new Response(null, { status: 504 });
  }
}

self.addEventListener("message", (event) => {
  const data = event.data;
  if (data && (data === "SKIP_WAITING" || data?.type === "SKIP_WAITING")) {
    self.skipWaiting();
  }
});
