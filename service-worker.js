self.addEventListener('install', (event) => {
  self.skipWaiting();
});

self.addEventListener('activate', (event) => {
  event.waitUntil(self.clients.claim());
});

// Simple cache-first for navigation and static assets
const CACHE_NAME = 'spark-cache-v1';
const PRECACHE = [
  '/',
  '/index.html',
  '/manifest.webmanifest'
];

self.addEventListener('fetch', (event) => {
  const { request } = event;
  if (request.method !== 'GET') return;

  if (request.mode === 'navigate') {
    event.respondWith(
      caches.match('/index.html', { cacheName: CACHE_NAME }).then((cached) => {
        return cached || fetch(request);
      })
    );
    return;
  }

  if (PRECACHE.includes(new URL(request.url).pathname)) {
    event.respondWith(
      caches.open(CACHE_NAME).then((cache) =>
        cache.match(request).then((cached) => {
          if (cached) return cached;
          return fetch(request).then((resp) => {
            cache.put(request, resp.clone());
            return resp;
          });
        })
      )
    );
  }
});

