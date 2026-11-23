/*
 * KATALOG PRODUKTŮ A NORMOVÝCH HODNOT – jediné místo pro správu dat.
 */
(function (root) {
  'use strict';

  const BRAND = {
    appName: 'Plánovač zateplení',
    company: 'Knauf Insulation',
    contactUrl: '#',
    gtmId: '', // např. 'GTM-XXXXXXX' – zapne měření návštěvnosti (se souhlasem)
  };

  /*
   * PRODUKTY – zdroj: Knauf Insulation, Ceník stavebních izolací ver. 07/2026
   * (platnost od 1. 5. 2026) a technické listy výrobce.
   * v: { tloušťka mm: [m² v balení, Kč/m² bez DPH dle ceníku] }
   */
  const PRICE_LIST = 'Ceník Knauf Insulation 07/2026 (platnost od 1. 5. 2026)';
  const VAT = 0.21;

  const PRODUCTS = {
    /* --- skelná vlna v rolích: šikmé střechy --- */
    unifit032: {
      name: 'Unifit 032', lambda: 0.032, form: 'role', packUnit: 'role', material: 'skelná',
      desc: 'Prémiová izolace s nejnižší tepelnou vodivostí, značení pro snadné řezání.',
      v: { 60: [7.08, 268.38], 80: [5.28, 357.84], 100: [4.2, 447.3], 120: [3.48, 536.76], 140: [3.0, 626.22], 160: [2.64, 715.68], 180: [2.64, 805.14], 200: [2.64, 894.6] },
    },
    unifit033: {
      name: 'Unifit 033', lambda: 0.033, form: 'role', packUnit: 'role', material: 'skelná',
      desc: 'Vysoce účinná izolace do šikmých střech, značení pro snadné řezání.',
      v: { 50: [10.44, 171.05], 60: [8.76, 205.26], 80: [6.6, 273.68], 100: [5.28, 342.1], 120: [4.44, 410.52], 140: [3.72, 478.94], 150: [3.48, 513.15], 160: [3.36, 547.36], 180: [3.0, 615.78], 200: [2.64, 684.2] },
    },
    unifit035: {
      name: 'Unifit 035', lambda: 0.035, form: 'role', packUnit: 'role', material: 'skelná',
      desc: 'Univerzální izolace do šikmých střech, stropů a lehkých stěn.',
      v: { 50: [12.12, 142.2], 60: [9.6, 170.64], 80: [7.2, 227.52], 100: [6.0, 284.4], 120: [5.16, 341.28], 140: [4.44, 398.16], 150: [4.08, 426.6], 160: [3.84, 455.04], 180: [3.48, 511.92], 200: [3.12, 568.8], 220: [3.72, 625.68], 240: [3.48, 682.56] },
    },
    unifit037: {
      name: 'Unifit 037', lambda: 0.037, form: 'role', packUnit: 'role', material: 'skelná',
      desc: 'Cenově dostupná izolace do šikmých střech a lehkých konstrukcí.',
      v: { 60: [12.12, 128.28], 80: [9.12, 171.04], 100: [7.32, 213.8], 120: [6.0, 256.56], 140: [5.28, 299.32], 160: [4.56, 342.08], 180: [4.08, 384.84], 200: [3.72, 427.6], 220: [3.36, 470.36], 240: [3.12, 513.12] },
    },
    /* --- stropy a půdy --- */
    naturollpro: {
      name: 'NatuRoll Pro', lambda: 0.039, form: 'role', packUnit: 'role', material: 'skelná',
      desc: 'Izolace pro stropy a půdy s vysokou zvukovou pohltivostí.',
      v: { 50: [18.48, 86.25], 60: [15.6, 103.5], 80: [11.52, 138], 100: [9.24, 172.5], 120: [7.68, 207], 140: [6.6, 241.5], 150: [6.12, 258.75], 160: [5.76, 276], 180: [5.04, 310.5], 200: [4.56, 345] },
    },
    naturollplus: {
      name: 'NatuRoll Plus', lambda: 0.040, form: 'role', packUnit: 'role', material: 'skelná',
      desc: 'Hydrofobizovaná izolace pro stropy a půdy – nejvýhodnější cena.',
      v: { 50: [19.68, 79.7], 60: [16.32, 95.64], 80: [12.24, 127.52], 100: [9.84, 159.4], 120: [8.16, 191.28], 140: [7.08, 223.16], 150: [6.6, 239.1], 160: [6.12, 255.04], 180: [5.52, 286.92], 200: [4.92, 318.8] },
    },
    /* --- dřevostavby --- */
    hb034: {
      name: 'Mineral Plus HB 034', lambda: 0.034, form: 'deska', packUnit: 'balík', material: 'skelná',
      desc: 'Desky 575 × 1250 mm ve standardizovaném rozměru pro dřevostavby (rozteč 625 mm).',
      v: { 80: [5.75, 312], 100: [4.313, 390], 120: [4.313, 468], 140: [3.594, 546], 160: [2.875, 624], 180: [2.875, 702], 200: [2.156, 780], 240: [2.156, 936] },
    },
    /* --- kontaktní fasády (ETICS), desky 1200 × 400 mm --- */
    fkdsthermal: {
      name: 'FKD S Thermal', lambda: 0.035, form: 'deska', packUnit: 'balík', material: 'kamenná',
      desc: 'Fasádní deska 1200 × 400 mm, vyšší pevnost v tahu (TR 10 kPa).',
      v: { 50: [2.88, 310], 60: [2.4, 372], 80: [1.44, 496], 100: [1.44, 620], 120: [1.44, 744], 140: [1.44, 868], 150: [0.96, 930], 160: [0.96, 992], 180: [0.96, 1116], 200: [0.96, 1240], 220: [0.96, 1364] },
    },
    fkdnthermal: {
      name: 'FKD N Thermal', lambda: 0.034, form: 'deska', packUnit: 'balík', material: 'kamenná',
      desc: 'Fasádní deska 1200 × 400 mm s nižší tepelnou vodivostí (λ 0,034).',
      v: { 50: [2.88, 287], 60: [2.4, 344.4], 80: [1.92, 459.2], 100: [1.44, 574], 120: [1.44, 688.8], 140: [1.44, 803.6], 150: [1.44, 861], 160: [0.96, 918.4], 180: [0.96, 1033.2], 200: [0.96, 1148], 220: [0.96, 1262.8] },
    },
    /* --- provětrávané fasády --- */
    ventipro: {
      name: 'VENTI PRO', lambda: 0.033, form: 'deska', packUnit: 'balík', material: 'kamenná',
      desc: 'Čedičová deska 1000 × 600 mm do odvětraných fasád.',
      v: { 50: [6.0, 202.45], 80: [3.6, 323.92], 100: [3.0, 404.9], 120: [2.4, 485.88], 140: [1.8, 566.86], 160: [1.8, 647.84], 180: [1.2, 728.82], 200: [1.2, 809.8] },
    },
    kp034: {
      name: 'Mineral Plus KP 034', lambda: 0.034, form: 'deska', packUnit: 'balík', material: 'skelná',
      desc: 'Hydrofobizovaná deska do odvětraných fasád a lehkých obvodových konstrukcí.',
      v: { 50: [9.375, 194.45], 60: [7.813, 233.34], 80: [6.25, 311.12], 100: [4.688, 388.9], 120: [3.75, 466.68], 140: [3.0, 544.46], 160: [3.0, 622.24], 180: [2.25, 700.02], 200: [2.25, 777.8], 220: [2.25, 855.58], 240: [2.25, 933.36] },
    },
    mpnplus037: {
      name: 'MPN Plus 037', lambda: 0.037, form: 'deska', packUnit: 'balík', material: 'skelná',
      desc: 'Hydrofobizovaná deska do odvětraných fasád s pevnou hranou.',
      v: { 50: [11.52, 125.5], 80: [7.2, 200.8], 100: [5.76, 251], 120: [5.04, 301.2], 140: [4.32, 351.4], 150: [3.6, 376.5], 160: [4.32, 401.6], 200: [2.88, 502] },
    },
    /* --- příčky --- */
    akustikboard: {
      name: 'Akustik Board', lambda: 0.037, form: 'deska', packUnit: 'balík', material: 'skelná',
      desc: 'Akustické desky 1250 × 625 mm s vysokou zvukovou pohltivostí, i pro požárně odolné příčky.',
      v: { 40: [15.625, 90], 50: [12.5, 112.5], 60: [9.375, 135], 80: [7.813, 180], 100: [6.25, 225] },
    },
    decibelplus: {
      name: 'Decibel Plus', lambda: 0.036, form: 'role', packUnit: 'balík', material: 'skelná',
      desc: 'Akustická izolace v roli šíře 625 mm, varianta DUO (podélně dělená).',
      v: { 40: [18.75, 90], 50: [15.0, 112.5], 60: [12.5, 135], 80: [9.375, 180], 100: [7.5, 225], 120: [6.25, 270] },
    },
    akustikroll: {
      name: 'Akustik Roll', lambda: 0.039, form: 'role', packUnit: 'balík', material: 'skelná',
      desc: 'Tepelná a akustická izolace v roli šíře 625 mm do příček.',
      v: { 40: [21.75, 83.52], 50: [17.5, 104.4], 60: [14.5, 125.28], 75: [11.5, 156.6], 80: [11.0, 167.04], 100: [8.75, 208.8] },
    },
    /* --- ploché střechy: desky 1200 × 2000 mm (2,4 m²), prodej po deskách / paletách --- */
    srbase: {
      name: 'SmartRoof Base', lambda: 0.035, form: 'deska', packUnit: 'deska', material: 'kamenná',
      desc: 'Spodní vrstva izolace plochých střech, CS(10) 30 kPa.',
      v: { 40: [2.4, 272], 50: [2.4, 340], 60: [2.4, 408], 80: [2.4, 544], 100: [2.4, 680], 120: [2.4, 816], 140: [2.4, 952], 150: [2.4, 1020], 160: [2.4, 1088], 180: [2.4, 1224], 200: [2.4, 1360] },
    },
    srthermal: {
      name: 'SmartRoof Thermal', lambda: 0.036, form: 'deska', packUnit: 'deska', material: 'kamenná',
      desc: 'Spodní vrstva izolace plochých střech, CS(10) 50 kPa.',
      v: { 40: [2.4, 332], 50: [2.4, 415], 60: [2.4, 498], 80: [2.4, 640], 100: [2.4, 800], 120: [2.4, 960], 140: [2.4, 1120], 150: [2.4, 1200], 160: [2.4, 1280], 180: [2.4, 1440] },
    },
    srnorm: {
      name: 'SmartRoof Norm', lambda: 0.037, form: 'deska', packUnit: 'deska', material: 'kamenná',
      desc: 'Horní krycí vrstva plochých střech, CS(10) 60 kPa.',
      v: { 40: [2.4, 352], 50: [2.4, 440], 60: [2.4, 528], 80: [2.4, 704], 100: [2.4, 880], 120: [2.4, 1056], 140: [2.4, 1232], 150: [2.4, 1320], 160: [2.4, 1408], 180: [2.4, 1584] },
    },
    srtop: {
      name: 'SmartRoof Top', lambda: 0.038, form: 'deska', packUnit: 'deska', material: 'kamenná',
      desc: 'Horní krycí vrstva pro občasně pochozí ploché střechy, CS(10) 70 kPa.',
      v: { 40: [2.4, 380], 50: [2.4, 475], 60: [2.4, 546], 70: [2.4, 637], 80: [2.4, 728], 100: [2.4, 910], 120: [2.4, 1092], 140: [2.4, 1274], 150: [2.4, 1365], 160: [2.4, 1456], 180: [2.4, 1638], 200: [2.4, 1820] },
    },
    /* --- podlahy: kročejové izolace --- */
    ptn: {
      name: 'PTN', lambda: 0.035, form: 'deska', packUnit: 'balík', material: 'kamenná',
      desc: 'Kročejová izolace pod betonové plovoucí podlahy, užitné zatížení ≤ 200 kg/m².',
      v: { 20: [9.6, 121.62], 25: [8.4, 152.03], 30: [6.0, 182.43], 40: [4.8, 243.24], 50: [3.0, 304.05] },
    },
    pte: {
      name: 'PTE', lambda: 0.036, form: 'deska', packUnit: 'balík', material: 'kamenná',
      desc: 'Kročejová izolace pod anhydritové a betonové podlahy, užitné zatížení ≤ 400 kg/m².',
      v: { 20: [9.6, 161.64], 30: [6.0, 242.46], 40: [4.8, 323.28], 50: [3.0, 404.1] },
    },
    pts: {
      name: 'PTS', lambda: 0.036, form: 'deska', packUnit: 'balík', material: 'kamenná',
      desc: 'Kročejová izolace pod suché i lité podlahy, užitné zatížení ≤ 500 kg/m².',
      v: { 20: [9.6, 183.82], 30: [4.8, 275.73], 40: [4.8, 367.64], 50: [3.0, 459.55] },
    },
    tpt03: {
      name: 'TPT 03', lambda: 0.032, form: 'deska', packUnit: 'balík', material: 'skelná',
      desc: 'Kročejová izolace s mimořádnými akustickými vlastnostmi pod betonové a anhydritové podlahy.',
      v: { 20: [15.0, 294.22], 30: [9.75, 441.33] },
    },
    /* --- strop nad sklepem / garáží: desky z dřevité vlny (Heraklith); ceny nejsou v ceníku 07/2026 --- */
    tektalan: {
      name: 'Tektalan A2-SmartTec', lambda: 0.034, form: 'deska', packUnit: 'deska', material: 'kamenná + dřevitá vlna',
      desc: 'Nehořlavá (A2-s1, d0) kompozitní deska 1000 × 600 mm s povrchem z dřevité vlny pro stropy sklepů a garáží.',
      v: { 50: [0.6, null], 75: [0.6, null], 100: [0.6, null], 125: [0.6, null], 150: [0.6, null], 175: [0.6, null], 200: [0.6, null] },
      R: { 50: 1.2, 75: 1.95, 100: 2.7, 125: 3.4, 150: 4.15, 175: 4.9, 200: 5.65 },
    },
    heratekta: {
      name: 'Heratekta C2/C3 031', lambda: 0.031, form: 'deska', packUnit: 'deska', material: 'EPS + dřevitá vlna',
      desc: 'Kompozitní deska 2000 × 600 mm s jádrem z šedého EPS (třída reakce na oheň E) pro stropy sklepů a garáží.',
      v: { 50: [1.2, null], 75: [1.2, null], 100: [1.2, null], 150: [1.2, null] },
      R: { 50: 1.15, 75: 1.8, 100: 2.35, 150: 4.65 },
    },
  };

  /* Foukaná izolace Supafil (technické listy Supafil Loft Pro 10/2024, Supafil Frame 09/2025).
   * Prodej v pytlích 16,6 kg; aplikuje certifikovaná firma strojně. λD závisí na objemové hmotnosti ρ. */
  const BLOWN = {
    supafilLoft: {
      name: 'Supafil Loft Pro', bagKg: 16.6, desc: 'Foukaná minerální izolace ze skelné vlny bez pojiva, třída reakce na oheň A1, sesedání S1 (do 1 %).',
      open: [{ rho: 22, lambda: 0.037 }], cavity: [{ rho: 35, lambda: 0.034 }],
    },
    supafilFrame: {
      name: 'Supafil Frame', bagKg: 16.6, desc: 'Foukaná minerální izolace ze skelné vlny pro dutiny i volné plochy, A1, nastavitelná objemová hmotnost.',
      open: [{ rho: 12, lambda: 0.042 }, { rho: 15, lambda: 0.040 }], cavity: [{ rho: 19, lambda: 0.038 }, { rho: 26, lambda: 0.034 }, { rho: 30, lambda: 0.033 }],
    },
  };
  /* Volba materiálu a objemové hmotnosti podle priority zákazníka */
  const BLOWN_PRIORITY = {
    vykon: { open: ['supafilLoft', 22], cavity: ['supafilFrame', 30] },
    vyvazeny: { open: ['supafilFrame', 15], cavity: ['supafilFrame', 26] },
    cena: { open: ['supafilFrame', 12], cavity: ['supafilFrame', 19] },
  };
  const SUPAFIL_URL = 'https://www.supafil.cz/';
  /* foukané materiály registrujeme i mezi produkty (název, popis, jednotka) */
  Object.entries(BLOWN).forEach(([id, b]) => {
    PRODUCTS[id] = { name: b.name, desc: b.desc, lambda: b.open.concat(b.cavity)[0].lambda, form: 'foukaná', packUnit: 'pytel', material: 'skelná', v: {}, blown: true };
  });

  Object.values(PRODUCTS).forEach((p) => {
    p.thicknesses = Object.keys(p.v).map(Number).sort((a, b) => a - b);
    p.packM2 = {}; p.priceM2 = {};
    p.thicknesses.forEach((t) => { p.packM2[t] = p.v[t][0]; p.priceM2[t] = p.v[t][1]; });
    p.rOf = (t) => (p.R && p.R[t]) || t / 1000 / p.lambda;
  });

  const ACCESSORIES = {
    lds100: { name: 'Homeseal LDS 100', desc: 'Parozábrana sd = 100 m, role 2 × 50 m (přesahy 150 mm)', unit: 'role', perUnit: 100, perLabel: 'm²', price: 4200 },
    solifit: { name: 'Homeseal LDS Solifit', desc: 'Páska 60 mm pro vzduchotěsné spoje fólií, role 25 m', unit: 'role', perUnit: 25, perLabel: 'm', price: 485 },
    lds2: { name: 'Homeseal LDS 2', desc: 'Parobrzda sd = 2 m pro difúzně otevřené střechy, role 1,5 × 50 m', unit: 'role', perUnit: 75, perLabel: 'm²', price: 3075 },
    lds35: { name: 'Homeseal LDS 35 FixPlus', desc: 'Parozábrana pro ploché střechy s lepicími páskami, role 3 × 50 m', unit: 'role', perUnit: 150, perLabel: 'm²', price: 4200 },
    edge60: { name: 'Okrajový pásek 15 × 60 mm', desc: 'Oddělení plovoucí podlahy od stěn, kusy 1 m', unit: 'm', perUnit: 1, perLabel: 'm', price: 48 },
    edge100: { name: 'Okrajový pásek 15 × 100 mm', desc: 'Oddělení plovoucí podlahy od stěn, kusy 1 m', unit: 'm', perUnit: 1, perLabel: 'm', price: 54 },
    solimur: { name: 'Homeseal LDS Solimur', desc: 'Tmel pro napojení fólie na zdivo, 310 ml (cca 6 m / kartuše)', unit: 'kartuše', perUnit: 6, perLabel: 'm', price: 154 },
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
    cellar: { pozadovana: 0.60, doporucena: 0.40, pasivni: 0.25 },
  };

  /* Pořadí produktů podle priority zákazníka; použije se první, který splní cíl. */
  const PRIORITIES = {
    vykon: {
      label: 'Nejtenčí vrstva', sub: 'Maximum izolace na minimum místa',
      cavity: ['unifit032', 'unifit033', 'unifit035'], wall: ['unifit032', 'hb034', 'unifit035'], loose: ['unifit033', 'unifit035', 'naturollpro'],
      etics: ['fkdnthermal', 'fkdsthermal'], venti: ['ventipro', 'kp034'], acoustic: ['akustikboard', 'decibelplus'],
      flatLower: 'srbase', floor: 'akustika',
    },
    vyvazeny: {
      label: 'Vyvážené', sub: 'Poměr cena / výkon',
      cavity: ['unifit035', 'unifit033', 'unifit032'], wall: ['hb034', 'unifit035', 'unifit032'], loose: ['naturollpro', 'naturollplus', 'unifit035'],
      etics: ['fkdsthermal', 'fkdnthermal'], venti: ['kp034', 'ventipro'], acoustic: ['akustikboard', 'akustikroll'],
      flatLower: 'srthermal', floor: 'standard',
    },
    cena: {
      label: 'Nejnižší cena', sub: 'Úsporné řešení',
      cavity: ['unifit037', 'unifit035', 'unifit033', 'unifit032'], wall: ['unifit037', 'unifit035', 'hb034'], loose: ['naturollplus', 'naturollpro'],
      etics: ['fkdnthermal', 'fkdsthermal'], venti: ['mpnplus037', 'kp034', 'ventipro'], acoustic: ['akustikroll', 'decibelplus'],
      flatLower: 'srbase', floor: 'standard',
    },
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

  const FLAT_DECKS = {
    zb: { label: 'Železobetonová deska', R: 0.12 },
    trapez: { label: 'Trapézový plech', R: 0 },
    drevo: { label: 'Dřevěné bednění / trámy', R: 0.2 },
  };

  const FLOOR_TYPES = {
    beton: { label: 'Betonová (cementová) litá podlaha' },
    anhydrit: { label: 'Anhydritová litá podlaha' },
    sucha: { label: 'Suchá montovaná podlaha (OSB, sádrovlákno)' },
  };
  const FLOOR_LOADS = {
    200: { label: 'Obytné prostory (do 200 kg/m²)' },
    400: { label: 'Kanceláře, obchody (do 400 kg/m²)' },
    500: { label: 'Vyšší zatížení (do 500 kg/m²)' },
  };
  /* Orientační L'n,w [dB] pro ŽB strop (brožura Knauf Insulation Podlahy 07/2019),
   * index sloupce = tloušťka stropní desky 120…240 mm po 20 mm. */
  const IMPACT = {
    slabs: [120, 140, 160, 180, 200, 220, 240],
    none: [79, 77, 75, 73, 71, 70, 69],
    ptn: { 20: [54, 52, 50, 48, 46, 45, 44], 30: [53, 51, 49, 47, 45, 44, 43], 40: [52, 50, 48, 46, 44, 43, 42], 50: [51, 49, 48, 45, 43, 42, 41] },
    pte: { 20: [55, 53, 51, 49, 47, 46, 45], 30: [54, 52, 50, 48, 46, 45, 44], 40: [53, 51, 49, 47, 45, 44, 43], 50: [52, 50, 48, 46, 44, 43, 42] },
    pts: { 20: [57, 55, 53, 51, 49, 48, 47], 30: [55, 53, 51, 49, 47, 46, 45], 40: [54, 52, 50, 48, 46, 45, 44], 50: [53, 51, 49, 47, 45, 44, 43] },
  };

  /* Dotace Nová zelená úsporám 2026 – ORIENTAČNÍ údaje (zdroj: novazelenausporam.cz, Závazné pokyny
   * NZÚ Light RD 2026 a NZÚ 2026+, stav 06/2026). Před nasazením ověřte aktuální znění výzvy. */
  const SUBSIDY = {
    url: 'https://novazelenausporam.cz/',
    builtBefore: '1. 7. 2013',
    light: { label: 'NZÚ Light (zranitelné domácnosti)', cap: 250000, min: 50000, rates: { wall: 2000, roof: 2000, attic: 750 } },
    loan: { label: 'NZÚ 2026+ – bezúročný úvěr', cap: 750000, rates: { wall: 3500, roof: 3500 } },
    byType: { foukana: (it) => (it.variant === 'dutina_stena' ? 'wall' : 'attic'), etics: 'wall', venti: 'wall', drevostavba: 'wall', sikma: 'roof', nadkrokve: 'roof', plocha: 'roof', strop: 'attic' },
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
    plocha: {
      label: 'Plochá střecha', short: 'Dvouvrstvá skladba',
      icon: 'flat', target: 'roof', engine: 'flat',
    },
    nadkrokve: {
      label: 'Šikmá střecha nad krokvemi', short: 'Přiznaný krov / rekonstrukce shora',
      icon: 'over', target: 'roof', engine: 'over',
    },
    sklep: {
      label: 'Strop nad sklepem / garáží', short: 'Desky Heraklith zespodu',
      icon: 'cellar', target: 'cellar', engine: 'cellar',
    },
    foukana: {
      label: 'Foukaná izolace Supafil', short: 'Půdy, stropy bungalovů, dutiny',
      icon: 'blown', target: 'ceilingAttic', engine: 'blown', badge: 'Nejrychlejší',
    },
    podlaha: {
      label: 'Plovoucí podlaha', short: 'Kročejová izolace',
      icon: 'floor', target: null, engine: 'floor',
    },
    pricka: {
      label: 'Akustická příčka / předstěna', short: 'Sádrokarton',
      icon: 'partition', target: null, engine: 'acoustic',
    },
  };

  const api = { BLOWN, BLOWN_PRIORITY, SUPAFIL_URL, SUBSIDY, FLAT_DECKS, FLOOR_TYPES, FLOOR_LOADS, IMPACT, PRICE_LIST, VAT, BRAND, PRODUCTS, ACCESSORIES, LEVELS, U_TARGETS, PRIORITIES, EXISTING_WALLS, EXISTING_CEILINGS, TYPES };
  if (typeof module !== 'undefined' && module.exports) module.exports = api;
  else root.Catalog = api;
})(typeof window !== 'undefined' ? window : globalThis);
