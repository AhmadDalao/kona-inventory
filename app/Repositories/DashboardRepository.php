<?php

declare(strict_types=1);

namespace App\Repositories;

use App\Db;

class DashboardRepository
{
    public function summary(int $lowStockLimit = 25): array
    {
        $totalItems = (int)Db::conn()->query('SELECT COUNT(*) FROM items WHERE is_active = 1')->fetchColumn();
        $totalStorageAreas = (int)Db::conn()->query('SELECT COUNT(*) FROM storage_areas WHERE is_active = 1')->fetchColumn();
        $totalQuantity = (float)Db::conn()->query('SELECT COALESCE(SUM(quantity), 0) FROM inventory_levels')->fetchColumn();
        $movementsToday = (int)Db::conn()->query("SELECT COUNT(*) FROM stock_movements WHERE date(created_at) = date('now')")->fetchColumn();

        $inboundToday = (float)Db::conn()->query(
            "SELECT COALESCE(SUM(CASE WHEN quantity > 0 THEN quantity ELSE 0 END), 0)
             FROM stock_movements
             WHERE date(created_at) = date('now')"
        )->fetchColumn();

        $outboundToday = (float)Db::conn()->query(
            "SELECT COALESCE(SUM(CASE WHEN quantity < 0 THEN ABS(quantity) ELSE 0 END), 0)
             FROM stock_movements
             WHERE date(created_at) = date('now')"
        )->fetchColumn();

        $lowStockCount = (int)Db::conn()->query(
            'SELECT COUNT(*)
             FROM (
                SELECT i.id, i.reorder_level, COALESCE(SUM(il.quantity), 0) AS total_qty
                FROM items i
                LEFT JOIN inventory_levels il ON il.item_id = i.id
                WHERE i.is_active = 1
                GROUP BY i.id
             ) t
             WHERE t.reorder_level > 0 AND t.total_qty <= t.reorder_level'
        )->fetchColumn();

        return [
            'total_items' => $totalItems,
            'total_storage_areas' => $totalStorageAreas,
            'total_quantity' => round($totalQuantity, 3),
            'low_stock_items' => $lowStockCount,
            'movements_today' => $movementsToday,
            'inbound_today' => round($inboundToday, 3),
            'outbound_today' => round($outboundToday, 3),
            'low_stock_limit' => $lowStockLimit,
        ];
    }

    public function lowStock(int $limit = 25): array
    {
        $safeLimit = max(1, min($limit, 200));

        $stmt = Db::conn()->prepare(
            'SELECT
                i.id,
                i.sku,
                i.name,
                i.unit,
                i.reorder_level,
                COALESCE(SUM(il.quantity), 0) AS total_quantity
             FROM items i
             LEFT JOIN inventory_levels il ON il.item_id = i.id
             WHERE i.is_active = 1
             GROUP BY i.id
             HAVING i.reorder_level > 0 AND total_quantity <= i.reorder_level
             ORDER BY (i.reorder_level - total_quantity) DESC, i.name ASC
             LIMIT :limit'
        );

        $stmt->bindValue(':limit', $safeLimit, \PDO::PARAM_INT);
        $stmt->execute();

        return $stmt->fetchAll() ?: [];
    }

    public function stockByArea(): array
    {
        $stmt = Db::conn()->query(
            'SELECT
                sa.id,
                sa.code,
                sa.name,
                COALESCE(SUM(il.quantity), 0) AS total_quantity,
                COUNT(CASE WHEN COALESCE(il.quantity, 0) > 0 THEN 1 END) AS active_slots
             FROM storage_areas sa
             LEFT JOIN inventory_levels il ON il.storage_area_id = sa.id
             WHERE sa.is_active = 1
             GROUP BY sa.id
             ORDER BY total_quantity DESC, sa.name ASC'
        );

        return $stmt->fetchAll() ?: [];
    }

    public function categoryMix(): array
    {
        $stmt = Db::conn()->query(
            'SELECT
                COALESCE(NULLIF(i.category, ""), "Uncategorized") AS category,
                COUNT(i.id) AS item_count,
                COALESCE(SUM(t.total_qty), 0) AS total_quantity
             FROM items i
             LEFT JOIN (
                SELECT item_id, SUM(quantity) AS total_qty
                FROM inventory_levels
                GROUP BY item_id
             ) t ON t.item_id = i.id
             WHERE i.is_active = 1
             GROUP BY category
             ORDER BY total_quantity DESC, item_count DESC, category ASC'
        );

        return $stmt->fetchAll() ?: [];
    }

    public function movementTrend(int $days = 14): array
    {
        $safeDays = max(7, min($days, 90));

        $stmt = Db::conn()->prepare(
            "SELECT
                date(created_at) AS day,
                COUNT(*) AS movement_count,
                COALESCE(SUM(CASE WHEN quantity > 0 THEN quantity ELSE 0 END), 0) AS inbound_quantity,
                COALESCE(SUM(CASE WHEN quantity < 0 THEN ABS(quantity) ELSE 0 END), 0) AS outbound_quantity
             FROM stock_movements
             WHERE date(created_at) >= date('now', :window)
             GROUP BY day
             ORDER BY day ASC"
        );

        $stmt->bindValue(':window', '-' . ($safeDays - 1) . ' day');
        $stmt->execute();

        $rows = $stmt->fetchAll() ?: [];
        $indexed = [];
        foreach ($rows as $row) {
            $indexed[(string)$row['day']] = $row;
        }

        $series = [];
        for ($i = $safeDays - 1; $i >= 0; $i--) {
            $day = gmdate('Y-m-d', strtotime('-' . $i . ' day'));
            $current = $indexed[$day] ?? [
                'day' => $day,
                'movement_count' => 0,
                'inbound_quantity' => 0,
                'outbound_quantity' => 0,
            ];
            $series[] = [
                'day' => $day,
                'movement_count' => (int)$current['movement_count'],
                'inbound_quantity' => round((float)$current['inbound_quantity'], 3),
                'outbound_quantity' => round((float)$current['outbound_quantity'], 3),
            ];
        }

        return $series;
    }

    public function topMovedItems(int $limit = 10): array
    {
        $safeLimit = max(3, min($limit, 50));

        $stmt = Db::conn()->prepare(
            'SELECT
                i.id,
                i.sku,
                i.name,
                COUNT(sm.id) AS movement_count,
                COALESCE(SUM(ABS(sm.quantity)), 0) AS total_moved
             FROM stock_movements sm
             INNER JOIN items i ON i.id = sm.item_id
             GROUP BY i.id
             ORDER BY total_moved DESC, movement_count DESC, i.name ASC
             LIMIT :limit'
        );

        $stmt->bindValue(':limit', $safeLimit, \PDO::PARAM_INT);
        $stmt->execute();

        return $stmt->fetchAll() ?: [];
    }
}
