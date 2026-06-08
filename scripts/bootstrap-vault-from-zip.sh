#!/usr/bin/env bash
# Extract wax-wane-digital-vault into the repo root so Cursor can read the
# Master Architectural Blueprint and brand strategy assets.
#
# Run on your Mac:
#   ./scripts/bootstrap-vault-from-zip.sh

set -euo pipefail

ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
ZIP_DEFAULT="/Users/samanthanorman/My Drive (social.normans@gmail.com)/wax-wane-digital-vault-main.zip"
ZIP="${VAULT_ZIP:-${ZIP_DEFAULT}}"
DEST="${ROOT}/wax-wane-digital-vault"

if [[ ! -f "${ZIP}" ]]; then
  echo "ERROR: Zip not found at:"
  echo "  ${ZIP}"
  echo ""
  echo "Set VAULT_ZIP to the correct path, or unzip manually into:"
  echo "  ${DEST}"
  exit 1
fi

mkdir -p "${DEST}"
unzip -o "${ZIP}" -d "${ROOT}/.vault-extract"
# GitHub zips usually contain a single top-level folder
TOP="$(find "${ROOT}/.vault-extract" -mindepth 1 -maxdepth 1 -type d | head -1)"
if [[ -z "${TOP}" ]]; then
  echo "ERROR: Unexpected zip layout."
  exit 1
fi
rsync -a --delete "${TOP}/" "${DEST}/"
rm -rf "${ROOT}/.vault-extract"

echo "Vault extracted to ${DEST}"
echo ""
echo "Look for blueprint / brand docs:"
find "${DEST}" -maxdepth 3 \( -iname '*blueprint*' -o -iname '*brand*' -o -iname '*strategy*' -o -iname '*voice*' \) 2>/dev/null | head -20
