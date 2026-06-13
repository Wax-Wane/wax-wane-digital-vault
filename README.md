
---

## Context Added by MANUS (June 2026)

The following files were added to make this repo Cursor-ingestible and serve as the single source of truth for all Wax | Wane automations:

| File | Purpose |
|---|---|
| `.cursorrules` | Tells Cursor exactly how to behave: tone, architecture, secret names, Shopify IDs |
| `docs/TONE_OF_VOICE.md` | Full brand voice guide: crystal grading, Amazon bullets, social captions |
| `docs/AUTOMATION_ARCHITECTURE.md` | System design: product pipeline, n8n principles, Veeqo channel IDs |
| `docs/N8N_SETUP_GUIDE.md` | Step-by-step setup for the product launch automation workflow |
| `n8n-workflows/MANUS_wax_wane_product_automation.json` | Full product launch pipeline: Shopify trigger → AI enrichment → metafields → Veeqo → blog → social |
