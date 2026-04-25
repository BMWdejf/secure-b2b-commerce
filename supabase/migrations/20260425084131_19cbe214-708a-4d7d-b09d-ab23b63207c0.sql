
-- 1. Products: add availability + pack_label
CREATE TYPE public.product_availability AS ENUM ('in_stock', 'on_request');

ALTER TABLE public.products
  ADD COLUMN availability public.product_availability NOT NULL DEFAULT 'in_stock',
  ADD COLUMN pack_label text NOT NULL DEFAULT 'Karton';

-- 2. site_settings (singleton)
CREATE TABLE public.site_settings (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  is_singleton boolean NOT NULL DEFAULT true UNIQUE,
  logo_url text,
  brand_name text NOT NULL DEFAULT 'NordB2B',
  footer_text text NOT NULL DEFAULT 'Velkoobchodní platforma navržená pro moderní B2B partnery.',
  company_ico text DEFAULT '00000000',
  company_dic text DEFAULT 'CZ00000000',
  default_pack_label text NOT NULL DEFAULT 'Karton',
  availability_in_stock_label text NOT NULL DEFAULT 'Skladem',
  availability_on_request_label text NOT NULL DEFAULT 'Na dotaz',
  hero_badge text NOT NULL DEFAULT 'B2B velkoobchodní platforma nové generace',
  hero_title text NOT NULL DEFAULT 'Velkoobchod, který šetří čas vašim nákupčím.',
  hero_title_accent text NOT NULL DEFAULT 'nákupčím',
  hero_subtitle text NOT NULL DEFAULT 'NordB2B je moderní platforma pro velkoobchodní partnery. Individuální ceny, rychlé objednávky a přehledná fakturace — vše na jednom místě.',
  hero_cta_primary text NOT NULL DEFAULT 'Registrovat firmu',
  hero_cta_secondary text NOT NULL DEFAULT 'Procházet katalog',
  hero_note text NOT NULL DEFAULT 'Ceny a dostupnost se zobrazí až po schválení vaší firmy administrátorem.',
  hero_stats jsonb NOT NULL DEFAULT '[
    {"label":"B2B partnerů","value":"500+"},
    {"label":"Produktů v katalogu","value":"12 000"},
    {"label":"Objednávek měsíčně","value":"8 500"},
    {"label":"Spokojenost","value":"98 %"}
  ]'::jsonb,
  features jsonb NOT NULL DEFAULT '[
    {"icon":"Package","title":"Individuální ceníky","desc":"Každý B2B partner má vlastní cenovou hladinu a množstevní slevy přizpůsobené objemu."},
    {"icon":"FileText","title":"Fakturace bez platební brány","desc":"Objednávky se realizují klasicky fakturou se splatností. Žádné poplatky za platby."},
    {"icon":"Zap","title":"Rychlé opakované objednávky","desc":"Vytvořte objednávku jedním kliknutím podle historie. Šetří čas vašim nákupčím."},
    {"icon":"Users","title":"Více uživatelů ve firmě","desc":"Přidejte své kolegy a nákupčí pod jeden firemní účet s přehledem o všech objednávkách."},
    {"icon":"Truck","title":"Přehled o stavu zásilek","desc":"Sledujte stav každé objednávky v reálném čase, od potvrzení až po doručení."},
    {"icon":"ShieldCheck","title":"Bezpečný a ověřený přístup","desc":"Ceny a sklad jsou viditelné až po schválení vaší firmy. Žádné úniky obchodních podmínek."}
  ]'::jsonb,
  features_title text NOT NULL DEFAULT 'Vše, co B2B nákupčí potřebuje',
  features_subtitle text NOT NULL DEFAULT 'Postaveno pro velkoobchod. Bez zbytečných funkcí, se vším podstatným.',
  cta_title text NOT NULL DEFAULT 'Začněte s NordB2B ještě dnes',
  cta_text text NOT NULL DEFAULT 'Registrace je zdarma. Po schválení vaší firmy získáte okamžitý přístup k cenám, dostupnosti a možnost objednávat.',
  cta_button text NOT NULL DEFAULT 'Registrovat firmu zdarma',
  updated_at timestamptz NOT NULL DEFAULT now(),
  created_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE public.site_settings ENABLE ROW LEVEL SECURITY;

CREATE POLICY "site_settings public read"
  ON public.site_settings FOR SELECT TO public USING (true);

CREATE POLICY "site_settings admin update"
  ON public.site_settings FOR UPDATE TO authenticated
  USING (public.has_role(auth.uid(), 'admin'))
  WITH CHECK (public.has_role(auth.uid(), 'admin'));

CREATE POLICY "site_settings admin insert"
  ON public.site_settings FOR INSERT TO authenticated
  WITH CHECK (public.has_role(auth.uid(), 'admin'));

CREATE TRIGGER trg_site_settings_updated
  BEFORE UPDATE ON public.site_settings
  FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

INSERT INTO public.site_settings (is_singleton) VALUES (true);

-- 3. pages (CMS)
CREATE TABLE public.pages (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  slug text NOT NULL UNIQUE,
  title text NOT NULL,
  content_html text NOT NULL DEFAULT '',
  is_published boolean NOT NULL DEFAULT true,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE public.pages ENABLE ROW LEVEL SECURITY;

CREATE POLICY "pages public read published"
  ON public.pages FOR SELECT TO public USING (is_published = true);

CREATE POLICY "pages admin all"
  ON public.pages FOR ALL TO authenticated
  USING (public.has_role(auth.uid(), 'admin'))
  WITH CHECK (public.has_role(auth.uid(), 'admin'));

CREATE TRIGGER trg_pages_updated
  BEFORE UPDATE ON public.pages
  FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

INSERT INTO public.pages (slug, title, content_html) VALUES
  ('o-nas', 'O nás', '<h2>O naší společnosti</h2><p>Tento obsah upravte v administraci v sekci Nastavení → Stránky.</p>');

-- 4. contact_addresses
CREATE TYPE public.contact_address_kind AS ENUM ('billing', 'shipping');

CREATE TABLE public.contact_addresses (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  kind public.contact_address_kind NOT NULL,
  company_name text NOT NULL DEFAULT '',
  street text DEFAULT '',
  city text DEFAULT '',
  postal_code text DEFAULT '',
  country text NOT NULL DEFAULT 'CZ',
  ico text,
  dic text,
  phone text,
  email text,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE public.contact_addresses ENABLE ROW LEVEL SECURITY;

CREATE POLICY "contact_addresses public read"
  ON public.contact_addresses FOR SELECT TO public USING (true);

CREATE POLICY "contact_addresses admin all"
  ON public.contact_addresses FOR ALL TO authenticated
  USING (public.has_role(auth.uid(), 'admin'))
  WITH CHECK (public.has_role(auth.uid(), 'admin'));

CREATE TRIGGER trg_contact_addresses_updated
  BEFORE UPDATE ON public.contact_addresses
  FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

INSERT INTO public.contact_addresses (kind, company_name, street, city, postal_code) VALUES
  ('billing', 'NordB2B s.r.o.', 'Hlavní 1', 'Praha', '11000'),
  ('shipping', 'NordB2B s.r.o. — sklad', 'Skladová 2', 'Praha', '11000');

-- 5. contact_messages
CREATE TABLE public.contact_messages (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  email text NOT NULL,
  phone text,
  message text NOT NULL,
  user_id uuid,
  is_read boolean NOT NULL DEFAULT false,
  created_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE public.contact_messages ENABLE ROW LEVEL SECURITY;

CREATE POLICY "contact_messages public insert"
  ON public.contact_messages FOR INSERT TO public WITH CHECK (true);

CREATE POLICY "contact_messages admin select"
  ON public.contact_messages FOR SELECT TO authenticated
  USING (public.has_role(auth.uid(), 'admin'));

CREATE POLICY "contact_messages admin update"
  ON public.contact_messages FOR UPDATE TO authenticated
  USING (public.has_role(auth.uid(), 'admin'))
  WITH CHECK (public.has_role(auth.uid(), 'admin'));

CREATE POLICY "contact_messages admin delete"
  ON public.contact_messages FOR DELETE TO authenticated
  USING (public.has_role(auth.uid(), 'admin'));

-- 6. Storage bucket: branding (public)
INSERT INTO storage.buckets (id, name, public) VALUES ('branding', 'branding', true)
  ON CONFLICT (id) DO NOTHING;

CREATE POLICY "branding public read"
  ON storage.objects FOR SELECT TO public USING (bucket_id = 'branding');

CREATE POLICY "branding admin write"
  ON storage.objects FOR INSERT TO authenticated
  WITH CHECK (bucket_id = 'branding' AND public.has_role(auth.uid(), 'admin'));

CREATE POLICY "branding admin update"
  ON storage.objects FOR UPDATE TO authenticated
  USING (bucket_id = 'branding' AND public.has_role(auth.uid(), 'admin'));

CREATE POLICY "branding admin delete"
  ON storage.objects FOR DELETE TO authenticated
  USING (bucket_id = 'branding' AND public.has_role(auth.uid(), 'admin'));
