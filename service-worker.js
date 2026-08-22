self.addEventListener('install', function () {
  self.skipWaiting();
});

self.addEventListener('activate', function (event) {
  event.waitUntil(
    caches.keys()
      .then(function (n) { return Promise.all(n.map(function (k) { return caches.delete(k); })); })
      .then(function () { return self.registration.unregister(); })
      .then(function () { return self.clients.matchAll({ type: 'window' }); })
      .then(function (v) { v.forEach(function (c) { try { c.navigate(c.url); } catch (e) {} }); })
      .catch(function () {})
  );
});

self.addEventListener('fetch', function (event) {
  event.respondWith(fetch(event.request));
});
