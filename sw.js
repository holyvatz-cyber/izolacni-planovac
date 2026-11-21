/* Service worker – umožní používat plánovač i bez připojení (např. na stavbě).
 * Při změně souborů zvyšte VERSION, aby si prohlížeče stáhly novou verzi. */
const VERSION = 'planovac-v5';
const ASSETS = [
  './', 'index.html', 'manifest.webmanifest',
  'css/app.css', 'css/fonts.css',
  'js/catalog.js', 'js/calc.js', 'js/dealers.js', 'js/analytics.js', 'js/app.js', 'js/pdf-export.js',
  'vendor/jspdf.umd.min.js', 'vendor/jspdf.plugin.autotable.min.js', 'vendor/pdf-assets.js',
  'assets/knauf-insulation-logo.png', 'assets/build-on-us.png', 'assets/icon-192.png', 'assets/icon-512.png',
  'assets/fonts/KnaufScreen-Regular.woff2', 'assets/fonts/KnaufScreen-Bold.woff2', 'assets/fonts/KnaufScreen-BoldItalic.woff2',
  'assets/fonts/KnaufScreenHead-Bold.woff2', 'assets/fonts/KnaufScreenNarrow-Bold.woff2',
];

self.addEventListener('install', (e) => {
  e.waitUntil(caches.open(VERSION).then((c) => c.addAll(ASSETS)).then(() => self.skipWaiting()));
});
self.addEventListener('activate', (e) => {
  e.waitUntil(caches.keys().then((keys) => Promise.all(keys.filter((k) => k !== VERSION).map((k) => caches.delete(k)))).then(() => self.clients.claim()));
});
/* Síť má přednost (vždy aktuální ceník), mezipaměť je záloha při výpadku. */
self.addEventListener('fetch', (e) => {
  const url = new URL(e.request.url);
  if (e.request.method !== 'GET' || url.origin !== self.location.origin) return;
  e.respondWith(
    fetch(e.request).then((res) => {
      const copy = res.clone();
      caches.open(VERSION).then((c) => c.put(e.request, copy));
      return res;
    }).catch(() => caches.match(e.request, { ignoreSearch: true }).then((r) => r || caches.match('index.html'))),
  );
});
