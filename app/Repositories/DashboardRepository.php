<?php

declare(strict_types=1);

namespace App\Repositories;

use App\Db;

class DashboardRepository
{
    public function summary(): array
    {
        $totalItems = (int)Db::conn()->query('SELECT COUNT(*) FROM items WHERE is_active = 1')->fetchColumn();
        $totalStorageAreas = (int)Db::conn()->query('SELECT COUNT(*) FROM storage_areas WHERE is_active = 1')->fetchColumn();
        $totalQuantity = (float)Db::conn()->query('SELECT COALESCE(SUM(quantity), 0) FROM inventory_levels')->fetchColumn();
        $movementsToday = (int)Db::conn()->query("SELECT COUNT(*) FROM stock_movements WHERE date(created_at) = date('now')")->fetchColumn();

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
}
