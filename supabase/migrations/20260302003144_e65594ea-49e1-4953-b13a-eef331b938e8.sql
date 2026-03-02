-- Fix stores public read policy
DROP POLICY IF EXISTS "Anyone can read stores" ON public.stores;
CREATE POLICY "stores_public_read"
  ON public.stores
  AS PERMISSIVE
  FOR SELECT
  TO anon, authenticated
  USING (true);

-- Fix donation_ledger public read policy
DROP POLICY IF EXISTS "Anyone can read donations" ON public.donation_ledger;
CREATE POLICY "donation_ledger_public_read"
  ON public.donation_ledger
  AS PERMISSIVE
  FOR SELECT
  TO anon, authenticated
  USING (true);

-- Fix payout_batches public read policy
DROP POLICY IF EXISTS "Anyone can read payouts" ON public.payout_batches;
CREATE POLICY "payout_batches_public_read"
  ON public.payout_batches
  AS PERMISSIVE
  FOR SELECT
  TO anon, authenticated
  USING (true);

-- Fix site_content public read policy
DROP POLICY IF EXISTS "Anyone can read site_content" ON public.site_content;
CREATE POLICY "site_content_public_read"
  ON public.site_content
  AS PERMISSIVE
  FOR SELECT
  TO anon, authenticated
  USING (true);
