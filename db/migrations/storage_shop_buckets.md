# Supabase Storage — shop

Opprett to **private** eller **public** buckets (public forenkler bilde-URL-er i UI og e-post):

1. **product-images** — produktbilder fra admin. Anbefalt path: `{productId}/{filnavn}`.
2. **shop-logos** — logoer fra lag-bestillinger. Path: `{organizationId}/{uuid}.{ext}`.

Tjenestenokkel (`SUPABASE_SERVICE_ROLE_KEY`) brukes i API-rutene `/api/upload/product-image` og `/api/upload/shop-logo` for opplasting, så RLS på storage kan være restriktiv eller tom for disse bucketene hvis kun server laster opp.

For **signed URLs** i stedet for public buckets, bytt til server-genererte lenker senere.
