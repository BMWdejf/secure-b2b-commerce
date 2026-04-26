# Oprava 3 chyb: košík, reset hesla, hláška o ceně

## 1. Košík nepřidává položky

**Příčina:** Tabulka `cart_items` nemá v databázi cizí klíč na `products.id`. Proto dotaz v `fetchCart` se vstavěným joinem `product:products(...)` selže s chybou PGRST200 (vidíme ji v konzoli – „Could not find a relationship between 'cart_items' and 'products'"). Položka se sice vloží do DB, ale `refresh()` vrátí prázdné pole, takže košík vypadá prázdný a ProductDetail se nikdy správně neobnoví.

**Oprava:** Migrace, která přidá cizí klíče (s `ON DELETE CASCADE`) do `cart_items`:
- `cart_items.product_id → products.id`
- `cart_items.user_id → auth.users.id`

Po přidání FK PostgREST embed `product:products(...)` začne fungovat a `fetchCart` vrátí řádky včetně dat o produktu.

## 2. Reset hesla – tlačítko zůstává neaktivní

**Příčina:** Supabase klient má zapnuté `detectSessionInUrl`, takže při příchodu na `/reset-password?code=…` automaticky kód spotřebuje a vyšle event `PASSWORD_RECOVERY`. Náš kód ale paralelně volá `exchangeCodeForSession(code)` ručně – druhé volání selže (kód už byl spotřebován) a my chybně označíme stav jako „neplatný odkaz" nebo nikdy nenastavíme `hasSession = true`.

**Oprava `src/pages/ResetPassword.tsx`:**
- Posluchat `onAuthStateChange` a reagovat na event `PASSWORD_RECOVERY` i `SIGNED_IN` → nastavit `hasSession = true`.
- Spouštět ruční `exchangeCodeForSession` / `verifyOtp` / `setSession` pouze pokud po krátkém čekání (cca 1.5 s) ještě není žádná session ani recovery event – tedy jako fallback pro starší linky.
- Po úspěšném `updateUser` odhlásit a přesměrovat na `/prihlaseni` (zůstává).

## 3. Hláška „Cena dle vašeho ceníku … fáze 4"

**Příčina:** Komponenta `PriceGate` pro schváleného přihlášeného klienta vrací statický placeholder s textem o nedokončené fázi 4. Reálná cena z `pricelist_items` se nikdy nenačte.

**Oprava:**
- `src/components/catalog/PriceGate.tsx` rozšířit o prop `productId`. Pro schváleného uživatele načte z `pricelist_items` cenové úrovně přes `fetchPricesForProducts` a zobrazí cenu pomocí `resolveUnitPrice` (případně tabulku množstevních slev). Pokud cena pro produkt neexistuje, zobrazí informaci „Cena na vyžádání – kontaktujte nás".
- `ProductDetail.tsx` předá `productId={product.id}` do `<PriceGate />`.
- Pro nepřihlášené / neschválené uživatele se chování nemění.

## Technické detaily

**Migrace (cart_items FK):**
```sql
ALTER TABLE public.cart_items
  ADD CONSTRAINT cart_items_product_id_fkey
  FOREIGN KEY (product_id) REFERENCES public.products(id) ON DELETE CASCADE,
  ADD CONSTRAINT cart_items_user_id_fkey
  FOREIGN KEY (user_id) REFERENCES auth.users(id) ON DELETE CASCADE;
NOTIFY pgrst, 'reload schema';
```

**ResetPassword.tsx (klíčová logika):**
```ts
useEffect(() => {
  const { data: sub } = supabase.auth.onAuthStateChange((event, session) => {
    if (event === "PASSWORD_RECOVERY" || (session && event === "SIGNED_IN")) {
      setHasSession(true);
    }
  });
  // fallback po 1500 ms zkusit ruční exchange / verifyOtp / setSession,
  // pokud ani potom není session, nastavit hasSession=false
  ...
}, []);
```

**PriceGate.tsx (pro schváleného klienta):**
```ts
const { data } = useQuery({
  queryKey: ["price", productId],
  queryFn: () => fetchPricesForProducts([productId!]),
  enabled: !!productId && isApproved,
});
const tiers = data?.[productId!];
// zobraz tiers nebo „Cena na vyžádání"
```

## Co se NEmění
- Schéma `products`, `site_settings`, ostatní tabulky – beze změny.
- Admin panel, kontaktní formulář, CMS – beze změny.
- Logika přidávání do košíku v `addToCart` – funguje, jen jí chybí FK pro vrácení joinu.
