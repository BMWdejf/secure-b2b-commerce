import { supabase } from "@/integrations/supabase/client";

export type AddressKind = "billing" | "shipping";

export interface Address {
  id: string;
  company_id: string;
  kind: AddressKind;
  label: string | null;
  contact_name: string | null;
  street: string;
  city: string;
  postal_code: string;
  country: string;
  phone: string | null;
  is_default: boolean;
}

export async function fetchAddresses(companyId: string): Promise<Address[]> {
  const { data, error } = await supabase
    .from("addresses")
    .select("id, company_id, kind, label, contact_name, street, city, postal_code, country, phone, is_default")
    .eq("company_id", companyId)
    .order("is_default", { ascending: false })
    .order("created_at", { ascending: true });
  if (error) throw error;
  return (data ?? []) as Address[];
}

export async function upsertAddress(a: Partial<Address> & { company_id: string; kind: AddressKind; street: string; city: string; postal_code: string }) {
  const payload = {
    company_id: a.company_id,
    kind: a.kind,
    label: a.label ?? null,
    contact_name: a.contact_name ?? null,
    street: a.street,
    city: a.city,
    postal_code: a.postal_code,
    country: a.country ?? "CZ",
    phone: a.phone ?? null,
    is_default: a.is_default ?? false,
  };
  if (a.id) {
    const { error } = await supabase.from("addresses").update(payload).eq("id", a.id);
    if (error) throw error;
  } else {
    const { error } = await supabase.from("addresses").insert(payload);
    if (error) throw error;
  }
}

export async function deleteAddress(id: string) {
  const { error } = await supabase.from("addresses").delete().eq("id", id);
  if (error) throw error;
}

export async function setDefaultAddress(id: string, companyId: string, kind: AddressKind) {
  // Unset other defaults of same kind
  await supabase.from("addresses").update({ is_default: false }).eq("company_id", companyId).eq("kind", kind);
  const { error } = await supabase.from("addresses").update({ is_default: true }).eq("id", id);
  if (error) throw error;
}

// Profile + Company
export interface MyProfile {
  id: string;
  full_name: string;
  phone: string | null;
  status: "pending" | "approved" | "blocked";
  company: {
    id: string;
    name: string;
    ico: string | null;
    dic: string | null;
    email: string | null;
    phone: string | null;
  } | null;
}

export async function fetchMyProfile(userId: string): Promise<MyProfile | null> {
  const { data, error } = await supabase
    .from("profiles")
    .select("id, full_name, phone, status, company:companies(id, name, ico, dic, email, phone)")
    .eq("id", userId)
    .maybeSingle();
  if (error) throw error;
  return data as unknown as MyProfile;
}

export async function updateMyProfile(userId: string, p: { full_name: string; phone: string | null }) {
  const { error } = await supabase.from("profiles").update({ full_name: p.full_name, phone: p.phone }).eq("id", userId);
  if (error) throw error;
}

export async function updateMyCompany(companyId: string, c: { name: string; ico: string | null; dic: string | null; email: string | null; phone: string | null }) {
  const { error } = await supabase.from("companies").update(c).eq("id", companyId);
  if (error) throw error;
}
