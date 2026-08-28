/* ASYSTENT FLOTY — service worker (wzorzec rodziny: shell cache-first).
   Konwencja nazwy cache: asystent-vNN — NUMER podbijać przy KAŻDEJ zmianie
   plików aplikacji (inaczej przeglądarki podadzą stare pliki z cache).
   Stopka w aplikacji pokazuje 'asystent-vNN' — patrz obsługa message. */
var WERSJA_CACHE = 'asystent-v4';   /* v4: pelna paleta rodzajow v93 + ikony HDS,przyczepa,quad */
var SHELL = [
  './', './index.html', './config.js', './manifest.json',
  './ikona-192.png', './ikona-512.png',
  './ikona-192-maskable.png', './ikona-512-maskable.png'
];

self.addEventListener('install', function (e) {
  e.waitUntil(caches.open(WERSJA_CACHE).then(function (c) { return c.addAll(SHELL); })
    .then(function () { return self.skipWaiting(); }));
});

self.addEventListener('activate', function (e) {
  e.waitUntil(caches.keys().then(function (klucze) {
    return Promise.all(klucze.map(function (k) {
      if (k !== WERSJA_CACHE) return caches.delete(k);
    }));
  }).then(function () { return self.clients.claim(); }));
});

self.addEventListener('fetch', function (e) {
  if (e.request.method !== 'GET') return;              /* API (POST) zawsze z sieci */
  var url = new URL(e.request.url);
  if (url.origin !== location.origin) return;          /* obce hosty: nie ruszamy */
  e.respondWith(
    caches.match(e.request, { ignoreSearch: true }).then(function (r) {
      return r || fetch(e.request);
    })
  );
});

/* stopka wersji pyta workera o nazwę cache (wzorzec W-22 z Floty) */
self.addEventListener('message', function (e) {
  if (e.data && e.data.typ === 'wersja' && e.ports && e.ports[0])
    e.ports[0].postMessage({ wersja: WERSJA_CACHE });
});
