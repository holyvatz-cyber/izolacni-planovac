/*
 * KATALOG PRODUKTŮ A NORMOVÝCH HODNOT – jediné místo pro správu dat.
 */
(function (root) {
  'use strict';

  const BRAND = {
    appName: 'Plánovač zateplení',
    company: 'Knauf Insulation',
    contactUrl: '#',
  };

  /*
   * PRODUKTY – data z oficiálních produktových stránek knauf.com (cs-CZ, příp. jiné
   * jazykové mutace se shodným formátem) a z listingů DEK (dek.cz), stav 11/2026.
   * packM2 = m² v jednom balení (role / balík) pro danou tloušťku.
   * verified: false = produkt nebo balení se nepodařilo ověřit pro český trh;
   * aplikace pak u výsledku zobrazí upozornění.
   */
  const PRODUCTS = {
    unifit032: {
      name: 'Unifit 032', lambda: 0.032, form: 'role', packUnit: 'role', verified: true,
      desc: 'Prémiová izolace ze skelné minerální vlny s nejnižší tepelnou vodivostí – nejtenčí vrstva.',
      packM2: { 60: 7.08, 80: 5.28, 100: 4.2, 120: 3.48, 140: 3.0, 160: 2.64, 180: 2.64, 200: 2.4 },
      source: 'knauf.com/cs-CZ (60–180 mm); 200 mm dle prodejců (2,4 m²)',
    },
    unifit035: {
      name: 'Unifit 035', lambda: 0.035, form: 'role', packUnit: 'role', verified: true,
      desc: 'Univerzální izolace ze skelné minerální vlny do šikmých střech, stropů a lehkých stěn.',
      packM2: { 50: 12.2, 60: 9.6, 80: 7.2, 100: 6.0, 120: 5.16, 140: 4.44, 160: 3.84, 180: 3.48, 200: 3.12, 220: 3.72, 240: 3.48 },
      source: 'dek.cz – listingy Knauf UNIFIT 035',
    },
    naturollpro: {
      name: 'NatuRoll Pro', lambda: 0.039, form: 'role', packUnit: 'role', verified: true,
      desc: 'Cenově výhodná izolace ze skelné minerální vlny pro střechy, stropy a půdy.',
      packM2: { 50: 18.48, 60: 15.6, 80: 11.52, 100: 9.24, 120: 7.68, 140: 6.6, 160: 5.76, 180: 5.04, 200: 4.56 },
      source: 'knauf.com/cs-CZ (100, 120, 180 mm); dek.cz a dskstavebniny.cz (ostatní)',
    },
    fkdsthermal: {
      name: 'FKD-S Thermal', lambda: 0.035, form: 'deska', packUnit: 'balík', verified: true,
      desc: 'Fasádní deska z kamenné minerální vlny 1200 × 400 mm pro kontaktní zateplení (ETICS).',
      packM2: { 50: 2.88, 60: 2.4, 80: 1.44, 100: 1.44, 120: 1.44, 140: 1.44, 160: 0.96, 180: 0.96, 200: 0.96 },
      source: 'knauf.com (cs-CZ, sk-SK) a dek.cz – formát 1200 × 400 mm',
    },
    naturboardventi: {
      name: 'NaturBoard VENTI', lambda: 0.035, form: 'deska', packUnit: 'balík', verified: false,
      desc: 'Deska z kamenné minerální vlny 1000 × 600 mm pro provětrávané fasády.',
      packM2: { 50: 7.2, 100: 3.6 },
      source: 'mezinárodní technický list Knauf Insulation 02/2024 – dostupnost v ČR neověřena',
    },
    akustikboard: {
      name: 'Akustik Board', lambda: 0.037, form: 'deska', packUnit: 'balík', verified: true,
      desc: 'Akustická deska 1250 × 625 mm do sádrokartonových příček a předstěn.',
      packM2: { 50: 12.5, 60: 9.38, 100: 6.25 },
      source: 'knauf.com/cs-CZ (50, 100 mm); knauf.com/de-AT (60 mm)',
    },
  };
  Object.values(PRODUCTS).forEach((p) => { p.thicknesses = Object.keys(p.packM2).map(Number).sort((a, b) => a - b); });

  const ACCESSORIES = {
    lds100: { name: 'Homeseal LDS 100', desc: 'Parotěsná fólie (sd ≈ 100 m), role 2 × 50 m', unit: 'role', perUnit: 100, perLabel: 'm²' },
    soliplan: { name: 'Homeseal LDS Soliplan', desc: 'Lepicí páska 60 mm na spoje fólií, role 40 m', unit: 'role', perUnit: 40, perLabel: 'm' },
    solimur: { name: 'Homeseal LDS Solimur 310', desc: 'Lepicí tmel pro napojení fólie na zdivo (8–12 m / kartuše)', unit: 'kartuše', perUnit: 8, perLabel: 'm' },
  };

  /* Normové hodnoty součinitele prostupu tepla U [W/(m²K)] dle ČSN 73 0540-2.
   * Pro pasivní úroveň je použita hodnota ze středu doporučeného rozpětí. */
  const LEVELS = {
    pozadovana: { label: 'Splnit normu', sub: 'Požadovaná hodnota ČSN 73 0540-2' },
    doporucena: { label: 'Doporučeno', sub: 'Doporučená hodnota – rozumný standard' },
    pasivni: { label: 'Pasivní standard', sub: 'Pro nízkoenergetické a pasivní domy' },
  };

  const U_TARGETS = {
    roof: { pozadovana: 0.24, doporucena: 0.16, pasivni: 0.12 },
    ceilingAttic: { pozadovana: 0.30, doporucena: 0.20, pasivni: 0.12 },
    wallExt: { pozadovana: 0.30, doporucena: 0.25, pasivni: 0.15 },
  };

  const PRIORITIES = {
    vykon: { label: 'Nejtenčí vrstva', sub: 'Maximum izolace na minimum místa', cavity: ['unifit032', 'unifit035'], loose: ['unifit035', 'naturollpro'] },
    vyvazeny: { label: 'Vyvážené', sub: 'Poměr cena / výkon', cavity: ['unifit035', 'unifit032'], loose: ['naturollpro', 'unifit035'] },
    cena: { label: 'Nejnižší cena', sub: 'Úsporné řešení', cavity: ['naturollpro', 'unifit035', 'unifit032'], loose: ['naturollpro', 'unifit035'] },
  };

  /* Stávající konstrukce – orientační tepelný odpor R [m²K/W] */
  const EXISTING_WALLS = {
    cp450: { label: 'Plná cihla 450 mm', R: 0.62 },
    cp300: { label: 'Plná cihla 300 mm', R: 0.43 },
    cdm375: { label: 'Cihla CDm / CDK 375 mm', R: 0.85 },
    porotherm30: { label: 'Keramické tvárnice 300 mm (starší)', R: 1.25 },
    porotherm44: { label: 'Keramické tvárnice 440 mm', R: 2.4 },
    pb300: { label: 'Pórobeton 300 mm', R: 1.8 },
    panel: { label: 'Panelový dům (sendvičový panel)', R: 1.0 },
    kamen: { label: 'Smíšené / kamenné zdivo 600 mm', R: 0.45 },
  };

  const EXISTING_CEILINGS = {
    tramovy: { label: 'Dřevěný trámový strop s podbitím', R: 0.6, wooden: true },
    beton: { label: 'Železobetonový strop / panel', R: 0.15, wooden: false },
    keramicky: { label: 'Keramický strop (Hurdis, MIAKO)', R: 0.35, wooden: false },
  };

  const TYPES = {
    sikma: {
      label: 'Šikmá střecha / podkroví', short: 'Mezi a pod krokve',
      icon: 'roof', target: 'roof', engine: 'framed',
    },
    strop: {
      label: 'Strop pod nevytápěnou půdou', short: 'Pokládka na strop',
      icon: 'attic', target: 'ceilingAttic', engine: 'loose',
    },
    etics: {
      label: 'Fasáda – kontaktní zateplení', short: 'Systém ETICS',
      icon: 'wall', target: 'wallExt', engine: 'masonry',
    },
    venti: {
      label: 'Provětrávaná fasáda', short: 'S obkladem',
      icon: 'venti', target: 'wallExt', engine: 'masonry',
    },
    drevostavba: {
      label: 'Stěna dřevostavby', short: 'Mezi sloupky',
      icon: 'frame', target: 'wallExt', engine: 'framed',
    },
    pricka: {
      label: 'Akustická příčka / předstěna', short: 'Sádrokarton',
      icon: 'partition', target: null, engine: 'acoustic',
    },
  };

  const api = { BRAND, PRODUCTS, ACCESSORIES, LEVELS, U_TARGETS, PRIORITIES, EXISTING_WALLS, EXISTING_CEILINGS, TYPES };
  if (typeof module !== 'undefined' && module.exports) module.exports = api;
  else root.Catalog = api;
})(typeof window !== 'undefined' ? window : globalThis);
