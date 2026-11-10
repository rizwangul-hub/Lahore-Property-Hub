const CACHE_NAME = 'property-in-lahore-v1';
const SHELL_URLS = [
  '/offline.html',
  '/manifest.webmanifest',
  '/favicon.ico',
  '/icon-192.png',
  '/icon-512.png',
  '/apple-touch-icon.png',
];

self.addEventListener('install', (event) => {
  event.waitUntil(
    caches
      .open(CACHE_NAME)
      .then((cache) => cache.addAll(SHELL_URLS))
      .then(() => self.skipWaiting())
  );
});

self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches
      .keys()
      .then((keys) =>
        Promise.all(
          keys
            .filter((key) => key.startsWith('property-in-lahore-') && key !== CACHE_NAME)
            .map((key) => caches.delete(key))
        )
      )
      .then(() => self.clients.claim())
  );
});

self.addEventListener('fetch', (event) => {
  const request = event.request;
  if (request.method !== 'GET' || request.headers.has('authorization')) {
    return;
  }

  const url = new URL(request.url);
  if (url.origin !== self.location.origin) return;

  if (
    url.pathname.startsWith('/admin') ||
    url.pathname.startsWith('/api') ||
    url.pathname.startsWith('/auth') ||
    url.pathname.startsWith('/_next/data')
  ) {
    return;
  }

  if (request.mode === 'navigate') {
    event.respondWith(
      fetch(request)
        .then((response) => {
          const isHomeShell = url.pathname === '/' && url.search === '';
          const cacheControl = response.headers.get('Cache-Control') || '';
          if (
            isHomeShell &&
            response.ok &&
            !/\b(private|no-store)\b/i.test(cacheControl)
          ) {
            const copy = response.clone();
            event.waitUntil(caches.open(CACHE_NAME).then((cache) => cache.put('/', copy)));
          }
          return response;
        })
        .catch(async () => {
          const offlinePage = await caches.match('/offline.html');
          return offlinePage || Response.error();
        })
    );
    return;
  }

  if (url.pathname.startsWith('/_next/static/')) {
    event.respondWith(
      fetch(request)
        .then((response) => {
          if (response.ok && response.type === 'basic') {
            const copy = response.clone();
            event.waitUntil(caches.open(CACHE_NAME).then((cache) => cache.put(request, copy)));
          }
          return response;
        })
        .catch(async () => {
          const cachedAsset = await caches.match(request);
          return cachedAsset || Response.error();
        })
    );
    return;
  }

  if (SHELL_URLS.includes(url.pathname)) {
    event.respondWith(
      fetch(request)
        .then((response) => {
          if (response.ok && response.type === 'basic') {
            const copy = response.clone();
            event.waitUntil(caches.open(CACHE_NAME).then((cache) => cache.put(request, copy)));
          }
          return response;
        })
        .catch(async () => {
          const cachedAsset = await caches.match(request);
          return cachedAsset || Response.error();
        })
    );
  }
});
