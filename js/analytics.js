/*
 * MĚŘENÍ NÁVŠTĚVNOSTI – události plánovače se zapisují do window.dataLayer
 * (kompatibilní s Google Tag Manager i jinými nástroji). Samotný měřicí skript
 * se načte, jen pokud je v js/catalog.js vyplněno BRAND.gtmId a návštěvník
 * udělí souhlas (lišta se souhlasem se zobrazí jen v tom případě).
 *
 * Události: planner_step_view, planner_item_add, planner_item_remove,
 * planner_results_view, planner_variant_change, planner_level_change,
 * planner_share, planner_print, planner_copy, planner_help_open, planner_dealer_search.
 */
(function () {
  'use strict';
  const KEY = 'izolacni-planovac-consent';
  window.dataLayer = window.dataLayer || [];
  window.track = function (name, params) {
    window.dataLayer.push(Object.assign({ event: 'planner_' + name }, params || {}));
  };
  const id = window.Catalog && window.Catalog.BRAND.gtmId;
  if (!id) return;
  let consent = null;
  try { consent = localStorage.getItem(KEY); } catch (e) { /* ignore */ }
  const load = () => {
    window.dataLayer.push({ 'gtm.start': Date.now(), event: 'gtm.js' });
    const sc = document.createElement('script');
    sc.async = true; sc.src = 'https://www.googletagmanager.com/gtm.js?id=' + encodeURIComponent(id);
    document.head.appendChild(sc);
  };
  if (consent === 'yes') { load(); return; }
  if (consent === 'no') return;
  document.addEventListener('DOMContentLoaded', () => {
    const bar = document.getElementById('consent'); if (!bar) return;
    bar.hidden = false;
    bar.addEventListener('click', (e) => {
      const b = e.target.closest('[data-consent]'); if (!b) return;
      try { localStorage.setItem(KEY, b.dataset.consent); } catch (err) { /* ignore */ }
      bar.hidden = true;
      if (b.dataset.consent === 'yes') load();
    });
  });
})();
