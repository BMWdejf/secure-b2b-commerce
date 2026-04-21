

# B2B E-commerce platforma — finální plán (MVP v Lovable)

Postavíme moderní responzivní B2B e-shop s Lovable stackem. Backend (DB + Auth) na **Lovable Cloud (Supabase)** — díky tomu bude možné později frontend přepsat do Next.js a používat **stejnou Supabase databázi a auth**, bez migrace dat.

## Role

- **Host** — vidí katalog a popisy. Místo ceny/skladu výzva „Pro zobrazení cen se přihlaste".
- **Klient (B2B)** — po **schválení adminem** vidí ceny dle svého ceníku, sklad, objednává.
- **Admin** — plná správa katalogu, klientů, ceníků, objednávek, faktur, statistik.

## Veřejná část

- Homepage (hero, výhody B2B, kategorie, CTA registrace).
- Katalog: kategorie/podkategorie, filtry, vyhledávání, řazení, stránkování.
- Detail produktu: galerie, popis, parametry, varianty, MOQ, ks/karton — bez ceny pro hosta.
- Registrace B2B (IČO, DIČ, firma, kontakt, adresa) → stav „Čeká na schválení".
- Login, zapomenuté heslo, vlastní stránka `/reset-password`.

## Klientská zóna

- Dashboard (poslední objednávky, rychlé akce).
- Košík + checkout (bez platby — vytvoří objednávku k fakturaci, e-mail potvrzení).
- Moje objednávky (stavy, detail, „Objednat znovu").
- Faktury (PDF nahrané adminem, stav, splatnost).
- Adresy a fakturační údaje (více dodacích adres).
- Profil + změna hesla.

Klient ve stavu *pending* vidí pouze oznámení o čekání na schválení.

## Admin dashboard `/admin`

- **Přehled** — KPI dlaždice, grafy tržeb, top produkty/klienti, fronta čekajících registrací.
- **Produkty** — CRUD, varianty, atributy, obrázky (Storage), MOQ, ks/karton, sklad, aktivní/neaktivní.
- **Kategorie** — strom 2 úrovní, řazení.
- **Ceníky** — hlavní ceník + individuální ceníky pro klienty, množstevní slevy.
- **Klienti** — schválení/zamítnutí, detail, přiřazení ceníku, blokace, historie.
- **Objednávky** — filtry, změna stavu, interní poznámky, nahrání PDF faktury, export CSV.
- **Statistiky** — tržby (období/klient/kategorie), top produkty/klienti.
- **Nastavení** — firma, e-maily, prahy skladů.

## Design

Moderní, profesionální B2B vzhled: neutrální paleta + jedna akcentní barva, jasná typografie, dostatek prostoru, jemné stíny. Vše přes design-system tokeny v `index.css` (HSL) a tailwind tokens, žádné hardcoded barvy v komponentách. shadcn/ui (Card, Table, Tabs, Dialog, Form, Sidebar, Toast, Skeleton). Mobilní first — collapsible sidebary, filter drawer, grid/list toggle.

## Technický stack a budoucí Next.js

- **Frontend:** React 18 + Vite + TS + Tailwind + shadcn/ui + react-router-dom + TanStack Query + react-hook-form + zod.
- **Backend:** Lovable Cloud (Supabase) — Postgres + Auth + Storage + Edge Functions.
- **Migrace na Next.js později:** Supabase má první-tříd Next.js SDK (`@supabase/ssr`). Stačí vytvořit nový Next.js projekt a připojit ho ke **stejné Supabase instanci**. Přenášet se bude jen UI vrstva, ne data ani auth. Aby byla migrace hladká, držíme tyto pravidla:
  - Veškerá business logika v **Postgres funkcích / RLS / Edge Functions**, ne v UI.
  - Datové dotazy izolované v `src/lib/api/*` (jeden soubor na doménu) — v Next.js přepíšete jen tuhle vrstvu na server components.
  - Žádné Vite-specific API v komponentách (žádné `import.meta.glob` apod.).
  - Routy pojmenované česky a stabilně — stejnou strukturu pak nasadíš v `app/` Next.js routeru.

## Datový model (zjednodušeně)

`profiles` (link na auth.users, status pending|approved|blocked, company_id) · `user_roles` (separátní, role admin|client) · `companies` (IČO, DIČ, název, pricelist_id) · `addresses` · `categories` (parent_id) · `products` · `product_variants` · `product_images` · `inventory` · `pricelists` + `pricelist_items` (pásma) · `orders` + `order_items` (snímek ceny) · `invoices`.

## Bezpečnost (kritické)

- RLS zapnuté na všech tabulkách.
- Role v **samostatné `user_roles`** tabulce + `has_role()` security-definer funkce (žádná rekurze, žádný privilege escalation).
- Klient vidí jen data své `company_id`. Admin přes `has_role(auth.uid(),'admin')`.
- **Ceny a sklad:** RLS politiky vyžadují přihlášení + `status='approved'`. Host nedostane řádek z `pricelist_items` ani `inventory`.
- Vstupy validované přes **zod** (klient) + omezení v DB (server).
- Vlastní `/reset-password` stránka pro Supabase recovery link.

## Routing

```text
/                       Home
/katalog                Katalog
/produkt/:slug          Detail
/prihlaseni             Login
/registrace             Registrace B2B
/reset-password         Reset hesla
/ucet                   Klientský dashboard
  /ucet/objednavky
  /ucet/faktury
  /ucet/adresy
  /ucet/profil
/kosik, /pokladna       Košík + checkout
/admin                  Admin dashboard
  /admin/produkty
  /admin/kategorie
  /admin/ceniky
  /admin/klienti
  /admin/objednavky
  /admin/statistiky
  /admin/nastaveni
```

## Postup po fázích

Po každé fázi uvidíš funkční výsledek. Další fázi spustíš krátkou zprávou („pokračuj fází 2").

1. **Fáze 1 — Základ + Auth + Layout**
   Design system, veřejný layout (header/footer), home, registrace B2B se schvalováním, login, reset hesla, role + RLS, chráněné prázdné stránky `/ucet` a `/admin`.
2. **Fáze 2 — Veřejný katalog**
   Kategorie, produkty, detail, vyhledávání/filtry. Ceny/sklad skryté pro hosta.
3. **Fáze 3 — Admin: produkty, kategorie, klienti, ceníky**
   CRUD, obrázky, schvalování klientů, individuální ceníky.
4. **Fáze 4 — Klientská zóna + objednávky**
   Ceny dle ceníku, košík, checkout, moje objednávky, adresy, profil.
5. **Fáze 5 — Admin objednávky + faktury + statistiky**
   Správa objednávek, nahrávání PDF faktur, KPI a grafy.

Po schválení tohoto plánu spustíme **Fázi 1**.

