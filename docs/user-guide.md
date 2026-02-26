# Admin User Guide

This guide is for day-to-day admins, not developers.

## 1) Quick Start

1. Sign in with your company account.
2. Check **Overview** for stock alerts and movement activity.
3. Open **Items** to add or edit SKUs.
4. Open **Storage Areas** to manage where stock lives.
5. Use **Movements** to receive, issue, transfer, adjust, or set quantities.

## 2) What Each Page Does

- **Overview**: Snapshot of risk and movement (low stock, trend, top moved).
- **Inventory**: Live stock by item, with optional area drill-down.
- **Movements**: Apply stock changes and track full history.
- **Storage Areas**: Warehouse zones, staging areas, retail floor, etc.
- **Items**: SKU catalog, units, reorder levels, notes, image.
- **Analytics**: Utilization and movement analysis.
- **Admins**: User accounts and permissions (owner role).
- **Trash**: Restore deleted items/areas or permanently remove (owner only).
- **Audit Log**: Who changed what and when (owner-level traceability).
- **Settings**: Site controls, labels, theme, units, timezone, currency.

## 3) Core Workflows

### A) Add a New Item

1. Go to **Items**.
2. Click **Add Item**.
3. Enter SKU, name, category, unit, reorder level.
4. Save.

### B) Receive Stock

1. Go to **Movements**.
2. Type: **Receive**.
3. Choose item + destination area.
4. Enter quantity and optional reference (PO/invoice).
5. Click **Apply Movement**.

### C) Transfer Stock

1. Type: **Transfer**.
2. Select from area and to area.
3. Enter quantity and reason.
4. Apply.

### D) Correct Quantity

- Use **Adjust (+/-)** for delta changes.
- Use **Set Absolute** for a counted final quantity.

## 4) Deletion, Trash, and Restore

- Delete does **not** hard-delete right away.
- Deleted records go to **Trash**.
- Admin/manager can restore.
- Only owner can permanently delete from trash.

## 5) Roles (Simple Version)

- **Owner**: full control including settings, admins, audit, permanent delete.
- **Manager**: operational write access (items, areas, movements).
- **Viewer**: read-only.

## 6) Status and Quantities

- **In stock**: quantity above reorder threshold.
- **Low stock**: quantity at or below reorder threshold.
- **Out**: zero quantity.
- **On-ground**: quantity physically in active use (not in shelf storage).

## 7) Good Habits That Prevent Errors

1. Always attach a reference (`PO-`, ticket, invoice) for movements.
2. Use clear movement notes when correcting data.
3. Prefer **Transfer** over issue+receive for internal moves.
4. Check **Audit Log** before blaming the system.
5. Keep units consistent (`pcs`, `box`, `kg`, etc.).

## 8) Common Problems

- **Can’t edit/save**: site may be in read-only mode.
- **Record disappeared**: check **Trash**.
- **Wrong numbers**: check latest movements and area filters.
- **403 errors**: account lacks permission for that endpoint/page.

## 9) Weekly Admin Checklist

1. Resolve low stock items.
2. Review movement anomalies.
3. Restore/clean trash entries as needed.
4. Verify settings (timezone, currency, units).
5. Review audit log for unexpected edits.

