-- ==========================================
-- ENUM: order_status
-- ==========================================
DO $$ BEGIN
  CREATE TYPE public.order_status AS ENUM ('new','confirmed','processing','shipped','completed','cancelled');
EXCEPTION WHEN duplicate_object THEN null; END $$;

-- ==========================================
-- SEQUENCE for order numbers
-- ==========================================
CREATE SEQUENCE IF NOT EXISTS public.order_number_seq START 1;

CREATE OR REPLACE FUNCTION public.next_order_number()
RETURNS text
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_seq BIGINT;
BEGIN
  v_seq := nextval('public.order_number_seq');
  RETURN to_char(now(), 'YYYY') || '-' || lpad(v_seq::text, 6, '0');
END;
$$;

-- ==========================================
-- CART ITEMS
-- ==========================================
CREATE TABLE IF NOT EXISTS public.cart_items (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL,
  product_id UUID NOT NULL,
  qty INTEGER NOT NULL DEFAULT 1 CHECK (qty > 0),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE (user_id, product_id)
);

ALTER TABLE public.cart_items ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Klient vidi svuj kosik"
ON public.cart_items FOR SELECT TO authenticated
USING (user_id = auth.uid());

CREATE POLICY "Klient prida do sveho kosiku"
ON public.cart_items FOR INSERT TO authenticated
WITH CHECK (user_id = auth.uid());

CREATE POLICY "Klient upravi svuj kosik"
ON public.cart_items FOR UPDATE TO authenticated
USING (user_id = auth.uid())
WITH CHECK (user_id = auth.uid());

CREATE POLICY "Klient smaze ze sveho kosiku"
ON public.cart_items FOR DELETE TO authenticated
USING (user_id = auth.uid());

CREATE TRIGGER trg_cart_items_updated_at
BEFORE UPDATE ON public.cart_items
FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

-- ==========================================
-- ORDERS
-- ==========================================
CREATE TABLE IF NOT EXISTS public.orders (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  order_number TEXT NOT NULL UNIQUE DEFAULT public.next_order_number(),
  company_id UUID NOT NULL,
  created_by UUID NOT NULL,
  status public.order_status NOT NULL DEFAULT 'new',
  currency TEXT NOT NULL DEFAULT 'CZK',
  subtotal NUMERIC(12,2) NOT NULL DEFAULT 0,
  shipping NUMERIC(12,2) NOT NULL DEFAULT 0,
  vat NUMERIC(12,2) NOT NULL DEFAULT 0,
  total NUMERIC(12,2) NOT NULL DEFAULT 0,
  billing_address JSONB,
  shipping_address JSONB,
  customer_note TEXT,
  internal_note TEXT,
  invoice_url TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_orders_company ON public.orders(company_id);
CREATE INDEX IF NOT EXISTS idx_orders_created_by ON public.orders(created_by);
CREATE INDEX IF NOT EXISTS idx_orders_status ON public.orders(status);

ALTER TABLE public.orders ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Admin vidi vsechny objednavky"
ON public.orders FOR SELECT TO authenticated
USING (public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Admin upravi objednavky"
ON public.orders FOR UPDATE TO authenticated
USING (public.has_role(auth.uid(), 'admin'))
WITH CHECK (public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Admin smaze objednavky"
ON public.orders FOR DELETE TO authenticated
USING (public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Klient vidi objednavky sve firmy"
ON public.orders FOR SELECT TO authenticated
USING (company_id = public.get_user_company_id(auth.uid()));

CREATE POLICY "Schvaleny klient vytvori objednavku sve firmy"
ON public.orders FOR INSERT TO authenticated
WITH CHECK (
  company_id = public.get_user_company_id(auth.uid())
  AND created_by = auth.uid()
  AND public.get_user_status(auth.uid()) = 'approved'
);

CREATE TRIGGER trg_orders_updated_at
BEFORE UPDATE ON public.orders
FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

-- ==========================================
-- ORDER ITEMS
-- ==========================================
CREATE TABLE IF NOT EXISTS public.order_items (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  order_id UUID NOT NULL REFERENCES public.orders(id) ON DELETE CASCADE,
  product_id UUID,
  product_name TEXT NOT NULL,
  product_sku TEXT,
  unit TEXT NOT NULL DEFAULT 'ks',
  qty INTEGER NOT NULL CHECK (qty > 0),
  unit_price NUMERIC(12,2) NOT NULL,
  line_total NUMERIC(12,2) NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_order_items_order ON public.order_items(order_id);

ALTER TABLE public.order_items ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Admin vidi polozky vsech objednavek"
ON public.order_items FOR SELECT TO authenticated
USING (public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Admin spravuje polozky objednavek"
ON public.order_items FOR ALL TO authenticated
USING (public.has_role(auth.uid(), 'admin'))
WITH CHECK (public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Klient vidi polozky objednavek sve firmy"
ON public.order_items FOR SELECT TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM public.orders o
    WHERE o.id = order_items.order_id
      AND o.company_id = public.get_user_company_id(auth.uid())
  )
);

CREATE POLICY "Klient vlozi polozky pri vytvoreni objednavky"
ON public.order_items FOR INSERT TO authenticated
WITH CHECK (
  EXISTS (
    SELECT 1 FROM public.orders o
    WHERE o.id = order_items.order_id
      AND o.created_by = auth.uid()
      AND o.company_id = public.get_user_company_id(auth.uid())
  )
);