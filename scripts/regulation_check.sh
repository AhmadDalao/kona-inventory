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

echo "[1/6] PHP lint"
find . -name '*.php' -print0 | xargs -0 -n1 php -l >/dev/null

echo "[2/6] Required files"
for file in index.php public/index.php public/dashboard.html public/dashboard.js public/app.css .htaccess; do
  [[ -f "$file" ]] || { echo "Missing required file: $file"; exit 1; }
done

echo "[3/6] Fresh DB and bootstrap"
php -r 'require "app/bootstrap.php"; echo "bootstrap-ok";' >/dev/null

echo "[4/6] Start local server (root docroot simulation)"
php -S 127.0.0.1:"$SERVER_PORT" -t . >/tmp/inventory_regulation_server.log 2>&1 &
SERVER_PID="$!"
sleep 1

echo "[5/6] API smoke"
curl -fsS "http://127.0.0.1:${SERVER_PORT}/api/health" | rg -q '"status":"ok"'

curl -fsS -c "$COOKIE_FILE" -X POST "http://127.0.0.1:${SERVER_PORT}/api/auth/login" \
  -H 'Content-Type: application/json' \
  -d '{"email":"admin@inventory.local","password":"ChangeMe123!"}' | rg -q '"user"'

curl -fsS -b "$COOKIE_FILE" -X POST "http://127.0.0.1:${SERVER_PORT}/api/items" \
  -H 'Content-Type: application/json' \
  -d '{"sku":"REG-001","name":"Reg Test Item","unit":"pcs","reorder_level":1}' | rg -q '"data"'

curl -fsS -b "$COOKIE_FILE" -X POST "http://127.0.0.1:${SERVER_PORT}/api/inventory/movements" \
  -H 'Content-Type: application/json' \
  -d '{"movement_type":"receive","item_id":1,"to_storage_area_id":1,"quantity":4}' | rg -q '"updated_levels"'

echo "[6/6] Frontend asset paths"
curl -fsS "http://127.0.0.1:${SERVER_PORT}/" | rg -q 'Inventory Management System'
curl -fsS "http://127.0.0.1:${SERVER_PORT}/app.css" | rg -q ':root \{'
curl -fsS "http://127.0.0.1:${SERVER_PORT}/dashboard.js" | rg -q 'const state ='

echo "Regulation check passed."
