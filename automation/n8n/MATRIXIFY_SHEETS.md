# Matrixify + Google Sheets — catalog source of truth

Human editing layer for Shopify catalog. n8n handles **generation and sync**; Sheets handles **human review**.

## Setup

1. Install [Matrixify](https://apps.shopify.com/excel-export-import) on `6f97d0.myshopify.com`
2. Connect Google account (same as `secrets/google/token.json` project)
3. Import products → Google Sheet template from:
   `Wax-Wane-shopify-website-metaobjects-knowledge-framework-.../shopify-catalog-workflow/`

## Workflow integration

| Direction | Tool |
|-----------|------|
| Shopify → Sheet (human edit) | Matrixify scheduled export |
| Sheet → Bulk Listing CSVs | n8n Bulk Listing webhook `POST /webhook/wax-wane/bulk-listings` |
| Shopify product updates | n8n Weekly Shopify Export (Tue 8 AM) → listing pipeline |
| Walmart live sync | n8n Shopify To Walmart Sync (Mon 6 AM) |

## brand_registry filter

Bulk Listing and Walmart sync exclude `LNK.Nebraska` vendor per `data/brands/brand_registry.json`.

## Sheet IDs (vault)

- Social log: `GOOGLE_SHEETS_ID` in `waxwane_credentials.env`
- Blog MANUS sheet: see `automation/n8n/BLOG_SHEET_SCHEMA.md`
- With Source sheet: see `automation/n8n/BLOG_SHEET_SCHEMA.md`

## Activation checklist

- [ ] Matrixify app installed on Wax store
- [ ] Export schedule: daily or on-demand before listing runs
- [ ] Confirm Sheet columns match Bulk Listing `Normalize Input` headers (`sku`, `productName`, `brand`, …)
- [ ] Test webhook with one HARAMOON SKU row
