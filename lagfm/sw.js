const CACHE_NAME = 'lagfm-v2'; // Incrementamos versión para forzar actualización
const ASSETS = [
  'lagfm_web.html',
  'streams.json',
  'icon.png'
];

self.addEventListener('install', (e) => {
  self.skipWaiting(); // Forzamos a que el nuevo SW tome el control de inmediato
  e.waitUntil(
    caches.open(CACHE_NAME).then((cache) => cache.addAll(ASSETS))
  );
});

self.addEventListener('activate', (e) => {
  e.waitUntil(
    caches.keys().then((keys) => {
      return Promise.all(
        keys.filter((key) => key !== CACHE_NAME).map((key) => caches.delete(key))
      );
    })
  );
});

self.addEventListener('fetch', (e) => {
  e.respondWith(
    caches.match(e.request).then((response) => response || fetch(e.request))
  );
});
