import { supabase } from "@/integrations/supabase/client";

export interface HeroStat { label: string; value: string }
export interface FeatureItem { icon: string; title: string; desc: string }

export interface SiteSettings {
  id: string;
  logo_url: string | null;
  brand_name: string;
  footer_text: string;
  company_ico: string | null;
  company_dic: string | null;
  default_pack_label: string;
  availability_in_stock_label: string;
  availability_on_request_label: string;
  hero_badge: string;
  hero_title: string;
  hero_title_accent: string;
  hero_subtitle: string;
  hero_cta_primary: string;
  hero_cta_secondary: string;
  hero_note: string;
  hero_stats: HeroStat[];
  features: FeatureItem[];
  features_title: string;
  features_subtitle: string;
  cta_title: string;
  cta_text: string;
  cta_button: string;
}

export async function fetchSiteSettings(): Promise<SiteSettings | null> {
  const { data, error } = await supabase.from("site_settings").select("*").limit(1).maybeSingle();
  if (error) throw error;
  if (!data) return null;
  return {
    ...data,
    hero_stats: (data.hero_stats as any) ?? [],
    features: (data.features as any) ?? [],
  } as SiteSettings;
}

export async function updateSiteSettings(id: string, patch: Partial<SiteSettings>) {
  const { error } = await supabase.from("site_settings").update(patch as any).eq("id", id);
  if (error) throw error;
}

export async function uploadLogo(file: File): Promise<string> {
  const ext = file.name.split(".").pop() || "png";
  const path = `logo-${Date.now()}.${ext}`;
  const { error } = await supabase.storage.from("branding").upload(path, file, { upsert: true, cacheControl: "3600" });
  if (error) throw error;
  const { data } = supabase.storage.from("branding").getPublicUrl(path);
  return data.publicUrl;
}

// Pages
export interface Page {
  id: string;
  slug: string;
  title: string;
  content_html: string;
  is_published: boolean;
  updated_at: string;
}

export async function fetchPages(): Promise<Page[]> {
  const { data, error } = await supabase.from("pages").select("*").order("title");
  if (error) throw error;
  return (data ?? []) as Page[];
}

export async function fetchPageBySlug(slug: string): Promise<Page | null> {
  const { data, error } = await supabase.from("pages").select("*").eq("slug", slug).eq("is_published", true).maybeSingle();
  if (error) throw error;
  return (data ?? null) as Page | null;
}

export async function upsertPage(page: Partial<Page> & { slug: string; title: string }) {
  if (page.id) {
    const { error } = await supabase.from("pages").update({
      slug: page.slug, title: page.title, content_html: page.content_html ?? "", is_published: page.is_published ?? true,
    }).eq("id", page.id);
    if (error) throw error;
  } else {
    const { error } = await supabase.from("pages").insert({
      slug: page.slug, title: page.title, content_html: page.content_html ?? "", is_published: page.is_published ?? true,
    });
    if (error) throw error;
  }
}

export async function deletePage(id: string) {
  const { error } = await supabase.from("pages").delete().eq("id", id);
  if (error) throw error;
}

// Contact addresses
export interface ContactAddress {
  id: string;
  kind: "billing" | "shipping";
  company_name: string;
  street: string | null;
  city: string | null;
  postal_code: string | null;
  country: string;
  ico: string | null;
  dic: string | null;
  phone: string | null;
  email: string | null;
}

export async function fetchContactAddresses(): Promise<ContactAddress[]> {
  const { data, error } = await supabase.from("contact_addresses").select("*").order("kind");
  if (error) throw error;
  return (data ?? []) as ContactAddress[];
}

export async function updateContactAddress(id: string, patch: Partial<ContactAddress>) {
  const { error } = await supabase.from("contact_addresses").update(patch as any).eq("id", id);
  if (error) throw error;
}

// Contact messages
export interface ContactMessage {
  id: string;
  name: string;
  email: string;
  phone: string | null;
  message: string;
  user_id: string | null;
  is_read: boolean;
  created_at: string;
}

export async function sendContactMessage(payload: { name: string; email: string; phone?: string | null; message: string; user_id?: string | null }) {
  const { error } = await supabase.from("contact_messages").insert({
    name: payload.name,
    email: payload.email,
    phone: payload.phone ?? null,
    message: payload.message,
    user_id: payload.user_id ?? null,
  });
  if (error) throw error;
}

export async function fetchContactMessages(): Promise<ContactMessage[]> {
  const { data, error } = await supabase.from("contact_messages").select("*").order("created_at", { ascending: false });
  if (error) throw error;
  return (data ?? []) as ContactMessage[];
}

export async function markMessageRead(id: string, isRead: boolean) {
  const { error } = await supabase.from("contact_messages").update({ is_read: isRead }).eq("id", id);
  if (error) throw error;
}

export async function deleteMessage(id: string) {
  const { error } = await supabase.from("contact_messages").delete().eq("id", id);
  if (error) throw error;
}
