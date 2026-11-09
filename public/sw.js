// Veritas Forensic Progressive Web App Service Worker
// Strategy: Network-First with Auto-Update (User never needs to hard-refresh)

const CACHE_NAME = 'veritas-v' + (self.__BUILD_VERSION__ || Date.now());

// Immediate installation: do not wait for old service worker to finish
self.addEventListener('install', (event) => {
  self.skipWaiting();
});

// Immediate activation: take control of all open client tabs immediately
self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((keys) =>
      Promise.all(
        keys.map((key) => {
          if (key !== CACHE_NAME) {
            return caches.delete(key);
          }
        })
      )
    ).then(() => self.clients.claim())
  );
});

// Listen for update message from clients
self.addEventListener('message', (event) => {
  if (event.data && event.data.type === 'SKIP_WAITING') {
    self.skipWaiting();
  }
});

// Fetch policy: Network-first for HTML and API requests to ensure instant update delivery.
// Static assets (scripts, styles, fonts) fallback to cache for offline speed.
self.addEventListener('fetch', (event) => {
  const url = new URL(event.request.url);

  // Bypass non-GET and API / dynamic endpoints
  if (event.request.method !== 'GET' || url.pathname.startsWith('/api/')) {
    return;
  }

  // Network-first strategy for navigation (HTML) so new deployments take effect on next view
  if (event.request.mode === 'navigate') {
    event.respondWith(
      fetch(event.request)
        .then((response) => {
          if (response && response.status === 200) {
            const responseClone = response.clone();
            caches.open(CACHE_NAME).then((cache) => cache.put(event.request, responseClone));
          }
          return response;
        })
        .catch(() => caches.match(event.request) || caches.match('/index.html'))
    );
    return;
  }

  // Stale-while-revalidate for hashed static assets
  event.respondWith(
    caches.match(event.request).then((cachedResponse) => {
      const fetchPromise = fetch(event.request).then((networkResponse) => {
        if (networkResponse && networkResponse.status === 200) {
          const responseClone = networkResponse.clone();
          caches.open(CACHE_NAME).then((cache) => cache.put(event.request, responseClone));
        }
        return networkResponse;
      }).catch(() => cachedResponse);

      return cachedResponse || fetchPromise;
    })
  );
});
