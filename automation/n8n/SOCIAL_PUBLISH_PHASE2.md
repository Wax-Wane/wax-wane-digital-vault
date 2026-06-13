# Social publish — Phase 2 (implemented)

Cross-post runs **after Shopify publish**, not on draft.

| Workflow | ID | Schedule |
|----------|-----|----------|
| Social Cross-Post | `Qm8xCr0ssP0st26W` | Every 4 hours |
| Sister Post | `Qm8xS1sterP0st26W` | Mon/Wed 10 AM |

Gate: RSS new article + Shopify tag `source-blog` (set by With Source draft workflow).

Platforms: Facebook, Instagram, Pinterest. LinkedIn pending vault tokens.

Patch: `wax-wane-config-vault/scripts/patch-n8n-social-workflows.py`
