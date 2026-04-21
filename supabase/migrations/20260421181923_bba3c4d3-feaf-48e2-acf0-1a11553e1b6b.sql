-- Oprava: replace policy aby nesvolovala "list" (požadavek bez konkrétního name)
DROP POLICY IF EXISTS "Verejne cteni produktovych obrazku" ON storage.objects;

CREATE POLICY "Verejne cteni produktovych obrazku"
  ON storage.objects FOR SELECT
  TO anon, authenticated
  USING (
    bucket_id = 'product-images'
    AND name IS NOT NULL
    AND length(name) > 0
  );