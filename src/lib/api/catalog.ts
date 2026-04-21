import { supabase } from "@/integrations/supabase/client";

export interface Category {
  id: string;
  parent_id: string | null;
  name: string;
  slug: string;
  description: string | null;
  sort_order: number;
}

export interface Product {
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
  weight_kg: number | null;
  main_image_url: string | null;
}

export interface ProductImage {
  id: string;
  url: string;
  alt: string | null;
  sort_order: number;
  is_primary: boolean;
}

export async function fetchCategories(): Promise<Category[]> {
  const { data, error } = await supabase
    .from("categories")
    .select("id, parent_id, name, slug, description, sort_order")
    .eq("is_active", true)
    .order("sort_order", { ascending: true });
  if (error) throw error;
  return data ?? [];
}

export interface ProductFilters {
  search?: string;
  categorySlug?: string;
  sort?: "newest" | "name_asc" | "name_desc";
}

export async function fetchProducts(filters: ProductFilters = {}): Promise<Product[]> {
  let query = supabase
    .from("products")
    .select("id, category_id, name, slug, sku, short_description, description, unit, moq, pack_size, weight_kg, main_image_url, categories!inner(slug, is_active)")
    .eq("is_active", true);

  if (filters.categorySlug) {
    query = query.eq("categories.slug", filters.categorySlug);
  }
  if (filters.search && filters.search.trim()) {
    const s = `%${filters.search.trim()}%`;
    query = query.or(`name.ilike.${s},sku.ilike.${s},short_description.ilike.${s}`);
  }

  switch (filters.sort) {
    case "name_asc":
      query = query.order("name", { ascending: true });
      break;
    case "name_desc":
      query = query.order("name", { ascending: false });
      break;
    default:
      query = query.order("created_at", { ascending: false });
  }

  const { data, error } = await query.limit(200);
  if (error) throw error;
  return (data ?? []) as Product[];
}

export async function fetchProductBySlug(slug: string): Promise<{ product: Product; images: ProductImage[] } | null> {
  const { data: product, error } = await supabase
    .from("products")
    .select("id, category_id, name, slug, sku, short_description, description, unit, moq, pack_size, weight_kg, main_image_url")
    .eq("slug", slug)
    .eq("is_active", true)
    .maybeSingle();
  if (error) throw error;
  if (!product) return null;

  const { data: images } = await supabase
    .from("product_images")
    .select("id, url, alt, sort_order, is_primary")
    .eq("product_id", product.id)
    .order("sort_order", { ascending: true });

  return { product: product as Product, images: (images ?? []) as ProductImage[] };
}
