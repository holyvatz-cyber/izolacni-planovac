# Plánovač zateplení

Webová aplikace pro koncové zákazníky. Zákazník zadá konstrukce a rozměry a dostane doporučený produkt, jeho tloušťku, ověření hodnoty U a přesný nákupní seznam v baleních.

## Spuštění
Stačí otevřít `index.html` v prohlížeči. Aplikace nemá build krok ani závislosti a dá se nasadit na libovolný statický hosting (třeba GitHub Pages).

## Co umí
- **10 typů konstrukcí:** šikmá střecha mezi a pod krokvemi, šikmá střecha nad krokvemi (přiznaný krov nebo rekonstrukce shora), strop pod půdou (pochozí i nepochozí), strop nad sklepem nebo garáží (Tektalan A2-SmartTec, Heratekta), kontaktní fasáda ETICS, provětrávaná fasáda, stěna dřevostavby, plochá střecha, plovoucí podlaha (kročejová izolace) a akustická příčka.
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
| Plochá střecha (spodní + horní vrstva) | SmartRoof Base + Norm/Top | SmartRoof Thermal + Norm/Top | SmartRoof Base + Norm/Top |
| Plovoucí podlaha | TPT 03 (lité), PTS (suché) | PTN / PTE / PTS dle zatížení | PTN / PTE / PTS dle zatížení |
| Vzduchotěsnost | Homeseal LDS 100, LDS Solifit, LDS Solimur | | |

U plochých střech je horní vrstva tužší deska (Norm u nepochozí, Top u občasně pochozí střechy) o tloušťce zhruba třetiny skladby, nejméně 60 mm. U podlah plánovač odhaduje kročejový hluk L'n,w podle tabulek z brožury Knauf Insulation Podlahy (07/2019).

Pokud první produkt v řadě cíl nesplní (např. kvůli výšce krokví), plánovač automaticky zkusí další, výkonnější produkt.

Ceny v aplikaci jsou orientační podle ceníku. Zákazník vidí cenu bez DPH i s DPH 21 % a upozornění, že skutečné ceny u prodejců se liší.

V `BRAND.contactUrl` nastavte odkaz pro tlačítko „Poptat u prodejce“.

## Vizuální identita
- **Logo a claim:** `assets/knauf-insulation-logo.png` a „Build on us.“ (`assets/build-on-us.png`) v úvodu, v patičce a v tiskové hlavičce.
- **Písma:** firemní písma Knauf Screen, Knauf Screen Head a Knauf Screen Narrow (`assets/fonts`, WOFF2). Jsou chráněná autorským právem Knauf, takže repozitář ani web s nimi nezveřejňujte mimo rámec licence Knauf.
- **Barvy:** oficiální paleta KNAUF Final Colors. Hlavní barvy jsou Cyan `#0099DE` a Accessible Blue `#003778` (text a tlačítka, kvůli kontrastu). Sekundární barvy (zelená, oranžová) slouží jen jako akcent, převažuje bílá.

## UX funkce
- **Úvodní stránka:** krátce vysvětlí, co plánovač umí.
- **Živý souhrn v kroku 2:** počet konstrukcí, plocha a orientační cena se přepočítávají při každé změně.
- **Kontrola zadání:** u neobvyklých hodnot (např. krokev 1600 mm) se zobrazí upozornění.
- **Porovnání variant:** nejtenčí, vyvážená a nejlevnější varianta s cenou, přepínání jedním klepnutím.
- **Odhad roční úspory:** u fasád a stropů pod půdou, podle ceny tepla nastavitelné v pokročilém nastavení.
- **Sdílení:** projekt jde poslat odkazem (data jsou zakódovaná v adrese, nic se neukládá na server), vytisknout do PDF s logem nebo zkopírovat jako text.

## Dotace, prodejci, měření a offline režim
- **Dotace NZÚ:** `SUBSIDY` v `js/catalog.js` obsahuje orientační sazby NZÚ Light a NZÚ 2026+ (stav 06/2026). Výzvy se mění, proto sazby a technické podmínky před nasazením a pak pravidelně ověřujte na novazelenausporam.cz.
- **Prodejci:** sekce „Kde koupit“ se zobrazí, jakmile do `js/dealers.js` doplníte seznam prodejců (formát je popsaný v souboru). Do té doby tlačítko vede na `BRAND.contactUrl`.
- **Měření návštěvnosti:** události se zapisují do `window.dataLayer`. Měřicí skript Google Tag Manageru se načte až po vyplnění `BRAND.gtmId` a po souhlasu návštěvníka. Seznam událostí je v `js/analytics.js`.
- **Instalace jako aplikace (PWA):** v hlavičce je tlačítko **Nainstalovat**. V Chrome a Edge (Android, Windows, macOS) otevře systémovou instalaci, na iPhonu a iPadu ukáže návod „Sdílet → Přidat na plochu“. Nainstalovaná aplikace funguje i offline. Instalace vyžaduje web přes HTTPS (např. GitHub Pages). Po každé změně souborů zvyšte `VERSION` v `sw.js`.
- **Heraklith a Tektalan** nejsou ve stavebním ceníku, proto se u nich ukazuje „cena na dotaz“ a do součtu se nezapočítávají. Ceny můžete doplnit v `js/catalog.js`.

## Struktura
- `js/catalog.js` – produkty, normové hodnoty a typy konstrukcí (jediné místo pro správu dat)
- `js/calc.js` – výpočetní jádro (čisté funkce)
- `js/app.js` – uživatelské rozhraní
- `css/app.css`, `css/fonts.css` – vzhled podle vizuálu Knauf
- `tests/calc.test.js` – testy (`node tests/calc.test.js`)
