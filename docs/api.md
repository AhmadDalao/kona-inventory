# API Reference

Base path: `/api`

Authentication model:
1. `POST /api/auth/login`
2. Reuse session cookie for protected routes.

## Core

- `GET /api/health`
- `GET /api/docs`
- `POST /api/auth/login`
- `POST /api/auth/logout`
- `GET /api/auth/me`
- `GET /api/meta/options`

## Dashboard

- `GET /api/dashboard/summary`
- `GET /api/dashboard/analytics?days=14`

## Settings

- `GET /api/settings`
- `PATCH /api/settings`

Patch body keys:
- `site_name` string
- `site_tagline` string
- `site_open` boolean
- `read_only_mode` boolean
- `default_currency` string
- `dashboard_low_stock_limit` integer 1-200
- `table_page_size` integer 10-100
- `allow_negative_stock` boolean

## Admin Users (Owner)

- `GET /api/admin/users`
- `POST /api/admin/users`
- `PATCH /api/admin/users/{id}`

User roles:
- `owner`
- `manager`
- `viewer`

## Storage Areas

- `GET /api/storage-areas`
- `POST /api/storage-areas`
- `PATCH /api/storage-areas/{id}`
- `DELETE /api/storage-areas/{id}`

## Items

- `GET /api/items`
- `POST /api/items`
- `PATCH /api/items/{id}`
- `DELETE /api/items/{id}`

## Inventory

- `GET /api/inventory/levels?search=&storage_area_id=`
- `GET /api/inventory/movements?limit=&movement_type=&item_id=&search=&date_from=&date_to=`
- `POST /api/inventory/movements`

Movement payload:
- `movement_type`: `receive|issue|transfer|adjust|set`
- `item_id`: integer
- `quantity`: number (or `target_quantity` for set)
- `from_storage_area_id`: integer (issue/transfer)
- `to_storage_area_id`: integer (receive/transfer)
- `storage_area_id`: integer (adjust/set)
- `reference`: string
- `note`: string
