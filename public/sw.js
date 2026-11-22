const STATIC_CACHE = 'umay-static-v4';
const API_CACHE = 'umay-api-v1';
const CACHE_ALLOWLIST = new Set([STATIC_CACHE, API_CACHE]);

self.addEventListener('install', (event) => {
  event.waitUntil(
    caches
      .open(STATIC_CACHE)
      .then((cache) =>
        cache.addAll(['/umay-icon.svg', '/assets/images/umay-brand-logo.png']),
      )
      .catch(() => undefined),
  );
  self.skipWaiting();
});

self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches
      .keys()
      .then((keys) =>
        Promise.all(
          keys
            .filter((key) => !CACHE_ALLOWLIST.has(key))
            .map((key) => caches.delete(key)),
        ),
      )
      .then(() => self.clients.claim()),
  );
});

async function networkFirstWithCache(request, cacheName) {
  try {
    const response = await fetch(request);
    if (cacheName && response.ok) {
      const clone = response.clone();
      caches.open(cacheName).then((cache) => cache.put(request, clone));
    }
    return response;
  } catch {
    const cached = await caches.match(request);
    return cached ?? Response.error();
  }
}

self.addEventListener('fetch', (event) => {
  const { request } = event;
  if (request.method !== 'GET') return;
  if (request.cache === 'only-if-cached' && request.mode !== 'same-origin') {
    return;
  }

  const url = new URL(request.url);
  if (url.origin !== self.location.origin) return;

  if (
    url.pathname.startsWith('/api/auth/') ||
    url.pathname.startsWith('/_next/') ||
    request.headers.get('rsc') === '1' ||
    url.searchParams.has('_rsc')
  ) {
    return;
  }

  if (url.pathname.startsWith('/api/inventory/')) {
    event.respondWith(networkFirstWithCache(request, API_CACHE));
    return;
  }

  event.respondWith(networkFirstWithCache(request, null));
});
