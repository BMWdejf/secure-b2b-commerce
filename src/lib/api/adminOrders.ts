import { supabase } from "@/integrations/supabase/client";
import type { OrderRow, OrderStatus } from "./orders";

export async function adminListOrders(filter?: {
  status?: OrderStatus;
  search?: string;
}): Promise<OrderRow[]> {
  let q = supabase
    .from("orders")
    .select("id, order_number, status, currency, subtotal, shipping, vat, total, created_at, company_id")
    .order("created_at", { ascending: false })
    .limit(500);
  if (filter?.status) q = q.eq("status", filter.status);
  if (filter?.search?.trim()) {
    q = q.ilike("order_number", `%${filter.search.trim()}%`);
  }
  const { data, error } = await q;
  if (error) throw error;
  const rows = (data ?? []) as any[];
  const companyIds = Array.from(new Set(rows.map((r) => r.company_id).filter(Boolean)));
  let companies: Record<string, { name: string }> = {};
  if (companyIds.length > 0) {
    const { data: cs } = await supabase
      .from("companies")
      .select("id, name")
      .in("id", companyIds);
    for (const c of cs ?? []) companies[(c as any).id] = { name: (c as any).name };
  }
  return rows.map((r) => ({ ...r, company: companies[r.company_id] ?? null })) as OrderRow[];
}

export async function adminUpdateOrderStatus(id: string, status: OrderStatus) {
  const { error } = await supabase.from("orders").update({ status }).eq("id", id);
  if (error) throw error;
}

export async function adminUpdateOrderInternalNote(id: string, note: string) {
  const { error } = await supabase.from("orders").update({ internal_note: note }).eq("id", id);
  if (error) throw error;
}

export async function adminUploadInvoice(orderId: string, companyId: string, file: File): Promise<string> {
  const ext = (file.name.split(".").pop() || "pdf").toLowerCase();
  const path = `${companyId}/${orderId}/${crypto.randomUUID()}.${ext}`;
  const { error } = await supabase.storage.from("invoices").upload(path, file, {
    cacheControl: "3600",
    upsert: false,
    contentType: file.type || "application/pdf",
  });
  if (error) throw error;
  const { error: e2 } = await supabase.from("orders").update({ invoice_url: path }).eq("id", orderId);
  if (e2) throw e2;
  return path;
}

export async function adminRemoveInvoice(orderId: string, invoicePath: string) {
  await supabase.storage.from("invoices").remove([invoicePath]);
  const { error } = await supabase.from("orders").update({ invoice_url: null }).eq("id", orderId);
  if (error) throw error;
}

export async function adminGetSignedInvoiceUrl(invoicePath: string): Promise<string> {
  const { data, error } = await supabase.storage.from("invoices").createSignedUrl(invoicePath, 60 * 10);
  if (error) throw error;
  return data.signedUrl;
}

// ===== STATISTIKY =====
export interface OrderStat {
  date: string; // YYYY-MM-DD
  orders: number;
  revenue: number;
}

export async function adminGetOrderStats(days = 30): Promise<{
  series: OrderStat[];
  totals: { orders: number; revenue: number; avg: number };
  byStatus: { status: OrderStatus; count: number }[];
}> {
  const from = new Date();
  from.setDate(from.getDate() - (days - 1));
  from.setHours(0, 0, 0, 0);

  const { data, error } = await supabase
    .from("orders")
    .select("created_at, total, status")
    .gte("created_at", from.toISOString())
    .order("created_at", { ascending: true });
  if (error) throw error;

  const map = new Map<string, OrderStat>();
  for (let i = 0; i < days; i++) {
    const d = new Date(from);
    d.setDate(from.getDate() + i);
    const key = d.toISOString().slice(0, 10);
    map.set(key, { date: key, orders: 0, revenue: 0 });
  }
  const statusMap = new Map<OrderStatus, number>();
  let totalOrders = 0;
  let totalRevenue = 0;

  for (const row of data ?? []) {
    const key = (row.created_at as string).slice(0, 10);
    const slot = map.get(key);
    if (slot) {
      slot.orders += 1;
      slot.revenue += Number(row.total) || 0;
    }
    totalOrders += 1;
    totalRevenue += Number(row.total) || 0;
    const s = row.status as OrderStatus;
    statusMap.set(s, (statusMap.get(s) ?? 0) + 1);
  }

  return {
    series: Array.from(map.values()),
    totals: {
      orders: totalOrders,
      revenue: Math.round(totalRevenue * 100) / 100,
      avg: totalOrders ? Math.round((totalRevenue / totalOrders) * 100) / 100 : 0,
    },
    byStatus: Array.from(statusMap.entries()).map(([status, count]) => ({ status, count })),
  };
}

export async function adminGetTopProducts(days = 30, limit = 10): Promise<{ name: string; qty: number; revenue: number }[]> {
  const from = new Date();
  from.setDate(from.getDate() - (days - 1));
  from.setHours(0, 0, 0, 0);

  // Načti id objednávek v období + jejich items
  const { data: orders, error } = await supabase
    .from("orders")
    .select("id")
    .gte("created_at", from.toISOString());
  if (error) throw error;
  const ids = (orders ?? []).map((o: any) => o.id);
  if (ids.length === 0) return [];

  const { data: items, error: e2 } = await supabase
    .from("order_items")
    .select("product_name, qty, line_total")
    .in("order_id", ids);
  if (e2) throw e2;

  const map = new Map<string, { qty: number; revenue: number }>();
  for (const it of items ?? []) {
    const key = it.product_name as string;
    const cur = map.get(key) ?? { qty: 0, revenue: 0 };
    cur.qty += Number(it.qty) || 0;
    cur.revenue += Number(it.line_total) || 0;
    map.set(key, cur);
  }
  return Array.from(map.entries())
    .map(([name, v]) => ({ name, qty: v.qty, revenue: Math.round(v.revenue * 100) / 100 }))
    .sort((a, b) => b.revenue - a.revenue)
    .slice(0, limit);
}
