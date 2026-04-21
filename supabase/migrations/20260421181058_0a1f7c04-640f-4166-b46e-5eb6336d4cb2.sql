-- CATEGORIES
CREATE TABLE public.categories (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  parent_id UUID REFERENCES public.categories(id) ON DELETE SET NULL,
  name TEXT NOT NULL,
  slug TEXT NOT NULL UNIQUE,
  description TEXT,
  sort_order INT NOT NULL DEFAULT 0,
  is_active BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
CREATE INDEX idx_categories_parent ON public.categories(parent_id);
CREATE INDEX idx_categories_slug ON public.categories(slug);

ALTER TABLE public.categories ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Verejne cteni aktivnich kategorii"
  ON public.categories FOR SELECT
  USING (is_active = true);

CREATE POLICY "Admin vidi vsechny kategorie"
  ON public.categories FOR SELECT
  TO authenticated
  USING (has_role(auth.uid(), 'admin'));

CREATE POLICY "Admin spravuje kategorie - insert"
  ON public.categories FOR INSERT
  TO authenticated
  WITH CHECK (has_role(auth.uid(), 'admin'));

CREATE POLICY "Admin spravuje kategorie - update"
  ON public.categories FOR UPDATE
  TO authenticated
  USING (has_role(auth.uid(), 'admin'))
  WITH CHECK (has_role(auth.uid(), 'admin'));

CREATE POLICY "Admin spravuje kategorie - delete"
  ON public.categories FOR DELETE
  TO authenticated
  USING (has_role(auth.uid(), 'admin'));

CREATE TRIGGER trg_categories_updated_at
  BEFORE UPDATE ON public.categories
  FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

-- PRODUCTS
CREATE TABLE public.products (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  category_id UUID REFERENCES public.categories(id) ON DELETE SET NULL,
  name TEXT NOT NULL,
  slug TEXT NOT NULL UNIQUE,
  sku TEXT UNIQUE,
  short_description TEXT,
  description TEXT,
  unit TEXT NOT NULL DEFAULT 'ks',
  moq INT NOT NULL DEFAULT 1,
  pack_size INT NOT NULL DEFAULT 1,
  weight_kg NUMERIC(10,3),
  main_image_url TEXT,
  is_active BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
CREATE INDEX idx_products_category ON public.products(category_id);
CREATE INDEX idx_products_slug ON public.products(slug);
CREATE INDEX idx_products_active ON public.products(is_active);

ALTER TABLE public.products ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Verejne cteni aktivnich produktu"
  ON public.products FOR SELECT
  USING (is_active = true);

CREATE POLICY "Admin vidi vsechny produkty"
  ON public.products FOR SELECT
  TO authenticated
  USING (has_role(auth.uid(), 'admin'));

CREATE POLICY "Admin spravuje produkty - insert"
  ON public.products FOR INSERT
  TO authenticated
  WITH CHECK (has_role(auth.uid(), 'admin'));

CREATE POLICY "Admin spravuje produkty - update"
  ON public.products FOR UPDATE
  TO authenticated
  USING (has_role(auth.uid(), 'admin'))
  WITH CHECK (has_role(auth.uid(), 'admin'));

CREATE POLICY "Admin spravuje produkty - delete"
  ON public.products FOR DELETE
  TO authenticated
  USING (has_role(auth.uid(), 'admin'));

CREATE TRIGGER trg_products_updated_at
  BEFORE UPDATE ON public.products
  FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

-- PRODUCT IMAGES
CREATE TABLE public.product_images (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  product_id UUID NOT NULL REFERENCES public.products(id) ON DELETE CASCADE,
  url TEXT NOT NULL,
  alt TEXT,
  sort_order INT NOT NULL DEFAULT 0,
  is_primary BOOLEAN NOT NULL DEFAULT false,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
CREATE INDEX idx_product_images_product ON public.product_images(product_id);

ALTER TABLE public.product_images ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Verejne cteni obrazku aktivnich produktu"
  ON public.product_images FOR SELECT
  USING (EXISTS (
    SELECT 1 FROM public.products p
    WHERE p.id = product_images.product_id AND p.is_active = true
  ));

CREATE POLICY "Admin vidi vsechny obrazky"
  ON public.product_images FOR SELECT
  TO authenticated
  USING (has_role(auth.uid(), 'admin'));

CREATE POLICY "Admin spravuje obrazky - insert"
  ON public.product_images FOR INSERT
  TO authenticated
  WITH CHECK (has_role(auth.uid(), 'admin'));

CREATE POLICY "Admin spravuje obrazky - update"
  ON public.product_images FOR UPDATE
  TO authenticated
  USING (has_role(auth.uid(), 'admin'))
  WITH CHECK (has_role(auth.uid(), 'admin'));

CREATE POLICY "Admin spravuje obrazky - delete"
  ON public.product_images FOR DELETE
  TO authenticated
  USING (has_role(auth.uid(), 'admin'));