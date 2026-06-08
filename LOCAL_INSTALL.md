# Local install — Wax | Wane bulk listing generator

This repo ships the n8n workflow JSON. **Installing it into your local n8n must happen on your Mac**, where `http://localhost:5678` is reachable. A Cursor **cloud** agent cannot reach your laptop's localhost or your Google Drive paths.

## 1. Unzip the vault (so Cursor can read the blueprint)

Your blueprint lives in Google Drive, not in git yet:

```bash
./scripts/bootstrap-vault-from-zip.sh
```

Or manually unzip `wax-wane-digital-vault-main.zip` into `./wax-wane-digital-vault/`.

After extraction, ask Cursor Desktop to re-read `wax-wane-digital-vault/` and update `workflows/src/generate-copy.js` if the blueprint adds banned/required terms.

## 2. Register n8n MCP in Cursor Desktop (your machine)

Copy `.cursor/mcp.json.example` → `~/.cursor/mcp.json` (or **Settings → MCP**) and paste your bearer token from n8n's MCP server settings.

Restart Cursor Desktop. You should see `n8n-mcp` tools in the MCP panel.

## 3. Push + activate the workflow

### Option A — one shell command (recommended)

```bash
chmod +x scripts/install-to-local-n8n.sh
./scripts/install-to-local-n8n.sh
```

The script reads `N8N_API_KEY` from:

`/Users/samanthanorman/My Drive (social.normans@gmail.com)/waxwane_credentials.env`

(or set `N8N_API_KEY` / `CREDENTIALS_FILE` yourself).

It will create or update the workflow by name, then **activate** it.

### Option B — ask Cursor Desktop (with n8n MCP connected)

Paste this into a **local** Cursor chat (not cloud agent):

> Import and activate `workflows/wax-wane-bulk-listing-generator.workflow.json` into my local n8n via the n8n MCP tool.

### Option C — n8n UI

**Workflows → Import from File** → select `workflows/wax-wane-bulk-listing-generator.workflow.json` → **Activate**.

## 4. Test the webhook

```bash
curl -sS -X POST 'http://localhost:5678/webhook/wax-wane/bulk-listings' \
  -H 'Content-Type: application/json' \
  --data-binary @examples/sample-input.json
```

## Your asset folders (reference paths)

These are on your Mac — wire them into future workflow nodes (Google Drive read, image URL builder, etc.):

| Path | Purpose |
| --- | --- |
| `/Users/samanthanorman/admin` | Admin |
| `.../_00_HM_listings_images` | HARAMOON listing images |
| `.../_01_WW_Listings_Images` | Wax \| Wane listing images |
| `.../_03_website-marketing` | Website / marketing assets |
| `.../AUTOMATIONS` | Automation assets |
| `.../waxwane_credentials.env` | API keys |

## Voice rules (already encoded)

See `workflows/src/generate-copy.js`:

- **Clinical Glow / Quiet Luxury** tone
- Hard character caps (Amazon + Walmart)
- `| Wax | Wane` suffix **only** on HARAMOON skincare titles
