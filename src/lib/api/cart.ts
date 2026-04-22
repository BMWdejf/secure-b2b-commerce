import { supabase } from "@/integrations/supabase/client";

export interface CartItemRow {
  id: string;
  product_id: string;
  qty: number;
  product: {
    id: string;
    name: string;
    slug: string;
    sku: string | null;
    unit: string;
    moq: number;
    pack_size: number;
    main_image_url: string | null;
    is_active: boolean;
  };
}

export interface CartItemWithPrice extends CartItemRow {
  unit_price: number | null; // null = no price (no pricelist or product not in pricelist)
  line_total: number | null;
}

export async function fetchCart(userId: string): Promise<CartItemRow[]> {
  const { data, error } = await supabase
    .from("cart_items")
    .select("id, product_id, qty, product:products(id, name, slug, sku, unit, moq, pack_size, main_image_url, is_active)")
    .eq("user_id", userId)
    .order("created_at", { ascending: true });
  if (error) throw error;
  return (data ?? []).filter((r: any) => r.product) as unknown as CartItemRow[];
}

export async function addToCart(userId: string, productId: string, qty: number) {
  // Try update if exists, otherwise insert
  const { data: existing } = await supabase
    .from("cart_items")
    .select("id, qty")
    .eq("user_id", userId)
    .eq("product_id", productId)
    .maybeSingle();

  if (existing) {
    const { error } = await supabase
      .from("cart_items")
      .update({ qty: existing.qty + qty })
      .eq("id", existing.id);
    if (error) throw error;
  } else {
    const { error } = await supabase.from("cart_items").insert({
      user_id: userId,
      product_id: productId,
      qty,
    });
    if (error) throw error;
  }
}

export async function updateCartItemQty(itemId: string, qty: number) {
  if (qty <= 0) return removeCartItem(itemId);
  const { error } = await supabase.from("cart_items").update({ qty }).eq("id", itemId);
  if (error) throw error;
}

export async function removeCartItem(itemId: string) {
  const { error } = await supabase.from("cart_items").delete().eq("id", itemId);
  if (error) throw error;
}

export async function clearCart(userId: string) {
  const { error } = await supabase.from("cart_items").delete().eq("user_id", userId);
  if (error) throw error;
}

// Fetch user's pricelist items (only what's needed)
export async function fetchPricesForProducts(productIds: string[]): Promise<Record<string, { unit_price: number; min_qty: number }[]>> {
  if (productIds.length === 0) return {};
  const { data, error } = await supabase
    .from("pricelist_items")
    .select("product_id, unit_price, min_qty")
    .in("product_id", productIds)
    .order("min_qty", { ascending: true });
  if (error) throw error;
  const map: Record<string, { unit_price: number; min_qty: number }[]> = {};
  for (const row of data ?? []) {
    const pid = (row as any).product_id as string;
    if (!map[pid]) map[pid] = [];
    map[pid].push({ unit_price: Number((row as any).unit_price), min_qty: Number((row as any).min_qty) });
  }
  return map;
}

// Resolve unit price for given qty (highest min_qty <= qty)
export function resolveUnitPrice(tiers: { unit_price: number; min_qty: number }[] | undefined, qty: number): number | null {
  if (!tiers || tiers.length === 0) return null;
  const eligible = tiers.filter((t) => t.min_qty <= qty);
  if (eligible.length === 0) return tiers[0].unit_price; // fallback to lowest tier
  return eligible[eligible.length - 1].unit_price;
}
