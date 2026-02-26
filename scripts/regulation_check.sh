#!/usr/bin/env bash
set -euo pipefail

ROOT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
cd "$ROOT_DIR"

SERVER_PORT="${REG_CHECK_PORT:-18111}"
SERVER_PID=""
COOKIE_FILE="/tmp/inventory_regcheck_cookie.txt"

cleanup() {
  if [[ -n "$SERVER_PID" ]] && kill -0 "$SERVER_PID" 2>/dev/null; then
    kill "$SERVER_PID" >/dev/null 2>&1 || true
    wait "$SERVER_PID" 2>/dev/null || true
  fi
  rm -f "$COOKIE_FILE"
  php -r 'foreach (["storage/inventory.sqlite","storage/inventory.sqlite-shm","storage/inventory.sqlite-wal"] as $f) { if (is_file($f)) { unlink($f); } }' >/dev/null 2>&1 || true
}
trap cleanup EXIT

echo "[1/7] PHP lint"
find . -name '*.php' -print0 | xargs -0 -n1 php -l >/dev/null

echo "[2/7] Required files"
for file in index.php public/index.php public/dashboard.html public/dashboard.js public/app.css public/api-docs.html .htaccess; do
  [[ -f "$file" ]] || { echo "Missing required file: $file"; exit 1; }
done

echo "[3/7] Fresh DB and bootstrap"
php -r 'require "app/bootstrap.php"; echo "bootstrap-ok";' >/dev/null

echo "[4/7] Start local server (root docroot simulation)"
php -S 127.0.0.1:"$SERVER_PORT" -t . >/tmp/inventory_regulation_server.log 2>&1 &
SERVER_PID="$!"
sleep 1

echo "[5/7] API smoke"
curl -fsS "http://127.0.0.1:${SERVER_PORT}/api/health" | rg -q '"status":"ok"'
curl -fsS "http://127.0.0.1:${SERVER_PORT}/api/docs" | rg -q '"endpoints"'

curl -fsS -c "$COOKIE_FILE" -X POST "http://127.0.0.1:${SERVER_PORT}/api/auth/login" \
  -H 'Content-Type: application/json' \
  -d '{"email":"admin@inventory.local","password":"ChangeMe123!"}' | rg -q '"user"'

curl -fsS -b "$COOKIE_FILE" "http://127.0.0.1:${SERVER_PORT}/api/dashboard/analytics" | rg -q '"stock_by_area"'
curl -fsS -b "$COOKIE_FILE" "http://127.0.0.1:${SERVER_PORT}/api/settings" | rg -q '"site_name"'
curl -fsS -b "$COOKIE_FILE" "http://127.0.0.1:${SERVER_PORT}/api/admin/users" | rg -q '"email"'

curl -fsS -b "$COOKIE_FILE" -X POST "http://127.0.0.1:${SERVER_PORT}/api/items" \
  -H 'Content-Type: application/json' \
  -d '{"sku":"REG-001","name":"Reg Test Item","unit":"pcs","reorder_level":1}' | rg -q '"data"'

curl -fsS -b "$COOKIE_FILE" -X POST "http://127.0.0.1:${SERVER_PORT}/api/inventory/movements" \
  -H 'Content-Type: application/json' \
  -d '{"movement_type":"receive","item_id":1,"to_storage_area_id":1,"quantity":4}' | rg -q '"updated_levels"'

echo "[6/7] Frontend asset paths"
root_html="$(curl -fsS "http://127.0.0.1:${SERVER_PORT}/")"
rg -q 'Inventory Management System' <<<"$root_html"

app_css="$(curl -fsS "http://127.0.0.1:${SERVER_PORT}/app.css")"
rg -q ':root \{' <<<"$app_css"

dashboard_js="$(curl -fsS "http://127.0.0.1:${SERVER_PORT}/dashboard.js")"
rg -q 'const state =' <<<"$dashboard_js"

echo "[7/7] Docs paths"
docs_html="$(curl -fsS "http://127.0.0.1:${SERVER_PORT}/api-docs")"
rg -q 'InventoryManagementSystem API' <<<"$docs_html"

echo "Regulation check passed."
