-- Run on Supabase SQL editor (or via migrate) after backup.
-- OPPRETT Storage-buckets i Dashboard: product-images, shop-logos (public read anbefales for enkle URL-er i e-post).

ALTER TABLE products
  ADD COLUMN IF NOT EXISTS emoji text,
  ADD COLUMN IF NOT EXISTS image_storage_path text,
  ADD COLUMN IF NOT EXISTS category text NOT NULL DEFAULT 'other',
  ADD COLUMN IF NOT EXISTS purchase_price_ore integer,
  ADD COLUMN IF NOT EXISTS supplier_key text NOT NULL DEFAULT 'other',
  ADD COLUMN IF NOT EXISTS supplier_other text,
  ADD COLUMN IF NOT EXISTS allows_logo_print boolean NOT NULL DEFAULT false,
  ADD COLUMN IF NOT EXISTS min_order_qty integer NOT NULL DEFAULT 1,
  ADD COLUMN IF NOT EXISTS delivery_time_text text,
  ADD COLUMN IF NOT EXISTS stock_status text NOT NULL DEFAULT 'in_stock',
  ADD COLUMN IF NOT EXISTS updated_at timestamptz NOT NULL DEFAULT now();

UPDATE products SET updated_at = created_at WHERE updated_at IS NULL;

-- Behold eksisterende leverandørtekst i supplier_other når ny nøkkel ble satt til default.
UPDATE products
SET supplier_other = supplier
WHERE supplier IS NOT NULL
  AND btrim(supplier) <> ''
  AND supplier_key = 'other'
  AND (supplier_other IS NULL OR btrim(supplier_other) = '');

ALTER TABLE orders
  ADD COLUMN IF NOT EXISTS product_id uuid REFERENCES products(id) ON DELETE SET NULL,
  ADD COLUMN IF NOT EXISTS quantity integer NOT NULL DEFAULT 1,
  ADD COLUMN IF NOT EXISTS unit_price_ore integer NOT NULL DEFAULT 0,
  ADD COLUMN IF NOT EXISTS logo_storage_path text,
  ADD COLUMN IF NOT EXISTS delivery_address text,
  ADD COLUMN IF NOT EXISTS supplier_notes text;

UPDATE orders SET unit_price_ore = total_ore WHERE unit_price_ore = 0 AND (quantity IS NULL OR quantity <= 1);
UPDATE orders SET quantity = 1 WHERE quantity IS NULL;

CREATE INDEX IF NOT EXISTS orders_product_id_idx ON orders(product_id);
