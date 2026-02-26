# Inventory Management System

Modern internal inventory platform with module-based dashboard, analytics, and admin controls.

## What Is Included

- Sidebar-based dashboard with modules:
  - Overview
  - Inventory
  - Movements
  - Catalog
  - Analytics
  - Admin
  - Trash
  - Audit Log
  - Settings
  - API Docs
- Multi-storage area inventory tracking.
- Item catalog with SKU/category/unit/reorder level.
- Stock actions: `receive`, `issue`, `transfer`, `adjust`, `set`.
- Movement ledger with search/type/date filters.
- KPI + trend analytics (stock by area, category mix, top moved items, movement trend).
- Role-based access:
  - `owner`
  - `manager`
  - `viewer`
- Admin controls:
  - User management (owner)
  - Trash restore for deleted items/storage areas
  - Owner audit log for all write actions
  - Site settings
  - Read-only mode
  - Negative stock policy toggle
- API docs:
  - JSON: `/api/docs`
  - HTML: `/api-docs`

## Stack

- PHP 8.1+
- SQLite
- No framework dependencies

## Quick Start

1. Create env file:

```bash
cp .env.example .env
```

2. Start local server:

```bash
php -S 127.0.0.1:8000 -t .
```

3. Open dashboard:

- [http://127.0.0.1:8000](http://127.0.0.1:8000)

4. Login using `.env` admin credentials.

## Local Quality Check

```bash
./scripts/regulation_check.sh
```

## Seed Dummy Data

Generate 60 demo items plus random levels/movements:

```bash
php scripts/seed_dummy_data.php --count=60
```

If dummy SKUs already exist, append more with:

```bash
php scripts/seed_dummy_data.php --count=20 --append
```

## Documentation

- [Docs Index](./docs/README.md)
- [API Reference](./docs/api.md)
- [Deployment Notes](./docs/deployment.md)
