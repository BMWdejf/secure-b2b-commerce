## Plán prací

Plán řeší opravy + velký rozsah CMS funkcí. Doporučuji rozdělit na 2 fáze (níže), abychom dodali kvalitně a postupně.

---

### FÁZE A — Opravy (rychlé, dělám hned po schválení)

**1. Košík se neplní (`/produkt/...` → `/ucet/kosik` zůstává prázdný)**

Příčina: `add()` v `CartContext` přidá položku, ale `qty` v detailu produktu defaultuje na `1`, zatímco MOQ produktu je 30 → pravděpodobně backend vloží `qty=1` (RLS to povolí) ale problém je jinde — `useEffect` v `CartProvider` se spouští dříve než je `user` k dispozici, a `refresh()` se po `add()` volá, ale `fetchCart` filtruje `r.product` (musí existovat join). Ověřím dotazem přímo do DB, zda se řádky vkládají, a opravím zdroj. Zároveň:
- v `ProductDetail.tsx` inicializuji `qty` na `product.moq` (ne `1`),
- po `add()` zavolám `refresh()` (už je tam) a navíc invaliduji cache,
- zajistím, že `qty` posílaná do `addToCart` není menší než `MOQ`.

**2. `/reset-password` — tlačítko neukládá heslo**

Aktuální tok je překomplikovaný. Zjednodušíme:
- `ForgotPassword` pošle `redirectTo: /auth/callback?next=/reset-password` (Supabase generuje PKCE `code` link).
- `AuthCallback` zavolá `supabase.auth.exchangeCodeForSession(code)` — to je oficiální způsob — a teprve po úspěchu naviguje na `/reset-password`.
- `ResetPassword` pouze zkontroluje aktivní session a zavolá `supabase.auth.updateUser({ password })`. Žádné polling, žádné `sessionStorage` flagy.
- Tlačítko aktivní hned, jakmile jsou hesla validní + shodují se + je session.

**3. Detail produktu — množství defaultuje na 1**

Inicializuji `useState(product.moq)` (resp. po načtení produktu).

---

### FÁZE B — Nové funkce (CMS, vzhled, stránky, kontakt)

**Databázové změny (migrace):**

1. `products` — přidat:
   - `availability` enum `'in_stock' | 'on_request'` (default `'in_stock'`)
   - `pack_label` text (default `'Karton'`) — editovatelný název balení
   - odebrat zobrazení `moq` z UI (sloupec necháme v DB pro budoucí použití)

2. `site_settings` (singleton, 1 řádek) — KV pro vzhled:
   - `logo_url`, `footer_text`, `company_ico`, `company_dic`
   - `hero_title`, `hero_subtitle`, `hero_cta_text`, `hero_badge`
   - `hero_stats` jsonb (4 položky label/value)
   - `cta_title`, `cta_text`
   - `features` jsonb (pole 6 karet)
   - admin: `UPDATE` pro admin role; veřejně: `SELECT`

3. `pages` (CMS stránky) — `id`, `slug` (unique), `title`, `content_html`, `is_published`, `updated_at`
   - veřejné `SELECT` jen `is_published=true`, admin `ALL`
   - seed: `o-nas`, `kontakt`

4. `contact_addresses` (fakturační/dodací do patičky a kontaktů) — `id`, `kind` (`billing`/`shipping`), `company_name`, `street`, `city`, `postal_code`, `country`, `ico`, `dic`, `phone`, `email`
   - admin `ALL`, veřejné `SELECT`

5. `contact_messages` — zprávy z kontaktního formuláře:
   - `id`, `name`, `email`, `phone`, `message`, `user_id` (nullable), `is_read`, `created_at`
   - veřejně `INSERT` (s rate limitem v kódu), admin `SELECT/UPDATE/DELETE`

6. Storage bucket `branding` (public) — pro logo.

**Admin → Nastavení (`/admin/nastaveni`):**

Vytvořím novou stránku s taby:
- **Vzhled**
  - upload loga (do `branding` bucketu) → uloží `logo_url` do `site_settings`
  - editace `footer_text`, IČO, DIČ
  - editace celé hlavní stránky: hero (title/subtitle/CTA/badge), 4 statistiky, 6 feature karet, CTA sekce
- **Produkty** (vzhled)
  - výchozí `pack_label` ("Karton"/"Balení"/"Role"…)
  - správa statusů dostupnosti (zatím pevné 2: Skladem / Na dotaz — možno přejmenovat texty zobrazované na webu)
- **Stránky**
  - seznam stránek + tlačítko "Nová stránka"
  - editor: slug, název, WYSIWYG obsah (TipTap), publikováno ano/ne
- **Kontakty/Adresy**
  - fakturační a dodací adresa firmy → propsáno do `/kontakt`
- **Zprávy a dotazy**
  - inbox z `contact_messages`, označit přečtené, smazat

**Admin → Produkty (form):**
- pole `availability` (select: Skladem / Na dotaz)
- pole `pack_label` (text, default z `site_settings`)
- odstranit `MOQ` z UI (skrýt, needitovat)

**Veřejný web:**

- `ProductDetail.tsx`:
  - karta specifikací: `Jednotka`, `Dostupnost` (badge zelená/oranžová), `<pack_label>` (např. "Karton 30 m"), `Hmotnost`
  - **odstranit** MOQ
  - `qty` default = `pack_size`, krok = `pack_size`
- `ProductCard.tsx`: zobrazit badge dostupnosti, použít `pack_label` místo "Karton"
- `Index.tsx`: číst hero/features/CTA z `site_settings`
- `PublicHeader.tsx`: pokud je `logo_url` nastaveno, zobrazit ho místo "N"
- `PublicFooter.tsx`: logo z settings, `footer_text`, IČO/DIČ z settings
- `/kontakt`: nová stránka místo Placeholder
  - zobrazí fakturační + dodací adresu
  - kontaktní formulář (zod validace): `name*`, `email*` (auto-fill z profilu když přihlášen), `phone`, `message*`, tlačítko Odeslat
  - uloží do `contact_messages`
- `/o-nas` + jakékoliv další stránky: dynamicky z `pages` tabulky (route `/:slug` jako fallback)

**WYSIWYG editor:** TipTap (`@tiptap/react`, `@tiptap/starter-kit`) — moderní, lehký, dobře integrovatelný.

---

### Technické poznámky

- Všechny nové tabulky budou mít RLS (admin ALL, veřejné SELECT kde dává smysl).
- `site_settings` vytvořím s jedním řádkem (`id` fixní UUID) a všude budu `upsert`.
- `pack_label` se vyplní z aktuální hodnoty produktu, fallback na výchozí ze `site_settings`.
- Kontaktní formulář: validace zod, `INSERT` přes anon key (RLS povolí pouze insert, žádné read).
- Logo upload: max 2 MB, `image/*`, do `branding/logo.{ext}`.

---

### Pořadí dodání

Nejdřív FÁZI A (3 opravy + 1 migrace pro `availability` + `pack_label`), pak FÁZI B (CMS, settings, stránky, kontakt, zprávy). Pokud chcete vše naráz, udělám to v jedné dávce — bude to ale větší změna.

**Otázka před spuštěním:** Mám pokračovat **vším naráz (A+B)**, nebo nejprve dodat **FÁZI A** a teprve po vašem otestování spustit **FÁZI B**?
