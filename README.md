# Inventory Management System

Internal-first inventory system for your company.

## What You Get

- Quantity tracking per item and per storage area.
- Multiple storage areas with full CRUD.
- Item catalog with SKU, category, unit, reorder level, notes, active/inactive status.
- Stock control actions:
  - `receive`
  - `issue`
  - `transfer`
  - `adjust` (+/-)
  - `set` absolute quantity
- Movement history with actor, reference, and note.
- Dashboard summaries + low-stock alerts.
- Session login (seeded admin user).

## Stack

- PHP 8.1+
- SQLite
- No external dependencies

## Quick Start

1. Copy env file:

```bash
cp .env.example .env
```

2. Start server:

```bash
php -S 127.0.0.1:8000 -t public
```

3. Open dashboard:

- [http://127.0.0.1:8000](http://127.0.0.1:8000)

4. Default login (change in `.env`):

- Email: `admin@inventory.local`
- Password: `ChangeMe123!`

## Key API Endpoints

- `GET /api/health`
- `POST /api/auth/login`
- `POST /api/auth/logout`
- `GET /api/auth/me`
- `GET /api/dashboard/summary`
- `GET|POST /api/storage-areas`
- `PATCH|DELETE /api/storage-areas/{id}`
- `GET|POST /api/items`
- `PATCH|DELETE /api/items/{id}`
- `GET /api/inventory/levels`
- `GET|POST /api/inventory/movements`

## Notes

- Database is auto-created at `storage/inventory.sqlite` on first run.
- Default storage areas are auto-seeded on first run.
- Item deletion is blocked if movement history exists; mark items inactive instead.
