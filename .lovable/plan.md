
## Cíl

Přepracovat hlavní stránku (`src/pages/Index.tsx`) do teplého, editoriálního vzhledu inspirovaného takoy.cz — krémové pozadí, serifový display nadpis, tlumené pastelové akcenty, důraz na fotky produktů/kategorií a klidnou typografickou kompozici. Ostatní stránky (katalog, admin, footer) nechám beze změny — jen rozšířím design tokeny tak, aby se daly kdykoli převzít i jinde.

## Vizuální směr (moje volba za tebe)

- **Paleta** — krémové pozadí `#f8f2e2`, tmavý inkoust `#1c1a15` pro text, tlumená růžová `#c47a86` jako primární akcent, cihlově-terakotová `#b5533a` jako sekundární akcent, měkký olivově-zelený tón `#8a9a6b` pro doplňkové bloky.
- **Typografie** — nadpisy `Cormorant Garamond` (elegantní serif), tělo `Inter` (zůstává). Velké, prostorné nadpisy s výrazným tracking / italic akcentem u jednoho slova.
- **Layout** — asymetrický hero (velký serif nadpis vlevo, produktová fotografie vpravo s malým "štítkem" ceny/kategorie), pod ním editoriální mřížka kategorií s velkými fotkami a serifovými popisky, pás s "proč u nás" ve stylu tenkých linek a čísel (01 / 02 / 03), CTA banner v terakotové barvě.
- **Detaily** — jemné oddělovací linky místo shadowů, hover = jemný posun + změna barvy podtržítka, obrázky s mírně zaoblenými rohy (2px), žádné gradienty, žádné glow efekty.

## Rozsah změn

1. **Rozšířit design tokeny** v `src/index.css` — přidat sadu warm tokenů (`--cream`, `--ink`, `--rose`, `--terracotta`, `--olive`) jako HSL a semantické aliasy, aby šly použít přes Tailwind třídy.
2. **Tailwind config** — zaregistrovat nové barvy + přidat font family `serif: ['Cormorant Garamond', serif]`.
3. **Načíst font** v `index.html` (Google Fonts, jen potřebné váhy).
4. **Přepsat `src/pages/Index.tsx`** — nový hero, nová mřížka kategorií (s fotkami z `categories.image_url` pokud existuje, jinak placeholder), sekce "proč u nás" s číslovanými bloky (mapuje na `settings.features`), nový CTA. Zachovám všechna stávající data z `useSiteSettings` a `fetchCategories` — jen jinak vykreslím.
5. **Bez zásahu do**: header, footer, katalog, admin, business logika, DB.

## Technické poznámky

- Nezasahuji do `PublicHeader`/`PublicFooter` — barvy tokenů jsou zpětně kompatibilní (staré `--primary` apod. zůstávají).
- Vše přes semantické tokeny, žádné hardcoded barvy v komponentě.
- Fallbacky pro chybějící pole (features prázdné, žádné kategorie) zůstávají.
- Bez nových závislostí.

## Co plánu chybí (můžeš doplnit před schválením)

- Reálné screenshoty z takoy.cz (nedokážu je stáhnout — web blokuje) — pokud mi pošleš 1–2 obrázky, doladím paletu a proporce přesněji.
- Zda chceš stejný styl přenést i do headeru/footeru a katalogu (teď ne).

Pokud plán schválíš, provedu úpravy v jedné dávce.
