# Wax | Wane — n8n Workflow Vault

## Blog Auto-Post Workflow

**File:** `wax-wane-blog-autopost-FIXED-v2.json`  
**n8n Workflow ID:** `dwA0nkpLsnpSN30p`  
**Status:** Active ✅

### What it does
Runs every Sunday and Thursday at 2:30 PM. Picks the next unprocessed row from the Google Sheet source list, fetches the source article, sends it to Perplexity AI to write a Clinical Glow / Quiet Luxury brand blog post in HTML, posts it as a **draft** to the Wax | Wane Shopify blog, then simultaneously:
- Sends an approval email to support@thehappiesthourcompany.com with edit + preview links
- Posts the caption to Facebook
- Posts the caption to LinkedIn

### Key fixes applied (2026-06-09)
| What was broken | What was fixed |
|---|---|
| Blog ID `91631149368` (did not exist) | Corrected to `119979376952` (Wax \| Wane Blog) |
| API version `2024-01` | Updated to `2025-01` |
| Unsafe string interpolation in JSON body | Replaced with `JSON.stringify()` for safe escaping |
| No email approval step | Added branded HTML email with Shopify admin + preview links |
| Missing "No rows" branch | Added silent stop node for empty sheet runs |
| LinkedIn missing article URL | Added `originalUrl` media field |
| Facebook missing link preview | Added `link` query param |

### To restore from this file
1. Open n8n → New Workflow → `...` menu → Import from file
2. Upload `wax-wane-blog-autopost-FIXED-v2.json`
3. Save → Activate

### Shopify Blog IDs (for reference)
| Blog | ID | Handle |
|---|---|---|
| Wax \| Wane Blog | 119979376952 | wax-wane-blog |
| Crystals Blog | 115710034232 | crystals-science-magic |
| EMF and EMI | 115660620088 | electromagnetic-frequency-radiation |
| HARAMOON K-Beauty | 115858669880 | why-korean-skincare |
| LNK Directory | 119422058808 | lincoln-nebraska-lnk-directory |
