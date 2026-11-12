const CACHE_NAME = 'tu-biblia-digital-v2';

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

self.addEventListener('install', event => {
  self.skipWaiting();
  event.waitUntil(
    caches.open(CACHE_NAME).then(cache => {
      // addAll blindado para que se instale sin importar fallos de red puntuales
      return Promise.allSettled(
        FILES_TO_CACHE.map(url => cache.add(url))
      );
    })
  );
});

self.addEventListener('activate', event => {
  event.waitUntil(
    caches.keys().then(keys => {
      return Promise.all(
        keys.map(key => {
          if (key !== CACHE_NAME) {
            return caches.delete(key); // Destruye cualquier caché vieja congelada
          }
        })
      );
    }).then(() => self.clients.claim())
  );
});

self.addEventListener('fetch', event => {
  const url = new URL(event.request.url);

  // Para la navegación e index.html: Network-First (primero pide la versión nueva al servidor)
  if (event.request.mode === 'navigate' || url.pathname === '/' || url.pathname.endsWith('index.html')) {
    event.respondWith(
      fetch(event.request)
        .then(response => {
          if (response && response.status === 200) {
            const resClone = response.clone();
            caches.open(CACHE_NAME).then(cache => cache.put(event.request, resClone));
          }
          return response;
        })
        .catch(() => caches.match(event.request).then(res => res || caches.match('/index.html')))
    );
    return;
  }

  // Para los demás archivos (SpaRV.json, iconos, imágenes): Caché primero, red después
  event.respondWith(
    caches.match(event.request).then(response => response || fetch(event.request))
  );
});
