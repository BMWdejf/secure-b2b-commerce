## Import produktů přes POST request

Máš dvě hlavní možnosti, jak hromadně importovat produkty do databáze pomocí POST requestu. Doporučuji **variantu A** (Edge Function), protože je bezpečnější a poskytuje validaci.

---

### Varianta A (doporučená): Vlastní Edge Function `import-products`

Vytvořím serverovou funkci, na kterou pošleš POST request s polem produktů. Funkce ověří API klíč, validuje data a vloží produkty do databáze pomocí service role (obejde RLS, ale jen pro autorizované volání).

**Endpoint:**
```
POST https://ybywzhzbvfkwcngscqwb.supabase.co/functions/v1/import-products
```

**Hlavičky:**
```
Content-Type: application/json
x-import-key: <tajný klíč, který si nastavíš v Lovable Cloud>
```

**Tělo (příklad):**
```json
{
  "products": [
    {
      "name": "Vzor 2076 Ranforce",
      "slug": "vzor-2076-ranforce",
      "sku": "RAN-2076",
      "category_slug": "ranforce",
      "short_description": "Bavlněná tkanina ranforce",
      "description": "Detailní popis…",
      "unit": "m",
      "moq": 30,
      "pack_size": 30,
      "pack_label": "Karton",
      "availability": "in_stock",
      "weight_kg": 0.18,
      "main_image_url": "https://…/image.jpg",
      "is_active": true,
      "images": [
        { "url": "https://…/1.jpg", "is_primary": true, "sort_order": 0 }
      ],
      "prices": [
        { "pricelist_name": "Standard", "min_qty": 1, "unit_price": 129 },
        { "pricelist_name": "Standard", "min_qty: 100, "unit_price": 119 }
      ]
    }
  ]
}
```

**Co funkce udělá:**
- Ověří `x-import-key` proti tajnému klíči (Lovable Cloud secret `IMPORT_API_KEY`).
- Pro každý produkt:
  - Najde `category_id` podle `category_slug` (volitelné).
  - Vloží/aktualizuje produkt podle `slug` (upsert).
  - Vloží volitelné obrázky do `product_images`.
  - Vloží volitelné ceny do `pricelist_items` (ceník dohledá podle `pricelist_name`).
- Vrátí JSON se souhrnem: počet vložených, aktualizovaných, chybných položek + chyby.

**Výhody:**
- Tajný klíč chrání endpoint.
- Vstupy se validují.
- Atomické zpracování po dávkách.
- Funguje z jakéhokoli skriptu (curl, Postman, Python, n8n…).

---

### Varianta B: Přímé volání Supabase REST API (PostgREST)

Bez vytváření vlastní funkce můžeš volat:
```
POST https://ybywzhzbvfkwcngscqwb.supabase.co/rest/v1/products
apikey: <service_role_key>
Authorization: Bearer <service_role_key>
Content-Type: application/json
Prefer: resolution=merge-duplicates
```

**Tělo:** přímo pole řádků odpovídající sloupcům tabulky `products`.

**Nevýhody:**
- Musíš mít po ruce **service role key** (nesmí jít do prohlížeče ani do veřejného repa).
- Žádná validace ani normalizace (kategorie podle slugu, ceny, obrázky musíš řešit zvlášť dalšími voláními).
- RLS by jinak insert blokovalo (anon klíč nevloží), takže service role je nutný.

---

### Co potřebuji od tebe rozhodnout

1. Zvolit variantu (doporučuji **A**).
2. Pokud A: schválit přidání tajného klíče `IMPORT_API_KEY` do Lovable Cloud (vyžádám si ho přes secret prompt).
3. Potvrdit strukturu vstupního JSON (zda chceš zahrnout i `images` a `prices`, nebo jen základní pole produktu).

Po schválení tohoto plánu funkci vytvořím a pošlu ti ukázku `curl` volání pro otestování.
