import { supabase } from "@/integrations/supabase/client";

// ===== KATEGORIE =====
export interface AdminCategory {
  id: string;
  parent_id: string | null;
  name: string;
  slug: string;
  description: string | null;
  sort_order: number;
  is_active: boolean;
}

export async function adminListCategories(): Promise<AdminCategory[]> {
  const { data, error } = await supabase
    .from("categories")
    .select("id, parent_id, name, slug, description, sort_order, is_active")
    .order("sort_order", { ascending: true });
  if (error) throw error;
  return data ?? [];
}

export async function adminUpsertCategory(c: Partial<AdminCategory> & { name: string; slug: string }) {
  const payload = {
    name: c.name,
    slug: c.slug,
    description: c.description ?? null,
    sort_order: c.sort_order ?? 0,
    is_active: c.is_active ?? true,
    parent_id: c.parent_id ?? null,
  };
  if (c.id) {
    const { error } = await supabase.from("categories").update(payload).eq("id", c.id);
    if (error) throw error;
  } else {
    const { error } = await supabase.from("categories").insert(payload);
    if (error) throw error;
  }
}

export async function adminDeleteCategory(id: string) {
  const { error } = await supabase.from("categories").delete().eq("id", id);
  if (error) throw error;
}

// ===== PRODUKTY =====
export interface AdminProduct {
  id: string;
  category_id: string | null;
  name: string;
  slug: string;
  sku: string | null;
  short_description: string | null;
  description: string | null;
  unit: string;
  moq: number;
  pack_size: number;
  pack_label: string;
  availability: "in_stock" | "on_request";
  weight_kg: number | null;
  main_image_url: string | null;
  is_active: boolean;
}

export async function adminListProducts(search?: string): Promise<AdminProduct[]> {
  let q = supabase
    .from("products")
    .select("id, category_id, name, slug, sku, short_description, description, unit, moq, pack_size, pack_label, availability, weight_kg, main_image_url, is_active")
    .order("created_at", { ascending: false })
    .limit(500);
  if (search?.trim()) {
    const s = `%${search.trim()}%`;
    q = q.or(`name.ilike.${s},sku.ilike.${s}`);
  }
  const { data, error } = await q;
  if (error) throw error;
  return data ?? [];
}

export async function adminGetProduct(id: string): Promise<AdminProduct | null> {
  const { data, error } = await supabase
    .from("products")
    .select("id, category_id, name, slug, sku, short_description, description, unit, moq, pack_size, pack_label, availability, weight_kg, main_image_url, is_active")
    .eq("id", id)
    .maybeSingle();
  if (error) throw error;
  return data;
}

export async function adminUpsertProduct(p: Partial<AdminProduct> & { name: string; slug: string }) {
  const payload = {
    category_id: p.category_id ?? null,
    name: p.name,
    slug: p.slug,
    sku: p.sku ?? null,
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
  if (p.id) {
    const { error } = await supabase.from("products").update(payload).eq("id", p.id);
    if (error) throw error;
    return p.id;
  } else {
    const { data, error } = await supabase.from("products").insert(payload).select("id").single();
    if (error) throw error;
    return data.id as string;
  }
}

export async function adminDeleteProduct(id: string) {
  const { error } = await supabase.from("products").delete().eq("id", id);
  if (error) throw error;
}

export async function uploadProductImage(file: File): Promise<string> {
  const ext = file.name.split(".").pop() || "jpg";
  const path = `${crypto.randomUUID()}.${ext}`;
  const { error } = await supabase.storage.from("product-images").upload(path, file, {
    cacheControl: "3600",
    upsert: false,
  });
  if (error) throw error;
  const { data } = supabase.storage.from("product-images").getPublicUrl(path);
  return data.publicUrl;
}

// ===== KLIENTI =====
export interface AdminClientRow {
  id: string;
  full_name: string;
  phone: string | null;
  status: "pending" | "approved" | "blocked";
  created_at: string;
  company: {
    id: string;
    name: string;
    ico: string | null;
    dic: string | null;
    email: string | null;
    pricelist_id: string | null;
  } | null;
}

export async function adminListClients(statusFilter?: "pending" | "approved" | "blocked"): Promise<AdminClientRow[]> {
  let q = supabase
    .from("profiles")
    .select("id, full_name, phone, status, created_at, company:companies(id, name, ico, dic, email, pricelist_id)")
    .order("created_at", { ascending: false });
  if (statusFilter) q = q.eq("status", statusFilter);
  const { data, error } = await q;
  if (error) throw error;
  return (data ?? []) as unknown as AdminClientRow[];
}

export async function adminSetClientStatus(profileId: string, status: "pending" | "approved" | "blocked") {
  const { error } = await supabase.from("profiles").update({ status }).eq("id", profileId);
  if (error) throw error;
}

export async function adminAssignPricelist(companyId: string, pricelistId: string | null) {
  const { error } = await supabase.from("companies").update({ pricelist_id: pricelistId }).eq("id", companyId);
  if (error) throw error;
}

// ===== CENÍKY =====
export interface Pricelist {
  id: string;
  name: string;
  currency: string;
  is_default: boolean;
  notes: string | null;
}

export interface PricelistItem {
  id: string;
  pricelist_id: string;
  product_id: string;
  min_qty: number;
  unit_price: number;
  product?: { name: string; sku: string | null; unit: string };
}

export async function adminListPricelists(): Promise<Pricelist[]> {
  const { data, error } = await supabase
    .from("pricelists")
    .select("id, name, currency, is_default, notes")
    .order("created_at", { ascending: true });
  if (error) throw error;
  return data ?? [];
}

export async function adminUpsertPricelist(p: Partial<Pricelist> & { name: string }) {
  const payload = {
    name: p.name,
    currency: p.currency ?? "CZK",
    is_default: p.is_default ?? false,
    notes: p.notes ?? null,
  };
  if (p.id) {
    const { error } = await supabase.from("pricelists").update(payload).eq("id", p.id);
    if (error) throw error;
    return p.id;
  }
  const { data, error } = await supabase.from("pricelists").insert(payload).select("id").single();
  if (error) throw error;
  return data.id as string;
}

export async function adminDeletePricelist(id: string) {
  const { error } = await supabase.from("pricelists").delete().eq("id", id);
  if (error) throw error;
}

export async function adminListPricelistItems(pricelistId: string): Promise<PricelistItem[]> {
  const { data, error } = await supabase
    .from("pricelist_items")
    .select("id, pricelist_id, product_id, min_qty, unit_price, product:products(name, sku, unit)")
    .eq("pricelist_id", pricelistId)
    .order("min_qty", { ascending: true });
  if (error) throw error;
  return (data ?? []) as unknown as PricelistItem[];
}

export async function adminUpsertPricelistItem(item: {
  id?: string;
  pricelist_id: string;
  product_id: string;
  min_qty: number;
  unit_price: number;
}) {
  if (item.id) {
    const { error } = await supabase
      .from("pricelist_items")
      .update({ min_qty: item.min_qty, unit_price: item.unit_price, product_id: item.product_id })
      .eq("id", item.id);
    if (error) throw error;
  } else {
    const { error } = await supabase.from("pricelist_items").insert({
      pricelist_id: item.pricelist_id,
      product_id: item.product_id,
      min_qty: item.min_qty,
      unit_price: item.unit_price,
    });
    if (error) throw error;
  }
}

export async function adminDeletePricelistItem(id: string) {
  const { error } = await supabase.from("pricelist_items").delete().eq("id", id);
  if (error) throw error;
}

// ===== STATY =====
export async function adminGetStats() {
  const [products, clients, pending, pricelists] = await Promise.all([
    supabase.from("products").select("*", { count: "exact", head: true }),
    supabase.from("profiles").select("*", { count: "exact", head: true }).eq("status", "approved"),
    supabase.from("profiles").select("*", { count: "exact", head: true }).eq("status", "pending"),
    supabase.from("pricelists").select("*", { count: "exact", head: true }),
  ]);
  return {
    products: products.count ?? 0,
    approvedClients: clients.count ?? 0,
    pendingClients: pending.count ?? 0,
    pricelists: pricelists.count ?? 0,
  };
}
