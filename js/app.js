/* UI plánovače – vanilla JS, bez závislostí. */
(function () {
  'use strict';
  const C = window.Catalog;
  const K = window.Calc;
  const STORE_KEY = 'izolacni-planovac-v1';

  /* ---------- pomocné ---------- */
  const $ = (s, el = document) => el.querySelector(s);
  const esc = (s) => String(s ?? '').replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
  const fmt = (n, d = 1) => Number(n).toLocaleString('cs-CZ', { minimumFractionDigits: d, maximumFractionDigits: d });
  const fmtU = (n) => fmt(n, 2);
  const FORMS = { role: ['role', 'role', 'rolí'], 'balík': ['balík', 'balíky', 'balíků'], deska: ['deska', 'desky', 'desek'], 'kartuše': ['kartuše', 'kartuše', 'kartuší'] };
  const unitWord = (u, n) => { const f = FORMS[u]; if (!f) return u; return n === 1 ? f[0] : n >= 2 && n <= 4 ? f[1] : f[2]; };
  const kc = (n) => `${Math.round(n).toLocaleString('cs-CZ')} Kč`;
  const track = (name, params) => { try { if (window.track) window.track(name, params); } catch (e) { /* ignore */ } };
  const uid = () => Math.random().toString(36).slice(2, 9);

  const ICONS = {
    roof: '<svg viewBox="0 0 40 40" fill="none" stroke="currentColor" stroke-width="2" stroke-linejoin="round"><path d="M4 22 20 7l16 15"/><path d="M9 18l11-10 11 10" stroke-dasharray="2 2.5" stroke="var(--accent)"/><path d="M8 20v14h24V20"/></svg>',
    attic: '<svg viewBox="0 0 40 40" fill="none" stroke="currentColor" stroke-width="2" stroke-linejoin="round"><path d="M4 18 20 5l16 13"/><path d="M8 18h24" /><path d="M10 15.5h20" stroke="var(--accent)" stroke-width="3"/><path d="M8 18v16h24V18"/></svg>',
    wall: '<svg viewBox="0 0 40 40" fill="none" stroke="currentColor" stroke-width="2"><rect x="7" y="6" width="16" height="28"/><path d="M7 13h16M7 20h16M7 27h16M15 6v7M11 13v7M19 13v7M15 20v7M11 27v7M19 27v7"/><rect x="25" y="6" width="7" height="28" stroke="var(--accent)"/></svg>',
    venti: '<svg viewBox="0 0 40 40" fill="none" stroke="currentColor" stroke-width="2"><rect x="5" y="6" width="13" height="28"/><rect x="20" y="6" width="7" height="28" stroke="var(--accent)"/><path d="M32 6v28M32 10h3M32 18h3M32 26h3"/></svg>',
    frame: '<svg viewBox="0 0 40 40" fill="none" stroke="currentColor" stroke-width="2"><path d="M6 6h28v28H6z"/><path d="M15 6v28M25 6v28"/><path d="M8 10h5M8 16h5M8 22h5M8 28h5M17 10h6M17 16h6M17 22h6M17 28h6M27 10h5M27 16h5M27 22h5M27 28h5" stroke="var(--accent)"/></svg>',
    flat: '<svg viewBox="0 0 40 40" fill="none" stroke="currentColor" stroke-width="2" stroke-linejoin="round"><path d="M5 14h30"/><rect x="5" y="16" width="30" height="5" stroke="var(--accent)"/><rect x="5" y="21" width="30" height="5" stroke="var(--accent)"/><path d="M5 28h30M8 28v8M32 28v8"/></svg>',
    floor: '<svg viewBox="0 0 40 40" fill="none" stroke="currentColor" stroke-width="2"><path d="M5 30h30"/><rect x="5" y="24" width="30" height="3" stroke="var(--accent)"/><rect x="5" y="17" width="30" height="6"/><path d="M6 17v-9M34 17v-9"/><path d="M14 12l2 3M22 12l2 3" stroke="var(--accent)"/></svg>',
    over: '<svg viewBox="0 0 40 40" fill="none" stroke="currentColor" stroke-width="2" stroke-linejoin="round"><path d="M4 24 20 9l16 15"/><path d="M8 18 20 7l12 11" stroke="var(--accent)" stroke-width="4"/><path d="M8 22v12h24V22"/></svg>',
    cellar: '<svg viewBox="0 0 40 40" fill="none" stroke="currentColor" stroke-width="2"><path d="M4 14h32"/><rect x="4" y="16" width="32" height="4" stroke="var(--accent)"/><path d="M7 20v14M33 20v14M4 34h32"/><path d="M14 27h12" stroke-dasharray="2 2"/></svg>',
    partition: '<svg viewBox="0 0 40 40" fill="none" stroke="currentColor" stroke-width="2"><path d="M12 5v30M28 5v30"/><path d="M15 9c3 2 7-2 10 0M15 15c3 2 7-2 10 0M15 21c3 2 7-2 10 0M15 27c3 2 7-2 10 0" stroke="var(--accent)"/></svg>',
  };

  /* ---------- výchozí hodnoty ---------- */
  const DEFAULTS = {
    sikma: { name: 'Podkroví', mode: 'rozmery', rafterLen: '5', roofLen: '10', sides: '2', windows: '0', winSize: '78x118', winW: '78', winH: '118', area: '80', frameDepth: '160', frameWidth: '80', frameSpacing: '900', maxExtra: '80' },
    strop: { name: 'Strop pod půdou', mode: 'rozmery', len: '10', wid: '8', area: '80', ceiling: 'beton', walkable: false, frameDepth: '180', frameWidth: '120', frameSpacing: '1000', maxExtra: '100' },
    etics: { name: 'Fasáda', mode: 'rozmery', perimeter: '40', height: '6', openings: '30', area: '200', wall: 'cp450' },
    venti: { name: 'Provětrávaná fasáda', mode: 'rozmery', perimeter: '40', height: '6', openings: '30', area: '200', wall: 'cp450' },
    drevostavba: { name: 'Obvodová stěna', mode: 'rozmery', len: '36', height: '2.7', openings: '22', area: '75', frameDepth: '160', frameWidth: '60', frameSpacing: '625', maxExtra: '60' },
    plocha: { name: 'Plochá střecha', mode: 'rozmery', len: '12', wid: '10', area: '120', deck: 'zb', use: 'nepochozi', fixing: 'kotvena' },
    nadkrokve: { name: 'Střecha nad krokvemi', mode: 'plocha', area: '100', rafterLen: '6', roofLen: '10', sides: '2', windows: '0', winSize: '78x118', winW: '78', winH: '118', variant: 'shora', frameDepth: '140', frameWidth: '80', frameSpacing: '900', maxOver: '260' },
    sklep: { name: 'Strop nad sklepem', mode: 'rozmery', len: '10', wid: '8', area: '80', ceiling: 'beton', fire: 'ano' },
    podlaha: { name: 'Podlaha – obývák', mode: 'rozmery', len: '6', wid: '4.5', area: '27', floorType: 'beton', load: '200', slab: '200' },
    pricka: { name: 'Příčka', mode: 'rozmery', len: '4', height: '2.6', doors: '1', area: '10', profile: '75' },
  };

  const optionsFrom = (obj) => Object.entries(obj).map(([k, v]) => [k, v.label]);

  /* ---------- schéma formulářů ---------- */
  const FRAME = (label, labels) => [
    { sub: label },
    { k: 'frameDepth', label: labels[0], unit: 'mm' },
    { k: 'frameWidth', label: labels[1], unit: 'mm' },
    { k: 'frameSpacing', label: labels[2], unit: 'mm', hint: 'Měřeno ze středu na střed.' },
    { k: 'maxExtra', label: labels[3], unit: 'mm', hint: labels[4] },
  ];
  const WIN_SIZES = ['55x78', '55x98', '66x98', '66x118', '78x98', '78x118', '78x140', '94x118', '94x140', '114x118', '134x98'];
  const WINDOW_FIELDS = [
    { sub: 'Střešní okna' },
    { k: 'windows', label: 'Počet oken', unit: 'ks', hint: 'Plochu oken odečteme, obvod použijeme pro pásky.' },
    { k: 'winSize', label: 'Rozměr okna (š × v)', type: 'select', help: 'winSize',
      options: [...WIN_SIZES.map((v) => [v, v.replace('x', ' × ') + ' cm' + (v === '78x118' ? ' – nejčastější' : '')]), ['vlastni', 'Jiný rozměr…']] },
    { k: 'winW', label: 'Šířka okna', unit: 'cm', show: (it) => it.winSize === 'vlastni' },
    { k: 'winH', label: 'Výška okna', unit: 'cm', show: (it) => it.winSize === 'vlastni' },
  ];
  const FIELDS = {
    sikma: [
      { k: 'rafterLen', label: 'Délka krokve (zateplovaná část)', unit: 'm', mode: 'rozmery', hint: 'Od pozednice po hřeben, nebo po strop podkroví.' },
      { k: 'roofLen', label: 'Délka střechy', unit: 'm', mode: 'rozmery' },
      { k: 'sides', label: 'Počet střešních rovin', type: 'select', options: [['1', '1 – pultová'], ['2', '2 – sedlová'], ['4', '4 – valbová (orientačně)']], mode: 'rozmery' },
      { k: 'area', label: 'Plocha střechy k zateplení', unit: 'm²', mode: 'plocha', hint: 'Bez střešních oken.' },
      ...WINDOW_FIELDS,
      ...FRAME('Krokve', ['Výška krokve', 'Šířka krokve', 'Rozteč krokví', 'Max. izolace pod krokvemi', 'Kolik cm výšky podkroví můžete obětovat.']),
    ],
    strop: [
      { k: 'len', label: 'Délka stropu', unit: 'm', mode: 'rozmery' },
      { k: 'wid', label: 'Šířka stropu', unit: 'm', mode: 'rozmery' },
      { k: 'area', label: 'Plocha stropu', unit: 'm²', mode: 'plocha' },
      { k: 'ceiling', label: 'Stávající strop', type: 'select', options: optionsFrom(C.EXISTING_CEILINGS), wide: true },
      { k: 'walkable', label: 'Půdu chci používat jako pochozí (izolace mezi trámy, nahoře podlaha)', type: 'toggle', wide: true },
      ...FRAME('Stropní trámy', ['Výška trámu', 'Šířka trámu', 'Rozteč trámů', 'Max. doplňková vrstva', 'Např. pod trámy nebo na rošt nad nimi.']).map((f) => ({ ...f, show: (it) => it.walkable })),
    ],
    etics: [
      { k: 'perimeter', label: 'Obvod domu', unit: 'm', mode: 'rozmery' },
      { k: 'height', label: 'Výška zateplované fasády', unit: 'm', mode: 'rozmery', hint: 'Od soklu po okap; štíty připočtěte k ploše.' },
      { k: 'openings', label: 'Plocha oken a dveří', unit: 'm²', mode: 'rozmery' },
      { k: 'area', label: 'Plocha fasády bez otvorů', unit: 'm²', mode: 'plocha' },
      { k: 'wall', label: 'Stávající obvodová stěna', type: 'select', options: optionsFrom(C.EXISTING_WALLS), wide: true },
    ],
    drevostavba: [
      { k: 'len', label: 'Celková délka stěn', unit: 'm', mode: 'rozmery' },
      { k: 'height', label: 'Výška stěny', unit: 'm', mode: 'rozmery' },
      { k: 'openings', label: 'Plocha oken a dveří', unit: 'm²', mode: 'rozmery' },
      { k: 'area', label: 'Plocha stěn bez otvorů', unit: 'm²', mode: 'plocha' },
      ...FRAME('Sloupky', ['Hloubka sloupku', 'Šířka sloupku', 'Rozteč sloupků', 'Max. instalační předstěna', 'Doplňková izolace z interiéru.']),
    ],
    pricka: [
      { k: 'len', label: 'Délka příčky', unit: 'm', mode: 'rozmery' },
      { k: 'height', label: 'Výška příčky', unit: 'm', mode: 'rozmery' },
      { k: 'doors', label: 'Počet dveří', unit: 'ks', mode: 'rozmery' },
      { k: 'area', label: 'Plocha příčky', unit: 'm²', mode: 'plocha' },
      { k: 'profile', label: 'Šířka profilu CW', type: 'select', options: [['50', 'CW 50'], ['75', 'CW 75'], ['100', 'CW 100']] },
    ],
  };
  FIELDS.plocha = [
    { k: 'len', label: 'Délka střechy', unit: 'm', mode: 'rozmery' },
    { k: 'wid', label: 'Šířka střechy', unit: 'm', mode: 'rozmery' },
    { k: 'area', label: 'Plocha střechy', unit: 'm²', mode: 'plocha' },
    { k: 'deck', label: 'Nosná konstrukce', type: 'select', options: optionsFrom(C.FLAT_DECKS) },
    { k: 'use', label: 'Využití střechy', type: 'select', options: [['nepochozi', 'Nepochozí'], ['pochozi', 'Občasně pochozí (údržba, FVE servis)']] },
    { k: 'fixing', label: 'Stabilizace skladby', type: 'select', options: [['kotvena', 'Mechanicky kotvená'], ['pritizena', 'Přitížená (kačírek, zelená střecha)']] },
  ];
  FIELDS.podlaha = [
    { k: 'len', label: 'Délka místnosti', unit: 'm', mode: 'rozmery' },
    { k: 'wid', label: 'Šířka místnosti', unit: 'm', mode: 'rozmery' },
    { k: 'area', label: 'Plocha podlahy', unit: 'm²', mode: 'plocha', hint: 'Obvod pro okrajový pásek odhadneme.' },
    { k: 'floorType', label: 'Typ podlahy', type: 'select', options: optionsFrom(C.FLOOR_TYPES), wide: true },
    { k: 'load', label: 'Užitné zatížení', type: 'select', options: optionsFrom(C.FLOOR_LOADS) },
    { k: 'slab', label: 'Tloušťka ŽB stropu', unit: 'mm', hint: 'Pro odhad kročejového hluku; ponechte prázdné, pokud nevíte.' },
  ];
  FIELDS.nadkrokve = [
    { k: 'variant', label: 'Typ řešení', type: 'select', options: [['shora', 'Rekonstrukce shora – zachovat podhled, vyplnit i krokve'], ['prizn', 'Přiznaný krov – izolace jen nad krokvemi']], wide: true },
    { k: 'rafterLen', label: 'Délka krokve', unit: 'm', mode: 'rozmery' },
    { k: 'roofLen', label: 'Délka střechy', unit: 'm', mode: 'rozmery' },
    { k: 'sides', label: 'Počet střešních rovin', type: 'select', options: [['1', '1 – pultová'], ['2', '2 – sedlová'], ['4', '4 – valbová (orientačně)']], mode: 'rozmery' },
    { k: 'area', label: 'Plocha střechy', unit: 'm²', mode: 'plocha' },
    ...WINDOW_FIELDS,
    { k: 'maxOver', label: 'Max. tloušťka nad krokvemi', unit: 'mm', hint: 'Omezuje ji výška okapu a napojení na štíty.' },
    { sub: 'Krokve', show: (it) => it.variant === 'shora' },
    { k: 'frameDepth', label: 'Výška krokve', unit: 'mm', show: (it) => it.variant === 'shora' },
    { k: 'frameWidth', label: 'Šířka krokve', unit: 'mm', show: (it) => it.variant === 'shora' },
    { k: 'frameSpacing', label: 'Rozteč krokví', unit: 'mm', show: (it) => it.variant === 'shora' },
  ];
  FIELDS.sklep = [
    { k: 'len', label: 'Délka stropu', unit: 'm', mode: 'rozmery' },
    { k: 'wid', label: 'Šířka stropu', unit: 'm', mode: 'rozmery' },
    { k: 'area', label: 'Plocha stropu', unit: 'm²', mode: 'plocha' },
    { k: 'ceiling', label: 'Stávající strop', type: 'select', options: optionsFrom(C.EXISTING_CEILINGS), wide: true },
    { k: 'fire', label: 'Požadavek na nehořlavost', type: 'select', options: [['ano', 'Ano – garáž, kotelna, úniková cesta'], ['ne', 'Ne – běžný sklep']], wide: true },
  ];
  FIELDS.venti = FIELDS.etics;

  /* Nápověda s ilustracemi u vybraných polí */
  const SVG_RAFTERS = '<svg viewBox="0 0 220 110"><rect x="10" y="20" width="200" height="8" fill="var(--ki-cyan-40)"/><rect x="30" y="28" width="22" height="56" fill="var(--wood)"/><rect x="120" y="28" width="22" height="56" fill="var(--wood)"/><rect x="52" y="28" width="68" height="56" fill="var(--wool)" opacity=".7"/><path d="M60 92h0" /><path d="M158 28v56" stroke="var(--ki-blue-acc)" stroke-width="2" marker-start="url(#a)" marker-end="url(#a)"/><text x="164" y="60" font-size="11" fill="var(--ink)">výška</text><path d="M30 96h22" stroke="var(--ki-blue-acc)" stroke-width="2"/><text x="22" y="108" font-size="11" fill="var(--ink)">šířka</text><path d="M41 14h90" stroke="var(--ki-cyan)" stroke-width="2"/><path d="M41 10v8M131 10v8" stroke="var(--ki-cyan)" stroke-width="2"/><text x="56" y="10" font-size="11" fill="var(--ink)">rozteč (osa–osa)</text></svg>';
  const SVG_ROOF = '<svg viewBox="0 0 220 110"><path d="M20 90 110 20l90 70" fill="none" stroke="var(--ink-3)" stroke-width="3"/><path d="M24 84 106 22" stroke="var(--ki-cyan)" stroke-width="4"/><text x="36" y="44" font-size="11" fill="var(--ink)">délka krokve</text><path d="M20 100h180" stroke="var(--ki-blue-acc)" stroke-width="2"/><text x="70" y="96" font-size="11" fill="var(--ink)">(délka střechy = podél hřebene)</text></svg>';
  const SVG_FACADE = '<svg viewBox="0 0 220 110"><path d="M40 30h110v70H40z" fill="var(--ki-cyan-20)" stroke="var(--ink-3)"/><path d="M150 30l40-15v70l-40 15" fill="var(--ki-cyan-40)" stroke="var(--ink-3)"/><rect x="60" y="45" width="20" height="20" fill="#fff"/><rect x="105" y="45" width="20" height="20" fill="#fff"/><path d="M30 30v70" stroke="var(--ki-blue-acc)" stroke-width="2"/><text x="2" y="70" font-size="11" fill="var(--ink)">výška</text><path d="M40 106h110l40-15" fill="none" stroke="var(--ki-cyan)" stroke-width="3"/><text x="70" y="118" font-size="11" fill="var(--ink)">obvod</text></svg>';
  const HELP = {
    frameDepth: ['Rozměry krokví', 'Výšku a šířku změřte na průřezu krokve, rozteč jako vzdálenost středů dvou sousedních krokví.', SVG_RAFTERS],
    frameWidth: ['Rozměry krokví', 'Šířka je tloušťka krokve viditelná zespodu (obvykle 60–120 mm).', SVG_RAFTERS],
    frameSpacing: ['Rozteč krokví', 'Změřte vzdálenost ze středu jedné krokve do středu sousední (obvykle 600–1000 mm).', SVG_RAFTERS],
    rafterLen: ['Délka krokve', 'Měřte jen zateplovanou část – od pozednice po hřeben nebo po vodorovný strop podkroví.', SVG_ROOF],
    roofLen: ['Délka střechy', 'Délka střešní roviny ve směru hřebene (u sedlové střechy obvykle délka domu).', SVG_ROOF],
    perimeter: ['Obvod domu', 'Součet délek všech zateplovaných stěn. Výšku měřte od soklu po okap.', SVG_FACADE],
    height: ['Výška', 'Výška zateplované stěny. Plochu štítů přidejte zvlášť nebo použijte režim „Znám plochu“.', SVG_FACADE],
    maxExtra: ['Vrstva pod krokvemi', 'Izolace na roštu pod krokvemi přeruší tepelné mosty přes dřevo. Každý centimetr ale ubere výšku podkroví.', SVG_RAFTERS],
    winSize: ['Rozměr střešního okna', 'Rozměr najdete na typovém štítku v horní části rámu okna (po otevření křídla). Bývá uveden v cm jako šířka × výška, případně kódem výrobce – např. 78 × 118 cm. Jiný rozměr zadejte volbou „Jiný rozměr“.', '<svg viewBox="0 0 220 110"><path d="M20 100 110 15l90 85" fill="none" stroke="var(--ink-3)" stroke-width="3"/><rect x="88" y="45" width="44" height="40" fill="var(--ki-cyan-20)" stroke="var(--ki-blue-acc)" stroke-width="2"/><rect x="96" y="49" width="28" height="6" fill="#fff" stroke="var(--ki-cyan)"/><path d="M88 92h44" stroke="var(--ki-cyan)" stroke-width="2"/><text x="96" y="104" font-size="11" fill="var(--ink)">šířka</text><path d="M140 45v40" stroke="var(--ki-cyan)" stroke-width="2"/><text x="145" y="69" font-size="11" fill="var(--ink)">výška</text><text x="60" y="42" font-size="10" fill="var(--ink-2)">štítek</text></svg>'],
    slab: ['Tloušťka stropu', 'Tloušťka nosné železobetonové desky bez podlahy a omítek – najdete ji v projektu domu (běžně 150–250 mm).', ''],
  };

  /* ---------- stav ---------- */
  const fresh = () => ({ project: { name: '', level: 'doporucena', priority: 'vyvazeny', waste: '', energy: '' }, items: [], step: 1 });
  const energyPrice = () => { const n = K.num(state.project.energy, NaN); return Number.isFinite(n) && n > 0 ? n : 2.5; };
  /** Doplní nová pole do projektů uložených starší verzí. */
  const migrate = (i) => (DEFAULTS[i.type] ? { ...DEFAULTS[i.type], ...i, winSize: i.winSize || DEFAULTS[i.type].winSize } : i);

  let state = load();

  function load() {
    try {
      const raw = localStorage.getItem(STORE_KEY);
      if (raw) {
        const s = JSON.parse(raw);
        if (s && s.project && Array.isArray(s.items)) return { ...fresh(), ...s, items: s.items.filter((i) => C.TYPES[i.type]).map(migrate) };
      }
    } catch (e) { /* úložiště nedostupné */ }
    return fresh();
  }
  function save() { try { localStorage.setItem(STORE_KEY, JSON.stringify(state)); } catch (e) { /* ignore */ } }
  const ctx = () => ({ level: state.project.level, priority: state.project.priority, waste: state.project.waste });

  /* ---------- krok 1 ---------- */
  function renderStep1() {
    $('#project-name').value = state.project.name;
    $('#waste').value = state.project.waste;
    $('#energy').value = state.project.energy || '';
    const choice = (group, key, item, cur, tag) => `
      <label class="choice"><input type="radio" name="${group}" value="${key}" ${cur === key ? 'checked' : ''}>
        ${tag ? `<span class="tag">${tag}</span>` : ''}<strong>${esc(item.label)}</strong><small>${esc(item.sub)}</small></label>`;
    $('#level-choices').innerHTML = Object.entries(C.LEVELS).map(([k, v]) => choice('level', k, v, state.project.level, k === 'doporucena' ? 'Doporučujeme' : '')).join('');
    $('#priority-choices').innerHTML = Object.entries(C.PRIORITIES).map(([k, v]) => choice('priority', k, v, state.project.priority)).join('');
  }

  /* ---------- krok 2 ---------- */
  function renderTypeGrid() {
    $('#type-grid').innerHTML = Object.entries(C.TYPES).map(([k, t]) => `
      <button type="button" class="type-card" data-add="${k}">${ICONS[t.icon]}<strong>${esc(t.label)}</strong><small>${esc(t.short)}</small></button>`).join('');
  }

  const RANGES = {
    frameDepth: [40, 400, 'mm'], frameWidth: [30, 250, 'mm'], frameSpacing: [300, 1500, 'mm'], maxExtra: [0, 300, 'mm'],
    slab: [80, 400, 'mm'], windows: [0, 50, 'ks'], winW: [40, 160, 'cm'], winH: [60, 200, 'cm'], doors: [0, 20, 'ks'], sides: [1, 4, ''],
    rafterLen: [0.5, 30, 'm'], roofLen: [0.5, 100, 'm'], len: [0.3, 200, 'm'], wid: [0.3, 200, 'm'], height: [0.5, 60, 'm'],
    perimeter: [2, 500, 'm'], area: [0.5, 20000, 'm²'], openings: [0, 5000, 'm²'],
  };
  function rangeMsg(k, v) {
    const r = RANGES[k]; if (!r || v === '' || v == null) return '';
    const n = K.num(v, NaN);
    if (!Number.isFinite(n) || n < 0) return 'Zadejte kladné číslo.';
    if (n < r[0] || n > r[1]) return `Neobvyklá hodnota – obvykle ${String(r[0]).replace('.', ',')}–${String(r[1]).replace('.', ',')} ${r[2]}.`;
    return '';
  }

  function fieldHtml(item, f) {
    if (f.sub) return `<div class="sub-title">${esc(f.sub)}</div>`;
    const id = `f-${item.id}-${f.k}`;
    const wide = f.wide ? ' wide' : '';
    if (f.type === 'toggle') {
      return `<div class="field${wide}"><label class="toggle"><input type="checkbox" id="${id}" data-k="${f.k}" ${item[f.k] ? 'checked' : ''}> ${esc(f.label)}</label></div>`;
    }
    if (f.type === 'select') {
      const hs = HELP[f.help || f.k];
      const hb = hs ? `<button type="button" class="help-btn" data-help aria-expanded="false" aria-label="Nápověda: ${esc(hs[0])}">?</button>` : '';
      const hp = hs ? `<div class="help-pop" hidden><strong>${esc(hs[0])}</strong>${hs[2]}<p>${esc(hs[1])}</p></div>` : '';
      return `<div class="field${wide}"><label for="${id}">${esc(f.label)}${hb}</label>${hp}<select id="${id}" data-k="${f.k}">${f.options.map(([v, l]) => `<option value="${esc(v)}" ${String(item[f.k]) === String(v) ? 'selected' : ''}>${esc(l)}</option>`).join('')}</select></div>`;
    }
    const msg = rangeMsg(f.k, item[f.k]);
    const h = HELP[f.k];
    const helpBtn = h ? `<button type="button" class="help-btn" data-help aria-expanded="false" aria-label="Nápověda: ${esc(h[0])}">?</button>` : '';
    const helpPop = h ? `<div class="help-pop" hidden><strong>${esc(h[0])}</strong>${h[2]}<p>${esc(h[1])}</p></div>` : '';
    return `<div class="field${wide}${msg ? ' invalid' : ''}"><label for="${id}">${esc(f.label)}${helpBtn}</label>
      <div class="input-unit"><input id="${id}" type="number" inputmode="decimal" min="0" step="any" data-k="${f.k}" value="${esc(item[f.k])}"><span>${esc(f.unit)}</span></div>${helpPop}
      <p class="hint err" data-err>${esc(msg)}</p>${f.hint ? `<p class="hint">${esc(f.hint)}</p>` : ''}</div>`;
  }

  function itemBodyHtml(item) {
    const fields = FIELDS[item.type].filter((f) => (!f.mode || f.mode === item.mode) && (!f.show || f.show(item)));
    return fields.map((f) => fieldHtml(item, f)).join('');
  }

  function renderItems() {
    const box = $('#items');
    if (!state.items.length) {
      box.innerHTML = '<div class="empty">Zatím nemáte žádnou konstrukci. Vyberte níže, co chcete zateplit.</div>';
    } else {
      box.innerHTML = state.items.map((item) => {
        const t = C.TYPES[item.type];
        return `<article class="item" data-id="${item.id}">
          <div class="item-head">${ICONS[t.icon]}
            <input class="name-input" type="text" data-k="name" value="${esc(item.name)}" aria-label="Název konstrukce" maxlength="50">
            <span class="item-type">${esc(t.label)}</span>
            <span class="item-area" data-area>${fmt(K.geometry(item).area)} m²</span>
            <button type="button" class="btn ghost icon" data-act="dup" title="Duplikovat" aria-label="Duplikovat">⧉</button>
            <button type="button" class="btn ghost icon" data-act="del" title="Odebrat" aria-label="Odebrat">✕</button>
          </div>
          <div class="item-body">
            <div class="seg" role="group" aria-label="Způsob zadání">
              <button type="button" data-act="mode" data-mode="rozmery" class="${item.mode === 'rozmery' ? 'on' : ''}">Zadat rozměry</button>
              <button type="button" data-act="mode" data-mode="plocha" class="${item.mode === 'plocha' ? 'on' : ''}">Znám plochu</button>
            </div>
            <div class="grid-fields">${itemBodyHtml(item)}</div>
          </div></article>`;
      }).join('');
    }
    $('#add-title').textContent = state.items.length ? 'Přidat další konstrukci' : 'Vyberte konstrukci';
    $('#btn-calc').disabled = !state.items.length;
    renderSummary();
  }

  function addItem(type) {
    const item = { id: uid(), type, ...structuredClone(DEFAULTS[type]) };
    const same = state.items.filter((i) => i.type === type).length;
    if (same) item.name += ` ${same + 1}`;
    state.items.push(item);
    track('item_add', { type });
    save(); renderItems();
    const el = document.querySelector(`.item[data-id="${item.id}"]`);
    if (el) { el.scrollIntoView({ behavior: 'smooth', block: 'center' }); el.querySelector('.item-body input')?.focus({ preventScroll: true }); }
  }

  /* ---------- krok 3: vizualizace ---------- */
  function sectionSvg(res) {
    const W = 240; const H = 150;
    const wool = 'url(#wool)';
    const defs = `<defs><pattern id="wool" width="10" height="10" patternUnits="userSpaceOnUse"><rect width="10" height="10" fill="var(--wool)"/><path d="M0 5c2.5-3 5 3 7.5 0S10 5 10 5" stroke="var(--wool-line)" fill="none"/></pattern>
      <pattern id="brick" width="16" height="10" patternUnits="userSpaceOnUse"><rect width="16" height="10" fill="#c97a5a"/><path d="M0 0h16M0 5h16M8 0v5M0 5v5" stroke="#a65d40" stroke-width="1"/></pattern>
      <pattern id="eps" width="8" height="8" patternUnits="userSpaceOnUse"><rect width="8" height="8" fill="#b7bcc2"/><circle cx="4" cy="4" r="2.6" fill="#c9cdd2"/></pattern>
      <pattern id="conc" width="8" height="8" patternUnits="userSpaceOnUse"><rect width="8" height="8" fill="#a9b2ba"/><circle cx="2" cy="3" r=".9" fill="#7d8790"/><circle cx="6" cy="6" r=".7" fill="#7d8790"/></pattern></defs>`;
    const engine = res.typeInfo.engine === 'loose' && res.item.walkable ? 'framed' : res.typeInfo.engine;
    let g = '';
    if (engine === 'framed') {
      const cav = res.layers[0]; const ext = res.layers[1];
      const depth = Number(res.item.frameDepth) || cav.total;
      const total = depth + (ext ? ext.total : 0);
      const s = Math.min(0.5, 104 / total);
      const y0 = 18; const hC = depth * s; const hE = ext ? ext.total * s : 0;
      g += `<line x1="8" y1="${y0 - 4}" x2="${W - 8}" y2="${y0 - 4}" stroke="var(--brand)" stroke-width="2" stroke-dasharray="6 3"/>`;
      g += `<rect x="8" y="${y0}" width="${W - 16}" height="${hC}" fill="${wool}"/>`;
      const fill = cav.total * s;
      if (fill < hC - 1) g += `<rect x="8" y="${y0}" width="${W - 16}" height="${hC - fill}" fill="var(--card)"/>`;
      const fw = Math.max(8, (Number(res.item.frameWidth) || 80) * 0.18);
      [30, W / 2, W - 30].forEach((cx) => { g += `<rect x="${cx - fw / 2}" y="${y0}" width="${fw}" height="${hC}" fill="var(--wood)" stroke="#7a5532" stroke-width=".6"/>`; });
      if (ext) {
        g += `<rect x="8" y="${y0 + hC}" width="${W - 16}" height="${hE}" fill="${wool}" stroke="var(--wool-line)" stroke-width=".5"/>`;
        [60, W - 60].forEach((cx) => { g += `<rect x="${cx - 4}" y="${y0 + hC}" width="8" height="${hE}" fill="var(--wood)" opacity=".8"/>`; });
      }
      const yb = y0 + hC + hE;
      g += `<rect x="8" y="${yb}" width="${W - 16}" height="4" fill="#cfd6dc" stroke="#9aa5ae" stroke-width=".5"/>`;
      g += `<text x="${W - 10}" y="${y0 - 8}" text-anchor="end" font-size="9" fill="var(--ink-3)">${res.item.type === 'drevostavba' ? 'exteriér' : 'pojistná fólie'}</text>`;
      g += `<text x="${W - 10}" y="${yb + 16}" text-anchor="end" font-size="9" fill="var(--ink-3)">parozábrana + SDK · interiér</text>`;
    } else if (engine === 'loose') {
      const total = res.layers[0].total; const s = Math.min(0.42, 95 / total);
      const slab = 22; let y = H - 12 - slab;
      const wooden = (C.EXISTING_CEILINGS[res.item.ceiling] || {}).wooden;
      g += `<rect x="8" y="${y}" width="${W - 16}" height="${slab}" fill="${wooden ? 'var(--wood)' : 'url(#conc)'}"/>`;
      if (wooden) g += `<line x1="8" y1="${y - 1}" x2="${W - 8}" y2="${y - 1}" stroke="var(--brand)" stroke-width="2"/>`;
      res.layers[0].parts.slice().reverse().forEach((t) => {
        const h = t * s; y -= h;
        g += `<rect x="8" y="${y}" width="${W - 16}" height="${h}" fill="${wool}" stroke="var(--wool-line)" stroke-width=".8"/>`;
      });
      g += `<text x="${W - 10}" y="${y - 6}" text-anchor="end" font-size="9" fill="var(--ink-3)">nevytápěná půda</text>`;
      g += `<text x="${W - 10}" y="${H - 1}" text-anchor="end" font-size="9" fill="var(--ink-3)">vytápěná místnost</text>`;
    } else if (engine === 'flat') {
      const upL = res.layers[0]; const loL = res.layers[1];
      const total = upL.total + loL.total; const s = Math.min(0.3, 100 / total);
      const deck = 18; let y = H - 8 - deck;
      if (res.item.deck === 'trapez') {
        let d = `M8 ${y + deck}`; for (let x = 8; x < W - 8; x += 32) d += ` L${x} ${y} L${x + 14} ${y} L${x + 16} ${y + deck} L${x + 30} ${y + deck}`;
        g += `<path d="${d}" fill="none" stroke="#7d8790" stroke-width="2"/>`;
      } else g += `<rect x="8" y="${y}" width="${W - 16}" height="${deck}" fill="url(#conc)"/>`;
      g += `<line x1="8" y1="${y - 1}" x2="${W - 8}" y2="${y - 1}" stroke="var(--brand)" stroke-width="2"/>`;
      loL.parts.slice().reverse().forEach((t) => { const h = t * s; y -= h; g += `<rect x="8" y="${y}" width="${W - 16}" height="${h}" fill="${wool}" stroke="var(--wool-line)" stroke-width=".8"/>`; });
      const hu = upL.total * s; y -= hu;
      g += `<rect x="8" y="${y}" width="${W - 16}" height="${hu}" fill="var(--wool-line)" opacity=".85"/>`;
      g += `<rect x="8" y="${y - 4}" width="${W - 16}" height="4" fill="#3b4752"/>`;
      g += `<text x="${W - 10}" y="${y - 8}" text-anchor="end" font-size="9" fill="var(--ink-3)">hydroizolace</text>`;
    } else if (engine === 'floor') {
      const t = res.layers[0].total; const heavy = res.item.floorType !== 'sucha';
      let y = H - 30;
      g += `<rect x="8" y="${y}" width="${W - 16}" height="22" fill="url(#conc)"/>`;
      const hi = t * 0.9; y -= hi;
      g += `<rect x="20" y="${y}" width="${W - 28}" height="${hi}" fill="${wool}" stroke="var(--wool-line)" stroke-width=".8"/>`;
      const hs = heavy ? 34 : 16; y -= hs;
      g += `<rect x="20" y="${y}" width="${W - 28}" height="${hs}" fill="${heavy ? '#b9c0c6' : 'var(--wood)'}"/>`;
      g += `<rect x="20" y="${y - 5}" width="${W - 28}" height="5" fill="#8a6440" opacity=".7"/>`;
      g += `<rect x="12" y="${y - 5}" width="6" height="${hi + hs + 5}" fill="${wool}" stroke="var(--wool-line)" stroke-width=".6"/>`;
      g += `<rect x="8" y="10" width="4" height="${H - 18}" fill="#c97a5a"/>`;
      g += `<text x="${W - 10}" y="${y - 10}" text-anchor="end" font-size="9" fill="var(--ink-3)">${heavy ? 'nášlapná vrstva · roznášecí deska' : 'suchá podlaha'}</text>`;
    } else if (engine === 'cellar') {
      const t = res.layers[0].total; const s2 = Math.min(0.45, 70 / t);
      g += `<rect x="8" y="30" width="${W - 16}" height="30" fill="url(#conc)"/>`;
      g += `<rect x="8" y="14" width="${W - 16}" height="16" fill="#b9c0c6"/>`;
      const h = t * s2;
      g += `<rect x="8" y="60" width="${W - 16}" height="${h}" fill="${res.layers[0].product === 'tektalan' ? wool : 'url(#eps)'}" stroke="var(--wool-line)" stroke-width=".8"/>`;
      g += `<rect x="8" y="${60 + h}" width="${W - 16}" height="5" fill="#c9b48a"/>`;
      g += `<text x="${W - 10}" y="10" text-anchor="end" font-size="9" fill="var(--ink-3)">vytápěná místnost</text>`;
      g += `<text x="${W - 10}" y="${80 + h}" text-anchor="end" font-size="9" fill="var(--ink-3)">sklep / garáž · povrch z dřevité vlny</text>`;
    } else if (engine === 'over') {
      const over = res.layers[0]; const cav = res.layers[1];
      const shora = res.item.variant === 'shora';
      const depth = shora ? (Number(res.item.frameDepth) || 140) : 0;
      const sc = Math.min(0.4, 110 / (over.total + depth + 24));
      let y = 14;
      g += `<line x1="8" y1="${y - 4}" x2="${W - 8}" y2="${y - 4}" stroke="var(--brand)" stroke-width="2" stroke-dasharray="6 3"/>`;
      const ho = over.total * sc;
      g += `<rect x="8" y="${y}" width="${W - 16}" height="${ho}" fill="${wool}" stroke="var(--wool-line)" stroke-width=".6"/>`;
      [50, W - 50].forEach((cx) => { g += `<rect x="${cx - 5}" y="${y}" width="10" height="${ho * 0.55}" fill="var(--wood)"/><rect x="${cx - 6}" y="${y + ho * 0.55}" width="12" height="${ho * 0.45}" fill="#9aa5ae"/>`; });
      y += ho;
      g += `<rect x="8" y="${y}" width="${W - 16}" height="3" fill="var(--brand)" opacity=".8"/>`; y += 3;
      if (shora) {
        const hc = depth * sc;
        g += `<rect x="8" y="${y}" width="${W - 16}" height="${hc}" fill="${cav ? wool : 'var(--card)'}"/>`;
        [30, W / 2, W - 30].forEach((cx) => { g += `<rect x="${cx - 7}" y="${y}" width="14" height="${hc}" fill="var(--wood)" stroke="#7a5532" stroke-width=".6"/>`; });
        y += hc; g += `<rect x="8" y="${y}" width="${W - 16}" height="4" fill="#cfd6dc"/>`;
        g += `<text x="${W - 10}" y="${y + 16}" text-anchor="end" font-size="9" fill="var(--ink-3)">původní podhled · interiér</text>`;
      } else {
        g += `<rect x="8" y="${y}" width="${W - 16}" height="8" fill="#d7b98f"/>`;
        [40, W / 2, W - 40].forEach((cx) => { g += `<rect x="${cx - 8}" y="${y + 8}" width="16" height="34" fill="var(--wood)" stroke="#7a5532" stroke-width=".6"/>`; });
        g += `<text x="${W - 10}" y="${y + 56}" text-anchor="end" font-size="9" fill="var(--ink-3)">přiznaný krov · interiér</text>`;
      }
      g += `<text x="${W - 10}" y="8" text-anchor="end" font-size="9" fill="var(--ink-3)">pojistná hydroizolace</text>`;
    } else if (engine === 'masonry') {
      const total = res.layers[0].total; const s = Math.min(0.42, 90 / total);
      const wW = 70; const x0 = 40;
      g += `<rect x="${x0}" y="10" width="${wW}" height="${H - 20}" fill="url(#brick)"/>`;
      let x = x0 + wW;
      res.layers[0].parts.forEach((t) => { const w = t * s; g += `<rect x="${x}" y="10" width="${w}" height="${H - 20}" fill="${wool}" stroke="var(--wool-line)" stroke-width=".8"/>`; x += w; });
      if (res.item.type === 'venti') { x += 10; g += `<rect x="${x}" y="10" width="6" height="${H - 20}" fill="#6d7a86"/>`; }
      else g += `<rect x="${x}" y="10" width="4" height="${H - 20}" fill="#e9e4da" stroke="#b7b0a3" stroke-width=".5"/>`;
      g += `<text x="${x0 - 4}" y="${H / 2}" text-anchor="end" font-size="9" fill="var(--ink-3)">interiér</text>`;
    } else {
      const t = res.layers[0].total; const w = t * 0.9; const x0 = (W - w) / 2;
      g += `<rect x="${x0 - 8}" y="10" width="8" height="${H - 20}" fill="#cfd6dc" stroke="#9aa5ae"/>`;
      g += `<rect x="${x0}" y="10" width="${w}" height="${H - 20}" fill="${wool}"/>`;
      g += `<rect x="${x0 + w}" y="10" width="8" height="${H - 20}" fill="#cfd6dc" stroke="#9aa5ae"/>`;
      [40, 95].forEach((y) => { g += `<rect x="${x0}" y="${y}" width="${w}" height="3" fill="#8f9aa4"/>`; });
    }
    return `<svg viewBox="0 0 ${W} ${H}" role="img" aria-label="Schéma skladby konstrukce">${defs}${g}</svg>`;
  }

  function ubarHtml(res) {
    if (res.U == null || res.target == null) return '';
    const scale = Math.max(res.target * 1.8, res.U * 1.1, res.uBase ? Math.min(res.uBase, res.target * 3) : 0);
    const pct = Math.min(100, (res.U / scale) * 100);
    const mark = (res.target / scale) * 100;
    return `<div class="ubar">
      <div class="ubar-row"><span>Součinitel prostupu tepla <b>U = ${fmtU(res.U)}</b> W/(m²K)</span>
      <span>cíl ≤ ${fmtU(res.target)} <span class="badge ${res.ok ? 'ok' : 'bad'}">${res.ok ? 'Splňuje' : 'Nesplňuje'}</span></span></div>
      <div class="ubar-track"><div class="ubar-fill ${res.ok ? '' : 'bad'}" style="width:${pct}%"></div><div class="ubar-mark" style="left:${mark}%" title="Cílová hodnota"></div></div>
    </div>`;
  }

  function levelsHtml(item) {
    if (!C.TYPES[item.type].target) return '';
    return `<div class="levels" role="group" aria-label="Porovnání úrovní">${Object.entries(C.LEVELS).map(([k, l]) => {
      const r = K.recommend(item, { ...ctx(), level: k });
      const t = r ? r.layers.reduce((s, x) => s + x.total, 0) : 0;
      return `<button type="button" data-level="${k}" class="${state.project.level === k ? 'on' : ''}">${esc(l.label)}: ${t} mm</button>`;
    }).join('')}</div>`;
  }

  function resultCard(res) {
    const t = res.typeInfo;
    const layers = res.layers.map((l) => {
      const p = C.PRODUCTS[l.product];
      return `<div class="layer"><span class="sw"></span><div><b>${esc(p.name)}</b> <small>${esc(l.name)} · λ = ${fmt(p.lambda, 3)} W/(mK)</small></div>
        <span class="t">${l.parts.join(' + ')} mm</span></div>`;
    }).join('');
    const lines = res.lines.map((l) => `${esc(C.PRODUCTS[l.product].name)} ${l.t} mm: ${fmt(l.m2)} m²`).join(' · ');
    return `<article class="rcard">
      <div class="rcard-visual">${sectionSvg(res)}</div>
      <div class="rcard-body">
        <div class="rcard-top"><h3>${esc(res.item.name || t.label)}</h3><small>${esc(t.label)} · ${fmt(res.area)} m²</small></div>
        ${levelsHtml(res.item)}
        ${layers}
        ${ubarHtml(res)}
        ${res.kwh ? `<div class="saving">Úspora oproti stavu bez zateplení ≈ <b>${kc(res.kwh * energyPrice())}</b> ročně</div>` : ''}
        <div class="lines">Potřeba vč. prořezu: ${lines}</div>
        ${res.warnings.map((w) => `<div class="warning">${esc(w)}</div>`).join('')}
        ${res.notes.length ? `<ul class="notes">${res.notes.map((n) => `<li>${esc(n)}</li>`).join('')}</ul>` : ''}
      </div></article>`;
  }

  function renderSummary() {
    const results = state.items.map((i) => K.recommend(i, ctx())).filter(Boolean);
    const agg = K.aggregate(results);
    const n = state.items.length;
    $('#summary-stats').innerHTML = n ? `
      <div><b>${n}</b><span>${n === 1 ? 'konstrukce' : n <= 4 ? 'konstrukce' : 'konstrukcí'}</span></div>
      <div><b>${fmt(agg.totalArea, 0)} m²</b><span>plocha</span></div>
      <div><b>≈ ${kc(agg.price * (1 + C.VAT))}</b><span>vč. DPH</span></div>`
      : '<div><b>Začněte výběrem konstrukce</b><span>níže na stránce</span></div>';
  }

  let lastAgg = null;
  function renderResults() {
    const results = state.items.map((i) => K.recommend(i, ctx())).filter(Boolean);
    const agg = K.aggregate(results);
    lastAgg = agg;
    const lvl = C.LEVELS[state.project.level];
    $('#result-title').textContent = state.project.name ? state.project.name : 'Vaše doporučení';
    $('#result-sub').textContent = `Úroveň: ${lvl.label} · Priorita: ${C.PRIORITIES[state.project.priority].label}`;

    const withTarget = results.filter((r) => r.target != null);
    const okCount = withTarget.filter((r) => r.ok).length;
    const kwh = results.reduce((s, r) => s + (r.kwh || 0), 0);
    const yearly = kwh * energyPrice();
    const tiles = [
      [fmt(agg.totalArea, 0) + ' m²', 'plocha konstrukcí'],
      [agg.totalPacks, 'balení a desek izolace'],
      [kc(agg.price * (1 + C.VAT)), 'orientační cena materiálu vč. DPH', 'hl'],
      withTarget.length ? [`${okCount}/${withTarget.length}`, 'konstrukcí splňuje cíl'] : [results.length, 'konstrukcí'],
    ];
    if (yearly > 0) tiles.splice(3, 0, [`≈ ${kc(yearly)}`, `roční úspora za teplo (${fmt(kwh / 1000, 1)} MWh)`, 'save']);
    $('#tiles').innerHTML = tiles.map(([b, s, c]) => `<div class="tile ${c || ''}"><b>${b}</b><span>${s}</span></div>`).join('');

    $('#variants').innerHTML = `<div class="variants-title">Porovnejte varianty materiálu</div><div class="variant-grid">${Object.entries(C.PRIORITIES).map(([k, pr]) => {
      const rs = state.items.map((i) => K.recommend(i, { ...ctx(), priority: k })).filter(Boolean);
      const a = K.aggregate(rs);
      const ok = rs.filter((r) => r.target != null && r.ok).length; const tot = rs.filter((r) => r.target != null).length;
      return `<button type="button" class="variant ${state.project.priority === k ? 'on' : ''}" data-prio="${k}">
        <strong>${esc(pr.label)}</strong><span class="vp">${kc(a.price * (1 + C.VAT))}</span>
        <small>${esc(pr.sub)}${tot ? ` · cíl splněn ${ok}/${tot}` : ''}</small></button>`;
    }).join('')}</div>`;

    let rows = '<tr class="group"><td colspan="5">Izolace</td></tr>';
    rows += agg.insulation.map((l) => {
      const p = C.PRODUCTS[l.product];
      return `<tr><td><div class="pname">${esc(p.name)} · ${l.t} mm</div><div class="pdesc">${esc(p.desc)}</div></td>
        <td class="num">${fmt(l.m2)} m²</td><td class="num">${fmt(l.perPack, 2)} m²/${esc(p.packUnit)}</td>
        <td class="num"><span class="packs">${l.packs}</span> ${esc(unitWord(p.packUnit, l.packs))}</td>
        <td class="num">${l.noPrice ? '<small>na dotaz</small>' : kc(l.price)}</td></tr>`;
    }).join('');
    if (agg.accessories.length) {
      rows += '<tr class="group"><td colspan="5">Vzduchotěsnost a příslušenství</td></tr>';
      rows += agg.accessories.map((a) => {
        const d = C.ACCESSORIES[a.id];
        return `<tr><td><div class="pname">${esc(d.name)}</div><div class="pdesc">${esc(d.desc)}</div></td>
          <td class="num">${fmt(a.need, 0)} ${esc(d.perLabel)}</td><td class="num">${d.perUnit} ${esc(d.perLabel)}/${esc(d.unit)}</td>
          <td class="num"><span class="packs">${a.qty}</span> ${esc(unitWord(d.unit, a.qty))}</td>
          <td class="num">${kc(a.price)}</td></tr>`;
      }).join('');
    }
    $('#shopping').innerHTML = `<div class="table-wrap"><table>
      <thead><tr><th>Produkt</th><th class="num">Potřeba</th><th class="num">Balení</th><th class="num">Koupit</th><th class="num">Cena bez DPH</th></tr></thead>
      <tbody>${rows}</tbody>
      <tfoot><tr><td colspan="4">Celkem bez DPH<br><small>vč. DPH ${Math.round(C.VAT * 100)} %</small></td><td class="num"><b>${kc(agg.price)}</b><br><small>${kc(agg.price * (1 + C.VAT))}</small></td></tr></tfoot></table></div>
      ${agg.noPrice ? '<p class="hint">Desky Heraklith / Tektalan nejsou ve stavebním ceníku – cenu získáte u prodejce, v součtu nejsou zahrnuty.</p>' : ''}
      <p class="hint">Ceny dle ${esc(C.PRICE_LIST)}. Skutečné ceny u prodejců se mohou lišit – pro individuální nabídku kontaktujte prodejce.</p>`;

    $('#results').innerHTML = results.map(resultCard).join('') || '<div class="empty">Přidejte konstrukci v kroku 2.</div>';

    const sub = K.subsidy(results); const S = C.SUBSIDY;
    const eligible = Object.values(sub.areas).some((a) => a > 0);
    $('#subsidy').innerHTML = eligible ? `<section class="subsidy">
      <div class="subsidy-head"><span class="subsidy-tag">Dotace</span><h3>Nová zelená úsporám 2026</h3></div>
      <div class="subsidy-grid">
        <div><small>${esc(S.light.label)}</small><b>${sub.light ? `až ${kc(sub.light)}` : '—'}</b>
          <span>${sub.light ? `dotace ${kc(S.light.rates.wall)}/m² stěny a střechy, ${kc(S.light.rates.attic)}/m² stropu pod půdou; max. ${kc(S.light.cap)}` : `podpora začíná od ${kc(S.light.min)} (nyní ${kc(sub.lightRaw)})`}</span></div>
        <div><small>${esc(S.loan.label)}</small><b>až ${kc(sub.loan)}</b>
          <span>bezúročný úvěr až ${kc(S.loan.rates.wall)}/m² stěny a střechy; max. ${kc(S.loan.cap)}</span></div>
      </div>
      <p class="hint">Orientační odhad pro rodinné domy dokončené před ${esc(S.builtBefore)}. Započteny jsou jen konstrukce, které splňují zvolený cíl. Podmínkou je odborný posudek a splnění technických požadavků výzvy (součinitel U) – aktuální podmínky ověřte na <a href="${esc(S.url)}" target="_blank" rel="noopener">novazelenausporam.cz</a>.</p>
    </section>` : '';

    renderDealers();
    track('results_view', { items: results.length, area: Math.round(agg.totalArea), price: Math.round(agg.price), priority: state.project.priority, level: state.project.level });
  }

  function shoppingText() {
    if (!lastAgg) return '';
    const out = [`${state.project.name || 'Plánovač zateplení'} – nákupní seznam`, ''];
    lastAgg.insulation.forEach((l) => { const p = C.PRODUCTS[l.product]; out.push(`${p.name} ${l.t} mm – ${l.packs} ${unitWord(p.packUnit, l.packs)} (${fmt(l.m2)} m²)`); });
    lastAgg.accessories.forEach((a) => { const d = C.ACCESSORIES[a.id]; out.push(`${d.name} – ${a.qty} ${unitWord(d.unit, a.qty)}`); });
    out.push(`Orientační cena: ${kc(lastAgg.price)} bez DPH (${kc(lastAgg.price * (1 + C.VAT))} vč. DPH) – ${C.PRICE_LIST}`);
    out.push('', 'Konstrukce:');
    state.items.forEach((i) => { const r = K.recommend(i, ctx()); if (r) out.push(`• ${i.name} (${fmt(r.area)} m²): ${r.layers.map((l) => `${C.PRODUCTS[l.product].name} ${l.parts.join('+')} mm`).join(', ')}${r.U != null ? `, U = ${fmtU(r.U)}` : ''}`); });
    return out.join('\n');
  }

  /* ---------- export PDF ---------- */
  const loadScript = (src) => new Promise((ok, fail) => {
    if (document.querySelector(`script[data-src="${src}"]`)) return ok();
    const sc = document.createElement('script'); sc.src = src; sc.dataset.src = src;
    sc.onload = ok; sc.onerror = () => fail(new Error(src)); document.head.appendChild(sc);
  });
  async function ensurePdfLibs() {
    if (!window.jspdf) await loadScript('vendor/jspdf.umd.min.js');
    if (!(window.jspdf && window.jspdf.jsPDF.API.autoTable)) await loadScript('vendor/jspdf.plugin.autotable.min.js');
    if (!window.KI_PDF_ASSETS) await loadScript('vendor/pdf-assets.js');
    if (!window.PlannerPDF) await loadScript('js/pdf-export.js');
  }
  const slug = (t) => String(t || 'projekt').normalize('NFD').replace(/[\u0300-\u036f]/g, '').toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '').slice(0, 40) || 'projekt';

  function buildPdfData() {
    const results = state.items.map((i) => K.recommend(i, ctx())).filter(Boolean);
    const agg = K.aggregate(results);
    const kwh = results.reduce((s2, r) => s2 + (r.kwh || 0), 0);
    const sub = K.subsidy(results); const S = C.SUBSIDY;
    const vatPct = Math.round(C.VAT * 100);
    return {
      projectName: state.project.name || 'Plánovač zateplení',
      date: new Date().toLocaleDateString('cs-CZ'),
      levelLabel: C.LEVELS[state.project.level].label,
      prioLabel: C.PRIORITIES[state.project.priority].label,
      priceList: C.PRICE_LIST,
      insulation: agg.insulation.map((l) => {
        const p = C.PRODUCTS[l.product];
        return { name: p.name, desc: p.desc, t: l.t, m2: fmt(l.m2), perPack: fmt(l.perPack, 2), unit: p.packUnit, packs: l.packs, packsWord: unitWord(p.packUnit, l.packs), price: l.noPrice ? 'na dotaz' : kc(l.price) };
      }),
      accessories: agg.accessories.map((a) => {
        const d = C.ACCESSORIES[a.id];
        return { name: d.name, desc: d.desc, need: `${fmt(a.need, 0)} ${d.perLabel}`, perPack: `${d.perUnit} ${d.perLabel}/${d.unit}`, qty: a.qty, qtyWord: unitWord(d.unit, a.qty), price: kc(a.price) };
      }),
      totals: {
        area: `${fmt(agg.totalArea, 0)} m²`, packs: agg.totalPacks, vatPct,
        price: kc(agg.price), vat: kc(agg.price * C.VAT), priceVat: kc(agg.price * (1 + C.VAT)),
        saving: kwh > 0 ? `≈ ${kc(kwh * energyPrice())}` : '', noPrice: agg.noPrice,
      },
      constructions: results.map((r) => ({
        name: r.item.name || r.typeInfo.label, type: r.typeInfo.label, area: `${fmt(r.area)} m²`,
        layers: r.layers.map((l) => `${C.PRODUCTS[l.product].name} ${l.parts.join(' + ')} mm – ${l.name.toLowerCase()}`).join('\n'),
        U: r.U != null ? fmtU(r.U) : '', target: r.target != null ? fmtU(r.target) : '', ok: r.ok,
      })),
      subsidy: Object.values(sub.areas).some((a) => a > 0) ? {
        light: `${S.light.label}: ${sub.light ? `až ${kc(sub.light)}` : 'pod minimální výší podpory'}`,
        loan: `${S.loan.label}: až ${kc(sub.loan)}`,
        note: `Pro rodinné domy dokončené před ${S.builtBefore}. Podmínkou je odborný posudek a splnění technických požadavků výzvy – aktuální podmínky ověřte na novazelenausporam.cz.`,
      } : null,
      disclaimer: 'Výpočet je orientační (princip ČSN EN ISO 6946, normové hodnoty ČSN 73 0540-2) a nenahrazuje projektovou dokumentaci. Skutečná spotřeba se může lišit podle tvaru konstrukce a způsobu pokládky. Montáž provádějte podle technických listů a montážních návodů Knauf Insulation.',
    };
  }

  async function exportPdf(btn) {
    if (!state.items.length) { toast('Nejprve přidejte alespoň jednu konstrukci.'); return; }
    const buttons = document.querySelectorAll('[data-pdf]');
    buttons.forEach((b) => b.setAttribute('aria-busy', 'true'));
    try {
      await ensurePdfLibs();
      const data = buildPdfData();
      const doc = window.PlannerPDF.build(data);
      const name = `nakupni-seznam-${slug(state.project.name)}-${new Date().toISOString().slice(0, 10)}.pdf`;
      doc.save(name);
      toast('PDF se stahuje.');
      track('pdf_export', { items: state.items.length });
    } catch (e) {
      toast('PDF se nepodařilo vytvořit. Zkuste Tisk → Uložit jako PDF.');
    } finally {
      buttons.forEach((b) => b.removeAttribute('aria-busy'));
    }
  }

  /* ---------- prodejci ---------- */
  const DEALERS = window.Dealers || [];
  function renderDealers(query) {
    const sec = $('#dealers');
    sec.hidden = !DEALERS.length;
    $('#btn-contact').href = DEALERS.length ? '#dealers' : C.BRAND.contactUrl;
    if (!DEALERS.length) return;
    const q = String(query || '').trim().toLowerCase();
    const digits = q.replace(/\D/g, '');
    let list = DEALERS.slice();
    if (digits.length >= 3) {
      const n = Number(digits.padEnd(5, '0').slice(0, 5));
      list.sort((a, b) => Math.abs(Number(a.psc) - n) - Math.abs(Number(b.psc) - n));
    } else if (q) {
      list = list.filter((d) => `${d.city} ${d.name}`.toLowerCase().includes(q));
    }
    $('#dealer-list').innerHTML = list.slice(0, 6).map((d) => `<li>
      <strong>${esc(d.name)}</strong><span>${esc(d.street || '')}, ${esc(d.psc || '')} ${esc(d.city || '')}</span>
      <span>${d.phone ? `<a href="tel:${esc(d.phone.replace(/\s/g, ''))}">${esc(d.phone)}</a>` : ''}${d.web ? ` · <a href="${esc(d.web)}" target="_blank" rel="noopener">web</a>` : ''}</span></li>`).join('')
      || '<li class="empty">Pro zadané místo jsme prodejce nenašli.</li>';
  }
  $('#dealer-form').addEventListener('submit', (e) => {
    e.preventDefault(); const q = $('#dealer-psc').value; renderDealers(q); track('dealer_search', { query_len: q.length });
  });

  /* ---------- navigace ---------- */
  function go(step, scroll) {
    step = Number(step);
    if (step === 3 && !state.items.length) { toast('Nejprve přidejte alespoň jednu konstrukci.'); step = 2; }
    state.step = step; save();
    document.querySelectorAll('.panel').forEach((p) => { p.hidden = Number(p.dataset.step) !== step; });
    document.querySelectorAll('.step').forEach((b) => {
      const n = Number(b.dataset.go);
      b.classList.toggle('active', n === step); b.classList.toggle('done', n < step);
      b.setAttribute('aria-current', n === step ? 'step' : 'false');
    });
    $('#hero').classList.toggle('compact', step !== 1);
    $('#summary-bar').hidden = step !== 2;
    document.body.classList.toggle('has-bar', step === 2);
    track('step_view', { step });
    if (step === 1) renderStep1();
    if (step === 2) renderItems();
    if (step === 3) renderResults();
    if (scroll !== false) window.scrollTo({ top: 0, behavior: 'smooth' });
  }

  let toastTimer;
  function toast(msg) {
    const t = $('#toast'); t.textContent = msg; t.classList.add('show');
    clearTimeout(toastTimer); toastTimer = setTimeout(() => t.classList.remove('show'), 2400);
  }

  /* ---------- události ---------- */
  document.addEventListener('click', (e) => {
    const pdfBtn = e.target.closest('[data-pdf]');
    if (pdfBtn) { exportPdf(pdfBtn); return; }
    const hb = e.target.closest('[data-help]');
    if (hb) {
      e.preventDefault();
      const pop = hb.closest('.field').querySelector('.help-pop');
      pop.hidden = !pop.hidden; hb.setAttribute('aria-expanded', String(!pop.hidden));
      track('help_open', { field: hb.closest('.field').querySelector('input')?.dataset.k });
      return;
    }
    const goBtn = e.target.closest('[data-go]');
    if (goBtn) { go(goBtn.dataset.go); return; }
    const add = e.target.closest('[data-add]');
    if (add) { addItem(add.dataset.add); return; }
    const lv = e.target.closest('[data-level]');
    if (lv) { state.project.level = lv.dataset.level; save(); track('level_change', { level: lv.dataset.level }); renderResults(); return; }
    const pv = e.target.closest('[data-prio]');
    if (pv) { state.project.priority = pv.dataset.prio; save(); track('variant_change', { priority: pv.dataset.prio }); renderResults(); toast(`Varianta: ${C.PRIORITIES[pv.dataset.prio].label}`); return; }
    const act = e.target.closest('[data-act]');
    if (act) {
      const card = act.closest('.item'); const idx = state.items.findIndex((i) => i.id === card.dataset.id);
      if (idx < 0) return;
      if (act.dataset.act === 'del') { track('item_remove', { type: state.items[idx].type }); state.items.splice(idx, 1); }
      if (act.dataset.act === 'dup') state.items.splice(idx + 1, 0, { ...structuredClone(state.items[idx]), id: uid(), name: state.items[idx].name + ' (kopie)' });
      if (act.dataset.act === 'mode') state.items[idx].mode = act.dataset.mode;
      save(); renderItems();
    }
  });

  $('#items').addEventListener('input', (e) => {
    const k = e.target.dataset.k; if (!k) return;
    const card = e.target.closest('.item'); const item = state.items.find((i) => i.id === card.dataset.id);
    if (!item) return;
    item[k] = e.target.type === 'checkbox' ? e.target.checked : e.target.value;
    save();
    if (e.target.tagName === 'SELECT' || e.target.type === 'checkbox') renderItems();
    else {
      card.querySelector('[data-area]').textContent = `${fmt(K.geometry(item).area)} m²`;
      const field = e.target.closest('.field'); const msg = rangeMsg(k, e.target.value);
      if (field) { field.classList.toggle('invalid', !!msg); const er = field.querySelector('[data-err]'); if (er) er.textContent = msg; }
    }
    renderSummary();
  });

  document.querySelector('[data-step="1"]').addEventListener('change', (e) => {
    if (e.target.name === 'level') state.project.level = e.target.value;
    if (e.target.name === 'priority') state.project.priority = e.target.value;
    save();
  });
  $('#project-name').addEventListener('input', (e) => { state.project.name = e.target.value; save(); });
  $('#waste').addEventListener('input', (e) => { state.project.waste = e.target.value; save(); });
  $('#energy').addEventListener('input', (e) => { state.project.energy = e.target.value; save(); });

  $('#btn-print').addEventListener('click', () => { track('print'); window.print(); });
  const enc = (o) => btoa(unescape(encodeURIComponent(JSON.stringify(o)))).replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '');
  const dec = (s2) => JSON.parse(decodeURIComponent(escape(atob(s2.replace(/-/g, '+').replace(/_/g, '/')))));
  $('#btn-share').addEventListener('click', async () => {
    track('share');
    const url = `${location.href.split('#')[0]}#p=${enc({ project: state.project, items: state.items })}`;
    try {
      if (navigator.share) await navigator.share({ title: state.project.name || 'Plánovač zateplení', url });
      else { await navigator.clipboard.writeText(url); toast('Odkaz na projekt zkopírován.'); }
    } catch (err) { if (err && err.name !== 'AbortError') toast('Sdílení se nepodařilo.'); }
  });
  $('#btn-copy').addEventListener('click', async () => {
    try { await navigator.clipboard.writeText(shoppingText()); toast('Nákupní seznam zkopírován.'); track('copy'); }
    catch (err) { toast('Kopírování se nepodařilo.'); }
  });
  $('#btn-reset').addEventListener('click', () => {
    if (state.items.length && !confirm('Začít nový projekt? Současné zadání bude smazáno.')) return;
    state = fresh(); save(); go(1);
  });

  /* ---------- start ---------- */
  $('#app-name').textContent = C.BRAND.appName;
  $('#footer-pricelist').textContent = C.PRICE_LIST;
  $('#print-date').textContent = new Date().toLocaleDateString('cs-CZ');
  if (location.hash.startsWith('#p=')) {
    try {
      const shared = dec(location.hash.slice(3));
      if (shared && shared.project && Array.isArray(shared.items)) {
        state = { ...fresh(), project: { ...fresh().project, ...shared.project }, items: shared.items.filter((i) => C.TYPES[i.type]).map((i) => ({ ...migrate(i), id: uid() })), step: 3 };
        save();
      }
    } catch (e) { /* neplatný odkaz */ }
    history.replaceState(null, '', location.pathname + location.search);
  }
  $('#btn-contact').href = DEALERS.length ? '#dealers' : C.BRAND.contactUrl;
  /* ---------- instalace jako aplikace (PWA) ---------- */
  const standalone = window.matchMedia('(display-mode: standalone)').matches || window.navigator.standalone === true;
  const isIOS = /iphone|ipad|ipod/i.test(navigator.userAgent) || (navigator.platform === 'MacIntel' && navigator.maxTouchPoints > 1);
  const installBtn = $('#btn-install');
  let installEvent = null;
  if (!standalone && (location.protocol === 'https:' || location.hostname === 'localhost')) {
    window.addEventListener('beforeinstallprompt', (e) => { e.preventDefault(); installEvent = e; installBtn.hidden = false; });
    if (isIOS) installBtn.hidden = false;
  }
  installBtn.addEventListener('click', async () => {
    track('install_click', { ios: isIOS });
    if (installEvent) {
      installEvent.prompt();
      const choice = await installEvent.userChoice.catch(() => null);
      if (choice && choice.outcome === 'accepted') { installBtn.hidden = true; toast('Plánovač je nainstalovaný.'); }
      installEvent = null;
    } else {
      const d = $('#install-dialog');
      if (d.showModal) d.showModal(); else d.setAttribute('open', '');
    }
  });
  window.addEventListener('appinstalled', () => { installBtn.hidden = true; track('installed'); });

  if ('serviceWorker' in navigator && /^https?:/.test(location.protocol)) {
    window.addEventListener('load', () => navigator.serviceWorker.register('sw.js').catch(() => {}));
  }
  renderTypeGrid();
  go(state.step || 1, false);
})();
