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
- `company_name` string
- `site_name` string
- `site_tagline` string
- `site_open` boolean
- `read_only_mode` boolean
- `timezone` string
- `notify_email` boolean
- `notify_inapp` boolean
- `notify_whatsapp` boolean
- `theme_mode` enum: `light|dark|slate`
- `theme_palette` enum: `material-indigo|material-cyan|material-emerald|material-rose`
- `dashboard_style` enum: `kona|classic`
- `brand_primary` hex color `#RRGGBB`
- `icon_primary` hex color `#RRGGBB`
- `icon_muted` hex color `#RRGGBB`
- `icon_accent` hex color `#RRGGBB`
- `default_currency` string
- `dashboard_low_stock_limit` integer 1-200
- `table_page_size` integer 10-100
- `allow_negative_stock` boolean

## Admin Users (Owner)

- `GET /api/admin/users?search=&role=&limit=`
- `POST /api/admin/users`
- `PATCH /api/admin/users/{id}`

User roles:
- `owner`
- `manager`
- `viewer`

## Storage Areas

- `GET /api/storage-areas?include_inactive=1&include_deleted=1`
- `POST /api/storage-areas`
- `PATCH /api/storage-areas/{id}`
- `DELETE /api/storage-areas/{id}`

## Items

- `GET /api/items?include_inactive=1&include_deleted=1`
- `POST /api/items`
- `PATCH /api/items/{id}`
- `DELETE /api/items/{id}`

## Trash

- `GET /api/trash?search=&limit=`
- `POST /api/trash/{entity}/{id}/restore`

Supported restore entities:
- `items`
- `storage_areas`

## Audit Log (Owner)

- `GET /api/audit-logs?search=&entity_type=&action=&date_from=&date_to=&limit=`

Audit record fields include:
- actor name/email/role
- action and entity
- HTTP status code
- metadata (sanitized request params/body)
- timestamp, IP, user-agent

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
