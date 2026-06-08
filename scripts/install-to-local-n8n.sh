#!/usr/bin/env bash
# Push and activate the Wax | Wane bulk listing generator into a LOCAL n8n instance.
#
# Run this on your Mac (where n8n listens on localhost:5678), NOT from a cloud agent.
#
# Usage:
#   ./scripts/install-to-local-n8n.sh
#   N8N_URL=http://localhost:5678 N8N_API_KEY=... ./scripts/install-to-local-n8n.sh
#   CREDENTIALS_FILE="/Users/samanthanorman/My Drive (social.normans@gmail.com)/waxwane_credentials.env" ./scripts/install-to-local-n8n.sh

set -euo pipefail

ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
WORKFLOW_JSON="${ROOT}/workflows/wax-wane-bulk-listing-generator.workflow.json"
WORKFLOW_NAME="Wax | Wane — Bulk Listing Generator (Amazon + Walmart)"

# Default Mac paths from your workspace layout
DEFAULT_CREDS="/Users/samanthanorman/My Drive (social.normans@gmail.com)/waxwane_credentials.env"
CREDENTIALS_FILE="${CREDENTIALS_FILE:-${DEFAULT_CREDS}}"

N8N_URL="${N8N_URL:-http://localhost:5678}"

load_credentials() {
  if [[ -n "${N8N_API_KEY:-}" ]]; then
    return 0
  fi
  if [[ -f "${CREDENTIALS_FILE}" ]]; then
    # shellcheck disable=SC1090
    set -a
    source "${CREDENTIALS_FILE}"
    set +a
  fi
  # Accept common alternate env var names
  N8N_API_KEY="${N8N_API_KEY:-${N8N_MCP_TOKEN:-${N8N_BEARER_TOKEN:-}}}"
  N8N_URL="${N8N_URL:-${N8N_BASE_URL:-http://localhost:5678}}"
}

require_tools() {
  command -v curl >/dev/null 2>&1 || { echo "curl is required"; exit 1; }
  command -v python3 >/dev/null 2>&1 || { echo "python3 is required"; exit 1; }
}

check_n8n() {
  local code
  code="$(curl -sS -o /dev/null -w '%{http_code}' -m 5 "${N8N_URL}/healthz" 2>/dev/null || echo "000")"
  if [[ "${code}" == "000" ]]; then
    echo "ERROR: Cannot reach n8n at ${N8N_URL}"
    echo "Start n8n locally, then re-run this script."
    exit 1
  fi
}

prepare_payload() {
  python3 - "${WORKFLOW_JSON}" <<'PY'
import json, sys
path = sys.argv[1]
with open(path) as f:
    wf = json.load(f)
# n8n REST API accepts these fields on create/update
payload = {
    "name": wf.get("name"),
    "nodes": wf.get("nodes", []),
    "connections": wf.get("connections", {}),
    "settings": wf.get("settings", {}),
    "staticData": wf.get("staticData"),
}
print(json.dumps(payload))
PY
}

find_existing_id() {
  curl -sS -G "${N8N_URL}/api/v1/workflows" \
    -H "Accept: application/json" \
    -H "Authorization: Bearer ${N8N_API_KEY}" \
    --data-urlencode "limit=250" \
  | python3 -c "
import json, sys
name = '''${WORKFLOW_NAME}'''
data = json.load(sys.stdin)
for wf in data.get('data', data if isinstance(data, list) else []):
    if wf.get('name') == name:
        print(wf['id'])
        break
"
}

install_workflow() {
  local payload existing_id response new_id
  payload="$(prepare_payload)"

  existing_id="$(find_existing_id || true)"

  if [[ -n "${existing_id}" ]]; then
    echo "Updating existing workflow id=${existing_id} ..."
    response="$(curl -sS -X PUT "${N8N_URL}/api/v1/workflows/${existing_id}" \
      -H "Authorization: Bearer ${N8N_API_KEY}" \
      -H "Content-Type: application/json" \
      --data-binary "${payload}")"
    new_id="${existing_id}"
  else
    echo "Creating new workflow ..."
    response="$(curl -sS -X POST "${N8N_URL}/api/v1/workflows" \
      -H "Authorization: Bearer ${N8N_API_KEY}" \
      -H "Content-Type: application/json" \
      --data-binary "${payload}")"
    new_id="$(python3 -c "import json,sys; print(json.load(sys.stdin).get('id',''))" <<<"${response}")"
  fi

  if [[ -z "${new_id}" ]]; then
    echo "ERROR: n8n did not return a workflow id."
    echo "${response}"
    exit 1
  fi

  echo "Activating workflow id=${new_id} ..."
  curl -sS -X POST "${N8N_URL}/api/v1/workflows/${new_id}/activate" \
    -H "Authorization: Bearer ${N8N_API_KEY}" \
    -H "Content-Type: application/json" >/dev/null

  echo ""
  echo "Installed and activated."
  echo "  Workflow ID : ${new_id}"
  echo "  Editor URL  : ${N8N_URL}/workflow/${new_id}"
  echo "  Webhook URL : ${N8N_URL}/webhook/wax-wane/bulk-listings"
  echo ""
  echo "Test:"
  echo "  curl -sS -X POST '${N8N_URL}/webhook/wax-wane/bulk-listings' \\"
  echo "    -H 'Content-Type: application/json' \\"
  echo "    --data-binary @${ROOT}/examples/sample-input.json"
}

main() {
  require_tools
  load_credentials

  if [[ -z "${N8N_API_KEY:-}" ]]; then
    echo "ERROR: N8N_API_KEY not set."
    echo "Set it in ${CREDENTIALS_FILE} or export N8N_API_KEY before running."
    exit 1
  fi

  if [[ ! -f "${WORKFLOW_JSON}" ]]; then
    echo "ERROR: Missing ${WORKFLOW_JSON}"
    exit 1
  fi

  check_n8n
  install_workflow
}

main "$@"
