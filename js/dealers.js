/*
 * SEZNAM PRODEJCŮ pro sekci „Kde koupit“.
 * Sekce se zobrazí, jakmile seznam obsahuje alespoň jednoho prodejce; jinak
 * tlačítko „Najít prodejce“ vede na BRAND.contactUrl v js/catalog.js.
 *
 * Formát záznamu:
 *   { name: 'Stavebniny XY', street: 'Ulice 1', city: 'Brno', psc: '60200',
 *     phone: '+420 …', web: 'https://…', lat: 49.19, lon: 16.61 }
 * lat/lon jsou volitelné; bez nich se řadí podle blízkosti PSČ.
 */
(function (root) {
  'use strict';
  const DEALERS = [];
  if (typeof module !== 'undefined' && module.exports) module.exports = DEALERS;
  else root.Dealers = DEALERS;
})(typeof window !== 'undefined' ? window : globalThis);
