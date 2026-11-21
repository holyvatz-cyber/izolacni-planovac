# Plánovač zateplení

Webová aplikace pro koncové zákazníky. Zákazník zadá konstrukce a rozměry a dostane doporučený produkt, jeho tloušťku, ověření hodnoty U a přesný nákupní seznam v baleních.

## Spuštění
Stačí otevřít `index.html` v prohlížeči. Aplikace nemá build krok ani závislosti a dá se nasadit na libovolný statický hosting (třeba GitHub Pages).

## Co umí
- **6 typů konstrukcí:** šikmá střecha (mezi a pod krokve), strop pod půdou (pochozí i nepochozí), kontaktní fasáda ETICS, provětrávaná fasáda, stěna dřevostavby a akustická příčka.
- **3 úrovně cíle** podle ČSN 73 0540-2: požadovaná, doporučená a pasivní.
- **3 priority:** nejtenčí vrstva, vyvážené řešení, nejnižší cena.
- **Výpočet U** podle principu ČSN EN ISO 6946, u dřevěných prvků (krokve, sloupky) jako průměr horní a dolní meze.
- **Výběr tloušťky:** dutinu vyplní kombinací nejvýše dvou dostupných tlouštěk. Když to nestačí, přidá doplňkovou vrstvu, ale jen do limitu, který zákazník zadá. Pokud ani pak cíl nesplní, aplikace na to upozorní.
- **Nákupní seznam:** izolace a parotěsné příslušenství, s prořezem a zaokrouhlením na celá balení. Jde zkopírovat nebo vytisknout do PDF.
- **Ukládání:** projekt se ukládá v prohlížeči. Aplikace funguje i na mobilu a podporuje tmavý režim.

## Produktová data
Data v `js/catalog.js` pocházejí z **Ceníku stavebních izolací Knauf Insulation ver. 07/2026** (platnost od 1. 5. 2026) a z technických listů výrobce. U každého produktu katalog uvádí λD, dostupné tloušťky, m² v balení a cenu v Kč/m² bez DPH. Při vydání nového ceníku stačí přepsat tabulky `v: { tloušťka: [m²/balení, Kč/m²] }`.

| Použití | Nejtenčí vrstva | Vyvážené | Nejnižší cena |
|---|---|---|---|
| Šikmá střecha (mezi a pod krokve) | Unifit 032 | Unifit 035 | Unifit 037 |
| Strop pod půdou | Unifit 033 | NatuRoll Pro | NatuRoll Plus |
| Dřevostavba | Unifit 032 | Mineral Plus HB 034 | Unifit 037 |
| Kontaktní fasáda | FKD N Thermal | FKD S Thermal | FKD N Thermal |
| Provětrávaná fasáda | VENTI PRO | Mineral Plus KP 034 | MPN Plus 037 |
| Příčky | Akustik Board | Akustik Board | Akustik Roll |
| Vzduchotěsnost | Homeseal LDS 100, LDS Solifit, LDS Solimur | | |

Pokud první produkt v řadě cíl nesplní (např. kvůli výšce krokví), plánovač automaticky zkusí další, výkonnější produkt.

Ceny v aplikaci jsou orientační podle ceníku. Zákazník vidí cenu bez DPH i s DPH 21 % a upozornění, že skutečné ceny u prodejců se liší.

V `BRAND.contactUrl` nastavte odkaz pro tlačítko „Poptat u prodejce“.

## Struktura
- `js/catalog.js` – produkty, normové hodnoty a typy konstrukcí (jediné místo pro správu dat)
- `js/calc.js` – výpočetní jádro (čisté funkce)
- `js/app.js` – uživatelské rozhraní
- `tests/calc.test.js` – testy (`node tests/calc.test.js`)
