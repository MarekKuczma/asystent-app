/* ASYSTENT FLOTY — service worker (wzorzec rodziny: shell cache-first).
   Konwencja nazwy cache: asystent-vNN — NUMER podbijać przy KAŻDEJ zmianie
   plików aplikacji (inaczej przeglądarki podadzą stare pliki z cache).
   Stopka w aplikacji pokazuje 'asystent-vNN' — patrz obsługa message. */
var WERSJA_CACHE = 'asystent-v33';  /* v31 (12.09.2026, A-33): wpis ze Skrzynki na Pulsie rozwija sie POJEDYNCZO — tapniecie w tresc pokazuje CALA podyktowana wiadomosc, drugie zwija. Powod: tresc urywala sie po 70 znakach i zeby ja doczytac, trzeba bylo isc do zakladki „Wpisy". Krotki wpis nie dostaje guzika (nie ma czego rozwijac), skrot ucinamy na GRANICY SLOWA, a klik lapiemy na tresci, nie na calym wierszu — krzyzyk „Odrzuc" w trybie „Porzadkuj" dziala jak dotad. Zwija sie POJEDYNCZY wpis, nie cala sekcja. */  /* v30 (12.09.2026, A-32): PORZADEK W PULSIE. Zmierzone na zywych danych: 7 sekcji i 1753 px (2,1 ekranu telefonu), z czego 60% zajmowaly sprawy, przy ktorych Marek nie ma zadnego ruchu. Teraz kolejnosc brzmi: co sie pali -> co wygasa -> co spokojne. ROZWINIETE zostaja „Dzis wymaga uwagi", „Twoje — do zrobienia, ale nie dzis" i „Terminy floty" (przesuniete WYZEJ, bo wygasajace OC i badanie to prawdziwe terminy, a nie czekanie). ZWINIETE do jednej linijki: czekamy na innych, czekaja na fakture, wstrzymane — zasada Marka: zwija sie tylko to, przy czym pilka jest po cudzej stronie. „Flota w liczbach" USUNIETA (0 wierszy do klikniecia, a „w serwisie" liczylo zamowione lusterko). Plakietka „termin DZIS" pokazuje godzine. Wynik: 1024 px, 5 sekcji. */  /* v29 (12.09.2026, A-27): karta sprawy pokazuje „TWOIMI SLOWAMI" — opis zgloszenia i WSZYSTKIE pozniejsze doslowne dopiski razem, a nie tylko pierwszy wpis. Skarga Marka nr 2 z 11.09: dopisek o przegladzie 1000 mth siedzial wylacznie w Historii. Zawsze widac zgloszenie i ostatnia wypowiedz; srodek zwija sie dopiero powyzej 3 wypowiedzi (PROG_TW). Historia przestaje POWTARZAC te slowa i odpowiada tylko na „co sie zmienilo i kiedy" — kazde zdanie stoi na ekranie dokladnie raz. Zasada „opis surowy nietykalny" (A-15) BEZ ZMIAN: to inny widok tego, co jest w bazie. */  /* v28 (11.09.2026, A-26): karta sprawy da sie przeczytac na telefonie. Notatka LAMIE LINIE (`white-space:pre-line`) — bez tego format STAN / ZOSTALO / UWAGA z A-25 sklejal sie w jeden blok. Etykieta „zmiana" w Historii przestaje byc plakietka (.pill ma nowrap) i staje sie zawijanym akapitem — zmierzone na Z0005: przedtem 4 elementy wychodzily poza ekran, najdluzszy do 875 px przy ekranie 420 px, po zmianie ZERO. Etykiety STAN:/ZOSTALO:/UWAGA: pogrubione (wybor Marka, wariant B z makiety). Kolory bez zmian — kontrast zmierzony 4,26:1 jasny / 5,63:1 ciemny, tyle samo co dotad. */  /* v27 (11.09.2026, A-28): wiersz wpisu ze Skrzynki na Pulsie pokazuje NUMER WPISU (S0005 itd.) na poczatku drugiej linijki, pogrubiony — tak samo jak robi to zakladka „Wpisy". Powod z zycia: Marek mial odrzucic S0005 i S0007 (Porzadkuj -> duplikat) i nie wiedzial, ktory wiersz to ktory. Numer niesie tez kopia wiersza na liscie odrzuconych. */  /* v26 (11.09.2026, A-30): „Dzis wymaga uwagi" pyta, CZYJA PILKA, a nie „jak dlugo sprawa stoi w statusie". Sprawa niesie dwa nowe pola: „Czekam na" (PUSTE = pilka Marka -> glosno) i „Zajac sie od" (data; przy cudzej pilce znaczy „wtedy dopytaj"). Puste pole ZAWSZE wrzuca sprawe na glosna strone. Nowe sekcje: „Zaplanowane — Twoje, ale nie dzis", „Czekamy na innych" z licznikiem ciszy, „Do rozliczenia" z liczba dni, wstrzymane zwiniete w jedna linijke. Sekcja „Swieze sprawy · 7 dni" (A-22) znika — dublowala te same kafelki. Powod zmiany, zmierzony na danych 11.09: Develon (czekamy na CUDZY telefon) stal NAD Fordem, ktorego Marek ma umowic, a Ford Pejsa nie miescil sie w progu i nie bylo go nigdzie. */  /* v25 (08.09.2026, A-22 + A-23): swieza sprawa nie moze byc niewidzialna — nowa sekcja „Swieze sprawy · ostatnie 7 dni" na Pulsie i w mailu, spokojna, bez plakietek. Priorytet „Pilne": sprawa oznaczona jako pilna alarmuje OD PIERWSZEGO DNIA, bez progow, i stoi na samej gorze. Powod: Z0014 (przeglad gwarancyjny CAT-a przy 500 mth) lezalo dwa dni robocze i nie bylo widac go NIGDZIE — prog dla „Nowe" to 2 dni robocze, a sprawa miala dokladnie 2. Prog mierzy bezczynnosc, nie pilnosc. */  /* v24 (08.09.2026, A-18 + A-20): status „Wstrzymane" — sprawa zyje, ale czeka na kogos innego, wiec straznik o niej milczy do daty „Wstrzymane do" (pusto = bezterminowo, raz w miesiacu jedna linijka). Sprawy wstrzymane wypadaja ze wszystkich regul Pulsu i maja wlasny chip w zakladce Sprawy. A-20: „Wykonane bez faktury" przestaje byc alarmem — schodzi do spokojnej linijki „Do rozliczenia: N". Powod obu zmian policzony na danych 08.09: 9 z 12 alarmow w mailu bylo szumem. */  /* v23 (03.09.2026, A-17): Skrzynka da sie porzadkowac z aplikacji — tryb „Porzadkuj" (wariant C z makiety), odrzucanie wpisu z powodem, zwinieta lista odrzuconych z „Wroc do kolejki" i „Wyczysc odrzucone". Backend API v5: akcja `oznacz` + AUTOMAT ustawiajacy Stan=przetworzone dla wpisow, ktore trafily do bazy (koniec recznego odznaczania w arkuszu). */
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
