import { supabase } from "@/integrations/supabase/client";

export type OrderStatus = "new" | "confirmed" | "processing" | "shipped" | "completed" | "cancelled";

export const ORDER_STATUS_LABEL: Record<OrderStatus, string> = {
  new: "Nová",
  confirmed: "Potvrzená",
  processing: "Zpracovává se",
  shipped: "Odeslaná",
  completed: "Dokončená",
  cancelled: "Zrušená",
};

export const ORDER_STATUS_CLASS: Record<OrderStatus, string> = {
  new: "bg-secondary text-foreground",
  confirmed: "bg-primary/10 text-primary",
  processing: "bg-warning/15 text-warning-foreground",
  shipped: "bg-accent/15 text-accent",
  completed: "bg-success/15 text-success-foreground",
  cancelled: "bg-destructive/10 text-destructive",
};

export interface OrderRow {
  id: string;
  order_number: string;
  status: OrderStatus;
  currency: string;
  subtotal: number;
  shipping: number;
  vat: number;
  total: number;
  created_at: string;
  company_id?: string;
  company?: { name: string } | null;
}

export interface OrderDetail extends OrderRow {
  customer_note: string | null;
  internal_note: string | null;
  billing_address: any;
  shipping_address: any;
  invoice_url: string | null;
  company_id: string;
  items: {
    id: string;
    product_id: string | null;
    product_name: string;
    product_sku: string | null;
    unit: string;
    qty: number;
    unit_price: number;
    line_total: number;
  }[];
}

export async function fetchMyOrders(): Promise<OrderRow[]> {
  const { data, error } = await supabase
    .from("orders")
    .select("id, order_number, status, currency, subtotal, shipping, vat, total, created_at")
    .order("created_at", { ascending: false });
  if (error) throw error;
  return (data ?? []) as OrderRow[];
}

export async function fetchOrderDetail(id: string): Promise<OrderDetail | null> {
  // Načti objednávku BEZ embedu (ten může selhávat kvůli cache schématu)
  const { data: order, error } = await supabase
    .from("orders")
    .select(
      "id, order_number, status, currency, subtotal, shipping, vat, total, created_at, customer_note, internal_note, billing_address, shipping_address, invoice_url, company_id",
    )
    .eq("id", id)
    .maybeSingle();
  if (error) throw error;
  if (!order) return null;

  const orderRow = order as any;

  // Firma a položky paralelně, samostatně
  const [companyRes, itemsRes] = await Promise.all([
    orderRow.company_id
      ? supabase.from("companies").select("name").eq("id", orderRow.company_id).maybeSingle()
      : Promise.resolve({ data: null, error: null } as any),
    supabase
      .from("order_items")
      .select("id, product_id, product_name, product_sku, unit, qty, unit_price, line_total")
      .eq("order_id", id),
  ]);

  if (itemsRes.error) throw itemsRes.error;

  return {
    ...orderRow,
    company: companyRes?.data ? { name: (companyRes.data as any).name } : null,
    items: itemsRes.data ?? [],
  } as OrderDetail;
}

export interface CreateOrderInput {
  company_id: string;
  user_id: string;
  items: {
    product_id: string;
    product_name: string;
    product_sku: string | null;
    unit: string;
    qty: number;
    unit_price: number;
  }[];
  billing_address: any;
  shipping_address: any;
  customer_note?: string;
  currency?: string;
  shipping?: number;
  vat_rate?: number;
}

export async function createOrder(input: CreateOrderInput): Promise<{ id: string; order_number: string }> {
  const subtotal = input.items.reduce((s, it) => s + it.qty * it.unit_price, 0);
  const shipping = input.shipping ?? 0;
  const vat = (subtotal + shipping) * (input.vat_rate ?? 0.21);
  const total = subtotal + shipping + vat;

  const { data: order, error } = await supabase
    .from("orders")
    .insert({
      company_id: input.company_id,
      created_by: input.user_id,
      currency: input.currency ?? "CZK",
      subtotal: round2(subtotal),
      shipping: round2(shipping),
      vat: round2(vat),
      total: round2(total),
      billing_address: input.billing_address,
      shipping_address: input.shipping_address,
      customer_note: input.customer_note ?? null,
      status: "new",
    })
    .select("id, order_number")
    .single();
  if (error) throw error;

  const orderId = (order as any).id as string;
  const orderItems = input.items.map((it) => ({
    order_id: orderId,
    product_id: it.product_id,
    product_name: it.product_name,
    product_sku: it.product_sku,
    unit: it.unit,
    qty: it.qty,
    unit_price: round2(it.unit_price),
    line_total: round2(it.qty * it.unit_price),
  }));
  const { error: e2 } = await supabase.from("order_items").insert(orderItems);
  if (e2) throw e2;

  return { id: orderId, order_number: (order as any).order_number as string };
}

// Klient: stažení faktury (signed URL z privátního bucketu)
export async function getInvoiceSignedUrl(invoicePath: string): Promise<string> {
  const { data, error } = await supabase.storage.from("invoices").createSignedUrl(invoicePath, 60 * 10);
  if (error) throw error;
  return data.signedUrl;
}

function round2(n: number) {
  return Math.round(n * 100) / 100;
}
