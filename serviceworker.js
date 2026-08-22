// ============================================================
//  AUTODESTRUCCIÓN
//
//  Sustituye al service worker de la app anterior, que estaba
//  sirviendo la versión vieja desde la caché e impidiendo que
//  llegara la nueva.
//
//  Al activarse: borra todas las cachés, se desinstala a sí mismo
//  y recarga las ventanas abiertas para que entre la app buena.
//  Después de eso, deja de existir.
// ============================================================

self.addEventListener('install', function () {
  self.skipWaiting();
});

self.addEventListener('activate', function (event) {
  event.waitUntil(
    caches.keys()
      .then(function (nombres) {
        return Promise.all(nombres.map(function (n) { return caches.delete(n); }));
      })
      .then(function () {
        return self.registration.unregister();
      })
      .then(function () {
        return self.clients.matchAll({ type: 'window' });
      })
      .then(function (ventanas) {
        ventanas.forEach(function (v) {
          try { v.navigate(v.url); } catch (e) {}
        });
      })
      .catch(function () {})
  );
});

// Mientras siga vivo, nunca sirve nada desde la caché: todo a la red.
self.addEventListener('fetch', function (event) {
  event.respondWith(fetch(event.request));
});
