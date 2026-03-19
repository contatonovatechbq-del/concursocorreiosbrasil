

## Plan: Update Facebook Pixel ID

Replace the current Pixel ID `1188132760156339` with `1592881091824628` in two files:

### Changes

1. **`index.html`** — Update the client-side Facebook Pixel snippet (2 occurrences: `fbq('init', ...)` and the `<noscript>` image tag)

2. **`supabase/functions/fb-conversion/index.ts`** — Update the `PIXEL_ID` constant used for server-side Conversions API calls

