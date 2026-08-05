const CACHE = 'foodco-v3';

self.addEventListener('install', e => {
  e.waitUntil(self.skipWaiting());
});

self.addEventListener('activate', e => {
  e.waitUntil(
    caches.keys().then(keys => Promise.all(keys.map(k => caches.delete(k))))
      .then(() => self.clients.claim())
  );
});

self.addEventListener('fetch', e => {
  // Only handle GET requests
  if (e.request.method !== 'GET') return;

  // Never intercept API, auth, or Supabase calls
  const url = e.request.url;
  if (url.includes('/api/') || url.includes('supabase.co') || url.includes('sentry') || url.includes('vercel')) return;

  // Network-first: always try network, fall back to cache only if offline
  e.respondWith(
    fetch(e.request).then(res => {
      const clone = res.clone();
      caches.open(CACHE).then(c => c.put(e.request, clone));
      return res;
    }).catch(() => caches.match(e.request))
  );
});
