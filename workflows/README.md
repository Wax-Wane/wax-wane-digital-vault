# Wax | Wane — Bulk Listing Generator (n8n)

Generates Amazon and Walmart bulk-template CSVs from a single product feed, in
the **Clinical Glow / Quiet Luxury** voice, with character ceilings enforced
and the brand-suffix rule baked in.

> The workflow is fully self-contained — no external API credentials are
> required to run it. Copy is generated deterministically from product
> attributes and a curated phrase bank, so output is reproducible.

## Files

| File | Purpose |
| --- | --- |
| `wax-wane-bulk-listing-generator.workflow.json` | Importable n8n workflow |
| `src/normalize-input.js` | Code-node source: input parsing & normalization |
| `src/generate-copy.js`   | Code-node source: voice + character-limit enforcement |
| `src/build-csvs.js`      | Code-node source: Amazon + Walmart CSV assembly |
| `build-workflow.js`      | Re-builds the workflow JSON from the source files |
| `../examples/sample-input.json` | Example payload used for the manual trigger |

## What the workflow does

```
 Manual Trigger ──▶ Sample Input (Manual) ┐
                                           ├──▶ Normalize Input ──▶ Generate Wax|Wane Copy ──▶ Build Amazon + Walmart CSVs ──▶ Respond to Webhook
 Webhook Trigger ─────────────────────────┘
```

1. **Accepts** input as one of:
   - `{ "items": [ { sku, productName, brand, brandLine, category, ... } ] }`
   - A single product object (auto-wrapped)
   - A raw CSV string in `csv` (header row required)
2. **Normalizes** every product into a canonical schema with safe defaults.
3. **Generates copy** that obeys the explicit voice rules (see below).
4. **Builds two CSVs** matching the standard Amazon flat-file headers and the
   Walmart Marketplace item-spec headers, plus base64 binary attachments
   (`amazon_listings_csv`, `walmart_listings_csv`).
5. **Responds** to the webhook with the JSON summary + both CSVs.

## Voice & rule enforcement

The rules are encoded in `src/generate-copy.js` so they are auditable in code:

- **Tone:** Clinical Glow / Quiet Luxury — restrained, measured, sensorial-but-quiet.
- **Banned content:** exclamation marks, emojis, hype words (`amazing`, `best ever`,
  `must-have`, `revolutionary`, `flawless`, `% off`, etc.). Stripped on the way in.
- **Title shape:** `Product Name — Descriptor — Color — Size`, em-dash separated,
  title-cased.
- **Brand suffix `| Wax | Wane`** is appended **only** to titles whose
  `brandLine`, `brand`, or `category` matches `HARAMOON` (case-insensitive).
  Generic Wax | Wane lines (Atelier, candles, etc.) ship without the suffix.
- **Character ceilings (hard caps):**
  - Amazon `item_name`: 200
  - Amazon `bullet_point*`: 500 (target ~250)
  - Amazon `product_description`: 2000
  - Walmart `Product Name`: 199
  - Walmart `Short Description`: 1000
  - Walmart `Long Description`: 4000
  - Walmart `Key Features *`: 500

If you have additional banned/required terms from the Master Architectural
Blueprint, add them to the `HYPE` array (banned) or the phrase bank in
`defaultFeatures` (required). Re-run `node workflows/build-workflow.js` to
regenerate the workflow JSON.

## Importing into n8n

### Option A — UI import (simplest)

1. n8n → **Workflows** → **Import from File**
2. Select `workflows/wax-wane-bulk-listing-generator.workflow.json`
3. Save → click **Execute Workflow** to run the manual path with sample data.
4. Activate the workflow to expose the webhook at
   `POST /webhook/wax-wane/bulk-listings`.

### Option B — REST API push (your local n8n)

Cursor cloud agents cannot reach `localhost:5678` on your machine, so this
step needs to be run from your laptop. With your existing n8n MCP/API token,
the equivalent of "install the workflow" is one POST:

```bash
N8N_URL="http://localhost:5678"
N8N_TOKEN="<your bearer token>"

curl -sS -X POST "$N8N_URL/api/v1/workflows" \
  -H "Authorization: Bearer $N8N_TOKEN" \
  -H "Content-Type: application/json" \
  --data-binary @workflows/wax-wane-bulk-listing-generator.workflow.json
```

### Option C — n8n MCP tool from the IDE on your machine

Once the n8n MCP server is registered in **your** Cursor desktop config (the
JSON you pasted, dropped into `~/.cursor/mcp.json` or **Settings → MCP**),
you can ask Cursor on your laptop to import this file with the n8n MCP tool
(`workflow.create` / `workflow.import`). I can't do that step from a remote
cloud agent — the MCP client must be running on the host that can reach
`localhost:5678`.

## Calling the workflow

### Webhook

```bash
curl -sS -X POST "http://localhost:5678/webhook/wax-wane/bulk-listings" \
  -H "Content-Type: application/json" \
  --data-binary @examples/sample-input.json
```

Response is the JSON summary plus `amazon.csv` and `walmart.csv` strings, plus
the binary CSV attachments on the item.

### CSV-text input

```json
{ "csv": "sku,productName,brand,brandLine,category,size,price\nHM-CRM-001,Lunar Bloom Renewal Cream,HARAMOON,HARAMOON,Beauty,50 ml,68" }
```

## Re-running the local test harness

```bash
node /tmp/test-pipeline.js   # asserts brand-suffix rule, char limits, no-hype rule
```

(You can lift `/tmp/test-pipeline.js` into the repo if you want it under
version control — it's a thin runner around the three Code-node source files.)
