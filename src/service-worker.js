const VERSION = 'v1';
const STATIC_CACHE = `story-static-${VERSION}`;
const DYNAMIC_CACHE = `story-dynamic-${VERSION}`;
const OFFLINE_PAGE = '/offline.html';
const ASSETS = [
  '/',
  '/index.html',
  '/app.css',
  '/manifest.json',
  '/icons/icon-192.png',
  '/icons/icon-512.png',
  '/app.bundle.js'
];

// Install: cache app shell + offline page
self.addEventListener('install', (event) => {
  self.skipWaiting();
  event.waitUntil(
    caches.open(STATIC_CACHE).then(async (cache) => {
      try {
        await cache.addAll(ASSETS);
        await cache.add(OFFLINE_PAGE);
      } catch (err) {
        // Some assets may fail on dev, ignore
        console.warn('Cache prefetch failed', err);
      }
    })
  );
});

// Activate: cleanup old caches
self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((keys) =>
      Promise.all(
        keys
          .filter((key) => key !== STATIC_CACHE && key !== DYNAMIC_CACHE)
          .map((key) => caches.delete(key))
      )
    )
  );
  self.clients.claim();
});

// Fetch: cache-first for static assets, network-first for API, fallback to offline page
self.addEventListener('fetch', (event) => {
  const { request } = event;
  const url = new URL(request.url);

  // Skip: non-GET atau ekstensi Chrome
  if (
    request.method !== 'GET' ||
    url.protocol.startsWith('chrome-extension')
  ) {
    return;
  }

  // Network-first untuk API stories
  if (url.pathname.includes('/stories')) {
    event.respondWith(
      fetch(request)
        .then((response) => {
          // Simpan hasil ke dynamic cache
          const clonedResponse = response.clone();
          caches.open(DYNAMIC_CACHE).then((cache) => {
            cache.put(request, clonedResponse);
          });
          return response;
        })
        .catch(async () => {
          // Gunakan cache jika offline
          const cachedResponse = await caches.match(request);
          if (cachedResponse) {
            return cachedResponse;
          }
          // fallback terakhir
          return caches.match(OFFLINE_PAGE);
        })
    );
    return;
  }

  // Cache-first for same-origin static assets
  event.respondWith(
    caches.match(request).then((cached) => {
      return cached || fetch(request).then((res) => {
        // Put into dynamic cache
        return caches.open(DYNAMIC_CACHE).then((cache) => {
          cache.put(request, res.clone());
          return res;
        });
      }).catch(() => caches.match(OFFLINE_PAGE));
    })
  );
});

// === Push notification handling (basic, skilled, advanced) ===
self.addEventListener('push', (event) => {
  let payload = { title: 'Story App', body: 'Ada pembaruan terbaru', url: '/', icon: '/icons/icon-192.png' };
  if (event.data) {
    try {
      payload = event.data.json(); // Dinamis dari API (skilled: judul, icon, pesan)
    } catch (e) {
      payload = { title: 'Story App', body: event.data.text(), url: '/', icon: '/icons/icon-192.png' };
    }
  }

  const options = {
    body: payload.body,
    icon: payload.icon || '/icons/icon-192.png',
    badge: '/icons/icon-192.png',
    data: {
      url: payload.url || '/',
    },
    actions: payload.actions || [ // Advanced: actions untuk navigasi
      { action: 'view', title: 'Lihat Detail', icon: '/icons/icon-192.png' }
    ],
  };

  event.waitUntil(self.registration.showNotification(payload.title, options));
});

// Notification click: handle actions and open client (advanced: navigasi ke detail)
self.addEventListener('notificationclick', (event) => {
  event.notification.close();
  let url = event.notification.data && event.notification.data.url ? event.notification.data.url : '/';

  // Jika action 'view' diklik, navigasi ke detail (misalnya, /detail/storyId)
  if (event.action === 'view') {
    url = event.notification.data.url; // Asumsi URL detail dari payload
  }

  event.waitUntil(
    clients.matchAll({ type: 'window', includeUncontrolled: true }).then((clientList) => {
      for (const client of clientList) {
        if (client.url === url && 'focus' in client) return client.focus();
      }
      if (clients.openWindow) return clients.openWindow(url);
    })
  );
});