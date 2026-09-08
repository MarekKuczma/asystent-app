/* ASYSTENT FLOTY — service worker (wzorzec rodziny: shell cache-first).
   Konwencja nazwy cache: asystent-vNN — NUMER podbijać przy KAŻDEJ zmianie
   plików aplikacji (inaczej przeglądarki podadzą stare pliki z cache).
   Stopka w aplikacji pokazuje 'asystent-vNN' — patrz obsługa message. */
var WERSJA_CACHE = 'asystent-v25';  /* v25 (08.09.2026, A-22 + A-23): swieza sprawa nie moze byc niewidzialna — nowa sekcja „Swieze sprawy · ostatnie 7 dni" na Pulsie i w mailu, spokojna, bez plakietek. Priorytet „Pilne": sprawa oznaczona jako pilna alarmuje OD PIERWSZEGO DNIA, bez progow, i stoi na samej gorze. Powod: Z0014 (przeglad gwarancyjny CAT-a przy 500 mth) lezalo dwa dni robocze i nie bylo widac go NIGDZIE — prog dla „Nowe" to 2 dni robocze, a sprawa miala dokladnie 2. Prog mierzy bezczynnosc, nie pilnosc. */  /* v24 (08.09.2026, A-18 + A-20): status „Wstrzymane" — sprawa zyje, ale czeka na kogos innego, wiec straznik o niej milczy do daty „Wstrzymane do" (pusto = bezterminowo, raz w miesiacu jedna linijka). Sprawy wstrzymane wypadaja ze wszystkich regul Pulsu i maja wlasny chip w zakladce Sprawy. A-20: „Wykonane bez faktury" przestaje byc alarmem — schodzi do spokojnej linijki „Do rozliczenia: N". Powod obu zmian policzony na danych 08.09: 9 z 12 alarmow w mailu bylo szumem. */  /* v23 (03.09.2026, A-17): Skrzynka da sie porzadkowac z aplikacji — tryb „Porzadkuj" (wariant C z makiety), odrzucanie wpisu z powodem, zwinieta lista odrzuconych z „Wroc do kolejki" i „Wyczysc odrzucone". Backend API v5: akcja `oznacz` + AUTOMAT ustawiajacy Stan=przetworzone dla wpisow, ktore trafily do bazy (koniec recznego odznaczania w arkuszu). */
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
