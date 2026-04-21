-- Public sponsor landing token per campaign
ALTER TABLE campaigns
  ADD COLUMN IF NOT EXISTS sponsor_share_token text;

CREATE UNIQUE INDEX IF NOT EXISTS campaigns_sponsor_share_token_uidx
  ON campaigns (sponsor_share_token)
  WHERE sponsor_share_token IS NOT NULL;

UPDATE campaigns
SET sponsor_share_token = encode(gen_random_bytes(18), 'hex')
WHERE sponsor_share_token IS NULL;
