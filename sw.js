const CACHE = 'squishy-game-v1.1';
const CORE = [
  '/',
  '/index.html',
  '/style.css',
  '/app.js',
  '/manifest.webmanifest',
  // Pastikan 20 gambar ini wujud dalam folder anda
  '/item11.png', '/item12.png', '/item13.png', '/item14.png', '/item15.png',
  '/item16.png', '/item17.png', '/item18.png', '/item19.png', '/item20.png', 
  // Ikon PWA
  '/icon-192.png', '/icon-512.png'
];

self.addEventListener('install', event => {
  event.waitUntil(
    caches.open(CACHE)
      .then(cache => cache.addAll(CORE))
      .then(() => self.skipWaiting())
  );
});

self.addEventListener('activate', event => {
  event.waitUntil(
    caches.keys().then(keys => Promise.all(
      keys.filter(key => key !== CACHE).map(key => caches.delete(key))
    )).then(() => self.clients.claim())
  );
});

self.addEventListener('fetch', event => {
  if (event.request.method !== 'GET') return;
  event.respondWith(
    caches.match(event.request).then(cached => {
      return cached || fetch(event.request).then(response => {
        return response;
      }).catch(() => new Response('', {status: 504}));
    })
  );
});