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
`js/catalog.js` obsahuje λD a obsahy balení podle oficiálních produktových stránek knauf.com a listingů DEK (stav 11/2026). U každého produktu je uveden zdroj (`source`).

| Produkt | λD | Tloušťky (mm) | Ověřeno pro CZ |
|---|---|---|---|
| Unifit 032 | 0,032 | 60–200 | ano |
| Unifit 035 | 0,035 | 50–240 | ano |
| NatuRoll Pro | 0,039 | 50–200 | ano |
| FKD-S Thermal (1200 × 400) | 0,035 | 50–200 | ano |
| Akustik Board (1250 × 625) | 0,037 | 50, 60, 100 | ano |
| NaturBoard VENTI | 0,035 | 50, 100 | **ne** – jen mezinárodní technický list |
| Homeseal LDS 100 / Soliplan / Solimur | – | role 100 m² / 40 m / 8–12 m | ano |

Produkty s `verified: false` dostanou ve výsledku upozornění, ať zákazník dostupnost ověří u prodejce. Data pravidelně porovnávejte s aktuálními technickými listy. Na trhu se objevují i jiné formáty balení, například FKD-S Thermal ve formátu 1000 × 600 mm u některých prodejců.

V `BRAND.contactUrl` nastavte odkaz pro tlačítko „Poptat u prodejce“.

## Struktura
- `js/catalog.js` – produkty, normové hodnoty a typy konstrukcí (jediné místo pro správu dat)
- `js/calc.js` – výpočetní jádro (čisté funkce)
- `js/app.js` – uživatelské rozhraní
- `tests/calc.test.js` – testy (`node tests/calc.test.js`)
