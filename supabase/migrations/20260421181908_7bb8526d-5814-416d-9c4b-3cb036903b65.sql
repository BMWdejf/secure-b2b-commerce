-- PRICELISTS
CREATE TABLE public.pricelists (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  currency TEXT NOT NULL DEFAULT 'CZK',
  is_default BOOLEAN NOT NULL DEFAULT false,
  notes TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE public.pricelists ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Admin spravuje ceniky - all"
  ON public.pricelists FOR ALL
  TO authenticated
  USING (has_role(auth.uid(), 'admin'))
  WITH CHECK (has_role(auth.uid(), 'admin'));

CREATE TRIGGER trg_pricelists_updated_at
  BEFORE UPDATE ON public.pricelists
  FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

-- COMPANIES → pricelist
ALTER TABLE public.companies
  ADD COLUMN pricelist_id UUID REFERENCES public.pricelists(id) ON DELETE SET NULL;

-- helper: pricelist klienta
CREATE OR REPLACE FUNCTION public.get_user_pricelist_id(_user_id uuid)
RETURNS uuid
LANGUAGE sql STABLE SECURITY DEFINER SET search_path = public
AS $$
  SELECT c.pricelist_id
  FROM public.companies c
  JOIN public.profiles p ON p.company_id = c.id
  WHERE p.id = _user_id
$$;

-- Klient vidí svůj přiřazený ceník (po schválení)
CREATE POLICY "Klient vidi svuj cenik"
  ON public.pricelists FOR SELECT
  TO authenticated
  USING (
    id = public.get_user_pricelist_id(auth.uid())
    AND public.get_user_status(auth.uid()) = 'approved'
  );

-- PRICELIST ITEMS
CREATE TABLE public.pricelist_items (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  pricelist_id UUID NOT NULL REFERENCES public.pricelists(id) ON DELETE CASCADE,
  product_id UUID NOT NULL REFERENCES public.products(id) ON DELETE CASCADE,
  min_qty INT NOT NULL DEFAULT 1,
  unit_price NUMERIC(12,2) NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE (pricelist_id, product_id, min_qty)
);
CREATE INDEX idx_pl_items_pricelist ON public.pricelist_items(pricelist_id);
CREATE INDEX idx_pl_items_product ON public.pricelist_items(product_id);

ALTER TABLE public.pricelist_items ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Admin spravuje polozky ceniku"
  ON public.pricelist_items FOR ALL
  TO authenticated
  USING (has_role(auth.uid(), 'admin'))
  WITH CHECK (has_role(auth.uid(), 'admin'));

CREATE POLICY "Klient vidi polozky sveho ceniku"
  ON public.pricelist_items FOR SELECT
  TO authenticated
  USING (
    pricelist_id = public.get_user_pricelist_id(auth.uid())
    AND public.get_user_status(auth.uid()) = 'approved'
  );

CREATE TRIGGER trg_pricelist_items_updated_at
  BEFORE UPDATE ON public.pricelist_items
  FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

-- INVENTORY
CREATE TABLE public.inventory (
  product_id UUID PRIMARY KEY REFERENCES public.products(id) ON DELETE CASCADE,
  qty_available INT NOT NULL DEFAULT 0,
  low_stock_threshold INT NOT NULL DEFAULT 0,
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE public.inventory ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Admin spravuje sklad"
  ON public.inventory FOR ALL
  TO authenticated
  USING (has_role(auth.uid(), 'admin'))
  WITH CHECK (has_role(auth.uid(), 'admin'));

CREATE POLICY "Schvaleny klient vidi sklad"
  ON public.inventory FOR SELECT
  TO authenticated
  USING (public.get_user_status(auth.uid()) = 'approved');

CREATE TRIGGER trg_inventory_updated_at
  BEFORE UPDATE ON public.inventory
  FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

-- STORAGE bucket pro produktove obrazky
INSERT INTO storage.buckets (id, name, public)
VALUES ('product-images', 'product-images', true)
ON CONFLICT (id) DO NOTHING;

CREATE POLICY "Verejne cteni produktovych obrazku"
  ON storage.objects FOR SELECT
  USING (bucket_id = 'product-images');

CREATE POLICY "Admin nahraje produktove obrazky"
  ON storage.objects FOR INSERT
  TO authenticated
  WITH CHECK (bucket_id = 'product-images' AND has_role(auth.uid(), 'admin'));

CREATE POLICY "Admin upravi produktove obrazky"
  ON storage.objects FOR UPDATE
  TO authenticated
  USING (bucket_id = 'product-images' AND has_role(auth.uid(), 'admin'));

CREATE POLICY "Admin smaze produktove obrazky"
  ON storage.objects FOR DELETE
  TO authenticated
  USING (bucket_id = 'product-images' AND has_role(auth.uid(), 'admin'));

-- Vychozi cenik
INSERT INTO public.pricelists (name, currency, is_default)
VALUES ('Standard', 'CZK', true);