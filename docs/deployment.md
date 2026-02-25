# Deployment Notes (Hostinger)

## Structure

Deploy the project root as the domain document root.

Required files/folders:
- `index.php`
- `.htaccess`
- `app/`
- `public/`
- `storage/`
- `database/`
- `.env`

## Environment

Create `.env`:

```env
APP_ENV=production
APP_TIMEZONE=America/New_York
DB_DRIVER=sqlite
DB_DATABASE=storage/inventory.sqlite
APP_SESSION_NAME=inventory_internal
APP_ADMIN_NAME=Inventory Admin
APP_ADMIN_EMAIL=admin@example.com
APP_ADMIN_PASSWORD=change-this
```

## Smoke tests

- `GET /api/health`
- login via `POST /api/auth/login`
- load dashboard `/`
- verify static assets `/app.css` and `/dashboard.js`
