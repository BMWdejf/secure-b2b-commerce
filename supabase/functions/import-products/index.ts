import { createClient } from "npm:@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type, x-import-key",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
};

interface ImportImage {
  url: string;
  alt?: string | null;
  sort_order?: number;
  is_primary?: boolean;
}

interface ImportPrice {
  pricelist_name?: string;
  pricelist_id?: string;
  min_qty?: number;
  unit_price: number;
}

interface ImportProduct {
  name: string;
  slug: string;
  sku?: string | null;
  category_slug?: string | null;
  category_id?: string | null;
  short_description?: string | null;
  description?: string | null;
  unit?: string;
  moq?: number;
  pack_size?: number;
  pack_label?: string;
  availability?: "in_stock" | "on_request";
  weight_kg?: number | null;
  main_image_url?: string | null;
  is_active?: boolean;
  images?: ImportImage[];
  prices?: ImportPrice[];
}

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }

  if (req.method !== "POST") {
    return new Response(JSON.stringify({ error: "Method not allowed" }), {
      status: 405,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }

  const importKey = Deno.env.get("IMPORT_API_KEY");
  const provided = req.headers.get("x-import-key");
  if (!importKey || provided !== importKey) {
    return new Response(JSON.stringify({ error: "Unauthorized" }), {
      status: 401,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }

  let body: { products?: ImportProduct[] };
  try {
    body = await req.json();
  } catch {
    return new Response(JSON.stringify({ error: "Invalid JSON" }), {
      status: 400,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }

  const products = body?.products;
  if (!Array.isArray(products) || products.length === 0) {
    return new Response(JSON.stringify({ error: "Field 'products' must be a non-empty array" }), {
      status: 400,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }

  const supabase = createClient(
    Deno.env.get("SUPABASE_URL")!,
    Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!,
  );

  // Pre-load lookup maps
  const { data: categories } = await supabase.from("categories").select("id, slug");
  const catMap = new Map((categories ?? []).map((c) => [c.slug, c.id]));

  const { data: pricelists } = await supabase.from("pricelists").select("id, name");
  const plMap = new Map((pricelists ?? []).map((p) => [p.name, p.id]));

  const results: Array<{ slug: string; status: string; error?: string; id?: string }> = [];
  let inserted = 0;
  let updated = 0;
  let failed = 0;

  for (const p of products) {
    try {
      if (!p.name || !p.slug) {
        throw new Error("Missing required field: name or slug");
      }

      let category_id: string | null = p.category_id ?? null;
      if (!category_id && p.category_slug) {
        category_id = catMap.get(p.category_slug) ?? null;
        if (!category_id) {
          throw new Error(`Unknown category_slug: ${p.category_slug}`);
        }
      }

      const payload = {
        name: p.name,
        slug: p.slug,
        sku: p.sku ?? null,
        category_id,
        short_description: p.short_description ?? null,
        description: p.description ?? null,
        unit: p.unit ?? "ks",
        moq: p.moq ?? 1,
        pack_size: p.pack_size ?? 1,
        pack_label: p.pack_label ?? "Karton",
        availability: p.availability ?? "in_stock",
        weight_kg: p.weight_kg ?? null,
        main_image_url: p.main_image_url ?? null,
        is_active: p.is_active ?? true,
      };

      // Upsert by slug
      const { data: existing } = await supabase
        .from("products")
        .select("id")
        .eq("slug", p.slug)
        .maybeSingle();

      let productId: string;
      let status: string;
      if (existing?.id) {
        const { error } = await supabase.from("products").update(payload).eq("id", existing.id);
        if (error) throw error;
        productId = existing.id;
        status = "updated";
        updated++;
      } else {
        const { data: ins, error } = await supabase
          .from("products")
          .insert(payload)
          .select("id")
          .single();
        if (error) throw error;
        productId = ins.id;
        status = "inserted";
        inserted++;
      }

      // Images (replace strategy if provided)
      if (Array.isArray(p.images) && p.images.length > 0) {
        await supabase.from("product_images").delete().eq("product_id", productId);
        const imgRows = p.images.map((img, i) => ({
          product_id: productId,
          url: img.url,
          alt: img.alt ?? null,
          sort_order: img.sort_order ?? i,
          is_primary: img.is_primary ?? i === 0,
        }));
        const { error: imgErr } = await supabase.from("product_images").insert(imgRows);
        if (imgErr) throw imgErr;
      }

      // Prices (replace strategy per pricelist used)
      if (Array.isArray(p.prices) && p.prices.length > 0) {
        const priceRows: Array<{
          pricelist_id: string;
          product_id: string;
          min_qty: number;
          unit_price: number;
        }> = [];
        const usedPricelists = new Set<string>();
        for (const pr of p.prices) {
          let plId = pr.pricelist_id ?? null;
          if (!plId && pr.pricelist_name) {
            plId = plMap.get(pr.pricelist_name) ?? null;
          }
          if (!plId) throw new Error(`Unknown pricelist: ${pr.pricelist_name ?? pr.pricelist_id}`);
          usedPricelists.add(plId);
          priceRows.push({
            pricelist_id: plId,
            product_id: productId,
            min_qty: pr.min_qty ?? 1,
            unit_price: pr.unit_price,
          });
        }
        for (const plId of usedPricelists) {
          await supabase
            .from("pricelist_items")
            .delete()
            .eq("product_id", productId)
            .eq("pricelist_id", plId);
        }
        const { error: prErr } = await supabase.from("pricelist_items").insert(priceRows);
        if (prErr) throw prErr;
      }

      results.push({ slug: p.slug, status, id: productId });
    } catch (e) {
      failed++;
      results.push({
        slug: p.slug ?? "(no slug)",
        status: "failed",
        error: e instanceof Error ? e.message : String(e),
      });
    }
  }

  return new Response(
    JSON.stringify({
      summary: { total: products.length, inserted, updated, failed },
      results,
    }),
    {
      status: failed === products.length ? 400 : 200,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    },
  );
});
