-- Privátní bucket pro faktury
INSERT INTO storage.buckets (id, name, public)
VALUES ('invoices', 'invoices', false)
ON CONFLICT (id) DO NOTHING;

-- Admin: plná správa
CREATE POLICY "Admin spravuje faktury - select"
ON storage.objects FOR SELECT TO authenticated
USING (bucket_id = 'invoices' AND public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Admin spravuje faktury - insert"
ON storage.objects FOR INSERT TO authenticated
WITH CHECK (bucket_id = 'invoices' AND public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Admin spravuje faktury - update"
ON storage.objects FOR UPDATE TO authenticated
USING (bucket_id = 'invoices' AND public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Admin spravuje faktury - delete"
ON storage.objects FOR DELETE TO authenticated
USING (bucket_id = 'invoices' AND public.has_role(auth.uid(), 'admin'));

-- Klient: čtení vlastních faktur (cesta: <company_id>/<order_id>/<file>.pdf)
CREATE POLICY "Klient cte faktury sve firmy"
ON storage.objects FOR SELECT TO authenticated
USING (
  bucket_id = 'invoices'
  AND (storage.foldername(name))[1] = public.get_user_company_id(auth.uid())::text
);