const CACHE_NAME = 'tu-biblia-digital-v4';
const CACHE_PREFIX = 'tu-biblia-digital-';

const FILES_TO_CACHE = [
  '/',
  '/index.html',
  '/SpaRV.json',
  '/manifest.json',
  '/icon-192.png',
  '/icon-512.png',
  '/apple-touch-icon.png',
  encodeURI('/Tú_Biblia_Digital_logo_design_68386b2e_2K.jpg')
];

// INSTALACIÓN: guardar todos los archivos necesarios
self.addEventListener('install', event => {
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then(cache => cache.addAll(FILES_TO_CACHE))
      .then(() => self.skipWaiting())
  );
});

// ACTIVACIÓN: eliminar solo las cachés antiguas de esta aplicación
self.addEventListener('activate', event => {
  event.waitUntil(
    caches.keys()
      .then(keys => Promise.all(
        keys
          .filter(key =>
            key.startsWith(CACHE_PREFIX) &&
            key !== CACHE_NAME
          )
          .map(key => caches.delete(key))
      ))
      .then(() => self.clients.claim())
  );
});

// PETICIONES: funcionamiento online y offline
self.addEventListener('fetch', event => {
  const request = event.request;

  // Solo gestionar peticiones GET del mismo origen
  if (request.method !== 'GET') return;

  const url = new URL(request.url);
  if (url.origin !== self.location.origin) return;

  // HTML: intentar obtener la versión más reciente
  if (
    request.mode === 'navigate' ||
    url.pathname === '/' ||
    url.pathname.endsWith('/index.html')
  ) {
    event.respondWith(
      (async () => {
        try {
          const response = await fetch(request);

          if (response.ok) {
            const cache = await caches.open(CACHE_NAME);
            await cache.put(request, response.clone());
          }

          return response;
        } catch (error) {
          const cached = await caches.match(request);

          if (cached) return cached;

          const fallback = await caches.match('/index.html');

          if (fallback) return fallback;

          throw error;
        }
      })()
    );
    return;
  }

  // Biblia, iconos y recursos: utilizar caché primero
  event.respondWith(
    (async () => {
      const cached = await caches.match(request);

      if (cached) return cached;

      const response = await fetch(request);

      if (response.ok) {
        const cache = await caches.open(CACHE_NAME);
        await cache.put(request, response.clone());
      }

      return response;
    })()
  );
});
