# Wax | Wane — n8n Workflow Registry

Live: http://localhost:5678 | Exports: `automation/n8n/`

## Content pipeline

| Workflow | ID | Export file |
|----------|-----|-------------|
| [MANUS Blog v2](http://localhost:5678/workflow/dwA0nkpLsnpSN30p) | `dwA0nkpLsnpSN30p` | `MANUS-blog-autopost-v2.json` |
| [With Source Blog](http://localhost:5678/workflow/Kn3shyLBtFxmKZMH) | `Kn3shyLBtFxmKZMH` | `with-source-blog-perplexity.json` |
| [Social Cross-Post](http://localhost:5678/workflow/Qm8xCr0ssP0st26W) | `Qm8xCr0ssP0st26W` | `social-cross-post-rss.json` |
| [Sister Post](http://localhost:5678/workflow/Qm8xS1sterP0st26W) | `Qm8xS1sterP0st26W` | `sister-post-mon-wed.json` |
| [HARAMOON IG Poster](http://localhost:5678/workflow/WxWnHaramoonIG01) | `WxWnHaramoonIG01` | `haramoon_ig_poster.json` |

## Catalog pipeline

| Workflow | ID | Trigger |
|----------|-----|---------|
| [Bulk Listing Generator](http://localhost:5678/workflow/VTnHjhKe4FM13oZR) | `VTnHjhKe4FM13oZR` | `POST /webhook/wax-wane/bulk-listings` + Tue 8 AM Shopify export |
| [Shopify → Walmart Sync](http://localhost:5678/workflow/gvpg8iO0xTJ4k75e) | `gvpg8iO0xTJ4k75e` | Mon 6 AM |

## Product pipeline

| Workflow | ID | Notes |
|----------|-----|-------|
| Product Publish | `WxWnProductPipe01` | Needs ngrok/Cloudflare for Shopify webhook |

## n8n UI folder map (target)

```
Wax | Wane/
├── Catalog/     → Bulk Listing, Walmart Sync
├── Content/     → Blog x2, Social, Sister, HARAMOON IG
├── Product/     → Product Publish
└── Archive/     → superseded duplicates (archived in SQLite)
```

## Git discipline

After MCP or patch-script edits:

```bash
python3 wax-wane-config-vault/scripts/export-n8n-workflows.py
# commit: n8n: <workflow> — <change>
```

See also: `BLOG_SHEET_SCHEMA.md`, `MATRIXIFY_SHEETS.md`, `SOCIAL_PUBLISH_PHASE2.md`
