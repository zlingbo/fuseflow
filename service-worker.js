const CACHE_VERSION = 'v4';
const CACHE_NAME = `spark-cache-${CACHE_VERSION}`;
const PRECACHE = ['/', '/index.html', '/manifest.webmanifest', '/icon.png'];
const RUNTIME_CACHE_ORIGINS = [
  self.location.origin,
  'https://aistudiocdn.com',
  'https://cdn.jsdelivr.net'
];

self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => cache.addAll(PRECACHE)).then(() => self.skipWaiting())
  );
});

self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((keys) =>
      Promise.all(keys.filter((key) => key !== CACHE_NAME).map((key) => caches.delete(key)))
    ).then(() => self.clients.claim())
  );
});

self.addEventListener('fetch', (event) => {
  const { request } = event;
  if (request.method !== 'GET') return;

  const url = new URL(request.url);
  const isSameOrigin = url.origin === self.location.origin;
  const isRuntimeAllowed = RUNTIME_CACHE_ORIGINS.includes(url.origin);

  if (request.mode === 'navigate') {
    event.respondWith(handleNavigation(request));
    return;
  }

  if (isSameOrigin || isRuntimeAllowed) {
    event.respondWith(staleWhileRevalidate(request));
  }
});

async function handleNavigation(request) {
  try {
    const networkResponse = await fetch(request);
    if (networkResponse && networkResponse.ok) {
      const cache = await caches.open(CACHE_NAME);
      cache.put('/index.html', networkResponse.clone());
      return networkResponse;
    }
  } catch (err) {
  }

  // Fallback to cached shell when network fails or returns non-OK
  const cachedIndex = await caches.match('/index.html');
  if (cachedIndex) return cachedIndex;
  return new Response('offline', { status: 503, statusText: 'Offline' });
}

async function staleWhileRevalidate(request) {
  const cache = await caches.open(CACHE_NAME);
  const cached = await cache.match(request);

  const networkPromise = fetch(request)
    .then((response) => {
      if (response && response.status === 200) {
        cache.put(request, response.clone());
      }
      return response;
    })
    .catch(() => undefined);

  if (cached) {
    return cached;
  }

  const network = await networkPromise;
  if (network) return network;

  // As a last resort, try index.html for same-origin navigations that were not caught
  if (request.mode === 'navigate') {
    const fallback = await cache.match('/index.html');
    if (fallback) return fallback;
  }

  return new Response('offline', { status: 503, statusText: 'Offline' });
}
