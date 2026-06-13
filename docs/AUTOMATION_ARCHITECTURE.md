# Wax | Wane Automation Architecture

## The "Single Source of Truth" Philosophy
The goal is to minimize manual data entry and redundant setups. Shopify is the central hub.

## Product Launch Pipeline (n8n)
1. **Trigger:** Shopify Product Published (Webhook).
2. **Enrichment:** AI (GPT-4o) generates all missing content (SEO, descriptions, social captions, Amazon bullets) based on the title and images.
3. **Storage:** All generated content is written back to Shopify as Metafields. Shopify becomes the single source of truth.
4. **Distribution:** 
   - Content is pushed to Veeqo, which syncs to Walmart, TikTok, Amazon, and Etsy.
   - A 24-hour delay triggers an AI-generated educational blog post on Shopify.
   - Social media posts (Facebook, etc.) are published linking to the new product/blog.

## Key Principles
- **MANUS Labeling:** All automations built by MANUS should have "MANUS" prepended to their title in n8n.
- **URL Validation:** Automations must check if a URL is valid before posting it to social media.
- **Error Handling:** Document blockers and proceed with available tasks. Don't let one failed step stop the whole pipeline.
- **Local vs. Cloud:** Currently using local n8n via Docker. Future state: migrate to cloud VPS for 24/7 uptime without relying on a local machine.
